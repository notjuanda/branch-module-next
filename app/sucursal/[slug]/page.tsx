"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  BranchLandingPage,
  ChatbotProtectedRoute,
  ChatbotLoginPage,
} from "@/app/features/users";

export default function BranchSlugPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <ChatbotProtectedRoute
      fallback={<ChatbotLoginPage onSuccess={handleLoginSuccess} />}
    >
      <BranchLandingPage slug={slug} />
    </ChatbotProtectedRoute>
  );
}
