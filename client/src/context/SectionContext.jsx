import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const NAV_SECTION_IDS = ["home", "about", "skills", "projects", "contact"];

const SectionContext = createContext({
  activeSection: "home",
  setActiveSection: () => {},
});

export function useActiveSection() {
  return useContext(SectionContext);
}

export function SectionProvider({ children }) {
  const [activeSection, setActiveSection] = useState("home");
  const activeSectionRef = useRef("home");

  const updateSection = useCallback((nextSection) => {
    if (nextSection && activeSectionRef.current !== nextSection) {
      activeSectionRef.current = nextSection;
      setActiveSection(nextSection);
    }
  }, []);

  useEffect(() => {
    const handleScrollOrResize = () => {
      // Bottom of page check
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60;
      if (atBottom) {
        updateSection("contact");
        return;
      }

      // Top of page check
      if (window.scrollY < 120) {
        updateSection("home");
        return;
      }

      // Dynamic probe point: 35% of viewport height (comfortably below header & navbar)
      const probeY = window.innerHeight * 0.35;

      for (let i = NAV_SECTION_IDS.length - 1; i >= 0; i--) {
        const id = NAV_SECTION_IDS[i];
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= probeY && rect.bottom > probeY) {
            updateSection(id);
            return;
          }
        }
      }

      // Fallback: find deepest section whose top has scrolled past probe point
      for (let i = NAV_SECTION_IDS.length - 1; i >= 0; i--) {
        const id = NAV_SECTION_IDS[i];
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= probeY) {
            updateSection(id);
            return;
          }
        }
      }
    };

    handleScrollOrResize();

    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize);

    // Watch for DOM mutations (e.g. lazy-loaded sections replacing skeletons)
    const observer = new MutationObserver(() => {
      handleScrollOrResize();
    });
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
      observer.disconnect();
    };
  }, [updateSection]);

  return (
    <SectionContext.Provider value={{ activeSection, setActiveSection: updateSection }}>
      {children}
    </SectionContext.Provider>
  );
}
