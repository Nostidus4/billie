// Voice recognition utility for expense form
// Uses OpenAI Whisper API to transcribe speech and extract expense information

const OPENAI_API_KEY = "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";

// Global variables for recording control
let currentMediaRecorder = null;
let currentStream = null;
let recordingTimeout = null;

// Function to start recording audio
export async function startVoiceRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 16000
      } 
    });
    
    currentStream = stream;
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });
    
    currentMediaRecorder = mediaRecorder;
    const audioChunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };
    
    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        // Stop all tracks
        if (currentStream) {
          currentStream.getTracks().forEach(track => track.stop());
          currentStream = null;
        }
        
        // Clear timeout
        if (recordingTimeout) {
          clearTimeout(recordingTimeout);
          recordingTimeout = null;
        }
        
        try {
          const result = await processVoiceToExpense(audioBlob);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      mediaRecorder.onerror = (error) => {
        if (currentStream) {
          currentStream.getTracks().forEach(track => track.stop());
          currentStream = null;
        }
        if (recordingTimeout) {
          clearTimeout(recordingTimeout);
          recordingTimeout = null;
        }
        reject(error);
      };
      
      mediaRecorder.start();
      
      // Auto stop after 15 seconds
      recordingTimeout = setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 15000);
    });
  } catch (error) {
    throw new Error('Không thể truy cập microphone: ' + error.message);
  }
}

// Function to stop recording manually
export function stopVoiceRecording() {
  if (currentMediaRecorder && currentMediaRecorder.state === 'recording') {
    currentMediaRecorder.stop();
  }
  
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }
  
  if (recordingTimeout) {
    clearTimeout(recordingTimeout);
    recordingTimeout = null;
  }
}

// Function to process voice recording and extract expense information
async function processVoiceToExpense(audioBlob) {
  try {
    // Convert audio to text using OpenAI Whisper
    const transcript = await transcribeAudio(audioBlob);
    
    if (!transcript || transcript.trim().length === 0) {
      throw new Error('Không thể nhận diện giọng nói');
    }
    
    // Extract expense information from transcript
    const expenseInfo = extractExpenseFromText(transcript);
    
    return {
      success: true,
      transcript,
      expenseInfo
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      expenseInfo: null
    };
  }
}

