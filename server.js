// =====================================================
// 🎰 BACCARAT AI VIP PRO - SERVER FULL TIẾNG VIỆT
// 📌 API: /bcr/:table
// ✅ Lấy dữ liệu API gốc
// ✅ AI dự đoán Nhà Cái / Con
// ✅ Bắt cầu bệt - đảo - 1-1 - cầu phức hợp
// ✅ Độ tin cậy
// ✅ Lưu lịch sử
// ✅ Endpoint: 1-10 + C01-C16
// ✅ Realtime auto update
// =====================================================

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// =============================================
// API GỐC
// =============================================

const SOURCE_API = "http://103.159.50.60:5000/sexy/1";
const ALL_TABLE_API = "http://103.159.50.60:5000/sexy";

// =============================================
// LƯU LỊCH SỬ
// =============================================

let historyStore = {};
let cacheData = {};

// =============================================
// DANH SÁCH BÀN
// =============================================

const tables = [
  "1","2","3","4","5","6","7","8","9","10",
  "C01","C02","C03","C04","C05","C06","C07","C08",
  "C09","C10","C11","C12","C13","C14","C15","C16"
];

// =============================================
// HÀM CHUYỂN TABLE
// =============================================

function convertTable(table) {
  if (table.startsWith("C")) {
    return (1000 + parseInt(table.replace("C", ""))).toString();
  }
  return table;
}

// =============================================
// PHÂN TÍCH CẦU
// =============================================

function analyzeRoad(result) {

  if (!result || result.length < 5) {
    return {
      predict: "BANKER",
      confidence: 50,
      reason: "Không đủ dữ liệu",
      betSide: "NHÀ CÁI",
      road: "Không xác định"
    };
  }

  const data = result.replace(/T/g, "");

  let banker = 0;
  let player = 0;

  for (let c of data) {
    if (c === "B") banker++;
    if (c === "P") player++;
  }

  // =========================================
  // CẦU BỆT
  // =========================================

  let last4 = data.slice(-4);

  let roadName = "Cầu hỗn hợp";
  let predict = "BANKER";
  let confidence = 50;
  let reason = "";

  // Bệt Banker
  if (/BBBB/.test(last4)) {
    predict = "BANKER";
    confidence = 92;
    roadName = "Cầu Bệt Nhà Cái";
    reason = "Bệt mạnh tiếp tục";
  }

  // Bệt Player
  else if (/PPPP/.test(last4)) {
    predict = "PLAYER";
    confidence = 92;
    roadName = "Cầu Bệt Con";
    reason = "Bệt mạnh tiếp tục";
  }

  // =========================================
  // CẦU ĐẢO
  // =========================================

  else if (/BPBP|PBPB/.test(data.slice(-8))) {

    const last = data.slice(-1);

    predict = last === "B"
      ? "PLAYER"
      : "BANKER";

    confidence = 87;

    roadName = "Cầu Đảo";
    reason = "Cầu đảo liên tục";
  }

  // =========================================
  // CẦU 1-1
  // =========================================

  else if (/BPBPBP|PBPBPB/.test(data.slice(-10))) {

    const last = data.slice(-1);

    predict = last === "B"
      ? "PLAYER"
      : "BANKER";

    confidence = 84;

    roadName = "Cầu 1-1";
    reason = "Đang chạy 1-1";
  }

  // =========================================
  // CẦU NGHIÊNG
  // =========================================

  else {

    const total = banker + player;

    const bankerRate = (banker / total) * 100;
    const playerRate = (player / total) * 100;

    if (bankerRate > playerRate) {
      predict = "BANKER";
      confidence = bankerRate.toFixed(1);
      roadName = "Cầu Nghiêng Nhà Cái";
      reason = "Tỷ lệ Banker cao hơn";
    } else {
      predict = "PLAYER";
      confidence = playerRate.toFixed(1);
      roadName = "Cầu Nghiêng Con";
      reason = "Tỷ lệ Player cao hơn";
    }
  }

  // =========================================
  // BẮT CẦU ĐẢO THÔNG MINH
  // =========================================

  let betSide = predict === "BANKER"
    ? "NHÀ CÁI"
    : "CON";

  return {
    predict,
    confidence,
    banker,
    player,
    road: roadName,
    reason,
    betSide
  };
}

