"use client";

import { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Typography,
} from "@mui/material";
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePhone,
  HiOutlineSwitchHorizontal,
  HiOutlinePlus,
} from "react-icons/hi";
import { EmployeeResponse, EmployeeStatus, BranchAssignmentResponse } from "@/api/types";
import { ConfirmDeleteModal, useToast } from "@/components/ui";
import { employeeService } from "@/api/services";

interface EmployeeTableProps {
  employees: EmployeeResponse[];
  employeeAssignments?: Map<string, BranchAssignmentResponse>; // Mapa de empleadoId -> asignación
  onEdit: (employee: EmployeeResponse) => void;
  onDelete?: (employeeId: string) => void;
  onPhonesClick?: (employee: EmployeeResponse) => void;
  onAssignBranch?: (employee: EmployeeResponse, currentAssignment: BranchAssignmentResponse | null) => void;
}

// Mapeo de estados a colores y labels
const STATUS_CONFIG: Record<
  EmployeeStatus,
  { label: string; color: "success" | "error" }
> = {
  ACTIVE: { label: "Activo", color: "success" },
  INACTIVE: { label: "Inactivo", color: "error" },
};

export default function EmployeeTable({
  employees,
  employeeAssignments,
  onEdit,
  onDelete,
  onPhonesClick,
  onAssignBranch,
}: EmployeeTableProps) {
  const { showSuccess, showError } = useToast();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] =
    useState<EmployeeResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (employee: EmployeeResponse) => {
    setEmployeeToDelete(employee);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;

    setDeleting(true);
    try {
      await employeeService.delete(employeeToDelete.id);
      showSuccess(
        `Empleado "${employeeToDelete.firstName} ${employeeToDelete.lastName}" eliminado`
      );
      onDelete?.(employeeToDelete.id);
      setDeleteModalOpen(false);
      setEmployeeToDelete(null);
    } catch (error) {
      console.error("Error deleting employee:", error);
      showError("Error al eliminar el empleado");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setEmployeeToDelete(null);
  };

  // Formatear fecha
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: "var(--color-background)",
          border: "1px solid var(--color-border)",
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "var(--color-surface)",
                "& th": {
                  fontWeight: 600,
                  color: "var(--color-text)",
                  borderBottom: "2px solid var(--color-border)",
                },
              }}
            >
              <TableCell>Empleado</TableCell>
              <TableCell>Documento</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Fecha contratación</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  sx={{
                    textAlign: "center",
                    py: 4,
                    color: "var(--color-text-muted)",
                  }}
                >
                  No hay empleados registrados
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow
                  key={employee.id}
                  sx={{
                    "&:hover": {
                      backgroundColor: "var(--color-surface)",
                    },
                    "& td": {
                      borderBottom: "1px solid var(--color-border)",
                    },
                  }}
                >
                  {/* Nombre */}
                  <TableCell>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, color: "var(--color-text)" }}
                      >
                        {employee.firstName} {employee.lastName}
                      </Typography>
                      {employee.institutionalEmail && (
                        <Typography
                          variant="caption"
                          sx={{ color: "var(--color-text-muted)" }}
                        >
                          {employee.institutionalEmail}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  {/* Documento */}
                  <TableCell>
                    {employee.docType && employee.docNumber ? (
                      <Typography variant="body2">
                        {employee.docType}: {employee.docNumber}
                      </Typography>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: "var(--color-text-muted)" }}
                      >
                        -
                      </Typography>
                    )}
                  </TableCell>

                  {/* Email personal */}
                  <TableCell>
                    {employee.personalEmail ? (
                      <Typography variant="body2">
                        {employee.personalEmail}
                      </Typography>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: "var(--color-text-muted)" }}
                      >
                        -
                      </Typography>
                    )}
                  </TableCell>

                  {/* Fecha contratación */}
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(employee.hireDate)}
                    </Typography>
                  </TableCell>

                  {/* Estado */}
                  <TableCell>
                    <Chip
                      label={STATUS_CONFIG[employee.status].label}
                      color={STATUS_CONFIG[employee.status].color}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>

                  {/* Acciones */}
                  <TableCell align="right">
                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                      {onPhonesClick && (
                        <Tooltip title="Teléfonos">
                          <IconButton
                            size="small"
                            onClick={() => onPhonesClick(employee)}
                            sx={{
                              color: "var(--color-text-muted)",
                              "&:hover": {
                                backgroundColor: "var(--color-info)",
                                color: "white",
                              },
                            }}
                          >
                            <HiOutlinePhone size={18} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onAssignBranch && (() => {
                        const assignment = employeeAssignments?.get(employee.id);
                        const hasAssignment = !!assignment;
                        return (
                          <Tooltip title={hasAssignment ? "Reasignar sucursal" : "Asignar sucursal"}>
                            <IconButton
                              size="small"
                              onClick={() => onAssignBranch(employee, assignment || null)}
                              sx={{
                                color: "var(--color-text-muted)",
                                "&:hover": {
                                  backgroundColor: hasAssignment ? "var(--color-primary)" : "var(--color-success)",
                                  color: "white",
                                },
                              }}
                            >
                              {hasAssignment ? (
                                <HiOutlineSwitchHorizontal size={18} />
                              ) : (
                                <HiOutlinePlus size={18} />
                              )}
                            </IconButton>
                          </Tooltip>
                        );
                      })()}
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(employee)}
                          sx={{
                            color: "var(--color-text-muted)",
                            "&:hover": {
                              backgroundColor: "var(--color-success)",
                              color: "white",
                            },
                          }}
                        >
                          <HiOutlinePencil size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(employee)}
                          sx={{
                            color: "var(--color-text-muted)",
                            "&:hover": {
                              backgroundColor: "var(--color-danger)",
                              color: "white",
                            },
                          }}
                        >
                          <HiOutlineTrash size={18} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de confirmación de eliminación */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Eliminar empleado"
        itemName={
          employeeToDelete
            ? `${employeeToDelete.firstName} ${employeeToDelete.lastName}`
            : undefined
        }
        loading={deleting}
      />
    </>
  );
}
