"use client";

import { useState, useEffect, useCallback } from "react";
import { Typography, Button, Skeleton, Alert, Box } from "@mui/material";
import { HiOutlinePlus, HiOutlineRefresh } from "react-icons/hi";
import {
    ProductTable,
    ProductFormModal,
    BranchStockModal,
} from "../components";
import { ProductResponse } from "@/api/types";
import { inventoryService, branchStockService } from "@/api/services";
import { useToast } from "@/components/ui";

export default function ProductsPage() {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [branchCountMap, setBranchCountMap] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { showError } = useToast();

    // Estado para modal de formulario
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<ProductResponse | null>(null);

    // Estado para modal de asignación a sucursales
    const [branchStockModalOpen, setBranchStockModalOpen] = useState(false);
    const [productForBranchStock, setProductForBranchStock] = useState<ProductResponse | null>(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [productsData, stockData] = await Promise.all([
                inventoryService.listProducts(),
                branchStockService.listAll(),
            ]);
            setProducts(productsData);
            
            // Construir mapa de productId -> número de sucursales únicas
            const countMap: Record<string, number> = {};
            stockData.forEach((stock) => {
                if (!countMap[stock.productId]) {
                    countMap[stock.productId] = 0;
                }
                countMap[stock.productId]++;
            });
            setBranchCountMap(countMap);
        } catch (err) {
            console.error("Error al cargar productos:", err);
            setError("Error al cargar los productos. Por favor, intenta de nuevo.");
            showError("Error al cargar los productos");
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Handlers para el modal de formulario
    const handleOpenCreate = () => {
        setProductToEdit(null);
        setFormModalOpen(true);
    };

    const handleOpenEdit = (product: ProductResponse) => {
        setProductToEdit(product);
        setFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setFormModalOpen(false);
        setProductToEdit(null);
    };

    const handleFormSuccess = () => {
        handleCloseFormModal();
        fetchProducts();
    };

    const handleDelete = () => {
        fetchProducts();
    };

    // Handlers para modal de asignación a sucursales
    const handleOpenBranchStock = (product: ProductResponse) => {
        setProductForBranchStock(product);
        setBranchStockModalOpen(true);
    };

    const handleCloseBranchStockModal = () => {
        setBranchStockModalOpen(false);
        setProductForBranchStock(null);
    };

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
                    mb: 4,
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
                        Productos
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: "var(--color-text-muted)", mt: 0.5 }}
                    >
                        Gestiona todos los productos del inventario
                    </Typography>
                </div>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button
                        variant="outlined"
                        startIcon={<HiOutlineRefresh size={18} />}
                        onClick={fetchProducts}
                        disabled={loading}
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
                        size="small"
                        sx={{
                            backgroundColor: "var(--color-success)",
                            color: "var(--color-text-light)",
                            "&:hover": {
                                backgroundColor: "var(--color-success-hover)",
                            },
                        }}
                    >
                        Nuevo producto
                    </Button>
                </Box>
            </Box>

            {/* Error */}
            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    action={
                        <Button color="inherit" size="small" onClick={fetchProducts}>
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
            {!loading && !error && (
                <ProductTable
                    products={products}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                    onAssignBranch={handleOpenBranchStock}
                    branchCountMap={branchCountMap}
                />
            )}

            {/* Modal de formulario */}
            <ProductFormModal
                open={formModalOpen}
                onClose={handleCloseFormModal}
                product={productToEdit}
                onSuccess={handleFormSuccess}
            />

            {/* Modal de asignación a sucursales */}
            <BranchStockModal
                open={branchStockModalOpen}
                onClose={handleCloseBranchStockModal}
                product={productForBranchStock}
                onSuccess={fetchProducts}
            />
        </Box>
    );
}