// SQLD 공학노트 — 화면 로직 (데이터: data/*.js)
(function () {
"use strict";
const QB = window.QB || [], TOPICS = window.TOPICS, CONCEPTS = window.CONCEPTS, CARDS = window.CARDS, TREND = window.TREND;
const byId = Object.fromEntries(QB.map(q => [q.id, q]));
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
const h = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content; };

// 약어는 문항(또는 개념 블록)마다 처음 나올 때 괄호로 풀어 쓴다
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
function abbr(text, seen) {
  return esc(text).replace(ABBR_RE, (m, k, off, str) => {
    if (seen.has(k)) return m;
    seen.add(k);
    if (/^\s*\(/.test(str.slice(off + m.length))) return m;
    return `${m}<span class="muted">(${esc(ABBR[k])})</span>`;
  });
}

// SQL 강조
const KW = new Set(("SELECT FROM WHERE GROUP BY HAVING ORDER ASC DESC AND OR NOT IN IS NULL AS JOIN LEFT RIGHT FULL OUTER INNER CROSS NATURAL ON USING " +
  "UNION ALL INTERSECT MINUS EXCEPT DISTINCT COUNT SUM AVG MIN MAX NVL NVL2 NULLIF COALESCE DECODE CASE WHEN THEN ELSE END OVER PARTITION ROWS RANGE " +
  "BETWEEN UNBOUNDED PRECEDING FOLLOWING CURRENT ROW RANK DENSE_RANK ROW_NUMBER LAG LEAD NTILE FIRST_VALUE LAST_VALUE CUME_DIST PERCENT_RANK " +
  "ROLLUP CUBE GROUPING SETS START WITH CONNECT PRIOR LEVEL SIBLINGS CONNECT_BY_ISLEAF ROWNUM FETCH FIRST TIES ONLY EXISTS ANY PIVOT UNPIVOT FOR " +
  "REGEXP_SUBSTR REGEXP_COUNT REGEXP_INSTR MERGE INTO MATCHED UPDATE SET INSERT VALUES DELETE CREATE TABLE NUMBER VARCHAR2 DATE PRIMARY KEY DEFAULT " +
  "COMMIT ROLLBACK SAVEPOINT TO GRANT REVOKE OPTION ALTER ADD MODIFY RENAME COLUMN DROP DUAL LIKE ESCAPE SUBSTR INSTR LENGTH TRIM LPAD ROUND CEIL FLOOR TRUNCATE").split(" "));
function sqlHL(code) {
  return String(code).replace(/(--[^\n]*)|('(?:[^']|'')*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_$#]*)|([\s\S])/g, (m, c, s, n, w) => {
    if (c) return `<span class="c">${esc(c)}</span>`;
    if (s) return `<span class="s">${esc(s)}</span>`;
    if (n) return `<span class="n">${n}</span>`;
    if (w) return KW.has(w.toUpperCase()) ? `<span class="k">${w}</span>` : w;
    return esc(m);
  });
}
const term = (code, label) => `<div class="term"><div class="term-bar"><span>${label || "SQL> ORACLE"}</span><i><b></b></i></div><pre>${sqlHL(code)}</pre></div>`;
function cell(v) {
  if (v === null || v === undefined) return `<td><span class="null">NULL</span></td>`;
  if (typeof v === "number") return `<td class="num">${v}</td>`;
  return `<td>${esc(v)}</td>`;
}
function tbl(t, cap) {
  const hl = new Set(t.hl || []);
  return `<div class="dt">${cap || t.n ? `<div class="dt-cap">${esc(cap || t.n)}</div>` : ""}<div class="scroll"><table>
    <thead><tr>${t.c.map(c => `<th>${esc(c)}</th>`).join("")}</tr></thead>
    <tbody>${t.r.map((r, i) => `<tr${hl.has(i) ? ' class="hl"' : ""}>${r.map(cell).join("")}</tr>`).join("")}</tbody></table></div></div>`;
}
const stars = lv => `<span class="lv">난이도 <b>${"■".repeat(lv)}${"□".repeat(3 - lv)}</b></span>`;

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
    document.getElementById("st-dday-l").textContent = `${next.n}회 ${next.d.slice(5).replace("-", "/")}`;
    document.getElementById("st-dday").textContent = d ? "D-" + d : "D-DAY";
  }
}

