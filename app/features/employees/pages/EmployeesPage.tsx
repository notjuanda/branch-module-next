"use client";

import { useState, useEffect, useCallback } from "react";
import { Typography, Button, Skeleton, Alert, Box } from "@mui/material";
import { HiOutlinePlus, HiOutlineRefresh } from "react-icons/hi";
import {
  EmployeeTable,
  EmployeeFormModal,
  ReassignBranchModal,
} from "../components";
import { useEmployees, useEmployeeForm } from "../hooks";
import { EmployeeResponse, BranchAssignmentResponse, BranchResponse } from "@/api/types";
import { assignmentService, branchService } from "@/api/services";

export default function EmployeesPage() {
  const { employees, loading, error, refetch } = useEmployees();
  const {
    isOpen: isFormOpen,
    employeeToEdit,
    openCreate,
    openEdit,
    close: closeForm,
  } = useEmployeeForm();

  // Mapa de asignaciones de empleados
  const [employeeAssignments, setEmployeeAssignments] = useState<Map<string, BranchAssignmentResponse>>(new Map());
  const [branches, setBranches] = useState<Map<string, BranchResponse>>(new Map());
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // Estado para modal de reasignación/asignación
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [employeeToAssign, setEmployeeToAssign] = useState<EmployeeResponse | null>(null);
  const [currentAssignment, setCurrentAssignment] = useState<BranchAssignmentResponse | null>(null);

  // Cargar asignaciones de todos los empleados
  const fetchAssignments = useCallback(async () => {
    if (employees.length === 0) return;

    setLoadingAssignments(true);
    try {
      // Cargar sucursales para obtener nombres
      const allBranches = await branchService.list();
      const branchMap = new Map<string, BranchResponse>();
      allBranches.forEach((b: BranchResponse) => branchMap.set(b.id, b));
      setBranches(branchMap);

      // Cargar asignaciones de cada empleado
      const assignmentMap = new Map<string, BranchAssignmentResponse>();
      await Promise.all(
        employees.map(async (emp) => {
          try {
            const assignment = await assignmentService.getActiveByEmployee(emp.id);
            if (assignment) {
              assignmentMap.set(emp.id, assignment);
            }
          } catch {
            // Empleado sin asignación
          }
        })
      );
      setEmployeeAssignments(assignmentMap);
    } catch (err) {
      console.error("Error loading assignments:", err);
    } finally {
      setLoadingAssignments(false);
    }
  }, [employees]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleFormSuccess = () => {
    refetch();
  };

  const handleDelete = () => {
    refetch();
  };

  const handleAssignBranch = (employee: EmployeeResponse, assignment: BranchAssignmentResponse | null) => {
    setEmployeeToAssign(employee);
    setCurrentAssignment(assignment);
    setAssignModalOpen(true);
  };

  const handleAssignSuccess = () => {
    refetch();
    fetchAssignments();
  };

  const closeAssignModal = () => {
    setAssignModalOpen(false);
    setEmployeeToAssign(null);
    setCurrentAssignment(null);
  };

  // Obtener nombre de sucursal actual
  const getCurrentBranchName = () => {
    if (!currentAssignment) return null;
    const branch = branches.get(currentAssignment.branchId);
    return branch?.name || null;
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          mb: 4,
        }}
      >
        <div>
          <Typography
            variant="h4"
            component="h1"
            fontWeight={700}
            sx={{
              color: "var(--color-text)",
              fontSize: { xs: "1.5rem", sm: "2rem" },
            }}
          >
            Empleados
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "var(--color-text-muted)", mt: 0.5 }}
          >
            Gestiona todos los empleados del sistema
          </Typography>
        </div>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={<HiOutlineRefresh size={18} />}
            onClick={() => {
              refetch();
              fetchAssignments();
            }}
            disabled={loading || loadingAssignments}
            size="small"
            sx={{
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
              "&:hover": {
                borderColor: "var(--color-primary)",
                backgroundColor: "rgba(0, 50, 84, 0.04)",
              },
            }}
          >
            Refrescar
          </Button>
          <Button
            variant="contained"
            startIcon={<HiOutlinePlus size={18} />}
            onClick={openCreate}
            size="small"
            sx={{
              backgroundColor: "var(--color-success)",
              color: "var(--color-text-light)",
              "&:hover": {
                backgroundColor: "var(--color-success-hover)",
              },
            }}
          >
            Nuevo empleado
          </Button>
        </Box>
      </Box>

      {/* Error */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={refetch}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Loading */}
      {(loading || loadingAssignments) && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={60}
              sx={{ borderRadius: 1 }}
            />
          ))}
        </Box>
      )}

      {/* Tabla */}
      {!loading && !loadingAssignments && !error && (
        <EmployeeTable
          employees={employees}
          employeeAssignments={employeeAssignments}
          onEdit={openEdit}
          onDelete={handleDelete}
          onAssignBranch={handleAssignBranch}
        />
      )}

      {/* Modal de formulario */}
      <EmployeeFormModal
        open={isFormOpen}
        onClose={closeForm}
        employee={employeeToEdit}
        onSuccess={handleFormSuccess}
      />

      {/* Modal de asignación/reasignación */}
      <ReassignBranchModal
        open={assignModalOpen}
        onClose={closeAssignModal}
        employee={employeeToAssign}
        currentBranchId={currentAssignment?.branchId || null}
        currentBranchName={getCurrentBranchName()}
        isFirstAssignment={!currentAssignment}
        onSuccess={handleAssignSuccess}
      />
    </Box>
  );
}
