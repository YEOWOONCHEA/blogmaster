// ============================================================
// BlogMaster AI – script.js
// ============================================================

// ── 데이터 ──────────────────────────────────────────────────
const KEYWORD_DB = {
  "실손보험": {
    volume: "48,200", competition: "중간", cpc: "2,300원",
    related: [
      { kw: "실손보험 청구 방법 2026", vol: "12,400", comp: "낮음", cpc: "2,800원", profit: 5 },
      { kw: "실손보험 비급여 청구 서류", vol: "8,700", comp: "낮음", cpc: "3,100원", profit: 5 },
      { kw: "실손보험 갱신 거절 사유", vol: "5,200", comp: "낮음", cpc: "2,600원", profit: 4 },
      { kw: "실손보험 환급 방법", vol: "9,800", comp: "낮음", cpc: "2,400원", profit: 4 },
      { kw: "4세대 실손보험 비교", vol: "15,300", comp: "중간", cpc: "3,500원", profit: 5 },
      { kw: "실손보험 한도 초과 시 처리", vol: "3,600", comp: "낮음", cpc: "2,100원", profit: 3 },
    ],
    ideas: [
      "2026년 실손보험 청구 방법 A to Z – 모르면 손해!",
      "실손보험 비급여 서류 완벽 정리 (병원별 차이 포함)",
      "4세대 실손보험으로 바꿔야 할까? 장단점 솔직 비교",
      "실손보험 갱신 거절당했을 때 대처법 5가지",
      "실손보험 환급 못 받는 이유와 해결 방법",
    ]
  },
  "청년도약계좌": {
    volume: "31,500", competition: "낮음", cpc: "1,800원",
    related: [
      { kw: "청년도약계좌 신청 자격 2026", vol: "14,200", comp: "낮음", cpc: "2,200원", profit: 5 },
      { kw: "청년도약계좌 vs 청년희망적금", vol: "7,800", comp: "낮음", cpc: "1,900원", profit: 4 },
      { kw: "청년도약계좌 중도해지 불이익", vol: "4,300", comp: "낮음", cpc: "1,600원", profit: 3 },
      { kw: "청년도약계좌 정부기여금 계산", vol: "5,900", comp: "낮음", cpc: "2,000원", profit: 4 },
      { kw: "청년도약계좌 은행별 금리 비교", vol: "9,100", comp: "낮음", cpc: "2,100원", profit: 5 },
    ],
    ideas: [
      "청년도약계좌 2026 신청 자격 총정리 (소득기준 포함)",
      "청년도약계좌 vs 청년희망적금 어느 게 더 유리할까?",
      "청년도약계좌 정부기여금 계산법 + 실수령액 시뮬레이션",
      "청년도약계좌 은행별 금리 비교 – 어디가 제일 높나?",
      "청년도약계좌 중도해지 시 손해 얼마나 될까?",
    ]
  },
  "연말정산": {
    volume: "120,000", competition: "높음", cpc: "1,200원",
    related: [
      { kw: "연말정산 환급금 조회 방법", vol: "42,000", comp: "중간", cpc: "1,500원", profit: 4 },
      { kw: "연말정산 의료비 공제 한도 2026", vol: "18,500", comp: "낮음", cpc: "1,800원", profit: 5 },
      { kw: "연말정산 부양가족 등록 조건", vol: "23,400", comp: "낮음", cpc: "1,600원", profit: 4 },
      { kw: "연말정산 월세 세액공제 방법", vol: "16,700", comp: "낮음", cpc: "1,900원", profit: 5 },
      { kw: "맞벌이 연말정산 절세 전략", vol: "8,200", comp: "낮음", cpc: "2,100원", profit: 5 },
    ],
    ideas: [
      "2026 연말정산 환급금 조회 방법 – 5분이면 완료!",
      "연말정산 의료비 공제 한도와 빠뜨리기 쉬운 항목",
      "연말정산 월세 세액공제 신청 방법 (세입자 필독)",
      "맞벌이 부부 연말정산 몰아주기 전략 완벽 가이드",
      "연말정산 부양가족 기준 – 부모님/자녀 등록 조건은?",
    ]
  },
  "다이어트 식단": {
    volume: "67,800", competition: "높음", cpc: "800원",
    related: [
      { kw: "다이어트 식단 일주일 식단표", vol: "22,000", comp: "중간", cpc: "900원", profit: 3 },
      { kw: "저탄고지 다이어트 식단표", vol: "15,600", comp: "중간", cpc: "1,100원", profit: 4 },
      { kw: "간헐적 단식 1주일 식단", vol: "18,900", comp: "낮음", cpc: "950원", profit: 4 },
      { kw: "다이어트 식단 배달 추천", vol: "9,400", comp: "낮음", cpc: "1,300원", profit: 4 },
      { kw: "1200칼로리 식단 구성 방법", vol: "7,200", comp: "낮음", cpc: "850원", profit: 3 },
    ],
    ideas: [
      "간헐적 단식 1주일 식단표 + 주의사항 완벽 정리",
      "저탄고지 다이어트 초보자 식단 7일 계획",
      "다이어트 배달 음식 추천 BEST 10 – 먹으면서 빼자",
      "1200칼로리 식단 구성 방법 (아침/점심/저녁별 예시)",
      "야식 먹으면서 다이어트하는 현실 식단",
    ]
  },
  "자동차보험": {
    volume: "85,400", competition: "높음", cpc: "4,200원",
    related: [
      { kw: "자동차보험 갱신 vs 신규 차이", vol: "12,300", comp: "낮음", cpc: "4,800원", profit: 5 },
      { kw: "자동차보험 특약 종류와 추가 방법", vol: "8,900", comp: "낮음", cpc: "3,900원", profit: 5 },
      { kw: "자동차보험 다이렉트 비교 방법", vol: "28,400", comp: "중간", cpc: "5,100원", profit: 5 },
      { kw: "자동차보험료 절약하는 법 10가지", vol: "6,700", comp: "낮음", cpc: "3,500원", profit: 4 },
      { kw: "자동차보험 사고 후 처리 순서", vol: "14,800", comp: "낮음", cpc: "3,200원", profit: 4 },
    ],
    ideas: [
      "자동차보험 다이렉트 비교 사이트 총정리 2026",
      "자동차보험 특약 꼭 필요한 것 vs 불필요한 것",
      "자동차보험료 10만원 절약하는 현실 꿀팁 7가지",
      "자동차보험 갱신 전 꼭 확인해야 할 체크리스트",
      "사고 났을 때 자동차보험 처리 절차 A to Z",
    ]
  }
};

