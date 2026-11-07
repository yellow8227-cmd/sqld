// 고정 모의고사 세트 생성기 → data/sets.js
// 각 세트는 실제 시험과 같은 1과목 10 + 2과목 40문항이다. 결과는 매번 같다(무작위 없음).
// · 모의고사 1~5회: 처음 만든 250문항으로 만든 세트. 이미 푼 사람이 있으니 data/sets.js에 있는 그대로 고정한다.
// · 63회 예상 모의고사 A·B: 63회 대비로 넣은 최신 유형 문항(M51~, S201~)으로 만든다.
//   A는 새 문항만, B는 A에 안 쓴 문항에서 새 문항을 먼저 쓰고 모자란 주제는 기존 문항으로 채운다.
//   2과목 주제 배분은 최근 3회(60~62회) 복원 기출의 주제 비율을 따른다.
// 사용: node tools/build-sets.mjs
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import vm from "node:vm";

const root = new URL("..", import.meta.url).pathname;
const ctx = { window: {} };
vm.createContext(ctx);
const files = ["data/concepts.js", "data/syllabus.js", ...readdirSync(root + "data").filter(f => /^q\d+\.js$/.test(f)).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1))).map(f => "data/" + f)];
for (const f of files) vm.runInContext(readFileSync(root + f, "utf8"), ctx, { filename: f });
const { QB, QSUB, QKILL, SYLLABUS, TREND } = ctx.window;
const byId = Object.fromEntries(QB.map(q => [q.id, q]));
const subOf = q => q.sub || QSUB[q.id];
const isKill = q => !!q.kill || (QKILL || []).includes(q.id);
const order = SYLLABUS.flatMap(x => x.items.flatMap(i => i.subs));
const is63 = q => +q.id.slice(1) >= (q.s === 1 ? 51 : 201);
const PER = { 1: 10, 2: 40 };
const FROZEN = 5;

// 1) 기존 세트 1~5회 고정
let frozen = [];
if (existsSync(root + "data/sets.js")) {
  const c = { window: {} }; vm.createContext(c);
  vm.runInContext(readFileSync(root + "data/sets.js", "utf8"), c);
  frozen = (c.window.SETS || []).filter(s => s.n <= FROZEN).map(s => ({ n: s.n, ids: s.ids, lv: s.lv }));
}
if (frozen.length !== FROZEN) throw new Error(`고정 세트가 ${frozen.length}개 — data/sets.js 확인`);

// 2) 주제 목표 비율: 최근 3회 복원 기출의 주제별 문항 수
const last3 = TREND.rounds.map((r, i) => i).slice(-3);
const weight = tp => (TREND.data[tp] || []).filter((v, i) => last3.includes(i)).reduce((a, b) => a + b, 0);

// pool에서 n문항: 목표 비율에서 가장 모자란 주제부터, 그 안에서는 고오답 → 세부항목 고르게 → 난이도 → id 순
function pick(pool, n, s, preferNew) {
  // 목표 비율은 그 과목의 모든 주제 기준 (pool에 없는 주제 몫은 다른 주제가 나눠 갖지 않는다)
  const tps = [...new Set(QB.filter(q => q.s === s).map(q => q.tp))];
  const tot = tps.reduce((a, t) => a + (weight(t) || 0.5), 0);
  const target = Object.fromEntries(tps.map(t => [t, (weight(t) || 0.5) / tot * n]));
  const got = {}, subCnt = {}, out = [], left = [...pool];
  while (out.length < n && left.length) {
    const avail = [...new Set(left.map(q => q.tp))];
    avail.sort((a, b) => (target[b] - (got[b] || 0)) - (target[a] - (got[a] || 0)) || a.localeCompare(b));
    const tp = avail[0];
    const q = left.filter(x => x.tp === tp).sort((a, b) =>
      (preferNew ? is63(b) - is63(a) : 0) || (isKill(b) - isKill(a)) || ((subCnt[subOf(a)] || 0) - (subCnt[subOf(b)] || 0)) || a.lv - b.lv || a.id.localeCompare(b.id))[0];
    out.push(q); left.splice(left.indexOf(q), 1);
    got[tp] = (got[tp] || 0) + 1; subCnt[subOf(q)] = (subCnt[subOf(q)] || 0) + 1;
  }
  if (out.length < n) throw new Error(`${s}과목 문항 부족: ${out.length}/${n}`);
  return out;
}
// 1과목: 세부항목을 돌아가며 고르게
function pickSub(pool, n) {
  const groups = {};
  for (const q of pool) (groups[subOf(q)] = groups[subOf(q)] || []).push(q);
  for (const k in groups) groups[k].sort((a, b) => (isKill(b) - isKill(a)) || a.lv - b.lv || a.id.localeCompare(b.id));
  const keys = Object.keys(groups).sort((a, b) => order.indexOf(a) - order.indexOf(b));
  const out = [];
  while (out.length < n && keys.some(k => groups[k].length)) for (const k of keys) if (out.length < n && groups[k].length) out.push(groups[k].shift());
  if (out.length < n) throw new Error(`1과목 문항 부족: ${out.length}/${n}`);
  return out;
}

const used = new Set();
const new1 = QB.filter(q => q.s === 1 && is63(q)), new2 = QB.filter(q => q.s === 2 && is63(q));
const a1 = pickSub(new1, PER[1]); a1.forEach(q => used.add(q.id));
const a2 = pick(new2, PER[2], 2); a2.forEach(q => used.add(q.id));
const b1 = pickSub(new1.filter(q => !used.has(q.id)), PER[1]);
// B의 2과목: A에 안 쓴 문항 전체(새 문항 우선)에서 최근 출제 비율대로
const b2 = pick(QB.filter(q => q.s === 2 && !used.has(q.id)), PER[2], 2, true);

const sortIds = qs => qs.sort((a, b) => a.s - b.s || order.indexOf(subOf(a)) - order.indexOf(subOf(b)) || a.id.localeCompare(b.id)).map(q => q.id);
const mk = (n, name, qs) => ({ n, name, ids: sortIds(qs), lv: +(qs.reduce((a, q) => a + q.lv, 0) / qs.length).toFixed(2) });
const out = [...frozen, mk(6, "63회 예상 A · 최신 유형", [...a1, ...a2]), mk(7, "63회 예상 B · 실전 비율", [...b1, ...b2])];
for (const s of out) {
  if (s.ids.length !== 50 || new Set(s.ids).size !== 50) throw new Error(`세트 ${s.n}: 문항 수·중복 확인`);
  if (s.ids.filter(id => byId[id].s === 1).length !== 10) throw new Error(`세트 ${s.n}: 1과목 수`);
}
writeFileSync(root + "data/sets.js",
  "// 고정 모의고사 세트 — tools/build-sets.mjs 가 생성한다. 직접 고치지 말 것.\n// 1~5회는 고정, 6·7회(63회 예상 A·B)는 63회 대비 최신 유형 문항으로 만든다.\nwindow.SETS = " + JSON.stringify(out) + ";\n");
const tpCount = s => { const c = {}; s.ids.forEach(id => { const t = byId[id].tp; c[t] = (c[t] || 0) + 1; }); return Object.entries(c).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(", "); };
console.log(out.map(s => `${s.name || `모의고사 ${s.n}회`}: 50문항, 평균 난이도 ${s.lv}${s.n > FROZEN ? `\n  주제: ${tpCount(s)}` : ""}`).join("\n"));
