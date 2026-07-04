const tls = require('tls');
const net = require('net');
const crypto = require('crypto');

const HOST = '127.0.0.1', PORT = 15432;
const USER = 'neondb_owner', PASS = 'npg_pokacN9vU4lI', DB = 'neondb';
const SNI_HOST = 'ep-withered-night-aolhm8px.c-2.ap-southeast-1.aws.neon.tech';

function buf(s) { return Buffer.from(s, 'utf8'); }
function b64(s) { return Buffer.from(s).toString('base64'); }
function fromB64(s) { return Buffer.from(s, 'base64'); }
function hmac(k, d) { return crypto.createHmac('sha256', k).update(d).digest(); }
function sha256(d) { return crypto.createHash('sha256').update(d).digest(); }
function xor(a, b) { const r = Buffer.alloc(a.length); for (let i = 0; i < a.length; i++) r[i] = a[i] ^ b[i]; return r; }

let bufIn = Buffer.alloc(0), authOk = false, ready = false, tlsSocket, sqls = [], sqlIdx = 0;
let scramState = null;

function readMsg(data) {
  bufIn = Buffer.concat([bufIn, data]);
  while (bufIn.length >= 5) {
    const msgLen = bufIn.readUInt32BE(1);
    if (bufIn.length < 1 + msgLen) break;
    const type = bufIn[0], msg = bufIn.subarray(0, 1 + msgLen);
    bufIn = bufIn.subarray(1 + msgLen);

    if (type === 0x52) { // R
      const at = msg.readUInt32BE(5);
      if (at === 0) { console.log('✓ Auth OK'); authOk = true; }
      else if (at === 10) { // SASL
        const mechs = msg.subarray(9).toString().split('\0').filter(Boolean);
        console.log('SASL mechs:', mechs);
        const cnonce = crypto.randomBytes(18).toString('base64').replace(/[+/=]/g, '');
        const cFirstBare = 'n=' + USER + ',r=' + cnonce;
        const cFirst = 'n,,' + cFirstBare;
        scramState = { cnonce, cFirstBare };
        // SASLInitialResponse: 'p' + Int32 len + mechanism + Int32 + client-first
        const mech = mechs[0], mechB = buf(mech + '\0');
        const respB = buf(cFirst);
        const m = Buffer.alloc(1 + 4 + mechB.length + 4 + respB.length);
        m[0] = 0x70; m.writeUInt32BE(4 + mechB.length + 4 + respB.length, 1);
        mechB.copy(m, 5);
        m.writeUInt32BE(respB.length, 5 + mechB.length);
        respB.copy(m, 9 + mechB.length);
        tlsSocket.write(m);
      } else if (at === 11) { // SASLContinue
        const sFirst = msg.subarray(5).toString('utf8'); // skip 'R' + Int32 len + Int32 type
        const sFirstReal = msg.subarray(9).toString('utf8');
        console.log('SASL continue:', sFirstReal);
        const parts = Object.fromEntries(sFirstReal.split(',').map(p => [p[0], p.substring(2)]));
        const fullNonce = parts.r, saltB = fromB64(parts.s), iter = parseInt(parts.i);
        const { cnonce, cFirstBare } = scramState;

        const saltedPassword = crypto.pbkdf2Sync(PASS, saltB, iter, 32, 'sha256');
        const clientKey = hmac(saltedPassword, 'Client Key');
        const storedKey = sha256(clientKey);
        const cFinalBareNoProof = 'c=biws,r=' + fullNonce;
        const authMessage = cFirstBare + ',' + sFirstReal + ',' + cFinalBareNoProof;
        const clientSignature = hmac(storedKey, authMessage);
        const clientProof = xor(clientKey, clientSignature);
        const cFinal = cFinalBareNoProof + ',p=' + clientProof.toString('base64');

        // SASLResponse: 'p' + Int32 len + SASL response bytes
        const respB = buf(cFinal);
        const m = Buffer.alloc(1 + 4 + respB.length);
        m[0] = 0x70; m.writeUInt32BE(4 + respB.length, 1); respB.copy(m, 5);
        tlsSocket.write(m);

        scramState.saltedPassword = saltedPassword;
        scramState.authMessage = authMessage;
      } else if (at === 12) { // SASLFinal
        const sFinal = msg.subarray(9).toString('utf8');
        console.log('SASL final:', sFinal);
        const v = sFinal.match(/v=([^,]+)/);
        if (v) {
          const expected = hmac(scramState.saltedPassword, 'Server Key');
          const serverSig = hmac(expected, scramState.authMessage);
          const actualSig = fromB64(v[1]);
          if (serverSig.equals(actualSig)) console.log('✓ SCRAM verified!');
          else console.log('⚠ SCRAM verify failed');
        }
        scramState = null;
        authOk = true;
      }
      else console.log('Auth type:', at, msg.subarray(9).toString().substring(0,50));
    } else if (type === 0x5A) { // Z
      if (authOk && !ready) { ready = true; console.log('✓ Ready for queries!'); runSql(); }
    } else if (type === 0x45) { // E
      let errStr = msg.subarray(6).toString('utf8');
      const parts = errStr.split('\0').filter(Boolean);
      console.log('✗ Error:', parts.join(' | '));
    } else if (type === 0x43) { // C
      console.log('✓', msg.subarray(5, msg.length - 1).toString());
    } else if (type === 0x54 || type === 0x44) { /* RowDescription, DataRow */ }
  }
}

function runSql() {
  while (sqlIdx < sqls.length && !sqls[sqlIdx].trim()) sqlIdx++;
  if (sqlIdx >= sqls.length) { console.log('✓ All SQL executed!'); tlsSocket.end(); setTimeout(() => process.exit(0), 500); return; }
  const stmt = sqls[sqlIdx++];
  const sb = Buffer.from(stmt + '\0', 'utf8');
  const m = Buffer.alloc(1 + 4 + sb.length);
  m[0] = 0x51; m.writeUInt32BE(4 + sb.length, 1); sb.copy(m, 5);
  tlsSocket.write(m);
}

// Connection
const raw = new net.Socket();
raw.on('connect', () => {
  const ssl = Buffer.alloc(8); ssl.writeUInt32BE(8, 0); ssl.writeUInt32BE(80877103, 4); raw.write(ssl);
});
raw.on('data', (data) => {
  if (data[0] === 0x53) {
    tlsSocket = tls.connect({ socket: raw, rejectUnauthorized: false, checkServerIdentity: () => undefined, servername: SNI_HOST });
    tlsSocket.on('secureConnect', () => {
      console.log('✓ TLS (' + SNI_HOST + ')');
      const kvs = 'user\0' + USER + '\0database\0' + DB + '\0';
      const params = Buffer.from(kvs, 'utf8');
      const sm = Buffer.alloc(4 + 4 + params.length);
      sm.writeUInt32BE(4 + 4 + params.length, 0); sm.writeUInt32BE(196608, 4); params.copy(sm, 8);
      tlsSocket.write(sm);
    });
    tlsSocket.on('data', readMsg);
    tlsSocket.on('error', (e) => console.log('TLS err:', e.message));
  }
});
raw.on('error', (e) => { console.log('Sock err:', e.message); process.exit(1); });
raw.connect(PORT, HOST);

setTimeout(() => { console.log('⏰ Timeout'); process.exit(1); }, 20000);