const REALTIME_KEYWORDS = [
  { rank: 1, kw: "삼성전자 주가", badge: "new" },
  { rank: 2, kw: "2026 청년도약계좌", badge: "rise" },
  { rank: 3, kw: "태풍 경로 2026", badge: "new" },
  { rank: 4, kw: "연말정산 환급금 조회", badge: null },
  { rank: 5, kw: "롤드컵 결과", badge: "new" },
  { rank: 6, kw: "실손보험 청구 방법", badge: null },
  { rank: 7, kw: "오늘 날씨", badge: null },
  { rank: 8, kw: "배달의민족 쿠폰", badge: "rise" },
  { rank: 9, kw: "근로장려금 신청 2026", badge: "rise" },
  { rank: 10, kw: "다이어트 식단 추천", badge: null },
  { rank: 11, kw: "아이폰 17 출시일", badge: "new" },
  { rank: 12, kw: "청약 당첨 확인", badge: null },
  { rank: 13, kw: "한국 야구 중계", badge: null },
  { rank: 14, kw: "주택담보대출 금리", badge: "rise" },
  { rank: 15, kw: "공모주 청약 일정", badge: null },
  { rank: 16, kw: "비트코인 시세", badge: "rise" },
  { rank: 17, kw: "넷플릭스 신작", badge: null },
  { rank: 18, kw: "의료비 세액공제", badge: null },
  { rank: 19, kw: "자동차보험 비교", badge: null },
  { rank: 20, kw: "카카오페이 주가", badge: "new" },
];

