const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];
const p=await b.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8765/index.html');
const top=async()=>({today:(await p.textContent('#daygoal .dg-top b')),stat:await p.textContent('#statline')});
const out={};
// A) 처음 온 사람
await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(400);out.fresh=await top();
// B) 아침 버전부터 쓴 사람: 시각 없는 기록 4문항(총 7회 풀이, 4회 정답) + 시각 있는 오늘 기록 2문항(각 1회) + 버그 버전이 남긴 오늘 3
await p.evaluate(()=>{const t=Date.now();localStorage.clear();localStorage.setItem('sqld.v1',JSON.stringify({
 log:{S01:{n:2,ok:1,last:1},S02:{n:3,ok:2,last:1},S03:{n:1,ok:0,last:0},M01:{n:1,ok:1,last:1},S10:{n:1,ok:1,last:1,t:t-60e3,streak:1,due:t+3*864e5},S11:{n:1,ok:0,last:0,t:t-30e3,streak:0,due:t+864e5}},
 wrong:['S03','S11'],known:[],hist:[],bank:window.QB.map(q=>q.id),day:{[new Date().toISOString().slice(0,10)]:{n:3,ok:2,back:3}}}))});
await p.reload();await p.waitForTimeout(400);out.early=await top();
// 다시 열어도 두 번 세지 않는지
await p.reload();await p.waitForTimeout(400);out.reload=await top();
// 한 문제 더 풀면 +1
await p.click('.opt[data-i="0"]');await p.waitForTimeout(150);out.plus1=await top();
console.log(JSON.stringify({out,errs},null,1));await b.close();})();
