"use client";

import { ChatbotAuthProvider } from "@/app/features/users";

export default function BranchLandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatbotAuthProvider>
      {children}
    </ChatbotAuthProvider>
  );
}
