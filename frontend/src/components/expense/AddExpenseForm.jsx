import React, { useState } from 'react'
import EmojiPicker from 'emoji-picker-react'

const AddExpenseForm = ({ onAddExpense, loading = false }) => {
  const [showPicker, setShowPicker] = useState(false)
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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!onAddExpense) return
    onAddExpense({
      ...expense,
      amount: Number(expense.amount) || 0,
    })
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

      {/* Actions */}
      <div className="flex justify-end">
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