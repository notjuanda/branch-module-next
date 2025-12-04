"use client";

import { useState, useEffect } from "react";
import { Modal, useToast } from "@/components/ui";
import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    MenuItem,
    Select,
    FormControl,
} from "@mui/material";
import {
    HiOutlineCalendar,
    HiOutlineCollection,
    HiOutlineBell,
} from "react-icons/hi";
import { HiOutlineArchiveBox, HiOutlinePencilSquare } from "react-icons/hi2";
import {
    BatchResponse,
    BatchRequest,
    BatchUpdateRequest,
    ProductResponse,
} from "@/api/types";
import { batchService, inventoryService } from "@/api/services";

interface BatchFormModalProps {
    open: boolean;
    onClose: () => void;
    batch?: BatchResponse | null;
    onSuccess?: (batch: BatchResponse) => void;
    preselectedProductId?: string;
}

// Componente de campo con icono
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

export default function BatchFormModal({
    open,
    onClose,
    batch,
    onSuccess,
    preselectedProductId,
}: BatchFormModalProps) {
    const isEditing = !!batch;
    const { showSuccess, showError } = useToast();

    // Estado del formulario
    const [productId, setProductId] = useState("");
    const [batchNumber, setBatchNumber] = useState("");
    const [quantity, setQuantity] = useState<number>(1);
    const [expirationDate, setExpirationDate] = useState("");
    const [warningDays, setWarningDays] = useState<number>(7);

    // Estado de productos
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    // Estado de UI
    const [loading, setLoading] = useState(false);

    // Cargar productos
    useEffect(() => {
        if (open) {
            setLoadingProducts(true);
            inventoryService
                .listProducts()
                .then((data) => setProducts(data))
                .catch((err) => {
                    console.error("Error loading products:", err);
                    showError("Error al cargar productos");
                })
                .finally(() => setLoadingProducts(false));
        }
    }, [open, showError]);

    // Resetear formulario cuando cambia el batch o se abre/cierra
    useEffect(() => {
        if (open) {
            if (batch) {
                setProductId(batch.productId);
                setBatchNumber(batch.batchNumber);
                setQuantity(batch.quantity);
                setExpirationDate(batch.expirationDate);
                setWarningDays(batch.warningDaysBeforeExpiration);
            } else {
                setProductId(preselectedProductId || "");
                setBatchNumber("");
                setQuantity(1);
                setExpirationDate("");
                setWarningDays(7);
            }
        }
    }, [open, batch, preselectedProductId]);

    // Validar formulario
    const validateForm = (): boolean => {
        if (!productId) {
            showError("Selecciona un producto");
            return false;
        }
        if (!batchNumber.trim()) {
            showError("El número de lote es requerido");
            return false;
        }
        if (quantity < 1) {
            showError("La cantidad debe ser al menos 1");
            return false;
        }
        if (!expirationDate) {
            showError("La fecha de vencimiento es requerida");
            return false;
        }
        
        // Validar que la fecha de vencimiento no sea pasada (solo al crear)
        if (!isEditing) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const expDate = new Date(expirationDate);
            if (expDate <= today) {
                showError("La fecha de vencimiento debe ser posterior a hoy");
                return false;
            }
        }
        
        return true;
    };

    // Manejar submit
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            let result: BatchResponse;

            if (isEditing && batch) {
                const updateData: BatchUpdateRequest = {
                    batchNumber: batchNumber.trim(),
                    quantity,
                    expirationDate,
                    warningDaysBeforeExpiration: warningDays,
                };
                result = await batchService.update(batch.id, updateData);
                showSuccess(`Lote "${result.batchNumber}" actualizado`);
            } else {
                const createData: BatchRequest = {
                    productId,
                    batchNumber: batchNumber.trim(),
                    quantity,
                    expirationDate,
                    warningDaysBeforeExpiration: warningDays,
                };
                result = await batchService.create(createData);
                showSuccess(`Lote "${result.batchNumber}" creado`);
            }

            onSuccess?.(result);
            onClose();
        } catch (error) {
            console.error("Error saving batch:", error);
            const errorMessage = error instanceof Error ? error.message : 
                (isEditing ? "Error al actualizar el lote" : "Error al crear el lote");
            showError(errorMessage);
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
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {isEditing ? (
                        <HiOutlinePencilSquare size={24} />
                    ) : (
                        <HiOutlineArchiveBox size={24} />
                    )}
                    <Typography variant="h6" component="span">
                        {isEditing ? "Editar lote" : "Nuevo lote"}
                    </Typography>
                </Box>
            }
            subtitle={
                isEditing
                    ? `Editando: ${batch?.batchNumber}`
                    : "Registra un nuevo lote con fecha de vencimiento"
            }
            showCloseButton={!loading}
            closeOnBackdropClick={!loading}
            closeOnEscape={!loading}
            transition="slide"
            customFooter={
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        justifyContent: "flex-end",
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
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading || loadingProducts}
                        startIcon={
                            loading ? (
                                <CircularProgress size={18} sx={{ color: "white" }} />
                            ) : null
                        }
                        sx={{
                            backgroundColor: "var(--color-success)",
                            color: "var(--color-text-light)",
                            textTransform: "none",
                            "&:hover": {
                                backgroundColor: "var(--color-success-hover)",
                            },
                        }}
                    >
                        {loading
                            ? isEditing
                                ? "Guardando..."
                                : "Creando..."
                            : isEditing
                                ? "Guardar cambios"
                                : "Crear lote"}
                    </Button>
                </Box>
            }
        >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Producto */}
                <FormField icon={<HiOutlineCollection size={20} />} label="Producto *">
                    <FormControl fullWidth size="small" disabled={isEditing || loadingProducts}>
                        <Select
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            displayEmpty
                        >
                            <MenuItem value="" disabled>
                                {loadingProducts ? "Cargando productos..." : "Selecciona un producto"}
                            </MenuItem>
                            {products.map((product) => (
                                <MenuItem key={product.id} value={product.id}>
                                    {product.name} - {product.brand}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </FormField>

                {/* Número de Lote y Cantidad */}
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                    <FormField icon={<HiOutlineArchiveBox size={20} />} label="Número de lote *">
                        <TextField
                            fullWidth
                            size="small"
                            value={batchNumber}
                            onChange={(e) => setBatchNumber(e.target.value)}
                            placeholder="Ej: LOT-2025-001"
                            disabled={loading}
                        />
                    </FormField>

                    <FormField icon={<HiOutlineCollection size={20} />} label="Cantidad *">
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            inputProps={{ min: 1 }}
                            disabled={loading}
                        />
                    </FormField>
                </Box>

                {/* Fecha de vencimiento y días de advertencia */}
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                    <FormField icon={<HiOutlineCalendar size={20} />} label="Fecha de vencimiento *">
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            value={expirationDate}
                            onChange={(e) => setExpirationDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            disabled={loading}
                        />
                    </FormField>

                    <FormField icon={<HiOutlineBell size={20} />} label="Días de advertencia">
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={warningDays}
                            onChange={(e) => setWarningDays(parseInt(e.target.value) || 7)}
                            inputProps={{ min: 1 }}
                            disabled={loading}
                            helperText="Días antes del vencimiento para alertar"
                        />
                    </FormField>
                </Box>
            </Box>
        </Modal>
    );
}
