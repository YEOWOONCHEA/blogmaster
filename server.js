// ============================================================
// BlogMaster AI – server.js (CORS 우회 + 영구 설정 저장 프록시)
// ============================================================
require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const fetch   = require("node-fetch");
const path    = require("path");
const fs      = require("fs");

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const ENV_PATH = path.join(__dirname, ".env");

// ── 환경변수 저장 함수 ────────────────────────────────────
function saveToEnv(key, value) {
  let envContent = "";
  if (fs.existsSync(ENV_PATH)) {
    envContent = fs.readFileSync(ENV_PATH, "utf8");
  }
  
  const lines = envContent.split("\n");
  let found = false;
  const newLines = lines.map(line => {
    if (line.trim().startsWith(`${key}=`)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });
  
  if (!found) {
    newLines.push(`${key}=${value}`);
  }
  
  fs.writeFileSync(ENV_PATH, newLines.join("\n").trim() + "\n", "utf8");
  process.env[key] = value; // 현재 프로세스에도 적용
}

// ── 설정 상태 가져오기 (보안을 위해 키 값은 숨기고 존재 여부만 반환) ──
app.get("/api/config", (req, res) => {
  res.json({
    hasGemini: !!process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    hasNaver: !!(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET)
  });
});

// ── 네이버 API 키 저장 ────────────────────────────────────
app.post("/api/naver/set-keys", (req, res) => {
  const { clientId, clientSecret } = req.body;
  if (!clientId || !clientSecret) {
    return res.status(400).json({ ok: false, msg: "Client ID와 Secret이 누락되었습니다." });
  }
  
  try {
    saveToEnv("NAVER_CLIENT_ID", clientId);
    saveToEnv("NAVER_CLIENT_SECRET", clientSecret);
    res.json({ ok: true, msg: "✅ 네이버 API 키 저장 완료" });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// ── 제미니 API 키 저장 ────────────────────────────────────
app.post("/api/gemini/set-key", (req, res) => {
  const { apiKey, model } = req.body;
  if (!apiKey) {
    return res.status(400).json({ ok: false, msg: "API 키가 누락되었습니다." });
  }
  
  try {
    saveToEnv("GEMINI_API_KEY", apiKey);
    if (model) saveToEnv("GEMINI_MODEL", model);
    res.json({ ok: true, msg: "✅ Gemini API 키 저장 완료" });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// ── 제미니 AI 글쓰기 프록시 (CORS 우회 및 보안 강화) ─────────
app.post("/api/gemini/generate", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model  = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  
  if (!apiKey) {
    return res.status(401).json({ ok: false, msg: "Gemini API 키가 설정되지 않았습니다." });
  }
  
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ ok: false, msg: "prompt가 누락되었습니다." });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 4096,
          topP: 0.9
        }
      })
    });

    if (!resp.ok) {
      const err = await resp.json();
      return res.status(resp.status).json({ ok: false, msg: err?.error?.message || "Gemini API 오류" });
    }

    const data = await resp.json();
    const candidate = data?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || "";
    
    if (!text) {
      if (candidate?.finishReason === "SAFETY") {
        return res.status(400).json({ ok: false, msg: "⚠️ 안전 정책(Safety)에 의해 콘텐츠 생성이 차단되었습니다. 다른 키워드로 시도해 주세요." });
      }
      return res.status(400).json({ ok: false, msg: "Gemini AI가 빈 응답을 반환했습니다. 다시 시도해 주세요." });
    }

    res.json({ ok: true, text });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// ── 네이버 검색 API 프록시 ───────────────────────────
async function naverProxy(endpoint, query, display = 10, res) {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(401).json({ ok: false, msg: "네이버 API 키가 설정되지 않았습니다." });
  }
  try {
    const url = `https://openapi.naver.com/v1/search/${endpoint}?query=${encodeURIComponent(query)}&display=${display}&sort=date`;
    const resp = await fetch(url, {
      headers: {
        "X-Naver-Client-Id":     clientId,
        "X-Naver-Client-Secret": clientSecret,
      }
    });
    if (!resp.ok) {
      const errBody = await resp.text();
      return res.status(resp.status).json({ ok: false, msg: `네이버 API 오류: ${errBody}` });
    }
    const data = await resp.json();
    res.json({ ok: true, data });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
}

app.get("/api/naver/blog", (req, res) => {
  const { query, display = 10 } = req.query;
  if (!query) return res.status(400).json({ ok: false, msg: "query 필요" });
  naverProxy("blog.json", query, display, res);
});

app.get("/api/naver/news", (req, res) => {
  const { query, display = 10 } = req.query;
  if (!query) return res.status(400).json({ ok: false, msg: "query 필요" });
  naverProxy("news.json", query, display, res);
});

// ── 네이버 키워드 분석 ──────────────────────────────────
app.get("/api/naver/keyword-analysis", async (req, res) => {
  const { query } = req.query;
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!query) return res.status(400).json({ ok: false, msg: "query 필요" });
  if (!clientId || !clientSecret) {
    return res.status(401).json({ ok: false, msg: "네이버 API 키 없음" });
  }

  try {
    const [blogResp, newsResp] = await Promise.all([
      fetch(`https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(query)}&display=20&sort=sim`, {
        headers: { "X-Naver-Client-Id": clientId, "X-Naver-Client-Secret": clientSecret }
      }),
      fetch(`https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=10&sort=date`, {
        headers: { "X-Naver-Client-Id": clientId, "X-Naver-Client-Secret": clientSecret }
      })
    ]);

    const [blogData, newsData] = await Promise.all([blogResp.json(), newsResp.json()]);

    const totalBlogResults = blogData.total || 0;
    const blogItems = blogData.items || [];
    const newsItems = newsData.items || [];

    const titleTexts = blogItems.map(i => i.title.replace(/<[^>]+>/g, "")).join(" ");
    const wordFreq = {};
    titleTexts.split(/\s+/).forEach(w => {
      const cleaned = w.replace(/[^가-힣a-zA-Z0-9]/g, "");
      if (cleaned.length >= 2 && cleaned !== query) {
        wordFreq[cleaned] = (wordFreq[cleaned] || 0) + 1;
      }
    });
    const relatedKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([kw]) => kw);

    let competition = "낮음";
    if (totalBlogResults > 100000) competition = "높음";
    else if (totalBlogResults > 30000) competition = "중간";

    res.json({
      ok: true,
      query,
      totalBlogResults: totalBlogResults.toLocaleString(),
      competition,
      relatedKeywords
    });

  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🌐 BlogMaster AI 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
