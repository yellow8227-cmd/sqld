// SQLD 공학노트 — 화면 로직 (데이터: data/*.js, 로그인: login.js)
(function () {
"use strict";
const QB = window.QB || [], TOPICS = window.TOPICS, CONCEPTS = window.CONCEPTS, CARDS = window.CARDS, TREND = window.TREND;
const SYL = window.SYLLABUS, QSUB = window.QSUB || {}, QKILL = new Set(window.QKILL || []), SETS = window.SETS || [], OFF = window.OFFICIAL;
const byId = Object.fromEntries(QB.map(q => [q.id, q]));
const subOf = q => q.sub || QSUB[q.id] || "";
const isKill = q => !!q.kill || QKILL.has(q.id);
const SUBS = SYL.flatMap(x => x.items.flatMap(i => i.subs.map(n => ({ s: x.s, item: i.n, n }))));
const view = document.getElementById("view");
const EXAMS = [{ n: 62, d: "2026-08-22" }, { n: 63, d: "2026-11-14" }];

// ── 저장소 (실패해도 앱은 동작)
const KEY = "sqld.v1";
let S = { log: {}, wrong: [], known: [], theme: "", mock: null, hist: [] };
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

// ── 공통 도구
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const NO = ["①", "②", "③", "④"];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fmt = n => Number(n).toLocaleString("ko-KR");

// 약어는 문항(또는 개념 블록)마다 처음 나올 때 괄호로 풀어 쓴다. **굵게** 표시도 여기서 처리한다.
const ABBR = {
  DDL: "Data Definition Language, 데이터 정의어", DML: "Data Manipulation Language, 데이터 조작어",
  DCL: "Data Control Language, 데이터 제어어", TCL: "Transaction Control Language, 트랜잭션 제어어",
  PK: "Primary Key, 기본키", FK: "Foreign Key, 외래키", ERD: "Entity Relationship Diagram, 개체-관계 다이어그램",
  DBMS: "Database Management System, 데이터베이스 관리 시스템", ACID: "Atomicity·Consistency·Isolation·Durability",
  "1NF": "제1정규형", "2NF": "제2정규형", "3NF": "제3정규형", BCNF: "Boyce-Codd Normal Form, 보이스-코드 정규형",
  ANSI: "American National Standards Institute, 미국 표준 협회", CTAS: "CREATE TABLE AS SELECT",
  DQL: "Data Query Language, 데이터 질의어", UML: "Unified Modeling Language, 통합 모델링 언어"
};
const ABBR_RE = new RegExp("(?<![A-Za-z0-9_])(" + Object.keys(ABBR).join("|") + ")(?![A-Za-z0-9_])", "g");
function md(text, seen) {
  let h = esc(text).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  if (!seen) return h;
  return h.replace(ABBR_RE, (m, k, off, str) => {
    if (seen.has(k)) return m;
    seen.add(k);
    if (/^\s*\(/.test(str.slice(off + m.length))) return m;
    return `${m}<span class="muted">(${esc(ABBR[k])})</span>`;
  });
}

// SQL 강조
const KW = new Set(("SELECT FROM WHERE GROUP BY HAVING ORDER ASC DESC AND OR NOT IN IS NULL AS JOIN LEFT RIGHT FULL OUTER INNER CROSS NATURAL ON USING " +
  "UNION ALL INTERSECT MINUS EXCEPT DISTINCT COUNT SUM AVG MIN MAX NVL NVL2 NULLIF COALESCE DECODE CASE WHEN THEN ELSE END OVER PARTITION ROWS RANGE " +
  "BETWEEN UNBOUNDED PRECEDING FOLLOWING CURRENT ROW RANK DENSE_RANK ROW_NUMBER LAG LEAD NTILE FIRST_VALUE LAST_VALUE CUME_DIST PERCENT_RANK RATIO_TO_REPORT " +
  "ROLLUP CUBE GROUPING SETS START WITH CONNECT PRIOR LEVEL SIBLINGS CONNECT_BY_ISLEAF CONNECT_BY_ROOT SYS_CONNECT_BY_PATH NOCYCLE ROWNUM FETCH FIRST NEXT OFFSET TIES ONLY PERCENT TOP " +
  "EXISTS ANY SOME PIVOT UNPIVOT FOR INCLUDE EXCLUDE NULLS REGEXP_SUBSTR REGEXP_COUNT REGEXP_INSTR REGEXP_REPLACE REGEXP_LIKE MERGE INTO MATCHED UPDATE SET INSERT VALUES DELETE " +
  "CREATE TABLE VIEW INDEX NUMBER VARCHAR2 CHAR DATE PRIMARY KEY FOREIGN REFERENCES UNIQUE CHECK DEFAULT CONSTRAINT CASCADE COMMIT ROLLBACK SAVEPOINT TO GRANT REVOKE OPTION ADMIN ROLE PUBLIC " +
  "ALTER ADD MODIFY RENAME COLUMN DROP TRUNCATE DUAL LIKE ESCAPE SUBSTR INSTR LENGTH TRIM LTRIM RTRIM LPAD RPAD REPLACE ROUND TRUNC CEIL FLOOR MOD ABS SIGN " +
  "TO_CHAR TO_DATE TO_NUMBER SYSDATE ADD_MONTHS LAST_DAY MONTHS_BETWEEN EXTRACT YEAR MONTH DAY CAST").split(" "));
function sqlHL(code) {
  return String(code).replace(/(--[^\n]*)|('(?:[^']|'')*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_$#]*)|([\s\S])/g, (m, c, s, n, w) => {
    if (c) return `<span class="c">${esc(c)}</span>`;
    if (s) return `<span class="s">${esc(s)}</span>`;
    if (n) return `<span class="n">${n}</span>`;
    if (w) return KW.has(w.toUpperCase()) ? `<span class="k">${w}</span>` : w;
    return esc(m);
  });
}
const term = code => `<div class="term"><div class="term-bar"><span>SQL&gt; ORACLE</span><span>●●●</span></div><pre>${sqlHL(code)}</pre></div>`;
function cell(v) {
  if (v === null || v === undefined) return `<td><span class="null">NULL</span></td>`;
  if (typeof v === "number") return `<td class="num">${v}</td>`;
  return `<td>${esc(v)}</td>`;
}
function tbl(t, cap, wide) {
  const hl = new Set(t.hl || []);
  return `<div class="dt${wide ? " wide" : ""}">${cap ? `<div class="dt-cap">${esc(cap)}</div>` : ""}<div class="scroll"><table>
    <thead><tr>${t.c.map(c => `<th>${esc(c)}</th>`).join("")}</tr></thead>
    <tbody>${t.r.map((r, i) => `<tr${hl.has(i) ? ' class="hl"' : ""}>${r.map(cell).join("")}</tr>`).join("")}</tbody></table></div></div>`;
}
const lvTag = lv => `<span class="tag lv">난이도 ${"●".repeat(lv)}${"○".repeat(3 - lv)}</span>`;

// ── 통계
function record(q, pick) {
  const ok = pick === q.a, L = S.log[q.id] || { n: 0, ok: 0 };
  L.n++; if (ok) L.ok++; L.last = ok ? 1 : 0; S.log[q.id] = L;
  if (!ok && !S.wrong.includes(q.id)) S.wrong.push(q.id);
  save(); stats();
  return ok;
}
function stats() {
  const ids = Object.keys(S.log).filter(id => byId[id]);
  const n = ids.reduce((a, id) => a + S.log[id].n, 0), ok = ids.reduce((a, id) => a + S.log[id].ok, 0);
  document.getElementById("st-solved").textContent = `${ids.length}/${QB.length}`;
  document.getElementById("st-acc").textContent = n ? Math.round(ok / n * 100) + "%" : "—";
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const next = EXAMS.find(e => new Date(e.d + "T00:00:00") >= today);
  if (next) {
    const d = Math.round((new Date(next.d + "T00:00:00") - today) / 864e5);
    document.getElementById("st-dday-l").textContent = `${next.n}회 · ${next.d.slice(5).replace("-", "/")}`;
    document.getElementById("st-dday").textContent = d ? "D-" + d : "D-DAY";
  }
}

// ── 문제 카드
function qBody(q, numLabel) {
  const seen = new Set();
  let html = `<div class="qmeta">${numLabel ? `<span class="qid">${numLabel}</span>` : ""}<span class="qid">${q.id}</span><span class="tag">${esc(subOf(q))}</span>${isKill(q) ? `<span class="tag kill">고오답 유형</span>` : ""}${lvTag(q.lv)}</div>
    <div class="qth">${esc(q.th)}</div>
    <p class="qtext">${md(q.q, seen)}</p>`;
  if (q.tb) html += `<div class="tables">${q.tb.map(t => tbl(t, t.n)).join("")}</div>`;
  if (q.box) html += `<div class="box">${md(q.box, seen)}</div>`;
  if (q.sql) html += term(q.sql);
  return { html, seen };
}
function expHtml(q, pick, seen) {
  const right = pick === q.a;
  let html = `<div class="exp">
    <div class="verdict">${pick == null ? "" : `<span class="stamp ${right ? "ok" : "ng"}">${right ? "정답 ✓" : "오답 ✗"}</span>`}
      <span class="ans">정답 ${NO[q.a]} ${esc(q.o[q.a])}</span></div>
    <div class="sec"><div class="sec-h">핵심 원리</div><p class="why">${md(q.why, seen)}</p></div>`;
  if (q.st && q.st.length) {
    html += `<div class="sec"><div class="sec-h">단계별 추적</div><div class="steps">${q.st.map(s => {
      const mono = s.n && /[├└│─]|^(SELECT|MERGE|WITH)\b/m.test(s.n);
      return `<div class="step"><h4>${esc(s.t)}</h4>${s.tb ? tbl(s.tb, "", true) : ""}${s.n ? `<p class="note${mono ? " tree" : ""}">${mono ? esc(s.n) : md(s.n, seen)}</p>` : ""}</div>`;
    }).join("")}</div></div>`;
  }
  if (q.res) html += `<div class="final"><div class="sec-h">최종 결과</div>${tbl(q.res, "")}</div>`;
  html += `<div class="sec"><div class="sec-h">보기 분석</div><ul class="oxl">${q.ox.map((t, i) =>
    `<li class="${i === q.a ? "right" : i === pick ? "mine" : ""}"><span class="no">${NO[i]}</span><span>${md(t, seen)}</span></li>`).join("")}</ul></div>`;
  if (q.trap) html += `<div class="warn"><div class="sec-h">출제 함정</div>${md(q.trap, seen)}</div>`;
  if (q.memo) html += `<div class="memo"><i>암기</i>${esc(q.memo)}</div>`;
  html += `<div class="foot">${q.pg ? `<span class="verify">✓ 정답을 PostgreSQL에서 실행해 대조함</span>` : `<span class="verify no">○ 이론·Oracle 고유 동작 문항 — 해설 근거로 검토함</span>`}
    ${CONCEPTS.some(c => c.tp === q.tp) ? `<button class="link" data-concept="${q.tp}">관련 개념 보기 →</button>` : ""}</div>`;
  return html + `</div>`;
}
function bindConceptLinks(root) {
  (root || view).querySelectorAll("[data-concept]").forEach(b => b.onclick = () => {
    setMode("concept");
    const el = document.getElementById("c-" + b.dataset.concept);
    if (el) setTimeout(() => el.scrollIntoView({ block: "start" }), 30);
  });
}

// ── 문제풀이 / 오답노트
let quiz = { subj: 0, sub: "", order: "seq", kill: false, list: [], i: 0, pick: null, wrongMode: false };
function poolFor() {
  if (quiz.wrongMode) return S.wrong.map(id => byId[id]).filter(Boolean);
  return QB.filter(q => (!quiz.subj || q.s === quiz.subj) && (!quiz.kill || isKill(q)));
}
function buildList() {
  let L = poolFor().filter(q => !quiz.sub || subOf(q) === quiz.sub);
  if (!quiz.wrongMode && quiz.order === "new") L = L.filter(q => !S.log[q.id]);
  if (!quiz.wrongMode && quiz.order === "missed") L = L.filter(q => S.log[q.id] && S.log[q.id].ok < S.log[q.id].n);
  if (quiz.order === "rand") L = shuffle(L);
  else { const o = SUBS.map(x => x.n); L.sort((a, b) => a.s - b.s || o.indexOf(subOf(a)) - o.indexOf(subOf(b)) || a.id.localeCompare(b.id, "en", { numeric: true })); }
  quiz.list = L.map(q => q.id); quiz.i = 0; quiz.pick = null;
}
function quizView(wrongMode) {
  if (quiz.wrongMode !== wrongMode) { quiz.wrongMode = wrongMode; quiz.sub = ""; quiz.subj = 0; quiz.kill = false; }
  buildList(); renderQuiz();
}
function subSelect(pool) {
  const cnt = {}; pool.forEach(q => cnt[subOf(q)] = (cnt[subOf(q)] || 0) + 1);
  let h = `<option value="">전체 세부항목 (${pool.length}문항)</option>`;
  for (const sj of SYL) {
    if (quiz.subj && quiz.subj !== sj.s) continue;
    for (const it of sj.items) {
      const subs = it.subs.filter(n => cnt[n]);
      if (!subs.length) continue;
      h += `<optgroup label="${sj.s}과목 · ${esc(it.n)}">${subs.map(n => `<option value="${esc(n)}" ${quiz.sub === n ? "selected" : ""}>${esc(n)} (${cnt[n]})</option>`).join("")}</optgroup>`;
    }
  }
  return h;
}
function weakBars() { // 내 기록으로 계산한 세부항목별 정답률 (낮은 순)
  const by = {};
  for (const [id, L] of Object.entries(S.log)) { const q = byId[id]; if (!q) continue; const k = subOf(q); const t = by[k] = by[k] || { n: 0, ok: 0 }; t.n += L.n; t.ok += L.ok; }
  const rows = Object.entries(by).filter(([, t]) => t.n >= 2).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n).slice(0, 8);
  if (!rows.length) return "";
  return `<div class="sec"><div class="sec-h">내 약점 — 세부항목별 정답률 (낮은 순)</div><div class="bars">${rows.map(([k, t]) =>
    `<div class="bar"><span>${esc(k)}</span><span class="tr"><i class="${t.ok / t.n < .6 ? "low" : ""}" style="width:${t.ok / t.n * 100}%"></i></span><b>${Math.round(t.ok / t.n * 100)}%</b></div>`).join("")}</div>
    <p class="small muted">2번 이상 푼 세부항목만 보여 준다. 주황 막대(60% 미만)부터 개념정리 → 문제풀이로 다시 보자.</p></div>`;
}
function renderQuiz() {
  const wm = quiz.wrongMode, pool = poolFor();
  const id = quiz.list[quiz.i], q = byId[id];
  let html = `<section class="panel frame">
    <div class="eyebrow">${wm ? "04 · 오답노트" : "03 · 문제풀이"}</div>
    <h2>${wm ? "틀린 문제 다시 풀기" : "출제기준 세부항목별 문제풀이"}</h2>
    <p class="lead">${wm ? `틀린 문제 ${S.wrong.length}개가 모여 있다. 다시 맞히면 오답노트에서 빠진다.` : `문제은행 ${QB.length}문항(1과목 ${QB.filter(x => x.s === 1).length} · 2과목 ${QB.filter(x => x.s === 2).length}). 보기를 고르면 바로 단계별 해설이 열린다.`}</p>
    ${wm ? weakBars() : `<div class="seg" role="group" aria-label="과목">${["전체", "1과목 모델링", "2과목 SQL"].map((t, i) => `<button data-subj="${i}" aria-pressed="${quiz.subj === i}">${t}</button>`).join("")}</div>`}
    <div class="filters">
      <label class="field"><span>세부항목 (공식 출제기준)</span><select id="f-sub">${subSelect(pool)}</select></label>
      ${wm ? "" : `<label class="field"><span>풀이 순서</span><select id="f-order">${[["seq", "출제기준 순서"], ["rand", "무작위"], ["new", "안 푼 문제만"], ["missed", "한 번이라도 틀린 문제"]].map(([k, t]) => `<option value="${k}" ${quiz.order === k ? "selected" : ""}>${t}</option>`).join("")}</select></label>`}
    </div>
    ${wm ? "" : `<div class="row"><button class="toggle" id="f-kill" aria-pressed="${quiz.kill}"><span class="box">${quiz.kill ? "✓" : ""}</span>고오답 유형만 풀기 (${QB.filter(isKill).length}문항)</button></div>`}
  </section>`;
  if (!q) {
    html += `<section class="panel"><p class="empty">${wm ? "오답노트가 비어 있다. 문제풀이에서 틀린 문제가 여기에 모인다." : "조건에 맞는 문제가 없다. 필터를 바꿔 보자."}</p></section>`;
    view.innerHTML = html; bindQuizFilters(); return;
  }
  const { html: body, seen } = qBody(q);
  html += `<section class="panel frame" id="qcard">
    <div class="spread"><span class="eyebrow">${quiz.i + 1} / ${quiz.list.length}</span>${S.log[id] ? `<span class="small muted">내 기록 ${S.log[id].ok}/${S.log[id].n} 정답</span>` : ""}</div>
    <div class="meter"><i style="width:${(quiz.i + 1) / quiz.list.length * 100}%"></i></div>
    ${body}
    <div class="opts">${q.o.map((t, i) => {
      const cls = quiz.pick == null ? "" : i === q.a ? "right" : i === quiz.pick ? "wrong" : "";
      return `<button class="opt ${cls}" data-i="${i}" ${quiz.pick != null ? "disabled" : ""}><span class="no">${i + 1}</span><span>${esc(t)}</span></button>`;
    }).join("")}</div>
    ${quiz.pick != null ? expHtml(q, quiz.pick, seen) : ""}
    <div class="navrow"><button class="btn" data-nav="-1" ${quiz.i ? "" : "disabled"}>← 이전</button><button class="btn primary" data-nav="1" ${quiz.i < quiz.list.length - 1 ? "" : "disabled"}>다음 문제 →</button></div>
  </section>`;
  view.innerHTML = html; bindQuizFilters(); bindConceptLinks();
  view.querySelectorAll(".opt").forEach(b => b.onclick = () => choose(+b.dataset.i));
  view.querySelectorAll("[data-nav]").forEach(b => b.onclick = () => go(+b.dataset.nav));
}
function choose(i) {
  if (quiz.pick != null) return;
  const q = byId[quiz.list[quiz.i]];
  quiz.pick = i;
  const ok = record(q, i);
  if (ok && quiz.wrongMode) { S.wrong = S.wrong.filter(x => x !== q.id); save(); }
  renderQuiz();
  const exp = view.querySelector(".exp"); if (exp) exp.scrollIntoView({ behavior: "smooth", block: "start" });
}
function go(d) {
  const n = quiz.i + d;
  if (quiz.wrongMode && quiz.pick != null && !S.wrong.includes(quiz.list[quiz.i])) { // 맞혀서 빠진 문제는 목록에서 정리
    quiz.list.splice(quiz.i, 1); if (d < 0) quiz.i = Math.max(0, quiz.i - 1); quiz.pick = null; renderQuiz(); top(); return;
  }
  if (n < 0 || n >= quiz.list.length) return;
  quiz.i = n; quiz.pick = null; renderQuiz(); top();
}
const top = () => { const c = document.getElementById("qcard"); if (c) c.scrollIntoView({ block: "start" }); };
function bindQuizFilters() {
  view.querySelectorAll("[data-subj]").forEach(b => b.onclick = () => { quiz.subj = +b.dataset.subj; quiz.sub = ""; buildList(); renderQuiz(); });
  const fs = document.getElementById("f-sub"); if (fs) fs.onchange = () => { quiz.sub = fs.value; buildList(); renderQuiz(); };
  const fo = document.getElementById("f-order"); if (fo) fo.onchange = () => { quiz.order = fo.value; buildList(); renderQuiz(); };
  const fk = document.getElementById("f-kill"); if (fk) fk.onclick = () => { quiz.kill = !quiz.kill; quiz.sub = ""; buildList(); renderQuiz(); };
}

