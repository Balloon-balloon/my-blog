const net = require('net');

function socks5Connect(proxySocket, targetHost, targetPort) {
  return new Promise((resolve, reject) => {
    // Step 1: SOCKS5 greeting
    let state = 0;
    let buf = Buffer.alloc(0);
    
    const onData = (data) => {
      buf = Buffer.concat([buf, data]);
      
      if (state === 0 && buf.length >= 2) {
        // Greeting response: version + method
        if (buf[0] !== 0x05) return reject(new Error('Bad SOCKS version: ' + buf[0]));
        if (buf[1] !== 0x00) return reject(new Error('Auth required: ' + buf[1]));
        state = 1;
        
        // Send CONNECT request
        const hostBuf = Buffer.from(targetHost, 'ascii');
        const req = Buffer.concat([
          Buffer.from([0x05, 0x01, 0x00, 0x03, hostBuf.length]),
          hostBuf,
          Buffer.from([(targetPort >> 8) & 0xff, targetPort & 0xff])
        ]);
        proxySocket.write(req);
        buf = Buffer.alloc(0);
      }
      
      if (state === 1 && buf.length >= 10) {
        // CONNECT response: version + status + reserved + atyp + ... (min 10 bytes)
        if (buf[0] !== 0x05) return reject(new Error('Bad CONNECT version: ' + buf[0]));
        if (buf[1] !== 0x00) return reject(new Error('CONNECT failed: ' + buf[1]));
        
        // Extract BND.ADDR length
        const atyp = buf[3];
        let headerLen = 4;
        if (atyp === 0x01) headerLen += 4 + 2;      // IPv4 + port
        else if (atyp === 0x03) headerLen += 1 + buf[4] + 2;  // domain + port
        else if (atyp === 0x04) headerLen += 16 + 2;  // IPv6 + port
        else return reject(new Error('Unknown ATYP: ' + atyp));
        
        if (buf.length >= headerLen) {
          console.log('SOCKS5 CONNECT success');
          resolve(proxySocket);
        }
      }
    };
    
    proxySocket.on('data', onData);
    proxySocket.on('error', reject);
    
    // Send greeting
    proxySocket.write(Buffer.from([0x05, 0x01, 0x00]));
  });
}

const TARGET_HOST = 'ep-withered-night-aolhm8px.c-2.ap-southeast-1.aws.neon.tech';
const TARGET_PORT = 5432;
const LOCAL_PORT = 15432;

const server = net.createServer((clientSocket) => {
  const clientAddr = clientSocket.remoteAddress + ':' + clientSocket.remotePort;
  console.log('[+] Client:', clientAddr);
  
  const proxySocket = new net.Socket();
  let destroyed = false;
  
  const cleanup = () => {
    if (destroyed) return;
    destroyed = true;
    proxySocket.destroy();
    clientSocket.destroy();
  };
  
  proxySocket.setTimeout(20000);
  clientSocket.setTimeout(20000);
  
  proxySocket.connect(7897, '127.0.0.1', async () => {
    try {
      console.log('  -> Proxy connected, handshaking...');
      await socks5Connect(proxySocket, TARGET_HOST, TARGET_PORT);
      console.log('  -> SOCKS5 tunnel OK, piping...');
      
      clientSocket.pipe(proxySocket);
      proxySocket.pipe(clientSocket);
    } catch (e) {
      console.log('  -> Error:', e.message);
      cleanup();
    }
  });
  
  proxySocket.on('error', (e) => { console.log('  -> Proxy error:', e.message); cleanup(); });
  clientSocket.on('error', (e) => { console.log('  -> Client error:', e.message); cleanup(); });
  proxySocket.on('timeout', () => { console.log('  -> Proxy timeout'); cleanup(); });
  clientSocket.on('timeout', () => { console.log('  -> Client timeout'); cleanup(); });
  clientSocket.on('close', () => { proxySocket.destroy(); });
  proxySocket.on('close', () => { clientSocket.destroy(); });
});

server.listen(LOCAL_PORT, '127.0.0.1', () => {
  console.log('Tunnel running: 127.0.0.1:' + LOCAL_PORT + ' -> ' + TARGET_HOST + ':' + TARGET_PORT);
});
