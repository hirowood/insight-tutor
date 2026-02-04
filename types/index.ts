// 画像プレビュー用の型
export interface ImagePreview {
  file: File;
  previewUrl: string;
  base64Data: string;
}

// 音声合成の状態
export type SpeechStatus = "idle" | "speaking" | "paused";

// 音声合成フックの戻り値
export interface UseSpeechSynthesisReturn {
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  status: SpeechStatus;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice) => void;
  rate: number;
  setRate: (rate: number) => void;
}

// 解析状態
export type AnalysisStatus = "idle" | "uploading" | "analyzing" | "complete" | "error";

// アプリケーション全体の状態
export interface AppState {
  imagePreview: ImagePreview | null;
  analysisStatus: AnalysisStatus;
  analysisResult: string | null;
  errorMessage: string | null;
}