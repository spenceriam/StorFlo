import React from 'react';
import styled from 'styled-components';
import { useBoard } from '../context/BoardContext';

const HeaderContainer = styled.header`
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  
  span {
    color: #3498db;
  }
`;

const BoardInfo = styled.div`
  text-align: right;
  
  h2 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 500;
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.8;
  }
`;

const Header = () => {
  const { board } = useBoard();
  
  return (
    <HeaderContainer>
      <Logo>
        Stor<span>Flo</span>
      </Logo>
      {board && (
        <BoardInfo>
          <h2>{board.name}</h2>
          {board.description && <p>{board.description}</p>}
        </BoardInfo>
      )}
    </HeaderContainer>
  );
};

export default Header;
