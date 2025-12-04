"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Modal, Map, useToast } from "@/components/ui";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineOfficeBuilding,
  HiOutlineTag,
  HiOutlineMap,
} from "react-icons/hi";
import { HiBuildingStorefront } from "react-icons/hi2";
import {
  BranchResponse,
  BranchRequest,
  BranchUpdateRequest,
} from "@/api/types";
import { branchService } from "@/api/services";

interface BranchFormModalProps {
  open: boolean;
  onClose: () => void;
  branch?: BranchResponse | null; // Si existe, es edición; si no, es creación
  onSuccess?: (branch: BranchResponse) => void;
}

// Componente de campo con icono - FUERA del componente principal para evitar re-renders
function FormField({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
      <Box
        sx={{
          color: "var(--color-primary)",
          mt: 2,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: "var(--color-text-muted)",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            fontSize: "0.7rem",
            mb: 0.5,
            display: "block",
          }}
        >
          {label}
        </Typography>
        {children}
      </Box>
    </Box>
  );
}

// Genera slug desde el nombre
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
    .replace(/[^a-z0-9\s-]/g, "") // Solo letras, números, espacios y guiones
    .replace(/\s+/g, "-") // Espacios a guiones
    .replace(/-+/g, "-") // Múltiples guiones a uno
    .replace(/^-|-$/g, ""); // Quitar guiones al inicio/final
}

// Valores por defecto para coordenadas (Santa Cruz, Bolivia)
const DEFAULT_LAT = -17.7833;
const DEFAULT_LNG = -63.1821;

