"use client";

import Navbar from "./components/Navbar";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Home() {
	// Animation for pricing cards
	const cardsRef = useRef<Array<HTMLDivElement | null>>([]);
	const [showCards, setShowCards] = useState([false, false, false]);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const handleScroll = () => {
			cardsRef.current.forEach((card, idx) => {
				if (!card) return;
				const rect = card.getBoundingClientRect();
				if (rect.top < window.innerHeight - 100) {
					setShowCards((prev) => {
						if (prev[idx]) return prev;
						const next = [...prev];
						next[idx] = true;
						return next;
					});
				}
			});
		};
		window.addEventListener("scroll", handleScroll);
		handleScroll();
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	 const handleStartClick = () => {
		 if (typeof window !== "undefined") {
			 const token = localStorage.getItem("token");
			 if (token) {
				 window.location.href = "/prompts";
			 } else {
				 window.location.href = "/login";
			 }
		 }
	 };
	 return (
		 <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#f1f5f9]">
			 <Navbar />
			 {/* Hero Section */}
			 <header className="flex-1 flex flex-col justify-center items-center px-4 pt-24 pb-16 relative overflow-hidden">
				 <div className="absolute inset-0 pointer-events-none z-0">
					 <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-blue-100 rounded-full blur-3xl opacity-60" />
					 <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-blue-200 rounded-full blur-2xl opacity-40" />
				 </div>
				 <div className="max-w-3xl w-full flex flex-col items-center text-center z-10">
					 <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight drop-shadow-lg">
						 EduPrompt
					 </h1>
					 <p className="text-xl sm:text-2xl text-gray-700 mb-10 font-medium max-w-2xl mx-auto">
						 Khám phá, tạo mới và chia sẻ các prompt AI chất lượng cao. Đơn giản, nhanh chóng, hiệu quả cho mọi nhu cầu học tập, sáng tạo và làm việc.
					 </p>
					 <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-8">
						 <button
							 onClick={handleStartClick}
							 className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl shadow-lg transition text-xl cursor-pointer"
						 >
							 Bắt đầu ngay
						 </button>
					 </div>
				 </div>
				 <div className="mt-10 flex justify-center z-10">
					 <Image src="/globe.svg" alt="Hero Illustration" width={420} height={260} className="drop-shadow-2xl" />
				 </div>
			 </header>

					{/* Pricing Section */}
					<section className="w-full py-20 bg-transparent flex justify-center items-center">
						<div className="max-w-5xl w-full flex flex-col items-center">
							<h2 className="text-3xl sm:text-4xl font-extrabold text-[#23205a] mb-10 text-center">Simple transparent pricing</h2>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
											{/* BUSINESS */}
											<div
												  ref={el => { cardsRef.current[0] = el; }}
												className={`bg-gradient-to-br from-[#7b6cf6] to-[#5f4be6] rounded-2xl p-8 text-white shadow-xl flex flex-col items-center border-2 border-[#b3aaff] transition-all duration-700 hover:shadow-[0_0_32px_8px_rgba(123,108,246,0.4)] hover:border-[#7b6cf6] hover:scale-105
													${showCards[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}
												`}
												style={{ transitionDelay: showCards[0] ? '0ms' : '0ms' }}
											>
									<h3 className="text-xl font-extrabold mb-1 tracking-widest uppercase">BUSINESS</h3>
									<div className="text-lg font-semibold mb-2">Prompt + Chat Collaboration</div>
									<div className="text-5xl font-extrabold mb-1">$10</div>
									<div className="text-xs font-semibold mb-6 tracking-wide">PER USER/MONTH + CHAT AI API FEES</div>
									<hr className="w-full border-[#e0e7ef] mb-4" />
									<div className="w-full text-left mb-2 font-bold">Feature included:</div>
									<ul className="text-base space-y-2 mb-8 w-full">
										<li className="flex items-center gap-2"><span className="text-xl">✔</span> Unlimited chats</li>
										<li className="flex items-center gap-2"><span className="text-xl">✔</span> Chat collaboration</li>
										<li className="flex items-center gap-2"><span className="text-xl">✔</span> OpenAI GPT integration</li>
										<li className="flex items-center gap-2"><span className="text-xl">✔</span> Claude integration</li>
										<li className="flex items-center gap-2"><span className="text-xl">✔</span> Google Gemini integration</li>
										<li className="flex items-center gap-2"><span className="text-xl">✔</span> Bring Your Own API Keys</li>
										<li className="flex items-center gap-2"><span className="text-xl">+</span> Everything in TEAM</li>
									</ul>
									<a href="#" className="mt-auto w-full bg-white text-[#5f4be6] font-bold py-3 px-6 rounded-lg shadow hover:bg-[#ede9fe] transition text-center border-2 border-[#e0e7ef]">Get Started</a>
								</div>
								{/* TEAM */}
											<div
												  ref={el => { cardsRef.current[1] = el; }}
												className={`bg-[#f7f5ff] rounded-2xl p-8 text-[#23205a] shadow-xl flex flex-col items-center border-2 border-[#b3aaff] transition-all duration-700 hover:shadow-[0_0_32px_8px_rgba(123,108,246,0.2)] hover:border-[#7b6cf6] hover:scale-105
													${showCards[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}
												`}
												style={{ transitionDelay: showCards[1] ? '150ms' : '0ms' }}
											>
									<h3 className="text-xl font-extrabold mb-1 tracking-widest uppercase">TEAM</h3>
									<div className="text-lg font-semibold mb-2">Prompt Collaboration</div>
									<div className="text-5xl font-extrabold mb-1">$5</div>
									<div className="text-xs font-semibold mb-6 tracking-wide">PER USER/MONTH</div>
									<hr className="w-full border-[#b3aaff] mb-4" />
									<div className="w-full text-left mb-2 font-bold">Feature included:</div>
									<ul className="text-base space-y-2 mb-8 w-full">
										<li className="flex items-center gap-2"><span className="text-xl">✔</span> Prompt collaboration</li>
										<li className="flex items-center gap-2"><span className="text-xl">✔</span> Private sharing</li>
										<li className="flex items-center gap-2"><span className="text-xl">+</span> Everything in PERSONAL</li>
									</ul>
									<a href="#" className="mt-auto w-full bg-[#5f4be6] text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-[#7b6cf6] transition text-center">Get Started</a>
								</div>
								{/* PERSONAL */}
											<div
												  ref={el => { cardsRef.current[2] = el; }}
												className={`bg-[#faf8ff] rounded-2xl p-8 text-[#23205a] shadow-xl flex flex-col items-center border-2 border-[#b3aaff] transition-all duration-700 hover:shadow-[0_0_32px_8px_rgba(123,108,246,0.15)] hover:border-[#7b6cf6] hover:scale-105
													${showCards[2] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}
												`}
												style={{ transitionDelay: showCards[2] ? '300ms' : '0ms' }}
											>
									<h3 className="text-xl font-extrabold mb-1 tracking-widest uppercase">PERSONAL</h3>
									<div className="text-lg font-semibold mb-2">Prompts Organization</div>
									<div className="text-5xl font-extrabold mb-1">FREE</div>
									<div className="text-xs font-semibold mb-6 tracking-wide">NO CREDIT CARD NEEDED</div>
									<hr className="w-full border-[#b3aaff] mb-4" />
									<div className="w-full text-left mb-2 font-bold">Features included:</div>
									<ul className="text-base space-y-2 mb-8 w-full">
										<li className="flex items-center gap-2"><span className="text-xl">✔</span> Unlimited prompts</li>
										<li className="flex items-center gap-2"><span className="text-xl">✔</span> Public sharing links</li>
										<li className="flex items-center gap-2"><span className="text-xl">✔</span> Chrome extension</li>
									</ul>
									<a href="#" className="mt-auto w-full bg-[#5f4be6] text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-[#7b6cf6] transition text-center">Get Started (free)</a>
								</div>
							</div>
						</div>
					</section>

			{/* Footer mới */}
			<footer className="w-full bg-[#f5f3ff] pt-16 pb-6 mt-auto border-t border-[#e0e7ef]">
				<div className="max-w-4xl mx-auto flex flex-col items-center text-center">
											<h2 className="text-5xl font-extrabold text-[#23205a] mb-2">
												edu<span className="text-[#3b28c1]">/</span>Prompt
											</h2>
					<p className="text-lg text-gray-600 mb-6 max-w-2xl">
						eduPrompt lets you organize, share, and collaborate on AI prompts.<br/>
						You can use ChatGPT, Claude, and Gemini—all in one workspace.
					</p>
					<div className="flex gap-3 mb-6">
						<a href="#" className="bg-[#3b28c1] hover:bg-[#23205a] text-white rounded-md p-2 transition" aria-label="Twitter">
							<svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 5.924c-.793.352-1.646.59-2.54.697a4.48 4.48 0 0 0 1.965-2.475 8.94 8.94 0 0 1-2.828 1.082A4.48 4.48 0 0 0 11.2 9.03a12.72 12.72 0 0 1-9.24-4.684 4.48 4.48 0 0 0 1.39 5.98A4.44 4.44 0 0 1 2 9.13v.057a4.48 4.48 0 0 0 3.6 4.39c-.4.11-.82.17-1.25.17-.31 0-.6-.03-.89-.08a4.48 4.48 0 0 0 4.18 3.11A8.98 8.98 0 0 1 2 19.54a12.7 12.7 0 0 0 6.88 2.02c8.26 0 12.78-6.84 12.78-12.77 0-.19-.01-.37-.02-.56A9.1 9.1 0 0 0 24 4.59a8.93 8.93 0 0 1-2.54.7z"/></svg>
						</a>
						<a href="#" className="bg-[#3b28c1] hover:bg-[#23205a] text-white rounded-md p-2 transition" aria-label="LinkedIn">
							<svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm15.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z"/></svg>
						</a>
						<a href="#" className="bg-[#3b28c1] hover:bg-[#23205a] text-white rounded-md p-2 transition" aria-label="YouTube">
							<svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.454 3.5 12 3.5 12 3.5s-7.454 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 8.12 0 12 0 12s0 3.88.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.546 20.5 12 20.5 12 20.5s7.454 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 15.88 24 12 24 12s0-3.88-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
						</a>
					</div>
					<div className="flex flex-wrap justify-center gap-6 mb-6 text-lg">
						<a href="#" className="text-[#3b28c1] hover:underline font-medium">Prompt Library</a>
						<a href="#" className="text-[#3b28c1] hover:underline font-medium">Blog</a>
						<a href="#" className="text-[#3b28c1] hover:underline font-medium">Pricing</a>
						<a href="#" className="text-[#3b28c1] hover:underline font-medium">Contact</a>
						<a href="/login" className="text-[#3b28c1] hover:underline font-medium">Login</a>
						<a href="/register" className="text-[#3b28c1] hover:underline font-medium">Get Started (free)</a>
					</div>
					<hr className="w-full border-t border-[#e0e7ef] mb-4" />
								{/* footer links removed as requested */}
				</div>
			</footer>
		</div>
	);


