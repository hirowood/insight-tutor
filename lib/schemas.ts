import { z } from "zod";

// 許可される画像MIMEタイプ
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

// 最大ファイルサイズ (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// 画像アップロードのバリデーションスキーマ
export const imageUploadSchema = z.object({
  base64Data: z
    .string()
    .min(1, "画像データが空です")
    .refine(
      (data) => data.length <= MAX_FILE_SIZE * 1.37, // Base64は約37%増加
      "ファイルサイズが大きすぎます（最大10MB）"
    ),
  mimeType: z.enum(ALLOWED_IMAGE_TYPES, {
    errorMap: () => ({
      message: "サポートされていない画像形式です（JPEG, PNG, WebP, GIFのみ対応）",
    }),
  }),
  fileName: z.string().min(1, "ファイル名が必要です"),
});

// Server Actionのレスポンススキーマ
export const analysisResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: z.object({
      content: z.string().min(1, "解析結果が空です"),
      timestamp: z.string().datetime(),
    }),
  }),
  z.object({
    success: z.literal(false),
    error: z.object({
      message: z.string(),
      code: z.enum(["INVALID_INPUT", "API_ERROR", "UNKNOWN"]),
    }),
  }),
]);

// 型のエクスポート
export type ImageUploadInput = z.infer<typeof imageUploadSchema>;
export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;
export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];