"use client";
import { useState } from "react";
import { loginUser } from "../../api/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState("");
  const [userInfo, setUserInfo] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Đăng nhập bằng email và password
      const res = await loginUser({ email, password });
      setMessage("Đăng nhập thành công!");
      router.push("/prompts");
      setUserInfo(res);
    } catch (err: any) {
      setMessage("Đăng nhập thất bại: " + (err.response?.data?.message || err.message));
      setUserInfo(null);
    }
  };

  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <div className="mb-4 flex flex-col items-center">
        </div>
        <h2 className="text-lg font-semibold mb-1 text-gray-700">Welcome to</h2>
        <h1 className="text-2xl font-bold mb-6 text-gray-900 text-center">EduPromt System</h1>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <label className="text-gray-600 text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-blue-400 text-gray-900"
            required
            spellCheck={false}
          />
          <label className="text-gray-600 text-sm">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-blue-400 text-gray-900"
            required
            spellCheck={false}
          />
          <div className="flex items-center justify-between mt-1 mb-2">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="remember" className="text-gray-600 text-sm">Lưu mật khẩu</label>
            </div>
            <a href="/forgot-password" className="text-blue-500 text-sm hover:underline">Quên Mật khẩu?</a>
          </div>
          <button type="submit" className="bg-blue-400 text-white py-2 rounded font-semibold hover:bg-blue-500 transition text-lg">Đăng Nhập</button>
        </form>
        <div className="w-full flex items-center my-4">
          <div className="flex-grow h-px bg-gray-200" />
          <span className="mx-2 text-gray-400">Hoặc</span>
          <div className="flex-grow h-px bg-gray-200" />
        </div>
        <div className="flex gap-4 w-full mb-4">
          <button className="flex-1 flex items-center justify-center border border-gray-300 rounded py-2 bg-white hover:bg-blue-400 hover:text-white transition cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 48 48" className="mr-2"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.36 30.13 0 24 0 14.82 0 6.73 5.8 2.69 14.09l7.98 6.2C12.13 13.09 17.57 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.64 7.01l7.19 5.6C43.98 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.29a14.5 14.5 0 010-8.58l-7.98-6.2A23.94 23.94 0 000 24c0 3.77.9 7.34 2.69 10.49l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.13 0 11.64-2.03 15.53-5.53l-7.19-5.6c-2.01 1.35-4.6 2.16-8.34 2.16-6.43 0-11.87-3.59-14.33-8.79l-7.98 6.2C6.73 42.2 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
            <span className="text-gray-700 font-semibold text-base">Google</span>
          </button>
          <button className="flex-1 flex items-center justify-center border border-gray-300 rounded py-2 bg-white hover:bg-blue-400 hover:text-white transition gap-2 cursor-pointer">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="14" fill="#1877F2"/>
              <path d="M18.5 14H16V22H13V14H11.5V11.5H13V10.25C13 8.73 13.67 7.5 15.5 7.5H18V10H16.75C16.34 10 16 10.17 16 10.75V11.5H18L17.5 14Z" fill="white"/>
            </svg>
            <span className="text-gray-700 font-semibold text-base">Facebook</span>
          </button>
        </div>
        <div className="text-center text-gray-500 text-sm">
          Bạn chưa có tài khoản?{' '}
          <a href="/register" className="text-blue-500 font-semibold hover:underline">Đăng kí ngay</a>
        </div>
        {message && <div className={`mt-4 text-center ${message.includes('thành công') ? 'text-green-600' : 'text-red-500'}`}>{message}</div>}
      </div>
    </div>
  );
}
