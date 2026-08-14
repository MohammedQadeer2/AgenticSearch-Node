import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, MessageSquarePlus, Sparkles } from "lucide-react";
import Header from "./components/Header";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import Sidebar from "./components/Sidebar";
import { getMessages } from "./api/conversationApi";
import { sendMessage } from "./api/chatApi";

export default function App({ onProfileClick, onLogout }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const userId = localStorage.getItem("userId");

  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (!selectedConversationId || !userId) return;

    async function loadMessages() {
      setIsHistoryLoading(true);

      try {
        const data = await getMessages(selectedConversationId, userId);
        // console.log(`reponse of APi of conversations: ${JSON.stringify(data)}`)
        const chatMessages = data.map((message) => ({
          id: message._id,
          sender: message.role === "assistant" ? "llm" : "user",
          text: message.content
        }));
        // console.log(`reponse of APi of conversat ions after .map(): ${JSON.stringify(chatMessages)}`)
        setMessages(chatMessages);
      } catch (error) {
        console.error("Error occurred while loading messages:", error);
        setMessages([]);
      } finally {
        setIsHistoryLoading(false);
      }
    }

    loadMessages();
  }, [selectedConversationId, userId]);

  const handleApiCall = async (userText) => {
    setIsLoading(true);

    try {
      const result = await sendMessage(userText, userId, selectedConversationId);
      const llmMessage = {
        id: Date.now(),
        sender: "llm",
        text: result.message,
      };

      setMessages((previousMessages) => [...previousMessages, llmMessage]);

    } catch (error) {
      console.error("Error occurred while fetching API:", error);
      setMessages((previousMessages) => [
        ...previousMessages,
        {
          id: Date.now(),
          sender: "llm",
          text: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading || !selectedConversationId) return;
    
    const newMessage = { id: Date.now(), sender: "user", text: input.trim() };
    setMessages((prev) => [...prev, newMessage]);
    handleApiCall(input.trim());
    setInput("");
  };

  const handleConversationSelect = (conversation) => {
    setMessages([]);
    setSelectedConversationId(conversation._id);
  };

  const handleConversationDelete = (conversationId) => {
    if (selectedConversationId === conversationId) {
      setSelectedConversationId(null);
      setMessages([]);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f172a] font-sans text-slate-100">
      {isMobileSidebarOpen && <button onClick={() => setIsMobileSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/50 md:hidden" aria-label="Close sidebar" />}
      <Sidebar
        userId={userId}
        selectedConversationId={selectedConversationId}
        onConversationSelect={handleConversationSelect}
        onConversationDelete={handleConversationDelete}
        onProfileClick={onProfileClick}
        onLogout={onLogout}
        mobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
      <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />

      <main ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          {isHistoryLoading && <p className="text-sm text-slate-400">Loading conversation...</p>}

          {!isHistoryLoading && !selectedConversationId && (
            <section className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-10 sm:py-16">
              <div className="mb-7 grid h-14 w-14 place-items-center rounded-2xl bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-400/20"><Sparkles className="h-7 w-7" /></div>
              <p className="text-sm font-medium text-indigo-300">Welcome to Qadeer.AI</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">Get started in a few simple steps.</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">Qadeer.AI is ready to help you explore ideas, answer questions, and work through tasks.</p>
              <ol className="mt-8 space-y-3">
                {[["1", "Choose a workspace", "Select General Chat or Company Knowledge from the sidebar."], ["2", "Start a new chat", "Click New chat to begin a fresh conversation."], ["3", "Ask Qadeer.AI anything", "Type your question below and send it when you are ready."]].map(([number, title, description]) => (
                  <li key={number} className="flex gap-4 rounded-2xl border border-slate-800 bg-[#111b30]/60 p-4"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-indigo-500/15 text-xs font-semibold text-indigo-200">{number}</span><span><strong className="block text-sm font-medium text-slate-200">{title}</strong><span className="mt-1 block text-sm leading-5 text-slate-400">{description}</span></span></li>
                ))}
              </ol>
              <p className="mt-6 flex items-center gap-2 text-sm text-slate-500"><MessageSquarePlus className="h-4 w-4" /> Select a recent chat to continue where you left off <ArrowRight className="h-4 w-4" /></p>
            </section>
          )}

          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && <div className="flex items-center gap-2 text-sm text-slate-400"><span>Thinking</span><span className="flex gap-1"><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:150ms]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:300ms]" /></span></div>}
        </div>
      </main>

      <ChatInput input={input} setInput={setInput} onSend={handleSend} isLoading={isLoading} disabled={!selectedConversationId} />
      </div>
    </div>
  );
}
