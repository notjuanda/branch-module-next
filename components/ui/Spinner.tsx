"use client";

import { Box, CircularProgress, Typography } from "@mui/material";

interface SpinnerProps {
  message?: string;
  fullScreen?: boolean;
  size?: number;
}

export function Spinner({
  message = "Cargando...",
  fullScreen = false,
  size = 40,
}: SpinnerProps) {
  const content = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <CircularProgress size={size} sx={{ color: "var(--color-primary)" }} />
      {message && (
        <Typography variant="body2" sx={{ color: "#6b7280" }}>
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
}

export default Spinner;
