import React from 'react'

const Modal = ({children, isOpen, onClose, title}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex justify-center items-center w-full h-[calc(100% - 1rem)] max-h-full overflow-y-auto overflow-x-hidden bg-black/20 bg-opacity-50'>
      <div className='relative p-4 w-full max-w-2xl max-h-full'>
        <div className='relative bg-white rounded-lg shadow-lg p-6'>
          {/* Header */}
          <div className='flex items-center justify-between mb-6'>
            <h3 className='text-xl font-semibold text-gray-900'>
              {title}
            </h3>
            <button 
              className='text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-colors duration-200' 
              onClick={onClose} 
              type='button'
            >
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className='space-y-4'>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal