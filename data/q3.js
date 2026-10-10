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
  sum: "부하 쪽으로 한 가지씩 끝까지 내려간 뒤 다음 형제로 가요. 형제끼리만 이름순이라 KING → BLAKE → ALLEN → JONES → FORD → SCOTT이에요.",
  why: "계층형 질의는 START WITH로 꼭대기(루트)를 고르고, CONNECT BY 조건으로 '현재 행의 자식'을 찾아 내려가요.\n\nPRIOR가 붙은 쪽은 이미 방문한 부모 행이에요. 그래서 PRIOR EMPNO = MGR은 '부모의 사번을 MGR로 가진 행', 즉 부하를 찾아요. 위에서 아래로 내려가는 순방향이에요.\n\nOracle은 한 사람을 출력하면 그 부하들을 끝까지 다 내려간 뒤에 다음 형제로 넘어가요. 이것을 깊이 우선이라고 해요.\n\n**ORDER SIBLINGS BY ENAME은 트리 모양은 그대로 두고, 같은 상사를 둔 형제끼리만 이름순으로 바꿔요.**\n\n그래서 KING 아래에서 BLAKE가 JONES보다 먼저, JONES 아래에서 FORD가 SCOTT보다 먼저 나와요. 결과는 KING → BLAKE → ALLEN → JONES → FORD → SCOTT이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT LEVEL, ENAME               -- ④ 깊이 우선 순서로 출력\n  FROM EMP\n START WITH MGR IS NULL           -- ① 꼭대기 = KING (LEVEL 1)\nCONNECT BY PRIOR EMPNO = MGR      -- ② 부모 사번 = 자식 MGR → 아래로 내려감\n ORDER SIBLINGS BY ENAME;         -- ③ 형제끼리만 이름순: BLAKE<JONES, FORD<SCOTT" },
    { t: "1단계: 트리 구조", n: "KING(1)\n├─ BLAKE(3)\n│   └─ ALLEN(6)\n└─ JONES(2)\n    ├─ FORD(5)\n    └─ SCOTT(4)\n※ 형제는 이름순: BLAKE < JONES, FORD < SCOTT" },
    { t: "2단계: 깊이 우선 출력", tb: { c: ["출력 순서", "LEVEL", "ENAME"], r: [[1, 1, "KING"], [2, 2, "BLAKE"], [3, 3, "ALLEN"], [4, 2, "JONES"], [5, 3, "FORD"], [6, 3, "SCOTT"]] } },
    { t: "비교: 그냥 ORDER BY를 쓰면", n: "-- ORDER SIBLINGS BY 대신 ORDER BY를 쓰면 트리 모양이 무너진다\nSELECT LEVEL, ENAME\n  FROM EMP\n START WITH MGR IS NULL\nCONNECT BY PRIOR EMPNO = MGR\n ORDER BY ENAME;   -- ALLEN, BLAKE, FORD, JONES, KING, SCOTT (보기 ④)" }
  ],
  res: { c: ["LEVEL", "ENAME"], r: [[1, "KING"], [2, "BLAKE"], [3, "ALLEN"], [2, "JONES"], [3, "FORD"], [3, "SCOTT"]] },
  pg: "WITH RECURSIVE H AS (SELECT EMPNO, ENAME, 1 LV, ARRAY[ENAME] P FROM EMP WHERE MGR IS NULL UNION ALL SELECT E.EMPNO, E.ENAME, H.LV + 1, H.P || E.ENAME FROM EMP E JOIN H ON E.MGR = H.EMPNO) SELECT LV, ENAME FROM H ORDER BY P",
  ox: ["정답이에요.", "이렇게 생각하면 틀려요: 'LEVEL 1, 2, 3 순서로 층별로 나온다.' 계층형 질의는 한 가지를 끝까지 내려간 뒤 형제로 가요.", "이렇게 생각하면 틀려요: 'KING 바로 아래 형제는 입력 순서(JONES 먼저)대로 둔다.' ORDER SIBLINGS BY는 모든 단계의 형제에 똑같이 적용돼서, 이름순으로 BLAKE가 JONES보다 먼저예요.", "이렇게 생각하면 틀려요: 'SIBLINGS도 전체를 이름순으로 정렬한다.' 그건 일반 ORDER BY예요. SIBLINGS는 트리를 깨지 않아요."],
  trap: "ORDER SIBLINGS BY 대신 일반 ORDER BY ENAME을 쓰면 트리 모양이 무너지고 단순 이름순(④)이 돼요.",
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
  sum: "PRIOR MGR = EMPNO는 '방금 본 사람의 상사'를 다음으로 찾아요. FORD에서 위로 올라가 FORD(1) → JONES(2) → KING(3)이에요.",
  why: "CONNECT BY에서 PRIOR는 '방금 출력한 행'의 컬럼을 가리켜요.\n\nPRIOR MGR = EMPNO는 '방금 본 행의 MGR과 같은 사번을 가진 행'을 찾아요. 즉 내 상사를 찾아 아래에서 위로 올라가는 역방향이에요.\n\nPRIOR를 어디에 붙이느냐가 방향을 정해요. PRIOR 쪽은 이미 아는 행이고, 반대쪽은 새로 찾을 행이기 때문이에요.\n\n**LEVEL은 회사 조직도의 층이 아니라, START WITH 행을 1로 놓고 몇 단계 이동했는지예요.**\n\nFORD(MGR 2) → JONES(MGR 1) → KING(MGR 비어 있음, 더 찾을 사람 없음) 순이에요. 그래서 (1, FORD) → (2, JONES) → (3, KING)이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT LEVEL, ENAME            -- ③ 1 FORD, 2 JONES, 3 KING\n  FROM EMP\n START WITH ENAME = 'FORD'     -- ① 출발점 FORD = LEVEL 1\nCONNECT BY PRIOR MGR = EMPNO;  -- ② 방금 본 행의 MGR을 사번으로 가진 행 = 상사 → 위로" },
    { t: "단계별 이동", tb: { c: ["LEVEL", "현재 행", "PRIOR MGR", "다음 행(EMPNO = PRIOR MGR)"], r: [[1, "FORD", 2, "JONES"], [2, "JONES", 1, "KING"], [3, "KING", null, "없음 → 종료"]] } }
  ],
  res: { c: ["LEVEL", "ENAME"], r: [[1, "FORD"], [2, "JONES"], [3, "KING"]] },
  pg: "WITH RECURSIVE H AS (SELECT EMPNO, ENAME, MGR, 1 LV FROM EMP WHERE ENAME = 'FORD' UNION ALL SELECT E.EMPNO, E.ENAME, E.MGR, H.LV + 1 FROM EMP E JOIN H ON E.EMPNO = H.MGR) SELECT LV, ENAME FROM H ORDER BY LV",
  ox: ["정답이에요.", "이렇게 생각하면 틀려요: 'PRIOR 위치와 상관없이 늘 부하를 찾는다.' 그러면 부하 없는 FORD 1행만 나오지만, 이 SQL은 상사를 찾아 올라가요.", "이렇게 생각하면 틀려요: 'LEVEL은 꼭대기(KING)가 항상 1이다.' LEVEL은 출발점(FORD)이 1이에요.", "이렇게 생각하면 틀려요: '형제(SCOTT)도 따라 나온다.' SCOTT은 상사(JONES)를 거쳐 다시 내려가야 닿는데, 이 SQL은 위로만 올라가요."],
  trap: "역방향에서는 출발점(FORD)이 LEVEL 1, 꼭대기 KING이 LEVEL 3이에요.",
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
  sum: "CONNECT_BY_ISLEAF는 부하가 없는 사람이면 1이에요. ALLEN, FORD, SCOTT 3명이고, 가장 깊은 층은 3이라 3, 3이에요.",
  why: "CONNECT_BY_ISLEAF는 트리에서 그 행 아래로 더 내려갈 자식이 없으면 1, 있으면 0이에요. 자식이 없는 끝 노드를 리프(잎)라고 불러요.\n\n**리프는 '가장 깊은 층'이 아니라 '가지가 끝나는 모든 노드'예요.** 층이 달라도 자식만 없으면 1이에요.\n\nLEVEL은 꼭대기가 1이고 한 단계 내려갈 때마다 1씩 커져요.\n\n이 트리에서 자식이 없는 사람은 ALLEN, FORD, SCOTT 세 명이라 SUM은 3이에요. KING, JONES, BLAKE는 부하가 있어서 0이에요. 가장 깊은 사람은 LEVEL 3이라 MAX(LEVEL)은 3이에요.\n\n그래서 3, 3이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT SUM(CONNECT_BY_ISLEAF) AS LEAF_CNT,  -- ③ 부하 없는 ALLEN, FORD, SCOTT이 1씩 → 3\n       MAX(LEVEL)             AS DEPTH      -- ③ 가장 깊은 단계 → 3\n  FROM EMP\n START WITH MGR IS NULL                     -- ① 꼭대기 KING\nCONNECT BY PRIOR EMPNO = MGR;               -- ② 아래로 전개 → 6행" },
    { t: "노드별 값", tb: { c: ["ENAME", "LEVEL", "자식", "CONNECT_BY_ISLEAF"], r: [["KING", 1, "JONES, BLAKE", 0], ["BLAKE", 2, "ALLEN", 0], ["ALLEN", 3, "없음", 1], ["JONES", 2, "SCOTT, FORD", 0], ["FORD", 3, "없음", 1], ["SCOTT", 3, "없음", 1]], hl: [2, 4, 5] } }
  ],
  res: { c: ["LEAF_CNT", "DEPTH"], r: [[3, 3]] },
  pg: "WITH RECURSIVE H AS (SELECT EMPNO, 1 LV FROM EMP WHERE MGR IS NULL UNION ALL SELECT E.EMPNO, H.LV + 1 FROM EMP E JOIN H ON E.MGR = H.EMPNO) SELECT SUM(CASE WHEN NOT EXISTS (SELECT 1 FROM EMP C WHERE C.MGR = H.EMPNO) THEN 1 ELSE 0 END), MAX(LV) FROM H",
  ox: ["정답이에요.", "이렇게 생각하면 틀려요: '리프는 맨 아래층만이다.' 그래도 ALLEN은 LEVEL 3이라 들어가요. ALLEN을 빠뜨리면 2가 돼요.", "이렇게 생각하면 틀려요: 'LEVEL은 0부터 시작한다.' LEVEL은 꼭대기가 1이라 가장 깊은 층은 3이에요.", "이렇게 생각하면 틀려요: '꼭대기 KING도 리프다.' KING은 부하가 있어서 0이에요."],
  trap: "ISLEAF는 '가장 깊은 LEVEL'이 아니라 '자식이 없는 노드'예요. ALLEN처럼 다른 가지의 끝도 리프예요.",
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
  sum: "CONNECT BY에 넣은 조건은 JONES로 가는 길 자체를 막아서 그 아래(SCOTT, FORD)까지 잘려요. WHERE는 다 만든 뒤 JONES 한 줄만 빼요. 그래서 3, 5예요.",
  why: "계층형 질의는 START WITH와 CONNECT BY로 트리를 먼저 다 만들고, 그 뒤에 WHERE의 일반 조건을 적용해요.\n\nCONNECT BY 안의 조건은 '이 자식으로 내려갈 수 있나'를 정해요. **조건에 걸린 사람은 안 나올 뿐 아니라, 그 사람을 거쳐야만 닿는 아래 사람들도 함께 잘려요.** 이것을 가지치기라고 해요.\n\nWHERE는 다 만들어진 결과에서 줄을 하나씩 걸러요. 그래서 걸린 사람만 빠지고 그 아래 사람들은 남아요.\n\n(가)는 JONES로 내려가는 길이 막혀서 JONES, SCOTT, FORD가 빠져요. KING, BLAKE, ALLEN 3행이에요. (나)는 6행을 다 만든 뒤 JONES 한 줄만 빼서 5행이에요.\n\n참고로 꼭대기 KING은 START WITH 조건만 맞으면 나와요. CONNECT BY 조건은 검사하지 않아요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- (가) 조건이 CONNECT BY 안에 있음\nSELECT ENAME FROM EMP\n START WITH MGR IS NULL                             -- ① 꼭대기 KING (CONNECT BY 조건 검사 안 함)\nCONNECT BY PRIOR EMPNO = MGR AND ENAME <> 'JONES';  -- ② JONES로 못 내려감 → SCOTT·FORD도 못 감 → 3행\n\n-- (나) 조건이 WHERE에 있음\nSELECT ENAME FROM EMP\n WHERE ENAME <> 'JONES'                             -- ③ 다 만든 6행에서 JONES 한 줄만 뺌 → 5행\n START WITH MGR IS NULL                             -- ① 꼭대기 KING\nCONNECT BY PRIOR EMPNO = MGR;                       -- ② 6행 전개" },
    { t: "(가) CONNECT BY에서 가지치기", tb: { c: ["ENAME", "결과"], r: [["KING", "출력"], ["JONES", "연결 불가 → 하위 전체 차단"], ["SCOTT", "도달 불가"], ["FORD", "도달 불가"], ["BLAKE", "출력"], ["ALLEN", "출력"]] }, n: "3행이에요." },
    { t: "(나) 전개 후 WHERE 필터", tb: { c: ["ENAME", "결과"], r: [["KING", "출력"], ["JONES", "WHERE에서 제거"], ["SCOTT", "출력"], ["FORD", "출력"], ["BLAKE", "출력"], ["ALLEN", "출력"]] }, n: "5행이에요." }
  ],
  res: { c: ["가", "나"], r: [[3, 5]] },
  pg: "WITH RECURSIVE A AS (SELECT EMPNO, ENAME FROM EMP WHERE MGR IS NULL UNION ALL SELECT E.EMPNO, E.ENAME FROM EMP E JOIN A ON E.MGR = A.EMPNO AND E.ENAME <> 'JONES'), B AS (SELECT EMPNO, ENAME FROM EMP WHERE MGR IS NULL UNION ALL SELECT E.EMPNO, E.ENAME FROM EMP E JOIN B ON E.MGR = B.EMPNO) SELECT (SELECT COUNT(*) FROM A), (SELECT COUNT(*) FROM B WHERE ENAME <> 'JONES')",
  ox: ["정답이에요.", "이렇게 생각하면 틀려요: 'WHERE가 가지째 자르고, CONNECT BY는 한 줄만 뺀다.' 역할이 반대예요.", "이렇게 생각하면 틀려요: 'CONNECT BY 조건도 그 줄만 지운다.' JONES로 가는 길이 막히면 그 아래 SCOTT, FORD도 닿을 수 없어요.", "이렇게 생각하면 틀려요: 'WHERE도 가지를 자른다.' WHERE는 다 만든 뒤 그 줄만 빼서 5행이에요."],
  trap: "START WITH로 고른 꼭대기 행에는 CONNECT BY 조건이 적용되지 않아요. 꼭대기는 START WITH 조건만 맞으면 출력돼요.",
  memo: "CONNECT BY 조건 = 가지째 / WHERE 조건 = 그 행만"
},
{
  id: "S30", s: 2, tp: "topn", lv: 1,
  th: "2과목 | ROWNUM의 부여 원리",
  q: "5개 행이 있는 [EMP] 테이블에 대해 다음 SQL 중 결과가 0건인 것은? (Oracle 기준)",
  sql: "① SELECT * FROM EMP WHERE ROWNUM <= 3;\n② SELECT * FROM EMP WHERE ROWNUM = 1;\n③ SELECT * FROM EMP WHERE ROWNUM > 1;\n④ SELECT * FROM EMP WHERE ROWNUM BETWEEN 1 AND 2;",
  o: ["①", "②", "③", "④"],
  a: 2,
  sum: "ROWNUM은 통과한 줄에 1번부터 차례로 붙어요. 'ROWNUM > 1'은 1번이 통과를 못 해서 2번이 영영 생기지 않아 0건이에요.",
  why: "ROWNUM은 표에 저장된 값이 아니에요. 줄을 하나 읽어 WHERE를 통과시킬 때마다 그 순간 1, 2, 3…을 붙이는 번호예요.\n\n조건을 검사받는 줄의 ROWNUM은 '지금까지 통과한 줄 수 + 1'이에요. 통과해야만 그 번호가 확정되고, 다음 번호가 2로 올라가요.\n\nROWNUM > 1을 보면, 첫 줄은 ROWNUM 1로 검사받아 1 > 1이 거짓이라 떨어져요. 통과한 줄이 없으니 다음 줄도 다시 1로 검사받아 또 떨어져요.\n\n**결국 2번이 될 줄이 영영 나오지 않아 0건이에요.**\n\n①②④는 1번부터 차례로 통과할 수 있어서 각각 3건, 1건, 2건이에요.",
  st: [
    { t: "보기별 판정", tb: { c: ["보기", "조건", "처리", "건수"], r: [["①", "ROWNUM <= 3", "1, 2, 3번까지 통과", 3], ["②", "ROWNUM = 1", "첫 줄만 통과", 1], ["③", "ROWNUM > 1", "1번이 떨어지니 2번이 안 생김", 0], ["④", "BETWEEN 1 AND 2", "1, 2번 통과", 2]], hl: [2] } },
    { t: "③ 처리 과정", tb: { c: ["읽은 행", "후보 ROWNUM", "ROWNUM > 1", "결과"], r: [["1번째", 1, "거짓", "탈락 (번호 미사용)"], ["2번째", 1, "거짓", "탈락"], ["…", 1, "거짓", "탈락"]] } },
    { t: "예시와 의도대로 쓰려면", n: "-- 0건: 1번이 통과하지 못하면 2번은 생기지 않는다\nSELECT * FROM EMP WHERE ROWNUM > 1;     -- 0건\nSELECT * FROM EMP WHERE ROWNUM = 2;     -- 0건\n\n-- 2번째 줄부터 원하면: 번호를 인라인 뷰에서 먼저 확정한다\nSELECT *\n  FROM (SELECT ROWNUM AS RN, E.* FROM EMP E)\n WHERE RN > 1;                          -- 4건 (RN 2~5)" }
  ],
  ox: ["이렇게 생각하면 틀려요: 'ROWNUM 조건은 다 0건이다.' 1, 2, 3번이 차례로 붙어 3건이에요.", "이렇게 생각하면 틀려요: '= 조건은 안 된다.' 첫 줄이 1번이라 1건이에요.", "정답이에요. 1번이 통과하지 못해 2번이 생기지 않아요. ROWNUM = 2도 마찬가지로 0건이에요.", "이렇게 생각하면 틀려요: 'BETWEEN은 ROWNUM에 못 쓴다.' 1번부터 시작하니 1, 2번이 붙어 2건이에요."],
  trap: "ROWNUM = 2도 0건이에요. 1번을 거치지 않으면 2번이 생길 수 없어요.",
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
  sum: "ROWNUM(WHERE)이 정렬(ORDER BY)보다 먼저 실행돼요. 그래서 먼저 읽힌 A, B 두 명을 고른 뒤 그 둘만 급여순으로 정렬해 B, A예요.",
  why: "ROWNUM은 WHERE 단계에서 읽는 순서대로 붙어요. ORDER BY는 SELECT까지 끝난 뒤 맨 마지막에 실행돼요.\n\n**그래서 이 SQL은 '급여가 높은 2명'이 아니라 '먼저 읽힌 2명을 고른 뒤 그 둘만 정렬'하는 쿼리예요.**\n\n정렬이 번호 붙이기보다 늦기 때문에, 같은 SELECT 안에서는 ORDER BY가 누구를 고를지에 영향을 주지 못해요.\n\n이 표는 A, B, C, D 순서로 읽혀요. A(100)가 1번, B(400)가 2번으로 골라져요. 그다음 SAL 높은 순으로 정렬해서 B, A예요.\n\n진짜 상위 2명은 인라인 뷰에서 먼저 정렬하고, 바깥에서 ROWNUM을 걸어야 구할 수 있어요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT ENAME, SAL       -- ③ A(100), B(400)\n  FROM EMP              -- ① 입력 순서 A, B, C, D로 읽음\n WHERE ROWNUM <= 2      -- ② 읽은 순서로 1번 A, 2번 B → 여기서 2명 확정\n ORDER BY SAL DESC;     -- ④ 남은 2명만 정렬 → B, A" },
    { t: "1단계: WHERE ROWNUM <= 2", tb: { c: ["ENAME", "SAL", "ROWNUM"], r: [["A", 100, 1], ["B", 400, 2]] } },
    { t: "2단계: ORDER BY SAL DESC", tb: { c: ["ENAME", "SAL"], r: [["B", 400], ["A", 100]] } },
    { t: "의도대로 쓰려면", n: "-- 먼저 정렬하고(인라인 뷰), 그 결과에 번호를 붙인다\nSELECT *\n  FROM (SELECT ENAME, SAL\n          FROM EMP\n         ORDER BY SAL DESC)\n WHERE ROWNUM <= 2;          -- B(400), C(300)\n\n-- Oracle 12c 이상\nSELECT ENAME, SAL\n  FROM EMP\n ORDER BY SAL DESC\n FETCH FIRST 2 ROWS ONLY;    -- B(400), C(300)" }
  ],
  ox: ["이렇게 생각하면 틀려요: 'ORDER BY가 ROWNUM보다 먼저다.' B, C는 인라인 뷰에서 먼저 정렬했을 때(올바른 TOP-N)의 결과예요.", "정답이에요.", "이렇게 생각하면 틀려요: 'ORDER BY는 적용되지 않는다.' 2명으로 줄인 뒤 정렬은 일어나서 B가 먼저예요.", "이렇게 생각하면 틀려요: 'C도 뽑힌다.' C는 세 번째로 읽혀서 ROWNUM <= 2를 통과하지 못해요."],
  trap: "보기 ①(진짜 상위 2명)이 상식으로는 맞아 보여서 고르기 쉬워요. 실행 순서를 먼저 떠올리세요.",
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
  sum: "WITH TIES는 2번째 줄과 점수가 같은 줄까지 함께 가져와요. 2번째 B(400)와 같은 C(400)도 나와서 3행이에요.",
  why: "FETCH FIRST n ROWS ONLY는 정렬한 결과에서 앞의 n줄만 잘라요.\n\n그런데 n번째 줄과 값이 같은 줄이 뒤에 있으면, 누구를 넣을지가 우연에 맡겨져요. **WITH TIES를 붙이면 n번째 줄과 ORDER BY 값이 같은 줄까지 모두 함께 돌려줘요.**\n\n정렬하면 A(500), B(400), C(400), D(300)이에요. 2번째 줄은 B(400)이고, C도 400이라 함께 나와요. D(300)는 값이 달라 빠져요.\n\n그래서 3행이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT ENAME, SAL\n  FROM EMP                       -- ① 4행\n ORDER BY SAL DESC              -- ② A 500, B 400, C 400, D 300\n FETCH FIRST 2 ROWS WITH TIES;  -- ③ 2번째(B 400)와 같은 값인 C까지 → 3행" },
    { t: "정렬 후 선택", tb: { c: ["순서", "ENAME", "SAL", "선택"], r: [[1, "A", 500, "O"], [2, "B", 400, "O (2번째)"], [3, "C", 400, "O (2번째와 동점)"], [4, "D", 300, "X"]], hl: [2] } },
    { t: "비교: ROWS ONLY", n: "SELECT ENAME, SAL\n  FROM EMP\n ORDER BY SAL DESC\n FETCH FIRST 2 ROWS ONLY;   -- 2행: A와 (B 또는 C 중 하나, 같은 값이라 누가 나올지 정해져 있지 않음)" }
  ],
  res: { c: ["COUNT"], r: [[3]] },
  pg: "SELECT COUNT(*) FROM (SELECT ENAME, SAL FROM EMP ORDER BY SAL DESC FETCH FIRST 2 ROWS WITH TIES) X",
  ox: ["이렇게 생각하면 틀려요: '동점 때문에 2번째를 못 정해 1행만 나온다.' 동점은 오히려 함께 나와요.", "이렇게 생각하면 틀려요: 'WITH TIES도 딱 2줄만 자른다.' 그건 ROWS ONLY예요.", "정답이에요.", "이렇게 생각하면 틀려요: '전부 나온다.' D(300)는 2번째 줄 값(400)과 달라서 빠져요."],
  trap: "WITH TIES는 ORDER BY가 반드시 있어야 의미가 있어요.",
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
  sum: "집합 연산에서 중복을 지울 때는 빈 값(NULL)끼리 같은 값으로 봐요. 그래서 INTERSECT는 {2, 3, NULL} 3건이고, '2건'이라는 ③이 틀렸어요.",
  why: "UNION, INTERSECT, MINUS는 결과에서 중복 줄을 하나로 줄여요. UNION ALL만 중복을 그대로 둬요.\n\n중복인지 볼 때는 '두 값을 구별할 수 있나'로 판단해요. 이때는 빈 값(NULL)과 빈 값을 같은 것으로 봐요.\n\n**WHERE나 조인의 = 비교는 'NULL = NULL'을 모름으로 보지만, 중복 지우기와 묶기(GROUP BY)는 빈 값끼리 하나로 묶어요.** 둘 다 '비어 있음'이라 구별할 수 없기 때문이에요.\n\n그래서 INTERSECT는 양쪽에 다 있는 {2, 3, NULL} 3건이에요. ③의 '2건'이 틀렸어요.\n\n나머지는 맞아요. UNION은 {1, 2, 3, 4, NULL} 5건, UNION ALL은 5 + 5 = 10건, MINUS는 T1에만 있는 {1} 1건이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT C FROM T1 UNION     SELECT C FROM T2;  -- ① 합치고 중복 지움 → {1,2,3,4,NULL} 5건\nSELECT C FROM T1 UNION ALL SELECT C FROM T2;  -- ② 그대로 이어 붙임 → 5 + 5 = 10건\nSELECT C FROM T1 INTERSECT SELECT C FROM T2;  -- ③ 양쪽 공통 → {2,3,NULL} 3건 (NULL도 공통)\nSELECT C FROM T1 MINUS     SELECT C FROM T2;  -- ④ T1에만 있는 값 → {1} 1건 (1 두 개는 하나로)" },
    { t: "연산별 결과", tb: { c: ["연산", "결과 집합", "건수"], r: [["UNION", "{1, 2, 3, 4, NULL}", 5], ["UNION ALL", "T1 5행 + T2 5행 (중복 유지)", 10], ["INTERSECT", "{2, 3, NULL}", 3], ["MINUS", "{1}", 1]], hl: [2] } }
  ],
  res: { c: ["UNION", "UNION ALL", "INTERSECT", "MINUS"], r: [[5, 10, 3, 1]] },
  pg: "SELECT (SELECT COUNT(*) FROM (SELECT C FROM T1 UNION SELECT C FROM T2) a),(SELECT COUNT(*) FROM (SELECT C FROM T1 UNION ALL SELECT C FROM T2) b),(SELECT COUNT(*) FROM (SELECT C FROM T1 INTERSECT SELECT C FROM T2) c),(SELECT COUNT(*) FROM (SELECT C FROM T1 EXCEPT SELECT C FROM T2) d)",
  ox: ["맞는 진술이에요. 빈 값도 하나로 합쳐져 5건이에요.", "맞는 진술이에요. UNION ALL은 중복을 지우지 않고 이어 붙여요.", "정답(틀린 진술)이에요. 이렇게 생각하면 틀려요: 'NULL은 비교할 수 없으니 공통 값이 아니다.' 집합 연산에서는 빈 값끼리 같다고 봐서 3건이에요.", "맞는 진술이에요. T1에만 있는 값은 1뿐이고, 1 두 개는 하나로 줄어요."],
  trap: "'NULL은 비교할 수 없다'를 집합 연산에도 적용하면 틀려요. 중복 지우기(DISTINCT, 집합 연산, GROUP BY)에서는 NULL끼리 같은 묶음이에요.",
  memo: "조인·WHERE: NULL ≠ NULL / 중복 제거·그룹핑: NULL = NULL"
},
{
  id: "S34", s: 2, tp: "set", lv: 2,
  th: "2과목 | 집합 연산자 문법 (컬럼 수·타입·ORDER BY 위치)",
  q: "다음 중 오류 없이 실행되는 SQL은? (EMP.SAL·DEPT.DEPTNO는 NUMBER, 나머지는 VARCHAR2)",
  sql: "① SELECT ENAME, SAL FROM EMP ORDER BY SAL\n   UNION\n   SELECT DNAME, 0 FROM DEPT;\n\n② SELECT ENAME FROM EMP\n   UNION\n   SELECT DNAME, LOC FROM DEPT;\n\n③ SELECT ENAME AS NM, SAL FROM EMP\n   UNION ALL\n   SELECT DNAME, DEPTNO FROM DEPT\n   ORDER BY NM;\n\n④ SELECT ENAME, SAL FROM EMP\n   UNION\n   SELECT DNAME, LOC FROM DEPT;",
  o: ["①", "②", "③", "④"],
  a: 2,
  sum: "집합 연산은 위아래 컬럼 수와 타입이 맞아야 하고, ORDER BY는 맨 끝에 한 번만 써요. 이 규칙을 다 지킨 것은 ③뿐이에요.",
  why: "집합 연산자는 위아래 SELECT 결과를 한 열씩 맞대어 하나로 합쳐요.\n\n그래서 컬럼 개수가 같아야 해요. 같은 자리 컬럼끼리 타입도 맞아야 해요. 한 열에 숫자와 글자가 섞일 수는 없으니까요.\n\n**ORDER BY는 합쳐진 최종 결과를 정렬하는 것이라 맨 마지막에 한 번만 쓸 수 있어요.** 결과 컬럼 이름은 첫 번째 SELECT를 따라요. 그래서 ③의 ORDER BY NM은 첫 SELECT의 별칭을 가리켜서 정상이에요.\n\n①은 중간에 ORDER BY가 있어 ORA-00933이에요. ②는 컬럼 수가 1개와 2개라 ORA-01789예요. ④는 SAL(숫자)과 LOC(글자)가 같은 자리라 ORA-01790이에요.\n\n그래서 오류 없이 실행되는 것은 ③이에요.",
  st: [
    { t: "보기별 판정", tb: { c: ["보기", "확인할 것", "결과"], r: [["①", "중간 SELECT에 ORDER BY", "오류 (ORA-00933)"], ["②", "컬럼 수 1개 vs 2개", "오류 (ORA-01789)"], ["③", "수 2·2, 타입 글자·숫자로 일치, ORDER BY 맨 끝", "정상"], ["④", "SAL(숫자) vs LOC(글자)", "오류 (ORA-01790)"]], hl: [2] } },
    { t: "예시: 오류와 고치는 법", n: "-- 오류: 중간 SELECT에 ORDER BY\nSELECT ENAME, SAL FROM EMP ORDER BY SAL\nUNION\nSELECT DNAME, 0 FROM DEPT;        -- ORA-00933: SQL 명령어가 올바르게 종료되지 않았습니다\n\n-- 고침: ORDER BY는 맨 끝에 한 번, 이름은 첫 SELECT 기준\nSELECT ENAME, SAL FROM EMP\nUNION\nSELECT DNAME, 0 FROM DEPT\n ORDER BY SAL;                     -- 또는 ORDER BY 2\n\n-- 타입이 다르면(④) 변환해서 맞춘다\nSELECT ENAME, TO_CHAR(SAL) FROM EMP\nUNION\nSELECT DNAME, LOC FROM DEPT;" }
  ],
  ox: ["이렇게 생각하면 틀려요: '각 SELECT마다 정렬해도 된다.' 중간 ORDER BY는 ORA-00933 오류예요.", "이렇게 생각하면 틀려요: '모자란 컬럼은 비워서 합친다.' 컬럼 수가 1개와 2개라 ORA-01789 오류예요.", "정답이에요. 수와 타입이 맞고, ORDER BY가 맨 끝에 있으며, NM은 첫 SELECT의 이름이에요.", "이렇게 생각하면 틀려요: '수만 맞으면 된다.' SAL(숫자)과 LOC(글자)는 타입이 달라 ORA-01790 오류예요."],
  trap: "컬럼 이름이 달라도(ENAME과 DNAME) 상관없어요. 따지는 것은 개수와 타입뿐이에요.",
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
  sum: "SELECT 안의 서브쿼리는 한 칸을 채우니까 값이 하나만 나와야 해요. ②는 A = 1일 때 10, 20 두 줄이 나와서 오류예요.",
  why: "SELECT 절 안의 서브쿼리(스칼라 서브쿼리)는 바깥 줄마다 실행돼서 그 줄의 '한 칸'을 채워요.\n\n한 칸에는 값이 하나만 들어갈 수 있어요. **그래서 결과가 꼭 1줄 1칸이어야 하고, 2줄 이상 나오면 실행 중에 ORA-01427 오류가 나요.** 0줄이면 오류가 아니라 빈 값(NULL)이 들어가요.\n\n이 오류는 문법이 아니라 실제 데이터를 보고 정해져요.\n\n②는 T1.A = 1일 때 T2에서 B가 10, 20 두 줄이 나와 오류예요. ①은 MAX로 값을 하나로 줄였어요. ③은 B > 15 조건 덕분에 A마다 우연히 한 줄씩만 남아요. ④의 IN은 원래 여러 줄을 받는 연산자라 괜찮아요.\n\n그래서 오류는 ②예요.",
  st: [
    { t: "바깥 행별 서브쿼리 결과", tb: { c: ["T1.A", "①", "②", "③"], r: [[1, "20 (1행)", "10, 20 (2행) → 오류", "20 (1행)"], [2, "30 (1행)", "30", "30 (1행)"]], hl: [0] } },
    { t: "예시: 오류와 고치는 법", n: "-- 오류: A = 1에서 서브쿼리가 10, 20 두 줄을 돌려준다\nSELECT A, (SELECT B FROM T2 WHERE T2.A = T1.A) FROM T1;\n-- ORA-01427: 단일 행 하위 질의에 2개 이상의 행이 리턴되었습니다\n\n-- 고침: 집계로 값을 하나로 줄인다\nSELECT A, (SELECT MAX(B) FROM T2 WHERE T2.A = T1.A) AS MAX_B\n  FROM T1;   -- (1, 20), (2, 30)" }
  ],
  ox: ["이렇게 생각하면 틀려요: 'SELECT 안 서브쿼리는 무조건 위험하다.' MAX로 값을 하나로 줄여서 정상이에요.", "정답이에요. A = 1에서 두 줄이 나와 ORA-01427이 나요.", "이렇게 생각하면 틀려요: '문법이 ②와 같으니 같이 오류다.' B > 15 조건 때문에 A마다 한 줄씩만 나와서 정상이에요.", "이렇게 생각하면 틀려요: 'WHERE 서브쿼리도 한 줄이어야 한다.' IN은 여러 줄을 받는 연산자라 정상이에요."],
  trap: "③은 조건 하나 덕분에 우연히 한 줄이 되어 오류가 나지 않아요. 데이터를 직접 넣어 봐야 해요.",
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
  sum: "> ALL은 '모든 값보다 크다'라서 가장 큰 25보다 커야 하고, > ANY는 '하나보다만 크면 된다'라서 가장 작은 15보다 크면 돼요. 그래서 2건, 3건이에요.",
  why: "ALL과 ANY는 비교를 서브쿼리 결과의 모든 값에 해 보고 묶어요. ALL은 AND로, ANY는 OR로 묶어요.\n\nV > ALL (15, 25)는 'V > 15 그리고 V > 25'예요. 그래서 가장 큰 값 25보다 커야 해요.\n\n**V > ANY (15, 25)는 'V > 15 또는 V > 25'예요. 그래서 가장 작은 값 15보다만 크면 돼요.**\n\n이 표에 대입하면 25보다 큰 값은 30, 40으로 2건이에요. 15보다 큰 값은 20, 30, 40으로 3건이에요.\n\n그래서 (가) 2, (나) 3이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- 서브쿼리 결과 = {15, 25}\nSELECT COUNT(*) FROM T1\n WHERE V > ALL (SELECT V FROM SUB);  -- (가) V>15 그리고 V>25 = V>25 → 30, 40 → 2\n\nSELECT COUNT(*) FROM T1\n WHERE V > ANY (SELECT V FROM SUB);  -- (나) V>15 또는 V>25 = V>15 → 20, 30, 40 → 3" },
    { t: "행별 평가", tb: { c: ["V", "> ALL(15, 25) = > 25", "> ANY(15, 25) = > 15"], r: [[10, "X", "X"], [20, "X", "O"], [30, "O", "O"], [40, "O", "O"]] }, n: "(가) 2건, (나) 3건이에요." },
    { t: "같은 뜻으로 바꿔 쓰면", n: "SELECT COUNT(*) FROM T1 WHERE V > (SELECT MAX(V) FROM SUB);  -- 2 (= > ALL)\nSELECT COUNT(*) FROM T1 WHERE V > (SELECT MIN(V) FROM SUB);  -- 3 (= > ANY)\n-- 단, 서브쿼리 결과가 하나도 없으면 결과가 달라진다(S37)" }
  ],
  res: { c: ["가", "나"], r: [[2, 3]] },
  pg: "SELECT (SELECT COUNT(*) FROM T1 WHERE V > ALL (SELECT V FROM SUB)), (SELECT COUNT(*) FROM T1 WHERE V > ANY (SELECT V FROM SUB))",
  ox: ["정답이에요.", "이렇게 생각하면 틀려요: 'ALL은 하나만 넘으면 되고, ANY는 다 넘어야 한다.' 반대예요.", "이렇게 생각하면 틀려요: 'ALL은 두 값 사이를 뜻한다.' > ALL은 가장 큰 값(25)보다 큰 것이라 30, 40 두 개예요.", "이렇게 생각하면 틀려요: 'ANY는 전부 통과다.' 10은 15보다 작아서 빠져요."],
  trap: "< ALL은 가장 작은 값보다 작다, < ANY는 가장 큰 값보다 작다예요. 부등호 방향에 따라 기준값이 바뀌어요.",
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
  sum: "서브쿼리 결과가 하나도 없으면 '> ALL'은 따질 대상이 없어 참이 돼요. 그래서 T1의 4행이 모두 통과해요.",
  why: "V > ALL (목록)은 '목록의 모든 값보다 V가 크다'는 말이에요.\n\n목록이 비어 있으면 어긋나는 값이 하나도 없어요. 그래서 이 말은 참으로 쳐요. **Oracle도 ALL 뒤 서브쿼리가 한 줄도 돌려주지 않으면 조건을 참으로 봐요.**\n\nSUB에는 100보다 큰 값이 없어서 서브쿼리가 0줄이에요. 그래서 T1의 10, 20, 30, 40이 모두 통과해 4건이에요.\n\n반대로 > ANY (빈 목록)은 '하나라도 있나?'라서 거짓이고 0건이에요.\n\n주의할 점이 있어요. 결과가 '없음(0줄)'과 결과에 '빈 값(NULL)이 있음'은 달라요. 서브쿼리가 NULL 값을 하나라도 돌려주면, > ALL은 모름이 끼어서 참이 나오지 않아요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT COUNT(*)                                     -- ③ 4\n  FROM T1                                           -- ① 4행\n WHERE V > ALL (SELECT V FROM SUB WHERE V > 100);  -- ② 서브쿼리 0줄 → 따질 값이 없어 참 → 전부 통과" },
    { t: "1단계: 서브쿼리 결과", n: "SUB에 100보다 큰 값이 없어요 → 결과가 하나도 없어요(공집합)." },
    { t: "2단계: 평가", tb: { c: ["연산", "공집합일 때", "결과 건수"], r: [["> ALL ()", "항상 참", 4], ["> ANY ()", "항상 거짓", 0]], hl: [0] } },
    { t: "비교: MAX로 바꾸면 결과가 달라져요", n: "-- '서브쿼리 최댓값보다 큰 값'으로 쓰면\nSELECT COUNT(*)\n  FROM T1\n WHERE V > (SELECT MAX(V) FROM SUB WHERE V > 100);  -- 값이 없으니 MAX = NULL → V > NULL은 모름 → 0건" }
  ],
  res: { c: ["COUNT"], r: [[4]] },
  pg: "SELECT COUNT(*) FROM T1 WHERE V > ALL (SELECT V FROM SUB WHERE V > 100)",
  ox: ["이렇게 생각하면 틀려요: '비교할 게 없으면 아무것도 안 나온다.' 그건 ANY일 때예요. ALL은 반대로 다 통과해요.", "정답이에요.", "이렇게 생각하면 틀려요: '결과가 없으면 NULL이다.' COUNT(*)는 NULL을 돌려주지 않고, 여기서는 4예요.", "이렇게 생각하면 틀려요: '서브쿼리 결과가 없으면 오류다.' 결과가 없는 것은 오류가 아니에요."],
  trap: "'결과 없음'과 'NULL 값'은 달라요. 서브쿼리 결과에 NULL 값이 있으면 > ALL은 참이 될 수 없어 0건이에요.",
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
  sum: "각 사원을 '자기 부서 평균'과 비교해요. 부서 평균보다 큰 사람은 B(500 > 400)뿐이에요.",
  why: "연관 서브쿼리는 안쪽에서 바깥 쿼리의 컬럼(E.DEPT)을 써요. 그래서 혼자서는 실행할 수 없고, 바깥 줄 하나가 정해질 때마다 그 값을 넣어 다시 계산돼요.\n\n**그래서 각 사원은 전체 평균이 아니라 자기 부서의 평균과 비교돼요.**\n\n부서 평균은 10번 (300 + 500) ÷ 2 = 400, 20번 (400 + 400) ÷ 2 = 400, 30번 100이에요.\n\n사원별로 볼게요. A 300은 400보다 작아요. B 500은 400보다 커요. C와 D 400은 400과 같아요. E 100은 100과 같아요. '같다'는 '크다(>)'가 아니에요.\n\n그래서 B만 나와요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT ENAME                          -- ④ B\n  FROM EMP E                          -- ① 바깥 줄을 하나씩 (A~E)\n WHERE SAL > (SELECT AVG(SAL)          -- ③ 내 급여 > 내 부서 평균?\n                FROM EMP\n               WHERE DEPT = E.DEPT);   -- ② 바깥 줄의 부서로 평균 계산 (10→400, 20→400, 30→100)" },
    { t: "1단계: 부서별 평균", tb: { c: ["DEPT", "AVG(SAL)"], r: [[10, 400], [20, 400], [30, 100]] } },
    { t: "2단계: 행별 비교", tb: { c: ["ENAME", "SAL", "부서 평균", "SAL > 평균"], r: [["A", 300, 400, "X"], ["B", 500, 400, "O"], ["C", 400, 400, "X"], ["D", 400, 400, "X"], ["E", 100, 100, "X"]], hl: [1] } }
  ],
  res: { c: ["ENAME"], r: [["B"]] },
  pg: "SELECT ENAME FROM EMP E WHERE SAL > (SELECT AVG(SAL) FROM EMP WHERE DEPT = E.DEPT)",
  ox: ["정답이에요.", "이렇게 생각하면 틀려요: '전체 평균(340)과 비교한다.' E.DEPT로 연결되어 있어서 자기 부서 평균과 비교해요.", "이렇게 생각하면 틀려요: '평균과 같으면 통과다.' C, D는 400 = 400이라 > 조건을 통과하지 못해요. >=였다면 B, C, D가 돼요.", "이렇게 생각하면 틀려요: '아무도 평균보다 크지 않다.' B는 500으로 부서 평균 400보다 커요."],
  trap: "C, D는 평균과 '같아서' > 조건을 통과하지 못해요.",
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
  sum: "PIVOT은 칸에 해당하는 데이터가 없으면 0이 아니라 빈 값(NULL)을 넣어요. DEPT 20은 Q1 데이터가 없어 NULL, Q2는 300이에요.",
  why: "PIVOT은 'GROUP BY + 조건별 합계'를 줄여 쓴 문법이에요.\n\nFOR 절 컬럼(QTR)과 집계 대상(AMT)을 뺀 나머지 컬럼(여기서는 DEPT)이 묶는 기준이 돼요. IN 목록의 값마다 'QTR이 그 값인 AMT의 합계' 컬럼이 하나씩 생겨요.\n\n**칸에 맞는 데이터가 하나도 없으면 더할 것이 없으니, 결과는 0이 아니라 NULL이에요.**\n\nDEPT 10은 Q1이 100 + 50 = 150, Q2가 200이에요. DEPT 20은 Q1 데이터가 없어서 NULL, Q2는 300이에요.\n\nIN 목록에 없는 Q3 줄(100)은 어느 컬럼에도 들어가지 않아요. 하지만 DEPT 20은 Q2 데이터가 있으니 결과에 나와요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT *                                         -- ④ (10, 150, 200), (20, NULL, 300)\n  FROM (SELECT DEPT, QTR, AMT FROM SALES)       -- ① 필요한 3컬럼만 고름\n PIVOT (SUM(AMT)                                -- ③ 칸마다 합계, 데이터 없으면 NULL\n        FOR QTR IN ('Q1' AS Q1, 'Q2' AS Q2));   -- ② 남은 DEPT로 묶고, QTR 값을 Q1·Q2 컬럼으로 펼침" },
    { t: "1단계: 그룹 (DEPT) × 펼칠 값 (QTR)", tb: { c: ["DEPT", "QTR = 'Q1'", "QTR = 'Q2'"], r: [[10, "100 + 50", "200"], [20, "없음", "300"]] } },
    { t: "2단계: 최종 결과", tb: { c: ["DEPT", "Q1", "Q2"], r: [[10, 150, 200], [20, null, 300]], hl: [1] } },
    { t: "PIVOT을 GROUP BY로 풀어 쓰면", n: "SELECT DEPT,\n       SUM(CASE WHEN QTR = 'Q1' THEN AMT END) AS Q1,  -- 20번은 맞는 줄이 없어 NULL\n       SUM(CASE WHEN QTR = 'Q2' THEN AMT END) AS Q2\n  FROM SALES\n GROUP BY DEPT;   -- (10, 150, 200), (20, NULL, 300)" },
    { t: "빈 칸을 0으로 보이려면", n: "SELECT DEPT, NVL(Q1, 0) AS Q1, NVL(Q2, 0) AS Q2\n  FROM (SELECT DEPT, QTR, AMT FROM SALES)\n PIVOT (SUM(AMT) FOR QTR IN ('Q1' AS Q1, 'Q2' AS Q2));   -- (10, 150, 200), (20, 0, 300)" }
  ],
  res: { c: ["DEPT", "Q1", "Q2"], r: [[10, 150, 200], [20, null, 300]] },
  pg: "SELECT DEPT, SUM(AMT) FILTER (WHERE QTR = 'Q1') Q1, SUM(AMT) FILTER (WHERE QTR = 'Q2') Q2 FROM SALES GROUP BY DEPT ORDER BY DEPT",
  ox: ["정답이에요.", "이렇게 생각하면 틀려요: '빈 칸은 0으로 채워진다.' 데이터가 없으면 NULL이에요. 0을 원하면 NVL을 써야 해요.", "이렇게 생각하면 틀려요: 'Q3 값(100)도 어딘가에 더해진다.' IN 목록에 없는 Q3는 어떤 컬럼에도 들어가지 않아요.", "이렇게 생각하면 틀려요: 'IN 목록에 없는 값이 섞이면 그 부서가 사라진다.' DEPT 20은 Q2 데이터가 있어서 나와요."],
  trap: "인라인 뷰 없이 PIVOT을 바로 쓰면 표의 나머지 컬럼이 모두 묶는 기준이 되어 결과가 달라져요. 그래서 필요한 컬럼만 인라인 뷰로 골라내요.",
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
  sum: "UNPIVOT은 컬럼들을 줄로 세우는데, 기본적으로 빈 칸(NULL)은 줄로 만들지 않아요. 6칸 중 빈 칸 3개를 빼서 3행이에요.",
  why: "UNPIVOT은 PIVOT의 반대예요. 여러 컬럼(Q1, Q2, Q3)의 값을 '컬럼 이름(QTR) + 값(AMT)' 짝의 줄로 세워요.\n\n원래 한 줄이 IN 목록 컬럼 수만큼, 여기서는 3줄로 펼쳐지는 것이 출발점이에요.\n\n**그런데 기본 옵션이 EXCLUDE NULLS라서, 값이 빈 칸은 줄로 만들지 않아요.** 빈 칸까지 줄로 만들면 쓸모없는 줄이 쌓이기 때문에 이것이 기본이에요.\n\n2줄 × 3컬럼 = 6칸이에요. 빈 칸은 ID 1의 Q2, ID 2의 Q1·Q2로 3개예요.\n\n그래서 6 − 3 = 3행이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT *                                -- ③ (1,Q1,100), (1,Q3,300), (2,Q3,50)\n  FROM T                                -- ① 2행\nUNPIVOT (AMT FOR QTR IN (Q1, Q2, Q3));  -- ② 줄마다 3칸을 3줄로, 빈 칸은 뺌(기본 EXCLUDE NULLS)" },
    { t: "칸별 변환", tb: { c: ["ID", "QTR", "AMT", "기본(EXCLUDE NULLS)"], r: [[1, "Q1", 100, "출력"], [1, "Q2", null, "제외"], [1, "Q3", 300, "출력"], [2, "Q1", null, "제외"], [2, "Q2", null, "제외"], [2, "Q3", 50, "출력"]] } },
    { t: "빈 칸도 줄로 만들려면", n: "SELECT *\n  FROM T\nUNPIVOT INCLUDE NULLS (AMT FOR QTR IN (Q1, Q2, Q3));   -- 6행" }
  ],
  res: { c: ["COUNT"], r: [[3]] },
  pg: "SELECT COUNT(*) FROM T CROSS JOIN LATERAL (VALUES ('Q1', T.Q1), ('Q2', T.Q2), ('Q3', T.Q3)) U(QTR, AMT) WHERE U.AMT IS NOT NULL",
  ox: ["이렇게 생각하면 틀려요: '줄 수는 원래와 같다.' UNPIVOT은 줄을 컬럼 수만큼 늘려요.", "정답이에요.", "이렇게 생각하면 틀려요: '빈 칸 일부만 빠진다.' 빈 칸 3개가 모두 빠져서 3행이에요.", "이렇게 생각하면 틀려요: '빈 칸도 줄이 된다.' 6행은 INCLUDE NULLS를 썼을 때예요."],
  trap: "옵션을 생략하면 EXCLUDE NULLS(빈 칸 제외)예요.",
  memo: "UNPIVOT 기본 = NULL 제외"
},
{
  id: "S41", s: 2, tp: "regex", lv: 2,
  th: "2과목 | REGEXP_SUBSTR 발생 순번",
  q: "다음 SQL의 결과로 옳은 것은?",
  sql: "SELECT REGEXP_SUBSTR('SQLD-62-PASS-2026', '[0-9]+', 1, 2) AS R\n  FROM DUAL;",
  o: ["'62'", "'2026'", "'622026'", "NULL"],
  a: 1,
  sum: "[0-9]+는 붙어 있는 숫자를 한 덩어리로 잡아요. 덩어리는 '62', '2026' 순서라 2번째는 '2026'이에요.",
  why: "REGEXP_SUBSTR(문자열, 패턴, 시작 위치, 몇 번째)는 시작 위치부터 오른쪽으로 패턴을 찾아요. 찾은 것들 중 '몇 번째'에 해당하는 것을 돌려줘요.\n\n[0-9]+는 '숫자 1개 이상'이라는 패턴이에요. **정규식은 시작한 곳에서 가능한 한 길게 잡아서, 붙어 있는 숫자는 한 덩어리가 돼요.**\n\n한 덩어리를 찾으면 그다음 글자부터 다시 찾아요.\n\n'SQLD-62-PASS-2026'에서 1번째 덩어리는 '62', 2번째 덩어리는 '2026'이에요. 2번째가 있으니 NULL이 아니에요.\n\n그래서 '2026'이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT REGEXP_SUBSTR('SQLD-62-PASS-2026',  -- 대상 문자열\n                     '[0-9]+',             -- 숫자 1개 이상 연속 = 한 덩어리\n                     1,                    -- 1번째 글자부터 찾기\n                     2) AS R               -- 찾은 덩어리 중 2번째 → '62' 다음 '2026'\n  FROM DUAL;" },
    { t: "일치 부분 찾기", tb: { c: ["순번", "일치 문자열", "위치"], r: [[1, "62", "6~7"], [2, "2026", "14~17"]], hl: [1] } }
  ],
  res: { c: ["R"], r: [["2026"]] },
  pg: "SELECT REGEXP_SUBSTR('SQLD-62-PASS-2026', '[0-9]+', 1, 2)",
  ox: ["이렇게 생각하면 틀려요: '네 번째 인자는 시작 위치다.' 세 번째가 시작 위치, 네 번째가 '몇 번째 덩어리'예요. '62'는 1번째예요.", "정답이에요.", "이렇게 생각하면 틀려요: '숫자를 모두 이어 붙인다.' REGEXP_SUBSTR은 덩어리 하나만 돌려줘요.", "이렇게 생각하면 틀려요: '2번째 덩어리가 없다.' '2026'이 2번째로 있어요."],
  trap: "[0-9]+는 한 자리씩이 아니라 붙어 있는 숫자 전체를 한 덩어리로 잡아요. 한 자리씩이었다면 2번째는 '2'예요.",
  memo: "REGEXP_SUBSTR(문자, 패턴, 시작, 몇 번째)"
},
{
  id: "S42", s: 2, tp: "regex", lv: 2,
  th: "2과목 | REGEXP_COUNT · REGEXP_INSTR",
  q: "다음 SQL의 결과로 옳은 것은?",
  sql: "SELECT REGEXP_COUNT('a1b22c333', '[0-9]+') AS C,\n       REGEXP_INSTR('ABC123DEF', '[0-9]')   AS P\n  FROM DUAL;",
  o: ["3, 4", "6, 4", "3, 6", "6, 6"],
  a: 0,
  sum: "[0-9]+는 붙은 숫자를 한 덩어리로 세서 '1', '22', '333' 3번이에요. 'ABC123DEF'의 첫 숫자는 4번째 글자라 4예요.",
  why: "REGEXP_COUNT는 패턴이 몇 번 맞는지 세요. 하나를 찾으면 그 끝 다음 글자부터 다시 찾아서, 겹쳐 세지 않아요.\n\n[0-9]+처럼 '1개 이상'인 패턴은 붙어 있는 숫자를 한 번으로 세요. **그래서 'a1b22c333'은 '1', '22', '333'으로 3번이에요.** 패턴이 [0-9]였다면 숫자 글자 수인 6이에요.\n\nREGEXP_INSTR은 처음 맞는 곳의 시작 위치를 1부터 센 번호로 돌려줘요.\n\n'ABC123DEF'에서 A, B, C 다음의 '1'이 4번째 글자예요.\n\n그래서 3, 4예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT REGEXP_COUNT('a1b22c333', '[0-9]+') AS C,  -- '1' / '22' / '333' → 3번\n       REGEXP_INSTR('ABC123DEF', '[0-9]')   AS P   -- A B C 다음 '1' → 4번째 글자\n  FROM DUAL;" },
    { t: "계산", tb: { c: ["함수", "과정", "결과"], r: [["REGEXP_COUNT", "1 / 22 / 333", 3], ["REGEXP_INSTR", "A1 B2 C3 '1'4 → 4번째 위치", 4]] } }
  ],
  res: { c: ["C", "P"], r: [[3, 4]] },
  pg: "SELECT REGEXP_COUNT('a1b22c333', '[0-9]+'), REGEXP_INSTR('ABC123DEF', '[0-9]')",
  ox: ["정답이에요.", "이렇게 생각하면 틀려요: '숫자 글자 수를 센다.' +가 있어서 붙은 숫자는 한 번으로 세요. 6은 [0-9]일 때예요.", "이렇게 생각하면 틀려요: 'INSTR은 마지막 숫자 위치를 준다.' 처음 맞는 위치(4)를 줘요.", "이렇게 생각하면 틀려요: 두 함수 모두 잘못 센 경우예요. COUNT는 덩어리 수, INSTR은 첫 위치예요."],
  trap: "패턴의 '+' 유무로 COUNT 결과가 달라져요. '[0-9]'였다면 6이에요.",
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
  sum: "IN은 '또는(OR)'이라 10인 행은 통과해서 1건이에요. NOT IN은 '그리고(AND)'라 NULL과의 비교가 '모름'이 되어 아무 행도 통과 못 해 0건이에요.",
  why: "IN (10, NULL)은 'COL = 10 또는 COL = NULL'로 풀려요. NOT IN (10, NULL)은 'COL <> 10 그리고 COL <> NULL'로 풀려요.\n\n목록의 NULL과 비교하면 결과는 언제나 '모름'이에요.\n\n'또는'에서는 다른 조건 하나만 참이면 전체가 참이에요. 그래서 NULL이 있어도 괜찮아요. **'그리고'에서는 '모름'이 하나 끼면 전체가 참이 될 수 없어요. 그래서 NOT IN은 항상 0건이에요.**\n\n행별로 볼게요. (가)에서 10은 참이라 통과해요. 20과 빈 값 행은 모름이라 빠져요. 그래서 1건이에요. (나)에서 10은 거짓, 20과 빈 값 행은 모름이라 0건이에요.\n\nCOL이 빈 행은 'NULL = NULL'도 모름이라 IN (…, NULL)로도 찾을 수 없어요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT COUNT(*) FROM T\n WHERE COL IN (10, NULL);      -- (가) COL = 10 또는 COL = NULL → 10만 참 → 1\n\nSELECT COUNT(*) FROM T\n WHERE COL NOT IN (10, NULL);  -- (나) COL <> 10 그리고 COL <> NULL → 참인 행 없음 → 0" },
    { t: "행별 평가", tb: { c: ["COL", "(가) =10 OR =NULL", "(나) <>10 AND <>NULL"], r: [[10, "참 OR 모름 = 참", "거짓 AND 모름 = 거짓"], [20, "거짓 OR 모름 = 모름", "참 AND 모름 = 모름"], [null, "모름", "모름"]] } },
    { t: "의도대로 쓰려면", n: "-- 빈 값 행도 찾으려면 IS NULL을 따로 쓴다\nSELECT COUNT(*) FROM T WHERE COL = 10 OR COL IS NULL;          -- 2 (10, NULL)\n\n-- 10이 아닌 행(빈 값 행 포함)을 찾으려면\nSELECT COUNT(*) FROM T WHERE COL NOT IN (10) OR COL IS NULL;   -- 2 (20, NULL)" }
  ],
  res: { c: ["가", "나"], r: [[1, 0]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE COL IN (10, NULL)), (SELECT COUNT(*) FROM T WHERE COL NOT IN (10, NULL))",
  ox: ["정답이에요.", "이렇게 생각하면 틀려요: 'NOT IN에서 20은 10과 다르니 남는다.' 'NULL과 다르냐'가 모름이라 20도 빠져요.", "이렇게 생각하면 틀려요: '빈 값 행이 IN (NULL)에 걸린다.' NULL = NULL도 모름이라 빈 값 행은 IS NULL로만 찾을 수 있어요.", "이렇게 생각하면 틀려요: 'NOT IN은 목록의 NULL을 무시한다.' 무시하지 않아요. 그 NULL 때문에 0건이 돼요."],
  trap: "COL이 빈 행은 IN (…, NULL)로도 찾을 수 없어요. 빈 값 행은 IS NULL로만 찾아요.",
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
  sum: "KING은 상사(MGR)가 비어 있어서 일반 조인에서는 짝이 없어 빠져요. LEFT OUTER JOIN은 사원을 다 남기니 KING도 나와서 5, 6이에요.",
  why: "셀프 조인은 같은 표를 별칭 두 개로 불러서 다른 역할을 맡겨요. 여기서는 E가 사원, M이 상사 역할이에요.\n\nE.MGR = M.EMPNO는 '사원의 MGR 번호와 같은 사번을 가진 상사'를 붙여요.\n\n(가)의 일반 조인은 짝이 맞는 줄만 남겨요. KING은 MGR이 비어 있어서 'NULL = 사번'이 모름이 되고, 짝이 없어 빠져요. 나머지 5명은 상사가 있어서 5행이에요.\n\n**(나)의 LEFT OUTER JOIN은 사원(E) 쪽을 다 남겨요. 그래서 KING도 상사 이름이 빈 채로 남아 6행이에요.**\n\n그래서 (가) 5, (나) 6이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- (가) 일반 셀프 조인: E = 사원, M = 상사\nSELECT E.ENAME, M.ENAME\n  FROM EMP E, EMP M                -- ① 6 × 6 모든 짝\n WHERE E.MGR = M.EMPNO;            -- ② KING은 MGR이 비어 모름 → 빠짐 → 5행\n\n-- (나) 아우터 셀프 조인\nSELECT E.ENAME, M.ENAME\n  FROM EMP E LEFT OUTER JOIN EMP M -- ① 사원(E) 6행은 다 남김\n    ON E.MGR = M.EMPNO;            -- ② KING은 M 쪽이 빈 값으로 채워짐 → 6행" },
    { t: "(나) 결과", tb: { c: ["E.ENAME", "M.ENAME"], r: [["KING", null], ["JONES", "KING"], ["BLAKE", "KING"], ["SCOTT", "JONES"], ["FORD", "JONES"], ["ALLEN", "BLAKE"]], hl: [0] }, n: "(가)는 첫 줄(KING)이 빠진 5행이에요." },
    { t: "빈 상사 이름을 보기 좋게", n: "SELECT E.ENAME, NVL(M.ENAME, '(없음)') AS MGR_NAME\n  FROM EMP E LEFT OUTER JOIN EMP M\n    ON E.MGR = M.EMPNO;   -- KING (없음), JONES KING, … 6행" }
  ],
  res: { c: ["가", "나"], r: [[5, 6]] },
  pg: "SELECT (SELECT COUNT(*) FROM EMP E, EMP M WHERE E.MGR = M.EMPNO), (SELECT COUNT(*) FROM EMP E LEFT OUTER JOIN EMP M ON E.MGR = M.EMPNO)",
  ox: ["정답이에요.", "이렇게 생각하면 틀려요: 'KING도 일반 조인에 나온다.' KING은 MGR이 비어 있어서 짝이 없어요.", "이렇게 생각하면 틀려요: '아우터 조인도 KING을 뺀다.' LEFT OUTER JOIN은 왼쪽(사원)을 다 남겨요.", "이렇게 생각하면 틀려요: 두 결과를 바꿔 본 경우예요. 아우터 조인 쪽이 더 많아요."],
  trap: "셀프 조인에서 E.MGR = M.EMPNO와 E.EMPNO = M.MGR은 방향이 반대예요. 앞은 '내 상사', 뒤는 '내 부하'를 찾아요.",
  memo: "셀프 조인 = 같은 테이블, 다른 별칭"
}
);
