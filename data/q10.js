// 제2과목 · SQL 활용 + 관리 구문 — 고오답(kill) 유형 집중 (S161~S200)
// 윈도우 함수 · 그룹 함수 · 계층형 질의 · Top N · PIVOT · 정규 표현식 · DML · TCL · DDL · DCL
// CONNECT BY는 WITH RECURSIVE(경로 배열로 깊이 우선 순서 재현), ROWNUM은 "읽히는 순서"가 문제에 주어진 경우에만
// ROW_NUMBER로 재현한다. Oracle 고유 동작(DDL 자동 커밋, CTAS 제약 복사, 권한 회수)은 DB 검증 없이 해설로 근거를 밝힌다.
(window.QB = window.QB || []).push(
{
  id: "S161", s: 2, tp: "win", lv: 3, kill: true, sub: "윈도우 함수",
  th: "2과목 | 기본 RANGE 프레임과 COUNT · AVG의 동일값 처리",
  q: "다음 SQL을 실행했을 때 ID가 4인 행의 CNT, AVG_SAL 값으로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "SAL"], r: [[1, 100], [2, 200], [3, 200], [4, 300], [5, 300], [6, 400]] }],
  sql: "SELECT ID, SAL,\n       COUNT(*) OVER (ORDER BY SAL)          AS CNT,\n       ROUND(AVG(SAL) OVER (ORDER BY SAL), 1) AS AVG_SAL\n  FROM T;",
  o: ["CNT 5, AVG_SAL 220", "CNT 4, AVG_SAL 200", "CNT 6, AVG_SAL 250", "CNT 2, AVG_SAL 300"],
  a: 0,
  why: "OVER 절에 ORDER BY만 쓰고 프레임을 생략하면 RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW가 적용된다. RANGE는 '정렬 값' 기준이므로 현재 행과 SAL이 같은 동료 행(peer)까지 한꺼번에 프레임에 들어간다. ID 4(SAL 300)의 프레임은 SAL ≤ 300인 5개 행(100, 200, 200, 300, 300)이고, 합계 1100 ÷ 5 = 220이다. 같은 SAL인 ID 5도 똑같이 (5, 220)이다.",
  st: [
    { t: "[원본] SAL 오름차순 정렬", tb: { c: ["ID", "SAL"], r: [[1, 100], [2, 200], [3, 200], [4, 300], [5, 300], [6, 400]] } },
    { t: "[1단계] RANGE 프레임 = SAL ≤ 현재 SAL인 모든 행", tb: { c: ["ID", "SAL", "프레임에 든 SAL", "CNT", "AVG_SAL"], r: [[1, 100, "100", 1, 100], [2, 200, "100, 200, 200", 3, 166.7], [3, 200, "100, 200, 200", 3, 166.7], [4, 300, "100, 200, 200, 300, 300", 5, 220], [5, 300, "100, 200, 200, 300, 300", 5, 220], [6, 400, "전체", 6, 250]], hl: [3, 4] } },
    { t: "[2단계] 만약 ROWS UNBOUNDED PRECEDING이었다면 (비교)", tb: { c: ["ID", "CNT", "AVG_SAL"], r: [[4, 4, 200], [5, 5, 220]] }, n: "ROWS는 물리적 행 단위라 동료 행을 묶지 않는다. 같은 SAL 사이의 순서도 보장되지 않는다." }
  ],
  res: { c: ["ID", "CNT", "AVG_SAL"], r: [[1, 1, 100], [2, 3, 166.7], [3, 3, 166.7], [4, 5, 220], [5, 5, 220], [6, 6, 250]] },
  pg: "SELECT ID, COUNT(*) OVER (ORDER BY SAL) CNT, ROUND(AVG(SAL) OVER (ORDER BY SAL), 1) AVG_SAL FROM T ORDER BY ID",
  ox: ["정답.", "ROWS 프레임처럼 한 행씩 누적해 ID 4를 4번째 행에서 끊은 경우다. 기본 프레임은 RANGE라 같은 SAL(300)인 ID 5까지 포함한다.", "ORDER BY가 없을 때(파티션 전체)의 값이다. ORDER BY가 있으면 기본 프레임은 현재 값까지다.", "같은 SAL 값끼리만 묶는 PARTITION BY SAL처럼 본 경우다."],
  trap: "SUM뿐 아니라 COUNT, AVG, MAX 등 모든 집계형 윈도우 함수에 같은 기본 프레임이 적용된다. 정렬 컬럼에 동일값이 있으면 '행 번호'가 아니라 '값'으로 끊어야 한다.",
  memo: "ORDER BY만 → RANGE → 같은 값은 한 덩어리"
},
{
  id: "S162", s: 2, tp: "win", lv: 3, kill: true, sub: "윈도우 함수",
  th: "2과목 | ROWS 1 PRECEDING vs RANGE 100 PRECEDING 비교",
  q: "다음 SQL의 결과에서 ID 4, ID 5 행의 (R1, R2) 값으로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "SAL"], r: [[1, 100], [2, 200], [3, 200], [4, 300], [5, 500]] }],
  sql: "SELECT ID, SAL,\n       SUM(SAL) OVER (ORDER BY SAL\n                      ROWS  BETWEEN 1 PRECEDING   AND CURRENT ROW) AS R1,\n       SUM(SAL) OVER (ORDER BY SAL\n                      RANGE BETWEEN 100 PRECEDING AND CURRENT ROW) AS R2\n  FROM T;",
  o: ["ID 4 (500, 700), ID 5 (800, 500)", "ID 4 (500, 500), ID 5 (800, 800)", "ID 4 (700, 700), ID 5 (800, 500)", "ID 4 (500, 700), ID 5 (800, 1300)"],
  a: 0,
  why: "ROWS는 물리적 행 개수로 범위를 정한다. 1 PRECEDING은 '바로 앞 한 행 + 현재 행'이다. RANGE는 정렬 값(SAL)으로 범위를 정한다. 100 PRECEDING은 'SAL이 (현재 SAL − 100) 이상, 현재 SAL 이하인 모든 행'이다. ID 4(300)의 R2는 SAL 200~300인 행 3개(200 + 200 + 300 = 700)이고, ID 5(500)의 R2는 SAL 400~500인 행이 자기 자신뿐이라 500이다.",
  st: [
    { t: "[원본] SAL 오름차순", tb: { c: ["순서", "ID", "SAL"], r: [[1, 1, 100], [2, 2, 200], [3, 3, 200], [4, 4, 300], [5, 5, 500]] } },
    { t: "[1단계] ROWS 1 PRECEDING (행 기준)", tb: { c: ["ID", "범위", "R1"], r: [[4, "앞 행(200) + 300", 500], [5, "앞 행(300) + 500", 800]] } },
    { t: "[2단계] RANGE 100 PRECEDING (값 기준)", tb: { c: ["ID", "SAL 범위", "포함 행", "R2"], r: [[4, "200 ~ 300", "200, 200, 300", 700], [5, "400 ~ 500", "500", 500]], hl: [0, 1] } }
  ],
  res: { c: ["ID", "R1", "R2"], r: [[4, 500, 700], [5, 800, 500]] },
  pg: "SELECT ID, R1, R2 FROM (SELECT ID, SUM(SAL) OVER (ORDER BY SAL ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) R1, SUM(SAL) OVER (ORDER BY SAL RANGE BETWEEN 100 PRECEDING AND CURRENT ROW) R2 FROM T) X WHERE ID IN (4, 5) ORDER BY ID",
  ox: ["정답.", "RANGE를 ROWS와 같은 '앞 한 행'으로 읽은 경우다. RANGE의 100은 행 수가 아니라 값의 폭이다.", "ROWS도 같은 값(200, 200)을 한꺼번에 묶는다고 본 경우다. ROWS는 동료 행을 묶지 않는다.", "ID 5의 R2에서 100 PRECEDING을 '100행 앞'으로 읽어 처음부터 누적(1300)한 경우다."],
  trap: "ID 2, 3처럼 정렬 값이 같은 행의 R1은 둘 중 어느 행이 먼저 읽히느냐에 따라 달라질 수 있다. ROWS 프레임은 동일값이 있으면 결과가 비결정적이 된다.",
  memo: "ROWS n = n행 / RANGE n = 값 차이 n"
},
{
  id: "S163", s: 2, tp: "win", lv: 3, kill: true, sub: "윈도우 함수",
  th: "2과목 | FIRST_VALUE · LAST_VALUE와 프레임 지정",
  q: "다음 SQL의 결과에서 ENAME이 'LEE'인 행의 F1, L1, L2 값으로 옳은 것은?",
  tb: [{ n: "EMP", c: ["DEPT", "ENAME", "SAL"], r: [["A", "KIM", 300], ["A", "LEE", 200], ["A", "PARK", 200], ["A", "CHOI", 100], ["B", "HAN", 500], ["B", "YUN", 400]] }],
  sql: "SELECT DEPT, ENAME, SAL,\n       FIRST_VALUE(SAL) OVER (PARTITION BY DEPT ORDER BY SAL DESC) AS F1,\n       LAST_VALUE(SAL)  OVER (PARTITION BY DEPT ORDER BY SAL DESC) AS L1,\n       LAST_VALUE(SAL)  OVER (PARTITION BY DEPT ORDER BY SAL DESC\n                              ROWS BETWEEN CURRENT ROW\n                                       AND UNBOUNDED FOLLOWING) AS L2\n  FROM EMP;",
  o: ["300, 200, 100", "300, 100, 100", "300, 200, 200", "100, 200, 300"],
  a: 0,
  why: "F1, L1은 프레임을 생략했으므로 'RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW'다. 프레임의 첫 행은 늘 파티션의 첫 행이라 F1 = 300이다. L1은 프레임의 마지막 행인데, RANGE라서 현재 행과 SAL이 같은 PARK까지가 끝이므로 200이다. L2는 프레임을 '현재 행부터 파티션 끝까지'로 지정했으므로 마지막 행 CHOI의 100이 된다.",
  st: [
    { t: "[원본] DEPT A를 SAL 내림차순으로", tb: { c: ["ENAME", "SAL"], r: [["KIM", 300], ["LEE", 200], ["PARK", 200], ["CHOI", 100]] } },
    { t: "[1단계] LEE 행의 프레임", tb: { c: ["컬럼", "프레임", "첫/마지막 행", "값"], r: [["F1", "KIM ~ PARK (동료 행 포함)", "첫 행 KIM", 300], ["L1", "KIM ~ PARK (동료 행 포함)", "마지막 행 PARK", 200], ["L2", "LEE ~ CHOI", "마지막 행 CHOI", 100]], hl: [1, 2] } },
    { t: "[2단계] 전체 결과", tb: { c: ["DEPT", "ENAME", "F1", "L1", "L2"], r: [["A", "KIM", 300, 300, 100], ["A", "LEE", 300, 200, 100], ["A", "PARK", 300, 200, 100], ["A", "CHOI", 300, 100, 100], ["B", "HAN", 500, 500, 400], ["B", "YUN", 500, 400, 400]], hl: [1] } }
  ],
  res: { c: ["DEPT", "ENAME", "F1", "L1", "L2"], r: [["A", "KIM", 300, 300, 100], ["A", "LEE", 300, 200, 100], ["A", "PARK", 300, 200, 100], ["A", "CHOI", 300, 100, 100], ["B", "HAN", 500, 500, 400], ["B", "YUN", 500, 400, 400]] },
  pg: "SELECT DEPT, ENAME, FIRST_VALUE(SAL) OVER (PARTITION BY DEPT ORDER BY SAL DESC) F1, LAST_VALUE(SAL) OVER (PARTITION BY DEPT ORDER BY SAL DESC) L1, LAST_VALUE(SAL) OVER (PARTITION BY DEPT ORDER BY SAL DESC ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING) L2 FROM EMP ORDER BY DEPT, SAL DESC, ENAME",
  ox: ["정답.", "L1의 기본 프레임을 파티션 전체로 착각한 경우다. 기본 프레임은 현재 행(과 동료 행)에서 끝난다.", "L2도 기본 프레임처럼 현재 값에서 끝난다고 본 경우다. UNBOUNDED FOLLOWING이므로 파티션 끝(CHOI)까지 간다.", "DESC를 무시하고 오름차순으로 계산한 경우다."],
  trap: "LAST_VALUE로 '파티션의 마지막 값'을 얻으려면 ROWS(또는 RANGE) BETWEEN … AND UNBOUNDED FOLLOWING을 반드시 써야 한다. 프레임을 생략하면 대개 자기 자신(또는 동료 행)의 값이 나온다.",
  memo: "LAST_VALUE 기본 = 현재 값 / 끝까지 = UNBOUNDED FOLLOWING"
},
{
  id: "S164", s: 2, tp: "win", lv: 3, kill: true, sub: "윈도우 함수",
  th: "2과목 | LAG · LEAD의 offset과 default (NULL 값과의 구분)",
  q: "다음 SQL의 결과에서 ID 2와 ID 5 행의 (A, B) 값으로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "V"], r: [[1, 10], [2, 20], [3, null], [4, 40], [5, 50]] }],
  sql: "SELECT ID, V,\n       LAG(V, 2, 0)   OVER (ORDER BY ID) AS A,\n       LEAD(V, 1, -1) OVER (ORDER BY ID) AS B\n  FROM T;",
  o: ["ID 2 (0, NULL), ID 5 (NULL, -1)", "ID 2 (0, -1), ID 5 (0, -1)", "ID 2 (10, NULL), ID 5 (40, -1)", "ID 2 (NULL, NULL), ID 5 (NULL, NULL)"],
  a: 0,
  why: "LAG(V, 2, 0)은 '2행 앞의 V'를, LEAD(V, 1, -1)은 '1행 뒤의 V'를 가져온다. 세 번째 인수(default)는 가져올 행이 파티션 범위 밖이라 '존재하지 않을 때'만 쓰인다. 가져온 행이 존재하는데 그 값이 NULL이면 default가 아니라 NULL이 그대로 나온다. ID 2의 A는 2행 앞이 없어 0, B는 ID 3의 V(NULL)다. ID 5의 A는 ID 3의 V(NULL), B는 뒤 행이 없어 −1이다.",
  st: [
    { t: "[원본] ID 순서", tb: { c: ["ID", "V"], r: [[1, 10], [2, 20], [3, null], [4, 40], [5, 50]] } },
    { t: "[1단계] 참조할 행 찾기", tb: { c: ["ID", "LAG 2 → 행", "LEAD 1 → 행"], r: [[1, "없음", "ID 2"], [2, "없음", "ID 3"], [3, "ID 1", "ID 4"], [4, "ID 2", "ID 5"], [5, "ID 3", "없음"]] } },
    { t: "[2단계] 값 결정 (없음 → default, 있는데 NULL → NULL)", tb: { c: ["ID", "A", "B"], r: [[1, 0, 20], [2, 0, null], [3, 10, 40], [4, 20, 50], [5, null, -1]], hl: [1, 4] } }
  ],
  res: { c: ["ID", "A", "B"], r: [[1, 0, 20], [2, 0, null], [3, 10, 40], [4, 20, 50], [5, null, -1]] },
  pg: "SELECT ID, LAG(V, 2, 0) OVER (ORDER BY ID) A, LEAD(V, 1, -1) OVER (ORDER BY ID) B FROM T ORDER BY ID",
  ox: ["정답.", "default가 NULL 값까지 바꿔 준다고 본 경우다. default는 NVL이 아니다.", "offset 2를 무시하고 바로 앞 행(1칸)을 가져온 경우다.", "default 인수를 무시한 경우다."],
  trap: "LAG/LEAD의 default는 '행이 없을 때'의 대체값이다. 값이 NULL인 행을 건너뛰고 싶다면 Oracle의 IGNORE NULLS 옵션을 써야 한다.",
  memo: "default = 행이 없을 때만, NULL 값은 그대로"
},
{
  id: "S165", s: 2, tp: "win", lv: 3, kill: true, sub: "윈도우 함수",
  th: "2과목 | PARTITION BY 안의 RANK vs DENSE_RANK 필터 건수",
  q: "다음 (가), (나) SQL의 결과 건수로 옳은 것은?",
  tb: [{ n: "EMP", c: ["DEPT", "ENAME", "SAL"], r: [[10, "A", 500], [10, "B", 500], [10, "C", 400], [10, "D", 300], [20, "E", 600], [20, "F", 500], [20, "G", 500], [20, "H", 500], [20, "I", 200]] }],
  sql: "(가) SELECT COUNT(*) FROM\n      (SELECT RANK() OVER (PARTITION BY DEPT ORDER BY SAL DESC) AS RK FROM EMP)\n     WHERE RK <= 2;\n\n(나) SELECT COUNT(*) FROM\n      (SELECT DENSE_RANK() OVER (PARTITION BY DEPT ORDER BY SAL DESC) AS RK FROM EMP)\n     WHERE RK <= 2;",
  o: ["(가) 6, (나) 7", "(가) 4, (나) 4", "(가) 6, (나) 6", "(가) 7, (나) 6"],
  a: 0,
  why: "PARTITION BY DEPT이므로 부서마다 순위가 1부터 다시 매겨진다. RANK는 동점 다음 순위를 동점 수만큼 건너뛰고(1, 1, 3), DENSE_RANK는 건너뛰지 않는다(1, 1, 2). 10번 부서는 RANK ≤ 2가 2명, DENSE_RANK ≤ 2가 3명이다. 20번 부서는 600이 1위, 500 세 명이 공동 2위라 둘 다 4명이다.",
  st: [
    { t: "[원본] 부서별 SAL 내림차순", tb: { c: ["DEPT", "ENAME", "SAL"], r: [[10, "A", 500], [10, "B", 500], [10, "C", 400], [10, "D", 300], [20, "E", 600], [20, "F", 500], [20, "G", 500], [20, "H", 500], [20, "I", 200]] } },
    { t: "[1단계] 부서별 순위", tb: { c: ["DEPT", "ENAME", "SAL", "RANK", "DENSE_RANK"], r: [[10, "A", 500, 1, 1], [10, "B", 500, 1, 1], [10, "C", 400, 3, 2], [10, "D", 300, 4, 3], [20, "E", 600, 1, 1], [20, "F", 500, 2, 2], [20, "G", 500, 2, 2], [20, "H", 500, 2, 2], [20, "I", 200, 5, 3]], hl: [2] } },
    { t: "[2단계] RK ≤ 2 건수", tb: { c: ["DEPT", "RANK ≤ 2", "DENSE_RANK ≤ 2"], r: [[10, 2, 3], [20, 4, 4], ["합계", 6, 7]] } }
  ],
  res: { c: ["RANK_CNT", "DENSE_CNT"], r: [[6, 7]] },
  pg: "SELECT (SELECT COUNT(*) FROM (SELECT RANK() OVER (PARTITION BY DEPT ORDER BY SAL DESC) RK FROM EMP) X WHERE RK <= 2), (SELECT COUNT(*) FROM (SELECT DENSE_RANK() OVER (PARTITION BY DEPT ORDER BY SAL DESC) RK FROM EMP) Y WHERE RK <= 2)",
  ox: ["정답.", "동점을 무시하고 부서별 2명씩(ROW_NUMBER처럼) 자른 경우다.", "PARTITION BY를 무시하고 전체에서 순위를 매긴 경우다(전체로는 600 1위, 500 다섯 명 2위라 둘 다 6건).", "RANK와 DENSE_RANK의 동점 처리를 서로 바꾼 경우다."],
  trap: "부서별 상위 N명 문제에서 동점자가 있으면 RANK, DENSE_RANK, ROW_NUMBER의 건수가 모두 다를 수 있다. 특히 DENSE_RANK는 동점 '다음' 값까지 끌어들인다.",
  memo: "RANK 1,1,3 / DENSE 1,1,2 — 파티션마다 새로"
},
{
  id: "S166", s: 2, tp: "win", lv: 3, kill: true, sub: "윈도우 함수",
  th: "2과목 | 파티션별 NTILE의 불균등 배분",
  q: "다음 SQL의 결과에서 NT가 1인 행의 CNT와 NT가 3인 행의 CNT로 옳은 것은?",
  tb: [{ n: "EMP", c: ["DEPT", "ENAME", "SAL"], r: [["A", "A1", 700], ["A", "A2", 600], ["A", "A3", 500], ["A", "A4", 400], ["A", "A5", 300], ["A", "A6", 200], ["A", "A7", 100], ["B", "B1", 400], ["B", "B2", 300], ["B", "B3", 200], ["B", "B4", 100]] }],
  sql: "SELECT NT, COUNT(*) AS CNT\n  FROM (SELECT NTILE(3) OVER (PARTITION BY DEPT ORDER BY SAL DESC) AS NT\n          FROM EMP)\n GROUP BY NT\n ORDER BY NT;",
  o: ["NT=1: 5, NT=3: 3", "NT=1: 3, NT=3: 5", "NT=1: 4, NT=3: 3", "NT=1: 5, NT=3: 1"],
  a: 0,
  why: "NTILE(n)은 파티션의 행을 n개 버킷으로 나누되, 나누어떨어지지 않으면 남는 행을 '앞 버킷부터 하나씩' 더 준다. A 부서 7행 ÷ 3 = 몫 2, 나머지 1 → 3, 2, 2. B 부서 4행 ÷ 3 = 몫 1, 나머지 1 → 2, 1, 1. 따라서 NT=1은 3 + 2 = 5, NT=2는 2 + 1 = 3, NT=3은 2 + 1 = 3이다.",
  st: [
    { t: "[원본] 부서별 행 수", tb: { c: ["DEPT", "행 수"], r: [["A", 7], ["B", 4]] } },
    { t: "[1단계] 부서별 버킷 크기 (나머지는 앞부터)", tb: { c: ["DEPT", "계산", "NT=1", "NT=2", "NT=3"], r: [["A", "7 = 2×3 + 1", 3, 2, 2], ["B", "4 = 1×3 + 1", 2, 1, 1]] } },
    { t: "[2단계] NT별 합계", tb: { c: ["NT", "CNT"], r: [[1, 5], [2, 3], [3, 3]], hl: [0, 2] } }
  ],
  res: { c: ["NT", "CNT"], r: [[1, 5], [2, 3], [3, 3]] },
  pg: "SELECT NT, COUNT(*) CNT FROM (SELECT NTILE(3) OVER (PARTITION BY DEPT ORDER BY SAL DESC) NT FROM EMP) X GROUP BY NT ORDER BY NT",
  ox: ["정답.", "남는 행을 뒤 버킷에 몰아준다고 본 경우다(A: 2, 2, 3 / B: 1, 1, 2).", "PARTITION BY를 무시하고 11행 전체를 3등분(4, 4, 3)한 경우다.", "앞 버킷을 CEIL(행 수 ÷ 3)만큼 꽉 채운다고 본 경우다(A: 3, 3, 1 / B: 2, 2, 0)."],
  trap: "NTILE의 버킷 크기 차이는 최대 1이다. '앞 버킷부터 하나씩 더'를 기억하면 7행 → 3, 2, 2, 10행 4등분 → 3, 3, 2, 2가 바로 나온다.",
  memo: "NTILE 나머지 = 앞 버킷부터 +1"
},
{
  id: "S167", s: 2, tp: "win", lv: 2, kill: true, sub: "윈도우 함수",
  th: "2과목 | COUNT(*) OVER (PARTITION BY) vs GROUP BY의 행 수와 NULL 파티션",
  q: "다음 (가)의 결과 행 수, (나)의 결과 행 수, (가)에서 ENAME이 'KANG'인 행의 CNT를 순서대로 나열한 것은?",
  tb: [{ n: "EMP", c: ["ENAME", "DEPT"], r: [["KIM", 10], ["LEE", 10], ["PARK", 20], ["CHOI", 20], ["JUNG", 20], ["KANG", null], ["YOON", null]] }],
  sql: "(가) SELECT ENAME, DEPT,\n           COUNT(*) OVER (PARTITION BY DEPT) AS CNT\n      FROM EMP;\n\n(나) SELECT DEPT, COUNT(*) AS CNT\n      FROM EMP\n     GROUP BY DEPT;",
  o: ["7, 3, 2", "3, 3, 2", "7, 3, 0", "7, 4, 1"],
  a: 0,
  why: "윈도우 함수는 행을 줄이지 않는다. (가)는 원본 7행이 모두 남고 각 행 옆에 자기 부서의 행 수가 붙는다. GROUP BY는 그룹당 1행으로 줄인다. GROUP BY와 PARTITION BY 모두 NULL끼리는 하나의 그룹으로 묶으므로 (나)는 10, 20, NULL의 3행이고, (가)의 KANG 행 CNT는 NULL 파티션의 행 수 2다. COUNT(*)는 NULL 여부와 상관없이 행을 센다.",
  st: [
    { t: "[원본] 부서별 분포", tb: { c: ["DEPT", "사원"], r: [[10, "KIM, LEE"], [20, "PARK, CHOI, JUNG"], [null, "KANG, YOON"]] } },
    { t: "[1단계] (가) 윈도우 함수 — 7행 유지", tb: { c: ["ENAME", "DEPT", "CNT"], r: [["KIM", 10, 2], ["LEE", 10, 2], ["PARK", 20, 3], ["CHOI", 20, 3], ["JUNG", 20, 3], ["KANG", null, 2], ["YOON", null, 2]], hl: [5] } },
    { t: "[2단계] (나) GROUP BY — 그룹당 1행", tb: { c: ["DEPT", "CNT"], r: [[10, 2], [20, 3], [null, 2]] } }
  ],
  res: { c: ["가_행수", "나_행수", "KANG_CNT"], r: [[7, 3, 2]] },
  pg: "SELECT (SELECT COUNT(*) FROM (SELECT ENAME, COUNT(*) OVER (PARTITION BY DEPT) CNT FROM EMP) A), (SELECT COUNT(*) FROM (SELECT DEPT, COUNT(*) FROM EMP GROUP BY DEPT) B), (SELECT CNT FROM (SELECT ENAME, COUNT(*) OVER (PARTITION BY DEPT) CNT FROM EMP) C WHERE ENAME = 'KANG')",
  ox: ["정답.", "PARTITION BY가 GROUP BY처럼 행을 합친다고 본 경우다.", "COUNT(*)를 COUNT(DEPT)와 혼동해 NULL 파티션의 행을 세지 않은 경우다.", "NULL ≠ NULL이라 NULL 행이 각각 별도 그룹이 된다고 본 경우다. 그룹핑에서는 NULL끼리 한 그룹이다."],
  trap: "'부서별 인원을 각 사원 옆에 붙이기'는 윈도우 함수, '부서별 1줄 요약'은 GROUP BY다. 윈도우 결과 행 수 = WHERE를 통과한 원본 행 수다.",
  memo: "OVER는 행 유지, GROUP BY는 행 축소 — NULL은 한 그룹"
},
{
  id: "S168", s: 2, tp: "win", lv: 2, kill: true, sub: "윈도우 함수",
  th: "2과목 | WHERE 절의 윈도우 함수 오류와 인라인 뷰",
  q: "다음 [EMP] 테이블에 대해 실행했을 때 오류가 발생하는 SQL은? (Oracle 기준)",
  tb: [{ n: "EMP", c: ["ENAME", "DEPT", "SAL"], r: [["KIM", 10, 300], ["LEE", 10, 200], ["PARK", 20, 300], ["CHOI", 20, 100]] }],
  o: [
    "SELECT ENAME FROM EMP\n WHERE RANK() OVER (ORDER BY SAL DESC) <= 2;",
    "SELECT ENAME FROM (SELECT ENAME, RANK() OVER (ORDER BY SAL DESC) AS RK FROM EMP)\n WHERE RK <= 2;",
    "SELECT ENAME, SAL FROM EMP\n ORDER BY RANK() OVER (ORDER BY SAL DESC);",
    "SELECT DEPT, SUM(SAL), RANK() OVER (ORDER BY SUM(SAL) DESC)\n  FROM EMP GROUP BY DEPT;"
  ],
  a: 0,
  why: "윈도우(분석) 함수는 WHERE, GROUP BY, HAVING이 모두 처리된 뒤에 계산되므로 SELECT 절과 ORDER BY 절에서만 쓸 수 있다. WHERE 절에 쓰면 ORA-30483(window functions are not allowed here) 오류가 난다. 순위로 거르려면 ②처럼 인라인 뷰에서 순위를 계산한 뒤 바깥 WHERE에서 별칭으로 걸러야 한다. ②의 결과는 SAL 300 공동 1위인 KIM, PARK 2행이다(LEE는 3위). ④는 GROUP BY 후의 집계값 SUM(SAL)에 순위를 매기는 정상 문장이다.",
  st: [
    { t: "[원본] 논리적 처리 순서", tb: { c: ["순서", "절", "윈도우 함수 사용"], r: [[1, "FROM", "—"], [2, "WHERE", "불가"], [3, "GROUP BY / HAVING", "불가"], [4, "SELECT (윈도우 함수 계산)", "가능"], [5, "ORDER BY", "가능"]], hl: [1] } },
    { t: "[1단계] ② 인라인 뷰의 순위", tb: { c: ["ENAME", "SAL", "RK"], r: [["KIM", 300, 1], ["PARK", 300, 1], ["LEE", 200, 3], ["CHOI", 100, 4]] } },
    { t: "[2단계] ② 바깥 WHERE RK <= 2", tb: { c: ["ENAME"], r: [["KIM"], ["PARK"]] } }
  ],
  res: { c: ["ENAME"], r: [["KIM"], ["PARK"]] },
  pg: "SELECT ENAME FROM (SELECT ENAME, RANK() OVER (ORDER BY SAL DESC) RK FROM EMP) X WHERE RK <= 2 ORDER BY ENAME",
  ox: ["오류. 윈도우 함수는 WHERE 절에 쓸 수 없다(ORA-30483).", "정상. 인라인 뷰에서 계산한 순위를 바깥에서 거르는 표준 방법이다(결과 KIM, PARK).", "정상. 윈도우 함수는 ORDER BY 절에서 쓸 수 있다.", "정상. GROUP BY 결과(집계값)에 윈도우 함수를 적용할 수 있다."],
  trap: "같은 SELECT 블록의 WHERE에서 SELECT 절의 순위 별칭(RK)을 쓰는 것도 안 된다(ORA-00904). 별칭은 인라인 뷰 바깥에서만 쓸 수 있다.",
  memo: "윈도우 함수 = SELECT · ORDER BY에서만 → 거르려면 인라인 뷰"
},
{
  id: "S169", s: 2, tp: "grp", lv: 3, kill: true, sub: "그룹 함수",
  th: "2과목 | 데이터에 NULL이 있을 때 ROLLUP 결과 행 수",
  q: "다음 SQL의 결과 전체 행 수와, 그중 REGION 값이 NULL로 표시되는 행 수를 순서대로 나열한 것은?",
  tb: [{ n: "SALES", c: ["REGION", "PROD", "AMT"], r: [["서울", "A", 100], ["서울", "B", 200], ["부산", "A", 300], [null, "A", 50]] }],
  sql: "SELECT REGION, PROD, SUM(AMT) AS TOT\n  FROM SALES\n GROUP BY ROLLUP (REGION, PROD);",
  o: ["8, 3", "7, 2", "6, 1", "10, 5"],
  a: 0,
  why: "ROLLUP(REGION, PROD)은 (REGION, PROD) → (REGION) → () 세 단계로 집계한다. 데이터의 NULL REGION도 하나의 정상 그룹이므로 (NULL, A) 상세 행과 NULL 지역의 소계 행이 각각 만들어진다. 상세 4 + 지역 소계 3(서울, 부산, NULL) + 총계 1 = 8행이다. REGION이 NULL로 보이는 행은 NULL 지역 상세(50), NULL 지역 소계(50), 총계(650)의 3행이다. 원래 NULL과 소계의 NULL은 GROUPING(REGION)으로만 구별할 수 있다.",
  st: [
    { t: "[원본] 그룹 단계", tb: { c: ["단계", "그룹", "행 수"], r: [["(REGION, PROD)", "서울·A, 서울·B, 부산·A, NULL·A", 4], ["(REGION)", "서울, 부산, NULL", 3], ["()", "총계", 1]] } },
    { t: "[1단계] 전체 결과와 GROUPING 값", tb: { c: ["REGION", "PROD", "TOT", "GROUPING(REGION)", "GROUPING(PROD)"], r: [["부산", "A", 300, 0, 0], ["부산", null, 300, 0, 1], ["서울", "A", 100, 0, 0], ["서울", "B", 200, 0, 0], ["서울", null, 300, 0, 1], [null, "A", 50, 0, 0], [null, null, 50, 0, 1], [null, null, 650, 1, 1]], hl: [5, 6, 7] } },
    { t: "[2단계] 집계", tb: { c: ["전체 행", "REGION이 NULL인 행"], r: [[8, 3]] } }
  ],
  res: { c: ["전체", "REGION_NULL"], r: [[8, 3]] },
  pg: "SELECT COUNT(*), COUNT(*) FILTER (WHERE REGION IS NULL) FROM (SELECT REGION, PROD, SUM(AMT) TOT FROM SALES GROUP BY ROLLUP (REGION, PROD)) X",
  ox: ["정답.", "NULL 지역의 상세 행은 셌지만 NULL 지역의 소계 행을 빠뜨린 경우다.", "NULL REGION 데이터를 집계에서 빠지는 것으로 본 경우다. GROUP BY는 NULL도 한 그룹으로 묶는다.", "CUBE(REGION, PROD)의 결과(상품별 소계 2행 추가)다."],
  trap: "'REGION이 NULL인 행 = 소계·총계'라고 단정하면 안 된다. 원본 데이터에 NULL이 있으면 GROUPING() 함수(소계로 생긴 NULL이면 1)로 구별해야 한다.",
  memo: "데이터 NULL도 그룹 1개 → 소계도 1개 더"
},
{
  id: "S170", s: 2, tp: "grp", lv: 3, kill: true, sub: "그룹 함수",
  th: "2과목 | GROUPING()으로 소계 행 라벨 붙이기 vs NVL",
  q: "다음 (가), (나) SQL의 결과에서 R이 'ALL'로 표시되는 행의 S 값을 각각 모두 나열한 것은?",
  tb: [{ n: "SALES", c: ["REGION", "AMT"], r: [["EAST", 100], ["EAST", 200], ["WEST", 300], [null, 400]] }],
  sql: "(가) SELECT CASE WHEN GROUPING(REGION) = 1 THEN 'ALL'\n                ELSE NVL(REGION, 'N/A') END AS R,\n           SUM(AMT) AS S\n      FROM SALES\n     GROUP BY ROLLUP (REGION);\n\n(나) SELECT NVL(REGION, 'ALL') AS R,\n           SUM(AMT) AS S\n      FROM SALES\n     GROUP BY ROLLUP (REGION);",
  o: ["(가) 1000 / (나) 400, 1000", "(가) 1000 / (나) 1000", "(가) 400, 1000 / (나) 400, 1000", "(가) 1000 / (나) 1400"],
  a: 0,
  why: "ROLLUP(REGION)의 결과는 EAST 300, WEST 300, NULL 지역 400, 총계 1000의 4행이다. GROUPING(REGION)은 'ROLLUP이 만든 소계·총계 행'에서만 1을 돌려주므로 (가)는 총계 행만 'ALL'이 되고, 데이터의 NULL 지역은 'N/A'가 된다. (나)의 NVL은 원래 NULL과 총계의 NULL을 구별하지 못해 400 행과 1000 행이 둘 다 'ALL'로 표시된다. 라벨이 같아져도 이미 집계된 행이 다시 합쳐지지는 않는다.",
  st: [
    { t: "[원본] ROLLUP(REGION) 결과", tb: { c: ["REGION", "S", "GROUPING(REGION)"], r: [["EAST", 300, 0], ["WEST", 300, 0], [null, 400, 0], [null, 1000, 1]] } },
    { t: "[1단계] (가) GROUPING 기준 라벨", tb: { c: ["R", "S"], r: [["EAST", 300], ["WEST", 300], ["N/A", 400], ["ALL", 1000]], hl: [3] } },
    { t: "[2단계] (나) NVL 기준 라벨", tb: { c: ["R", "S"], r: [["EAST", 300], ["WEST", 300], ["ALL", 400], ["ALL", 1000]], hl: [2, 3] } }
  ],
  res: { c: ["쿼리", "R", "S"], r: [["가", "ALL", 1000], ["나", "ALL", 400], ["나", "ALL", 1000]] },
  pg: "SELECT Q, R, S FROM (SELECT '가' Q, CASE WHEN GROUPING(REGION) = 1 THEN 'ALL' ELSE COALESCE(REGION, 'N/A') END R, SUM(AMT) S FROM SALES GROUP BY ROLLUP (REGION) UNION ALL SELECT '나', COALESCE(REGION, 'ALL'), SUM(AMT) FROM SALES GROUP BY ROLLUP (REGION)) X WHERE R = 'ALL' ORDER BY Q, S",
  ox: ["정답.", "(나)의 NVL이 데이터의 NULL 지역까지 'ALL'로 바꾼다는 점을 놓친 경우다.", "GROUPING이 데이터 NULL에도 1을 돌려준다고 본 경우다.", "같은 라벨 'ALL'의 두 행이 다시 합쳐진다고 본 경우다. 라벨은 표시만 바꾼다."],
  trap: "소계 라벨은 NVL이 아니라 GROUPING(컬럼) = 1 조건(CASE 또는 DECODE)으로 붙여야 안전하다. 그룹 컬럼에 NULL 데이터가 있으면 NVL은 틀린 라벨을 만든다.",
  memo: "소계 판별은 GROUPING() — NVL은 데이터 NULL과 혼동"
},
{
  id: "S171", s: 2, tp: "grp", lv: 3, kill: true, sub: "그룹 함수",
  th: "2과목 | CUBE · GROUPING SETS 행 수 (NULL 데이터 포함)",
  q: "다음 (가)~(다) SQL의 결과 행 수를 순서대로 나열한 것은?",
  tb: [{ n: "T", c: ["A", "B", "V"], r: [["X", "P", 1], ["X", "Q", 2], ["Y", "P", 3], ["Y", "P", 4], ["Z", null, 5]] }],
  sql: "(가) SELECT A, B, SUM(V) FROM T GROUP BY CUBE (A, B);\n(나) SELECT A, B, SUM(V) FROM T GROUP BY GROUPING SETS (A, B);\n(다) SELECT A, B, SUM(V) FROM T GROUP BY GROUPING SETS ((A, B), ());",
  o: ["11, 6, 5", "10, 5, 4", "11, 7, 5", "8, 6, 5"],
  a: 0,
  why: "먼저 각 그룹 단위의 서로 다른 값 개수를 센다. (A, B) 조합은 X·P, X·Q, Y·P, Z·NULL의 4개, A는 X, Y, Z의 3개, B는 P, Q, NULL의 3개다(NULL도 하나의 그룹). CUBE(A, B) = (A, B) + (A) + (B) + () = 4 + 3 + 3 + 1 = 11행. GROUPING SETS(A, B)는 나열한 집합만 만들고 총계를 자동으로 붙이지 않으므로 3 + 3 = 6행. GROUPING SETS((A, B), ())는 4 + 1 = 5행이다.",
  st: [
    { t: "[원본] 그룹 단위별 개수", tb: { c: ["그룹 단위", "값", "개수"], r: [["(A, B)", "X·P, X·Q, Y·P, Z·NULL", 4], ["(A)", "X, Y, Z", 3], ["(B)", "P, Q, NULL", 3], ["()", "총계", 1]] } },
    { t: "[1단계] 각 SQL이 만드는 그룹 단위", tb: { c: ["SQL", "그룹 단위", "행 수"], r: [["(가) CUBE(A, B)", "(A,B) (A) (B) ()", "4+3+3+1 = 11"], ["(나) GROUPING SETS(A, B)", "(A) (B)", "3+3 = 6"], ["(다) GROUPING SETS((A,B), ())", "(A,B) ()", "4+1 = 5"]] } }
  ],
  res: { c: ["가", "나", "다"], r: [[11, 6, 5]] },
  pg: "SELECT (SELECT COUNT(*) FROM (SELECT A, B, SUM(V) FROM T GROUP BY CUBE (A, B)) X), (SELECT COUNT(*) FROM (SELECT A, B, SUM(V) FROM T GROUP BY GROUPING SETS (A, B)) Y), (SELECT COUNT(*) FROM (SELECT A, B, SUM(V) FROM T GROUP BY GROUPING SETS ((A, B), ())) Z)",
  ox: ["정답.", "B가 NULL인 데이터를 그룹에서 빠지는 것으로 본 경우다. NULL도 하나의 그룹이다.", "GROUPING SETS에도 총계가 자동으로 붙는다고 본 경우다. 총계는 ()를 명시해야 생긴다.", "CUBE를 ROLLUP(A, B)처럼 (A, B) → (A) → ()로만 계산한 경우다."],
  trap: "행 수 문제는 '그룹 단위별 서로 다른 값 개수'를 먼저 구하고 더하면 된다. 데이터에 NULL이 있으면 그것도 값 하나로 센다.",
  memo: "CUBE = 모든 조합, GROUPING SETS = 쓴 것만(총계는 ())"
},
{
  id: "S172", s: 2, tp: "grp", lv: 3, kill: true, sub: "그룹 함수",
  th: "2과목 | ROLLUP((A, B), C) — 괄호로 묶은 복합 컬럼",
  q: "다음 SQL의 결과 행 수와, A = 1, B = 'x', C가 NULL인 행의 TOT 값을 순서대로 나열한 것은?",
  tb: [{ n: "T", c: ["A", "B", "C", "V"], r: [[1, "x", "p", 10], [1, "x", "q", 20], [1, "y", "p", 30], [2, "x", "p", 40]] }],
  sql: "SELECT A, B, C, SUM(V) AS TOT\n  FROM T\n GROUP BY ROLLUP ((A, B), C);",
  o: ["8, 30", "10, 30", "8, 60", "7, 30"],
  a: 0,
  why: "ROLLUP 안에서 괄호로 묶은 (A, B)는 하나의 단위로 취급되어 따로 쪼개지지 않는다. 따라서 그룹 단위는 (A, B, C) → (A, B) → ()의 3단계뿐이다. (A, B, C) 4행 + (A, B) 소계 3행(1·x, 1·y, 2·x) + 총계 1행 = 8행이다. A = 1, B = 'x'의 소계는 10 + 20 = 30이다.",
  st: [
    { t: "[원본] 그룹 단위 비교", tb: { c: ["표현", "그룹 단위"], r: [["ROLLUP((A, B), C)", "(A,B,C) → (A,B) → ()"], ["ROLLUP(A, B, C)", "(A,B,C) → (A,B) → (A) → ()"]] } },
    { t: "[1단계] 결과", tb: { c: ["A", "B", "C", "TOT", "단계"], r: [[1, "x", "p", 10, "상세"], [1, "x", "q", 20, "상세"], [1, "x", null, 30, "(A,B) 소계"], [1, "y", "p", 30, "상세"], [1, "y", null, 30, "(A,B) 소계"], [2, "x", "p", 40, "상세"], [2, "x", null, 40, "(A,B) 소계"], [null, null, null, 100, "총계"]], hl: [2] } },
    { t: "[2단계] 행 수", tb: { c: ["상세", "(A,B) 소계", "총계", "합계"], r: [[4, 3, 1, 8]] } }
  ],
  res: { c: ["행수", "TOT"], r: [[8, 30]] },
  pg: "SELECT (SELECT COUNT(*) FROM (SELECT A, B, C, SUM(V) FROM T GROUP BY ROLLUP ((A, B), C)) X), (SELECT SUM(V) FROM T GROUP BY ROLLUP ((A, B), C) HAVING A = 1 AND B = 'x' AND GROUPING(C) = 1)",
  ox: ["정답.", "괄호를 무시하고 ROLLUP(A, B, C)로 계산해 A 단독 소계 2행이 더 생긴 경우다.", "(A, B) 소계를 A = 1 전체(10 + 20 + 30)의 소계로 착각한 경우다. 이 SQL에는 A 단독 소계가 없다.", "ROLLUP의 맨 끝 총계 행을 빠뜨린 경우다."],
  trap: "ROLLUP(A, (B, C))처럼 괄호 위치가 바뀌면 그룹 단위는 (A,B,C) → (A) → ()가 된다. 괄호 안은 '함께 붙었다 함께 떨어지는' 한 덩어리다.",
  memo: "ROLLUP 괄호 = 한 덩어리로 소계"
},
{
  id: "S173", s: 2, tp: "grp", lv: 3, kill: true, sub: "그룹 함수",
  th: "2과목 | GROUP BY ROLLUP(A), B — ROLLUP 밖 컬럼은 고정, 총계 없음",
  q: "다음 SQL의 결과 행 수와 SUM_SAL의 최댓값을 순서대로 나열한 것은?",
  tb: [{ n: "EMP", c: ["DEPT", "JOB", "SAL"], r: [[10, "CLERK", 100], [10, "MGR", 300], [20, "CLERK", 200], [20, "CLERK", 150], [30, "MGR", 500]] }],
  sql: "SELECT DEPT, JOB, SUM(SAL) AS SUM_SAL\n  FROM EMP\n GROUP BY ROLLUP (DEPT), JOB;",
  o: ["6, 800", "7, 500", "8, 1250", "7, 1250"],
  a: 0,
  why: "GROUP BY ROLLUP(DEPT), JOB은 ROLLUP 밖에 쓴 JOB을 항상 고정하고, ROLLUP 안의 DEPT만 뺐다 넣었다 한다. 그룹 단위는 (DEPT, JOB)과 (JOB) 두 가지뿐이며, JOB까지 빠지는 전체 총계 ()는 만들어지지 않는다. 쓰인 순서가 ROLLUP이 먼저라도 소계 기준은 '괄호 밖 컬럼'이다. (DEPT, JOB) 4행 + 직무별 소계 2행(CLERK 450, MGR 800) = 6행이고, 최댓값은 MGR 소계 800이다.",
  st: [
    { t: "[원본] 그룹 단위", tb: { c: ["표현", "그룹 단위"], r: [["GROUP BY ROLLUP(DEPT), JOB", "(DEPT, JOB), (JOB)"], ["GROUP BY DEPT, ROLLUP(JOB)", "(DEPT, JOB), (DEPT)"], ["GROUP BY ROLLUP(DEPT, JOB)", "(DEPT, JOB), (DEPT), ()"]], hl: [0] } },
    { t: "[1단계] 결과", tb: { c: ["DEPT", "JOB", "SUM_SAL"], r: [[10, "CLERK", 100], [20, "CLERK", 350], [null, "CLERK", 450], [10, "MGR", 300], [30, "MGR", 500], [null, "MGR", 800]], hl: [2, 5] } },
    { t: "[2단계] 정리", tb: { c: ["행 수", "최댓값"], r: [[6, 800]] }, n: "전체 총계(1250) 행은 없다." }
  ],
  res: { c: ["행수", "최댓값"], r: [[6, 800]] },
  pg: "SELECT COUNT(*), MAX(SUM_SAL) FROM (SELECT DEPT, JOB, SUM(SAL) SUM_SAL FROM EMP GROUP BY ROLLUP (DEPT), JOB) X",
  ox: ["정답.", "GROUP BY DEPT, ROLLUP(JOB)처럼 부서별 소계(최대 500)가 생긴다고 본 경우다. 소계 기준은 ROLLUP 밖의 JOB이다.", "ROLLUP(DEPT, JOB)처럼 부서 소계와 총계가 모두 생긴다고 본 경우다.", "ROLLUP이면 항상 전체 총계가 붙는다고 보아 직무 소계 2행에 총계 1행을 더한 경우다."],
  trap: "ROLLUP 바깥에 쓴 컬럼은 모든 결과 행에 항상 값으로 남으므로 전체 총계가 생기지 않는다. 바깥 컬럼이 ROLLUP 앞에 있든 뒤에 있든 마찬가지다.",
  memo: "ROLLUP 밖 컬럼 = 항상 고정, 총계 없음"
},
{
  id: "S174", s: 2, tp: "grp", lv: 2, kill: true, sub: "그룹 함수",
  th: "2과목 | ROLLUP 총계 행의 COUNT · AVG와 NULL 측정값",
  q: "다음 SQL의 결과에서 총계 행(DEPT가 NULL인 행)의 C1, C2, AV 값으로 옳은 것은?",
  tb: [{ n: "SALES", c: ["DEPT", "AMT"], r: [["A", 100], ["A", null], ["B", 200], ["B", 300], ["B", null]] }],
  sql: "SELECT DEPT,\n       COUNT(AMT) AS C1,\n       COUNT(*)   AS C2,\n       AVG(AMT)   AS AV\n  FROM SALES\n GROUP BY ROLLUP (DEPT);",
  o: ["3, 5, 200", "5, 5, 120", "3, 5, 120", "3, 5, 175"],
  a: 0,
  why: "ROLLUP의 총계 행은 '부서 소계들을 다시 집계'한 것이 아니라 원본 전체 행을 대상으로 집계 함수를 다시 적용한 값이다. COUNT(AMT)는 NULL을 빼고 3, COUNT(*)는 행 수 5, AVG(AMT)는 NULL을 뺀 (100 + 200 + 300) ÷ 3 = 200이다.",
  st: [
    { t: "[원본] 부서별 값", tb: { c: ["DEPT", "AMT 값"], r: [["A", "100, NULL"], ["B", "200, 300, NULL"]] } },
    { t: "[1단계] ROLLUP 결과", tb: { c: ["DEPT", "C1", "C2", "AV"], r: [["A", 1, 2, 100], ["B", 2, 3, 250], [null, 3, 5, 200]], hl: [2] } },
    { t: "[2단계] 오답 계산 비교", tb: { c: ["계산 방식", "AV"], r: [["600 ÷ 3 (NULL 제외, 정답)", 200], ["600 ÷ 5 (NULL을 0으로)", 120], ["(100 + 250) ÷ 2 (평균의 평균)", 175]] } }
  ],
  res: { c: ["DEPT", "C1", "C2", "AV"], r: [["A", 1, 2, 100], ["B", 2, 3, 250], [null, 3, 5, 200]] },
  pg: "SELECT DEPT, COUNT(AMT), COUNT(*), AVG(AMT) FROM SALES GROUP BY ROLLUP (DEPT) ORDER BY GROUPING(DEPT), DEPT",
  ox: ["정답.", "집계 함수가 NULL을 0으로 보고 센다고 착각한 경우다.", "AVG의 분모를 COUNT(*)로 잡은 경우다. AVG는 NULL을 뺀 행 수로 나눈다.", "총계의 평균을 부서 평균(100, 250)의 평균으로 계산한 경우다."],
  trap: "총계 행의 AVG ≠ 소계 AVG들의 평균이다. 그룹 크기가 다르면 값이 달라진다. 총계는 항상 '원본 전체'에 집계 함수를 다시 적용한 결과다.",
  memo: "총계 = 원본 전체 재집계, AVG 분모는 NULL 제외"
},
{
  id: "S175", s: 2, tp: "hier", lv: 3, kill: true, sub: "계층형 질의와 셀프 조인",
  th: "2과목 | 루트가 여럿인 트리의 ORDER SIBLINGS BY DESC 출력 순서",
  q: "다음 SQL의 결과에서 4번째부터 7번째까지 출력되는 NM을 순서대로 나열한 것은?",
  tb: [{ n: "ORG", c: ["ID", "NM", "PID"], r: [[1, "ROOT", null], [2, "MKT", 1], [3, "DEV", 1], [4, "WEB", 3], [5, "APP", 3], [6, "ADS", 2], [7, "IOS", 5], [8, "OPS", null], [9, "NET", 8]] }],
  sql: "SELECT LEVEL, NM\n  FROM ORG\n START WITH PID IS NULL\nCONNECT BY PRIOR ID = PID\n ORDER SIBLINGS BY NM DESC;",
  o: ["DEV → WEB → APP → IOS", "DEV → NET → ADS → WEB", "DEV → APP → IOS → WEB", "NET → MKT → IOS → DEV"],
  a: 0,
  why: "START WITH PID IS NULL을 만족하는 ROOT와 OPS가 모두 루트가 되어 트리가 2개 생긴다. 계층형 질의는 깊이 우선(한 가지를 끝까지 내려간 뒤 다음 형제)으로 출력하고, ORDER SIBLINGS BY NM DESC는 루트끼리, 그리고 같은 부모를 둔 형제끼리만 이름 내림차순으로 정렬한다. 루트는 ROOT > OPS, ROOT의 자식은 MKT > DEV, DEV의 자식은 WEB > APP 순이다.",
  st: [
    { t: "[원본] 트리 구조 (형제는 이름 내림차순)", n: "ROOT\n├─ MKT\n│   └─ ADS\n└─ DEV\n    ├─ WEB\n    └─ APP\n        └─ IOS\nOPS\n└─ NET" },
    { t: "[1단계] 깊이 우선 출력", tb: { c: ["순서", "LEVEL", "NM"], r: [[1, 1, "ROOT"], [2, 2, "MKT"], [3, 3, "ADS"], [4, 2, "DEV"], [5, 3, "WEB"], [6, 3, "APP"], [7, 4, "IOS"], [8, 1, "OPS"], [9, 2, "NET"]], hl: [3, 4, 5, 6] } }
  ],
  res: { c: ["LEVEL", "NM"], r: [[1, "ROOT"], [2, "MKT"], [3, "ADS"], [2, "DEV"], [3, "WEB"], [3, "APP"], [4, "IOS"], [1, "OPS"], [2, "NET"]] },
  pg: "WITH RECURSIVE B AS (SELECT ID, NM, PID, ROW_NUMBER() OVER (PARTITION BY PID ORDER BY NM DESC) SN FROM ORG), H AS (SELECT ID, NM, 1 LV, ARRAY[SN] P FROM B WHERE PID IS NULL UNION ALL SELECT B.ID, B.NM, H.LV + 1, H.P || B.SN FROM B JOIN H ON B.PID = H.ID) SELECT LV, NM FROM H ORDER BY P",
  ox: ["정답.", "LEVEL별로 옆으로 훑는 너비 우선(ROOT, OPS, MKT, DEV, NET, …)으로 본 경우다.", "DESC를 무시하고 형제를 오름차순(OPS가 먼저, APP이 WEB보다 먼저)으로 정렬한 경우다.", "ORDER BY NM DESC처럼 계층을 무시하고 전체를 정렬한 경우다."],
  trap: "ORDER SIBLINGS BY가 없으면 형제 사이의 출력 순서는 보장되지 않는다. '부모 다음에 자식, 한 가지를 끝까지'라는 깊이 우선 원칙만 보장된다.",
  memo: "계층 출력 = 깊이 우선, SIBLINGS = 형제끼리만 정렬"
},
{
  id: "S176", s: 2, tp: "hier", lv: 3, kill: true, sub: "계층형 질의와 셀프 조인",
  th: "2과목 | START WITH가 조상·자손을 함께 지정할 때 (중복 전개)",
  q: "다음 SQL의 결과로 옳은 것은? (Lx:n은 LEVEL이 x인 행이 n개라는 뜻이다.)",
  tb: [{ n: "ORG", c: ["ID", "NM", "PID"], r: [[1, "ROOT", null], [2, "MKT", 1], [3, "DEV", 1], [4, "WEB", 3], [5, "APP", 3], [6, "ADS", 2], [7, "IOS", 5], [8, "OPS", null], [9, "NET", 8]] }],
  sql: "SELECT LEVEL AS LV, COUNT(*) AS CNT\n  FROM ORG\n START WITH NM IN ('ROOT', 'DEV')\nCONNECT BY PRIOR ID = PID\n GROUP BY LEVEL\n ORDER BY LEVEL;",
  o: ["L1:2, L2:4, L3:4, L4:1", "L1:1, L2:2, L3:3, L4:1", "L1:1, L2:3, L3:5, L4:2", "L1:2, L2:2, L3:3, L4:1"],
  a: 0,
  why: "START WITH를 만족하는 행마다 독립된 트리가 따로 전개된다. ROOT 트리(7행)에 DEV가 이미 들어 있어도, DEV 자신도 START WITH를 만족하므로 DEV를 루트(LEVEL 1)로 하는 트리(4행)가 한 번 더 만들어져 총 11행이 된다. LEVEL은 각 트리의 시작 행에서 1부터 다시 센다.",
  st: [
    { t: "[원본] 시작 행", tb: { c: ["시작 행", "전개되는 행"], r: [["ROOT", "ROOT, MKT, ADS, DEV, WEB, APP, IOS"], ["DEV", "DEV, WEB, APP, IOS"]] } },
    { t: "[1단계] 트리별 LEVEL", tb: { c: ["트리", "L1", "L2", "L3", "L4"], r: [["ROOT 트리", "ROOT", "MKT, DEV", "ADS, WEB, APP", "IOS"], ["DEV 트리", "DEV", "WEB, APP", "IOS", "—"]] } },
    { t: "[2단계] LEVEL별 건수", tb: { c: ["LV", "CNT"], r: [[1, 2], [2, 4], [3, 4], [4, 1]] }, n: "합계 11행 (DEV, WEB, APP, IOS가 두 번씩 나온다)" }
  ],
  res: { c: ["LV", "CNT"], r: [[1, 2], [2, 4], [3, 4], [4, 1]] },
  pg: "WITH RECURSIVE H AS (SELECT ID, 1 LV FROM ORG WHERE NM IN ('ROOT', 'DEV') UNION ALL SELECT O.ID, H.LV + 1 FROM ORG O JOIN H ON O.PID = H.ID) SELECT LV, COUNT(*) FROM H GROUP BY LV ORDER BY LV",
  ox: ["정답.", "이미 다른 트리에 포함된 DEV는 다시 전개되지 않는다고 보아 ROOT 트리 7행만 센 경우다.", "DEV 트리의 LEVEL이 원래 깊이(DEV = 2)를 유지한다고 본 경우다. LEVEL은 시작 행이 1이다.", "DEV 시작 행 하나만 추가되고 그 아래는 다시 전개되지 않는다고 본 경우다."],
  trap: "계층형 질의는 중복 행을 자동으로 제거하지 않는다. START WITH 조건이 한 트리 안의 여러 노드를 동시에 만족시키면 하위 트리가 중복 출력된다.",
  memo: "START WITH 만족 행마다 새 트리, LEVEL 1부터"
},
{
  id: "S177", s: 2, tp: "hier", lv: 3, kill: true, sub: "계층형 질의와 셀프 조인",
  th: "2과목 | CONNECT BY의 NM 조건 vs PRIOR NM 조건 vs WHERE",
  q: "다음 (가)~(다) SQL의 결과 행 수를 순서대로 나열한 것은?",
  tb: [{ n: "ORG", c: ["ID", "NM", "PID"], r: [[1, "ROOT", null], [2, "MKT", 1], [3, "DEV", 1], [4, "WEB", 3], [5, "APP", 3], [6, "ADS", 2], [7, "IOS", 5], [8, "OPS", null], [9, "NET", 8]] }],
  sql: "(가) SELECT NM FROM ORG\n     START WITH PID IS NULL\n   CONNECT BY PRIOR ID = PID AND NM <> 'DEV';\n\n(나) SELECT NM FROM ORG\n     START WITH PID IS NULL\n   CONNECT BY PRIOR ID = PID AND PRIOR NM <> 'DEV';\n\n(다) SELECT NM FROM ORG\n     WHERE NM <> 'DEV'\n     START WITH PID IS NULL\n   CONNECT BY PRIOR ID = PID;",
  o: ["5, 6, 8", "5, 5, 8", "8, 6, 5", "6, 5, 8"],
  a: 0,
  why: "CONNECT BY 조건은 '부모(PRIOR) → 자식' 연결을 허용할지 정한다. (가)의 NM <> 'DEV'는 자식 쪽 조건이라 DEV로 내려가는 연결이 막히고, DEV 아래 WEB, APP, IOS까지 도달할 수 없어 9 − 4 = 5행이다. (나)의 PRIOR NM <> 'DEV'는 부모 쪽 조건이라 DEV 자신은 연결되지만 DEV에서 자식으로 내려가는 연결이 막혀 WEB, APP, IOS만 빠진 6행이다. (다)의 WHERE는 전개가 끝난 9행에서 DEV 한 행만 걸러 8행이다.",
  st: [
    { t: "[원본] 전체 전개 9행", n: "ROOT\n├─ MKT\n│   └─ ADS\n└─ DEV\n    ├─ WEB\n    └─ APP\n        └─ IOS\nOPS\n└─ NET" },
    { t: "[1단계] 조건별 제외 행", tb: { c: ["SQL", "조건 위치", "제외되는 행", "행 수"], r: [["(가)", "CONNECT BY (자식 NM)", "DEV, WEB, APP, IOS", 5], ["(나)", "CONNECT BY (PRIOR = 부모 NM)", "WEB, APP, IOS", 6], ["(다)", "WHERE (전개 후 필터)", "DEV", 8]], hl: [1] } }
  ],
  res: { c: ["가", "나", "다"], r: [[5, 6, 8]] },
  pg: "WITH RECURSIVE A AS (SELECT ID, NM FROM ORG WHERE PID IS NULL UNION ALL SELECT O.ID, O.NM FROM ORG O JOIN A ON O.PID = A.ID AND O.NM <> 'DEV'), B AS (SELECT ID, NM FROM ORG WHERE PID IS NULL UNION ALL SELECT O.ID, O.NM FROM ORG O JOIN B ON O.PID = B.ID AND B.NM <> 'DEV'), C AS (SELECT ID, NM FROM ORG WHERE PID IS NULL UNION ALL SELECT O.ID, O.NM FROM ORG O JOIN C ON O.PID = C.ID) SELECT (SELECT COUNT(*) FROM A), (SELECT COUNT(*) FROM B), (SELECT COUNT(*) FROM C WHERE NM <> 'DEV')",
  ox: ["정답.", "PRIOR를 무시하고 (나)도 DEV 가지 전체가 잘린다고 본 경우다.", "CONNECT BY 조건과 WHERE 조건의 역할을 서로 바꾼 경우다.", "PRIOR가 붙은 쪽(부모)과 붙지 않은 쪽(자식)을 반대로 읽은 경우다."],
  trap: "CONNECT BY 조건은 START WITH로 고른 루트 행에는 적용되지 않는다. 루트를 거르려면 START WITH에, 결과 행 하나만 거르려면 WHERE에 쓴다.",
  memo: "CONNECT BY = 가지치기(아래 전부), WHERE = 그 행만"
},
{
  id: "S178", s: 2, tp: "hier", lv: 3, kill: true, sub: "계층형 질의와 셀프 조인",
  th: "2과목 | LEVEL별 노드 수와 CONNECT_BY_ISLEAF 합계",
  q: "다음 SQL의 결과로 옳은 것은? (각 항목은 LEVEL 1부터 차례로 CNT/LEAF를 나타낸다.)",
  tb: [{ n: "ORG", c: ["ID", "NM", "PID"], r: [[1, "ROOT", null], [2, "MKT", 1], [3, "DEV", 1], [4, "WEB", 3], [5, "APP", 3], [6, "ADS", 2], [7, "IOS", 5], [8, "OPS", null], [9, "NET", 8]] }],
  sql: "SELECT LEVEL AS LV,\n       COUNT(*) AS CNT,\n       SUM(CONNECT_BY_ISLEAF) AS LEAF\n  FROM ORG\n START WITH PID IS NULL\nCONNECT BY PRIOR ID = PID\n GROUP BY LEVEL\n ORDER BY LEVEL;",
  o: ["2/0, 3/1, 3/2, 1/1", "2/0, 3/0, 3/0, 1/1", "1/0, 2/0, 3/2, 1/1", "2/0, 3/1, 3/3, 1/1"],
  a: 0,
  why: "CONNECT_BY_ISLEAF는 그 행 아래로 더 전개되는 자식이 없으면 1이다. '가장 깊은 LEVEL'이 아니라 '자식이 없는 노드'라는 점이 핵심이다. 두 루트(ROOT, OPS)가 LEVEL 1이다. LEVEL 2의 NET은 OPS 트리의 끝이라 단말이다. LEVEL 3에서는 ADS, WEB이 단말이고 APP은 자식 IOS가 있어 단말이 아니다. LEVEL 4의 IOS는 단말이다.",
  st: [
    { t: "[원본] 트리", n: "ROOT (L1)\n├─ MKT (L2)\n│   └─ ADS (L3) ★\n└─ DEV (L2)\n    ├─ WEB (L3) ★\n    └─ APP (L3)\n        └─ IOS (L4) ★\nOPS (L1)\n└─ NET (L2) ★\n★ = CONNECT_BY_ISLEAF 1" },
    { t: "[1단계] LEVEL별 집계", tb: { c: ["LV", "노드", "CNT", "LEAF"], r: [[1, "ROOT, OPS", 2, 0], [2, "MKT, DEV, NET", 3, 1], [3, "ADS, WEB, APP", 3, 2], [4, "IOS", 1, 1]], hl: [1, 2] } }
  ],
  res: { c: ["LV", "CNT", "LEAF"], r: [[1, 2, 0], [2, 3, 1], [3, 3, 2], [4, 1, 1]] },
  pg: "WITH RECURSIVE H AS (SELECT ID, 1 LV FROM ORG WHERE PID IS NULL UNION ALL SELECT O.ID, H.LV + 1 FROM ORG O JOIN H ON O.PID = H.ID) SELECT LV, COUNT(*), SUM(CASE WHEN NOT EXISTS (SELECT 1 FROM ORG C WHERE C.PID = H.ID) THEN 1 ELSE 0 END) FROM H GROUP BY LV ORDER BY LV",
  ox: ["정답.", "가장 깊은 LEVEL(4)의 노드만 단말로 본 경우다. 얕은 곳에서 끝나는 NET, ADS, WEB도 단말이다.", "START WITH PID IS NULL을 만족하는 두 번째 루트 OPS(와 NET)를 빠뜨린 경우다.", "자식 IOS가 있는 APP까지 LEVEL 3의 단말로 센 경우다. 단말 여부는 깊이가 아니라 자식 유무로 정해진다."],
  trap: "단말 노드 수 = 전체 노드 수 − '자식을 가진 노드' 수로 검산할 수 있다. 여기서는 9 − 5(ROOT, MKT, DEV, APP, OPS) = 4다.",
  memo: "ISLEAF = 자식 없음(깊이와 무관)"
},
{
  id: "S179", s: 2, tp: "hier", lv: 2, kill: true, sub: "계층형 질의와 셀프 조인",
  th: "2과목 | 역방향 전개와 SYS_CONNECT_BY_PATH",
  q: "다음 SQL의 결과에서 NM이 'ROOT'인 행의 LV와 PATH 값으로 옳은 것은?",
  tb: [{ n: "ORG", c: ["ID", "NM", "PID"], r: [[1, "ROOT", null], [2, "MKT", 1], [3, "DEV", 1], [4, "WEB", 3], [5, "APP", 3], [6, "ADS", 2], [7, "IOS", 5], [8, "OPS", null], [9, "NET", 8]] }],
  sql: "SELECT LEVEL AS LV, NM,\n       SYS_CONNECT_BY_PATH(NM, '/') AS PATH\n  FROM ORG\n START WITH NM = 'IOS'\nCONNECT BY PRIOR PID = ID;",
  o: ["4, /IOS/APP/DEV/ROOT", "1, /ROOT/DEV/APP/IOS", "4, /ROOT/DEV/APP/IOS", "1, /IOS/APP/DEV/ROOT"],
  a: 0,
  why: "PRIOR PID = ID는 '이전 행의 PID를 ID로 가진 행', 즉 부모를 다음 행으로 찾는 역방향(Bottom-Up) 전개다. LEVEL은 방향과 관계없이 START WITH 행(IOS)이 1이고 한 단계 이동할 때마다 1씩 커진다. SYS_CONNECT_BY_PATH는 시작 행부터 현재 행까지 '전개된 순서대로' 값을 이어 붙이므로 IOS에서 출발한 경로가 된다.",
  st: [
    { t: "[원본] IOS에서 위로 올라가는 경로", n: "IOS → APP → DEV → ROOT" },
    { t: "[1단계] 전개 결과", tb: { c: ["LV", "NM", "PATH"], r: [[1, "IOS", "/IOS"], [2, "APP", "/IOS/APP"], [3, "DEV", "/IOS/APP/DEV"], [4, "ROOT", "/IOS/APP/DEV/ROOT"]], hl: [3] } }
  ],
  res: { c: ["LV", "NM", "PATH"], r: [[1, "IOS", "/IOS"], [2, "APP", "/IOS/APP"], [3, "DEV", "/IOS/APP/DEV"], [4, "ROOT", "/IOS/APP/DEV/ROOT"]] },
  pg: "WITH RECURSIVE H AS (SELECT ID, NM, PID, 1 LV, '/' || NM PATH FROM ORG WHERE NM = 'IOS' UNION ALL SELECT O.ID, O.NM, O.PID, H.LV + 1, H.PATH || '/' || O.NM FROM ORG O JOIN H ON O.ID = H.PID) SELECT LV, NM, PATH FROM H ORDER BY LV",
  ox: ["정답.", "LEVEL과 경로를 모두 실제 트리의 루트 기준으로 매긴 경우다.", "경로가 항상 최상위 노드부터 시작한다고 본 경우다. 경로는 전개 시작 행부터 쌓인다.", "역방향에서는 최상위 노드가 LEVEL 1이라고 본 경우다."],
  trap: "역방향 전개에서는 실제 최상위 노드(ROOT)가 더 올라갈 곳이 없으므로 CONNECT_BY_ISLEAF = 1이 된다. 단말 여부도 '전개 방향' 기준이다.",
  memo: "역방향: 시작 행 LEVEL 1, 경로도 시작 행부터"
},
{
  id: "S180", s: 2, tp: "hier", lv: 2, sub: "계층형 질의와 셀프 조인",
  th: "2과목 | 셀프 조인으로 부모·조부모 찾기 — 행 수",
  q: "다음 (가)~(다) SQL의 결과 건수를 순서대로 나열한 것은?",
  tb: [{ n: "ORG", c: ["ID", "NM", "PID"], r: [[1, "ROOT", null], [2, "MKT", 1], [3, "DEV", 1], [4, "WEB", 3], [5, "APP", 3], [6, "ADS", 2], [7, "IOS", 5], [8, "OPS", null], [9, "NET", 8]] }],
  sql: "(가) SELECT COUNT(*) FROM ORG C JOIN ORG P ON C.PID = P.ID;\n(나) SELECT COUNT(*) FROM ORG C LEFT OUTER JOIN ORG P ON C.PID = P.ID;\n(다) SELECT COUNT(*) FROM ORG C\n       JOIN ORG P ON C.PID = P.ID\n       JOIN ORG G ON P.PID = G.ID;",
  o: ["7, 9, 4", "7, 7, 4", "9, 9, 4", "7, 9, 3"],
  a: 0,
  why: "셀프 조인은 같은 테이블을 별칭으로 나눠 자식(C)과 부모(P)처럼 조인한다. (가) 내부 조인은 부모가 있는 행만 남으므로 PID가 NULL인 ROOT, OPS를 뺀 7건이다. (나) 왼쪽 아우터 조인은 부모가 없는 행도 P 쪽을 NULL로 채워 남기므로 9건이다. (다)는 부모의 부모(조부모)까지 있어야 하므로 ADS(→MKT→ROOT), WEB, APP(→DEV→ROOT), IOS(→APP→DEV)의 4건이다. NET은 부모 OPS의 PID가 NULL이라 빠진다.",
  st: [
    { t: "[원본] 각 행의 부모·조부모", tb: { c: ["NM", "부모", "조부모"], r: [["ROOT", "—", "—"], ["MKT", "ROOT", "—"], ["DEV", "ROOT", "—"], ["WEB", "DEV", "ROOT"], ["APP", "DEV", "ROOT"], ["ADS", "MKT", "ROOT"], ["IOS", "APP", "DEV"], ["OPS", "—", "—"], ["NET", "OPS", "—"]], hl: [3, 4, 5, 6] } },
    { t: "[1단계] 건수", tb: { c: ["SQL", "조건", "건수"], r: [["(가)", "부모 있음", 7], ["(나)", "모든 자식 행", 9], ["(다)", "조부모 있음", 4]] } }
  ],
  res: { c: ["가", "나", "다"], r: [[7, 9, 4]] },
  pg: "SELECT (SELECT COUNT(*) FROM ORG C JOIN ORG P ON C.PID = P.ID), (SELECT COUNT(*) FROM ORG C LEFT OUTER JOIN ORG P ON C.PID = P.ID), (SELECT COUNT(*) FROM ORG C JOIN ORG P ON C.PID = P.ID JOIN ORG G ON P.PID = G.ID)",
  ox: ["정답.", "아우터 조인도 부모 없는 행을 버린다고 본 경우다.", "내부 조인에서도 PID가 NULL인 행이 남는다고 본 경우다. NULL = 값은 참이 아니다.", "조부모의 조건을 '깊이가 정확히 3'으로 좁혀 IOS를 뺀 경우다. 조부모만 있으면 깊이와 상관없이 포함된다."],
  trap: "셀프 조인 방향을 바꿔 ON C.ID = P.PID로 쓰면 '각 부모에 대한 자식' 쌍이 된다. 건수는 같아도 의미(C, P의 역할)가 뒤바뀐다.",
  memo: "셀프 조인 내부 = 부모 있는 행만, 아우터 = 전부"
},
{
  id: "S181", s: 2, tp: "topn", lv: 3, kill: true, sub: "Top N 쿼리",
  th: "2과목 | 같은 블록의 ROWNUM과 ORDER BY — ROWNUM 값까지 읽기",
  q: "[T] 테이블의 행이 표에 적힌 순서(ID 1 → 5)대로 읽힌다고 할 때, 다음 SQL의 결과 (RN, ID)를 출력 순서대로 나열한 것은?",
  tb: [{ n: "T", c: ["ID", "SAL"], r: [[1, 300], [2, 500], [3, 100], [4, 400], [5, 200]] }],
  sql: "SELECT ROWNUM AS RN, ID, SAL\n  FROM T\n WHERE ROWNUM <= 3\n ORDER BY SAL DESC;",
  o: ["(2, 2), (1, 1), (3, 3)", "(1, 2), (2, 4), (3, 1)", "(1, 2), (2, 1), (3, 3)", "(2, 2), (4, 4), (1, 1)"],
  a: 0,
  why: "ROWNUM은 WHERE 절을 통과하는 순간 1, 2, 3 … 으로 붙는 번호이고, ORDER BY는 그 뒤에 실행된다. 그래서 먼저 읽힌 3행(ID 1, 2, 3)이 ROWNUM 1, 2, 3을 받은 채로 뽑히고, 그 3행만 SAL 내림차순으로 다시 정렬된다. 이미 붙은 ROWNUM 값은 정렬 후에도 바뀌지 않으므로 RN 열이 2, 1, 3처럼 뒤섞여 보인다.",
  st: [
    { t: "[원본] 읽히는 순서", tb: { c: ["읽은 순서", "ID", "SAL"], r: [[1, 1, 300], [2, 2, 500], [3, 3, 100], [4, 4, 400], [5, 5, 200]] } },
    { t: "[1단계] WHERE ROWNUM <= 3 (번호 부여와 동시에 필터)", tb: { c: ["RN", "ID", "SAL"], r: [[1, 1, 300], [2, 2, 500], [3, 3, 100]] }, n: "ID 4(400)는 4번째로 읽혀 탈락한다." },
    { t: "[2단계] ORDER BY SAL DESC (RN은 그대로)", tb: { c: ["RN", "ID", "SAL"], r: [[2, 2, 500], [1, 1, 300], [3, 3, 100]], hl: [0, 1, 2] } }
  ],
  res: { c: ["RN", "ID", "SAL"], r: [[2, 2, 500], [1, 1, 300], [3, 3, 100]] },
  pg: "SELECT RN, ID, SAL FROM (SELECT ROW_NUMBER() OVER (ORDER BY ID) RN, ID, SAL FROM T) X WHERE RN <= 3 ORDER BY SAL DESC",
  ox: ["정답.", "ORDER BY가 먼저 실행되어 급여 상위 3명을 뽑는다고 본 경우다. 그것은 인라인 뷰에서 정렬한 뒤 ROWNUM을 걸었을 때의 결과다.", "정렬한 뒤 ROWNUM이 1, 2, 3으로 다시 매겨진다고 본 경우다. ROWNUM은 한 번 붙으면 바뀌지 않는다.", "상위 3건을 정렬로 고른다고 보면서 RN은 읽힌 순서를 유지한다고 섞어 생각한 경우다. RN 4인 행은 WHERE ROWNUM <= 3을 통과할 수 없다."],
  trap: "Top-N은 반드시 'SELECT … FROM (SELECT … ORDER BY …) WHERE ROWNUM <= N' 형태로, 정렬을 인라인 뷰 안에서 끝낸 뒤 바깥에서 ROWNUM을 걸어야 한다.",
  memo: "ROWNUM(WHERE) → ORDER BY: 번호가 정렬보다 먼저"
},
{
  id: "S182", s: 2, tp: "topn", lv: 3, kill: true, sub: "Top N 쿼리",
  th: "2과목 | ROWNUM > n, ROWNUM BETWEEN과 별칭 RN의 차이",
  q: "5행이 들어 있는 [T] 테이블에 대해 (가)~(라) SQL의 결과 건수를 순서대로 나열한 것은?",
  tb: [{ n: "T", c: ["ID"], r: [[1], [2], [3], [4], [5]] }],
  sql: "(가) SELECT * FROM T WHERE ROWNUM > 3;\n(나) SELECT * FROM (SELECT ROWNUM AS RN, ID FROM T) WHERE RN > 3;\n(다) SELECT * FROM T WHERE ROWNUM BETWEEN 1 AND 3;\n(라) SELECT * FROM T WHERE ROWNUM BETWEEN 2 AND 3;",
  o: ["0, 2, 3, 0", "2, 2, 3, 2", "0, 0, 3, 0", "0, 2, 3, 2"],
  a: 0,
  why: "ROWNUM은 행이 WHERE 조건을 '통과해야' 다음 번호로 올라간다. 첫 행은 항상 ROWNUM 1로 평가되므로 ROWNUM > 3이나 ROWNUM BETWEEN 2 AND 3은 첫 행에서 거짓이 되고, 그 행이 버려지면 다음 행도 다시 1로 평가되어 영원히 통과하지 못한다(0건). 반면 (나)처럼 인라인 뷰에서 ROWNUM을 RN이라는 별칭의 일반 컬럼으로 굳혀 두면, 바깥 WHERE는 고정된 값 1~5를 비교하므로 RN 4, 5의 2건이 나온다.",
  st: [
    { t: "[원본] (가) WHERE ROWNUM > 3의 평가", tb: { c: ["읽은 행", "부여될 ROWNUM", "ROWNUM > 3", "결과"], r: [["ID 1", 1, "거짓", "버림 (번호 증가 없음)"], ["ID 2", 1, "거짓", "버림"], ["…", 1, "거짓", "버림"]] } },
    { t: "[1단계] (나) 인라인 뷰에서 번호 고정", tb: { c: ["RN", "ID", "RN > 3"], r: [[1, 1, "거짓"], [2, 2, "거짓"], [3, 3, "거짓"], [4, 4, "참"], [5, 5, "참"]], hl: [3, 4] } },
    { t: "[2단계] 정리", tb: { c: ["SQL", "건수", "이유"], r: [["(가)", 0, "1이 될 행이 없음"], ["(나)", 2, "RN은 고정값"], ["(다)", 3, "1부터 시작하므로 정상"], ["(라)", 0, "1을 포함하지 않음"]] } }
  ],
  ox: ["정답.", "ROWNUM을 미리 붙어 있는 고정 번호(ROW_NUMBER)처럼 본 경우다.", "인라인 뷰의 별칭 RN도 ROWNUM처럼 동작한다고 본 경우다. 별칭은 이미 계산된 고정값이다.", "BETWEEN 2 AND 3은 1을 포함하지 않아 (가)와 같은 이유로 0건이 된다는 점을 놓친 경우다."],
  trap: "ROWNUM 조건으로 쓸 수 있는 것은 '= 1', '<= N', '< N', 'BETWEEN 1 AND N'처럼 1을 포함하는 형태뿐이다. ROWNUM이 실제로 읽히는 물리 순서에 의존하므로 PostgreSQL에서는 같은 동작을 재현할 수 없어 DB 검증을 생략한다.",
  memo: "ROWNUM > n, = 2 → 0건 / 고정하려면 인라인 뷰 별칭"
},
{
  id: "S183", s: 2, tp: "topn", lv: 3, kill: true, sub: "Top N 쿼리",
  th: "2과목 | 페이징 — ROW_NUMBER · RANK · OFFSET FETCH 비교",
  q: "다음 (가)~(다) SQL이 반환하는 ID를 각각 나열한 것으로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "SAL"], r: [[1, 900], [2, 800], [3, 800], [4, 800], [5, 700], [6, 600], [7, 600], [8, 500]] }],
  sql: "(가) SELECT ID FROM\n      (SELECT ID, ROW_NUMBER() OVER (ORDER BY SAL DESC, ID) AS RN FROM T)\n     WHERE RN BETWEEN 4 AND 6;\n\n(나) SELECT ID FROM\n      (SELECT ID, RANK() OVER (ORDER BY SAL DESC) AS RK FROM T)\n     WHERE RK BETWEEN 4 AND 6;\n\n(다) SELECT ID FROM T\n     ORDER BY SAL DESC, ID\n    OFFSET 3 ROWS FETCH NEXT 3 ROWS ONLY;",
  o: ["(가) 4, 5, 6 / (나) 5, 6, 7 / (다) 4, 5, 6", "(가) 4, 5, 6 / (나) 4, 5, 6 / (다) 4, 5, 6", "(가) 4, 5, 6 / (나) 5, 6, 7 / (다) 3, 4, 5", "(가) 4, 5, 6 / (나) 6, 7, 8 / (다) 4, 5, 6"],
  a: 0,
  why: "(가) ROW_NUMBER는 동점이 있어도 1~8을 빠짐없이 매기므로 4~6번째인 ID 4, 5, 6이다. (다) OFFSET 3 ROWS는 앞의 3행을 '건너뛰고' 4번째 행부터 3행을 가져오므로 (가)와 같다. (나) RANK는 800 세 명이 공동 2위가 되고 다음 순위가 5로 건너뛰므로 RK 4인 행은 없고, 5위(ID 5)와 공동 6위(ID 6, 7)가 나온다.",
  st: [
    { t: "[원본] SAL 내림차순, ID 오름차순", tb: { c: ["ID", "SAL", "ROW_NUMBER", "RANK", "DENSE_RANK"], r: [[1, 900, 1, 1, 1], [2, 800, 2, 2, 2], [3, 800, 3, 2, 2], [4, 800, 4, 2, 2], [5, 700, 5, 5, 3], [6, 600, 6, 6, 4], [7, 600, 7, 6, 4], [8, 500, 8, 8, 5]] } },
    { t: "[1단계] 4 ~ 6 범위", tb: { c: ["SQL", "기준", "ID"], r: [["(가)", "ROW_NUMBER 4~6", "4, 5, 6"], ["(나)", "RANK 4~6", "5, 6, 7"], ["(다)", "3행 건너뛰고 3행", "4, 5, 6"]], hl: [1] } }
  ],
  res: { c: ["가", "나", "다"], r: [["4,5,6", "5,6,7", "4,5,6"]] },
  pg: "SELECT (SELECT STRING_AGG(ID::text, ',' ORDER BY ID) FROM (SELECT ID, ROW_NUMBER() OVER (ORDER BY SAL DESC, ID) RN FROM T) A WHERE RN BETWEEN 4 AND 6), (SELECT STRING_AGG(ID::text, ',' ORDER BY ID) FROM (SELECT ID, RANK() OVER (ORDER BY SAL DESC) RK FROM T) B WHERE RK BETWEEN 4 AND 6), (SELECT STRING_AGG(ID::text, ',' ORDER BY ID) FROM (SELECT ID FROM T ORDER BY SAL DESC, ID OFFSET 3 ROWS FETCH NEXT 3 ROWS ONLY) C)",
  ox: ["정답.", "RANK도 ROW_NUMBER처럼 동점 없이 순번을 매긴다고 본 경우다.", "OFFSET 3을 '3번째 행부터'로 읽은 경우다. OFFSET n은 n행을 건너뛴다.", "RANK를 DENSE_RANK(건너뛰지 않는 순위)로 착각한 경우다."],
  trap: "페이징에는 중복 없이 연속된 번호가 필요하므로 ROW_NUMBER를 쓰고, ORDER BY에 고유 컬럼(ID)을 더해 순서를 결정적으로 만들어야 한다. 그렇지 않으면 페이지 사이에서 행이 빠지거나 겹칠 수 있다.",
  memo: "페이징 = ROW_NUMBER 또는 OFFSET n(=n행 건너뜀)"
},
{
  id: "S184", s: 2, tp: "topn", lv: 3, kill: true, sub: "Top N 쿼리",
  th: "2과목 | FETCH FIRST — ROWS ONLY · WITH TIES · PERCENT",
  q: "다음 (가)~(다) SQL의 결과 건수를 순서대로 나열한 것은? (Oracle 12c 이상)",
  tb: [{ n: "T", c: ["ID", "SAL"], r: [[1, 900], [2, 800], [3, 800], [4, 700], [5, 700], [6, 700], [7, 600]] }],
  sql: "(가) SELECT ID FROM T ORDER BY SAL DESC\n     FETCH FIRST 4 ROWS ONLY;\n(나) SELECT ID FROM T ORDER BY SAL DESC\n     FETCH FIRST 4 ROWS WITH TIES;\n(다) SELECT ID FROM T ORDER BY SAL DESC\n     FETCH FIRST 30 PERCENT ROWS ONLY;",
  o: ["4, 6, 3", "4, 6, 2", "4, 4, 3", "6, 6, 3"],
  a: 0,
  why: "(가) ROWS ONLY는 정확히 4행에서 자른다. (나) WITH TIES는 마지막(4번째) 행과 ORDER BY 값이 같은 행을 모두 더한다. 4번째 행의 SAL은 700이고 700인 행이 ID 4, 5, 6의 세 개이므로 6행이 된다. (다) PERCENT는 전체 행 수의 비율로 자르며 소수점은 올림한다. 7 × 0.3 = 2.1 → 3행이다.",
  st: [
    { t: "[원본] SAL 내림차순", tb: { c: ["순서", "ID", "SAL"], r: [[1, 1, 900], [2, 2, 800], [3, 3, 800], [4, 4, 700], [5, 5, 700], [6, 6, 700], [7, 7, 600]], hl: [3] } },
    { t: "[1단계] 자르는 기준", tb: { c: ["SQL", "기준", "건수"], r: [["(가)", "4행", 4], ["(나)", "4행 + 4번째 값(700)과 같은 행", 6], ["(다)", "CEIL(7 × 30 ÷ 100) = CEIL(2.1)", 3]] } }
  ],
  res: { c: ["가", "나", "다"], r: [[4, 6, 3]] },
  pg: "SELECT (SELECT COUNT(*) FROM (SELECT ID FROM T ORDER BY SAL DESC FETCH FIRST 4 ROWS ONLY) A), (SELECT COUNT(*) FROM (SELECT ID FROM T ORDER BY SAL DESC FETCH FIRST 4 ROWS WITH TIES) B), (SELECT COUNT(*) FROM (SELECT ID FROM T ORDER BY SAL DESC LIMIT (SELECT CEIL(COUNT(*) * 30 / 100.0)::int FROM T)) C)",
  ox: ["정답.", "PERCENT의 행 수를 내림(2.1 → 2)한 경우다. Oracle은 올림한다.", "WITH TIES를 무시하거나, 4번째 행 뒤에 같은 값이 있는지 확인하지 않은 경우다.", "ROWS ONLY에도 동점 행이 붙는다고 본 경우다."],
  trap: "WITH TIES는 ORDER BY가 반드시 있어야 의미가 있고, 동점 비교 대상은 '마지막으로 잘린 행의 값' 하나뿐이다. 중간에 있는 동점(800, 800)은 결과 건수에 영향을 주지 않는다. PostgreSQL에는 PERCENT가 없어 LIMIT(올림 행 수)로 재현해 검증했다.",
  memo: "WITH TIES = 마지막 값 동점까지 / PERCENT = 올림"
},
{
  id: "S185", s: 2, tp: "topn", lv: 3, kill: true, sub: "Top N 쿼리",
  th: "2과목 | 인라인 뷰 안에서 ROWNUM과 ORDER BY를 함께 쓸 때",
  q: "[T] 테이블의 행이 표에 적힌 순서(ID 1 → 4)대로 읽힌다고 할 때, 다음 SQL이 출력하는 ID를 모두 고른 것은?",
  tb: [{ n: "T", c: ["ID", "SAL"], r: [[1, 300], [2, 500], [3, 100], [4, 400]] }],
  sql: "SELECT ID\n  FROM (SELECT ROWNUM AS RN, ID, SAL\n          FROM T\n         ORDER BY SAL DESC)\n WHERE RN <= 2;",
  o: ["2, 1", "2, 4", "오류가 발생한다", "결과가 없다"],
  a: 0,
  why: "인라인 뷰 안에서도 ROWNUM은 ORDER BY보다 먼저 붙는다. 읽힌 순서대로 ID 1 → RN 1, ID 2 → RN 2, ID 3 → RN 3, ID 4 → RN 4가 붙은 뒤 SAL 내림차순으로 정렬된다. 바깥 WHERE RN <= 2는 이미 고정된 RN 값으로 거르므로 RN 1, 2인 ID 1, 2가 남고, 정렬된 순서대로 ID 2(500), ID 1(300)이 출력된다. 급여 상위 2명(ID 2, 4)과 다르다.",
  st: [
    { t: "[원본] 읽은 순서로 ROWNUM 부여", tb: { c: ["RN", "ID", "SAL"], r: [[1, 1, 300], [2, 2, 500], [3, 3, 100], [4, 4, 400]] } },
    { t: "[1단계] 인라인 뷰 ORDER BY SAL DESC", tb: { c: ["RN", "ID", "SAL"], r: [[2, 2, 500], [4, 4, 400], [1, 1, 300], [3, 3, 100]] } },
    { t: "[2단계] 바깥 WHERE RN <= 2", tb: { c: ["ID"], r: [[2], [1]] } }
  ],
  res: { c: ["ID"], r: [[2], [1]] },
  pg: "SELECT ID FROM (SELECT ROW_NUMBER() OVER (ORDER BY ID) RN, ID, SAL FROM T) X WHERE RN <= 2 ORDER BY SAL DESC",
  ox: ["정답.", "인라인 뷰에서 정렬이 끝난 뒤 ROWNUM이 붙는다고 본 경우다. 그렇게 하려면 정렬용 인라인 뷰를 한 겹 더 감싸야 한다.", "인라인 뷰에는 ORDER BY를 쓸 수 없다고 착각한 경우다. Top-N을 위해 인라인 뷰의 ORDER BY는 허용된다.", "바깥의 RN을 ROWNUM처럼 다시 매기는 값으로 본 경우다. 별칭 RN은 고정값이라 정상적으로 걸러진다."],
  trap: "ROWNUM과 ORDER BY가 '같은 SELECT 블록'에 있으면 인라인 뷰 안이든 밖이든 정렬 전 번호다. 정렬은 안쪽 블록, ROWNUM은 바깥 블록에 두어야 Top-N이 된다.",
  memo: "같은 블록의 ROWNUM은 정렬 전 번호"
},
{
  id: "S186", s: 2, tp: "pivot", lv: 3, kill: true, sub: "PIVOT 절과 UNPIVOT 절",
  th: "2과목 | PIVOT의 암묵적 GROUP BY (나머지 컬럼 전부)",
  q: "다음 (가)의 결과 행 수, (나)의 결과 행 수, (나)에서 DEPT가 'B'인 행의 Q2 값을 순서대로 나열한 것은?",
  tb: [{ n: "SALES", c: ["ID", "DEPT", "QTR", "AMT"], r: [[1, "A", "Q1", 100], [2, "A", "Q1", 200], [3, "A", "Q2", 300], [4, "B", "Q1", 400]] }],
  sql: "(가) SELECT *\n      FROM SALES\n     PIVOT (SUM(AMT) FOR QTR IN ('Q1' AS Q1, 'Q2' AS Q2));\n\n(나) SELECT *\n      FROM (SELECT DEPT, QTR, AMT FROM SALES)\n     PIVOT (SUM(AMT) FOR QTR IN ('Q1' AS Q1, 'Q2' AS Q2));",
  o: ["4, 2, NULL", "2, 2, NULL", "4, 2, 0", "2, 2, 0"],
  a: 0,
  why: "PIVOT은 집계 함수에 쓴 컬럼(AMT)과 FOR 절의 컬럼(QTR)을 뺀 '나머지 모든 컬럼'으로 암묵적으로 GROUP BY한다. (가)는 나머지 컬럼이 ID, DEPT이고 ID가 행마다 다르므로 4행이 그대로 남는다. (나)는 인라인 뷰에서 ID를 뺐으므로 DEPT만으로 묶여 A, B의 2행이 된다. B 부서에는 Q2 데이터가 없으므로 그 칸은 0이 아니라 NULL이다.",
  st: [
    { t: "[원본] 그룹 기준 컬럼", tb: { c: ["SQL", "나머지 컬럼(그룹 기준)", "그룹 수"], r: [["(가)", "ID, DEPT", 4], ["(나)", "DEPT", 2]] } },
    { t: "[1단계] (가) 결과", tb: { c: ["ID", "DEPT", "Q1", "Q2"], r: [[1, "A", 100, null], [2, "A", 200, null], [3, "A", null, 300], [4, "B", 400, null]] } },
    { t: "[2단계] (나) 결과", tb: { c: ["DEPT", "Q1", "Q2"], r: [["A", 300, 300], ["B", 400, null]], hl: [1] } }
  ],
  res: { c: ["가_행수", "나_행수", "B_Q2"], r: [[4, 2, null]] },
  pg: "SELECT (SELECT COUNT(*) FROM (SELECT ID, DEPT, SUM(AMT) FILTER (WHERE QTR = 'Q1') Q1, SUM(AMT) FILTER (WHERE QTR = 'Q2') Q2 FROM SALES GROUP BY ID, DEPT) A), (SELECT COUNT(*) FROM (SELECT DEPT, SUM(AMT) FILTER (WHERE QTR = 'Q1') Q1, SUM(AMT) FILTER (WHERE QTR = 'Q2') Q2 FROM SALES GROUP BY DEPT) B), (SELECT SUM(AMT) FILTER (WHERE QTR = 'Q2') FROM SALES WHERE DEPT = 'B')",
  ox: ["정답.", "(가)도 DEPT로만 묶인다고 본 경우다. 테이블을 직접 PIVOT하면 ID까지 그룹 기준이 된다.", "데이터가 없는 칸을 0으로 채운다고 본 경우다.", "두 가지 함정(암묵적 그룹 기준, 빈 칸 NULL)에 모두 걸린 경우다."],
  trap: "PIVOT 문제에서는 먼저 FROM 절이 무엇인지 확인한다. 테이블을 바로 PIVOT하면 의도하지 않은 컬럼(ID, 날짜 등)까지 그룹 기준이 되어 행이 줄지 않는다.",
  memo: "PIVOT 그룹 기준 = 나머지 컬럼 전부 → 인라인 뷰로 골라라"
},
{
  id: "S187", s: 2, tp: "pivot", lv: 2, kill: true, sub: "PIVOT 절과 UNPIVOT 절",
  th: "2과목 | UNPIVOT 결과 행 수 — EXCLUDE NULLS vs INCLUDE NULLS",
  q: "다음 (가)의 결과 행 수, (나)의 결과 행 수, (가)의 결과에 나타나는 서로 다른 ID의 개수를 순서대로 나열한 것은?",
  tb: [{ n: "T", c: ["ID", "Q1", "Q2", "Q3"], r: [[1, 10, null, 30], [2, null, null, null], [3, 40, 50, null]] }],
  sql: "(가) SELECT ID, QTR, AMT\n      FROM T\n   UNPIVOT (AMT FOR QTR IN (Q1, Q2, Q3));\n\n(나) SELECT ID, QTR, AMT\n      FROM T\n   UNPIVOT INCLUDE NULLS (AMT FOR QTR IN (Q1, Q2, Q3));",
  o: ["4, 9, 2", "9, 9, 3", "4, 9, 3", "4, 4, 2"],
  a: 0,
  why: "UNPIVOT은 컬럼 Q1~Q3을 행으로 펼쳐 원본 1행당 최대 3행을 만든다. 기본값은 EXCLUDE NULLS라서 값이 NULL인 칸은 행으로 만들지 않는다. (가)는 ID 1에서 2행, ID 2에서 0행, ID 3에서 2행으로 4행이고, 모든 값이 NULL인 ID 2는 결과에서 사라진다. (나) INCLUDE NULLS는 NULL 칸도 행으로 만들어 3 × 3 = 9행이다.",
  st: [
    { t: "[원본] NULL이 아닌 칸 수", tb: { c: ["ID", "Q1", "Q2", "Q3", "NULL 아닌 칸"], r: [[1, 10, null, 30, 2], [2, null, null, null, 0], [3, 40, 50, null, 2]] } },
    { t: "[1단계] (가) EXCLUDE NULLS 결과", tb: { c: ["ID", "QTR", "AMT"], r: [[1, "Q1", 10], [1, "Q3", 30], [3, "Q1", 40], [3, "Q2", 50]] }, n: "ID 2는 한 행도 남지 않는다." },
    { t: "[2단계] 정리", tb: { c: ["SQL", "행 수", "서로 다른 ID"], r: [["(가)", 4, 2], ["(나)", 9, 3]] } }
  ],
  res: { c: ["가_행수", "나_행수", "가_ID수"], r: [[4, 9, 2]] },
  pg: "SELECT (SELECT COUNT(*) FROM T CROSS JOIN LATERAL (VALUES ('Q1', T.Q1), ('Q2', T.Q2), ('Q3', T.Q3)) U(QTR, AMT) WHERE U.AMT IS NOT NULL), (SELECT COUNT(*) FROM T CROSS JOIN LATERAL (VALUES ('Q1', T.Q1), ('Q2', T.Q2), ('Q3', T.Q3)) U(QTR, AMT)), (SELECT COUNT(DISTINCT T.ID) FROM T CROSS JOIN LATERAL (VALUES ('Q1', T.Q1), ('Q2', T.Q2), ('Q3', T.Q3)) U(QTR, AMT) WHERE U.AMT IS NOT NULL)",
  ox: ["정답.", "UNPIVOT의 기본값이 INCLUDE NULLS라고 본 경우다.", "값이 모두 NULL인 ID 2도 최소 한 행은 남는다고 본 경우다.", "INCLUDE NULLS를 써도 NULL 칸이 제외된다고 본 경우다."],
  trap: "UNPIVOT 결과에서 특정 원본 행이 통째로 사라질 수 있다는 점이 함정이다. 원본 행 수를 유지해야 하면 INCLUDE NULLS를 명시한다.",
  memo: "UNPIVOT 기본 = EXCLUDE NULLS"
},
{
  id: "S188", s: 2, tp: "regex", lv: 3, kill: true, sub: "정규 표현식",
  th: "2과목 | REGEXP_SUBSTR — 탐욕적(.*) vs 비탐욕적(.*?) 매칭과 occurrence",
  q: "다음 SQL의 결과 (가), (나), (다)로 옳은 것은?",
  sql: "SELECT REGEXP_SUBSTR('<x><yz><w>', '<.*>')           AS 가,\n       REGEXP_SUBSTR('<x><yz><w>', '<.*?>', 1, 2)    AS 나,\n       REGEXP_SUBSTR('<x><yz><w>', '<[^>]+>', 1, 3)  AS 다\n  FROM DUAL;",
  o: ["<x><yz><w> / <yz> / <w>", "<x> / <yz> / <w>", "<x><yz><w> / NULL / <w>", "<x><yz><w> / <x> / <w>"],
  a: 0,
  why: "* 와 + 는 기본적으로 탐욕적(greedy)이라 가능한 한 길게 매칭한다. (가)의 '<.*>'는 첫 '<'에서 시작해 마지막 '>'까지 문자열 전체를 가져간다. 수량자 뒤에 ?를 붙인 '.*?'는 비탐욕적(non-greedy)이라 가장 짧게 끊으므로 '<x>', '<yz>', '<w>'가 차례로 매칭되고, 네 번째 인수 2(occurrence)에 따라 두 번째인 '<yz>'가 반환된다. (다)의 '[^>]+'는 '>'가 아닌 문자만 허용하므로 태그 하나씩 끊기고, 세 번째 매칭은 '<w>'다.",
  st: [
    { t: "[원본] 문자열", n: "<x><yz><w>" },
    { t: "[1단계] 패턴별 매칭 목록", tb: { c: ["SQL", "패턴", "매칭 1", "매칭 2", "매칭 3"], r: [["가", "<.*>", "<x><yz><w>", "—", "—"], ["나", "<.*?>", "<x>", "<yz>", "<w>"], ["다", "<[^>]+>", "<x>", "<yz>", "<w>"]] } },
    { t: "[2단계] occurrence 적용", tb: { c: ["SQL", "occurrence", "결과"], r: [["가", "1 (생략)", "<x><yz><w>"], ["나", 2, "<yz>"], ["다", 3, "<w>"]], hl: [1] } }
  ],
  res: { c: ["가", "나", "다"], r: [["<x><yz><w>", "<yz>", "<w>"]] },
  pg: "SELECT REGEXP_SUBSTR('<x><yz><w>', '<.*>'), REGEXP_SUBSTR('<x><yz><w>', '<.*?>', 1, 2), REGEXP_SUBSTR('<x><yz><w>', '<[^>]+>', 1, 3)",
  ox: ["정답.", "'.*'가 첫 번째 '>'에서 멈춘다고 본 경우다. 탐욕적 수량자는 마지막 '>'까지 간다.", "'?'를 무시하고 (나)도 탐욕적으로 매칭해 두 번째 매칭이 없다고 본 경우다.", "occurrence 인수 2를 무시하고 첫 번째 매칭을 반환한다고 본 경우다."],
  trap: "REGEXP_SUBSTR(문자열, 패턴, 시작위치, occurrence)에서 세 번째 인수는 '몇 번째 글자부터 찾을지', 네 번째 인수는 '몇 번째 매칭을 가져올지'다. 둘을 바꿔 읽기 쉽다.",
  memo: ".* 탐욕(최대) / .*? 비탐욕(최소)"
},
{
  id: "S189", s: 2, tp: "regex", lv: 3, kill: true, sub: "정규 표현식",
  th: "2과목 | REGEXP_REPLACE — 역참조(\\1, \\2)와 전체 치환",
  q: "다음 SQL의 결과 (가), (나), (다)로 옳은 것은?",
  sql: "SELECT REGEXP_REPLACE('2026-10-04',\n         '([0-9]{4})-([0-9]{2})-([0-9]{2})', '\\3/\\2/\\1')   AS 가,\n       REGEXP_REPLACE('010-1234-5678',\n         '([0-9]+)-([0-9]+)-([0-9]+)', '\\1-****-\\3')        AS 나,\n       REGEXP_REPLACE('ab12cd34', '[0-9]', '#')              AS 다\n  FROM DUAL;",
  o: ["04/10/2026 / 010-****-5678 / ab##cd##", "2026/10/04 / 010-****-5678 / ab##cd##", "04/10/2026 / 010-****-5678 / ab#2cd34", "04/10/2026 / 010-****-5678 / ab#cd#"],
  a: 0,
  why: "괄호로 묶은 부분은 왼쪽 여는 괄호 순서대로 1, 2, 3번 그룹이 되고, 바꿀 문자열에서 \\1, \\2, \\3으로 다시 불러 쓸 수 있다(역참조). (가)는 연(\\1)·월(\\2)·일(\\3)을 \\3/\\2/\\1 순서로 재배열해 '04/10/2026'이 된다. (나)는 가운데 그룹만 ****로 바꾼다. (다)처럼 occurrence를 생략하면 Oracle REGEXP_REPLACE는 매칭되는 모든 곳을 바꾼다. 패턴 [0-9]는 숫자 한 글자이므로 숫자 4개가 각각 #이 된다.",
  st: [
    { t: "[원본] (가) 그룹 분해", tb: { c: ["그룹", "패턴", "값"], r: [["\\1", "([0-9]{4})", "2026"], ["\\2", "([0-9]{2})", "10"], ["\\3", "([0-9]{2})", "04"]] } },
    { t: "[1단계] 치환 결과", tb: { c: ["SQL", "치환 규칙", "결과"], r: [["가", "\\3/\\2/\\1", "04/10/2026"], ["나", "\\1-****-\\3", "010-****-5678"], ["다", "숫자 한 글자마다 #", "ab##cd##"]], hl: [2] } }
  ],
  res: { c: ["가", "나", "다"], r: [["04/10/2026", "010-****-5678", "ab##cd##"]] },
  pg: "SELECT REGEXP_REPLACE('2026-10-04', '([0-9]{4})-([0-9]{2})-([0-9]{2})', '\\3/\\2/\\1'), REGEXP_REPLACE('010-1234-5678', '([0-9]+)-([0-9]+)-([0-9]+)', '\\1-****-\\3'), REGEXP_REPLACE('ab12cd34', '[0-9]', '#', 'g')",
  ox: ["정답.", "역참조 번호와 상관없이 원래 순서대로 이어 붙인다고 본 경우다.", "REGEXP_REPLACE가 첫 번째 매칭만 바꾼다고 본 경우다. Oracle은 기본이 전체 치환이다(PostgreSQL은 'g' 플래그가 필요해 검증 SQL에 붙였다).", "[0-9]를 [0-9]+처럼 연속된 숫자 덩어리 하나로 본 경우다."],
  trap: "Oracle REGEXP_REPLACE의 다섯 번째 인수 occurrence가 0(기본값)이면 전체, 1이면 첫 번째 매칭만 바꾼다. 문제에 인수가 몇 개인지 반드시 세어 보자.",
  memo: "\\n = n번째 괄호, REGEXP_REPLACE 기본 = 전부 치환"
},
{
  id: "S190", s: 2, tp: "regex", lv: 3, kill: true, sub: "정규 표현식",
  th: "2과목 | REGEXP_COUNT — 겹치는 매칭은 세지 않는다 · 'i' 옵션",
  q: "다음 SQL의 결과 (가), (나), (다)로 옳은 것은?",
  sql: "SELECT REGEXP_COUNT('aaaa', 'aa')              AS 가,\n       REGEXP_COUNT('banana', 'ana')           AS 나,\n       REGEXP_COUNT('AbcABC', 'abc', 1, 'i')   AS 다\n  FROM DUAL;",
  o: ["2, 1, 2", "3, 2, 2", "2, 1, 0", "3, 2, 0"],
  a: 0,
  why: "REGEXP_COUNT는 매칭을 찾으면 그 매칭이 끝난 다음 위치부터 다시 검색한다. 그래서 겹치는(overlapping) 매칭은 세지 않는다. 'aaaa'에서 'aa'는 1~2번째, 3~4번째 글자로 2번이다. 'banana'에서 'ana'는 2~4번째 글자에서 한 번 매칭된 뒤 5번째 글자부터 'na'만 남아 1번이다. 네 번째 인수 'i'는 대소문자를 구분하지 않는 옵션이라 'Abc', 'ABC'가 모두 'abc'와 매칭되어 2번이다.",
  st: [
    { t: "[원본] 매칭 위치 추적", tb: { c: ["SQL", "문자열", "매칭 위치", "다음 검색 시작"], r: [["가", "aaaa", "1~2, 3~4", "3, 5"], ["나", "banana", "2~4", "5 ('na'뿐)"], ["다", "AbcABC", "1~3, 4~6 ('i')", "4, 7"]] } },
    { t: "[1단계] 결과", tb: { c: ["가", "나", "다"], r: [[2, 1, 2]] } }
  ],
  res: { c: ["가", "나", "다"], r: [[2, 1, 2]] },
  pg: "SELECT REGEXP_COUNT('aaaa', 'aa'), REGEXP_COUNT('banana', 'ana'), REGEXP_COUNT('AbcABC', 'abc', 1, 'i')",
  ox: ["정답.", "매칭이 겹쳐도 한 글자씩 옮겨 가며 센다고 본 경우다(aaaa → 3, banana → 2).", "'i' 옵션을 무시하고 대소문자를 구분해 0으로 본 경우다.", "겹침 계산과 'i' 옵션을 모두 잘못 처리한 경우다."],
  trap: "REGEXP_COUNT의 세 번째 인수는 시작 위치, 네 번째 인수는 매칭 옵션('i' 대소문자 무시, 'c' 구분, 'n' 점이 줄바꿈과 매칭, 'm' 여러 줄)이다.",
  memo: "REGEXP_COUNT = 겹침 없이, 'i' = 대소문자 무시"
},
{
  id: "S191", s: 2, tp: "dml", lv: 3, kill: true, sub: "DML",
  th: "2과목 | MERGE의 ON 조건과 NULL 키 — NULL끼리는 MATCHED가 아니다",
  q: "다음 MERGE 문을 실행한 뒤 [TGT] 테이블의 내용으로 옳은 것은?",
  tb: [
    { n: "TGT", c: ["ID", "V"], r: [[1, "a"], [null, "b"]] },
    { n: "SRC", c: ["ID", "V"], r: [[1, "x"], [null, "y"], [2, "z"]] }
  ],
  sql: "MERGE INTO TGT T\nUSING SRC S\n   ON (T.ID = S.ID)\n WHEN MATCHED THEN\n      UPDATE SET T.V = S.V\n WHEN NOT MATCHED THEN\n      INSERT (ID, V) VALUES (S.ID, S.V);",
  o: ["(1, x), (2, z), (NULL, b), (NULL, y)", "(1, x), (2, z), (NULL, y)", "(1, x), (2, z), (NULL, b)", "ON 조건 컬럼에 NULL이 있어 오류가 발생한다"],
  a: 0,
  why: "MERGE는 SRC의 각 행에 대해 ON 조건이 '참'인 TGT 행이 있으면 MATCHED, 없으면 NOT MATCHED로 처리한다. SRC의 (NULL, y)는 T.ID = NULL 비교가 UNKNOWN이라 TGT의 (NULL, b)와도 짝이 되지 않으므로 NOT MATCHED가 되어 새 행으로 INSERT된다. TGT의 (NULL, b)는 어떤 SRC 행과도 매칭되지 않아 그대로 남는다. 결국 NULL 키 행이 2개가 된다.",
  st: [
    { t: "[원본] SRC 행별 ON 조건 평가", tb: { c: ["SRC 행", "T.ID = S.ID가 참인 TGT 행", "판정", "동작"], r: [["(1, x)", "(1, a)", "MATCHED", "UPDATE → (1, x)"], ["(NULL, y)", "없음 (NULL = NULL은 UNKNOWN)", "NOT MATCHED", "INSERT (NULL, y)"], ["(2, z)", "없음", "NOT MATCHED", "INSERT (2, z)"]], hl: [1] } },
    { t: "[1단계] 최종 TGT", tb: { c: ["ID", "V"], r: [[1, "x"], [2, "z"], [null, "b"], [null, "y"]] } }
  ],
  res: { c: ["ID", "V"], r: [[1, "x"], [2, "z"], [null, "b"], [null, "y"]] },
  pg: "MERGE INTO TGT T USING SRC S ON (T.ID = S.ID) WHEN MATCHED THEN UPDATE SET V = S.V WHEN NOT MATCHED THEN INSERT (ID, V) VALUES (S.ID, S.V); SELECT ID, V FROM TGT ORDER BY ID NULLS LAST, V",
  ox: ["정답.", "NULL끼리 같다고 보아 (NULL, b)가 (NULL, y)로 UPDATE된다고 본 경우다.", "NULL 키를 가진 SRC 행은 MERGE에서 무시된다고 본 경우다. 매칭이 안 될 뿐 NOT MATCHED로 INSERT된다.", "NULL 비교는 오류가 아니라 UNKNOWN(거짓 취급)일 뿐이다."],
  trap: "ON 조건의 키에 NULL이 들어 있으면 MERGE를 반복 실행할 때마다 NULL 키 행이 계속 INSERT된다. NULL끼리 맞추려면 NVL 등으로 치환하거나 키에 NOT NULL 제약을 둔다.",
  memo: "MERGE ON에서 NULL = NULL은 NOT MATCHED → INSERT"
},
{
  id: "S192", s: 2, tp: "dml", lv: 3, kill: true, sub: "DML",
  th: "2과목 | 상관 서브쿼리 UPDATE — 짝 없는 행은 NULL로 덮어쓴다",
  q: "다음 UPDATE 문을 실행한 뒤 [EMP] 테이블의 DNAME 값을 ID 순서대로 나열한 것은?",
  tb: [
    { n: "EMP", c: ["ID", "DEPTNO", "DNAME"], r: [[1, 10, "OLD"], [2, 20, "OLD"], [3, 30, "OLD"]] },
    { n: "DEPT", c: ["DEPTNO", "DNAME"], r: [[10, "SALES"], [20, "DEV"]] }
  ],
  sql: "UPDATE EMP E\n   SET DNAME = (SELECT D.DNAME\n                  FROM DEPT D\n                 WHERE D.DEPTNO = E.DEPTNO);",
  o: ["SALES, DEV, NULL", "SALES, DEV, OLD", "오류가 발생하여 아무 행도 바뀌지 않는다", "SALES, DEV (ID 3 행은 삭제된다)"],
  a: 0,
  why: "WHERE 절이 없는 UPDATE는 EMP의 모든 행을 갱신한다. 각 행마다 SET 절의 스칼라 서브쿼리가 실행되는데, ID 3(DEPTNO 30)은 DEPT에 짝이 없어 서브쿼리가 0행을 돌려준다. 스칼라 서브쿼리의 결과가 0행이면 오류가 아니라 NULL이므로, ID 3의 DNAME은 'OLD'를 잃고 NULL로 덮어써진다.",
  st: [
    { t: "[원본] 행별 서브쿼리 결과", tb: { c: ["ID", "DEPTNO", "서브쿼리 결과", "새 DNAME"], r: [[1, 10, "SALES", "SALES"], [2, 20, "DEV", "DEV"], [3, 30, "0행 → NULL", null]], hl: [2] } },
    { t: "[1단계] 짝 있는 행만 바꾸려면", n: "UPDATE EMP E SET DNAME = (…)\n WHERE EXISTS (SELECT 1 FROM DEPT D WHERE D.DEPTNO = E.DEPTNO);\n→ ID 3은 갱신 대상에서 빠져 'OLD'가 유지된다." }
  ],
  res: { c: ["ID", "DNAME"], r: [[1, "SALES"], [2, "DEV"], [3, null]] },
  pg: "UPDATE EMP E SET DNAME = (SELECT D.DNAME FROM DEPT D WHERE D.DEPTNO = E.DEPTNO); SELECT ID, DNAME FROM EMP ORDER BY ID",
  ox: ["정답.", "짝이 없으면 갱신하지 않고 넘어간다고 본 경우다. WHERE 절이 없으면 모든 행이 갱신 대상이다.", "서브쿼리 결과가 0행이면 오류라고 본 경우다. 오류(ORA-01427)는 2행 이상일 때다.", "UPDATE가 행을 삭제한다고 본 경우다. UPDATE는 행 수를 바꾸지 않는다."],
  trap: "'다른 테이블 값으로 갱신' 문제는 WHERE EXISTS(또는 MERGE)를 함께 써야 의도한 행만 바뀐다. 실무에서도 기존 값이 NULL로 지워지는 대표적인 사고 유형이다.",
  memo: "상관 UPDATE에 짝 없음 → NULL로 덮어씀"
},
{
  id: "S193", s: 2, tp: "dml", lv: 3, kill: true, sub: "DML",
  th: "2과목 | 서브쿼리 DELETE와 NULL — NOT IN · NOT EXISTS · IN",
  q: "[T], [S] 테이블이 다음과 같을 때, 원래 상태의 [T]에 (가)~(다)를 각각 실행하면 삭제되는 행 수를 순서대로 나열한 것은?",
  tb: [
    { n: "T", c: ["ID"], r: [[1], [2], [3], [null]] },
    { n: "S", c: ["ID"], r: [[1], [null]] }
  ],
  sql: "(가) DELETE FROM T WHERE ID NOT IN (SELECT ID FROM S);\n(나) DELETE FROM T\n     WHERE NOT EXISTS (SELECT 1 FROM S WHERE S.ID = T.ID);\n(다) DELETE FROM T WHERE ID IN (SELECT ID FROM S);",
  o: ["0, 3, 1", "2, 2, 1", "0, 2, 1", "2, 3, 2"],
  a: 0,
  why: "(가) ID NOT IN (1, NULL)은 ID <> 1 AND ID <> NULL로 풀리고, ID <> NULL은 항상 UNKNOWN이므로 어떤 행도 참이 되지 않아 0건이다. (나) NOT EXISTS는 '같은 값을 가진 S 행이 없으면' 삭제한다. 2, 3은 짝이 없고, T의 NULL 행도 S.ID = NULL이 참이 될 수 없어 짝이 없으므로 3건이 삭제된다. (다) ID IN (1, NULL)은 ID = 1 OR ID = NULL이라 1만 참이 되어 1건이다.",
  st: [
    { t: "[원본] T 행별 판정", tb: { c: ["T.ID", "NOT IN (1, NULL)", "NOT EXISTS", "IN (1, NULL)"], r: [[1, "거짓", "거짓(짝 1)", "참"], [2, "UNKNOWN", "참", "UNKNOWN"], [3, "UNKNOWN", "참", "UNKNOWN"], [null, "UNKNOWN", "참", "UNKNOWN"]] } },
    { t: "[1단계] 삭제 건수", tb: { c: ["SQL", "삭제 행", "건수"], r: [["(가)", "없음", 0], ["(나)", "2, 3, NULL", 3], ["(다)", "1", 1]], hl: [0, 1] } }
  ],
  pgSetup: "CREATE TABLE T1 AS SELECT * FROM T; CREATE TABLE T2 AS SELECT * FROM T; CREATE TABLE T3 AS SELECT * FROM T;",
  res: { c: ["가", "나", "다"], r: [[0, 3, 1]] },
  pg: "WITH A AS (DELETE FROM T1 WHERE ID NOT IN (SELECT ID FROM S) RETURNING 1), B AS (DELETE FROM T2 WHERE NOT EXISTS (SELECT 1 FROM S WHERE S.ID = T2.ID) RETURNING 1), C AS (DELETE FROM T3 WHERE ID IN (SELECT ID FROM S) RETURNING 1) SELECT (SELECT COUNT(*) FROM A), (SELECT COUNT(*) FROM B), (SELECT COUNT(*) FROM C)",
  ox: ["정답.", "서브쿼리의 NULL을 무시하고 (가)를 2건으로, T의 NULL 행은 (나)에서 지워지지 않는다고 본 경우다.", "(가)는 맞혔지만 T의 NULL 행이 NOT EXISTS로 삭제된다는 점을 놓친 경우다.", "(가)에서는 서브쿼리의 NULL을 무시해 2, 3을 지우고, (다)에서는 NULL = NULL을 참으로 보아 T의 NULL 행까지 지운다고 본 경우다."],
  trap: "NOT IN과 NOT EXISTS는 서브쿼리나 비교 컬럼에 NULL이 있으면 결과가 다르다. NOT IN의 서브쿼리에 NULL이 하나라도 있으면 결과는 항상 공집합이다.",
  memo: "NOT IN + NULL = 0건, NOT EXISTS는 NULL 행도 삭제"
},
{
  id: "S194", s: 2, tp: "dml", lv: 2, kill: true, sub: "DML",
  th: "2과목 | INSERT와 제약조건 — UNIQUE의 다중 NULL, CHECK의 NULL 통과",
  q: "다음 SQL을 순서대로 실행했을 때(오류가 난 문장은 그 문장만 취소되고 다음 문장이 계속 실행된다), 마지막 COMMIT 후 [M] 테이블의 행 수는?",
  sql: "CREATE TABLE M (\n  ID    NUMBER PRIMARY KEY,\n  EMAIL VARCHAR2(20) UNIQUE,\n  AGE   NUMBER CHECK (AGE >= 20)\n);\nINSERT INTO M VALUES (1, 'a@x', 25);    -- ①\nINSERT INTO M VALUES (2, NULL, NULL);   -- ②\nINSERT INTO M VALUES (3, NULL, 15);     -- ③\nINSERT INTO M VALUES (4, NULL, NULL);   -- ④\nINSERT INTO M VALUES (5, 'a@x', 30);    -- ⑤\nINSERT INTO M VALUES (NULL, 'b@x', 30); -- ⑥\nINSERT INTO M VALUES (6, 'b@x', NULL);  -- ⑦\nCOMMIT;",
  o: ["1", "3", "4", "5"],
  a: 2,
  why: "UNIQUE는 NULL이 아닌 값끼리만 중복을 검사하므로 EMAIL이 NULL인 행은 여러 개 들어갈 수 있다(②, ④). CHECK 제약은 조건이 '거짓'일 때만 거부하고 NULL 비교로 UNKNOWN이 되면 통과시킨다(②, ④, ⑦). 실패하는 것은 AGE 15로 CHECK가 거짓인 ③, 'a@x' 중복인 ⑤, PK에 NULL을 넣은 ⑥이다. 남는 행은 ①, ②, ④, ⑦의 4행이다.",
  st: [
    { t: "[원본] 문장별 판정", tb: { c: ["문장", "PK", "UNIQUE(EMAIL)", "CHECK(AGE >= 20)", "결과"], r: [["①", "통과", "통과", "25 → 참", "성공"], ["②", "통과", "NULL → 통과", "NULL → UNKNOWN 통과", "성공"], ["③", "통과", "NULL → 통과", "15 → 거짓", "실패"], ["④", "통과", "NULL 중복도 통과", "UNKNOWN 통과", "성공"], ["⑤", "통과", "'a@x' 중복", "참", "실패"], ["⑥", "NULL 불가", "통과", "참", "실패"], ["⑦", "통과", "통과", "UNKNOWN 통과", "성공"]], hl: [1, 3, 6] } }
  ],
  pgSetup: "CREATE TABLE M (ID numeric PRIMARY KEY, EMAIL text UNIQUE, AGE numeric CHECK (AGE >= 20));",
  res: { c: ["CNT"], r: [[4]] },
  pg: "DO $$ BEGIN INSERT INTO M VALUES (1, 'a@x', 25); EXCEPTION WHEN OTHERS THEN NULL; END $$; DO $$ BEGIN INSERT INTO M VALUES (2, NULL, NULL); EXCEPTION WHEN OTHERS THEN NULL; END $$; DO $$ BEGIN INSERT INTO M VALUES (3, NULL, 15); EXCEPTION WHEN OTHERS THEN NULL; END $$; DO $$ BEGIN INSERT INTO M VALUES (4, NULL, NULL); EXCEPTION WHEN OTHERS THEN NULL; END $$; DO $$ BEGIN INSERT INTO M VALUES (5, 'a@x', 30); EXCEPTION WHEN OTHERS THEN NULL; END $$; DO $$ BEGIN INSERT INTO M VALUES (NULL, 'b@x', 30); EXCEPTION WHEN OTHERS THEN NULL; END $$; DO $$ BEGIN INSERT INTO M VALUES (6, 'b@x', NULL); EXCEPTION WHEN OTHERS THEN NULL; END $$; SELECT COUNT(*) FROM M",
  ox: ["CHECK가 NULL도 거부한다고 보아 ②, ④, ⑦까지 실패로 센 경우다.", "UNIQUE 컬럼에 NULL은 하나만 들어갈 수 있다고 보아 ④를 실패로 센 경우다.", "정답.", "PK 컬럼에도 NULL이 들어갈 수 있다고 보아 ⑥을 성공으로 센 경우다."],
  trap: "Oracle에서 문장 하나가 제약조건 위반으로 실패하면 '그 문장만' 롤백되고(문장 수준 롤백), 같은 트랜잭션의 앞선 성공 문장은 그대로 남는다. NULL을 막으려면 NOT NULL 제약을 따로 걸어야 한다.",
  memo: "UNIQUE NULL 여러 개 OK, CHECK는 UNKNOWN 통과, PK는 NULL 불가"
},
{
  id: "S195", s: 2, tp: "tcl", lv: 3, kill: true, sub: "TCL",
  th: "2과목 | 여러 SAVEPOINT — 앞 지점으로 롤백하면 뒤 SAVEPOINT는 사라진다",
  q: "비어 있는 [T] 테이블에 다음 SQL을 순서대로 실행한 뒤 남아 있는 ID 값으로 옳은 것은? (오류가 난 문장은 그 문장만 실패하고 트랜잭션은 계속된다.)",
  sql: "INSERT INTO T VALUES (1);\nSAVEPOINT A;\nINSERT INTO T VALUES (2);\nSAVEPOINT B;\nINSERT INTO T VALUES (3);\nROLLBACK TO A;\nINSERT INTO T VALUES (4);\nROLLBACK TO B;\nCOMMIT;",
  o: ["1, 4", "1, 2", "1, 2, 4", "아무 행도 남지 않는다"],
  a: 0,
  why: "ROLLBACK TO A는 A 이후의 모든 변경(INSERT 2, 3)을 취소하면서 A 이후에 만든 SAVEPOINT B도 함께 지운다. 그 뒤의 ROLLBACK TO B는 존재하지 않는 저장점을 가리키므로 ORA-01086(savepoint 'B' never established) 오류가 나고 아무것도 되돌리지 않는다. 문장 하나의 오류는 트랜잭션 전체를 취소하지 않으므로, COMMIT 시점의 데이터 1, 4가 확정된다.",
  st: [
    { t: "[원본] 단계별 상태", tb: { c: ["명령", "T 상태", "살아 있는 SAVEPOINT"], r: [["INSERT 1", "{1}", "—"], ["SAVEPOINT A", "{1}", "A"], ["INSERT 2", "{1, 2}", "A"], ["SAVEPOINT B", "{1, 2}", "A, B"], ["INSERT 3", "{1, 2, 3}", "A, B"], ["ROLLBACK TO A", "{1}", "A (B 소멸)"], ["INSERT 4", "{1, 4}", "A"], ["ROLLBACK TO B", "{1, 4}", "오류 — B 없음"], ["COMMIT", "{1, 4} 확정", "모두 해제"]], hl: [5, 7] } }
  ],
  pgSetup: "CREATE TABLE T (ID numeric);",
  res: { c: ["ID"], r: [[1], [4]] },
  pg: "BEGIN; INSERT INTO T VALUES (1); SAVEPOINT A; INSERT INTO T VALUES (2); SAVEPOINT B; INSERT INTO T VALUES (3); ROLLBACK TO A; INSERT INTO T VALUES (4); COMMIT; SELECT ID FROM T ORDER BY ID",
  ox: ["정답.", "ROLLBACK TO B가 B 시점의 상태 {1, 2}로 되살린다고 본 경우다. ROLLBACK은 이미 취소된 변경을 되살리지 못하고, B는 이미 사라졌다.", "ROLLBACK TO A가 A와 B 사이의 INSERT 2는 남긴다고 본 경우다.", "ROLLBACK TO B의 오류로 트랜잭션 전체가 취소된다고 본 경우다."],
  trap: "PostgreSQL에서는 오류가 난 트랜잭션이 중단(aborted) 상태가 되어 COMMIT해도 롤백된다. Oracle은 오류 문장만 실패하므로, 검증 SQL에서는 효과가 없는 ROLLBACK TO B를 빼고 같은 결과를 재현했다.",
  memo: "ROLLBACK TO A → A 이후 SAVEPOINT도 소멸"
},
{
  id: "S196", s: 2, tp: "tcl", lv: 3, kill: true, sub: "TCL",
  th: "2과목 | SAVEPOINT 이름 재사용 + 앞 지점 롤백으로 저장점이 모두 사라지는 경우",
  q: "Oracle에서 비어 있는 [T] 테이블에 다음 SQL을 순서대로 실행한 뒤 남아 있는 ID 값으로 옳은 것은? (오류가 난 문장은 그 문장만 실패하고 트랜잭션은 계속된다.)",
  sql: "INSERT INTO T VALUES (1);\nSAVEPOINT P;\nINSERT INTO T VALUES (2);\nSAVEPOINT Q;\nINSERT INTO T VALUES (3);\nSAVEPOINT P;\nINSERT INTO T VALUES (4);\nROLLBACK TO Q;\nINSERT INTO T VALUES (5);\nROLLBACK TO P;\nCOMMIT;",
  o: ["1, 2, 5", "1", "1, 2", "아무 행도 남지 않는다"],
  a: 0,
  why: "Oracle에서 같은 이름으로 SAVEPOINT를 다시 만들면 예전 저장점은 지워지고 새 위치로 옮겨진다. 그래서 첫 번째 P(INSERT 1 뒤)는 사라지고 P는 INSERT 3 뒤를 가리킨다. ROLLBACK TO Q는 Q 이후의 INSERT 3, 4를 취소하면서 Q 이후에 만든 저장점(새 P)도 지운다. 이제 P라는 저장점은 어디에도 없으므로 ROLLBACK TO P는 ORA-01086 오류로 실패하고 아무것도 취소하지 않는다. COMMIT 시점의 1, 2, 5가 확정된다.",
  st: [
    { t: "[원본] 단계별 상태", tb: { c: ["명령", "T 상태", "살아 있는 SAVEPOINT"], r: [["INSERT 1", "{1}", "—"], ["SAVEPOINT P", "{1}", "P(1 뒤)"], ["INSERT 2", "{1, 2}", "P(1 뒤)"], ["SAVEPOINT Q", "{1, 2}", "P(1 뒤), Q"], ["INSERT 3", "{1, 2, 3}", "P(1 뒤), Q"], ["SAVEPOINT P (재정의)", "{1, 2, 3}", "Q, P(3 뒤) — 옛 P 소멸"], ["INSERT 4", "{1, 2, 3, 4}", "Q, P(3 뒤)"], ["ROLLBACK TO Q", "{1, 2}", "Q — 새 P 소멸"], ["INSERT 5", "{1, 2, 5}", "Q"], ["ROLLBACK TO P", "{1, 2, 5}", "오류 — P 없음"], ["COMMIT", "{1, 2, 5} 확정", "—"]], hl: [5, 7, 9] } }
  ],
  pgSetup: "CREATE TABLE T (ID numeric);",
  res: { c: ["ID"], r: [[1], [2], [5]] },
  pg: "BEGIN; INSERT INTO T VALUES (1); SAVEPOINT P; INSERT INTO T VALUES (2); SAVEPOINT Q; INSERT INTO T VALUES (3); SAVEPOINT P; INSERT INTO T VALUES (4); ROLLBACK TO Q; INSERT INTO T VALUES (5); COMMIT; SELECT ID FROM T ORDER BY ID",
  ox: ["정답.", "재정의 후에도 첫 번째 P(INSERT 1 뒤)가 남아 있어 ROLLBACK TO P가 그곳으로 돌아간다고 본 경우다.", "실패한 ROLLBACK TO P가 바로 앞의 INSERT 5를 취소한다고 본 경우다.", "ROLLBACK TO P의 오류로 트랜잭션 전체가 취소된다고 본 경우다."],
  trap: "PostgreSQL은 같은 이름의 예전 저장점을 지우지 않고 가려 둘 뿐이라, 같은 SQL을 실행하면 ROLLBACK TO P가 첫 번째 P로 돌아가 {1}이 된다. 그래서 검증 SQL에서는 Oracle에서 효과가 없는 ROLLBACK TO P를 빼고 재현했다. 시험은 Oracle 기준이다.",
  memo: "같은 이름 SAVEPOINT = 옛것 삭제 / ROLLBACK TO X = X 이후 저장점 삭제"
},
{
  id: "S197", s: 2, tp: "tcl", lv: 3, kill: true, sub: "TCL",
  th: "2과목 | DDL 자동 커밋이 SAVEPOINT까지 지우는 경우 (Oracle)",
  q: "Oracle에서 비어 있는 [T] 테이블에 다음 SQL을 순서대로 실행한 뒤 남아 있는 ID 값으로 옳은 것은? (오류가 난 문장은 그 문장만 실패한다.)",
  sql: "INSERT INTO T VALUES (1);\nSAVEPOINT S1;\nINSERT INTO T VALUES (2);\nCREATE TABLE X (C NUMBER);\nINSERT INTO T VALUES (3);\nROLLBACK TO S1;\nINSERT INTO T VALUES (4);\nCOMMIT;",
  o: ["1, 2, 3, 4", "1, 4", "1, 2, 4", "1, 2"],
  a: 0,
  why: "Oracle에서 DDL(CREATE TABLE)은 실행 전후에 자동으로 COMMIT한다. CREATE TABLE X 시점에 INSERT 1, 2가 확정되고 트랜잭션이 끝나면서 그 트랜잭션의 SAVEPOINT S1도 함께 사라진다. 이후 ROLLBACK TO S1은 ORA-01086 오류로 실패하고 아무것도 취소하지 않는다. 따라서 INSERT 3, 4가 그대로 남아 COMMIT으로 확정되어 1, 2, 3, 4가 된다.",
  st: [
    { t: "[원본] 단계별 상태", tb: { c: ["명령", "확정", "미확정", "SAVEPOINT"], r: [["INSERT 1", "—", "1", "—"], ["SAVEPOINT S1", "—", "1", "S1"], ["INSERT 2", "—", "1, 2", "S1"], ["CREATE TABLE X (자동 COMMIT)", "1, 2", "—", "소멸"], ["INSERT 3", "1, 2", "3", "—"], ["ROLLBACK TO S1", "1, 2", "3", "오류 — S1 없음"], ["INSERT 4", "1, 2", "3, 4", "—"], ["COMMIT", "1, 2, 3, 4", "—", "—"]], hl: [3, 5] } }
  ],
  ox: ["정답.", "DDL의 자동 커밋을 몰라 ROLLBACK TO S1이 정상 동작한다고 본 경우다.", "S1은 살아 있되 이미 확정된 2는 되돌릴 수 없다고 섞어 생각해 INSERT 3만 취소한 경우다. 커밋과 함께 S1 자체가 사라진다.", "ROLLBACK TO S1의 오류로 그 뒤의 INSERT 3, 4까지 취소된다고 본 경우다."],
  trap: "PostgreSQL은 DDL도 트랜잭션 안에서 롤백할 수 있어 같은 순서를 실행하면 결과가 {1, 4}가 된다. Oracle의 DDL 자동 커밋은 PostgreSQL로 재현할 수 없어 DB 검증을 생략한다.",
  memo: "DDL = COMMIT = SAVEPOINT 전부 소멸"
},
{
  id: "S198", s: 2, tp: "tcl", lv: 2, kill: true, sub: "TCL",
  th: "2과목 | COMMIT 이후의 ROLLBACK — 마지막 COMMIT까지만 되돌린다",
  q: "[T] 테이블이 다음과 같이 확정(COMMIT)된 상태에서 아래 SQL을 순서대로 실행한 뒤의 [T] 테이블 내용으로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "V"], r: [[1, 100], [2, 200]] }],
  sql: "UPDATE T SET V = V + 1 WHERE ID = 1;\nSAVEPOINT SA;\nDELETE FROM T WHERE ID = 2;\nCOMMIT;\nINSERT INTO T VALUES (3, 300);\nROLLBACK;",
  o: ["(1, 101)", "(1, 100), (2, 200)", "(1, 101), (3, 300)", "(1, 101), (2, 200)"],
  a: 0,
  why: "COMMIT은 그때까지의 변경(UPDATE, DELETE)을 영구히 확정하고 트랜잭션을 끝내며, 그 트랜잭션의 SAVEPOINT SA도 해제한다. 저장점 없는 ROLLBACK은 '마지막 COMMIT 이후'의 변경, 즉 INSERT 3만 취소한다. 이미 확정된 UPDATE와 DELETE는 되돌릴 수 없으므로 (1, 101)만 남는다.",
  st: [
    { t: "[원본] 확정 상태", tb: { c: ["ID", "V"], r: [[1, 100], [2, 200]] } },
    { t: "[1단계] COMMIT까지", tb: { c: ["명령", "T 상태"], r: [["UPDATE ID 1", "(1, 101), (2, 200)"], ["SAVEPOINT SA", "변화 없음"], ["DELETE ID 2", "(1, 101)"], ["COMMIT", "(1, 101) 확정, SA 해제"]], hl: [3] } },
    { t: "[2단계] COMMIT 이후", tb: { c: ["명령", "T 상태"], r: [["INSERT (3, 300)", "(1, 101), (3, 300)"], ["ROLLBACK", "(1, 101)"]] } }
  ],
  res: { c: ["ID", "V"], r: [[1, 101]] },
  pg: "BEGIN; UPDATE T SET V = V + 1 WHERE ID = 1; SAVEPOINT SA; DELETE FROM T WHERE ID = 2; COMMIT; BEGIN; INSERT INTO T VALUES (3, 300); ROLLBACK; SELECT ID, V FROM T ORDER BY ID",
  ox: ["정답.", "ROLLBACK이 COMMIT 이전의 변경까지 모두 취소한다고 본 경우다.", "ROLLBACK이 아무것도 취소하지 않는다고 본 경우다.", "저장점 없는 ROLLBACK이 마지막 SAVEPOINT(SA)로 돌아간다고 본 경우다. SA는 COMMIT과 함께 사라졌고, ROLLBACK은 저장점과 무관하게 트랜잭션 시작점으로 돌아간다."],
  trap: "ROLLBACK(저장점 없음) = 현재 트랜잭션 전체 취소 = 마지막 COMMIT 시점으로 복귀다. ROLLBACK TO SA처럼 저장점을 명시해야만 중간 지점으로 돌아간다.",
  memo: "ROLLBACK = 마지막 COMMIT까지만"
},
{
  id: "S199", s: 2, tp: "ddl", lv: 3, kill: true, sub: "DDL",
  th: "2과목 | CTAS의 데이터 복사와 TRUNCATE vs DELETE의 ROLLBACK (Oracle)",
  q: "Oracle에서 [T1] 테이블이 다음과 같이 확정(COMMIT)된 상태일 때, 아래 SQL을 순서대로 실행한 뒤 T1과 T2의 행 수를 순서대로 나열한 것은?",
  tb: [{ n: "T1", c: ["ID"], r: [[1], [2], [3], [4], [5]] }],
  sql: "DELETE FROM T1 WHERE ID <= 2;\nCREATE TABLE T2 AS SELECT * FROM T1;\nDELETE FROM T2;\nROLLBACK;\nTRUNCATE TABLE T1;\nROLLBACK;",
  o: ["T1 0, T2 3", "T1 3, T2 3", "T1 0, T2 0", "T1 5, T2 3"],
  a: 0,
  why: "Oracle에서 DDL은 실행 전후에 자동으로 COMMIT한다. CREATE TABLE … AS SELECT(CTAS)도 DDL이므로 앞선 DELETE(ID 1, 2 삭제)가 확정되고, T2는 그 시점의 T1 데이터 3행을 복사해 만들어진다. 이어지는 DELETE FROM T2는 DML이라 ROLLBACK으로 되돌아가 T2는 3행이다. TRUNCATE는 DDL이라 즉시 확정되므로 뒤의 ROLLBACK으로 되돌릴 수 없어 T1은 0행이다.",
  st: [
    { t: "[원본] 확정된 T1", tb: { c: ["T1 행 수", "T2"], r: [[5, "없음"]] } },
    { t: "[1단계] 단계별 상태", tb: { c: ["명령", "분류", "T1", "T2", "비고"], r: [["DELETE ID <= 2", "DML", 3, "—", "미확정"], ["CREATE TABLE T2 AS …", "DDL", 3, 3, "자동 COMMIT, 데이터 복사"], ["DELETE FROM T2", "DML", 3, 0, "미확정"], ["ROLLBACK", "TCL", 3, 3, "T2 삭제 취소"], ["TRUNCATE TABLE T1", "DDL", 0, 3, "자동 COMMIT"], ["ROLLBACK", "TCL", 0, 3, "취소할 것 없음"]], hl: [1, 4] } }
  ],
  res: { c: ["T1", "T2"], r: [[0, 3]] },
  pg: "BEGIN; DELETE FROM T1 WHERE ID <= 2; COMMIT; CREATE TABLE T2 AS SELECT * FROM T1; BEGIN; DELETE FROM T2; ROLLBACK; TRUNCATE TABLE T1; SELECT (SELECT COUNT(*) FROM T1), (SELECT COUNT(*) FROM T2)",
  ox: ["정답.", "TRUNCATE도 DELETE처럼 ROLLBACK으로 되돌릴 수 있다고 본 경우다.", "CTAS가 구조만 복사하고 데이터는 복사하지 않는다고 본 경우다. 데이터 없이 구조만 복사하려면 WHERE 1 = 2를 붙인다.", "DDL의 자동 커밋과 TRUNCATE의 확정을 모두 몰라 처음 상태로 되돌아간다고 본 경우다."],
  trap: "PostgreSQL은 DDL과 TRUNCATE도 트랜잭션 안에서 롤백할 수 있으므로, 검증 SQL에서는 Oracle의 자동 커밋 위치에 COMMIT을 명시하고 TRUNCATE를 트랜잭션 밖(즉시 확정)에서 실행해 재현했다. 참고로 CTAS는 NOT NULL 외의 제약조건(PK, FK, UNIQUE, CHECK)과 DEFAULT 값은 복사하지 않는다.",
  memo: "CTAS = DDL(자동 COMMIT) + 데이터 복사 / TRUNCATE = ROLLBACK 불가"
},
{
  id: "S200", s: 2, tp: "ddl", lv: 2, kill: true, sub: "DCL",
  th: "2과목 | WITH ADMIN OPTION(시스템 권한) vs WITH GRANT OPTION(객체 권한)의 회수",
  q: "Oracle에서 다음 명령을 차례로 실행한 뒤, 사용자 C의 CREATE TABLE 권한과 사용자 E의 A.T 테이블 SELECT 권한 상태로 옳은 것은?",
  sql: "-- DBA 계정\nGRANT CREATE TABLE TO B WITH ADMIN OPTION;\n-- B 계정\nGRANT CREATE TABLE TO C;\n-- DBA 계정\nREVOKE CREATE TABLE FROM B;\n\n-- A 계정 (테이블 T의 소유자)\nGRANT SELECT ON T TO D WITH GRANT OPTION;\n-- D 계정\nGRANT SELECT ON A.T TO E;\n-- A 계정\nREVOKE SELECT ON T FROM D;",
  o: ["C: 유지 / E: 상실", "C: 상실 / E: 상실", "C: 유지 / E: 유지", "C: 상실 / E: 유지"],
  a: 0,
  why: "시스템 권한(CREATE TABLE 등)을 WITH ADMIN OPTION으로 받은 사용자가 다른 사용자에게 다시 부여한 경우, 원래 사용자의 권한을 회수해도 연쇄적으로 회수되지 않는다(C는 유지). 객체 권한(SELECT ON T 등)을 WITH GRANT OPTION으로 받아 다시 부여한 경우에는 원래 사용자의 권한을 회수하면 그가 부여한 권한까지 연쇄적으로(CASCADE) 회수된다(E는 상실).",
  st: [
    { t: "[원본] 두 옵션 비교", tb: { c: ["구분", "WITH ADMIN OPTION", "WITH GRANT OPTION"], r: [["대상", "시스템 권한 · 롤", "객체 권한"], ["재부여", "가능", "가능"], ["중간 사용자 회수 시", "연쇄 회수 없음", "연쇄 회수"], ["이 문제", "C 유지", "E 상실"]], hl: [2] } }
  ],
  ox: ["정답.", "ADMIN OPTION도 GRANT OPTION처럼 연쇄 회수된다고 본 경우다.", "GRANT OPTION도 연쇄 회수되지 않는다고 본 경우다.", "두 옵션의 연쇄 회수 규칙을 서로 바꾼 경우다."],
  trap: "'ADMIN은 어드민답게 독립적(연쇄 X), GRANT는 줄줄이 회수(연쇄 O)'로 외운다. 권한 회수는 Oracle의 권한 체계 문제라 DB 검증을 생략한다.",
  memo: "ADMIN OPTION 연쇄 X / GRANT OPTION 연쇄 O"
}
);
