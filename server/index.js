const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 8080;

// Game state initialization
let gameState = {
  players: {},
  board: Array(5).fill(null).map(() => Array(5).fill(null)),
  currentTurn: 'A', // 'A' or 'B'
};

function initializePlayer(playerId) {
  // Initializing player positions (Assuming player A starts at row 0, and player B at row 4)
  gameState.players[playerId] = {
    team: playerId === 'A' ? ['A-P1', 'A-H1', 'A-H2', 'A-P2', 'A-P3'] : ['B-P1', 'B-H1', 'B-H2', 'B-P2', 'B-P3'],
    positions: playerId === 'A' ? [0, 0] : [4, 0],
  };
}

// Handle WebSocket connections
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'init':
        initializePlayer(data.playerId);
        broadcastGameState();
        break;

      case 'move':
        if (gameState.currentTurn === data.playerId) {
          const isValidMove = processMove(data.playerId, data.character, data.move);
          if (isValidMove) {
            gameState.currentTurn = gameState.currentTurn === 'A' ? 'B' : 'A';
            broadcastGameState();
          } else {
            ws.send(JSON.stringify({ type: 'invalid_move', message: 'Invalid move!' }));
          }
        }
        break;

      default:
        break;
    }
  });
});

function broadcastGameState() {
  const state = {
    type: 'game_state',
    gameState,
  };

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(state));
    }
  });
}

function processMove(playerId, character, move) {
  // Implement game logic here
  // Example: Validate move, update gameState.board, handle combat, etc.
  // Return true if move is valid, false otherwise

  // Placeholder implementation
  return true;
}

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
