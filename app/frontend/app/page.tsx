'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [formData, setFormData] = useState({
    "Hours Studied": 5,
    "Previous Scores": 75,
    "Extracurricular Activities": "Yes",
    "Sleep Hours": 7,
    "Sample Question Papers Practiced": 3
  });

  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : value
    });
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);

    try {
      const response = await axios.get(`${BACKEND_URL}/api/history`);
      setHistory(response.data.data || []);
    } catch (err) {
      console.error('Lỗi lấy lịch sử:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const request_id = crypto.randomUUID();

      const response = await axios.post(
        `${BACKEND_URL}/api/predict`,
        {
          ...formData,
          request_id
        }
      );

      setResult(response.data);

      fetchHistory();
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'Đã xảy ra lỗi khi kết nối đến Backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('vi-VN');
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-md">

        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Dự đoán Chỉ số Học tập
        </h1>

        <p className="text-sm text-gray-500 mb-6 text-center">
          Hệ thống Học máy Cơ bản - Nhóm dự án
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hours Studied (Số giờ học):
            </label>
            <input
              type="number"
              name="Hours Studied"
              value={formData["Hours Studied"]}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Previous Scores (Điểm trước đây):
            </label>
            <input
              type="number"
              name="Previous Scores"
              value={formData["Previous Scores"]}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Extracurricular Activities (Hoạt động ngoại khóa):
            </label>
            <select
              name="Extracurricular Activities"
              value={formData["Extracurricular Activities"]}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm text-black"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sleep Hours (Số giờ ngủ):
            </label>
            <input
              type="number"
              name="Sleep Hours"
              value={formData["Sleep Hours"]}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sample Question Papers Practiced (Số đề luyện tập):
            </label>
            <input
              type="number"
              name="Sample Question Papers Practiced"
              value={formData["Sample Question Papers Practiced"]}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm text-black"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition font-medium cursor-pointer"
          >
            {loading ? 'Đang xử lý...' : 'Dự đoán kết quả'}
          </button>

        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            <strong>Lỗi:</strong> {error}
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <h2 className="text-lg font-semibold text-green-800 mb-2">
              Kết quả dự đoán:
            </h2>

            <p className="text-gray-700">
              <strong>Performance Index:</strong> {result.prediction}
            </p>

            <p className="text-xs text-gray-500 mt-2">
              Request ID: {result.request_id}
            </p>
          </div>
        )}

        <div className="mt-8 border-t pt-6">

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Lịch sử dự đoán
            </h2>

            <button
              type="button"
              onClick={fetchHistory}
              disabled={historyLoading}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {historyLoading ? 'Đang tải...' : 'Làm mới'}
            </button>
          </div>

          {history.length === 0 && !historyLoading && (
            <p className="text-sm text-gray-500 text-center py-4">
              Chưa có lịch sử dự đoán.
            </p>
          )}

          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.request_id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">
                    {formatDate(item.createdAt)}
                  </span>

                  <span className="text-lg font-bold text-indigo-600">
                    {item.prediction}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                  <p>
                    <strong>Giờ học:</strong> {item.hours_studied}
                  </p>

                  <p>
                    <strong>Điểm trước:</strong> {item.previous_scores}
                  </p>

                  <p>
                    <strong>Ngoại khóa:</strong>{' '}
                    {item.extracurricular_activities}
                  </p>

                  <p>
                    <strong>Giờ ngủ:</strong> {item.sleep_hours}
                  </p>

                  <p className="col-span-2">
                    <strong>Số đề luyện:</strong>{' '}
                    {item.sample_question_papers_practiced}
                  </p>
                </div>

                <p className="text-xs text-gray-400 mt-3 break-all">
                  Request ID: {item.request_id}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </main>
  );
}