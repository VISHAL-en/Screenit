import WebSocket from 'ws';

const WS_URL = process.env.TEST_WS_URL || 'ws://localhost:3001';

async function testSecurityAndValidation() {
  console.log('--- Starting Security & Validation Tests ---');

  // Test 1: Non-existent code
  const ws1 = new WebSocket(WS_URL);
  await new Promise((resolve) => {
    ws1.on('open', () => {
      ws1.send(JSON.stringify({ type: 'JOIN_AS_PRESENTER', code: '0000' }));
    });
    ws1.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'ERROR' && msg.code === 'CODE_NOT_FOUND') {
        console.log('PASS: Correctly rejected non-existent code 0000');
        resolve(null);
      }
    });
  });
  ws1.close();

  // Test 2: Invalid code format
  const ws2 = new WebSocket(WS_URL);
  await new Promise((resolve) => {
    ws2.on('open', () => {
      ws2.send(JSON.stringify({ type: 'JOIN_AS_PRESENTER', code: 'abcd' }));
    });
    ws2.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'ERROR' && msg.code === 'INVALID_CODE_FORMAT') {
        console.log('PASS: Correctly rejected non-numeric code format');
        resolve(null);
      }
    });
  });
  ws2.close();

  // Test 3: Malformed JSON
  const ws3 = new WebSocket(WS_URL);
  await new Promise((resolve) => {
    ws3.on('open', () => {
      ws3.send('this is not json');
    });
    ws3.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'ERROR' && msg.code === 'MALFORMED_MESSAGE') {
        console.log('PASS: Correctly handled malformed message');
        resolve(null);
      }
    });
  });
  ws3.close();

  // Test 4: Prevent second presenter taking over active receiver
  const receiverWs = new WebSocket(WS_URL);
  let activeCode = '';
  await new Promise((resolve) => {
    receiverWs.on('open', () => receiverWs.send(JSON.stringify({ type: 'REGISTER_RECEIVER' })));
    receiverWs.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'RECEIVER_REGISTERED') {
        activeCode = msg.code;
        resolve(null);
      }
    });
  });

  const presenter1Ws = new WebSocket(WS_URL);
  await new Promise((resolve) => {
    presenter1Ws.on('open', () => presenter1Ws.send(JSON.stringify({ type: 'JOIN_AS_PRESENTER', code: activeCode })));
    presenter1Ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'PAIR_SUCCESS') {
        console.log(`PASS: Presenter 1 paired with ${activeCode}`);
        resolve(null);
      }
    });
  });

  const presenter2Ws = new WebSocket(WS_URL);
  await new Promise((resolve) => {
    presenter2Ws.on('open', () => presenter2Ws.send(JSON.stringify({ type: 'JOIN_AS_PRESENTER', code: activeCode })));
    presenter2Ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'ERROR' && msg.code === 'ALREADY_CONNECTED') {
        console.log('PASS: Presenter 2 rejected because receiver is already paired');
        resolve(null);
      }
    });
  });

  receiverWs.close();
  presenter1Ws.close();
  presenter2Ws.close();

  console.log('--- ALL SECURITY & VALIDATION TESTS PASSED! ---');
  process.exit(0);
}

testSecurityAndValidation().catch((err) => {
  console.error('Validation test failed:', err);
  process.exit(1);
});
