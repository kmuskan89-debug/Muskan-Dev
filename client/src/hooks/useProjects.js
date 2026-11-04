import { useState, useEffect } from "react";
import api from "../lib/api";
import { projects as fallbackProjects } from "../data/content";

// Normalizes local fallback projects to match MongoDB schema fields
const normalizedFallbackProjects = (fallbackProjects || []).map((p, idx) => ({
  _id: `fallback-${idx}`,
  title: p.title,
  slug: p.slug || p.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, ""),
  description: p.description,
  techStack: p.techStack || p.stack || [],
  imageUrl: p.imageUrl || p.image || "",
  liveUrl: p.liveUrl || "",
  githubUrl: p.githubUrl || "",
  featured: idx < 2,
  order: idx + 1,
}));

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState("loading"); // 'api' | 'fallback' | 'loading'

  useEffect(() => {
    let isMounted = true;

    async function fetchProjects() {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get("/projects");
        if (!isMounted) return;

        const data = response.data?.data || response.data;
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
          setSource("api");
        } else {
          // If API returns an empty array, fall back to local projects
          setProjects(normalizedFallbackProjects);
          setSource("fallback");
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn("⚠️ Projects API unreachable or timed out. Falling back to local data:", err.message);
        setError(err.message || "Failed to fetch from API");
        setProjects(normalizedFallbackProjects);
        setSource("fallback");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  return { projects, loading, error, source };
}

export default useProjects;