export default function BranchFormModal({
  open,
  onClose,
  branch,
  onSuccess,
}: BranchFormModalProps) {
  const isEditing = !!branch;
  const { showSuccess, showError, showWarning } = useToast();

  // Estado del formulario
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [address, setAddress] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);

  // Estado de UI
  const [loading, setLoading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Resetear formulario cuando cambia el branch o se abre/cierra
  useEffect(() => {
    if (open) {
      if (branch) {
        // Edición: cargar datos del branch
        setName(branch.name);
        setSlug(branch.slug);
        setAddress(branch.address);
        setPrimaryPhone(branch.primaryPhone || "");
        setLat(branch.lat || DEFAULT_LAT);
        setLng(branch.lng || DEFAULT_LNG);
        setSlugManuallyEdited(true); // En edición no auto-generar slug
      } else {
        // Creación: resetear todo
        setName("");
        setSlug("");
        setAddress("");
        setPrimaryPhone("");
        setLat(DEFAULT_LAT);
        setLng(DEFAULT_LNG);
        setSlugManuallyEdited(false);
      }
    }
  }, [open, branch]);

  // Manejar cambio de nombre - genera slug automáticamente si no se ha editado manualmente
  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(value));
    }
  };

  // Manejar cambio de slug manual
  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setSlug(generateSlug(value));
  };

  // Manejar clic en el mapa para obtener coordenadas
  const handleMapClick = useCallback((clickLat: number, clickLng: number) => {
    setLat(clickLat);
    setLng(clickLng);
  }, []);

  // Memoizar markers para evitar re-renders del Map
  const mapMarkers = useMemo(() => [
    {
      id: "selected",
      lat,
      lng,
      title: name || "Nueva sucursal",
      description: address || "Ubicación seleccionada",
      color: "primary" as const,
    },
  ], [lat, lng, name, address]);

  // Validación
  const validate = (): boolean => {
    if (!name.trim()) {
      showWarning("El nombre es requerido", "Campo requerido");
      return false;
    }
    if (!slug.trim()) {
      showWarning("El slug es requerido", "Campo requerido");
      return false;
    }
    if (!address.trim()) {
      showWarning("La dirección es requerida", "Campo requerido");
      return false;
    }
    return true;
  };

  // Enviar formulario
  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      let result: BranchResponse;

      if (isEditing && branch) {
        // Actualizar
        const updateData: BranchUpdateRequest = {
          name: name.trim(),
          slug: slug.trim(),
          address: address.trim(),
          primaryPhone: primaryPhone.trim() || undefined,
          lat,
          lng,
        };
        result = await branchService.update(branch.id, updateData);
        showSuccess(`Sucursal "${result.name}" actualizada correctamente`, "¡Éxito!");
      } else {
        // Crear
        const createData: BranchRequest = {
          name: name.trim(),
          slug: slug.trim(),
          address: address.trim(),
          primaryPhone: primaryPhone.trim() || undefined,
          lat,
          lng,
        };
        result = await branchService.create(createData);
        showSuccess(`Sucursal "${result.name}" creada correctamente`, "¡Éxito!");
      }

      onSuccess?.(result);
      onClose();
    } catch (err) {
      console.error("Error saving branch:", err);
      const errorMessage = err instanceof Error
        ? err.message
        : isEditing
        ? "Error al actualizar la sucursal"
        : "Error al crear la sucursal";
      showError(errorMessage, "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <HiBuildingStorefront size={20} />
          <Typography component="span" sx={{ fontWeight: 600 }}>
            {isEditing ? "Editar Sucursal" : "Nueva Sucursal"}
          </Typography>
        </Box>
      }
      subtitle={
        isEditing
          ? `Editando: ${branch?.name}`
          : "Completa los datos de la sucursal"
      }
      showCloseButton
      transition="fade"
      customFooter={
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            width: "100%",
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={{
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
              textTransform: "none",
              "&:hover": {
                borderColor: "var(--color-primary)",
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              backgroundColor: "var(--color-success)",
              color: "var(--color-text-light)",
              textTransform: "none",
              fontWeight: 600,
              minWidth: 120,
              "&:hover": {
                backgroundColor: "var(--color-success-hover)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: "inherit" }} />
            ) : isEditing ? (
              "Guardar Cambios"
            ) : (
              "Crear Sucursal"
            )}
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Nombre y Slug - lado a lado */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          {/* Nombre */}
          <FormField
            icon={<HiOutlineOfficeBuilding size={20} />}
            label="Nombre *"
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Ej: Sucursal Centro"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "var(--color-surface)",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--color-primary)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--color-primary)",
                  },
                },
              }}
            />
          </FormField>

          {/* Slug */}
          <FormField icon={<HiOutlineTag size={20} />} label="Slug *">
            <TextField
              fullWidth
              size="small"
              placeholder="sucursal-centro"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              disabled={loading}
              helperText="Se genera automáticamente"
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "var(--color-surface)",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--color-primary)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--color-primary)",
                  },
                },
                "& .MuiFormHelperText-root": {
                  color: "var(--color-text-muted)",
                },
              }}
            />
          </FormField>
        </Box>

        {/* Dirección y Teléfono - lado a lado */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          {/* Dirección */}
          <FormField
            icon={<HiOutlineLocationMarker size={20} />}
            label="Dirección *"
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Ej: 6ta Avenida 10-25, Zona 1"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "var(--color-surface)",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--color-primary)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--color-primary)",
                  },
                },
              }}
            />
          </FormField>

          {/* Teléfono */}
          <FormField icon={<HiOutlinePhone size={20} />} label="Teléfono">
            <TextField
              fullWidth
              size="small"
              placeholder="Ej: +502 2222-3333"
              value={primaryPhone}
              onChange={(e) => setPrimaryPhone(e.target.value)}
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "var(--color-surface)",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--color-primary)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--color-primary)",
                  },
                },
              }}
            />
          </FormField>
        </Box>

        {/* Ubicación (Mapa) */}
        <FormField icon={<HiOutlineMap size={20} />} label="Ubicación">
          <Typography
            variant="caption"
            sx={{ color: "var(--color-text-muted)", display: "block", mb: 1 }}
          >
            Haz clic en el mapa para seleccionar la ubicación
          </Typography>
          <Map
            centerLat={lat}
            centerLng={lng}
            zoom={15}
            height={250}
            showCenterMarker
            onClick={handleMapClick}
            markers={mapMarkers}
          />
          <Typography
            variant="caption"
            sx={{ 
              color: "var(--color-text-muted)", 
              display: "block", 
              mt: 1,
              textAlign: "center",
            }}
          >
            Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
          </Typography>
        </FormField>
      </Box>
    </Modal>
  );
}