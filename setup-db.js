const tls=require("tls"),net=require("net"),crypto=require("crypto"),fs=require("fs"),path=require("path");
const H="127.0.0.1",P=15432,U="neondb_owner",PW="npg_pokacN9vU4lI",DB="neondb",SNI="ep-withered-night-aolhm8px.c-2.ap-southeast-1.aws.neon.tech";
function esc(v){if(v===null||v===undefined)return"NULL";if(typeof v==="boolean")return v?"true":"false";if(typeof v==="number")return String(v);return"'"+String(v).replace(/'/g,"''")+"'"}
function ts(v){return v?"to_timestamp("+(v/1000)+")":"NULL"}
function bo(v){return v===1||v===true?"true":"false"}
let bf=Buffer.alloc(0),ok=false,rdy=false,tsl,sqls=[],idx=0,st=null,errs=[];
function hmac(k,d){return crypto.createHmac("sha256",k).update(d).digest()}
function sha256(d){return crypto.createHash("sha256").update(d).digest()}
function xor(a,b){let r=Buffer.alloc(a.length);for(let i=0;i<a.length;i++)r[i]=a[i]^b[i];return r}
function readMsg(d){bf=Buffer.concat([bf,d]);while(bf.length>=5){let mL=bf.readUInt32BE(1);if(bf.length<1+mL)break;let t=bf[0],m=bf.subarray(0,1+mL);bf=bf.subarray(1+mL);
if(t===0x52){let at=m.readUInt32BE(5);if(at===0){console.log("OK Auth");ok=true}
else if(at===10){let mechs=m.subarray(9).toString().split("\0").filter(Boolean);let cn=crypto.randomBytes(18).toString("base64").replace(/[+/=]/g,"");let cfb="n="+U+",r="+cn;st={cn,cfb};let mb=Buffer.from(mechs[0]+"\0","utf8"),rb=Buffer.from("n,,"+cfb,"utf8");let mm=Buffer.alloc(1+4+mb.length+4+rb.length);mm[0]=0x70;mm.writeUInt32BE(4+mb.length+4+rb.length,1);mb.copy(mm,5);mm.writeUInt32BE(rb.length,5+mb.length);rb.copy(mm,9+mb.length);tsl.write(mm)}
else if(at===11){let sf=m.subarray(9).toString("utf8");let p=Object.fromEntries(sf.split(",").map(x=>[x[0],x.substring(2)]));let sb=Buffer.from(p.s,"base64"),it=parseInt(p.i);let sp=crypto.pbkdf2Sync(PW,sb,it,32,"sha256");let ck=hmac(sp,"Client Key");let sk=sha256(ck);let cb="c=biws,r="+p.r;let am=st.cfb+","+sf+","+cb;let cs=hmac(sk,am);let cf=cb+",p="+xor(ck,cs).toString("base64");let rb=Buffer.from(cf,"utf8");let mm=Buffer.alloc(1+4+rb.length);mm[0]=0x70;mm.writeUInt32BE(4+rb.length,1);rb.copy(mm,5);tsl.write(mm);st.sp=sp;st.am=am}
else if(at===12){let ff=m.subarray(9).toString("utf8");let v=ff.match(/v=([^,]+)/);if(v){let svk=hmac(st.sp,"Server Key");let ss=hmac(svk,st.am);if(Buffer.from(v[1],"base64").equals(ss))console.log("OK SCRAM")}st=null;ok=true}}
else if(t===0x5A){if(ok&&!rdy){rdy=true;runSQL()}else if(ok){runSQL()}}
else if(t===0x45){let p=m.subarray(6).toString("utf8").split("\0").filter(Boolean);console.log("ERR",p.join(" | "));errs.push(p.join(" | "))}
else if(t===0x43){let tag=m.subarray(5,m.length-1).toString();if(tag!=="SELECT 1")console.log("OK",tag)}
else if(t===0x54||t===0x44||t===0x4E||t===0x4B||t===0x53){}}//skip
function runSQL(){while(idx<sqls.length&&!sqls[idx].trim())idx++;if(idx>=sqls.length){console.log((errs.length?"\nWARN "+errs.length+" errors":"\nALL OK!"));tsl.end();setTimeout(()=>process.exit(errs.length?1:0),500);return}
let stmt=sqls[idx++];let sb=Buffer.from(stmt+"\0","utf8");let mm=Buffer.alloc(1+4+sb.length);mm[0]=0x51;mm.writeUInt32BE(4+sb.length,1);sb.copy(mm,5);tsl.write(mm)}
// CREATE TABLES
var creates=[
'CREATE TABLE IF NOT EXISTS "User"("id"SERIAL PRIMARY KEY,"email"TEXT NOT NULL UNIQUE,"username"TEXT NOT NULL UNIQUE,"password"TEXT NOT NULL,"name"TEXT,"avatar"TEXT,"bio"TEXT,"createdAt"TIMESTAMP(3)NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt"TIMESTAMP(3)NOT NULL)',
'CREATE TABLE IF NOT EXISTS "Category"("id"SERIAL PRIMARY KEY,"name"TEXT NOT NULL UNIQUE,"slug"TEXT NOT NULL UNIQUE,"description"TEXT,"createdAt"TIMESTAMP(3)NOT NULL DEFAULT CURRENT_TIMESTAMP)',
'CREATE TABLE IF NOT EXISTS "Tag"("id"SERIAL PRIMARY KEY,"name"TEXT NOT NULL UNIQUE,"slug"TEXT NOT NULL UNIQUE,"createdAt"TIMESTAMP(3)NOT NULL DEFAULT CURRENT_TIMESTAMP)',
'CREATE TABLE IF NOT EXISTS "Post"("id"SERIAL PRIMARY KEY,"title"TEXT NOT NULL,"slug"TEXT NOT NULL UNIQUE,"content"TEXT NOT NULL,"excerpt"TEXT,"published"BOOLEAN NOT NULL DEFAULT false,"viewCount"INTEGER NOT NULL DEFAULT 0,"createdAt"TIMESTAMP(3)NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt"TIMESTAMP(3)NOT NULL,"authorId"INTEGER NOT NULL REFERENCES "User"(id)ON DELETE CASCADE,"categoryId"INTEGER REFERENCES "Category"(id)ON DELETE SET NULL)',
'CREATE TABLE IF NOT EXISTS "Comment"("id"SERIAL PRIMARY KEY,"content"TEXT NOT NULL,"createdAt"TIMESTAMP(3)NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt"TIMESTAMP(3)NOT NULL,"authorId"INTEGER REFERENCES "User"(id)ON DELETE CASCADE,"guestName"TEXT,"guestEmail"TEXT,"guestAvatar"TEXT,"isGuest"BOOLEAN NOT NULL DEFAULT false,"postId"INTEGER NOT NULL REFERENCES "Post"(id)ON DELETE CASCADE,"parentId"INTEGER REFERENCES "Comment"(id)ON DELETE SET NULL)',
'CREATE TABLE IF NOT EXISTS "Like"("id"SERIAL PRIMARY KEY,"createdAt"TIMESTAMP(3)NOT NULL DEFAULT CURRENT_TIMESTAMP,"userId"INTEGER NOT NULL REFERENCES "User"(id)ON DELETE CASCADE,"postId"INTEGER NOT NULL REFERENCES "Post"(id)ON DELETE CASCADE,UNIQUE("userId","postId"))',
'CREATE TABLE IF NOT EXISTS "Favorite"("id"SERIAL PRIMARY KEY,"createdAt"TIMESTAMP(3)NOT NULL DEFAULT CURRENT_TIMESTAMP,"userId"INTEGER NOT NULL REFERENCES "User"(id)ON DELETE CASCADE,"postId"INTEGER NOT NULL REFERENCES "Post"(id)ON DELETE CASCADE,UNIQUE("userId","postId"))',
'CREATE TABLE IF NOT EXISTS "_PostToTag"("A"INTEGER NOT NULL REFERENCES "Post"(id)ON DELETE CASCADE,"B"INTEGER NOT NULL REFERENCES "Tag"(id)ON DELETE CASCADE,PRIMARY KEY("A","B"))',
'CREATE INDEX IF NOT EXISTS "_PostToTag_B_index"ON "_PostToTag"("B")'];
for(let c of creates)sqls.push(c);
// SEED DATA
const sp=path.join(__dirname,"prisma","seed-data.json");
if(fs.existsSync(sp)){const sd=JSON.parse(fs.readFileSync(sp,"utf8"));
for(let u of sd.User||[]){sqls.push("INSERT INTO \"User\"(id,email,username,password,name,avatar,bio,\"createdAt\",\"updatedAt\")VALUES("+u.id+","+esc(u.email)+","+esc(u.username)+","+esc(u.password)+","+esc(u.name)+","+esc(u.avatar)+","+esc(u.bio)+","+ts(u.createdAt)+","+ts(u.updatedAt)+")ON CONFLICT(id)DO NOTHING")}
for(let c of sd.Category||[]){sqls.push("INSERT INTO \"Category\"(id,name,slug,description,\"createdAt\")VALUES("+c.id+","+esc(c.name)+","+esc(c.slug)+","+esc(c.description)+","+ts(c.createdAt)+")ON CONFLICT(id)DO NOTHING")}
for(let p of sd.Post||[]){sqls.push("INSERT INTO \"Post\"(id,title,slug,content,excerpt,\"published\",\"viewCount\",\"createdAt\",\"updatedAt\",\"authorId\",\"categoryId\")VALUES("+p.id+","+esc(p.title)+","+esc(p.slug)+","+esc(p.content)+","+esc(p.excerpt)+","+bo(p.published)+","+p.viewCount+","+ts(p.createdAt)+","+ts(p.updatedAt)+","+p.authorId+","+(p.categoryId||"NULL")+")ON CONFLICT(id)DO NOTHING")}
for(let t of sd.Tag||[]){sqls.push("INSERT INTO \"Tag\"(id,name,slug,\"createdAt\")VALUES("+t.id+","+esc(t.name)+","+esc(t.slug)+","+ts(t.createdAt)+")ON CONFLICT(id)DO NOTHING")}
for(let r of sd._PostToTag||[]){sqls.push("INSERT INTO \"_PostToTag\"(\"A\",\"B\")VALUES("+r.A+","+r.B+")ON CONFLICT DO NOTHING")}
for(let cm of sd.Comment||[]){sqls.push("INSERT INTO \"Comment\"(id,content,\"createdAt\",\"updatedAt\",\"authorId\",\"guestName\",\"guestEmail\",\"guestAvatar\",\"isGuest\",\"postId\",\"parentId\")VALUES("+cm.id+","+esc(cm.content)+","+ts(cm.createdAt)+","+ts(cm.updatedAt)+","+esc(cm.authorId)+","+esc(cm.guestName)+","+esc(cm.guestEmail)+","+esc(cm.guestAvatar)+","+bo(cm.isGuest)+","+cm.postId+","+(cm.parentId||"NULL")+")ON CONFLICT(id)DO NOTHING")}
for(let l of sd.Like||[]){sqls.push("INSERT INTO \"Like\"(id,\"createdAt\",\"userId\",\"postId\")VALUES("+l.id+","+ts(l.createdAt)+","+l.userId+","+l.postId+")ON CONFLICT(id)DO NOTHING")}
for(let f of sd.Favorite||[]){sqls.push("INSERT INTO \"Favorite\"(id,\"createdAt\",\"userId\",\"postId\")VALUES("+f.id+","+ts(f.createdAt)+","+f.userId+","+f.postId+")ON CONFLICT(id)DO NOTHING")}
// Update sequences with corrected quoting
for(let tb of["User","Category","Post","Tag","Comment","Like","Favorite"]){let items=sd[tb]||[];if(items.length>0){
let mx=Math.max(...items.map(i=>i.id));
let seqName='"' + tb + '_id_seq"';
sqls.push("SELECT setval('" + seqName + "'," + mx + ",true)");}}}
console.log("SQL: "+sqls.length+" | Seed: loaded");
// Connect
const raw=new net.Socket();
raw.on("connect",()=>{let ssl=Buffer.alloc(8);ssl.writeUInt32BE(8,0);ssl.writeUInt32BE(80877103,4);raw.write(ssl)});
raw.on("data",(d)=>{if(d[0]===0x53){tsl=tls.connect({socket:raw,rejectUnauthorized:false,checkServerIdentity:()=>undefined,servername:SNI});tsl.on("secureConnect",()=>{console.log("OK TLS");let kv="user\0"+U+"\0database\0"+DB+"\0";let p=Buffer.from(kv,"utf8");let sm=Buffer.alloc(4+4+p.length);sm.writeUInt32BE(4+4+p.length,0);sm.writeUInt32BE(196608,4);p.copy(sm,8);tsl.write(sm)});tsl.on("data",readMsg);tsl.on("error",e=>console.log("ERR TLS:",e.message))}});
raw.on("error",e=>{console.log("ERR Sock:",e.message);process.exit(1)});
raw.connect(P,H);
setTimeout(()=>{console.log("Timeout after "+idx+"/"+sqls.length);process.exit(1)},30000);