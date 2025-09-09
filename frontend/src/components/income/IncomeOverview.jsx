import React, { useEffect, useState } from 'react'
import { LuPlus } from 'react-icons/lu'
import CustomBarChart from '@components/charts/CustomBarChart'
import { preparedIcomeBarChartData } from '@utils/helper';


const IncomeOverview = ({ transactions, onAddIncome }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
   const result = preparedIcomeBarChartData(transactions)
   setChartData(result);
   return () => {};
  }, [transactions]);
  return (
    <div className='card'>
      <div className='flex items-center justify-between'>
        <div className=''>
          <h5 className='text-xl font-bold text-gray-800'>Income Overview</h5>
          <p className='text-xs text-gray-400 mt-0.5'>
            Track your earnings over time and analyze income sources.
          </p>
        </div>

        <button className='add-btn' onClick={onAddIncome}>
          <LuPlus className='text-xl' />
          Add Income 
        </button>
      </div>


      <div className='mt-10'>
        <CustomBarChart data={chartData} />
      </div>
    </div>
  )
}

export default IncomeOverview