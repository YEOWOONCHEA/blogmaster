// ============================================================
// BlogMaster AI – script.js  (Gemini API 연동 버전)
// ============================================================

// ── 전역 상태 ─────────────────────────────────────────────
let geminiApiKey = localStorage.getItem("geminiApiKey") || "";
let geminiModel  = localStorage.getItem("geminiModel")  || "gemini-2.5-flash";
let naverClientId = localStorage.getItem("naverClientId") || "";
let naverClientSecret = localStorage.getItem("naverClientSecret") || "";
let activeTab    = "keyword";
let activeTone   = "friendly";
let isConnected  = false;
let isNaverConnected = false;
let generatedHtml = "";
let currentArticleKeyword = "";
let activeOutputTab = "preview";

// ── 내장 키워드 DB (Gemini 미연결 시 폴백) ────────────────
const KEYWORD_DB = {
  "실손보험": {
    volume: "48,200", competition: "중간", cpc: "2,300원",
    related: [
      { kw: "실손보험 청구 방법 2026", vol: "12,400", comp: "낮음", cpc: "2,800원", profit: 5 },
      { kw: "실손보험 비급여 청구 서류", vol: "8,700", comp: "낮음", cpc: "3,100원", profit: 5 },
      { kw: "실손보험 갱신 거절 사유",  vol: "5,200", comp: "낮음", cpc: "2,600원", profit: 4 },
      { kw: "실손보험 환급 방법",       vol: "9,800", comp: "낮음", cpc: "2,400원", profit: 4 },
      { kw: "4세대 실손보험 비교",      vol: "15,300", comp: "중간", cpc: "3,500원", profit: 5 },
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
      { kw: "연말정산 환급금 조회 방법",       vol: "42,000", comp: "중간", cpc: "1,500원", profit: 4 },
      { kw: "연말정산 의료비 공제 한도 2026",  vol: "18,500", comp: "낮음", cpc: "1,800원", profit: 5 },
      { kw: "연말정산 부양가족 등록 조건",     vol: "23,400", comp: "낮음", cpc: "1,600원", profit: 4 },
      { kw: "연말정산 월세 세액공제 방법",     vol: "16,700", comp: "낮음", cpc: "1,900원", profit: 5 },
      { kw: "맞벌이 연말정산 절세 전략",       vol: "8,200",  comp: "낮음", cpc: "2,100원", profit: 5 },
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
      { kw: "다이어트 식단 일주일 식단표", vol: "22,000", comp: "중간", cpc: "900원",  profit: 3 },
      { kw: "저탄고지 다이어트 식단표",   vol: "15,600", comp: "중간", cpc: "1,100원", profit: 4 },
      { kw: "간헐적 단식 1주일 식단",     vol: "18,900", comp: "낮음", cpc: "950원",  profit: 4 },
      { kw: "다이어트 식단 배달 추천",    vol: "9,400",  comp: "낮음", cpc: "1,300원", profit: 4 },
      { kw: "1200칼로리 식단 구성 방법",  vol: "7,200",  comp: "낮음", cpc: "850원",  profit: 3 },
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
      { kw: "자동차보험 갱신 vs 신규 차이",     vol: "12,300", comp: "낮음", cpc: "4,800원", profit: 5 },
      { kw: "자동차보험 특약 종류와 추가 방법",  vol: "8,900",  comp: "낮음", cpc: "3,900원", profit: 5 },
      { kw: "자동차보험 다이렉트 비교 방법",    vol: "28,400", comp: "중간", cpc: "5,100원", profit: 5 },
      { kw: "자동차보험료 절약하는 법 10가지",  vol: "6,700",  comp: "낮음", cpc: "3,500원", profit: 4 },
      { kw: "자동차보험 사고 후 처리 순서",     vol: "14,800", comp: "낮음", cpc: "3,200원", profit: 4 },
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
  { rank: 1,  kw: "삼성전자 주가",         badge: "new"  },
  { rank: 2,  kw: "2026 청년도약계좌",     badge: "rise" },
  { rank: 3,  kw: "태풍 경로 2026",        badge: "new"  },
  { rank: 4,  kw: "연말정산 환급금 조회",  badge: null   },
  { rank: 5,  kw: "롤드컵 결과",           badge: "new"  },
  { rank: 6,  kw: "실손보험 청구 방법",    badge: null   },
  { rank: 7,  kw: "오늘 날씨",             badge: null   },
  { rank: 8,  kw: "배달의민족 쿠폰",       badge: "rise" },
  { rank: 9,  kw: "근로장려금 신청 2026",  badge: "rise" },
  { rank: 10, kw: "다이어트 식단 추천",    badge: null   },
  { rank: 11, kw: "아이폰 17 출시일",      badge: "new"  },
  { rank: 12, kw: "청약 당첨 확인",        badge: null   },
  { rank: 13, kw: "한국 야구 중계",        badge: null   },
  { rank: 14, kw: "주택담보대출 금리",     badge: "rise" },
  { rank: 15, kw: "공모주 청약 일정",      badge: null   },
  { rank: 16, kw: "비트코인 시세",         badge: "rise" },
  { rank: 17, kw: "넷플릭스 신작",         badge: null   },
  { rank: 18, kw: "의료비 세액공제",       badge: null   },
  { rank: 19, kw: "자동차보험 비교",       badge: null   },
  { rank: 20, kw: "카카오페이 주가",       badge: "new"  },
];

// ── 초기화 ──────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initKeywordTab();
  initWriteTab();
  initTrendTab();
  initGeminiModal();
  renderRealtimeMini();
  updateRealtimeTime();

  // 서버의 설정 상태 로드
  checkServerConfig();
});

