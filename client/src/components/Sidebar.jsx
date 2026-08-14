import { useEffect, useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  LogOut,
  MessageSquare,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  X,
  FileUp,
} from "lucide-react";
import { getProfile } from "../api/authApi";
import {
  createConversation,
  deleteConversation,
  getConversations,
} from "../api/conversationApi";
import { uploadDocument } from "../api/documentApi";

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

export default function Sidebar({ userId, selectedConversationId, onConversationSelect, onConversationDelete, onProfileClick, onLogout, mobileOpen, onClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [workspace, setWorkspace] = useState(workspaces[0]);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  //for document upload status
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  //Add state to hold the list of all uploaded documents and track which one is currently selected by the user.
  const [allDocuments, setAllDocuments] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");



  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [showRecentChats, setShowRecentChats] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [openMenuId, setOpenMenuId] = useState("");
  const [deletingConversationId, setDeletingConversationId] = useState("");
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
      // CRITICAL: Pass the selected document ID as the 3rd argument
      const docIdToPass = workspace.value === "company" ? selectedDocumentId : null;

      const conversation = await createConversation(userId, workspace.value, docIdToPass);
      setConversations((previousConversations) => [conversation, ...previousConversations]);
      onConversationSelect(conversation);
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteConversation(conversationId) {
    const shouldDelete = window.confirm("Delete this conversation?");
    console.log(`conversationId inside sidebar.jsx: ${conversationId}`)

    if (!shouldDelete) return;

    setDeletingConversationId(conversationId);
    setError("");

    try {
      await deleteConversation(conversationId, userId);

      // Remove the deleted chat from the current sidebar list.
      setConversations((previousConversations) =>
        previousConversations.filter((conversation) => conversation._id !== conversationId)
      );

      if (selectedConversationId === conversationId) {
        onConversationDelete(conversationId);
      }

      setOpenMenuId("");
    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingConversationId("");
    }
  }



  //Load available documents on workspace change :
  useEffect(() => {
    if (workspace.value === "company") {
      import("../api/documentApi").then(({ getDocuments }) => {
        getDocuments()
          .then((data) => {
            setAllDocuments(data);
            if (data.length > 0) {
              setSelectedDocumentId(data[0]._id); // Default to the first document in list
            }
          })
          .catch(console.error);
      });
    }
  }, [workspace.value, uploadMessage]); // Re-fetch documents whenever a new upload succeeds!

  // use to handle the pdf files
  async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMessage("Uploading & Indexing...");
    setUploadError("");

    try {
      const response = await uploadDocument(file);
      setUploadMessage(response.message);
      // Clear success message after 5 seconds
      setTimeout(() => setUploadMessage(""), 5000);
    } catch (err) {
      setUploadError(err.message);
      setUploadMessage("");
    } finally {
      setIsUploading(false);
      // Reset the file input element so user can upload same/new files again
      event.target.value = "";
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
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${isSelected
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

      {/* Document Selector Dropdown - only visible for Company Knowledge Workspace */}
      {workspace.value === "company" && showDetails && allDocuments.length > 0 && (
        <div className="mt-4 px-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Select Target Document
          </label>
          <select
            value={selectedDocumentId}
            onChange={(e) => setSelectedDocumentId(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-[#0c1527] px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-400"
          >
            {allDocuments.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.filename}
              </option>
            ))}
          </select>
        </div>
      )}


      <button
        onClick={createNewChat}
        disabled={isCreating}
        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Plus className="h-4 w-4" />
        {showDetails && (isCreating ? "Creating..." : "New chat")}
      </button>

      {/* Hide the upload panel while recent chats are open to give chat history more space. */}
      {workspace.value === "company" && showDetails && !showRecentChats && (
        <div className="mt-5 rounded-2xl border border-slate-800 bg-[#111b30]/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Knowledge Base Ingestion
          </p>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-[#0c1527] rounded-xl p-3 cursor-pointer transition">
            <FileUp className={`h-6 w-6 mb-1 ${isUploading ? "animate-bounce text-indigo-400" : "text-slate-400"}`} />
            <span className="text-xs text-slate-300 font-medium">
              {isUploading ? "Indexing PDF..." : "Upload Company PDF"}
            </span>
            <span className="text-[10px] text-slate-500 mt-1">PDF up to 10MB</span>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>

          {/* Status Notifications */}
          {uploadMessage && (
            <p className="mt-2 text-center text-xs font-medium text-emerald-400 animate-pulse">
              {uploadMessage}
            </p>
          )}
          {uploadError && (
            <p className="mt-2 text-center text-xs font-medium text-red-400">
              {uploadError}
            </p>
          )}
        </div>
      )}


      {showDetails && (
        <div className="mt-5 flex min-h-0 flex-1 flex-col">
          <button
            onClick={() => setShowRecentChats(!showRecentChats)}
            className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-xs font-medium uppercase tracking-wider text-slate-500 hover:bg-slate-800 hover:text-slate-300"
          >
            Recent chats
            {showRecentChats ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {/* Only this list scrolls. The profile menu stays visible at the bottom. */}
          {showRecentChats && <nav className="mt-1 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
            {isLoading && <p className="px-3 py-2 text-sm text-slate-500">Loading chats...</p>}

            {!isLoading && error && <p className="px-3 py-2 text-sm text-red-300">{error}</p>}

            {!isLoading && !error && conversations.length === 0 && (
              <p className="px-3 py-2 text-sm text-slate-500">No chats yet.</p>
            )}

            {conversations.map((conversation) => (
              <div
                key={conversation._id}
                className={`flex items-center rounded-lg ${selectedConversationId === conversation._id
                  ? "bg-slate-800 text-slate-100"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
              >
                <button
                  onClick={() => {
                    onConversationSelect(conversation);
                    onClose();
                  }}
                  className="flex min-w-0 flex-1 items-center gap-2 truncate px-3 py-2 text-left text-sm"
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate">{conversation.title}</span>
                </button>

                <div className="relative pr-1">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === conversation._id ? "" : conversation._id)}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white"
                    aria-label={`More options for ${conversation.title}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>

                  {openMenuId === conversation._id && (
                    <div className="absolute right-0 top-9 z-20 w-28 rounded-lg border border-slate-700 bg-[#111b30] p-1 shadow-xl">
                      <button
                        onClick={() => handleDeleteConversation(conversation._id)}
                        disabled={deletingConversationId === conversation._id}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deletingConversationId === conversation._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </nav>}
        </div>
      )}

      <div className="mt-auto shrink-0 border-t border-slate-800 pt-3">
        <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-800">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-xs font-bold text-white">QA</span>
          {showDetails && <span className="min-w-0 text-left"><span className="block truncate text-sm font-medium text-slate-200">{user?.name || "Your profile"}</span><span className="block text-xs text-slate-500">Free plan</span></span>}
          {showDetails && (showProfileMenu ? <ChevronDown className="ml-auto h-4 w-4 text-slate-400" /> : <ChevronUp className="ml-auto h-4 w-4 text-slate-400" />)}
        </button>
        {showProfileMenu && showDetails && <div className="mt-1 space-y-1 rounded-xl bg-[#111b30] p-1">
          <button onClick={onProfileClick} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"><Settings className="h-4 w-4 shrink-0" />Profile</button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"><Settings className="h-4 w-4 shrink-0" />Settings</button>
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"><LogOut className="h-4 w-4 shrink-0" />Logout</button>
        </div>}
      </div>
    </aside>
  );
}
