import React from "react";
import { motion } from "framer-motion";

export default function TaglineStrip() {
  const words = [
    { text: "Ideas", color: "#1A110A" },
    { text: "Code", color: "#F79F15" },
    { text: "Impact", color: "#1A110A" },
  ];

  return (
    <div className="w-full py-16 flex items-center justify-center select-none relative overflow-hidden">
      {/* Background soft ambient glow */}
      <div className="absolute w-72 h-20 bg-[#F79F15]/5 rounded-full blur-[70px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.6 }}
        className="bg-[#FFFFFF] rounded-full px-6 sm:px-10 py-3.5 flex items-center gap-3 sm:gap-6 border border-[#9F9B90]/30 shadow-md"
      >
        {words.map((item, idx) => (
          <React.Fragment key={idx}>
            <span
              className="text-base sm:text-xl md:text-2xl font-bold font-heading tracking-wider"
              style={{ color: item.color }}
            >
              {item.text}
            </span>

            {idx < words.length - 1 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#F79F15] shadow-sm animate-pulse" />
            )}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}