async function checkServerConfig() {
  try {
    const res = await fetch("/api/config");
    if (!res.ok) return;
    const config = await res.json();
    
    if (config.hasGemini) {
      geminiModel = config.geminiModel;
      setConnectedStatus(true);
    } else {
      setConnectedStatus(false);
    }
    
    if (config.hasNaver) {
      setNaverConnectedStatus(true);
    } else {
      setNaverConnectedStatus(false);
    }
  } catch (e) {
    console.error("서버 설정 로드 실패:", e);
  }
}

// ── 네비게이션 ───────────────────────────────────────────────
function initNav() {
  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      switchTab(link.dataset.tab);
    });
  });
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll(".nav-link").forEach(l =>
    l.classList.toggle("active", l.dataset.tab === tab));
  document.querySelectorAll(".tab-section").forEach(s => s.classList.remove("active"));
  const section = document.getElementById("tab" + cap(tab));
  if (section) section.classList.add("active");
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ── API 설정 모달 및 연결 관리 ───────────────────────────────
function initGeminiModal() {
  const overlay   = document.getElementById("apiModalOverlay");
  const geminiInput = document.getElementById("geminiApiKeyInput");
  const modelSel  = document.getElementById("geminiModel");
  const naverIdInput = document.getElementById("naverClientIdInput");
  const naverSecretInput = document.getElementById("naverClientSecretInput");
  
  const btnOpen   = document.getElementById("btnApiKey");
  const btnClose  = document.getElementById("apiModalClose");
  const btnEye    = document.getElementById("btnEyeToggle");
  const btnSave   = document.getElementById("btnSaveAllApis");
  const result    = document.getElementById("apiTestResult");

  // 모달을 열 때 현재 서버 상태를 먼저 확인하여 필드 채우기
  btnOpen.addEventListener("click", async () => {
    overlay.classList.remove("hidden");
    try {
      const res = await fetch("/api/config");
      if (res.ok) {
        const config = await res.json();
        modelSel.value = config.geminiModel || "gemini-2.5-flash";
        // 보안상 실제 키값은 노출하지 않고 플레이스홀더나 별표 표시
        if (config.hasGemini) geminiInput.value = "••••••••••••••••••••";
        if (config.hasNaver) {
          naverIdInput.value = "••••••••••••••••••••";
          naverSecretInput.value = "••••••••••••••••••••";
        }
      }
    } catch (e) {}
  });

  btnClose.addEventListener("click", () => overlay.classList.add("hidden"));
  overlay.addEventListener("click", e => { if (e.target === overlay) overlay.classList.add("hidden"); });

  // 비밀번호 보기/숨기기 (Gemini)
  btnEye.addEventListener("click", () => {
    geminiInput.type = geminiInput.type === "password" ? "text" : "password";
    btnEye.textContent = geminiInput.type === "password" ? "👁️" : "🙈";
  });

  // 통합 저장 및 연결 버튼
  btnSave.addEventListener("click", async () => {
    const gKey   = geminiInput.value.trim();
    const gModel = modelSel.value;
    const nId    = naverIdInput.value.trim();
    const nSecret = naverSecretInput.value.trim();

    btnSave.textContent = "⏳ 연결 설정 중...";
    btnSave.disabled = true;
    result.classList.add("hidden");

    let geminiOk = false;
    let naverOk = false;
    let messages = [];

    // 1. Gemini 저장 & 검증
    if (gKey && gKey !== "••••••••••••••••••••") {
      setConnectedStatus("connecting");
      try {
        // 서버에 키 임시 등록
        const saveRes = await fetch("/api/gemini/set-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey: gKey, model: gModel })
        });
        
        if (saveRes.ok) {
          // 서버를 통해 테스트 호출
          geminiOk = await testServerGemini();
          if (geminiOk) {
            setConnectedStatus(true);
            messages.push("✅ Gemini AI 연결 성공!");
          } else {
            setConnectedStatus(false);
            messages.push("❌ Gemini API 키 검증 실패 (키가 올바르지 않음)");
          }
        } else {
          setConnectedStatus(false);
          messages.push("❌ Gemini 설정 저장 실패");
        }
      } catch (e) {
        setConnectedStatus(false);
        messages.push("❌ Gemini 연결 오류: " + e.message);
      }
    } else if (gKey === "••••••••••••••••••••") {
      geminiOk = true; // 변경 없음
    } else {
      // 키 삭제
      await fetch("/api/gemini/set-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: "" })
      });
      setConnectedStatus(false);
    }

    // 2. 네이버 저장 & 검증
    if (nId && nSecret && nId !== "••••••••••••••••••••" && nSecret !== "••••••••••••••••••••") {
      setNaverConnectedStatus("connecting");
      try {
        const naverRes = await fetch("/api/naver/set-keys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId: nId, clientSecret: nSecret })
        });
        
        if (naverRes.ok) {
          naverOk = true;
          setNaverConnectedStatus(true);
          messages.push("✅ 네이버 검색 API 설정 성공!");
        } else {
          setNaverConnectedStatus(false);
          messages.push("❌ 네이버 API 연동 실패 (ID/Secret 확인)");
        }
      } catch (e) {
        setNaverConnectedStatus(false);
        messages.push("❌ 네이버 연동 오류: " + e.message);
      }
    } else if (nId === "••••••••••••••••••••") {
      naverOk = true; // 변경 없음
    } else {
      // 키 삭제
      await fetch("/api/naver/set-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: "", clientSecret: "" })
      });
      setNaverConnectedStatus(false);
    }

    // 결과 표시
    if (messages.length === 0) {
      showResult(result, false, "설정할 API 키를 입력해 주세요.");
    } else {
      const isSuccess = geminiOk && naverOk;
      showResult(result, isSuccess, messages.join("<br/>"));
      if (isSuccess) {
        setTimeout(() => overlay.classList.add("hidden"), 1500);
      }
    }

    btnSave.textContent = "🚀 설정 저장 및 연결하기";
    btnSave.disabled = false;
    checkServerConfig(); // 새로 구성된 설정 로드
  });
}

