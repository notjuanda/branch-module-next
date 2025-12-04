"use client";

import { useState, useEffect, useCallback } from "react";
import { EmployeeResponse } from "@/api/types";
import { employeeService } from "@/api/services";

interface UseEmployeesReturn {
  employees: EmployeeResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEmployees(): UseEmployeesReturn {
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.list();
      setEmployees(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar empleados"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    loading,
    error,
    refetch: fetchEmployees,
  };
}
