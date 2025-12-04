"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Snackbar, Alert, AlertColor, Slide, Grow, Fade } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "./Button";

// ===== TIPOS =====
export type ToastVariant = "success" | "error" | "warning" | "info";
export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";
export type ToastTransition = "slide" | "grow" | "fade";

// ===== MAPEO DE POSICIONES =====
const positionMap: Record<
  ToastPosition,
  { vertical: "top" | "bottom"; horizontal: "left" | "center" | "right" }
> = {
  "top-left": { vertical: "top", horizontal: "left" },
  "top-center": { vertical: "top", horizontal: "center" },
  "top-right": { vertical: "top", horizontal: "right" },
  "bottom-left": { vertical: "bottom", horizontal: "left" },
  "bottom-center": { vertical: "bottom", horizontal: "center" },
  "bottom-right": { vertical: "bottom", horizontal: "right" },
};

// ===== ESTILOS POR VARIANTE =====
const variantStyles: Record<ToastVariant, React.CSSProperties> = {
  success: {
    backgroundColor: "var(--color-success)",
    color: "var(--color-text-light)",
    borderLeftColor: "var(--color-success-hover)",
  },
  error: {
    backgroundColor: "var(--color-danger)",
    color: "var(--color-text-light)",
    borderLeftColor: "var(--color-danger-hover)",
  },
  warning: {
    backgroundColor: "var(--color-warning)",
    color: "var(--color-text)",
    borderLeftColor: "var(--color-warning-hover)",
  },
  info: {
    backgroundColor: "var(--color-info)",
    color: "var(--color-text-light)",
    borderLeftColor: "var(--color-info-hover)",
  },
};

// ===== ICONOS POR VARIANTE =====
const variantIcons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircleIcon />,
  error: <ErrorIcon />,
  warning: <WarningIcon />,
  info: <InfoIcon />,
};

// ===== TRANSICIONES =====
function SlideTransition(
  props: TransitionProps & { children: React.ReactElement }
) {
  return <Slide {...props} direction="down" />;
}

function GrowTransition(
  props: TransitionProps & { children: React.ReactElement }
) {
  return <Grow {...props} />;
}

function FadeTransition(
  props: TransitionProps & { children: React.ReactElement }
) {
  return <Fade {...props} />;
}

const transitionMap: Record<
  ToastTransition,
  React.ComponentType<TransitionProps & { children: React.ReactElement }>
> = {
  slide: SlideTransition,
  grow: GrowTransition,
  fade: FadeTransition,
};

// ===== INTERFAZ DEL TOAST =====
export interface ToastProps {
  /** Controla si el toast está visible */
  open: boolean;
  /** Callback al cerrar */
  onClose: () => void;
  /** Mensaje del toast */
  message: React.ReactNode;
  /** Variante de estilo */
  variant?: ToastVariant;
  /** Posición en pantalla */
  position?: ToastPosition;
  /** Duración en ms (null = no auto-cierra) */
  duration?: number | null;
  /** Tipo de transición */
  transition?: ToastTransition;
  /** Icono personalizado (null = sin icono) */
  icon?: React.ReactNode | null;
  /** Muestra botón de cerrar */
  showCloseButton?: boolean;
  /** Título del toast */
  title?: string;
  /** Acción personalizada */
  action?: React.ReactNode;
  /** Clases CSS adicionales */
  className?: string;
}

// ===== COMPONENTE TOAST =====
export const Toast: React.FC<ToastProps> = ({
  open,
  onClose,
  message,
  variant = "info",
  position = "top-right",
  duration = 3000,
  transition = "slide",
  icon,
  showCloseButton = false,
  title,
  action,
  className = "",
}) => {
  const { vertical, horizontal } = positionMap[position];
  const TransitionComponent = transitionMap[transition];
  const displayIcon = icon === null ? null : icon || variantIcons[variant];

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={(_, reason) => {
        if (reason !== "clickaway") onClose();
      }}
      anchorOrigin={{ vertical, horizontal }}
      TransitionComponent={TransitionComponent}
      sx={{ zIndex: 9999 }}
    >
      <div
        className={`
          flex items-start gap-3 p-4 rounded-lg shadow-lg border-l-4
          min-w-[300px] max-w-[500px]
          ${className}
        `.trim()}
        style={variantStyles[variant]}
      >
        {/* Icono */}
        {displayIcon && (
          <span className="flex-shrink-0 mt-0.5">{displayIcon}</span>
        )}

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          {title && <p className="font-semibold text-sm mb-1">{title}</p>}
          <p className="text-sm">{message}</p>
        </div>

        {/* Acción personalizada */}
        {action && <div className="flex-shrink-0">{action}</div>}

        {/* Botón cerrar */}
        {showCloseButton && (
          <IconButton
            icon={<CloseIcon fontSize="small" />}
            ariaLabel="Cerrar notificación"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex-shrink-0 -mt-1 -mr-1 text-current opacity-70 hover:opacity-100"
          />
        )}
      </div>
    </Snackbar>
  );
};

