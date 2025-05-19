import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiService } from '../services/apiService';

const BoardContext = createContext();

export const useBoard = () => useContext(BoardContext);

export const BoardProvider = ({ children }) => {
  const [board, setBoard] = useState(null);
  const [lanes, setLanes] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch the default board (or first available board)
  const fetchBoard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const boards = await apiService.getBoards();
      if (boards.length > 0) {
        setBoard(boards[0]);
      } else {
        // Create a default board if none exists
        const newBoard = await apiService.createBoard({
          name: 'Default Board',
          description: 'Your first Kanban board'
        });
        setBoard(newBoard);
        
        // Create default lanes
        const laneNames = ['To Do', 'In Progress', 'Done'];
        for (let i = 0; i < laneNames.length; i++) {
          await apiService.createLane(newBoard.uuid, {
            name: laneNames[i],
            position: i
          });
        }
      }
    } catch (err) {
      setError('Failed to load board: ' + err.message);
      console.error('Error fetching board:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch lanes for a board
  const fetchLanes = useCallback(async (boardUuid) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedLanes = await apiService.getLanes(boardUuid);
      setLanes(fetchedLanes);
    } catch (err) {
      setError('Failed to load lanes: ' + err.message);
      console.error('Error fetching lanes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch cards for a lane
  const fetchCards = useCallback(async (laneUuid) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedCards = await apiService.getCards(laneUuid);
      setCards(prevCards => {
        // Filter out cards that belong to this lane (to avoid duplicates)
        const otherCards = prevCards.filter(card => {
          const lane = lanes.find(l => l.uuid === laneUuid);
          return lane ? card.lane_id !== lane.id : true;
        });
        
        // Add the newly fetched cards
        return [...otherCards, ...fetchedCards];
      });
    } catch (err) {
      setError('Failed to load cards: ' + err.message);
      console.error('Error fetching cards:', err);
    } finally {
      setLoading(false);
    }
  }, [lanes]);

  // Create a new card
  const createCard = useCallback(async (laneUuid, cardData) => {
    setLoading(true);
    setError(null);
    try {
      const lane = lanes.find(l => l.uuid === laneUuid);
      if (!lane) throw new Error('Lane not found');
      
      // Get current cards in the lane to determine position
      const laneCards = cards.filter(c => c.lane_id === lane.id);
      const position = laneCards.length;
      
      const newCard = await apiService.createCard(laneUuid, {
        ...cardData,
        position
      });
      
      setCards(prevCards => [...prevCards, newCard]);
      return newCard;
    } catch (err) {
      setError('Failed to create card: ' + err.message);
      console.error('Error creating card:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [lanes, cards]);

  // Update a card
  const updateCard = useCallback(async (cardUuid, cardData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedCard = await apiService.updateCard(cardUuid, cardData);
      
      setCards(prevCards => 
        prevCards.map(card => 
          card.uuid === cardUuid ? { ...card, ...updatedCard } : card
        )
      );
      
      return updatedCard;
    } catch (err) {
      setError('Failed to update card: ' + err.message);
      console.error('Error updating card:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a card
  const deleteCard = useCallback(async (cardUuid) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteCard(cardUuid);
      
      setCards(prevCards => 
        prevCards.filter(card => card.uuid !== cardUuid)
      );
    } catch (err) {
      setError('Failed to delete card: ' + err.message);
      console.error('Error deleting card:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Move a card between lanes
  const moveCard = useCallback(async (cardUuid, targetLaneUuid, newPosition) => {
    setError(null);
    try {
      // Optimistically update the UI
      const cardToMove = cards.find(c => c.uuid === cardUuid);
      const targetLane = lanes.find(l => l.uuid === targetLaneUuid);
      
      if (!cardToMove || !targetLane) return;
      
      // Update the card in the local state
      setCards(prevCards => {
        const updatedCards = prevCards.map(card => {
          if (card.uuid === cardUuid) {
            return { ...card, lane_id: targetLane.id, position: newPosition };
          }
          return card;
        });
        
        return updatedCards;
      });
      
      // Update in the database
      await apiService.moveCard(cardUuid, {
        lane_uuid: targetLaneUuid,
        position: newPosition
      });
    } catch (err) {
      setError('Failed to move card: ' + err.message);
      console.error('Error moving card:', err);
      // Revert the optimistic update by refetching all cards
      if (board) {
        lanes.forEach(lane => fetchCards(lane.uuid));
      }
    }
  }, [cards, lanes, board, fetchCards]);

  // Create a new lane
  const createLane = useCallback(async (boardUuid, laneData) => {
    setLoading(true);
    setError(null);
    try {
      const newLane = await apiService.createLane(boardUuid, laneData);
      setLanes(prevLanes => [...prevLanes, newLane]);
      return newLane;
    } catch (err) {
      setError('Failed to create lane: ' + err.message);
      console.error('Error creating lane:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a lane
  const updateLane = useCallback(async (laneUuid, laneData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedLane = await apiService.updateLane(laneUuid, laneData);
      
      setLanes(prevLanes => 
        prevLanes.map(lane => 
          lane.uuid === laneUuid ? { ...lane, ...updatedLane } : lane
        )
      );
      
      return updatedLane;
    } catch (err) {
      setError('Failed to update lane: ' + err.message);
      console.error('Error updating lane:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a lane
  const deleteLane = useCallback(async (laneUuid) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteLane(laneUuid);
      
      const laneToDelete = lanes.find(l => l.uuid === laneUuid);
      
      if (laneToDelete) {
        // Remove all cards in this lane
        setCards(prevCards => 
          prevCards.filter(card => card.lane_id !== laneToDelete.id)
        );
        
        // Remove the lane
        setLanes(prevLanes => 
          prevLanes.filter(lane => lane.uuid !== laneUuid)
        );
      }
    } catch (err) {
      setError('Failed to delete lane: ' + err.message);
      console.error('Error deleting lane:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [lanes]);

  const value = {
    board,
    lanes,
    cards,
    loading,
    error,
    fetchBoard,
    fetchLanes,
    fetchCards,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
    createLane,
    updateLane,
    deleteLane
  };

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  );
};
