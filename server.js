// =======================================================
// 🎰 BACCARAT AI VIP PRO MAX
// ✅ Full bàn 1-10 + C01-C16
// ✅ AI thuật toán cầu nâng cao
// ✅ Cầu bệt
// ✅ Cầu đảo
// ✅ Cầu 1-1
// ✅ Cầu nghiêng
// ✅ Cầu phức hợp
// ✅ Độ tin cậy AI
// ✅ Lưu lịch sử
// ✅ API realtime
// ✅ Anti lỗi Render
// =======================================================

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// =======================================================
// API GỐC
// =======================================================

const API_URL = "http://103.159.50.60:5000/sexy";

// =======================================================
// LƯU CACHE + HISTORY
// =======================================================

let cache = [];
let history = {};

// =======================================================
// DANH SÁCH BÀN
// =======================================================

const TABLES = [
  "1","2","3","4","5","6","7","8","9","10",
  "C01","C02","C03","C04","C05","C06","C07","C08",
  "C09","C10","C11","C12","C13","C14","C15","C16"
];

// =======================================================
// CHUYỂN TABLE
// =======================================================

function getTableName(item) {

  if (parseInt(item.table_id) >= 1001) {

    return "C" + (
      parseInt(item.table_id) - 1000
    ).toString().padStart(2, "0");

  }

  return item.table_name;
}

// =======================================================
// TÍNH %
// =======================================================

function percent(a, b) {

  if (b === 0) return 0;

  return ((a / b) * 100).toFixed(1);
}

// =======================================================
// AI THUẬT TOÁN
// =======================================================

function analyzeRoad(result) {

  if (!result) {

    return {
      predict: "BANKER",
      bet: "NHÀ CÁI",
      confidence: 50,
      road: "Không có dữ liệu",
      reason: "Chờ dữ liệu"
    };

  }

  // bỏ T
  let data = result.replace(/T/g, "");

  // tối thiểu
  if (data.length < 4) {

    return {
      predict: "BANKER",
      bet: "NHÀ CÁI",
      confidence: 50,
      road: "Dữ liệu ít",
      reason: "Không đủ dữ liệu"
    };

  }

  // =====================================================
  // ĐẾM
  // =====================================================

  let B = 0;
  let P = 0;

  for (let i of data) {

    if (i === "B") B++;
    if (i === "P") P++;

  }

  // =====================================================
  // LAST
  // =====================================================

  const last1 = data.slice(-1);
  const last2 = data.slice(-2);
  const last3 = data.slice(-3);
  const last4 = data.slice(-4);
  const last6 = data.slice(-6);
  const last8 = data.slice(-8);

  // =====================================================
  // DEFAULT
  // =====================================================

  let predict = "BANKER";
  let confidence = 50;
  let road = "Hỗn hợp";
  let reason = "AI cơ bản";

  // =====================================================
  // CẦU BỆT SIÊU MẠNH
  // =====================================================

  if (/BBBB/.test(last4)) {

    predict = "BANKER";
    confidence = 96;
    road = "Cầu Bệt Nhà Cái";
    reason = "4 bệt Banker";

  }

  else if (/PPPP/.test(last4)) {

    predict = "PLAYER";
    confidence = 96;
    road = "Cầu Bệt Con";
    reason = "4 bệt Player";

  }

  // =====================================================
  // CẦU ĐẢO
  // =====================================================

  else if (/BPBPBP|PBPBPB/.test(last6)) {

    predict = last1 === "B"
      ? "PLAYER"
      : "BANKER";

    confidence = 90;

    road = "Cầu Đảo";

    reason = "Đảo liên tục";

  }

  // =====================================================
  // CẦU 2-2
  // =====================================================

  else if (
    /BBPPBB|PPBBPP/.test(last6)
  ) {

    predict = last2 === "BB"
      ? "PLAYER"
      : "BANKER";

    confidence = 88;

    road = "Cầu 2-2";

    reason = "Đang chạy 2-2";

  }

  // =====================================================
  // CẦU 3-3
  // =====================================================

  else if (
    /BBBPPP|PPPBBB/.test(last6)
  ) {

    predict = last3 === "BBB"
      ? "PLAYER"
      : "BANKER";

    confidence = 85;

    road = "Cầu 3-3";

    reason = "Đang chạy 3-3";

  }

  // =====================================================
  // CẦU PHỨC HỢP
  // =====================================================

  else {

    const bankerRate = percent(B, data.length);
    const playerRate = percent(P, data.length);

    if (B > P) {

      predict = "BANKER";
      confidence = bankerRate;
      road = "Cầu Nghiêng Nhà Cái";
      reason = "Tỷ lệ Banker cao";

    }

    else {

      predict = "PLAYER";
      confidence = playerRate;
      road = "Cầu Nghiêng Con";
      reason = "Tỷ lệ Player cao";

    }

  }

  // =====================================================
  // BET
  // =====================================================

  const bet = predict === "BANKER"
    ? "NHÀ CÁI"
    : "CON";

  return {

    predict,
    bet,
    confidence,
    road,
    reason,

    banker_total: B,
    player_total: P,

    banker_percent: percent(B, data.length),
    player_percent: percent(P, data.length)

  };

}