const BLOG_CONTENT_TEMPLATES = {
  "실손보험 청구 방법 2026": `
<h1>2026년 실손보험 청구 방법 A to Z – 모르면 손해!</h1>
<div class="meta-tags">
  <span class="tag">#실손보험</span><span class="tag">#보험청구</span>
  <span class="tag">#의료비절약</span><span class="tag">#2026실손보험</span>
</div>
<div class="highlight-box">
  💡 <strong>핵심 요약:</strong> 실손보험은 병원 영수증만 있으면 누구나 청구할 수 있습니다. 이 글에서는 비급여 항목 포함 청구 서류, 온라인 청구 방법, 자주 거절당하는 이유까지 모두 알려드립니다.
</div>
<h2>✅ 실손보험 청구 기본 서류</h2>
<p>실손보험을 청구하기 위해 필요한 기본 서류는 다음과 같습니다.</p>
<ul>
  <li><strong>진료비 영수증</strong> (원본 또는 사본)</li>
  <li><strong>진료비 세부 내역서</strong> (항목별 금액 표시)</li>
  <li><strong>진단서 또는 소견서</strong> (입원의 경우 필수)</li>
  <li><strong>신분증 사본</strong></li>
</ul>
<h2>✅ 온라인으로 쉽게 청구하는 방법</h2>
<p>2026년 현재 대부분의 보험사 앱에서 모바일 청구가 가능합니다. 병원 영수증을 카메라로 찍어 업로드하면 평균 3~5일 이내 입금됩니다.</p>
<ol>
  <li>보험사 앱 다운로드 → 로그인</li>
  <li>보험금 청구 메뉴 선택</li>
  <li>서류 촬영 업로드</li>
  <li>계좌 입력 → 제출</li>
</ol>
<h2>✅ 비급여 항목도 청구 가능한가요?</h2>
<p>네! 비급여 항목(MRI, 초음파, 도수치료 등)도 가입한 플랜에 따라 청구 가능합니다. 단, <strong>4세대 실손보험</strong>은 비급여 청구 비율에 따라 보험료가 달라질 수 있으니 주의하세요.</p>
<h2>✅ 청구 거절 주요 이유와 대처법</h2>
<p>실손보험 청구가 거절되는 대표적인 이유는 다음과 같습니다:</p>
<ul>
  <li>면책 기간 내 발생한 질병 (가입 후 90일 이내)</li>
  <li>고지 의무 위반 (기존 질환 미신고)</li>
  <li>약관에서 제외된 비급여 항목</li>
</ul>
<p>거절을 받았다면 <strong>이의신청</strong>을 통해 재검토를 요청할 수 있습니다.</p>
<div class="seo-meta">
  <h3>🔍 SEO 메타 정보</h3>
  <p><strong>메타 제목:</strong> 2026 실손보험 청구 방법 완벽 가이드 | BlogMaster AI</p>
  <p><strong>메타 설명:</strong> 실손보험 청구 서류부터 온라인 청구 방법, 비급여 청구까지 2026년 최신 정보로 총정리했습니다. 모르면 손해 보는 실손보험 청구 꿀팁!</p>
  <div class="hashtags">
    <span class="hashtag">#실손보험청구</span>
    <span class="hashtag">#의료비절약</span>
    <span class="hashtag">#보험정보</span>
    <span class="hashtag">#2026보험</span>
    <span class="hashtag">#비급여청구</span>
  </div>
</div>`,

  default: (keyword, type, lang) => {
    const typeLabels = { info: "정보/안내", review: "리뷰/후기", compare: "비교/분석", howto: "방법/가이드", news: "뉴스/트렌드", list: "리스트/추천" };
    const typeLabel = typeLabels[type] || "정보";
    return `
<h1>${keyword} – ${typeLabel} 완벽 가이드 (2026)</h1>
<div class="meta-tags">
  <span class="tag">#${keyword.replace(/\s+/g, "")}</span>
  <span class="tag">#2026</span>
  <span class="tag">#정보</span>
  <span class="tag">#가이드</span>
</div>
<div class="highlight-box">
  💡 <strong>이 글에서 알 수 있는 것:</strong> ${keyword}에 대한 최신 정보와 실용적인 팁을 한 번에 정리했습니다.
</div>
<h2>✅ ${keyword}란 무엇인가요?</h2>
<p>${keyword}은(는) 많은 분들이 관심을 갖고 있는 주제입니다. 이 글에서는 기초 개념부터 실용적인 활용 방법까지 쉽게 설명드리겠습니다.</p>
<h2>✅ ${keyword} 핵심 포인트 3가지</h2>
<ul>
  <li><strong>첫째,</strong> 기본 개념을 이해하고 시작하세요</li>
  <li><strong>둘째,</strong> 본인의 상황에 맞는 방법을 선택하세요</li>
  <li><strong>셋째,</strong> 꾸준히 실천하는 것이 핵심입니다</li>
</ul>
<h2>✅ 자주 묻는 질문 (FAQ)</h2>
<h3>Q. ${keyword}를 처음 시작하는 분들에게 추천하는 방법은?</h3>
<p>처음 시작하시는 분들은 기본 개념부터 익히고, 단계적으로 심화 내용을 학습하는 것을 추천드립니다.</p>
<h3>Q. ${keyword} 관련해서 주의해야 할 점은?</h3>
<p>잘못된 정보나 과장된 광고에 현혹되지 않도록 주의하세요. 항상 공식 출처의 정보를 확인하시기 바랍니다.</p>
<h2>✅ 마무리</h2>
<p>이 글이 도움이 되셨다면 공유해 주세요! 추가 궁금한 점은 댓글로 남겨주시면 답변드리겠습니다.</p>
<div class="seo-meta">
  <h3>🔍 SEO 메타 정보</h3>
  <p><strong>메타 제목:</strong> ${keyword} 완벽 가이드 2026 | BlogMaster AI</p>
  <p><strong>메타 설명:</strong> ${keyword}에 대한 최신 정보를 총정리했습니다. 초보자도 쉽게 이해할 수 있는 단계별 가이드를 확인하세요!</p>
  <div class="hashtags">
    <span class="hashtag">#${keyword.replace(/\s+/g, "")}</span>
    <span class="hashtag">#정보글</span>
    <span class="hashtag">#2026</span>
    <span class="hashtag">#블로그</span>
    <span class="hashtag">#가이드</span>
  </div>
</div>`;
  }
};

