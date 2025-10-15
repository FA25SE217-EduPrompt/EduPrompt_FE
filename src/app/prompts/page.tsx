"use client";
import React from "react";

export default function PromptsPage() {
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 flex flex-col pt-6 px-4 bg-white">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-[#6c63ff] flex items-center justify-center">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <rect
                width="18"
                height="18"
                x="3"
                y="3"
                rx="4"
                fill="white"
              />
              <rect
                width="18"
                height="18"
                x="3"
                y="3"
                rx="4"
                fill="#6c63ff"
                fillOpacity=".2"
              />
            </svg>
          </div>
          <span className="font-bold text-xl text-gray-900">Prompts</span>
        </div>
        <nav>
          <ul className="mb-6">
            <li>
              <a
                href="#"
                className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-[#6c63ff] bg-[#f3f0ff]"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M3 12l9-9 9 9"
                    stroke="#6c63ff"
                    strokeWidth="2"
                  />
                </svg>{" "}
                All
              </a>
            </li>
            <li className="mt-1">
              <a
                href="#"
                className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="8"
                    stroke="#bdbdbd"
                    strokeWidth="2"
                  />
                </svg>{" "}
                Unsorted
              </a>
            </li>
          </ul>
          <div className="mt-8">
            <div className="border border-dashed rounded-lg p-4 text-center text-gray-500 bg-[#fafbfc]">
              <div className="mb-2 font-semibold flex items-center justify-center gap-2">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <rect
                    x="4"
                    y="6"
                    width="16"
                    height="12"
                    rx="2"
                    stroke="#bdbdbd"
                    strokeWidth="2"
                  />
                  <path d="M12 10v4M10 12h4" stroke="#bdbdbd" strokeWidth="2" />
                </svg>
                Create a folder
              </div>
              <div className="text-xs">
                You can use the + sign above to add more later.
              </div>
            </div>
          </div>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white relative">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                d="M3 12l9-9 9 9"
                stroke="#6c63ff"
                strokeWidth="2"
              />
            </svg>
            <span className="font-bold text-lg text-gray-900">
              All Prompts
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-[#f8f9fb] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6c63ff]"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                    stroke="#bdbdbd"
                    strokeWidth="2"
                  />
                  <path
                    d="M21 21l-4.35-4.35"
                    stroke="#bdbdbd"
                    strokeWidth="2"
                  />
                </svg>
              </span>
            </div>
            <button className="bg-[#6c63ff] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#5548c8] transition"
              onClick={() => window.location.href = '/prompts'}>
              + New Prompt
            </button>
            <button className="border px-4 py-2 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition">
              Getting Started Guide
            </button>
            {/* Avatar NV góc phải trên header */}
            <div className="flex items-center gap-4">
              <button
                className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold shadow border-2 border-white focus:outline-none relative"
                id="user-menu-trigger"
                onClick={() => {
                  const menu = document.getElementById('user-menu-popup');
                  if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                }}
              >
                NV
              </button>
              <div
                id="user-menu-popup"
                style={{ display: 'none', position: 'absolute', right: 0, top: '100%' }}
                className="w-56 bg-white text-gray-900 rounded-xl shadow-xl border border-gray-200 z-50"
              >
                <ul className="py-2">
                  <li><a href="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded transition"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" stroke="#23205a" strokeWidth="1.5"/></svg> Profile</a></li>
                  <li><a href="/settings" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded transition"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 00.12-.65l-1.92-3.32a.5.5 0 00-.61-.22l-2.39.96a7.007 7.007 0 00-1.62-.94l-.36-2.53A.5.5 0 0014 2h-4a.5.5 0 00-.5.42l-.36 2.53c-.59.22-1.14.52-1.62.94l-2.39-.96a.5.5 0 00-.61.22l-1.92 3.32a.5.5 0 00.12.65l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 00-.12.65l1.92 3.32c.14.24.44.32.68.22l2.39-.96c.48.42 1.03.72 1.62.94l.36 2.53c.05.28.27.48.5.48h4c.23 0 .45-.2.5-.48l.36-2.53c.59-.22 1.14-.52 1.62-.94l2.39.96c.24.1.54.02.68-.22l1.92-3.32a.5.5 0 00-.12-.65l-2.03-1.58zM12 15.5A3.5 3.5 0 1112 8a3.5 3.5 0 010 7.5z" stroke="#23205a" strokeWidth="1.5"/></svg> Settings</a></li>
                  <li><a href="/billing" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded transition"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2" stroke="#23205a" strokeWidth="1.5"/><path d="M2 10h20" stroke="#23205a" strokeWidth="1.5"/><circle cx="7" cy="14" r="1" fill="#23205a"/></svg> Billing</a></li>
                  <li><a href="/team" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded transition"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05C17.16 13.36 19 14.28 19 15.5V19h5v-2.5c0-2.33-4.67-3.5-7-3.5z" stroke="#23205a" strokeWidth="1.5"/></svg> Team</a></li>
                  <li><a href="/import" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded transition"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" stroke="#23205a" strokeWidth="1.5"/><path d="M12 8v5m0 0l-2-2m2 2l2-2" stroke="#23205a" strokeWidth="1.5"/></svg> Import Prompts</a></li>
                  <li><a href="/chrome-extension" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded transition"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#23205a" strokeWidth="1.5"/><path d="M8 12h8M12 8v8" stroke="#23205a" strokeWidth="1.5"/></svg> Chrome Extension</a></li>
                  <li className="border-t border-gray-200 mt-2"><button className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded transition" onClick={() => { window.location.href = '/login'; }}><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M16 17l5-5m0 0l-5-5m5 5H9" stroke="#23205a" strokeWidth="1.5"/><rect x="3" y="3" width="12" height="18" rx="2" stroke="#23205a" strokeWidth="1.5"/></svg> Sign Out</button></li>
                </ul>
              </div>
            </div>
          </div>
        </header>
        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="border rounded-lg p-8 flex flex-col items-center bg-white">
              <svg
                width="48"
                height="48"
                fill="none"
                viewBox="0 0 48 48"
                className="mb-2"
              >
                <rect
                  x="8"
                  y="14"
                  width="32"
                  height="20"
                  rx="4"
                  fill="#f3f0ff"
                  stroke="#bdbdbd"
                  strokeWidth="2"
                />
                <path d="M24 22v8M20 26h8" stroke="#bdbdbd" strokeWidth="2" />
              </svg>
              <div className="font-semibold text-gray-700 mb-1">No prompts</div>
              <div className="text-gray-500 mb-4">
                Get started by adding a prompt.
              </div>
              <button className="bg-[#6c63ff] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#5548c8] transition">
                + New Prompt
              </button>
              <button className="border px-4 py-2 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition mt-2">
                Getting Started Guide
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
