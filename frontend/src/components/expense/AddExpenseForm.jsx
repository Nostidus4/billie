import React, { useState } from 'react'
import EmojiPicker from 'emoji-picker-react'
import { startVoiceRecording, stopVoiceRecording, isVoiceRecordingSupported, requestMicrophonePermission } from '../../utils/voiceRecognition'

const AddExpenseForm = ({ onAddExpense, loading = false }) => {
  const [showPicker, setShowPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const [expense, setExpense] = useState({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    icon: '🧾',
  })

  const handleChange = (key, value) => {
    setExpense((prev) => ({ ...prev, [key]: value }))
  }

  // Voice recording handler
  const handleVoiceRecord = async () => {
    if (isRecording) {
      // If already recording, stop it
      stopVoiceRecording()
      setIsRecording(false)
      return
    }

    if (!isVoiceRecordingSupported()) {
      setVoiceError('Trình duyệt không hỗ trợ ghi âm')
      return
    }

    try {
      setVoiceError('')
      setIsRecording(true)
      
      // Request permission first
      const hasPermission = await requestMicrophonePermission()
      if (!hasPermission) {
        setVoiceError('Cần cấp quyền truy cập microphone')
        setIsRecording(false)
        return
      }

      const result = await startVoiceRecording()
      
      if (result.success && result.expenseInfo) {
        // Update form with extracted information
        setExpense(prev => ({
          ...prev,
          category: result.expenseInfo.category || prev.category,
          amount: result.expenseInfo.amount || prev.amount,
          description: result.expenseInfo.description || prev.description,
          date: result.expenseInfo.date || prev.date,
        }))
      } else {
        setVoiceError(result.error || 'Không thể xử lý giọng nói')
      }
    } catch (error) {
      setVoiceError(error.message || 'Lỗi khi ghi âm')
    } finally {
      setIsRecording(false)
    }
  }

  // Nhận dữ liệu từ tab Scan Bill
  React.useEffect(() => {
    const onMessage = (event) => {
      const { data } = event || {}
      if (!data || typeof data !== 'object') return
      if (data.type === 'scan-bill:complete') {
        handleScanComplete(data.data)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!onAddExpense) return
    onAddExpense({
      ...expense,
      amount: Number(expense.amount) || 0,
    })
  }

  const handleScanComplete = (scanData) => {
    // Cập nhật form với dữ liệu từ scan
    const updatedExpense = { ...expense }
    
    // Xử lý tổng thanh toán
    if (scanData.tong_thanh_toan && scanData.tong_thanh_toan !== 'Không có') {
      // Trích xuất số từ chuỗi (loại bỏ ký tự không phải số và dấu chấm)
      const amountMatch = scanData.tong_thanh_toan.match(/[\d.,]+/)
      if (amountMatch) {
        const amountStr = amountMatch[0].replace(/,/g, '')
        const amount = parseFloat(amountStr)
        if (!isNaN(amount)) {
          updatedExpense.amount = amount.toString()
        }
      }
    }

    // Xử lý thời gian thanh toán
    if (scanData.thoi_gian_thanh_toan && scanData.thoi_gian_thanh_toan !== 'Không có') {
      // Thử parse ngày tháng
      const dateStr = scanData.thoi_gian_thanh_toan
      const date = new Date(dateStr)
      if (!isNaN(date.getTime())) {
        updatedExpense.date = date.toISOString().split('T')[0]
      }
    }

    // Xử lý mô tả từ danh sách sản phẩm
    if (scanData.phan_loai_san_pham && Array.isArray(scanData.phan_loai_san_pham)) {
      const products = scanData.phan_loai_san_pham
        .filter(item => item.san_pham && item.san_pham !== 'Không có')
        .map(item => item.san_pham)
        .join(', ')
      
      if (products) {
        updatedExpense.description = `Sản phẩm: ${products}`
        
        // Đặt category từ sản phẩm đầu tiên nếu chưa có
        if (!updatedExpense.category && products) {
          const firstProduct = scanData.phan_loai_san_pham[0]
          if (firstProduct && firstProduct.phan_loai && firstProduct.phan_loai !== 'Không có') {
            updatedExpense.category = firstProduct.phan_loai
          } else {
            updatedExpense.category = 'Mua sắm'
          }
        }
      }
    }

    setExpense(updatedExpense)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Icon picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPicker((v) => !v)}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg mr-2">{expense.icon}</span>
            <span className="text-sm text-gray-700">Choose emoji</span>
          </button>
        </div>
        {showPicker && (
          <div className="mt-3">
            <EmojiPicker
              onEmojiClick={(emojiData) => handleChange('icon', emojiData.emoji)}
              lazyLoadEmojis
              theme="light"
              width="100%"
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <input
          id="category"
          type="text"
          value={expense.category}
          onChange={({ target }) => handleChange('category', target.value)}
          placeholder="Rent, Groceries, etc"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
        <input
          id="amount"
          type="number"
          value={expense.amount}
          onChange={({ target }) => handleChange('amount', target.value)}
          min="0"
          step="0.01"
          placeholder="0.00"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
      </div>

      {/* Date */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">Date</label>
        <input
          id="date"
          type="date"
          value={expense.date}
          onChange={({ target }) => handleChange('date', target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
        <textarea
          id="description"
          rows={3}
          value={expense.description}
          onChange={({ target }) => handleChange('description', target.value)}
          placeholder="Add a note..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
        />
      </div>

      {/* Voice Error Message */}
      {voiceError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            <span>{voiceError}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={handleVoiceRecord}
          disabled={loading}
          className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors border flex items-center gap-2 ${
            isRecording 
              ? 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200' 
              : 'text-green-600 bg-green-50 hover:bg-green-100 border-green-200'
          } disabled:bg-gray-100 disabled:text-gray-400`}
        >
          {isRecording ? (
            <>
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              <span>Recording... (Nhấn để dừng)</span>
            </>
          ) : (
            <>
              <span>Voice Record</span>
            </>
          )}
        </button>
        
        <button
          type="button"
          onClick={() => window.open('/scan-bill', '_blank')}
          className="px-6 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
        >
          Scan Bill
        </button>
        
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
        >
          {loading ? 'Adding...' : 'Add Expense'}
        </button>
      </div>

    </form>
  )
}

export default AddExpenseForm