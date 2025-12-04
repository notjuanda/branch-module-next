"use client";

import { useState, useEffect, useCallback } from "react";
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
    { value: "IN", label: "Entrada" },
    { value: "OUT", label: "Salida" },
    { value: "TRANSFER", label: "Transferencia" },
    { value: "ADJUSTMENT", label: "Ajuste" },
];

const getMovementTypeVariant = (type: MovementType): "success" | "danger" | "info" | "warning" => {
    switch (type) {
        case "IN": return "success";
        case "OUT": return "danger";
        case "TRANSFER": return "info";
        case "ADJUSTMENT": return "warning";
        default: return "info";
    }
};

const getMovementTypeLabel = (type: MovementType): string => {
    switch (type) {
        case "IN": return "Entrada";
        case "OUT": return "Salida";
        case "TRANSFER": return "Transferencia";
        case "ADJUSTMENT": return "Ajuste";
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
            accessor: (row) => row.sourceBranchName || "-",
            render: (_, row) => (
                <div className="flex items-center gap-1">
                    <span className="text-sm">{row.sourceBranchName || "-"}</span>
                    {row.movementType === "TRANSFER" && (
                        <>
                            <HiOutlineArrowRight size={14} className="text-text-muted" />
                            <span className="text-sm">{row.destinationBranchName || "-"}</span>
                        </>
                    )}
                </div>
            ),
        },
        {
            id: "quantity",
            header: "Cantidad",
            accessor: "quantity",
            align: "center",
            sortable: true,
            render: (value, row) => {
                const qty = value as number;
                const prefix = row.movementType === "IN" ? "+" : row.movementType === "OUT" ? "-" : "";
                const color = row.movementType === "IN" 
                    ? "text-success" 
                    : row.movementType === "OUT" 
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
