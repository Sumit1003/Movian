import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring
} from "framer-motion";
import {
  Menu,
  X,
  Search,
  User,
  Home,
  Film,
  Bookmark,
  LogOut,
  ChevronDown
} from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("up");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isScrolled] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  // Auth (User)
  const { user, logout } = useContext(AuthContext);

  const profileRef = useRef(null);
  const searchRef = useRef(null);

  // -------------------------------------------
  // 🔥 Scroll Hide Logic
  // -------------------------------------------
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScroll = () => {
      const currentScrollY = window.scrollY;

      if (!ticking) {
        requestAnimationFrame(() => {
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setScrollDirection("down");
          } else if (currentScrollY < lastScrollY) {
            setScrollDirection("up");
          }
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", updateScroll);
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  // -------------------------------------------
  // 🔥 Close menus on route change
  // -------------------------------------------
  useEffect(() => {
    setMenuOpen(false);
    setShowMobileSearch(false);
    setProfileDropdown(false);
  }, [location.pathname]);

  // -------------------------------------------
  // 🔥 Click outside detection
  // -------------------------------------------
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowMobileSearch(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // -------------------------------------------
  // 🔥 Search Handler
  // -------------------------------------------
  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;

    navigate(`/search?query=${encodeURIComponent(term)}`);
    setSearchTerm("");
    setShowMobileSearch(false);
    setMenuOpen(false);
  };

  // -------------------------------------------
  // 🔥 Logout Handler
  // -------------------------------------------
  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setProfileDropdown(false);
    navigate("/");
  };

  // -------------------------------------------
  // Framer Motion Config
  // -------------------------------------------
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30
  });

  const navVariants = {
    hidden: { y: "-100%", opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const sidebarVariants = {
    hidden: { x: "100%" },
    visible: {
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: { x: "100%", transition: { duration: 0.3 } }
  };

  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -10 }
  };

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Movies", path: "/movies", icon: Film },
    { name: "Search", path: "/search", icon: Search },
    { name: "MyList", path: "/mylist", icon: Bookmark }
  ];

  const getNavBackground = () =>
    isScrolled
      ? "bg-black/95 backdrop-blur-xl shadow-xl"
      : "bg-gradient-to-b from-black/90 to-transparent backdrop-blur-md";

  return (
    <>
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-red-600 z-[100]"
        style={{ scaleX, transformOrigin: "0%" }}
      />

      {/* Navbar */}
      <motion.nav
        variants={navVariants}
        initial="visible"
        animate={scrollDirection === "down" ? "hidden" : "visible"}
        className={`flex justify-between items-center px-4 sm:px-6 md:px-10 py-3 fixed w-full top-0 z-50 transition-all ${getNavBackground()} border-b border-gray-800`}
      >
        {/* Logo */}
        <div className="flex items-center gap-6">
          <motion.div
            onClick={() => navigate("/")}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <h1 className="text-2xl font-bold text-white">MOVIAN</h1>
          </motion.div>

          {/* Desktop Links */}
          <ul className="hidden md:flex gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`cursor-pointer px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${
                    location.pathname === link.path
                      ? "text-white bg-red-600/20 border-b border-red-600"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon size={18} />
                  {link.name}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            /* ------------------------ USER VIEW ------------------------- */
            <div className="relative" ref={profileRef}>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700"
                onClick={() => setProfileDropdown(!profileDropdown)}
              >
                <User size={18} className="text-red-500" />
                <span className="hidden lg:block">{user.username}</span>
                <ChevronDown
                  className={`transition ${profileDropdown ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {profileDropdown && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 mt-3 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg"
                  >
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-800"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* ------------------------ GUEST VIEW ------------------------ */
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 rounded-full bg-gray-800 border border-gray-700"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Mobile Buttons */}
        <div className="flex md:hidden gap-4">
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="p-2 rounded-full text-white hover:bg-gray-700"
          >
            <Search size={20} />
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-full text-white hover:bg-gray-700"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* ------------------------------ MOBILE SEARCH ------------------------------ */}
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div
            key="mobile-search"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            ref={searchRef}
            className="fixed top-20 left-4 right-4 bg-gray-900 border border-gray-700 rounded-lg p-4 z-40"
          >
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                placeholder="Search movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              <button className="px-4 py-2 bg-red-600 rounded-lg">Go</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------ MOBILE MENU ------------------------------ */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
            />

            <motion.div
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed right-0 top-0 w-80 max-w-[85vw] h-full bg-gray-900 z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => navigate("/")}
                >
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex justify-center items-center">
                    <span className="font-bold text-xl text-white">M</span>
                  </div>
                  <h2 className="text-xl font-bold">MOVIAN</h2>
                </div>

                <button onClick={() => setMenuOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              {/* Nav Links */}
              <div className="flex-1 p-6 space-y-3">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <div
                      key={link.path}
                      onClick={() => navigate(link.path)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                        location.pathname === link.path
                          ? "bg-red-600/20 text-red-500"
                          : "text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      <Icon size={20} />
                      {link.name}
                    </div>
                  );
                })}
              </div>

              {/* Auth Section */}
              <div className="p-6 border-t border-gray-800">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-4 mb-3">
                      <User size={20} className="text-red-500" />
                      <div>
                        <p className="text-sm text-gray-400">Logged in as</p>
                        <p className="text-white">{user.username}</p>
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center gap-2"
                    >
                      <LogOut size={20} /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full py-3 bg-gray-800 rounded-lg mb-3"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => navigate("/register")}
                      className="w-full py-3 bg-red-600 rounded-lg"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
