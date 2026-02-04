"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { SpeechStatus, UseSpeechSynthesisReturn } from "@/types";

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1.0);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // ブラウザサポートの確認と音声リストの取得
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        // 日本語の音声を優先的に選択
        const japaneseVoice = availableVoices.find(
          (voice) => voice.lang.startsWith("ja")
        );
        if (japaneseVoice && !selectedVoice) {
          setSelectedVoice(japaneseVoice);
        }
      };

      // 音声リストの読み込み
      loadVoices();

      // 一部のブラウザでは非同期で音声リストが読み込まれる
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, [selectedVoice]);

  // テキストの前処理（マークダウン記号の除去など）
  const preprocessText = useCallback((text: string): string => {
    return text
      // マークダウンの見出し記号を除去
      .replace(/^#{1,6}\s+/gm, "")
      // 太字・斜体の記号を除去
      .replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1")
      .replace(/_{1,2}([^_]+)_{1,2}/g, "$1")
      // コードブロックを除去
      .replace(/```[\s\S]*?```/g, "")
      // インラインコードを除去
      .replace(/`([^`]+)`/g, "$1")
      // リンクはテキスト部分のみ残す
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // リスト記号を読みやすく変換
      .replace(/^[-*+]\s+/gm, "、")
      .replace(/^\d+\.\s+/gm, "、")
      // 余分な空白を整理
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }, []);

  // 読み上げ開始
  const speak = useCallback(
    (text: string) => {
      if (!isSupported) {
        console.warn("Speech synthesis is not supported in this browser");
        return;
      }

      // 既存の読み上げを停止
      window.speechSynthesis.cancel();

      const processedText = preprocessText(text);
      const utterance = new SpeechSynthesisUtterance(processedText);

      // 設定の適用
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = rate;
      utterance.pitch = 1.0;
      utterance.lang = "ja-JP";

      // イベントハンドラの設定
      utterance.onstart = () => setStatus("speaking");
      utterance.onend = () => setStatus("idle");
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);
        setStatus("idle");
      };
      utterance.onpause = () => setStatus("paused");
      utterance.onresume = () => setStatus("speaking");

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, selectedVoice, rate, preprocessText]
  );

  // 一時停止
  const pause = useCallback(() => {
    if (isSupported && status === "speaking") {
      window.speechSynthesis.pause();
    }
  }, [isSupported, status]);

  // 再開
  const resume = useCallback(() => {
    if (isSupported && status === "paused") {
      window.speechSynthesis.resume();
    }
  }, [isSupported, status]);

  // 停止
  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setStatus("idle");
    }
  }, [isSupported]);

  return {
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
  };
}