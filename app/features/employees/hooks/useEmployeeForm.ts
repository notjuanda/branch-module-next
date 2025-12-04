"use client";

import { useState } from "react";
import { EmployeeResponse } from "@/api/types";

interface UseEmployeeFormReturn {
  isOpen: boolean;
  employeeToEdit: EmployeeResponse | null;
  openCreate: () => void;
  openEdit: (employee: EmployeeResponse) => void;
  close: () => void;
}

export function useEmployeeForm(): UseEmployeeFormReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<EmployeeResponse | null>(
    null
  );

  const openCreate = () => {
    setEmployeeToEdit(null);
    setIsOpen(true);
  };

  const openEdit = (employee: EmployeeResponse) => {
    setEmployeeToEdit(employee);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setEmployeeToEdit(null);
  };

  return {
    isOpen,
    employeeToEdit,
    openCreate,
    openEdit,
    close,
  };
}
