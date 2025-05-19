import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const apiService = {
  // Board operations
  getBoards: async () => {
    try {
      const response = await api.get('/api/boards');
      return response.data;
    } catch (error) {
      console.error('Error fetching boards:', error);
      throw error;
    }
  },

  getBoard: async (uuid) => {
    try {
      const response = await api.get(`/api/boards/${uuid}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching board ${uuid}:`, error);
      throw error;
    }
  },

  createBoard: async (boardData) => {
    try {
      const response = await api.post('/api/boards', boardData);
      return response.data;
    } catch (error) {
      console.error('Error creating board:', error);
      throw error;
    }
  },

  updateBoard: async (uuid, boardData) => {
    try {
      const response = await api.put(`/api/boards/${uuid}`, boardData);
      return response.data;
    } catch (error) {
      console.error(`Error updating board ${uuid}:`, error);
      throw error;
    }
  },

  deleteBoard: async (uuid) => {
    try {
      const response = await api.delete(`/api/boards/${uuid}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting board ${uuid}:`, error);
      throw error;
    }
  },

  // Swim Lane operations
  getLanes: async (boardUuid) => {
    try {
      const response = await api.get(`/api/boards/${boardUuid}/lanes`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching lanes for board ${boardUuid}:`, error);
      throw error;
    }
  },

  createLane: async (boardUuid, laneData) => {
    try {
      const response = await api.post(`/api/boards/${boardUuid}/lanes`, laneData);
      return response.data;
    } catch (error) {
      console.error(`Error creating lane for board ${boardUuid}:`, error);
      throw error;
    }
  },

  updateLane: async (uuid, laneData) => {
    try {
      const response = await api.put(`/api/lanes/${uuid}`, laneData);
      return response.data;
    } catch (error) {
      console.error(`Error updating lane ${uuid}:`, error);
      throw error;
    }
  },

  deleteLane: async (uuid) => {
    try {
      const response = await api.delete(`/api/lanes/${uuid}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting lane ${uuid}:`, error);
      throw error;
    }
  },

  // Card operations
  getCards: async (laneUuid) => {
    try {
      const response = await api.get(`/api/lanes/${laneUuid}/cards`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching cards for lane ${laneUuid}:`, error);
      throw error;
    }
  },

  createCard: async (laneUuid, cardData) => {
    try {
      const response = await api.post(`/api/lanes/${laneUuid}/cards`, cardData);
      return response.data;
    } catch (error) {
      console.error(`Error creating card for lane ${laneUuid}:`, error);
      throw error;
    }
  },

  updateCard: async (uuid, cardData) => {
    try {
      const response = await api.put(`/api/cards/${uuid}`, cardData);
      return response.data;
    } catch (error) {
      console.error(`Error updating card ${uuid}:`, error);
      throw error;
    }
  },

  deleteCard: async (uuid) => {
    try {
      const response = await api.delete(`/api/cards/${uuid}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting card ${uuid}:`, error);
      throw error;
    }
  },

  moveCard: async (uuid, moveData) => {
    try {
      const response = await api.put(`/api/cards/${uuid}/move`, moveData);
      return response.data;
    } catch (error) {
      console.error(`Error moving card ${uuid}:`, error);
      throw error;
    }
  },

  // API Verification
  verifyApi: async () => {
    try {
      const response = await api.get('/api/verify');
      return response.data;
    } catch (error) {
      console.error('API verification failed:', error);
      throw error;
    }
  }
};
