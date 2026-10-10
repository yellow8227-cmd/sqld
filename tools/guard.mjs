// 해설 보강 보호 장치: 정답·보기·지문·데이터·검증 쿼리가 바뀌지 않았는지 기준본과 비교한다.
// 기준본 만들기: node tools/guard.mjs save   /  비교: node tools/guard.mjs
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import vm from "node:vm";
const root = new URL("..", import.meta.url).pathname, snap = root + "tools/.guard-snapshot.json";
const ctx = { window: {} }; vm.createContext(ctx);
const only = (process.env.GUARD_ONLY || "").split(",").filter(Boolean); // 예: GUARD_ONLY=q1.js,q5.js
for (const f of readdirSync(root + "data").filter(f => /^q\d+\.js$/.test(f) && (!only.length || only.includes(f)))) vm.runInContext(readFileSync(root + "data/" + f, "utf8"), ctx);
const KEEP = ["s", "tp", "lv", "sub", "kill", "q", "box", "tb", "sql", "o", "a", "res", "pg", "pgSetup"];
const cur = Object.fromEntries(ctx.window.QB.map(q => [q.id, Object.fromEntries(KEEP.map(k => [k, q[k] === undefined ? null : q[k]]))]));
if (process.argv[2] === "save") { writeFileSync(snap, JSON.stringify(cur)); console.log("기준본 저장:", Object.keys(cur).length, "문항"); process.exit(0); }
const base = JSON.parse(readFileSync(snap, "utf8")); let bad = 0;
for (const id of Object.keys(base).filter(id => !only.length || cur[id] || false)) {
  if (!cur[id]) { console.log("✗ 사라진 문항", id); bad++; continue; }
  for (const k of KEEP) if (JSON.stringify(base[id][k]) !== JSON.stringify(cur[id][k])) { console.log(`✗ ${id}.${k} 바뀜`); bad++; }
}
console.log(bad ? `보호 장치 실패 ${bad}건` : `보호 장치 통과: ${Object.keys(base).length}문항의 정답·보기·지문·데이터·검증 쿼리 그대로`);
process.exit(bad ? 1 : 0);
