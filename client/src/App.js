import React, { useEffect, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import styled from 'styled-components';
import Header from './components/Header';
import Board from './components/Board';
import ApiVerification from './components/ApiVerification';
import { useBoard } from './context/BoardContext';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/App.css';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f6fa;
`;

const App = () => {
  const { 
    board, 
    lanes, 
    cards, 
    fetchBoard, 
    fetchLanes, 
    fetchCards, 
    moveCard,
    loading,
    error
  } = useBoard();
  
  const [apiVerified, setApiVerified] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyApi = async () => {
      try {
        const response = await fetch('/api/verify');
        const data = await response.json();
        
        if (data.status === 'success') {
          setApiVerified(true);
          
          // Load initial data
          await fetchBoard();
        } else {
          setApiVerified(false);
        }
      } catch (error) {
        console.error('API verification failed:', error);
        setApiVerified(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyApi();
  }, [fetchBoard]);

  useEffect(() => {
    if (board && board.id) {
      fetchLanes(board.uuid);
    }
  }, [board, fetchLanes]);

  useEffect(() => {
    if (lanes && lanes.length > 0) {
      lanes.forEach(lane => {
        fetchCards(lane.uuid);
      });
    }
  }, [lanes, fetchCards]);

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Find the card that was dragged
    const draggedCard = cards.find(card => card.uuid === draggableId);
    if (!draggedCard) return;

    // Find source and destination lanes
    const sourceLane = lanes.find(lane => lane.uuid === source.droppableId);
    const destinationLane = lanes.find(lane => lane.uuid === destination.droppableId);

    if (!sourceLane || !destinationLane) return;

    // Calculate new positions for cards in the destination lane
    const destinationCards = cards.filter(card => card.lane_id === destinationLane.id);
    
    // If moving within the same lane
    if (sourceLane.id === destinationLane.id) {
      const newCards = Array.from(destinationCards);
      const [removed] = newCards.splice(source.index, 1);
      newCards.splice(destination.index, 0, removed);
      
      // Update positions
      newCards.forEach((card, index) => {
        card.position = index;
      });
      
      // Update the moved card in the database
      moveCard(draggableId, destinationLane.uuid, destination.index);
    } else {
      // Moving to a different lane
      const sourceCards = cards.filter(card => card.lane_id === sourceLane.id);
      
      // Remove from source lane
      const newSourceCards = Array.from(sourceCards);
      newSourceCards.splice(source.index, 1);
      
      // Add to destination lane
      const newDestinationCards = Array.from(destinationCards);
      newDestinationCards.splice(destination.index, 0, draggedCard);
      
      // Update positions in both lanes
      newSourceCards.forEach((card, index) => {
        card.position = index;
      });
      
      newDestinationCards.forEach((card, index) => {
        card.position = index;
      });
      
      // Update the moved card in the database
      moveCard(draggableId, destinationLane.uuid, destination.index);
    }
  };

  if (verifying) {
    return (
      <AppContainer>
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Verifying API connection...</p>
        </div>
      </AppContainer>
    );
  }

  if (!apiVerified) {
    return (
      <AppContainer>
        <Header />
        <ApiVerification onRetry={() => window.location.reload()} />
      </AppContainer>
    );
  }

  if (loading) {
    return (
      <AppContainer>
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading board data...</p>
        </div>
      </AppContainer>
    );
  }

  if (error) {
    return (
      <AppContainer>
        <Header />
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </AppContainer>
    );
  }

  return (
    <ErrorBoundary>
      <AppContainer>
        <Header />
        <DragDropContext onDragEnd={handleDragEnd}>
          <Board />
        </DragDropContext>
      </AppContainer>
    </ErrorBoundary>
  );
};

export default App;
