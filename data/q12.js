// 제2과목 · SQL 기본 + 관리 구문 — 자주 틀리는 작은 규칙 집중 (S201~S220)
// 집계·절 규칙 · DELETE/TRUNCATE/DROP · ALTER TABLE · NULL 함수(ISNULL 포함) · WHERE/ORDER BY/제약조건/DCL
// pg: PostgreSQL에는 NVL·ISNULL·NVL2가 없어 COALESCE·CASE로 그대로 옮겨 검증한다. 문제의 SQL은 표시한 DBMS 문법을 따른다.
// Oracle 고유 동작(DDL 자동 커밋, '' = NULL, 문자열 || NULL, 오류 코드)은 DB 검증 없이 해설로 근거를 밝힌다.
(window.QB = window.QB || []).push(
{
  id: "S201", s: 2, tp: "agg", lv: 1, kill: true, sub: "GROUP BY, HAVING 절",
  th: "2과목 | WHERE 절의 집계 함수 → ORA-00934",
  q: "[EMP] 테이블(EMPNO, DEPT, SAL)에 대해 다음 SQL을 실행할 때 오류가 발생하는 것은? (Oracle 기준)",
  sql: "① SELECT DEPT, AVG(SAL) FROM EMP GROUP BY DEPT HAVING AVG(SAL) >= 300;\n② SELECT DEPT, COUNT(*) FROM EMP WHERE SAL >= 200 GROUP BY DEPT;\n③ SELECT DEPT, SUM(SAL) FROM EMP WHERE SUM(SAL) > 500 GROUP BY DEPT;\n④ SELECT COUNT(*) FROM EMP HAVING COUNT(*) > 3;",
  o: ["①", "②", "③", "④"],
  a: 2,
  sum: "WHERE는 그룹을 만들기 전에 한 행씩 거르는 곳이라 SUM 같은 집계 함수를 쓸 수 없어요. 그룹의 합계로 거르려면 HAVING을 써야 해서 ③이 오류예요.",
  why: "SELECT 문은 적힌 순서가 아니라 FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY 순서로 처리돼요. 이 순서를 알면 어디에 무엇을 쓸 수 있는지가 저절로 보여요.\n\nWHERE는 GROUP BY보다 먼저 실행돼요. 이때는 아직 그룹이 없어서 '부서별 합계' 같은 값이 존재하지 않아요. **그래서 WHERE 절에는 SUM, AVG, COUNT 같은 집계 함수를 쓸 수 없고, Oracle은 ORA-00934(그룹 함수는 여기에 쓸 수 없음) 오류를 내요.**\n\n그룹을 만든 다음 그룹 단위로 거르는 곳이 HAVING이에요. ①처럼 HAVING AVG(SAL) >= 300은 정상이에요. ②는 WHERE에 집계 함수가 아니라 보통 컬럼 조건(SAL >= 200)을 썼으니 정상이에요.\n\n④는 GROUP BY 없이 HAVING만 썼어요. 이때는 테이블 전체가 하나의 그룹이 되니 정상이에요. 전체 행 수가 3보다 크면 1행, 아니면 0행이 나와요.\n\n③은 WHERE에 SUM(SAL)을 써서 오류예요. HAVING SUM(SAL) > 500으로 옮기면 의도대로 동작해요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "① ... GROUP BY DEPT HAVING AVG(SAL) >= 300;   -- 그룹을 만든 뒤 그룹 평균으로 거름 → 정상\n② ... WHERE SAL >= 200 GROUP BY DEPT;        -- WHERE에 보통 컬럼 조건 → 정상\n③ ... WHERE SUM(SAL) > 500 GROUP BY DEPT;    -- WHERE 시점엔 그룹이 없음 → ORA-00934\n④ SELECT COUNT(*) FROM EMP HAVING COUNT(*) > 3; -- 전체가 한 그룹 → 정상" },
    { t: "논리적 실행 순서와 집계 함수", tb: { c: ["순서", "절", "집계 함수 사용"], r: [[1, "FROM", "-"], [2, "WHERE", "불가 (그룹 전)"], [3, "GROUP BY", "-"], [4, "HAVING", "가능"], [5, "SELECT", "가능"], [6, "ORDER BY", "가능"]], hl: [1] } },
    { t: "의도대로 쓰려면: 조건을 HAVING으로", n: "SELECT DEPT, SUM(SAL)\n  FROM EMP\n GROUP BY DEPT\nHAVING SUM(SAL) > 500;" }
  ],
  ox: [
    "정상이에요. HAVING은 그룹을 만든 뒤 실행되니 AVG(SAL) 같은 집계 함수로 그룹을 거를 수 있어요.",
    "정상이에요. WHERE에 집계 함수가 아닌 보통 컬럼 조건을 쓰는 건 문제없어요. 그룹을 만들기 전에 SAL이 200 이상인 행만 남겨요.",
    "오류라서 정답이에요. 이렇게 생각하면 틀려요: '조건은 다 WHERE에 쓴다.' WHERE는 그룹을 만들기 전이라 SUM(SAL)이 아직 없어요. Oracle은 ORA-00934를 내고, HAVING으로 옮겨야 해요.",
    "정상이에요. 이렇게 생각하면 틀려요: 'HAVING은 GROUP BY가 있어야만 쓴다.' GROUP BY가 없으면 테이블 전체를 하나의 그룹으로 보고 HAVING을 적용해요."
  ],
  trap: "'HAVING은 GROUP BY 없이 못 쓴다'와 'WHERE에도 집계 함수를 쓸 수 있다'는 둘 다 틀린 말이에요. 집계 함수가 들어간 조건은 무조건 HAVING이에요.",
  memo: "집계 조건은 HAVING, WHERE에 SUM → ORA-00934"
},
{
  id: "S202", s: 2, tp: "basic", lv: 2, kill: true, sub: "SELECT 문",
  th: "2과목 | SELECT 별칭은 ORDER BY에서만 (WHERE · GROUP BY 불가)",
  q: "[EMP] 테이블(EMPNO, DEPT, SAL)에 대해 오류 없이 실행되는 SQL은? (Oracle 기준)",
  sql: "① SELECT DEPT AS D, SUM(SAL) AS TOT FROM EMP GROUP BY DEPT ORDER BY TOT DESC;\n② SELECT EMPNO, SAL * 12 AS ANN FROM EMP WHERE ANN > 3000;\n③ SELECT DEPT AS D, SUM(SAL) AS TOT FROM EMP GROUP BY D;\n④ SELECT DEPT AS D, COUNT(*) AS CNT FROM EMP WHERE D = 10 GROUP BY DEPT;",
  o: ["①", "②", "③", "④"],
  a: 0,
  sum: "별칭은 SELECT 절에서 만들어지는데, SELECT보다 늦게 실행되는 곳은 ORDER BY뿐이에요. 그래서 ORDER BY에서 별칭을 쓴 ①만 정상이고, WHERE나 GROUP BY에 별칭을 쓰면 ORA-00904 오류가 나요.",
  why: "별칭(Alias)은 SELECT 절에서 컬럼이나 계산식에 붙이는 새 이름이에요. 그런데 SELECT 절은 FROM → WHERE → GROUP BY → HAVING 다음, 거의 마지막에 실행돼요.\n\n그래서 WHERE와 GROUP BY가 실행될 때는 별칭이 아직 태어나지 않았어요. Oracle은 모르는 이름이라고 보고 ORA-00904(부적합한 식별자) 오류를 내요. ②의 ANN, ③과 ④의 D가 그래요.\n\n**ORDER BY는 SELECT 다음에 실행되니 별칭을 쓸 수 있어요.** ①은 ORDER BY TOT DESC로 별칭을 썼으니 정상이에요.\n\n별칭 대신 원래 식을 다시 쓰면 해결돼요. ②는 WHERE SAL * 12 > 3000, ③은 GROUP BY DEPT, ④는 WHERE DEPT = 10으로 고치면 돼요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "① ... GROUP BY DEPT ORDER BY TOT DESC;  -- ORDER BY는 SELECT 뒤 → 별칭 TOT 사용 가능 → 정상\n② ... WHERE ANN > 3000;                  -- WHERE는 SELECT 전 → ANN을 모름 → ORA-00904\n③ ... GROUP BY D;                        -- GROUP BY도 SELECT 전 → D를 모름 → ORA-00904\n④ ... WHERE D = 10 GROUP BY DEPT;        -- WHERE에서 별칭 D → ORA-00904" },
    { t: "절별 별칭 사용 가능 여부 (Oracle)", tb: { c: ["실행 순서", "절", "SELECT 별칭"], r: [[1, "FROM", "X"], [2, "WHERE", "X"], [3, "GROUP BY", "X"], [4, "HAVING", "X"], [5, "SELECT", "여기서 만들어짐"], [6, "ORDER BY", "O"]], hl: [5] } },
    { t: "의도대로 쓰려면: 원래 식을 다시 써요", n: "SELECT EMPNO, SAL * 12 AS ANN FROM EMP WHERE SAL * 12 > 3000;\nSELECT DEPT AS D, SUM(SAL) AS TOT FROM EMP GROUP BY DEPT;\nSELECT DEPT AS D, COUNT(*) AS CNT FROM EMP WHERE DEPT = 10 GROUP BY DEPT;" }
  ],
  ox: [
    "정답이에요. ORDER BY는 SELECT보다 늦게 실행돼서 SELECT에서 만든 별칭 TOT를 알아봐요.",
    "이렇게 생각하면 틀려요: 'SELECT에 먼저 적었으니 WHERE에서도 쓸 수 있다.' 적은 순서와 실행 순서는 달라요. WHERE가 먼저 실행돼서 ANN을 모르니 ORA-00904가 나요.",
    "이렇게 생각하면 틀려요: 'GROUP BY는 SELECT 바로 뒤에 적으니 별칭을 안다.' GROUP BY는 SELECT보다 먼저 실행돼요. 별칭 D 대신 DEPT를 써야 해요.",
    "이렇게 생각하면 틀려요: 'WHERE에 별칭을 쓰고 GROUP BY에 원래 이름을 쓰면 된다.' WHERE도 SELECT보다 먼저라 D를 몰라요. WHERE DEPT = 10으로 써야 해요."
  ],
  trap: "같은 별칭이라도 ORDER BY에서는 되고 WHERE·GROUP BY·HAVING에서는 안 돼요. 참고로 최신 Oracle 23ai는 GROUP BY 별칭을 허용하지만, 시험은 교재 기준으로 '안 된다'가 정답이에요.",
  memo: "별칭은 SELECT에서 태어나 ORDER BY에서만 쓴다"
},
{
  id: "S203", s: 2, tp: "agg", lv: 2, kill: true, sub: "GROUP BY, HAVING 절",
  th: "2과목 | GROUP BY 없는 HAVING과 COUNT의 NULL 처리",
  q: "다음 [T] 테이블에 대해 SQL을 실행한 결과로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "AMT"], r: [[1, 200], [2, null], [3, 300], [4, 200], [5, null]] }],
  sql: "SELECT COUNT(*)            AS C1,\n       COUNT(AMT)          AS C2,\n       COUNT(DISTINCT AMT) AS C3\n  FROM T\nHAVING COUNT(AMT) >= 3;",
  o: ["5, 3, 2", "5, 5, 3", "0행 (결과 없음)", "오류가 발생한다"],
  a: 0,
  sum: "GROUP BY가 없으면 테이블 전체가 한 그룹이고, HAVING은 그 한 그룹을 남길지 정해요. COUNT(AMT)가 3이라 조건을 통과하고, 결과는 5, 3, 2 한 행이에요.",
  why: "GROUP BY 없이 HAVING을 쓰면 오류가 날 것 같지만 정상이에요. GROUP BY가 없으면 테이블 전체를 하나의 그룹으로 보고, HAVING은 '이 한 그룹을 결과에 남길지'를 판단해요.\n\n세는 방법도 함수마다 달라요. COUNT(*)는 행 자체를 세서 NULL(값이 비어 있음)인 칸이 있어도 셉니다. COUNT(AMT)는 AMT가 NULL인 행을 빼고 세요. COUNT(DISTINCT AMT)는 NULL을 먼저 버리고, 남은 값의 중복을 지운 다음 세요.\n\n이 표에 대입해 볼게요. 행은 5개라 C1 = 5예요. AMT가 비어 있는 2·5번을 빼면 C2 = 3이에요. 남은 값 200, 300, 200에서 중복을 지우면 {200, 300}이라 C3 = 2예요.\n\n**HAVING COUNT(AMT) >= 3은 3 >= 3이라 참이니, 그룹이 살아남아 한 행이 나와요.** 만약 조건이 거짓이었다면 오류가 아니라 0행이 나와요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT COUNT(*)            AS C1,   -- ④ 행 5개 → 5\n       COUNT(AMT)          AS C2,   -- ④ NULL 2개 빼고 → 3\n       COUNT(DISTINCT AMT) AS C3    -- ④ NULL 버리고 {200, 300} → 2\n  FROM T                            -- ① 5행\n                                    -- ② GROUP BY 없음 → 전체가 한 그룹\nHAVING COUNT(AMT) >= 3;             -- ③ 3 >= 3 → 참 → 그룹을 남겨요" },
    { t: "1단계: 전체가 한 그룹", tb: { c: ["ID", "AMT", "COUNT(AMT)에 포함?"], r: [[1, 200, "O"], [2, null, "X"], [3, 300, "O"], [4, 200, "O"], [5, null, "X"]], hl: [1, 4] } },
    { t: "2단계: HAVING 판정 후 결과", tb: { c: ["C1", "C2", "C3", "HAVING COUNT(AMT) >= 3"], r: [[5, 3, 2, "3 >= 3 → 통과"]], hl: [0] } }
  ],
  res: { c: ["C1", "C2", "C3"], r: [[5, 3, 2]] },
  pg: "SELECT COUNT(*) AS C1, COUNT(AMT) AS C2, COUNT(DISTINCT AMT) AS C3 FROM T HAVING COUNT(AMT) >= 3",
  ox: [
    "정답이에요. 전체 행 5, NULL을 뺀 3, 서로 다른 값 {200, 300}의 2이고, COUNT(AMT) = 3이 HAVING 조건을 통과해요.",
    "이렇게 생각하면 틀려요: 'NULL도 하나의 값으로 센다.' 그러면 COUNT(AMT) = 5, DISTINCT는 {200, 300, NULL}로 3이 되지만, COUNT(컬럼)과 COUNT(DISTINCT)는 NULL을 빼고 세요.",
    "이렇게 생각하면 틀려요: 'GROUP BY가 없으니 HAVING이 거를 그룹이 없어 아무것도 안 나온다.' 전체가 하나의 그룹이 되고, COUNT(AMT) = 3이 조건을 통과해서 한 행이 나와요.",
    "이렇게 생각하면 틀려요: 'HAVING은 GROUP BY와 반드시 함께 써야 한다.' GROUP BY 없이 HAVING을 쓰는 건 정상 문법이에요."
  ],
  trap: "GROUP BY 없는 HAVING은 오류가 아니에요. 조건이 거짓이면 0행, 참이면 1행이 나와요. COUNT(*)와 COUNT(컬럼)의 차이도 함께 물어요.",
  memo: "GROUP BY 없음 = 전체가 한 그룹, HAVING은 그 그룹을 남길지 결정"
},
{
  id: "S204", s: 2, tp: "agg", lv: 3, sub: "GROUP BY, HAVING 절",
  th: "2과목 | 중첩 집계 MAX(AVG()) · ORA-00979 · ORA-00937",
  q: "[EMP] 테이블(EMPNO, DEPT, SAL)에 대해 오류 없이 실행되는 SQL은? (Oracle 기준)",
  sql: "① SELECT MAX(AVG(SAL)) FROM EMP;\n② SELECT DEPT, MAX(AVG(SAL)) FROM EMP GROUP BY DEPT;\n③ SELECT DEPT, EMPNO, AVG(SAL) FROM EMP GROUP BY DEPT;\n④ SELECT MAX(AVG(SAL)) AS MX FROM EMP GROUP BY DEPT;",
  o: ["①", "②", "③", "④"],
  a: 3,
  sum: "MAX(AVG(SAL))처럼 집계를 두 번 겹치려면 GROUP BY로 그룹을 먼저 만들어야 하고, 결과는 한 행이라 DEPT 같은 보통 컬럼은 함께 쓸 수 없어요. 그래서 ④만 정상이에요.",
  why: "MAX(AVG(SAL))은 '부서별 평균을 구한 뒤, 그 평균들 중 가장 큰 값'이에요. 안쪽 AVG가 그룹마다 값을 하나씩 만들고, 바깥 MAX가 그 값들을 다시 하나로 줄여요.\n\n그래서 안쪽 집계가 나눌 그룹이 있어야 해요. ①처럼 GROUP BY가 없으면 Oracle은 ORA-00978(GROUP BY 없는 중첩 그룹 함수) 오류를 내요.\n\n**바깥 MAX까지 거치면 결과는 딱 한 행이라, 부서마다 다른 DEPT 값을 같이 보여 줄 자리가 없어요.** 그래서 ②는 ORA-00937(단일 그룹의 그룹 함수가 아님) 오류예요.\n\n③은 중첩 집계와 상관없는 기본 규칙 위반이에요. GROUP BY DEPT로 묶었는데 EMPNO는 한 부서 안에서 여러 값이라, 어느 값을 보여 줄지 정할 수 없어요. 그래서 ORA-00979(GROUP BY 표현식이 아님) 오류가 나요.\n\n④는 GROUP BY DEPT로 그룹을 만들고 SELECT에는 중첩 집계만 있으니 정상이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "① SELECT MAX(AVG(SAL)) FROM EMP;                       -- 그룹 없이 중첩 → ORA-00978\n② SELECT DEPT, MAX(AVG(SAL)) FROM EMP GROUP BY DEPT;   -- 결과 1행인데 DEPT를 같이 → ORA-00937\n③ SELECT DEPT, EMPNO, AVG(SAL) FROM EMP GROUP BY DEPT; -- EMPNO는 그룹에 없음 → ORA-00979\n④ SELECT MAX(AVG(SAL)) AS MX FROM EMP GROUP BY DEPT;   -- 부서별 평균 → 그중 최댓값 1행 → 정상" },
    { t: "판정표", tb: { c: ["보기", "GROUP BY", "SELECT 목록", "결과"], r: [["①", "없음", "중첩 집계", "ORA-00978"], ["②", "DEPT", "DEPT + 중첩 집계", "ORA-00937"], ["③", "DEPT", "DEPT, EMPNO, AVG", "ORA-00979"], ["④", "DEPT", "중첩 집계만", "정상"]], hl: [3] } },
    { t: "의도대로 쓰려면: 평균이 가장 높은 부서까지 보고 싶을 때", n: "SELECT DEPT, AVG(SAL)\n  FROM EMP\n GROUP BY DEPT\nHAVING AVG(SAL) = (SELECT MAX(AVG(SAL)) FROM EMP GROUP BY DEPT);" }
  ],
  ox: [
    "이렇게 생각하면 틀려요: '평균을 구하고 최댓값을 구하면 되니 GROUP BY는 필요 없다.' 안쪽 AVG가 여러 값을 만들려면 그룹이 있어야 해요. GROUP BY가 없으면 ORA-00978이에요.",
    "이렇게 생각하면 틀려요: 'GROUP BY에 DEPT가 있으니 DEPT를 SELECT해도 된다.' 중첩 집계는 결과를 한 행으로 줄여서, 부서마다 다른 DEPT를 함께 보여 줄 수 없어요. ORA-00937이에요.",
    "이렇게 생각하면 틀려요: 'SELECT에는 아무 컬럼이나 쓸 수 있다.' GROUP BY를 쓰면 SELECT에는 GROUP BY 컬럼과 집계 함수만 올 수 있어요. EMPNO 때문에 ORA-00979가 나요.",
    "정답이에요. GROUP BY로 부서별 평균을 만든 뒤 MAX로 하나로 줄이고, SELECT에는 중첩 집계만 있어서 정상이에요."
  ],
  trap: "중첩 집계는 'GROUP BY 필수' + '보통 컬럼 금지' 두 조건을 함께 지켜야 해요. 하나만 맞춘 보기가 함정이에요.",
  memo: "MAX(AVG()) = GROUP BY 필수, 컬럼은 못 붙임"
},
{
  id: "S205", s: 2, tp: "ddl", lv: 1, sub: "DDL",
  th: "2과목 | TRUNCATE에는 WHERE가 없다 · DELETE의 FROM 생략",
  q: "[ORDERS] 테이블(ONO, ODATE)에 대해 실행할 때 오류가 발생하는 SQL은? (Oracle 기준)",
  sql: "① DELETE FROM ORDERS WHERE ODATE < DATE '2026-01-01';\n② DELETE ORDERS;\n③ TRUNCATE TABLE ORDERS WHERE ODATE < DATE '2026-01-01';\n④ TRUNCATE TABLE ORDERS;",
  o: ["①", "②", "③", "④"],
  a: 2,
  sum: "TRUNCATE는 테이블을 통째로 비우는 명령이라 WHERE 절을 받지 않아요. 그래서 ③은 문법 오류이고, FROM을 뺀 DELETE ORDERS는 Oracle에서 정상이에요.",
  why: "DELETE와 TRUNCATE는 둘 다 행을 지우지만 생김새부터 달라요. DELETE는 DML(Data Manipulation Language, 데이터 조작어)이라 WHERE로 지울 행을 고를 수 있어요.\n\nTRUNCATE는 DDL(Data Definition Language, 데이터 정의어)이에요. 행을 하나씩 보지 않고 테이블이 쓰던 저장 공간을 통째로 처음 상태로 되돌려요. **행을 고르지 않으니 문법에 WHERE를 쓸 자리 자체가 없어서, WHERE를 붙이면 문법 오류가 나요.**\n\n②의 DELETE ORDERS는 FROM이 빠져서 틀려 보이지만, Oracle과 SQL Server 모두 DELETE 다음의 FROM을 생략할 수 있어요. WHERE가 없으니 모든 행을 지워요.\n\n④의 TRUNCATE TABLE ORDERS는 기본 형태라 정상이에요. 일부 행만 지우고 싶다면 ①처럼 DELETE … WHERE를 써야 해요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "① DELETE FROM ORDERS WHERE ODATE < DATE '2026-01-01';  -- 조건에 맞는 행만 삭제 → 정상\n② DELETE ORDERS;                                       -- FROM 생략 가능, 전체 삭제 → 정상\n③ TRUNCATE TABLE ORDERS WHERE ...;                     -- TRUNCATE에는 WHERE 없음 → 문법 오류\n④ TRUNCATE TABLE ORDERS;                               -- 전체를 비움 → 정상" },
    { t: "문법 비교", tb: { c: ["명령", "분류", "WHERE", "FROM 생략"], r: [["DELETE", "DML", "가능", "가능 (DELETE 테이블)"], ["TRUNCATE", "DDL", "불가", "TABLE 키워드를 씀"]], hl: [1] } }
  ],
  ox: [
    "정상이에요. DELETE는 WHERE로 지울 행을 고를 수 있어요.",
    "정상이에요. 이렇게 생각하면 틀려요: 'DELETE는 FROM이 꼭 있어야 한다.' Oracle에서는 DELETE 테이블명처럼 FROM을 생략해도 돼요.",
    "오류라서 정답이에요. 이렇게 생각하면 틀려요: '지우는 명령이니 조건도 줄 수 있다.' TRUNCATE는 테이블을 통째로 비우는 DDL이라 WHERE 절이 없어요.",
    "정상이에요. TRUNCATE TABLE 테이블명은 모든 행을 지우는 기본 형태예요."
  ],
  trap: "'DELETE ORDERS'처럼 FROM이 빠진 보기를 오류로 고르기 쉬워요. 진짜 오류는 WHERE를 붙인 TRUNCATE예요.",
  memo: "TRUNCATE + WHERE = 오류, DELETE는 FROM 생략 OK"
},
{
  id: "S206", s: 2, tp: "tcl", lv: 3, kill: true, sub: "TCL",
  th: "2과목 | DELETE 후 TRUNCATE, 그리고 ROLLBACK (Oracle)",
  q: "Oracle에서 [T] 테이블(ID)에 1~5가 COMMIT되어 있다. 다음 SQL을 순서대로 실행한 뒤 [T]의 행 수는?",
  sql: "INSERT INTO T VALUES (6);\nDELETE FROM T WHERE ID <= 2;\nTRUNCATE TABLE T;\nINSERT INTO T VALUES (7);\nROLLBACK;",
  o: ["0", "1", "4", "5"],
  a: 0,
  sum: "Oracle에서 TRUNCATE는 DDL이라 실행 전후로 자동 COMMIT되고 되돌릴 수 없어요. 그래서 테이블은 빈 채로 확정되고, 마지막 ROLLBACK은 그 뒤의 INSERT 7만 취소해서 0행이 남아요.",
  why: "Oracle에서 DDL(Data Definition Language, 데이터 정의어)을 실행하면 그 앞에서 하던 트랜잭션이 자동으로 COMMIT돼요. 그리고 DDL 자신도 실행되자마자 확정돼요. TRUNCATE도 DDL이에요.\n\n순서대로 따라가 볼게요. INSERT 6과 DELETE(1, 2 삭제)를 하면 T는 {3, 4, 5, 6}이에요. 아직 확정 전이에요.\n\nTRUNCATE TABLE T가 실행되면 먼저 앞의 INSERT와 DELETE가 자동 COMMIT되고, 이어서 모든 행이 지워진 상태가 바로 확정돼요. 이때 T는 비어 있어요.\n\n그다음 INSERT 7은 새 트랜잭션이라 아직 확정 전이에요. **마지막 ROLLBACK은 마지막 COMMIT 이후의 일, 곧 INSERT 7만 되돌려요.** 그래서 T는 0행이에요.\n\n참고(SQL Server): SQL Server는 BEGIN TRAN으로 명시적 트랜잭션을 연 경우 TRUNCATE도 ROLLBACK할 수 있어요. 하지만 시험의 기준인 Oracle에서는 TRUNCATE를 되돌릴 수 없어요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- 시작: T = {1, 2, 3, 4, 5} (확정)\nINSERT INTO T VALUES (6);     -- ① T = {1, 2, 3, 4, 5, 6} (미확정)\nDELETE FROM T WHERE ID <= 2;  -- ② T = {3, 4, 5, 6} (미확정)\nTRUNCATE TABLE T;             -- ③ 앞의 ①② 자동 COMMIT → 전체 삭제 → 즉시 확정: T = {}\nINSERT INTO T VALUES (7);     -- ④ 새 트랜잭션: T = {7} (미확정)\nROLLBACK;                     -- ⑤ ④만 취소 → T = {}" },
    { t: "단계별 상태", tb: { c: ["명령", "T 상태", "확정 여부"], r: [["시작", "{1, 2, 3, 4, 5}", "확정"], ["INSERT 6", "{1, 2, 3, 4, 5, 6}", "미확정"], ["DELETE ID <= 2", "{3, 4, 5, 6}", "미확정"], ["TRUNCATE", "{}", "자동 COMMIT, 확정"], ["INSERT 7", "{7}", "미확정"], ["ROLLBACK", "{}", "INSERT 7만 취소"]], hl: [3, 5] } }
  ],
  ox: [
    "정답이에요. TRUNCATE가 자동 COMMIT으로 빈 테이블을 확정하고, ROLLBACK은 그 뒤의 INSERT 7만 지워서 0행이에요.",
    "이렇게 생각하면 틀려요: 'DDL 뒤에는 ROLLBACK이 아무것도 못 한다.' 자동 COMMIT은 DDL 시점까지만이에요. 그 뒤에 한 INSERT 7은 보통 트랜잭션이라 ROLLBACK으로 취소돼요.",
    "이렇게 생각하면 틀려요: 'TRUNCATE도 ROLLBACK된다. 앞의 INSERT·DELETE만 확정된다.' 그러면 {3, 4, 5, 6}의 4행이 되지만, Oracle에서 TRUNCATE는 DDL이라 되돌릴 수 없어요.",
    "이렇게 생각하면 틀려요: 'ROLLBACK이 마지막 COMMIT 이후 전부를 되돌려 처음 5행으로 간다.' TRUNCATE가 자동 COMMIT을 일으켜서 되돌아갈 시점이 바뀌었어요."
  ],
  trap: "TRUNCATE 뒤의 ROLLBACK은 TRUNCATE 이후에 한 일만 지워요. SQL Server의 '트랜잭션 안 TRUNCATE ROLLBACK'은 참고 사항일 뿐, 시험 기준은 Oracle이에요.",
  memo: "TRUNCATE = DDL = 자동 COMMIT, ROLLBACK은 그 뒤만"
},
{
  id: "S207", s: 2, tp: "ddl", lv: 2, sub: "DDL",
  th: "2과목 | TRUNCATE와 DELETE 트리거 · 저장 공간",
  q: "DELETE, TRUNCATE, DROP에 대한 설명으로 옳지 않은 것은? (Oracle 기준)",
  o: [
    "DELETE는 DML이라 WHERE로 일부 행만 지울 수 있고, COMMIT 전이면 ROLLBACK으로 되돌릴 수 있다.",
    "TRUNCATE는 DDL이라 실행과 동시에 자동 커밋되어 ROLLBACK으로 되돌릴 수 없다.",
    "TRUNCATE 후에는 테이블 구조가 남고 저장 공간이 처음 상태로 돌아가지만, DROP 후에는 구조까지 사라진다.",
    "TRUNCATE는 행을 하나씩 지우므로 테이블에 정의된 DELETE 트리거가 행마다 실행된다."
  ],
  a: 3,
  sum: "TRUNCATE는 행을 하나씩 지우지 않고 저장 공간을 통째로 비워요. 행 단위 삭제가 일어나지 않으니 DELETE 트리거도 실행되지 않아서 ④가 틀렸어요.",
  why: "트리거는 'DELETE가 일어나면 이 일을 해라'처럼 특정 DML(Data Manipulation Language, 데이터 조작어)에 반응해 자동으로 실행되는 프로그램이에요. 그래서 실제로 DELETE 문이 실행돼야 DELETE 트리거가 움직여요.\n\nTRUNCATE는 DDL(Data Definition Language, 데이터 정의어)이에요. 행을 하나씩 찾아 지우는 게 아니라, 테이블이 쓰던 저장 공간을 처음 상태로 되돌려 한꺼번에 비워요. **DELETE 문이 실행되지 않으니 DELETE 트리거도 실행되지 않아요.**\n\n나머지는 옳은 설명이에요. DELETE는 행마다 되돌리는 기록을 남겨서 WHERE도 되고 ROLLBACK도 돼요. TRUNCATE는 Oracle에서 자동 커밋되어 되돌릴 수 없고, 테이블 구조는 남겨요. DROP은 구조까지 없애요.\n\n참고(SQL Server): SQL Server에서는 BEGIN TRAN으로 연 명시적 트랜잭션 안의 TRUNCATE를 ROLLBACK할 수 있어요. 시험 기준인 Oracle과 다른 점이라 따로 기억해 두면 돼요.",
  st: [
    { t: "보기별 판정", tb: { c: ["보기", "내용", "판정", "이유"], r: [["①", "DELETE: WHERE·ROLLBACK 가능", "O", "DML, 행마다 되돌리는 기록"], ["②", "TRUNCATE: 자동 커밋, ROLLBACK 불가", "O", "DDL (Oracle)"], ["③", "TRUNCATE 구조 남음, DROP 구조 삭제", "O", "TRUNCATE는 데이터만 비움"], ["④", "TRUNCATE가 DELETE 트리거 실행", "X", "행 단위 삭제가 없어 트리거 안 돎"]], hl: [3] } },
    { t: "삭제 명령 비교", tb: { c: ["항목", "DELETE", "TRUNCATE", "DROP"], r: [["분류", "DML", "DDL", "DDL"], ["ROLLBACK (Oracle)", "가능", "불가", "불가"], ["DELETE 트리거", "실행", "실행 안 됨", "-"], ["저장 공간", "유지", "처음 상태로", "반환"], ["테이블 구조", "남음", "남음", "삭제"]], hl: [2] } }
  ],
  ox: [
    "옳은 설명이에요. DELETE는 DML이라 WHERE로 행을 고를 수 있고, COMMIT 전이면 ROLLBACK돼요.",
    "옳은 설명이에요. Oracle에서 TRUNCATE는 DDL이라 실행하면 바로 확정되어 되돌릴 수 없어요.",
    "옳은 설명이에요. TRUNCATE는 데이터만 비우고 구조는 남기며, DROP은 테이블 정의까지 없애요.",
    "틀린 설명이라 정답이에요. 이렇게 생각하면 틀려요: '모든 행을 지우니 행마다 DELETE가 일어난다.' TRUNCATE는 저장 공간을 통째로 비우는 DDL이라 DELETE 트리거가 실행되지 않아요."
  ],
  trap: "'TRUNCATE = 빠른 DELETE'로만 외우면 트리거도 돈다고 착각해요. 트리거는 DML에만 반응해요.",
  memo: "TRUNCATE: 트리거 X, 롤백 X(Oracle), 구조 O"
},
{
  id: "S208", s: 2, tp: "ddl", lv: 1, sub: "DDL",
  th: "2과목 | DELETE · TRUNCATE · DROP 뒤의 SELECT",
  q: "3건이 들어 있는 [T] 테이블에 대해 (가)~(다)를 각각 따로(매번 처음 상태에서) 실행했다. 각 경우 마지막 SELECT의 결과로 옳은 것은? (Oracle 기준)",
  sql: "-- (가)\nDELETE FROM T;\nCOMMIT;\nSELECT COUNT(*) FROM T;\n-- (나)\nTRUNCATE TABLE T;\nSELECT COUNT(*) FROM T;\n-- (다)\nDROP TABLE T;\nSELECT COUNT(*) FROM T;",
  o: ["0, 0, 0", "0, 0, 오류", "0, 오류, 오류", "오류, 0, 오류"],
  a: 1,
  sum: "DELETE와 TRUNCATE는 행만 지우고 테이블은 남겨서 COUNT(*)가 0이에요. DROP은 테이블 자체를 없애서 SELECT가 ORA-00942(테이블 없음) 오류를 내요.",
  why: "세 명령의 차이는 '무엇이 남느냐'예요. DELETE와 TRUNCATE는 행을 지우지만 테이블이라는 그릇은 그대로 남겨요. DROP은 그릇까지 없애요.\n\n(가) DELETE FROM T는 WHERE가 없으니 모든 행을 지워요. WHERE가 없어도 오류가 아니라 '전부'라는 뜻이에요. COMMIT 후 COUNT(*)는 0이에요.\n\n(나) TRUNCATE도 모든 행을 지우고 저장 공간을 처음 상태로 돌려요. **테이블 구조는 남아 있으니 COUNT(*)는 오류 없이 0을 돌려줘요.**\n\n(다) DROP TABLE은 테이블 정의까지 없애요. 없는 테이블을 조회하니 Oracle은 ORA-00942(테이블 또는 뷰가 존재하지 않음) 오류를 내요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- (가)\nDELETE FROM T;           -- ① 3행 모두 삭제 (WHERE 없음 = 전체)\nCOMMIT;                  -- ② 확정\nSELECT COUNT(*) FROM T;  -- ③ 테이블은 있음 → 0\n-- (나)\nTRUNCATE TABLE T;        -- ① 데이터 비움, 구조 남음\nSELECT COUNT(*) FROM T;  -- ② → 0\n-- (다)\nDROP TABLE T;            -- ① 구조까지 삭제\nSELECT COUNT(*) FROM T;  -- ② 테이블이 없음 → ORA-00942" },
    { t: "실행 후 남는 것", tb: { c: ["경우", "행", "테이블 구조", "SELECT COUNT(*)"], r: [["(가) DELETE", "없음", "남음", 0], ["(나) TRUNCATE", "없음", "남음", 0], ["(다) DROP", "없음", "없음", "ORA-00942"]], hl: [2] } }
  ],
  ox: [
    "이렇게 생각하면 틀려요: 'DROP도 데이터만 지우고 빈 테이블을 남긴다.' 그건 TRUNCATE예요. DROP은 구조까지 없애서 SELECT가 오류예요.",
    "정답이에요. DELETE와 TRUNCATE는 빈 테이블을 남겨 0이 나오고, DROP은 테이블을 없애서 ORA-00942가 나요.",
    "이렇게 생각하면 틀려요: 'TRUNCATE는 테이블을 잘라 없앤다.' TRUNCATE는 데이터만 비우고 구조는 남겨요. 그래서 COUNT(*)가 0이에요.",
    "이렇게 생각하면 틀려요: 'DELETE는 WHERE가 있어야 한다.' WHERE 없는 DELETE는 모든 행을 지우는 정상 문장이라 COUNT(*)는 0이에요."
  ],
  trap: "TRUNCATE라는 이름 때문에 테이블까지 잘라 낸다고 착각하기 쉬워요. 구조가 사라지는 건 DROP뿐이에요.",
  memo: "DELETE·TRUNCATE = 빈 그릇 남음, DROP = 그릇까지 없음"
},
{
  id: "S209", s: 2, tp: "ddl", lv: 2, kill: true, sub: "DDL",
  th: "2과목 | Oracle MODIFY 여러 컬럼 vs SQL Server ALTER COLUMN 한 컬럼",
  q: "다음 ALTER TABLE 문 중 표시된 DBMS에서 오류가 발생하는 것은? (EMP의 ENAME은 VARCHAR2(20)/VARCHAR(20), SAL은 NUMBER(7)/INT이며, 데이터가 있어도 크기는 모두 늘리는 방향이다.)",
  sql: "① [Oracle]     ALTER TABLE EMP MODIFY (ENAME VARCHAR2(30), SAL NUMBER(9));\n② [Oracle]     ALTER TABLE EMP RENAME COLUMN ENAME TO EMP_NM;\n③ [SQL Server] EXEC sp_rename 'EMP.ENAME', 'EMP_NM', 'COLUMN';\n④ [SQL Server] ALTER TABLE EMP ALTER COLUMN ENAME VARCHAR(30), SAL INT;",
  o: ["①", "②", "③", "④"],
  a: 3,
  sum: "Oracle의 MODIFY는 괄호 안에 여러 컬럼을 한 번에 바꿀 수 있어요. 하지만 SQL Server의 ALTER COLUMN은 한 문장에 한 컬럼만 바꿀 수 있어서 ④가 오류예요.",
  why: "컬럼의 타입이나 크기를 바꾸는 문법은 Oracle과 SQL Server가 달라요. 시험은 이 차이를 섞어서 물어봐요.\n\nOracle은 MODIFY를 써요. ①처럼 괄호로 묶으면 ENAME과 SAL을 한 문장에서 함께 바꿀 수 있어요.\n\nSQL Server는 ALTER COLUMN을 써요. **ALTER COLUMN은 한 문장에 컬럼 하나만 바꿀 수 있어서, ④처럼 쉼표로 두 컬럼을 나열하면 오류가 나요.** 두 컬럼을 바꾸려면 ALTER TABLE 문을 두 번 써야 해요.\n\n컬럼 이름 바꾸기도 달라요. Oracle은 ②처럼 RENAME COLUMN 옛이름 TO 새이름을 쓰고, SQL Server는 ③처럼 sp_rename이라는 시스템 저장 프로시저(DB에 미리 들어 있는 프로그램)를 실행해요. 둘 다 정상이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "① [Oracle]     MODIFY (ENAME VARCHAR2(30), SAL NUMBER(9));  -- 괄호로 여러 컬럼 → 정상\n② [Oracle]     RENAME COLUMN ENAME TO EMP_NM;               -- Oracle 이름 변경 → 정상\n③ [SQL Server] EXEC sp_rename 'EMP.ENAME', 'EMP_NM', 'COLUMN'; -- SQL Server 이름 변경 → 정상\n④ [SQL Server] ALTER COLUMN ENAME VARCHAR(30), SAL INT;     -- 한 문장에 두 컬럼 → 오류" },
    { t: "DBMS별 문법", tb: { c: ["작업", "Oracle", "SQL Server"], r: [["컬럼 변경", "MODIFY (C1 타입, C2 타입) — 여러 개 가능", "ALTER COLUMN C1 타입 — 한 개만"], ["이름 변경", "RENAME COLUMN A TO B", "sp_rename 'T.A', 'B', 'COLUMN'"], ["컬럼 추가", "ADD (C 타입)", "ADD C 타입"], ["컬럼 삭제", "DROP COLUMN C", "DROP COLUMN C"]], hl: [0] } },
    { t: "의도대로 쓰려면: SQL Server는 두 문장으로", n: "ALTER TABLE EMP ALTER COLUMN ENAME VARCHAR(30);\nALTER TABLE EMP ALTER COLUMN SAL INT;" }
  ],
  ox: [
    "정상이에요. 이렇게 생각하면 틀려요: '컬럼 변경은 한 번에 하나만 된다.' 그건 SQL Server의 ALTER COLUMN이에요. Oracle MODIFY는 괄호로 여러 컬럼을 함께 바꿀 수 있어요.",
    "정상이에요. Oracle은 RENAME COLUMN 옛이름 TO 새이름으로 컬럼 이름을 바꿔요.",
    "정상이에요. SQL Server에는 RENAME COLUMN이 없고, sp_rename으로 컬럼 이름을 바꿔요.",
    "오류라서 정답이에요. 이렇게 생각하면 틀려요: 'Oracle MODIFY처럼 ALTER COLUMN도 여러 컬럼을 나열할 수 있다.' SQL Server의 ALTER COLUMN은 한 문장에 한 컬럼만 돼요."
  ],
  trap: "Oracle 문법과 SQL Server 문법이 한 문제에 섞여 나와요. 'Oracle MODIFY는 여럿, SQL Server ALTER COLUMN은 하나'를 함께 외워 두세요.",
  memo: "Oracle MODIFY(여럿) / SQL Server ALTER COLUMN(하나), 이름은 RENAME COLUMN / sp_rename"
},
{
  id: "S210", s: 2, tp: "ddl", lv: 2, sub: "DDL",
  th: "2과목 | 데이터가 있는 컬럼 크기 줄이기 (ORA-01441)",
  q: "[T] 테이블의 C1 컬럼은 VARCHAR2(10)이고 아래 데이터가 들어 있다. 다음 중 오류가 발생하는 SQL은? (Oracle 기준)",
  tb: [{ n: "T", c: ["ID", "C1"], r: [[1, "ABC"], [2, "ABCDEFGH"]] }],
  sql: "① ALTER TABLE T MODIFY (C1 VARCHAR2(20));\n② ALTER TABLE T MODIFY (C1 VARCHAR2(8));\n③ ALTER TABLE T MODIFY (C1 VARCHAR2(5));\n④ ALTER TABLE T ADD (C2 NUMBER DEFAULT 0 NOT NULL);",
  o: ["①", "②", "③", "④"],
  a: 2,
  sum: "컬럼 크기는 늘리는 건 언제나 되고, 줄이는 건 이미 든 값이 새 크기에 다 들어갈 때만 돼요. 8글자 값이 있는데 5로 줄이는 ③이 ORA-01441 오류예요.",
  why: "컬럼 크기를 늘리는 건 기존 값이 모두 그대로 들어가니 언제나 돼요. ①처럼 10을 20으로 늘리는 건 정상이에요.\n\n줄이는 건 조건이 있어요. **이미 들어 있는 값이 새 크기에 모두 들어가면 줄일 수 있고, 하나라도 넘치면 오류가 나요.** 값을 몰래 잘라 버리면 데이터가 망가지니 DB가 막는 거예요.\n\n이 표에서 가장 긴 값은 'ABCDEFGH'로 8글자예요. ②처럼 8로 줄이면 다 들어가니 정상이에요. ③처럼 5로 줄이면 'ABCDEFGH'가 넘쳐서 Oracle은 ORA-01441(일부 값이 너무 커서 컬럼 길이를 줄일 수 없음) 오류를 내요.\n\n④는 행이 있는 테이블에 NOT NULL 컬럼을 추가하지만, DEFAULT 0이 있어서 기존 행에 0이 채워져요. 그래서 NOT NULL을 지킬 수 있어 정상이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "① MODIFY (C1 VARCHAR2(20));  -- 10 → 20 늘리기 → 정상\n② MODIFY (C1 VARCHAR2(8));   -- 최대 8글자 'ABCDEFGH'가 들어감 → 정상\n③ MODIFY (C1 VARCHAR2(5));   -- 'ABCDEFGH'(8)가 넘침 → ORA-01441\n④ ADD (C2 NUMBER DEFAULT 0 NOT NULL); -- 기존 행에 0이 채워짐 → 정상" },
    { t: "값 길이 확인", tb: { c: ["ID", "C1", "길이", "8에 들어감?", "5에 들어감?"], r: [[1, "ABC", 3, "O", "O"], [2, "ABCDEFGH", 8, "O", "X"]], hl: [1] } }
  ],
  ox: [
    "정상이에요. 크기를 늘리는 변경은 기존 값이 모두 들어가니 항상 가능해요.",
    "정상이에요. 이렇게 생각하면 틀려요: '데이터가 있으면 크기를 줄일 수 없다.' 가장 긴 값(8글자)이 새 크기 8에 들어가니 줄일 수 있어요.",
    "오류라서 정답이에요. 이렇게 생각하면 틀려요: '넘치는 값은 알아서 잘린다.' Oracle은 값을 자르지 않고 ORA-01441 오류를 내요.",
    "정상이에요. 이렇게 생각하면 틀려요: '행이 있으면 NOT NULL 컬럼은 추가할 수 없다.' DEFAULT가 있으면 기존 행에 그 값이 채워져서 추가할 수 있어요."
  ],
  trap: "'데이터가 있으면 무조건 못 줄인다'도, '넘치면 잘린다'도 틀려요. 기준은 '가장 긴 값이 들어가느냐'예요.",
  memo: "늘리기 OK, 줄이기는 가장 긴 값이 들어갈 때만"
},
{
  id: "S211", s: 2, tp: "ddl", lv: 3, kill: true, sub: "DDL",
  th: "2과목 | 행이 있는 테이블에 NOT NULL · DEFAULT 컬럼 추가",
  q: "다음 [T] 테이블에 SQL을 순서대로 실행했다. 오류가 난 문장은 반영되지 않고 다음 문장이 계속 실행된다고 할 때, 마지막 SELECT의 결과로 옳은 것은? (Oracle 기준)",
  tb: [{ n: "T", c: ["ID"], r: [[1], [2]] }],
  sql: "ALTER TABLE T ADD (C2 NUMBER NOT NULL);\nALTER TABLE T ADD (C3 NUMBER DEFAULT 0);\nALTER TABLE T ADD (C4 VARCHAR2(5));\nSELECT * FROM T WHERE ID = 1;",
  o: ["ID 1, C2 NULL, C3 0, C4 NULL", "ID 1, C2 0, C3 0, C4 NULL", "ID 1, C3 0, C4 NULL", "ID 1, C3 NULL, C4 NULL"],
  a: 2,
  sum: "행이 있는 테이블에 DEFAULT 없이 NOT NULL 컬럼을 추가하면 기존 행을 채울 값이 없어 오류(ORA-01758)가 나요. DEFAULT 0을 준 C3은 기존 행에 0이 채워지고, C4는 NULL이에요.",
  why: "컬럼을 새로 추가하면 이미 있는 행에도 그 칸이 생겨요. 이때 그 칸에 무엇을 넣을지가 문제예요.\n\nC2는 NOT NULL인데 DEFAULT(기본값)가 없어요. 기존 두 행의 C2에 넣을 값이 없으니 NULL이 될 수밖에 없고, 이는 NOT NULL에 어긋나요. **그래서 Oracle은 ORA-01758(필수 컬럼을 추가하려면 테이블이 비어 있어야 함) 오류를 내고 C2는 만들어지지 않아요.**\n\nC3은 DEFAULT 0과 함께 추가했어요. ADD로 컬럼을 추가할 때 준 DEFAULT는 새로 넣는 행뿐 아니라 기존 행에도 채워져요. 그래서 ID 1의 C3은 0이에요.\n\nC4는 제약도 기본값도 없으니 기존 행의 값은 NULL이에요. 그래서 결과는 ID 1, C3 0, C4 NULL이에요.\n\n헷갈리는 비교가 하나 있어요. 이미 있는 컬럼에 MODIFY로 DEFAULT를 나중에 붙이면, 그 기본값은 앞으로 INSERT할 행에만 적용되고 기존 행은 그대로예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "ALTER TABLE T ADD (C2 NUMBER NOT NULL);   -- ① 기존 2행에 넣을 값 없음 → ORA-01758, 반영 안 됨\nALTER TABLE T ADD (C3 NUMBER DEFAULT 0);  -- ② 기존 행에도 0이 채워짐\nALTER TABLE T ADD (C4 VARCHAR2(5));       -- ③ 기존 행은 NULL\nSELECT * FROM T WHERE ID = 1;             -- ④ ID, C3, C4" },
    { t: "1단계: 문장별 결과", tb: { c: ["문장", "결과", "기존 행의 값"], r: [["ADD C2 NOT NULL", "ORA-01758 오류", "컬럼 없음"], ["ADD C3 DEFAULT 0", "성공", "0"], ["ADD C4", "성공", "NULL"]], hl: [0] } },
    { t: "2단계: 최종 테이블", tb: { c: ["ID", "C3", "C4"], r: [[1, 0, null], [2, 0, null]], hl: [0] } }
  ],
  pg: "ALTER TABLE T ADD C3 numeric DEFAULT 0; ALTER TABLE T ADD C4 varchar(5); SELECT * FROM T WHERE ID = 1",
  res: { c: ["ID", "C3", "C4"], r: [[1, 0, null]] },
  ox: [
    "이렇게 생각하면 틀려요: 'NOT NULL은 앞으로 넣을 행에만 적용되니 기존 행은 NULL로 둔다.' 기존 행도 NOT NULL을 지켜야 해서 C2 추가 자체가 오류예요.",
    "이렇게 생각하면 틀려요: 'NOT NULL 숫자 컬럼은 0으로 자동 채워진다.' DEFAULT를 주지 않으면 DB가 0을 지어내지 않아요. 그래서 오류가 나고 C2는 없어요.",
    "정답이에요. C2는 오류로 만들어지지 않고, C3은 DEFAULT 0이 기존 행에 채워지고, C4는 NULL이에요.",
    "이렇게 생각하면 틀려요: 'DEFAULT는 새로 INSERT하는 행에만 적용된다.' ADD로 컬럼을 추가하면서 준 DEFAULT는 기존 행에도 채워져요."
  ],
  trap: "ADD … DEFAULT는 기존 행에 채워지지만, MODIFY로 나중에 DEFAULT를 붙이면 기존 행은 안 바뀌어요. 둘을 섞어 내는 문제가 많아요.",
  memo: "행 있는 테이블 + NOT NULL 추가 = DEFAULT 필수 (없으면 ORA-01758)"
},
{
  id: "S212", s: 2, tp: "ddl", lv: 1, sub: "DDL",
  th: "2과목 | ADD · DROP COLUMN · 컬럼 이름 변경 문법",
  q: "ALTER TABLE에 대한 설명으로 옳은 것은?",
  o: [
    "Oracle에서 ALTER TABLE T DROP COLUMN C2;로 컬럼을 지울 수 있고, 지운 컬럼은 ROLLBACK으로 되살릴 수 없다.",
    "Oracle에서 컬럼 이름은 ALTER TABLE T MODIFY C1 TO C9;로 바꾼다.",
    "Oracle에서 컬럼을 추가할 때는 ALTER TABLE T ADD COLUMN C3 NUMBER;처럼 COLUMN 키워드를 반드시 써야 한다.",
    "SQL Server에서 컬럼 이름은 ALTER TABLE T RENAME COLUMN C1 TO C9;로 바꾼다."
  ],
  a: 0,
  sum: "DROP COLUMN은 DDL이라 Oracle에서 자동 커밋되어 되돌릴 수 없어요. 이름 변경은 Oracle이 RENAME COLUMN, SQL Server가 sp_rename이고, Oracle의 ADD에는 COLUMN 키워드를 쓰지 않아요.",
  why: "ALTER TABLE은 이미 만든 테이블의 구조를 바꾸는 DDL(Data Definition Language, 데이터 정의어)이에요. Oracle에서 DDL은 실행하는 순간 자동으로 COMMIT돼요.\n\n**그래서 DROP COLUMN으로 지운 컬럼은 ROLLBACK으로 되살릴 수 없어요.** ①이 옳은 설명이에요.\n\n②는 틀렸어요. MODIFY는 컬럼의 타입이나 크기를 바꾸는 명령이고, Oracle에서 이름을 바꿀 때는 RENAME COLUMN C1 TO C9를 써요.\n\n③도 틀렸어요. Oracle은 ADD (C3 NUMBER)처럼 COLUMN 키워드 없이 써요. ④는 Oracle 문법을 SQL Server에 가져다 쓴 거예요. SQL Server는 sp_rename 'T.C1', 'C9', 'COLUMN'으로 이름을 바꿔요.",
  st: [
    { t: "보기별 판정", tb: { c: ["보기", "판정", "이유"], r: [["① Oracle DROP COLUMN, ROLLBACK 불가", "O", "DDL은 자동 커밋"], ["② Oracle MODIFY … TO", "X", "이름 변경은 RENAME COLUMN"], ["③ Oracle ADD COLUMN 필수", "X", "ADD (C3 NUMBER), COLUMN 안 씀"], ["④ SQL Server RENAME COLUMN", "X", "SQL Server는 sp_rename"]], hl: [0] } },
    { t: "올바른 문법 모음", n: "-- Oracle\nALTER TABLE T ADD (C3 NUMBER);\nALTER TABLE T DROP COLUMN C2;\nALTER TABLE T RENAME COLUMN C1 TO C9;\n-- SQL Server\nALTER TABLE T ADD C3 INT;\nALTER TABLE T DROP COLUMN C2;\nEXEC sp_rename 'T.C1', 'C9', 'COLUMN';" }
  ],
  ox: [
    "옳은 설명이라 정답이에요. DROP COLUMN은 DDL이라 Oracle에서 실행 즉시 확정되고 ROLLBACK으로 되돌릴 수 없어요.",
    "틀린 설명이에요. 이렇게 생각하면 틀려요: '바꾸는 건 다 MODIFY.' MODIFY는 타입·크기를 바꿀 때 쓰고, 이름은 RENAME COLUMN C1 TO C9로 바꿔요.",
    "틀린 설명이에요. 이렇게 생각하면 틀려요: 'DROP COLUMN이 있으니 ADD COLUMN도 있다.' Oracle은 ADD (C3 NUMBER)처럼 COLUMN 키워드 없이 써요.",
    "틀린 설명이에요. 이렇게 생각하면 틀려요: 'SQL Server도 Oracle과 문법이 같다.' SQL Server에는 RENAME COLUMN이 없고 sp_rename을 써요."
  ],
  trap: "DROP에는 COLUMN을 붙이고, ADD에는 붙이지 않아요(Oracle). 짝이 안 맞아서 헷갈리기 쉬워요.",
  memo: "Oracle: ADD (C), DROP COLUMN C, RENAME COLUMN A TO B"
},
{
  id: "S213", s: 2, tp: "nullfn", lv: 1, sub: "함수",
  th: "2과목 | SQL Server ISNULL(값, 대체값)",
  q: "SQL Server에서 다음 SQL을 실행한 결과로 옳은 것은?",
  sql: "SELECT ISNULL(1, 2)    AS A,\n       ISNULL(NULL, 2) AS B,\n       ISNULL(3, NULL) AS C;",
  o: ["0, 1, 0", "1, 2, 3", "2, 2, NULL", "2, NULL, NULL"],
  a: 1,
  sum: "SQL Server의 ISNULL(값, 대체값)은 값이 NULL이면 대체값을, 아니면 값을 그대로 돌려줘요. 그래서 1, 2, 3이에요. Oracle에서는 같은 일을 NVL이 해요.",
  why: "ISNULL은 SQL Server의 함수예요. ISNULL(값, 대체값)은 '값이 NULL(비어 있음)이면 대체값으로 바꿔 주고, 아니면 값을 그대로 둔다'는 뜻이에요. Oracle의 NVL(값, 대체값)과 똑같이 동작해요.\n\n**두 번째 인수는 첫 번째 값이 NULL일 때만 쓰이고, 첫 번째 값이 있으면 무시돼요.**\n\n하나씩 볼게요. ISNULL(1, 2)는 1이 NULL이 아니니 1이에요. ISNULL(NULL, 2)는 첫 값이 NULL이니 대체값 2예요. ISNULL(3, NULL)은 3이 NULL이 아니니 3이에요. 대체값이 NULL이어도 쓰이지 않으니 상관없어요.\n\n이름 때문에 'NULL인지 묻는 함수'로 오해하기 쉬워요. NULL인지 확인하는 조건은 IS NULL이고, ISNULL은 값을 바꿔 주는 함수예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT ISNULL(1, 2)    AS A,  -- ① 1은 NULL 아님 → 1\n       ISNULL(NULL, 2) AS B,  -- ② NULL → 대체값 2\n       ISNULL(3, NULL) AS C;  -- ③ 3은 NULL 아님 → 3 (대체값은 안 씀)" },
    { t: "DBMS별 같은 함수", tb: { c: ["식", "SQL Server", "Oracle", "공통(표준)", "결과"], r: [["1, 2", "ISNULL(1, 2)", "NVL(1, 2)", "COALESCE(1, 2)", 1], ["NULL, 2", "ISNULL(NULL, 2)", "NVL(NULL, 2)", "COALESCE(NULL, 2)", 2], ["3, NULL", "ISNULL(3, NULL)", "NVL(3, NULL)", "COALESCE(3, NULL)", 3]], hl: [1] } }
  ],
  pg: "SELECT COALESCE(1, 2) AS A, COALESCE(NULL, 2) AS B, COALESCE(3, NULL) AS C",
  res: { c: ["A", "B", "C"], r: [[1, 2, 3]] },
  ox: [
    "이렇게 생각하면 틀려요: 'ISNULL은 NULL이면 1, 아니면 0을 돌려주는 판정 함수다.' 그건 IS NULL 조건을 숫자로 바꾼 생각이에요. SQL Server의 ISNULL은 값을 대체하는 함수예요.",
    "정답이에요. 첫 값이 NULL일 때만 대체값을 쓰니 1, 2, 3이에요. Oracle의 NVL과 같아요.",
    "이렇게 생각하면 틀려요: '대체값을 항상 돌려준다.' 그러면 2, 2, NULL이 되지만, 대체값은 첫 값이 NULL일 때만 써요.",
    "이렇게 생각하면 틀려요: '첫 값이 NULL이 아니면 대체값으로 바꾸고, NULL이면 그대로 둔다.' 거꾸로예요. NULL일 때 바꿔 주는 함수예요."
  ],
  trap: "ISNULL은 SQL Server 함수, NVL은 Oracle 함수예요. 이름이 'IS NULL'과 비슷해서 참/거짓을 돌려준다고 착각하기 쉬워요.",
  memo: "ISNULL(SQL Server) = NVL(Oracle) = NULL이면 대체값"
},
{
  id: "S214", s: 2, tp: "nullfn", lv: 2, kill: true, sub: "함수",
  th: "2과목 | ISNULL · NVL · NULLIF · COALESCE 한 번에 계산",
  q: "다음 [T] 테이블의 ID가 2인 행에 대해 (가)~(라)를 각각 표시된 DBMS에서 실행했다. 결과를 차례대로 나열한 것으로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "X", "Y", "Z", "W"], r: [[1, 3, 4, 5, 7], [2, null, 4, 4, 7]] }],
  sql: "(가) [SQL Server]   SELECT ISNULL(X, Y)                   FROM T WHERE ID = 2;\n(나) [Oracle]       SELECT NVL(X, 0) + W                  FROM T WHERE ID = 2;\n(다) [Oracle·SQL Server 공통] SELECT NULLIF(Y, Z)        FROM T WHERE ID = 2;\n(라) [Oracle·SQL Server 공통] SELECT COALESCE(X, NULLIF(Y, Z), W) FROM T WHERE ID = 2;",
  o: ["1, 7, NULL, 7", "4, 7, 0, 0", "4, 7, 4, 4", "4, 7, NULL, 7"],
  a: 3,
  sum: "X가 NULL이라 ISNULL(X, Y)는 4, NVL(X, 0) + W는 7이에요. Y와 Z가 같아 NULLIF는 NULL이고, COALESCE는 NULL을 건너뛰고 첫 값인 W(7)를 돌려줘요.",
  why: "네 함수 모두 NULL(비어 있음)을 다루지만 하는 일이 달라요. ISNULL(SQL Server)과 NVL(Oracle)은 첫 값이 NULL이면 대체값으로 바꿔요. NULLIF(a, b)는 두 값이 같으면 NULL, 다르면 a를 돌려줘요. COALESCE는 나열한 값 중 처음으로 NULL이 아닌 값을 돌려줘요.\n\nID 2 행은 X = NULL, Y = 4, Z = 4, W = 7이에요.\n\n(가) ISNULL(X, Y)는 X가 NULL이니 Y인 4예요. (나) NVL(X, 0)은 0이 되고, 0 + 7 = 7이에요.\n\n(다) NULLIF(Y, Z)는 4와 4가 같으니 NULL이에요. **같으면 0이나 a가 아니라 NULL을 돌려준다는 점이 핵심이에요.**\n\n(라) COALESCE(X, NULLIF(Y, Z), W)는 앞에서부터 봐요. X는 NULL, NULLIF(Y, Z)도 NULL이니 건너뛰고, W인 7을 돌려줘요. 그래서 4, 7, NULL, 7이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- ID 2: X = NULL, Y = 4, Z = 4, W = 7\n(가) ISNULL(X, Y)                   -- ① X가 NULL → Y = 4\n(나) NVL(X, 0) + W                  -- ② NVL → 0, 0 + 7 = 7\n(다) NULLIF(Y, Z)                   -- ③ 4 = 4 → NULL\n(라) COALESCE(X, NULLIF(Y, Z), W)   -- ④ NULL, NULL 건너뛰고 → 7" },
    { t: "함수별 계산", tb: { c: ["식", "DBMS", "규칙", "결과"], r: [["ISNULL(X, Y)", "SQL Server", "X가 NULL이면 Y", 4], ["NVL(X, 0) + W", "Oracle", "X가 NULL이면 0", 7], ["NULLIF(Y, Z)", "공통", "같으면 NULL, 다르면 Y", null], ["COALESCE(X, NULLIF(Y, Z), W)", "공통", "첫 번째 NULL 아닌 값", 7]], hl: [2, 3] } }
  ],
  pg: "SELECT COALESCE(X, Y), COALESCE(X, 0) + W, NULLIF(Y, Z), COALESCE(X, NULLIF(Y, Z), W) FROM T WHERE ID = 2",
  res: { c: ["(가)", "(나)", "(다)", "(라)"], r: [[4, 7, null, 7]] },
  ox: [
    "이렇게 생각하면 틀려요: 'ISNULL은 NULL이면 1(참)을 돌려준다.' 그건 IS NULL 조건과 헷갈린 거예요. SQL Server의 ISNULL(X, Y)는 X가 NULL이면 Y(4)를 돌려줘요.",
    "이렇게 생각하면 틀려요: 'NULLIF는 같으면 0을 돌려준다.' 그러면 (다) 0, (라)도 0이 되지만, NULLIF는 같으면 NULL을 돌려줘요.",
    "이렇게 생각하면 틀려요: 'NULLIF는 같으면 그 값을 돌려준다.' 그러면 (다) 4, (라)도 4가 되지만, NULLIF는 같을 때 NULL, 다를 때 첫 값을 돌려줘요.",
    "정답이에요. 4(ISNULL), 7(NVL 후 더하기), NULL(같아서 NULLIF), 7(COALESCE가 두 NULL을 건너뜀)이에요."
  ],
  trap: "NULLIF는 '같으면 NULL'이라 그 결과가 다시 COALESCE에서 건너뛰어져요. 함수가 겹치면 안쪽부터 계산하세요.",
  memo: "ISNULL=NVL(대체), NULLIF(같으면 NULL), COALESCE(첫 non-NULL)"
},
{
  id: "S215", s: 2, tp: "nullfn", lv: 2, kill: true, sub: "WHERE 절",
  th: "2과목 | ISNULL 함수 vs IS NULL 조건 (SQL Server)",
  q: "SQL Server에서 다음 [EMP] 테이블에 (가)~(다)를 실행했을 때 각 결과의 행 수로 옳은 것은? (기본 설정 기준)",
  tb: [{ n: "EMP", c: ["EMPNO", "BONUS"], r: [[1, 100], [2, null], [3, 0], [4, null], [5, 200]] }],
  sql: "(가) SELECT * FROM EMP WHERE BONUS IS NULL;\n(나) SELECT * FROM EMP WHERE ISNULL(BONUS, 0) = 0;\n(다) SELECT * FROM EMP WHERE BONUS = NULL;",
  o: ["2, 2, 0", "2, 3, 0", "2, 3, 2", "3, 3, 3"],
  a: 1,
  sum: "IS NULL은 NULL인지 확인하는 조건이라 2행, ISNULL(BONUS, 0)은 NULL을 0으로 바꾸는 함수라 원래 0인 행까지 3행이에요. = NULL은 참이 되는 행이 없어 0행이에요.",
  why: "이름이 비슷하지만 IS NULL과 ISNULL은 완전히 달라요. IS NULL은 WHERE에 쓰는 '조건'이고, 값이 NULL(비어 있음)이면 참이에요. ISNULL(값, 대체값)은 SQL Server의 '함수'이고, NULL을 대체값으로 바꾼 값을 돌려줘요.\n\n(가) BONUS IS NULL은 BONUS가 비어 있는 2번과 4번만 골라서 2행이에요.\n\n(나) ISNULL(BONUS, 0)은 2번과 4번을 0으로 바꿔요. **그래서 '= 0' 조건에는 원래 0이었던 3번까지 함께 걸려 3행이 나와요.** NULL인 행만 찾으려는 의도였다면 틀린 결과예요.\n\n(다) BONUS = NULL은 NULL과 비교하는 조건이에요. NULL과는 무엇을 비교해도 참도 거짓도 아닌 '모름'이 되고, WHERE는 참인 행만 남기니 0행이에요. SQL Server는 기본 설정(ANSI_NULLS ON, 표준 NULL 비교 규칙을 따름)에서 이렇게 동작해요.\n\n참고로 SQL Server에서 WHERE ISNULL(BONUS)처럼 인수를 하나만 쓰면, 대체값 인수가 빠져 오류가 나요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "(가) WHERE BONUS IS NULL;          -- ① 조건: 비어 있으면 참 → 2, 4번 → 2행\n(나) WHERE ISNULL(BONUS, 0) = 0;   -- ② 함수: NULL → 0으로 바꾼 뒤 비교 → 2, 3, 4번 → 3행\n(다) WHERE BONUS = NULL;           -- ③ NULL과 = 비교 → 모두 '모름' → 0행" },
    { t: "행별 판정", tb: { c: ["EMPNO", "BONUS", "IS NULL", "ISNULL(BONUS, 0) = 0", "= NULL"], r: [[1, 100, "X", "X (100)", "모름"], [2, null, "O", "O (0)", "모름"], [3, 0, "X", "O (0)", "모름"], [4, null, "O", "O (0)", "모름"], [5, 200, "X", "X (200)", "모름"]], hl: [2] } }
  ],
  pg: "SELECT (SELECT COUNT(*) FROM EMP WHERE BONUS IS NULL), (SELECT COUNT(*) FROM EMP WHERE COALESCE(BONUS, 0) = 0), (SELECT COUNT(*) FROM EMP WHERE BONUS = NULL)",
  res: { c: ["(가)", "(나)", "(다)"], r: [[2, 3, 0]] },
  ox: [
    "이렇게 생각하면 틀려요: 'ISNULL(BONUS, 0) = 0은 NULL인 행만 찾는다.' 함수가 NULL을 0으로 바꾼 뒤 비교하니, 원래 0이던 3번도 함께 걸려요.",
    "정답이에요. IS NULL은 2행, ISNULL로 0을 만든 비교는 원래 0인 행까지 3행, = NULL은 0행이에요.",
    "이렇게 생각하면 틀려요: '= NULL도 IS NULL처럼 비어 있는 행을 찾는다.' NULL과의 = 비교는 '모름'이라 아무 행도 나오지 않아요.",
    "이렇게 생각하면 틀려요: 'NULL은 0과 같다.' 그러면 세 조건 모두 2, 3, 4번을 골라 3행이 되지만, NULL은 0이 아니라 '값이 없음'이에요."
  ],
  trap: "ISNULL(컬럼, 0) = 0은 NULL 행만 찾는 조건이 아니에요. NULL 행을 찾을 때는 반드시 IS NULL을 써요.",
  memo: "IS NULL = 조건(참/거짓), ISNULL() = 함수(값 바꾸기)"
},
{
  id: "S216", s: 2, tp: "nullfn", lv: 2, sub: "함수",
  th: "2과목 | NVL2와 NULL이 섞인 산술 연산",
  q: "다음 [T] 테이블에 대해 SQL을 실행한 결과로 옳은 것은? (Oracle 기준)",
  tb: [{ n: "T", c: ["ID", "SAL", "COMM"], r: [[1, 200, 50], [2, 300, null]] }],
  sql: "SELECT ID,\n       NVL2(COMM, SAL + COMM, SAL) AS PAY,\n       SAL + COMM                  AS RAW\n  FROM T\n ORDER BY ID;",
  o: [
    "ID 1: PAY 50, RAW 250 / ID 2: PAY 300, RAW NULL",
    "ID 1: PAY 200, RAW 250 / ID 2: PAY NULL, RAW NULL",
    "ID 1: PAY 250, RAW 250 / ID 2: PAY 300, RAW NULL",
    "ID 1: PAY 250, RAW 250 / ID 2: PAY 300, RAW 300"
  ],
  a: 2,
  sum: "NVL2(x, a, b)는 x가 NULL이 아니면 a, NULL이면 b예요. 그래서 PAY는 250, 300이에요. 반면 NULL이 섞인 덧셈은 결과도 NULL이라 ID 2의 RAW는 NULL이에요.",
  why: "NVL2(x, a, b)는 Oracle 함수예요. x에 값이 있으면 a를, x가 NULL(비어 있음)이면 b를 돌려줘요. NVL과 달리 x 자신을 돌려주지 않는다는 점이 달라요.\n\nID 1은 COMM이 50으로 값이 있으니 a인 SAL + COMM = 250이에요. ID 2는 COMM이 NULL이니 b인 SAL = 300이에요.\n\nRAW는 그냥 SAL + COMM이에요. **NULL은 '모르는 값'이라, 모르는 값에 무엇을 더해도 결과를 알 수 없어서 NULL이 돼요.** NULL을 0으로 봐 주지 않아요.\n\n그래서 ID 1의 RAW는 250, ID 2의 RAW는 NULL이에요. NULL이 섞일 수 있는 계산은 NVL이나 NVL2로 먼저 값을 채워야 해요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT ID,\n       NVL2(COMM, SAL + COMM, SAL) AS PAY,  -- ② COMM 있으면 SAL+COMM, 없으면 SAL\n       SAL + COMM                  AS RAW   -- ② NULL이 섞이면 NULL\n  FROM T                                    -- ① 2행\n ORDER BY ID;                               -- ③ ID 순" },
    { t: "행별 계산", tb: { c: ["ID", "SAL", "COMM", "COMM이 NULL?", "PAY", "RAW"], r: [[1, 200, 50, "아니오 → a", 250, 250], [2, 300, null, "예 → b", 300, null]], hl: [1] } }
  ],
  pg: "SELECT ID, CASE WHEN COMM IS NOT NULL THEN SAL + COMM ELSE SAL END AS PAY, SAL + COMM AS RAW FROM T ORDER BY ID",
  res: { c: ["ID", "PAY", "RAW"], r: [[1, 250, 250], [2, 300, null]] },
  ox: [
    "이렇게 생각하면 틀려요: 'NVL2도 NVL처럼 값이 있으면 그 값(COMM) 자신을 돌려준다.' NVL2는 값이 있으면 두 번째 인수(SAL + COMM = 250)를 돌려줘요.",
    "이렇게 생각하면 틀려요: 'NVL2는 NULL이면 두 번째, 값이 있으면 세 번째 인수다.' 순서가 거꾸로예요. 값이 있으면 두 번째, NULL이면 세 번째예요.",
    "정답이에요. PAY는 NVL2 덕분에 250, 300이고, RAW는 NULL이 섞인 ID 2에서 NULL이에요.",
    "이렇게 생각하면 틀려요: '덧셈에서 NULL은 0으로 친다.' NULL이 섞인 산술 연산의 결과는 NULL이라 ID 2의 RAW는 NULL이에요."
  ],
  trap: "NVL2의 인수 순서(값 있음 → 두 번째, NULL → 세 번째)를 거꾸로 외우는 실수가 많아요. 산술 연산의 NULL은 0이 아니에요.",
  memo: "NVL2(x, 있으면, 없으면) / NULL + 숫자 = NULL"
},
{
  id: "S217", s: 2, tp: "nullfn", lv: 3, kill: true, sub: "함수",
  th: "2과목 | Oracle의 || NULL · NULL 산술 · LENGTH('')",
  q: "Oracle에서 다음 SQL을 실행한 결과로 옳은 것은?",
  sql: "SELECT 'SQL' || NULL || 'D' AS C1,\n       10 + NULL           AS C2,\n       LENGTH('')          AS C3\n  FROM DUAL;",
  o: ["NULL, NULL, NULL", "SQLD, 10, NULL", "SQLD, NULL, 0", "SQLD, NULL, NULL"],
  a: 3,
  sum: "Oracle은 문자열을 || 로 이을 때 NULL을 빈 문자열처럼 건너뛰어 'SQLD'가 돼요. 하지만 산술 연산의 NULL은 결과를 NULL로 만들고, ''는 Oracle에서 NULL이라 LENGTH('')도 NULL이에요.",
  why: "NULL(비어 있음)은 대부분의 연산에서 결과를 NULL로 만들어요. 10 + NULL은 '10에 모르는 값을 더한 것'이라 NULL이에요. 그래서 C2는 NULL이에요.\n\n그런데 Oracle의 문자열 연결(||)은 예외예요. **Oracle은 || 로 이을 때 NULL을 빈 문자열처럼 취급해서 'SQL' || NULL || 'D'는 'SQLD'가 돼요.** 표준 SQL과 PostgreSQL에서는 NULL이 나오는 것과 달라요.\n\nOracle은 길이가 0인 문자열 ''를 NULL로 저장해요. 그래서 LENGTH('')는 LENGTH(NULL)과 같고, NULL을 넣은 함수의 결과도 NULL이에요. 0이 아니에요.\n\n정리하면 결과는 SQLD, NULL, NULL이에요. DUAL은 Oracle이 계산 결과를 한 줄로 보여 주려고 제공하는 1행짜리 테이블이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT 'SQL' || NULL || 'D' AS C1,  -- ② Oracle: NULL은 빈 문자열처럼 → 'SQLD'\n       10 + NULL           AS C2,  -- ② 산술 + NULL → NULL\n       LENGTH('')          AS C3   -- ② '' = NULL(Oracle) → LENGTH(NULL) → NULL\n  FROM DUAL;                       -- ① 1행짜리 테이블" },
    { t: "DBMS별 차이", tb: { c: ["식", "Oracle", "PostgreSQL·표준"], r: [["'SQL' || NULL || 'D'", "SQLD", "NULL"], ["10 + NULL", "NULL", "NULL"], ["LENGTH('')", "NULL ('' = NULL)", "0"]], hl: [0, 2] } }
  ],
  ox: [
    "이렇게 생각하면 틀려요: '문자열 연결에 NULL이 섞여도 결과는 NULL이다.' 그건 표준 SQL·PostgreSQL 동작이에요. Oracle의 ||는 NULL을 건너뛰어 'SQLD'가 돼요.",
    "이렇게 생각하면 틀려요: '산술 연산에서 NULL은 0이다.' 10 + NULL은 NULL이에요. 문자열 연결의 예외가 산술에도 통하는 건 아니에요.",
    "이렇게 생각하면 틀려요: '빈 문자열('')은 길이가 0이다.' Oracle은 ''를 NULL로 다뤄서 LENGTH('')는 0이 아니라 NULL이에요.",
    "정답이에요. 연결은 NULL을 건너뛰어 SQLD, 산술은 NULL, ''는 NULL이라 LENGTH도 NULL이에요."
  ],
  trap: "같은 NULL인데 ||에서는 사라지고 +에서는 전체를 NULL로 만들어요. Oracle의 '' = NULL까지 겹치면 3중 함정이에요.",
  memo: "Oracle: || NULL은 무시, + NULL은 NULL, ''는 NULL"
},
{
  id: "S218", s: 2, tp: "basic", lv: 1, sub: "WHERE 절",
  th: "2과목 | BETWEEN 양 끝 포함 · LIKE '%'와 NULL · = NULL",
  q: "다음 [T] 테이블에 (가)~(다)를 실행했을 때 각 결과의 행 수로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "SCORE", "NM"], r: [[1, 60, "KIM"], [2, 70, null], [3, 80, "LEE"], [4, null, "PARK"], [5, 90, "CHOI"]] }],
  sql: "(가) SELECT * FROM T WHERE SCORE BETWEEN 70 AND 90;\n(나) SELECT * FROM T WHERE NM LIKE '%';\n(다) SELECT * FROM T WHERE SCORE = NULL;",
  o: ["1, 4, 0", "3, 4, 0", "3, 4, 1", "3, 5, 0"],
  a: 1,
  sum: "BETWEEN은 양 끝 값을 포함해서 70, 80, 90의 3행이에요. LIKE '%'는 모든 문자열과 맞지만 NULL과는 맞지 않아 4행이고, = NULL은 0행이에요.",
  why: "BETWEEN a AND b는 'a 이상 b 이하'예요. **양 끝 값 a와 b를 모두 포함해요.** 그래서 (가)는 SCORE가 70, 80, 90인 2·3·5번이 나와 3행이에요. SCORE가 NULL인 4번은 비교 결과가 '모름'이라 빠져요.\n\nLIKE '%'는 '어떤 글자가 몇 개 오든 상관없음'이라 모든 문자열과 맞아요. 하지만 NULL(비어 있음)은 문자열이 아니라 '값이 없음'이라 패턴과 비교할 수 없어요. 그래서 (나)는 NM이 비어 있는 2번을 빼고 4행이에요.\n\n(다)의 SCORE = NULL은 NULL과 = 로 비교했어요. NULL과의 비교는 언제나 '모름'이고, WHERE는 참인 행만 남기니 0행이에요. NULL인 행을 찾으려면 IS NULL을 써야 해요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "(가) WHERE SCORE BETWEEN 70 AND 90;  -- ① 70 <= SCORE <= 90 → 2, 3, 5번 → 3행\n(나) WHERE NM LIKE '%';              -- ② 모든 문자열 O, NULL은 X → 1, 3, 4, 5번 → 4행\n(다) WHERE SCORE = NULL;             -- ③ NULL과 = → '모름' → 0행" },
    { t: "행별 판정", tb: { c: ["ID", "SCORE", "NM", "(가) BETWEEN", "(나) LIKE '%'", "(다) = NULL"], r: [[1, 60, "KIM", "X", "O", "모름"], [2, 70, null, "O (끝값)", "X (NULL)", "모름"], [3, 80, "LEE", "O", "O", "모름"], [4, null, "PARK", "모름", "O", "모름"], [5, 90, "CHOI", "O (끝값)", "O", "모름"]], hl: [1, 4] } }
  ],
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE SCORE BETWEEN 70 AND 90), (SELECT COUNT(*) FROM T WHERE NM LIKE '%'), (SELECT COUNT(*) FROM T WHERE SCORE = NULL)",
  res: { c: ["(가)", "(나)", "(다)"], r: [[3, 4, 0]] },
  ox: [
    "이렇게 생각하면 틀려요: 'BETWEEN은 양 끝을 빼고 사이만 본다.' 그러면 80 하나만 남지만, BETWEEN은 70과 90을 포함해서 3행이에요.",
    "정답이에요. BETWEEN은 끝값 포함 3행, LIKE '%'는 NULL을 뺀 4행, = NULL은 0행이에요.",
    "이렇게 생각하면 틀려요: '= NULL로도 비어 있는 행을 찾을 수 있다.' NULL과 = 비교는 '모름'이라 4번도 나오지 않아요. IS NULL을 써야 해요.",
    "이렇게 생각하면 틀려요: 'LIKE '%'는 모든 행과 맞는다.' 모든 '문자열'과 맞을 뿐, 값이 없는 NULL은 맞지 않아 2번이 빠져요."
  ],
  trap: "LIKE '%'는 '전부'처럼 보이지만 NULL은 못 잡아요. BETWEEN의 끝값 포함과 = NULL의 0행까지 한 번에 물어요.",
  memo: "BETWEEN = 끝값 포함, LIKE '%'는 NULL 제외, = NULL은 0행"
},
{
  id: "S219", s: 2, tp: "basic", lv: 2, sub: "ORDER BY 절",
  th: "2과목 | ORDER BY 위치 번호와 DISTINCT + ORDER BY (ORA-01791)",
  q: "[EMP] 테이블(EMPNO, DEPT, SAL)에 대해 오류가 발생하는 SQL은? (Oracle 기준)",
  sql: "① SELECT DEPT, SAL FROM EMP ORDER BY 2 DESC, 1;\n② SELECT DISTINCT DEPT FROM EMP ORDER BY SAL;\n③ SELECT DEPT FROM EMP ORDER BY SAL;\n④ SELECT DEPT AS D, SAL FROM EMP ORDER BY D, 2;",
  o: ["①", "②", "③", "④"],
  a: 1,
  sum: "DISTINCT로 중복을 없애면 한 DEPT에 SAL이 여러 개라 어느 SAL로 정렬할지 정할 수 없어요. 그래서 ②는 ORA-01791 오류이고, DISTINCT가 없는 ③은 SELECT에 없는 컬럼으로도 정렬할 수 있어요.",
  why: "ORDER BY에는 컬럼 이름, 별칭, SELECT 목록의 위치 번호를 쓸 수 있고, 섞어 써도 돼요. ①의 ORDER BY 2 DESC, 1은 'SAL 내림차순, 같으면 DEPT 오름차순'이고, ④의 ORDER BY D, 2는 별칭과 위치 번호를 섞은 것으로 둘 다 정상이에요.\n\n③처럼 SELECT에 없는 컬럼(SAL)으로 정렬하는 것도 보통은 돼요. 행마다 SAL 값이 그대로 있으니 그 값으로 줄을 세우면 되기 때문이에요.\n\n②는 DISTINCT가 문제예요. DISTINCT DEPT는 같은 부서를 한 행으로 합쳐요. 그러면 한 부서 행에 SAL이 여러 개 섞여 있어서, 어떤 SAL 기준으로 그 행을 세울지 정할 수 없어요.\n\n**그래서 DISTINCT를 쓰면 ORDER BY에는 SELECT 목록에 있는 항목만 올 수 있고, 어기면 Oracle은 ORA-01791(SELECT된 식이 아님) 오류를 내요.**",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "① ... ORDER BY 2 DESC, 1;           -- 위치 번호: 2 = SAL, 1 = DEPT → 정상\n② SELECT DISTINCT DEPT ... ORDER BY SAL; -- 합쳐진 행의 SAL이 하나가 아님 → ORA-01791\n③ SELECT DEPT ... ORDER BY SAL;     -- DISTINCT 없음 → 행마다 SAL 있음 → 정상\n④ ... ORDER BY D, 2;                -- 별칭 + 위치 번호 섞기 → 정상" },
    { t: "판정표", tb: { c: ["보기", "DISTINCT", "정렬 기준이 SELECT 목록에?", "결과"], r: [["①", "없음", "예 (위치 번호)", "정상"], ["②", "있음", "아니오 (SAL)", "ORA-01791"], ["③", "없음", "아니오 (SAL)", "정상"], ["④", "없음", "예 (별칭·위치)", "정상"]], hl: [1] } },
    { t: "의도대로 쓰려면", n: "-- 부서를 중복 없이, 부서별 최고 SAL 순으로\nSELECT DEPT FROM EMP GROUP BY DEPT ORDER BY MAX(SAL);" }
  ],
  ox: [
    "정상이에요. 이렇게 생각하면 틀려요: 'ORDER BY에는 컬럼 이름만 쓸 수 있다.' SELECT 목록의 위치 번호(2 = SAL, 1 = DEPT)도 쓸 수 있어요.",
    "오류라서 정답이에요. 이렇게 생각하면 틀려요: 'SELECT에 없는 컬럼으로도 늘 정렬할 수 있다.' DISTINCT가 있으면 SELECT 목록에 있는 항목으로만 정렬할 수 있어서 ORA-01791이에요.",
    "정상이에요. 이렇게 생각하면 틀려요: 'SELECT에 없는 컬럼으로는 정렬할 수 없다.' DISTINCT가 없으면 행마다 SAL이 있으니 정렬할 수 있어요.",
    "정상이에요. ORDER BY에서는 별칭과 위치 번호를 섞어 써도 돼요."
  ],
  trap: "③과 ②는 DISTINCT 한 단어 차이예요. 'SELECT에 없는 컬럼 정렬'은 DISTINCT가 붙을 때만 오류라는 점이 함정이에요.",
  memo: "DISTINCT + ORDER BY는 SELECT 목록 안에서만 (ORA-01791)"
},
{
  id: "S220", s: 2, tp: "ddl", lv: 2, kill: true, sub: "DDL",
  th: "2과목 | PK · UNIQUE · CHECK 제약과 GRANT/ADMIN OPTION",
  q: "제약조건과 권한에 대한 설명으로 옳지 않은 것은? (Oracle 기준)",
  o: [
    "CHECK (SAL > 0) 제약이 걸린 컬럼에는 NULL을 넣을 수 없다.",
    "PRIMARY KEY 제약은 한 테이블에 하나만 정의할 수 있으며, 여러 컬럼을 묶어 하나의 기본키로 만들 수도 있다.",
    "UNIQUE 제약이 걸린 컬럼에도 NULL을 넣을 수 있다.",
    "객체 권한은 WITH GRANT OPTION으로, 시스템 권한은 WITH ADMIN OPTION으로 받은 사용자가 다시 다른 사용자에게 줄 수 있다."
  ],
  a: 0,
  sum: "CHECK 제약은 조건이 '거짓'인 값만 막아요. NULL을 넣으면 SAL > 0이 '모름'이 되어 거짓이 아니니 통과해요. 그래서 ①이 틀린 설명이에요.",
  why: "CHECK 제약은 '이 조건을 어기는 값은 못 들어온다'는 규칙이에요. 여기서 '어긴다'는 조건이 거짓(FALSE)이 된다는 뜻이에요.\n\nNULL(비어 있음)을 넣으면 NULL > 0은 참도 거짓도 아닌 '모름'이 돼요. **CHECK는 거짓만 막기 때문에 '모름'인 NULL은 통과해요.** NULL까지 막으려면 NOT NULL 제약을 따로 걸어야 해요.\n\n나머지는 옳아요. PK(Primary Key, 기본키)는 테이블당 하나이고, 여러 컬럼을 묶은 복합 기본키도 '하나'로 쳐요. UNIQUE는 중복만 막을 뿐 NULL은 허용해요. Oracle에서는 NULL끼리는 중복으로 보지 않아 여러 행에 NULL을 넣을 수 있어요.\n\n권한을 다시 나눠 주는 옵션은 권한 종류에 따라 달라요. SELECT ON 테이블 같은 객체 권한은 WITH GRANT OPTION, CREATE TABLE 같은 시스템 권한은 WITH ADMIN OPTION이에요. REVOKE로 회수할 때 GRANT OPTION으로 퍼진 객체 권한은 줄줄이 회수되고, ADMIN OPTION으로 퍼진 시스템 권한은 회수가 이어지지 않아요.",
  st: [
    { t: "보기별 판정", tb: { c: ["보기", "판정", "이유"], r: [["① CHECK 컬럼에 NULL 불가", "X", "NULL > 0은 '모름' → 거짓이 아니라 통과"], ["② PK는 테이블당 하나, 복합 가능", "O", "복합 기본키도 하나로 침"], ["③ UNIQUE에 NULL 가능", "O", "중복만 막음"], ["④ GRANT OPTION / ADMIN OPTION", "O", "객체 권한 / 시스템 권한"]], hl: [0] } },
    { t: "예시: CHECK와 NULL", n: "CREATE TABLE EMP2 (ID NUMBER PRIMARY KEY, SAL NUMBER CHECK (SAL > 0));\nINSERT INTO EMP2 VALUES (1, 100);   -- 100 > 0 참 → 성공\nINSERT INTO EMP2 VALUES (2, -5);    -- -5 > 0 거짓 → 제약 위반 오류\nINSERT INTO EMP2 VALUES (3, NULL);  -- NULL > 0 모름 → 성공" },
    { t: "권한 옵션 비교", tb: { c: ["옵션", "대상 권한", "예", "REVOKE 시 연쇄 회수"], r: [["WITH GRANT OPTION", "객체 권한", "GRANT SELECT ON T TO B WITH GRANT OPTION", "O"], ["WITH ADMIN OPTION", "시스템 권한", "GRANT CREATE TABLE TO B WITH ADMIN OPTION", "X"]] } }
  ],
  ox: [
    "틀린 설명이라 정답이에요. 이렇게 생각하면 틀려요: '조건을 만족하지 않으면 다 막힌다.' CHECK는 거짓만 막고, NULL로 생긴 '모름'은 통과시켜요.",
    "옳은 설명이에요. PK는 테이블당 하나이고, 여러 컬럼을 묶은 복합 기본키도 하나의 PK예요.",
    "옳은 설명이에요. UNIQUE는 중복된 값을 막을 뿐, 값이 없는 NULL은 허용해요.",
    "옳은 설명이에요. 객체 권한은 GRANT OPTION, 시스템 권한은 ADMIN OPTION으로 받아야 남에게 다시 줄 수 있어요."
  ],
  trap: "CHECK와 UNIQUE 모두 NULL을 막지 않아요. NULL을 막는 제약은 NOT NULL과 PRIMARY KEY뿐이에요.",
  memo: "CHECK는 거짓만 막음(NULL 통과), NULL 금지는 NOT NULL·PK"
}
);
