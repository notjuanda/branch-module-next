"use client";

import { useState, useEffect, useCallback } from "react";

import { Typography, Button, Skeleton, Alert, Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { HiOutlinePlus, HiOutlineRefresh } from "react-icons/hi";
import {
    ProductTable,
    ProductFormModal,
    BranchStockModal,
} from "../components";
import { ProductResponse, BranchResponse } from "@/api/types";
import { inventoryService, branchStockService, branchService } from "@/api/services";
import { useToast } from "@/components/ui";
import { useSearchParams } from "next/navigation";

export default function ProductsPage() {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [branchCountMap, setBranchCountMap] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { showError } = useToast();

    const searchParams = useSearchParams();
    const branchIdParam = searchParams.get("branchId");
    
    // Lista de sucursales para el selector
    const [branches, setBranches] = useState<BranchResponse[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string>(branchIdParam || "");

    // Estado para modal de formulario
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<ProductResponse | null>(null);

    // Estado para modal de asignación a sucursales
    const [branchStockModalOpen, setBranchStockModalOpen] = useState(false);
    const [productForBranchStock, setProductForBranchStock] = useState<ProductResponse | null>(null);

    // Cargar sucursales al montar
    useEffect(() => {
        const loadBranches = async () => {
            try {
                const branchesData = await branchService.list();
                const activeBranches = branchesData.filter(b => b.active);
                setBranches(activeBranches);
                
                // Si hay branchId en params, usarlo; sino usar la primera sucursal activa
                if (branchIdParam) {
                    setSelectedBranchId(branchIdParam);
                } else if (activeBranches.length > 0 && !selectedBranchId) {
                    setSelectedBranchId(activeBranches[0].id);
                }
            } catch (err) {
                console.error("Error loading branches:", err);
                showError("Error al cargar sucursales");
            }
        };
        loadBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [branchIdParam]);

    const fetchProducts = useCallback(async () => {
        if (!selectedBranchId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const [productsData, stockData] = await Promise.all([
                inventoryService.listProducts(selectedBranchId),
                branchStockService.listByBranch(selectedBranchId),
            ]);
            setProducts(productsData);

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
    }, [selectedBranchId, showError]);

    useEffect(() => {
        if (selectedBranchId) {
            fetchProducts();
        }
    }, [fetchProducts, selectedBranchId]);

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

    // Si no hay sucursales activas
    if (branches.length === 0 && !loading) {
        return (
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Alert severity="warning">
                    No hay sucursales activas. Crea una sucursal primero para gestionar productos.
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
                        Gestiona los productos del inventario
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
                        onClick={fetchProducts}
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
            {!loading && !error && selectedBranchId && (
                <ProductTable
                    products={products}
                    branchId={selectedBranchId}
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
                branchId={selectedBranchId}
            />

            {/* Modal de asignación a sucursales */}
            <BranchStockModal
                open={branchStockModalOpen}
                onClose={handleCloseBranchStockModal}
                product={productForBranchStock}
                onSuccess={fetchProducts}
                branchId={selectedBranchId}
            />
        </Box>
    );
}