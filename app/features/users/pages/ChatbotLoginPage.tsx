"use client";

import { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    IconButton,
    CircularProgress,
    Tabs,
    Tab,
} from "@mui/material";
import {
    HiOutlineEye,
    HiOutlineEyeOff,
    HiOutlineUser,
    HiOutlineLockClosed,
    HiOutlineMail,
    HiOutlineChat,
} from "react-icons/hi";
import { useChatbotAuth } from "../context";

interface ChatbotLoginPageProps {
    onSuccess?: () => void;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && <Box>{children}</Box>}
        </div>
    );
}

// Helper para parsear errores del backend
function parseBackendError(error: unknown): string {
    if (error instanceof Error) {
        const message = error.message;
        // Formato: {campo=mensaje} o {campo=mensaje, campo2=mensaje2}
        const objectMatch = message.match(/^\{(.+)\}$/);
        if (objectMatch) {
            const pairs = objectMatch[1].split(", ");
            const messages = pairs.map((pair) => {
                const [, value] = pair.split("=");
                return value || pair;
            });
            return messages.join(". ");
        }
        return message;
    }
    return "Error desconocido";
}

export function ChatbotLoginPage({ onSuccess }: ChatbotLoginPageProps) {
    const { login, register, isAuthenticated } = useChatbotAuth();
    const [tabValue, setTabValue] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Login form
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Register form
    const [registerName, setRegisterName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

    if (isAuthenticated) {
        onSuccess?.();
        return null;
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await login({ email: loginEmail, password: loginPassword });
            onSuccess?.();
        } catch (err) {
            setError(parseBackendError(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (registerPassword !== registerConfirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        if (registerPassword.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres");
            return;
        }

        setIsSubmitting(true);

        try {
            await register({
                email: registerEmail,
                name: registerName,
                password: registerPassword,
            });
            onSuccess?.();
        } catch (err) {
            setError(parseBackendError(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyles = {
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
                        <HiOutlineChat size={40} color="white" />
                    </Box>

                    <Typography
                        variant="h3"
                        sx={{
                            color: "white",
                            fontWeight: 700,
                            mb: 2,
                        }}
                    >
                        Chat de Sucursal
                    </Typography>

                    <Typography
                        variant="h5"
                        sx={{
                            color: "rgba(255,255,255,0.9)",
                            fontWeight: 500,
                            mb: 3,
                        }}
                    >
                        Atención personalizada
                    </Typography>

                    <Typography
                        sx={{
                            color: "rgba(255,255,255,0.7)",
                            maxWidth: 400,
                            lineHeight: 1.7,
                        }}
                    >
                        Accede a nuestro chat para obtener información sobre
                        productos, horarios y servicios de la sucursal.
                    </Typography>
                </Box>
            </Box>

            {/* Panel derecho - Formulario */}
            <Box
                sx={{
                    flex: { xs: 1, md: "0 0 500px" },
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
                        maxWidth: 400,
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
                            <HiOutlineChat size={30} color="white" />
                        </Box>
                        <Typography
                            variant="h6"
                            sx={{ color: "var(--color-primary)", fontWeight: 600 }}
                        >
                            Chat de Sucursal
                        </Typography>
                    </Box>

                    {/* Header del formulario */}
                    <Box sx={{ mb: 3 }}>
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
                            Ingresa o crea una cuenta para continuar
                        </Typography>
                    </Box>

                    {/* Tabs */}
                    <Tabs
                        value={tabValue}
                        onChange={(_, newValue) => {
                            setTabValue(newValue);
                            setError(null);
                        }}
                        variant="fullWidth"
                        sx={{
                            mb: 3,
                            "& .MuiTab-root": {
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: "0.95rem",
                            },
                            "& .Mui-selected": {
                                color: "var(--color-primary) !important",
                            },
                            "& .MuiTabs-indicator": {
                                backgroundColor: "var(--color-primary)",
                            },
                        }}
                    >
                        <Tab label="Iniciar sesión" />
                        <Tab label="Registrarse" />
                    </Tabs>

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

                    {/* Login Tab */}
                    <TabPanel value={tabValue} index={0}>
                        <Box component="form" onSubmit={handleLogin}>
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
                                    Correo electrónico
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Ingresa tu correo"
                                    type="email"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    disabled={isSubmitting}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <HiOutlineMail size={20} color="var(--color-text-muted)" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={inputStyles}
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
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    disabled={isSubmitting}
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
                                    sx={inputStyles}
                                />
                            </Box>

                            <button
                                type="submit"
                                disabled={isSubmitting}
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
                    </TabPanel>

                    {/* Register Tab */}
                    <TabPanel value={tabValue} index={1}>
                        <Box component="form" onSubmit={handleRegister}>
                            <Box sx={{ mb: 2.5 }}>
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
                                    Nombre
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Ingresa tu nombre"
                                    value={registerName}
                                    onChange={(e) => setRegisterName(e.target.value)}
                                    required
                                    autoFocus
                                    disabled={isSubmitting}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <HiOutlineUser size={20} color="var(--color-text-muted)" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={inputStyles}
                                />
                            </Box>

                            <Box sx={{ mb: 2.5 }}>
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
                                    Correo electrónico
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Ingresa tu correo"
                                    type="email"
                                    value={registerEmail}
                                    onChange={(e) => setRegisterEmail(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <HiOutlineMail size={20} color="var(--color-text-muted)" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={inputStyles}
                                />
                            </Box>

                            <Box sx={{ mb: 2.5 }}>
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
                                    placeholder="Mínimo 8 caracteres"
                                    type={showPassword ? "text" : "password"}
                                    value={registerPassword}
                                    onChange={(e) => setRegisterPassword(e.target.value)}
                                    required
                                    disabled={isSubmitting}
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
                                    sx={inputStyles}
                                />
                            </Box>

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
                                    Confirmar contraseña
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Repite tu contraseña"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={registerConfirmPassword}
                                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <HiOutlineLockClosed size={20} color="var(--color-text-muted)" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    edge="end"
                                                    sx={{ color: "var(--color-text-muted)" }}
                                                >
                                                    {showConfirmPassword ? (
                                                        <HiOutlineEyeOff size={20} />
                                                    ) : (
                                                        <HiOutlineEye size={20} />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={inputStyles}
                                />
                            </Box>

                            <button
                                type="submit"
                                disabled={isSubmitting}
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
                                        <span>Creando cuenta...</span>
                                    </>
                                ) : (
                                    <span>Crear Cuenta</span>
                                )}
                            </button>
                        </Box>
                    </TabPanel>

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

export default ChatbotLoginPage;
