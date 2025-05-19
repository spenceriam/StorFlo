const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { check, validationResult } = require('express-validator');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// GibsonAI Database Configuration
const GIBSON_API_URL = process.env.GIBSON_API_URL;
const GIBSON_API_KEY = process.env.GIBSON_API_KEY;

// Database client for GibsonAI
const db = {
  async query(sql) {
    try {
      const response = await axios.post(
        GIBSON_API_URL,
        { query: sql },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Gibson-API-Key': GIBSON_API_KEY
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Database error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Database query failed');
    }
  }
};

// API Verification Endpoint
app.get('/api/verify', async (req, res) => {
  try {
    // Test database connection
    const connectionTest = await db.query('SELECT 1 as test');
    
    // Test read operation
    const readTest = await db.query('SELECT COUNT(*) as count FROM kanban_board');
    
    // Test write operation (create and delete a test board)
    const testUuid = uuidv4();
    await db.query(`INSERT INTO kanban_board (uuid, name, description) VALUES ('${testUuid}', 'Test Board', 'Test Description')`);
    const writeTest = await db.query(`SELECT id FROM kanban_board WHERE uuid = '${testUuid}'`);
    const testId = writeTest[0].id;
    await db.query(`DELETE FROM kanban_board WHERE id = ${testId}`);
    
    res.json({
      status: 'success',
      message: 'API verification successful',
      tests: {
        connection: true,
        read: true,
        write: true
      }
    });
  } catch (error) {
    console.error('API verification failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'API verification failed',
      error: error.message,
      tests: {
        connection: false,
        read: false,
        write: false
      }
    });
  }
});

// Board Routes
app.get('/api/boards', async (req, res) => {
  try {
    const boards = await db.query('SELECT * FROM kanban_board ORDER BY date_created DESC');
    res.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/boards/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    const boards = await db.query(`SELECT * FROM kanban_board WHERE uuid = '${uuid}'`);
    
    if (boards.length === 0) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    res.json(boards[0]);
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/boards', [
  check('name').notEmpty().withMessage('Name is required'),
  check('description').optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description = '' } = req.body;
    const uuid = uuidv4();
    
    await db.query(`INSERT INTO kanban_board (uuid, name, description) VALUES ('${uuid}', '${name}', '${description}')`);
    
    const newBoard = await db.query(`SELECT * FROM kanban_board WHERE uuid = '${uuid}'`);
    res.status(201).json(newBoard[0]);
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/boards/:uuid', [
  check('name').optional(),
  check('description').optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { uuid } = req.params;
    const { name, description } = req.body;
    
    let updateQuery = 'UPDATE kanban_board SET date_updated = CURRENT_TIMESTAMP';
    
    if (name) {
      updateQuery += `, name = '${name}'`;
    }
    
    if (description !== undefined) {
      updateQuery += `, description = '${description}'`;
    }
    
    updateQuery += ` WHERE uuid = '${uuid}'`;
    
    await db.query(updateQuery);
    
    const updatedBoard = await db.query(`SELECT * FROM kanban_board WHERE uuid = '${uuid}'`);
    
    if (updatedBoard.length === 0) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    res.json(updatedBoard[0]);
  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/boards/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    
    // Get board ID
    const boards = await db.query(`SELECT id FROM kanban_board WHERE uuid = '${uuid}'`);
    
    if (boards.length === 0) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    const boardId = boards[0].id;
    
    // Get all swim lanes for this board
    const lanes = await db.query(`SELECT id FROM kanban_swim_lane WHERE board_id = ${boardId}`);
    
    // Delete all cards in these lanes
    for (const lane of lanes) {
      await db.query(`DELETE FROM kanban_card WHERE lane_id = ${lane.id}`);
    }
    
    // Delete all swim lanes
    await db.query(`DELETE FROM kanban_swim_lane WHERE board_id = ${boardId}`);
    
    // Delete the board
    await db.query(`DELETE FROM kanban_board WHERE id = ${boardId}`);
    
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Error deleting board:', error);
    res.status(500).json({ error: error.message });
  }
});

