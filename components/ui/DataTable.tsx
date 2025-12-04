"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Checkbox,
  Paper,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import { IconButton } from "./Button";

// ===== TIPOS =====
export type SortDirection = "asc" | "desc";

export interface Column<T> {
  /** ID único de la columna */
  id: string;
  /** Header de la columna */
  header: React.ReactNode;
  /** Accessor para obtener el valor (puede ser key de T o función) */
  accessor: keyof T | ((row: T) => React.ReactNode);
  /** Ancho de la columna */
  width?: number | string;
  /** Alineación del contenido */
  align?: "left" | "center" | "right";
  /** Si la columna es ordenable */
  sortable?: boolean;
  /** Función de ordenamiento personalizada */
  sortFn?: (a: T, b: T, direction: SortDirection) => number;
  /** Render personalizado de la celda */
  render?: (value: unknown, row: T, rowIndex: number) => React.ReactNode;
  /** Clases CSS para las celdas */
  cellClassName?: string;
  /** Clases CSS para el header */
  headerClassName?: string;
  /** Tooltip del header */
  headerTooltip?: string;
  /** Sticky column */
  sticky?: "left" | "right";
}

export interface DataTableProps<T> {
  /** Datos a mostrar */
  data: T[];
  /** Definición de columnas */
  columns: Column<T>[];
  /** Key única para cada fila */
  rowKey: keyof T | ((row: T) => string | number);

  // ===== SELECCIÓN =====
  /** Habilita selección de filas */
  selectable?: boolean;
  /** Filas seleccionadas (controlado) */
  selectedRows?: T[];
  /** Callback al cambiar selección */
  onSelectionChange?: (selected: T[]) => void;
  /** Selección múltiple */
  multiSelect?: boolean;

  // ===== ORDENAMIENTO =====
  /** Columna ordenada por defecto */
  defaultSortColumn?: string;
  /** Dirección de orden por defecto */
  defaultSortDirection?: SortDirection;
  /** Callback al ordenar (para ordenamiento servidor) */
  onSort?: (columnId: string, direction: SortDirection) => void;
  /** Ordenamiento manual (servidor) */
  manualSorting?: boolean;

  // ===== PAGINACIÓN =====
  /** Habilita paginación */
  paginated?: boolean;
  /** Filas por página */
  pageSize?: number;
  /** Opciones de filas por página */
  pageSizeOptions?: number[];
  /** Página actual (controlado) */
  page?: number;
  /** Total de filas (para paginación servidor) */
  totalRows?: number;
  /** Callback al cambiar página */
  onPageChange?: (page: number, pageSize: number) => void;
  /** Paginación manual (servidor) */
  manualPagination?: boolean;

  // ===== ACCIONES =====
  /** Acciones por fila */
  rowActions?: (row: T, rowIndex: number) => React.ReactNode;
  /** Acciones bulk (selección múltiple) */
  bulkActions?: (selectedRows: T[]) => React.ReactNode;

  // ===== ESTADOS =====
  /** Cargando datos */
  loading?: boolean;
  /** Mensaje cuando no hay datos */
  emptyMessage?: React.ReactNode;
  /** Componente para estado vacío */
  emptyComponent?: React.ReactNode;

  // ===== ESTILOS =====
  /** Variante de la tabla */
  variant?: "default" | "striped" | "bordered";
  /** Tamaño de las celdas */
  size?: "sm" | "md" | "lg";
  /** Hover en filas */
  hoverRow?: boolean;
  /** Altura máxima (scroll) */
  maxHeight?: number | string;
  /** Sin contenedor Paper */
  noPaper?: boolean;
  /** Clases CSS adicionales */
  className?: string;
  /** Sticky header */
  stickyHeader?: boolean;

  // ===== EVENTOS =====
  /** Click en fila */
  onRowClick?: (row: T, rowIndex: number) => void;
  /** Doble click en fila */
  onRowDoubleClick?: (row: T, rowIndex: number) => void;
}

// ===== ESTILOS =====
const sizeStyles = {
  sm: { cell: "py-1 px-2 text-sm", header: "py-2 px-2 text-sm" },
  md: { cell: "py-2 px-4", header: "py-3 px-4" },
  lg: { cell: "py-3 px-6 text-lg", header: "py-4 px-6 text-lg" },
};