// ── 문제 카드
function qBody(q) {
  const seen = new Set();
  let html = `<div class="qhead"><span class="qid">${q.id}</span><span class="qth">${esc(q.th)}</span>${stars(q.lv)}</div>
    <p class="qtext">${abbr(q.q, seen)}</p>`;
  if (q.tb) html += `<div class="tables">${q.tb.map(t => tbl(t)).join("")}</div>`;
  if (q.box) html += `<div class="box">${abbr(q.box, seen)}</div>`;
  if (q.sql) html += term(q.sql);
  return { html, seen };
}
function expHtml(q, pick, seen) {
  const right = pick === q.a;
  let html = `<div class="exp">
    <div class="verdict">${pick == null ? "" : `<span class="stamp ${right ? "ok" : "ng"}">${right ? "PASS ✓" : "FAIL ✗"}</span>`}
      <span class="ans">정답 ${NO[q.a]} ${esc(q.o[q.a])}</span></div>
    <div class="sec"><div class="label">핵심 원리</div><p class="why">${abbr(q.why, seen)}</p></div>`;
  if (q.st && q.st.length) {
    html += `<div class="sec"><div class="label">단계별 추적</div>${q.st.map(s => {
      const mono = s.n && /[├└│─]|^(SELECT|MERGE|  -)/m.test(s.n);
      return `<div class="step"><h4>${esc(s.t)}</h4>${s.tb ? tbl(s.tb, "") : ""}${s.n ? `<p class="note${mono ? " tree" : ""}">${mono ? esc(s.n) : abbr(s.n, seen)}</p>` : ""}</div>`;
    }).join("")}</div>`;
  }
  if (q.res) html += `<div class="final"><div class="label">최종 결과</div>${tbl(q.res, "")}</div>`;
  html += `<div class="sec"><div class="label">보기 분석</div><ul class="oxl">${q.ox.map((t, i) =>
    `<li class="${i === q.a ? "right" : i === pick ? "mine" : ""}"><span class="no">${NO[i]}</span><span>${abbr(t, seen)}</span></li>`).join("")}</ul></div>`;
  if (q.trap) html += `<div class="warn"><b>⚠ 출제 함정</b>${abbr(q.trap, seen)}</div>`;
  if (q.memo) html += `<div class="memo"><i>MEMO</i>${esc(q.memo)}</div>`;
  html += q.pg ? `<span class="verify">✓ 정답을 PostgreSQL에서 실행해 대조함</span>` : `<span class="verify no">○ 이론·Oracle 고유 동작 문항 — 해설의 근거로 검토함</span>`;
  return html + `</div>`;
}

