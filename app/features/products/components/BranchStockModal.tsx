"use client";

import { useState, useEffect } from "react";
import { Modal, useToast } from "@/components/ui";
import {
    Box,
    Typography,
    TextField,
    FormControl,
    Select,
    MenuItem,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Tooltip,
    CircularProgress,
    Alert,
    Button,
} from "@mui/material";
import {
    HiOutlineOfficeBuilding,
    HiOutlineTrash,
    HiOutlineSwitchHorizontal,
} from "react-icons/hi";
import { HiOutlineBuildingStorefront } from "react-icons/hi2";
import { ProductResponse, BranchResponse, BatchResponse, BranchStockResponse } from "@/api/types";
import { branchService, batchService, branchStockService } from "@/api/services";

interface BranchStockModalProps {
    open: boolean;
    onClose: () => void;
    product: ProductResponse | null;
    onSuccess?: () => void;
    branchId?: string;
}

export default function BranchStockModal({
    open,
    onClose,
    product,
    onSuccess,
    branchId: currentBranchId,
}: BranchStockModalProps) {
    const { showSuccess, showError } = useToast();

    // Estados
    const [branches, setBranches] = useState<BranchResponse[]>([]);
    const [batches, setBatches] = useState<BatchResponse[]>([]);
    const [currentStock, setCurrentStock] = useState<BranchStockResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    // Form
    const [selectedBranch, setSelectedBranch] = useState<string>("");
    const [selectedBatch, setSelectedBatch] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(0);
    const [minimumStock, setMinimumStock] = useState<number>(0);

    // Estados para transferencia
    const [transferDialogOpen, setTransferDialogOpen] = useState(false);
    const [stockToTransfer, setStockToTransfer] = useState<BranchStockResponse | null>(null);
    const [transferTargetBranch, setTransferTargetBranch] = useState<string>("");
    const [transferQuantity, setTransferQuantity] = useState<number>(0);
    const [transferring, setTransferring] = useState(false);

    // Calcular disponibilidad por lote (cantidad del lote - suma de asignaciones)
    const getBatchAvailability = (batchId: string, batchQuantity: number): number => {
        const assigned = currentStock
            .filter(s => s.batchId === batchId)
            .reduce((sum, s) => sum + s.quantity, 0);
        return batchQuantity - assigned;
    };

    // Verificar si la sucursal actual ya tiene stock asignado de este producto
    const currentBranchHasStock = currentStock.some(s => s.branchId === currentBranchId);
    
    // Lotes completamente asignados (disponibilidad = 0)
    const fullyAssignedBatchIds = batches
        .filter(b => getBatchAvailability(b.id, b.quantity) <= 0)
        .map(b => b.id);
    
    // Lotes disponibles (excluir los completamente asignados)
    const availableBatches = batches.filter(b => !fullyAssignedBatchIds.includes(b.id));

    const loadData = async () => {
        if (!product || !currentBranchId) return;
        
        setLoadingData(true);
        try {
            // Cargar sucursales, lotes del producto y stock actual
            const [branchesData, batchesData, stockData] = await Promise.all([
                branchService.list(),
                batchService.listByProduct(currentBranchId, product.id),
                branchStockService.listByProduct(currentBranchId, product.id),
            ]);

            setBranches(branchesData.filter(b => b.active));
            setBatches(batchesData.filter(b => b.active && !b.expired));
            
            // Enriquecer stock con nombres de sucursales (el backend de inventario no los tiene)
            const branchMap = new Map(branchesData.map(b => [b.id, b.name]));
            const enrichedStock = stockData.map(s => ({
                ...s,
                branchName: branchMap.get(s.branchId) || s.branchName || "Sucursal desconocida"
            }));
            setCurrentStock(enrichedStock);
        } catch (error) {
            console.error("Error loading data:", error);
            showError("Error al cargar los datos");
        } finally {
            setLoadingData(false);
        }
    };

    // Cargar datos cuando se abre el modal
    useEffect(() => {
        if (open && product && currentBranchId) {
            loadData();
            // Pre-seleccionar la sucursal actual (no editable)
            setSelectedBranch(currentBranchId);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, product, currentBranchId]);

    // Obtener el nombre de la sucursal actual
    const currentBranchName = branches.find(b => b.id === currentBranchId)?.name || "Sucursal actual";

    const resetForm = () => {
        setSelectedBranch(currentBranchId || "");
        setSelectedBatch("");
        setQuantity(0);
        setMinimumStock(0);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        if (!product) return;
        
        if (!selectedBranch) {
            showError("Selecciona una sucursal");
            return;
        }
        if (!selectedBatch) {
            showError("Selecciona un lote");
            return;
        }
        if (quantity <= 0) {
            showError("La cantidad debe ser mayor a 0");
            return;
        }

        // Validar que la cantidad no exceda la disponibilidad del lote
        const batch = batches.find(b => b.id === selectedBatch);
        if (batch) {
            const available = getBatchAvailability(batch.id, batch.quantity);
            if (quantity > available) {
                showError(`Stock insuficiente. Disponible: ${available}, Solicitado: ${quantity}`);
                return;
            }
        }

        setLoading(true);
        try {
            await branchStockService.create(selectedBranch, {
                branchId: selectedBranch,
                productId: product.id,
                batchId: selectedBatch,
                quantity,
                minimumStock: minimumStock || 0,
            });

            showSuccess("Producto asignado a la sucursal correctamente");
            resetForm();
            await loadData();
            onSuccess?.();
        } catch (error) {
            console.error("Error assigning product to branch:", error);
            // Mostrar mensaje del backend si existe
            const errorMessage = error instanceof Error ? error.message : "Error al asignar el producto a la sucursal";
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStock = async (stockId: string) => {
        // Encontrar el stock para obtener su puerto
        const stock = currentStock.find(s => s.id === stockId);
        if (!stock) {
            showError("Stock no encontrado");
            return;
        }

        setDeleting(stockId);
        try {
            await branchStockService.delete(stock.branchId, stockId);
            showSuccess("Asignación eliminada");
            await loadData();
            onSuccess?.();
        } catch (error) {
            console.error("Error deleting stock:", error);
            showError("Error al eliminar la asignación");
        } finally {
            setDeleting(null);
        }
    };

    // Funciones de transferencia
    const handleOpenTransferDialog = (stock: BranchStockResponse) => {
        setStockToTransfer(stock);
        setTransferQuantity(stock.quantity);
        setTransferTargetBranch("");
        setTransferDialogOpen(true);
    };

    const handleCloseTransferDialog = () => {
        setTransferDialogOpen(false);
        setStockToTransfer(null);
        setTransferTargetBranch("");
        setTransferQuantity(0);
    };

    const handleTransfer = async () => {
        if (!stockToTransfer) return;

        if (!transferTargetBranch) {
            showError("Selecciona una sucursal destino");
            return;
        }
        if (transferQuantity <= 0) {
            showError("La cantidad debe ser mayor a 0");
            return;
        }
        if (transferQuantity > stockToTransfer.quantity) {
            showError(`Cantidad insuficiente. Disponible: ${stockToTransfer.quantity}`);
            return;
        }

        setTransferring(true);
        try {
            await branchStockService.transfer(stockToTransfer.branchId, stockToTransfer.id, {
                sourceStockId: stockToTransfer.id,
                targetBranchId: transferTargetBranch,
                quantity: transferQuantity,
            });
            showSuccess("Transferencia realizada correctamente");
            handleCloseTransferDialog();
            await loadData();
            onSuccess?.();
        } catch (error) {
            console.error("Error transferring stock:", error);
            const errorMessage = error instanceof Error ? error.message : "Error al transferir stock";
            showError(errorMessage);
        } finally {
            setTransferring(false);
        }
    };

    // Sucursales disponibles para transferencia (excluir la sucursal origen)
    const getAvailableTransferBranches = (sourceStock: BranchStockResponse) => {
        return branches.filter(b => b.id !== sourceStock.branchId);
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            size="md"
            title={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <HiOutlineBuildingStorefront size={24} />
                    <Typography variant="h6" component="span">
                        Asignar a Sucursales
                    </Typography>
                </Box>
            }
            subtitle={product ? `Producto: ${product.name} (${product.sku})` : ""}
            customFooter={
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1.5,
                        pt: 2,
                        borderTop: "1px solid var(--color-border)",
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={handleClose}
                        sx={{
                            borderColor: "var(--color-border)",
                            color: "var(--color-text)",
                            "&:hover": {
                                borderColor: "var(--color-primary)",
                                backgroundColor: "rgba(0, 50, 84, 0.04)",
                            },
                        }}
                    >
                        Cerrar
                    </Button>
                </Box>
            }
        >
            {loadingData ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={40} sx={{ color: "var(--color-primary)" }} />
                </Box>
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {/* Sucursales actuales */}
                    <Box>
                        <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, mb: 1.5, color: "var(--color-text)" }}
                        >
                            Sucursales asignadas ({currentStock.length})
                        </Typography>

                        {currentStock.length === 0 ? (
                            <Alert
                                severity="info"
                                icon={<HiOutlineOfficeBuilding size={20} />}
                                sx={{ backgroundColor: "var(--color-surface)" }}
                            >
                                Este producto no está asignado a ninguna sucursal
                            </Alert>
                        ) : (
                            <List
                                sx={{
                                    bgcolor: "var(--color-surface)",
                                    borderRadius: 2,
                                    border: "1px solid var(--color-border)",
                                    p: 0,
                                    maxHeight: 200,
                                    overflow: "auto",
                                }}
                            >
                                {currentStock.map((stock) => (
                                    <ListItem
                                        key={stock.id}
                                        sx={{
                                            borderBottom: "1px solid var(--color-border)",
                                            "&:last-child": { borderBottom: "none" },
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {stock.branchName}
                                                    </Typography>
                                                    {stock.lowStock && (
                                                        <Chip
                                                            label="Stock bajo"
                                                            size="small"
                                                            color="warning"
                                                            sx={{ height: 20, fontSize: "0.65rem" }}
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Typography variant="caption" sx={{ color: "var(--color-text-muted)" }}>
                                                    Lote: {stock.batchNumber} | Cantidad: {stock.quantity} | Stock mín: {stock.minimumStock}
                                                </Typography>
                                            }
                                        />
                                        <ListItemSecondaryAction sx={{ display: "flex", gap: 0.5 }}>
                                            <Tooltip title="Transferir a otra sucursal">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenTransferDialog(stock)}
                                                    disabled={branches.filter(b => b.id !== stock.branchId).length === 0}
                                                    sx={{
                                                        color: "var(--color-text-muted)",
                                                        "&:hover": {
                                                            backgroundColor: "var(--color-primary)",
                                                            color: "white",
                                                        },
                                                    }}
                                                >
                                                    <HiOutlineSwitchHorizontal size={16} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Eliminar asignación">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteStock(stock.id)}
                                                    disabled={deleting === stock.id}
                                                    sx={{
                                                        color: "var(--color-text-muted)",
                                                        "&:hover": {
                                                            backgroundColor: "var(--color-danger)",
                                                            color: "white",
                                                        },
                                                    }}
                                                >
                                                    {deleting === stock.id ? (
                                                        <CircularProgress size={16} />
                                                    ) : (
                                                        <HiOutlineTrash size={16} />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>

                    {/* Formulario para nueva asignación */}
                    <Box
                        sx={{
                            p: 2,
                            bgcolor: "var(--color-surface)",
                            borderRadius: 2,
                            border: "1px solid var(--color-border)",
                        }}
                    >
                        <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, mb: 2, color: "var(--color-text)" }}
                        >
                            Nueva asignación
                        </Typography>

                        {batches.length === 0 ? (
                            <Alert severity="warning">
                                No hay lotes activos para este producto. Crea un lote primero.
                            </Alert>
                        ) : currentBranchHasStock ? (
                            <Alert severity="info">
                                Este producto ya tiene stock asignado en esta sucursal. Usa transferencia para mover stock.
                            </Alert>
                        ) : availableBatches.length === 0 ? (
                            <Alert severity="info">
                                Todos los lotes están completamente asignados. No hay stock disponible.
                            </Alert>
                        ) : (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                {/* Sucursal - Fija a la sucursal actual */}
                                <FormControl fullWidth size="small">
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "var(--color-text-muted)",
                                            fontWeight: 500,
                                            mb: 0.5,
                                        }}
                                    >
                                        Sucursal
                                    </Typography>
                                    <TextField
                                        value={currentBranchName}
                                        size="small"
                                        disabled
                                        fullWidth
                                        sx={{
                                            backgroundColor: "var(--color-surface)",
                                            "& .MuiOutlinedInput-notchedOutline": {
                                                borderColor: "var(--color-border)",
                                            },
                                            "& .Mui-disabled": {
                                                color: "var(--color-text)",
                                                WebkitTextFillColor: "var(--color-text)",
                                            },
                                        }}
                                    />
                                </FormControl>

                                {/* Lote */}
                                <FormControl fullWidth size="small">
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "var(--color-text-muted)",
                                            fontWeight: 500,
                                            mb: 0.5,
                                        }}
                                    >
                                        Lote *
                                    </Typography>
                                    <Select
                                        value={selectedBatch}
                                        onChange={(e) => setSelectedBatch(e.target.value)}
                                        displayEmpty
                                        sx={{
                                            backgroundColor: "var(--color-background)",
                                            "& .MuiOutlinedInput-notchedOutline": {
                                                borderColor: "var(--color-border)",
                                            },
                                        }}
                                    >
                                        <MenuItem value="" disabled>
                                            Seleccionar lote
                                        </MenuItem>
                                        {availableBatches.map((batch) => {
                                            const available = getBatchAvailability(batch.id, batch.quantity);
                                            return (
                                                <MenuItem key={batch.id} value={batch.id}>
                                                    {batch.batchNumber} - Vence: {batch.expirationDate} (Disponible: {available} de {batch.quantity})
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>

                                {/* Cantidad y Stock mínimo */}
                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "var(--color-text-muted)",
                                                fontWeight: 500,
                                                mb: 0.5,
                                                display: "block",
                                            }}
                                        >
                                            Cantidad *
                                        </Typography>
                                        <TextField
                                            type="number"
                                            size="small"
                                            fullWidth
                                            value={quantity}
                                            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                            inputProps={{ min: 0 }}
                                            sx={{
                                                backgroundColor: "var(--color-background)",
                                                "& .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "var(--color-border)",
                                                },
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "var(--color-text-muted)",
                                                fontWeight: 500,
                                                mb: 0.5,
                                                display: "block",
                                            }}
                                        >
                                            Stock mínimo
                                        </Typography>
                                        <TextField
                                            type="number"
                                            size="small"
                                            fullWidth
                                            value={minimumStock}
                                            onChange={(e) => setMinimumStock(parseInt(e.target.value) || 0)}
                                            inputProps={{ min: 0 }}
                                            sx={{
                                                backgroundColor: "var(--color-background)",
                                                "& .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "var(--color-border)",
                                                },
                                            }}
                                        />
                                    </Box>
                                </Box>

                                {/* Botón de asignar */}
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    disabled={loading || !selectedBranch || !selectedBatch || quantity <= 0}
                                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                                    sx={{
                                        mt: 1,
                                        backgroundColor: "var(--color-success)",
                                        color: "var(--color-text-light)",
                                        "&:hover": {
                                            backgroundColor: "var(--color-success-hover)",
                                        },
                                        "&:disabled": {
                                            backgroundColor: "var(--color-surface)",
                                            color: "var(--color-text-muted)",
                                        },
                                    }}
                                >
                                    {loading ? "Asignando..." : "Asignar a sucursal"}
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Box>
            )}

            {/* Modal de transferencia (dentro del modal principal) */}
            <Modal
                open={transferDialogOpen}
                onClose={handleCloseTransferDialog}
                size="sm"
                title={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <HiOutlineSwitchHorizontal size={22} />
                        <Typography variant="h6" component="span">
                            Transferir Stock
                        </Typography>
                    </Box>
                }
            >
                {stockToTransfer && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Alert severity="info">
                            Transfiriendo desde: <strong>{stockToTransfer.branchName}</strong>
                            <br />
                            Lote: {stockToTransfer.batchNumber} | Disponible: {stockToTransfer.quantity} unidades
                        </Alert>

                        <FormControl fullWidth size="small">
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "var(--color-text-muted)",
                                    fontWeight: 500,
                                    mb: 0.5,
                                }}
                            >
                                Sucursal destino *
                            </Typography>
                            <Select
                                value={transferTargetBranch}
                                onChange={(e) => setTransferTargetBranch(e.target.value)}
                                displayEmpty
                                sx={{
                                    backgroundColor: "var(--color-surface)",
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "var(--color-border)",
                                    },
                                }}
                            >
                                <MenuItem value="" disabled>
                                    Seleccionar sucursal destino
                                </MenuItem>
                                {getAvailableTransferBranches(stockToTransfer).map((branch) => (
                                    <MenuItem key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "var(--color-text-muted)",
                                    fontWeight: 500,
                                    mb: 0.5,
                                    display: "block",
                                }}
                            >
                                Cantidad a transferir *
                            </Typography>
                            <TextField
                                type="number"
                                size="small"
                                fullWidth
                                value={transferQuantity}
                                onChange={(e) => setTransferQuantity(parseInt(e.target.value) || 0)}
                                inputProps={{ min: 1, max: stockToTransfer.quantity }}
                                helperText={`Máximo: ${stockToTransfer.quantity}`}
                                sx={{
                                    backgroundColor: "var(--color-surface)",
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "var(--color-border)",
                                    },
                                }}
                            />
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={handleCloseTransferDialog}
                                disabled={transferring}
                                sx={{
                                    borderColor: "var(--color-border)",
                                    color: "var(--color-text)",
                                    "&:hover": {
                                        borderColor: "var(--color-primary)",
                                        backgroundColor: "rgba(0, 50, 84, 0.04)",
                                    },
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleTransfer}
                                disabled={transferring || !transferTargetBranch || transferQuantity <= 0}
                                startIcon={transferring ? <CircularProgress size={16} color="inherit" /> : <HiOutlineSwitchHorizontal size={18} />}
                                sx={{
                                    backgroundColor: "var(--color-success)",
                                    color: "white",
                                    "&:hover": {
                                        backgroundColor: "var(--color-success-hover)",
                                    },
                                    "&:disabled": {
                                        backgroundColor: "var(--color-surface)",
                                        color: "var(--color-text-muted)",
                                    },
                                }}
                            >
                                {transferring ? "Transfiriendo..." : "Transferir"}
                            </Button>
                        </Box>
                    </Box>
                )}
            </Modal>
        </Modal>
    );
}
