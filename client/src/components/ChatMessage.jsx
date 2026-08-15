import React from "react";
import { Copy, ThumbsUp, ThumbsDown, Share, RotateCw } from "lucide-react";
import Markdown from 'react-markdown';
export default function ChatMessage({ message }) {
  const isUser = message.sender === "user";
  // Only show assistant action icons after the assistant has produced visible text.
  // This prevents the action bar appearing above an empty streaming placeholder.
  const hasContent = Boolean(message.text && message.text.toString().trim().length > 0);

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-[#1e293b] text-white px-5 py-2.5 rounded-3xl max-w-[80%] text-[15px]">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-slate-200">
      <div className="prose prose-invert max-w-none text-[15px] leading-relaxed text-slate-200">
        <Markdown>{message.text}</Markdown>
      </div>

      {hasContent && (
        <div className="flex items-center gap-2 pt-1 text-slate-400">
          <button className="p-1.5 hover:text-white hover:bg-[#1e293b] rounded-md transition" title="Copy">
            <Copy className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:text-white hover:bg-[#1e293b] rounded-md transition" title="Like">
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:text-white hover:bg-[#1e293b] rounded-md transition" title="Dislike">
            <ThumbsDown className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:text-white hover:bg-[#1e293b] rounded-md transition" title="Share">
            <Share className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:text-white hover:bg-[#1e293b] rounded-md transition" title="Regenerate">
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