// ── 문제풀이 / 오답노트
let quiz = { subj: 0, tp: "", order: "seq", list: [], i: 0, pick: null, wrongMode: false };
function buildList() {
  let L = QB.filter(q => (!quiz.subj || q.s === quiz.subj) && (!quiz.tp || q.tp === quiz.tp));
  if (quiz.wrongMode) L = S.wrong.map(id => byId[id]).filter(Boolean).filter(q => !quiz.tp || q.tp === quiz.tp);
  if (quiz.order === "new") L = L.filter(q => !S.log[q.id]);
  if (quiz.order === "rand") L = shuffle(L);
  quiz.list = L.map(q => q.id); quiz.i = 0; quiz.pick = null;
}
function quizView(wrongMode) {
  if (quiz.wrongMode !== wrongMode) { quiz.wrongMode = wrongMode; quiz.tp = ""; quiz.subj = 0; }
  buildList(); renderQuiz();
}
function topicChips(pool, cur) {
  const cnt = {};
  pool.forEach(q => cnt[q.tp] = (cnt[q.tp] || 0) + 1);
  return `<button class="chip" data-tp="" aria-pressed="${!cur}">전체<small>${pool.length}</small></button>` +
    Object.keys(TOPICS).filter(k => cnt[k]).map(k => `<button class="chip" data-tp="${k}" aria-pressed="${cur === k}">${esc(TOPICS[k].n)}<small>${cnt[k]}</small></button>`).join("");
}
function renderQuiz() {
  const wm = quiz.wrongMode;
  const pool = wm ? S.wrong.map(id => byId[id]).filter(Boolean) : QB.filter(q => !quiz.subj || q.s === quiz.subj);
  const id = quiz.list[quiz.i], q = byId[id];
  let html = `<section class="panel frame">
    <div class="label">${wm ? "04 · 오답노트" : "03 · 문제풀이"}</div>
    <h2>${wm ? "틀린 문제 다시 풀기" : "주제별 문제풀이"}</h2>
    <p class="muted small">${wm ? "맞히면 오답노트에서 빠진다. 같은 함정에 두 번 걸리지 않는 것이 목표." : "보기를 고르면 바로 단계별 추적 해설이 열린다. 숫자키 1~4로 고르고, ← → 로 넘긴다."}</p>
    ${wm ? "" : `<div class="chips" role="group" aria-label="과목">${["전체", "1과목 데이터 모델링", "2과목 SQL"].map((t, i) => `<button class="chip" data-subj="${i}" aria-pressed="${quiz.subj === i}">${t}</button>`).join("")}</div>`}
    <div class="chips sub" role="group" aria-label="주제">${topicChips(pool, quiz.tp)}</div>
    ${wm ? "" : `<div class="chips" role="group" aria-label="순서">${[["seq", "번호순"], ["rand", "무작위"], ["new", "안 푼 문제만"]].map(([k, t]) => `<button class="chip" data-order="${k}" aria-pressed="${quiz.order === k}">${t}</button>`).join("")}</div>`}
  </section>`;
  if (!q) {
    html += `<section class="panel"><p class="empty">${wm ? "오답노트가 비어 있다. 문제풀이에서 틀린 문제가 여기에 모인다." : "조건에 맞는 문제가 없다. 필터를 바꿔 보자."}</p></section>`;
    view.innerHTML = html; bindQuizFilters(); return;
  }
  const { html: body, seen } = qBody(q);
  html += `<section class="panel frame" id="qcard">
    <div class="row" style="justify-content:space-between"><span class="label">${quiz.i + 1} / ${quiz.list.length}</span>${S.log[id] ? `<span class="lv">기록 ${S.log[id].ok}/${S.log[id].n} 정답</span>` : ""}</div>
    <div class="meter"><i style="width:${(quiz.i + 1) / quiz.list.length * 100}%"></i></div>
    ${body}
    <div class="opts">${q.o.map((t, i) => {
      const cls = quiz.pick == null ? "" : i === q.a ? "right" : i === quiz.pick ? "wrong" : "";
      return `<button class="opt ${cls}" data-i="${i}" ${quiz.pick != null ? "disabled" : ""}><span class="no">${i + 1}</span><span>${esc(t)}</span></button>`;
    }).join("")}</div>
    ${quiz.pick != null ? expHtml(q, quiz.pick, seen) : ""}
    <div class="navrow"><button class="btn" data-nav="-1" ${quiz.i ? "" : "disabled"}>← 이전</button><button class="btn primary" data-nav="1" ${quiz.i < quiz.list.length - 1 ? "" : "disabled"}>다음 →</button></div>
  </section>`;
  view.innerHTML = html; bindQuizFilters();
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
  if (n < 0 || n >= quiz.list.length) return;
  if (quiz.wrongMode && quiz.pick != null) { // 맞혀서 빠진 문제는 목록에서 정리
    const before = quiz.list[quiz.i];
    if (!S.wrong.includes(before)) { quiz.list.splice(quiz.i, 1); quiz.i = d > 0 ? quiz.i : Math.max(0, quiz.i - 1); quiz.pick = null; renderQuiz(); top(); return; }
  }
  quiz.i = n; quiz.pick = null; renderQuiz(); top();
}
const top = () => document.getElementById("qcard") && document.getElementById("qcard").scrollIntoView({ block: "start" });
function bindQuizFilters() {
  view.querySelectorAll("[data-subj]").forEach(b => b.onclick = () => { quiz.subj = +b.dataset.subj; quiz.tp = ""; buildList(); renderQuiz(); });
  view.querySelectorAll("[data-tp]").forEach(b => b.onclick = () => { quiz.tp = b.dataset.tp; buildList(); renderQuiz(); });
  view.querySelectorAll("[data-order]").forEach(b => b.onclick = () => { quiz.order = b.dataset.order; buildList(); renderQuiz(); });
}

