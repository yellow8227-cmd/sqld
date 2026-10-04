const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();
await ctx.addInitScript(()=>{const off=864e5;const D=Date;class F extends D{constructor(...a){super(...(a.length?a:[D.now()+off]))}static now(){return D.now()+off}};window.Date=F;});
const p=await ctx.newPage();await p.goto('http://localhost:8765/index.html');
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sqld.v1',JSON.stringify({log:{S01:{n:2,ok:1,last:1},S02:{n:3,ok:2,last:1}},wrong:[],known:[],hist:[],bank:window.QB.map(q=>q.id)}))});
await p.reload();await p.waitForTimeout(400);
console.log(JSON.stringify({today:await p.textContent('#daygoal .dg-top b'),msg:await p.textContent('.dg-msg'),day:await p.evaluate(()=>JSON.parse(localStorage.getItem('sqld.v1')).day)}));await b.close();})();
