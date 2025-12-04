"use client";

import { useState, useEffect } from "react";
import { Modal, useToast } from "@/components/ui";
import {
    Box,
    Typography,
    TextField,
    Grid,
    InputAdornment,
    Button,
    CircularProgress,
} from "@mui/material";
import {
    HiOutlineTag,
    HiOutlineCube,
    HiOutlineDocumentText,
    HiOutlineCurrencyDollar,
    HiOutlineCollection,
} from "react-icons/hi";
import { HiOutlineCubeTransparent, HiOutlinePencilSquare } from "react-icons/hi2";
import { ProductResponse, ProductRequest } from "@/api/types";
import { inventoryService } from "@/api/services";

interface ProductFormModalProps {
    open: boolean;
    onClose: () => void;
    product?: ProductResponse | null;
    onSuccess?: (product: ProductResponse) => void;
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

export default function ProductFormModal({
    open,
    onClose,
    product,
    onSuccess,
}: ProductFormModalProps) {
    const isEditing = !!product;
    const { showSuccess, showError } = useToast();

    const [formData, setFormData] = useState<ProductRequest>({
        name: "",
        description: "",
        sku: "",
        brand: "",
        category: "",
        unitPrice: 0,
        unit: "",
    });

    const [errors, setErrors] = useState<Partial<Record<keyof ProductRequest, string>>>({});
    const [loading, setLoading] = useState(false);

    // Cargar datos del producto si estamos editando
    useEffect(() => {
        if (open) {
            if (product) {
                setFormData({
                    name: product.name,
                    description: product.description || "",
                    sku: product.sku,
                    brand: product.brand,
                    category: product.category || "",
                    unitPrice: product.unitPrice,
                    unit: product.unit,
                });
            } else {
                setFormData({
                    name: "",
                    description: "",
                    sku: "",
                    brand: "",
                    category: "",
                    unitPrice: 0,
                    unit: "",
                });
            }
            setErrors({});
        }
    }, [open, product]);

    const handleChange = (field: keyof ProductRequest, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Limpiar error del campo
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof ProductRequest, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = "El nombre es requerido";
        }
        if (!formData.sku.trim()) {
            newErrors.sku = "El SKU es requerido";
        }
        if (!formData.brand.trim()) {
            newErrors.brand = "La marca es requerida";
        }
        if (formData.unitPrice <= 0) {
            newErrors.unitPrice = "El precio debe ser mayor a 0";
        }
        if (!formData.unit.trim()) {
            newErrors.unit = "La unidad es requerida";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            let result: ProductResponse;

            if (isEditing && product) {
                result = await inventoryService.updateProduct(product.id, formData);
                showSuccess("Producto actualizado correctamente");
            } else {
                result = await inventoryService.createProduct(formData);
                showSuccess("Producto creado correctamente");
            }

            onSuccess?.(result);
            onClose();
        } catch (error) {
            console.error("Error al guardar producto:", error);
            showError(isEditing ? "Error al actualizar el producto" : "Error al crear el producto");
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
                        <HiOutlineCubeTransparent size={24} />
                    )}
                    <Typography variant="h6" component="span">
                        {isEditing ? "Editar producto" : "Nuevo producto"}
                    </Typography>
                </Box>
            }
            subtitle={
                isEditing
                    ? `Editando: ${product?.name}`
                    : "Completa los datos del producto"
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
                        disabled={loading}
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
                                : "Crear producto"}
                    </Button>
                </Box>
            }
        >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
                <FormField icon={<HiOutlineTag size={20} />} label="Nombre *">
                    <TextField
                        fullWidth
                        size="small"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                        placeholder="Nombre del producto"
                    />
                </FormField>

                <FormField icon={<HiOutlineDocumentText size={20} />} label="Descripción">
                    <TextField
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        value={formData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        placeholder="Descripción del producto"
                    />
                </FormField>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                        <FormField icon={<HiOutlineCollection size={20} />} label="SKU *">
                            <TextField
                                fullWidth
                                size="small"
                                value={formData.sku}
                                onChange={(e) => handleChange("sku", e.target.value)}
                                error={!!errors.sku}
                                helperText={errors.sku}
                                placeholder="Código SKU"
                            />
                        </FormField>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <FormField icon={<HiOutlineTag size={20} />} label="Marca *">
                            <TextField
                                fullWidth
                                size="small"
                                value={formData.brand}
                                onChange={(e) => handleChange("brand", e.target.value)}
                                error={!!errors.brand}
                                helperText={errors.brand}
                                placeholder="Marca"
                            />
                        </FormField>
                    </Grid>
                </Grid>

                <FormField icon={<HiOutlineCollection size={20} />} label="Categoría">
                    <TextField
                        fullWidth
                        size="small"
                        value={formData.category}
                        onChange={(e) => handleChange("category", e.target.value)}
                        placeholder="Categoría del producto"
                    />
                </FormField>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                        <FormField icon={<HiOutlineCurrencyDollar size={20} />} label="Precio Unitario *">
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                value={formData.unitPrice}
                                onChange={(e) => handleChange("unitPrice", parseFloat(e.target.value) || 0)}
                                error={!!errors.unitPrice}
                                helperText={errors.unitPrice}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                            />
                        </FormField>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <FormField icon={<HiOutlineCube size={20} />} label="Unidad *">
                            <TextField
                                fullWidth
                                size="small"
                                value={formData.unit}
                                onChange={(e) => handleChange("unit", e.target.value)}
                                error={!!errors.unit}
                                helperText={errors.unit}
                                placeholder="Ej: kg, unidad, litro"
                            />
                        </FormField>
                    </Grid>
                </Grid>
            </Box>
        </Modal>
    );
}
