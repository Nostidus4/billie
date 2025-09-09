import React from 'react'

const InfoCard = ({
  icon, label, value, color
}) => {
  return (
    <div className='flex items-center gap-6 bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50'>
      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-[26px] text-white ${color} drop-shadow-xl`}>
        {icon}
      </div>
      <div>
        <h6 className='text-sm text-gray-500'>{label}</h6>
        <h6 className='text-lg font-bold text-gray-800'>{value}</h6>
      </div>
    </div>
  )
}

export default InfoCard