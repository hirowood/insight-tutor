"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SpeechControls } from "./speech-controls";
import type { Components } from "react-markdown";
import type { ReactNode } from "react";

interface AnalysisResultProps {
  content: string;
  timestamp: string;
}

export function AnalysisResult({ content, timestamp }: AnalysisResultProps) {
  // マークダウンのカスタムコンポーネント
  const markdownComponents: Partial<Components> = {
    h1: ({ children }: { children?: ReactNode }) => (
      <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-4 pb-2 border-b border-gray-200">
        {children}
      </h1>
    ),
    h2: ({ children }: { children?: ReactNode }) => (
      <h2 className="text-xl font-semibold text-gray-800 mt-5 mb-3">
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: ReactNode }) => (
      <h3 className="text-lg font-medium text-gray-700 mt-4 mb-2">
        {children}
      </h3>
    ),
    p: ({ children }: { children?: ReactNode }) => (
      <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
    ),
    ul: ({ children }: { children?: ReactNode }) => (
      <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
        {children}
      </ul>
    ),
    ol: ({ children }: { children?: ReactNode }) => (
      <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">
        {children}
      </ol>
    ),
    li: ({ children }: { children?: ReactNode }) => (
      <li className="ml-2">{children}</li>
    ),
    strong: ({ children }: { children?: ReactNode }) => (
      <strong className="font-semibold text-gray-900">{children}</strong>
    ),
    em: ({ children }: { children?: ReactNode }) => (
      <em className="italic text-gray-700">{children}</em>
    ),
    code: ({
      children,
      className,
    }: {
      children?: ReactNode;
      className?: string;
    }) => {
      const isInline = !className;
      return isInline ? (
        <code className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-sm font-mono">
          {children}
        </code>
      ) : (
        <code className="block p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm font-mono">
          {children}
        </code>
      );
    },
    pre: ({ children }: { children?: ReactNode }) => (
      <pre className="mb-4">{children}</pre>
    ),
    blockquote: ({ children }: { children?: ReactNode }) => (
      <blockquote className="border-l-4 border-blue-400 pl-4 py-2 my-4 bg-blue-50 rounded-r-lg text-gray-700 italic">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-6 border-gray-300" />,

    // ✅ ここが修正点
    a: ({ href, children }: { href?: string; children?: ReactNode }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        {children}
      </a>
    ),

    table: ({ children }: { children?: ReactNode }) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border border-gray-200 rounded-lg">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: { children?: ReactNode }) => (
      <thead className="bg-gray-50">{children}</thead>
    ),
    tbody: ({ children }: { children?: ReactNode }) => (
      <tbody className="divide-y divide-gray-200">{children}</tbody>
    ),
    tr: ({ children }: { children?: ReactNode }) => <tr>{children}</tr>,
    th: ({ children }: { children?: ReactNode }) => (
      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
        {children}
      </th>
    ),
    td: ({ children }: { children?: ReactNode }) => (
      <td className="px-4 py-2 text-sm text-gray-600">{children}</td>
    ),
  };

  // タイムスタンプをフォーマット
  const formattedTime = new Date(timestamp).toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span>📖</span>
          <span>解析結果</span>
        </h2>
        <span className="text-sm text-gray-500">{formattedTime}</span>
      </div>

      {/* 音声コントロール */}
      <SpeechControls text={content} />

      {/* マークダウン表示 */}
      <article
        className="prose prose-gray max-w-none p-6 bg-white rounded-xl shadow-sm border border-gray-100"
        aria-label="解析された内容"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
