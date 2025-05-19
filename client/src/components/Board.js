import React, { useState } from 'react';
import styled from 'styled-components';
import Lane from './Lane';
import AddCardModal from './AddCardModal';
import { useBoard } from '../context/BoardContext';

const BoardContainer = styled.div`
  display: flex;
  flex: 1;
  padding: 2rem;
  overflow-x: auto;
  background-color: #f5f6fa;
`;

const LanesContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  height: 100%;
  min-width: fit-content;
`;

const Board = () => {
  const { lanes, cards, createCard } = useBoard();
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [selectedLane, setSelectedLane] = useState(null);

  const handleAddCard = (laneUuid) => {
    setSelectedLane(laneUuid);
    setShowAddCardModal(true);
  };

  const handleCloseModal = () => {
    setShowAddCardModal(false);
    setSelectedLane(null);
  };

  const handleCreateCard = async (cardData) => {
    if (selectedLane) {
      try {
        await createCard(selectedLane, cardData);
        handleCloseModal();
      } catch (error) {
        console.error('Error creating card:', error);
      }
    }
  };

  return (
    <BoardContainer>
      <LanesContainer>
        {lanes.map((lane) => (
          <Lane
            key={lane.uuid}
            lane={lane}
            cards={cards.filter(card => card.lane_id === lane.id)}
            onAddCard={() => handleAddCard(lane.uuid)}
          />
        ))}
      </LanesContainer>
      
      {showAddCardModal && (
        <AddCardModal
          onClose={handleCloseModal}
          onSubmit={handleCreateCard}
        />
      )}
    </BoardContainer>
  );
};

export default Board;
