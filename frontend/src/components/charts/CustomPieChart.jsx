import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const CustomPieChart = ({ data, label, totalAmount, color }) => {
  // Convert Tailwind colors to hex
  const getColorValue = (colorClass) => {
    const colorMap = {
      'bg-green-600': '#16a34a',
      'bg-orange-500': '#f97316', 
      'bg-red-500': '#ef4444',
      'bg-blue-500': '#3b82f6',
      'bg-purple-500': '#8b5cf6'
    }
    return colorMap[colorClass] || '#6b7280'
  }

  // Format data for chart
  const chartData = data.map(item => ({
    name: item.label,
    value: item.amount,
    color: getColorValue(item.color)
  }))

  const COLORS = chartData.map(item => item.color)

  return (
    <div className="w-full h-[300px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
            labelStyle={{ color: '#374151' }}
            contentStyle={{ 
              backgroundColor: '#f9fafb', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">{label || 'Total'}</p>
          <p className="text-2xl font-bold text-gray-800">${(totalAmount || 0).toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}

export default CustomPieChart