async function testServerGemini() {
  try {
    const res = await fetch("/api/gemini/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Hi, respond with only one word 'OK'" })
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.ok && data.text.includes("OK");
  } catch (e) {
    return false;
  }
}

function setConnectedStatus(status) {
  const dot   = document.getElementById("geminiDot");
  const label = document.getElementById("geminiLabel");

  if (status === true || status === "connected") {
    isConnected = true;
    dot.className   = "gemini-dot connected";
    label.textContent = "Gemini 연결됨 ✓";
  } else if (status === "connecting") {
    dot.className   = "gemini-dot connecting";
    label.textContent = "연결 중...";
  } else {
    isConnected = false;
    dot.className   = "gemini-dot disconnected";
    label.textContent = "Gemini 미연결";
  }
}

function setNaverConnectedStatus(status) {
  const dot   = document.getElementById("naverDot");
  const label = document.getElementById("naverLabel");

  if (status === true || status === "connected") {
    isNaverConnected = true;
    dot.className   = "gemini-dot connected";
    label.textContent = "네이버 연결됨 ✓";
  } else if (status === "connecting") {
    dot.className   = "gemini-dot connecting";
    label.textContent = "연결 중...";
  } else {
    isNaverConnected = false;
    dot.className   = "gemini-dot disconnected";
    label.textContent = "네이버 미연결";
  }
}

function showResult(el, success, msg) {
  el.innerHTML   = msg;
  el.className   = "api-test-result " + (success ? "success" : "error");
  el.classList.remove("hidden");
}

// ── Gemini API 호출 (서버 프록시 호출로 변경) ───────────────────────
async function callGemini(prompt) {
  const res = await fetch("/api/gemini/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.msg || "API 오류");
  }
  const data = await res.json();
  return data.text;
}

// ── 키워드 탭 ────────────────────────────────────────────────
function initKeywordTab() {
  const input = document.getElementById("mainKeywordInput");
  document.getElementById("btnAnalyze").addEventListener("click", () => analyzeKeyword(input.value.trim()));
  input.addEventListener("keydown", e => { if (e.key === "Enter") analyzeKeyword(input.value.trim()); });

  document.getElementById("srcNaver").addEventListener("click", function() {
    this.classList.add("active");
    document.getElementById("srcGoogle").classList.remove("active");
  });
  document.getElementById("srcGoogle").addEventListener("click", function() {
    this.classList.add("active");
    document.getElementById("srcNaver").classList.remove("active");
  });

  document.querySelectorAll(".quick-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      input.value = this.dataset.kw;
      analyzeKeyword(this.dataset.kw);
    });
  });
}

async function getNaverAnalysis(kw) {
  try {
    const res = await fetch(`/api/naver/keyword-analysis?query=${encodeURIComponent(kw)}`);
    if (!res.ok) throw new Error("Naver analysis failed");
    const data = await res.json();
    return data.ok ? data : null;
  } catch (e) {
    console.error("Naver API analysis error:", e);
    return null;
  }
}

