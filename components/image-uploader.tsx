"use client";

import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from "react";
import Image from "next/image";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE, type AllowedImageType } from "@/lib/schemas";
import type { ImagePreview } from "@/types";

interface ImageUploaderProps {
  onImageSelect: (imageData: ImagePreview) => void;
  isDisabled?: boolean;
}

export function ImageUploader({ onImageSelect, isDisabled = false }: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<ImagePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // ファイルをBase64に変換
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = () => {
        const result = reader.result;
  
        if (typeof result !== "string") {
          reject(new Error("FileReader result is not a string"));
          return;
        }
  
        const base64 = result.split(",")[1];
  
        if (!base64) {
          reject(new Error("Failed to extract base64 data"));
          return;
        }
  
        resolve(base64);
      };
  
      reader.onerror = () => {
        reject(reader.error ?? new Error("FileReader error"));
      };
  
      reader.readAsDataURL(file);
    });
  };
  
  // ファイルのバリデーション
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as AllowedImageType)) {
      return "サポートされていない画像形式です。JPEG, PNG, WebP, GIFのみ対応しています。";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "ファイルサイズが大きすぎます。10MB以下の画像を選択してください。";
    }
    return null;
  };

  // ファイル処理
  const processFile = useCallback(
    async (file: File) => {
      setError(null);

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      try {
        const base64Data = await fileToBase64(file);
        const previewUrl = URL.createObjectURL(file);

        const imageData: ImagePreview = {
          file,
          previewUrl,
          base64Data,
        };

        setPreview(imageData);
        onImageSelect(imageData);
      } catch {
        setError("画像の読み込みに失敗しました。");
      }
    },
    [onImageSelect]
  );

  // ドラッグオーバー
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDisabled) {
      setIsDragOver(true);
    }
  }, [isDisabled]);

  // ドラッグリーブ
  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  // ドロップ
  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
  
      if (isDisabled) return;
  
      const file = e.dataTransfer.files?.item(0);
      if (!file) return;
  
      processFile(file);
    },
    [isDisabled, processFile]
  );
  

  // ファイル選択
  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.item(0);
      if (!file) return;
  
      processFile(file);
    },
    [processFile]
  );
  

  // ファイル選択を開く
  const handleFileClick = useCallback(() => {
    if (!isDisabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [isDisabled]);

  // カメラを開く
  const handleCameraClick = useCallback(() => {
    if (!isDisabled && cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  }, [isDisabled]);

  // プレビューをクリア
  const clearPreview = useCallback(() => {
    if (preview?.previewUrl) {
      URL.revokeObjectURL(preview.previewUrl);
    }
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  }, [preview]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* 隠しinput要素 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        onChange={handleFileChange}
        disabled={isDisabled}
        className="hidden"
        aria-hidden="true"
      />
      
      {/* カメラ用input（スマホ対応） */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        disabled={isDisabled}
        className="hidden"
        aria-hidden="true"
      />

      {preview ? (
        // プレビュー表示
        <div className="space-y-4 p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="relative w-full aspect-[4/3] max-h-[60vh]">
            <Image
              src={preview.previewUrl}
              alt="選択された画像のプレビュー"
              fill
              className="object-contain rounded-lg"
              sizes="(max-width: 768px) 100vw, 640px"
            />
          </div>
          <p className="text-sm text-gray-600 text-center truncate px-2">
            {preview.file.name}
          </p>
          <button
            type="button"
            onClick={clearPreview}
            disabled={isDisabled}
            className="w-full px-4 py-3 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 border border-red-200"
          >
            🗑️ 画像を削除して選び直す
          </button>
        </div>
      ) : (
        // アップロードUI
        <div className="space-y-4">
          {/* ドロップゾーン（PC向け） */}
          <div
            onClick={handleFileClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer
              transition-all duration-200 ease-in-out hidden sm:block
              ${isDisabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}
              ${isDragOver 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
              }
            `}
            role="button"
            tabIndex={isDisabled ? -1 : 0}
            aria-label="画像をアップロード"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleFileClick();
              }
            }}
          >
            <div className="space-y-4">
              <div className="text-5xl">📚</div>
              <div>
                <p className="text-lg font-medium text-gray-700">
                  参考書のページ画像をアップロード
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  ドラッグ＆ドロップ または クリックしてファイルを選択
                </p>
              </div>
              <p className="text-xs text-gray-400">
                対応形式: JPEG, PNG, WebP, GIF（最大10MB）
              </p>
            </div>
          </div>

          {/* モバイル用ボタン */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {/* カメラ撮影ボタン */}
            <button
              type="button"
              onClick={handleCameraClick}
              disabled={isDisabled}
              className="flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg disabled:opacity-50 active:scale-[0.98]"
            >
              <span className="text-2xl">📷</span>
              <span>カメラで撮影</span>
            </button>

            {/* ライブラリから選択ボタン */}
            <button
              type="button"
              onClick={handleFileClick}
              disabled={isDisabled}
              className="flex items-center justify-center gap-3 px-6 py-5 bg-white text-gray-700 text-lg font-semibold rounded-xl border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              <span className="text-2xl">🖼️</span>
              <span>ライブラリから選択</span>
            </button>
          </div>

          {/* PC用の補助ボタン */}
          <div className="hidden sm:flex justify-center gap-3">
            <button
              type="button"
              onClick={handleCameraClick}
              disabled={isDisabled}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <span>📷</span>
              <span>カメラで撮影</span>
            </button>
          </div>

          {/* ヒント */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-medium text-blue-800 text-sm mb-2">📌 きれいに撮影するコツ</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• 明るい場所で撮影してください</li>
              <li>• ページ全体が画面に入るように撮影</li>
              <li>• 影が入らないように注意</li>
              <li>• 斜めにならないよう真上から撮影</li>
            </ul>
          </div>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div
          className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
          role="alert"
        >
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}