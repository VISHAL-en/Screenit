import WebSocket from 'ws';

const WS_URL = process.env.TEST_WS_URL || 'ws://localhost:3001';

async function testRecoveryAndHeartbeat() {
  console.log('--- Starting Screenit Recovery & Heartbeat Tests ---');

  // TEST 1: WebSocket Heartbeat Ping/Pong
  console.log('Test 1: WebSocket Heartbeat Ping/Pong');
  const pingWs = new WebSocket(WS_URL);
  await new Promise((resolve, reject) => {
    pingWs.on('open', () => {
      pingWs.send(JSON.stringify({ type: 'PING' }));
    });
    pingWs.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'PONG') {
        console.log('PASS: Successfully received PONG from server with timestamp', msg.timestamp);
        pingWs.close();
        resolve(null);
      }
    });
    pingWs.on('error', reject);
  });

  // TEST 2: Disconnection Grace Period & Reconnection
  console.log('\nTest 2: Transient Disconnect Grace Period & Reconnection');
  const receiverWs = new WebSocket(WS_URL);
  let sessionCode = '';

  await new Promise((resolve) => {
    receiverWs.on('open', () => receiverWs.send(JSON.stringify({ type: 'REGISTER_RECEIVER' })));
    receiverWs.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'RECEIVER_REGISTERED') {
        sessionCode = msg.code;
        resolve(null);
      }
    });
  });

  let presenterToken = '';
  let presenter1Ws = new WebSocket(WS_URL);
  await new Promise((resolve) => {
    presenter1Ws.on('open', () => {
      presenter1Ws.send(JSON.stringify({ type: 'JOIN_AS_PRESENTER', code: sessionCode }));
    });
    presenter1Ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'PAIR_SUCCESS') {
        presenterToken = msg.token;
        resolve(null);
      }
    });
  });

  // Activate stream
  presenter1Ws.send(JSON.stringify({ type: 'STREAM_ACTIVE' }));
  // Allow server state to update
  await new Promise((r) => setTimeout(r, 100));

  // Listen on receiver for PEER_TEMPORARILY_OFFLINE
  const peerOfflinePromise = new Promise((resolve) => {
    const handler = (data: WebSocket.Data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'PEER_TEMPORARILY_OFFLINE' && msg.role === 'presenter') {
        console.log('PASS: Receiver received PEER_TEMPORARILY_OFFLINE when presenter socket closed');
        receiverWs.off('message', handler);
        resolve(null);
      }
    };
    receiverWs.on('message', handler);
  });

  // Presenter 1 unexpectedly closes socket (transient drop)
  presenter1Ws.close();
  await peerOfflinePromise;

  // Test unauthorized reconnect attempt without valid token
  console.log('Test 2a: Reject unauthorized reconnect attempt with invalid token');
  const rogueWs = new WebSocket(WS_URL);
  await new Promise((resolve) => {
    rogueWs.on('open', () => {
      rogueWs.send(JSON.stringify({ type: 'RECONNECT_PRESENTER', code: sessionCode, token: 'invalid-token' }));
    });
    rogueWs.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'ERROR' && msg.code === 'UNAUTHORIZED') {
        console.log('PASS: Correctly rejected rogue reconnect attempt with UNAUTHORIZED');
        rogueWs.close();
        resolve(null);
      }
    });
  });

  // Listen on receiver for PEER_RECONNECTED
  const peerReconnectedPromise = new Promise((resolve) => {
    const handler = (data: WebSocket.Data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'PEER_RECONNECTED' && msg.role === 'presenter') {
        console.log('PASS: Receiver received PEER_RECONNECTED after genuine presenter re-attached');
        receiverWs.off('message', handler);
        resolve(null);
      }
    };
    receiverWs.on('message', handler);
  });

  // Genuine presenter connects and sends RECONNECT_PRESENTER with sessionCode and valid presenterToken
  const presenter2Ws = new WebSocket(WS_URL);
  await new Promise((resolve, reject) => {
    presenter2Ws.on('open', () => {
      presenter2Ws.send(JSON.stringify({ type: 'RECONNECT_PRESENTER', code: sessionCode, token: presenterToken }));
    });
    presenter2Ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'RECONNECT_SUCCESS') {
        console.log('PASS: Presenter re-attached successfully with RECONNECT_SUCCESS using valid token');
        resolve(null);
      } else if (msg.type === 'ERROR') {
        reject(new Error(`Reconnect failed: ${msg.message}`));
      }
    });
  });

  await peerReconnectedPromise;

  // TEST 3: Intentional STOP_SHARING immediately tears down without waiting for grace period
  console.log('\nTest 3: Intentional STOP_SHARING immediate teardown');
  const disconnectPromise = new Promise((resolve) => {
    const handler = (data: WebSocket.Data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'PRESENTER_DISCONNECTED' && msg.reason === 'Presenter stopped sharing.') {
        console.log('PASS: Receiver received immediate PRESENTER_DISCONNECTED upon intentional stop');
        receiverWs.off('message', handler);
        resolve(null);
      }
    };
    receiverWs.on('message', handler);
  });

  presenter2Ws.send(JSON.stringify({ type: 'STOP_SHARING' }));
  await disconnectPromise;

  receiverWs.close();
  presenter2Ws.close();

  console.log('\n--- ALL RECOVERY & HEARTBEAT TESTS PASSED! ---');
  process.exit(0);
}

testRecoveryAndHeartbeat().catch((err) => {
  console.error('Recovery test failed:', err);
  process.exit(1);
});
