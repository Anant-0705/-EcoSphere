"use client"

import { useChat } from '@ai-sdk/react'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const { messages, sendMessage, status, error } = useChat()
  const isLoading = status === 'submitted' || status === 'streaming'
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed || isLoading) return
    sendMessage({ content: trimmed })
    setInputValue('')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 flex h-[500px] w-[350px] sm:w-[400px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3 bg-emerald-600 p-4 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white">ESG Advisor</h3>
              <p className="text-xs text-emerald-100">Powered by AI</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-sm text-gray-500 mt-10">
                Hi! Ask me about compliance issues, carbon emissions, or department ESG scores.
              </div>
            )}

            {messages.map(m => (
              <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50">
                    <Bot className="h-5 w-5" />
                  </div>
                )}

                <div className={`rounded-2xl px-4 py-2 max-w-[80%] text-sm ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                }`}>
                  {m.parts?.map((part, i) =>
                    part.type === 'text' ? <span key={i}>{part.text}</span> : null
                  ) ?? m.content}
                </div>

                {m.role === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="rounded-2xl bg-gray-100 px-4 py-3 dark:bg-gray-800">
                  <span className="flex gap-1 items-center">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.2s' }}></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.4s' }}></span>
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-900/20">
                Error: {error.message}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about ESG..."
                disabled={isLoading}
                className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                <Send className="h-4 w-4 ml-0.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
