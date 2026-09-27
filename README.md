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
- **Ý nghĩa thực tế:** Hỗ trợ nhà trường, giáo viên và phụ huynh nhận diện sớm những học sinh có nguy cơ đạt điểm kém để kịp thời điều chỉnh thời gian tự học, bài tập ôn luyện và thời gian nghỉ ngơi

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
- Đường dẫn file lưu trữ: `ai-models/models/model.joblib` (kèm theo `schema.json` và `metadata.json`).

---

## 6. Kiến trúc hệ thống
Frontend (Next.js)
       │
       ▼
Backend (Node.js + Express)
       │
       ├──────────────────────► MongoDB Atlas (Lưu lịch sử & Trace request_id)
       │
       ▼
AI Service (FastAPI + scikit-learn)

Luồng xử lý: Người dùng nhập thông tin trên Frontend, Backend nhận request gửi sang AI Service để tính toán điểm số từ mô hình Linear Regression, sau đó ghi log lịch sử kèm request_id vào MongoDB Atlas và trả kết quả về giao diện cho người dùng.

---

## 7. Chạy trên máy
Yêu cầu: đã cài Docker Desktop và Git.

Clone repository và cấu hình biến môi trường:

Bash
git clone [https://github.com/TiepLe1307/06_12523092_10123314_DiemThiHocSinh.git](https://github.com/TiepLe1307/06_12523092_10123314_DiemThiHocSinh.git)
cd 06_12523092_10123314_DiemThiHocSinh
cp .env.example .env
Khởi động hệ thống bằng Docker Compose:

Bash
docker compose up -d --build
Kiểm tra trạng thái service:

Bash
docker compose ps

---

## 8. Huấn luyện lại model
Huấn luyện lại mô hình thông qua Google Colab và chạy theo đúng thứ tự các notebook tại thư mục ai-models/colab/:
01_eda.ipynb → 02_preprocess.ipynb → 03_train.ipynb → 04_evaluate.ipynb.

---

## 9. Biến môi trường
| Biến | Ý nghĩa |
|---|---|
| `AI_SERVICE_PORT` | Cổng chạy AI Service |
| `BACKEND_PORT` | Cổng chạy Backend |
| `FRONTEND_PORT` | Cổng chạy Frontend |
| `AI_SERVICE_URL` | Địa chỉ Backend gọi tới AI Service |
| `DATABASE_URI` | Chuỗi kết nối cơ sở dữ liệu MongoDB Atlas |
| `NEXT_PUBLIC_API_URL` | Địa chỉ Frontend gọi tới Backend (https://diem-thi-backend.onrender.com) |

---

## 10. Triển khai
Hệ thống được triển khai phân tán trên các nền tảng Cloud:

Frontend: Triển khai trực tiếp trên Vercel tại https://dthi.vercel.app/.

Backend: Triển khai trên Render tại https://diem-thi-backend.onrender.com.

AI Service: Kết nối qua Ngrok Tunnel (https://sequester-unclaimed-leggings.ngrok-free.dev) khi gọi từ môi trường production trên Render.

---

## 11. Demo online
Frontend URL: https://dthi.vercel.app/

Backend Health Check: https://diem-thi-backend.onrender.com/health

---

## 12. Nhật ký đổi cổng/tunnel
| Thời điểm | Địa chỉ cũ | Địa chỉ mới | Ghi chú |
|Thời điểmĐịa chỉ cũĐịa chỉ mớiGhi chúTriển khai đợt 1|---|https://sequester-unclaimed-leggings.ngrok-free.dev| Ngrok tunnel kết nối AI Service |

---

## 13. Kết quả kiểm thử hiệu năng
Unit & Integration Tests:

AI Service tests: 5/5 PASS

Backend tests: 4/4 PASS (Bao gồm test validate dữ liệu lỗi 400 Bad Request khi truyền sai định dạng Extracurricular Activities: "Maybe").

Load / Performance Test (50 request đồng thời):

Success count: 50 / 50

Failure count: 0

Latency (Local): Min ~46.75 ms, Max ~114.77 ms, Trung bình ~51.73 ms.

---

## 14. Hạn chế và hướng phát triển
Hạn chế:

Mô hình hiện tại dựa trên bộ dữ liệu tĩnh với số lượng đặc trưng (features) còn hạn chế, chưa cập nhật theo thời gian thực từ các kỳ thi thực tế.

Sử dụng Ngrok miễn phí dẫn đến URL có thể thay đổi khi khởi động lại tunnel.

Hướng phát triển:

Mở rộng thêm các đặc trưng đầu vào (như thời gian tự học online, mức độ chuyên cần, thu nhập gia đình).

Triển khai AI Service lên các cloud hosting chuyên dụng (như AWS ECS, Google Cloud Run hoặc Render) để loại bỏ hoàn toàn sự phụ thuộc vào Ngrok.

Nâng cấp giao diện quản lý lịch sử dự đoán (History Dashboard) trực quan hơn cho người dùng.