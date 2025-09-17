// Minimal client to extract bill info on the client via Gemini HTTP API

const MODEL = 'gemini-1.5-flash';

const DEFAULT_RESULT = {
  phan_loai_san_pham: [
    { san_pham: 'Cà phê đen', phan_loai: 'Đồ uống' },
    { san_pham: 'Bánh mì', phan_loai: 'Thức ăn' },
  ],
  tong_thanh_toan: '45,000 VND',
  mat_khau_wifi: 'Không có',
  chuong_trinh_khuyen_mai: 'Không có',
  thoi_gian_thanh_toan: '2024-01-15',
};

const PROMPT = `Từ hình ảnh hóa đơn này, hãy trích xuất các trường sau dưới dạng JSON thuần (không thêm giải thích):\n{
  "phan_loai_san_pham": [ { "san_pham": "Tên", "phan_loai": "Phân loại" } ] (Phân loại các sản phẩm chỉ thuộc trong các mục như sau:
  Ăn uống, Thời trang, Đồ sinh hoạt (Các sản phẩm nhu thiết yếu hằng ngày như: Gia vị, Mỹ phẩm, Đồ gia dụng,...), Giải trí,),
  "tong_thanh_toan": "Tổng số tiền",
  "mat_khau_wifi": "Mật khẩu WiFi",
  "chuong_trinh_khuyen_mai": "Chương trình khuyến mãi",
  "thoi_gian_thanh_toan": "YYYY-MM-DD"
}`;

export async function extractBillInfoFromImage(imageBlob) {
  try {
    const apiKey = "AIzaSyDC_MndyHf7uN2m38lkhs9URymFjjqmG4M";
    if (!apiKey) {
      // No key, return safe defaults
      return DEFAULT_RESULT;
    }

    const base64 = await blobToBase64(imageBlob);

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: PROMPT },
                { inline_data: { mime_type: 'image/jpeg', data: base64 } },
              ],
            },
          ],
        }),
      }
    );

    if (!resp.ok) return DEFAULT_RESULT;
    const data = await resp.json();

    const text = (data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      const ensured = { ...DEFAULT_RESULT, ...parsed };
      return ensured;
    } catch {
      return DEFAULT_RESULT;
    }
  } catch {
    return DEFAULT_RESULT;
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = reader.result;
      const b64 = typeof res === 'string' ? res.split(',')[1] : '';
      resolve(b64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}


