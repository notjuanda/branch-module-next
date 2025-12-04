"use client";

import { useState, useEffect } from "react";
import { Box, IconButton, Drawer, Typography, Container, Tooltip } from "@mui/material";
import { HiOutlineMenuAlt4, HiX, HiOutlineLogout } from "react-icons/hi";
import { useChatbotAuth } from "../context";

interface LandingNavbarProps {
  branchName: string;
}

const NAV_ITEMS = [
  { label: "Inicio", href: "#inicio" },
  { label: "Contacto", href: "#contacto" },
  { label: "Galería", href: "#galeria" },
  { label: "Horarios", href: "#horarios" },
  { label: "Ubicación", href: "#ubicacion" },
];

export default function LandingNavbar({ branchName }: LandingNavbarProps) {
  const { user, logout } = useChatbotAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = () => {
    logout();
    // Recargar la página para volver al login
    window.location.reload();
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    const element = document.getElementById(href.replace("#", ""));
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  return (
    <>
      {/* Navbar */}
      <Box
        component="nav"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: "all 0.4s ease",
          backgroundColor: scrolled ? "#1a1a1a" : "transparent",
          borderBottom: scrolled ? "1px solid #333" : "none",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: scrolled ? 2 : 3,
              transition: "all 0.4s ease",
            }}
          >
            {/* Logo */}
            <Box
              component="a"
              href="#inicio"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("#inicio");
              }}
              sx={{ textDecoration: "none" }}
            >
              <Typography
                sx={{
                  color: "white",
                  fontWeight: 800,
                  fontSize: { xs: "1.25rem", md: "1.5rem" },
                  letterSpacing: "-0.02em",
                }}
              >
                {branchName}
              </Typography>
            </Box>

            {/* Nav Links - Desktop */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 1,
              }}
            >
              {NAV_ITEMS.map((item) => (
                <Box
                  key={item.href}
                  component="a"
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  sx={{
                    color: "white",
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    transition: "opacity 0.2s",
                    "&:hover": {
                      opacity: 0.7,
                    },
                  }}
                >
                  {item.label}
                </Box>
              ))}

              {/* Separador y botón de cerrar sesión */}
              {user && (
                <>
                  <Box sx={{ width: 1, height: 24, bgcolor: "rgba(255,255,255,0.3)", mx: 1 }} />
                  <Tooltip title={`Cerrar sesión (${user.name})`}>
                    <IconButton
                      onClick={handleLogout}
                      sx={{
                        color: "white",
                        opacity: 0.8,
                        transition: "all 0.2s",
                        "&:hover": {
                          opacity: 1,
                          bgcolor: "rgba(255,255,255,0.1)",
                        },
                      }}
                    >
                      <HiOutlineLogout size={20} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>

            {/* Menu Button - Mobile */}
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{
                display: { md: "none" },
                color: "white",
                p: 1,
              }}
            >
              <HiOutlineMenuAlt4 size={24} />
            </IconButton>
          </Box>
        </Container>
      </Box>

      {/* Drawer Mobile - Fullscreen */}
      <Drawer
        anchor="top"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: "100%",
            height: "100%",
            backgroundColor: "#1a1a1a",
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header del drawer */}
          <Container maxWidth="lg">
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 3 }}>
              <Typography sx={{ color: "white", fontWeight: 800, fontSize: "1.25rem" }}>
                {branchName}
              </Typography>
              <IconButton onClick={() => setMobileOpen(false)} sx={{ color: "white" }}>
                <HiX size={24} />
              </IconButton>
            </Box>
          </Container>

          {/* Nav Items centrados */}
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box sx={{ textAlign: "center" }}>
              {NAV_ITEMS.map((item) => (
                <Box
                  key={item.href}
                  component="a"
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  sx={{
                    display: "block",
                    py: 2,
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      "& .nav-label": { color: "white" },
                    },
                  }}
                >
                  <Typography
                    className="nav-label"
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: { xs: "2rem", sm: "2.5rem" },
                      fontWeight: 700,
                      transition: "color 0.2s ease",
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              ))}

              {/* Cerrar sesión en móvil */}
              {user && (
                <Box
                  component="button"
                  onClick={handleLogout}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1.5,
                    py: 2,
                    mt: 2,
                    mx: "auto",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      "& .logout-label": { color: "#ef4444" },
                      "& .logout-icon": { color: "#ef4444" },
                    },
                  }}
                >
                  <HiOutlineLogout className="logout-icon" size={28} color="rgba(255,255,255,0.5)" />
                  <Typography
                    className="logout-label"
                    sx={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: { xs: "1.5rem", sm: "2rem" },
                      fontWeight: 700,
                      transition: "color 0.2s ease",
                    }}
                  >
                    Cerrar sesión
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Footer del drawer */}
          <Container maxWidth="lg">
            <Box sx={{ py: 4, borderTop: "1px solid #333", textAlign: "center" }}>
              <Typography sx={{ color: "#666", fontSize: "0.85rem" }}>
                © {new Date().getFullYear()} {branchName}
              </Typography>
            </Box>
          </Container>
        </Box>
      </Drawer>
    </>
  );
}