// ── 개념정리
const spark = tp => { const d = TREND.data[tp] || [], mx = 6; return `<span class="spark" title="55~61회 복원 기출 출제 수: ${d.join(", ")}">${d.map((v, i) => `<i class="${i === d.length - 1 ? "last" : ""}" style="height:${Math.max(2, v / mx * 18)}px"></i>`).join("")}</span>`; };
function conceptView() {
  const toc = s => CONCEPTS.filter(c => TOPICS[c.tp].s === s).map(c => `<a href="#c-${c.tp}">${esc(TOPICS[c.tp].n)}<small>문제 ${QB.filter(q => q.tp === c.tp).length}개</small></a>`).join("");
  let html = `<section class="panel frame"><div class="eyebrow">01 · 개념정리</div><h2>시험 범위 전체 설계도</h2>
    <p class="lead">주제마다 핵심 표와 암기 고리를 정리했다. 읽고 나서 바로 그 주제 문제로 넘어가자. 막대는 55~61회 복원 기출 출제 수(주황 = 61회)다.</p>
    <div class="toc-group"><h3>제1과목 데이터 모델링의 이해 · 10문항</h3><div class="toc">${toc(1)}</div></div>
    <div class="toc-group"><h3>제2과목 SQL 기본 및 활용 · 40문항</h3><div class="toc">${toc(2)}</div></div>
  </section>`;
  for (const c of CONCEPTS) {
    const seen = new Set(), n = QB.filter(q => q.tp === c.tp).length;
    html += `<section class="panel concept" id="c-${c.tp}">
      <div class="chead"><div><div class="eyebrow">${TOPICS[c.tp].s}과목</div><h2>${esc(TOPICS[c.tp].n)}</h2></div>
        <div class="freq">복원 기출 55→61회 ${spark(c.tp)}</div></div>
      ${c.b.map(b => `<div class="blk"><h3>${esc(b.h)}</h3>
        ${b.code ? `<pre class="inline">${sqlHL(b.code)}</pre>` : ""}
        ${b.t ? `<p>${md(b.t, seen)}</p>` : ""}
        ${b.tb ? tbl(b.tb, "", true) : ""}
        ${b.memo ? `<span class="memo"><i>암기</i>${esc(b.memo)}</span>` : ""}</div>`).join("")}
      ${n ? `<div class="row"><button class="btn acc" data-practice="${c.tp}">이 주제 문제 ${n}개 풀기 →</button></div>` : ""}
    </section>`;
  }
  view.innerHTML = html;
  bindPractice();
  view.querySelectorAll(".toc a").forEach(a => a.onclick = e => { e.preventDefault(); const el = document.querySelector(a.getAttribute("href")); if (el) el.scrollIntoView({ behavior: "smooth" }); });
}
function bindPractice() {
  view.querySelectorAll("[data-practice]").forEach(b => b.onclick = () => {
    const tp = b.dataset.practice;
    quiz.wrongMode = false; quiz.subj = TOPICS[tp].s; quiz.sub = ""; quiz.kill = false; quiz.order = "seq";
    setMode("quiz", true);
    buildList(); quiz.list = quiz.list.filter(id => byId[id].tp === tp); renderQuiz(); window.scrollTo(0, 0);
  });
  view.querySelectorAll("[data-sub]").forEach(b => b.onclick = () => {
    const sub = b.dataset.sub, s = SUBS.find(x => x.n === sub).s;
    quiz.wrongMode = false; quiz.subj = s; quiz.sub = sub; quiz.kill = false; quiz.order = "seq";
    setMode("quiz", true); buildList(); renderQuiz(); window.scrollTo(0, 0);
  });
}