// =======================================================
// UPDATE CACHE
// =======================================================

async function updateCache() {

  try {

    const res = await axios.get(API_URL);

    cache = res.data.data || [];

    console.log(
      "✅ UPDATE:",
      new Date().toLocaleTimeString("vi-VN")
    );

  } catch (e) {

    console.log("❌ API ERROR:", e.message);

  }

}

// =======================================================
// LOOP REALTIME
// =======================================================

setInterval(updateCache, 4000);

updateCache();

// =======================================================
// HOME
// =======================================================

app.get("/", (req, res) => {

  res.send(`
  <center>

    <h1>🎰 BACCARAT AI VIP PRO MAX</h1>

    <p>✅ API Đang Hoạt Động</p>

    <hr>

    <h3>📌 ENDPOINT</h3>

    <p>/bcr</p>

    <p>/bcr/1</p>

    <p>/bcr/2</p>

    <p>/bcr/C01</p>

    <p>/bcr/C16</p>

  </center>
  `);

});

// =======================================================
// FULL TABLE
// =======================================================

app.get("/bcr", async (req, res) => {

  try {

    let output = [];

    for (let item of cache) {

      let table = getTableName(item);

      if (!TABLES.includes(table)) continue;

      const result = item.result || "";

      if (!result) continue;

      const ai = analyzeRoad(result);

      // ===============================================
      // HISTORY
      // ===============================================

      if (!history[table]) {
        history[table] = [];
      }

      history[table].push({
        predict: ai.bet,
        confidence: ai.confidence,
        time: new Date().toLocaleTimeString("vi-VN")
      });

      if (history[table].length > 20) {
        history[table].shift();
      }

      output.push({

        table,

        game: item.game_code,

        predict: ai.bet,

        ai_predict: ai.predict,

        confidence: ai.confidence + "%",

        road: ai.road,

        reason: ai.reason,

        banker_total: ai.banker_total,

        player_total: ai.player_total,

        banker_percent: ai.banker_percent + "%",

        player_percent: ai.player_percent + "%",

        good_road: item.goodRoad || "",

        result,

        history: history[table],

        update: new Date().toLocaleTimeString("vi-VN")

      });

    }

    res.json({

      status: true,

      total: output.length,

      server: "BACCARAT AI VIP PRO MAX",

      update: new Date().toLocaleTimeString("vi-VN"),

      data: output

    });

  } catch (e) {

    res.json({
      status: false,
      error: e.message
    });

  }

});

// =======================================================
// SINGLE TABLE
// =======================================================

app.get("/bcr/:table", async (req, res) => {

  try {

    const tableReq = req.params.table.toUpperCase();

    let found = null;

    for (let item of cache) {

      let table = getTableName(item);

      if (table === tableReq) {

        found = item;

        break;

      }

    }

    if (!found) {

      return res.json({
        status: false,
        message: "Không tìm thấy bàn"
      });

    }

    const ai = analyzeRoad(found.result || "");

    res.json({

      status: true,

      table: tableReq,

      game: found.game_code,

      predict: ai.bet,

      ai_predict: ai.predict,

      confidence: ai.confidence + "%",

      road: ai.road,

      reason: ai.reason,

      banker_total: ai.banker_total,

      player_total: ai.player_total,

      banker_percent: ai.banker_percent + "%",

      player_percent: ai.player_percent + "%",

      good_road: found.goodRoad || "",

      result: found.result,

      history: history[tableReq] || [],

      update: new Date().toLocaleTimeString("vi-VN")

    });

  } catch (e) {

    res.json({
      status: false,
      error: e.message
    });

  }

});

// =======================================================
// START
// =======================================================

app.listen(PORT, () => {

  console.log("==================================");
  console.log("🎰 BACCARAT AI VIP PRO MAX");
  console.log("🚀 PORT:", PORT);
  console.log("==================================");

});
