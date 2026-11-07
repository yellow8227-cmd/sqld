// 제2과목 · SQL 기본 및 활용 — 최근 기출(60·61·62회, 2026) 함정 유형 보강 (S233~S254)
// INSERT ALL/FIRST · SAVEPOINT와 COMMIT · ALTER TABLE 문법 · ROLE 권한 · 비연관 EXISTS · 문자 MAX · ROWNUM · OFFSET/FETCH
// ROLLUP/CUBE/GROUPING SETS · NTILE/LAG · 기본 윈도우 프레임 · 비등가 조인 · 식별 관계 조인 · 인라인 뷰 별칭 · PIVOT/UNPIVOT · 계층형 질의 · 제약조건과 NULL · IN/NOT IN · MERGE DELETE WHERE
// Oracle 고유 동작(ROWNUM, CONNECT BY, INSERT ALL/FIRST, UNPIVOT, 권한, SAVEPOINT 오류)은 DB 검증 없이 해설로 근거를 밝힌다.
(window.QB = window.QB || []).push(
{
  id: "S233", s: 2, tp: "dml", lv: 3, kill: true, sub: "DML",
  th: "2과목 | INSERT ALL vs INSERT FIRST의 조건부 다중 테이블 INSERT (Oracle)",
  q: "(Oracle 기준) [SRC] 테이블로 아래 문장을 실행한다. 첫 줄을 INSERT ALL로 쓴 경우와 INSERT FIRST로 쓴 경우 각각, 실행 후 T_A, T_B, T_C의 행 수를 순서대로 나열한 것은? (T_A, T_B, T_C는 (ID, AMT) 구조의 빈 테이블이다.)",
  tb: [{ n: "SRC", c: ["ID", "AMT"], r: [[1, 50], [2, 150], [3, 300], [4, 80], [5, 500]] }],
  sql: "INSERT ALL   -- 또는 INSERT FIRST\n  WHEN AMT >= 100 THEN INTO T_A VALUES (ID, AMT)\n  WHEN AMT >= 300 THEN INTO T_B VALUES (ID, AMT)\n  ELSE                 INTO T_C VALUES (ID, AMT)\nSELECT ID, AMT FROM SRC;",
  o: ["ALL: 3, 2, 2 / FIRST: 3, 2, 2", "ALL: 3, 2, 5 / FIRST: 3, 0, 2", "ALL: 3, 2, 2 / FIRST: 3, 0, 2", "ALL: 3, 2, 2 / FIRST: 3, 0, 0"],
  a: 2,
  sum: "INSERT ALL은 행마다 WHEN을 전부 검사해 참인 곳에 모두 넣고, INSERT FIRST는 처음 참이 된 WHEN 하나에만 넣어요. ELSE는 둘 다 '참인 WHEN이 하나도 없을 때'만 동작해요.",
  why: "INSERT ALL과 INSERT FIRST는 SELECT 결과의 한 행을 조건에 따라 여러 테이블에 나눠 넣는 Oracle 문법이에요. 둘의 차이는 WHEN을 어디까지 검사하느냐예요.\n\n**INSERT ALL은 한 행에 대해 모든 WHEN을 검사해 참인 곳마다 넣고, INSERT FIRST는 위에서부터 검사하다가 처음 참이 된 WHEN 하나에만 넣고 멈춰요.** ELSE는 두 경우 모두 '참인 WHEN이 하나도 없을 때'에만 실행돼요.\n\nINSERT ALL로 보면, AMT가 150, 300, 500인 3행은 첫 WHEN(100 이상)이 참이라 T_A에 들어가요. 그중 300, 500은 둘째 WHEN(300 이상)도 참이라 T_B에도 들어가요. 50, 80은 어느 WHEN도 참이 아니라 ELSE로 T_C에 들어가요. 그래서 3, 2, 2예요.\n\nINSERT FIRST로 보면, 300과 500도 첫 WHEN에서 이미 참이라 T_A에만 들어가고 멈춰요. 둘째 WHEN까지 내려가는 행이 없어 T_B는 0행이에요. 50, 80은 똑같이 ELSE로 T_C에 들어가요. 그래서 3, 0, 2예요.\n\nINSERT FIRST에서 넓은 조건을 위에 두면 아래의 좁은 조건은 한 번도 실행되지 않아요. 좁은 조건(300 이상)을 먼저 써야 의도대로 나뉘어요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "INSERT ALL                                       -- ② 행마다 아래 WHEN을 전부 검사 (FIRST면 처음 참에서 멈춰요)\n  WHEN AMT >= 100 THEN INTO T_A VALUES (ID, AMT)  -- ③ 100 이상 → T_A\n  WHEN AMT >= 300 THEN INTO T_B VALUES (ID, AMT)  -- ④ 300 이상 → T_B (FIRST면 ③이 참인 행은 여기까지 안 와요)\n  ELSE                 INTO T_C VALUES (ID, AMT)  -- ⑤ 참인 WHEN이 하나도 없으면 → T_C\nSELECT ID, AMT FROM SRC;                          -- ① SRC 5행을 먼저 읽어요" },
    { t: "1단계: 행마다 조건 검사", tb: { c: ["ID", "AMT", "AMT >= 100", "AMT >= 300", "INSERT ALL", "INSERT FIRST"], r: [[1, 50, "X", "X", "T_C (ELSE)", "T_C (ELSE)"], [2, 150, "O", "X", "T_A", "T_A"], [3, 300, "O", "O", "T_A, T_B", "T_A"], [4, 80, "X", "X", "T_C (ELSE)", "T_C (ELSE)"], [5, 500, "O", "O", "T_A, T_B", "T_A"]], hl: [2, 4] }, n: "300, 500 행에서 ALL과 FIRST가 갈려요." },
    { t: "2단계: 테이블별 행 수", tb: { c: ["테이블", "INSERT ALL", "INSERT FIRST"], r: [["T_A", 3, 3], ["T_B", 2, 0], ["T_C", 2, 2]], hl: [1] } }
  ],
  ox: [
    "이렇게 생각하면 틀려요: 'INSERT FIRST도 모든 WHEN을 검사한다.' 그건 INSERT ALL이에요. FIRST는 300, 500 행을 첫 WHEN에서 T_A에 넣고 멈춰서 T_B에는 아무것도 안 들어가요.",
    "이렇게 생각하면 틀려요: 'INSERT ALL의 ELSE는 모든 행에 실행된다.' ELSE는 참인 WHEN이 하나도 없을 때만 실행돼요. T_C에는 50, 80 두 행만 들어가요.",
    "정답이에요. ALL은 300, 500을 T_A와 T_B 양쪽에 넣어 3, 2, 2이고, FIRST는 첫 WHEN에서 멈춰 3, 0, 2예요.",
    "이렇게 생각하면 틀려요: 'INSERT FIRST에서는 ELSE가 무시된다.' ELSE는 ALL과 FIRST 모두에서 동작해요. 50, 80은 FIRST에서도 T_C에 들어가요."
  ],
  trap: "INSERT FIRST에서 넓은 조건이 위에 있으면 아래의 좁은 조건은 한 번도 실행되지 않아요. WHEN의 순서를 꼭 확인하세요.",
  memo: "ALL = 참인 곳 전부 / FIRST = 첫 참 한 곳 / ELSE = 참이 하나도 없을 때"
},
{
  id: "S234", s: 2, tp: "tcl", lv: 3, kill: true, sub: "TCL",
  th: "2과목 | COMMIT 뒤의 ROLLBACK TO SAVEPOINT (Oracle)",
  q: "(Oracle 기준) 비어 있는 [T] 테이블에 다음 SQL을 순서대로 실행했다. 실행 결과에 대한 설명으로 옳은 것은?",
  sql: "INSERT INTO T VALUES (10);\nSAVEPOINT A;\nINSERT INTO T VALUES (20);\nCOMMIT;\nINSERT INTO T VALUES (30);\nROLLBACK TO A;\nINSERT INTO T VALUES (40);\nCOMMIT;",
  o: [
    "ROLLBACK TO A에서 오류가 발생하고, 최종적으로 T에는 4행이 남는다.",
    "ROLLBACK TO A에서 오류가 발생하고, 최종적으로 T에는 3행이 남는다.",
    "오류 없이 실행되고, 최종적으로 T에는 2행이 남는다.",
    "오류 없이 실행되고, 최종적으로 T에는 3행이 남는다."
  ],
  a: 0,
  sum: "COMMIT을 하면 그 트랜잭션의 SAVEPOINT가 모두 사라져요. 그래서 ROLLBACK TO A는 '없는 책갈피'라 오류가 나고 아무것도 되돌리지 않아서, 10, 20, 30, 40 네 행이 확정돼요.",
  why: "SAVEPOINT는 트랜잭션(하나로 묶여 확정되거나 취소되는 작업 단위) 안에 꽂는 책갈피예요. 책갈피는 그 트랜잭션 안에서만 의미가 있어요.\n\n**COMMIT으로 트랜잭션이 끝나면 그 안에서 만든 SAVEPOINT도 함께 사라져요.** 그래서 COMMIT 뒤의 ROLLBACK TO A는 존재하지 않는 책갈피를 찾게 되고, Oracle은 오류(ORA-01086)를 내요.\n\n오류가 난 문장은 아무 일도 하지 않아요. Oracle에서는 문장 하나가 실패하면 그 문장만 취소되고, 트랜잭션 전체가 취소되지는 않아요. 그래서 아직 확정 전인 INSERT 30은 그대로 살아 있어요.\n\n순서대로 보면, 10과 20은 첫 COMMIT으로 확정돼요. 새 트랜잭션에서 30을 넣고, ROLLBACK TO A는 오류로 끝나요. 이어서 40을 넣고 COMMIT하니 30과 40도 확정돼요.\n\n결과는 10, 20, 30, 40 네 행이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "INSERT INTO T VALUES (10);   -- ① 확정 전 {10}\nSAVEPOINT A;                 -- ② 책갈피 A (지금 트랜잭션 안에서만 유효)\nINSERT INTO T VALUES (20);   -- ③ 확정 전 {10, 20}\nCOMMIT;                      -- ④ {10, 20} 확정 → 트랜잭션 끝, 책갈피 A도 사라져요\nINSERT INTO T VALUES (30);   -- ⑤ 새 트랜잭션: 확정 전 {30}\nROLLBACK TO A;               -- ⑥ A가 없어요 → 오류(ORA-01086), 아무것도 안 되돌려요\nINSERT INTO T VALUES (40);   -- ⑦ 확정 전 {30, 40}\nCOMMIT;                      -- ⑧ {10, 20, 30, 40} 확정" },
    { t: "1단계: 단계별 상태", tb: { c: ["명령", "확정된 행", "확정 전 행", "살아 있는 책갈피"], r: [["INSERT 10, SAVEPOINT A, INSERT 20", "—", "10, 20", "A"], ["COMMIT", "10, 20", "—", "없음"], ["INSERT 30", "10, 20", "30", "없음"], ["ROLLBACK TO A → 오류", "10, 20", "30", "없음"], ["INSERT 40", "10, 20", "30, 40", "없음"], ["COMMIT", "10, 20, 30, 40", "—", "없음"]], hl: [1, 3] }, n: "오류 난 문장은 그 문장만 실패해요. 30은 살아 있어요." }
  ],
  ox: [
    "정답이에요. COMMIT에서 SAVEPOINT A가 사라져 ROLLBACK TO A는 오류가 나요. 오류 난 문장은 아무것도 되돌리지 않으니 30과 40까지 COMMIT되어 4행이에요.",
    "이렇게 생각하면 틀려요: '오류가 나면 확정 전 작업(30)도 함께 취소된다.' Oracle은 실패한 문장 하나만 취소해요. INSERT 30은 살아 있다가 마지막 COMMIT으로 확정돼요.",
    "이렇게 생각하면 틀려요: 'SAVEPOINT는 COMMIT 뒤에도 남는다.' 그렇다면 A 뒤의 20, 30이 취소되어 10, 40만 남겠지만, 실제로는 COMMIT에서 A가 사라져 ROLLBACK TO A가 오류예요.",
    "이렇게 생각하면 틀려요: 'ROLLBACK TO A가 COMMIT 뒤의 작업(30)만 되돌린다.' 사라진 책갈피로는 아무것도 되돌릴 수 없어요. 오류가 나고 30은 그대로 남아요."
  ],
  trap: "SAVEPOINT 이름과 ROLLBACK TO 사이에 COMMIT이 끼어 있으면 '되돌린다'가 아니라 '오류'예요. Oracle은 실패한 문장 하나만 취소하지만, PostgreSQL은 오류가 나면 트랜잭션 전체가 중단되어 마지막 COMMIT이 ROLLBACK처럼 처리돼요(10, 20만 남음). DBMS마다 결과가 달라지는 지점이에요.",
  memo: "COMMIT = 책갈피 전부 삭제 → ROLLBACK TO는 오류, 변화 없음"
},
{
  id: "S235", s: 2, tp: "ddl", lv: 2, kill: true, sub: "DDL",
  th: "2과목 | Oracle ALTER TABLE 제약 삭제 문법과 INSERT … SELECT vs CTAS",
  q: "(Oracle 기준) 다음 SQL 중 실행 시 오류가 발생하는 것을 모두 고른 것은? (각 문장은 같은 처음 상태에서 따로 실행한다. ORDERS 테이블에는 PK(Primary Key, 기본키) 제약조건과 외래키 제약조건 FK_ORD_CUST가 있고, ORDERS의 PK를 참조하는 다른 테이블은 없다. ORD_BAK은 ORDERS와 컬럼 구조가 같은 기존 테이블이고, ORD_BAK2는 아직 없는 테이블이다.)",
  sql: "-- ㄱ\nALTER TABLE ORDERS DROP CONSTRAINT FK_ORD_CUST;\n-- ㄴ\nALTER TABLE ORDERS DROP PRIMARY KEY;\n-- ㄷ\nALTER TABLE ORDERS DROP FOREIGN KEY FK_ORD_CUST;\n-- ㄹ\nINSERT INTO ORD_BAK AS SELECT * FROM ORDERS;\n-- ㅁ\nCREATE TABLE ORD_BAK2 AS SELECT * FROM ORDERS;\n-- ㅂ\nINSERT INTO ORD_BAK SELECT * FROM ORDERS;",
  o: ["ㄷ", "ㄹ, ㅂ", "ㄴ, ㄷ, ㄹ", "ㄷ, ㄹ"],
  a: 3,
  sum: "Oracle은 제약조건을 DROP CONSTRAINT 이름으로 지우고, 기본키만 DROP PRIMARY KEY로도 지울 수 있어요. DROP FOREIGN KEY는 MySQL 문법이고, AS SELECT는 CREATE TABLE에만 붙어서 ㄷ과 ㄹ이 오류예요.",
  why: "Oracle에서 ALTER TABLE로 제약조건을 지울 때는 DROP CONSTRAINT 제약조건이름이 기본 형태예요(ㄱ 정상). 기본키는 테이블에 하나뿐이라 이름 없이 DROP PRIMARY KEY로도 지울 수 있어요(ㄴ 정상).\n\n하지만 DROP FOREIGN KEY 이름은 MySQL에서 쓰는 문법이에요. Oracle에는 이 형태가 없어서 오류가 나요(ㄷ 오류). 외래키는 Oracle에서 DROP CONSTRAINT 이름으로 지워요.\n\n데이터 복사 문장도 비교해 볼게요. **AS SELECT는 CREATE TABLE에만 붙는 문법이고, INSERT에는 AS 없이 바로 SELECT를 붙여요.**\n\nCTAS(CREATE TABLE … AS SELECT)는 새 테이블을 만들면서 데이터를 복사해요(ㅁ 정상). INSERT INTO … SELECT는 이미 있는 테이블에 SELECT 결과를 넣어요(ㅂ 정상). INSERT INTO ORD_BAK AS SELECT는 두 문법을 섞은 것이라 문법 오류예요(ㄹ 오류).\n\n그래서 오류가 나는 것은 ㄷ과 ㄹ이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "ALTER TABLE ORDERS DROP CONSTRAINT FK_ORD_CUST;   -- ㄱ 정상: 이름으로 제약 삭제 (Oracle 기본 형태)\nALTER TABLE ORDERS DROP PRIMARY KEY;              -- ㄴ 정상: PK는 하나뿐이라 이름 없이 삭제 가능\nALTER TABLE ORDERS DROP FOREIGN KEY FK_ORD_CUST;  -- ㄷ 오류: MySQL 문법, Oracle에는 없어요\nINSERT INTO ORD_BAK AS SELECT * FROM ORDERS;      -- ㄹ 오류: INSERT에는 AS를 붙이지 않아요\nCREATE TABLE ORD_BAK2 AS SELECT * FROM ORDERS;    -- ㅁ 정상: CTAS, 새 테이블 + 데이터 복사\nINSERT INTO ORD_BAK SELECT * FROM ORDERS;         -- ㅂ 정상: 기존 테이블에 SELECT 결과 넣기" },
    { t: "1단계: 문장별 판정", tb: { c: ["문장", "판정", "이유"], r: [["ㄱ DROP CONSTRAINT 이름", "O", "Oracle의 기본 제약 삭제 문법"], ["ㄴ DROP PRIMARY KEY", "O", "PK는 테이블에 하나라 이름 생략 가능"], ["ㄷ DROP FOREIGN KEY 이름", "X", "MySQL 문법"], ["ㄹ INSERT INTO … AS SELECT", "X", "AS SELECT는 CREATE TABLE 전용"], ["ㅁ CREATE TABLE … AS SELECT", "O", "CTAS"], ["ㅂ INSERT INTO … SELECT", "O", "기존 테이블에 복사"]], hl: [2, 3] } }
  ],
  ox: [
    "이렇게 생각하면 틀려요: 'INSERT도 CREATE TABLE처럼 AS SELECT를 쓸 수 있다.' AS SELECT는 CTAS 전용이에요. ㄹ도 오류라 ㄷ 하나만 고르면 부족해요.",
    "이렇게 생각하면 틀려요: 'INSERT INTO … SELECT에는 AS나 VALUES가 꼭 필요하다.' ㅂ처럼 INSERT 뒤에 바로 SELECT를 붙이는 게 정상 문법이에요. 그리고 ㄷ의 DROP FOREIGN KEY도 Oracle에서는 오류예요.",
    "이렇게 생각하면 틀려요: 'DROP PRIMARY KEY에도 제약조건 이름이 필요하다.' 기본키는 테이블에 하나뿐이라 Oracle은 이름 없이 DROP PRIMARY KEY를 허용해요. ㄴ은 정상이에요.",
    "정답이에요. ㄷ의 DROP FOREIGN KEY는 MySQL 문법이라 Oracle에서 오류이고, ㄹ의 INSERT INTO … AS SELECT는 INSERT와 CTAS를 섞은 잘못된 문법이에요."
  ],
  trap: "MySQL의 DROP FOREIGN KEY, 그리고 CTAS와 섞인 INSERT … AS SELECT가 '그럴듯한 오답 문장'으로 나와요.",
  memo: "제약 삭제 = DROP CONSTRAINT 이름 (PK만 DROP PRIMARY KEY 가능) / AS SELECT는 CREATE TABLE 전용"
},
{
  id: "S236", s: 2, tp: "ddl", lv: 3, kill: true, sub: "DCL",
  th: "2과목 | DROP ROLE과 WITH ADMIN OPTION · WITH GRANT OPTION 회수 (Oracle)",
  q: "(Oracle 기준) 다음 명령을 차례로 실행한 뒤의 권한 상태에 대한 설명 중 옳은 것을 모두 고른 것은? (각 사용자는 마지막 명령 이후 새로 접속한다고 가정한다.) (LEE, YOON, HAN은 접속 권한을 이미 따로 가지고 있다.)",
  sql: "-- DBA 계정\nCREATE ROLE R_VIEW;\nCREATE ROLE R_TEAM;\n-- HR 계정 (EMP, DEPT 테이블의 소유자)\nGRANT SELECT ON EMP  TO R_VIEW;\nGRANT SELECT ON DEPT TO R_TEAM;\n-- DBA 계정\nGRANT R_VIEW TO R_TEAM;\nGRANT R_TEAM TO LEE;\nGRANT CREATE SESSION TO PARK WITH ADMIN OPTION;\n-- PARK 계정\nGRANT CREATE SESSION TO CHOI;\n-- HR 계정\nGRANT SELECT ON EMP TO YOON WITH GRANT OPTION;\n-- YOON 계정\nGRANT SELECT ON HR.EMP TO HAN;\n-- DBA 계정\nDROP ROLE R_VIEW;\nREVOKE CREATE SESSION FROM PARK;\n-- HR 계정\nREVOKE SELECT ON EMP FROM YOON;",
  box: "· ㄱ. LEE는 HR.EMP를 조회할 수 없다.\n· ㄴ. LEE는 HR.DEPT를 조회할 수 있다.\n· ㄷ. CHOI는 CREATE SESSION 권한을 잃는다.\n· ㄹ. HAN은 HR.EMP를 조회할 수 없다.",
  o: ["ㄱ, ㄴ", "ㄱ, ㄴ, ㄹ", "ㄴ, ㄷ, ㄹ", "ㄱ, ㄴ, ㄷ, ㄹ"],
  a: 1,
  sum: "ROLE을 지우면 그 ROLE을 거쳐 받은 권한이 사라져요. 시스템 권한의 WITH ADMIN OPTION 회수는 다른 사람에게 번지지 않고, 객체 권한의 WITH GRANT OPTION 회수는 번져요. 그래서 ㄱ, ㄴ, ㄹ이 옳아요.",
  why: "DCL(Data Control Language, 데이터 제어어)에서 ROLE(롤)은 여러 권한을 묶어 둔 꾸러미예요. 사용자나 다른 ROLE에 꾸러미째로 줄 수 있고, 꾸러미를 통해 받은 권한은 그 꾸러미가 있는 동안만 쓸 수 있어요.\n\nDROP ROLE R_VIEW로 꾸러미를 없애면, R_VIEW를 받은 R_TEAM과 그 R_TEAM을 받은 LEE에게서 HR.EMP 조회 권한이 사라져요(ㄱ 옳음). 반면 HR.DEPT 조회 권한은 R_TEAM에 직접 들어 있어서 그대로 남아요(ㄴ 옳음).\n\n권한을 다시 나눠 줄 수 있게 하는 옵션은 두 가지예요. 시스템 권한(CREATE SESSION 같은 것)에 붙이는 WITH ADMIN OPTION과, 객체 권한(테이블 SELECT 같은 것)에 붙이는 WITH GRANT OPTION이에요.\n\n**WITH ADMIN OPTION으로 받은 권한은 회수해도 그 사람이 나눠 준 권한이 남고, WITH GRANT OPTION으로 받은 권한은 회수하면 그 사람이 나눠 준 권한까지 줄줄이 회수돼요.** 그래서 PARK을 회수해도 CHOI의 CREATE SESSION은 남고(ㄷ 틀림), YOON을 회수하면 HAN의 HR.EMP 조회 권한도 사라져요(ㄹ 옳음).\n\n옳은 것은 ㄱ, ㄴ, ㄹ이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "CREATE ROLE R_VIEW; CREATE ROLE R_TEAM;           -- ① 빈 꾸러미 두 개\nGRANT SELECT ON EMP  TO R_VIEW;                   -- ② R_VIEW = {EMP 조회}\nGRANT SELECT ON DEPT TO R_TEAM;                   -- ③ R_TEAM = {DEPT 조회}\nGRANT R_VIEW TO R_TEAM;                           -- ④ R_TEAM = {DEPT 조회, R_VIEW}\nGRANT R_TEAM TO LEE;                              -- ⑤ LEE → R_TEAM → (DEPT, R_VIEW → EMP)\nGRANT CREATE SESSION TO PARK WITH ADMIN OPTION;   -- ⑥ 시스템 권한 + ADMIN\nGRANT CREATE SESSION TO CHOI;   (PARK이 실행)     -- ⑦ PARK → CHOI\nGRANT SELECT ON EMP TO YOON WITH GRANT OPTION;    -- ⑧ 객체 권한 + GRANT OPTION\nGRANT SELECT ON HR.EMP TO HAN;  (YOON이 실행)     -- ⑨ YOON → HAN\nDROP ROLE R_VIEW;                                 -- ⑩ R_VIEW 경로의 EMP 조회가 LEE에게서 사라져요\nREVOKE CREATE SESSION FROM PARK;                  -- ⑪ PARK만 잃어요, CHOI는 유지\nREVOKE SELECT ON EMP FROM YOON;                   -- ⑫ YOON과 HAN 모두 잃어요" },
    { t: "1단계: 보기별 판정", tb: { c: ["보기", "판정", "이유"], r: [["ㄱ LEE의 HR.EMP 조회 불가", "O", "EMP 조회는 R_VIEW로만 받았는데 R_VIEW가 삭제됨"], ["ㄴ LEE의 HR.DEPT 조회 가능", "O", "R_TEAM에 직접 들어 있어 유지"], ["ㄷ CHOI의 CREATE SESSION 상실", "X", "ADMIN OPTION 회수는 연쇄되지 않음"], ["ㄹ HAN의 HR.EMP 조회 불가", "O", "GRANT OPTION 회수는 연쇄됨"]], hl: [2] } }
  ],
  ox: [
    "이렇게 생각하면 틀려요: '객체 권한을 회수해도 이미 나눠 준 권한은 남는다.' 그건 시스템 권한(ADMIN OPTION)의 규칙이에요. WITH GRANT OPTION 객체 권한은 회수가 연쇄돼서 HAN도 잃으니 ㄹ도 옳아요.",
    "정답이에요. R_VIEW 삭제로 LEE의 EMP 조회만 사라지고 DEPT 조회는 남아요. CHOI는 ADMIN OPTION이라 유지, HAN은 GRANT OPTION이라 함께 회수돼요.",
    "이렇게 생각하면 틀려요: 'ROLE을 지워도 그 ROLE을 받은 다른 ROLE에는 권한이 남는다.' 꾸러미가 없어지면 그 꾸러미로 받은 권한도 사라져요. ㄱ이 옳고, CHOI는 권한을 잃지 않으니 ㄷ은 틀려요.",
    "이렇게 생각하면 틀려요: 'ADMIN OPTION 회수도 연쇄된다.' 시스템 권한은 준 사람을 회수해도 받은 사람(CHOI)의 권한은 남아요. ㄷ은 틀려요."
  ],
  trap: "ROLE을 지우면 그 ROLE을 거쳐 받은 권한만 사라지고, 다른 경로로 받은 권한은 남아요. 회수가 번지는지는 ADMIN(시스템 권한, 안 번짐)과 GRANT(객체 권한, 번짐)로 구분해요.",
  memo: "ROLE 삭제 = 그 ROLE로 받은 권한 소멸 / ADMIN 회수는 안 번지고 GRANT 회수는 번진다"
},
{
  id: "S237", s: 2, tp: "sub", lv: 2, kill: true, sub: "서브쿼리",
  th: "2과목 | 비연관 EXISTS를 쓴 UPDATE의 영향 행 수",
  q: "다음 UPDATE 문을 실행했을 때 값이 변경되는 [EMP] 테이블의 행 수는?",
  tb: [
    { n: "EMP", c: ["EMPNO", "DEPTNO", "SAL"], r: [[1, 10, 300], [2, 20, 400], [3, 30, 500], [4, 10, 200], [5, 40, 100]] },
    { n: "DEPT", c: ["DEPTNO", "LOC"], r: [[10, "SEOUL"], [20, "BUSAN"], [30, "SEOUL"]] }
  ],
  sql: "UPDATE EMP\n   SET SAL = SAL + 100\n WHERE EXISTS (SELECT 1\n                 FROM DEPT\n                WHERE LOC = 'SEOUL');",
  o: ["0", "3", "4", "5"],
  a: 3,
  sum: "서브쿼리에 바깥 EMP와 연결하는 조건이 없어서, EXISTS는 모든 행에서 똑같이 참이에요. 그래서 EMP 5행이 모두 변경돼요.",
  why: "EXISTS(서브쿼리)는 서브쿼리가 한 행이라도 돌려주면 참, 하나도 없으면 거짓이 되는 조건이에요. 서브쿼리가 '무엇을' 돌려주는지는 보지 않고 '있는지'만 봐요.\n\n이 서브쿼리 안에는 바깥 EMP의 컬럼이 하나도 없어요. 이런 서브쿼리를 비연관 서브쿼리라고 해요. 바깥 행이 바뀌어도 서브쿼리 결과는 늘 똑같아요.\n\n**그래서 비연관 EXISTS는 모든 행에 똑같이 참이거나, 모든 행에 똑같이 거짓이에요.** DEPT에 LOC가 'SEOUL'인 행이 2개 있으니 EXISTS는 항상 참이에요.\n\n결국 WHERE가 없는 것과 같아져서 EMP의 5행이 모두 변경돼요. 서울 부서 직원만 바꾸려면 서브쿼리 안에 DEPT.DEPTNO = EMP.DEPTNO 같은 연결 조건을 넣어야 해요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "UPDATE EMP                       -- ① EMP 행을 하나씩 꺼내요\n   SET SAL = SAL + 100           -- ③ 조건이 참인 행의 SAL을 100 올려요\n WHERE EXISTS (SELECT 1          -- ② 서브쿼리가 한 행이라도 돌려주는가?\n                 FROM DEPT\n                WHERE LOC = 'SEOUL');  --    EMP 컬럼이 없음 → 행마다 결과가 같아요 (10, 30번 부서 2행)" },
    { t: "1단계: 서브쿼리 결과 (모든 EMP 행에 공통)", tb: { c: ["DEPTNO", "LOC"], r: [[10, "SEOUL"], [30, "SEOUL"]] }, n: "2행이 있으니 EXISTS는 언제나 참이에요." },
    { t: "2단계: EMP 행별 판정", tb: { c: ["EMPNO", "DEPTNO", "EXISTS", "변경 후 SAL"], r: [[1, 10, "참", 400], [2, 20, "참", 500], [3, 30, "참", 600], [4, 10, "참", 300], [5, 40, "참", 200]], hl: [0, 1, 2, 3, 4] } }
  ],
  res: { c: ["UPDATED_ROWS"], r: [[5]] },
  pg: "WITH U AS (UPDATE EMP SET SAL = SAL + 100 WHERE EXISTS (SELECT 1 FROM DEPT WHERE LOC = 'SEOUL') RETURNING 1) SELECT COUNT(*) FROM U",
  ox: [
    "이렇게 생각하면 틀려요: '서브쿼리가 바깥 행과 연결되지 않으면 EXISTS는 거짓이다.' EXISTS는 행이 있는지만 봐요. 'SEOUL' 행이 있으니 항상 참이라 0행이 아니에요.",
    "이렇게 생각하면 틀려요: 'LOC가 SEOUL인 부서(10, 30)의 직원만 바뀐다.' 그러려면 서브쿼리 안에 부서번호 연결 조건이 있어야 해요. 연결 조건이 없으니 모든 행이 바뀌어요.",
    "이렇게 생각하면 틀려요: 'DEPT에 있는 부서(10, 20, 30)의 직원만 바뀐다.' 서브쿼리는 EMP의 DEPTNO를 전혀 보지 않아요. DEPT에 없는 40번 부서 직원도 바뀌어요.",
    "정답이에요. 비연관 EXISTS가 항상 참이라 EMP 5행이 모두 변경돼요."
  ],
  trap: "EXISTS 안에 바깥 테이블의 컬럼이 있는지부터 확인하세요. 없으면 '전부 아니면 전무'예요.",
  memo: "연결 조건 없는 EXISTS = 전부 참 or 전부 거짓"
},
{
  id: "S238", s: 2, tp: "fn", lv: 2, kill: true, sub: "함수",
  th: "2과목 | MAX(TO_CHAR(숫자))의 문자 비교와 문자 + 숫자 자동 변환",
  q: "다음 SQL의 결과로 옳은 것은? (Oracle 기준)",
  tb: [{ n: "T", c: ["ID", "SCORE"], r: [[1, 90], [2, 100], [3, 85], [4, 120]] }],
  sql: "SELECT MAX(TO_CHAR(SCORE))      AS A,\n       MAX(SCORE)               AS B,\n       MAX(TO_CHAR(SCORE)) + 10 AS C\n  FROM T;",
  o: ["A = '120', B = 120, C = 130", "A = '90', B = 120, C = 100", "A = '90', B = 120, C = '9010'", "A = '90', B = 120, C = 오류 발생"],
  a: 1,
  sum: "TO_CHAR로 바꾼 값은 문자라서 MAX가 사전 순서로 비교해요. 그래서 '90'이 가장 크고, '90' + 10은 Oracle이 '90'을 숫자로 바꿔 100이 돼요.",
  why: "TO_CHAR(SCORE)는 숫자를 문자로 바꿔요. 문자에 MAX를 쓰면 숫자의 크기가 아니라 글자 순서(사전 순서)로 비교해요.\n\n**문자 비교는 첫 글자부터 한 글자씩 비교해서 먼저 다른 글자가 큰 쪽이 크기 때문에, '90'이 '100'이나 '120'보다 커요.** '9'가 '1'이나 '8'보다 크니까요. 자릿수는 상관없어요.\n\n그래서 A는 '90'이고, 숫자 그대로 비교한 B는 120이에요.\n\nC는 문자 '90'에 숫자 10을 더해요. Oracle은 + 연산자를 만나면 문자를 숫자로 자동으로 바꿔서(암시적 형 변환) 계산해요. '90'이 숫자 90이 되어 C는 100이에요.\n\n문자를 이어 붙이는 연산자는 +가 아니라 ||예요. '90' || 10이었다면 '9010'이 됐을 거예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT MAX(TO_CHAR(SCORE))      AS A,  -- ② 문자 '90', '100', '85', '120' 중 사전 순서로 가장 큰 값\n       MAX(SCORE)               AS B,  -- ③ 숫자 중 가장 큰 값\n       MAX(TO_CHAR(SCORE)) + 10 AS C   -- ④ '90' + 10 → '90'을 숫자 90으로 바꿔 더해요\n  FROM T;                              -- ① 4행을 읽어요" },
    { t: "1단계: 문자로 바꾼 뒤 사전 순서 정렬", tb: { c: ["문자 값", "첫 글자", "사전 순서"], r: [["'100'", "1", 1], ["'120'", "1", 2], ["'85'", "8", 3], ["'90'", "9", 4]], hl: [3] }, n: "첫 글자 '9'가 가장 커서 '90'이 MAX예요." },
    { t: "2단계: 결과", tb: { c: ["A", "B", "C"], r: [["90", 120, 100]] } }
  ],
  res: { c: ["A", "B", "C"], r: [["90", 120, 100]] },
  pg: "SELECT MAX(SCORE::text) AS A, MAX(SCORE) AS B, MAX(SCORE::text)::numeric + 10 AS C FROM T",
  ox: [
    "이렇게 생각하면 틀려요: 'TO_CHAR로 바꿔도 크기 비교는 숫자처럼 된다.' 문자는 첫 글자부터 비교해서 '9'로 시작하는 '90'이 가장 커요.",
    "정답이에요. 문자 MAX는 '90', 숫자 MAX는 120이고, '90' + 10은 자동 숫자 변환으로 100이에요.",
    "이렇게 생각하면 틀려요: '+는 문자를 이어 붙인다.' Oracle에서 이어 붙이기는 ||이고, +는 문자를 숫자로 바꿔 더해요.",
    "이렇게 생각하면 틀려요: '문자와 숫자는 더할 수 없다.' Oracle은 '90'처럼 숫자로 바꿀 수 있는 문자를 자동으로 숫자로 바꿔 계산해요."
  ],
  trap: "MAX·MIN 안에 TO_CHAR가 있으면 숫자가 아니라 문자로 비교돼요. 문자 + 숫자는 Oracle이 문자를 숫자로 자동 변환해 계산하지만, PostgreSQL처럼 이런 자동 변환을 하지 않아 오류를 내는 DBMS도 있어요.",
  memo: "문자 MAX는 사전 순서('90' > '100') / 문자 + 숫자 = 자동 숫자 변환"
},
{
  id: "S239", s: 2, tp: "topn", lv: 2, kill: true, sub: "Top N 쿼리",
  th: "2과목 | ROWNUM <> 3 과 ROWNUM > 1의 결과 행 수 (Oracle)",
  q: "(Oracle 기준) 5개 행이 있는 [T] 테이블에 다음 두 SQL을 실행했을 때, 결과 행 수를 순서대로 나열한 것은?",
  tb: [{ n: "T", c: ["ID", "NM"], r: [[11, "가"], [12, "나"], [13, "다"], [14, "라"], [15, "마"]] }],
  sql: "-- SQL ①\nSELECT * FROM T WHERE ROWNUM <> 3;\n\n-- SQL ②\nSELECT * FROM T WHERE ROWNUM > 1;",
  o: ["2건, 0건", "4건, 0건", "2건, 4건", "4건, 4건"],
  a: 0,
  sum: "ROWNUM은 조건을 통과한 행에만 1부터 차례로 붙어요. 탈락한 행 다음 행은 같은 번호를 다시 받으니 ①은 3에서 계속 막혀 2건, ②는 1에서 계속 막혀 0건이에요.",
  why: "ROWNUM은 WHERE 조건을 통과한 행에만 1, 2, 3 … 순서로 붙는 번호예요. 행을 읽을 때 '다음 번호'를 붙여 본 뒤 조건을 검사하고, 통과해야 그 번호가 확정되고 다음 번호로 넘어가요.\n\n**조건에 떨어진 행은 번호를 가져가지 못해서, 다음 행이 같은 번호를 다시 받아요.**\n\nSQL ①을 보면, 1번째와 2번째 행은 ROWNUM 1, 2를 받고 '<> 3'을 통과해요. 3번째 행은 ROWNUM 3을 받아 탈락해요. 4번째, 5번째 행도 다시 3을 받아 탈락해요. 그래서 2건이에요.\n\nSQL ②를 보면, 첫 행이 ROWNUM 1을 받아 '> 1'에 탈락해요. 다음 행도 다시 1을 받아 탈락해요. 끝까지 아무도 2를 받지 못해서 0건이에요.\n\n그래서 ROWNUM은 <, <= 또는 = 1처럼 1부터 이어지는 조건에만 써야 의미가 있어요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT * FROM T WHERE ROWNUM <> 3;  -- ① 행을 읽으며 다음 번호를 붙여 보고 → '<> 3'이면 통과·번호 확정\n                                    --    3을 받은 행이 탈락하면 다음 행도 다시 3 → 계속 탈락\nSELECT * FROM T WHERE ROWNUM > 1;   -- ② 첫 행이 1을 받아 탈락 → 다음 행도 1 → 계속 탈락" },
    { t: "1단계: SQL ① 추적", tb: { c: ["읽은 행", "붙여 본 ROWNUM", "<> 3?", "결과"], r: [["11", 1, "O", "통과"], ["12", 2, "O", "통과"], ["13", 3, "X", "탈락"], ["14", 3, "X", "탈락"], ["15", 3, "X", "탈락"]], hl: [2, 3, 4] }, n: "통과 2건" },
    { t: "2단계: SQL ② 추적", tb: { c: ["읽은 행", "붙여 본 ROWNUM", "> 1?", "결과"], r: [["11", 1, "X", "탈락"], ["12", 1, "X", "탈락"], ["13", 1, "X", "탈락"], ["14", 1, "X", "탈락"], ["15", 1, "X", "탈락"]], hl: [0, 1, 2, 3, 4] }, n: "통과 0건" }
  ],
  ox: [
    "정답이에요. ①은 3을 받은 행부터 계속 탈락해서 2건, ②는 1을 받은 행이 계속 탈락해서 0건이에요.",
    "이렇게 생각하면 틀려요: 'ROWNUM <> 3은 3번째 행 하나만 빼고 나머지를 준다.' 3번째 행이 탈락하면 다음 행이 다시 ROWNUM 3을 받아 계속 탈락해요. 그래서 4건이 아니라 2건이에요.",
    "이렇게 생각하면 틀려요: 'ROWNUM > 1은 첫 행만 빼고 준다.' 첫 행이 탈락하면 다음 행도 1을 받아 탈락해요. 아무도 2가 될 수 없어 0건이에요.",
    "이렇게 생각하면 틀려요: 'ROWNUM은 행마다 미리 붙어 있는 번호다.' 그렇다면 4건, 4건이겠지만, ROWNUM은 조건을 통과한 행에만 차례로 붙어요."
  ],
  trap: "ROWNUM은 '통과해야 번호가 늘어난다'를 기억하세요. ROWNUM > 1, ROWNUM >= 2, ROWNUM <> n 조건이 함정이에요.",
  memo: "ROWNUM > 1 = 0건 / ROWNUM <> n = n − 1건"
},
{
  id: "S240", s: 2, tp: "topn", lv: 3, kill: true, sub: "Top N 쿼리",
  th: "2과목 | 같은 블록의 ROWNUM + ORDER BY vs 인라인 뷰 vs FETCH WITH TIES",
  q: "(Oracle 기준) [EMP] 테이블은 표에 적힌 순서대로 읽힌다고 할 때, 세 SQL의 결과에서 SAL의 합계를 ①, ②, ③ 순서대로 나열한 것은?",
  tb: [{ n: "EMP", c: ["ENAME", "SAL"], r: [["A", 300], ["B", 500], ["C", 200], ["D", 500], ["E", 400], ["F", 100]] }],
  sql: "-- ①\nSELECT ENAME, SAL FROM EMP\n WHERE ROWNUM <= 3\n ORDER BY SAL DESC;\n\n-- ②\nSELECT ENAME, SAL\n  FROM (SELECT ENAME, SAL FROM EMP ORDER BY SAL DESC)\n WHERE ROWNUM <= 3;\n\n-- ③\nSELECT ENAME, SAL FROM EMP\n ORDER BY SAL DESC\n FETCH FIRST 1 ROWS WITH TIES;",
  o: ["1400, 1400, 500", "1400, 1400, 1000", "1000, 1400, 1000", "1000, 1400, 500"],
  a: 2,
  sum: "①은 읽힌 순서로 3행(A, B, C)을 먼저 자른 뒤 정렬해서 1000이에요. ②는 정렬 후 3행(B, D, E)이라 1400, ③은 1등과 동점인 행까지 와서 B, D의 1000이에요.",
  why: "같은 SELECT 블록 안에서 WHERE의 ROWNUM은 ORDER BY보다 먼저 처리돼요. 그래서 ①은 '읽힌 순서대로 3행을 먼저 자른 뒤' 그 3행만 정렬해요.\n\n**ROWNUM으로 정렬 기준 상위 N개를 얻으려면, 인라인 뷰 안에서 먼저 정렬하고 바깥에서 ROWNUM을 걸어야 해요.**\n\n①은 읽은 순서대로 A(300), B(500), C(200)를 자른 뒤 정렬해요. 합계는 1000이고, 진짜 상위 3명이 아니에요.\n\n②는 인라인 뷰에서 SAL 내림차순으로 정렬한 다음 3행을 잘라요. B(500), D(500), E(400)라서 합계 1400이에요. ORDER BY SAL DESC FETCH FIRST 3 ROWS ONLY와 같은 결과예요.\n\n③의 FETCH FIRST 1 ROWS WITH TIES는 1행을 가져오되, 마지막 행과 정렬 값이 같은 행도 함께 가져와요. 1등 SAL 500이 B, D 두 명이라 2행, 합계 1000이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- ①\nSELECT ENAME, SAL FROM EMP    -- ① 읽힌 순서: A, B, C, D, E, F\n WHERE ROWNUM <= 3            -- ② 먼저 3행 자르기 → A, B, C\n ORDER BY SAL DESC;           -- ③ 그 3행만 정렬 → B 500, A 300, C 200\n-- ②\nSELECT ENAME, SAL\n  FROM (SELECT ENAME, SAL FROM EMP ORDER BY SAL DESC)  -- ① 전체 정렬: B, D, E, A, C, F\n WHERE ROWNUM <= 3;                                    -- ② 정렬된 순서에서 3행 → B, D, E\n-- ③\nSELECT ENAME, SAL FROM EMP\n ORDER BY SAL DESC            -- ① 전체 정렬\n FETCH FIRST 1 ROWS WITH TIES;  -- ② 1행(500) + 같은 500인 행까지 → B, D" },
    { t: "1단계: ① 같은 블록의 ROWNUM", tb: { c: ["읽힌 순서", "ENAME", "SAL", "ROWNUM", "결과"], r: [[1, "A", 300, 1, "포함"], [2, "B", 500, 2, "포함"], [3, "C", 200, 3, "포함"], [4, "D", 500, "—", "제외"]], hl: [0, 1, 2] }, n: "300 + 500 + 200 = 1000" },
    { t: "2단계: ②·③ 정렬 후 자르기", tb: { c: ["정렬 순서", "ENAME", "SAL", "② ROWNUM <= 3", "③ WITH TIES"], r: [[1, "B", 500, "포함", "포함"], [2, "D", 500, "포함", "포함(동점)"], [3, "E", 400, "포함", "제외"], [4, "A", 300, "제외", "제외"]], hl: [0, 1, 2] }, n: "② 500 + 500 + 400 = 1400, ③ 500 + 500 = 1000" }
  ],
  res: { c: ["S1", "S2", "S3"], r: [[1000, 1400, 1000]] },
  pg: "SELECT (SELECT SUM(SAL) FROM (SELECT SAL FROM EMP ORDER BY ctid LIMIT 3) X) AS S1, (SELECT SUM(SAL) FROM (SELECT SAL FROM EMP ORDER BY SAL DESC FETCH FIRST 3 ROWS ONLY) Y) AS S2, (SELECT SUM(SAL) FROM (SELECT SAL FROM EMP ORDER BY SAL DESC FETCH FIRST 1 ROWS WITH TIES) Z) AS S3",
  ox: [
    "이렇게 생각하면 틀려요: 'ORDER BY가 먼저 실행되고 ROWNUM이 나중에 붙는다'에 'WITH TIES는 동점을 무시한다'까지 겹쳤어요. ①은 정렬 전에 잘라서 1000이고, ③은 동점 D까지 와서 1000이에요.",
    "이렇게 생각하면 틀려요: '같은 블록에서도 ORDER BY 뒤에 ROWNUM이 붙는다.' WHERE의 ROWNUM이 먼저 처리돼서 ①은 읽힌 순서의 A, B, C를 가져와요. 합계는 1000이에요.",
    "정답이에요. ①은 읽힌 순서 A, B, C(1000), ②는 정렬 후 B, D, E(1400), ③은 동점까지 B, D(1000)예요.",
    "이렇게 생각하면 틀려요: 'WITH TIES를 써도 1행만 나온다.' WITH TIES는 마지막 행과 같은 SAL(500)인 D도 함께 가져와서 합계가 1000이에요."
  ],
  trap: "ROWNUM과 ORDER BY가 같은 블록에 있으면 '먼저 자르고 나중에 정렬'이에요. 정렬 기준 Top-N은 인라인 뷰에서 정렬한 뒤 ROWNUM을 걸거나, ORDER BY 뒤에 적용되는 FETCH FIRST n ROWS(Oracle 12c 이상)를 쓰세요.",
  memo: "같은 블록 ROWNUM = 자르고 정렬 / 인라인 뷰에서 정렬 후 ROWNUM = Top-N / WITH TIES = 동점 포함"
},
{
  id: "S241", s: 2, tp: "topn", lv: 2, sub: "Top N 쿼리",
  th: "2과목 | OFFSET m ROWS FETCH NEXT n ROWS ONLY",
  q: "다음 SQL의 결과로 옳은 것은?",
  tb: [{ n: "SCORE", c: ["NAME", "PT"], r: [["KIM", 70], ["LEE", 95], ["PARK", 80], ["CHOI", 88], ["JUNG", 80], ["KANG", 60], ["CHO", 91], ["YOON", 75]] }],
  sql: "SELECT NAME\n  FROM SCORE\n ORDER BY PT DESC, NAME\nOFFSET 2 ROWS\n FETCH NEXT 3 ROWS ONLY;",
  o: ["LEE, CHO, CHOI", "CHO, CHOI, JUNG", "CHOI, PARK, JUNG", "CHOI, JUNG, PARK"],
  a: 3,
  sum: "정렬하면 LEE, CHO, CHOI, JUNG, PARK … 순서예요. OFFSET 2 ROWS로 앞의 2행을 건너뛰고 FETCH NEXT 3 ROWS로 CHOI, JUNG, PARK을 가져와요.",
  why: "OFFSET m ROWS는 정렬된 결과에서 앞의 m행을 건너뛰고, FETCH NEXT n ROWS ONLY는 그다음부터 n행만 가져와요. 둘 다 ORDER BY로 정렬한 다음에 적용돼요.\n\n먼저 정렬해요. PT 내림차순이고, PT가 같으면 NAME 순서예요. LEE(95), CHO(91), CHOI(88), JUNG(80), PARK(80), YOON(75), KIM(70), KANG(60) 순서가 돼요.\n\n**ORDER BY PT DESC, NAME에서 DESC는 PT에만 붙고, 방향을 쓰지 않은 NAME은 오름차순(ASC)이에요.** 그래서 같은 80점인 JUNG이 PARK보다 앞에 와요.\n\nOFFSET 2 ROWS로 LEE, CHO를 건너뛰고, FETCH NEXT 3 ROWS ONLY로 CHOI, JUNG, PARK을 가져와요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT NAME\n  FROM SCORE               -- ① 8행을 읽어요\n ORDER BY PT DESC, NAME    -- ② PT 내림차순, 동점이면 NAME 오름차순\nOFFSET 2 ROWS              -- ③ 정렬된 앞 2행(LEE, CHO)을 건너뛰어요\n FETCH NEXT 3 ROWS ONLY;   -- ④ 그다음 3행만 가져와요" },
    { t: "1단계: 정렬 결과와 OFFSET/FETCH", tb: { c: ["순서", "NAME", "PT", "처리"], r: [[1, "LEE", 95, "건너뜀"], [2, "CHO", 91, "건너뜀"], [3, "CHOI", 88, "가져옴"], [4, "JUNG", 80, "가져옴"], [5, "PARK", 80, "가져옴"], [6, "YOON", 75, "—"], [7, "KIM", 70, "—"], [8, "KANG", 60, "—"]], hl: [2, 3, 4] } }
  ],
  res: { c: ["NAME"], r: [["CHOI"], ["JUNG"], ["PARK"]] },
  pg: "SELECT NAME FROM SCORE ORDER BY PT DESC, NAME OFFSET 2 ROWS FETCH NEXT 3 ROWS ONLY",
  ox: [
    "이렇게 생각하면 틀려요: 'OFFSET은 결과에 영향을 주지 않는다.' OFFSET 2 ROWS가 앞의 LEE, CHO를 건너뛰어서 CHOI부터 시작해요.",
    "이렇게 생각하면 틀려요: 'OFFSET 2는 2번째 행부터 시작한다.' OFFSET 2는 2행을 건너뛰라는 뜻이라 3번째 행인 CHOI부터 시작해요.",
    "이렇게 생각하면 틀려요: 'DESC가 뒤의 NAME에도 적용된다.' DESC는 바로 앞의 PT에만 붙어요. NAME은 오름차순이라 JUNG이 PARK보다 먼저예요.",
    "정답이에요. 앞의 2행을 건너뛰고 CHOI, JUNG, PARK 3행을 가져와요. 80점 동점은 NAME 오름차순으로 JUNG이 먼저예요."
  ],
  trap: "ORDER BY에 컬럼이 여러 개면 정렬 방향은 컬럼마다 따로예요. 동점 행의 순서를 바꿔 놓은 보기에 주의하세요.",
  memo: "OFFSET m = m행 건너뛰기, FETCH NEXT n = 그다음 n행"
},
{
  id: "S242", s: 2, tp: "grp", lv: 2, sub: "그룹 함수",
  th: "2과목 | ROLLUP 인자 순서와 CUBE의 결과 행 수",
  q: "[SALES] 테이블에 다음 세 SQL을 실행했을 때, 결과 행 수를 ①, ②, ③ 순서대로 나열한 것은?",
  tb: [{ n: "SALES", c: ["REGION", "PROD", "AMT"], r: [["E", "P1", 10], ["E", "P2", 20], ["W", "P1", 30], ["W", "P2", 40], ["W", "P3", 50]] }],
  sql: "-- ①\nSELECT REGION, PROD, SUM(AMT) FROM SALES GROUP BY ROLLUP(REGION, PROD);\n-- ②\nSELECT REGION, PROD, SUM(AMT) FROM SALES GROUP BY ROLLUP(PROD, REGION);\n-- ③\nSELECT REGION, PROD, SUM(AMT) FROM SALES GROUP BY CUBE(PROD, REGION);",
  o: ["8, 9, 11", "8, 8, 11", "9, 8, 11", "8, 9, 9"],
  a: 0,
  sum: "ROLLUP은 첫 번째 인자 기준으로 소계를 내서 순서가 바뀌면 행 수도 바뀌어요(8, 9). CUBE는 모든 조합을 만들어 순서와 상관없이 11행이에요.",
  why: "ROLLUP(A, B)은 (A, B)별 → A별 소계 → 전체 합계 순서로, 오른쪽 인자를 하나씩 떼며 집계해요. 그래서 인자의 순서가 바뀌면 어떤 소계를 만드는지가 바뀌어요.\n\n①의 ROLLUP(REGION, PROD)은 (REGION, PROD) 조합 5행, REGION별 소계 2행(E, W), 전체 1행이라 8행이에요.\n\n②의 ROLLUP(PROD, REGION)은 조합 5행, PROD별 소계 3행(P1, P2, P3), 전체 1행이라 9행이에요.\n\n**CUBE는 인자로 만들 수 있는 모든 조합을 집계하므로, 인자 순서와 상관없이 결과 행 수가 같아요.** ③은 조합 5행, PROD별 3행, REGION별 2행, 전체 1행이라 11행이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "GROUP BY ROLLUP(REGION, PROD)  -- ① (REGION, PROD) → (REGION) → ()\nGROUP BY ROLLUP(PROD, REGION)  -- ② (PROD, REGION) → (PROD) → ()\nGROUP BY CUBE(PROD, REGION)    -- ③ (PROD, REGION), (PROD), (REGION), () 모두" },
    { t: "1단계: 집계 단위별 행 수", tb: { c: ["집계 단위", "①", "②", "③"], r: [["(REGION, PROD) 조합", 5, 5, 5], ["REGION별", 2, "—", 2], ["PROD별", "—", 3, 3], ["전체", 1, 1, 1], ["합계", 8, 9, 11]], hl: [4] } }
  ],
  res: { c: ["R1", "R2", "R3"], r: [[8, 9, 11]] },
  pg: "SELECT (SELECT COUNT(*) FROM (SELECT REGION, PROD, SUM(AMT) FROM SALES GROUP BY ROLLUP(REGION, PROD)) A) AS R1, (SELECT COUNT(*) FROM (SELECT REGION, PROD, SUM(AMT) FROM SALES GROUP BY ROLLUP(PROD, REGION)) B) AS R2, (SELECT COUNT(*) FROM (SELECT REGION, PROD, SUM(AMT) FROM SALES GROUP BY CUBE(PROD, REGION)) C) AS R3",
  ox: [
    "정답이에요. ①은 5 + 2 + 1 = 8, ②는 5 + 3 + 1 = 9, ③은 5 + 3 + 2 + 1 = 11이에요.",
    "이렇게 생각하면 틀려요: 'ROLLUP도 인자 순서와 상관없다.' ②는 REGION별이 아니라 PROD별 소계(3행)를 만들어 9행이에요.",
    "이렇게 생각하면 틀려요: 'ROLLUP은 마지막 인자 기준으로 소계를 낸다.' 소계는 첫 번째 인자 기준이에요. ①은 REGION별(2행)이라 8행, ②는 PROD별(3행)이라 9행이에요.",
    "이렇게 생각하면 틀려요: 'CUBE도 첫 인자(PROD) 기준으로만 소계를 낸다.' CUBE는 PROD별과 REGION별을 모두 만들어 11행이에요."
  ],
  trap: "인자가 2개인 ROLLUP의 행 수는 '조합 수 + 첫 인자의 값 수 + 1'이에요. 인자 순서가 바뀌면 가운데 항이 바뀌어요.",
  memo: "ROLLUP은 순서가 중요, CUBE는 순서 무관"
},
{
  id: "S243", s: 2, tp: "grp", lv: 3, kill: true, sub: "그룹 함수",
  th: "2과목 | GROUPING SETS((A, B), A, ())의 결과 행 수",
  q: "다음 SQL의 결과 행 수는?",
  tb: [{ n: "T", c: ["DEPT", "JOB", "SAL"], r: [[10, "CLERK", 100], [10, "CLERK", 110], [10, "MGR", 300], [20, "CLERK", 150], [30, "CLERK", 120], [30, "SALES", 200]] }],
  sql: "SELECT DEPT, JOB, SUM(SAL)\n  FROM T\n GROUP BY GROUPING SETS ((DEPT, JOB), DEPT, ());",
  o: ["8", "9", "10", "12"],
  a: 1,
  sum: "안쪽 괄호 (DEPT, JOB)은 두 컬럼을 묶은 하나의 그룹 기준이에요. 조합 5행 + DEPT별 3행 + 전체 1행 = 9행이에요.",
  why: "GROUPING SETS는 괄호 안에 쉼표로 나열한 '그룹 기준'마다 따로 GROUP BY한 결과를 이어 붙여요(UNION ALL과 비슷해요).\n\n**안쪽 괄호 (DEPT, JOB)은 두 컬럼을 묶은 '하나의 그룹 기준'이지, DEPT 따로 JOB 따로가 아니에요.** 빈 괄호 ()는 아무 컬럼으로도 나누지 않는 기준, 즉 전체 합계 1행이에요.\n\n그래서 이 SQL은 세 가지 기준으로 집계해요. (DEPT, JOB) 조합은 (10, CLERK), (10, MGR), (20, CLERK), (30, CLERK), (30, SALES) 5행이에요. (10, CLERK)는 원본에 2행이지만 한 그룹이에요.\n\nDEPT별은 10, 20, 30의 3행이고, ()는 전체 1행이에요. 합치면 5 + 3 + 1 = 9행이에요. 이 결과는 ROLLUP(DEPT, JOB)과 같아요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT DEPT, JOB, SUM(SAL)\n  FROM T                                         -- ① 6행을 읽어요\n GROUP BY GROUPING SETS ((DEPT, JOB),           -- ② 기준 1: (DEPT, JOB) 조합별\n                         DEPT,                  -- ③ 기준 2: DEPT별\n                         ());                   -- ④ 기준 3: 전체 1행" },
    { t: "1단계: 기준별 결과 행", tb: { c: ["그룹 기준", "만들어지는 그룹", "행 수"], r: [["(DEPT, JOB)", "(10, CLERK), (10, MGR), (20, CLERK), (30, CLERK), (30, SALES)", 5], ["DEPT", "10, 20, 30", 3], ["()", "전체", 1], ["합계", "", 9]], hl: [3] } }
  ],
  res: { c: ["CNT"], r: [[9]] },
  pg: "SELECT COUNT(*) FROM (SELECT DEPT, JOB, SUM(SAL) FROM T GROUP BY GROUPING SETS ((DEPT, JOB), DEPT, ())) X",
  ox: [
    "이렇게 생각하면 틀려요: '빈 괄호 ()는 아무것도 만들지 않는다.' ()는 전체 합계 1행을 만들어요. 그래서 8이 아니라 9예요.",
    "정답이에요. (DEPT, JOB) 조합 5행, DEPT별 3행, 전체 1행으로 9행이에요.",
    "이렇게 생각하면 틀려요: '(DEPT, JOB)은 DEPT별, JOB별 두 기준이다.' 그러면 3 + 3 + 3 + 1 = 10이 되지만, 안쪽 괄호는 두 컬럼을 묶은 한 기준이에요.",
    "이렇게 생각하면 틀려요: '이 GROUPING SETS는 CUBE(DEPT, JOB)와 같다.' CUBE라면 JOB별 3행까지 더해 12행이지만, 이 SQL에는 JOB 단독 기준이 없어요."
  ],
  trap: "GROUPING SETS 안의 괄호는 '한 덩어리'예요. 괄호를 벗겨서 세면 틀려요.",
  memo: "GROUPING SETS((A, B), A, ()) = ROLLUP(A, B)"
},
{
  id: "S244", s: 2, tp: "win", lv: 2, kill: true, sub: "윈도우 함수",
  th: "2과목 | NTILE(3)의 나머지 배분과 LAG의 기본값",
  q: "다음 SQL의 결과에 대한 설명으로 옳은 것은? (G가 1, 2, 3인 행 수를 차례로 쓰고, ID = 1인 행의 L1, L2 값을 쓴다.)",
  tb: [{ n: "T", c: ["ID", "V"], r: [[1, 50], [2, 20], [3, 70], [4, 40], [5, 90], [6, 10], [7, 60], [8, 30]] }],
  sql: "SELECT ID, V,\n       NTILE(3)     OVER (ORDER BY ID) AS G,\n       LAG(V)       OVER (ORDER BY ID) AS L1,\n       LAG(V, 1, 0) OVER (ORDER BY ID) AS L2\n  FROM T;",
  o: ["G 행 수 3·3·2 / L1 NULL / L2 0", "G 행 수 3·3·2 / L1 0 / L2 0", "G 행 수 2·3·3 / L1 NULL / L2 0", "G 행 수 3·3·2 / L1 NULL / L2 50"],
  a: 0,
  sum: "8행을 NTILE(3)으로 나누면 남는 2행을 앞 묶음부터 하나씩 더 줘서 3·3·2예요. 첫 행의 LAG(V)는 앞 행이 없어 NULL이고, LAG(V, 1, 0)은 기본값 0이에요.",
  why: "NTILE(n)은 정렬된 행을 n개 묶음으로 최대한 고르게 나눠요. 8행을 3묶음으로 나누면 8 = 3 × 2 + 2라서, 한 묶음에 2행씩 주고 2행이 남아요.\n\n**남는 행은 앞 묶음부터 하나씩 더 받아요.** 그래서 1번 묶음 3행, 2번 묶음 3행, 3번 묶음 2행이에요.\n\nLAG(V)는 정렬 기준으로 바로 앞 행의 V를 가져와요. ID 1은 첫 행이라 앞 행이 없어서 NULL이에요.\n\nLAG(V, 1, 0)의 두 번째 인수 1은 '몇 행 앞'이고, 세 번째 인수 0은 '앞 행이 없을 때 쓸 기본값'이에요. 그래서 ID 1의 L2는 NULL 대신 0이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT ID, V,\n       NTILE(3)     OVER (ORDER BY ID) AS G,   -- ② ID 순 8행을 3묶음으로: 남는 2행은 1, 2번 묶음에 +1\n       LAG(V)       OVER (ORDER BY ID) AS L1,  -- ③ 1행 앞의 V, 없으면 NULL\n       LAG(V, 1, 0) OVER (ORDER BY ID) AS L2   -- ④ 1행 앞의 V, 없으면 기본값 0\n  FROM T;                                      -- ① 8행을 읽어요" },
    { t: "1단계: 전체 결과", tb: { c: ["ID", "V", "G", "L1", "L2"], r: [[1, 50, 1, null, 0], [2, 20, 1, 50, 50], [3, 70, 1, 20, 20], [4, 40, 2, 70, 70], [5, 90, 2, 40, 40], [6, 10, 2, 90, 90], [7, 60, 3, 10, 10], [8, 30, 3, 60, 60]], hl: [0] }, n: "G 행 수: 1번 3행, 2번 3행, 3번 2행" }
  ],
  res: { c: ["G_SIZES", "L1", "L2"], r: [["3/3/2", null, 0]] },
  pg: "SELECT (SELECT STRING_AGG(CNT::text, '/' ORDER BY G) FROM (SELECT G, COUNT(*) AS CNT FROM (SELECT NTILE(3) OVER (ORDER BY ID) AS G FROM T) A GROUP BY G) B) AS G_SIZES, L1, L2 FROM (SELECT ID, LAG(V) OVER (ORDER BY ID) AS L1, LAG(V, 1, 0) OVER (ORDER BY ID) AS L2 FROM T) C WHERE ID = 1",
  ox: [
    "정답이에요. 남는 2행이 앞 묶음에 붙어 3·3·2이고, 첫 행의 LAG(V)는 NULL, 기본값을 준 LAG(V, 1, 0)은 0이에요.",
    "이렇게 생각하면 틀려요: '앞 행이 없으면 LAG는 0을 준다.' 기본값을 정하지 않은 LAG(V)는 NULL을 줘요. 0이 나오는 건 세 번째 인수로 0을 준 L2뿐이에요.",
    "이렇게 생각하면 틀려요: '남는 행은 뒤 묶음에 붙는다.' NTILE은 남는 행을 앞 묶음부터 하나씩 더 줘요. 그래서 2·3·3이 아니라 3·3·2예요.",
    "이렇게 생각하면 틀려요: 'LAG(V, 1, 0)의 0은 0행 앞, 즉 자기 자신이다.' 몇 행 앞인지는 두 번째 인수(1)이고, 세 번째 인수 0은 앞 행이 없을 때 쓸 기본값이에요."
  ],
  trap: "NTILE의 나머지는 '앞 묶음부터'예요. 10행을 NTILE(4)로 나누면 3·3·2·2예요.",
  memo: "NTILE 나머지 = 앞부터 +1 / LAG(값, 몇 행 앞, 기본값)"
},
{
  id: "S245", s: 2, tp: "win", lv: 3, kill: true, sub: "윈도우 함수",
  th: "2과목 | OVER(ORDER BY)의 기본 프레임 RANGE와 동점 누적 합",
  q: "다음 SQL의 결과에서 ID 2와 ID 3 행의 CS 값을 순서대로 나열한 것은?",
  tb: [{ n: "T", c: ["ID", "SAL"], r: [[1, 100], [2, 200], [3, 200], [4, 300]] }],
  sql: "SELECT ID, SAL,\n       SUM(SAL) OVER (ORDER BY SAL) AS CS\n  FROM T;",
  o: ["300, 500", "400, 400", "500, 500", "800, 800"],
  a: 2,
  sum: "ORDER BY만 쓴 윈도우의 기본 프레임은 RANGE UNBOUNDED PRECEDING ~ CURRENT ROW예요. RANGE는 같은 SAL 값을 한꺼번에 포함해서 ID 2, 3 모두 100 + 200 + 200 = 500이에요.",
  why: "윈도우 함수에 ORDER BY만 쓰고 프레임(같이 계산할 행의 범위)을 적지 않으면 기본 프레임이 적용돼요. 기본값은 RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW예요.\n\n**RANGE는 행 위치가 아니라 정렬 값을 기준으로 범위를 정해서, 정렬 값이 같은 행들은 모두 '현재 행'에 함께 포함돼요.** 그래서 같은 값끼리는 누적 합계가 똑같아요.\n\nID 1(100)은 100이에요. ID 2와 ID 3은 SAL이 둘 다 200이라, 둘 다 '처음부터 SAL 200인 행 전부까지'를 더해요. 100 + 200 + 200 = 500이에요.\n\nID 4(300)는 800이에요. 행마다 하나씩 쌓이는 누적 합(300, 500)을 원하면 ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW를 직접 써야 해요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT ID, SAL,\n       SUM(SAL) OVER (ORDER BY SAL) AS CS  -- ② SAL 순 정렬, 프레임 생략 → RANGE UNBOUNDED PRECEDING ~ CURRENT ROW\n  FROM T;                                -- ① 4행을 읽어요" },
    { t: "1단계: RANGE(기본) vs ROWS 비교", tb: { c: ["ID", "SAL", "CS (기본 RANGE)", "ROWS로 썼다면"], r: [[1, 100, 100, 100], [2, 200, 500, 300], [3, 200, 500, 500], [4, 300, 800, 800]], hl: [1, 2] }, n: "SAL 200이 같은 ID 2, 3은 RANGE에서 함께 묶여 둘 다 500이에요." }
  ],
  res: { c: ["ID", "CS"], r: [[2, 500], [3, 500]] },
  pg: "SELECT ID, CS FROM (SELECT ID, SUM(SAL) OVER (ORDER BY SAL) AS CS FROM T) X WHERE ID IN (2, 3) ORDER BY ID",
  ox: [
    "이렇게 생각하면 틀려요: '기본 프레임은 ROWS라서 한 행씩 쌓인다.' 기본은 RANGE라 같은 SAL 200인 ID 2와 ID 3이 함께 묶여 둘 다 500이에요.",
    "이렇게 생각하면 틀려요: 'ORDER BY SAL은 SAL 값별로 묶어 합계를 낸다.' 그건 PARTITION BY SAL이에요. ORDER BY는 처음부터 누적해서 ID 1의 100까지 더해요.",
    "정답이에요. 기본 RANGE 프레임에서 SAL이 같은 두 행은 함께 포함되어 둘 다 100 + 200 + 200 = 500이에요.",
    "이렇게 생각하면 틀려요: 'ORDER BY를 써도 프레임은 전체 행이다.' 전체 합계(800)는 OVER()처럼 ORDER BY가 없을 때예요. ORDER BY가 있으면 현재 값까지만 더해요."
  ],
  trap: "SUM() OVER(ORDER BY …)에 동점이 있으면 누적 합이 같은 값으로 '점프'해요. 정렬 컬럼의 동점을 꼭 확인하세요.",
  memo: "ORDER BY만 쓰면 기본 RANGE → 동점은 같은 누적값"
},
{
  id: "S246", s: 2, tp: "join", lv: 2, sub: "조인",
  th: "2과목 | BETWEEN 비등가 조인의 결과 행 수",
  q: "다음 SQL의 결과 행 수는?",
  tb: [
    { n: "EMP", c: ["ENAME", "SAL"], r: [["A", 800], ["B", 1000], ["C", 1500], ["D", 2000], ["E", 2500], ["F", 3500]] },
    { n: "GRADE", c: ["GRD", "LOSAL", "HISAL"], r: [[1, 0, 1000], [2, 1000, 2000], [3, 2001, 3000]] }
  ],
  sql: "SELECT E.ENAME, E.SAL, G.GRD\n  FROM EMP E, GRADE G\n WHERE E.SAL BETWEEN G.LOSAL AND G.HISAL;",
  o: ["3", "5", "6", "7"],
  a: 2,
  sum: "BETWEEN은 양 끝을 포함해서 SAL 1000인 B는 1등급과 2등급에 모두 붙어 2행이 나와요. 맞는 등급이 없는 F는 빠져서 6행이에요.",
  why: "등호(=)가 아닌 조건으로 두 테이블을 잇는 조인을 비등가 조인(Non-Equi Join)이라고 해요. 여기서는 사원의 SAL이 등급의 범위 안에 드는지로 짝을 지어요.\n\n**BETWEEN A AND B는 A 이상 B 이하로 양쪽 경계값을 포함하고, 조건을 만족하는 짝마다 한 행씩 결과가 나와요.** 그래서 범위가 겹치는 경계값은 두 등급과 모두 짝이 될 수 있어요.\n\n사원별로 보면 A(800)는 1등급, C(1500)는 2등급, D(2000)는 2등급(1000~2000), E(2500)는 3등급이에요.\n\nB(1000)는 1등급(0~1000)과 2등급(1000~2000) 둘 다에 들어가서 2행이 나와요. F(3500)는 맞는 등급이 없어서 결과에서 빠져요.\n\n합치면 1 + 2 + 1 + 1 + 1 + 0 = 6행이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT E.ENAME, E.SAL, G.GRD\n  FROM EMP E, GRADE G                         -- ① 사원 6 × 등급 3 = 18개 짝을 후보로 봐요\n WHERE E.SAL BETWEEN G.LOSAL AND G.HISAL;     -- ② LOSAL ≤ SAL ≤ HISAL인 짝만 남겨요" },
    { t: "1단계: 사원별로 맞는 등급", tb: { c: ["ENAME", "SAL", "맞는 등급", "결과 행 수"], r: [["A", 800, "1", 1], ["B", 1000, "1, 2 (경계값 겹침)", 2], ["C", 1500, "2", 1], ["D", 2000, "2", 1], ["E", 2500, "3", 1], ["F", 3500, "없음", 0]], hl: [1, 5] }, n: "1 + 2 + 1 + 1 + 1 + 0 = 6" }
  ],
  res: { c: ["CNT"], r: [[6]] },
  pg: "SELECT COUNT(*) FROM EMP E, GRADE G WHERE E.SAL BETWEEN G.LOSAL AND G.HISAL",
  ox: [
    "이렇게 생각하면 틀려요: 'BETWEEN은 경계값을 뺀다.' 그러면 1000인 B와 2000인 D가 빠져 3행이 되지만, BETWEEN은 양 끝을 포함해요.",
    "이렇게 생각하면 틀려요: '사원 한 명은 등급 하나에만 붙는다.' 1000인 B는 1등급과 2등급 범위에 모두 들어가서 2행이 나와요.",
    "정답이에요. B가 두 등급에 붙어 2행, F는 맞는 등급이 없어 0행이라 모두 6행이에요.",
    "이렇게 생각하면 틀려요: '맞는 등급이 없어도 사원은 결과에 나온다.' 그건 외부 조인일 때예요. 이 조인에서 F(3500)는 빠져요."
  ],
  trap: "등급 테이블의 경계가 겹치거나 비어 있으면 행이 늘거나 빠져요. 범위의 끝 값을 하나씩 대조하세요.",
  memo: "BETWEEN = 양 끝 포함, 맞는 짝마다 1행"
},
{
  id: "S247", s: 2, tp: "join", lv: 2, sub: "조인",
  th: "2과목 | 식별 관계 4단계 테이블 조인의 조건 개수",
  q: "다음과 같이 네 테이블이 위에서 아래로 식별 관계로 이어져 있다. 네 테이블을 모두 조인해 올바른 결과(엉뚱한 짝이 섞이지 않은 결과)를 얻으려면 필요한 최소 조인 조건(등호 조건)의 개수는? (PK는 Primary Key, 기본키)",
  box: "· 고객(고객번호) — PK: 고객번호\n· 주문(고객번호, 주문순번) — 고객과 식별 관계, PK: 고객번호 + 주문순번\n· 주문상품(고객번호, 주문순번, 상품순번) — 주문과 식별 관계, PK: 컬럼 3개\n· 배송(고객번호, 주문순번, 상품순번, 배송순번) — 주문상품과 식별 관계, PK: 컬럼 4개",
  o: ["3", "6", "9", "10"],
  a: 1,
  sum: "식별 관계에서는 자식이 부모의 PK를 모두 물려받아요. 각 조인에 부모의 PK 컬럼 수만큼 조건이 필요해서 1 + 2 + 3 = 6개예요.",
  why: "식별 관계는 부모의 PK(Primary Key, 기본키)를 자식이 물려받아 자기 PK의 일부로 쓰는 관계예요. 그래서 아래로 내려갈수록 PK 컬럼이 하나씩 늘어나요.\n\n부모와 자식을 조인할 때는 자식이 물려받은 부모의 PK 컬럼을 모두 같다고 연결해야 해요. 하나라도 빼면 다른 부모의 행과도 짝이 지어져서 결과가 부풀어요.\n\n**그래서 각 조인에 필요한 조건 수는 '부모의 PK 컬럼 수'예요.** 고객–주문은 고객번호 1개, 주문–주문상품은 고객번호와 주문순번 2개, 주문상품–배송은 3개예요.\n\n합치면 1 + 2 + 3 = 6개예요. 식별 관계가 깊어질수록 조인 조건이 많아지는 게 식별 관계의 단점이고, 그래서 비식별 관계나 인조 식별자를 쓰기도 해요.",
  st: [
    { t: "1단계: 조인 쌍마다 필요한 조건", tb: { c: ["조인 쌍", "부모의 PK", "필요한 등호 조건", "개수"], r: [["고객 – 주문", "고객번호", "고객번호", 1], ["주문 – 주문상품", "고객번호, 주문순번", "고객번호, 주문순번", 2], ["주문상품 – 배송", "고객번호, 주문순번, 상품순번", "고객번호, 주문순번, 상품순번", 3], ["합계", "", "", 6]], hl: [3] } },
    { t: "2단계: 보기별 판정", tb: { c: ["보기", "판정", "어떻게 센 값인가"], r: [["3", "X", "테이블 수 − 1 (조인 쌍의 개수)"], ["6", "O", "부모 PK 컬럼 수의 합 1 + 2 + 3"], ["9", "X", "자식 PK 컬럼 수의 합 2 + 3 + 4"], ["10", "X", "모든 테이블의 PK 컬럼 수 1 + 2 + 3 + 4"]], hl: [1] } }
  ],
  ox: [
    "이렇게 생각하면 틀려요: '테이블이 4개면 조인 조건은 4 − 1 = 3개다.' 그건 조인마다 컬럼 하나로 잇는 경우예요. 식별 관계는 물려받은 PK 컬럼을 모두 연결해야 해서 6개예요.",
    "정답이에요. 각 조인에 부모의 PK 컬럼 수만큼 조건이 필요해서 1 + 2 + 3 = 6개예요.",
    "이렇게 생각하면 틀려요: '조인마다 자식의 PK 컬럼 수만큼 조건이 필요하다.' 그러면 2 + 3 + 4 = 9가 되지만, 자식의 마지막 컬럼(주문순번 등)은 부모에 없는 컬럼이라 연결할 대상이 없어요.",
    "이렇게 생각하면 틀려요: '모든 테이블의 PK 컬럼 수를 더한다.' 1 + 2 + 3 + 4 = 10은 컬럼 수일 뿐이에요. 조건은 부모와 자식이 공유하는 컬럼만큼 필요해요."
  ],
  trap: "'테이블 수 − 1'은 조인 쌍의 개수예요. 조건 개수는 쌍마다 공유하는 컬럼 수를 더해야 해요.",
  memo: "식별 관계 조인 조건 = 부모 PK 컬럼 수의 합 (1 + 2 + 3)"
},
{
  id: "S248", s: 2, tp: "sub", lv: 2, sub: "서브쿼리",
  th: "2과목 | 인라인 뷰에서 정의한 컬럼 별칭의 바깥 참조",
  q: "다음 인라인 뷰 V를 사용하는 SQL 중 실행 시 오류가 발생하는 것은? (보기의 (…) 자리에는 아래 인라인 뷰의 괄호 안 SELECT 문이 들어간다.)",
  sql: "(SELECT EMPNO    AS EID,\n        SAL * 12 AS YSAL\n   FROM EMP) V",
  o: [
    "SELECT EID, YSAL FROM (…) V WHERE YSAL > 30000;",
    "SELECT V.EID FROM (…) V ORDER BY V.YSAL DESC;",
    "SELECT EMPNO, YSAL FROM (…) V WHERE EID = 7;",
    "SELECT EID, YSAL / 12 AS SAL FROM (…) V WHERE EID = 7;"
  ],
  a: 2,
  sum: "인라인 뷰가 EMPNO를 EID라는 이름으로 내보냈기 때문에 바깥에서는 EID만 보여요. 바깥에서 원래 이름 EMPNO를 쓴 ③이 오류예요.",
  why: "인라인 뷰는 FROM 절에 쓴 서브쿼리예요. 바깥 쿼리에게 인라인 뷰는 하나의 새 테이블처럼 보이고, 그 테이블의 컬럼 이름은 인라인 뷰의 SELECT 목록에 적힌 이름이에요.\n\n**인라인 뷰 안에서 별칭(AS EID)을 붙였다면, 바깥에서는 그 별칭만 컬럼 이름으로 쓸 수 있고 원래 이름(EMPNO)은 더 이상 보이지 않아요.**\n\n그래서 ③처럼 바깥에서 EMPNO를 쓰면 'EMPNO라는 컬럼이 없다'는 오류(ORA-00904, 잘못된 식별자)가 나요.\n\n①은 별칭 YSAL로 WHERE를 걸었어요. 같은 SELECT 블록의 별칭은 WHERE에 못 쓰지만, 인라인 뷰의 별칭은 바깥 쿼리 입장에서 진짜 컬럼 이름이라 쓸 수 있어요.\n\n②는 V.YSAL로 정렬했고, ④는 YSAL / 12에 SAL이라는 새 별칭을 붙였을 뿐이라 둘 다 정상이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT EMPNO, YSAL                  -- ③ 바깥에서 보이는 컬럼은 EID, YSAL뿐 → EMPNO는 없어요 (오류)\n  FROM (SELECT EMPNO    AS EID,     -- ① 인라인 뷰가 EMPNO를 EID로 이름 바꿔 내보내요\n               SAL * 12 AS YSAL     --    SAL * 12는 YSAL로 내보내요\n          FROM EMP) V\n WHERE EID = 7;                     -- ② EID로 거르는 것은 정상" },
    { t: "1단계: 보기별 판정", tb: { c: ["보기", "판정", "이유"], r: [["① WHERE YSAL > 30000", "정상", "YSAL은 V의 컬럼 이름"], ["② ORDER BY V.YSAL", "정상", "V에 있는 컬럼이면 SELECT에 없어도 정렬 가능"], ["③ SELECT EMPNO", "오류", "EMPNO는 EID로 바뀌어 V에 없음"], ["④ YSAL / 12 AS SAL", "정상", "새 별칭을 붙였을 뿐"]], hl: [2] } }
  ],
  ox: [
    "이렇게 생각하면 틀려요: '별칭은 WHERE에서 쓸 수 없으니 오류다.' 그건 같은 블록에서만 그래요. YSAL은 인라인 뷰가 만든 컬럼 이름이라 바깥 WHERE에서 정상으로 쓰여요.",
    "이렇게 생각하면 틀려요: 'SELECT에 없는 컬럼(YSAL)으로는 정렬할 수 없다.' V.YSAL은 V에 있는 컬럼이라 SELECT 목록에 없어도 ORDER BY에 쓸 수 있어요. 정상이에요.",
    "정답이에요. 인라인 뷰가 EMPNO를 EID로 바꿔 내보냈기 때문에 바깥에서 EMPNO는 없는 컬럼이에요. 오류가 나요.",
    "이렇게 생각하면 틀려요: '원래 테이블의 컬럼 이름(SAL)을 별칭으로 다시 쓰면 오류다.' 별칭은 새 이름표일 뿐이라 SAL을 써도 돼요. 정상이에요."
  ],
  trap: "인라인 뷰 문제에서는 바깥 쿼리의 컬럼 이름을 인라인 뷰의 SELECT 목록과 하나씩 대조하세요. 원래 이름을 쓰면 오류예요.",
  memo: "인라인 뷰 별칭 = 바깥에서의 진짜 컬럼 이름 (원래 이름은 사라짐)"
},
{
  id: "S249", s: 2, tp: "pivot", lv: 2, kill: true, sub: "PIVOT 절과 UNPIVOT 절",
  th: "2과목 | UNPIVOT의 기본값 EXCLUDE NULLS vs INCLUDE NULLS (Oracle)",
  q: "(Oracle 기준) 다음 두 SQL의 결과 행 수를 순서대로 나열한 것은?",
  tb: [{ n: "SALES_Q", c: ["YR", "Q1", "Q2", "Q3"], r: [[2025, 10, null, 30], [2026, null, null, 50]] }],
  sql: "-- ①\nSELECT YR, QTR, AMT\n  FROM SALES_Q\nUNPIVOT (AMT FOR QTR IN (Q1, Q2, Q3));\n\n-- ②\nSELECT YR, QTR, AMT\n  FROM SALES_Q\nUNPIVOT INCLUDE NULLS (AMT FOR QTR IN (Q1, Q2, Q3));",
  o: ["3건, 6건", "6건, 6건", "3건, 3건", "6건, 3건"],
  a: 0,
  sum: "UNPIVOT은 기본이 EXCLUDE NULLS라서 값이 NULL인 칸은 행이 되지 않아요. ①은 NULL 3칸을 빼서 3건, INCLUDE NULLS를 쓴 ②는 6건이에요.",
  why: "UNPIVOT은 여러 컬럼(Q1, Q2, Q3)을 행으로 펼쳐요. 원래 한 행이 IN 절에 쓴 컬럼 수만큼(3행) 늘어나고, 컬럼 이름은 QTR에, 값은 AMT에 들어가요.\n\n**Oracle의 UNPIVOT은 기본값이 EXCLUDE NULLS라서, 펼친 값(AMT)이 NULL인 행은 결과에서 빠져요.** NULL인 행까지 보려면 UNPIVOT INCLUDE NULLS라고 직접 써야 해요.\n\n①을 보면 2025년은 Q1(10), Q3(30)만 남고 Q2(NULL)가 빠져 2행이에요. 2026년은 Q3(50)만 남아 1행이에요. 합쳐서 3행이에요.\n\n②는 NULL도 남기니 2년 × 3분기 = 6행이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT YR, QTR, AMT\n  FROM SALES_Q                               -- ① 2행을 읽어요\nUNPIVOT (AMT FOR QTR IN (Q1, Q2, Q3));       -- ② 행마다 Q1, Q2, Q3을 3행으로 펼치고, AMT가 NULL인 행은 버려요(기본)\nUNPIVOT INCLUDE NULLS (AMT FOR QTR IN (…));  -- ②' INCLUDE NULLS면 NULL 행도 남겨요" },
    { t: "1단계: 펼친 결과와 NULL 처리", tb: { c: ["YR", "QTR", "AMT", "① 기본(EXCLUDE)", "② INCLUDE NULLS"], r: [[2025, "Q1", 10, "남음", "남음"], [2025, "Q2", null, "빠짐", "남음"], [2025, "Q3", 30, "남음", "남음"], [2026, "Q1", null, "빠짐", "남음"], [2026, "Q2", null, "빠짐", "남음"], [2026, "Q3", 50, "남음", "남음"]], hl: [1, 3, 4] }, n: "① 3건, ② 6건" }
  ],
  ox: [
    "정답이에요. 기본 EXCLUDE NULLS로 NULL 3칸이 빠져 ①은 3건, INCLUDE NULLS인 ②는 6건이에요.",
    "이렇게 생각하면 틀려요: 'UNPIVOT은 기본적으로 NULL도 행으로 만든다.' Oracle 기본값은 EXCLUDE NULLS라 ①에서는 NULL인 3행이 빠져요.",
    "이렇게 생각하면 틀려요: 'INCLUDE NULLS를 써도 NULL은 빠진다.' INCLUDE NULLS는 바로 NULL 값도 행으로 남기라는 옵션이라 ②는 6건이에요.",
    "이렇게 생각하면 틀려요: '기본값이 INCLUDE NULLS이고, INCLUDE NULLS를 쓰면 NULL을 뺀다.' 거꾸로예요. 기본은 EXCLUDE NULLS(빼기)이고, INCLUDE NULLS가 남기기예요."
  ],
  trap: "UNPIVOT 결과 행 수를 물으면 원본의 NULL 칸 수부터 세세요. 기본 동작에서는 NULL 칸 수만큼 줄어요.",
  memo: "UNPIVOT 기본 = EXCLUDE NULLS (NULL 칸은 행이 안 됨)"
},
{
  id: "S250", s: 2, tp: "pivot", lv: 2, sub: "PIVOT 절과 UNPIVOT 절",
  th: "2과목 | PIVOT IN 값에 별칭을 붙였을 때의 결과 컬럼 이름 (Oracle)",
  q: "(Oracle 기준) 다음 SQL 결과의 컬럼 이름을 순서대로 나열한 것은?",
  tb: [{ n: "SALES", c: ["DEPT", "QTR", "AMT"], r: [["D1", "Q1", 10], ["D1", "Q2", 20], ["D2", "Q1", 30], ["D2", "Q3", 40]] }],
  sql: "SELECT *\n  FROM (SELECT DEPT, QTR, AMT FROM SALES)\n PIVOT (SUM(AMT) FOR QTR IN ('Q1' AS A, 'Q2' AS B));",
  o: ["DEPT, Q1, Q2", "DEPT, A, B", "DEPT, QTR, A, B", "DEPT, AMT, A, B"],
  a: 1,
  sum: "PIVOT에 쓰지 않은 DEPT는 남고, FOR의 QTR과 집계의 AMT는 사라져요. IN 값에 붙인 별칭 A, B가 새 컬럼 이름이 되어 DEPT, A, B예요.",
  why: "PIVOT은 FOR 뒤 컬럼(QTR)의 값들을 새 컬럼으로 세워요. 새 컬럼에는 집계 함수(SUM(AMT))의 결과가 들어가요.\n\n결과에 남는 컬럼은 두 종류예요. PIVOT에 쓰이지 않은 나머지 컬럼(DEPT)은 행을 나누는 기준으로 남아요. FOR에 쓴 QTR과 집계에 쓴 AMT는 사라지고, IN 목록의 값마다 새 컬럼이 생겨요.\n\n**IN 목록의 값에 AS 별칭을 붙이면 새 컬럼 이름은 그 별칭이 돼요.** 그래서 'Q1' 대신 A, 'Q2' 대신 B가 컬럼 이름이에요. 별칭이 없었다면 IN 목록의 값 그대로('Q1', 'Q2' — 작은따옴표까지 포함)가 컬럼 이름이 됐을 거예요.\n\n그래서 결과 컬럼은 DEPT, A, B예요. IN 목록에 없는 'Q3'의 데이터(D2의 40)는 어떤 컬럼에도 들어가지 않아요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT *\n  FROM (SELECT DEPT, QTR, AMT FROM SALES)          -- ① 원천 컬럼: DEPT, QTR, AMT\n PIVOT (SUM(AMT)                                   -- ③ 새 컬럼에 들어갈 값: AMT 합계\n        FOR QTR IN ('Q1' AS A, 'Q2' AS B));        -- ② QTR 값 'Q1' → 컬럼 A, 'Q2' → 컬럼 B / 나머지 DEPT는 행 기준으로 남아요" },
    { t: "1단계: 결과", tb: { c: ["DEPT", "A", "B"], r: [["D1", 10, 20], ["D2", 30, null]] }, n: "'Q3'은 IN 목록에 없어 버려져요." }
  ],
  res: { c: ["DEPT", "A", "B"], r: [["D1", 10, 20], ["D2", 30, null]] },
  ox: [
    "이렇게 생각하면 틀려요: 'IN 목록의 별칭은 무시되고 값 자체가 컬럼 이름이 된다.' 그건 별칭이 없을 때예요. AS A, AS B를 붙였으니 컬럼 이름은 A, B예요.",
    "정답이에요. DEPT는 그대로 남고, FOR의 QTR과 집계의 AMT는 사라지며, IN의 별칭 A, B가 새 컬럼 이름이 돼요.",
    "이렇게 생각하면 틀려요: 'FOR에 쓴 QTR도 결과에 남는다.' QTR의 값들이 새 컬럼(A, B)으로 바뀌었으니 QTR 컬럼 자체는 사라져요.",
    "이렇게 생각하면 틀려요: '집계에 쓴 AMT도 결과에 남는다.' AMT의 값은 A, B 컬럼 안으로 들어가고 AMT 컬럼은 사라져요."
  ],
  trap: "집계 함수에도 별칭을 주면(SUM(AMT) AS S) 컬럼 이름은 A_S, B_S처럼 'IN 별칭_집계 별칭'이 돼요.",
  memo: "PIVOT 결과 = 나머지 컬럼 + IN 값(별칭)"
},
{
  id: "S251", s: 2, tp: "hier", lv: 3, kill: true, sub: "계층형 질의와 셀프 조인",
  th: "2과목 | 루트가 2개인 계층형 질의의 행 수와 리프 노드의 LEVEL (Oracle)",
  q: "(Oracle 기준) 다음 SQL의 결과 행 수와, LEAF가 1인 행들의 LEVEL 합계를 순서대로 나열한 것은?",
  tb: [{ n: "EMP", c: ["EMPNO", "MGR"], r: [[1, null], [2, 1], [3, 2], [4, 1], [5, null], [6, 5]] }],
  sql: "SELECT EMPNO, MGR, LEVEL, CONNECT_BY_ISLEAF AS LEAF\n  FROM EMP\n START WITH MGR IS NULL\nCONNECT BY PRIOR EMPNO = MGR;",
  o: ["4행, 5", "6행, 3", "6행, 4", "6행, 7"],
  a: 3,
  sum: "MGR IS NULL인 1번과 5번이 모두 루트가 되어 6행이 다 나와요. 리프는 3번(LEVEL 3), 4번(LEVEL 2), 6번(LEVEL 2)이라 LEVEL 합계는 7이에요.",
  why: "START WITH는 계층의 출발점(루트)을 고르는 조건이에요. 조건을 만족하는 행이 여러 개면 루트도 여러 개가 되고, 루트마다 따로 트리를 펼쳐요.\n\nMGR IS NULL인 행은 1번과 5번 두 개예요. 1번 아래로 2, 4가 있고, 2번 아래로 3이 있어요. 5번 아래로는 6이 있어요. 그래서 6행 모두 나와요.\n\nLEVEL은 루트가 1이고 한 단계 내려갈 때마다 1씩 늘어요. **CONNECT_BY_ISLEAF는 자식이 없는 맨 아래 행이면 1이고, 그런 리프(잎) 노드의 LEVEL은 1이 아니라 루트로부터의 깊이예요.**\n\n리프는 3번(LEVEL 3), 4번(LEVEL 2), 6번(LEVEL 2)이에요. LEVEL 합계는 3 + 2 + 2 = 7이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT EMPNO, MGR, LEVEL, CONNECT_BY_ISLEAF AS LEAF  -- ④ 깊이와 리프 여부를 함께 보여 줘요\n  FROM EMP\n START WITH MGR IS NULL                             -- ① 루트: MGR이 NULL인 1번, 5번 (두 개)\nCONNECT BY PRIOR EMPNO = MGR;                       -- ② 부모의 EMPNO = 자식의 MGR로 아래로 내려가요\n                                                    -- ③ 루트마다 깊이 우선으로 펼쳐요" },
    { t: "1단계: 계층 전개 결과", tb: { c: ["EMPNO", "MGR", "LEVEL", "LEAF"], r: [[1, null, 1, 0], [2, 1, 2, 0], [3, 2, 3, 1], [4, 1, 2, 1], [5, null, 1, 0], [6, 5, 2, 1]], hl: [2, 3, 5] }, n: "리프 LEVEL 합계: 3 + 2 + 2 = 7" }
  ],
  res: { c: ["EMPNO", "MGR", "LEVEL", "LEAF"], r: [[1, null, 1, 0], [2, 1, 2, 0], [3, 2, 3, 1], [4, 1, 2, 1], [5, null, 1, 0], [6, 5, 2, 1]] },
  ox: [
    "이렇게 생각하면 틀려요: 'START WITH는 조건에 맞는 첫 행 하나만 루트로 쓴다.' 그러면 1번 트리(1, 2, 3, 4)만 나와 4행, 리프 LEVEL 합 3 + 2 = 5가 되지만, 조건에 맞는 5번도 루트가 돼요.",
    "이렇게 생각하면 틀려요: '리프 노드는 LEVEL 1이다.' 그러면 리프 3개가 1씩이라 3이 되지만, LEVEL 1은 루트예요. 리프는 맨 아래라 LEVEL이 가장 깊어요.",
    "이렇게 생각하면 틀려요: 'LEVEL은 루트에서 0부터 센다.' 그러면 2 + 1 + 1 = 4가 되지만, Oracle의 LEVEL은 루트가 1이에요.",
    "정답이에요. 루트 2개(1번, 5번)에서 6행이 모두 나오고, 리프 3번, 4번, 6번의 LEVEL 합은 3 + 2 + 2 = 7이에요."
  ],
  trap: "루트 조건(MGR IS NULL)에 맞는 행이 여럿이면 트리도 여럿이에요. 행 수를 셀 때 두 번째 트리를 빠뜨리지 마세요.",
  memo: "루트 = LEVEL 1, 리프 = 자식 없음(ISLEAF 1), 루트가 여러 개면 트리도 여러 개"
},
{
  id: "S252", s: 2, tp: "ddl", lv: 2, kill: true, sub: "DDL",
  th: "2과목 | 제약조건별 NULL 허용 여부: UNIQUE · CHECK vs PK · NOT NULL",
  q: "(Oracle 기준) 다음과 같이 만든 테이블에 INSERT할 때, NULL을 저장할 수 있는 컬럼을 모두 고른 것은?",
  sql: "CREATE TABLE MEMBER (\n  ID     NUMBER       PRIMARY KEY,\n  EMAIL  VARCHAR2(50) UNIQUE,\n  NAME   VARCHAR2(20) NOT NULL,\n  GENDER CHAR(1)      CHECK (GENDER IN ('M', 'F'))\n);",
  o: ["EMAIL", "EMAIL, GENDER", "GENDER", "ID, EMAIL, GENDER"],
  a: 1,
  sum: "PK와 NOT NULL은 NULL을 막지만, UNIQUE는 NULL을 허용해요. CHECK는 조건이 거짓일 때만 막는데 NULL은 '모름'이라 통과해서 EMAIL, GENDER에 NULL을 넣을 수 있어요.",
  why: "PRIMARY KEY(기본키)는 'UNIQUE + NOT NULL'이라 NULL을 넣을 수 없어요. NOT NULL은 이름 그대로 NULL을 막아요. 그래서 ID와 NAME은 NULL이 안 돼요.\n\nUNIQUE는 같은 값이 두 번 들어오지 못하게 막는 제약이에요. NULL은 값이 없는 상태라 다른 값과 같다고 볼 수 없어서, Oracle에서는 UNIQUE 컬럼에 NULL을 넣을 수 있어요. 여러 행에 NULL을 넣어도 돼요.\n\nCHECK는 조건이 거짓(FALSE)인 값을 막아요. GENDER에 NULL을 넣으면 NULL IN ('M', 'F')는 참도 거짓도 아닌 '모름(UNKNOWN)'이 돼요.\n\n**CHECK 제약은 조건이 '거짓'일 때만 거부하므로, 결과가 '모름'인 NULL은 통과해요.** WHERE 절은 참인 행만 고르지만, CHECK는 거짓인 값만 막는다는 차이가 있어요. GENDER에서 NULL까지 막으려면 NOT NULL을 따로 붙여야 해요.\n\n그래서 NULL을 저장할 수 있는 컬럼은 EMAIL과 GENDER예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "CREATE TABLE MEMBER (\n  ID     NUMBER       PRIMARY KEY,                  -- ① UNIQUE + NOT NULL → NULL 불가\n  EMAIL  VARCHAR2(50) UNIQUE,                       -- ② 중복만 막아요 → NULL 가능\n  NAME   VARCHAR2(20) NOT NULL,                     -- ③ NULL 불가\n  GENDER CHAR(1)      CHECK (GENDER IN ('M', 'F'))  -- ④ NULL이면 조건이 '모름' → 거짓이 아니라 통과\n);" },
    { t: "1단계: 컬럼별 NULL 허용 판정", tb: { c: ["컬럼", "제약", "NULL 넣으면", "이유"], r: [["ID", "PRIMARY KEY", "오류", "PK는 NOT NULL을 포함"], ["EMAIL", "UNIQUE", "저장됨", "NULL은 중복 검사 대상이 아님"], ["NAME", "NOT NULL", "오류", "NULL 금지"], ["GENDER", "CHECK IN ('M', 'F')", "저장됨", "조건 결과가 모름(UNKNOWN), 거짓이 아님"]], hl: [1, 3] } }
  ],
  ox: [
    "이렇게 생각하면 틀려요: 'CHECK (GENDER IN ('M', 'F'))는 M, F 말고는 전부 막는다.' CHECK는 거짓만 막아요. NULL은 비교 결과가 모름(UNKNOWN)이라 통과해서 GENDER도 NULL이 돼요.",
    "정답이에요. UNIQUE는 NULL을 허용하고, CHECK는 결과가 모름(UNKNOWN)인 NULL을 거부하지 않아요. PK와 NOT NULL 컬럼만 NULL이 안 돼요.",
    "이렇게 생각하면 틀려요: 'UNIQUE는 중복을 막으니 NULL도 안 된다.' Oracle의 UNIQUE는 NULL을 허용해요. NULL끼리는 같은 값으로 보지 않아 여러 행에 넣을 수도 있어요.",
    "이렇게 생각하면 틀려요: 'PRIMARY KEY는 UNIQUE와 같아서 NULL이 된다.' PK는 UNIQUE에 NOT NULL까지 더한 제약이라 NULL을 넣을 수 없어요."
  ],
  trap: "'CHECK가 있으면 NULL이 막힌다'는 흔한 착각이에요. CHECK는 FALSE만 거부하므로 NULL을 막으려면 NOT NULL이 필요해요.",
  memo: "NULL 거부 = PK, NOT NULL / NULL 허용 = UNIQUE, CHECK"
},
{
  id: "S253", s: 2, tp: "notin", lv: 2, kill: true, sub: "WHERE 절",
  th: "2과목 | IN 목록의 중복 값과 IN / NOT IN 목록의 NULL",
  q: "다음 세 SQL의 결과를 ①, ②, ③ 순서대로 나열한 것은?",
  tb: [{ n: "T", c: ["ID", "DEPT"], r: [[1, 10], [2, 10], [3, 20], [4, 30], [5, 100], [6, null]] }],
  sql: "-- ①\nSELECT COUNT(*) FROM T WHERE DEPT IN (10, 10, 20);\n-- ②\nSELECT COUNT(*) FROM T WHERE DEPT IN (100, NULL);\n-- ③\nSELECT COUNT(*) FROM T WHERE DEPT NOT IN (100, NULL);",
  o: ["3, 1, 0", "3, 2, 4", "5, 1, 0", "① 오류, 1, 0"],
  a: 0,
  sum: "IN 목록의 중복 값은 오류도 아니고 결과도 바꾸지 않아 ①은 3이에요. IN (100, NULL)은 100인 행만 참이라 1, NOT IN 목록에 NULL이 있으면 모든 행이 '모름'이 되어 0이에요.",
  why: "IN (a, b, c)는 DEPT = a OR DEPT = b OR DEPT = c와 같아요. 목록에 같은 값이 두 번 있어도 오류가 아니에요. OR로 같은 조건을 한 번 더 붙인 것뿐이라 결과도 달라지지 않아요.\n\n그래서 ①은 DEPT가 10 또는 20인 ID 1, 2, 3의 3행이에요. 한 행이 두 번 세어지지도 않아요.\n\n②는 DEPT = 100 OR DEPT = NULL이에요. DEPT = NULL은 어떤 행에서도 참이 아니라 모름(UNKNOWN)이에요. OR에서는 하나만 참이면 참이니, DEPT가 100인 ID 5의 1행만 나와요. DEPT가 NULL인 ID 6도 NULL = NULL이 참이 아니라 빠져요.\n\n③은 DEPT <> 100 AND DEPT <> NULL이에요. **DEPT <> NULL은 항상 모름이고 AND에 모름이 끼면 참이 될 수 없어서, NOT IN 목록에 NULL이 하나라도 있으면 결과는 0건이에요.**\n\n그래서 3, 1, 0이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "WHERE DEPT IN (10, 10, 20)      -- ① DEPT = 10 OR DEPT = 10 OR DEPT = 20 (중복은 무해)\nWHERE DEPT IN (100, NULL)       -- ② DEPT = 100 OR DEPT = NULL(항상 모름) → 100인 행만 참\nWHERE DEPT NOT IN (100, NULL)   -- ③ DEPT <> 100 AND DEPT <> NULL(항상 모름) → 참인 행 없음" },
    { t: "1단계: 행별 판정", tb: { c: ["ID", "DEPT", "①", "②", "③"], r: [[1, 10, "참", "모름", "모름"], [2, 10, "참", "모름", "모름"], [3, 20, "참", "모름", "모름"], [4, 30, "거짓", "모름", "모름"], [5, 100, "거짓", "참", "거짓"], [6, null, "모름", "모름", "모름"]], hl: [4] }, n: "참인 행 수: ① 3, ② 1, ③ 0" }
  ],
  res: { c: ["C1", "C2", "C3"], r: [[3, 1, 0]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE DEPT IN (10, 10, 20)) AS C1, (SELECT COUNT(*) FROM T WHERE DEPT IN (100, NULL)) AS C2, (SELECT COUNT(*) FROM T WHERE DEPT NOT IN (100, NULL)) AS C3",
  ox: [
    "정답이에요. 중복 값은 결과를 바꾸지 않아 ①은 3, IN의 NULL은 아무 행과도 맞지 않아 ②는 1, NOT IN의 NULL은 모든 행을 모름으로 만들어 ③은 0이에요.",
    "이렇게 생각하면 틀려요: 'IN의 NULL은 NULL 행과 짝이 맞고, NOT IN의 NULL은 무시된다.' NULL = NULL은 참이 아니라 ②는 1행이고, NOT IN 목록의 NULL은 모든 행을 모름으로 만들어 ③은 0행이에요.",
    "이렇게 생각하면 틀려요: '목록에 10이 두 번 있으면 10인 행도 두 번 센다.' IN은 행마다 조건을 한 번 검사할 뿐이라 같은 행이 두 번 나오지 않아요. ①은 3행이에요.",
    "이렇게 생각하면 틀려요: 'IN 목록에 같은 값이 있으면 오류다.' 중복 값은 OR 조건이 하나 더 붙은 것뿐이라 정상 실행돼요."
  ],
  trap: "IN 목록의 중복은 무해하고, NOT IN 목록의 NULL은 결과를 0건으로 만들어요.",
  memo: "IN 중복 OK / NOT IN 목록에 NULL = 0건"
},
{
  id: "S254", s: 2, tp: "dml", lv: 3, kill: true, sub: "DML",
  th: "2과목 | MERGE의 UPDATE … DELETE WHERE와 NOT MATCHED INSERT (Oracle)",
  q: "(Oracle 기준) 다음 MERGE 문을 실행한 뒤 [TGT] 테이블의 SUM(AMT)는?",
  tb: [
    { n: "TGT", c: ["ID", "AMT"], r: [[1, 100], [2, 250], [3, 50], [4, 400]] },
    { n: "SRC", c: ["ID", "AMT"], r: [[1, 50], [2, 100], [5, 350]] }
  ],
  sql: "MERGE INTO TGT T\nUSING SRC S\n   ON (T.ID = S.ID)\n WHEN MATCHED THEN\n      UPDATE SET T.AMT = T.AMT + S.AMT\n      DELETE WHERE T.AMT >= 300\n WHEN NOT MATCHED THEN\n      INSERT (ID, AMT) VALUES (S.ID, S.AMT);",
  o: ["200", "550", "600", "950"],
  a: 3,
  sum: "DELETE WHERE는 이번 MERGE에서 UPDATE된 행만, UPDATE 후의 값으로 검사해요. ID 2(350)만 지워지고, 새로 들어간 ID 5와 건드리지 않은 ID 4는 남아서 합계는 950이에요.",
  why: "Oracle의 MERGE는 WHEN MATCHED 절의 UPDATE 뒤에 DELETE WHERE를 붙일 수 있어요. '고친 다음, 조건에 맞으면 지운다'는 뜻이에요.\n\n**DELETE WHERE는 이번 MERGE에서 UPDATE된 행만 대상으로 하고, 조건은 UPDATE가 끝난 뒤의 값으로 검사해요.** 짝이 없어 건드리지 않은 TGT 행이나, WHEN NOT MATCHED로 새로 들어간 행은 조건에 맞아도 지워지지 않아요.\n\nSRC 행별로 볼게요. ID 1은 짝이 있어 100 + 50 = 150이 되고, 300 미만이라 남아요. ID 2는 250 + 100 = 350이 되고, 300 이상이라 지워져요.\n\nID 5는 짝이 없어 (5, 350)으로 새로 들어가요. 350이지만 UPDATE된 행이 아니라 지워지지 않아요. ID 3(50)과 ID 4(400)는 SRC에 없어서 그대로예요. ID 4도 300 이상이지만 UPDATE되지 않았으니 남아요.\n\n최종 TGT는 (1, 150), (3, 50), (4, 400), (5, 350)이고 합계는 950이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "MERGE INTO TGT T                           -- ① 바꿀 대상: TGT 4행\nUSING SRC S                                -- ② SRC 3행을 하나씩 꺼내요\n   ON (T.ID = S.ID)                        -- ③ ID가 같은 TGT 행이 있는지 찾아요\n WHEN MATCHED THEN                         -- ④ 짝이 있으면 (ID 1, 2)\n      UPDATE SET T.AMT = T.AMT + S.AMT     --    먼저 더해서 고치고\n      DELETE WHERE T.AMT >= 300            --    고친 값이 300 이상이면 지워요 (고친 행만 대상)\n WHEN NOT MATCHED THEN                     -- ⑤ 짝이 없으면 (ID 5)\n      INSERT (ID, AMT) VALUES (S.ID, S.AMT);  --  새로 넣어요 (DELETE WHERE 대상 아님)" },
    { t: "1단계: SRC 행별 처리", tb: { c: ["SRC 행", "짝", "UPDATE 후 AMT", "DELETE WHERE (>= 300)", "결과"], r: [["(1, 50)", "있음", 150, "X", "(1, 150)"], ["(2, 100)", "있음", 350, "O", "삭제"], ["(5, 350)", "없음", "—", "대상 아님", "INSERT (5, 350)"]], hl: [1] } },
    { t: "2단계: 최종 TGT", tb: { c: ["ID", "AMT", "무슨 일이 있었나"], r: [[1, 150, "UPDATE"], [3, 50, "SRC에 없음 → 그대로"], [4, 400, "SRC에 없음 → 300 이상이어도 그대로"], [5, 350, "INSERT → 삭제 대상 아님"]], hl: [2, 3] }, n: "150 + 50 + 400 + 350 = 950" }
  ],
  res: { c: ["SUM_AMT"], r: [[950]] },
  pg: "MERGE INTO TGT T USING SRC S ON (T.ID = S.ID) WHEN MATCHED AND T.AMT + S.AMT >= 300 THEN DELETE WHEN MATCHED THEN UPDATE SET AMT = T.AMT + S.AMT WHEN NOT MATCHED THEN INSERT (ID, AMT) VALUES (S.ID, S.AMT); SELECT SUM(AMT) FROM TGT",
  ox: [
    "이렇게 생각하면 틀려요: 'DELETE WHERE는 MERGE가 끝난 TGT 전체에서 300 이상인 행을 지운다.' 그러면 ID 2, 4, 5가 지워져 150 + 50 = 200이 되지만, DELETE WHERE는 UPDATE된 행(ID 1, 2)만 봐요.",
    "이렇게 생각하면 틀려요: 'DELETE WHERE는 원래 TGT에 있던 행 중 300 이상을 지운다.' 그러면 ID 2와 ID 4가 지워져 550이 되지만, ID 4는 UPDATE되지 않아 대상이 아니에요.",
    "이렇게 생각하면 틀려요: '새로 INSERT된 행도 DELETE WHERE 검사를 받는다.' 그러면 ID 2와 ID 5가 지워져 600이 되지만, INSERT된 행은 DELETE WHERE 대상이 아니에요.",
    "정답이에요. UPDATE된 ID 1, 2 중 고친 값이 300 이상인 ID 2만 지워지고, 나머지 150 + 50 + 400 + 350 = 950이에요."
  ],
  trap: "DELETE WHERE의 조건은 UPDATE 전 값이 아니라 UPDATE 후 값으로, UPDATE된 행에만 검사해요. UPDATE … DELETE WHERE는 Oracle 전용 문법이고, 표준 MERGE(PostgreSQL, SQL Server 등)에서는 'WHEN MATCHED AND 조건 THEN DELETE'를 따로 써요.",
  memo: "MERGE DELETE WHERE = UPDATE된 행만, UPDATE 후 값으로"
}
);
