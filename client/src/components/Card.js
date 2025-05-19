import React, { useState } from 'react';
import styled from 'styled-components';
import { Draggable } from '@hello-pangea/dnd';
import CardDetailModal from './CardDetailModal';
import { useBoard } from '../context/BoardContext';

const CardContainer = styled.div`
  background-color: white;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  user-select: none;
  position: relative;
  border-left: 3px solid ${props => {
    switch (props.priority) {
      case 'high':
        return '#e74c3c';
      case 'medium':
        return '#f39c12';
      case 'low':
        return '#2ecc71';
      default:
        return '#3498db';
    }
  }};
  
  &:hover {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  }
  
  background-color: ${props => (props.isDragging ? '#f8f9fa' : 'white')};
  transform: ${props => (props.isDragging ? 'rotate(2deg)' : 'none')};
`;

const CardTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
`;

const CardDescription = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #586069;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const PriorityBadge = styled.span`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
  background-color: ${props => {
    switch (props.priority) {
      case 'high':
        return '#ffebee';
      case 'medium':
        return '#fff8e1';
      case 'low':
        return '#e8f5e9';
      default:
        return '#e3f2fd';
    }
  }};
  color: ${props => {
    switch (props.priority) {
      case 'high':
        return '#c62828';
      case 'medium':
        return '#f57f17';
      case 'low':
        return '#2e7d32';
      default:
        return '#1565c0';
    }
  }};
`;

const Card = ({ card, index }) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { updateCard, deleteCard } = useBoard();

  const handleOpenModal = () => {
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
  };

  const handleUpdateCard = async (updatedData) => {
    try {
      await updateCard(card.uuid, updatedData);
      handleCloseModal();
    } catch (error) {
      console.error('Error updating card:', error);
    }
  };

  const handleDeleteCard = async () => {
    try {
      await deleteCard(card.uuid);
      handleCloseModal();
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  return (
    <>
      <Draggable draggableId={card.uuid} index={index}>
        {(provided, snapshot) => (
          <CardContainer
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            isDragging={snapshot.isDragging}
            priority={card.priority.toLowerCase()}
            onClick={handleOpenModal}
          >
            <CardTitle>{card.title}</CardTitle>
            <CardDescription>{card.description}</CardDescription>
            <PriorityBadge priority={card.priority.toLowerCase()}>
              {card.priority}
            </PriorityBadge>
          </CardContainer>
        )}
      </Draggable>
      
      {showDetailModal && (
        <CardDetailModal
          card={card}
          onClose={handleCloseModal}
          onUpdate={handleUpdateCard}
          onDelete={handleDeleteCard}
        />
      )}
    </>
  );
};

export default Card;
