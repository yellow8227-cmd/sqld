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
  sum: "외래키(FK)는 '값이 있으면 부모 테이블에 있어야 한다'는 규칙일 뿐이에요. 값을 비워 두는(NULL) 건 막지 않으니 ④가 틀린 설명이에요.",
  why: "무결성 제약은 데이터를 넣거나 바꿀 때마다 DB가 자동으로 검사하는 규칙이에요. 종류마다 지키려는 것이 달라요.\n\n기본키(PK)는 행 하나하나를 구별하는 이름표예요. 이름표가 비어 있거나(NULL) 둘이 같으면 어느 행인지 가려낼 수 없어요. 그래서 개체 무결성은 빈 값과 중복을 모두 막아요.\n\n외래키(FK)는 '다른 테이블의 어떤 행을 가리키는가'를 적는 칸이에요. 이 칸이 비어 있으면 '아직 가리키는 대상이 없다'는 뜻이에요. 예를 들어 아직 부서를 배정받지 않은 신입 사원이 그래요. 가리키는 대상이 없다는 건 잘못된 게 아니에요.\n\n**참조 무결성은 '값이 있으면 부모에 있어야 한다'는 규칙이고, 외래키를 비워 두는 것은 막지 않아요.** 비워 두는 것까지 막고 싶으면 그 컬럼에 NOT NULL 제약을 따로 걸어야 해요.\n\n①②③은 각 무결성을 바르게 설명했어요. ④는 '외래키에는 NULL을 넣을 수 없다'고 했으니 틀린 설명이에요.",
  st: [
    { t: "무결성 종류 정리", tb: { c: ["종류","대상","규칙","NULL"], r: [["개체 무결성","기본키","유일 + NOT NULL","불가"],["참조 무결성","외래키","NULL 또는 부모 키 값","허용"],["도메인 무결성","모든 컬럼","정의된 타입·범위 안의 값","제약에 따름"]], hl: [1] } },
    { t: "예시: 제약마다 성공·실패하는 INSERT", n: "CREATE TABLE DEPT (DEPTNO NUMBER PRIMARY KEY);\nCREATE TABLE EMP (\n  EMPNO  NUMBER PRIMARY KEY,              -- 개체 무결성: 비거나 겹치면 안 돼요\n  DEPTNO NUMBER REFERENCES DEPT(DEPTNO)   -- 참조 무결성: 비워 둘 수는 있어요\n);\nINSERT INTO DEPT VALUES (10);\nINSERT INTO EMP VALUES (1, 10);     -- 성공: 부모(DEPT)에 10이 있어요\nINSERT INTO EMP VALUES (2, NULL);   -- 성공: FK가 비어 있으면 검사하지 않아요\nINSERT INTO EMP VALUES (3, 99);     -- 실패 ORA-02291: 부모에 99가 없어요\nINSERT INTO EMP VALUES (NULL, 10);  -- 실패 ORA-01400: PK를 비울 수 없어요\nINSERT INTO EMP VALUES (1, 10);     -- 실패 ORA-00001: PK 1이 이미 있어요" }
  ],
  ox: ["맞는 설명이라 답이 아니에요. PK는 행을 구별하는 이름표라서 비어 있거나 겹치면 안 돼요.","맞는 설명이라 답이 아니에요. FK는 비어 있거나, 값이 있다면 부모 테이블의 PK 값 중 하나여야 해요.","맞는 설명이라 답이 아니에요. 컬럼 값은 정해 둔 타입·길이·허용 범위 안에 있어야 해요.","정답이에요. 이렇게 생각하면 틀려요: 'FK도 키니까 PK처럼 비우면 안 된다.' FK는 비워 둘 수 있고, 막으려면 NOT NULL을 따로 걸어야 해요."],
  trap: "②와 ④는 둘 다 '참조 무결성'이에요. 둘 중 NULL을 허용하느냐가 다른 문장을 찾으면 돼요.",
  memo: "PK = 비우기·중복 금지 / FK = 비우기 OK, 값이 있으면 부모에 있어야 함"
},
{
  id: "S67", s: 2, tp: "basic", lv: 2, sub: "SELECT 문",
  th: "2과목 | 여러 컬럼 DISTINCT와 NULL",
  q: "다음 [T] 테이블에 대해 SQL을 실행한 결과로 옳은 것은?",
  tb: [{ n: "T", c: ["DEPT", "JOB"], r: [[10, "A"], [10, "A"], [10, "B"], [20, "A"], [20, null], [20, null], [null, null]] }],
  sql: "SELECT COUNT(*)\n  FROM (SELECT DISTINCT DEPT, JOB\n          FROM T);",
  o: ["3", "5", "6", "7"],
  a: 1,
  sum: "DISTINCT는 (DEPT, JOB) 두 값이 똑같은 행을 하나로 합쳐요. 이때 NULL끼리는 같은 값으로 보니까 조합 5개가 남아요.",
  why: "DISTINCT는 SELECT에 적은 컬럼들을 한 묶음으로 보고, 똑같은 묶음이 여러 번 나오면 하나만 남겨요. 컬럼이 두 개면 (DEPT, JOB) 짝이 기준이에요. DEPT가 같아도 JOB이 다르면 다른 행이에요.\n\nWHERE 절에서 NULL = NULL을 물으면 DB는 '모름'이라고 답해요. 그런데 중복을 지울 때도 그렇게 하면 NULL이 든 행은 절대 합쳐지지 않아요. 그러면 NULL 행이 끝없이 따로 남아 결과가 쓸모없어져요.\n\n**그래서 DISTINCT·GROUP BY·집합 연산자는 NULL끼리를 같은 값으로 보고 하나로 합쳐요.**\n\n이 데이터에 대입해 볼게요. (10, A)가 두 번 나오니 하나로 합쳐요. (10, B)와 (20, A)는 한 번씩이라 그대로예요. (20, NULL)이 두 번 나오니 하나로 합쳐요. (NULL, NULL)은 한 번이라 그대로 남아요.\n\n그래서 7행이 5행으로 줄고, 바깥 COUNT(*)는 5예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT COUNT(*)                    -- ③ 남은 행 수를 세요 → 5\n  FROM (SELECT DISTINCT DEPT, JOB   -- ② (DEPT, JOB) 짝이 같은 행을 하나로: 7행 → 5행\n          FROM T);                  -- ① T의 7행을 읽어요" },
    { t: "[원본] T", tb: { c: ["DEPT","JOB"], r: [[10,"A"],[10,"A"],[10,"B"],[20,"A"],[20,null],[20,null],[null,null]], hl: [1,5] } },
    { t: "1단계: (DEPT, JOB) 짝이 같은 행 합치기", tb: { c: ["DEPT","JOB","원래 행 수"], r: [[10,"A",2],[10,"B",1],[20,"A",1],[20,null,2],[null,null,1]] }, n: "짝 5개가 남아요. (20, NULL) 두 행도 하나로 합쳐졌어요." }
  ],
  res: { c: ["COUNT(*)"], r: [[5]] },
  pg: "SELECT COUNT(*) FROM (SELECT DISTINCT DEPT, JOB FROM T) X",
  ox: ["이렇게 생각하면 틀려요: 'NULL이 든 행은 DISTINCT가 버린다.' DISTINCT는 겹치는 것만 지우고 NULL 행은 그대로 둬요.","정답이에요. (10,A)·(10,B)·(20,A)·(20,NULL)·(NULL,NULL) 5개가 남아요.","이렇게 생각하면 틀려요: 'NULL끼리는 같은지 모르니 (20, NULL) 두 행은 따로 센다.' 중복을 지울 때는 NULL끼리 같은 값으로 봐요.","이렇게 생각하면 틀려요: 'DISTINCT가 있어도 행 수는 그대로다.' 7은 중복을 하나도 안 지웠을 때의 행 수예요."],
  trap: "WHERE 절에서는 NULL = NULL이 '모름'이라 행이 안 나와요. 하지만 DISTINCT·GROUP BY·집합 연산자에서는 NULL끼리 같은 값으로 묶여요. 같은 NULL이라도 쓰는 곳에 따라 달라요.",
  memo: "DISTINCT = 컬럼 짝 기준 / 중복 지울 땐 NULL끼리 같은 값"
},
{
  id: "S68", s: 2, tp: "basic", lv: 1, sub: "SELECT 문",
  th: "2과목 | 컬럼 별칭(Alias) 작성 규칙",
  q: "다음 중 오류가 발생하는 SQL은? (Oracle 기준)",
  sql: "① SELECT ENAME AS \"Emp Name\" FROM EMP;\n② SELECT ENAME NAME, SAL * 12 ANNUAL FROM EMP;\n③ SELECT ENAME AS 'NAME' FROM EMP;\n④ SELECT SAL * 12 AS \"연봉\" FROM EMP;",
  o: ["①", "②", "③", "④"],
  a: 2,
  sum: "작은따옴표('…')는 글자 값을 만들 때 쓰고, 이름(별칭)은 큰따옴표(\"…\")로 감싸요. 그래서 별칭에 작은따옴표를 쓴 ③이 오류예요.",
  why: "SQL에서 두 따옴표는 하는 일이 달라요. 작은따옴표(')는 'ABC' 같은 글자 값을 만들어요. 큰따옴표(\")는 테이블·컬럼·별칭 같은 이름을 감싸요.\n\n별칭은 '이름'이에요. 그래서 이름이 와야 할 자리에 'NAME' 같은 글자 값이 오면 Oracle은 이걸 별칭으로 받아들이지 못해요. 대신 SELECT 목록이 끝나고 FROM이 나와야 할 자리에 엉뚱한 것이 왔다고 판단해서 ORA-00923(FROM 키워드가 필요한 위치에 없음) 오류를 내요.\n\n**별칭은 이름이니까 큰따옴표, 글자 값은 작은따옴표예요.**\n\n따옴표 없이 쓴 별칭은 대문자로 바뀌어 저장돼요. 큰따옴표로 감싸면 띄어쓰기·한글·대소문자를 쓴 그대로 지켜 줘요.\n\n보기를 대입해 볼게요. ①은 띄어쓰기가 있는 별칭을 큰따옴표로 감싸서 정상이에요. ②는 AS를 생략한 별칭이라 정상이에요. ④는 한글 별칭을 큰따옴표로 감싸서 정상이에요. ③만 작은따옴표 별칭이라 오류예요.",
  st: [
    { t: "별칭 규칙", tb: { c: ["형태","Oracle","비고"], r: [["컬럼 AS 별칭","가능","대문자로 저장"],["컬럼 별칭 (AS 생략)","가능",""],["컬럼 AS \"별 칭\"","가능","공백·대소문자 유지"],["컬럼 AS '별칭'","오류","작은따옴표는 문자열 상수"]], hl: [3] } },
    { t: "예시: 오류가 나는 SQL과 고친 SQL", n: "SELECT ENAME AS 'NAME' FROM EMP;   -- 오류 ORA-00923: 작은따옴표는 글자 값이라 별칭이 될 수 없어요\nSELECT ENAME AS \"NAME\" FROM EMP;   -- 정상: 큰따옴표 별칭 → 머리글 NAME\nSELECT ENAME AS Name FROM EMP;     -- 정상: 따옴표가 없으면 대문자 NAME으로 저장돼요\nSELECT ENAME AS \"Name\" FROM EMP;   -- 정상: 큰따옴표라 쓴 그대로 Name\nSELECT 'NAME' FROM EMP;            -- 정상이지만 별칭이 아니에요: 행마다 글자 'NAME'이 찍혀요" }
  ],
  ox: ["정상이에요. 띄어쓰기가 있는 별칭은 큰따옴표로 감싸야 하는데, 그렇게 했어요.","정상이에요. AS는 생략할 수 있어요. NAME, ANNUAL은 대문자로 저장돼요.","정답이에요. 이렇게 생각하면 틀려요: 'SQL Server에서는 되니까 Oracle에서도 된다.' Oracle에서 작은따옴표는 글자 값이라 별칭 자리에 쓸 수 없어요.","정상이에요. 한글 별칭도 큰따옴표로 감싸면 돼요."],
  trap: "SQL Server는 작은따옴표 별칭(AS 'NAME')을 받아 줘요. 하지만 SQLD는 Oracle 기준이라 오류로 판단해요.",
  memo: "별칭은 큰따옴표(\"), 글자 값은 작은따옴표(')"
},
{
  id: "S69", s: 2, tp: "basic", lv: 1, sub: "SELECT 문",
  th: "2과목 | 산술 연산자 우선순위와 NULL 연산",
  q: "다음 [EMP] 테이블에 대해 SQL을 실행했을 때 V 값을 ENAME 순서대로 나열한 것은?",
  tb: [{ n: "EMP", c: ["ENAME", "SAL", "COMM"], r: [["A", 100, 50], ["B", 200, null], ["C", 300, 0]] }],
  sql: "SELECT ENAME, SAL + COMM * 2 AS V\n  FROM EMP\n ORDER BY ENAME;",
  o: ["200, NULL, 300", "300, NULL, 600", "200, 200, 300", "300, 400, 600"],
  a: 0,
  sum: "곱셈을 덧셈보다 먼저 해서 SAL + (COMM × 2)로 계산해요. B는 COMM이 비어 있어서(NULL) 계산 결과도 비어 있어요(NULL).",
  why: "산술 연산은 수학 시간에 배운 것과 같아요. 곱셈·나눗셈(*, /)을 덧셈·뺄셈(+, -)보다 먼저 해요. 그래서 SAL + COMM * 2는 왼쪽부터가 아니라 SAL + (COMM * 2)로 계산해요.\n\nNULL은 0이 아니라 '값을 모른다'는 뜻이에요. 모르는 값에 2를 곱해도 결과를 알 수 없어요. 거기에 200을 더해도 여전히 알 수 없어요.\n\n**그래서 계산식에 NULL이 하나라도 끼면 결과는 NULL이에요.** 반면 0은 '확실히 0'이라는 값이라서 정상적으로 계산돼요.\n\n행마다 대입해 볼게요. A는 100 + 50 × 2 = 200이에요. B는 200 + NULL × 2라서 NULL이에요. C는 300 + 0 × 2 = 300이에요.\n\n그래서 답은 200, NULL, 300이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT ENAME,\n       SAL + COMM * 2 AS V   -- ② 행마다 COMM * 2를 먼저, 그다음 SAL을 더해요 (NULL이 끼면 NULL)\n  FROM EMP                   -- ① EMP 3행을 읽어요\n ORDER BY ENAME;             -- ③ A, B, C 순으로 정렬해요" },
    { t: "[원본] EMP", tb: { c: ["ENAME","SAL","COMM"], r: [["A",100,50],["B",200,null],["C",300,0]] } },
    { t: "1단계: 곱셈(COMM * 2) 먼저", tb: { c: ["ENAME","COMM * 2"], r: [["A",100],["B",null],["C",0]] } },
    { t: "2단계: SAL + (COMM * 2)", tb: { c: ["ENAME","식","V"], r: [["A","100 + 100",200],["B","200 + NULL",null],["C","300 + 0",300]], hl: [1] } },
    { t: "의도대로 쓰려면: 비어 있는 COMM을 0으로 보고 계산", n: "SELECT ENAME,\n       SAL + NVL(COMM, 0) * 2 AS V   -- NULL을 0으로 바꾼 뒤 계산해요\n  FROM EMP\n ORDER BY ENAME;   -- A 200, B 200, C 300\n-- 덧셈을 먼저 하고 싶으면 괄호: (SAL + COMM) * 2 → A 300, B NULL, C 600" }
  ],
  res: { c: ["ENAME", "V"], r: [["A", 200], ["B", null], ["C", 300]] },
  pg: "SELECT ENAME, SAL + COMM * 2 AS V FROM EMP ORDER BY ENAME",
  ox: ["정답이에요. 곱셈을 먼저 하고, NULL이 낀 B만 NULL이에요.","이렇게 생각하면 틀려요: '왼쪽부터 차례로 (SAL + COMM) × 2를 한다.' 곱셈이 먼저예요. 이 값을 원하면 괄호를 쳐야 해요.","이렇게 생각하면 틀려요: '비어 있는 COMM은 0이니까 B는 200이다.' NULL은 0이 아니라 모르는 값이라 결과도 NULL이에요. 0으로 보려면 NVL을 써야 해요.","이렇게 생각하면 틀려요: '덧셈부터 하고, NULL은 0으로 친다.' 계산 순서와 NULL 처리를 둘 다 잘못 봤어요."],
  trap: "NULL을 0으로 계산하고 싶으면 NVL(COMM, 0)처럼 직접 바꿔 줘야 해요. 그냥 두면 결과 전체가 NULL이 돼요.",
  memo: "* / 먼저, + - 나중 / NULL이 끼면 계산 결과도 NULL"
},
{
  id: "S70", s: 2, tp: "fn", lv: 3, sub: "함수",
  th: "2과목 | 날짜 함수 ADD_MONTHS · LAST_DAY · MONTHS_BETWEEN",
  q: "다음 SQL의 결과로 옳은 것은? (Oracle 기준)",
  sql: "SELECT TO_CHAR(ADD_MONTHS(DATE '2024-01-31', 1), 'YYYY-MM-DD') AS C1,\n       TO_CHAR(LAST_DAY(DATE '2024-02-10'), 'YYYY-MM-DD')     AS C2,\n       MONTHS_BETWEEN(DATE '2024-03-31', DATE '2024-02-29')  AS C3\n  FROM DUAL;",
  o: ["2024-02-29, 2024-02-29, 1", "2024-03-02, 2024-02-29, 1", "2024-02-29, 2024-02-28, 1", "2024-02-29, 2024-02-29, 1.0645…"],
  a: 0,
  sum: "2월에는 31일이 없으니 1월 31일의 한 달 뒤는 2월 말일(2024년은 29일)이에요. 3월 31일과 2월 29일은 둘 다 말일이라 차이가 딱 1개월이에요.",
  why: "달마다 날짜 수가 달라서, Oracle의 날짜 함수는 '월'을 계산할 때 정해 둔 규칙을 따라요.\n\nADD_MONTHS(날짜, n)은 n개월 뒤의 같은 일을 돌려줘요. 그런데 그 달에 그 일이 없거나, 원래 날짜가 말일이면 그 달의 말일을 돌려줘요. 넘치는 날을 다음 달로 넘겨 버리면 '한 달 뒤'가 두 달 뒤가 되어 버리기 때문이에요.\n\nLAST_DAY(날짜)는 그 날짜가 속한 달의 마지막 날을 돌려줘요.\n\n**MONTHS_BETWEEN은 두 날짜의 '일'이 같거나 둘 다 말일이면 딱 떨어지는 정수를 돌려줘요.** 그렇지 않으면 한 달을 31일로 보고 남는 날을 소수로 붙여요.\n\n이 문제에 대입해 볼게요. 1월 31일의 한 달 뒤는 2월 31일인데, 그런 날이 없어요. 2024년은 윤년이라 2월 말일인 29일이 돼요. 2월 10일의 LAST_DAY는 2월 29일이에요. 3월 31일과 2월 29일은 둘 다 말일이라 정확히 1이에요.\n\n그래서 답은 2024-02-29, 2024-02-29, 1이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT TO_CHAR(ADD_MONTHS(DATE '2024-01-31', 1), 'YYYY-MM-DD') AS C1,  -- ② 1/31의 한 달 뒤 → 2/31이 없으니 2월 말일 2024-02-29\n       TO_CHAR(LAST_DAY(DATE '2024-02-10'), 'YYYY-MM-DD')     AS C2,  -- ③ 2/10이 속한 달의 마지막 날 → 2024-02-29\n       MONTHS_BETWEEN(DATE '2024-03-31', DATE '2024-02-29')  AS C3   -- ④ 둘 다 말일 → 정수 1\n  FROM DUAL;   -- ① 한 행짜리 연습용 테이블" },
    { t: "1단계: ADD_MONTHS(DATE '2024-01-31', 1)", n: "2024-02-31은 없는 날이에요 → 2월의 마지막 날 2024-02-29 (2024년은 윤년)" },
    { t: "2단계: LAST_DAY(DATE '2024-02-10')", n: "2024년 2월의 마지막 날 → 2024-02-29" },
    { t: "3단계: MONTHS_BETWEEN 규칙", tb: { c: ["경우","계산"], r: [["두 날짜의 '일'이 같음","정수 개월 수"],["둘 다 그 달의 말일","정수 개월 수"],["그 밖의 경우","개월 수 + (일 차이 ÷ 31)"]], hl: [1] }, n: "3/31과 2/29는 둘 다 말일이에요 → 1" },
    { t: "비교: 입력이 조금 다르면", n: "SELECT ADD_MONTHS(DATE '2024-02-29', 1) FROM DUAL;                      -- 2024-03-31: 원래 날짜가 말일이면 결과도 말일\nSELECT MONTHS_BETWEEN(DATE '2024-03-30', DATE '2024-02-29') FROM DUAL;  -- 1.0322…: 일이 다르고 3/30은 말일이 아님 → 1 + (30 − 29) ÷ 31\nSELECT MONTHS_BETWEEN(DATE '2024-02-29', DATE '2024-03-31') FROM DUAL;  -- -1: 앞 날짜가 더 이르면 음수" }
  ],
  res: { c: ["C1", "C2", "C3"], r: [["2024-02-29", "2024-02-29", 1]] },
  pg: "WITH D AS (SELECT DATE '2024-03-31' D1, DATE '2024-02-29' D2) SELECT TO_CHAR(DATE '2024-01-31' + INTERVAL '1 month', 'YYYY-MM-DD'), TO_CHAR(DATE_TRUNC('month', DATE '2024-02-10') + INTERVAL '1 month - 1 day', 'YYYY-MM-DD'), CASE WHEN EXTRACT(DAY FROM D1) = EXTRACT(DAY FROM D2) OR (D1 = (DATE_TRUNC('month', D1) + INTERVAL '1 month - 1 day')::date AND D2 = (DATE_TRUNC('month', D2) + INTERVAL '1 month - 1 day')::date) THEN (EXTRACT(YEAR FROM D1) - EXTRACT(YEAR FROM D2)) * 12 + EXTRACT(MONTH FROM D1) - EXTRACT(MONTH FROM D2) ELSE (EXTRACT(YEAR FROM D1) - EXTRACT(YEAR FROM D2)) * 12 + EXTRACT(MONTH FROM D1) - EXTRACT(MONTH FROM D2) + (EXTRACT(DAY FROM D1) - EXTRACT(DAY FROM D2)) / 31 END FROM D",
  ox: ["정답이에요. 없는 날은 말일로 맞추고, 둘 다 말일이면 정수 1이에요.","이렇게 생각하면 틀려요: '2월 31일은 없으니 넘치는 이틀을 3월로 넘긴다.' ADD_MONTHS는 그 달 안에서 말일로 멈춰요.","이렇게 생각하면 틀려요: '2월은 항상 28일까지다.' 2024년은 윤년이라 2월 29일까지 있어요.","이렇게 생각하면 틀려요: '1개월 + (31 − 29)일 ÷ 31로 계산한다.' 두 날짜가 둘 다 말일이면 소수 없이 딱 1이에요."],
  trap: "ADD_MONTHS는 원래 날짜가 말일이면 결과도 말일로 맞춰요. 예를 들어 ADD_MONTHS(DATE '2024-02-29', 1)은 3월 29일이 아니라 3월 31일이에요.",
  memo: "ADD_MONTHS = 없는 날이면 말일 / MONTHS_BETWEEN = 같은 일이거나 둘 다 말일이면 정수"
},
{
  id: "S71", s: 2, tp: "fn", lv: 2, sub: "함수",
  th: "2과목 | 문자형 컬럼과 숫자 비교 — 암시적 형변환",
  q: "C 컬럼이 VARCHAR2 타입인 다음 [T] 테이블에 대해 (가), (나) SQL의 결과 건수로 옳은 것은? (Oracle 기준)",
  tb: [{ n: "T", c: ["ID", "C"], r: [[1, "5"], [2, "10"], [3, "90"], [4, "100"], [5, "9"]] }],
  sql: "(가) SELECT COUNT(*) FROM T WHERE C > '9';\n(나) SELECT COUNT(*) FROM T WHERE C > 9;",
  o: ["0, 3", "3, 3", "1, 1", "1, 3"],
  a: 3,
  sum: "(가)는 글자끼리 비교라서 사전 순서로 비교해요. (나)는 숫자와 비교라서 C를 숫자로 바꾼 뒤 크기로 비교해요.",
  why: "C는 글자(문자) 컬럼이에요. 그래서 무엇과 비교하느냐에 따라 비교 방식이 달라져요.\n\n(가)의 '9'는 따옴표가 있으니 글자예요. 글자끼리는 사전처럼 첫 글자부터 하나씩 비교해요. 그래서 '10'은 첫 글자 '1'이 '9'보다 앞이라 '9'보다 작다고 봐요.\n\n(나)의 9는 따옴표가 없으니 숫자예요. 글자와 숫자를 비교하면 Oracle은 글자 쪽을 숫자로 바꿔서 비교해요. 숫자를 글자로 바꾸면 '10' < '9'처럼 크기가 뒤집히니까, 숫자 뜻을 살리는 쪽으로 정해 둔 거예요.\n\n**같은 C > 9라도 오른쪽이 '9'(글자)인지 9(숫자)인지에 따라 비교 방식이 통째로 바뀌어요.**\n\n(가)를 대입해 볼게요. '5'·'10'·'100'은 첫 글자가 '9'보다 앞이라 탈락이에요. '9'는 같아서 탈락이에요. '90'은 첫 글자가 같고 더 길어서 통과해요. 그래서 1건이에요.\n\n(나)를 대입해 볼게요. 숫자로 바꾸면 5, 10, 90, 100, 9예요. 9보다 큰 10, 90, 100이 통과해서 3건이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- (가) 글자 vs 글자\nSELECT COUNT(*)   -- ③ 통과한 행 수 → 1\n  FROM T          -- ① 5행을 읽어요\n WHERE C > '9';   -- ② 사전 순서 비교: '90'만 통과\n-- (나) 글자 vs 숫자\nSELECT COUNT(*)   -- ③ → 3\n  FROM T          -- ①\n WHERE C > 9;     -- ② Oracle이 TO_NUMBER(C) > 9로 바꿔 숫자 비교: 10, 90, 100" },
    { t: "[원본] T", tb: { c: ["ID","C (문자)"], r: [[1,"5"],[2,"10"],[3,"90"],[4,"100"],[5,"9"]] } },
    { t: "1단계: (가) 글자 비교 C > '9'", tb: { c: ["C","첫 글자 비교","결과"], r: [["5","'5' < '9'","FALSE"],["10","'1' < '9'","FALSE"],["90","'9' = '9', 더 김","TRUE"],["100","'1' < '9'","FALSE"],["9","같음","FALSE"]], hl: [2] }, n: "1건" },
    { t: "2단계: (나) 숫자로 바꿔 비교 TO_NUMBER(C) > 9", tb: { c: ["TO_NUMBER(C)","> 9"], r: [[5,"FALSE"],[10,"TRUE"],[90,"TRUE"],[100,"TRUE"],[9,"FALSE"]], hl: [1,2,3] }, n: "3건" },
    { t: "의도대로 쓰려면: 숫자 비교를 직접 적기", n: "SELECT COUNT(*) FROM T WHERE TO_NUMBER(C) > 9;   -- 3: 숫자로 바꾼다는 걸 눈에 보이게 적어요\n-- 가장 좋은 방법: 숫자를 담을 컬럼은 처음부터 NUMBER 타입으로 만들어요" }
  ],
  res: { c: ["가", "나"], r: [[1, 3]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE C > '9'), (SELECT COUNT(*) FROM T WHERE CAST(C AS numeric) > 9)",
  ox: ["이렇게 생각하면 틀려요: ''90'과 '9'는 앞이 같으니 같은 값이다.' 앞이 같으면 더 긴 쪽이 커요.", "이렇게 생각하면 틀려요: '(가)도 숫자 크기로 비교한다.' '9'는 따옴표가 있어 글자라서 사전 순서로 비교해요. '10'은 '9'보다 작다고 봐요.", "이렇게 생각하면 틀려요: '(나)도 글자 비교다.' 숫자와 비교하면 Oracle이 글자 쪽을 숫자로 바꿔요.", "정답이에요. 글자 비교는 '90' 하나, 숫자 비교는 10·90·100 세 개예요."],
  trap: "(나)에서 C에 'ABC'처럼 숫자로 바꿀 수 없는 값이 하나라도 있으면 ORA-01722(수치가 부적합합니다) 오류가 나요. 또 컬럼 쪽이 바뀌기 때문에 C 컬럼의 인덱스를 쓰지 못해요.",
  memo: "글자 vs 숫자 → 글자를 숫자로 바꿈 / 글자 vs 글자 → 사전 순서"
},
{
  id: "S72", s: 2, tp: "fn", lv: 2, sub: "함수",
  th: "2과목 | MOD · SIGN과 음수, DECODE",
  q: "다음 SQL의 결과로 옳은 것은?",
  sql: "SELECT MOD(-7, 3)  AS C1,\n       MOD(7, -3)  AS C2,\n       SIGN(-0.5)  AS C3,\n       DECODE(SIGN(MOD(-7, 3)), -1, 'NEG', 0, 'ZERO', 'POS') AS C4\n  FROM DUAL;",
  o: ["-1, 1, -0.5, NEG", "2, -2, -1, POS", "1, 1, -1, POS", "-1, 1, -1, NEG"],
  a: 3,
  sum: "Oracle의 MOD는 나머지의 부호가 앞 숫자(나누어지는 수)를 따라가요. SIGN은 음수면 -1만 돌려주니 DECODE는 'NEG'예요.",
  why: "Oracle의 MOD(m, n)은 m − n × TRUNC(m ÷ n)으로 계산해요. TRUNC는 소수점 아래를 0 쪽으로 잘라내는 함수예요. 예를 들어 TRUNC(-2.33)은 -2예요.\n\n몫을 0 쪽으로 자르니까 몫의 크기(절댓값)가 실제 나눗셈 값보다 커지지 않아요. **그래서 나머지의 부호는 항상 앞 숫자 m의 부호를 따라가요.** C·Java의 % 연산도 이 방식이에요. 반면 파이썬의 %는 몫을 아래로 내려(FLOOR) 나머지가 뒤 숫자 n의 부호를 따라가요.\n\n이 문제에 대입해 볼게요. MOD(-7, 3)은 몫이 TRUNC(-2.33) = -2라서 -7 − 3 × (-2) = -1이에요. MOD(7, -3)도 몫이 -2라서 7 − (-3) × (-2) = 1이에요.\n\nSIGN은 크기는 버리고 부호만 알려 줘요. 음수면 -1, 0이면 0, 양수면 1이에요. 그래서 SIGN(-0.5)는 -1이에요.\n\nC4는 SIGN(MOD(-7, 3)) = SIGN(-1) = -1이에요. DECODE는 첫 비교값 -1과 같으니 'NEG'를 돌려줘요. 답은 -1, 1, -1, NEG예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT MOD(-7, 3)  AS C1,   -- ② -7 − 3 × TRUNC(-2.33) = -7 + 6 = -1\n       MOD(7, -3)  AS C2,   -- ③ 7 − (-3) × TRUNC(-2.33) = 7 − 6 = 1\n       SIGN(-0.5)  AS C3,   -- ④ 음수 → -1\n       DECODE(SIGN(MOD(-7, 3)), -1, 'NEG', 0, 'ZERO', 'POS') AS C4  -- ⑤ SIGN(-1) = -1 → 'NEG'\n  FROM DUAL;                -- ① 한 행짜리 연습용 테이블" },
    { t: "1단계: MOD 계산 (몫은 0 쪽으로 자름)", tb: { c: ["식","TRUNC(m ÷ n)","m − n × 몫","결과"], r: [["MOD(-7, 3)",-2,"-7 − (-6)",-1],["MOD(7, -3)",-2,"7 − 6",1]] } },
    { t: "2단계: SIGN과 DECODE", tb: { c: ["식","결과"], r: [["SIGN(-0.5)",-1],["SIGN(MOD(-7, 3)) = SIGN(-1)",-1],["DECODE(-1, -1, 'NEG', 0, 'ZERO', 'POS')","NEG"]] } },
    { t: "비교: 몫을 아래로 내리면(파이썬 방식) 보기 ②가 나와요", n: "SELECT -7 - 3 * FLOOR(-7 / 3) FROM DUAL;     -- -7 − 3 × (-3) = 2\nSELECT 7 - (-3) * FLOOR(7 / -3) FROM DUAL;   -- 7 − (-3) × (-3) = -2\n-- Oracle MOD는 FLOOR가 아니라 TRUNC를 쓰기 때문에 -1, 1이 나와요" }
  ],
  res: { c: ["C1", "C2", "C3", "C4"], r: [[-1, 1, -1, "NEG"]] },
  pg: "SELECT MOD(-7, 3), MOD(7, -3), SIGN(-0.5), CASE SIGN(MOD(-7, 3)) WHEN -1 THEN 'NEG' WHEN 0 THEN 'ZERO' ELSE 'POS' END",
  ox: ["이렇게 생각하면 틀려요: 'SIGN은 값을 그대로 돌려준다.' SIGN은 부호만 알려 줘서 -1·0·1 중 하나예요.", "이렇게 생각하면 틀려요: '나머지는 뒤 숫자(나누는 수)의 부호를 따른다.' 파이썬 % 방식이에요. Oracle MOD는 앞 숫자의 부호를 따라가요.", "이렇게 생각하면 틀려요: '부호는 떼고 7 ÷ 3의 나머지 1만 구한다.' 그러면 C4도 SIGN(1) = 1이라 POS가 돼요.", "정답이에요. 나머지는 앞 숫자의 부호를 따라가고, SIGN은 -1·0·1만 돌려줘요."],
  trap: "Oracle에는 MOD와 비슷한 REMAINDER 함수도 있어요. REMAINDER는 몫을 반올림(ROUND)해서 값이 다를 수 있어요. SQLD에서는 MOD만 기억하면 돼요.",
  memo: "MOD 부호 = 앞 숫자(m)의 부호 / SIGN = -1, 0, 1"
},
{
  id: "S73", s: 2, tp: "basic", lv: 2, sub: "WHERE 절",
  th: "2과목 | BETWEEN의 경계값 · 범위 순서 · NOT BETWEEN과 NULL",
  q: "다음 [T] 테이블에 대해 (가)~(다) SQL의 결과 건수로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "SAL"], r: [[1, 100], [2, 200], [3, 300], [4, null], [5, 400]] }],
  sql: "(가) SELECT COUNT(*) FROM T WHERE SAL BETWEEN 100 AND 300;\n(나) SELECT COUNT(*) FROM T WHERE SAL BETWEEN 300 AND 100;\n(다) SELECT COUNT(*) FROM T WHERE SAL NOT BETWEEN 100 AND 300;",
  o: ["3, 0, 2", "3, 3, 1", "3, 0, 1", "1, 0, 3"],
  a: 2,
  sum: "BETWEEN은 '작은 값 이상 그리고 큰 값 이하'의 줄임말이라 양 끝을 포함하고, 순서를 바꿔 주지 않아요. 비어 있는(NULL) 행은 어느 쪽에도 안 나와요.",
  why: "A BETWEEN x AND y는 새로운 비교가 아니라 A >= x AND A <= y를 짧게 쓴 거예요. 그래서 양 끝값을 포함해요. 그리고 x와 y를 알아서 바꿔 주지 않아요.\n\n(나)처럼 큰 값을 앞에 쓰면 SAL >= 300 그리고 SAL <= 100이 돼요. 이 둘을 동시에 만족하는 숫자는 없어요. 오류는 안 나고 조용히 0건이 나와요.\n\nNOT BETWEEN은 그 반대라서 SAL < 100 또는 SAL > 300이에요.\n\nNULL과 비교하면 결과가 '모름'이 돼요. WHERE는 확실히 맞는(TRUE) 행만 내보내요. **그래서 비어 있는 행은 BETWEEN에도, NOT BETWEEN에도 걸리지 않아요.**\n\n행마다 대입해 볼게요. (가)는 100·200·300이 범위 안이라 3건이에요. (나)는 어떤 행도 만족하지 못해 0건이에요. (다)는 400만 300보다 커서 1건이에요. ID 4는 SAL이 비어 있어서 세 쪽 모두에서 빠져요.\n\n그래서 답은 3, 0, 1이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- (가) SAL >= 100 AND SAL <= 300\nSELECT COUNT(*) FROM T WHERE SAL BETWEEN 100 AND 300;      -- 100, 200, 300 → 3\n-- (나) SAL >= 300 AND SAL <= 100: 동시에 만족하는 수가 없어요\nSELECT COUNT(*) FROM T WHERE SAL BETWEEN 300 AND 100;      -- 0 (오류는 안 나요)\n-- (다) SAL < 100 OR SAL > 300\nSELECT COUNT(*) FROM T WHERE SAL NOT BETWEEN 100 AND 300;  -- 400 → 1 (비어 있는 행은 '모름'이라 빠져요)" },
    { t: "[원본] T", tb: { c: ["ID","SAL"], r: [[1,100],[2,200],[3,300],[4,null],[5,400]] } },
    { t: "1단계: 조건을 풀어 쓰기", tb: { c: ["SQL","풀어 쓴 조건"], r: [["(가)","SAL >= 100 AND SAL <= 300"],["(나)","SAL >= 300 AND SAL <= 100"],["(다)","SAL < 100 OR SAL > 300"]] } },
    { t: "2단계: 행마다 판정", tb: { c: ["SAL","(가)","(나)","(다)"], r: [[100,"TRUE","FALSE","FALSE"],[200,"TRUE","FALSE","FALSE"],[300,"TRUE","FALSE","FALSE"],[null,"모름","모름","모름"],[400,"FALSE","FALSE","TRUE"]], hl: [3] }, n: "(가) 3건, (나) 0건, (다) 1건. NULL 행은 세 쪽 모두 '모름'이라 빠져요." },
    { t: "의도대로 쓰려면", n: "-- 범위는 작은 값을 앞에 써요\nSELECT COUNT(*) FROM T WHERE SAL BETWEEN 100 AND 300;                     -- 3\n-- 범위 밖 + 값이 비어 있는 행까지 세려면 NULL을 따로 더해요\nSELECT COUNT(*) FROM T WHERE SAL NOT BETWEEN 100 AND 300 OR SAL IS NULL;  -- 2 (400, NULL)" }
  ],
  res: { c: ["가", "나", "다"], r: [[3, 0, 1]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE SAL BETWEEN 100 AND 300), (SELECT COUNT(*) FROM T WHERE SAL BETWEEN 300 AND 100), (SELECT COUNT(*) FROM T WHERE SAL NOT BETWEEN 100 AND 300)",
  ox: ["이렇게 생각하면 틀려요: 'BETWEEN에 안 걸린 행은 전부 NOT BETWEEN에 걸린다.' 비어 있는 행은 양쪽 모두 '모름'이라 빠져요.", "이렇게 생각하면 틀려요: 'BETWEEN 300 AND 100도 알아서 100~300으로 읽는다.' 쓴 그대로 SAL >= 300 AND SAL <= 100이라 0건이에요.", "정답이에요. 양 끝 포함 3건, 순서가 뒤집혀 0건, 범위 밖 1건이에요.", "이렇게 생각하면 틀려요: 'BETWEEN은 양 끝값을 빼고 센다.' 그러면 (가)는 200 하나, (다)는 100·300·400 셋이 돼요. BETWEEN은 양 끝을 포함해요."],
  trap: "'(가) 건수 + (다) 건수 = 전체 행 수'라고 생각하기 쉬워요. NULL 행은 양쪽에서 모두 빠져서 3 + 1 = 4로, 전체 5행보다 적어요.",
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
  sum: "①②③은 모두 'A가 아니다'라는 같은 뜻이라 비어 있는 행이 빠져 2건이에요. ④만 비어 있는 행까지 3건이 나와요.",
  why: "<>, !=, ^=는 모양만 다르고 모두 '같지 않다'는 뜻이에요. NOT COL = 'A'도 NOT (COL = 'A')로 읽히니까 같은 뜻이에요.\n\nCOL이 비어 있는(NULL) 행에서 COL = 'A'를 물으면 DB는 '모름'이라고 답해요. 모르는 것에 NOT을 붙여도 여전히 '모름'이에요. WHERE는 확실히 맞는 행만 내보내니, ①②③에서 NULL 행은 빠져요. 그래서 B, C의 2건이에요.\n\n④는 괄호 안이 AND예요. AND는 한쪽이 확실히 거짓이면 다른 쪽이 '모름'이어도 결과가 거짓으로 정해져요. NULL 행에서 COL IS NOT NULL은 확실히 거짓이에요. IS NULL 계열 검사는 '모름'을 만들지 않고 참·거짓으로만 답하기 때문이에요.\n\n그래서 NULL 행에서 괄호 안은 '모름 AND 거짓 = 거짓'이에요. 여기에 NOT을 붙이면 참이 돼요. **IS NOT NULL이 '모름'을 거짓으로 굳혀 주고, NOT이 그걸 참으로 뒤집어서 NULL 행이 살아남아요.**\n\nA가 아닌 B, C 행은 ④에서도 통과해요. 그래서 ④는 B, NULL, C의 3건이고, 나머지 셋과 달라요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT COUNT(*) FROM T WHERE COL <> 'A';       -- ① NULL 행은 '모름'이라 빠져요 → B, C = 2\nSELECT COUNT(*) FROM T WHERE NOT COL = 'A';    -- ② NOT (COL = 'A'): '모름'에 NOT을 붙여도 '모름' → 2\nSELECT COUNT(*) FROM T WHERE COL ^= 'A';       -- ③ ^= 는 Oracle에서 <>와 같은 뜻 → 2\nSELECT COUNT(*) FROM T WHERE NOT (COL = 'A' AND COL IS NOT NULL);\n                                               -- ④ NULL 행: NOT (모름 AND 거짓) = NOT 거짓 = 참 → 3" },
    { t: "[원본] T", tb: { c: ["ID","COL"], r: [[1,"A"],[2,"B"],[3,null],[4,"C"],[5,"A"]] } },
    { t: "1단계: ①~③ 판정 (COL <> 'A')", tb: { c: ["COL","COL <> 'A'"], r: [["A","FALSE"],["B","TRUE"],[null,"모름"],["C","TRUE"],["A","FALSE"]], hl: [2] }, n: "2건" },
    { t: "2단계: ④ 판정", tb: { c: ["COL","COL = 'A'","IS NOT NULL","AND","NOT"], r: [["A","TRUE","TRUE","TRUE","FALSE"],["B","FALSE","TRUE","FALSE","TRUE"],[null,"모름","FALSE","FALSE","TRUE"],["C","FALSE","TRUE","FALSE","TRUE"],["A","TRUE","TRUE","TRUE","FALSE"]], hl: [2] }, n: "3건. NULL 행에서 '모름 AND 거짓'은 거짓이고, NOT이 참으로 뒤집어요." },
    { t: "의도대로 쓰려면: 'A가 아닌 행 + 비어 있는 행' 세기", n: "SELECT COUNT(*) FROM T WHERE COL <> 'A' OR COL IS NULL;   -- 3 (B, NULL, C)\nSELECT COUNT(*) FROM T WHERE NVL(COL, 'X') <> 'A';       -- 3 (NULL을 'X'로 바꿔서 비교)" }
  ],
  res: { c: ["①", "②", "③", "④"], r: [[2, 2, 2, 3]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE COL <> 'A'), (SELECT COUNT(*) FROM T WHERE NOT COL = 'A'), (SELECT COUNT(*) FROM T WHERE COL != 'A'), (SELECT COUNT(*) FROM T WHERE NOT (COL = 'A' AND COL IS NOT NULL))",
  ox: ["2건이라 답이 아니에요. <>는 비어 있는 행에서 '모름'이 되어 빠져요.","2건이라 답이 아니에요. NOT COL = 'A'는 NOT (COL = 'A')이고, '모름'에 NOT을 붙여도 '모름'이에요.","2건이라 답이 아니에요. ^=는 Oracle에서 <>, !=와 같은 '같지 않다'예요. 처음 보는 기호라고 다른 결과로 보면 틀려요.","정답이에요. 비어 있는 행에서 '모름 AND 거짓'이 거짓이 되고, NOT이 이를 참으로 뒤집어서 3건이에요."],
  trap: "검증용 PostgreSQL에는 ^= 연산자가 없어서 같은 뜻의 !=로 바꿔 실행했어요. 결과는 Oracle과 같아요.",
  memo: "<> = != = ^= / '모름' AND 거짓 = 거짓"
},
{
  id: "S75", s: 2, tp: "basic", lv: 2, sub: "WHERE 절",
  th: "2과목 | LIKE 패턴의 위치 해석 (_ 와 %)",
  q: "다음 [T] 테이블에 대해 (가)~(다) SQL의 결과 건수로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "NAME"], r: [[1, "A"], [2, "AB"], [3, "BA"], [4, "BAB"], [5, "ABA"], [6, null]] }],
  sql: "(가) SELECT COUNT(*) FROM T WHERE NAME LIKE '_A%';\n(나) SELECT COUNT(*) FROM T WHERE NAME LIKE '%A_';\n(다) SELECT COUNT(*) FROM T WHERE NAME LIKE '%A%';",
  o: ["5, 5, 5", "2, 2, 5", "2, 3, 5", "2, 2, 6"],
  a: 1,
  sum: "_는 꼭 한 글자, %는 몇 글자든(0글자도) 돼요. LIKE는 글자 전체가 패턴과 처음부터 끝까지 맞아야 해서 (가) 2건, (나) 2건, (다) 5건이에요.",
  why: "LIKE의 기호는 두 가지예요. _는 '아무 글자 딱 한 개', %는 '아무 글자 0개 이상'이에요.\n\n**LIKE는 글자 속에서 패턴을 찾는 게 아니라, 패턴이 글자 전체와 처음부터 끝까지 맞아떨어져야 통과해요.** 그래서 패턴의 앞과 끝이 어디에 붙는지가 중요해요.\n\n'_A%'는 '한 글자 + A + 나머지 아무거나'예요. 즉 두 번째 글자가 A여야 해요. '%A_'는 '아무거나 + A + 딱 한 글자로 끝'이에요. 즉 끝에서 두 번째 글자가 A여야 해요. '%A%'는 A가 어디든 하나만 있으면 돼요.\n\n행마다 대입해 볼게요. (가)는 두 번째 글자가 A인 BA, BAB가 통과해 2건이에요. (나)는 끝에서 두 번째가 A인 AB, BAB가 통과해 2건이에요. ABA는 끝에서 두 번째가 B라서 탈락이에요. (다)는 A가 든 다섯 행이 모두 통과해요.\n\nNAME이 비어 있는(NULL) 행은 LIKE로 비교해도 '모름'이라 어디에도 안 나와요. 그래서 답은 2, 2, 5예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT COUNT(*) FROM T WHERE NAME LIKE '_A%';  -- (가) [한 글자][A][아무거나] → 두 번째가 A: BA, BAB → 2\nSELECT COUNT(*) FROM T WHERE NAME LIKE '%A_';  -- (나) [아무거나][A][한 글자]로 끝 → AB, BAB → 2\nSELECT COUNT(*) FROM T WHERE NAME LIKE '%A%';  -- (다) A가 어디든 있으면 → NULL 빼고 5" },
    { t: "[원본] T", tb: { c: ["ID","NAME"], r: [[1,"A"],[2,"AB"],[3,"BA"],[4,"BAB"],[5,"ABA"],[6,null]] } },
    { t: "1단계: 패턴마다 판정", tb: { c: ["NAME","'_A%' (2번째 = A)","'%A_' (끝에서 2번째 = A)","'%A%' (A 포함)"], r: [["A","X","X","O"],["AB","X","O","O"],["BA","O","X","O"],["BAB","O","O","O"],["ABA","X","X","O"],[null,"모름","모름","모름"]] }, n: "(가) BA, BAB → 2 / (나) AB, BAB → 2 / (다) 5. NULL 행은 '모름'이라 빠져요." },
    { t: "자세히: ABA가 '%A_'에 안 맞는 이유", n: "-- '%A_'는 마지막 글자 하나를 _가 차지하고, 그 바로 앞이 A여야 해요\n--   ABA의 마지막 글자 = 'A'  → _ 자리\n--   그 바로 앞 글자   = 'B'  → A 자리인데 B라서 불일치\n-- 그래서 ABA는 '%A_'에 맞지 않아요" }
  ],
  res: { c: ["가", "나", "다"], r: [[2, 2, 5]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE NAME LIKE '_A%'), (SELECT COUNT(*) FROM T WHERE NAME LIKE '%A_'), (SELECT COUNT(*) FROM T WHERE NAME LIKE '%A%')",
  ox: ["이렇게 생각하면 틀려요: '_는 0글자일 수도 있다.' 그러면 (가)·(나)도 A만 있으면 통과해 5건씩이 돼요. _는 반드시 한 글자예요.", "정답이에요. 위치를 정확히 따지면 2, 2, 5예요.", "이렇게 생각하면 틀려요: ''%A_'는 A 뒤에 글자가 있기만 하면 된다.' 그러면 ABA까지 세게 돼요. '%A_'는 A 뒤에 딱 한 글자로 끝나야 해요.", "이렇게 생각하면 틀려요: '비어 있는 행도 %에 맞는다.' NULL은 LIKE로 비교해도 '모름'이라 빠져요."],
  trap: "ABA는 A로 끝나서 '%A_'에 맞지 않아요. 끝에서 두 번째 글자가 B이기 때문이에요.",
  memo: "_ = 딱 1글자, % = 0글자 이상 / LIKE는 글자 전체가 맞아야 함"
},
{
  id: "S76", s: 2, tp: "notin", lv: 1, sub: "WHERE 절",
  th: "2과목 | = NULL과 IS NULL, NVL 조건",
  q: "다음 [T] 테이블에 대해 (가)~(다) SQL의 결과 건수로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "COMM"], r: [[1, 100], [2, null], [3, 0], [4, null], [5, 200]] }],
  sql: "(가) SELECT COUNT(*) FROM T WHERE COMM = NULL;\n(나) SELECT COUNT(*) FROM T WHERE COMM IS NULL;\n(다) SELECT COUNT(*) FROM T WHERE NVL(COMM, 0) = 0;",
  o: ["0, 2, 1", "2, 2, 3", "0, 3, 3", "0, 2, 3"],
  a: 3,
  sum: "NULL과 = 로 비교하면 결과가 '모름'이 돼서 어떤 행도 안 나와요. 비어 있는지는 IS NULL로 물어야 해요.",
  why: "NULL은 값이 아니라 '값이 비어 있다, 모른다'는 상태예요. 모르는 것과 무엇을 비교해도 같은지 다른지 알 수 없어요. 그래서 = NULL은 상대가 NULL이어도 '모름'이에요.\n\n**WHERE는 확실히 맞는 행만 내보내니까, COMM = NULL은 모든 행에서 '모름'이 되어 오류 없이 0건이 나와요.**\n\n그래서 비어 있는지는 값 비교가 아니라 상태 검사인 IS NULL로 물어요. IS NULL은 '모름' 없이 참·거짓으로만 답해요.\n\n(다)의 NVL(COMM, 0)은 비교하기 전에 NULL을 0으로 바꿔 줘요. 그 뒤에 = 0을 비교하니 원래 비어 있던 행도 통과해요.\n\n행마다 대입해 볼게요. (가)는 모든 행이 '모름'이라 0건이에요. (나)는 ID 2, 4가 비어 있어서 2건이에요. (다)는 원래 0인 ID 3과, 0으로 바뀐 ID 2, 4가 통과해 3건이에요.\n\n그래서 답은 0, 2, 3이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT COUNT(*) FROM T WHERE COMM = NULL;        -- (가) 모든 행이 '모름' → 0 (오류는 안 나요)\nSELECT COUNT(*) FROM T WHERE COMM IS NULL;       -- (나) 비어 있는지 검사: ID 2, 4 → 2\nSELECT COUNT(*) FROM T WHERE NVL(COMM, 0) = 0;   -- (다) NULL을 0으로 바꾼 뒤 비교: ID 2, 3, 4 → 3" },
    { t: "[원본] T", tb: { c: ["ID","COMM"], r: [[1,100],[2,null],[3,0],[4,null],[5,200]] } },
    { t: "1단계: 행마다 판정", tb: { c: ["COMM","COMM = NULL","COMM IS NULL","NVL(COMM, 0)","= 0"], r: [[100,"모름","FALSE",100,"FALSE"],[null,"모름","TRUE",0,"TRUE"],[0,"모름","FALSE",0,"TRUE"],[null,"모름","TRUE",0,"TRUE"],[200,"모름","FALSE",200,"FALSE"]], hl: [1,2,3] }, n: "(가) 0건, (나) 2건, (다) 3건" },
    { t: "의도대로 쓰려면", n: "SELECT COUNT(*) FROM T WHERE COMM IS NULL;              -- 2: 비어 있는 행 찾기는 IS NULL\nSELECT COUNT(*) FROM T WHERE COMM IS NULL OR COMM = 0;  -- 3: (다)와 같은 결과를 함수 없이" }
  ],
  res: { c: ["가", "나", "다"], r: [[0, 2, 3]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE COMM = NULL), (SELECT COUNT(*) FROM T WHERE COMM IS NULL), (SELECT COUNT(*) FROM T WHERE COALESCE(COMM, 0) = 0)",
  ox: ["이렇게 생각하면 틀려요: 'NVL을 거쳐도 비어 있는 행은 0이 안 된다.' NVL(NULL, 0)은 0이라 ID 2, 4도 통과해요.", "이렇게 생각하면 틀려요: '= NULL도 IS NULL처럼 비어 있는 행을 찾아 준다.' = NULL은 상대가 NULL이어도 '모름'이라 0건이에요.", "이렇게 생각하면 틀려요: '0도 비어 있는 값이다.' 0은 확실한 값이라 IS NULL에 안 걸려요.", "정답이에요. = NULL은 0건, IS NULL은 2건, NVL을 거치면 3건이에요."],
  trap: "= NULL은 오류가 나지 않고 조용히 0건을 돌려줘요. 오류가 안 났다고 맞는 SQL은 아니에요.",
  memo: "비어 있는 행 찾기는 IS NULL / = NULL은 항상 0건"
},
{
  id: "S77", s: 2, tp: "notin", lv: 3, sub: "WHERE 절",
  th: "2과목 | NOT의 적용 범위와 3진 논리 OR",
  q: "다음 [T] 테이블에 대해 SQL을 실행했을 때 출력되는 ID를 모두 고른 것은?",
  tb: [{ n: "T", c: ["ID", "A", "B"], r: [[1, 5, "Y"], [2, 20, "N"], [3, null, "Y"], [4, null, "N"], [5, 15, null], [6, null, null], [7, 8, null]] }],
  sql: "SELECT ID\n  FROM T\n WHERE NOT A >= 10\n    OR B = 'Y'\n ORDER BY ID;",
  o: ["1, 3", "2", "1, 3, 7", "1, 3, 4, 6, 7"],
  a: 2,
  sum: "NOT은 바로 뒤의 A >= 10에만 붙어요. A가 비어 있는 행은 NOT을 붙여도 '모름'이라, B = 'Y'가 맞지 않으면 안 나와요. 그래서 1, 3, 7이에요.",
  why: "연산자는 비교(>=, =) → NOT → AND → OR 순서로 묶여요. 그래서 NOT은 바로 뒤의 A >= 10 하나에만 붙어요. 조건 전체는 (NOT A >= 10) OR (B = 'Y')예요.\n\nNULL과 비교하면 결과가 '모름'이에요. NOT은 참과 거짓만 뒤집어요. **'모름'에 NOT을 붙여도 여전히 '모름'이라, A가 비어 있는 행은 NOT A >= 10을 통과하지 못해요.**\n\nOR는 한쪽만 확실히 맞으면 전체가 맞아요. 하지만 '거짓 OR 모름'은 '모름'이에요. WHERE는 확실히 맞는 행만 내보내요.\n\n행마다 대입해 볼게요. 1은 A=5라 NOT A >= 10이 참이고, B도 Y라 통과해요. 2는 A=20, B=N이라 둘 다 거짓이에요. 3은 A가 비어 '모름'이지만 B=Y라 통과해요. 4는 '모름 OR 거짓'이라 '모름'이에요. 5는 A=15라 거짓, B가 비어 '모름'이라 '모름'이에요. 6은 둘 다 '모름'이에요. 7은 A=8이라 참이니 B와 상관없이 통과해요.\n\n그래서 답은 1, 3, 7이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT ID              -- ③ 남은 행의 ID\n  FROM T               -- ① 7행을 읽어요\n WHERE NOT A >= 10     -- ② (NOT (A >= 10))   … A가 비어 있으면 '모름'\n    OR B = 'Y'         --    OR (B = 'Y')       … 확실히 맞는 행만 통과: 1, 3, 7\n ORDER BY ID;          -- ④ ID 순서로" },
    { t: "[원본] T", tb: { c: ["ID","A","B"], r: [[1,5,"Y"],[2,20,"N"],[3,null,"Y"],[4,null,"N"],[5,15,null],[6,null,null],[7,8,null]] } },
    { t: "1단계: 조건마다 평가", tb: { c: ["ID","NOT A >= 10","B = 'Y'","OR 결과"], r: [[1,"TRUE","TRUE","TRUE"],[2,"FALSE","FALSE","FALSE"],[3,"모름","TRUE","TRUE"],[4,"모름","FALSE","모름"],[5,"FALSE","모름","모름"],[6,"모름","모름","모름"],[7,"TRUE","모름","TRUE"]], hl: [0,2,6] }, n: "확실히 맞는(TRUE) 행: 1, 3, 7" },
    { t: "비교: NOT을 조건 전체에 걸면", n: "SELECT ID\n  FROM T\n WHERE NOT (A >= 10 OR B = 'Y')   -- 1·2·3·5: 괄호 안이 참 → NOT으로 거짓\n ORDER BY ID;                      -- 4·6·7: 괄호 안이 '모름' → 그대로 '모름'\n-- 결과 0건: 확실히 맞는 행이 하나도 없어요" }
  ],
  res: { c: ["ID"], r: [[1], [3], [7]] },
  pg: "SELECT ID FROM T WHERE NOT A >= 10 OR B = 'Y' ORDER BY ID",
  ox: ["이렇게 생각하면 틀려요: '참 OR 모름은 모름이다.' OR는 한쪽만 확실히 맞으면 맞아서 7번도 통과해요.", "이렇게 생각하면 틀려요: 'WHERE 조건 전체를 NOT이 뒤집는다.' 그러면 원래 거짓이던 2만 남지만, NOT은 바로 뒤의 A >= 10에만 붙어요. (괄호로 NOT (A >= 10 OR B = 'Y')라고 써도 결과는 0건이에요.)", "정답이에요. 1·7은 NOT A >= 10이 참, 3은 B = 'Y'가 참이라 통과해요.", "이렇게 생각하면 틀려요: 'A가 비어 있으면 A >= 10은 거짓이고, NOT을 붙이면 참이다.' 비어 있는 값과의 비교는 '모름'이고, NOT을 붙여도 '모름'이라 4·6번은 빠져요."],
  trap: "NULL을 거짓처럼 다루면 NOT이 붙는 순간 참으로 뒤집혀 오답이 돼요. '모름'은 NOT을 붙여도 '모름'이에요.",
  memo: "비교 > NOT > AND > OR / 참 OR 모름 = 참 / NOT 모름 = 모름"
},
{
  id: "S78", s: 2, tp: "basic", lv: 2, sub: "WHERE 절",
  th: "2과목 | 다중 컬럼 IN과 개별 IN 조건의 차이",
  q: "다음 [T] 테이블에 대해 (가), (나) SQL의 결과 건수로 옳은 것은?",
  tb: [{ n: "T", c: ["ID", "DEPT", "JOB"], r: [[1, 10, "A"], [2, 10, "B"], [3, 20, "A"], [4, 20, "B"], [5, 30, "A"]] }],
  sql: "(가) SELECT COUNT(*) FROM T\n     WHERE (DEPT, JOB) IN ((10, 'A'), (20, 'B'));\n(나) SELECT COUNT(*) FROM T\n     WHERE DEPT IN (10, 20) AND JOB IN ('A', 'B');",
  o: ["4, 4", "2, 4", "2, 2", "4, 2"],
  a: 1,
  sum: "(가)는 (DEPT, JOB) 짝이 통째로 같아야 해서 2건이에요. (나)는 두 컬럼을 따로 검사해서 엇갈린 짝까지 통과해 4건이에요.",
  why: "IN 목록은 '이것 또는 저것'처럼 OR로 풀려요.\n\n(가)는 (DEPT, JOB)을 한 짝으로 묶어 목록의 짝과 통째로 비교해요. 풀어 쓰면 (DEPT = 10 AND JOB = 'A') OR (DEPT = 20 AND JOB = 'B')예요.\n\n(나)는 두 컬럼을 따로 검사해요. 풀어 쓰면 (DEPT가 10 또는 20) 그리고 (JOB이 A 또는 B)예요. 이러면 2 × 2 = 4가지 짝이 모두 통과해요.\n\n**짝으로 묶으면 '바로 그 짝만', 따로 쓰면 '엇갈린 짝까지 모두'가 돼요.**\n\n행마다 대입해 볼게요. ID 1 (10, A)와 ID 4 (20, B)는 목록의 짝과 똑같아서 (가)·(나) 모두 통과해요. ID 2 (10, B)와 ID 3 (20, A)는 엇갈린 짝이라 (가)에서는 탈락, (나)에서는 통과예요. ID 5는 DEPT가 30이라 둘 다 탈락이에요.\n\n그래서 답은 2, 4예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- (가) 짝 단위 비교\nSELECT COUNT(*) FROM T\n WHERE (DEPT, JOB) IN ((10, 'A'), (20, 'B'));  -- (10,A) 또는 (20,B)만 → ID 1, 4 → 2\n-- (나) 컬럼마다 따로 비교\nSELECT COUNT(*) FROM T\n WHERE DEPT IN (10, 20)                        -- DEPT가 10 또는 20: ID 1~4\n   AND JOB IN ('A', 'B');                      -- JOB이 A 또는 B: ID 1~4 모두 통과 → 4" },
    { t: "[원본] T", tb: { c: ["ID","DEPT","JOB"], r: [[1,10,"A"],[2,10,"B"],[3,20,"A"],[4,20,"B"],[5,30,"A"]] } },
    { t: "1단계: 행마다 판정", tb: { c: ["ID","(DEPT, JOB)","(가) 쌍 일치","(나) 개별 IN"], r: [[1,"(10, A)","O","O"],[2,"(10, B)","X","O"],[3,"(20, A)","X","O"],[4,"(20, B)","O","O"],[5,"(30, A)","X","X"]], hl: [1,2] }, n: "(가) 2건, (나) 4건. 엇갈린 짝(ID 2, 3)이 차이를 만들어요." },
    { t: "의도대로 쓰려면: 짝 조건을 풀어서 쓰기", n: "SELECT COUNT(*) FROM T\n WHERE (DEPT = 10 AND JOB = 'A')\n    OR (DEPT = 20 AND JOB = 'B');   -- 2: (가)와 같아요" }
  ],
  res: { c: ["가", "나"], r: [[2, 4]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE (DEPT, JOB) IN ((10, 'A'), (20, 'B'))), (SELECT COUNT(*) FROM T WHERE DEPT IN (10, 20) AND JOB IN ('A', 'B'))",
  ox: ["이렇게 생각하면 틀려요: '(가)도 컬럼마다 따로 비교한다.' 여러 컬럼 IN은 짝을 통째로 비교해서 (10, B)·(20, A)를 막아요.", "정답이에요. 짝으로 비교하면 2건, 따로 비교하면 4건이에요.", "이렇게 생각하면 틀려요: '(나)도 10은 A, 20은 B끼리만 짝짓는다.' 따로 쓴 IN은 엇갈린 짝까지 통과시켜요.", "이렇게 생각하면 틀려요: 두 SQL의 결과를 서로 바꿔 본 경우예요."],
  trap: "IN 목록은 OR로 풀려요. (가)는 '짝 OR 짝', (나)는 '(값 OR 값) AND (값 OR 값)'이에요.",
  memo: "(A, B) IN ((…), (…)) = 짝이 통째로 같아야 함"
},
{
  id: "S79", s: 2, tp: "agg", lv: 2, sub: "GROUP BY, HAVING 절",
  th: "2과목 | 집계 함수를 쓸 수 있는 위치",
  q: "다음 중 오류가 발생하는 SQL은? (Oracle 기준)",
  sql: "① SELECT COUNT(*) FROM EMP HAVING COUNT(*) > 3;\n② SELECT DEPTNO, COUNT(*) FROM EMP WHERE COUNT(*) > 1 GROUP BY DEPTNO;\n③ SELECT DEPTNO FROM EMP GROUP BY DEPTNO HAVING MAX(SAL) > 3000;\n④ SELECT DEPTNO, COUNT(*) FROM EMP GROUP BY DEPTNO ORDER BY AVG(SAL) DESC;",
  o: ["①", "②", "③", "④"],
  a: 1,
  sum: "WHERE는 그룹을 만들기 전에 실행돼서 COUNT(*) 같은 집계 함수를 쓸 수 없어요. 집계 결과로 거르려면 HAVING을 써야 하니 ②가 오류예요.",
  why: "SELECT 문은 FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY 순서로 처리된다고 생각하면 돼요.\n\nWHERE는 그룹을 만들기 전에 행을 하나씩 보면서 남길지 정해요. 그 시점에는 아직 그룹이 없어서 COUNT(*)를 셀 대상도 없어요.\n\n**그래서 WHERE에는 집계 함수를 쓸 수 없고(ORA-00934), 집계 결과로 거르는 일은 그룹을 만든 뒤에 실행되는 HAVING이 맡아요.**\n\nHAVING은 GROUP BY 없이도 쓸 수 있어요. 그때는 테이블 전체를 한 그룹으로 봐요. HAVING과 ORDER BY는 그룹이 만들어진 뒤에 실행되니까, SELECT에 적지 않은 집계 함수도 쓸 수 있어요.\n\n보기를 대입해 볼게요. ①은 GROUP BY 없는 HAVING이라 정상이에요. ③은 HAVING에 MAX(SAL)을 써서 정상이에요. ④는 ORDER BY에 AVG(SAL)을 써서 정상이에요. ②만 WHERE에 COUNT(*)를 써서 오류예요.",
  st: [
    { t: "처리 순서와 집계 함수", tb: { c: ["순서","절","집계 함수"], r: [[1,"FROM","—"],[2,"WHERE","사용 불가"],[3,"GROUP BY","—"],[4,"HAVING","사용 가능"],[5,"SELECT","사용 가능"],[6,"ORDER BY","사용 가능"]], hl: [1] } },
    { t: "예시: 오류가 나는 SQL과 고친 SQL", n: "SELECT DEPTNO, COUNT(*)\n  FROM EMP\n WHERE COUNT(*) > 1      -- 오류 ORA-00934: 이 단계에는 아직 그룹이 없어요\n GROUP BY DEPTNO;\n-- 고친 SQL: 그룹을 만든 뒤 HAVING으로 걸러요\nSELECT DEPTNO, COUNT(*)\n  FROM EMP\n GROUP BY DEPTNO\nHAVING COUNT(*) > 1;     -- 사원이 2명 이상인 부서만 남아요" }
  ],
  ox: ["정상이라 답이 아니에요. GROUP BY 없는 HAVING은 테이블 전체를 한 그룹으로 봐요. 행이 3개 이하면 0건일 뿐 오류는 아니에요.","정답이에요. WHERE는 그룹을 만들기 전 단계라 집계 함수를 쓸 수 없어요(ORA-00934).","정상이라 답이 아니에요. 이렇게 생각하면 틀려요: 'HAVING에는 SELECT에 적은 것만 쓸 수 있다.' MAX(SAL)처럼 SELECT에 없는 집계도 돼요.","정상이라 답이 아니에요. GROUP BY 쿼리의 ORDER BY에는 집계 함수를 쓸 수 있어요. SELECT에 없는 AVG(SAL)이어도 돼요."],
  trap: "①처럼 GROUP BY 없이 HAVING만 쓴 SQL을 오류로 고르기 쉬워요. 문법상 허용돼요.",
  memo: "집계 함수 = WHERE 불가, HAVING·SELECT·ORDER BY 가능"
},
{
  id: "S80", s: 2, tp: "agg", lv: 2, sub: "GROUP BY, HAVING 절",
  th: "2과목 | COUNT(DISTINCT)와 HAVING, 집계 별칭 정렬",
  q: "다음 [SALES] 테이블에 대해 SQL을 실행한 결과로 옳은 것은? (결과를 행 순서대로 'REGION(CNT, TOT)' 형태로 나타낸다.)",
  tb: [{ n: "SALES", c: ["REGION", "PROD", "AMT"], r: [["E", "P1", 100], ["E", "P1", 200], ["E", "P2", 50], ["W", "P1", 300], ["W", "P1", null], ["S", "P2", 100], ["S", "P3", 50], ["S", null, 100], ["N", "P1", 500]] }],
  sql: "SELECT REGION,\n       COUNT(DISTINCT PROD) AS CNT,\n       SUM(AMT)             AS TOT\n  FROM SALES\n GROUP BY REGION\nHAVING COUNT(*) >= 2\n ORDER BY TOT DESC;",
  o: ["E(3, 350) → W(2, 300) → S(2, 250)", "N(1, 500) → E(2, 350) → W(1, 300) → S(2, 250)", "E(2, 350) → W(1, 300) → S(3, 250)", "E(2, 350) → W(1, 300) → S(2, 250)"],
  a: 3,
  sum: "행이 2개 이상인 지역만 남아서 N이 빠져요. COUNT(DISTINCT PROD)는 빈 값(NULL)을 빼고 종류만 세요. 그래서 E(2, 350) → W(1, 300) → S(2, 250)이에요.",
  why: "집계 쿼리는 FROM → GROUP BY → HAVING → SELECT → ORDER BY 순서로 처리돼요.\n\n먼저 REGION별로 그룹을 만들어요. 그다음 HAVING COUNT(*) >= 2로 행이 2개 이상인 그룹만 남겨요. COUNT(*)는 값이 아니라 '행'을 세요. 그래서 AMT가 비어 있는 W의 행도 세요.\n\n나머지 집계 함수는 빈 값(NULL)을 빼고 계산해요. COUNT(DISTINCT PROD)는 빈 값을 버린 뒤 겹치는 걸 지우고 종류만 세요. SUM(AMT)도 빈 값은 건너뛰어요.\n\n**ORDER BY는 SELECT보다 나중에 실행되니까 SELECT에서 붙인 별칭 TOT를 쓸 수 있어요.**\n\n지역마다 대입해 볼게요. E는 3행이라 남고, PROD 종류는 P1·P2로 2, 합계는 350이에요. W는 2행이라 남고, PROD는 P1뿐이라 1, 합계는 빈 값을 빼고 300이에요. S는 3행이라 남고, PROD는 빈 값을 빼면 P2·P3로 2, 합계는 250이에요. N은 1행뿐이라 빠져요.\n\n남은 셋을 TOT 큰 순서로 세우면 E(350) → W(300) → S(250)이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT REGION,\n       COUNT(DISTINCT PROD) AS CNT,   -- ④ 빈 값 버리고, 겹치는 것 지우고, 종류 수\n       SUM(AMT)             AS TOT    -- ④ 빈 값 건너뛰고 합계\n  FROM SALES                          -- ① 9행을 읽어요\n GROUP BY REGION                      -- ② E(3행)·W(2행)·S(3행)·N(1행)\nHAVING COUNT(*) >= 2                  -- ③ 행이 2개 이상인 그룹만: N 탈락\n ORDER BY TOT DESC;                   -- ⑤ 별칭 TOT로 정렬: 350 → 300 → 250" },
    { t: "[원본] SALES", tb: { c: ["REGION","PROD","AMT"], r: [["E","P1",100],["E","P1",200],["E","P2",50],["W","P1",300],["W","P1",null],["S","P2",100],["S","P3",50],["S",null,100],["N","P1",500]] } },
    { t: "1단계: REGION별 집계", tb: { c: ["REGION","COUNT(*)","PROD 값","COUNT(DISTINCT PROD)","SUM(AMT)"], r: [["E",3,"P1, P1, P2",2,350],["W",2,"P1, P1",1,300],["S",3,"P2, P3, NULL",2,250],["N",1,"P1",1,500]], hl: [3] } },
    { t: "2단계: HAVING COUNT(*) >= 2 → ORDER BY TOT DESC", tb: { c: ["REGION","CNT","TOT"], r: [["E",2,350],["W",1,300],["S",2,250]] } },
    { t: "비교: HAVING을 COUNT(AMT)로 바꾸면", n: "SELECT REGION, COUNT(DISTINCT PROD) AS CNT, SUM(AMT) AS TOT\n  FROM SALES\n GROUP BY REGION\nHAVING COUNT(AMT) >= 2   -- W는 AMT 값이 300 하나뿐(빈 값은 안 셈) → 탈락\n ORDER BY TOT DESC;       -- E(2, 350) → S(2, 250)" }
  ],
  res: { c: ["REGION", "CNT", "TOT"], r: [["E", 2, 350], ["W", 1, 300], ["S", 2, 250]] },
  pg: "SELECT REGION, COUNT(DISTINCT PROD) AS CNT, SUM(AMT) AS TOT FROM SALES GROUP BY REGION HAVING COUNT(*) >= 2 ORDER BY TOT DESC",
  ox: ["이렇게 생각하면 틀려요: 'DISTINCT는 무시하고 PROD 값이 있는 행을 센다.' E는 P1이 두 번이라 종류로 세면 2예요.", "이렇게 생각하면 틀려요: 'HAVING은 신경 쓰지 않아도 된다.' HAVING이 행이 1개뿐인 N을 걸러 내요.", "이렇게 생각하면 틀려요: '빈 값(NULL)도 한 종류로 센다.' COUNT(*)를 뺀 집계 함수는 모두 빈 값을 버려요.", "정답이에요. N만 빠지고, 빈 값은 종류 수와 합계에서 빠져요."],
  trap: "HAVING 조건이 COUNT(AMT) >= 2였다면 W는 AMT 값이 1개뿐이라 빠져요. COUNT(*)와 COUNT(컬럼)을 구분하세요.",
  memo: "COUNT(*) = 행 수 / COUNT(DISTINCT 컬럼) = 빈 값 빼고 종류 수"
},
{
  id: "S81", s: 2, tp: "basic", lv: 2, sub: "ORDER BY 절",
  th: "2과목 | 컬럼 위치 번호 정렬과 다중 정렬 키",
  q: "다음 [T] 테이블에 대해 SQL을 실행했을 때 NAME의 출력 순서로 옳은 것은?",
  tb: [{ n: "T", c: ["NAME", "DEPT", "SAL"], r: [["A", 10, 300], ["B", 20, 100], ["C", 10, 100], ["D", 20, 300], ["E", 30, 200]] }],
  sql: "SELECT NAME, DEPT, SAL\n  FROM T\n ORDER BY 2 DESC, SAL;",
  o: ["C, A, B, D, E", "E, D, B, A, C", "E, B, D, C, A", "A, C, D, B, E"],
  a: 2,
  sum: "ORDER BY 2는 SELECT의 두 번째 컬럼 DEPT예요. DESC는 DEPT에만 붙고 SAL은 기본값인 오름차순이라 E, B, D, C, A예요.",
  why: "ORDER BY에 숫자를 쓰면 SELECT 목록의 몇 번째 컬럼인지를 뜻해요. 테이블의 컬럼 순서가 아니에요. 여기서 2는 DEPT예요.\n\n정렬 방향(ASC/DESC)은 정렬 기준마다 따로 붙어요. DESC는 바로 앞의 2(DEPT)에만 붙어요. 방향을 안 쓴 SAL은 기본값인 오름차순(ASC)이에요.\n\n**ORDER BY 2 DESC, SAL은 'DEPT 큰 순서, DEPT가 같으면 SAL 작은 순서'예요.**\n\n기준이 여러 개면 첫 기준으로 먼저 줄을 세워요. 첫 기준 값이 같은 행끼리만 두 번째 기준으로 순서를 정해요.\n\n이 데이터에 대입해 볼게요. DEPT 30인 E가 먼저예요. 다음 DEPT 20에서는 SAL 100인 B, 300인 D 순이에요. 마지막 DEPT 10에서는 SAL 100인 C, 300인 A 순이에요.\n\n그래서 답은 E, B, D, C, A예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT NAME, DEPT, SAL    -- ② 출력 컬럼: 1번 NAME, 2번 DEPT, 3번 SAL\n  FROM T                  -- ① 5행을 읽어요\n ORDER BY 2 DESC,         -- ③ 첫 기준: 2번 컬럼(DEPT) 큰 순서 → 30, 20, 20, 10, 10\n          SAL;            -- ④ 둘째 기준: SAL 작은 순서(방향 생략 = ASC), DEPT가 같을 때만" },
    { t: "[원본] T", tb: { c: ["NAME","DEPT","SAL"], r: [["A",10,300],["B",20,100],["C",10,100],["D",20,300],["E",30,200]] } },
    { t: "1단계: 첫 기준 DEPT 큰 순서", tb: { c: ["DEPT","해당 행"], r: [[30,"E"],[20,"B(100), D(300)"],[10,"A(300), C(100)"]] } },
    { t: "2단계: 둘째 기준 SAL 작은 순서 (같은 DEPT 안에서)", tb: { c: ["NAME","DEPT","SAL"], r: [["E",30,200],["B",20,100],["D",20,300],["C",10,100],["A",10,300]] } },
    { t: "비교: 둘 다 큰 순서로 하려면", n: "SELECT NAME, DEPT, SAL\n  FROM T\n ORDER BY 2 DESC, SAL DESC;   -- E, D, B, A, C (방향은 기준마다 따로 써야 해요)" }
  ],
  res: { c: ["NAME", "DEPT", "SAL"], r: [["E", 30, 200], ["B", 20, 100], ["D", 20, 300], ["C", 10, 100], ["A", 10, 300]] },
  pg: "SELECT NAME, DEPT, SAL FROM T ORDER BY 2 DESC, SAL",
  ox: ["이렇게 생각하면 틀려요: 'DESC는 무시하고 둘 다 작은 순서다.' DEPT는 DESC라 큰 순서예요.", "이렇게 생각하면 틀려요: 'DESC를 한 번 쓰면 뒤의 SAL에도 적용된다.' SAL도 큰 순서로 하려면 SAL DESC를 따로 써야 해요.", "정답이에요. DEPT는 큰 순서, 같은 DEPT 안에서는 SAL 작은 순서예요.", "이렇게 생각하면 틀려요: 'DESC는 뒤의 SAL에 붙는다.' DESC는 바로 앞의 2(DEPT)에 붙어요."],
  trap: "ORDER BY의 숫자는 SELECT 목록 기준이에요. 테이블의 컬럼 순서가 아니에요.",
  memo: "정렬 방향은 기준마다 따로 / 안 쓰면 ASC"
},
{
  id: "S82", s: 2, tp: "basic", lv: 2, sub: "ORDER BY 절",
  th: "2과목 | SELECT에 없는 컬럼으로 정렬하기",
  q: "다음 중 오류가 발생하는 SQL은? (Oracle 기준, EMP 테이블에는 ENAME, DEPTNO, SAL 컬럼이 있다.)",
  sql: "① SELECT ENAME FROM EMP ORDER BY SAL DESC;\n② SELECT DISTINCT DEPTNO FROM EMP ORDER BY SAL;\n③ SELECT DEPTNO, COUNT(*) FROM EMP GROUP BY DEPTNO ORDER BY COUNT(*) DESC;\n④ SELECT ENAME, SAL AS S FROM EMP ORDER BY S, 1;",
  o: ["①", "②", "③", "④"],
  a: 1,
  sum: "DISTINCT로 행을 합치면 합쳐진 행의 SAL이 하나로 정해지지 않아요. 그래서 DISTINCT 쿼리는 SELECT에 없는 SAL로 정렬할 수 없고, ②가 오류예요.",
  why: "SELECT DISTINCT는 SELECT 목록 값이 같은 행들을 한 행으로 합쳐요.\n\nDEPTNO가 10인 사원이 여럿이고 SAL이 서로 다르다고 해 볼게요. 합쳐진 10번 행에는 SAL이 하나로 정해지지 않아요. 어떤 SAL을 기준으로 줄을 세울지 알 수 없어요.\n\n**그래서 DISTINCT 쿼리의 ORDER BY에는 SELECT 목록에 있는 것만 쓸 수 있어요(ORA-01791).** GROUP BY도 같은 이유로 ORDER BY에 GROUP BY 컬럼이나 집계 함수만 쓸 수 있어요.\n\n반면 DISTINCT·GROUP BY가 없는 보통 SELECT는 행이 합쳐지지 않아요. 행마다 원래 SAL이 그대로 있으니, SELECT에 없는 컬럼으로도 정렬할 수 있어요.\n\n보기를 대입해 볼게요. ①은 보통 SELECT라 SAL로 정렬해도 정상이에요. ③은 GROUP BY 쿼리를 집계 함수로 정렬해서 정상이에요. ④는 별칭과 위치 번호로 정렬해서 정상이에요. ②만 DISTINCT 쿼리를 SELECT에 없는 SAL로 정렬해서 오류예요.",
  st: [
    { t: "ORDER BY에 쓸 수 있는 것", tb: { c: ["쿼리 종류","SELECT에 없는 컬럼","별칭·위치 번호"], r: [["일반 SELECT","가능","가능"],["SELECT DISTINCT","불가","가능"],["GROUP BY","GROUP BY 컬럼·집계 함수만","가능"]], hl: [1] } },
    { t: "예시: 오류가 나는 SQL과 고친 SQL", n: "SELECT DISTINCT DEPTNO\n  FROM EMP\n ORDER BY SAL;        -- 오류 ORA-01791: 합쳐진 행의 SAL이 하나로 정해지지 않아요\n-- 고친 SQL: 부서마다 SAL을 하나(MAX)로 정해서 그 값으로 정렬해요\nSELECT DEPTNO\n  FROM EMP\n GROUP BY DEPTNO\n ORDER BY MAX(SAL);   -- 부서 최고 급여가 작은 부서부터" }
  ],
  ox: ["정상이라 답이 아니에요. 보통 SELECT는 행이 합쳐지지 않아서 SELECT에 없는 SAL로도 정렬할 수 있어요.","정답이에요. DISTINCT로 합쳐진 행에는 SAL이 하나로 정해지지 않아 ORA-01791이 나요.","정상이라 답이 아니에요. GROUP BY 쿼리를 집계 함수로 정렬하는 건 괜찮아요.","정상이라 답이 아니에요. 별칭(S)과 위치 번호(1)를 섞어 써도 돼요."],
  trap: "'SELECT에 없는 컬럼으로는 정렬할 수 없다'는 늘 맞는 규칙이 아니에요. DISTINCT나 GROUP BY가 있을 때만 막혀요.",
  memo: "SELECT에 없는 컬럼으로 정렬: 보통 O / DISTINCT X / GROUP BY는 그룹 컬럼·집계만"
},
{
  id: "S83", s: 2, tp: "basic", lv: 3, sub: "ORDER BY 절",
  th: "2과목 | NULLS FIRST / NULLS LAST와 다중 정렬 키",
  q: "다음 [T] 테이블에 대해 SQL을 실행했을 때 NAME의 출력 순서로 옳은 것은? (Oracle 기준)",
  tb: [{ n: "T", c: ["NAME", "DEPT", "SAL"], r: [["A", 10, 100], ["B", null, 200], ["C", 10, null], ["D", 20, 300], ["E", null, null], ["F", 10, 300]] }],
  sql: "SELECT NAME\n  FROM T\n ORDER BY DEPT NULLS FIRST, SAL DESC NULLS LAST;",
  o: ["C, F, A, D, E, B", "B, E, F, A, C, D", "E, B, C, F, A, D", "B, E, A, F, C, D"],
  a: 1,
  sum: "DEPT는 작은 순서인데 빈 값(NULL)을 맨 앞에, 같은 DEPT 안에서는 SAL 큰 순서인데 빈 값을 맨 뒤에 둬요. 그래서 B, E, F, A, C, D예요.",
  why: "Oracle은 정렬할 때 빈 값(NULL)을 '가장 큰 값'처럼 다뤄요. 그래서 따로 말하지 않으면 작은 순서(ASC)에서는 맨 뒤, 큰 순서(DESC)에서는 맨 앞에 와요.\n\nNULLS FIRST / NULLS LAST는 빈 값의 자리만 바꿔 주는 옵션이에요. **ASC/DESC처럼 바로 앞의 정렬 기준 하나에만 붙어요.**\n\n그래서 이 SQL은 'DEPT 작은 순서, 빈 DEPT는 맨 앞 / DEPT가 같으면 SAL 큰 순서, 빈 SAL은 맨 뒤'예요.\n\n이 데이터에 대입해 볼게요. DEPT가 빈 B(200)와 E(빈 값)가 먼저 와요. 둘 사이에서는 SAL 큰 순서이고 빈 값은 뒤라서 B, E예요. 다음 DEPT 10에서는 F(300), A(100), C(빈 값) 순이에요. 마지막은 DEPT 20의 D예요.\n\n그래서 답은 B, E, F, A, C, D예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT NAME                      -- ② 출력할 컬럼\n  FROM T                         -- ① 6행을 읽어요\n ORDER BY DEPT NULLS FIRST,      -- ③ 첫 기준: DEPT 작은 순서, 빈 값은 맨 앞 → 빈, 빈, 10, 10, 10, 20\n          SAL DESC NULLS LAST;   -- ④ 둘째 기준: 같은 DEPT 안에서 SAL 큰 순서, 빈 값은 맨 뒤" },
    { t: "[원본] T", tb: { c: ["NAME","DEPT","SAL"], r: [["A",10,100],["B",null,200],["C",10,null],["D",20,300],["E",null,null],["F",10,300]] } },
    { t: "1단계: DEPT 작은 순서, 빈 값 먼저", tb: { c: ["DEPT 그룹","행"], r: [["NULL","B(200), E(NULL)"],[10,"A(100), C(NULL), F(300)"],[20,"D(300)"]] } },
    { t: "2단계: 그룹 안에서 SAL 큰 순서, 빈 값 나중", tb: { c: ["NAME","DEPT","SAL"], r: [["B",null,200],["E",null,null],["F",10,300],["A",10,100],["C",10,null],["D",20,300]] } },
    { t: "비교: NULLS 옵션을 빼면 (Oracle 기본)", n: "SELECT NAME\n  FROM T\n ORDER BY DEPT, SAL DESC;   -- C, F, A, D, E, B\n-- DEPT 작은 순서 → 빈 값이 맨 뒤 / SAL 큰 순서 → 빈 값이 맨 앞 (빈 값 = 가장 큰 값처럼)" }
  ],
  res: { c: ["NAME"], r: [["B"], ["E"], ["F"], ["A"], ["C"], ["D"]] },
  pg: "SELECT NAME FROM T ORDER BY DEPT NULLS FIRST, SAL DESC NULLS LAST",
  ox: ["이렇게 생각하면 틀려요: 'NULLS 옵션은 무시하고 기본 규칙대로 정렬한다.' 그건 옵션이 없을 때의 결과예요.", "정답이에요. 기준마다 붙은 NULLS 옵션을 따로 적용했어요.", "이렇게 생각하면 틀려요: '앞의 NULLS FIRST가 SAL에도 적용된다.' 그러면 C가 F보다 앞에 와요. NULLS 옵션은 기준마다 따로 붙어요.", "이렇게 생각하면 틀려요: 'SAL도 작은 순서다.' SAL에는 DESC가 붙어 있어서 큰 순서예요."],
  trap: "SQL Server는 빈 값을 '가장 작은 값'처럼 다뤄서 작은 순서에서 맨 앞, 큰 순서에서 맨 뒤에 둬요. 이 문제의 NULLS 옵션은 우연히 SQL Server 기본 동작과 같아요.",
  memo: "Oracle 기본: 빈 값 = 가장 큰 값처럼 / NULLS FIRST·LAST는 기준마다"
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
  sum: "조인은 조건에 맞는 짝을 모두 이어 붙여요. 경계값 1000과 2000은 두 등급에 동시에 들어가서, B와 D가 두 번씩 세어져요.",
  why: "조인은 조건이 맞는 행 짝을 전부 결과로 만들어요. = 이외의 조건으로 잇는 비등가 조인도 마찬가지예요. **조인은 '가장 알맞은 하나'를 고르지 않아서, 조건에 맞는 등급이 두 개면 그 사원은 두 번 나와요.**\n\nBETWEEN은 LOSAL <= SAL <= HISAL이라 양 끝값을 포함해요. 그런데 이 등급표는 1000이 1등급 끝이면서 2등급 시작이에요. 2000도 2등급 끝이면서 3등급 시작이에요.\n\n사원마다 대입해 볼게요. A(800)는 1등급에만 맞아요. B(1000)는 1등급과 2등급에 모두 맞아요. C(1500)는 2등급에만 맞아요. D(2000)는 2등급과 3등급에 모두 맞아요. E(3500)는 어느 등급에도 안 맞아서 빠져요.\n\n그래서 조인 결과는 6행이에요. 등급별로 세면 1등급 A·B 2명, 2등급 B·C·D 3명, 3등급 D 1명이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT S.GRADE, COUNT(*) AS CNT              -- ④ 등급별 행 수\n  FROM EMP E, SALGRADE S                      -- ① 5 × 3 = 15개 짝 후보\n WHERE E.SAL BETWEEN S.LOSAL AND S.HISAL     -- ② LOSAL <= SAL <= HISAL인 짝만: 6행\n GROUP BY S.GRADE                            -- ③ 1: A, B / 2: B, C, D / 3: D\n ORDER BY S.GRADE;                           -- ⑤ 등급 순서로" },
    { t: "[원본] EMP · SALGRADE", n: "등급 범위: 1(0~1000), 2(1000~2000), 3(2000~3000). 1000과 2000이 두 등급에 걸쳐 있어요." },
    { t: "1단계: 조건에 맞는 (사원, 등급) 짝", tb: { c: ["ENAME","SAL","매칭 등급"], r: [["A",800,"1"],["B",1000,"1, 2"],["C",1500,"2"],["D",2000,"2, 3"],["E",3500,"없음"]], hl: [1,3] }, n: "조인 결과 6행" },
    { t: "2단계: 등급별로 묶어 세기", tb: { c: ["GRADE","사원","CNT"], r: [[1,"A, B",2],[2,"B, C, D",3],[3,"D",1]] } },
    { t: "의도대로 쓰려면: 한 사원이 한 등급에만 들게", n: "SELECT S.GRADE, COUNT(*) AS CNT\n  FROM EMP E, SALGRADE S\n WHERE E.SAL >= S.LOSAL\n   AND E.SAL <  S.HISAL      -- 위쪽 끝을 빼면 1000 → 2등급, 2000 → 3등급에만 들어가요\n GROUP BY S.GRADE\n ORDER BY S.GRADE;           -- 1: 1명(A), 2: 2명(B, C), 3: 1명(D)" }
  ],
  res: { c: ["GRADE", "CNT"], r: [[1, 2], [2, 3], [3, 1]] },
  pg: "SELECT S.GRADE, COUNT(*) AS CNT FROM EMP E, SALGRADE S WHERE E.SAL BETWEEN S.LOSAL AND S.HISAL GROUP BY S.GRADE ORDER BY S.GRADE",
  ox: ["정답이에요. 경계값 사원 B, D가 두 등급에 모두 붙어요.","이렇게 생각하면 틀려요: '경계값은 낮은 등급 하나에만 붙는다.' 조인은 조건에 맞는 모든 행과 이어져요.","이렇게 생각하면 틀려요: '경계값은 높은 등급 하나에만 붙는다.' 이 결과는 SAL < HISAL로 고쳐 쓴 SQL에서 나와요.","이렇게 생각하면 틀려요: 'BETWEEN은 양 끝값을 뺀다.' 그러면 B와 D가 빠지지만, BETWEEN은 양 끝을 포함해요."],
  trap: "실무 등급표는 범위가 겹치지 않게(1~1000, 1001~2000) 만들어요. 겹치면 한 사원이 여러 등급으로 중복 출력돼요.",
  memo: "비등가 조인 = 조건에 맞는 행 모두 연결 / BETWEEN = 양 끝 포함"
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
  sum: "세 테이블을 =로 이으면 두 번의 조인을 모두 통과한 행만 남아요. 짝이 없거나 키가 비어 있는(NULL) 사원이 단계마다 빠져서 3건이에요.",
  why: "등가 조인은 = 조건이 확실히 맞는 행끼리만 이어요. 세 테이블 조인은 두 번의 조인을 차례로 하는 것과 같아요.\n\n두 조건이 AND로 묶여 있어요. 그래서 최종 결과에 남으려면 두 조건을 모두 통과해야 해요. 짝이 없으면 탈락이에요. 키가 비어 있으면(NULL) = 비교가 '모름'이라 역시 탈락이에요.\n\n**어느 한 단계에서라도 짝을 못 찾은 행은 최종 결과에서 사라져요.**\n\n단계마다 대입해 볼게요. 1단계(EMP–DEPT)에서 D는 40번 부서가 DEPT에 없어서 빠져요. E는 DEPTNO가 비어 있어서 빠져요. 남은 건 A, B, C, F의 4행이에요.\n\n2단계(DEPT–LOC)에서 C의 부서(30)는 LOC_ID가 비어 있어서 빠져요. 남은 건 A, B, F의 3행이에요.\n\n그래서 COUNT(*)는 3이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT COUNT(*)                    -- ④ 남은 행 수 → 3\n  FROM EMP E, DEPT D, LOC L        -- ① 후보: 6 × 3 × 3 = 54개 조합\n WHERE E.DEPTNO = D.DEPTNO         -- ② 사원–부서 짝: A, B, C, F (D·E 탈락)\n   AND D.LOC_ID = L.LOC_ID;        -- ③ 부서–지역 짝: A, B, F (C 탈락)" },
    { t: "[원본] EMP 6행 · DEPT 3행 · LOC 3행", n: "조인 조건이 없다면 6 × 3 × 3 = 54행이 돼요(카테시안 곱)." },
    { t: "1단계: EMP ⋈ DEPT (E.DEPTNO = D.DEPTNO)", tb: { c: ["ENAME","DEPTNO","LOC_ID"], r: [["A",10,"L1"],["B",20,"L2"],["C",30,null],["F",10,"L1"]], hl: [2] }, n: "D(40)는 DEPT에 없어요. E는 DEPTNO가 비어 있어서 = 비교가 '모름'이라 빠져요. 4행" },
    { t: "2단계: ⋈ LOC (D.LOC_ID = L.LOC_ID)", tb: { c: ["ENAME","LOC_ID","CITY"], r: [["A","L1","SEOUL"],["B","L2","BUSAN"],["F","L1","SEOUL"]] }, n: "C는 부서의 LOC_ID가 비어 있어서 빠져요. 3행" },
    { t: "의도대로 쓰려면: 사원을 모두 남기기(아우터 조인)", n: "SELECT COUNT(*)\n  FROM EMP E\n  LEFT OUTER JOIN DEPT D ON E.DEPTNO = D.DEPTNO\n  LEFT OUTER JOIN LOC  L ON D.LOC_ID = L.LOC_ID;   -- 6: 짝이 없으면 빈 값으로 채워 사원 6명 모두 남겨요\n-- Oracle (+) 표기: WHERE E.DEPTNO = D.DEPTNO(+) AND D.LOC_ID = L.LOC_ID(+)" }
  ],
  res: { c: ["COUNT(*)"], r: [[3]] },
  pg: "SELECT COUNT(*) FROM EMP E, DEPT D, LOC L WHERE E.DEPTNO = D.DEPTNO AND D.LOC_ID = L.LOC_ID",
  ox: ["정답이에요. 1단계에서 D·E, 2단계에서 C가 빠져 3건이에요.","이렇게 생각하면 틀려요: '첫 번째 조인만 통과하면 된다.' 두 번째 조인에서 LOC_ID가 빈 C도 빠져요.","이렇게 생각하면 틀려요: '사원은 모두 남는다.' 그건 아우터 조인일 때 얘기예요.","이렇게 생각하면 틀려요: '테이블 행 수를 곱한다.' 6 × 3 × 3은 조인 조건이 없을 때의 결과예요."],
  trap: "LOC의 L3(DAEGU)는 어느 부서와도 안 이어지니까 결과 건수에 영향을 주지 않아요.",
  memo: "여러 테이블 등가 조인 = 단계마다 짝 없는 행·빈 키 탈락"
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
  sum: "ANSI 조인의 ON 절에는 = 말고도 BETWEEN 같은 어떤 조건이든 쓸 수 있어요. =만 되는 건 USING과 NATURAL JOIN이라 ④가 틀렸어요.",
  why: "조인 조건은 '이 두 행을 이어 붙일까?'를 참·거짓으로 판단하는 조건식이에요.\n\nON 절은 그 조건식을 적는 자리예요. 그래서 =뿐 아니라 BETWEEN, >=, < 같은 어떤 조건도 쓸 수 있어요. 예를 들어 FROM EMP E JOIN SALGRADE S ON E.SAL BETWEEN S.LOSAL AND S.HISAL처럼 비등가 조인도 ON 절로 써요.\n\n**=만 쓸 수 있는 건 '이름이 같은 컬럼끼리 같다'고 자동으로 묶는 USING 절과 NATURAL JOIN이에요.**\n\n다른 보기도 확인해 볼게요. 테이블 N개를 하나로 이으려면 최소 N − 1개의 연결 조건이 필요해요. 사슬 고리처럼 테이블 사이마다 하나씩 있어야 하기 때문이에요. 조인 조건이 없으면 모든 행끼리 짝지어져 M × N행이 나와요.\n\n①②③은 맞는 설명이에요. ④는 ON 절에 = 이외의 조건을 못 쓴다고 했으니 틀렸어요.",
  st: [
    { t: "조인 조건을 쓰는 자리별 비교", tb: { c: ["문법","= 조건","= 이외 조건"], r: [["WHERE 절 (Oracle 방식)","가능","가능"],["ON 절","가능","가능"],["USING / NATURAL JOIN","같은 이름 컬럼의 = 만","불가"]], hl: [1] } },
    { t: "예시: 비등가 조인을 두 방식으로 쓰기", n: "-- Oracle 방식: WHERE 절에 범위 조건\nSELECT E.ENAME, S.GRADE\n  FROM EMP E, SALGRADE S\n WHERE E.SAL BETWEEN S.LOSAL AND S.HISAL;\n-- ANSI 방식: ON 절에도 똑같이 쓸 수 있어요 (결과도 같아요)\nSELECT E.ENAME, S.GRADE\n  FROM EMP E JOIN SALGRADE S\n    ON E.SAL BETWEEN S.LOSAL AND S.HISAL;\n-- USING (컬럼)은 '양쪽의 같은 이름 컬럼이 같다'는 뜻뿐이라 범위 조건을 담을 수 없어요" }
  ],
  ox: ["맞는 설명이라 답이 아니에요. 테이블 N개를 사슬처럼 이으려면 최소 N − 1개의 연결 조건이 필요해요. 하나라도 빠지면 그 자리에서 모든 행끼리 짝지어져요.","맞는 설명이라 답이 아니에요. 등가·비등가 조인의 정의예요.","맞는 설명이라 답이 아니에요. 조인 조건이 없으면 모든 행끼리 짝지어지는 카테시안 곱(CROSS JOIN)이 돼요.","정답이에요. 이렇게 생각하면 틀려요: 'USING처럼 ON도 =만 된다.' ON 절에는 BETWEEN 같은 범위 조건도 쓸 수 있어요."],
  trap: "N − 1은 '최소' 개수예요. 두 컬럼을 묶은 키로 이으면 테이블 한 쌍에 조건이 두 개 이상 필요할 수도 있어요.",
  memo: "ON = 어떤 조건이든 / USING·NATURAL = 같은 이름 컬럼의 = 만"
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
  sum: "부서 1행이 사원 수만큼 복사된 뒤에 더해져서, 10번 부서 예산이 3번 더해져 3000이 돼요. 급여는 사원마다 한 번씩이라 정상이에요.",
  why: "조인은 조건에 맞는 짝마다 한 행을 만들어요. 그래서 부서(1쪽) 행은 그 부서 사원(N쪽) 수만큼 복사돼요.\n\nGROUP BY와 SUM은 조인이 끝난 뒤의 행으로 계산해요. 그래서 복사된 BUDGET 값도 하나하나 더해져요.\n\n**1:N 조인 뒤에 1쪽 컬럼을 SUM하면 값이 N배로 부풀어요.**\n\n부서마다 대입해 볼게요. 10번 부서는 사원이 A, B, C 3명이라 BUDGET 1000이 세 번 나와요. 그래서 B_SUM은 3000이에요. SAL은 100 + 200 + 300 = 600으로 정상이에요. 20번 부서는 사원이 D 1명이라 BUDGET 500, SAL 400 그대로예요.\n\n30번 부서는 사원이 없어서 짝이 없어요. 등가 조인이라 결과에서 빠져요.\n\n그래서 답은 10: 3000 / 600, 20: 500 / 400이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT D.DEPTNO,\n       SUM(D.BUDGET) AS B_SUM,     -- ④ 복사된 BUDGET까지 더해요: 10 → 1000 × 3\n       SUM(E.SAL)    AS S_SUM      -- ④ 사원별 SAL 합계: 10 → 600\n  FROM DEPT D, EMP E               -- ① 3 × 4 = 12개 짝 후보\n WHERE D.DEPTNO = E.DEPTNO         -- ② 맞는 짝 4행: 10번 부서 행이 3번 복사, 30번 탈락\n GROUP BY D.DEPTNO                 -- ③ 10(3행), 20(1행)\n ORDER BY D.DEPTNO;                -- ⑤ 부서 번호 순서로" },
    { t: "1단계: 조인 결과 (부서 행이 복사됨)", tb: { c: ["DEPTNO","BUDGET","ENAME","SAL"], r: [[10,1000,"A",100],[10,1000,"B",200],[10,1000,"C",300],[20,500,"D",400]], hl: [0,1,2] }, n: "DEPT 30은 짝이 없어서 빠져요." },
    { t: "2단계: 부서별로 묶어 더하기", tb: { c: ["DEPTNO","SUM(BUDGET)","SUM(SAL)"], r: [[10,"1000 × 3 = 3000",600],[20,500,400]] } },
    { t: "의도대로 쓰려면: 조인하기 전에 사원 쪽을 먼저 묶기", n: "SELECT D.DEPTNO, D.BUDGET AS B_SUM, E.S_SUM\n  FROM DEPT D,\n       (SELECT DEPTNO, SUM(SAL) AS S_SUM\n          FROM EMP\n         GROUP BY DEPTNO) E        -- 부서당 1행으로 줄인 뒤 조인 → 복사가 안 생겨요\n WHERE D.DEPTNO = E.DEPTNO\n ORDER BY D.DEPTNO;                -- 10: 1000 / 600, 20: 500 / 400\n-- 간단하게는 SUM(D.BUDGET) 대신 MAX(D.BUDGET)을 써도 같은 결과예요" }
  ],
  res: { c: ["DEPTNO", "B_SUM", "S_SUM"], r: [[10, 3000, 600], [20, 500, 400]] },
  pg: "SELECT D.DEPTNO, SUM(D.BUDGET) AS B_SUM, SUM(E.SAL) AS S_SUM FROM DEPT D, EMP E WHERE D.DEPTNO = E.DEPTNO GROUP BY D.DEPTNO ORDER BY D.DEPTNO",
  ox: ["정답이에요. 10번 부서 예산은 복사된 3행이 모두 더해져 3000이에요.","이렇게 생각하면 틀려요: '부서 예산은 조인 후에도 한 번만 더해진다.' 조인으로 10번 부서 행이 3개로 늘었어요. 이 값은 MAX(D.BUDGET)이나 먼저 묶는 방법으로 구해야 나와요.","이렇게 생각하면 틀려요: 'SAL도 3배로 부푼다.' 사원 행은 각자 한 번씩만 나와요.","이렇게 생각하면 틀려요: '사원이 없는 30번 부서도 나온다.' 아우터 조인이 아니라서 빠져요."],
  trap: "부서 예산 합계를 제대로 구하려면 조인 전에 묶거나, 1쪽 값을 MAX(D.BUDGET)로 가져와야 해요.",
  memo: "1:N 조인 후 1쪽 컬럼 SUM = N배로 부풂"
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
  sum: "(+)가 붙은 조건은 '이을 때의 조건'이라 사원이 모두 남아 5건이에요. (+)가 없는 조건은 '다 이은 뒤 거르는 조건'이라 서울이 아닌 행이 빠져 3건이에요.",
  why: "Oracle의 (+)는 '이 쪽 테이블은 짝이 없으면 빈 값(NULL)으로 채워도 된다'는 표시예요. 사원(EMP)을 기준으로 모두 남기는 아우터 조인이 돼요.\n\n**(+)가 붙은 조건은 모두 '이을 때의 조건'(ANSI의 ON)이고, (+)가 없는 조건은 '다 이은 뒤 거르는 조건'(WHERE)이에요.**\n\n(가)는 D.LOC(+) = 'SEOUL'까지 이을 때의 조건이에요. 'DEPTNO가 같고 서울에 있는 부서'하고만 이어요. 그런 부서가 없는 사원은 부서 칸을 빈 값으로 채워서 남겨요. 그래서 사원 5명이 모두 남아요.\n\n(나)는 먼저 아우터 조인으로 5행을 만들어요. 그다음 D.LOC = 'SEOUL'로 걸러요.\n\n행마다 대입해 볼게요. A, C, E는 부서가 서울이라 통과해요. B는 부서가 부산이라 탈락이에요. D는 부서 칸이 빈 값이라 비교 결과가 '모름'이어서 탈락이에요.\n\n그래서 (나)는 3건이고, 결과적으로 그냥 등가 조인과 같아져요. 답은 5, 3이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- (가)\nSELECT COUNT(*) FROM EMP E, DEPT D\n WHERE E.DEPTNO = D.DEPTNO(+)      -- ① 이을 때의 조건: 사원 기준 아우터 조인\n   AND D.LOC(+) = 'SEOUL';         -- ① 이것도 이을 때의 조건: 서울 부서하고만 잇고, 없으면 빈 값 → 5\n-- (나)\nSELECT COUNT(*) FROM EMP E, DEPT D\n WHERE E.DEPTNO = D.DEPTNO(+)      -- ① 이을 때의 조건: 사원 기준 아우터 조인 (5행)\n   AND D.LOC = 'SEOUL';            -- ② (+) 없음 → 다 이은 뒤 거르기: B(부산)·D(빈 값) 탈락 → 3" },
    { t: "1단계: 공통 — 사원 기준 아우터 조인", tb: { c: ["ENAME","E.DEPTNO","(가) 연결된 D.LOC","(나) 연결된 D.LOC"], r: [["A",10,"SEOUL","SEOUL"],["B",20,"NULL (BUSAN은 조건 불만족)","BUSAN"],["C",30,"SEOUL","SEOUL"],["D",null,"NULL","NULL"],["E",10,"SEOUL","SEOUL"]] }, n: "(가)는 여기서 끝 → 5행" },
    { t: "2단계: (나)만 — D.LOC = 'SEOUL'로 거르기", tb: { c: ["ENAME","D.LOC","판정"], r: [["A","SEOUL","TRUE"],["B","BUSAN","FALSE"],["C","SEOUL","TRUE"],["D","NULL","모름"],["E","SEOUL","TRUE"]], hl: [1,3] }, n: "3행. D는 빈 값이라 '모름'이 되어 빠져요." },
    { t: "ANSI 표준 조인으로 옮기면", n: "SELECT COUNT(*) FROM EMP E LEFT OUTER JOIN DEPT D\n  ON E.DEPTNO = D.DEPTNO AND D.LOC = 'SEOUL';   -- (가) 5\nSELECT COUNT(*) FROM EMP E LEFT OUTER JOIN DEPT D\n  ON E.DEPTNO = D.DEPTNO\n WHERE D.LOC = 'SEOUL';                         -- (나) 3 (사실상 INNER JOIN)" }
  ],
  res: { c: ["가", "나"], r: [[5, 3]] },
  pg: "SELECT (SELECT COUNT(*) FROM EMP E LEFT JOIN DEPT D ON E.DEPTNO = D.DEPTNO AND D.LOC = 'SEOUL'), (SELECT COUNT(*) FROM EMP E LEFT JOIN DEPT D ON E.DEPTNO = D.DEPTNO WHERE D.LOC = 'SEOUL')",
  ox: ["정답이에요. (+)가 있으면 이을 때의 조건이라 5건, 없으면 이은 뒤 거르는 조건이라 3건이에요.","이렇게 생각하면 틀려요: '상수 조건에 (+)가 있든 없든 똑같다.' (가)에서는 이을 때의 조건이라 사원이 모두 남아요.","이렇게 생각하면 틀려요: '(나)도 아우터 조인이니 사원이 모두 남는다.' (+)가 없는 조건은 이은 뒤에 걸러서 빈 값으로 채운 행을 버려요.","이렇게 생각하면 틀려요: '(가)에서 DEPTNO가 빈 D는 빠진다.' 기준 테이블(EMP)의 행은 키가 비어 있어도 남아요."],
  trap: "(+)를 어떤 조건에는 붙이고 다른 조건에는 빠뜨리면, 아우터 조인이 조용히 이너 조인처럼 바뀌어요. 오류가 안 나서 결과 건수를 보고서야 알아챌 수 있어요.",
  memo: "(+) 붙은 조건 = 이을 때의 조건(ON) / (+) 없는 조건 = 이은 뒤 거르기(WHERE)"
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
  sum: "같은 키끼리는 모든 짝이 만들어져서 키 1은 2 × 3 = 6행, 키 2는 1행이에요. NULL끼리는 같다고 보지 않아 이어지지 않으니 7행이에요.",
  why: "등가 조인은 T1의 각 행마다 T2에서 키가 같은 행을 모두 찾아 한 행씩 만들어요.\n\n그래서 같은 키가 T1에 a개, T2에 b개 있으면 a × b행이 나와요. **키의 '종류 수'가 아니라, 키마다 '행 수끼리 곱한 값'을 더해야 해요.**\n\nNULL = NULL은 '모름'이에요. 그래서 키가 비어 있는 행끼리는 이어지지 않아요. DISTINCT나 GROUP BY와 달리, = 비교에서는 NULL끼리 같다고 보지 않아요.\n\n키마다 대입해 볼게요. 키 1은 T1에 2개, T2에 3개라 6행이에요. 키 2는 1 × 1 = 1행이에요. 키 3은 T2에 없고, 키 4는 T1에 없어서 0행이에요. NULL은 서로 이어지지 않아 0행이에요.\n\n모두 더하면 6 + 1 = 7행이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT COUNT(*)              -- ③ 남은 행 수 → 7\n  FROM T1, T2                -- ① 5 × 7 = 35개 짝 후보\n WHERE T1.K = T2.K;          -- ② 키가 같은 짝만: 1끼리 2×3 = 6, 2끼리 1, NULL끼리는 '모름'이라 탈락" },
    { t: "1단계: 키 값별 행 수", tb: { c: ["K","T1 행 수","T2 행 수","조인 행 수"], r: [[1,2,3,"2 × 3 = 6"],[2,1,1,"1 × 1 = 1"],[3,1,0,0],[4,0,1,0],["NULL",1,2,"0 (모름)"]], hl: [0,4] } },
    { t: "2단계: 합계", n: "6 + 1 = 7행" }
  ],
  res: { c: ["COUNT(*)"], r: [[7]] },
  pg: "SELECT COUNT(*) FROM T1, T2 WHERE T1.K = T2.K",
  ox: ["이렇게 생각하면 틀려요: '맞는 키 종류(1, 2)만 센다.' 조인은 값 종류가 아니라 행 짝을 만들어요.","이렇게 생각하면 틀려요: 'T1의 각 행은 한 번만 이어진다.' 짝이 여럿이면 모두 이어져요.","정답이에요. 키 1에서 6행, 키 2에서 1행이에요.","이렇게 생각하면 틀려요: 'NULL끼리도 1 × 2 = 2행으로 이어진다.' = 비교에서 NULL = NULL은 '모름'이라 안 이어져요."],
  trap: "조인 키가 양쪽 모두에서 겹치면(M:N) 결과 행이 곱셈으로 늘어나요. 집계하기 전에 키가 겹치지 않는지 꼭 확인하세요.",
  memo: "같은 키 a개 × b개 = a × b행 / NULL 키는 안 이어짐"
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
  sum: "NATURAL JOIN과 USING은 같은 이름의 조인 컬럼(DEPTNO)을 하나로 합쳐서 5개 컬럼이에요. ON은 양쪽 DEPTNO를 모두 보여 줘서 6개라 ③이 달라요.",
  why: "NATURAL JOIN과 USING은 '이름이 같은 컬럼은 값도 같다'고 선언하는 문법이에요. 그래서 조인 컬럼을 양쪽 테이블의 두 컬럼이 아니라 하나로 합친 공통 컬럼으로 다뤄요.\n\nSELECT *를 하면 그 공통 컬럼(DEPTNO)을 맨 앞에 한 번만 보여 줘요. 나머지 컬럼은 각 테이블 순서대로 붙어요. 아우터 조인이어도 USING을 쓰면 똑같아요.\n\nON 절은 어떤 조건이든 쓸 수 있어요. ON E.DEPTNO < D.DEPTNO처럼 두 값이 다를 수도 있어요. 그래서 합치지 않고 양쪽 컬럼을 그대로 다 보여 줘요.\n\n**USING·NATURAL은 3 + 3 − 1 = 5개, ON은 3 + 3 = 6개예요.**\n\n보기를 대입해 볼게요. ①②④는 DEPTNO가 하나로 합쳐져 5개예요. ③만 E.DEPTNO와 D.DEPTNO가 따로 나와 6개예요.",
  st: [
    { t: "실제 결과 ①②④: NATURAL JOIN · USING (아우터 조인이어도 같음)", tb: { c: ["DEPTNO","EMPNO","ENAME","DNAME","LOC"], r: [[10,1,"A","SALES","SEOUL"]] }, n: "DEPTNO가 맨 앞에 한 번만 나와요 → 5개" },
    { t: "실제 결과 ③: ON", tb: { c: ["EMPNO","ENAME","DEPTNO","DEPTNO","DNAME","LOC"], r: [[1,"A",10,10,"SALES","SEOUL"]] }, n: "EMP의 DEPTNO와 DEPT의 DEPTNO가 따로 나와요 → 6개" },
    { t: "SELECT * 결과 컬럼", tb: { c: ["SQL","컬럼 목록","개수"], r: [["① NATURAL JOIN","DEPTNO, EMPNO, ENAME, DNAME, LOC",5],["② JOIN USING","DEPTNO, EMPNO, ENAME, DNAME, LOC",5],["③ JOIN ON","EMPNO, ENAME, DEPTNO, DEPTNO, DNAME, LOC",6],["④ LEFT JOIN USING","DEPTNO, EMPNO, ENAME, DNAME, LOC",5]], hl: [2] } },
    { t: "예시: 합쳐진 조인 컬럼 쓰는 법 (Oracle)", n: "SELECT DEPTNO, ENAME, DNAME FROM EMP JOIN DEPT USING (DEPTNO);    -- 정상: 공통 컬럼은 앞에 테이블 이름 없이\nSELECT E.DEPTNO, ENAME FROM EMP E JOIN DEPT D USING (DEPTNO);    -- 오류 ORA-25154: USING 컬럼에는 E.를 붙일 수 없어요\nSELECT DEPTNO FROM EMP NATURAL JOIN DEPT;                        -- 정상\nSELECT E.DEPTNO FROM EMP E NATURAL JOIN DEPT D;                  -- 오류 ORA-25155: NATURAL JOIN 컬럼에도 E.를 붙일 수 없어요\nSELECT E.DEPTNO, D.DEPTNO FROM EMP E JOIN DEPT D ON E.DEPTNO = D.DEPTNO;  -- 정상: ON은 두 컬럼이 따로 있어요" }
  ],
  res: { c: ["①", "②", "③", "④"], r: [[5, 5, 6, 5]] },
  pg: "SELECT (SELECT COUNT(*) FROM JSON_EACH((SELECT ROW_TO_JSON(X) FROM (SELECT * FROM EMP NATURAL JOIN DEPT) X))), (SELECT COUNT(*) FROM JSON_EACH((SELECT ROW_TO_JSON(X) FROM (SELECT * FROM EMP JOIN DEPT USING (DEPTNO)) X))), (SELECT COUNT(*) FROM JSON_EACH((SELECT ROW_TO_JSON(X) FROM (SELECT * FROM EMP E JOIN DEPT D ON E.DEPTNO = D.DEPTNO) X))), (SELECT COUNT(*) FROM JSON_EACH((SELECT ROW_TO_JSON(X) FROM (SELECT * FROM EMP LEFT OUTER JOIN DEPT USING (DEPTNO)) X)))",
  ox: ["5개라 답이 아니에요. NATURAL JOIN은 공통 컬럼 DEPTNO를 하나로 합쳐 맨 앞에 둬요.","5개라 답이 아니에요. USING도 조인 컬럼을 하나로 합쳐요.","정답이에요. ON 절은 양쪽 컬럼을 그대로 보여 줘서 E.DEPTNO와 D.DEPTNO가 모두 나와 6개예요.","5개라 답이 아니에요. 이렇게 생각하면 틀려요: '아우터 조인이면 양쪽 컬럼이 다 나온다.' USING을 쓰면 아우터 조인이어도 하나로 합쳐져요."],
  trap: "검증 쿼리는 결과 한 행을 JSON 객체로 바꾼 뒤 키 개수를 세어 컬럼 수를 확인해요. 이름이 같은 컬럼(DEPTNO)도 따로 세요.",
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
  sum: "RIGHT OUTER JOIN은 오른쪽 B의 행을 모두 남기는데, 짝이 여럿이면 그만큼 늘어나서 5건이에요. CROSS JOIN은 조건 없이 모든 짝이라 4 × 4 = 16건이에요.",
  why: "아우터 조인은 보통 조인 결과에 '짝을 못 찾은 기준 테이블 행'을 빈 값(NULL)으로 채워 덧붙인 거예요.\n\nRIGHT OUTER JOIN의 기준은 오른쪽 B예요. B의 각 행은 A에서 짝을 찾으면 짝 수만큼 행이 돼요. 짝이 없으면 A 쪽을 빈 값으로 채워 1행이 돼요.\n\n**기준 테이블 행은 최소 한 번은 나오지만, 짝이 여럿이면 그 수만큼 늘어나요.**\n\nB의 행마다 대입해 볼게요. 2는 A에 2가 하나라 1행이에요. 3은 A에 3이 두 개라 2행이에요. 4는 짝이 없어 빈 값으로 채운 1행이에요. NULL은 = 비교가 '모름'이라 짝이 없어서 역시 1행이에요. 모두 5행이에요.\n\nCROSS JOIN은 조건 없이 모든 행끼리 짝지어요. 값이 무엇이든(빈 값이어도) 상관없어요. 그래서 4 × 4 = 16행이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- (가)\nSELECT COUNT(*)\n  FROM A RIGHT OUTER JOIN B   -- ① 오른쪽 B의 4행은 모두 남겨요\n    ON A.K = B.K;             -- ② 2–2(1행), 3–3·3(2행) / 4·NULL은 짝 없음 → 빈 값으로 1행씩 → 5\n-- (나)\nSELECT COUNT(*)\n  FROM A CROSS JOIN B;        -- 조건 없이 모든 짝: 4 × 4 = 16" },
    { t: "[원본] A(1, 2, 3, 3) · B(2, 3, 4, NULL)" },
    { t: "1단계: (가) B 기준으로 짝 찾기", tb: { c: ["B.K","A에서 짝","결과 행 수"], r: [[2,"2",1],[3,"3, 3",2],[4,"없음 → NULL",1],["NULL","없음 → NULL",1]], hl: [1] }, n: "5행" },
    { t: "2단계: (나) CROSS JOIN", n: "A 4행 × B 4행 = 16행" }
  ],
  res: { c: ["가", "나"], r: [[5, 16]] },
  pg: "SELECT (SELECT COUNT(*) FROM A RIGHT OUTER JOIN B ON A.K = B.K), (SELECT COUNT(*) FROM A CROSS JOIN B)",
  ox: ["정답이에요. B의 3이 짝 두 개와 이어져 5건, CROSS JOIN은 16건이에요.","이렇게 생각하면 틀려요: '왼쪽 A를 기준으로 남긴다.' 그건 LEFT OUTER JOIN이에요(A의 1은 빈 값으로 1행, 2는 1행, 3·3은 1행씩 → 4행).","이렇게 생각하면 틀려요: '짝이 맞는 행만 센다.' 그건 보통 조인(INNER JOIN)이에요. 짝 없는 B의 4와 NULL도 빈 값으로 채워 남아요.","이렇게 생각하면 틀려요: 'CROSS JOIN에서 빈 값이 든 행은 빠진다.' CROSS JOIN은 값을 비교하지 않아서 모든 행을 짝지어요."],
  trap: "아우터 조인의 결과 행 수는 기준 테이블 행 수보다 클 수 있어요. 짝이 여러 개면 그만큼 늘어나요.",
  memo: "RIGHT OUTER = 오른쪽 전부 남김 / CROSS = M × N"
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
  sum: "Oracle은 집합 연산자를 괄호가 없으면 위에서부터 차례로 처리해요. (T1 UNION T2) INTERSECT T3이라서 4만 남아요.",
  why: "Oracle에서 UNION, UNION ALL, INTERSECT, MINUS는 모두 같은 순위예요. 괄호가 없으면 위에서 아래로 차례대로 처리해요.\n\n곱셈이 덧셈보다 먼저인 산수와 달리, Oracle에는 '교집합이 먼저'라는 규칙이 없어요. 반면 SQL 표준과 PostgreSQL·SQL Server는 INTERSECT를 먼저 처리해요. 그래서 같은 SQL이 DBMS마다 결과가 달라요.\n\n**Oracle에서는 (T1 UNION T2) INTERSECT T3로 처리돼요.**\n\n차례로 대입해 볼게요. 먼저 T1 UNION T2를 해요. UNION은 겹치는 값을 지우니 {1, 2, 2, 3}과 {3, 4}를 합쳐 {1, 2, 3, 4}예요. 그다음 이 결과와 T3 {4, 5}에 모두 있는 값만 남겨요. 그건 4 하나예요.\n\n마지막 ORDER BY 1은 집합 연산이 다 끝난 결과 전체에 한 번만 적용돼요. 그래서 답은 4예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT K FROM T1     -- ① {1, 2, 2, 3}\nUNION                -- ② ①과 합치고 겹치는 값 지우기 → {1, 2, 3, 4}\nSELECT K FROM T2     --    {3, 4}\nINTERSECT            -- ③ ②의 결과와 양쪽에 다 있는 값만 (Oracle: 위에서부터 차례로) → {4}\nSELECT K FROM T3     --    {4, 5}\nORDER BY 1;          -- ④ 최종 결과 전체를 정렬 → 4" },
    { t: "1단계: T1 UNION T2", tb: { c: ["K"], r: [[1],[2],[3],[4]] }, n: "UNION은 겹치는 값(2, 2)을 하나로 지워요." },
    { t: "2단계: (1단계 결과) INTERSECT T3", tb: { c: ["K"], r: [[4]] }, n: "{1, 2, 3, 4} ∩ {4, 5} = {4}" },
    { t: "비교: SQL 표준·PostgreSQL·SQL Server", n: "INTERSECT를 UNION보다 먼저 해요. 그래서 T1 UNION (T2 INTERSECT T3) = {1, 2, 3} ∪ {4} = {1, 2, 3, 4}가 돼요." },
    { t: "의도대로 쓰려면: INTERSECT를 먼저 하고 싶으면 괄호", n: "SELECT K FROM T1\nUNION\n(SELECT K FROM T2\n INTERSECT\n SELECT K FROM T3)\nORDER BY 1;          -- 1, 2, 3, 4 ({1, 2, 3} ∪ {4})" }
  ],
  res: { c: ["K"], r: [[4]] },
  pg: "(SELECT K FROM T1 UNION SELECT K FROM T2) INTERSECT SELECT K FROM T3 ORDER BY 1",
  ox: ["정답이에요. 위에서부터 UNION → INTERSECT 순서로 처리해요.","이렇게 생각하면 틀려요: 'INTERSECT가 먼저다.' SQL 표준(PostgreSQL, SQL Server) 결과예요. Oracle에서 이 결과를 원하면 T2 INTERSECT T3를 괄호로 묶어야 해요.","이렇게 생각하면 틀려요: 'UNION은 겹치는 값을 그대로 둔다.' 그건 UNION ALL이에요. 게다가 INTERSECT를 먼저 처리했어요.","이렇게 생각하면 틀려요: 'INTERSECT도 합치는 연산이다.' INTERSECT는 양쪽에 모두 있는 값만 남겨요."],
  trap: "검증용 PostgreSQL은 INTERSECT를 먼저 처리해요. 그래서 Oracle 순서를 따라 하려고 앞의 UNION을 괄호로 묶어 실행했어요. 실무에서도 괄호로 순서를 분명히 적는 게 안전해요.",
  memo: "Oracle 집합 연산자 = 순위 같음, 위에서 아래로"
}
);
