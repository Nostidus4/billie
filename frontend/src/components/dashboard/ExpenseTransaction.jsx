import moment from 'moment'
import React from 'react'
import { LuArrowRight } from 'react-icons/lu'
import TransactionInfoCard from '@components/cards/TransactionInfoCard'

const ExpenseTransaction = ({ transactions, onSeeMore }) => {
  return (
    <div className='card'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center'>
            <span className='text-white text-sm font-bold'>EX</span>
          </div>
          <h5 className='text-xl font-bold text-gray-800'>Expenses</h5>
        </div>
        <button 
          className='card-btn'
          onClick={onSeeMore}
        >
          See All <LuArrowRight className='text-base' />
        </button>
      </div>

      {/* Transactions List */}
      <div className='space-y-3'>
        {transactions?.slice(0, 5).map((item) => (
          <TransactionInfoCard 
            key={item._id} 
            title={item.category}
            icon={item.icon}
            date={moment(item.date).format("DD MMM, YYYY")}
            amount={item.amount}
            type="expense"
            hideDeleteBtn
          />
        ))}
      </div>
    </div>
  )
}

export default ExpenseTransaction