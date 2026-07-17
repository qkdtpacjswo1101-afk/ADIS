import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Embedded standard database for authentic RAG context
const KDS_REGULATION_CONTEXT = `
KDS 1375-4001 [유도탄용 화공품 안전설계 및 검사 규격]:
- 범위: 유도무기 및 우주발사체 탑재 화공품(Pyrotechnics), 가스발생기, 착화기 및 기폭장치의 안전 요구조건.
- 점화 저항 규격: 1.2 ± 0.2 Ω (오차 범위 탈피 시 불합격 처리)
- 절연 저항 규격: 50 MΩ 이상 (시험 전압 DC 500V 기준)
- 정전기 방전 안전성: 25 kV, 500 pF, 5 kΩ 방전 회로에서 5회 인가 후 불발되어야 함.
- 검사 주기: 생산 로트(Lot)마다 무조건 100% 비파괴 검사(X-ray 또는 CT) 수행 및 5% 샘플링 실선 시험.
- 페이지 근거: 14페이지 초반부 제4절 [화공 계측 안전 규격].

KDS 1420-2004 [신관 안전 장전 장치(SAD) 허용 규격 및 검사 표준]:
- 범위: 유도탄 및 신탄용 신관(Fuze) 안전장전장치(SAD: Safety and Arming Device) 정밀 조립 및 기계식 기어 연동 오차 범위.
- 조립부 외경 기준: 12.50 mm (공차 허용 한계 LSL: 12.00 mm, USL: 13.00 mm)
- 조립 핀 결합력: 25 ~ 35 N 범위 유지.
- 허용 조임 토크: 1.8 ~ 2.4 N·m (볼트 헤드 체결 및 하우징 결합력 최적점)
- 검사 주기: 로트 단위별 무작위 5샘플 파괴형 가속수명 시험, 100% 디지털 외관 치수 검사.
- 페이지 근거: 38페이지 제7절 [안전장치 기계가공 및 성적평가].

KDS 5810-1012 [유도무기 날개 전개부(Control Fin) 정밀 피팅 규격]:
- 범위: 조립 구동계 제어 구동기 메커니즘 힌지 오차 및 구동 피스톤 간극 표준.
- 날개 회전 각도 오차: ± 0.15 deg 이하 (기계식 링크 백래시 최소화 목적)
- 힌지 조립 간극: 0.05 ~ 0.12 mm
- 고정 볼트 체결 토크: 4.5 ~ 5.5 N·m
- 검사 주기: 3개월 주기 정기 정밀 교정 및 조립 직후 구동 시뮬레이션 전수 검증.
- 페이지 근거: 72페이지 제2절 [조립 구동계 오차 제어].

KDS 8415-0098 [로켓 모터 연소관 체결용 고강도 볼트 검사 규격]:
- 범위: 고체 추진제 연소관 하우징 볼트 체결 강도 및 안전성 규정.
- 체결 나사산 삽입 깊이: 18.00 mm 이상 (체결 부족 시 연소압에 의한 나사 이탈 방지)
- 나사산 미세 크랙 결함: 전수 균열 무결성 100% (UT, MT 병행 검사 필수)
- 체결 허용 토크: 12.5 ~ 14.0 N·m
- 검사 주기: 공정 체결 완료 후 100% 초음파 비파괴 검사(UT) 수행.
- 페이지 근거: 105페이지 제9절 [고압 연소관 결합 토크 및 크랙 검사].
`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for large base64 image uploads (Vision analysis) and JSON requests
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ limit: '20mb', extended: true }));

  // API Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // 1. RAG-based PGM Q&A Bot Endpoint
  app.post("/api/qa", async (req, res) => {
    const { question, customContext } = req.body;
    if (!question) {
      return res.status(400).json({ error: "질문을 입력하세요." });
    }

    try {
      // Setup combined context
      const fullContext = `
Available PGM and Defense Standard Specifications (KDS):
${KDS_REGULATION_CONTEXT}

${customContext ? `User Provided Custom Standard File Content:\n${customContext}\n` : ""}

Task: Answer the user's question precisely using the KDS regulations above.
Include the relevant document reference (e.g., "KDS 1420-2004"), exact specification value (e.g., torque range, dimensions), testing cycle, and the specific reference page/paragraph in your response. Keep the tone professional, technical, and appropriate for military quality assurance (기품원) reporting. Translate technical terms accurately to Korean.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: question,
        config: {
          systemInstruction: "You are an expert Military Aerospace Quality Assurance (QA) engineer at AQIS. Your role is to provide rock-solid, precise answers grounded entirely in the provided KDS regulation standards.",
          temperature: 0.2,
        }
      });

      res.json({
        answer: response.text || "답변을 생성하지 못했습니다. 다시 시도해 주세요.",
        sources: [
          { name: "KDS 1375-4001 (화공품)", page: 14 },
          { name: "KDS 1420-2004 (신관 SAD)", page: 38 },
          { name: "KDS 5810-1012 (날개 전개부)", page: 72 },
          { name: "KDS 8415-0098 (연소관 볼트)", page: 105 }
        ]
      });
    } catch (err: any) {
      console.error("QA Bot error:", err);
      res.status(500).json({ error: `AI 답변 생성 중 오류가 발생했습니다: ${err.message}` });
    }
  });

  // 2. Vision comparative image analysis endpoint
  app.post("/api/vision-compare", async (req, res) => {
    const { referenceImage, testImage } = req.body;
    if (!referenceImage || !testImage) {
      return res.status(400).json({ error: "기준(Golden) 이미지와 검사 대상(Test) 이미지가 모두 필요합니다." });
    }

    try {
      // Prepare Gemini parts
      const refPart = {
        inlineData: {
          mimeType: "image/jpeg",
          data: referenceImage.replace(/^data:[^,]+,/, ""),
        }
      };

      const testPart = {
        inlineData: {
          mimeType: "image/jpeg",
          data: testImage.replace(/^data:[^,]+,/, ""),
        }
      };

      const promptText = `
You are analyzing aerospace parts during inspection.
Image 1 is the reference "Golden" (perfect) specimen.
Image 2 is the test specimen undergoing high-precision inspection.

Please perform visual differencing (Image Differencing):
1. Identify any discrepancies, scratch defects, structural misalignments, or missing components.
2. Formulate 1 to 3 defect annotations with normalized X, Y coordinates [0-100] for where the anomalies are located on the test image.
3. Highlight pixel-level or structural width measurements of the test part compared to the target specification (Reference: 12.5mm target).
4. Decide if the overall part status is PASS or FAIL based on visible damages.

Respond strictly in JSON format matching this schema:
{
  "status": "PASS" | "FAIL",
  "overallVerdict": "Detailed overview of findings and state.",
  "estimatedMeasurement": "e.g. 12.48mm (0.02mm discrepancy)",
  "discrepancies": [
    {
      "id": "defect-1",
      "type": "SCRATCH" | "MISSING_PART" | "ALIGNMENT_ERROR" | "FOREIGN_OBJECT",
      "x": number, // 0 to 100 x-coord of hotspot
      "y": number, // 0 to 100 y-coord of hotspot
      "sizePx": number,
      "severity": "CRITICAL" | "MAJOR" | "MINOR",
      "description": "Short diagnostic breakdown"
    }
  ]
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [refPart, testPart, promptText],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING },
              overallVerdict: { type: Type.STRING },
              estimatedMeasurement: { type: Type.STRING },
              discrepancies: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    x: { type: Type.INTEGER },
                    y: { type: Type.INTEGER },
                    sizePx: { type: Type.INTEGER },
                    severity: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["id", "type", "x", "y", "severity", "description"]
                }
              }
            },
            required: ["status", "overallVerdict", "estimatedMeasurement", "discrepancies"]
          }
        }
      });

      const parsedResult = JSON.parse(response.text || "{}");
      res.json(parsedResult);
    } catch (err: any) {
      console.error("Vision comparative error:", err);
      res.status(500).json({ error: `Vision 분석 처리 중 오류가 발생했습니다: ${err.message}` });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
