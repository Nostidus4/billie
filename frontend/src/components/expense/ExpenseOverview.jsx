import { prepareExpenseLineChartData } from '@utils/helper';
import React, { useEffect, useState } from 'react'
import CustomLineChart from '@components/charts/CustomLineChart';

const ExpenseOverview = ({ transactions, onExpenseIcome }) => {
  const [chartData, setChartData] = useState({});
  useEffect(() => {
    const result = prepareExpenseLineChartData(transactions);
    setChartData(result);
  }, [transactions])
  return (
   <div className="card">
    <div className='flex justify-between items-center'>
      <div>
        <h5 className='text-xl font-bold text-gray-800'>Expense Overview</h5>
        <p className='text-xs text-gray-400 mt-0.5'>
          Track your spending trends over time and gains insights your money goes.
        </p>
      </div>

      <button className='add-btn' onClick={onExpenseIcome}>
        Add Expense
      </button>
    </div>
      <div className='mt-10'>
        <CustomLineChart data={chartData} />
      </div>
   </div>
  )
}

export default ExpenseOverview