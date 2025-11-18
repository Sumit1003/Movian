import axios from "axios";

/* =============================================
   🔥 GLOBAL AXIOS INSTANCE (BEST PRACTICE)
============================================= */
const API_BASE = import.meta.env.VITE_API_BASE_URL?.trim();

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,               // COOKIE SUPPORT (IMPORTANT)
  headers: { "Content-Type": "application/json" }
});

/* =============================================
   MOVIES — TRENDING / DETAILS
============================================= */
export const fetchTrendingMovies = async () => {
  try {
    const res = await api.get("/api/movies/trending");
    return res.data;
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    throw error;
  }
};

export const getMovieById = async (id) => {
  try {
    const res = await api.get(`/api/movies/movie/${id}`);

    if (!res.data || res.data.Response === "False") {
      throw new Error("Invalid movie data");
    }

    return res.data;
  } catch (error) {
    console.error("Error fetching movie:", error);
    throw error;
  }
};

/* =============================================
   MOVIE POSTERS
============================================= */
export const fetchMoviePosters = async (title = "") => {
  try {
    const query = encodeURIComponent(title);
    const res = await api.get(`/api/movies/search/${query}`, {
      params: { page: 1 }
    });

    const posters = res.data.movies
      ?.map((m) => m.Poster)
      .filter((p) => p && p !== "N/A");

    return posters?.slice(0, 6) || [];
  } catch (error) {
    console.error("Poster fetch error:", error);
    return [];
  }
};

/* =============================================
   TRAILER FETCH
============================================= */
export const fetchTrailer = async (title, year = "") => {
  if (!title) return null;

  const encoded = encodeURIComponent(title);
  let url = `/api/movies/trailer/${encoded}`;
  if (year) url += `/${year}`;

  try {
    const res = await api.get(url);
    return res.data?.videoId ? res.data : null;
  } catch {
    return null;
  }
};

/* =============================================
   SEARCH MOVIES
============================================= */
export const searchMovies = async (query, page = 1) => {
  try {
    const res = await api.get(`/api/movies/search/${encodeURIComponent(query)}`, {
      params: { page }
    });

    const data = res.data;

    if (Array.isArray(data)) return { movies: data };
    if (data.Search) return { movies: data.Search };
    if (data.results) return { movies: data.results };

    return { movies: [] };
  } catch (e) {
    console.error("Search error:", e);
    throw new Error("Failed to fetch search results");
  }
};

/* =============================================
   GENRE MOVIES
============================================= */
export const fetchMoviesByGenre = async (genre, page = 1) => {
  try {
    const res = await api.get(`/api/movies/genre/${genre}`, {
      params: { page }
    });

    return res.data;
  } catch (error) {
    console.error("Genre fetch error:", error);
    throw error;
  }
};

/* =============================================
   ⭐ MY LIST (Auth Protected)
============================================= */
export const checkInMyList = async (imdbID) => {
  try {
    const res = await api.get(`/api/mylist/check/${imdbID}`);
    return res.data;
  } catch {
    return { success: false, exists: false };
  }
};

export const addToMyList = async (movie) => {
  try {
    const res = await api.post("/api/mylist/add", movie);
    return res.data;
  } catch {
    return { success: false };
  }
};

export const removeFromMyList = async (imdbID) => {
  try {
    const res = await api.delete(`/api/mylist/remove/${imdbID}`);
    return res.data;
  } catch {
    return { success: false };
  }
};

export const fetchMyList = async () => {
  try {
    const res = await api.get("/api/mylist/all");
    return res.data;
  } catch {
    return { success: false, list: [] };
  }
};

/* =============================================
   COMMENTS
============================================= */
export const fetchComments = async (movieId) => {
  try {
    const res = await api.get(`/api/comments/${movieId}`);
    return res.data;
  } catch {
    return { success: false, comments: [] };
  }
};

export const postComment = async (movieId, comment) => {
  try {
    const res = await api.post("/api/comments/add", {
      movieId,
      comment
    });

    return res.data;
  } catch {
    return { success: false };
  }
};