// Function to transcribe audio using OpenAI Whisper API
async function transcribeAudio(audioBlob) {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'vi'); // Vietnamese
    formData.append('response_format', 'json');
    
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Whisper API Error:', response.status, errorText);
      throw new Error(`API Whisper lỗi ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.text || result.text.trim().length === 0) {
      throw new Error('Không thể nhận diện giọng nói từ audio');
    }
    
    return result.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Lỗi khi chuyển đổi giọng nói: ' + error.message);
  }
}

// Function to extract expense information from transcribed text
function extractExpenseFromText(text) {
  const lowerText = text.toLowerCase();
  
  // Extract amount (improved pattern matching)
  let amount = '';
  const amountPatterns = [
    // Patterns for Vietnamese currency
    /(\d+(?:[.,]\d+)?)\s*(?:nghin|k|thousand)/i,
    /(\d+(?:[.,]\d+)?)\s*(?:trieu|tr|million)/i,
    /(\d+(?:[.,]\d+)?)\s*(?:vnd|đ|dong)/i,
    /(\d+(?:[.,]\d+)?)\s*(?:nghin|k)\s*(?:dong|vnd|đ)/i,
    /(\d+(?:[.,]\d+)?)\s*(?:trieu|tr)\s*(?:dong|vnd|đ)/i,
    // General number patterns
    /(\d+(?:[.,]\d+)?)\s*(?:dong|vnd|đ)/i,
    /(\d+(?:[.,]\d+)?)\s*(?:nghin|k)/i,
    /(\d+(?:[.,]\d+)?)\s*(?:trieu|tr)/i,
    // Just numbers
    /(\d+(?:[.,]\d+)?)/i
  ];
  
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      let amountStr = match[1].replace(/,/g, '');
      const number = parseFloat(amountStr);
      
      if (!isNaN(number)) {
        // Convert based on context
        if (lowerText.includes('nghin') || lowerText.includes('k')) {
          amount = (number * 1000).toString();
        } else if (lowerText.includes('trieu') || lowerText.includes('tr')) {
          amount = (number * 1000000).toString();
        } else {
          amount = number.toString();
        }
        break;
      }
    }
  }
  
  // Extract category with improved keyword matching
  let category = '';
  const categoryKeywords = {
    'Ăn uống': [
      'ăn', 'uống', 'cơm', 'cà phê', 'trà sữa', 'nhà hàng', 'quán ăn', 'food', 'drink', 'restaurant',
      'bữa ăn', 'ăn sáng', 'ăn trưa', 'ăn tối', 'ăn vặt', 'snack', 'lunch', 'dinner', 'breakfast',
      'pizza', 'burger', 'phở', 'bún', 'mì', 'bánh mì', 'nem', 'gỏi cuốn', 'chả cá', 'bún chả',
      'nước', 'soda', 'coca', 'pepsi', 'bia', 'rượu', 'wine', 'beer', 'coffee', 'tea'
    ],
    'Thời trang': [
      'quần áo', 'giày', 'dép', 'túi xách', 'đồng hồ', 'trang sức', 'fashion', 'clothes', 'shoes',
      'áo', 'quần', 'váy', 'đầm', 'áo sơ mi', 'áo thun', 'quần jean', 'quần short', 'áo khoác',
      'giày thể thao', 'giày cao gót', 'giày boot', 'dép lào', 'dép xăng đan', 'sandal',
      'túi', 'ba lô', 'ví', 'thắt lưng', 'khăn', 'mũ', 'găng tay', 'vớ', 'tất'
    ],
    'Đồ sinh hoạt': [
      'đồ sinh hoạt', 'gia vị', 'mỹ phẩm', 'đồ gia dụng', 'household', 'cosmetics', 'utilities',
      'sữa tắm', 'dầu gội', 'kem đánh răng', 'bàn chải đánh răng', 'khăn giấy', 'giấy vệ sinh',
      'nước rửa chén', 'nước lau nhà', 'bột giặt', 'nước xả', 'nước hoa', 'kem chống nắng',
      'đồ vệ sinh', 'bông tẩy', 'tắm', 'gội', 'chai', 'lọ', 'hộp', 'túi', 'bao'
    ],
    'Giải trí': [
      'giải trí', 'phim', 'game', 'karaoke', 'entertainment', 'movie', 'cinema', 'netflix',
      'xem phim', 'đi xem phim', 'rạp chiếu phim', 'vé phim', 'ticket', 'concert', 'show',
      'chơi game', 'game online', 'ps4', 'ps5', 'xbox', 'nintendo', 'steam', 'playstation',
      'karaoke', 'quán karaoke', 'hát', 'singing', 'party', 'club', 'bar', 'pub'
    ],
    'Giao thông': [
      'giao thông', 'taxi', 'grab', 'xe máy', 'xăng', 'transport', 'fuel', 'gas',
      'đi taxi', 'gọi grab', 'xe ôm', 'xe buýt', 'trạm', 'metro', 'tàu', 'máy bay',
      'xăng', 'dầu', 'fuel', 'gas', 'nạp xăng', 'đổ xăng', 'xe', 'ô tô', 'car',
      'vé xe', 'vé tàu', 'vé máy bay', 'ticket', 'transportation', 'commute'
    ],
    'Y tế': [
      'y tế', 'bệnh viện', 'thuốc', 'khám', 'medical', 'hospital', 'medicine',
      'đi khám', 'bác sĩ', 'doctor', 'phòng khám', 'clinic', 'thuốc', 'medicine',
      'tái khám', 'khám bệnh', 'chữa bệnh', 'điều trị', 'phẫu thuật', 'surgery',
      'khám sức khỏe', 'check up', 'vaccine', 'tiền sử', 'insurance'
    ],
    'Giáo dục': [
      'giáo dục', 'học', 'sách', 'trường', 'education', 'school', 'book',
      'học phí', 'tiền học', 'tuition', 'sách', 'book', 'vở', 'bút', 'pen',
      'trường học', 'university', 'college', 'course', 'khóa học', 'class',
      'học thêm', 'gia sư', 'tutor', 'english', 'tiếng anh', 'language'
    ],
    'Du lịch': [
      'du lịch', 'khách sạn', 'vé máy bay', 'travel', 'hotel', 'flight',
      'đi chơi', 'đi du lịch', 'travel', 'trip', 'vacation', 'holiday',
      'khách sạn', 'hotel', 'resort', 'vé máy bay', 'flight', 'ticket',
      'vé tàu', 'train', 'bus', 'tour', 'guide', 'souvenir', 'quà lưu niệm'
    ],
    'Tiện ích': [
      'tiện ích', 'điện', 'nước', 'internet', 'utilities', 'electricity', 'water',
      'hóa đơn điện', 'hóa đơn nước', 'hóa đơn internet', 'hóa đơn wifi',
      'điện', 'electricity', 'nước', 'water', 'gas', 'khí gas', 'internet',
      'wifi', 'phone', 'điện thoại', 'mobile', 'cable', 'tv', 'television'
    ],
    'Mua sắm': [
      'mua sắm', 'shopping', 'mua', 'buy', 'purchase', 'shop', 'store',
      'siêu thị', 'supermarket', 'market', 'chợ', 'mall', 'trung tâm thương mại',
      'cửa hàng', 'shop', 'store', 'online', 'website', 'app', 'delivery'
    ]
  }
  
  // Score-based category matching
  let bestCategory = '';
  let bestScore = 0;
  
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        score += keyword.length; // Longer keywords get higher score
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat;
    }
  }
  
  category = bestCategory;
  
  // Extract description (use the full transcript as description)
  const description = text.trim();
  
  // Extract date with improved relative date handling
  let date = new Date().toISOString().split('T')[0]; // Default to today
  
  // Handle relative dates
  if (lowerText.includes('hom qua') || lowerText.includes('hôm qua')) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    date = yesterday.toISOString().split('T')[0];
  } else if (lowerText.includes('hom nay') || lowerText.includes('hôm nay')) {
    date = new Date().toISOString().split('T')[0];
  } else if (lowerText.includes('ngay mai') || lowerText.includes('ngày mai')) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    date = tomorrow.toISOString().split('T')[0];
  } else if (lowerText.includes('tuan truoc') || lowerText.includes('tuần trước')) {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    date = lastWeek.toISOString().split('T')[0];
  } else if (lowerText.includes('tuan sau') || lowerText.includes('tuần sau')) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    date = nextWeek.toISOString().split('T')[0];
  } else {
    // Look for specific date patterns
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
      /(\d{1,2})-(\d{1,2})-(\d{4})/,
      /(\d{4})-(\d{1,2})-(\d{1,2})/,
      /(\d{1,2})\/(\d{1,2})/ // MM/DD format (assume current year)
    ];
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        let day, month, year;
        if (match.length === 4) {
          [, day, month, year] = match;
          if (!year) year = new Date().getFullYear();
        } else {
          [, day, month] = match;
          year = new Date().getFullYear();
        }
        
        const parsedDate = new Date(year, month - 1, day);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate.toISOString().split('T')[0];
          break;
        }
      }
    }
  }
  
  return {
    category,
    amount,
    description,
    date
  };
}

// Function to check if browser supports voice recording
export function isVoiceRecordingSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && MediaRecorder);
}

// Function to request microphone permission
export async function requestMicrophonePermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    return false;
  }
}
