// Simple test to check if frontend can connect to backend API
const API_URL = 'http://localhost:8000';

async function testAPI() {
  try {
    console.log('Testing API connection...');
    
    const response = await fetch(`${API_URL}/api/rooms`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const rooms = await response.json();
    console.log(`✅ Successfully fetched ${rooms.length} rooms`);
    
    rooms.forEach(room => {
      console.log(`  - ${room.title}: ₹${room.base_price.toLocaleString()}/night`);
    });
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

// Run the test
testAPI();