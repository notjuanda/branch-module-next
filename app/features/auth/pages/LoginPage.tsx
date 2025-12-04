"use client";

import { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    IconButton,
    CircularProgress,
} from "@mui/material";
import { 
    HiOutlineEye, 
    HiOutlineEyeOff, 
    HiOutlineUser, 
    HiOutlineLockClosed,
    HiOutlineOfficeBuilding,
} from "react-icons/hi";
import { useAuth } from "../context";
import { useNavigate } from "@/hooks";
import { DEFAULT_ROUTE } from "@/router";

export default function LoginPage() {
    const { login, isLoading } = useAuth();
    const { navigate } = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await login({ username, password });
            navigate(DEFAULT_ROUTE, "Iniciando sesión...");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al iniciar sesión");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                backgroundColor: "#ffffff",
            }}
        >
            {/* Panel izquierdo - Branding (solo visible en md+) */}
            <Box
                sx={{
                    display: { xs: "none", md: "flex" },
                    flex: 1,
                    background: "linear-gradient(135deg, var(--color-primary) 0%, #1a4a6e 100%)",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 6,
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Círculos decorativos */}
                <Box
                    sx={{
                        position: "absolute",
                        top: -100,
                        right: -100,
                        width: 300,
                        height: 300,
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,0.1)",
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        bottom: -150,
                        left: -150,
                        width: 400,
                        height: 400,
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,0.05)",
                    }}
                />

                {/* Contenido */}
                <Box sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: "20px",
                            backgroundColor: "rgba(255,255,255,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 24px",
                            backdropFilter: "blur(10px)",
                        }}
                    >
                        <HiOutlineOfficeBuilding size={40} color="white" />
                    </Box>
                    
                    <Typography
                        variant="h3"
                        sx={{
                            color: "white",
                            fontWeight: 700,
                            mb: 2,
                        }}
                    >
                        Sistema de Gestión
                    </Typography>
                    
                    <Typography
                        variant="h5"
                        sx={{
                            color: "rgba(255,255,255,0.9)",
                            fontWeight: 500,
                            mb: 3,
                        }}
                    >
                        Sucursales e Inventario
                    </Typography>
                    
                    <Typography
                        sx={{
                            color: "rgba(255,255,255,0.7)",
                            maxWidth: 400,
                            lineHeight: 1.7,
                        }}
                    >
                        Administra tus sucursales, empleados, productos y stock 
                        de manera eficiente desde una sola plataforma.
                    </Typography>
                </Box>
            </Box>

            {/* Panel derecho - Formulario de login */}
            <Box
                sx={{
                    flex: { xs: 1, md: "0 0 480px" },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: { xs: 3, sm: 6 },
                    backgroundColor: "#ffffff",
                }}
            >
                <Box
                    sx={{
                        width: "100%",
                        maxWidth: 380,
                    }}
                >
                    {/* Logo móvil */}
                    <Box
                        sx={{
                            display: { xs: "flex", md: "none" },
                            flexDirection: "column",
                            alignItems: "center",
                            mb: 4,
                        }}
                    >
                        <Box
                            sx={{
                                width: 60,
                                height: 60,
                                borderRadius: "16px",
                                background: "linear-gradient(135deg, var(--color-primary) 0%, #1a4a6e 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: 2,
                            }}
                        >
                            <HiOutlineOfficeBuilding size={30} color="white" />
                        </Box>
                        <Typography
                            variant="h6"
                            sx={{ color: "var(--color-primary)", fontWeight: 600 }}
                        >
                            Sistema de Gestión
                        </Typography>
                    </Box>

                    {/* Header del formulario */}
                    <Box sx={{ mb: 4 }}>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                color: "var(--color-text)",
                                mb: 1,
                            }}
                        >
                            Bienvenido
                        </Typography>
                        <Typography
                            sx={{
                                color: "var(--color-text-muted)",
                                fontSize: "0.95rem",
                            }}
                        >
                            Ingresa tus credenciales para continuar
                        </Typography>
                    </Box>

                    {/* Error */}
                    {error && (
                        <Box
                            sx={{
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                borderRadius: 2,
                                padding: 2,
                                mb: 3,
                            }}
                        >
                            <Typography sx={{ color: "var(--color-danger)", fontSize: "0.9rem" }}>
                                {error}
                            </Typography>
                        </Box>
                    )}

                    {/* Formulario */}
                    <Box component="form" onSubmit={handleSubmit}>
                        <Box sx={{ mb: 3 }}>
                            <Typography
                                component="label"
                                sx={{
                                    display: "block",
                                    mb: 1,
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                    color: "var(--color-text)",
                                }}
                            >
                                Usuario
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="Ingresa tu usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoFocus
                                autoComplete="username"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <HiOutlineUser size={20} color="var(--color-text-muted)" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        backgroundColor: "var(--color-surface)",
                                        borderRadius: 2,
                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "var(--color-primary)",
                                        },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "var(--color-primary)",
                                            borderWidth: 2,
                                        },
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "var(--color-border)",
                                    },
                                }}
                            />
                        </Box>

                        <Box sx={{ mb: 4 }}>
                            <Typography
                                component="label"
                                sx={{
                                    display: "block",
                                    mb: 1,
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                    color: "var(--color-text)",
                                }}
                            >
                                Contraseña
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="Ingresa tu contraseña"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <HiOutlineLockClosed size={20} color="var(--color-text-muted)" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                sx={{ color: "var(--color-text-muted)" }}
                                            >
                                                {showPassword ? (
                                                    <HiOutlineEyeOff size={20} />
                                                ) : (
                                                    <HiOutlineEye size={20} />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        backgroundColor: "var(--color-surface)",
                                        borderRadius: 2,
                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "var(--color-primary)",
                                        },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "var(--color-primary)",
                                            borderWidth: 2,
                                        },
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "var(--color-border)",
                                    },
                                }}
                            />
                        </Box>

                        <button
                            type="submit"
                            disabled={isSubmitting || isLoading}
                            className="w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{
                                background: isSubmitting 
                                    ? "var(--color-primary)" 
                                    : "linear-gradient(135deg, var(--color-primary) 0%, #1a4a6e 100%)",
                                boxShadow: "0 4px 14px 0 rgba(0, 50, 84, 0.3)",
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <CircularProgress size={20} sx={{ color: "white" }} />
                                    <span>Ingresando...</span>
                                </>
                            ) : (
                                <span>Iniciar Sesión</span>
                            )}
                        </button>
                    </Box>

                    {/* Footer */}
                    <Typography
                        sx={{
                            textAlign: "center",
                            mt: 4,
                            color: "var(--color-text-muted)",
                            fontSize: "0.8rem",
                        }}
                    >
                        © 2025 Sistema de Gestión de Sucursales
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
