import { BranchesPage } from "@/app/features/branches/pages";
import { ProtectedRoute } from "@/app/features/auth";

export default function BranchesRoute() {
  return (
    <ProtectedRoute>
      <BranchesPage />
    </ProtectedRoute>
  );
}
