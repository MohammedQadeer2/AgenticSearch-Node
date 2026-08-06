import React, { useState, useRef, useEffect } from "react";
import Header from "./components/Header";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import Sidebar from "./components/Sidebar";

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
        const response = await fetch(
          `http://localhost:3001/api/conversations/${selectedConversationId}/messages?userId=${userId}`
        );

        if (!response.ok) {
          throw new Error("Could not load messages");
        }

        const data = await response.json();
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
      const response = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          message: userText,
          userId: userId,
          conversationId: selectedConversationId
        }),
      });
  
      if (!response.ok) {
        throw new Error("Response generated Error!!");
      }
  
      const result = await response.json();
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

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f172a] font-sans text-slate-100">
      {isMobileSidebarOpen && <button onClick={() => setIsMobileSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/50 md:hidden" aria-label="Close sidebar" />}
      <Sidebar
        userId={userId}
        selectedConversationId={selectedConversationId}
        onConversationSelect={handleConversationSelect}
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
            <p className="text-sm text-slate-400">Select a conversation from the sidebar.</p>
          )}

          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && <div className="flex items-center gap-2 text-sm text-slate-400"><span>Thinking</span><span className="flex gap-1"><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:150ms]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:300ms]" /></span></div>}
        </div>
      </main>

      <ChatInput input={input} setInput={setInput} onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}
