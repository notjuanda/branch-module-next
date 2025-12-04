"use client";

import { useParams } from "next/navigation";
import { BranchLandingPage } from "@/app/features/users";

export default function BranchSlugPage() {
  const params = useParams();
  const slug = params.slug as string;

  return <BranchLandingPage slug={slug} />;
}
