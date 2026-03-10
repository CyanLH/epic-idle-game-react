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
          style={{ 
            padding: '12px 24px', 
            fontSize: '1.2rem', 
            cursor: 'pointer', 
            borderRadius: '12px', 
            border: '1px solid #e1e4e8', 
            background: 'white', 
            color: '#3c4043', 
            fontWeight: '600',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '12px',
            width: '100%',
            transition: 'background-color 0.2s, box-shadow 0.2s, border-color 0.2s'
          }}
          onMouseOver={(e) => { 
            e.currentTarget.style.backgroundColor = '#f8f9fa'; 
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.08)'; 
            e.currentTarget.style.borderColor = '#d2d6dc';
          }}
          onMouseOut={(e) => { 
            e.currentTarget.style.backgroundColor = 'white'; 
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'; 
            e.currentTarget.style.borderColor = '#e1e4e8';
          }}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
            </g>
          </svg>
          Google 계정으로 계속하기
        </button>
      </div>
    </div>
  );
}
