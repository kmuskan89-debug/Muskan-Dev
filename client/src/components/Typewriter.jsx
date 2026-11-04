import React, { useState, useEffect } from "react";
import { useReducedMotion } from "framer-motion";

export default function Typewriter({
  words = ["MERN Stack Developer", "DSA Enthusiast", "AI/ML Learner"],
  typingSpeed = 90,
  deletingSpeed = 45,
  pauseDuration = 1800,
}) {
  const shouldReduceMotion = useReducedMotion();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) {
      setCurrentText(words[0]);
      return;
    }

    const currentWord = words[currentWordIndex];
    let timeout;

    if (!isDeleting && currentText === currentWord) {
      // Pause before deleting
      timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
    } else if (isDeleting && currentText === "") {
      // Move to next word
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    } else {
      // Typing or deleting characters
      const speed = isDeleting ? deletingSpeed : typingSpeed;
      timeout = setTimeout(() => {
        const nextText = isDeleting
          ? currentWord.substring(0, currentText.length - 1)
          : currentWord.substring(0, currentText.length + 1);
        setCurrentText(nextText);
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex, words, typingSpeed, deletingSpeed, pauseDuration, shouldReduceMotion]);

  return (
    <span className="inline-flex items-center text-[#5EEAD4] font-mono font-medium">
      <span>{currentText}</span>
      <span className="ml-1 w-2 h-5 bg-[#4DA3FF] animate-pulse inline-block" />
    </span>
  );
}

