# 브라우저 점검

실제 브라우저(Playwright · Chromium)로 화면을 열어 기능을 확인한다. 저장소 루트에서 정적 서버를 켠 뒤 실행한다.

```bash
python3 -m http.server 8765 &
node tools/ui-tests/all-questions-and-sets.cjs   # 250문항 해설·모의고사 5회 열기, 화면 넘침·오류 확인
node tools/ui-tests/today-count.cjs              # 오늘 푼 문제: 처음 온 사람 / 시각 없는 옛 기록 / 다시 열기 / +1
node tools/ui-tests/today-count-next-day.cjs     # 다음 날 처음 열 때 '어제' 기록
node tools/ui-tests/bookmarks.cjs                # 문제·개념 북마크
node tools/ui-tests/guess.cjs                    # 찍어서 맞힌 문제 → 오답노트
```
