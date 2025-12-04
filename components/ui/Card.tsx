"use client";

import React from "react";

// ===== TIPOS =====
export type CardVariant = "default" | "outlined" | "elevated" | "filled";
export type CardSize = "sm" | "md" | "lg";

// ===== ESTILOS =====
const variantStyles: Record<CardVariant, string> = {
  default: "bg-surface border border-border shadow-sm",
  outlined: "bg-transparent border-2 border-border",
  elevated: "bg-surface shadow-lg",
  filled: "bg-accent-light border border-border-light",
};

const sizeStyles: Record<CardSize, { padding: string; gap: string }> = {
  sm: { padding: "p-3", gap: "gap-2" },
  md: { padding: "p-4", gap: "gap-3" },
  lg: { padding: "p-6", gap: "gap-4" },
};

// ===== CARD CONTAINER =====
export interface CardProps {
  /** Contenido de la card */
  children: React.ReactNode;
  /** Variante de estilo */
  variant?: CardVariant;
  /** Tamaño de padding */
  size?: CardSize;
  /** Sin padding interno */
  noPadding?: boolean;
  /** Click handler (hace la card clickeable) */
  onClick?: () => void;
  /** Href para hacer la card un link */
  href?: string;
  /** Clases CSS adicionales */
  className?: string;
  /** Props adicionales del div */
  [key: string]: unknown;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  size = "md",
  noPadding = false,
  onClick,
  href,
  className = "",
  ...props
}) => {
  const isClickable = onClick || href;
  const { padding } = sizeStyles[size];

  const baseClasses = `
    rounded-xl overflow-hidden
    ${variantStyles[variant]}
    ${!noPadding ? padding : ""}
    ${isClickable ? "cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary" : ""}
    ${className}
  `.trim();

  if (href) {
    return (
      <a href={href} className={baseClasses} {...props}>
        {children}
      </a>
    );
  }

  return (
    <div
      className={baseClasses}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

// ===== CARD HEADER =====
export interface CardHeaderProps {
  /** Título de la card */
  title?: React.ReactNode;
  /** Subtítulo o descripción */
  subtitle?: React.ReactNode;
  /** Icono o avatar */
  avatar?: React.ReactNode;
  /** Acciones (botones, menú, etc.) */
  action?: React.ReactNode;
  /** Clases CSS adicionales */
  className?: string;
  /** Contenido personalizado (reemplaza title/subtitle) */
  children?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  avatar,
  action,
  className = "",
  children,
}) => {
  if (children) {
    return <div className={`flex items-center gap-3 ${className}`}>{children}</div>;
  }

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {avatar && <div className="flex-shrink-0">{avatar}</div>}

      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-lg font-semibold text-text truncate">{title}</h3>
        )}
        {subtitle && (
          <p className="text-sm text-text-muted mt-0.5 truncate">{subtitle}</p>
        )}
      </div>

      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

// ===== CARD CONTENT =====
export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = "",
  noPadding = false,
}) => {
  return (
    <div className={`${!noPadding ? "py-2" : ""} ${className}`}>
      {children}
    </div>
  );
};

// ===== CARD MEDIA =====
export interface CardMediaProps {
  /** URL de la imagen */
  src: string;
  /** Alt text */
  alt: string;
  /** Altura de la imagen */
  height?: number | string;
  /** Posición de la imagen */
  position?: "top" | "bottom";
  /** Overlay sobre la imagen */
  overlay?: React.ReactNode;
  /** Clases CSS adicionales */
  className?: string;
}

export const CardMedia: React.FC<CardMediaProps> = ({
  src,
  alt,
  height = 200,
  position = "top",
  overlay,
  className = "",
}) => {
  const roundedClass = position === "top" ? "rounded-t-xl" : "rounded-b-xl";

  return (
    <div className={`relative overflow-hidden ${roundedClass} ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full object-cover"
        style={{ height: typeof height === "number" ? `${height}px` : height }}
      />
      {overlay && (
        <div className="absolute inset-0 bg-black/40 flex items-end p-4">
          {overlay}
        </div>
      )}
    </div>
  );
};

// ===== CARD FOOTER / ACTIONS =====
export interface CardFooterProps {
  children: React.ReactNode;
  /** Alineación de los elementos */
  align?: "left" | "center" | "right" | "between";
  /** Separador superior */
  divider?: boolean;
  className?: string;
}

const alignClasses: Record<string, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
  between: "justify-between",
};

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  align = "right",
  divider = false,
  className = "",
}) => {
  return (
    <div
      className={`
        flex items-center gap-2 pt-3
        ${alignClasses[align]}
        ${divider ? "border-t border-border mt-3" : ""}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
};

// ===== CARD BADGE =====
export interface CardBadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info";
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}

const badgeVariantStyles: Record<string, string> = {
  primary: "bg-primary text-text",
  secondary: "bg-secondary text-text",
  success: "bg-success text-text-light",
  danger: "bg-danger text-text-light",
  warning: "bg-warning text-text",
  info: "bg-info text-text-light",
};

const badgePositionStyles: Record<string, string> = {
  "top-left": "top-2 left-2",
  "top-right": "top-2 right-2",
  "bottom-left": "bottom-2 left-2",
  "bottom-right": "bottom-2 right-2",
};

export const CardBadge: React.FC<CardBadgeProps> = ({
  children,
  variant = "primary",
  position = "top-right",
  className = "",
}) => {
  return (
    <span
      className={`
        absolute ${badgePositionStyles[position]}
        px-2 py-1 text-xs font-medium rounded-full
        ${badgeVariantStyles[variant]}
        ${className}
      `.trim()}
    >
      {children}
    </span>
  );
};

// ===== CARD GRID (para layouts de cards) =====
export interface CardGridProps {
  children: React.ReactNode;
  /** Número de columnas (responsive) */
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /** Gap entre cards */
  gap?: "sm" | "md" | "lg";
  className?: string;
}

const gapStyles: Record<string, string> = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
};

export const CardGrid: React.FC<CardGridProps> = ({
  children,
  cols = { default: 1, sm: 2, lg: 3 },
  gap = "md",
  className = "",
}) => {
  const colClasses = [
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`grid ${colClasses} ${gapStyles[gap]} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
