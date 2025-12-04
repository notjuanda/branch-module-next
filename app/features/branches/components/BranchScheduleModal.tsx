"use client";

import { useState, useEffect } from "react";
import { Modal, useToast } from "@/components/ui";
import {
    Box,
    Typography,
    FormControl,
    Select,
    MenuItem,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Tooltip,
    CircularProgress,
    Alert,
    Button,
    Switch,
    FormControlLabel,
} from "@mui/material";
import {
    HiOutlineClock,
    HiOutlineTrash,
    HiOutlinePlus,
} from "react-icons/hi";
import { BranchResponse, ScheduleResponse, ScheduleRequest } from "@/api/types";
import { scheduleService } from "@/api/services";

interface BranchScheduleModalProps {
    open: boolean;
    onClose: () => void;
    branch: BranchResponse | null;
}

const DAYS_OF_WEEK = [
    { value: 0, label: "Domingo" },
    { value: 1, label: "Lunes" },
    { value: 2, label: "Martes" },
    { value: 3, label: "Miércoles" },
    { value: 4, label: "Jueves" },
    { value: 5, label: "Viernes" },
    { value: 6, label: "Sábado" },
];

const getDayLabel = (dayOfWeek: number): string => {
    return DAYS_OF_WEEK.find(d => d.value === dayOfWeek)?.label || "Desconocido";
};

const formatTime = (time: string | null): string => {
    if (!time) return "-";
    // Convertir HH:mm:ss a HH:mm
    return time.substring(0, 5);
};

