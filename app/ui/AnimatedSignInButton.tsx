"use client";

import { useState } from "react";
import { SignInButton } from "@clerk/nextjs";

export default function AnimatedSignInButton() {
  const [isAnimating, setIsAnimating] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <SignInButton mode="modal">
        <button
          className={`group relative rounded-lg px-8 py-4 text-lg font-medium text-white overflow-hidden bg-slate-900 hover:bg-slate-800 ${
            isAnimating ? "animate-active" : ""
          }`}
          onClick={() => setIsAnimating(true)}
        >
          <div
            className={`fixed inset-0 -z-10 transition-opacity duration-300 ${
              isAnimating ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <div className="absolute inset-0 bg-slate-900">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] 
                from-transparent via-violet-500/10 to-transparent blur-sm"
                  style={{
                    animation: `tunnel 2.8s linear infinite`,
                    animationDelay: `${i * 0.28}s`,
                    transform: `scale(${i * 0.28})`,
                    opacity: 0,
                    borderRadius: "50%",
                  }}
                />
              ))}
            </div>
          </div>
          <span className="relative z-10 transition-colors duration-300">
            Enter
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-[120%] w-[120%] rotate-45 bg-gradient-to-r from-violet-600/50 to-indigo-600/50 blur-lg group-hover:scale-150 transition-transform duration-300" />
          </div>
        </button>
      </SignInButton>
    </main>
  );
}
