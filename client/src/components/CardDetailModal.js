import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from './Modal';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  font-size: 0.9rem;
  color: #2c3e50;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  font-size: 0.9rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background-color: transparent;
  border: 1px solid #dfe1e6;
  color: #586069;
  
  &:hover:not(:disabled) {
    background-color: #f8f9fa;
  }
`;

const DeleteButton = styled(Button)`
  background-color: transparent;
  border: 1px solid #e74c3c;
  color: #e74c3c;
  
  &:hover:not(:disabled) {
    background-color: #fdedec;
  }
`;

const SaveButton = styled(Button)`
  background-color: #3498db;
  border: 1px solid #3498db;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #2980b9;
  }
`;

const CardDetailModal = ({ card, onClose, onUpdate, onDelete }) => {
  const [formData, setFormData] = useState({
    title: card.title,
    description: card.description || '',
    priority: card.priority
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title) return;
    
    setIsSubmitting(true);
    
    try {
      await onUpdate(formData);
    } catch (error) {
      console.error('Error updating card:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this card?')) return;
    
    setIsDeleting(true);
    
    try {
      await onDelete();
    } catch (error) {
      console.error('Error deleting card:', error);
      setIsDeleting(false);
    }
  };
  
  return (
    <Modal title="Card Details" onClose={onClose}>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="title">Title</Label>
          <Input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter card title"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="description">Description</Label>
          <TextArea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter card description"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="priority">Priority</Label>
          <Select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </Select>
        </FormGroup>
        
        <ButtonGroup>
          <DeleteButton 
            type="button" 
            onClick={handleDelete}
            disabled={isDeleting || isSubmitting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </DeleteButton>
          
          <ActionButtons>
            <CancelButton type="button" onClick={onClose}>
              Cancel
            </CancelButton>
            <SaveButton 
              type="submit" 
              disabled={!formData.title || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </SaveButton>
          </ActionButtons>
        </ButtonGroup>
      </Form>
    </Modal>
  );
};

export default CardDetailModal;