export default function BranchScheduleModal({
    open,
    onClose,
    branch,
}: BranchScheduleModalProps) {
    const { showSuccess, showError, showWarning } = useToast();

    // Estados
    const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);

    // Form para agregar
    const [selectedDay, setSelectedDay] = useState<number | "">("");
    const [isClosed, setIsClosed] = useState(false);
    const [openTime, setOpenTime] = useState("08:00");
    const [closeTime, setCloseTime] = useState("18:00");

    // Días ya agregados (para excluirlos del selector)
    const existingDays = schedules.map(s => s.dayOfWeek);
    const availableDays = DAYS_OF_WEEK.filter(d => !existingDays.includes(d.value));

    const loadSchedules = async () => {
        if (!branch) return;

        setLoadingData(true);
        try {
            const data = await scheduleService.getWeek(branch.id);
            // Ordenar por día de la semana
            const sorted = [...data].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
            setSchedules(sorted);
        } catch (error) {
            console.error("Error loading schedules:", error);
            showError("Error al cargar los horarios");
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (open && branch) {
            loadSchedules();
            resetForm();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, branch]);

    const resetForm = () => {
        setSelectedDay("");
        setIsClosed(false);
        setOpenTime("08:00");
        setCloseTime("18:00");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const validateForm = (): boolean => {
        if (selectedDay === "") {
            showWarning("Selecciona un día de la semana");
            return false;
        }

        if (existingDays.includes(selectedDay as number)) {
            showError("Este día ya tiene un horario asignado");
            return false;
        }

        if (!isClosed) {
            if (!openTime) {
                showWarning("Ingresa la hora de apertura");
                return false;
            }
            if (!closeTime) {
                showWarning("Ingresa la hora de cierre");
                return false;
            }
            if (openTime >= closeTime) {
                showError("La hora de apertura debe ser anterior a la hora de cierre");
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!branch || !validateForm()) return;

        setLoading(true);
        try {
            const scheduleData: ScheduleRequest = {
                dayOfWeek: selectedDay as number,
                closed: isClosed,
                open: isClosed ? undefined : `${openTime}:00`,
                close: isClosed ? undefined : `${closeTime}:00`,
            };

            await scheduleService.upsert(branch.id, scheduleData);
            showSuccess(`Horario de ${getDayLabel(selectedDay as number)} agregado correctamente`);
            resetForm();
            await loadSchedules();
        } catch (error) {
            console.error("Error adding schedule:", error);
            const errorMessage = error instanceof Error ? error.message : "Error al agregar el horario";
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSchedule = async (dayOfWeek: number) => {
        if (!branch) return;

        setDeleting(dayOfWeek);
        try {
            await scheduleService.deleteDay(branch.id, dayOfWeek);
            showSuccess(`Horario de ${getDayLabel(dayOfWeek)} eliminado`);
            await loadSchedules();
        } catch (error) {
            console.error("Error deleting schedule:", error);
            const errorMessage = error instanceof Error ? error.message : "Error al eliminar el horario";
            showError(errorMessage);
        } finally {
            setDeleting(null);
        }
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            size="md"
            title={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <HiOutlineClock size={24} />
                    <Typography variant="h6" component="span">
                        Horarios de Atención
                    </Typography>
                </Box>
            }
            subtitle={branch ? `Sucursal: ${branch.name}` : ""}
            customFooter={
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1.5,
                        pt: 2,
                        borderTop: "1px solid var(--color-border)",
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={handleClose}
                        sx={{
                            borderColor: "var(--color-border)",
                            color: "var(--color-text)",
                            "&:hover": {
                                borderColor: "var(--color-primary)",
                                backgroundColor: "rgba(0, 50, 84, 0.04)",
                            },
                        }}
                    >
                        Cerrar
                    </Button>
                </Box>
            }
        >
            {loadingData ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={40} sx={{ color: "var(--color-primary)" }} />
                </Box>
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {/* Lista de horarios actuales */}
                    <Box>
                        <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, mb: 1.5, color: "var(--color-text)" }}
                        >
                            Horarios configurados ({schedules.length}/7)
                        </Typography>

                        {schedules.length === 0 ? (
                            <Alert
                                severity="info"
                                icon={<HiOutlineClock size={20} />}
                                sx={{ backgroundColor: "var(--color-surface)" }}
                            >
                                No hay horarios configurados para esta sucursal
                            </Alert>
                        ) : (
                            <List
                                sx={{
                                    bgcolor: "var(--color-surface)",
                                    borderRadius: 2,
                                    border: "1px solid var(--color-border)",
                                    p: 0,
                                    maxHeight: 250,
                                    overflow: "auto",
                                }}
                            >
                                {schedules.map((schedule) => (
                                    <ListItem
                                        key={schedule.id}
                                        sx={{
                                            borderBottom: "1px solid var(--color-border)",
                                            "&:last-child": { borderBottom: "none" },
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {getDayLabel(schedule.dayOfWeek)}
                                                    </Typography>
                                                    {schedule.closed ? (
                                                        <Chip
                                                            label="Cerrado"
                                                            size="small"
                                                            color="error"
                                                            sx={{ height: 20, fontSize: "0.65rem" }}
                                                        />
                                                    ) : (
                                                        <Chip
                                                            label="Abierto"
                                                            size="small"
                                                            color="success"
                                                            sx={{ height: 20, fontSize: "0.65rem" }}
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                schedule.closed ? (
                                                    <Typography variant="caption" sx={{ color: "var(--color-text-muted)" }}>
                                                        Sin atención
                                                    </Typography>
                                                ) : (
                                                    <Typography variant="caption" sx={{ color: "var(--color-text-muted)" }}>
                                                        {formatTime(schedule.open)} - {formatTime(schedule.close)}
                                                    </Typography>
                                                )
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <Tooltip title="Eliminar horario">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteSchedule(schedule.dayOfWeek)}
                                                    disabled={deleting === schedule.dayOfWeek}
                                                    sx={{
                                                        color: "var(--color-text-muted)",
                                                        "&:hover": {
                                                            backgroundColor: "var(--color-danger)",
                                                            color: "white",
                                                        },
                                                    }}
                                                >
                                                    {deleting === schedule.dayOfWeek ? (
                                                        <CircularProgress size={16} />
                                                    ) : (
                                                        <HiOutlineTrash size={16} />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>

                    {/* Formulario para agregar */}
                    <Box
                        sx={{
                            p: 2,
                            bgcolor: "var(--color-surface)",
                            borderRadius: 2,
                            border: "1px solid var(--color-border)",
                        }}
                    >
                        <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, mb: 2, color: "var(--color-text)" }}
                        >
                            Agregar horario
                        </Typography>

                        {availableDays.length === 0 ? (
                            <Alert severity="success">
                                Todos los días de la semana ya tienen horario configurado
                            </Alert>
                        ) : (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                {/* Día de la semana */}
                                <FormControl fullWidth size="small">
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "var(--color-text-muted)",
                                            fontWeight: 500,
                                            mb: 0.5,
                                        }}
                                    >
                                        Día de la semana *
                                    </Typography>
                                    <Select
                                        value={selectedDay}
                                        onChange={(e) => setSelectedDay(e.target.value as number)}
                                        displayEmpty
                                        sx={{
                                            backgroundColor: "var(--color-background)",
                                            "& .MuiOutlinedInput-notchedOutline": {
                                                borderColor: "var(--color-border)",
                                            },
                                        }}
                                    >
                                        <MenuItem value="" disabled>
                                            Seleccionar día
                                        </MenuItem>
                                        {availableDays.map((day) => (
                                            <MenuItem key={day.value} value={day.value}>
                                                {day.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {/* Switch cerrado */}
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={isClosed}
                                            onChange={(e) => setIsClosed(e.target.checked)}
                                            sx={{
                                                "& .MuiSwitch-switchBase.Mui-checked": {
                                                    color: "var(--color-danger)",
                                                },
                                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                                    backgroundColor: "var(--color-danger)",
                                                },
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography variant="body2" sx={{ color: "var(--color-text)" }}>
                                            Cerrado (sin atención)
                                        </Typography>
                                    }
                                />

                                {/* Horarios (solo si no está cerrado) */}
                                {!isClosed && (
                                    <Box sx={{ display: "flex", gap: 2 }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: "var(--color-text-muted)",
                                                    fontWeight: 500,
                                                    mb: 0.5,
                                                    display: "block",
                                                }}
                                            >
                                                Hora de apertura *
                                            </Typography>
                                            <TextField
                                                type="time"
                                                size="small"
                                                fullWidth
                                                value={openTime}
                                                onChange={(e) => setOpenTime(e.target.value)}
                                                sx={{
                                                    backgroundColor: "var(--color-background)",
                                                    "& .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: "var(--color-border)",
                                                    },
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: "var(--color-text-muted)",
                                                    fontWeight: 500,
                                                    mb: 0.5,
                                                    display: "block",
                                                }}
                                            >
                                                Hora de cierre *
                                            </Typography>
                                            <TextField
                                                type="time"
                                                size="small"
                                                fullWidth
                                                value={closeTime}
                                                onChange={(e) => setCloseTime(e.target.value)}
                                                sx={{
                                                    backgroundColor: "var(--color-background)",
                                                    "& .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: "var(--color-border)",
                                                    },
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                )}

                                {/* Botón agregar */}
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    disabled={loading || selectedDay === ""}
                                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <HiOutlinePlus size={18} />}
                                    sx={{
                                        mt: 1,
                                        backgroundColor: "var(--color-success)",
                                        color: "white",
                                        "&:hover": {
                                            backgroundColor: "var(--color-success-hover)",
                                        },
                                        "&:disabled": {
                                            backgroundColor: "var(--color-surface)",
                                            color: "var(--color-text-muted)",
                                        },
                                    }}
                                >
                                    {loading ? "Agregando..." : "Agregar horario"}
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Box>
            )}
        </Modal>
    );
}
