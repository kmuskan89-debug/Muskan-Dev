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
    <div className="min-h-screen bg-[#060B16] text-[#E8EDF3] selection:bg-[#4DA3FF]/30 selection:text-[#5EEAD4] font-body flex flex-col">
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
      <div className="w-full max-w-md glass-card rounded-3xl p-8 sm:p-10 border border-white/10 bg-[#0E1626]/90 backdrop-blur-xl shadow-2xl relative">
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-[#4DA3FF]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-[#5EEAD4]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center gap-3 text-center mb-8 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#4DA3FF]/20 to-[#5EEAD4]/20 border border-white/10 flex items-center justify-center text-[#5EEAD4] shadow-lg">
            <FiLock className="text-2xl" />
          </div>
          <span className="text-xs font-mono font-semibold text-[#5EEAD4] tracking-widest uppercase">
            // PRIVATE ACCESS
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#E8EDF3]">
            Admin Console
          </h1>
          <p className="text-xs text-[#8A97AB]">
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
              className="text-xs font-mono text-[#8A97AB] uppercase tracking-wider"
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
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 focus:border-[#4DA3FF] focus:ring-1 focus:ring-[#4DA3FF] text-[#E8EDF3] placeholder-[#8A97AB]/50 text-sm transition-all outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="admin-password"
              className="text-xs font-mono text-[#8A97AB] uppercase tracking-wider"
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
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 focus:border-[#4DA3FF] focus:ring-1 focus:ring-[#4DA3FF] text-[#E8EDF3] placeholder-[#8A97AB]/50 text-sm transition-all outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-3 w-full py-3.5 px-6 rounded-xl font-mono text-sm font-semibold text-[#060B16] bg-gradient-to-r from-[#5EEAD4] to-[#4DA3FF] hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#5EEAD4]/10"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#060B16] border-t-transparent rounded-full animate-spin" />
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
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#060B16]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4DA3FF] to-[#5EEAD4] flex items-center justify-center font-mono font-bold text-[#060B16] text-sm shadow-md">
              MK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm tracking-tight text-[#E8EDF3]">
                  Admin Dashboard
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#5EEAD4] animate-pulse" />
              </div>
              <p className="text-[10px] font-mono text-[#8A97AB]">
                banur-node-cluster · production
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 hover:border-red-400/30 hover:bg-red-500/10 text-xs font-mono text-[#8A97AB] hover:text-red-300 transition-all cursor-pointer"
              title="Sign out of admin session"
            >
              <FiLogOut className="text-sm" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 overflow-x-auto border-t border-white/5 py-2">
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === "messages"
                ? "bg-[#4DA3FF]/15 text-[#5EEAD4] border border-[#5EEAD4]/30 shadow-sm"
                : "text-[#8A97AB] hover:text-[#E8EDF3] hover:bg-white/5 border border-transparent"
            }`}
          >
            <FiMail className="text-sm" />
            <span>Messages</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#5EEAD4] text-[#060B16] font-bold text-[10px]">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("guestbook")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === "guestbook"
                ? "bg-[#4DA3FF]/15 text-[#5EEAD4] border border-[#5EEAD4]/30 shadow-sm"
                : "text-[#8A97AB] hover:text-[#E8EDF3] hover:bg-white/5 border border-transparent"
            }`}
          >
            <FiBookOpen className="text-sm" />
            <span>Guestbook</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-[#060B16] font-bold text-[10px]">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === "projects"
                ? "bg-[#4DA3FF]/15 text-[#5EEAD4] border border-[#5EEAD4]/30 shadow-sm"
                : "text-[#8A97AB] hover:text-[#E8EDF3] hover:bg-white/5 border border-transparent"
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
          <h2 className="text-xl font-heading font-bold text-[#E8EDF3]">
            Inbox Messages
          </h2>
          <p className="text-xs text-[#8A97AB]">
            Showing contact inquiries ordered newest first.
          </p>
        </div>
        <button
          onClick={fetchMessages}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.03] text-xs font-mono text-[#8A97AB] hover:text-[#E8EDF3] transition-all cursor-pointer"
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
              className="glass-card rounded-2xl p-6 border border-white/5 animate-pulse flex flex-col gap-3"
            >
              <div className="h-4 w-48 bg-white/10 rounded" />
              <div className="h-4 w-32 bg-white/5 rounded" />
              <div className="h-16 w-full bg-white/5 rounded mt-2" />
            </div>
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-white/5 bg-[#0E1626]/40 flex flex-col items-center gap-3">
          <FiMail className="text-4xl text-[#8A97AB]/40" />
          <h3 className="font-heading font-semibold text-[#E8EDF3]">No messages yet</h3>
          <p className="text-xs text-[#8A97AB]">
            When visitors submit the contact form, their inquiries will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`glass-card rounded-2xl p-6 border transition-all ${
                !msg.read
                  ? "border-[#5EEAD4]/30 bg-[#0E1626]/90 shadow-lg shadow-[#5EEAD4]/5"
                  : "border-white/5 bg-[#0E1626]/50"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-bold text-base text-[#E8EDF3]">{msg.name}</h3>
                  <a
                    href={`mailto:${msg.email}`}
                    className="text-xs font-mono text-[#4DA3FF] hover:underline"
                  >
                    {msg.email}
                  </a>
                  {!msg.read ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#5EEAD4]/20 border border-[#5EEAD4]/40 text-[#5EEAD4] font-mono text-[10px] font-bold">
                      UNREAD
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-[#8A97AB] font-mono text-[10px]">
                      Read
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-[#8A97AB]">
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
                <div className="mb-2 text-xs font-mono text-[#5EEAD4]/90 font-medium">
                  Subject: {msg.subject}
                </div>
              )}

              <p className="text-sm text-[#CBD5E1] whitespace-pre-wrap leading-relaxed p-4 rounded-xl bg-white/[0.02] border border-white/5 font-body">
                {msg.message}
              </p>

              <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-white/5">
                <button
                  onClick={() => handleToggleRead(msg._id, msg.read)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 text-xs font-mono text-[#8A97AB] hover:text-[#E8EDF3] transition-all cursor-pointer"
                >
                  {msg.read ? "Mark as Unread" : "Mark as Read"}
                </button>

                <a
                  href={`mailto:${msg.email}?subject=${encodeURIComponent(
                    `Re: ${msg.subject || "Your portfolio inquiry"}`
                  )}`}
                  className="px-3 py-1.5 rounded-lg bg-[#4DA3FF]/20 border border-[#4DA3FF]/40 hover:bg-[#4DA3FF]/30 text-xs font-mono text-[#4DA3FF] hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
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
          <h2 className="text-xl font-heading font-bold text-[#E8EDF3]">
            Guestbook Moderation
          </h2>
          <p className="text-xs text-[#8A97AB]">
            Showing all entries with pending moderation notes listed first.
          </p>
        </div>
        <button
          onClick={fetchEntries}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.03] text-xs font-mono text-[#8A97AB] hover:text-[#E8EDF3] transition-all cursor-pointer"
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
              className="glass-card rounded-2xl p-6 border border-white/5 animate-pulse flex flex-col gap-3"
            >
              <div className="h-4 w-40 bg-white/10 rounded" />
              <div className="h-12 w-full bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-white/5 bg-[#0E1626]/40 flex flex-col items-center gap-3">
          <FiBookOpen className="text-4xl text-[#8A97AB]/40" />
          <h3 className="font-heading font-semibold text-[#E8EDF3]">No guestbook entries</h3>
          <p className="text-xs text-[#8A97AB]">
            Submissions from the public guestbook will appear here for review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {entries.map((entry) => (
            <div
              key={entry._id}
              className={`glass-card rounded-2xl p-6 border transition-all ${
                !entry.approved
                  ? "border-amber-400/30 bg-[#0E1626]/90 shadow-lg shadow-amber-400/5"
                  : "border-white/5 bg-[#0E1626]/50"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-base text-[#E8EDF3]">{entry.name}</h3>
                  {!entry.approved ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-mono text-[10px] font-bold">
                      PENDING REVIEW
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-[#5EEAD4]/20 border border-[#5EEAD4]/40 text-[#5EEAD4] font-mono text-[10px] font-bold">
                      APPROVED & PUBLIC
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-[#8A97AB]">
                  {new Date(entry.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <p className="text-sm text-[#CBD5E1] whitespace-pre-wrap leading-relaxed p-4 rounded-xl bg-white/[0.02] border border-white/5 font-body">
                "{entry.note}"
              </p>

              <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-white/5">
                {!entry.approved ? (
                  <button
                    onClick={() => handleApprove(entry._id, true)}
                    className="px-4 py-1.5 rounded-lg bg-[#5EEAD4] text-[#060B16] font-mono font-bold text-xs hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-[#5EEAD4]/20"
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
// 5. PROJECTS TAB (FORM EDITOR)
// ==========================================
function ProjectsTab() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Edit form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStack: "",
    imageUrl: "",
    liveUrl: "",
    githubUrl: "",
    featured: false,
    order: 0,
  });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/projects");
      const list = res.data?.data || [];
      setProjects(list);
      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0]._id);
        populateForm(list[0]);
      }
    } catch (err) {
      setError("Failed to load projects from server.");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const populateForm = (proj) => {
    setFormData({
      title: proj.title || "",
      description: proj.description || "",
      techStack: Array.isArray(proj.techStack)
        ? proj.techStack.join(", ")
        : proj.techStack || "",
      imageUrl: proj.imageUrl || "",
      liveUrl: proj.liveUrl || "",
      githubUrl: proj.githubUrl || "",
      featured: Boolean(proj.featured),
      order: Number(proj.order) || 0,
    });
  };

  const handleSelectProject = (proj) => {
    setSelectedId(proj._id);
    populateForm(proj);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedId) return;

    // Validate URLs (must be http/https or empty, imageUrl can also be root-relative)
    const validateUrl = (url) => {
      if (!url || url.trim() === "") return true;
      try {
        const parsed = new URL(url.trim());
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    };

    if (!validateUrl(formData.liveUrl)) {
      alert("Live URL must be a valid http:// or https:// URL (or empty).");
      return;
    }

    if (!validateUrl(formData.githubUrl)) {
      alert("GitHub URL must be a valid http:// or https:// URL (or empty).");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        techStack: formData.techStack
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        imageUrl: formData.imageUrl,
        liveUrl: formData.liveUrl,
        githubUrl: formData.githubUrl,
        featured: Boolean(formData.featured),
        order: Number(formData.order),
      };

      const res = await api.put(`/projects/${selectedId}`, payload);
      if (res.data?.success) {
        const updated = res.data.data;
        setProjects((prev) =>
          prev.map((p) => (p._id === selectedId ? updated : p))
        );
        setToastMessage("Project updated successfully!");
        setTimeout(() => setToastMessage(""), 4000);
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to update project. Please verify inputs."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[#0E1626] border border-[#5EEAD4] text-[#5EEAD4] shadow-2xl animate-fade-in font-mono text-xs">
          <FiCheckCircle className="text-base shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div>
        <h2 className="text-xl font-heading font-bold text-[#E8EDF3]">
          Projects Editor
        </h2>
        <p className="text-xs text-[#8A97AB]">
          Select a project below to modify its details and published links.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-200 text-xs flex items-center gap-3">
          <FiAlertCircle className="text-red-400 text-lg shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="glass-card rounded-2xl p-8 border border-white/5 animate-pulse flex flex-col gap-4">
          <div className="h-6 w-48 bg-white/10 rounded" />
          <div className="h-40 w-full bg-white/5 rounded" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Project Selector List (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <span className="text-xs font-mono text-[#8A97AB] uppercase tracking-wider">
              Select Project ({projects.length})
            </span>
            <div className="flex flex-col gap-2">
              {projects.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => handleSelectProject(p)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedId === p._id
                      ? "border-[#4DA3FF] bg-[#4DA3FF]/15 text-[#E8EDF3] shadow-lg shadow-[#4DA3FF]/5"
                      : "border-white/5 bg-[#0E1626]/60 text-[#8A97AB] hover:text-[#E8EDF3] hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-heading font-semibold text-sm truncate text-[#E8EDF3]">
                      {p.title}
                    </span>
                    {p.featured && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#5EEAD4]/20 text-[#5EEAD4] border border-[#5EEAD4]/30 shrink-0">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-[#8A97AB] truncate">
                    Order: {p.order} · {p.slug}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Edit Form (8 cols) */}
          <div className="lg:col-span-8 glass-card rounded-3xl p-6 sm:p-8 border border-white/10 bg-[#0E1626]/90 shadow-xl">
            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h3 className="font-heading font-bold text-lg text-[#E8EDF3]">
                  Edit Project Details
                </h3>
                <span className="text-[11px] font-mono text-[#5EEAD4]">
                  ID: {selectedId.slice(-6)}
                </span>
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#8A97AB] uppercase">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-[#4DA3FF] focus:ring-1 focus:ring-[#4DA3FF] text-[#E8EDF3] text-sm outline-none font-body"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#8A97AB] uppercase">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-[#4DA3FF] focus:ring-1 focus:ring-[#4DA3FF] text-[#E8EDF3] text-sm outline-none font-body leading-relaxed"
                />
              </div>

              {/* Tech Stack */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#8A97AB] uppercase">
                  Tech Stack (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.techStack}
                  onChange={(e) =>
                    setFormData({ ...formData, techStack: e.target.value })
                  }
                  placeholder="React, Tailwind CSS, Node.js, Express, MongoDB"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-[#4DA3FF] focus:ring-1 focus:ring-[#4DA3FF] text-[#E8EDF3] text-sm outline-none font-mono"
                />
              </div>

              {/* Image URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#8A97AB] uppercase">
                  Cover Image URL or Path
                </label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="/projects/devspace-placeholder.png"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-[#4DA3FF] focus:ring-1 focus:ring-[#4DA3FF] text-[#E8EDF3] text-sm outline-none font-mono"
                />
              </div>

              {/* Live URL & GitHub URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-[#8A97AB] uppercase">
                    Live Demo URL (http/https or empty)
                  </label>
                  <input
                    type="text"
                    value={formData.liveUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, liveUrl: e.target.value })
                    }
                    placeholder="https://example.com/live"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-[#4DA3FF] focus:ring-1 focus:ring-[#4DA3FF] text-[#E8EDF3] text-sm outline-none font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-[#8A97AB] uppercase">
                    GitHub Repo URL (http/https or empty)
                  </label>
                  <input
                    type="text"
                    value={formData.githubUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, githubUrl: e.target.value })
                    }
                    placeholder="https://github.com/..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-[#4DA3FF] focus:ring-1 focus:ring-[#4DA3FF] text-[#E8EDF3] text-sm outline-none font-mono"
                  />
                </div>
              </div>

              {/* Order & Featured Flag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-[#8A97AB] uppercase">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-[#4DA3FF] focus:ring-1 focus:ring-[#4DA3FF] text-[#E8EDF3] text-sm outline-none font-mono"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6 sm:pt-4">
                  <input
                    type="checkbox"
                    id="featured-toggle"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData({ ...formData, featured: e.target.checked })
                    }
                    className="w-5 h-5 rounded accent-[#5EEAD4] cursor-pointer"
                  />
                  <label
                    htmlFor="featured-toggle"
                    className="text-sm font-body text-[#E8EDF3] cursor-pointer select-none"
                  >
                    Mark as Featured Project
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t border-white/5">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl font-mono text-sm font-semibold text-[#060B16] bg-gradient-to-r from-[#5EEAD4] to-[#4DA3FF] hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer shadow-lg shadow-[#5EEAD4]/10"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#060B16] border-t-transparent rounded-full animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <FiCheck className="text-base stroke-[3]" />
                      <span>Save Project</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
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
      <div className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 border border-white/15 bg-[#0E1626] shadow-2xl flex flex-col gap-4">
        <div className="flex items-center gap-3 text-red-400">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <FiAlertCircle className="text-xl" />
          </div>
          <h3 className="text-lg font-heading font-bold text-[#E8EDF3]">{title}</h3>
        </div>

        <p className="text-sm text-[#8A97AB] leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-mono text-[#8A97AB] hover:text-[#E8EDF3] transition-all cursor-pointer"
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

