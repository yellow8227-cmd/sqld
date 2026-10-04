// 고정 모의고사 세트 생성기 → data/sets.js
// 각 세트는 실제 시험과 같은 1과목 10 + 2과목 40문항이고, 세트끼리 문항이 겹치지 않는다.
// 공식 세부항목과 난이도가 세트마다 고르게 나뉘도록 배정하며, 결과는 매번 같다(무작위 없음).
// 사용: node tools/build-sets.mjs
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import vm from "node:vm";

const root = new URL("..", import.meta.url).pathname;
const ctx = { window: {} };
vm.createContext(ctx);
const files = ["data/concepts.js", "data/syllabus.js", ...readdirSync(root + "data").filter(f => /^q\d+\.js$/.test(f)).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1))).map(f => "data/" + f)];
for (const f of files) vm.runInContext(readFileSync(root + f, "utf8"), ctx, { filename: f });
const { QB, QSUB, SYLLABUS } = ctx.window;
const subOf = q => q.sub || QSUB[q.id];
const order = SYLLABUS.flatMap(x => x.items.flatMap(i => i.subs));
const PER = { 1: 10, 2: 40 };

const n = Math.min(...[1, 2].map(s => Math.floor(QB.filter(q => q.s === s).length / PER[s])));
const sets = Array.from({ length: n }, () => ({ 1: [], 2: [] }));

for (const s of [1, 2]) {
  const pool = QB.filter(q => q.s === s);
  // 문항 수가 많은 세부항목부터, 같은 세부항목 안에서는 난이도 → id 순으로 돌아가며 배정
  const groups = {};
  for (const q of pool) (groups[subOf(q)] = groups[subOf(q)] || []).push(q);
  const keys = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length || order.indexOf(a) - order.indexOf(b));
  for (const k of keys) {
    const qs = groups[k].sort((a, b) => a.lv - b.lv || a.id.localeCompare(b.id));
    for (const q of qs) {
      const open = sets.map((x, i) => i).filter(i => sets[i][s].length < PER[s]);
      if (!open.length) break;
      const cnt = i => sets[i][s].filter(x => subOf(x) === k).length;
      const lvSum = i => sets[i][s].reduce((a, x) => a + x.lv, 0);
      open.sort((a, b) => cnt(a) - cnt(b) || sets[a][s].length - sets[b][s].length || lvSum(a) - lvSum(b) || a - b);
      sets[open[0]][s].push(q);
    }
  }
}
// 세트 안 순서: 1과목 → 2과목, 각 과목은 공식 출제기준 순서
const out = sets.map((x, i) => {
  const ids = [...x[1], ...x[2]].sort((a, b) => a.s - b.s || order.indexOf(subOf(a)) - order.indexOf(subOf(b)) || a.id.localeCompare(b.id)).map(q => q.id);
  const all = [...x[1], ...x[2]];
  return { n: i + 1, ids, lv: +(all.reduce((a, q) => a + q.lv, 0) / all.length).toFixed(2) };
});
for (const s of out) if (s.ids.length !== 50) throw new Error(`세트 ${s.n}: ${s.ids.length}문항`);
const used = new Set(out.flatMap(s => s.ids));
if (used.size !== out.length * 50) throw new Error("세트 간 중복 문항");
writeFileSync(root + "data/sets.js",
  "// 고정 모의고사 세트 — tools/build-sets.mjs 가 생성한다. 직접 고치지 말 것.\nwindow.SETS = " + JSON.stringify(out) + ";\n");
console.log(out.map(s => `모의고사 ${s.n}회: 50문항, 평균 난이도 ${s.lv}`).join("\n") + `\n세트 밖 문항 ${QB.length - used.size}개 (무작위 모의고사에서만 출제)`);
