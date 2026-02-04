"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { SpeechStatus, UseSpeechSynthesisReturn } from "@/types";

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1.0);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // ブラウザサポートの確認と音声リストの取得
  useEffect(() => {
    // ✅ ガード節：return の型を安定させる
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    setIsSupported(true);

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // 日本語音声を優先
      const japaneseVoice = availableVoices.find((voice) =>
        voice.lang.startsWith("ja")
      );

      if (japaneseVoice && !selectedVoice) {
        setSelectedVoice(japaneseVoice);
      }
    };

    // 初回ロード
    loadVoices();

    // 一部ブラウザでは非同期で呼ばれる
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // ✅ cleanup は常に返る
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoice]);

  // テキスト前処理
  const preprocessText = useCallback((text: string): string => {
    return text
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1")
      .replace(/_{1,2}([^_]+)_{1,2}/g, "$1")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^[-*+]\s+/gm, "、")
      .replace(/^\d+\.\s+/gm, "、")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }, []);

  // 読み上げ開始
  const speak = useCallback(
    (text: string) => {
      if (!isSupported) {
        console.warn("Speech synthesis is not supported");
        return;
      }

      window.speechSynthesis.cancel();

      const processedText = preprocessText(text);
      const utterance = new SpeechSynthesisUtterance(processedText);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = rate;
      utterance.pitch = 1.0;
      utterance.lang = "ja-JP";

      utterance.onstart = () => setStatus("speaking");
      utterance.onend = () => setStatus("idle");
      utterance.onerror = () => setStatus("idle");
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
