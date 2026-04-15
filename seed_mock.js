const axios = require('axios');

async function seedProfiles() {
  try {
    for (let i = 1; i <= 3; i++) {
       const res = await axios.post('http://localhost:5000/api/auth/register', {
        name: `Mock Player ${i}`,
        email: `mock${i}_${Date.now()}@example.com`,
        password: 'password123',
        confirmPassword: 'password123'
      });
      const token = res.data.data.accessToken;

      await axios.put('http://localhost:5000/api/profile/me', {
        preferredGames: ['Badminton', 'Chess'],
        skillLevel: 'intermediate',
        availability: { days: ['Saturday', 'Sunday'], slots: ['morning'] },
        preferredLocations: ['local_ground'],
        location: { area: 'Bandra West, Mumbai', coordinates: [72.83, 19.06] } // Coordinates near Mumbai
      }, { headers: { Authorization: 'Bearer ' + token } });
      
      console.log(`✅ Seeded Mock Player ${i}`);
    }
    console.log('Finished seeding test profiles');
  } catch (err) {
    console.error('Seed failed:', err.response ? err.response.data : err.message);
  }
}

seedProfiles();
