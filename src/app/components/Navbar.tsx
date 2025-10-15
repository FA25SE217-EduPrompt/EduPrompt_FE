"use client";
import Link from "next/link";
import UserMenu from "./UserMenu";

function Navbar() {
  // TODO: Thay bằng state thực tế, ví dụ lấy từ context hoặc localStorage
  const user = null; // Chưa đăng nhập thì user = null
  const isLoggedIn = !!user;
  return (
    <nav className="w-full bg-[#0a0d12] py-4 px-8 flex items-center justify-between shadow-sm">
      <div className="text-2xl font-extrabold text-black tracking-tight select-none">
        <span className="text-white">edu</span><span className="text-blue-800">/</span><span className="text-white">Prompt</span>
      </div>
      <div className="flex items-center gap-8">
        <Link href="#" className="text-base font-semibold text-white hover:underline underline-offset-4">Prompt Library</Link>
        <Link href="#" className="text-base font-semibold text-white hover:underline underline-offset-4">Blog</Link>
        <Link href="#" className="text-base font-semibold text-white hover:underline underline-offset-4">Pricing</Link>
        <Link href="#" className="text-base font-semibold text-white hover:underline underline-offset-4">Contact</Link>
        {!isLoggedIn && <Link href="/login" className="text-base font-semibold text-white hover:underline underline-offset-4">Login</Link>}
        {!isLoggedIn && <Link href="/register" className="ml-2 bg-[#2d23e6] hover:bg-[#1a0fbf] text-white font-semibold py-2 px-5 rounded-lg transition shadow text-base">Get Started</Link>}
        {isLoggedIn && <UserMenu user={user} />}
      </div>
    </nav>
  );
}

export default Navbar;


