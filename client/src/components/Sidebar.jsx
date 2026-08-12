import { useEffect, useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  MessageSquare,
  Plus,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { getProfile } from "../api/authApi";
import {
  createConversation,
  getConversations,
} from "../api/conversationApi";

const workspaces = [
  {
    name: "General Chat",
    value: "general",
    icon: Sparkles,
  },
  {
    name: "Company Knowledge",
    value: "company",
    icon: Building2,
  },
];

export default function Sidebar({ userId, selectedConversationId, onConversationSelect, onProfileClick, onLogout, mobileOpen, onClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [workspace, setWorkspace] = useState(workspaces[0]);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const showDetails = !isCollapsed || mobileOpen;

  useEffect(() => {
    if (!userId) return;

    async function loadConversations() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getConversations(userId, workspace.value);
        setConversations(data);
      } catch (error) {
        setError(error.message);
        setConversations([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadConversations();
  }, [userId, workspace.value]);

  useEffect(() => {
    if (!userId) return;
    getProfile(userId)
      .then(setUser)
      .catch(() => setUser(null));
  }, [userId]);

  async function createNewChat() {
    if (!userId) return;

    setIsCreating(true);
    setError("");

    try {
      const conversation = await createConversation(userId, workspace.value);
      setConversations((previousConversations) => [conversation, ...previousConversations]);
      onConversationSelect(conversation);
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <aside
      className={`w-72 ${isCollapsed ? "md:w-20" : "md:w-72"} ${mobileOpen ? "fixed inset-y-0 left-0 z-50 flex shadow-2xl shadow-black/50" : "hidden"} h-screen min-h-0 shrink-0 flex-col overflow-hidden border-r border-slate-800 bg-[#0d1526] p-3 transition-all duration-200 md:static md:z-auto md:flex md:shadow-none`}
    >
      <div className="mb-5 flex items-center justify-between px-1">
        {showDetails && (
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            Qadeer<span className="text-indigo-300">.AI</span>
          </h1>
        )}
        <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden" aria-label="Close sidebar">
          <X size={20} />
        </button>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white md:block"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="space-y-1">
        {workspaces.map((item) => {
          const WorkspaceIcon = item.icon;
          const isSelected = workspace.name === item.name;

          return (
            <button
              key={item.name}
              onClick={() => {
                setWorkspace(item);
                onClose();
              }}
              title={item.name}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                isSelected
                  ? "bg-indigo-500/15 text-indigo-200" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <WorkspaceIcon className="h-5 w-5 shrink-0" />
              {showDetails && <span className="truncate">{item.name}</span>}
            </button>
          );
        })}
      </div>

      <button
        onClick={createNewChat}
        disabled={isCreating}
        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Plus className="h-4 w-4" />
        {showDetails && (isCreating ? "Creating..." : "New chat")}
      </button>

      {showDetails && (
        <>
          <p className="mt-7 px-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            Recent chats
          </p>
          <nav className="mt-2 flex-1 space-y-1 overflow-y-auto pr-1">
            {isLoading && <p className="px-3 py-2 text-sm text-slate-500">Loading chats...</p>}

            {!isLoading && error && <p className="px-3 py-2 text-sm text-red-300">{error}</p>}

            {!isLoading && !error && conversations.length === 0 && (
              <p className="px-3 py-2 text-sm text-slate-500">No chats yet.</p>
            )}

            {conversations.map((conversation, index) => (
              <button
                key={conversation._id}
                onClick={() => {
                  onConversationSelect(conversation);
                  onClose();
                }}
                className={`flex w-full items-center gap-2 truncate rounded-lg px-3 py-2 text-left text-sm ${
                  selectedConversationId === conversation._id
                    ? "bg-slate-800 text-slate-100"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="truncate">{conversation.title}</span>
              </button>
            ))}
          </nav>
        </>
      )}

      <div className="mt-auto shrink-0 border-t border-slate-800 pt-3">
        <button onClick={onProfileClick} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-800">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-xs font-bold text-white">QA</span>
          {showDetails && <span className="min-w-0 text-left"><span className="block truncate text-sm font-medium text-slate-200">{user?.name || "Your profile"}</span><span className="block text-xs text-slate-500">Free plan</span></span>}
        </button>
        <button className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"><Settings className="h-4 w-4 shrink-0" />{showDetails && "Settings"}</button>
        <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"><LogOut className="h-4 w-4 shrink-0" />{showDetails && "Logout"}</button>
      </div>
    </aside>
  );
}
