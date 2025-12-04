import { EmployeesPage } from "@/app/features/employees/pages";
import { ProtectedRoute } from "@/app/features/auth";

export default function EmployeesRoute() {
  return (
    <ProtectedRoute>
      <EmployeesPage />
    </ProtectedRoute>
  );
}
