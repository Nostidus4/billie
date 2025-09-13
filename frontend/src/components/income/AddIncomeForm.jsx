import React, { useState } from 'react'
import EmojiPicker from 'emoji-picker-react'

const AddIncomeForm = ({ onAddIncome, loading = false, initialDate }) => {
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    date: initialDate || new Date().toISOString().split('T')[0],
    description: '',
    icon: '💼'
  })

  const [showPicker, setShowPicker] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!onAddIncome) return
    onAddIncome({
      ...formData,
      amount: Number(formData.amount) || 0,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Icon
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPicker((v) => !v)}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg mr-2">{formData.icon}</span>
            <span className="text-sm text-gray-700">Choose emoji</span>
          </button>
        </div>
        {showPicker && (
          <div className="mt-3">
            <EmojiPicker
              onEmojiClick={(emojiData) => setFormData((prev) => ({ ...prev, icon: emojiData.emoji }))}
              lazyLoadEmojis
              theme="light"
              width="100%"
              previewConfig={{ showPreview: false }}
              searchDisabled={false}
              skinTonesDisabled={false}
            />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
          Income Source
        </label>
        <input
          type="text"
          id="source"
          name="source"
          value={formData.source}
          onChange={handleChange}
          required
          placeholder="Freelance, Salary, etc"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
          Amount ($)
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          placeholder="Enter amount"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Add a description..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors duration-200 flex items-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </>
          ) : (
            'Add Income'
          )}
        </button>
      </div>
    </form>
  )
}

export default AddIncomeForm