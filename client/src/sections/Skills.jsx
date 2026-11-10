import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLenis } from "../components/SmoothScroll";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PullQuote from "../components/PullQuote";
import { skills, personalInfo } from "../data/content";

// Icons
import {
  SiJavascript,
  SiPython,
  SiC,
  SiReact,
  SiHtml5,
  SiTailwindcss,
  SiNodedotjs,
  SiExpress,
  SiJsonwebtokens,
  SiMongodb,
  SiMysql,
  SiGit,
  SiGithub,
  SiPostman,
  SiVercel,
} from "react-icons/si";
import { FaJava, FaCss3Alt } from "react-icons/fa";
import { VscVscode } from "react-icons/vsc";
import {
  FiServer,
  FiDatabase,
  FiCpu,
  FiBox,
  FiChevronDown,
  FiRefreshCw,
  FiActivity,
  FiCloud,
  FiLayers,
} from "react-icons/fi";

// Flattened skill items directly mapped from content.js with single-color icons
const SKILL_ITEMS = [
  // Languages (Orange, ink text)
  { id: "lang-js", name: "JavaScript (ES6+)", category: "Languages", icon: SiJavascript },
  { id: "lang-java", name: "Java", category: "Languages", icon: FaJava },
  { id: "lang-py", name: "Python", category: "Languages", icon: SiPython },
  { id: "lang-c", name: "C", category: "Languages", icon: SiC },

  // Frontend (Ink, cream text)
  { id: "front-react", name: "React.js", category: "Frontend", icon: SiReact },
  { id: "front-html", name: "HTML5", category: "Frontend", icon: SiHtml5 },
  { id: "front-css", name: "CSS3", category: "Frontend", icon: FaCss3Alt },
  { id: "front-tw", name: "Tailwind CSS", category: "Frontend", icon: SiTailwindcss },

  // Backend (White, ink text, ink border)
  { id: "back-node", name: "Node.js", category: "Backend", icon: SiNodedotjs },
  { id: "back-exp", name: "Express.js", category: "Backend", icon: SiExpress },
  { id: "back-rest", name: "REST APIs", category: "Backend", icon: FiServer },
  { id: "back-jwt", name: "JWT Authentication", category: "Backend", icon: SiJsonwebtokens },

  // Database (Light fill #F8F5EE, ink text, ink border)
  { id: "db-mongo", name: "MongoDB", category: "Database", icon: SiMongodb },
  { id: "db-mongoose", name: "Mongoose", category: "Database", icon: FiDatabase },
  { id: "db-mysql", name: "MySQL", category: "Database", icon: SiMysql },

  // Tools (White, ink text, ink border)
  { id: "tool-git", name: "Git", category: "Tools", icon: SiGit },
  { id: "tool-gh", name: "GitHub", category: "Tools", icon: SiGithub },
  { id: "tool-postman", name: "Postman", category: "Tools", icon: SiPostman },
  { id: "tool-vscode", name: "VS Code", category: "Tools", icon: VscVscode },
  { id: "tool-vercel", name: "Vercel", category: "Tools", icon: SiVercel },
  { id: "tool-atlas", name: "MongoDB Atlas", category: "Tools", icon: SiMongodb },

  // Core CS (Ink, cream text)
  { id: "cs-dsa", name: "Data Structures & Algorithms", category: "Core CS", icon: FiCpu },
  { id: "cs-oops", name: "OOPs", category: "Core CS", icon: FiBox },
];

const CATEGORIES = [
  "All",
  "Languages",
  "Frontend",
  "Backend",
  "Database",
  "Tools",
  "Core CS",
];

// Reusable category color classes for cubes
function getCategoryPillClasses(category) {
  switch (category) {
    case "Languages":
      return "bg-[#F79F15] text-[#1A110A] border-2 border-[#1A110A] shadow-[0_4px_0_#1A110A]";
    case "Frontend":
    case "Core CS":
      return "bg-[#1A110A] text-[#F5F3E7] border-2 border-[#F5F3E7]/25 shadow-[0_4px_0_#000000]";
    case "Database":
      return "bg-[#F8F5EE] text-[#1A110A] border-2 border-[#1A110A] shadow-[0_4px_0_#1A110A]";
    case "Backend":
    case "Tools":
    default:
      return "bg-[#FFFFFF] text-[#1A110A] border-2 border-[#1A110A] shadow-[0_4px_0_#1A110A]";
  }
}