// ── 암기카드
let card = { tp: "", i: 0, flip: false, list: [], hideKnown: false };
function cardList() {
  card.list = CARDS.map(c => ({ ...c, k: c.tp + ":" + c.f })).filter(c => (!card.tp || c.tp === card.tp) && (!card.hideKnown || !S.known.includes(c.k)));
  if (card.i >= card.list.length) card.i = 0;
}
function cardView() {
  cardList();
  const c = card.list[card.i], known = CARDS.filter(x => S.known.includes(x.tp + ":" + x.f)).length;
  const cnt = {}; CARDS.forEach(x => cnt[x.tp] = (cnt[x.tp] || 0) + 1);
  let html = `<section class="panel frame"><div class="eyebrow">02 · 암기카드</div><h2>공식 압축 카드 ${CARDS.length}장</h2>
    <p class="lead">카드를 눌러 뒤집는다. '외웠다'를 누른 카드는 숨길 수 있다. 외운 카드 ${known} / ${CARDS.length}</p>
    <div class="meter ok"><i style="width:${known / CARDS.length * 100}%"></i></div>
    <div class="filters"><label class="field"><span>주제</span><select id="c-tp"><option value="">전체 (${CARDS.length}장)</option>${[1, 2].map(s => `<optgroup label="${s}과목">${Object.keys(TOPICS).filter(k => cnt[k] && TOPICS[k].s === s).map(k => `<option value="${k}" ${card.tp === k ? "selected" : ""}>${esc(TOPICS[k].n)} (${cnt[k]})</option>`).join("")}</optgroup>`).join("")}</select></label>
      <div class="field"><span>보기 옵션</span><div class="row"><button class="toggle" id="hide-known" aria-pressed="${card.hideKnown}"><span class="box">${card.hideKnown ? "✓" : ""}</span>외운 카드 숨기기</button><button class="btn sm" id="shuffle-c">섞기</button></div></div></div>
  </section>`;
  if (!c) html += `<section class="panel"><p class="empty">이 묶음의 카드를 모두 외웠다. '외운 카드 숨기기'를 끄면 다시 볼 수 있다.</p></section>`;
  else html += `<section class="panel" id="qcard">
    <div class="spread"><span class="eyebrow">${card.i + 1} / ${card.list.length} · ${esc(TOPICS[c.tp].n)}</span>${S.known.includes(c.k) ? `<span class="verify">✓ 외움</span>` : ""}</div>
    <button class="flash" id="flash" aria-label="카드 뒤집기"><span class="corner tl"></span><span class="corner br"></span>
      <span class="front">${esc(c.f)}</span>${card.flip ? `<span class="back">${esc(c.b)}</span>` : ""}
      <span class="tap">${card.flip ? "눌러서 앞면으로" : "눌러서 정답 보기"}</span></button>
    <div class="navrow"><button class="btn" data-cn="-1">← 이전</button><button class="btn acc" id="again">다시 볼래</button><button class="btn ok" id="gotit">외웠다</button><button class="btn" data-cn="1">다음 →</button></div>
  </section>`;
  view.innerHTML = html;
  document.getElementById("c-tp").onchange = e => { card.tp = e.target.value; card.i = 0; card.flip = false; cardView(); };
  document.getElementById("hide-known").onclick = () => { card.hideKnown = !card.hideKnown; card.i = 0; cardView(); };
  document.getElementById("shuffle-c").onclick = () => { const s = shuffle(CARDS); CARDS.splice(0, CARDS.length, ...s); card.i = 0; card.flip = false; cardView(); };
  if (!c) return;
  document.getElementById("flash").onclick = () => { card.flip = !card.flip; cardView(); };
  const step = d => { card.i = (card.i + d + card.list.length) % card.list.length; card.flip = false; cardView(); };
  view.querySelectorAll("[data-cn]").forEach(b => b.onclick = () => step(+b.dataset.cn));
  document.getElementById("gotit").onclick = () => { if (!S.known.includes(c.k)) S.known.push(c.k); save(); if (card.hideKnown) { card.flip = false; cardView(); } else step(1); };
  document.getElementById("again").onclick = () => { S.known = S.known.filter(k => k !== c.k); save(); step(1); };
}