// ===== TOAST CON ALERT DE MUI (alternativo) =====
export interface AlertToastProps extends Omit<ToastProps, "variant"> {
  severity?: AlertColor;
}

export const AlertToast: React.FC<AlertToastProps> = ({
  open,
  onClose,
  message,
  severity = "info",
  position = "top-right",
  duration = 3000,
  transition = "slide",
  showCloseButton = false,
  title,
}) => {
  const { vertical, horizontal } = positionMap[position];
  const TransitionComponent = transitionMap[transition];

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={(_, reason) => {
        if (reason !== "clickaway") onClose();
      }}
      anchorOrigin={{ vertical, horizontal }}
      TransitionComponent={TransitionComponent}
      sx={{ zIndex: 9999 }}
    >
      <Alert
        severity={severity}
        onClose={showCloseButton ? onClose : undefined}
        sx={{
          minWidth: 300,
          "& .MuiAlert-message": {
            width: "100%",
          },
        }}
      >
        {title && <div className="font-semibold mb-1">{title}</div>}
        {message}
      </Alert>
    </Snackbar>
  );
};

// ===== CONTEXT Y HOOK PARA TOASTS GLOBALES =====
interface ToastOptions {
  message: React.ReactNode;
  variant?: ToastVariant;
  position?: ToastPosition;
  duration?: number | null;
  title?: string;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
  showSuccess: (message: React.ReactNode, title?: string) => void;
  showError: (message: React.ReactNode, title?: string) => void;
  showWarning: (message: React.ReactNode, title?: string) => void;
  showInfo: (message: React.ReactNode, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de un ToastProvider");
  }
  return context;
};

interface ToastState extends ToastOptions {
  id: number;
  open: boolean;
}

// Componente interno para un toast individual apilable
const StackedToast: React.FC<{
  toast: ToastState;
  index: number;
  onClose: () => void;
}> = ({ toast, index, onClose }) => {
  const displayIcon = variantIcons[toast.variant || "info"];
  
  useEffect(() => {
    if (toast.duration !== null) {
      const timer = setTimeout(onClose, toast.duration || 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, onClose]);

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg shadow-lg border-l-4
        min-w-[300px] max-w-[500px]
        transform transition-all duration-300
        ${toast.open ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `.trim()}
      style={{
        ...variantStyles[toast.variant || "info"],
        marginBottom: "8px",
      }}
    >
      {/* Icono */}
      {displayIcon && (
        <span className="flex-shrink-0 mt-0.5">{displayIcon}</span>
      )}

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        {toast.title && <p className="font-semibold text-sm mb-1">{toast.title}</p>}
        <p className="text-sm">{toast.message}</p>
      </div>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentToast, setCurrentToast] = useState<ToastState | null>(null);

  const showToast = useCallback((options: ToastOptions) => {
    const id = Date.now() + Math.random();
    // Reemplazar el toast actual con el nuevo
    setCurrentToast({ ...options, id, open: true });
  }, []);

  const closeToast = useCallback(() => {
    setCurrentToast((prev) => prev ? { ...prev, open: false } : null);
    // Remover después de la animación
    setTimeout(() => {
      setCurrentToast(null);
    }, 300);
  }, []);

  const showSuccess = useCallback(
    (message: React.ReactNode, title?: string) => {
      showToast({ message, title, variant: "success" });
    },
    [showToast]
  );

  const showError = useCallback(
    (message: React.ReactNode, title?: string) => {
      showToast({ message, title, variant: "error" });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: React.ReactNode, title?: string) => {
      showToast({ message, title, variant: "warning" });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: React.ReactNode, title?: string) => {
      showToast({ message, title, variant: "info" });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, showWarning, showInfo }}
    >
      {children}
      {/* Contenedor del toast único */}
      <div
        style={{
          position: "fixed",
          top: "16px",
          right: "16px",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        {currentToast && (
          <div style={{ pointerEvents: "auto" }}>
            <StackedToast
              toast={currentToast}
              index={0}
              onClose={closeToast}
            />
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
};

export default Toast;
