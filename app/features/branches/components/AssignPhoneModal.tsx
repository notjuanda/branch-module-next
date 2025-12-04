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
  Chip,
} from "@mui/material";
import { HiDevicePhoneMobile } from "react-icons/hi2";
import {
  BranchPhoneResponse,
  EmployeeResponse,
} from "@/api/types";
import {
  assignmentService,
  branchPhoneService,
} from "@/api/services";

interface AssignPhoneModalProps {
  open: boolean;
  onClose: () => void;
  employee: EmployeeResponse | null;
  branchId: string | null;
  onSuccess?: () => void;
}

// Helper para mostrar estado
const getStateConfig = (state: string) => {
  switch (state) {
    case "AVAILABLE":
      return { label: "Disponible", color: "success" as const };
    case "ASSIGNED":
      return { label: "Asignado", color: "warning" as const };
    case "INACTIVE":
      return { label: "Inactivo", color: "error" as const };
    default:
      return { label: state, color: "default" as const };
  }
};

export default function AssignPhoneModal({
  open,
  onClose,
  employee,
  branchId,
  onSuccess,
}: AssignPhoneModalProps) {
  const { showSuccess, showError, showWarning } = useToast();
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [availablePhones, setAvailablePhones] = useState<BranchPhoneResponse[]>([]);
  const [selectedPhoneId, setSelectedPhoneId] = useState<string>("");

  // Cargar teléfonos disponibles
  useEffect(() => {
    const fetchPhones = async () => {
      if (!open || !branchId) return;

      setLoading(true);
      setSelectedPhoneId("");
      try {
        const phones = await branchPhoneService.list(branchId);
        // Solo teléfonos corporativos disponibles
        const available = phones.filter(
          (p) => p.kind === "CORPORATE" && p.state === "AVAILABLE"
        );
        setAvailablePhones(available);
        
        if (available.length === 0) {
          showWarning("No hay teléfonos corporativos disponibles en esta sucursal");
        }
      } catch (error) {
        console.error("Error loading phones:", error);
        showError("Error al cargar los teléfonos disponibles");
      } finally {
        setLoading(false);
      }
    };

    fetchPhones();
  }, [open, branchId, showError, showWarning]);

  const handleAssign = async () => {
    if (!employee || !selectedPhoneId) {
      showWarning("Selecciona un teléfono para asignar");
      return;
    }

    setAssigning(true);
    try {
      await assignmentService.assignCorpPhone(employee.id, selectedPhoneId);
      showSuccess(`Teléfono asignado a ${employee.firstName} ${employee.lastName}`);
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      console.error("Error assigning phone:", error);
      const message = error instanceof Error ? error.message : "Error al asignar el teléfono";
      showError(message);
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    setSelectedPhoneId("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="sm"
      title={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <HiDevicePhoneMobile size={24} />
          <Typography variant="h6" component="span">
            Asignar teléfono
          </Typography>
        </Box>
      }
      subtitle={employee ? `${employee.firstName} ${employee.lastName}` : undefined}
      showCloseButton
      transition="fade"
    >
      <Box sx={{ minHeight: 150 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: 150,
              gap: 2,
            }}
          >
            <CircularProgress sx={{ color: "var(--color-primary)" }} />
            <Typography color="text.secondary">Cargando teléfonos...</Typography>
          </Box>
        ) : availablePhones.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: 150,
              gap: 2,
              color: "var(--color-text-muted)",
            }}
          >
            <HiDevicePhoneMobile size={48} />
            <Typography textAlign="center">
              No hay teléfonos corporativos disponibles en esta sucursal
            </Typography>
          </Box>
        ) : (
          <>
            <Typography
              variant="body2"
              sx={{ color: "var(--color-text-muted)", mb: 2 }}
            >
              Selecciona un teléfono corporativo para asignar:
            </Typography>

            <RadioGroup
              value={selectedPhoneId}
              onChange={(e) => setSelectedPhoneId(e.target.value)}
            >
              {availablePhones.map((phone) => {
                const stateConfig = getStateConfig(phone.state);
                return (
                  <FormControlLabel
                    key={phone.id}
                    value={phone.id}
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
                        <HiDevicePhoneMobile size={18} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {phone.number}
                        </Typography>
                        {phone.label && (
                          <Typography
                            variant="caption"
                            sx={{ color: "var(--color-text-muted)" }}
                          >
                            ({phone.label})
                          </Typography>
                        )}
                        <Chip
                          label={stateConfig.label}
                          color={stateConfig.color}
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
                      ...(selectedPhoneId === phone.id && {
                        borderColor: "var(--color-primary)",
                        backgroundColor: "rgba(0, 50, 84, 0.04)",
                      }),
                    }}
                  />
                );
              })}
            </RadioGroup>

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
                disabled={assigning}
                sx={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleAssign}
                disabled={!selectedPhoneId || assigning}
                sx={{
                  backgroundColor: "var(--color-success)",
                  "&:hover": {
                    backgroundColor: "var(--color-success-hover)",
                  },
                }}
              >
                {assigning ? (
                  <CircularProgress size={20} sx={{ color: "white" }} />
                ) : (
                  "Asignar"
                )}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
}
