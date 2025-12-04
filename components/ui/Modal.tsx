"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  Fade,
  Grow,
  Zoom,
  Paper,
  PaperProps,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton, Button, ButtonProps } from "./Button";

// ===== TIPOS =====
export type ModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "full" | "auto";
export type ModalTransition = "slide" | "fade" | "grow" | "zoom";

// ===== TRANSICIONES =====
const transitions: Record<
  ModalTransition,
  React.ForwardRefExoticComponent<
    TransitionProps & { children: React.ReactElement }
  >
> = {
  slide: React.forwardRef(function SlideTransition(
    props: TransitionProps & { children: React.ReactElement },
    ref
  ) {
    return <Slide direction="up" ref={ref} {...props} />;
  }),
  fade: React.forwardRef(function FadeTransition(
    props: TransitionProps & { children: React.ReactElement },
    ref
  ) {
    return <Fade ref={ref} {...props} />;
  }),
  grow: React.forwardRef(function GrowTransition(
    props: TransitionProps & { children: React.ReactElement },
    ref
  ) {
    return <Grow ref={ref} {...props} />;
  }),
  zoom: React.forwardRef(function ZoomTransition(
    props: TransitionProps & { children: React.ReactElement },
    ref
  ) {
    return <Zoom ref={ref} {...props} />;
  }),
};

// ===== TAMAÑOS =====
// Mapeo de tamaños personalizados a maxWidth de MUI Dialog
type MuiMaxWidth = "xs" | "sm" | "md" | "lg" | "xl" | false;
const sizeToMuiMaxWidth: Record<ModalSize, MuiMaxWidth> = {
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
  full: "xl",
  auto: false,
};

// ===== INTERFAZ DE BOTÓN DE ACCIÓN =====
export interface ModalActionButton extends Omit<ButtonProps, "onClick"> {
  /** Texto o contenido del botón */
  label: React.ReactNode;
  /** Handler del click */
  onClick?: () => void | Promise<void>;
  /** Cierra el modal al hacer click */
  closeOnClick?: boolean;
}

// ===== INTERFAZ PRINCIPAL DEL MODAL =====
export interface ModalProps {
  /** Controla si el modal está abierto */
  open: boolean;
  /** Callback cuando se cierra el modal */
  onClose: () => void;

  // ===== HEADER =====
  /** Título del modal */
  title?: React.ReactNode;
  /** Subtítulo o descripción bajo el título */
  subtitle?: React.ReactNode;
  /** Icono junto al título */
  titleIcon?: React.ReactNode;
  /** Contenido personalizado del header (reemplaza title/subtitle) */
  customHeader?: React.ReactNode;
  /** Oculta el header completamente */
  hideHeader?: boolean;
  /** Muestra botón de cerrar (X) en el header */
  showCloseButton?: boolean;

  // ===== CONTENT =====
  /** Contenido principal del modal */
  children: React.ReactNode;
  /** Sin padding en el contenido */
  noPadding?: boolean;
  /** Permite scroll en el contenido */
  scrollable?: boolean;

  // ===== FOOTER / ACCIONES =====
  /** Botones de acción predefinidos */
  actions?: ModalActionButton[];
  /** Contenido personalizado del footer (reemplaza actions) */
  customFooter?: React.ReactNode;
  /** Oculta el footer completamente */
  hideFooter?: boolean;
  /** Alineación de los botones */
  actionsAlign?: "left" | "center" | "right" | "between";

  // ===== APARIENCIA =====
  /** Tamaño del modal */
  size?: ModalSize;
  /** Tipo de transición */
  transition?: ModalTransition;
  /** Cierra al hacer click fuera del modal */
  closeOnBackdropClick?: boolean;
  /** Cierra al presionar Escape */
  closeOnEscape?: boolean;
  /** Clases CSS adicionales para el contenedor */
  className?: string;
  /** Clases CSS para el contenido */
  contentClassName?: string;
  /** Z-index personalizado */
  zIndex?: number;
  /** Mantiene el modal montado cuando está cerrado */
  keepMounted?: boolean;
  /** Muestra dividers entre secciones */
  dividers?: boolean;
}

// ===== ESTILOS DE ALINEACIÓN =====
const alignStyles: Record<string, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
  between: "justify-between",
};

// ===== COMPONENTE PAPER PERSONALIZADO =====
const CustomPaper = React.forwardRef<HTMLDivElement, PaperProps>(
  ({ className, ...props }, ref) => {
    return (
      <Paper
        ref={ref}
        {...props}
        className={className}
        sx={{
          backgroundColor: "var(--color-surface)",
          borderRadius: "0.75rem",
          width: "100%",
        }}
      />
    );
  }
);
CustomPaper.displayName = "CustomPaper";

