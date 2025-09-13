import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { addThousandSeparator } from '@/utils/helper'

const colors = ['#FF8042', '#FFBB28', '#00C49F', '#0088FE', '#AF19FF', '#FF6B6B']

const getBarColor = (index) => colors[index % colors.length]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  const item = payload[0]
  return (
    <div className='bg-white shadow rounded px-3 py-2 text-sm'>
      <p className='font-medium'>{label}</p>
      <p className='text-gray-600'>Amount: {addThousandSeparator(item.value || 0)}</p>
    </div>
  )
}

const CustomBarChart = ({ data = [] }) => {
  const safeData = Array.isArray(data) ? data : []
  return (
    <div className="bg-white mt-6">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={safeData}>
          <CartesianGrid stroke="none" />
          <XAxis
            dataKey="category"
            tick={{ fontSize: 12, fill: '#555' }}
            stroke="none"
          />
          <YAxis tick={{ fontSize: 12, fill: '#555' }} stroke="none" />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="amount"
            fill="#FF8042"
            radius={[10, 10, 0, 0]}
          >
            {safeData.map((entry, index) => (
              <Cell key={index} fill={getBarColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CustomBarChart