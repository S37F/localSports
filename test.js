const axios = require('axios');
const { io } = require('socket.io-client');

async function testPhase5() {
  try {
    // 1. Create User A
    const resA = await axios.post('http://localhost:5000/api/auth/register', {
        name: `UserA ${Date.now()}`,
        email: `usera${Date.now()}@test.com`,
        password: 'password'
    });
    const tokenA = resA.data.data.accessToken;
    const userA = resA.data.data.user;

    // 2. Create User B
    const resB = await axios.post('http://localhost:5000/api/auth/register', {
        name: `UserB ${Date.now()}`,
        email: `userb${Date.now()}@test.com`,
        password: 'password'
    });
    const tokenB = resB.data.data.accessToken;
    const userB = resB.data.data.user;

    console.log('Created User A and User B');

    // 3. User A sends Play Request to User B
    const reqRes = await axios.post('http://localhost:5000/api/requests', {
        receiverId: userB._id,
        gameId: 'Tennis',
        message: 'Let us play'
    }, { headers: { Authorization: `Bearer ${tokenA}` }});
    const requestId = reqRes.data.data._id;
    console.log('User A created Play Request');

    // 4. User B accepts Play Request -> this should auto-create a Conversation
    await axios.put(`http://localhost:5000/api/requests/${requestId}/accept`, {}, {
        headers: { Authorization: `Bearer ${tokenB}` }
    });
    console.log('User B accepted request');

    // 5. User A checks Conversation list
    const convListRes = await axios.get('http://localhost:5000/api/chat/conversations', {
        headers: { Authorization: `Bearer ${tokenA}` }
    });
    if (convListRes.data.data.length === 0) {
        throw new Error('Conversation was not auto-created');
    }
    const conversation = convListRes.data.data[0];
    console.log('Conversation auto-created successfully. ID:', conversation._id);

    // 6. Test Socket.io message send/receive
    const socketA = io('http://localhost:5000');
    const socketB = io('http://localhost:5000');

    await new Promise((resolve) => {
        let connected = 0;
        socketA.on('connect', () => { connected++; if(connected === 2) resolve(); });
        socketB.on('connect', () => { connected++; if(connected === 2) resolve(); });
    });

    socketA.emit('joinConversation', conversation._id);
    socketB.emit('joinConversation', conversation._id);
    
    // Listen on B for message from A
    socketB.on('newMessage', (msg) => {
        if(msg.text === 'Hello via Socket') {
            console.log('✅ Socket.io message correctly received by User B!');
            socketA.disconnect();
            socketB.disconnect();
            console.log('✅ Phase 5 Chat tests fully passed.');
            process.exit(0);
        }
    });

    // Send from A
    socketA.emit('sendMessage', {
        conversationId: conversation._id,
        senderId: userA._id,
        text: 'Hello via Socket'
    });

    // Timeout fallback
    setTimeout(() => {
        console.error('Socket message timeout');
        process.exit(1);
    }, 5000);

  } catch (err) {
    console.error('Test failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

testPhase5();
