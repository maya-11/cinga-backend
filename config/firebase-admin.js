// Mock Firebase Admin for development
console.log('🔧 Firebase Admin running in MOCK mode - no actual Firebase connection');

const mockFirebaseAdmin = {
  auth: () => ({
    verifyIdToken: (token) => {
      console.log('🔐 Mock Firebase Auth - verifying token:', token.substring(0, 20) + '...');
      
      // Mock user verification - always return success for testing
      return Promise.resolve({
        uid: '6ZCfMwMeJvMwnMeUErsc6dwdQ993', // FIXED: Changed 'firebase_uid' to 'uid'
        email: 'manager@cinga.com',
        name: 'Cinga Project Manager'
      });
    }
  })
};

module.exports = mockFirebaseAdmin;