// ── 개념정리
const spark = tp => { const d = TREND.data[tp] || [], mx = 6; return `<span class="spark" title="55~61회 출제 수: ${d.join(", ")}">${d.map((v, i) => `<i class="${i === d.length - 1 ? "last" : ""}" style="height:${Math.max(2, v / mx * 18)}px"></i>`).join("")}</span>`; };
function conceptView() {
  let html = `<section class="panel frame"><div class="label">01 · 개념정리</div><h2>시험 범위 전체 설계도</h2>
    <p class="muted small">주제마다 55~61회 출제 수 막대(주황 = 61회)를 붙였다. 정리를 읽고 바로 그 주제 문제로 넘어가자.</p>
    <div class="label" style="margin-top:4px">제1과목 데이터 모델링의 이해 (10문항)</div>
    <div class="toc">${CONCEPTS.filter(c => TOPICS[c.tp].s === 1).map(c => `<a href="#c-${c.tp}">${esc(TOPICS[c.tp].n)}<small>${(TREND.data[c.tp] || []).reduce((a, b) => a + b, 0)}문항 / 7회</small></a>`).join("")}</div>
    <div class="label">제2과목 SQL 기본 및 활용 (40문항)</div>
    <div class="toc">${CONCEPTS.filter(c => TOPICS[c.tp].s === 2).map(c => `<a href="#c-${c.tp}">${esc(TOPICS[c.tp].n)}<small>${(TREND.data[c.tp] || []).reduce((a, b) => a + b, 0)}문항 / 7회</small></a>`).join("")}</div>
  </section>`;
  for (const c of CONCEPTS) {
    const seen = new Set(), n = QB.filter(q => q.tp === c.tp).length;
    html += `<section class="panel concept" id="c-${c.tp}">
      <div class="chead"><div><div class="label">${TOPICS[c.tp].s}과목 · ${c.tp.toUpperCase()}</div><h2>${esc(TOPICS[c.tp].n)}</h2></div>
        <div class="freq">55→61회 ${spark(c.tp)}</div></div>
      ${c.b.map(b => `<div class="blk"><h3>${esc(b.h)}</h3>
        ${b.code ? `<pre class="inline">${sqlHL(b.code)}</pre>` : ""}
        ${b.t ? `<p>${abbr(b.t, seen)}</p>` : ""}
        ${b.tb ? tbl(b.tb, "") : ""}
        ${b.memo ? `<span class="memo"><i>MEMO</i>${esc(b.memo)}</span>` : ""}</div>`).join("")}
      ${n ? `<div class="row"><button class="btn sm acc" data-practice="${c.tp}">이 주제 문제 ${n}개 풀기 →</button></div>` : ""}
    </section>`;
  }
  view.innerHTML = html;
  bindPractice();
  view.querySelectorAll(".toc a").forEach(a => a.onclick = e => { e.preventDefault(); const el = document.querySelector(a.getAttribute("href")); if (el) el.scrollIntoView({ behavior: "smooth" }); });
}
function bindPractice() {
  view.querySelectorAll("[data-practice]").forEach(b => b.onclick = () => {
    quiz.wrongMode = false; quiz.subj = 0; quiz.tp = b.dataset.practice; quiz.order = "seq";
    setMode("quiz", true); buildList(); renderQuiz(); window.scrollTo(0, 0);
  });
}

