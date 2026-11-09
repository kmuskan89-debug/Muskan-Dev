import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Portfolio from "./pages/Portfolio";

// Lazy-load private admin panel code so it is completely excluded from public main bundle
const Admin = lazy(() => import("./pages/Admin"));

export default function App() {
  return (
    <Routes>
      {/* 1. Public Portfolio View (Eager) */}
      <Route path="/" element={<Portfolio />} />

      {/* 2. Private Admin Console (Lazy Loaded) */}
      <Route
        path="/admin"
        element={
          <Suspense
            fallback={
              <div className="min-h-screen bg-[#F5F3E7] flex flex-col items-center justify-center gap-4 text-[#1A110A] font-mono">
                <div className="w-9 h-9 rounded-full border-2 border-[#9F9B90]/30 border-t-[#F79F15] animate-spin" />
                <span className="text-xs tracking-wider uppercase">// Initializing Admin Console...</span>
              </div>
            }
          >
            <Admin />
          </Suspense>
        }
      />

      {/* 3. Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
