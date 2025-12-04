"use client";

import { useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { HiOutlineExclamation, HiOutlineTrash } from "react-icons/hi";
import { Modal } from "./Modal";

export interface ConfirmDeleteModalProps {
  /** Controla si el modal está abierto */
  open: boolean;
  /** Callback cuando se cierra el modal */
  onClose: () => void;
  /** Callback cuando se confirma la eliminación */
  onConfirm: () => void | Promise<void>;
  /** Título del modal */
  title?: string;
  /** Mensaje de confirmación */
  message?: React.ReactNode;
  /** Nombre del elemento a eliminar (se muestra en negrita) */
  itemName?: string;
  /** Texto del botón de confirmar */
  confirmText?: string;
  /** Texto del botón de cancelar */
  cancelText?: string;
  /** Mostrar estado de carga en el botón */
  loading?: boolean;
}

export function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  title = "Confirmar eliminación",
  message,
  itemName,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  loading: externalLoading,
}: ConfirmDeleteModalProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = externalLoading ?? internalLoading;

  const handleConfirm = async () => {
    try {
      setInternalLoading(true);
      await onConfirm();
      onClose();
    } catch (error) {
      // El error se maneja en el callback
      console.error("Error en confirmación:", error);
    } finally {
      setInternalLoading(false);
    }
  };

  const defaultMessage = itemName ? (
    <>
      ¿Estás seguro de que deseas eliminar <strong>{itemName}</strong>? Esta
      acción no se puede deshacer.
    </>
  ) : (
    "¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer."
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      showCloseButton={!isLoading}
      closeOnBackdropClick={!isLoading}
      closeOnEscape={!isLoading}
      transition="fade"
      customHeader={
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pt: 3,
            pb: 1,
          }}
        >
          {/* Icono de advertencia */}
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <HiOutlineExclamation size={32} color="#ef4444" />
          </Box>

          {/* Título */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "var(--color-text)",
              textAlign: "center",
            }}
          >
            {title}
          </Typography>
        </Box>
      }
      customFooter={
        <Box
          sx={{
            display: "flex",
            gap: 2,
            width: "100%",
            justifyContent: "center",
            pb: 1,
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isLoading}
            sx={{
              minWidth: 100,
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
              textTransform: "none",
              "&:hover": {
                borderColor: "var(--color-text-muted)",
                backgroundColor: "var(--color-surface)",
              },
            }}
          >
            {cancelText}
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={isLoading}
            startIcon={
              isLoading ? (
                <CircularProgress size={18} sx={{ color: "white" }} />
              ) : (
                <HiOutlineTrash size={18} />
              )
            }
            sx={{
              minWidth: 100,
              backgroundColor: "var(--color-danger)",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "var(--color-danger-hover)",
              },
              "&:disabled": {
                backgroundColor: "var(--color-danger)",
                opacity: 0.7,
              },
            }}
          >
            {isLoading ? "Eliminando..." : confirmText}
          </Button>
        </Box>
      }
    >
      {/* Mensaje */}
      <Typography
        variant="body2"
        sx={{
          color: "var(--color-text-muted)",
          textAlign: "center",
          px: 2,
          pb: 2,
          "& strong": {
            color: "var(--color-text)",
            fontWeight: 600,
          },
        }}
      >
        {message || defaultMessage}
      </Typography>
    </Modal>
  );
}

export default ConfirmDeleteModal;
