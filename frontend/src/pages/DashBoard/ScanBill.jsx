import React, { useEffect, useRef, useState } from 'react'
import { extractBillInfoFromImage } from '../../utils/geminiClient'

const ScanBill = () => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  const startCamera = async () => {
    try {
      setError('')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setIsStreaming(true)
    } catch (e) {
      setError('Không thể truy cập camera. Vui lòng kiểm tra quyền.')
      console.error(e)
    }
  }

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject
    if (stream) {
      stream.getTracks().forEach(t => t.stop())
      if (videoRef.current) videoRef.current.srcObject = null
    }
    setIsStreaming(false)
  }

  const captureAndSend = async () => {
    if (!videoRef.current || !canvasRef.current) return
    setIsProcessing(true)
    try {
      const v = videoRef.current
      const c = canvasRef.current
      const ctx = c.getContext('2d')
      c.width = v.videoWidth
      c.height = v.videoHeight
      ctx.drawImage(v, 0, 0, c.width, c.height)

      const blob = await new Promise(resolve => c.toBlob(resolve, 'image/jpeg', 0.95))

      // Process entirely on client using Gemini (or fallback mock)
      const result = await extractBillInfoFromImage(blob)
      if (result) {
        if (window.opener) {
          try {
            window.opener.postMessage({ type: 'scan-bill:complete', data: result }, '*')
          } catch {}
        }
        window.close()
      } else {
        setError('Lỗi khi trích xuất thông tin hóa đơn')
      }
    } catch (e) {
      const msg = e?.message || 'Unknown error'
      setError('Lỗi khi xử lý ảnh: ' + msg)
      console.error(e)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between bg-gradient-to-r from-green-500 to-green-600 shadow-lg">
        <div className="flex items-center gap-3">
          {/* <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md">
            <span className="text-green-600 text-sm font-bold">📷</span>
          </div> */}
          <div>
            <img src='/public/billie_logo.png' alt='Billie Logo' className='w-10 h-10 rounded-xl object-contain bg-white/20 p-1 backdrop-blur-sm' />
          </div>
          <h1 className="text-xl font-bold text-white">
            Scan Bill
          </h1>
        </div>
        <button 
          onClick={() => window.close()} 
          className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 text-white border border-white/30 hover:border-white/50"
        >
          <strong>✕</strong> Close
        </button>
      </header>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <div className="flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mx-6 mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">📋 Instructions:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Put the bill in the camera frame, ensure the entire bill content is within the frame</li>
          <li>• Press "Capture Image" to automatically extract information</li>
        </ul>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center gap-8 p-6">
        {/* Camera Preview */}
        <div className="relative w-full max-w-6xl aspect-[4/3] bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-green-200">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover" 
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Camera Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
              <div className="flex items-center gap-2 px-3 py-2 bg-black/70 rounded-full backdrop-blur-sm">
                {/* <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> */}
                {/* <span className="text-xs font-medium text-white">Đang ghi</span> */}
              </div>
              <div className="px-3 py-2 bg-black/70 rounded-full backdrop-blur-sm">
                {/* <span className="text-xs font-medium text-white">HD</span> */}
              </div>
            </div>
            
            {/* Focus Guide */}
            <div className="absolute inset-8 border-2 border-green-400 rounded-xl flex items-center justify-center">
              <div className="w-20 h-20 border-2 border-green-300 rounded-lg"></div>
            </div>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
              <div className="px-4 py-2 bg-black/70 rounded-full backdrop-blur-sm">
                <span className="text-sm font-medium text-white">Put the bill in the camera frame</span>
              </div>
            </div>
          </div>
        </div>

        {/* Capture Button */}
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={captureAndSend}
            disabled={!isStreaming || isProcessing}
            className="group relative px-10 py-5 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-4">
              {isProcessing ? (
                <>
                  <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  {/* <span className="text-3xl">📷</span> */}
                  <span>Capture Image</span>
                </>
              )}
            </div>
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          
          <div className="text-center max-w-2xl">
            <p className="text-sm text-gray-600 mb-2">
              💡 <strong>Notice:</strong> Ensure the bill is clear and well-lit for the best results
            </p>
            <p className="text-xs text-gray-500">
              The system will automatically extract product information, amount and date from the bill
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ScanBill


