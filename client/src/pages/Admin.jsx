import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { api } from "../lib/api";
import {
  FiLock,
  FiMail,
  FiBookOpen,
  FiFolder,
  FiLogOut,
  FiCheck,
  FiTrash2,
  FiEye,
  FiExternalLink,
  FiAlertCircle,
  FiRefreshCw,
  FiCheckCircle,
  FiPlus,
  FiArrowUp,
  FiArrowDown,
  FiX,
  FiImage,
} from "react-icons/fi";

export default function Admin() {
  const [token, setToken] = useState(() => {
    return typeof window !== "undefined"
      ? sessionStorage.getItem("admin_token")
      : null;
  });

  const [activeTab, setActiveTab] = useState("messages"); // 'messages' | 'guestbook' | 'projects'

  // Auth form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Listen for auth expiration event from Axios interceptor
  useEffect(() => {
    const handleAuthExpired = () => {
      setToken(null);
      setAuthError("Session expired. Please log in again.");
    };
    window.addEventListener("admin-auth-expired", handleAuthExpired);
    return () => window.removeEventListener("admin-auth-expired", handleAuthExpired);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data?.token) {
        sessionStorage.setItem("admin_token", res.data.token);
        setToken(res.data.token);
        setPassword(""); // Clear password from component memory
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setAuthError(
          err.response?.data?.message ||
            "Too many login attempts. Please wait 15 minutes before trying again."
        );
      } else {
        setAuthError(
          err.response?.data?.message ||
            "Invalid email or password. Please try again."
        );
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    setToken(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F3E7] text-[#1A110A] selection:bg-[#F79F15] selection:text-[#1A110A] font-body flex flex-col">
      <Helmet>
        <title>Admin Console | Private</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {!token ? (
        <LoginView
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          loading={authLoading}
          error={authError}
          onSubmit={handleLogin}
        />
      ) : (
        <DashboardView
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

// ==========================================
// 1. LOGIN VIEW
// ==========================================
function LoginView({ email, setEmail, password, setPassword, loading, error, onSubmit }) {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-[#FFFFFF] rounded-3xl p-8 sm:p-10 border border-[#9F9B90]/30 bg-[#FFFFFF] backdrop-blur-xl shadow-2xl relative">
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-[#F8F5EE] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-[#F8F5EE] rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center gap-3 text-center mb-8 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#F8F5EE] border border-[#9F9B90]/30 flex items-center justify-center text-[#F79F15] shadow-lg">
            <FiLock className="text-2xl" />
          </div>
          <span className="text-xs font-mono font-semibold text-[#F79F15] tracking-widest uppercase">
            // PRIVATE ACCESS
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#1A110A]">
            Admin Console
          </h1>
          <p className="text-xs text-[#6F6B60]">
            Please enter your administrator credentials to continue.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-xs flex items-start gap-3"
          >
            <FiAlertCircle className="text-red-400 text-base shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-5 relative z-10">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="admin-email"
              className="text-xs font-mono text-[#6F6B60] uppercase tracking-wider"
            >
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-4 py-3 rounded-xl bg-[#F8F5EE] border border-[#9F9B90]/30 focus:border-[#F79F15] focus:ring-1 focus:ring-[#F79F15] text-[#1A110A] placeholder-[#6F6B60]/50 text-sm transition-all outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="admin-password"
              className="text-xs font-mono text-[#6F6B60] uppercase tracking-wider"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-xl bg-[#F8F5EE] border border-[#9F9B90]/30 focus:border-[#F79F15] focus:ring-1 focus:ring-[#F79F15] text-[#1A110A] placeholder-[#6F6B60]/50 text-sm transition-all outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-3 w-full py-3.5 px-6 rounded-xl font-mono text-sm font-semibold text-[#1A110A] bg-[#F79F15] hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#1A110A] border-t-transparent rounded-full animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 2. DASHBOARD VIEW
// ==========================================
function DashboardView({ activeTab, setActiveTab, onLogout }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  return (
    <div className="flex-1 flex flex-col">
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-[#9F9B90]/30 bg-[#FFFFFF]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F79F15] flex items-center justify-center font-mono font-bold text-[#1A110A] text-sm shadow-md">
              MK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm tracking-tight text-[#1A110A]">
                  Admin Dashboard
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#F79F15] animate-pulse" />
              </div>
              <p className="text-[10px] font-mono text-[#6F6B60]">
                banur-node-cluster · production
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#9F9B90]/30 hover:border-red-400/30 hover:bg-red-500/10 text-xs font-mono text-[#6F6B60] hover:text-red-300 transition-all cursor-pointer"
              title="Sign out of admin session"
            >
              <FiLogOut className="text-sm" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 overflow-x-auto border-t border-[#9F9B90]/20 py-2">
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === "messages"
                ? "bg-[#F8F5EE] text-[#F79F15] border border-[#F79F15]/40 shadow-sm"
                : "text-[#6F6B60] hover:text-[#1A110A] hover:bg-white/5 border border-transparent"
            }`}
          >
            <FiMail className="text-sm" />
            <span>Messages</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#F79F15] text-[#1A110A] font-bold text-[10px]">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("guestbook")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === "guestbook"
                ? "bg-[#F8F5EE] text-[#F79F15] border border-[#F79F15]/40 shadow-sm"
                : "text-[#6F6B60] hover:text-[#1A110A] hover:bg-white/5 border border-transparent"
            }`}
          >
            <FiBookOpen className="text-sm" />
            <span>Guestbook</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-[#1A110A] font-bold text-[10px]">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === "projects"
                ? "bg-[#F8F5EE] text-[#F79F15] border border-[#F79F15]/40 shadow-sm"
                : "text-[#6F6B60] hover:text-[#1A110A] hover:bg-white/5 border border-transparent"
            }`}
          >
            <FiFolder className="text-sm" />
            <span>Projects Editor</span>
          </button>
        </div>
      </header>

      {/* Main Tab Panels */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {activeTab === "messages" && (
          <MessagesTab onUnreadCountChange={setUnreadCount} />
        )}
        {activeTab === "guestbook" && (
          <GuestbookTab onPendingCountChange={setPendingCount} />
        )}
        {activeTab === "projects" && <ProjectsTab />}
      </main>
    </div>
  );
}

// ==========================================
// 3. MESSAGES TAB
// ==========================================
function MessagesTab({ onUnreadCountChange }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/messages");
      const list = res.data?.data || [];
      setMessages(list);
      const unread = list.filter((m) => !m.read).length;
      onUnreadCountChange(unread);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load messages. Please ensure server is running."
      );
    } finally {
      setLoading(false);
    }
  }, [onUnreadCountChange]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleToggleRead = async (id, currentRead) => {
    try {
      const res = await api.patch(`/messages/${id}/read`, { read: !currentRead });
      if (res.data?.success) {
        setMessages((prev) =>
          prev.map((m) => (m._id === id ? { ...m, read: !currentRead } : m))
        );
        onUnreadCountChange((prev) => (currentRead ? prev + 1 : Math.max(0, prev - 1)));
      }
    } catch (err) {
      alert("Failed to update message status");
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/messages/${itemToDelete._id}`);
      setMessages((prev) => prev.filter((m) => m._id !== itemToDelete._id));
      if (!itemToDelete.read) {
        onUnreadCountChange((prev) => Math.max(0, prev - 1));
      }
      setItemToDelete(null);
    } catch (err) {
      alert("Failed to delete message");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-bold text-[#1A110A]">
            Inbox Messages
          </h2>
          <p className="text-xs text-[#6F6B60]">
            Showing contact inquiries ordered newest first.
          </p>
        </div>
        <button
          onClick={fetchMessages}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#9F9B90]/30 hover:border-[#9F9B90]/30 bg-[#F8F5EE] text-xs font-mono text-[#6F6B60] hover:text-[#1A110A] transition-all cursor-pointer"
        >
          <FiRefreshCw className={`text-xs ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-200 text-xs flex items-center gap-3">
          <FiAlertCircle className="text-red-400 text-lg shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#9F9B90]/20 animate-pulse flex flex-col gap-3"
            >
              <div className="h-4 w-48 bg-white/10 rounded" />
              <div className="h-4 w-32 bg-white/5 rounded" />
              <div className="h-16 w-full bg-white/5 rounded mt-2" />
            </div>
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-[#FFFFFF] rounded-3xl p-12 text-center border border-[#9F9B90]/20 bg-[#FFFFFF] flex flex-col items-center gap-3">
          <FiMail className="text-4xl text-[#6F6B60]/40" />
          <h3 className="font-heading font-semibold text-[#1A110A]">No messages yet</h3>
          <p className="text-xs text-[#6F6B60]">
            When visitors submit the contact form, their inquiries will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`bg-[#FFFFFF] rounded-2xl p-6 border transition-all ${
                !msg.read
                  ? "border-[#F79F15]/40 bg-[#FFFFFF] shadow-lg shadow-sm"
                  : "border-[#9F9B90]/20 bg-[#FFFFFF]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-bold text-base text-[#1A110A]">{msg.name}</h3>
                  <a
                    href={`mailto:${msg.email}`}
                    className="text-xs font-mono text-[#F79F15] hover:underline"
                  >
                    {msg.email}
                  </a>
                  {!msg.read ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#F8F5EE] border border-[#F79F15]/40 text-[#F79F15] font-mono text-[10px] font-bold">
                      UNREAD
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-[#6F6B60] font-mono text-[10px]">
                      Read
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-[#6F6B60]">
                  {new Date(msg.createdAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {msg.subject && (
                <div className="mb-2 text-xs font-mono text-[#1A110A] font-medium">
                  Subject: {msg.subject}
                </div>
              )}

              <p className="text-sm text-[#6F6B60] whitespace-pre-wrap leading-relaxed p-4 rounded-xl bg-white/[0.02] border border-[#9F9B90]/20 font-body">
                {msg.message}
              </p>

              <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-[#9F9B90]/20">
                <button
                  onClick={() => handleToggleRead(msg._id, msg.read)}
                  className="px-3 py-1.5 rounded-lg border border-[#9F9B90]/30 hover:border-[#9F9B90]/30 hover:bg-white/5 text-xs font-mono text-[#6F6B60] hover:text-[#1A110A] transition-all cursor-pointer"
                >
                  {msg.read ? "Mark as Unread" : "Mark as Read"}
                </button>

                <a
                  href={`mailto:${msg.email}?subject=${encodeURIComponent(
                    `Re: ${msg.subject || "Your portfolio inquiry"}`
                  )}`}
                  className="px-3 py-1.5 rounded-lg bg-[#F8F5EE] border border-[#9F9B90]/40 hover:bg-[#F8F5EE] text-xs font-mono text-[#F79F15] hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FiExternalLink className="text-xs" />
                  <span>Reply</span>
                </a>

                <button
                  onClick={() => setItemToDelete(msg)}
                  className="px-3 py-1.5 rounded-lg border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10 text-xs font-mono text-red-400 hover:text-red-300 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FiTrash2 className="text-xs" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <ConfirmModal
          title="Delete Message"
          message={`Are you sure you want to delete message from "${itemToDelete.name}"? This action cannot be undone.`}
          confirmText="Yes, Delete"
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setItemToDelete(null)}
        />
      )}
    </div>
  );
}

// ==========================================
// 4. GUESTBOOK TAB
// ==========================================
function GuestbookTab({ onPendingCountChange }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/guestbook/admin/all");
      const list = res.data?.data || [];
      setEntries(list);
      const pending = list.filter((e) => !e.approved).length;
      onPendingCountChange(pending);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load guestbook entries. Please ensure server is running."
      );
    } finally {
      setLoading(false);
    }
  }, [onPendingCountChange]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleApprove = async (id, approved = true) => {
    try {
      const res = await api.patch(`/guestbook/${id}/approve`, { approved });
      if (res.data?.success) {
        setEntries((prev) =>
          prev.map((e) => (e._id === id ? { ...e, approved } : e))
        );
        onPendingCountChange((prev) => (approved ? Math.max(0, prev - 1) : prev + 1));
      }
    } catch (err) {
      alert("Failed to update approval status");
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/guestbook/${itemToDelete._id}`);
      setEntries((prev) => prev.filter((e) => e._id !== itemToDelete._id));
      if (!itemToDelete.approved) {
        onPendingCountChange((prev) => Math.max(0, prev - 1));
      }
      setItemToDelete(null);
    } catch (err) {
      alert("Failed to delete guestbook entry");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-bold text-[#1A110A]">
            Guestbook Moderation
          </h2>
          <p className="text-xs text-[#6F6B60]">
            Showing all entries with pending moderation notes listed first.
          </p>
        </div>
        <button
          onClick={fetchEntries}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#9F9B90]/30 hover:border-[#9F9B90]/30 bg-[#F8F5EE] text-xs font-mono text-[#6F6B60] hover:text-[#1A110A] transition-all cursor-pointer"
        >
          <FiRefreshCw className={`text-xs ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-200 text-xs flex items-center gap-3">
          <FiAlertCircle className="text-red-400 text-lg shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#9F9B90]/20 animate-pulse flex flex-col gap-3"
            >
              <div className="h-4 w-40 bg-white/10 rounded" />
              <div className="h-12 w-full bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-[#FFFFFF] rounded-3xl p-12 text-center border border-[#9F9B90]/20 bg-[#FFFFFF] flex flex-col items-center gap-3">
          <FiBookOpen className="text-4xl text-[#6F6B60]/40" />
          <h3 className="font-heading font-semibold text-[#1A110A]">No guestbook entries</h3>
          <p className="text-xs text-[#6F6B60]">
            Submissions from the public guestbook will appear here for review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {entries.map((entry) => (
            <div
              key={entry._id}
              className={`bg-[#FFFFFF] rounded-2xl p-6 border transition-all ${
                !entry.approved
                  ? "border-amber-400/30 bg-[#FFFFFF] shadow-lg shadow-amber-400/5"
                  : "border-[#9F9B90]/20 bg-[#FFFFFF]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-base text-[#1A110A]">{entry.name}</h3>
                  {!entry.approved ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-mono text-[10px] font-bold">
                      PENDING REVIEW
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-[#F8F5EE] border border-[#F79F15]/40 text-[#F79F15] font-mono text-[10px] font-bold">
                      APPROVED & PUBLIC
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-[#6F6B60]">
                  {new Date(entry.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <p className="text-sm text-[#6F6B60] whitespace-pre-wrap leading-relaxed p-4 rounded-xl bg-white/[0.02] border border-[#9F9B90]/20 font-body">
                "{entry.note}"
              </p>

              <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-[#9F9B90]/20">
                {!entry.approved ? (
                  <button
                    onClick={() => handleApprove(entry._id, true)}
                    className="px-4 py-1.5 rounded-lg bg-[#F79F15] text-[#1A110A] font-mono font-bold text-xs hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-sm"
                  >
                    <FiCheck className="text-xs stroke-[3]" />
                    <span>Approve Entry</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleApprove(entry._id, false)}
                    className="px-3 py-1.5 rounded-lg border border-amber-400/30 text-amber-300 hover:bg-amber-400/10 font-mono text-xs transition-all cursor-pointer"
                  >
                    Unapprove (Hide)
                  </button>
                )}

                <button
                  onClick={() => setItemToDelete(entry)}
                  className="px-3 py-1.5 rounded-lg border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10 text-xs font-mono text-red-400 hover:text-red-300 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FiTrash2 className="text-xs" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <ConfirmModal
          title="Delete Guestbook Entry"
          message={`Are you sure you want to delete note by "${itemToDelete.name}"? This action cannot be undone.`}
          confirmText="Yes, Delete"
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setItemToDelete(null)}
        />
      )}
    </div>
  );
}

// ==========================================
// 5. PROJECTS TAB (CREATE, EDIT, REORDER, DELETE)
// ==========================================
function ProjectsTab() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [reordering, setReordering] = useState(false);

  // Edit/Create form state
  const [formData, setFormData] = useState({
    name: "",
    subtitle: "",
    description: "",
    techStack: [],
    imageUrl: "",
    liveUrl: "",
    githubUrl: "",
    featured: false,
    order: 1,
  });

  const [tagInput, setTagInput] = useState("");
  const [previewError, setPreviewError] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const populateForm = (proj) => {
    const rawTitle = proj.title || "";
    const parts = rawTitle.split(" - ");
    const name = parts[0]?.trim() || rawTitle;
    const subtitle = parts.slice(1).join(" - ")?.trim() || "";

    setFormData({
      name,
      subtitle,
      description: proj.description || "",
      techStack: Array.isArray(proj.techStack)
        ? [...proj.techStack]
        : typeof proj.techStack === "string"
        ? proj.techStack.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      imageUrl: proj.imageUrl || "",
      liveUrl: proj.liveUrl || "",
      githubUrl: proj.githubUrl || "",
      featured: Boolean(proj.featured),
      order: Number(proj.order) || 1,
    });
    setPreviewError(false);
  };

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/projects");
      const list = res.data?.data || [];
      setProjects(list);
      if (list.length > 0 && !selectedId && !isCreating) {
        setSelectedId(list[0]._id);
        populateForm(list[0]);
      }
    } catch (err) {
      setError("Failed to load projects from server.");
    } finally {
      setLoading(false);
    }
  }, [selectedId, isCreating]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSelectProject = (proj) => {
    setIsCreating(false);
    setSelectedId(proj._id);
    populateForm(proj);
  };

  const handleStartAdd = () => {
    setIsCreating(true);
    setSelectedId("");
    setFormData({
      name: "",
      subtitle: "",
      description: "",
      techStack: [],
      imageUrl: "",
      liveUrl: "",
      githubUrl: "",
      featured: false,
      order: projects.length + 1,
    });
    setTagInput("");
    setPreviewError(false);
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const raw = tagInput.trim().replace(/^,+|,+$/g, "");
      if (!raw) return;
      if (formData.techStack.length >= 12) {
        showToast("Maximum 12 tags allowed.", "error");
        return;
      }
      if (!formData.techStack.includes(raw)) {
        setFormData((prev) => ({
          ...prev,
          techStack: [...prev.techStack, raw],
        }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((t) => t !== tagToRemove),
    }));
  };

  const handleReorder = async (currentIndex, direction) => {
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const reordered = [...projects];
    const temp = reordered[currentIndex];
    reordered[currentIndex] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    setProjects(reordered);
    setReordering(true);

    try {
      const ids = reordered.map((p) => p._id);
      const res = await api.patch("/projects/reorder", { ids });
      if (res.data?.success) {
        showToast("Projects order updated!");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to reorder projects", "error");
      fetchProjects();
    } finally {
      setReordering(false);
    }
  };

  const validateUrl = (url) => {
    if (!url || url.trim() === "") return true;
    try {
      const parsed = new URL(url.trim());
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const validateImageUrl = (url) => {
    if (!url || url.trim() === "") return true;
    if (url.trim().startsWith("/")) return true;
    try {
      const parsed = new URL(url.trim());
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast("Project Name is required.", "error");
      return;
    }
    if (!formData.description.trim()) {
      showToast("Description is required.", "error");
      return;
    }
    if (!validateImageUrl(formData.imageUrl)) {
      showToast("Image URL must be a valid http/https URL or root-relative path (/projects/...).", "error");
      return;
    }
    if (!validateUrl(formData.liveUrl)) {
      showToast("Live URL must be a valid http:// or https:// URL (or empty).", "error");
      return;
    }
    if (!validateUrl(formData.githubUrl)) {
      showToast("GitHub URL must be a valid http:// or https:// URL (or empty).", "error");
      return;
    }

    setSaving(true);
    const combinedTitle = formData.name.trim() + (formData.subtitle.trim() ? ` - ${formData.subtitle.trim()}` : "");

    const payload = {
      title: combinedTitle,
      description: formData.description.trim(),
      techStack: formData.techStack,
      imageUrl: formData.imageUrl.trim(),
      liveUrl: formData.liveUrl.trim(),
      githubUrl: formData.githubUrl.trim(),
      featured: Boolean(formData.featured),
      order: Number(formData.order) || 1,
    };

    try {
      if (isCreating) {
        const res = await api.post("/projects", payload);
        if (res.data?.success) {
          const created = res.data.data;
          setProjects((prev) => [...prev, created]);
          setSelectedId(created._id);
          setIsCreating(false);
          populateForm(created);
          showToast(`Project "${formData.name}" created successfully!`);
        }
      } else {
        const res = await api.put(`/projects/${selectedId}`, payload);
        if (res.data?.success) {
          const updated = res.data.data;
          setProjects((prev) =>
            prev.map((p) => (p._id === selectedId ? updated : p))
          );
          populateForm(updated);
          showToast(`Project "${formData.name}" updated successfully!`);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save project. Please check inputs.", "error");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${itemToDelete._id}`);
      const remaining = projects.filter((p) => p._id !== itemToDelete._id);
      setProjects(remaining);
      showToast(`Project "${itemToDelete.title}" deleted.`);
      setItemToDelete(null);

      if (remaining.length > 0) {
        setSelectedId(remaining[0]._id);
        populateForm(remaining[0]);
        setIsCreating(false);
      } else {
        handleStartAdd();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete project.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const selectedProject = projects.find((p) => p._id === selectedId);

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[#FFFFFF] border shadow-2xl animate-fade-in font-mono text-xs ${
            toast.type === "error"
              ? "border-red-500 text-red-300"
              : "border-[#2E7D32] text-[#F79F15]"
          }`}
        >
          {toast.type === "error" ? (
            <FiAlertCircle className="text-base shrink-0 text-red-400" />
          ) : (
            <FiCheckCircle className="text-base shrink-0 text-[#F79F15]" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-bold text-[#1A110A]">
            Projects Manager
          </h2>
          <p className="text-xs text-[#6F6B60]">
            Create, edit, reorder and delete published portfolio projects.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchProjects}
            disabled={loading || reordering}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#9F9B90]/30 hover:border-[#9F9B90]/30 bg-[#F8F5EE] text-xs font-mono text-[#6F6B60] hover:text-[#1A110A] transition-all cursor-pointer"
          >
            <FiRefreshCw className={`text-xs ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleStartAdd}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer shadow-lg ${
              isCreating
                ? "bg-[#F79F15] text-[#1A110A] ring-2 ring-[#F79F15]"
                : "bg-[#F79F15] text-[#1A110A] hover:brightness-110 shadow-sm"
            }`}
          >
            <FiPlus className="text-sm stroke-[3]" />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-200 text-xs flex items-center gap-3">
          <FiAlertCircle className="text-red-400 text-lg shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-[#FFFFFF] rounded-2xl p-8 border border-[#9F9B90]/20 animate-pulse flex flex-col gap-4">
          <div className="h-6 w-48 bg-white/10 rounded" />
          <div className="h-40 w-full bg-white/5 rounded" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Projects List & Reordering Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#6F6B60] uppercase tracking-wider">
                Projects List ({projects.length})
              </span>
              <span className="text-[10px] font-mono text-[#6F6B60]">
                Use arrows to reorder
              </span>
            </div>

            {projects.length === 0 ? (
              <div className="bg-[#FFFFFF] rounded-2xl p-6 text-center border border-[#9F9B90]/20 bg-[#FFFFFF] text-xs text-[#6F6B60]">
                No projects yet. Click "Add Project" to create one.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {projects.map((p, idx) => {
                  const isSelected = !isCreating && selectedId === p._id;
                  return (
                    <div
                      key={p._id}
                      className={`flex items-center justify-between gap-2 p-3 rounded-2xl border transition-all ${
                        isSelected
                          ? "border-[#F79F15] bg-[#F8F5EE] shadow-lg shadow-sm"
                          : "border-[#9F9B90]/20 bg-[#FFFFFF] hover:border-[#9F9B90]/30"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectProject(p)}
                        className="flex-1 text-left min-w-0 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-heading font-semibold text-xs sm:text-sm truncate text-[#1A110A]">
                            {p.title}
                          </span>
                          {p.featured && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#F8F5EE] text-[#F79F15] border border-[#F79F15]/40 shrink-0">
                              ★
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-[#6F6B60] truncate">
                          Order: {p.order} · {p.slug}
                        </div>
                      </button>

                      {/* Reorder Arrows */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0 || reordering}
                          onClick={() => handleReorder(idx, -1)}
                          title="Move up"
                          className="w-7 h-7 rounded-lg border border-[#9F9B90]/30 hover:border-[#9F9B90]/30 hover:bg-white/5 text-[#6F6B60] hover:text-[#1A110A] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer"
                        >
                          <FiArrowUp className="text-xs" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === projects.length - 1 || reordering}
                          onClick={() => handleReorder(idx, 1)}
                          title="Move down"
                          className="w-7 h-7 rounded-lg border border-[#9F9B90]/30 hover:border-[#9F9B90]/30 hover:bg-white/5 text-[#6F6B60] hover:text-[#1A110A] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer"
                        >
                          <FiArrowDown className="text-xs" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form Editor Column (7 cols) */}
          <div className="lg:col-span-7 bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#9F9B90]/30 bg-[#FFFFFF] shadow-xl">
            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#9F9B90]/20">
                <div>
                  <h3 className="font-heading font-bold text-lg text-[#1A110A]">
                    {isCreating ? "Add New Project" : "Edit Project"}
                  </h3>
                  <p className="text-[11px] font-mono text-[#F79F15]">
                    {isCreating
                      ? "Will auto-generate unique slug & append to list"
                      : `Editing: ${selectedProject?.slug || selectedId}`}
                  </p>
                </div>

                {!isCreating && selectedProject && (
                  <button
                    type="button"
                    onClick={() => setItemToDelete(selectedProject)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 text-xs font-mono text-red-400 hover:text-red-300 transition-all cursor-pointer"
                  >
                    <FiTrash2 className="text-xs" />
                    <span>Delete Project</span>
                  </button>
                )}
              </div>

              {/* Name & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-[#6F6B60] uppercase">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. DevSpace"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8F5EE] border border-[#9F9B90]/30 focus:border-[#F79F15] focus:ring-1 focus:ring-[#F79F15] text-[#1A110A] text-sm outline-none font-body"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-[#6F6B60] uppercase">
                    Subtitle (e.g. Purpose/Type)
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                    placeholder="e.g. Collaborative Project Management"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8F5EE] border border-[#9F9B90]/30 focus:border-[#F79F15] focus:ring-1 focus:ring-[#F79F15] text-[#1A110A] text-sm outline-none font-body"
                  />
                </div>
              </div>

              {/* Preview Formatted Title */}
              <div className="text-[11px] font-mono text-[#6F6B60] px-3 py-2 rounded-xl bg-white/[0.02] border border-[#9F9B90]/20">
                Display Title:{" "}
                <span className="text-[#1A110A] font-semibold">
                  {formData.name.trim() || "[Project Name]"}
                  {formData.subtitle.trim() ? ` - ${formData.subtitle.trim()}` : ""}
                </span>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#6F6B60] uppercase">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Comprehensive description of the full-stack architecture, key features, and problem solved..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8F5EE] border border-[#9F9B90]/30 focus:border-[#F79F15] focus:ring-1 focus:ring-[#F79F15] text-[#1A110A] text-sm outline-none font-body leading-relaxed"
                />
              </div>

              {/* Tech Stack Chips & Input */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-[#6F6B60] uppercase">
                    Tech Stack ({formData.techStack.length}/12 tags)
                  </label>
                  <span className="text-[10px] font-mono text-[#6F6B60]">
                    Press Enter or comma to add
                  </span>
                </div>

                {/* Chips Container */}
                <div className="flex flex-wrap gap-2 min-h-[38px] p-2 rounded-xl bg-white/[0.02] border border-[#9F9B90]/30 items-center">
                  {formData.techStack.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8F5EE] border border-[#9F9B90]/40 text-xs font-mono text-[#1A110A]"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-[#6F6B60] hover:text-red-400 cursor-pointer"
                        title={`Remove ${tag}`}
                      >
                        <FiX className="text-xs" />
                      </button>
                    </span>
                  ))}
                  {formData.techStack.length < 12 && (
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder={formData.techStack.length === 0 ? "Type tag + Enter (e.g. React)" : "+ Add tag"}
                      className="flex-1 min-w-[120px] bg-transparent text-sm text-[#1A110A] placeholder-[#6F6B60]/50 outline-none px-2 font-mono"
                    />
                  )}
                </div>
              </div>

              {/* Cover Image URL with Live Thumbnail Preview */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono text-[#6F6B60] uppercase">
                  Cover Image URL or Path
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, imageUrl: e.target.value });
                      setPreviewError(false);
                    }}
                    placeholder="/projects/devspace-placeholder.png or https://..."
                    className="flex-1 w-full px-4 py-2.5 rounded-xl bg-[#F8F5EE] border border-[#9F9B90]/30 focus:border-[#F79F15] focus:ring-1 focus:ring-[#F79F15] text-[#1A110A] text-sm outline-none font-mono"
                  />

                  {/* Thumbnail Preview Card */}
                  <div className="w-28 h-16 rounded-xl overflow-hidden border border-[#9F9B90]/30 bg-[#F8F5EE] shrink-0 flex items-center justify-center relative">
                    {formData.imageUrl && !previewError ? (
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        onError={() => setPreviewError(true)}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#6F6B60] text-[10px] font-mono gap-1">
                        <FiImage className="text-sm" />
                        <span>Monogram</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Live URL & GitHub URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-[#6F6B60] uppercase">
                    Live Demo URL (http/https or empty)
                  </label>
                  <input
                    type="text"
                    value={formData.liveUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, liveUrl: e.target.value })
                    }
                    placeholder="https://example.com/live"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8F5EE] border border-[#9F9B90]/30 focus:border-[#F79F15] focus:ring-1 focus:ring-[#F79F15] text-[#1A110A] text-sm outline-none font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-[#6F6B60] uppercase">
                    GitHub Repo URL (http/https or empty)
                  </label>
                  <input
                    type="text"
                    value={formData.githubUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, githubUrl: e.target.value })
                    }
                    placeholder="https://github.com/..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8F5EE] border border-[#9F9B90]/30 focus:border-[#F79F15] focus:ring-1 focus:ring-[#F79F15] text-[#1A110A] text-sm outline-none font-mono"
                  />
                </div>
              </div>

              {/* Order & Featured Flag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-[#6F6B60] uppercase">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8F5EE] border border-[#9F9B90]/30 focus:border-[#F79F15] focus:ring-1 focus:ring-[#F79F15] text-[#1A110A] text-sm outline-none font-mono"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4 sm:pt-6">
                  <input
                    type="checkbox"
                    id="featured-toggle"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData({ ...formData, featured: e.target.checked })
                    }
                    className="w-5 h-5 rounded accent-[#F79F15] cursor-pointer"
                  />
                  <label
                    htmlFor="featured-toggle"
                    className="text-sm font-body text-[#1A110A] cursor-pointer select-none"
                  >
                    Mark as Featured Project
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[#9F9B90]/20">
                {isCreating ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (projects.length > 0) {
                        setIsCreating(false);
                        setSelectedId(projects[0]._id);
                        populateForm(projects[0]);
                      }
                    }}
                    className="px-4 py-2 rounded-xl border border-[#9F9B90]/30 hover:bg-white/5 text-xs font-mono text-[#6F6B60] hover:text-[#1A110A] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                ) : (
                  <div className="text-[11px] font-mono text-[#6F6B60]">
                    Slug: <span className="text-[#F79F15]">{selectedProject?.slug}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl font-mono text-sm font-semibold text-[#1A110A] bg-[#F79F15] hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer shadow-lg shadow-sm"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#1A110A] border-t-transparent rounded-full animate-spin" />
                      <span>{isCreating ? "Creating..." : "Saving..."}</span>
                    </>
                  ) : (
                    <>
                      <FiCheck className="text-base stroke-[3]" />
                      <span>{isCreating ? "Create Project" : "Save Changes"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <ConfirmModal
          title="Delete Project"
          message={`Are you sure you want to delete project "${itemToDelete.title}"? This will permanently remove it from the database and public portfolio.`}
          confirmText="Yes, Delete Project"
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setItemToDelete(null)}
        />
      )}
    </div>
  );
}

// ==========================================
// 6. CONFIRMATION MODAL
// ==========================================
function ConfirmModal({ title, message, confirmText, loading, onConfirm, onCancel }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-md bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#9F9B90]/30 bg-[#FFFFFF] shadow-2xl flex flex-col gap-4">
        <div className="flex items-center gap-3 text-red-400">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <FiAlertCircle className="text-xl" />
          </div>
          <h3 className="text-lg font-heading font-bold text-[#1A110A]">{title}</h3>
        </div>

        <p className="text-sm text-[#6F6B60] leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-[#9F9B90]/30 hover:bg-white/5 text-xs font-mono text-[#6F6B60] hover:text-[#1A110A] transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-mono text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-red-500/20"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

