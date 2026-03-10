"use client";

import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 font-sans">
      <div className="bg-white/90 p-10 rounded-3xl shadow-xl border-2 border-pink-200 text-center max-w-md w-full backdrop-blur-sm mx-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-4 drop-shadow-sm tracking-tight font-['Fredoka']">✨ 아이돌 육성 클리커 ✨</h1>
        <p className="text-gray-600 mb-8 leading-relaxed font-semibold">
          구글 계정으로 로그인하여 진행 상황을<br />클라우드에 안전하게 저장하세요.
        </p>
        <button
          onClick={() => signIn('google', { callbackUrl: '/game' })}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-bold py-3.5 px-6 rounded-xl border border-gray-300 shadow-sm hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-md transition-all text-lg"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google Logo" className="w-6 h-6" />
          Google로 시작하기
        </button>
      </div>
    </div>
  );
}