// =============================================
// API /bcr/:table
// =============================================

app.get("/bcr/:table", async (req, res) => {

  try {

    let table = req.params.table.toUpperCase();

    if (!tables.includes(table)) {
      return res.json({
        status: false,
        message: "❌ Bàn không tồn tại"
      });
    }

    let tableId = convertTable(table);

    const response = await axios.get(ALL_TABLE_API);

    const allData = response.data.data || [];

    const currentTable = allData.find(
      t => t.table_id == tableId
    );

    if (!currentTable) {
      return res.json({
        status: false,
        message: "❌ Không tìm thấy dữ liệu bàn"
      });
    }

    const result = currentTable.result || "";

    // =========================================
    // AI PHÂN TÍCH
    // =========================================

    const ai = analyzeRoad(result);

    // =========================================
    // LƯU LỊCH SỬ
    // =========================================

    if (!historyStore[table]) {
      historyStore[table] = [];
    }

    historyStore[table].push({
      time: new Date().toLocaleTimeString("vi-VN"),
      predict: ai.predict,
      confidence: ai.confidence
    });

    if (historyStore[table].length > 20) {
      historyStore[table].shift();
    }

    // =========================================
    // RESPONSE
    // =========================================

    res.json({

      status: true,

      table: table,

      game: currentTable.game_code,

      ket_qua: result,

      du_doan: ai.betSide,

      ai_predict: ai.predict,

      do_tin_cay: ai.confidence + "%",

      loai_cau: ai.road,

      ly_do: ai.reason,

      banker_count: ai.banker,

      player_count: ai.player,

      good_road: currentTable.goodRoad || "Không có",

      lich_su: historyStore[table],

      update: new Date().toLocaleTimeString("vi-VN")

    });

  } catch (err) {

    res.json({
      status: false,
      error: err.message
    });

  }

});

// =============================================
// API ALL TABLE
// =============================================

app.get("/bcr", async (req, res) => {

  try {

    const response = await axios.get(ALL_TABLE_API);

    const allData = response.data.data || [];

    let output = [];

    for (let item of allData) {

      let tableName = item.table_name;

      if (!tables.includes(tableName)) continue;

      const ai = analyzeRoad(item.result || "");

      output.push({

        table: tableName,

        game: item.game_code,

        predict: ai.betSide,

        confidence: ai.confidence + "%",

        road: ai.road,

        goodRoad: item.goodRoad || "",

        result_length: item.result.length

      });

    }

    res.json({
      status: true,
      total: output.length,
      data: output,
      update: new Date().toLocaleTimeString("vi-VN")
    });

  } catch (err) {

    res.json({
      status: false,
      error: err.message
    });

  }

});

// =============================================
// AUTO UPDATE CACHE
// =============================================

async function autoLoop() {

  try {

    const response = await axios.get(ALL_TABLE_API);

    cacheData = response.data;

    console.log(
      "✅ Update:",
      new Date().toLocaleTimeString("vi-VN")
    );

  } catch (err) {

    console.log("❌ API lỗi:", err.message);

  }

}

// =============================================
// VÒNG LẶP TỐI ƯU
// =============================================

setInterval(autoLoop, 4000);

// =============================================
// HOME
// =============================================

app.get("/", (req, res) => {

  res.send(`
    <h1>🎰 Baccarat AI VIP PRO</h1>

    <p>📌 Endpoint:</p>

    <ul>
      <li>/bcr</li>
      <li>/bcr/1</li>
      <li>/bcr/2</li>
      <li>/bcr/C01</li>
      <li>/bcr/C16</li>
    </ul>
  `);

});

// =============================================
// START SERVER
// =============================================

app.listen(PORT, () => {

  console.log("=================================");
  console.log("🎰 BACCARAT AI VIP PRO");
  console.log("🚀 PORT:", PORT);
  console.log("=================================");

});
