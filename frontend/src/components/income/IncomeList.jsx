import TransactionInfoCard from '@components/cards/TransactionInfoCard'
import React from 'react'
import { LuDownload } from 'react-icons/lu'

const IncomeList = ({ transactions, onDelete, onDownload }) => {
  return (
    <div className='card'>
      <div className ='flex items-center justify-between mb-4'>
          <h5 className='text-xl font-bold text-gray-800'>Income Source</h5>

          <button className='card-btn' onClick={onDownload}>
            <LuDownload className='text-base' /> Download 
          </button>
      </div>

      <div className='grid grid-cols-1 gap-3 mt-2'>
        {
          transactions?.map((income) => ( 
            <TransactionInfoCard 
              key={income._id}
              title={income.source}
              icon={income.icon}
              date={new Date(income.date).toLocaleDateString()}
              amount={income.amount}
              type="income"
              onDelete={() => onDelete(income._id)}
            />
          ))
        }
      </div>
    </div>
  )
}

export default IncomeList