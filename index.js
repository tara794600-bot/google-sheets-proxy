
  import express from "express";
  import bodyParser from "body-parser";
  import { google } from "googleapis";
  import cors from "cors";

  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  // 서비스 계정 키(JSON) → Render 환경변수에 저장한 값 불러오기
  const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

  // Google Auth
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  // 스프레드시트 ID (Render 환경변수에 저장)
  const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
  const RANGE = "data_sheet!A2:D";

  // 1) 데이터 가져오기
  app.get("/data", async (req, res) => {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
      });
      res.json(response.data.values || []);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // 2) 데이터 추가하기
  app.post("/data", async (req, res) => {
    try {
      const { name, phone, content, agreement } = req.body;

      const response = await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
        valueInputOption: "RAW",
        requestBody: {
          values: [[name, phone, content, agreement ? "동의" : "비동의"]],
        },
      });

      res.json({ success: true, result: response.data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));



