"use client";

import { useState } from "react";
import { Modal, useToast } from "@/components/ui";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { HiOutlineTrash, HiOutlineExclamation } from "react-icons/hi";
import { branchPhoneService } from "@/api/services";
import { BranchPhoneResponse } from "@/api/types";

interface DeletePhoneConfirmModalProps {
  open: boolean;
  onClose: () => void;
  branchId: string | null;
  phone: BranchPhoneResponse | null;
  onSuccess?: () => void;
}

export default function DeletePhoneConfirmModal({
  open,
  onClose,
  branchId,
  phone,
  onSuccess,
}: DeletePhoneConfirmModalProps) {
  const { showSuccess, showError } = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!branchId || !phone) return;

    setDeleting(true);

    try {
      await branchPhoneService.delete(branchId, phone.id);
      showSuccess("Teléfono eliminado correctamente");
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      console.error("Error deleting phone:", error);
      const message =
        error instanceof Error ? error.message : "Error al eliminar el teléfono";
      showError(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xs"
      title={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HiOutlineExclamation size={24} color="#ef4444" />
          </Box>
          <Typography variant="h6" component="span">
            Eliminar teléfono
          </Typography>
        </Box>
      }
      showCloseButton
      transition="fade"
    >
      <Box sx={{ pt: 2 }}>
        <Typography sx={{ color: "var(--color-text)", mb: 2 }}>
          ¿Estás seguro de que deseas eliminar el teléfono{" "}
          <strong>{phone?.number}</strong>
          {phone?.label && ` (${phone.label})`}?
        </Typography>

        {phone?.state === "ASSIGNED" && (
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
              Este teléfono está asignado a un empleado. Al eliminarlo, se
              liberará la asignación.
            </Typography>
          </Box>
        )}

        <Typography variant="body2" sx={{ color: "var(--color-text-muted)" }}>
          Esta acción no se puede deshacer.
        </Typography>

        {/* Botones */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            pt: 3,
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={deleting}
            sx={{
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
            startIcon={
              deleting ? (
                <CircularProgress size={16} sx={{ color: "white" }} />
              ) : (
                <HiOutlineTrash size={18} />
              )
            }
            sx={{
              backgroundColor: "#ef4444",
              "&:hover": {
                backgroundColor: "#dc2626",
              },
            }}
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
