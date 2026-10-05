import WebSocket from 'ws';

const WS_URL = process.env.TEST_WS_URL || 'ws://localhost:3001';

async function testSignalingFlow() {
  console.log('--- Starting Screenit Signaling Verification Test ---');

  // 1. Receiver connects
  const receiverWs = new WebSocket(WS_URL);
  let pairingCode = '';

  await new Promise((resolve) => {
    receiverWs.on('open', () => {
      console.log('1. [Receiver] Connected to signaling server');
      receiverWs.send(JSON.stringify({ type: 'REGISTER_RECEIVER' }));
    });

    receiverWs.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'RECEIVER_REGISTERED') {
        pairingCode = msg.code;
        console.log(`2. [Receiver] Received 4-digit pairing code: ${pairingCode}`);
        if (!/^\d{4}$/.test(pairingCode)) {
          throw new Error(`Expected 4-digit code, got ${pairingCode}`);
        }
        resolve(null);
      }
    });
  });

  // 2. Presenter connects and pairs
  const presenterWs = new WebSocket(WS_URL);

  const presenterJoinedPromise = new Promise((resolve) => {
    const handler = (data: WebSocket.Data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'PRESENTER_JOINED') {
        console.log('3. [Receiver] Received PRESENTER_JOINED notification');
        receiverWs.off('message', handler);
        resolve(null);
      }
    };
    receiverWs.on('message', handler);
  });

  await new Promise((resolve, reject) => {
    presenterWs.on('open', () => {
      console.log('4. [Presenter] Connected to signaling server, sending code');
      presenterWs.send(JSON.stringify({ type: 'JOIN_AS_PRESENTER', code: pairingCode }));
    });

    presenterWs.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'PAIR_SUCCESS') {
        console.log(`5. [Presenter] Pair success confirmed for code: ${msg.code}`);
        resolve(null);
      } else if (msg.type === 'ERROR') {
        reject(new Error(`Presenter error: ${msg.message}`));
      }
    });
  });

  await presenterJoinedPromise;

  // 3. Test Offer -> Answer signaling
  const mockOffer = { type: 'offer', sdp: 'v=0\r\no=mock-presenter 12345 2 IN IP4 127.0.0.1' };
  const mockAnswer = { type: 'answer', sdp: 'v=0\r\no=mock-receiver 67890 2 IN IP4 127.0.0.1' };

  await new Promise((resolve) => {
    const receiverHandler = (data: WebSocket.Data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'SIGNAL_OFFER') {
        console.log('6. [Receiver] Received SIGNAL_OFFER from Presenter');
        receiverWs.off('message', receiverHandler);
        receiverWs.send(JSON.stringify({ type: 'SIGNAL_ANSWER', sdp: mockAnswer }));
      }
    };
    receiverWs.on('message', receiverHandler);

    const presenterHandler = (data: WebSocket.Data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'SIGNAL_ANSWER') {
        console.log('7. [Presenter] Received SIGNAL_ANSWER from Receiver');
        presenterWs.off('message', presenterHandler);
        resolve(null);
      }
    };
    presenterWs.on('message', presenterHandler);

    presenterWs.send(JSON.stringify({ type: 'SIGNAL_OFFER', sdp: mockOffer }));
  });

  // 4. Test ICE Candidate exchange
  const mockCandidate = { candidate: 'candidate:1 1 UDP 2130706431 192.168.1.100 50000 typ host', sdpMid: '0' };
  await new Promise((resolve) => {
    const handler = (data: WebSocket.Data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'SIGNAL_ICE') {
        console.log('8. [Receiver] Received SIGNAL_ICE from Presenter');
        receiverWs.off('message', handler);
        resolve(null);
      }
    };
    receiverWs.on('message', handler);

    presenterWs.send(JSON.stringify({ type: 'SIGNAL_ICE', candidate: mockCandidate }));
  });

  // 5. Test Stop Sharing & Session Cleanup
  await new Promise((resolve) => {
    const handler = (data: WebSocket.Data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'PRESENTER_DISCONNECTED') {
        console.log(`9. [Receiver] Received PRESENTER_DISCONNECTED: "${msg.reason}"`);
        receiverWs.off('message', handler);
        resolve(null);
      }
    };
    receiverWs.on('message', handler);

    console.log('10. [Presenter] Stopping sharing');
    presenterWs.send(JSON.stringify({ type: 'STOP_SHARING' }));
  });

  receiverWs.close();
  presenterWs.close();

  console.log('--- ALL SIGNALING TESTS PASSED PERFECTLY! ---');
  process.exit(0);
}

testSignalingFlow().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
