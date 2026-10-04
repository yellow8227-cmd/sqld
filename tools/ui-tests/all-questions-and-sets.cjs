const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];
const p=await b.newPage({viewport:{width:360,height:780},deviceScaleFactor:2});
p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(700);
const info=await p.evaluate(()=>({n:window.QB.length,sets:window.SETS.length,kill:window.QB.filter(q=>q.kill||window.QKILL.includes(q.id)).length}));
const over=[];
for(const m of ['concept','card','quiz','wrong','trend','mock']){await p.click(`.tabs button[data-mode="${m}"]`);await p.waitForTimeout(250);const w=await p.evaluate(()=>document.documentElement.scrollWidth);if(w>360)over.push(m+':'+w);}
await p.screenshot({path:'/tmp/sqld-s-mock.png',fullPage:true});
// render every question + explanation once to catch broken data
await p.click('.tabs button[data-mode="quiz"]');
const n=info.n; let bad=[];
for(let i=0;i<n;i++){
  const ok=await p.evaluate(()=>{const o=document.querySelector('.opt:not([disabled])');if(!o)return 'noopt';o.click();return document.querySelector('.exp')?'ok':'noexp'});
  const w=await p.evaluate(()=>document.documentElement.scrollWidth);
  if(ok!=='ok'||w>360){bad.push(i+':'+ok+':'+w)}
  const nx=await p.$('[data-nav="1"]:not([disabled])');if(!nx)break;await nx.click();
}
for(const s of [1,2,3,4,5]){await p.click('.tabs button[data-mode="mock"]');await p.waitForTimeout(150);
  await p.evaluate(()=>{const S=JSON.parse(localStorage.getItem('sqld.v1'));S.mock=null;localStorage.setItem('sqld.v1',JSON.stringify(S));});
  await p.reload();await p.waitForTimeout(400);await p.click('.tabs button[data-mode="mock"]');await p.waitForTimeout(150);
  await p.click(`[data-set="${s}"]`);const cnt=await p.$$eval('.omr button',x=>x.length);if(cnt!==50)bad.push('set'+s+':'+cnt);
  await p.click('#mock-submit');await p.waitForTimeout(150);}
console.log(JSON.stringify({info,over,bad,errs}));await b.close();})();