// Swim Lane Routes
app.get('/api/boards/:boardUuid/lanes', async (req, res) => {
  try {
    const { boardUuid } = req.params;
    
    // Get board ID
    const boards = await db.query(`SELECT id FROM kanban_board WHERE uuid = '${boardUuid}'`);
    
    if (boards.length === 0) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    const boardId = boards[0].id;
    
    // Get all swim lanes for this board
    const lanes = await db.query(`
      SELECT * FROM kanban_swim_lane 
      WHERE board_id = ${boardId}
      ORDER BY position ASC
    `);
    
    res.json(lanes);
  } catch (error) {
    console.error('Error fetching swim lanes:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/boards/:boardUuid/lanes', [
  check('name').notEmpty().withMessage('Name is required'),
  check('position').isInt().withMessage('Position must be an integer')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { boardUuid } = req.params;
    const { name, position } = req.body;
    
    // Get board ID
    const boards = await db.query(`SELECT id FROM kanban_board WHERE uuid = '${boardUuid}'`);
    
    if (boards.length === 0) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    const boardId = boards[0].id;
    const uuid = uuidv4();
    
    await db.query(`
      INSERT INTO kanban_swim_lane (uuid, board_id, name, position) 
      VALUES ('${uuid}', ${boardId}, '${name}', ${position})
    `);
    
    const newLane = await db.query(`SELECT * FROM kanban_swim_lane WHERE uuid = '${uuid}'`);
    res.status(201).json(newLane[0]);
  } catch (error) {
    console.error('Error creating swim lane:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/lanes/:uuid', [
  check('name').optional(),
  check('position').optional().isInt().withMessage('Position must be an integer')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { uuid } = req.params;
    const { name, position } = req.body;
    
    let updateQuery = 'UPDATE kanban_swim_lane SET date_updated = CURRENT_TIMESTAMP';
    
    if (name) {
      updateQuery += `, name = '${name}'`;
    }
    
    if (position !== undefined) {
      updateQuery += `, position = ${position}`;
    }
    
    updateQuery += ` WHERE uuid = '${uuid}'`;
    
    await db.query(updateQuery);
    
    const updatedLane = await db.query(`SELECT * FROM kanban_swim_lane WHERE uuid = '${uuid}'`);
    
    if (updatedLane.length === 0) {
      return res.status(404).json({ error: 'Swim lane not found' });
    }
    
    res.json(updatedLane[0]);
  } catch (error) {
    console.error('Error updating swim lane:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/lanes/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    
    // Get lane ID
    const lanes = await db.query(`SELECT id FROM kanban_swim_lane WHERE uuid = '${uuid}'`);
    
    if (lanes.length === 0) {
      return res.status(404).json({ error: 'Swim lane not found' });
    }
    
    const laneId = lanes[0].id;
    
    // Delete all cards in this lane
    await db.query(`DELETE FROM kanban_card WHERE lane_id = ${laneId}`);
    
    // Delete the lane
    await db.query(`DELETE FROM kanban_swim_lane WHERE id = ${laneId}`);
    
    res.json({ message: 'Swim lane deleted successfully' });
  } catch (error) {
    console.error('Error deleting swim lane:', error);
    res.status(500).json({ error: error.message });
  }
});

// Card Routes
app.get('/api/lanes/:laneUuid/cards', async (req, res) => {
  try {
    const { laneUuid } = req.params;
    
    // Get lane ID
    const lanes = await db.query(`SELECT id FROM kanban_swim_lane WHERE uuid = '${laneUuid}'`);
    
    if (lanes.length === 0) {
      return res.status(404).json({ error: 'Swim lane not found' });
    }
    
    const laneId = lanes[0].id;
    
    // Get all cards for this lane
    const cards = await db.query(`
      SELECT * FROM kanban_card 
      WHERE lane_id = ${laneId}
      ORDER BY position ASC
    `);
    
    res.json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/lanes/:laneUuid/cards', [
  check('title').notEmpty().withMessage('Title is required'),
  check('description').optional(),
  check('priority').notEmpty().withMessage('Priority is required'),
  check('position').isInt().withMessage('Position must be an integer')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { laneUuid } = req.params;
    const { title, description = '', priority, position } = req.body;
    
    // Get lane ID
    const lanes = await db.query(`SELECT id FROM kanban_swim_lane WHERE uuid = '${laneUuid}'`);
    
    if (lanes.length === 0) {
      return res.status(404).json({ error: 'Swim lane not found' });
    }
    
    const laneId = lanes[0].id;
    const uuid = uuidv4();
    
    await db.query(`
      INSERT INTO kanban_card (uuid, lane_id, title, description, priority, position) 
      VALUES ('${uuid}', ${laneId}, '${title}', '${description}', '${priority}', ${position})
    `);
    
    const newCard = await db.query(`SELECT * FROM kanban_card WHERE uuid = '${uuid}'`);
    res.status(201).json(newCard[0]);
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/cards/:uuid', [
  check('title').optional(),
  check('description').optional(),
  check('priority').optional(),
  check('position').optional().isInt().withMessage('Position must be an integer'),
  check('lane_id').optional().isInt().withMessage('Lane ID must be an integer')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { uuid } = req.params;
    const { title, description, priority, position, lane_id } = req.body;
    
    let updateQuery = 'UPDATE kanban_card SET date_updated = CURRENT_TIMESTAMP';
    
    if (title) {
      updateQuery += `, title = '${title}'`;
    }
    
    if (description !== undefined) {
      updateQuery += `, description = '${description}'`;
    }
    
    if (priority) {
      updateQuery += `, priority = '${priority}'`;
    }
    
    if (position !== undefined) {
      updateQuery += `, position = ${position}`;
    }
    
    if (lane_id !== undefined) {
      updateQuery += `, lane_id = ${lane_id}`;
    }
    
    updateQuery += ` WHERE uuid = '${uuid}'`;
    
    await db.query(updateQuery);
    
    const updatedCard = await db.query(`SELECT * FROM kanban_card WHERE uuid = '${uuid}'`);
    
    if (updatedCard.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    res.json(updatedCard[0]);
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: error.message });
  }
});

// Move card between lanes
app.put('/api/cards/:uuid/move', [
  check('lane_uuid').notEmpty().withMessage('Lane UUID is required'),
  check('position').isInt().withMessage('Position must be an integer')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { uuid } = req.params;
    const { lane_uuid, position } = req.body;
    
    // Get card
    const cards = await db.query(`SELECT * FROM kanban_card WHERE uuid = '${uuid}'`);
    
    if (cards.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // Get target lane ID
    const lanes = await db.query(`SELECT id FROM kanban_swim_lane WHERE uuid = '${lane_uuid}'`);
    
    if (lanes.length === 0) {
      return res.status(404).json({ error: 'Target swim lane not found' });
    }
    
    const laneId = lanes[0].id;
    
    // Update card position and lane
    await db.query(`
      UPDATE kanban_card 
      SET lane_id = ${laneId}, position = ${position}, date_updated = CURRENT_TIMESTAMP
      WHERE uuid = '${uuid}'
    `);
    
    const updatedCard = await db.query(`SELECT * FROM kanban_card WHERE uuid = '${uuid}'`);
    res.json(updatedCard[0]);
  } catch (error) {
    console.error('Error moving card:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/cards/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    
    // Delete the card
    await db.query(`DELETE FROM kanban_card WHERE uuid = '${uuid}'`);
    
    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: error.message });
  }
});

// Initialize default board and lanes if none exist
async function initializeDefaultData() {
  try {
    // Check if any boards exist
    const boards = await db.query('SELECT COUNT(*) as count FROM kanban_board');
    
    if (boards[0].count === 0) {
      console.log('Initializing default board and swim lanes...');
      
      // Create default board
      const boardUuid = uuidv4();
      await db.query(`
        INSERT INTO kanban_board (uuid, name, description) 
        VALUES ('${boardUuid}', 'Default Board', 'Your first Kanban board')
      `);
      
      const boardResult = await db.query(`SELECT id FROM kanban_board WHERE uuid = '${boardUuid}'`);
      const boardId = boardResult[0].id;
      
      // Create default swim lanes
      const lanes = [
        { name: 'To Do', position: 0 },
        { name: 'In Progress', position: 1 },
        { name: 'Done', position: 2 }
      ];
      
      for (const lane of lanes) {
        const laneUuid = uuidv4();
        await db.query(`
          INSERT INTO kanban_swim_lane (uuid, board_id, name, position) 
          VALUES ('${laneUuid}', ${boardId}, '${lane.name}', ${lane.position})
        `);
      }
      
      console.log('Default board and swim lanes created successfully');
    }
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
}

// Start the server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeDefaultData();
});