// ===== COMPONENTE MODAL =====
export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,

  // Header
  title,
  subtitle,
  titleIcon,
  customHeader,
  hideHeader = false,
  showCloseButton = true,

  // Content
  children,
  noPadding = false,
  scrollable = true,

  // Footer
  actions,
  customFooter,
  hideFooter = false,
  actionsAlign = "right",

  // Appearance
  size = "md",
  transition = "fade",
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = "",
  contentClassName = "",
  zIndex,
  keepMounted = false,
  dividers = false,
}) => {
  const handleClose = (
    _event: object,
    reason: "backdropClick" | "escapeKeyDown"
  ) => {
    if (reason === "backdropClick" && !closeOnBackdropClick) return;
    if (reason === "escapeKeyDown" && !closeOnEscape) return;
    onClose();
  };

  const handleActionClick = async (action: ModalActionButton) => {
    if (action.onClick) {
      await action.onClick();
    }
    if (action.closeOnClick !== false) {
      onClose();
    }
  };

  const TransitionComponent = transitions[transition];
  const muiMaxWidth = sizeToMuiMaxWidth[size];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={TransitionComponent}
      keepMounted={keepMounted}
      PaperComponent={CustomPaper}
      className={className}
      maxWidth={muiMaxWidth}
      fullWidth={size !== "auto"}
      sx={{
        zIndex: zIndex,
        "& .MuiBackdrop-root": {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
        },
      }}
    >
      {/* ===== HEADER ===== */}
      {!hideHeader &&
        (customHeader || (
          <DialogTitle
            className={`
              flex items-center justify-between gap-3
              px-6 py-4
              ${dividers ? "border-b border-border" : ""}
            `.trim()}
            sx={{ padding: 0 }}
          >
            <div className="flex items-center gap-3 px-6 py-4 flex-1 min-w-0">
              {titleIcon && (
                <span className="flex-shrink-0 text-primary">{titleIcon}</span>
              )}
              <div className="flex flex-col min-w-0">
                {title && (
                  <h2 className="text-lg font-semibold text-text truncate">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-sm text-text-muted truncate">{subtitle}</p>
                )}
              </div>
            </div>

            {showCloseButton && (
              <div className="flex-shrink-0 pr-4">
                <IconButton
                  icon={<CloseIcon />}
                  ariaLabel="Cerrar modal"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                />
              </div>
            )}
          </DialogTitle>
        ))}

      {/* ===== CONTENT ===== */}
      <DialogContent
        className={`
          ${noPadding ? "p-0" : "px-6 py-4"}
          ${scrollable ? "overflow-y-auto" : "overflow-hidden"}
          ${dividers && !hideFooter ? "border-b border-border" : ""}
          ${contentClassName}
        `.trim()}
        sx={{
          padding: noPadding ? 0 : undefined,
        }}
      >
        {children}
      </DialogContent>

      {/* ===== FOOTER ===== */}
      {!hideFooter && (actions?.length || customFooter) && (
        <DialogActions
          className={`
            px-6 py-4
            flex ${alignStyles[actionsAlign]} gap-3
          `.trim()}
          sx={{ padding: "1rem 1.5rem" }}
        >
          {customFooter ||
            actions?.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                size={action.size}
                startIcon={action.startIcon}
                endIcon={action.endIcon}
                loading={action.loading}
                disabled={action.disabled}
                className={action.className}
                onClick={() => handleActionClick(action)}
              >
                {action.label}
              </Button>
            ))}
        </DialogActions>
      )}
    </Dialog>
  );
};

// ===== MODALES PRE-CONFIGURADOS =====

// ----- MODAL DE CONFIRMACIÓN -----
export interface ConfirmModalProps
  extends Omit<ModalProps, "actions" | "children"> {
  /** Mensaje de confirmación */
  message: React.ReactNode;
  /** Texto del botón de confirmar */
  confirmText?: string;
  /** Texto del botón de cancelar */
  cancelText?: string;
  /** Callback al confirmar */
  onConfirm: () => void | Promise<void>;
  /** Callback al cancelar (además de cerrar) */
  onCancel?: () => void;
  /** Variante del botón de confirmar */
  confirmVariant?: ButtonProps["variant"];
  /** Estado de carga del botón confirmar */
  confirmLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  confirmVariant = "primary",
  confirmLoading = false,
  onClose,
  ...props
}) => {
  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <Modal
      {...props}
      onClose={handleCancel}
      size="sm"
      actions={[
        {
          label: cancelText,
          variant: "ghost",
          onClick: handleCancel,
          closeOnClick: false,
        },
        {
          label: confirmText,
          variant: confirmVariant,
          onClick: handleConfirm,
          loading: confirmLoading,
          closeOnClick: false,
        },
      ]}
    >
      <div className="text-text">{message}</div>
    </Modal>
  );
};

// ----- MODAL DE ELIMINACIÓN -----
export interface DeleteModalProps
  extends Omit<ConfirmModalProps, "confirmVariant" | "confirmText"> {
  /** Nombre del item a eliminar (para el mensaje) */
  itemName?: string;
  /** Texto del botón de eliminar */
  deleteText?: string;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  itemName,
  deleteText = "Eliminar",
  message,
  ...props
}) => {
  const defaultMessage = itemName
    ? `¿Estás seguro de que deseas eliminar "${itemName}"? Esta acción no se puede deshacer.`
    : "¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.";

  return (
    <ConfirmModal
      {...props}
      message={message || defaultMessage}
      confirmText={deleteText}
      confirmVariant="danger"
      title={props.title || "Confirmar eliminación"}
    />
  );
};

// ----- MODAL DE FORMULARIO -----
export interface FormModalProps extends Omit<ModalProps, "actions"> {
  /** Texto del botón de guardar */
  saveText?: string;
  /** Texto del botón de cancelar */
  cancelText?: string;
  /** Callback al guardar */
  onSave: () => void | Promise<void>;
  /** Estado de carga del botón guardar */
  saveLoading?: boolean;
  /** Deshabilita el botón de guardar */
  saveDisabled?: boolean;
}

export const FormModal: React.FC<FormModalProps> = ({
  saveText = "Guardar",
  cancelText = "Cancelar",
  onSave,
  saveLoading = false,
  saveDisabled = false,
  onClose,
  children,
  ...props
}) => {
  const handleSave = async () => {
    await onSave();
  };

  return (
    <Modal
      {...props}
      onClose={onClose}
      actions={[
        {
          label: cancelText,
          variant: "ghost",
          onClick: onClose,
        },
        {
          label: saveText,
          variant: "success",
          onClick: handleSave,
          loading: saveLoading,
          disabled: saveDisabled,
          closeOnClick: false,
        },
      ]}
    >
      {children}
    </Modal>
  );
};

export default Modal;
