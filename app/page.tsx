"use client";

import { useState, useCallback } from "react";
import { ImageUploader } from "@/components/image-uploader";
import { AnalysisResult } from "@/components/analysis-result";
import { LoadingSpinner } from "@/components/loading-spinner";
import { analyzeImage } from "@/app/actions/analyze-image";
import type { ImagePreview, AnalysisStatus } from "@/types";
import type { AllowedImageType } from "@/lib/schemas";

interface AnalysisData {
  content: string;
  timestamp: string;
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<ImagePreview | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [result, setResult] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 画像選択時の処理
  const handleImageSelect = useCallback((imageData: ImagePreview) => {
    setSelectedImage(imageData);
    setResult(null);
    setError(null);
  }, []);

  // 解析実行
  const handleAnalyze = useCallback(async () => {
    if (!selectedImage) return;

    setStatus("analyzing");
    setError(null);

    try {
      const response = await analyzeImage({
        base64Data: selectedImage.base64Data,
        mimeType: selectedImage.file.type as AllowedImageType,
        fileName: selectedImage.file.name,
      });

      if (response.success) {
        setResult(response.data);
        setStatus("complete");
      } else {
        setError(response.error.message);
        setStatus("error");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "予期せぬエラーが発生しました"
      );
      setStatus("error");
    }
  }, [selectedImage]);

  // リセット
  const handleReset = useCallback(() => {
    setSelectedImage(null);
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-4xl">📚</span>
            <span>Insight Tutor</span>
          </h1>
          <p className="mt-2 text-gray-600">
            参考書のページを画像でアップロードすると、AIがわかりやすく解説します
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* ステップ1: 画像アップロード */}
        <section aria-labelledby="upload-section">
          <h2 id="upload-section" className="sr-only">
            画像アップロード
          </h2>
          <ImageUploader
            onImageSelect={handleImageSelect}
            isDisabled={status === "analyzing"}
          />
        </section>

        {/* 解析ボタン */}
        {selectedImage && status !== "analyzing" && !result && (
          <div className="flex justify-center">
            <button
              onClick={handleAnalyze}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              ✨ AIで解析する
            </button>
          </div>
        )}

        {/* ローディング */}
        {status === "analyzing" && (
          <div className="flex justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <LoadingSpinner
                message="AIが画像を解析しています..."
                size="lg"
              />
            </div>
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div
            className="max-w-2xl mx-auto p-6 bg-red-50 border border-red-200 rounded-xl"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-800">エラーが発生しました</h3>
                <p className="mt-1 text-red-600">{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  やり直す
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 解析結果 */}
        {result && (
          <section aria-labelledby="result-section" className="space-y-4">
            <AnalysisResult
              content={result.content}
              timestamp={result.timestamp}
            />
            <div className="flex justify-center pt-4">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <span>🔄</span>
                <span>新しい画像を解析</span>
              </button>
            </div>
          </section>
        )}

        {/* 使い方ガイド（初期状態のみ） */}
        {status === "idle" && !selectedImage && (
          <section className="max-w-2xl mx-auto" aria-labelledby="guide-section">
            <h2 id="guide-section" className="text-lg font-semibold text-gray-700 mb-4 text-center">
              💡 使い方
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="text-3xl mb-2">1️⃣</div>
                <h3 className="font-medium text-gray-800">画像をアップロード</h3>
                <p className="text-sm text-gray-600 mt-1">
                  参考書や教科書のページを撮影した画像を選択
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="text-3xl mb-2">2️⃣</div>
                <h3 className="font-medium text-gray-800">AIが解析</h3>
                <p className="text-sm text-gray-600 mt-1">
                  AIが内容を読み取り、わかりやすく解説
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="text-3xl mb-2">3️⃣</div>
                <h3 className="font-medium text-gray-800">テキスト＆音声で学習</h3>
                <p className="text-sm text-gray-600 mt-1">
                  解説を読んだり、音声で聴いたりして理解
                </p>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* フッター */}
      <footer className="mt-16 py-8 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>Insight Tutor - マルチモーダル参考書学習アシスタント</p>
          <p className="mt-1">Powered by Google Gemini AI</p>
        </div>
      </footer>
    </main>
  );
}