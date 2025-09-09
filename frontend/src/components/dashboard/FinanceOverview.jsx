import React from 'react'
import CustomPieChart from '@components/charts/CustomPieChart'
import { LuWallet } from 'react-icons/lu'

const FinanceOverview = ({ totalBalance, totalIncome, totalExpenses }) => {
  const balanceData = [
    { label: "Balance", amount: totalBalance || 0, color: "bg-green-600" },
    { label: "Income", amount: totalIncome || 0, color: "bg-orange-500" },
    { label: "Expenses", amount: totalExpenses || 0, color: "bg-red-500" },
  ]

  return (
    <div className='card'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
            <LuWallet className='text-white text-sm' />
          </div>
          <h5 className='text-xl font-bold text-gray-800'>Finance Overview</h5>
        </div>
      </div>

      {/* Pie Chart */}
      <CustomPieChart 
        data={balanceData}
        label="total balance"
        totalAmount={totalBalance}
        color="bg-blue-600"
      />
    </div>
  )
}

export default FinanceOverview