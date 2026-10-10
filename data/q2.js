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
  sum: "COUNT(*)는 행을 그냥 다 세고, COUNT(컬럼)은 그 칸이 비어 있는(NULL) 행을 빼고 세요. 그래서 6, 5, 3, 2가 나와요.",
  why: "COUNT(*)는 '행이 몇 개냐'를 세요. 칸이 비어 있든 말든 행만 있으면 하나로 쳐요.\n\n반면 COUNT(컬럼), SUM, AVG 같은 집계 함수는 값이 NULL(비어 있음)이면 그 행을 아예 계산에서 빼요. **NULL은 '값을 모른다'는 뜻이라서, 모르는 것은 셀 수 없다고 보는 거예요.**\n\nCOUNT(DISTINCT 컬럼)은 순서가 정해져 있어요. 먼저 NULL을 버리고, 남은 값에서 중복을 지운 다음 세요.\n\n이 표에 대입해 볼게요. 행은 6개라 COUNT(*)는 6이에요. DEPT는 4번 행만 비어 있어서 5예요. BONUS는 2·5·6번 행이 비어 있어서 3이에요. BONUS의 서로 다른 값은 100과 200 두 가지라 2예요.\n\n그래서 답은 6, 5, 3, 2예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT COUNT(*),               -- ② 행을 다 셈 → 6\n       COUNT(DEPT),            -- ② DEPT가 빈 4번 행은 빼고 → 5\n       COUNT(BONUS),           -- ② BONUS가 빈 2·5·6번 행은 빼고 → 3\n       COUNT(DISTINCT BONUS)   -- ② 빈 값 버리고 중복 지우면 {100, 200} → 2\n  FROM T;                      -- ① T의 6행 전체가 한 덩어리 (GROUP BY 없음)" },
    { t: "1단계: 컬럼별 NULL 표시", tb: { c: ["ID", "DEPT", "BONUS"], r: [[1, 10, 100], [2, 10, null], [3, 20, 200], [4, null, 200], [5, 20, null], [6, 30, null]] } },
    { t: "2단계: 함수별 계산", tb: { c: ["식", "대상 값", "결과"], r: [["COUNT(*)", "행 6개", 6], ["COUNT(DEPT)", "10, 10, 20, 20, 30 (NULL 1개 제외)", 5], ["COUNT(BONUS)", "100, 200, 200 (NULL 3개 제외)", 3], ["COUNT(DISTINCT BONUS)", "{100, 200}", 2]] } }
  ],
  res: { c: ["COUNT(*)", "COUNT(DEPT)", "COUNT(BONUS)", "COUNT(DISTINCT BONUS)"], r: [[6, 5, 3, 2]] },
  pg: "SELECT COUNT(*), COUNT(DEPT), COUNT(BONUS), COUNT(DISTINCT BONUS) FROM T",
  ox: ["정답이에요. 전체 행 6, DEPT가 빈 1개를 뺀 5, BONUS가 빈 3개를 뺀 3, 서로 다른 값 {100, 200}의 2예요.", "이렇게 생각하면 틀려요: 'COUNT(DEPT)도 행을 다 센다.' 4번 행은 DEPT가 비어 있어서 빠지니 6이 아니라 5예요.", "이렇게 생각하면 틀려요: 'DISTINCT로 셀 때 빈 값(NULL)도 하나의 값이다.' 집계 함수는 빈 값을 먼저 버려서 {100, 200} 두 개만 남아요.", "이렇게 생각하면 틀려요: 'COUNT(BONUS)는 행 수와 같다.' BONUS가 빈 3행은 세지 않으니 3이에요. 6은 COUNT(*)의 값이에요."],
  trap: "DISTINCT로 셀 때 NULL도 하나의 값으로 셀 것 같지만, 집계 함수는 NULL부터 버리고 중복을 지워요.",
  memo: "COUNT(*)만 NULL 포함"
},
{
  id: "S02", s: 2, tp: "agg", lv: 2,
  th: "2과목 | AVG(컬럼) vs AVG(NVL(컬럼, 0)) — 분모 차이",
  q: "아래 [T] 테이블에 대해 다음 SQL을 실행한 결과로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "DEPT", "BONUS"], r: [[1, 10, 100], [2, 10, null], [3, 20, 200], [4, null, 200], [5, 20, null], [6, 30, null]] }],
  sql: "SELECT SUM(BONUS)               AS S,\n       ROUND(AVG(BONUS))        AS A1,\n       ROUND(AVG(NVL(BONUS, 0))) AS A2\n  FROM T;",
  o: ["500, 167, 83", "500, 83, 83", "500, 167, 167", "NULL, 167, 83"],
  a: 0,
  sum: "AVG는 빈 값(NULL)을 빼고 나누고, NVL로 빈 값을 0으로 바꾸면 그 행도 나누는 수에 들어가요. 그래서 500÷3과 500÷6이 돼요.",
  why: "집계 함수는 빈 값(NULL)을 계산에서 빼요. 그래서 AVG(컬럼)은 'NULL이 아닌 값의 합 ÷ NULL이 아닌 값의 개수'예요.\n\n**빈 값은 더하는 쪽(분자)에서도, 나누는 쪽(분모)에서도 함께 빠져요.** 모르는 값을 0으로 멋대로 치면 평균이 틀어지기 때문에 이렇게 정해 두었어요.\n\nNVL(BONUS, 0)은 빈 칸을 진짜 숫자 0으로 바꿔요. 0은 '모르는 값'이 아니라 '진짜 0'이니까 그 행도 개수에 들어가요. 그래서 분모가 전체 행 수가 돼요.\n\n이 표에 대입해 볼게요. BONUS 합은 100 + 200 + 200 = 500이에요. 빈 칸 3개는 더할 때 그냥 건너뛰어요. 값이 있는 행은 3개라 A1 = 500 ÷ 3 ≈ 166.67 → 167이에요. 0으로 채우면 6행이 모두 들어가 A2 = 500 ÷ 6 ≈ 83.33 → 83이에요.\n\n그래서 답은 500, 167, 83이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT SUM(BONUS)                AS S,   -- ② 100+200+200 = 500 (빈 칸은 건너뜀)\n       ROUND(AVG(BONUS))         AS A1,  -- ② 500 ÷ 3(값 있는 행) = 166.67 → 167\n       ROUND(AVG(NVL(BONUS, 0))) AS A2   -- ② 빈 칸을 0으로 바꾼 뒤 500 ÷ 6 = 83.33 → 83\n  FROM T;                                -- ① T의 6행이 한 덩어리" },
    { t: "1단계: NVL 적용 전후", tb: { c: ["ID", "BONUS", "NVL(BONUS, 0)"], r: [[1, 100, 100], [2, null, 0], [3, 200, 200], [4, 200, 200], [5, null, 0], [6, null, 0]] } },
    { t: "2단계: 분자·분모", tb: { c: ["식", "분자", "분모", "값", "ROUND"], r: [["AVG(BONUS)", 500, 3, "166.67", 167], ["AVG(NVL(BONUS, 0))", 500, 6, "83.33", 83]] } }
  ],
  res: { c: ["S", "A1", "A2"], r: [[500, 167, 83]] },
  pg: "SELECT SUM(BONUS) S, ROUND(AVG(BONUS)) A1, ROUND(AVG(COALESCE(BONUS,0))) A2 FROM T",
  ox: ["정답이에요. S = 500, A1 = 500 ÷ 3, A2 = 500 ÷ 6이에요.", "이렇게 생각하면 틀려요: 'AVG(BONUS)도 6으로 나눈다.' 빈 칸 3개는 나누는 수에서도 빠져서 3으로 나눠요. 그래서 167이에요.", "이렇게 생각하면 틀려요: 'NVL을 써도 빈 칸은 안 센다.' NVL이 빈 칸을 진짜 0으로 바꿨으니 6행 모두 세어서 83이에요.", "이렇게 생각하면 틀려요: '빈 칸이 하나라도 있으면 SUM도 NULL이다.' SUM은 빈 칸을 건너뛰고 더해서 500이에요."],
  trap: "SUM은 빈 칸(NULL)을 무시할 뿐 결과가 NULL이 되지는 않아요. 값이 전부 비어 있거나 행이 아예 없을 때만 SUM이 NULL이에요.",
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
  sum: "서브쿼리 결과에 빈 값(NULL)이 하나 섞여 있어요. NULL과 비교하면 결과가 '모름'이 돼서, NOT IN은 어떤 행도 통과시키지 못해 0건이에요.",
  why: "NOT IN (목록)은 '목록의 모든 값과 다르다'는 뜻이에요. 그래서 'EMPNO <> 값1 AND EMPNO <> 값2 AND …'로 풀려요.\n\n그런데 NULL은 '모르는 값'이에요. 모르는 값과 다른지 물으면 DB는 참도 거짓도 아닌 UNKNOWN(모름)이라고 답해요. AND로 묶인 식에 '모름'이 하나라도 끼면 결과는 거짓이거나 모름이 될 뿐, 절대 참이 될 수 없어요.\n\n**WHERE는 참인 행만 통과시켜요. 그래서 서브쿼리 결과에 NULL이 하나만 있어도 NOT IN은 0건이 돼요.**\n\n이 표에 대입해 볼게요. KING의 MGR이 비어 있어서 서브쿼리 결과는 {NULL, 1001, 1002, 1003, 1002}예요. 1001·1002·1003은 목록에 자기 번호가 있으니 거짓이에요. 부하가 없는 1004·1005는 다른 값들과는 다 다르지만, 'NULL과 다르냐'에서 모름이 나와 통과하지 못해요.\n\n그래서 결과는 0건이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT COUNT(*)                            -- ④ 남은 행 수 → 0\n  FROM EMP                                 -- ① EMP 5행\n WHERE EMPNO NOT IN (SELECT MGR FROM EMP); -- ② 목록 = {NULL, 1001, 1002, 1003, 1002}\n                                           -- ③ 'EMPNO <> NULL'이 모름 → 모든 행 탈락" },
    { t: "1단계: 서브쿼리 결과 (MGR 목록)", tb: { c: ["MGR"], r: [[null], [1001], [1002], [1003], [1002]] }, n: "빈 값(NULL)이 하나 섞여 있어요. KING의 MGR이에요." },
    { t: "2단계: 행마다 NOT IN 평가", tb: { c: ["EMPNO", "<>1001", "<>1002", "<>1003", "<>NULL", "AND 결과"], r: [[1001, "거짓", "참", "참", "모름", "거짓"], [1002, "참", "거짓", "참", "모름", "거짓"], [1003, "참", "참", "거짓", "모름", "거짓"], [1004, "참", "참", "참", "모름", "모름"], [1005, "참", "참", "참", "모름", "모름"]], hl: [3, 4] }, n: "1004와 1005는 NULL만 없었다면 참이었어요. 하지만 'NULL과 다르냐'가 모름이라 걸러져요." },
    { t: "의도대로 쓰려면", n: "-- 방법 1: 서브쿼리에서 빈 값을 미리 뺀다\nSELECT COUNT(*)\n  FROM EMP\n WHERE EMPNO NOT IN (SELECT MGR FROM EMP WHERE MGR IS NOT NULL);  -- 2 (ADAMS, FORD)\n\n-- 방법 2: NOT EXISTS ('맞는 행이 있나?'만 따져서 NULL에 안 흔들림)\nSELECT COUNT(*)\n  FROM EMP A\n WHERE NOT EXISTS (SELECT 1 FROM EMP B WHERE B.MGR = A.EMPNO);     -- 2 (ADAMS, FORD)" }
  ],
  res: { c: ["COUNT(*)"], r: [[0]] },
  pg: "SELECT COUNT(*) FROM EMP WHERE EMPNO NOT IN (SELECT MGR FROM EMP)",
  ox: ["정답이에요. 목록에 KING의 빈 MGR이 섞여 있어서 어떤 행도 참이 되지 못해요.", "이렇게 생각하면 틀려요: '부하 없는 사원은 ADAMS, FORD 2명이다.' 상식으로는 맞지만, NULL과 비교한 결과가 '모름'이라 이 둘도 빠져요.", "이렇게 생각하면 틀려요: 'NOT IN과 IN은 비슷하게 센다.' 3건은 IN으로 관리자인 사원(KING, JONES, SCOTT)을 셀 때 나오는 값이에요. IN은 OR로 풀려 NULL이 있어도 괜찮지만, 이 문제는 NOT IN이에요.", "이렇게 생각하면 틀려요: 'NOT IN이 아무것도 거르지 못한다.' 5건은 전체 행 수예요. 실제로는 반대로 전부 걸러져요."],
  trap: "출제자는 '부하 없는 사원은 2명'이라는 상식적인 답을 보기에 넣어 둬요. 서브쿼리 컬럼에 NULL이 있는지부터 확인하세요.",
  memo: "NOT IN + NULL = 0건 / 해결: IS NOT NULL 조건 또는 NOT EXISTS"
},
{
  id: "S04", s: 2, tp: "notin", lv: 3,
  th: "2과목 | NOT IN · NOT EXISTS · 아우터 조인 동치 비교",
  q: "아래 [EMP] 테이블에서 다음 SQL 중 결과 건수가 나머지 셋과 다른 것은?",
  tb: [{ n: "EMP", c: ["EMPNO", "ENAME", "MGR"], r: [[1001, "KING", null], [1002, "JONES", 1001], [1003, "SCOTT", 1002], [1004, "ADAMS", 1003], [1005, "FORD", 1002]] }],
  sql: "① SELECT * FROM EMP A\n   WHERE A.EMPNO NOT IN (SELECT MGR FROM EMP WHERE MGR IS NOT NULL);\n\n② SELECT * FROM EMP A\n   WHERE NOT EXISTS (SELECT 1 FROM EMP B WHERE B.MGR = A.EMPNO);\n\n③ SELECT A.* FROM EMP A LEFT OUTER JOIN EMP B\n     ON B.MGR = A.EMPNO\n   WHERE B.EMPNO IS NULL;\n\n④ SELECT * FROM EMP A\n   WHERE A.EMPNO NOT IN (SELECT MGR FROM EMP);",
  o: ["①", "②", "③", "④"],
  a: 3,
  sum: "①②③은 모두 '부하 없는 사원' ADAMS, FORD 2건을 찾아요. ④만 목록에 빈 값(NULL)이 섞여 0건이라 답이에요.",
  why: "NOT IN, NOT EXISTS, 아우터 조인 + IS NULL은 모두 '짝이 없는 행'을 찾는 방법이에요. 차이는 빈 값(NULL)을 다루는 방식이에요.\n\nNOT IN은 'EMPNO <> 값'을 AND로 묶어요. 목록에 NULL이 있으면 결과가 '모름'이 돼서 참이 나올 수 없어요.\n\n**NOT EXISTS는 '조건에 맞는 행이 하나라도 있나?'만 물어요. NULL과 비교해 모름이 나오면 그냥 '맞는 행 없음'으로 쳐요.** 그래서 NULL에 흔들리지 않아요.\n\n아우터 조인은 부하가 없으면 B 쪽을 빈 값으로 채워 남겨요. 원래 비어 있을 수 없는 B.EMPNO가 비어 있다면, 그 사원은 부하가 없다는 뜻이에요.\n\n이 표에서 부하가 없는 사원은 ADAMS(1004), FORD(1005)뿐이에요. ①은 NULL을 미리 걸렀고, ②는 NULL과 상관없고, ③은 짝 없는 행만 남겨서 셋 다 2건이에요. ④만 KING의 빈 MGR 때문에 0건이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- ① 빈 값을 미리 걸러서 목록 = {1001, 1002, 1003, 1002}\nSELECT * FROM EMP A\n WHERE A.EMPNO NOT IN (SELECT MGR FROM EMP WHERE MGR IS NOT NULL);  -- 1004, 1005 → 2건\n\n-- ② 행마다 'B.MGR = A.EMPNO인 부하가 있나?' → 없을 때만 통과\nSELECT * FROM EMP A\n WHERE NOT EXISTS (SELECT 1 FROM EMP B WHERE B.MGR = A.EMPNO);     -- 1004, 1005 → 2건\n\n-- ③ 부하(B)를 붙이고, 못 붙은 행(B.EMPNO가 빈 값)만 남김\nSELECT A.* FROM EMP A LEFT OUTER JOIN EMP B ON B.MGR = A.EMPNO\n WHERE B.EMPNO IS NULL;                                           -- 1004, 1005 → 2건\n\n-- ④ 목록에 KING의 빈 MGR이 섞임 → 'EMPNO <> NULL'이 모름\nSELECT * FROM EMP A\n WHERE A.EMPNO NOT IN (SELECT MGR FROM EMP);                      -- 0건" },
    { t: "③ 아우터 조인 중간 결과", tb: { c: ["A.EMPNO", "A.ENAME", "B.EMPNO(부하)"], r: [[1001, "KING", 1002], [1002, "JONES", 1003], [1002, "JONES", 1005], [1003, "SCOTT", 1004], [1004, "ADAMS", null], [1005, "FORD", null]], hl: [4, 5] }, n: "B.EMPNO가 비어 있는 행 = 부하가 없는 사원 → ADAMS, FORD예요." },
    { t: "보기별 건수", tb: { c: ["SQL", "건수"], r: [["①", 2], ["②", 2], ["③", 2], ["④", 0]], hl: [3] } }
  ],
  res: { c: ["①", "②", "③", "④"], r: [[2, 2, 2, 0]] },
  pg: "SELECT (SELECT COUNT(*) FROM EMP A WHERE A.EMPNO NOT IN (SELECT MGR FROM EMP WHERE MGR IS NOT NULL)),(SELECT COUNT(*) FROM EMP A WHERE NOT EXISTS (SELECT 1 FROM EMP B WHERE B.MGR=A.EMPNO)),(SELECT COUNT(*) FROM EMP A LEFT JOIN EMP B ON B.MGR=A.EMPNO WHERE B.EMPNO IS NULL),(SELECT COUNT(*) FROM EMP A WHERE A.EMPNO NOT IN (SELECT MGR FROM EMP))",
  ox: ["이렇게 생각하면 틀려요: 'NOT IN은 무조건 위험하다.' ①은 서브쿼리 안에서 IS NOT NULL로 빈 값을 걸렀으니 정상적으로 2건이에요.", "이렇게 생각하면 틀려요: 'NOT EXISTS도 NOT IN처럼 NULL에 약하다.' NOT EXISTS는 맞는 행이 있는지만 봐서 2건이에요.", "이렇게 생각하면 틀려요: '아우터 조인은 행을 늘리기만 한다.' 부하가 안 붙어 B.EMPNO가 빈 ADAMS, FORD만 남아 2건이에요.", "정답이에요. 목록에 빈 값(KING의 MGR)이 섞인 NOT IN이라 0건이에요."],
  trap: "NOT EXISTS와 NOT IN이 '항상 같다'고 외우면 틀려요. 서브쿼리 컬럼에 NULL이 있을 때만 둘의 결과가 달라져요.",
  memo: "NULL이 있을 땐 NOT EXISTS ≠ NOT IN"
},
{
  id: "S05", s: 2, tp: "basic", lv: 1,
  th: "2과목 | SELECT 논리적 실행 순서와 별칭(Alias)",
  q: "다음 중 오류가 발생하는 SQL은? (Oracle 기준)",
  sql: "① SELECT ENAME, SAL * 12 AS ANNUAL FROM EMP ORDER BY ANNUAL;\n② SELECT ENAME, SAL * 12 AS ANNUAL FROM EMP WHERE ANNUAL > 30000;\n③ SELECT DEPTNO, SUM(SAL) AS TOT FROM EMP GROUP BY DEPTNO ORDER BY TOT DESC;\n④ SELECT DEPTNO, SUM(SAL) FROM EMP GROUP BY DEPTNO HAVING SUM(SAL) > 5000;",
  o: ["①", "②", "③", "④"],
  a: 1,
  sum: "WHERE는 SELECT보다 먼저 실행돼요. 그래서 SELECT에서 붙인 별칭 ANNUAL을 WHERE에서는 아직 몰라 ②가 오류예요.",
  why: "SQL은 적힌 순서대로 실행되지 않아요. FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY 순서로 처리돼요.\n\n별칭(AS ANNUAL)은 SELECT 단계에서 만들어져요. **WHERE는 SELECT보다 먼저 실행되니까, 그 시점엔 ANNUAL이라는 이름이 아직 없어요.** WHERE는 행을 고르는 단계라서, 화면에 보일 식을 계산하기 전이에요.\n\nORDER BY는 SELECT가 끝난 결과를 정렬해요. 그래서 별칭을 쓸 수 있어요(①, ③). ④는 HAVING에 별칭이 아니라 SUM(SAL)이라는 식을 그대로 썼으니 괜찮아요.\n\n그래서 WHERE ANNUAL > 30000을 쓴 ②만 ORA-00904(잘못된 이름) 오류가 나요.",
  st: [
    { t: "논리적 처리 순서", tb: { c: ["순서", "절", "SELECT 별칭 사용"], r: [["1", "FROM", "불가"], ["2", "WHERE", "불가"], ["3", "GROUP BY", "불가"], ["4", "HAVING", "불가"], ["5", "SELECT", "여기서 별칭 생성"], ["6", "ORDER BY", "가능"]], hl: [1] } },
    { t: "예시: 오류와 고치는 법", n: "-- 오류: WHERE 시점엔 별칭 ANNUAL이 아직 없다\nSELECT ENAME, SAL * 12 AS ANNUAL\n  FROM EMP\n WHERE ANNUAL > 30000;      -- ORA-00904: \"ANNUAL\": 부적합한 식별자\n\n-- 고침 1: 식을 그대로 다시 쓴다\nSELECT ENAME, SAL * 12 AS ANNUAL\n  FROM EMP\n WHERE SAL * 12 > 30000;\n\n-- 고침 2: 인라인 뷰에서 별칭을 먼저 만든다\nSELECT ENAME, ANNUAL\n  FROM (SELECT ENAME, SAL * 12 AS ANNUAL FROM EMP)\n WHERE ANNUAL > 30000;" }
  ],
  ox: ["이렇게 생각하면 틀려요: '별칭은 어디서도 못 쓴다.' ORDER BY는 SELECT 다음이라 ANNUAL을 이미 알아요. 정상이에요.", "정답이에요. WHERE(2번째)는 SELECT(5번째)보다 먼저라 ANNUAL이 아직 없어요. ORA-00904가 나요.", "이렇게 생각하면 틀려요: 'GROUP BY가 있으면 별칭을 못 쓴다.' ORDER BY는 맨 마지막이라 집계 결과의 별칭 TOT도 쓸 수 있어요.", "이렇게 생각하면 틀려요: 'HAVING에 집계 함수를 쓰면 안 된다.' HAVING은 원래 집계 조건을 쓰는 곳이고, 별칭 대신 식을 그대로 썼으니 정상이에요."],
  trap: "HAVING에서도 별칭(TOT)은 쓸 수 없어요(SQLD·Oracle 21c 이하 기준). HAVING은 4번째라 SELECT보다 먼저예요.",
  memo: "F·W·G·H·S·O — 별칭은 O(ORDER BY)에서만"
},
{
  id: "S06", s: 2, tp: "agg", lv: 2,
  th: "2과목 | GROUP BY 규칙 — 그룹핑 컬럼과 집계 함수",
  q: "다음 중 오류가 발생하는 SQL은?",
  sql: "① SELECT DEPTNO, COUNT(*) FROM EMP GROUP BY DEPTNO HAVING COUNT(*) >= 2;\n② SELECT COUNT(*) FROM EMP HAVING COUNT(*) > 0;\n③ SELECT DEPTNO, JOB, MAX(SAL) FROM EMP GROUP BY DEPTNO;\n④ SELECT MAX(SAL) FROM EMP GROUP BY DEPTNO;",
  o: ["①", "②", "③", "④"],
  a: 2,
  sum: "부서별로 묶으면 한 부서에 JOB이 여러 개일 수 있어서, 어떤 JOB을 보여 줄지 정할 수 없어요. 그래서 ③이 오류예요.",
  why: "GROUP BY를 하면 결과 한 줄은 원래 행 하나가 아니라 '묶음 하나'를 대표해요.\n\n그래서 SELECT에는 묶음마다 값이 딱 하나로 정해지는 것만 올 수 있어요. GROUP BY에 쓴 컬럼, 아니면 MAX·SUM 같은 집계 함수예요.\n\n③은 DEPTNO로만 묶었어요. 10번 부서에 JOB이 여러 개라면 그중 무엇을 보여 줄지 정할 수 없어요. **그래서 Oracle은 실행하기 전에 ORA-00979(GROUP BY 표현식이 아님)로 막아요.** 실제 데이터에 JOB이 하나뿐이어도 문법만 보고 오류를 내요.\n\n반대 방향은 자유로워요. GROUP BY 컬럼을 SELECT에 안 써도 되고(④), GROUP BY 없이 HAVING을 쓰면 표 전체가 한 묶음이 돼요(②).\n\n그래서 오류는 ③뿐이에요.",
  st: [
    { t: "보기별 판정", tb: { c: ["보기", "결과", "이유"], r: [["①", "정상", "그룹 컬럼 + 집계 함수, HAVING에 집계 조건"], ["②", "정상", "GROUP BY 없으면 표 전체가 한 묶음"], ["③", "오류 (ORA-00979)", "JOB은 묶음마다 값이 하나로 안 정해짐"], ["④", "정상", "GROUP BY 컬럼을 SELECT에서 빼도 됨"]], hl: [2] } },
    { t: "예시: 오류와 고치는 법", n: "-- 오류: JOB은 부서 묶음마다 값이 하나로 정해지지 않는다\nSELECT DEPTNO, JOB, MAX(SAL)\n  FROM EMP\n GROUP BY DEPTNO;           -- ORA-00979: GROUP BY 표현식이 아닙니다\n\n-- 고침 1: JOB도 묶는 기준에 넣는다 (부서·직무별 최고 급여)\nSELECT DEPTNO, JOB, MAX(SAL)\n  FROM EMP\n GROUP BY DEPTNO, JOB;\n\n-- 고침 2: JOB을 집계 함수로 감싼다\n-- (주의: MAX(JOB)은 최고 급여자의 JOB이 아니라 알파벳상 가장 뒤의 JOB)\nSELECT DEPTNO, MAX(JOB), MAX(SAL)\n  FROM EMP\n GROUP BY DEPTNO;" }
  ],
  ox: ["이렇게 생각하면 틀려요: 'HAVING은 쓰기 까다롭다.' 묶음별 건수 조건이라 정상이에요.", "이렇게 생각하면 틀려요: 'HAVING은 GROUP BY가 꼭 있어야 한다.' 없으면 표 전체를 한 묶음으로 봐서 정상이에요.", "정답이에요. JOB은 묶는 기준도 아니고 집계 함수 안에도 없어서 ORA-00979가 나요.", "이렇게 생각하면 틀려요: '묶은 컬럼은 SELECT에 꼭 보여야 한다.' 안 보여도 돼요. 부서별 최고 급여만 나와요."],
  trap: "②처럼 GROUP BY 없는 HAVING은 어색해 보이지만 문법상 허용돼요.",
  memo: "SELECT 절 = GROUP BY 컬럼 + 집계 함수"
},
{
  id: "S07", s: 2, tp: "nullfn", lv: 1,
  th: "2과목 | NULL 관련 함수 (NVL · NVL2 · NULLIF · COALESCE)",
  q: "다음 SQL의 실행 결과로 옳은 것은? (Oracle 기준)",
  sql: "SELECT NVL(NULL, 0)            AS C1,\n       NVL2(NULL, 'A', 'B')     AS C2,\n       NULLIF(10, 10)           AS C3,\n       COALESCE(NULL, NULL, 'Z') AS C4\n  FROM DUAL;",
  o: ["0, B, NULL, Z", "0, A, NULL, Z", "0, B, 10, Z", "NULL, B, NULL, Z"],
  a: 0,
  sum: "NVL은 빈 값이면 0, NVL2는 빈 값이면 세 번째 'B', NULLIF는 두 값이 같으면 NULL, COALESCE는 처음 나오는 빈 값 아닌 'Z'예요.",
  why: "네 함수 모두 빈 값(NULL)을 다루지만 규칙이 달라요.\n\nNVL(A, B)는 A가 비어 있을 때만 B로 바꿔요. NVL2(A, B, C)는 A에 값이 있으면 B, 비어 있으면 C를 돌려줘요. **NVL2는 '값이 있을 때'가 먼저 나온다는 점이 헷갈리기 쉬워요.**\n\nNULLIF(A, B)는 반대로 일부러 빈 값을 만들어요. 두 값이 같으면 NULL, 다르면 A예요. 'X / NULLIF(Y, 0)'처럼 0으로 나누는 것을 막을 때 써요.\n\nCOALESCE(A, B, …)는 왼쪽부터 보며 처음으로 비어 있지 않은 값을 돌려줘요. NVL을 여러 개로 늘린 것이에요.\n\n대입하면 NVL(NULL, 0) = 0, NVL2(NULL, 'A', 'B') = 'B', NULLIF(10, 10) = NULL, COALESCE(NULL, NULL, 'Z') = 'Z'예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT NVL(NULL, 0)             AS C1,  -- ② 첫 값이 비었음 → 0\n       NVL2(NULL, 'A', 'B')      AS C2,  -- ② 첫 값이 비었음 → 세 번째 'B'\n       NULLIF(10, 10)            AS C3,  -- ② 두 값이 같음 → NULL\n       COALESCE(NULL, NULL, 'Z') AS C4   -- ② 왼쪽부터 첫 '값 있는 것' → 'Z'\n  FROM DUAL;                             -- ① 1행짜리 연습용 표" },
    { t: "함수별 평가", tb: { c: ["식", "판단", "결과"], r: [["NVL(NULL, 0)", "첫 인자가 NULL", "0"], ["NVL2(NULL, 'A', 'B')", "첫 인자가 NULL → 세 번째", "B"], ["NULLIF(10, 10)", "두 값이 같음", null], ["COALESCE(NULL, NULL, 'Z')", "처음 나오는 NOT NULL", "Z"]] } }
  ],
  res: { c: ["C1", "C2", "C3", "C4"], r: [[0, "B", null, "Z"]] },
  pg: "SELECT COALESCE(NULL,0) C1, CASE WHEN NULL IS NOT NULL THEN 'A' ELSE 'B' END C2, NULLIF(10,10) C3, COALESCE(NULL,NULL,'Z') C4",
  ox: ["정답이에요.", "이렇게 생각하면 틀려요: 'NVL2는 비어 있으면 두 번째 값.' 순서가 반대예요. 비어 있으면 세 번째 값 'B'예요.", "이렇게 생각하면 틀려요: 'NULLIF는 같으면 그 값을 준다.' 같으면 NULL이고, 다를 때 첫 값을 줘요.", "이렇게 생각하면 틀려요: 'NVL에 NULL을 넣으면 NULL이 나온다.' 첫 값이 비어 있으면 두 번째 값 0을 줘요."],
  trap: "NVL2의 순서(값이 있을 때가 먼저)를 거꾸로 외우는 실수가 많아요.",
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
  sum: "아우터 조인으로 살린 C, D는 LOC가 비어 있어요. 빈 값과 'BUSAN'을 비교하면 '모름'이라 WHERE에서 빠지고, B는 BUSAN이라 빠져서 A 1건만 남아요.",
  why: "LEFT OUTER JOIN은 먼저 EMP 행을 모두 남겨요. 짝이 없는 사원은 DEPT 쪽 칸을 빈 값(NULL)으로 채워요.\n\n그다음 WHERE가 조인 결과에 적용돼요. 빈 LOC를 'BUSAN'과 비교하면 같은지 다른지 알 수 없어서 '모름'이 돼요.\n\n**WHERE는 참인 행만 남겨요. 그래서 아우터 조인이 살려 둔 행(C, D)이 WHERE에서 다시 지워져요.** 결국 이너 조인과 똑같아져요.\n\n행별로 보면 A는 SEOUL이라 참, B는 BUSAN이라 거짓이에요. C(30번 부서가 DEPT에 없음)와 D(부서 번호가 빔)는 LOC가 비어 있어 모름이에요.\n\n그래서 A 1건만 남아요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT E.ENAME, D.LOC                -- ④ 남은 1행: A, SEOUL\n  FROM EMP E LEFT OUTER JOIN DEPT D  -- ① EMP 4행은 무조건 남김\n    ON E.DEPTNO = D.DEPTNO           -- ② 짝: A-SEOUL, B-BUSAN / C·D는 LOC가 빈 값\n WHERE D.LOC <> 'BUSAN';             -- ③ B는 거짓, C·D는 빈 값이라 모름 → 셋 다 탈락" },
    { t: "1단계: LEFT OUTER JOIN 결과", tb: { c: ["E.ENAME", "E.DEPTNO", "D.LOC"], r: [["A", 10, "SEOUL"], ["B", 20, "BUSAN"], ["C", 30, null], ["D", null, null]] }, n: "C(30번은 DEPT에 없음)와 D(DEPTNO가 비어 있음)는 LOC가 빈 값으로 채워져요." },
    { t: "2단계: WHERE D.LOC <> 'BUSAN' 평가", tb: { c: ["E.ENAME", "D.LOC", "평가"], r: [["A", "SEOUL", "참"], ["B", "BUSAN", "거짓"], ["C", null, "모름"], ["D", null, "모름"]], hl: [0] } },
    { t: "의도대로 쓰려면", n: "-- 의도: 'BUSAN이 아닌 사원', 부서가 없는 사원도 포함\nSELECT E.ENAME, D.LOC\n  FROM EMP E LEFT OUTER JOIN DEPT D\n    ON E.DEPTNO = D.DEPTNO\n WHERE D.LOC <> 'BUSAN' OR D.LOC IS NULL;      -- A(SEOUL), C(NULL), D(NULL) → 3건\n\n-- 조건을 ON으로 옮기면 'BUSAN 부서는 붙이지 않음'이 되어 4건\nSELECT E.ENAME, D.LOC\n  FROM EMP E LEFT OUTER JOIN DEPT D\n    ON E.DEPTNO = D.DEPTNO AND D.LOC <> 'BUSAN';  -- A(SEOUL), B·C·D(NULL) → 4건" }
  ],
  res: { c: ["ENAME", "LOC"], r: [["A", "SEOUL"]] },
  pg: "SELECT E.ENAME, D.LOC FROM EMP E LEFT OUTER JOIN DEPT D ON E.DEPTNO = D.DEPTNO WHERE D.LOC <> 'BUSAN'",
  ox: ["정답이에요. 참이 되는 것은 A(SEOUL) 한 행뿐이에요.", "이렇게 생각하면 틀려요: 'LOC가 빈 C나 D는 BUSAN이 아니니 남는다.' 빈 값과 비교하면 '모름'이라 둘 다 빠져요.", "이렇게 생각하면 틀려요: 'BUSAN만 빠진다.' 그 결과(A, C, D)를 원하면 OR D.LOC IS NULL을 덧붙여야 해요.", "이렇게 생각하면 틀려요: '아우터 조인이니 왼쪽 행은 끝까지 남는다.' 살려 주는 건 조인(ON)까지고, 그 뒤 WHERE가 다시 지워요."],
  trap: "조건을 ON 절로 옮기면(ON E.DEPTNO = D.DEPTNO AND D.LOC <> 'BUSAN') EMP 4행이 모두 남아요. ON은 '붙일지 말지', WHERE는 '남길지 말지'를 정해요.",
  memo: "아우터 조인 + WHERE(안쪽 테이블 조건) = 사실상 이너 조인"
},
{
  id: "S09", s: 2, tp: "join", lv: 3,
  th: "2과목 | 아우터 조인의 ON 절 추가 조건",
  q: "아래 테이블에 대해 다음 SQL을 실행했을 때 C1, C2 값은?",
  tb: [
    { n: "EMP", c: ["ENAME", "DEPTNO"], r: [["A", 10], ["B", 20], ["C", 30], ["D", null]] },
    { n: "DEPT", c: ["DEPTNO", "LOC"], r: [[10, "SEOUL"], [20, "BUSAN"], [40, "DAEGU"]] }
  ],
  sql: "SELECT COUNT(*) AS C1, COUNT(D.LOC) AS C2\n  FROM EMP E LEFT OUTER JOIN DEPT D\n    ON E.DEPTNO = D.DEPTNO\n   AND D.LOC = 'SEOUL';",
  o: ["4, 1", "1, 1", "4, 4", "3, 1"],
  a: 0,
  sum: "ON에 넣은 조건은 'DEPT를 붙일지'만 정해요. EMP 4행은 그대로 남고, SEOUL이 붙는 건 A 하나라서 4, 1이에요.",
  why: "LEFT OUTER JOIN에서 ON 절은 '오른쪽(DEPT)의 어느 행을 붙일까'를 정하는 조건이에요.\n\nON 조건이 맞지 않으면 그 DEPT 행을 붙이지 않을 뿐이에요. **왼쪽(EMP) 행은 짝이 없어도 빈 값을 채워서 반드시 남겨요.** '왼쪽은 다 보여 준다'가 LEFT OUTER JOIN의 약속이기 때문이에요.\n\n그래서 ON에 AND D.LOC = 'SEOUL'을 더해도 행 수는 EMP 행 수 4 그대로예요. 붙는 DEPT만 줄어들어요.\n\n행별로 보면 A는 부서 10이 맞고 SEOUL이라 붙어요. B는 부서는 맞지만 BUSAN이라 안 붙어요. C는 30번 부서가 없고, D는 부서 번호가 비어 있어 짝이 없어요.\n\nCOUNT(*)는 4, 빈 칸을 세지 않는 COUNT(D.LOC)는 A 하나라 1이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT COUNT(*)      AS C1,         -- ③ 행 수 → 4\n       COUNT(D.LOC)  AS C2          -- ③ LOC가 있는 행 → 1 (A)\n  FROM EMP E LEFT OUTER JOIN DEPT D -- ① EMP 4행은 무조건 남김\n    ON E.DEPTNO = D.DEPTNO          -- ② 붙일 DEPT: 부서 번호가 같고\n   AND D.LOC = 'SEOUL';             -- ②   SEOUL인 것만 → A에만 붙음" },
    { t: "1단계: 행마다 붙일 DEPT 찾기", tb: { c: ["ENAME", "DEPTNO 일치", "LOC='SEOUL'", "붙는 LOC"], r: [["A", "10=10", "O", "SEOUL"], ["B", "20=20", "X (BUSAN)", null], ["C", "없음", "-", null], ["D", "NULL 비교 불가", "-", null]], hl: [0] } },
    { t: "2단계: 집계", tb: { c: ["식", "결과"], r: [["COUNT(*)", 4], ["COUNT(D.LOC)", 1]] } },
    { t: "비교: 같은 조건을 WHERE에 두면", n: "SELECT COUNT(*) AS C1, COUNT(D.LOC) AS C2\n  FROM EMP E LEFT OUTER JOIN DEPT D\n    ON E.DEPTNO = D.DEPTNO\n WHERE D.LOC = 'SEOUL';             -- 조인 후 행을 지움 → A만 남아 1, 1" }
  ],
  res: { c: ["C1", "C2"], r: [[4, 1]] },
  pg: "SELECT COUNT(*) C1, COUNT(D.LOC) C2 FROM EMP E LEFT OUTER JOIN DEPT D ON E.DEPTNO = D.DEPTNO AND D.LOC = 'SEOUL'",
  ox: ["정답이에요.", "이렇게 생각하면 틀려요: 'ON 조건도 행을 지운다.' 1, 1은 조건을 WHERE에 두었을 때 결과예요.", "이렇게 생각하면 틀려요: 'COUNT(D.LOC)도 행을 다 센다.' 붙지 못한 3행은 LOC가 비어 있어서 세지 않아요.", "이렇게 생각하면 틀려요: '부서 번호가 빈 D는 빠진다.' D도 왼쪽 표의 행이라 짝이 없어도 남아요."],
  trap: "S08과 짝으로 외우세요. 같은 조건이라도 ON에 있으면 행 수가 그대로, WHERE에 있으면 행이 줄어요.",
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
  sum: "(+)는 '짝이 없으면 빈 칸을 채워 주는 쪽'에 붙여요. EMP에 붙었으니 DEPT가 다 남고, DEPT가 오른쪽이라 RIGHT OUTER JOIN이에요.",
  why: "Oracle의 (+)는 '이쪽에 짝이 없으면 빈 행을 더해(+) 준다'는 표시예요. 그래서 (+)가 붙은 표가 빈 값으로 채워지는 쪽이고, 반대편 표가 모두 남아요.\n\n여기서는 E.DEPTNO(+)예요. **EMP가 빈 값으로 채워지고, DEPT의 모든 행(사원이 없는 부서도)이 남아요.**\n\nANSI 문법의 LEFT/RIGHT는 FROM에 적힌 위치로 '다 남길 표'를 가리켜요. EMP E가 왼쪽, DEPT D가 오른쪽이니 오른쪽을 남기는 RIGHT OUTER JOIN이에요.\n\n표 순서를 바꿔 DEPT D LEFT OUTER JOIN EMP E로 써도 결과는 같아요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT E.ENAME, D.DNAME           -- ③ 사원 없는 부서는 ENAME이 빈 값으로 나옴\n  FROM EMP E, DEPT D              -- ① 두 표 나열 (조인 조건은 WHERE에)\n WHERE E.DEPTNO(+) = D.DEPTNO;    -- ② (+) 쪽 EMP를 빈 값으로 채움 → DEPT 전부 남김" },
    { t: "읽는 법", tb: { c: ["표기", "보존되는 테이블", "NULL로 채워지는 테이블"], r: [["E.DEPTNO(+) = D.DEPTNO", "DEPT", "EMP"], ["E.DEPTNO = D.DEPTNO(+)", "EMP", "DEPT"]], hl: [0] } },
    { t: "같은 뜻의 ANSI 표기", n: "-- 정답 ②: 오른쪽(DEPT)을 다 남김\nSELECT E.ENAME, D.DNAME\n  FROM EMP E RIGHT OUTER JOIN DEPT D ON E.DEPTNO = D.DEPTNO;\n\n-- 같은 결과: 표 순서를 바꾸고 LEFT\nSELECT E.ENAME, D.DNAME\n  FROM DEPT D LEFT OUTER JOIN EMP E ON E.DEPTNO = D.DEPTNO;\n\n-- (+)를 양쪽에 붙여 FULL을 흉내 내면 오류\n-- WHERE E.DEPTNO(+) = D.DEPTNO(+)   → ORA-01468\n-- 양쪽을 다 남기려면 ANSI의 FULL OUTER JOIN을 쓴다" }
  ],
  ox: ["이렇게 생각하면 틀려요: '(+)가 붙은 쪽이 기준이다.' 반대예요. 이건 EMP를 다 남기는 조인이에요.", "정답이에요. (+)가 붙은 EMP가 빈 값으로 채워지고, 오른쪽 DEPT가 다 남아요.", "이렇게 생각하면 틀려요: '(+)로 양쪽을 다 남길 수 있다.' (+)는 한쪽에만 붙일 수 있어서 FULL을 못 만들어요(양쪽에 붙이면 ORA-01468).", "이렇게 생각하면 틀려요: '(+)는 꾸밈일 뿐이다.' (+)가 있으면 아우터 조인이라 사원 없는 부서도 나와요."],
  trap: "(+)가 붙은 쪽이 '기준'이라고 반대로 외우면 틀려요. (+)는 빈 값을 '더해 주는' 쪽이에요.",
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
  sum: "짝이 맞는 2행, T1에만 있는 2행, T2에만 있는 2행을 더해 6행이에요. 빈 값(NULL)끼리는 짝이 되지 않아 각각 따로 남아요.",
  why: "FULL OUTER JOIN은 세 가지를 더해요. 짝이 맞은 행, 왼쪽에만 있는 행, 오른쪽에만 있는 행이에요.\n\n조인 조건 T1.A = T2.A에서 NULL = NULL은 '모르는 값끼리 같은지 모른다'라서 참이 아니라 '모름'이에요. ON도 참일 때만 짝을 지어요.\n\n**그래서 양쪽의 빈 값(NULL)은 서로 짝이 되지 못하고, 각자 '짝 없는 행'으로 하나씩 남아요.**\n\n이 표에 대입해 볼게요. T1의 2가 두 개라서 T2의 2와 각각 붙어 2행이에요. T1에만 있는 1과 NULL이 2행, T2에만 있는 3과 NULL이 2행이에요.\n\n합치면 2 + 2 + 2 = 6행이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT *                       -- ② 짝 2행 + T1만 2행 + T2만 2행 = 6행\n  FROM T1 FULL OUTER JOIN T2   -- ① 양쪽 행을 모두 남김\n    ON T1.A = T2.A;            -- ① 2 = 2만 참 (2개 × 1개 = 2행), NULL = NULL은 모름" },
    { t: "1단계: 매칭", tb: { c: ["T1.A", "T2.A"], r: [[2, 2], [2, 2]] }, n: "T1의 2가 두 개라서 T2의 2와 각각 붙어 2행이에요." },
    { t: "2단계: 짝 없는 행", tb: { c: ["출처", "T1.A", "T2.A"], r: [["T1만", 1, null], ["T1만", null, null], ["T2만", null, 3], ["T2만", null, null]] } },
    { t: "3단계: 합계", n: "2 + 2 + 2 = 6행이에요." },
    { t: "NULL끼리도 짝짓고 싶다면", n: "-- 빈 값을 데이터에 없는 값(-1)으로 바꿔서 비교한다\nSELECT COUNT(*)\n  FROM T1 FULL OUTER JOIN T2\n    ON NVL(T1.A, -1) = NVL(T2.A, -1);  -- NULL끼리 한 행으로 합쳐져 5행" }
  ],
  res: { c: ["COUNT(*)"], r: [[6]] },
  pg: "SELECT COUNT(*) FROM T1 FULL OUTER JOIN T2 ON T1.A = T2.A",
  ox: ["이렇게 생각하면 틀려요: 'NULL끼리 짝이 되고, 2의 중복도 하나로 친다.' 둘 다 아니에요.", "이렇게 생각하면 틀려요: 'NULL끼리는 같으니 한 번 짝지어진다.' 그러면 6 − 1 = 5가 되지만, 조인에서 NULL = NULL은 '모름'이라 짝이 안 돼요.", "정답이에요.", "이렇게 생각하면 틀려요: '두 표 행 수를 그냥 더하면 된다(4 + 3).' T2의 2 하나가 T1의 2 두 개와 각각 이어져서, 입력 3행(T1의 2 두 개 + T2의 2 하나)이 결과 2행이 돼요. 그래서 7 − 1 = 6이에요."],
  trap: "NULL끼리 같다고 보면 5가 나와요. 조인 조건에서 NULL은 절대 짝이 되지 않아요.",
  memo: "FULL = 매칭 + 왼쪽만 + 오른쪽만, NULL은 매칭 불가"
},
{
  id: "S12", s: 2, tp: "join", lv: 2,
  th: "2과목 | NATURAL JOIN · USING 절의 접두사 제약",
  q: "EMP와 DEPT 테이블의 공통 컬럼이 DEPTNO 하나뿐일 때, 다음 중 오류가 발생하는 SQL은? (Oracle 기준)",
  sql: "① SELECT DEPTNO, ENAME, DNAME FROM EMP NATURAL JOIN DEPT;\n② SELECT E.DEPTNO, ENAME FROM EMP E NATURAL JOIN DEPT D;\n③ SELECT DEPTNO, ENAME FROM EMP E JOIN DEPT D USING (DEPTNO);\n④ SELECT E.DEPTNO, E.ENAME FROM EMP E JOIN DEPT D ON E.DEPTNO = D.DEPTNO;",
  o: ["①", "②", "③", "④"],
  a: 1,
  sum: "NATURAL JOIN으로 합쳐진 DEPTNO는 이제 어느 한쪽 표의 것이 아니에요. 그래서 E.처럼 표 이름을 붙이면 ②가 오류예요.",
  why: "NATURAL JOIN과 USING은 두 표에서 이름이 같은 컬럼으로 조인하고, 그 컬럼을 결과에 하나만 남겨요.\n\n합쳐진 DEPTNO는 EMP의 것도 DEPT의 것도 아닌 '공통 컬럼'이에요. **그래서 E.DEPTNO처럼 표 별칭(접두사)을 붙이면 Oracle이 받아들이지 않고 오류를 내요.** NATURAL JOIN은 ORA-25155, USING은 ORA-25154예요.\n\nON 절 조인은 반대예요. E.DEPTNO와 D.DEPTNO가 결과에 따로 있어서, 공통 컬럼에는 접두사를 꼭 붙여야 해요. 안 붙이면 ORA-00918(어느 쪽인지 애매함)이 나요.\n\n보기 중 NATURAL JOIN의 공통 컬럼에 E.를 붙인 것은 ②뿐이라 ②가 오류예요.",
  st: [
    { t: "보기별 판정", tb: { c: ["보기", "조인 방식", "공통 컬럼 표기", "결과"], r: [["①", "NATURAL", "DEPTNO", "정상"], ["②", "NATURAL", "E.DEPTNO", "오류 (ORA-25155)"], ["③", "USING", "DEPTNO", "정상"], ["④", "ON", "E.DEPTNO", "정상"]], hl: [1] } },
    { t: "예시: 오류와 고치는 법", n: "-- 오류: NATURAL JOIN의 공통 컬럼에 접두사\nSELECT E.DEPTNO, ENAME FROM EMP E NATURAL JOIN DEPT D;\n-- ORA-25155: NATURAL 조인에 사용된 열은 식별자를 가질 수 없음\n\n-- 고침: 접두사를 뗀다\nSELECT DEPTNO, ENAME FROM EMP E NATURAL JOIN DEPT D;\n\n-- USING도 같다: E.DEPTNO로 쓰면 ORA-25154\nSELECT DEPTNO, ENAME FROM EMP E JOIN DEPT D USING (DEPTNO);\n\n-- ON은 반대: 공통 컬럼에 접두사가 없으면 ORA-00918\nSELECT E.DEPTNO, ENAME FROM EMP E JOIN DEPT D ON E.DEPTNO = D.DEPTNO;" }
  ],
  ox: ["이렇게 생각하면 틀려요: '접두사가 없으면 애매하다.' NATURAL JOIN은 공통 컬럼을 하나로 합쳐서 접두사 없이 쓰는 게 맞아요.", "정답이에요. 공통 컬럼에 E.를 붙여 ORA-25155가 나요. '별칭을 붙이면 더 명확하겠지'라는 습관이 함정이에요.", "이렇게 생각하면 틀려요: 'USING은 NATURAL과 규칙이 다르다.' 둘 다 접두사를 안 붙이는 게 맞아요. 붙이면 ORA-25154예요.", "이렇게 생각하면 틀려요: 'ON 조인에도 같은 규칙이 있다.' ON은 두 DEPTNO가 따로 있어서 오히려 E.처럼 구분해야 해요."],
  trap: "ON 절 조인에서는 오히려 접두사가 없으면 '열의 정의가 애매함'(ORA-00918) 오류가 나요. NATURAL·USING과 ON의 규칙이 정반대예요.",
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
  sum: "두 표의 모든 짝 12개 중에서 A.X ≥ B.Y가 참인 것만 세요. 1과는 3+3, 2와는 2, 빈 값과는 0이라 8이에요.",
  why: "FROM에 표를 쉼표로 나열하면 DB는 먼저 두 표의 모든 짝을 만들어요. 이것을 카테시안 곱(두 표의 모든 짝 맞추기)이라고 해요. 그다음 WHERE로 참인 짝만 남겨요.\n\n조건이 = 가 아니라 >= 같은 크기 비교여도 원리는 같아요. 이것을 비등가 조인이라고 불러요.\n\n여기서는 A 3행 × B 4행 = 12개 짝이 출발점이에요.\n\nB.Y = 1인 행은 두 개예요. 각각 X = 1, 2, 3과 모두 맞아서 3 + 3이에요. B.Y = 2는 X = 2, 3만 맞아서 2예요. **B.Y가 빈 행은 'X >= NULL'이 '모름'이라 하나도 남지 않아요.**\n\n합치면 3 + 3 + 2 + 0 = 8이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT COUNT(*)        -- ③ 남은 짝 수 → 8\n  FROM A, B            -- ① 3 × 4 = 12개 짝 (모든 짝 맞추기)\n WHERE A.X >= B.Y;     -- ② Y=1 → 3+3, Y=2 → 2, Y=빈 값 → 모름이라 0" },
    { t: "1단계: 카테시안 곱 12행을 B.Y 기준으로 정리", tb: { c: ["B.Y", "A.X >= B.Y 인 X", "건수"], r: [[1, "1, 2, 3", 3], [1, "1, 2, 3", 3], [2, "2, 3", 2], [null, "없음 (모름)", 0]] } },
    { t: "2단계: 합계", n: "3 + 3 + 2 + 0 = 8이에요." }
  ],
  res: { c: ["COUNT(*)"], r: [[8]] },
  pg: "SELECT COUNT(*) FROM A, B WHERE A.X >= B.Y",
  ox: ["이렇게 생각하면 틀려요: 'Y = 2인 짝은 없다.' X = 2, 3의 2건을 빠뜨리면 3 + 3 = 6이 돼요.", "정답이에요. 12개 짝 중 참인 것은 3 + 3 + 2 = 8개예요.", "이렇게 생각하면 틀려요: '빈 행만 빼면 나머지는 다 남는다(3 × 3).' X = 1은 Y = 2보다 작아서 1건이 더 빠져요.", "이렇게 생각하면 틀려요: 'WHERE 전의 짝 수가 답이다.' 12는 조건을 걸기 전 모든 짝(3 × 4)이에요."],
  trap: "B에 같은 값(1)이 두 번 있다는 것과 빈 값(NULL) 행을 동시에 챙겨야 해요.",
  memo: "조인 = 모든 짝(카테시안 곱) → 조건 필터"
},
{
  id: "S14", s: 2, tp: "grp", lv: 2,
  th: "2과목 | ROLLUP 결과 행 수",
  q: "다음 SQL을 실행했을 때 결과 행 수는?",
  tb: [{ n: "SALES", c: ["REGION", "PROD", "AMT"], r: [["SEOUL", "A", 100], ["SEOUL", "B", 200], ["SEOUL", "A", 50], ["BUSAN", "A", 300], ["BUSAN", "C", 100]] }],
  sql: "SELECT REGION, PROD, SUM(AMT)\n  FROM SALES\n GROUP BY ROLLUP(REGION, PROD);",
  o: ["5", "6", "7", "10"],
  a: 2,
  sum: "ROLLUP(REGION, PROD)은 지역·제품별 4행, 지역 소계 2행, 전체 총계 1행을 만들어요. 그래서 7행이에요.",
  why: "ROLLUP(A, B)는 오른쪽 컬럼부터 하나씩 떼어 내며 묶어요. (A, B) 상세 → (A) 소계 → () 총계 순서예요.\n\n'지역 > 제품'처럼 위아래가 있는 보고서의 소계를 한 번에 뽑으려고 만든 기능이에요. 그래서 왼쪽이 윗단계예요.\n\n**결과 행 수는 원래 행 수가 아니라, 단계마다 실제로 생기는 서로 다른 묶음 수를 더한 값이에요.**\n\n이 표에 대입해 볼게요. (REGION, PROD)는 SEOUL-A 두 행이 하나로 합쳐져 4묶음이에요. 지역 소계는 BUSAN, SEOUL 2행이에요. 총계는 1행이에요.\n\n그래서 4 + 2 + 1 = 7행이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT REGION, PROD, SUM(AMT)    -- ③ 단계마다 합계, 빠진 컬럼은 빈 값으로 표시\n  FROM SALES                     -- ① 5행\n GROUP BY ROLLUP(REGION, PROD);  -- ② (지역,제품) 4 + (지역) 2 + () 1 = 7묶음" },
    { t: "1단계: (REGION, PROD) 그룹", tb: { c: ["REGION", "PROD", "SUM"], r: [["BUSAN", "A", 300], ["BUSAN", "C", 100], ["SEOUL", "A", 150], ["SEOUL", "B", 200]] }, n: "SEOUL-A 두 행은 하나로 합쳐져요 → 4행" },
    { t: "2단계: (REGION) 소계", tb: { c: ["REGION", "PROD", "SUM"], r: [["BUSAN", null, 400], ["SEOUL", null, 350]] }, n: "2행" },
    { t: "3단계: () 총계", tb: { c: ["REGION", "PROD", "SUM"], r: [[null, null, 750]] }, n: "1행 → 합계 4 + 2 + 1 = 7행" }
  ],
  res: { c: ["COUNT"], r: [[7]] },
  pg: "SELECT COUNT(*) FROM (SELECT REGION, PROD, SUM(AMT) FROM SALES GROUP BY ROLLUP(REGION, PROD)) X",
  ox: ["이렇게 생각하면 틀려요: '원래 행 수만큼 나온다.' 5는 원래 행 수고, 묶음은 서로 다른 조합 단위로 만들어져요.", "이렇게 생각하면 틀려요: '소계까지만 나온다.' 맨 끝의 전체 총계 1행을 빠뜨리면 6이 돼요.", "정답이에요. 4 + 2 + 1 = 7이에요.", "이렇게 생각하면 틀려요: 'ROLLUP도 제품별 소계를 만든다.' 그건 CUBE예요. 제품별 3행이 더해져 10이 돼요."],
  trap: "원래 5행이 아니라 '서로 다른 (REGION, PROD) 조합' 4개에서 출발해야 해요.",
  memo: "ROLLUP(A,B) = (A,B) + (A) + ()"
},
{
  id: "S15", s: 2, tp: "grp", lv: 2,
  th: "2과목 | CUBE 결과 행 수",
  q: "아래 [SALES] 테이블에 대해 다음 SQL의 결과 행 수는?",
  tb: [{ n: "SALES", c: ["REGION", "PROD", "AMT"], r: [["SEOUL", "A", 100], ["SEOUL", "B", 200], ["SEOUL", "A", 50], ["BUSAN", "A", 300], ["BUSAN", "C", 100]] }],
  sql: "SELECT REGION, PROD, SUM(AMT)\n  FROM SALES\n GROUP BY CUBE(REGION, PROD);",
  o: ["7", "9", "10", "12"],
  a: 2,
  sum: "CUBE는 가능한 모든 묶음을 만들어요. 지역·제품 4 + 지역 2 + 제품 3 + 총계 1 = 10행이에요.",
  why: "CUBE(A, B)는 나열한 컬럼으로 만들 수 있는 모든 조합을 묶어요. (A, B), (A), (B), () 네 가지예요.\n\n위아래 순서 없이 '지역별로도, 제품별로도' 보고 싶을 때 쓰려고 만든 기능이에요. 컬럼이 N개면 조합은 2^N개예요.\n\n**ROLLUP(REGION, PROD)와 비교하면 (PROD), 즉 제품별 소계가 더 생겨요.**\n\n행 수는 조합마다 실제 묶음 수를 더해요. (REGION, PROD) 4, (REGION) 2, (PROD) A·B·C 3, () 1이에요.\n\n그래서 4 + 2 + 3 + 1 = 10행이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT REGION, PROD, SUM(AMT)   -- ③ 빠진 컬럼은 빈 값으로 표시\n  FROM SALES                    -- ① 5행\n GROUP BY CUBE(REGION, PROD);   -- ② 4가지 조합: (지역,제품) 4 + (지역) 2 + (제품) 3 + () 1 = 10" },
    { t: "조합별 행 수", tb: { c: ["그룹 조합", "그룹", "행 수"], r: [["(REGION, PROD)", "BUSAN-A, BUSAN-C, SEOUL-A, SEOUL-B", 4], ["(REGION)", "BUSAN, SEOUL", 2], ["(PROD)", "A(450), B(200), C(100)", 3], ["()", "총계 750", 1]], hl: [2] }, n: "4 + 2 + 3 + 1 = 10이에요." }
  ],
  res: { c: ["COUNT"], r: [[10]] },
  pg: "SELECT COUNT(*) FROM (SELECT REGION, PROD, SUM(AMT) FROM SALES GROUP BY CUBE(REGION, PROD)) X",
  ox: ["이렇게 생각하면 틀려요: 'CUBE와 ROLLUP은 같다.' 7은 ROLLUP 결과예요. CUBE는 제품별 3행이 더 생겨요.", "이렇게 생각하면 틀려요: '총계는 따로 안 나온다.' 총계 1행을 빠뜨리면 4 + 2 + 3 = 9예요.", "정답이에요.", "이렇게 생각하면 틀려요: '조합 수에 무언가를 곱한다.' 조합마다 실제 묶음 수를 더하면 10이에요."],
  trap: "CUBE의 조합 수(2^N = 4)와 결과 행 수(10)는 달라요. 조합마다 실제 묶음 수를 세어 더해야 해요.",
  memo: "CUBE(A,B) = (A,B) + (A) + (B) + ()"
},
{
  id: "S16", s: 2, tp: "grp", lv: 3,
  th: "2과목 | ROLLUP 복합 괄호 · GROUPING SETS · GROUPING 함수",
  q: "아래 [SALES] 테이블에 대해 다음 GROUP BY 절 중 결과 행 수가 나머지 셋과 다른 것은?",
  tb: [{ n: "SALES", c: ["REGION", "PROD", "AMT"], r: [["SEOUL", "A", 100], ["SEOUL", "B", 200], ["SEOUL", "A", 50], ["BUSAN", "A", 300], ["BUSAN", "C", 100]] }],
  sql: "① GROUP BY ROLLUP(REGION, PROD)\n② GROUP BY GROUPING SETS((REGION, PROD), REGION, ())\n③ GROUP BY ROLLUP((REGION, PROD))\n④ GROUP BY CUBE(REGION, PROD)\n   HAVING GROUPING(REGION) = 0 OR GROUPING(PROD) = 1",
  o: ["①", "②", "③", "④"],
  a: 2,
  sum: "ROLLUP((REGION, PROD))처럼 괄호로 묶으면 두 컬럼이 한 덩어리가 돼서 지역 소계가 안 생겨요. 그래서 ③만 5행이고 나머지는 7행이에요.",
  why: "ROLLUP 안에서 괄호로 묶은 컬럼들은 한 덩어리로 취급돼요. 함께 붙고, 함께 빠져요.\n\n**그래서 ROLLUP((REGION, PROD))는 덩어리가 하나뿐이라 (REGION, PROD)와 ()만 만들어요. 지역 소계가 없어서 4 + 1 = 5행이에요.**\n\n②의 GROUPING SETS는 원하는 묶음을 직접 나열하는 방법이에요. ((REGION, PROD), REGION, ())는 ROLLUP(REGION, PROD)를 풀어 쓴 것과 같아서 7행이에요.\n\n④의 GROUPING(컬럼)은 그 줄에서 해당 컬럼이 '합쳐져서 빈 값으로 표시된' 경우 1, 실제 값이면 0이에요. CUBE의 네 조합 중 제품별 소계 (PROD)만 GROUPING(REGION) = 1이고 GROUPING(PROD) = 0이라 HAVING에서 빠져요. 10 − 3 = 7행이에요.\n\n그래서 행 수가 다른 것은 ③이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- 보기별 GROUP BY 절과 만들어지는 묶음\n① GROUP BY ROLLUP(REGION, PROD)                      -- (지역,제품) 4 + (지역) 2 + () 1 = 7\n② GROUP BY GROUPING SETS((REGION, PROD), REGION, ())  -- ①을 풀어 쓴 것 = 7\n③ GROUP BY ROLLUP((REGION, PROD))                    -- 한 덩어리: (지역,제품) 4 + () 1 = 5\n④ GROUP BY CUBE(REGION, PROD)                        -- 먼저 10행을 만들고\n     HAVING GROUPING(REGION) = 0 OR GROUPING(PROD) = 1 -- 제품별 소계 3행 제외 → 7" },
    { t: "보기별 집계 조합", tb: { c: ["보기", "만들어지는 조합", "행 수"], r: [["①", "(R,P) 4 + (R) 2 + () 1", 7], ["②", "(R,P) 4 + (R) 2 + () 1", 7], ["③", "(R,P) 4 + () 1", 5], ["④", "CUBE 10행 − (P) 3행", 7]], hl: [2] } },
    { t: "④의 GROUPING 값", tb: { c: ["조합", "GROUPING(REGION)", "GROUPING(PROD)", "HAVING 통과"], r: [["(R,P)", 0, 0, "O"], ["(R)", 0, 1, "O"], ["(P)", 1, 0, "X"], ["()", 1, 1, "O"]], hl: [2] } }
  ],
  res: { c: ["①", "②", "③", "④"], r: [[7, 7, 5, 7]] },
  pg: "SELECT (SELECT COUNT(*) FROM (SELECT 1 FROM SALES GROUP BY ROLLUP(REGION, PROD)) a),(SELECT COUNT(*) FROM (SELECT 1 FROM SALES GROUP BY GROUPING SETS((REGION, PROD), REGION, ())) b),(SELECT COUNT(*) FROM (SELECT 1 FROM SALES GROUP BY ROLLUP((REGION, PROD))) c),(SELECT COUNT(*) FROM (SELECT 1 FROM SALES GROUP BY CUBE(REGION, PROD) HAVING GROUPING(REGION) = 0 OR GROUPING(PROD) = 1) d)",
  ox: ["이렇게 생각하면 틀려요: 'ROLLUP은 상세만 나온다.' (지역,제품) 4 + (지역) 2 + () 1 = 7행이에요.", "이렇게 생각하면 틀려요: '괄호 없는 REGION은 무시된다.' REGION 하나도 독립된 묶음이라 ①과 같은 7행이에요.", "정답이에요. 안쪽 괄호가 두 컬럼을 한 덩어리로 묶어서 지역 소계 없이 5행이에요.", "이렇게 생각하면 틀려요: 'GROUPING은 실제 값이면 1이다.' 반대예요. 합쳐진(빈 값 표시) 컬럼이 1이라, 제품별 소계 3행만 빠지고 7행이에요."],
  trap: "ROLLUP((A, B))와 ROLLUP(A, B)는 괄호 하나 차이로 결과가 달라져요. 안쪽 괄호는 '한 덩어리'라는 뜻이에요.",
  memo: "ROLLUP((A,B),C) = (A,B,C) + (A,B) + ()"
},
{
  id: "S17", s: 2, tp: "win", lv: 1,
  th: "2과목 | 순위 함수 RANK · DENSE_RANK · ROW_NUMBER",
  q: "다음 SQL에서 이름이 '라'인 행의 R1, R2, R3 값은?",
  tb: [{ n: "SCORE", c: ["NAME", "PT"], r: [["가", 90], ["나", 85], ["다", 90], ["라", 80], ["마", 85]] }],
  sql: "SELECT NAME, PT,\n       RANK()       OVER (ORDER BY PT DESC) AS R1,\n       DENSE_RANK() OVER (ORDER BY PT DESC) AS R2,\n       ROW_NUMBER() OVER (ORDER BY PT DESC) AS R3\n  FROM SCORE;",
  o: ["3, 3, 5", "4, 3, 5", "5, 3, 4", "5, 3, 5"],
  a: 3,
  sum: "'라'는 혼자 꼴찌예요. 앞에 4명이 있어 RANK는 5, 서로 다른 점수(90, 85) 다음이라 DENSE_RANK는 3, 다섯 번째 줄이라 ROW_NUMBER는 5예요.",
  why: "세 함수 모두 PT 높은 순으로 번호를 매겨요. **차이는 '동점(같은 PT)을 어떻게 처리하느냐' 하나뿐이에요.**\n\nRANK는 동점자에게 같은 순위를 주고, 동점자 수만큼 다음 번호를 비워요. 올림픽처럼 공동 1위가 2명이면 다음은 3위예요.\n\nDENSE_RANK는 같은 순위를 주되 번호를 비우지 않아요. 공동 1위 다음은 2위예요.\n\nROW_NUMBER는 동점이어도 1, 2, 3…처럼 무조건 다른 번호를 줘요.\n\n이 표는 90이 2명, 85가 2명이고 '라'(80)는 혼자 꼴찌예요. 그래서 '라'는 RANK 5(앞에 4명), DENSE_RANK 3(90, 85 다음), ROW_NUMBER 5(다섯 번째 줄)예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT NAME, PT,\n       RANK()       OVER (ORDER BY PT DESC) AS R1,  -- ② 1,1,3,3,5 (동점 수만큼 건너뜀)\n       DENSE_RANK() OVER (ORDER BY PT DESC) AS R2,  -- ② 1,1,2,2,3 (건너뛰지 않음)\n       ROW_NUMBER() OVER (ORDER BY PT DESC) AS R3   -- ② 1,2,3,4,5 (동점도 다른 번호)\n  FROM SCORE;                                       -- ① 5행: PT 90·90·85·85·80\n-- '라'(80) → R1 5, R2 3, R3 5" },
    { t: "정렬 후 순위 산출 (PT 내림차순)", tb: { c: ["NAME", "PT", "RANK", "DENSE_RANK", "ROW_NUMBER"], r: [["가/다", 90, 1, 1, "1, 2"], ["가/다", 90, 1, 1, "1, 2"], ["나/마", 85, 3, 2, "3, 4"], ["나/마", 85, 3, 2, "3, 4"], ["라", 80, 5, 3, 5]], hl: [4] }, n: "동점자끼리의 ROW_NUMBER 순서는 정렬 기준이 더 없으면 정해져 있지 않아요. '라'는 혼자 꼴찌라 항상 5예요." }
  ],
  res: { c: ["NAME", "R1", "R2", "R3"], r: [["라", 5, 3, 5]] },
  pg: "SELECT NAME, R1, R2, R3 FROM (SELECT NAME, RANK() OVER (ORDER BY PT DESC) R1, DENSE_RANK() OVER (ORDER BY PT DESC) R2, ROW_NUMBER() OVER (ORDER BY PT DESC) R3 FROM SCORE) X WHERE NAME = '라'",
  ox: ["이렇게 생각하면 틀려요: 'RANK도 번호를 건너뛰지 않는다.' 그건 DENSE_RANK예요. RANK는 공동 순위 뒤를 비워요.", "이렇게 생각하면 틀려요: '앞 사람 수가 곧 순위다.' 앞에 4명이 있으면 RANK는 4 + 1 = 5예요.", "이렇게 생각하면 틀려요: ''라' 앞에 4명이 있으니 ROW_NUMBER는 4다.' 앞 사람 수에 자기 자신 1을 더해야 해요. ROW_NUMBER는 1~5를 하나씩 써서 '라'는 5예요.", "정답이에요."],
  trap: "세 함수의 차이는 '동점 처리'뿐이에요. 동점이 없다면 세 결과는 같아요.",
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
  sum: "ORDER BY만 쓰면 '같은 값은 한꺼번에' 더하는 방식(RANGE)이 기본이에요. 그래서 SAL 200인 두 행이 똑같이 500을 받아요.",
  why: "OVER 안에 ORDER BY만 쓰고 범위를 안 쓰면, 기본값 'RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW'가 적용돼요.\n\nRANGE는 '몇 번째 행까지'가 아니라 '정렬 값이 현재 값 이하인 행까지'라는 값 기준 범위예요.\n\n왜 그럴까요? 값이 같은 행끼리는 누가 먼저인지 정할 근거가 없어요. 그래서 같은 값을 가진 행들을 한꺼번에 범위에 넣어 같은 결과를 주도록 만들었어요.\n\n**그래서 SAL이 200인 ID 2와 ID 3은 서로를 포함한 100 + 200 + 200 = 500을 똑같이 받아요.** ID 1은 100, ID 4는 전체 합 800이에요.\n\n그래서 답은 100, 500, 500, 800이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT ID, SAL,\n       SUM(SAL) OVER (ORDER BY SAL) AS CSUM  -- ② 범위 생략 = 'SAL이 현재 값 이하인 행 전부'\n  FROM T;                                   -- ① 4행: SAL 100·200·200·300\n-- 100 / 100+200+200 / 100+200+200 / 전체 → 100, 500, 500, 800" },
    { t: "1단계: SAL 오름차순 정렬", tb: { c: ["ID", "SAL"], r: [[1, 100], [2, 200], [3, 200], [4, 300]] } },
    { t: "2단계: RANGE 누적 범위", tb: { c: ["ID", "SAL", "범위(SAL ≤ 현재 값)", "CSUM"], r: [[1, 100, "100", 100], [2, 200, "100, 200, 200", 500], [3, 200, "100, 200, 200", 500], [4, 300, "전체", 800]], hl: [1, 2] } },
    { t: "의도대로 쓰려면", n: "-- 한 행씩 쌓으려면 ROWS + 동점을 가를 정렬 키(ID)\nSELECT ID, SAL,\n       SUM(SAL) OVER (ORDER BY SAL, ID\n                      ROWS UNBOUNDED PRECEDING) AS CSUM\n  FROM T;   -- ID 1→100, 2→300, 3→500, 4→800" }
  ],
  res: { c: ["ID", "CSUM"], r: [[1, 100], [2, 500], [3, 500], [4, 800]] },
  pg: "SELECT ID, SUM(SAL) OVER (ORDER BY SAL) CSUM FROM T ORDER BY ID",
  ox: ["이렇게 생각하면 틀려요: '누적 합은 한 행씩 쌓인다.' 그건 ROWS를 썼을 때예요. 기본은 RANGE라 같은 값 200은 한꺼번에 더해져요.", "정답이에요.", "이렇게 생각하면 틀려요: 'OVER가 있으면 전체 합이다.' 800은 ORDER BY 없이 OVER()만 썼을 때예요. ORDER BY가 있으면 누적 합이 돼요.", "이렇게 생각하면 틀려요: '같은 값 행은 첫 번째 200까지의 합(300)을 함께 쓴다.' RANGE는 같은 값들을 모두 넣은 합(500)을 함께 써요."],
  trap: "누적 합계 문제에서는 정렬 컬럼에 같은 값이 있는지 꼭 확인하세요. 같은 값이 있으면 ROWS와 RANGE의 결과가 달라져요.",
  memo: "ORDER BY만 쓰면 RANGE — 같은 값은 한꺼번에"
},
{
  id: "S19", s: 2, tp: "win", lv: 2,
  th: "2과목 | ROWS 프레임 — 이동 합계",
  q: "다음 SQL의 결과에서 MSUM 값을 위에서부터 차례로 나열한 것은?",
  tb: [{ n: "T", c: ["ID", "SAL"], r: [[1, 100], [2, 200], [3, 200], [4, 300]] }],
  sql: "SELECT ID, SAL,\n       SUM(SAL) OVER (ORDER BY SAL, ID\n                      ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) AS MSUM\n  FROM T\n ORDER BY SAL, ID;",
  o: ["300, 500, 500, 500", "300, 600, 700, 500", "100, 300, 500, 800", "300, 500, 700, 500"],
  a: 3,
  sum: "ROWS는 실제 줄 기준으로 '바로 앞 1줄 + 나 + 바로 뒤 1줄'을 더해요. 100,200,200,300 순서에서 300, 500, 700, 500이에요.",
  why: "ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING은 정렬된 결과에서 '바로 앞 1줄, 현재 줄, 바로 뒤 1줄'을 더해요. 줄 개수로 범위를 잡는 방식이에요.\n\nRANGE와 달리 값이 같은지는 따지지 않아요. **SAL이 같은 두 200 행도 서로 다른 위치의 줄로 취급해요.**\n\n범위는 처음과 끝을 넘을 수 없어요. 그래서 첫 줄은 앞 줄 없이 2개, 마지막 줄은 뒤 줄 없이 2개만 더해요.\n\n순서 100, 200, 200, 300에 대입해 볼게요. 첫 줄은 100 + 200 = 300이에요. 둘째 줄은 100 + 200 + 200 = 500이에요. 셋째 줄은 200 + 200 + 300 = 700이에요. 넷째 줄은 200 + 300 = 500이에요.\n\n그래서 300, 500, 700, 500이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT ID, SAL,\n       SUM(SAL) OVER (ORDER BY SAL, ID                               -- ② SAL 순(같으면 ID 순): ID 1, 2, 3, 4\n                      ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) AS MSUM -- ③ 앞 1줄 + 나 + 뒤 1줄\n  FROM T                                                            -- ① 4행\n ORDER BY SAL, ID;                                                  -- ④ 같은 순서로 출력\n-- 300, 500, 700, 500" },
    { t: "행별 프레임", tb: { c: ["순서", "SAL", "프레임에 포함된 값", "MSUM"], r: [[1, 100, "100, 200", 300], [2, 200, "100, 200, 200", 500], [3, 200, "200, 200, 300", 700], [4, 300, "200, 300", 500]] }, n: "SAL이 같은 두 줄(ID 2, 3)은 ID로 순서를 정해 줘서 ID 2가 500, ID 3이 700을 받아요. ID를 빼고 ORDER BY SAL만 쓰면 두 줄 중 어느 쪽이 먼저인지 정해지지 않아서, 500과 700이 어느 ID에 붙을지 알 수 없어요." }
  ],
  res: { c: ["ID", "SAL", "MSUM"], r: [[1, 100, 300], [2, 200, 500], [3, 200, 700], [4, 300, 500]] },
  pg: "SELECT ID, SAL, SUM(SAL) OVER (ORDER BY SAL, ID ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) MSUM FROM T ORDER BY SAL, ID",
  ox: ["이렇게 생각하면 틀려요: '같은 값 두 줄은 결과도 같다.' 그건 RANGE의 성질이에요. ROWS에서는 위치가 달라서 500과 700으로 갈려요.", "이렇게 생각하면 틀려요: '값 기준으로 앞뒤(100, 200, 300)를 더한다.' 그러면 둘째 줄이 600이 돼요. ROWS는 바로 뒤 줄인 또 다른 200을 더해서 500이에요.", "이렇게 생각하면 틀려요: '처음부터 누적해서 더한다.' 100, 300, 500, 800은 기본 누적 합이에요. 이 문제는 앞뒤 1줄만 더해요.", "정답이에요."],
  trap: "ROWS에서는 같은 값이라도 다른 줄로 취급해서, 두 개의 200 줄이 서로 다른 값을 받아요.",
  memo: "ROWS = 실제 줄 개수, RANGE = 값의 범위"
},
{
  id: "S20", s: 2, tp: "win", lv: 3,
  th: "2과목 | RANGE 프레임 — 값 기준 범위",
  q: "다음 SQL의 결과를 ID 순서대로 나열했을 때 RSUM 값은?",
  tb: [{ n: "T", c: ["ID", "SAL"], r: [[1, 100], [2, 200], [3, 200], [4, 300]] }],
  sql: "SELECT ID, SAL,\n       SUM(SAL) OVER (ORDER BY SAL\n                      RANGE BETWEEN 100 PRECEDING AND CURRENT ROW) AS RSUM\n  FROM T;",
  o: ["100, 500, 500, 800", "100, 300, 400, 500", "100, 300, 500, 700", "100, 500, 500, 700"],
  a: 3,
  sum: "RANGE 100 PRECEDING은 '100줄 앞'이 아니라 '값이 100 작은 데까지'예요. ID 4(300)는 200~300 구간이라 100이 빠져 700이에요.",
  why: "RANGE의 'n PRECEDING'은 n줄 앞이 아니에요. '정렬 값이 현재 값 − n 이상'이라는 값 구간이에요.\n\n그래서 RANGE BETWEEN 100 PRECEDING AND CURRENT ROW는 SAL이 [현재 SAL − 100, 현재 SAL] 안에 드는 모든 행을 더해요. RANGE에서 CURRENT ROW는 '현재 값과 같은 행 전부'를 뜻해요.\n\n이렇게 값으로 잡는 이유는 '최근 7일', '±100원'처럼 줄 수와 상관없는 범위를 계산하기 위해서예요.\n\n대입해 볼게요. ID 1은 [0, 100]이라 100만 들어가요. ID 2·3은 [100, 200]이라 100·200·200이 들어가 500이에요. **ID 4는 [200, 300]이라 100이 빠지고 200 + 200 + 300 = 700이에요.**\n\n그래서 100, 500, 500, 700이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT ID, SAL,\n       SUM(SAL) OVER (ORDER BY SAL                                    -- ② 값 기준 정렬\n                      RANGE BETWEEN 100 PRECEDING AND CURRENT ROW) AS RSUM -- ③ SAL−100 ≤ 값 ≤ SAL\n  FROM T;                                                            -- ① 4행\n-- ID 1: [0,100]→100 / ID 2·3: [100,200]→500 / ID 4: [200,300]→700" },
    { t: "행별 값 구간", tb: { c: ["ID", "SAL", "구간", "포함 값", "RSUM"], r: [[1, 100, "0 ~ 100", "100", 100], [2, 200, "100 ~ 200", "100, 200, 200", 500], [3, 200, "100 ~ 200", "100, 200, 200", 500], [4, 300, "200 ~ 300", "200, 200, 300", 700]] } }
  ],
  res: { c: ["ID", "RSUM"], r: [[1, 100], [2, 500], [3, 500], [4, 700]] },
  pg: "SELECT ID, SUM(SAL) OVER (ORDER BY SAL RANGE BETWEEN 100 PRECEDING AND CURRENT ROW) RSUM FROM T ORDER BY ID",
  ox: ["이렇게 생각하면 틀려요: '아래쪽 끝(−100)은 신경 안 써도 된다.' 그러면 그냥 누적 합(800)이에요. ID 4의 구간에는 100이 들어가지 않아요.", "이렇게 생각하면 틀려요: '100 PRECEDING은 1줄 앞이다.' 100, 300, 400, 500은 줄 기준(ROWS 1 PRECEDING)으로 계산한 값이에요. RANGE의 100은 값의 폭이에요.", "이렇게 생각하면 틀려요: '같은 값도 한 줄씩 따로 쌓인다.' 그러면 ID 2가 300이 돼요. RANGE의 CURRENT ROW는 같은 값 200을 모두 넣어서 ID 2도 500이에요.", "정답이에요."],
  trap: "ID 4(300)는 100을 포함하지 않아요. 구간이 200~300이기 때문이에요.",
  memo: "RANGE n PRECEDING = 값이 n만큼 작은 데까지"
},
{
  id: "S21", s: 2, tp: "win", lv: 2,
  th: "2과목 | LAST_VALUE와 기본 프레임의 함정",
  q: "다음 SQL에서 ID가 1인 행의 LV1, LV2 값은?",
  tb: [{ n: "T", c: ["ID", "SAL"], r: [[1, 100], [2, 200], [3, 300]] }],
  sql: "SELECT ID,\n       LAST_VALUE(SAL) OVER (ORDER BY ID) AS LV1,\n       LAST_VALUE(SAL) OVER (ORDER BY ID\n            ROWS BETWEEN UNBOUNDED PRECEDING\n                     AND UNBOUNDED FOLLOWING) AS LV2\n  FROM T;",
  o: ["300, 100", "300, 300", "100, 100", "100, 300"],
  a: 3,
  sum: "ORDER BY만 쓰면 범위가 '처음부터 지금 줄까지'라서, LAST_VALUE는 자기 값(100)을 돌려줘요. 범위를 끝까지 연 LV2만 진짜 마지막 값 300이에요.",
  why: "OVER에 ORDER BY만 쓰면 기본 범위는 '처음부터 현재 줄까지'예요.\n\nLAST_VALUE는 '범위 안의' 마지막 값을 돌려주는 함수예요. 전체의 마지막 값이 아니에요.\n\n**범위가 현재 줄에서 끝나니까, LV1은 항상 자기 자신의 값이 돼요.** ID 1이면 100이에요. ID는 서로 달라서 같이 묶이는 줄도 없어요.\n\nLV2는 범위를 UNBOUNDED FOLLOWING(끝까지)으로 열었어요. 범위가 전체라서 모든 줄에서 마지막 값 300이에요.\n\n그래서 ID 1 행은 100, 300이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT ID,\n       LAST_VALUE(SAL) OVER (ORDER BY ID) AS LV1,       -- ② 기본 범위: 처음 ~ 지금 줄 → 자기 값\n       LAST_VALUE(SAL) OVER (ORDER BY ID\n            ROWS BETWEEN UNBOUNDED PRECEDING\n                     AND UNBOUNDED FOLLOWING) AS LV2    -- ② 범위 = 전체 → 항상 300\n  FROM T;                                              -- ① 3행\n-- ID 1: LV1 = 100, LV2 = 300" },
    { t: "행별 프레임과 결과", tb: { c: ["ID", "LV1 프레임", "LV1", "LV2 프레임", "LV2"], r: [[1, "100", 100, "100, 200, 300", 300], [2, "100, 200", 200, "100, 200, 300", 300], [3, "100, 200, 300", 300, "100, 200, 300", 300]], hl: [0] } },
    { t: "의도대로 쓰려면 (다른 방법)", n: "-- 마지막 값 = 거꾸로 정렬했을 때의 첫 값\nSELECT ID,\n       FIRST_VALUE(SAL) OVER (ORDER BY ID DESC) AS LAST_SAL\n  FROM T;   -- 모든 줄이 300 (FIRST_VALUE는 기본 범위에서도 맨 앞 값이 그대로)" }
  ],
  res: { c: ["ID", "LV1", "LV2"], r: [[1, 100, 300]] },
  pg: "SELECT * FROM (SELECT ID, LAST_VALUE(SAL) OVER (ORDER BY ID) LV1, LAST_VALUE(SAL) OVER (ORDER BY ID ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) LV2 FROM T) X WHERE ID = 1",
  ox: ["이렇게 생각하면 틀려요: 두 범위를 서로 바꿔 본 경우예요. 범위를 연 쪽이 LV2예요.", "이렇게 생각하면 틀려요: 'LAST_VALUE는 언제나 전체의 마지막 값이다.' 기본 범위는 지금 줄에서 끝나서 LV1은 자기 값이에요.", "이렇게 생각하면 틀려요: 'LV2도 기본 범위다.' 범위를 끝까지 열었으니 300이에요.", "정답이에요."],
  trap: "FIRST_VALUE는 기본 범위에서도 맨 처음 값을 제대로 돌려주지만, LAST_VALUE는 그렇지 않아요. 두 함수의 이 차이가 출제 포인트예요.",
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
  sum: "빈 값(NULL)이 끼인 계산은 답도 빈 값이에요. 첫 달은 앞 달이 없고, 3월은 자기가 비고, 4월은 앞 달(3월)이 비어서 NULL이에요.",
  why: "LAG(AMT)는 MON 순서에서 바로 앞 줄의 AMT를 가져와요. 앞 줄이 없으면 세 번째 인자(기본값)를 주는데, 생략하면 NULL이에요.\n\n**NULL이 하나라도 끼인 덧셈·뺄셈 결과는 항상 NULL이에요.** 모르는 값에서 무엇을 빼도 답을 알 수 없기 때문이에요.\n\n행별로 볼게요. MON 1은 앞 줄이 없어서 100 − NULL = NULL이에요. MON 2는 150 − 100 = 50이에요. MON 3은 자기 AMT가 비어서 NULL − 150 = NULL이에요. MON 4는 앞 줄(MON 3)의 AMT가 비어서 200 − NULL = NULL이에요.\n\n그래서 NULL, 50, NULL, NULL이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT MON,\n       AMT - LAG(AMT) OVER (ORDER BY MON) AS DIFF  -- ② 앞 줄 AMT: NULL, 100, 150, NULL\n  FROM SALES;                                   -- ① 4행 (MON 3의 AMT가 빔)\n-- ③ 뺄셈: 100−NULL, 150−100, NULL−150, 200−NULL → NULL, 50, NULL, NULL" },
    { t: "행별 계산", tb: { c: ["MON", "AMT", "LAG(AMT)", "AMT − LAG", "DIFF"], r: [[1, 100, null, "100 − NULL", null], [2, 150, 100, "150 − 100", 50], [3, null, 150, "NULL − 150", null], [4, 200, null, "200 − NULL", null]] } },
    { t: "의도대로 쓰려면", n: "-- 빈 값을 0으로 보고 전월 대비 차이를 구하려면\nSELECT MON,\n       NVL(AMT, 0) - LAG(NVL(AMT, 0), 1, 0) OVER (ORDER BY MON) AS DIFF\n  FROM SALES;   -- 100, 50, -150, 200" }
  ],
  res: { c: ["MON", "DIFF"], r: [[1, null], [2, 50], [3, null], [4, null]] },
  pg: "SELECT MON, AMT - LAG(AMT) OVER (ORDER BY MON) DIFF FROM SALES ORDER BY MON",
  ox: ["정답이에요.", "이렇게 생각하면 틀려요: 'NULL은 알아서 0으로 계산된다.' 0으로 보려면 NVL과 LAG의 기본값(세 번째 인자)을 직접 써야 하고, 그래도 첫 달은 100 − 0 = 100이에요.", "이렇게 생각하면 틀려요: 'MON 3의 빈 AMT는 0으로 계산된다.' 그러면 −150, 200이 나오지만, 빈 값은 저절로 0이 되지 않아요. 빈 값이 끼인 계산은 NULL이에요.", "이렇게 생각하면 틀려요: '첫 줄은 자기 값이 들어간다.' 앞 줄이 없으면 LAG는 NULL이고, 100 − NULL은 NULL이에요."],
  trap: "MON 4는 자기 AMT(200)가 있어도 앞 줄 값이 비어 있어서 결과가 NULL이에요.",
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
  sum: "7줄을 3묶음으로 나누면 2줄씩 주고 1줄이 남아요. 남은 줄은 앞 묶음부터 하나씩 받아서 3, 2, 2예요.",
  why: "NTILE(n)은 정렬된 줄들을 n개의 묶음에 최대한 고르게 나누고, 1부터 n까지 번호를 붙여요.\n\n딱 나누어떨어지지 않으면 묶음 크기 차이가 1을 넘지 않게 나눠요. **이때 남는 줄은 앞 번호 묶음부터 하나씩 더 받아요.**\n\n7 ÷ 3은 몫 2, 나머지 1이에요. 모든 묶음이 2줄씩 받고, 1번 묶음만 1줄을 더 받아요.\n\nSAL 순으로 A·B·C가 1번, D·E가 2번, F·G가 3번이에요.\n\n그래서 3, 2, 2예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT ENAME, SAL,\n       NTILE(3) OVER (ORDER BY SAL) AS GRP  -- ② 7줄 ÷ 3 = 몫 2, 나머지 1 → 1번 묶음이 1줄 더\n  FROM EMP;                             -- ① 7행\n-- A,B,C → 1 / D,E → 2 / F,G → 3  (3, 2, 2)" },
    { t: "그룹 배정", tb: { c: ["ENAME", "SAL", "GRP"], r: [["A", 100, 1], ["B", 200, 1], ["C", 300, 1], ["D", 400, 2], ["E", 500, 2], ["F", 600, 3], ["G", 700, 3]] } }
  ],
  res: { c: ["GRP", "CNT"], r: [[1, 3], [2, 2], [3, 2]] },
  pg: "SELECT GRP, COUNT(*) CNT FROM (SELECT NTILE(3) OVER (ORDER BY SAL) GRP FROM EMP) X GROUP BY GRP ORDER BY GRP",
  ox: ["정답이에요.", "이렇게 생각하면 틀려요: '남은 줄은 맨 뒤 묶음이 받는다.' 남는 줄은 앞 묶음부터 받아요.", "이렇게 생각하면 틀려요: '3줄씩 꽉 채우고 남은 것을 마지막에 둔다.' 그러면 크기 차이가 2가 돼서 '고르게 나눈다'에 맞지 않아요.", "이렇게 생각하면 틀려요: '남은 줄은 가운데 묶음이 받는다.' 남는 줄은 항상 1번부터 받아요."],
  trap: "남는 줄은 항상 '앞' 묶음부터 하나씩 더 받아요.",
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
  sum: "RANK는 동점자에게 같은 순위를 줘요. 10번 부서의 B와 C가 둘 다 1위라서 B, C, D, F 4행이에요.",
  why: "윈도우 함수(RANK 같은 것)는 WHERE보다 늦은 SELECT 단계에서 계산돼요. 그래서 같은 SELECT의 WHERE에서는 RK를 쓸 수 없어요. 안쪽(인라인 뷰)에서 순위를 먼저 매기고, 바깥 WHERE로 걸러요.\n\nPARTITION BY DEPT는 부서마다 순위를 1부터 새로 매긴다는 뜻이에요.\n\nRANK는 동점에게 같은 순위를 줘요. **10번 부서는 B와 C가 500으로 공동 1위라서 둘 다 RK = 1이에요.** A는 3위예요.\n\n20번 부서는 D(400)가 1위, 30번 부서는 F 혼자라 1위예요.\n\n그래서 B, C, D, F 4행이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT DEPT, ENAME                                       -- ④ B, C, D, F 출력\n  FROM (SELECT DEPT, ENAME,\n               RANK() OVER (PARTITION BY DEPT               -- ② 부서마다 따로\n                            ORDER BY SAL DESC) AS RK        -- ② 10번: B·C 1위, A 3위\n          FROM EMP)                                         -- ① 6행\n WHERE RK = 1;                                              -- ③ 1위만 → 4행" },
    { t: "1단계: 부서별 순위", tb: { c: ["DEPT", "ENAME", "SAL", "RK"], r: [[10, "B", 500, 1], [10, "C", 500, 1], [10, "A", 300, 3], [20, "D", 400, 1], [20, "E", 200, 2], [30, "F", 100, 1]], hl: [0, 1, 3, 5] } },
    { t: "2단계: RK = 1 필터", n: "B, C, D, F → 4행이에요." },
    { t: "의도대로 쓰려면", n: "-- 부서마다 딱 1명만 원하면: ROW_NUMBER + 동점을 가를 정렬 키\nSELECT DEPT, ENAME\n  FROM (SELECT DEPT, ENAME,\n               ROW_NUMBER() OVER (PARTITION BY DEPT\n                                  ORDER BY SAL DESC, ENAME) AS RN\n          FROM EMP)\n WHERE RN = 1;   -- 10 B, 20 D, 30 F → 3행" }
  ],
  res: { c: ["COUNT"], r: [[4]] },
  pg: "SELECT COUNT(*) FROM (SELECT DEPT, ENAME, RANK() OVER (PARTITION BY DEPT ORDER BY SAL DESC) RK FROM EMP) X WHERE RK = 1",
  ox: ["이렇게 생각하면 틀려요: '부서마다 1위는 1명이다.' 3은 ROW_NUMBER를 썼을 때예요. RANK는 공동 1위(B, C)를 둘 다 1로 매겨요.", "정답이에요.", "이렇게 생각하면 틀려요: 2위나 3위도 섞여 나온다고 본 경우예요. RK = 1만 남으니 5가 될 수 없어요.", "이렇게 생각하면 틀려요: 'WHERE RK = 1이 거르지 않는다.' 6은 전체 행 수예요."],
  trap: "RANK를 ROW_NUMBER로 바꾸면 결과가 3행이 되고, 10번 부서에서 B와 C 중 누가 나올지는 정해져 있지 않아요.",
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
  sum: "CUME_DIST는 '나 이하인 줄 수 ÷ 전체'라서 3/4 = 0.75예요. PERCENT_RANK는 '(순위 − 1) ÷ (전체 − 1)'이라서 1/3 ≈ 0.333이에요.",
  why: "CUME_DIST는 '현재 값 이하인 줄 수 ÷ 전체 줄 수'예요. '이 값까지 전체의 몇 %가 들어오나'를 뜻해요.\n\n같은 값은 '이하'에 모두 들어가요. 그래서 SAL 200인 두 줄은 둘 다 3/4 = 0.75예요.\n\nPERCENT_RANK는 '(RANK − 1) ÷ (전체 줄 수 − 1)'이에요. 첫 순위를 0, 마지막 순위를 1로 맞춰서 위치를 0~1 사이로 나타내요.\n\n**SAL 200의 RANK는 2라서 (2 − 1) ÷ (4 − 1) = 1/3 ≈ 0.333이에요.**\n\n그래서 0.75, 0.333…이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT ID, SAL,\n       CUME_DIST()    OVER (ORDER BY SAL) AS CD,  -- ② (SAL ≤ 200인 줄 3개) ÷ 4 = 0.75\n       PERCENT_RANK() OVER (ORDER BY SAL) AS PR   -- ② (순위 2 − 1) ÷ (4 − 1) = 0.333…\n  FROM T;                                       -- ① 4행: SAL 100·200·200·300" },
    { t: "행별 계산", tb: { c: ["SAL", "RANK", "CUME_DIST", "PERCENT_RANK"], r: [[100, 1, "1/4 = 0.25", "0/3 = 0"], [200, 2, "3/4 = 0.75", "1/3 = 0.333…"], [200, 2, "3/4 = 0.75", "1/3 = 0.333…"], [300, 4, "4/4 = 1", "3/3 = 1"]], hl: [1, 2] } }
  ],
  res: { c: ["SAL", "CD", "PR"], r: [[200, 0.75, 0.3333], [200, 0.75, 0.3333]] },
  pg: "SELECT SAL, ROUND(CUME_DIST() OVER (ORDER BY SAL)::numeric,4) CD, ROUND(PERCENT_RANK() OVER (ORDER BY SAL)::numeric,4) PR FROM T ORDER BY ID LIMIT 2 OFFSET 1",
  ox: ["정답이에요. CD = 3/4, PR = 1/3이에요.", "이렇게 생각하면 틀려요: '같은 값은 하나만 센다.' 그러면 2/4 = 0.5가 되지만, 같은 값 200 두 줄이 모두 '이하'에 들어가요.", "이렇게 생각하면 틀려요: 'PERCENT_RANK = 순위 ÷ 줄 수(2/4).' 실제로는 (순위 − 1) ÷ (줄 수 − 1)이에요.", "이렇게 생각하면 틀려요: CUME_DIST를 줄 번호(2/4)로, PERCENT_RANK의 분모를 전체 줄 수(1/4)로 계산한 경우예요."],
  trap: "CUME_DIST는 0이 나오지 않고(최소 1/n), PERCENT_RANK는 항상 0에서 시작해요.",
  memo: "CUME_DIST = 이하 비율 / PERCENT_RANK = (순위−1)/(n−1)"
}
);
