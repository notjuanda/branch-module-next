"use client";

import { Modal } from "@/components/ui";
import { Map } from "@/components/ui";
import { Box, Typography, Chip, Divider, Button } from "@mui/material";
import {
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from "react-icons/hi";
import { HiBuildingStorefront } from "react-icons/hi2";
import { BranchResponse } from "@/api/types";

interface BranchDetailModalProps {
  open: boolean;
  onClose: () => void;
  branch: BranchResponse | null;
}

// Componente para mostrar un campo de información
function InfoField({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  valueColor?: string;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
      <Box
        sx={{
          color: "var(--color-primary)",
          mt: 0.25,
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
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: valueColor || "var(--color-text)",
            fontWeight: 500,
            mt: 0.25,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export default function BranchDetailModal({
  open,
  onClose,
  branch,
}: BranchDetailModalProps) {
  if (!branch) return null;

  const hasCoordinates =
    branch.lat !== null &&
    branch.lng !== null &&
    branch.lat !== 0 &&
    branch.lng !== 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 1,
            maxWidth: "100%",
            overflow: "hidden",
          }}
        >
          <HiBuildingStorefront size={20} style={{ flexShrink: 0 }} />
          <Typography
            component="span"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: { xs: "1rem", sm: "1.25rem" },
              fontWeight: 600,
            }}
          >
            {branch.name}
          </Typography>
        </Box>
      }
      subtitle={branch.slug}
      showCloseButton
      transition="fade"
      customFooter={
        <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              backgroundColor: "var(--color-success)",
              color: "var(--color-text-light)",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              "&:hover": {
                backgroundColor: "var(--color-success-hover)",
              },
            }}
          >
            Cerrar
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Estado */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            icon={
              branch.active ? (
                <HiOutlineCheckCircle size={16} />
              ) : (
                <HiOutlineXCircle size={16} />
              )
            }
            label={branch.active ? "Sucursal Activa" : "Sucursal Inactiva"}
            sx={{
              backgroundColor: branch.active
                ? "rgba(34, 197, 94, 0.1)"
                : "rgba(107, 114, 128, 0.1)",
              color: branch.active
                ? "var(--color-success)"
                : "var(--color-text-muted)",
              fontWeight: 600,
              "& .MuiChip-icon": {
                color: "inherit",
              },
            }}
          />
        </Box>

        <Divider sx={{ borderColor: "var(--color-border)" }} />

        {/* Información General */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              color: "var(--color-text)",
              fontWeight: 600,
              mb: 2,
            }}
          >
            Información General
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2.5,
            }}
          >
            <InfoField
              icon={<HiOutlineLocationMarker size={20} />}
              label="Dirección"
              value={branch.address}
            />

            <InfoField
              icon={<HiOutlinePhone size={20} />}
              label="Teléfono"
              value={branch.primaryPhone || "No registrado"}
              valueColor={
                branch.primaryPhone ? undefined : "var(--color-text-muted)"
              }
            />
          </Box>
        </Box>

        <Divider sx={{ borderColor: "var(--color-border)" }} />

        {/* Mapa */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              color: "var(--color-text)",
              fontWeight: 600,
              mb: 2,
            }}
          >
            Ubicación
          </Typography>

          {hasCoordinates ? (
            <Map
              centerLat={branch.lat}
              centerLng={branch.lng}
              zoom={16}
              height={280}
              showCenterMarker
              markers={[
                {
                  id: branch.id,
                  lat: branch.lat,
                  lng: branch.lng,
                  title: branch.name,
                  description: branch.address,
                  color: "primary",
                },
              ]}
            />
          ) : (
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                backgroundColor: "var(--color-surface)",
                borderRadius: 2,
                border: "1px dashed var(--color-border)",
              }}
            >
              <HiOutlineLocationMarker
                size={40}
                color="var(--color-text-muted)"
              />
              <Typography
                variant="body2"
                sx={{ color: "var(--color-text-muted)", mt: 1 }}
              >
                Coordenadas no disponibles
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
}