export default function Skills() {
  const lenis = useLenis();
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const containerRef = useRef(null);

  // Total count computed dynamically from content.js
  const totalCount = useMemo(() => {
    return Object.values(skills).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0), 0);
  }, []);

  // Mode detection: Pile vs List
  const [isDesktopFinePointer, setIsDesktopFinePointer] = useState(false);
  const [selectedMode, setSelectedMode] = useState("pile"); // "pile" | "list"
  const [activeCategory, setActiveCategory] = useState("All");
  const [ariaMessage, setAriaMessage] = useState("");

  // Poof rings state for vanishing animations
  const [poofs, setPoofs] = useState([]);

  // Physics simulation state
  const [isZeroG, setIsZeroG] = useState(false);
  const [isBoxShaking, setIsBoxShaking] = useState(false);
  const [hasStartedDrop, setHasStartedDrop] = useState(false);
  const [expandedListIndex, setExpandedListIndex] = useState(0);

  // Computed shown count: "{shown} of {total} technologies"
  const shownCount = useMemo(() => {
    return activeCategory === "All"
      ? totalCount
      : SKILL_ITEMS.filter((item) => item.category === activeCategory).length;
  }, [activeCategory, totalCount]);

  // References to keep physics state out of React render loop
  const matterInstanceRef = useRef(null); // { Engine, World, Bodies, Body, Mouse, MouseConstraint }
  const engineRef = useRef(null);
  const worldRef = useRef(null);
  const mouseConstraintRef = useRef(null);
  const wallsRef = useRef({ floor: null, left: null, right: null, ceiling: null });
  const animFrameRef = useRef(null);
  const isSimulationPausedRef = useRef(false);

  // Single source of truth & atomic reconciliation token / timers
  const actionTokenRef = useRef(0);
  const pendingTimersRef = useRef([]);

  // DOM node references for direct GPU transforms
  const pillElementsRef = useRef(new Map());
  const pillBodiesRef = useRef(new Map()); // id -> Matter body
  const pillDimsRef = useRef(new Map()); // id -> { width, height }

  // Check device capabilities (desktop with fine hover pointer and width >= 1024)
  useEffect(() => {
    const checkCapability = () => {
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const wideEnough = window.innerWidth >= 1024;
      const capable = finePointer && wideEnough && !shouldReduceMotion;
      setIsDesktopFinePointer(capable);
      if (!capable) {
        setSelectedMode("list");
      }
    };

    checkCapability();
    window.addEventListener("resize", checkCapability);
    return () => window.removeEventListener("resize", checkCapability);
  }, [shouldReduceMotion]);

  // Synchronize layout with Lenis & ScrollTrigger after mode change or mount
  useEffect(() => {
    const timer = setTimeout(() => {
      lenis?.resize();
      ScrollTrigger.refresh();
    }, 250);
    return () => clearTimeout(timer);
  }, [selectedMode, lenis]);

  // ----------------------------------------------------------------------
  // MATTER.JS DYNAMIC LOADER & ENGINE INITIALIZER
  // ----------------------------------------------------------------------
  const cleanupPhysics = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    actionTokenRef.current++;
    pendingTimersRef.current.forEach(clearTimeout);
    pendingTimersRef.current = [];

    if (worldRef.current && matterInstanceRef.current) {
      matterInstanceRef.current.World.clear(worldRef.current, false);
    }
    if (engineRef.current && matterInstanceRef.current) {
      matterInstanceRef.current.Engine.clear(engineRef.current);
    }

    pillBodiesRef.current.clear();
    wallsRef.current = { floor: null, left: null, right: null, ceiling: null };
    engineRef.current = null;
    worldRef.current = null;
  }, []);

  // Add / remove ceiling wall
  const addCeiling = useCallback(() => {
    if (!matterInstanceRef.current || !worldRef.current || !containerRef.current) return;
    const { Bodies, World } = matterInstanceRef.current;
    if (wallsRef.current.ceiling) return; // already added

    const width = containerRef.current.clientWidth || 800;
    const wallThickness = 300;
    // Ceiling center at y = -wallThickness / 2 = -150.
    // With thickness 300, it extends from y = -300 to y = 0.
    const ceiling = Bodies.rectangle(
      width / 2,
      -wallThickness / 2,
      width * 3,
      wallThickness,
      {
        isStatic: true,
        friction: 0.1,
        restitution: 0.3,
        label: "ceiling",
      }
    );
    wallsRef.current.ceiling = ceiling;
    World.add(worldRef.current, ceiling);
  }, []);

  const removeCeiling = useCallback(() => {
    if (!matterInstanceRef.current || !worldRef.current) return;
    const { World } = matterInstanceRef.current;
    if (wallsRef.current.ceiling) {
      World.remove(worldRef.current, wallsRef.current.ceiling);
      wallsRef.current.ceiling = null;
    }
  }, []);

  const spawnPillBody = useCallback((item, isAiml = false) => {
    if (!matterInstanceRef.current || !worldRef.current || !containerRef.current) return;
    const { Bodies, World, Body } = matterInstanceRef.current;
    const id = isAiml ? "aiml-special" : item.id;

    // Safety: ensure no duplicate body exists
    if (pillBodiesRef.current.has(id)) {
      World.remove(worldRef.current, pillBodiesRef.current.get(id));
      pillBodiesRef.current.delete(id);
    }

    const containerWidth = containerRef.current.clientWidth || 800;
    const padding = 70;
    const spawnX = padding + Math.random() * Math.max(100, containerWidth - padding * 2);

    // If ceiling is present, spawn inside the box right below the ceiling (y: 35-60)
    // Otherwise spawn above the container box to drop in naturally (y: -80 to -120)
    const hasCeiling = !!wallsRef.current.ceiling;
    const spawnY = hasCeiling ? 35 + Math.random() * 25 : -80 - Math.random() * 40;
    const spawnAngle = (Math.random() - 0.5) * 0.4;

    let body;
    if (isAiml) {
      // 120px circular body with soft restitution and heavier density
      const radius = 60;
      pillDimsRef.current.set(id, { width: 120, height: 120 });
      body = Bodies.circle(spawnX, spawnY, radius, {
        restitution: 0.35,
        friction: 0.12,
        frictionAir: 0.015,
        density: 0.002,
        label: "aiml-special",
      });
    } else {
      // Measured cube dimensions (square 84x84 with chamfered corners)
      const el = pillElementsRef.current.get(id);
      let size = 84;
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 20) size = Math.round(rect.width);
      }
      pillDimsRef.current.set(id, { width: size, height: size });

      body = Bodies.rectangle(spawnX, spawnY, size, size, {
        chamfer: { radius: 14 },
        restitution: 0.35,
        friction: 0.12,
        frictionAir: 0.015,
        density: 0.0012,
        label: id,
      });
    }

    Body.setAngle(body, spawnAngle);
    Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 2,
      y: hasCeiling ? 2 + Math.random() * 2 : 1 + Math.random() * 2,
    });

    pillBodiesRef.current.set(id, body);
    World.add(worldRef.current, body);

    // Make DOM element active and visible for simulation
    const domEl = pillElementsRef.current.get(id);
    if (domEl) {
      domEl.style.display = "block";
      domEl.style.opacity = "1";
      domEl.style.visibility = "visible";
      domEl.style.pointerEvents = "auto";
    }
  }, []);

  const startDropSequence = useCallback(() => {
    if (!matterInstanceRef.current || !worldRef.current) return;
    const token = ++actionTokenRef.current;
    pendingTimersRef.current.forEach(clearTimeout);
    pendingTimersRef.current = [];

    // Remove ceiling wall so pills drop in freely from above
    removeCeiling();

    // Clear existing bodies
    pillBodiesRef.current.forEach((body) => {
      matterInstanceRef.current.World.remove(worldRef.current, body);
    });
    pillBodiesRef.current.clear();

    // Reset pill styles before drop
    pillElementsRef.current.forEach((el) => {
      if (el) {
        el.style.display = "block";
        el.style.opacity = "0";
        el.style.visibility = "visible";
        el.style.transform = "translate3d(-9999px, -9999px, 0)";
        const inner = el.firstElementChild;
        if (inner) {
          inner.classList.remove("scale-0", "opacity-0", "pointer-events-none");
          inner.classList.add("scale-100", "opacity-100");
        }
      }
    });

    // Drop items one by one (~60ms apart)
    SKILL_ITEMS.forEach((item, index) => {
      const timer = setTimeout(() => {
        if (actionTokenRef.current === token) {
          spawnPillBody(item, false);
        }
      }, index * 60);
      pendingTimersRef.current.push(timer);
    });

    // Drop the AI/ML special circle midway for natural organic pile integration
    const aimlTimer = setTimeout(() => {
      if (actionTokenRef.current === token) {
        spawnPillBody(null, true);
      }
    }, Math.floor(SKILL_ITEMS.length / 2) * 60);
    pendingTimersRef.current.push(aimlTimer);

    // Add static ceiling once initial drop finishes (~1800ms)
    const ceilingTimer = setTimeout(() => {
      if (actionTokenRef.current === token) {
        addCeiling();
      }
    }, 1800);
    pendingTimersRef.current.push(ceilingTimer);

    setHasStartedDrop(true);
  }, [spawnPillBody, addCeiling, removeCeiling]);

  const initPhysics = useCallback(async () => {
    if (!containerRef.current || selectedMode !== "pile") return;
    cleanupPhysics();

    // Dynamically import Matter.js only when pile mode initializes
    const Matter = await import("matter-js");
    const { Engine, World, Bodies, Mouse, MouseConstraint } = Matter.default || Matter;
    matterInstanceRef.current = { Engine, World, Bodies, Body: Matter.Body || Matter.default?.Body, Mouse, MouseConstraint, Events: Matter.Events || Matter.default?.Events };

    const engine = Engine.create({
      enableSleeping: true,
      gravity: { x: 0, y: isZeroG ? 0 : 1, scale: 0.001 },
    });
    engineRef.current = engine;
    worldRef.current = engine.world;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 520;
    // Thick walls (300px) so fast pills cannot tunnel through
    const wallThickness = 300;

    // Static walls: Floor, Left, Right (no ceiling initially so pills drop in)
    const floor = Bodies.rectangle(
      width / 2,
      height + wallThickness / 2,
      width * 3,
      wallThickness,
      { isStatic: true, friction: 0.3, label: "floor" }
    );
    const leftWall = Bodies.rectangle(
      -wallThickness / 2,
      height / 2,
      wallThickness,
      height * 4,
      { isStatic: true, friction: 0.1, label: "leftWall" }
    );
    const rightWall = Bodies.rectangle(
      width + wallThickness / 2,
      height / 2,
      wallThickness,
      height * 4,
      { isStatic: true, friction: 0.1, label: "rightWall" }
    );

    wallsRef.current = { floor, left: leftWall, right: rightWall, ceiling: null };
    World.add(worldRef.current, [floor, leftWall, rightWall]);

    // Setup Mouse and MouseConstraint for grabbing, dragging and throwing pills
    const mouse = Mouse.create(containerRef.current);

    // CRITICAL: Matter attaches mousewheel and DOMMouseScroll listeners that call preventDefault.
    // Removing them ensures native smooth page scrolling is never blocked when cursor is over the box.
    if (mouse.element) {
      mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
      mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);
    }

    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.25,
        render: { visible: false },
      },
    });
    mouseConstraintRef.current = mouseConstraint;
    World.add(worldRef.current, mouseConstraint);

    // Bring dragged pill to front on drag
    if (matterInstanceRef.current.Events) {
      matterInstanceRef.current.Events.on(mouseConstraint, "startdrag", (event) => {
        const body = event.body;
        if (body && body.label) {
          const el = pillElementsRef.current.get(body.label);
          if (el) el.style.zIndex = "50";
        }
      });
      matterInstanceRef.current.Events.on(mouseConstraint, "enddrag", (event) => {
        const body = event.body;
        if (body && body.label) {
          const el = pillElementsRef.current.get(body.label);
          if (el) el.style.zIndex = "10";
        }
      });
    }

    // Single requestAnimationFrame loop: directly drives transforms without React state updates
    let lastTime = performance.now();
    const MAX_SPEED = 18;

    const runner = (now) => {
      if (!isSimulationPausedRef.current && engineRef.current && containerRef.current) {
        const delta = Math.min(now - lastTime, 33.3);
        lastTime = now;
        Engine.update(engineRef.current, delta);

        const currentWidth = containerRef.current.clientWidth || 800;
        const currentHeight = containerRef.current.clientHeight || 520;
        const minX = 25;
        const maxX = Math.max(minX, currentWidth - 25);
        const minY = 25;
        const maxY = Math.max(minY, currentHeight - 25);
        const hasCeiling = !!wallsRef.current.ceiling;

        // Update DOM transform for each active body + clamp velocity + handle bounds/NaN
        pillBodiesRef.current.forEach((body, id) => {
          if (!body) return;

          // 1. Clamp velocity to prevent high-speed tunneling
          const vx = body.velocity.x;
          const vy = body.velocity.y;
          const speed = Math.hypot(vx, vy);
          if (speed > MAX_SPEED) {
            const scale = MAX_SPEED / speed;
            matterInstanceRef.current.Body.setVelocity(body, {
              x: vx * scale,
              y: vy * scale,
            });
          }

          // 2. NaN or out-of-bounds check: safely reposition back inside the box
          let posX = body.position.x;
          let posY = body.position.y;
          let needsReposition = false;

          if (isNaN(posX) || isNaN(posY)) {
            posX = currentWidth / 2 + (Math.random() - 0.5) * 40;
            posY = currentHeight / 2 + (Math.random() - 0.5) * 40;
            needsReposition = true;
          } else {
            const isOutside =
              posX < -30 ||
              posX > currentWidth + 30 ||
              (hasCeiling && posY < -20) ||
              posY > currentHeight + 40;

            if (isOutside) {
              posX = Math.max(minX, Math.min(maxX, posX));
              posY = Math.max(minY, Math.min(maxY, posY));
              needsReposition = true;
            }
          }

          if (needsReposition) {
            matterInstanceRef.current.Body.setPosition(body, { x: posX, y: posY });
            matterInstanceRef.current.Body.setVelocity(body, { x: 0, y: 0 });
          }

          // 3. Directly update DOM transform
          const domEl = pillElementsRef.current.get(id);
          const dims = pillDimsRef.current.get(id);
          if (domEl && dims) {
            const x = body.position.x - dims.width / 2;
            const y = body.position.y - dims.height / 2;
            const angle = body.angle;
            domEl.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}rad)`;
          }
        });
      }
      animFrameRef.current = requestAnimationFrame(runner);
    };
    animFrameRef.current = requestAnimationFrame(runner);

    // Begin drop sequence
    startDropSequence();
  }, [selectedMode, isZeroG, cleanupPhysics, startDropSequence]);

  // Trigger drop when section reaches 35% in view
  useEffect(() => {
    if (selectedMode !== "pile") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting && entry.intersectionRatio >= 0.35;
        isSimulationPausedRef.current = !entry.isIntersecting;

        if (inView && !hasStartedDrop) {
          initPhysics();
        }
      },
      { threshold: [0, 0.35] }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [selectedMode, hasStartedDrop, initPhysics]);

  // Pause simulation when browser tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      isSimulationPausedRef.current = document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Debounced window resize: rebuild static walls and bounds
  useEffect(() => {
    if (selectedMode !== "pile") return;

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!containerRef.current || !engineRef.current || !matterInstanceRef.current) return;
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        const wallThickness = 300;
        const { Body } = matterInstanceRef.current;

        if (wallsRef.current.floor) {
          Body.setPosition(wallsRef.current.floor, {
            x: width / 2,
            y: height + wallThickness / 2,
          });
        }
        if (wallsRef.current.left) {
          Body.setPosition(wallsRef.current.left, {
            x: -wallThickness / 2,
            y: height / 2,
          });
        }
        if (wallsRef.current.right) {
          Body.setPosition(wallsRef.current.right, {
            x: width + wallThickness / 2,
            y: height / 2,
          });
        }
        if (wallsRef.current.ceiling) {
          Body.setPosition(wallsRef.current.ceiling, {
            x: width / 2,
            y: -wallThickness / 2,
          });
        }
      }, 250);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [selectedMode]);

  // Clean up on unmount or mode switch
  useEffect(() => {
    return () => cleanupPhysics();
  }, [cleanupPhysics]);

  // ----------------------------------------------------------------------
  // ATOMIC RECONCILIATION FUNCTION (SINGLE SOURCE OF TRUTH)
  // ----------------------------------------------------------------------
  const reconcileVisibleSet = useCallback((category) => {
    const token = ++actionTokenRef.current;

    // 1. Cancel in-flight vanish/appear/drop animations immediately
    pendingTimersRef.current.forEach(clearTimeout);
    pendingTimersRef.current = [];

    // 2. Update active category state & announce aria-live
    setActiveCategory(category);
    if (category === "All") {
      setAriaMessage(`Showing all ${totalCount} technologies`);
    } else {
      const count = SKILL_ITEMS.filter((s) => s.category === category).length;
      setAriaMessage(`Showing ${count} ${category.toLowerCase()} skills`);
    }

    if (selectedMode !== "pile" || !matterInstanceRef.current || !worldRef.current) return;
    const { Body, World } = matterInstanceRef.current;

    // 3. Single source of truth: compute exact set of IDs that should be visible
    const targetVisibleIds = new Set();
    if (category === "All") {
      SKILL_ITEMS.forEach((item) => targetVisibleIds.add(item.id));
      targetVisibleIds.add("aiml-special");
    } else {
      SKILL_ITEMS.filter((item) => item.category === category).forEach((item) => {
        targetVisibleIds.add(item.id);
      });
    }

    const allItemsWithAiml = [
      ...SKILL_ITEMS.map((item) => ({ ...item, isAiml: false })),
      { id: "aiml-special", isAiml: true },
    ];

    const newPoofs = [];
    let dropStagger = 0;
    let vanishStagger = 0;

    allItemsWithAiml.forEach((item) => {
      const shouldBeVisible = targetVisibleIds.has(item.id);
      const body = pillBodiesRef.current.get(item.id);
      const domEl = pillElementsRef.current.get(item.id);
      const innerEl = domEl?.firstElementChild;

      if (shouldBeVisible) {
        // --- PILL SHOULD BE VISIBLE ---
        if (domEl) {
          domEl.style.display = "block";
          domEl.style.opacity = "1";
          domEl.style.visibility = "visible";
          domEl.style.pointerEvents = "auto";
        }
        if (innerEl) {
          innerEl.classList.remove("scale-0", "opacity-0", "pointer-events-none");
          innerEl.classList.add("scale-100", "opacity-100");
        }

        if (body) {
          // Body already present in simulation: hop once and keep physics
          Body.applyForce(body, body.position, {
            x: (Math.random() - 0.5) * 0.015 * body.mass,
            y: -0.045 * body.mass,
          });
          Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.1);
        } else {
          // Body was previously removed: re-add it into simulation
          const currentDropIndex = dropStagger++;
          const timer = setTimeout(() => {
            if (actionTokenRef.current !== token) return; // Cancelled if newer click occurred
            spawnPillBody(item.isAiml ? null : item, item.isAiml);
          }, currentDropIndex * 35);
          pendingTimersRef.current.push(timer);
        }
      } else {
        // --- PILL SHOULD BE HIDDEN ---
        if (body) {
          // Emit orange poof ring at current body position
          newPoofs.push({
            id: `${item.id}-${Date.now()}-${Math.random()}`,
            x: body.position.x,
            y: body.position.y,
            size: item.isAiml ? 120 : 84,
          });

          // Trigger scale down and fade out on inner DOM
          if (innerEl) {
            innerEl.classList.remove("scale-100", "opacity-100");
            innerEl.classList.add("scale-0", "opacity-0", "pointer-events-none");
          }

          // Schedule body removal and hide DOM after vanish transition
          const currentVanishIndex = vanishStagger++;
          const timer = setTimeout(() => {
            if (actionTokenRef.current !== token) return; // Cancelled if category was restored
            const currentBody = pillBodiesRef.current.get(item.id);
            if (currentBody && worldRef.current) {
              World.remove(worldRef.current, currentBody);
              pillBodiesRef.current.delete(item.id);
            }
            if (domEl) {
              domEl.style.display = "none";
              domEl.style.opacity = "0";
              domEl.style.visibility = "hidden";
              domEl.style.pointerEvents = "none";
            }
          }, 360 + currentVanishIndex * 15);
          pendingTimersRef.current.push(timer);
        } else {
          // Body already absent, ensure DOM is hidden
          if (domEl) {
            domEl.style.display = "none";
            domEl.style.opacity = "0";
            domEl.style.visibility = "hidden";
            domEl.style.pointerEvents = "none";
          }
          if (innerEl) {
            innerEl.classList.remove("scale-100", "opacity-100");
            innerEl.classList.add("scale-0", "opacity-0", "pointer-events-none");
          }
        }
      }
    });

    // Clean up poofs after animation
    if (newPoofs.length > 0) {
      setPoofs((prev) => [...prev, ...newPoofs]);
      const poofTimer = setTimeout(() => {
        const ids = new Set(newPoofs.map((p) => p.id));
        setPoofs((prev) => prev.filter((p) => !ids.has(p.id)));
      }, 450);
      pendingTimersRef.current.push(poofTimer);
    }
  }, [selectedMode, spawnPillBody, totalCount]);

  // ----------------------------------------------------------------------
  // CONTROLS HANDLERS
  // ----------------------------------------------------------------------

  // Category selection handler uses single atomic reconciler
  const handleSelectCategory = (category) => {
    reconcileVisibleSet(category);
  };

  // "Shake": random impulses to all pills + container box shake
  const handleShake = () => {
    setIsBoxShaking(true);
    setTimeout(() => setIsBoxShaking(false), 500);

    if (!matterInstanceRef.current) return;
    const { Body } = matterInstanceRef.current;

    // Ensure ceiling is present so pills don't fly out the top
    addCeiling();

    pillBodiesRef.current.forEach((body) => {
      Body.applyForce(body, body.position, {
        x: (Math.random() - 0.5) * 0.04 * body.mass,
        y: -(0.02 + Math.random() * 0.035) * body.mass,
      });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.18);
    });
  };

  // "Zero gravity": toggle floating drift with ceiling protection
  const handleToggleZeroG = () => {
    if (!matterInstanceRef.current || !engineRef.current) return;
    const { Body } = matterInstanceRef.current;
    const nextZeroG = !isZeroG;
    setIsZeroG(nextZeroG);

    // Make sure ceiling wall is present
    addCeiling();

    if (nextZeroG) {
      engineRef.current.gravity.y = 0;
      engineRef.current.gravity.scale = 0;

      // Impart gentle floating velocity
      pillBodiesRef.current.forEach((body) => {
        Body.setVelocity(body, {
          x: (Math.random() - 0.5) * 2.8,
          y: (Math.random() - 0.5) * 2.8,
        });
      });
    } else {
      // Restore normal gravity
      engineRef.current.gravity.y = 1;
      engineRef.current.gravity.scale = 0.001;
    }
  };

  // "Drop again": resets and replays physics drop
  const handleDropAgain = () => {
    setIsZeroG(false);
    if (engineRef.current) {
      engineRef.current.gravity.y = 1;
      engineRef.current.gravity.scale = 0.001;
    }
    removeCeiling();
    setActiveCategory("All");
    setAriaMessage(`Showing all ${totalCount} technologies`);
    startDropSequence();
  };

  // Switch between Pile and List modes
  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    if (mode === "pile") {
      setHasStartedDrop(false);
      setTimeout(initPhysics, 100);
    } else {
      cleanupPhysics();
    }
  };

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative w-full flex flex-col px-6 pt-14 pb-10 max-w-6xl mx-auto overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className="absolute top-1/4 -right-36 w-96 h-96 bg-[#F79F15]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Screen-reader aria-live status announcement */}
      <div role="status" aria-live="polite" className="sr-only">
        {ariaMessage}
      </div>

      {/* ======================================================== */}
      {/* SECTION HEADER                                           */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="flex flex-col gap-2">
          <div className="section-label">// 02. SKILLS</div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading tracking-tight text-[#1A110A] leading-tight">
            Skills that build <span className="accent-word">possibilities</span>.
          </h2>
          <p className="text-xs sm:text-sm font-mono text-[#6F6B60] uppercase tracking-wider mt-1">
            {shownCount} of {totalCount} technologies
          </p>
        </div>

        {/* Mode Toggle (Pile | List) - Available on Desktop */}
        {isDesktopFinePointer && (
          <div
            role="group"
            aria-label="Skills view mode"
            className="inline-flex items-center p-1 rounded-full bg-[#FFFFFF] border border-[#1A110A]/15 shadow-sm self-start md:self-auto"
          >
            <button
              type="button"
              onClick={() => handleModeChange("pile")}
              aria-pressed={selectedMode === "pile"}
              className={`px-4 py-2 min-h-[44px] rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#1A110A] focus-visible:outline-offset-2 ${
                selectedMode === "pile"
                  ? "bg-[#1A110A] text-[#F5F3E7] shadow-sm"
                  : "text-[#6F6B60] hover:text-[#1A110A]"
              }`}
            >
              <FiLayers className="text-sm" />
              <span>Pile</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("list")}
              aria-pressed={selectedMode === "list"}
              className={`px-4 py-2 min-h-[44px] rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#1A110A] focus-visible:outline-offset-2 ${
                selectedMode === "list"
                  ? "bg-[#1A110A] text-[#F5F3E7] shadow-sm"
                  : "text-[#6F6B60] hover:text-[#1A110A]"
              }`}
            >
              <FiActivity className="text-sm" />
              <span>List</span>
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 1. PILE MODE (Physics simulation with Matter.js)         */}
      {/* ======================================================== */}
      {selectedMode === "pile" && (
        <div className="flex flex-col gap-5 w-full">
          {/* Controls Bar above the box */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-2">
            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    aria-pressed={isActive}
                    className={`px-3.5 py-2 min-h-[44px] rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm focus-visible:outline-2 focus-visible:outline-[#1A110A] focus-visible:outline-offset-2 ${
                      isActive
                        ? "bg-[#1A110A] text-[#F5F3E7]"
                        : "bg-[#FFFFFF] text-[#1A110A] border border-[#1A110A]/15 hover:border-[#F79F15]"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Action Buttons: Shake, Zero G, Drop Again */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Shake Button */}
              <button
                type="button"
                onClick={handleShake}
                aria-label="Shake skills container"
                className="px-4 py-2 min-h-[44px] rounded-full font-mono text-xs font-bold uppercase tracking-wider bg-[#FFFFFF] text-[#1A110A] border border-[#1A110A]/15 hover:border-[#F79F15] transition-all cursor-pointer shadow-sm flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#1A110A] focus-visible:outline-offset-2"
              >
                <FiActivity className="text-sm text-[#F79F15]" />
                <span>Shake</span>
              </button>

              {/* Zero Gravity Button */}
              <button
                type="button"
                onClick={handleToggleZeroG}
                aria-pressed={isZeroG}
                aria-label="Toggle zero gravity"
                className={`px-4 py-2 min-h-[44px] rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#1A110A] focus-visible:outline-offset-2 ${
                  isZeroG
                    ? "bg-[#F79F15] text-[#1A110A] border border-[#1A110A]/20"
                    : "bg-[#FFFFFF] text-[#1A110A] border border-[#1A110A]/15 hover:border-[#F79F15]"
                }`}
              >
                <FiCloud className="text-sm" />
                <span>{isZeroG ? "Gravity: Off" : "Zero Gravity"}</span>
              </button>

              {/* Drop Again Button */}
              <button
                type="button"
                onClick={handleDropAgain}
                aria-label="Replay cube drop sequence"
                className="px-4 py-2 min-h-[44px] rounded-full font-mono text-xs font-bold uppercase tracking-wider bg-[#FFFFFF] text-[#1A110A] border border-[#1A110A]/15 hover:border-[#F79F15] transition-all cursor-pointer shadow-sm flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#1A110A] focus-visible:outline-offset-2"
              >
                <FiRefreshCw className="text-sm" />
                <span>Drop Again</span>
              </button>
            </div>
          </div>

          {/* Physics Container Box */}
          <div
            ref={containerRef}
            aria-hidden="true"
            className={`relative w-full rounded-[32px] border border-[#1A110A]/20 bg-[#F8F5EE] shadow-[inset_0_2px_12px_rgba(26,17,10,0.04)] h-[clamp(460px,62vh,580px)] overflow-hidden select-none touch-none ${
              isBoxShaking ? "animate-[shake_0.45s_ease-in-out]" : ""
            }`}
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(26, 17, 10, 0.12) 1.5px, transparent 1.5px)",
              backgroundSize: "20px 20px",
            }}
          >
            {/* Grab hint indicator */}
            <div className="absolute top-4 left-6 pointer-events-none select-none z-0">
              <span className="font-mono text-[11px] text-[#6F6B60]/60 uppercase tracking-widest">
                // Grab, throw & stack skill cubes
              </span>
            </div>

            {/* Orange Poof Rings on Vanishing Cubes */}
            {poofs.map((poof) => (
              <span
                key={poof.id}
                className="absolute pointer-events-none rounded-full border-2 border-[#F79F15] z-30"
                style={{
                  left: poof.x,
                  top: poof.y,
                  width: poof.size,
                  height: poof.size,
                  animation: "poof-ring 0.4s ease-out forwards",
                }}
              />
            ))}

            {/* DOM Cubes: Transformed by Matter.js animation loop */}
            {SKILL_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = activeCategory === "All" || item.category === activeCategory;
              const baseStyles = getCategoryPillClasses(item.category);

              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    if (el) {
                      pillElementsRef.current.set(item.id, el);
                      if (!pillBodiesRef.current.has(item.id)) {
                        el.style.display = "none";
                      }
                    } else {
                      pillElementsRef.current.delete(item.id);
                    }
                  }}
                  className="absolute top-0 left-0 select-none will-change-transform z-10"
                >
                  <div
                    className={`w-[84px] h-[84px] rounded-2xl p-2 flex flex-col items-center justify-center text-center cursor-grab active:cursor-grabbing transition-all duration-[380ms] ease-out ${baseStyles} ${
                      isSelected
                        ? "scale-100 opacity-100"
                        : "scale-0 opacity-0 pointer-events-none"
                    } ${
                      activeCategory !== "All" && isSelected
                        ? "ring-2 ring-[#F79F15] ring-offset-2 ring-offset-[#F8F5EE]"
                        : ""
                    }`}
                  >
                    <Icon className="text-2xl sm:text-[26px] mb-1 shrink-0" />
                    <span className="font-body font-bold text-[10px] sm:text-[10.5px] leading-[1.15] text-center line-clamp-2 px-0.5 break-words select-none">
                      {item.name}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* AI/ML Special Circle: Vanishes on specific category filter, returns on "All" */}
            <div
              ref={(el) => {
                if (el) {
                  pillElementsRef.current.set("aiml-special", el);
                  if (!pillBodiesRef.current.has("aiml-special")) {
                    el.style.display = "none";
                  }
                } else {
                  pillElementsRef.current.delete("aiml-special");
                }
              }}
              className="absolute top-0 left-0 select-none will-change-transform z-20"
            >
              <div
                className={`w-[120px] h-[120px] rounded-full bg-[#F79F15] text-[#1A110A] border-2 border-[#1A110A]/20 shadow-lg flex flex-col items-center justify-center select-none cursor-grab active:cursor-grabbing transition-all duration-[380ms] ease-out ${
                  activeCategory === "All"
                    ? "scale-100 opacity-100"
                    : "scale-0 opacity-0 pointer-events-none"
                }`}
              >
                {/* Soft pulsing ring */}
                <span className="absolute inset-0 rounded-full border-2 border-[#F79F15] animate-ping opacity-30 pointer-events-none" />

                <span className="font-heading font-black text-xl tracking-tight leading-none">
                  AI / ML
                </span>
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#1A110A]/80 text-center leading-tight mt-1 max-w-[90px]">
                  currently exploring
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. LIST MODE (Clean accordion list of categories & chips)*/}
      {/* ======================================================== */}
      {selectedMode === "list" && (
        <div className="flex flex-col gap-4 w-full">
          {CATEGORIES.filter((c) => c !== "All").map((categoryName, idx) => {
            const isExpanded = expandedListIndex === idx;
            const categorySkills = SKILL_ITEMS.filter((s) => s.category === categoryName);
            const numStr = String(idx + 1).padStart(2, "0");

            return (
              <div
                key={categoryName}
                className={`rounded-[28px] border transition-all duration-300 shadow-sm overflow-hidden ${
                  isExpanded
                    ? "bg-[#1A110A] text-[#F5F3E7] border-[#1A110A]"
                    : "bg-[#FFFFFF] text-[#1A110A] border-[#1A110A]/10 hover:border-[#F79F15]"
                }`}
              >
                {/* Header row (button for full keyboard & tap access) */}
                <button
                  type="button"
                  onClick={() => setExpandedListIndex(isExpanded ? -1 : idx)}
                  aria-expanded={isExpanded}
                  className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1A110A] focus-visible:outline-offset-2"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`font-mono text-xs font-semibold ${
                        isExpanded ? "text-[#F79F15]" : "text-[#9F9B90]"
                      }`}
                    >
                      {numStr}
                    </span>
                    <span className="font-heading font-bold text-lg sm:text-xl">
                      {categoryName}
                    </span>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                        isExpanded ? "bg-white/10 text-[#F5F3E7]" : "bg-[#F8F5EE] text-[#6F6B60]"
                      }`}
                    >
                      {categorySkills.length}
                    </span>
                  </div>

                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform duration-300 ${
                      isExpanded
                        ? "bg-[#F79F15] text-[#1A110A] rotate-180"
                        : "bg-[#F8F5EE] text-[#1A110A]"
                    }`}
                  >
                    <FiChevronDown className="text-base" />
                  </div>
                </button>

                {/* Expanded chips container */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-5 sm:px-6 pb-6 pt-1 border-t border-white/10"
                    >
                      <div className="flex flex-wrap gap-2.5 pt-3">
                        {categorySkills.map((skill) => {
                          const Icon = skill.icon;
                          return (
                            <div
                              key={skill.id}
                              className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-full bg-white/10 border border-white/15 text-[#F5F3E7] hover:border-[#F79F15] transition-colors shadow-sm"
                            >
                              <Icon className="text-base shrink-0 text-[#F79F15]" />
                              <span className="font-body text-xs sm:text-sm font-semibold">
                                {skill.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* AI/ML Exploring Card in List Mode */}
          <div className="rounded-[28px] bg-[#F79F15] text-[#1A110A] p-5 sm:p-6 border border-[#1A110A]/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#1A110A]/80">
                // Continuous Learning
              </span>
              <h3 className="font-heading font-black text-xl sm:text-2xl tracking-tight">
                Currently exploring: AI / Machine Learning
              </h3>
              <p className="font-body text-xs sm:text-sm text-[#1A110A]/80 mt-1 max-w-xl">
                {personalInfo.currentlyLearning}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#1A110A] text-[#F79F15] flex items-center justify-center shrink-0 shadow-sm">
              <FiActivity className="text-lg" />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. VISUALLY HIDDEN LIST (Strictly for Screen Readers)    */}
      {/* ======================================================== */}
      <div className="sr-only">
        <h3>Comprehensive Technologies and Skills List</h3>
        {CATEGORIES.filter((c) => c !== "All").map((categoryName) => (
          <div key={categoryName}>
            <h4>{categoryName}</h4>
            <ul>
              {SKILL_ITEMS.filter((s) => s.category === categoryName).map((skill) => (
                <li key={skill.id}>{skill.name}</li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h4>Continuous Learning</h4>
          <p>{personalInfo.currentlyLearning}</p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. PHILOSOPHY PULL-QUOTE (Preserved below section)       */}
      {/* ======================================================== */}
      <div className="mt-10 w-full">
        <PullQuote />
      </div>
    </section>
  );
}
