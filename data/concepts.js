// 개념정리 · 암기카드 · 출제 추이 데이터
// TOPICS: 주제 키 → 이름·과목. 문제(tp)·개념·카드·추이가 모두 이 키로 연결된다.
window.TOPICS = {
  schema: { s: 1, n: "모델링 특성·단계·스키마" },
  entity: { s: 1, n: "엔터티" },
  attr:   { s: 1, n: "속성·도메인" },
  rel:    { s: 1, n: "관계" },
  ident:  { s: 1, n: "식별자·키" },
  norm:   { s: 1, n: "정규화·반정규화" },
  acid:   { s: 1, n: "트랜잭션 ACID" },
  basic:  { s: 2, n: "SELECT 기본·연산자" },
  agg:    { s: 2, n: "집계·GROUP BY" },
  nullfn: { s: 2, n: "NULL 함수" },
  notin:  { s: 2, n: "NULL 3진 논리·NOT IN" },
  fn:     { s: 2, n: "단일행 함수·CASE" },
  join:   { s: 2, n: "조인" },
  sub:    { s: 2, n: "서브쿼리" },
  set:    { s: 2, n: "집합 연산자" },
  grp:    { s: 2, n: "ROLLUP·CUBE·GROUPING SETS" },
  win:    { s: 2, n: "윈도우 함수" },
  hier:   { s: 2, n: "계층형 질의" },
  topn:   { s: 2, n: "ROWNUM·TOP-N" },
  pivot:  { s: 2, n: "PIVOT·UNPIVOT" },
  regex:  { s: 2, n: "정규표현식" },
  dml:    { s: 2, n: "DML·MERGE·제약조건" },
  tcl:    { s: 2, n: "TCL·트랜잭션 제어" },
  ddl:    { s: 2, n: "DDL·DCL·권한" },
  trap: { s: 2, n: "시험 직전 한 줄 규칙" }
};

// 공식 자료
// ① 시험 구성·합격 기준: 데이터자격검정(dataq.or.kr) SQL 개발자 안내 / 진흥원 공공데이터 「데이터 자격 검정 상세정보」(2026-08-21, tools/official/kdata_cert_detail_20260821.csv)
// ② 연도별 접수·응시·취득: 민간자격정보서비스(pqi.or.kr, 교육부·한국직업능력연구원) 자격 'SQL' 등록번호 2011-0771, 등급 '개발자(공인)' (tools/official/pqi_sql_3675_20261004.html)
window.OFFICIAL = {
  exam: { total: 50, minutes: 90, pass: "총점 60점 이상", cut: "과목별 40% 미만 취득 시 과락",
    subjects: [["데이터 모델링의 이해", 10, 20], ["SQL 기본 및 활용", 40, 80]] },
  srcExam: { n: "데이터자격검정 · SQL 개발자 출제기준 / 공공데이터포털 「데이터 자격 검정 상세정보」", url: "https://www.dataq.or.kr/" },
  srcStats: { n: "민간자격정보서비스 · 자격 'SQL'(등록번호 2011-0771) 자격취득현황, 개발자(공인)", url: "https://www.pqi.or.kr/inf/qul/infQulBasDetail.do?qulId=3675" },
  // [연도, 검정횟수, 접수자, 응시자, 취득자, 합격률(%)]
  years: [
    [2019, 4, 11768, 9663, 4707, 48.71], [2020, 4, 13822, 10933, 6399, 58.53], [2021, 4, 29144, 23391, 13225, 56.54],
    [2022, 4, 42193, 32474, 15845, 48.79], [2023, 4, 62122, 48794, 23329, 47.81], [2024, 4, 75042, 59202, 33916, 57.29],
    [2025, 4, 88440, 62664, 26121, 41.68]
  ]
};

// 복원 기출(55~62회) 주제 분포 — 공개 복원본 문항을 키워드로 자동 분류한 근사치(tools/trend-raw.json)
window.TREND = {
  rounds: [55, 56, 57, 58, 59, 60, 61, 62],
  src: "[참고 자료] 공식 문항 통계는 공개되지 않는다. 공개된 수험생 복원 문항(회차당 50문항)을 키워드 규칙으로 자동 분류한 근사치입니다. 한 문항이 여러 주제를 다루면 하나로만 셉니다.",
  data: {
    acid: [1,1,1,3,1,2,1,1], norm: [2,2,0,1,1,1,1,1], ident: [3,1,3,2,3,3,3,2], rel: [2,3,3,2,2,2,3,3],
    attr: [0,2,1,0,1,2,0,1], entity: [1,0,1,1,0,0,1,2], schema: [1,2,1,1,2,1,1,0],
    pivot: [0,0,1,1,0,2,1,1], regex: [1,1,2,2,2,1,0,1], grp: [3,2,2,4,2,1,2,1], hier: [1,1,2,3,2,3,1,2],
    topn: [1,0,3,0,1,3,4,2], win: [2,1,3,2,3,3,2,0], notin: [1,4,5,3,3,3,5,3], set: [2,2,1,0,3,3,1,2],
    join: [6,5,4,4,3,3,3,6], sub: [2,1,3,3,3,3,5,3], nullfn: [1,2,1,5,2,1,1,2], tcl: [2,2,2,0,2,1,1,1],
    dml: [5,2,3,3,3,5,3,4], ddl: [1,0,0,1,1,2,1,4], agg: [2,6,3,2,2,2,3,5], fn: [0,2,2,2,4,0,2,1], basic: [10,8,3,5,4,3,5,2]
  },
  // 63회 대비 우선순위 (55~62회 추이 + 60~62회 복원본에서 반복된 함정)
  focus: [
    { tp: "notin", why: "60·61·62회 연속. NOT IN 서브쿼리에 NULL이 섞이면 0건, NOT BETWEEN과 NULL, NOT (A OR B IS NULL) 같은 3진 논리가 매 회 나온다." },
    { tp: "join", why: "62회 6문항으로 최다. 아우터 조인에서 조건을 ON에 두느냐 WHERE에 두느냐, NATURAL·USING·ON 컬럼 수, 비등가 조인 건수, 식별 관계 조인 조건 수." },
    { tp: "agg", why: "62회 5문항. COUNT(*)와 COUNT(컬럼), 0건일 때 GROUP BY 유무에 따른 결과, WHERE의 집계 함수·HAVING의 별칭 오류." },
    { tp: "topn", why: "매 회 2문항 이상. ROWNUM <> 3·> 1, ROWNUM과 ORDER BY 순서, TOP·FETCH FIRST·WITH TIES·OFFSET 비교." },
    { tp: "dml", why: "62회 4문항. MERGE의 UPDATE + DELETE WHERE, INSERT FIRST/ALL, INSERT INTO … AS SELECT 오류, 제약조건과 NULL." },
    { tp: "ddl", why: "62회 4문항. CTAS가 복사하는 제약, ALTER TABLE 오류(NOT NULL 추가·크기 축소·DROP FOREIGN KEY), 뷰의 특징, ROLE 권한." },
    { tp: "regex", why: "60회 REGEXP_REPLACE 역참조, 61회 REGEXP_SUBSTR 그룹, 62회 REGEXP_COUNT로 3회 연속. 다음은 REGEXP_LIKE·REGEXP_INSTR 차례일 수 있다." },
    { tp: "sub", why: "매 회 3문항 이상. 상관 없는 EXISTS의 UPDATE 범위, 인라인 뷰 별칭 범위, 스칼라 서브쿼리 다중 행 오류." },
    { tp: "win", why: "62회엔 없었지만 60·61회 2~4문항. 기본 프레임(RANGE 누적), NTILE 나머지 배분, LAG 첫 행 NULL을 대비해야 한다." },
    { tp: "grp", why: "매 회 1~2문항. ROLLUP은 인자 순서에 따라 결과가 달라지고 CUBE는 같다, GROUPING SETS 행 수." },
    { tp: "hier", why: "매 회 1~3문항. 리프는 LEVEL 1이 아니다, 루트가 여러 개인 트리, CONNECT BY 조건과 WHERE 조건 차이." },
    { tp: "rel", why: "1과목 매 회 2~3문항. ERD 참여(○ 선택, ┼ 필수) 읽기, 식별 실선·비식별 점선(IE), Barker의 실선·점선은 필수·선택, 배타 관계." },
    { tp: "entity", why: "62회 2문항. 발생시점 분류(사원 = 기본, 주문·계약·매출 = 중심), 엔터티 특징. 60회엔 Chen 표기법(관계 = 마름모)이 처음 나왔다." },
    { tp: "ident", why: "1과목 단골. 주식별자 특성(불변성·존재성: NULL 가능한 이메일은 주식별자 불가), 비식별 관계 전환 조건." },
    { tp: "norm", why: "매 회 1문항. 다중값 속성 = 1NF 위반, 복합키에 속지 말고 이행 종속(3NF)·부분 종속(2NF)을 가려낸다." }
  ]
};