// ── 상태 ────────────────────────────────────────────────────
let activeTab = "keyword";
let activeTone = "friendly";
let selectedKeyword = "";

// ── 초기화 ──────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initKeywordTab();
  initWriteTab();
  initTrendTab();
  renderRealtimeMini();
  updateRealtimeTime();
});

// ── 네비게이션 ───────────────────────────────────────────────
function initNav() {
  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const tab = link.dataset.tab;
      switchTab(tab);
    });
  });
}

function switchTab(tab) {
  activeTab = tab;

  // nav 활성
  document.querySelectorAll(".nav-link").forEach(l => {
    l.classList.toggle("active", l.dataset.tab === tab);
  });

  // 섹션 활성
  document.querySelectorAll(".tab-section").forEach(s => s.classList.remove("active"));
  const section = document.getElementById("tab" + cap(tab));
  if (section) section.classList.add("active");
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ── 키워드 탭 ────────────────────────────────────────────────
function initKeywordTab() {
  const input = document.getElementById("mainKeywordInput");
  const btn = document.getElementById("btnAnalyze");

  btn.addEventListener("click", () => analyzeKeyword(input.value.trim()));
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") analyzeKeyword(input.value.trim());
  });

  // 소스 토글
  document.getElementById("srcNaver").addEventListener("click", function() {
    this.classList.add("active");
    document.getElementById("srcGoogle").classList.remove("active");
  });
  document.getElementById("srcGoogle").addEventListener("click", function() {
    this.classList.add("active");
    document.getElementById("srcNaver").classList.remove("active");
  });

  // 빠른 검색
  document.querySelectorAll(".quick-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      const kw = this.dataset.kw;
      document.getElementById("mainKeywordInput").value = kw;
      analyzeKeyword(kw);
    });
  });
}

