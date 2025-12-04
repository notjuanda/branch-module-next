"use client";

import { useState, useEffect } from "react";
import { Modal, useToast } from "@/components/ui";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";
import {
  HiOutlineUser,
  HiOutlineIdentification,
  HiOutlineMail,
  HiOutlineCalendar,
} from "react-icons/hi";
import { HiOutlineUserPlus, HiOutlinePencilSquare } from "react-icons/hi2";
import {
  EmployeeResponse,
  EmployeeRequest,
  EmployeeUpdateRequest,
} from "@/api/types";
import { employeeService } from "@/api/services";

interface EmployeeFormModalProps {
  open: boolean;
  onClose: () => void;
  employee?: EmployeeResponse | null;
  onSuccess?: (employee: EmployeeResponse) => void;
}

// Componente de campo con icono
function FormField({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
      <Box
        sx={{
          color: "var(--color-primary)",
          mt: 2,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: "var(--color-text-muted)",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            fontSize: "0.7rem",
            mb: 0.5,
            display: "block",
          }}
        >
          {label}
        </Typography>
        {children}
      </Box>
    </Box>
  );
}

// Tipos de documento
const DOC_TYPES = [
  { value: "CI", label: "Cédula de Identidad" },
  { value: "PASSPORT", label: "Pasaporte" },
  { value: "NIT", label: "NIT" },
  { value: "OTHER", label: "Otro" },
];

export default function EmployeeFormModal({
  open,
  onClose,
  employee,
  onSuccess,
}: EmployeeFormModalProps) {
  const isEditing = !!employee;
  const { showSuccess, showError } = useToast();

  // Estado del formulario
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [docType, setDocType] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [terminationDate, setTerminationDate] = useState("");

  // Estado de UI
  const [loading, setLoading] = useState(false);

  // Resetear formulario cuando cambia el employee o se abre/cierra
  useEffect(() => {
    if (open) {
      if (employee) {
        setFirstName(employee.firstName);
        setLastName(employee.lastName);
        setDocType(employee.docType || "");
        setDocNumber(employee.docNumber || "");
        setPersonalEmail(employee.personalEmail || "");
        setHireDate(employee.hireDate || "");
        setTerminationDate(employee.terminationDate || "");
      } else {
        setFirstName("");
        setLastName("");
        setDocType("");
        setDocNumber("");
        setPersonalEmail("");
        setHireDate("");
        setTerminationDate("");
      }
    }
  }, [open, employee]);

  // Validar formulario
  const validateForm = (): boolean => {
    if (!firstName.trim()) {
      showError("El nombre es requerido");
      return false;
    }
    if (!lastName.trim()) {
      showError("El apellido es requerido");
      return false;
    }
    if (personalEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail)) {
      showError("El email personal no es válido");
      return false;
    }
    return true;
  };

  // Manejar submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let result: EmployeeResponse;

      if (isEditing && employee) {
        const updateData: EmployeeUpdateRequest = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          docType: docType || undefined,
          docNumber: docNumber || undefined,
          personalEmail: personalEmail || undefined,
          hireDate: hireDate || undefined,
          terminationDate: terminationDate || undefined,
        };
        result = await employeeService.update(employee.id, updateData);
        showSuccess(`Empleado "${result.firstName} ${result.lastName}" actualizado`);
      } else {
        const createData: EmployeeRequest = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          docType: docType || undefined,
          docNumber: docNumber || undefined,
          personalEmail: personalEmail || undefined,
          hireDate: hireDate || undefined,
        };
        result = await employeeService.create(createData);
        showSuccess(`Empleado "${result.firstName} ${result.lastName}" creado`);
      }

      onSuccess?.(result);
      onClose();
    } catch (error) {
      console.error("Error saving employee:", error);
      showError(
        isEditing
          ? "Error al actualizar el empleado"
          : "Error al crear el empleado"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {isEditing ? (
            <HiOutlinePencilSquare size={24} />
          ) : (
            <HiOutlineUserPlus size={24} />
          )}
          <Typography variant="h6" component="span">
            {isEditing ? "Editar empleado" : "Nuevo empleado"}
          </Typography>
        </Box>
      }
      subtitle={
        isEditing
          ? `Editando: ${employee?.firstName} ${employee?.lastName}`
          : "Completa los datos del empleado"
      }
      showCloseButton={!loading}
      closeOnBackdropClick={!loading}
      closeOnEscape={!loading}
      transition="slide"
      customFooter={
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={{
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
              textTransform: "none",
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={18} sx={{ color: "white" }} />
              ) : null
            }
            sx={{
              backgroundColor: "var(--color-success)",
              color: "var(--color-text-light)",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "var(--color-success-hover)",
              },
            }}
          >
            {loading
              ? isEditing
                ? "Guardando..."
                : "Creando..."
              : isEditing
                ? "Guardar cambios"
                : "Crear empleado"}
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Nombre y Apellido */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <FormField icon={<HiOutlineUser size={20} />} label="Nombre *">
            <TextField
              fullWidth
              size="small"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Nombre del empleado"
              disabled={loading}
            />
          </FormField>

          <FormField icon={<HiOutlineUser size={20} />} label="Apellido *">
            <TextField
              fullWidth
              size="small"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Apellido del empleado"
              disabled={loading}
            />
          </FormField>
        </Box>

        {/* Documento */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <FormField
            icon={<HiOutlineIdentification size={20} />}
            label="Tipo de documento"
          >
            <FormControl fullWidth size="small">
              <Select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                displayEmpty
                disabled={loading}
              >
                <MenuItem value="">
                  <em>Seleccionar</em>
                </MenuItem>
                {DOC_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormField>

          <FormField
            icon={<HiOutlineIdentification size={20} />}
            label="Número de documento"
          >
            <TextField
              fullWidth
              size="small"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              placeholder="Ej: 12345678"
              disabled={loading}
            />
          </FormField>
        </Box>

        {/* Email */}
        <FormField icon={<HiOutlineMail size={20} />} label="Email personal">
          <TextField
            fullWidth
            size="small"
            type="email"
            value={personalEmail}
            onChange={(e) => setPersonalEmail(e.target.value)}
            placeholder="email@ejemplo.com"
            disabled={loading}
          />
        </FormField>

        {/* Fechas */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <FormField
            icon={<HiOutlineCalendar size={20} />}
            label="Fecha de contratación"
          >
            <TextField
              fullWidth
              size="small"
              type="date"
              value={hireDate}
              onChange={(e) => setHireDate(e.target.value)}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
          </FormField>

          {isEditing && (
            <FormField
              icon={<HiOutlineCalendar size={20} />}
              label="Fecha de terminación"
            >
              <TextField
                fullWidth
                size="small"
                type="date"
                value={terminationDate}
                onChange={(e) => setTerminationDate(e.target.value)}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </FormField>
          )}
        </Box>

        {/* Email institucional (solo lectura en edición) */}
        {isEditing && employee?.institutionalEmail && (
          <FormField
            icon={<HiOutlineMail size={20} />}
            label="Email institucional"
          >
            <TextField
              fullWidth
              size="small"
              value={employee.institutionalEmail}
              disabled
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "var(--color-text-muted)",
                },
              }}
            />
          </FormField>
        )}
      </Box>
    </Modal>
  );
}