// ── 모의고사 (공식 구성: 1과목 10 + 2과목 40, 90분, 문항당 2점)
let tick = null;
const LIMIT = 90 * 60 * 1000;
const setName = n => n ? `모의고사 ${n}회` : "무작위 모의고사";
function mockView() {
  clearInterval(tick); document.getElementById("exambar").hidden = true;
  const M = S.mock;
  if (M && !M.done) return mockPaper();
  if (M && M.done) return mockResult();
  const best = n => { const r = S.hist.filter(h => (h.set || 0) === n); return r.length ? Math.max(...r.map(h => h.sc)) : null; };
  const lvTxt = lv => lv < 1.8 ? "기본" : lv < 2.2 ? "중간" : "어려움";
  view.innerHTML = `<section class="panel frame"><div class="eyebrow">05 · 모의고사</div><h2>실전 모의고사</h2>
    <p class="lead">공식 시험과 똑같이 1과목 10문항 + 2과목 40문항, 90분, 문항당 2점이다. 합격은 총점 60점 이상이고, 과목별 40% 미만이면 과락이다. 회차끼리는 문항이 겹치지 않으며, 세부항목과 난이도를 고르게 나눴다.</p>
    <div class="sets">${SETS.map(s => { const b = best(s.n); const k = s.ids.filter(id => byId[id] && isKill(byId[id])).length; return `<button class="setc" data-set="${s.n}"><b>${setName(s.n)}</b><span>50문항 · 난이도 ${lvTxt(s.lv)} · 고오답 ${k}문항</span>${b != null ? `<em>최고 ${b}점</em>` : `<span>아직 안 풂</span>`}</button>`; }).join("")}
      <button class="setc rand" data-set="0"><b>${setName(0)}</b><span>문제은행 ${QB.length}문항에서 매번 새로 뽑기</span>${best(0) != null ? `<em>최고 ${best(0)}점</em>` : ""}</button></div>
    ${S.hist.length ? `<h3>지난 기록</h3><div class="scroll"><table><thead><tr><th>날짜</th><th>회차</th><th>점수</th><th>1과목</th><th>2과목</th><th>결과</th></tr></thead><tbody>${S.hist.slice(-10).reverse().map(r => `<tr><td>${esc(r.d)}</td><td>${setName(r.set || 0)}</td><td class="num">${r.sc}</td><td class="num">${r.a}/10</td><td class="num">${r.b}/40</td><td>${r.p ? "합격" : "불합격"}</td></tr>`).join("")}</tbody></table></div>` : ""}
  </section>`;
  view.querySelectorAll("[data-set]").forEach(b => b.onclick = () => {
    const n = +b.dataset.set;
    const ids = n ? SETS.find(s => s.n === n).ids.filter(id => byId[id])
      : [...shuffle(QB.filter(q => q.s === 1)).slice(0, 10), ...shuffle(QB.filter(q => q.s === 2)).slice(0, 40)].map(q => q.id);
    S.mock = { set: n, ids, ans: {}, i: 0, t0: Date.now(), done: false }; save(); mockPaper(); window.scrollTo(0, 0);
  });
}
function mockPaper() {
  const M = S.mock, id = M.ids[M.i], q = byId[id];
  const { html: body } = qBody(q, `${M.i + 1}번`);
  const answered = Object.keys(M.ans).length;
  view.innerHTML = `<section class="panel frame" id="qcard">
    <div class="spread"><span class="eyebrow">${setName(M.set)} · ${M.i < 10 ? "제1과목" : "제2과목"}</span><span class="small muted">답안 ${answered} / ${M.ids.length}</span></div>
    ${body}
    <div class="opts">${q.o.map((t, i) => `<button class="opt ${M.ans[id] === i ? "sel" : ""}" data-i="${i}"><span class="no">${i + 1}</span><span>${esc(t)}</span></button>`).join("")}</div>
    <div class="navrow"><button class="btn" data-nav="-1" ${M.i ? "" : "disabled"}>← 이전</button><button class="btn primary" data-nav="1" ${M.i < M.ids.length - 1 ? "" : "disabled"}>다음 →</button></div>
  </section>
  <section class="panel"><h3>답안지 (OMR)</h3>
    <div class="omr">${M.ids.map((x, i) => `<button class="${M.ans[x] != null ? "done" : ""} ${i === M.i ? "cur" : ""}" data-j="${i}" aria-label="${i + 1}번">${i + 1}</button>`).join("")}</div>
    <div class="row"><button class="btn acc grow" id="mock-quit">시험 포기</button><button class="btn primary grow" id="mock-submit">답안 제출</button></div>
  </section>`;
  view.querySelectorAll(".opt").forEach(b => b.onclick = () => { M.ans[id] = +b.dataset.i; if (M.i < M.ids.length - 1) M.i++; save(); mockPaper(); top(); });
  view.querySelectorAll("[data-nav]").forEach(b => b.onclick = () => { M.i += +b.dataset.nav; save(); mockPaper(); top(); });
  view.querySelectorAll("[data-j]").forEach(b => b.onclick = () => { M.i = +b.dataset.j; save(); mockPaper(); top(); });
  document.getElementById("mock-submit").onclick = () => { const left = M.ids.length - Object.keys(M.ans).length; if (!left || confirm(`${left}문항을 풀지 않았다. 그래도 제출할까?`)) submitMock(); };
  document.getElementById("mock-quit").onclick = () => { if (confirm("이번 시험을 버리고 처음 화면으로 돌아갈까?")) { S.mock = null; save(); mockView(); } };
  const bar = document.getElementById("exambar");
  bar.hidden = false;
  bar.innerHTML = `<span class="small">${setName(M.set)}</span><span class="clock" id="clock">90:00</span><button class="btn sm primary" id="bar-submit">제출</button>`;
  document.getElementById("bar-submit").onclick = () => document.getElementById("mock-submit").click();
  clearInterval(tick);
  const upd = () => {
    const left = LIMIT - (Date.now() - M.t0), el = document.getElementById("clock");
    if (left <= 0) { clearInterval(tick); submitMock(); return; }
    if (el) { const m = Math.floor(left / 60000), s = Math.floor(left / 1000) % 60; el.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`; el.classList.toggle("warn", left < 10 * 60000); }
  };
  upd(); tick = setInterval(upd, 1000);
}
function submitMock() {
  clearInterval(tick); document.getElementById("exambar").hidden = true;
  const M = S.mock;
  let a = 0, b = 0;
  M.ids.forEach(id => { const q = byId[id], pick = M.ans[id]; if (pick == null) return; const ok = record(q, pick); if (ok) q.s === 1 ? a++ : b++; });
  const sc = (a + b) * 2, p = sc >= 60 && a >= 4 && b >= 16;
  M.done = true; M.res = { a, b, sc, p, sec: Math.round((Date.now() - M.t0) / 1000) };
  S.hist.push({ d: new Date().toISOString().slice(0, 10), set: M.set || 0, sc, a, b, p }); save(); mockResult(); window.scrollTo(0, 0);
}
function mockResult() {
  const M = S.mock, R = M.res, by = {};
  M.ids.forEach(id => { const q = byId[id], k = subOf(q), t = by[k] = by[k] || { n: 0, ok: 0 }; t.n++; if (M.ans[id] === q.a) t.ok++; });
  const rows = Object.entries(by).sort((x, y) => x[1].ok / x[1].n - y[1].ok / y[1].n);
  view.innerHTML = `<section class="panel frame"><div class="eyebrow">05 · ${setName(M.set)} 결과</div>
    <div class="pass ${R.p ? "ok" : "ng"}">${R.p ? "합격선 통과" : R.sc >= 60 ? "과락으로 불합격" : "불합격"}</div>
    <div class="kpis"><div><span>총점</span><b>${R.sc}<small> / 100</small></b></div><div><span>1과목 (과락 4개 미만)</span><b>${R.a}<small> / 10</small></b></div><div><span>2과목 (과락 16개 미만)</span><b>${R.b}<small> / 40</small></b></div></div>
    <p class="small muted">소요 시간 ${Math.floor(R.sec / 60)}분 ${R.sec % 60}초 · 틀린 문제는 오답노트에 자동으로 저장됐다.</p>
    <div class="sec"><div class="sec-h">세부항목별 정답 (낮은 순)</div><div class="bars">${rows.map(([k, t]) => `<div class="bar"><span>${esc(k)}</span><span class="tr"><i class="${t.ok / t.n < .6 ? "low" : ""}" style="width:${t.ok / t.n * 100}%"></i></span><b>${t.ok}/${t.n}</b></div>`).join("")}</div></div>
    <div class="sec"><div class="sec-h">문항별 채점 — 번호를 누르면 해설</div>
    <div class="omr">${M.ids.map((x, i) => `<button class="${M.ans[x] === byId[x].a ? "r" : "w"}" data-rv="${i}" aria-label="${i + 1}번 해설">${i + 1}</button>`).join("")}</div></div>
    <div class="row"><button class="btn primary grow" id="mock-again">다른 회차 풀기</button><button class="btn grow" id="mock-wrong">오답노트로</button></div>
  </section><div id="review"></div>`;
  const rv = i => {
    const id = M.ids[i], q = byId[id], { html: body, seen } = qBody(q, `${i + 1}번`), pick = M.ans[id];
    const box = document.getElementById("review");
    box.innerHTML = `<section class="panel frame" id="qcard">${body}
      <div class="opts">${q.o.map((t, j) => `<button class="opt ${j === q.a ? "right" : j === pick ? "wrong" : ""}" disabled><span class="no">${j + 1}</span><span>${esc(t)}</span></button>`).join("")}</div>
      ${pick == null ? `<p class="small muted">답을 표시하지 않은 문항</p>` : ""}${expHtml(q, pick == null ? null : pick, seen)}</section>`;
    bindConceptLinks(box); top();
  };
  view.querySelectorAll("[data-rv]").forEach(b => b.onclick = () => rv(+b.dataset.rv));
  document.getElementById("mock-again").onclick = () => { S.mock = null; save(); mockView(); };
  document.getElementById("mock-wrong").onclick = () => { S.mock = null; save(); setMode("wrong"); };
}

// ── 출제분석: 공식 자료 → 출제기준 커버리지 → 참고(복원 기출 추이)
function trendView() {
  const Y = OFF.years, last = Y[Y.length - 1], prev = Y[Y.length - 2], E = OFF.exam;
  const maxRate = 70;
  const cov = SYL.map(sj => `<tr class="sep"><td colspan="3">제${sj.s}과목 ${esc(sj.n)} · ${sj.q}문항 · ${sj.pt}점</td></tr>` + sj.items.map(it => `<tr class="grp"><td colspan="3">${esc(it.n)}</td></tr>` + it.subs.map(n => {
    const qs = QB.filter(q => subOf(q) === n);
    return `<tr><td><button class="link" data-sub="${esc(n)}">${esc(n)}</button></td><td class="n">${qs.length}</td><td class="n">${qs.filter(isKill).length}</td></tr>`;
  }).join("")).join("")).join("");
  const R = TREND.rounds, mx = 6;
  const shade = v => { if (!v) return ""; const a = Math.min(1, v / mx); return `background:color-mix(in srgb,var(--acc) ${Math.round(12 + a * 70)}%,var(--panel));${a > .55 ? "color:#fff;" : ""}`; };
  const rowsFor = s => Object.keys(TOPICS).filter(k => TOPICS[k].s === s).map(k => {
    const d = TREND.data[k] || [], sum = d.reduce((a, b) => a + b, 0);
    return `<tr><td class="t">${esc(TOPICS[k].n)}</td>${d.map(v => `<td class="c" style="${shade(v)}">${v || ""}</td>`).join("")}<td class="sum">${sum}</td></tr>`;
  }).join("");
  view.innerHTML = `<section class="panel frame"><div class="eyebrow">06 · 출제분석 · 공식 자료</div><h2>시험 구성과 합격 통계</h2>
    <div class="kpis"><div><span>1과목 ${esc(E.subjects[0][0])}</span><b>${E.subjects[0][1]}<small>문항 · ${E.subjects[0][2]}점</small></b></div><div><span>2과목 ${esc(E.subjects[1][0])}</span><b>${E.subjects[1][1]}<small>문항 · ${E.subjects[1][2]}점</small></b></div><div><span>시험 시간</span><b>${E.minutes}<small>분</small></b></div></div>
    <p class="why"><b>합격 기준:</b> ${esc(E.pass)} · <b>과락:</b> ${esc(E.cut)}. 1과목은 4문항(8점), 2과목은 16문항(32점)보다 적게 맞히면 총점과 상관없이 불합격이다.</p>
    <div class="sec"><div class="sec-h">연도별 합격률 (개발자·공인)</div><div class="bars">${Y.map(y => `<div class="bar"><span>${y[0]}년 · ${fmt(y[3])}명 응시</span><span class="tr"><i class="${y[5] < 45 ? "low" : ""}" style="width:${y[5] / maxRate * 100}%"></i></span><b>${y[5]}%</b></div>`).join("")}</div></div>
    <div class="scroll"><table><thead><tr><th>연도</th><th>회</th><th>접수</th><th>응시</th><th>취득</th><th>합격률</th></tr></thead><tbody>${Y.slice().reverse().map(y => `<tr><td class="num">${y[0]}</td><td class="num">${y[1]}</td><td class="num">${fmt(y[2])}</td><td class="num">${fmt(y[3])}</td><td class="num">${fmt(y[4])}</td><td class="num">${y[5]}%</td></tr>`).join("")}</tbody></table></div>
    <p class="why">${last[0]}년 응시자는 ${fmt(last[3])}명으로 ${prev[0]}년보다 ${fmt(last[3] - prev[3])}명 늘었지만, 합격자는 ${fmt(prev[4] - last[4])}명 줄어 합격률이 ${prev[5]}% → ${last[5]}%로 ${(prev[5] - last[5]).toFixed(1)}%p 떨어졌다. 2019년 이후 가장 낮은 합격률이다. 하락 원인(난이도·응시자 구성)은 공개되지 않았지만, '쉬운 회차' 평가만 믿고 방심할 상황은 아니다.</p>
    <p class="small muted">출처: <a href="${OFF.srcExam.url}" target="_blank" rel="noopener">${esc(OFF.srcExam.n)}</a> · <a href="${OFF.srcStats.url}" target="_blank" rel="noopener">${esc(OFF.srcStats.n)}</a></p>
  </section>
  <section class="panel frame"><div class="eyebrow">공식 출제기준 × 이 앱의 문제은행</div><h2>세부항목별 문항 수</h2>
    <p class="lead">공식 출제기준의 세부항목마다 이 앱에 몇 문제가 있는지 보여 준다. 세부항목 이름을 누르면 그 문제만 풀 수 있다.</p>
    <div class="scroll"><table class="cov"><thead><tr><th>세부항목</th><th>문항</th><th>고오답</th></tr></thead><tbody>${cov}</tbody></table></div>
  </section>
  <section class="panel"><div class="eyebrow">참고 자료 · 복원 기출 기반</div><h2>55~61회 주제별 출제 지도</h2>
    <p class="lead">${esc(TREND.src)} 칸이 진할수록 많이 나왔다.</p>
    <div class="scroll heat"><table><thead><tr><th>주제</th>${R.map(r => `<th>${r}회</th>`).join("")}<th>합</th></tr></thead><tbody>
      <tr class="sep"><td colspan="${R.length + 2}">제1과목 · 데이터 모델링의 이해</td></tr>${rowsFor(1)}
      <tr class="sep"><td colspan="${R.length + 2}">제2과목 · SQL 기본 및 활용</td></tr>${rowsFor(2)}
    </tbody></table></div>
    <p class="why">2과목은 'NULL을 어떻게 다루는가'가 가장 큰 축이다. NOT IN·집계 함수·아우터 조인·정렬 위치까지 NULL이 걸린 문항이 매 회 여러 개 나온다. 61회는 서브쿼리와 TOP-N이 늘고 정규표현식이 빠졌다. 1과목은 식별자·관계·엔터티가 절반 이상이다.</p>
  </section>
  <section class="panel frame"><div class="eyebrow">다음 시험 우선순위</div><h2>먼저 잡을 유형</h2>
    <ol class="focus">${TREND.focus.map(f => { const n = QB.filter(q => q.tp === f.tp).length; return `<li><div><b>${esc(TOPICS[f.tp].n)}</b><span>${esc(f.why)}</span>${n ? `<div class="row" style="margin-top:8px"><button class="btn sm acc" data-practice="${f.tp}">문제 ${n}개 풀기 →</button></div>` : ""}</div></li>`; }).join("")}</ol>
  </section>`;
  bindPractice();
}

// ── 모드 전환
let mode = "quiz";
function setMode(m, silent) {
  mode = m;
  document.querySelectorAll(".tabs button").forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === m));
  if (m !== "mock") { clearInterval(tick); document.getElementById("exambar").hidden = true; }
  try { localStorage.setItem("sqld.mode", m); } catch (e) {}
  if (silent) return;
  ({ quiz: () => quizView(false), wrong: () => quizView(true), concept: conceptView, card: cardView, mock: mockView, trend: trendView })[m]();
  window.scrollTo(0, 0);
}
document.querySelectorAll(".tabs button").forEach(b => b.onclick = () => setMode(b.dataset.mode));
document.addEventListener("keydown", e => {
  if (e.target.closest && e.target.closest("input,textarea,select")) return;
  if ((mode === "quiz" || mode === "wrong") && view.querySelector(".opt")) {
    if (/^[1-4]$/.test(e.key)) { const b = view.querySelector(`.opt[data-i="${+e.key - 1}"]`); if (b && !b.disabled) b.click(); }
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  }
});

// 테마
function applyTheme() { if (S.theme) document.documentElement.dataset.theme = S.theme; else delete document.documentElement.dataset.theme; }
document.getElementById("theme-btn").onclick = () => {
  const dark = S.theme ? S.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  S.theme = dark ? "light" : "dark"; save(); applyTheme();
};
document.getElementById("reset-btn").onclick = () => {
  if (!confirm("풀이 기록·오답노트·외운 카드·모의고사 기록을 모두 지울까?")) return;
  S = { log: {}, wrong: [], known: [], theme: S.theme, mock: null, hist: [] }; save(); stats(); setMode(mode);
};
applyTheme(); stats();
let start = "quiz"; try { start = localStorage.getItem("sqld.mode") || "quiz"; } catch (e) {}
if (S.mock && !S.mock.done) start = "mock";
setMode(["quiz", "wrong", "concept", "card", "mock", "trend"].includes(start) ? start : "quiz");
})();
