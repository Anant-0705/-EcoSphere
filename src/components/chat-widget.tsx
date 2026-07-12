"use client"

import { useChat } from '@ai-sdk/react'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Trash2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const { messages, sendMessage, status, error, setMessages } = useChat()
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
    setInputValue('')
    sendMessage({ text: trimmed })
  }

  // Extract readable text from a message
  const getMessageText = (m: any): string => {
    if (Array.isArray(m.parts)) {
      return m.parts
        .filter((p: any) => p.type === 'text')
        .map((p: any) => p.text)
        .join('')
    }
    return m.content || ''
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
        <div className="absolute bottom-20 right-0 flex h-[520px] w-[360px] sm:w-[420px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
          
          {/* Header */}
          <div className="flex items-center justify-between bg-emerald-600 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">ESG Advisor</h3>
                <p className="text-xs text-emerald-100">
                  {isLoading ? 'Thinking...' : 'Powered by Groq · Llama 3.3'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setMessages([])}
              title="Clear chat"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                  <Bot className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">ESG AI Advisor</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[280px]">
                  Ask me about department scores, compliance issues, or carbon emissions. I have live data!
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {['What are our ESG scores?', 'Any compliance issues?', 'Show carbon emissions'].map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage({ text: q })}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => {
              const text = getMessageText(m)
              if (!text && m.role === 'assistant') return null
              return (
                <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50">
                      <Bot className="h-5 w-5" />
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-2.5 max-w-[82%] text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                  }`}>
                    {m.role === 'user' ? (
                      <span className="whitespace-pre-wrap">{text || '...'}</span>
                    ) : (
                      <div className="chat-markdown text-sm">
                        <ReactMarkdown>{text || '...'}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                  {m.role === 'user' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="rounded-2xl bg-gray-100 px-4 py-3 dark:bg-gray-800">
                  <span className="flex gap-1 items-center h-4">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-2 text-sm text-red-600 dark:bg-red-900/20">
                ⚠ {error.message}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about ESG..."
                disabled={isLoading}
                className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