function analyzeKeyword(kw) {
  if (!kw) return;
  const btn = document.getElementById("btnAnalyze");
  const resultEl = document.getElementById("keywordResults");

  btn.textContent = "분석 중...";
  btn.disabled = true;
  resultEl.classList.add("hidden");

  setTimeout(async () => {
    btn.textContent = "분석하기";
    btn.disabled = false;

    let data = null;

    // 1. 네이버 API가 연결되어 있으면 실제 네이버 데이터 가져옴
    let naverData = null;
    if (isNaverConnected) {
      naverData = await getNaverAnalysis(kw);
    }

    // 2. Gemini가 연결되어 있으면 지능적으로 데이터 구조화
    if (isConnected && geminiApiKey) {
      try {
        let prompt = "";
        if (naverData) {
          prompt = `당신은 한국 최고의 네이버/구글 SEO 키워드 분석 전문가입니다.
키워드: "${kw}"
네이버 블로그 총 발행 문서 수: ${naverData.totalBlogResults}
네이버 연관 형태소/단어: ${naverData.relatedKeywords.join(", ")}

이 정보를 참고하여, 블로그 포스팅 시 상위 노출 및 애드센스 수익을 극대화할 수 있는 관련 롱테일 키워드 5개와 글쓰기 아이디어 5개를 분석해주세요.
반드시 아래의 JSON 형식으로만 응답하세요 (설명 없이 JSON 코드만):
{
  "volume": "${naverData.totalBlogResults}건 발행",
  "competition": "${naverData.competition}",
  "cpc": "예상 CPC (예: 2,500원)",
  "related": [
    {"kw": "네이버 연관단어를 조합한 수익성 키워드 1", "vol": "예상 월 검색량", "comp": "낮음 또는 중간", "cpc": "단가원", "profit": 5},
    {"kw": "네이버 연관단어를 조합한 수익성 키워드 2", "vol": "예상 월 검색량", "comp": "낮음 또는 중간", "cpc": "단가원", "profit": 4},
    {"kw": "네이버 연관단어를 조합한 수익성 키워드 3", "vol": "예상 월 검색량", "comp": "낮음 또는 중간", "cpc": "단가원", "profit": 5},
    {"kw": "네이버 연관단어를 조합한 수익성 키워드 4", "vol": "예상 월 검색량", "comp": "낮음 또는 중간", "cpc": "단가원", "profit": 3},
    {"kw": "네이버 연관단어를 조합한 수익성 키워드 5", "vol": "예상 월 검색량", "comp": "낮음 또는 중간", "cpc": "단가원", "profit": 5}
  ],
  "ideas": [
    "상위 노출을 노릴 수 있는 제목 아이디어 1",
    "상위 노출을 노릴 수 있는 제목 아이디어 2",
    "상위 노출을 노릴 수 있는 제목 아이디어 3",
    "상위 노출을 노릴 수 있는 제목 아이디어 4",
    "상위 노출을 노릴 수 있는 제목 아이디어 5"
  ]
}`;
        } else {
          prompt = `당신은 한국 SEO 전문가입니다. 키워드 "${kw}"에 대해 다음 JSON 형식으로만 답해주세요 (다른 텍스트 없이):
{
  "volume": "예상 월 검색량 (숫자,단위)",
  "competition": "낮음 또는 중간 또는 높음",
  "cpc": "예상 클릭당 광고비 (원)",
  "related": [
    {"kw": "관련키워드1", "vol": "검색량", "comp": "낮음", "cpc": "금액원", "profit": 4},
    {"kw": "관련키워드2", "vol": "검색량", "comp": "낮음", "cpc": "금액원", "profit": 5},
    {"kw": "관련키워드3", "vol": "검색량", "comp": "낮음", "cpc": "금액원", "profit": 4},
    {"kw": "관련키워드4", "vol": "검색량", "comp": "중간", "cpc": "금액원", "profit": 3},
    {"kw": "관련키워드5", "vol": "검색량", "comp": "낮음", "cpc": "금액원", "profit": 5}
  ],
  "ideas": [
    "블로그 글 제목 아이디어 1",
    "블로그 글 제목 아이디어 2",
    "블로그 글 제목 아이디어 3",
    "블로그 글 제목 아이디어 4",
    "블로그 글 제목 아이디어 5"
  ]
}`;
        }

        const raw = await callGemini(prompt);
        const jsonStr = raw.replace(/```json|```/g, "").trim();
        data = JSON.parse(jsonStr);
      } catch (e) {
        console.error("Gemini keyword parse error:", e);
      }
    }

    // 3. Gemini가 연결되지 않았거나 에러가 났을 때 폴백
    if (!data) {
      if (naverData) {
        // 네이버 데이터 기반 자체 폴백 생성
        data = {
          volume: `${naverData.totalBlogResults}건 발행`,
          competition: naverData.competition,
          cpc: "1,500원",
          related: naverData.relatedKeywords.slice(0, 5).map((k, i) => ({
            kw: kw + " " + k,
            vol: (Math.floor(Math.random() * 8000 + 500)).toLocaleString(),
            comp: naverData.competition === "높음" ? "중간" : "낮음",
            cpc: (Math.floor(Math.random() * 1500 + 500)).toLocaleString() + "원",
            profit: Math.floor(Math.random() * 2 + 3)
          })),
          ideas: naverData.relatedKeywords.slice(0, 5).map(k => `${kw} ${k} 핵심 요약 및 꿀팁 정리`)
        };
      } else {
        data = KEYWORD_DB[kw] || generateFallback(kw);
      }
    }

    renderKeywordResults(kw, data);
    resultEl.classList.remove("hidden");
    resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 800);
}

function generateFallback(kw) {
  const suffixes = [" 방법", " 조건", " 신청", " 비교", " 추천"];
  return {
    volume: (Math.floor(Math.random() * 30000 + 3000)).toLocaleString(),
    competition: ["낮음", "낮음", "중간"][Math.floor(Math.random() * 3)],
    cpc: (Math.floor(Math.random() * 3000 + 500)).toLocaleString() + "원",
    related: suffixes.map((s, i) => ({
      kw: kw + s,
      vol: (Math.floor(Math.random() * 15000 + 1000)).toLocaleString(),
      comp: ["낮음", "낮음", "중간", "낮음", "중간"][i],
      cpc: (Math.floor(Math.random() * 2000 + 800)).toLocaleString() + "원",
      profit: Math.floor(Math.random() * 2 + 3)
    })),
    ideas: [
      `${kw} 완벽 정리 – 초보자도 쉽게!`,
      `${kw} 신청 방법 A to Z (2026 최신)`,
      `${kw} 꼭 알아야 할 핵심 5가지`,
      `${kw} 자주 하는 실수와 해결 방법`,
      `${kw} vs 대안 비교 – 어느 게 좋을까?`,
    ]
  };
}

function renderKeywordResults(kw, data) {
  document.getElementById("resultKeyword").textContent = kw;
  document.getElementById("metaVolume").textContent  = `월 검색량: ${data.volume}`;
  document.getElementById("metaComp").textContent   = `경쟁도: ${data.competition}`;
  document.getElementById("metaCpc").textContent    = `광고단가: ${data.cpc}`;

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
        <td><button class="btn-write-kw" onclick="useKeywordForWrite('${r.kw.replace(/'/g,"\\'")}')">✍️ 글쓰기</button></td>
      </tr>`;
  }).join("");

  const blogVol = parseInt((data.volume || "0").replace(/[^0-9]/g, ""));
  const scoreA  = blogVol > 20000 ? "A" : blogVol > 8000 ? "B" : "C";
  const scoreB  = data.competition === "낮음" ? "A" : data.competition === "중간" ? "B" : "C";
  document.getElementById("blogIndexGrid").innerHTML = `
    <div class="index-item">
      <div class="index-label">검색 인기도</div>
      <div class="index-value">${blogVol > 20000 ? 92 : blogVol > 8000 ? 74 : 58}</div>
      <div class="index-grade grade-${scoreA}">${scoreA}등급</div>
    </div>
    <div class="index-item">
      <div class="index-label">경쟁 강도</div>
      <div class="index-value">${data.competition === "낮음" ? 31 : data.competition === "중간" ? 58 : 82}</div>
      <div class="index-grade grade-${scoreB}">${data.competition === "낮음" ? "A (진입 쉬움)" : data.competition === "중간" ? "B (보통)" : "C (어려움)"}</div>
    </div>
    <div class="index-item">
      <div class="index-label">광고 단가</div>
      <div class="index-value" style="font-size:16px">${data.cpc}</div>
      <div class="index-grade grade-A">수익성 높음</div>
    </div>
    <div class="index-item">
      <div class="index-label">추천 여부</div>
      <div class="index-value">${data.competition === "낮음" ? "✅" : "⚠️"}</div>
      <div class="index-grade grade-${data.competition === "낮음" ? "A" : "B"}">${data.competition === "낮음" ? "추천!" : "신중히"}</div>
    </div>`;

  document.getElementById("ideaList").innerHTML = data.ideas.map((idea, i) => `
    <div class="idea-item" onclick="useKeywordForWrite('${idea.replace(/'/g,"\\'")}')">
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
  document.getElementById("realtimeMiniList").innerHTML =
    REALTIME_KEYWORDS.slice(0, 10).map(item => `
      <div class="realtime-item" onclick="useKeywordForWrite('${item.kw}')">
        <span class="rt-rank ${item.rank <= 3 ? "top3" : ""}">${item.rank}</span>
        <span class="rt-text">${item.kw}</span>
        ${item.badge === "new"  ? '<span class="rt-badge">NEW</span>' :
          item.badge === "rise" ? '<span class="rt-badge" style="background:#dcfce7;color:#16a34a">↑UP</span>' : ""}
      </div>`).join("");
}

