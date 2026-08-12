import React from "react";
import { LoaderCircle, Plus, Mic, ArrowUp } from "lucide-react";

export default function ChatInput({ input, setInput, onSend, isLoading }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <footer className="sticky bottom-0 bg-[#0f172a] p-3 sm:p-4 z-10 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#1e293b] rounded-full flex items-center px-3 py-2 border border-slate-700/50 focus-within:border-slate-500 transition">
          
          <button type="button" disabled={isLoading} className="p-2 text-slate-400 hover:text-white rounded-full transition disabled:opacity-50">
            <Plus className="w-5 h-5" />
          </button>

          <textarea
            rows="1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything"
            disabled={isLoading}
            className="w-full bg-transparent text-white placeholder-slate-400 px-3 outline-none resize-none text-[15px] max-h-32 overflow-y-auto disabled:cursor-not-allowed disabled:opacity-50"
          />

          <div className="flex items-center gap-1">
            <button type="button" disabled={isLoading} className="p-2 text-slate-400 hover:text-white rounded-full transition disabled:opacity-50">
              <Mic className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onSend}
              disabled={isLoading || !input.trim()}
              className="p-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
}