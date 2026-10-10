// 문제 검증기: 각 문제의 제시 표(tb)를 그대로 PostgreSQL 테이블로 만들고,
// 검증 쿼리(pg)를 실행해 화면에 보여 주는 최종 결과(res)와 한 칸씩 대조한다.
// 사용: node tools/verify.mjs   (환경변수 PGDATABASE 로 DB 지정, 기본 sqld)
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import vm from "node:vm";

const root = new URL("..", import.meta.url).pathname;
const ctx = { window: {} };
vm.createContext(ctx);
import { readdirSync } from "node:fs";
// VERIFY_ONLY=q6.js 처럼 주면 그 문항 파일만 검증한다 (여러 명이 동시에 작업할 때)
const only = process.env.VERIFY_ONLY;
const files = ["data/concepts.js", "data/syllabus.js", ...readdirSync(root + "data").filter(f => /^q\d+\.js$/.test(f)).filter(f => !only || f === only).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1))).map(f => "data/" + f)];
for (const f of files) vm.runInContext(readFileSync(root + f, "utf8"), ctx, { filename: f });
const QB = ctx.window.QB || [];
const db = process.env.PGDATABASE || "sqld";

function psql(sql) {
  return execFileSync("psql", ["-X", "-q", "-At", "-F", "\t", "-P", "null=@NULL@", "-v", "ON_ERROR_STOP=1", "-d", db],
    { input: sql, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
}
const lit = v => v === null ? "NULL" : typeof v === "number" ? String(v) : "'" + String(v).replace(/'/g, "''") + "'";
function setupSql(q) {
  let s = "DROP SCHEMA IF EXISTS v CASCADE; CREATE SCHEMA v; SET search_path TO v;\n";
  for (const t of q.tb || []) {
    if (!/^[A-Za-z_]\w*$/.test(t.n)) continue;
    const types = t.c.map((_, i) => t.r.every(r => r[i] === null || typeof r[i] === "number") ? "numeric" : "text");
    s += `CREATE TABLE ${t.n} (${t.c.map((c, i) => `"${c.toLowerCase()}" ${types[i]}`).join(", ")});\n`;
    for (const r of t.r) s += `INSERT INTO ${t.n} VALUES (${r.map(lit).join(", ")});\n`;
  }
  return s + (q.pgSetup ? q.pgSetup + "\n" : "");
}
const same = (exp, got) => {
  if (exp === null) return got === "@NULL@";
  if (typeof exp === "number") return got !== "@NULL@" && Math.abs(parseFloat(got) - exp) < 1e-4;
  return String(exp) === got;
};

let ok = 0, bad = 0, skipped = 0;
for (const q of QB) {
  if (!q.pg) { skipped++; continue; }
  let out;
  try { out = psql(setupSql(q) + q.pg + ";\n"); }
  catch (e) { bad++; console.log(`✗ ${q.id} 실행 오류: ${(e.stderr || e.message).trim()}`); continue; }
  const rows = out.split("\n").filter(l => l.length).map(l => l.split("\t"));
  const exp = q.res.r;
  const pass = rows.length === exp.length && exp.every((r, i) => r.length === rows[i].length && r.every((v, j) => same(v, rows[i][j])));
  if (pass) { ok++; }
  else { bad++; console.log(`✗ ${q.id} 불일치\n   기대: ${JSON.stringify(exp)}\n   실제: ${JSON.stringify(rows)}`); }
}
// 구조 점검: 보기 4개, 정답 범위, 보기 해설 4개
for (const q of QB) {
  const errs = [];
  if (!Array.isArray(q.o) || q.o.length !== 4) errs.push("보기 수");
  if (!(q.a >= 0 && q.a <= 3)) errs.push("정답 범위");
  if (!Array.isArray(q.ox) || q.ox.length !== 4) errs.push("보기 해설 수");
  const sub = q.sub || ctx.window.QSUB[q.id];
  const subs = ctx.window.SYLLABUS.filter(x => x.s === q.s).flatMap(x => x.items.flatMap(i => i.subs));
  if (!subs.includes(sub)) errs.push(`세부항목 없음/오류(${sub})`);
  if (!ctx.window.TOPICS[q.tp] || ctx.window.TOPICS[q.tp].s !== q.s) errs.push(`tp 오류(${q.tp})`);
  for (const k of ["id", "th", "q", "sum", "why", "trap", "memo"]) if (!q[k]) errs.push(k + " 없음");
  if (q.pg && !q.res) errs.push("pg 있는데 res 없음");
  if (errs.length) { bad++; console.log(`✗ ${q.id} 구조: ${errs.join(", ")}`); }
}
const ids = QB.map(q => q.id), dup = ids.filter((x, i) => ids.indexOf(x) !== i);
if (dup.length) { bad++; console.log("✗ 중복 id: " + dup.join(", ")); }
console.log(`\n문항 ${QB.length}개 (1과목 ${QB.filter(q => q.s === 1).length} · 2과목 ${QB.filter(q => q.s === 2).length}) — DB 검증 통과 ${ok}, 실패 ${bad}, DB 검증 대상 아님 ${skipped}`);
process.exit(bad ? 1 : 0);
