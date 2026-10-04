// 제2과목 · SQL 기본 + 서브쿼리/집합 — 고오답(kill) 유형 집중 (S121–S160)
// pg: 검증용 PostgreSQL 쿼리 (tools/verify.mjs 가 tb 를 그대로 테이블로 만들고 실행해 res 와 대조한다)
// Oracle 전용 동작(SUBSTR 음수 시작, INSTR 역방향, || 의 NULL 무시, 집합 연산자 동일 우선순위)은 pg에서 같은 의미로 풀어 쓴 식으로 검증한다.
(window.QB = window.QB || []).push(
{
  id: "S121", s: 2, tp: "notin", lv: 2, kill: true, sub: "WHERE 절",
  th: "2과목 | NOT IN 리터럴 목록과 NULL (컬럼 NULL vs 목록 NULL)",
  q: "다음 [T] 테이블에 대해 (가)~(다)를 각각 실행했을 때 결과 건수를 순서대로 나열한 것은?",
  tb: [{ n: "T", c: ["ID", "DEPT"], r: [[1, 10], [2, 20], [3, 30], [4, null], [5, 40], [6, 10]] }],
  sql: "(가) SELECT COUNT(*) FROM T WHERE DEPT NOT IN (10, 20);\n(나) SELECT COUNT(*) FROM T WHERE NOT (DEPT = 10 OR DEPT = 20);\n(다) SELECT COUNT(*) FROM T WHERE DEPT NOT IN (10, 20, NULL);",
  o: ["3, 3, 0", "2, 2, 0", "2, 3, 0", "2, 2, 2"],
  a: 1,
  why: "NOT IN (10, 20)은 DEPT <> 10 AND DEPT <> 20으로 풀린다. DEPT가 NULL인 4번 행은 NULL <> 10이 UNKNOWN이므로 통과하지 못한다. (나)도 NOT (UNKNOWN OR UNKNOWN) = NOT UNKNOWN = UNKNOWN이라 4번 행이 빠진다. (다)는 목록에 NULL이 들어 있어 모든 행에 AND DEPT <> NULL(UNKNOWN)이 붙으므로 TRUE가 될 수 있는 행이 없다.",
  st: [
    { t: "원본", tb: { c: ["ID", "DEPT"], r: [[1, 10], [2, 20], [3, 30], [4, null], [5, 40], [6, 10]], hl: [3] } },
    { t: "1단계: 행별 3진 논리 평가", tb: { c: ["ID", "DEPT", "(가)", "(나)", "(다)"], r: [
      [1, 10, "FALSE", "FALSE", "FALSE"], [2, 20, "FALSE", "FALSE", "FALSE"], [3, 30, "TRUE", "TRUE", "UNKNOWN"],
      [4, null, "UNKNOWN", "UNKNOWN", "UNKNOWN"], [5, 40, "TRUE", "TRUE", "UNKNOWN"], [6, 10, "FALSE", "FALSE", "FALSE"]
    ], hl: [3] } },
    { t: "2단계: TRUE인 행만 센다", tb: { c: ["SQL", "통과 행", "건수"], r: [["(가)", "3, 5", 2], ["(나)", "3, 5", 2], ["(다)", "없음", 0]] } }
  ],
  res: { c: ["가", "나", "다"], r: [[2, 2, 0]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE DEPT NOT IN (10, 20)), (SELECT COUNT(*) FROM T WHERE NOT (DEPT = 10 OR DEPT = 20)), (SELECT COUNT(*) FROM T WHERE DEPT NOT IN (10, 20, NULL))",
  ox: ["DEPT가 NULL인 4번 행을 '10도 20도 아니니까 통과'로 센 경우다. NULL <> 10은 UNKNOWN이다.", "정답.", "(나)에서만 NOT이 UNKNOWN을 TRUE로 바꾼다고 착각한 경우다. NOT UNKNOWN은 여전히 UNKNOWN이다.", "목록 안의 NULL은 '아무것도 아닌 값'이라 무시된다고 본 경우다. 목록에 NULL이 있으면 NOT IN은 0건이다."],
  trap: "NULL이 '컬럼 쪽'에 있으면 그 행만 빠지고, NULL이 'NOT IN 목록 쪽'에 있으면 전체가 빠진다. 두 경우를 구분하자.",
  memo: "컬럼 NULL → 그 행만 탈락 / 목록 NULL → NOT IN 전체 0건"
},
{
  id: "S122", s: 2, tp: "notin", lv: 3, kill: true, sub: "WHERE 절",
  th: "2과목 | NOT IN 서브쿼리 — NULL이 걸러지는 경우와 남는 경우",
  q: "다음 [T1], [S] 테이블에 대해 (가)~(다)를 실행했을 때 결과 건수를 순서대로 나열한 것은?",
  tb: [
    { n: "T1", c: ["ID", "V"], r: [[1, 3], [2, 5], [3, 8], [4, 10], [5, null], [6, 12]] },
    { n: "S", c: ["V"], r: [[5], [10], [null], [20]] }
  ],
  sql: "(가) SELECT COUNT(*) FROM T1\n     WHERE V NOT IN (SELECT V FROM S WHERE V > 6);\n(나) SELECT COUNT(*) FROM T1\n     WHERE V NOT IN (SELECT V FROM S WHERE V < 6 OR V IS NULL);\n(다) SELECT COUNT(*) FROM T1\n     WHERE V NOT IN (SELECT NVL(V, 0) FROM S);",
  o: ["5, 0, 4", "0, 0, 3", "4, 4, 3", "4, 0, 3"],
  a: 3,
  why: "(가)의 서브쿼리는 WHERE V > 6에서 NULL > 6이 UNKNOWN이라 NULL 행이 자연히 걸러져 {10, 20}이 된다. 따라서 NOT IN이 정상 동작하고, T1에서 V가 NULL인 5번 행만 UNKNOWN으로 빠져 3, 5, 8, 12의 4건이다. (나)는 IS NULL 조건으로 NULL을 일부러 남겨 {5, NULL}이므로 0건이다. (다)는 NVL로 NULL을 0으로 바꿔 {5, 10, 0, 20}이 되므로 3, 8, 12의 3건이다.",
  st: [
    { t: "1단계: 서브쿼리 결과", tb: { c: ["SQL", "서브쿼리 결과", "NULL 포함?"], r: [["(가)", "10, 20", "아니오 (V > 6이 NULL을 거름)"], ["(나)", "5, NULL", "예"], ["(다)", "5, 10, 0, 20", "아니오 (NVL로 0)"]] } },
    { t: "2단계: T1 행별 NOT IN 결과", tb: { c: ["T1.V", "(가)", "(나)", "(다)"], r: [
      [3, "TRUE", "UNKNOWN", "TRUE"], [5, "TRUE", "FALSE", "FALSE"], [8, "TRUE", "UNKNOWN", "TRUE"],
      [10, "FALSE", "UNKNOWN", "FALSE"], [null, "UNKNOWN", "UNKNOWN", "UNKNOWN"], [12, "TRUE", "UNKNOWN", "TRUE"]
    ] }, n: "(가) 4건, (나) 0건, (다) 3건" }
  ],
  res: { c: ["가", "나", "다"], r: [[4, 0, 3]] },
  pg: "SELECT (SELECT COUNT(*) FROM T1 WHERE V NOT IN (SELECT V FROM S WHERE V > 6)), (SELECT COUNT(*) FROM T1 WHERE V NOT IN (SELECT V FROM S WHERE V < 6 OR V IS NULL)), (SELECT COUNT(*) FROM T1 WHERE V NOT IN (SELECT COALESCE(V, 0) FROM S))",
  ox: ["T1의 V가 NULL인 행을 NOT IN 통과로 센 경우다(5). 바깥 컬럼이 NULL이면 비교 결과는 UNKNOWN이다.", "'NULL이 있는 테이블을 서브쿼리로 쓰면 무조건 0건'이라고 외운 경우다. (가)는 WHERE V > 6이 NULL을 이미 걸렀다.", "(나)에서 서브쿼리의 NULL을 무시하고 {5}만으로 계산한 경우다(3, 8, 10, 12). 목록에 NULL이 남으면 0건이다.", "정답."],
  trap: "서브쿼리 테이블에 NULL이 있다는 것만 보고 0건을 고르면 안 된다. 서브쿼리 WHERE 조건(V > 6 같은 비교)이 NULL을 이미 걸렀는지까지 확인하자.",
  memo: "비교 조건은 NULL을 거른다 → NOT IN 안전 / IS NULL·OR 조건은 NULL을 남긴다 → 0건"
},
{
  id: "S123", s: 2, tp: "notin", lv: 2, kill: true, sub: "WHERE 절",
  th: "2과목 | BETWEEN · LIKE · <> 의 부정과 NULL",
  q: "다음 [T] 테이블에 대해 (가)~(라)를 각각 실행했을 때 결과 건수를 순서대로 나열한 것은?",
  tb: [{ n: "T", c: ["ID", "NAME", "SAL"], r: [[1, "ADAMS", 100], [2, "ALLEN", null], [3, null, 250], [4, "BLAKE", 300], [5, "CLARK", 350], [6, "SMITH", 200]] }],
  sql: "(가) SELECT COUNT(*) FROM T WHERE SAL BETWEEN 100 AND 300;\n(나) SELECT COUNT(*) FROM T WHERE SAL NOT BETWEEN 100 AND 300;\n(다) SELECT COUNT(*) FROM T WHERE NAME NOT LIKE 'A%';\n(라) SELECT COUNT(*) FROM T WHERE SAL <> 200;",
  o: ["4, 2, 4, 5", "4, 1, 3, 4", "4, 2, 3, 4", "4, 1, 4, 5"],
  a: 1,
  why: "BETWEEN, LIKE, <> 모두 NULL과 비교하면 UNKNOWN이고, 앞에 NOT을 붙여도 UNKNOWN이다. 그래서 (가)와 (나)의 건수를 더해도 전체 6건이 아니라 5건이다. (다)는 NAME이 NULL인 3번 행이, (라)는 SAL이 NULL인 2번 행이 빠진다.",
  st: [
    { t: "원본", tb: { c: ["ID", "NAME", "SAL"], r: [[1, "ADAMS", 100], [2, "ALLEN", null], [3, null, 250], [4, "BLAKE", 300], [5, "CLARK", 350], [6, "SMITH", 200]], hl: [1, 2] } },
    { t: "1단계: 행별 평가", tb: { c: ["ID", "(가) BETWEEN", "(나) NOT BETWEEN", "(다) NOT LIKE 'A%'", "(라) <> 200"], r: [
      [1, "TRUE", "FALSE", "FALSE", "TRUE"], [2, "UNKNOWN", "UNKNOWN", "FALSE", "UNKNOWN"], [3, "TRUE", "FALSE", "UNKNOWN", "TRUE"],
      [4, "TRUE", "FALSE", "TRUE", "TRUE"], [5, "FALSE", "TRUE", "TRUE", "TRUE"], [6, "TRUE", "FALSE", "TRUE", "FALSE"]
    ] } },
    { t: "2단계: TRUE 건수", tb: { c: ["(가)", "(나)", "(다)", "(라)"], r: [[4, 1, 3, 4]] }, n: "(가) + (나) = 5 ≠ 6 — 2번 행(SAL NULL)은 어느 쪽에도 들지 않는다." }
  ],
  res: { c: ["가", "나", "다", "라"], r: [[4, 1, 3, 4]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE SAL BETWEEN 100 AND 300), (SELECT COUNT(*) FROM T WHERE SAL NOT BETWEEN 100 AND 300), (SELECT COUNT(*) FROM T WHERE NAME NOT LIKE 'A%'), (SELECT COUNT(*) FROM T WHERE SAL <> 200)",
  ox: ["NULL을 부정 조건(NOT BETWEEN, NOT LIKE, <>)에 모두 통과시킨 경우다. 'NULL은 200이 아니니까 TRUE'는 틀린 생각이다.", "정답.", "(나)를 '(가)의 나머지 = 6 - 4'로 계산한 경우다. NOT BETWEEN도 NULL은 UNKNOWN이다.", "(나)는 맞혔지만 NAME NULL과 SAL NULL을 부정 조건에서 통과시킨 경우다."],
  trap: "'A 조건 건수 + NOT A 조건 건수 = 전체 건수'는 그 컬럼에 NULL이 없을 때만 성립한다.",
  memo: "NOT BETWEEN / NOT LIKE / <> 도 NULL은 탈락"
},
{
  id: "S124", s: 2, tp: "basic", lv: 2, kill: true, sub: "WHERE 절",
  th: "2과목 | NOT · AND · OR 우선순위 (괄호 없는 조건식)",
  q: "다음 [T] 테이블에 대해 SQL을 실행한 결과로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "A", "B", "C"], r: [[1, 1, 2, 3], [2, 1, 2, 0], [3, 2, 2, 0], [4, 2, 1, 3], [5, 1, 1, 0], [6, 2, 1, 0], [7, 2, 2, 3], [8, 1, 1, 3], [9, 2, 1, 1]] }],
  sql: "SELECT COUNT(*)\n  FROM T\n WHERE NOT A = 1 AND B = 2 OR C = 3;",
  o: ["4", "3", "8", "5"],
  a: 3,
  why: "논리 연산자 우선순위는 NOT > AND > OR이다. 따라서 조건은 ((NOT A = 1) AND B = 2) OR C = 3으로 묶인다. 'A가 1이 아니고 B가 2인 행'(3, 7)과 'C가 3인 행'(1, 4, 7, 8)의 합집합은 1, 3, 4, 7, 8의 5건이다.",
  st: [
    { t: "1단계: 괄호를 붙여 다시 쓰기", n: "((NOT A = 1) AND B = 2) OR C = 3\n= (A <> 1 AND B = 2) OR C = 3" },
    { t: "2단계: 행별 평가", tb: { c: ["ID", "A", "B", "C", "A<>1 AND B=2", "C=3", "결과"], r: [
      [1, 1, 2, 3, "F", "T", "T"], [2, 1, 2, 0, "F", "F", "F"], [3, 2, 2, 0, "T", "F", "T"], [4, 2, 1, 3, "F", "T", "T"], [5, 1, 1, 0, "F", "F", "F"],
      [6, 2, 1, 0, "F", "F", "F"], [7, 2, 2, 3, "T", "T", "T"], [8, 1, 1, 3, "F", "T", "T"], [9, 2, 1, 1, "F", "F", "F"]
    ], hl: [0, 2, 3, 6, 7] } }
  ],
  res: { c: ["COUNT(*)"], r: [[5]] },
  pg: "SELECT COUNT(*) FROM T WHERE NOT A = 1 AND B = 2 OR C = 3",
  ox: ["NOT이 뒤의 식 전체에 걸린다고 보고 NOT ((A = 1 AND B = 2) OR C = 3)으로 계산한 경우다.", "OR를 AND보다 먼저 묶어 A <> 1 AND (B = 2 OR C = 3)으로 계산한 경우다.", "NOT이 (A = 1 AND B = 2)에 걸린다고 보고 NOT (A = 1 AND B = 2) OR C = 3으로 계산한 경우다.", "정답."],
  trap: "NOT은 바로 뒤의 비교식 하나에만 붙는다. 괄호가 없으면 NOT → AND → OR 순으로 묶어 다시 써 보고 계산하자.",
  memo: "NOT > AND > OR / NOT은 바로 뒤 한 개만"
},
{
  id: "S125", s: 2, tp: "notin", lv: 3, kill: true, sub: "WHERE 절",
  th: "2과목 | NOT (A = 1 OR B IS NULL) — 3진 논리 진리표",
  q: "다음 [T] 테이블에 대해 SQL을 실행했을 때 출력되는 ID를 모두 고른 것은?",
  tb: [{ n: "T", c: ["ID", "A", "B"], r: [[1, 1, 10], [2, 2, 10], [3, null, 10], [4, 2, null], [5, null, null], [6, 3, 20], [7, 1, null]] }],
  sql: "SELECT ID\n  FROM T\n WHERE NOT (A = 1 OR B IS NULL)\n ORDER BY ID;",
  o: ["2, 3, 6", "2, 6", "2, 3, 5, 6", "3, 5"],
  a: 1,
  why: "OR 진리표: TRUE OR x = TRUE, FALSE OR UNKNOWN = UNKNOWN. NOT 진리표: NOT TRUE = FALSE, NOT UNKNOWN = UNKNOWN. 3번 행은 A = 1이 UNKNOWN, B IS NULL이 FALSE라 OR 결과가 UNKNOWN이고, NOT을 붙여도 UNKNOWN이므로 출력되지 않는다. 5번 행은 B IS NULL이 TRUE라 OR가 TRUE, NOT은 FALSE다. IS NULL은 NULL에 대해서도 TRUE/FALSE를 확정해 주는 유일한 비교라는 점이 핵심이다.",
  st: [
    { t: "1단계: 행별 진리값", tb: { c: ["ID", "A", "B", "A = 1", "B IS NULL", "OR", "NOT (…)"], r: [
      [1, 1, 10, "TRUE", "FALSE", "TRUE", "FALSE"], [2, 2, 10, "FALSE", "FALSE", "FALSE", "TRUE"], [3, null, 10, "UNKNOWN", "FALSE", "UNKNOWN", "UNKNOWN"],
      [4, 2, null, "FALSE", "TRUE", "TRUE", "FALSE"], [5, null, null, "UNKNOWN", "TRUE", "TRUE", "FALSE"], [6, 3, 20, "FALSE", "FALSE", "FALSE", "TRUE"],
      [7, 1, null, "TRUE", "TRUE", "TRUE", "FALSE"]
    ], hl: [1, 5] } },
    { t: "2단계: TRUE인 행만 출력", tb: { c: ["ID"], r: [[2], [6]] } }
  ],
  res: { c: ["ID"], r: [[2], [6]] },
  pg: "SELECT ID FROM T WHERE NOT (A = 1 OR B IS NULL) ORDER BY ID",
  ox: ["3번 행을 'A가 NULL이니 1이 아니다 → NOT이 TRUE'로 본 경우다. NULL = 1은 UNKNOWN이고 NOT UNKNOWN도 UNKNOWN이다.", "정답.", "UNKNOWN이 섞인 행(3, 5)을 모두 통과시킨 경우다. 5번은 B IS NULL이 TRUE라 OR가 TRUE가 되어 NOT 결과는 FALSE다.", "NOT이 결과를 뒤집으므로 'NULL이 있는 행만 남는다'고 거꾸로 생각한 경우다."],
  trap: "드모르간으로 풀면 A <> 1 AND B IS NOT NULL이다. A <> 1은 A가 NULL이면 UNKNOWN이라 3번 행이 빠진다. 'NOT을 붙이면 NULL 행이 살아난다'는 착각을 노린 문제다.",
  memo: "NOT UNKNOWN = UNKNOWN / IS NULL은 항상 TRUE·FALSE"
},
{
  id: "S126", s: 2, tp: "notin", lv: 3, kill: true, sub: "WHERE 절",
  th: "2과목 | 컬럼끼리의 <> 비교와 NVL, NOT의 결합",
  q: "다음 [T] 테이블에 대해 (가)~(다)를 실행했을 때 결과 건수를 순서대로 나열한 것은?",
  tb: [{ n: "T", c: ["ID", "SAL", "COMM"], r: [[1, 100, 100], [2, 100, null], [3, null, null], [4, 200, 0], [5, null, 0], [6, 300, 200]] }],
  sql: "(가) SELECT COUNT(*) FROM T WHERE SAL <> COMM;\n(나) SELECT COUNT(*) FROM T WHERE NVL(SAL, 0) <> NVL(COMM, 0);\n(다) SELECT COUNT(*) FROM T WHERE NOT (SAL = COMM OR SAL IS NULL);",
  o: ["4, 3, 2", "2, 3, 3", "2, 3, 2", "2, 5, 2"],
  a: 2,
  why: "(가)에서 한쪽이라도 NULL이면 <> 결과는 UNKNOWN이므로 4, 6번만 남는다. (나)는 NULL을 0으로 바꿔 비교하므로 2번(100 vs 0)이 추가로 TRUE가 되고, 3번(0 vs 0)과 5번(0 vs 0)은 같아서 FALSE다. (다)에서 2번 행은 SAL = COMM이 UNKNOWN, SAL IS NULL이 FALSE라 OR가 UNKNOWN이고 NOT UNKNOWN도 UNKNOWN이라 빠진다.",
  st: [
    { t: "1단계: 행별 평가", tb: { c: ["ID", "SAL", "COMM", "(가) SAL<>COMM", "(나) NVL 비교", "(다) NOT(SAL=COMM OR SAL IS NULL)"], r: [
      [1, 100, 100, "FALSE", "100<>100 FALSE", "NOT(T OR F) = FALSE"], [2, 100, null, "UNKNOWN", "100<>0 TRUE", "NOT(U OR F) = UNKNOWN"],
      [3, null, null, "UNKNOWN", "0<>0 FALSE", "NOT(U OR T) = FALSE"], [4, 200, 0, "TRUE", "200<>0 TRUE", "NOT(F OR F) = TRUE"],
      [5, null, 0, "UNKNOWN", "0<>0 FALSE", "NOT(U OR T) = FALSE"], [6, 300, 200, "TRUE", "300<>200 TRUE", "NOT(F OR F) = TRUE"]
    ] } },
    { t: "2단계: 건수", tb: { c: ["(가)", "(나)", "(다)"], r: [[2, 3, 2]] } }
  ],
  res: { c: ["가", "나", "다"], r: [[2, 3, 2]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE SAL <> COMM), (SELECT COUNT(*) FROM T WHERE COALESCE(SAL, 0) <> COALESCE(COMM, 0)), (SELECT COUNT(*) FROM T WHERE NOT (SAL = COMM OR SAL IS NULL))",
  ox: ["값과 NULL을 비교한 2, 5번 행을 '서로 다르니 TRUE'로 센 경우다. 값 <> NULL은 UNKNOWN이다.", "(다)에서 2번 행을 NOT으로 살려 낸 경우다. NOT UNKNOWN은 UNKNOWN이다.", "정답.", "(나)에서 NVL로 0이 된 3번(0 vs 0)과 5번(0 vs 0)도 '원래 NULL이었으니 다르다'고 센 경우다. NVL 이후에는 둘 다 0이라 같다."],
  trap: "NVL을 쓰면 NULL끼리(3번)와 NULL·0(5번)이 '같은 값'이 되어 오히려 FALSE가 된다. NVL 대체값이 상대 컬럼의 실제 값과 겹치는지도 확인하자.",
  memo: "값 <> NULL = UNKNOWN / NVL은 비교 결과 자체를 바꾼다"
},
{
  id: "S127", s: 2, tp: "basic", lv: 3, kill: true, sub: "WHERE 절",
  th: "2과목 | LIKE '%' || NULL || '%' — Oracle 문자열 연결과 NULL",
  q: "검색 화면에서 검색어를 입력하지 않아 바인드 변수 :KW에 NULL이 전달되었다. 다음 [T] 테이블에 대해 SQL을 실행한 결과로 옳은 것은? (Oracle 기준)",
  tb: [{ n: "T", c: ["ID", "NAME"], r: [[1, "KIM"], [2, "LEE"], [3, null], [4, "PARK"], [5, "CHOI"], [6, "JUNG"]] }],
  sql: "SELECT COUNT(*)\n  FROM T\n WHERE NAME LIKE '%' || :KW || '%';",
  o: ["0", "1", "5", "6"],
  a: 2,
  why: "Oracle의 연결 연산자 ||는 NULL을 빈 문자열처럼 무시한다. 따라서 '%' || NULL || '%'는 NULL이 아니라 '%%'가 되고, 이는 '아무 문자열이나'를 뜻한다. 다만 NAME이 NULL인 3번 행은 NULL LIKE '%%'가 UNKNOWN이므로 빠진다. 결과는 5건이다. (산술 연산 NULL + 1은 NULL이지만, Oracle의 || 연결은 NULL이 되지 않는다는 차이가 핵심이다.)",
  st: [
    { t: "1단계: 패턴 계산", tb: { c: ["식", "Oracle 결과"], r: [["'%' || NULL || '%'", "'%%'"], ["NULL + 1 (비교용)", "NULL"]] } },
    { t: "2단계: 행별 LIKE '%%'", tb: { c: ["ID", "NAME", "NAME LIKE '%%'"], r: [[1, "KIM", "TRUE"], [2, "LEE", "TRUE"], [3, null, "UNKNOWN"], [4, "PARK", "TRUE"], [5, "CHOI", "TRUE"], [6, "JUNG", "TRUE"]], hl: [2] } }
  ],
  res: { c: ["COUNT(*)"], r: [[5]] },
  pg: "SELECT COUNT(*) FROM T WHERE NAME LIKE CONCAT('%', NULL::text, '%')",
  ox: ["'NULL과 연결하면 결과가 NULL'(산술 연산·표준 SQL 규칙)을 Oracle ||에 적용한 경우다. Oracle은 '%%'를 만든다.", "패턴이 NULL이 되어 NULL끼리만 맞는다고 본 경우다. NULL은 LIKE로 절대 매칭되지 않는다.", "정답.", "'%'는 모든 행과 맞는다고 보고 NAME이 NULL인 행까지 센 경우다. NULL LIKE '%'는 UNKNOWN이다."],
  trap: "LIKE '%'는 '모든 행'이 아니라 'NULL이 아닌 모든 행'이다. 검색어가 없을 때 전체가 나오길 기대한 화면에서 NAME이 NULL인 데이터가 사라지는 실무 버그와 같다.",
  memo: "Oracle: 'A' || NULL = 'A' / LIKE '%' 도 NULL 행은 제외"
},
{
  id: "S128", s: 2, tp: "agg", lv: 2, kill: true, sub: "GROUP BY, HAVING 절",
  th: "2과목 | 그룹별 COUNT(*) · COUNT(컬럼) · COUNT(DISTINCT)와 HAVING",
  q: "다음 [T] 테이블에 대해 SQL을 실행한 결과로 옳은 것은? (괄호 안은 DB 값)",
  tb: [{ n: "T", c: ["ID", "DEPT", "BONUS"], r: [[1, 10, 100], [2, 10, 100], [3, 10, null], [4, 20, 200], [5, 20, 300], [6, null, null], [7, null, 50], [8, 30, null]] }],
  sql: "SELECT DEPT, COUNT(DISTINCT BONUS) AS DB\n  FROM T\n GROUP BY DEPT\nHAVING COUNT(BONUS) < COUNT(*)\n ORDER BY DEPT;",
  o: ["10(1), 30(0), NULL(1)", "10(2), 30(1), NULL(2)", "10(1), NULL(1)", "10(1), 30(0)"],
  a: 0,
  why: "HAVING COUNT(BONUS) < COUNT(*)는 'BONUS가 NULL인 행이 하나라도 있는 그룹'을 뜻한다. DEPT가 NULL인 행들도 GROUP BY에서 하나의 그룹이 되며, 오름차순 정렬에서 Oracle은 NULL을 마지막에 둔다. 30번 그룹은 BONUS가 모두 NULL이라 COUNT(BONUS) = 0 < 1이므로 남고, COUNT(DISTINCT BONUS)는 0이다.",
  st: [
    { t: "1단계: 그룹별 집계", tb: { c: ["DEPT", "COUNT(*)", "COUNT(BONUS)", "COUNT(DISTINCT BONUS)", "HAVING"], r: [[10, 3, 2, 1, "2 < 3 통과"], [20, 2, 2, 2, "2 < 2 탈락"], [30, 1, 0, 0, "0 < 1 통과"], [null, 2, 1, 1, "1 < 2 통과"]], hl: [0, 2, 3] } },
    { t: "2단계: 정렬 (NULL은 오름차순 마지막)", tb: { c: ["DEPT", "DB"], r: [[10, 1], [30, 0], [null, 1]] } }
  ],
  res: { c: ["DEPT", "DB"], r: [[10, 1], [30, 0], [null, 1]] },
  pg: "SELECT DEPT, COUNT(DISTINCT BONUS) AS DB FROM T GROUP BY DEPT HAVING COUNT(BONUS) < COUNT(*) ORDER BY DEPT",
  ox: ["정답.", "COUNT(DISTINCT)가 NULL도 하나의 값으로 센다고 본 경우다. 집계 함수는 NULL을 먼저 버린다.", "BONUS가 모두 NULL인 그룹(30)은 출력되지 않는다고 본 경우다. COUNT(BONUS)는 NULL이 아니라 0을 돌려주므로 HAVING을 통과한다.", "GROUP BY가 NULL 키를 버린다고 본 경우다. NULL끼리도 한 그룹으로 묶인다."],
  trap: "COUNT는 대상이 없어도 NULL이 아니라 0을 돌려준다. SUM·AVG·MAX가 NULL을 돌려주는 것과 구분하자.",
  memo: "GROUP BY는 NULL도 한 그룹 / COUNT(컬럼)=0 ≠ NULL"
},
{
  id: "S129", s: 2, tp: "agg", lv: 3, kill: true, sub: "GROUP BY, HAVING 절",
  th: "2과목 | HAVING AVG — NULL이 분모에서 빠지는 효과",
  q: "다음 [T] 테이블에 대해 SQL을 실행했을 때 출력되는 DEPT를 모두 고른 것은?",
  tb: [{ n: "T", c: ["DEPT", "SAL"], r: [["A", 300], ["A", null], ["A", 100], ["B", 250], ["B", null], ["B", null], ["C", 150], ["C", 150], ["D", null], ["D", null]] }],
  sql: "SELECT DEPT, AVG(SAL) AS AVG_SAL\n  FROM T\n GROUP BY DEPT\nHAVING AVG(SAL) >= 150\n ORDER BY DEPT;",
  o: ["C", "A, B, C", "A, B, C, D", "A, B"],
  a: 1,
  why: "AVG(SAL)은 NULL 행을 분자와 분모에서 모두 뺀다. A는 (300 + 100) ÷ 2 = 200, B는 250 ÷ 1 = 250, C는 150이다. D는 값이 모두 NULL이라 AVG가 NULL이고, NULL >= 150은 UNKNOWN이므로 HAVING에서 걸러진다.",
  st: [
    { t: "1단계: 그룹별 분자·분모", tb: { c: ["DEPT", "SUM(SAL)", "COUNT(SAL)", "AVG(SAL)", "AVG(NVL(SAL,0)) 참고"], r: [["A", 400, 2, 200, "133.3"], ["B", 250, 1, 250, "83.3"], ["C", 300, 2, 150, "150"], ["D", null, 0, null, "0"]] } },
    { t: "2단계: HAVING AVG(SAL) >= 150", tb: { c: ["DEPT", "AVG_SAL"], r: [["A", 200], ["B", 250], ["C", 150]] }, n: "D: NULL >= 150 → UNKNOWN → 탈락" }
  ],
  res: { c: ["DEPT", "AVG_SAL"], r: [["A", 200], ["B", 250], ["C", 150]] },
  pg: "SELECT DEPT, AVG(SAL) AS AVG_SAL FROM T GROUP BY DEPT HAVING AVG(SAL) >= 150 ORDER BY DEPT",
  ox: ["NULL을 0처럼 분모에 넣어 A = 133.3, B = 83.3으로 계산한 경우다. 그것은 AVG(NVL(SAL, 0))의 결과다.", "정답.", "값이 모두 NULL인 D 그룹도 출력된다고 본 경우다. AVG가 NULL이면 비교는 UNKNOWN이다.", "C의 평균 150이 '>= 150'을 만족하지 않는다고 본 경계값 착오다."],
  trap: "AVG(컬럼)과 AVG(NVL(컬럼, 0))은 분모가 다르다. NULL이 많은 그룹일수록 AVG(컬럼)이 '부풀려' 보인다.",
  memo: "AVG = SUM ÷ COUNT(컬럼) / 전부 NULL이면 AVG = NULL"
},
{
  id: "S130", s: 2, tp: "agg", lv: 3, kill: true, sub: "GROUP BY, HAVING 절",
  th: "2과목 | SUM(A + B) vs SUM(A) + SUM(B), 전부 NULL인 그룹",
  q: "다음 [T] 테이블에 대해 SQL을 실행한 결과로 옳은 것은? (각 행은 X, Y, Z 순)",
  tb: [{ n: "T", c: ["DEPT", "SAL", "BONUS"], r: [[10, 100, 10], [10, 200, null], [10, 300, 30], [20, 400, null], [20, 500, null]] }],
  sql: "SELECT DEPT,\n       SUM(SAL + BONUS)       AS X,\n       SUM(SAL) + SUM(BONUS)  AS Y,\n       SUM(BONUS)             AS Z\n  FROM T\n GROUP BY DEPT\n ORDER BY DEPT;",
  o: ["10 → 640, 640, 40 / 20 → 900, 900, 0", "10 → 440, 640, 40 / 20 → NULL, 900, NULL", "10 → 440, 640, 40 / 20 → NULL, NULL, NULL", "10 → 440, 640, 40 / 20 → 0, 900, 0"],
  a: 2,
  why: "SAL + BONUS는 행 단위 산술이라 BONUS가 NULL인 행은 결과가 NULL이 되고, SUM은 그 행을 건너뛴다. 10번 그룹의 X는 110 + 330 = 440, Y는 600 + 40 = 640이다. 20번 그룹은 BONUS가 모두 NULL이라 SUM(BONUS) = NULL이고, SUM(SAL) + NULL도 NULL이다. 행마다 SAL + BONUS가 모두 NULL이므로 X도 NULL이다.",
  st: [
    { t: "1단계: 행별 SAL + BONUS", tb: { c: ["DEPT", "SAL", "BONUS", "SAL + BONUS"], r: [[10, 100, 10, 110], [10, 200, null, null], [10, 300, 30, 330], [20, 400, null, null], [20, 500, null, null]] } },
    { t: "2단계: 그룹별 집계", tb: { c: ["DEPT", "SUM(SAL+BONUS)", "SUM(SAL)", "SUM(BONUS)", "SUM(SAL)+SUM(BONUS)"], r: [[10, 440, 600, 40, 640], [20, null, 900, null, null]], hl: [1] } }
  ],
  res: { c: ["DEPT", "X", "Y", "Z"], r: [[10, 440, 640, 40], [20, null, null, null]] },
  pg: "SELECT DEPT, SUM(SAL + BONUS) AS X, SUM(SAL) + SUM(BONUS) AS Y, SUM(BONUS) AS Z FROM T GROUP BY DEPT ORDER BY DEPT",
  ox: ["NULL을 0처럼 더한 경우다. 행 단위 산술에서 NULL이 하나라도 있으면 결과는 NULL이다.", "SUM(SAL) + NULL을 900으로 본 경우다. 집계가 끝난 뒤의 덧셈은 일반 산술이므로 NULL이 된다.", "정답.", "전부 NULL인 그룹의 SUM을 0으로 본 경우다. SUM은 더할 값이 하나도 없으면 NULL이다."],
  trap: "SUM은 NULL을 '건너뛰지만', 건너뛸 값밖에 없으면 NULL이다. 또 집계 결과끼리의 덧셈(SUM + SUM)은 일반 산술이라 NULL 전파가 일어난다.",
  memo: "SUM(A+B) ≤ SUM(A)+SUM(B) 계열 함정 / 전부 NULL → SUM = NULL"
},
{
  id: "S131", s: 2, tp: "agg", lv: 2, kill: true, sub: "GROUP BY, HAVING 절",
  th: "2과목 | WHERE → GROUP BY → HAVING 순서와 NULL 그룹",
  q: "다음 [T] 테이블에 대해 SQL을 실행한 결과로 옳은 것은? (괄호 안은 CNT 값)",
  tb: [{ n: "T", c: ["DEPT", "SAL"], r: [[10, 50], [10, 150], [10, 200], [20, 300], [20, null], [null, 120], [null, 130], [null, 90], [30, 500]] }],
  sql: "SELECT DEPT, COUNT(*) AS CNT\n  FROM T\n WHERE SAL > 100\n GROUP BY DEPT\nHAVING COUNT(*) >= 2\n ORDER BY DEPT;",
  o: ["10(2)", "10(2), 20(1), NULL(2)", "10(3), NULL(3)", "10(2), NULL(2)"],
  a: 3,
  why: "WHERE가 먼저 행을 거른 뒤 남은 행으로 그룹을 만들고, HAVING은 그 그룹의 집계값으로 다시 거른다. SAL > 100을 통과한 행은 10번 2건(150, 200), 20번 1건(300, NULL은 UNKNOWN으로 탈락), NULL 그룹 2건(120, 130), 30번 1건이다. COUNT(*) >= 2인 그룹은 10과 NULL이다.",
  st: [
    { t: "1단계: WHERE SAL > 100", tb: { c: ["DEPT", "SAL"], r: [[10, 150], [10, 200], [20, 300], [null, 120], [null, 130], [30, 500]] }, n: "50, 90, NULL 행 제거" },
    { t: "2단계: GROUP BY + HAVING", tb: { c: ["DEPT", "COUNT(*)", "HAVING >= 2"], r: [[10, 2, "통과"], [20, 1, "탈락"], [30, 1, "탈락"], [null, 2, "통과"]], hl: [0, 3] } }
  ],
  res: { c: ["DEPT", "CNT"], r: [[10, 2], [null, 2]] },
  pg: "SELECT DEPT, COUNT(*) AS CNT FROM T WHERE SAL > 100 GROUP BY DEPT HAVING COUNT(*) >= 2 ORDER BY DEPT",
  ox: ["DEPT가 NULL인 행들은 그룹이 되지 않는다고 본 경우다. GROUP BY는 NULL끼리 한 그룹으로 묶는다.", "HAVING을 WHERE 전의 원래 건수(10:3, 20:2, NULL:3)로 판단하고 출력은 WHERE 후 건수로 한 경우다. HAVING은 WHERE 이후의 그룹에 적용된다.", "그룹 선택은 맞혔지만 CNT를 WHERE 적용 전의 원래 건수(10:3, NULL:3)로 센 경우다. SELECT의 COUNT(*)도 WHERE를 통과한 행만 센다.", "정답."],
  trap: "실행 순서 FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. HAVING의 COUNT(*)는 WHERE를 통과한 행만 센다.",
  memo: "WHERE는 행, HAVING은 그룹 / NULL 키도 그룹"
},
{
  id: "S132", s: 2, tp: "agg", lv: 2, sub: "GROUP BY, HAVING 절",
  th: "2과목 | 공집합 집계 — GROUP BY 유무에 따른 결과 행 수",
  q: "다음 [EMP] 테이블에 DEPT = 99인 행은 없다. (가)~(라)의 결과 행 수를 순서대로 나열한 것은?",
  tb: [{ n: "EMP", c: ["ENO", "DEPT", "SAL"], r: [[1, 10, 100], [2, 20, null], [3, 20, 300]] }],
  sql: "(가) SELECT COUNT(*), SUM(SAL) FROM EMP WHERE DEPT = 99;\n(나) SELECT COUNT(*), SUM(SAL) FROM EMP WHERE DEPT = 99 GROUP BY DEPT;\n(다) SELECT NVL(MAX(SAL), 0)   FROM EMP WHERE DEPT = 99;\n(라) SELECT NVL(SAL, 0)        FROM EMP WHERE DEPT = 99;",
  o: ["1, 1, 1, 1", "1, 0, 1, 0", "0, 0, 1, 0", "1, 0, 1, 1"],
  a: 1,
  why: "GROUP BY 없이 집계 함수만 쓰면 대상 행이 0건이어도 '전체를 하나의 그룹'으로 보고 1행(COUNT = 0, SUM = NULL)을 돌려준다. GROUP BY가 있으면 만들어질 그룹이 없으므로 0행이다. (다)는 MAX가 1행(NULL)을 만들고 NVL이 0으로 바꾼다. (라)는 집계가 아닌 단일행 함수라 입력 행이 없으면 출력도 없다.",
  st: [
    { t: "1단계: WHERE DEPT = 99 → 0건", n: "모든 SQL의 입력 행이 0건이다." },
    { t: "2단계: SQL별 결과", tb: { c: ["SQL", "구분", "결과"], r: [["(가)", "집계, GROUP BY 없음", "1행 (0, NULL)"], ["(나)", "집계, GROUP BY 있음", "0행"], ["(다)", "집계 + NVL", "1행 (0)"], ["(라)", "단일행 함수", "0행"]] } }
  ],
  res: { c: ["가", "나", "다", "라"], r: [[1, 0, 1, 0]] },
  pg: "SELECT (SELECT COUNT(*) FROM (SELECT COUNT(*), SUM(SAL) FROM EMP WHERE DEPT = 99) x), (SELECT COUNT(*) FROM (SELECT COUNT(*), SUM(SAL) FROM EMP WHERE DEPT = 99 GROUP BY DEPT) x), (SELECT COUNT(*) FROM (SELECT COALESCE(MAX(SAL), 0) FROM EMP WHERE DEPT = 99) x), (SELECT COUNT(*) FROM (SELECT COALESCE(SAL, 0) FROM EMP WHERE DEPT = 99) x)",
  ox: ["GROUP BY가 있어도, 단일행 함수여도 1행이 나온다고 본 경우다.", "정답.", "집계 함수도 대상이 없으면 행을 만들지 않는다고 본 경우다. GROUP BY가 없는 집계는 항상 1행이다.", "NVL이 '행이 없음'까지 0으로 채워 준다고 본 경우다. NVL은 존재하는 행의 NULL 값만 바꾼다."],
  trap: "'값이 없음(NULL)'과 '행이 없음(0행)'은 다르다. NVL은 앞의 것만 해결한다. 행이 없을 때 0을 보려면 NVL(MAX(…), 0)처럼 집계로 감싸야 한다.",
  memo: "GROUP BY 없는 집계 → 항상 1행 / GROUP BY 있으면 0행 가능"
},
{
  id: "S133", s: 2, tp: "agg", lv: 2, sub: "GROUP BY, HAVING 절",
  th: "2과목 | COUNT(DISTINCT NVL(…))와 대체값 중복",
  q: "다음 [T] 테이블에 대해 SQL을 실행한 결과로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "C"], r: [[1, 0], [2, 10], [3, null], [4, 10], [5, 20], [6, null], [7, 0]] }],
  sql: "SELECT COUNT(C)                  AS A,\n       COUNT(DISTINCT C)         AS B,\n       COUNT(DISTINCT NVL(C, 0)) AS D,\n       COUNT(NVL(C, 0))          AS E\n  FROM T;",
  o: ["5, 3, 4, 7", "5, 4, 3, 7", "7, 3, 3, 5", "5, 3, 3, 7"],
  a: 3,
  why: "COUNT(C)는 NULL 2개를 뺀 5다. COUNT(DISTINCT C)는 {0, 10, 20}으로 3이다. NVL(C, 0)은 NULL을 0으로 바꾸는데, 0은 이미 있는 값이므로 DISTINCT 결과는 여전히 {0, 10, 20}의 3이다. COUNT(NVL(C, 0))은 NULL이 사라졌으므로 7이다.",
  st: [
    { t: "1단계: NVL 적용", tb: { c: ["ID", "C", "NVL(C, 0)"], r: [[1, 0, 0], [2, 10, 10], [3, null, 0], [4, 10, 10], [5, 20, 20], [6, null, 0], [7, 0, 0]], hl: [2, 5] } },
    { t: "2단계: 집계", tb: { c: ["식", "대상 값", "결과"], r: [["COUNT(C)", "0, 10, 10, 20, 0", 5], ["COUNT(DISTINCT C)", "{0, 10, 20}", 3], ["COUNT(DISTINCT NVL(C,0))", "{0, 10, 20}", 3], ["COUNT(NVL(C,0))", "7개 모두", 7]] } }
  ],
  res: { c: ["A", "B", "D", "E"], r: [[5, 3, 3, 7]] },
  pg: "SELECT COUNT(C), COUNT(DISTINCT C), COUNT(DISTINCT COALESCE(C, 0)), COUNT(COALESCE(C, 0)) FROM T",
  ox: ["NVL로 만든 0이 새로운 값이라고 보고 1을 더한 경우다. 0은 이미 1, 7번 행에 있다.", "COUNT(DISTINCT C)가 NULL도 하나의 값으로 센다고 본 경우다. 집계 함수는 NULL을 먼저 버린 뒤 중복을 제거한다.", "COUNT(C)와 COUNT(NVL(C, 0))을 서로 바꿔 본 경우다.", "정답."],
  trap: "COUNT(DISTINCT NVL(C, 0))은 'NULL이 아닌 서로 다른 값 수 + 1'이 아니다. 대체값이 기존 값과 겹치면 늘어나지 않는다.",
  memo: "COUNT(NVL(c,0)) = COUNT(*) / DISTINCT는 대체값 중복까지 확인"
},
{
  id: "S134", s: 2, tp: "nullfn", lv: 3, kill: true, sub: "함수",
  th: "2과목 | NULLIF · COALESCE · NVL2 연쇄 계산",
  q: "다음 [T] 테이블에 대해 SQL을 실행한 결과로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "A", "B", "C"], r: [[1, 10, 10, 5], [2, 20, null, 7], [3, null, 30, null], [4, 40, 30, 1]] }],
  sql: "SELECT SUM(COALESCE(NULLIF(A, B), C, -1)) AS X,\n       SUM(NVL2(A, B, C))                    AS Y\n  FROM T;",
  o: ["64, 40", "51, 40", "64, 43", "64, NULL"],
  a: 0,
  why: "NULLIF(A, B)는 A = B일 때만 NULL, 그 외에는 A를 돌려준다. 2번 행의 NULLIF(20, NULL)은 20 = NULL이 UNKNOWN(같지 않음)이므로 20이다. COALESCE는 처음 나오는 NULL이 아닌 값을 고른다. NVL2(A, B, C)는 A가 NULL이 아니면 B, NULL이면 C다. Y는 10, NULL, NULL, 30을 더하는데 SUM은 NULL을 건너뛰므로 40이다.",
  st: [
    { t: "1단계: 행별 계산", tb: { c: ["ID", "A", "B", "C", "NULLIF(A,B)", "COALESCE(…, C, -1)", "NVL2(A,B,C)"], r: [[1, 10, 10, 5, null, 5, 10], [2, 20, null, 7, 20, 20, null], [3, null, 30, null, null, -1, null], [4, 40, 30, 1, 40, 40, 30]], hl: [1] } },
    { t: "2단계: SUM", tb: { c: ["X", "Y"], r: [["5 + 20 - 1 + 40 = 64", "10 + 30 = 40 (NULL 건너뜀)"]] } }
  ],
  res: { c: ["X", "Y"], r: [[64, 40]] },
  pg: "SELECT SUM(COALESCE(NULLIF(A, B), C, -1)) AS X, SUM(CASE WHEN A IS NOT NULL THEN B ELSE C END) AS Y FROM T",
  ox: ["정답.", "NULLIF(20, NULL)을 NULL로 보고 C(7)를 고른 경우다. NULLIF는 '같을 때만' NULL이고, NULL과의 비교는 같지 않다.", "NVL2의 순서를 거꾸로 본 경우다(A가 NOT NULL이면 C). NVL2(A, B, C)는 'A가 있으면 B'다.", "SUM 대상에 NULL이 섞이면 결과가 NULL이라고 본 경우다. SUM은 NULL을 건너뛴다."],
  trap: "NVL2(A, B, C)의 반환값은 A 자신이 아니라 B다. 그래서 A가 NOT NULL이어도 B가 NULL이면 결과는 NULL이다(2번 행).",
  memo: "NULLIF(a,b): a=b → NULL, 아니면 a / NVL2(a,b,c): a 있으면 b"
},
{
  id: "S135", s: 2, tp: "nullfn", lv: 3, kill: true, sub: "함수",
  th: "2과목 | DECODE 기본값 생략 · 단순 CASE WHEN NULL을 COUNT로 세기",
  q: "다음 [T] 테이블에 대해 SQL을 실행한 결과로 옳은 것은? (Oracle 기준)",
  tb: [{ n: "T", c: ["ID", "DEPT"], r: [[1, 10], [2, 20], [3, null], [4, 30], [5, 10], [6, null]] }],
  sql: "SELECT COUNT(DECODE(DEPT, 10, 'A', 20, 'B', NULL, 'N'))                    AS X,\n       COUNT(CASE DEPT WHEN 10 THEN 'A' WHEN 20 THEN 'B' WHEN NULL THEN 'N' END) AS Y,\n       COUNT(DISTINCT DECODE(DEPT, 10, 'A', 20, 'B', NULL, 'N'))           AS Z\n  FROM T;",
  o: ["5, 5, 3", "3, 3, 2", "5, 3, 3", "5, 3, 4"],
  a: 2,
  why: "DECODE는 NULL과 NULL을 같다고 보므로 3, 6번 행은 'N'이 된다. 기본값을 생략하면 일치하는 값이 없는 30은 NULL이다. 따라서 DECODE 결과는 A, B, N, NULL, A, N이고 COUNT는 5, DISTINCT는 {A, B, N}으로 3이다. 단순 CASE는 DEPT = NULL로 비교하므로 WHEN NULL은 절대 맞지 않고, ELSE가 없어 NULL이 된다. CASE 결과는 A, B, NULL, NULL, A, NULL이므로 COUNT는 3이다.",
  st: [
    { t: "1단계: 행별 변환", tb: { c: ["ID", "DEPT", "DECODE", "CASE DEPT WHEN …"], r: [[1, 10, "A", "A"], [2, 20, "B", "B"], [3, null, "N", null], [4, 30, null, null], [5, 10, "A", "A"], [6, null, "N", null]], hl: [2, 5] } },
    { t: "2단계: COUNT", tb: { c: ["X", "Y", "Z"], r: [[5, 3, 3]] } }
  ],
  res: { c: ["X", "Y", "Z"], r: [[5, 3, 3]] },
  pg: "SELECT COUNT(CASE WHEN DEPT = 10 THEN 'A' WHEN DEPT = 20 THEN 'B' WHEN DEPT IS NULL THEN 'N' END) AS X, COUNT(CASE DEPT WHEN 10 THEN 'A' WHEN 20 THEN 'B' WHEN NULL THEN 'N' END) AS Y, COUNT(DISTINCT CASE WHEN DEPT = 10 THEN 'A' WHEN DEPT = 20 THEN 'B' WHEN DEPT IS NULL THEN 'N' END) AS Z FROM T",
  ox: ["단순 CASE도 WHEN NULL이 NULL 행과 맞는다고 본 경우다. 단순 CASE는 '=' 비교라 UNKNOWN이다.", "DECODE도 NULL을 일치시키지 못한다고 본 경우다. DECODE는 NULL끼리 같게 본다.", "정답.", "COUNT(DISTINCT)가 30번 행의 NULL 결과도 한 값으로 센다고 본 경우다."],
  trap: "DECODE와 단순 CASE는 '같은 기능'으로 배우지만 NULL 비교만큼은 다르다. 또 기본값(ELSE)이 없으면 둘 다 NULL을 돌려주고, COUNT는 그 NULL을 세지 않는다.",
  memo: "DECODE: NULL=NULL 인정 / CASE x WHEN NULL: 절대 불일치"
},
{
  id: "S136", s: 2, tp: "fn", lv: 2, sub: "함수",
  th: "2과목 | ROUND · TRUNC의 음수 자릿수와 음수 값",
  q: "다음 SQL의 결과로 옳은 것은?",
  sql: "SELECT ROUND(1555.55, -2) AS A,\n       TRUNC(1555.55, -2) AS B,\n       ROUND(-1550, -2)   AS C,\n       TRUNC(-1555.55, -1) AS D\n  FROM DUAL;",
  o: ["1600, 1600, -1500, -1550", "1555.6, 1555.5, -1550, -1555.5", "1600, 1500, -1600, -1550", "1600, 1500, -1500, -1560"],
  a: 2,
  why: "자릿수가 음수이면 소수점 왼쪽으로 그 자릿수만큼 가서 처리한다. -2는 십의 자리에서 반올림/버림하여 백의 자리까지 남긴다. ROUND는 절댓값 기준으로 반올림하므로(0에서 멀어지는 쪽) -1550은 -1600이 된다. TRUNC는 0 쪽으로 잘라 내므로 -1555.55를 -1 자리에서 자르면 -1550이다.",
  st: [
    { t: "1단계: 자릿수 위치", tb: { c: ["자릿수", "의미"], r: [[1, "소수 첫째 자리까지"], [0, "정수까지"], [-1, "십의 자리까지 (일의 자리에서 처리)"], [-2, "백의 자리까지 (십의 자리에서 처리)"]] } },
    { t: "2단계: 결과", tb: { c: ["식", "결과"], r: [["ROUND(1555.55, -2)", 1600], ["TRUNC(1555.55, -2)", 1500], ["ROUND(-1550, -2)", -1600], ["TRUNC(-1555.55, -1)", -1550]] } }
  ],
  res: { c: ["A", "B", "C", "D"], r: [[1600, 1500, -1600, -1550]] },
  pg: "SELECT ROUND(1555.55, -2), TRUNC(1555.55, -2), ROUND(-1550, -2), TRUNC(-1555.55, -1)",
  ox: ["TRUNC도 반올림한다고 보고, 음수의 반올림을 '큰 쪽(-1500)'으로 본 경우다.", "음수 자릿수를 소수 자릿수로 착각한 경우다.", "정답.", "ROUND(-1550, -2)를 -1500으로, TRUNC(음수)를 FLOOR처럼 아래쪽(-1560)으로 본 경우다. TRUNC는 0 쪽으로 자른다."],
  trap: "음수 ROUND는 수직선의 '큰 쪽'이 아니라 '절댓값이 큰 쪽'으로 올라간다. -1550 → -1600.",
  memo: "ROUND: 절댓값 반올림 / TRUNC: 0 쪽 / 음수 자릿수 = 정수부"
},
{
  id: "S137", s: 2, tp: "fn", lv: 3, kill: true, sub: "함수",
  th: "2과목 | SUBSTR 음수·0 시작 위치 (Oracle)",
  q: "다음 SQL의 결과로 옳은 것은? (Oracle 기준)",
  sql: "SELECT SUBSTR('SQLDEVELOPER', -5, 3)  AS A,\n       SUBSTR('SQLDEVELOPER', -3)     AS B,\n       SUBSTR('SQLDEVELOPER', 0, 3)   AS C,\n       LENGTH(SUBSTR('SQLDEVELOPER', 4)) AS D\n  FROM DUAL;",
  o: ["ELO, PER, SQL, 9", "LOP, PER, SQL, 9", "LOP, PER, SQ, 9", "LOP, REP, SQL, 8"],
  a: 1,
  why: "Oracle의 SUBSTR에서 시작 위치가 음수이면 문자열 끝에서부터 센다. 길이 12인 문자열에서 -5는 끝에서 5번째 글자인 8번째 위치('L')이고, 거기서 오른쪽으로 3글자를 읽어 'LOP'이다. 읽는 방향은 항상 오른쪽이다. -3에 길이를 생략하면 끝에서 3번째부터 끝까지 'PER'이다. 시작 위치 0은 Oracle에서 1로 취급되어 'SQL'이다. 4번째부터 끝까지는 9글자다.",
  st: [
    { t: "1단계: 위치표", tb: { c: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"], r: [["S", "Q", "L", "D", "E", "V", "E", "L", "O", "P", "E", "R"], [-12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1]] }, n: "음수 위치 = 길이 + 음수 + 1 → -5 = 8번째" },
    { t: "2단계: 결과", tb: { c: ["식", "시작", "결과"], r: [["SUBSTR(s, -5, 3)", "8", "LOP"], ["SUBSTR(s, -3)", "10", "PER"], ["SUBSTR(s, 0, 3)", "0 → 1", "SQL"], ["LENGTH(SUBSTR(s, 4))", "4", 9]] } }
  ],
  res: { c: ["A", "B", "C", "D"], r: [["LOP", "PER", "SQL", 9]] },
  pg: "WITH X AS (SELECT 'SQLDEVELOPER'::text AS S) SELECT SUBSTR(S, LENGTH(S) - 5 + 1, 3), SUBSTR(S, LENGTH(S) - 3 + 1), SUBSTR(S, 1, 3), LENGTH(SUBSTR(S, 4)) FROM X",
  ox: ["끝에서 5칸을 '건너뛴' 다음 위치(7번째)부터 읽은 경우다. -5는 끝에서 5번째 글자 자체다.", "정답.", "시작 위치 0을 '1보다 앞의 가상 위치'로 보고 2글자만 잘린다고 본 경우다(PostgreSQL 방식). Oracle은 0을 1로 취급한다.", "음수 시작이면 끝에서부터 왼쪽(역방향)으로 읽는다고 보고 B를 'REP'로, D는 4번째 글자를 빼고 8로 센 경우다. 방향은 항상 오른쪽이고, 4번째부터 끝까지는 9글자다."],
  trap: "음수 시작은 '시작 위치를 끝에서 센다'는 뜻일 뿐, 읽는 방향을 바꾸지 않는다. PostgreSQL에서는 SUBSTR(s, 0, 3)이 2글자를 돌려주므로 Oracle과 다르다.",
  memo: "SUBSTR 음수 = 끝에서 n번째부터 오른쪽으로 / 0 = 1"
},
{
  id: "S138", s: 2, tp: "fn", lv: 3, kill: true, sub: "함수",
  th: "2과목 | INSTR 발생 순번 · 겹치는 매칭 · 역방향 검색 (Oracle)",
  q: "다음 SQL의 결과로 옳은 것은? (Oracle 기준)",
  sql: "SELECT INSTR('BANANA', 'ANA', 1, 2) AS A,\n       INSTR('BANANA', 'A', -1, 3)   AS B,\n       INSTR('BANANA', 'N', 3, 2)    AS C,\n       INSTR('BANANA', 'X')          AS D\n  FROM DUAL;",
  o: ["0, 2, 5, 0", "4, 6, 5, 0", "4, 2, 5, NULL", "4, 2, 5, 0"],
  a: 3,
  why: "INSTR(문자열, 찾을 값, 시작, n번째)는 n번째 발생 위치를 돌려준다. 발생은 서로 겹쳐도 각각 센다: 'ANA'는 2번째와 4번째 위치에서 시작하므로 두 번째 발생은 4다. 시작이 음수이면 끝에서부터 왼쪽으로 검색한다: 'A'는 6, 4, 2 순으로 만나므로 세 번째는 2다. 위치값은 항상 왼쪽 기준이다. 3번째 위치부터 'N'은 3, 5 순이므로 두 번째는 5다. 찾지 못하면 0을 돌려준다.",
  st: [
    { t: "1단계: 위치표", tb: { c: ["1", "2", "3", "4", "5", "6"], r: [["B", "A", "N", "A", "N", "A"]] } },
    { t: "2단계: 검색", tb: { c: ["식", "검색 순서", "결과"], r: [["INSTR(…, 'ANA', 1, 2)", "2(ANA) → 4(ANA, 겹침)", 4], ["INSTR(…, 'A', -1, 3)", "6 → 4 → 2 (오른쪽→왼쪽)", 2], ["INSTR(…, 'N', 3, 2)", "3 → 5", 5], ["INSTR(…, 'X')", "없음", 0]] } }
  ],
  res: { c: ["A", "B", "C", "D"], r: [[4, 2, 5, 0]] },
  pgSetup: "CREATE FUNCTION instr(s text, t text, p int DEFAULT 1, n int DEFAULT 1) RETURNS int LANGUAGE plpgsql AS $$ DECLARE i int; k int := 0; L int := length(s); m int := length(t); BEGIN IF p > 0 THEN FOR i IN p .. L - m + 1 LOOP IF substr(s, i, m) = t THEN k := k + 1; IF k = n THEN RETURN i; END IF; END IF; END LOOP; ELSE FOR i IN REVERSE LEAST(L + p + 1, L - m + 1) .. 1 LOOP IF substr(s, i, m) = t THEN k := k + 1; IF k = n THEN RETURN i; END IF; END IF; END LOOP; END IF; RETURN 0; END $$;",
  pg: "SELECT instr('BANANA', 'ANA', 1, 2), instr('BANANA', 'A', -1, 3), instr('BANANA', 'N', 3, 2), instr('BANANA', 'X')",
  ox: ["겹치는 발생은 세지 않는다고 본 경우다('ANA'를 2에서 찾은 뒤 5부터 다시 검색). Oracle INSTR는 다음 글자부터 다시 검색하므로 겹쳐도 찾는다.", "음수 시작을 무시하고 왼쪽부터 세 번째 'A'(6)를 고른 경우다.", "찾지 못하면 NULL이라고 본 경우다. INSTR은 0을 돌려준다(NULL은 인자가 NULL일 때).", "정답."],
  trap: "역방향 검색이어도 반환되는 위치는 '왼쪽에서 몇 번째'다. 오른쪽에서 몇 번째인지로 답하지 않도록 주의한다.",
  memo: "INSTR: 겹침 허용 / 음수 시작 = 역방향 검색, 위치는 왼쪽 기준 / 없으면 0"
},
{
  id: "S139", s: 2, tp: "fn", lv: 2, sub: "함수",
  th: "2과목 | LTRIM · RTRIM의 두 번째 인자는 '문자 집합'",
  q: "다음 SQL의 결과로 옳은 것은?",
  sql: "SELECT LTRIM('xyxzAxy', 'xy')      AS A,\n       RTRIM('ABC12321', '12')     AS B,\n       TRIM('0' FROM '00102000')  AS C\n  FROM DUAL;",
  o: ["zAxy, ABC, 102", "zAxy, ABC123, 102", "xzAxy, ABC123, 102", "zA, ABC123, 102"],
  a: 1,
  why: "LTRIM/RTRIM의 두 번째 인자는 문자열 패턴이 아니라 '지울 문자들의 집합'이다. LTRIM('xyxzAxy', 'xy')는 왼쪽에서 x 또는 y인 글자를 계속 지우다가 z에서 멈춰 'zAxy'다. RTRIM('ABC12321', '12')는 오른쪽에서 1, 2를 지우다가 3에서 멈춰 'ABC123'이다. TRIM('0' FROM …)은 양쪽의 '0'을 지워 '102'다(가운데 0은 남는다).",
  st: [
    { t: "1단계: 한 글자씩 지우기", tb: { c: ["식", "지우는 과정", "멈춘 글자"], r: [["LTRIM('xyxzAxy', 'xy')", "x → y → x 삭제", "z"], ["RTRIM('ABC12321', '12')", "1 → 2 삭제 (오른쪽부터)", "3"], ["TRIM('0' FROM '00102000')", "왼쪽 00, 오른쪽 000 삭제", "1 / 2"]] } },
    { t: "2단계: 결과", tb: { c: ["A", "B", "C"], r: [["zAxy", "ABC123", "102"]] } }
  ],
  res: { c: ["A", "B", "C"], r: [["zAxy", "ABC123", "102"]] },
  pg: "SELECT LTRIM('xyxzAxy', 'xy'), RTRIM('ABC12321', '12'), TRIM('0' FROM '00102000')",
  ox: ["RTRIM이 숫자를 모두 지운다고 본 경우다. 집합 {1, 2}에 없는 3에서 멈춘다.", "정답.", "'xy'라는 문자열을 한 번만 지운다고 본 경우다. 집합의 문자를 반복해서 지운다.", "LTRIM이 양쪽을 모두 지운다고 본 경우다. 오른쪽 xy는 남는다."],
  trap: "RTRIM('ABC12321', '12')를 '끝의 \"12\" 문자열 제거'로 읽으면 틀린다. 집합의 문자가 나오지 않을 때까지 한 글자씩 지운다.",
  memo: "LTRIM/RTRIM 2번째 인자 = 문자 집합, 반복 삭제"
},
{
  id: "S140", s: 2, tp: "basic", lv: 2, kill: true, sub: "ORDER BY 절",
  th: "2과목 | 다중 정렬 키와 NULL 위치 (DESC + ASC)",
  q: "다음 [T] 테이블에 대해 SQL을 실행했을 때 출력되는 NAME의 순서로 옳은 것은? (Oracle 기준)",
  tb: [{ n: "T", c: ["NAME", "DEPT", "BONUS"], r: [["A", 10, 100], ["B", null, 50], ["C", 20, null], ["D", 20, 30], ["E", 10, null], ["F", null, null], ["G", 20, 10]] }],
  sql: "SELECT NAME\n  FROM T\n ORDER BY DEPT DESC, BONUS;",
  o: ["G D C A E B F", "B F G D C A E", "C G D E A F B", "F B C G D E A"],
  a: 1,
  why: "Oracle은 NULL을 가장 큰 값으로 취급한다. 그래서 오름차순에서는 NULL이 마지막, 내림차순에서는 맨 앞에 온다. 첫 번째 키 DEPT DESC: NULL(B, F) → 20(C, D, G) → 10(A, E). 두 번째 키 BONUS는 방향을 생략했으므로 ASC이고, 같은 DEPT 안에서 작은 값부터, NULL은 마지막이다.",
  st: [
    { t: "1단계: DEPT DESC (NULL 먼저)", tb: { c: ["DEPT", "행"], r: [[null, "B(50), F(NULL)"], [20, "C(NULL), D(30), G(10)"], [10, "A(100), E(NULL)"]] } },
    { t: "2단계: 그룹 안에서 BONUS ASC (NULL 마지막)", tb: { c: ["순서", "NAME", "DEPT", "BONUS"], r: [[1, "B", null, 50], [2, "F", null, null], [3, "G", 20, 10], [4, "D", 20, 30], [5, "C", 20, null], [6, "A", 10, 100], [7, "E", 10, null]] } }
  ],
  res: { c: ["NAME"], r: [["B"], ["F"], ["G"], ["D"], ["C"], ["A"], ["E"]] },
  pg: "SELECT NAME FROM T ORDER BY DEPT DESC, BONUS",
  ox: ["NULL이 내림차순에서도 마지막이라고 본 경우다(DEPT NULL을 맨 뒤로).", "정답.", "NULL을 가장 작은 값으로 본 경우다(SQL Server 방식). Oracle은 NULL을 가장 큰 값으로 본다.", "NULL은 정렬 방향과 관계없이 항상 맨 앞이라고 본 경우다. 두 번째 키는 ASC라 NULL이 그룹 안에서 마지막이다."],
  trap: "DESC는 바로 앞의 컬럼 하나에만 적용된다. BONUS는 ASC이므로 같은 DEPT 안에서 NULL이 뒤로 간다.",
  memo: "Oracle NULL = 최댓값: ASC 끝, DESC 앞 / DESC는 컬럼마다"
},
{
  id: "S141", s: 2, tp: "basic", lv: 3, kill: true, sub: "ORDER BY 절",
  th: "2과목 | ORDER BY 위치 번호 · 별칭 · SELECT에 없는 컬럼",
  q: "다음 [T] 테이블에 대해 SQL을 실행했을 때 출력되는 NAME의 순서로 옳은 것은? (Oracle 기준)",
  tb: [{ n: "T", c: ["NAME", "SAL", "COMM"], r: [["KIM", 300, null], ["LEE", 200, 100], ["PARK", 250, 0], ["CHOI", 100, 300], ["JUNG", 150, 150]] }],
  sql: "SELECT NAME, SAL + COMM AS TOT\n  FROM T\n ORDER BY 2 DESC, SAL;",
  o: ["KIM CHOI JUNG LEE PARK", "CHOI JUNG LEE PARK KIM", "KIM PARK LEE JUNG CHOI", "KIM CHOI LEE JUNG PARK"],
  a: 0,
  why: "ORDER BY 2는 테이블의 두 번째 컬럼(SAL)이 아니라 SELECT 목록의 두 번째 항목(TOT)을 뜻한다. KIM은 COMM이 NULL이라 TOT가 NULL이고, Oracle은 내림차순에서 NULL을 맨 앞에 둔다. TOT가 300으로 같은 JUNG(SAL 150)과 LEE(SAL 200)는 두 번째 키 SAL로 정렬하는데, DESC는 첫 키에만 붙었으므로 SAL은 오름차순이다. SAL처럼 SELECT 목록에 없는 컬럼도 ORDER BY에 쓸 수 있다(DISTINCT·집합 연산이 없을 때).",
  st: [
    { t: "1단계: TOT 계산", tb: { c: ["NAME", "SAL", "COMM", "TOT"], r: [["KIM", 300, null, null], ["LEE", 200, 100, 300], ["PARK", 250, 0, 250], ["CHOI", 100, 300, 400], ["JUNG", 150, 150, 300]] } },
    { t: "2단계: ORDER BY TOT DESC(NULL 먼저), SAL ASC", tb: { c: ["NAME", "TOT", "SAL"], r: [["KIM", null, 300], ["CHOI", 400, 100], ["JUNG", 300, 150], ["LEE", 300, 200], ["PARK", 250, 250]], hl: [2, 3] } }
  ],
  res: { c: ["NAME", "TOT"], r: [["KIM", null], ["CHOI", 400], ["JUNG", 300], ["LEE", 300], ["PARK", 250]] },
  pg: "SELECT NAME, SAL + COMM AS TOT FROM T ORDER BY 2 DESC, SAL",
  ox: ["정답.", "내림차순에서 NULL이 마지막이라고 본 경우다. Oracle은 DESC에서 NULL이 맨 앞이다.", "ORDER BY 2를 테이블의 두 번째 컬럼 SAL로 본 경우다. 위치 번호는 SELECT 목록 기준이다.", "DESC가 두 번째 키 SAL에도 적용된다고 본 경우다(LEE 200 → JUNG 150)."],
  trap: "세 가지 함정이 겹친 문제다. ① 위치 번호는 SELECT 목록 기준 ② SAL + NULL = NULL이며 DESC에서 맨 앞 ③ DESC는 한 컬럼에만 적용.",
  memo: "ORDER BY n = SELECT n번째 / 정렬 방향은 키마다 따로"
},
{
  id: "S142", s: 2, tp: "join", lv: 3, kill: true, sub: "조인",
  th: "2과목 | LEFT JOIN — ON 조건 vs WHERE 조건 vs WHERE … OR IS NULL",
  q: "다음 [A], [B] 테이블에 대해 (가)~(다)를 실행했을 때 결과 건수를 순서대로 나열한 것은?",
  tb: [
    { n: "A", c: ["ID"], r: [[1], [2], [3], [4]] },
    { n: "B", c: ["AID", "STATUS"], r: [[1, "Y"], [1, "N"], [2, "N"], [3, "Y"], [3, "Y"]] }
  ],
  sql: "(가) SELECT COUNT(*) FROM A LEFT OUTER JOIN B\n       ON A.ID = B.AID AND B.STATUS = 'Y';\n(나) SELECT COUNT(*) FROM A LEFT OUTER JOIN B\n       ON A.ID = B.AID\n     WHERE B.STATUS = 'Y';\n(다) SELECT COUNT(*) FROM A LEFT OUTER JOIN B\n       ON A.ID = B.AID\n     WHERE B.STATUS = 'Y' OR B.AID IS NULL;",
  o: ["5, 3, 5", "5, 5, 4", "5, 3, 4", "5, 3, 3"],
  a: 2,
  why: "(가)는 STATUS = 'Y'가 조인 조건이라 A의 모든 행이 보존된다: 1(Y 1건), 2(짝 없음 → NULL 1건), 3(Y 2건), 4(NULL 1건) = 5건. (나)는 조인 후 WHERE에서 B.STATUS가 NULL인 보존 행까지 지워 내부 조인처럼 3건이 된다. (다)는 'B와 아예 짝이 없는 행'만 되살린다. A 2는 B에 짝(STATUS 'N')이 있었으므로 B.AID가 NULL이 아니고, WHERE에서 빠진다. 그래서 (가)와 달리 4건이다.",
  st: [
    { t: "1단계: ON A.ID = B.AID 만으로 조인한 결과", tb: { c: ["A.ID", "B.AID", "B.STATUS"], r: [[1, 1, "Y"], [1, 1, "N"], [2, 2, "N"], [3, 3, "Y"], [3, 3, "Y"], [4, null, null]] } },
    { t: "2단계: SQL별 결과", tb: { c: ["SQL", "남는 행", "건수"], r: [["(가)", "1-Y, 2-NULL, 3-Y, 3-Y, 4-NULL", 5], ["(나)", "1-Y, 3-Y, 3-Y", 3], ["(다)", "1-Y, 3-Y, 3-Y, 4-NULL", 4]] }, n: "A 2: (가)에서는 살아 있지만 (다)에서는 사라진다." }
  ],
  res: { c: ["가", "나", "다"], r: [[5, 3, 4]] },
  pg: "SELECT (SELECT COUNT(*) FROM A LEFT JOIN B ON A.ID = B.AID AND B.STATUS = 'Y'), (SELECT COUNT(*) FROM A LEFT JOIN B ON A.ID = B.AID WHERE B.STATUS = 'Y'), (SELECT COUNT(*) FROM A LEFT JOIN B ON A.ID = B.AID WHERE B.STATUS = 'Y' OR B.AID IS NULL)",
  ox: ["(다)를 (가)와 같은 의미로 본 경우다. 'OR IS NULL'은 짝이 전혀 없는 행만 살리고, 조건에 안 맞는 짝만 있던 행(A 2)은 살리지 못한다.", "WHERE에 B 조건을 걸어도 아우터 조인의 보존 행이 유지된다고 본 경우다.", "정답.", "(다)에서 A 4도 빠진다고 본 경우다. 짝이 없는 행은 B.AID가 NULL이므로 남는다."],
  trap: "'WHERE B.조건 OR B.키 IS NULL'은 ON 절 조건의 대체물이 아니다. 조건에 맞지 않는 짝만 있는 행은 사라진다.",
  memo: "보존하려면 ON에 / WHERE … OR IS NULL ≠ ON 조건"
},
{
  id: "S143", s: 2, tp: "join", lv: 3, kill: true, sub: "조인",
  th: "2과목 | LEFT JOIN의 ON 절에 기준(왼쪽) 테이블 조건을 넣을 때",
  q: "다음 [A], [B] 테이블에 대해 (가), (나)를 실행했을 때 (가)의 COUNT(*), SUM(B.AMT)와 (나)의 COUNT(*)를 순서대로 나열한 것은?",
  tb: [
    { n: "A", c: ["ID", "GRP"], r: [[1, "X"], [2, "Y"], [3, "X"], [4, "Y"]] },
    { n: "B", c: ["AID", "AMT"], r: [[1, 10], [2, 20], [2, 30], [3, 40], [5, 50]] }
  ],
  sql: "(가) SELECT COUNT(*), SUM(B.AMT)\n       FROM A LEFT OUTER JOIN B\n         ON A.ID = B.AID AND A.GRP = 'X';\n\n(나) SELECT COUNT(*)\n       FROM A LEFT OUTER JOIN B\n         ON A.ID = B.AID\n      WHERE A.GRP = 'X';",
  o: ["2, 50, 2", "4, 50, 2", "5, 100, 2", "4, 50, 4"],
  a: 1,
  why: "LEFT OUTER JOIN에서 왼쪽 테이블 A의 행은 ON 조건이 무엇이든 모두 보존된다. ON 절의 A.GRP = 'X'는 A 행을 거르지 않고 '어느 A 행이 B와 짝을 지을 수 있는가'만 제한한다. 그래서 (가)에서 A 2, A 4는 B와 짝을 못 짓고 NULL로 1건씩 남아 4건, 합계는 10 + 40 = 50이다. A 행을 실제로 거르려면 (나)처럼 WHERE에 써야 한다.",
  st: [
    { t: "1단계: (가) ON A.ID = B.AID AND A.GRP = 'X'", tb: { c: ["A.ID", "A.GRP", "B.AID", "B.AMT"], r: [[1, "X", 1, 10], [2, "Y", null, null], [3, "X", 3, 40], [4, "Y", null, null]], hl: [1, 3] }, n: "A 2는 B에 20, 30이 있지만 GRP가 Y라 짝을 못 짓는다." },
    { t: "2단계: (나) 조인 후 WHERE A.GRP = 'X'", tb: { c: ["A.ID", "B.AMT"], r: [[1, 10], [3, 40]] } }
  ],
  res: { c: ["가_CNT", "가_SUM", "나_CNT"], r: [[4, 50, 2]] },
  pg: "SELECT x.c, x.s, (SELECT COUNT(*) FROM A LEFT JOIN B ON A.ID = B.AID WHERE A.GRP = 'X') FROM (SELECT COUNT(*) c, SUM(B.AMT) s FROM A LEFT JOIN B ON A.ID = B.AID AND A.GRP = 'X') x",
  ox: ["ON 절의 A 조건이 WHERE처럼 A 행을 거른다고 본 경우다.", "정답.", "A.GRP 조건이 아무 효과도 없다고 보고 1, 2, 2, 3, 4의 5건, 합계 100으로 계산한 경우다.", "(나)도 왼쪽 행이 보존된다고 본 경우다. WHERE는 조인이 끝난 뒤 행을 거른다."],
  trap: "기준(보존) 테이블 조건은 WHERE에, 상대(NULL 채움) 테이블 조건은 ON에 — 위치를 바꾸면 결과가 완전히 달라진다.",
  memo: "LEFT JOIN: 왼쪽 조건을 ON에 쓰면 거르지 못한다"
},
{
  id: "S144", s: 2, tp: "join", lv: 3, kill: true, sub: "조인",
  th: "2과목 | 1:N 조인 두 번 — 중복 키로 인한 SUM 부풀림(Fan-out)",
  q: "다음 테이블에 대해 SQL을 실행한 결과로 옳은 것은? (CID: 합계)",
  tb: [
    { n: "CUST", c: ["CID"], r: [[1], [2], [3]] },
    { n: "ORD", c: ["CID", "AMT"], r: [[1, 100], [1, 200], [2, 50], [3, 70]] },
    { n: "ADDR", c: ["CID", "CITY"], r: [[1, "SEOUL"], [1, "BUSAN"], [2, "INCHEON"], [2, "DAEGU"], [2, "ULSAN"]] }
  ],
  sql: "SELECT C.CID, SUM(O.AMT) AS TOT\n  FROM CUST C\n  JOIN ORD  O ON O.CID = C.CID\n  JOIN ADDR A ON A.CID = C.CID\n GROUP BY C.CID\n ORDER BY C.CID;",
  o: ["1: 300, 2: 50, 3: 70", "1: 300, 2: 50", "1: 600, 2: 150, 3: 70", "1: 600, 2: 150"],
  a: 3,
  why: "ORD와 ADDR는 서로 관계가 없는데 같은 CID로 동시에 조인되었다. 고객 1은 주문 2건 × 주소 2건 = 4행이 되어 각 주문 금액이 2번씩 더해지고(600), 고객 2는 주문 1건 × 주소 3건 = 3행이라 50이 3번 더해진다(150). 고객 3은 주소가 없어 내부 조인에서 사라진다.",
  st: [
    { t: "1단계: 조인 결과 (GROUP BY 전)", tb: { c: ["CID", "AMT", "CITY"], r: [[1, 100, "SEOUL"], [1, 100, "BUSAN"], [1, 200, "SEOUL"], [1, 200, "BUSAN"], [2, 50, "INCHEON"], [2, 50, "DAEGU"], [2, 50, "ULSAN"]] }, n: "고객 3은 ADDR에 짝이 없어 탈락" },
    { t: "2단계: GROUP BY CID", tb: { c: ["CID", "행 수", "SUM(AMT)"], r: [[1, 4, 600], [2, 3, 150]] } }
  ],
  res: { c: ["CID", "TOT"], r: [[1, 600], [2, 150]] },
  pg: "SELECT C.CID, SUM(O.AMT) AS TOT FROM CUST C JOIN ORD O ON O.CID = C.CID JOIN ADDR A ON A.CID = C.CID GROUP BY C.CID ORDER BY C.CID",
  ox: ["조인으로 행이 늘어나는 것을 무시하고, 주소가 없는 고객 3도 남는다고 본 경우다.", "고객 3이 빠지는 것은 맞혔지만, 주소 수만큼 주문 행이 복제되는 것을 놓친 경우다.", "금액 부풀림은 맞혔지만 내부 조인에서 고객 3이 사라지는 것을 놓친 경우다.", "정답."],
  trap: "서로 무관한 두 1:N 자식 테이블을 같은 부모 키로 한 번에 조인하면 N × M 행이 생긴다. 합계는 각 자식을 먼저 GROUP BY한 뒤 조인해야 정확하다.",
  memo: "1:N × 1:M 동시 조인 → SUM이 M배 부풀려진다"
},
{
  id: "S145", s: 2, tp: "join", lv: 3, kill: true, sub: "조인",
  th: "2과목 | 비등가 조인 — BETWEEN 경계 중복과 범위 밖 값",
  q: "다음 테이블에 대해 SQL을 실행한 결과로 옳은 것은?",
  tb: [
    { n: "EMP", c: ["ENAME", "SAL"], r: [["A", 800], ["B", 1000], ["C", 2000], ["D", null], ["E", 3500]] },
    { n: "SALGRADE", c: ["GRADE", "LOSAL", "HISAL"], r: [[1, 0, 1000], [2, 1000, 2000], [3, 2001, 3000]] }
  ],
  sql: "SELECT COUNT(*), COUNT(DISTINCT E.ENAME), SUM(S.GRADE)\n  FROM EMP E, SALGRADE S\n WHERE E.SAL BETWEEN S.LOSAL AND S.HISAL;",
  o: ["3, 3, 4", "4, 3, 6", "3, 3, 5", "6, 5, 6"],
  a: 1,
  why: "BETWEEN은 양 끝을 포함한다. 등급표의 경계가 겹쳐 있어(1등급 HISAL = 1000 = 2등급 LOSAL) SAL 1000인 B는 1등급과 2등급에 모두 조인되어 2행이 된다. C(2000)는 2등급에만 속한다(3등급은 2001부터). D는 SAL이 NULL이라 어떤 범위와도 TRUE가 되지 않고, E(3500)는 범위 밖이라 둘 다 내부 조인에서 사라진다.",
  st: [
    { t: "1단계: 사원별 매칭 등급", tb: { c: ["ENAME", "SAL", "매칭 GRADE"], r: [["A", 800, "1"], ["B", 1000, "1, 2 (경계 중복)"], ["C", 2000, "2"], ["D", null, "없음 (UNKNOWN)"], ["E", 3500, "없음 (범위 밖)"]], hl: [1] } },
    { t: "2단계: 조인 결과와 집계", tb: { c: ["ENAME", "GRADE"], r: [["A", 1], ["B", 1], ["B", 2], ["C", 2]] }, n: "COUNT(*) 4, DISTINCT ENAME 3, SUM(GRADE) 1+1+2+2 = 6" }
  ],
  res: { c: ["CNT", "DCNT", "SUMG"], r: [[4, 3, 6]] },
  pg: "SELECT COUNT(*), COUNT(DISTINCT E.ENAME), SUM(S.GRADE) FROM EMP E, SALGRADE S WHERE E.SAL BETWEEN S.LOSAL AND S.HISAL",
  ox: ["사원 한 명은 등급 하나에만 매칭된다고 보고 B를 1등급에만 넣은 경우다. BETWEEN은 양 끝을 포함하므로 B는 두 등급에 걸린다.", "정답.", "B를 2등급에만 넣은 경우다(HISAL을 미포함으로 착각).", "비등가 조인도 매칭되지 않은 사원(D, E)을 등급 NULL로 남긴다고 본 경우다. 등호가 아니어도 내부 조인이다."],
  trap: "비등가 조인은 '사원당 1행'이 보장되지 않는다. 등급표의 범위가 겹치면 행이 늘고, 범위에 빈틈이 있거나 값이 NULL이면 행이 사라진다.",
  memo: "BETWEEN은 양 끝 포함 / 비등가 조인도 내부 조인"
},
{
  id: "S146", s: 2, tp: "join", lv: 3, kill: true, sub: "조인",
  th: "2과목 | 3개 테이블 아우터 조인 체인 — 뒤의 INNER JOIN이 앞의 OUTER를 무력화",
  q: "다음 테이블에 대해 (가)~(다)를 실행했을 때 결과 건수를 순서대로 나열한 것은?",
  tb: [
    { n: "DEPT", c: ["DNO"], r: [[10], [20], [30], [40]] },
    { n: "EMP", c: ["ENO", "DNO", "PNO"], r: [[1, 10, 100], [2, 10, null], [3, 20, 200], [4, null, 100]] },
    { n: "PROJ", c: ["PNO", "PNAME"], r: [[100, "P1"], [300, "P3"]] }
  ],
  sql: "(가) SELECT COUNT(*) FROM DEPT D\n       LEFT JOIN EMP E  ON D.DNO = E.DNO\n       LEFT JOIN PROJ P ON E.PNO = P.PNO;\n(나) SELECT COUNT(*) FROM DEPT D\n       LEFT JOIN EMP E  ON D.DNO = E.DNO\n            JOIN PROJ P ON E.PNO = P.PNO;\n(다) SELECT COUNT(*) FROM DEPT D\n       LEFT JOIN (EMP E JOIN PROJ P ON E.PNO = P.PNO)\n              ON D.DNO = E.DNO;",
  o: ["5, 1, 4", "5, 5, 4", "5, 1, 5", "4, 1, 4"],
  a: 0,
  why: "조인은 왼쪽부터 차례로 수행된다. (가) DEPT ⟕ EMP는 10(E1, E2), 20(E3), 30(NULL), 40(NULL)의 5행이고, 다시 PROJ와 LEFT JOIN해도 행은 줄지 않아 5건이다. (나)는 5행 중간 결과에 INNER JOIN을 하므로 E.PNO = P.PNO가 TRUE인 E1 행만 남아 1건이다(NULL로 보존된 부서 행이 모두 사라진다). (다)는 괄호 안의 EMP ⋈ PROJ(E1, E4)를 먼저 만든 뒤 DEPT 기준 LEFT JOIN하므로 10(E1), 20·30·40(NULL)의 4건이다.",
  st: [
    { t: "1단계: DEPT LEFT JOIN EMP", tb: { c: ["D.DNO", "E.ENO", "E.PNO"], r: [[10, 1, 100], [10, 2, null], [20, 3, 200], [30, null, null], [40, null, null]] } },
    { t: "2단계: 두 번째 조인 방식별 결과", tb: { c: ["SQL", "결과 행", "건수"], r: [["(가) LEFT JOIN PROJ", "5행 그대로 (P1은 E1만)", 5], ["(나) INNER JOIN PROJ", "10-E1-P1", 1], ["(다) DEPT ⟕ (EMP ⋈ PROJ)", "10-E1, 20, 30, 40", 4]] } }
  ],
  res: { c: ["가", "나", "다"], r: [[5, 1, 4]] },
  pg: "SELECT (SELECT COUNT(*) FROM DEPT D LEFT JOIN EMP E ON D.DNO = E.DNO LEFT JOIN PROJ P ON E.PNO = P.PNO), (SELECT COUNT(*) FROM DEPT D LEFT JOIN EMP E ON D.DNO = E.DNO JOIN PROJ P ON E.PNO = P.PNO), (SELECT COUNT(*) FROM DEPT D LEFT JOIN (EMP E JOIN PROJ P ON E.PNO = P.PNO) ON D.DNO = E.DNO)",
  ox: ["정답.", "첫 LEFT JOIN이 결과 전체를 보존한다고 본 경우다. 뒤의 INNER JOIN은 NULL로 채워진 행을 모두 지운다.", "(다)를 (가)와 같다고 본 경우다. 괄호 안 INNER JOIN에서 E2·E3가 먼저 빠지므로 부서 10은 1행, 20은 NULL 1행이 된다.", "(가)에서 부서 10의 사원 2명을 1행으로 센 경우다."],
  trap: "LEFT JOIN 뒤에 INNER JOIN이 이어지면 앞의 아우터 조인이 사실상 내부 조인으로 바뀐다. 보존하려면 끝까지 LEFT로 잇거나 괄호로 순서를 바꾼다.",
  memo: "OUTER 뒤 INNER → OUTER 효과 소멸"
},
{
  id: "S147", s: 2, tp: "join", lv: 3, kill: true, sub: "표준 조인",
  th: "2과목 | FULL OUTER JOIN — 중복 키와 NULL 키가 함께 있을 때",
  q: "다음 [T1], [T2] 테이블에 대해 SQL을 실행한 결과로 옳은 것은?",
  tb: [
    { n: "T1", c: ["K"], r: [[1], [1], [2], [null], [3]] },
    { n: "T2", c: ["K"], r: [[1], [2], [2], [null], [null], [4]] }
  ],
  sql: "SELECT COUNT(*), COUNT(T1.K)\n  FROM T1 FULL OUTER JOIN T2\n    ON T1.K = T2.K;",
  o: ["8, 5", "7, 3", "9, 4", "9, 5"],
  a: 3,
  why: "FULL OUTER JOIN = 내부 조인 결과 + 왼쪽 미매칭 행 + 오른쪽 미매칭 행이다. 내부 조인: K = 1은 2 × 1 = 2행, K = 2는 1 × 2 = 2행으로 4행. NULL = NULL은 UNKNOWN이라 매칭되지 않으므로 T1의 NULL·3(2행)과 T2의 NULL·NULL·4(3행)가 각각 따로 붙는다. 합계 9행. COUNT(T1.K)는 T1.K가 NULL이 아닌 행 수로, 매칭 4행 + T1 미매칭 중 3의 1행 = 5다.",
  st: [
    { t: "1단계: 매칭 행 (중복 키 곱하기)", tb: { c: ["T1.K", "T2.K"], r: [[1, 1], [1, 1], [2, 2], [2, 2]] } },
    { t: "2단계: 미매칭 행 추가", tb: { c: ["T1.K", "T2.K", "출처"], r: [[null, null, "T1의 NULL"], [3, null, "T1의 3"], [null, null, "T2의 NULL"], [null, null, "T2의 NULL"], [null, 4, "T2의 4"]] }, n: "총 4 + 2 + 3 = 9행, T1.K NOT NULL = 1,1,2,2,3 → 5" }
  ],
  res: { c: ["COUNT(*)", "COUNT(T1.K)"], r: [[9, 5]] },
  pg: "SELECT COUNT(*), COUNT(T1.K) FROM T1 FULL OUTER JOIN T2 ON T1.K = T2.K",
  ox: ["NULL = NULL이 매칭된다고 본 경우다. 그러면 NULL끼리 2행이 매칭되고 미매칭 3행이 사라져 8행이 된다.", "중복 키를 1번만 매칭한다고 본 경우다.", "행 수는 맞혔지만 T2의 2가 2개라 T1의 2가 2행으로 복제되는 것을 놓치고, T1의 NOT NULL 값 개수(1, 1, 2, 3 = 4)를 그대로 센 경우다. 매칭 4행 모두 T1.K가 있다.", "정답."],
  trap: "FULL OUTER JOIN 건수 = (내부 조인 건수) + (왼쪽 미매칭) + (오른쪽 미매칭). NULL 키는 항상 미매칭 쪽으로 간다.",
  memo: "FULL = INNER + 왼쪽만 + 오른쪽만 / NULL 키는 매칭 안 됨"
},
{
  id: "S148", s: 2, tp: "join", lv: 3, kill: true, sub: "표준 조인",
  th: "2과목 | NATURAL JOIN이 의도치 않은 동명 컬럼까지 조인할 때",
  q: "다음 [EMP], [DEPT] 테이블에서 EMP.NAME은 사원명, DEPT.NAME은 부서명이다. (가), (나)의 결과 건수를 순서대로 나열한 것은?",
  tb: [
    { n: "EMP", c: ["ENO", "DNO", "NAME"], r: [[1, 10, "KIM"], [2, 10, "LEE"], [3, 20, "SALES"], [4, 30, "PARK"]] },
    { n: "DEPT", c: ["DNO", "NAME"], r: [[10, "ACCT"], [20, "SALES"], [30, "HR"]] }
  ],
  sql: "(가) SELECT COUNT(*) FROM EMP NATURAL JOIN DEPT;\n(나) SELECT COUNT(*) FROM EMP JOIN DEPT USING (DNO);",
  o: ["4, 4", "0, 4", "1, 4", "1, 1"],
  a: 2,
  why: "NATURAL JOIN은 이름이 같은 모든 컬럼으로 등가 조인한다. 두 테이블에 DNO와 NAME이 모두 있으므로 조건은 EMP.DNO = DEPT.DNO AND EMP.NAME = DEPT.NAME이 된다. 사원명과 부서명이 우연히 같은 3번 사원('SALES', 20)만 남아 1건이다. USING (DNO)는 지정한 DNO만으로 조인하므로 4건이다.",
  st: [
    { t: "1단계: 공통 컬럼 찾기", tb: { c: ["컬럼", "EMP", "DEPT", "NATURAL 조인 키?"], r: [["DNO", "O", "O", "예"], ["NAME", "O", "O", "예 (의도와 다름)"], ["ENO", "O", "X", "아니오"]] } },
    { t: "2단계: 사원별 매칭", tb: { c: ["ENO", "DNO", "EMP.NAME", "DEPT.NAME", "(가)", "(나)"], r: [[1, 10, "KIM", "ACCT", "X", "O"], [2, 10, "LEE", "ACCT", "X", "O"], [3, 20, "SALES", "SALES", "O", "O"], [4, 30, "PARK", "HR", "X", "O"]], hl: [2] } }
  ],
  res: { c: ["가", "나"], r: [[1, 4]] },
  pg: "SELECT (SELECT COUNT(*) FROM EMP NATURAL JOIN DEPT), (SELECT COUNT(*) FROM EMP JOIN DEPT USING (DNO))",
  ox: ["NATURAL JOIN이 PK·FK 관계(DNO)만 알아서 골라 조인한다고 본 경우다. 이름만 같으면 모두 조인 키가 된다.", "NAME까지 조인 키가 되는 것은 알았지만 우연히 같은 값('SALES')을 놓친 경우다.", "정답.", "USING도 동명 컬럼 전체로 조인한다고 본 경우다. USING은 괄호 안 컬럼만 쓴다."],
  trap: "NATURAL JOIN은 컬럼 '의미'가 아니라 '이름'으로 조인한다. 수정일자(UPD_DT)·이름(NAME)처럼 흔한 컬럼명이 겹치면 건수가 줄어든다.",
  memo: "NATURAL = 동명 컬럼 전부 / USING = 지정 컬럼만"
},
{
  id: "S149", s: 2, tp: "join", lv: 2, sub: "표준 조인",
  th: "2과목 | SELECT * 의 컬럼 수 — NATURAL · USING · ON 비교",
  q: "다음 두 테이블에 대해 (가)~(다)를 실행했을 때 결과의 컬럼 수를 순서대로 나열한 것은?",
  tb: [
    { n: "EMP", c: ["ENO", "DNO", "NAME", "SAL"], r: [[1, 10, "SALES", 100], [2, 20, "KIM", 200]] },
    { n: "DEPT", c: ["DNO", "NAME", "LOC"], r: [[10, "SALES", "SEOUL"], [20, "HR", "BUSAN"]] }
  ],
  sql: "(가) SELECT * FROM EMP NATURAL JOIN DEPT;\n(나) SELECT * FROM EMP JOIN DEPT USING (DNO);\n(다) SELECT * FROM EMP E JOIN DEPT D ON E.DNO = D.DNO;",
  o: ["6, 6, 7", "7, 7, 7", "5, 6, 6", "5, 6, 7"],
  a: 3,
  why: "NATURAL JOIN과 USING은 조인 컬럼을 결과에 한 번만(맨 앞에) 출력한다. (가)는 공통 컬럼 DNO, NAME을 한 번씩 + EMP의 나머지 ENO, SAL + DEPT의 나머지 LOC = 5개다. (나)는 DNO만 공통 처리하므로 DNO + ENO, NAME, SAL + NAME, LOC = 6개이고, NAME은 양쪽 것이 모두 나온다. (다) ON 조인은 중복 제거 없이 4 + 3 = 7개다.",
  st: [
    { t: "1단계: 컬럼 구성", tb: { c: ["SQL", "결과 컬럼", "개수"], r: [["(가) NATURAL", "DNO, NAME, ENO, SAL, LOC", 5], ["(나) USING (DNO)", "DNO, ENO, NAME, SAL, NAME, LOC", 6], ["(다) ON", "ENO, DNO, NAME, SAL, DNO, NAME, LOC", 7]] } }
  ],
  res: { c: ["가", "나", "다"], r: [[5, 6, 7]] },
  pg: "SELECT (SELECT COUNT(*) FROM json_each((SELECT to_json(x) FROM (SELECT * FROM EMP NATURAL JOIN DEPT) x LIMIT 1))), (SELECT COUNT(*) FROM json_each((SELECT to_json(x) FROM (SELECT * FROM EMP JOIN DEPT USING (DNO)) x LIMIT 1))), (SELECT COUNT(*) FROM json_each((SELECT to_json(x) FROM (SELECT * FROM EMP E JOIN DEPT D ON E.DNO = D.DNO) x LIMIT 1)))",
  ox: ["NATURAL JOIN이 DNO만 공통 처리한다고 본 경우다. NAME도 공통 컬럼이다.", "NATURAL·USING도 조인 컬럼을 양쪽 모두 출력한다고 본 경우다.", "ON 조인도 조인 컬럼을 한 번만 출력한다고 본 경우다.", "정답."],
  trap: "USING에 없는 동명 컬럼(NAME)은 양쪽 것이 모두 출력된다. 이때 NAME을 접두사 없이 SELECT 목록에 쓰면 모호성 오류가 난다.",
  memo: "SELECT * 컬럼 수: ON = 합 / USING = 합 - 지정 수 / NATURAL = 합 - 공통 수"
},
{
  id: "S150", s: 2, tp: "join", lv: 2, sub: "표준 조인",
  th: "2과목 | CROSS JOIN + WHERE 조건과 NOT, NULL",
  q: "다음 [A], [B] 테이블에 대해 (가)~(다)를 실행했을 때 결과 건수를 순서대로 나열한 것은?",
  tb: [
    { n: "A", c: ["ID", "GRADE"], r: [[1, 1], [2, 2], [3, 3], [4, null]] },
    { n: "B", c: ["CODE"], r: [[1], [2]] }
  ],
  sql: "(가) SELECT COUNT(*) FROM A CROSS JOIN B;\n(나) SELECT COUNT(*) FROM A CROSS JOIN B WHERE A.GRADE >= B.CODE;\n(다) SELECT COUNT(*) FROM A CROSS JOIN B WHERE NOT (A.GRADE >= B.CODE);",
  o: ["8, 5, 1", "8, 5, 3", "6, 5, 1", "8, 7, 1"],
  a: 0,
  why: "CROSS JOIN은 조건 없이 4 × 2 = 8행을 만들고, NULL이 있는 행도 그대로 곱해진다. WHERE는 그 8행에 조건을 적용한다. GRADE가 NULL인 A 4의 2행은 >= 비교도, NOT (…)도 UNKNOWN이라 (나)와 (다) 어디에도 들지 않는다. 그래서 (나) + (다) = 6 ≠ 8이다.",
  st: [
    { t: "1단계: CROSS JOIN 8행 평가", tb: { c: ["GRADE", "CODE", "GRADE >= CODE", "NOT (…)"], r: [[1, 1, "TRUE", "FALSE"], [1, 2, "FALSE", "TRUE"], [2, 1, "TRUE", "FALSE"], [2, 2, "TRUE", "FALSE"], [3, 1, "TRUE", "FALSE"], [3, 2, "TRUE", "FALSE"], [null, 1, "UNKNOWN", "UNKNOWN"], [null, 2, "UNKNOWN", "UNKNOWN"]], hl: [6, 7] } },
    { t: "2단계: 건수", tb: { c: ["(가)", "(나)", "(다)"], r: [[8, 5, 1]] } }
  ],
  res: { c: ["가", "나", "다"], r: [[8, 5, 1]] },
  pg: "SELECT (SELECT COUNT(*) FROM A CROSS JOIN B), (SELECT COUNT(*) FROM A CROSS JOIN B WHERE A.GRADE >= B.CODE), (SELECT COUNT(*) FROM A CROSS JOIN B WHERE NOT (A.GRADE >= B.CODE))",
  ox: ["정답.", "(다)를 '(가) - (나) = 3'으로 계산한 경우다. NULL 행은 NOT을 붙여도 UNKNOWN이다.", "CROSS JOIN이 NULL 값을 가진 행은 곱하지 않는다고 본 경우다.", "NULL을 가장 큰 값으로 보고 NULL >= 1, NULL >= 2를 TRUE로 센 경우다(정렬 규칙과 비교 규칙 혼동)."],
  trap: "Oracle에서 NULL이 '가장 큰 값'으로 취급되는 것은 정렬(ORDER BY)에서뿐이다. 비교 연산에서 NULL은 항상 UNKNOWN이다.",
  memo: "CROSS JOIN 건수 = 곱 / 비교에서 NULL = UNKNOWN"
},
{
  id: "S151", s: 2, tp: "notin", lv: 3, kill: true, sub: "서브쿼리",
  th: "2과목 | 바깥 컬럼이 NULL일 때 — NOT IN vs NOT EXISTS vs 안티 조인",
  q: "다음 [T1], [T2] 테이블에 대해 (가)~(다)를 실행했을 때 결과 건수를 순서대로 나열한 것은?",
  tb: [
    { n: "T1", c: ["V"], r: [[1], [2], [null], [4]] },
    { n: "T2", c: ["V"], r: [[2], [3]] }
  ],
  sql: "(가) SELECT COUNT(*) FROM T1\n     WHERE V NOT IN (SELECT V FROM T2);\n(나) SELECT COUNT(*) FROM T1\n     WHERE NOT EXISTS (SELECT 1 FROM T2 WHERE T2.V = T1.V);\n(다) SELECT COUNT(*) FROM T1 LEFT JOIN T2 ON T1.V = T2.V\n     WHERE T2.V IS NULL;",
  o: ["3, 3, 3", "2, 2, 2", "2, 3, 2", "2, 3, 3"],
  a: 3,
  why: "이번에는 서브쿼리(T2)에 NULL이 없고 바깥 T1에 NULL이 있다. (가) NOT IN은 NULL <> 2 AND NULL <> 3이 UNKNOWN이라 T1의 NULL 행을 버리고 1, 4의 2건이다. (나) NOT EXISTS는 'T2.V = NULL인 행이 존재하는가'를 묻고, 그런 행이 없으므로 NOT EXISTS는 TRUE가 되어 NULL 행도 남는다(3건). (다) 안티 조인도 NULL 행은 짝이 없어 T2.V가 NULL로 채워지므로 남는다(3건).",
  st: [
    { t: "1단계: 행별 평가", tb: { c: ["T1.V", "(가) NOT IN", "(나) NOT EXISTS", "(다) 조인 후 T2.V"], r: [[1, "TRUE", "TRUE", "NULL → 남음"], [2, "FALSE", "FALSE", "2 → 제거"], [null, "UNKNOWN", "TRUE", "NULL → 남음"], [4, "TRUE", "TRUE", "NULL → 남음"]], hl: [2] } },
    { t: "2단계: 건수", tb: { c: ["(가)", "(나)", "(다)"], r: [[2, 3, 3]] } }
  ],
  res: { c: ["가", "나", "다"], r: [[2, 3, 3]] },
  pg: "SELECT (SELECT COUNT(*) FROM T1 WHERE V NOT IN (SELECT V FROM T2)), (SELECT COUNT(*) FROM T1 WHERE NOT EXISTS (SELECT 1 FROM T2 WHERE T2.V = T1.V)), (SELECT COUNT(*) FROM T1 LEFT JOIN T2 ON T1.V = T2.V WHERE T2.V IS NULL)",
  ox: ["NOT IN도 바깥 NULL 행을 통과시킨다고 본 경우다.", "NOT EXISTS와 안티 조인도 NULL 행을 버린다고 본 경우다. 짝이 '없음'은 TRUE로 판정된다.", "안티 조인이 NOT IN과 같다고 본 경우다. LEFT JOIN … IS NULL은 NOT EXISTS와 같은 결과를 낸다.", "정답."],
  trap: "'서브쿼리에 NULL이 없으면 NOT IN = NOT EXISTS'도 완전한 정답이 아니다. 바깥 컬럼에 NULL이 있으면 NOT IN만 그 행을 버린다.",
  memo: "바깥 NULL: NOT IN 제외 / NOT EXISTS·안티 조인 포함"
},
{
  id: "S152", s: 2, tp: "sub", lv: 3, kill: true, sub: "서브쿼리",
  th: "2과목 | > ALL · > ANY · <> ALL 과 서브쿼리 NULL",
  q: "다음 [T1], [S] 테이블에 대해 (가)~(다)를 실행했을 때 결과 건수를 순서대로 나열한 것은?",
  tb: [
    { n: "T1", c: ["V"], r: [[5], [15], [25], [35], [null]] },
    { n: "S", c: ["V"], r: [[10], [20], [null]] }
  ],
  sql: "(가) SELECT COUNT(*) FROM T1 WHERE V > ALL (SELECT V FROM S);\n(나) SELECT COUNT(*) FROM T1 WHERE V > ANY (SELECT V FROM S);\n(다) SELECT COUNT(*) FROM T1 WHERE V <> ALL (SELECT V FROM S);",
  o: ["2, 3, 4", "0, 0, 0", "0, 3, 0", "2, 3, 0"],
  a: 2,
  why: "> ALL은 모든 비교를 AND로 묶는다. 25 > 10(T) AND 25 > 20(T) AND 25 > NULL(U) = UNKNOWN이므로 어떤 행도 TRUE가 되지 못해 0건이다. > ANY는 OR로 묶으므로 하나라도 TRUE면 TRUE다. 15 > 10이 TRUE라 NULL이 섞여도 15, 25, 35의 3건이다. <> ALL은 NOT IN과 같은 뜻이라 NULL이 있으면 0건이다.",
  st: [
    { t: "1단계: 연산자 풀어 쓰기", tb: { c: ["식", "풀이"], r: [["V > ALL (10, 20, NULL)", "V>10 AND V>20 AND V>NULL"], ["V > ANY (10, 20, NULL)", "V>10 OR V>20 OR V>NULL"], ["V <> ALL (10, 20, NULL)", "V<>10 AND V<>20 AND V<>NULL (= NOT IN)"]] } },
    { t: "2단계: 행별 결과", tb: { c: ["T1.V", "> ALL", "> ANY", "<> ALL"], r: [[5, "FALSE", "UNKNOWN", "UNKNOWN"], [15, "FALSE", "TRUE", "UNKNOWN"], [25, "UNKNOWN", "TRUE", "UNKNOWN"], [35, "UNKNOWN", "TRUE", "UNKNOWN"], [null, "UNKNOWN", "UNKNOWN", "UNKNOWN"]] }, n: "(가) 0, (나) 3, (다) 0" }
  ],
  res: { c: ["가", "나", "다"], r: [[0, 3, 0]] },
  pg: "SELECT (SELECT COUNT(*) FROM T1 WHERE V > ALL (SELECT V FROM S)), (SELECT COUNT(*) FROM T1 WHERE V > ANY (SELECT V FROM S)), (SELECT COUNT(*) FROM T1 WHERE V <> ALL (SELECT V FROM S))",
  ox: ["서브쿼리의 NULL을 무시한 경우다(> ALL → 25, 35 / <> ALL → 5, 15, 25, 35).", "NULL이 섞이면 ANY까지 모두 0건이라고 본 경우다. OR에서는 TRUE 하나가 UNKNOWN을 이긴다.", "정답.", "> ALL에서만 NULL을 무시한 경우다. > ALL도 AND 결합이라 NULL이 있으면 TRUE가 될 수 없다."],
  trap: "> ALL (… NULL …)은 'MAX보다 크면 된다'로 외우면 틀린다. 서브쿼리 MAX(V)를 쓰는 > (SELECT MAX(V) …)는 NULL을 무시하므로 25, 35가 나온다 — 둘은 NULL이 있을 때 다르다.",
  memo: "ALL = AND → NULL 있으면 0건 / ANY = OR → TRUE 하나면 통과"
},
{
  id: "S153", s: 2, tp: "sub", lv: 3, kill: true, sub: "서브쿼리",
  th: "2과목 | 공집합에 대한 ALL · ANY · NOT IN · 스칼라 MAX 비교",
  q: "다음 [T1], [S] 테이블에서 S에 V > 100인 행은 없다. (가)~(라)의 결과 건수를 순서대로 나열한 것은?",
  tb: [
    { n: "T1", c: ["V"], r: [[10], [20], [null]] },
    { n: "S", c: ["V"], r: [[50], [70], [null]] }
  ],
  sql: "(가) SELECT COUNT(*) FROM T1 WHERE V > ALL (SELECT V FROM S WHERE V > 100);\n(나) SELECT COUNT(*) FROM T1 WHERE V > ANY (SELECT V FROM S WHERE V > 100);\n(다) SELECT COUNT(*) FROM T1 WHERE V NOT IN (SELECT V FROM S WHERE V > 100);\n(라) SELECT COUNT(*) FROM T1 WHERE V > (SELECT MAX(V) FROM S WHERE V > 100);",
  o: ["2, 0, 2, 0", "3, 0, 3, 0", "0, 0, 0, 0", "3, 0, 3, 3"],
  a: 1,
  why: "서브쿼리가 공집합이면 ALL은 '반례가 하나도 없으므로' 무조건 TRUE, ANY는 '만족하는 값이 하나도 없으므로' 무조건 FALSE다. 이때는 비교 자체를 하지 않으므로 V가 NULL인 행도 > ALL과 NOT IN을 통과한다. 반면 (라)의 MAX는 공집합에서 NULL 1행을 돌려주므로 V > NULL = UNKNOWN이 되어 0건이다.",
  st: [
    { t: "1단계: 서브쿼리 결과", tb: { c: ["서브쿼리", "결과"], r: [["SELECT V … WHERE V > 100", "공집합 (0행)"], ["SELECT MAX(V) … WHERE V > 100", "NULL (1행)"]] } },
    { t: "2단계: 행별 판정", tb: { c: ["T1.V", "> ALL(∅)", "> ANY(∅)", "NOT IN(∅)", "> NULL"], r: [[10, "TRUE", "FALSE", "TRUE", "UNKNOWN"], [20, "TRUE", "FALSE", "TRUE", "UNKNOWN"], [null, "TRUE", "FALSE", "TRUE", "UNKNOWN"]], hl: [2] } }
  ],
  res: { c: ["가", "나", "다", "라"], r: [[3, 0, 3, 0]] },
  pg: "SELECT (SELECT COUNT(*) FROM T1 WHERE V > ALL (SELECT V FROM S WHERE V > 100)), (SELECT COUNT(*) FROM T1 WHERE V > ANY (SELECT V FROM S WHERE V > 100)), (SELECT COUNT(*) FROM T1 WHERE V NOT IN (SELECT V FROM S WHERE V > 100)), (SELECT COUNT(*) FROM T1 WHERE V > (SELECT MAX(V) FROM S WHERE V > 100))",
  ox: ["V가 NULL인 행은 비교가 UNKNOWN이라 빠진다고 본 경우다. 공집합이면 비교 자체가 일어나지 않아 TRUE다.", "정답.", "공집합과의 비교는 모두 FALSE라고 본 경우다.", "> ALL과 > (SELECT MAX…)를 같은 것으로 본 경우다. MAX는 공집합에서 NULL을 돌려준다."],
  trap: "ALL(공집합) = TRUE, ANY(공집합) = FALSE, NOT IN(공집합) = TRUE. 그리고 이 셋은 바깥 값이 NULL이어도 마찬가지다.",
  memo: "∅: ALL·NOT IN → 전부 통과(NULL 포함) / ANY·IN → 0건 / MAX(∅) = NULL"
},
{
  id: "S154", s: 2, tp: "sub", lv: 3, kill: true, sub: "서브쿼리",
  th: "2과목 | 연관 서브쿼리를 행마다 계산하기 (NULL 부서·NULL 급여)",
  q: "'같은 부서에서 나보다 급여가 높은 사람이 없는 사원'을 찾으려고 다음 SQL을 실행하였다. 출력되는 ENO를 모두 고른 것은?",
  tb: [{ n: "EMP", c: ["ENO", "DEPT", "SAL"], r: [[1, 10, 300], [2, 10, 200], [3, 10, 300], [4, 20, 100], [5, 20, null], [6, null, 500], [7, null, 400]] }],
  sql: "SELECT ENO\n  FROM EMP E\n WHERE (SELECT COUNT(*)\n          FROM EMP X\n         WHERE X.DEPT = E.DEPT\n           AND X.SAL  > E.SAL) = 0\n ORDER BY ENO;",
  o: ["1, 3, 4, 6", "1, 3, 4", "1, 3, 4, 6, 7", "1, 3, 4, 5, 6, 7"],
  a: 3,
  why: "연관 서브쿼리는 바깥 행마다 E.DEPT, E.SAL을 넣어 다시 실행된다. COUNT(*)는 조건을 만족하는 행이 없으면 0을 돌려준다. E.SAL이 NULL인 5번은 X.SAL > NULL이 항상 UNKNOWN이라 COUNT가 0이 되어 출력된다. DEPT가 NULL인 6, 7번은 X.DEPT = NULL이 항상 UNKNOWN이라 '같은 부서 사람'이 아무도 없는 것으로 계산되어 둘 다 출력된다(400인 7번도 500인 6번과 비교되지 않는다). 2번만 300인 1, 3번이 있어 탈락한다.",
  st: [
    { t: "1단계: 행마다 서브쿼리 실행", tb: { c: ["ENO", "DEPT", "SAL", "비교 대상", "COUNT(*)"], r: [[1, 10, 300, "10번 중 SAL > 300: 없음", 0], [2, 10, 200, "1, 3번 (300)", 2], [3, 10, 300, "없음", 0], [4, 20, 100, "5번은 SAL NULL → UNKNOWN", 0], [5, 20, null, "SAL > NULL → 항상 UNKNOWN", 0], [6, null, 500, "DEPT = NULL → 대상 없음", 0], [7, null, 400, "DEPT = NULL → 대상 없음", 0]], hl: [4, 5, 6] } },
    { t: "2단계: COUNT = 0인 행", tb: { c: ["ENO"], r: [[1], [3], [4], [5], [6], [7]] } }
  ],
  res: { c: ["ENO"], r: [[1], [3], [4], [5], [6], [7]] },
  pg: "SELECT ENO FROM EMP E WHERE (SELECT COUNT(*) FROM EMP X WHERE X.DEPT = E.DEPT AND X.SAL > E.SAL) = 0 ORDER BY ENO",
  ox: ["DEPT NULL 사원들을 GROUP BY처럼 한 부서로 묶어 7번을 빼고, SAL NULL인 5번도 뺀 경우다. 서브쿼리의 '=' 비교는 NULL끼리 같지 않다.", "NULL이 있는 행은 모두 탈락한다고 본 경우다. COUNT(*)는 0을 돌려주므로 = 0을 만족한다.", "5번(SAL NULL)만 뺀 경우다. 비교 대상이 없으면 COUNT는 0이다.", "정답."],
  trap: "GROUP BY는 NULL끼리 한 그룹으로 묶지만, 연관 서브쿼리의 X.DEPT = E.DEPT는 NULL끼리 같지 않다. 같은 '부서 NULL'이라도 서로 비교되지 않는다.",
  memo: "연관 조건 '='은 NULL 매칭 X / COUNT(*) 공집합 = 0"
},
{
  id: "S155", s: 2, tp: "sub", lv: 2, kill: true, sub: "서브쿼리",
  th: "2과목 | 스칼라 서브쿼리 결과가 0행일 때 (NULL)와 COUNT",
  q: "다음 [DEPT], [EMP] 테이블에 대해 SQL을 실행한 결과로 옳은 것은? (DNO(CNT, TOT) 형식)",
  tb: [
    { n: "DEPT", c: ["DNO"], r: [[10], [20], [30]] },
    { n: "EMP", c: ["ENO", "DNO", "SAL"], r: [[1, 10, 100], [2, 10, null], [3, 20, null]] }
  ],
  sql: "SELECT D.DNO,\n       (SELECT COUNT(*)   FROM EMP E WHERE E.DNO = D.DNO) AS CNT,\n       (SELECT SUM(E.SAL) FROM EMP E WHERE E.DNO = D.DNO) AS TOT\n  FROM DEPT D\n ORDER BY D.DNO;",
  o: ["10(2, 100), 20(1, NULL), 30(0, NULL)", "10(2, 100), 20(1, 0), 30(0, 0)", "10(2, 100), 20(1, NULL)", "10(1, 100), 20(0, NULL), 30(0, NULL)"],
  a: 0,
  why: "SELECT 절의 스칼라 서브쿼리는 바깥 행을 걸러 내지 않는다. 서브쿼리 결과가 0행이면 그 자리는 NULL이 된다. 여기서는 COUNT·SUM이 GROUP BY 없는 집계라 항상 1행을 돌려주며, 대상 행이 없을 때 COUNT는 0, SUM은 NULL이다. 20번 부서는 사원이 1명 있지만 SAL이 NULL뿐이라 SUM = NULL이다.",
  st: [
    { t: "1단계: 부서별 서브쿼리 대상 행", tb: { c: ["DNO", "대상 EMP 행", "SAL 값"], r: [[10, "1, 2", "100, NULL"], [20, "3", "NULL"], [30, "없음", "-"]] } },
    { t: "2단계: 결과", tb: { c: ["DNO", "CNT", "TOT"], r: [[10, 2, 100], [20, 1, null], [30, 0, null]] } }
  ],
  res: { c: ["DNO", "CNT", "TOT"], r: [[10, 2, 100], [20, 1, null], [30, 0, null]] },
  pg: "SELECT D.DNO, (SELECT COUNT(*) FROM EMP E WHERE E.DNO = D.DNO) AS CNT, (SELECT SUM(E.SAL) FROM EMP E WHERE E.DNO = D.DNO) AS TOT FROM DEPT D ORDER BY D.DNO",
  ox: ["정답.", "SUM도 대상이 없거나 모두 NULL이면 0이라고 본 경우다. SUM은 NULL이다.", "스칼라 서브쿼리 결과가 없으면 바깥 행도 사라진다고 본 경우다(내부 조인처럼). 스칼라 서브쿼리는 아우터 조인처럼 동작한다.", "COUNT(*)가 SAL이 NULL인 행을 세지 않는다고 본 경우다. COUNT(*)는 행을 센다."],
  trap: "스칼라 서브쿼리는 '없으면 NULL'이라 결과 행 수가 바깥 테이블 행 수와 항상 같다. 반대로 2행 이상을 돌려주면 오류(ORA-01427)다.",
  memo: "스칼라 서브쿼리: 0행 → NULL, 2행 이상 → 오류 / 바깥 행 수 유지"
},
{
  id: "S156", s: 2, tp: "sub", lv: 2, kill: true, sub: "서브쿼리",
  th: "2과목 | IN · EXISTS(세미 조인) vs JOIN — 중복 행과 NULL",
  q: "다음 [CUST], [ORD] 테이블에 대해 (가)~(라)의 결과 건수를 순서대로 나열한 것은?",
  tb: [
    { n: "CUST", c: ["CID"], r: [[1], [2], [3], [4]] },
    { n: "ORD", c: ["OID", "CID"], r: [[1, 1], [2, 1], [3, 2], [4, 2], [5, 2], [6, null]] }
  ],
  sql: "(가) SELECT COUNT(*) FROM CUST WHERE CID IN (SELECT CID FROM ORD);\n(나) SELECT COUNT(*) FROM CUST C JOIN ORD O ON O.CID = C.CID;\n(다) SELECT COUNT(*) FROM CUST C\n     WHERE EXISTS (SELECT 1 FROM ORD O WHERE O.CID = C.CID);\n(라) SELECT COUNT(*) FROM CUST WHERE CID NOT IN (SELECT CID FROM ORD);",
  o: ["2, 5, 2, 0", "5, 5, 5, 0", "2, 5, 2, 2", "2, 2, 2, 2"],
  a: 0,
  why: "IN과 EXISTS는 '짝이 하나라도 있는가'만 보는 세미 조인이라 바깥 행을 복제하지 않는다. 고객 1, 2의 2건이다. JOIN은 짝마다 행을 만들므로 고객 1(주문 2) + 고객 2(주문 3) = 5건이다. NOT IN은 서브쿼리에 NULL(6번 주문)이 있어 0건이다.",
  st: [
    { t: "1단계: 고객별 주문 수", tb: { c: ["CID", "주문 수", "IN / EXISTS", "JOIN 행", "NOT IN"], r: [[1, 2, "TRUE", 2, "FALSE"], [2, 3, "TRUE", 3, "FALSE"], [3, 0, "FALSE", 0, "UNKNOWN"], [4, 0, "FALSE", 0, "UNKNOWN"]] }, n: "ORD에 CID NULL 행이 있어 3, 4번의 NOT IN은 UNKNOWN" },
    { t: "2단계: 건수", tb: { c: ["(가)", "(나)", "(다)", "(라)"], r: [[2, 5, 2, 0]] } }
  ],
  res: { c: ["가", "나", "다", "라"], r: [[2, 5, 2, 0]] },
  pg: "SELECT (SELECT COUNT(*) FROM CUST WHERE CID IN (SELECT CID FROM ORD)), (SELECT COUNT(*) FROM CUST C JOIN ORD O ON O.CID = C.CID), (SELECT COUNT(*) FROM CUST C WHERE EXISTS (SELECT 1 FROM ORD O WHERE O.CID = C.CID)), (SELECT COUNT(*) FROM CUST WHERE CID NOT IN (SELECT CID FROM ORD))",
  ox: ["정답.", "IN과 EXISTS도 서브쿼리 결과의 중복만큼 바깥 행을 복제한다고 본 경우다.", "NOT IN이 NULL을 무시하고 3, 4번을 돌려준다고 본 경우다.", "JOIN도 중복을 제거한다고 보고, NOT IN도 서브쿼리의 NULL을 무시한다고 본 경우다."],
  trap: "IN 서브쿼리를 JOIN으로 바꿔 쓰면 자식 쪽 키가 중복될 때 건수가 달라진다. 반대로 IN은 중복을 걱정할 필요가 없다.",
  memo: "IN·EXISTS = 세미 조인(복제 없음) / JOIN = 짝마다 1행"
},
{
  id: "S157", s: 2, tp: "set", lv: 2, kill: true, sub: "집합 연산자",
  th: "2과목 | UNION은 같은 입력 안의 중복과 NULL 중복도 제거한다",
  q: "다음 [T1], [T2] 테이블에 대해 (가)~(다)의 결과 건수를 순서대로 나열한 것은?",
  tb: [
    { n: "T1", c: ["C"], r: [[1], [1], [2], [null], [null]] },
    { n: "T2", c: ["C"], r: [[3]] }
  ],
  sql: "(가) SELECT C FROM T1 UNION     SELECT C FROM T2;\n(나) SELECT C FROM T1 UNION ALL SELECT C FROM T2;\n(다) SELECT C FROM T1 UNION     SELECT C FROM T1;",
  o: ["6, 6, 5", "4, 6, 3", "5, 6, 4", "3, 6, 2"],
  a: 1,
  why: "UNION은 두 입력을 합친 '전체 결과'에서 중복을 제거한다. 두 입력 사이에 겹치는 값이 없어도, 한 입력 안에 있던 중복(1, 1)이 제거된다. 집합 연산에서는 NULL끼리도 같은 값으로 보므로 NULL, NULL도 하나만 남는다. (가)는 {1, 2, NULL, 3} = 4건, (다)는 {1, 2, NULL} = 3건이다. UNION ALL은 중복 제거 없이 5 + 1 = 6건이다.",
  st: [
    { t: "1단계: 합친 결과", tb: { c: ["SQL", "합친 값", "중복 제거 후"], r: [["(가) T1 UNION T2", "1, 1, 2, NULL, NULL, 3", "1, 2, 3, NULL"], ["(나) T1 UNION ALL T2", "1, 1, 2, NULL, NULL, 3", "(제거 없음)"], ["(다) T1 UNION T1", "1, 1, 2, NULL, NULL, 1, 1, 2, NULL, NULL", "1, 2, NULL"]] } },
    { t: "2단계: 건수", tb: { c: ["(가)", "(나)", "(다)"], r: [[4, 6, 3]] } }
  ],
  res: { c: ["가", "나", "다"], r: [[4, 6, 3]] },
  pg: "SELECT (SELECT COUNT(*) FROM (SELECT C FROM T1 UNION SELECT C FROM T2) x), (SELECT COUNT(*) FROM (SELECT C FROM T1 UNION ALL SELECT C FROM T2) x), (SELECT COUNT(*) FROM (SELECT C FROM T1 UNION SELECT C FROM T1) x)",
  ox: ["UNION이 '두 입력에 공통으로 있는 값'만 한 번 지운다고 본 경우다. (가)는 공통값이 없어 6, (다)는 5로 계산된다.", "정답.", "NULL끼리는 같지 않다고 보고 NULL을 2개 남긴 경우다. 집합 연산은 NULL을 같은 값으로 취급한다.", "UNION이 NULL을 제거한다고 본 경우다. NULL도 한 행으로 남는다."],
  trap: "SELECT DISTINCT 없이 'T1 UNION T1'만으로도 T1의 중복이 제거된다. UNION은 결과 전체에 DISTINCT를 거는 것과 같다.",
  memo: "UNION = (A + B) 전체 DISTINCT / 집합 연산에서 NULL = NULL"
},
{
  id: "S158", s: 2, tp: "set", lv: 3, kill: true, sub: "집합 연산자",
  th: "2과목 | INTERSECT · MINUS와 NULL · 중복",
  q: "다음 [T1], [T2] 테이블에 대해 (가)~(다)의 결과 건수를 순서대로 나열한 것은? (Oracle 기준)",
  tb: [
    { n: "T1", c: ["C"], r: [[1], [1], [2], [null], [3]] },
    { n: "T2", c: ["C"], r: [[1], [null], [null], [4]] }
  ],
  sql: "(가) SELECT C FROM T1 INTERSECT SELECT C FROM T2;\n(나) SELECT C FROM T1 MINUS     SELECT C FROM T2;\n(다) SELECT C FROM T2 MINUS     SELECT C FROM T1;",
  o: ["1, 3, 2", "2, 3, 2", "2, 2, 1", "3, 2, 1"],
  a: 2,
  why: "INTERSECT와 MINUS도 결과에서 중복을 제거하며, NULL끼리는 같은 값으로 비교한다(WHERE의 = 비교와 다르다). T1의 값 집합은 {1, 2, 3, NULL}, T2는 {1, 4, NULL}이다. 교집합은 {1, NULL} = 2건, T1 - T2는 {2, 3} = 2건, T2 - T1은 {4} = 1건이다.",
  st: [
    { t: "1단계: 각 입력의 값 집합 (중복 제거)", tb: { c: ["테이블", "값 집합"], r: [["T1", "{1, 2, 3, NULL}"], ["T2", "{1, 4, NULL}"]] } },
    { t: "2단계: 집합 연산", tb: { c: ["SQL", "결과", "건수"], r: [["(가) INTERSECT", "1, NULL", 2], ["(나) T1 MINUS T2", "2, 3", 2], ["(다) T2 MINUS T1", "4", 1]] } }
  ],
  res: { c: ["가", "나", "다"], r: [[2, 2, 1]] },
  pg: "SELECT (SELECT COUNT(*) FROM (SELECT C FROM T1 INTERSECT SELECT C FROM T2) x), (SELECT COUNT(*) FROM (SELECT C FROM T1 EXCEPT SELECT C FROM T2) x), (SELECT COUNT(*) FROM (SELECT C FROM T2 EXCEPT SELECT C FROM T1) x)",
  ox: ["NULL을 WHERE 비교처럼 '같지 않음'으로 처리한 경우다(교집합 {1}, T1-T2 {2, 3, NULL}, T2-T1 {4, NULL}).", "중복을 남기는 INTERSECT ALL/EXCEPT ALL처럼 계산한 경우다. Oracle의 INTERSECT·MINUS는 중복을 제거한다.", "정답.", "INTERSECT가 T1의 중복(1, 1)을 유지한다고 본 경우다."],
  trap: "같은 NULL이라도 WHERE·ON·IN의 '=' 비교에서는 UNKNOWN이지만, DISTINCT·GROUP BY·UNION·INTERSECT·MINUS에서는 같은 값이다.",
  memo: "집합 연산·DISTINCT·GROUP BY: NULL = NULL / WHERE·JOIN: NULL ≠ NULL"
},
{
  id: "S159", s: 2, tp: "set", lv: 3, kill: true, sub: "집합 연산자",
  th: "2과목 | 집합 연산 결과의 ORDER BY — 첫 SELECT 별칭과 위치 번호",
  q: "다음 [A], [B] 테이블에 대해 SQL을 실행했을 때 출력되는 첫 번째 컬럼의 순서로 옳은 것은? (Oracle 기준)",
  tb: [
    { n: "A", c: ["NAME", "SAL"], r: [["KIM", 300], ["LEE", 100], ["KIM", 300]] },
    { n: "B", c: ["DNAME", "BUDGET"], r: [["HR", 300], ["IT", null]] }
  ],
  sql: "SELECT NAME AS N, SAL FROM A\nUNION\nSELECT DNAME, BUDGET FROM B\n ORDER BY 2 DESC, N;",
  o: ["HR KIM LEE IT", "IT HR KIM KIM LEE", "IT KIM HR LEE", "IT HR KIM LEE"],
  a: 3,
  why: "집합 연산의 ORDER BY는 맨 마지막에 한 번만 쓰며, 컬럼 이름은 첫 번째 SELECT의 이름·별칭(N, SAL)을 따르고 위치 번호도 쓸 수 있다. UNION이 중복 행 (KIM, 300)을 하나로 줄인다. 두 번째 컬럼 내림차순에서 NULL(IT)이 가장 앞에 오고, 300으로 같은 HR과 KIM은 N 오름차순으로 HR, KIM 순이다.",
  st: [
    { t: "1단계: UNION 결과 (중복 제거)", tb: { c: ["N", "SAL"], r: [["KIM", 300], ["LEE", 100], ["HR", 300], ["IT", null]] } },
    { t: "2단계: ORDER BY 2 DESC, N", tb: { c: ["N", "SAL"], r: [["IT", null], ["HR", 300], ["KIM", 300], ["LEE", 100]] } }
  ],
  res: { c: ["N", "SAL"], r: [["IT", null], ["HR", 300], ["KIM", 300], ["LEE", 100]] },
  pg: "SELECT NAME AS N, SAL FROM A UNION SELECT DNAME, BUDGET FROM B ORDER BY 2 DESC, N",
  ox: ["내림차순에서 NULL이 마지막이라고 본 경우다.", "UNION이 같은 입력 안의 중복(KIM, 300)은 남긴다고 본 경우다.", "두 번째 키 N에도 DESC가 적용된다고 본 경우다.", "정답."],
  trap: "ORDER BY에 두 번째 SELECT의 이름(DNAME, BUDGET)을 쓰면 오류다. 결과 컬럼 이름은 첫 번째 SELECT가 정한다.",
  memo: "집합 연산 ORDER BY: 맨 끝 1회, 첫 SELECT 이름 또는 위치 번호"
},
{
  id: "S160", s: 2, tp: "set", lv: 3, kill: true, sub: "집합 연산자",
  th: "2과목 | 집합 연산자 연쇄 — Oracle은 위에서 아래로 같은 우선순위",
  q: "다음 [A], [B], [C] 테이블에 대해 SQL을 실행한 결과로 옳은 것은? (Oracle 기준)",
  tb: [
    { n: "A", c: ["X"], r: [[1], [2], [2]] },
    { n: "B", c: ["X"], r: [[2], [3]] },
    { n: "C", c: ["X"], r: [[2], [3], [4]] }
  ],
  sql: "SELECT X FROM A\nUNION ALL\nSELECT X FROM B\nINTERSECT\nSELECT X FROM C\n ORDER BY 1;",
  o: ["1, 2, 2, 2, 3", "2, 3", "1, 2, 3", "2, 2, 3"],
  a: 1,
  why: "Oracle에서 UNION, UNION ALL, INTERSECT, MINUS는 우선순위가 모두 같고, 괄호가 없으면 위에서 아래(왼쪽에서 오른쪽)로 차례대로 계산한다. 먼저 A UNION ALL B = 1, 2, 2, 2, 3을 만들고, 그 결과와 C를 INTERSECT하면 공통값 {2, 3}이 중복 제거되어 2건이다. (표준 SQL과 PostgreSQL은 INTERSECT를 먼저 계산하므로 같은 문장이 1, 2, 2, 2, 3을 돌려준다. 그래서 검증 쿼리는 Oracle의 순서를 괄호로 명시했다.)",
  st: [
    { t: "1단계: A UNION ALL B", tb: { c: ["X"], r: [[1], [2], [2], [2], [3]] } },
    { t: "2단계: (1단계) INTERSECT C", tb: { c: ["X"], r: [[2], [3]] }, n: "INTERSECT는 결과의 중복도 제거한다." }
  ],
  res: { c: ["X"], r: [[2], [3]] },
  pg: "(SELECT X FROM A UNION ALL SELECT X FROM B) INTERSECT SELECT X FROM C ORDER BY 1",
  ox: ["INTERSECT를 먼저 계산한 경우다(B ∩ C = {2, 3}을 A에 UNION ALL). 표준 SQL·PostgreSQL 방식이며 Oracle과 다르다.", "정답.", "순서는 맞혔지만 INTERSECT 단계를 빼고 중복만 제거한 경우다. 1은 C에 없다.", "INTERSECT가 결과의 중복을 제거하지 않는다고 보고 2를 중복으로 남긴 경우다. INTERSECT는 결과의 중복을 제거한다."],
  trap: "Oracle 공식 문서도 '향후 표준에 맞춰 INTERSECT 우선순위가 바뀔 수 있으니 괄호를 쓰라'고 권고한다. 시험에서는 Oracle 기준 위→아래 순서로 계산한다.",
  memo: "Oracle 집합 연산자: 우선순위 동일, 위→아래 / 혼용 시 괄호"
}
);
