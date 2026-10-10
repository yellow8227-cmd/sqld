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
  o: ["(1, A), (2, B), (3, Y)", "(1, A), (2, X), (3, Y)", "(2, X), (3, Y)", "(1, A), (2, X)"],
  a: 1,
  sum: "MERGE는 SRC의 행을 하나씩 꺼내서 TGT에 짝이 있으면 고치고, 없으면 새로 넣어요. SRC에 없는 TGT 행(ID 1)은 아무도 건드리지 않아서 그대로 남아요.",
  why: "MERGE는 '있으면 고치고, 없으면 넣는' 명령이에요. USING 쪽(SRC)의 행을 하나씩 꺼내서, ON 조건으로 대상(TGT)에 짝이 있는지 찾아봐요.\n\n짝이 있으면 WHEN MATCHED(짝 있음) 절의 UPDATE를 하고, 짝이 없으면 WHEN NOT MATCHED(짝 없음) 절의 INSERT를 해요. 일의 출발점이 SRC 행이라는 게 중요해요.\n\n**SRC에 짝이 없는 TGT 행은 어느 절에도 걸리지 않아서 그대로 남아요.** MERGE는 'TGT를 SRC와 똑같이 맞추는 동기화'가 아니에요.\n\n이 문제에 대입해 볼게요. SRC의 (2, X)는 TGT에 ID 2가 있으니 짝이 있어요. 그래서 V가 B에서 X로 바뀌어요.\n\nSRC의 (3, Y)는 TGT에 ID 3이 없으니 짝이 없어요. 그래서 (3, Y)가 새로 들어가요. TGT의 (1, A)는 SRC에 없으니 아무 일도 일어나지 않아요.\n\n그래서 결과는 (1, A), (2, X), (3, Y)예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "MERGE INTO TGT T                        -- ① 바꿀 대상: TGT 2행 (1, A) (2, B)\nUSING SRC S                             -- ② 반영할 원천: SRC 2행 (2, X) (3, Y)을 하나씩 꺼내요\n   ON (T.ID = S.ID)                     -- ③ ID가 같은 TGT 행이 있는지 찾아요\n WHEN MATCHED THEN                      -- ④ 짝이 있으면 (SRC 2 ↔ TGT 2)\n      UPDATE SET T.V = S.V              --    TGT의 V를 SRC 값으로: B → X\n WHEN NOT MATCHED THEN                  -- ⑤ 짝이 없으면 (SRC 3)\n      INSERT (ID, V) VALUES (S.ID, S.V); --    (3, Y)를 새로 넣어요" },
    { t: "SRC 행별 처리", tb: { c: ["SRC 행", "TGT에 같은 ID?", "동작"], r: [["(2, X)", "있음", "UPDATE → (2, X)"], ["(3, Y)", "없음", "INSERT → (3, Y)"]] } },
    { t: "실행 전과 후 비교", tb: { c: ["ID", "실행 전 V", "실행 후 V", "무슨 일이 있었나"], r: [[1, "A", "A", "SRC에 없어요 → 그대로"], [2, "B", "X", "짝 있음 → UPDATE"], [3, "(없음)", "Y", "짝 없음 → INSERT"]], hl: [1, 2] } }
  ],
  res: { c: ["ID", "V"], r: [[1, "A"], [2, "X"], [3, "Y"]] },
  pg: "MERGE INTO TGT T USING SRC S ON (T.ID = S.ID) WHEN MATCHED THEN UPDATE SET V = S.V WHEN NOT MATCHED THEN INSERT (ID, V) VALUES (S.ID, S.V); SELECT ID, V FROM TGT ORDER BY ID",
  ox: ["이렇게 생각하면 틀려요: '이미 있는 행은 안 건드린다.' ID 2는 SRC와 짝이 맞으니 WHEN MATCHED의 UPDATE가 실행돼서 B가 X로 바뀌어요.", "정답이에요. ID 2는 짝이 있어서 X로 고쳐지고, ID 3은 짝이 없어서 새로 들어가요. ID 1은 SRC에 없으니 그대로 남아요.", "이렇게 생각하면 틀려요: 'MERGE는 TGT를 SRC와 똑같이 맞춘다.' MERGE는 SRC 행에서 출발해요. SRC에 없는 ID 1은 어느 절에도 걸리지 않아서 지워지지 않아요.", "이렇게 생각하면 틀려요: 'MERGE는 고치기만 한다.' SRC의 ID 3은 TGT에 짝이 없으니 WHEN NOT MATCHED의 INSERT로 새로 들어가요."],
  trap: "MERGE는 동기화가 아니에요. SRC에 없는 TGT 행은 지워지지 않아요. 또 Oracle에서는 ON 절에 쓴 컬럼(ID)을 UPDATE SET으로 바꿀 수 없어요(ORA-38104).",
  memo: "MERGE = 짝 있으면 UPDATE, 없으면 INSERT, SRC에 없는 행은 그대로"
},
{
  id: "S46", s: 2, tp: "tcl", lv: 2,
  th: "2과목 | SAVEPOINT와 ROLLBACK TO",
  q: "다음 SQL을 순서대로 실행한 뒤 [T] 테이블에 남아 있는 ID 값으로 옳은 것은?",
  sql: "CREATE TABLE T (ID NUMBER);\nINSERT INTO T VALUES (1);\nCOMMIT;\nINSERT INTO T VALUES (2);\nSAVEPOINT SP1;\nINSERT INTO T VALUES (3);\nSAVEPOINT SP2;\nDELETE FROM T WHERE ID = 1;\nROLLBACK TO SP1;\nINSERT INTO T VALUES (4);\nCOMMIT;",
  o: ["1, 2, 4", "2, 4", "1, 2, 3, 4", "1, 4"],
  a: 0,
  sum: "ROLLBACK TO SP1은 SP1 뒤에 한 일(INSERT 3, DELETE 1)만 지워요. SP1 앞의 INSERT 2는 살아 있고, 마지막에 INSERT 4까지 COMMIT되니 1, 2, 4가 남아요.",
  why: "SAVEPOINT는 트랜잭션 중간에 꽂아 두는 책갈피예요. ROLLBACK TO 책갈피는 그 책갈피 '뒤에' 한 변경만 되돌려요.\n\n왜 이렇게 될까요? DB는 변경할 때마다 '되돌리는 방법'을 순서대로 적어 둬요. ROLLBACK TO는 그 기록을 최근 것부터 책갈피 위치까지만 거꾸로 실행해요. **그래서 책갈피 앞의 변경은 아직 COMMIT 전이어도 살아 있고, 트랜잭션도 끝나지 않아요.**\n\n순서대로 따라가 볼게요. 처음 INSERT 1은 COMMIT으로 확정돼요. 그다음 INSERT 2를 하고 SP1을 꽂아요.\n\n이때 상태는 {1, 2}예요. 이어서 INSERT 3, SP2, DELETE 1을 해서 {2, 3}이 돼요.\n\nROLLBACK TO SP1을 하면 SP1 뒤의 INSERT 3과 DELETE 1이 취소돼서 {1, 2}로 돌아가요. SP1보다 뒤에 꽂은 SP2도 함께 사라져요. 마지막으로 INSERT 4를 하고 COMMIT하니 {1, 2, 4}가 확정돼요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "CREATE TABLE T (ID NUMBER);  -- ① 빈 테이블을 만들어요\nINSERT INTO T VALUES (1);    -- ② T = {1}\nCOMMIT;                      -- ③ {1} 확정. 새 트랜잭션이 시작돼요\nINSERT INTO T VALUES (2);    -- ④ T = {1, 2} (아직 확정 전)\nSAVEPOINT SP1;               -- ⑤ 책갈피 SP1: 지금 상태 {1, 2}\nINSERT INTO T VALUES (3);    -- ⑥ T = {1, 2, 3}\nSAVEPOINT SP2;               -- ⑦ 책갈피 SP2: 지금 상태 {1, 2, 3}\nDELETE FROM T WHERE ID = 1;  -- ⑧ T = {2, 3}\nROLLBACK TO SP1;             -- ⑨ ⑥~⑧ 취소 → {1, 2}, SP2도 사라져요\nINSERT INTO T VALUES (4);    -- ⑩ T = {1, 2, 4}\nCOMMIT;                      -- ⑪ {1, 2, 4} 확정" },
    { t: "단계별 테이블 상태", tb: { c: ["명령", "T 상태", "비고"], r: [["INSERT 1 + COMMIT", "{1}", "확정"], ["INSERT 2", "{1, 2}", ""], ["SAVEPOINT SP1", "{1, 2}", "SP1 표시"], ["INSERT 3", "{1, 2, 3}", ""], ["SAVEPOINT SP2", "{1, 2, 3}", ""], ["DELETE ID = 1", "{2, 3}", ""], ["ROLLBACK TO SP1", "{1, 2}", "SP1 이후 취소"], ["INSERT 4 + COMMIT", "{1, 2, 4}", "확정"]], hl: [6, 7] } }
  ],
  pgSetup: "CREATE TABLE T (ID numeric);",
  res: { c: ["ID"], r: [[1], [2], [4]] },
  pg: "BEGIN; INSERT INTO T VALUES (1); COMMIT; BEGIN; INSERT INTO T VALUES (2); SAVEPOINT SP1; INSERT INTO T VALUES (3); SAVEPOINT SP2; DELETE FROM T WHERE ID = 1; ROLLBACK TO SP1; INSERT INTO T VALUES (4); COMMIT; SELECT ID FROM T ORDER BY ID",
  ox: [
    "정답이에요. SP1 뒤의 INSERT 3과 DELETE 1만 취소되고, SP1 앞의 INSERT 2와 나중의 INSERT 4가 COMMIT으로 확정돼요.",
    "이렇게 생각하면 틀려요: 'INSERT 3만 취소되고 DELETE 1은 남는다.' ROLLBACK TO는 책갈피 뒤의 변경을 전부 되돌려요. DELETE도 SP1 뒤에 했으니 함께 취소돼요.",
    "이렇게 생각하면 틀려요: 'DELETE만 취소된다.' 이건 ROLLBACK TO SP2를 했을 때의 결과예요. 문제는 SP1으로 돌아가니 INSERT 3도 취소돼요.",
    "이렇게 생각하면 틀려요: 'ROLLBACK TO도 마지막 COMMIT까지 다 되돌린다.' 그건 그냥 ROLLBACK이에요. ROLLBACK TO SP1은 SP1 앞의 INSERT 2를 남겨 둬요."
  ],
  trap: "SAVEPOINT 문제는 ROLLBACK TO가 가리키는 책갈피를 먼저 찾고, 그 뒤의 명령에 줄을 그어 지우면 빨라요.",
  memo: "ROLLBACK TO SP = SP 뒤에 한 일만 취소"
},
{
  id: "S47", s: 2, tp: "tcl", lv: 3,
  th: "2과목 | DDL의 자동 커밋 (Oracle)",
  q: "Oracle에서 다음 SQL을 순서대로 실행한 뒤 [T] 테이블의 행 수는? (T는 비어 있는 상태에서 시작한다.)",
  sql: "INSERT INTO T VALUES (1);\nINSERT INTO T VALUES (2);\nCREATE TABLE X (C NUMBER);\nINSERT INTO T VALUES (3);\nROLLBACK;",
  o: ["0", "1", "2", "3"],
  a: 2,
  sum: "Oracle에서 CREATE TABLE 같은 DDL을 실행하면 앞의 작업이 자동으로 COMMIT돼요. 그래서 INSERT 1, 2는 확정되고, 마지막 ROLLBACK은 INSERT 3만 지워서 2건이 남아요.",
  why: "Oracle에서 DDL(테이블을 만들고 바꾸는 명령)은 실행하기 직전과 직후에 저절로 COMMIT을 해요. 이걸 자동 커밋이라고 불러요.\n\n왜 그럴까요? DDL은 DB가 테이블 정보를 적어 두는 장부(데이터 사전)를 고치는 일이에요. Oracle은 이 일을 사용자가 하던 작업과 섞지 않으려고, 앞 작업을 먼저 확정하고 DDL도 바로 확정해요. **그래서 DDL이 끼어드는 순간, 그 앞에서 COMMIT하지 않은 INSERT까지 함께 확정돼요.**\n\n순서대로 볼게요. INSERT 1, 2는 아직 확정 전이에요.\n\nCREATE TABLE X가 실행되면서 1, 2가 확정돼요. 그다음 INSERT 3은 새 트랜잭션의 확정 전 변경이에요.\n\n마지막 ROLLBACK은 마지막 COMMIT 뒤의 변경, 즉 INSERT 3만 되돌려요. 그래서 T에는 1, 2 두 건이 남아요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "INSERT INTO T VALUES (1);    -- ① 확정 전 {1}\nINSERT INTO T VALUES (2);    -- ② 확정 전 {1, 2}\nCREATE TABLE X (C NUMBER);   -- ③ DDL: 실행 직전에 자동 COMMIT → {1, 2} 확정\nINSERT INTO T VALUES (3);    -- ④ 새 트랜잭션: 확정 전 {3}\nROLLBACK;                    -- ⑤ ③ 이후만 취소 → 3이 사라져요. 남은 행 2건" },
    { t: "단계별 상태", tb: { c: ["명령", "확정된 행", "미확정 행"], r: [["INSERT 1, 2", "—", "1, 2"], ["CREATE TABLE X (자동 COMMIT)", "1, 2", "—"], ["INSERT 3", "1, 2", "3"], ["ROLLBACK", "1, 2", "—"]], hl: [1] } },
    { t: "모두 되돌리고 싶다면: DDL을 먼저 실행해요", n: "CREATE TABLE X (C NUMBER);   -- DDL을 먼저 끝내요 (자동 COMMIT은 여기서 끝)\nINSERT INTO T VALUES (1);\nINSERT INTO T VALUES (2);\nINSERT INTO T VALUES (3);\nROLLBACK;                    -- 1, 2, 3이 모두 취소 → T는 0건" }
  ],
  ox: [
    "이렇게 생각하면 틀려요: 'ROLLBACK이 1, 2, 3을 다 지운다.' PostgreSQL이라면 그렇지만, Oracle은 CREATE TABLE을 실행할 때 1, 2를 이미 자동으로 확정했어요.",
    "이렇게 생각하면 틀려요: 'INSERT 1만 확정된다.' 자동 커밋은 DDL 앞에서 확정 안 된 것을 한꺼번에 확정해요. 1과 2가 함께 확정돼요.",
    "정답이에요. CREATE TABLE의 자동 커밋으로 1, 2가 확정되고, ROLLBACK은 그 뒤의 INSERT 3만 지워요.",
    "이렇게 생각하면 틀려요: 'DDL 뒤에는 ROLLBACK이 안 된다.' INSERT 3은 DDL 뒤에 새로 시작된 트랜잭션의 확정 전 변경이라 ROLLBACK으로 사라져요."
  ],
  trap: "PostgreSQL이나 SQL Server는 DDL도 ROLLBACK할 수 있어요. 하지만 SQLD는 Oracle 기준이니 'DDL = 자동 커밋'으로 풀어요.",
  memo: "DDL 실행 = 앞의 INSERT·UPDATE·DELETE까지 COMMIT"
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
  sum: "TRUNCATE는 행을 하나씩 고르지 않고 테이블을 통째로 비우는 명령이라 WHERE를 쓸 수 없어요. 그래서 ④가 틀린 설명이에요.",
  why: "세 명령 모두 데이터를 지우지만, 지우는 방식이 달라요. DELETE는 조건에 맞는 행을 한 줄씩 찾아서 지워요.\n\n지울 때마다 되돌리는 방법도 적어 둬요. 그래서 WHERE로 일부만 지울 수 있고, COMMIT 전이면 ROLLBACK도 돼요.\n\nTRUNCATE는 행을 하나씩 보지 않아요. 테이블이 쓰던 저장 공간을 처음 상태로 통째로 되돌리고, 테이블 구조만 남겨요. **행을 하나씩 고르지 않으니 '어떤 행인지'를 정하는 WHERE를 쓸 자리가 없어요.**\n\n되돌리는 기록도 행마다 남기지 않아서 빠른 대신 ROLLBACK이 안 돼요. 게다가 DDL이라 실행하면 자동으로 COMMIT돼요.\n\nDROP은 데이터뿐 아니라 테이블 정의 자체를 없애요.\n\n그래서 'TRUNCATE에 WHERE를 써서 일부만 지운다'는 ④가 틀린 설명이에요. 일부 행만 지우려면 DELETE를 써야 해요.",
  st: [
    { t: "삭제 명령 비교", tb: { c: ["항목", "DELETE", "TRUNCATE", "DROP"], r: [["분류", "DML", "DDL", "DDL"], ["ROLLBACK", "가능(커밋 전)", "불가", "불가"], ["WHERE", "가능", "불가", "불가"], ["저장 공간", "유지", "반환(초기화)", "전부 반환"], ["테이블 구조", "남음", "남음", "삭제"]], hl: [2] } },
    { t: "예시: 같은 목적, 다른 명령", n: "DELETE FROM EMP WHERE DEPTNO = 10;    -- 10번 부서 행만 지워요. COMMIT 전이면 되돌릴 수 있어요\nROLLBACK;                             -- 지운 행이 돌아와요\nTRUNCATE TABLE EMP;                   -- 모든 행을 지우고 저장 공간을 비워요. 바로 확정돼요\nTRUNCATE TABLE EMP WHERE DEPTNO = 10; -- 오류: TRUNCATE에는 WHERE 절이 없어요\nDROP TABLE EMP;                       -- 행과 테이블 정의까지 없어져요" }
  ],
  ox: [
    "옳은 설명이에요. DELETE는 행마다 되돌리는 기록을 남기는 DML이라 COMMIT 전이면 ROLLBACK으로 복구돼요.",
    "옳은 설명이에요. TRUNCATE는 DDL이라 실행하자마자 확정되고, 쓰던 저장 공간을 비워 돌려줘요.",
    "옳은 설명이에요. DROP은 행뿐 아니라 테이블 정의(구조)까지 없애요.",
    "틀린 설명이라 정답이에요. 이렇게 생각하면 틀려요: '지우는 명령이니 조건도 줄 수 있다.' 그건 DELETE 얘기예요. TRUNCATE는 테이블을 통째로 비우는 명령이라 WHERE를 쓸 수 없어요."
  ],
  trap: "'DELETE 후 저장 공간도 줄어든다'는 보기도 자주 나와요. DELETE는 행을 지워도 받아 둔 공간을 그대로 갖고 있어요.",
  memo: "DELETE = 고른 행만 / TRUNCATE = 전부(구조는 남김) / DROP = 구조까지"
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
  sum: "TRUNCATE는 데이터를 지우긴 하지만, 실제로는 테이블의 저장 공간을 초기화하는 DDL이에요. 그래서 DML 목록에 넣은 ②가 잘못된 분류예요.",
  why: "SQL 명령은 '무엇을 다루는가'로 나눠요. DML은 테이블 안의 행(데이터)을 다뤄요.\n\nDDL은 테이블 같은 객체의 정의와 저장 구조를 다뤄요. DCL은 권한을, TCL은 트랜잭션의 확정과 취소를 다뤄요.\n\nTRUNCATE는 결과만 보면 데이터를 지우니 DML 같아요. 하지만 행을 하나씩 지우는 게 아니라, 테이블이 쓰던 저장 공간을 통째로 처음 상태로 되돌리는 구조 작업이에요.\n\n그래서 Oracle은 TRUNCATE를 DDL로 다루고, 실행하면 자동으로 COMMIT해요. ROLLBACK도 안 돼요.\n\n**그래서 TRUNCATE를 DML 목록에 넣은 ②가 잘못된 분류예요.** DML은 INSERT, UPDATE, DELETE, MERGE예요. 교재에 따라 SELECT를 DQL(조회 명령)로 따로 나누기도 해요.",
  st: [
    { t: "예시: 문장마다 분류 붙이기", n: "CREATE TABLE T (ID NUMBER);  -- DDL: 객체를 만들어요\nINSERT INTO T VALUES (1);    -- DML: 행을 넣어요\nUPDATE T SET ID = 2;         -- DML: 행을 고쳐요\nDELETE FROM T;               -- DML: 행을 지워요 (ROLLBACK 가능)\nTRUNCATE TABLE T;            -- DDL: 저장 공간을 초기화해요 (자동 COMMIT)\nGRANT SELECT ON T TO B;      -- DCL: 권한을 줘요\nCOMMIT;                      -- TCL: 트랜잭션을 확정해요" },
    { t: "분류표", tb: { c: ["분류", "명령", "다루는 것"], r: [["DDL", "CREATE, ALTER, DROP, RENAME, TRUNCATE", "객체의 정의와 저장 구조"], ["DML", "INSERT, UPDATE, DELETE, MERGE", "테이블 안의 행"], ["DCL", "GRANT, REVOKE", "권한"], ["TCL", "COMMIT, ROLLBACK, SAVEPOINT", "트랜잭션"]], hl: [0] } }
  ],
  ox: [
    "옳은 분류예요. 모두 객체의 정의나 저장 구조를 만들고, 바꾸고, 없애는 명령이에요. TRUNCATE도 저장 구조를 초기화하니 여기 들어가요.",
    "잘못된 분류라 정답이에요. 이렇게 생각하면 틀려요: '데이터를 지우니까 DELETE와 같은 DML이다.' TRUNCATE는 저장 공간을 통째로 초기화하는 DDL이에요.",
    "옳은 분류예요. GRANT(권한 주기)와 REVOKE(권한 회수)는 DCL이에요.",
    "옳은 분류예요. COMMIT, ROLLBACK, SAVEPOINT는 트랜잭션을 확정하고 취소하는 TCL이에요."
  ],
  trap: "'데이터를 지운다 → DML'이라는 직관을 노리는 문제예요. TRUNCATE는 DDL이에요.",
  memo: "TRUNCATE는 DDL (자동 COMMIT, ROLLBACK 불가)"
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
  sum: "EMP의 DEPTNO에 넣는 값은 DEPT에 실제로 있어야 해요. 30번 부서는 DEPT에 없으니 ③이 오류예요. NULL은 '아직 부서 없음'이라 통과해요.",
  why: "FK(외래키)는 '자식이 가리키는 값은 부모 테이블에 실제로 있어야 한다'는 규칙이에요. 그래서 없는 부모를 가리키는 행을 넣으려 하면 오류가 나요.\n\n그런데 NULL은 '아직 가리키는 곳이 없음'이라는 뜻이에요. 없는 부모를 가리키는 게 아니라 아무것도 안 가리키는 거라서, 규칙을 어긴 게 아니에요.\n\n**그래서 NOT NULL을 따로 걸지 않으면 FK 컬럼에 NULL은 들어갈 수 있어요.** 부모 행을 지울 때는 그 행을 가리키는 자식이 있을 때만 막혀요.\n\n문장마다 볼게요. ①은 10번 부서가 DEPT에 있으니 성공해요. ②는 NULL이라 검사할 게 없어서 성공해요.\n\n③은 30번 부서가 DEPT에 없어서 ORA-02291(부모 키 없음) 오류가 나요. ④는 20번 부서를 가리키는 EMP 행이 없으니 지워져요.\n\n그래서 오류가 나는 것은 ③이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "INSERT INTO EMP VALUES (1, 10);     -- ① DEPT에 10이 있어요 → 성공\nINSERT INTO EMP VALUES (2, NULL);   -- ② 가리키는 곳이 없어요 → 검사 안 함 → 성공\nINSERT INTO EMP VALUES (3, 30);     -- ③ DEPT에 30이 없어요 → ORA-02291 오류\nDELETE FROM DEPT WHERE DEPTNO = 20; -- ④ 20을 가리키는 EMP 행이 없어요 → 성공" },
    { t: "문장별 판정", tb: { c: ["문장", "확인할 것", "결과"], r: [["①", "DEPT에 10이 있나?", "있음 → 성공"], ["②", "FK 값이 NULL", "검사 안 함 → 성공"], ["③", "DEPT에 30이 있나?", "없음 → ORA-02291"], ["④", "EMP에 20을 가리키는 행이 있나?", "없음 → 삭제 성공"]], hl: [2] } },
    { t: "비교: 부모 삭제가 막히는 경우", n: "DELETE FROM DEPT WHERE DEPTNO = 10;  -- EMP 100번이 10을 가리켜요 → ORA-02292(자식 행 있음) 오류" },
    { t: "FK에 NULL도 막고 싶다면", n: "CREATE TABLE EMP (\n  EMPNO  NUMBER PRIMARY KEY,\n  DEPTNO NUMBER NOT NULL REFERENCES DEPT (DEPTNO)  -- NOT NULL을 함께 걸어야 ②도 오류가 나요\n);" }
  ],
  ox: [
    "성공하는 문장이에요. 10번 부서가 DEPT에 있으니 규칙을 지켜요.",
    "성공하는 문장이에요. 이렇게 생각하면 틀려요: 'FK 컬럼에는 NULL을 못 넣는다.' NULL은 아무것도 안 가리키는 거라 통과해요. 막으려면 NOT NULL을 따로 걸어야 해요.",
    "오류가 나서 정답이에요. DEPT에 30번 부서가 없어서, 없는 부모를 가리키게 돼요(ORA-02291).",
    "성공하는 문장이에요. 이렇게 생각하면 틀려요: '부모 테이블 행은 못 지운다.' 지울 행을 가리키는 자식이 있을 때만 막혀요. 20번은 아무도 안 가리켜요. 10번을 지우려 했다면 ORA-02292 오류가 나요."
  ],
  trap: "'FK에는 NULL을 넣을 수 없다'고 착각하기 쉬워요. NULL을 막으려면 NOT NULL을 따로 걸어야 해요.",
  memo: "FK = 값이 있으면 부모에 있어야 함, NULL은 통과"
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
  sum: "SET NULL은 부모가 지워져도 자식 행을 남기고 PID만 비워요. 그래서 행은 3개 그대로고, PID에 값이 있는 행은 1개(CID 12)뿐이에요.",
  why: "FK에 붙이는 ON DELETE 옵션은 '부모 행이 지워질 때 그 부모를 가리키던 자식을 어떻게 할지'를 정해요. 옵션이 없으면 자식이 있을 때 부모 삭제를 거부해요.\n\nCASCADE는 자식도 함께 지워요. SET NULL은 자식 행은 남기고 가리키던 값(FK)만 NULL로 비워요.\n\nSET NULL이 이렇게 하는 이유는, 부모가 없어진 뒤에도 자식이 '없는 부모'를 가리키면 안 되기 때문이에요. 값을 비우면 '가리키는 곳 없음'이 되어 규칙이 지켜져요.\n\n이 데이터로 볼게요. PARENT 1을 지우면 1을 가리키던 CID 10, 11의 PID가 NULL이 돼요.\n\nCID 12는 2를 가리키니 그대로예요. CHILD는 여전히 3행이에요.\n\n**COUNT(*)는 행 수를 세니 3이고, COUNT(PID)는 값이 있는 칸만 세니 1이에요.**",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "DELETE FROM PARENT WHERE ID = 1;  -- ① 부모 1을 지워요 → SET NULL 발동: CID 10, 11의 PID가 NULL로\n\nSELECT COUNT(*),                  -- ③ 행 수를 세요: 3 (PID가 빈 행도 행이에요)\n       COUNT(PID)                 --    PID에 값이 있는 행만 세요: 1 (CID 12)\n  FROM CHILD;                     -- ② 삭제 후 CHILD 3행을 읽어요" },
    { t: "삭제 후 CHILD", tb: { c: ["CID", "PID"], r: [[10, null], [11, null], [12, 2]], hl: [0, 1] } },
    { t: "옵션별 비교", tb: { c: ["옵션", "자식 행", "COUNT(*), COUNT(PID)"], r: [["SET NULL", "남고 PID만 NULL", "3, 1"], ["CASCADE", "함께 삭제", "1, 1"], ["지정 없음(기본)", "삭제 거부(ORA-02292)", "3, 3"]], hl: [0] } }
  ],
  pgSetup: "ALTER TABLE PARENT ADD PRIMARY KEY (ID); ALTER TABLE CHILD ADD FOREIGN KEY (PID) REFERENCES PARENT (ID) ON DELETE SET NULL;",
  res: { c: ["COUNT(*)", "COUNT(PID)"], r: [[3, 1]] },
  pg: "DELETE FROM PARENT WHERE ID = 1; SELECT COUNT(*), COUNT(PID) FROM CHILD",
  ox: [
    "정답이에요. SET NULL은 자식 행을 지우지 않으니 COUNT(*)는 3이에요. PID가 빈 두 행은 COUNT(PID)에서 빠져서 1이에요.",
    "이렇게 생각하면 틀려요: '부모를 지우면 자식도 지워진다.' 그건 CASCADE예요. CASCADE였다면 CID 10, 11이 지워져 1행만 남아요.",
    "이렇게 생각하면 틀려요: 'NULL로 바뀐 PID도 COUNT(PID)가 센다.' COUNT(컬럼)은 빈 칸(NULL)을 세지 않아요. 옵션이 없어서 삭제가 거부됐을 때의 상태이기도 해요.",
    "이렇게 생각하면 틀려요: 자식이 지워지면서 남은 행의 PID도 비었다고 두 옵션을 섞은 거예요. 남은 CID 12의 PID 2는 이번 삭제와 상관이 없어요."
  ],
  trap: "COUNT(*)와 COUNT(PID)를 함께 물어서 SET NULL과 CASCADE를 구분하는지 확인해요.",
  memo: "SET NULL = 자식 남기고 값만 비움, CASCADE = 자식도 지움"
},
{
  id: "S52", s: 2, tp: "ddl", lv: 3,
  th: "2과목 | WITH GRANT OPTION과 REVOKE의 연쇄 회수",
  q: "Oracle에서 다음 명령을 차례로 실행한 뒤, 테이블 T(소유자 A)를 SELECT할 수 있는 사용자는? (소유자 A는 제외한다.)",
  sql: "-- A 계정\nGRANT SELECT ON T TO B WITH GRANT OPTION;\n-- B 계정\nGRANT SELECT ON A.T TO C;\n-- A 계정\nREVOKE SELECT ON T FROM B;",
  o: ["B, C", "C", "없음", "B"],
  a: 2,
  sum: "B가 받은 권한에서 C의 권한이 나왔어요. A가 B의 권한을 거둬 가면 C의 권한도 함께 사라져서, T를 볼 수 있는 사람은 아무도 남지 않아요.",
  why: "WITH GRANT OPTION으로 권한을 받은 사람(B)은 그 권한을 다른 사람(C)에게 다시 나눠 줄 수 있어요. Oracle은 '누가 누구에게 줬는지'를 기록해 둬요.\n\n그래서 A가 B의 권한을 거둬 가면, B가 그 권한으로 남에게 준 것까지 따라가서 함께 거둬요. 이걸 연쇄 회수라고 해요. 이렇게 하는 이유는 출처(A → B)가 사라졌는데 나눠 준 권한(B → C)만 남으면, 주인 A가 막을 수 없는 뒷문이 생기기 때문이에요.\n\n순서대로 볼게요. A가 B에게 권한을 주고, B가 C에게 나눠 줘요.\n\n그다음 A가 B의 권한을 거둬요. **이때 B가 C에게 준 권한도 함께 사라져요.**\n\n그래서 주인 A 말고는 T를 조회할 수 있는 사람이 없어요. 참고로 CREATE TABLE 같은 시스템 권한을 WITH ADMIN OPTION으로 준 경우는 연쇄 회수가 일어나지 않아요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- A 계정 (T의 주인)\nGRANT SELECT ON T TO B WITH GRANT OPTION;  -- ① B: 조회 가능 + 남에게 나눠 줄 수 있음\n-- B 계정\nGRANT SELECT ON A.T TO C;                  -- ② C: 조회 가능 (준 사람 = B로 기록돼요)\n-- A 계정\nREVOKE SELECT ON T FROM B;                 -- ③ B의 권한 회수 → B가 준 ②도 함께 회수\n-- 결과: B, C 모두 조회 불가" },
    { t: "권한 흐름", tb: { c: ["단계", "B", "C"], r: [["A → B (WITH GRANT OPTION)", "O", "X"], ["B → C", "O", "O"], ["A가 B에게서 REVOKE", "X", "X (연쇄 회수)"]], hl: [2] } },
    { t: "비교: 시스템 권한(ADMIN OPTION)은 연쇄 회수가 없어요", n: "GRANT CREATE TABLE TO B WITH ADMIN OPTION;  -- A가 B에게\nGRANT CREATE TABLE TO C;                    -- B가 C에게\nREVOKE CREATE TABLE FROM B;                 -- B만 잃어요. C의 권한은 그대로 남아요" }
  ],
  ox: [
    "이렇게 생각하면 틀려요: 'REVOKE가 아무에게도 영향을 주지 않는다.' A가 B의 권한을 거뒀으니 B는 못 보고, B가 나눠 준 C의 권한도 함께 사라져요.",
    "이렇게 생각하면 틀려요: '회수는 B에게서 멈춘다.' 그건 시스템 권한을 WITH ADMIN OPTION으로 줬을 때예요. 객체 권한의 WITH GRANT OPTION은 C까지 함께 거둬요.",
    "정답이에요. A → B → C로 이어진 권한은 B를 회수하는 순간 C까지 함께 사라져요.",
    "이렇게 생각하면 틀려요: 회수 대상을 거꾸로 본 거예요. REVOKE … FROM B가 직접 거두는 대상은 B예요. B도 권한을 잃어요."
  ],
  trap: "GRANT OPTION(객체 권한)은 줄줄이 회수, ADMIN OPTION(시스템 권한)은 회수가 이어지지 않아요. 이름이 비슷해서 반대로 외우기 쉬워요.",
  memo: "객체 권한 GRANT OPTION → 줄줄이 회수 / 시스템 권한 ADMIN OPTION → 안 이어짐"
},
{
  id: "S53", s: 2, tp: "fn", lv: 2,
  th: "2과목 | 문자 함수 SUBSTR · INSTR · TRIM · LPAD",
  q: "다음 SQL의 결과로 옳은 것은?",
  sql: "SELECT SUBSTR('DATABASE', 3, 4)       AS C1,\n       INSTR('DATABASE', 'A', 1, 3)   AS C2,\n       LENGTH(TRIM('  SQL  '))        AS C3,\n       LPAD('7', 3, '0')               AS C4\n  FROM DUAL;",
  o: ["TABA, 6, 3, 007", "TABA, 4, 3, 007", "ATAB, 6, 7, 700", "TABA, 6, 7, 007"],
  a: 0,
  sum: "글자 위치는 1부터 세요. 3번째부터 4글자는 TABA, 세 번째 A는 6번째, 공백을 지운 SQL은 3글자, 7 앞에 0을 채우면 007이에요.",
  why: "SQL의 문자 함수는 글자 위치를 0이 아니라 1부터 세요. 그래서 문자열 밑에 1, 2, 3… 번호를 직접 적어 보면 실수가 확 줄어요.\n\nSUBSTR(문자, 시작, 길이)는 시작 위치부터 길이만큼 잘라요. INSTR(문자, 찾을 글자, 시작, n)은 시작 위치부터 오른쪽으로 훑으며 n번째로 나오는 위치를 알려 줘요.\n\nTRIM은 양 끝의 공백만 지워요. LPAD(문자, 전체 길이, 채울 글자)는 전체 길이가 될 때까지 왼쪽을 채워요.\n\n'DATABASE'에 번호를 붙이면 D1 A2 T3 A4 B5 A6 S7 E8이에요. 3번째부터 4글자는 T, A, B, A라서 TABA예요. A는 2, 4, 6번째에 있으니 세 번째 A는 6이에요.\n\n'  SQL  '은 TRIM으로 양쪽 공백이 지워져 'SQL'이 되니 길이 3이에요. '7'을 길이 3이 되게 왼쪽에 0을 채우면 '007'이에요.\n\n**위치표를 그려서 1부터 번호를 매기면 SUBSTR과 INSTR 문제는 바로 풀려요.** 답은 TABA, 6, 3, 007이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT SUBSTR('DATABASE', 3, 4)     AS C1, -- ② 3번째 T부터 4글자 → 'TABA'\n       INSTR('DATABASE', 'A', 1, 3) AS C2, --    1번째부터 훑어 세 번째 A의 위치 → 6\n       LENGTH(TRIM('  SQL  '))      AS C3, --    안쪽 TRIM 먼저: 'SQL' → 길이 3\n       LPAD('7', 3, '0')            AS C4  --    길이 3이 되게 왼쪽에 '0' → '007'\n  FROM DUAL;                               -- ① 한 줄짜리 연습용 테이블" },
    { t: "'DATABASE' 위치표", tb: { c: ["1", "2", "3", "4", "5", "6", "7", "8"], r: [["D", "A", "T", "A", "B", "A", "S", "E"]] }, n: "3번째부터 4글자 = TABA / 'A'는 2, 4, 6번째 위치 → 세 번째 A는 6" },
    { t: "결과", tb: { c: ["식", "결과"], r: [["SUBSTR('DATABASE', 3, 4)", "TABA"], ["INSTR('DATABASE', 'A', 1, 3)", 6], ["LENGTH(TRIM('  SQL  '))", 3], ["LPAD('7', 3, '0')", "007"]] } },
    { t: "헷갈리기 쉬운 짝", tb: { c: ["식", "결과", "차이"], r: [["SUBSTR('DATABASE', 2, 4)", "ATAB", "시작을 한 칸 앞으로 잡으면"], ["LENGTH('  SQL  ')", 7, "TRIM 없이 공백까지 세면"], ["RPAD('7', 3, '0')", "700", "오른쪽을 채우면"]] } }
  ],
  res: { c: ["C1", "C2", "C3", "C4"], r: [["TABA", 6, 3, "007"]] },
  pg: "SELECT SUBSTR('DATABASE', 3, 4), REGEXP_INSTR('DATABASE', 'A', 1, 3), LENGTH(TRIM('  SQL  ')), LPAD('7', 3, '0')",
  ox: [
    "정답이에요. TABA, 6, 3, 007이에요.",
    "이렇게 생각하면 틀려요: 'A를 두 번째까지만 센다.' INSTR의 마지막 인자 3은 '세 번째로 나오는 A'예요. A는 2, 4, 6번째에 있으니 6이에요.",
    "이렇게 생각하면 틀려요: 시작 위치를 한 칸 앞(2번째)으로 잡아 자르고(ATAB), 공백까지 길이를 세고(7), 오른쪽을 채운(700) 경우예요. 3번째 글자는 T이고, LPAD는 왼쪽을 채워요.",
    "이렇게 생각하면 틀려요: '공백 포함 7글자.' 함수는 안쪽부터 계산해요. TRIM이 먼저 공백을 지운 뒤에 LENGTH가 길이를 재요."
  ],
  trap: "SQL의 문자열 위치는 0이 아니라 1부터 세요.",
  memo: "SUBSTR(문자, 시작, 길이) / INSTR(문자, 찾기, 시작, 몇 번째)"
},
{
  id: "S54", s: 2, tp: "fn", lv: 2,
  th: "2과목 | 숫자 함수 ROUND · CEIL · FLOOR와 음수",
  q: "다음 숫자 함수의 결과로 옳지 않은 것은?",
  o: ["ROUND(-15.75, 1) = -15.8", "CEIL(-15.75) = -15", "FLOOR(-15.75) = -15", "ROUND(1234.5, -2) = 1200"],
  a: 2,
  sum: "FLOOR는 수직선에서 왼쪽(더 작은 쪽)의 정수로 가요. -15.75의 왼쪽 정수는 -16이라서 'FLOOR(-15.75) = -15'는 틀렸어요.",
  why: "CEIL과 FLOOR는 '올림·버림'으로 외우면 음수에서 틀려요. 수직선의 방향으로 기억해야 해요.\n\nCEIL(n)은 n보다 크거나 같은 정수 중 가장 작은 것, 즉 오른쪽으로 가요. FLOOR(n)은 n보다 작거나 같은 정수 중 가장 큰 것, 즉 왼쪽으로 가요.\n\n'크기'로 정했기 때문에 음수에서는 소수점을 그냥 버리는 것과 방향이 달라져요. 수직선에서 -15.75는 -16과 -15 사이에 있어요. 왼쪽은 -16, 오른쪽은 -15예요.\n\n**그래서 FLOOR(-15.75)는 -16이고, -15라고 한 ③이 틀렸어요.** CEIL(-15.75)는 오른쪽인 -15가 맞아요.\n\nROUND(-15.75, 1)은 소수 첫째 자리까지 남기려고 둘째 자리 5에서 반올림해요. 숫자 크기가 커지는 쪽으로 가서 -15.8이에요.\n\nROUND(1234.5, -2)의 -2는 '백의 자리까지 남겨라'라는 뜻이에요. 십의 자리 3에서 반올림하니 1200이에요.\n\n참고로 소수점 아래를 그냥 잘라 0 쪽으로 가는 함수는 TRUNC예요. TRUNC(-15.75)는 -15예요.",
  st: [
    { t: "SQL로 확인하기", n: "SELECT ROUND(-15.75, 1),   -- 소수 둘째 자리 5에서 반올림 → -15.8\n       CEIL(-15.75),        -- 오른쪽(큰 쪽) 정수 → -15\n       FLOOR(-15.75),       -- 왼쪽(작은 쪽) 정수 → -16\n       ROUND(1234.5, -2),   -- 십의 자리 3에서 반올림 → 1200\n       TRUNC(-15.75)        -- 0 쪽으로 소수 버림 → -15 (FLOOR와 달라요)\n  FROM DUAL;" },
    { t: "수직선으로 보기", n: "  -16 ──── -15.75 ──── -15\n  FLOOR ←       → CEIL" },
    { t: "결과", tb: { c: ["식", "결과"], r: [["ROUND(-15.75, 1)", -15.8], ["CEIL(-15.75)", -15], ["FLOOR(-15.75)", -16], ["ROUND(1234.5, -2)", 1200]], hl: [2] } }
  ],
  res: { c: ["R1", "C", "F", "R2"], r: [[-15.8, -15, -16, 1200]] },
  pg: "SELECT ROUND(-15.75, 1), CEIL(-15.75), FLOOR(-15.75), ROUND(1234.5, -2)",
  ox: [
    "옳은 결과예요. 소수 둘째 자리 5에서 반올림하면 크기가 커지는 쪽으로 가서 -15.8이에요.",
    "옳은 결과예요. -15.75보다 크거나 같은 정수는 -15, -14…이고 그중 가장 작은 게 -15예요.",
    "틀린 결과라 정답이에요. 이렇게 생각하면 틀려요: '소수점을 버리면 -15.' 그건 TRUNC예요. FLOOR는 수직선 왼쪽으로 가서 -16이에요.",
    "옳은 결과예요. -2는 백의 자리까지 남긴다는 뜻이라, 십의 자리 3에서 반올림해 1200이 돼요. 끝의 .5는 상관없어요."
  ],
  trap: "양수에서 'CEIL = 올림, FLOOR = 버림'으로 외우면 음수에서 틀려요. 0 쪽으로 버리는 건 TRUNC예요. TRUNC(-15.75) = -15.",
  memo: "CEIL → 오른쪽, FLOOR → 왼쪽, TRUNC → 0 쪽"
},
{
  id: "S55", s: 2, tp: "nullfn", lv: 3,
  th: "2과목 | DECODE와 CASE의 NULL 비교 차이",
  q: "다음 SQL의 결과로 옳은 것은? (Oracle 기준)",
  sql: "SELECT DECODE(NULL, NULL, 'Y', 'N')            AS D,\n       CASE NULL WHEN NULL THEN 'Y' ELSE 'N' END AS C\n  FROM DUAL;",
  o: ["Y, N", "Y, Y", "N, N", "N, Y"],
  a: 0,
  sum: "DECODE는 NULL과 NULL을 '같다'고 봐서 Y가 나와요. CASE는 = 로 비교하는데, NULL끼리 비교하면 결과가 '모름'이라 통과하지 못하고 N이 나와요.",
  why: "단순 CASE(CASE 값 WHEN 값 …)는 속으로 '값 = 값'을 비교해요. 그런데 NULL은 '모르는 값'이에요. 모르는 값끼리 같은지 물으면 DB는 참도 거짓도 아닌 UNKNOWN(모름)이라고 답해요.\n\nWHEN은 답이 '참'일 때만 통과해요. '모름'은 참이 아니니 통과하지 못하고 ELSE로 가서 'N'이 돼요.\n\n반면 DECODE는 Oracle 전용 함수예요. Oracle은 DECODE에서만큼은 'NULL과 NULL은 같다'고 따로 정해 뒀어요. 그래서 첫 번째 짝(NULL → 'Y')에 바로 걸려 'Y'가 나와요.\n\n**CASE는 = 비교 규칙을 따라서 NULL끼리 '모름'이 되고, DECODE는 자기 규칙으로 NULL끼리 같다고 봐요.** 그래서 답은 Y, N이에요. CASE로 NULL을 알아내려면 = 대신 IS NULL을 써야 해요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT DECODE(NULL, NULL, 'Y', 'N')  AS D, -- ② DECODE 규칙: NULL과 NULL은 같아요 → 'Y'\n       CASE NULL WHEN NULL THEN 'Y'        --    NULL = NULL → '모름' → 통과 못 해요\n                 ELSE 'N' END        AS C  --    ELSE로 가요 → 'N'\n  FROM DUAL;                               -- ① 한 줄짜리 연습용 테이블" },
    { t: "비교 방식", tb: { c: ["함수", "비교", "결과"], r: [["DECODE(NULL, NULL, …)", "NULL과 NULL을 같다고 봐요", "Y"], ["CASE NULL WHEN NULL", "NULL = NULL → 모름", "N"]] } },
    { t: "의도대로 쓰려면: IS NULL을 쓰는 CASE", n: "SELECT CASE WHEN NULL IS NULL THEN 'Y'   -- IS NULL은 '모름' 없이 참/거짓으로만 답해요\n            ELSE 'N' END AS C\n  FROM DUAL;   -- 결과: 'Y' (실제로는 NULL 자리에 컬럼 이름을 써요)" }
  ],
  ox: [
    "정답이에요. DECODE는 NULL끼리 같다고 봐서 Y, CASE는 NULL끼리 비교하면 '모름'이라 ELSE의 N이에요.",
    "이렇게 생각하면 틀려요: 'CASE도 NULL끼리 같다고 본다.' CASE는 = 로 비교해요. NULL끼리 = 비교는 '모름'이라 WHEN을 통과하지 못해요.",
    "이렇게 생각하면 틀려요: 'DECODE도 = 비교처럼 동작한다.' Oracle은 DECODE에서만 NULL끼리 같다고 따로 정해 뒀어요.",
    "이렇게 생각하면 틀려요: 두 함수의 규칙을 서로 바꿔 본 거예요. NULL끼리 같다고 보는 쪽은 DECODE예요."
  ],
  trap: "DECODE의 NULL 처리는 GROUP BY처럼 'NULL끼리 한데 묶는' 쪽에 가까워요. CASE는 = 비교라서 NULL끼리 '모름'이에요.",
  memo: "DECODE: NULL = NULL 인정 / CASE: IS NULL로만 알아내요"
},
{
  id: "S56", s: 2, tp: "basic", lv: 2,
  th: "2과목 | LIKE 와일드카드와 ESCAPE",
  q: "다음 (가), (나) SQL의 결과 건수로 옳은 것은? (문자열 비교는 대소문자를 구분한다.)",
  tb: [{ n: "T", c: ["TXT"], r: [["A_C"], ["ABC"], ["A%C"], ["AXXC"], ["a_c"]] }],
  sql: "(가) SELECT COUNT(*) FROM T WHERE TXT LIKE 'A\\_C' ESCAPE '\\';\n(나) SELECT COUNT(*) FROM T WHERE TXT LIKE 'A_C';",
  o: ["(가) 1, (나) 3", "(가) 1, (나) 4", "(가) 3, (나) 3", "(가) 2, (나) 4"],
  a: 0,
  sum: "패턴 속 _는 '아무 글자 하나'예요. 그래서 (나)는 A와 C 사이에 한 글자가 있는 3건이 나오고, ESCAPE로 _를 진짜 밑줄로 바꾼 (가)는 A_C 1건만 나와요.",
  why: "LIKE 패턴에서 _는 '아무 글자 정확히 하나', %는 '아무 글자 0개 이상'을 뜻하는 특수 기호예요. 이런 기호를 와일드카드라고 불러요.\n\n그러면 밑줄 문자 자체를 찾고 싶을 땐 어떻게 할까요? ESCAPE로 정한 글자(여기선 \\)를 기호 앞에 붙이면, 그 기호는 특수 기능을 잃고 그냥 글자로 비교돼요.\n\n(가)는 \\_ 이니 'A + 밑줄 + C'만 찾아요. 그래서 A_C 1건이에요. (나)의 _는 '아무 한 글자'예요.\n\nA_C, ABC, A%C는 모두 A와 C 사이에 한 글자가 있어서 통과해요. AXXC는 사이에 두 글자라 빠지고, a_c는 소문자라 빠져요. 그래서 3건이에요.\n\n**특수 기호로 동작하는 건 패턴 쪽 기호뿐이에요. 데이터 안의 %나 _는 그냥 글자 하나예요.**",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "-- (가)\nSELECT COUNT(*)            -- ③ 남은 행 수를 세요 → 1\n  FROM T                   -- ① 원본 5행\n WHERE TXT LIKE 'A\\_C'    -- ② \\_ 는 진짜 밑줄 글자: 'A' + '_' + 'C'만 통과\n ESCAPE '\\';               --    \\ 를 '다음 기호는 그냥 글자'라는 표시로 정해요\n-- (나)\nSELECT COUNT(*)            -- ③ → 3\n  FROM T                   -- ① 원본 5행\n WHERE TXT LIKE 'A_C';     -- ② _ 는 아무 글자 하나: 'A' + 한 글자 + 'C'" },
    { t: "행별 판정", tb: { c: ["TXT", "(가) 'A' + 밑줄 문자 + 'C'", "(나) 'A' + 아무 한 글자 + 'C'"], r: [["A_C", "O", "O"], ["ABC", "X", "O"], ["A%C", "X", "O"], ["AXXC", "X", "X (가운데 2글자)"], ["a_c", "X (소문자)", "X (소문자)"]] } }
  ],
  res: { c: ["가", "나"], r: [[1, 3]] },
  pg: "SELECT (SELECT COUNT(*) FROM T WHERE TXT LIKE 'A\\_C' ESCAPE '\\'), (SELECT COUNT(*) FROM T WHERE TXT LIKE 'A_C')",
  ox: [
    "정답이에요. (가)는 진짜 밑줄이 든 A_C 1건, (나)는 A와 C 사이에 한 글자가 있는 A_C, ABC, A%C 3건이에요.",
    "이렇게 생각하면 틀려요: '_는 여러 글자도 된다.' 그건 %예요. _는 정확히 한 글자라 AXXC는 빠져요.",
    "이렇게 생각하면 틀려요: 'ESCAPE가 있어도 \\_는 아무 한 글자다.' ESCAPE 표시가 붙은 _는 밑줄 글자 자체만 찾아요.",
    "이렇게 생각하면 틀려요: '대소문자는 상관없다.' 그러면 소문자 a_c도 들어가서 (가) 2건, (나) 4건이 돼요. 문제 조건대로 대소문자를 구분하니 a_c는 (가)·(나) 어디에도 안 들어가요."
  ],
  trap: "'A%C'의 %는 데이터 속 글자일 뿐이에요. 패턴 쪽에 있는 기호만 특수 기능을 해요.",
  memo: "_ = 한 글자, % = 0글자 이상, ESCAPE = 기호를 그냥 글자로"
},
{
  id: "S57", s: 2, tp: "basic", lv: 2,
  th: "2과목 | 논리 연산자 우선순위 (NOT > AND > OR)",
  q: "다음 SQL의 결과 건수는?",
  tb: [{ n: "PLAYER", c: ["NAME", "TEAM", "POS", "HEIGHT"], r: [["P1", "K01", "GK", 190], ["P2", "K01", "MF", 175], ["P3", "K02", "GK", 185], ["P4", "K02", "DF", 170], ["P5", "K03", "GK", 180]] }],
  sql: "SELECT COUNT(*)\n  FROM PLAYER\n WHERE TEAM = 'K01'\n    OR TEAM = 'K02'\n   AND POS = 'GK'\n   AND HEIGHT >= 185;",
  o: ["1", "2", "3", "4"],
  a: 2,
  sum: "AND가 OR보다 먼저 묶여요. 그래서 'K01 팀 전원' 또는 'K02이면서 GK이고 185 이상'인 선수를 세게 되어 P1, P2, P3 세 명이에요.",
  why: "WHERE 절의 조건은 NOT → AND → OR 순서로 묶여요. 수학에서 곱하기(AND)를 더하기(OR)보다 먼저 하는 것과 같아요. 괄호가 없으면 DB는 줄바꿈이나 들여쓰기는 무시하고 이 순서대로 묶어요.\n\n그래서 이 조건은 실제로 'TEAM = K01' OR '(TEAM = K02 AND POS = GK AND HEIGHT >= 185)'예요. **K01 팀은 OR 왼쪽만으로 통과하니, 포지션과 키를 전혀 따지지 않아요.**\n\n한 명씩 볼게요. P1, P2는 K01이라 통과해요.\n\nP3은 K02, GK, 185라서 오른쪽 묶음을 만족해 통과해요. P4는 K02지만 DF라 빠지고, P5는 K03이라 빠져요.\n\n그래서 3건이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT COUNT(*)           -- ③ 통과한 행 수 → 3\n  FROM PLAYER             -- ① 원본 5행\n WHERE TEAM = 'K01'       -- ② 실제로 묶이는 모양:   TEAM = 'K01'\n    OR TEAM = 'K02'       --    OR (  TEAM = 'K02'\n   AND POS = 'GK'         --          AND POS = 'GK'\n   AND HEIGHT >= 185;     --          AND HEIGHT >= 185 )  ← AND가 먼저 묶여요" },
    { t: "한 명씩 판정", tb: { c: ["NAME", "TEAM='K01'", "K02 AND GK AND ≥185", "결과"], r: [["P1", "T", "F", "O"], ["P2", "T", "F", "O"], ["P3", "F", "T", "O"], ["P4", "F", "F", "X"], ["P5", "F", "F", "X"]] } },
    { t: "의도대로 쓰려면: 괄호로 OR를 먼저 묶어요", n: "SELECT COUNT(*)\n  FROM PLAYER\n WHERE (TEAM = 'K01' OR TEAM = 'K02')   -- TEAM IN ('K01', 'K02')와 같아요\n   AND POS = 'GK'\n   AND HEIGHT >= 185;                    -- P1(190), P3(185) → 2" }
  ],
  res: { c: ["COUNT"], r: [[3]] },
  pg: "SELECT COUNT(*) FROM PLAYER WHERE TEAM = 'K01' OR TEAM = 'K02' AND POS = 'GK' AND HEIGHT >= 185",
  ox: [
    "이렇게 생각하면 틀려요: 'K02 묶음(P3)만 센다.' OR 왼쪽의 TEAM = 'K01'은 혼자서도 통과 조건이라 K01 선수 2명도 들어와요.",
    "이렇게 생각하면 틀려요: '위에서부터 읽은 대로 OR가 먼저 묶인다.' 그건 괄호를 쳤을 때의 결과(P1, P3)예요. 괄호가 없으면 AND가 먼저예요.",
    "정답이에요. AND가 먼저 묶여서 K01 전원(P1, P2)과 조건을 다 갖춘 K02의 P3이 통과해요.",
    "이렇게 생각하면 틀려요: 'K01이나 K02면 다 통과.' AND 조건은 K02 쪽에 붙어 있어서 P4(DF, 170)는 빠져요."
  ],
  trap: "문장을 읽는 순서대로 왼쪽부터 계산하면 틀려요. 괄호 없는 OR는 항상 의심하세요.",
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
  sum: "Oracle은 정렬할 때 NULL을 가장 큰 값처럼 다뤄요. 그래서 큰 값부터 보여 주는 DESC에서는 BONUS가 빈 B가 맨 앞에 와요.",
  why: "ORDER BY는 값의 크기로 줄을 세워요. 그런데 NULL은 '값이 없음'이라 크기를 비교할 수 없어요. 그래서 DBMS가 NULL을 어디에 둘지 미리 정해 둬요.\n\nOracle은 NULL을 '가장 큰 값'처럼 다루기로 정했어요. 그래서 작은 값부터(ASC)면 맨 뒤, 큰 값부터(DESC)면 맨 앞에 와요. SQL Server는 반대로 NULL을 가장 작은 값처럼 다뤄요.\n\n이 문제는 Oracle의 DESC예요. **BONUS가 빈 B가 300인 C보다도 앞에 와요.** 그 뒤로 300(C), 200(D), 100(A) 순서예요.\n\n그래서 답은 B, C, D, A예요. NULL 위치를 직접 정하고 싶으면 NULLS FIRST나 NULLS LAST를 붙여요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT NAME              -- ② 보여 줄 컬럼 NAME을 골라요\n  FROM T                 -- ① 원본 4행 (A 100, B NULL, C 300, D 200)\n ORDER BY BONUS DESC;    -- ③ 큰 값부터. Oracle은 NULL을 가장 큰 값처럼 봐서 B가 맨 앞" },
    { t: "정렬 결과", tb: { c: ["순서", "NAME", "BONUS"], r: [[1, "B", null], [2, "C", 300], [3, "D", 200], [4, "A", 100]], hl: [0] } },
    { t: "NULL을 맨 뒤로 보내려면", n: "SELECT NAME\n  FROM T\n ORDER BY BONUS DESC NULLS LAST;   -- C, D, A, B" }
  ],
  res: { c: ["NAME"], r: [["B"], ["C"], ["D"], ["A"]] },
  pg: "SELECT NAME FROM T ORDER BY BONUS DESC",
  ox: [
    "정답이에요. Oracle은 NULL을 가장 큰 값처럼 보니 DESC에서 B가 맨 앞이고, 그다음 300, 200, 100 순서예요.",
    "이렇게 생각하면 틀려요: 'NULL은 가장 작은 값이다.' 그건 SQL Server 방식이에요. Oracle에서 이 순서를 원하면 NULLS LAST를 붙여야 해요.",
    "이렇게 생각하면 틀려요: DESC를 못 보고 작은 값부터 정렬한 거예요. 오름차순이라면 맞는 순서지만, 문제는 DESC예요.",
    "이렇게 생각하면 틀려요: 'NULL은 중간 어딘가에 온다.' NULL은 정렬에서 늘 맨 앞이나 맨 뒤에만 와요."
  ],
  trap: "DBMS마다 달라요. 문제에 'Oracle'인지 'SQL Server'인지 적힌 부분을 먼저 확인하세요.",
  memo: "Oracle: NULL = 가장 큰 값 (DESC면 맨 위)"
},
{
  id: "S59", s: 2, tp: "agg", lv: 2,
  th: "2과목 | 공집합에 대한 집계 함수",
  q: "다음 SQL의 결과로 옳은 것은?",
  tb: [{ n: "EMP", c: ["ENAME", "SAL"], r: [["A", 100], ["B", 200]] }],
  sql: "SELECT COUNT(*), SUM(SAL), MAX(SAL)\n  FROM EMP\n WHERE 1 = 2;",
  o: ["0, NULL, NULL", "0, 0, 0", "결과 행이 없다", "NULL, NULL, NULL"],
  a: 0,
  sum: "GROUP BY가 없으면 행이 하나도 안 남아도 결과 1줄이 나와요. 셀 게 없으니 COUNT는 0이고, 더하거나 비교할 값이 없으니 SUM과 MAX는 NULL이에요.",
  why: "GROUP BY가 없는 집계 쿼리는 남은 행 전체를 '한 묶음'으로 보고, 그 묶음마다 결과 1줄을 만들어요. 이 한 묶음은 행이 0개여도 있어요. **그래서 WHERE 1 = 2로 모든 행이 걸러져도 결과는 0줄이 아니라 1줄이에요.**\n\n그 1줄에서 COUNT(*)는 센 행이 없으니 0이에요. SUM, MAX, MIN, AVG는 계산할 값이 하나도 없어요.\n\n이때 0을 돌려주면 '진짜로 합이 0인 경우'와 구분이 안 돼요. 그래서 '값 없음'이라는 뜻으로 NULL을 돌려줘요.\n\n이 데이터로 볼게요. EMP 2행(A 100, B 200)을 읽어요.\n\nWHERE 1 = 2는 늘 거짓이라 두 행 다 빠져요. 빈 묶음 하나로 계산하니 0, NULL, NULL이에요.\n\nGROUP BY가 있다면 묶음 자체가 하나도 안 생겨서 결과가 0줄이 돼요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT COUNT(*),   -- ③ 빈 묶음 하나로 계산: 센 행이 없으니 0\n       SUM(SAL),   --    더할 값이 없으니 NULL\n       MAX(SAL)    --    비교할 값이 없으니 NULL\n  FROM EMP         -- ① 원본 2행 (A 100, B 200)\n WHERE 1 = 2;      -- ② 늘 거짓 → 0행 남아요 (GROUP BY가 없으니 전체가 묶음 1개)" },
    { t: "단계별 데이터", tb: { c: ["단계", "남은 행", "결과"], r: [["① FROM EMP", "A 100, B 200", "2행"], ["② WHERE 1 = 2", "(없음)", "0행"], ["③ 집계 (묶음 1개)", "—", "0, NULL, NULL — 1줄"]], hl: [2] } },
    { t: "비교: GROUP BY가 있을 때", n: "SELECT ENAME, COUNT(*) FROM EMP WHERE 1 = 2 GROUP BY ENAME;\n→ 만들어질 그룹 자체가 없으므로 0행" },
    { t: "합계를 0으로 받고 싶다면", n: "SELECT COUNT(*), NVL(SUM(SAL), 0), MAX(SAL)\n  FROM EMP\n WHERE 1 = 2;   -- 결과: 0, 0, NULL (NVL은 SUM 바깥에 씌워요)" }
  ],
  res: { c: ["COUNT(*)", "SUM(SAL)", "MAX(SAL)"], r: [[0, null, null]] },
  pg: "SELECT COUNT(*), SUM(SAL), MAX(SAL) FROM EMP WHERE 1 = 2",
  ox: [
    "정답이에요. GROUP BY가 없으면 빈 묶음 하나로 1줄이 나오고, COUNT(*)는 0, SUM과 MAX는 NULL이에요.",
    "이렇게 생각하면 틀려요: '합할 게 없으면 합은 0.' 값이 하나도 없으면 집계 함수는 NULL을 돌려줘요. 0을 원하면 NVL(SUM(SAL), 0)처럼 바깥에서 바꿔야 해요.",
    "이렇게 생각하면 틀려요: '행이 없으니 결과도 없다.' 그건 GROUP BY가 있을 때예요. GROUP BY가 없으면 전체가 한 묶음이라 1줄이 나와요.",
    "이렇게 생각하면 틀려요: 'COUNT도 NULL이다.' COUNT는 센 개수를 알려 주는 함수라 셀 게 없으면 0이에요."
  ],
  trap: "'결과가 0줄'과 '값이 NULL인 1줄'을 구분해야 해요.",
  memo: "빈 집합 집계: COUNT = 0, 나머지 = NULL (1줄)"
},
{
  id: "S60", s: 2, tp: "basic", lv: 1,
  th: "2과목 | 순수 관계 연산자와 일반 집합 연산자",
  q: "다음 중 순수 관계 연산자에 해당하지 않는 것은?",
  o: ["SELECT", "PROJECT", "JOIN", "UNION"],
  a: 3,
  sum: "SELECT·PROJECT·JOIN·DIVIDE는 관계형 DB를 위해 새로 만든 연산이에요. UNION은 수학의 합집합에서 가져온 일반 집합 연산이라 순수 관계 연산자가 아니에요.",
  why: "관계 대수의 연산자는 어디서 왔는지에 따라 두 무리로 나뉘어요. 일반 집합 연산자는 수학의 집합에서 그대로 가져왔어요. UNION(합집합), INTERSECTION(교집합), DIFFERENCE(차집합), PRODUCT(곱집합)이에요.\n\n순수 관계 연산자는 '행과 컬럼이 있는 표'라는 구조를 쓰려고 관계형 DB를 위해 새로 만들었어요. SELECT(행 고르기), PROJECT(컬럼 고르기), JOIN(표 잇기), DIVIDE(나누기)예요.\n\n차이는 이래요. 집합 연산은 두 결과를 통째로 합치거나 빼요. 순수 관계 연산은 컬럼 값과 조건을 들여다보며 필요한 행이나 컬럼을 골라내요.\n\n**UNION은 수학의 합집합에서 온 일반 집합 연산자라서 순수 관계 연산자가 아니에요.**",
  st: [
    { t: "관계 대수와 SQL 대응", tb: { c: ["구분", "연산자", "SQL 대응"], r: [["순수 관계", "SELECT", "WHERE 절 (행 선택)"], ["순수 관계", "PROJECT", "SELECT 절 (컬럼 선택)"], ["순수 관계", "JOIN", "JOIN"], ["순수 관계", "DIVIDE", "직접 대응 없음"], ["일반 집합", "UNION / INTERSECTION / DIFFERENCE", "UNION / INTERSECT / MINUS"], ["일반 집합", "PRODUCT", "CROSS JOIN"]] } },
    { t: "예시: SQL 한 문장 안의 관계 대수", n: "SELECT ENAME, DEPTNO          -- PROJECT: 컬럼 고르기\n  FROM EMP JOIN DEPT          -- JOIN: 두 표 잇기\n USING (DEPTNO)\n WHERE SAL >= 3000            -- SELECT(관계 대수): 행 고르기\nUNION                         -- UNION: 일반 집합 연산 (두 결과를 합쳐요)\nSELECT ENAME, DEPTNO\n  FROM EMP_HIST;" }
  ],
  ox: [
    "순수 관계 연산자예요. 관계 대수의 SELECT는 조건에 맞는 행을 고르는 연산이라 SQL의 WHERE 절에 해당해요. SQL의 SELECT 절과 이름만 같아요.",
    "순수 관계 연산자예요. 원하는 컬럼만 골라내는 연산이라 SQL의 SELECT 절(컬럼 목록)에 해당해요.",
    "순수 관계 연산자예요. 같은 값을 기준으로 두 표의 행을 이어 붙여요. 짝을 따지지 않고 모두 곱하는 PRODUCT와는 달라요.",
    "순수 관계 연산자가 아니라서 정답이에요. UNION은 수학의 합집합을 가져온 일반 집합 연산자예요."
  ],
  trap: "관계 대수의 SELECT는 행을 고르는 연산이라 SQL의 WHERE 절에 해당해요. 이름이 같은 SQL의 SELECT 절과 짝지으면 틀려요.",
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
  sum: "CASE는 위에서부터 조건을 보다가 처음 맞는 곳에서 바로 멈춰요. 350도 첫 줄(100 이상)에서 먼저 걸려서 A가 되고, B 줄은 아무도 못 가요.",
  why: "CASE는 WHEN 조건을 위에서부터 하나씩 확인해요. **처음으로 맞는 조건을 만나면 그 THEN 값을 돌려주고 바로 멈춰요.** 아래 줄은 더 보지 않아요.\n\n왜 이렇게 정했을까요? CASE는 한 행에 결과를 딱 하나만 정해야 해요. 350은 '100 이상'도 맞고 '300 이상'도 맞아요.\n\n끝까지 다 보면 A와 B 중 무엇을 줄지 정할 수 없어요. 그래서 '먼저 걸린 쪽이 이긴다'로 정했어요.\n\n한 행씩 볼게요. ID 1의 50은 첫 줄도, 둘째 줄도 안 맞아서 ELSE의 C예요. ID 2의 150은 첫 줄(100 이상)이 맞아서 A예요.\n\nID 3의 350도 첫 줄에서 먼저 맞아서 A예요. 둘째 줄은 확인조차 안 해요.\n\n이 SQL에서는 300 이상이면 언제나 100 이상이기도 해요. 그래서 B를 주는 둘째 줄은 어떤 값이 와도 실행되지 않아요. 답은 C, A, A예요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT ID,                            -- ② 행마다 ID와 GRADE를 만들어요\n       CASE WHEN SAL >= 100 THEN 'A'  --    첫 줄: 100 이상이면 A 주고 멈춤\n            WHEN SAL >= 300 THEN 'B'  --    둘째 줄: 첫 줄에서 안 걸린 행만 와요 (100 미만이라 여기도 안 맞음)\n            ELSE 'C'                  --    둘 다 아니면 C\n       END AS GRADE\n  FROM T;                             -- ① 원본 3행 (50, 150, 350)" },
    { t: "한 행씩 판정", tb: { c: ["ID", "SAL", "SAL >= 100", "SAL >= 300", "GRADE"], r: [[1, 50, "F", "F", "C (ELSE)"], [2, 150, "T", "—", "A"], [3, 350, "T", "확인 안 함", "A"]], hl: [2] } },
    { t: "의도대로 쓰려면: 좁은 조건을 위로", n: "SELECT ID,\n       CASE WHEN SAL >= 300 THEN 'B'\n            WHEN SAL >= 100 THEN 'A'\n            ELSE 'C'\n       END AS GRADE\n  FROM T;   -- 50 → C, 150 → A, 350 → B" }
  ],
  res: { c: ["ID", "GRADE"], r: [[1, "C"], [2, "A"], [3, "A"]] },
  pg: "SELECT ID, CASE WHEN SAL >= 100 THEN 'A' WHEN SAL >= 300 THEN 'B' ELSE 'C' END FROM T ORDER BY ID",
  ox: [
    "정답이에요. 50은 ELSE의 C, 150과 350은 첫 줄(100 이상)에서 먼저 걸려 A예요.",
    "이렇게 생각하면 틀려요: '더 꼭 맞는 조건(300 이상)이 이긴다.' CASE는 위에서부터 보다가 처음 맞는 곳에서 멈춰요. 350은 첫 줄에서 이미 A가 돼요.",
    "이렇게 생각하면 틀려요: '50도 A다.' 50은 100보다 작아서 첫 줄이 안 맞아요. 둘째 줄도 안 맞으니 ELSE의 C예요.",
    "이렇게 생각하면 틀려요: '150도 B다.' 150은 300보다 작아서 B 조건을 만족하지 않고, 어차피 첫 줄에서 A로 끝나요."
  ],
  trap: "범위 조건 CASE에서 넓은 조건이 위에 있으면 아래 조건은 영영 실행되지 않아요. 출제자는 일부러 순서를 뒤집어 놓아요.",
  memo: "CASE = 처음 맞는 곳에서 멈춤 → 좁은 조건을 위로"
},
{
  id: "S62", s: 2, tp: "fn", lv: 3,
  th: "2과목 | Oracle의 빈 문자열('')과 NULL, 문자열 연결",
  q: "다음 SQL의 결과로 옳은 것은? (Oracle 기준)",
  sql: "SELECT 'A' || NULL || 'B' AS C1,\n       LENGTH('')         AS C2\n  FROM DUAL;",
  o: ["'AB', NULL", "NULL, 0", "'AB', 0", "NULL, NULL"],
  a: 0,
  sum: "Oracle에서는 빈 문자열 ''가 곧 NULL이에요. 그래서 LENGTH('')는 NULL이고, || 로 이을 때는 NULL을 그냥 건너뛰어서 'AB'가 돼요.",
  why: "Oracle은 길이가 0인 문자열('')을 NULL로 저장하고 NULL로 다뤄요. 그래서 LENGTH('')는 사실 LENGTH(NULL)이에요.\n\n값이 없는 것의 길이를 물으면 답도 NULL이에요. 0이 아니에요.\n\n이 규칙과 짝을 맞추려고, Oracle의 문자열 잇기(||)는 NULL을 빈 문자열처럼 그냥 건너뛰어요. Oracle 문서도 '길이 0 문자열과 이으면 결과는 다른 쪽 문자열'이라고 적어 둬요.\n\n그래서 'A' || NULL || 'B'는 가운데 NULL을 건너뛰고 'A'와 'B'만 이어서 'AB'예요. **Oracle에서 NULL은 덧셈 같은 계산(NULL + 1 = NULL)에는 번지지만, || 잇기에는 번지지 않아요.**\n\n결과는 'AB', NULL이에요. 표준 SQL과 PostgreSQL은 ''와 NULL을 구분하고 || 에도 NULL이 번지니 결과가 달라요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT 'A' || NULL || 'B' AS C1,  -- ② NULL은 건너뛰어요: 'A' || 'B' → 'AB'\n       LENGTH('')         AS C2   --    '' = NULL → LENGTH(NULL) → NULL\n  FROM DUAL;                      -- ① 한 줄짜리 연습용 테이블" },
    { t: "DBMS별 차이", tb: { c: ["식", "Oracle", "표준 SQL / PostgreSQL"], r: [["'A' || NULL || 'B'", "'AB'", "NULL"], ["LENGTH('')", "NULL", "0"], ["NULL + 1", "NULL", "NULL"]] } },
    { t: "|| 결과가 NULL이 되는 유일한 경우", n: "SELECT NULL || NULL AS C   -- 양쪽이 모두 NULL일 때만 결과가 NULL이에요\n  FROM DUAL;" }
  ],
  ox: [
    "정답이에요. Oracle의 ||는 NULL을 건너뛰어 'AB'이고, ''는 NULL이라 LENGTH('')도 NULL이에요.",
    "이렇게 생각하면 틀려요: '|| 에도 NULL이 번지고, ''는 길이 0이다.' 둘 다 표준 SQL·PostgreSQL 방식이에요. Oracle에서는 둘 다 반대예요.",
    "이렇게 생각하면 틀려요: '''는 길이 0인 문자열이다.' Oracle은 ''를 NULL로 다루니 LENGTH 결과도 NULL이에요.",
    "이렇게 생각하면 틀려요: '덧셈처럼 || 에도 NULL이 번진다.' Oracle의 || 는 NULL을 건너뛰어요."
  ],
  trap: "같은 NULL이라도 계산(+, *)에는 번지고, Oracle의 문자열 잇기(||)에는 번지지 않아요.",
  memo: "Oracle: '' = NULL, 'A' || NULL = 'A'"
},
{
  id: "S63", s: 2, tp: "dml", lv: 2,
  th: "2과목 | INSERT와 NOT NULL · PK · DEFAULT 제약",
  q: "다음 테이블에서 오류 없이 실행되는 INSERT 문은?",
  sql: "CREATE TABLE T (\n  C1 NUMBER       PRIMARY KEY,\n  C2 VARCHAR2(10) NOT NULL,\n  C3 NUMBER       DEFAULT 0,\n  C4 DATE\n);\n\n① INSERT INTO T VALUES (1, 'A', 5);\n② INSERT INTO T (C1, C2) VALUES (2, 'B');\n③ INSERT INTO T (C1, C3) VALUES (3, 10);\n④ INSERT INTO T (C2, C3) VALUES ('D', 1);",
  o: ["①", "②", "③", "④"],
  a: 1,
  sum: "②는 빠진 C3에 DEFAULT 0, C4에 NULL이 들어가는데 아무 규칙도 안 어겨서 성공해요. 나머지는 값 개수가 모자라거나 꼭 필요한 칸이 비어서 실패해요.",
  why: "INSERT는 먼저 '어느 컬럼에 값을 넣는지'를 정하고, 나머지 컬럼을 채워요. 컬럼 목록을 안 쓰면 테이블의 모든 컬럼(여기선 4개)에 순서대로 값을 줘야 해요. 개수가 다르면 문장부터 오류예요.\n\n컬럼 목록을 쓰면 목록에서 빠진 컬럼은 DEFAULT가 있으면 그 값, 없으면 NULL로 채워져요. 그다음 규칙 검사를 해요. NOT NULL 컬럼이나 PK 컬럼이 NULL로 채워지면 ORA-01400 오류가 나요.\n\n하나씩 볼게요. ①은 목록 없이 값이 3개뿐이라 ORA-00947 오류예요.\n\n②는 C3에 DEFAULT 0, C4에 NULL이 들어가요. 둘 다 비어도 되는 칸이라 성공해요.\n\n③은 C2가 NULL이 되는데 C2는 NOT NULL이라 실패해요. ④는 C1이 NULL이 되는데 PK는 비울 수 없어서 실패해요.\n\n**그래서 오류 없이 실행되는 것은 ②뿐이에요.** 넣어지는 행은 (2, 'B', 0, NULL)이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "INSERT INTO T VALUES (1, 'A', 5);         -- ① 목록이 없으니 4개가 필요한데 3개 → ORA-00947\nINSERT INTO T (C1, C2) VALUES (2, 'B');   -- ② C3 ← DEFAULT 0, C4 ← NULL → 성공\nINSERT INTO T (C1, C3) VALUES (3, 10);    -- ③ C2 ← NULL, 그런데 NOT NULL → ORA-01400\nINSERT INTO T (C2, C3) VALUES ('D', 1);   -- ④ C1 ← NULL, PK는 비울 수 없음 → ORA-01400" },
    { t: "보기별 판정", tb: { c: ["보기", "결과", "이유"], r: [["①", "오류", "값이 3개뿐 (ORA-00947: 값의 수가 충분하지 않음)"], ["②", "성공", "C3 = 0(DEFAULT), C4 = NULL"], ["③", "오류", "C2(NOT NULL)에 NULL (ORA-01400)"], ["④", "오류", "C1(PK)에 NULL (ORA-01400)"]], hl: [1] } },
    { t: "②가 넣은 행", tb: { c: ["C1", "C2", "C3", "C4"], r: [[2, "B", 0, null]] } },
    { t: "DEFAULT가 안 들어가는 경우", n: "INSERT INTO T (C1, C2, C3) VALUES (5, 'E', NULL);  -- C3에 NULL이라고 직접 썼어요 → DEFAULT 무시, C3 = NULL" }
  ],
  ox: [
    "실패해요. 이렇게 생각하면 틀려요: '모자란 컬럼은 알아서 채워진다.' 그건 컬럼 목록을 쓸 때 얘기예요. 목록이 없으면 4개 모두 값을 줘야 해요(ORA-00947).",
    "성공해서 정답이에요. 빠진 C3에는 DEFAULT 0, C4에는 NULL이 들어가고 어떤 규칙도 어기지 않아요.",
    "실패해요. 이렇게 생각하면 틀려요: '빠진 컬럼은 다 괜찮다.' 빠진 C2가 NULL이 되는데 C2는 NOT NULL이에요(ORA-01400).",
    "실패해요. 이렇게 생각하면 틀려요: 'PK 값은 알아서 생긴다.' PK 컬럼 C1이 빠져서 NULL이 되는데, PK는 비울 수 없어요(ORA-01400)."
  ],
  trap: "DEFAULT는 컬럼을 '빼먹었을' 때만 들어가요. 값을 직접 NULL이라고 쓰면 DEFAULT 대신 NULL이 들어가요.",
  memo: "PK = UNIQUE + NOT NULL / DEFAULT는 생략했을 때만"
},
{
  id: "S64", s: 2, tp: "ddl", lv: 2,
  th: "2과목 | ALTER TABLE 문법 (Oracle)",
  q: "Oracle에서 오류가 발생하는 ALTER TABLE 문은?",
  sql: "① ALTER TABLE EMP ADD (AGE NUMBER(3));\n② ALTER TABLE EMP MODIFY (ENAME VARCHAR2(50));\n③ ALTER TABLE EMP RENAME COLUMN ENAME TO EMP_NAME;\n④ ALTER TABLE EMP ALTER COLUMN ENAME VARCHAR2(50);",
  o: ["①", "②", "③", "④"],
  a: 3,
  sum: "Oracle에서 컬럼 정의를 바꿀 때는 MODIFY를 써요. ALTER COLUMN은 SQL Server 문법이라 Oracle에서는 ④가 오류예요.",
  why: "ALTER TABLE은 DBMS마다 문법이 조금씩 달라요. 시험은 Oracle과 SQL Server 문법을 섞어서 함정을 만들어요.\n\nOracle에서는 컬럼 추가가 ADD, 컬럼의 타입이나 크기 바꾸기가 MODIFY, 이름 바꾸기가 RENAME COLUMN A TO B, 삭제가 DROP COLUMN이에요. SQL Server는 타입이나 크기를 바꿀 때 ALTER COLUMN을 써요.\n\n보기를 하나씩 보면 ①은 ADD, ②는 MODIFY, ③은 RENAME COLUMN으로 모두 Oracle 문법이에요. **④의 ALTER COLUMN은 SQL Server 문법이라 Oracle에서는 오류가 나요.**",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "ALTER TABLE EMP ADD (AGE NUMBER(3));              -- ① 컬럼 추가: Oracle 정상\nALTER TABLE EMP MODIFY (ENAME VARCHAR2(50));      -- ② 컬럼 크기 변경: Oracle 정상\nALTER TABLE EMP RENAME COLUMN ENAME TO EMP_NAME;  -- ③ 컬럼 이름 변경: Oracle 정상\nALTER TABLE EMP ALTER COLUMN ENAME VARCHAR2(50);  -- ④ SQL Server 문법 → Oracle에서는 오류" },
    { t: "DBMS별 문법", tb: { c: ["작업", "Oracle", "SQL Server"], r: [["컬럼 추가", "ADD (컬럼 타입)", "ADD 컬럼 타입"], ["컬럼 변경", "MODIFY (컬럼 타입)", "ALTER COLUMN 컬럼 타입"], ["컬럼 이름 변경", "RENAME COLUMN A TO B", "sp_rename"], ["컬럼 삭제", "DROP COLUMN 컬럼", "DROP COLUMN 컬럼"]], hl: [1] } },
    { t: "의도대로 쓰려면: DBMS에 맞는 문법", n: "-- Oracle\nALTER TABLE EMP MODIFY (ENAME VARCHAR2(50));\n-- SQL Server\nALTER TABLE EMP ALTER COLUMN ENAME VARCHAR(50);" }
  ],
  ox: [
    "정상이에요. Oracle의 컬럼 추가는 ADD (컬럼 타입)이에요.",
    "정상이에요. Oracle에서 컬럼의 타입이나 크기를 바꿀 때는 MODIFY를 써요.",
    "정상이에요. Oracle은 RENAME COLUMN 옛이름 TO 새이름으로 컬럼 이름을 바꿔요.",
    "오류라서 정답이에요. 이렇게 생각하면 틀려요: '컬럼을 바꾸니 ALTER COLUMN.' 그건 SQL Server 문법이에요. Oracle은 ②처럼 MODIFY를 써요."
  ],
  trap: "데이터가 들어 있는 컬럼을 기존 데이터보다 작게 줄이는 MODIFY는 Oracle에서도 오류가 나요.",
  memo: "Oracle = MODIFY, SQL Server = ALTER COLUMN"
},
{
  id: "S65", s: 2, tp: "agg", lv: 2,
  th: "2과목 | GROUP BY에서 NULL 그룹",
  q: "아래 [T] 테이블에 대해 다음 SQL의 결과 행 수는?",
  tb: [{ n: "T", c: ["ID", "DEPT", "BONUS"], r: [[1, 10, 100], [2, 10, null], [3, 20, 200], [4, null, 200], [5, 20, null], [6, 30, null]] }],
  sql: "SELECT DEPT, COUNT(*), SUM(BONUS)\n  FROM T\n GROUP BY DEPT;",
  o: ["3", "4", "5", "6"],
  a: 1,
  sum: "GROUP BY는 DEPT가 빈(NULL) 행도 버리지 않고 'NULL 묶음' 하나로 모아요. 그래서 10, 20, 30, NULL 네 묶음이 생겨 4줄이에요.",
  why: "GROUP BY는 그룹 기준 컬럼의 값이 같은 행끼리 한 묶음으로 모아요. 이때 값이 빈(NULL) 행들도 버리지 않고, 그 행들끼리 한 묶음으로 모아요.\n\nWHERE에서 NULL = NULL을 물으면 '모름'이 되는 것과 다르죠? 묶음을 나눌 때는 '서로 구분할 수 없는 값'끼리 한데 모으는 규칙을 따르기 때문이에요. DISTINCT도 같은 규칙이에요. **그래서 DEPT가 NULL인 행은 'NULL 묶음' 하나를 만들어요.**\n\n이 데이터로 볼게요. DEPT 10에는 ID 1, 2가, 20에는 ID 3, 5가, 30에는 ID 6이, NULL에는 ID 4가 모여요. 묶음이 4개라서 결과도 4줄이에요.\n\n참고로 30번 묶음의 SUM(BONUS)는 더할 값이 하나도 없어서 0이 아니라 NULL이에요. 집계 함수가 빈 '값'을 건너뛰는 것은 묶음을 만드는 것과 별개의 규칙이에요.",
  st: [
    { t: "SQL 한 줄씩 읽기", n: "SELECT DEPT,         -- ③ 묶음마다 1줄: 묶음 기준 DEPT\n       COUNT(*),     --    묶음의 행 수 (BONUS가 빈 행도 셈)\n       SUM(BONUS)    --    묶음의 BONUS 합 (빈 값은 건너뜀)\n  FROM T             -- ① 원본 6행\n GROUP BY DEPT;      -- ② DEPT 값으로 묶어요: 10, 20, 30, NULL → 4묶음" },
    { t: "묶음 나누기", tb: { c: ["묶음(DEPT)", "들어간 ID", "BONUS 값"], r: [[10, "1, 2", "100, NULL"], [20, "3, 5", "200, NULL"], [30, "6", "NULL"], [null, "4", "200"]], hl: [3] } },
    { t: "묶음별 결과", tb: { c: ["DEPT", "COUNT(*)", "SUM(BONUS)"], r: [[10, 2, 100], [20, 2, 200], [30, 1, null], [null, 1, 200]], hl: [3] } },
    { t: "NULL 묶음을 빼고 싶다면", n: "SELECT DEPT, COUNT(*), SUM(BONUS)\n  FROM T\n WHERE DEPT IS NOT NULL   -- 묶기 전에 DEPT가 빈 행을 먼저 빼요\n GROUP BY DEPT;          -- 3줄 (10, 20, 30)" }
  ],
  res: { c: ["DEPT", "COUNT(*)", "SUM(BONUS)"], r: [[10, 2, 100], [20, 2, 200], [30, 1, null], [null, 1, 200]] },
  pg: "SELECT DEPT, COUNT(*), SUM(BONUS) FROM T GROUP BY DEPT ORDER BY DEPT NULLS LAST",
  ox: [
    "이렇게 생각하면 틀려요: 'NULL끼리는 같지 않으니 묶이지 않는다.' 그건 WHERE의 = 비교 얘기예요. GROUP BY는 NULL끼리 한 묶음으로 모아요.",
    "정답이에요. 10, 20, 30, NULL 네 묶음이 생겨요.",
    "이렇게 생각하면 틀려요: 묶음 수를 잘못 센 거예요. 묶음 수는 DEPT의 서로 다른 값 수(NULL 포함 4개)와 같아요.",
    "이렇게 생각하면 틀려요: '원본 6행이 그대로 나온다.' GROUP BY 뒤에는 묶음마다 1줄만 남아요."
  ],
  trap: "30번 묶음의 SUM(BONUS)는 값이 모두 비어 있어서 0이 아니라 NULL이에요.",
  memo: "GROUP BY는 NULL도 한 묶음"
}
);
