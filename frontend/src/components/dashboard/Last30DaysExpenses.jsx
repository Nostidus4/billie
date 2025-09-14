import CustomBarChart from '@components/charts/CustomBarChart';
import { preparedExpenseBarChartData } from '@utils/helper';
import React, { useEffect, useState } from 'react'
import { IoMdStats } from 'react-icons/io'

const Last30DaysExpenses = ({ transactions }) => {
  const [chartData, setChartData] = useState([]);
  useEffect(() => {
    const result = preparedExpenseBarChartData(transactions)
    setChartData(result);
  }, [transactions]);
  return (
    <div className='card col-span-1'>
      <div className='flex items-center justify-between'>
        <h5 className='text-lg font-bold flex items-center gap-2'>
          <IoMdStats className='text-gray-700' />
          Last 30 Days Expenses
        </h5>
      </div>

      <CustomBarChart data={chartData} />
    </div>
  )
}

export default Last30DaysExpenses