function updateRealtimeTime() {
  const now = new Date();
  document.getElementById("realtimeTime").textContent =
    `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")} 기준`;
}

// ── AI 글쓰기 탭 ─────────────────────────────────────────────
function initWriteTab() {
  document.querySelectorAll(".write-tab").forEach(tab => {
    tab.addEventListener("click", function() {
      document.querySelectorAll(".write-tab").forEach(t => t.classList.remove("active"));
      this.classList.add("active");
      const target = this.dataset.wtab;
      document.getElementById("writeFormArticle").classList.toggle("hidden", target !== "article");
      document.getElementById("writeFormThumbnail").classList.toggle("hidden", target !== "thumbnail");
    });
  });

  document.querySelectorAll(".tone-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".tone-btn").forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      activeTone = this.dataset.tone;
    });
  });

  // 출력 탭 전환 리스너 추가
  document.getElementById("otabPreview").addEventListener("click", () => switchOutputTab("preview"));
  document.getElementById("otabHtml").addEventListener("click", () => switchOutputTab("html"));
  document.getElementById("otabSeo").addEventListener("click", () => switchOutputTab("seo"));

  document.getElementById("btnGenerate").addEventListener("click", generateContent);
  document.getElementById("btnRegen").addEventListener("click", generateContent);

  document.getElementById("btnCopy").addEventListener("click", () => {
    if (!generatedHtml) { alert("먼저 글을 생성해 주세요."); return; }
    navigator.clipboard.writeText(generatedHtml)
      .then(() => alert("✅ HTML 원본이 클립보드에 복사되었습니다!"))
      .catch(() => alert("복사 실패. 수동으로 복사해 주세요."));
  });

  document.getElementById("btnDownload").addEventListener("click", () => {
    if (!generatedHtml) { alert("먼저 글을 생성해 주세요."); return; }
    const blob = new Blob([generatedHtml], { type: "text/html;charset=utf-8" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob), download: `blog_${Date.now()}.html`
    });
    a.click();
  });
}

