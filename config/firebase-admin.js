// Mock Firebase Admin for development
console.log('🔧 Firebase Admin running in MOCK mode - no actual Firebase connection');

const mockFirebaseAdmin = {
  auth: () => ({
    verifyIdToken: (token) => {
      console.log('🔐 Mock Firebase Auth - verifying token:', token.substring(0, 20) + '...');
      
      // Mock user verification - always return success for testing
      return Promise.resolve({
        uid: 'mock-user-' + Date.now(),
        email: 'test@cinga.com',
        name: 'Test User'
      });
    }
  })
};

module.exports = mockFirebaseAdmin;