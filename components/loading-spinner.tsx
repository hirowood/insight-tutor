"use client";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-16 w-16",
};

export function LoadingSpinner({
  message = "読み込み中...",
  size = "md",
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div
        className={`animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 ${sizeClasses[size]}`}
        role="status"
        aria-label="読み込み中"
      />
      <p className="text-gray-600 text-sm animate-pulse">{message}</p>
    </div>
  );
}