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
    HiOutlineBell,
} from "react-icons/hi";
import { HiOutlineBellSlash } from "react-icons/hi2";
import { BatchResponse } from "@/api/types";
import { ConfirmDeleteModal, useToast } from "@/components/ui";
import { batchService } from "@/api/services";

interface BatchTableProps {
    batches: BatchResponse[];
    onEdit: (batch: BatchResponse) => void;
    onDelete?: () => void;
}

export default function BatchTable({
    batches,
    onEdit,
    onDelete,
}: BatchTableProps) {
    const { showSuccess, showError } = useToast();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [batchToDelete, setBatchToDelete] = useState<BatchResponse | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleDeleteClick = (batch: BatchResponse) => {
        setBatchToDelete(batch);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!batchToDelete) return;

        setDeleting(true);
        try {
            await batchService.delete(batchToDelete.id);
            showSuccess(`Lote "${batchToDelete.batchNumber}" eliminado`);
            onDelete?.();
            setDeleteModalOpen(false);
            setBatchToDelete(null);
        } catch (error) {
            console.error("Error deleting batch:", error);
            const errorMessage = error instanceof Error ? error.message : "Error al eliminar el lote";
            showError(errorMessage);
        } finally {
            setDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setDeleteModalOpen(false);
        setBatchToDelete(null);
    };

    const handleToggleNotification = async (batch: BatchResponse) => {
        try {
            await batchService.toggleNotification(batch.id, {
                notificationEnabled: !batch.notificationEnabled,
            });
            showSuccess(
                batch.notificationEnabled
                    ? "Notificación desactivada"
                    : "Notificación activada"
            );
            onDelete?.(); // Refrescar lista
        } catch (error) {
            console.error("Error toggling notification:", error);
            showError("Error al cambiar notificación");
        }
    };

    // Formatear fecha
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Calcular días hasta vencimiento
    const getDaysUntilExpiration = (expirationDate: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expDate = new Date(expirationDate);
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Obtener estado del lote
    const getBatchStatus = (batch: BatchResponse) => {
        if (batch.expired) {
            return { label: "Vencido", color: "error" as const };
        }
        if (batch.expiringSoon) {
            return { label: "Por vencer", color: "warning" as const };
        }
        if (!batch.active) {
            return { label: "Inactivo", color: "default" as const };
        }
        return { label: "Activo", color: "success" as const };
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
                            <TableCell>Lote</TableCell>
                            <TableCell>Producto</TableCell>
                            <TableCell>Cantidad</TableCell>
                            <TableCell>Fecha Vencimiento</TableCell>
                            <TableCell>Días Restantes</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {batches.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    sx={{
                                        textAlign: "center",
                                        py: 4,
                                        color: "var(--color-text-muted)",
                                    }}
                                >
                                    No hay lotes registrados
                                </TableCell>
                            </TableRow>
                        ) : (
                            batches.map((batch) => {
                                const status = getBatchStatus(batch);
                                const daysLeft = getDaysUntilExpiration(batch.expirationDate);

                                return (
                                    <TableRow
                                        key={batch.id}
                                        sx={{
                                            "&:hover": {
                                                backgroundColor: "var(--color-surface)",
                                            },
                                            "& td": {
                                                borderBottom: "1px solid var(--color-border)",
                                            },
                                            backgroundColor: batch.expired
                                                ? "rgba(239, 68, 68, 0.05)"
                                                : batch.expiringSoon
                                                    ? "rgba(245, 158, 11, 0.05)"
                                                    : "transparent",
                                        }}
                                    >
                                        {/* Número de Lote */}
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{ fontWeight: 600, color: "var(--color-text)" }}
                                            >
                                                {batch.batchNumber}
                                            </Typography>
                                        </TableCell>

                                        {/* Producto */}
                                        <TableCell>
                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontWeight: 500, color: "var(--color-text)" }}
                                                >
                                                    {batch.productName}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{ color: "var(--color-text-muted)" }}
                                                >
                                                    {batch.productBrand}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        {/* Cantidad */}
                                        <TableCell>
                                            <Typography variant="body2">{batch.quantity}</Typography>
                                        </TableCell>

                                        {/* Fecha Vencimiento */}
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: batch.expired
                                                        ? "var(--color-danger)"
                                                        : batch.expiringSoon
                                                            ? "var(--color-warning)"
                                                            : "var(--color-text)",
                                                    fontWeight: batch.expired || batch.expiringSoon ? 600 : 400,
                                                }}
                                            >
                                                {formatDate(batch.expirationDate)}
                                            </Typography>
                                        </TableCell>

                                        {/* Días Restantes */}
                                        <TableCell>
                                            <Chip
                                                label={
                                                    daysLeft < 0
                                                        ? `Vencido hace ${Math.abs(daysLeft)} días`
                                                        : daysLeft === 0
                                                            ? "Vence hoy"
                                                            : `${daysLeft} días`
                                                }
                                                size="small"
                                                color={
                                                    daysLeft < 0
                                                        ? "error"
                                                        : daysLeft <= batch.warningDaysBeforeExpiration
                                                            ? "warning"
                                                            : "success"
                                                }
                                                sx={{ fontWeight: 500 }}
                                            />
                                        </TableCell>

                                        {/* Estado */}
                                        <TableCell>
                                            <Chip
                                                label={status.label}
                                                color={status.color}
                                                size="small"
                                                sx={{ fontWeight: 500 }}
                                            />
                                        </TableCell>

                                        {/* Acciones */}
                                        <TableCell align="right">
                                            <Box
                                                sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}
                                            >
                                                <Tooltip
                                                    title={
                                                        batch.notificationEnabled
                                                            ? "Desactivar notificación"
                                                            : "Activar notificación"
                                                    }
                                                >
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleToggleNotification(batch)}
                                                        sx={{
                                                            color: batch.notificationEnabled
                                                                ? "var(--color-warning)"
                                                                : "var(--color-text-muted)",
                                                            "&:hover": {
                                                                backgroundColor: "var(--color-warning)",
                                                                color: "white",
                                                            },
                                                        }}
                                                    >
                                                        {batch.notificationEnabled ? (
                                                            <HiOutlineBell size={18} />
                                                        ) : (
                                                            <HiOutlineBellSlash size={18} />
                                                        )}
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Editar">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onEdit(batch)}
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
                                                        onClick={() => handleDeleteClick(batch)}
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
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal de confirmación de eliminación */}
            <ConfirmDeleteModal
                open={deleteModalOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Eliminar lote"
                itemName={batchToDelete?.batchNumber}
                loading={deleting}
            />
        </>
    );
}
