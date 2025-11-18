import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Info, Star, Calendar, Clock, Heart, FilmIcon } from "lucide-react";
import TrailerModal from "./TrailerModal";

import {
  checkInMyList,
  addToMyList,
  removeFromMyList,
  fetchTrailer
} from "../utils/api"; // ⭐ using real MyList APIs

const Hero = ({ movie }) => {
  const navigate = useNavigate();

  const [trailer, setTrailer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false); // ⭐ NEW

  // ⭐ Check MyList status
  useEffect(() => {
    const run = async () => {
      if (!movie?.imdbID) return;

      const res = await checkInMyList(movie.imdbID);

      if (res.success) {
        setIsSaved(res.exists);
      }
    };
    run();
  }, [movie]);

  // 🎬 Fetch Trailer
  const handleWatchTrailer = async () => {
    if (!movie?.Title) return;

    setIsLoading(true);

    try {
      const data = await fetchTrailer(movie.Title, movie.Year);

      if (!data?.videoId) {
        toast.error("Trailer not available");
        return;
      }

      setTrailer(data);
    } catch (err) {
      toast.error("Failed to load trailer");
    } finally {
      setIsLoading(false);
    }
  };

  // ⭐ Save / Unsave Movie
  const handleToggleMyList = async () => {
    if (!movie) return;

    setSaving(true);

    // If not logged in → redirect to login
    const check = await checkInMyList(movie.imdbID);
    if (!check.success && check.message?.includes("Authentication")) {
      return navigate("/login");
    }

    try {
      if (!isSaved) {
        // ➕ Add
        const res = await addToMyList({
          imdbID: movie.imdbID,
          title: movie.Title,
          poster: movie.Poster,
          year: movie.Year,
          type: movie.Type,
        });

        if (res.success) {
          toast.success("Added to My List ❤️");
          setIsSaved(true);
        } else {
          toast.error(res.message || "Failed to save");
        }
      } else {
        // ➖ Remove
        const res = await removeFromMyList(movie.imdbID);

        if (res.success) {
          toast.success("Removed from My List");
          setIsSaved(false);
        } else {
          toast.error(res.message || "Failed to remove");
        }
      }
    } catch (err) {
      toast.error("Action failed");
    }

    setSaving(false);
  };

  // Navigate to details
  const handleNavigateToMovies = () => {
    navigate(`/movies/${movie.imdbID}`);
  };

  if (!movie) return null;

  // Motion variants
  const bgVariants = {
    hidden: { opacity: 0, scale: 1.05 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1.2, ease: "easeOut" },
    },
  };

  const textVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: (delay = 0) => ({
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, delay },
    }),
  };

  const buttonVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, delay: 0.8 },
    },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  const formatRuntime = (runtime) => {
    if (!runtime || runtime === "N/A") return "N/A";
    if (runtime.includes("min")) {
      const mins = parseInt(runtime);
      const hours = Math.floor(mins / 60);
      const rest = mins % 60;
      return `${hours}h ${rest}m`;
    }
    return runtime;
  };

  return (
    <motion.div
      variants={bgVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full h-[70vh] md:h-[80vh] lg:h-[85vh] flex flex-col justify-end overflow-hidden"
    >
      <Toaster position="top-right" />

      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={movie.Poster !== "N/A" ? movie.Poster : "/placeholder-movie.jpg"}
          alt={movie.Title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 md:px-12 lg:px-16 pb-12">
        <div className="max-w-3xl">

          {/* Title */}
          <motion.h1
            custom={0.3}
            variants={textVariants}
            className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-xl"
          >
            {movie.Title}
          </motion.h1>

          {/* Meta */}
          <motion.div
            custom={0.4}
            variants={textVariants}
            className="flex flex-wrap items-center gap-3 mt-3 text-white/90 text-sm md:text-base"
          >
            {movie.imdbRating !== "N/A" && (
              <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded">
                <Star size={16} className="text-yellow-500" />
                <span>{movie.imdbRating}/10</span>
              </div>
            )}
            <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
              <Calendar size={16} />
              <span>{movie.Year}</span>
            </div>
            {movie.Runtime && (
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
                <Clock size={16} />
                <span>{formatRuntime(movie.Runtime)}</span>
              </div>
            )}
          </motion.div>

          {/* Plot */}
          <motion.p
            custom={0.5}
            variants={textVariants}
            className="text-gray-200 mt-4 max-w-2xl line-clamp-3 md:line-clamp-4"
          >
            {movie.Plot}
          </motion.p>

          {/* Buttons */}
          <motion.div variants={buttonVariants} className="flex gap-4 mt-6 flex-wrap">
            
            {/* 🎬 Trailer */}
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={handleWatchTrailer}
              disabled={isLoading}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow-md disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FilmIcon size={20} />
              )}
              Watch Trailer
            </motion.button>

            {/* ❤️ Save / Unsave */}
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={handleToggleMyList}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg shadow-md disabled:opacity-60 
                ${isSaved ? "bg-red-600 hover:bg-red-700" : "bg-gray-800 hover:bg-gray-700"} 
              `}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Heart size={20} className={isSaved ? "text-white" : "text-red-400"} />
              )}
              {isSaved ? "Saved ❤️" : "Save to My List"}
            </motion.button>

            {/* More Info */}
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={handleNavigateToMovies}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
            >
              <Info size={20} />
              More Info
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {trailer && (
          <TrailerModal
            trailer={trailer}
            isOpen={true}
            onClose={() => setTrailer(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Hero;