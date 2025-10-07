"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      // Gọi API quên mật khẩu ở đây (giả lập)
      await new Promise((res) => setTimeout(res, 1200));
      setSuccess("Vui lòng kiểm tra email để đặt lại mật khẩu!");
    } catch (err) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#f1f5f9] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-extrabold text-center text-[#23205a] mb-2">Quên mật khẩu</h2>
        <p className="text-center text-gray-500 mb-8">Nhập email để nhận liên kết đặt lại mật khẩu</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7b6cf6] focus:border-[#7b6cf6] text-base"
              placeholder="Nhập email của bạn"
              disabled={loading}
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center">{success}</div>}
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-[#5f4be6] hover:bg-[#7b6cf6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b6cf6] transition"
            disabled={loading}
          >
            {loading ? "Đang gửi..." : "Gửi liên kết đặt lại mật khẩu"}
          </button>
        </form>
        <div className="mt-6 flex justify-between text-sm">
          <button
            className="text-[#5f4be6] hover:underline font-medium"
            onClick={() => router.push("/login")}
            type="button"
          >
            Đăng nhập
          </button>
          <button
            className="text-[#5f4be6] hover:underline font-medium"
            onClick={() => router.push("/register")}
            type="button"
          >
            Đăng ký
          </button>
        </div>
      </div>
    </div>
  );
}
