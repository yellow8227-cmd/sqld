const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];
const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('http://localhost:8765/index.html');await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(500);
const st=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('sqld.v1')));
// 1) 문제풀이: 맞힘 → 찍었어요 → 오답노트
const id=await p.$eval('.qid',e=>e.textContent);const a=await p.evaluate(i=>window.QB.find(q=>q.id===i).a,id);
await p.click(`.opt[data-i="${a}"]`);await p.waitForTimeout(150);
const btn1=await p.textContent('.guess');
await p.click('.guess');await p.waitForTimeout(100);
let s1=await st();const r1={inWrong:s1.wrong.includes(id),guess:s1.log[id].guess,btn:await p.textContent('.guess')};
await p.evaluate(()=>document.querySelector('.guess').scrollIntoView({block:'center'}));await p.screenshot({path:'/tmp/sqld-guess.png'});
// 취소
await p.click('.guess');let s2=await st();const r2={inWrong:s2.wrong.includes(id),guess:!!s2.log[id].guess,last:s2.log[id].last,streak:s2.log[id].streak};
// 다시 넣고 오답노트 확인
await p.click('.guess');
await p.click('.tabs button[data-mode="wrong"]');await p.waitForTimeout(200);
const r3={first:await p.$eval('.qid',e=>e.textContent),why:await p.$eval('.qtop .pill:not(.sub)',e=>e.title)};
// 2) 모의고사: 1번 찍음 표시 + 정답, 제출
await p.click('.tabs button[data-mode="mock"]');await p.click('[data-set="1"]');
const mid=await p.evaluate(()=>JSON.parse(localStorage.getItem('sqld.v1')).mock.ids[0]);const ma=await p.evaluate(i=>window.QB.find(q=>q.id===i).a,mid);
await p.click('#mark-guess');await p.click(`.opt[data-i="${ma}"]`);
await p.click('#mock-submit');await p.waitForTimeout(200);
const s4=await st();const r4={mid,inWrong:s4.wrong.includes(mid),guess:s4.log[mid].guess,note:await p.textContent('.panel.frame p.small')};
console.log(JSON.stringify({btn1,r1,r2,r3,r4,errs},null,1));await b.close();})();
