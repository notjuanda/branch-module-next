"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal, useToast } from "@/components/ui";
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  HiOutlineUserGroup,
  HiOutlineMail,
  HiOutlineBriefcase,
  HiOutlinePlus,
  HiOutlineSwitchHorizontal,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineGlobeAlt,
} from "react-icons/hi";
import { HiDevicePhoneMobile } from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";
import {
  BranchResponse,
  BranchAssignmentResponse,
  EmployeeResponse,
  BranchPhoneResponse,
} from "@/api/types";
import {
  assignmentService,
  employeeService,
  branchPhoneService,
} from "@/api/services";
import AssignPhoneModal from "./AssignPhoneModal";
import AddBranchPhoneModal from "./AddBranchPhoneModal";
import EditBranchPhoneModal from "./EditBranchPhoneModal";
import DeletePhoneConfirmModal from "./DeletePhoneConfirmModal";
import { ReassignBranchModal } from "../../employees/components";

interface BranchEmployeesModalProps {
  open: boolean;
  onClose: () => void;
  branch: BranchResponse | null;
}

// Tipo para agrupar empleado con sus teléfonos
interface EmployeeWithPhones {
  employee: EmployeeResponse;
  assignment: BranchAssignmentResponse;
  corpPhones: BranchPhoneResponse[];
}

