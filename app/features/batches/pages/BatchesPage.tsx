"use client";

import { useState, useEffect, useCallback } from "react";
import { Typography, Button, Skeleton, Alert, Box, Chip, Tabs, Tab, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { HiOutlinePlus, HiOutlineRefresh, HiOutlineExclamation, HiOutlineBell } from "react-icons/hi";
import { BatchTable, BatchFormModal } from "../components";
import { BatchResponse, ExpiringBatchNotification, BranchResponse } from "@/api/types";
import { batchService, branchService } from "@/api/services";
import { useToast } from "@/components/ui";

export default function BatchesPage() {
    const [batches, setBatches] = useState<BatchResponse[]>([]);
    const [notifications, setNotifications] = useState<ExpiringBatchNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const { showError, showSuccess } = useToast();

    // Lista de sucursales para el selector
    const [branches, setBranches] = useState<BranchResponse[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string>("");

    // Estado para modal de formulario
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [batchToEdit, setBatchToEdit] = useState<BatchResponse | null>(null);

    // Cargar sucursales al montar
    useEffect(() => {
        const loadBranches = async () => {
            try {
                const branchesData = await branchService.list();
                const activeBranches = branchesData.filter(b => b.active);
                setBranches(activeBranches);
                
                if (activeBranches.length > 0 && !selectedBranchId) {
                    setSelectedBranchId(activeBranches[0].id);
                }
            } catch (err) {
                console.error("Error loading branches:", err);
                showError("Error al cargar sucursales");
            }
        };
        loadBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchBatches = useCallback(async () => {
        if (!selectedBranchId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            let data: BatchResponse[];

            // Cargar según la pestaña activa
            if (activeTab === 0) {
                data = await batchService.list(selectedBranchId);
            } else if (activeTab === 1) {
                data = await batchService.listExpiringSoon(selectedBranchId);
            } else {
                data = await batchService.listExpired(selectedBranchId);
            }

            setBatches(data);

            // Cargar notificaciones
            const notifs = await batchService.getExpiringNotifications(selectedBranchId);
            setNotifications(notifs);
        } catch (err) {
            console.error("Error al cargar lotes:", err);
            setError("Error al cargar los lotes. Por favor, intenta de nuevo.");
            showError("Error al cargar los lotes");
        } finally {
            setLoading(false);
        }
    }, [activeTab, selectedBranchId, showError]);

    useEffect(() => {
        if (selectedBranchId) {
            fetchBatches();
        }
    }, [fetchBatches, selectedBranchId]);

    // Handlers para el modal de formulario
    const handleOpenCreate = () => {
        setBatchToEdit(null);
        setFormModalOpen(true);
    };

    const handleOpenEdit = (batch: BatchResponse) => {
        setBatchToEdit(batch);
        setFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setFormModalOpen(false);
        setBatchToEdit(null);
    };

    const handleFormSuccess = () => {
        handleCloseFormModal();
        fetchBatches();
    };

    const handleDelete = () => {
        fetchBatches();
    };

    const handleDeactivateExpired = async () => {
        if (!selectedBranchId) return;
        try {
            await batchService.deactivateExpiredBatches(selectedBranchId);
            showSuccess("Lotes vencidos desactivados");
            fetchBatches();
        } catch (err) {
            console.error("Error deactivating expired batches:", err);
            showError("Error al desactivar lotes vencidos");
        }
    };

    // Si no hay sucursales activas
    if (branches.length === 0 && !loading) {
        return (
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Alert severity="warning">
                    No hay sucursales activas. Crea una sucursal primero para gestionar lotes.
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "stretch", sm: "center" },
                    justifyContent: "space-between",
                    gap: 2,
                    mb: 3,
                }}
            >
                <div>
                    <Typography
                        variant="h4"
                        component="h1"
                        fontWeight={700}
                        sx={{
                            color: "var(--color-text)",
                            fontSize: { xs: "1.5rem", sm: "2rem" },
                        }}
                    >
                        Lotes
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: "var(--color-text-muted)", mt: 0.5 }}
                    >
                        Gestiona los lotes de productos con control de vencimiento
                    </Typography>
                </div>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                    {/* Selector de sucursal */}
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Sucursal</InputLabel>
                        <Select
                            value={selectedBranchId}
                            label="Sucursal"
                            onChange={(e) => setSelectedBranchId(e.target.value)}
                        >
                            {branches.map((branch) => (
                                <MenuItem key={branch.id} value={branch.id}>
                                    {branch.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        variant="outlined"
                        startIcon={<HiOutlineRefresh size={18} />}
                        onClick={fetchBatches}
                        disabled={loading || !selectedBranchId}
                        size="small"
                        sx={{
                            borderColor: "var(--color-border)",
                            color: "var(--color-text)",
                            "&:hover": {
                                borderColor: "var(--color-primary)",
                                backgroundColor: "rgba(0, 50, 84, 0.04)",
                            },
                        }}
                    >
                        Refrescar
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<HiOutlinePlus size={18} />}
                        onClick={handleOpenCreate}
                        disabled={!selectedBranchId}
                        size="small"
                        sx={{
                            backgroundColor: "var(--color-success)",
                            color: "var(--color-text-light)",
                            "&:hover": {
                                backgroundColor: "var(--color-success-hover)",
                            },
                        }}
                    >
                        Nuevo lote
                    </Button>
                </Box>
            </Box>

            {/* Alertas de notificaciones */}
            {notifications.length > 0 && (
                <Alert
                    severity="warning"
                    icon={<HiOutlineBell size={24} />}
                    sx={{
                        mb: 3,
                        backgroundColor: "rgba(245, 158, 11, 0.1)",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                    }}
                    action={
                        <Chip
                            label={`${notifications.length} lotes`}
                            color="warning"
                            size="small"
                        />
                    }
                >
                    <Typography fontWeight={600}>
                        ¡Atención! Hay lotes próximos a vencer
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {notifications.slice(0, 3).map((n) => (
                            <span key={n.batchId}>
                                {n.productName} (Lote: {n.batchNumber}) - {n.daysUntilExpiration} días
                                {notifications.indexOf(n) < Math.min(notifications.length, 3) - 1 && " | "}
                            </span>
                        ))}
                        {notifications.length > 3 && ` y ${notifications.length - 3} más...`}
                    </Typography>
                </Alert>
            )}

            {/* Tabs */}
            <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{
                    mb: 3,
                    borderBottom: "1px solid var(--color-border)",
                    "& .MuiTab-root": {
                        textTransform: "none",
                        fontWeight: 500,
                    },
                    "& .Mui-selected": {
                        color: "var(--color-primary) !important",
                    },
                    "& .MuiTabs-indicator": {
                        backgroundColor: "var(--color-primary)",
                    },
                }}
            >
                <Tab label="Todos los lotes" />
                <Tab
                    label={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            Por vencer
                            {notifications.length > 0 && (
                                <Chip
                                    label={notifications.length}
                                    color="warning"
                                    size="small"
                                    sx={{ height: 20, fontSize: "0.7rem" }}
                                />
                            )}
                        </Box>
                    }
                />
                <Tab
                    label={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            Vencidos
                            <HiOutlineExclamation size={16} color="#ef4444" />
                        </Box>
                    }
                />
            </Tabs>

            {/* Botón para desactivar vencidos (solo en tab de vencidos) */}
            {activeTab === 2 && batches.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={handleDeactivateExpired}
                        startIcon={<HiOutlineExclamation size={16} />}
                    >
                        Desactivar todos los lotes vencidos
                    </Button>
                </Box>
            )}

            {/* Error */}
            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    action={
                        <Button color="inherit" size="small" onClick={fetchBatches}>
                            Reintentar
                        </Button>
                    }
                >
                    {error}
                </Alert>
            )}

            {/* Loading */}
            {loading && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton
                            key={i}
                            variant="rectangular"
                            height={60}
                            sx={{ borderRadius: 1 }}
                        />
                    ))}
                </Box>
            )}

            {/* Tabla */}
            {!loading && !error && selectedBranchId && (
                <BatchTable
                    batches={batches}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                    branchId={selectedBranchId}
                />
            )}

            {/* Modal de formulario */}
            <BatchFormModal
                open={formModalOpen}
                onClose={handleCloseFormModal}
                batch={batchToEdit}
                onSuccess={handleFormSuccess}
                branchId={selectedBranchId}
            />
        </Box>
    );
}