// ── 암기카드
let card = { tp: "", i: 0, flip: false, list: [], hideKnown: false };
function cardList() {
  card.list = CARDS.map((c, i) => ({ ...c, k: c.tp + ":" + c.f })).filter(c => (!card.tp || c.tp === card.tp) && (!card.hideKnown || !S.known.includes(c.k)));
  if (card.i >= card.list.length) card.i = 0;
}
function cardView() {
  cardList();
  const c = card.list[card.i], known = CARDS.filter(x => S.known.includes(x.tp + ":" + x.f)).length;
  const cnt = {}; CARDS.forEach(x => cnt[x.tp] = (cnt[x.tp] || 0) + 1);
  let html = `<section class="panel frame"><div class="label">02 · 암기카드</div><h2>공식 압축 카드 ${CARDS.length}장</h2>
    <p class="muted small">카드를 눌러 뒤집는다. '외웠다'를 누른 카드는 숨길 수 있다. 외운 카드 ${known}/${CARDS.length}</p>
    <div class="meter ok"><i style="width:${known / CARDS.length * 100}%"></i></div>
    <div class="chips sub"><button class="chip" data-ctp="" aria-pressed="${!card.tp}">전체<small>${CARDS.length}</small></button>${Object.keys(TOPICS).filter(k => cnt[k]).map(k => `<button class="chip" data-ctp="${k}" aria-pressed="${card.tp === k}">${esc(TOPICS[k].n)}<small>${cnt[k]}</small></button>`).join("")}</div>
    <div class="row"><button class="chip" id="hide-known" aria-pressed="${card.hideKnown}">외운 카드 숨기기</button><button class="chip" id="shuffle-c">섞기</button></div>
  </section>`;
  if (!c) html += `<section class="panel"><p class="empty">이 묶음의 카드를 모두 외웠다. '외운 카드 숨기기'를 끄면 다시 볼 수 있다.</p></section>`;
  else html += `<section class="panel" id="qcard">
    <div class="row" style="justify-content:space-between"><span class="label">${card.i + 1} / ${card.list.length} · ${esc(TOPICS[c.tp].n)}</span>${S.known.includes(c.k) ? `<span class="verify">✓ 외움</span>` : ""}</div>
    <button class="flash" id="flash" aria-label="카드 뒤집기"><span class="corner tl"></span><span class="corner br"></span>
      <span class="front">${esc(c.f)}</span>${card.flip ? `<span class="back">${esc(c.b)}</span>` : ""}
      <span class="tap">${card.flip ? "TAP · 앞면으로" : "TAP · 정답 보기"}</span></button>
    <div class="navrow"><button class="btn" data-cn="-1">← 이전</button><button class="btn acc" id="again">다시 볼래</button><button class="btn ok" id="gotit">외웠다</button><button class="btn" data-cn="1">다음 →</button></div>
  </section>`;
  view.innerHTML = html;
  view.querySelectorAll("[data-ctp]").forEach(b => b.onclick = () => { card.tp = b.dataset.ctp; card.i = 0; card.flip = false; cardView(); });
  const hk = document.getElementById("hide-known"); hk.onclick = () => { card.hideKnown = !card.hideKnown; card.i = 0; cardView(); };
  document.getElementById("shuffle-c").onclick = () => { const s = shuffle(CARDS); CARDS.splice(0, CARDS.length, ...s); card.i = 0; card.flip = false; cardView(); };
  if (!c) return;
  document.getElementById("flash").onclick = () => { card.flip = !card.flip; cardView(); };
  const step = d => { card.i = (card.i + d + card.list.length) % card.list.length; card.flip = false; cardView(); };
  view.querySelectorAll("[data-cn]").forEach(b => b.onclick = () => step(+b.dataset.cn));
  document.getElementById("gotit").onclick = () => { if (!S.known.includes(c.k)) S.known.push(c.k); save(); if (card.hideKnown) { card.flip = false; cardView(); } else step(1); };
  document.getElementById("again").onclick = () => { S.known = S.known.filter(k => k !== c.k); save(); step(1); };
}

