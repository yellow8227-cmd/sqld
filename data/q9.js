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
  sum: "NULL은 '모르는 값'이라 10, 20과 비교해도 '아니다'라고 말할 수 없어서 (가)·(나)에서 빠져요. (다)는 목록에 NULL이 끼어 있어서 어떤 행도 통과하지 못해요.",
  why: "NOT IN (10, 20)은 '10도 아니고, 20도 아니다'를 둘 다 확인하는 조건이에요. 즉 DEPT <> 10 AND DEPT <> 20으로 풀어서 계산해요. WHERE는 이 결과가 확실히 참인 행만 남기고, 거짓이거나 '모름'인 행은 버려요.\n\nNULL은 '값을 모른다'는 뜻이에요. 그래서 NULL <> 10을 물으면 DB는 참인지 거짓인지 정할 수 없어 '모름'(UNKNOWN)이라고 답해요. '모름'이 AND로 섞이면 전체도 확실한 참이 될 수 없어요.\n\n(가)를 행마다 보면 10, 20인 1·2·6번은 거짓, 30·40인 3·5번은 참, NULL인 4번은 모름이에요. 그래서 2건이에요. (나)는 NOT (DEPT = 10 OR DEPT = 20)인데, 4번 행은 괄호 안이 모름이고 모름을 뒤집어도 여전히 모름이라 역시 빠져요. 그래서 2건이에요.\n\n(다)는 목록에 NULL이 있어서 모든 행에 'AND DEPT <> NULL'이 붙어요. 이 부분은 어떤 행이든 항상 모름이에요. **목록에 NULL이 하나라도 있으면 NOT IN은 어떤 행도 참으로 만들 수 없어서 0건이 돼요.** 정답은 2, 2, 0이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- (가)\nSELECT COUNT(*)                      -- ③ 참으로 남은 행 수를 세요\n  FROM T                             -- ① 6행을 읽어요\n WHERE DEPT NOT IN (10, 20);         -- ② DEPT <> 10 AND DEPT <> 20 (4번 NULL은 모름)\n-- (나)\nSELECT COUNT(*)                      -- ③ 행 수를 세요\n  FROM T                             -- ①\n WHERE NOT (DEPT = 10 OR DEPT = 20); -- ② 괄호 안이 모름이면 NOT을 해도 모름\n-- (다)\nSELECT COUNT(*)                      -- ③ 0\n  FROM T                             -- ①\n WHERE DEPT NOT IN (10, 20, NULL);   -- ② … AND DEPT <> NULL → 늘 모름 → 아무도 통과 못 함" },
    { t: "원본", tb: { c: ["ID", "DEPT"], r: [[1, 10], [2, 20], [3, 30], [4, null], [5, 40], [6, 10]], hl: [3] } },
    { t: "1단계: 행마다 참·거짓·모름 따져 보기", tb: { c: ["ID", "DEPT", "(가)", "(나)", "(다)"], r: [[1, 10, "거짓 (FALSE)", "거짓 (FALSE)", "거짓 (FALSE)"], [2, 20, "거짓 (FALSE)", "거짓 (FALSE)", "거짓 (FALSE)"], [3, 30, "참 (TRUE)", "참 (TRUE)", "모름 (UNKNOWN)"], [4, null, "모름 (UNKNOWN)", "모름 (UNKNOWN)", "모름 (UNKNOWN)"], [5, 40, "참 (TRUE)", "참 (TRUE)", "모름 (UNKNOWN)"], [6, 10, "거짓 (FALSE)", "거짓 (FALSE)", "거짓 (FALSE)"]], hl: [3] } },
    { t: "2단계: 참(TRUE)인 행만 세기", tb: { c: ["SQL", "통과 행", "건수"], r: [["(가)", "3, 5", 2], ["(나)", "3, 5", 2], ["(다)", "없음", 0]] } },
    { t: "의도대로 쓰려면: NULL 부서도 '10, 20이 아닌 행'에 넣기", n: "SELECT COUNT(*)\n  FROM T\n WHERE DEPT NOT IN (10, 20)\n    OR DEPT IS NULL;          -- 3, 4(NULL), 5번 → 3건\n-- 또는 WHERE NVL(DEPT, -1) NOT IN (10, 20) → 3건\n-- NOT IN 목록에는 NULL을 넣지 마세요 (넣는 순간 0건)" }
  ],
  res: { c: ["가", "나", "다"], r: [[2, 2, 0]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE DEPT NOT IN (10, 20)), (SELECT COUNT(*) FROM T WHERE NOT (DEPT = 10 OR DEPT = 20)), (SELECT COUNT(*) FROM T WHERE DEPT NOT IN (10, 20, NULL))",
  ox: ["이렇게 생각하면 틀려요: 'NULL인 4번 행은 10도 20도 아니니까 통과'. NULL은 모르는 값이라 '아니다'라고 확인할 수 없어서 (가)·(나) 모두에서 빠져요.", "정답이에요. (가)·(나)는 30, 40인 3·5번 행만 남아 2건이고, (다)는 목록의 NULL 때문에 0건이에요.", "이렇게 생각하면 틀려요: '(나)는 NOT이 있으니까 모르는 행이 뒤집혀서 살아난다'. 모름을 뒤집어도 여전히 모름이라 4번 행은 (나)에서도 빠져요.", "이렇게 생각하면 틀려요: '목록 안의 NULL은 아무 값도 아니니 무시된다'. 실제로는 모든 행에 'DEPT <> NULL'(늘 모름)이 붙어서 0건이 돼요."],
  trap: "NULL이 컬럼 쪽에 있으면 그 행만 빠지고, NULL이 NOT IN 목록 쪽에 있으면 전부 빠져요. NOT (… OR …)으로 바꿔 써도 NULL 행은 살아나지 않아요.",
  memo: "컬럼이 NULL → 그 행만 빠짐 / 목록에 NULL → NOT IN 0건"
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
  sum: "NOT IN은 서브쿼리 결과에 NULL이 '실제로 남아 있을 때만' 0건이 돼요. (가)는 V > 6이 NULL을 미리 걸렀고, (다)는 NVL이 NULL을 0으로 바꿔서 정상적으로 계산돼요.",
  why: "NOT IN 서브쿼리는 서브쿼리가 돌려준 값마다 'V와 다르다'를 확인하고, 전부 다르다고 확인돼야 통과시켜요. 그래서 돌려준 값 중에 NULL이 하나라도 있으면 그 비교가 '모름'이 되어 어떤 행도 통과하지 못해요.\n\n중요한 점은 테이블 S에 NULL이 있느냐가 아니에요. **서브쿼리가 실제로 돌려준 결과에 NULL이 남았는지를 봐야 해요.**\n\n(가)의 서브쿼리는 WHERE V > 6이에요. NULL > 6은 모름이라 NULL 행은 여기서 이미 빠지고, 결과는 {10, 20}이에요. NULL이 없으니 NOT IN이 정상으로 동작해요. T1에서 3, 5, 8, 12는 통과하고 10은 걸려요. V가 NULL인 5번 행은 비교가 모름이라 빠져요. 그래서 4건이에요.\n\n(나)는 OR V IS NULL이 NULL 행을 일부러 살려서 결과가 {5, NULL}이에요. 그래서 0건이에요. (다)는 NVL(V, 0)이 NULL을 0으로 바꿔 {5, 10, 0, 20}이 돼요. 3, 8, 12만 통과해서 3건이에요. 정답은 4, 0, 3이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- (가)\nSELECT COUNT(*) FROM T1                    -- ③ 참인 행 수\n WHERE V NOT IN (SELECT V FROM S           -- ② V <> 10 AND V <> 20\n                  WHERE V > 6);            -- ① NULL > 6은 모름 → NULL 행 빠짐 → {10, 20}\n-- (나)\nSELECT COUNT(*) FROM T1                    -- ③ 0\n WHERE V NOT IN (SELECT V FROM S           -- ② … AND V <> NULL → 아무도 통과 못 함\n                  WHERE V < 6 OR V IS NULL); -- ① IS NULL이 NULL을 살림 → {5, NULL}\n-- (다)\nSELECT COUNT(*) FROM T1                    -- ③ 참인 행 수\n WHERE V NOT IN (SELECT NVL(V, 0) FROM S); -- ① {5, 10, 0, 20} ② NULL 없는 보통 NOT IN" },
    { t: "1단계: 서브쿼리 결과", tb: { c: ["SQL", "서브쿼리 결과", "NULL 포함?"], r: [["(가)", "10, 20", "아니오 (V > 6이 NULL을 거름)"], ["(나)", "5, NULL", "예"], ["(다)", "5, 10, 0, 20", "아니오 (NVL로 0)"]] } },
    { t: "2단계: T1 행마다 NOT IN 결과 (참·거짓·모름)", tb: { c: ["T1.V", "(가)", "(나)", "(다)"], r: [[3, "참 (TRUE)", "모름 (UNKNOWN)", "참 (TRUE)"], [5, "참 (TRUE)", "거짓 (FALSE)", "거짓 (FALSE)"], [8, "참 (TRUE)", "모름 (UNKNOWN)", "참 (TRUE)"], [10, "거짓 (FALSE)", "모름 (UNKNOWN)", "거짓 (FALSE)"], [null, "모름 (UNKNOWN)", "모름 (UNKNOWN)", "모름 (UNKNOWN)"], [12, "참 (TRUE)", "모름 (UNKNOWN)", "참 (TRUE)"]] }, n: "(가) 4건, (나) 0건, (다) 3건" },
    { t: "의도대로 쓰려면: (나)에서 '5가 아닌 행' 구하기", n: "-- 서브쿼리에서 NULL을 빼면 NOT IN이 제대로 동작해요\nSELECT COUNT(*) FROM T1\n WHERE V NOT IN (SELECT V FROM S WHERE V < 6);  -- {5} → 3, 8, 10, 12 = 4건\n-- T1의 NULL 행까지 남기려면 NOT EXISTS\nSELECT COUNT(*) FROM T1\n WHERE NOT EXISTS (SELECT 1 FROM S\n                    WHERE S.V = T1.V\n                      AND (S.V < 6 OR S.V IS NULL)); -- 3, 8, 10, NULL, 12 = 5건" }
  ],
  res: { c: ["가", "나", "다"], r: [[4, 0, 3]] },
  pg: "SELECT (SELECT COUNT(*) FROM T1 WHERE V NOT IN (SELECT V FROM S WHERE V > 6)), (SELECT COUNT(*) FROM T1 WHERE V NOT IN (SELECT V FROM S WHERE V < 6 OR V IS NULL)), (SELECT COUNT(*) FROM T1 WHERE V NOT IN (SELECT COALESCE(V, 0) FROM S))",
  ox: ["이렇게 생각하면 틀려요: 'T1에서 V가 NULL인 행도 서브쿼리 값과 다르니 통과'. 바깥 값이 NULL이면 비교가 모름이라 그 행은 항상 빠져요.", "이렇게 생각하면 틀려요: 'NULL이 있는 테이블을 서브쿼리로 쓰면 무조건 0건'. (가)는 V > 6이 NULL을 미리 걸렀고, (다)는 NVL이 NULL을 0으로 바꿨어요.", "이렇게 생각하면 틀려요: '(나)의 NULL은 무시하고 {5}만으로 계산'. 서브쿼리 결과에 NULL이 남아 있으면 모든 행의 비교에 모름이 섞여서 0건이에요.", "정답이에요. (가)는 NULL이 걸러진 {10, 20}이라 4건, (나)는 NULL이 남아 0건, (다)는 NULL이 0으로 바뀌어 3건이에요."],
  trap: "서브쿼리 테이블에 NULL이 있다는 것만 보고 0건을 고르면 안 돼요. V > 6 같은 비교 조건이 NULL을 미리 걸렀는지, IS NULL이 NULL을 살렸는지, NVL로 바뀌었는지까지 확인하세요.",
  memo: "비교 조건은 NULL을 걸러 줌 → NOT IN 안전 / IS NULL·NVL 없이 NULL이 남으면 → 0건"
},
{
  id: "S123", s: 2, tp: "notin", lv: 2, kill: true, sub: "WHERE 절",
  th: "2과목 | BETWEEN · LIKE · <> 의 부정과 NULL",
  q: "다음 [T] 테이블에 대해 (가)~(라)를 각각 실행했을 때 결과 건수를 순서대로 나열한 것은?",
  tb: [{ n: "T", c: ["ID", "NAME", "SAL"], r: [[1, "ADAMS", 100], [2, "ALLEN", null], [3, null, 250], [4, "BLAKE", 300], [5, "CLARK", 350], [6, "SMITH", 200]] }],
  sql: "(가) SELECT COUNT(*) FROM T WHERE SAL BETWEEN 100 AND 300;\n(나) SELECT COUNT(*) FROM T WHERE SAL NOT BETWEEN 100 AND 300;\n(다) SELECT COUNT(*) FROM T WHERE NAME NOT LIKE 'A%';\n(라) SELECT COUNT(*) FROM T WHERE SAL <> 200;",
  o: ["4, 2, 4, 5", "4, 1, 3, 4", "4, 2, 3, 4", "4, 1, 4, 5"],
  a: 1,
  sum: "NULL은 범위 안인지 밖인지, 'A'로 시작하는지 아닌지 알 수 없어요. 그래서 BETWEEN에도, NOT BETWEEN에도, NOT LIKE·<>에도 NULL 행은 들어가지 않아요.",
  why: "BETWEEN, LIKE, <>는 모두 값을 비교하는 조건이에요. 비교하는 값이 NULL이면 결과는 '모름'이에요. 앞에 NOT을 붙여도 모름을 뒤집으면 여전히 모름이라 결과는 같아요.\n\nNULL은 '값을 모른다'는 뜻이에요. 모르는 값을 두고 '100~300 사이다'라고도, '100~300 밖이다'라고도 단정할 수 없어요. 그래서 DB는 두 질문 모두에 '모름'으로 답하고, WHERE는 모름인 행을 버려요.\n\n이 데이터에서 SAL이 NULL인 행은 2번이에요. (가) BETWEEN은 1, 3, 4, 6번 4건이고, (나) NOT BETWEEN은 350인 5번 1건이에요. 2번 행은 어느 쪽에도 들지 않아서 4 + 1 = 5로 전체 6건보다 1건 적어요.\n\n(다)에서는 NAME이 NULL인 3번 행이 빠지고, 'A'로 시작하는 ADAMS·ALLEN도 빠져서 3건이에요. (라)에서는 SAL이 200인 6번과 SAL이 NULL인 2번이 빠져서 4건이에요. **어떤 조건과 그 반대 조건의 건수를 더하면, NULL 행 수만큼 전체보다 모자라요.** 정답은 4, 1, 3, 4예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- 네 문장 모두 ① FROM T(6행) → ② WHERE → ③ COUNT(*) 순서예요\nSELECT COUNT(*) FROM T WHERE SAL BETWEEN 100 AND 300;     -- ② SAL >= 100 AND SAL <= 300\nSELECT COUNT(*) FROM T WHERE SAL NOT BETWEEN 100 AND 300; -- ② SAL < 100 OR SAL > 300 (NULL은 모름)\nSELECT COUNT(*) FROM T WHERE NAME NOT LIKE 'A%';          -- ② NAME이 NULL이면 모름\nSELECT COUNT(*) FROM T WHERE SAL <> 200;                  -- ② NULL <> 200은 모름" },
    { t: "원본", tb: { c: ["ID", "NAME", "SAL"], r: [[1, "ADAMS", 100], [2, "ALLEN", null], [3, null, 250], [4, "BLAKE", 300], [5, "CLARK", 350], [6, "SMITH", 200]], hl: [1, 2] } },
    { t: "1단계: 행마다 따져 보기 (참·거짓·모름)", tb: { c: ["ID", "(가) BETWEEN", "(나) NOT BETWEEN", "(다) NOT LIKE 'A%'", "(라) <> 200"], r: [[1, "참 (TRUE)", "거짓 (FALSE)", "거짓 (FALSE)", "참 (TRUE)"], [2, "모름 (UNKNOWN)", "모름 (UNKNOWN)", "거짓 (FALSE)", "모름 (UNKNOWN)"], [3, "참 (TRUE)", "거짓 (FALSE)", "모름 (UNKNOWN)", "참 (TRUE)"], [4, "참 (TRUE)", "거짓 (FALSE)", "참 (TRUE)", "참 (TRUE)"], [5, "거짓 (FALSE)", "참 (TRUE)", "참 (TRUE)", "참 (TRUE)"], [6, "참 (TRUE)", "거짓 (FALSE)", "참 (TRUE)", "거짓 (FALSE)"]] } },
    { t: "2단계: 참인 행 수", tb: { c: ["(가)", "(나)", "(다)", "(라)"], r: [[4, 1, 3, 4]] }, n: "(가) + (나) = 5로 6이 안 돼요. SAL이 NULL인 2번 행은 어느 쪽에도 들지 않아요." },
    { t: "의도대로 쓰려면: NULL 행도 '조건에 안 맞는 쪽'에 넣기", n: "SELECT COUNT(*) FROM T\n WHERE SAL NOT BETWEEN 100 AND 300 OR SAL IS NULL;  -- 2, 5번 → 2건\nSELECT COUNT(*) FROM T\n WHERE NAME NOT LIKE 'A%' OR NAME IS NULL;          -- 3, 4, 5, 6번 → 4건\nSELECT COUNT(*) FROM T\n WHERE NVL(SAL, 0) <> 200;                          -- 1~5번 → 5건" }
  ],
  res: { c: ["가", "나", "다", "라"], r: [[4, 1, 3, 4]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE SAL BETWEEN 100 AND 300), (SELECT COUNT(*) FROM T WHERE SAL NOT BETWEEN 100 AND 300), (SELECT COUNT(*) FROM T WHERE NAME NOT LIKE 'A%'), (SELECT COUNT(*) FROM T WHERE SAL <> 200)",
  ox: ["이렇게 생각하면 틀려요: 'NULL은 200이 아니니까 <>를 통과하고, 범위 밖이니까 NOT BETWEEN도 통과'. NULL과 비교하면 무엇이든 모름이라 부정 조건에서도 빠져요.", "정답이에요. NULL인 행은 BETWEEN에도 NOT BETWEEN에도 들지 않아서 4, 1, 3, 4가 돼요.", "이렇게 생각하면 틀려요: '(나)는 (가)의 나머지니까 6 - 4 = 2'. SAL이 NULL인 2번 행은 NOT BETWEEN에서도 모름이라 나머지에 들어가지 않아요.", "이렇게 생각하면 틀려요: '(나)만 NULL이 빠지고, NOT LIKE와 <>에서는 NULL이 통과'. NAME이 NULL인 3번, SAL이 NULL인 2번도 각각 모름이라 빠져요."],
  trap: "'조건 건수 + 반대 조건 건수 = 전체 건수'는 그 컬럼에 NULL이 없을 때만 맞아요.",
  memo: "NOT BETWEEN / NOT LIKE / <> 에서도 NULL 행은 빠짐"
},
{
  id: "S124", s: 2, tp: "basic", lv: 2, kill: true, sub: "WHERE 절",
  th: "2과목 | NOT · AND · OR 우선순위 (괄호 없는 조건식)",
  q: "다음 [T] 테이블에 대해 SQL을 실행한 결과로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "A", "B", "C"], r: [[1, 1, 2, 3], [2, 1, 2, 0], [3, 2, 2, 0], [4, 2, 1, 3], [5, 1, 1, 0], [6, 2, 1, 0], [7, 2, 2, 3], [8, 1, 1, 3], [9, 2, 1, 1]] }],
  sql: "SELECT COUNT(*)\n  FROM T\n WHERE NOT A = 1 AND B = 2 OR C = 3;",
  o: ["4", "3", "8", "5"],
  a: 3,
  sum: "괄호가 없으면 NOT이 먼저, 그다음 AND, 마지막에 OR로 묶여요. 그래서 '(A가 1이 아니고 B가 2) 또는 C가 3'이 되어 1, 3, 4, 7, 8번 5건이에요.",
  why: "괄호가 없을 때 논리 연산자는 NOT → AND → OR 순서로 묶여요. 그리고 NOT은 바로 뒤의 조건 하나에만 붙어요.\n\n산수에서 '곱셈이 덧셈보다 먼저'라고 정해 둔 것과 같은 이유예요. 순서를 정해 두지 않으면 같은 식을 사람마다 다르게 읽을 수 있기 때문이에요.\n\n그래서 이 조건은 **((NOT A = 1) AND B = 2) OR C = 3, 즉 (A <> 1 AND B = 2) OR C = 3으로 읽어요.** 앞쪽 'A가 1이 아니고 B가 2'인 행은 3번(2, 2)과 7번(2, 2)이에요. 뒤쪽 'C가 3'인 행은 1, 4, 7, 8번이에요.\n\nOR는 둘 중 하나만 맞아도 통과예요. 두 묶음을 합치면 1, 3, 4, 7, 8번(7번은 중복)으로 5건이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT COUNT(*)                       -- ④ 참인 행 수를 세요 → 5\n  FROM T                              -- ① 9행을 읽어요\n WHERE NOT A = 1                      -- ② NOT은 A = 1 하나에만 → A <> 1\n   AND B = 2                          -- ③ AND가 먼저 묶여요 → (A <> 1 AND B = 2): 3, 7번\n    OR C = 3;                         -- ③ OR는 마지막 → C = 3인 1, 4, 7, 8번을 더해요" },
    { t: "1단계: 괄호를 붙여 다시 쓰기", n: "-- 괄호를 직접 쳐 보면\n((NOT A = 1) AND B = 2) OR C = 3\n-- NOT A = 1은 A <> 1과 같아요\n(A <> 1 AND B = 2) OR C = 3" },
    { t: "2단계: 행마다 따져 보기 (참·거짓)", tb: { c: ["ID", "A", "B", "C", "A<>1 AND B=2", "C=3", "결과"], r: [[1, 1, 2, 3, "거짓 (FALSE)", "참 (TRUE)", "참 (TRUE)"], [2, 1, 2, 0, "거짓 (FALSE)", "거짓 (FALSE)", "거짓 (FALSE)"], [3, 2, 2, 0, "참 (TRUE)", "거짓 (FALSE)", "참 (TRUE)"], [4, 2, 1, 3, "거짓 (FALSE)", "참 (TRUE)", "참 (TRUE)"], [5, 1, 1, 0, "거짓 (FALSE)", "거짓 (FALSE)", "거짓 (FALSE)"], [6, 2, 1, 0, "거짓 (FALSE)", "거짓 (FALSE)", "거짓 (FALSE)"], [7, 2, 2, 3, "참 (TRUE)", "참 (TRUE)", "참 (TRUE)"], [8, 1, 1, 3, "거짓 (FALSE)", "참 (TRUE)", "참 (TRUE)"], [9, 2, 1, 1, "거짓 (FALSE)", "거짓 (FALSE)", "거짓 (FALSE)"]], hl: [0, 2, 3, 6, 7] } },
    { t: "의도대로 쓰려면: 뜻을 괄호로 못 박기", n: "-- 문제의 SQL과 같은 뜻 (괄호만 써 줌)\nSELECT COUNT(*) FROM T WHERE (A <> 1 AND B = 2) OR C = 3;      -- 5\n-- 'A가 1이 아니면서, B = 2 또는 C = 3'을 원했다면\nSELECT COUNT(*) FROM T WHERE A <> 1 AND (B = 2 OR C = 3);      -- 3, 4, 7번 → 3\n-- 'NOT이 뒤의 식 전체에 걸리게'를 원했다면\nSELECT COUNT(*) FROM T WHERE NOT ((A = 1 AND B = 2) OR C = 3); -- 4" }
  ],
  res: { c: ["COUNT(*)"], r: [[5]] },
  pg: "SELECT COUNT(*) FROM T WHERE NOT A = 1 AND B = 2 OR C = 3",
  ox: ["이렇게 생각하면 틀려요: 'NOT이 뒤의 식 전체에 걸린다'. 그러면 NOT ((A = 1 AND B = 2) OR C = 3)이 되어 4건이지만, NOT은 바로 뒤의 A = 1 하나에만 붙어요.", "이렇게 생각하면 틀려요: 'OR를 먼저 묶는다'. 그러면 A <> 1 AND (B = 2 OR C = 3)이 되어 3건이지만, AND가 OR보다 먼저 묶여요.", "이렇게 생각하면 틀려요: 'NOT이 (A = 1 AND B = 2)까지 감싼다'. 그러면 8건이 나오지만, NOT은 AND보다 먼저 A = 1에 붙어요.", "정답이에요. (A <> 1 AND B = 2) OR C = 3이라 1, 3, 4, 7, 8번 5건이에요."],
  trap: "NOT은 바로 뒤의 비교 하나에만 붙어요. 괄호가 없으면 NOT → AND → OR 순서로 괄호를 직접 쳐 보고 계산하세요.",
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
  sum: "A가 NULL인 3번 행은 'A = 1인가?'에 '모름'이라 답이 나오고, 모름은 NOT으로 뒤집어도 모름이라 빠져요. 두 질문 모두 확실히 '아니오'인 2, 6번만 나와요.",
  why: "NULL이 섞이면 조건의 답이 참·거짓 말고 '모름'(UNKNOWN)이 될 수 있어요. 규칙은 이래요. 'OR'는 하나라도 참이면 참이에요. 거짓과 모름을 OR하면 모름이에요. NOT은 참↔거짓을 바꾸지만, 모름은 뒤집어도 모름이에요.\n\n모름은 '참일 수도 거짓일 수도 있다'는 뜻이라, 반대로 뒤집어도 여전히 알 수 없기 때문이에요. 한편 IS NULL은 NULL인지 아닌지를 확실히 답해 주는 조건이라 모름을 만들지 않아요.\n\n행마다 볼게요. 2번(A 2, B 10)과 6번(A 3, B 20)은 두 질문이 모두 거짓 → OR 거짓 → NOT 참이라 나와요. 3번(A NULL, B 10)은 A = 1이 모름, B IS NULL이 거짓이라 OR가 모름이고, NOT을 해도 모름이라 빠져요. 5번(A NULL, B NULL)은 B IS NULL이 참이라 OR가 참이 되고, NOT으로 거짓이 되어 빠져요. 1, 4, 7번도 OR가 참이라 빠져요.\n\n**NOT을 붙여도 모름은 참이 되지 않아요.** 그래서 결과는 2, 6번뿐이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT ID                            -- ③ 남은 행의 ID\n  FROM T                             -- ① 7행을 읽어요\n WHERE NOT (A = 1 OR B IS NULL)      -- ② 풀어 쓰면 A <> 1 AND B IS NOT NULL\n                                     --    A가 NULL이면 A <> 1이 모름 → 3번 빠짐\n ORDER BY ID;                        -- ④ 2, 6" },
    { t: "1단계: 행마다 참·거짓·모름 따져 보기", tb: { c: ["ID", "A", "B", "A = 1", "B IS NULL", "OR", "NOT (…)"], r: [[1, 1, 10, "참 (TRUE)", "거짓 (FALSE)", "참 (TRUE)", "거짓 (FALSE)"], [2, 2, 10, "거짓 (FALSE)", "거짓 (FALSE)", "거짓 (FALSE)", "참 (TRUE)"], [3, null, 10, "모름 (UNKNOWN)", "거짓 (FALSE)", "모름 (UNKNOWN)", "모름 (UNKNOWN)"], [4, 2, null, "거짓 (FALSE)", "참 (TRUE)", "참 (TRUE)", "거짓 (FALSE)"], [5, null, null, "모름 (UNKNOWN)", "참 (TRUE)", "참 (TRUE)", "거짓 (FALSE)"], [6, 3, 20, "거짓 (FALSE)", "거짓 (FALSE)", "거짓 (FALSE)", "참 (TRUE)"], [7, 1, null, "참 (TRUE)", "참 (TRUE)", "참 (TRUE)", "거짓 (FALSE)"]], hl: [1, 5] } },
    { t: "2단계: 참인 행만 출력", tb: { c: ["ID"], r: [[2], [6]] } },
    { t: "의도대로 쓰려면: A가 NULL인 행도 'A가 1이 아님'에 넣기", n: "SELECT ID\n  FROM T\n WHERE (A <> 1 OR A IS NULL)\n   AND B IS NOT NULL\n ORDER BY ID;          -- 2, 3, 6" }
  ],
  res: { c: ["ID"], r: [[2], [6]] },
  pg: "SELECT ID FROM T WHERE NOT (A = 1 OR B IS NULL) ORDER BY ID",
  ox: ["이렇게 생각하면 틀려요: 'A가 NULL이니 1이 아니고, NOT이니 3번은 통과'. NULL = 1은 모름이고, 모름은 뒤집어도 모름이라 3번은 빠져요. 이 답을 원하면 A IS NULL을 따로 넣어야 해요.", "정답이에요. 두 질문이 모두 확실히 거짓인 2, 6번만 NOT으로 참이 돼요.", "이렇게 생각하면 틀려요: 'NULL이 섞인 3, 5번은 둘 다 통과'. 5번은 B IS NULL이 참이라 괄호 안이 참이 되고, NOT으로 거짓이 되어 빠져요.", "이렇게 생각하면 틀려요: 'NOT이 붙었으니 NULL이 있는 행만 남는다'. NOT은 모름을 참으로 바꾸지 못해요."],
  trap: "풀어 쓰면 A <> 1 AND B IS NOT NULL이에요. A가 NULL이면 A <> 1이 모름이라 3번 행이 빠져요. 'NOT을 붙이면 NULL 행이 살아난다'는 착각을 노린 문제예요.",
  memo: "모름은 NOT 해도 모름 / IS NULL은 늘 참·거짓으로 답함"
},
{
  id: "S126", s: 2, tp: "notin", lv: 3, kill: true, sub: "WHERE 절",
  th: "2과목 | 컬럼끼리의 <> 비교와 NVL, NOT의 결합",
  q: "다음 [T] 테이블에 대해 (가)~(다)를 실행했을 때 결과 건수를 순서대로 나열한 것은?",
  tb: [{ n: "T", c: ["ID", "SAL", "COMM"], r: [[1, 100, 100], [2, 100, null], [3, null, null], [4, 200, 0], [5, null, 0], [6, 300, 200]] }],
  sql: "(가) SELECT COUNT(*) FROM T WHERE SAL <> COMM;\n(나) SELECT COUNT(*) FROM T WHERE NVL(SAL, 0) <> NVL(COMM, 0);\n(다) SELECT COUNT(*) FROM T WHERE NOT (SAL = COMM OR SAL IS NULL);",
  o: ["4, 3, 2", "2, 3, 3", "2, 3, 2", "2, 5, 2"],
  a: 2,
  sum: "한쪽이라도 NULL이면 '같다/다르다'를 알 수 없어서 (가)에서는 빠져요. NVL로 NULL을 0으로 바꾸면 0과 0은 '같은 값'이 돼서 3, 5번은 오히려 걸러져요.",
  why: "= 나 <> 같은 비교는 한쪽만 NULL이어도, 양쪽 다 NULL이어도 답이 '모름'이에요. NULL은 모르는 값이라 두 값이 같은지 다른지 판단할 수 없기 때문이에요. WHERE는 모름인 행을 버려요.\n\n(가) SAL <> COMM을 행마다 보면 1번(100, 100)은 같아서 거짓이에요. 2, 3, 5번은 NULL이 끼어 있어 모름이에요. 4번(200, 0)과 6번(300, 200)만 참이라 2건이에요.\n\n(나)는 비교하기 전에 NVL이 NULL을 0으로 바꿔요. 2번은 100과 0이 되어 '다름'(참)이에요. 3번은 0과 0, 5번도 0과 0이 되어 '같음'(거짓)이에요. 그래서 2, 4, 6번 3건이에요. NVL은 NULL을 진짜 값으로 바꿔 비교 결과 자체를 바꾸므로, 바꾼 값이 상대 값과 겹치는지 꼭 확인해야 해요.\n\n(다)는 '같은 값이거나, SAL이 비어 있으면 빼라'는 조건이에요. 한 줄씩 볼게요.\n\n· 1번(100, 100): 같은 값이라 빠져요.\n· 3번, 5번: SAL이 비어 있어서 빠져요.\n· 2번(100, 빈칸): 여기가 함정이에요. 'SAL이 비었나?'는 '아니요'로 분명해요. 그런데 '100과 빈칸이 같나?'는 알 수 없어요. 빼라는 확실한 근거도, 남기라는 확실한 근거도 없는 상태예요. **WHERE는 확실히 맞는 줄만 내보내기 때문에 2번도 결과에 안 나와요.**\n· 4번(200, 0), 6번(300, 200): 같지도 않고 비어 있지도 않아서 남아요.\n\n그래서 (다)는 2건이에요. 정답은 (가) 2, (나) 3, (다) 2예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- 세 문장 모두 ① FROM T(6행) → ② WHERE → ③ COUNT(*)\nSELECT COUNT(*) FROM T WHERE SAL <> COMM;                     -- ② 한쪽이라도 NULL이면 모름\nSELECT COUNT(*) FROM T WHERE NVL(SAL, 0) <> NVL(COMM, 0);     -- ② NULL을 0으로 바꾼 뒤 비교\nSELECT COUNT(*) FROM T WHERE NOT (SAL = COMM OR SAL IS NULL); -- ② = SAL <> COMM AND SAL IS NOT NULL\n                                                              --    2번: 모름 AND 참 = 모름" },
    { t: "1단계: 행마다 따져 보기 (참·거짓·모름)", tb: { c: ["ID", "SAL", "COMM", "(가) SAL<>COMM", "(나) NVL 비교", "(다) NOT(SAL=COMM OR SAL IS NULL)"], r: [[1, 100, 100, "거짓 (FALSE)", "100<>100 거짓", "NOT(참 OR 거짓) = 거짓"], [2, 100, null, "모름 (UNKNOWN)", "100<>0 참", "NOT(모름 OR 거짓) = 모름"], [3, null, null, "모름 (UNKNOWN)", "0<>0 거짓", "NOT(모름 OR 참) = 거짓"], [4, 200, 0, "참 (TRUE)", "200<>0 참", "NOT(거짓 OR 거짓) = 참"], [5, null, 0, "모름 (UNKNOWN)", "0<>0 거짓", "NOT(모름 OR 참) = 거짓"], [6, 300, 200, "참 (TRUE)", "300<>200 참", "NOT(거짓 OR 거짓) = 참"]] } },
    { t: "2단계: 건수", tb: { c: ["(가)", "(나)", "(다)"], r: [[2, 3, 2]] } },
    { t: "의도대로 쓰려면: 'NULL끼리는 같고, NULL과 값은 다르다'로 비교하기", n: "-- Oracle: DECODE는 NULL과 NULL을 같다고 봐요\nSELECT COUNT(*) FROM T\n WHERE DECODE(SAL, COMM, 0, 1) = 1;   -- 2, 4, 5, 6번 → 4건\n-- 표준 SQL(PostgreSQL 등): WHERE SAL IS DISTINCT FROM COMM → 4건" }
  ],
  res: { c: ["가", "나", "다"], r: [[2, 3, 2]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE SAL <> COMM), (SELECT COUNT(*) FROM T WHERE COALESCE(SAL, 0) <> COALESCE(COMM, 0)), (SELECT COUNT(*) FROM T WHERE NOT (SAL = COMM OR SAL IS NULL))",
  ox: ["이렇게 생각하면 틀려요: '100과 NULL, NULL과 0은 서로 다르니 (가)에서 통과'. 한쪽이 NULL이면 다른지 같은지 알 수 없어서(모름) 빠져요.", "이렇게 생각하면 틀려요: '(다)의 2번 행은 NOT이 있으니 살아난다'. 괄호 안이 모름이면 NOT을 해도 모름이라 빠져요.", "정답이에요. (가)는 4·6번, (나)는 2·4·6번, (다)는 4·6번이에요.", "이렇게 생각하면 틀려요: 'NVL을 써도 원래 NULL이던 3, 5번은 다른 값'. NVL 뒤에는 둘 다 0이라 같은 값이 되어 걸러져요."],
  trap: "NVL을 쓰면 NULL끼리(3번)와 NULL·0(5번)이 '같은 값'이 되어 오히려 걸러져요. NVL로 바꿀 값이 상대 컬럼의 실제 값과 겹치는지도 확인하세요.",
  memo: "값과 NULL 비교 → 모름 / NVL은 비교 결과 자체를 바꿈"
},
{
  id: "S127", s: 2, tp: "basic", lv: 3, kill: true, sub: "WHERE 절",
  th: "2과목 | LIKE '%' || NULL || '%' — Oracle 문자열 연결과 NULL",
  q: "검색 화면에서 검색어를 입력하지 않아 바인드 변수 :KW에 NULL이 전달되었다. 다음 [T] 테이블에 대해 SQL을 실행한 결과로 옳은 것은? (Oracle 기준)",
  tb: [{ n: "T", c: ["ID", "NAME"], r: [[1, "KIM"], [2, "LEE"], [3, null], [4, "PARK"], [5, "CHOI"], [6, "JUNG"]] }],
  sql: "SELECT COUNT(*)\n  FROM T\n WHERE NAME LIKE '%' || :KW || '%';",
  o: ["0", "1", "5", "6"],
  a: 2,
  sum: "Oracle에서 '%' || NULL || '%'는 '%%'가 되어 '아무 글자나'를 뜻해요. 하지만 NAME이 NULL인 행은 어떤 패턴과도 맞는지 알 수 없어서 빠지고 5건이에요.",
  why: "Oracle의 문자열 잇기(||)는 NULL을 빈 문자열처럼 그냥 건너뛰어요. Oracle은 길이 0인 문자열 ''와 NULL을 같은 것으로 다루기 때문이에요. 그래서 '%' || NULL || '%'는 NULL이 아니라 '%%'가 돼요.\n\n'%%'는 '0글자 이상 아무 문자열'이라는 패턴이에요. KIM, LEE, PARK, CHOI, JUNG은 모두 이 패턴에 맞아요.\n\n하지만 LIKE도 비교라서 왼쪽 값 NAME이 NULL이면 답이 '모름'이에요. 모르는 값이 어떤 글자인지 알 수 없으니까요. 그래서 NAME이 NULL인 3번 행은 빠져요.\n\n**LIKE '%'는 '모든 행'이 아니라 'NULL이 아닌 모든 행'과 맞아요.** 결과는 5건이에요. 참고로 표준 SQL처럼 ||가 NULL을 그대로 퍼뜨렸다면 패턴이 NULL이 되어 0건이었을 거예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT COUNT(*)                        -- ④ 참인 행 수 → 5\n  FROM T                               -- ① 6행을 읽어요\n WHERE NAME LIKE '%' || :KW || '%';    -- ② :KW = NULL → Oracle ||는 NULL을 건너뜀 → '%%'\n                                       -- ③ 값이 있는 행은 참, NAME이 NULL인 3번은 모름" },
    { t: "1단계: 패턴 계산", tb: { c: ["식", "Oracle 결과"], r: [["'%' || NULL || '%'", "'%%'"], ["NULL + 1 (비교용)", "NULL"]] } },
    { t: "2단계: 행마다 LIKE '%%' (참·모름)", tb: { c: ["ID", "NAME", "NAME LIKE '%%'"], r: [[1, "KIM", "참 (TRUE)"], [2, "LEE", "참 (TRUE)"], [3, null, "모름 (UNKNOWN)"], [4, "PARK", "참 (TRUE)"], [5, "CHOI", "참 (TRUE)"], [6, "JUNG", "참 (TRUE)"]], hl: [2] } },
    { t: "의도대로 쓰려면: 검색어가 없으면 전체 행 보여 주기", n: "SELECT COUNT(*)\n  FROM T\n WHERE (:KW IS NULL OR NAME LIKE '%' || :KW || '%');\n-- :KW = NULL → 앞 조건이 참 → 6건 (NAME이 NULL인 행 포함)\n-- :KW = 'K'  → KIM, PARK → 2건" }
  ],
  res: { c: ["COUNT(*)"], r: [[5]] },
  pg: "SELECT COUNT(*) FROM T WHERE NAME LIKE CONCAT('%', NULL::text, '%')",
  ox: ["이렇게 생각하면 틀려요: 'NULL을 이어 붙이면 결과도 NULL이니 패턴이 NULL'. 그건 더하기·빼기나 표준 SQL 규칙이고, Oracle의 ||는 NULL을 건너뛰어 '%%'를 만들어요.", "이렇게 생각하면 틀려요: '패턴이 NULL이 되어 NAME이 NULL인 행끼리 맞는다'. NULL은 어떤 비교로도 맞았다고 판정되지 않아요.", "정답이에요. 패턴은 '%%'이고, NAME이 NULL인 3번 행만 빠져서 5건이에요.", "이렇게 생각하면 틀려요: ''%'는 무조건 모든 행과 맞는다'. NAME이 NULL인 행은 LIKE 결과가 모름이라 빠져요."],
  trap: "LIKE '%'는 'NULL이 아닌 모든 행'이에요. 검색어가 없을 때 전체가 나오길 기대한 화면에서 NAME이 NULL인 데이터가 사라지는 실무 버그와 같아요.",
  memo: "Oracle: 'A' || NULL = 'A' / LIKE '%'도 NULL 행은 빠짐"
},
{
  id: "S128", s: 2, tp: "agg", lv: 2, kill: true, sub: "GROUP BY, HAVING 절",
  th: "2과목 | 그룹별 COUNT(*) · COUNT(컬럼) · COUNT(DISTINCT)와 HAVING",
  q: "다음 [T] 테이블에 대해 SQL을 실행한 결과로 옳은 것은? (괄호 안은 DB 값)",
  tb: [{ n: "T", c: ["ID", "DEPT", "BONUS"], r: [[1, 10, 100], [2, 10, 100], [3, 10, null], [4, 20, 200], [5, 20, 300], [6, null, null], [7, null, 50], [8, 30, null]] }],
  sql: "SELECT DEPT, COUNT(DISTINCT BONUS) AS DB\n  FROM T\n GROUP BY DEPT\nHAVING COUNT(BONUS) < COUNT(*)\n ORDER BY DEPT;",
  o: ["10(1), 30(0), NULL(1)", "10(2), 30(1), NULL(2)", "10(1), NULL(1)", "10(1), 30(0)"],
  a: 0,
  sum: "HAVING COUNT(BONUS) < COUNT(*)는 'BONUS가 빈 행이 있는 그룹'이라 10, 30, NULL 그룹이 남아요. COUNT는 셀 게 없으면 0을 돌려주고, Oracle은 NULL을 맨 뒤에 정렬해요.",
  why: "SQL은 FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY 순서로 처리돼요. GROUP BY는 DEPT가 NULL인 행들도 버리지 않고 하나의 그룹으로 묶어요.\n\n집계 함수는 계산하기 전에 NULL 값을 빼고 계산해요. COUNT(*)만 예외로, 값과 상관없이 행 자체를 세요. 그래서 COUNT(BONUS) < COUNT(*)는 'BONUS가 NULL인 행이 하나라도 있는 그룹'이라는 뜻이에요.\n\n그룹마다 볼게요. 10은 3행 중 BONUS가 있는 행이 2개라 통과예요. 20은 2행 모두 BONUS가 있어 탈락이에요. 30은 1행이고 BONUS가 비어 있어 0 < 1로 통과예요. NULL 그룹은 2행 중 1개만 있어 통과예요.\n\n**COUNT는 셀 값이 하나도 없으면 NULL이 아니라 0을 돌려줘요.** 그래서 30 그룹의 COUNT(DISTINCT BONUS)는 0이에요. 10은 {100}, NULL 그룹은 {50}이라 각각 1이에요. Oracle은 오름차순에서 NULL을 맨 뒤에 두므로 10(1), 30(0), NULL(1) 순서예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT DEPT, COUNT(DISTINCT BONUS) AS DB  -- ④ NULL을 빼고 서로 다른 값 개수\n  FROM T                                  -- ① 8행\n GROUP BY DEPT                            -- ② 10, 20, 30, NULL 네 그룹 (NULL도 한 그룹)\nHAVING COUNT(BONUS) < COUNT(*)            -- ③ BONUS가 빈 행이 있는 그룹만: 10, 30, NULL\n ORDER BY DEPT;                           -- ⑤ 오름차순 → NULL은 맨 뒤 (Oracle)" },
    { t: "1단계: 그룹별 집계", tb: { c: ["DEPT", "COUNT(*)", "COUNT(BONUS)", "COUNT(DISTINCT BONUS)", "HAVING"], r: [[10, 3, 2, 1, "2 < 3 통과"], [20, 2, 2, 2, "2 < 2 탈락"], [30, 1, 0, 0, "0 < 1 통과"], [null, 2, 1, 1, "1 < 2 통과"]], hl: [0, 2, 3] } },
    { t: "2단계: 정렬 (오름차순에서 NULL은 맨 뒤)", tb: { c: ["DEPT", "DB"], r: [[10, 1], [30, 0], [null, 1]] } }
  ],
  res: { c: ["DEPT", "DB"], r: [[10, 1], [30, 0], [null, 1]] },
  pg: "SELECT DEPT, COUNT(DISTINCT BONUS) AS DB FROM T GROUP BY DEPT HAVING COUNT(BONUS) < COUNT(*) ORDER BY DEPT",
  ox: ["정답이에요. 10(1), 30(0), NULL(1) 순서로 나와요.", "이렇게 생각하면 틀려요: 'COUNT(DISTINCT)는 NULL도 하나의 값으로 센다'. 집계 함수는 NULL을 먼저 빼고 서로 다른 값만 세요.", "이렇게 생각하면 틀려요: 'BONUS가 전부 NULL인 30 그룹은 COUNT도 NULL이라 사라진다'. COUNT는 0을 돌려줘서 0 < 1로 통과해요.", "이렇게 생각하면 틀려요: 'GROUP BY는 DEPT가 NULL인 행을 버린다'. NULL끼리도 한 그룹으로 묶이고, 이 그룹도 BONUS가 빈 행이 있어 통과해요."],
  trap: "COUNT는 셀 것이 없어도 NULL이 아니라 0을 돌려줘요. SUM·AVG·MAX가 NULL을 돌려주는 것과 구분하세요.",
  memo: "GROUP BY는 NULL도 한 그룹 / COUNT(컬럼) = 0 (NULL 아님)"
},
{
  id: "S129", s: 2, tp: "agg", lv: 3, kill: true, sub: "GROUP BY, HAVING 절",
  th: "2과목 | HAVING AVG — NULL이 분모에서 빠지는 효과",
  q: "다음 [T] 테이블에 대해 SQL을 실행했을 때 출력되는 DEPT를 모두 고른 것은?",
  tb: [{ n: "T", c: ["DEPT", "SAL"], r: [["A", 300], ["A", null], ["A", 100], ["B", 250], ["B", null], ["B", null], ["C", 150], ["C", 150], ["D", null], ["D", null]] }],
  sql: "SELECT DEPT, AVG(SAL) AS AVG_SAL\n  FROM T\n GROUP BY DEPT\nHAVING AVG(SAL) >= 150\n ORDER BY DEPT;",
  o: ["C", "A, B, C", "A, B, C, D", "A, B"],
  a: 1,
  sum: "AVG는 NULL을 아예 빼고 '있는 값끼리만' 평균을 내요. 그래서 A는 200, B는 250, C는 150이 되어 통과하고, 값이 하나도 없는 D는 평균이 NULL이라 빠져요.",
  why: "AVG(SAL)은 'SAL 합계 ÷ SAL 값이 있는 행 수'로 계산해요. NULL은 더하는 쪽에서도, 나누는 행 수에서도 빠져요.\n\n집계 함수는 모르는 값을 0이라고 멋대로 추측하지 않고, 아예 계산에서 빼도록 정해져 있기 때문이에요.\n\n그룹마다 볼게요. A는 300, NULL, 100이라 (300 + 100) ÷ 2 = 200이에요. B는 250, NULL, NULL이라 250 ÷ 1 = 250이에요. C는 (150 + 150) ÷ 2 = 150이에요. D는 값이 하나도 없어서 평균이 NULL이에요.\n\nHAVING AVG(SAL) >= 150에서 D는 'NULL이 150 이상인가?'에 모름이라 빠져요. C는 150이라 '이상'에 포함돼요. **NULL이 많은 그룹일수록 AVG(컬럼)은 NULL을 0으로 본 평균보다 커 보여요.** 그래서 A, B, C 세 그룹이 나와요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT DEPT, AVG(SAL) AS AVG_SAL   -- ④ 그룹별 평균 출력\n  FROM T                           -- ① 10행\n GROUP BY DEPT                     -- ② A, B, C, D 네 그룹\nHAVING AVG(SAL) >= 150             -- ③ AVG = 합계 ÷ 값 있는 행 수 (NULL은 양쪽에서 빠짐)\n                                   --    D는 평균이 NULL → 모름 → 빠짐\n ORDER BY DEPT;                    -- ⑤ A, B, C" },
    { t: "1단계: 그룹별 분자·분모", tb: { c: ["DEPT", "SUM(SAL)", "COUNT(SAL)", "AVG(SAL)", "AVG(NVL(SAL,0)) 참고"], r: [["A", 400, 2, 200, "133.3"], ["B", 250, 1, 250, "83.3"], ["C", 300, 2, 150, "150"], ["D", null, 0, null, "0"]] } },
    { t: "2단계: HAVING AVG(SAL) >= 150", tb: { c: ["DEPT", "AVG_SAL"], r: [["A", 200], ["B", 250], ["C", 150]] }, n: "D: 'NULL >= 150?'은 모름이라 빠져요." },
    { t: "의도대로 쓰려면: NULL을 0으로 보고 평균 내기", n: "SELECT DEPT, AVG(NVL(SAL, 0)) AS AVG_SAL\n  FROM T\n GROUP BY DEPT\nHAVING AVG(NVL(SAL, 0)) >= 150\n ORDER BY DEPT;     -- C(150)만 나와요 (A 133.3, B 83.3, D 0은 빠짐)" }
  ],
  res: { c: ["DEPT", "AVG_SAL"], r: [["A", 200], ["B", 250], ["C", 150]] },
  pg: "SELECT DEPT, AVG(SAL) AS AVG_SAL FROM T GROUP BY DEPT HAVING AVG(SAL) >= 150 ORDER BY DEPT",
  ox: ["이렇게 생각하면 틀려요: 'NULL도 0으로 보고 나누는 수에 넣는다'. 그러면 A 133.3, B 83.3이 되지만, 그건 AVG(NVL(SAL, 0))의 결과예요. AVG(SAL)은 NULL을 아예 빼요.", "정답이에요. A 200, B 250, C 150이 통과하고 D는 평균이 NULL이라 빠져요.", "이렇게 생각하면 틀려요: '값이 전부 NULL인 D도 나온다'. D의 평균은 NULL이고, NULL과 비교하면 모름이라 빠져요.", "이렇게 생각하면 틀려요: 'C는 딱 150이라 >= 150이 안 된다'. >=는 같은 값도 포함해요."],
  trap: "AVG(컬럼)과 AVG(NVL(컬럼, 0))은 나누는 행 수가 달라요. NULL이 많은 그룹일수록 AVG(컬럼)이 부풀려 보여요.",
  memo: "AVG = 합계 ÷ 값 있는 행 수 / 전부 NULL이면 AVG = NULL"
},
{
  id: "S130", s: 2, tp: "agg", lv: 3, kill: true, sub: "GROUP BY, HAVING 절",
  th: "2과목 | SUM(A + B) vs SUM(A) + SUM(B), 전부 NULL인 그룹",
  q: "다음 [T] 테이블에 대해 SQL을 실행한 결과로 옳은 것은? (각 행은 X, Y, Z 순)",
  tb: [{ n: "T", c: ["DEPT", "SAL", "BONUS"], r: [[10, 100, 10], [10, 200, null], [10, 300, 30], [20, 400, null], [20, 500, null]] }],
  sql: "SELECT DEPT,\n       SUM(SAL + BONUS)       AS X,\n       SUM(SAL) + SUM(BONUS)  AS Y,\n       SUM(BONUS)             AS Z\n  FROM T\n GROUP BY DEPT\n ORDER BY DEPT;",
  o: ["10 → 640, 640, 40 / 20 → 900, 900, 0", "10 → 440, 640, 40 / 20 → NULL, 900, NULL", "10 → 440, 640, 40 / 20 → NULL, NULL, NULL", "10 → 440, 640, 40 / 20 → 0, 900, 0"],
  a: 2,
  sum: "SAL + BONUS는 행마다 먼저 더해서, BONUS가 NULL인 행은 통째로 NULL이 되어 합계에서 빠져요. BONUS가 하나도 없는 20번 부서는 SUM(BONUS)가 0이 아니라 NULL이라 Y도 NULL이에요.",
  why: "SUM(SAL + BONUS)는 행마다 SAL + BONUS를 먼저 계산하고 나서 합쳐요. 더하기에 NULL이 끼면 결과가 NULL이 되고, SUM은 NULL인 행을 건너뛰어요.\n\n반면 SUM(SAL) + SUM(BONUS)는 컬럼별로 따로 합계를 낸 뒤 마지막에 더해요. 그래서 BONUS가 NULL인 행의 SAL도 SUM(SAL)에는 들어가요.\n\n10번 부서를 보면 행마다 110, NULL, 330이라 X = 440이에요(200인 행이 빠짐). Y는 SUM(SAL) 600 + SUM(BONUS) 40 = 640이에요. Z는 40이에요.\n\n20번 부서는 BONUS가 모두 NULL이에요. **더할 값이 하나도 없는 SUM(BONUS)는 0이 아니라 NULL이에요.** 그래서 Z가 NULL이고, Y는 900 + NULL이라 NULL이에요. 행마다 SAL + BONUS도 전부 NULL이라 X도 NULL이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT DEPT,\n       SUM(SAL + BONUS)       AS X,  -- ③ 행마다 먼저 더함 → NULL인 행은 SUM이 건너뜀\n       SUM(SAL) + SUM(BONUS)  AS Y,  -- ③ 합계끼리 더함 → 한쪽이 NULL이면 NULL\n       SUM(BONUS)             AS Z   -- ③ 더할 값이 없으면 NULL (0이 아님)\n  FROM T                             -- ① 5행\n GROUP BY DEPT                       -- ② 10, 20 두 그룹\n ORDER BY DEPT;                      -- ④" },
    { t: "1단계: 행별 SAL + BONUS", tb: { c: ["DEPT", "SAL", "BONUS", "SAL + BONUS"], r: [[10, 100, 10, 110], [10, 200, null, null], [10, 300, 30, 330], [20, 400, null, null], [20, 500, null, null]] } },
    { t: "2단계: 그룹별 집계", tb: { c: ["DEPT", "SUM(SAL+BONUS)", "SUM(SAL)", "SUM(BONUS)", "SUM(SAL)+SUM(BONUS)"], r: [[10, 440, 600, 40, 640], [20, null, 900, null, null]], hl: [1] } },
    { t: "의도대로 쓰려면: BONUS가 없으면 0으로 보고 더하기", n: "SELECT DEPT,\n       SUM(SAL + NVL(BONUS, 0))         AS X,  -- 10: 640 / 20: 900\n       SUM(SAL) + NVL(SUM(BONUS), 0)    AS Y,  -- 10: 640 / 20: 900\n       NVL(SUM(BONUS), 0)               AS Z   -- 10: 40  / 20: 0\n  FROM T\n GROUP BY DEPT\n ORDER BY DEPT;   -- 보기 ①이 바로 이 SQL의 결과예요" }
  ],
  res: { c: ["DEPT", "X", "Y", "Z"], r: [[10, 440, 640, 40], [20, null, null, null]] },
  pg: "SELECT DEPT, SUM(SAL + BONUS) AS X, SUM(SAL) + SUM(BONUS) AS Y, SUM(BONUS) AS Z FROM T GROUP BY DEPT ORDER BY DEPT",
  ox: ["이렇게 생각하면 틀려요: 'NULL은 0처럼 더해진다'. 그건 NVL을 넣었을 때의 결과예요. 원래 SQL에서는 더하기에 NULL이 끼면 결과가 NULL이 돼요.", "이렇게 생각하면 틀려요: '900 + NULL은 900'. 합계를 다 낸 뒤의 더하기는 보통 더하기라 NULL이 끼면 NULL이에요.", "정답이에요. 10 → 440, 640, 40 / 20 → 셋 다 NULL이에요.", "이렇게 생각하면 틀려요: '전부 NULL인 그룹의 SUM은 0'. SUM은 더할 값이 하나도 없으면 NULL을 돌려줘요. 0을 원하면 NVL(SUM(…), 0)으로 감싸야 해요."],
  trap: "SUM은 NULL을 건너뛰지만, 건너뛸 값밖에 없으면 NULL이에요. 또 합계끼리 더하는 SUM + SUM은 보통 더하기라 NULL이 퍼져요.",
  memo: "SUM(A+B) ≠ SUM(A)+SUM(B) (NULL 있을 때) / 전부 NULL → SUM = NULL"
},
{
  id: "S131", s: 2, tp: "agg", lv: 2, kill: true, sub: "GROUP BY, HAVING 절",
  th: "2과목 | WHERE → GROUP BY → HAVING 순서와 NULL 그룹",
  q: "다음 [T] 테이블에 대해 SQL을 실행한 결과로 옳은 것은? (괄호 안은 CNT 값)",
  tb: [{ n: "T", c: ["DEPT", "SAL"], r: [[10, 50], [10, 150], [10, 200], [20, 300], [20, null], [null, 120], [null, 130], [null, 90], [30, 500]] }],
  sql: "SELECT DEPT, COUNT(*) AS CNT\n  FROM T\n WHERE SAL > 100\n GROUP BY DEPT\nHAVING COUNT(*) >= 2\n ORDER BY DEPT;",
  o: ["10(2)", "10(2), 20(1), NULL(2)", "10(3), NULL(3)", "10(2), NULL(2)"],
  a: 3,
  sum: "WHERE가 먼저 행을 거르고, 남은 행으로 그룹을 만든 뒤 HAVING이 그룹을 걸러요. SAL > 100을 통과한 행으로 세면 10번 2건, NULL 부서 2건만 '2건 이상'이에요.",
  why: "SQL은 FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY 순서로 처리돼요. WHERE는 '행'을 거르고, HAVING은 그룹을 다 만든 다음 '그룹'을 걸러요.\n\n이렇게 나뉜 이유는 '그룹의 건수'처럼 그룹을 만들어야 알 수 있는 값은 WHERE 단계에서는 아직 없기 때문이에요. 그래서 HAVING과 SELECT의 COUNT(*)는 둘 다 WHERE를 통과한 행만 세요.\n\n먼저 WHERE SAL > 100을 행마다 볼게요. 10번 부서는 50이 빠지고 150, 200이 남아요. 20번은 300이 남고, SAL이 NULL인 행은 'NULL > 100?'이 모름이라 빠져요. DEPT가 NULL인 행은 120, 130이 남고 90이 빠져요. 30번은 500이 남아요.\n\n이제 그룹을 만들면 10(2건), 20(1건), NULL(2건), 30(1건)이에요. DEPT가 NULL인 행들도 한 그룹으로 묶여요. **HAVING COUNT(*) >= 2를 통과하는 그룹은 10과 NULL이고, 건수는 둘 다 WHERE 뒤의 2건이에요.** 오름차순이라 NULL은 맨 뒤에 와요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT DEPT, COUNT(*) AS CNT   -- ⑤ 그룹별로 WHERE를 통과한 행 수\n  FROM T                       -- ① 9행\n WHERE SAL > 100               -- ② 행을 걸러요: 50, 90, NULL 행이 빠짐 → 6행\n GROUP BY DEPT                 -- ③ 10(2), 20(1), NULL(2), 30(1)\nHAVING COUNT(*) >= 2           -- ④ 그룹을 걸러요: 10, NULL만 남음\n ORDER BY DEPT;                -- ⑥ 오름차순 → NULL은 맨 뒤 (Oracle)" },
    { t: "1단계: WHERE SAL > 100", tb: { c: ["DEPT", "SAL"], r: [[10, 150], [10, 200], [20, 300], [null, 120], [null, 130], [30, 500]] }, n: "50, 90, SAL이 NULL인 행이 빠져요." },
    { t: "2단계: GROUP BY + HAVING", tb: { c: ["DEPT", "COUNT(*)", "HAVING >= 2"], r: [[10, 2, "통과"], [20, 1, "탈락"], [30, 1, "탈락"], [null, 2, "통과"]], hl: [0, 3] } }
  ],
  res: { c: ["DEPT", "CNT"], r: [[10, 2], [null, 2]] },
  pg: "SELECT DEPT, COUNT(*) AS CNT FROM T WHERE SAL > 100 GROUP BY DEPT HAVING COUNT(*) >= 2 ORDER BY DEPT",
  ox: ["이렇게 생각하면 틀려요: 'DEPT가 NULL인 행은 그룹이 안 된다'. GROUP BY는 NULL끼리도 한 그룹으로 묶고, 이 그룹은 2건이라 통과해요.", "이렇게 생각하면 틀려요: 'HAVING은 WHERE 전의 원래 건수(10:3, 20:2, NULL:3)로 판단한다'. HAVING도 WHERE를 통과한 행으로 만든 그룹을 봐요. 20번은 1건이라 빠져요.", "이렇게 생각하면 틀려요: 'CNT는 원래 건수(10:3, NULL:3)'. SELECT의 COUNT(*)도 WHERE를 통과한 행만 세서 2건씩이에요.", "정답이에요. WHERE 뒤에 2건 이상인 그룹은 10과 NULL이고, 둘 다 2건이에요."],
  trap: "처리 순서는 FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY예요. HAVING의 COUNT(*)도 WHERE를 통과한 행만 세요.",
  memo: "WHERE는 행, HAVING은 그룹 / NULL 키도 한 그룹"
},
{
  id: "S132", s: 2, tp: "agg", lv: 2, sub: "GROUP BY, HAVING 절",
  th: "2과목 | 공집합 집계 — GROUP BY 유무에 따른 결과 행 수",
  q: "다음 [EMP] 테이블에 DEPT = 99인 행은 없다. (가)~(라)의 결과 행 수를 순서대로 나열한 것은?",
  tb: [{ n: "EMP", c: ["ENO", "DEPT", "SAL"], r: [[1, 10, 100], [2, 20, null], [3, 20, 300]] }],
  sql: "(가) SELECT COUNT(*), SUM(SAL) FROM EMP WHERE DEPT = 99;\n(나) SELECT COUNT(*), SUM(SAL) FROM EMP WHERE DEPT = 99 GROUP BY DEPT;\n(다) SELECT NVL(MAX(SAL), 0)   FROM EMP WHERE DEPT = 99;\n(라) SELECT NVL(SAL, 0)        FROM EMP WHERE DEPT = 99;",
  o: ["1, 1, 1, 1", "1, 0, 1, 0", "0, 0, 1, 0", "1, 0, 1, 1"],
  a: 1,
  sum: "GROUP BY가 없는 집계는 행이 0건이어도 '전체 1그룹'으로 보고 늘 1행을 돌려줘요. GROUP BY가 있거나 집계가 아니면 만들 행이 없어서 0행이에요.",
  why: "GROUP BY 없이 COUNT·SUM·MAX 같은 집계 함수만 쓰면, DB는 남은 행 전체를 '하나의 그룹'으로 봐요. 행이 0건이어도 그 그룹은 있다고 보고 결과 1행을 만들어요. 이때 COUNT는 0, SUM·MAX는 NULL이에요.\n\n이렇게 하는 이유는 '대상이 몇 건이냐?'에 '0건'이라고 답할 수 있어야 하기 때문이에요. 반면 GROUP BY가 있으면 '그룹마다 1행'인데, 그룹이 하나도 만들어지지 않으니 결과도 0행이에요.\n\n이 문제는 네 문장 모두 WHERE DEPT = 99에서 행이 0건이 돼요. (가)는 GROUP BY 없는 집계라 1행(0, NULL)이에요. (나)는 GROUP BY DEPT가 있어 그룹이 없으니 0행이에요. (다)는 MAX가 1행(NULL)을 만들고 NVL이 그 NULL을 0으로 바꿔 1행이에요.\n\n(라)의 NVL은 집계가 아니라 '행마다' 적용되는 함수예요. 입력 행이 없으면 적용할 대상도 없어서 0행이에요. **'값이 NULL인 것'과 '행이 아예 없는 것'은 달라요. NVL은 앞의 것만 고쳐 줘요.** 정답은 1, 0, 1, 0이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- 네 문장 모두 ① FROM EMP → ② WHERE DEPT = 99 → 0건\nSELECT COUNT(*), SUM(SAL) FROM EMP WHERE DEPT = 99;               -- ③ 전체 1그룹 → 1행 (0, NULL)\nSELECT COUNT(*), SUM(SAL) FROM EMP WHERE DEPT = 99 GROUP BY DEPT; -- ③ 만들 그룹 없음 → 0행\nSELECT NVL(MAX(SAL), 0)   FROM EMP WHERE DEPT = 99;               -- ③ MAX → 1행(NULL) ④ NVL → 0\nSELECT NVL(SAL, 0)        FROM EMP WHERE DEPT = 99;               -- ③ 행마다 함수 → 행이 없으니 0행" },
    { t: "1단계: WHERE DEPT = 99 → 0건", n: "네 문장 모두 남는 행이 0건이에요." },
    { t: "2단계: SQL별 결과", tb: { c: ["SQL", "구분", "결과"], r: [["(가)", "집계, GROUP BY 없음", "1행 (0, NULL)"], ["(나)", "집계, GROUP BY 있음", "0행"], ["(다)", "집계 + NVL", "1행 (0)"], ["(라)", "단일행 함수", "0행"]] } }
  ],
  res: { c: ["가", "나", "다", "라"], r: [[1, 0, 1, 0]] },
  pg: "SELECT (SELECT COUNT(*) FROM (SELECT COUNT(*), SUM(SAL) FROM EMP WHERE DEPT = 99) x), (SELECT COUNT(*) FROM (SELECT COUNT(*), SUM(SAL) FROM EMP WHERE DEPT = 99 GROUP BY DEPT) x), (SELECT COUNT(*) FROM (SELECT COALESCE(MAX(SAL), 0) FROM EMP WHERE DEPT = 99) x), (SELECT COUNT(*) FROM (SELECT COALESCE(SAL, 0) FROM EMP WHERE DEPT = 99) x)",
  ox: ["이렇게 생각하면 틀려요: 'SQL을 실행하면 무조건 1행은 나온다'. GROUP BY가 있으면 그룹이 없을 때 0행이고, 행마다 쓰는 함수도 행이 없으면 0행이에요.", "정답이에요. GROUP BY 없는 집계인 (가)·(다)만 1행이에요.", "이렇게 생각하면 틀려요: '집계 함수도 대상 행이 없으면 행을 안 만든다'. GROUP BY가 없는 집계는 대상이 0건이어도 늘 1행을 돌려줘요.", "이렇게 생각하면 틀려요: 'NVL이 행이 없는 것까지 0으로 채워 준다'. NVL은 이미 있는 행의 NULL 값만 바꿔요."],
  trap: "'값이 없음(NULL)'과 '행이 없음(0행)'은 달라요. NVL은 앞의 것만 해결해요. 행이 없을 때도 0을 보려면 NVL(MAX(…), 0)처럼 집계로 감싸야 해요.",
  memo: "GROUP BY 없는 집계 → 늘 1행 / GROUP BY 있으면 0행일 수 있음"
},
{
  id: "S133", s: 2, tp: "agg", lv: 2, sub: "GROUP BY, HAVING 절",
  th: "2과목 | COUNT(DISTINCT NVL(…))와 대체값 중복",
  q: "다음 [T] 테이블에 대해 SQL을 실행한 결과로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "C"], r: [[1, 0], [2, 10], [3, null], [4, 10], [5, 20], [6, null], [7, 0]] }],
  sql: "SELECT COUNT(C)                  AS A,\n       COUNT(DISTINCT C)         AS B,\n       COUNT(DISTINCT NVL(C, 0)) AS D,\n       COUNT(NVL(C, 0))          AS E\n  FROM T;",
  o: ["5, 3, 4, 7", "5, 4, 3, 7", "7, 3, 3, 5", "5, 3, 3, 7"],
  a: 3,
  sum: "NVL(C, 0)이 NULL을 0으로 바꾸지만, 0은 이미 있는 값이라 서로 다른 값의 개수는 그대로 3이에요. 반면 COUNT(NVL(C, 0))은 NULL이 사라져서 7행을 다 세요.",
  why: "COUNT(컬럼)은 NULL이 아닌 값만 세고, COUNT(DISTINCT 컬럼)은 NULL을 뺀 뒤 서로 다른 값의 개수를 세요. 집계 함수는 모르는 값을 계산에서 빼도록 정해져 있기 때문이에요.\n\nA = COUNT(C)는 7행 중 NULL 2개(3, 6번)를 빼서 5예요. B = COUNT(DISTINCT C)는 0, 10, 10, 20, 0에서 서로 다른 값 {0, 10, 20}이라 3이에요.\n\nD는 NVL(C, 0)을 먼저 적용해요. 3, 6번의 NULL이 0이 되는데, 0은 1, 7번에 이미 있는 값이에요. **그래서 서로 다른 값은 여전히 {0, 10, 20}이고, 새 값이 늘지 않아 3이에요.**\n\nE = COUNT(NVL(C, 0))은 NULL이 모두 0으로 바뀌어 빠질 값이 없어요. 그래서 7행을 모두 세어 7이에요. 정답은 5, 3, 3, 7이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT COUNT(C)                  AS A,  -- ② NULL 2개 빼고 → 5\n       COUNT(DISTINCT C)         AS B,  -- ② NULL 빼고 서로 다른 값 {0, 10, 20} → 3\n       COUNT(DISTINCT NVL(C, 0)) AS D,  -- ② NULL → 0, 하지만 0은 이미 있음 → 3\n       COUNT(NVL(C, 0))          AS E   -- ② 빠질 NULL이 없음 → 7\n  FROM T;                               -- ① 7행, GROUP BY 없음 → 결과 1행" },
    { t: "1단계: NVL 적용", tb: { c: ["ID", "C", "NVL(C, 0)"], r: [[1, 0, 0], [2, 10, 10], [3, null, 0], [4, 10, 10], [5, 20, 20], [6, null, 0], [7, 0, 0]], hl: [2, 5] } },
    { t: "2단계: 집계", tb: { c: ["식", "대상 값", "결과"], r: [["COUNT(C)", "0, 10, 10, 20, 0", 5], ["COUNT(DISTINCT C)", "{0, 10, 20}", 3], ["COUNT(DISTINCT NVL(C,0))", "{0, 10, 20}", 3], ["COUNT(NVL(C,0))", "7개 모두", 7]] } }
  ],
  res: { c: ["A", "B", "D", "E"], r: [[5, 3, 3, 7]] },
  pg: "SELECT COUNT(C), COUNT(DISTINCT C), COUNT(DISTINCT COALESCE(C, 0)), COUNT(COALESCE(C, 0)) FROM T",
  ox: ["이렇게 생각하면 틀려요: 'NVL로 만든 0은 새로운 값이니 1개 늘어난다'. 0은 이미 1, 7번 행에 있어서 서로 다른 값 개수는 그대로예요.", "이렇게 생각하면 틀려요: 'COUNT(DISTINCT C)는 NULL도 한 값으로 센다'. 집계 함수는 NULL을 먼저 빼고 서로 다른 값만 세요.", "이렇게 생각하면 틀려요: 'COUNT(C)는 7, COUNT(NVL(C, 0))은 5'. 둘을 거꾸로 본 거예요. NULL을 빼는 쪽이 COUNT(C)예요.", "정답이에요. 5, 3, 3, 7이에요."],
  trap: "COUNT(DISTINCT NVL(C, 0))이 늘 'NULL 아닌 서로 다른 값 + 1'은 아니에요. 바꿔 넣은 값이 원래 있던 값과 겹치면 늘지 않아요.",
  memo: "COUNT(NVL(c, 0)) = COUNT(*) / DISTINCT는 바꾼 값이 겹치는지 확인"
},
{
  id: "S134", s: 2, tp: "nullfn", lv: 3, kill: true, sub: "함수",
  th: "2과목 | NULLIF · COALESCE · NVL2 연쇄 계산",
  q: "다음 [T] 테이블에 대해 SQL을 실행한 결과로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "A", "B", "C"], r: [[1, 10, 10, 5], [2, 20, null, 7], [3, null, 30, null], [4, 40, 30, 1]] }],
  sql: "SELECT SUM(COALESCE(NULLIF(A, B), C, -1)) AS X,\n       SUM(NVL2(A, B, C))                    AS Y\n  FROM T;",
  o: ["64, 40", "51, 40", "64, 43", "64, NULL"],
  a: 0,
  sum: "NULLIF(20, NULL)은 '같다'고 확인되지 않으니 20을 그대로 돌려줘요. NVL2(A, B, C)는 A가 있으면 B를 돌려주는데, 2번 행은 B가 NULL이라 Y 합계에서 빠져요.",
  why: "세 함수의 규칙부터 볼게요. NULLIF(A, B)는 A와 B가 '같다고 확인될 때만' NULL을 돌려주고, 아니면 A를 돌려줘요. COALESCE(x, y, z)는 왼쪽부터 보며 처음 나오는 NULL이 아닌 값을 골라요. NVL2(A, B, C)는 A가 있으면 B, A가 NULL이면 C예요.\n\nNULLIF가 '같다고 확인될 때만'인 이유는 내부에서 A = B를 비교하기 때문이에요. 한쪽이 NULL이면 비교 결과가 '모름'이라 '같다'가 아니에요. 그래서 A가 그대로 나와요.\n\nX를 행마다 계산해요. 1번: NULLIF(10, 10) = NULL → C = 5. 2번: NULLIF(20, NULL) = 20 → 20. 3번: NULLIF(NULL, 30) = NULL, C도 NULL → -1. 4번: NULLIF(40, 30) = 40 → 40. 합계는 5 + 20 - 1 + 40 = 64예요.\n\nY를 행마다 계산해요. 1번은 A가 있으니 B = 10, 2번은 A가 있으니 B = NULL, 3번은 A가 NULL이니 C = NULL, 4번은 B = 30이에요. **SUM은 NULL을 건너뛰고 더하므로 Y = 10 + 30 = 40이에요.** 정답은 64, 40이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT SUM(COALESCE(NULLIF(A, B), C, -1)) AS X,  -- ② 행마다: 같으면 NULL, 아니면 A → 없으면 C → 없으면 -1\n                                                  -- ③ SUM: 5 + 20 + (-1) + 40 = 64\n       SUM(NVL2(A, B, C))                    AS Y   -- ② 행마다: A가 있으면 B, 없으면 C\n                                                  -- ③ SUM: 10 + NULL + NULL + 30 → NULL은 건너뜀 → 40\n  FROM T;                                         -- ① 4행, GROUP BY 없음 → 1행" },
    { t: "1단계: 행별 계산", tb: { c: ["ID", "A", "B", "C", "NULLIF(A,B)", "COALESCE(…, C, -1)", "NVL2(A,B,C)"], r: [[1, 10, 10, 5, null, 5, 10], [2, 20, null, 7, 20, 20, null], [3, null, 30, null, null, -1, null], [4, 40, 30, 1, 40, 40, 30]], hl: [1] } },
    { t: "2단계: SUM", tb: { c: ["X", "Y"], r: [["5 + 20 - 1 + 40 = 64", "10 + 30 = 40 (NULL 건너뜀)"]] } }
  ],
  res: { c: ["X", "Y"], r: [[64, 40]] },
  pg: "SELECT SUM(COALESCE(NULLIF(A, B), C, -1)) AS X, SUM(CASE WHEN A IS NOT NULL THEN B ELSE C END) AS Y FROM T",
  ox: ["정답이에요. X = 5 + 20 - 1 + 40 = 64, Y = 10 + 30 = 40이에요.", "이렇게 생각하면 틀려요: 'NULLIF(20, NULL)은 NULL이라 C(7)를 고른다'. NULLIF는 같다고 확인될 때만 NULL이에요. NULL과는 같다고 확인되지 않으니 20이 그대로 나와요.", "이렇게 생각하면 틀려요: 'NVL2는 A가 있으면 C'. 순서를 거꾸로 본 거예요. NVL2(A, B, C)는 A가 있으면 B예요.", "이렇게 생각하면 틀려요: 'SUM할 값에 NULL이 섞이면 합계도 NULL'. SUM은 NULL을 건너뛰고 나머지를 더해요."],
  trap: "NVL2(A, B, C)는 A 자신이 아니라 B를 돌려줘요. 그래서 A가 있어도 B가 NULL이면 결과는 NULL이에요(2번 행).",
  memo: "NULLIF(a, b): 같으면 NULL, 아니면 a / NVL2(a, b, c): a 있으면 b, 없으면 c"
},
{
  id: "S135", s: 2, tp: "nullfn", lv: 3, kill: true, sub: "함수",
  th: "2과목 | DECODE 기본값 생략 · 단순 CASE WHEN NULL을 COUNT로 세기",
  q: "다음 [T] 테이블에 대해 SQL을 실행한 결과로 옳은 것은? (Oracle 기준)",
  tb: [{ n: "T", c: ["ID", "DEPT"], r: [[1, 10], [2, 20], [3, null], [4, 30], [5, 10], [6, null]] }],
  sql: "SELECT COUNT(DECODE(DEPT, 10, 'A', 20, 'B', NULL, 'N'))                    AS X,\n       COUNT(CASE DEPT WHEN 10 THEN 'A' WHEN 20 THEN 'B' WHEN NULL THEN 'N' END) AS Y,\n       COUNT(DISTINCT DECODE(DEPT, 10, 'A', 20, 'B', NULL, 'N'))           AS Z\n  FROM T;",
  o: ["5, 5, 3", "3, 3, 2", "5, 3, 3", "5, 3, 4"],
  a: 2,
  sum: "DECODE는 NULL과 NULL을 '같다'고 봐서 NULL 부서를 'N'으로 바꿔요. 단순 CASE의 WHEN NULL은 'DEPT = NULL'로 비교해서 절대 맞지 않아요.",
  why: "DECODE(DEPT, 10, 'A', 20, 'B', NULL, 'N')은 DEPT를 하나씩 맞춰 보는 Oracle 함수예요. DECODE는 특별히 NULL과 NULL을 같은 값으로 봐요. 맞는 값이 없고 기본값도 안 적으면 NULL을 돌려줘요.\n\n반면 CASE DEPT WHEN NULL THEN …은 속으로 'DEPT = NULL'을 계산해요. = 비교에서 NULL은 늘 '모름'이라 이 WHEN은 절대 맞지 않아요. ELSE가 없으니 NULL이 나와요.\n\n행마다 볼게요. DECODE는 10 → A, 20 → B, NULL → N, 30 → NULL(맞는 값 없음), 10 → A, NULL → N이에요. CASE는 A, B, NULL, NULL, A, NULL이에요.\n\nCOUNT는 NULL을 빼고 세요. X는 DECODE 결과 중 NULL이 1개라 5예요. Y는 CASE 결과 중 NULL이 3개라 3이에요. Z는 DECODE 결과의 서로 다른 값 {A, B, N}이라 3이에요. **같은 '값 맞추기'라도 DECODE만 NULL끼리 맞는다고 봐요.** 정답은 5, 3, 3이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT COUNT(DECODE(DEPT, 10, 'A', 20, 'B', NULL, 'N')) AS X,\n       -- ② DECODE는 NULL = NULL로 봄 → A, B, N, NULL(30), A, N ③ NULL 빼고 세기 → 5\n       COUNT(CASE DEPT WHEN 10 THEN 'A' WHEN 20 THEN 'B' WHEN NULL THEN 'N' END) AS Y,\n       -- ② WHEN NULL은 DEPT = NULL → 늘 모름 → A, B, NULL, NULL, A, NULL ③ → 3\n       COUNT(DISTINCT DECODE(DEPT, 10, 'A', 20, 'B', NULL, 'N')) AS Z\n       -- ③ 서로 다른 값 {A, B, N} → 3\n  FROM T;   -- ① 6행" },
    { t: "1단계: 행별 변환", tb: { c: ["ID", "DEPT", "DECODE", "CASE DEPT WHEN …"], r: [[1, 10, "A", "A"], [2, 20, "B", "B"], [3, null, "N", null], [4, 30, null, null], [5, 10, "A", "A"], [6, null, "N", null]], hl: [2, 5] } },
    { t: "2단계: COUNT", tb: { c: ["X", "Y", "Z"], r: [[5, 3, 3]] } },
    { t: "의도대로 쓰려면: CASE에서 NULL 맞추기", n: "SELECT COUNT(CASE WHEN DEPT = 10 THEN 'A'\n                  WHEN DEPT = 20 THEN 'B'\n                  WHEN DEPT IS NULL THEN 'N'   -- 검색형 CASE + IS NULL\n             END) AS Y\n  FROM T;   -- A, B, N, NULL, A, N → 5" }
  ],
  res: { c: ["X", "Y", "Z"], r: [[5, 3, 3]] },
  pg: "SELECT COUNT(CASE WHEN DEPT = 10 THEN 'A' WHEN DEPT = 20 THEN 'B' WHEN DEPT IS NULL THEN 'N' END) AS X, COUNT(CASE DEPT WHEN 10 THEN 'A' WHEN 20 THEN 'B' WHEN NULL THEN 'N' END) AS Y, COUNT(DISTINCT CASE WHEN DEPT = 10 THEN 'A' WHEN DEPT = 20 THEN 'B' WHEN DEPT IS NULL THEN 'N' END) AS Z FROM T",
  ox: ["이렇게 생각하면 틀려요: '단순 CASE의 WHEN NULL도 NULL 행과 맞는다'. 단순 CASE는 = 로 비교해서 NULL과는 늘 '모름'이라 맞지 않아요.", "이렇게 생각하면 틀려요: 'DECODE도 NULL을 맞추지 못한다'. DECODE는 NULL끼리 같다고 보는 예외적인 함수예요.", "정답이에요. DECODE는 NULL을 N으로 바꿔 5, CASE는 3, 서로 다른 DECODE 값은 3이에요.", "이렇게 생각하면 틀려요: 'COUNT(DISTINCT)는 30번 행의 NULL 결과도 한 값으로 센다'. COUNT는 NULL을 빼고 세요."],
  trap: "DECODE와 단순 CASE는 비슷하게 배우지만 NULL 처리만큼은 달라요. 또 기본값(ELSE)이 없으면 둘 다 NULL을 돌려주고, COUNT는 그 NULL을 세지 않아요.",
  memo: "DECODE: NULL = NULL로 봄 / CASE x WHEN NULL: 절대 안 맞음 → WHEN x IS NULL"
},
{
  id: "S136", s: 2, tp: "fn", lv: 2, sub: "함수",
  th: "2과목 | ROUND · TRUNC의 음수 자릿수와 음수 값",
  q: "다음 SQL의 결과로 옳은 것은?",
  sql: "SELECT ROUND(1555.55, -2) AS A,\n       TRUNC(1555.55, -2) AS B,\n       ROUND(-1550, -2)   AS C,\n       TRUNC(-1555.55, -1) AS D\n  FROM DUAL;",
  o: ["1600, 1600, -1500, -1550", "1555.6, 1555.5, -1550, -1555.5", "1600, 1500, -1600, -1550", "1600, 1500, -1500, -1560"],
  a: 2,
  sum: "자릿수가 -2이면 백의 자리까지 남기고, -1이면 십의 자리까지 남겨요. ROUND는 음수도 '절댓값'으로 반올림해서 -1550 → -1600이고, TRUNC는 0 쪽으로 잘라서 -1555.55 → -1550이에요.",
  why: "ROUND(값, n)와 TRUNC(값, n)의 n은 '어느 자리까지 남길지'예요. n이 음수이면 소수점 왼쪽으로 가요. -1은 십의 자리까지, -2는 백의 자리까지 남겨요.\n\nROUND는 남기는 자리 바로 아래 숫자가 5 이상이면 올려요. 음수일 때는 '절댓값'을 기준으로 반올림하고 부호를 붙여요. 그래서 0에서 멀어지는 쪽으로 가요. TRUNC는 반올림 없이 그냥 잘라 내서 늘 0 쪽으로 가까워져요.\n\n하나씩 볼게요. A: 1555.55를 백의 자리까지 반올림하면 십의 자리가 5라 올려서 1600이에요. B: 같은 값을 백의 자리까지 자르면 1500이에요. C: -1550은 절댓값 1550을 반올림해 1600, 부호를 붙여 -1600이에요. D: -1555.55를 십의 자리까지 자르면 0 쪽으로 가서 -1550이에요.\n\n**음수의 ROUND는 '더 큰 수(-1500)'가 아니라 '절댓값이 큰 쪽(-1600)'으로 가요.** 정답은 1600, 1500, -1600, -1550이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT ROUND(1555.55, -2)  AS A,  -- 백의 자리까지, 십의 자리 5 → 올림 → 1600\n       TRUNC(1555.55, -2)  AS B,  -- 백의 자리까지 자름 → 1500\n       ROUND(-1550, -2)    AS C,  -- 절댓값 1550 → 1600, 부호 붙여 → -1600\n       TRUNC(-1555.55, -1) AS D   -- 십의 자리까지, 0 쪽으로 자름 → -1550\n  FROM DUAL;                      -- DUAL: 1행짜리 연습용 테이블" },
    { t: "1단계: 자릿수 위치", tb: { c: ["자릿수", "의미"], r: [[1, "소수 첫째 자리까지"], [0, "정수까지"], [-1, "십의 자리까지 (일의 자리에서 처리)"], [-2, "백의 자리까지 (십의 자리에서 처리)"]] } },
    { t: "2단계: 결과", tb: { c: ["식", "결과"], r: [["ROUND(1555.55, -2)", 1600], ["TRUNC(1555.55, -2)", 1500], ["ROUND(-1550, -2)", -1600], ["TRUNC(-1555.55, -1)", -1550]] } }
  ],
  res: { c: ["A", "B", "C", "D"], r: [[1600, 1500, -1600, -1550]] },
  pg: "SELECT ROUND(1555.55, -2), TRUNC(1555.55, -2), ROUND(-1550, -2), TRUNC(-1555.55, -1)",
  ox: ["이렇게 생각하면 틀려요: 'TRUNC도 반올림하고, 음수 반올림은 더 큰 수(-1500) 쪽'. TRUNC는 그냥 자르고, ROUND는 절댓값 기준이라 -1600이에요.", "이렇게 생각하면 틀려요: '-2는 소수 둘째 자리'. 음수 자릿수는 소수점 왼쪽, 즉 정수 부분을 뜻해요.", "정답이에요. 1600, 1500, -1600, -1550이에요.", "이렇게 생각하면 틀려요: 'ROUND(-1550, -2)는 -1500, TRUNC(음수)는 더 작은 쪽(-1560)'. ROUND는 절댓값으로 올려 -1600, TRUNC는 0 쪽으로 잘라 -1550이에요."],
  trap: "음수 ROUND는 수직선에서 '큰 쪽'이 아니라 '절댓값이 큰 쪽'으로 가요. -1550 → -1600이에요.",
  memo: "ROUND: 절댓값으로 반올림 / TRUNC: 0 쪽으로 자름 / 음수 자릿수 = 정수 부분"
},
{
  id: "S137", s: 2, tp: "fn", lv: 3, kill: true, sub: "함수",
  th: "2과목 | SUBSTR 음수·0 시작 위치 (Oracle)",
  q: "다음 SQL의 결과로 옳은 것은? (Oracle 기준)",
  sql: "SELECT SUBSTR('SQLDEVELOPER', -5, 3)  AS A,\n       SUBSTR('SQLDEVELOPER', -3)     AS B,\n       SUBSTR('SQLDEVELOPER', 0, 3)   AS C,\n       LENGTH(SUBSTR('SQLDEVELOPER', 4)) AS D\n  FROM DUAL;",
  o: ["ELO, PER, SQL, 9", "LOP, PER, SQL, 9", "LOP, PER, SQ, 9", "LOP, REP, SQL, 8"],
  a: 1,
  sum: "Oracle SUBSTR에서 시작 위치가 -5이면 '끝에서 5번째 글자'부터 오른쪽으로 읽어서 LOP예요. 시작 위치 0은 1로 취급해서 SQL이에요.",
  why: "SUBSTR(문자열, 시작, 길이)는 시작 위치부터 길이만큼 잘라요. Oracle에서 시작이 음수이면 '끝에서부터 센 위치'라는 뜻이에요. 읽는 방향은 그대로 오른쪽이에요.\n\n이렇게 만든 이유는 문자열 길이를 몰라도 '뒤에서 몇 글자'를 쉽게 꺼내게 하려는 거예요. 길이를 생략하면 끝까지 잘라요. 시작이 0이면 Oracle은 1로 취급해요.\n\n'SQLDEVELOPER'는 12글자예요. -5는 끝에서 5번째, 즉 12 - 5 + 1 = 8번째 글자 L이에요. 거기서 오른쪽으로 3글자를 읽으면 LOP예요. -3은 10번째 P부터 끝까지라 PER이에요.\n\nSUBSTR(…, 0, 3)은 1번째부터 3글자라 SQL이에요. SUBSTR(…, 4)는 4번째 D부터 끝까지라 DEVELOPER, 9글자예요. **음수 시작은 '어디서 시작할지'만 바꾸고, 읽는 방향은 늘 오른쪽이에요.** 정답은 LOP, PER, SQL, 9예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT SUBSTR('SQLDEVELOPER', -5, 3)     AS A,  -- 끝에서 5번째(8번째 L)부터 3글자 → LOP\n       SUBSTR('SQLDEVELOPER', -3)        AS B,  -- 끝에서 3번째(10번째 P)부터 끝까지 → PER\n       SUBSTR('SQLDEVELOPER', 0, 3)      AS C,  -- 0은 1로 취급 → SQL\n       LENGTH(SUBSTR('SQLDEVELOPER', 4)) AS D   -- DEVELOPER → 9글자\n  FROM DUAL;" },
    { t: "1단계: 위치표", tb: { c: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"], r: [["S", "Q", "L", "D", "E", "V", "E", "L", "O", "P", "E", "R"], [-12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1]] }, n: "음수 위치 → 길이 + 음수 + 1번째예요. -5 → 12 - 5 + 1 = 8번째" },
    { t: "2단계: 결과", tb: { c: ["식", "시작", "결과"], r: [["SUBSTR(s, -5, 3)", "8", "LOP"], ["SUBSTR(s, -3)", "10", "PER"], ["SUBSTR(s, 0, 3)", "0 → 1", "SQL"], ["LENGTH(SUBSTR(s, 4))", "4", 9]] } }
  ],
  res: { c: ["A", "B", "C", "D"], r: [["LOP", "PER", "SQL", 9]] },
  pg: "WITH X AS (SELECT 'SQLDEVELOPER'::text AS S) SELECT SUBSTR(S, LENGTH(S) - 5 + 1, 3), SUBSTR(S, LENGTH(S) - 3 + 1), SUBSTR(S, 1, 3), LENGTH(SUBSTR(S, 4)) FROM X",
  ox: ["이렇게 생각하면 틀려요: '끝에서 5칸을 건너뛴 다음 7번째부터 읽는다'. -5는 끝에서 5번째 글자 자체(8번째)를 가리켜요.", "정답이에요. LOP, PER, SQL, 9예요.", "이렇게 생각하면 틀려요: '0은 1보다 앞의 빈자리라 2글자만 잘린다'. 그건 PostgreSQL 방식이고, Oracle은 0을 1로 취급해 SQL 3글자가 나와요.", "이렇게 생각하면 틀려요: '음수 시작이면 왼쪽으로 거꾸로 읽어서 REP, 4번째 글자는 빼고 8글자'. 읽는 방향은 늘 오른쪽이고, 4번째부터 끝까지는 9글자예요."],
  trap: "음수 시작은 '시작 위치를 끝에서 센다'는 뜻일 뿐, 읽는 방향을 바꾸지 않아요. PostgreSQL에서는 SUBSTR(s, 0, 3)이 2글자를 돌려줘서 Oracle과 달라요.",
  memo: "SUBSTR 음수 = 끝에서 n번째부터 오른쪽으로 / 0 = 1"
},
{
  id: "S138", s: 2, tp: "fn", lv: 3, kill: true, sub: "함수",
  th: "2과목 | INSTR 발생 순번 · 겹치는 매칭 · 역방향 검색 (Oracle)",
  q: "다음 SQL의 결과로 옳은 것은? (Oracle 기준)",
  sql: "SELECT INSTR('BANANA', 'ANA', 1, 2) AS A,\n       INSTR('BANANA', 'A', -1, 3)   AS B,\n       INSTR('BANANA', 'N', 3, 2)    AS C,\n       INSTR('BANANA', 'X')          AS D\n  FROM DUAL;",
  o: ["0, 2, 5, 0", "4, 6, 5, 0", "4, 2, 5, NULL", "4, 2, 5, 0"],
  a: 3,
  sum: "INSTR은 겹쳐도 각각 세서 'ANA'의 두 번째 위치는 4예요. 시작이 -1이면 끝에서 왼쪽으로 찾지만, 돌려주는 위치는 늘 왼쪽부터 센 번호예요. 못 찾으면 0이에요.",
  why: "INSTR(문자열, 찾을 값, 시작, n번째)는 찾을 값이 n번째로 나오는 위치를 돌려줘요. 위치는 늘 왼쪽에서 센 번호예요. 못 찾으면 NULL이 아니라 0이에요.\n\n찾을 때는 한 번 찾은 다음 '다음 글자'부터 다시 찾아요. 그래서 겹치는 것도 따로 세요. 시작이 음수이면 끝 쪽에서 출발해 왼쪽으로 찾아 가요.\n\n'BANANA'는 B1 A2 N3 A4 N5 A6이에요. A: 'ANA'는 2번째(A-N-A)에서 처음 나오고, 3번째부터 다시 찾으면 4번째(A-N-A)에서 또 나와요. 두 번째 발생은 4예요. B: -1이라 오른쪽 끝에서 왼쪽으로 'A'를 찾으면 6, 4, 2 순서예요. 세 번째는 2예요.\n\nC: 3번째부터 'N'을 찾으면 3, 5 순서라 두 번째는 5예요. D: 'X'는 없어서 0이에요. **거꾸로 찾아도 답은 '왼쪽에서 몇 번째'로 나와요.** 정답은 4, 2, 5, 0이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT INSTR('BANANA', 'ANA', 1, 2) AS A,  -- 1번째부터, 2번째 'ANA' → 2, 4(겹침 허용) → 4\n       INSTR('BANANA', 'A', -1, 3)   AS B,  -- 끝에서 왼쪽으로, 3번째 'A' → 6, 4, 2 → 2\n       INSTR('BANANA', 'N', 3, 2)    AS C,  -- 3번째부터, 2번째 'N' → 3, 5 → 5\n       INSTR('BANANA', 'X')          AS D   -- 없음 → 0 (NULL 아님)\n  FROM DUAL;" },
    { t: "1단계: 위치표", tb: { c: ["1", "2", "3", "4", "5", "6"], r: [["B", "A", "N", "A", "N", "A"]] } },
    { t: "2단계: 검색", tb: { c: ["식", "검색 순서", "결과"], r: [["INSTR(…, 'ANA', 1, 2)", "2(ANA) → 4(ANA, 겹침)", 4], ["INSTR(…, 'A', -1, 3)", "6 → 4 → 2 (오른쪽→왼쪽)", 2], ["INSTR(…, 'N', 3, 2)", "3 → 5", 5], ["INSTR(…, 'X')", "없음", 0]] } }
  ],
  res: { c: ["A", "B", "C", "D"], r: [[4, 2, 5, 0]] },
  pgSetup: "CREATE FUNCTION instr(s text, t text, p int DEFAULT 1, n int DEFAULT 1) RETURNS int LANGUAGE plpgsql AS $$ DECLARE i int; k int := 0; L int := length(s); m int := length(t); BEGIN IF p > 0 THEN FOR i IN p .. L - m + 1 LOOP IF substr(s, i, m) = t THEN k := k + 1; IF k = n THEN RETURN i; END IF; END IF; END LOOP; ELSE FOR i IN REVERSE LEAST(L + p + 1, L - m + 1) .. 1 LOOP IF substr(s, i, m) = t THEN k := k + 1; IF k = n THEN RETURN i; END IF; END IF; END LOOP; END IF; RETURN 0; END $$;",
  pg: "SELECT instr('BANANA', 'ANA', 1, 2), instr('BANANA', 'A', -1, 3), instr('BANANA', 'N', 3, 2), instr('BANANA', 'X')",
  ox: ["이렇게 생각하면 틀려요: '겹치는 건 세지 않는다'. 그러면 2에서 찾은 뒤 5부터 다시 찾아 0이 되지만, Oracle INSTR은 바로 다음 글자부터 다시 찾아서 겹쳐도 찾아요.", "이렇게 생각하면 틀려요: '-1은 무시하고 왼쪽부터 세 번째 A(6)'. 음수 시작은 끝에서 왼쪽으로 찾으라는 뜻이라 6, 4, 2 순서예요.", "이렇게 생각하면 틀려요: '못 찾으면 NULL'. INSTR은 못 찾으면 0을 돌려줘요. NULL은 인자가 NULL일 때만 나와요.", "정답이에요. 4, 2, 5, 0이에요."],
  trap: "거꾸로 찾아도 돌려주는 위치는 '왼쪽에서 몇 번째'예요. 오른쪽에서 몇 번째인지로 답하지 않도록 조심하세요.",
  memo: "INSTR: 겹쳐도 셈 / 음수 시작 = 거꾸로 찾기, 위치는 왼쪽 기준 / 없으면 0"
},
{
  id: "S139", s: 2, tp: "fn", lv: 2, sub: "함수",
  th: "2과목 | LTRIM · RTRIM의 두 번째 인자는 '문자 집합'",
  q: "다음 SQL의 결과로 옳은 것은?",
  sql: "SELECT LTRIM('xyxzAxy', 'xy')      AS A,\n       RTRIM('ABC12321', '12')     AS B,\n       TRIM('0' FROM '00102000')  AS C\n  FROM DUAL;",
  o: ["zAxy, ABC, 102", "zAxy, ABC123, 102", "xzAxy, ABC123, 102", "zA, ABC123, 102"],
  a: 1,
  sum: "LTRIM·RTRIM의 두 번째 인자는 '지울 글자 목록'이에요. 목록에 있는 글자를 끝에서부터 계속 지우다가, 목록에 없는 글자를 만나면 멈춰요.",
  why: "LTRIM(문자열, 'xy')는 'xy'라는 글자 덩어리를 한 번 지우는 게 아니에요. 'x 또는 y'인 글자를 왼쪽 끝에서부터 계속 지워요. 목록에 없는 글자를 만나면 멈춰요. RTRIM은 같은 일을 오른쪽 끝에서 해요.\n\nA: 'xyxzAxy'를 왼쪽부터 보면 x(지움) y(지움) x(지움) z(목록에 없음 → 멈춤)예요. 결과는 'zAxy'예요. 오른쪽의 xy는 LTRIM이 건드리지 않아요.\n\nB: 'ABC12321'을 오른쪽부터 보면 1(지움) 2(지움) 3(목록에 없음 → 멈춤)이에요. 결과는 'ABC123'이에요. 숫자라고 다 지우는 게 아니에요.\n\nC: TRIM('0' FROM …)은 양쪽 끝의 '0'을 지워요. 왼쪽 00, 오른쪽 000이 지워지고 가운데 0은 남아서 '102'예요. **두 번째 인자는 '문자열'이 아니라 '지울 글자들의 목록'이에요.** 정답은 zAxy, ABC123, 102예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT LTRIM('xyxzAxy', 'xy')     AS A,  -- 왼쪽에서 x·y면 계속 지움 → z에서 멈춤 → zAxy\n       RTRIM('ABC12321', '12')    AS B,  -- 오른쪽에서 1·2면 계속 지움 → 3에서 멈춤 → ABC123\n       TRIM('0' FROM '00102000')  AS C   -- 양쪽 끝의 0만 지움 → 102\n  FROM DUAL;" },
    { t: "1단계: 한 글자씩 지우기", tb: { c: ["식", "지우는 과정", "멈춘 글자"], r: [["LTRIM('xyxzAxy', 'xy')", "x → y → x 삭제", "z"], ["RTRIM('ABC12321', '12')", "1 → 2 삭제 (오른쪽부터)", "3"], ["TRIM('0' FROM '00102000')", "왼쪽 00, 오른쪽 000 삭제", "1 / 2"]] } },
    { t: "2단계: 결과", tb: { c: ["A", "B", "C"], r: [["zAxy", "ABC123", "102"]] } }
  ],
  res: { c: ["A", "B", "C"], r: [["zAxy", "ABC123", "102"]] },
  pg: "SELECT LTRIM('xyxzAxy', 'xy'), RTRIM('ABC12321', '12'), TRIM('0' FROM '00102000')",
  ox: ["이렇게 생각하면 틀려요: 'RTRIM은 오른쪽 숫자를 다 지운다'. 지울 목록은 1과 2뿐이라 3에서 멈춰요.", "정답이에요. zAxy, ABC123, 102예요.", "이렇게 생각하면 틀려요: ''xy'라는 덩어리를 한 번만 지운다'. 목록의 글자를 하나씩, 없는 글자가 나올 때까지 계속 지워요.", "이렇게 생각하면 틀려요: 'LTRIM이 양쪽을 다 지운다'. LTRIM은 왼쪽만 지워서 오른쪽 xy는 남아요."],
  trap: "RTRIM('ABC12321', '12')를 '끝의 \"12\" 덩어리 지우기'로 읽으면 틀려요. 목록에 있는 글자가 안 나올 때까지 한 글자씩 지워요.",
  memo: "LTRIM/RTRIM 두 번째 인자 = 지울 글자 목록, 반복해서 지움"
},
{
  id: "S140", s: 2, tp: "basic", lv: 2, kill: true, sub: "ORDER BY 절",
  th: "2과목 | 다중 정렬 키와 NULL 위치 (DESC + ASC)",
  q: "다음 [T] 테이블에 대해 SQL을 실행했을 때 출력되는 NAME의 순서로 옳은 것은? (Oracle 기준)",
  tb: [{ n: "T", c: ["NAME", "DEPT", "BONUS"], r: [["A", 10, 100], ["B", null, 50], ["C", 20, null], ["D", 20, 30], ["E", 10, null], ["F", null, null], ["G", 20, 10]] }],
  sql: "SELECT NAME\n  FROM T\n ORDER BY DEPT DESC, BONUS;",
  o: ["G D C A E B F", "B F G D C A E", "C G D E A F B", "F B C G D E A"],
  a: 1,
  sum: "Oracle은 정렬할 때 NULL을 '가장 큰 값'처럼 다뤄요. 그래서 DEPT DESC에서는 NULL 부서가 맨 앞에 오고, 방향을 안 쓴 BONUS(오름차순)에서는 NULL이 그룹 안에서 맨 뒤에 와요.",
  why: "Oracle은 ORDER BY에서 NULL을 가장 큰 값처럼 취급해요. 그래서 오름차순(ASC)에서는 NULL이 맨 뒤, 내림차순(DESC)에서는 맨 앞에 와요. 이건 '정렬'에서만 쓰는 규칙이고, 비교(>, =)에서는 NULL이 여전히 '모름'이에요.\n\n또 DESC·ASC는 바로 앞의 컬럼 하나에만 붙어요. BONUS 뒤에는 아무것도 없으니 기본값인 ASC예요.\n\n먼저 DEPT DESC로 줄 세워요. NULL(B, F)이 맨 앞, 다음 20(C, D, G), 다음 10(A, E)이에요. 그다음 같은 DEPT 안에서 BONUS 오름차순으로 줄 세워요. NULL 그룹은 B(50) → F(NULL), 20 그룹은 G(10) → D(30) → C(NULL), 10 그룹은 A(100) → E(NULL)이에요.\n\n**DESC는 DEPT에만 붙고 BONUS는 오름차순이라, 각 그룹 안에서는 NULL이 맨 뒤로 가요.** 정답은 B F G D C A E예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT NAME                -- ③ 이름만 출력\n  FROM T                   -- ① 7행\n ORDER BY DEPT DESC,       -- ② 첫째 기준: 내림차순 → NULL(B, F)이 맨 앞, 20, 10 순\n          BONUS;           -- ② 둘째 기준: 방향 없음 = ASC → 그룹 안에서 NULL은 맨 뒤" },
    { t: "1단계: DEPT DESC (NULL이 맨 앞)", tb: { c: ["DEPT", "행"], r: [[null, "B(50), F(NULL)"], [20, "C(NULL), D(30), G(10)"], [10, "A(100), E(NULL)"]] } },
    { t: "2단계: 같은 DEPT 안에서 BONUS ASC (NULL은 맨 뒤)", tb: { c: ["순서", "NAME", "DEPT", "BONUS"], r: [[1, "B", null, 50], [2, "F", null, null], [3, "G", 20, 10], [4, "D", 20, 30], [5, "C", 20, null], [6, "A", 10, 100], [7, "E", 10, null]] } },
    { t: "의도대로 쓰려면: NULL 부서를 맨 뒤로 보내기", n: "SELECT NAME\n  FROM T\n ORDER BY DEPT DESC NULLS LAST, BONUS;\n-- G D C A E B F (NULLS LAST / NULLS FIRST로 NULL 위치를 직접 정해요)" }
  ],
  res: { c: ["NAME"], r: [["B"], ["F"], ["G"], ["D"], ["C"], ["A"], ["E"]] },
  pg: "SELECT NAME FROM T ORDER BY DEPT DESC, BONUS",
  ox: ["이렇게 생각하면 틀려요: 'NULL은 내림차순에서도 맨 뒤'. Oracle은 NULL을 가장 큰 값처럼 다뤄서 DESC에서는 맨 앞이에요. 이 순서를 원하면 NULLS LAST를 써야 해요.", "정답이에요. B F G D C A E 순서예요.", "이렇게 생각하면 틀려요: 'NULL은 가장 작은 값'. 그건 SQL Server 방식이고, Oracle은 NULL을 가장 큰 값처럼 다뤄요.", "이렇게 생각하면 틀려요: 'NULL은 방향과 상관없이 늘 맨 앞'. 둘째 기준 BONUS는 오름차순이라 그룹 안에서 NULL이 맨 뒤예요."],
  trap: "DESC는 바로 앞 컬럼 하나에만 붙어요. BONUS는 ASC라서 같은 DEPT 안에서 NULL이 뒤로 가요.",
  memo: "Oracle 정렬에서 NULL = 가장 큰 값: ASC 맨 뒤, DESC 맨 앞 / DESC는 컬럼마다"
},
{
  id: "S141", s: 2, tp: "basic", lv: 3, kill: true, sub: "ORDER BY 절",
  th: "2과목 | ORDER BY 위치 번호 · 별칭 · SELECT에 없는 컬럼",
  q: "다음 [T] 테이블에 대해 SQL을 실행했을 때 출력되는 NAME의 순서로 옳은 것은? (Oracle 기준)",
  tb: [{ n: "T", c: ["NAME", "SAL", "COMM"], r: [["KIM", 300, null], ["LEE", 200, 100], ["PARK", 250, 0], ["CHOI", 100, 300], ["JUNG", 150, 150]] }],
  sql: "SELECT NAME, SAL + COMM AS TOT\n  FROM T\n ORDER BY 2 DESC, SAL;",
  o: ["KIM CHOI JUNG LEE PARK", "CHOI JUNG LEE PARK KIM", "KIM PARK LEE JUNG CHOI", "KIM CHOI LEE JUNG PARK"],
  a: 0,
  sum: "ORDER BY 2는 SELECT 목록의 두 번째 항목(TOT)이에요. KIM은 COMM이 NULL이라 TOT가 NULL이고, Oracle 내림차순에서는 NULL이 맨 앞이에요. TOT가 같은 JUNG·LEE는 SAL 오름차순이에요.",
  why: "ORDER BY 뒤의 숫자는 '테이블의 몇 번째 컬럼'이 아니라 'SELECT 목록의 몇 번째 항목'이에요. 이 SQL에서 2는 TOT(SAL + COMM)예요.\n\n그리고 정렬 방향(DESC)은 그 바로 앞 기준 하나에만 붙어요. 두 번째 기준 SAL은 방향이 없으니 오름차순이에요. SAL처럼 SELECT 목록에 없는 컬럼도 ORDER BY에 쓸 수 있어요(DISTINCT·집합 연산이 없을 때).\n\nTOT를 행마다 계산해요. KIM은 300 + NULL이라 NULL이에요. 더하기에 NULL이 끼면 결과도 NULL이에요. LEE 300, PARK 250, CHOI 400, JUNG 300이에요.\n\nTOT 내림차순에서 Oracle은 NULL을 가장 큰 값처럼 다뤄서 KIM이 맨 앞이에요. 다음 CHOI(400)예요. TOT가 300으로 같은 JUNG(SAL 150)과 LEE(SAL 200)는 SAL 오름차순으로 JUNG이 먼저예요. 마지막이 PARK(250)예요. **세 가지 규칙(위치 번호 = SELECT 기준, NULL은 DESC에서 맨 앞, 방향은 기준마다 따로)이 겹친 문제예요.** 정답은 KIM CHOI JUNG LEE PARK이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT NAME, SAL + COMM AS TOT  -- ② 행마다 TOT 계산 (KIM: 300 + NULL = NULL)\n  FROM T                        -- ① 5행\n ORDER BY 2 DESC,               -- ③ 2 = SELECT의 두 번째 항목 TOT, 내림차순 → NULL이 맨 앞\n          SAL;                  -- ③ TOT가 같으면 SAL 오름차순 (DESC는 안 붙음)" },
    { t: "1단계: TOT 계산", tb: { c: ["NAME", "SAL", "COMM", "TOT"], r: [["KIM", 300, null, null], ["LEE", 200, 100, 300], ["PARK", 250, 0, 250], ["CHOI", 100, 300, 400], ["JUNG", 150, 150, 300]] } },
    { t: "2단계: TOT 내림차순(NULL이 맨 앞), 같으면 SAL 오름차순", tb: { c: ["NAME", "TOT", "SAL"], r: [["KIM", null, 300], ["CHOI", 400, 100], ["JUNG", 300, 150], ["LEE", 300, 200], ["PARK", 250, 250]], hl: [2, 3] } },
    { t: "의도대로 쓰려면: COMM이 없으면 0으로 보고 합계 내기", n: "SELECT NAME, SAL + NVL(COMM, 0) AS TOT\n  FROM T\n ORDER BY 2 DESC, SAL;\n-- CHOI 400, JUNG 300, LEE 300, KIM 300, PARK 250" }
  ],
  res: { c: ["NAME", "TOT"], r: [["KIM", null], ["CHOI", 400], ["JUNG", 300], ["LEE", 300], ["PARK", 250]] },
  pg: "SELECT NAME, SAL + COMM AS TOT FROM T ORDER BY 2 DESC, SAL",
  ox: ["정답이에요. KIM(NULL) → CHOI(400) → JUNG·LEE(300, SAL 오름차순) → PARK(250)이에요.", "이렇게 생각하면 틀려요: '내림차순에서 NULL은 맨 뒤'. Oracle은 정렬에서 NULL을 가장 큰 값처럼 다뤄서 DESC에서는 맨 앞이에요.", "이렇게 생각하면 틀려요: 'ORDER BY 2는 테이블의 두 번째 컬럼 SAL'. 숫자는 SELECT 목록 기준이라 TOT예요.", "이렇게 생각하면 틀려요: 'DESC가 SAL에도 적용돼서 LEE(200)가 JUNG(150)보다 먼저'. DESC는 TOT에만 붙고 SAL은 오름차순이에요."],
  trap: "세 가지 함정이 겹친 문제예요. ① 위치 번호는 SELECT 목록 기준 ② SAL + NULL = NULL이고 DESC에서 맨 앞 ③ DESC는 한 기준에만 적용.",
  memo: "ORDER BY n = SELECT n번째 항목 / 정렬 방향은 기준마다 따로"
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
  sum: "ON에 쓴 조건은 '짝을 고르는 조건'이라 A 행은 다 남지만, WHERE에 쓴 조건은 조인이 끝난 뒤 행을 지워요. 'OR B.AID IS NULL'은 짝이 아예 없던 행만 살려서, 'N' 짝만 있던 A 2는 살리지 못해요.",
  why: "LEFT OUTER JOIN은 왼쪽 테이블(A)의 모든 행을 남겨요. 오른쪽(B)에 맞는 짝이 없으면 B 쪽을 NULL로 채운 1행을 만들어요. ON 조건은 '어떤 B 행을 짝으로 붙일지'를 정하고, WHERE 조건은 조인이 다 끝난 뒤 결과 행을 걸러요.\n\n(가)는 STATUS = 'Y'가 ON에 있어요. A 1은 Y 짝 1개, A 2는 Y 짝이 없어 NULL 1행, A 3은 Y 짝 2개, A 4는 NULL 1행이에요. 합쳐서 5건이에요.\n\n(나)는 먼저 ON A.ID = B.AID로만 조인해요. 결과는 1-Y, 1-N, 2-N, 3-Y, 3-Y, 4-NULL의 6행이에요. 그다음 WHERE B.STATUS = 'Y'가 N인 행과 NULL인 행(4번)을 지워요. 'NULL = Y?'는 모름이라 빠지거든요. 남는 건 3건이에요.\n\n(다)는 같은 6행에서 'Y이거나 B.AID가 NULL'만 남겨요. A 4는 짝이 아예 없어 B.AID가 NULL이라 살아요. 하지만 A 2는 'N' 짝이 실제로 붙어 있어서 B.AID가 2예요. 그래서 지워져요. **'WHERE … OR IS NULL'은 짝이 아예 없던 행만 살리고, 조건에 안 맞는 짝만 있던 행은 살리지 못해요.** 결과는 4건이에요. 정답은 5, 3, 4예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- (가)\nSELECT COUNT(*) FROM A LEFT OUTER JOIN B         -- ① A 4행은 무조건 남김\n       ON A.ID = B.AID AND B.STATUS = 'Y';       -- ② Y인 B만 짝으로 → 짝 없으면 NULL 1행 → 5\n-- (나)\nSELECT COUNT(*) FROM A LEFT OUTER JOIN B\n       ON A.ID = B.AID                           -- ① 짝 붙이기 → 6행\n WHERE B.STATUS = 'Y';                           -- ② 조인 뒤에 걸러요 → N·NULL 행 삭제 → 3\n-- (다)\nSELECT COUNT(*) FROM A LEFT OUTER JOIN B\n       ON A.ID = B.AID                           -- ① 6행\n WHERE B.STATUS = 'Y' OR B.AID IS NULL;          -- ② 짝이 아예 없던 A 4만 살림, A 2(N)는 삭제 → 4" },
    { t: "1단계: ON A.ID = B.AID 만으로 조인한 결과", tb: { c: ["A.ID", "B.AID", "B.STATUS"], r: [[1, 1, "Y"], [1, 1, "N"], [2, 2, "N"], [3, 3, "Y"], [3, 3, "Y"], [4, null, null]] } },
    { t: "2단계: SQL별 결과", tb: { c: ["SQL", "남는 행", "건수"], r: [["(가)", "1-Y, 2-NULL, 3-Y, 3-Y, 4-NULL", 5], ["(나)", "1-Y, 3-Y, 3-Y", 3], ["(다)", "1-Y, 3-Y, 3-Y, 4-NULL", 4]] }, n: "A 2는 (가)에서는 남지만 (다)에서는 사라져요." },
    { t: "의도대로 쓰려면: 'A는 전부, B는 Y인 것만 붙이기'는 ON에", n: "SELECT COUNT(*)\n  FROM A LEFT OUTER JOIN B\n    ON A.ID = B.AID\n   AND B.STATUS = 'Y';   -- 5건 (A 2, A 4는 B 쪽이 NULL인 1행씩)" }
  ],
  res: { c: ["가", "나", "다"], r: [[5, 3, 4]] },
  pg: "SELECT (SELECT COUNT(*) FROM A LEFT JOIN B ON A.ID = B.AID AND B.STATUS = 'Y'), (SELECT COUNT(*) FROM A LEFT JOIN B ON A.ID = B.AID WHERE B.STATUS = 'Y'), (SELECT COUNT(*) FROM A LEFT JOIN B ON A.ID = B.AID WHERE B.STATUS = 'Y' OR B.AID IS NULL)",
  ox: ["이렇게 생각하면 틀려요: '(다)의 OR IS NULL은 (가)와 같은 뜻'. OR IS NULL은 짝이 아예 없던 A 4만 살리고, 'N' 짝만 있던 A 2는 살리지 못해 4건이에요.", "이렇게 생각하면 틀려요: 'WHERE에 B 조건을 써도 왼쪽 행은 그대로 남는다'. WHERE는 조인이 끝난 뒤 행을 지워서 (나)는 3건이에요.", "정답이에요. (가) 5, (나) 3, (다) 4건이에요.", "이렇게 생각하면 틀려요: '(다)에서 A 4도 빠진다'. A 4는 짝이 없어 B.AID가 NULL이라 IS NULL 조건으로 남아요."],
  trap: "'WHERE B.조건 OR B.키 IS NULL'은 ON 조건을 대신하지 못해요. 조건에 안 맞는 짝만 있던 행은 사라져요.",
  memo: "왼쪽을 다 남기려면 B 조건은 ON에 / WHERE … OR IS NULL ≠ ON 조건"
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
  sum: "LEFT JOIN에서 왼쪽 A의 행은 ON 조건과 상관없이 모두 남아요. ON의 A.GRP = 'X'는 A 행을 거르지 못하고 '짝을 붙일 수 있는 A'만 정해서, A 2와 A 4는 짝 없이 NULL로 남아요.",
  why: "LEFT OUTER JOIN은 왼쪽 테이블의 모든 행을 결과에 남기기로 약속한 조인이에요. ON 조건이 무엇이든 왼쪽 행은 사라지지 않아요. ON 조건은 '이 A 행에 어떤 B 행을 붙일까'만 정해요.\n\n그래서 ON에 쓴 A.GRP = 'X'는 'GRP가 X인 A만 짝을 붙일 수 있다'는 뜻이 돼요. GRP가 Y인 A는 짝을 못 붙이고 B 쪽이 NULL인 채로 남아요.\n\n(가)를 행마다 볼게요. A 1(X)은 B의 10과 짝이 돼요. A 2(Y)는 B에 20, 30이 있지만 GRP가 Y라 짝을 못 붙이고 NULL 1행이에요. A 3(X)은 40과 짝이 돼요. A 4(Y)는 NULL 1행이에요. 4건이고, SUM(B.AMT)는 10 + 40 = 50이에요(NULL은 건너뜀).\n\n(나)는 조인을 다 한 뒤 WHERE A.GRP = 'X'로 A 행 자체를 걸러요. A 1-10, A 3-40만 남아서 2건이에요. **왼쪽 테이블의 행을 실제로 거르려면 WHERE에 써야 해요.** 정답은 4, 50, 2예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- (가)\nSELECT COUNT(*), SUM(B.AMT)          -- ③ 4행, 10 + 40 = 50\n  FROM A LEFT OUTER JOIN B           -- ① A 4행은 무조건 남김\n    ON A.ID = B.AID AND A.GRP = 'X'; -- ② GRP가 X인 A만 짝을 붙임 → A 2, 4는 NULL 1행\n-- (나)\nSELECT COUNT(*)                      -- ④ 2\n  FROM A LEFT OUTER JOIN B\n    ON A.ID = B.AID                  -- ① ② 짝 붙이기 → 5행\n WHERE A.GRP = 'X';                  -- ③ 조인 뒤 A 행 자체를 걸러요 → A 1, A 3" },
    { t: "1단계: (가) ON A.ID = B.AID AND A.GRP = 'X'", tb: { c: ["A.ID", "A.GRP", "B.AID", "B.AMT"], r: [[1, "X", 1, 10], [2, "Y", null, null], [3, "X", 3, 40], [4, "Y", null, null]], hl: [1, 3] }, n: "A 2는 B에 20, 30이 있지만 GRP가 Y라 짝을 못 붙여요." },
    { t: "2단계: (나) 조인 후 WHERE A.GRP = 'X'", tb: { c: ["A.ID", "B.AMT"], r: [[1, 10], [3, 40]] } },
    { t: "의도대로 쓰려면: GRP가 X인 A만 보고 싶다면 WHERE에", n: "SELECT COUNT(*), SUM(B.AMT)\n  FROM A LEFT OUTER JOIN B\n    ON A.ID = B.AID\n WHERE A.GRP = 'X';   -- 2건, 합계 50" }
  ],
  res: { c: ["가_CNT", "가_SUM", "나_CNT"], r: [[4, 50, 2]] },
  pg: "SELECT x.c, x.s, (SELECT COUNT(*) FROM A LEFT JOIN B ON A.ID = B.AID WHERE A.GRP = 'X') FROM (SELECT COUNT(*) c, SUM(B.AMT) s FROM A LEFT JOIN B ON A.ID = B.AID AND A.GRP = 'X') x",
  ox: ["이렇게 생각하면 틀려요: 'ON의 A 조건이 WHERE처럼 A 행을 거른다'. LEFT JOIN은 왼쪽 행을 늘 남기니까 (가)는 4건이에요.", "정답이에요. (가)는 4건·합계 50, (나)는 2건이에요.", "이렇게 생각하면 틀려요: 'A.GRP 조건은 아무 효과가 없다'. 그러면 A 2가 20, 30과 짝이 되어 5건·합계 100이 되지만, 실제로는 A 2가 짝을 못 붙여요.", "이렇게 생각하면 틀려요: '(나)도 왼쪽 행이 다 남는다'. WHERE는 조인이 끝난 뒤 행을 지우므로 2건이에요."],
  trap: "남기고 싶은 쪽(왼쪽) 테이블 조건은 WHERE에, 짝으로 붙일 쪽(오른쪽) 테이블 조건은 ON에 써요. 위치를 바꾸면 결과가 완전히 달라져요.",
  memo: "LEFT JOIN: 왼쪽 조건을 ON에 쓰면 거르지 못함"
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
  sum: "ORD와 ADDR를 같은 고객 번호로 한꺼번에 붙이면 '주문 수 × 주소 수'만큼 행이 불어나요. 그래서 금액이 주소 개수만큼 여러 번 더해지고, 주소가 없는 고객 3은 사라져요.",
  why: "조인은 조건에 맞는 짝마다 행을 하나씩 만들어요. 한 고객에게 주문이 2건, 주소가 2건이면, 두 테이블을 동시에 붙일 때 2 × 2 = 4행이 생겨요. 주문과 주소는 서로 관계가 없는데 같은 고객 번호로만 이어졌기 때문이에요.\n\n고객 1은 주문 100, 200과 주소 SEOUL, BUSAN이 만나 4행이 돼요. 각 주문 금액이 2번씩 더해져 (100 + 200) × 2 = 600이에요.\n\n고객 2는 주문 50 하나와 주소 3개가 만나 3행이 돼요. 50이 3번 더해져 150이에요. 고객 3은 ADDR에 짝이 없어서 내부 조인(JOIN)에서 아예 사라져요.\n\n**서로 관계없는 두 자식 테이블을 같은 키로 한꺼번에 조인하면 합계가 부풀려져요.** 결과는 1: 600, 2: 150이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT C.CID, SUM(O.AMT) AS TOT   -- ⑤ 불어난 행의 금액을 다 더함\n  FROM CUST C                     -- ① 고객 3명\n  JOIN ORD  O ON O.CID = C.CID    -- ② 주문마다 1행 → 고객1 2행, 고객2 1행, 고객3 1행\n  JOIN ADDR A ON A.CID = C.CID    -- ③ 그 행마다 주소 수만큼 복제 → 고객1 4행, 고객2 3행, 고객3 사라짐\n GROUP BY C.CID                   -- ④ 고객별로 묶기\n ORDER BY C.CID;" },
    { t: "1단계: 조인 결과 (GROUP BY 전)", tb: { c: ["CID", "AMT", "CITY"], r: [[1, 100, "SEOUL"], [1, 100, "BUSAN"], [1, 200, "SEOUL"], [1, 200, "BUSAN"], [2, 50, "INCHEON"], [2, 50, "DAEGU"], [2, 50, "ULSAN"]] }, n: "고객 3은 ADDR에 짝이 없어서 빠져요." },
    { t: "2단계: GROUP BY CID", tb: { c: ["CID", "행 수", "SUM(AMT)"], r: [[1, 4, 600], [2, 3, 150]] } },
    { t: "의도대로 쓰려면: 자식 테이블을 먼저 고객별로 줄인 뒤 조인", n: "SELECT C.CID, O.TOT, AD.CNT\n  FROM CUST C\n  JOIN (SELECT CID, SUM(AMT) AS TOT FROM ORD  GROUP BY CID) O  ON O.CID  = C.CID\n  JOIN (SELECT CID, COUNT(*) AS CNT FROM ADDR GROUP BY CID) AD ON AD.CID = C.CID\n ORDER BY C.CID;   -- 1: 300(주소 2), 2: 50(주소 3)\n-- 주문 합계만 필요하면 ADDR를 빼요 → 1: 300, 2: 50, 3: 70" }
  ],
  res: { c: ["CID", "TOT"], r: [[1, 600], [2, 150]] },
  pg: "SELECT C.CID, SUM(O.AMT) AS TOT FROM CUST C JOIN ORD O ON O.CID = C.CID JOIN ADDR A ON A.CID = C.CID GROUP BY C.CID ORDER BY C.CID",
  ox: ["이렇게 생각하면 틀려요: '조인해도 행 수는 안 변하고, 주소 없는 고객 3도 남는다'. 주소 수만큼 행이 복제되고, 내부 조인이라 고객 3은 사라져요.", "이렇게 생각하면 틀려요: '고객 3이 빠지는 건 맞지만 금액은 그대로'. 주문 행이 주소 수만큼 복제되어 금액이 여러 번 더해져요.", "이렇게 생각하면 틀려요: '금액은 부풀지만 고객 3은 남는다'. 고객 3은 ADDR에 짝이 없어서 내부 조인에서 사라져요.", "정답이에요. 고객 1은 4행이라 600, 고객 2는 3행이라 150이에요."],
  trap: "관계없는 두 1:N 자식 테이블을 같은 부모 키로 한 번에 조인하면 N × M 행이 생겨요. 합계는 자식 테이블을 먼저 GROUP BY로 줄인 뒤 조인해야 정확해요.",
  memo: "자식 둘을 한꺼번에 조인 → SUM이 부풀려짐"
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
  sum: "BETWEEN은 양 끝을 포함해서, 1000인 B는 1등급(0~1000)과 2등급(1000~2000)에 모두 걸려 2행이 돼요. SAL이 NULL인 D와 범위 밖인 E는 짝이 없어 사라져요.",
  why: "BETWEEN a AND b는 'a 이상 b 이하'라서 양 끝 값을 포함해요. 등급표처럼 '범위'로 짝을 찾는 조인(비등가 조인)에서는 한 사원이 여러 범위에 걸리면 그만큼 행이 생겨요. 어떤 범위에도 안 걸리면 내부 조인이라 사라져요.\n\n이 등급표는 1등급 끝(1000)과 2등급 시작(1000)이 겹쳐 있어요. 그래서 경계값에서 행이 늘어날 수 있어요.\n\n사원마다 볼게요. A(800)는 1등급만이에요. B(1000)는 1등급과 2등급 둘 다라 2행이에요. C(2000)는 2등급만이에요(3등급은 2001부터). D는 SAL이 NULL이라 어떤 범위와 비교해도 '모름'이라 짝이 없어요. E(3500)는 어떤 범위에도 없어요.\n\n결과 행은 A-1, B-1, B-2, C-2의 4행이에요. 서로 다른 이름은 A, B, C의 3명이고, 등급 합은 1 + 1 + 2 + 2 = 6이에요. **비등가 조인은 '사원 1명당 1행'이 보장되지 않아요.** 정답은 4, 3, 6이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT COUNT(*), COUNT(DISTINCT E.ENAME), SUM(S.GRADE)  -- ③ 4, 3, 6\n  FROM EMP E, SALGRADE S                                -- ① 5명 × 3등급 = 15개 조합\n WHERE E.SAL BETWEEN S.LOSAL AND S.HISAL;               -- ② 범위에 드는 조합만 남김\n                                                        --    B(1000)는 1등급·2등급 둘 다\n                                                        --    D(NULL), E(3500)는 남는 조합 없음" },
    { t: "1단계: 사원마다 걸리는 등급", tb: { c: ["ENAME", "SAL", "매칭 GRADE"], r: [["A", 800, "1"], ["B", 1000, "1, 2 (경계 중복)"], ["C", 2000, "2"], ["D", null, "없음 (모름)"], ["E", 3500, "없음 (범위 밖)"]], hl: [1] } },
    { t: "2단계: 조인 결과와 집계", tb: { c: ["ENAME", "GRADE"], r: [["A", 1], ["B", 1], ["B", 2], ["C", 2]] }, n: "COUNT(*) 4, DISTINCT ENAME 3, SUM(GRADE) 1+1+2+2 = 6" },
    { t: "의도대로 쓰려면: 사원마다 1행, 경계는 낮은 등급으로, 등급 없는 사원도 표시", n: "SELECT E.ENAME, MIN(S.GRADE) AS GRADE\n  FROM EMP E LEFT OUTER JOIN SALGRADE S\n    ON E.SAL BETWEEN S.LOSAL AND S.HISAL\n GROUP BY E.ENAME\n ORDER BY E.ENAME;   -- A 1, B 1, C 2, D NULL, E NULL (5행)\n-- 근본적으로는 등급표 범위가 겹치지 않게 고치는 게 맞아요" }
  ],
  res: { c: ["CNT", "DCNT", "SUMG"], r: [[4, 3, 6]] },
  pg: "SELECT COUNT(*), COUNT(DISTINCT E.ENAME), SUM(S.GRADE) FROM EMP E, SALGRADE S WHERE E.SAL BETWEEN S.LOSAL AND S.HISAL",
  ox: ["이렇게 생각하면 틀려요: '사원 한 명은 한 등급에만 들어간다'. BETWEEN은 양 끝을 포함해서 1000인 B는 두 등급에 다 걸려요.", "정답이에요. 4행, 3명, 등급 합 6이에요.", "이렇게 생각하면 틀려요: 'B는 2등급에만 들어간다(HISAL 1000은 포함 안 됨)'. BETWEEN은 끝값 1000도 포함해요.", "이렇게 생각하면 틀려요: '짝이 없는 D, E도 등급 NULL로 남는다'. 이건 내부 조인이라 짝이 없으면 사라져요."],
  trap: "비등가 조인은 '사원 1명당 1행'이 보장되지 않아요. 등급표 범위가 겹치면 행이 늘고, 범위에 빈틈이 있거나 값이 NULL이면 행이 사라져요.",
  memo: "BETWEEN은 양 끝 포함 / 범위로 붙이는 조인도 내부 조인"
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
  sum: "조인은 왼쪽부터 차례로 해요. (나)는 LEFT JOIN으로 살려 둔 NULL 행에 INNER JOIN을 하니 짝이 없어서 다 지워지고 1건만 남아요. (다)는 괄호 안을 먼저 만들어서 부서가 모두 살아 4건이에요.",
  why: "괄호가 없으면 조인은 왼쪽부터 차례로 해요. 앞 조인의 결과가 다음 조인의 왼쪽 테이블이 돼요. 그래서 뒤에 오는 조인 종류가 앞에서 살려 둔 행을 지울 수도 있어요.\n\n먼저 DEPT LEFT JOIN EMP를 하면 10(E1, E2), 20(E3), 30(NULL), 40(NULL)의 5행이에요. (가)는 여기에 PROJ를 LEFT JOIN해요. LEFT JOIN은 왼쪽 행을 지우지 않으니 5건 그대로예요.\n\n(나)는 같은 5행에 PROJ를 INNER JOIN해요. INNER JOIN은 짝이 있는 행만 남겨요. E.PNO = P.PNO가 확실히 맞는 건 E1(100) 하나뿐이에요. E2는 PNO가 NULL, E3은 200이 PROJ에 없고, 30·40의 NULL 행은 비교가 '모름'이라 다 빠져요. **뒤의 INNER JOIN이 앞의 LEFT JOIN이 살려 둔 행을 지워 버려서 1건이에요.**\n\n(다)는 괄호 안의 EMP JOIN PROJ를 먼저 만들어요. 결과는 E1(10번 부서, P1)과 E4(부서 NULL, P1)예요. 이걸 DEPT 기준으로 LEFT JOIN하면 10은 E1과 짝, 20·30·40은 짝이 없어 NULL 1행씩이에요. 4건이에요. 정답은 5, 1, 4예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- (가)\nSELECT COUNT(*) FROM DEPT D\n       LEFT JOIN EMP E  ON D.DNO = E.DNO   -- ① 부서 다 남김 → 5행\n       LEFT JOIN PROJ P ON E.PNO = P.PNO;  -- ② 또 LEFT → 5행 그대로\n-- (나)\nSELECT COUNT(*) FROM DEPT D\n       LEFT JOIN EMP E  ON D.DNO = E.DNO   -- ① 5행\n            JOIN PROJ P ON E.PNO = P.PNO;  -- ② INNER → 짝 있는 E1만 남음 → 1\n-- (다)\nSELECT COUNT(*) FROM DEPT D\n       LEFT JOIN (EMP E JOIN PROJ P ON E.PNO = P.PNO)  -- ① 괄호 먼저: E1, E4\n              ON D.DNO = E.DNO;                         -- ② 부서 다 남김 → 10-E1, 20, 30, 40 → 4" },
    { t: "1단계: DEPT LEFT JOIN EMP", tb: { c: ["D.DNO", "E.ENO", "E.PNO"], r: [[10, 1, 100], [10, 2, null], [20, 3, 200], [30, null, null], [40, null, null]] } },
    { t: "2단계: 두 번째 조인 방식별 결과", tb: { c: ["SQL", "결과 행", "건수"], r: [["(가) LEFT JOIN PROJ", "5행 그대로 (P1은 E1만)", 5], ["(나) INNER JOIN PROJ", "10-E1-P1", 1], ["(다) DEPT ⟕ (EMP ⋈ PROJ)", "10-E1, 20, 30, 40", 4]] } },
    { t: "의도대로 쓰려면: '부서는 다 보이고, 프로젝트가 있는 사원만 붙이기'", n: "SELECT D.DNO, E.ENO, P.PNAME\n  FROM DEPT D\n  LEFT JOIN (EMP E JOIN PROJ P ON E.PNO = P.PNO)\n    ON D.DNO = E.DNO\n ORDER BY D.DNO;   -- 10-1-P1, 20-NULL, 30-NULL, 40-NULL (4행)\n-- 사원도 다 남기고 싶다면 끝까지 LEFT JOIN으로 이어요 ((가), 5행)" }
  ],
  res: { c: ["가", "나", "다"], r: [[5, 1, 4]] },
  pg: "SELECT (SELECT COUNT(*) FROM DEPT D LEFT JOIN EMP E ON D.DNO = E.DNO LEFT JOIN PROJ P ON E.PNO = P.PNO), (SELECT COUNT(*) FROM DEPT D LEFT JOIN EMP E ON D.DNO = E.DNO JOIN PROJ P ON E.PNO = P.PNO), (SELECT COUNT(*) FROM DEPT D LEFT JOIN (EMP E JOIN PROJ P ON E.PNO = P.PNO) ON D.DNO = E.DNO)",
  ox: ["정답이에요. (가) 5, (나) 1, (다) 4건이에요.", "이렇게 생각하면 틀려요: '첫 LEFT JOIN이 끝까지 부서를 지켜 준다'. 뒤의 INNER JOIN은 짝 없는 행을 모두 지워서 (나)는 1건이에요.", "이렇게 생각하면 틀려요: '(다)는 (가)와 같다'. 괄호 안 INNER JOIN에서 E2, E3이 먼저 빠지므로 10번 부서는 1행, 20번은 NULL 1행이 돼요.", "이렇게 생각하면 틀려요: '(가)에서 10번 부서는 1행'. 10번 부서에는 사원이 2명이라 2행이 생겨요."],
  trap: "LEFT JOIN 뒤에 INNER JOIN이 이어지면 앞의 LEFT JOIN이 사실상 내부 조인처럼 바뀌어요. 다 남기려면 끝까지 LEFT로 잇거나 괄호로 순서를 바꾸세요.",
  memo: "LEFT 뒤에 INNER → LEFT 효과가 사라짐"
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
  sum: "FULL OUTER JOIN은 '짝이 맞은 행 + 왼쪽에서 짝 없는 행 + 오른쪽에서 짝 없는 행'이에요. NULL끼리는 같다고 보지 않아서 NULL 행은 모두 짝 없는 쪽으로 가요. 4 + 2 + 3 = 9행이에요.",
  why: "FULL OUTER JOIN은 양쪽 테이블의 행을 하나도 버리지 않는 조인이에요. 짝이 맞은 행을 먼저 만들고, 짝이 없는 왼쪽 행과 짝이 없는 오른쪽 행을 반대쪽을 NULL로 채워 덧붙여요.\n\n짝을 찾는 T1.K = T2.K는 보통 비교라서 NULL = NULL은 '모름'이에요. 그래서 양쪽에 NULL이 있어도 서로 짝이 되지 않아요.\n\n짝 맞는 행부터 세요. K = 1은 T1에 2개, T2에 1개라 2 × 1 = 2행이에요. K = 2는 T1에 1개, T2에 2개라 1 × 2 = 2행이에요. 합쳐서 4행이에요.\n\n짝 없는 행은 T1의 NULL, 3(2행)과 T2의 NULL, NULL, 4(3행)예요. 전체는 4 + 2 + 3 = 9행이에요. COUNT(T1.K)는 T1.K가 NULL이 아닌 행만 세요. 짝 맞은 4행은 모두 T1.K가 있고, T1에서 짝 없는 3도 있어서 5예요. **NULL 키는 절대 짝이 되지 않고 늘 '짝 없는 행'으로 따로 붙어요.** 정답은 9, 5예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT COUNT(*), COUNT(T1.K)  -- ④ 9행 / T1.K가 있는 행 5\n  FROM T1 FULL OUTER JOIN T2  -- ① 양쪽 다 남기는 조인\n    ON T1.K = T2.K;           -- ② 짝: 1-1 2행, 2-2 2행 (NULL = NULL은 모름 → 짝 아님)\n                              -- ③ 짝 없는 T1(NULL, 3), T2(NULL, NULL, 4)를 덧붙임" },
    { t: "1단계: 짝이 맞은 행 (같은 키끼리 곱하기)", tb: { c: ["T1.K", "T2.K"], r: [[1, 1], [1, 1], [2, 2], [2, 2]] } },
    { t: "2단계: 짝 없는 행 덧붙이기", tb: { c: ["T1.K", "T2.K", "출처"], r: [[null, null, "T1의 NULL"], [3, null, "T1의 3"], [null, null, "T2의 NULL"], [null, null, "T2의 NULL"], [null, 4, "T2의 4"]] }, n: "모두 4 + 2 + 3 = 9행이에요. T1.K가 NULL이 아닌 값은 1, 1, 2, 2, 3 → 5개예요." }
  ],
  res: { c: ["COUNT(*)", "COUNT(T1.K)"], r: [[9, 5]] },
  pg: "SELECT COUNT(*), COUNT(T1.K) FROM T1 FULL OUTER JOIN T2 ON T1.K = T2.K",
  ox: ["이렇게 생각하면 틀려요: 'NULL끼리는 짝이 된다'. 그러면 NULL끼리 2행이 생기고 짝 없는 NULL 3행이 사라져 8행이 되지만, 조인에서 NULL = NULL은 '모름'이라 짝이 안 돼요.", "이렇게 생각하면 틀려요: '같은 키는 한 번만 짝짓는다'. 같은 키가 여러 개면 개수끼리 곱한 만큼 행이 생겨요.", "이렇게 생각하면 틀려요: 'COUNT(T1.K)는 T1의 NULL 아닌 값 개수(1, 1, 2, 3 = 4)'. T2에 2가 2개라 T1의 2가 2행으로 복제되므로 5예요.", "정답이에요. 9행이고, T1.K가 있는 행은 5개예요."],
  trap: "FULL OUTER JOIN 행 수 = 짝 맞은 행 + 왼쪽 짝 없는 행 + 오른쪽 짝 없는 행이에요. NULL 키는 늘 짝 없는 쪽으로 가요.",
  memo: "FULL = 짝 맞은 것 + 왼쪽만 + 오른쪽만 / NULL 키는 짝 안 됨"
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
  sum: "NATURAL JOIN은 이름이 같은 컬럼을 전부 조인 조건으로 써요. 그래서 DNO뿐 아니라 NAME(사원명 = 부서명)까지 같아야 해서, 우연히 이름이 'SALES'로 같은 3번 사원만 남아요.",
  why: "NATURAL JOIN은 두 테이블에서 이름이 같은 컬럼을 모두 찾아서 '그 값들이 다 같다'를 조인 조건으로 써요. 컬럼의 뜻은 보지 않고 이름만 봐요.\n\n이 문제에서 두 테이블에 공통으로 있는 컬럼은 DNO와 NAME이에요. 그래서 조건은 EMP.DNO = DEPT.DNO AND EMP.NAME = DEPT.NAME이 돼요. EMP.NAME은 사원 이름, DEPT.NAME은 부서 이름이라 뜻이 전혀 다른데도요.\n\n사원마다 볼게요. 1번 KIM과 2번 LEE는 부서 이름 ACCT와 달라서 빠져요. 3번은 사원 이름이 우연히 'SALES'이고 20번 부서 이름도 'SALES'라 남아요. 4번 PARK은 HR과 달라서 빠져요. 그래서 1건이에요.\n\nUSING (DNO)는 괄호 안의 DNO만 조인 조건으로 써요. 네 사원 모두 부서가 있어서 4건이에요. **NATURAL JOIN은 '이름만 같으면' 조인 조건에 넣어서 의도하지 않은 컬럼까지 비교해요.** 정답은 1, 4예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- (가)\nSELECT COUNT(*) FROM EMP NATURAL JOIN DEPT;\n-- 이름이 같은 컬럼 전부 → ON EMP.DNO = DEPT.DNO AND EMP.NAME = DEPT.NAME → 3번만 → 1\n-- (나)\nSELECT COUNT(*) FROM EMP JOIN DEPT USING (DNO);\n-- DNO만 비교 → 4명 모두 → 4" },
    { t: "1단계: 공통 컬럼 찾기", tb: { c: ["컬럼", "EMP", "DEPT", "NATURAL 조인 키?"], r: [["DNO", "O", "O", "예"], ["NAME", "O", "O", "예 (의도와 다름)"], ["ENO", "O", "X", "아니오"]] } },
    { t: "2단계: 사원마다 짝이 되는지", tb: { c: ["ENO", "DNO", "EMP.NAME", "DEPT.NAME", "(가)", "(나)"], r: [[1, 10, "KIM", "ACCT", "X", "O"], [2, 10, "LEE", "ACCT", "X", "O"], [3, 20, "SALES", "SALES", "O", "O"], [4, 30, "PARK", "HR", "X", "O"]], hl: [2] } },
    { t: "의도대로 쓰려면: 조인 컬럼을 직접 적기", n: "SELECT COUNT(*)\n  FROM EMP E JOIN DEPT D\n    ON E.DNO = D.DNO;   -- 4건\n-- USING (DNO)도 같은 4건이에요. NATURAL JOIN은 공통 컬럼이 무엇인지 꼭 확인하고 쓰세요" }
  ],
  res: { c: ["가", "나"], r: [[1, 4]] },
  pg: "SELECT (SELECT COUNT(*) FROM EMP NATURAL JOIN DEPT), (SELECT COUNT(*) FROM EMP JOIN DEPT USING (DNO))",
  ox: ["이렇게 생각하면 틀려요: 'NATURAL JOIN은 알아서 DNO 관계만 골라 조인한다'. 이름이 같으면 NAME도 조인 조건이 돼요.", "이렇게 생각하면 틀려요: 'NAME까지 비교하니 맞는 사원이 없다'. 3번 사원 이름이 부서 이름과 똑같이 'SALES'라서 1건이 남아요.", "정답이에요. NATURAL JOIN은 1건, USING (DNO)는 4건이에요.", "이렇게 생각하면 틀려요: 'USING도 이름 같은 컬럼을 전부 쓴다'. USING은 괄호 안 컬럼만 써요."],
  trap: "NATURAL JOIN은 컬럼의 '뜻'이 아니라 '이름'으로 조인해요. 수정일자(UPD_DT), 이름(NAME)처럼 흔한 컬럼 이름이 겹치면 건수가 줄어들어요.",
  memo: "NATURAL = 이름 같은 컬럼 전부 / USING = 적은 컬럼만"
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
  sum: "NATURAL JOIN과 USING은 조인에 쓴 컬럼을 결과에 한 번만 보여 주고, ON은 양쪽 컬럼을 다 보여 줘요. 그래서 7개에서 NATURAL은 공통 2개, USING은 1개를 빼서 5, 6, 7이에요.",
  why: "SELECT *의 컬럼 수는 조인 방식에 따라 달라요. NATURAL JOIN과 USING은 조인에 쓴 컬럼을 '하나로 합쳐서' 맨 앞에 한 번만 보여 줘요. 두 값이 어차피 같으니 한 번만 보여 주는 거예요. ON 조인은 아무것도 합치지 않고 양쪽 컬럼을 그대로 다 보여 줘요.\n\nEMP는 4개(ENO, DNO, NAME, SAL), DEPT는 3개(DNO, NAME, LOC)라 합치면 7개예요.\n\n(가) NATURAL JOIN은 공통 컬럼 DNO, NAME 두 개를 한 번씩만 보여 줘요. DNO, NAME, ENO, SAL, LOC로 7 - 2 = 5개예요. (나) USING (DNO)는 DNO만 합쳐요. NAME은 조인에 안 썼으니 양쪽 것이 다 나와요. DNO, ENO, NAME, SAL, NAME, LOC로 7 - 1 = 6개예요.\n\n(다) ON은 합치는 컬럼이 없어서 7개 그대로예요. **NATURAL은 공통 컬럼 수만큼, USING은 적은 컬럼 수만큼 빠지고, ON은 하나도 빠지지 않아요.** 정답은 5, 6, 7이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- 전체 컬럼: EMP 4개 + DEPT 3개 = 7개\nSELECT * FROM EMP NATURAL JOIN DEPT;               -- DNO, NAME을 하나로 합침 → 7 - 2 = 5\nSELECT * FROM EMP JOIN DEPT USING (DNO);           -- DNO만 합침, NAME은 2개 → 7 - 1 = 6\nSELECT * FROM EMP E JOIN DEPT D ON E.DNO = D.DNO;  -- 합치지 않음 → 7" },
    { t: "1단계: 컬럼 구성", tb: { c: ["SQL", "결과 컬럼", "개수"], r: [["(가) NATURAL", "DNO, NAME, ENO, SAL, LOC", 5], ["(나) USING (DNO)", "DNO, ENO, NAME, SAL, NAME, LOC", 6], ["(다) ON", "ENO, DNO, NAME, SAL, DNO, NAME, LOC", 7]] } }
  ],
  res: { c: ["가", "나", "다"], r: [[5, 6, 7]] },
  pg: "SELECT (SELECT COUNT(*) FROM json_each((SELECT to_json(x) FROM (SELECT * FROM EMP NATURAL JOIN DEPT) x LIMIT 1))), (SELECT COUNT(*) FROM json_each((SELECT to_json(x) FROM (SELECT * FROM EMP JOIN DEPT USING (DNO)) x LIMIT 1))), (SELECT COUNT(*) FROM json_each((SELECT to_json(x) FROM (SELECT * FROM EMP E JOIN DEPT D ON E.DNO = D.DNO) x LIMIT 1)))",
  ox: ["이렇게 생각하면 틀려요: 'NATURAL JOIN도 DNO만 합친다'. NAME도 두 테이블에 다 있으니 공통 컬럼이라 함께 합쳐져요.", "이렇게 생각하면 틀려요: 'NATURAL·USING도 조인 컬럼을 양쪽 다 보여 준다'. 이 둘은 조인 컬럼을 한 번만 보여 줘요.", "이렇게 생각하면 틀려요: 'ON 조인도 조인 컬럼을 한 번만 보여 준다'. ON은 양쪽 컬럼을 다 보여 줘서 7개예요.", "정답이에요. 5, 6, 7개예요."],
  trap: "USING에 안 적은 같은 이름 컬럼(NAME)은 양쪽 것이 다 나와요. 이때 NAME을 테이블 이름 없이 SELECT에 쓰면 '어느 쪽 NAME인지 모호하다'는 오류가 나요.",
  memo: "SELECT * 컬럼 수: ON = 합 / USING = 합 - 적은 수 / NATURAL = 합 - 공통 수"
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
  sum: "CROSS JOIN은 조건 없이 4 × 2 = 8행을 만들어요. GRADE가 NULL인 2행은 '>='도, NOT(…)도 답이 '모름'이라 (나)와 (다) 어디에도 안 들어가요.",
  why: "CROSS JOIN은 조건 없이 모든 조합을 만들어요. A 4행 × B 2행 = 8행이고, NULL 값이 있는 행도 그대로 조합돼요. 그다음 WHERE가 8행 하나하나에 조건을 적용해요.\n\n(나) GRADE >= CODE를 행마다 보면 1-1, 2-1, 2-2, 3-1, 3-2가 참이라 5건이에요. 1-2는 거짓이에요. GRADE가 NULL인 2행은 'NULL이 1보다 크거나 같은가?'를 알 수 없어서 '모름'이에요.\n\n(다)는 NOT으로 뒤집어요. 거짓이던 1-2만 참이 되어 1건이에요. 모름은 뒤집어도 모름이라 NULL 2행은 여기서도 빠져요.\n\n**그래서 (나) 5 + (다) 1 = 6으로, 전체 8행보다 NULL 2행만큼 적어요.** 참고로 Oracle이 NULL을 '가장 큰 값'처럼 다루는 건 정렬할 때뿐이에요. 비교에서는 늘 모름이에요. 정답은 8, 5, 1이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- 세 문장 모두 ① A × B = 8행 → ② WHERE → ③ COUNT(*)\nSELECT COUNT(*) FROM A CROSS JOIN B;                               -- 8\nSELECT COUNT(*) FROM A CROSS JOIN B WHERE A.GRADE >= B.CODE;       -- 참 5행, NULL 2행은 모름\nSELECT COUNT(*) FROM A CROSS JOIN B WHERE NOT (A.GRADE >= B.CODE); -- 거짓이던 1행만 참, 모름은 그대로" },
    { t: "1단계: CROSS JOIN 8행 따져 보기 (참·거짓·모름)", tb: { c: ["GRADE", "CODE", "GRADE >= CODE", "NOT (…)"], r: [[1, 1, "참 (TRUE)", "거짓 (FALSE)"], [1, 2, "거짓 (FALSE)", "참 (TRUE)"], [2, 1, "참 (TRUE)", "거짓 (FALSE)"], [2, 2, "참 (TRUE)", "거짓 (FALSE)"], [3, 1, "참 (TRUE)", "거짓 (FALSE)"], [3, 2, "참 (TRUE)", "거짓 (FALSE)"], [null, 1, "모름 (UNKNOWN)", "모름 (UNKNOWN)"], [null, 2, "모름 (UNKNOWN)", "모름 (UNKNOWN)"]], hl: [6, 7] } },
    { t: "2단계: 건수", tb: { c: ["(가)", "(나)", "(다)"], r: [[8, 5, 1]] } },
    { t: "의도대로 쓰려면: '(나)에 안 든 나머지 전부' 구하기", n: "-- Oracle: LNNVL(조건)은 조건이 거짓이거나 모름이면 참이에요\nSELECT COUNT(*) FROM A CROSS JOIN B\n WHERE LNNVL(A.GRADE >= B.CODE);    -- 1-2 + NULL 2행 → 3\n-- 표준 SQL(PostgreSQL 등): WHERE (A.GRADE >= B.CODE) IS NOT TRUE → 3" }
  ],
  res: { c: ["가", "나", "다"], r: [[8, 5, 1]] },
  pg: "SELECT (SELECT COUNT(*) FROM A CROSS JOIN B), (SELECT COUNT(*) FROM A CROSS JOIN B WHERE A.GRADE >= B.CODE), (SELECT COUNT(*) FROM A CROSS JOIN B WHERE NOT (A.GRADE >= B.CODE))",
  ox: ["정답이에요. 8, 5, 1이에요.", "이렇게 생각하면 틀려요: '(다)는 전체에서 (나)를 뺀 8 - 5 = 3'. GRADE가 NULL인 2행은 NOT을 해도 모름이라 (다)에 안 들어가요.", "이렇게 생각하면 틀려요: 'CROSS JOIN은 NULL 값이 있는 행은 곱하지 않는다'. 조건이 없으니 NULL이 있어도 모든 조합을 만들어요.", "이렇게 생각하면 틀려요: 'NULL은 가장 큰 값이라 NULL >= 1, NULL >= 2는 참'. 그건 정렬 규칙이고, 비교에서 NULL은 늘 모름이에요."],
  trap: "Oracle에서 NULL을 '가장 큰 값'으로 다루는 건 정렬(ORDER BY)에서뿐이에요. 비교에서 NULL은 늘 '모름'이에요.",
  memo: "CROSS JOIN 행 수 = 곱 / 비교에서 NULL = 모름"
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
  sum: "NOT IN은 바깥 값이 NULL이면 '2, 3과 다르다'를 확인할 수 없어 그 행을 버려요. NOT EXISTS와 LEFT JOIN … IS NULL은 '짝이 있나?'만 보는데, NULL은 짝이 없으니 남겨요.",
  why: "이번에는 서브쿼리 쪽(T2)에는 NULL이 없고 바깥 T1에 NULL이 있어요. 세 방법은 묻는 질문이 달라서 NULL 행을 다르게 다뤄요.\n\n(가) NOT IN은 'V가 2와도 다르고 3과도 다른가?'를 확인해요. V가 NULL이면 'NULL <> 2?'가 모름이라 확인이 안 되고, 그 행은 버려져요. 1, 4는 통과하고 2는 걸려서 2건이에요.\n\n(나) NOT EXISTS는 'T2에 T2.V = T1.V인 행이 하나라도 있나?'를 묻고, 없으면 통과예요. V가 NULL이면 T2.V = NULL이 어떤 행에서도 참이 아니라서 '그런 행이 없다'가 돼요. 그래서 NULL 행도 통과해요. 1, NULL, 4로 3건이에요.\n\n(다) LEFT JOIN은 T1을 다 남기고, 짝이 없으면 T2.V를 NULL로 채워요. T1의 NULL 행은 짝이 없으니 T2.V가 NULL이 되어 IS NULL로 남아요. 3건이에요. **바깥 컬럼에 NULL이 있으면 NOT IN만 그 행을 버려요.** 정답은 2, 3, 3이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- (가)\nSELECT COUNT(*) FROM T1\n WHERE V NOT IN (SELECT V FROM T2);      -- V <> 2 AND V <> 3 → V가 NULL이면 모름 → 2건\n-- (나)\nSELECT COUNT(*) FROM T1\n WHERE NOT EXISTS (SELECT 1 FROM T2      -- 'T2.V = T1.V인 행이 있나?'\n                    WHERE T2.V = T1.V);  -- V가 NULL이면 그런 행 없음 → 통과 → 3건\n-- (다)\nSELECT COUNT(*) FROM T1 LEFT JOIN T2 ON T1.V = T2.V  -- 짝 없으면 T2.V = NULL로 채움\n WHERE T2.V IS NULL;                                   -- 짝 없는 1, NULL, 4 → 3건" },
    { t: "1단계: 행마다 따져 보기 (참·거짓·모름)", tb: { c: ["T1.V", "(가) NOT IN", "(나) NOT EXISTS", "(다) 조인 후 T2.V"], r: [[1, "참 (TRUE)", "참 (TRUE)", "NULL → 남음"], [2, "거짓 (FALSE)", "거짓 (FALSE)", "2 → 제거"], [null, "모름 (UNKNOWN)", "참 (TRUE)", "NULL → 남음"], [4, "참 (TRUE)", "참 (TRUE)", "NULL → 남음"]], hl: [2] } },
    { t: "2단계: 건수", tb: { c: ["(가)", "(나)", "(다)"], r: [[2, 3, 3]] } },
    { t: "의도대로 쓰려면: 'T2에 없는 T1 값(NULL 포함)'은 NOT EXISTS로", n: "SELECT COUNT(*) FROM T1\n WHERE NOT EXISTS (SELECT 1 FROM T2 WHERE T2.V = T1.V);  -- 3건\n-- NOT IN을 꼭 써야 한다면 NULL 행을 따로 더해요\nSELECT COUNT(*) FROM T1\n WHERE V NOT IN (SELECT V FROM T2) OR V IS NULL;         -- 3건" }
  ],
  res: { c: ["가", "나", "다"], r: [[2, 3, 3]] },
  pg: "SELECT (SELECT COUNT(*) FROM T1 WHERE V NOT IN (SELECT V FROM T2)), (SELECT COUNT(*) FROM T1 WHERE NOT EXISTS (SELECT 1 FROM T2 WHERE T2.V = T1.V)), (SELECT COUNT(*) FROM T1 LEFT JOIN T2 ON T1.V = T2.V WHERE T2.V IS NULL)",
  ox: ["이렇게 생각하면 틀려요: 'NOT IN도 바깥 NULL 행을 통과시킨다'. NULL은 2, 3과 다른지 확인할 수 없어서 NOT IN에서는 빠져요.", "이렇게 생각하면 틀려요: 'NOT EXISTS와 LEFT JOIN도 NULL 행을 버린다'. 이 둘은 '짝이 없음'을 확인하는데, NULL은 짝이 없으니 통과해요.", "이렇게 생각하면 틀려요: 'LEFT JOIN … IS NULL은 NOT IN과 같다'. 이건 NOT EXISTS와 같은 결과를 내서 NULL 행이 남아요.", "정답이에요. NOT IN만 NULL 행을 버려서 2, 3, 3이에요."],
  trap: "'서브쿼리에 NULL이 없으면 NOT IN = NOT EXISTS'도 완전히 맞지는 않아요. 바깥 컬럼에 NULL이 있으면 NOT IN만 그 행을 버려요.",
  memo: "바깥이 NULL: NOT IN은 버림 / NOT EXISTS·LEFT JOIN IS NULL은 남김"
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
  sum: "> ALL은 '모든 값보다 큰가?'를 전부 확인해야 해서, NULL과의 비교 하나가 '모름'이면 통과할 수 없어요. > ANY는 '하나라도 큰가?'라서 확실히 큰 값이 하나만 있어도 통과해요.",
  why: "> ALL (목록)은 '목록의 모든 값보다 크다'예요. 하나하나 비교한 결과를 AND로 묶어서, 전부 참이어야 통과해요. > ANY는 '하나라도 크다'예요. OR로 묶어서 하나만 참이어도 통과해요. <> ALL은 '모든 값과 다르다'라서 NOT IN과 같은 뜻이에요.\n\nS의 값은 10, 20, NULL이에요. 'V > NULL?'은 늘 '모름'이에요. AND에서는 모름이 하나라도 있으면 확실한 참이 될 수 없고, OR에서는 확실한 참이 하나 있으면 모름이 섞여도 참이에요.\n\n(가) > ALL: 25는 10보다 크고(참), 20보다 크고(참), NULL과는 모름이라 전체가 모름이에요. 35도 마찬가지예요. 5, 15는 20보다 작아서 거짓이에요. 그래서 0건이에요.\n\n(나) > ANY: 15는 10보다 커서 바로 참이에요. 25, 35도 참이에요. 5는 참이 하나도 없어서 빠지고, T1의 NULL 행도 빠져요. 3건이에요. (다) <> ALL은 NOT IN처럼 'V <> NULL'이 늘 모름이라 0건이에요. **NULL이 섞이면 ALL(전부 확인)은 통과가 불가능하지만, ANY(하나만 확인)는 통과할 수 있어요.** 정답은 0, 3, 0이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- 서브쿼리 결과: {10, 20, NULL}\nSELECT COUNT(*) FROM T1 WHERE V > ALL (SELECT V FROM S);  -- V>10 AND V>20 AND V>NULL → 참 불가 → 0\nSELECT COUNT(*) FROM T1 WHERE V > ANY (SELECT V FROM S);  -- V>10 OR V>20 OR V>NULL → 15, 25, 35 → 3\nSELECT COUNT(*) FROM T1 WHERE V <> ALL (SELECT V FROM S); -- = NOT IN → V<>NULL 때문에 → 0" },
    { t: "1단계: 연산자 풀어 쓰기", tb: { c: ["식", "풀이"], r: [["V > ALL (10, 20, NULL)", "V>10 AND V>20 AND V>NULL"], ["V > ANY (10, 20, NULL)", "V>10 OR V>20 OR V>NULL"], ["V <> ALL (10, 20, NULL)", "V<>10 AND V<>20 AND V<>NULL (= NOT IN)"]] } },
    { t: "2단계: 행마다 결과 (참·거짓·모름)", tb: { c: ["T1.V", "> ALL", "> ANY", "<> ALL"], r: [[5, "거짓 (FALSE)", "모름 (UNKNOWN)", "모름 (UNKNOWN)"], [15, "거짓 (FALSE)", "참 (TRUE)", "모름 (UNKNOWN)"], [25, "모름 (UNKNOWN)", "참 (TRUE)", "모름 (UNKNOWN)"], [35, "모름 (UNKNOWN)", "참 (TRUE)", "모름 (UNKNOWN)"], [null, "모름 (UNKNOWN)", "모름 (UNKNOWN)", "모름 (UNKNOWN)"]] }, n: "(가) 0, (나) 3, (다) 0" },
    { t: "의도대로 쓰려면: 서브쿼리에서 NULL을 빼고 비교하기", n: "SELECT COUNT(*) FROM T1\n WHERE V > ALL (SELECT V FROM S WHERE V IS NOT NULL);   -- 25, 35 → 2\nSELECT COUNT(*) FROM T1\n WHERE V <> ALL (SELECT V FROM S WHERE V IS NOT NULL);  -- 5, 15, 25, 35 → 4\nSELECT COUNT(*) FROM T1\n WHERE V > (SELECT MAX(V) FROM S);                      -- MAX는 NULL을 무시 → 2" }
  ],
  res: { c: ["가", "나", "다"], r: [[0, 3, 0]] },
  pg: "SELECT (SELECT COUNT(*) FROM T1 WHERE V > ALL (SELECT V FROM S)), (SELECT COUNT(*) FROM T1 WHERE V > ANY (SELECT V FROM S)), (SELECT COUNT(*) FROM T1 WHERE V <> ALL (SELECT V FROM S))",
  ox: ["이렇게 생각하면 틀려요: '서브쿼리의 NULL은 무시된다'. 그러면 > ALL 2건, <> ALL 4건이지만, NULL과의 비교가 '모름'이라 ALL은 통과할 수 없어요.", "이렇게 생각하면 틀려요: 'NULL이 섞이면 ANY까지 다 0건'. ANY는 확실히 큰 값이 하나만 있어도 통과해서 3건이에요.", "정답이에요. ALL 계열은 NULL 때문에 0건, ANY는 3건이에요.", "이렇게 생각하면 틀려요: '> ALL에서만 NULL이 무시된다'. > ALL도 '전부 확인'이라 NULL이 있으면 통과할 수 없어요."],
  trap: "> ALL을 '최댓값보다 크면 된다'로 외우면 틀려요. > (SELECT MAX(V) …)는 MAX가 NULL을 무시해서 25, 35가 나오지만, > ALL은 NULL이 있으면 0건이에요. NULL이 있을 때 둘은 달라요.",
  memo: "ALL = 전부 확인 → NULL 있으면 0건 / ANY = 하나만 참이면 통과"
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
  sum: "서브쿼리 결과가 텅 비면 ALL은 '어긋나는 값이 하나도 없으니' 늘 참, ANY는 '맞는 값이 하나도 없으니' 늘 거짓이에요. 비교 자체를 안 하니 V가 NULL인 행도 ALL·NOT IN을 통과해요. 반면 MAX는 빈 결과에서 NULL을 돌려줘서 0건이에요.",
  why: "서브쿼리가 0행(빈 결과)을 돌려줄 때의 규칙이 있어요. > ALL (빈 결과)는 늘 참이에요. '모든 값보다 크다'에 어긋나는 값이 하나도 없으니까요. > ANY (빈 결과)는 늘 거짓이에요. '보다 큰 값'이 하나도 없으니까요. NOT IN (빈 결과)도 늘 참이에요.\n\n이때는 비교할 값이 없어서 비교 자체를 하지 않아요. 그래서 바깥 V가 NULL이어도 '모름'이 생길 일이 없어요.\n\n이 문제에서 S에는 V > 100인 값이 없어서 (가)~(다)의 서브쿼리는 빈 결과예요. (가) > ALL은 10, 20, NULL 세 행 모두 참이라 3건이에요. (나) > ANY는 모두 거짓이라 0건이에요. (다) NOT IN은 세 행 모두 참이라 3건이에요.\n\n(라)는 달라요. GROUP BY 없는 MAX는 대상이 없어도 1행을 돌려주고, 그 값이 NULL이에요. 그래서 'V > NULL?'이 되어 모든 행이 모름이고 0건이에요. **빈 결과와 'NULL 한 개'는 달라요. ALL은 빈 결과면 늘 참이지만, MAX는 빈 결과에서 NULL을 만들어 비교를 막아요.** 정답은 3, 0, 3, 0이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- 서브쿼리 SELECT V FROM S WHERE V > 100 → 빈 결과(0행)\nSELECT COUNT(*) FROM T1 WHERE V > ALL (…);    -- 빈 결과 → 늘 참 (NULL 행도) → 3\nSELECT COUNT(*) FROM T1 WHERE V > ANY (…);    -- 빈 결과 → 늘 거짓 → 0\nSELECT COUNT(*) FROM T1 WHERE V NOT IN (…);   -- 빈 결과 → 늘 참 (NULL 행도) → 3\nSELECT COUNT(*) FROM T1\n WHERE V > (SELECT MAX(V) FROM S WHERE V > 100); -- MAX → 1행 NULL → V > NULL은 모름 → 0" },
    { t: "1단계: 서브쿼리 결과", tb: { c: ["서브쿼리", "결과"], r: [["SELECT V … WHERE V > 100", "공집합 (0행)"], ["SELECT MAX(V) … WHERE V > 100", "NULL (1행)"]] } },
    { t: "2단계: 행마다 판정 (참·거짓·모름)", tb: { c: ["T1.V", "> ALL(∅)", "> ANY(∅)", "NOT IN(∅)", "> NULL"], r: [[10, "참 (TRUE)", "거짓 (FALSE)", "참 (TRUE)", "모름 (UNKNOWN)"], [20, "참 (TRUE)", "거짓 (FALSE)", "참 (TRUE)", "모름 (UNKNOWN)"], [null, "참 (TRUE)", "거짓 (FALSE)", "참 (TRUE)", "모름 (UNKNOWN)"]], hl: [2] } }
  ],
  res: { c: ["가", "나", "다", "라"], r: [[3, 0, 3, 0]] },
  pg: "SELECT (SELECT COUNT(*) FROM T1 WHERE V > ALL (SELECT V FROM S WHERE V > 100)), (SELECT COUNT(*) FROM T1 WHERE V > ANY (SELECT V FROM S WHERE V > 100)), (SELECT COUNT(*) FROM T1 WHERE V NOT IN (SELECT V FROM S WHERE V > 100)), (SELECT COUNT(*) FROM T1 WHERE V > (SELECT MAX(V) FROM S WHERE V > 100))",
  ox: ["이렇게 생각하면 틀려요: 'V가 NULL인 행은 비교가 모름이라 빠진다'. 서브쿼리가 비어 있으면 비교 자체를 하지 않아서 NULL 행도 참이에요.", "정답이에요. 3, 0, 3, 0이에요.", "이렇게 생각하면 틀려요: '빈 결과와 비교하면 전부 거짓'. ALL과 NOT IN은 빈 결과면 늘 참이에요.", "이렇게 생각하면 틀려요: '> ALL과 > (SELECT MAX…)는 같다'. MAX는 빈 결과에서 NULL을 돌려줘서 비교가 모름이 되고 0건이에요."],
  trap: "ALL(빈 결과) = 참, ANY(빈 결과) = 거짓, NOT IN(빈 결과) = 참이에요. 바깥 값이 NULL이어도 마찬가지예요.",
  memo: "빈 결과: ALL·NOT IN → 다 통과(NULL 포함) / ANY·IN → 0건 / MAX(빈 결과) = NULL"
},
{
  id: "S154", s: 2, tp: "sub", lv: 3, kill: true, sub: "서브쿼리",
  th: "2과목 | 연관 서브쿼리를 행마다 계산하기 (NULL 부서·NULL 급여)",
  q: "'같은 부서에서 나보다 급여가 높은 사람이 없는 사원'을 찾으려고 다음 SQL을 실행하였다. 출력되는 ENO를 모두 고른 것은?",
  tb: [{ n: "EMP", c: ["ENO", "DEPT", "SAL"], r: [[1, 10, 300], [2, 10, 200], [3, 10, 300], [4, 20, 100], [5, 20, null], [6, null, 500], [7, null, 400]] }],
  sql: "SELECT ENO\n  FROM EMP E\n WHERE (SELECT COUNT(*)\n          FROM EMP X\n         WHERE X.DEPT = E.DEPT\n           AND X.SAL  > E.SAL) = 0\n ORDER BY ENO;",
  o: ["1, 3, 4, 6", "1, 3, 4", "1, 3, 4, 6, 7", "1, 3, 4, 5, 6, 7"],
  a: 3,
  sum: "서브쿼리의 X.DEPT = E.DEPT는 NULL끼리 '같다'고 보지 않아서, 부서가 NULL인 6, 7번은 비교 상대가 아무도 없어 둘 다 나와요. SAL이 NULL인 5번도 'X.SAL > NULL'이 늘 모름이라 COUNT가 0이 되어 나와요.",
  why: "연관 서브쿼리는 바깥 행마다 E.DEPT, E.SAL 값을 넣어서 서브쿼리를 다시 실행해요. COUNT(*)는 조건에 맞는 행이 없으면 0을 돌려줘요. 그래서 '= 0'은 '조건에 맞는 사람이 한 명도 없다'는 뜻이에요.\n\n주의할 점은 서브쿼리의 조건도 보통 비교라는 거예요. X.DEPT = NULL, X.SAL > NULL은 늘 '모름'이라 어떤 행도 조건에 맞지 않아요.\n\n행마다 볼게요. 1번(10, 300)은 10번 부서에 300보다 큰 사람이 없어 0이라 나와요. 2번(10, 200)은 300인 1, 3번이 있어서 2라 빠져요. 3번은 1번과 같아서 나와요. 4번(20, 100)은 같은 부서 5번의 SAL이 NULL이라 비교가 모름이고, 0이라 나와요.\n\n5번(20, NULL)은 'X.SAL > NULL'이 늘 모름이라 0이 되어 나와요. 6번(NULL, 500)과 7번(NULL, 400)은 'X.DEPT = NULL'이 늘 모름이라 같은 부서 사람이 아무도 없는 셈이에요. 그래서 400인 7번도 500인 6번과 비교되지 않고 둘 다 나와요. **GROUP BY와 달리 = 비교는 NULL끼리 같다고 보지 않아요.** 결과는 1, 3, 4, 5, 6, 7이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT ENO                            -- ④ 남은 사원 번호\n  FROM EMP E                          -- ① 바깥 7행을 하나씩 꺼내요\n WHERE (SELECT COUNT(*)               -- ③ 조건에 맞는 사람 수 (없으면 0)\n          FROM EMP X\n         WHERE X.DEPT = E.DEPT        -- ② 같은 부서? E.DEPT가 NULL이면 늘 모름 → 아무도 없음\n           AND X.SAL  > E.SAL) = 0    -- ② 나보다 많이? E.SAL이 NULL이면 늘 모름 → 아무도 없음\n ORDER BY ENO;                        -- ⑤ 1, 3, 4, 5, 6, 7" },
    { t: "1단계: 행마다 서브쿼리 실행", tb: { c: ["ENO", "DEPT", "SAL", "비교 대상", "COUNT(*)"], r: [[1, 10, 300, "10번 중 SAL > 300: 없음", 0], [2, 10, 200, "1, 3번 (300)", 2], [3, 10, 300, "없음", 0], [4, 20, 100, "5번은 SAL NULL → 모름", 0], [5, 20, null, "SAL > NULL → 항상 모름", 0], [6, null, 500, "DEPT = NULL → 대상 없음", 0], [7, null, 400, "DEPT = NULL → 대상 없음", 0]], hl: [4, 5, 6] } },
    { t: "2단계: COUNT = 0인 행", tb: { c: ["ENO"], r: [[1], [3], [4], [5], [6], [7]] } },
    { t: "의도대로 쓰려면: NULL 부서도 한 부서로 보고, 급여 없는 사원은 빼기", n: "SELECT ENO\n  FROM EMP E\n WHERE E.SAL IS NOT NULL\n   AND (SELECT COUNT(*)\n          FROM EMP X\n         WHERE (X.DEPT = E.DEPT OR (X.DEPT IS NULL AND E.DEPT IS NULL))\n           AND X.SAL > E.SAL) = 0\n ORDER BY ENO;   -- 1, 3, 4, 6 (7번은 6번보다 적어서 빠짐)" }
  ],
  res: { c: ["ENO"], r: [[1], [3], [4], [5], [6], [7]] },
  pg: "SELECT ENO FROM EMP E WHERE (SELECT COUNT(*) FROM EMP X WHERE X.DEPT = E.DEPT AND X.SAL > E.SAL) = 0 ORDER BY ENO",
  ox: ["이렇게 생각하면 틀려요: '부서가 NULL인 6, 7번은 한 부서로 묶이고, 급여가 NULL인 5번은 빠진다'. 그건 위의 '의도대로' SQL의 결과예요. 원래 SQL의 = 비교는 NULL끼리 같다고 보지 않아요.", "이렇게 생각하면 틀려요: 'NULL이 있는 행은 다 빠진다'. 비교 상대가 없으면 COUNT(*)가 0이라 '= 0'을 만족해서 나와요.", "이렇게 생각하면 틀려요: '5번(SAL NULL)만 빠진다'. 5번도 비교할 상대가 없어서 COUNT가 0이고, 그래서 나와요.", "정답이에요. 2번만 빠지고 1, 3, 4, 5, 6, 7이 나와요."],
  trap: "GROUP BY는 NULL끼리 한 그룹으로 묶지만, 연관 서브쿼리의 X.DEPT = E.DEPT는 NULL끼리 같다고 보지 않아요. 같은 '부서 NULL'이라도 서로 비교되지 않아요.",
  memo: "서브쿼리의 = 비교는 NULL끼리 안 맞음 / 대상이 없으면 COUNT(*) = 0"
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
  o: ["10(2, 100), 20(1, NULL)", "10(2, 100), 20(1, 0), 30(0, 0)", "10(2, 100), 20(1, NULL), 30(0, NULL)", "10(1, 100), 20(0, NULL), 30(0, NULL)"],
  a: 2,
  sum: "SELECT 절의 스칼라 서브쿼리는 바깥 행을 지우지 않아서 부서 3개가 다 나와요. 대상이 없으면 COUNT는 0, SUM은 NULL이에요. 20번 부서는 SAL이 NULL뿐이라 SUM도 NULL이에요.",
  why: "SELECT 절에 넣은 서브쿼리(스칼라 서브쿼리)는 '값 하나'를 계산해서 그 칸을 채우는 역할이에요. 바깥 행을 걸러 내지 않아요. 결과가 없으면 그 칸만 NULL이 되고 행은 남아요.\n\n이 문제의 서브쿼리는 GROUP BY 없는 COUNT·SUM이라 늘 1행을 돌려줘요. 대상 행이 없을 때 COUNT는 0이고, SUM은 더할 값이 없어서 NULL이에요.\n\n부서마다 볼게요. 10번은 사원 1, 2번이 대상이에요. COUNT(*)는 행 수라 2이고, SUM(SAL)은 NULL을 건너뛰어 100이에요. 20번은 사원 3번 하나라 COUNT는 1이에요. 하지만 SAL이 NULL뿐이라 SUM은 NULL이에요. 30번은 사원이 없어 COUNT 0, SUM NULL이에요.\n\n**스칼라 서브쿼리는 바깥 행 수를 그대로 유지하고, 값이 없으면 NULL로 채워요.** 정답은 10(2, 100), 20(1, NULL), 30(0, NULL)이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT D.DNO,                                                -- ① 부서 3행을 하나씩 꺼내요\n       (SELECT COUNT(*)   FROM EMP E WHERE E.DNO = D.DNO) AS CNT, -- ② 그 부서 사원 수 (없으면 0)\n       (SELECT SUM(E.SAL) FROM EMP E WHERE E.DNO = D.DNO) AS TOT  -- ② 그 부서 급여 합 (더할 값 없으면 NULL)\n  FROM DEPT D\n ORDER BY D.DNO;                                              -- ③ 3행 그대로 (행이 줄지 않음)" },
    { t: "1단계: 부서별 서브쿼리 대상 행", tb: { c: ["DNO", "대상 EMP 행", "SAL 값"], r: [[10, "1, 2", "100, NULL"], [20, "3", "NULL"], [30, "없음", "-"]] } },
    { t: "2단계: 결과", tb: { c: ["DNO", "CNT", "TOT"], r: [[10, 2, 100], [20, 1, null], [30, 0, null]] } },
    { t: "의도대로 쓰려면: 합계가 없으면 0으로 보이기", n: "SELECT D.DNO,\n       (SELECT COUNT(*) FROM EMP E WHERE E.DNO = D.DNO) AS CNT,\n       NVL((SELECT SUM(E.SAL) FROM EMP E WHERE E.DNO = D.DNO), 0) AS TOT\n  FROM DEPT D\n ORDER BY D.DNO;   -- 10(2, 100), 20(1, 0), 30(0, 0)" }
  ],
  res: { c: ["DNO", "CNT", "TOT"], r: [[10, 2, 100], [20, 1, null], [30, 0, null]] },
  pg: "SELECT D.DNO, (SELECT COUNT(*) FROM EMP E WHERE E.DNO = D.DNO) AS CNT, (SELECT SUM(E.SAL) FROM EMP E WHERE E.DNO = D.DNO) AS TOT FROM DEPT D ORDER BY D.DNO",
  ox: ["이렇게 생각하면 틀려요: '서브쿼리 결과가 없으면 바깥 행도 사라진다'. 스칼라 서브쿼리는 바깥 행을 지우지 않고 칸만 채워요.", "이렇게 생각하면 틀려요: 'SUM도 대상이 없거나 전부 NULL이면 0'. SUM은 더할 값이 없으면 NULL이에요. 0을 원하면 NVL로 감싸야 해요.", "정답이에요. 부서 3개가 다 나오고, COUNT는 0, SUM은 NULL로 채워져요.", "이렇게 생각하면 틀려요: 'COUNT(*)는 SAL이 NULL인 행은 세지 않는다'. COUNT(*)는 값과 상관없이 행을 세요."],
  trap: "스칼라 서브쿼리는 '없으면 NULL'이라 결과 행 수가 바깥 테이블 행 수와 늘 같아요. 반대로 2행 이상을 돌려주면 오류(ORA-01427)가 나요.",
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
  o: ["2, 2, 2, 2", "5, 5, 5, 0", "2, 5, 2, 2", "2, 5, 2, 0"],
  a: 3,
  sum: "IN과 EXISTS는 '짝이 하나라도 있나?'만 봐서 고객 1, 2를 한 번씩만 세요. JOIN은 주문마다 행을 만들어 2 + 3 = 5건이에요. NOT IN은 ORD에 CID가 NULL인 주문이 있어서 0건이에요.",
  why: "IN과 EXISTS는 바깥 행마다 '서브쿼리에 짝이 하나라도 있는가?'만 확인해요. 짝이 몇 개든 바깥 행은 한 번만 나와요. 이런 방식을 세미 조인이라고 해요. 반면 JOIN은 짝마다 행을 하나씩 만들어서 짝이 여러 개면 바깥 행이 복제돼요.\n\n고객마다 볼게요. 고객 1은 주문 2건, 고객 2는 주문 3건, 고객 3, 4는 주문이 없어요. (가) IN과 (다) EXISTS는 짝이 있는 고객 1, 2만 한 번씩이라 2건이에요. (나) JOIN은 고객 1이 2행, 고객 2가 3행이라 5건이에요.\n\n(라) NOT IN의 서브쿼리 결과는 1, 1, 2, 2, 2, NULL이에요. 6번 주문의 CID가 NULL이에요. 고객 3은 'CID <> NULL?'이 모름이라 확인이 안 되어 빠지고, 고객 4도 마찬가지예요. 고객 1, 2는 원래 걸리는 값이에요. 그래서 0건이에요.\n\n**IN·EXISTS는 바깥 행을 복제하지 않고, JOIN은 짝 수만큼 복제해요.** 정답은 2, 5, 2, 0이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT COUNT(*) FROM CUST WHERE CID IN (SELECT CID FROM ORD);     -- 짝이 있나? → 1, 2 → 2\nSELECT COUNT(*) FROM CUST C JOIN ORD O ON O.CID = C.CID;          -- 짝마다 1행 → 2 + 3 → 5\nSELECT COUNT(*) FROM CUST C\n WHERE EXISTS (SELECT 1 FROM ORD O WHERE O.CID = C.CID);          -- 짝이 있나? → 2\nSELECT COUNT(*) FROM CUST WHERE CID NOT IN (SELECT CID FROM ORD); -- 목록에 NULL → 0" },
    { t: "1단계: 고객별 주문 수", tb: { c: ["CID", "주문 수", "IN / EXISTS", "JOIN 행", "NOT IN"], r: [[1, 2, "참 (TRUE)", 2, "거짓 (FALSE)"], [2, 3, "참 (TRUE)", 3, "거짓 (FALSE)"], [3, 0, "거짓 (FALSE)", 0, "모름 (UNKNOWN)"], [4, 0, "거짓 (FALSE)", 0, "모름 (UNKNOWN)"]] }, n: "ORD에 CID가 NULL인 행이 있어서 고객 3, 4의 NOT IN은 '모름'이에요." },
    { t: "2단계: 건수", tb: { c: ["(가)", "(나)", "(다)", "(라)"], r: [[2, 5, 2, 0]] } },
    { t: "의도대로 쓰려면: JOIN으로 고객 수 세기 / 주문 없는 고객 찾기", n: "SELECT COUNT(DISTINCT C.CID)\n  FROM CUST C JOIN ORD O ON O.CID = C.CID;     -- 2 (복제된 고객을 한 번씩만)\nSELECT COUNT(*) FROM CUST C\n WHERE NOT EXISTS (SELECT 1 FROM ORD O\n                    WHERE O.CID = C.CID);       -- 고객 3, 4 → 2\n-- NOT IN이라면 서브쿼리에 WHERE CID IS NOT NULL을 붙여요 → 2" }
  ],
  res: { c: ["가", "나", "다", "라"], r: [[2, 5, 2, 0]] },
  pg: "SELECT (SELECT COUNT(*) FROM CUST WHERE CID IN (SELECT CID FROM ORD)), (SELECT COUNT(*) FROM CUST C JOIN ORD O ON O.CID = C.CID), (SELECT COUNT(*) FROM CUST C WHERE EXISTS (SELECT 1 FROM ORD O WHERE O.CID = C.CID)), (SELECT COUNT(*) FROM CUST WHERE CID NOT IN (SELECT CID FROM ORD))",
  ox: ["이렇게 생각하면 틀려요: 'JOIN도 중복을 없애고, NOT IN도 NULL을 무시한다'. JOIN은 주문마다 행을 만들어 5건이고, NOT IN은 0건이에요.", "이렇게 생각하면 틀려요: 'IN과 EXISTS도 짝 수만큼 바깥 행을 복제한다'. 이 둘은 짝이 있는지만 봐서 고객을 한 번씩만 세요.", "이렇게 생각하면 틀려요: 'NOT IN은 NULL을 무시하고 고객 3, 4를 돌려준다'. 목록에 NULL이 있으면 확인이 안 되어 0건이에요.", "정답이에요. 2, 5, 2, 0이에요."],
  trap: "IN 서브쿼리를 JOIN으로 바꿔 쓰면 자식 쪽 키가 중복될 때 건수가 달라져요. 반대로 IN은 중복을 걱정할 필요가 없어요.",
  memo: "IN·EXISTS = 짝 있나만 확인(복제 없음) / JOIN = 짝마다 1행"
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
  sum: "UNION은 두 결과를 합친 뒤 '전체'에서 중복을 지워요. 그래서 한쪽 안에 있던 1, 1도 하나가 되고, NULL, NULL도 같은 값으로 보고 하나만 남겨요.",
  why: "UNION은 두 SELECT 결과를 이어 붙인 다음, 전체에서 똑같은 행을 하나만 남겨요. '두 입력에 공통인 값'만 지우는 게 아니라, 한 입력 안에 있던 중복도 지워요. UNION ALL은 아무것도 지우지 않고 그냥 이어 붙여요.\n\n그리고 중복을 지울 때는 NULL끼리 '같은 값'으로 봐요. WHERE의 = 비교와 달리, 중복 제거는 '똑같이 생겼나?'만 보기 때문이에요.\n\n(가) T1 UNION T2: 1, 1, 2, NULL, NULL, 3을 합친 뒤 중복을 지우면 1, 2, NULL, 3이라 4건이에요. (나) UNION ALL은 5 + 1 = 6건 그대로예요.\n\n(다) T1 UNION T1: 같은 테이블을 두 번 이어 붙여 10행이 되지만, 중복을 지우면 1, 2, NULL만 남아 3건이에요. **UNION은 결과 전체에 DISTINCT를 거는 것과 같아요.** 정답은 4, 6, 3이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT C FROM T1 UNION     SELECT C FROM T2; -- 이어 붙이기(6행) → 전체 중복 제거 → 1, 2, NULL, 3 → 4\nSELECT C FROM T1 UNION ALL SELECT C FROM T2; -- 이어 붙이기만 → 6\nSELECT C FROM T1 UNION     SELECT C FROM T1; -- 10행 → 중복 제거 → 1, 2, NULL → 3" },
    { t: "1단계: 합친 결과", tb: { c: ["SQL", "합친 값", "중복 제거 후"], r: [["(가) T1 UNION T2", "1, 1, 2, NULL, NULL, 3", "1, 2, 3, NULL"], ["(나) T1 UNION ALL T2", "1, 1, 2, NULL, NULL, 3", "(제거 없음)"], ["(다) T1 UNION T1", "1, 1, 2, NULL, NULL, 1, 1, 2, NULL, NULL", "1, 2, NULL"]] } },
    { t: "2단계: 건수", tb: { c: ["(가)", "(나)", "(다)"], r: [[4, 6, 3]] } }
  ],
  res: { c: ["가", "나", "다"], r: [[4, 6, 3]] },
  pg: "SELECT (SELECT COUNT(*) FROM (SELECT C FROM T1 UNION SELECT C FROM T2) x), (SELECT COUNT(*) FROM (SELECT C FROM T1 UNION ALL SELECT C FROM T2) x), (SELECT COUNT(*) FROM (SELECT C FROM T1 UNION SELECT C FROM T1) x)",
  ox: ["이렇게 생각하면 틀려요: 'UNION은 두 입력에 공통인 값만 한 번 지운다'. 그러면 (가) 6, (다) 5가 되지만, UNION은 한 입력 안의 중복까지 전부 지워요.", "정답이에요. 4, 6, 3이에요.", "이렇게 생각하면 틀려요: 'NULL끼리는 같지 않으니 NULL이 2개 남는다'. 중복을 지울 때는 NULL끼리 같은 값으로 봐요.", "이렇게 생각하면 틀려요: 'UNION은 NULL을 지운다'. NULL도 한 행으로 남아요."],
  trap: "SELECT DISTINCT 없이 'T1 UNION T1'만으로도 T1의 중복이 지워져요. UNION은 결과 전체에 DISTINCT를 거는 것과 같아요.",
  memo: "UNION = 합친 뒤 전체 중복 제거 / 중복 제거에서는 NULL = NULL"
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
  sum: "INTERSECT와 MINUS도 결과에서 중복을 지우고, NULL끼리는 같은 값으로 봐요. T1 {1, 2, 3, NULL}, T2 {1, 4, NULL}로 계산하면 교집합 {1, NULL}, T1 - T2 {2, 3}, T2 - T1 {4}예요.",
  why: "INTERSECT(교집합)와 MINUS(차집합)는 각 입력을 '서로 다른 값의 집합'으로 보고 계산해요. 결과에서도 중복을 지워요.\n\n그리고 집합 연산은 NULL끼리 같은 값으로 봐요. 행이 '똑같이 생겼나?'를 볼 뿐, 값의 크기를 비교하는 게 아니기 때문이에요. WHERE의 = 비교에서 NULL = NULL이 모름인 것과 달라요.\n\nT1을 중복 없이 보면 {1, 2, 3, NULL}, T2는 {1, 4, NULL}이에요. (가) 둘 다 있는 값은 1과 NULL이라 2건이에요. (나) T1에만 있는 값은 2, 3이라 2건이에요. NULL은 T2에도 있어서 빠져요. (다) T2에만 있는 값은 4라 1건이에요.\n\n**같은 NULL이라도 WHERE·조인의 = 비교에서는 모름이지만, 집합 연산·DISTINCT·GROUP BY에서는 같은 값이에요.** 정답은 2, 2, 1이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- T1 → {1, 2, 3, NULL},  T2 → {1, 4, NULL}  (NULL끼리 같은 값)\nSELECT C FROM T1 INTERSECT SELECT C FROM T2;  -- 둘 다 있는 값 → 1, NULL → 2\nSELECT C FROM T1 MINUS     SELECT C FROM T2;  -- T1에만 있는 값 → 2, 3 → 2\nSELECT C FROM T2 MINUS     SELECT C FROM T1;  -- T2에만 있는 값 → 4 → 1" },
    { t: "1단계: 각 입력을 중복 없이 보기", tb: { c: ["테이블", "값 집합"], r: [["T1", "{1, 2, 3, NULL}"], ["T2", "{1, 4, NULL}"]] } },
    { t: "2단계: 집합 연산", tb: { c: ["SQL", "결과", "건수"], r: [["(가) INTERSECT", "1, NULL", 2], ["(나) T1 MINUS T2", "2, 3", 2], ["(다) T2 MINUS T1", "4", 1]] } }
  ],
  res: { c: ["가", "나", "다"], r: [[2, 2, 1]] },
  pg: "SELECT (SELECT COUNT(*) FROM (SELECT C FROM T1 INTERSECT SELECT C FROM T2) x), (SELECT COUNT(*) FROM (SELECT C FROM T1 EXCEPT SELECT C FROM T2) x), (SELECT COUNT(*) FROM (SELECT C FROM T2 EXCEPT SELECT C FROM T1) x)",
  ox: ["이렇게 생각하면 틀려요: 'NULL끼리는 WHERE처럼 같지 않다'. 그러면 교집합 {1}, T1 - T2 {2, 3, NULL}, T2 - T1 {4, NULL}이 되지만, 집합 연산은 NULL끼리 같은 값으로 봐요.", "이렇게 생각하면 틀려요: '중복을 남기고 개수만큼 빼고 더한다'. 그건 INTERSECT ALL / EXCEPT ALL 방식이고, Oracle의 INTERSECT·MINUS는 중복을 지워요.", "정답이에요. 2, 2, 1이에요.", "이렇게 생각하면 틀려요: 'INTERSECT는 T1의 중복(1, 1)을 그대로 남긴다'. INTERSECT도 결과에서 중복을 지워요."],
  trap: "같은 NULL이라도 WHERE·ON·IN의 = 비교에서는 모름이지만, DISTINCT·GROUP BY·UNION·INTERSECT·MINUS에서는 같은 값이에요.",
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
  sum: "UNION이 중복 (KIM, 300)을 하나로 줄이고, ORDER BY 2 DESC에서 Oracle은 NULL(IT)을 맨 앞에 둬요. 300으로 같은 HR과 KIM은 N 오름차순이라 HR이 먼저예요.",
  why: "집합 연산(UNION 등)에서 ORDER BY는 맨 끝에 한 번만 써요. 정렬은 합친 결과 전체에 대해 하기 때문이에요. 이때 컬럼 이름은 첫 번째 SELECT가 정한 이름(N, SAL)을 쓰고, 위치 번호도 쓸 수 있어요.\n\n먼저 UNION으로 합쳐요. A의 (KIM, 300)이 두 번 있지만 UNION이 하나로 줄여요. 결과는 (KIM, 300), (LEE, 100), (HR, 300), (IT, NULL)의 4행이에요.\n\n다음 ORDER BY 2 DESC로 두 번째 컬럼을 내림차순 정렬해요. Oracle은 정렬에서 NULL을 가장 큰 값처럼 다뤄서 IT(NULL)가 맨 앞이에요. 그다음 300인 HR과 KIM, 마지막에 100인 LEE예요.\n\nHR과 KIM은 300으로 같아서 두 번째 기준 N으로 정렬해요. N에는 DESC가 없으니 오름차순이라 HR, KIM 순서예요. **결과 컬럼 이름은 첫 번째 SELECT가 정하고, 정렬 방향은 기준마다 따로예요.** 정답은 IT HR KIM LEE예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT NAME AS N, SAL FROM A    -- ① 결과 컬럼 이름은 여기서 정해져요: N, SAL\nUNION                           -- ③ 합친 뒤 중복 제거 → (KIM, 300) 하나만\nSELECT DNAME, BUDGET FROM B     -- ② 이름은 무시되고 위치대로 붙어요\n ORDER BY 2 DESC, N;            -- ④ 2번째(SAL) 내림차순 → NULL 맨 앞, 같으면 N 오름차순" },
    { t: "1단계: UNION 결과 (중복 제거)", tb: { c: ["N", "SAL"], r: [["KIM", 300], ["LEE", 100], ["HR", 300], ["IT", null]] } },
    { t: "2단계: ORDER BY 2 DESC, N", tb: { c: ["N", "SAL"], r: [["IT", null], ["HR", 300], ["KIM", 300], ["LEE", 100]] } }
  ],
  res: { c: ["N", "SAL"], r: [["IT", null], ["HR", 300], ["KIM", 300], ["LEE", 100]] },
  pg: "SELECT NAME AS N, SAL FROM A UNION SELECT DNAME, BUDGET FROM B ORDER BY 2 DESC, N",
  ox: ["이렇게 생각하면 틀려요: '내림차순에서 NULL은 맨 뒤'. Oracle은 정렬에서 NULL을 가장 큰 값처럼 다뤄서 DESC에서는 맨 앞이에요.", "이렇게 생각하면 틀려요: 'UNION은 한쪽 안에 있던 중복(KIM, 300)은 남긴다'. UNION은 합친 결과 전체에서 중복을 지워요.", "이렇게 생각하면 틀려요: 'N에도 DESC가 적용된다'. DESC는 2번 기준에만 붙고, N은 오름차순이라 HR이 KIM보다 먼저예요.", "정답이에요. IT HR KIM LEE 순서예요."],
  trap: "ORDER BY에 두 번째 SELECT의 이름(DNAME, BUDGET)을 쓰면 오류예요. 결과 컬럼 이름은 첫 번째 SELECT가 정해요.",
  memo: "집합 연산 ORDER BY: 맨 끝에 한 번, 첫 SELECT의 이름이나 위치 번호"
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
  sum: "Oracle에서는 UNION ALL과 INTERSECT의 우선순위가 같아서 위에서 아래로 차례대로 계산해요. 먼저 A UNION ALL B = 1, 2, 2, 2, 3을 만들고, C와 겹치는 값을 중복 없이 남기면 2, 3이에요.",
  why: "Oracle에서 UNION, UNION ALL, INTERSECT, MINUS는 우선순위가 모두 같아요. 괄호가 없으면 위에서 아래로(왼쪽에서 오른쪽으로) 차례대로 계산해요. 반면 표준 SQL과 PostgreSQL은 INTERSECT를 먼저 계산해서 같은 문장의 결과가 달라요.\n\n그래서 Oracle 공식 문서도 '앞으로 표준에 맞춰 바뀔 수 있으니 섞어 쓸 때는 괄호를 쓰라'고 권해요.\n\nOracle 순서대로 계산해요. 먼저 A UNION ALL B는 중복을 지우지 않고 이어 붙여서 1, 2, 2, 2, 3이에요. 다음 그 결과와 C(2, 3, 4)를 INTERSECT해요. 둘 다 있는 값은 2와 3이에요. INTERSECT는 결과에서 중복을 지우니 2가 한 번만 남아요.\n\n**괄호가 없으면 Oracle은 위에서 아래로 계산해서 (A UNION ALL B) INTERSECT C가 돼요.** 정답은 2, 3이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT X FROM A      -- 1, 2, 2\nUNION ALL            -- ① 위에서부터 먼저 계산 → A + B = 1, 2, 2, 2, 3\nSELECT X FROM B      -- 2, 3\nINTERSECT            -- ② 그 결과와 C에 둘 다 있는 값, 중복 제거 → 2, 3\nSELECT X FROM C      -- 2, 3, 4\n ORDER BY 1;         -- ③ 2, 3" },
    { t: "1단계: A UNION ALL B", tb: { c: ["X"], r: [[1], [2], [2], [2], [3]] } },
    { t: "2단계: (1단계) INTERSECT C", tb: { c: ["X"], r: [[2], [3]] }, n: "INTERSECT는 결과에서 중복도 지워요." },
    { t: "의도대로 쓰려면: 계산 순서를 괄호로 정하기", n: "-- Oracle 순서를 분명히 (결과 2, 3)\n(SELECT X FROM A UNION ALL SELECT X FROM B)\nINTERSECT\nSELECT X FROM C\n ORDER BY 1;\n-- 'B와 C의 교집합을 A에 붙이기'를 원했다면 (결과 1, 2, 2, 2, 3)\nSELECT X FROM A\nUNION ALL\n(SELECT X FROM B INTERSECT SELECT X FROM C)\n ORDER BY 1;" }
  ],
  res: { c: ["X"], r: [[2], [3]] },
  pg: "(SELECT X FROM A UNION ALL SELECT X FROM B) INTERSECT SELECT X FROM C ORDER BY 1",
  ox: ["이렇게 생각하면 틀려요: 'INTERSECT를 먼저 계산한다'. 그건 표준 SQL·PostgreSQL 방식이에요. Oracle은 위에서 아래로 계산해서 결과가 달라요.", "정답이에요. (A UNION ALL B) INTERSECT C = 2, 3이에요.", "이렇게 생각하면 틀려요: '순서는 맞지만 INTERSECT 단계는 빼고 중복만 지운다'. 1은 C에 없어서 교집합에서 빠져요.", "이렇게 생각하면 틀려요: 'INTERSECT는 중복을 남긴다'. INTERSECT는 결과에서 중복을 지워서 2가 한 번만 나와요."],
  trap: "Oracle 공식 문서도 '앞으로 표준에 맞춰 INTERSECT 우선순위가 바뀔 수 있으니 괄호를 쓰라'고 권해요. 시험에서는 Oracle 기준 위→아래 순서로 계산하세요.",
  memo: "Oracle 집합 연산자: 우선순위 같음, 위→아래 / 섞어 쓰면 괄호"
}
);
