"use client";

import React from "react";
import {
  Button as MuiButton,
  IconButton as MuiIconButton,
  ButtonProps as MuiButtonProps,
  IconButtonProps as MuiIconButtonProps,
  CircularProgress,
} from "@mui/material";

// ===== TIPOS DE VARIANTES PERSONALIZADAS =====
export type ButtonVariant =
  | "primary" // Acción principal
  | "secondary" // Acción secundaria
  | "success" // Guardar, confirmar
  | "danger" // Eliminar, cancelar destructivo
  | "warning" // Advertencia
  | "info" // Información
  | "ghost" // Sin fondo, solo texto
  | "outline"; // Solo borde

export type ButtonSize = "sm" | "md" | "lg";

// ===== ESTILOS POR VARIANTE =====
const variantStyles: Record<ButtonVariant, { base: string; hover: string }> = {
  primary: {
    base: "bg-primary text-text",
    hover: "hover:bg-primary-hover",
  },
  secondary: {
    base: "bg-secondary text-text",
    hover: "hover:bg-secondary-hover",
  },
  success: {
    base: "bg-success text-text-light",
    hover: "hover:bg-success-hover",
  },
  danger: {
    base: "bg-danger text-text-light",
    hover: "hover:bg-danger-hover",
  },
  warning: {
    base: "bg-warning text-text",
    hover: "hover:bg-warning-hover",
  },
  info: {
    base: "bg-info text-text-light",
    hover: "hover:bg-info-hover",
  },
  ghost: {
    base: "bg-transparent text-text",
    hover: "hover:bg-accent/30",
  },
  outline: {
    base: "bg-transparent text-text border-2 border-primary",
    hover: "hover:bg-primary/20",
  },
};

// ===== ESTILOS POR TAMAÑO =====
const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

const iconSizeStyles: Record<ButtonSize, string> = {
  sm: "p-1.5",
  md: "p-2",
  lg: "p-3",
};

// ===== INTERFAZ DEL BOTÓN =====
export interface ButtonProps
  extends Omit<MuiButtonProps, "variant" | "size" | "color"> {
  /** Variante de estilo del botón */
  variant?: ButtonVariant;
  /** Tamaño del botón */
  size?: ButtonSize;
  /** Icono a mostrar antes del texto */
  startIcon?: React.ReactNode;
  /** Icono a mostrar después del texto */
  endIcon?: React.ReactNode;
  /** Si es true, muestra un spinner de carga */
  loading?: boolean;
  /** Texto del botón mientras carga */
  loadingText?: string;
  /** Si es true, el botón ocupa todo el ancho */
  fullWidth?: boolean;
  /** Clases CSS adicionales */
  className?: string;
  /** Contenido del botón */
  children?: React.ReactNode;
}

// ===== COMPONENTE BUTTON =====
export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  startIcon,
  endIcon,
  loading = false,
  loadingText,
  fullWidth = false,
  disabled = false,
  className = "",
  children,
  ...props
}) => {
  const styles = variantStyles[variant];
  const sizeClass = sizeStyles[size];

  const isDisabled = disabled || loading;

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${styles.base}
    ${!isDisabled ? styles.hover : ""}
    ${sizeClass}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `
    .trim()
    .replace(/\s+/g, " ");

  return (
    <MuiButton
      {...props}
      disabled={isDisabled}
      className={baseClasses}
      sx={{
        textTransform: "none",
        boxShadow: "none",
        "&:hover": { boxShadow: "none" },
        minWidth: "auto",
      }}
    >
      {loading ? (
        <>
          <CircularProgress size={16} color="inherit" />
          {loadingText || children}
        </>
      ) : (
        <>
          {startIcon && <span className="flex-shrink-0">{startIcon}</span>}
          {children}
          {endIcon && <span className="flex-shrink-0">{endIcon}</span>}
        </>
      )}
    </MuiButton>
  );
};

// ===== INTERFAZ DEL ICON BUTTON =====
export interface IconButtonProps
  extends Omit<MuiIconButtonProps, "size" | "color"> {
  /** Variante de estilo */
  variant?: ButtonVariant;
  /** Tamaño del botón */
  size?: ButtonSize;
  /** Icono a mostrar */
  icon: React.ReactNode;
  /** Texto para accesibilidad (aria-label) */
  ariaLabel: string;
  /** Si es true, muestra un spinner de carga */
  loading?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

// ===== COMPONENTE ICON BUTTON =====
export const IconButton: React.FC<IconButtonProps> = ({
  variant = "ghost",
  size = "md",
  icon,
  ariaLabel,
  loading = false,
  disabled = false,
  className = "",
  ...props
}) => {
  const styles = variantStyles[variant];
  const sizeClass = iconSizeStyles[size];

  const isDisabled = disabled || loading;

  const baseClasses = `
    inline-flex items-center justify-center
    rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${styles.base}
    ${!isDisabled ? styles.hover : ""}
    ${sizeClass}
    ${className}
  `
    .trim()
    .replace(/\s+/g, " ");

  return (
    <MuiIconButton
      {...props}
      disabled={isDisabled}
      aria-label={ariaLabel}
      className={baseClasses}
      sx={{
        padding: 0,
      }}
    >
      {loading ? <CircularProgress size={20} color="inherit" /> : icon}
    </MuiIconButton>
  );
};

// ===== BOTONES PRE-CONFIGURADOS PARA ACCIONES COMUNES =====

export interface ActionButtonProps extends Omit<ButtonProps, "variant"> {}

/** Botón de guardar/confirmar */
export const SaveButton: React.FC<ActionButtonProps> = (props) => (
  <Button variant="success" {...props}>
    {props.children || "Guardar"}
  </Button>
);

/** Botón de cancelar (no destructivo) */
export const CancelButton: React.FC<ActionButtonProps> = (props) => (
  <Button variant="ghost" {...props}>
    {props.children || "Cancelar"}
  </Button>
);

/** Botón de eliminar/borrar */
export const DeleteButton: React.FC<ActionButtonProps> = (props) => (
  <Button variant="danger" {...props}>
    {props.children || "Eliminar"}
  </Button>
);

/** Botón de editar */
export const EditButton: React.FC<ActionButtonProps> = (props) => (
  <Button variant="primary" {...props}>
    {props.children || "Editar"}
  </Button>
);

export default Button;
