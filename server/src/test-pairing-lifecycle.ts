import WebSocket from 'ws';

const WS_URL = process.env.TEST_WS_URL || 'ws://localhost:3001';

async function testPairingLifecycle() {
  console.log('--- Starting Pairing Lifecycle & Resilience Tests ---');

  // 1. Immediate pairing code generation on registration
  console.log('Test 1: Verify immediate 4-digit code generation on registration');
  const receiverWs = new WebSocket(WS_URL);
  let pairingCode = '';

  const regStart = Date.now();
  await new Promise((resolve, reject) => {
    receiverWs.on('open', () => {
      receiverWs.send(JSON.stringify({ type: 'REGISTER_RECEIVER' }));
    });
    receiverWs.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'RECEIVER_REGISTERED') {
        const elapsed = Date.now() - regStart;
        pairingCode = msg.code;
        console.log(`PASS: Code ${pairingCode} registered in ${elapsed}ms`);
        if (!/^\d{4}$/.test(pairingCode)) {
          reject(new Error(`Invalid code format: ${pairingCode}`));
          return;
        }
        resolve(null);
      }
    });
    receiverWs.on('error', reject);
  });

  // 2. Invalid code attempt does not disturb receiver
  console.log('\nTest 2: Verify invalid code attempt does not disturb active receiver');
  const invalidPresenterWs = new WebSocket(WS_URL);
  await new Promise((resolve) => {
    invalidPresenterWs.on('open', () => {
      invalidPresenterWs.send(JSON.stringify({ type: 'JOIN_AS_PRESENTER', code: '9999' === pairingCode ? '9998' : '9999' }));
    });
    invalidPresenterWs.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'ERROR' && msg.code === 'CODE_NOT_FOUND') {
        console.log('PASS: Correctly rejected invalid code with CODE_NOT_FOUND without affecting receiver');
        invalidPresenterWs.close();
        resolve(null);
      }
    });
  });

  // 3. Presenter disconnect during pairing resets session to waiting (does not destroy session)
  console.log('\nTest 3: Presenter closing during pairing leaves session in waiting state for retry');
  const tempPresenterWs = new WebSocket(WS_URL);
  const presenterCancelledPromise = new Promise((resolve) => {
    const handler = (data: WebSocket.Data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'PRESENTER_DISCONNECTED' && msg.reason === 'Presenter cancelled pairing.') {
        console.log('PASS: Receiver received notification that presenter cancelled pairing');
        receiverWs.off('message', handler);
        resolve(null);
      }
    };
    receiverWs.on('message', handler);
  });

  await new Promise((resolve) => {
    tempPresenterWs.on('open', () => {
      tempPresenterWs.send(JSON.stringify({ type: 'JOIN_AS_PRESENTER', code: pairingCode }));
    });
    tempPresenterWs.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'PAIR_SUCCESS') {
        console.log('Presenter paired temporarily, now abruptly closing before stream starts');
        tempPresenterWs.close();
        resolve(null);
      }
    });
  });

  await presenterCancelledPromise;

  // 4. Same pairing code can be paired again by the presenter
  console.log('\nTest 4: Presenter reconnecting with the SAME pairing code succeeds');
  const realPresenterWs = new WebSocket(WS_URL);

  const presenterJoinedPromise = new Promise((resolve) => {
    const handler = (data: WebSocket.Data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'PRESENTER_JOINED') {
        console.log('PASS: Receiver received PRESENTER_JOINED notification on re-pair');
        receiverWs.off('message', handler);
        resolve(null);
      }
    };
    receiverWs.on('message', handler);
  });

  await new Promise((resolve, reject) => {
    realPresenterWs.on('open', () => {
      realPresenterWs.send(JSON.stringify({ type: 'JOIN_AS_PRESENTER', code: pairingCode }));
    });
    realPresenterWs.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'PAIR_SUCCESS') {
        console.log(`PASS: Presenter successfully re-paired with same code: ${msg.code}`);
        resolve(null);
      } else if (msg.type === 'ERROR') {
        reject(new Error(`Failed to re-pair with code: ${msg.message}`));
      }
    });
  });

  await presenterJoinedPromise;

  // 5. Test SDP Offer with nested object structure and Answer exchange
  console.log('\nTest 5: Verify Offer/Answer SDP formatting compatibility');
  const sdpOffer = { type: 'offer', sdp: 'v=0\r\no=screenit-source 100 2 IN IP4 127.0.0.1' };
  const sdpAnswer = { type: 'answer', sdp: 'v=0\r\no=screenit-target 200 2 IN IP4 127.0.0.1' };

  await new Promise((resolve) => {
    const recHandler = (data: WebSocket.Data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'SIGNAL_OFFER') {
        console.log('PASS: Receiver received SIGNAL_OFFER with sdp structure');
        receiverWs.off('message', recHandler);
        receiverWs.send(JSON.stringify({ type: 'SIGNAL_ANSWER', sdp: sdpAnswer }));
      }
    };
    receiverWs.on('message', recHandler);

    const presHandler = (data: WebSocket.Data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'SIGNAL_ANSWER') {
        console.log('PASS: Presenter received SIGNAL_ANSWER with sdp structure');
        realPresenterWs.off('message', presHandler);
        resolve(null);
      }
    };
    realPresenterWs.on('message', presHandler);

    realPresenterWs.send(JSON.stringify({ type: 'SIGNAL_OFFER', sdp: sdpOffer }));
  });

  // 6. Test ICE candidate routing with nested object candidate
  console.log('\nTest 6: Verify ICE candidate routing with candidate object');
  const iceCand = { candidate: 'candidate:1 1 UDP 2130706431 192.168.1.1 50000 typ host', sdpMid: '0', sdpMLineIndex: 0 };
  await new Promise((resolve) => {
    const recHandler = (data: WebSocket.Data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'SIGNAL_ICE') {
        console.log('PASS: Receiver received SIGNAL_ICE candidate object:', msg.candidate.candidate);
        receiverWs.off('message', recHandler);
        resolve(null);
      }
    };
    receiverWs.on('message', recHandler);
    realPresenterWs.send(JSON.stringify({ type: 'SIGNAL_ICE', candidate: iceCand }));
  });

  // Cleanup
  receiverWs.close();
  realPresenterWs.close();

  console.log('\n--- ALL PAIRING LIFECYCLE TESTS PASSED! ---');
  process.exit(0);
}

testPairingLifecycle().catch((err) => {
  console.error('Lifecycle test failed:', err);
  process.exit(1);
});
