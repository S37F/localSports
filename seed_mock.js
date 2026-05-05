/**
 * Registers mock accounts and completes their profiles via the LocalSports API.
 * Start MongoDB + the backend first (`cd server && npm run dev`).
 *
 * Usage: node seed_mock.js
 */
const API_ROOT = process.env.API_URL || 'http://localhost:5000/api';

const MOCK_USERS = [
  {
    name: 'Ananya Rao',
    email: 'ananya.seed@example.com',
    password: 'Seed123!',
    profile: {
      preferredGames: ['Badminton', 'Table Tennis'],
      skillLevel: 'intermediate',
      availability: {
        days: ['Saturday', 'Sunday'],
        slots: ['morning', 'evening'],
      },
      preferredLocations: ['clubhouse', 'local_ground'],
      location: { area: 'Bandra West, Mumbai', coordinates: [72.8267, 19.054] },
      bio: 'Weekend rallies and doubles — looking for intermediate partners.',
    },
  },
  {
    name: 'Vikram Mehta',
    email: 'vikram.seed@example.com',
    password: 'Seed123!',
    profile: {
      preferredGames: ['Chess', 'Carrom'],
      skillLevel: 'advanced',
      availability: {
        days: ['Monday', 'Wednesday', 'Friday'],
        slots: ['evening'],
      },
      preferredLocations: ['home', 'clubhouse'],
      location: { area: 'Andheri West, Mumbai', coordinates: [72.8311, 19.1378] },
      bio: 'Rapid chess and serious carrom — evenings work best.',
    },
  },
  {
    name: 'Neha Khanna',
    email: 'neha.seed@example.com',
    password: 'Seed123!',
    profile: {
      preferredGames: ['Badminton', 'Cards'],
      skillLevel: 'beginner',
      availability: {
        days: ['Tuesday', 'Thursday'],
        slots: ['afternoon'],
      },
      preferredLocations: ['local_ground'],
      location: { area: 'Powai, Mumbai', coordinates: [72.9094, 19.118] },
      bio: 'New to badminton — happy to learn with patient partners.',
    },
  },
  {
    name: 'Rahul Nair',
    email: 'rahul.seed@example.com',
    password: 'Seed123!',
    profile: {
      preferredGames: ['Cricket', 'Table Tennis'],
      skillLevel: 'intermediate',
      availability: {
        days: ['Saturday'],
        slots: ['morning', 'afternoon'],
      },
      preferredLocations: ['clubhouse', 'local_ground'],
      location: { area: 'Worli, Mumbai', coordinates: [72.815, 19.012] },
      bio: 'Box cricket on weekends; TT on society tables.',
    },
  },
];

async function registerUser({ name, email, password }) {
  const res = await fetch(`${API_ROOT}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email,
      password,
      confirmPassword: password,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `Register failed (${res.status})`);
  }
  return body.data;
}

async function completeProfile(accessToken, profile) {
  const res = await fetch(`${API_ROOT}/profile/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(profile),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `Profile update failed (${res.status})`);
  }
  return body;
}

async function main() {
  console.log(`Using API: ${API_ROOT}\n`);

  for (const mock of MOCK_USERS) {
    try {
      const { accessToken } = await registerUser(mock);
      await completeProfile(accessToken, mock.profile);
      console.log(`✅ Seeded: ${mock.name} <${mock.email}>`);
    } catch (err) {
      if (String(err.message).includes('already exists')) {
        console.log(`⏭️  Skipped (exists): ${mock.email}`);
      } else {
        console.error(`❌ ${mock.email}:`, err.message);
      }
    }
  }

  console.log('\nDone. Log in with any seed email and password Seed123!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
