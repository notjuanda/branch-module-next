"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal, useToast } from "@/components/ui";
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Chip,
    CircularProgress,
    Alert,
    Divider,
    Paper,
} from "@mui/material";
import {
    HiOutlineCube,
    HiOutlineExclamation,
    HiOutlineCheckCircle,
} from "react-icons/hi";
import { BranchResponse } from "@/api/types";

interface ProductFromInventory {
    id: string;
    name: string;
    sku: string;
    category: string;
    brand: string;
    active: boolean;
}

interface BranchStockFromInventory {
    id: string;
    productId: string;
    productName: string;
    productSku: string;
    batchId: string;
    batchNumber: string;
    quantity: number;
    minimumStock: number;
    lowStock: boolean;
}

interface BranchInventoryModalProps {
    open: boolean;
    onClose: () => void;
    branch: BranchResponse | null;
}

export default function BranchInventoryModal({
    open,
    onClose,
    branch,
}: BranchInventoryModalProps) {
    const { showError } = useToast();

    const [products, setProducts] = useState<ProductFromInventory[]>([]);
    const [stock, setStock] = useState<BranchStockFromInventory[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadInventory = useCallback(async () => {
        if (!branch || !branch.inventoryPort) {
            setError("Esta sucursal no tiene contenedor de inventario activo");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const baseUrl = `http://localhost:${branch.inventoryPort}`;
            
            // Cargar productos y stock del contenedor de inventario de esta sucursal
            const [productsRes, stockRes] = await Promise.all([
                fetch(`${baseUrl}/api/products`),
                fetch(`${baseUrl}/api/branch-stock/branch/${branch.id}`),
            ]);

            if (!productsRes.ok) {
                throw new Error("Error al cargar productos");
            }

            const productsData = await productsRes.json();
            setProducts(productsData);

            if (stockRes.ok) {
                const stockData = await stockRes.json();
                setStock(stockData);
            } else {
                setStock([]);
            }
        } catch (err) {
            console.error("Error loading inventory:", err);
            setError(
                err instanceof Error 
                    ? err.message 
                    : "Error al conectar con el inventario de la sucursal"
            );
            showError("No se pudo cargar el inventario", "Error");
        } finally {
            setLoading(false);
        }
    }, [branch, showError]);

    useEffect(() => {
        if (open && branch) {
            loadInventory();
        }
    }, [open, branch, loadInventory]);

    // Reset al cerrar
    useEffect(() => {
        if (!open) {
            setProducts([]);
            setStock([]);
            setError(null);
        }
    }, [open]);

    const getStockForProduct = (productId: string): BranchStockFromInventory[] => {
        return stock.filter(s => s.productId === productId);
    };

    const getTotalStock = (productId: string): number => {
        return getStockForProduct(productId).reduce((sum, s) => sum + s.quantity, 0);
    };

    const hasLowStock = (productId: string): boolean => {
        return getStockForProduct(productId).some(s => s.lowStock);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={`Inventario - ${branch?.name || ""}`}
            size="md"
        >
            <Box sx={{ minHeight: 300 }}>
                {/* Info de conexión */}
                {branch?.inventoryPort && (
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            p: 1.5, 
                            mb: 2, 
                            backgroundColor: "var(--color-surface)",
                            borderColor: "var(--color-border)",
                        }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            Conectado al contenedor de inventario en puerto: <strong>{branch.inventoryPort}</strong>
                        </Typography>
                    </Paper>
                )}

                {/* Loading */}
                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {/* Error */}
                {error && !loading && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Sin puerto de inventario */}
                {!branch?.inventoryPort && !loading && (
                    <Alert severity="info">
                        Esta sucursal no tiene un contenedor de inventario activo.
                        El contenedor se crea automáticamente al crear la sucursal si Docker está configurado correctamente.
                    </Alert>
                )}

                {/* Lista de productos */}
                {!loading && !error && products.length > 0 && (
                    <>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Productos ({products.length})
                        </Typography>
                        <List sx={{ 
                            bgcolor: "var(--color-surface)", 
                            borderRadius: 1,
                            border: "1px solid var(--color-border)",
                        }}>
                            {products.map((product, index) => {
                                const totalStock = getTotalStock(product.id);
                                const isLowStock = hasLowStock(product.id);

                                return (
                                    <Box key={product.id}>
                                        <ListItem>
                                            <Box sx={{ mr: 2, color: "var(--color-primary)" }}>
                                                <HiOutlineCube size={24} />
                                            </Box>
                                            <ListItemText
                                                primary={
                                                    <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <Typography variant="body1" component="span" fontWeight={500}>
                                                            {product.name}
                                                        </Typography>
                                                        {!product.active && (
                                                            <Chip 
                                                                label="Inactivo" 
                                                                size="small" 
                                                                color="default"
                                                            />
                                                        )}
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box component="span" sx={{ display: "flex", gap: 2, mt: 0.5 }}>
                                                        <Typography variant="caption" component="span" color="text.secondary">
                                                            SKU: {product.sku}
                                                        </Typography>
                                                        <Typography variant="caption" component="span" color="text.secondary">
                                                            {product.category}
                                                        </Typography>
                                                        <Typography variant="caption" component="span" color="text.secondary">
                                                            {product.brand}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    {isLowStock && (
                                                        <Chip
                                                            icon={<HiOutlineExclamation />}
                                                            label="Stock bajo"
                                                            size="small"
                                                            color="warning"
                                                        />
                                                    )}
                                                    <Chip
                                                        icon={totalStock > 0 ? <HiOutlineCheckCircle /> : undefined}
                                                        label={`${totalStock} unidades`}
                                                        size="small"
                                                        color={totalStock > 0 ? "success" : "default"}
                                                        variant={totalStock > 0 ? "filled" : "outlined"}
                                                    />
                                                </Box>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        {index < products.length - 1 && <Divider />}
                                    </Box>
                                );
                            })}
                        </List>
                    </>
                )}

                {/* Sin productos */}
                {!loading && !error && products.length === 0 && branch?.inventoryPort && (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                        <HiOutlineCube size={48} style={{ color: "var(--color-text-muted)", marginBottom: 8 }} />
                        <Typography color="text.secondary">
                            No hay productos en el inventario de esta sucursal
                        </Typography>
                    </Box>
                )}
            </Box>
        </Modal>
    );
}
