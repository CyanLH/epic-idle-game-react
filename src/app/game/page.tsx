"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import App from "../../App";

export default function GamePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const storeUser = useMutation(api.users.storeUser);
  const [convexUserId, setConvexUserId] = useState<Id<"users"> | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Sync user with Convex once authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email && !convexUserId) {
      storeUser({
        email: session.user.email,
        name: session.user.name || undefined,
        image: session.user.image || undefined,
      }).then((id) => {
        setConvexUserId(id);
      }).catch(console.error);
    }
  }, [status, session, convexUserId, storeUser]);

// Helper to get safe convex ID
  const getConvexUserId = () => {
    if (convexUserId === null) return undefined;
    if (typeof convexUserId === 'string') return convexUserId as Id<"users">;
    return convexUserId as Id<"users"> | undefined;
  };

  const safeUserId = getConvexUserId();

  // Load initial game data from Convex
  const initialGameData = useQuery(
    api.game.loadGame,
    safeUserId ? { userId: safeUserId } : "skip"
  );

  if (status === 'loading' || !initialGameData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-pink-50 text-gray-800">
        <h2 className="text-xl font-bold text-primary mb-3">인증 및 서버 데이터 연동 중...</h2>
        <div className="w-8 h-8 border-4 border-primary border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <App 
      convexUserId={safeUserId} 
      initialServerData={initialGameData} 
    />
  );
}
