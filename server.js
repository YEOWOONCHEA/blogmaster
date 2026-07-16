// ============================================================
// BlogMaster AI – server.js (Node.js 프록시 서버)
// 네이버 API CORS 우회 + 정적 파일 서버
// ============================================================
require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const fetch   = require("node-fetch");
const path    = require("path");

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── 네이버 API 키 저장소 (런타임) ─────────────────────────
let naverClientId     = process.env.NAVER_CLIENT_ID     || "";
let naverClientSecret = process.env.NAVER_CLIENT_SECRET || "";

// ── API 키 설정 엔드포인트 ────────────────────────────────
app.post("/api/naver/set-keys", (req, res) => {
  const { clientId, clientSecret } = req.body;
  if (!clientId || !clientSecret) {
    return res.status(400).json({ ok: false, msg: "clientId와 clientSecret 필요" });
  }
  naverClientId     = clientId;
  naverClientSecret = clientSecret;
  res.json({ ok: true, msg: "✅ 네이버 API 키 설정 완료" });
});

// ── 키 상태 확인 ──────────────────────────────────────────
app.get("/api/naver/status", (req, res) => {
  res.json({ connected: !!(naverClientId && naverClientSecret) });
});

// ── 네이버 검색 API 공통 프록시 ───────────────────────────
async function naverProxy(endpoint, query, display = 10, res) {
  if (!naverClientId || !naverClientSecret) {
    return res.status(401).json({ ok: false, msg: "네이버 API 키가 설정되지 않았습니다." });
  }
  try {
    const url = `https://openapi.naver.com/v1/search/${endpoint}?query=${encodeURIComponent(query)}&display=${display}&sort=date`;
    const resp = await fetch(url, {
      headers: {
        "X-Naver-Client-Id":     naverClientId,
        "X-Naver-Client-Secret": naverClientSecret,
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

// ── 블로그 검색 ───────────────────────────────────────────
app.get("/api/naver/blog", (req, res) => {
  const { query, display = 10 } = req.query;
  if (!query) return res.status(400).json({ ok: false, msg: "query 필요" });
  naverProxy("blog.json", query, display, res);
});

// ── 뉴스 검색 ─────────────────────────────────────────────
app.get("/api/naver/news", (req, res) => {
  const { query, display = 10 } = req.query;
  if (!query) return res.status(400).json({ ok: false, msg: "query 필요" });
  naverProxy("news.json", query, display, res);
});

// ── 연관 검색어 분석 (블로그 제목에서 키워드 추출) ─────────
app.get("/api/naver/keyword-analysis", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ ok: false, msg: "query 필요" });
  if (!naverClientId || !naverClientSecret) {
    return res.status(401).json({ ok: false, msg: "네이버 API 키 없음" });
  }

  try {
    // 블로그 + 뉴스 동시 검색
    const [blogResp, newsResp] = await Promise.all([
      fetch(`https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(query)}&display=20&sort=sim`, {
        headers: {
          "X-Naver-Client-Id":     naverClientId,
          "X-Naver-Client-Secret": naverClientSecret,
        }
      }),
      fetch(`https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=10&sort=date`, {
        headers: {
          "X-Naver-Client-Id":     naverClientId,
          "X-Naver-Client-Secret": naverClientSecret,
        }
      })
    ]);

    const [blogData, newsData] = await Promise.all([blogResp.json(), newsResp.json()]);

    const totalBlogResults = blogData.total || 0;
    const blogItems = blogData.items || [];
    const newsItems = newsData.items || [];

    // 블로그 제목에서 연관 키워드 추출
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

    // 경쟁도 추정 (블로그 총 결과수 기반)
    let competition = "낮음";
    if (totalBlogResults > 100000) competition = "높음";
    else if (totalBlogResults > 30000) competition = "중간";

    res.json({
      ok: true,
      query,
      totalBlogResults: totalBlogResults.toLocaleString(),
      competition,
      relatedKeywords,
      recentBlogs: blogItems.slice(0, 5).map(i => ({
        title: i.title.replace(/<[^>]+>/g, ""),
        link: i.link,
        desc: i.description.replace(/<[^>]+>/g, ""),
        date: i.postdate,
        blogger: i.bloggername
      })),
      recentNews: newsItems.slice(0, 3).map(i => ({
        title: i.title.replace(/<[^>]+>/g, ""),
        link: i.link,
        date: i.pubDate
      }))
    });

  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// ── 네이버 Datalab 검색어 트렌드 ─────────────────────────
app.post("/api/naver/datalab/trend", async (req, res) => {
  if (!naverClientId || !naverClientSecret) {
    return res.status(401).json({ ok: false, msg: "네이버 API 키 없음" });
  }
  const { startDate, endDate, timeUnit = "week", keywordGroups } = req.body;
  try {
    const resp = await fetch("https://openapi.naver.com/v1/datalab/search", {
      method: "POST",
      headers: {
        "X-Naver-Client-Id":     naverClientId,
        "X-Naver-Client-Secret": naverClientSecret,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ startDate, endDate, timeUnit, keywordGroups })
    });
    if (!resp.ok) {
      return res.status(resp.status).json({ ok: false, msg: "Datalab 오류" });
    }
    const data = await resp.json();
    res.json({ ok: true, data });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// ── 루트: index.html 서빙 ─────────────────────────────────
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log("┌─────────────────────────────────────────┐");
  console.log(`│  BlogMaster AI 서버 시작!               │`);
  console.log(`│  🌐 http://localhost:${PORT}               │`);
  console.log("│  🔑 네이버 API 설정 후 사용 가능        │");
  console.log("└─────────────────────────────────────────┘");
});
