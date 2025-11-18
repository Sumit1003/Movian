import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  MessageSquare,
  Ban,
  Calendar,
  Trash2,
  Mail,
  User,
  Home,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search
} from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState({});
  
  // Responsive sidebar states
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL || "";

  // Check screen size and set mobile state
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // LOAD USERS + COMMENTS
  const load = async () => {
    try {
      setIsLoading(true);
      const [usersResponse, commentsResponse] = await Promise.all([
        fetch(`${API}/api/admin/users`, {
          credentials: "include",
        }),
        fetch(`${API}/api/admin/comments`, {
          credentials: "include",
        })
      ]);

      if (!usersResponse.ok || !commentsResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const usersData = await usersResponse.json();
      const commentsData = await commentsResponse.json();

      setUsers(usersData.users || []);
      setComments(commentsData.comments || []);
    } catch (err) {
      console.error("Load error:", err);
      toast.error("Failed to load admin data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredUsers = users.filter((u) =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredComments = comments.filter((c) =>
    c.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // BAN / UNBAN
  const toggleBan = async (id, name) => {
    setIsProcessing(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(
        `${API}/api/admin/ban/${id}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (data.success) {
        toast.success(`${name} is now ${data.message.includes("unbanned") ? "unbanned" : "banned"}`);
        load();
      } else {
        toast.error(data.message || "Failed to update user");
      }
    } catch {
      toast.error("Failed to update user");
    } finally {
      setIsProcessing(prev => ({ ...prev, [id]: false }));
    }
  };

  // DELETE COMMENT
  const deleteComment = async (id, username) => {
    setIsProcessing(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(
        `${API}/api/admin/comments/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success(`Deleted comment by ${username}`);
        load();
      } else {
        toast.error(data.message || "Failed to delete comment");
      }
    } catch {
      toast.error("Failed to delete comment");
    } finally {
      setIsProcessing(prev => ({ ...prev, [id]: false }));
    }
  };

  // REPLY TO COMMENT
  const handleReply = async (commentId, replyText, username) => {
    if (!replyText?.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    setIsProcessing(prev => ({ ...prev, [`reply-${commentId}`]: true }));
    try {
      const res = await fetch(
        `${API}/api/admin/comments/reply/${commentId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ replyText }),
        }
      );

      const data = await res.json();
      if (data.success) {
        toast.success("Reply added!");
        load();
      } else {
        toast.error(data.message || "Failed to add reply");
      }
    } catch {
      toast.error("Failed to add reply");
    } finally {
      setIsProcessing(prev => ({ ...prev, [`reply-${commentId}`]: false }));
    }
  };

  // Sidebar toggle functions
  const toggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Sidebar animation variants
  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
    collapsed: { width: 80 },
    expanded: { width: 256 }
  };

  const overlayVariants = {
    open: { opacity: 1, pointerEvents: "auto" },
    closed: { opacity: 0, pointerEvents: "none" }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeMobileSidebar}
          />
        )}
      </AnimatePresence>

      {/* ----------------------- */}
      {/* SIDEBAR                 */}
      {/* ----------------------- */}
      <AnimatePresence>
        <motion.div
          variants={sidebarVariants}
          initial={isMobile ? "closed" : isSidebarCollapsed ? "collapsed" : "expanded"}
          animate={
            isMobile 
              ? (isSidebarOpen ? "open" : "closed")
              : (isSidebarCollapsed ? "collapsed" : "expanded")
          }
          className={`
            bg-gray-800 border-r border-gray-700 fixed h-full z-50 flex flex-col
            ${isMobile ? "w-64" : ""}
            ${!isMobile && isSidebarCollapsed ? "w-20" : "w-64"}
          `}
        >
          <div className={`p-6 flex items-center justify-between ${isSidebarCollapsed && !isMobile ? 'px-4' : ''}`}>
            {(!isSidebarCollapsed || isMobile) && (
              <div className="flex items-center gap-3">
                <LayoutDashboard size={26} className="text-red-500" />
                <h1 className="text-xl font-bold">Admin Panel</h1>
              </div>
            )}
            {isSidebarCollapsed && !isMobile && (
              <LayoutDashboard size={26} className="text-red-500 mx-auto" />
            )}
            
            {/* Close button for mobile */}
            {isMobile && (
              <button onClick={closeMobileSidebar} className="lg:hidden">
                <X size={20} />
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-2 px-4">
            <SidebarButton
              icon={Users}
              label="Users"
              active={activeTab === "users"}
              onClick={() => {
                setActiveTab("users");
                closeMobileSidebar();
              }}
              isCollapsed={isSidebarCollapsed && !isMobile}
            />

            <SidebarButton
              icon={MessageSquare}
              label="Comments"
              active={activeTab === "comments"}
              onClick={() => {
                setActiveTab("comments");
                closeMobileSidebar();
              }}
              isCollapsed={isSidebarCollapsed && !isMobile}
            />
          </div>

          <div className="p-4 space-y-2 border-t border-gray-700">
            <SidebarButton
              icon={Home}
              label="Back to Home"
              href="/"
              isCollapsed={isSidebarCollapsed && !isMobile}
            />

            <SidebarButton
              icon={LogOut}
              label="Logout"
              href="/login"
              isCollapsed={isSidebarCollapsed && !isMobile}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ----------------------- */}
      {/* MAIN CONTENT AREA       */}
      {/* ----------------------- */}
      <div 
        className={`
          flex-1 transition-all duration-300 min-h-screen
          ${!isMobile && isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
          ${isMobile ? 'ml-0' : ''}
        `}
      >
        {/* Header with Hamburger Menu */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                {isMobile ? (
                  <Menu size={20} />
                ) : isSidebarCollapsed ? (
                  <ChevronRight size={20} />
                ) : (
                  <ChevronLeft size={20} />
                )}
              </button>
              
              <div>
                <h1 className="text-2xl font-bold">Dashboard Overview</h1>
                <p className="text-gray-400 text-sm">
                  {activeTab === "users" ? "User Management" : "Comment Management"}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                placeholder="Search..."
                className="w-64 bg-gray-700 border border-gray-600 pl-10 pr-4 py-2 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Mobile Search */}
          <div className="mt-4 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                placeholder="Search..."
                className="w-full bg-gray-700 border border-gray-600 pl-10 pr-4 py-2 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {/* STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard 
              icon={Users} 
              color="text-blue-400" 
              label="Total Users" 
              value={users.length} 
            />

            <StatCard 
              icon={Ban} 
              color="text-red-400" 
              label="Banned Users" 
              value={users.filter(u => u.isBanned).length} 
            />

            <StatCard 
              icon={MessageSquare} 
              color="text-green-400" 
              label="Comments" 
              value={comments.length} 
            />

            <StatCard
              icon={Calendar}
              color="text-purple-400"
              label="Recent Comments"
              value={comments.filter((c) => new Date(c.createdAt) > Date.now() - 7 * 86400000).length}
            />
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full"
              />
            </div>
          ) : (
            <>
              {/* USERS TAB */}
              {activeTab === "users" && (
                <div className="space-y-4">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Users size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No users found</p>
                    </div>
                  ) : (
                    filteredUsers.map((u) => (
                      <motion.div
                        key={u._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-gray-800 rounded-xl border border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <User size={24} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg truncate">{u.username}</h3>
                              {u.isBanned && (
                                <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs flex items-center gap-1 flex-shrink-0">
                                  <Ban size={12} />
                                  Banned
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm flex items-center gap-2 truncate">
                              <Mail size={14} />
                              {u.email}
                            </p>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleBan(u._id, u.username)}
                          disabled={isProcessing[u._id]}
                          className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 min-w-[100px] justify-center ${
                            u.isBanned
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-red-600 hover:bg-red-700 text-white"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {isProcessing[u._id] ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            />
                          ) : u.isBanned ? (
                            "Unban"
                          ) : (
                            "Ban"
                          )}
                        </motion.button>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* COMMENTS TAB */}
              {activeTab === "comments" && (
                <div className="space-y-6">
                  {filteredComments.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No comments found</p>
                    </div>
                  ) : (
                    filteredComments.map((c) => (
                      <CommentCard
                        key={c._id}
                        comment={c}
                        onDelete={deleteComment}
                        onReply={handleReply}
                        isProcessing={isProcessing}
                      />
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Sidebar Button Component
const SidebarButton = ({ icon: Icon, label, active, onClick, href, isCollapsed }) => {
  const buttonContent = (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors w-full
        ${active 
          ? "bg-red-600 text-white" 
          : "bg-gray-700 hover:bg-gray-600 text-gray-200"
        }
        ${isCollapsed ? "justify-center px-2" : ""}
      `}
    >
      <Icon size={20} />
      {!isCollapsed && <span>{label}</span>}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {buttonContent}
      </a>
    );
  }

  return (
    <button onClick={onClick} className="w-full text-left">
      {buttonContent}
    </button>
  );
};

// Comment Card Component
const CommentCard = ({ comment, onDelete, onReply, isProcessing }) => {
  const [replyText, setReplyText] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-gray-800 rounded-xl border border-gray-700"
    >
      {/* User comment */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
          <User size={18} className="text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-red-400">{comment.username}</span>
            <span className="text-gray-500 text-sm">•</span>
            <span className="text-gray-400 text-sm">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-gray-300 mt-1">{comment.text}</p>
          <p className="text-gray-500 text-sm mt-1">Movie ID: {comment.movieId}</p>
        </div>
      </div>

      {/* ADMIN REPLIES */}
      {comment.replies?.length > 0 && (
  <div className="mt-4 ml-4 border-l-2 border-gray-700 pl-4 space-y-3">
    {comment.replies.map((reply, index) => (
      <div
        key={reply._id || `${comment._id}-${index}`} 
        className="bg-gray-900 p-4 rounded-lg"
      >
        <p className="text-blue-400 text-sm font-semibold mb-1">
          {reply.adminName} (Admin)
        </p>
        <p className="text-gray-300">{reply.replyText}</p>
        <p className="text-gray-500 text-xs mt-1">
          {new Date(reply.createdAt).toLocaleString()}
        </p>
      </div>
    ))}
  </div>
)}


      {/* REPLY INPUT & ACTIONS */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Reply as admin..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              onReply(comment._id, replyText, comment.username);
              setReplyText("");
            }}
            disabled={isProcessing[`reply-${comment._id}`] || !replyText.trim()}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing[`reply-${comment._id}`] ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              "Reply"
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(comment._id, comment.username)}
            disabled={isProcessing[comment._id]}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing[comment._id] ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                <Trash2 size={16} />
                <span className="hidden sm:inline">Delete</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, color, value, label }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700"
    >
      <Icon size={28} className={`${color} mb-3`} />
      <h1 className="text-3xl font-bold">{value}</h1>
      <p className="text-gray-400 text-sm">{label}</p>
    </motion.div>
  );
};

export default AdminDashboard;