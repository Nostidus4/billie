import TransactionInfoCard from '@components/cards/TransactionInfoCard'
import React from 'react'
import { LuDownload } from 'react-icons/lu'

const ExpenseList = ({ transactions, onDelete, onDownload }) => {
  return (
    <div className='card'>
      <div className ='flex items-center justify-between mb-4'>
          <h5 className='text-xl font-bold text-gray-800'>Expenses</h5>

          <button className='card-btn' onClick={onDownload}>
            <LuDownload className='text-base' /> Download 
          </button>
      </div>

      <div className='grid grid-cols-1 gap-3 mt-2'>
        {
          transactions?.map((expense) => ( 
            <TransactionInfoCard 
              key={expense._id}
              title={expense.category}
              icon={expense.icon}
              date={new Date(expense.date).toLocaleDateString()}
              amount={expense.amount}
              type="expense"
              onDelete={() => onDelete(expense._id)}
            />
          ))
        }
      </div>
    </div>
  )
}

export default ExpenseList


