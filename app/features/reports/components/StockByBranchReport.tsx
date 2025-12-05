"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, FormControl, Select, MenuItem, Alert, Button, InputLabel } from "@mui/material";
import { HiOutlineCube, HiOutlineRefresh } from "react-icons/hi";
import { StockByBranchResponse, BranchResponse } from "@/api/types";
import { reportService, branchService } from "@/api/services";
import { DataTable, Column, TableBadge, useToast } from "@/components/ui";

export default function StockByBranchReport() {
    const { showError } = useToast();
    const [loading, setLoading] = useState(true);
    const [branches, setBranches] = useState<BranchResponse[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<string>("");
    const [stockData, setStockData] = useState<StockByBranchResponse[]>([]);

    const loadBranches = useCallback(async () => {
        try {
            const data = await branchService.list();
            const activeBranches = data.filter(b => b.active);
            setBranches(activeBranches);
            if (activeBranches.length > 0 && !selectedBranch) {
                setSelectedBranch(activeBranches[0].id);
            }
        } catch (error) {
            console.error("Error loading branches:", error);
        }
    }, [selectedBranch]);

    const loadStock = useCallback(async () => {
        if (!selectedBranch) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await reportService.getStockByBranch(selectedBranch);
            // Enriquecer datos con el nombre de la sucursal seleccionada
            const selectedBranchData = branches.find(b => b.id === selectedBranch);
            const enrichedData = data.map(item => ({
                ...item,
                branchName: item.branchName || selectedBranchData?.name || "Sucursal",
            }));
            setStockData(enrichedData);
        } catch (error) {
            console.error("Error loading stock:", error);
            showError("Error al cargar el stock");
            setStockData([]);
        } finally {
            setLoading(false);
        }
    }, [selectedBranch, branches, showError]);

    useEffect(() => {
        loadBranches();
    }, [loadBranches]);

    useEffect(() => {
        if (selectedBranch) {
            loadStock();
        }
    }, [loadStock, selectedBranch]);

    const columns: Column<StockByBranchResponse>[] = [
        {
            id: "branchName",
            header: "Sucursal",
            accessor: "branchName",
            sortable: true,
            render: (value) => (
                <div className="flex items-center gap-2">
                    <HiOutlineCube size={16} className="text-primary" />
                    <span className="font-medium">{value as string}</span>
                </div>
            ),
        },
        {
            id: "productSku",
            header: "SKU",
            accessor: "productSku",
            sortable: true,
            render: (value) => (
                <span className="font-mono text-sm text-text-muted">{value as string}</span>
            ),
        },
        {
            id: "productName",
            header: "Producto",
            accessor: "productName",
            sortable: true,
            render: (value) => (
                <span className="font-medium">{value as string}</span>
            ),
        },
        {
            id: "productBrand",
            header: "Marca",
            accessor: "productBrand",
            sortable: true,
            render: (value) => (
                <span className="text-text-muted">{value as string}</span>
            ),
        },
        {
            id: "totalQuantity",
            header: "Cantidad",
            accessor: "totalQuantity",
            align: "center",
            sortable: true,
            render: (value) => {
                const qty = value as number;
                const variant = qty > 10 ? "success" : qty > 0 ? "warning" : "danger";
                return <TableBadge variant={variant}>{qty}</TableBadge>;
            },
        },
        {
            id: "activeBatches",
            header: "Lotes",
            accessor: "activeBatches",
            align: "center",
            sortable: true,
            render: (value) => (
                <TableBadge variant="info">{value as number}</TableBadge>
            ),
        },
    ];

    if (branches.length === 0 && !loading) {
        return (
            <Alert severity="warning">
                No hay sucursales activas. Crea una sucursal primero para ver reportes.
            </Alert>
        );
    }

    return (
        <Box>
            {/* Filtro y acciones */}
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
                <FormControl size="small" sx={{ minWidth: 250 }}>
                    <InputLabel>Sucursal</InputLabel>
                    <Select
                        value={selectedBranch}
                        label="Sucursal"
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        sx={{
                            backgroundColor: "var(--color-surface)",
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "var(--color-border)",
                            },
                        }}
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
                    size="small"
                    startIcon={<HiOutlineRefresh size={16} />}
                    onClick={loadStock}
                    disabled={loading || !selectedBranch}
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
            </Box>

            {stockData.length === 0 && !loading ? (
                <Alert severity="info">No hay productos en stock</Alert>
            ) : (
                <DataTable
                    data={stockData}
                    columns={columns}
                    rowKey={(row) => `${row.branchId}-${row.productId}`}
                    loading={loading}
                    paginated
                    pageSize={10}
                    pageSizeOptions={[10, 25, 50]}
                    stickyHeader
                    variant="striped"
                    hoverRow
                    emptyMessage="No hay productos en stock"
                    defaultSortColumn="branchName"
                    defaultSortDirection="asc"
                />
            )}
        </Box>
    );
}
