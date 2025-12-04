"use client";

import { useEffect, useRef } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useChatbotAuth } from "../context";

interface ChatbotProtectedRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onUnauthenticated?: () => void;
}

export function ChatbotProtectedRoute({
    children,
    fallback,
    onUnauthenticated,
}: ChatbotProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useChatbotAuth();
    const hasCalledUnauthenticated = useRef(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated && !hasCalledUnauthenticated.current) {
            hasCalledUnauthenticated.current = true;
            if (onUnauthenticated) {
                onUnauthenticated();
            }
        }
    }, [isAuthenticated, isLoading, onUnauthenticated]);

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 200,
                    gap: 2,
                }}
            >
                <CircularProgress size={32} sx={{ color: "primary.main" }} />
                <Typography variant="body2" color="text.secondary">
                    Verificando sesión del chat...
                </Typography>
            </Box>
        );
    }

    if (!isAuthenticated) {
        if (fallback) {
            return <>{fallback}</>;
        }
        return null;
    }

    return <>{children}</>;
}

export default ChatbotProtectedRoute;
