"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    Box,
    IconButton,
    Typography,
    TextField,
    InputAdornment,
    CircularProgress,
    Tooltip,
    Fade,
    Zoom,
} from "@mui/material";
import {
    HiOutlineChat,
    HiX,
    HiOutlinePaperAirplane,
    HiOutlineTrash,
    HiOutlineRefresh,
} from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { useChatbot } from "@/hooks";
import { useChatbotAuth } from "../context";
import { MessageRole } from "@/api/types";

const MotionBox = motion.create(Box);

interface ChatWidgetProps {
    branchSlug: string;
    branchName: string;
}

export default function ChatWidget({ branchSlug, branchName }: ChatWidgetProps) {
    const { user } = useChatbotAuth();
    const {
        messages,
        isSending,
        isLoading,
        error,
        sendMessage,
        tryLoadHistory,
        loadHistory,
        deleteSessions,
        clearMessages,
        clearError,
    } = useChatbot();

    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [hasSession, setHasSession] = useState(false);
    const initialLoadDoneRef = useRef(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Generar sessionKey único basado en usuario y sucursal
    const sessionKey = `${user?.userId || "guest"}-${branchSlug}`;

    // Intentar cargar historial solo una vez cuando se abre el chat por primera vez
    useEffect(() => {
        if (isOpen && user && !initialLoadDoneRef.current) {
            initialLoadDoneRef.current = true;
            tryLoadHistory(sessionKey).then((found) => {
                if (found) {
                    setHasSession(true);
                }
            });
        }
    }, [isOpen, user, sessionKey, tryLoadHistory]);

    // Scroll al final cuando hay nuevos mensajes
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Focus en input cuando se abre
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const handleSend = useCallback(async () => {
        if (!inputValue.trim() || isSending) return;

        const messageText = inputValue.trim();
        setInputValue("");

        const result = await sendMessage(sessionKey, messageText);
        if (result) {
            // El mensaje se envió exitosamente, la sesión ya existe
            setHasSession(true);
        }
    }, [inputValue, isSending, sessionKey, sendMessage]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClearChat = async () => {
        await deleteSessions();
        clearMessages();
        setHasSession(false);
    };

    const handleRefreshHistory = async () => {
        if (hasSession) {
            await loadHistory(sessionKey);
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setHasNewMessage(false);
        }
    };

    return (
        <>
            {/* Botón flotante del chat */}
            <Zoom in={!isOpen}>
                <Box
                    sx={{
                        position: "fixed",
                        bottom: 24,
                        right: 24,
                        zIndex: 1100,
                    }}
                >
                    <Tooltip title="Abrir chat" placement="left">
                        <IconButton
                            onClick={toggleChat}
                            sx={{
                                width: 64,
                                height: 64,
                                background: "linear-gradient(135deg, var(--color-primary) 0%, #1a4a6e 100%)",
                                color: "white",
                                boxShadow: "0 8px 32px rgba(0, 50, 84, 0.4)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    transform: "scale(1.05)",
                                    boxShadow: "0 12px 40px rgba(0, 50, 84, 0.5)",
                                },
                            }}
                        >
                            <HiOutlineChat size={28} />
                            {hasNewMessage && (
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                        width: 12,
                                        height: 12,
                                        bgcolor: "#ef4444",
                                        borderRadius: "50%",
                                        border: "2px solid white",
                                    }}
                                />
                            )}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Zoom>

            {/* Panel del chat */}
            <AnimatePresence>
                {isOpen && (
                    <MotionBox
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        sx={{
                            position: "fixed",
                            bottom: { xs: 0, sm: 24 },
                            right: { xs: 0, sm: 24 },
                            width: { xs: "100%", sm: 400 },
                            height: { xs: "100%", sm: 600 },
                            maxHeight: { xs: "100vh", sm: "calc(100vh - 48px)" },
                            bgcolor: "white",
                            borderRadius: { xs: 0, sm: 3 },
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            zIndex: 1200,
                        }}
                    >
                        {/* Header */}
                        <Box
                            sx={{
                                background: "linear-gradient(135deg, var(--color-primary) 0%, #1a4a6e 100%)",
                                color: "white",
                                px: 2.5,
                                py: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: "12px",
                                        bgcolor: "rgba(255,255,255,0.2)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <HiOutlineChat size={20} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>
                                        Asistente Virtual
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.75rem", opacity: 0.8 }}>
                                        {branchName}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                                <Tooltip title="Limpiar conversación">
                                    <span>
                                        <IconButton
                                            size="small"
                                            onClick={handleClearChat}
                                            disabled={isLoading || isSending || !hasSession}
                                            sx={{ color: "white", opacity: hasSession ? 0.8 : 0.4, "&:hover": { opacity: 1 } }}
                                        >
                                            <HiOutlineTrash size={18} />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title="Recargar historial">
                                    <span>
                                        <IconButton
                                            size="small"
                                            onClick={handleRefreshHistory}
                                            disabled={isLoading || !hasSession}
                                            sx={{ color: "white", opacity: hasSession ? 0.8 : 0.4, "&:hover": { opacity: 1 } }}
                                        >
                                            <HiOutlineRefresh size={18} />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title="Cerrar">
                                    <IconButton
                                        size="small"
                                        onClick={toggleChat}
                                        sx={{ color: "white", opacity: 0.8, "&:hover": { opacity: 1 } }}
                                    >
                                        <HiX size={20} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>

                        {/* Messages */}
                        <Box
                            sx={{
                                flex: 1,
                                overflowY: "auto",
                                p: 2,
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                bgcolor: "#f8fafc",
                            }}
                        >
                            {/* Mensaje de bienvenida si no hay mensajes */}
                            {messages.length === 0 && !isLoading && (
                                <Fade in>
                                    <Box sx={{ textAlign: "center", py: 4 }}>
                                        <Box
                                            sx={{
                                                width: 64,
                                                height: 64,
                                                borderRadius: "16px",
                                                bgcolor: "var(--color-primary)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                mx: "auto",
                                                mb: 2,
                                            }}
                                        >
                                            <HiOutlineChat size={32} color="white" />
                                        </Box>
                                        <Typography
                                            sx={{
                                                fontWeight: 600,
                                                color: "var(--color-text)",
                                                mb: 1,
                                            }}
                                        >
                                            ¡Hola{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
                                        </Typography>
                                        <Typography
                                            sx={{
                                                color: "var(--color-text-muted)",
                                                fontSize: "0.9rem",
                                                maxWidth: 280,
                                                mx: "auto",
                                            }}
                                        >
                                            Soy el asistente virtual de {branchName}. ¿En qué puedo ayudarte hoy?
                                        </Typography>
                                    </Box>
                                </Fade>
                            )}

                            {/* Loading inicial */}
                            {isLoading && messages.length === 0 && (
                                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                    <CircularProgress size={32} sx={{ color: "var(--color-primary)" }} />
                                </Box>
                            )}

                            {/* Mensajes */}
                            {messages.map((msg, index) => {
                                const isUser = msg.role === MessageRole.USER;
                                return (
                                    <MotionBox
                                        key={msg.id.value || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        sx={{
                                            display: "flex",
                                            justifyContent: isUser ? "flex-end" : "flex-start",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                maxWidth: "80%",
                                                px: 2,
                                                py: 1.5,
                                                borderRadius: isUser
                                                    ? "16px 16px 4px 16px"
                                                    : "16px 16px 16px 4px",
                                                bgcolor: isUser ? "var(--color-primary)" : "white",
                                                color: isUser ? "white" : "var(--color-text)",
                                                boxShadow: isUser
                                                    ? "0 2px 8px rgba(0, 50, 84, 0.2)"
                                                    : "0 1px 3px rgba(0,0,0,0.1)",
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: "0.9rem",
                                                    lineHeight: 1.5,
                                                    whiteSpace: "pre-wrap",
                                                    wordBreak: "break-word",
                                                }}
                                            >
                                                {msg.messageText}
                                            </Typography>
                                        </Box>
                                    </MotionBox>
                                );
                            })}

                            {/* Indicador de "escribiendo" */}
                            {isSending && (
                                <MotionBox
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    sx={{ display: "flex", justifyContent: "flex-start" }}
                                >
                                    <Box
                                        sx={{
                                            px: 2,
                                            py: 1.5,
                                            borderRadius: "16px 16px 16px 4px",
                                            bgcolor: "white",
                                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                            display: "flex",
                                            gap: 0.5,
                                            alignItems: "center",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: "50%",
                                                bgcolor: "#94a3b8",
                                                animation: "bounce 1.4s ease-in-out infinite",
                                                "@keyframes bounce": {
                                                    "0%, 80%, 100%": { transform: "translateY(0)" },
                                                    "40%": { transform: "translateY(-6px)" },
                                                },
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: "50%",
                                                bgcolor: "#94a3b8",
                                                animation: "bounce 1.4s ease-in-out infinite",
                                                animationDelay: "0.2s",
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: "50%",
                                                bgcolor: "#94a3b8",
                                                animation: "bounce 1.4s ease-in-out infinite",
                                                animationDelay: "0.4s",
                                            }}
                                        />
                                    </Box>
                                </MotionBox>
                            )}

                            {/* Error */}
                            {error && (
                                <Fade in>
                                    <Box
                                        sx={{
                                            bgcolor: "rgba(239, 68, 68, 0.1)",
                                            border: "1px solid rgba(239, 68, 68, 0.3)",
                                            borderRadius: 2,
                                            p: 1.5,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <Typography sx={{ color: "#ef4444", fontSize: "0.85rem" }}>
                                            {error}
                                        </Typography>
                                        <IconButton size="small" onClick={clearError}>
                                            <HiX size={16} color="#ef4444" />
                                        </IconButton>
                                    </Box>
                                </Fade>
                            )}

                            <div ref={messagesEndRef} />
                        </Box>

                        {/* Input */}
                        <Box
                            sx={{
                                p: 2,
                                bgcolor: "white",
                                borderTop: "1px solid #e2e8f0",
                            }}
                        >
                            <TextField
                                inputRef={inputRef}
                                fullWidth
                                placeholder="Escribe tu mensaje..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isSending}
                                multiline
                                maxRows={3}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleSend}
                                                disabled={!inputValue.trim() || isSending}
                                                sx={{
                                                    bgcolor: inputValue.trim()
                                                        ? "var(--color-primary)"
                                                        : "transparent",
                                                    color: inputValue.trim() ? "white" : "#94a3b8",
                                                    transition: "all 0.2s",
                                                    "&:hover": {
                                                        bgcolor: inputValue.trim()
                                                            ? "#1a4a6e"
                                                            : "transparent",
                                                    },
                                                    "&.Mui-disabled": {
                                                        bgcolor: "transparent",
                                                        color: "#94a3b8",
                                                    },
                                                }}
                                            >
                                                {isSending ? (
                                                    <CircularProgress size={20} sx={{ color: "inherit" }} />
                                                ) : (
                                                    <HiOutlinePaperAirplane size={20} />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        borderRadius: 3,
                                        bgcolor: "#f8fafc",
                                        "& fieldset": { border: "none" },
                                    },
                                }}
                            />
                        </Box>
                    </MotionBox>
                )}
            </AnimatePresence>
        </>
    );
}