export default function BranchEmployeesModal({
  open,
  onClose,
  branch,
}: BranchEmployeesModalProps) {
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(false);
  const [employeesWithPhones, setEmployeesWithPhones] = useState<
    EmployeeWithPhones[]
  >([]);
  const [orphanPhones, setOrphanPhones] = useState<BranchPhoneResponse[]>([]);

  // Estado para modal de asignar teléfono
  const [assignPhoneOpen, setAssignPhoneOpen] = useState(false);
  const [employeeForPhone, setEmployeeForPhone] = useState<EmployeeResponse | null>(null);

  // Estado para modal de agregar teléfono
  const [addPhoneOpen, setAddPhoneOpen] = useState(false);

  // Estado para modal de reasignación
  const [reassignOpen, setReassignOpen] = useState(false);
  const [employeeForReassign, setEmployeeForReassign] = useState<EmployeeResponse | null>(null);

  // Estado para modal de edición de teléfono
  const [editPhoneOpen, setEditPhoneOpen] = useState(false);
  const [phoneToEdit, setPhoneToEdit] = useState<BranchPhoneResponse | null>(null);

  // Estado para modal de confirmación de eliminación
  const [deletePhoneOpen, setDeletePhoneOpen] = useState(false);
  const [phoneToDelete, setPhoneToDelete] = useState<BranchPhoneResponse | null>(null);

  // Cargar empleados y sus teléfonos
  const fetchData = useCallback(async () => {
    if (!branch) return;

    setLoading(true);
    try {
      // 1. Obtener asignaciones activas de la sucursal
      const assignments = await assignmentService.listActiveByBranch(branch.id);

      // 2. Obtener teléfonos de la sucursal
      const branchPhones = await branchPhoneService.list(branch.id);

      // Set para trackear teléfonos asignados
      const assignedPhoneIds = new Set<string>();

      // 3. Para cada asignación, obtener datos del empleado y sus teléfonos corporativos
      const employeesData: EmployeeWithPhones[] = await Promise.all(
        assignments.map(async (assignment) => {
          // Obtener datos del empleado
          const employee = await employeeService.getById(assignment.employeeId);

          // Filtrar teléfonos asignados a este empleado
          // Los teléfonos corporativos tienen estado ASSIGNED y están vinculados al empleado
          const corpPhones = branchPhones.filter(
            (phone) => phone.state === "ASSIGNED"
          );

          // Para saber qué teléfonos están asignados a este empleado específico,
          // necesitamos verificar las asignaciones de teléfono
          const employeeCorpPhones: BranchPhoneResponse[] = [];

          for (const phone of corpPhones) {
            try {
              const phoneAssignment = await assignmentService.getActiveByPhone(
                phone.id
              );
              if (phoneAssignment?.employeeId === employee.id) {
                employeeCorpPhones.push(phone);
                assignedPhoneIds.add(phone.id);
              }
            } catch {
              // No tiene asignación activa
            }
          }

          return {
            employee,
            assignment,
            corpPhones: employeeCorpPhones,
          };
        })
      );

      // 4. Obtener teléfonos huérfanos (AVAILABLE - no asignados a nadie)
      const orphans = branchPhones.filter(
        (phone) => phone.state === "AVAILABLE" && !assignedPhoneIds.has(phone.id)
      );

      setEmployeesWithPhones(employeesData);
      setOrphanPhones(orphans);
    } catch (error) {
      console.error("Error loading branch employees:", error);
      showError("Error al cargar los empleados de la sucursal");
    } finally {
      setLoading(false);
    }
  }, [branch, showError]);

  useEffect(() => {
    if (open && branch) {
      fetchData();
    }
  }, [open, branch, fetchData]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <HiOutlineUserGroup size={24} />
          <Typography variant="h6" component="span">
            Empleados de la sucursal
          </Typography>
        </Box>
      }
      subtitle={branch?.name}
      showCloseButton
      transition="fade"
    >
      <Box sx={{ minHeight: 200 }}>
        {/* Loading */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: 200,
              gap: 2,
            }}
          >
            <CircularProgress sx={{ color: "var(--color-primary)" }} />
            <Typography color="text.secondary">
              Cargando empleados...
            </Typography>
          </Box>
        ) : employeesWithPhones.length === 0 ? (
          /* Sin empleados */
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: 200,
              gap: 2,
              color: "var(--color-text-muted)",
            }}
          >
            <HiOutlineUserGroup size={64} />
            <Typography>No hay empleados asignados a esta sucursal</Typography>
          </Box>
        ) : (
          /* Lista de empleados */
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Contador de empleados */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                pb: 1,
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "var(--color-text-muted)" }}
              >
                {employeesWithPhones.length} empleado{employeesWithPhones.length !== 1 ? "s" : ""} asignado{employeesWithPhones.length !== 1 ? "s" : ""}
              </Typography>
              {orphanPhones.length > 0 && (
                <Chip
                  label={`${orphanPhones.length} teléfono${orphanPhones.length !== 1 ? "s" : ""} disponible${orphanPhones.length !== 1 ? "s" : ""}`}
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ fontSize: "0.7rem" }}
                />
              )}
            </Box>

            {employeesWithPhones.map(
              ({ employee, assignment, corpPhones }) => (
                <Box
                  key={employee.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "var(--color-primary)",
                      boxShadow: "0 2px 8px rgba(0, 50, 84, 0.08)",
                    },
                  }}
                >
                  {/* Header con avatar y datos */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    {/* Avatar */}
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--color-primary) 0%, #0066a4 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(0, 50, 84, 0.2)",
                      }}
                    >
                      {employee.firstName[0]}{employee.lastName[0]}
                    </Box>

                    {/* Info principal */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ 
                            fontWeight: 600, 
                            color: "var(--color-text)",
                            lineHeight: 1.2,
                          }}
                        >
                          {employee.firstName} {employee.lastName}
                        </Typography>
                        <Chip
                          label={employee.status === "ACTIVE" ? "Activo" : "Inactivo"}
                          color={employee.status === "ACTIVE" ? "success" : "error"}
                          size="small"
                          sx={{ height: 20, fontSize: "0.7rem" }}
                        />
                      </Box>
                      
                      {/* Cargo */}
                      {assignment.position && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            mt: 0.5,
                          }}
                        >
                          <HiOutlineBriefcase size={14} color="var(--color-text-muted)" />
                          <Typography
                            variant="body2"
                            sx={{ color: "var(--color-text-muted)" }}
                          >
                            {assignment.position}
                          </Typography>
                        </Box>
                      )}

                      {/* Email */}
                      {employee.institutionalEmail && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            mt: 0.3,
                          }}
                        >
                          <HiOutlineMail size={14} color="var(--color-text-muted)" />
                          <Typography
                            variant="caption"
                            sx={{ color: "var(--color-text-muted)" }}
                          >
                            {employee.institutionalEmail}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Botón de reasignación */}
                    <Tooltip title="Reasignar a otra sucursal">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEmployeeForReassign(employee);
                          setReassignOpen(true);
                        }}
                        sx={{
                          color: "var(--color-primary)",
                          backgroundColor: "rgba(0, 50, 84, 0.08)",
                          "&:hover": {
                            backgroundColor: "rgba(0, 50, 84, 0.15)",
                          },
                        }}
                      >
                        <HiOutlineSwitchHorizontal size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Sección de teléfonos */}
                  <Box
                    sx={{
                      mt: 2,
                      pt: 2,
                      borderTop: "1px dashed var(--color-border)",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <HiDevicePhoneMobile size={16} color="var(--color-text-muted)" />
                        <Typography
                          variant="caption"
                          sx={{
                            color: "var(--color-text-muted)",
                            fontWeight: 500,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Teléfono corporativo
                        </Typography>
                      </Box>

                      {/* Botón para asignar teléfono si no tiene */}
                      {corpPhones.length === 0 && orphanPhones.length > 0 && (
                        <Tooltip title="Asignar teléfono disponible">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEmployeeForPhone(employee);
                              setAssignPhoneOpen(true);
                            }}
                            sx={{
                              color: "var(--color-success)",
                              backgroundColor: "rgba(34, 197, 94, 0.1)",
                              "&:hover": {
                                backgroundColor: "rgba(34, 197, 94, 0.2)",
                              },
                            }}
                          >
                            <HiOutlinePlus size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>

                    {corpPhones.length === 0 ? (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "var(--color-text-muted)",
                          fontStyle: "italic",
                          fontSize: "0.85rem",
                        }}
                      >
                        Sin teléfono asignado
                      </Typography>
                    ) : (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {corpPhones.map((phone) => (
                          <Box
                            key={phone.id}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              px: 1.5,
                              py: 1,
                              borderRadius: 1.5,
                              backgroundColor: "rgba(0, 50, 84, 0.05)",
                              border: "1px solid var(--color-primary)",
                            }}
                          >
                            {/* Info del teléfono */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
                              <HiDevicePhoneMobile size={16} color="var(--color-primary)" />
                              <Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600, color: "var(--color-primary)" }}
                                  >
                                    {phone.number}
                                  </Typography>
                                  {phone.label && (
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "var(--color-text-muted)" }}
                                    >
                                      ({phone.label})
                                    </Typography>
                                  )}
                                </Box>
                                {/* Indicadores */}
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.3 }}>
                                  {phone.whatsapp && (
                                    <Chip
                                      icon={<FaWhatsapp size={10} />}
                                      label="WhatsApp"
                                      size="small"
                                      sx={{
                                        height: 16,
                                        fontSize: "0.6rem",
                                        backgroundColor: "rgba(37, 211, 102, 0.1)",
                                        color: "#25D366",
                                        "& .MuiChip-icon": {
                                          color: "#25D366",
                                        },
                                      }}
                                    />
                                  )}
                                  {phone.publish && (
                                    <Chip
                                      icon={<HiOutlineGlobeAlt size={10} />}
                                      label="Público"
                                      size="small"
                                      sx={{
                                        height: 16,
                                        fontSize: "0.6rem",
                                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                                        color: "#3b82f6",
                                        "& .MuiChip-icon": {
                                          color: "#3b82f6",
                                        },
                                      }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            </Box>
                            {/* Acciones */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <Tooltip title="Editar teléfono">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setPhoneToEdit(phone);
                                    setEditPhoneOpen(true);
                                  }}
                                  sx={{
                                    color: "var(--color-primary)",
                                    "&:hover": {
                                      backgroundColor: "rgba(0, 50, 84, 0.1)",
                                    },
                                  }}
                                >
                                  <HiOutlinePencil size={14} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar teléfono">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setPhoneToDelete(phone);
                                    setDeletePhoneOpen(true);
                                  }}
                                  sx={{
                                    color: "#ef4444",
                                    "&:hover": {
                                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                                    },
                                  }}
                                >
                                  <HiOutlineTrash size={14} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              )
            )}

            {/* Teléfonos huérfanos */}
            {orphanPhones.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, rgba(234, 179, 8, 0.05) 0%, rgba(234, 179, 8, 0.1) 100%)",
                    border: "1px dashed var(--color-warning)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1.5,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          backgroundColor: "var(--color-warning)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <HiDevicePhoneMobile size={18} color="white" />
                      </Box>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: "var(--color-warning)",
                            fontWeight: 600,
                          }}
                        >
                          Teléfonos disponibles
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "var(--color-text-muted)" }}
                        >
                          Pueden asignarse a empleados sin teléfono
                        </Typography>
                      </Box>
                    </Box>
                    {/* Botón para agregar teléfono */}
                    <Tooltip title="Agregar nuevo teléfono">
                      <IconButton
                        size="small"
                        onClick={() => setAddPhoneOpen(true)}
                        sx={{
                          color: "var(--color-primary)",
                          backgroundColor: "rgba(0, 50, 84, 0.1)",
                          "&:hover": {
                            backgroundColor: "rgba(0, 50, 84, 0.2)",
                          },
                        }}
                      >
                        <HiOutlinePlus size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {orphanPhones.map((phone) => (
                      <Box
                        key={phone.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          px: 2,
                          py: 1.5,
                          borderRadius: 1.5,
                          backgroundColor: "white",
                          border: "1px solid var(--color-border)",
                          "&:hover": {
                            borderColor: "var(--color-warning)",
                          },
                        }}
                      >
                        {/* Info del teléfono */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
                          <HiDevicePhoneMobile size={18} color="var(--color-warning)" />
                          <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, color: "var(--color-text)" }}
                              >
                                {phone.number}
                              </Typography>
                              {phone.label && (
                                <Typography
                                  variant="caption"
                                  sx={{ color: "var(--color-text-muted)" }}
                                >
                                  ({phone.label})
                                </Typography>
                              )}
                            </Box>
                            {/* Indicadores */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                              <Chip
                                label={phone.kind === "CORPORATE" ? "Corporativo" : "Público"}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: "0.65rem",
                                  backgroundColor: phone.kind === "CORPORATE"
                                    ? "rgba(0, 50, 84, 0.1)"
                                    : "rgba(34, 197, 94, 0.1)",
                                  color: phone.kind === "CORPORATE"
                                    ? "var(--color-primary)"
                                    : "var(--color-success)",
                                }}
                              />
                              {phone.whatsapp && (
                                <Chip
                                  icon={<FaWhatsapp size={10} />}
                                  label="WhatsApp"
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: "0.65rem",
                                    backgroundColor: "rgba(37, 211, 102, 0.1)",
                                    color: "#25D366",
                                    "& .MuiChip-icon": {
                                      color: "#25D366",
                                    },
                                  }}
                                />
                              )}
                              {phone.publish && (
                                <Chip
                                  icon={<HiOutlineGlobeAlt size={10} />}
                                  label="Público"
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: "0.65rem",
                                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                                    color: "#3b82f6",
                                    "& .MuiChip-icon": {
                                      color: "#3b82f6",
                                    },
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>
                        {/* Acciones */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Tooltip title="Editar teléfono">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setPhoneToEdit(phone);
                                setEditPhoneOpen(true);
                              }}
                              sx={{
                                color: "var(--color-primary)",
                                "&:hover": {
                                  backgroundColor: "rgba(0, 50, 84, 0.1)",
                                },
                              }}
                            >
                              <HiOutlinePencil size={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar teléfono">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setPhoneToDelete(phone);
                                setDeletePhoneOpen(true);
                              }}
                              sx={{
                                color: "#ef4444",
                                "&:hover": {
                                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                                },
                              }}
                            >
                              <HiOutlineTrash size={16} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
            {/* Sección para agregar teléfono cuando no hay disponibles */}
            {orphanPhones.length === 0 && employeesWithPhones.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, rgba(0, 50, 84, 0.03) 0%, rgba(0, 50, 84, 0.08) 100%)",
                    border: "1px dashed var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        backgroundColor: "var(--color-text-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <HiDevicePhoneMobile size={18} color="white" />
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: "var(--color-text-muted)",
                          fontWeight: 600,
                        }}
                      >
                        Sin teléfonos disponibles
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "var(--color-text-muted)" }}
                      >
                        Agrega teléfonos para asignar a empleados
                      </Typography>
                    </Box>
                  </Box>
                  <Tooltip title="Agregar nuevo teléfono">
                    <IconButton
                      size="small"
                      onClick={() => setAddPhoneOpen(true)}
                      sx={{
                        color: "var(--color-primary)",
                        backgroundColor: "rgba(0, 50, 84, 0.1)",
                        "&:hover": {
                          backgroundColor: "rgba(0, 50, 84, 0.2)",
                        },
                      }}
                    >
                      <HiOutlinePlus size={18} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Modal para asignar teléfono */}
      <AssignPhoneModal
        open={assignPhoneOpen}
        onClose={() => {
          setAssignPhoneOpen(false);
          setEmployeeForPhone(null);
        }}
        employee={employeeForPhone}
        branchId={branch?.id ?? null}
        onSuccess={() => {
          showSuccess("Teléfono asignado correctamente");
          fetchData();
        }}
      />

      {/* Modal para agregar teléfono a la sucursal */}
      <AddBranchPhoneModal
        open={addPhoneOpen}
        onClose={() => setAddPhoneOpen(false)}
        branchId={branch?.id ?? null}
        onSuccess={() => {
          showSuccess("Teléfono agregado correctamente");
          fetchData();
        }}
      />

      {/* Modal para reasignar empleado a otra sucursal */}
      <ReassignBranchModal
        open={reassignOpen}
        onClose={() => {
          setReassignOpen(false);
          setEmployeeForReassign(null);
        }}
        employee={employeeForReassign}
        currentBranchId={branch?.id}
        currentBranchName={branch?.name}
        onSuccess={() => {
          showSuccess("Empleado reasignado correctamente");
          fetchData();
        }}
      />

      {/* Modal para editar teléfono */}
      <EditBranchPhoneModal
        open={editPhoneOpen}
        onClose={() => {
          setEditPhoneOpen(false);
          setPhoneToEdit(null);
        }}
        branchId={branch?.id ?? null}
        phone={phoneToEdit}
        onSuccess={() => {
          fetchData();
        }}
      />

      {/* Modal para confirmar eliminación de teléfono */}
      <DeletePhoneConfirmModal
        open={deletePhoneOpen}
        onClose={() => {
          setDeletePhoneOpen(false);
          setPhoneToDelete(null);
        }}
        branchId={branch?.id ?? null}
        phone={phoneToDelete}
        onSuccess={() => {
          fetchData();
        }}
      />
    </Modal>
  );
}
