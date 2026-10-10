// 제2과목 · SQL 기본 및 활용 (G: SQL 활용 심화 · 관리 구문 — 서브쿼리 · 집합 · 그룹 함수 · TOP-N · PIVOT · 정규 표현식 · DML · TCL · DDL · DCL)
// pg: 검증용 PostgreSQL 쿼리. Oracle 고유 구문(ROWNUM, PIVOT, CONNECT BY, MERGE … DELETE WHERE 등)은 같은 결과가 나오도록 바꿔 써서 검증한다.
(window.QB = window.QB || []).push(
{
  id: "S93", s: 2, tp: "sub", lv: 2, sub: "서브쿼리",
  th: "2과목 | 스칼라 서브쿼리가 0건일 때 — NULL과 COUNT의 0",
  q: "다음 SQL을 실행했을 때 DEPTNO 20, 30 행의 결과로 옳은 것은?",
  tb: [
    { n: "DEPT", c: ["DEPTNO", "DNAME"], r: [[10, "SALES"], [20, "HR"], [30, "IT"]] },
    { n: "EMP", c: ["ENAME", "DEPTNO", "SAL"], r: [["A", 10, 400], ["B", 10, 200], ["C", 20, 300]] }
  ],
  sql: "SELECT D.DEPTNO,\n       (SELECT COUNT(*) FROM EMP E WHERE E.DEPTNO = D.DEPTNO)                  AS CNT,\n       (SELECT SUM(SAL) FROM EMP E WHERE E.DEPTNO = D.DEPTNO)                  AS TOT,\n       (SELECT ENAME    FROM EMP E WHERE E.DEPTNO = D.DEPTNO AND E.SAL > 300)  AS HIGH\n  FROM DEPT D\n ORDER BY D.DEPTNO;",
  o: [
    "20: (1, 300, NULL) / 30: (0, NULL, NULL)",
    "20: (1, 300, NULL) / 30: (NULL, NULL, NULL)",
    "20: (1, 300, C) / 30: (0, 0, NULL)",
    "20: (1, 300, NULL) / 30 행은 출력되지 않는다"
  ],
  a: 0,
  sum: "SELECT 절에 넣은 서브쿼리는 값 하나를 채우는 칸이라 행을 없애지 못해요. 사원이 없는 30번도 나오고, 그때 COUNT는 0, 나머지는 NULL이에요.",
  why: "SELECT 절 안에 넣은 서브쿼리를 스칼라 서브쿼리라고 해요. 바깥 행 하나마다 한 번씩 실행돼서 값 하나를 채워 주는 칸이에요.\n\n칸을 채우는 역할이라 행을 만들거나 없애지 못해요. 그래서 찾은 게 없으면 오류 없이 빈 값(NULL)을 넣어요. 두 건 이상이면 칸 하나에 다 못 넣으니 오류가 나요.\n\n그런데 GROUP BY 없는 COUNT·SUM 같은 집계 함수는 조금 달라요. 대상 행이 하나도 없어도 '전체를 한 묶음'으로 보고 결과 한 줄을 꼭 만들어요. **그래서 대상이 없을 때 COUNT(*)는 0이 되고, SUM은 더할 값이 없어 NULL이 돼요.**\n\n20번 부서는 C(300) 한 명이에요. CNT는 1, TOT는 300이에요. HIGH는 '300 초과'인 사원을 찾는데 300은 초과가 아니라서 아무도 없어요. 그래서 NULL이에요.\n\n30번 부서는 사원이 없어요. 그래도 바깥 쿼리가 DEPT 테이블을 읽으니까 30번 행은 그대로 나와요. 값은 CNT 0, TOT NULL, HIGH NULL이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT D.DEPTNO,                             -- ② 부서 한 줄마다 아래 세 칸을 채워요\n       (SELECT COUNT(*) FROM EMP E\n         WHERE E.DEPTNO = D.DEPTNO)  AS CNT,   --    그 부서 사원 수 (없으면 0)\n       (SELECT SUM(SAL) FROM EMP E\n         WHERE E.DEPTNO = D.DEPTNO)  AS TOT,   --    그 부서 급여 합 (없으면 NULL)\n       (SELECT ENAME FROM EMP E\n         WHERE E.DEPTNO = D.DEPTNO\n           AND E.SAL > 300)          AS HIGH   --    300 초과 사원 이름 (없으면 NULL, 2명 이상이면 오류)\n  FROM DEPT D                                  -- ① DEPT 3줄(10, 20, 30)이 결과의 뼈대예요\n ORDER BY D.DEPTNO;                            -- ③ 부서 번호 순으로 정렬해요" },
    { t: "[원본] 부서별 사원", tb: { c: ["DEPTNO", "해당 사원", "SAL > 300인 사원"], r: [[10, "A(400), B(200)", "A"], [20, "C(300)", "없음"], [30, "없음", "없음"]], hl: [1, 2] } },
    { t: "1단계: 서브쿼리별 반환값", tb: { c: ["DEPTNO", "COUNT(*) 서브쿼리", "SUM 서브쿼리", "ENAME 서브쿼리"], r: [[10, "1행: 2", "1행: 600", "1행: A"], [20, "1행: 1", "1행: 300", "0행 → NULL"], [30, "1행: 0", "1행: NULL", "0행 → NULL"]], hl: [1, 2] }, n: "집계 서브쿼리는 대상이 없어도 결과 한 줄을 만들어요. ENAME 서브쿼리는 찾은 게 없어서 NULL이에요." },
    { t: "2단계: 최종 결과", tb: { c: ["DEPTNO", "CNT", "TOT", "HIGH"], r: [[10, 2, 600, "A"], [20, 1, 300, null], [30, 0, null, null]], hl: [1, 2] } },
    { t: "의도대로 쓰려면: 빈 합계를 0으로 보이기", n: "-- 사원이 없는 부서의 합계를 0으로 보여 주려면 NVL로 감싸요\nSELECT D.DEPTNO,\n       NVL((SELECT SUM(SAL) FROM EMP E\n             WHERE E.DEPTNO = D.DEPTNO), 0) AS TOT\n  FROM DEPT D\n ORDER BY D.DEPTNO;   -- 10 → 600, 20 → 300, 30 → 0" }
  ],
  res: { c: ["DEPTNO", "CNT", "TOT", "HIGH"], r: [[10, 2, 600, "A"], [20, 1, 300, null], [30, 0, null, null]] },
  pg: "SELECT D.DEPTNO, (SELECT COUNT(*) FROM EMP E WHERE E.DEPTNO = D.DEPTNO) CNT, (SELECT SUM(SAL) FROM EMP E WHERE E.DEPTNO = D.DEPTNO) TOT, (SELECT ENAME FROM EMP E WHERE E.DEPTNO = D.DEPTNO AND E.SAL > 300) HIGH FROM DEPT D ORDER BY D.DEPTNO",
  ox: [
    "정답이에요. COUNT는 대상이 없어도 0을 돌려주고, SUM과 이름 찾기는 찾은 게 없으니 NULL이에요.",
    "이렇게 생각하면 틀려요: '찾은 게 없으면 다 NULL'. COUNT(*)는 대상이 없어도 '0명'이라는 답을 한 줄 만들어요.",
    "이렇게 생각하면 틀려요: 'C의 300도 300 초과다', '합할 게 없으면 0이다'. 300은 300 초과가 아니고, 더할 값이 없는 SUM은 0이 아니라 NULL이에요.",
    "이렇게 생각하면 틀려요: '서브쿼리가 빈 결과면 그 줄이 사라진다'. SELECT 절의 서브쿼리는 칸만 채우니까 DEPT 3줄은 그대로 다 나와요."
  ],
  trap: "SELECT 절 서브쿼리는 찾은 게 없으면 NULL이고, 두 건 이상이면 오류(ORA-01427)예요. 없는 건 오류가 아니에요.",
  memo: "SELECT 절 서브쿼리: 없음 → NULL / 집계: 없음 → COUNT 0, SUM·MAX NULL"
},
{
  id: "S94", s: 2, tp: "sub", lv: 3, sub: "서브쿼리",
  th: "2과목 | 다중 컬럼 서브쿼리 — 쌍 비교 vs 비쌍 비교",
  q: "다음 두 SQL의 결과 건수로 옳은 것은?",
  tb: [{ n: "EMP", c: ["ENAME", "DEPTNO", "SAL"], r: [["A", 10, 500], ["B", 10, 300], ["C", 20, 300], ["D", 20, 200], ["E", 30, 300], ["F", 30, 100]] }],
  sql: "-- ①\nSELECT COUNT(*) FROM EMP\n WHERE (DEPTNO, SAL) IN (SELECT DEPTNO, MAX(SAL) FROM EMP GROUP BY DEPTNO);\n\n-- ②\nSELECT COUNT(*) FROM EMP\n WHERE DEPTNO IN (SELECT DEPTNO   FROM EMP GROUP BY DEPTNO)\n   AND SAL    IN (SELECT MAX(SAL) FROM EMP GROUP BY DEPTNO);",
  o: ["① 3, ② 3", "① 3, ② 4", "① 4, ② 4", "① 4, ② 3"],
  a: 1,
  sum: "①은 (부서, 급여)를 짝으로 맞춰 봐서 '자기 부서 최고 급여자'만 남아요. ②는 따로따로 봐서 다른 부서 최고 급여와 우연히 같은 B까지 들어와요.",
  why: "①처럼 (DEPTNO, SAL)을 괄호로 묶어 IN을 쓰면 두 값을 한 쌍으로 비교해요. 부서와 급여가 둘 다 같은 짝이 목록에 있어야 통과해요.\n\n②처럼 IN을 컬럼마다 따로 쓰면 비교도 따로따로 해요. '부서가 목록에 있나?'와 '급여가 목록에 있나?'를 각각 확인할 뿐이에요.\n\n**따로 비교하면 '이 급여가 어느 부서의 최고였는지'라는 연결이 끊어져요.** 그래서 다른 부서의 최고 급여와 우연히 같은 급여도 통과해요.\n\n부서별 최고 급여 짝은 (10, 500), (20, 300), (30, 300)이에요. 급여만 모은 목록은 {500, 300}이에요.\n\nA(10, 500), C(20, 300), E(30, 300)는 짝이 목록에 있어서 ①, ② 모두 통과해요. B(10, 300)는 10번 최고가 500이라 ①에서는 떨어져요. 하지만 ②에서는 300이 목록에 있어서 통과해요. D(200)와 F(100)는 둘 다 떨어져요.\n\n그래서 ①은 3건, ②는 4건이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- ①\nSELECT COUNT(*) FROM EMP                  -- ③ 통과한 사원 수를 세요: 3\n WHERE (DEPTNO, SAL) IN                   -- ② 내 (부서, 급여) 짝이 목록에 있나요?\n       (SELECT DEPTNO, MAX(SAL)           -- ① 부서별 최고 급여 짝\n          FROM EMP GROUP BY DEPTNO);      --    (10,500) (20,300) (30,300)\n\n-- ②\nSELECT COUNT(*) FROM EMP                  -- ③ 통과한 사원 수를 세요: 4\n WHERE DEPTNO IN (SELECT DEPTNO FROM EMP\n                   GROUP BY DEPTNO)       -- ①a 부서 목록 {10, 20, 30} → 6명 모두 통과\n   AND SAL    IN (SELECT MAX(SAL) FROM EMP\n                   GROUP BY DEPTNO);      -- ①b 급여 목록 {500, 300} → 급여가 500이나 300이면 통과" },
    { t: "[원본] → 1단계: 서브쿼리 결과", tb: { c: ["DEPTNO", "MAX(SAL)"], r: [[10, 500], [20, 300], [30, 300]] }, n: "쌍 목록 = {(10,500), (20,300), (30,300)} / SAL 목록 = {500, 300}" },
    { t: "2단계: 행별 판정", tb: { c: ["ENAME", "(DEPTNO, SAL)", "① 쌍 비교", "② 비쌍 비교"], r: [["A", "(10, 500)", "O", "O"], ["B", "(10, 300)", "X", "O (300이 목록에 있음)"], ["C", "(20, 300)", "O", "O"], ["D", "(20, 200)", "X", "X"], ["E", "(30, 300)", "O", "O"], ["F", "(30, 100)", "X", "X"]], hl: [1] } },
    { t: "의도대로 쓰려면: 부서별 최고 급여자", n: "-- 짝 비교(①)를 쓰거나, 내 부서의 최고 급여와 직접 비교해요\nSELECT ENAME FROM EMP E\n WHERE SAL = (SELECT MAX(SAL) FROM EMP X\n               WHERE X.DEPTNO = E.DEPTNO);   -- A, C, E (3명, ①과 같아요)" }
  ],
  res: { c: ["①", "②"], r: [[3, 4]] },
  pg: "SELECT (SELECT COUNT(*) FROM EMP WHERE (DEPTNO, SAL) IN (SELECT DEPTNO, MAX(SAL) FROM EMP GROUP BY DEPTNO)), (SELECT COUNT(*) FROM EMP WHERE DEPTNO IN (SELECT DEPTNO FROM EMP GROUP BY DEPTNO) AND SAL IN (SELECT MAX(SAL) FROM EMP GROUP BY DEPTNO))",
  ox: [
    "이렇게 생각하면 틀려요: '②도 짝으로 비교된다'. IN을 따로 쓰면 급여만 보고 통과시켜서 B(10, 300)가 들어와요.",
    "정답이에요. ①은 짝이 맞는 A, C, E 3명, ②는 급여 300 덕분에 B까지 4명이에요.",
    "이렇게 생각하면 틀려요: '①에서도 B가 통과한다'. 10번 부서의 최고는 500이라 (10, 300) 짝은 목록에 없어요.",
    "이렇게 생각하면 틀려요: 두 결과를 바꿔 본 거예요. 조건이 더 느슨한 쪽은 따로 비교하는 ②라서 ②가 더 많아요."
  ],
  trap: "'부서별 최고 급여자'를 SAL IN (SELECT MAX(SAL) … GROUP BY DEPTNO)로만 구하면, 다른 부서 최고 급여와 우연히 같은 사람까지 나와요.",
  memo: "(A, B) IN (SELECT A, B …) = 짝으로 비교 / 따로 IN = 따로 비교"
},
{
  id: "S95", s: 2, tp: "sub", lv: 2, sub: "서브쿼리",
  th: "2과목 | EXISTS(세미 조인) vs 일반 조인, 비연관 EXISTS",
  q: "다음 세 SQL의 결과 값으로 옳은 것은?",
  tb: [
    { n: "DEPT", c: ["DEPTNO"], r: [[10], [20], [30], [40]] },
    { n: "EMP", c: ["ENAME", "DEPTNO"], r: [["A", 10], ["B", 10], ["C", 20], ["D", null]] }
  ],
  sql: "-- ①\nSELECT COUNT(*) FROM DEPT D\n WHERE EXISTS (SELECT 1 FROM EMP E WHERE E.DEPTNO = D.DEPTNO);\n-- ②\nSELECT COUNT(*) FROM DEPT D JOIN EMP E ON E.DEPTNO = D.DEPTNO;\n-- ③\nSELECT COUNT(*) FROM DEPT D\n WHERE EXISTS (SELECT NULL FROM EMP WHERE DEPTNO IS NULL);",
  o: ["① 2, ② 2, ③ 4", "① 2, ② 3, ③ 0", "① 2, ② 3, ③ 4", "① 3, ② 3, ③ 1"],
  a: 2,
  sum: "EXISTS는 '짝이 하나라도 있나?'만 봐서 부서를 한 번씩만 세고, 조인은 짝마다 줄을 만들어요. ③은 바깥 부서와 상관없이 늘 1건이 있으니 4개 부서가 다 통과해요.",
  why: "EXISTS는 서브쿼리가 한 줄이라도 돌려주는지만 확인해요. 어떤 값을 돌려주는지는 보지 않아요. 한 줄을 찾는 순간 '있다'로 끝내요.\n\n그래서 바깥 행 하나는 짝이 몇 개든 많아야 한 번 나와요. 이런 방식을 세미 조인이라고 불러요.\n\n일반 조인은 반대예요. 짝을 모두 이어 붙여 줄로 내놓아요. 짝이 2개면 바깥 행도 2번 나와요.\n\n①에서 10번은 A, B가 있어서 통과, 20번은 C가 있어서 통과예요. 30번, 40번은 짝이 없어요. 그래서 2건이에요.\n\n②에서는 (10, A), (10, B), (20, C) 3줄이 만들어져요. D는 부서가 NULL이라 어느 부서와도 이어지지 않아요. 그래서 3건이에요.\n\n**③의 서브쿼리는 바깥 부서 D를 전혀 쓰지 않아서, 어느 부서에 대해 물어봐도 같은 답(D 사원 1줄)을 내요.** 그러니 4개 부서가 모두 통과해서 4건이에요. SELECT NULL이라고 써도 '줄이 있다'는 사실은 바뀌지 않아요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- ①\nSELECT COUNT(*) FROM DEPT D                 -- ③ 남은 부서 수: 2\n WHERE EXISTS (SELECT 1 FROM EMP E          -- ② 한 줄이라도 있으면 통과 (1이라는 값은 안 봐요)\n                WHERE E.DEPTNO = D.DEPTNO); -- ① 부서마다 짝 찾기: 10 있음, 20 있음, 30 없음, 40 없음\n-- ②\nSELECT COUNT(*)                             -- ② 이어진 줄 수: 3\n  FROM DEPT D JOIN EMP E\n    ON E.DEPTNO = D.DEPTNO;                 -- ① 짝마다 한 줄: (10,A) (10,B) (20,C)\n-- ③\nSELECT COUNT(*) FROM DEPT D                 -- ③ 부서 4개 모두 통과: 4\n WHERE EXISTS (SELECT NULL FROM EMP         -- ② 1줄 있음 → 통과\n                WHERE DEPTNO IS NULL);      -- ① 바깥 D를 안 써요: 언제나 D 사원 1줄" },
    { t: "[원본] → 1단계: 부서별 짝", tb: { c: ["DEPTNO", "짝이 되는 EMP", "① EXISTS", "② 조인 행"], r: [[10, "A, B", "TRUE", 2], [20, "C", "TRUE", 1], [30, "없음", "FALSE", 0], [40, "없음", "FALSE", 0]], hl: [0] } },
    { t: "2단계: ③ 비연관 EXISTS", tb: { c: ["서브쿼리 결과", "EXISTS", "통과 행"], r: [["1행 (값 NULL)", "TRUE (모든 행 공통)", "DEPT 4행 전부"]] } },
    { t: "의도대로 쓰려면: 조인으로 부서를 한 번씩만 세기", n: "-- 조인 결과에서 부서 번호의 중복을 없애고 세요\nSELECT COUNT(DISTINCT D.DEPTNO)\n  FROM DEPT D JOIN EMP E\n    ON E.DEPTNO = D.DEPTNO;   -- 2 (①의 EXISTS와 같아요)" }
  ],
  res: { c: ["①", "②", "③"], r: [[2, 3, 4]] },
  pg: "SELECT (SELECT COUNT(*) FROM DEPT D WHERE EXISTS (SELECT 1 FROM EMP E WHERE E.DEPTNO = D.DEPTNO)), (SELECT COUNT(*) FROM DEPT D JOIN EMP E ON E.DEPTNO = D.DEPTNO), (SELECT COUNT(*) FROM DEPT D WHERE EXISTS (SELECT NULL FROM EMP WHERE DEPTNO IS NULL))",
  ox: [
    "이렇게 생각하면 틀려요: '조인도 부서를 한 번만 센다'. 조인은 짝마다 줄을 만들어서 10번이 A, B로 두 번 나와요.",
    "이렇게 생각하면 틀려요: 'SELECT NULL이면 없는 것과 같다'. EXISTS는 값이 아니라 줄이 있는지만 봐요. NULL 값 한 줄도 '있음'이에요.",
    "정답이에요. ①은 짝 있는 부서 2개, ②는 짝마다 줄이라 3줄, ③은 늘 참이라 4개예요.",
    "이렇게 생각하면 틀려요: 'EXISTS도 짝 수만큼 센다', '③은 NULL인 사원 1명만 센다'. ③은 DEPT의 줄을 세는 쿼리라 4예요."
  ],
  trap: "EXISTS 안의 SELECT 목록(1, *, NULL)은 결과에 아무 영향이 없어요. 바깥과 잇는 조건이 빠지면 '전부 통과 아니면 전부 탈락'이 돼요.",
  memo: "EXISTS = 있으면 한 번만 / 조인 = 짝마다 한 줄"
},
{
  id: "S96", s: 2, tp: "sub", lv: 2, sub: "서브쿼리",
  th: "2과목 | HAVING 절 서브쿼리 — 전체 평균 vs 평균의 평균",
  q: "다음 SQL의 결과로 출력되는 DEPTNO는?",
  tb: [{ n: "EMP", c: ["ENAME", "DEPTNO", "SAL"], r: [["A", 10, 100], ["B", 10, 100], ["C", 10, 100], ["D", 10, 100], ["E", 20, 400], ["F", 30, 250], ["G", 30, 250]] }],
  sql: "SELECT DEPTNO, AVG(SAL) AS AVG_SAL\n  FROM EMP\n GROUP BY DEPTNO\nHAVING AVG(SAL) > (SELECT AVG(SAL) FROM EMP)\n ORDER BY DEPTNO;",
  o: ["20", "20, 30", "30", "HAVING 절에는 서브쿼리를 쓸 수 없어 오류가 발생한다."],
  a: 1,
  sum: "서브쿼리에 GROUP BY가 없어서 7명 전체 평균(약 185.7)과 비교해요. 부서 평균 400과 250이 이보다 커서 20, 30이 나와요.",
  why: "HAVING은 GROUP BY로 묶은 다음 '묶음'을 골라내는 조건이에요. 여기에도 값 하나를 돌려주는 서브쿼리를 쓸 수 있어요.\n\n이 서브쿼리 (SELECT AVG(SAL) FROM EMP)에는 GROUP BY가 없어요. 그래서 EMP 7명을 한 덩어리로 보고 평균을 한 번만 계산해요. 1300 ÷ 7 ≈ 185.71이에요.\n\n**전체 평균은 사람 수만큼 무게가 실려서, 4명이나 되는 10번(100)이 평균을 끌어내려요.** 그래서 '부서 평균 셋의 평균'인 250보다 작아요.\n\n이제 부서별로 비교해 봐요. 10번은 평균 100이라 185.71보다 작아서 빠져요. 20번은 400, 30번은 250이라 둘 다 통과해요.\n\n결과는 20, 30이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT DEPTNO, AVG(SAL) AS AVG_SAL              -- ④ 남은 부서와 평균을 보여 줘요\n  FROM EMP                                       -- ① EMP 7명\n GROUP BY DEPTNO                                 -- ② 10(4명), 20(1명), 30(2명)으로 묶어요\nHAVING AVG(SAL) > (SELECT AVG(SAL) FROM EMP)     -- ③ 부서 평균 > 전체 평균 185.71 → 20, 30 통과\n ORDER BY DEPTNO;                                -- ⑤ 부서 번호 순" },
    { t: "[원본] → 1단계: 그룹별 평균", tb: { c: ["DEPTNO", "인원", "SUM", "AVG(SAL)"], r: [[10, 4, 400, 100], [20, 1, 400, 400], [30, 2, 500, 250]] } },
    { t: "2단계: 서브쿼리 값", tb: { c: ["식", "값"], r: [["전체 AVG(SAL) = 1300 ÷ 7", "185.71"], ["(비교) 부서 평균의 평균 = 750 ÷ 3", "250"]], hl: [0] } },
    { t: "3단계: HAVING 판정", tb: { c: ["DEPTNO", "AVG(SAL)", "> 185.71"], r: [[10, 100, "X"], [20, 400, "O"], [30, 250, "O"]], hl: [1, 2] } },
    { t: "의도대로 쓰려면: '부서 평균들의 평균'과 비교", n: "-- 서브쿼리에서도 부서별로 묶은 뒤 평균을 내요 (Oracle은 AVG(AVG(SAL)) 중첩을 허용해요)\nSELECT DEPTNO, AVG(SAL) AS AVG_SAL\n  FROM EMP\n GROUP BY DEPTNO\nHAVING AVG(SAL) > (SELECT AVG(AVG(SAL)) FROM EMP GROUP BY DEPTNO)\n ORDER BY DEPTNO;   -- 20(400)만 나와요. 30은 250 > 250이 아니라서 빠져요" }
  ],
  res: { c: ["DEPTNO", "AVG_SAL"], r: [[20, 400], [30, 250]] },
  pg: "SELECT DEPTNO, AVG(SAL) AVG_SAL FROM EMP GROUP BY DEPTNO HAVING AVG(SAL) > (SELECT AVG(SAL) FROM EMP) ORDER BY DEPTNO",
  ox: [
    "이렇게 생각하면 틀려요: '서브쿼리가 부서 평균들의 평균(250)을 낸다'. GROUP BY가 없어서 7명 전체 평균 185.71이고, 250은 그보다 커서 30번도 통과해요.",
    "정답이에요. 부서 평균 400과 250이 전체 평균 185.71보다 커요.",
    "이렇게 생각하면 틀려요: 20번이 빠진다고 볼 근거가 없어요. 400은 185.71보다 커요.",
    "이렇게 생각하면 틀려요: 'HAVING에는 서브쿼리를 못 쓴다'. 값 하나를 돌려주는 서브쿼리는 HAVING에서도 비교 대상으로 쓸 수 있어요."
  ],
  trap: "부서마다 인원이 다르면 '전체 평균'과 '부서 평균의 평균'이 달라요. 서브쿼리에 GROUP BY가 있는지부터 보세요.",
  memo: "HAVING + 서브쿼리 OK, GROUP BY 없는 AVG = 전체 평균"
},
{
  id: "S97", s: 2, tp: "set", lv: 3, sub: "집합 연산자",
  th: "2과목 | 집합 연산자 우선순위와 괄호",
  q: "다음 두 SQL의 결과 집합으로 옳은 것은? (Oracle 기준)",
  tb: [
    { n: "T1", c: ["C"], r: [[1], [2], [3]] },
    { n: "T2", c: ["C"], r: [[3], [4]] },
    { n: "T3", c: ["C"], r: [[1], [4]] }
  ],
  sql: "-- ①\nSELECT C FROM T1\nUNION\nSELECT C FROM T2\nMINUS\nSELECT C FROM T3;\n\n-- ②\nSELECT C FROM T1\nUNION\n(SELECT C FROM T2\n MINUS\n SELECT C FROM T3);",
  o: ["① {2, 3}  ② {1, 2, 3}", "① {1, 2, 3}  ② {1, 2, 3}", "① {2, 3}  ② {2, 3}", "① {1, 2, 3}  ② {2, 3}"],
  a: 0,
  sum: "Oracle 집합 연산자는 우선순위가 모두 같아서 괄호가 없으면 위에서부터 차례로 계산해요. ①은 (합집합) 뒤에 빼기, ②는 괄호 안 빼기가 먼저예요.",
  why: "Oracle에서 UNION, UNION ALL, INTERSECT, MINUS는 우선순위가 모두 같아요. 그래서 괄호가 없으면 위에서 아래로 하나씩 계산해요.\n\n앞에서 계산한 결과가 다음 연산의 왼쪽 재료가 돼요. 덧셈·뺄셈만 있는 식을 왼쪽부터 계산하는 것과 같아요.\n\n①은 먼저 T1 ∪ T2 = {1, 2, 3, 4}를 만들어요. 그다음 T3 {1, 4}를 빼서 {2, 3}이 돼요. **MINUS가 앞의 합집합 전체에서 빼기 때문에 T1에 있던 1도 지워져요.**\n\n②는 괄호가 먼저예요. T2 − T3 = {3, 4} − {1, 4} = {3}이에요. 그다음 T1 {1, 2, 3}과 합쳐서 {1, 2, 3}이 돼요.\n\n괄호 위치만 다른데 결과가 달라져요. 집합 연산을 여러 개 쓸 때는 괄호로 순서를 분명히 적는 게 좋아요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- ①\nSELECT C FROM T1      -- {1, 2, 3}\nUNION                 -- ① 먼저: T1 ∪ T2 = {1, 2, 3, 4}\nSELECT C FROM T2      -- {3, 4}\nMINUS                 -- ② ①의 결과에서 T3를 빼요 = {2, 3}\nSELECT C FROM T3;     -- {1, 4}\n\n-- ②\nSELECT C FROM T1      -- {1, 2, 3}\nUNION                 -- ② T1 ∪ {3} = {1, 2, 3}\n(SELECT C FROM T2     -- {3, 4}\n MINUS                -- ① 괄호 먼저: T2 − T3 = {3}\n SELECT C FROM T3);   -- {1, 4}" },
    { t: "[원본] 집합", tb: { c: ["테이블", "값"], r: [["T1", "{1, 2, 3}"], ["T2", "{3, 4}"], ["T3", "{1, 4}"]] } },
    { t: "1단계: ① 왼쪽부터", tb: { c: ["순서", "연산", "결과"], r: [[1, "T1 UNION T2", "{1, 2, 3, 4}"], [2, "… MINUS T3", "{2, 3}"]], hl: [1] } },
    { t: "2단계: ② 괄호 먼저", tb: { c: ["순서", "연산", "결과"], r: [[1, "T2 MINUS T3", "{3}"], [2, "T1 UNION …", "{1, 2, 3}"]], hl: [1] } },
    { t: "괄호로 의도를 드러내기", n: "-- ①과 같은 결과지만 순서가 눈에 보여요\n(SELECT C FROM T1\n UNION\n SELECT C FROM T2)\nMINUS\nSELECT C FROM T3;   -- {2, 3}" }
  ],
  res: { c: ["①", "②"], r: [["2,3", "1,2,3"]] },
  pg: "SELECT (SELECT STRING_AGG(C::text, ',' ORDER BY C) FROM (SELECT C FROM T1 UNION SELECT C FROM T2 EXCEPT SELECT C FROM T3) X), (SELECT STRING_AGG(C::text, ',' ORDER BY C) FROM (SELECT C FROM T1 UNION (SELECT C FROM T2 EXCEPT SELECT C FROM T3)) Y)",
  ox: [
    "정답이에요. ①은 위에서부터 (T1 ∪ T2) − T3 = {2, 3}, ②는 괄호 먼저 T1 ∪ (T2 − T3) = {1, 2, 3}이에요.",
    "이렇게 생각하면 틀려요: '곱셈처럼 MINUS가 먼저다'. Oracle의 집합 연산자는 우선순위가 같아서 ①도 위에서부터 계산해요.",
    "이렇게 생각하면 틀려요: ②의 괄호를 무시한 거예요. 괄호 안 T2 − T3 = {3}을 먼저 하니까 T1의 1은 지워지지 않아요.",
    "이렇게 생각하면 틀려요: 두 결과를 바꿔 본 거예요. 괄호 없는 ①에서 1이 빠져요."
  ],
  trap: "표준 SQL(그리고 PostgreSQL·SQL Server)은 INTERSECT를 먼저 계산해요. Oracle은 넷이 다 같은 순위라서, INTERSECT가 섞이면 DBMS마다 결과가 다를 수 있어요. 괄호를 쓰세요.",
  memo: "Oracle 집합 연산자 = 같은 순위, 위→아래, 괄호 먼저"
},
{
  id: "S98", s: 2, tp: "set", lv: 2, sub: "집합 연산자",
  th: "2과목 | MINUS의 중복 제거와 ORDER BY 위치 번호",
  q: "다음 SQL의 결과로 옳은 것은?",
  tb: [
    { n: "T1", c: ["NAME", "SCORE"], r: [["A", 80], ["A", 80], ["B", 70], ["B", 70], ["C", 90], ["D", 80]] },
    { n: "T2", c: ["NAME", "SCORE"], r: [["B", 70], ["C", 95], ["E", 60]] }
  ],
  sql: "SELECT NAME, SCORE FROM T1\nMINUS\nSELECT NAME, SCORE FROM T2\n ORDER BY 2 DESC, 1;",
  o: [
    "(C, 90), (A, 80), (A, 80), (D, 80)",
    "(C, 90), (A, 80), (A, 80), (D, 80), (B, 70)",
    "(C, 90), (A, 80), (D, 80)",
    "ORDER BY에 컬럼 위치 번호를 쓸 수 없으므로 오류가 발생한다."
  ],
  a: 2,
  sum: "MINUS는 '이 줄이 저쪽에도 있나?'만 보고 있으면 몽땅 빼고, 남은 줄의 중복도 없애요. 그래서 (C, 90), (A, 80), (D, 80) 세 줄이에요.",
  why: "MINUS는 첫 번째 결과에서 두 번째 결과에 있는 줄을 빼는 집합 연산이에요. 몇 번 있는지는 따지지 않고 '있나 없나'만 봐요.\n\n두 번째 결과에 같은 줄이 하나라도 있으면 첫 번째의 그 줄은 몇 건이든 전부 빠져요. 남은 줄도 같은 것은 하나로 합쳐요. 여기서 '같은 줄'은 모든 컬럼 값이 같은 줄이에요.\n\n이제 T1의 줄을 하나씩 봐요. (A, 80)은 2건인데 T2에 없으니 남고, 하나로 합쳐져요. **(B, 70)은 2건이지만 T2에 같은 줄이 있어서 둘 다 빠져요.** (C, 90)은 T2의 (C, 95)와 점수가 달라서 다른 줄이에요. 그래서 남아요. (D, 80)도 남아요.\n\n집합 연산의 ORDER BY는 맨 끝에 한 번만 써요. 위치 번호(2 = SCORE)나 첫 번째 SELECT의 컬럼 이름으로 지정할 수 있어요.\n\nSCORE 큰 순, 같으면 NAME 순으로 놓으면 (C, 90), (A, 80), (D, 80)이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT NAME, SCORE FROM T1    -- ① T1 6줄 → 서로 다른 줄: (A,80) (B,70) (C,90) (D,80)\nMINUS                          -- ③ ①에서 ②에 있는 줄을 빼요: (B,70) 제거, 중복은 하나로\nSELECT NAME, SCORE FROM T2     -- ② (B,70) (C,95) (E,60)\n ORDER BY 2 DESC, 1;           -- ④ 2번째 컬럼(SCORE) 큰 순, 같으면 1번째(NAME) 순" },
    { t: "[원본] → 1단계: T1의 서로 다른 행", tb: { c: ["행", "T1 건수", "T2에 있음?", "MINUS 결과"], r: [["(A, 80)", 2, "X", "1건으로 남음"], ["(B, 70)", 2, "O", "제거"], ["(C, 90)", 1, "X ((C, 95)와 다름)", "남음"], ["(D, 80)", 1, "X", "남음"]], hl: [0, 1] } },
    { t: "2단계: ORDER BY 2 DESC, 1", tb: { c: ["NAME", "SCORE"], r: [["C", 90], ["A", 80], ["D", 80]] }, n: "SCORE 내림차순, 같은 80끼리는 NAME 오름차순" }
  ],
  res: { c: ["NAME", "SCORE"], r: [["C", 90], ["A", 80], ["D", 80]] },
  pg: "SELECT NAME, SCORE FROM T1 EXCEPT SELECT NAME, SCORE FROM T2 ORDER BY 2 DESC, 1",
  ox: [
    "이렇게 생각하면 틀려요: 'MINUS는 빼기만 하고 중복은 남긴다'. MINUS도 UNION처럼 중복을 없애서 (A, 80)은 한 줄이에요.",
    "이렇게 생각하면 틀려요: '건수만큼 하나씩 뺀다'(EXCEPT ALL 방식). Oracle MINUS는 같은 줄이 있으면 건수와 상관없이 다 빼서 (B, 70)이 남지 않아요.",
    "정답이에요. (B, 70)은 다 빠지고 (A, 80)은 한 줄로 합쳐져요.",
    "이렇게 생각하면 틀려요: 'ORDER BY에는 컬럼 이름만 쓸 수 있다'. 위치 번호도 집합 연산 결과에 쓸 수 있어요."
  ],
  trap: "중복을 남기는 건 UNION ALL뿐이에요. UNION·INTERSECT·MINUS는 모두 결과의 중복을 없애요.",
  memo: "MINUS = 빼기 + 중복 제거, ORDER BY는 맨 끝에 한 번"
},
{
  id: "S99", s: 2, tp: "grp", lv: 2, sub: "그룹 함수",
  th: "2과목 | GROUPING SETS와 빈 괄호 ()",
  q: "다음 SQL의 결과 행 수는?",
  tb: [{ n: "EMP", c: ["DEPT", "JOB", "SAL"], r: [[10, "CLERK", 100], [10, "MGR", 300], [10, "CLERK", 200], [20, "CLERK", 150], [20, "ANALYST", 400]] }],
  sql: "SELECT DEPT, JOB, SUM(SAL) AS SUM_SAL\n  FROM EMP\n GROUP BY GROUPING SETS (DEPT, JOB, ());",
  o: ["5", "6", "7", "10"],
  a: 1,
  sum: "GROUPING SETS (DEPT, JOB, ())는 'DEPT별 따로, JOB별 따로, 전체 하나'를 만들어 붙여요. 2 + 3 + 1 = 6줄이에요.",
  why: "GROUPING SETS는 괄호 안에 적은 기준마다 따로 GROUP BY를 해서 결과를 이어 붙여요.\n\n괄호 안의 콤마는 '그리고 이것도 따로'라는 뜻이에요. 두 컬럼을 짝지어 묶으라는 뜻이 아니에요. **두 컬럼의 조합으로 묶으려면 (DEPT, JOB)처럼 괄호를 한 번 더 감싸야 해요.**\n\n빈 괄호 ()는 기준 없이 전체를 하나로 묶는다는 뜻이에요. 즉 총합계 한 줄이에요.\n\n이 데이터에 대입해 봐요. DEPT별로는 10, 20 두 줄이 나와요. JOB별로는 ANALYST, CLERK, MGR 세 줄이 나와요. 전체 총계가 한 줄이에요.\n\n합치면 2 + 3 + 1 = 6줄이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT DEPT, JOB, SUM(SAL) AS SUM_SAL     -- ③ 기준에 없는 컬럼은 NULL로 보여요\n  FROM EMP                                 -- ① EMP 5줄\n GROUP BY GROUPING SETS (DEPT,             -- ② DEPT별: 10, 20 → 2줄\n                         JOB,              --    JOB별: ANALYST, CLERK, MGR → 3줄\n                         ());              --    전체 총계 → 1줄  (모두 6줄)" },
    { t: "[원본] → 1단계: 그룹 기준별 결과", tb: { c: ["그룹 기준", "DEPT", "JOB", "SUM_SAL"], r: [["DEPT", 10, null, 600], ["DEPT", 20, null, 550], ["JOB", null, "ANALYST", 400], ["JOB", null, "CLERK", 450], ["JOB", null, "MGR", 300], ["()", null, null, 1150]], hl: [5] } },
    { t: "2단계: 다른 구문과 비교", tb: { c: ["구문", "행 수"], r: [["GROUPING SETS (DEPT, JOB, ())", 6], ["GROUPING SETS ((DEPT, JOB), ())", 5], ["ROLLUP (DEPT, JOB)", 7], ["CUBE (DEPT, JOB)", 10]], hl: [0] } }
  ],
  res: { c: ["행 수"], r: [[6]] },
  pg: "SELECT COUNT(*) FROM (SELECT DEPT, JOB, SUM(SAL) FROM EMP GROUP BY GROUPING SETS (DEPT, JOB, ())) X",
  ox: [
    "이렇게 생각하면 틀려요: '(DEPT, JOB) 조합 4줄 + 총계'. 조합으로 묶으려면 GROUPING SETS ((DEPT, JOB), ())처럼 괄호를 한 번 더 써야 해요.",
    "정답이에요. DEPT별 2줄 + JOB별 3줄 + 총계 1줄이에요.",
    "이렇게 생각하면 틀려요: ROLLUP(DEPT, JOB)의 줄 수(조합 4 + 부서 소계 2 + 총계 1)예요. GROUPING SETS는 적은 기준만 만들어요.",
    "이렇게 생각하면 틀려요: CUBE(DEPT, JOB)의 줄 수(조합 4 + DEPT 2 + JOB 3 + 총계 1)예요."
  ],
  trap: "GROUPING SETS는 적어 준 기준만 만들어요. ROLLUP·CUBE처럼 상세 조합 줄을 알아서 만들지 않아요.",
  memo: "GROUPING SETS (A, B, ()) = A별 + B별 + 총계"
},
{
  id: "S100", s: 2, tp: "grp", lv: 3, sub: "그룹 함수",
  th: "2과목 | 부분 ROLLUP — GROUP BY A, ROLLUP(B)",
  q: "다음 SQL의 결과에 대한 설명으로 옳은 것은?",
  tb: [{ n: "EMP", c: ["DEPT", "JOB", "SAL"], r: [[10, "CLERK", 100], [10, "CLERK", 200], [10, "MGR", 300], [20, "CLERK", 150], [20, "MGR", 250], [20, "MGR", 50]] }],
  sql: "SELECT DEPT, JOB, SUM(SAL) AS SUM_SAL\n  FROM EMP\n GROUP BY DEPT, ROLLUP(JOB)\n ORDER BY DEPT, JOB;",
  o: [
    "결과는 7행이며, 마지막 행(DEPT, JOB 모두 NULL)의 SUM_SAL은 1050이다.",
    "(DEPT 10, JOB NULL) 행의 SUM_SAL은 600이고, 전체 총계 행은 출력되지 않는다.",
    "(DEPT 20, JOB MGR) 행의 SUM_SAL은 250이다.",
    "(DEPT NULL, JOB CLERK) 행이 출력되며 SUM_SAL은 450이다."
  ],
  a: 1,
  sum: "ROLLUP 괄호 밖의 DEPT는 모든 묶음에 늘 들어가요. 그래서 (부서, 업무)와 (부서) 소계만 생기고 전체 총계는 안 생겨요.",
  why: "ROLLUP(컬럼들)은 오른쪽 컬럼부터 하나씩 빼 가며 소계 묶음을 만들어요.\n\nGROUP BY DEPT, ROLLUP(JOB)에서 DEPT는 ROLLUP 괄호 밖에 있어요. 괄호 밖의 컬럼은 모든 묶음에 항상 붙는 고정 기준이에요.\n\nROLLUP(JOB)은 (JOB)과 () 두 묶음을 만들어요. 여기에 DEPT가 붙어서 (DEPT, JOB)과 (DEPT)가 돼요.\n\n**DEPT까지 뺀 전체 총계는 어디서도 만들어지지 않아요.** 그래서 총계 줄이 없어요.\n\n상세 줄은 (10, CLERK) 300, (10, MGR) 300, (20, CLERK) 150, (20, MGR) 250 + 50 = 300으로 4줄이에요. 부서 소계는 10번 600, 20번 450으로 2줄이에요.\n\n모두 6줄이고, (10, NULL) 줄의 합계는 600이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT DEPT, JOB, SUM(SAL) AS SUM_SAL   -- ③ 소계 줄의 JOB은 NULL로 보여요\n  FROM EMP                               -- ① EMP 6줄\n GROUP BY DEPT,                          -- ② DEPT는 모든 묶음에 고정\n          ROLLUP(JOB)                    --    ROLLUP(JOB) = (JOB), () → (DEPT, JOB), (DEPT)\n ORDER BY DEPT, JOB;                     -- ④ 부서 순, 업무 순 (NULL은 맨 뒤)" },
    { t: "[원본] → 1단계: (DEPT, JOB) 상세 그룹", tb: { c: ["DEPT", "JOB", "SUM_SAL"], r: [[10, "CLERK", 300], [10, "MGR", 300], [20, "CLERK", 150], [20, "MGR", 300]] } },
    { t: "2단계: DEPT별 소계 추가 (총계 없음)", tb: { c: ["DEPT", "JOB", "SUM_SAL"], r: [[10, "CLERK", 300], [10, "MGR", 300], [10, null, 600], [20, "CLERK", 150], [20, "MGR", 300], [20, null, 450]], hl: [2, 5] } },
    { t: "의도대로 쓰려면: 전체 총계까지", n: "-- 총계도 원하면 DEPT도 ROLLUP 안에 넣어요\nSELECT DEPT, JOB, SUM(SAL) AS SUM_SAL\n  FROM EMP\n GROUP BY ROLLUP(DEPT, JOB)\n ORDER BY DEPT, JOB;   -- 위 6줄 + (NULL, NULL, 1050) 총계 = 7줄" }
  ],
  res: { c: ["DEPT", "JOB", "SUM_SAL"], r: [[10, "CLERK", 300], [10, "MGR", 300], [10, null, 600], [20, "CLERK", 150], [20, "MGR", 300], [20, null, 450]] },
  pg: "SELECT DEPT, JOB, SUM(SAL) SUM_SAL FROM EMP GROUP BY DEPT, ROLLUP(JOB) ORDER BY DEPT, JOB",
  ox: [
    "이렇게 생각하면 틀려요: ROLLUP(DEPT, JOB)과 같다고 본 거예요. DEPT가 괄호 밖이라 총계가 없어서 6줄이고 1050 줄도 없어요.",
    "정답이에요. 10번 소계는 100 + 200 + 300 = 600이고, 전체 총계 줄은 없어요.",
    "이렇게 생각하면 틀려요: (20, MGR)의 250만 본 거예요. 같은 묶음의 50도 더해서 300이에요.",
    "이렇게 생각하면 틀려요: 'JOB별 소계도 생긴다'. DEPT를 뺀 묶음은 CUBE를 써야 생겨요. 여기서는 DEPT가 늘 기준이라 DEPT가 NULL인 줄이 없어요."
  ],
  trap: "ROLLUP 괄호 밖에 둔 컬럼은 고정 기준이에요. 소계는 괄호 안 컬럼만 오른쪽부터 빼 가며 만들어요.",
  memo: "GROUP BY A, ROLLUP(B) = (A, B) + (A), 총계 없음"
},
{
  id: "S101", s: 2, tp: "grp", lv: 3, sub: "그룹 함수",
  th: "2과목 | CUBE의 NULL — 원래 NULL과 소계 NULL 구별 (GROUPING)",
  q: "다음 SQL의 결과에서 R 값이 '(없음)'인 행에 대한 설명으로 옳은 것은?",
  tb: [{ n: "T", c: ["REGION", "AMT"], r: [["EAST", 100], ["EAST", 200], [null, 50], ["WEST", 300]] }],
  sql: "SELECT NVL(REGION, '(없음)') AS R,\n       GROUPING(REGION)        AS G,\n       SUM(AMT)                AS S\n  FROM T\n GROUP BY CUBE(REGION);",
  o: [
    "1행이며 S는 50이다.",
    "1행이며 S는 650이다.",
    "2행이며 S는 각각 50(G = 0)과 650(G = 1)이다.",
    "0행이다. NVL은 CUBE가 만든 NULL에는 적용되지 않는다."
  ],
  a: 2,
  sum: "REGION이 원래 NULL인 묶음(50)과 CUBE가 만든 총계(650)는 둘 다 NULL로 보여서 NVL이 둘 다 '(없음)'으로 바꿔요. 그래서 2줄이고, G 값(0과 1)으로만 구별돼요.",
  why: "GROUP BY에서 NULL은 버려지지 않아요. NULL끼리 한 묶음이 돼요. 그래서 REGION이 NULL인 50원짜리 줄은 자기만의 묶음을 만들어요.\n\nCUBE(REGION)는 REGION별 묶음에 더해 전체 총계 줄도 만들어요. 총계 줄은 REGION을 기준에서 뺀 줄이라서, 빈 자리를 NULL로 채워서 보여 줘요.\n\n**결과만 보면 두 NULL은 똑같은 NULL이라서, NVL은 둘 다 '(없음)'으로 바꿔요.**\n\n둘을 구별하는 방법은 GROUPING(REGION)뿐이에요. 집계하면서 그 컬럼을 빼서 생긴 NULL이면 1, 원래 데이터 값이면(NULL이어도) 0을 돌려줘요.\n\n결과를 줄별로 보면 EAST 300(G 0), WEST 300(G 0), NULL 묶음 50(G 0), 총계 650(G 1)이에요. 이 중 R이 '(없음)'인 줄은 50과 650 두 줄이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT NVL(REGION, '(없음)') AS R,   -- ③ 두 종류의 NULL을 다 '(없음)'으로 바꿔요\n       GROUPING(REGION)        AS G,   --    집계가 만든 NULL이면 1, 데이터 값이면 0\n       SUM(AMT)                AS S\n  FROM T                               -- ① T 4줄 (REGION이 NULL인 줄 1개 포함)\n GROUP BY CUBE(REGION);                -- ② EAST, WEST, NULL 묶음 3줄 + 총계 1줄" },
    { t: "[원본] → 1단계: CUBE 그룹", tb: { c: ["REGION", "GROUPING(REGION)", "SUM(AMT)", "의미"], r: [["EAST", 0, 300, "데이터 그룹"], ["WEST", 0, 300, "데이터 그룹"], [null, 0, 50, "원래 NULL인 데이터 그룹"], [null, 1, 650, "총계"]], hl: [2, 3] } },
    { t: "2단계: NVL 적용 후 R = '(없음)'인 행", tb: { c: ["R", "G", "S"], r: [["(없음)", 0, 50], ["(없음)", 1, 650]] } },
    { t: "의도대로 쓰려면: GROUPING으로 이름 붙이기", n: "SELECT CASE WHEN GROUPING(REGION) = 1 THEN '총계'\n            ELSE NVL(REGION, '(없음)') END AS R,\n       SUM(AMT) AS S\n  FROM T\n GROUP BY CUBE(REGION);   -- EAST 300, WEST 300, (없음) 50, 총계 650" }
  ],
  res: { c: ["R", "G", "S"], r: [["(없음)", 0, 50], ["(없음)", 1, 650]] },
  pg: "SELECT R, G, S FROM (SELECT COALESCE(REGION, '(없음)') R, GROUPING(REGION) G, SUM(AMT) S FROM T GROUP BY CUBE(REGION)) X WHERE R = '(없음)' ORDER BY G",
  ox: [
    "이렇게 생각하면 틀려요: '총계 줄의 NULL은 NVL이 안 바꾼다'. CUBE가 만든 NULL도 결과에서는 보통 NULL이라 NVL이 바꿔요.",
    "이렇게 생각하면 틀려요: 'NULL인 데이터는 묶음을 못 만든다'. GROUP BY에서 NULL도 한 묶음(S = 50)이 돼요.",
    "정답이에요. 원래 NULL 묶음(50, G = 0)과 총계(650, G = 1) 두 줄이에요.",
    "이렇게 생각하면 틀려요: 'CUBE가 만든 NULL에는 NVL이 안 먹힌다'. NVL·DECODE·CASE 모두 그대로 적용돼요."
  ],
  trap: "소계 줄에 이름을 붙일 때 NVL을 쓰면 원래 NULL인 데이터와 섞여요. 꼭 GROUPING 함수로 구별하세요.",
  memo: "GROUPING = 1 → 집계가 만든 NULL / 0 → 원래 값(NULL 포함)"
},
{
  id: "S102", s: 2, tp: "win", lv: 2, sub: "윈도우 함수",
  th: "2과목 | ORDER BY 없는 윈도우 — SUM · RATIO_TO_REPORT · MAX OVER",
  q: "다음 SQL을 실행했을 때 ENAME이 'A'인 행의 DS, R, GAP 값으로 옳은 것은?",
  tb: [{ n: "EMP", c: ["ENAME", "DEPT", "SAL"], r: [["A", 10, 100], ["B", 10, 300], ["C", 10, 100], ["D", 20, 200], ["E", 20, 200]] }],
  sql: "SELECT ENAME, DEPT, SAL,\n       SUM(SAL) OVER (PARTITION BY DEPT)                       AS DS,\n       ROUND(RATIO_TO_REPORT(SAL) OVER (PARTITION BY DEPT), 2) AS R,\n       SAL - MAX(SAL) OVER (PARTITION BY DEPT)                 AS GAP\n  FROM EMP;",
  o: ["500, 0.2, -200", "900, 0.11, -200", "100, 0.2, -200", "500, 20, -200"],
  a: 0,
  sum: "OVER 안에 ORDER BY가 없으면 계산 범위가 부서 전체예요. 그래서 A는 부서 합 500, 비율 100 ÷ 500 = 0.2, 최고와의 차이 100 − 300 = −200이에요.",
  why: "윈도우 함수는 줄을 줄이지 않고, 각 줄 옆에 계산 값을 붙여 주는 함수예요. GROUP BY와 달리 원래 5줄이 그대로 남아요.\n\nOVER 안의 PARTITION BY는 계산할 범위를 부서별로 나눠요. ORDER BY는 그 안에서 순서를 정하고, '처음부터 지금 줄까지'처럼 누적 범위를 만들어요.\n\n**ORDER BY가 없으면 누적할 순서가 없으니 범위는 부서 전체가 돼요.** 그래서 SUM과 MAX는 같은 부서 모든 줄에 똑같은 값을 붙여요.\n\nRATIO_TO_REPORT(SAL)는 '내 값 ÷ 범위 합계'를 0~1 사이 비율로 돌려줘요. 100을 곱한 백분율이 아니에요.\n\nA는 10번 부서예요. 10번은 A 100, B 300, C 100이에요. 그래서 DS = 500, R = 100 ÷ 500 = 0.2, GAP = 100 − 300 = −200이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT ENAME, DEPT, SAL,                                          -- ③ 5줄을 그대로 보여 줘요\n       SUM(SAL) OVER (PARTITION BY DEPT)                       AS DS,   -- ② 부서 전체 합: 10 → 500, 20 → 400\n       ROUND(RATIO_TO_REPORT(SAL) OVER (PARTITION BY DEPT), 2) AS R,    -- ② 내 급여 ÷ 부서 합: A 100/500 = 0.2\n       SAL - MAX(SAL) OVER (PARTITION BY DEPT)                 AS GAP   -- ② 내 급여 − 부서 최고: A 100 − 300 = −200\n  FROM EMP;                                                         -- ① EMP 5줄" },
    { t: "[원본] → 1단계: 파티션별 집계", tb: { c: ["DEPT", "행", "SUM", "MAX"], r: [[10, "A 100, B 300, C 100", 500, 300], [20, "D 200, E 200", 400, 200]], hl: [0] } },
    { t: "2단계: 행별 계산", tb: { c: ["ENAME", "SAL", "DS", "R", "GAP"], r: [["A", 100, 500, "100 ÷ 500 = 0.2", "100 − 300 = −200"], ["B", 300, 500, "0.6", 0], ["C", 100, 500, "0.2", -200], ["D", 200, 400, "0.5", 0], ["E", 200, 400, "0.5", 0]], hl: [0] } },
    { t: "비교: OVER에 ORDER BY를 넣으면 누적 합", n: "SELECT ENAME,\n       SUM(SAL) OVER (PARTITION BY DEPT ORDER BY SAL, ENAME) AS CUM\n  FROM EMP;   -- 10번: A 100, C 200, B 500 / 20번: D 200, E 400" }
  ],
  res: { c: ["ENAME", "DS", "R", "GAP"], r: [["A", 500, 0.2, -200]] },
  pg: "SELECT ENAME, DS, R, GAP FROM (SELECT ENAME, SUM(SAL) OVER (PARTITION BY DEPT) DS, ROUND(SAL / SUM(SAL) OVER (PARTITION BY DEPT), 2) R, SAL - MAX(SAL) OVER (PARTITION BY DEPT) GAP FROM EMP) X WHERE ENAME = 'A'",
  ox: [
    "정답이에요. 부서 10 전체를 범위로 계산해서 500, 0.2, −200이에요.",
    "이렇게 생각하면 틀려요: 'PARTITION BY는 무시하고 전체 900으로 나눈다'. 범위는 부서별이라 10번 합 500으로 나눠요.",
    "이렇게 생각하면 틀려요: 'SUM OVER는 늘 누적 합이다'. 누적 합은 OVER 안에 ORDER BY가 있을 때만 생겨요.",
    "이렇게 생각하면 틀려요: 'RATIO_TO_REPORT는 백분율이다'. 결과는 0~1 사이 비율 0.2예요."
  ],
  trap: "OVER (… ORDER BY …)가 있으면 기본 범위가 '처음부터 지금 줄까지'라 누적 합이 돼요. ORDER BY가 있느냐 없느냐가 결과를 바꿔요.",
  memo: "OVER (PARTITION BY)만 = 묶음 합계를 줄마다 / RATIO_TO_REPORT = 값 ÷ 합"
},
{
  id: "S103", s: 2, tp: "topn", lv: 2, sub: "Top N 쿼리",
  th: "2과목 | OFFSET … FETCH NEXT … WITH TIES",
  q: "다음 SQL의 결과로 출력되는 ID를 모두 고른 것은? (Oracle 12c 이상)",
  tb: [{ n: "T", c: ["ID", "SCORE"], r: [[1, 90], [2, 85], [3, 95], [4, 85], [5, 70], [6, 80], [7, 85]] }],
  sql: "SELECT ID, SCORE\n  FROM T\n ORDER BY SCORE DESC\nOFFSET 2 ROWS\n FETCH NEXT 1 ROW WITH TIES;",
  o: ["2, 4, 7", "2, 4, 7 중 1개", "1, 2, 4, 7", "2, 4, 7, 6"],
  a: 0,
  sum: "정렬한 뒤 95점, 90점 두 줄을 건너뛰고 85점 한 줄을 가져와요. WITH TIES라서 같은 85점인 2, 4, 7이 모두 나와요.",
  why: "이 문장은 정렬 → 건너뛰기 → 가져오기 순서로 동작해요. OFFSET n ROWS는 앞의 n줄을 건너뛰고, FETCH NEXT m ROW는 그다음 m줄을 가져와요.\n\nWITH TIES는 '마지막으로 가져온 줄과 정렬 값이 같은 줄을 모두 함께 가져와요'라는 옵션이에요.\n\n왜 이런 옵션이 있을까요? 같은 점수끼리는 순서가 정해져 있지 않아요. 그래서 하나만 고르면 실행할 때마다 다른 줄이 나올 수 있어요. WITH TIES는 '같으면 다 넣는다'로 이 문제를 없애요.\n\n점수 높은 순으로 놓으면 95(3), 90(1), 85, 85, 85, 80(6), 70(5)이에요. OFFSET 2로 95와 90을 건너뛰어요. FETCH 1로 85점 한 줄을 가져와요.\n\n**WITH TIES 때문에 같은 85점인 2, 4, 7이 모두 나와요.** 80점은 값이 달라서 들어오지 않아요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT ID, SCORE                 -- ② 보여 줄 컬럼\n  FROM T                          -- ① T 7줄\n ORDER BY SCORE DESC              -- ③ 95, 90, 85, 85, 85, 80, 70\nOFFSET 2 ROWS                     -- ④ 95(3), 90(1)을 건너뛰어요\n FETCH NEXT 1 ROW WITH TIES;      -- ⑤ 85 한 줄 + 같은 85 전부 → 2, 4, 7" },
    { t: "[원본] → 1단계: ORDER BY SCORE DESC", tb: { c: ["순서", "ID", "SCORE"], r: [[1, 3, 95], [2, 1, 90], [3, "2/4/7 중 하나", 85], [4, "2/4/7 중 하나", 85], [5, "2/4/7 중 하나", 85], [6, 6, 80], [7, 5, 70]] }, n: "같은 85점끼리의 순서는 정해져 있지 않아요." },
    { t: "2단계: OFFSET 2 → FETCH 1 WITH TIES", tb: { c: ["순서", "SCORE", "처리"], r: [["1~2", "95, 90", "OFFSET으로 건너뜀"], [3, 85, "FETCH 1행"], ["4~5", "85, 85", "동점이라 WITH TIES로 포함"], ["6~7", "80, 70", "제외"]], hl: [1, 2] } },
    { t: "비교: ROWS ONLY라면", n: "SELECT ID, SCORE\n  FROM T\n ORDER BY SCORE DESC\nOFFSET 2 ROWS\n FETCH NEXT 1 ROW ONLY;   -- 85점 중 한 줄만 (2, 4, 7 중 어느 것인지 보장 안 돼요)" }
  ],
  res: { c: ["ID"], r: [[2], [4], [7]] },
  pg: "SELECT ID FROM (SELECT ID, SCORE FROM T ORDER BY SCORE DESC OFFSET 2 ROWS FETCH NEXT 1 ROW WITH TIES) X ORDER BY ID",
  ox: [
    "정답이에요. 두 줄을 건너뛰고 85점 한 줄에, 같은 85점이 모두 붙어요.",
    "이렇게 생각하면 틀려요: ROWS ONLY일 때의 결과예요. WITH TIES는 같은 점수를 모두 더해요.",
    "이렇게 생각하면 틀려요: 'OFFSET 2는 2번째 줄부터 시작한다'. 앞의 두 줄(95, 90)을 건너뛰니까 1번은 안 나와요.",
    "이렇게 생각하면 틀려요: 'WITH TIES는 다음 순위까지 가져온다'. 같은 값(85)만 더하고 80은 안 들어와요."
  ],
  trap: "ROWS ONLY에서 같은 점수가 있으면 어느 줄이 나올지 보장되지 않아요. 페이지 나누기에는 ORDER BY에 고유한 컬럼을 덧붙이세요.",
  memo: "정렬 → OFFSET 건너뛰기 → FETCH 가져오기 (WITH TIES = 같은 값 포함)"
},
{
  id: "S104", s: 2, tp: "topn", lv: 3, sub: "Top N 쿼리",
  th: "2과목 | ROWNUM 페이징 — 인라인 뷰 정렬 후 RN 별칭",
  q: "[EMP]에서 급여 내림차순 3번째와 4번째 사원을 정확히 조회하는 SQL은? (Oracle 기준)",
  tb: [{ n: "EMP", c: ["ENAME", "SAL"], r: [["A", 300], ["B", 500], ["C", 100], ["D", 400], ["E", 200]] }],
  sql: "① SELECT ENAME FROM (SELECT ENAME, SAL FROM EMP ORDER BY SAL DESC)\n   WHERE ROWNUM BETWEEN 3 AND 4;\n\n② SELECT ENAME FROM (SELECT ROWNUM RN, ENAME FROM EMP ORDER BY SAL DESC)\n   WHERE RN BETWEEN 3 AND 4;\n\n③ SELECT ENAME\n     FROM (SELECT ROWNUM RN, ENAME\n             FROM (SELECT ENAME, SAL FROM EMP ORDER BY SAL DESC)\n            WHERE ROWNUM <= 4)\n    WHERE RN >= 3;\n\n④ SELECT ENAME FROM EMP\n   WHERE ROWNUM BETWEEN 3 AND 4\n   ORDER BY SAL DESC;",
  o: ["①", "②", "③", "④"],
  a: 2,
  sum: "ROWNUM은 통과한 줄에 1부터 붙는 번호라서 'ROWNUM이 3 이상'만 따로 거르면 영원히 0건이에요. 정렬 → 번호를 RN으로 굳히기 → RN으로 거르기, 이 3단계인 ③만 맞아요.",
  why: "ROWNUM은 WHERE 조건을 통과한 줄에 1, 2, 3 … 순서로 붙는 번호예요. 번호는 줄이 조건을 통과하는 순간 정해져요.\n\n첫 줄은 1번을 받아요. 그런데 'ROWNUM >= 3' 조건에 걸려 떨어지면 1번은 쓰이지 않은 채 남아요. 다음 줄이 다시 1번을 받고, 또 떨어져요.\n\n**그래서 1을 포함하지 않는 ROWNUM 조건(BETWEEN 3 AND 4)은 절대 참이 될 수 없어 늘 0건이에요(①, ④).**\n\n또 ROWNUM은 같은 SELECT의 ORDER BY보다 먼저 붙어요. 그래서 ②처럼 정렬하는 SELECT 안에서 번호를 붙이면 급여 순위가 아니라 읽은 순서가 돼요.\n\n③은 세 단계예요. 가장 안쪽에서 급여 순으로 정렬해요(B, D, A, E, C). 중간에서 ROWNUM <= 4로 위 4명을 자르면서 번호를 RN이라는 보통 컬럼으로 굳혀요. 바깥에서 RN >= 3으로 거르면 A(3), E(4)가 나와요.",
  st: [
    { t: "SQL 한 줄씩 읽기 (정답 ③)", n: "SELECT ENAME                                 -- ⑤ A, E\n  FROM (SELECT ROWNUM RN, ENAME              -- ③ 통과 순서대로 1~4 → RN이라는 보통 컬럼으로 굳혀요\n          FROM (SELECT ENAME, SAL FROM EMP\n                 ORDER BY SAL DESC)          -- ① 먼저 정렬: B, D, A, E, C\n         WHERE ROWNUM <= 4)                  -- ② 1부터 시작하는 조건이라 문제없어요: B, D, A, E\n WHERE RN >= 3;                              -- ④ RN은 이미 굳은 값이라 3 이상도 거를 수 있어요: A, E" },
    { t: "[원본] → 1단계: 가장 안쪽 정렬", tb: { c: ["ENAME", "SAL"], r: [["B", 500], ["D", 400], ["A", 300], ["E", 200], ["C", 100]] } },
    { t: "2단계: ROWNUM <= 4로 번호를 붙여 RN으로 고정", tb: { c: ["RN", "ENAME"], r: [[1, "B"], [2, "D"], [3, "A"], [4, "E"]], hl: [2, 3] } },
    { t: "3단계: RN >= 3", tb: { c: ["ENAME"], r: [["A"], ["E"]] } },
    { t: "나머지 보기", tb: { c: ["보기", "문제점", "결과"], r: [["①", "ROWNUM 3 이상 조건은 성립 불가", "0건"], ["②", "ROWNUM이 정렬 전에 붙음", "정렬과 무관한 2명"], ["④", "ROWNUM 조건이 먼저, ORDER BY는 나중", "0건"]] } },
    { t: "다른 방법: Oracle 12c 이상", n: "SELECT ENAME\n  FROM EMP\n ORDER BY SAL DESC\nOFFSET 2 ROWS FETCH NEXT 2 ROWS ONLY;   -- A, E" }
  ],
  res: { c: ["ENAME"], r: [["A"], ["E"]] },
  pg: "SELECT ENAME FROM (SELECT ROW_NUMBER() OVER (ORDER BY SAL DESC) RN, ENAME FROM EMP) X WHERE RN BETWEEN 3 AND 4 ORDER BY RN",
  ox: [
    "이렇게 생각하면 틀려요: '정렬해 뒀으니 ROWNUM 3~4를 바로 고르면 된다'. 첫 줄이 1번에서 계속 떨어져 번호가 3까지 못 올라가요. 0건이에요.",
    "이렇게 생각하면 틀려요: 'ROWNUM은 정렬 뒤에 붙는다'. 같은 SELECT 안에서는 번호가 정렬보다 먼저 붙어서 RN은 급여 순위가 아니에요.",
    "정답이에요. 정렬 → 위 4명에 번호를 굳힘 → 3번 이상 고르기라서 A, E가 나와요.",
    "이렇게 생각하면 틀려요: 'ORDER BY가 먼저 실행된다'. ROWNUM 조건이 정렬보다 먼저 검사되고, 그 조건이 성립하지 않아 0건이에요."
  ],
  trap: "ROW_NUMBER() OVER (ORDER BY SAL DESC)로 번호를 붙인 인라인 뷰에서 RN BETWEEN 3 AND 4로 골라도 같은 결과예요(검증 쿼리 방식).",
  memo: "ROWNUM 페이징 = 정렬 → ROWNUM <= 끝 AS RN → RN >= 시작"
},
{
  id: "S105", s: 2, tp: "topn", lv: 2, sub: "Top N 쿼리",
  th: "2과목 | 동점이 있을 때 TOP-N 방식별 건수 (SQL Server TOP WITH TIES 포함)",
  q: "다음 SQL 중 결과 건수가 나머지 셋과 다른 것은? (①~③은 Oracle, ④는 SQL Server)",
  tb: [{ n: "EMP", c: ["ENAME", "SAL"], r: [["A", 500], ["B", 400], ["C", 400], ["D", 300], ["E", 300], ["F", 200]] }],
  sql: "① SELECT * FROM (SELECT ENAME, ROW_NUMBER() OVER (ORDER BY SAL DESC) RK FROM EMP) WHERE RK <= 3;\n② SELECT * FROM (SELECT ENAME, RANK()       OVER (ORDER BY SAL DESC) RK FROM EMP) WHERE RK <= 3;\n③ SELECT * FROM (SELECT ENAME, DENSE_RANK() OVER (ORDER BY SAL DESC) RK FROM EMP) WHERE RK <= 3;\n④ SELECT TOP(3) WITH TIES ENAME, SAL FROM EMP ORDER BY SAL DESC;",
  o: ["①", "②", "③", "④"],
  a: 2,
  sum: "DENSE_RANK는 순위를 건너뛰지 않아서(1, 2, 2, 3, 3) 3위 이하에 5명이 들어와요. 나머지 셋은 모두 3건이에요.",
  why: "세 순위 함수는 같은 값(동점)을 어떻게 처리하느냐만 달라요.\n\nROW_NUMBER는 동점이어도 1, 2, 3 …으로 겹치지 않는 번호를 줘요. RANK는 동점에 같은 순위를 주고, 그 수만큼 다음 순위를 건너뛰어요(1, 2, 2, 4). DENSE_RANK는 같은 순위를 주지만 건너뛰지 않아요(1, 2, 2, 3).\n\n**'RK <= 3'은 순위 값으로 거르기 때문에, 순위가 촘촘한 DENSE_RANK에서는 급여 값 3개(500, 400, 300)에 해당하는 5명이 모두 들어와요.**\n\n줄별로 보면 A 500, B 400, C 400, D 300, E 300, F 200이에요. ROW_NUMBER는 A, B, C까지 3명이에요. RANK는 1, 2, 2, 4라 3 이하가 A, B, C 3명이에요. DENSE_RANK는 1, 2, 2, 3, 3이라 A~E 5명이에요.\n\nSQL Server의 TOP(3) WITH TIES는 정렬 후 3번째 줄의 값(400)과 같은 줄만 더 붙여요. 400인 B, C는 이미 3줄 안에 있어서 더 붙을 게 없어요. 3건이에요.\n\n그래서 ③만 5건이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- ① ROW_NUMBER: 1, 2, 3, 4, 5, 6\nSELECT * FROM (SELECT ENAME, ROW_NUMBER() OVER (ORDER BY SAL DESC) RK FROM EMP)\n WHERE RK <= 3;   -- A, B, C → 3건\n-- ② RANK: 1, 2, 2, 4, 4, 6\nSELECT * FROM (SELECT ENAME, RANK() OVER (ORDER BY SAL DESC) RK FROM EMP)\n WHERE RK <= 3;   -- A, B, C → 3건\n-- ③ DENSE_RANK: 1, 2, 2, 3, 3, 4\nSELECT * FROM (SELECT ENAME, DENSE_RANK() OVER (ORDER BY SAL DESC) RK FROM EMP)\n WHERE RK <= 3;   -- A, B, C, D, E → 5건\n-- ④ SQL Server: 3번째 줄 값(400)과 같은 줄만 추가\nSELECT TOP(3) WITH TIES ENAME, SAL FROM EMP ORDER BY SAL DESC;   -- A, B, C → 3건" },
    { t: "[원본] → 1단계: 순위 매기기", tb: { c: ["ENAME", "SAL", "ROW_NUMBER", "RANK", "DENSE_RANK"], r: [["A", 500, 1, 1, 1], ["B", 400, 2, 2, 2], ["C", 400, 3, 2, 2], ["D", 300, 4, 4, 3], ["E", 300, 5, 4, 3], ["F", 200, 6, 6, 4]], hl: [3, 4] } },
    { t: "2단계: 3 이하 / TOP 3 건수", tb: { c: ["방식", "선택", "건수"], r: [["① ROW_NUMBER <= 3", "A, B, C", 3], ["② RANK <= 3", "A, B, C", 3], ["③ DENSE_RANK <= 3", "A, B, C, D, E", 5], ["④ TOP(3) WITH TIES", "A, B, C (3번째 값 400의 동점까지)", 3]], hl: [2] } }
  ],
  res: { c: ["①", "②", "③", "④"], r: [[3, 3, 5, 3]] },
  pg: "SELECT (SELECT COUNT(*) FROM (SELECT ROW_NUMBER() OVER (ORDER BY SAL DESC) RK FROM EMP) X WHERE RK <= 3), (SELECT COUNT(*) FROM (SELECT RANK() OVER (ORDER BY SAL DESC) RK FROM EMP) X WHERE RK <= 3), (SELECT COUNT(*) FROM (SELECT DENSE_RANK() OVER (ORDER BY SAL DESC) RK FROM EMP) X WHERE RK <= 3), (SELECT COUNT(*) FROM (SELECT SAL FROM EMP ORDER BY SAL DESC FETCH FIRST 3 ROWS WITH TIES) X)",
  ox: [
    "이렇게 생각하면 틀려요: 이건 3건이에요. ROW_NUMBER는 동점이어도 번호가 겹치지 않아 늘 딱 N건이에요.",
    "이렇게 생각하면 틀려요: 이것도 3건이에요. 2위가 둘이라 다음 순위가 4위로 건너뛰어서 3위가 없어요.",
    "정답이에요. DENSE_RANK는 건너뛰지 않아 300인 D, E가 3위가 되어 5건이에요.",
    "이렇게 생각하면 틀려요: 'WITH TIES는 3위까지 동점을 다 넣는다'. 3번째 줄의 값(400)과 같은 줄만 붙고, 그건 이미 들어 있어서 3건이에요."
  ],
  trap: "WITH TIES는 'N번째 줄의 값'과 같은 줄을 붙여요. 'N번째 순위'까지 가져오는 DENSE_RANK와 헷갈리지 마세요.",
  memo: "ROW_NUMBER 딱 N / RANK·TIES는 동점 포함 / DENSE_RANK는 값 N개"
},
{
  id: "S106", s: 2, tp: "hier", lv: 3, sub: "계층형 질의와 셀프 조인",
  th: "2과목 | CONNECT_BY_ROOT와 SYS_CONNECT_BY_PATH",
  q: "다음 SQL의 결과 행 수와, ENAME이 ADAMS인 행의 ROOT, PATH 값으로 옳은 것은?",
  tb: [{ n: "EMP", c: ["EMPNO", "ENAME", "MGR"], r: [[1, "KING", null], [2, "JONES", 1], [3, "BLAKE", 1], [4, "SCOTT", 2], [5, "ADAMS", 4], [6, "ALLEN", 3]] }],
  sql: "SELECT ENAME,\n       CONNECT_BY_ROOT ENAME          AS ROOT,\n       SYS_CONNECT_BY_PATH(ENAME, '/') AS PATH\n  FROM EMP\n START WITH MGR = 1\nCONNECT BY PRIOR EMPNO = MGR;",
  o: [
    "6행 / KING, /KING/JONES/SCOTT/ADAMS",
    "5행 / SCOTT, /SCOTT/ADAMS",
    "5행 / JONES, JONES/SCOTT/ADAMS/",
    "5행 / JONES, /JONES/SCOTT/ADAMS"
  ],
  a: 3,
  sum: "START WITH MGR = 1이라 KING이 아니라 JONES와 BLAKE가 출발점(루트)이에요. ADAMS는 JONES에서 출발한 줄기라 ROOT는 JONES, PATH는 /JONES/SCOTT/ADAMS예요.",
  why: "계층형 질의는 START WITH 조건에 맞는 줄을 출발점(루트, LEVEL 1)으로 삼아요. 그다음 CONNECT BY PRIOR EMPNO = MGR에 따라 '부모의 EMPNO를 MGR로 가진 줄', 즉 부하 직원을 찾아 내려가요.\n\n루트는 회사 전체의 최상위가 아니라 START WITH가 고른 줄이에요.\n\n**START WITH MGR = 1이니까 KING의 직속 부하 JONES와 BLAKE가 각각 루트가 돼요. KING 자신은 MGR이 1이 아니라서 결과에 나오지 않아요.**\n\nJONES 아래로 SCOTT, 그 아래로 ADAMS가 이어져요. BLAKE 아래로 ALLEN이 이어져요. 그래서 모두 5줄이에요.\n\nCONNECT_BY_ROOT ENAME은 '내가 속한 줄기의 출발점 이름'이에요. SYS_CONNECT_BY_PATH(ENAME, '/')는 출발점부터 나까지 이름마다 앞에 '/'를 붙여 이어 붙여요.\n\n그래서 ADAMS의 ROOT는 JONES, PATH는 /JONES/SCOTT/ADAMS예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT ENAME,\n       CONNECT_BY_ROOT ENAME          AS ROOT,  -- ④ 내가 속한 줄기의 출발점 이름\n       SYS_CONNECT_BY_PATH(ENAME, '/') AS PATH   -- ④ 출발점 → 나까지, 이름마다 앞에 '/'\n  FROM EMP                                       -- ① EMP 6줄\n START WITH MGR = 1                              -- ② 출발점: JONES(2), BLAKE(3) — KING은 MGR이 NULL이라 빠져요\nCONNECT BY PRIOR EMPNO = MGR;                    -- ③ 부모 EMPNO = 자식 MGR로 내려가요: SCOTT, ADAMS, ALLEN" },
    { t: "[원본] → 1단계: START WITH MGR = 1로 시작한 트리", n: "JONES(2)   ← 루트\n└─ SCOTT(4)\n    └─ ADAMS(5)\nBLAKE(3)   ← 루트\n└─ ALLEN(6)\n(KING은 START WITH 조건에 맞지 않아 제외)" },
    { t: "2단계: 행별 ROOT · PATH", tb: { c: ["LEVEL", "ENAME", "ROOT", "PATH"], r: [[1, "JONES", "JONES", "/JONES"], [2, "SCOTT", "JONES", "/JONES/SCOTT"], [3, "ADAMS", "JONES", "/JONES/SCOTT/ADAMS"], [1, "BLAKE", "BLAKE", "/BLAKE"], [2, "ALLEN", "BLAKE", "/BLAKE/ALLEN"]], hl: [2] } },
    { t: "의도대로 쓰려면: KING부터 전체 트리", n: "-- 최상위부터 보려면 출발점을 MGR IS NULL로 잡아요\nSELECT ENAME,\n       CONNECT_BY_ROOT ENAME          AS ROOT,\n       SYS_CONNECT_BY_PATH(ENAME, '/') AS PATH\n  FROM EMP\n START WITH MGR IS NULL\nCONNECT BY PRIOR EMPNO = MGR;   -- 6줄, ADAMS: ROOT = KING, PATH = /KING/JONES/SCOTT/ADAMS\n-- KING\n-- ├─ JONES ─ SCOTT ─ ADAMS\n-- └─ BLAKE ─ ALLEN" }
  ],
  res: { c: ["행 수", "ENAME", "ROOT", "PATH"], r: [[5, "ADAMS", "JONES", "/JONES/SCOTT/ADAMS"]] },
  pg: "WITH RECURSIVE H AS (SELECT EMPNO, ENAME, ENAME ROOT, '/' || ENAME PATH FROM EMP WHERE MGR = 1 UNION ALL SELECT E.EMPNO, E.ENAME, H.ROOT, H.PATH || '/' || E.ENAME FROM EMP E JOIN H ON E.MGR = H.EMPNO) SELECT (SELECT COUNT(*) FROM H), ENAME, ROOT, PATH FROM H WHERE ENAME = 'ADAMS'",
  ox: [
    "이렇게 생각하면 틀려요: '루트는 회사 최상위 KING이다'. 루트는 START WITH가 고른 줄(JONES, BLAKE)이고 KING은 결과에 없어요. 이건 START WITH MGR IS NULL일 때의 답이에요.",
    "이렇게 생각하면 틀려요: 'ROOT는 바로 위 상사(SCOTT)다'. 바로 위 상사는 PRIOR ENAME이고, 경로도 출발점부터 시작해요.",
    "이렇게 생각하면 틀려요: '구분자는 이름 뒤에 붙는다'. '/'는 이름마다 앞에 붙어서 맨 앞이 '/'이고 맨 뒤에는 없어요.",
    "정답이에요. 출발점이 JONES·BLAKE라 5줄이고, ADAMS의 줄기 출발점은 JONES예요."
  ],
  trap: "PRIOR ENAME = 바로 위 부모, CONNECT_BY_ROOT ENAME = 출발점, SYS_CONNECT_BY_PATH = 출발점부터의 경로. 셋을 구별하세요.",
  memo: "ROOT = START WITH로 고른 줄 / PATH = '/출발점/…/나'"
},
{
  id: "S107", s: 2, tp: "pivot", lv: 3, sub: "PIVOT 절과 UNPIVOT 절",
  th: "2과목 | PIVOT 다중 집계 — 컬럼명 규칙과 COUNT의 0",
  q: "다음 SQL 결과의 컬럼 순서와 DEPT 20 행의 값으로 옳은 것은? (Oracle 기준)",
  tb: [{ n: "SALES", c: ["DEPT", "QTR", "AMT"], r: [[10, "Q1", 100], [10, "Q1", 50], [10, "Q2", 200], [20, "Q1", 300], [20, "Q3", 500]] }],
  sql: "SELECT *\n  FROM (SELECT DEPT, QTR, AMT FROM SALES)\n PIVOT (SUM(AMT) AS S, COUNT(AMT) AS C\n        FOR QTR IN ('Q1' AS Q1, 'Q2' AS Q2))\n ORDER BY DEPT;",
  o: [
    "DEPT, S_Q1, C_Q1, S_Q2, C_Q2 / 20, 300, 1, NULL, 0",
    "DEPT, Q1_S, Q1_C, Q2_S, Q2_C / 20, 300, 1, NULL, 0",
    "DEPT, Q1_S, Q1_C, Q2_S, Q2_C / 20, 300, 1, 0, 0",
    "DEPT, Q1_S, Q2_S, Q1_C, Q2_C / 20, 300, NULL, 1, 0"
  ],
  a: 1,
  sum: "집계를 두 개 쓰면 IN 값마다 'Q1_S, Q1_C'처럼 컬럼이 두 개씩 생겨요. 20번은 Q2 자료가 없어서 SUM은 NULL, COUNT는 0이에요.",
  why: "PIVOT은 줄로 늘어선 값을 컬럼으로 펼쳐요. FOR 컬럼(QTR)과 집계 대상(AMT)을 뺀 나머지 컬럼(DEPT)이 줄을 나누는 기준이 돼요.\n\n집계 함수를 여러 개 쓰면 IN 값 하나마다 집계 함수 수만큼 컬럼이 생겨요. 이름은 'IN 값 별칭_집계 별칭'이에요(Q1_S). 순서는 IN 값 순서대로, 그 안에서 집계 함수 순서대로예요. 그래서 Q1_S, Q1_C, Q2_S, Q2_C예요.\n\n**칸마다 해당 (부서, 분기) 자료만 모아 집계하기 때문에, 자료가 없으면 SUM은 더할 게 없어 NULL, COUNT는 0이에요.**\n\n20번 부서를 봐요. Q1에는 300 한 건이 있어서 Q1_S = 300, Q1_C = 1이에요. Q2에는 자료가 없어서 Q2_S = NULL, Q2_C = 0이에요. Q3(500)는 IN 목록에 없어서 어느 칸에도 들어가지 않아요.\n\n그래서 20번 줄은 (20, 300, 1, NULL, 0)이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT *                                          -- ④ DEPT, Q1_S, Q1_C, Q2_S, Q2_C\n  FROM (SELECT DEPT, QTR, AMT FROM SALES)         -- ① 5줄, 남는 컬럼 DEPT가 줄 기준\n PIVOT (SUM(AMT) AS S, COUNT(AMT) AS C            -- ③ 칸마다 두 가지 집계 (별칭 S, C)\n        FOR QTR IN ('Q1' AS Q1, 'Q2' AS Q2))      -- ② QTR이 Q1, Q2인 줄만 칸으로 나눠요 (Q3는 버려요)\n ORDER BY DEPT;                                   -- ⑤ 10, 20 순" },
    { t: "[원본] → 1단계: (DEPT, QTR)별 집계", tb: { c: ["DEPT", "QTR", "SUM(AMT)", "COUNT(AMT)"], r: [[10, "Q1", 150, 2], [10, "Q2", 200, 1], [20, "Q1", 300, 1], [20, "Q3", 500, 1]], hl: [3] }, n: "Q3는 IN 목록에 없어서 버려져요." },
    { t: "2단계: 컬럼으로 펼치기", tb: { c: ["DEPT", "Q1_S", "Q1_C", "Q2_S", "Q2_C"], r: [[10, 150, 2, 200, 1], [20, 300, 1, null, 0]], hl: [1] } }
  ],
  res: { c: ["DEPT", "Q1_S", "Q1_C", "Q2_S", "Q2_C"], r: [[10, 150, 2, 200, 1], [20, 300, 1, null, 0]] },
  pg: "SELECT DEPT, SUM(AMT) FILTER (WHERE QTR = 'Q1') Q1_S, COUNT(AMT) FILTER (WHERE QTR = 'Q1') Q1_C, SUM(AMT) FILTER (WHERE QTR = 'Q2') Q2_S, COUNT(AMT) FILTER (WHERE QTR = 'Q2') Q2_C FROM SALES GROUP BY DEPT ORDER BY DEPT",
  ox: [
    "이렇게 생각하면 틀려요: '이름은 집계 별칭이 앞이다'(S_Q1). Oracle은 IN 값 별칭을 앞에 둬요.",
    "정답이에요. Q1_S, Q1_C, Q2_S, Q2_C 순이고, 20번의 빈 Q2는 SUM NULL, COUNT 0이에요.",
    "이렇게 생각하면 틀려요: '자료가 없으면 SUM도 0이다'. 더할 게 없으면 SUM은 NULL이고, 0이 되는 건 COUNT뿐이에요.",
    "이렇게 생각하면 틀려요: '집계 함수별로 컬럼을 모은다'(S들 먼저). IN 값 하나마다 그 값의 집계 컬럼이 연달아 나와요."
  ],
  trap: "집계 함수가 여러 개인데 집계 별칭을 빼면 컬럼 이름이 겹쳐서 쓸 수 없어요. 여러 집계에는 별칭을 붙이세요.",
  memo: "PIVOT 컬럼 이름 = IN별칭_집계별칭, 빈 칸: SUM NULL / COUNT 0"
},
{
  id: "S108", s: 2, tp: "pivot", lv: 2, sub: "PIVOT 절과 UNPIVOT 절",
  th: "2과목 | 인라인 뷰 없이 PIVOT — 남은 컬럼이 모두 그룹 기준",
  q: "다음 SQL의 결과 행 수는? (Oracle 기준)",
  tb: [{ n: "SALES", c: ["ID", "DEPT", "QTR", "AMT"], r: [[1, 10, "Q1", 100], [2, 10, "Q2", 200], [3, 10, "Q1", 50], [4, 20, "Q1", 300], [5, 20, "Q3", 400]] }],
  sql: "SELECT *\n  FROM SALES\n PIVOT (SUM(AMT) FOR QTR IN ('Q1' AS Q1, 'Q2' AS Q2));",
  o: ["2", "4", "5", "PIVOT은 인라인 뷰 없이 쓸 수 없으므로 오류가 발생한다."],
  a: 2,
  sum: "PIVOT은 집계·FOR 컬럼을 뺀 나머지 컬럼을 모두 줄 기준으로 써요. 테이블을 그대로 쓰면 ID까지 기준이 되어 5줄이 그대로 남아요.",
  why: "PIVOT에는 GROUP BY를 따로 쓰지 않아요. 대신 집계에 쓴 컬럼(AMT)과 FOR 컬럼(QTR)을 뺀 나머지 컬럼을 전부 줄 나누는 기준으로 써요.\n\n어떤 컬럼으로 묶을지 고르는 문법이 따로 없어요. 그래서 FROM에 들어온 컬럼이 곧 기준이 돼요.\n\n**FROM에 SALES를 그대로 쓰면 ID까지 기준이 되는데, ID는 줄마다 달라서 5줄이 그대로 5묶음이 돼요.**\n\n줄별로 보면 ID 1은 Q1 100, ID 2는 Q2 200, ID 3은 Q1 50, ID 4는 Q1 300이에요. ID 5는 Q3라서 IN 목록에 없어요. 그래도 줄은 사라지지 않고 Q1, Q2 칸만 NULL로 남아요.\n\n그래서 결과는 5줄이에요. 부서별 2줄을 원하면 인라인 뷰로 DEPT, QTR, AMT만 골라 ID를 빼야 해요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT *                                       -- ④ ID, DEPT, Q1, Q2\n  FROM SALES                                   -- ① ID, DEPT, QTR, AMT 5줄 그대로\n PIVOT (SUM(AMT)                               -- ③ (ID, DEPT) 묶음마다 합계\n        FOR QTR IN ('Q1' AS Q1, 'Q2' AS Q2));  -- ② 기준 = AMT, QTR을 뺀 (ID, DEPT) → 5묶음" },
    { t: "[원본] → 1단계: 그룹 기준 = AMT·QTR을 뺀 (ID, DEPT)", tb: { c: ["ID", "DEPT", "QTR", "AMT"], r: [[1, 10, "Q1", 100], [2, 10, "Q2", 200], [3, 10, "Q1", 50], [4, 20, "Q1", 300], [5, 20, "Q3", 400]] } },
    { t: "2단계: PIVOT 결과", tb: { c: ["ID", "DEPT", "Q1", "Q2"], r: [[1, 10, 100, null], [2, 10, null, 200], [3, 10, 50, null], [4, 20, 300, null], [5, 20, null, null]], hl: [4] } },
    { t: "의도대로 쓰려면: 인라인 뷰로 ID 빼기", tb: { c: ["DEPT", "Q1", "Q2"], r: [[10, 150, 200], [20, 300, null]] }, n: "-- 부서별로 펼치려면 필요한 컬럼만 골라서 PIVOT해요\nSELECT *\n  FROM (SELECT DEPT, QTR, AMT FROM SALES)\n PIVOT (SUM(AMT) FOR QTR IN ('Q1' AS Q1, 'Q2' AS Q2));   -- 10: 150, 200 / 20: 300, NULL (2줄)" }
  ],
  res: { c: ["행 수"], r: [[5]] },
  pg: "SELECT COUNT(*) FROM (SELECT ID, DEPT, SUM(AMT) FILTER (WHERE QTR = 'Q1') Q1, SUM(AMT) FILTER (WHERE QTR = 'Q2') Q2 FROM SALES GROUP BY ID, DEPT) X",
  ox: [
    "이렇게 생각하면 틀려요: 인라인 뷰로 ID를 뺐을 때의 답이에요. 테이블을 그대로 쓰면 ID도 기준이 돼요.",
    "이렇게 생각하면 틀려요: 'IN 목록에 없는 Q3 줄은 사라진다'. PIVOT은 줄을 거르지 않아서, 그 줄은 남고 칸만 NULL이에요.",
    "정답이에요. ID가 줄마다 달라서 5묶음 그대로 5줄이에요.",
    "이렇게 생각하면 틀려요: 'PIVOT은 인라인 뷰가 꼭 필요하다'. 테이블에 바로 써도 돼요. 남은 컬럼이 모두 기준이 될 뿐이에요."
  ],
  trap: "PIVOT 문제는 FROM이 인라인 뷰인지 테이블인지부터 보세요. 컬럼 하나 차이로 줄 수가 크게 달라져요.",
  memo: "PIVOT 줄 기준 = 집계·FOR 컬럼을 뺀 나머지 전부"
},
{
  id: "S109", s: 2, tp: "regex", lv: 3, sub: "정규 표현식",
  th: "2과목 | REGEXP_REPLACE 역참조(\\1, \\2 …)",
  q: "다음 SQL의 결과로 옳은 것은?",
  sql: "SELECT REGEXP_REPLACE('2026-10-04', '(\\d{4})-(\\d{2})-(\\d{2})', '\\3/\\2/\\1') AS C1,\n       REGEXP_REPLACE('KIM, MINSU', '(\\w+), (\\w+)', '\\2 \\1')              AS C2\n  FROM DUAL;",
  o: ["04/10/2026, MINSU KIM", "2026/10/04, MINSU KIM", "04/10/2026, KIM MINSU", "\\3/\\2/\\1, \\2 \\1"],
  a: 0,
  sum: "괄호로 잡은 조각에 왼쪽부터 1, 2, 3번이 붙고, \\3/\\2/\\1은 그 조각을 거꾸로 이어 붙여요. 그래서 04/10/2026, MINSU KIM이에요.",
  why: "정규 표현식에서 괄호 ( )는 그 부분과 맞은 글자를 기억해 둬요. 이것을 캡처 그룹이라고 불러요.\n\n번호는 여는 괄호가 왼쪽에서 나오는 순서대로 1, 2, 3이 붙어요. 바꿀 문자열 안의 \\1, \\2, \\3은 그 번호의 조각을 다시 꺼내 쓰라는 뜻이에요(역참조).\n\n**그래서 바꿀 문자열에서 \\3, \\2, \\1 순서로 쓰면 원래 조각들의 순서가 그대로 뒤바뀌어요.**\n\nC1부터 봐요. \\d는 숫자 한 글자, {4}는 정확히 4번이에요. 그래서 \\1 = 2026, \\2 = 10, \\3 = 04예요. '\\3/\\2/\\1'은 04/10/2026이 돼요.\n\nC2를 봐요. \\w+는 글자·숫자·밑줄이 한 개 이상 이어진 것이에요. \\1 = KIM, \\2 = MINSU예요. 가운데 ', '(콤마와 공백)는 괄호 밖이라 기억되지 않아요. '\\2 \\1'은 MINSU 공백 KIM이에요.\n\n결과는 04/10/2026, MINSU KIM이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT REGEXP_REPLACE('2026-10-04',\n                      '(\\d{4})-(\\d{2})-(\\d{2})',   -- ① \\1 = 2026, \\2 = 10, \\3 = 04를 기억해요\n                      '\\3/\\2/\\1') AS C1,            -- ② 거꾸로 이어 붙여요: 04/10/2026\n       REGEXP_REPLACE('KIM, MINSU',\n                      '(\\w+), (\\w+)',                -- ① \\1 = KIM, \\2 = MINSU (', '는 괄호 밖)\n                      '\\2 \\1') AS C2                 -- ② MINSU KIM\n  FROM DUAL;" },
    { t: "1단계: C1 그룹 캡처", tb: { c: ["그룹", "패턴", "맞춘 값"], r: [["\\1", "(\\d{4})", "2026"], ["\\2", "(\\d{2})", "10"], ["\\3", "(\\d{2})", "04"]] } },
    { t: "2단계: C2 그룹 캡처", tb: { c: ["그룹", "패턴", "맞춘 값"], r: [["\\1", "(\\w+)", "KIM"], ["\\2", "(\\w+)", "MINSU"]] }, n: "', '(콤마+공백)는 괄호 밖이라 결과에서 사라지고, 바꿀 문자열의 공백 하나가 들어가요." },
    { t: "3단계: 치환 결과", tb: { c: ["식", "결과"], r: [["'\\3/\\2/\\1'", "04/10/2026"], ["'\\2 \\1'", "MINSU KIM"]] } }
  ],
  res: { c: ["C1", "C2"], r: [["04/10/2026", "MINSU KIM"]] },
  pg: "SELECT REGEXP_REPLACE('2026-10-04', '(\\d{4})-(\\d{2})-(\\d{2})', '\\3/\\2/\\1'), REGEXP_REPLACE('KIM, MINSU', '(\\w+), (\\w+)', '\\2 \\1')",
  ox: [
    "정답이에요. 조각 순서를 거꾸로 붙여 04/10/2026, 이름과 성을 바꿔 MINSU KIM이에요.",
    "이렇게 생각하면 틀려요: '번호는 오른쪽부터 센다'(\\3 = 2026). 번호는 왼쪽 여는 괄호부터 붙어서 \\3은 04예요.",
    "이렇게 생각하면 틀려요: C2의 순서를 안 바꾼 거예요. '\\2 \\1'이니까 두 번째 조각 MINSU가 앞에 와요.",
    "이렇게 생각하면 틀려요: '\\1은 글자 그대로 나온다'. 바꿀 문자열의 \\1~\\9는 기억한 조각으로 바뀌어요."
  ],
  trap: "패턴이 원본과 맞지 않으면 REGEXP_REPLACE는 원본 문자열을 그대로 돌려줘요. 오류도 NULL도 아니에요.",
  memo: "( ) = 조각 기억, \\n = n번 조각, 번호는 왼쪽 괄호부터"
},
{
  id: "S110", s: 2, tp: "regex", lv: 2, sub: "정규 표현식",
  th: "2과목 | REGEXP_LIKE 앵커(^ $)와 POSIX 문자 클래스",
  q: "다음 두 SQL의 결과 건수로 옳은 것은?",
  tb: [{ n: "T", c: ["CODE"], r: [["AB123"], ["AB12"], ["XAB123"], ["AB1234"], ["A1234"], ["AB-123"]] }],
  sql: "-- ①\nSELECT COUNT(*) FROM T WHERE REGEXP_LIKE(CODE, '^[A-Z]{2}[[:digit:]]{3}$');\n-- ②\nSELECT COUNT(*) FROM T WHERE REGEXP_LIKE(CODE, '[A-Z]{2}[[:digit:]]{3}');",
  o: ["① 1, ② 1", "① 1, ② 3", "① 3, ② 3", "① 1, ② 4"],
  a: 1,
  sum: "REGEXP_LIKE는 문자열 '어딘가에' 패턴이 있으면 통과예요. ^와 $로 양 끝을 묶은 ①은 AB123 1건, 안 묶은 ②는 3건이에요.",
  why: "REGEXP_LIKE는 문자열 안에서 패턴과 맞는 부분을 하나라도 찾으면 참이에요. LIKE와 달리 문자열 전체가 맞을 필요가 없어요.\n\n전체가 딱 맞아야 한다면 ^(문자열 시작)와 $(문자열 끝)로 양 끝을 묶어야 해요.\n\n[[:digit:]]는 숫자 한 글자를 뜻해요. {n}은 바로 앞의 것이 정확히 n번이라는 뜻이에요. 그래서 패턴은 '대문자 2개 바로 뒤에 숫자 3개'예요.\n\n**② 패턴은 양 끝이 묶이지 않아서, 앞뒤에 다른 글자가 붙어 있어도 안쪽에 'AB123' 모양만 있으면 통과해요.**\n\n줄별로 봐요. AB123은 ①, ② 모두 통과예요. XAB123은 앞에 X가 있어 ①은 탈락, ②는 통과예요. AB1234는 뒤에 4가 더 있어 ①은 탈락, ②는 통과예요. AB12(숫자 2개), A1234(대문자 1개), AB-123(가운데 '-')은 어디서도 그 모양을 못 만들어요.\n\n그래서 ①은 1건, ②는 3건이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- ①\nSELECT COUNT(*) FROM T                     -- ② 통과 건수: 1\n WHERE REGEXP_LIKE(CODE,\n       '^[A-Z]{2}[[:digit:]]{3}$');         -- ① 처음부터 끝까지 대문자 2 + 숫자 3: AB123만\n-- ②\nSELECT COUNT(*) FROM T                     -- ② 통과 건수: 3\n WHERE REGEXP_LIKE(CODE,\n       '[A-Z]{2}[[:digit:]]{3}');           -- ① 어딘가에 대문자 2 + 숫자 3: AB123, XAB123, AB1234" },
    { t: "[원본] → 행별 판정", tb: { c: ["CODE", "① 전체 일치", "② 부분 일치", "설명"], r: [["AB123", "O", "O", "정확히 대문자 2 + 숫자 3"], ["AB12", "X", "X", "숫자가 2개뿐"], ["XAB123", "X", "O", "AB123 부분이 맞음, 시작이 X"], ["AB1234", "X", "O", "AB123 부분이 맞음, 끝에 4가 더 있음"], ["A1234", "X", "X", "대문자가 1개뿐"], ["AB-123", "X", "X", "문자와 숫자 사이에 '-'"]], hl: [2, 3] } }
  ],
  res: { c: ["①", "②"], r: [[1, 3]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE REGEXP_LIKE(CODE, '^[A-Z]{2}[[:digit:]]{3}$')), (SELECT COUNT(*) FROM T WHERE REGEXP_LIKE(CODE, '[A-Z]{2}[[:digit:]]{3}'))",
  ox: [
    "이렇게 생각하면 틀려요: 'LIKE처럼 전체가 맞아야 한다'. REGEXP_LIKE는 일부만 맞아도 돼서 ②에서 XAB123, AB1234도 통과해요.",
    "정답이에요. 양 끝을 묶은 ①은 AB123 하나, 안 묶은 ②는 셋이에요.",
    "이렇게 생각하면 틀려요: ①의 ^와 $를 무시한 거예요. 양 끝이 묶이면 앞에 X나 뒤에 4가 붙은 값은 떨어져요.",
    "이렇게 생각하면 틀려요: 'AB-123도 안쪽에 맞는 부분이 있다'. '-' 때문에 대문자 2개 바로 뒤에 숫자 3개가 오는 곳이 없어요."
  ],
  trap: "LIKE는 문자열 전체가 맞아야 하지만(LIKE 'AB%'), REGEXP_LIKE는 일부만 맞아도 돼요. 전체를 맞추려면 ^ … $를 쓰세요.",
  memo: "REGEXP_LIKE = 일부만 맞아도 OK, 전체는 ^ … $"
},
{
  id: "S111", s: 2, tp: "regex", lv: 3, sub: "정규 표현식",
  th: "2과목 | 탐욕적(.*, .+) vs 게으른(.+?) 수량자와 {n,m}",
  q: "다음 SQL의 결과로 옳은 것은?",
  sql: "SELECT REGEXP_SUBSTR('<b>SQL</b><i>D</i>', '<.+>')  AS C1,\n       REGEXP_SUBSTR('<b>SQL</b><i>D</i>', '<.+?>') AS C2,\n       REGEXP_SUBSTR('aaaaa', 'a{2,3}')               AS C3\n  FROM DUAL;",
  o: [
    "C1 = <b>, C2 = <b>, C3 = aa",
    "C1 = <b>SQL</b>, C2 = <b>, C3 = aaa",
    "C1 = <b>SQL</b><i>D</i>, C2 = <b>SQL</b>, C3 = aaa",
    "C1 = <b>SQL</b><i>D</i>, C2 = <b>, C3 = aaa"
  ],
  a: 3,
  sum: "수량자는 기본적으로 최대한 길게 잡아서 C1은 끝까지, C3는 aaa예요. 뒤에 ?를 붙인 C2는 최대한 짧게 잡아 첫 '>'에서 멈춘 <b>예요.",
  why: "+, *, {n,m} 같은 반복 기호(수량자)는 기본적으로 욕심쟁이예요. 뒤 패턴이 맞을 수 있는 한 최대한 많이 반복해요(탐욕적, Greedy).\n\n'.'은 아무 글자 한 개예요. '<'와 '>'도 포함해요.\n\nC1의 '<.+>'는 첫 '<'에서 시작해 '.+'로 문자열 끝까지 먹어 버려요. 그다음 끝의 '>'를 맞추려고 한 글자씩 뒤로 물러나요. 결국 마지막 '>'에서 멈춰서 전체 <b>SQL</b><i>D</i>가 돼요.\n\n**수량자 뒤에 ?를 붙이면 반대로 최대한 적게 반복해요(게으른, Lazy).** 그래서 C2의 '<.+?>'는 처음 만나는 '>'에서 바로 멈춰 <b>예요.\n\nC3의 a{2,3}은 2~3번 반복인데 기본이 욕심쟁이라 3개를 가져가요. 그래서 aaa예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT REGEXP_SUBSTR('<b>SQL</b><i>D</i>', '<.+>')  AS C1,  -- ① 최대한 길게: 마지막 '>'까지 → <b>SQL</b><i>D</i>\n       REGEXP_SUBSTR('<b>SQL</b><i>D</i>', '<.+?>') AS C2,  -- ② 최대한 짧게: 첫 '>'에서 멈춤 → <b>\n       REGEXP_SUBSTR('aaaaa', 'a{2,3}')               AS C3   -- ③ 2~3번 중 최대 → aaa\n  FROM DUAL;" },
    { t: "1단계: 수량자별 매칭", tb: { c: ["식", "수량자", "동작", "결과"], r: [["'<.+>'", "+ (탐욕)", "마지막 '>'까지 최대한", "<b>SQL</b><i>D</i>"], ["'<.+?>'", "+? (게으름)", "첫 '>'에서 멈춤", "<b>"], ["'a{2,3}'", "{2,3} (탐욕)", "최대 3개", "aaa"]], hl: [0, 1] } },
    { t: "다른 방법: 태그 하나씩 뽑기", n: "SELECT REGEXP_SUBSTR('<b>SQL</b><i>D</i>', '<[^>]+>')    AS TAG1,  -- '>'가 아닌 글자만 허용: <b>\n       REGEXP_SUBSTR('<b>SQL</b><i>D</i>', '<.+?>', 1, 2) AS TAG2,  -- 두 번째로 맞는 것: </b>\n       REGEXP_SUBSTR('aaaaa', 'a{2,3}?')                 AS C3L    -- 짧게 잡는 {2,3}?: aa\n  FROM DUAL;" }
  ],
  res: { c: ["C1", "C2", "C3"], r: [["<b>SQL</b><i>D</i>", "<b>", "aaa"]] },
  pg: "SELECT REGEXP_SUBSTR('<b>SQL</b><i>D</i>', '<.+>'), REGEXP_SUBSTR('<b>SQL</b><i>D</i>', '<.+?>'), REGEXP_SUBSTR('aaaaa', 'a{2,3}')",
  ox: [
    "이렇게 생각하면 틀려요: '수량자는 기본적으로 짧게 잡는다'. 기본은 길게라서 C1은 끝까지, C3는 aaa예요.",
    "이렇게 생각하면 틀려요: '길게 잡아도 닫는 태그 </b>에서 멈춘다'. '.'은 '<', '>'도 먹어서 문자열의 마지막 '>'까지 가요.",
    "이렇게 생각하면 틀려요: '?를 붙여도 닫는 태그까지 간다'. +?는 처음 만나는 '>'에서 멈춰 <b>만 돌려줘요.",
    "정답이에요. 기본은 최대한 길게(C1, C3), ?를 붙이면 최대한 짧게(C2)예요."
  ],
  trap: "'.'은 아무 글자 한 개라서 '<'와 '>'도 포함해요. 그래서 '.+'는 태그를 넘어 끝까지 먹어요.",
  memo: "기본 = 최대한 길게, 뒤에 ? = 최대한 짧게"
},
{
  id: "S112", s: 2, tp: "dml", lv: 2, sub: "DML",
  th: "2과목 | 연관 서브쿼리 UPDATE — 짝이 없는 행은 NULL",
  q: "다음 UPDATE 문을 실행한 뒤 [EMP] 테이블의 상태로 옳은 것은?",
  tb: [
    { n: "EMP", c: ["EMPNO", "DEPTNO", "DNAME"], r: [[1, 10, "X"], [2, 20, "X"], [3, 40, "X"], [4, null, "X"]] },
    { n: "DEPT", c: ["DEPTNO", "DNAME"], r: [[10, "SALES"], [20, "HR"], [30, "IT"]] }
  ],
  sql: "UPDATE EMP E\n   SET E.DNAME = (SELECT D.DNAME\n                    FROM DEPT D\n                   WHERE D.DEPTNO = E.DEPTNO);",
  o: [
    "2행이 갱신되어 (1, SALES), (2, HR), (3, X), (4, X)가 된다.",
    "4행이 갱신되어 (1, SALES), (2, HR), (3, X), (4, X)가 된다.",
    "4행이 갱신되어 (1, SALES), (2, HR), (3, NULL), (4, NULL)이 된다.",
    "짝이 없는 행이 있어 오류가 발생하고 아무 행도 갱신되지 않는다."
  ],
  a: 2,
  sum: "WHERE가 없어서 4줄이 모두 바뀌어요. 짝이 없는 3, 4번은 서브쿼리가 아무것도 못 찾아서 원래 값 대신 NULL이 들어가요.",
  why: "UPDATE에서 '어느 줄을 바꿀지'는 WHERE가 정해요. SET은 그 줄들에 넣을 새 값을 계산할 뿐이에요.\n\n이 문장에는 WHERE가 없어요. 그래서 EMP 4줄이 모두 바꿀 대상이에요. 줄마다 SET의 서브쿼리를 한 번씩 실행해서 그 결과를 넣어요.\n\n서브쿼리가 아무것도 못 찾으면 오류가 아니라 NULL을 돌려줘요. **그래서 짝이 없는 줄은 원래 값(X)이 남는 게 아니라 NULL로 덮어써져요.**\n\n줄별로 봐요. 1번(10)은 SALES, 2번(20)은 HR이 들어가요. 3번(40)은 DEPT에 40번이 없어서 NULL이에요. 4번은 DEPTNO가 NULL이에요. NULL과 비교하면 결과가 '모름'이 되어 어떤 부서와도 짝이 안 돼요. 그래서 NULL이에요.\n\n결과는 4줄 갱신, (1, SALES), (2, HR), (3, NULL), (4, NULL)이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "UPDATE EMP E                                   -- ① 바꿀 테이블 EMP\n   SET E.DNAME = (SELECT D.DNAME\n                    FROM DEPT D\n                   WHERE D.DEPTNO = E.DEPTNO);  -- ③ 줄마다 실행: 1 → SALES, 2 → HR, 3 → 없음(NULL), 4 → 없음(NULL)\n-- ② WHERE가 없어요 → EMP 4줄 모두 바꿔요" },
    { t: "[원본] → 1단계: 행별 서브쿼리 결과", tb: { c: ["EMPNO", "DEPTNO", "서브쿼리", "새 DNAME"], r: [[1, 10, "SALES", "SALES"], [2, 20, "HR", "HR"], [3, 40, "0건", null], [4, null, "0건 (NULL = NULL은 UNKNOWN)", null]], hl: [2, 3] } },
    { t: "2단계: UPDATE 후 EMP", tb: { c: ["EMPNO", "DNAME"], r: [[1, "SALES"], [2, "HR"], [3, null], [4, null]], hl: [2, 3] } },
    { t: "의도대로 쓰려면: 짝이 있는 줄만 바꾸기", n: "UPDATE EMP E\n   SET E.DNAME = (SELECT D.DNAME FROM DEPT D\n                   WHERE D.DEPTNO = E.DEPTNO)\n WHERE EXISTS (SELECT 1 FROM DEPT D\n                WHERE D.DEPTNO = E.DEPTNO);   -- 2줄만 바뀌어요: (1, SALES), (2, HR), (3, X), (4, X)" }
  ],
  res: { c: ["EMPNO", "DNAME"], r: [[1, "SALES"], [2, "HR"], [3, null], [4, null]] },
  pg: "UPDATE EMP E SET DNAME = (SELECT D.DNAME FROM DEPT D WHERE D.DEPTNO = E.DEPTNO); SELECT EMPNO, DNAME FROM EMP ORDER BY EMPNO",
  ox: [
    "이렇게 생각하면 틀려요: WHERE EXISTS를 붙였을 때의 결과예요. 이 문장엔 WHERE가 없어서 4줄 모두 바뀌어요.",
    "이렇게 생각하면 틀려요: '짝이 없으면 원래 값이 남는다'. 바꿀 대상인 줄에는 서브쿼리 결과가 무조건 들어가고, 못 찾으면 그게 NULL이에요.",
    "정답이에요. 4줄 모두 바뀌고, 짝이 없는 3, 4번은 NULL이 돼요.",
    "이렇게 생각하면 틀려요: '못 찾으면 오류다'. SET의 서브쿼리는 못 찾으면 NULL이고, 2건 이상일 때만 오류(ORA-01427)예요."
  ],
  trap: "만약 DNAME에 NOT NULL 제약이 있었다면 NULL을 넣으려다 문장 전체가 실패해요(ORA-01407).",
  memo: "SET = (서브쿼리) + WHERE 없음 → 짝 없는 줄은 NULL"
},
{
  id: "S113", s: 2, tp: "dml", lv: 3, sub: "DML",
  th: "2과목 | 연관 서브쿼리 DELETE로 중복 제거와 NULL",
  q: "다음 DELETE 문을 실행한 뒤 [T]에 남는 ID는?",
  tb: [{ n: "T", c: ["ID", "EMAIL"], r: [[1, "a@x"], [2, "b@x"], [3, "a@x"], [4, null], [5, null], [6, "a@x"]] }],
  sql: "DELETE FROM T A\n WHERE EXISTS (SELECT 1\n                 FROM T B\n                WHERE B.EMAIL = A.EMAIL\n                  AND B.ID < A.ID);",
  o: ["1, 2, 4", "1, 2", "2, 4, 5, 6", "1, 2, 4, 5"],
  a: 3,
  sum: "'같은 이메일인데 나보다 ID가 작은 줄이 있으면 지운다'라서 이메일마다 가장 작은 ID만 남아요. NULL끼리는 같다고 보지 않아서 4, 5번은 둘 다 남아요.",
  why: "이 DELETE는 '나와 EMAIL이 같고 ID가 나보다 작은 줄이 있으면 나를 지운다'는 뜻이에요. 결국 EMAIL마다 가장 작은 ID 하나만 남아요.\n\n판정은 B.EMAIL = A.EMAIL 비교에 달려 있어요. = 비교에서 한쪽이라도 NULL이면 결과는 참도 거짓도 아닌 '모름'(UNKNOWN)이 돼요. 조건은 참일 때만 통과해요.\n\n**그래서 EMAIL이 NULL인 4, 5번은 서로를 '같은 이메일'로 찾지 못해서 지워지지 않아요.**\n\n줄별로 봐요. 1번(a@x)은 더 작은 ID가 없어서 남아요. 2번(b@x)은 같은 이메일이 없어서 남아요. 3번(a@x)은 1번이 있어서 지워져요. 6번(a@x)도 1번, 3번이 있어서 지워져요. 4번, 5번은 NULL이라 짝이 없어서 남아요.\n\n판정은 지우기 시작하기 전의 데이터로 해요. 그래서 지우는 도중에 줄이 사라져도 판정이 바뀌지 않아요.\n\n남는 ID는 1, 2, 4, 5예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "DELETE FROM T A                         -- ③ 조건이 참인 줄을 지워요: 3, 6\n WHERE EXISTS (SELECT 1\n                 FROM T B\n                WHERE B.EMAIL = A.EMAIL  -- ① 나와 같은 이메일인 줄 (NULL끼리는 '모름'이라 짝이 아니에요)\n                  AND B.ID < A.ID);      -- ② 그중 나보다 ID가 작은 줄이 있나요?" },
    { t: "[원본] → 1단계: 행별 EXISTS 판정", tb: { c: ["ID", "EMAIL", "같은 EMAIL + 더 작은 ID", "삭제"], r: [[1, "a@x", "없음", "X"], [2, "b@x", "없음", "X"], [3, "a@x", "1", "O"], [4, null, "NULL 비교 → 없음", "X"], [5, null, "NULL 비교 → 없음", "X"], [6, "a@x", "1, 3", "O"]], hl: [2, 5] } },
    { t: "2단계: 남은 행", tb: { c: ["ID", "EMAIL"], r: [[1, "a@x"], [2, "b@x"], [4, null], [5, null]] } },
    { t: "의도대로 쓰려면: NULL끼리도 중복으로 정리", n: "-- NULL끼리도 같은 값으로 보려면 NULL 비교를 따로 적어요\nDELETE FROM T A\n WHERE EXISTS (SELECT 1\n                 FROM T B\n                WHERE (B.EMAIL = A.EMAIL\n                       OR (B.EMAIL IS NULL AND A.EMAIL IS NULL))\n                  AND B.ID < A.ID);   -- 남는 ID: 1, 2, 4" }
  ],
  res: { c: ["ID"], r: [[1], [2], [4], [5]] },
  pg: "DELETE FROM T A WHERE EXISTS (SELECT 1 FROM T B WHERE B.EMAIL = A.EMAIL AND B.ID < A.ID); SELECT ID FROM T ORDER BY ID",
  ox: [
    "이렇게 생각하면 틀려요: 'NULL끼리는 같은 값이다'. GROUP BY에서는 NULL끼리 한 묶음이지만, = 비교에서는 NULL = NULL이 '모름'이라 5번이 안 지워져요.",
    "이렇게 생각하면 틀려요: '비교가 안 되는 NULL 줄은 지워진다'. 조건이 '모름'이면 삭제 대상이 아니라서 오히려 남아요.",
    "이렇게 생각하면 틀려요: 부등호를 거꾸로 읽은 거예요. B.ID < A.ID면 '나보다 작은 ID가 있는 나'를 지우니까 가장 작은 ID가 남아요.",
    "정답이에요. a@x는 1만 남고 3, 6이 지워지며, NULL인 4, 5는 짝이 없어 남아요."
  ],
  trap: "GROUP BY·DISTINCT에서는 NULL끼리 한 묶음이지만, = 조건에서는 NULL이 어떤 값과도 같지 않아요. 중복 제거 방법에 따라 NULL 처리가 달라져요.",
  memo: "EXISTS(같은 값 AND 더 작은 ID) 삭제 = 가장 작은 ID만 남김, NULL은 짝 없음"
},
{
  id: "S114", s: 2, tp: "dml", lv: 3, sub: "DML",
  th: "2과목 | MERGE의 UPDATE … DELETE WHERE와 조건부 INSERT (Oracle)",
  q: "다음 MERGE 문을 실행한 뒤 [TGT] 테이블의 내용으로 옳은 것은? (Oracle 기준)",
  tb: [
    { n: "TGT", c: ["ID", "QTY"], r: [[1, 10], [2, 5], [3, 0]] },
    { n: "SRC", c: ["ID", "QTY"], r: [[1, -10], [2, 3], [4, 7], [5, -2]] }
  ],
  sql: "MERGE INTO TGT T\nUSING SRC S\n   ON (T.ID = S.ID)\n WHEN MATCHED THEN\n      UPDATE SET T.QTY = T.QTY + S.QTY\n      DELETE WHERE T.QTY <= 0\n WHEN NOT MATCHED THEN\n      INSERT (ID, QTY) VALUES (S.ID, S.QTY)\n      WHERE S.QTY > 0;",
  o: [
    "(2, 8), (3, 0), (4, 7)",
    "(2, 8), (4, 7)",
    "(1, 0), (2, 8), (3, 0), (4, 7)",
    "(2, 8), (3, 0), (4, 7), (5, -2)"
  ],
  a: 0,
  sum: "DELETE WHERE는 이번에 UPDATE된 줄만, 바뀐 뒤 값으로 판단해요. 그래서 1번은 0이 되어 지워지고, 손대지 않은 3번(0)은 남아요. 5번은 −2라 INSERT 조건에 걸려 안 들어가요.",
  why: "MERGE는 SRC의 줄마다 ON 조건으로 TGT에서 짝을 찾아요. 짝이 있으면 WHEN MATCHED, 없으면 WHEN NOT MATCHED를 실행해요.\n\nOracle의 DELETE WHERE는 따로 떨어진 명령이 아니에요. UPDATE에 딸린 뒷정리예요. 그래서 이번 MERGE로 UPDATE된 줄만 대상이고, 조건은 UPDATE가 끝난 뒤의 값으로 봐요.\n\n**ID 1은 10 + (−10) = 0으로 바뀐 뒤 '0 <= 0'이 참이라 지워져요. 반면 ID 3은 QTY가 0이어도 SRC에 짝이 없어서 MERGE가 손대지 않았으니 그대로 남아요.**\n\nID 2는 5 + 3 = 8로 바뀌고, 8은 0 이하가 아니라 남아요.\n\nWHEN NOT MATCHED의 INSERT에도 WHERE를 붙일 수 있어요. ID 4(7)는 7 > 0이라 들어가요. ID 5(−2)는 조건이 거짓이라 안 들어가요.\n\n최종 TGT는 (2, 8), (3, 0), (4, 7)이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "MERGE INTO TGT T                           -- ① 바꿀 대상: TGT (1,10) (2,5) (3,0)\nUSING SRC S                                -- ② 읽을 원본: SRC 4줄\n   ON (T.ID = S.ID)                        -- ③ 짝 찾기: 1, 2는 짝 있음 / 4, 5는 없음 / TGT 3은 원본에 없어 상관없음\n WHEN MATCHED THEN\n      UPDATE SET T.QTY = T.QTY + S.QTY     -- ④ 1: 10 − 10 = 0, 2: 5 + 3 = 8\n      DELETE WHERE T.QTY <= 0              -- ⑤ ④에서 바뀐 줄 중 바뀐 값이 0 이하: ID 1 삭제\n WHEN NOT MATCHED THEN\n      INSERT (ID, QTY) VALUES (S.ID, S.QTY)\n      WHERE S.QTY > 0;                     -- ⑥ 4(7)만 넣어요, 5(−2)는 조건이 거짓" },
    { t: "[원본] → 1단계: SRC 행별 처리", tb: { c: ["SRC 행", "TGT 짝", "동작", "결과"], r: [["(1, −10)", "(1, 10)", "UPDATE → 0, DELETE WHERE 0 <= 0", "삭제"], ["(2, 3)", "(2, 5)", "UPDATE → 8, 8 <= 0 아님", "(2, 8)"], ["(4, 7)", "없음", "INSERT (7 > 0)", "(4, 7)"], ["(5, −2)", "없음", "INSERT 조건 −2 > 0 거짓", "삽입 안 함"]], hl: [0, 3] } },
    { t: "2단계: 영향 없는 행", tb: { c: ["TGT 행", "SRC 짝", "결과"], r: [["(3, 0)", "없음", "그대로 남음 (DELETE WHERE 대상 아님)"]], hl: [0] } },
    { t: "3단계: 최종 TGT", tb: { c: ["ID", "QTY"], r: [[2, 8], [3, 0], [4, 7]] }, n: "PostgreSQL MERGE에는 DELETE WHERE가 없어서, 검증은 'WHEN MATCHED AND T.QTY + S.QTY <= 0 THEN DELETE'로 같은 효과를 내요." }
  ],
  res: { c: ["ID", "QTY"], r: [[2, 8], [3, 0], [4, 7]] },
  pg: "MERGE INTO TGT T USING SRC S ON (T.ID = S.ID) WHEN MATCHED AND T.QTY + S.QTY <= 0 THEN DELETE WHEN MATCHED THEN UPDATE SET QTY = T.QTY + S.QTY WHEN NOT MATCHED AND S.QTY > 0 THEN INSERT (ID, QTY) VALUES (S.ID, S.QTY); SELECT ID, QTY FROM TGT ORDER BY ID",
  ox: [
    "정답이에요. 1번은 UPDATE 후 0이라 지워지고, 3번은 손대지 않아 남고, 5번은 INSERT 조건에서 걸러져요.",
    "이렇게 생각하면 틀려요: 'DELETE WHERE는 TGT 전체에 적용된다'. 이번에 UPDATE된 줄만 대상이라 (3, 0)은 남아요.",
    "이렇게 생각하면 틀려요: 'DELETE WHERE는 바뀌기 전 값(10)으로 판단한다'. 바뀐 뒤 값 0으로 판단해서 1번은 지워져요.",
    "이렇게 생각하면 틀려요: INSERT에 붙은 WHERE S.QTY > 0을 무시한 거예요. −2는 0보다 크지 않아서 안 들어가요."
  ],
  trap: "DELETE WHERE는 혼자 쓰는 WHEN 절이 아니라 WHEN MATCHED … UPDATE에 딸린 절이에요. UPDATE 없이 DELETE WHERE만 쓸 수 없어요.",
  memo: "DELETE WHERE = UPDATE된 줄만, 바뀐 뒤 값으로 판단"
},
{
  id: "S115", s: 2, tp: "dml", lv: 2, sub: "DML",
  th: "2과목 | UNIQUE의 다중 NULL과 CHECK 제약의 NULL 통과",
  q: "다음 테이블에 ①~④의 INSERT를 차례로 실행할 때 오류가 발생하는 것은? (Oracle 기준)",
  sql: "CREATE TABLE M (\n  ID    NUMBER PRIMARY KEY,\n  EMAIL VARCHAR2(30) UNIQUE,\n  AGE   NUMBER CHECK (AGE >= 0)\n);\n\n① INSERT INTO M VALUES (1, NULL, 20);\n② INSERT INTO M VALUES (2, NULL, NULL);\n③ INSERT INTO M VALUES (3, 'a@x', -1);\n④ INSERT INTO M VALUES (4, 'a@x', NULL);",
  o: ["①", "②", "③", "④"],
  a: 2,
  sum: "UNIQUE는 NULL끼리 같다고 보지 않고, CHECK는 '확실히 거짓'일 때만 막아요. 그래서 AGE가 −1인 ③만 실패해요.",
  why: "제약조건은 '확실히 규칙을 어긴 값'만 막도록 만들어져 있어요.\n\nUNIQUE는 값이 같은지 비교해야 해요. 그런데 NULL은 '모르는 값'이라 다른 NULL과 같다고 단정할 수 없어요. 그래서 NULL은 중복 검사에서 빼요. EMAIL이 NULL인 줄은 여러 개 넣을 수 있어요.\n\nCHECK는 조건이 거짓일 때만 막아요. NULL과 비교하면 결과가 '모름'이 되는데, 이때는 통과시켜요.\n\n문장별로 봐요. ①은 EMAIL NULL, AGE 20이라 성공이에요. ②는 EMAIL이 또 NULL이지만 중복으로 안 보고, AGE NULL은 '모름'이라 통과해요. 성공이에요.\n\n**③은 AGE가 −1이라 '−1 >= 0'이 확실히 거짓이에요. 그래서 ORA-02290으로 실패해요.**\n\n실패한 문장은 그 문장만 취소돼요. 그래서 'a@x'는 테이블에 없어요. ④의 'a@x'는 처음 들어가는 값이고, AGE NULL은 통과라서 성공이에요.",
  st: [
    { t: "문장 순서대로 상태 따라가기", n: "CREATE TABLE M (ID    NUMBER PRIMARY KEY,\n                EMAIL VARCHAR2(30) UNIQUE,\n                AGE   NUMBER CHECK (AGE >= 0));  -- 빈 테이블\nINSERT INTO M VALUES (1, NULL, 20);     -- 성공 → M: (1, NULL, 20)\nINSERT INTO M VALUES (2, NULL, NULL);   -- 성공: NULL끼리는 중복 아님, AGE NULL은 '모름'이라 통과\n                                        --       M: (1, NULL, 20), (2, NULL, NULL)\nINSERT INTO M VALUES (3, 'a@x', -1);    -- 실패 ORA-02290: −1 >= 0은 거짓 → 이 문장만 취소, M 그대로\nINSERT INTO M VALUES (4, 'a@x', NULL);  -- 성공: 'a@x'는 아직 없음, AGE NULL 통과\n                                        --       M: (1, NULL, 20), (2, NULL, NULL), (4, 'a@x', NULL)" },
    { t: "문장별 판정", tb: { c: ["문장", "EMAIL UNIQUE", "AGE >= 0", "결과"], r: [["①", "NULL → 검사 안 함", "20 → TRUE", "성공"], ["②", "NULL → 중복이어도 허용", "NULL → UNKNOWN(통과)", "성공"], ["③", "'a@x' 처음", "−1 → FALSE", "실패 (ORA-02290)"], ["④", "'a@x' 처음 (③ 실패)", "NULL → UNKNOWN(통과)", "성공"]], hl: [2] } }
  ],
  pgSetup: "CREATE TABLE M (ID numeric PRIMARY KEY, EMAIL text UNIQUE, AGE numeric CHECK (AGE >= 0)); CREATE TABLE R (NO numeric, RESULT text);",
  res: { c: ["문장", "결과"], r: [[1, "OK"], [2, "OK"], [3, "FAIL"], [4, "OK"]] },
  pg: "DO $$ BEGIN INSERT INTO M VALUES (1, NULL, 20); INSERT INTO R VALUES (1, 'OK'); EXCEPTION WHEN OTHERS THEN INSERT INTO R VALUES (1, 'FAIL'); END $$; DO $$ BEGIN INSERT INTO M VALUES (2, NULL, NULL); INSERT INTO R VALUES (2, 'OK'); EXCEPTION WHEN OTHERS THEN INSERT INTO R VALUES (2, 'FAIL'); END $$; DO $$ BEGIN INSERT INTO M VALUES (3, 'a@x', -1); INSERT INTO R VALUES (3, 'OK'); EXCEPTION WHEN OTHERS THEN INSERT INTO R VALUES (3, 'FAIL'); END $$; DO $$ BEGIN INSERT INTO M VALUES (4, 'a@x', NULL); INSERT INTO R VALUES (4, 'OK'); EXCEPTION WHEN OTHERS THEN INSERT INTO R VALUES (4, 'FAIL'); END $$; SELECT NO, RESULT FROM R ORDER BY NO",
  ox: [
    "이렇게 생각하면 틀려요: 'UNIQUE 컬럼엔 NULL을 못 넣는다'. UNIQUE는 NOT NULL이 아니고, NULL은 중복 검사에서 빠져요.",
    "이렇게 생각하면 틀려요: 'NULL이 두 번이면 중복이다', 'AGE NULL은 CHECK에 걸린다'. UNIQUE는 NULL끼리 같다고 안 보고, CHECK는 '모름'을 통과시켜요.",
    "정답이에요. −1 >= 0은 확실히 거짓이라 CHECK 위반이에요.",
    "이렇게 생각하면 틀려요: '③에서 a@x가 이미 들어갔다'. ③은 실패해서 취소됐으니 a@x는 처음이고, AGE NULL도 통과예요."
  ],
  trap: "WHERE는 참인 줄만 통과시키지만, CHECK는 거짓인 값만 막아요. 같은 '모름'이 정반대로 처리돼요.",
  memo: "WHERE: 참만 통과 / CHECK: 거짓만 막음 / UNIQUE: NULL 여러 개 OK"
},
{
  id: "S116", s: 2, tp: "tcl", lv: 3, sub: "TCL",
  th: "2과목 | 같은 이름의 SAVEPOINT 재정의와 반복 ROLLBACK TO",
  q: "빈 테이블 [T]에 대해 다음 SQL을 순서대로 실행한 뒤 남아 있는 ID 값으로 옳은 것은? (Oracle 기준)",
  sql: "INSERT INTO T VALUES (1);\nSAVEPOINT SP;\nINSERT INTO T VALUES (2);\nSAVEPOINT SP;\nINSERT INTO T VALUES (3);\nROLLBACK TO SP;\nINSERT INTO T VALUES (4);\nROLLBACK TO SP;\nCOMMIT;",
  o: ["1", "1, 2, 4", "1, 2", "1, 4"],
  a: 2,
  sum: "같은 이름으로 SAVEPOINT를 다시 만들면 표시가 '2 다음'으로 옮겨져요. ROLLBACK TO는 표시를 지우지 않아서 두 번 다 3과 4를 취소하고, 1, 2가 남아요.",
  why: "SAVEPOINT는 트랜잭션 중간에 꽂아 두는 책갈피예요. ROLLBACK TO는 그 책갈피 뒤의 작업만 취소해요.\n\nOracle에서 이미 있는 이름으로 SAVEPOINT를 다시 만들면, 앞의 같은 이름 책갈피는 지워지고 새 위치로 옮겨져요. 그래서 두 번째 SAVEPOINT SP 뒤부터 SP는 'INSERT 2 다음'을 가리켜요.\n\n**ROLLBACK TO SP는 SP 뒤의 작업과 SP 뒤에 꽂은 책갈피만 없애고, SP 자신은 남겨 둬요.** 그래서 같은 SP로 몇 번이든 다시 돌아갈 수 있어요.\n\n순서대로 봐요. 1, 2를 넣고 SP를 2 다음에 꽂아요. 3을 넣고 ROLLBACK TO SP를 하면 3이 취소돼요. 4를 넣고 다시 ROLLBACK TO SP를 하면 4가 취소돼요.\n\nCOMMIT 때 남아 있는 1, 2가 확정돼요.",
  st: [
    { t: "문장 순서대로 상태 따라가기", n: "INSERT INTO T VALUES (1);   -- T = {1}\nSAVEPOINT SP;               -- SP = 1 다음\nINSERT INTO T VALUES (2);   -- T = {1, 2}\nSAVEPOINT SP;               -- 같은 이름으로 다시: 앞의 SP는 지워지고 SP = 2 다음\nINSERT INTO T VALUES (3);   -- T = {1, 2, 3}\nROLLBACK TO SP;             -- 3 취소 → T = {1, 2}, SP는 그대로 남아요\nINSERT INTO T VALUES (4);   -- T = {1, 2, 4}\nROLLBACK TO SP;             -- 4 취소 → T = {1, 2}\nCOMMIT;                     -- {1, 2} 확정, 책갈피는 모두 사라져요" },
    { t: "단계별 상태", tb: { c: ["명령", "T 상태", "SP 위치"], r: [["INSERT 1", "{1}", "—"], ["SAVEPOINT SP", "{1}", "1 다음"], ["INSERT 2", "{1, 2}", "1 다음"], ["SAVEPOINT SP (재정의)", "{1, 2}", "2 다음 (앞의 SP 삭제)"], ["INSERT 3", "{1, 2, 3}", "2 다음"], ["ROLLBACK TO SP", "{1, 2}", "2 다음 (유지)"], ["INSERT 4", "{1, 2, 4}", "2 다음"], ["ROLLBACK TO SP", "{1, 2}", "2 다음"], ["COMMIT", "{1, 2} 확정", "모두 해제"]], hl: [3, 7] } }
  ],
  pgSetup: "CREATE TABLE T (ID numeric);",
  res: { c: ["ID"], r: [[1], [2]] },
  pg: "BEGIN; INSERT INTO T VALUES (1); SAVEPOINT SP; INSERT INTO T VALUES (2); SAVEPOINT SP; INSERT INTO T VALUES (3); ROLLBACK TO SP; INSERT INTO T VALUES (4); ROLLBACK TO SP; COMMIT; SELECT ID FROM T ORDER BY ID",
  ox: [
    "이렇게 생각하면 틀려요: '첫 번째 SP(1 다음)로 돌아간다'. 같은 이름으로 다시 만들면 표시가 2 다음으로 옮겨져요.",
    "이렇게 생각하면 틀려요: 'ROLLBACK TO를 하면 SP가 사라져서 두 번째는 효과가 없다'. SP 자신은 남아서 4도 취소돼요.",
    "정답이에요. SP는 2 다음을 가리키고, 두 번의 ROLLBACK TO가 3과 4를 각각 취소해요.",
    "이렇게 생각하면 틀려요: 두 번의 취소를 섞어 계산한 거예요. 2는 SP 앞이라 남고, 4는 두 번째 ROLLBACK TO로 취소돼요."
  ],
  trap: "ROLLBACK TO SP를 하면 SP '뒤에' 만든 책갈피만 사라지고 SP 자신은 남아요. (PostgreSQL은 같은 이름의 앞 책갈피를 지우지 않지만, ROLLBACK TO가 가장 최근 것을 쓰니까 이 문제의 결과는 같아요.)",
  memo: "같은 이름 SAVEPOINT = 최근 위치로 덮어쓰기, ROLLBACK TO 뒤에도 SP 유지"
},
{
  id: "S117", s: 2, tp: "tcl", lv: 2, sub: "TCL",
  th: "2과목 | 커밋 전 데이터의 가시성 · 잠금 · AUTO COMMIT",
  q: "Oracle에서 세션 A가 다음 문장을 실행하고 아직 COMMIT하지 않았다. 이에 대한 설명으로 가장 적절하지 않은 것은?",
  sql: "-- 세션 A\nUPDATE EMP SET SAL = 9999 WHERE EMPNO = 100;   -- 원래 SAL = 3000",
  o: [
    "세션 B가 EMPNO 100을 SELECT하면 변경 전 값 3000을 읽으며, 세션 A의 잠금 때문에 대기하지 않는다.",
    "세션 B가 EMPNO 100을 UPDATE하려 하면 세션 A가 COMMIT 또는 ROLLBACK할 때까지 대기한다.",
    "SQL Server는 기본 설정이 AUTO COMMIT 모드라서, 같은 UPDATE를 명시적 트랜잭션 없이 실행하면 문장이 끝나는 즉시 커밋된다.",
    "세션 A는 COMMIT하기 전에는 자신이 바꾼 9999를 조회할 수 없고 3000을 본다."
  ],
  a: 3,
  sum: "커밋 전 변경은 '남'만 못 보고, 바꾼 본인은 볼 수 있어요. 그래서 '세션 A도 9999를 못 본다'는 ④가 틀렸어요.",
  why: "트랜잭션에서 바꾼 내용은 COMMIT 전까지 '확정 안 된' 상태예요.\n\n바꾼 본인(세션 A)은 자기가 고친 내용을 그대로 읽어요. 그래서 커밋 전에도 9999가 보여요.\n\n다른 세션(B)이 같은 줄을 읽으면 Oracle은 따로 보관해 둔 '바꾸기 전 모습'(언두, Undo)으로 마지막 확정 값 3000을 만들어 보여 줘요. 이를 읽기 일관성이라고 해요. 그래서 읽기는 잠금 때문에 기다리지 않아요.\n\n하지만 같은 줄을 바꾸려는 다른 세션은 기다려야 해요. A가 그 줄에 잠금을 걸어 두었기 때문이에요. A가 COMMIT이나 ROLLBACK을 해야 풀려요.\n\nSQL Server는 기본이 자동 커밋(AUTO COMMIT)이에요. 따로 트랜잭션을 열지 않고 UPDATE하면 문장이 끝나자마자 확정돼요.\n\n**'커밋 전 데이터는 아무도 못 본다'는 틀린 말이에요. 정확히는 '다른 세션만 못 본다'예요.** 그래서 ④가 적절하지 않아요.",
  st: [
    { t: "세션별로 시간 순서 따라가기", n: "-- 세션 A\nUPDATE EMP SET SAL = 9999 WHERE EMPNO = 100;   -- 줄 잠금, 바꾸기 전 값 3000은 언두에 보관\n-- 세션 A\nSELECT SAL FROM EMP WHERE EMPNO = 100;         -- 9999 (내가 바꾼 건 보여요)\n-- 세션 B\nSELECT SAL FROM EMP WHERE EMPNO = 100;         -- 3000 (확정된 값을 읽어요, 기다리지 않아요)\n-- 세션 B\nUPDATE EMP SET SAL = 1 WHERE EMPNO = 100;      -- 기다려요 (A의 잠금)\n-- 세션 A\nCOMMIT;                                        -- 9999 확정, 잠금 풀림 → B의 UPDATE가 이어서 실행돼요" },
    { t: "COMMIT 전 상황 정리", tb: { c: ["주체", "행동", "결과"], r: [["세션 B", "SELECT", "3000 (대기 없음, 읽기 일관성)"], ["세션 B", "같은 행 UPDATE", "대기 (행 잠금)"], ["SQL Server", "기본 AUTO COMMIT", "문장마다 자동 커밋"], ["세션 A", "SELECT", "9999 (자기 변경은 보임)"]], hl: [3] } }
  ],
  ox: [
    "옳아요. Oracle은 언두로 확정된 값 3000을 보여 줘서, 읽기는 잠금을 기다리지 않아요.",
    "옳아요. 같은 줄을 바꾸려면 A의 잠금이 COMMIT이나 ROLLBACK으로 풀릴 때까지 기다려요.",
    "옳아요. SQL Server는 기본이 자동 커밋이에요. BEGIN TRANSACTION으로 직접 열거나 IMPLICIT_TRANSACTIONS를 켜야 손으로 커밋해요. Oracle은 DML을 자동 커밋하지 않아요.",
    "틀린 설명이라 정답이에요. 이렇게 생각하면 틀려요: '커밋 전엔 나도 못 본다'. 자기 트랜잭션 안에서는 커밋 안 한 9999도 보여요."
  ],
  trap: "'커밋 전 데이터는 아무도 못 본다'로 외우면 틀려요. 정확히는 '다른 세션은 못 본다'예요.",
  memo: "커밋 전 변경: 나 = 보임 / 남 = 안 보임(이전 값), 같은 줄 변경은 기다림"
},
{
  id: "S118", s: 2, tp: "ddl", lv: 2, sub: "DDL",
  th: "2과목 | CTAS(CREATE TABLE … AS SELECT)가 복사하는 제약조건",
  q: "Oracle에서 다음과 같이 T2를 만들었을 때, T2에 대한 설명으로 옳은 것은?",
  sql: "CREATE TABLE T1 (\n  ID     NUMBER PRIMARY KEY,\n  NAME   VARCHAR2(20) NOT NULL,\n  AGE    NUMBER CHECK (AGE >= 0),\n  REG_DT DATE DEFAULT SYSDATE\n);\n\nCREATE TABLE T2 AS SELECT * FROM T1;",
  o: [
    "T2.ID에도 PRIMARY KEY가 생성되어 같은 ID를 두 번 넣을 수 없다.",
    "T2.NAME에는 NOT NULL 제약이 복사되어 NULL을 넣을 수 없다.",
    "T2.AGE에 −1을 넣으면 CHECK 제약 위반 오류가 발생한다.",
    "T2에 REG_DT를 생략하고 INSERT하면 기본값으로 SYSDATE가 들어간다."
  ],
  a: 1,
  sum: "CTAS는 SELECT 결과(컬럼, 타입, 데이터)만 복사하고, 제약 중에는 직접 적은 NOT NULL만 따라와요. 그래서 NAME의 NOT NULL만 T2에 남아요.",
  why: "CTAS(CREATE TABLE … AS SELECT)는 SELECT 결과로 새 테이블을 만들어요.\n\nSELECT 결과에는 컬럼 이름, 데이터 타입, 값만 들어 있어요. 원본 테이블에 걸려 있던 규칙은 들어 있지 않아요. 그래서 PRIMARY KEY, UNIQUE, CHECK, FOREIGN KEY, DEFAULT 값은 복사되지 않아요.\n\n예외는 컬럼에 직접 적은 NOT NULL이에요. 이것만 새 테이블에 따라와요.\n\n**PRIMARY KEY가 몰래 갖고 있던 NOT NULL은 PK와 함께 사라져요. 그래서 T2.ID에는 같은 값도, NULL도 들어갈 수 있어요.**\n\n컬럼별로 봐요. ID는 PK가 없어져요. NAME은 NOT NULL이 남아요. AGE는 CHECK가 없어져서 −1도 들어가요. REG_DT는 DEFAULT가 없어져서 빼고 넣으면 NULL이에요.\n\n그래서 옳은 설명은 ②예요.",
  st: [
    { t: "문장 순서대로 상태 따라가기", n: "CREATE TABLE T2 AS SELECT * FROM T1;                     -- 컬럼, 타입, 데이터 + NAME의 NOT NULL만 복사\nINSERT INTO T2 (ID, NAME) VALUES (1, 'A');               -- 성공, REG_DT = NULL (DEFAULT 없음)\nINSERT INTO T2 (ID, NAME) VALUES (1, 'B');               -- 성공: PK가 없어 ID가 겹쳐도 돼요\nINSERT INTO T2 (ID, NAME, AGE) VALUES (NULL, 'C', -1);   -- 성공: ID NULL, AGE −1도 들어가요\nINSERT INTO T2 (ID, NAME) VALUES (2, NULL);              -- 실패 ORA-01400: NAME의 NOT NULL은 복사됐어요" },
    { t: "CTAS 복사 여부", tb: { c: ["항목", "T1", "T2"], r: [["컬럼명·타입·데이터", "있음", "복사"], ["NAME NOT NULL (명시)", "있음", "복사"], ["ID PRIMARY KEY", "있음", "복사 안 됨 (암묵적 NOT NULL 포함)"], ["AGE CHECK", "있음", "복사 안 됨"], ["REG_DT DEFAULT", "있음", "복사 안 됨"]], hl: [1] } },
    { t: "의도대로 쓰려면: 빠진 규칙을 직접 추가", n: "-- CTAS 뒤에 필요한 제약과 기본값을 다시 걸어요 (데이터가 규칙에 맞아야 성공해요)\nALTER TABLE T2 ADD CONSTRAINT T2_PK PRIMARY KEY (ID);\nALTER TABLE T2 ADD CONSTRAINT T2_AGE_CK CHECK (AGE >= 0);\nALTER TABLE T2 MODIFY (REG_DT DEFAULT SYSDATE);" }
  ],
  ox: [
    "이렇게 생각하면 틀려요: 'CTAS는 PK도 복사한다'. PK는 복사되지 않아요. 필요하면 ALTER TABLE T2 ADD PRIMARY KEY (ID)로 따로 만들어요.",
    "정답이에요. 직접 적은 NOT NULL은 CTAS에서 유일하게 따라오는 제약이에요.",
    "이렇게 생각하면 틀려요: 'CHECK도 복사된다'. CTAS는 NOT NULL 말고는 제약을 복사하지 않아서 −1도 들어가요.",
    "이렇게 생각하면 틀려요: 'DEFAULT도 컬럼 정의라 복사된다'. DEFAULT는 복사되지 않아서 REG_DT를 빼면 NULL이 들어가요."
  ],
  trap: "구조만 복사하려면 CREATE TABLE T2 AS SELECT * FROM T1 WHERE 1 = 2처럼 늘 거짓인 조건을 줘요. 이때도 제약 복사 규칙은 같아요.",
  memo: "CTAS = 구조 + 데이터 + (직접 적은) NOT NULL만"
},
{
  id: "S119", s: 2, tp: "ddl", lv: 2, sub: "DCL",
  th: "2과목 | ROLE · PUBLIC · WITH ADMIN OPTION",
  q: "Oracle의 DCL(Data Control Language, 데이터 제어어)에 대한 설명으로 가장 적절하지 않은 것은?",
  o: [
    "ROLE은 여러 권한을 하나로 묶은 이름이며, 사용자에게 ROLE을 부여하면 그 안의 권한을 한꺼번에 받는다.",
    "GRANT SELECT ON A.EMP TO PUBLIC을 실행하면 데이터베이스의 모든 사용자가 A.EMP를 조회할 수 있다.",
    "ROLE에도 다른 ROLE을 부여할 수 있으며, CONNECT·RESOURCE는 Oracle이 미리 만들어 둔 ROLE이다.",
    "DBA가 B에게 CREATE TABLE 권한을 WITH ADMIN OPTION으로 주고 B가 다시 C에게 주었을 때, DBA가 B의 권한을 REVOKE하면 C의 권한도 함께 회수된다."
  ],
  a: 3,
  sum: "시스템 권한을 WITH ADMIN OPTION으로 나눠 줬다면, 중간 사람(B)의 권한을 회수해도 C의 권한은 그대로 남아요. 그래서 '함께 회수된다'는 ④가 틀렸어요.",
  why: "Oracle 권한은 두 가지예요. 시스템 권한은 'CREATE TABLE'처럼 어떤 작업을 할 수 있는 권한이에요. 객체 권한은 'A.EMP를 SELECT'처럼 특정 테이블 같은 대상에 대한 권한이에요.\n\n남에게 다시 줄 수 있게 하는 옵션도 달라요. 시스템 권한은 WITH ADMIN OPTION, 객체 권한은 WITH GRANT OPTION이에요.\n\n객체 권한은 '누가 누구에게 줬는지'를 기록해요. 그래서 중간 사람의 권한을 회수하면 그가 나눠 준 권한도 줄줄이 회수돼요.\n\n**반면 시스템 권한은 누가 줬는지 따라가지 않아요. 그래서 B의 CREATE TABLE을 회수해도 B가 C에게 준 CREATE TABLE은 그대로 남아요.** 그래서 ④가 적절하지 않아요.\n\n나머지 보기도 확인해요. ROLE은 권한을 묶어 둔 꾸러미라서 ROLE 안에 다른 ROLE을 넣을 수 있어요. CONNECT, RESOURCE는 Oracle이 미리 만들어 둔 ROLE이에요. PUBLIC은 모든 사용자를 뜻해요.",
  st: [
    { t: "문장 순서대로 상태 따라가기", n: "-- DBA\nGRANT CREATE TABLE TO B WITH ADMIN OPTION;   -- B: CREATE TABLE 있음 + 남에게 줄 수 있음\n-- B\nGRANT CREATE TABLE TO C;                      -- C: CREATE TABLE 있음\n-- DBA\nREVOKE CREATE TABLE FROM B;                   -- B: 회수 / C: 그대로 있음 (줄줄이 회수 없음)\n\n-- 비교: 객체 권한은 줄줄이 회수돼요\n-- A (EMP 주인)\nGRANT SELECT ON EMP TO B WITH GRANT OPTION;   -- B: SELECT 있음 + 남에게 줄 수 있음\n-- B\nGRANT SELECT ON A.EMP TO C;                   -- C: SELECT 있음 (B가 줬다고 기록돼요)\n-- A\nREVOKE SELECT ON EMP FROM B;                  -- B 회수 → C도 함께 회수\n\n-- ROLE과 PUBLIC\nCREATE ROLE R_APP;\nGRANT CREATE SESSION, CREATE TABLE TO R_APP;  -- 권한 꾸러미\nGRANT R_APP TO C;                             -- C가 꾸러미 전체를 받아요\nGRANT SELECT ON A.EMP TO PUBLIC;              -- 모든 사용자가 조회할 수 있어요" },
    { t: "옵션 비교", tb: { c: ["구분", "대상 권한", "다시 부여", "중간 사용자 REVOKE 시"], r: [["WITH ADMIN OPTION", "시스템 권한, ROLE", "가능", "하위 사용자 권한 유지"], ["WITH GRANT OPTION", "객체 권한", "가능", "하위 사용자 권한 연쇄 회수"]], hl: [0] } }
  ],
  ox: [
    "옳아요. ROLE은 권한을 묶어서 한 번에 주고받게 해 줘서 관리가 쉬워져요.",
    "옳아요. PUBLIC은 특정 사람이 아니라 모든 사용자를 뜻해요.",
    "옳아요. ROLE 안에 ROLE을 넣을 수 있고, CONNECT·RESOURCE·DBA는 Oracle이 미리 만든 ROLE이에요.",
    "틀린 설명이라 정답이에요. 이렇게 생각하면 틀려요: '객체 권한처럼 줄줄이 회수된다'. ADMIN OPTION으로 나눠 준 시스템 권한은 남아요."
  ],
  trap: "ADMIN(시스템 권한) = 줄줄이 회수 없음, GRANT(객체 권한) = 줄줄이 회수. 이름이 비슷해서 거꾸로 외우기 쉬워요.",
  memo: "ROLE = 권한 꾸러미 / PUBLIC = 모든 사용자 / ADMIN OPTION은 줄줄이 회수 없음"
},
{
  id: "S120", s: 2, tp: "ddl", lv: 3, sub: "DCL",
  th: "2과목 | 다른 스키마 테이블 접근에 필요한 권한과 이름",
  q: "Oracle에서 사용자 B는 CREATE SESSION 권한만 가지고 있고 B 소유의 EMP 테이블은 없다. A가 다음 명령을 실행한 뒤, B가 실행해 성공하는 문장은? (동의어(Synonym)는 없다.)",
  sql: "-- A 계정 (EMP 테이블 소유자)\nGRANT SELECT ON EMP TO B;\n\n-- B 계정\n① SELECT * FROM A.EMP;\n② SELECT * FROM EMP;\n③ UPDATE A.EMP SET SAL = 0;\n④ GRANT SELECT ON A.EMP TO C;",
  o: ["①", "②", "③", "④"],
  a: 0,
  sum: "남의 테이블은 'A.EMP'처럼 주인 이름을 붙여야 찾을 수 있고, 받은 SELECT 권한으로는 조회만 할 수 있어요. 그래서 ①만 성공해요.",
  why: "Oracle에서 테이블 이름은 주인(스키마)별로 따로 있어요. 주인 이름 없이 EMP라고 쓰면 내 스키마(B.EMP)에서 먼저 찾고, 없으면 PUBLIC 동의어(공용 별명)를 찾아요.\n\n권한은 '찾은 테이블을 써도 되나?'를 보는 별도 단계예요. 권한이 있다고 이름을 대신 찾아 주지는 않아요.\n\n**그래서 B는 SELECT 권한이 있어도 A.EMP처럼 주인 이름을 붙여야 해요. EMP만 쓰면 동의어가 없으니 ORA-00942(테이블이 없음)가 나요.**\n\n객체 권한은 작업별로 따로 줘요. SELECT만 받은 B가 UPDATE하면 ORA-01031(권한 부족)이에요.\n\nWITH GRANT OPTION 없이 받은 권한은 남에게 다시 줄 수 없어요. 그래서 ④도 실패해요.\n\n성공하는 건 ①뿐이에요.",
  st: [
    { t: "문장 순서대로 상태 따라가기", n: "-- A 계정 (EMP 주인)\nGRANT SELECT ON EMP TO B;            -- B: A.EMP에 대한 SELECT만 있어요\n-- B 계정\nSELECT * FROM A.EMP;                 -- ① 성공: 주인 이름 + SELECT 권한\nSELECT * FROM EMP;                   -- ② ORA-00942: B.EMP도, 동의어도 없어요\nUPDATE A.EMP SET SAL = 0;            -- ③ ORA-01031: UPDATE 권한이 없어요\nGRANT SELECT ON A.EMP TO C;          -- ④ ORA-01031: WITH GRANT OPTION 없이 받았어요" },
    { t: "문장별 결과", tb: { c: ["문장", "필요 조건", "B의 상태", "결과"], r: [["① SELECT A.EMP", "SELECT 권한", "있음", "성공"], ["② SELECT EMP", "B.EMP 또는 동의어", "없음", "ORA-00942"], ["③ UPDATE A.EMP", "UPDATE 권한", "없음", "ORA-01031"], ["④ GRANT … TO C", "WITH GRANT OPTION", "없음", "ORA-01031"]], hl: [0] } },
    { t: "의도대로 쓰려면: 이름만으로 쓰기 · 더 많은 권한", n: "-- B가 EMP라고만 쓰고 싶다면 동의어를 만들어요 (B에게 CREATE SYNONYM 권한이 있어야 해요)\nCREATE SYNONYM EMP FOR A.EMP;        -- B 스키마의 EMP → A.EMP\nSELECT * FROM EMP;                   -- 성공\n-- A 계정: 수정과 다시 주기까지 허용하려면\nGRANT UPDATE ON EMP TO B;\nGRANT SELECT ON EMP TO B WITH GRANT OPTION;" }
  ],
  ox: [
    "정답이에요. 주인 이름을 붙였고 SELECT 권한도 있어요.",
    "이렇게 생각하면 틀려요: '권한이 있으면 이름만으로 찾아진다'. 주인 이름을 빼면 B 자신의 EMP를 찾는데, 동의어도 없어서 ORA-00942가 나요.",
    "이렇게 생각하면 틀려요: 'SELECT 권한이 있으면 테이블을 다 쓸 수 있다'. 객체 권한은 SELECT, UPDATE처럼 작업별로 따로 받아야 해요.",
    "이렇게 생각하면 틀려요: '받은 권한은 남에게 줄 수 있다'. WITH GRANT OPTION 없이 받은 권한은 다시 줄 수 없어요(ORA-01031)."
  ],
  trap: "권한(GRANT)과 이름 찾기(스키마·동의어)는 별개예요. 권한이 있어도 'A.'를 빼면 오류가 나요.",
  memo: "남의 테이블 = 주인.테이블 + 해당 작업 권한"
}
);
