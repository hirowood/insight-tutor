"use client";

import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import type { ChangeEvent } from "react";

interface SpeechControlsProps {
  text: string;
}

export function SpeechControls({ text }: SpeechControlsProps) {
  const {
    speak,
    pause,
    resume,
    stop,
    status,
    isSupported,
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
  } = useSpeechSynthesis();

  // 日本語の音声のみをフィルタリング
  const japaneseVoices = voices.filter((voice) => voice.lang.startsWith("ja"));

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-700">
          お使いのブラウザは音声読み上げに対応していません。
          Chrome、Edge、またはSafariをお試しください。
        </p>
      </div>
    );
  }

  const handleVoiceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const voice = voices.find((v) => v.name === e.target.value);
    if (voice) {
      setSelectedVoice(voice);
    }
  };

  const handleRateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRate(parseFloat(e.target.value));
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      {/* メインコントロール */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {status === "idle" && (
          <button
            onClick={() => speak(text)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98]"
            aria-label="読み上げを開始"
          >
            <span className="text-lg">🔊</span>
            <span>読み上げる</span>
          </button>
        )}

        {status === "speaking" && (
          <>
            <button
              onClick={pause}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 active:scale-[0.98]"
              aria-label="一時停止"
            >
              <span className="text-lg">⏸️</span>
              <span>一時停止</span>
            </button>
            <button
              onClick={stop}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:scale-[0.98]"
              aria-label="停止"
            >
              <span className="text-lg">⏹️</span>
              <span>停止</span>
            </button>
          </>
        )}

        {status === "paused" && (
          <>
            <button
              onClick={resume}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 active:scale-[0.98]"
              aria-label="再開"
            >
              <span className="text-lg">▶️</span>
              <span>再開</span>
            </button>
            <button
              onClick={stop}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:scale-[0.98]"
              aria-label="停止"
            >
              <span className="text-lg">⏹️</span>
              <span>停止</span>
            </button>
          </>
        )}

        {/* ステータス表示 */}
        <span
          className={`hidden sm:inline-block px-3 py-1 text-xs rounded-full ${
            status === "speaking"
              ? "bg-green-100 text-green-700"
              : status === "paused"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-600"
          }`}
          aria-live="polite"
        >
          {status === "speaking"
            ? "🎙️ 読み上げ中..."
            : status === "paused"
            ? "⏸️ 一時停止中"
            : "待機中"}
        </span>
      </div>

      {/* 詳細設定 */}
      <details className="text-sm">
        <summary className="cursor-pointer text-gray-600 hover:text-gray-800 py-2">
          ⚙️ 音声設定
        </summary>
        <div className="mt-3 space-y-4 pl-4 border-l-2 border-gray-200">
          {/* 音声選択 */}
          {japaneseVoices.length > 0 && (
            <div>
              <label htmlFor="voice-select" className="block text-gray-600 mb-2">
                音声を選択:
              </label>
              <select
                id="voice-select"
                value={selectedVoice?.name ?? ""}
                onChange={handleVoiceChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              >
                {japaneseVoices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 読み上げ速度 */}
          <div>
            <label htmlFor="rate-slider" className="block text-gray-600 mb-2">
              読み上げ速度: {rate.toFixed(1)}x
            </label>
            <input
              id="rate-slider"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={handleRateChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>遅い</span>
              <span>速い</span>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}