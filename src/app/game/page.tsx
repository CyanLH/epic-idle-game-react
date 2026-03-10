"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import App from "../../App";
import { Id } from "../../../convex/_generated/dataModel";

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

  // Load initial game data from Convex
  const initialGameData = useQuery(
    api.game.loadGame,
    convexUserId ? { userId: convexUserId } : "skip"
  );

  if (status === "loading" || status === "unauthenticated" || !convexUserId || initialGameData === undefined) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fff0f5' }}>
        <h2>인증 및 서버 데이터 연동 중...</h2>
      </div>
    );
  }

  return (
    <App 
      convexUserId={convexUserId} 
      initialServerData={initialGameData} 
    />
  );
}
