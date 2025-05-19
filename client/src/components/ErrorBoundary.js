import React, { Component } from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
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

const ErrorDetails = styled.pre`
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  color: #e74c3c;
  font-size: 0.8rem;
  width: 100%;
  max-width: 500px;
  overflow-x: auto;
  margin-bottom: 1.5rem;
  text-align: left;
`;

const ResetButton = styled.button`
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

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <ErrorContainer>
          <Icon>🛑</Icon>
          <Title>Something went wrong</Title>
          <Message>
            An unexpected error occurred in the application. Please try refreshing the page.
          </Message>
          
          {this.state.error && (
            <ErrorDetails>
              {this.state.error.toString()}
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </ErrorDetails>
          )}
          
          <ResetButton onClick={this.handleReset}>
            Refresh Application
          </ResetButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
