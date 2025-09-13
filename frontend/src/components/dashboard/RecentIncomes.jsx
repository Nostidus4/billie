import React, { useEffect, useState } from 'react'
import CustomPieChart from '@components/charts/CustomPieChart'

const COLORS = ['bg-orange-500', 'bg-green-600', 'bg-blue-500', 'bg-purple-500', 'bg-red-500']

const RecentIncomes = ({ transactions = [], totalIncome = 0 }) => {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    const dataArr = (Array.isArray(transactions) ? transactions : []).map((item, index) => ({
      label: item?.source || 'Unknown',
      amount: Number(item?.amount) || 0,
      color: COLORS[index % COLORS.length],
    }))
    setChartData(dataArr)
  }, [transactions])

  return (
    <div className='card'>
      <div className='flex items-center justify-between'>
        <h5 className='text-lg font-bold'>Last 60 Days Income</h5>
      </div>
      <CustomPieChart
        data={chartData}
        label="Total Income"
        totalAmount={totalIncome}
      />
    </div>
  )
}

export default RecentIncomes