import React from 'react'
import {
  LuUtensils,
  LuTrendingUp,
  LuTrendingDown,
  LuTrash2
} from 'react-icons/lu'

const TransactionInfoCard = ({ title, icon, date, amount, type, hideDeleteBtn, onDelete }) => {
  const getAmountStyles = () => {
    if (type === "income") {
      return "bg-green-50 text-green-600 border-green-200";
    } else {
      return "bg-red-50 text-red-600 border-red-200";
    }
  }

  const isImageUrl = (value) => {
    if (typeof value !== 'string') return false
    return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image')
  }

  return (
    <div className='group relative flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-100'>
      {/* Icon */}
      <div className='w-12 h-12 flex items-center justify-center text-xl text-gray-600 bg-gray-100 rounded-xl shrink-0'>
        {icon
          ? isImageUrl(icon)
            ? <img src={icon} alt={title} className='w-6 h-6' />
            : <span className='text-2xl leading-none'>{icon}</span>
          : <LuUtensils />}
      </div>

      {/* Transaction Details */}
      <div className='flex-1'>
        <div className='flex items-center justify-between'>
          <div>
            <h6 className='text-sm font-semibold text-gray-800'>{title}</h6>
            <p className='text-xs text-gray-500 mt-1'>{date}</p>
          </div>

          {/* Amount & Actions */}
          <div className='flex items-center gap-3'>
            {/* Amount Badge */}
            <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border min-w-[100px] ${getAmountStyles()}`}>
              <span className='text-sm font-bold'>
                {type === "income" ? "+" : "-"}${amount}
              </span>
              {type === "income" ? (
                <LuTrendingUp size={16} />
              ) : (
                <LuTrendingDown size={16} />
              )}
            </div>

            {/* Delete Button */}
            {!hideDeleteBtn && (
              <button 
                className='text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 rounded-lg hover:bg-red-50'
                onClick={onDelete}
              >
                <LuTrash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionInfoCard