"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

export function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-primary/30 overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt="User Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-pink-100 flex items-center justify-center text-primary">
            <User size={20} />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg ring-1 ring-black/5 py-2 z-50 transform origin-top-right transition-all">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {session.user.name || "아이돌 마스터"}
            </p>
            <p className="text-xs text-gray-500 truncate mt-1">
              {session.user.email}
            </p>
          </div>
          <div className="py-1">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
