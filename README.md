# BÀI TẬP LỚN HỌC MÁY: DỰ ĐOÁN ĐIỂM THI CỦA HỌC SINH

---

## 1. Thành viên
| Họ tên | MSSV | Phần việc |
|---|---|---|
| Nguyễn Quốc Tưởng | 12523092 | Xây dựng cấu trúc dự án, Phân tích dữ liệu (EDA), Huấn luyện mô hình AI, Đóng gói Docker & Tunnel. |
| Lê Tiến Tiệp | 10123314 | Phát triển ứng dụng Backend/Frontend, Kiểm thử hệ thống, Viết tài liệu & Báo cáo. |

---

## 2. Bài toán
- **Mô tả:** Dự đoán kết quả học tập / chỉ số điểm thi của học sinh dựa trên các đặc điểm quá trình tự học, kết quả kỳ thi trước và thói quen sinh hoạt.
- **Loại bài toán:** Hồi quy (Regression).
- **Cột mục tiêu:** `Performance Index` (Thang điểm từ 10.0 đến 100.0).
- **Ý nghĩa thực tế:** Hỗ trợ nhà trường, giáo viên và phụ huynh nhận diện sớm những học sinh có nguy cơ đạt điểm kém để kịp thời điều chỉnh thời gian tự học, bài tập ôn luyện và thời gian nghỉ ngơi.

---

## 3. Dữ liệu
- **Nguồn:** [Kaggle – Student Performance Multiple Linear Regression Dataset](https://www.kaggle.com/datasets/nikhil7280/student-performance-multiple-linear-regression).
- **Giấy phép:** Public Domain / CC0.
- **Quy mô:** 10,000 mẫu, 5 thuộc tính đầu vào (định lượng & định tính) + 1 nhãn mục tiêu.
- **Chi tiết cột & cách giải nén:** xem [`ai-models/data/DATA.md`](ai-models/data/DATA.md).

---

## 4. Kết quả model

| Model | Metric chính (R² Score) | Metric phụ (MAE) | Metric phụ (MSE) | Train/Test time | Predict time | File size | Nhận xét |
|---|---|---|---|---|---|---|---|
| **Linear Regression** | **0.9887** | **1.61** | **4.15** | **~0.05s** | **< 1ms** | **~2 KB** | **Tối ưu nhất: Độ chính xác vượt trội, chi phí tính toán rất thấp.** |
| Decision Tree | 0.9621 | 2.15 | 12.30 | ~0.12s | < 1ms | ~45 KB | Bị overfitting nhẹ trên tập dữ liệu nhỏ. |
| Random Forest | 0.9782 | 1.82 | 7.95 | ~1.45s | ~5ms | ~1.2 MB | Hiệu năng cao nhưng kích thước file lớn. |
| KNN Regressor | 0.9510 | 2.40 | 16.20 | ~0.02s | ~15ms | ~350 KB | Dự đoán chậm khi số lượng mẫu tăng. |
| Support Vector (SVR) | 0.9815 | 1.73 | 6.80 | ~0.85s | ~2ms | ~180 KB | Thời gian huấn luyện lâu hơn Linear Regression. |

---

## 5. Đóng gói model
- Đường dẫn file lưu trữ: `ai-models/models/linear_regression_model.pkl` (hoặc `model.joblib`), kèm theo các file `schema.json` và `metadata.json`.

---

## 6. Kiến trúc hệ thống
[Frontend] → [Backend] → [AI Service] → (trả kết quả ngược lại)
                 ↓
             [Database] (lưu lịch sử dự đoán)

Luồng xử lý: Người dùng nhập thông tin trên Frontend, Backend nhận request gửi sang AI Service để tính toán điểm số từ mô hình Linear Regression, sau đó lưu kết quả vào Database và trả về giao diện cho người dùng.

---

## 7. Chạy trên máy
Yêu cầu: đã cài **Docker Desktop**.

`cp .env.example .env`
`docker compose up --build`

⚠️ Dockerfile của `ai-models/service`, `app/backend`, `app/frontend` đang được hoàn thiện và chạy đồng bộ thông qua Docker Compose.

---

## 8. Huấn luyện lại model
Huấn luyện lại mô hình thông qua Google Colab và chạy theo đúng thứ tự các notebook: `01_eda` → `02_preprocess` → `03_train` → `04_evaluate`.

---

## 9. Biến môi trường
| Biến | Ý nghĩa |
|---|---|
| `AI_SERVICE_PORT` | Cổng chạy AI Service |
| `BACKEND_PORT` | Cổng chạy Backend |
| `FRONTEND_PORT` | Cổng chạy Frontend |
| `AI_SERVICE_URL` | Địa chỉ Backend gọi tới AI Service |
| `DATABASE_URI` | Chuỗi kết nối cơ sở dữ liệu |
| `API_URL` | Địa chỉ Frontend gọi tới Backend |

---

## 10. Triển khai
Sử dụng Ngrok / Cloudflare Tunnel để public ứng dụng từ môi trường local lên Internet. Mỗi khi khởi động lại cổng tunnel, cập nhật lại địa chỉ mới vào file README.md và thực hiện commit đẩy lên GitHub.

---

## 11. Demo online
sẽ cập nhật sau

---

## 12. Nhật ký đổi cổng/tunnel
| Thời điểm | Địa chỉ cũ | Địa chỉ mới |
|---|---|---|

---

## 13. Kết quả kiểm thử hiệu năng


---

## 14. Hạn chế và hướng phát triển
