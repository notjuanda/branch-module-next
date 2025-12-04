"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter, useToast } from "@/components/ui";
import { IconButton, Tooltip, Box, Switch, CircularProgress } from "@mui/material";
import {
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlinePencil,
  HiOutlinePhotograph,
  HiOutlineOfficeBuilding,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { HiMapPin } from "react-icons/hi2";
import { BranchResponse } from "@/api/types";
import { branchService } from "@/api/services";
import { API_CONFIG } from "@/api/config";

// Helper para construir URL completa de imagen
const getImageUrl = (url: string) => {
  if (url.startsWith("http")) return url;
  return `${API_CONFIG.BASE_URL ?? "http://localhost:8080"}${url.startsWith("/") ? "" : "/"}${url}`;
};

interface BranchCardProps {
  branch: BranchResponse;
  onClick?: (branch: BranchResponse) => void;
  onEdit?: (branch: BranchResponse) => void;
  onStatusChange?: (branch: BranchResponse) => void;
  onImagesClick?: (branch: BranchResponse) => void;
  onEmployeesClick?: (branch: BranchResponse) => void;
}

export default function BranchCard({
  branch,
  onClick,
  onEdit,
  onStatusChange,
  onImagesClick,
  onEmployeesClick,
}: BranchCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [localActive, setLocalActive] = useState(branch.active);
  const { showSuccess, showError } = useToast();

  const handleCardClick = () => {
    onClick?.(branch);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(branch);
  };

  const handleImagesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImagesClick?.(branch);
  };

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isToggling) return;

    setIsToggling(true);
    const newStatus = !localActive;

    try {
      const updatedBranch = await branchService.updateStatus(branch.id, { active: newStatus });
      setLocalActive(newStatus);
      onStatusChange?.(updatedBranch);
      showSuccess(
        `Sucursal "${branch.name}" ${newStatus ? "activada" : "desactivada"}`,
        newStatus ? "Sucursal activada" : "Sucursal desactivada"
      );
    } catch (error) {
      console.error("Error toggling branch status:", error);
      showError(
        `No se pudo ${newStatus ? "activar" : "desactivar"} la sucursal`,
        "Error"
      );
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Card
      variant="elevated"
      size="md"
      onClick={handleCardClick}
      className="hover:shadow-lg transition-all duration-200 h-full flex flex-col cursor-pointer overflow-hidden"
    >
      {/* Imagen de portada */}
      <Box
        sx={{
          width: "100%",
          height: 140,
          backgroundColor: "var(--color-surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {branch.coverImageUrl ? (
          <img
            src={getImageUrl(branch.coverImageUrl)}
            alt={branch.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              color: "var(--color-text-muted)",
            }}
          >
            <HiOutlineOfficeBuilding size={48} />
            <span style={{ fontSize: "0.75rem" }}>Sin imagen</span>
          </Box>
        )}
      </Box>

      <CardHeader
        title={
          <Box sx={{ 
            maxWidth: "calc(100% - 70px)", 
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}>
            {branch.name}
          </Box>
        }
        subtitle={branch.slug}
        action={
          <Tooltip title={localActive ? "Desactivar sucursal" : "Activar sucursal"}>
            <Box 
              onClick={handleToggleStatus}
              sx={{ 
                display: "flex", 
                alignItems: "center",
                cursor: isToggling ? "wait" : "pointer",
              }}
            >
              {isToggling ? (
                <CircularProgress size={20} sx={{ color: "var(--color-primary)" }} />
              ) : (
                <Switch
                  checked={localActive}
                  size="small"
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "var(--color-success)",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "var(--color-success)",
                    },
                  }}
                />
              )}
            </Box>
          </Tooltip>
        }
      />

      <CardContent className="space-y-3 flex-1">
        {/* Dirección */}
        <div className="flex items-start gap-2 text-text-muted">
          <HiOutlineLocationMarker size={18} className="mt-0.5 flex-shrink-0 text-primary" />
          <span className="text-sm line-clamp-2">{branch.address}</span>
        </div>

        {/* Teléfono */}
        {branch.primaryPhone && (
          <div className="flex items-center gap-2 text-text-muted">
            <HiOutlinePhone size={18} className="flex-shrink-0 text-primary" />
            <span className="text-sm">{branch.primaryPhone}</span>
          </div>
        )}

        {/* Coordenadas */}
        {branch.lat && branch.lng && (
          <div className="flex items-center gap-1.5 text-xs text-text-muted bg-danger/10 rounded-md px-2 py-1 w-fit">
            <HiMapPin size={14} className="text-danger" />
            <span>{branch.lat.toFixed(4)}, {branch.lng.toFixed(4)}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end gap-1 pt-2 border-t border-border/50">
        <Tooltip title="Empleados">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEmployeesClick?.(branch);
            }}
            sx={{
              color: "var(--color-text-muted)",
              "&:hover": {
                backgroundColor: "var(--color-info)",
                color: "white",
              },
            }}
          >
            <HiOutlineUserGroup size={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Imágenes">
          <IconButton
            size="small"
            onClick={handleImagesClick}
            sx={{
              color: "var(--color-text-muted)",
              "&:hover": {
                backgroundColor: "var(--color-primary)",
                color: "white",
              },
            }}
          >
            <HiOutlinePhotograph size={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton
            size="small"
            onClick={handleEditClick}
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
      </CardFooter>
    </Card>
  );
}
