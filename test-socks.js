const net = require('net');
const s = new net.Socket();
s.setTimeout(8000);
s.on('connect', () => {
  console.log('Connected to proxy');
  s.write(Buffer.from([0x05, 0x01, 0x00]));
});
let step = 0;
s.on('data', (data) => {
  if (step === 0 && data[0] === 0x05) {
    if (data[1] === 0x00) {
      console.log('SOCKS5 auth ok');
      step = 1;
      const targetHost = 'ep-withered-night-aolhm8px.c-2.ap-southeast-1.aws.neon.tech';
      const hostBuf = Buffer.from(targetHost, 'ascii');
      const req = Buffer.concat([
        Buffer.from([0x05, 0x01, 0x00, 0x03, hostBuf.length]),
        hostBuf,
        Buffer.from([(5432 >> 8) & 0xff, 5432 & 0xff])
      ]);
      s.write(req);
    } else {
      console.log('Auth failed, method:', data[1]);
    }
  } else if (step === 1 && data[0] === 0x05) {
    console.log('CONNECT response:', data[1] === 0x00 ? 'Success!' : 'Error code: ' + data[1]);
    console.log('Response bytes:', Array.from(data.slice(0, 10)).map(b => '0x' + b.toString(16)).join(' '));
    if (data[1] === 0x00) console.log('SOCKS5 tunnel established!');
    s.end();
  }
});
s.on('error', (e) => console.log('Error:', e.message));
s.on('timeout', () => console.log('Timeout'));
s.connect(7897, '127.0.0.1');
