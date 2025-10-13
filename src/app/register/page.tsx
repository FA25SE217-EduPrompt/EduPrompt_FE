"use client";
import { useState } from "react";
import { registerUser } from "../../api/auth";
import Image from "next/image";

export default function RegisterPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== rePassword) {
      setMessage("Mật khẩu không khớp!");
      return;
    }
    try {
      // Gửi dữ liệu đăng ký, có thể cần chỉnh lại key cho đúng backend
  const res = await registerUser({ email, password, firstName, lastName, phoneNumber });
      setMessage("Đăng ký thành công! " + JSON.stringify(res));
    } catch (err: any) {
      setMessage("Đăng ký thất bại: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <div className="mb-4 flex flex-col items-center">
        </div>
        <h2 className="text-lg font-semibold mb-1 text-gray-700">Welcome to</h2>
        <h1 className="text-2xl font-bold mb-6 text-gray-900 text-center">EduPromt System</h1>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <label className="text-gray-600 text-sm">Số điện thoại</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-blue-400 text-gray-900"
            required
            spellCheck={false}
          />
          <label className="text-gray-600 text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-blue-400 text-gray-900"
            required
          />
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-gray-600 text-sm">Họ</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-blue-400 text-gray-900 w-full"
                required
              />
            </div>
            <div className="flex-1">
              <label className="text-gray-600 text-sm">Tên</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-blue-400 text-gray-900 w-full"
                required
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-gray-600 text-sm">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-blue-400 text-gray-900"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(s => !s)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-5.12M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.36 2.64A9.97 9.97 0 0021 12c0-5-4-9-9-9S3 7 3 12c0 1.61.38 3.13 1.05 4.45M9.88 9.88L3 3m0 0l18 18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.36 2.64A9.97 9.97 0 0021 12c0-5-4-9-9-9S3 7 3 12c0 1.61-.38 3.13-1.05 4.45m1.32 2.13A9.97 9.97 0 0012 21c5 0 9-4 9-9 0-1.61-.38-3.13-1.05-4.45" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="flex-1">
              <label className="text-gray-600 text-sm">Nhập lại Password</label>
              <div className="relative">
                <input
                  type={showRePassword ? "text" : "password"}
                  value={rePassword}
                  onChange={e => setRePassword(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-blue-400 text-gray-900"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowRePassword(s => !s)}
                  tabIndex={-1}
                >
                  {showRePassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-5.12M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.36 2.64A9.97 9.97 0 0021 12c0-5-4-9-9-9S3 7 3 12c0 1.61.38 3.13 1.05 4.45M9.88 9.88L3 3m0 0l18 18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.36 2.64A9.97 9.97 0 0021 12c0-5-4-9-9-9S3 7 3 12c0 1.61-.38 3.13-1.05 4.45m1.32 2.13A9.97 9.97 0 0012 21c5 0 9-4 9-9 0-1.61-.38-3.13-1.05-4.45" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          <button type="submit" className="bg-blue-400 text-white py-2 rounded font-semibold hover:bg-blue-500 transition text-lg mt-2">Đăng Kí</button>
        </form>
        {message && <div className="mt-4 text-red-500 text-center">{message}</div>}
      </div>
    </div>
  );
}
