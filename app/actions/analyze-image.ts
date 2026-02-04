"use server";

import { analyzeImageWithGemini } from "@/lib/gemini";
import {
  imageUploadSchema,
  type AnalysisResponse,
  type ImageUploadInput,
} from "@/lib/schemas";

export async function analyzeImage(
  input: ImageUploadInput
): Promise<AnalysisResponse> {
  try {
    // 入力のバリデーション
    const validationResult = imageUploadSchema.safeParse(input);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors
        .map((e) => e.message)
        .join(", ");
      return {
        success: false,
        error: {
          message: errorMessage,
          code: "INVALID_INPUT",
        },
      };
    }

    const { base64Data, mimeType } = validationResult.data;

    // Gemini APIで画像を解析
    const analysisContent = await analyzeImageWithGemini(base64Data, mimeType);

    return {
      success: true,
      data: {
        content: analysisContent,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Analysis error:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "画像の解析中にエラーが発生しました";

    return {
      success: false,
      error: {
        message: errorMessage,
        code: "API_ERROR",
      },
    };
  }
}