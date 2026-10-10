// 제2과목 · SQL 기본 및 활용 (C: DML·TCL·DDL·DCL·제약조건·단일행 함수·기본 연산)
// Oracle 고유 동작(DDL 자동 커밋, '' = NULL, DECODE 등)은 PostgreSQL과 달라 DB 검증 대신 해설로 근거를 밝힌다.
(window.QB = window.QB || []).push(
{
  id: "S45", s: 2, tp: "dml", lv: 2,
  th: "2과목 | MERGE 문의 MATCHED / NOT MATCHED",
  q: "다음 MERGE 문을 실행한 뒤 [TGT] 테이블의 내용으로 옳은 것은?",
  tb: [
    { n: "TGT", c: ["ID", "V"], r: [[1, "A"], [2, "B"]] },
    { n: "SRC", c: ["ID", "V"], r: [[2, "X"], [3, "Y"]] }
  ],
  sql: "MERGE INTO TGT T\nUSING SRC S\n   ON (T.ID = S.ID)\n WHEN MATCHED THEN\n      UPDATE SET T.V = S.V\n WHEN NOT MATCHED THEN\n      INSERT (ID, V) VALUES (S.ID, S.V);",
  o: ["(1, A), (2, X), (3, Y)", "(1, A), (2, B), (3, Y)", "(2, X), (3, Y)", "(1, A), (2, X)"],
  a: 0,
  why: "MERGE는 USING 쪽(SRC) 행을 하나씩 꺼내 ON 조건으로 대상(TGT)과 맞춰 본다. 짝이 있으면 WHEN MATCHED(UPDATE), 없으면 WHEN NOT MATCHED(INSERT)를 수행한다. SRC에 없는 TGT 행(ID 1)은 아무 영향도 받지 않는다.",
  st: [
    { t: "SRC 행별 처리", tb: { c: ["SRC 행", "TGT에 같은 ID?", "동작"], r: [["(2, X)", "있음", "UPDATE → (2, X)"], ["(3, Y)", "없음", "INSERT → (3, Y)"]] } }
  ],
  res: { c: ["ID", "V"], r: [[1, "A"], [2, "X"], [3, "Y"]] },
  pg: "MERGE INTO TGT T USING SRC S ON (T.ID = S.ID) WHEN MATCHED THEN UPDATE SET V = S.V WHEN NOT MATCHED THEN INSERT (ID, V) VALUES (S.ID, S.V); SELECT ID, V FROM TGT ORDER BY ID",
  ox: ["정답.", "MATCHED 행의 UPDATE를 빠뜨린 경우다.", "SRC에 없는 TGT 행이 삭제된다고 본 경우다. MERGE는 지정하지 않은 행을 지우지 않는다.", "NOT MATCHED의 INSERT를 빠뜨린 경우다."],
  trap: "Oracle에서는 ON 절에 쓴 컬럼(ID)을 UPDATE SET으로 바꿀 수 없다(ORA-38104).",
  memo: "MERGE = 있으면 UPDATE, 없으면 INSERT"
},
{
  id: "S46", s: 2, tp: "tcl", lv: 2,
  th: "2과목 | SAVEPOINT와 ROLLBACK TO",
  q: "다음 SQL을 순서대로 실행한 뒤 [T] 테이블에 남아 있는 ID 값으로 옳은 것은?",
  sql: "CREATE TABLE T (ID NUMBER);\nINSERT INTO T VALUES (1);\nCOMMIT;\nINSERT INTO T VALUES (2);\nSAVEPOINT SP1;\nINSERT INTO T VALUES (3);\nSAVEPOINT SP2;\nDELETE FROM T WHERE ID = 1;\nROLLBACK TO SP1;\nINSERT INTO T VALUES (4);\nCOMMIT;",
  o: ["1, 2, 4", "2, 4", "1, 2, 3, 4", "1, 4"],
  a: 0,
  why: "ROLLBACK TO SP1은 SP1 '이후'의 변경만 되돌린다. SP1 이전에 한 INSERT 2는 그대로 남는다. SP1 이후의 INSERT 3과 DELETE 1이 취소되고, 이어서 INSERT 4를 한 뒤 COMMIT으로 확정한다.",
  st: [
    { t: "단계별 테이블 상태", tb: { c: ["명령", "T 상태", "비고"], r: [["INSERT 1 + COMMIT", "{1}", "확정"], ["INSERT 2", "{1, 2}", ""], ["SAVEPOINT SP1", "{1, 2}", "SP1 표시"], ["INSERT 3", "{1, 2, 3}", ""], ["SAVEPOINT SP2", "{1, 2, 3}", ""], ["DELETE ID = 1", "{2, 3}", ""], ["ROLLBACK TO SP1", "{1, 2}", "SP1 이후 취소"], ["INSERT 4 + COMMIT", "{1, 2, 4}", "확정"]], hl: [6, 7] } }
  ],
  pgSetup: "CREATE TABLE T (ID numeric);",
  res: { c: ["ID"], r: [[1], [2], [4]] },
  pg: "BEGIN; INSERT INTO T VALUES (1); COMMIT; BEGIN; INSERT INTO T VALUES (2); SAVEPOINT SP1; INSERT INTO T VALUES (3); SAVEPOINT SP2; DELETE FROM T WHERE ID = 1; ROLLBACK TO SP1; INSERT INTO T VALUES (4); COMMIT; SELECT ID FROM T ORDER BY ID",
  ox: ["정답.", "DELETE가 취소되지 않았다고 본 경우다.", "INSERT 3이 취소되지 않았다고 본 경우다.", "INSERT 2까지 취소된다고 본 경우다."],
  trap: "SAVEPOINT 문제는 ROLLBACK 위치를 먼저 찾고, 그 SAVEPOINT 이후의 명령에 줄을 그어 지우면 빠르다.",
  memo: "ROLLBACK TO SP = SP 이후만 취소"
},
{
  id: "S47", s: 2, tp: "tcl", lv: 3,
  th: "2과목 | DDL의 자동 커밋 (Oracle)",
  q: "Oracle에서 다음 SQL을 순서대로 실행한 뒤 [T] 테이블의 행 수는? (T는 비어 있는 상태에서 시작한다.)",
  sql: "INSERT INTO T VALUES (1);\nINSERT INTO T VALUES (2);\nCREATE TABLE X (C NUMBER);\nINSERT INTO T VALUES (3);\nROLLBACK;",
  o: ["0", "1", "2", "3"],
  a: 2,
  why: "Oracle에서 DDL(Data Definition Language, 데이터 정의어)은 실행 직전과 직후에 자동으로 COMMIT을 한다(Auto-Commit). CREATE TABLE X가 실행되는 순간 앞의 INSERT 1, 2가 확정되므로, 마지막 ROLLBACK은 INSERT 3만 되돌린다.",
  st: [
    { t: "단계별 상태", tb: { c: ["명령", "확정된 행", "미확정 행"], r: [["INSERT 1, 2", "—", "1, 2"], ["CREATE TABLE X (자동 COMMIT)", "1, 2", "—"], ["INSERT 3", "1, 2", "3"], ["ROLLBACK", "1, 2", "—"]], hl: [1] } }
  ],
  ox: ["DDL의 자동 커밋을 모르고 모두 롤백된다고 본 경우다.", "근거 없는 값이다.", "정답.", "ROLLBACK이 아무것도 취소하지 않는다고 본 경우다."],
  trap: "PostgreSQL이나 SQL Server는 DDL도 트랜잭션 안에서 롤백할 수 있다. SQLD는 Oracle 기준이므로 'DDL = 자동 커밋'으로 푼다.",
  memo: "DDL 실행 = 앞의 DML까지 COMMIT"
},
{
  id: "S48", s: 2, tp: "ddl", lv: 1,
  th: "2과목 | DELETE · TRUNCATE · DROP 비교",
  q: "DELETE, TRUNCATE, DROP에 대한 설명으로 가장 적절하지 않은 것은?",
  o: [
    "DELETE는 DML(Data Manipulation Language, 데이터 조작어)이므로 COMMIT 전이면 ROLLBACK으로 되돌릴 수 있다.",
    "TRUNCATE는 DDL이므로 실행 즉시 확정되어 ROLLBACK할 수 없고, 사용하던 저장 공간을 반환한다.",
    "DROP은 데이터뿐 아니라 테이블 구조(정의) 자체를 삭제한다.",
    "TRUNCATE는 WHERE 절을 사용하여 조건에 맞는 행만 골라 삭제할 수 있다."
  ],
  a: 3,
  why: "TRUNCATE는 테이블의 모든 행을 한 번에 잘라 내고 구조만 남기는 DDL이다. 행 단위 조건(WHERE)을 쓸 수 없다. 특정 행만 지우려면 DELETE를 써야 한다.",
  st: [
    { t: "삭제 명령 비교", tb: { c: ["항목", "DELETE", "TRUNCATE", "DROP"], r: [["분류", "DML", "DDL", "DDL"], ["ROLLBACK", "가능(커밋 전)", "불가", "불가"], ["WHERE", "가능", "불가", "불가"], ["저장 공간", "유지", "반환(초기화)", "전부 반환"], ["테이블 구조", "남음", "남음", "삭제"]], hl: [2] } }
  ],
  ox: ["옳다.", "옳다.", "옳다.", "틀리다. TRUNCATE에는 WHERE 절을 쓸 수 없다."],
  trap: "'DELETE 후 저장 공간도 줄어든다'는 보기도 자주 나온다. DELETE는 행을 지워도 할당된 공간을 그대로 둔다.",
  memo: "DELETE 행만 / TRUNCATE 전부(구조 유지) / DROP 구조까지"
},
{
  id: "S49", s: 2, tp: "ddl", lv: 1,
  th: "2과목 | SQL 명령어 분류 (DDL · DML · DCL · TCL)",
  q: "SQL 명령어의 분류가 바르지 않은 것은?",
  o: [
    "DDL — CREATE, ALTER, DROP, RENAME, TRUNCATE",
    "DML — INSERT, UPDATE, DELETE, TRUNCATE",
    "DCL(Data Control Language, 데이터 제어어) — GRANT, REVOKE",
    "TCL(Transaction Control Language, 트랜잭션 제어어) — COMMIT, ROLLBACK, SAVEPOINT"
  ],
  a: 1,
  why: "TRUNCATE는 데이터를 지우지만 테이블 저장 구조를 초기화하는 명령이라 DDL로 분류된다. DML은 INSERT, UPDATE, DELETE, MERGE이며, 일부 교재는 SELECT를 DQL(Data Query Language, 데이터 질의어)로 따로 분류한다.",
  ox: ["옳다.", "틀리다. TRUNCATE는 DDL이다.", "옳다.", "옳다."],
  trap: "'데이터를 지운다 → DML'이라는 직관을 노리는 문제다.",
  memo: "TRUNCATE는 DDL"
},
{
  id: "S50", s: 2, tp: "dml", lv: 2,
  th: "2과목 | 외래키(FK) 제약과 NULL",
  q: "다음 테이블이 있을 때, 오류가 발생하는 SQL은?",
  tb: [
    { n: "DEPT", c: ["DEPTNO (PK)"], r: [[10], [20]] },
    { n: "EMP", c: ["EMPNO (PK)", "DEPTNO (FK → DEPT)"], r: [[100, 10]] }
  ],
  sql: "① INSERT INTO EMP VALUES (1, 10);\n② INSERT INTO EMP VALUES (2, NULL);\n③ INSERT INTO EMP VALUES (3, 30);\n④ DELETE FROM DEPT WHERE DEPTNO = 20;",
  o: ["①", "②", "③", "④"],
  a: 2,
  why: "FK(Foreign Key, 외래키)는 '값이 있다면 부모 테이블에 반드시 존재해야 한다'는 참조 무결성 제약이다. DEPT에 30번 부서가 없으므로 ③은 ORA-02291(부모 키가 없습니다) 오류가 난다. FK 컬럼에 NOT NULL이 따로 없으면 NULL은 허용된다.",
  ox: ["10번 부서가 존재하므로 정상이다.", "FK 컬럼의 NULL은 허용된다.", "정답. 부모 키(30)가 없다.", "20번 부서를 참조하는 자식 행이 없으므로 삭제할 수 있다. 10번을 지우려 했다면 ORA-02292 오류가 난다."],
  trap: "'FK에는 NULL을 넣을 수 없다'고 착각하기 쉽다. NULL을 막으려면 NOT NULL 제약을 별도로 걸어야 한다.",
  memo: "FK = 있으면 부모에 존재, NULL은 통과"
},
{
  id: "S51", s: 2, tp: "dml", lv: 2,
  th: "2과목 | ON DELETE SET NULL / CASCADE",
  q: "CHILD.PID가 PARENT.ID를 ON DELETE SET NULL 옵션으로 참조할 때, 다음 SQL의 결과로 옳은 것은?",
  tb: [
    { n: "PARENT", c: ["ID"], r: [[1], [2]] },
    { n: "CHILD", c: ["CID", "PID"], r: [[10, 1], [11, 1], [12, 2]] }
  ],
  sql: "DELETE FROM PARENT WHERE ID = 1;\n\nSELECT COUNT(*), COUNT(PID) FROM CHILD;",
  o: ["3, 1", "1, 1", "3, 3", "1, 0"],
  a: 0,
  why: "ON DELETE SET NULL은 부모 행이 삭제될 때 그 부모를 참조하던 자식 행을 지우지 않고 FK 컬럼만 NULL로 바꾼다. ON DELETE CASCADE였다면 자식 행이 함께 삭제되어 1, 1이 된다.",
  st: [
    { t: "삭제 후 CHILD", tb: { c: ["CID", "PID"], r: [[10, null], [11, null], [12, 2]], hl: [0, 1] } },
    { t: "옵션별 비교", tb: { c: ["옵션", "자식 행", "COUNT(*), COUNT(PID)"], r: [["SET NULL", "남고 PID만 NULL", "3, 1"], ["CASCADE", "함께 삭제", "1, 1"], ["지정 없음(기본)", "삭제 거부(ORA-02292)", "3, 3"]], hl: [0] } }
  ],
  pgSetup: "ALTER TABLE PARENT ADD PRIMARY KEY (ID); ALTER TABLE CHILD ADD FOREIGN KEY (PID) REFERENCES PARENT (ID) ON DELETE SET NULL;",
  res: { c: ["COUNT(*)", "COUNT(PID)"], r: [[3, 1]] },
  pg: "DELETE FROM PARENT WHERE ID = 1; SELECT COUNT(*), COUNT(PID) FROM CHILD",
  ox: ["정답.", "CASCADE일 때의 결과다.", "옵션이 없어 삭제 자체가 실패한 경우의 상태다.", "근거 없는 값이다."],
  trap: "COUNT(*)와 COUNT(PID)를 함께 물어 SET NULL과 CASCADE를 구분하는지 확인한다.",
  memo: "SET NULL = 자식 남김, CASCADE = 자식 삭제"
},
{
  id: "S52", s: 2, tp: "ddl", lv: 3,
  th: "2과목 | WITH GRANT OPTION과 REVOKE의 연쇄 회수",
  q: "Oracle에서 다음 명령을 차례로 실행한 뒤, 테이블 T(소유자 A)를 SELECT할 수 있는 사용자는? (소유자 A는 제외한다.)",
  sql: "-- A 계정\nGRANT SELECT ON T TO B WITH GRANT OPTION;\n-- B 계정\nGRANT SELECT ON A.T TO C;\n-- A 계정\nREVOKE SELECT ON T FROM B;",
  o: ["B, C", "C", "없음", "B"],
  a: 2,
  why: "객체 권한을 WITH GRANT OPTION으로 받은 사용자(B)가 다른 사용자(C)에게 다시 준 경우, 처음 준 사람(A)이 B의 권한을 회수하면 B가 C에게 준 권한도 연쇄적으로(Cascade) 함께 회수된다.",
  st: [
    { t: "권한 흐름", tb: { c: ["단계", "B", "C"], r: [["A → B (WITH GRANT OPTION)", "O", "X"], ["B → C", "O", "O"], ["A가 B에게서 REVOKE", "X", "X (연쇄 회수)"]], hl: [2] } },
    { t: "비교: 시스템 권한", n: "CREATE TABLE 같은 시스템 권한을 WITH ADMIN OPTION으로 준 경우에는 회수가 연쇄되지 않는다. B만 잃고 C는 그대로 유지한다." }
  ],
  ox: ["회수가 전혀 반영되지 않았다고 본 경우다.", "WITH ADMIN OPTION(시스템 권한)일 때의 결과다.", "정답.", "근거 없는 값이다."],
  trap: "GRANT OPTION(객체 권한)은 연쇄 회수, ADMIN OPTION(시스템 권한)은 연쇄 회수 없음 — 이름이 비슷해 반대로 외우기 쉽다.",
  memo: "객체 권한 GRANT OPTION → 줄줄이 회수"
},
{
  id: "S53", s: 2, tp: "fn", lv: 2,
  th: "2과목 | 문자 함수 SUBSTR · INSTR · TRIM · LPAD",
  q: "다음 SQL의 결과로 옳은 것은?",
  sql: "SELECT SUBSTR('DATABASE', 3, 4)       AS C1,\n       INSTR('DATABASE', 'A', 1, 3)   AS C2,\n       LENGTH(TRIM('  SQL  '))        AS C3,\n       LPAD('7', 3, '0')               AS C4\n  FROM DUAL;",
  o: ["TABA, 6, 3, 007", "TABA, 4, 3, 007", "ATAB, 6, 7, 700", "TABA, 6, 7, 007"],
  a: 0,
  why: "SUBSTR(문자, 시작, 길이)는 시작 위치부터 길이만큼 자른다. INSTR(문자, 찾을 문자, 시작, n번째)는 n번째로 나오는 위치를 돌려준다. TRIM은 양쪽 공백을 지운다. LPAD(문자, 전체 길이, 채울 문자)는 왼쪽을 채운다.",
  st: [
    { t: "'DATABASE' 위치표", tb: { c: ["1", "2", "3", "4", "5", "6", "7", "8"], r: [["D", "A", "T", "A", "B", "A", "S", "E"]] }, n: "3번째부터 4글자 = TABA / 'A'는 2, 4, 6번째 위치 → 세 번째 A는 6" },
    { t: "결과", tb: { c: ["식", "결과"], r: [["SUBSTR('DATABASE', 3, 4)", "TABA"], ["INSTR('DATABASE', 'A', 1, 3)", 6], ["LENGTH(TRIM('  SQL  '))", 3], ["LPAD('7', 3, '0')", "007"]] } }
  ],
  res: { c: ["C1", "C2", "C3", "C4"], r: [["TABA", 6, 3, "007"]] },
  pg: "SELECT SUBSTR('DATABASE', 3, 4), REGEXP_INSTR('DATABASE', 'A', 1, 3), LENGTH(TRIM('  SQL  ')), LPAD('7', 3, '0')",
  ox: ["정답.", "INSTR에서 두 번째 A의 위치를 답한 경우다.", "SUBSTR 시작 위치를 하나 앞으로 잡고, TRIM 전 길이(7)를 세고, LPAD를 RPAD로 본 경우다.", "TRIM 전 길이(7)를 센 경우다."],
  trap: "SQL의 문자열 위치는 0이 아니라 1부터 센다.",
  memo: "SUBSTR(문자, 시작, 길이) / INSTR(문자, 찾기, 시작, 몇 번째)"
},
{
  id: "S54", s: 2, tp: "fn", lv: 2,
  th: "2과목 | 숫자 함수 ROUND · CEIL · FLOOR와 음수",
  q: "다음 숫자 함수의 결과로 옳지 않은 것은?",
  o: ["ROUND(-15.75, 1) = -15.8", "CEIL(-15.75) = -15", "FLOOR(-15.75) = -15", "ROUND(1234.5, -2) = 1200"],
  a: 2,
  why: "CEIL은 '그 수 이상인 가장 작은 정수'(수직선 오른쪽), FLOOR는 '그 수 이하인 가장 큰 정수'(수직선 왼쪽)다. 음수에서는 -15.75보다 작은 정수가 -16이므로 FLOOR(-15.75) = -16이다. ROUND의 두 번째 인자가 음수면 정수 부분에서 반올림한다(-2 → 십의 자리에서 반올림하여 백의 자리까지).",
  st: [
    { t: "수직선으로 보기", n: "  -16 ──── -15.75 ──── -15\n  FLOOR ←       → CEIL" },
    { t: "결과", tb: { c: ["식", "결과"], r: [["ROUND(-15.75, 1)", -15.8], ["CEIL(-15.75)", -15], ["FLOOR(-15.75)", -16], ["ROUND(1234.5, -2)", 1200]], hl: [2] } }
  ],
  res: { c: ["R1", "C", "F", "R2"], r: [[-15.8, -15, -16, 1200]] },
  pg: "SELECT ROUND(-15.75, 1), CEIL(-15.75), FLOOR(-15.75), ROUND(1234.5, -2)",
  ox: ["옳다.", "옳다. -15.75 이상인 가장 작은 정수는 -15다.", "정답(틀린 진술). FLOOR(-15.75)는 -16이다.", "옳다. 34.5를 반올림하면 0이 되어 1200이다."],
  trap: "양수에서 'CEIL = 올림, FLOOR = 버림'으로 외우면 음수에서 틀린다. 버림(소수점 아래를 잘라 0 쪽으로)은 TRUNC다. TRUNC(-15.75) = -15.",
  memo: "CEIL → 오른쪽, FLOOR → 왼쪽, TRUNC → 0 쪽"
},
{
  id: "S55", s: 2, tp: "nullfn", lv: 3,
  th: "2과목 | DECODE와 CASE의 NULL 비교 차이",
  q: "다음 SQL의 결과로 옳은 것은? (Oracle 기준)",
  sql: "SELECT DECODE(NULL, NULL, 'Y', 'N')            AS D,\n       CASE NULL WHEN NULL THEN 'Y' ELSE 'N' END AS C\n  FROM DUAL;",
  o: ["Y, N", "Y, Y", "N, N", "N, Y"],
  a: 0,
  why: "DECODE는 Oracle 전용 함수로, 비교할 때 NULL과 NULL을 같은 것으로 취급한다. 반면 단순 CASE(CASE 식 WHEN 값)는 내부적으로 '식 = 값' 비교를 하므로 NULL = NULL이 UNKNOWN이 되어 WHEN을 통과하지 못하고 ELSE로 간다. NULL을 판별하려면 CASE WHEN 식 IS NULL THEN을 써야 한다.",
  st: [
    { t: "비교 방식", tb: { c: ["함수", "비교", "결과"], r: [["DECODE(NULL, NULL, …)", "NULL과 NULL을 같다고 봄", "Y"], ["CASE NULL WHEN NULL", "NULL = NULL → UNKNOWN", "N"]] } }
  ],
  ox: ["정답.", "CASE도 NULL을 같게 본다고 본 경우다.", "DECODE도 일반 비교처럼 동작한다고 본 경우다.", "두 함수를 반대로 본 경우다."],
  trap: "DECODE의 NULL 처리는 집합 연산·GROUP BY처럼 '같은 값으로 묶는' 쪽에 가깝다.",
  memo: "DECODE: NULL = NULL 인정 / CASE: IS NULL로만"
},
{
  id: "S56", s: 2, tp: "basic", lv: 2,
  th: "2과목 | LIKE 와일드카드와 ESCAPE",
  q: "다음 (가), (나) SQL의 결과 건수로 옳은 것은? (문자열 비교는 대소문자를 구분한다.)",
  tb: [{ n: "T", c: ["TXT"], r: [["A_C"], ["ABC"], ["A%C"], ["AXXC"], ["a_c"]] }],
  sql: "(가) SELECT COUNT(*) FROM T WHERE TXT LIKE 'A\\_C' ESCAPE '\\';\n(나) SELECT COUNT(*) FROM T WHERE TXT LIKE 'A_C';",
  o: ["(가) 1, (나) 3", "(가) 1, (나) 4", "(가) 3, (나) 3", "(가) 2, (나) 3"],
  a: 0,
  why: "LIKE에서 _는 '정확히 한 글자', %는 '0글자 이상'을 뜻하는 와일드카드다. 밑줄(_) 문자 자체를 찾으려면 ESCAPE로 지정한 문자를 앞에 붙여 와일드카드 기능을 끈다.",
  st: [
    { t: "행별 판정", tb: { c: ["TXT", "(가) 'A' + 밑줄 문자 + 'C'", "(나) 'A' + 아무 한 글자 + 'C'"], r: [["A_C", "O", "O"], ["ABC", "X", "O"], ["A%C", "X", "O"], ["AXXC", "X", "X (가운데 2글자)"], ["a_c", "X (소문자)", "X (소문자)"]] } }
  ],
  res: { c: ["가", "나"], r: [[1, 3]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE TXT LIKE 'A\\_C' ESCAPE '\\'), (SELECT COUNT(*) FROM T WHERE TXT LIKE 'A_C')",
  ox: ["정답.", "AXXC도 맞는다고 본 경우다. _는 정확히 한 글자다.", "ESCAPE를 무시한 경우다.", "근거 없는 값이다."],
  trap: "'A%C'의 %는 데이터 속 문자일 뿐이다. 패턴 쪽에 있는 기호만 와일드카드로 동작한다.",
  memo: "_ = 한 글자, % = 0글자 이상, ESCAPE = 기호 자체"
},
{
  id: "S57", s: 2, tp: "basic", lv: 2,
  th: "2과목 | 논리 연산자 우선순위 (NOT > AND > OR)",
  q: "다음 SQL의 결과 건수는?",
  tb: [{ n: "PLAYER", c: ["NAME", "TEAM", "POS", "HEIGHT"], r: [["P1", "K01", "GK", 190], ["P2", "K01", "MF", 175], ["P3", "K02", "GK", 185], ["P4", "K02", "DF", 170], ["P5", "K03", "GK", 180]] }],
  sql: "SELECT COUNT(*)\n  FROM PLAYER\n WHERE TEAM = 'K01'\n    OR TEAM = 'K02'\n   AND POS = 'GK'\n   AND HEIGHT >= 185;",
  o: ["1", "2", "3", "4"],
  a: 2,
  why: "AND가 OR보다 먼저 계산된다. 따라서 조건은 TEAM = 'K01' OR (TEAM = 'K02' AND POS = 'GK' AND HEIGHT >= 185)로 묶인다. K01 팀은 포지션·키와 상관없이 모두 통과한다.",
  st: [
    { t: "행별 평가", tb: { c: ["NAME", "TEAM='K01'", "K02 AND GK AND ≥185", "결과"], r: [["P1", "T", "F", "O"], ["P2", "T", "F", "O"], ["P3", "F", "T", "O"], ["P4", "F", "F", "X"], ["P5", "F", "F", "X"]] }, n: "의도대로 (K01 또는 K02)인 185 이상 GK를 찾으려면 괄호가 필요하다 → P1, P3 2건" }
  ],
  res: { c: ["COUNT"], r: [[3]] },
  pg: "SELECT COUNT(*) FROM PLAYER WHERE TEAM = 'K01' OR TEAM = 'K02' AND POS = 'GK' AND HEIGHT >= 185",
  ox: ["근거 없는 값이다.", "괄호로 묶었을 때(의도한 조건)의 결과다.", "정답.", "근거 없는 값이다."],
  trap: "문장을 읽는 순서대로 왼쪽부터 계산하면 틀린다. 괄호 없는 OR는 항상 의심하자.",
  memo: "NOT > AND > OR"
},
{
  id: "S58", s: 2, tp: "basic", lv: 2,
  th: "2과목 | ORDER BY에서 NULL의 정렬 위치",
  q: "다음 SQL의 출력 순서로 옳은 것은? (Oracle 기준)",
  tb: [{ n: "T", c: ["NAME", "BONUS"], r: [["A", 100], ["B", null], ["C", 300], ["D", 200]] }],
  sql: "SELECT NAME\n  FROM T\n ORDER BY BONUS DESC;",
  o: ["B, C, D, A", "C, D, A, B", "A, D, C, B", "C, D, B, A"],
  a: 0,
  why: "Oracle은 정렬할 때 NULL을 가장 큰 값으로 취급한다. 그래서 오름차순(ASC)이면 맨 뒤, 내림차순(DESC)이면 맨 앞에 온다. SQL Server는 반대로 NULL을 가장 작은 값으로 취급한다. 위치를 바꾸려면 NULLS FIRST / NULLS LAST를 지정한다.",
  st: [
    { t: "정렬 결과", tb: { c: ["순서", "NAME", "BONUS"], r: [[1, "B", null], [2, "C", 300], [3, "D", 200], [4, "A", 100]], hl: [0] } }
  ],
  res: { c: ["NAME"], r: [["B"], ["C"], ["D"], ["A"]] },
  pg: "SELECT NAME FROM T ORDER BY BONUS DESC",
  ox: ["정답.", "NULL을 가장 작은 값으로 본 경우(SQL Server 방식)다.", "오름차순 결과에서 NULL 위치를 잘못 둔 경우다.", "근거 없는 순서다."],
  trap: "DBMS마다 다르다는 점이 포인트다. 문제에 'Oracle'인지 'SQL Server'인지 표기된 부분을 먼저 확인하자.",
  memo: "Oracle: NULL = 최댓값 (DESC면 맨 위)"
},
{
  id: "S59", s: 2, tp: "agg", lv: 2,
  th: "2과목 | 공집합에 대한 집계 함수",
  q: "다음 SQL의 결과로 옳은 것은?",
  tb: [{ n: "EMP", c: ["ENAME", "SAL"], r: [["A", 100], ["B", 200]] }],
  sql: "SELECT COUNT(*), SUM(SAL), MAX(SAL)\n  FROM EMP\n WHERE 1 = 2;",
  o: ["0, NULL, NULL", "0, 0, 0", "결과 행이 없다", "NULL, NULL, NULL"],
  a: 0,
  why: "WHERE 1 = 2는 항상 거짓이라 대상 행이 하나도 없다. 그래도 GROUP BY 없는 집계 쿼리는 '전체를 하나의 그룹'으로 보므로 결과 1행이 반드시 나온다. 그 행에서 COUNT(*)는 0, SUM·MAX·MIN·AVG는 계산할 값이 없어 NULL이다.",
  st: [
    { t: "비교: GROUP BY가 있을 때", n: "SELECT DEPT, COUNT(*) FROM EMP WHERE 1 = 2 GROUP BY DEPT;\n→ 만들어질 그룹 자체가 없으므로 0행" }
  ],
  res: { c: ["COUNT(*)", "SUM(SAL)", "MAX(SAL)"], r: [[0, null, null]] },
  pg: "SELECT COUNT(*), SUM(SAL), MAX(SAL) FROM EMP WHERE 1 = 2",
  ox: ["정답.", "SUM이 0을 돌려준다고 본 경우다. 0을 원하면 NVL(SUM(SAL), 0)을 써야 한다.", "GROUP BY가 있을 때의 결과다.", "COUNT는 NULL이 아니라 0을 돌려준다."],
  trap: "'행이 없다(0행)'와 '값이 NULL인 1행'을 구분해야 한다.",
  memo: "공집합: COUNT = 0, 나머지 = NULL (1행)"
},
{
  id: "S60", s: 2, tp: "basic", lv: 1,
  th: "2과목 | 순수 관계 연산자와 일반 집합 연산자",
  q: "다음 중 순수 관계 연산자에 해당하지 않는 것은?",
  o: ["SELECT", "PROJECT", "JOIN", "UNION"],
  a: 3,
  why: "관계 대수의 연산자는 두 갈래다. 순수 관계 연산자는 관계형 DB를 위해 새로 만든 SELECT·PROJECT·JOIN·DIVIDE, 일반 집합 연산자는 수학의 집합 이론에서 온 UNION·INTERSECTION·DIFFERENCE·PRODUCT다.",
  st: [
    { t: "관계 대수와 SQL 대응", tb: { c: ["구분", "연산자", "SQL 대응"], r: [["순수 관계", "SELECT", "WHERE 절 (행 선택)"], ["순수 관계", "PROJECT", "SELECT 절 (컬럼 선택)"], ["순수 관계", "JOIN", "JOIN"], ["순수 관계", "DIVIDE", "직접 대응 없음"], ["일반 집합", "UNION / INTERSECTION / DIFFERENCE", "UNION / INTERSECT / MINUS"], ["일반 집합", "PRODUCT", "CROSS JOIN"]] } }
  ],
  ox: ["순수 관계 연산자다. 단, SQL의 WHERE 절에 대응한다.", "순수 관계 연산자다. SQL의 SELECT 절에 대응한다.", "순수 관계 연산자다.", "정답. 일반 집합 연산자다."],
  trap: "관계 대수의 SELECT는 행을 고르는 연산이라 SQL의 WHERE 절에 대응한다. 이름이 같은 SQL의 SELECT 절과 짝지으면 틀린다.",
  memo: "순수 관계: 셀·프·조·디 (SELECT·PROJECT·JOIN·DIVIDE)"
},
{
  id: "S61", s: 2, tp: "fn", lv: 2,
  th: "2과목 | 검색형 CASE의 평가 순서",
  q: "다음 SQL의 결과를 ID 순서대로 나열한 것은?",
  tb: [{ n: "T", c: ["ID", "SAL"], r: [[1, 50], [2, 150], [3, 350]] }],
  sql: "SELECT ID,\n       CASE WHEN SAL >= 100 THEN 'A'\n            WHEN SAL >= 300 THEN 'B'\n            ELSE 'C'\n       END AS GRADE\n  FROM T;",
  o: ["C, A, A", "C, A, B", "A, A, B", "C, B, B"],
  a: 0,
  why: "CASE는 위에서부터 WHEN 조건을 차례로 검사하고, **처음으로 참이 되는 THEN 값을 돌려준 뒤 멈춘다**(Oracle 문서: 조건이 참인 첫 번째 WHEN…THEN 쌍을 찾는다). 프로그래밍의 if … else if … else와 같은 구조다. 왜 이렇게 정했냐면, CASE는 한 행에 결과를 하나만 정하는 문법이기 때문이다. 350은 >= 100도 참이고 >= 300도 참인데, 끝까지 다 검사하면 A와 B 중 무엇을 돌려줄지 정할 수 없다. 그래서 '먼저 걸린 쪽이 이긴다'로 정해 두었고, 아래 WHEN은 '위 조건들은 다 아니고 이것이면'이라는 뜻이 된다. 이 SQL에서는 300 이상이면 항상 100 이상이기도 하므로 **두 번째 줄(B)은 절대 실행되지 않는다**.",
  st: [
    { t: "행별 평가", tb: { c: ["ID", "SAL", "SAL >= 100", "SAL >= 300", "GRADE"], r: [[1, 50, "F", "F", "C (ELSE)"], [2, 150, "T", "—", "A"], [3, 350, "T", "검사 안 함", "A"]], hl: [2] } },
    { t: "의도대로 쓰려면: 좁은 조건을 위로", n: "SELECT ID,\n       CASE WHEN SAL >= 300 THEN 'B'\n            WHEN SAL >= 100 THEN 'A'\n            ELSE 'C'\n       END AS GRADE\n  FROM T;   -- 50→C, 150→A, 350→B" }
  ],
  res: { c: ["ID", "GRADE"], r: [[1, "C"], [2, "A"], [3, "A"]] },
  pg: "SELECT ID, CASE WHEN SAL >= 100 THEN 'A' WHEN SAL >= 300 THEN 'B' ELSE 'C' END FROM T ORDER BY ID",
  ox: ["정답.", "더 구체적인 조건이 우선한다고 본 경우다. CASE는 위에서부터 첫 번째로 맞는 것을 고른다.", "50도 A로 본 경우다.", "근거 없는 값이다."],
  trap: "범위 조건 CASE는 넓은 조건이 위에 있으면 아래 조건이 영영 실행되지 않는다. 출제자는 일부러 순서를 뒤집어 놓는다.",
  memo: "CASE = 첫 번째 참에서 멈춤"
},
{
  id: "S62", s: 2, tp: "fn", lv: 3,
  th: "2과목 | Oracle의 빈 문자열('')과 NULL, 문자열 연결",
  q: "다음 SQL의 결과로 옳은 것은? (Oracle 기준)",
  sql: "SELECT 'A' || NULL || 'B' AS C1,\n       LENGTH('')         AS C2\n  FROM DUAL;",
  o: ["'AB', NULL", "NULL, 0", "'AB', 0", "NULL, NULL"],
  a: 0,
  why: "Oracle에서 문자열 연결 연산자(||)는 NULL을 빈 문자열처럼 건너뛴다. 그래서 산술 연산(NULL + n = NULL)과 달리 결과가 NULL이 되지 않는다. 또한 Oracle은 길이 0인 문자열('')을 NULL로 저장·취급하므로 LENGTH('')는 0이 아니라 NULL이다.",
  st: [
    { t: "DBMS별 차이", tb: { c: ["식", "Oracle", "표준 SQL / PostgreSQL"], r: [["'A' || NULL || 'B'", "'AB'", "NULL"], ["LENGTH('')", "NULL", "0"], ["NULL + 1", "NULL", "NULL"]] } }
  ],
  ox: ["정답.", "|| 연산도 NULL이 전파된다고 본 경우(표준 SQL 방식)다.", "''를 길이 0인 문자열로 본 경우다.", "|| 연산의 NULL 처리를 잘못 본 경우다."],
  trap: "같은 NULL이라도 산술 연산은 NULL이 전파되고, Oracle의 문자열 연결은 전파되지 않는다.",
  memo: "Oracle: '' = NULL, 'A'||NULL = 'A'"
},
{
  id: "S63", s: 2, tp: "dml", lv: 2,
  th: "2과목 | INSERT와 NOT NULL · PK · DEFAULT 제약",
  q: "다음 테이블에서 오류 없이 실행되는 INSERT 문은?",
  sql: "CREATE TABLE T (\n  C1 NUMBER       PRIMARY KEY,\n  C2 VARCHAR2(10) NOT NULL,\n  C3 NUMBER       DEFAULT 0,\n  C4 DATE\n);\n\n① INSERT INTO T VALUES (1, 'A', 5);\n② INSERT INTO T (C1, C2) VALUES (2, 'B');\n③ INSERT INTO T (C1, C3) VALUES (3, 10);\n④ INSERT INTO T (C2, C3) VALUES ('D', 1);",
  o: ["①", "②", "③", "④"],
  a: 1,
  why: "컬럼 목록을 생략하면 테이블의 모든 컬럼(4개)에 값을 순서대로 줘야 한다. 컬럼 목록에서 빠진 컬럼에는 DEFAULT 값이 있으면 그 값이, 없으면 NULL이 들어간다. NOT NULL 컬럼이나 PK 컬럼에 NULL이 들어가면 오류다.",
  st: [
    { t: "보기별 판정", tb: { c: ["보기", "결과", "이유"], r: [["①", "오류", "값이 3개뿐 (ORA-00947: 값의 수가 충분하지 않음)"], ["②", "성공", "C3 = 0(DEFAULT), C4 = NULL"], ["③", "오류", "C2(NOT NULL)에 NULL (ORA-01400)"], ["④", "오류", "C1(PK)에 NULL (ORA-01400)"]], hl: [1] } }
  ],
  ox: ["값의 개수가 컬럼 수보다 적다.", "정답. 빠진 C3에는 DEFAULT 0이 들어간다.", "NOT NULL 컬럼 C2가 빠졌다.", "PK 컬럼 C1이 빠졌다. PK는 NOT NULL을 포함한다."],
  trap: "DEFAULT는 컬럼을 '생략'했을 때만 적용된다. 값을 명시적으로 NULL이라고 쓰면 DEFAULT 대신 NULL이 들어간다.",
  memo: "PK = UNIQUE + NOT NULL"
},
{
  id: "S64", s: 2, tp: "ddl", lv: 2,
  th: "2과목 | ALTER TABLE 문법 (Oracle)",
  q: "Oracle에서 오류가 발생하는 ALTER TABLE 문은?",
  sql: "① ALTER TABLE EMP ADD (AGE NUMBER(3));\n② ALTER TABLE EMP MODIFY (ENAME VARCHAR2(50));\n③ ALTER TABLE EMP RENAME COLUMN ENAME TO EMP_NAME;\n④ ALTER TABLE EMP ALTER COLUMN ENAME VARCHAR2(50);",
  o: ["①", "②", "③", "④"],
  a: 3,
  why: "Oracle에서 컬럼 정의를 바꿀 때는 MODIFY를 쓴다. ALTER COLUMN은 SQL Server 문법이다. 시험은 두 DBMS의 문법 차이를 섞어서 묻는다.",
  st: [
    { t: "DBMS별 문법", tb: { c: ["작업", "Oracle", "SQL Server"], r: [["컬럼 추가", "ADD (컬럼 타입)", "ADD 컬럼 타입"], ["컬럼 변경", "MODIFY (컬럼 타입)", "ALTER COLUMN 컬럼 타입"], ["컬럼 이름 변경", "RENAME COLUMN A TO B", "sp_rename"], ["컬럼 삭제", "DROP COLUMN 컬럼", "DROP COLUMN 컬럼"]], hl: [1] } }
  ],
  ox: ["정상.", "정상.", "정상.", "정답. Oracle에는 ALTER COLUMN 구문이 없다."],
  trap: "데이터가 들어 있는 컬럼의 크기를 기존 데이터보다 작게 줄이는 MODIFY는 Oracle에서도 오류가 난다.",
  memo: "Oracle = MODIFY, SQL Server = ALTER COLUMN"
},
{
  id: "S65", s: 2, tp: "agg", lv: 2,
  th: "2과목 | GROUP BY에서 NULL 그룹",
  q: "S01과 같은 [T] 테이블에 대해 다음 SQL의 결과 행 수는?",
  tb: [{ n: "T", c: ["ID", "DEPT", "BONUS"], r: [[1, 10, 100], [2, 10, null], [3, 20, 200], [4, null, 200], [5, 20, null], [6, 30, null]] }],
  sql: "SELECT DEPT, COUNT(*), SUM(BONUS)\n  FROM T\n GROUP BY DEPT;",
  o: ["3", "4", "5", "6"],
  a: 1,
  why: "GROUP BY는 그룹핑 컬럼이 NULL인 행들도 버리지 않고 'NULL 그룹' 하나로 모은다. 집계 함수가 NULL '값'을 건너뛰는 것과 혼동하면 안 된다.",
  st: [
    { t: "그룹 결과", tb: { c: ["DEPT", "COUNT(*)", "SUM(BONUS)"], r: [[10, 2, 100], [20, 2, 200], [30, 1, null], [null, 1, 200]], hl: [3] } }
  ],
  res: { c: ["DEPT", "COUNT(*)", "SUM(BONUS)"], r: [[10, 2, 100], [20, 2, 200], [30, 1, null], [null, 1, 200]] },
  pg: "SELECT DEPT, COUNT(*), SUM(BONUS) FROM T GROUP BY DEPT ORDER BY DEPT NULLS LAST",
  ox: ["NULL 그룹을 빠뜨린 경우다.", "정답.", "근거 없는 값이다.", "원본 행 수다."],
  trap: "30번 그룹의 SUM(BONUS)는 값이 모두 NULL이라 0이 아니라 NULL이다.",
  memo: "GROUP BY는 NULL도 한 그룹"
}
);
