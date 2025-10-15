import { useState } from "react";
import { useRouter } from "next/navigation";

type UserMenuProps = {
  user?: { name?: string };
};

export default function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const initials = user?.name ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase() : "NV";

  const handleSignOut = () => {
    // Xóa token, trạng thái đăng nhập nếu có
    setOpen(false);
    router.push("/login");
  };

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold focus:outline-none"
        onClick={() => setOpen(v => !v)}
      >
        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#23205a] text-white font-bold text-lg">{initials}</span>
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#23205a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/></svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-[#181a20] text-white rounded-xl shadow-xl z-50 border border-gray-800">
          <div className="px-4 py-3 font-bold text-base border-b border-gray-700">{user?.name || "User"}</div>
          <ul className="py-2">
            <li><a href="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded transition text-gray-700"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" stroke="#6c63ff" strokeWidth="1.5"/></svg> Profile</a></li>
            <li><a href="/settings" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded transition text-gray-700"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 00.12-.65l-1.92-3.32a.5.5 0 00-.61-.22l-2.39.96a7.007 7.007 0 00-1.62-.94l-.36-2.53A.5.5 0 0014 2h-4a.5.5 0 00-.5.42l-.36 2.53c-.59.22-1.14.52-1.62.94l-2.39-.96a.5.5 0 00-.61.22l-1.92 3.32a.5.5 0 00.12.65l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 00-.12.65l1.92 3.32c.14.24.44.32.68.22l2.39-.96c.48.42 1.03.72 1.62.94l.36 2.53c.05.28.27.48.5.48h4c.23 0 .45-.2.5-.48l.36-2.53c.59-.22 1.14-.52 1.62-.94l2.39.96c.24.1.54.02.68-.22l1.92-3.32a.5.5 0 00-.12-.65l-2.03-1.58zM12 15.5A3.5 3.5 0 1112 8a3.5 3.5 0 010 7.5z" stroke="#6c63ff" strokeWidth="1.5"/></svg> Settings</a></li>
            <li><a href="/billing" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded transition text-gray-700"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2" stroke="#6c63ff" strokeWidth="1.5"/><path d="M2 10h20" stroke="#6c63ff" strokeWidth="1.5"/><circle cx="7" cy="14" r="1" fill="#6c63ff"/></svg> Billing</a></li>
            <li><a href="/team" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded transition text-gray-700"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05C17.16 13.36 19 14.28 19 15.5V19h5v-2.5c0-2.33-4.67-3.5-7-3.5z" stroke="#6c63ff" strokeWidth="1.5"/></svg> Team</a></li>
            <li><a href="/import" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded transition text-gray-700"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" stroke="#6c63ff" strokeWidth="1.5"/><path d="M12 8v5m0 0l-2-2m2 2l2-2" stroke="#6c63ff" strokeWidth="1.5"/></svg> Import Prompts</a></li>
            <li><a href="/chrome-extension" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded transition text-gray-700"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#6c63ff" strokeWidth="1.5"/><path d="M8 12h8M12 8v8" stroke="#6c63ff" strokeWidth="1.5"/></svg> Chrome Extension</a></li>
            <li className="border-t border-gray-200 mt-2"><button className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded transition text-gray-700" onClick={handleSignOut}><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M16 17l5-5m0 0l-5-5m5 5H9" stroke="#6c63ff" strokeWidth="1.5"/><rect x="3" y="3" width="12" height="18" rx="2" stroke="#6c63ff" strokeWidth="1.5"/></svg> Sign Out</button></li>
          </ul>
        </div>
      )}
    </div>
  );
}