function switchOutputTab(tab) {
  if (!generatedHtml) return;
  activeOutputTab = tab;
  
  document.querySelectorAll(".output-tab").forEach(t => t.classList.remove("active"));
  if (tab === "preview") document.getElementById("otabPreview").classList.add("active");
  if (tab === "html") document.getElementById("otabHtml").classList.add("active");
  if (tab === "seo") document.getElementById("otabSeo").classList.add("active");

  const content = document.getElementById("outputContent");
  content.innerHTML = "";

  if (tab === "preview") {
    content.innerHTML = generatedHtml;
    if (!isConnected) {
      const warn = document.createElement("div");
      warn.className = "no-key-warning";
      warn.innerHTML = `⚠️ 현재 <strong>데모 글</strong>입니다. 진짜 AI 글을 생성하려면:<br/>
        <button onclick="document.getElementById('btnApiKey').click()">🔑 Gemini API 키 연결하기</button>`;
      content.prepend(warn);
    }
  } else if (tab === "html") {
    const txt = document.createElement("textarea");
    txt.className = "raw-html-area";
    txt.readOnly = true;
    txt.value = generatedHtml;
    content.appendChild(txt);
  } else if (tab === "seo") {
    content.innerHTML = renderSeoReport(generatedHtml, currentArticleKeyword);
  }
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderSeoReport(html, kw) {
  const cleanText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const charCountWithSpace = cleanText.length;
  const charCountNoSpace = cleanText.replace(/\s/g, "").length;
  
  let kwCount = 0;
  if (kw) {
    const escapedKw = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const matches = cleanText.match(new RegExp(escapedKw, "gi"));
    kwCount = matches ? matches.length : 0;
  }
  
  const density = charCountNoSpace > 0 ? ((kwCount * kw.length) / charCountNoSpace * 100).toFixed(1) : 0;
  
  const hasH1 = html.includes("<h1");
  const hasH2 = html.includes("<h2");
  const hasList = html.includes("<ul") || html.includes("<ol");
  const hasIntroKw = cleanText.slice(0, 300).toLowerCase().includes(kw.toLowerCase());
  
  let score = 30;
  if (charCountNoSpace > 800) score += 20;
  else if (charCountNoSpace > 400) score += 10;
  
  if (kwCount >= 3 && kwCount <= 8) score += 20;
  else if (kwCount > 0) score += 10;
  
  if (hasH1 && hasH2) score += 20;
  if (hasList) score += 5;
  if (hasIntroKw) score += 5;
  
  let scoreColor = "#22c55e";
  let scoreText = "백점 만점에 백점! 완벽한 SEO 최적화 글입니다.";
  if (score < 60) {
    scoreColor = "#ef4444";
    scoreText = "SEO 최적화 보완이 필요합니다. 키워드를 조금 더 배치해 보세요.";
  } else if (score < 85) {
    scoreColor = "#f59e0b";
    scoreText = "대체로 우수한 글입니다. 약간의 수정으로 품질을 더 높일 수 있습니다.";
  }

  return `
    <div class="seo-report">
      <div class="seo-score-card">
        <div class="seo-score-circle" style="background: ${scoreColor}; box-shadow: 0 4px 12px ${scoreColor}4d">
          <span class="seo-score-value">${score}</span>
          <span class="seo-score-label">SEO 점수</span>
        </div>
        <div class="seo-score-info">
          <h4>${score >= 85 ? "🔥 최적화 완료" : score >= 60 ? "👍 양호함" : "⚠️ 보완 필요"}</h4>
          <p>${scoreText}</p>
        </div>
      </div>
      
      <div class="seo-metrics-grid">
        <div class="seo-metric-item">
          <div class="seo-metric-val">${charCountWithSpace.toLocaleString()}자</div>
          <div class="seo-metric-lbl">공백 포함 글자수</div>
        </div>
        <div class="seo-metric-item">
          <div class="seo-metric-val">${charCountNoSpace.toLocaleString()}자</div>
          <div class="seo-metric-lbl">공백 제외 글자수</div>
        </div>
        <div class="seo-metric-item">
          <div class="seo-metric-val">${kwCount}회 (${density}%)</div>
          <div class="seo-metric-lbl">키워드 반복 빈도</div>
        </div>
      </div>
      
      <div class="seo-checklist">
        <h4>📋 SEO 핵심 체크리스트</h4>
        
        <div class="seo-check-item">
          <span class="seo-check-icon ${hasH1 ? "pass" : "fail"}">${hasH1 ? "✅" : "❌"}</span>
          <span>주제목(H1) 태그가 포함되어 있습니까?</span>
        </div>
        <div class="seo-check-item">
          <span class="seo-check-icon ${hasH2 ? "pass" : "fail"}">${hasH2 ? "✅" : "❌"}</span>
          <span>본문 소제목(H2) 태그가 1개 이상 존재합니까?</span>
        </div>
        <div class="seo-check-item">
          <span class="seo-check-icon ${hasList ? "pass" : "fail"}">${hasList ? "✅" : "❌"}</span>
          <span>독자의 가독성을 위한 리스트(ul/ol) 구조가 있습니까?</span>
        </div>
        <div class="seo-check-item">
          <span class="seo-check-icon ${hasIntroKw ? "pass" : "fail"}">${hasIntroKw ? "✅" : "❌"}</span>
          <span>글의 도입부(첫 300자)에 타겟 키워드가 등장합니까?</span>
        </div>
        <div class="seo-check-item">
          <span class="seo-check-icon ${charCountNoSpace >= 1000 ? "pass" : "fail"}">${charCountNoSpace >= 1000 ? "✅" : "❌"}</span>
          <span>글자수가 SEO 권장량(공백 제외 1,000자 이상)에 도달했습니까?</span>
        </div>
      </div>
    </div>
  `;
}

async function generateContent() {
  const kw = document.getElementById("writeKeyword").value.trim();
  if (!kw) { alert("주제 키워드를 입력해 주세요!"); return; }

  const type   = document.getElementById("writeType").value;
  const lang   = document.getElementById("writeLang").value;
  const length = document.getElementById("writeLength").value;
  const seoTitle = document.getElementById("chkSeoTitle").checked;
  const metaDesc = document.getElementById("chkMetaDesc").checked;
  const hashtag  = document.getElementById("chkHashtag").checked;

  const overlay = document.getElementById("generatingOverlay");
  overlay.classList.remove("hidden");
  document.getElementById("outputPlaceholder").classList.add("hidden");
  document.getElementById("outputContent").classList.add("hidden");

  const steps = ["genStep1","genStep2","genStep3","genStep4"];
  steps.forEach(id => document.getElementById(id).classList.remove("active","done"));

  const stepMsgs = ["🔍 키워드 분석 중...","✍️ Gemini AI가 글 작성 중...","🔍 SEO 최적화 중...","✅ 완료!"];

  // 단계 표시
  let stepIdx = 0;
  const advanceStep = () => {
    if (stepIdx > 0) {
      document.getElementById(steps[stepIdx-1]).classList.remove("active");
      document.getElementById(steps[stepIdx-1]).classList.add("done");
    }
    if (stepIdx < steps.length) {
      document.getElementById(steps[stepIdx]).classList.add("active");
      document.getElementById("generatingText").textContent = stepMsgs[stepIdx];
      stepIdx++;
    }
  };

  advanceStep(); // step1

  try {
    let html = "";

    if (isConnected) {
      // ── 실제 Gemini API 호출 ──
      const typeMap = { info:"정보/안내", review:"리뷰/후기", compare:"비교/분석", howto:"방법/가이드", news:"뉴스/트렌드", list:"리스트/추천" };
      const toneMap = { friendly:"친근하고 쉬운", professional:"전문적이고 신뢰할 수 있는", casual:"가볍고 재미있는" };
      const lengthMap = { short:"700~1000자", medium:"1500~2000자", long:"3000자 이상" };
      const langMap   = { ko:"한국어", en:"영어", ja:"일본어", zh:"중국어" };

      setTimeout(advanceStep, 800);  // step2

      const prompt = `당신은 한국 최고의 SEO 블로그 작가입니다.

키워드: "${kw}"
글 유형: ${typeMap[type] || "정보"}
언어: ${langMap[lang] || "한국어"}
분량: ${lengthMap[length] || "1500~2000자"}
톤: ${toneMap[activeTone] || "친근한"}

다음 조건으로 완성된 블로그 글을 HTML 형식으로 작성해주세요:
1. <h1> 태그로 매력적인 제목 (키워드 포함, 클릭욕구 자극)
2. <div class="meta-tags">에 <span class="tag"> 형식으로 해시태그 3~5개
3. <div class="highlight-box">에 핵심 요약 (💡 이모지 포함)
4. <h2> 소제목 3~5개로 본문 구성 (✅ 이모지 포함)
5. <ul> 또는 <ol> 리스트 활용
6. 마지막에 <div class="seo-meta"> 블록에:
   - <h3>🔍 SEO 메타 정보</h3>
   - <p><strong>메타 제목:</strong> ...</p>
   - <p><strong>메타 설명:</strong> ...</p>
   - <div class="hashtags">are <span class="hashtag"> 형식으로 해시태그 5개

글은 실용적이고 독자에게 진짜 도움이 되어야 합니다. HTML 태그만 반환하세요 (마크다운 코드블록 없이).`;

      const raw = await callGemini(prompt);
      setTimeout(advanceStep, 400);  // step3
      html = raw.replace(/```html|```/g, "").trim();
      setTimeout(advanceStep, 400);  // step4

    } else {
      // ── API 없을 때 데모 글 ──
      setTimeout(advanceStep, 600);
      setTimeout(advanceStep, 1200);
      setTimeout(advanceStep, 1800);
      await new Promise(r => setTimeout(r, 2000));
      html = buildDemoHtml(kw, type);
    }

    await new Promise(r => setTimeout(r, 600));
    overlay.classList.add("hidden");
    
    // 글로벌 상태 저장
    generatedHtml = html;
    currentArticleKeyword = kw;
    
    // 미리보기 탭 활성화 및 렌더링
    switchOutputTab("preview");
    
    const content = document.getElementById("outputContent");
    content.classList.remove("hidden");

  } catch (err) {
    overlay.classList.add("hidden");
    const content = document.getElementById("outputContent");
    content.innerHTML = `<div class="no-key-warning">
      ❌ 오류가 발생했습니다: ${err.message}<br/>
      API 키를 확인하거나 다시 시도해 주세요.
      <br/><button onclick="generateContent()">🔄 다시 시도</button>
    </div>`;
    content.classList.remove("hidden");
  }
}

function buildDemoHtml(kw, type) {
  const typeLabels = { info:"정보/안내", review:"리뷰/후기", compare:"비교/분석", howto:"방법/가이드" };
  return `
<h1>${kw} – ${typeLabels[type]||"완벽 가이드"} (2026)</h1>
<div class="meta-tags">
  <span class="tag">#${kw.replace(/\s+/g,"")}</span>
  <span class="tag">#2026</span>
  <span class="tag">#정보</span>
  <span class="tag">#블로그</span>
</div>
<div class="highlight-box">
  💡 <strong>핵심 요약:</strong> ${kw}에 대한 최신 정보와 실용적인 팁을 한 번에 정리했습니다. 처음부터 끝까지 따라오시면 됩니다.
</div>
<h2>✅ ${kw}란 무엇인가요?</h2>
<p>${kw}은(는) 많은 분들이 관심을 갖고 있는 주제입니다. 이 글에서는 기초 개념부터 실용적인 활용 방법까지 쉽게 설명해 드리겠습니다.</p>
<h2>✅ 핵심 포인트 3가지</h2>
<ul>
  <li><strong>첫째,</strong> 기본 개념을 이해하고 시작하세요</li>
  <li><strong>둘째,</strong> 본인의 상황에 맞는 방법을 선택하세요</li>
  <li><strong>셋째,</strong> 꾸준히 실천하는 것이 핵심입니다</li>
</ul>
<h2>✅ 자주 묻는 질문</h2>
<h3>Q. 처음 시작하는 분들에게 추천하는 방법은?</h3>
<p>기본 개념부터 익히고, 단계적으로 심화 내용을 학습하는 것을 추천드립니다.</p>
<h2>✅ 마무리</h2>
<p>이 글이 도움이 되셨다면 공유해 주세요! 추가 궁금한 점은 댓글로 남겨주세요.</p>
<div class="seo-meta">
  <h3>🔍 SEO 메타 정보</h3>
  <p><strong>메타 제목:</strong> ${kw} 완벽 가이드 2026 | BlogMaster AI</p>
  <p><strong>메타 설명:</strong> ${kw}에 대한 최신 정보를 총정리했습니다. 초보자도 쉽게 이해할 수 있는 가이드!</p>
  <div class="hashtags">
    <span class="hashtag">#${kw.replace(/\s+/g,"")}</span>
    <span class="hashtag">#정보글</span>
    <span class="hashtag">#2026</span>
    <span class="hashtag">#블로그</span>
    <span class="hashtag">#가이드</span>
  </div>
</div>`;
}

// ── 트렌드 탭 ────────────────────────────────────────────────
function initTrendTab() {
  renderTrendGrid();
  ["trendNaver","trendGoogle","trendDaum"].forEach(id => {
    document.getElementById(id).addEventListener("click", function() {
      document.querySelectorAll(".trend-src-btn").forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      renderTrendGrid();
    });
  });
  document.getElementById("btnRefreshTrend").addEventListener("click", () => {
    document.getElementById("btnRefreshTrend").textContent = "🔄 새로고침 중...";
    setTimeout(() => {
      document.getElementById("btnRefreshTrend").textContent = "🔄 새로고침";
      updateRealtimeTime();
      document.getElementById("trendUpdated").textContent = "방금 업데이트";
    }, 1000);
  });
}

function renderTrendGrid() {
  const shuffled = [...REALTIME_KEYWORDS]
    .sort(() => Math.random() - 0.5)
    .slice(0, 20)
    .map((item, i) => ({ ...item, rank: i + 1 }));

  document.getElementById("trendGrid").innerHTML = shuffled.map(item => `
    <div class="trend-item" onclick="useKeywordForWrite('${item.kw}')">
      <div class="trend-rank">${String(item.rank).padStart(2,"0")}</div>
      <div class="trend-kw">${item.kw}</div>
      <div class="trend-badges">
        ${item.badge === "new"  ? '<span class="trend-badge-new">NEW</span>'    : ""}
        ${item.badge === "rise" ? '<span class="trend-badge-rise">↑ 상승</span>' : ""}
      </div>
      <div class="trend-action">클릭하면 글쓰기로 이동 →</div>
    </div>`).join("");
}
