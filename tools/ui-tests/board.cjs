// 풀이 보드: 2과목에서만 보이고, 문항마다 따로 기억하고, 넓은 화면은 오른쪽 고정·좁은 화면은 펼쳐 쓰기
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];const out={};
async function draw(p,dx){const c=await p.$('.board canvas');const r=await c.boundingBox();
  await p.mouse.move(r.x+20,r.y+30);await p.mouse.down();for(let i=1;i<=10;i++)await p.mouse.move(r.x+20+i*dx,r.y+30+i*8);await p.mouse.up();}
const ink=p=>p.evaluate(()=>{const c=document.querySelector('.board canvas');const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;return n;});
for(const [w,h] of [[1280,860],[390,844]]){
  const p=await b.newPage({viewport:{width:w,height:h}});p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
  await p.goto('http://localhost:8765/index.html');await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(400);
  await p.click('[data-subj="1"]');await p.waitForTimeout(150);
  const r={};r.s1Hidden=await p.evaluate(()=>{const e=document.querySelector('.board');return !e||e.hidden||!e.isConnected}).catch(()=>'none');
  await p.click('[data-subj="2"]');await p.waitForTimeout(200);
  if(w<1100){r.toggle=await p.textContent('.bd-toggle');await p.click('.bd-toggle');await p.waitForTimeout(150);}
  r.visible=await p.$eval('.board',e=>!e.hidden&&e.getBoundingClientRect().width>0);
  const id1=await p.$eval('.qid',e=>e.textContent);
  await draw(p,12);r.ink1=await ink(p);
  await draw(p,6);await p.click('[data-act="undo"]');r.afterUndo=await ink(p);
  await p.click('[data-act="memo"]');await p.fill('.bd-memo','2번 행 NULL');await p.click('[data-tool="pen"][data-color="ink"]');
  const qb=await p.$eval('.q, .qbody, .qtop',e=>{const r=e.closest('.panel')?.getBoundingClientRect()||e.getBoundingClientRect();return [r.left,r.right];});
  const bb=await p.$eval('.board',e=>{const r=e.getBoundingClientRect();return [r.left,r.right,r.top,r.bottom];});
  r.overlap=w>=1100?bb[0]<qb[1]:null;r.boardBox=bb;
  r.hscroll=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  await p.screenshot({path:`/tmp/sqld-shots/board-${w}.png`});
  await p.click('[data-nav="1"]');await p.waitForTimeout(200);
  r.nextBlank=await ink(p);
  await p.click('[data-nav="-1"]');await p.waitForTimeout(200);
  r.backId=(await p.$eval('.qid',e=>e.textContent))===id1;r.backInk=await ink(p);
  r.memoKept=await p.evaluate(()=>document.querySelector('.bd-memo').value);
  // 다크 테마
  await p.evaluate(()=>document.documentElement.setAttribute('data-theme','dark'));await p.waitForTimeout(100);r.darkInk=await ink(p);
  // 개념 탭 → 숨김
  await p.click('.tabs button[data-mode="concept"]');await p.waitForTimeout(150);r.conceptHidden=await p.evaluate(()=>{const e=document.querySelector('.board');return !e||e.hidden||!e.isConnected});
  // 모의고사
  await p.click('.tabs button[data-mode="mock"]');await p.click('[data-set="1"]');await p.waitForTimeout(200);
  r.mockQ1Hidden=await p.evaluate(()=>{const e=document.querySelector('.board');return !e||e.hidden||!e.isConnected}); // 1번은 1과목
  for(let i=0;i<10;i++){await p.click('[data-nav="1"]');await p.waitForTimeout(60);}
  r.mockQ11Visible=await p.evaluate(()=>{const e=document.querySelector('.board');return !!e&&!e.hidden});
  const eb=await p.$eval('#exambar',e=>e.getBoundingClientRect().top);const bd=await p.evaluate(()=>document.querySelector('.board')?.getBoundingClientRect().bottom);
  r.aboveExambar=w>=1100?bd<=eb:null;
  await p.screenshot({path:`/tmp/sqld-shots/board-mock-${w}.png`});
  out[w]=r;await p.close();}
console.log(JSON.stringify({out,errs},null,1));await b.close();})();
