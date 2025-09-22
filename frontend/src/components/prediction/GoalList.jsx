import React from 'react'

const GoalList = ({ goals, onDelete, onDownload }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100)
  }

  const getStatusColor = (status) => {
    return status === 'completed' ? 'text-green-600' : 'text-blue-600'
  }

  const getStatusText = (status) => {
    return status === 'completed' ? 'Completed' : 'In progress'
  }

  return (
    <div className="card">
      <div className='flex justify-between items-center mb-6'>
        <h5 className='text-xl font-bold text-gray-800'>Financial Goals</h5>
        <button className='download-btn' onClick={onDownload}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download
        </button>
      </div>

      {goals.length > 0 ? (
        <div className='space-y-4'>
          {goals.map((goal) => (
            <div key={goal._id} className='group p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300'>
              <div className='flex items-start justify-between mb-4'>
                <div className='flex items-start gap-4 flex-1'>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    goal.status === 'completed' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    🎯
                  </div>
                  <div className='flex-1'>
                    <h6 className='text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors'>
                      {goal.title}
                    </h6>
                    <div className='flex items-center gap-6 text-sm'>
                      <div className='flex items-center gap-2'>
                        <span className='text-gray-500'>Progress:</span>
                        <span className='font-semibold text-gray-700'>
                          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.amount)}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        goal.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {getStatusText(goal.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onDelete(goal._id)}
                  className='opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all duration-200'
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <div className='w-full bg-gray-200 rounded-full h-3 overflow-hidden'>
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ease-out ${
                        goal.status === 'completed' 
                          ? 'bg-gradient-to-r from-green-400 to-green-500' 
                          : 'bg-gradient-to-r from-blue-400 to-blue-500'
                      }`}
                      style={{ width: `${getProgressPercentage(goal.currentAmount, goal.amount)}%` }}
                    ></div>
                  </div>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-gray-600 font-medium'>
                      Hoàn thành: {getProgressPercentage(goal.currentAmount, goal.amount).toFixed(1)}%
                    </span>
                    {goal.status === 'completed' && (
                      <span className='text-green-600 font-medium flex items-center gap-1'>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Đã hoàn thành!
                      </span>
                    )}
                  </div>
                </div>
                
                {goal.deadline && (
                  <div className='flex items-center gap-1 text-sm text-gray-500'>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Due: {new Date(goal.deadline).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center py-12'>
          <div className='text-gray-400 text-6xl mb-4'>🎯</div>
          <h6 className='text-lg font-medium text-gray-600 mb-2'>No goals yet</h6>
          <p className='text-sm text-gray-400 mb-4'>Create your first financial goal</p>
          <button className='add-btn' onClick={() => {}}>
            Create goal
          </button>
        </div>
      )}
    </div>
  )
}

export default GoalList
