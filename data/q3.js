// 제2과목 · SQL 기본 및 활용 (B: 계층형 질의·ROWNUM·TOP-N·집합 연산·서브쿼리·PIVOT·정규표현식)
// 계층형 질의(CONNECT BY)는 PostgreSQL 재귀 CTE(WITH RECURSIVE)로 같은 전개를 재현해 검증한다.
(window.QB = window.QB || []).push(
{
  id: "S26", s: 2, tp: "hier", lv: 2,
  th: "2과목 | 계층형 질의 순방향 전개와 ORDER SIBLINGS BY",
  q: "다음 SQL의 출력 순서(ENAME)로 옳은 것은?",
  tb: [{ n: "EMP", c: ["EMPNO", "ENAME", "MGR"], r: [[1, "KING", null], [2, "JONES", 1], [3, "BLAKE", 1], [4, "SCOTT", 2], [5, "FORD", 2], [6, "ALLEN", 3]] }],
  sql: "SELECT LEVEL, ENAME\n  FROM EMP\n START WITH MGR IS NULL\nCONNECT BY PRIOR EMPNO = MGR\n ORDER SIBLINGS BY ENAME;",
  o: [
    "KING → BLAKE → ALLEN → JONES → FORD → SCOTT",
    "KING → JONES → BLAKE → SCOTT → FORD → ALLEN",
    "KING → JONES → FORD → SCOTT → BLAKE → ALLEN",
    "ALLEN → BLAKE → FORD → JONES → KING → SCOTT"
  ],
  a: 0,
  why: "CONNECT BY PRIOR EMPNO = MGR는 '이전(PRIOR) 행의 EMPNO가 다음 행의 MGR'이라는 뜻으로, 부모에서 자식으로 내려가는 순방향(Top-Down) 전개다. 계층형 질의는 깊이 우선(한 가지를 끝까지 내려간 뒤 다음 형제로)으로 출력한다. ORDER SIBLINGS BY ENAME은 계층 구조를 유지한 채 같은 부모를 둔 형제끼리만 이름순으로 정렬한다.",
  st: [
    { t: "1단계: 트리 구조", n: "KING(1)\n├─ BLAKE(3)\n│   └─ ALLEN(6)\n└─ JONES(2)\n    ├─ FORD(5)\n    └─ SCOTT(4)\n※ 형제는 이름순: BLAKE < JONES, FORD < SCOTT" },
    { t: "2단계: 깊이 우선 출력", tb: { c: ["출력 순서", "LEVEL", "ENAME"], r: [[1, 1, "KING"], [2, 2, "BLAKE"], [3, 3, "ALLEN"], [4, 2, "JONES"], [5, 3, "FORD"], [6, 3, "SCOTT"]] } }
  ],
  res: { c: ["LEVEL", "ENAME"], r: [[1, "KING"], [2, "BLAKE"], [3, "ALLEN"], [2, "JONES"], [3, "FORD"], [3, "SCOTT"]] },
  pg: "WITH RECURSIVE H AS (SELECT EMPNO, ENAME, 1 LV, ARRAY[ENAME] P FROM EMP WHERE MGR IS NULL UNION ALL SELECT E.EMPNO, E.ENAME, H.LV + 1, H.P || E.ENAME FROM EMP E JOIN H ON E.MGR = H.EMPNO) SELECT LV, ENAME FROM H ORDER BY P",
  ox: ["정답.", "너비 우선(LEVEL별)으로 출력한다고 본 경우다.", "형제 정렬을 무시하고 JONES부터 내려간 경우다.", "ORDER BY ENAME처럼 전체를 정렬한 경우다. SIBLINGS는 계층을 깨지 않는다."],
  trap: "ORDER SIBLINGS BY 대신 일반 ORDER BY ENAME을 쓰면 계층 구조가 무너지고 단순 이름순(④)이 된다.",
  memo: "PRIOR 자식 = 부모 → 순방향(위→아래)"
},
{
  id: "S27", s: 2, tp: "hier", lv: 2,
  th: "2과목 | 계층형 질의 역방향 전개",
  q: "S26과 같은 [EMP] 테이블에 대해 다음 SQL을 실행한 결과로 옳은 것은?",
  tb: [{ n: "EMP", c: ["EMPNO", "ENAME", "MGR"], r: [[1, "KING", null], [2, "JONES", 1], [3, "BLAKE", 1], [4, "SCOTT", 2], [5, "FORD", 2], [6, "ALLEN", 3]] }],
  sql: "SELECT LEVEL, ENAME\n  FROM EMP\n START WITH ENAME = 'FORD'\nCONNECT BY PRIOR MGR = EMPNO;",
  o: [
    "(1, FORD) → (2, JONES) → (3, KING)",
    "(1, FORD) 한 행만 출력",
    "(1, KING) → (2, JONES) → (3, FORD)",
    "(1, FORD) → (2, SCOTT)"
  ],
  a: 0,
  why: "PRIOR MGR = EMPNO는 '이전 행의 MGR 값을 EMPNO로 가진 행'을 다음으로 찾는다. 즉 자식에서 부모로 올라가는 역방향(Bottom-Up) 전개다. LEVEL은 방향과 상관없이 시작 행(START WITH)이 1이고 한 단계 이동할 때마다 1씩 커진다.",
  st: [
    { t: "단계별 이동", tb: { c: ["LEVEL", "현재 행", "PRIOR MGR", "다음 행(EMPNO = PRIOR MGR)"], r: [[1, "FORD", 2, "JONES"], [2, "JONES", 1, "KING"], [3, "KING", null, "없음 → 종료"]] } }
  ],
  res: { c: ["LEVEL", "ENAME"], r: [[1, "FORD"], [2, "JONES"], [3, "KING"]] },
  pg: "WITH RECURSIVE H AS (SELECT EMPNO, ENAME, MGR, 1 LV FROM EMP WHERE ENAME = 'FORD' UNION ALL SELECT E.EMPNO, E.ENAME, E.MGR, H.LV + 1 FROM EMP E JOIN H ON E.EMPNO = H.MGR) SELECT LV, ENAME FROM H ORDER BY LV",
  ox: ["정답.", "역방향 조건을 인식하지 못한 경우다.", "LEVEL이 루트 기준으로 매겨진다고 본 경우다. LEVEL은 시작 행부터 1이다.", "FORD의 형제(SCOTT)는 부모를 거쳐야만 닿을 수 있어 역방향 전개에 나오지 않는다."],
  trap: "역방향에서는 출발점(FORD)이 LEVEL 1, 최상위 KING이 LEVEL 3이다.",
  memo: "PRIOR 부모(MGR) = 자식(EMPNO) → 역방향(아래→위)"
},
{
  id: "S28", s: 2, tp: "hier", lv: 2,
  th: "2과목 | CONNECT_BY_ISLEAF와 LEVEL",
  q: "S26과 같은 [EMP] 테이블에 대해 다음 SQL의 결과로 옳은 것은?",
  tb: [{ n: "EMP", c: ["EMPNO", "ENAME", "MGR"], r: [[1, "KING", null], [2, "JONES", 1], [3, "BLAKE", 1], [4, "SCOTT", 2], [5, "FORD", 2], [6, "ALLEN", 3]] }],
  sql: "SELECT SUM(CONNECT_BY_ISLEAF) AS LEAF_CNT,\n       MAX(LEVEL)             AS DEPTH\n  FROM EMP\n START WITH MGR IS NULL\nCONNECT BY PRIOR EMPNO = MGR;",
  o: ["3, 3", "2, 3", "3, 2", "4, 3"],
  a: 0,
  why: "CONNECT_BY_ISLEAF는 전개 결과에서 더 내려갈 자식이 없는 단말(Leaf) 노드면 1, 자식이 있으면 0이다. LEVEL은 루트가 1이며 한 단계 내려갈 때마다 1씩 증가한다.",
  st: [
    { t: "노드별 값", tb: { c: ["ENAME", "LEVEL", "자식", "CONNECT_BY_ISLEAF"], r: [["KING", 1, "JONES, BLAKE", 0], ["BLAKE", 2, "ALLEN", 0], ["ALLEN", 3, "없음", 1], ["JONES", 2, "SCOTT, FORD", 0], ["FORD", 3, "없음", 1], ["SCOTT", 3, "없음", 1]], hl: [2, 4, 5] } }
  ],
  res: { c: ["LEAF_CNT", "DEPTH"], r: [[3, 3]] },
  pg: "WITH RECURSIVE H AS (SELECT EMPNO, 1 LV FROM EMP WHERE MGR IS NULL UNION ALL SELECT E.EMPNO, H.LV + 1 FROM EMP E JOIN H ON E.MGR = H.EMPNO) SELECT SUM(CASE WHEN NOT EXISTS (SELECT 1 FROM EMP C WHERE C.MGR = H.EMPNO) THEN 1 ELSE 0 END), MAX(LV) FROM H",
  ox: ["정답.", "SCOTT·FORD만 세고 ALLEN을 빠뜨린 경우다.", "LEVEL이 0부터 시작한다고 본 경우다.", "루트(KING)까지 단말로 센 경우다."],
  trap: "ISLEAF는 '최하위 LEVEL'이 아니라 '자식이 없는 노드'다. ALLEN처럼 다른 가지의 끝도 단말이다.",
  memo: "ISLEAF: 자식 없으면 1"
},
{
  id: "S29", s: 2, tp: "hier", lv: 3,
  th: "2과목 | CONNECT BY 조건 vs WHERE 조건 (가지치기)",
  q: "S26과 같은 [EMP] 테이블에 대해 (가), (나) SQL의 결과 행 수로 옳은 것은?",
  tb: [{ n: "EMP", c: ["EMPNO", "ENAME", "MGR"], r: [[1, "KING", null], [2, "JONES", 1], [3, "BLAKE", 1], [4, "SCOTT", 2], [5, "FORD", 2], [6, "ALLEN", 3]] }],
  sql: "(가) SELECT ENAME FROM EMP\n      START WITH MGR IS NULL\n    CONNECT BY PRIOR EMPNO = MGR AND ENAME <> 'JONES';\n\n(나) SELECT ENAME FROM EMP\n     WHERE ENAME <> 'JONES'\n      START WITH MGR IS NULL\n    CONNECT BY PRIOR EMPNO = MGR;",
  o: ["(가) 3, (나) 5", "(가) 5, (나) 3", "(가) 5, (나) 5", "(가) 3, (나) 3"],
  a: 0,
  why: "CONNECT BY 절의 조건은 '어느 자식으로 내려갈지'를 정한다. JONES로 가는 길이 막히면 JONES 아래(SCOTT, FORD)로도 내려갈 수 없어 가지 전체가 잘린다. WHERE 절은 계층 전개가 모두 끝난 뒤 결과 행을 거르므로 JONES 한 행만 빠지고 자식들은 남는다.",
  st: [
    { t: "(가) CONNECT BY에서 가지치기", tb: { c: ["ENAME", "결과"], r: [["KING", "출력"], ["JONES", "연결 불가 → 하위 전체 차단"], ["SCOTT", "도달 불가"], ["FORD", "도달 불가"], ["BLAKE", "출력"], ["ALLEN", "출력"]] }, n: "3행" },
    { t: "(나) 전개 후 WHERE 필터", tb: { c: ["ENAME", "결과"], r: [["KING", "출력"], ["JONES", "WHERE에서 제거"], ["SCOTT", "출력"], ["FORD", "출력"], ["BLAKE", "출력"], ["ALLEN", "출력"]] }, n: "5행" }
  ],
  res: { c: ["가", "나"], r: [[3, 5]] },
  pg: "WITH RECURSIVE A AS (SELECT EMPNO, ENAME FROM EMP WHERE MGR IS NULL UNION ALL SELECT E.EMPNO, E.ENAME FROM EMP E JOIN A ON E.MGR = A.EMPNO AND E.ENAME <> 'JONES'), B AS (SELECT EMPNO, ENAME FROM EMP WHERE MGR IS NULL UNION ALL SELECT E.EMPNO, E.ENAME FROM EMP E JOIN B ON E.MGR = B.EMPNO) SELECT (SELECT COUNT(*) FROM A), (SELECT COUNT(*) FROM B WHERE ENAME <> 'JONES')",
  ox: ["정답.", "두 조건의 역할을 반대로 본 경우다.", "CONNECT BY 조건도 해당 행만 지운다고 본 경우다.", "WHERE도 가지를 자른다고 본 경우다."],
  trap: "START WITH로 선택된 루트 행에는 CONNECT BY 조건이 적용되지 않는다. 루트는 START WITH 조건만 맞으면 출력된다.",
  memo: "CONNECT BY 조건 = 가지째 / WHERE 조건 = 그 행만"
},
{
  id: "S30", s: 2, tp: "topn", lv: 1,
  th: "2과목 | ROWNUM의 부여 원리",
  q: "5개 행이 있는 [EMP] 테이블에 대해 다음 SQL 중 결과가 0건인 것은? (Oracle 기준)",
  sql: "① SELECT * FROM EMP WHERE ROWNUM <= 3;\n② SELECT * FROM EMP WHERE ROWNUM = 1;\n③ SELECT * FROM EMP WHERE ROWNUM > 1;\n④ SELECT * FROM EMP WHERE ROWNUM BETWEEN 1 AND 2;",
  o: ["①", "②", "③", "④"],
  a: 2,
  why: "ROWNUM은 WHERE 조건을 통과한 행에 1부터 차례로 번호를 붙이는 의사 컬럼이다. 첫 번째 행은 ROWNUM이 1인 상태로 조건을 검사받는다. ROWNUM > 1이면 1 > 1이 FALSE라 탈락하고, 번호가 소비되지 않았으니 다음 행도 다시 1로 검사받아 또 탈락한다. 결국 아무 행도 2번이 될 수 없다.",
  st: [
    { t: "③ 처리 과정", tb: { c: ["읽은 행", "후보 ROWNUM", "ROWNUM > 1", "결과"], r: [["1번째", 1, "FALSE", "탈락 (번호 미사용)"], ["2번째", 1, "FALSE", "탈락"], ["…", 1, "FALSE", "탈락"]] } }
  ],
  ox: ["1, 2, 3번이 차례로 붙어 3건이다.", "첫 행이 ROWNUM 1이므로 1건이다.", "정답. ROWNUM > 1, ROWNUM = 2 같은 조건은 항상 0건이다.", "1, 2번이 붙어 2건이다."],
  trap: "ROWNUM = 2도 0건이다. 1번을 거치지 않으면 2번이 존재할 수 없다.",
  memo: "ROWNUM은 1부터 — '= 1', '<= n'만 의미 있음"
},
{
  id: "S31", s: 2, tp: "topn", lv: 3,
  th: "2과목 | ROWNUM과 ORDER BY 실행 순서 (TOP-N 함정)",
  q: "급여 상위 2명을 구하려고 아래 SQL을 실행하였다. 결과로 옳은 것은? (Oracle 기준, 테이블은 입력 순서대로 읽힌다고 가정한다.)",
  tb: [{ n: "EMP", c: ["ENAME", "SAL"], r: [["A", 100], ["B", 400], ["C", 300], ["D", 200]] }],
  sql: "SELECT ENAME, SAL\n  FROM EMP\n WHERE ROWNUM <= 2\n ORDER BY SAL DESC;",
  o: ["B, C", "B, A", "A, B", "C, B"],
  a: 1,
  why: "ROWNUM은 WHERE 단계에서 붙고, ORDER BY는 SELECT 이후 마지막에 실행된다. 그래서 '먼저 읽힌 2건(A, B)'을 고른 다음에 그 2건만 급여순으로 정렬한다. 진짜 상위 2명을 구하려면 인라인 뷰에서 먼저 정렬하고 바깥에서 ROWNUM을 걸어야 한다.",
  st: [
    { t: "1단계: WHERE ROWNUM <= 2", tb: { c: ["ENAME", "SAL", "ROWNUM"], r: [["A", 100, 1], ["B", 400, 2]] } },
    { t: "2단계: ORDER BY SAL DESC", tb: { c: ["ENAME", "SAL"], r: [["B", 400], ["A", 100]] } },
    { t: "올바른 TOP-N", n: "SELECT * FROM (SELECT ENAME, SAL FROM EMP ORDER BY SAL DESC)\n WHERE ROWNUM <= 2;   → B(400), C(300)" }
  ],
  ox: ["올바른 TOP-N 쿼리(인라인 뷰 정렬 후 ROWNUM)의 결과다.", "정답.", "정렬 전 순서다. ORDER BY는 적용된다.", "근거 없는 값이다."],
  trap: "보기 ①(진짜 상위 2명)이 상식적으로 맞아 보여서 고르기 쉽다. 실행 순서를 먼저 떠올리자.",
  memo: "ROWNUM(WHERE) → ORDER BY 순서 / TOP-N은 인라인 뷰 정렬 후 ROWNUM"
},
{
  id: "S32", s: 2, tp: "topn", lv: 2,
  th: "2과목 | FETCH FIRST … WITH TIES",
  q: "다음 SQL의 결과 행 수는? (Oracle 12c 이상)",
  tb: [{ n: "EMP", c: ["ENAME", "SAL"], r: [["A", 500], ["B", 400], ["C", 400], ["D", 300]] }],
  sql: "SELECT ENAME, SAL\n  FROM EMP\n ORDER BY SAL DESC\n FETCH FIRST 2 ROWS WITH TIES;",
  o: ["1", "2", "3", "4"],
  a: 2,
  why: "FETCH FIRST n ROWS ONLY는 정렬 후 정확히 n행만 돌려준다. WITH TIES를 붙이면 n번째 행과 정렬 값이 같은 행까지 함께 돌려준다. 2번째 행(B, 400)과 같은 값인 C(400)가 함께 나온다.",
  st: [
    { t: "정렬 후 선택", tb: { c: ["순서", "ENAME", "SAL", "선택"], r: [[1, "A", 500, "O"], [2, "B", 400, "O (2번째)"], [3, "C", 400, "O (2번째와 동점)"], [4, "D", 300, "X"]], hl: [2] } }
  ],
  res: { c: ["COUNT"], r: [[3]] },
  pg: "SELECT COUNT(*) FROM (SELECT ENAME, SAL FROM EMP ORDER BY SAL DESC FETCH FIRST 2 ROWS WITH TIES) X",
  ox: ["근거 없는 값이다.", "ROWS ONLY일 때의 결과다.", "정답.", "전체 행 수다."],
  trap: "WITH TIES는 ORDER BY가 반드시 있어야 의미가 있다.",
  memo: "WITH TIES = 마지막 행과 동점도 포함"
},
{
  id: "S33", s: 2, tp: "set", lv: 3,
  th: "2과목 | 집합 연산자와 NULL·중복 처리",
  q: "다음 두 테이블에 대한 집합 연산의 결과 건수로 옳지 않은 것은? (Oracle 기준)",
  tb: [
    { n: "T1", c: ["C"], r: [[1], [1], [2], [3], [null]] },
    { n: "T2", c: ["C"], r: [[2], [3], [3], [4], [null]] }
  ],
  sql: "① SELECT C FROM T1 UNION     SELECT C FROM T2;   → 5건\n② SELECT C FROM T1 UNION ALL SELECT C FROM T2;   → 10건\n③ SELECT C FROM T1 INTERSECT SELECT C FROM T2;   → 2건\n④ SELECT C FROM T1 MINUS     SELECT C FROM T2;   → 1건",
  o: ["①", "②", "③", "④"],
  a: 2,
  why: "UNION·INTERSECT·MINUS는 결과에서 중복을 제거한다. 이때 집합 연산은 '같은 값인가'를 판단할 때 NULL과 NULL을 같은 값으로 취급한다(조인의 = 비교와 다름). 따라서 INTERSECT 결과에 NULL도 포함되어 {2, 3, NULL} 3건이다.",
  st: [
    { t: "연산별 결과", tb: { c: ["연산", "결과 집합", "건수"], r: [["UNION", "{1, 2, 3, 4, NULL}", 5], ["UNION ALL", "T1 5행 + T2 5행 (중복 유지)", 10], ["INTERSECT", "{2, 3, NULL}", 3], ["MINUS", "{1}", 1]], hl: [2] } }
  ],
  res: { c: ["UNION", "UNION ALL", "INTERSECT", "MINUS"], r: [[5, 10, 3, 1]] },
  pg: "SELECT (SELECT COUNT(*) FROM (SELECT C FROM T1 UNION SELECT C FROM T2) a),(SELECT COUNT(*) FROM (SELECT C FROM T1 UNION ALL SELECT C FROM T2) b),(SELECT COUNT(*) FROM (SELECT C FROM T1 INTERSECT SELECT C FROM T2) c),(SELECT COUNT(*) FROM (SELECT C FROM T1 EXCEPT SELECT C FROM T2) d)",
  ox: ["맞다. NULL도 하나의 값으로 합쳐져 5건이다.", "맞다. UNION ALL은 중복 제거 없이 이어 붙인다.", "정답(틀린 진술). NULL도 공통 값으로 잡혀 3건이다.", "맞다. T1에만 있는 값은 1뿐이고, 중복 1은 하나로 줄어든다."],
  trap: "'NULL은 비교할 수 없다'를 집합 연산에도 적용하면 틀린다. 중복 제거(DISTINCT, 집합 연산, GROUP BY)에서는 NULL끼리 같은 그룹이다.",
  memo: "조인·WHERE: NULL ≠ NULL / 중복 제거·그룹핑: NULL = NULL"
},
{
  id: "S34", s: 2, tp: "set", lv: 2,
  th: "2과목 | 집합 연산자 문법 (컬럼 수·타입·ORDER BY 위치)",
  q: "다음 중 오류 없이 실행되는 SQL은? (EMP.SAL·DEPT.DEPTNO는 NUMBER, 나머지는 VARCHAR2)",
  sql: "① SELECT ENAME, SAL FROM EMP ORDER BY SAL\n   UNION\n   SELECT DNAME, 0 FROM DEPT;\n\n② SELECT ENAME FROM EMP\n   UNION\n   SELECT DNAME, LOC FROM DEPT;\n\n③ SELECT ENAME AS NM, SAL FROM EMP\n   UNION ALL\n   SELECT DNAME, DEPTNO FROM DEPT\n   ORDER BY NM;\n\n④ SELECT ENAME, SAL FROM EMP\n   UNION\n   SELECT DNAME, LOC FROM DEPT;",
  o: ["①", "②", "③", "④"],
  a: 2,
  why: "집합 연산은 ① 위아래 SELECT의 컬럼 수가 같고 ② 대응 컬럼의 데이터 타입이 호환되어야 하며 ③ ORDER BY는 맨 마지막에 한 번만 쓸 수 있다. 결과 컬럼 이름은 첫 번째 SELECT를 따르므로 ③의 ORDER BY NM은 정상이다.",
  ox: ["중간 SELECT에 ORDER BY를 써서 오류(ORA-00933)다.", "컬럼 수가 1개와 2개로 달라 오류(ORA-01789)다.", "정답.", "SAL(숫자)과 LOC(문자)의 타입이 달라 오류(ORA-01790)다."],
  trap: "컬럼 이름이 달라도(ENAME과 DNAME) 상관없다. 따지는 것은 개수와 타입뿐이다.",
  memo: "개수·타입 일치, ORDER BY는 맨 끝, 이름은 첫 SELECT"
},
{
  id: "S35", s: 2, tp: "sub", lv: 2,
  th: "2과목 | 스칼라 서브쿼리의 단일 행 제약",
  q: "다음 중 실행 시 오류가 발생하는 SQL은?",
  tb: [
    { n: "T1", c: ["A"], r: [[1], [2]] },
    { n: "T2", c: ["A", "B"], r: [[1, 10], [1, 20], [2, 30]] }
  ],
  sql: "① SELECT A, (SELECT MAX(B) FROM T2 WHERE T2.A = T1.A) FROM T1;\n② SELECT A, (SELECT B FROM T2 WHERE T2.A = T1.A) FROM T1;\n③ SELECT A, (SELECT B FROM T2 WHERE T2.A = T1.A AND B > 15) FROM T1;\n④ SELECT A FROM T1 WHERE A IN (SELECT A FROM T2);",
  o: ["①", "②", "③", "④"],
  a: 1,
  why: "SELECT 절에 쓰는 스칼라 서브쿼리는 바깥 행 하나당 '한 행, 한 컬럼'만 돌려줘야 한다. ②는 T1.A = 1일 때 T2에서 10, 20 두 행이 나와 ORA-01427(단일 행 하위 질의에 2개 이상의 행이 리턴되었습니다) 오류가 난다. 결과가 0행이면 오류가 아니라 NULL이다.",
  st: [
    { t: "바깥 행별 서브쿼리 결과", tb: { c: ["T1.A", "①", "②", "③"], r: [[1, "20 (1행)", "10, 20 (2행) → 오류", "20 (1행)"], [2, "30 (1행)", "30", "30 (1행)"]], hl: [0] } }
  ],
  ox: ["MAX로 한 값만 돌려준다.", "정답. A = 1에서 두 행이 반환된다.", "B > 15 조건 때문에 각 A마다 한 행씩만 나온다.", "IN은 여러 행을 받는 다중 행 비교 연산자라 정상이다."],
  trap: "③은 조건 하나 덕분에 우연히 단일 행이 되어 오류가 나지 않는다. 데이터를 직접 대입해 봐야 한다.",
  memo: "스칼라 서브쿼리: 1행 1컬럼, 0행이면 NULL"
},
{
  id: "S36", s: 2, tp: "sub", lv: 2,
  th: "2과목 | 다중 행 비교 연산자 ALL · ANY",
  q: "다음 (가), (나) SQL의 결과 건수로 옳은 것은?",
  tb: [
    { n: "T1", c: ["V"], r: [[10], [20], [30], [40]] },
    { n: "SUB", c: ["V"], r: [[15], [25]] }
  ],
  sql: "(가) SELECT COUNT(*) FROM T1 WHERE V > ALL (SELECT V FROM SUB);\n(나) SELECT COUNT(*) FROM T1 WHERE V > ANY (SELECT V FROM SUB);",
  o: ["(가) 2, (나) 3", "(가) 3, (나) 2", "(가) 1, (나) 3", "(가) 2, (나) 4"],
  a: 0,
  why: "> ALL은 '모든 값보다 크다' = 최댓값(25)보다 크다. > ANY는 '어느 하나보다라도 크다' = 최솟값(15)보다 크다.",
  st: [
    { t: "행별 평가", tb: { c: ["V", "> ALL(15, 25) = > 25", "> ANY(15, 25) = > 15"], r: [[10, "X", "X"], [20, "X", "O"], [30, "O", "O"], [40, "O", "O"]] }, n: "(가) 2건, (나) 3건" }
  ],
  res: { c: ["가", "나"], r: [[2, 3]] },
  pg: "SELECT (SELECT COUNT(*) FROM T1 WHERE V > ALL (SELECT V FROM SUB)), (SELECT COUNT(*) FROM T1 WHERE V > ANY (SELECT V FROM SUB))",
  ox: ["정답.", "ALL과 ANY를 바꾼 경우다.", "ALL을 '두 값 사이'로 본 경우다.", "ANY를 '전체'로 본 경우다."],
  trap: "< ALL은 최솟값보다 작다, < ANY는 최댓값보다 작다. 부등호 방향에 따라 기준값이 바뀐다.",
  memo: "> ALL = > MAX, > ANY = > MIN"
},
{
  id: "S37", s: 2, tp: "sub", lv: 3,
  th: "2과목 | ALL 연산자와 공집합",
  q: "S36과 같은 테이블에 대해 다음 SQL의 결과로 옳은 것은?",
  tb: [
    { n: "T1", c: ["V"], r: [[10], [20], [30], [40]] },
    { n: "SUB", c: ["V"], r: [[15], [25]] }
  ],
  sql: "SELECT COUNT(*)\n  FROM T1\n WHERE V > ALL (SELECT V FROM SUB WHERE V > 100);",
  o: ["0", "4", "NULL", "오류 발생"],
  a: 1,
  why: "서브쿼리 결과가 공집합(0행)이면 '> ALL'은 비교할 대상이 하나도 없으므로 '모든 값보다 크다'는 명제가 공허하게 참(TRUE)이 된다. 그래서 T1의 모든 행이 통과한다. 반대로 '> ANY (공집합)'은 '하나라도 있는가'가 거짓이라 0건이 된다.",
  st: [
    { t: "1단계: 서브쿼리 결과", n: "SUB에 100보다 큰 값이 없음 → 공집합" },
    { t: "2단계: 평가", tb: { c: ["연산", "공집합일 때", "결과 건수"], r: [["> ALL ()", "항상 TRUE", 4], ["> ANY ()", "항상 FALSE", 0]], hl: [0] } }
  ],
  res: { c: ["COUNT"], r: [[4]] },
  pg: "SELECT COUNT(*) FROM T1 WHERE V > ALL (SELECT V FROM SUB WHERE V > 100)",
  ox: ["ANY였다면 0건이다.", "정답.", "COUNT(*)는 NULL을 돌려주지 않는다.", "공집합 서브쿼리는 오류가 아니다."],
  trap: "공집합과 NULL은 다르다. 서브쿼리 결과에 NULL '값'이 있다면 > ALL은 UNKNOWN이 되어 0건이 된다.",
  memo: "ALL(공집합) = TRUE, ANY(공집합) = FALSE"
},
{
  id: "S38", s: 2, tp: "sub", lv: 2,
  th: "2과목 | 연관(상관) 서브쿼리",
  q: "다음 SQL의 결과로 옳은 것은?",
  tb: [{ n: "EMP", c: ["ENAME", "DEPT", "SAL"], r: [["A", 10, 300], ["B", 10, 500], ["C", 20, 400], ["D", 20, 400], ["E", 30, 100]] }],
  sql: "SELECT ENAME\n  FROM EMP E\n WHERE SAL > (SELECT AVG(SAL)\n                FROM EMP\n               WHERE DEPT = E.DEPT);",
  o: ["B", "B, C, D", "B, C", "결과 없음"],
  a: 0,
  why: "연관 서브쿼리는 바깥 쿼리의 컬럼(E.DEPT)을 안에서 참조하므로 바깥 행마다 서브쿼리가 다시 계산된다. 각 사원을 '자기 부서의 평균'과 비교한다.",
  st: [
    { t: "1단계: 부서별 평균", tb: { c: ["DEPT", "AVG(SAL)"], r: [[10, 400], [20, 400], [30, 100]] } },
    { t: "2단계: 행별 비교", tb: { c: ["ENAME", "SAL", "부서 평균", "SAL > 평균"], r: [["A", 300, 400, "X"], ["B", 500, 400, "O"], ["C", 400, 400, "X"], ["D", 400, 400, "X"], ["E", 100, 100, "X"]], hl: [1] } }
  ],
  res: { c: ["ENAME"], r: [["B"]] },
  pg: "SELECT ENAME FROM EMP E WHERE SAL > (SELECT AVG(SAL) FROM EMP WHERE DEPT = E.DEPT)",
  ox: ["정답.", "전체 평균(340)과 비교한 경우다.", "C, D는 부서 평균(400)과 같아 > 조건을 통과하지 못한다. >=였다면 B, C, D가 된다.", "근거 없는 값이다."],
  trap: "C, D는 평균과 '같으므로' > 조건을 통과하지 못한다.",
  memo: "연관 서브쿼리 = 바깥 행마다 재실행"
},
{
  id: "S39", s: 2, tp: "pivot", lv: 2,
  th: "2과목 | PIVOT 결과와 NULL",
  q: "다음 SQL의 결과에서 DEPT가 20인 행의 Q1, Q2 값으로 옳은 것은?",
  tb: [{ n: "SALES", c: ["DEPT", "QTR", "AMT"], r: [[10, "Q1", 100], [10, "Q2", 200], [10, "Q1", 50], [20, "Q2", 300], [20, "Q3", 100]] }],
  sql: "SELECT *\n  FROM (SELECT DEPT, QTR, AMT FROM SALES)\n PIVOT (SUM(AMT) FOR QTR IN ('Q1' AS Q1, 'Q2' AS Q2));",
  o: ["NULL, 300", "0, 300", "NULL, 400", "DEPT 20 행은 출력되지 않는다"],
  a: 0,
  why: "PIVOT은 FOR 절 컬럼(QTR)의 값을 새 컬럼으로 펼치고, 나머지 컬럼(DEPT)으로 그룹을 만든다. 각 칸에는 해당 조합의 집계값이 들어가며, 데이터가 없는 칸은 0이 아니라 NULL이다. IN 목록에 없는 Q3는 컬럼으로 만들어지지 않을 뿐, DEPT 20 그룹 자체는 Q2 데이터가 있으므로 출력된다.",
  st: [
    { t: "1단계: 그룹 (DEPT) × 펼칠 값 (QTR)", tb: { c: ["DEPT", "QTR = 'Q1'", "QTR = 'Q2'"], r: [[10, "100 + 50", "200"], [20, "없음", "300"]] } },
    { t: "2단계: 최종 결과", tb: { c: ["DEPT", "Q1", "Q2"], r: [[10, 150, 200], [20, null, 300]], hl: [1] } }
  ],
  res: { c: ["DEPT", "Q1", "Q2"], r: [[10, 150, 200], [20, null, 300]] },
  pg: "SELECT DEPT, SUM(AMT) FILTER (WHERE QTR = 'Q1') Q1, SUM(AMT) FILTER (WHERE QTR = 'Q2') Q2 FROM SALES GROUP BY DEPT ORDER BY DEPT",
  ox: ["정답.", "빈 칸을 0으로 채운다고 본 경우다.", "Q3 값(100)까지 Q2에 더한 경우다.", "IN 목록에 없는 값이 섞여도 그룹은 사라지지 않는다."],
  trap: "인라인 뷰 없이 PIVOT을 바로 쓰면 테이블의 모든 나머지 컬럼이 그룹 기준이 되어 결과가 달라진다. 그래서 필요한 컬럼만 인라인 뷰로 골라낸다.",
  memo: "PIVOT(집계 FOR 컬럼 IN (값들)) — 빈 칸은 NULL"
},
{
  id: "S40", s: 2, tp: "pivot", lv: 2,
  th: "2과목 | UNPIVOT과 NULL 제외",
  q: "다음 SQL의 결과 행 수는?",
  tb: [{ n: "T", c: ["ID", "Q1", "Q2", "Q3"], r: [[1, 100, null, 300], [2, null, null, 50]] }],
  sql: "SELECT *\n  FROM T\nUNPIVOT (AMT FOR QTR IN (Q1, Q2, Q3));",
  o: ["2", "3", "4", "6"],
  a: 1,
  why: "UNPIVOT은 여러 컬럼을 행으로 세운다. 기본 옵션은 EXCLUDE NULLS라서 값이 NULL인 칸은 행으로 만들지 않는다. 6칸 중 NULL 3칸을 빼면 3행이다. NULL도 포함하려면 UNPIVOT INCLUDE NULLS를 쓴다.",
  st: [
    { t: "칸별 변환", tb: { c: ["ID", "QTR", "AMT", "기본(EXCLUDE NULLS)"], r: [[1, "Q1", 100, "출력"], [1, "Q2", null, "제외"], [1, "Q3", 300, "출력"], [2, "Q1", null, "제외"], [2, "Q2", null, "제외"], [2, "Q3", 50, "출력"]] } }
  ],
  res: { c: ["COUNT"], r: [[3]] },
  pg: "SELECT COUNT(*) FROM T CROSS JOIN LATERAL (VALUES ('Q1', T.Q1), ('Q2', T.Q2), ('Q3', T.Q3)) U(QTR, AMT) WHERE U.AMT IS NOT NULL",
  ox: ["행 수가 원본과 같다고 본 경우다.", "정답.", "근거 없는 값이다.", "INCLUDE NULLS일 때의 결과다."],
  trap: "옵션을 생략하면 EXCLUDE NULLS다.",
  memo: "UNPIVOT 기본 = NULL 제외"
},
{
  id: "S41", s: 2, tp: "regex", lv: 2,
  th: "2과목 | REGEXP_SUBSTR 발생 순번",
  q: "다음 SQL의 결과로 옳은 것은?",
  sql: "SELECT REGEXP_SUBSTR('SQLD-62-PASS-2026', '[0-9]+', 1, 2) AS R\n  FROM DUAL;",
  o: ["'62'", "'2026'", "'622026'", "NULL"],
  a: 1,
  why: "REGEXP_SUBSTR(문자열, 패턴, 시작 위치, 발생 순번)은 시작 위치부터 패턴에 맞는 부분을 찾아 그중 '발생 순번' 번째를 돌려준다. [0-9]+는 '숫자 1개 이상 연속'이고, 정규표현식은 가능한 한 길게(최장) 일치한다.",
  st: [
    { t: "일치 부분 찾기", tb: { c: ["순번", "일치 문자열", "위치"], r: [[1, "62", "6~7"], [2, "2026", "14~17"]], hl: [1] } }
  ],
  res: { c: ["R"], r: [["2026"]] },
  pg: "SELECT REGEXP_SUBSTR('SQLD-62-PASS-2026', '[0-9]+', 1, 2)",
  ox: ["첫 번째 일치다.", "정답.", "일치 부분을 모두 이어 붙인 경우다.", "두 번째 일치가 존재한다."],
  trap: "[0-9]+는 한 자리씩이 아니라 연속된 숫자 전체를 한 덩어리로 잡는다. 한 자리씩이었다면 2번째는 '2'다.",
  memo: "REGEXP_SUBSTR(문자, 패턴, 시작, 몇 번째)"
},
{
  id: "S42", s: 2, tp: "regex", lv: 2,
  th: "2과목 | REGEXP_COUNT · REGEXP_INSTR",
  q: "다음 SQL의 결과로 옳은 것은?",
  sql: "SELECT REGEXP_COUNT('a1b22c333', '[0-9]+') AS C,\n       REGEXP_INSTR('ABC123DEF', '[0-9]')   AS P\n  FROM DUAL;",
  o: ["3, 4", "6, 4", "3, 6", "6, 6"],
  a: 0,
  why: "REGEXP_COUNT는 패턴이 몇 번 일치하는지 센다. [0-9]+는 연속 숫자를 한 덩어리로 잡으므로 '1', '22', '333' 세 번이다. REGEXP_INSTR은 처음 일치하는 위치(1부터 셈)를 돌려준다.",
  st: [
    { t: "계산", tb: { c: ["함수", "과정", "결과"], r: [["REGEXP_COUNT", "1 / 22 / 333", 3], ["REGEXP_INSTR", "A1 B2 C3 '1'4 → 4번째 위치", 4]] } }
  ],
  res: { c: ["C", "P"], r: [[3, 4]] },
  pg: "SELECT REGEXP_COUNT('a1b22c333', '[0-9]+'), REGEXP_INSTR('ABC123DEF', '[0-9]')",
  ox: ["정답.", "숫자 글자 수(6)를 센 경우다.", "INSTR이 마지막 숫자 위치를 준다고 본 경우다.", "두 함수 모두 잘못 계산한 경우다."],
  trap: "패턴의 '+' 유무로 COUNT 결과가 달라진다. '[0-9]'였다면 6이다.",
  memo: "+ = 1회 이상(최장 일치), * = 0회 이상, ? = 0~1회"
},
{
  id: "S43", s: 2, tp: "notin", lv: 2,
  th: "2과목 | IN / NOT IN 목록에 NULL이 있을 때",
  q: "다음 (가), (나) SQL의 결과 건수로 옳은 것은?",
  tb: [{ n: "T", c: ["COL"], r: [[10], [20], [null]] }],
  sql: "(가) SELECT COUNT(*) FROM T WHERE COL IN (10, NULL);\n(나) SELECT COUNT(*) FROM T WHERE COL NOT IN (10, NULL);",
  o: ["(가) 1, (나) 0", "(가) 1, (나) 1", "(가) 2, (나) 0", "(가) 1, (나) 2"],
  a: 0,
  why: "IN은 OR로 풀린다: COL = 10 OR COL = NULL. 'COL = NULL'은 UNKNOWN이지만 TRUE OR UNKNOWN = TRUE이므로 10인 행은 통과한다. NOT IN은 AND로 풀린다: COL <> 10 AND COL <> NULL. 'COL <> NULL'이 항상 UNKNOWN이라 어떤 행도 TRUE가 되지 못한다.",
  st: [
    { t: "행별 평가", tb: { c: ["COL", "(가) =10 OR =NULL", "(나) <>10 AND <>NULL"], r: [[10, "TRUE OR UNKNOWN = TRUE", "FALSE AND UNKNOWN = FALSE"], [20, "FALSE OR UNKNOWN = UNKNOWN", "TRUE AND UNKNOWN = UNKNOWN"], [null, "UNKNOWN", "UNKNOWN"]] } }
  ],
  res: { c: ["가", "나"], r: [[1, 0]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE COL IN (10, NULL)), (SELECT COUNT(*) FROM T WHERE COL NOT IN (10, NULL))",
  ox: ["정답.", "NOT IN에서 20이 살아남는다고 본 경우다.", "COL이 NULL인 행이 IN (NULL)에 걸린다고 본 경우다.", "NOT IN이 NULL을 무시한다고 본 경우다."],
  trap: "COL이 NULL인 행은 IN (…, NULL)로도 찾을 수 없다. NULL 행은 IS NULL로만 찾는다.",
  memo: "IN = OR (NULL 무해) / NOT IN = AND (NULL 치명)"
},
{
  id: "S44", s: 2, tp: "join", lv: 2,
  th: "2과목 | 셀프 조인과 아우터 셀프 조인",
  q: "S26과 같은 [EMP] 테이블에서 사원과 그 관리자 이름을 함께 조회한다. (가), (나)의 결과 행 수는?",
  tb: [{ n: "EMP", c: ["EMPNO", "ENAME", "MGR"], r: [[1, "KING", null], [2, "JONES", 1], [3, "BLAKE", 1], [4, "SCOTT", 2], [5, "FORD", 2], [6, "ALLEN", 3]] }],
  sql: "(가) SELECT E.ENAME, M.ENAME\n      FROM EMP E, EMP M\n     WHERE E.MGR = M.EMPNO;\n\n(나) SELECT E.ENAME, M.ENAME\n      FROM EMP E LEFT OUTER JOIN EMP M\n        ON E.MGR = M.EMPNO;",
  o: ["(가) 5, (나) 6", "(가) 6, (나) 6", "(가) 5, (나) 5", "(가) 6, (나) 5"],
  a: 0,
  why: "셀프 조인은 같은 테이블을 별칭 두 개(E: 사원, M: 관리자)로 나눠 조인한다. KING은 MGR이 NULL이라 등가 조인 조건을 만족하는 관리자 행이 없어 (가)에서 빠진다. (나)는 사원 쪽(E)을 보존하므로 KING도 관리자 이름이 NULL인 채로 남는다.",
  st: [
    { t: "(나) 결과", tb: { c: ["E.ENAME", "M.ENAME"], r: [["KING", null], ["JONES", "KING"], ["BLAKE", "KING"], ["SCOTT", "JONES"], ["FORD", "JONES"], ["ALLEN", "BLAKE"]], hl: [0] }, n: "(가)는 첫 행(KING)이 빠진 5행" }
  ],
  res: { c: ["가", "나"], r: [[5, 6]] },
  pg: "SELECT (SELECT COUNT(*) FROM EMP E, EMP M WHERE E.MGR = M.EMPNO), (SELECT COUNT(*) FROM EMP E LEFT OUTER JOIN EMP M ON E.MGR = M.EMPNO)",
  ox: ["정답.", "KING도 등가 조인에 포함된다고 본 경우다.", "아우터 조인에서 KING이 보존된다는 점을 놓친 경우다.", "두 결과를 바꾼 경우다."],
  trap: "셀프 조인에서 E.MGR = M.EMPNO와 E.EMPNO = M.MGR은 방향이 반대다. 앞은 '내 관리자', 뒤는 '내 부하'를 찾는다.",
  memo: "셀프 조인 = 같은 테이블, 다른 별칭"
}
);
