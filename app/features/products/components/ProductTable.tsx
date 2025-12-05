"use client";

import { useState } from "react";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
    Chip,
    Typography,
    Badge,
} from "@mui/material";
import {
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineOfficeBuilding,
} from "react-icons/hi";
import { ProductResponse } from "@/api/types";
import { ConfirmDeleteModal, useToast } from "@/components/ui";
import { inventoryService } from "@/api/services";

interface ProductTableProps {
    products: ProductResponse[];
    branchId: string;
    onEdit: (product: ProductResponse) => void;
    onDelete?: (productId: string) => void;
    onAssignBranch?: (product: ProductResponse) => void;
    /** Mapa de productId -> número de sucursales asignadas */
    branchCountMap?: Record<string, number>;
}

export default function ProductTable({
    products,
    branchId,
    onEdit,
    onDelete,
    onAssignBranch,
    branchCountMap = {},
}: ProductTableProps) {
    const { showSuccess, showError } = useToast();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] =
        useState<ProductResponse | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleDeleteClick = (product: ProductResponse) => {
        setProductToDelete(product);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete || !branchId) return;

        setDeleting(true);
        try {
            await inventoryService.deleteProduct(branchId, productToDelete.id);
            showSuccess(
                `Producto "${productToDelete.name}" eliminado`
            );
            onDelete?.(productToDelete.id);
            setDeleteModalOpen(false);
            setProductToDelete(null);
        } catch (error) {
            console.error("Error deleting product:", error);
            const errorMessage = error instanceof Error ? error.message : "Error al eliminar el producto";
            showError(errorMessage);
        } finally {
            setDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setDeleteModalOpen(false);
        setProductToDelete(null);
    };

    // Formatear precio
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("es-BO", {
            style: "currency",
            currency: "BOB",
        }).format(price);
    };

    return (
        <>
            <TableContainer
                component={Paper}
                sx={{
                    backgroundColor: "var(--color-background)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 2,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow
                            sx={{
                                backgroundColor: "var(--color-surface)",
                                "& th": {
                                    fontWeight: 600,
                                    color: "var(--color-text)",
                                    borderBottom: "2px solid var(--color-border)",
                                },
                            }}
                        >
                            <TableCell>Producto</TableCell>
                            <TableCell>SKU</TableCell>
                            <TableCell>Marca</TableCell>
                            <TableCell>Categoría</TableCell>
                            <TableCell>Precio</TableCell>
                            <TableCell>Unidad</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    sx={{
                                        textAlign: "center",
                                        py: 4,
                                        color: "var(--color-text-muted)",
                                    }}
                                >
                                    No hay productos registrados
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow
                                    key={product.id}
                                    sx={{
                                        "&:hover": {
                                            backgroundColor: "var(--color-surface)",
                                        },
                                        "& td": {
                                            borderBottom: "1px solid var(--color-border)",
                                        },
                                    }}
                                >
                                    {/* Nombre */}
                                    <TableCell>
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                sx={{ fontWeight: 500, color: "var(--color-text)" }}
                                            >
                                                {product.name}
                                            </Typography>
                                            {product.description && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{ color: "var(--color-text-muted)" }}
                                                >
                                                    {product.description}
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>

                                    {/* SKU */}
                                    <TableCell>
                                        <Chip
                                            label={product.sku}
                                            size="small"
                                            sx={{
                                                backgroundColor: "rgba(0, 50, 84, 0.1)",
                                                color: "var(--color-primary)",
                                                fontWeight: 500,
                                            }}
                                        />
                                    </TableCell>

                                    {/* Marca */}
                                    <TableCell>
                                        <Typography variant="body2">
                                            {product.brand}
                                        </Typography>
                                    </TableCell>

                                    {/* Categoría */}
                                    <TableCell>
                                        {product.category ? (
                                            <Typography variant="body2">
                                                {product.category}
                                            </Typography>
                                        ) : (
                                            <Typography
                                                variant="body2"
                                                sx={{ color: "var(--color-text-muted)" }}
                                            >
                                                -
                                            </Typography>
                                        )}
                                    </TableCell>

                                    {/* Precio */}
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {formatPrice(product.unitPrice)}
                                        </Typography>
                                    </TableCell>

                                    {/* Unidad */}
                                    <TableCell>
                                        <Typography variant="body2">
                                            {product.unit}
                                        </Typography>
                                    </TableCell>

                                    {/* Estado */}
                                    <TableCell>
                                        <Chip
                                            label={product.active ? "Activo" : "Inactivo"}
                                            color={product.active ? "success" : "error"}
                                            size="small"
                                            sx={{ fontWeight: 500 }}
                                        />
                                    </TableCell>

                                    {/* Acciones */}
                                    <TableCell align="right">
                                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                                            <Tooltip title={
                                                branchCountMap[product.id] 
                                                    ? `${branchCountMap[product.id]} sucursal(es) asignada(s)` 
                                                    : "Sin sucursales - Clic para asignar"
                                            }>
                                                <Badge 
                                                    badgeContent={branchCountMap[product.id] || 0} 
                                                    color="primary"
                                                    sx={{
                                                        "& .MuiBadge-badge": {
                                                            backgroundColor: branchCountMap[product.id] 
                                                                ? "var(--color-success)" 
                                                                : "var(--color-warning)",
                                                            color: "white",
                                                            fontSize: "0.65rem",
                                                            minWidth: 16,
                                                            height: 16,
                                                        }
                                                    }}
                                                >
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onAssignBranch?.(product)}
                                                        sx={{
                                                            color: branchCountMap[product.id] 
                                                                ? "var(--color-success)" 
                                                                : "var(--color-text-muted)",
                                                            "&:hover": {
                                                                backgroundColor: "var(--color-primary)",
                                                                color: "white",
                                                            },
                                                        }}
                                                    >
                                                        <HiOutlineOfficeBuilding size={18} />
                                                    </IconButton>
                                                </Badge>
                                            </Tooltip>
                                            <Tooltip title="Editar">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onEdit(product)}
                                                    sx={{
                                                        color: "var(--color-text-muted)",
                                                        "&:hover": {
                                                            backgroundColor: "var(--color-success)",
                                                            color: "white",
                                                        },
                                                    }}
                                                >
                                                    <HiOutlinePencil size={18} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Eliminar">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteClick(product)}
                                                    sx={{
                                                        color: "var(--color-text-muted)",
                                                        "&:hover": {
                                                            backgroundColor: "var(--color-danger)",
                                                            color: "white",
                                                        },
                                                    }}
                                                >
                                                    <HiOutlineTrash size={18} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal de confirmación de eliminación */}
            <ConfirmDeleteModal
                open={deleteModalOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Eliminar producto"
                itemName={productToDelete?.name}
                loading={deleting}
            />
        </>
    );
}
