import React, { useState } from 'react'
import EmojiPicker from 'emoji-picker-react'

const AddGoalForm = ({ onAddGoal, loading = false }) => {
  const [showPicker, setShowPicker] = useState(false)
  const [goal, setGoal] = useState({
    title: '',
    amount: '',
    deadline: '',
    icon: '🎯',
  })

  const handleChange = (key, value) => {
    setGoal((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!onAddGoal) return
    onAddGoal({
      ...goal,
      amount: Number(goal.amount) || 0,
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
            <span className="text-lg mr-2">{goal.icon}</span>
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

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Goal</label>
        <input
          id="title"
          type="text"
          value={goal.title}
          onChange={({ target }) => handleChange('title', target.value)}
          placeholder="New motorbike, Travel, House..."
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">Target amount (VND)</label>
        <input
          id="amount"
          type="number"
          value={goal.amount}
          onChange={({ target }) => handleChange('amount', target.value)}
          min="0"
          step="1000"
          placeholder="10000000"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
      </div>

      {/* Deadline */}
      <div>
        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">Deadline (Optional)</label>
        <input
          id="deadline"
          type="date"
          value={goal.deadline}
          onChange={({ target }) => handleChange('deadline', target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
        >
          {loading ? 'Adding...' : 'Add goal'}
        </button>
      </div>
    </form>
  )
}

export default AddGoalForm
