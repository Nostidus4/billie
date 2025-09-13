import React from 'react'
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const CustomLineChart = ({ data }) => {
  const safeData = Array.isArray(data) ? data : []

  const CustomToolTip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null
    const item = payload[0]
    return (
      <div className='bg-white shadow-md rounded-lg p-2 border-gray-300'>
        <p className='text-xs font-semibold text-green-800 mb-1'>{item.payload?.month || ''}</p>
        <p className='text-sm text-gray-600'>
          Amount: <span className='text-sm font-medium text-gray-900'>{item.payload?.amount}</span>
        </p>
      </div>
    )
  }

  return (
    <div className='bg-white'>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={safeData}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="none" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} stroke='none' />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} stroke='none' />
          <Tooltip content={<CustomToolTip />} />
          <Area type="monotone" dataKey="amount" stroke="#82ca9d" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={3} dot={{r : 3, fill: '#82ca9d'}} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CustomLineChart