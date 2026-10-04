// 제2과목 · SQL 기본 및 활용 (A: 집계·NULL·조인·그룹 함수·윈도우 함수)
// pg: 검증용 PostgreSQL 쿼리 (tools/verify.mjs 가 tb 를 그대로 테이블로 만들고 실행해 res 와 대조한다)
(window.QB = window.QB || []).push(
{
  id: "S01", s: 2, tp: "agg", lv: 1,
  th: "2과목 | COUNT(*)와 COUNT(컬럼)의 NULL 처리",
  q: "다음 [T] 테이블에 대해 SQL을 실행한 결과로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "DEPT", "BONUS"], r: [[1, 10, 100], [2, 10, null], [3, 20, 200], [4, null, 200], [5, 20, null], [6, 30, null]] }],
  sql: "SELECT COUNT(*), COUNT(DEPT), COUNT(BONUS), COUNT(DISTINCT BONUS)\n  FROM T;",
  o: ["6, 5, 3, 2", "6, 6, 3, 2", "6, 5, 3, 3", "6, 5, 6, 2"],
  a: 0,
  why: "COUNT(*)는 행 자체를 세므로 NULL 여부와 상관없이 전체 행 수를 돌려준다. COUNT(컬럼)은 그 컬럼 값이 NULL인 행을 빼고 센다. COUNT(DISTINCT 컬럼)은 NULL을 뺀 뒤 중복까지 제거하고 센다.",
  st: [
    { t: "1단계: 컬럼별 NULL 표시", tb: { c: ["ID", "DEPT", "BONUS"], r: [[1, 10, 100], [2, 10, null], [3, 20, 200], [4, null, 200], [5, 20, null], [6, 30, null]] } },
    { t: "2단계: 함수별 계산", tb: { c: ["식", "대상 값", "결과"], r: [
      ["COUNT(*)", "행 6개", 6],
      ["COUNT(DEPT)", "10, 10, 20, 20, 30 (NULL 1개 제외)", 5],
      ["COUNT(BONUS)", "100, 200, 200 (NULL 3개 제외)", 3],
      ["COUNT(DISTINCT BONUS)", "{100, 200}", 2]
    ] } }
  ],
  res: { c: ["COUNT(*)", "COUNT(DEPT)", "COUNT(BONUS)", "COUNT(DISTINCT BONUS)"], r: [[6, 5, 3, 2]] },
  pg: "SELECT COUNT(*), COUNT(DEPT), COUNT(BONUS), COUNT(DISTINCT BONUS) FROM T",
  ox: ["정답.", "COUNT(DEPT)는 NULL인 4번 행을 세지 않으므로 6이 아니라 5다.", "DISTINCT는 중복을 지우므로 200은 한 번만 센다. 3이 아니라 2다.", "COUNT(BONUS)는 NULL 3개를 뺀 3이다. 6은 COUNT(*)의 값이다."],
  trap: "COUNT(DISTINCT BONUS)에서 NULL을 하나의 값으로 셀 것 같지만, 집계 함수는 NULL을 먼저 버린 뒤 중복을 제거한다.",
  memo: "COUNT(*)만 NULL 포함"
},
{
  id: "S02", s: 2, tp: "agg", lv: 2,
  th: "2과목 | AVG(컬럼) vs AVG(NVL(컬럼, 0)) — 분모 차이",
  q: "S01과 같은 [T] 테이블에 대해 다음 SQL을 실행한 결과로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "DEPT", "BONUS"], r: [[1, 10, 100], [2, 10, null], [3, 20, 200], [4, null, 200], [5, 20, null], [6, 30, null]] }],
  sql: "SELECT SUM(BONUS)               AS S,\n       ROUND(AVG(BONUS))        AS A1,\n       ROUND(AVG(NVL(BONUS, 0))) AS A2\n  FROM T;",
  o: ["500, 167, 83", "500, 83, 83", "500, 167, 167", "NULL, 167, 83"],
  a: 0,
  why: "AVG(BONUS)는 NULL 행을 분자·분모에서 모두 빼므로 500 ÷ 3이다. AVG(NVL(BONUS, 0))은 NULL을 0으로 바꾼 뒤 평균을 내므로 6개 행이 모두 분모에 들어가 500 ÷ 6이 된다. NVL(A, B)은 A가 NULL이면 B를 돌려주는 함수다.",
  st: [
    { t: "1단계: NVL 적용 전후", tb: { c: ["ID", "BONUS", "NVL(BONUS, 0)"], r: [[1, 100, 100], [2, null, 0], [3, 200, 200], [4, 200, 200], [5, null, 0], [6, null, 0]] } },
    { t: "2단계: 분자·분모", tb: { c: ["식", "분자", "분모", "값", "ROUND"], r: [
      ["AVG(BONUS)", 500, 3, "166.67", 167],
      ["AVG(NVL(BONUS, 0))", 500, 6, "83.33", 83]
    ] } }
  ],
  res: { c: ["S", "A1", "A2"], r: [[500, 167, 83]] },
  pg: "SELECT SUM(BONUS) S, ROUND(AVG(BONUS)) A1, ROUND(AVG(COALESCE(BONUS,0))) A2 FROM T",
  ox: ["정답.", "AVG(BONUS)는 NULL을 뺀 3개로 나누므로 83이 아니라 167이다.", "NVL로 0을 채우면 분모가 6이 되므로 167이 아니라 83이다.", "SUM은 NULL을 건너뛰고 더하므로 NULL이 아니라 500이다."],
  trap: "SUM은 NULL을 무시하지만 결과가 NULL이 되지는 않는다. 모든 값이 NULL이거나 대상 행이 없을 때만 SUM이 NULL이다.",
  memo: "AVG(col) = SUM ÷ COUNT(col), AVG(NVL(col,0)) = SUM ÷ COUNT(*)"
},
{
  id: "S03", s: 2, tp: "notin", lv: 3,
  th: "2과목 | 다중행 서브쿼리와 NOT IN의 NULL 처리",
  q: "다음 [EMP] 테이블에서 '부하 직원이 없는 사원'을 찾으려고 아래 SQL을 실행하였다. 결과 건수는?",
  tb: [{ n: "EMP", c: ["EMPNO", "ENAME", "MGR"], r: [[1001, "KING", null], [1002, "JONES", 1001], [1003, "SCOTT", 1002], [1004, "ADAMS", 1003], [1005, "FORD", 1002]] }],
  sql: "SELECT COUNT(*)\n  FROM EMP\n WHERE EMPNO NOT IN (SELECT MGR FROM EMP);",
  o: ["0건", "2건", "3건", "5건"],
  a: 0,
  why: "NOT IN (a, b, NULL)은 'EMPNO <> a AND EMPNO <> b AND EMPNO <> NULL'로 풀린다. EMPNO <> NULL은 3진 논리에서 UNKNOWN이다. TRUE AND UNKNOWN = UNKNOWN, FALSE AND UNKNOWN = FALSE이므로 어떤 행도 TRUE가 될 수 없다. WHERE 절은 TRUE인 행만 통과시키므로 결과는 0건이다.",
  st: [
    { t: "1단계: 서브쿼리 결과 (MGR 목록)", tb: { c: ["MGR"], r: [[null], [1001], [1002], [1003], [1002]] }, n: "NULL이 하나 섞여 있다." },
    { t: "2단계: 행마다 NOT IN 평가", tb: { c: ["EMPNO", "<>1001", "<>1002", "<>1003", "<>NULL", "AND 결과"], r: [
      [1001, "FALSE", "TRUE", "TRUE", "UNKNOWN", "FALSE"],
      [1002, "TRUE", "FALSE", "TRUE", "UNKNOWN", "FALSE"],
      [1003, "TRUE", "TRUE", "FALSE", "UNKNOWN", "FALSE"],
      [1004, "TRUE", "TRUE", "TRUE", "UNKNOWN", "UNKNOWN"],
      [1005, "TRUE", "TRUE", "TRUE", "UNKNOWN", "UNKNOWN"]
    ], hl: [3, 4] }, n: "1004와 1005는 NULL만 없었다면 TRUE였지만 UNKNOWN이 되어 걸러진다." }
  ],
  res: { c: ["COUNT(*)"], r: [[0]] },
  pg: "SELECT COUNT(*) FROM EMP WHERE EMPNO NOT IN (SELECT MGR FROM EMP)",
  ox: ["정답. 서브쿼리에 NULL이 있으면 NOT IN은 항상 공집합이다.", "NULL이 없었다면 나올 값(ADAMS, FORD)이다. 실제로는 UNKNOWN 때문에 걸러진다.", "근거 없는 값이다.", "전체 건수다. NOT IN이 아무것도 거르지 못한다고 착각한 경우다."],
  trap: "출제자는 '부하 직원이 없는 사원은 2명'이라는 상식적인 답을 보기에 넣어 둔다. 서브쿼리 컬럼에 NULL이 있는지부터 확인하자.",
  memo: "NOT IN + NULL = 0건 / 해결: IS NOT NULL 조건 또는 NOT EXISTS"
},
{
  id: "S04", s: 2, tp: "notin", lv: 3,
  th: "2과목 | NOT IN · NOT EXISTS · 아우터 조인 동치 비교",
  q: "S03과 같은 [EMP] 테이블에서 다음 SQL 중 결과 건수가 나머지 셋과 다른 것은?",
  tb: [{ n: "EMP", c: ["EMPNO", "ENAME", "MGR"], r: [[1001, "KING", null], [1002, "JONES", 1001], [1003, "SCOTT", 1002], [1004, "ADAMS", 1003], [1005, "FORD", 1002]] }],
  sql: "① SELECT * FROM EMP A\n   WHERE A.EMPNO NOT IN (SELECT MGR FROM EMP WHERE MGR IS NOT NULL);\n\n② SELECT * FROM EMP A\n   WHERE NOT EXISTS (SELECT 1 FROM EMP B WHERE B.MGR = A.EMPNO);\n\n③ SELECT A.* FROM EMP A LEFT OUTER JOIN EMP B\n     ON B.MGR = A.EMPNO\n   WHERE B.EMPNO IS NULL;\n\n④ SELECT * FROM EMP A\n   WHERE A.EMPNO NOT IN (SELECT MGR FROM EMP);",
  o: ["①", "②", "③", "④"],
  a: 3,
  why: "①은 서브쿼리에서 NULL을 미리 제거했고, ②의 NOT EXISTS는 '조건에 맞는 행이 존재하는가'만 따지므로 NULL 비교가 UNKNOWN이 되어도 '존재하지 않음'으로 처리된다. ③은 부하 직원과 조인되지 않은(B쪽이 NULL로 채워진) 행만 남기는 안티 조인이다. ①②③은 모두 ADAMS, FORD 2건이고, ④만 NULL 때문에 0건이다.",
  st: [
    { t: "③ 아우터 조인 중간 결과", tb: { c: ["A.EMPNO", "A.ENAME", "B.EMPNO(부하)"], r: [[1001, "KING", 1002], [1002, "JONES", 1003], [1002, "JONES", 1005], [1003, "SCOTT", 1004], [1004, "ADAMS", null], [1005, "FORD", null]], hl: [4, 5] }, n: "B.EMPNO IS NULL → ADAMS, FORD" },
    { t: "보기별 건수", tb: { c: ["SQL", "건수"], r: [["①", 2], ["②", 2], ["③", 2], ["④", 0]], hl: [3] } }
  ],
  res: { c: ["①", "②", "③", "④"], r: [[2, 2, 2, 0]] },
  pg: "SELECT (SELECT COUNT(*) FROM EMP A WHERE A.EMPNO NOT IN (SELECT MGR FROM EMP WHERE MGR IS NOT NULL)),(SELECT COUNT(*) FROM EMP A WHERE NOT EXISTS (SELECT 1 FROM EMP B WHERE B.MGR=A.EMPNO)),(SELECT COUNT(*) FROM EMP A LEFT JOIN EMP B ON B.MGR=A.EMPNO WHERE B.EMPNO IS NULL),(SELECT COUNT(*) FROM EMP A WHERE A.EMPNO NOT IN (SELECT MGR FROM EMP))",
  ox: ["NULL을 걸렀으므로 2건이다.", "NOT EXISTS는 NULL의 영향을 받지 않아 2건이다.", "안티 조인으로 2건이다.", "정답. 서브쿼리에 NULL이 섞여 0건이다."],
  trap: "NOT EXISTS와 NOT IN이 '항상 같다'고 외우면 틀린다. 서브쿼리 컬럼에 NULL이 있을 때만 둘의 결과가 달라진다.",
  memo: "NULL이 있을 땐 NOT EXISTS ≠ NOT IN"
},
{
  id: "S05", s: 2, tp: "basic", lv: 1,
  th: "2과목 | SELECT 논리적 실행 순서와 별칭(Alias)",
  q: "다음 중 오류가 발생하는 SQL은? (Oracle 기준)",
  sql: "① SELECT ENAME, SAL * 12 AS ANNUAL FROM EMP ORDER BY ANNUAL;\n② SELECT ENAME, SAL * 12 AS ANNUAL FROM EMP WHERE ANNUAL > 30000;\n③ SELECT DEPTNO, SUM(SAL) AS TOT FROM EMP GROUP BY DEPTNO ORDER BY TOT DESC;\n④ SELECT DEPTNO, SUM(SAL) FROM EMP GROUP BY DEPTNO HAVING SUM(SAL) > 5000;",
  o: ["①", "②", "③", "④"],
  a: 1,
  why: "SELECT 문은 FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY(FWGHSO) 순서로 처리된다. 별칭 ANNUAL은 5단계 SELECT에서 만들어지므로, 2단계 WHERE가 실행될 때는 아직 존재하지 않는다. 그래서 ②는 ORA-00904(부적합한 식별자) 오류가 난다. 6단계 ORDER BY는 SELECT 다음이므로 별칭을 쓸 수 있다.",
  st: [
    { t: "논리적 처리 순서", tb: { c: ["순서", "절", "SELECT 별칭 사용"], r: [["1", "FROM", "불가"], ["2", "WHERE", "불가"], ["3", "GROUP BY", "불가"], ["4", "HAVING", "불가"], ["5", "SELECT", "여기서 별칭 생성"], ["6", "ORDER BY", "가능"]], hl: [1] } }
  ],
  ox: ["ORDER BY는 SELECT 이후라 별칭을 쓸 수 있다.", "정답. WHERE에서 SELECT 별칭은 아직 존재하지 않는다.", "ORDER BY에서 집계 결과의 별칭을 쓰는 것은 정상이다.", "HAVING에 집계 함수를 그대로 쓰는 것은 정상이다."],
  trap: "HAVING에서도 별칭(TOT)은 쓸 수 없다(SQLD·Oracle 21c 이하 기준). HAVING은 4단계로 SELECT보다 먼저다.",
  memo: "F·W·G·H·S·O — 별칭은 O(ORDER BY)에서만"
},
{
  id: "S06", s: 2, tp: "agg", lv: 2,
  th: "2과목 | GROUP BY 규칙 — 그룹핑 컬럼과 집계 함수",
  q: "다음 중 오류가 발생하는 SQL은?",
  sql: "① SELECT DEPTNO, COUNT(*) FROM EMP GROUP BY DEPTNO HAVING COUNT(*) >= 2;\n② SELECT COUNT(*) FROM EMP HAVING COUNT(*) > 0;\n③ SELECT DEPTNO, JOB, MAX(SAL) FROM EMP GROUP BY DEPTNO;\n④ SELECT MAX(SAL) FROM EMP GROUP BY DEPTNO;",
  o: ["①", "②", "③", "④"],
  a: 2,
  why: "GROUP BY를 쓰면 SELECT 절에는 그룹핑 컬럼이나 집계 함수만 올 수 있다. 한 그룹(DEPTNO) 안에 JOB 값이 여러 개일 수 있는데 그중 무엇을 출력할지 정할 수 없기 때문이다(ORA-00979). 반대로 그룹핑 컬럼을 SELECT에 꼭 써야 하는 것은 아니다(④).",
  ox: ["정상. HAVING에서 집계 조건을 쓴다.", "정상. GROUP BY 없이 HAVING을 쓰면 테이블 전체를 하나의 그룹으로 본다.", "정답. JOB은 그룹핑 컬럼도 아니고 집계 함수 안에도 없다.", "정상. 부서별 최대 급여만 출력하며, 부서 번호를 생략해도 된다."],
  trap: "②처럼 GROUP BY 없는 HAVING은 어색해 보이지만 문법상 허용된다.",
  memo: "SELECT 절 = GROUP BY 컬럼 + 집계 함수"
},
{
  id: "S07", s: 2, tp: "nullfn", lv: 1,
  th: "2과목 | NULL 관련 함수 (NVL · NVL2 · NULLIF · COALESCE)",
  q: "다음 SQL의 실행 결과로 옳은 것은? (Oracle 기준)",
  sql: "SELECT NVL(NULL, 0)            AS C1,\n       NVL2(NULL, 'A', 'B')     AS C2,\n       NULLIF(10, 10)           AS C3,\n       COALESCE(NULL, NULL, 'Z') AS C4\n  FROM DUAL;",
  o: ["0, B, NULL, Z", "0, A, NULL, Z", "0, B, 10, Z", "NULL, B, NULL, Z"],
  a: 0,
  why: "NVL(A, B): A가 NULL이면 B. NVL2(A, B, C): A가 NULL이 아니면 B, NULL이면 C. NULLIF(A, B): A와 B가 같으면 NULL, 다르면 A. COALESCE(A, B, …): 왼쪽부터 처음으로 NULL이 아닌 값.",
  st: [
    { t: "함수별 평가", tb: { c: ["식", "판단", "결과"], r: [["NVL(NULL, 0)", "첫 인자가 NULL", "0"], ["NVL2(NULL, 'A', 'B')", "첫 인자가 NULL → 세 번째", "B"], ["NULLIF(10, 10)", "두 값이 같음", null], ["COALESCE(NULL, NULL, 'Z')", "처음 나오는 NOT NULL", "Z"]] } }
  ],
  res: { c: ["C1", "C2", "C3", "C4"], r: [[0, "B", null, "Z"]] },
  pg: "SELECT COALESCE(NULL,0) C1, CASE WHEN NULL IS NOT NULL THEN 'A' ELSE 'B' END C2, NULLIF(10,10) C3, COALESCE(NULL,NULL,'Z') C4",
  ox: ["정답.", "NVL2는 NULL이면 세 번째 인자(B)를 돌려준다.", "NULLIF는 두 값이 같으면 NULL이다.", "NVL(NULL, 0)은 0이다."],
  trap: "NVL2의 인자 순서(NOT NULL일 때 값이 먼저)를 거꾸로 외우는 실수가 많다.",
  memo: "NVL2(식, 있으면, 없으면) / NULLIF(같으면 NULL)"
},
{
  id: "S08", s: 2, tp: "join", lv: 3,
  th: "2과목 | LEFT OUTER JOIN 후 WHERE 조건과 NULL",
  q: "다음 SQL의 결과 건수는?",
  tb: [
    { n: "EMP", c: ["ENAME", "DEPTNO"], r: [["A", 10], ["B", 20], ["C", 30], ["D", null]] },
    { n: "DEPT", c: ["DEPTNO", "LOC"], r: [[10, "SEOUL"], [20, "BUSAN"], [40, "DAEGU"]] }
  ],
  sql: "SELECT E.ENAME, D.LOC\n  FROM EMP E LEFT OUTER JOIN DEPT D\n    ON E.DEPTNO = D.DEPTNO\n WHERE D.LOC <> 'BUSAN';",
  o: ["1건", "2건", "3건", "4건"],
  a: 0,
  why: "LEFT OUTER JOIN은 먼저 EMP의 모든 행을 남기고, 짝이 없는 행의 DEPT 쪽 컬럼을 NULL로 채운다. 그다음 WHERE가 조인 결과에 적용된다. C와 D의 LOC는 NULL이므로 'NULL <> BUSAN'은 UNKNOWN이 되어 탈락한다. 결국 아우터 조인으로 살려 둔 행이 WHERE에서 다시 지워져 내부 조인처럼 동작한다.",
  st: [
    { t: "1단계: LEFT OUTER JOIN 결과", tb: { c: ["E.ENAME", "E.DEPTNO", "D.LOC"], r: [["A", 10, "SEOUL"], ["B", 20, "BUSAN"], ["C", 30, null], ["D", null, null]] }, n: "C(30번은 DEPT에 없음), D(DEPTNO가 NULL)는 LOC가 NULL로 채워진다." },
    { t: "2단계: WHERE D.LOC <> 'BUSAN' 평가", tb: { c: ["E.ENAME", "D.LOC", "평가"], r: [["A", "SEOUL", "TRUE"], ["B", "BUSAN", "FALSE"], ["C", null, "UNKNOWN"], ["D", null, "UNKNOWN"]], hl: [0] } }
  ],
  res: { c: ["ENAME", "LOC"], r: [["A", "SEOUL"]] },
  pg: "SELECT E.ENAME, D.LOC FROM EMP E LEFT OUTER JOIN DEPT D ON E.DEPTNO = D.DEPTNO WHERE D.LOC <> 'BUSAN'",
  ox: ["정답. A 한 건만 TRUE다.", "C 또는 D가 살아남는다고 본 경우다. NULL 비교는 UNKNOWN이다.", "BUSAN만 빠진다고 생각한 경우다. NULL인 C, D도 함께 빠진다.", "WHERE 조건이 아무것도 거르지 않는다고 본 경우다."],
  trap: "조건을 ON 절로 옮기면(ON E.DEPTNO = D.DEPTNO AND D.LOC <> 'BUSAN') EMP 4행이 모두 남는다. ON은 '붙일지 말지', WHERE는 '남길지 말지'를 정한다.",
  memo: "아우터 조인 + WHERE(안쪽 테이블 조건) = 사실상 이너 조인"
},
{
  id: "S09", s: 2, tp: "join", lv: 3,
  th: "2과목 | 아우터 조인의 ON 절 추가 조건",
  q: "S08과 같은 테이블에 대해 다음 SQL을 실행했을 때 C1, C2 값은?",
  tb: [
    { n: "EMP", c: ["ENAME", "DEPTNO"], r: [["A", 10], ["B", 20], ["C", 30], ["D", null]] },
    { n: "DEPT", c: ["DEPTNO", "LOC"], r: [[10, "SEOUL"], [20, "BUSAN"], [40, "DAEGU"]] }
  ],
  sql: "SELECT COUNT(*) AS C1, COUNT(D.LOC) AS C2\n  FROM EMP E LEFT OUTER JOIN DEPT D\n    ON E.DEPTNO = D.DEPTNO\n   AND D.LOC = 'SEOUL';",
  o: ["4, 1", "1, 1", "4, 4", "3, 1"],
  a: 0,
  why: "ON 절의 조건은 '어떤 DEPT 행을 붙일 것인가'만 결정한다. LEFT OUTER JOIN에서 왼쪽(EMP) 행은 짝이 없어도 무조건 남으므로 결과는 항상 EMP 행 수(4)다. 조건을 모두 만족해 DEPT가 붙은 행은 A 하나뿐이다.",
  st: [
    { t: "1단계: 행마다 붙일 DEPT 찾기", tb: { c: ["ENAME", "DEPTNO 일치", "LOC='SEOUL'", "붙는 LOC"], r: [["A", "10=10", "O", "SEOUL"], ["B", "20=20", "X (BUSAN)", null], ["C", "없음", "-", null], ["D", "NULL 비교 불가", "-", null]], hl: [0] } },
    { t: "2단계: 집계", tb: { c: ["식", "결과"], r: [["COUNT(*)", 4], ["COUNT(D.LOC)", 1]] } }
  ],
  res: { c: ["C1", "C2"], r: [[4, 1]] },
  pg: "SELECT COUNT(*) C1, COUNT(D.LOC) C2 FROM EMP E LEFT OUTER JOIN DEPT D ON E.DEPTNO = D.DEPTNO AND D.LOC = 'SEOUL'",
  ox: ["정답.", "ON 조건을 WHERE처럼 생각한 경우다. 왼쪽 행은 사라지지 않는다.", "COUNT(D.LOC)는 NULL을 세지 않는다.", "D(DEPTNO NULL)도 왼쪽 테이블 행이므로 남는다."],
  trap: "S08과 짝으로 외우자. 같은 조건이라도 ON에 있으면 행 수 유지, WHERE에 있으면 행이 줄어든다.",
  memo: "ON = 붙일지, WHERE = 남길지"
},
{
  id: "S10", s: 2, tp: "join", lv: 2,
  th: "2과목 | Oracle (+) 표기를 ANSI 조인으로 바꾸기",
  q: "다음 Oracle SQL과 결과가 같은 ANSI(American National Standards Institute, 미국 표준 협회) 표준 SQL은?",
  sql: "SELECT E.ENAME, D.DNAME\n  FROM EMP E, DEPT D\n WHERE E.DEPTNO(+) = D.DEPTNO;",
  o: [
    "FROM EMP E LEFT OUTER JOIN DEPT D ON E.DEPTNO = D.DEPTNO",
    "FROM EMP E RIGHT OUTER JOIN DEPT D ON E.DEPTNO = D.DEPTNO",
    "FROM EMP E FULL OUTER JOIN DEPT D ON E.DEPTNO = D.DEPTNO",
    "FROM EMP E INNER JOIN DEPT D ON E.DEPTNO = D.DEPTNO"
  ],
  a: 1,
  why: "(+)는 '모자란 쪽', 즉 짝이 없을 때 NULL로 채워지는 쪽에 붙인다. E 쪽에 (+)가 있으므로 EMP가 NULL로 채워지고 DEPT의 모든 행이 보존된다. FROM 절에서 EMP가 왼쪽, DEPT가 오른쪽이므로 RIGHT OUTER JOIN이다. 'DEPT D LEFT OUTER JOIN EMP E'로 써도 같다.",
  st: [
    { t: "읽는 법", tb: { c: ["표기", "보존되는 테이블", "NULL로 채워지는 테이블"], r: [["E.DEPTNO(+) = D.DEPTNO", "DEPT", "EMP"], ["E.DEPTNO = D.DEPTNO(+)", "EMP", "DEPT"]], hl: [0] } }
  ],
  ox: ["EMP를 보존하는 조인이다. (+) 위치가 반대다.", "정답. DEPT가 보존된다.", "Oracle (+)로는 FULL OUTER JOIN을 표현할 수 없다.", "(+)가 있으면 아우터 조인이다."],
  trap: "(+)가 붙은 쪽이 '기준'이라고 반대로 외우면 틀린다. (+)는 '더해 주는(NULL을 채워 주는)' 쪽이다.",
  memo: "(+) 붙은 쪽 = NULL 채워지는 쪽 = 기준 아님"
},
{
  id: "S11", s: 2, tp: "join", lv: 3,
  th: "2과목 | FULL OUTER JOIN 결과 건수와 NULL 키",
  q: "다음 두 테이블을 FULL OUTER JOIN 했을 때 결과 행 수는?",
  tb: [
    { n: "T1", c: ["A"], r: [[1], [2], [2], [null]] },
    { n: "T2", c: ["A"], r: [[2], [3], [null]] }
  ],
  sql: "SELECT *\n  FROM T1 FULL OUTER JOIN T2\n    ON T1.A = T2.A;",
  o: ["4", "5", "6", "7"],
  a: 2,
  why: "FULL OUTER JOIN = (매칭된 행) + (T1에서 짝이 없는 행) + (T2에서 짝이 없는 행)이다. NULL = NULL은 TRUE가 아니라 UNKNOWN이므로 양쪽의 NULL끼리는 조인되지 않고 각각 따로 남는다.",
  st: [
    { t: "1단계: 매칭", tb: { c: ["T1.A", "T2.A"], r: [[2, 2], [2, 2]] }, n: "T1의 2가 두 개이므로 T2의 2와 각각 붙어 2행" },
    { t: "2단계: 짝 없는 행", tb: { c: ["출처", "T1.A", "T2.A"], r: [["T1만", 1, null], ["T1만", null, null], ["T2만", null, 3], ["T2만", null, null]] } },
    { t: "3단계: 합계", n: "2 + 2 + 2 = 6행" }
  ],
  res: { c: ["COUNT(*)"], r: [[6]] },
  pg: "SELECT COUNT(*) FROM T1 FULL OUTER JOIN T2 ON T1.A = T2.A",
  ox: ["NULL끼리 조인된다고 보고 중복도 빠뜨린 경우다.", "NULL끼리 한 번 조인된다고 본 경우(1행 감소)다.", "정답.", "근거 없는 값이다."],
  trap: "NULL끼리 같다고 보면 5가 나온다. 조인 조건에서 NULL은 절대 매칭되지 않는다.",
  memo: "FULL = 매칭 + 왼쪽만 + 오른쪽만, NULL은 매칭 불가"
},
{
  id: "S12", s: 2, tp: "join", lv: 2,
  th: "2과목 | NATURAL JOIN · USING 절의 접두사 제약",
  q: "EMP와 DEPT 테이블의 공통 컬럼이 DEPTNO 하나뿐일 때, 다음 중 오류가 발생하는 SQL은?",
  sql: "① SELECT DEPTNO, ENAME, DNAME FROM EMP NATURAL JOIN DEPT;\n② SELECT E.DEPTNO, ENAME FROM EMP E NATURAL JOIN DEPT D;\n③ SELECT DEPTNO, ENAME FROM EMP E JOIN DEPT D USING (DEPTNO);\n④ SELECT E.DEPTNO, E.ENAME FROM EMP E JOIN DEPT D ON E.DEPTNO = D.DEPTNO;",
  o: ["①", "②", "③", "④"],
  a: 1,
  why: "NATURAL JOIN과 USING 절은 공통 컬럼을 하나로 합쳐 출력한다. 합쳐진 컬럼은 더 이상 EMP 것도 DEPT 것도 아니므로 테이블 별칭(접두사)을 붙일 수 없다. ②는 E.DEPTNO라고 써서 ORA-25155(NATURAL 조인에 사용된 열은 식별자를 가질 수 없음) 오류가 난다.",
  ox: ["정상. 공통 컬럼에 접두사를 붙이지 않았다.", "정답. 공통 컬럼에 E. 접두사를 붙였다.", "정상. USING 컬럼에도 접두사를 붙이지 않았다.", "정상. ON 절 조인은 공통 컬럼이 따로 존재하므로 접두사가 필요하다."],
  trap: "ON 절 조인에서는 오히려 접두사가 없으면 '열의 정의가 애매함'(ORA-00918) 오류가 난다. NATURAL·USING과 ON의 규칙이 정반대다.",
  memo: "NATURAL·USING = 접두사 금지 / ON = 접두사 필요"
},
{
  id: "S13", s: 2, tp: "join", lv: 2,
  th: "2과목 | 카테시안 곱과 비등가 조인",
  q: "다음 SQL의 결과로 옳은 것은?",
  tb: [
    { n: "A", c: ["X"], r: [[1], [2], [3]] },
    { n: "B", c: ["Y"], r: [[1], [1], [2], [null]] }
  ],
  sql: "SELECT COUNT(*)\n  FROM A, B\n WHERE A.X >= B.Y;",
  o: ["6", "8", "9", "12"],
  a: 1,
  why: "조인 조건 없이 FROM에 두 테이블을 나열하면 먼저 모든 조합(카테시안 곱, 3 × 4 = 12행)이 만들어지고, WHERE가 그중 조건을 만족하는 행만 남긴다. 등호가 아닌 >= 로 조인하는 것이 비등가 조인이다. B.Y가 NULL인 조합은 비교 결과가 UNKNOWN이라 모두 빠진다.",
  st: [
    { t: "1단계: 카테시안 곱 12행을 B.Y 기준으로 정리", tb: { c: ["B.Y", "A.X >= B.Y 인 X", "건수"], r: [[1, "1, 2, 3", 3], [1, "1, 2, 3", 3], [2, "2, 3", 2], [null, "없음 (UNKNOWN)", 0]] } },
    { t: "2단계: 합계", n: "3 + 3 + 2 + 0 = 8" }
  ],
  res: { c: ["COUNT(*)"], r: [[8]] },
  pg: "SELECT COUNT(*) FROM A, B WHERE A.X >= B.Y",
  ox: ["B.Y = 2인 조합(X = 2, 3의 2건)을 빠뜨린 경우다.", "정답.", "NULL 행에서도 3행이 나온다고 본 경우다.", "WHERE 없는 카테시안 곱의 건수다."],
  trap: "B에 같은 값(1)이 두 번 있다는 것과 NULL 행을 동시에 챙겨야 한다.",
  memo: "조인 = 카테시안 곱 → 조건 필터"
},
{
  id: "S14", s: 2, tp: "grp", lv: 2,
  th: "2과목 | ROLLUP 결과 행 수",
  q: "다음 SQL을 실행했을 때 결과 행 수는?",
  tb: [{ n: "SALES", c: ["REGION", "PROD", "AMT"], r: [["SEOUL", "A", 100], ["SEOUL", "B", 200], ["SEOUL", "A", 50], ["BUSAN", "A", 300], ["BUSAN", "C", 100]] }],
  sql: "SELECT REGION, PROD, SUM(AMT)\n  FROM SALES\n GROUP BY ROLLUP(REGION, PROD);",
  o: ["5", "6", "7", "10"],
  a: 2,
  why: "ROLLUP(A, B)는 오른쪽 컬럼부터 하나씩 빼며 (A, B) → (A) → () 세 단계로 집계한다(인자 N개면 N+1단계). 단계별로 실제 존재하는 그룹 수를 더한다.",
  st: [
    { t: "1단계: (REGION, PROD) 그룹", tb: { c: ["REGION", "PROD", "SUM"], r: [["BUSAN", "A", 300], ["BUSAN", "C", 100], ["SEOUL", "A", 150], ["SEOUL", "B", 200]] }, n: "SEOUL-A 두 행은 하나로 합쳐진다 → 4행" },
    { t: "2단계: (REGION) 소계", tb: { c: ["REGION", "PROD", "SUM"], r: [["BUSAN", null, 400], ["SEOUL", null, 350]] }, n: "2행" },
    { t: "3단계: () 총계", tb: { c: ["REGION", "PROD", "SUM"], r: [[null, null, 750]] }, n: "1행 → 합계 4 + 2 + 1 = 7행" }
  ],
  res: { c: ["COUNT"], r: [[7]] },
  pg: "SELECT COUNT(*) FROM (SELECT REGION, PROD, SUM(AMT) FROM SALES GROUP BY ROLLUP(REGION, PROD)) X",
  ox: ["원본 행 수다.", "총계를 빠뜨린 경우다.", "정답.", "CUBE의 결과 행 수다(PROD별 소계 3행이 추가됨)."],
  trap: "원본 5행이 아니라 '서로 다른 (REGION, PROD) 조합' 4개에서 출발해야 한다.",
  memo: "ROLLUP(A,B) = (A,B) + (A) + ()"
},
{
  id: "S15", s: 2, tp: "grp", lv: 2,
  th: "2과목 | CUBE 결과 행 수",
  q: "S14와 같은 [SALES] 테이블에 대해 다음 SQL의 결과 행 수는?",
  tb: [{ n: "SALES", c: ["REGION", "PROD", "AMT"], r: [["SEOUL", "A", 100], ["SEOUL", "B", 200], ["SEOUL", "A", 50], ["BUSAN", "A", 300], ["BUSAN", "C", 100]] }],
  sql: "SELECT REGION, PROD, SUM(AMT)\n  FROM SALES\n GROUP BY CUBE(REGION, PROD);",
  o: ["7", "9", "10", "12"],
  a: 2,
  why: "CUBE(A, B)는 가능한 모든 조합 (A, B), (A), (B), ()를 집계한다(인자 N개면 2^N 조합). ROLLUP에 비해 (PROD)별 소계가 추가된다.",
  st: [
    { t: "조합별 행 수", tb: { c: ["그룹 조합", "그룹", "행 수"], r: [["(REGION, PROD)", "BUSAN-A, BUSAN-C, SEOUL-A, SEOUL-B", 4], ["(REGION)", "BUSAN, SEOUL", 2], ["(PROD)", "A(450), B(200), C(100)", 3], ["()", "총계 750", 1]], hl: [2] }, n: "4 + 2 + 3 + 1 = 10" }
  ],
  res: { c: ["COUNT"], r: [[10]] },
  pg: "SELECT COUNT(*) FROM (SELECT REGION, PROD, SUM(AMT) FROM SALES GROUP BY CUBE(REGION, PROD)) X",
  ox: ["ROLLUP의 결과다.", "총계를 빠뜨린 경우다.", "정답.", "근거 없는 값이다."],
  trap: "CUBE의 조합 수(2^N=4)와 결과 행 수(10)는 다르다. 조합마다 실제 그룹 수를 세어 더해야 한다.",
  memo: "CUBE(A,B) = (A,B) + (A) + (B) + ()"
},
{
  id: "S16", s: 2, tp: "grp", lv: 3,
  th: "2과목 | ROLLUP 복합 괄호 · GROUPING SETS · GROUPING 함수",
  q: "S14와 같은 [SALES] 테이블에 대해 다음 GROUP BY 절 중 결과 행 수가 나머지 셋과 다른 것은?",
  tb: [{ n: "SALES", c: ["REGION", "PROD", "AMT"], r: [["SEOUL", "A", 100], ["SEOUL", "B", 200], ["SEOUL", "A", 50], ["BUSAN", "A", 300], ["BUSAN", "C", 100]] }],
  sql: "① GROUP BY ROLLUP(REGION, PROD)\n② GROUP BY GROUPING SETS((REGION, PROD), REGION, ())\n③ GROUP BY ROLLUP((REGION, PROD))\n④ GROUP BY CUBE(REGION, PROD)\n   HAVING GROUPING(REGION) = 0 OR GROUPING(PROD) = 1",
  o: ["①", "②", "③", "④"],
  a: 2,
  why: "③의 ROLLUP((REGION, PROD))는 괄호로 묶은 두 컬럼을 한 덩어리로 취급하므로 (REGION, PROD)와 ()만 만든다. ④의 GROUPING(컬럼)은 그 컬럼이 집계되어 NULL로 표시된 행이면 1, 아니면 0이다. CUBE의 4개 조합 중 (PROD) 조합만 GROUPING(REGION)=1이고 GROUPING(PROD)=0이라 HAVING에서 빠진다.",
  st: [
    { t: "보기별 집계 조합", tb: { c: ["보기", "만들어지는 조합", "행 수"], r: [["①", "(R,P) 4 + (R) 2 + () 1", 7], ["②", "(R,P) 4 + (R) 2 + () 1", 7], ["③", "(R,P) 4 + () 1", 5], ["④", "CUBE 10행 − (P) 3행", 7]], hl: [2] } },
    { t: "④의 GROUPING 값", tb: { c: ["조합", "GROUPING(REGION)", "GROUPING(PROD)", "HAVING 통과"], r: [["(R,P)", 0, 0, "O"], ["(R)", 0, 1, "O"], ["(P)", 1, 0, "X"], ["()", 1, 1, "O"]], hl: [2] } }
  ],
  res: { c: ["①", "②", "③", "④"], r: [[7, 7, 5, 7]] },
  pg: "SELECT (SELECT COUNT(*) FROM (SELECT 1 FROM SALES GROUP BY ROLLUP(REGION, PROD)) a),(SELECT COUNT(*) FROM (SELECT 1 FROM SALES GROUP BY GROUPING SETS((REGION, PROD), REGION, ())) b),(SELECT COUNT(*) FROM (SELECT 1 FROM SALES GROUP BY ROLLUP((REGION, PROD))) c),(SELECT COUNT(*) FROM (SELECT 1 FROM SALES GROUP BY CUBE(REGION, PROD) HAVING GROUPING(REGION) = 0 OR GROUPING(PROD) = 1) d)",
  ox: ["7행이다.", "ROLLUP(REGION, PROD)를 GROUPING SETS로 풀어 쓴 것과 같아 7행이다.", "정답. 괄호로 묶여 소계 없이 5행이다.", "CUBE에서 PROD별 소계 3행을 걸러 7행이다."],
  trap: "ROLLUP((A, B))와 ROLLUP(A, B)는 괄호 하나 차이로 결과가 달라진다. 안쪽 괄호는 '한 덩어리'라는 뜻이다.",
  memo: "ROLLUP((A,B),C) = (A,B,C) + (A,B) + ()"
},
{
  id: "S17", s: 2, tp: "win", lv: 1,
  th: "2과목 | 순위 함수 RANK · DENSE_RANK · ROW_NUMBER",
  q: "다음 SQL에서 이름이 '라'인 행의 R1, R2, R3 값은?",
  tb: [{ n: "SCORE", c: ["NAME", "PT"], r: [["가", 90], ["나", 85], ["다", 90], ["라", 80], ["마", 85]] }],
  sql: "SELECT NAME, PT,\n       RANK()       OVER (ORDER BY PT DESC) AS R1,\n       DENSE_RANK() OVER (ORDER BY PT DESC) AS R2,\n       ROW_NUMBER() OVER (ORDER BY PT DESC) AS R3\n  FROM SCORE;",
  o: ["5, 3, 5", "4, 3, 5", "5, 3, 4", "3, 3, 5"],
  a: 0,
  why: "RANK는 동점자 수만큼 다음 순위를 건너뛴다(1, 1, 3, 3, 5). DENSE_RANK는 건너뛰지 않는다(1, 1, 2, 2, 3). ROW_NUMBER는 동점이어도 1부터 고유 번호를 매긴다(1~5).",
  st: [
    { t: "정렬 후 순위 산출 (PT 내림차순)", tb: { c: ["NAME", "PT", "RANK", "DENSE_RANK", "ROW_NUMBER"], r: [["가/다", 90, 1, 1, "1, 2"], ["가/다", 90, 1, 1, "1, 2"], ["나/마", 85, 3, 2, "3, 4"], ["나/마", 85, 3, 2, "3, 4"], ["라", 80, 5, 3, 5]], hl: [4] }, n: "동점자끼리의 ROW_NUMBER 순서는 정렬 기준이 더 없으면 보장되지 않는다. '라'는 단독 최하위라 항상 5다." }
  ],
  res: { c: ["NAME", "R1", "R2", "R3"], r: [["라", 5, 3, 5]] },
  pg: "SELECT NAME, R1, R2, R3 FROM (SELECT NAME, RANK() OVER (ORDER BY PT DESC) R1, DENSE_RANK() OVER (ORDER BY PT DESC) R2, ROW_NUMBER() OVER (ORDER BY PT DESC) R3 FROM SCORE) X WHERE NAME = '라'",
  ox: ["정답.", "RANK는 앞의 4명을 건너뛰므로 4가 아니라 5다.", "ROW_NUMBER는 다섯 번째 행이므로 5다.", "RANK는 DENSE_RANK처럼 이어지지 않는다."],
  trap: "세 함수의 차이는 '동점 처리'뿐이다. 동점이 없다면 세 결과는 같다.",
  memo: "RANK 1,1,3 / DENSE 1,1,2 / ROW_NUMBER 1,2,3"
},
{
  id: "S18", s: 2, tp: "win", lv: 3,
  th: "2과목 | 윈도우 기본 프레임 RANGE와 동일값 처리",
  q: "다음 SQL의 결과에서 ID 1~4의 CSUM 값을 순서대로 나열한 것은?",
  tb: [{ n: "T", c: ["ID", "SAL"], r: [[1, 100], [2, 200], [3, 200], [4, 300]] }],
  sql: "SELECT ID, SAL,\n       SUM(SAL) OVER (ORDER BY SAL) AS CSUM\n  FROM T;",
  o: ["100, 300, 500, 800", "100, 500, 500, 800", "800, 800, 800, 800", "100, 300, 300, 800"],
  a: 1,
  why: "OVER 절에 ORDER BY만 있고 프레임을 생략하면 기본값 RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW가 적용된다. RANGE는 '정렬 값' 기준이라 현재 행과 SAL이 같은 행(동료 행)을 모두 현재 범위에 포함한다. 그래서 SAL이 200인 두 행은 서로를 포함해 같은 누적 합 500을 갖는다.",
  st: [
    { t: "1단계: SAL 오름차순 정렬", tb: { c: ["ID", "SAL"], r: [[1, 100], [2, 200], [3, 200], [4, 300]] } },
    { t: "2단계: RANGE 누적 범위", tb: { c: ["ID", "SAL", "범위(SAL ≤ 현재 값)", "CSUM"], r: [[1, 100, "100", 100], [2, 200, "100, 200, 200", 500], [3, 200, "100, 200, 200", 500], [4, 300, "전체", 800]], hl: [1, 2] } }
  ],
  res: { c: ["ID", "CSUM"], r: [[1, 100], [2, 500], [3, 500], [4, 800]] },
  pg: "SELECT ID, SUM(SAL) OVER (ORDER BY SAL) CSUM FROM T ORDER BY ID",
  ox: ["ROWS UNBOUNDED PRECEDING(물리적 행 단위)일 때의 결과다.", "정답.", "ORDER BY가 없을 때(전체 합계)의 결과다.", "근거 없는 값이다."],
  trap: "누적 합계 문제에서 정렬 컬럼에 같은 값이 있는지 반드시 확인하자. 같은 값이 있으면 ROWS와 RANGE의 결과가 달라진다.",
  memo: "ORDER BY만 쓰면 RANGE — 같은 값은 한꺼번에"
},
{
  id: "S19", s: 2, tp: "win", lv: 2,
  th: "2과목 | ROWS 프레임 — 이동 합계",
  q: "다음 SQL의 결과를 SAL 오름차순으로 나열했을 때 MSUM 값은?",
  tb: [{ n: "T", c: ["ID", "SAL"], r: [[1, 100], [2, 200], [3, 200], [4, 300]] }],
  sql: "SELECT ID, SAL,\n       SUM(SAL) OVER (ORDER BY SAL\n                      ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) AS MSUM\n  FROM T;",
  o: ["300, 500, 700, 500", "300, 600, 700, 500", "100, 300, 500, 800", "300, 500, 500, 500"],
  a: 0,
  why: "ROWS는 정렬된 '물리적 행'을 기준으로 앞뒤 몇 행을 셀지 정한다. 현재 행의 바로 앞 1행 + 현재 행 + 바로 뒤 1행을 더한다. 첫 행은 앞 행이 없고, 마지막 행은 뒤 행이 없다.",
  st: [
    { t: "행별 프레임", tb: { c: ["순서", "SAL", "프레임에 포함된 값", "MSUM"], r: [[1, 100, "100, 200", 300], [2, 200, "100, 200, 200", 500], [3, 200, "200, 200, 300", 700], [4, 300, "200, 300", 500]] }, n: "SAL이 같은 두 행의 순서가 바뀌어도 값이 같으므로 결과는 동일하다." }
  ],
  res: { c: ["SAL", "MSUM"], r: [[100, 300], [200, 500], [200, 700], [300, 500]] },
  pg: "SELECT SAL, SUM(SAL) OVER (ORDER BY SAL ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) MSUM FROM T ORDER BY SAL, MSUM",
  ox: ["정답.", "두 번째 행에서 200을 한 번 더 센 경우다.", "기본 누적 합(ROWS 기준)이다.", "RANGE처럼 같은 값을 묶었다고 본 경우다."],
  trap: "ROWS에서는 같은 값이라도 다른 행으로 취급하므로, 두 개의 200 행이 서로 다른 값을 갖는다.",
  memo: "ROWS = 물리적 행 개수, RANGE = 값의 범위"
},
{
  id: "S20", s: 2, tp: "win", lv: 3,
  th: "2과목 | RANGE 프레임 — 값 기준 범위",
  q: "다음 SQL의 결과를 ID 순서대로 나열했을 때 RSUM 값은?",
  tb: [{ n: "T", c: ["ID", "SAL"], r: [[1, 100], [2, 200], [3, 200], [4, 300]] }],
  sql: "SELECT ID, SAL,\n       SUM(SAL) OVER (ORDER BY SAL\n                      RANGE BETWEEN 100 PRECEDING AND CURRENT ROW) AS RSUM\n  FROM T;",
  o: ["100, 500, 500, 700", "100, 300, 400, 500", "100, 300, 500, 700", "100, 500, 500, 800"],
  a: 0,
  why: "RANGE BETWEEN 100 PRECEDING AND CURRENT ROW는 '현재 행의 SAL − 100 이상, 현재 SAL 이하'인 모든 행을 더한다. 행 개수가 아니라 값의 구간이 기준이다. 현재 행과 값이 같은 행도 CURRENT ROW 범위에 함께 들어간다.",
  st: [
    { t: "행별 값 구간", tb: { c: ["ID", "SAL", "구간", "포함 값", "RSUM"], r: [[1, 100, "0 ~ 100", "100", 100], [2, 200, "100 ~ 200", "100, 200, 200", 500], [3, 200, "100 ~ 200", "100, 200, 200", 500], [4, 300, "200 ~ 300", "200, 200, 300", 700]] } }
  ],
  res: { c: ["ID", "RSUM"], r: [[1, 100], [2, 500], [3, 500], [4, 700]] },
  pg: "SELECT ID, SUM(SAL) OVER (ORDER BY SAL RANGE BETWEEN 100 PRECEDING AND CURRENT ROW) RSUM FROM T ORDER BY ID",
  ox: ["정답.", "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW로 계산한 결과다.", "ROWS 누적 합에서 마지막 값만 다르게 본 경우다.", "구간 하한(−100)을 무시하고 누적 합을 낸 경우다."],
  trap: "ID 4(300)는 100을 포함하지 않는다. 구간이 200~300이기 때문이다.",
  memo: "RANGE n PRECEDING = 값이 n만큼 작은 데까지"
},
{
  id: "S21", s: 2, tp: "win", lv: 2,
  th: "2과목 | LAST_VALUE와 기본 프레임의 함정",
  q: "다음 SQL에서 ID가 1인 행의 LV1, LV2 값은?",
  tb: [{ n: "T", c: ["ID", "SAL"], r: [[1, 100], [2, 200], [3, 300]] }],
  sql: "SELECT ID,\n       LAST_VALUE(SAL) OVER (ORDER BY ID) AS LV1,\n       LAST_VALUE(SAL) OVER (ORDER BY ID\n            ROWS BETWEEN UNBOUNDED PRECEDING\n                     AND UNBOUNDED FOLLOWING) AS LV2\n  FROM T;",
  o: ["100, 300", "300, 300", "100, 100", "300, 100"],
  a: 0,
  why: "ORDER BY만 있으면 프레임이 '처음부터 현재 행까지'로 잡힌다. 그래서 LAST_VALUE는 항상 현재 행 자신의 값을 돌려준다. 파티션의 진짜 마지막 값을 얻으려면 UNBOUNDED FOLLOWING으로 프레임 끝을 열어 줘야 한다.",
  st: [
    { t: "행별 프레임과 결과", tb: { c: ["ID", "LV1 프레임", "LV1", "LV2 프레임", "LV2"], r: [[1, "100", 100, "100, 200, 300", 300], [2, "100, 200", 200, "100, 200, 300", 300], [3, "100, 200, 300", 300, "100, 200, 300", 300]], hl: [0] } }
  ],
  res: { c: ["ID", "LV1", "LV2"], r: [[1, 100, 300]] },
  pg: "SELECT * FROM (SELECT ID, LAST_VALUE(SAL) OVER (ORDER BY ID) LV1, LAST_VALUE(SAL) OVER (ORDER BY ID ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) LV2 FROM T) X WHERE ID = 1",
  ox: ["정답.", "LV1도 마지막 값을 본다고 착각한 경우다.", "LV2는 프레임이 전체이므로 300이다.", "근거 없는 값이다."],
  trap: "FIRST_VALUE는 기본 프레임에서도 맨 처음 값을 정상적으로 돌려주지만, LAST_VALUE는 그렇지 않다. 두 함수의 비대칭이 출제 포인트다.",
  memo: "LAST_VALUE는 UNBOUNDED FOLLOWING 필수"
},
{
  id: "S22", s: 2, tp: "win", lv: 2,
  th: "2과목 | LAG 함수와 NULL 연산",
  q: "다음 SQL의 결과에서 MON 1~4의 DIFF 값을 순서대로 나열한 것은?",
  tb: [{ n: "SALES", c: ["MON", "AMT"], r: [[1, 100], [2, 150], [3, null], [4, 200]] }],
  sql: "SELECT MON,\n       AMT - LAG(AMT) OVER (ORDER BY MON) AS DIFF\n  FROM SALES;",
  o: ["NULL, 50, NULL, NULL", "0, 50, -150, 200", "NULL, 50, -150, 200", "100, 50, NULL, NULL"],
  a: 0,
  why: "LAG(AMT)는 정렬 기준으로 바로 앞 행의 AMT를 가져온다. 첫 행은 앞 행이 없으므로 NULL이다. 그리고 NULL이 포함된 산술 연산 결과는 항상 NULL이다(NULL + n = NULL).",
  st: [
    { t: "행별 계산", tb: { c: ["MON", "AMT", "LAG(AMT)", "AMT − LAG", "DIFF"], r: [[1, 100, null, "100 − NULL", null], [2, 150, 100, "150 − 100", 50], [3, null, 150, "NULL − 150", null], [4, 200, null, "200 − NULL", null]] } }
  ],
  res: { c: ["MON", "DIFF"], r: [[1, null], [2, 50], [3, null], [4, null]] },
  pg: "SELECT MON, AMT - LAG(AMT) OVER (ORDER BY MON) DIFF FROM SALES ORDER BY MON",
  ox: ["정답.", "NULL을 0으로 취급한 경우다. 그렇게 하려면 NVL이나 LAG(AMT, 1, 0)처럼 기본값을 지정해야 한다.", "AMT의 NULL만 0으로 보고(첫 행의 LAG NULL은 그대로 둔 채) 계산한 경우다.", "첫 행에 자기 값이 들어간다고 본 경우다."],
  trap: "MON 4는 자신의 AMT(200)가 있어도 앞 행의 값이 NULL이라 결과가 NULL이다.",
  memo: "LAG(컬럼, 몇 칸, 기본값) / NULL 연산 = NULL"
},
{
  id: "S23", s: 2, tp: "win", lv: 2,
  th: "2과목 | NTILE 그룹 배분",
  q: "7개 행에 대해 NTILE(3) OVER (ORDER BY SAL)을 실행했을 때, 그룹 번호 1, 2, 3에 배정되는 행 수는 각각 몇 개인가?",
  tb: [{ n: "EMP", c: ["ENAME", "SAL"], r: [["A", 100], ["B", 200], ["C", 300], ["D", 400], ["E", 500], ["F", 600], ["G", 700]] }],
  sql: "SELECT ENAME, SAL,\n       NTILE(3) OVER (ORDER BY SAL) AS GRP\n  FROM EMP;",
  o: ["3, 2, 2", "2, 2, 3", "3, 3, 1", "2, 3, 2"],
  a: 0,
  why: "NTILE(n)은 행을 n개 그룹에 최대한 고르게 나눈다. 7 ÷ 3 = 몫 2, 나머지 1이므로 기본 2개씩 배정한 뒤 나머지 1개를 앞 그룹부터 하나씩 더 준다.",
  st: [
    { t: "그룹 배정", tb: { c: ["ENAME", "SAL", "GRP"], r: [["A", 100, 1], ["B", 200, 1], ["C", 300, 1], ["D", 400, 2], ["E", 500, 2], ["F", 600, 3], ["G", 700, 3]] } }
  ],
  res: { c: ["GRP", "CNT"], r: [[1, 3], [2, 2], [3, 2]] },
  pg: "SELECT GRP, COUNT(*) CNT FROM (SELECT NTILE(3) OVER (ORDER BY SAL) GRP FROM EMP) X GROUP BY GRP ORDER BY GRP",
  ox: ["정답.", "나머지를 뒤 그룹에 준 경우다.", "3개씩 먼저 채운 경우다.", "나머지를 가운데에 준 경우다."],
  trap: "나머지는 항상 '앞' 그룹부터 하나씩 더 받는다.",
  memo: "NTILE 나머지 = 앞 그룹부터"
},
{
  id: "S24", s: 2, tp: "win", lv: 2,
  th: "2과목 | PARTITION BY + RANK로 그룹별 1위 추출",
  q: "다음 SQL의 결과 행 수는?",
  tb: [{ n: "EMP", c: ["DEPT", "ENAME", "SAL"], r: [[10, "A", 300], [10, "B", 500], [10, "C", 500], [20, "D", 400], [20, "E", 200], [30, "F", 100]] }],
  sql: "SELECT DEPT, ENAME\n  FROM (SELECT DEPT, ENAME,\n               RANK() OVER (PARTITION BY DEPT ORDER BY SAL DESC) AS RK\n          FROM EMP)\n WHERE RK = 1;",
  o: ["3", "4", "5", "6"],
  a: 1,
  why: "PARTITION BY DEPT는 부서마다 순위를 1부터 따로 매긴다. RANK는 동점자에게 같은 순위를 주므로 10번 부서의 B와 C(500)가 모두 1위다. 윈도우 함수는 WHERE 절에서 바로 쓸 수 없어서 인라인 뷰로 감싼 뒤 바깥에서 거른다.",
  st: [
    { t: "1단계: 부서별 순위", tb: { c: ["DEPT", "ENAME", "SAL", "RK"], r: [[10, "B", 500, 1], [10, "C", 500, 1], [10, "A", 300, 3], [20, "D", 400, 1], [20, "E", 200, 2], [30, "F", 100, 1]], hl: [0, 1, 3, 5] } },
    { t: "2단계: RK = 1 필터", n: "B, C, D, F → 4행" }
  ],
  res: { c: ["COUNT"], r: [[4]] },
  pg: "SELECT COUNT(*) FROM (SELECT DEPT, ENAME, RANK() OVER (PARTITION BY DEPT ORDER BY SAL DESC) RK FROM EMP) X WHERE RK = 1",
  ox: ["ROW_NUMBER를 썼을 때의 결과다(부서당 1명).", "정답.", "근거 없는 값이다.", "필터가 없을 때의 행 수다."],
  trap: "RANK를 ROW_NUMBER로 바꾸면 결과가 3행이 되고, 10번 부서에서 B와 C 중 누가 나올지는 보장되지 않는다.",
  memo: "그룹별 TOP-N = 인라인 뷰 + PARTITION BY + 순위 함수"
},
{
  id: "S25", s: 2, tp: "win", lv: 2,
  th: "2과목 | 비율 함수 CUME_DIST · PERCENT_RANK",
  q: "다음 SQL에서 SAL이 200인 행의 CD, PR 값으로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "SAL"], r: [[1, 100], [2, 200], [3, 200], [4, 300]] }],
  sql: "SELECT ID, SAL,\n       CUME_DIST()    OVER (ORDER BY SAL) AS CD,\n       PERCENT_RANK() OVER (ORDER BY SAL) AS PR\n  FROM T;",
  o: ["0.75, 0.333…", "0.5, 0.333…", "0.75, 0.5", "0.5, 0.25"],
  a: 0,
  why: "CUME_DIST는 '현재 값 이하인 행 수 ÷ 전체 행 수'이므로 같은 값을 가진 행을 모두 포함한다. PERCENT_RANK는 '(RANK − 1) ÷ (전체 행 수 − 1)'로, 첫 행은 항상 0, 마지막 순위는 1이다.",
  st: [
    { t: "행별 계산", tb: { c: ["SAL", "RANK", "CUME_DIST", "PERCENT_RANK"], r: [[100, 1, "1/4 = 0.25", "0/3 = 0"], [200, 2, "3/4 = 0.75", "1/3 = 0.333…"], [200, 2, "3/4 = 0.75", "1/3 = 0.333…"], [300, 4, "4/4 = 1", "3/3 = 1"]], hl: [1, 2] } }
  ],
  res: { c: ["SAL", "CD", "PR"], r: [[200, 0.75, 0.3333], [200, 0.75, 0.3333]] },
  pg: "SELECT SAL, ROUND(CUME_DIST() OVER (ORDER BY SAL)::numeric,4) CD, ROUND(PERCENT_RANK() OVER (ORDER BY SAL)::numeric,4) PR FROM T ORDER BY ID LIMIT 2 OFFSET 1",
  ox: ["정답.", "CUME_DIST에서 같은 값 행을 하나만 센 경우다.", "PERCENT_RANK를 RANK ÷ 행 수로 계산한 경우다.", "CUME_DIST를 행 번호(2/4)로, PERCENT_RANK의 분모를 전체 행 수(1/4)로 계산한 경우다."],
  trap: "CUME_DIST는 0이 나오지 않고(최소 1/n), PERCENT_RANK는 항상 0에서 시작한다.",
  memo: "CUME_DIST = 이하 비율 / PERCENT_RANK = (순위−1)/(n−1)"
}
);
