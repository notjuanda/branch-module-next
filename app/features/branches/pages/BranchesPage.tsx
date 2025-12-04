"use client";

import { useState } from "react";
import {
    Box,
    Typography,
    Button,
    Grid,
    Skeleton,
    Alert,
} from "@mui/material";
import { HiOutlinePlus, HiOutlineRefresh } from "react-icons/hi";
import {
    BranchCard,
    BranchDetailModal,
    BranchFormModal,
    BranchImagesModal,
    BranchEmployeesModal,
} from "../components";
import { useBranches, useBranchForm } from "../hooks";
import { BranchResponse } from "@/api/types";

export default function BranchesPage() {
    const { branches, loading, error, refetch } = useBranches();
    const {
        isOpen: isFormOpen,
        branchToEdit,
        openCreate,
        openEdit,
        close: closeForm,
    } = useBranchForm();

    // Estado para modal de detalle
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<BranchResponse | null>(null);

    // Estado para modal de imágenes
    const [imagesModalOpen, setImagesModalOpen] = useState(false);
    const [branchForImages, setBranchForImages] = useState<BranchResponse | null>(null);

    // Estado para modal de empleados
    const [employeesModalOpen, setEmployeesModalOpen] = useState(false);
    const [branchForEmployees, setBranchForEmployees] = useState<BranchResponse | null>(null);

    const handleViewDetail = (branch: BranchResponse) => {
        setSelectedBranch(branch);
        setDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setDetailModalOpen(false);
        setSelectedBranch(null);
    };

    const handleImagesClick = (branch: BranchResponse) => {
        setBranchForImages(branch);
        setImagesModalOpen(true);
    };

    const handleCloseImagesModal = () => {
        setImagesModalOpen(false);
        setBranchForImages(null);
    };

    const handleEmployeesClick = (branch: BranchResponse) => {
        setBranchForEmployees(branch);
        setEmployeesModalOpen(true);
    };

    const handleCloseEmployeesModal = () => {
        setEmployeesModalOpen(false);
        setBranchForEmployees(null);
    };

    const handleFormSuccess = () => {
        closeForm();
        refetch();
    };

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={refetch}>
                            Reintentar
                        </Button>
                    }
                >
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Typography variant="h4" component="h1" fontWeight={700}>
                    Sucursales
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<HiOutlineRefresh />}
                        onClick={refetch}
                        disabled={loading}
                    >
                        Actualizar
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<HiOutlinePlus />}
                        onClick={openCreate}
                    >
                        Nueva Sucursal
                    </Button>
                </Box>
            </Box>

            {/* Grid de sucursales */}
            <Grid container spacing={3}>
                {loading
                    ? Array.from({ length: 6 }).map((_, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                            <Skeleton
                                variant="rectangular"
                                height={250}
                                sx={{ borderRadius: 2 }}
                            />
                        </Grid>
                    ))
                    : branches.map((branch) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={branch.id}>
                            <BranchCard
                                branch={branch}
                                onClick={() => handleViewDetail(branch)}
                                onEdit={() => openEdit(branch)}
                                onImagesClick={() => handleImagesClick(branch)}
                                onEmployeesClick={() => handleEmployeesClick(branch)}
                            />
                        </Grid>
                    ))}
            </Grid>

            {/* Empty state */}
            {!loading && branches.length === 0 && (
                <Box
                    sx={{
                        textAlign: "center",
                        py: 8,
                    }}
                >
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No hay sucursales registradas
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<HiOutlinePlus />}
                        onClick={openCreate}
                        sx={{ mt: 2 }}
                    >
                        Crear primera sucursal
                    </Button>
                </Box>
            )}

            {/* Modal de detalle */}
            <BranchDetailModal
                open={detailModalOpen}
                branch={selectedBranch}
                onClose={handleCloseDetailModal}
            />

            {/* Modal de formulario */}
            <BranchFormModal
                open={isFormOpen}
                branch={branchToEdit}
                onClose={closeForm}
                onSuccess={handleFormSuccess}
            />

            {/* Modal de imágenes */}
            <BranchImagesModal
                open={imagesModalOpen}
                branch={branchForImages}
                onClose={handleCloseImagesModal}
                onCoverChange={refetch}
            />

            {/* Modal de empleados */}
            <BranchEmployeesModal
                open={employeesModalOpen}
                branch={branchForEmployees}
                onClose={handleCloseEmployeesModal}
            />
        </Box>
    );
}