const variantStyles = {
  default: "",
  striped: "[&>tbody>tr:nth-of-type(odd)]:bg-accent-light/30",
  bordered: "[&_td]:border [&_th]:border border-border",
};

// ===== COMPONENTE PRINCIPAL =====
export function DataTable<T>({
  data,
  columns,
  rowKey,

  // Selección
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  multiSelect = true,

  // Ordenamiento
  defaultSortColumn,
  defaultSortDirection = "asc",
  onSort,
  manualSorting = false,

  // Paginación
  paginated = false,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  page: controlledPage,
  totalRows,
  onPageChange,
  manualPagination = false,

  // Acciones
  rowActions,
  bulkActions,

  // Estados
  loading = false,
  emptyMessage = "No hay datos para mostrar",
  emptyComponent,

  // Estilos
  variant = "default",
  size = "md",
  hoverRow = true,
  maxHeight,
  noPaper = false,
  className = "",
  stickyHeader = false,

  // Eventos
  onRowClick,
  onRowDoubleClick,
}: DataTableProps<T>) {
  // ===== ESTADO LOCAL =====
  const [sortColumn, setSortColumn] = useState<string | undefined>(
    defaultSortColumn
  );
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(defaultSortDirection);
  const [internalPage, setInternalPage] = useState(0);
  const [internalPageSize, setInternalPageSize] = useState(initialPageSize);

  const page = controlledPage ?? internalPage;
  const pageSize = internalPageSize;

  // ===== HELPERS =====
  const getRowKey = (row: T): string | number => {
    if (typeof rowKey === "function") return rowKey(row);
    return row[rowKey] as string | number;
  };

  const getCellValue = (row: T, column: Column<T>): unknown => {
    if (typeof column.accessor === "function") {
      return column.accessor(row);
    }
    return row[column.accessor];
  };

  // ===== SELECCIÓN =====
  const isSelected = (row: T): boolean => {
    return selectedRows.some((r) => getRowKey(r) === getRowKey(row));
  };

  const handleSelectRow = (row: T) => {
    if (!onSelectionChange) return;

    if (multiSelect) {
      const isCurrentlySelected = isSelected(row);
      const newSelection = isCurrentlySelected
        ? selectedRows.filter((r) => getRowKey(r) !== getRowKey(row))
        : [...selectedRows, row];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange(isSelected(row) ? [] : [row]);
    }
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    const allSelected = selectedRows.length === data.length;
    onSelectionChange(allSelected ? [] : [...data]);
  };

  // ===== ORDENAMIENTO =====
  const handleSort = (columnId: string) => {
    const column = columns.find((c) => c.id === columnId);
    if (!column?.sortable) return;

    const newDirection: SortDirection =
      sortColumn === columnId && sortDirection === "asc" ? "desc" : "asc";

    setSortColumn(columnId);
    setSortDirection(newDirection);

    if (onSort) {
      onSort(columnId, newDirection);
    }
  };

  // ===== DATOS PROCESADOS =====
  const processedData = useMemo(() => {
    let result = [...data];

    // Ordenamiento local
    if (!manualSorting && sortColumn) {
      const column = columns.find((c) => c.id === sortColumn);
      if (column) {
        result.sort((a, b) => {
          if (column.sortFn) {
            return column.sortFn(a, b, sortDirection);
          }

          const aVal = getCellValue(a, column);
          const bVal = getCellValue(b, column);

          if (aVal === bVal) return 0;
          if (aVal === null || aVal === undefined) return 1;
          if (bVal === null || bVal === undefined) return -1;

          const comparison = aVal < bVal ? -1 : 1;
          return sortDirection === "asc" ? comparison : -comparison;
        });
      }
    }

    // Paginación local
    if (paginated && !manualPagination) {
      const start = page * pageSize;
      result = result.slice(start, start + pageSize);
    }

    return result;
  }, [
    data,
    sortColumn,
    sortDirection,
    page,
    pageSize,
    manualSorting,
    manualPagination,
    paginated,
    columns,
  ]);

  const totalCount = totalRows ?? data.length;

  // ===== PAGINACIÓN =====
  const handlePageChange = (_: unknown, newPage: number) => {
    setInternalPage(newPage);
    onPageChange?.(newPage, pageSize);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    setInternalPageSize(newPageSize);
    setInternalPage(0);
    onPageChange?.(0, newPageSize);
  };

  // ===== RENDER =====
  const tableContent = (
    <>
      {/* Loading bar */}
      {loading && (
        <div className="absolute top-0 left-0 right-0 z-10">
          <LinearProgress
            sx={{
              backgroundColor: "var(--color-accent-light)",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "var(--color-primary)",
              },
            }}
          />
        </div>
      )}

      {/* Bulk actions */}
      {bulkActions && selectedRows.length > 0 && (
        <div className="bg-primary/10 px-4 py-2 flex items-center gap-3 border-b border-border">
          <span className="text-sm text-text-muted">
            {selectedRows.length} seleccionado(s)
          </span>
          {bulkActions(selectedRows)}
        </div>
      )}

      <TableContainer
        sx={{
          maxHeight: maxHeight,
          position: "relative",
        }}
      >
        <Table
          stickyHeader={stickyHeader}
          className={`${variantStyles[variant]}`}
          size="small"
        >
          {/* Header */}
          <TableHead>
            <TableRow>
              {/* Checkbox column */}
              {selectable && multiSelect && (
                <TableCell
                  padding="checkbox"
                  className={`bg-surface ${sizeStyles[size].header}`}
                  sx={{ backgroundColor: "var(--color-surface)" }}
                >
                  <Checkbox
                    indeterminate={
                      selectedRows.length > 0 &&
                      selectedRows.length < data.length
                    }
                    checked={
                      data.length > 0 && selectedRows.length === data.length
                    }
                    onChange={handleSelectAll}
                    sx={{
                      color: "var(--color-border)",
                      "&.Mui-checked": { color: "var(--color-primary)" },
                      "&.MuiCheckbox-indeterminate": {
                        color: "var(--color-primary)",
                      },
                    }}
                  />
                </TableCell>
              )}

              {/* Data columns */}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || "left"}
                  className={`
                    bg-surface font-semibold text-text
                    ${sizeStyles[size].header}
                    ${column.headerClassName || ""}
                  `}
                  sx={{
                    backgroundColor: "var(--color-surface)",
                    width: column.width,
                    position: column.sticky ? "sticky" : undefined,
                    left: column.sticky === "left" ? 0 : undefined,
                    right: column.sticky === "right" ? 0 : undefined,
                    zIndex: column.sticky ? 2 : undefined,
                  }}
                >
                  {column.sortable ? (
                    <Tooltip title={column.headerTooltip || ""} placement="top">
                      <TableSortLabel
                        active={sortColumn === column.id}
                        direction={
                          sortColumn === column.id ? sortDirection : "asc"
                        }
                        onClick={() => handleSort(column.id)}
                        sx={{
                          "&.Mui-active": { color: "var(--color-text)" },
                          "& .MuiTableSortLabel-icon": {
                            color: "var(--color-primary) !important",
                          },
                        }}
                      >
                        {column.header}
                      </TableSortLabel>
                    </Tooltip>
                  ) : column.headerTooltip ? (
                    <Tooltip title={column.headerTooltip} placement="top">
                      <span>{column.header}</span>
                    </Tooltip>
                  ) : (
                    column.header
                  )}
                </TableCell>
              ))}

              {/* Actions column */}
              {rowActions && (
                <TableCell
                  align="right"
                  className={`bg-surface font-semibold text-text ${sizeStyles[size].header}`}
                  sx={{ backgroundColor: "var(--color-surface)" }}
                >
                  Acciones
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          {/* Body */}
          <TableBody>
            {processedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length +
                    (selectable && multiSelect ? 1 : 0) +
                    (rowActions ? 1 : 0)
                  }
                  className="text-center py-8"
                >
                  {emptyComponent || (
                    <div className="text-text-muted">{emptyMessage}</div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              processedData.map((row, rowIndex) => {
                const isRowSelected = isSelected(row);
                const actualIndex =
                  paginated && !manualPagination
                    ? page * pageSize + rowIndex
                    : rowIndex;

                return (
                  <TableRow
                    key={getRowKey(row)}
                    selected={isRowSelected}
                    hover={hoverRow}
                    onClick={() => onRowClick?.(row, actualIndex)}
                    onDoubleClick={() => onRowDoubleClick?.(row, actualIndex)}
                    className={`
                      ${onRowClick ? "cursor-pointer" : ""}
                      ${isRowSelected ? "bg-primary/10" : ""}
                    `}
                    sx={{
                      ...(hoverRow && {
                        "&:hover": {
                          backgroundColor:
                            "var(--color-accent-light) !important",
                        },
                      }),
                      "&.Mui-selected": {
                        backgroundColor: "rgba(170, 222, 173, 0.15) !important",
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: "rgba(170, 222, 173, 0.25) !important",
                      },
                    }}
                  >
                    {/* Checkbox */}
                    {selectable && multiSelect && (
                      <TableCell
                        padding="checkbox"
                        className={sizeStyles[size].cell}
                      >
                        <Checkbox
                          checked={isRowSelected}
                          onChange={() => handleSelectRow(row)}
                          onClick={(e) => e.stopPropagation()}
                          sx={{
                            color: "var(--color-border)",
                            "&.Mui-checked": { color: "var(--color-primary)" },
                          }}
                        />
                      </TableCell>
                    )}

                    {/* Data cells */}
                    {columns.map((column) => {
                      const value = getCellValue(row, column);
                      const content = column.render
                        ? column.render(value, row, actualIndex)
                        : (value as React.ReactNode);

                      return (
                        <TableCell
                          key={column.id}
                          align={column.align || "left"}
                          className={`
                            text-text
                            ${sizeStyles[size].cell}
                            ${column.cellClassName || ""}
                          `}
                          sx={{
                            position: column.sticky ? "sticky" : undefined,
                            left: column.sticky === "left" ? 0 : undefined,
                            right: column.sticky === "right" ? 0 : undefined,
                            backgroundColor: column.sticky
                              ? "var(--color-surface)"
                              : undefined,
                            zIndex: column.sticky ? 1 : undefined,
                          }}
                        >
                          {content}
                        </TableCell>
                      );
                    })}

                    {/* Actions */}
                    {rowActions && (
                      <TableCell
                        align="right"
                        className={sizeStyles[size].cell}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {rowActions(row, actualIndex)}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {paginated && (
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
          rowsPerPageOptions={pageSizeOptions}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
          sx={{
            borderTop: "1px solid var(--color-border)",
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                color: "var(--color-text-muted)",
              },
          }}
        />
      )}
    </>
  );

  if (noPaper) {
    return (
      <div className={`relative overflow-hidden rounded-xl ${className}`}>
        {tableContent}
      </div>
    );
  }

  return (
    <Paper
      elevation={0}
      className={`relative overflow-hidden rounded-xl border border-border ${className}`}
      sx={{ backgroundColor: "var(--color-surface)" }}
    >
      {tableContent}
    </Paper>
  );
}

// ===== COMPONENTES AUXILIARES =====

// Badge para celdas
export interface TableBadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info";
}

const badgeStyles: Record<string, string> = {
  primary: "bg-primary text-text",
  secondary: "bg-secondary text-text",
  success: "bg-success text-text-light",
  danger: "bg-danger text-text-light",
  warning: "bg-warning text-text",
  info: "bg-info text-text-light",
};

export const TableBadge: React.FC<TableBadgeProps> = ({
  children,
  variant = "primary",
}) => (
  <span
    className={`
      inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
      ${badgeStyles[variant]}
    `}
  >
    {children}
  </span>
);

// Avatar para celdas
export interface TableAvatarProps {
  src?: string;
  alt: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

const avatarSizes = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
};

export const TableAvatar: React.FC<TableAvatarProps> = ({
  src,
  alt,
  fallback,
  size = "md",
}) => {
  const initials = fallback || alt.charAt(0).toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${avatarSizes[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`
        ${avatarSizes[size]} rounded-full
        bg-primary text-text font-medium
        flex items-center justify-center
      `}
    >
      {initials}
    </div>
  );
};

export default DataTable;
