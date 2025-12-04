"use client";

import { useState, useEffect } from "react";
import { Modal, useToast } from "@/components/ui";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  CircularProgress,
} from "@mui/material";
import { HiOutlinePencil } from "react-icons/hi";
import { HiDevicePhoneMobile } from "react-icons/hi2";
import { branchPhoneService } from "@/api/services";
import { BranchPhoneResponse, PhoneKind } from "@/api/types";

interface EditBranchPhoneModalProps {
  open: boolean;
  onClose: () => void;
  branchId: string | null;
  phone: BranchPhoneResponse | null;
  onSuccess?: () => void;
}

export default function EditBranchPhoneModal({
  open,
  onClose,
  branchId,
  phone,
  onSuccess,
}: EditBranchPhoneModalProps) {
  const { showSuccess, showError, showWarning } = useToast();
  const [saving, setSaving] = useState(false);

  // Form state
  const [number, setNumber] = useState("");
  const [kind, setKind] = useState<PhoneKind>("CORPORATE");
  const [label, setLabel] = useState("");
  const [whatsapp, setWhatsapp] = useState(false);
  const [publish, setPublish] = useState(false);

  // Errors
  const [numberError, setNumberError] = useState("");

  // Cargar datos del teléfono cuando se abre
  useEffect(() => {
    if (open && phone) {
      setNumber(phone.number);
      setKind(phone.kind);
      setLabel(phone.label || "");
      setWhatsapp(phone.whatsapp);
      setPublish(phone.publish);
      setNumberError("");
    }
  }, [open, phone]);

  const handleClose = () => {
    setNumberError("");
    onClose();
  };

  const handleSave = async () => {
    if (!branchId || !phone) return;

    // Validación
    if (!number.trim()) {
      setNumberError("El número es obligatorio");
      showWarning("Ingresa un número de teléfono");
      return;
    }

    // Validar formato básico
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(number.trim())) {
      setNumberError("Formato de número inválido");
      showWarning("El formato del número no es válido");
      return;
    }

    setNumberError("");
    setSaving(true);

    try {
      await branchPhoneService.update(branchId, phone.id, {
        number: number.trim(),
        kind,
        label: label.trim() || undefined,
        whatsapp,
        publish,
      });

      showSuccess("Teléfono actualizado correctamente");
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      console.error("Error updating phone:", error);
      const message =
        error instanceof Error ? error.message : "Error al actualizar el teléfono";
      showError(message);
    } finally {
      setSaving(false);
    }
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
            Editar teléfono
          </Typography>
        </Box>
      }
      subtitle={phone?.number || ""}
      showCloseButton
      transition="fade"
    >
      <Box
        sx={{ display: "flex", flexDirection: "column", gap: 2.5, paddingTop: 2 }}
      >
        {/* Número */}
        <TextField
          label="Número de teléfono"
          value={number}
          onChange={(e) => {
            setNumber(e.target.value);
            if (e.target.value.trim()) setNumberError("");
          }}
          size="small"
          fullWidth
          required
          error={!!numberError}
          helperText={numberError || "Ej: +57 300 123 4567"}
          placeholder="+57 300 123 4567"
        />

        {/* Tipo */}
        <FormControl size="small" fullWidth>
          <InputLabel>Tipo de teléfono</InputLabel>
          <Select
            value={kind}
            label="Tipo de teléfono"
            onChange={(e) => setKind(e.target.value as PhoneKind)}
          >
            <MenuItem value="CORPORATE">Corporativo</MenuItem>
            <MenuItem value="PUBLIC">Público</MenuItem>
          </Select>
        </FormControl>

        {/* Etiqueta */}
        <TextField
          label="Etiqueta (opcional)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          size="small"
          fullWidth
          placeholder="Ej: Ventas, Gerencia, Atención..."
          helperText="Identificador para este teléfono"
        />

        {/* Switches */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={whatsapp}
                onChange={(e) => setWhatsapp(e.target.checked)}
                color="success"
              />
            }
            label="WhatsApp"
          />
          <FormControlLabel
            control={
              <Switch
                checked={publish}
                onChange={(e) => setPublish(e.target.checked)}
                color="primary"
              />
            }
            label="Publicar en landing"
          />
        </Box>

        {/* Info sobre tipo */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            backgroundColor:
              kind === "CORPORATE"
                ? "rgba(0, 50, 84, 0.05)"
                : "rgba(34, 197, 94, 0.05)",
            border: `1px solid ${
              kind === "CORPORATE" ? "var(--color-primary)" : "var(--color-success)"
            }`,
          }}
        >
          <Typography variant="caption" sx={{ color: "var(--color-text-muted)" }}>
            {kind === "CORPORATE"
              ? "Los teléfonos corporativos pueden asignarse a empleados de la sucursal."
              : "Los teléfonos públicos son para atención general (clientes, proveedores, etc.)."}
          </Typography>
        </Box>

        {/* Botones */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            pt: 1,
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <Button
            variant="outlined"
            onClick={handleClose}
            disabled={saving}
            sx={{
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !number.trim()}
            startIcon={
              saving ? (
                <CircularProgress size={16} sx={{ color: "white" }} />
              ) : (
                <HiOutlinePencil size={18} />
              )
            }
            sx={{
              backgroundColor: "var(--color-success)",
              "&:hover": {
                backgroundColor: "var(--color-success-hover)",
              },
            }}
          >
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
