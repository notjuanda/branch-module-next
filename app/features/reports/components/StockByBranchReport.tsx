"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, FormControl, Select, MenuItem, Alert, Button } from "@mui/material";
import { HiOutlineCube, HiOutlineRefresh } from "react-icons/hi";
import { StockByBranchResponse, BranchResponse } from "@/api/types";
import { reportService, branchService } from "@/api/services";
import { DataTable, Column, TableBadge, useToast } from "@/components/ui";

export default function StockByBranchReport() {
    const { showError } = useToast();
    const [loading, setLoading] = useState(true);
    const [branches, setBranches] = useState<BranchResponse[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<string>("all");
    const [stockData, setStockData] = useState<StockByBranchResponse[]>([]);

    const loadBranches = useCallback(async () => {
        try {
            const data = await branchService.list();
            setBranches(data.filter(b => b.active));
        } catch (error) {
            console.error("Error loading branches:", error);
        }
    }, []);

    const loadStock = useCallback(async () => {
        setLoading(true);
        try {
            if (selectedBranch === "all") {
                const data = await reportService.getAllStockByBranches();
                setStockData(data);
            } else {
                const data = await reportService.getStockByBranch(selectedBranch);
                setStockData(data);
            }
        } catch (error) {
            console.error("Error loading stock:", error);
            showError("Error al cargar el stock");
            setStockData([]);
        } finally {
            setLoading(false);
        }
    }, [selectedBranch, showError]);

    useEffect(() => {
        loadBranches();
    }, [loadBranches]);

    useEffect(() => {
        loadStock();
    }, [loadStock]);

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

    return (
        <Box>
            {/* Filtro y acciones */}
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
                <FormControl size="small" sx={{ minWidth: 250 }}>
                    <Select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        sx={{
                            backgroundColor: "var(--color-surface)",
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "var(--color-border)",
                            },
                        }}
                    >
                        <MenuItem value="all">Todas las sucursales</MenuItem>
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
                    disabled={loading}
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
