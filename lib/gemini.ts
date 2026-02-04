import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import type { AllowedImageType } from "./schemas";

// 環境変数からAPIキーを取得（サーバーサイドのみ）
const getApiKey = (): string => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please set it in .env.local"
    );
  }
  return apiKey;
};

// Gemini クライアントのシングルトンインスタンス
let geminiClient: GoogleGenerativeAI | null = null;

const getGeminiClient = (): GoogleGenerativeAI => {
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(getApiKey());
  }
  return geminiClient;
};

// 画像解析用のプロンプト
const ANALYSIS_PROMPT = `あなたは優秀な教育アシスタントです。
この画像は参考書や教科書のページです。

以下の指示に従って、内容を解説してください：

1. **概要**: このページの主なトピックを1-2文で説明してください。
2. **詳細解説**: 内容を初心者にもわかりやすく、段階的に説明してください。
3. **重要ポイント**: 覚えるべき重要な概念や用語をリストアップしてください。
4. **補足**: 理解を深めるための追加情報やヒントがあれば提供してください。

出力形式:
- マークダウン形式で見やすく整理してください
- 日本語で出力してください
- 専門用語には簡単な説明を添えてください`;

// 画像をGemini APIで解析
export async function analyzeImageWithGemini(
  base64Data: string,
  mimeType: AllowedImageType
): Promise<string> {
  const client = getGeminiClient();
  
  // 最新のモデル名を使用
  const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

  // 画像パートの作成
  const imagePart: Part = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };

  // テキストパートの作成
  const textPart: Part = {
    text: ANALYSIS_PROMPT,
  };

  try {
    const result = await model.generateContent([textPart, imagePart]);
    const response = result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error("AI からの応答が空でした");
    }

    return text;
  } catch (error) {
    // エラーの詳細をログに記録（サーバーサイドのみ）
    console.error("Gemini API Error:", error);

    if (error instanceof Error) {
      // APIエラーの種類に応じたメッセージ
      if (error.message.includes("API_KEY")) {
        throw new Error("API認証に失敗しました。設定を確認してください。");
      }
      if (error.message.includes("quota")) {
        throw new Error("API利用制限に達しました。しばらく待ってから再試行してください。");
      }
      if (error.message.includes("SAFETY")) {
        throw new Error("画像の内容を解析できませんでした。別の画像をお試しください。");
      }
      throw error;
    }

    throw new Error("画像の解析中に予期せぬエラーが発生しました。");
  }
}