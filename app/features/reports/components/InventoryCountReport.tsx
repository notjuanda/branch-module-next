"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, Skeleton, Alert, FormControl, Select, MenuItem, Button } from "@mui/material";
import {
    HiOutlineOfficeBuilding,
    HiOutlineCube,
    HiOutlineCollection,
    HiOutlineExclamation,
    HiOutlineClock,
    HiOutlineXCircle,
    HiOutlineRefresh,
} from "react-icons/hi";
import { InventoryCountResponse, BranchResponse } from "@/api/types";
import { reportService, branchService } from "@/api/services";
import { Card, CardHeader, CardContent, useToast } from "@/components/ui";

export default function InventoryCountReport() {
    const { showError } = useToast();
    const [loading, setLoading] = useState(true);
    const [branches, setBranches] = useState<BranchResponse[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<string>("all");
    const [inventoryCounts, setInventoryCounts] = useState<InventoryCountResponse[]>([]);

    const loadBranches = useCallback(async () => {
        try {
            const data = await branchService.list();
            setBranches(data.filter(b => b.active));
        } catch (error) {
            console.error("Error loading branches:", error);
        }
    }, []);

    const loadInventoryCounts = useCallback(async () => {
        setLoading(true);
        try {
            if (selectedBranch === "all") {
                const data = await reportService.getAllInventoryCounts();
                setInventoryCounts(data);
            } else {
                const data = await reportService.getInventoryCount(selectedBranch);
                setInventoryCounts([data]);
            }
        } catch (error) {
            console.error("Error loading inventory counts:", error);
            showError("Error al cargar el conteo de inventario");
            setInventoryCounts([]);
        } finally {
            setLoading(false);
        }
    }, [selectedBranch, showError]);

    useEffect(() => {
        loadBranches();
    }, [loadBranches]);

    useEffect(() => {
        loadInventoryCounts();
    }, [loadInventoryCounts]);

    const StatItem = ({ 
        icon: Icon, 
        label, 
        value, 
        color = "var(--color-primary)",
    }: { 
        icon: React.ElementType; 
        label: string; 
        value: number;
        color?: string;
    }) => (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-accent-light/30">
            <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: color }}
            >
                <Icon size={20} className="text-white" />
            </div>
            <div>
                <p className="text-lg font-bold" style={{ color }}>{value}</p>
                <p className="text-sm text-text-muted">{label}</p>
            </div>
        </div>
    );

    const AlertBadge = ({ 
        icon: Icon, 
        label, 
        variant 
    }: { 
        icon: React.ElementType; 
        label: string; 
        variant: "warning" | "danger" | "info";
    }) => {
        const variantStyles = {
            warning: "bg-warning/20 text-warning border-warning/30",
            danger: "bg-danger/20 text-danger border-danger/30",
            info: "bg-info/20 text-info border-info/30",
        };

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${variantStyles[variant]}`}>
                <Icon size={14} />
                {label}
            </span>
        );
    };

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
                    onClick={loadInventoryCounts}
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

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} variant="default">
                            <Skeleton variant="rectangular" height={200} />
                        </Card>
                    ))}
                </div>
            ) : inventoryCounts.length === 0 ? (
                <Alert severity="info">No hay datos de inventario disponibles</Alert>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {inventoryCounts.map((count) => (
                        <Card key={count.branchId} variant="default" size="md">
                            <CardHeader
                                avatar={
                                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                                        <HiOutlineOfficeBuilding size={20} className="text-white" />
                                    </div>
                                }
                                title={count.branchName || "Sucursal"}
                                subtitle="Resumen de inventario"
                            />
                            
                            <CardContent className="mt-3">
                                <div className="flex flex-col gap-2">
                                    <StatItem
                                        icon={HiOutlineCube}
                                        label="Productos"
                                        value={count.totalProducts}
                                        color="var(--color-primary)"
                                    />
                                    <StatItem
                                        icon={HiOutlineCollection}
                                        label="Lotes activos"
                                        value={count.totalBatches}
                                        color="var(--color-info)"
                                    />
                                    <StatItem
                                        icon={HiOutlineCube}
                                        label="Unidades totales"
                                        value={count.totalQuantity}
                                        color="var(--color-success)"
                                    />
                                </div>

                                {/* Alertas */}
                                {(count.lowStockItems > 0 || count.expiringBatches > 0 || count.expiredBatches > 0) && (
                                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                                        {count.lowStockItems > 0 && (
                                            <AlertBadge
                                                icon={HiOutlineExclamation}
                                                label={`${count.lowStockItems} stock bajo`}
                                                variant="warning"
                                            />
                                        )}
                                        {count.expiringBatches > 0 && (
                                            <AlertBadge
                                                icon={HiOutlineClock}
                                                label={`${count.expiringBatches} por vencer`}
                                                variant="warning"
                                            />
                                        )}
                                        {count.expiredBatches > 0 && (
                                            <AlertBadge
                                                icon={HiOutlineXCircle}
                                                label={`${count.expiredBatches} vencidos`}
                                                variant="danger"
                                            />
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </Box>
    );
}
