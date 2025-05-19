import React from 'react';
import styled from 'styled-components';
import { Droppable } from '@hello-pangea/dnd';
import Card from './Card';

const LaneContainer = styled.div`
  background-color: #f0f2f5;
  border-radius: 8px;
  width: 300px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const LaneHeader = styled.div`
  padding: 1rem;
  background-color: #ffffff;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  border-bottom: 1px solid #e1e4e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LaneName = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
`;

const CardCount = styled.span`
  background-color: #e1e4e8;
  color: #586069;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const CardsContainer = styled.div`
  padding: 1rem;
  flex-grow: 1;
  overflow-y: auto;
  min-height: 100px;
  background-color: ${props => (props.isDraggingOver ? '#e9ecef' : '#f0f2f5')};
  transition: background-color 0.2s ease;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`;

const AddCardButton = styled.button`
  margin-top: 0.5rem;
  background-color: transparent;
  border: 1px dashed #c0c7d0;
  border-radius: 4px;
  padding: 0.5rem;
  width: 100%;
  text-align: center;
  color: #586069;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
    color: #2c3e50;
  }
`;

const Lane = ({ lane, cards, onAddCard }) => {
  return (
    <LaneContainer>
      <LaneHeader>
        <LaneName>{lane.name}</LaneName>
        <CardCount>{cards.length}</CardCount>
      </LaneHeader>
      
      <Droppable droppableId={lane.uuid}>
        {(provided, snapshot) => (
          <CardsContainer
            ref={provided.innerRef}
            {...provided.droppableProps}
            isDraggingOver={snapshot.isDraggingOver}
          >
            {cards
              .sort((a, b) => a.position - b.position)
              .map((card, index) => (
                <Card key={card.uuid} card={card} index={index} />
              ))}
            {provided.placeholder}
            <AddCardButton onClick={onAddCard}>+ Add Card</AddCardButton>
          </CardsContainer>
        )}
      </Droppable>
    </LaneContainer>
  );
};

export default Lane;
