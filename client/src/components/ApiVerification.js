import React from 'react';
import styled from 'styled-components';

const VerificationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  margin: 2rem auto;
  max-width: 600px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Icon = styled.div`
  font-size: 3rem;
  color: #e74c3c;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  margin: 0 0 1rem 0;
  color: #2c3e50;
`;

const Message = styled.p`
  margin: 0 0 1.5rem 0;
  color: #7f8c8d;
  line-height: 1.5;
`;

const TestList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
  width: 100%;
  max-width: 400px;
`;

const TestItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #ecf0f1;
  
  &:last-child {
    border-bottom: none;
  }
`;

const TestName = styled.span`
  font-weight: 500;
  color: #2c3e50;
`;

const TestStatus = styled.span`
  font-weight: 500;
  color: #e74c3c;
`;

const RetryButton = styled.button`
  padding: 0.75rem 2rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const ApiVerification = ({ onRetry }) => {
  return (
    <VerificationContainer>
      <Icon>⚠️</Icon>
      <Title>API Verification Failed</Title>
      <Message>
        We couldn't connect to the StorFlo API. This could be due to a server issue or database connection problem.
      </Message>
      
      <TestList>
        <TestItem>
          <TestName>Database Connection</TestName>
          <TestStatus>Failed</TestStatus>
        </TestItem>
        <TestItem>
          <TestName>Data Retrieval</TestName>
          <TestStatus>Failed</TestStatus>
        </TestItem>
        <TestItem>
          <TestName>Data Creation</TestName>
          <TestStatus>Failed</TestStatus>
        </TestItem>
      </TestList>
      
      <RetryButton onClick={onRetry}>
        Retry Connection
      </RetryButton>
    </VerificationContainer>
  );
};

export default ApiVerification;