function analyzeKeyword(kw) {
  if (!kw) return;
  selectedKeyword = kw;

  const resultEl = document.getElementById("keywordResults");
  const btn = document.getElementById("btnAnalyze");

  // 로딩
  btn.textContent = "분석 중...";
  btn.disabled = true;
  resultEl.classList.add("hidden");

  setTimeout(() => {
    btn.textContent = "분석하기";
    btn.disabled = false;

    // 데이터 가져오기 (DB에 없으면 기본값)
    const data = KEYWORD_DB[kw] || {
      volume: Math.floor(Math.random() * 30000 + 5000).toLocaleString(),
      competition: ["낮음", "중간", "높음"][Math.floor(Math.random() * 3)],
      cpc: (Math.floor(Math.random() * 3000 + 500)).toLocaleString() + "원",
      related: generateRelated(kw),
      ideas: generateIdeas(kw)
    };

    renderKeywordResults(kw, data);
    resultEl.classList.remove("hidden");
    resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 1200);
}

function generateRelated(kw) {
  const suffixes = [" 방법", " 조건", " 신청 방법", " 비교", " 순위", " 추천", " 가이드", " 2026"];
  return suffixes.slice(0, 5).map((s, i) => ({
    kw: kw + s,
    vol: Math.floor(Math.random() * 15000 + 1000).toLocaleString(),
    comp: ["낮음", "낮음", "중간", "낮음", "중간"][i],
    cpc: (Math.floor(Math.random() * 2000 + 800)).toLocaleString() + "원",
    profit: Math.floor(Math.random() * 2 + 3)
  }));
}

function generateIdeas(kw) {
  return [
    `${kw} 완벽 정리 – 초보자도 쉽게!`,
    `${kw} 신청 방법 A to Z (2026 최신)`,
    `${kw} 꼭 알아야 할 핵심 5가지`,
    `${kw} 자주 하는 실수와 해결 방법`,
    `${kw} vs 대안 비교 – 어느 게 좋을까?`,
  ];
}

function renderKeywordResults(kw, data) {
  document.getElementById("resultKeyword").textContent = kw;
  document.getElementById("metaVolume").textContent = `월 검색량: ${data.volume}`;
  document.getElementById("metaComp").textContent = `경쟁도: ${data.competition}`;
  document.getElementById("metaCpc").textContent = `광고단가: ${data.cpc}`;

  // 관련 키워드 테이블
  const tbody = document.getElementById("keywordTableBody");
  tbody.innerHTML = data.related.map(r => {
    const compClass = r.comp === "낮음" ? "comp-low" : r.comp === "중간" ? "comp-mid" : "comp-high";
    const stars = "★".repeat(r.profit) + "☆".repeat(5 - r.profit);
    return `
      <tr>
        <td><strong>${r.kw}</strong></td>
        <td class="vol-badge">${r.vol}</td>
        <td class="${compClass}">${r.comp}</td>
        <td>${r.cpc}</td>
        <td class="profit-stars">${stars}</td>
        <td><button class="btn-write-kw" onclick="useKeywordForWrite('${r.kw}')">✍️ 글쓰기</button></td>
      </tr>`;
  }).join("");

  // 블로그 지수
  const blogVol = parseInt(data.volume.replace(/,/g, ""));
  const scoreA = blogVol > 20000 ? "A" : blogVol > 8000 ? "B" : "C";
  const scoreB = data.competition === "낮음" ? "A" : data.competition === "중간" ? "B" : "C";
  document.getElementById("blogIndexGrid").innerHTML = `
    <div class="index-item">
      <div class="index-label">검색 인기도</div>
      <div class="index-value">${blogVol > 20000 ? "92" : blogVol > 8000 ? "74" : "58"}</div>
      <div class="index-grade grade-${scoreA}">${scoreA}등급</div>
    </div>
    <div class="index-item">
      <div class="index-label">경쟁 강도</div>
      <div class="index-value">${data.competition === "낮음" ? "31" : data.competition === "중간" ? "58" : "82"}</div>
      <div class="index-grade grade-${scoreB === "A" ? "A" : scoreB === "B" ? "B" : "C"}">${data.competition === "낮음" ? "A (진입 쉬움)" : data.competition === "중간" ? "B (보통)" : "C (어려움)"}</div>
    </div>
    <div class="index-item">
      <div class="index-label">광고 단가</div>
      <div class="index-value">${data.cpc}</div>
      <div class="index-grade grade-A">수익성 높음</div>
    </div>
    <div class="index-item">
      <div class="index-label">추천 여부</div>
      <div class="index-value">${data.competition === "낮음" ? "✅" : "⚠️"}</div>
      <div class="index-grade grade-${data.competition === "낮음" ? "A" : "B"}">${data.competition === "낮음" ? "추천!" : "신중히"}</div>
    </div>`;

  // 콘텐츠 아이디어
  document.getElementById("ideaList").innerHTML = data.ideas.map((idea, i) => `
    <div class="idea-item" onclick="useKeywordForWrite('${idea}')">
      <div class="idea-num">${i + 1}</div>
      <div class="idea-text">${idea}</div>
    </div>`).join("");
}

function useKeywordForWrite(kw) {
  document.getElementById("writeKeyword").value = kw;
  switchTab("write");
}

// ── 실시간 검색어 미니 ────────────────────────────────────────
function renderRealtimeMini() {
  const list = document.getElementById("realtimeMiniList");
  list.innerHTML = REALTIME_KEYWORDS.slice(0, 10).map(item => `
    <div class="realtime-item" onclick="searchFromRealtime('${item.kw}')">
      <span class="rt-rank ${item.rank <= 3 ? "top3" : ""}">${item.rank}</span>
      <span class="rt-text">${item.kw}</span>
      ${item.badge === "new" ? '<span class="rt-badge">NEW</span>' : item.badge === "rise" ? '<span class="rt-badge" style="background:#dcfce7;color:#16a34a">↑UP</span>' : ""}
    </div>`).join("");
}

function searchFromRealtime(kw) {
  document.getElementById("mainKeywordInput").value = kw;
  analyzeKeyword(kw);
}

function updateRealtimeTime() {
  const now = new Date();
  document.getElementById("realtimeTime").textContent =
    `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")} 기준`;
}

// ── AI 글쓰기 탭 ─────────────────────────────────────────────
function initWriteTab() {
  // 글쓰기 vs 썸네일 탭
  document.querySelectorAll(".write-tab").forEach(tab => {
    tab.addEventListener("click", function() {
      document.querySelectorAll(".write-tab").forEach(t => t.classList.remove("active"));
      this.classList.add("active");

      const target = this.dataset.wtab;
      document.getElementById("writeFormArticle").classList.toggle("hidden", target !== "article");
      document.getElementById("writeFormThumbnail").classList.toggle("hidden", target !== "thumbnail");
    });
  });

  // 톤 선택
  document.querySelectorAll(".tone-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".tone-btn").forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      activeTone = this.dataset.tone;
    });
  });

  // 생성 버튼
  document.getElementById("btnGenerate").addEventListener("click", generateContent);

  // 출력 탭
  document.querySelectorAll(".output-tab").forEach(tab => {
    tab.addEventListener("click", function() {
      document.querySelectorAll(".output-tab").forEach(t => t.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // 복사
  document.getElementById("btnCopy").addEventListener("click", () => {
    const content = document.getElementById("outputContent");
    if (!content.classList.contains("hidden")) {
      navigator.clipboard.writeText(content.innerText)
        .then(() => alert("✅ 글이 클립보드에 복사되었습니다!"))
        .catch(() => alert("복사에 실패했습니다. 수동으로 복사해 주세요."));
    } else {
      alert("먼저 글을 생성해 주세요.");
    }
  });

  // 다운로드
  document.getElementById("btnDownload").addEventListener("click", () => {
    const content = document.getElementById("outputContent");
    if (!content.classList.contains("hidden")) {
      const blob = new Blob([content.innerText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `blog_${Date.now()}.txt`;
      a.click();
    } else {
      alert("먼저 글을 생성해 주세요.");
    }
  });

  // 재생성
  document.getElementById("btnRegen").addEventListener("click", generateContent);
}

function generateContent() {
  const kw = document.getElementById("writeKeyword").value.trim();
  if (!kw) {
    alert("주제 키워드를 입력해 주세요!");
    document.getElementById("writeKeyword").focus();
    return;
  }

  const type = document.getElementById("writeType").value;
  const lang = document.getElementById("writeLang").value;

  // 오버레이 표시
  const overlay = document.getElementById("generatingOverlay");
  overlay.classList.remove("hidden");

  // 숨기기
  document.getElementById("outputPlaceholder").classList.add("hidden");
  document.getElementById("outputContent").classList.add("hidden");

  // 단계 애니메이션
  const steps = ["genStep1", "genStep2", "genStep3", "genStep4"];
  steps.forEach(id => {
    document.getElementById(id).classList.remove("active", "done");
  });

  let stepIdx = 0;
  const stepMessages = ["AI가 키워드를 분석하는 중...", "글 구조를 설계하는 중...", "SEO 최적화 중...", "완성!"];

  const runStep = () => {
    if (stepIdx > 0) {
      document.getElementById(steps[stepIdx - 1]).classList.remove("active");
      document.getElementById(steps[stepIdx - 1]).classList.add("done");
    }
    if (stepIdx < steps.length) {
      document.getElementById(steps[stepIdx]).classList.add("active");
      document.getElementById("generatingText").textContent = stepMessages[stepIdx];
      stepIdx++;
      const delay = stepIdx < steps.length ? 900 : 600;
      setTimeout(runStep, delay);
    } else {
      // 완료
      setTimeout(() => {
        overlay.classList.add("hidden");

        const content = document.getElementById("outputContent");
        content.innerHTML = BLOG_CONTENT_TEMPLATES[kw] ||
          BLOG_CONTENT_TEMPLATES.default(kw, type, lang);
        content.classList.remove("hidden");
        document.getElementById("outputPlaceholder").classList.add("hidden");
      }, 500);
    }
  };

  runStep();
}

// ── 트렌드 탭 ────────────────────────────────────────────────
function initTrendTab() {
  renderTrendGrid();

  document.getElementById("trendNaver").addEventListener("click", function() {
    setTrendSource(this);
  });
  document.getElementById("trendGoogle").addEventListener("click", function() {
    setTrendSource(this);
  });
  document.getElementById("trendDaum").addEventListener("click", function() {
    setTrendSource(this);
  });

  document.getElementById("btnRefreshTrend").addEventListener("click", () => {
    const btn = document.getElementById("btnRefreshTrend");
    btn.textContent = "🔄 새로고침 중...";
    setTimeout(() => {
      btn.textContent = "🔄 새로고침";
      updateRealtimeTime();
      document.getElementById("trendUpdated").textContent = "방금 업데이트";
    }, 1000);
  });
}

function setTrendSource(el) {
  document.querySelectorAll(".trend-src-btn").forEach(b => b.classList.remove("active"));
  el.classList.add("active");
  renderTrendGrid();
}

function renderTrendGrid() {
  const grid = document.getElementById("trendGrid");
  const shuffled = [...REALTIME_KEYWORDS].sort(() => Math.random() - 0.5).slice(0, 20)
    .map((item, i) => ({ ...item, rank: i + 1 }));

  grid.innerHTML = shuffled.map(item => `
    <div class="trend-item" onclick="useKeywordForWrite('${item.kw}')">
      <div class="trend-rank">${String(item.rank).padStart(2, "0")}</div>
      <div class="trend-kw">${item.kw}</div>
      <div class="trend-badges">
        ${item.badge === "new" ? '<span class="trend-badge-new">NEW</span>' : ""}
        ${item.badge === "rise" ? '<span class="trend-badge-rise">↑ 상승</span>' : ""}
      </div>
      <div class="trend-action">클릭하면 글쓰기로 이동 →</div>
    </div>`).join("");
}
