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
  why: "스칼라 서브쿼리(SELECT 절에 쓴, 한 행 한 컬럼을 돌려주는 서브쿼리)는 결과가 0건이면 오류 없이 NULL을 돌려준다. 단, 서브쿼리 안이 GROUP BY 없는 집계 함수이면 대상 행이 없어도 집계 결과 '한 행'이 만들어진다. 이때 COUNT(*)는 0, SUM은 NULL이다. 바깥 쿼리는 DEPT 기준이므로 사원이 없는 30번 부서도 그대로 출력된다.",
  st: [
    { t: "[원본] 부서별 사원", tb: { c: ["DEPTNO", "해당 사원", "SAL > 300인 사원"], r: [[10, "A(400), B(200)", "A"], [20, "C(300)", "없음"], [30, "없음", "없음"]], hl: [1, 2] } },
    { t: "1단계: 서브쿼리별 반환값", tb: { c: ["DEPTNO", "COUNT(*) 서브쿼리", "SUM 서브쿼리", "ENAME 서브쿼리"], r: [[10, "1행: 2", "1행: 600", "1행: A"], [20, "1행: 1", "1행: 300", "0행 → NULL"], [30, "1행: 0", "1행: NULL", "0행 → NULL"]], hl: [1, 2] }, n: "집계 서브쿼리는 0건이어도 1행을 만든다. ENAME 서브쿼리는 0행이라 NULL이 된다." },
    { t: "2단계: 최종 결과", tb: { c: ["DEPTNO", "CNT", "TOT", "HIGH"], r: [[10, 2, 600, "A"], [20, 1, 300, null], [30, 0, null, null]], hl: [1, 2] } }
  ],
  res: { c: ["DEPTNO", "CNT", "TOT", "HIGH"], r: [[10, 2, 600, "A"], [20, 1, 300, null], [30, 0, null, null]] },
  pg: "SELECT D.DEPTNO, (SELECT COUNT(*) FROM EMP E WHERE E.DEPTNO = D.DEPTNO) CNT, (SELECT SUM(SAL) FROM EMP E WHERE E.DEPTNO = D.DEPTNO) TOT, (SELECT ENAME FROM EMP E WHERE E.DEPTNO = D.DEPTNO AND E.SAL > 300) HIGH FROM DEPT D ORDER BY D.DEPTNO",
  ox: [
    "정답.",
    "COUNT(*)도 NULL이 된다고 본 경우다. 대상 행이 없어도 COUNT는 0을 돌려준다.",
    "C의 SAL은 300이라 '> 300'을 만족하지 않는다. 또 SUM은 대상 행이 없으면 0이 아니라 NULL이다.",
    "스칼라 서브쿼리가 0건이면 행이 사라진다고 본 경우다. 스칼라 서브쿼리는 바깥 행 수에 영향을 주지 않는다."
  ],
  trap: "스칼라 서브쿼리는 0건이면 NULL, 2건 이상이면 오류(ORA-01427)다. 0건은 오류가 아니다.",
  memo: "스칼라 0건 → NULL / 집계 0건 → COUNT 0, SUM·MAX NULL"
},
{
  id: "S94", s: 2, tp: "sub", lv: 3, sub: "서브쿼리",
  th: "2과목 | 다중 컬럼 서브쿼리 — 쌍 비교 vs 비쌍 비교",
  q: "다음 두 SQL의 결과 건수로 옳은 것은?",
  tb: [{ n: "EMP", c: ["ENAME", "DEPTNO", "SAL"], r: [["A", 10, 500], ["B", 10, 300], ["C", 20, 300], ["D", 20, 200], ["E", 30, 300], ["F", 30, 100]] }],
  sql: "-- ①\nSELECT COUNT(*) FROM EMP\n WHERE (DEPTNO, SAL) IN (SELECT DEPTNO, MAX(SAL) FROM EMP GROUP BY DEPTNO);\n\n-- ②\nSELECT COUNT(*) FROM EMP\n WHERE DEPTNO IN (SELECT DEPTNO   FROM EMP GROUP BY DEPTNO)\n   AND SAL    IN (SELECT MAX(SAL) FROM EMP GROUP BY DEPTNO);",
  o: ["① 3, ② 3", "① 3, ② 4", "① 4, ② 4", "① 4, ② 3"],
  a: 1,
  why: "①은 (DEPTNO, SAL) 두 값을 한 쌍으로 묶어 비교하는 쌍 비교(Pairwise)다. '자기 부서의 최고 급여'인 사원만 남는다. ②는 두 컬럼을 따로 비교하는 비쌍 비교(Non-pairwise)다. SAL이 '어느 부서든' 최고 급여 목록 {500, 300}에 들어 있으면 통과하므로, 10번 부서의 B(300)도 섞여 들어온다.",
  st: [
    { t: "[원본] → 1단계: 서브쿼리 결과", tb: { c: ["DEPTNO", "MAX(SAL)"], r: [[10, 500], [20, 300], [30, 300]] }, n: "쌍 목록 = {(10,500), (20,300), (30,300)} / SAL 목록 = {500, 300}" },
    { t: "2단계: 행별 판정", tb: { c: ["ENAME", "(DEPTNO, SAL)", "① 쌍 비교", "② 비쌍 비교"], r: [["A", "(10, 500)", "O", "O"], ["B", "(10, 300)", "X", "O (300이 목록에 있음)"], ["C", "(20, 300)", "O", "O"], ["D", "(20, 200)", "X", "X"], ["E", "(30, 300)", "O", "O"], ["F", "(30, 100)", "X", "X"]], hl: [1] } }
  ],
  res: { c: ["①", "②"], r: [[3, 4]] },
  pg: "SELECT (SELECT COUNT(*) FROM EMP WHERE (DEPTNO, SAL) IN (SELECT DEPTNO, MAX(SAL) FROM EMP GROUP BY DEPTNO)), (SELECT COUNT(*) FROM EMP WHERE DEPTNO IN (SELECT DEPTNO FROM EMP GROUP BY DEPTNO) AND SAL IN (SELECT MAX(SAL) FROM EMP GROUP BY DEPTNO))",
  ox: [
    "②도 쌍 비교처럼 동작한다고 본 경우다. 따로 비교하면 B(10, 300)가 걸러지지 않는다.",
    "정답.",
    "①에서도 B가 포함된다고 본 경우다. 쌍 비교는 (10, 300)이라는 조합이 목록에 없으므로 B를 제외한다.",
    "두 방식의 결과를 서로 바꿔 생각한 경우다."
  ],
  trap: "'부서별 최고 급여자'를 구할 때 SAL IN (SELECT MAX(SAL) … GROUP BY DEPTNO)만 쓰면, 다른 부서의 최고 급여와 우연히 같은 사원까지 나온다.",
  memo: "(A, B) IN (SELECT A, B …) = 쌍으로 비교"
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
  why: "EXISTS는 서브쿼리가 '한 행이라도 돌려주는가'만 본다. 짝이 여러 개여도 바깥 행은 한 번만 나오므로(세미 조인) 10번 부서는 한 번만 센다. 일반 조인은 짝마다 행을 만들어 10번 부서가 A, B 두 번 나온다. ③의 서브쿼리는 바깥 테이블을 참조하지 않는 비연관 서브쿼리이며, D 사원 1행을 돌려주므로 모든 DEPT 행에 대해 TRUE다. SELECT 목록이 NULL이어도 '행이 있음'은 변하지 않는다.",
  st: [
    { t: "[원본] → 1단계: 부서별 짝", tb: { c: ["DEPTNO", "짝이 되는 EMP", "① EXISTS", "② 조인 행"], r: [[10, "A, B", "TRUE", 2], [20, "C", "TRUE", 1], [30, "없음", "FALSE", 0], [40, "없음", "FALSE", 0]], hl: [0] } },
    { t: "2단계: ③ 비연관 EXISTS", tb: { c: ["서브쿼리 결과", "EXISTS", "통과 행"], r: [["1행 (값 NULL)", "TRUE (모든 행 공통)", "DEPT 4행 전부"]] } }
  ],
  res: { c: ["①", "②", "③"], r: [[2, 3, 4]] },
  pg: "SELECT (SELECT COUNT(*) FROM DEPT D WHERE EXISTS (SELECT 1 FROM EMP E WHERE E.DEPTNO = D.DEPTNO)), (SELECT COUNT(*) FROM DEPT D JOIN EMP E ON E.DEPTNO = D.DEPTNO), (SELECT COUNT(*) FROM DEPT D WHERE EXISTS (SELECT NULL FROM EMP WHERE DEPTNO IS NULL))",
  ox: [
    "조인도 EXISTS처럼 부서를 한 번만 센다고 본 경우다. 조인은 짝의 수만큼 행이 늘어난다.",
    "SELECT NULL이면 EXISTS가 FALSE가 된다고 본 경우다. EXISTS는 값이 아니라 행의 존재만 본다.",
    "정답.",
    "EXISTS도 짝 수만큼 센다고 보고, ③은 NULL 행 1건만 센다고 본 경우다."
  ],
  trap: "EXISTS 서브쿼리의 SELECT 목록(1, *, NULL)은 결과에 아무 영향이 없다. 연관 조건이 빠지면 '전부 아니면 전무'가 된다.",
  memo: "EXISTS = 있으면 1번만 / 조인 = 짝마다"
},
{
  id: "S96", s: 2, tp: "sub", lv: 2, sub: "서브쿼리",
  th: "2과목 | HAVING 절 서브쿼리 — 전체 평균 vs 평균의 평균",
  q: "다음 SQL의 결과로 출력되는 DEPTNO는?",
  tb: [{ n: "EMP", c: ["ENAME", "DEPTNO", "SAL"], r: [["A", 10, 100], ["B", 10, 100], ["C", 10, 100], ["D", 10, 100], ["E", 20, 400], ["F", 30, 250], ["G", 30, 250]] }],
  sql: "SELECT DEPTNO, AVG(SAL) AS AVG_SAL\n  FROM EMP\n GROUP BY DEPTNO\nHAVING AVG(SAL) > (SELECT AVG(SAL) FROM EMP)\n ORDER BY DEPTNO;",
  o: ["20", "20, 30", "30", "HAVING 절에는 서브쿼리를 쓸 수 없어 오류가 발생한다."],
  a: 1,
  why: "HAVING 절에도 서브쿼리를 쓸 수 있다. 서브쿼리 (SELECT AVG(SAL) FROM EMP)는 그룹과 상관없이 전체 7명의 평균 1300 ÷ 7 ≈ 185.7을 돌려준다. 부서 평균이 이보다 큰 20번(400)과 30번(250)이 출력된다. '부서 평균들의 평균' (100 + 400 + 250) ÷ 3 = 250과 비교했다면 30번은 빠졌을 것이다.",
  st: [
    { t: "[원본] → 1단계: 그룹별 평균", tb: { c: ["DEPTNO", "인원", "SUM", "AVG(SAL)"], r: [[10, 4, 400, 100], [20, 1, 400, 400], [30, 2, 500, 250]] } },
    { t: "2단계: 서브쿼리 값", tb: { c: ["식", "값"], r: [["전체 AVG(SAL) = 1300 ÷ 7", "185.71"], ["(비교) 부서 평균의 평균 = 750 ÷ 3", "250"]], hl: [0] } },
    { t: "3단계: HAVING 판정", tb: { c: ["DEPTNO", "AVG(SAL)", "> 185.71"], r: [[10, 100, "X"], [20, 400, "O"], [30, 250, "O"]], hl: [1, 2] } }
  ],
  res: { c: ["DEPTNO", "AVG_SAL"], r: [[20, 400], [30, 250]] },
  pg: "SELECT DEPTNO, AVG(SAL) AVG_SAL FROM EMP GROUP BY DEPTNO HAVING AVG(SAL) > (SELECT AVG(SAL) FROM EMP) ORDER BY DEPTNO",
  ox: [
    "서브쿼리가 부서 평균들의 평균(250)을 돌려준다고 본 경우다. 서브쿼리에는 GROUP BY가 없으므로 전체 평균이다.",
    "정답.",
    "근거 없는 값이다. 400 > 185.7이므로 20번도 통과한다.",
    "HAVING 절에도 단일 행 서브쿼리를 비교 대상으로 쓸 수 있다."
  ],
  trap: "인원이 다른 부서끼리는 '전체 평균'과 '부서 평균의 평균'이 다르다. 서브쿼리에 GROUP BY가 있는지부터 확인한다.",
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
  why: "Oracle에서 UNION, UNION ALL, INTERSECT, MINUS는 우선순위가 모두 같다. 괄호가 없으면 위에서 아래(왼쪽에서 오른쪽)로 차례대로 계산한다. ①은 (T1 ∪ T2) − T3이고, ②는 괄호 때문에 T1 ∪ (T2 − T3)이다.",
  st: [
    { t: "[원본] 집합", tb: { c: ["테이블", "값"], r: [["T1", "{1, 2, 3}"], ["T2", "{3, 4}"], ["T3", "{1, 4}"]] } },
    { t: "1단계: ① 왼쪽부터", tb: { c: ["순서", "연산", "결과"], r: [[1, "T1 UNION T2", "{1, 2, 3, 4}"], [2, "… MINUS T3", "{2, 3}"]], hl: [1] } },
    { t: "2단계: ② 괄호 먼저", tb: { c: ["순서", "연산", "결과"], r: [[1, "T2 MINUS T3", "{3}"], [2, "T1 UNION …", "{1, 2, 3}"]], hl: [1] } }
  ],
  res: { c: ["①", "②"], r: [["2,3", "1,2,3"]] },
  pg: "SELECT (SELECT STRING_AGG(C::text, ',' ORDER BY C) FROM (SELECT C FROM T1 UNION SELECT C FROM T2 EXCEPT SELECT C FROM T3) X), (SELECT STRING_AGG(C::text, ',' ORDER BY C) FROM (SELECT C FROM T1 UNION (SELECT C FROM T2 EXCEPT SELECT C FROM T3)) Y)",
  ox: [
    "정답.",
    "①에서도 MINUS를 먼저 계산한다고 본 경우다. 괄호가 없으면 순서대로 계산한다.",
    "②의 괄호를 무시한 경우다.",
    "두 결과를 서로 바꿔 생각한 경우다."
  ],
  trap: "ISO 표준(그리고 PostgreSQL·SQL Server)은 INTERSECT를 다른 집합 연산자보다 먼저 계산한다. Oracle은 네 연산자가 같은 우선순위라서, INTERSECT가 섞이면 DBMS마다 결과가 달라질 수 있다. 의도를 분명히 하려면 괄호를 쓴다.",
  memo: "Oracle 집합 연산자 = 같은 우선순위, 위→아래, 괄호 우선"
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
  why: "MINUS는 첫 번째 결과에서 두 번째 결과에 있는 행을 빼고, 남은 행의 중복도 제거한다. (B, 70)은 T1에 2건 있어도 T2에 같은 행이 있으므로 모두 사라진다. (C, 90)은 T2의 (C, 95)와 SCORE가 달라 남는다. 집합 연산의 ORDER BY는 맨 끝에 한 번만 쓰며, 위치 번호(2 = SCORE)나 첫 번째 SELECT의 컬럼명·별칭으로 지정한다.",
  st: [
    { t: "[원본] → 1단계: T1의 서로 다른 행", tb: { c: ["행", "T1 건수", "T2에 있음?", "MINUS 결과"], r: [["(A, 80)", 2, "X", "1건으로 남음"], ["(B, 70)", 2, "O", "제거"], ["(C, 90)", 1, "X ((C, 95)와 다름)", "남음"], ["(D, 80)", 1, "X", "남음"]], hl: [0, 1] } },
    { t: "2단계: ORDER BY 2 DESC, 1", tb: { c: ["NAME", "SCORE"], r: [["C", 90], ["A", 80], ["D", 80]] }, n: "SCORE 내림차순, 같은 80끼리는 NAME 오름차순" }
  ],
  res: { c: ["NAME", "SCORE"], r: [["C", 90], ["A", 80], ["D", 80]] },
  pg: "SELECT NAME, SCORE FROM T1 EXCEPT SELECT NAME, SCORE FROM T2 ORDER BY 2 DESC, 1",
  ox: [
    "MINUS가 중복을 남긴다고 본 경우다. MINUS는 결과의 중복을 제거한다.",
    "건수만큼 하나씩 빼는 방식(표준 EXCEPT ALL)으로 계산한 경우다. Oracle MINUS는 같은 행을 모두 제거하고 중복도 없앤다.",
    "정답.",
    "ORDER BY 2처럼 SELECT 목록의 위치 번호를 쓰는 것은 집합 연산에서도 허용된다."
  ],
  trap: "UNION ALL만 중복을 남긴다. UNION·INTERSECT·MINUS는 모두 결과에서 중복을 제거한다.",
  memo: "MINUS = 차집합 + DISTINCT, ORDER BY는 맨 끝 1번"
},
{
  id: "S99", s: 2, tp: "grp", lv: 2, sub: "그룹 함수",
  th: "2과목 | GROUPING SETS와 빈 괄호 ()",
  q: "다음 SQL의 결과 행 수는?",
  tb: [{ n: "EMP", c: ["DEPT", "JOB", "SAL"], r: [[10, "CLERK", 100], [10, "MGR", 300], [10, "CLERK", 200], [20, "CLERK", 150], [20, "ANALYST", 400]] }],
  sql: "SELECT DEPT, JOB, SUM(SAL) AS SUM_SAL\n  FROM EMP\n GROUP BY GROUPING SETS (DEPT, JOB, ());",
  o: ["5", "6", "7", "10"],
  a: 1,
  why: "GROUPING SETS (A, B, ())는 GROUP BY A, GROUP BY B, 전체 합계를 각각 구해 UNION ALL한 것과 같다. 괄호 안의 콤마는 '조합'이 아니라 '각각'이다. 빈 괄호 ()는 그룹 기준이 없는 전체 집계(총계) 1행이다.",
  st: [
    { t: "[원본] → 1단계: 그룹 기준별 결과", tb: { c: ["그룹 기준", "DEPT", "JOB", "SUM_SAL"], r: [["DEPT", 10, null, 600], ["DEPT", 20, null, 550], ["JOB", null, "ANALYST", 400], ["JOB", null, "CLERK", 450], ["JOB", null, "MGR", 300], ["()", null, null, 1150]], hl: [5] } },
    { t: "2단계: 다른 구문과 비교", tb: { c: ["구문", "행 수"], r: [["GROUPING SETS (DEPT, JOB, ())", 6], ["GROUPING SETS ((DEPT, JOB), ())", 5], ["ROLLUP (DEPT, JOB)", 7], ["CUBE (DEPT, JOB)", 10]], hl: [0] } }
  ],
  res: { c: ["행 수"], r: [[6]] },
  pg: "SELECT COUNT(*) FROM (SELECT DEPT, JOB, SUM(SAL) FROM EMP GROUP BY GROUPING SETS (DEPT, JOB, ())) X",
  ox: [
    "(DEPT, JOB) 조합 4행 + 총계로 계산한 경우다. 조합이 되려면 GROUPING SETS ((DEPT, JOB), ())처럼 괄호로 묶어야 한다.",
    "정답.",
    "ROLLUP(DEPT, JOB)의 행 수다.",
    "CUBE(DEPT, JOB)의 행 수다."
  ],
  trap: "GROUPING SETS는 나열한 기준만 만든다. ROLLUP·CUBE처럼 상세 조합 행을 저절로 만들지 않는다.",
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
  why: "GROUP BY DEPT, ROLLUP(JOB)은 ROLLUP 바깥의 DEPT를 항상 그룹 기준으로 둔다. 따라서 만들어지는 그룹은 (DEPT, JOB)과 (DEPT) 두 가지뿐이고, DEPT까지 지운 총계 ()는 만들어지지 않는다. 즉 GROUPING SETS ((DEPT, JOB), (DEPT))와 같다.",
  st: [
    { t: "[원본] → 1단계: (DEPT, JOB) 상세 그룹", tb: { c: ["DEPT", "JOB", "SUM_SAL"], r: [[10, "CLERK", 300], [10, "MGR", 300], [20, "CLERK", 150], [20, "MGR", 300]] } },
    { t: "2단계: DEPT별 소계 추가 (총계 없음)", tb: { c: ["DEPT", "JOB", "SUM_SAL"], r: [[10, "CLERK", 300], [10, "MGR", 300], [10, null, 600], [20, "CLERK", 150], [20, "MGR", 300], [20, null, 450]], hl: [2, 5] } }
  ],
  res: { c: ["DEPT", "JOB", "SUM_SAL"], r: [[10, "CLERK", 300], [10, "MGR", 300], [10, null, 600], [20, "CLERK", 150], [20, "MGR", 300], [20, null, 450]] },
  pg: "SELECT DEPT, JOB, SUM(SAL) SUM_SAL FROM EMP GROUP BY DEPT, ROLLUP(JOB) ORDER BY DEPT, JOB",
  ox: [
    "ROLLUP(DEPT, JOB)으로 본 경우다. 부분 ROLLUP에는 총계 행이 없어 6행이다.",
    "정답.",
    "(20, MGR)은 250 + 50 = 300이다. 한 행만 본 경우다.",
    "JOB별 소계는 CUBE(DEPT, JOB)처럼 DEPT를 지운 그룹이 있어야 나온다. 여기서는 DEPT가 항상 그룹 기준이라 DEPT가 NULL인 행이 없다."
  ],
  trap: "ROLLUP 괄호 밖에 둔 컬럼은 '고정 기준'이다. 소계는 괄호 안 컬럼만 오른쪽부터 지워 가며 만든다.",
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
  why: "CUBE(REGION)는 REGION별 그룹과 전체 총계를 만든다. REGION이 원래 NULL인 데이터도 하나의 그룹(NULL 그룹)이 되고, 총계 행의 REGION도 NULL로 표시된다. NVL은 두 NULL을 구별하지 못하고 둘 다 '(없음)'으로 바꾼다. GROUPING(REGION)은 그 컬럼이 집계로 지워진 행(소계·총계)에서만 1을 돌려주므로 두 행을 구별할 수 있다.",
  st: [
    { t: "[원본] → 1단계: CUBE 그룹", tb: { c: ["REGION", "GROUPING(REGION)", "SUM(AMT)", "의미"], r: [["EAST", 0, 300, "데이터 그룹"], ["WEST", 0, 300, "데이터 그룹"], [null, 0, 50, "원래 NULL인 데이터 그룹"], [null, 1, 650, "총계"]], hl: [2, 3] } },
    { t: "2단계: NVL 적용 후 R = '(없음)'인 행", tb: { c: ["R", "G", "S"], r: [["(없음)", 0, 50], ["(없음)", 1, 650]] } },
    { t: "구별법", n: "CASE WHEN GROUPING(REGION) = 1 THEN '총계' ELSE NVL(REGION, '(없음)') END" }
  ],
  res: { c: ["R", "G", "S"], r: [["(없음)", 0, 50], ["(없음)", 1, 650]] },
  pg: "SELECT R, G, S FROM (SELECT COALESCE(REGION, '(없음)') R, GROUPING(REGION) G, SUM(AMT) S FROM T GROUP BY CUBE(REGION)) X WHERE R = '(없음)' ORDER BY G",
  ox: [
    "총계 행의 NULL에는 NVL이 적용되지 않는다고 본 경우다.",
    "원래 NULL인 데이터가 그룹을 만들지 않는다고 본 경우다. GROUP BY에서 NULL도 하나의 그룹이다.",
    "정답.",
    "CUBE가 만든 NULL도 결과 값으로는 일반 NULL이라 NVL·DECODE·CASE가 그대로 적용된다."
  ],
  trap: "소계 행에 이름을 붙일 때 NVL을 쓰면 원래 NULL인 데이터와 섞인다. 반드시 GROUPING 함수로 판별한다.",
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
  why: "OVER 절에 ORDER BY가 없으면 윈도우는 파티션 전체다. 그래서 SUM(SAL) OVER (PARTITION BY DEPT)는 행마다 '부서 합계'를 그대로 붙인다(누적 합이 아니다). RATIO_TO_REPORT(SAL)는 '내 값 ÷ 파티션 합계'를 0~1 사이 비율로 돌려준다. MAX(SAL) OVER (PARTITION BY DEPT)는 부서 최고 급여다. 윈도우 함수는 GROUP BY와 달리 행 수를 줄이지 않는다.",
  st: [
    { t: "[원본] → 1단계: 파티션별 집계", tb: { c: ["DEPT", "행", "SUM", "MAX"], r: [[10, "A 100, B 300, C 100", 500, 300], [20, "D 200, E 200", 400, 200]], hl: [0] } },
    { t: "2단계: 행별 계산", tb: { c: ["ENAME", "SAL", "DS", "R", "GAP"], r: [["A", 100, 500, "100 ÷ 500 = 0.2", "100 − 300 = −200"], ["B", 300, 500, "0.6", 0], ["C", 100, 500, "0.2", -200], ["D", 200, 400, "0.5", 0], ["E", 200, 400, "0.5", 0]], hl: [0] } }
  ],
  res: { c: ["ENAME", "DS", "R", "GAP"], r: [["A", 500, 0.2, -200]] },
  pg: "SELECT ENAME, DS, R, GAP FROM (SELECT ENAME, SUM(SAL) OVER (PARTITION BY DEPT) DS, ROUND(SAL / SUM(SAL) OVER (PARTITION BY DEPT), 2) R, SAL - MAX(SAL) OVER (PARTITION BY DEPT) GAP FROM EMP) X WHERE ENAME = 'A'",
  ox: [
    "정답.",
    "PARTITION BY를 무시하고 전체(900)를 기준으로 계산한 경우다.",
    "ORDER BY가 없는데도 누적 합(첫 행까지의 합)이라고 본 경우다. ORDER BY가 없으면 파티션 전체 합이다.",
    "RATIO_TO_REPORT가 백분율(×100)을 돌려준다고 본 경우다. 0~1 사이의 비율이다."
  ],
  trap: "OVER (… ORDER BY …)가 있으면 기본 프레임이 '처음부터 현재 행까지'라 누적 합이 된다. ORDER BY 유무가 결과를 바꾼다.",
  memo: "OVER (PARTITION BY)만 = 그룹 합계를 행마다 / RATIO_TO_REPORT = 값 ÷ 합"
},
{
  id: "S103", s: 2, tp: "topn", lv: 2, sub: "Top N 쿼리",
  th: "2과목 | OFFSET … FETCH NEXT … WITH TIES",
  q: "다음 SQL의 결과로 출력되는 ID를 모두 고른 것은? (Oracle 12c 이상)",
  tb: [{ n: "T", c: ["ID", "SCORE"], r: [[1, 90], [2, 85], [3, 95], [4, 85], [5, 70], [6, 80], [7, 85]] }],
  sql: "SELECT ID, SCORE\n  FROM T\n ORDER BY SCORE DESC\nOFFSET 2 ROWS\n FETCH NEXT 1 ROW WITH TIES;",
  o: ["2, 4, 7", "2, 4, 7 중 1개", "1, 2, 4, 7", "2, 4, 7, 6"],
  a: 0,
  why: "실행 순서는 정렬 → OFFSET(앞에서 n행 건너뛰기) → FETCH(그다음 m행)이다. SCORE 내림차순으로 정렬하면 95(3), 90(1)을 건너뛰고, 다음 1행은 85점이다. WITH TIES는 마지막으로 가져온 행과 ORDER BY 값이 같은 행을 모두 함께 가져오므로 85점인 2, 4, 7이 모두 나온다.",
  st: [
    { t: "[원본] → 1단계: ORDER BY SCORE DESC", tb: { c: ["순서", "ID", "SCORE"], r: [[1, 3, 95], [2, 1, 90], [3, "2/4/7 중 하나", 85], [4, "2/4/7 중 하나", 85], [5, "2/4/7 중 하나", 85], [6, 6, 80], [7, 5, 70]] }, n: "같은 85점끼리의 순서는 정해져 있지 않다." },
    { t: "2단계: OFFSET 2 → FETCH 1 WITH TIES", tb: { c: ["순서", "SCORE", "처리"], r: [["1~2", "95, 90", "OFFSET으로 건너뜀"], [3, 85, "FETCH 1행"], ["4~5", "85, 85", "동점이라 WITH TIES로 포함"], ["6~7", "80, 70", "제외"]], hl: [1, 2] } }
  ],
  res: { c: ["ID"], r: [[2], [4], [7]] },
  pg: "SELECT ID FROM (SELECT ID, SCORE FROM T ORDER BY SCORE DESC OFFSET 2 ROWS FETCH NEXT 1 ROW WITH TIES) X ORDER BY ID",
  ox: [
    "정답.",
    "ROWS ONLY일 때의 결과다. WITH TIES가 있으면 동점이 모두 포함된다.",
    "90점인 1번까지 포함한 경우다. OFFSET 2는 95점(3번)과 90점(1번) 두 행을 건너뛰므로 1번은 나오지 않는다.",
    "동점이 아닌 다음 순위(80)까지 가져온다고 본 경우다."
  ],
  trap: "ROWS ONLY에서 동점이 있으면 어떤 행이 나올지 보장되지 않는다. 페이징에는 ORDER BY에 고유 컬럼을 덧붙인다.",
  memo: "정렬 → OFFSET 건너뛰기 → FETCH 가져오기(WITH TIES = 동점 포함)"
},
{
  id: "S104", s: 2, tp: "topn", lv: 3, sub: "Top N 쿼리",
  th: "2과목 | ROWNUM 페이징 — 인라인 뷰 정렬 후 RN 별칭",
  q: "[EMP]에서 급여 내림차순 3번째와 4번째 사원을 정확히 조회하는 SQL은? (Oracle 기준)",
  tb: [{ n: "EMP", c: ["ENAME", "SAL"], r: [["A", 300], ["B", 500], ["C", 100], ["D", 400], ["E", 200]] }],
  sql: "① SELECT ENAME FROM (SELECT ENAME, SAL FROM EMP ORDER BY SAL DESC)\n   WHERE ROWNUM BETWEEN 3 AND 4;\n\n② SELECT ENAME FROM (SELECT ROWNUM RN, ENAME FROM EMP ORDER BY SAL DESC)\n   WHERE RN BETWEEN 3 AND 4;\n\n③ SELECT ENAME\n     FROM (SELECT ROWNUM RN, ENAME\n             FROM (SELECT ENAME, SAL FROM EMP ORDER BY SAL DESC)\n            WHERE ROWNUM <= 4)\n    WHERE RN >= 3;\n\n④ SELECT ENAME FROM EMP\n   WHERE ROWNUM BETWEEN 3 AND 4\n   ORDER BY SAL DESC;",
  o: ["①", "②", "③", "④"],
  a: 2,
  why: "ROWNUM은 WHERE 조건을 통과한 행에 1부터 차례로 붙는 번호다. 첫 행이 ROWNUM = 1인데 'ROWNUM >= 3'을 만족하지 못해 버려지면 다음 행도 다시 1번이 되므로, ROWNUM BETWEEN 3 AND 4는 항상 0건이다. 그래서 안쪽에서 정렬 → 그 바깥에서 ROWNUM을 RN이라는 별칭(일반 컬럼)으로 굳힘 → 가장 바깥에서 RN으로 거르는 3단 구조를 쓴다.",
  st: [
    { t: "[원본] → 1단계: 가장 안쪽 정렬", tb: { c: ["ENAME", "SAL"], r: [["B", 500], ["D", 400], ["A", 300], ["E", 200], ["C", 100]] } },
    { t: "2단계: ROWNUM <= 4로 번호를 붙여 RN으로 고정", tb: { c: ["RN", "ENAME"], r: [[1, "B"], [2, "D"], [3, "A"], [4, "E"]], hl: [2, 3] } },
    { t: "3단계: RN >= 3", tb: { c: ["ENAME"], r: [["A"], ["E"]] } },
    { t: "나머지 보기", tb: { c: ["보기", "문제점", "결과"], r: [["①", "ROWNUM 3 이상 조건은 성립 불가", "0건"], ["②", "ROWNUM이 정렬 전에 붙음", "정렬과 무관한 2명"], ["④", "ROWNUM 조건이 먼저, ORDER BY는 나중", "0건"]] } }
  ],
  res: { c: ["ENAME"], r: [["A"], ["E"]] },
  pg: "SELECT ENAME FROM (SELECT ROW_NUMBER() OVER (ORDER BY SAL DESC) RN, ENAME FROM EMP) X WHERE RN BETWEEN 3 AND 4 ORDER BY RN",
  ox: [
    "ROWNUM에 3 이상의 범위 조건을 직접 걸어 0건이 된다.",
    "같은 SELECT 안에서 ROWNUM은 ORDER BY보다 먼저 붙으므로, RN은 급여 순위가 아니라 읽은 순서다.",
    "정답.",
    "0건이다. ROWNUM 조건이 성립하지 않고, ORDER BY는 그 뒤에 실행된다."
  ],
  trap: "같은 결과를 ROW_NUMBER() OVER (ORDER BY SAL DESC)로 번호를 매긴 인라인 뷰에서 RN BETWEEN 3 AND 4로 구할 수도 있다(검증 쿼리 방식).",
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
  why: "ROW_NUMBER는 동점에도 서로 다른 번호를 주므로 정확히 3건이다. RANK는 동점 뒤 순위를 건너뛰어(1, 2, 2, 4, …) 3 이하가 3건이다. DENSE_RANK는 순위를 건너뛰지 않아(1, 2, 2, 3, 3, 4) 3 이하가 5건이다. SQL Server의 TOP(3) WITH TIES는 3번째 행(400)과 같은 값까지 포함하는데, 3번째까지가 이미 500, 400, 400이므로 3건이다.",
  st: [
    { t: "[원본] → 1단계: 순위 매기기", tb: { c: ["ENAME", "SAL", "ROW_NUMBER", "RANK", "DENSE_RANK"], r: [["A", 500, 1, 1, 1], ["B", 400, 2, 2, 2], ["C", 400, 3, 2, 2], ["D", 300, 4, 4, 3], ["E", 300, 5, 4, 3], ["F", 200, 6, 6, 4]], hl: [3, 4] } },
    { t: "2단계: 3 이하 / TOP 3 건수", tb: { c: ["방식", "선택", "건수"], r: [["① ROW_NUMBER <= 3", "A, B, C", 3], ["② RANK <= 3", "A, B, C", 3], ["③ DENSE_RANK <= 3", "A, B, C, D, E", 5], ["④ TOP(3) WITH TIES", "A, B, C (3번째 값 400의 동점까지)", 3]], hl: [2] } }
  ],
  res: { c: ["①", "②", "③", "④"], r: [[3, 3, 5, 3]] },
  pg: "SELECT (SELECT COUNT(*) FROM (SELECT ROW_NUMBER() OVER (ORDER BY SAL DESC) RK FROM EMP) X WHERE RK <= 3), (SELECT COUNT(*) FROM (SELECT RANK() OVER (ORDER BY SAL DESC) RK FROM EMP) X WHERE RK <= 3), (SELECT COUNT(*) FROM (SELECT DENSE_RANK() OVER (ORDER BY SAL DESC) RK FROM EMP) X WHERE RK <= 3), (SELECT COUNT(*) FROM (SELECT SAL FROM EMP ORDER BY SAL DESC FETCH FIRST 3 ROWS WITH TIES) X)",
  ox: [
    "3건이다. ROW_NUMBER는 동점이어도 번호가 겹치지 않는다.",
    "3건이다. 2위가 둘이라 다음 순위는 4위로 건너뛴다.",
    "정답. 5건이다.",
    "3건이다. 3번째 행의 값(400)과 같은 행만 더 붙는데, 400인 B·C는 이미 들어 있다."
  ],
  trap: "WITH TIES는 'N번째 행의 값'과 같은 행을 붙인다. 'N번째 순위'까지 가져오는 DENSE_RANK와 혼동하지 않는다.",
  memo: "ROW_NUMBER 정확히 N / RANK·TIES는 동점 포함 / DENSE_RANK는 N개 값"
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
  why: "START WITH MGR = 1이므로 KING의 직속 부하인 JONES와 BLAKE가 각각 루트(LEVEL 1)가 되고, KING은 결과에 나오지 않는다. CONNECT_BY_ROOT는 현재 행이 속한 전개의 루트 행(START WITH로 시작한 행)의 값을 돌려준다. SYS_CONNECT_BY_PATH(컬럼, 구분자)는 루트부터 현재 행까지의 값을 '구분자 + 값' 형태로 이어 붙이므로 맨 앞에 구분자가 붙는다.",
  st: [
    { t: "[원본] → 1단계: START WITH MGR = 1로 시작한 트리", n: "JONES(2)   ← 루트\n└─ SCOTT(4)\n    └─ ADAMS(5)\nBLAKE(3)   ← 루트\n└─ ALLEN(6)\n(KING은 START WITH 조건에 맞지 않아 제외)" },
    { t: "2단계: 행별 ROOT · PATH", tb: { c: ["LEVEL", "ENAME", "ROOT", "PATH"], r: [[1, "JONES", "JONES", "/JONES"], [2, "SCOTT", "JONES", "/JONES/SCOTT"], [3, "ADAMS", "JONES", "/JONES/SCOTT/ADAMS"], [1, "BLAKE", "BLAKE", "/BLAKE"], [2, "ALLEN", "BLAKE", "/BLAKE/ALLEN"]], hl: [2] } }
  ],
  res: { c: ["행 수", "ENAME", "ROOT", "PATH"], r: [[5, "ADAMS", "JONES", "/JONES/SCOTT/ADAMS"]] },
  pg: "WITH RECURSIVE H AS (SELECT EMPNO, ENAME, ENAME ROOT, '/' || ENAME PATH FROM EMP WHERE MGR = 1 UNION ALL SELECT E.EMPNO, E.ENAME, H.ROOT, H.PATH || '/' || E.ENAME FROM EMP E JOIN H ON E.MGR = H.EMPNO) SELECT (SELECT COUNT(*) FROM H), ENAME, ROOT, PATH FROM H WHERE ENAME = 'ADAMS'",
  ox: [
    "루트를 전체 트리의 최상위(KING)로 본 경우다. 루트는 START WITH로 시작한 행이다.",
    "CONNECT_BY_ROOT를 바로 위 부모로 본 경우다. 바로 위 부모는 PRIOR ENAME이다.",
    "구분자가 값 뒤에 붙는다고 본 경우다. 구분자는 각 값 앞에 붙어 맨 앞이 '/'다.",
    "정답."
  ],
  trap: "PRIOR ENAME = 부모, CONNECT_BY_ROOT ENAME = 루트, SYS_CONNECT_BY_PATH = 루트부터 경로. 세 개를 구별한다.",
  memo: "ROOT = START WITH 행 / PATH = '/루트/…/나'"
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
  why: "PIVOT에 집계 함수를 여러 개 쓰면 IN 목록의 값마다 집계 함수 개수만큼 컬럼이 생긴다. 컬럼명은 'IN 값 별칭_집계 별칭'(Q1_S)이고, 순서는 IN 값 순서대로 그 안에서 집계 함수 순서(Q1_S, Q1_C, Q2_S, Q2_C)다. 해당 조합의 데이터가 없으면 SUM은 NULL, COUNT는 0이다. IN 목록에 없는 Q3 데이터는 어느 컬럼에도 들어가지 않는다.",
  st: [
    { t: "[원본] → 1단계: (DEPT, QTR)별 집계", tb: { c: ["DEPT", "QTR", "SUM(AMT)", "COUNT(AMT)"], r: [[10, "Q1", 150, 2], [10, "Q2", 200, 1], [20, "Q1", 300, 1], [20, "Q3", 500, 1]], hl: [3] }, n: "Q3는 IN 목록에 없어 버려진다." },
    { t: "2단계: 컬럼으로 펼치기", tb: { c: ["DEPT", "Q1_S", "Q1_C", "Q2_S", "Q2_C"], r: [[10, 150, 2, 200, 1], [20, 300, 1, null, 0]], hl: [1] } }
  ],
  res: { c: ["DEPT", "Q1_S", "Q1_C", "Q2_S", "Q2_C"], r: [[10, 150, 2, 200, 1], [20, 300, 1, null, 0]] },
  pg: "SELECT DEPT, SUM(AMT) FILTER (WHERE QTR = 'Q1') Q1_S, COUNT(AMT) FILTER (WHERE QTR = 'Q1') Q1_C, SUM(AMT) FILTER (WHERE QTR = 'Q2') Q2_S, COUNT(AMT) FILTER (WHERE QTR = 'Q2') Q2_C FROM SALES GROUP BY DEPT ORDER BY DEPT",
  ox: [
    "컬럼명 순서를 '집계 별칭_IN 값 별칭'으로 본 경우다. Oracle은 IN 값 별칭이 앞이다.",
    "정답.",
    "데이터가 없는 칸의 SUM도 0이라고 본 경우다. SUM은 NULL, COUNT만 0이다.",
    "집계 함수별로 컬럼을 먼저 모은다고 본 경우다. IN 값 하나마다 집계 컬럼이 연달아 나온다."
  ],
  trap: "집계 함수가 여러 개인데 집계 별칭을 생략하면 컬럼명이 겹쳐 쓸 수 없게 된다. 다중 집계에는 별칭을 붙인다.",
  memo: "PIVOT 컬럼명 = IN별칭_집계별칭, 빈 칸: SUM NULL / COUNT 0"
},
{
  id: "S108", s: 2, tp: "pivot", lv: 2, sub: "PIVOT 절과 UNPIVOT 절",
  th: "2과목 | 인라인 뷰 없이 PIVOT — 남은 컬럼이 모두 그룹 기준",
  q: "다음 SQL의 결과 행 수는? (Oracle 기준)",
  tb: [{ n: "SALES", c: ["ID", "DEPT", "QTR", "AMT"], r: [[1, 10, "Q1", 100], [2, 10, "Q2", 200], [3, 10, "Q1", 50], [4, 20, "Q1", 300], [5, 20, "Q3", 400]] }],
  sql: "SELECT *\n  FROM SALES\n PIVOT (SUM(AMT) FOR QTR IN ('Q1' AS Q1, 'Q2' AS Q2));",
  o: ["2", "4", "5", "PIVOT은 인라인 뷰 없이 쓸 수 없으므로 오류가 발생한다."],
  a: 2,
  why: "PIVOT은 집계 함수에 쓴 컬럼(AMT)과 FOR 절 컬럼(QTR)을 뺀 나머지 컬럼 전부를 암묵적인 GROUP BY 기준으로 쓴다. 여기서는 ID와 DEPT가 그룹 기준이 되고 ID가 모두 달라 원본 5행이 그대로 5개 그룹이 된다. ID 5(Q3)는 Q1·Q2 칸이 모두 NULL인 행으로 남는다. DEPT별 2행을 원했다면 인라인 뷰에서 DEPT, QTR, AMT만 골라야 한다.",
  st: [
    { t: "[원본] → 1단계: 그룹 기준 = AMT·QTR을 뺀 (ID, DEPT)", tb: { c: ["ID", "DEPT", "QTR", "AMT"], r: [[1, 10, "Q1", 100], [2, 10, "Q2", 200], [3, 10, "Q1", 50], [4, 20, "Q1", 300], [5, 20, "Q3", 400]] } },
    { t: "2단계: PIVOT 결과", tb: { c: ["ID", "DEPT", "Q1", "Q2"], r: [[1, 10, 100, null], [2, 10, null, 200], [3, 10, 50, null], [4, 20, 300, null], [5, 20, null, null]], hl: [4] } },
    { t: "비교: 인라인 뷰로 DEPT, QTR, AMT만 쓸 때", tb: { c: ["DEPT", "Q1", "Q2"], r: [[10, 150, 200], [20, 300, null]] } }
  ],
  res: { c: ["행 수"], r: [[5]] },
  pg: "SELECT COUNT(*) FROM (SELECT ID, DEPT, SUM(AMT) FILTER (WHERE QTR = 'Q1') Q1, SUM(AMT) FILTER (WHERE QTR = 'Q2') Q2 FROM SALES GROUP BY ID, DEPT) X",
  ox: [
    "인라인 뷰로 ID를 뺐을 때의 결과다. 테이블을 그대로 쓰면 ID도 그룹 기준이 된다.",
    "IN 목록에 없는 Q3 행이 통째로 사라진다고 본 경우다. 행(그룹)은 남고 값 칸만 NULL이다.",
    "정답.",
    "PIVOT은 테이블에 바로 쓸 수 있다. 다만 남은 컬럼이 모두 그룹 기준이 될 뿐이다."
  ],
  trap: "PIVOT 문제에서 FROM 절이 인라인 뷰인지 테이블인지 먼저 본다. 컬럼 하나 차이로 행 수가 크게 달라진다.",
  memo: "PIVOT 그룹 기준 = 집계·FOR 컬럼을 뺀 나머지 전부"
},
{
  id: "S109", s: 2, tp: "regex", lv: 3, sub: "정규 표현식",
  th: "2과목 | REGEXP_REPLACE 역참조(\\1, \\2 …)",
  q: "다음 SQL의 결과로 옳은 것은?",
  sql: "SELECT REGEXP_REPLACE('2026-10-04', '(\\d{4})-(\\d{2})-(\\d{2})', '\\3/\\2/\\1') AS C1,\n       REGEXP_REPLACE('KIM, MINSU', '(\\w+), (\\w+)', '\\2 \\1')              AS C2\n  FROM DUAL;",
  o: ["04/10/2026, MINSU KIM", "2026/10/04, MINSU KIM", "04/10/2026, KIM MINSU", "\\3/\\2/\\1, \\2 \\1"],
  a: 0,
  why: "패턴의 괄호 ( )는 그룹을 만들고, 왼쪽 여는 괄호부터 1, 2, 3번이 붙는다. 바꿀 문자열에서 \\n은 n번 그룹이 실제로 맞춘 문자열을 가리키는 역참조다. \\d는 숫자 한 글자, {4}는 정확히 4번, \\w는 영문자·숫자·밑줄 한 글자다.",
  st: [
    { t: "1단계: C1 그룹 캡처", tb: { c: ["그룹", "패턴", "맞춘 값"], r: [["\\1", "(\\d{4})", "2026"], ["\\2", "(\\d{2})", "10"], ["\\3", "(\\d{2})", "04"]] } },
    { t: "2단계: C2 그룹 캡처", tb: { c: ["그룹", "패턴", "맞춘 값"], r: [["\\1", "(\\w+)", "KIM"], ["\\2", "(\\w+)", "MINSU"]] }, n: "', '(콤마+공백)는 그룹 밖이라 결과에서 사라지고, 바꿀 문자열의 공백 하나가 들어간다." },
    { t: "3단계: 치환 결과", tb: { c: ["식", "결과"], r: [["'\\3/\\2/\\1'", "04/10/2026"], ["'\\2 \\1'", "MINSU KIM"]] } }
  ],
  res: { c: ["C1", "C2"], r: [["04/10/2026", "MINSU KIM"]] },
  pg: "SELECT REGEXP_REPLACE('2026-10-04', '(\\d{4})-(\\d{2})-(\\d{2})', '\\3/\\2/\\1'), REGEXP_REPLACE('KIM, MINSU', '(\\w+), (\\w+)', '\\2 \\1')",
  ox: [
    "정답.",
    "그룹 번호를 오른쪽부터 센 경우다. 번호는 왼쪽 여는 괄호부터 붙는다.",
    "C2에서 역참조 순서를 바꾸지 않은 경우다. '\\2 \\1'이므로 이름이 앞으로 온다.",
    "역참조를 문자 그대로 출력한다고 본 경우다."
  ],
  trap: "패턴이 원본과 맞지 않으면 REGEXP_REPLACE는 원본 문자열을 그대로 돌려준다(오류도 NULL도 아니다).",
  memo: "( ) = 그룹, \\n = n번 그룹 값, 번호는 왼쪽 괄호부터"
},
{
  id: "S110", s: 2, tp: "regex", lv: 2, sub: "정규 표현식",
  th: "2과목 | REGEXP_LIKE 앵커(^ $)와 POSIX 문자 클래스",
  q: "다음 두 SQL의 결과 건수로 옳은 것은?",
  tb: [{ n: "T", c: ["CODE"], r: [["AB123"], ["AB12"], ["XAB123"], ["AB1234"], ["A1234"], ["AB-123"]] }],
  sql: "-- ①\nSELECT COUNT(*) FROM T WHERE REGEXP_LIKE(CODE, '^[A-Z]{2}[[:digit:]]{3}$');\n-- ②\nSELECT COUNT(*) FROM T WHERE REGEXP_LIKE(CODE, '[A-Z]{2}[[:digit:]]{3}');",
  o: ["① 1, ② 1", "① 1, ② 3", "① 3, ② 3", "① 1, ② 4"],
  a: 1,
  why: "REGEXP_LIKE는 패턴이 문자열의 '어느 부분과든' 맞으면 TRUE다. ^(시작)와 $(끝)를 모두 붙여야 문자열 전체가 패턴과 같아야 한다. [[:digit:]]는 숫자 한 글자([0-9])를 뜻하는 POSIX 문자 클래스이고, {n}은 정확히 n번 반복이다.",
  st: [
    { t: "[원본] → 행별 판정", tb: { c: ["CODE", "① 전체 일치", "② 부분 일치", "설명"], r: [["AB123", "O", "O", "정확히 대문자 2 + 숫자 3"], ["AB12", "X", "X", "숫자가 2개뿐"], ["XAB123", "X", "O", "AB123 부분이 맞음, 시작이 X"], ["AB1234", "X", "O", "AB123 부분이 맞음, 끝에 4가 더 있음"], ["A1234", "X", "X", "대문자가 1개뿐"], ["AB-123", "X", "X", "문자와 숫자 사이에 '-'"]], hl: [2, 3] } }
  ],
  res: { c: ["①", "②"], r: [[1, 3]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE REGEXP_LIKE(CODE, '^[A-Z]{2}[[:digit:]]{3}$')), (SELECT COUNT(*) FROM T WHERE REGEXP_LIKE(CODE, '[A-Z]{2}[[:digit:]]{3}'))",
  ox: [
    "앵커 없이도 전체 일치를 검사한다고 본 경우다. REGEXP_LIKE는 부분 일치로 판단한다.",
    "정답.",
    "①에서 앵커를 무시한 경우다.",
    "AB-123도 부분 일치한다고 본 경우다. '-' 때문에 대문자 2개 바로 뒤에 숫자 3개가 오는 부분이 없다."
  ],
  trap: "LIKE는 패턴이 문자열 전체와 맞아야 하지만(LIKE 'AB%'), REGEXP_LIKE는 부분만 맞아도 된다. 전체 일치는 ^…$로 강제한다.",
  memo: "REGEXP_LIKE = 부분 일치, 전체 일치는 ^ … $"
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
  why: "+, *, {n,m} 같은 수량자는 기본이 탐욕적(Greedy)이어서 가능한 한 길게 맞춘다. C1의 '<.+>'는 첫 '<'부터 마지막 '>'까지 전부를 맞춘다. 수량자 뒤에 ?를 붙이면 게으른(Lazy, Non-greedy) 수량자가 되어 가능한 한 짧게 맞추므로 C2는 첫 '>'에서 멈춘 '<b>'다. a{2,3}은 2~3번 반복인데 탐욕적이라 3개를 가져간다.",
  st: [
    { t: "1단계: 수량자별 매칭", tb: { c: ["식", "수량자", "동작", "결과"], r: [["'<.+>'", "+ (탐욕)", "마지막 '>'까지 최대한", "<b>SQL</b><i>D</i>"], ["'<.+?>'", "+? (게으름)", "첫 '>'에서 멈춤", "<b>"], ["'a{2,3}'", "{2,3} (탐욕)", "최대 3개", "aaa"]], hl: [0, 1] } }
  ],
  res: { c: ["C1", "C2", "C3"], r: [["<b>SQL</b><i>D</i>", "<b>", "aaa"]] },
  pg: "SELECT REGEXP_SUBSTR('<b>SQL</b><i>D</i>', '<.+>'), REGEXP_SUBSTR('<b>SQL</b><i>D</i>', '<.+?>'), REGEXP_SUBSTR('aaaaa', 'a{2,3}')",
  ox: [
    "수량자가 기본적으로 짧게 맞춘다고 본 경우다. 기본은 탐욕적이다.",
    "탐욕적 매칭이 '두 번째' '>'에서 멈춘다고 본 경우다. 문자열의 마지막 '>'까지 간다.",
    "게으른 수량자도 닫는 태그까지 간다고 본 경우다. +?는 첫 '>'에서 멈춘다.",
    "정답."
  ],
  trap: "'.'은 아무 문자 한 글자이므로 '<'와 '>'도 포함한다. 그래서 '.+'는 태그를 넘어 끝까지 먹는다.",
  memo: "기본 = 탐욕(최대), 뒤에 ? = 게으름(최소)"
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
  why: "WHERE 절이 없으므로 EMP의 4행 모두가 갱신 대상이다. 각 행마다 SET 절의 연관 서브쿼리를 실행해 그 값으로 바꾸는데, 짝이 없는 3번(DEPTNO 40)과 4번(DEPTNO NULL)은 서브쿼리가 0건이라 NULL이 대입된다. 0건은 오류가 아니다. 짝이 있는 행만 바꾸려면 WHERE EXISTS (SELECT 1 FROM DEPT D WHERE D.DEPTNO = E.DEPTNO)를 덧붙인다.",
  st: [
    { t: "[원본] → 1단계: 행별 서브쿼리 결과", tb: { c: ["EMPNO", "DEPTNO", "서브쿼리", "새 DNAME"], r: [[1, 10, "SALES", "SALES"], [2, 20, "HR", "HR"], [3, 40, "0건", null], [4, null, "0건 (NULL = NULL은 UNKNOWN)", null]], hl: [2, 3] } },
    { t: "2단계: UPDATE 후 EMP", tb: { c: ["EMPNO", "DNAME"], r: [[1, "SALES"], [2, "HR"], [3, null], [4, null]], hl: [2, 3] } }
  ],
  res: { c: ["EMPNO", "DNAME"], r: [[1, "SALES"], [2, "HR"], [3, null], [4, null]] },
  pg: "UPDATE EMP E SET DNAME = (SELECT D.DNAME FROM DEPT D WHERE D.DEPTNO = E.DEPTNO); SELECT EMPNO, DNAME FROM EMP ORDER BY EMPNO",
  ox: [
    "WHERE EXISTS 조건을 붙였을 때의 결과다. 이 문장에는 WHERE 절이 없다.",
    "짝이 없으면 기존 값이 유지된다고 본 경우다. 서브쿼리 0건은 NULL로 대입된다.",
    "정답.",
    "SET 절 서브쿼리는 0건이면 NULL, 2건 이상일 때만 오류(ORA-01427)다."
  ],
  trap: "만약 DNAME에 NOT NULL 제약이 있다면 NULL 대입 때문에 문장 전체가 실패한다(ORA-01407).",
  memo: "SET = (연관 서브쿼리) + WHERE 없음 → 짝 없는 행은 NULL"
},
{
  id: "S113", s: 2, tp: "dml", lv: 3, sub: "DML",
  th: "2과목 | 연관 서브쿼리 DELETE로 중복 제거와 NULL",
  q: "다음 DELETE 문을 실행한 뒤 [T]에 남는 ID는?",
  tb: [{ n: "T", c: ["ID", "EMAIL"], r: [[1, "a@x"], [2, "b@x"], [3, "a@x"], [4, null], [5, null], [6, "a@x"]] }],
  sql: "DELETE FROM T A\n WHERE EXISTS (SELECT 1\n                 FROM T B\n                WHERE B.EMAIL = A.EMAIL\n                  AND B.ID < A.ID);",
  o: ["1, 2, 4", "1, 2", "2, 4, 5, 6", "1, 2, 4, 5"],
  a: 3,
  why: "같은 EMAIL을 가지면서 자신보다 ID가 작은 행이 있으면 지운다. 즉 EMAIL별로 가장 작은 ID만 남긴다. 그런데 EMAIL이 NULL인 4, 5번은 B.EMAIL = A.EMAIL이 NULL = NULL로 UNKNOWN이 되어 짝을 찾지 못하므로 둘 다 남는다. 서브쿼리 판정은 삭제가 시작되기 전의 데이터를 기준으로 한다(문장 수준 읽기 일관성).",
  st: [
    { t: "[원본] → 1단계: 행별 EXISTS 판정", tb: { c: ["ID", "EMAIL", "같은 EMAIL + 더 작은 ID", "삭제"], r: [[1, "a@x", "없음", "X"], [2, "b@x", "없음", "X"], [3, "a@x", "1", "O"], [4, null, "NULL 비교 → 없음", "X"], [5, null, "NULL 비교 → 없음", "X"], [6, "a@x", "1, 3", "O"]], hl: [2, 5] } },
    { t: "2단계: 남은 행", tb: { c: ["ID", "EMAIL"], r: [[1, "a@x"], [2, "b@x"], [4, null], [5, null]] } }
  ],
  res: { c: ["ID"], r: [[1], [2], [4], [5]] },
  pg: "DELETE FROM T A WHERE EXISTS (SELECT 1 FROM T B WHERE B.EMAIL = A.EMAIL AND B.ID < A.ID); SELECT ID FROM T ORDER BY ID",
  ox: [
    "NULL끼리도 같은 값으로 보아 5번을 지운 경우다. = 비교에서 NULL = NULL은 UNKNOWN이다.",
    "NULL 행을 모두 지운다고 본 경우다.",
    "부등호 방향을 반대로 읽어 큰 ID만 남긴 경우다. B.ID < A.ID이므로 작은 ID가 남는다.",
    "정답."
  ],
  trap: "GROUP BY·DISTINCT에서는 NULL끼리 한 그룹이지만, = 조건에서는 NULL이 어떤 값과도 같지 않다. 중복 제거 방법에 따라 NULL 처리가 달라진다.",
  memo: "EXISTS(같은 값 AND 더 작은 ID) 삭제 = 최소 ID만 남김, NULL은 짝 없음"
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
  why: "Oracle MERGE의 DELETE WHERE는 WHEN MATCHED로 UPDATE된 행에만 적용되며, 조건은 UPDATE 후의 값으로 판단한다. ID 1은 10 + (−10) = 0이 되어 삭제된다. ID 3은 QTY가 0이지만 SRC에 짝이 없어 MERGE가 건드리지 않았으므로 남는다. WHEN NOT MATCHED의 INSERT에도 WHERE 조건을 붙일 수 있어 QTY가 음수인 ID 5는 들어가지 않는다.",
  st: [
    { t: "[원본] → 1단계: SRC 행별 처리", tb: { c: ["SRC 행", "TGT 짝", "동작", "결과"], r: [["(1, −10)", "(1, 10)", "UPDATE → 0, DELETE WHERE 0 <= 0", "삭제"], ["(2, 3)", "(2, 5)", "UPDATE → 8, 8 <= 0 아님", "(2, 8)"], ["(4, 7)", "없음", "INSERT (7 > 0)", "(4, 7)"], ["(5, −2)", "없음", "INSERT 조건 −2 > 0 거짓", "삽입 안 함"]], hl: [0, 3] } },
    { t: "2단계: 영향 없는 행", tb: { c: ["TGT 행", "SRC 짝", "결과"], r: [["(3, 0)", "없음", "그대로 남음 (DELETE WHERE 대상 아님)"]], hl: [0] } },
    { t: "3단계: 최종 TGT", tb: { c: ["ID", "QTY"], r: [[2, 8], [3, 0], [4, 7]] }, n: "PostgreSQL MERGE에는 DELETE WHERE가 없어 검증은 'WHEN MATCHED AND T.QTY + S.QTY <= 0 THEN DELETE'로 같은 효과를 낸다." }
  ],
  res: { c: ["ID", "QTY"], r: [[2, 8], [3, 0], [4, 7]] },
  pg: "MERGE INTO TGT T USING SRC S ON (T.ID = S.ID) WHEN MATCHED AND T.QTY + S.QTY <= 0 THEN DELETE WHEN MATCHED THEN UPDATE SET QTY = T.QTY + S.QTY WHEN NOT MATCHED AND S.QTY > 0 THEN INSERT (ID, QTY) VALUES (S.ID, S.QTY); SELECT ID, QTY FROM TGT ORDER BY ID",
  ox: [
    "정답.",
    "DELETE WHERE가 TGT 전체에 적용된다고 본 경우다. MERGE로 UPDATE된 행만 대상이다.",
    "DELETE WHERE가 UPDATE 전의 값(10)으로 판단한다고 본 경우다. UPDATE 후의 값(0)으로 판단한다.",
    "NOT MATCHED의 INSERT에 붙은 WHERE 조건을 무시한 경우다."
  ],
  trap: "DELETE WHERE는 독립된 WHEN 절이 아니라 WHEN MATCHED … UPDATE에 딸린 절이다. UPDATE 없이 DELETE WHERE만 쓸 수 없다.",
  memo: "DELETE WHERE = UPDATE된 행만, UPDATE 후 값으로 판단"
},
{
  id: "S115", s: 2, tp: "dml", lv: 2, sub: "DML",
  th: "2과목 | UNIQUE의 다중 NULL과 CHECK 제약의 NULL 통과",
  q: "다음 테이블에 ①~④의 INSERT를 차례로 실행할 때 오류가 발생하는 것은? (Oracle 기준)",
  sql: "CREATE TABLE M (\n  ID    NUMBER PRIMARY KEY,\n  EMAIL VARCHAR2(30) UNIQUE,\n  AGE   NUMBER CHECK (AGE >= 0)\n);\n\n① INSERT INTO M VALUES (1, NULL, 20);\n② INSERT INTO M VALUES (2, NULL, NULL);\n③ INSERT INTO M VALUES (3, 'a@x', -1);\n④ INSERT INTO M VALUES (4, 'a@x', NULL);",
  o: ["①", "②", "③", "④"],
  a: 2,
  why: "UNIQUE 제약은 NULL이 아닌 값끼리만 중복을 검사하므로 EMAIL이 NULL인 행은 여러 개 들어갈 수 있다(②). CHECK 제약은 조건이 FALSE일 때만 거부하고, NULL과 비교해 UNKNOWN이 되면 통과시킨다(②, ④). ③은 AGE가 −1이라 AGE >= 0이 FALSE이므로 ORA-02290(체크 제약 위반)이 발생한다. ③이 실패했으므로 'a@x'는 아직 없고, ④는 정상 입력된다.",
  st: [
    { t: "문장별 판정", tb: { c: ["문장", "EMAIL UNIQUE", "AGE >= 0", "결과"], r: [["①", "NULL → 검사 안 함", "20 → TRUE", "성공"], ["②", "NULL → 중복이어도 허용", "NULL → UNKNOWN(통과)", "성공"], ["③", "'a@x' 처음", "−1 → FALSE", "실패 (ORA-02290)"], ["④", "'a@x' 처음 (③ 실패)", "NULL → UNKNOWN(통과)", "성공"]], hl: [2] } }
  ],
  pgSetup: "CREATE TABLE M (ID numeric PRIMARY KEY, EMAIL text UNIQUE, AGE numeric CHECK (AGE >= 0)); CREATE TABLE R (NO numeric, RESULT text);",
  res: { c: ["문장", "결과"], r: [[1, "OK"], [2, "OK"], [3, "FAIL"], [4, "OK"]] },
  pg: "DO $$ BEGIN INSERT INTO M VALUES (1, NULL, 20); INSERT INTO R VALUES (1, 'OK'); EXCEPTION WHEN OTHERS THEN INSERT INTO R VALUES (1, 'FAIL'); END $$; DO $$ BEGIN INSERT INTO M VALUES (2, NULL, NULL); INSERT INTO R VALUES (2, 'OK'); EXCEPTION WHEN OTHERS THEN INSERT INTO R VALUES (2, 'FAIL'); END $$; DO $$ BEGIN INSERT INTO M VALUES (3, 'a@x', -1); INSERT INTO R VALUES (3, 'OK'); EXCEPTION WHEN OTHERS THEN INSERT INTO R VALUES (3, 'FAIL'); END $$; DO $$ BEGIN INSERT INTO M VALUES (4, 'a@x', NULL); INSERT INTO R VALUES (4, 'OK'); EXCEPTION WHEN OTHERS THEN INSERT INTO R VALUES (4, 'FAIL'); END $$; SELECT NO, RESULT FROM R ORDER BY NO",
  ox: [
    "EMAIL이 NULL이어도 UNIQUE 컬럼에는 넣을 수 있다.",
    "UNIQUE는 NULL끼리 중복으로 보지 않고, CHECK는 NULL(UNKNOWN)을 통과시킨다.",
    "정답.",
    "③이 실패해 'a@x'가 없으므로 중복이 아니고, AGE NULL은 CHECK를 통과한다."
  ],
  trap: "WHERE 절은 TRUE만 통과시키지만, CHECK 제약은 FALSE만 거부한다. 같은 UNKNOWN이 정반대로 처리된다.",
  memo: "WHERE: TRUE만 통과 / CHECK: FALSE만 거부 / UNIQUE: NULL 여러 개 OK"
},
{
  id: "S116", s: 2, tp: "tcl", lv: 3, sub: "TCL",
  th: "2과목 | 같은 이름의 SAVEPOINT 재정의와 반복 ROLLBACK TO",
  q: "빈 테이블 [T]에 대해 다음 SQL을 순서대로 실행한 뒤 남아 있는 ID 값으로 옳은 것은? (Oracle 기준)",
  sql: "INSERT INTO T VALUES (1);\nSAVEPOINT SP;\nINSERT INTO T VALUES (2);\nSAVEPOINT SP;\nINSERT INTO T VALUES (3);\nROLLBACK TO SP;\nINSERT INTO T VALUES (4);\nROLLBACK TO SP;\nCOMMIT;",
  o: ["1", "1, 2, 4", "1, 2", "1, 4"],
  a: 2,
  why: "Oracle에서 이미 있는 이름으로 SAVEPOINT를 다시 만들면 앞의 저장점은 지워지고 새 위치로 옮겨진다. 따라서 SP는 INSERT 2 직후를 가리킨다. ROLLBACK TO SP는 그 저장점 이후의 작업만 취소하고 저장점 자체는 남겨 두므로, 두 번째 ROLLBACK TO SP도 정상 실행되어 INSERT 4를 취소한다.",
  st: [
    { t: "단계별 상태", tb: { c: ["명령", "T 상태", "SP 위치"], r: [["INSERT 1", "{1}", "—"], ["SAVEPOINT SP", "{1}", "1 다음"], ["INSERT 2", "{1, 2}", "1 다음"], ["SAVEPOINT SP (재정의)", "{1, 2}", "2 다음 (앞의 SP 삭제)"], ["INSERT 3", "{1, 2, 3}", "2 다음"], ["ROLLBACK TO SP", "{1, 2}", "2 다음 (유지)"], ["INSERT 4", "{1, 2, 4}", "2 다음"], ["ROLLBACK TO SP", "{1, 2}", "2 다음"], ["COMMIT", "{1, 2} 확정", "모두 해제"]], hl: [3, 7] } }
  ],
  pgSetup: "CREATE TABLE T (ID numeric);",
  res: { c: ["ID"], r: [[1], [2]] },
  pg: "BEGIN; INSERT INTO T VALUES (1); SAVEPOINT SP; INSERT INTO T VALUES (2); SAVEPOINT SP; INSERT INTO T VALUES (3); ROLLBACK TO SP; INSERT INTO T VALUES (4); ROLLBACK TO SP; COMMIT; SELECT ID FROM T ORDER BY ID",
  ox: [
    "첫 번째 SP 위치로 돌아간다고 본 경우다. 같은 이름으로 다시 만들면 새 위치로 바뀐다.",
    "ROLLBACK TO를 하면 저장점이 사라져 두 번째 ROLLBACK TO가 무효라고 본 경우다. 해당 저장점은 남는다.",
    "정답.",
    "근거 없는 조합이다. INSERT 2는 SP 이전이라 취소되지 않고, INSERT 4는 두 번째 ROLLBACK TO로 취소된다."
  ],
  trap: "ROLLBACK TO SP를 하면 SP '이후'에 만든 저장점만 사라진다. SP 자신은 남는다. (PostgreSQL은 같은 이름의 앞 저장점을 지우지 않고 남겨 두지만, ROLLBACK TO는 가장 최근 것을 쓰므로 이 문제의 결과는 같다.)",
  memo: "같은 이름 SAVEPOINT = 최근 위치로 덮어쓰기, ROLLBACK TO 후에도 SP 유지"
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
  why: "트랜잭션은 COMMIT 전이라도 자기 자신이 변경한 내용은 볼 수 있다. 다른 세션은 COMMIT 전까지 변경 내용을 볼 수 없으며, Oracle은 언두(Undo) 데이터로 변경 전 값을 보여 주는 읽기 일관성(Read Consistency)을 제공하므로 읽기 작업은 잠금 때문에 기다리지 않는다. 반면 같은 행을 변경하려는 다른 세션은 행 잠금(Row Lock)이 풀릴 때까지 대기한다.",
  st: [
    { t: "COMMIT 전 상황 정리", tb: { c: ["주체", "행동", "결과"], r: [["세션 B", "SELECT", "3000 (대기 없음, 읽기 일관성)"], ["세션 B", "같은 행 UPDATE", "대기 (행 잠금)"], ["SQL Server", "기본 AUTO COMMIT", "문장마다 자동 커밋"], ["세션 A", "SELECT", "9999 (자기 변경은 보임)"]], hl: [3] } }
  ],
  ox: [
    "옳다. Oracle에서 읽기는 쓰기를 기다리지 않고, 커밋된 변경 전 값을 읽는다.",
    "옳다. 같은 행에 대한 변경은 행 잠금 때문에 대기한다.",
    "옳다. SQL Server는 기본이 AUTO COMMIT이며, BEGIN TRANSACTION으로 명시적 트랜잭션을 열거나 IMPLICIT_TRANSACTIONS를 켜야 수동으로 커밋한다. Oracle은 DML을 자동 커밋하지 않는다.",
    "틀리다(정답). 자신의 트랜잭션 안에서는 커밋하지 않은 변경도 보인다."
  ],
  trap: "'커밋 전 데이터는 아무도 못 본다'로 외우면 틀린다. 정확히는 '다른 세션은 못 본다'이다.",
  memo: "미커밋 변경: 나 = 보임 / 남 = 안 보임(이전 값), 같은 행 변경은 대기"
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
  why: "CTAS는 SELECT 결과의 컬럼 구조(이름, 데이터 타입)와 데이터를 복사한다. 제약조건 중에서는 명시적으로 선언한 NOT NULL만 복사되고, PRIMARY KEY, UNIQUE, CHECK, FOREIGN KEY와 DEFAULT 값은 복사되지 않는다. PK 때문에 암묵적으로 생긴 NOT NULL도 복사되지 않으므로 T2.ID에는 NULL도 들어갈 수 있다.",
  st: [
    { t: "CTAS 복사 여부", tb: { c: ["항목", "T1", "T2"], r: [["컬럼명·타입·데이터", "있음", "복사"], ["NAME NOT NULL (명시)", "있음", "복사"], ["ID PRIMARY KEY", "있음", "복사 안 됨 (암묵적 NOT NULL 포함)"], ["AGE CHECK", "있음", "복사 안 됨"], ["REG_DT DEFAULT", "있음", "복사 안 됨"]], hl: [1] } }
  ],
  ox: [
    "PK는 복사되지 않는다. 필요하면 ALTER TABLE T2 ADD PRIMARY KEY (ID)로 따로 만든다.",
    "정답.",
    "CHECK 제약은 복사되지 않아 −1도 들어간다.",
    "DEFAULT는 복사되지 않아 REG_DT를 생략하면 NULL이 들어간다."
  ],
  trap: "구조만 복사하려면 CREATE TABLE T2 AS SELECT * FROM T1 WHERE 1 = 2처럼 항상 거짓인 조건을 준다. 이때도 제약 복사 규칙은 같다.",
  memo: "CTAS = 구조 + 데이터 + (명시적) NOT NULL만"
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
  why: "시스템 권한(CREATE TABLE 등)을 WITH ADMIN OPTION으로 받은 사용자가 다른 사용자에게 다시 준 경우, 처음 받은 사용자의 권한을 회수해도 그가 나눠 준 권한은 연쇄 회수되지 않는다. C의 CREATE TABLE 권한은 그대로 남는다. 반대로 객체 권한을 WITH GRANT OPTION으로 받아 다시 준 경우에는 연쇄 회수된다.",
  st: [
    { t: "옵션 비교", tb: { c: ["구분", "대상 권한", "다시 부여", "중간 사용자 REVOKE 시"], r: [["WITH ADMIN OPTION", "시스템 권한, ROLE", "가능", "하위 사용자 권한 유지"], ["WITH GRANT OPTION", "객체 권한", "가능", "하위 사용자 권한 연쇄 회수"]], hl: [0] } }
  ],
  ox: [
    "옳다. ROLE은 권한 관리를 쉽게 하려고 쓰는 권한 묶음이다.",
    "옳다. PUBLIC은 모든 사용자를 뜻하는 특수한 대상이다.",
    "옳다. ROLE 안에 ROLE을 넣을 수 있고, CONNECT·RESOURCE·DBA는 기본 제공 ROLE이다.",
    "틀리다(정답). ADMIN OPTION으로 나눠 준 시스템 권한은 연쇄 회수되지 않는다."
  ],
  trap: "ADMIN(시스템) = 연쇄 회수 없음, GRANT(객체) = 연쇄 회수. 이름이 비슷해 반대로 외우기 쉽다.",
  memo: "ROLE = 권한 묶음 / PUBLIC = 전체 사용자 / ADMIN OPTION은 연쇄 회수 없음"
},
{
  id: "S120", s: 2, tp: "ddl", lv: 3, sub: "DCL",
  th: "2과목 | 다른 스키마 테이블 접근에 필요한 권한과 이름",
  q: "Oracle에서 사용자 B는 CREATE SESSION 권한만 가지고 있고 B 소유의 EMP 테이블은 없다. A가 다음 명령을 실행한 뒤, B가 실행해 성공하는 문장은? (동의어(Synonym)는 없다.)",
  sql: "-- A 계정 (EMP 테이블 소유자)\nGRANT SELECT ON EMP TO B;\n\n-- B 계정\n① SELECT * FROM A.EMP;\n② SELECT * FROM EMP;\n③ UPDATE A.EMP SET SAL = 0;\n④ GRANT SELECT ON A.EMP TO C;",
  o: ["①", "②", "③", "④"],
  a: 0,
  why: "다른 사용자 소유의 테이블은 '소유자.테이블명'으로 지정해야 한다. 스키마명을 생략하면 자신의 스키마(B.EMP)에서 찾으므로, 동의어가 없으면 ORA-00942(테이블 또는 뷰가 존재하지 않음)가 난다. 객체 권한은 받은 작업만 허용하므로 SELECT만 받은 B는 UPDATE를 할 수 없고(ORA-01031 권한 불충분), WITH GRANT OPTION 없이 받은 권한은 남에게 다시 줄 수 없다.",
  st: [
    { t: "문장별 결과", tb: { c: ["문장", "필요 조건", "B의 상태", "결과"], r: [["① SELECT A.EMP", "SELECT 권한", "있음", "성공"], ["② SELECT EMP", "B.EMP 또는 동의어", "없음", "ORA-00942"], ["③ UPDATE A.EMP", "UPDATE 권한", "없음", "ORA-01031"], ["④ GRANT … TO C", "WITH GRANT OPTION", "없음", "ORA-01031"]], hl: [0] } }
  ],
  ox: [
    "정답.",
    "스키마명을 생략하면 B 자신의 EMP를 찾는다. 권한이 있어도 이름을 찾지 못해 오류가 난다.",
    "SELECT 권한만으로는 UPDATE할 수 없다. 객체 권한은 작업별로 따로 부여한다.",
    "WITH GRANT OPTION 없이 받은 객체 권한은 다른 사용자에게 다시 줄 수 없다."
  ],
  trap: "권한(GRANT)과 이름 찾기(스키마·동의어)는 별개다. 권한이 있어도 'A.'을 빼면 오류가 난다.",
  memo: "남의 테이블 = 소유자.테이블 + 해당 객체 권한"
}
);