// ── 모의고사 (실전: 1과목 10 + 2과목 40, 90분, 문항당 2점)
let tick = null;
function mockView() {
  clearInterval(tick); document.getElementById("exambar").hidden = true;
  const M = S.mock;
  if (M && !M.done) return mockPaper();
  if (M && M.done) return mockResult();
  const s1 = QB.filter(q => q.s === 1).length, s2 = QB.filter(q => q.s === 2).length;
  view.innerHTML = `<section class="panel frame"><div class="label">05 · 모의고사</div><h2>실전 모의고사 50문항</h2>
    <div class="scroll"><table><tbody>
      <tr><th>구성</th><td>1과목 데이터 모델링 10문항 + 2과목 SQL 40문항 (문제은행 ${s1} + ${s2}문항에서 무작위 추출)</td></tr>
      <tr><th>시간</th><td>90분 — 시간이 끝나면 자동 제출</td></tr>
      <tr><th>배점</th><td>문항당 2점, 100점 만점</td></tr>
      <tr><th>합격</th><td>총점 60점 이상 + 과목별 40% 이상 (1과목 8점·2과목 32점 미만이면 과락)</td></tr>
    </tbody></table></div>
    <button class="btn primary" id="mock-start">시험 시작</button>
    ${S.hist.length ? `<div class="label">지난 기록</div><div class="scroll"><table><thead><tr><th>날짜</th><th>점수</th><th>1과목</th><th>2과목</th><th>결과</th></tr></thead><tbody>${S.hist.slice(-8).reverse().map(r => `<tr><td>${esc(r.d)}</td><td class="num">${r.sc}</td><td class="num">${r.a}/10</td><td class="num">${r.b}/40</td><td>${r.p ? "합격" : "불합격"}</td></tr>`).join("")}</tbody></table></div>` : ""}
  </section>`;
  document.getElementById("mock-start").onclick = () => {
    const ids = [...shuffle(QB.filter(q => q.s === 1)).slice(0, 10), ...shuffle(QB.filter(q => q.s === 2)).slice(0, 40)].map(q => q.id);
    S.mock = { ids, ans: {}, i: 0, t0: Date.now(), done: false }; save(); mockPaper();
  };
}
const LIMIT = 90 * 60 * 1000;
function mockPaper() {
  const M = S.mock, id = M.ids[M.i], q = byId[id];
  const { html: body } = qBody(q);
  const answered = Object.keys(M.ans).length;
  view.innerHTML = `<section class="panel frame" id="qcard">
    <div class="row" style="justify-content:space-between"><span class="label">${M.i < 10 ? "제1과목" : "제2과목"} · 문항 ${M.i + 1} / 50</span><span class="lv">답안 ${answered}/50</span></div>
    ${body}
    <div class="opts">${q.o.map((t, i) => `<button class="opt ${M.ans[id] === i ? "sel" : ""}" data-i="${i}"><span class="no">${i + 1}</span><span>${esc(t)}</span></button>`).join("")}</div>
    <div class="navrow"><button class="btn" data-nav="-1" ${M.i ? "" : "disabled"}>← 이전</button><button class="btn primary" data-nav="1" ${M.i < 49 ? "" : "disabled"}>다음 →</button></div>
  </section>
  <section class="panel"><div class="label">답안지 (OMR)</div>
    <div class="omr">${M.ids.map((x, i) => `<button class="${M.ans[x] != null ? "done" : ""} ${i === M.i ? "cur" : ""}" data-j="${i}" aria-label="${i + 1}번">${i + 1}</button>`).join("")}</div>
    <div class="row"><button class="btn acc grow" id="mock-quit">시험 포기</button><button class="btn primary grow" id="mock-submit">답안 제출</button></div>
  </section>`;
  view.querySelectorAll(".opt").forEach(b => b.onclick = () => { M.ans[id] = +b.dataset.i; save(); if (M.i < 49) { M.i++; save(); } mockPaper(); top(); });
  view.querySelectorAll("[data-nav]").forEach(b => b.onclick = () => { M.i += +b.dataset.nav; save(); mockPaper(); top(); });
  view.querySelectorAll("[data-j]").forEach(b => b.onclick = () => { M.i = +b.dataset.j; save(); mockPaper(); top(); });
  document.getElementById("mock-submit").onclick = () => { const left = 50 - Object.keys(M.ans).length; if (!left || confirm(`${left}문항을 풀지 않았다. 그래도 제출할까?`)) submitMock(); };
  document.getElementById("mock-quit").onclick = () => { if (confirm("이번 시험을 버리고 처음 화면으로 돌아갈까?")) { S.mock = null; save(); mockView(); } };
  const bar = document.getElementById("exambar");
  bar.hidden = false;
  bar.innerHTML = `<span class="label">SQLD 실전</span><span class="clock" id="clock">90:00</span><button class="btn sm primary" id="bar-submit">제출</button>`;
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
  M.ids.forEach((id, i) => { const q = byId[id], pick = M.ans[id]; if (pick == null) return; const ok = record(q, pick); if (ok) i < 10 ? a++ : b++; });
  const sc = (a + b) * 2, p = sc >= 60 && a >= 4 && b >= 16;
  M.done = true; M.res = { a, b, sc, p, sec: Math.round((Date.now() - M.t0) / 1000) };
  S.hist.push({ d: new Date().toISOString().slice(0, 10), sc, a, b, p }); save(); mockResult(); window.scrollTo(0, 0);
}
function mockResult() {
  const M = S.mock, R = M.res, by = {};
  M.ids.forEach(id => { const q = byId[id], t = by[q.tp] = by[q.tp] || { n: 0, ok: 0 }; t.n++; if (M.ans[id] === q.a) t.ok++; });
  const rows = Object.entries(by).sort((x, y) => x[1].ok / x[1].n - y[1].ok / y[1].n);
  view.innerHTML = `<section class="panel frame"><div class="label">05 · 모의고사 결과</div>
    <div class="pass ${R.p ? "ok" : "ng"}">${R.p ? "합격선 통과" : R.sc >= 60 ? "과락으로 불합격" : "불합격"}</div>
    <div class="score"><div><span>TOTAL</span><b>${R.sc}<small>/100</small></b></div><div><span>1과목</span><b>${R.a}<small>/10</small></b></div><div><span>2과목</span><b>${R.b}<small>/40</small></b></div></div>
    <p class="muted small">소요 ${Math.floor(R.sec / 60)}분 ${R.sec % 60}초 · 과락 기준: 1과목 4문항, 2과목 16문항 미만 · 틀린 문제는 오답노트에 자동 저장됨</p>
    <div class="label">주제별 정답률 (낮은 순)</div>
    <div class="bars">${rows.map(([tp, t]) => `<div class="bar"><span>${esc(TOPICS[tp].n)}</span><span class="tr"><i class="${t.ok / t.n < .6 ? "low" : ""}" style="width:${t.ok / t.n * 100}%"></i></span><b>${t.ok}/${t.n}</b></div>`).join("")}</div>
    <div class="label">문항별 채점</div>
    <div class="omr">${M.ids.map((x, i) => `<button class="${M.ans[x] === byId[x].a ? "r" : "w"}" data-rv="${i}" aria-label="${i + 1}번 해설">${i + 1}</button>`).join("")}</div>
    <div class="row"><button class="btn primary grow" id="mock-again">새 모의고사</button><button class="btn grow" id="mock-wrong">오답노트로</button></div>
  </section><div id="review"></div>`;
  const rv = i => {
    const id = M.ids[i], q = byId[id], { html: body, seen } = qBody(q), pick = M.ans[id];
    document.getElementById("review").innerHTML = `<section class="panel frame" id="qcard">${body}
      <div class="opts">${q.o.map((t, j) => `<button class="opt ${j === q.a ? "right" : j === pick ? "wrong" : ""}" disabled><span class="no">${j + 1}</span><span>${esc(t)}</span></button>`).join("")}</div>
      ${pick == null ? `<p class="muted small">답을 표시하지 않은 문항</p>` : ""}${expHtml(q, pick == null ? null : pick, seen)}</section>`;
    top();
  };
  view.querySelectorAll("[data-rv]").forEach(b => b.onclick = () => rv(+b.dataset.rv));
  document.getElementById("mock-again").onclick = () => { S.mock = null; save(); mockView(); };
  document.getElementById("mock-wrong").onclick = () => { setMode("wrong"); };
}

// ── 출제분석
function trendView() {
  const R = TREND.rounds, mx = 6;
  const shade = v => { if (!v) return ""; const a = Math.min(1, v / mx); return `background:color-mix(in srgb,var(--acc) ${Math.round(12 + a * 70)}%,var(--panel));${a > .55 ? "color:#fff;" : ""}`; };
  const rowsFor = s => Object.keys(TOPICS).filter(k => TOPICS[k].s === s).map(k => {
    const d = TREND.data[k] || [], sum = d.reduce((a, b) => a + b, 0);
    return `<tr><td class="t">${esc(TOPICS[k].n)}</td>${d.map(v => `<td class="c" style="${shade(v)}">${v || ""}</td>`).join("")}<td class="sum">${sum}</td></tr>`;
  }).join("");
  view.innerHTML = `<section class="panel frame"><div class="label">06 · 출제분석</div><h2>55~61회 주제별 출제 지도</h2>
    <p class="muted small">${esc(TREND.src)} 칸이 진할수록 많이 나왔다.</p>
    <div class="scroll heat"><table><thead><tr><th>주제</th>${R.map(r => `<th>${r}회</th>`).join("")}<th>합</th></tr></thead><tbody>
      <tr class="sep"><td colspan="${R.length + 2}">제1과목 · 데이터 모델링의 이해 (10문항)</td></tr>${rowsFor(1)}
      <tr class="sep"><td colspan="${R.length + 2}">제2과목 · SQL 기본 및 활용 (40문항)</td></tr>${rowsFor(2)}
    </tbody></table></div>
  </section>
  <section class="panel"><div class="label">추이에서 읽히는 것</div>
    <p class="why">① 2과목은 'NULL을 어떻게 다루는가'가 가장 큰 축이다. NOT IN·IN 목록·집계 함수·아우터 조인·정렬 위치까지 NULL이 걸린 문항이 매 회 여러 개 나온다. ② 61회는 서브쿼리(5)·TOP-N(4)이 늘고 정규표현식이 빠졌다. ③ 1과목은 식별자·관계·엔터티 분류가 10문항 중 절반 이상을 차지하고, 트랜잭션 ACID가 1과목에서 꾸준히 1문항씩 나온다. ④ 61회는 '매우 쉬웠다'는 평이 많았다. 쉬운 회차 다음에는 계산형(윈도우 프레임·ROLLUP 건수·계층 전개)이 다시 어려워지는 경우가 많으니 킬러 유형을 놓치지 말자.</p>
  </section>
  <section class="panel frame"><div class="label">다음 시험 우선순위</div>
    <ol class="focus">${TREND.focus.map(f => { const n = QB.filter(q => q.tp === f.tp).length; return `<li><div><b>${esc(TOPICS[f.tp].n)}</b><span>${esc(f.why)}</span>${n ? `<div class="go"><button class="btn sm acc" data-practice="${f.tp}">문제 ${n}개 →</button></div>` : ""}</div></li>`; }).join("")}</ol>
  </section>`;
  bindPractice();
}

// ── 모드 전환
let mode = "quiz";
function setMode(m, silent) {
  mode = m;
  document.querySelectorAll(".tabs button").forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === m));
  if (m !== "mock") { clearInterval(tick); document.getElementById("exambar").hidden = true; }
  if (silent) return;
  ({ quiz: () => quizView(false), wrong: () => quizView(true), concept: conceptView, card: cardView, mock: mockView, trend: trendView })[m]();
  try { localStorage.setItem("sqld.mode", m); } catch (e) {}
  window.scrollTo(0, 0);
}
document.querySelectorAll(".tabs button").forEach(b => b.onclick = () => setMode(b.dataset.mode));
document.addEventListener("keydown", e => {
  if (e.target.closest && e.target.closest("input,textarea")) return;
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
