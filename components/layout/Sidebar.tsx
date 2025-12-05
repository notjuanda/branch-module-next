"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { HiMenu, HiOutlineLogout } from "react-icons/hi";
import { HiOutlineBuildingStorefront, HiOutlineUsers, HiBuildingOffice2, HiOutlineArchiveBox, HiOutlineDocumentChartBar } from "react-icons/hi2";
import { useNavigate } from "@/hooks";
import { useLoading } from "@/contexts";

const drawerWidth = 260;

// Color de fondo del sidebar - gris muy claro
const sidebarBg = "#f8fafc";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Sucursales", path: "/branches", icon: <HiOutlineBuildingStorefront size={22} /> },
  { label: "Empleados", path: "/employees", icon: <HiOutlineUsers size={22} /> },
  { label: "Lotes", path: "/batches", icon: <HiOutlineArchiveBox size={22} /> },
  { label: "Reportes", path: "/reports", icon: <HiOutlineDocumentChartBar size={22} /> },
];

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { navigate } = useNavigate();
  const { startLoading } = useLoading();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    if (pathname !== path) {
      navigate(path, "Cargando página...");
    }
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    startLoading("Cerrando sesión...");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login", "Cerrando sesión...");
  };

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo / Título */}
      <Toolbar
        sx={{
          backgroundColor: "var(--color-primary)",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <HiBuildingOffice2 size={24} color="white" />
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ fontWeight: 700, color: "var(--color-text-light)" }}
        >
          Sucursales
        </Typography>
      </Toolbar>
      <Divider />

      {/* Navegación principal */}
      <List sx={{ flexGrow: 1, pt: 2 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ px: 1, mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive
                    ? "var(--color-primary)"
                    : "transparent",
                  "&:hover": {
                    backgroundColor: isActive
                      ? "var(--color-primary)"
                      : "rgba(0, 50, 84, 0.08)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive
                      ? "var(--color-text-light)"
                      : "var(--color-text-muted)",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    color: isActive
                      ? "var(--color-text-light)"
                      : "var(--color-text-muted)",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Logout */}
      <List sx={{ pb: 2 }}>
        <ListItem disablePadding sx={{ px: 1 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "var(--color-danger)",
                "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
                  color: "white",
                },
              },
            }}
          >
            <ListItemIcon
              sx={{ color: "var(--color-text-muted)", minWidth: 40 }}
            >
              <HiOutlineLogout size={22} />
            </ListItemIcon>
            <ListItemText
              primary="Cerrar Sesión"
              primaryTypographyProps={{ color: "var(--color-text-muted)" }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />

      {/* AppBar - solo visible en móvil */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: "var(--color-primary)",
          boxShadow: 1,
          display: { md: "none" },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="abrir menú"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, color: "var(--color-text-light)" }}
          >
            <HiMenu size={24} />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ color: "var(--color-text-light)" }}
          >
            Sucursales
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer móvil (temporal) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Mejor rendimiento en móvil
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            backgroundColor: sidebarBg,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Drawer permanente (desktop) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            backgroundColor: sidebarBg,
            borderRight: "none",
            boxShadow: "2px 0 8px rgba(0, 0, 0, 0.08)",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
          ml: { xs: 0, md: `${drawerWidth}px` }, // Desplazar contenido a la derecha del sidebar
          mt: { xs: "56px", md: 0 }, // Espacio para AppBar en móvil
          backgroundColor: "var(--color-page-bg)",
          minHeight: "100vh",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
