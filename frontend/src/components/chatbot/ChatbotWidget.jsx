import React, { useEffect, useRef, useState } from 'react'
import { LuX, LuSend } from 'react-icons/lu'
import { axiosInstance } from '@utils/axiosInstance'
import { API_PATHS } from '@utils/apiPath'

const INITIAL_MESSAGES = [
  { id: 'w1', role: 'assistant', text: 'Xin chào! Mình là Billie Bot. Mình có thể giúp gì cho bạn?' }
]

const ChatbotWidget = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      // Scroll to bottom when opened
      setTimeout(() => containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' }), 100)
    }
  }, [isOpen])

  useEffect(() => {
    // Scroll to bottom when new messages are added
    setTimeout(() => containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' }), 100)
  }, [messages])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMsg = { id: `u-${Date.now()}`, role: 'user', text: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    // Optimistically add a thinking message
    const thinkingId = `a-${Date.now()}`
    setMessages(prev => [...prev, { id: thinkingId, role: 'assistant', text: '...' }])

    try {
      const response = await axiosInstance.post(API_PATHS.AI.QUERY, {
        question: trimmed
      })

      const replyText = response.data.answer;
      setMessages(prev => prev.map(m => m.id === thinkingId ? { ...m, text: replyText } : m))
    } catch (error) {
      console.error('Chatbot API error:', error)
      const errorText = 'Rất tiếc, mình đang gặp sự cố. Vui lòng thử lại sau.'
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
    <div className={`fixed inset-0 z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div
        className={`absolute right-0 top-0 h-full w-[380px] max-w-[90%] bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role='dialog'
        aria-modal='true'
      >
        {/* Header */}
        <div className='px-4 py-3 border-b flex items-center justify-between sticky top-0 bg-white z-10'>
          <div>
            <h3 className='font-semibold text-gray-800'>Billie Chatbot</h3>
            <p className='text-xs text-gray-500'>Hỏi mình về thu nhập, chi tiêu, số dư…</p>
          </div>
          <button onClick={onClose} className='p-2 rounded-lg hover:bg-gray-100'>
            <LuX className='text-xl text-gray-600' />
          </button>
        </div>

        {/* Messages */}
        <div ref={containerRef} className='flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50'>
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
              placeholder='Nhập tin nhắn…'
              className='flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500'
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition disabled:bg-emerald-400'
              aria-label='Gửi'
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


