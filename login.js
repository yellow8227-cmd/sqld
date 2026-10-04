// SQLD 공학노트 · 아이디/비번 로그인으로 학습 기록 이어 하기
// 상식 앱과 같은 Supabase 프로젝트를 쓰되 표·함수는 sq_ 로 따로 둔다(sqld-setup.sql). 표는 잠겨 있고 함수(rpc)로만 드나든다.
(function () {
"use strict";
const SUPA_URL = "https://ruvpsowkdbyxpfumpckw.supabase.co", SUPA_KEY = "sb_publishable_nkVEVsyJcp1vC6k8JlgSQA_lUGRsOPr";
const KEY = "sqld.v1", META = "sqld.sync", ACCT = "sqld.acct";
const _set = Storage.prototype.setItem;
const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { _set.call(localStorage, k, v); } catch (e) {} };
let meta = {}; try { meta = JSON.parse(lsGet(META) || "{}"); } catch (e) {}
const saveMeta = () => lsSet(META, JSON.stringify(meta));
let user = null, timer = null, ready = false;

async function api(fn, args) {
  let r;
  try { r = await fetch(SUPA_URL + "/rest/v1/rpc/" + fn, { method: "POST", headers: { apikey: SUPA_KEY, "Content-Type": "application/json" }, body: JSON.stringify(args) }); }
  catch (e) { throw new Error("network"); }
  const txt = await r.text(); let j = null; try { j = txt ? JSON.parse(txt) : null; } catch (e) {}
  if (!r.ok) throw new Error((j && (j.message || j.code)) || ("http " + r.status));
  return j;
}
const local = () => { try { return JSON.parse(lsGet(KEY) || "{}"); } catch (e) { return {}; } };
const hasProgress = d => !!(d && (Object.keys(d.log || {}).length || (d.known || []).length || (d.hist || []).length));
// 저장할 때 진행 중 모의고사·화면 테마는 기기마다 따로 둔다
const pack = d => JSON.stringify({ log: d.log || {}, wrong: d.wrong || [], known: d.known || [], hist: d.hist || [], day: d.day || {}, goal: d.goal || 0 });

// 두 기록 합치기 — 어느 쪽도 버리지 않는다: 문항 기록은 더 많이 푼 쪽, 목록은 합집합
function merge(a, b) {
  const log = Object.assign({}, b.log);
  for (const [id, v] of Object.entries(a.log || {})) if (!log[id] || (v.n || 0) > (log[id].n || 0)) log[id] = v;
  const uni = (x, y) => [...new Set([...(x || []), ...(y || [])])];
  const hk = r => JSON.stringify(r), seen = new Set(), hist = [];
  for (const r of [...(b.hist || []), ...(a.hist || [])]) if (!seen.has(hk(r))) { seen.add(hk(r)); hist.push(r); }
  const day = Object.assign({}, b.day); // 날짜별 푼 수: 더 많이 센 쪽
  for (const [k, v] of Object.entries(a.day || {})) if (!day[k] || (v.n || 0) > (day[k].n || 0)) day[k] = v;
  return { log, wrong: uni(a.wrong, b.wrong), known: uni(a.known, b.known), hist: hist.sort((x, y) => String(x.d).localeCompare(String(y.d))), day, goal: a.goal || b.goal || 0 };
}
function apply(d) { // 기기 고유 값(테마·진행 중 시험)은 유지하고 학습 기록만 바꾼다
  const cur = local();
  lsSet("sqld.backup", JSON.stringify({ t: Date.now(), d: cur }));
  lsSet(KEY, JSON.stringify(Object.assign({}, cur, d)));
}

// 기록이 바뀔 때마다 표시 → 3초 뒤 계정에 저장
Storage.prototype.setItem = function (k, v) {
  const mine = this === localStorage && k === KEY, before = mine ? this.getItem(k) : null;
  _set.call(this, k, v);
  if (mine && before !== String(v)) { meta.t = Date.now(); saveMeta(); schedule(); }
};
function schedule() { if (!user || !ready) return; clearTimeout(timer); timer = setTimeout(push, 3000); paint("저장 중…"); }
async function push() {
  if (!user) return; clearTimeout(timer);
  try { const t = meta.t || Date.now(); await api("sq_save", { p_token: user.token, p_data: pack(local()), p_t: t }); meta.synced = t; meta.uid = user.id; saveMeta(); paint(); }
  catch (e) { if (/bad_token/.test(e.message)) return setUser(null); paint("저장 대기"); }
}
async function remote() { const r = await api("sq_load", { p_token: user.token }); return r && r.data ? { d: JSON.parse(r.data), t: Number(r.t) || 0 } : null; }
async function pull() {
  let rm; try { rm = await remote(); } catch (e) { if (/bad_token/.test(e.message)) return setUser(null); ready = true; paint("오프라인"); return; }
  ready = true;
  if (!rm) { meta.t = Date.now(); await push(); return; }
  const same = meta.uid === user.id, dirty = (meta.t || 0) > (meta.synced || 0);
  const take = () => { apply(rm.d); meta.t = meta.synced = rm.t; meta.uid = user.id; saveMeta(); location.reload(); };
  const mix = async () => { apply(merge(local(), rm.d)); meta.uid = user.id; meta.synced = rm.t; meta.t = Date.now(); saveMeta(); await push(); location.reload(); };
  if (same) { if (rm.t > (meta.synced || 0)) return dirty ? mix() : take(); if (dirty) await push(); else paint(); return; }
  return hasProgress(local()) ? mix() : take(); // 이 기기에서 이 아이디로 처음
}
function setUser(u) { user = u; if (u) lsSet(ACCT, JSON.stringify(u)); else try { localStorage.removeItem(ACCT); } catch (e) {} paint(); if (u) { ready = false; pull(); } }
addEventListener("online", () => { if (user && ready) push(); });
document.addEventListener("visibilitychange", () => { if (!user || !ready) return; if (document.hidden) { if ((meta.t || 0) > (meta.synced || 0)) push(); } else pull(); });

// ── 화면
const css = document.createElement("style");
css.textContent = `
#acct{font:inherit;font-size:14px;font-weight:700;padding:8px 14px;min-height:42px;border:1.5px solid var(--ink);background:var(--panel);color:var(--ink);cursor:pointer;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left}
#acct.on{background:var(--ink);color:var(--panel)}
#acctdlg{position:fixed;inset:0;background:rgba(5,12,20,.55);display:flex;align-items:center;justify-content:center;z-index:99;padding:16px}
#acctdlg .box{background:var(--panel);color:var(--ink);border:1.5px solid var(--ink);padding:22px 20px;width:100%;max-width:400px;max-height:90vh;overflow:auto;line-height:1.7}
#acctdlg h3{margin:0 0 6px;font-size:20px}#acctdlg p{font-size:15px;color:var(--muted);margin:0 0 12px}
#acctdlg .lab{display:block;font-size:14px;font-weight:700;margin:10px 0 4px}
#acctdlg input{display:block;width:100%;box-sizing:border-box;font:inherit;font-size:17px;padding:11px 12px;border:1.5px solid var(--line);background:var(--panel);color:inherit}
#acctdlg input:focus{outline:2px solid var(--acc);outline-offset:0;border-color:var(--ink)}
#acctdlg .pwrow{display:flex;gap:6px}#acctdlg .pwrow input{flex:1}
#acctdlg button{font:inherit;padding:10px 14px;min-height:46px;border:1.5px solid var(--ink);background:var(--panel);color:inherit;cursor:pointer;font-weight:700}
#acctdlg button.p{background:var(--ink);color:var(--panel)}#acctdlg button.big{flex:1;font-size:17px}
#acctdlg .seg{display:flex;border:1.5px solid var(--ink);margin:0 0 14px}#acctdlg .seg button{flex:1;border:0;border-right:1px solid var(--line)}#acctdlg .seg button:last-child{border-right:0}
#acctdlg .seg button.on{background:var(--ink);color:var(--panel)}
#acctdlg .r{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
#acctdlg .rules{list-style:none;margin:6px 0 0;padding:0;font-size:13.5px;color:var(--muted)}#acctdlg .rules li::before{content:"○ "}
#acctdlg .rules li.ok{color:var(--ok)}#acctdlg .rules li.ok::before{content:"✓ "}#acctdlg .rules li.bad{color:var(--acc)}#acctdlg .rules li.bad::before{content:"✗ "}
#acctdlg .memo{background:var(--hl);color:var(--ink);padding:8px 10px;font-size:14px;margin:12px 0 0}
#acctdlg .err{color:var(--acc);font-size:14.5px;min-height:1.3em;margin-top:10px}#acctdlg .err.ok{color:var(--ok)}
#acctdlg .link{border:0;min-height:0;padding:4px 0;text-decoration:underline;font-weight:500;color:var(--muted)}`;
document.head.appendChild(css);
const btn = document.createElement("button");
btn.id = "acct"; btn.type = "button";
(document.getElementById("acct-slot") || document.querySelector(".titleblock") || document.body).appendChild(btn);
function paint(st) { btn.classList.toggle("on", !!user); btn.textContent = user ? `👤 ${user.id} · ${st || "자동 저장"}` : "🔑 로그인 · 기기 간 이어 풀기"; }
paint();
btn.onclick = () => user ? account() : login();
function dlg(html) {
  document.querySelectorAll("#acctdlg").forEach(x => x.remove());
  const d = document.createElement("div"); d.id = "acctdlg"; d.innerHTML = `<div class="box" role="dialog" aria-modal="true">${html}</div>`;
  d.onclick = e => { if (e.target === d) d.remove(); }; document.body.appendChild(d); return d;
}
function errMsg(e) {
  const m = String(e && e.message || e || "");
  if (/id_taken/.test(m)) return "이미 있는 아이디예요. 숫자를 붙이는 등 다른 아이디로 해 보세요. 내 아이디라면 '로그인'으로 들어오세요.";
  if (/bad_login/.test(m)) return "아이디나 비밀번호가 맞지 않아요. '보기'로 비밀번호를 확인해 보세요.";
  if (/bad_id/.test(m)) return "아이디는 영문 소문자·숫자 3~20자로 써 주세요.";
  if (/bad_pw/.test(m)) return "비밀번호는 6~72자로 해 주세요.";
  if (/network/.test(m)) return "인터넷 연결을 확인해 주세요.";
  if (/Could not find the function|PGRST202|404/.test(m)) return "서버 준비가 아직 안 됐어요(sqld-setup.sql 실행 필요). 만든 사람에게 알려 주세요.";
  return "로그인하지 못했어요: " + m.slice(0, 80);
}
function login(mode) {
  mode = mode || (meta.uid ? "in" : "up"); const up = mode === "up";
  const d = dlg(`<div class="seg"><button data-m="up" class="${up ? "on" : ""}">처음이면 · 가입</button><button data-m="in" class="${up ? "" : "on"}">로그인</button></div>
    <p>${up ? "아이디와 비밀번호만 정하면 돼요. 이메일·전화번호는 필요 없어요. 푼 기록·오답노트·외운 카드·모의고사 점수가 계정에 저장돼요." : "가입할 때 정한 아이디와 비밀번호를 넣으세요. 이 기기의 기록과 합쳐져요."}</p>
    <label class="lab" for="aid">아이디</label>
    <input id="aid" placeholder="예: sqld2026" autocapitalize="none" autocorrect="off" spellcheck="false" autocomplete="username" maxlength="20">
    ${up ? `<ul class="rules"><li data-r="len">3~20자</li><li data-r="chr">영어 소문자·숫자만 (한글·띄어쓰기 불가)</li></ul>` : ""}
    <label class="lab" for="apw">비밀번호</label>
    <div class="pwrow"><input id="apw" type="password" placeholder="${up ? "6자 이상" : "비밀번호"}" autocomplete="${up ? "new-password" : "current-password"}"><button type="button" id="aeye">보기</button></div>
    ${up ? `<ul class="rules"><li data-r="pw">6자 이상 <span id="pwn"></span></li></ul><p class="memo">아이디·비밀번호를 꼭 메모해 두세요. 비밀번호 찾기 기능이 없어요.</p>` : ""}
    <div class="err" id="aerr"></div>
    <div class="r"><button class="p big" id="ago">${up ? "가입하고 시작하기" : "로그인"}</button></div>
    <div class="r"><button class="link" id="ax">닫기</button></div>`);
  const er = d.querySelector("#aerr"), idI = d.querySelector("#aid"), pwI = d.querySelector("#apw");
  d.querySelectorAll("[data-m]").forEach(b => b.onclick = () => { const k = { id: idI.value, pw: pwI.value }; login(b.dataset.m); const n = document.querySelector("#acctdlg"); n.querySelector("#aid").value = k.id; n.querySelector("#apw").value = k.pw; });
  const mark = (r, ok, t) => { const li = d.querySelector(`[data-r="${r}"]`); if (li) { li.classList.toggle("ok", ok); li.classList.toggle("bad", !ok && t); } };
  idI.oninput = () => { const low = idI.value.toLowerCase().replace(/\s+/g, ""); if (low !== idI.value) idI.value = low; const v = idI.value; mark("len", v.length >= 3 && v.length <= 20, !!v); mark("chr", !!v && /^[a-z0-9._-]+$/.test(v), !!v); er.textContent = ""; };
  pwI.oninput = () => { const n = pwI.value.length; mark("pw", n >= 6, n > 0); const c = d.querySelector("#pwn"); if (c) c.textContent = n ? `(지금 ${n}자)` : ""; er.textContent = ""; };
  d.querySelector("#aeye").onclick = () => { const show = pwI.type === "password"; pwI.type = show ? "text" : "password"; d.querySelector("#aeye").textContent = show ? "숨기기" : "보기"; };
  const go = async () => {
    const id = idI.value.trim().toLowerCase(), pw = pwI.value; er.className = "err";
    if (!id) { er.textContent = "아이디를 써 주세요."; return idI.focus(); }
    if (/[ㄱ-ㅎ가-힣]/.test(id)) { er.textContent = "아이디에 한글은 안 돼요. 자판을 영어로 바꿔 주세요."; return idI.focus(); }
    if (!/^[a-z0-9._-]{3,20}$/.test(id)) { er.textContent = id.length < 3 ? "아이디는 3자 이상이에요." : "아이디에는 영어·숫자만 쓸 수 있어요."; return idI.focus(); }
    if (pw.length < 6) { er.textContent = `비밀번호를 6자 이상으로 해 주세요. (지금 ${pw.length}자)`; return pwI.focus(); }
    er.className = "err ok"; er.textContent = up ? "가입하는 중…" : "로그인 중…";
    try { const tok = await api(up ? "sq_signup" : "sq_login", { p_id: id, p_pw: pw }); d.remove(); setUser({ id, token: tok }); }
    catch (e) { er.className = "err"; er.textContent = errMsg(e); }
  };
  d.querySelector("#ago").onclick = go; d.querySelector("#ax").onclick = () => d.remove();
  pwI.onkeydown = e => { if (e.key === "Enter") go(); }; idI.onkeydown = e => { if (e.key === "Enter") pwI.focus(); };
  setTimeout(() => idI.focus(), 50);
}
function account() {
  const d = dlg(`<h3>👤 ${user.id}</h3><p>문제를 풀 때마다 이 아이디에 자동 저장돼요. 다른 기기에서도 같은 아이디로 로그인하면 이어서 풀 수 있어요.${meta.synced ? "<br>마지막 저장: " + new Date(meta.synced).toLocaleString("ko-KR") : ""}</p>
    <div class="err" id="amsg"></div>
    <div class="r"><button class="p" id="anow">지금 저장</button><button id="aout">로그아웃</button><button id="ax">닫기</button></div>
    ${lsGet("sqld.backup") ? `<div class="r"><button class="link" id="aundo">기록이 이상해요 · 직전 상태로 되돌리기</button></div>` : ""}`);
  const msg = d.querySelector("#amsg");
  d.querySelector("#anow").onclick = async () => { meta.t = Math.max(meta.t || 0, Date.now()); await push(); msg.className = "err ok"; msg.textContent = meta.synced >= meta.t ? "저장했어요." : "저장하지 못했어요. 인터넷을 확인해 주세요."; };
  d.querySelector("#aout").onclick = async () => { if ((meta.t || 0) > (meta.synced || 0)) await push(); api("sq_logout", { p_token: user.token }).catch(() => {}); d.remove(); setUser(null); };
  d.querySelector("#ax").onclick = () => d.remove();
  const u = d.querySelector("#aundo");
  if (u) u.onclick = () => { let bk; try { bk = JSON.parse(lsGet("sqld.backup")); } catch (e) {} if (!bk || !confirm(new Date(bk.t).toLocaleString("ko-KR") + " 직전 기록으로 되돌릴까요?")) return; lsSet(KEY, JSON.stringify(bk.d)); meta.t = Date.now(); saveMeta(); push().then(() => location.reload()); };
}
try { const a = JSON.parse(lsGet(ACCT) || "null"); if (a && a.id && a.token) setUser(a); } catch (e) {}
})();
