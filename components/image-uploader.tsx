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

  // ファイルをBase64に変換
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // "data:image/jpeg;base64," の部分を除去
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
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

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [isDisabled, processFile]
  );

  // ファイル選択
  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  // クリックでファイル選択を開く
  const handleClick = useCallback(() => {
    if (!isDisabled && fileInputRef.current) {
      fileInputRef.current.click();
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
  }, [preview]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* ドロップゾーン */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out
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
            handleClick();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          onChange={handleFileChange}
          disabled={isDisabled}
          className="hidden"
          aria-hidden="true"
        />

        {preview ? (
          // プレビュー表示
          <div className="space-y-4">
            <div className="relative w-full aspect-[4/3] max-h-80">
              <Image
                src={preview.previewUrl}
                alt="選択された画像のプレビュー"
                fill
                className="object-contain rounded-lg"
                sizes="(max-width: 768px) 100vw, 640px"
              />
            </div>
            <p className="text-sm text-gray-600">{preview.file.name}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearPreview();
              }}
              disabled={isDisabled}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              画像を削除
            </button>
          </div>
        ) : (
          // アップロード促すUI
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
        )}
      </div>

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