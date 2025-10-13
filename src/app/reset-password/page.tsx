"use client";
import { useState } from "react";
import { resetPassword } from "../../api/auth";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const res = await resetPassword({ token, newPassword });
      setMessage("Đặt lại mật khẩu thành công! " + JSON.stringify(res));
    } catch (err: any) {
      setMessage("Đặt lại mật khẩu thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#f1f5f9] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-extrabold text-center text-[#23205a] mb-2">Đặt lại mật khẩu</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">Token</label>
            <input
              id="token"
              name="token"
              type="text"
              required
              value={token}
              onChange={e => setToken(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-base text-gray-900"
              placeholder="Nhập token từ email"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-base text-gray-900"
              placeholder="Nhập mật khẩu mới"
              disabled={loading}
            />
          </div>
          {message && <div className={message.includes("thành công") ? "text-green-600 text-sm text-center" : "text-red-500 text-sm text-center"}>{message}</div>}
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-[#5f4be6] hover:bg-[#7b6cf6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b6cf6] transition"
            disabled={loading}
          >
            {loading ? "Đang gửi..." : "Đặt lại mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
}
