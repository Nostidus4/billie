import React, { useEffect, useRef, useState } from 'react'
import { LuX, LuSend, LuMessageSquare, LuBot } from 'react-icons/lu'
import { axiosInstance } from '@utils/axiosInstance'
import { API_PATHS } from '@utils/apiPath'

const INITIAL_MESSAGES = [
  { id: 'w1', role: 'assistant', text: "Hi! I'm Billie Bot. How can I help you today?" }
]

const ChatbotWidget = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [internalOpen, setInternalOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)

  const containerRef = useRef(null)

  const open = typeof isOpen === 'boolean' ? isOpen : internalOpen
  const close = () => {
    if (onClose) onClose()
    else setInternalOpen(false)
    setHasUnread(false)
  }

  useEffect(() => {
    if (open) {
      setTimeout(() => containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' }), 100)
      setHasUnread(false)
    }
  }, [open])

  useEffect(() => {
    // Scroll to bottom when new messages are added
    setTimeout(() => containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' }), 100)
    const last = messages[messages.length - 1]
    if (last && last.role === 'assistant' && !open) setHasUnread(true)
  }, [messages])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMsg = { id: `u-${Date.now()}`, role: 'user', text: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    // Optimistic thinking message
    const thinkingId = `a-${Date.now()}`
    setMessages(prev => [...prev, { id: thinkingId, role: 'assistant', text: '...' }])

    try {
      const response = await axiosInstance.post(API_PATHS.AI.QUERY, {
        question: trimmed
      })

      const replyText = response.data.answer
      setMessages(prev => prev.map(m => m.id === thinkingId ? { ...m, text: replyText } : m))
    } catch (error) {
      console.error('Chatbot API error:', error)
      const errorText = "Sorry, I'm having trouble right now. Please try again later."
      setMessages(prev => prev.map(m => m.id === thinkingId ? { ...m, text: errorText } : m))
    } finally {
      setIsLoading(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className='fixed bottom-2 right-2 md:bottom-4 md:right-4 z-50'>
      {/* Floating bubble */}
      <button
        onClick={() => setInternalOpen((v) => !v)}
        className={`relative h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-colors active:scale-95 ${open ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-white text-emerald-600 hover:bg-emerald-50 border border-emerald-200'}`}
        aria-label='Open chatbot'
      >
        {open ? <LuX className='text-2xl' /> : <LuMessageSquare className='text-2xl' />}
        {hasUnread && !open && (
          <span className='absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white animate-pulse' />
        )}
      </button>

      {/* Chat panel */}
      <div className={`absolute bottom-16 right-0 w-[360px] max-w-[85vw] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden bg-white transition-all duration-300 ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
        {/* Header */}
        <div className='px-4 py-3 border-b flex items-center justify-between bg-white sticky top-0 z-10'>
          <div className='flex items-center gap-2'>
            <div className='h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center'>
              <LuBot />
            </div>
            <div>
              <h3 className='font-semibold text-gray-800'>Billie Chatbot</h3>
              <p className='text-xs text-gray-500'>Ask about income, expenses, balance…</p>
            </div>
          </div>
          <button onClick={close} className='p-2 rounded-lg hover:bg-gray-100' aria-label='Close chatbot'>
            <LuX className='text-xl text-gray-600' />
          </button>
        </div>

        {/* Messages */}
        <div ref={containerRef} className='h-[360px] overflow-y-auto px-4 py-3 space-y-3 bg-gray-50'>
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${m.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-800'} max-w-[85%] rounded-2xl px-3 py-2 shadow-sm`}>{m.text}</div>
            </div>
          ))}
        </div>

        {/* Composer */}
        <div className='p-3 border-t bg-white'>
          <div className='flex items-end gap-2'>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder='Type a message…'
              className='flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500'
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition disabled:bg-emerald-400'
              aria-label='Send'
              disabled={isLoading}
            >
              <LuSend className='text-lg' />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatbotWidget


