"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Box,
    Typography,
    FormControl,
    Select,
    MenuItem,
    Alert,
    TextField,
    Button,
    CircularProgress,
} from "@mui/material";
import {
    HiOutlineArrowRight,
    HiOutlineSearch,
} from "react-icons/hi";
import { MovementReportResponse, BranchResponse, MovementType } from "@/api/types";
import { reportService, branchService } from "@/api/services";
import { DataTable, Column, TableBadge, useToast } from "@/components/ui";

const MOVEMENT_TYPES: { value: MovementType | "ALL"; label: string }[] = [
    { value: "ALL", label: "Todos" },
    { value: "ENTRY", label: "Entrada" },
    { value: "EXIT", label: "Salida" },
    { value: "TRANSFER", label: "Transferencia" },
    { value: "ADJUSTMENT", label: "Ajuste" },
    { value: "EXPIRED_WRITE_OFF", label: "Baja por vencimiento" },
];

const getMovementTypeVariant = (type: MovementType): "success" | "danger" | "info" | "warning" => {
    switch (type) {
        case "ENTRY": return "success";
        case "EXIT": return "danger";
        case "TRANSFER": return "info";
        case "ADJUSTMENT": return "warning";
        case "EXPIRED_WRITE_OFF": return "danger";
        default: return "info";
    }
};

const getMovementTypeLabel = (type: MovementType): string => {
    switch (type) {
        case "ENTRY": return "Entrada";
        case "EXIT": return "Salida";
        case "TRANSFER": return "Transferencia";
        case "ADJUSTMENT": return "Ajuste";
        case "EXPIRED_WRITE_OFF": return "Baja vencimiento";
        default: return type;
    }
};

const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("es-BO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export default function MovementsReport() {
    const { showError } = useToast();
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState<BranchResponse[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<string>("");
    const [selectedType, setSelectedType] = useState<MovementType | "ALL">("ALL");
    const [movements, setMovements] = useState<MovementReportResponse[]>([]);

    // Fechas por defecto: último mes
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [fromDate, setFromDate] = useState(lastMonth.toISOString().split("T")[0]);
    const [toDate, setToDate] = useState(today.toISOString().split("T")[0]);

    // Mapa de branchId -> branchName para resolver los nombres
    const branchNameMap = useMemo(() => {
        const map: Record<string, string> = {};
        branches.forEach(b => {
            map[b.id] = b.name;
        });
        return map;
    }, [branches]);

    // Función helper para obtener nombre de sucursal
    const getBranchName = (branchId: string | null): string => {
        if (!branchId) return "-";
        return branchNameMap[branchId] || branchId;
    };

    const loadBranches = useCallback(async () => {
        try {
            const data = await branchService.list();
            setBranches(data.filter(b => b.active));
            if (data.length > 0) {
                setSelectedBranch(data[0].id);
            }
        } catch (error) {
            console.error("Error loading branches:", error);
        }
    }, []);

    useEffect(() => {
        loadBranches();
    }, [loadBranches]);

    const loadMovements = async () => {
        if (!selectedBranch) {
            showError("Selecciona una sucursal");
            return;
        }

        setLoading(true);
        try {
            const from = `${fromDate}T00:00:00`;
            const to = `${toDate}T23:59:59`;

            let data: MovementReportResponse[];
            if (selectedType === "ALL") {
                data = await reportService.getMovementsByBranch(selectedBranch, from, to);
            } else {
                data = await reportService.getMovementsByType(selectedBranch, selectedType, from, to);
            }
            
            // Ordenar por fecha descendente
            data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setMovements(data);
        } catch (error) {
            console.error("Error loading movements:", error);
            showError("Error al cargar los movimientos");
            setMovements([]);
        } finally {
            setLoading(false);
        }
    };

    const columns: Column<MovementReportResponse>[] = [
        {
            id: "createdAt",
            header: "Fecha",
            accessor: "createdAt",
            sortable: true,
            render: (value) => (
                <span className="text-sm text-text-muted">{formatDateTime(value as string)}</span>
            ),
        },
        {
            id: "movementType",
            header: "Tipo",
            accessor: "movementType",
            sortable: true,
            render: (value) => (
                <TableBadge variant={getMovementTypeVariant(value as MovementType)}>
                    {getMovementTypeLabel(value as MovementType)}
                </TableBadge>
            ),
        },
        {
            id: "productName",
            header: "Producto",
            accessor: "productName",
            sortable: true,
            render: (_, row) => (
                <div>
                    <span className="font-medium">{row.productName}</span>
                    <span className="block text-xs text-text-muted">{row.productBrand}</span>
                </div>
            ),
        },
        {
            id: "batchNumber",
            header: "Lote",
            accessor: "batchNumber",
            render: (value) => (
                <span className="font-mono text-sm">{value as string}</span>
            ),
        },
        {
            id: "branches",
            header: "Origen / Destino",
            accessor: (row) => getBranchName(row.sourceBranchId),
            render: (_, row) => {
                const sourceName = getBranchName(row.sourceBranchId);
                const destName = getBranchName(row.destinationBranchId);
                
                // Para ENTRY solo mostramos destino
                if (row.movementType === "ENTRY") {
                    return <span className="text-sm">→ {destName}</span>;
                }
                // Para EXIT solo mostramos origen
                if (row.movementType === "EXIT" || row.movementType === "EXPIRED_WRITE_OFF") {
                    return <span className="text-sm">{sourceName} →</span>;
                }
                // Para TRANSFER mostramos origen -> destino
                if (row.movementType === "TRANSFER") {
                    return (
                        <div className="flex items-center gap-1">
                            <span className="text-sm">{sourceName}</span>
                            <HiOutlineArrowRight size={14} className="text-text-muted" />
                            <span className="text-sm">{destName}</span>
                        </div>
                    );
                }
                // Para ADJUSTMENT
                return <span className="text-sm">{sourceName || destName}</span>;
            },
        },
        {
            id: "quantity",
            header: "Cantidad",
            accessor: "quantity",
            align: "center",
            sortable: true,
            render: (value, row) => {
                const qty = value as number;
                const prefix = row.movementType === "ENTRY" ? "+" : row.movementType === "EXIT" ? "-" : "";
                const color = row.movementType === "ENTRY" 
                    ? "text-success" 
                    : row.movementType === "EXIT" || row.movementType === "EXPIRED_WRITE_OFF"
                    ? "text-danger" 
                    : "text-text";
                return <span className={`font-bold ${color}`}>{prefix}{qty}</span>;
            },
        },
        {
            id: "reason",
            header: "Razón",
            accessor: "reason",
            render: (value) => (
                <span className="text-sm text-text-muted">{(value as string) || "-"}</span>
            ),
        },
    ];

    return (
        <Box>
            {/* Filtros */}
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    mb: 3,
                    p: 2,
                    backgroundColor: "var(--color-surface)",
                    borderRadius: 2,
                    border: "1px solid var(--color-border)",
                }}
            >
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <Typography variant="caption" sx={{ color: "var(--color-text-muted)", mb: 0.5 }}>
                        Sucursal
                    </Typography>
                    <Select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        sx={{
                            backgroundColor: "var(--color-background)",
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

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Typography variant="caption" sx={{ color: "var(--color-text-muted)", mb: 0.5 }}>
                        Tipo
                    </Typography>
                    <Select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value as MovementType | "ALL")}
                        sx={{
                            backgroundColor: "var(--color-background)",
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "var(--color-border)",
                            },
                        }}
                    >
                        {MOVEMENT_TYPES.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                                {type.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box>
                    <Typography variant="caption" sx={{ color: "var(--color-text-muted)", mb: 0.5, display: "block" }}>
                        Desde
                    </Typography>
                    <TextField
                        type="date"
                        size="small"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        sx={{
                            backgroundColor: "var(--color-background)",
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "var(--color-border)",
                            },
                        }}
                    />
                </Box>

                <Box>
                    <Typography variant="caption" sx={{ color: "var(--color-text-muted)", mb: 0.5, display: "block" }}>
                        Hasta
                    </Typography>
                    <TextField
                        type="date"
                        size="small"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        sx={{
                            backgroundColor: "var(--color-background)",
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "var(--color-border)",
                            },
                        }}
                    />
                </Box>

                <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                    <Button
                        variant="contained"
                        onClick={loadMovements}
                        disabled={loading || !selectedBranch}
                        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <HiOutlineSearch size={18} />}
                        sx={{
                            backgroundColor: "var(--color-success)",
                            "&:hover": {
                                backgroundColor: "var(--color-success-hover)",
                            },
                        }}
                    >
                        Buscar
                    </Button>
                </Box>
            </Box>

            {/* Resultados */}
            {movements.length === 0 && !loading ? (
                <Alert severity="info">
                    {selectedBranch 
                        ? "No hay movimientos en el período seleccionado. Haz clic en Buscar para consultar."
                        : "Selecciona una sucursal y haz clic en Buscar"}
                </Alert>
            ) : (
                <DataTable
                    data={movements}
                    columns={columns}
                    rowKey="movementId"
                    loading={loading}
                    paginated
                    pageSize={15}
                    pageSizeOptions={[15, 30, 50, 100]}
                    stickyHeader
                    variant="striped"
                    hoverRow
                    emptyMessage="No hay movimientos registrados"
                    defaultSortColumn="createdAt"
                    defaultSortDirection="desc"
                />
            )}
        </Box>
    );
}
