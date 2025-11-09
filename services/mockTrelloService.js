class MockTrelloService {
  constructor() {
    this.boards = new Map(); // In-memory storage for demo
    this.cards = new Map();
    console.log('🔧 Mock Trello Service initialized - No API keys needed');
  }

  // Create a mock Trello board
  async createProjectBoard(projectName, projectDescription = '') {
    try {
      console.log('🎯 Creating mock Trello board for:', projectName);
      
      // Simulate API delay
      await this.simulateDelay();
      
      const boardId = `mock_board_${Date.now()}`;
      const boardUrl = `https://trello.com/b/${boardId}/mock-board`;
      
      // Store mock board data
      this.boards.set(boardId, {
        id: boardId,
        name: projectName,
        desc: projectDescription,
        url: boardUrl,
        lists: [
          { id: 'todo_list', name: 'To Do' },
          { id: 'progress_list', name: 'In Progress' },
          { id: 'done_list', name: 'Completed' }
        ]
      });

      console.log('✅ Mock Trello board created:', boardId);
      
      return {
        success: true,
        boardId: boardId,
        boardUrl: boardUrl,
        lists: this.boards.get(boardId).lists,
        mock: true // Flag to indicate this is mock data
      };
      
    } catch (error) {
      console.error('❌ Mock Trello board creation failed:', error);
      return {
        success: false,
        error: 'Failed to create mock Trello board',
        mock: true
      };
    }
  }

  // Create a mock task card
  async createTaskCard(boardId, taskName, taskDescription = '', dueDate = null, listName = 'To Do') {
    try {
      console.log('🎯 Creating mock Trello card:', taskName);
      
      await this.simulateDelay();
      
      const cardId = `mock_card_${Date.now()}`;
      const cardUrl = `https://trello.com/c/${cardId}/mock-card`;
      
      // Store mock card data
      this.cards.set(cardId, {
        id: cardId,
        name: taskName,
        desc: taskDescription,
        due: dueDate,
        listName: listName,
        boardId: boardId,
        url: cardUrl
      });

      console.log('✅ Mock Trello card created:', cardId);
      
      return {
        success: true,
        cardId: cardId,
        cardUrl: cardUrl,
        mock: true
      };
      
    } catch (error) {
      console.error('❌ Mock Trello card creation failed:', error);
      return {
        success: false,
        error: 'Failed to create mock Trello card',
        mock: true
      };
    }
  }

  // Sync mock project progress
  async syncProjectProgress(boardId) {
    try {
      console.log('🎯 Syncing mock Trello progress for board:', boardId);
      
      await this.simulateDelay();
      
      const board = this.boards.get(boardId);
      if (!board) {
        return {
          success: false,
          error: 'Mock board not found',
          mock: true
        };
      }

      // Get all cards for this board
      const boardCards = Array.from(this.cards.values()).filter(card => card.boardId === boardId);
      
      const totalTasks = boardCards.length;
      
      // Mock progress calculation
      const completedTasks = boardCards.filter(card => card.listName === 'Completed').length;
      const inProgressTasks = boardCards.filter(card => card.listName === 'In Progress').length;
      
      const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      // Mock overdue tasks (random for demo)
      const overdueTasks = Math.floor(Math.random() * 3);

      console.log('✅ Mock Trello sync completed:', { progress, totalTasks, completedTasks });
      
      return {
        success: true,
        progress: Math.round(progress),
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        mock: true
      };
      
    } catch (error) {
      console.error('❌ Mock Trello sync failed:', error);
      return {
        success: false,
        error: 'Failed to sync with mock Trello',
        mock: true
      };
    }
  }

  // Update mock task status
  async updateTaskStatus(cardId, newStatus) {
    try {
      console.log('🎯 Updating mock Trello card status:', cardId, newStatus);
      
      await this.simulateDelay();
      
      const card = this.cards.get(cardId);
      if (!card) {
        return {
          success: false,
          error: 'Mock card not found',
          mock: true
        };
      }

      // Map status to list names
      const statusMap = {
        'todo': 'To Do',
        'in-progress': 'In Progress', 
        'completed': 'Completed'
      };

      card.listName = statusMap[newStatus] || 'To Do';
      this.cards.set(cardId, card);

      console.log('✅ Mock Trello card status updated:', cardId, '->', card.listName);
      
      return { 
        success: true,
        mock: true
      };
      
    } catch (error) {
      console.error('❌ Mock Trello card update failed:', error);
      return {
        success: false,
        error: 'Failed to update mock Trello card',
        mock: true
      };
    }
  }

  // Helper to simulate API delay
  simulateDelay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get mock data for debugging
  getMockData() {
    return {
      boards: Array.from(this.boards.values()),
      cards: Array.from(this.cards.values())
    };
  }
}

module.exports = new MockTrelloService();