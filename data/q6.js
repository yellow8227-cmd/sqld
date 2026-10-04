// 제2과목 · SQL 기본 (E: 관계형 DB 개요·SELECT·함수·WHERE·GROUP BY·ORDER BY·조인·표준 조인·집합 연산자)
// pg: 검증용 PostgreSQL 쿼리 (tools/verify.mjs 가 tb 를 그대로 테이블로 만들고 실행해 res 와 대조한다)
// 오류 여부·문법·Oracle 고유 동작을 묻는 문항은 DB 검증 대신 해설로 근거를 밝힌다.
(window.QB = window.QB || []).push(
{
  id: "S66", s: 2, tp: "basic", lv: 1, sub: "관계형 데이터베이스 개요",
  th: "2과목 | 무결성 제약의 종류",
  q: "관계형 데이터베이스의 무결성(Integrity)에 대한 설명으로 가장 적절하지 않은 것은?",
  o: [
    "개체 무결성: 기본키(PK)를 구성하는 컬럼은 NULL을 가질 수 없고, 값이 중복되어서도 안 된다.",
    "참조 무결성: 외래키(FK)의 값은 NULL이거나, 참조하는 테이블의 기본키 값 중 하나와 같아야 한다.",
    "도메인 무결성: 컬럼의 값은 그 컬럼에 정의된 도메인(데이터 타입, 길이, 허용 범위 등)에 속해야 한다.",
    "참조 무결성: 외래키 컬럼에는 NULL을 넣을 수 없으며, 반드시 부모 테이블에 존재하는 값만 저장할 수 있다."
  ],
  a: 3,
  why: "참조 무결성은 '외래키 값이 있다면 부모 테이블에 존재해야 한다'는 규칙이다. 외래키 컬럼의 NULL은 참조 무결성 위반이 아니다. NULL까지 막으려면 NOT NULL 제약을 따로 걸어야 한다. 반면 기본키는 개체 무결성에 따라 NULL과 중복이 모두 금지된다.",
  st: [
    { t: "무결성 종류 정리", tb: { c: ["종류", "대상", "규칙", "NULL"], r: [
      ["개체 무결성", "기본키", "유일 + NOT NULL", "불가"],
      ["참조 무결성", "외래키", "NULL 또는 부모 키 값", "허용"],
      ["도메인 무결성", "모든 컬럼", "정의된 타입·범위 안의 값", "제약에 따름"]
    ], hl: [1] } }
  ],
  ox: ["옳다. 개체 무결성의 정의다.", "옳다. 참조 무결성의 정확한 정의다.", "옳다. 도메인 무결성의 정의다.", "틀리다. 외래키에는 NOT NULL을 따로 지정하지 않는 한 NULL을 넣을 수 있다."],
  trap: "②와 ④는 같은 '참조 무결성'을 다룬다. 둘 중 NULL 허용 여부가 다른 문장을 찾으면 된다.",
  memo: "PK = NULL·중복 금지 / FK = NULL 허용, 값이 있으면 부모에 존재"
},
{
  id: "S67", s: 2, tp: "basic", lv: 2, sub: "SELECT 문",
  th: "2과목 | 여러 컬럼 DISTINCT와 NULL",
  q: "다음 [T] 테이블에 대해 SQL을 실행한 결과로 옳은 것은?",
  tb: [{ n: "T", c: ["DEPT", "JOB"], r: [[10, "A"], [10, "A"], [10, "B"], [20, "A"], [20, null], [20, null], [null, null]] }],
  sql: "SELECT COUNT(*)\n  FROM (SELECT DISTINCT DEPT, JOB\n          FROM T);",
  o: ["3", "5", "6", "7"],
  a: 1,
  why: "DISTINCT를 여러 컬럼 앞에 쓰면 컬럼 하나하나가 아니라 (DEPT, JOB) 조합 전체를 기준으로 중복을 지운다. DISTINCT와 GROUP BY에서는 NULL끼리 같은 값으로 취급한다. 그래서 (20, NULL) 두 행은 하나로 합쳐지고, (NULL, NULL) 행도 하나의 조합으로 남는다.",
  st: [
    { t: "[원본] T", tb: { c: ["DEPT", "JOB"], r: [[10, "A"], [10, "A"], [10, "B"], [20, "A"], [20, null], [20, null], [null, null]], hl: [1, 5] } },
    { t: "1단계: (DEPT, JOB) 조합별 중복 제거", tb: { c: ["DEPT", "JOB", "원래 행 수"], r: [[10, "A", 2], [10, "B", 1], [20, "A", 1], [20, null, 2], [null, null, 1]] }, n: "조합 5개가 남는다." }
  ],
  res: { c: ["COUNT(*)"], r: [[5]] },
  pg: "SELECT COUNT(*) FROM (SELECT DISTINCT DEPT, JOB FROM T) X",
  ox: ["NULL이 들어 있는 조합을 모두 버린 경우다. DISTINCT는 NULL 행을 지우지 않는다.", "정답.", "(20, NULL) 두 행을 서로 다른 값으로 본 경우다. DISTINCT에서는 NULL끼리 같은 값으로 묶인다.", "중복을 지우지 않은 전체 행 수다. SELECT ALL(기본값)일 때의 결과다."],
  trap: "WHERE 절에서는 NULL = NULL이 UNKNOWN이지만, DISTINCT·GROUP BY·집합 연산자에서는 NULL끼리 같은 값으로 묶는다.",
  memo: "DISTINCT = 컬럼 조합 기준, NULL끼리는 같은 값"
},
{
  id: "S68", s: 2, tp: "basic", lv: 1, sub: "SELECT 문",
  th: "2과목 | 컬럼 별칭(Alias) 작성 규칙",
  q: "다음 중 오류가 발생하는 SQL은? (Oracle 기준)",
  sql: "① SELECT ENAME AS \"Emp Name\" FROM EMP;\n② SELECT ENAME NAME, SAL * 12 ANNUAL FROM EMP;\n③ SELECT ENAME AS 'NAME' FROM EMP;\n④ SELECT SAL * 12 AS \"연봉\" FROM EMP;",
  o: ["①", "②", "③", "④"],
  a: 2,
  why: "Oracle에서 컬럼 별칭은 AS를 붙이거나 생략하고 이름만 써도 된다. 공백·특수문자·한글을 넣거나 대소문자를 그대로 살리려면 큰따옴표(\")로 감싼다. 작은따옴표(')는 문자열 상수를 나타내므로 별칭에 쓸 수 없고 ORA-00923(FROM 키워드가 없습니다) 오류가 난다.",
  st: [
    { t: "별칭 규칙", tb: { c: ["형태", "Oracle", "비고"], r: [
      ["컬럼 AS 별칭", "가능", "대문자로 저장"],
      ["컬럼 별칭 (AS 생략)", "가능", ""],
      ["컬럼 AS \"별 칭\"", "가능", "공백·대소문자 유지"],
      ["컬럼 AS '별칭'", "오류", "작은따옴표는 문자열 상수"]
    ], hl: [3] } }
  ],
  ox: ["공백이 있는 별칭을 큰따옴표로 감쌌으므로 정상이다.", "AS를 생략한 별칭이므로 정상이다.", "정답. 작은따옴표 별칭은 Oracle에서 오류다.", "큰따옴표로 감싼 한글 별칭이므로 정상이다."],
  trap: "SQL Server는 작은따옴표 별칭(AS 'NAME')을 허용한다. SQLD는 Oracle 기준으로 판단한다.",
  memo: "별칭은 큰따옴표, 문자열은 작은따옴표"
},
{
  id: "S69", s: 2, tp: "basic", lv: 1, sub: "SELECT 문",
  th: "2과목 | 산술 연산자 우선순위와 NULL 연산",
  q: "다음 [EMP] 테이블에 대해 SQL을 실행했을 때 V 값을 ENAME 순서대로 나열한 것은?",
  tb: [{ n: "EMP", c: ["ENAME", "SAL", "COMM"], r: [["A", 100, 50], ["B", 200, null], ["C", 300, 0]] }],
  sql: "SELECT ENAME, SAL + COMM * 2 AS V\n  FROM EMP\n ORDER BY ENAME;",
  o: ["200, NULL, 300", "300, NULL, 600", "200, 200, 300", "300, 400, 600"],
  a: 0,
  why: "산술 연산자는 곱셈·나눗셈(*, /)이 덧셈·뺄셈(+, -)보다 먼저 계산된다. 그래서 SAL + (COMM * 2)로 계산한다. 또 NULL이 들어간 산술 연산의 결과는 항상 NULL이다. B는 COMM이 NULL이라 V도 NULL이 된다. 0은 NULL이 아니므로 C는 300 + 0 = 300이다.",
  st: [
    { t: "[원본] EMP", tb: { c: ["ENAME", "SAL", "COMM"], r: [["A", 100, 50], ["B", 200, null], ["C", 300, 0]] } },
    { t: "1단계: COMM * 2 먼저 계산", tb: { c: ["ENAME", "COMM * 2"], r: [["A", 100], ["B", null], ["C", 0]] } },
    { t: "2단계: SAL + (COMM * 2)", tb: { c: ["ENAME", "식", "V"], r: [["A", "100 + 100", 200], ["B", "200 + NULL", null], ["C", "300 + 0", 300]], hl: [1] } }
  ],
  res: { c: ["ENAME", "V"], r: [["A", 200], ["B", null], ["C", 300]] },
  pg: "SELECT ENAME, SAL + COMM * 2 AS V FROM EMP ORDER BY ENAME",
  ox: ["정답.", "왼쪽부터 (SAL + COMM) * 2로 계산한 경우다. 곱셈이 먼저다.", "NULL을 0처럼 보고 B를 200으로 계산한 경우다. NULL과의 산술 연산은 NULL이다.", "계산 순서와 NULL 처리를 모두 잘못 본 경우다."],
  trap: "NULL을 0으로 계산하려면 NVL(COMM, 0)처럼 명시적으로 바꿔야 한다.",
  memo: "* / 먼저, + - 나중 / NULL 산술 = NULL"
},
{
  id: "S70", s: 2, tp: "fn", lv: 3, sub: "함수",
  th: "2과목 | 날짜 함수 ADD_MONTHS · LAST_DAY · MONTHS_BETWEEN",
  q: "다음 SQL의 결과로 옳은 것은? (Oracle 기준)",
  sql: "SELECT TO_CHAR(ADD_MONTHS(DATE '2024-01-31', 1), 'YYYY-MM-DD') AS C1,\n       TO_CHAR(LAST_DAY(DATE '2024-02-10'), 'YYYY-MM-DD')     AS C2,\n       MONTHS_BETWEEN(DATE '2024-03-31', DATE '2024-02-29')  AS C3\n  FROM DUAL;",
  o: ["2024-02-29, 2024-02-29, 1", "2024-03-02, 2024-02-29, 1", "2024-02-29, 2024-02-28, 1", "2024-02-29, 2024-02-29, 1.0645…"],
  a: 0,
  why: "ADD_MONTHS는 n개월 뒤의 같은 날짜를 돌려주되, 그 달에 해당 일자가 없으면 그 달의 마지막 날을 돌려준다. 2024년은 윤년이므로 2월 31일 대신 2월 29일이 된다. LAST_DAY는 그 달의 마지막 날짜를 돌려준다. MONTHS_BETWEEN(d1, d2)는 두 날짜가 같은 일자이거나 둘 다 그 달의 마지막 날이면 정수 개월 수를 돌려준다. 3월 31일과 2월 29일은 둘 다 말일이므로 정확히 1이다.",
  st: [
    { t: "1단계: ADD_MONTHS(DATE '2024-01-31', 1)", n: "2024-02-31은 존재하지 않는다 → 2월의 마지막 날 2024-02-29 (윤년)" },
    { t: "2단계: LAST_DAY(DATE '2024-02-10')", n: "2024년 2월의 마지막 날 → 2024-02-29" },
    { t: "3단계: MONTHS_BETWEEN 규칙", tb: { c: ["경우", "계산"], r: [
      ["두 날짜의 '일'이 같음", "정수 개월 수"],
      ["둘 다 그 달의 말일", "정수 개월 수"],
      ["그 밖의 경우", "개월 수 + (일 차이 ÷ 31)"]
    ], hl: [1] }, n: "3/31과 2/29는 둘 다 말일 → 1" }
  ],
  res: { c: ["C1", "C2", "C3"], r: [["2024-02-29", "2024-02-29", 1]] },
  pg: "WITH D AS (SELECT DATE '2024-03-31' D1, DATE '2024-02-29' D2) SELECT TO_CHAR(DATE '2024-01-31' + INTERVAL '1 month', 'YYYY-MM-DD'), TO_CHAR(DATE_TRUNC('month', DATE '2024-02-10') + INTERVAL '1 month - 1 day', 'YYYY-MM-DD'), CASE WHEN EXTRACT(DAY FROM D1) = EXTRACT(DAY FROM D2) OR (D1 = (DATE_TRUNC('month', D1) + INTERVAL '1 month - 1 day')::date AND D2 = (DATE_TRUNC('month', D2) + INTERVAL '1 month - 1 day')::date) THEN (EXTRACT(YEAR FROM D1) - EXTRACT(YEAR FROM D2)) * 12 + EXTRACT(MONTH FROM D1) - EXTRACT(MONTH FROM D2) ELSE (EXTRACT(YEAR FROM D1) - EXTRACT(YEAR FROM D2)) * 12 + EXTRACT(MONTH FROM D1) - EXTRACT(MONTH FROM D2) + (EXTRACT(DAY FROM D1) - EXTRACT(DAY FROM D2)) / 31 END FROM D",
  ox: ["정답.", "ADD_MONTHS를 '31일 더하기'처럼 넘치는 날짜를 다음 달로 넘긴다고 본 경우다. ADD_MONTHS는 그 달의 말일에서 멈춘다.", "2024년이 윤년임을 놓친 경우다.", "말일 규칙을 모르고 1 + (31 − 29) ÷ 31로 계산한 경우다."],
  trap: "Oracle의 ADD_MONTHS는 원래 날짜가 말일이면 결과도 말일로 맞춘다. 예를 들어 ADD_MONTHS(DATE '2024-02-29', 1)은 3월 29일이 아니라 3월 31일이다.",
  memo: "ADD_MONTHS = 없는 날짜면 말일 / MONTHS_BETWEEN = 같은 일·둘 다 말일이면 정수"
},
{
  id: "S71", s: 2, tp: "fn", lv: 2, sub: "함수",
  th: "2과목 | 문자형 컬럼과 숫자 비교 — 암시적 형변환",
  q: "C 컬럼이 VARCHAR2 타입인 다음 [T] 테이블에 대해 (가), (나) SQL의 결과 건수로 옳은 것은? (Oracle 기준)",
  tb: [{ n: "T", c: ["ID", "C"], r: [[1, "5"], [2, "10"], [3, "90"], [4, "100"], [5, "9"]] }],
  sql: "(가) SELECT COUNT(*) FROM T WHERE C > '9';\n(나) SELECT COUNT(*) FROM T WHERE C > 9;",
  o: ["1, 3", "3, 3", "1, 1", "0, 3"],
  a: 0,
  why: "(가)는 문자와 문자를 비교하므로 사전식(왼쪽 글자부터 한 글자씩) 비교를 한다. '9'보다 큰 문자열은 첫 글자가 '9'이면서 더 긴 '90'뿐이다. (나)는 문자 컬럼과 숫자를 비교하므로 Oracle이 문자 쪽을 숫자로 암시적 형변환(TO_NUMBER(C) > 9)한 뒤 숫자 크기로 비교한다. 10, 90, 100이 9보다 크다.",
  st: [
    { t: "[원본] T", tb: { c: ["ID", "C (문자)"], r: [[1, "5"], [2, "10"], [3, "90"], [4, "100"], [5, "9"]] } },
    { t: "1단계: (가) 문자 비교 C > '9'", tb: { c: ["C", "첫 글자 비교", "결과"], r: [["5", "'5' < '9'", "FALSE"], ["10", "'1' < '9'", "FALSE"], ["90", "'9' = '9', 더 김", "TRUE"], ["100", "'1' < '9'", "FALSE"], ["9", "같음", "FALSE"]], hl: [2] }, n: "1건" },
    { t: "2단계: (나) 숫자 비교 TO_NUMBER(C) > 9", tb: { c: ["TO_NUMBER(C)", "> 9"], r: [[5, "FALSE"], [10, "TRUE"], [90, "TRUE"], [100, "TRUE"], [9, "FALSE"]], hl: [1, 2, 3] }, n: "3건" }
  ],
  res: { c: ["가", "나"], r: [[1, 3]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE C > '9'), (SELECT COUNT(*) FROM T WHERE CAST(C AS numeric) > 9)",
  ox: ["정답.", "(가)도 숫자 크기로 비교한다고 본 경우다. 따옴표로 감싼 '9'는 문자이므로 문자 비교를 한다.", "(나)도 문자 비교를 한다고 본 경우다. 숫자와 비교하면 문자 쪽이 숫자로 바뀐다.", "'90'과 '9'처럼 앞부분이 같으면 같다고 본 경우다. 앞부분이 같으면 더 긴 쪽이 크다."],
  trap: "(나)에서 C에 'ABC' 같은 숫자로 바꿀 수 없는 값이 하나라도 있으면 ORA-01722(수치가 부적합합니다) 오류가 난다. 또 컬럼 쪽이 형변환되므로 C 컬럼의 인덱스를 쓰지 못한다.",
  memo: "문자 vs 숫자 비교 → 문자를 숫자로 변환 / 문자 vs 문자 → 사전식"
},
{
  id: "S72", s: 2, tp: "fn", lv: 2, sub: "함수",
  th: "2과목 | MOD · SIGN과 음수, DECODE",
  q: "다음 SQL의 결과로 옳은 것은?",
  sql: "SELECT MOD(-7, 3)  AS C1,\n       MOD(7, -3)  AS C2,\n       SIGN(-0.5)  AS C3,\n       DECODE(SIGN(MOD(-7, 3)), -1, 'NEG', 0, 'ZERO', 'POS') AS C4\n  FROM DUAL;",
  o: ["-1, 1, -1, NEG", "2, -2, -1, POS", "1, 1, -1, POS", "-1, 1, -0.5, NEG"],
  a: 0,
  why: "Oracle의 MOD(m, n)은 m − n × TRUNC(m ÷ n)으로 계산하므로 나머지의 부호가 나누어지는 수(m)의 부호를 따른다. MOD(-7, 3) = -7 − 3 × (-2) = -1, MOD(7, -3) = 7 − (-3) × (-2) = 1이다. SIGN은 음수면 -1, 0이면 0, 양수면 1을 돌려준다. SIGN(-1) = -1이므로 DECODE는 'NEG'를 돌려준다.",
  st: [
    { t: "1단계: MOD 계산", tb: { c: ["식", "TRUNC(m ÷ n)", "m − n × 몫", "결과"], r: [["MOD(-7, 3)", -2, "-7 − (-6)", -1], ["MOD(7, -3)", -2, "7 − 6", 1]] } },
    { t: "2단계: SIGN · DECODE", tb: { c: ["식", "결과"], r: [["SIGN(-0.5)", -1], ["SIGN(MOD(-7, 3)) = SIGN(-1)", -1], ["DECODE(-1, -1, 'NEG', 0, 'ZERO', 'POS')", "NEG"]] } }
  ],
  res: { c: ["C1", "C2", "C3", "C4"], r: [[-1, 1, -1, "NEG"]] },
  pg: "SELECT MOD(-7, 3), MOD(7, -3), SIGN(-0.5), CASE SIGN(MOD(-7, 3)) WHEN -1 THEN 'NEG' WHEN 0 THEN 'ZERO' ELSE 'POS' END",
  ox: ["정답.", "수학의 나머지처럼 나누는 수(n)의 부호를 따른다고 본 경우다(파이썬의 % 연산과 같다). Oracle MOD는 m의 부호를 따른다.", "부호를 떼고 |m| ÷ |n|의 나머지를 구한다고 본 경우다. 그러면 C4도 SIGN(1) = 1이라 POS가 된다.", "MOD는 맞게 계산했지만 SIGN이 값을 그대로 돌려준다고 본 경우다. SIGN은 -1, 0, 1 중 하나만 돌려준다."],
  trap: "Oracle에는 MOD와 비슷한 REMAINDER 함수도 있다. REMAINDER는 TRUNC 대신 ROUND로 몫을 구해 값이 다를 수 있다. SQLD에서는 MOD만 기억하면 된다.",
  memo: "MOD 부호 = 앞 숫자(m)의 부호 / SIGN = -1, 0, 1"
},
{
  id: "S73", s: 2, tp: "basic", lv: 2, sub: "WHERE 절",
  th: "2과목 | BETWEEN의 경계값 · 범위 순서 · NOT BETWEEN과 NULL",
  q: "다음 [T] 테이블에 대해 (가)~(다) SQL의 결과 건수로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "SAL"], r: [[1, 100], [2, 200], [3, 300], [4, null], [5, 400]] }],
  sql: "(가) SELECT COUNT(*) FROM T WHERE SAL BETWEEN 100 AND 300;\n(나) SELECT COUNT(*) FROM T WHERE SAL BETWEEN 300 AND 100;\n(다) SELECT COUNT(*) FROM T WHERE SAL NOT BETWEEN 100 AND 300;",
  o: ["3, 0, 1", "3, 3, 1", "3, 0, 2", "1, 0, 3"],
  a: 0,
  why: "A BETWEEN x AND y는 A >= x AND A <= y와 같다. 양 끝값을 포함하고, 작은 값을 앞에 써야 한다. (나)는 SAL >= 300 AND SAL <= 100이 되어 만족하는 값이 없다. NOT BETWEEN은 SAL < 100 OR SAL > 300이다. NULL은 어느 비교에서도 UNKNOWN이므로 BETWEEN에도, NOT BETWEEN에도 걸리지 않는다.",
  st: [
    { t: "[원본] T", tb: { c: ["ID", "SAL"], r: [[1, 100], [2, 200], [3, 300], [4, null], [5, 400]] } },
    { t: "1단계: 조건 풀어 쓰기", tb: { c: ["SQL", "풀어 쓴 조건"], r: [["(가)", "SAL >= 100 AND SAL <= 300"], ["(나)", "SAL >= 300 AND SAL <= 100"], ["(다)", "SAL < 100 OR SAL > 300"]] } },
    { t: "2단계: 행별 판정", tb: { c: ["SAL", "(가)", "(나)", "(다)"], r: [[100, "TRUE", "FALSE", "FALSE"], [200, "TRUE", "FALSE", "FALSE"], [300, "TRUE", "FALSE", "FALSE"], [null, "UNKNOWN", "UNKNOWN", "UNKNOWN"], [400, "FALSE", "FALSE", "TRUE"]], hl: [3] }, n: "(가) 3건, (나) 0건, (다) 1건" }
  ],
  res: { c: ["가", "나", "다"], r: [[3, 0, 1]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE SAL BETWEEN 100 AND 300), (SELECT COUNT(*) FROM T WHERE SAL BETWEEN 300 AND 100), (SELECT COUNT(*) FROM T WHERE SAL NOT BETWEEN 100 AND 300)",
  ox: ["정답.", "BETWEEN이 두 값의 순서와 상관없이 범위를 잡는다고 본 경우다. 작은 값이 앞에 와야 한다.", "NOT BETWEEN이 NULL 행까지 가져온다고 본 경우다. NULL은 UNKNOWN이라 제외된다.", "BETWEEN이 양 끝값(100, 300)을 포함하지 않는다고 본 경우다."],
  trap: "'(가) 건수 + (다) 건수 = 전체 행 수'라고 생각하기 쉽다. NULL 행은 양쪽 모두에서 빠지므로 3 + 1 = 4로 전체 5보다 적다.",
  memo: "BETWEEN = 양 끝 포함, 작은 값 먼저 / NULL은 NOT BETWEEN에도 안 걸림"
},
{
  id: "S74", s: 2, tp: "notin", lv: 3, sub: "WHERE 절",
  th: "2과목 | 부정 비교 연산자와 NULL",
  q: "다음 [T] 테이블에 대해 결과 건수가 나머지 셋과 다른 SQL은? (Oracle 기준)",
  tb: [{ n: "T", c: ["ID", "COL"], r: [[1, "A"], [2, "B"], [3, null], [4, "C"], [5, "A"]] }],
  sql: "① SELECT COUNT(*) FROM T WHERE COL <> 'A';\n② SELECT COUNT(*) FROM T WHERE NOT COL = 'A';\n③ SELECT COUNT(*) FROM T WHERE COL ^= 'A';\n④ SELECT COUNT(*) FROM T WHERE NOT (COL = 'A' AND COL IS NOT NULL);",
  o: ["①", "②", "③", "④"],
  a: 3,
  why: "<>, !=, ^=는 모두 '같지 않다'는 뜻의 같은 연산자다. NOT COL = 'A'도 같은 의미다. 셋 다 NULL 행에서는 UNKNOWN이 되어 제외되므로 B, C 2건이다. ④는 NULL 행에서 COL = 'A'가 UNKNOWN, COL IS NOT NULL이 FALSE이고, UNKNOWN AND FALSE = FALSE이므로 NOT을 붙이면 TRUE가 된다. 따라서 NULL 행까지 포함해 3건이다.",
  st: [
    { t: "[원본] T", tb: { c: ["ID", "COL"], r: [[1, "A"], [2, "B"], [3, null], [4, "C"], [5, "A"]] } },
    { t: "1단계: ①~③ 판정 (COL <> 'A')", tb: { c: ["COL", "COL <> 'A'"], r: [["A", "FALSE"], ["B", "TRUE"], [null, "UNKNOWN"], ["C", "TRUE"], ["A", "FALSE"]], hl: [2] }, n: "2건" },
    { t: "2단계: ④ 판정", tb: { c: ["COL", "COL = 'A'", "IS NOT NULL", "AND", "NOT"], r: [["A", "TRUE", "TRUE", "TRUE", "FALSE"], ["B", "FALSE", "TRUE", "FALSE", "TRUE"], [null, "UNKNOWN", "FALSE", "FALSE", "TRUE"], ["C", "FALSE", "TRUE", "FALSE", "TRUE"], ["A", "TRUE", "TRUE", "TRUE", "FALSE"]], hl: [2] }, n: "3건" }
  ],
  res: { c: ["①", "②", "③", "④"], r: [[2, 2, 2, 3]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE COL <> 'A'), (SELECT COUNT(*) FROM T WHERE NOT COL = 'A'), (SELECT COUNT(*) FROM T WHERE COL != 'A'), (SELECT COUNT(*) FROM T WHERE NOT (COL = 'A' AND COL IS NOT NULL))",
  ox: ["<>는 NULL 행을 UNKNOWN으로 걸러 2건이다.", "NOT COL = 'A'는 COL <> 'A'와 같아 2건이다. NOT UNKNOWN도 UNKNOWN이다.", "^=는 Oracle에서 <>, !=와 같은 '같지 않다' 연산자라 2건이다.", "정답. UNKNOWN AND FALSE = FALSE가 NOT으로 TRUE가 되어 NULL 행이 포함된다."],
  trap: "검증용 PostgreSQL에는 ^= 연산자가 없어 같은 뜻의 !=로 바꿔 실행하였다. 결과는 Oracle과 같다.",
  memo: "<> = != = ^= / UNKNOWN AND FALSE = FALSE"
},
{
  id: "S75", s: 2, tp: "basic", lv: 2, sub: "WHERE 절",
  th: "2과목 | LIKE 패턴의 위치 해석 (_ 와 %)",
  q: "다음 [T] 테이블에 대해 (가)~(다) SQL의 결과 건수로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "NAME"], r: [[1, "A"], [2, "AB"], [3, "BA"], [4, "BAB"], [5, "ABA"], [6, null]] }],
  sql: "(가) SELECT COUNT(*) FROM T WHERE NAME LIKE '_A%';\n(나) SELECT COUNT(*) FROM T WHERE NAME LIKE '%A_';\n(다) SELECT COUNT(*) FROM T WHERE NAME LIKE '%A%';",
  o: ["2, 2, 5", "5, 5, 5", "2, 3, 5", "2, 2, 6"],
  a: 0,
  why: "_는 정확히 한 글자, %는 0글자 이상을 뜻한다. (가) '_A%'는 두 번째 글자가 A인 문자열이다. (나) '%A_'는 끝에서 두 번째 글자가 A인 문자열, 즉 A 뒤에 정확히 한 글자가 붙어 끝나는 문자열이다. (다) '%A%'는 A가 어디든 들어 있는 문자열이다. NULL은 LIKE 비교 결과가 UNKNOWN이라 어느 쪽에도 포함되지 않는다.",
  st: [
    { t: "[원본] T", tb: { c: ["ID", "NAME"], r: [[1, "A"], [2, "AB"], [3, "BA"], [4, "BAB"], [5, "ABA"], [6, null]] } },
    { t: "1단계: 패턴별 판정", tb: { c: ["NAME", "'_A%' (2번째 = A)", "'%A_' (끝에서 2번째 = A)", "'%A%' (A 포함)"], r: [
      ["A", "X", "X", "O"], ["AB", "X", "O", "O"], ["BA", "O", "X", "O"], ["BAB", "O", "O", "O"], ["ABA", "X", "X", "O"], [null, "UNKNOWN", "UNKNOWN", "UNKNOWN"]
    ] }, n: "(가) BA, BAB → 2 / (나) AB, BAB → 2 / (다) 5" }
  ],
  res: { c: ["가", "나", "다"], r: [[2, 2, 5]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE NAME LIKE '_A%'), (SELECT COUNT(*) FROM T WHERE NAME LIKE '%A_'), (SELECT COUNT(*) FROM T WHERE NAME LIKE '%A%')",
  ox: ["정답.", "_를 '0글자 또는 1글자'로 착각한 경우다. 그러면 (가)는 'A%'까지, (나)는 '%A'까지 포함해 둘 다 A가 든 5건이 된다. _는 반드시 한 글자다.", "(나)를 'A 뒤에 한 글자 이상'(%A_%)으로 읽어 ABA까지 센 경우다. '%A_'는 A 뒤에 딱 한 글자로 끝나야 한다.", "NULL 행도 '%A%'에 걸린다고 본 경우다."],
  trap: "ABA는 A로 끝나므로 '%A_'에 걸리지 않는다. 끝에서 두 번째 글자가 B이기 때문이다.",
  memo: "_ = 정확히 1글자, % = 0글자 이상"
},
{
  id: "S76", s: 2, tp: "notin", lv: 1, sub: "WHERE 절",
  th: "2과목 | = NULL과 IS NULL, NVL 조건",
  q: "다음 [T] 테이블에 대해 (가)~(다) SQL의 결과 건수로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "COMM"], r: [[1, 100], [2, null], [3, 0], [4, null], [5, 200]] }],
  sql: "(가) SELECT COUNT(*) FROM T WHERE COMM = NULL;\n(나) SELECT COUNT(*) FROM T WHERE COMM IS NULL;\n(다) SELECT COUNT(*) FROM T WHERE NVL(COMM, 0) = 0;",
  o: ["0, 2, 3", "2, 2, 3", "0, 3, 3", "0, 2, 1"],
  a: 0,
  why: "NULL과 비교 연산자(=, <> 등)를 쓰면 결과는 항상 UNKNOWN이다. WHERE 절은 TRUE인 행만 남기므로 (가)는 0건이다. NULL 여부는 IS NULL로 확인한다. (다)는 NULL을 0으로 바꾼 뒤 비교하므로 원래 0인 행과 NULL인 두 행이 모두 걸린다.",
  st: [
    { t: "[원본] T", tb: { c: ["ID", "COMM"], r: [[1, 100], [2, null], [3, 0], [4, null], [5, 200]] } },
    { t: "1단계: 행별 판정", tb: { c: ["COMM", "COMM = NULL", "COMM IS NULL", "NVL(COMM, 0)", "= 0"], r: [[100, "UNKNOWN", "FALSE", 100, "FALSE"], [null, "UNKNOWN", "TRUE", 0, "TRUE"], [0, "UNKNOWN", "FALSE", 0, "TRUE"], [null, "UNKNOWN", "TRUE", 0, "TRUE"], [200, "UNKNOWN", "FALSE", 200, "FALSE"]], hl: [1, 2, 3] }, n: "(가) 0건, (나) 2건, (다) 3건" }
  ],
  res: { c: ["가", "나", "다"], r: [[0, 2, 3]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE COMM = NULL), (SELECT COUNT(*) FROM T WHERE COMM IS NULL), (SELECT COUNT(*) FROM T WHERE COALESCE(COMM, 0) = 0)",
  ox: ["정답.", "= NULL이 IS NULL처럼 동작한다고 본 경우다. = NULL은 항상 UNKNOWN이다.", "0을 NULL과 같은 값으로 본 경우다. 0은 NULL이 아니다.", "NVL을 거쳐도 NULL 행은 0이 되지 않는다고 본 경우다. NVL(NULL, 0)은 0이다."],
  trap: "= NULL은 오류가 나지 않고 조용히 0건을 돌려준다. 오류가 없다고 맞는 SQL이 아니다.",
  memo: "NULL 찾기는 IS NULL / = NULL은 항상 0건"
},
{
  id: "S77", s: 2, tp: "notin", lv: 3, sub: "WHERE 절",
  th: "2과목 | NOT의 적용 범위와 3진 논리 OR",
  q: "다음 [T] 테이블에 대해 SQL을 실행했을 때 출력되는 ID를 모두 고른 것은?",
  tb: [{ n: "T", c: ["ID", "A", "B"], r: [[1, 5, "Y"], [2, 20, "N"], [3, null, "Y"], [4, null, "N"], [5, 15, null], [6, null, null], [7, 8, null]] }],
  sql: "SELECT ID\n  FROM T\n WHERE NOT A >= 10\n    OR B = 'Y'\n ORDER BY ID;",
  o: ["1, 3, 7", "2", "1, 3", "1, 3, 4, 6, 7"],
  a: 0,
  why: "연산자 우선순위는 비교 연산자 > NOT > AND > OR이다. 따라서 NOT은 A >= 10에만 붙어 (NOT A >= 10) OR (B = 'Y')로 해석된다. 3진 논리에서 TRUE OR UNKNOWN = TRUE, FALSE OR UNKNOWN = UNKNOWN, NOT UNKNOWN = UNKNOWN이다. WHERE는 TRUE인 행만 남긴다.",
  st: [
    { t: "[원본] T", tb: { c: ["ID", "A", "B"], r: [[1, 5, "Y"], [2, 20, "N"], [3, null, "Y"], [4, null, "N"], [5, 15, null], [6, null, null], [7, 8, null]] } },
    { t: "1단계: 각 조건 평가", tb: { c: ["ID", "NOT A >= 10", "B = 'Y'", "OR 결과"], r: [
      [1, "TRUE", "TRUE", "TRUE"], [2, "FALSE", "FALSE", "FALSE"], [3, "UNKNOWN", "TRUE", "TRUE"], [4, "UNKNOWN", "FALSE", "UNKNOWN"],
      [5, "FALSE", "UNKNOWN", "UNKNOWN"], [6, "UNKNOWN", "UNKNOWN", "UNKNOWN"], [7, "TRUE", "UNKNOWN", "TRUE"]
    ], hl: [0, 2, 6] }, n: "TRUE인 행: 1, 3, 7" }
  ],
  res: { c: ["ID"], r: [[1], [3], [7]] },
  pg: "SELECT ID FROM T WHERE NOT A >= 10 OR B = 'Y' ORDER BY ID",
  ox: ["정답.", "NOT이 조건 전체 NOT (A >= 10 OR B = 'Y')에 걸린다고 본 경우다. NOT은 바로 뒤의 비교식에만 붙는다.", "TRUE OR UNKNOWN을 UNKNOWN으로 보아 7번을 뺀 경우다. OR는 한쪽이 TRUE면 TRUE다.", "NULL 비교를 FALSE로 보고 NOT을 붙여 TRUE로 바꾼 경우다(4, 6번 포함). NOT UNKNOWN은 UNKNOWN이다."],
  trap: "NULL을 FALSE처럼 다루면 NOT이 붙는 순간 TRUE로 뒤집혀 오답이 된다. UNKNOWN은 NOT을 붙여도 UNKNOWN이다.",
  memo: "비교 > NOT > AND > OR / TRUE OR UNKNOWN = TRUE / NOT UNKNOWN = UNKNOWN"
},
{
  id: "S78", s: 2, tp: "basic", lv: 2, sub: "WHERE 절",
  th: "2과목 | 다중 컬럼 IN과 개별 IN 조건의 차이",
  q: "다음 [T] 테이블에 대해 (가), (나) SQL의 결과 건수로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "DEPT", "JOB"], r: [[1, 10, "A"], [2, 10, "B"], [3, 20, "A"], [4, 20, "B"], [5, 30, "A"]] }],
  sql: "(가) SELECT COUNT(*) FROM T\n     WHERE (DEPT, JOB) IN ((10, 'A'), (20, 'B'));\n(나) SELECT COUNT(*) FROM T\n     WHERE DEPT IN (10, 20) AND JOB IN ('A', 'B');",
  o: ["2, 4", "4, 4", "2, 2", "4, 2"],
  a: 0,
  why: "(가)의 다중 컬럼 IN은 (DEPT, JOB) 쌍이 목록의 쌍과 정확히 일치해야 한다. 즉 (DEPT = 10 AND JOB = 'A') OR (DEPT = 20 AND JOB = 'B')와 같다. (나)는 두 조건을 따로 검사하므로 DEPT가 10 또는 20이고 JOB이 A 또는 B인 모든 조합(2 × 2)이 통과한다.",
  st: [
    { t: "[원본] T", tb: { c: ["ID", "DEPT", "JOB"], r: [[1, 10, "A"], [2, 10, "B"], [3, 20, "A"], [4, 20, "B"], [5, 30, "A"]] } },
    { t: "1단계: 행별 판정", tb: { c: ["ID", "(DEPT, JOB)", "(가) 쌍 일치", "(나) 개별 IN"], r: [[1, "(10, A)", "O", "O"], [2, "(10, B)", "X", "O"], [3, "(20, A)", "X", "O"], [4, "(20, B)", "O", "O"], [5, "(30, A)", "X", "X"]], hl: [1, 2] }, n: "(가) 2건, (나) 4건" }
  ],
  res: { c: ["가", "나"], r: [[2, 4]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE (DEPT, JOB) IN ((10, 'A'), (20, 'B'))), (SELECT COUNT(*) FROM T WHERE DEPT IN (10, 20) AND JOB IN ('A', 'B'))",
  ox: ["정답.", "(가)도 각 컬럼을 따로 비교한다고 본 경우다. 다중 컬럼 IN은 쌍 단위로 비교한다.", "(나)도 쌍 단위로 비교한다고 본 경우다. 개별 IN은 교차 조합까지 통과시킨다.", "두 SQL의 결과를 서로 바꾸어 본 경우다."],
  trap: "IN 목록은 OR로 풀린다. (가)는 '쌍 OR 쌍', (나)는 '(값 OR 값) AND (값 OR 값)'이다.",
  memo: "(A, B) IN ((…), (…)) = 쌍으로 일치"
},
{
  id: "S79", s: 2, tp: "agg", lv: 2, sub: "GROUP BY, HAVING 절",
  th: "2과목 | 집계 함수를 쓸 수 있는 위치",
  q: "다음 중 오류가 발생하는 SQL은? (Oracle 기준)",
  sql: "① SELECT COUNT(*) FROM EMP HAVING COUNT(*) > 3;\n② SELECT DEPTNO, COUNT(*) FROM EMP WHERE COUNT(*) > 1 GROUP BY DEPTNO;\n③ SELECT DEPTNO FROM EMP GROUP BY DEPTNO HAVING MAX(SAL) > 3000;\n④ SELECT DEPTNO, COUNT(*) FROM EMP GROUP BY DEPTNO ORDER BY AVG(SAL) DESC;",
  o: ["①", "②", "③", "④"],
  a: 1,
  why: "WHERE 절은 그룹을 만들기 전에 개별 행을 거르는 단계이므로 집계 함수를 쓸 수 없다(ORA-00934: 그룹 함수는 허가되지 않습니다). 집계 결과로 거르려면 HAVING 절을 써야 한다. HAVING은 GROUP BY 없이도 쓸 수 있으며, 이때는 테이블 전체를 하나의 그룹으로 본다. HAVING과 ORDER BY에는 SELECT 목록에 없는 집계 함수도 쓸 수 있다.",
  st: [
    { t: "논리적 실행 순서와 집계 함수", tb: { c: ["순서", "절", "집계 함수"], r: [[1, "FROM", "—"], [2, "WHERE", "사용 불가"], [3, "GROUP BY", "—"], [4, "HAVING", "사용 가능"], [5, "SELECT", "사용 가능"], [6, "ORDER BY", "사용 가능"]], hl: [1] } }
  ],
  ox: ["GROUP BY 없는 HAVING은 전체를 한 그룹으로 보므로 정상이다. 행이 3개 이하면 결과가 0건일 뿐 오류는 아니다.", "정답. WHERE 절에는 집계 함수를 쓸 수 없다.", "HAVING에 SELECT 목록에 없는 MAX(SAL)를 써도 된다.", "GROUP BY가 있는 쿼리의 ORDER BY에는 집계 함수를 쓸 수 있다. SELECT에 없는 AVG(SAL)이어도 된다."],
  trap: "①처럼 GROUP BY 없이 HAVING만 쓴 SQL을 오류로 고르기 쉽다. 문법상 허용된다.",
  memo: "집계 함수 = WHERE 불가, HAVING·SELECT·ORDER BY 가능"
},
{
  id: "S80", s: 2, tp: "agg", lv: 2, sub: "GROUP BY, HAVING 절",
  th: "2과목 | COUNT(DISTINCT)와 HAVING, 집계 별칭 정렬",
  q: "다음 [SALES] 테이블에 대해 SQL을 실행한 결과로 옳은 것은? (결과를 행 순서대로 'REGION(CNT, TOT)' 형태로 나타낸다.)",
  tb: [{ n: "SALES", c: ["REGION", "PROD", "AMT"], r: [["E", "P1", 100], ["E", "P1", 200], ["E", "P2", 50], ["W", "P1", 300], ["W", "P1", null], ["S", "P2", 100], ["S", "P3", 50], ["S", null, 100], ["N", "P1", 500]] }],
  sql: "SELECT REGION,\n       COUNT(DISTINCT PROD) AS CNT,\n       SUM(AMT)             AS TOT\n  FROM SALES\n GROUP BY REGION\nHAVING COUNT(*) >= 2\n ORDER BY TOT DESC;",
  o: ["E(2, 350) → W(1, 300) → S(2, 250)", "N(1, 500) → E(2, 350) → W(1, 300) → S(2, 250)", "E(2, 350) → W(1, 300) → S(3, 250)", "E(3, 350) → W(2, 300) → S(2, 250)"],
  a: 0,
  why: "GROUP BY로 지역별 그룹을 만든 뒤 HAVING COUNT(*) >= 2로 행이 2개 이상인 그룹만 남긴다. N은 1행이라 빠진다. COUNT(*)는 AMT가 NULL인 W의 행도 세므로 W는 2행으로 남는다. COUNT(DISTINCT PROD)는 NULL을 버린 뒤 중복을 지우고 센다. ORDER BY에는 SELECT의 별칭(TOT)을 쓸 수 있다.",
  st: [
    { t: "[원본] SALES", tb: { c: ["REGION", "PROD", "AMT"], r: [["E", "P1", 100], ["E", "P1", 200], ["E", "P2", 50], ["W", "P1", 300], ["W", "P1", null], ["S", "P2", 100], ["S", "P3", 50], ["S", null, 100], ["N", "P1", 500]] } },
    { t: "1단계: GROUP BY REGION 집계", tb: { c: ["REGION", "COUNT(*)", "PROD 값", "COUNT(DISTINCT PROD)", "SUM(AMT)"], r: [["E", 3, "P1, P1, P2", 2, 350], ["W", 2, "P1, P1", 1, 300], ["S", 3, "P2, P3, NULL", 2, 250], ["N", 1, "P1", 1, 500]], hl: [3] } },
    { t: "2단계: HAVING COUNT(*) >= 2 → ORDER BY TOT DESC", tb: { c: ["REGION", "CNT", "TOT"], r: [["E", 2, 350], ["W", 1, 300], ["S", 2, 250]] } }
  ],
  res: { c: ["REGION", "CNT", "TOT"], r: [["E", 2, 350], ["W", 1, 300], ["S", 2, 250]] },
  pg: "SELECT REGION, COUNT(DISTINCT PROD) AS CNT, SUM(AMT) AS TOT FROM SALES GROUP BY REGION HAVING COUNT(*) >= 2 ORDER BY TOT DESC",
  ox: ["정답.", "HAVING을 무시하고 1행뿐인 N까지 남긴 경우다.", "COUNT(DISTINCT PROD)가 NULL도 하나의 값으로 센다고 본 경우다.", "DISTINCT를 무시하고 PROD의 NULL 아닌 행 수(COUNT(PROD))를 센 경우다."],
  trap: "HAVING 조건이 COUNT(AMT) >= 2였다면 W는 AMT가 1개뿐이라 빠진다. COUNT(*)와 COUNT(컬럼)을 구분하자.",
  memo: "COUNT(DISTINCT 컬럼) = NULL 제외 후 중복 제거"
},
{
  id: "S81", s: 2, tp: "basic", lv: 2, sub: "ORDER BY 절",
  th: "2과목 | 컬럼 위치 번호 정렬과 다중 정렬 키",
  q: "다음 [T] 테이블에 대해 SQL을 실행했을 때 NAME의 출력 순서로 옳은 것은?",
  tb: [{ n: "T", c: ["NAME", "DEPT", "SAL"], r: [["A", 10, 300], ["B", 20, 100], ["C", 10, 100], ["D", 20, 300], ["E", 30, 200]] }],
  sql: "SELECT NAME, DEPT, SAL\n  FROM T\n ORDER BY 2 DESC, SAL;",
  o: ["E, B, D, C, A", "E, D, B, A, C", "C, A, B, D, E", "A, C, D, B, E"],
  a: 0,
  why: "ORDER BY 2는 SELECT 목록의 두 번째 컬럼(DEPT)을 뜻한다. DESC는 바로 앞의 정렬 키 하나에만 적용되므로 SAL은 기본값인 오름차순(ASC)으로 정렬된다. 먼저 DEPT 내림차순으로 정렬하고, DEPT가 같은 행끼리는 SAL 오름차순으로 정렬한다.",
  st: [
    { t: "[원본] T", tb: { c: ["NAME", "DEPT", "SAL"], r: [["A", 10, 300], ["B", 20, 100], ["C", 10, 100], ["D", 20, 300], ["E", 30, 200]] } },
    { t: "1단계: 1차 키 DEPT DESC", tb: { c: ["DEPT", "해당 행"], r: [[30, "E"], [20, "B(100), D(300)"], [10, "A(300), C(100)"]] } },
    { t: "2단계: 2차 키 SAL ASC (같은 DEPT 안에서)", tb: { c: ["NAME", "DEPT", "SAL"], r: [["E", 30, 200], ["B", 20, 100], ["D", 20, 300], ["C", 10, 100], ["A", 10, 300]] } }
  ],
  res: { c: ["NAME", "DEPT", "SAL"], r: [["E", 30, 200], ["B", 20, 100], ["D", 20, 300], ["C", 10, 100], ["A", 10, 300]] },
  pg: "SELECT NAME, DEPT, SAL FROM T ORDER BY 2 DESC, SAL",
  ox: ["정답.", "DESC가 뒤의 SAL에도 적용된다고 본 경우다. DESC는 앞의 키 하나에만 붙는다.", "DESC를 무시하고 둘 다 오름차순으로 정렬한 경우다.", "DESC를 SAL에 붙은 것으로 본 경우다(DEPT ASC, SAL DESC)."],
  trap: "ORDER BY의 위치 번호는 SELECT 목록 기준이다. 테이블의 컬럼 순서가 아니다.",
  memo: "정렬 방향은 키마다 따로 / 기본은 ASC"
},
{
  id: "S82", s: 2, tp: "basic", lv: 2, sub: "ORDER BY 절",
  th: "2과목 | SELECT에 없는 컬럼으로 정렬하기",
  q: "다음 중 오류가 발생하는 SQL은? (Oracle 기준, EMP 테이블에는 ENAME, DEPTNO, SAL 컬럼이 있다.)",
  sql: "① SELECT ENAME FROM EMP ORDER BY SAL DESC;\n② SELECT DISTINCT DEPTNO FROM EMP ORDER BY SAL;\n③ SELECT DEPTNO, COUNT(*) FROM EMP GROUP BY DEPTNO ORDER BY COUNT(*) DESC;\n④ SELECT ENAME, SAL AS S FROM EMP ORDER BY S, 1;",
  o: ["①", "②", "③", "④"],
  a: 1,
  why: "일반 SELECT 문은 SELECT 목록에 없는 컬럼으로도 정렬할 수 있다. 그러나 DISTINCT를 쓰면 중복이 제거된 결과에는 SAL 값이 하나로 정해지지 않으므로, ORDER BY에는 SELECT 목록에 있는 식만 쓸 수 있다(ORA-01791: SELECT 식이 부적합합니다). GROUP BY가 있을 때도 ORDER BY에는 GROUP BY 컬럼이나 집계 함수만 쓸 수 있다.",
  st: [
    { t: "ORDER BY에 쓸 수 있는 것", tb: { c: ["쿼리 종류", "SELECT에 없는 컬럼", "별칭·위치 번호"], r: [["일반 SELECT", "가능", "가능"], ["SELECT DISTINCT", "불가", "가능"], ["GROUP BY", "GROUP BY 컬럼·집계 함수만", "가능"]], hl: [1] } }
  ],
  ox: ["SELECT에 없는 SAL로 정렬해도 일반 SELECT에서는 정상이다.", "정답. DISTINCT 쿼리에서는 SELECT 목록에 없는 컬럼으로 정렬할 수 없다.", "GROUP BY 쿼리에서 집계 함수로 정렬하는 것은 정상이다.", "별칭(S)과 위치 번호(1)를 섞어 써도 정상이다."],
  trap: "'SELECT에 없는 컬럼으로는 정렬할 수 없다'는 일반 규칙이 아니다. DISTINCT나 GROUP BY가 있을 때만 제한된다.",
  memo: "SELECT에 없는 컬럼 정렬: 일반 O / DISTINCT X / GROUP BY는 그룹 컬럼·집계만"
},
{
  id: "S83", s: 2, tp: "basic", lv: 3, sub: "ORDER BY 절",
  th: "2과목 | NULLS FIRST / NULLS LAST와 다중 정렬 키",
  q: "다음 [T] 테이블에 대해 SQL을 실행했을 때 NAME의 출력 순서로 옳은 것은? (Oracle 기준)",
  tb: [{ n: "T", c: ["NAME", "DEPT", "SAL"], r: [["A", 10, 100], ["B", null, 200], ["C", 10, null], ["D", 20, 300], ["E", null, null], ["F", 10, 300]] }],
  sql: "SELECT NAME\n  FROM T\n ORDER BY DEPT NULLS FIRST, SAL DESC NULLS LAST;",
  o: ["B, E, F, A, C, D", "C, F, A, D, E, B", "E, B, C, F, A, D", "B, E, A, F, C, D"],
  a: 0,
  why: "Oracle은 NULL을 가장 큰 값으로 보아 기본적으로 ASC에서는 맨 뒤, DESC에서는 맨 앞에 둔다. NULLS FIRST / NULLS LAST는 그 기본 위치를 바꾸며, 바로 앞의 정렬 키 하나에만 적용된다. DEPT는 오름차순이되 NULL을 맨 앞에 두고, 같은 DEPT 안에서는 SAL 내림차순이되 NULL을 맨 뒤에 둔다.",
  st: [
    { t: "[원본] T", tb: { c: ["NAME", "DEPT", "SAL"], r: [["A", 10, 100], ["B", null, 200], ["C", 10, null], ["D", 20, 300], ["E", null, null], ["F", 10, 300]] } },
    { t: "1단계: DEPT ASC NULLS FIRST", tb: { c: ["DEPT 그룹", "행"], r: [["NULL", "B(200), E(NULL)"], [10, "A(100), C(NULL), F(300)"], [20, "D(300)"]] } },
    { t: "2단계: 그룹 안에서 SAL DESC NULLS LAST", tb: { c: ["NAME", "DEPT", "SAL"], r: [["B", null, 200], ["E", null, null], ["F", 10, 300], ["A", 10, 100], ["C", 10, null], ["D", 20, 300]] } }
  ],
  res: { c: ["NAME"], r: [["B"], ["E"], ["F"], ["A"], ["C"], ["D"]] },
  pg: "SELECT NAME FROM T ORDER BY DEPT NULLS FIRST, SAL DESC NULLS LAST",
  ox: ["정답.", "NULLS 절을 무시하고 Oracle 기본 규칙(ASC는 NULL 뒤, DESC는 NULL 앞)으로 정렬한 경우다.", "첫 키의 NULLS FIRST가 SAL에도 적용된다고 본 경우다. NULLS 절은 키마다 따로 붙는다.", "SAL의 DESC를 무시하고 오름차순으로 정렬한 경우다."],
  trap: "SQL Server는 NULL을 가장 작은 값으로 보아 ASC에서 맨 앞, DESC에서 맨 뒤에 둔다. 이 문제에서 지정한 NULLS 절은 우연히 SQL Server의 기본 동작과 같다.",
  memo: "Oracle 기본: NULL = 최댓값 / NULLS FIRST·LAST는 키마다"
},
{
  id: "S84", s: 2, tp: "join", lv: 3, sub: "조인",
  th: "2과목 | 비등가 조인(BETWEEN)과 경계값 중복",
  q: "다음 두 테이블에 대해 SQL을 실행한 결과로 옳은 것은? (SALGRADE의 등급 경계값이 서로 겹친다는 점에 주의한다.)",
  tb: [
    { n: "EMP", c: ["ENAME", "SAL"], r: [["A", 800], ["B", 1000], ["C", 1500], ["D", 2000], ["E", 3500]] },
    { n: "SALGRADE", c: ["GRADE", "LOSAL", "HISAL"], r: [[1, 0, 1000], [2, 1000, 2000], [3, 2000, 3000]] }
  ],
  sql: "SELECT S.GRADE, COUNT(*) AS CNT\n  FROM EMP E, SALGRADE S\n WHERE E.SAL BETWEEN S.LOSAL AND S.HISAL\n GROUP BY S.GRADE\n ORDER BY S.GRADE;",
  o: ["1등급 2명, 2등급 3명, 3등급 1명", "1등급 2명, 2등급 2명", "1등급 1명, 2등급 2명, 3등급 1명", "1등급 1명, 2등급 1명"],
  a: 0,
  why: "비등가 조인(Non-EQUI JOIN)은 = 이외의 연산자(BETWEEN, >=, < 등)로 두 테이블을 연결한다. 조건을 만족하는 등급 행이 여러 개면 사원 행도 그만큼 반복된다. BETWEEN은 양 끝값을 포함하므로 경계값 1000인 B는 1등급과 2등급에, 2000인 D는 2등급과 3등급에 모두 붙는다. 어느 범위에도 들지 않는 E(3500)는 결과에서 빠진다.",
  st: [
    { t: "[원본] EMP · SALGRADE", n: "등급 범위: 1(0~1000), 2(1000~2000), 3(2000~3000) — 1000과 2000이 두 등급에 걸친다." },
    { t: "1단계: 조인 조건을 만족하는 (사원, 등급) 쌍", tb: { c: ["ENAME", "SAL", "매칭 등급"], r: [["A", 800, "1"], ["B", 1000, "1, 2"], ["C", 1500, "2"], ["D", 2000, "2, 3"], ["E", 3500, "없음"]], hl: [1, 3] }, n: "조인 결과 6행" },
    { t: "2단계: GROUP BY GRADE", tb: { c: ["GRADE", "사원", "CNT"], r: [[1, "A, B", 2], [2, "B, C, D", 3], [3, "D", 1]] } }
  ],
  res: { c: ["GRADE", "CNT"], r: [[1, 2], [2, 3], [3, 1]] },
  pg: "SELECT S.GRADE, COUNT(*) AS CNT FROM EMP E, SALGRADE S WHERE E.SAL BETWEEN S.LOSAL AND S.HISAL GROUP BY S.GRADE ORDER BY S.GRADE",
  ox: ["정답.", "경계값을 낮은 등급 하나에만 붙인 경우다(B → 1, D → 2). 조인은 조건을 만족하는 모든 행과 연결된다.", "경계값을 높은 등급 하나에만 붙인 경우다(B → 2, D → 3).", "BETWEEN이 양 끝값을 포함하지 않는다고 보아 B와 D를 뺀 경우다."],
  trap: "실무의 등급표는 범위가 겹치지 않게(1~1000, 1001~2000) 설계한다. 겹치면 한 사원이 여러 등급으로 중복 출력된다.",
  memo: "비등가 조인 = 조건 맞는 행 모두 연결 / BETWEEN = 양 끝 포함"
},
{
  id: "S85", s: 2, tp: "join", lv: 2, sub: "조인",
  th: "2과목 | 3개 테이블 등가 조인의 결과 건수",
  q: "다음 세 테이블에 대해 SQL을 실행한 결과 건수는?",
  tb: [
    { n: "EMP", c: ["ENAME", "DEPTNO"], r: [["A", 10], ["B", 20], ["C", 30], ["D", 40], ["E", null], ["F", 10]] },
    { n: "DEPT", c: ["DEPTNO", "LOC_ID"], r: [[10, "L1"], [20, "L2"], [30, null]] },
    { n: "LOC", c: ["LOC_ID", "CITY"], r: [["L1", "SEOUL"], ["L2", "BUSAN"], ["L3", "DAEGU"]] }
  ],
  sql: "SELECT COUNT(*)\n  FROM EMP E, DEPT D, LOC L\n WHERE E.DEPTNO = D.DEPTNO\n   AND D.LOC_ID = L.LOC_ID;",
  o: ["3", "4", "6", "54"],
  a: 0,
  why: "등가 조인(EQUI JOIN)은 = 조건을 만족하는 행끼리만 연결한다. 세 테이블을 조인하면 두 번의 조인을 차례로 거치는 것과 같다. 어느 단계에서든 짝이 없는 행이나 조인 키가 NULL인 행은 결과에서 빠진다.",
  st: [
    { t: "[원본] EMP 6행 · DEPT 3행 · LOC 3행", n: "조인 조건이 없다면 6 × 3 × 3 = 54행의 카테시안 곱이 된다." },
    { t: "1단계: EMP ⋈ DEPT (E.DEPTNO = D.DEPTNO)", tb: { c: ["ENAME", "DEPTNO", "LOC_ID"], r: [["A", 10, "L1"], ["B", 20, "L2"], ["C", 30, null], ["F", 10, "L1"]], hl: [2] }, n: "D(40)는 DEPT에 없고, E(NULL)는 = 비교가 UNKNOWN이라 빠진다. 4행" },
    { t: "2단계: ⋈ LOC (D.LOC_ID = L.LOC_ID)", tb: { c: ["ENAME", "LOC_ID", "CITY"], r: [["A", "L1", "SEOUL"], ["B", "L2", "BUSAN"], ["F", "L1", "SEOUL"]] }, n: "C는 LOC_ID가 NULL이라 빠진다. 3행" }
  ],
  res: { c: ["COUNT(*)"], r: [[3]] },
  pg: "SELECT COUNT(*) FROM EMP E, DEPT D, LOC L WHERE E.DEPTNO = D.DEPTNO AND D.LOC_ID = L.LOC_ID",
  ox: ["정답.", "첫 번째 조인 결과(4행)에서 멈춘 경우다. 두 번째 조인에서 LOC_ID가 NULL인 C가 빠진다.", "EMP의 모든 행이 남는다고 본 경우다. 아우터 조인일 때의 생각이다.", "조인 조건이 없을 때의 카테시안 곱(6 × 3 × 3)이다."],
  trap: "LOC의 L3(DAEGU)는 어느 부서와도 연결되지 않으므로 결과 건수에 영향을 주지 않는다.",
  memo: "다중 등가 조인 = 단계마다 짝 없는 행·NULL 키 탈락"
},
{
  id: "S86", s: 2, tp: "join", lv: 1, sub: "조인",
  th: "2과목 | 조인의 기본 개념 (등가·비등가·조인 조건 수)",
  q: "조인에 대한 설명으로 가장 적절하지 않은 것은?",
  o: [
    "N개의 테이블을 조인할 때 카테시안 곱을 피하려면 최소 N − 1개의 조인 조건이 필요하다.",
    "등가 조인(EQUI JOIN)은 = 연산자로, 비등가 조인(Non-EQUI JOIN)은 BETWEEN, >, >=, <, <= 등 = 이외의 연산자로 두 테이블을 연결한다.",
    "조인 조건 없이 M행 테이블과 N행 테이블을 FROM 절에 함께 쓰면 M × N행의 결과가 나온다.",
    "비등가 조인은 Oracle의 FROM 절 콤마(,) 방식으로만 작성할 수 있으며, ANSI 표준 조인의 ON 절에는 = 이외의 조건을 쓸 수 없다."
  ],
  a: 3,
  why: "ANSI 표준 조인의 ON 절에는 임의의 조건식을 쓸 수 있다. 예를 들어 FROM EMP E JOIN SALGRADE S ON E.SAL BETWEEN S.LOSAL AND S.HISAL처럼 비등가 조인도 ON 절로 작성한다. = 조건만 쓸 수 있는 것은 USING 절과 NATURAL JOIN이다.",
  st: [
    { t: "조인 조건 위치별 비교", tb: { c: ["문법", "= 조건", "= 이외 조건"], r: [["WHERE 절 (Oracle 방식)", "가능", "가능"], ["ON 절", "가능", "가능"], ["USING / NATURAL JOIN", "같은 이름 컬럼의 = 만", "불가"]], hl: [1] } }
  ],
  ox: ["옳다. 테이블 N개를 사슬처럼 이으려면 최소 N − 1개의 연결 조건이 필요하다.", "옳다. 등가·비등가 조인의 정의다.", "옳다. 조인 조건이 없으면 카테시안 곱(CROSS JOIN)이 된다.", "틀리다. ON 절에는 BETWEEN 같은 비등가 조건도 쓸 수 있다."],
  trap: "N − 1은 '최소' 개수다. 복합키로 연결하면 테이블 한 쌍에 조건이 두 개 이상 필요할 수 있다.",
  memo: "ON = 아무 조건 / USING·NATURAL = 같은 이름 컬럼의 = 만"
},
{
  id: "S87", s: 2, tp: "join", lv: 3, sub: "조인",
  th: "2과목 | 1:N 조인 후 SUM 부풀림",
  q: "다음 두 테이블에 대해 SQL을 실행한 결과로 옳은 것은? (결과를 'DEPTNO: B_SUM / S_SUM' 형태로 나타낸다.)",
  tb: [
    { n: "DEPT", c: ["DEPTNO", "BUDGET"], r: [[10, 1000], [20, 500], [30, 700]] },
    { n: "EMP", c: ["ENAME", "DEPTNO", "SAL"], r: [["A", 10, 100], ["B", 10, 200], ["C", 10, 300], ["D", 20, 400]] }
  ],
  sql: "SELECT D.DEPTNO,\n       SUM(D.BUDGET) AS B_SUM,\n       SUM(E.SAL)    AS S_SUM\n  FROM DEPT D, EMP E\n WHERE D.DEPTNO = E.DEPTNO\n GROUP BY D.DEPTNO\n ORDER BY D.DEPTNO;",
  o: ["10: 3000 / 600, 20: 500 / 400", "10: 1000 / 600, 20: 500 / 400", "10: 3000 / 1800, 20: 500 / 400", "10: 3000 / 600, 20: 500 / 400, 30: 700 / NULL"],
  a: 0,
  why: "DEPT(1)와 EMP(N)를 조인하면 부서 행이 그 부서의 사원 수만큼 복제된다. 10번 부서는 사원이 3명이므로 BUDGET 1000이 3번 나타나고, SUM(D.BUDGET)은 3000으로 부풀려진다. SAL은 사원마다 한 번씩만 나타나므로 정상 합계다. 사원이 없는 30번 부서는 등가 조인에서 빠진다.",
  st: [
    { t: "1단계: 조인 결과 (부서 행 복제)", tb: { c: ["DEPTNO", "BUDGET", "ENAME", "SAL"], r: [[10, 1000, "A", 100], [10, 1000, "B", 200], [10, 1000, "C", 300], [20, 500, "D", 400]], hl: [0, 1, 2] }, n: "DEPT 30은 짝이 없어 빠진다." },
    { t: "2단계: GROUP BY DEPTNO", tb: { c: ["DEPTNO", "SUM(BUDGET)", "SUM(SAL)"], r: [[10, "1000 × 3 = 3000", 600], [20, 500, 400]] } }
  ],
  res: { c: ["DEPTNO", "B_SUM", "S_SUM"], r: [[10, 3000, 600], [20, 500, 400]] },
  pg: "SELECT D.DEPTNO, SUM(D.BUDGET) AS B_SUM, SUM(E.SAL) AS S_SUM FROM DEPT D, EMP E WHERE D.DEPTNO = E.DEPTNO GROUP BY D.DEPTNO ORDER BY D.DEPTNO",
  ox: ["정답.", "부서 예산이 조인 후에도 한 번만 더해진다고 본 경우다. 조인으로 행이 3개로 늘었다.", "SAL까지 3배로 부풀려진다고 본 경우다. 사원 행은 복제되지 않는다.", "사원이 없는 30번 부서도 나온다고 본 경우다. 아우터 조인이 아니므로 빠진다."],
  trap: "부서 예산 합계를 제대로 구하려면 조인 전에 집계하거나, 이 경우처럼 1쪽 값을 MAX(D.BUDGET)로 가져와야 한다.",
  memo: "1:N 조인 후 1쪽 컬럼 SUM = N배로 부풀림"
},
{
  id: "S88", s: 2, tp: "join", lv: 3, sub: "조인",
  th: "2과목 | Oracle (+) 아우터 조인과 상수 조건의 (+)",
  q: "다음 두 테이블에 대해 (가), (나) SQL의 결과 건수로 옳은 것은? (Oracle 기준)",
  tb: [
    { n: "EMP", c: ["ENAME", "DEPTNO"], r: [["A", 10], ["B", 20], ["C", 30], ["D", null], ["E", 10]] },
    { n: "DEPT", c: ["DEPTNO", "LOC"], r: [[10, "SEOUL"], [20, "BUSAN"], [30, "SEOUL"]] }
  ],
  sql: "(가) SELECT COUNT(*) FROM EMP E, DEPT D\n     WHERE E.DEPTNO = D.DEPTNO(+)\n       AND D.LOC(+) = 'SEOUL';\n(나) SELECT COUNT(*) FROM EMP E, DEPT D\n     WHERE E.DEPTNO = D.DEPTNO(+)\n       AND D.LOC = 'SEOUL';",
  o: ["5, 3", "3, 3", "5, 5", "4, 3"],
  a: 0,
  why: "Oracle의 (+) 아우터 조인에서 (+)가 붙은 조건은 모두 '조인 조건'으로 처리된다. (가)는 D.LOC(+) = 'SEOUL'까지 조인 조건이므로 'SEOUL에 있는 부서와 연결하되, 없으면 NULL로 채워 EMP 행은 모두 남긴다'는 뜻이다. (나)는 D.LOC = 'SEOUL'에 (+)가 없으므로 아우터 조인을 마친 뒤 적용되는 필터가 된다. NULL로 채워진 행은 D.LOC = 'SEOUL'이 UNKNOWN이라 빠지고, 결과적으로 등가 조인처럼 동작한다.",
  st: [
    { t: "1단계: 공통 — EMP 기준 아우터 조인", tb: { c: ["ENAME", "E.DEPTNO", "(가) 연결된 D.LOC", "(나) 연결된 D.LOC"], r: [["A", 10, "SEOUL", "SEOUL"], ["B", 20, "NULL (BUSAN은 조건 불만족)", "BUSAN"], ["C", 30, "SEOUL", "SEOUL"], ["D", null, "NULL", "NULL"], ["E", 10, "SEOUL", "SEOUL"]] }, n: "(가)는 여기서 끝 → 5행" },
    { t: "2단계: (나)만 — WHERE D.LOC = 'SEOUL' 필터", tb: { c: ["ENAME", "D.LOC", "판정"], r: [["A", "SEOUL", "TRUE"], ["B", "BUSAN", "FALSE"], ["C", "SEOUL", "TRUE"], ["D", "NULL", "UNKNOWN"], ["E", "SEOUL", "TRUE"]], hl: [1, 3] }, n: "3행" }
  ],
  res: { c: ["가", "나"], r: [[5, 3]] },
  pg: "SELECT (SELECT COUNT(*) FROM EMP E LEFT JOIN DEPT D ON E.DEPTNO = D.DEPTNO AND D.LOC = 'SEOUL'), (SELECT COUNT(*) FROM EMP E LEFT JOIN DEPT D ON E.DEPTNO = D.DEPTNO WHERE D.LOC = 'SEOUL')",
  ox: ["정답.", "상수 조건의 (+) 유무가 결과에 영향이 없다고 본 경우다. (가)에서는 조인 조건이 되어 EMP 행이 모두 남는다.", "(나)도 아우터 조인 결과가 그대로 유지된다고 본 경우다. (+)가 없는 조건은 조인 후 필터다.", "(가)에서 DEPTNO가 NULL인 D가 빠진다고 본 경우다. 기준 테이블(EMP)의 행은 조인 키가 NULL이어도 남는다."],
  trap: "ANSI로 바꾸면 (가)는 LEFT JOIN … ON E.DEPTNO = D.DEPTNO AND D.LOC = 'SEOUL', (나)는 LEFT JOIN … ON E.DEPTNO = D.DEPTNO WHERE D.LOC = 'SEOUL'이다.",
  memo: "(+) 붙은 조건 = 조인 조건(ON) / (+) 없는 조건 = 조인 후 필터(WHERE)"
},
{
  id: "S89", s: 2, tp: "join", lv: 2, sub: "조인",
  th: "2과목 | 중복 키와 NULL 키가 있는 등가 조인 건수",
  q: "다음 두 테이블에 대해 SQL을 실행한 결과 건수는?",
  tb: [
    { n: "T1", c: ["K"], r: [[1], [1], [2], [null], [3]] },
    { n: "T2", c: ["K"], r: [[1], [1], [1], [2], [null], [null], [4]] }
  ],
  sql: "SELECT COUNT(*)\n  FROM T1, T2\n WHERE T1.K = T2.K;",
  o: ["2", "3", "7", "9"],
  a: 2,
  why: "등가 조인은 키 값이 같은 행끼리 '모든 조합'으로 연결한다. 같은 키가 T1에 a개, T2에 b개 있으면 a × b행이 나온다. NULL = NULL은 UNKNOWN이므로 NULL 키끼리는 연결되지 않는다.",
  st: [
    { t: "1단계: 키 값별 행 수", tb: { c: ["K", "T1 행 수", "T2 행 수", "조인 행 수"], r: [[1, 2, 3, "2 × 3 = 6"], [2, 1, 1, "1 × 1 = 1"], [3, 1, 0, 0], [4, 0, 1, 0], ["NULL", 1, 2, "0 (UNKNOWN)"]], hl: [0, 4] } },
    { t: "2단계: 합계", n: "6 + 1 = 7행" }
  ],
  res: { c: ["COUNT(*)"], r: [[7]] },
  pg: "SELECT COUNT(*) FROM T1, T2 WHERE T1.K = T2.K",
  ox: ["일치하는 키 값의 종류(1, 2) 수를 센 경우다.", "T1의 각 행이 최대 한 번만 연결된다고 본 경우다(1, 1, 2). 실제로는 짝이 여럿이면 모두 연결된다.", "정답.", "NULL 키끼리도 1 × 2 = 2행으로 연결된다고 본 경우다."],
  trap: "조인 키가 양쪽 모두에서 중복되면(M:N) 결과 행이 곱셈으로 늘어난다. 집계 전에 반드시 키의 유일성을 확인하자.",
  memo: "같은 키 a개 × b개 = a × b행 / NULL 키는 연결 안 됨"
},
{
  id: "S90", s: 2, tp: "join", lv: 2, sub: "표준 조인",
  th: "2과목 | USING · NATURAL · ON 절의 SELECT * 컬럼 수",
  q: "다음 두 테이블에 대해 SELECT * 결과의 컬럼 수가 나머지 셋과 다른 SQL은? (두 테이블의 공통 컬럼은 DEPTNO 하나뿐이다.)",
  tb: [
    { n: "EMP", c: ["EMPNO", "ENAME", "DEPTNO"], r: [[1, "A", 10]] },
    { n: "DEPT", c: ["DEPTNO", "DNAME", "LOC"], r: [[10, "SALES", "SEOUL"]] }
  ],
  sql: "① SELECT * FROM EMP NATURAL JOIN DEPT;\n② SELECT * FROM EMP JOIN DEPT USING (DEPTNO);\n③ SELECT * FROM EMP E JOIN DEPT D ON E.DEPTNO = D.DEPTNO;\n④ SELECT * FROM EMP LEFT OUTER JOIN DEPT USING (DEPTNO);",
  o: ["①", "②", "③", "④"],
  a: 2,
  why: "NATURAL JOIN과 USING 절은 조인 컬럼(DEPTNO)을 하나로 합쳐 결과의 맨 앞에 한 번만 보여 준다. 아우터 조인이어도 USING을 쓰면 마찬가지다. 그래서 3 + 3 − 1 = 5개 컬럼이다. ON 절은 두 테이블의 컬럼을 그대로 모두 보여 주므로 E.DEPTNO와 D.DEPTNO가 따로 나와 6개 컬럼이다.",
  st: [
    { t: "SELECT * 결과 컬럼", tb: { c: ["SQL", "컬럼 목록", "개수"], r: [
      ["① NATURAL JOIN", "DEPTNO, EMPNO, ENAME, DNAME, LOC", 5],
      ["② JOIN USING", "DEPTNO, EMPNO, ENAME, DNAME, LOC", 5],
      ["③ JOIN ON", "EMPNO, ENAME, DEPTNO, DEPTNO, DNAME, LOC", 6],
      ["④ LEFT JOIN USING", "DEPTNO, EMPNO, ENAME, DNAME, LOC", 5]
    ], hl: [2] } }
  ],
  res: { c: ["①", "②", "③", "④"], r: [[5, 5, 6, 5]] },
  pg: "SELECT (SELECT COUNT(*) FROM JSON_EACH((SELECT ROW_TO_JSON(X) FROM (SELECT * FROM EMP NATURAL JOIN DEPT) X))), (SELECT COUNT(*) FROM JSON_EACH((SELECT ROW_TO_JSON(X) FROM (SELECT * FROM EMP JOIN DEPT USING (DEPTNO)) X))), (SELECT COUNT(*) FROM JSON_EACH((SELECT ROW_TO_JSON(X) FROM (SELECT * FROM EMP E JOIN DEPT D ON E.DEPTNO = D.DEPTNO) X))), (SELECT COUNT(*) FROM JSON_EACH((SELECT ROW_TO_JSON(X) FROM (SELECT * FROM EMP LEFT OUTER JOIN DEPT USING (DEPTNO)) X)))",
  ox: ["NATURAL JOIN은 공통 컬럼을 하나로 합쳐 5개다.", "USING 절도 조인 컬럼을 하나로 합쳐 5개다.", "정답. ON 절은 양쪽 DEPTNO를 모두 보여 6개다.", "아우터 조인이어도 USING을 쓰면 조인 컬럼이 하나로 합쳐져 5개다."],
  trap: "검증 쿼리는 결과 한 행을 JSON 객체로 바꾼 뒤 키 개수를 세어 컬럼 수를 확인한다. 같은 이름의 컬럼(DEPTNO)도 따로 센다.",
  memo: "USING·NATURAL = 조인 컬럼 1개(맨 앞) / ON = 양쪽 모두"
},
{
  id: "S91", s: 2, tp: "join", lv: 2, sub: "표준 조인",
  th: "2과목 | RIGHT OUTER JOIN과 CROSS JOIN 건수",
  q: "다음 두 테이블에 대해 (가), (나) SQL의 결과 건수로 옳은 것은?",
  tb: [
    { n: "A", c: ["K"], r: [[1], [2], [3], [3]] },
    { n: "B", c: ["K"], r: [[2], [3], [4], [null]] }
  ],
  sql: "(가) SELECT COUNT(*) FROM A RIGHT OUTER JOIN B ON A.K = B.K;\n(나) SELECT COUNT(*) FROM A CROSS JOIN B;",
  o: ["5, 16", "4, 16", "3, 16", "5, 12"],
  a: 0,
  why: "RIGHT OUTER JOIN은 오른쪽 테이블(B)의 모든 행을 남긴다. B의 각 행이 A에서 짝을 찾으면 짝의 수만큼, 짝이 없으면 A 쪽을 NULL로 채운 1행이 된다. B의 3은 A에 3이 두 개 있어 2행이 된다. CROSS JOIN은 조건 없이 모든 조합을 만드는 카테시안 곱이므로 4 × 4 = 16행이다. NULL 값이 있는 행도 하나의 행으로 조합된다.",
  st: [
    { t: "[원본] A(1, 2, 3, 3) · B(2, 3, 4, NULL)" },
    { t: "1단계: (가) B 기준으로 짝 찾기", tb: { c: ["B.K", "A에서 짝", "결과 행 수"], r: [[2, "2", 1], [3, "3, 3", 2], [4, "없음 → NULL", 1], ["NULL", "없음 → NULL", 1]], hl: [1] }, n: "5행" },
    { t: "2단계: (나) CROSS JOIN", n: "A 4행 × B 4행 = 16행" }
  ],
  res: { c: ["가", "나"], r: [[5, 16]] },
  pg: "SELECT (SELECT COUNT(*) FROM A RIGHT OUTER JOIN B ON A.K = B.K), (SELECT COUNT(*) FROM A CROSS JOIN B)",
  ox: ["정답.", "LEFT OUTER JOIN(A 기준)으로 센 경우다. A의 1은 NULL로, 2와 3, 3은 각각 1행씩 → 4행.", "INNER JOIN 결과(2-2, 3-3, 3-3)만 센 경우다.", "CROSS JOIN에서 NULL이 든 행을 뺀 경우다(4 × 3). CROSS JOIN은 값과 상관없이 모든 행을 조합한다."],
  trap: "아우터 조인의 결과 행 수는 '기준 테이블 행 수'보다 클 수 있다. 짝이 여러 개면 그만큼 늘어난다.",
  memo: "RIGHT OUTER = 오른쪽 전부 유지 / CROSS = M × N"
},
{
  id: "S92", s: 2, tp: "set", lv: 3, sub: "집합 연산자",
  th: "2과목 | 집합 연산자의 실행 순서 (Oracle)",
  q: "다음 SQL의 결과로 옳은 것은? (Oracle 기준, 괄호가 없는 경우의 집합 연산자 처리 순서에 주의한다.)",
  tb: [
    { n: "T1", c: ["K"], r: [[1], [2], [2], [3]] },
    { n: "T2", c: ["K"], r: [[3], [4]] },
    { n: "T3", c: ["K"], r: [[4], [5]] }
  ],
  sql: "SELECT K FROM T1\nUNION\nSELECT K FROM T2\nINTERSECT\nSELECT K FROM T3\nORDER BY 1;",
  o: ["4", "1, 2, 3, 4", "1, 2, 2, 3, 4", "1, 2, 3, 4, 5"],
  a: 0,
  why: "Oracle에서 UNION, UNION ALL, INTERSECT, MINUS는 모두 우선순위가 같고, 괄호가 없으면 위에서 아래로(왼쪽에서 오른쪽으로) 차례대로 처리한다. 먼저 T1 UNION T2 = {1, 2, 3, 4}를 만들고, 그 결과와 T3 = {4, 5}의 교집합을 구하므로 4만 남는다.",
  st: [
    { t: "1단계: T1 UNION T2", tb: { c: ["K"], r: [[1], [2], [3], [4]] }, n: "UNION은 중복(2, 2)을 제거한다." },
    { t: "2단계: (1단계 결과) INTERSECT T3", tb: { c: ["K"], r: [[4]] }, n: "{1, 2, 3, 4} ∩ {4, 5} = {4}" },
    { t: "비교: SQL 표준·PostgreSQL·SQL Server", n: "INTERSECT를 UNION보다 먼저 처리하므로 T1 UNION (T2 INTERSECT T3) = {1, 2, 3} ∪ {4} = {1, 2, 3, 4}가 된다." }
  ],
  res: { c: ["K"], r: [[4]] },
  pg: "(SELECT K FROM T1 UNION SELECT K FROM T2) INTERSECT SELECT K FROM T3 ORDER BY 1",
  ox: ["정답.", "INTERSECT를 먼저 처리하는 SQL 표준(PostgreSQL, SQL Server)의 결과다. Oracle은 위에서부터 차례로 처리한다.", "UNION이 중복을 제거하지 않는다고 보고, INTERSECT를 먼저 처리한 경우다.", "INTERSECT를 UNION처럼 합집합으로 본 경우다."],
  trap: "검증용 PostgreSQL은 INTERSECT를 먼저 처리하므로, Oracle의 처리 순서를 재현하려고 앞의 UNION을 괄호로 묶어 실행하였다. 실무에서는 괄호로 순서를 명확히 쓰는 것이 안전하다.",
  memo: "Oracle 집합 연산자 = 우선순위 동일, 위에서 아래로"
}
);
