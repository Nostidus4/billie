import React, { useState } from 'react'
import CustomLineChart from '@components/charts/CustomLineChart'

const PredictionOverview = ({ predictionData, onAddGoal, onDateRangeChange, dateRange, loading }) => {
  const [showFilters, setShowFilters] = useState(false)

  const handleDateRangeChange = (type, value) => {
    onDateRangeChange(type, value)
  }

  const getDateRangeText = () => {
    if (dateRange.type === 'day') {
      return `Day: ${dateRange.value}`
    } else if (dateRange.type === 'month') {
      return `Month: ${dateRange.value}`
    } else if (dateRange.type === 'year') {
      return `Year: ${dateRange.value}`
    }
    return 'All time'
  }

  return (
    <div className="card">
      <div className='flex justify-between items-center'>
        <div>
          <h5 className='text-xl font-bold text-gray-800'>Prediction Overview</h5>
          <p className='text-xs text-gray-400 mt-0.5'>
            Predict spending trends and track your financial goals.
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <button 
            className='filter-btn'
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
            </svg>
            Filters
          </button>
          <button className='add-btn' onClick={onAddGoal}>
            Add Goal
          </button>
        </div>
      </div>

      {/* Date Range Filters */}
      {showFilters && (
        <div className='mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200'>
          <div className='flex items-center gap-4 mb-3'>
            <span className='text-sm font-medium text-gray-700'>Filter by:</span>
            <div className='flex gap-2'>
              <button
                onClick={() => handleDateRangeChange('type', 'day')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  dateRange.type === 'day' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => handleDateRangeChange('type', 'month')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  dateRange.type === 'month' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => handleDateRangeChange('type', 'year')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  dateRange.type === 'year' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Year
              </button>
            </div>
          </div>
          
          {dateRange.type === 'day' && (
            <div className='flex items-center gap-2'>
              <label className='text-sm text-gray-600'>Pick a day:</label>
              <input
                type="date"
                value={dateRange.value}
                onChange={(e) => handleDateRangeChange('value', e.target.value)}
                className='px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          )}
          
          {dateRange.type === 'month' && (
            <div className='flex items-center gap-2'>
              <label className='text-sm text-gray-600'>Pick a month:</label>
              <input
                type="month"
                value={dateRange.value}
                onChange={(e) => handleDateRangeChange('value', e.target.value)}
                className='px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          )}
          
          {dateRange.type === 'year' && (
            <div className='flex items-center gap-2'>
              <label className='text-sm text-gray-600'>Pick a year:</label>
              <select
                value={dateRange.value}
                onChange={(e) => handleDateRangeChange('value', e.target.value)}
                className='px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className='mt-3 text-sm text-gray-600'>
            Showing: <span className='font-medium'>{getDateRangeText()}</span>
          </div>
        </div>
      )}
      
      <div className='mt-10'>
        {loading ? (
          <div className='h-64 flex items-center justify-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
          </div>
        ) : predictionData && predictionData.chartData && predictionData.chartData.length > 0 ? (
          <div>
            {predictionData.prediction && (
              <div className='mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <div className='w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4'>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <h6 className='text-lg font-semibold text-blue-800'>Next month prediction</h6>
                      <p className='text-sm text-blue-600'>Based on historical data and trends</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-3xl font-bold text-blue-600'>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format(predictionData.prediction)}
                    </p>
                    <p className='text-sm text-blue-500 mt-1'>Prediction</p>
                  </div>
                </div>
              </div>
            )}
            {predictionData.insufficientData && (
              <div className='mb-6 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200 shadow-sm'>
                <div className='flex items-center'>
                  <div className='w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mr-4'>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h6 className='text-lg font-semibold text-orange-800'>More data needed</h6>
                    <p className='text-sm text-orange-600'>At least 2 months of expense data are required for accurate predictions</p>
                  </div>
                </div>
              </div>
            )}
            <div className='bg-white rounded-xl border border-gray-200 shadow-sm p-4'>
              <CustomLineChart data={predictionData.chartData} />
            </div>
          </div>
        ) : (
          <div className='h-64 flex items-center justify-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300'>
            <div className='text-center'>
              <div className='text-6xl mb-4'>📊</div>
              <h6 className='text-lg font-medium text-gray-600 mb-2'>No data</h6>
              <p className='text-sm text-gray-400'>Add some expenses to see predictions</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PredictionOverview

