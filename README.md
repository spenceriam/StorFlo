# StorFlo - Kanban Board Application

StorFlo is a full-stack Kanban board application that integrates with GibsonAI for database operations. It features drag-and-drop functionality for card management, real-time updates, and robust error handling.

## Features

- **GibsonAI Database Integration**: All data is stored in a GibsonAI database
- **Drag-and-Drop Interface**: Move cards between swim lanes with visual feedback
- **Complete CRUD Operations**: Create, read, update, and delete boards, swim lanes, and cards
- **API Verification System**: Tests connectivity before rendering the application
- **Error Handling**: Graceful error handling at all levels
- **Modern UI**: Clean, visually appealing board layout

## Tech Stack

### Backend
- Express.js
- GibsonAI database integration
- RESTful API architecture

### Frontend
- React
- @hello-pangea/dnd for drag-and-drop functionality
- Context API for state management
- Styled Components for styling
- Error boundaries for error handling

## Project Structure

```
StorFlo/
├── client/                 # React frontend
│   ├── public/             # Public assets
│   └── src/
│       ├── components/     # React components
│       ├── context/        # Context API providers
│       ├── services/       # API services
│       ├── styles/         # CSS styles
│       └── utils/          # Utility functions
├── server/                 # Express backend
│   ├── server.js           # Main server file
│   └── .env                # Environment variables
└── .gibsonai               # GibsonAI project configuration
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup
1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with your GibsonAI API key:
   ```
   GIBSON_API_KEY=your_gibson_api_key
   GIBSON_API_URL=https://api.gibsonai.com/v1/-/query
   PORT=5000
   ```

4. Start the server:
   ```
   npm start
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## API Documentation

### Board Endpoints
- `GET /api/boards` - Get all boards
- `GET /api/boards/:uuid` - Get a specific board
- `POST /api/boards` - Create a new board
- `PUT /api/boards/:uuid` - Update a board
- `DELETE /api/boards/:uuid` - Delete a board

### Swim Lane Endpoints
- `GET /api/boards/:boardUuid/lanes` - Get all lanes for a board
- `POST /api/boards/:boardUuid/lanes` - Create a new lane
- `PUT /api/lanes/:uuid` - Update a lane
- `DELETE /api/lanes/:uuid` - Delete a lane

### Card Endpoints
- `GET /api/lanes/:laneUuid/cards` - Get all cards for a lane
- `POST /api/lanes/:laneUuid/cards` - Create a new card
- `PUT /api/cards/:uuid` - Update a card
- `DELETE /api/cards/:uuid` - Delete a card
- `PUT /api/cards/:uuid/move` - Move a card between lanes

### API Verification
- `GET /api/verify` - Verify API connectivity

## Data Structure

### Board
- `id`: Auto-increment primary key
- `uuid`: Unique identifier
- `name`: Board name
- `description`: Board description
- `date_created`: Creation timestamp
- `date_updated`: Update timestamp

### Swim Lane
- `id`: Auto-increment primary key
- `uuid`: Unique identifier
- `board_id`: Foreign key to Board
- `name`: Lane name
- `position`: Order position
- `date_created`: Creation timestamp
- `date_updated`: Update timestamp

### Card
- `id`: Auto-increment primary key
- `uuid`: Unique identifier
- `lane_id`: Foreign key to Swim Lane
- `title`: Card title
- `description`: Card description
- `priority`: Card priority (Low, Medium, High)
- `position`: Order position within lane
- `date_created`: Creation timestamp
- `date_updated`: Update timestamp

## Usage

1. The application will load with a default board and three swim lanes (To Do, In Progress, Done)
2. Click "Add Card" to create new cards in any lane
3. Drag and drop cards between lanes to change their status
4. Click on a card to view details, edit, or delete it

## Error Handling

The application includes comprehensive error handling:
- API verification before rendering the application
- Error boundaries to catch React component errors
- Graceful error recovery with retry options
- Detailed error logging in the console