// 개념정리: 주제별 핵심 정리. b 블록 = { h: 소제목, t: 설명, tb: 표, code: SQL, memo: 암기 }
window.CONCEPTS = [
  { tp: "schema", b: [
    { h: "데이터 모델링의 3대 특성", t: "추상화(현실을 일정한 형식으로 표현) · 단순화(약속된 표기법으로 쉽게 표현) · 명확화(애매함 없이 정확하게 기술).", memo: "단·추·명" },
    { h: "진행 3단계", tb: { c: ["단계", "핵심 작업", "특징"], r: [["개념적", "핵심 엔터티·관계 도출, ERD 작성", "추상화 수준 최고"], ["논리적", "정규화, 주식별자·외래키 확정", "DBMS 독립, 재사용성 최고"], ["물리적", "테이블·인덱스·파티션, 반정규화", "구체화 수준 최고"]] }, memo: "개·논·물" },
    { h: "데이터 모델링의 3가지 관점", t: "데이터 관점(What, 업무와 관련된 데이터) · 프로세스 관점(How, 업무가 하는 일) · 데이터와 프로세스의 상관 관점(Interaction, 프로세스가 데이터에 주는 영향)." },
    { h: "모델링 유의점", tb: { c: ["유의점", "문제"], r: [["중복성", "같은 정보를 여러 곳에 저장"], ["비유연성", "데이터 정의와 프로세스를 분리하지 않아 작은 변화에도 모델이 바뀜"], ["비일관성", "데이터 간 연관 관계를 정의하지 않아 서로 모순"]] } },
    { h: "ANSI-SPARC 3단계 스키마", tb: { c: ["스키마", "관점", "개수"], r: [["외부", "사용자·응용 프로그램(뷰)", "여러 개"], ["개념", "조직 전체 통합 논리 구조", "1개"], ["내부", "물리 저장 구조", "1개"]] } },
    { h: "데이터 독립성", tb: { c: ["독립성", "변경되는 스키마", "영향받지 않는 스키마"], r: [["논리적 독립성", "개념", "외부"], ["물리적 독립성", "내부", "개념·외부"]] }, memo: "바뀌는 쪽 이름 = 독립성 이름 (내부=물리)" }
  ]},
  { tp: "entity", b: [
    {"h": "엔터티(Entity)란", "t": "업무에 필요하고 계속 관리해야 하는 정보를 담는 '집합'이다. 엔터티 안의 한 건 한 건을 인스턴스라고 한다.\n예: 엔터티 = 고객, 인스턴스 = 김철수 고객, 이영희 고객."},
    {"h": "엔터티 성립 조건", "t": "① 업무에 필요한 정보 ② 유일한 식별자로 구분 가능 ③ 인스턴스가 2개 이상 ④ 업무 프로세스가 이용 ⑤ 속성을 가짐 ⑥ 다른 엔터티와 관계 1개 이상.\n**예외는 ⑥ 관계 조건 하나뿐이다.** 통계·코드·내부 업무용 엔터티는 관계가 없어도 된다. '인스턴스가 하나뿐이어도 중요하면 엔터티'는 틀린 말이다.", "memo": "업·식·2·이·속·관 (예외는 관계뿐)"},
    {"h": "분류 ① 유무형 기준 — '손에 잡히나?'", "tb": {"c": ["분류", "판별 질문", "예"], "r": [["유형 엔터티", "물리적 형태가 있고 안정적이며 계속 쓰이나?", "사원, 물품, 강사"], ["개념 엔터티", "형태는 없지만 관리할 개념인가?", "조직, 보험상품, 과목"], ["사건 엔터티", "업무를 하다가 '일어난 일'인가? 발생량이 많다", "주문, 청구, 미납, 수강신청"]]}, "memo": "유·개·사"},
    {"h": "분류 ② 발생시점 기준 — '언제, 무엇으로부터 생기나?'", "tb": {"c": ["분류", "어떻게 생기나", "부모 엔터티", "데이터 양·변경", "예"], "r": [["기본(키) 엔터티", "업무에 원래 존재. 다른 엔터티 없이 혼자 생긴다. 자기 고유의 주식별자를 가진다", "없음 (다른 엔터티의 부모가 된다)", "적고 안정적", "고객, 사원, 부서, 상품, 자재"], ["중심(메인) 엔터티", "기본 엔터티로부터 생기는 업무의 중심", "기본 엔터티", "많다. 행위 엔터티를 많이 낳는다", "주문, 계약, 청구, 사고, 예금원장"], ["행위 엔터티", "부모 엔터티 2개 이상에서 생긴다", "2개 이상", "가장 많고 자주 바뀐다. 상세 설계 단계에서 도출", "주문상세, 주문목록, 사원변경이력"]]}, "memo": "기(혼자) → 중(업무 중심) → 행(부모 둘 이상, 이력·상세)"},
    {"h": "헷갈릴 때 판별 순서", "t": "① 다른 엔터티 없이 혼자 생기나? → **기본**\n② 기본 엔터티에서 생겨 업무의 중심이 되나? → **중심**\n③ 부모가 둘 이상이고 이름에 '상세·내역·이력·목록'이 붙나? → **행위**\n두 분류 기준은 서로 독립이다. 그래서 '주문'은 사건 엔터티(유무형 기준)이면서 중심 엔터티(발생시점 기준)다."},
    {"h": "자주 나오는 함정 보기", "tb": {"c": ["보기", "판정", "이유"], "r": [["고객 — 행위 엔터티", "X", "고객은 혼자 생기는 기본 엔터티"], ["주문 — 중심 엔터티", "O", "고객·상품(기본)에서 생기는 업무의 중심"], ["주문상세 — 중심 엔터티", "X", "주문과 상품 두 부모에서 생기는 행위 엔터티"], ["사원변경이력 — 행위 엔터티", "O", "이력은 대표적인 행위 엔터티"], ["보험상품 — 유형 엔터티", "X", "형태가 없는 개념 엔터티"], ["기본 엔터티는 다른 엔터티로부터 주식별자를 상속받는다", "X", "상속받지 않고 자기 고유의 주식별자를 가진다"]]}},
    {"h": "명명 규칙", "t": "현업 용어 사용, 약어 지양, 단수 명사, 유일한 이름, 생성 의미대로 부여."}
  ]},
  { tp: "attr", b: [
    { h: "속성의 정의", t: "업무에서 필요로 하는, 더 이상 분리되지 않는 최소의 데이터 단위. 인스턴스의 구성 요소이며 하나의 속성은 한 개의 값만 가진다." },
    { h: "특성에 따른 분류", tb: { c: ["분류", "설명", "예"], r: [["기본 속성", "업무에서 추출한 원래 속성", "이름, 생년월일"], ["설계 속성", "설계 편의로 만든 코드·일련번호", "상품코드, 주문순번"], ["파생 속성", "다른 속성에서 계산", "합계금액, 나이"]] }, memo: "파생 속성은 정합성 위험 → 최소화" },
    { h: "구성 방식에 따른 분류", t: "PK 속성(식별) · FK 속성(관계로 상속) · 일반 속성. 단일 속성 vs 복합 속성(주소 = 시·구·동), 단일값 vs 다중값 속성." },
    { h: "도메인(Domain)", t: "각 속성이 가질 수 있는 값의 범위(데이터 타입, 길이, 제약). 예: 학점 속성의 도메인 = 0.0 ~ 4.5" }
  ]},
  { tp: "rel", b: [
    { h: "관계 표기 3요소", tb: { c: ["요소", "의미"], r: [["관계명", "관계의 이름(능동·수동)"], ["관계차수(Cardinality)", "1:1, 1:M, M:N — 참여 인스턴스 수"], ["관계선택사양(Optionality)", "필수(Mandatory) / 선택(Optional, ○ 표시) 참여"]] }, memo: "명·차·선" },
    { h: "존재 관계 vs 행위 관계", t: "존재에 의한 관계: 부서-사원처럼 존재 자체로 연결. 행위에 의한 관계: 고객-주문처럼 행위로 연결. (UML 클래스 다이어그램의 연관 관계·의존 관계와 대응)" },
    { h: "배타 관계(Exclusive, Arc)", t: "하나의 인스턴스가 여러 후보 엔터티 중 단 하나와만 관계를 맺는 구조. 예: 계좌의 소유자는 개인고객 또는 법인고객 중 하나." },
    { h: "관계 읽기", t: "기준 엔터티 → 관계차수(한/여러) → 대상 엔터티 → 선택사양(항상/때때로) → 관계명. 예: '각 고객은 때때로 여러 주문을 한다.'" },
    {"h": "Barker 표기법 vs IE 표기법 — 한눈에", "tb": {"c": ["항목", "Barker 표기법 (Oracle Case)", "IE 표기법 (Information Engineering, 정보공학)"], "r": [["엔터티 모양", "모서리가 둥근 사각형", "사각형. 가로선 위 = 식별자, 아래 = 일반 속성"], ["식별자 속성", "속성 앞에 #", "가로선 위 칸에 적는다"], ["필수 속성 / 선택 속성", "* / o", "따로 표시하지 않음"], ["'여러(Many)'", "까마귀발", "까마귀발"], ["'하나(One)'", "선 끝에 아무것도 없음", "선 끝에 | (짧은 세로선)"], ["필수 참여", "자기 쪽 절반이 실선", "| (세로선)"], ["선택 참여", "자기 쪽 절반이 점선", "O (동그라미)"], ["식별 관계", "관계선을 가로지르는 짧은 막대(UID 바)", "실선"], ["비식별 관계", "막대 없음", "점선"], ["배타 관계", "여러 관계선을 묶는 호(Arc)", "시험에서는 주로 Barker로 출제"]]}, "memo": "실선/점선: Barker = 필수/선택, IE = 식별/비식별"},
    {"h": "가장 많이 틀리는 지점: 실선과 점선의 뜻", "t": "**Barker의 실선·점선은 '필수냐 선택이냐'(참여)이고, IE의 실선·점선은 '식별 관계냐 비식별 관계냐'다.**\n그래서 'Barker 표기법에서 점선은 비식별 관계'는 틀린 보기다. Barker에서 식별 관계는 관계선을 가로지르는 막대로 나타낸다.\nIE에서 필수·선택은 선 끝의 | 와 O로 나타낸다."},
    {"h": "Barker 관계 읽는 법", "t": "'각 [A]는 [반드시/때때로] [하나의/여러] [B]를 [관계명].'\n'반드시/때때로'는 A 쪽 절반의 선을 본다(실선 = 반드시, 점선 = 때때로).\n'하나/여러'는 B 쪽 끝을 본다(까마귀발 = 여러).\n예: 사원 쪽 절반이 실선이고 부서 쪽 끝이 그냥 선이면 → '각 사원은 반드시 하나의 부서에 소속된다.'"},
    {"h": "IE 선 끝 기호 읽는 법", "tb": {"c": ["B 쪽 끝 기호", "A 한 건에 대한 B의 수"], "r": [["|| (세로선 둘)", "정확히 1 (필수, 하나)"], ["O| (동그라미 + 세로선)", "0 또는 1 (선택, 하나)"], ["|< (세로선 + 까마귀발)", "1 이상 (필수, 여러)"], ["O< (동그라미 + 까마귀발)", "0 이상 (선택, 여러)"]]}, "memo": "안쪽 기호 = 최소(O는 0, |는 1), 바깥쪽 = 최대(|는 1, 까마귀발은 여러)"},
    {"h": "두 표기법의 공통점", "t": "둘 다 관계차수(1:1, 1:M, M:N)를 까마귀발로 나타내고, 관계명·관계차수·관계선택사양 3요소를 표현한다. 다른 것은 기호다. Barker는 선의 실선·점선과 #·*·o, IE는 선 끝의 | 와 O를 쓴다."}
  ]},
  { tp: "ident", b: [
    { h: "주식별자 4대 특성", tb: { c: ["특성", "의미"], r: [["유일성", "모든 인스턴스를 유일하게 구분"], ["최소성", "구성 속성 수가 유일성을 만족하는 최소"], ["불변성", "값이 자주 바뀌지 않음"], ["존재성", "반드시 값이 존재(NOT NULL)"]] }, memo: "유·최·불·존" },
    { h: "키의 포함 관계", t: "슈퍼키(유일성 O, 최소성 X) ⊃ 후보키(유일성 O, 최소성 O) ⊃ 기본키(후보키 중 대표). 대체키 = 기본키로 선택되지 않은 나머지 후보키." },
    { h: "식별자 분류", tb: { c: ["기준", "분류"], r: [["대표성", "주식별자 / 보조식별자"], ["생성 여부", "내부식별자(스스로 생성) / 외부식별자(관계로 상속)"], ["속성 수", "단일식별자 / 복합식별자"], ["대체 여부", "본질식별자(업무에서 생성) / 인조식별자(인위적 일련번호)"]] } },
    { h: "식별자 관계 vs 비식별자 관계", tb: { c: ["구분", "식별자 관계", "비식별자 관계"], r: [["부모 PK 상속", "자식 PK의 일부", "자식의 일반 속성(FK)"], ["IE 표기", "실선", "점선"], ["Barker 표기", "식별자 바 있음", "없음"], ["주의점", "계층이 깊어지면 PK 속성 수 증가 → SQL 복잡", "부모 정보 조회 시 조인 증가"]] } },
    { h: "비식별자 관계로 전환을 고려할 때", t: "자식이 부모와 독립적인 생명주기를 가질 때, 부모 없이 자식이 먼저 생성될 수 있을 때, 상속된 PK 속성이 너무 많아 SQL이 복잡해질 때, 여러 부모 중 하나와만 관계를 맺을 때(배타 관계)." }
  ]},
  { tp: "norm", b: [
    {"h": "함수 종속이란 — 'X를 알면 Y가 하나로 정해진다'", "t": "X → Y라고 쓰고 'Y는 X에 함수 종속된다'고 읽는다. X를 결정자, Y를 종속자라고 한다.\n예: 학번 → 이름. 학번을 알면 이름이 하나로 정해진다. 거꾸로 이름 → 학번은 안 된다(동명이인).\n문제의 {A, B} → {C, D, E}는 'A와 B 두 값을 함께 알면 C, D, E가 정해진다'는 뜻이다."},
    {"h": "함수 종속 3종류", "tb": {"c": ["종류", "모양", "의미", "없애는 정규형"], "r": [["완전 함수 종속", "PK 전체 → 속성", "PK를 '다' 알아야 정해진다. 정상", "—"], ["부분 함수 종속", "PK의 일부 → 속성", "복합 PK 중 '일부만' 알아도 정해진다", "2NF"], ["이행 함수 종속", "PK → X → Y", "일반 속성 X가 다른 일반 속성 Y를 결정한다", "3NF"]]}, "memo": "부분 → 2NF, 이행 → 3NF"},
    {"h": "정규화 단계", "tb": {"c": ["정규형", "제거 대상", "판별 질문"], "r": [["1NF", "다중값(반복 그룹)", "한 칸에 값이 여러 개인가?"], ["2NF", "부분 함수 종속", "복합 PK의 '일부'가 일반 속성을 결정하는가?"], ["3NF", "이행 함수 종속", "일반 속성이 다른 일반 속성을 결정하는가? (X→Y→Z)"], ["BCNF", "후보키가 아닌 결정자", "결정자가 모두 후보키인가?"]]}, "memo": "원·부·이·결"},
    {"h": "함수 종속 문제 푸는 4단계", "t": "① 식별자(PK)를 확인한다.\n② 함수 종속마다 화살표 왼쪽(결정자)을 본다. PK 전체인가, PK의 일부인가, 일반 속성인가?\n③ **결정자가 PK의 일부면 부분 종속 → 2NF, 일반 속성이면 이행 종속 → 3NF, 후보키가 아니면 BCNF 대상**이다.\n④ 분리한다. 결정자를 PK로 하는 새 테이블에 종속자를 옮긴다. 원래 테이블에서는 종속자만 빼고, 결정자는 남겨 연결 고리(FK)로 쓴다."},
    {"h": "예제: R1{A, B, C, D, E}, 식별자 {A, B}", "tb": {"c": ["단계", "내용"], "r": [["주어진 종속", "(1) {A, B} → {C, D, E}   (2) {B} → {D}"], ["결정자 판정", "(1)의 결정자 {A, B} = PK 전체 → 완전 종속, 정상\n(2)의 결정자 {B} = PK의 일부 → D는 부분 종속"], ["몇 정규형 문제?", "부분 종속이 있으므로 1NF 상태, 2NF 정규화 필요"], ["분리", "B → D를 떼어 R2(B, D). 원래 R1에서 D만 빼서 R1(A, B, C, E)"], ["결과", "R1(A, B, C, E) + R2(B, D). B가 R2를 참조하는 연결 고리로 남는다"]]}, "memo": "PK 일부가 결정 → 그 일부와 종속자를 떼어 낸다"},
    {"h": "예제: 3NF (이행 종속)", "t": "사원(사번, 이름, 부서코드, 부서명), PK = 사번.\n사번 → 부서코드, 부서코드 → 부서명. 일반 속성인 부서코드가 부서명을 결정하므로 이행 종속이다.\n→ 사원(사번, 이름, 부서코드) + 부서(부서코드, 부서명)."},
    {"h": "예제: BCNF (후보키가 아닌 결정자)", "t": "수강(학생, 과목, 교수), PK = (학생, 과목). 교수 한 명은 한 과목만 가르친다: 교수 → 과목.\n일반 속성이 없으니 2NF·3NF는 만족한다. 하지만 결정자 '교수'가 후보키가 아니라 BCNF 위반이다.\n→ 수강(학생, 교수) + 담당(교수, 과목)."},
    {"h": "판별 요령", "t": "PK가 단일 속성이면 부분 종속이 생길 수 없어 2NF는 자동으로 만족한다. 2NF·3NF 조건은 '일반(비주요) 속성'에 대한 것이다. 그래서 종속 받는 속성이 후보키의 구성원이면 3NF 위반이 아니다. 대신 BCNF 위반일 수 있다."},
    {"h": "반정규화", "t": "정규화 후 성능 문제가 있을 때 쓰는 최후의 수단이다. 먼저 인덱스·뷰·클러스터링·파티셔닝 등을 검토한다. 중복을 허용하므로 무결성 위험이 따른다."},
    {"h": "테이블 분할", "tb": {"c": ["분할", "기준", "예"], "r": [["수직 분할", "컬럼", "대용량 텍스트·이미지 컬럼 분리"], ["수평 분할", "행", "월별·지역별 파티션"]]}, "memo": "컬럼 자르면 수직"},
    {"h": "반정규화 기법", "t": "테이블: 병합(1:1, 1:M, 슈퍼/서브), 분할(수직·수평), 추가(중복·통계·이력·부분 테이블).\n컬럼: 중복 컬럼, 파생 컬럼, 이력 컬럼, PK에 의한 컬럼 추가.\n관계: 중복 관계 추가."}
  ]},
  { tp: "acid", b: [
    { h: "트랜잭션 ACID", tb: { c: ["특성", "의미"], r: [["원자성(Atomicity)", "All or Nothing — 모두 반영되거나 하나도 반영되지 않음"], ["일관성(Consistency)", "실행 전후 모두 무결성 제약을 만족"], ["고립성(Isolation)", "실행 중인 트랜잭션의 중간 결과를 다른 트랜잭션이 볼 수 없음"], ["지속성(Durability)", "커밋된 결과는 장애가 나도 영구 보존"]] }, memo: "원·일·고·지" },
    { h: "고립성이 깨질 때 생기는 문제", tb: { c: ["현상", "설명"], r: [["Dirty Read", "커밋되지 않은 데이터를 읽음"], ["Non-Repeatable Read", "같은 행을 두 번 읽었는데 값이 바뀜"], ["Phantom Read", "같은 조건으로 두 번 조회했는데 없던 행이 생김"]] } }
  ]},
  { tp: "basic", b: [
    { h: "SELECT 논리적 실행 순서", code: "FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY", t: "WHERE·GROUP BY·HAVING에서는 SELECT 별칭을 쓸 수 없다. ORDER BY에서만 쓸 수 있다.", memo: "F·W·G·H·S·O" },
    { h: "연산자 우선순위", t: "괄호 → 비교 연산자(=, >, LIKE, IN, BETWEEN, IS NULL) → NOT → AND → OR.", memo: "NOT > AND > OR" },
    { h: "LIKE 와일드카드", t: "% = 0글자 이상, _ = 정확히 한 글자. 기호 자체를 찾을 때는 ESCAPE 지정: LIKE 'A\\_C' ESCAPE '\\'" },
    { h: "ORDER BY의 NULL", t: "Oracle은 NULL을 최댓값으로 취급(ASC 맨 뒤, DESC 맨 앞), SQL Server는 최솟값으로 취급. NULLS FIRST / NULLS LAST로 바꿀 수 있다. ORDER BY 2처럼 SELECT 목록의 위치 번호도 쓸 수 있다." },
    { h: "관계 대수", t: "순수 관계 연산자: SELECT(→ WHERE), PROJECT(→ SELECT 절), JOIN, DIVIDE. 일반 집합 연산자: UNION, INTERSECTION, DIFFERENCE(→ MINUS), PRODUCT(→ CROSS JOIN)." }
  ]},
  { tp: "agg", b: [
    { h: "집계 함수와 NULL", t: "SUM·AVG·MIN·MAX·COUNT(컬럼)은 NULL을 빼고 계산한다. COUNT(*)만 NULL 행까지 센다.", tb: { c: ["식", "분모"], r: [["AVG(col)", "NULL이 아닌 행 수"], ["AVG(NVL(col, 0))", "전체 행 수"]] }, memo: "COUNT(*)만 NULL 포함" },
    { h: "공집합에 대한 집계", t: "GROUP BY 없는 집계는 대상 행이 0개여도 1행을 돌려준다: COUNT(*) = 0, SUM·MAX·AVG = NULL. GROUP BY가 있으면 그룹이 없으므로 0행." },
    { h: "GROUP BY 규칙", t: "SELECT 절에는 GROUP BY 컬럼과 집계 함수만 올 수 있다(ORA-00979). 그룹핑 컬럼이 NULL인 행들은 'NULL 그룹' 하나로 묶인다. GROUP BY 없이 HAVING을 쓰면 테이블 전체가 한 그룹이다." },
    { h: "WHERE vs HAVING", t: "WHERE는 그룹을 만들기 전에 행을 거르고(집계 함수 사용 불가), HAVING은 그룹을 만든 뒤 그룹을 거른다(집계 함수 사용 가능)." },
    {"h": "WHERE에 집계 함수를 쓸 수 없는 이유", "code": "SELECT DEPT FROM EMP WHERE AVG(SAL) > 300 GROUP BY DEPT;   -- 오류 (ORA-00934)\nSELECT DEPT FROM EMP GROUP BY DEPT HAVING AVG(SAL) > 300;   -- 정상", "t": "WHERE는 그룹을 만들기 전에 한 행씩 검사한다. 아직 그룹이 없으니 평균을 낼 수 없다. **집계 함수 조건은 그룹을 만든 뒤 실행되는 HAVING에 쓴다.**"}
  ]},
  { tp: "nullfn", b: [
    {"h": "NULL 처리 함수", "tb": {"c": ["함수", "동작", "예 → 결과", "DBMS"], "r": [["NVL(A, B)", "A가 NULL이면 B, 아니면 A", "NVL(NULL, 0) → 0", "Oracle"], ["ISNULL(A, B)", "NVL과 같다", "ISNULL(1, 2) → 1 / ISNULL(NULL, 2) → 2", "SQL Server"], ["NVL2(A, B, C)", "A가 NULL이 아니면 B, NULL이면 C", "NVL2(NULL, 'Y', 'N') → 'N'", "Oracle"], ["NULLIF(A, B)", "A = B면 NULL, 다르면 A", "NULLIF(5, 5) → NULL / NULLIF(5, 3) → 5", "공통"], ["COALESCE(A, B, C…)", "왼쪽부터 처음으로 NULL이 아닌 값", "COALESCE(NULL, NULL, 3, 4) → 3", "공통(표준)"]]}, "memo": "NVL = ISNULL(SQL Server) / NVL2(식, 있으면, 없으면)"},
    {"h": "ISNULL(1, 2)는 왜 1인가", "t": "ISNULL(A, B)는 'A가 NULL이면 B로 바꿔라'는 함수다. 1은 NULL이 아니니 **바꿀 이유가 없어서 A인 1이 그대로 나온다.** B는 A가 NULL일 때만 쓰인다.\nOracle에는 ISNULL 함수가 없다. 같은 일을 NVL이 한다. ISNULL은 SQL Server 함수다."},
    {"h": "ISNULL 함수 vs IS NULL 조건", "t": "ISNULL(컬럼, 값)은 값을 바꿔 돌려주는 함수다(SQL Server). 'WHERE 컬럼 IS NULL'은 NULL인지 묻는 조건이다(모든 DBMS).\n'WHERE 컬럼 = NULL'은 결과가 0건이다. NULL과 = 비교하면 참이 아니라 '모름'이 되기 때문이다."},
    {"h": "NULL과 연산", "t": "NULL + 10 = NULL, NULL * 0 = NULL. 산술 연산에 NULL이 하나라도 있으면 결과는 NULL이다.\nOracle의 문자열 연결은 예외다: 'A' || NULL = 'A' (NULL을 빈 문자열처럼 취급)."},
    {"h": "DECODE vs CASE", "t": "DECODE(식, 값1, 결과1, …, 기본값)은 Oracle 전용이며 NULL과 NULL을 같다고 본다. 단순 CASE(CASE 식 WHEN 값)는 '=' 비교라 NULL을 잡지 못한다. NULL은 CASE WHEN 식 IS NULL로 판별한다."}
  ]},
  { tp: "notin", b: [
    { h: "3진 논리", tb: { c: ["A", "B", "A AND B", "A OR B"], r: [["TRUE", "UNKNOWN", "UNKNOWN", "TRUE"], ["FALSE", "UNKNOWN", "FALSE", "UNKNOWN"], ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"]] }, t: "NOT UNKNOWN = UNKNOWN. WHERE·ON·HAVING은 TRUE인 행만 통과시킨다." },
    { h: "NULL 비교", t: "'= NULL', '<> NULL'은 항상 UNKNOWN이다. 반드시 IS NULL / IS NOT NULL을 쓴다. NULL이 포함된 산술 연산은 NULL이다(NULL + 1 = NULL)." },
    { h: "IN / NOT IN과 NULL", code: "COL IN (10, NULL)      = COL = 10 OR COL = NULL     → 10은 통과\nCOL NOT IN (10, NULL)  = COL <> 10 AND COL <> NULL → 항상 0건", memo: "NOT IN 서브쿼리에 NULL → 0건" },
    { h: "NOT EXISTS와의 차이", t: "NOT EXISTS는 '조건을 만족하는 행이 있는가'만 따지므로 NULL의 영향을 받지 않는다. 서브쿼리 컬럼에 NULL이 있을 때만 NOT IN과 NOT EXISTS의 결과가 달라진다." },
    { h: "NULL을 같은 값으로 보는 곳", t: "DISTINCT, GROUP BY, 집합 연산(UNION·INTERSECT·MINUS), DECODE에서는 NULL끼리 같은 값으로 묶인다. 조인 조건과 WHERE 비교에서는 매칭되지 않는다." }
  ]},
  { tp: "fn", b: [
    { h: "문자 함수", tb: { c: ["함수", "예", "결과"], r: [["SUBSTR(s, 시작, 길이)", "SUBSTR('DATABASE', 3, 4)", "TABA"], ["INSTR(s, 찾기, 시작, n번째)", "INSTR('DATABASE', 'A', 1, 3)", "6"], ["LENGTH", "LENGTH('SQL')", "3"], ["TRIM / LTRIM / RTRIM", "LTRIM('xxA', 'x')", "A"], ["LPAD / RPAD", "LPAD('7', 3, '0')", "007"], ["REPLACE", "REPLACE('A-B', '-', '')", "AB"], ["CONCAT / ||", "'A' || 'B'", "AB"]] }, t: "Oracle은 ''(빈 문자열)을 NULL로 취급하고, || 연결에서 NULL을 건너뛴다('A' || NULL = 'A')." },
    { h: "숫자 함수", tb: { c: ["함수", "예", "결과"], r: [["ROUND", "ROUND(15.75, 1) / ROUND(1234.5, -2)", "15.8 / 1200"], ["TRUNC", "TRUNC(-15.75)", "-15 (0 쪽으로 버림)"], ["CEIL", "CEIL(-15.75)", "-15 (이상인 최소 정수)"], ["FLOOR", "FLOOR(-15.75)", "-16 (이하인 최대 정수)"], ["MOD", "MOD(7, 3)", "1"], ["SIGN / ABS", "SIGN(-3) / ABS(-3)", "-1 / 3"]] }, memo: "CEIL 오른쪽, FLOOR 왼쪽" },
    { h: "날짜·변환 함수", t: "SYSDATE, ADD_MONTHS(d, n), MONTHS_BETWEEN, LAST_DAY, EXTRACT(YEAR FROM d). 날짜 + 1 = 하루 뒤, 날짜 + 1/24 = 1시간 뒤. TO_CHAR(날짜/숫자 → 문자), TO_DATE(문자 → 날짜), TO_NUMBER(문자 → 숫자)." },
    { h: "CASE 평가 순서", t: "검색형 CASE는 위에서부터 첫 번째로 참인 WHEN에서 멈춘다. ELSE가 없고 아무 조건도 맞지 않으면 NULL." }
  ]},
  { tp: "join", b: [
    { h: "조인 종류", tb: { c: ["조인", "결과"], r: [["INNER JOIN", "양쪽 모두 매칭되는 행"], ["LEFT OUTER", "왼쪽 전부 + 오른쪽 매칭(없으면 NULL)"], ["RIGHT OUTER", "오른쪽 전부 + 왼쪽 매칭"], ["FULL OUTER", "매칭 + 왼쪽만 + 오른쪽만"], ["CROSS JOIN", "카테시안 곱 (M × N)"], ["NATURAL JOIN", "이름 같은 모든 컬럼으로 자동 등가 조인"]] } },
    { h: "ON vs WHERE (아우터 조인)", t: "ON 조건은 '붙일지 말지'만 정해서 기준 테이블 행은 그대로 남는다. WHERE 조건은 조인 후 '남길지 말지'를 정한다. 안쪽 테이블 컬럼에 WHERE 조건을 걸면 NULL 행이 지워져 이너 조인처럼 된다." },
    { h: "Oracle (+) 표기", t: "(+)는 NULL로 채워지는 쪽에 붙인다. E.DEPTNO(+) = D.DEPTNO → DEPT 보존 → EMP RIGHT OUTER JOIN DEPT. FULL OUTER는 (+)로 표현할 수 없다." },
    { h: "NATURAL / USING 제약", t: "공통 컬럼에 테이블 별칭(접두사)을 붙이면 오류(ORA-25155). ON 절 조인은 반대로 공통 컬럼에 접두사가 없으면 '열의 정의가 애매함'(ORA-00918)." },
    { h: "NULL과 조인", t: "조인 조건에서 NULL = NULL은 UNKNOWN이라 절대 매칭되지 않는다. FULL OUTER JOIN에서 양쪽 NULL은 각각 따로 출력된다." }
  ]},
  { tp: "sub", b: [
    { h: "위치별 서브쿼리", tb: { c: ["위치", "이름", "제약"], r: [["SELECT 절", "스칼라 서브쿼리", "1행 1컬럼 (0행이면 NULL, 2행 이상이면 ORA-01427)"], ["FROM 절", "인라인 뷰", "별칭으로 테이블처럼 사용, ORDER BY 가능"], ["WHERE 절", "중첩 서브쿼리", "단일행이면 =, 다중행이면 IN/ANY/ALL/EXISTS"], ["HAVING 절", "그룹 조건 서브쿼리", ""]] } },
    { h: "다중 행 비교 연산자", tb: { c: ["연산", "같은 뜻"], r: [["> ALL (집합)", "> MAX"], ["> ANY (집합)", "> MIN"], ["< ALL (집합)", "< MIN"], ["< ANY (집합)", "< MAX"], ["= ANY", "IN"]] }, t: "공집합일 때: ALL은 항상 TRUE(모든 행 통과), ANY는 항상 FALSE(0건)." },
    { h: "연관 서브쿼리", t: "바깥 쿼리의 컬럼을 안에서 참조하므로 바깥 행마다 다시 실행된다. EXISTS는 존재 여부만 확인하므로 SELECT 1처럼 써도 된다." }
  ]},
  { tp: "set", b: [
    { h: "집합 연산자", tb: { c: ["연산자", "결과", "중복"], r: [["UNION", "합집합", "제거(정렬 발생 가능)"], ["UNION ALL", "합집합", "유지"], ["INTERSECT", "교집합", "제거"], ["MINUS (SQL Server: EXCEPT)", "차집합", "제거"]] } },
    { h: "규칙", t: "위아래 SELECT의 컬럼 수가 같고 데이터 타입이 호환되어야 한다. ORDER BY는 맨 마지막에 한 번만. 결과 컬럼 이름은 첫 번째 SELECT를 따른다. 집합 연산은 NULL끼리 같은 값으로 본다." }
  ]},
  { tp: "grp", b: [
    { h: "그룹 함수", tb: { c: ["함수", "만드는 조합", "개수"], r: [["ROLLUP(A, B)", "(A, B), (A), ()", "N + 1"], ["CUBE(A, B)", "(A, B), (A), (B), ()", "2^N"], ["GROUPING SETS(A, B)", "(A), (B) — 나열한 것만", "나열한 수"], ["ROLLUP((A, B), C)", "(A, B, C), (A, B), ()", "괄호 = 한 덩어리"]] }, memo: "ROLLUP은 오른쪽부터 하나씩 뺀다" },
    { h: "결과 행 수 세기", t: "조합마다 '실제로 존재하는 서로 다른 그룹 값의 수'를 세어 더한다. 원본 행 수가 아니다." },
    { h: "GROUPING 함수", t: "GROUPING(컬럼) = 1이면 그 컬럼이 집계되어 소계·총계 행에서 NULL로 표시된 것, 0이면 실제 그룹 값. CASE WHEN GROUPING(DEPT) = 1 THEN '전체' … 로 소계 라벨을 단다." }
  ]},
  { tp: "win", b: [
    { h: "기본 문법", code: "함수() OVER ([PARTITION BY 컬럼] [ORDER BY 컬럼] [ROWS | RANGE BETWEEN 시작 AND 끝])", t: "GROUP BY와 달리 행 수를 줄이지 않는다. WHERE 절에서 바로 쓸 수 없어 인라인 뷰로 감싼다." },
    { h: "순위 함수", tb: { c: ["함수", "90, 90, 85, 80"], r: [["RANK", "1, 1, 3, 4"], ["DENSE_RANK", "1, 1, 2, 3"], ["ROW_NUMBER", "1, 2, 3, 4"]] } },
    { h: "프레임 기본값", t: "ORDER BY가 없으면 파티션 전체, ORDER BY가 있으면 RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW. RANGE는 정렬 값이 같은 행을 한꺼번에 포함한다. ROWS는 물리적 행 단위다.", memo: "LAST_VALUE는 UNBOUNDED FOLLOWING 필수" },
    { h: "행 순서 함수", tb: { c: ["함수", "동작"], r: [["LAG(컬럼, n, 기본값)", "n행 앞의 값"], ["LEAD(컬럼, n, 기본값)", "n행 뒤의 값"], ["FIRST_VALUE / LAST_VALUE", "프레임의 처음 / 마지막 값"]] } },
    { h: "비율·분할 함수", tb: { c: ["함수", "계산"], r: [["CUME_DIST", "현재 값 이하 행 수 ÷ 전체 행 수"], ["PERCENT_RANK", "(RANK − 1) ÷ (전체 행 수 − 1)"], ["NTILE(n)", "n개 그룹으로 균등 분할, 나머지는 앞 그룹부터"], ["RATIO_TO_REPORT", "값 ÷ 파티션 합계"]] } }
  ]},
  { tp: "hier", b: [
    { h: "문법", code: "SELECT LEVEL, ENAME\n  FROM EMP\n START WITH MGR IS NULL          -- 루트 지정\nCONNECT BY PRIOR EMPNO = MGR    -- 전개 방향\n ORDER SIBLINGS BY ENAME;        -- 형제끼리만 정렬" },
    { h: "방향 판별", tb: { c: ["조건", "방향"], r: [["PRIOR 자식키 = 부모키 (PRIOR EMPNO = MGR)", "순방향 (위 → 아래)"], ["PRIOR 부모키 = 자식키 (PRIOR MGR = EMPNO)", "역방향 (아래 → 위)"]] }, memo: "PRIOR 쪽이 '이전 행'" },
    { h: "가상 컬럼·함수", tb: { c: ["이름", "의미"], r: [["LEVEL", "루트(시작 행) = 1부터 깊이"], ["CONNECT_BY_ISLEAF", "자식이 없으면 1"], ["CONNECT_BY_ISCYCLE", "순환 발생 행이면 1 (NOCYCLE과 함께)"], ["CONNECT_BY_ROOT 컬럼", "루트 행의 값"], ["SYS_CONNECT_BY_PATH(컬럼, '/')", "루트부터 현재까지 경로"]] } },
    { h: "조건 위치", t: "CONNECT BY 절 조건: 그 노드로 내려가지 않으므로 하위 가지 전체가 잘린다. WHERE 절 조건: 전개를 다 한 뒤 해당 행만 지운다. 루트 행은 START WITH 조건만 따른다. 출력은 깊이 우선 순서다." }
  ]},
  { tp: "topn", b: [
    { h: "ROWNUM", t: "WHERE 조건을 통과한 행에 1부터 차례로 붙는 의사 컬럼. ROWNUM = 1, ROWNUM <= n은 동작하지만 ROWNUM = 2, ROWNUM > 1은 항상 0건이다." },
    { h: "TOP-N 쿼리", code: "SELECT *\n  FROM (SELECT * FROM EMP ORDER BY SAL DESC)   -- 먼저 정렬\n WHERE ROWNUM <= 3;                            -- 그다음 자르기", t: "같은 쿼리 블록에서 WHERE ROWNUM <= 3 ORDER BY SAL을 쓰면 아무 3건을 고른 뒤 정렬하므로 틀린다." },
    { h: "FETCH 절 (Oracle 12c+)", t: "ORDER BY … OFFSET m ROWS FETCH FIRST n ROWS ONLY. WITH TIES를 쓰면 n번째와 동점인 행까지 포함. SQL Server는 TOP (n) [WITH TIES]." }
  ]},
  { tp: "pivot", b: [
    { h: "PIVOT (행 → 열)", code: "SELECT * FROM (SELECT DEPT, QTR, AMT FROM SALES)\nPIVOT (SUM(AMT) FOR QTR IN ('Q1' AS Q1, 'Q2' AS Q2));", t: "집계 함수 필수. FOR 컬럼의 값이 새 컬럼이 되고, 나머지 컬럼이 그룹 기준이 된다. 데이터가 없는 칸은 NULL. 필요한 컬럼만 인라인 뷰로 골라야 한다." },
    { h: "UNPIVOT (열 → 행)", code: "SELECT * FROM T UNPIVOT (AMT FOR QTR IN (Q1, Q2, Q3));", t: "기본값 EXCLUDE NULLS — NULL 칸은 행으로 만들지 않는다. INCLUDE NULLS로 포함할 수 있다." }
  ]},
  { tp: "regex", b: [
    {"h": "정규 표현식이란", "t": "글자의 '모양'을 기호로 적은 검색 패턴이다. 예를 들어 '숫자 3개 뒤에 하이픈'을 [0-9]{3}- 처럼 적는다.\nLIKE가 %와 _ 두 기호만 쓰는 간단한 패턴이라면, 정규 표현식은 기호가 훨씬 많은 정밀한 패턴이다."},
    {"h": "REGEXP_LIKE 기본 모양", "code": "SELECT NAME FROM T\n WHERE REGEXP_LIKE(PHONE, '^010-[0-9]{4}-[0-9]{4}$');\n-- REGEXP_LIKE(검사할 값, '패턴' [, '옵션'])  → 참/거짓", "t": "REGEXP_LIKE는 값을 돌려주는 함수가 아니라 참·거짓을 돌려주는 '조건'이다. 그래서 WHERE 절에 LIKE 자리 대신 쓴다.\n옵션: 'i' = 대소문자 무시, 'c' = 대소문자 구분(기본값)."},
    {"h": "LIKE와 가장 크게 다른 점 — 부분 일치", "tb": {"c": ["조건", "'A1234B'에 대해", "이유"], "r": [["LIKE '123'", "거짓", "LIKE는 문자열 전체가 패턴과 같아야 한다"], ["REGEXP_LIKE(s, '123')", "참", "정규식은 패턴이 문자열 어딘가에 들어 있기만 하면 참"], ["REGEXP_LIKE(s, '^123')", "거짓", "^ = 맨 앞에서 시작해야 한다"], ["REGEXP_LIKE(s, '^A[0-9]+B$')", "참", "^…$로 처음부터 끝까지 맞춰야 전체 일치"]]}, "memo": "정규식은 ^ $ 없으면 '어딘가에 있나?'"},
    {"h": "기호 하나씩 뜯어보기", "tb": {"c": ["기호", "뜻", "예시 패턴 → 맞는 값"], "r": [[".", "아무 글자 한 개", "'A.C' → ABC, A1C (AC는 X)"], ["^", "문자열의 시작", "'^A' → APPLE (BANANA는 X)"], ["$", "문자열의 끝", "'A$' → BANANA (APPLE은 X)"], ["[abc]", "괄호 안 글자 중 하나", "'[KL]G' → KG, LG"], ["[a-z] / [0-9]", "범위 안 글자 하나", "'[0-9]' → 숫자 한 개"], ["[^0-9]", "괄호 안 ^는 '그 외'", "숫자가 아닌 글자 하나"], ["*", "앞 글자 0번 이상", "'ab*c' → ac, abc, abbc"], ["+", "앞 글자 1번 이상", "'ab+c' → abc, abbc (ac는 X)"], ["?", "앞 글자 0번 또는 1번", "'colou?r' → color, colour"], ["{n} / {n,m}", "정확히 n번 / n~m번", "'[0-9]{3}' → 숫자 3개 연속"], ["A|B", "A 또는 B", "'^(KR|US)' → KR로 시작 또는 US로 시작"], ["( )", "묶음(그룹). \\1로 다시 참조", "'(ab)+' → ab, abab"], ["\\d / \\w / \\s", "숫자 / 영문·숫자·_ / 공백", "[[:digit:]], [[:alpha:]]도 같은 계열"]]}},
    {"h": "패턴 읽기 연습: '^010-[0-9]{4}-[0-9]{4}$'", "tb": {"c": ["조각", "뜻"], "r": [["^", "여기서 시작해서"], ["010-", "글자 그대로 010-"], ["[0-9]{4}", "숫자 정확히 4개"], ["-", "하이픈"], ["[0-9]{4}", "숫자 정확히 4개"], ["$", "여기서 끝"]]}, "t": "'010-1234-5678' → 참. '010-123-5678' → 거짓(가운데 3자리). 'TEL 010-1234-5678' → 거짓(^ 때문에 앞에 다른 글자가 있으면 안 됨). ^를 빼면 마지막 값도 참이 된다."},
    {"h": "정규식 함수 5개", "tb": {"c": ["함수", "돌려주는 것", "예 → 결과"], "r": [["REGEXP_LIKE(s, p)", "참/거짓 (조건)", "REGEXP_LIKE('ab12', '[0-9]') → 참"], ["REGEXP_SUBSTR(s, p, 시작, n번째)", "n번째로 맞은 문자열", "REGEXP_SUBSTR('A-12-BC', '[^-]+', 1, 2) → '12'"], ["REGEXP_INSTR(s, p, 시작, n번째)", "맞은 위치(숫자)", "REGEXP_INSTR('ab12', '[0-9]') → 3"], ["REGEXP_REPLACE(s, p, 바꿀 값)", "바꾼 문자열 (\\1로 그룹 참조)", "REGEXP_REPLACE('2024-11-14', '(\\d+)-(\\d+)-(\\d+)', '\\3/\\2') → '14/11'"], ["REGEXP_COUNT(s, p)", "맞은 횟수", "REGEXP_COUNT('banana', 'an') → 2"]]}},
    {"h": "최장 일치(Greedy) vs 최단 일치(Lazy)", "t": "*, +는 기본적으로 '가능한 한 길게' 잡는다. '<a><b>'에서 '<.+>'는 '<a><b>' 전체를 잡는다.\n뒤에 ?를 붙여 '+?', '*?'로 쓰면 '가능한 한 짧게' 잡아 '<a>'가 된다."},
    {"h": "REGEXP_SUBSTR ① 한 줄 정의", "t": "문자열에서 패턴에 맞는 '조각'을 잘라 오는 함수다. SUBSTR이 '몇 번째 글자부터 몇 글자'로 자른다면, REGEXP_SUBSTR은 '이런 모양인 부분'을 찾아서 잘라 온다.\n**맞는 조각이 없으면 오류가 아니라 NULL을 돌려준다.**", "memo": "REGEXP_SUBSTR = 모양으로 자르는 SUBSTR, 없으면 NULL"},
    {"h": "REGEXP_SUBSTR ② 인자 6개", "code": "REGEXP_SUBSTR(문자열, '패턴', 시작위치, 몇번째, '옵션', 그룹번호)\n--                          기본 1     기본 1   기본 'c'  기본 0", "tb": {"c": ["인자", "뜻", "생략하면"], "r": [["시작위치", "몇 번째 글자부터 찾기 시작할지", "1 (처음부터)"], ["몇번째(occurrence)", "맞는 조각 중 몇 번째 것을 가져올지", "1 (첫 번째 조각)"], ["옵션", "'i' 대소문자 무시, 'c' 구분", "대소문자 구분"], ["그룹번호(subexpr)", "패턴 속 ( ) 중 몇 번째 괄호 부분만 가져올지", "0 (맞은 부분 전체)"]]}},
    {"h": "REGEXP_SUBSTR ③ 왼쪽부터 훑어 조각 세기", "t": "'A-12-BC'에서 '[^-]+'(하이픈이 아닌 글자가 1개 이상 이어진 덩어리)를 찾는다. 왼쪽부터 훑으면서 맞는 덩어리를 차례로 센다.", "tb": {"c": ["글자 위치", "1", "2", "3", "4", "5", "6", "7"], "r": [["글자", "A", "-", "1", "2", "-", "B", "C"], ["조각", "1번째 조각", "(구분자)", "2번째 조각", "2번째 조각", "(구분자)", "3번째 조각", "3번째 조각"]]}},
    {"h": "REGEXP_SUBSTR ④ 결과 맞혀 보기 ('A-12-BC', '[^-]+')", "tb": {"c": ["식", "결과", "이유"], "r": [["REGEXP_SUBSTR(s, '[^-]+')", "'A'", "생략 → 처음부터, 첫 번째 조각"], ["REGEXP_SUBSTR(s, '[^-]+', 1, 2)", "'12'", "두 번째 조각"], ["REGEXP_SUBSTR(s, '[^-]+', 1, 3)", "'BC'", "세 번째 조각"], ["REGEXP_SUBSTR(s, '[^-]+', 1, 4)", "NULL", "네 번째 조각은 없다 (오류 아님)"], ["REGEXP_SUBSTR(s, '[^-]+', 3, 1)", "'12'", "3번째 글자('1')부터 찾은 첫 조각"], ["REGEXP_SUBSTR(s, '[^-]+', 4, 1)", "'2'", "4번째 글자('2')부터 찾으니 '1'은 이미 지나갔다"]]}, "memo": "시작위치 = 어디서부터 훑나 / 몇번째 = 몇 번째 조각을 가져오나"},
    {"h": "REGEXP_SUBSTR ⑤ 자주 나오는 실전 패턴", "tb": {"c": ["목적", "식", "결과"], "r": [["첫 번째 숫자 덩어리", "REGEXP_SUBSTR('a1b22c333', '[0-9]+')", "'1'"], ["세 번째 숫자 덩어리", "REGEXP_SUBSTR('a1b22c333', '[0-9]+', 1, 3)", "'333'"], ["이메일 아이디", "REGEXP_SUBSTR('kim@gmail.com', '[^@]+')", "'kim'"], ["이메일 도메인(@ 포함)", "REGEXP_SUBSTR('kim@gmail.com', '@[^.]+')", "'@gmail'"], ["대소문자 무시", "REGEXP_SUBSTR('Hello SQL', 'sql', 1, 1, 'i')", "'SQL'"]]}},
    {"h": "REGEXP_SUBSTR ⑥ 그룹번호(6번째 인자)", "code": "REGEXP_SUBSTR('02-123-4567', '(\\d+)-(\\d+)-(\\d+)', 1, 1, NULL, 2)  -- '123'\n--                             괄호1   괄호2   괄호3\nREGEXP_SUBSTR('02-123-4567', '(\\d+)-(\\d+)-(\\d+)', 1, 1, NULL, 0)  -- '02-123-4567' (0 = 전체)", "t": "패턴 전체가 맞은 다음, 그 안에서 n번째 괄호에 해당하는 부분만 돌려준다. 괄호는 여는 괄호 '('가 나오는 순서대로 1, 2, 3번이다. 5번째 인자(옵션)를 비워 두려면 NULL을 쓴다."},
    {"h": "REGEXP_SUBSTR ⑦ 61회형: 괄호 묶음 vs 한 글자 반복", "tb": {"c": ["식 ('XABBAC'에 대해)", "결과", "이유"], "r": [["'(A|B)+C'", "'ABBAC'", "(A 또는 B)가 1번 이상 반복 → A,B,B,A 다 먹고 C"], ["'[AB]+C'", "'ABBAC'", "[AB]도 'A 또는 B 한 글자'라 같은 뜻"], ["'AB+C'", "NULL", "+는 바로 앞 B 한 글자에만 붙는다: A + B 1개 이상 + C. ABB 다음이 A라 실패, 끝의 AC는 B가 없어 실패"]]}, "memo": "+는 바로 앞 한 덩어리에만 붙는다 — ( )로 묶으면 묶음 전체가 반복"},
    {"h": "REGEXP_SUBSTR ⑧ 길게 vs 짧게", "t": "'<a><b>'에서 '<.+>'는 가능한 한 길게 잡아 '<a><b>' 전체를, '<.+?>'는 가능한 한 짧게 잡아 '<a>'를 돌려준다. 시험에서는 ?가 '0 또는 1번'인지, 수량자 뒤에 붙어 '짧게'인지 구분하는 문제가 나온다."}
  ]},
  { tp: "dml", b: [
    { h: "DML", t: "INSERT, UPDATE, DELETE, MERGE. COMMIT 전에는 ROLLBACK으로 되돌릴 수 있다. 컬럼 목록을 생략한 INSERT는 모든 컬럼 값을 순서대로 줘야 하고, 생략된 컬럼에는 DEFAULT(없으면 NULL)가 들어간다." },
    { h: "MERGE", code: "MERGE INTO 대상 T USING 원본 S ON (T.ID = S.ID)\n WHEN MATCHED THEN UPDATE SET T.V = S.V [DELETE WHERE …]\n WHEN NOT MATCHED THEN INSERT (ID, V) VALUES (S.ID, S.V);", t: "원본(S) 행 기준으로 처리. 원본에 없는 대상 행은 변하지 않는다. ON 절 컬럼은 UPDATE할 수 없다." },
    { h: "제약조건", tb: { c: ["제약", "의미"], r: [["PRIMARY KEY", "UNIQUE + NOT NULL, 테이블당 1개"], ["UNIQUE", "중복 불가, NULL은 허용"], ["NOT NULL", "NULL 불가"], ["CHECK", "값의 범위·조건 제한"], ["FOREIGN KEY", "부모에 있는 값 또는 NULL만"]] } },
    { h: "참조 동작", tb: { c: ["옵션", "부모 삭제 시 자식"], r: [["(기본) RESTRICT/NO ACTION", "자식이 있으면 삭제 거부 (ORA-02292)"], ["ON DELETE CASCADE", "자식도 함께 삭제"], ["ON DELETE SET NULL", "자식의 FK를 NULL로"]] } }
  ]},
  { tp: "tcl", b: [
    { h: "TCL", t: "COMMIT(확정), ROLLBACK(취소), SAVEPOINT(중간 저장점). ROLLBACK TO 저장점은 그 저장점 이후의 변경만 되돌린다. 저장점 이름이 같으면 나중 것이 앞의 것을 덮어쓴다." },
    { h: "자동 커밋 (Oracle)", t: "DDL(CREATE, ALTER, DROP, TRUNCATE, RENAME)과 DCL은 실행 전후 자동 COMMIT. 따라서 앞에서 한 DML까지 확정된다. 정상 종료 시 COMMIT, 비정상 종료 시 ROLLBACK." },
    { h: "SQL Server와의 차이", t: "SQL Server는 기본이 AUTO COMMIT 모드이고, BEGIN TRANSACTION으로 명시적 트랜잭션을 시작한다. DDL도 트랜잭션 안에서 롤백할 수 있다." }
  ]},
  { tp: "ddl", b: [
    { h: "SQL 명령어 분류", tb: { c: ["분류", "명령어"], r: [["DDL", "CREATE, ALTER, DROP, RENAME, TRUNCATE"], ["DML", "INSERT, UPDATE, DELETE, MERGE (SELECT)"], ["DCL", "GRANT, REVOKE"], ["TCL", "COMMIT, ROLLBACK, SAVEPOINT"]] }, memo: "TRUNCATE는 DDL" },
    { h: "DELETE · TRUNCATE · DROP", tb: { c: ["항목", "DELETE", "TRUNCATE", "DROP"], r: [["분류", "DML", "DDL", "DDL"], ["ROLLBACK", "가능", "불가", "불가"], ["WHERE", "가능", "불가", "불가"], ["저장 공간", "유지", "반환", "반환"], ["구조", "남음", "남음", "삭제"]] } },
    { h: "ALTER TABLE (Oracle)", code: "ALTER TABLE EMP ADD (AGE NUMBER(3));\nALTER TABLE EMP MODIFY (ENAME VARCHAR2(50));\nALTER TABLE EMP RENAME COLUMN ENAME TO EMP_NAME;\nALTER TABLE EMP DROP COLUMN AGE;", t: "SQL Server는 ALTER COLUMN을 쓴다. CTAS(CREATE TABLE … AS SELECT)는 NOT NULL 제약만 복사하고 PK·FK 등 나머지 제약은 복사하지 않는다." },
    { h: "테이블·컬럼 이름 규칙", t: "문자로 시작, A-Z·a-z·0-9·_·$·# 만 사용, 예약어 불가, 같은 스키마 안에서 중복 불가." },
    { h: "권한 (DCL)", t: "GRANT 권한 ON 객체 TO 사용자 [WITH GRANT OPTION]. REVOKE 권한 ON 객체 FROM 사용자. 객체 권한을 WITH GRANT OPTION으로 받아 다시 준 경우, 처음 준 사람이 회수하면 연쇄 회수된다. 시스템 권한(WITH ADMIN OPTION)은 연쇄 회수되지 않는다. ROLE은 여러 권한을 묶어 관리하는 객체(예: CONNECT, RESOURCE)." },
    {"h": "ALTER TABLE: Oracle vs SQL Server", "tb": {"c": ["작업", "Oracle", "SQL Server"], "r": [["컬럼 추가", "ADD (C1 NUMBER, C2 DATE) — 여러 개 가능", "ADD C1 INT, C2 DATE — 여러 개 가능"], ["컬럼 변경", "MODIFY (C1 VARCHAR2(20), C2 NUMBER) — 괄호로 여러 개 가능", "ALTER COLUMN C1 VARCHAR(20) — 한 번에 한 컬럼만"], ["컬럼 이름 변경", "RENAME COLUMN A TO B", "sp_rename 'T.A', 'B', 'COLUMN'"], ["컬럼 삭제", "DROP COLUMN C1", "DROP COLUMN C1"]]}, "memo": "SQL Server ALTER COLUMN = 한 번에 하나"},
    {"h": "ALTER로 컬럼을 바꿀 때 안 되는 경우 (Oracle)", "t": "· 데이터가 들어 있는데 크기를 그보다 작게 줄이기 → 오류(들어 있는 값이 안 들어감).\n· 데이터가 있는 컬럼의 데이터 타입 바꾸기 → 컬럼이 비어 있어야 한다.\n· NULL 값이 있는 컬럼에 NOT NULL 걸기 → 오류.\n· 행이 있는 테이블에 DEFAULT 없이 NOT NULL 컬럼 추가 → 오류.\n· DEFAULT 값을 바꾸면 그 뒤에 입력하는 행부터 적용된다. 이미 있는 행은 안 바뀐다."},
    {"h": "TRUNCATE 핵심", "code": "TRUNCATE TABLE EMP;                  -- 정상: 전체 행 삭제\nTRUNCATE TABLE EMP WHERE DEPT = 10;  -- 오류: WHERE를 쓸 수 없다\nDELETE FROM EMP WHERE DEPT = 10;     -- 일부만 지울 땐 DELETE", "t": "**TRUNCATE는 '전부 비우기' 전용이라 WHERE를 쓸 수 없다.** DDL이라 Oracle에서는 자동 COMMIT되어 ROLLBACK으로 되돌릴 수 없고, DELETE 트리거도 동작하지 않는다. 테이블 구조는 남는다(DROP은 구조까지 삭제).\nSQL Server는 BEGIN TRAN 안에서 실행한 TRUNCATE를 ROLLBACK할 수 있다."}
  ]},
  { tp: "trap", b: [
    {"h": "시험 직전 한 줄 규칙 — 1과목", "tb": {"c": ["규칙", "틀리게 나오는 보기"], "r": [["엔터티는 인스턴스가 2개 이상이어야 한다 (예외 없음)", "인스턴스가 1개여도 중요하면 엔터티"], ["관계가 없어도 되는 건 통계·코드성 엔터티뿐", "모든 엔터티는 관계가 있어야 한다"], ["발생시점: 기본(고객) · 중심(주문) · 행위(주문상세, 이력)", "고객은 행위 엔터티"], ["2NF = 부분 종속 제거, 3NF = 이행 종속 제거, BCNF = 결정자가 모두 후보키", "2NF는 이행 종속 제거"], ["Barker 실선/점선 = 필수/선택, IE 실선/점선 = 식별/비식별", "Barker의 점선은 비식별 관계"], ["주식별자 = 유일성·최소성·불변성·존재성", "주식별자 값은 자주 바뀌어도 된다"], ["외부식별자 = 관계로 받은 식별자, 자기 엔터티의 주식별자가 아닐 수 있다", "외부식별자는 항상 주식별자다"], ["논리적 독립성 = 개념 스키마가 바뀌어도 외부 스키마 영향 없음", "내부 스키마 변경과 개념 스키마의 관계를 논리적 독립성이라 한다"]]}},
    {"h": "시험 직전 한 줄 규칙 — SELECT·함수", "tb": {"c": ["규칙", "틀리게 나오는 보기"], "r": [["WHERE에 집계 함수 불가 → HAVING", "WHERE AVG(SAL) > 100"], ["SELECT 별칭은 ORDER BY에서만", "GROUP BY 별칭 / WHERE 별칭"], ["GROUP BY 없이 HAVING 가능 (전체가 한 그룹)", "HAVING은 반드시 GROUP BY와 함께"], ["DISTINCT + SELECT에 없는 컬럼으로 ORDER BY → 오류", "정상 실행"], ["= NULL은 항상 0건, IS NULL을 써야 한다", "WHERE COMM = NULL로 NULL 행 조회"], ["BETWEEN a AND b는 양 끝 포함, a ≤ b여야 한다", "BETWEEN 100 AND 50도 같은 결과"], ["NOT IN 목록에 NULL이 있으면 0건", "NULL은 무시된다"], ["COUNT(*)는 NULL 행 포함, COUNT(컬럼)은 제외", "COUNT(컬럼)도 NULL 포함"], ["ISNULL(1, 2) = 1 (SQL Server), Oracle은 NVL", "ISNULL(1, 2) = 2"], ["NULLIF(a, b): 같으면 NULL, 다르면 a", "다르면 b"], ["윈도우 함수는 WHERE에 못 쓴다 → 인라인 뷰", "WHERE RANK() OVER(…) <= 3"], ["ROWNUM > 1, ROWNUM = 2 → 0건", "2번째 행이 나온다"], ["집합 연산 결과의 컬럼 이름은 첫 SELECT 기준, ORDER BY는 맨 끝 한 번", "두 번째 SELECT의 별칭으로 정렬"]]}},
    {"h": "시험 직전 한 줄 규칙 — DDL·DML·TCL", "tb": {"c": ["규칙", "틀리게 나오는 보기"], "r": [["TRUNCATE는 WHERE 불가", "TRUNCATE TABLE T WHERE …"], ["TRUNCATE·DROP은 DDL → Oracle 자동 COMMIT, 롤백 불가", "TRUNCATE 후 ROLLBACK하면 복구"], ["DDL 실행 전에 한 DML도 함께 확정된다 (Oracle)", "앞의 INSERT는 ROLLBACK된다"], ["SQL Server ALTER COLUMN은 한 번에 한 컬럼", "ALTER COLUMN C1 …, C2 …"], ["Oracle MODIFY는 괄호로 여러 컬럼 가능", "MODIFY는 한 컬럼만"], ["Oracle 컬럼 이름 변경 = RENAME COLUMN a TO b", "ALTER COLUMN으로 이름 변경"], ["PK는 테이블당 1개, UNIQUE는 NULL 허용", "UNIQUE 컬럼에 NULL 입력 불가"], ["CTAS는 NOT NULL만 복사 (PK·FK·DEFAULT 등은 X)", "PK 제약까지 복사"], ["WITH GRANT OPTION 회수 → 연쇄 회수, WITH ADMIN OPTION → 연쇄 회수 없음", "둘 다 연쇄 회수"], ["ROLLBACK TO 저장점 → 그 이후만 취소, 트랜잭션은 계속", "ROLLBACK TO 후 트랜잭션 종료"]]}}
  ]}
];

// 암기카드: f(앞면 질문) / b(뒷면 답)
window.CARDS = [
  { tp: "schema", f: "데이터 모델링 3대 특성", b: "추상화 · 단순화 · 명확화 (단·추·명)" },
  { tp: "schema", f: "모델링 진행 단계와 각 단계의 핵심", b: "개념적(ERD, 추상화 최고) → 논리적(정규화, 식별자 확정) → 물리적(반정규화, 인덱스, 구체화 최고)" },
  { tp: "schema", f: "논리적 독립성 vs 물리적 독립성", b: "개념 스키마 변경 → 외부 스키마 무영향 = 논리적\n내부 스키마 변경 → 개념·외부 무영향 = 물리적" },
  { tp: "schema", f: "모델링 유의점 3가지", b: "중복성 · 비유연성 · 비일관성" },
  { tp: "schema", f: "모델링의 3가지 관점", b: "데이터 관점(What) · 프로세스 관점(How) · 상관 관점(Interaction)" },
  { tp: "entity", f: "엔터티 성립 조건", b: "업무 필요 · 유일 식별자 · 인스턴스 2개 이상 · 업무 프로세스 이용 · 속성 보유 · 관계 1개 이상" },
  { tp: "entity", f: "유무형 기준 엔터티 분류", b: "유형(사원) · 개념(보험상품) · 사건(주문)" },
  { tp: "entity", f: "발생시점 기준 엔터티 분류", b: "기본(고객, 독립 생성) · 중심(주문) · 행위(주문상세, 이력)" },
  { tp: "attr", f: "파생 속성의 원칙", b: "계산된 값이라 정합성 위험 → 최소화" },
  { tp: "attr", f: "도메인이란?", b: "속성이 가질 수 있는 값의 범위 (타입·길이·제약)" },
  { tp: "rel", f: "관계 표기 3요소", b: "관계명 · 관계차수(1:1, 1:M, M:N) · 관계선택사양(필수/선택)" },
  { tp: "rel", f: "배타 관계(Arc)", b: "한 인스턴스가 여러 후보 엔터티 중 하나와만 관계 (예: 개인고객 또는 법인고객)" },
  { tp: "ident", f: "주식별자 4대 특성", b: "유일성 · 최소성 · 불변성 · 존재성" },
  { tp: "ident", f: "대체키란?", b: "기본키로 선택되지 않은 나머지 후보키 (유일성·최소성 만족)" },
  { tp: "ident", f: "식별자 관계의 표기와 상속 위치", b: "실선 / Barker 식별자 바 있음 / 부모 PK가 자식 PK의 일부로" },
  { tp: "ident", f: "본질식별자 vs 인조식별자", b: "본질: 업무에 의해 만들어지는 식별자\n인조: 인위적으로 만든 일련번호 (중복 데이터 위험, 별도 인덱스 필요)" },
  { tp: "norm", f: "2NF가 제거하는 것", b: "부분 함수 종속 (복합 PK의 일부 → 일반 속성)" },
  { tp: "norm", f: "3NF가 제거하는 것", b: "이행 함수 종속 (PK → 일반 속성 → 일반 속성)" },
  { tp: "norm", f: "BCNF 조건", b: "모든 결정자가 후보키" },
  { tp: "norm", f: "대용량 컬럼을 떼어 내는 분할", b: "수직 분할 (컬럼 기준). 행 기준은 수평 분할" },
  { tp: "acid", f: "ACID", b: "원자성(All or Nothing) · 일관성 · 고립성(중간 결과 안 보임) · 지속성(영구 보존)" },
  { tp: "basic", f: "SELECT 논리적 실행 순서", b: "FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY" },
  { tp: "basic", f: "SELECT 별칭을 쓸 수 있는 절", b: "ORDER BY만 (WHERE·GROUP BY·HAVING 불가)" },
  { tp: "basic", f: "논리 연산자 우선순위", b: "NOT > AND > OR" },
  { tp: "basic", f: "Oracle에서 NULL의 정렬 위치", b: "최댓값 취급: ASC 맨 뒤, DESC 맨 앞 (SQL Server는 반대)" },
  { tp: "agg", f: "COUNT(*) vs COUNT(컬럼)", b: "COUNT(*)는 NULL 포함 전체 행, COUNT(컬럼)은 NULL 제외" },
  { tp: "agg", f: "AVG(col)과 AVG(NVL(col, 0))의 차이", b: "분모가 다르다: NULL 아닌 행 수 vs 전체 행 수" },
  { tp: "agg", f: "WHERE 1 = 2일 때 COUNT(*), SUM", b: "0, NULL (1행 반환). GROUP BY가 있으면 0행" },
  { tp: "nullfn", f: "NVL2(A, B, C)", b: "A가 NULL이 아니면 B, NULL이면 C" },
  { tp: "nullfn", f: "NULLIF(A, B)", b: "A = B면 NULL, 다르면 A" },
  { tp: "nullfn", f: "DECODE(NULL, NULL, 'Y', 'N')", b: "'Y' — DECODE는 NULL끼리 같다고 본다 (CASE는 'N')" },
  { tp: "notin", f: "NOT IN 서브쿼리 결과에 NULL이 있으면?", b: "항상 0건 (AND 연결 + UNKNOWN)" },
  { tp: "notin", f: "TRUE AND UNKNOWN / TRUE OR UNKNOWN", b: "UNKNOWN / TRUE" },
  { tp: "notin", f: "NULL끼리 같은 값으로 보는 곳", b: "DISTINCT, GROUP BY, 집합 연산, DECODE" },
  { tp: "fn", f: "FLOOR(-15.75), CEIL(-15.75), TRUNC(-15.75)", b: "-16, -15, -15" },
  { tp: "fn", f: "INSTR('DATABASE', 'A', 1, 3)", b: "6" },
  { tp: "fn", f: "Oracle: 'A' || NULL, LENGTH('')", b: "'A', NULL" },
  { tp: "join", f: "E.DEPTNO(+) = D.DEPTNO 를 ANSI로", b: "EMP E RIGHT OUTER JOIN DEPT D (DEPT 보존)" },
  { tp: "join", f: "NATURAL JOIN에서 공통 컬럼에 접두사를 붙이면?", b: "오류 ORA-25155 (USING도 동일)" },
  { tp: "join", f: "아우터 조인 후 안쪽 테이블 컬럼에 WHERE 조건", b: "NULL 행이 지워져 이너 조인처럼 동작" },
  { tp: "sub", f: "> ALL / > ANY 의 의미", b: "> 최댓값 / > 최솟값" },
  { tp: "sub", f: "스칼라 서브쿼리가 2행을 반환하면?", b: "ORA-01427 오류 (0행이면 NULL)" },
  { tp: "sub", f: "> ALL (공집합)", b: "TRUE — 모든 행 통과" },
  { tp: "set", f: "집합 연산자의 ORDER BY 위치·컬럼 이름", b: "맨 마지막에 한 번 / 첫 번째 SELECT의 이름" },
  { tp: "grp", f: "ROLLUP(A, B)가 만드는 조합", b: "(A, B), (A), ()" },
  { tp: "grp", f: "CUBE(A, B)가 만드는 조합", b: "(A, B), (A), (B), ()" },
  { tp: "grp", f: "ROLLUP((A, B))", b: "(A, B), () — 괄호 안은 한 덩어리" },
  { tp: "grp", f: "GROUPING(컬럼) = 1의 의미", b: "그 컬럼이 집계되어 NULL로 표시된 소계·총계 행" },
  { tp: "win", f: "RANK / DENSE_RANK / ROW_NUMBER (90, 90, 85)", b: "1,1,3 / 1,1,2 / 1,2,3" },
  { tp: "win", f: "ORDER BY만 있을 때 기본 프레임", b: "RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW (동일값 한꺼번에)" },
  { tp: "win", f: "LAST_VALUE로 진짜 마지막 값을 얻으려면", b: "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING" },
  { tp: "win", f: "NTILE(3)으로 7행 나누기", b: "3, 2, 2 (나머지는 앞 그룹부터)" },
  { tp: "hier", f: "PRIOR EMPNO = MGR", b: "순방향 (부모 → 자식, Top-Down)" },
  { tp: "hier", f: "PRIOR MGR = EMPNO", b: "역방향 (자식 → 부모, Bottom-Up)" },
  { tp: "hier", f: "CONNECT BY 조건 vs WHERE 조건", b: "CONNECT BY: 하위 가지째 제외 / WHERE: 그 행만 제외" },
  { tp: "hier", f: "CONNECT_BY_ISLEAF", b: "자식이 없는 단말 노드면 1, 아니면 0" },
  { tp: "topn", f: "WHERE ROWNUM = 2 의 결과", b: "항상 0건" },
  { tp: "topn", f: "올바른 TOP-N 쿼리 구조", b: "인라인 뷰에서 ORDER BY → 바깥에서 ROWNUM <= n" },
  { tp: "topn", f: "FETCH FIRST n ROWS WITH TIES", b: "n번째 행과 정렬 값이 같은 행까지 포함" },
  { tp: "pivot", f: "PIVOT에서 데이터가 없는 칸", b: "NULL (0이 아님)" },
  { tp: "pivot", f: "UNPIVOT 기본 옵션", b: "EXCLUDE NULLS (NULL 칸은 행으로 안 만듦)" },
  { tp: "regex", f: "REGEXP_SUBSTR('A12B345', '[0-9]+', 1, 2)", b: "'345'" },
  { tp: "regex", f: "정규식 + * ? 의 차이", b: "+ 1회 이상, * 0회 이상, ? 0 또는 1회" },
  { tp: "dml", f: "MERGE에서 원본에 없는 대상 행은?", b: "변하지 않는다" },
  { tp: "dml", f: "FK 컬럼에 NULL 입력", b: "가능 (NOT NULL 제약이 따로 없으면)" },
  { tp: "dml", f: "ON DELETE SET NULL vs CASCADE", b: "자식 남기고 FK만 NULL / 자식도 삭제" },
  { tp: "tcl", f: "ROLLBACK TO SP1", b: "SP1 이후의 변경만 취소" },
  { tp: "tcl", f: "Oracle에서 DDL 실행 시 트랜잭션", b: "자동 COMMIT — 앞의 DML까지 확정" },
  { tp: "ddl", f: "TRUNCATE의 분류와 특징", b: "DDL, ROLLBACK 불가, WHERE 불가, 저장 공간 반환" },
  { tp: "ddl", f: "Oracle 컬럼 변경 문법", b: "ALTER TABLE … MODIFY (SQL Server는 ALTER COLUMN)" },
  { tp: "ddl", f: "WITH GRANT OPTION 권한 회수", b: "연쇄 회수 (ADMIN OPTION은 연쇄 안 됨)" },
  { tp: "ddl", f: "CTAS가 복사하는 제약", b: "NOT NULL만 (PK·FK·UNIQUE·CHECK는 복사 안 됨)" },
  { tp: "entity", f: "발생시점 기준 엔터티 3종 판별법", b: "혼자 생김 → 기본(고객·상품) / 기본에서 생긴 업무 중심 → 중심(주문·계약) / 부모 2개 이상, 상세·이력 → 행위(주문상세·변경이력)" },
  { tp: "entity", f: "엔터티 성립 조건 중 예외가 있는 것", b: "'관계 1개 이상'만 예외(통계·코드성). 인스턴스 2개 이상은 예외 없음" },
  { tp: "norm", f: "함수 종속 X → Y의 뜻", b: "X 값을 알면 Y 값이 하나로 정해진다 (X = 결정자, Y = 종속자)" },
  { tp: "norm", f: "PK {A,B}, B → D 이면?", b: "B는 PK 일부 → D는 부분 종속 → 2NF: R1(A,B,C,E) + R2(B,D)" },
  { tp: "norm", f: "결정자 종류별 정규형", b: "PK 일부 → 2NF / 일반 속성 → 3NF / 후보키 아닌 결정자 → BCNF" },
  { tp: "rel", f: "Barker vs IE: 실선·점선의 뜻", b: "Barker = 필수/선택(참여), IE = 식별/비식별 관계" },
  { tp: "rel", f: "Barker 속성 기호 # * o", b: "# 식별자, * 필수 속성, o 선택 속성" },
  { tp: "rel", f: "IE 선 끝 기호 O< |< || O|", b: "O< 0 이상 / |< 1 이상 / || 정확히 1 / O| 0 또는 1" },
  { tp: "rel", f: "Barker 식별 관계 표시", b: "관계선을 가로지르는 짧은 막대(UID 바)" },
  { tp: "nullfn", f: "ISNULL(1, 2) / ISNULL(NULL, 2)", b: "1 / 2 — SQL Server 함수, Oracle의 NVL과 같다" },
  { tp: "nullfn", f: "NULLIF(5, 5) / NULLIF(5, 3)", b: "NULL / 5 (같으면 NULL, 다르면 첫 값)" },
  { tp: "nullfn", f: "COALESCE(NULL, NULL, 3, 4)", b: "3 — 왼쪽부터 처음 NULL이 아닌 값" },
  { tp: "ddl", f: "TRUNCATE에 WHERE?", b: "불가. 일부만 지우려면 DELETE. TRUNCATE는 DDL → Oracle 자동 커밋, 롤백 불가" },
  { tp: "ddl", f: "SQL Server ALTER COLUMN", b: "한 번에 한 컬럼만 변경. Oracle MODIFY는 괄호로 여러 개 가능" },
  { tp: "ddl", f: "컬럼 이름 바꾸기", b: "Oracle: ALTER TABLE T RENAME COLUMN A TO B / SQL Server: sp_rename" },
  { tp: "agg", f: "WHERE AVG(SAL) > 300", b: "오류(ORA-00934). 집계 조건은 HAVING에" },
  { tp: "regex", f: "REGEXP_LIKE vs LIKE 가장 큰 차이", b: "정규식은 ^ $ 없으면 부분 일치(어딘가에 있으면 참), LIKE는 전체 일치" },
  { tp: "regex", f: "REGEXP_SUBSTR('A-12-BC', '[^-]+', 1, 2)", b: "'12' — 하이픈이 아닌 글자 덩어리 중 두 번째" },
  { tp: "regex", f: "[abc] vs [^abc] vs ^abc", b: "그중 한 글자 / 그 외 한 글자 / abc로 시작" },
  { tp: "regex", f: "+ * ? {3}", b: "1번 이상 / 0번 이상 / 0 또는 1번 / 정확히 3번" },
  { tp: "regex", f: "REGEXP_SUBSTR 인자 순서", b: "(문자열, 패턴, 시작위치, 몇번째, 옵션, 그룹번호) — 기본값 1, 1, 'c', 0" },
  { tp: "regex", f: "REGEXP_SUBSTR('A-12-BC', '[^-]+', 1, 4)", b: "NULL (네 번째 조각 없음, 오류 아님)" },
  { tp: "regex", f: "REGEXP_SUBSTR('A-12-BC', '[^-]+', 4, 1)", b: "'2' — 4번째 글자부터 훑으니 '1'은 지나감" },
  { tp: "regex", f: "'(A|B)+C' vs 'AB+C' ('XABBAC')", b: "'ABBAC' vs NULL — +는 바로 앞 한 덩어리에만 붙는다" },
  { tp: "regex", f: "REGEXP_SUBSTR(…, '(\\d+)-(\\d+)', 1, 1, NULL, 2)", b: "2번째 괄호 부분만 (0이면 전체)" }
];
