import sys
import json
import pandas as pd
from prophet import Prophet
import traceback

def main():
    try:
        # 1️⃣ Đọc dữ liệu từ stdin
        raw_input = sys.stdin.read()
        data = json.loads(raw_input)

        # 2️⃣ Kiểm tra dữ liệu
        if not data or len(data) < 2:
            print(json.dumps({"error": "Cần ít nhất 2 dữ liệu để dự đoán"}))
            sys.exit(1)

        # 3️⃣ Chuyển thành DataFrame
        df = pd.DataFrame(data)
        df['ds'] = pd.to_datetime(df['ds'])
        df['y'] = df['y'].astype(float)

        # 4️⃣ Lấy param từ Node.js (freq và số bước dự đoán)
        # Nếu Node.js gửi 'periods' và 'freq' trong stdin, parse thêm
        periods = 1
        freq = 'MS'  # MS = đầu tháng, D = theo ngày
        if len(sys.argv) > 1:
            try:
                periods = int(sys.argv[1])
            except:
                pass
        if len(sys.argv) > 2:
            freq_arg = sys.argv[2].lower()
            if freq_arg in ['month', 'm']:
                freq = 'MS'

        # 5️⃣ Khởi tạo và fit mô hình Prophet
        model = Prophet()
        model.fit(df)

        # 6️⃣ Dự đoán
        future = model.make_future_dataframe(periods=periods, freq=freq)
        forecast = model.predict(future)

        # 7️⃣ Lấy giá trị dự đoán cho các bước tiếp theo
        predictions = forecast.iloc[-periods:]['yhat'].round(2).tolist()

        # 8️⃣ Trả kết quả về Node.js
        print(json.dumps({"prediction": predictions}))

    except Exception as e:
        # Log lỗi chi tiết ra stderr
        print(traceback.format_exc(), file=sys.stderr)
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
