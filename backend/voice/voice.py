# from openai import OpenAI

# # Khởi tạo client
# client = OpenAI(api_key="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")

# # Đường dẫn file audio (định dạng .mp3, .wav, .m4a, ...)
# audio_file = open("audio/au2.mp3", "rb")

# # Gọi API Whisper để chuyển đổi thành văn bản
# transcript = client.audio.transcriptions.create(
#     model="whisper-1",
#     file=audio_file
# )

# print("Kết quả nhận diện giọng nói:")
# print(transcript.text)

import sounddevice as sd
from scipy.io.wavfile import write
from openai import OpenAI

# Cấu hình
SAMPLE_RATE = 16000  # Whisper hoạt động tốt ở 16kHz
DURATION = 5         # thời gian ghi âm (giây)

print("🎤 Bắt đầu ghi âm...")
recording = sd.rec(int(DURATION * SAMPLE_RATE), samplerate=SAMPLE_RATE, channels=1, dtype="int16")
sd.wait()  # Chờ ghi âm xong
print("✅ Ghi âm xong!")

# Lưu file WAV tạm
filename = "recorded_audio.wav"
write(filename, SAMPLE_RATE, recording)

# Gọi Whisper API
client = OpenAI(api_key="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")

with open(filename, "rb") as audio_file:
    transcript = client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file
    )

print("📝 Kết quả nhận diện giọng nói:")
print(transcript.text)

