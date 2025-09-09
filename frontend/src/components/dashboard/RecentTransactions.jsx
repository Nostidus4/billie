import React from 'react'
import { LuArrowRight } from 'react-icons/lu'
import moment from 'moment'
import TransactionInfoCard from '@components/cards/TransactionInfoCard'
const RecentTransactions = ({ transactions = [], onSeeMore }) => {
  return (
    <div className='w-full p-6 bg-white rounded-xl shadow-md'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center'>
            <span className='text-white text-sm font-bold'>RT</span>
          </div>
          <h5 className='text-xl font-bold text-gray-800'>Recent Transactions</h5>
        </div>
        <button 
          className='card-btn'
          onClick={onSeeMore}
        >
          See All
          <LuArrowRight className='text-sm' />
        </button>
      </div>
      
       {/* Transactions List */}
       <div className='space-y-3'>
         {transactions?.slice(0, 5).map((item) => (
           <TransactionInfoCard 
             key={item._id} 
             title={item.type === "expense" ? item.category : item.source}
             icon={item.icon}
             date={moment(item.date).format("DD MMM, YYYY")}
             amount={item.amount}
             type={item.type}
             hideDeleteBtn
           />
         ))}
       </div>
    </div>
  )
}

export default RecentTransactions


