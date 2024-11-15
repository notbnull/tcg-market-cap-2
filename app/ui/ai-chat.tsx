"use client";

import { useChat } from "ai/react";

export default function AIChatComponent() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="rounded-2xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50/50 p-8 shadow-xl backdrop-blur-xl max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-8 text-zinc-800 flex items-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
        <span className="mr-3">✨</span>
        AI Assistant
      </h2>

      <div className="h-[500px] overflow-y-auto mb-8 space-y-6 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent pr-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-2xl backdrop-blur-sm animate-fade-in ${
              message.role === "assistant"
                ? "bg-white/80 mr-12 shadow-sm border border-zinc-100"
                : "bg-gradient-to-r from-blue-600 to-purple-600 ml-12 text-white shadow-lg"
            }`}
          >
            <p
              className={`text-sm leading-relaxed ${
                message.role === "assistant" ? "text-zinc-700" : "text-white"
              }`}
            >
              {message.content}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask me anything..."
          className="flex-1 rounded-xl border border-zinc-200 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm placeholder:text-zinc-400"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Send
        </button>
      </form>
    </div>
  );
}
