# BÀI TẬP LỚN HỌC MÁY: DỰ ĐOÁN ĐIỂM THI CỦA HỌC SINH

## 1. Thành viên

| Họ tên            | MSSV     | Phần việc                                                            |
| ----------------- | -------- | -------------------------------------------------------------------- |
| Nguyễn Quốc Tưởng | 12523092 | Xây dựng cấu trúc dự án, EDA, huấn luyện mô hình AI, Docker & Tunnel |
| Lê Tiến Tiệp      | 10123314 | Phát triển Backend/Frontend, kiểm thử hệ thống, tài liệu & báo cáo   |

## 2. Bài toán

* **Mô tả:** Dự đoán `Performance Index` của học sinh dựa trên thời gian học, điểm số trước đó, hoạt động ngoại khóa, thời gian ngủ và số lượng đề luyện tập.
* **Loại bài toán:** Hồi quy (Regression).
* **Cột mục tiêu:** `Performance Index`, thang điểm từ 10 đến 100.
* **Ý nghĩa thực tế:** Hỗ trợ tham khảo kết quả học tập dự kiến dựa trên các đặc điểm đầu vào của học sinh.

## 3. Dữ liệu

* **Nguồn:** [Kaggle – Student Performance Multiple Linear Regression Dataset](https://www.kaggle.com/datasets/nikhil7280/student-performance-multiple-linear-regression).
* **Quy mô:** 10.000 mẫu, 5 thuộc tính đầu vào và 1 biến mục tiêu.
* **Các thuộc tính đầu vào:**

  * `Hours Studied`
  * `Previous Scores`
  * `Extracurricular Activities`
  * `Sleep Hours`
  * `Sample Question Papers Practiced`
* **Biến mục tiêu:** `Performance Index`
* Dữ liệu và hướng dẫn được lưu tại thư mục `data/`.

## 4. Kết quả mô hình

Sau quá trình huấn luyện và đánh giá, các mô hình được so sánh bằng MAE, RMSE và R².

| Model                 |          MAE |         RMSE |           R² |
| --------------------- | -----------: | -----------: | -----------: |
| **Linear Regression** | **1.646970** | **2.075066** | **0.988430** |
| Decision Tree         |     2.433249 |     3.050595 |     0.974995 |
| Random Forest         |     1.895022 |     2.369629 |     0.984912 |
| KNN                   |     2.361418 |     2.959169 |     0.976471 |

Mô hình được lựa chọn là **Linear Regression** với R² trên tập kiểm tra đạt **0.988430**.

## 5. Đóng gói model

Các file model được lưu tại:

```text
models/
├── model.joblib
├── schema.json
└── metadata.json
```

Trong đó:

* `model.joblib`: mô hình Linear Regression đã huấn luyện.
* `schema.json`: thông tin schema đầu vào.
* `metadata.json`: thông tin phiên bản và metadata của model.

## 6. Kiến trúc hệ thống

```text
Người dùng
    │
    ▼
Frontend (Next.js)
    │
    ▼
Backend (Node.js + Express)
    │
    ├──────────────► MongoDB Atlas
    │                 (lưu lịch sử dự đoán)
    │
    ▼
Ngrok Tunnel
    │
    ▼
AI Service (FastAPI + scikit-learn)
    │
    ▼
Linear Regression Model
```

Luồng xử lý: Người dùng nhập thông tin trên Frontend → Frontend gửi request đến Backend → Backend kiểm tra dữ liệu → Backend gọi AI Service thông qua Ngrok → AI Service thực hiện dự đoán → Backend lưu kết quả và lịch sử vào MongoDB Atlas → trả kết quả về Frontend.

## 7. Chạy trên máy

### Yêu cầu

* Docker Desktop
* Git
* Node.js và Python không bắt buộc nếu chạy toàn bộ hệ thống bằng Docker.

### Clone project

```bash
git clone https://github.com/TiepLe1307/06_12523092_10123314_DiemThiHocSinh.git
cd 06_12523092_10123314_DiemThiHocSinh
```

### Khởi động Docker

```bash
docker compose up --build -d
```

Kiểm tra các service:

```bash
docker compose ps
```

Các service chính:

```text
Frontend    → http://localhost:3000
Backend     → http://localhost:8000
AI Service  → http://localhost:8001
```

Kiểm tra AI Service:

```bash
curl http://localhost:8001/health
```

Kết quả mong đợi:

```json
{
  "status": "ok",
  "model_loaded": true
}
```

## 8. Test API dự đoán

### API

```text
POST https://diem-thi-hoc-sinh.onrender.com/api/predict
```

### Input bắt buộc

API yêu cầu đầy đủ 5 trường:

```text
Hours Studied
Previous Scores
Extracurricular Activities
Sleep Hours
Sample Question Papers Practiced
```

Ví dụ request:

```json
{
  "Hours Studied": 7,
  "Previous Scores": 85,
  "Extracurricular Activities": "Yes",
  "Sleep Hours": 7,
  "Sample Question Papers Practiced": 5
}
```

`request_id` là trường không bắt buộc. Nếu không truyền, Backend sẽ tự tạo UUID.

### Test bằng PowerShell

```powershell
$body = @{
    "Hours Studied" = 7
    "Previous Scores" = 85
    "Extracurricular Activities" = "Yes"
    "Sleep Hours" = 7
    "Sample Question Papers Practiced" = 5
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "https://diem-thi-hoc-sinh.onrender.com/api/predict" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

Ví dụ kết quả:

```text
request_id    : d4e2098c-88fb-4b39-a086-84b3b249c63e
prediction    : 77.36
target        : Performance Index
model         : Linear Regression
model_version : 1.0.0
```

### Test bằng curl

```bash
curl -X POST "https://diem-thi-hoc-sinh.onrender.com/api/predict" \
-H "Content-Type: application/json" \
-d "{\"Hours Studied\":7,\"Previous Scores\":85,\"Extracurricular Activities\":\"Yes\",\"Sleep Hours\":7,\"Sample Question Papers Practiced\":5}"
```

### Kiểm tra lỗi dữ liệu

Ví dụ `Extracurricular Activities` chỉ chấp nhận:

```text
Yes
No
```

Nếu truyền giá trị khác như:

```json
"Extracurricular Activities": "Maybe"
```

API trả HTTP `400` với dạng:

```json
{
  "error": "invalid_input",
  "detail": "Dữ liệu không khớp schema yêu cầu.",
  "request_id": "..."
}
```

## 9. Huấn luyện lại model

Các notebook được thực hiện theo thứ tự:

```text
ai-models/colab/
├── 01_eda.ipynb
├── 02_preprocess.ipynb
├── 03_train.ipynb
└── 04_evaluate.ipynb
```

Thứ tự thực hiện:

```text
01_eda → 02_preprocess → 03_train → 04_evaluate
```

## 10. Biến môi trường

| Biến                  | Ý nghĩa                             |
| --------------------- | ----------------------------------- |
| `AI_SERVICE_URL`      | Địa chỉ Backend gọi tới AI Service  |
| `DATABASE_URL`        | Chuỗi kết nối MongoDB Atlas         |
| `NEXT_PUBLIC_API_URL` | Địa chỉ Backend mà Frontend gọi tới |
| `PORT`                | Cổng chạy Backend                   |

Các biến môi trường chứa thông tin kết nối được cấu hình riêng trên môi trường triển khai và không đưa thông tin bí mật lên GitHub.

## 11. Triển khai

Hệ thống được triển khai theo kiến trúc:

```text
Frontend  → Vercel
Backend   → Render
AI Service → Docker local + Ngrok Tunnel
Database  → MongoDB Atlas
```

### Frontend

```text
https://dthi.vercel.app/
```

### Backend

```text
https://diem-thi-hoc-sinh.onrender.com
```

### AI Service

AI Service chạy trong Docker ở máy local và được public thông qua Ngrok:

```text
https://sequester-unclaimed-leggings.ngrok-free.dev
```

Lưu ý: Ngrok miễn phí có thể thay đổi URL khi tạo tunnel mới. Khi URL thay đổi, cần cập nhật biến `AI_SERVICE_URL` trên Render Backend.

## 12. Demo online

### Frontend

```text
https://dthi.vercel.app/
```

### Backend Health Check

```text
https://diem-thi-hoc-sinh.onrender.com/health
```

### API dự đoán

```text
https://diem-thi-hoc-sinh.onrender.com/api/predict
```

Method:

```text
POST
```

Content-Type:

```text
application/json
```

## 13. Kiểm thử hệ thống

### AI Service

```text
5/5 tests PASS
```

### Backend

```text
4/4 tests PASS
```

Trong đó có kiểm thử validate dữ liệu đầu vào không hợp lệ, ví dụ `Extracurricular Activities = "Maybe"` phải trả HTTP `400 Bad Request`.

### Load Test

Thực hiện kiểm thử với 50 request đồng thời:

```text
Success: 50/50
Failure: 0
Latency Local:
- Min: ~46.75 ms
- Max: ~114.77 ms
- Average: ~51.73 ms
```

## 14. Nhật ký đổi Tunnel

| Thời điểm           | Địa chỉ cũ | Địa chỉ mới                                           | Ghi chú                             |
| ------------------- | ---------- | ----------------------------------------------------- | ----------------------------------- |
| Triển khai hiện tại | —          | `https://sequester-unclaimed-leggings.ngrok-free.dev` | Ngrok Tunnel kết nối tới AI Service |

## 15. Hạn chế và hướng phát triển

### Hạn chế

* Mô hình sử dụng bộ dữ liệu tĩnh, chưa cập nhật dữ liệu học sinh theo thời gian thực.
* Số lượng đặc trưng đầu vào còn hạn chế.
* Ngrok miễn phí có thể thay đổi URL khi khởi động lại tunnel.
* AI Service hiện phụ thuộc vào máy local để duy trì tunnel khi sử dụng hệ thống production.

### Hướng phát triển

* Bổ sung thêm các đặc trưng như thời gian học online, mức độ chuyên cần và các yếu tố liên quan đến quá trình học tập.
* Triển khai AI Service lên cloud hosting chuyên dụng như AWS, Google Cloud Run hoặc Render để loại bỏ phụ thuộc vào Ngrok.
* Phát triển History Dashboard trực quan hơn để theo dõi lịch sử dự đoán.
* Bổ sung thêm các phương pháp đánh giá và theo dõi chất lượng model khi có dữ liệu mới.
