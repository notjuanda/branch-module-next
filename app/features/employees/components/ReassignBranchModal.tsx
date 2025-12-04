"use client";

import { useState, useEffect } from "react";
import { Modal, useToast } from "@/components/ui";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Chip,
} from "@mui/material";
import {
  HiOutlineSwitchHorizontal,
  HiOutlineOfficeBuilding,
  HiOutlinePlus,
} from "react-icons/hi";
import { BranchResponse, EmployeeResponse } from "@/api/types";
import { assignmentService, branchService } from "@/api/services";

interface ReassignBranchModalProps {
  open: boolean;
  onClose: () => void;
  employee: EmployeeResponse | null;
  currentBranchId?: string | null;
  currentBranchName?: string | null;
  isFirstAssignment?: boolean; // true si no tiene sucursal asignada
  onSuccess?: () => void;
}

export default function ReassignBranchModal({
  open,
  onClose,
  employee,
  currentBranchId,
  currentBranchName,
  isFirstAssignment = false,
  onSuccess,
}: ReassignBranchModalProps) {
  const { showSuccess, showError, showWarning } = useToast();
  const [loading, setLoading] = useState(false);
  const [reassigning, setReassigning] = useState(false);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [position, setPosition] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [positionError, setPositionError] = useState<string>("");

  // Cargar sucursales
  useEffect(() => {
    const fetchBranches = async () => {
      if (!open) return;

      setLoading(true);
      setSelectedBranchId("");
      setPosition("");
      setNotes("");
      setPositionError("");
      try {
        const allBranches = await branchService.list();
        // Si es primera asignación, mostrar todas las activas
        // Si es reasignación, filtrar la sucursal actual
        const available = allBranches.filter(
          (b: BranchResponse) => b.active && (isFirstAssignment || b.id !== currentBranchId)
        );
        setBranches(available);

        if (available.length === 0) {
          showWarning(isFirstAssignment 
            ? "No hay sucursales disponibles para asignar"
            : "No hay otras sucursales disponibles para reasignar"
          );
        }
      } catch (error) {
        console.error("Error loading branches:", error);
        showError("Error al cargar las sucursales");
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [open, currentBranchId, isFirstAssignment, showError, showWarning]);

  const handleReassign = async () => {
    if (!employee || !selectedBranchId) {
      showWarning("Selecciona una sucursal");
      return;
    }

    // Validar cargo obligatorio
    if (!position.trim()) {
      setPositionError("El cargo es obligatorio");
      showWarning("El cargo es obligatorio");
      return;
    }
    setPositionError("");

    setReassigning(true);
    try {
      if (isFirstAssignment) {
        // Primera asignación
        await assignmentService.assignToBranch(employee.id, selectedBranchId, {
          position: position.trim(),
          notes: notes || undefined,
        });
        showSuccess(
          `${employee.firstName} ${employee.lastName} asignado correctamente a la sucursal`
        );
      } else {
        // Reasignación
        await assignmentService.reassignToBranch(employee.id, selectedBranchId, {
          position: position.trim(),
          notes: notes || undefined,
        });
        showSuccess(
          `${employee.firstName} ${employee.lastName} reasignado correctamente. El teléfono corporativo ha sido liberado.`
        );
      }
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      console.error("Error assigning employee:", error);
      const message =
        error instanceof Error
          ? error.message
          : isFirstAssignment 
            ? "Error al asignar el empleado"
            : "Error al reasignar el empleado";
      showError(message);
    } finally {
      setReassigning(false);
    }
  };

  const handleClose = () => {
    setSelectedBranchId("");
    setPosition("");
    setNotes("");
    setPositionError("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="sm"
      title={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {isFirstAssignment ? (
            <HiOutlinePlus size={24} />
          ) : (
            <HiOutlineSwitchHorizontal size={24} />
          )}
          <Typography variant="h6" component="span">
            {isFirstAssignment ? "Asignar a sucursal" : "Reasignar a otra sucursal"}
          </Typography>
        </Box>
      }
      subtitle={
        employee ? `${employee.firstName} ${employee.lastName}` : undefined
      }
      showCloseButton
      transition="fade"
    >
      <Box sx={{ minHeight: 200 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: 200,
              gap: 2,
            }}
          >
            <CircularProgress sx={{ color: "var(--color-primary)" }} />
            <Typography color="text.secondary">
              Cargando sucursales...
            </Typography>
          </Box>
        ) : branches.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: 200,
              gap: 2,
              color: "var(--color-text-muted)",
            }}
          >
            <HiOutlineOfficeBuilding size={48} />
            <Typography textAlign="center">
              No hay otras sucursales disponibles
            </Typography>
          </Box>
        ) : (
          <>
            {/* Sucursal actual (solo si es reasignación) */}
            {!isFirstAssignment && currentBranchName && (
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 1,
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ 
                    color: "var(--color-text-muted)", 
                    textTransform: "uppercase",
                    fontWeight: 500,
                    letterSpacing: "0.5px",
                  }}
                >
                  Sucursal actual
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                  <HiOutlineOfficeBuilding size={18} />
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "var(--color-text)" }}>
                    {currentBranchName}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Warning sobre teléfono (solo si es reasignación) */}
            {!isFirstAssignment && (
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 1,
                  backgroundColor: "rgba(234, 179, 8, 0.1)",
                  border: "1px solid var(--color-warning)",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "var(--color-warning)", fontWeight: 500 }}
                >
                  Al reasignar, el teléfono corporativo actual quedará
                  disponible en la sucursal de origen.
                </Typography>
              </Box>
            )}

            <Typography
              variant="body2"
              sx={{ color: "var(--color-text-muted)", mb: 2 }}
            >
              Selecciona la nueva sucursal:
            </Typography>

            <RadioGroup
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
            >
              {branches.map((branch) => (
                <FormControlLabel
                  key={branch.id}
                  value={branch.id}
                  control={
                    <Radio
                      sx={{
                        color: "var(--color-primary)",
                        "&.Mui-checked": {
                          color: "var(--color-primary)",
                        },
                      }}
                    />
                  }
                  label={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        py: 0.5,
                      }}
                    >
                      <HiOutlineOfficeBuilding size={18} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {branch.name}
                      </Typography>
                      <Chip
                        label={branch.active ? "Activa" : "Inactiva"}
                        color={branch.active ? "success" : "error"}
                        size="small"
                        sx={{ height: 20, fontSize: "0.7rem" }}
                      />
                    </Box>
                  }
                  sx={{
                    mx: 0,
                    mb: 1,
                    p: 1,
                    borderRadius: 1,
                    border: "1px solid var(--color-border)",
                    "&:hover": {
                      backgroundColor: "var(--color-surface)",
                    },
                    ...(selectedBranchId === branch.id && {
                      borderColor: "var(--color-primary)",
                      backgroundColor: "rgba(0, 50, 84, 0.04)",
                    }),
                  }}
                />
              ))}
            </RadioGroup>

            {/* Campos */}
            <Box
              sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                label="Cargo"
                value={position}
                onChange={(e) => {
                  setPosition(e.target.value);
                  if (e.target.value.trim()) setPositionError("");
                }}
                size="small"
                fullWidth
                required
                error={!!positionError}
                helperText={positionError || "El cargo del empleado en esta sucursal"}
                placeholder="Ej: Gerente, Vendedor, Cajero..."
              />
              <TextField
                label="Notas (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                size="small"
                fullWidth
                multiline
                rows={2}
                placeholder="Notas sobre la asignación..."
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 3,
                pt: 2,
                borderTop: "1px solid var(--color-border)",
              }}
            >
              <Button
                variant="outlined"
                onClick={handleClose}
                disabled={reassigning}
                sx={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleReassign}
                disabled={!selectedBranchId || !position.trim() || reassigning}
                sx={{
                  backgroundColor: isFirstAssignment ? "var(--color-success)" : "var(--color-primary)",
                  "&:hover": {
                    backgroundColor: isFirstAssignment ? "var(--color-success-hover)" : "var(--color-primary-hover)",
                  },
                }}
              >
                {reassigning ? (
                  <CircularProgress size={20} sx={{ color: "white" }} />
                ) : isFirstAssignment ? (
                  "Asignar"
                ) : (
                  "Reasignar"
                )}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
}
