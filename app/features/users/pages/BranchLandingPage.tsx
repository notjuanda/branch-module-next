"use client";

import { useState, useEffect, useMemo } from "react";
import { Box, Container, Typography, CircularProgress } from "@mui/material";
import { motion, Variants } from "framer-motion";
import { HiOutlineLocationMarker, HiOutlinePhone, HiOutlineClock } from "react-icons/hi";
import { FaWhatsapp, FaParking, FaWheelchair } from "react-icons/fa";
import { MdDirections } from "react-icons/md";
import { BranchResponse, BranchImageResponse, BranchPhoneResponse, ScheduleResponse } from "@/api/types";
import { branchService, branchImageService, branchPhoneService, scheduleService } from "@/api/services";
import { API_CONFIG } from "@/api/config";
import { LandingNavbar, ChatWidget } from "../components";

// Motion components
const MotionBox = motion.create(Box);

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const } }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } }
};

interface BranchLandingPageProps {
  slug: string;
}

const getImageUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_CONFIG.BASE_URL}${url}`;
};

const DAYS_FULL = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function formatTime(time: string | null): string {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export default function BranchLandingPage({ slug }: BranchLandingPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [branch, setBranch] = useState<BranchResponse | null>(null);
  const [images, setImages] = useState<BranchImageResponse[]>([]);
  const [phones, setPhones] = useState<BranchPhoneResponse[]>([]);
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);

  const coverImage = useMemo(() => images.find((img) => img.cover), [images]);
  const galleryImages = useMemo(() => images.filter((img) => !img.cover), [images]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const branchData = await branchService.getBySlug(slug);
        setBranch(branchData);
        const [imagesData, phonesData, schedulesData] = await Promise.all([
          branchImageService.list(branchData.id),
          branchPhoneService.list(branchData.id),
          scheduleService.getWeek(branchData.id),
        ]);
        setImages(imagesData);
        setPhones(phonesData.filter((p) => p.publish));
        setSchedules(schedulesData);
      } catch {
        setError("No se encontró la sucursal");
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchData();
  }, [slug]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#1a1a1a" }}>
        <CircularProgress sx={{ color: "white" }} size={40} />
      </Box>
    );
  }

  if (error || !branch) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#1a1a1a" }}>
        <Typography sx={{ color: "white" }}>Sucursal no encontrada</Typography>
      </Box>
    );
  }

  const sortedSchedules = [...schedules].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  const today = new Date().getDay();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "white", overflow: "hidden" }}>
      <LandingNavbar branchName={branch.name} />

      {/* HERO */}
      <Box
        id="inicio"
        sx={{
          position: "relative",
          minHeight: { xs: "100svh", md: "100vh" },
          display: "flex",
          flexDirection: "column",
        }}
      >
        {coverImage && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${getImageUrl(coverImage.url)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              animation: "zoomIn 20s ease-out forwards",
              "@keyframes zoomIn": { "0%": { transform: "scale(1)" }, "100%": { transform: "scale(1.1)" } },
            }}
          />
        )}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: coverImage 
              ? "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.3) 100%)"
              : "#1a1a1a",
          }}
        />

        <Box sx={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
          <Container maxWidth="lg">
            <Box sx={{ maxWidth: { xs: "100%", md: 600 }, py: { xs: 12, md: 0 } }}>
              <Box 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 2, 
                  mb: 4,
                  animation: "fadeInUp 1s ease-out 0.2s both",
                  "@keyframes fadeInUp": { "0%": { opacity: 0, transform: "translateY(30px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: branch.active ? "#22c55e" : "#ef4444",
                    animation: branch.active ? "pulse 2s infinite" : "none",
                    "@keyframes pulse": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.5 } },
                  }}
                />
                <Typography sx={{ color: branch.active ? "#22c55e" : "#ef4444", fontWeight: 600, fontSize: { xs: "0.8rem", md: "0.9rem" }, letterSpacing: 1.5, textTransform: "uppercase" }}>
                  {branch.active ? "Abierto ahora" : "Cerrado"}
                </Typography>
              </Box>

              <Typography
                variant="h1"
                sx={{
                  color: "white",
                  fontWeight: 800,
                  fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem", lg: "5rem" },
                  lineHeight: 1,
                  mb: 3,
                  letterSpacing: "-0.02em",
                  animation: "fadeInUp 1s ease-out 0.4s both",
                }}
              >
                {branch.name}
              </Typography>

              <Typography 
                sx={{ 
                  color: "rgba(255,255,255,0.6)", 
                  fontSize: { xs: "1rem", md: "1.2rem" }, 
                  lineHeight: 1.6, 
                  maxWidth: 450,
                  animation: "fadeInUp 1s ease-out 0.6s both",
                }}
              >
                Te damos la bienvenida. Descubre todo lo que tenemos para ofrecerte.
              </Typography>
            </Box>
          </Container>
        </Box>

        <Box sx={{ position: "relative", pb: 4, textAlign: "center" }}>
          <Box
            component="button"
            onClick={() => document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" })}
            sx={{
              background: "none",
              border: "none",
              cursor: "pointer",
              opacity: 0.5,
              transition: "opacity 0.2s",
              "&:hover": { opacity: 1 },
            }}
          >
            <Typography sx={{ color: "white", fontSize: "0.7rem", letterSpacing: 2, textTransform: "uppercase", mb: 1 }}>
              Explorar
            </Typography>
            <Box sx={{ width: 20, height: 32, border: "2px solid rgba(255,255,255,0.5)", borderRadius: 10, mx: "auto", position: "relative" }}>
              <Box sx={{ position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", width: 3, height: 6, bgcolor: "white", borderRadius: 2, animation: "scroll 1.5s infinite", "@keyframes scroll": { "0%": { top: 6, opacity: 1 }, "100%": { top: 16, opacity: 0 } } }} />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* CONTACTO */}
      <Box id="contacto" sx={{ py: { xs: 8, md: 12 }, bgcolor: "white" }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 2fr" }, gap: { xs: 5, lg: 8 }, alignItems: "start" }}>
            <MotionBox
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Box sx={{ width: 30, height: 2, bgcolor: "#1a1a1a" }} />
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#888" }}>
                  Contacto
                </Typography>
              </Box>
              <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: "1.75rem", md: "2.25rem" }, color: "#1a1a1a", lineHeight: 1.2, mb: 2 }}>
                ¿Tienes alguna pregunta?
              </Typography>
              <Typography sx={{ color: "#666", fontSize: { xs: "0.95rem", md: "1rem" }, lineHeight: 1.7 }}>
                Estamos aquí para ayudarte. Contáctanos por el medio que prefieras.
              </Typography>
            </MotionBox>

            <MotionBox
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2 }}
            >
              {phones.map((phone) => (
                <MotionBox
                  key={phone.id}
                  variants={staggerItem}
                  whileHover={{ y: -4, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}
                >
                  <Box
                    component="a"
                    href={phone.whatsapp ? `https://wa.me/${phone.number.replace(/\D/g, "")}` : `tel:${phone.number}`}
                    target={phone.whatsapp ? "_blank" : undefined}
                    sx={{
                      display: "block",
                      textDecoration: "none",
                      p: { xs: 3, md: 4 },
                      border: "1px solid #e5e5e5",
                      transition: "border-color 0.3s",
                      "&:hover": { 
                        borderColor: "#1a1a1a", 
                      },
                    }}
                  >
                    <Box sx={{ color: phone.whatsapp ? "#25D366" : "#1a1a1a", mb: 2 }}>
                      {phone.whatsapp ? <FaWhatsapp size={28} /> : <HiOutlinePhone size={28} />}
                    </Box>
                    <Typography sx={{ fontSize: "0.7rem", color: "#999", textTransform: "uppercase", letterSpacing: 1, mb: 0.5 }}>
                      {phone.label || (phone.whatsapp ? "WhatsApp" : "Teléfono")}
                    </Typography>
                    <Typography sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" }, fontWeight: 700, color: "#1a1a1a" }}>
                      {phone.number}
                    </Typography>
                  </Box>
                </MotionBox>
              ))}

              {branch.primaryPhone && !phones.find((p) => p.number === branch.primaryPhone) && (
                <Box
                  component="a"
                  href={`tel:${branch.primaryPhone}`}
                  sx={{
                    display: "block",
                    textDecoration: "none",
                    p: { xs: 3, md: 4 },
                    border: "1px solid #e5e5e5",
                    transition: "all 0.2s",
                    "&:hover": { borderColor: "#1a1a1a" },
                  }}
                >
                  <Box sx={{ color: "#1a1a1a", mb: 2 }}>
                    <HiOutlinePhone size={28} />
                  </Box>
                  <Typography sx={{ fontSize: "0.7rem", color: "#999", textTransform: "uppercase", letterSpacing: 1, mb: 0.5 }}>
                    Línea Principal
                  </Typography>
                  <Typography sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" }, fontWeight: 700, color: "#1a1a1a" }}>
                    {branch.primaryPhone}
                  </Typography>
                </Box>
              )}
            </MotionBox>
          </Box>
        </Container>
      </Box>

      {/* GALERÍA */}
      {galleryImages.length > 0 && (
        <Box id="galeria" sx={{ py: { xs: 8, md: 12 }, bgcolor: "#f5f5f5" }}>
          <Container maxWidth="lg">
            <MotionBox
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              sx={{ mb: 6, textAlign: "center" }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 2 }}>
                <Box sx={{ width: 30, height: 2, bgcolor: "#1a1a1a" }} />
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#888" }}>
                  Galería
                </Typography>
                <Box sx={{ width: 30, height: 2, bgcolor: "#1a1a1a" }} />
              </Box>
              <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: "1.75rem", md: "2.5rem" }, color: "#1a1a1a", mb: 2 }}>
                Conoce nuestras instalaciones
              </Typography>
              <Typography sx={{ color: "#666", fontSize: { xs: "0.95rem", md: "1rem" }, maxWidth: 500, mx: "auto" }}>
                Diseñamos cada espacio pensando en tu comodidad.
              </Typography>
            </MotionBox>

            <MotionBox
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 1 }}
            >
              {galleryImages.slice(0, 6).map((image, idx) => (
                <MotionBox
                  key={image.id}
                  variants={scaleIn}
                  sx={{
                    position: "relative",
                    aspectRatio: idx === 0 ? { xs: "16/10", md: "16/12" } : "4/3",
                    gridColumn: idx === 0 ? { md: "span 2" } : "span 1",
                    gridRow: idx === 0 ? { md: "span 2" } : "span 1",
                    overflow: "hidden",
                    cursor: "pointer",
                    "&:hover img": { transform: "scale(1.1)" },
                  }}
                >
                  <Box
                    component="img"
                    src={getImageUrl(image.url)}
                    alt={image.altText || image.title || `Imagen ${idx + 1}`}
                    sx={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
                  />
                </MotionBox>
              ))}
            </MotionBox>
          </Container>
        </Box>
      )}

      {/* HORARIOS */}
      <Box id="horarios" sx={{ py: { xs: 8, md: 12 }, bgcolor: "white" }}>
        <Container maxWidth="sm">
          <MotionBox
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            sx={{ mb: 6, textAlign: "center" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 2 }}>
              <Box sx={{ width: 30, height: 2, bgcolor: "#1a1a1a" }} />
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#888" }}>
                Horarios
              </Typography>
              <Box sx={{ width: 30, height: 2, bgcolor: "#1a1a1a" }} />
            </Box>
            <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: "1.75rem", md: "2.5rem" }, color: "#1a1a1a", mb: 2 }}>
              Horarios de atención
            </Typography>
            <Typography sx={{ color: "#666", fontSize: { xs: "0.95rem", md: "1rem" } }}>
              Planifica tu visita con anticipación.
            </Typography>
          </MotionBox>

          {sortedSchedules.length > 0 ? (
            <MotionBox
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
            >
              {sortedSchedules.map((schedule, idx) => (
                <MotionBox
                  key={schedule.id}
                  variants={staggerItem}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 2.5,
                    px: schedule.dayOfWeek === today ? 2 : 0,
                    mx: schedule.dayOfWeek === today ? -2 : 0,
                    borderBottom: idx < sortedSchedules.length - 1 ? "1px solid #eee" : "none",
                    bgcolor: schedule.dayOfWeek === today ? "#f8f8f8" : "transparent",
                    transition: "all 0.2s",
                    "&:hover": { bgcolor: "#f5f5f5", px: 2, mx: -2 },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography sx={{ fontSize: { xs: "1rem", md: "1.25rem" }, fontWeight: 700, color: "#1a1a1a" }}>
                      {DAYS_FULL[schedule.dayOfWeek]}
                    </Typography>
                    {schedule.dayOfWeek === today && (
                      <Box sx={{ px: 1, py: 0.25, bgcolor: "#1a1a1a" }}>
                        <Typography sx={{ color: "white", fontSize: "0.6rem", fontWeight: 700, letterSpacing: 1 }}>HOY</Typography>
                      </Box>
                    )}
                  </Box>
                  <Typography sx={{ fontSize: { xs: "0.9rem", md: "1rem" }, fontWeight: 600, color: schedule.closed ? "#dc2626" : "#16a34a" }}>
                    {schedule.closed ? "Cerrado" : `${formatTime(schedule.open)} - ${formatTime(schedule.close)}`}
                  </Typography>
                </MotionBox>
              ))}
            </MotionBox>
          ) : (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <HiOutlineClock size={40} color="#ccc" />
              <Typography sx={{ color: "#999", mt: 2 }}>Horarios no disponibles</Typography>
            </Box>
          )}
        </Container>
      </Box>

      {/* UBICACIÓN */}
      <Box id="ubicacion" sx={{ py: { xs: 8, md: 12 }, bgcolor: "#f5f5f5" }}>
        <Container maxWidth="lg">
          <MotionBox
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            sx={{ mb: 6 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Box sx={{ width: 30, height: 2, bgcolor: "#1a1a1a" }} />
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#888" }}>
                Ubicación
              </Typography>
            </Box>
            <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: "1.75rem", md: "2.5rem" }, color: "#1a1a1a", mb: 2 }}>
              Ven a visitarnos
            </Typography>
            <Typography sx={{ color: "#666", fontSize: { xs: "0.95rem", md: "1rem" }, maxWidth: 500 }}>
              Estamos en un lugar de fácil acceso. Te esperamos.
            </Typography>
          </MotionBox>

          <MotionBox
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={scaleIn}
            sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, overflow: "hidden", borderRadius: 2, alignItems: "stretch" }}
          >
            <Box 
              sx={{ 
                bgcolor: "#1a1a1a", 
                p: { xs: 4, md: 6 }, 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "center", 
                order: { xs: 1, md: 1 },
              }}
            >
              <Box sx={{ color: "white", mb: 3 }}>
                <HiOutlineLocationMarker size={40} />
              </Box>
              <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", letterSpacing: 2, textTransform: "uppercase", mb: 1.5 }}>
                Dirección
              </Typography>
              <Typography sx={{ color: "white", fontSize: { xs: "1.25rem", md: "1.75rem" }, fontWeight: 700, lineHeight: 1.3, mb: 2 }}>
                {branch.address}
              </Typography>
              
              {/* Descripción adicional */}
              <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem", lineHeight: 1.7, mb: 4 }}>
                Ubicados en una zona céntrica y de fácil acceso. Contamos con todas las comodidades para que tu visita sea agradable.
              </Typography>

              {/* Información adicional */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mb: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FaParking size={16} color="white" />
                  </Box>
                  <Box>
                    <Typography sx={{ color: "white", fontSize: "0.9rem", fontWeight: 600 }}>
                      Estacionamiento
                    </Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
                      Amplio espacio disponible
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FaWheelchair size={16} color="white" />
                  </Box>
                  <Box>
                    <Typography sx={{ color: "white", fontSize: "0.9rem", fontWeight: 600 }}>
                      Accesibilidad
                    </Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
                      Instalaciones adaptadas
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <HiOutlineClock size={16} color="white" />
                  </Box>
                  <Box>
                    <Typography sx={{ color: "white", fontSize: "0.9rem", fontWeight: 600 }}>
                      Atención personalizada
                    </Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
                      Personal capacitado
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Botón de direcciones */}
              <Box
                component="a"
                href={`https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`}
                target="_blank"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 2,
                  bgcolor: "white",
                  color: "#1a1a1a",
                  px: 4,
                  py: 2,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  textDecoration: "none",
                  transition: "all 0.3s",
                  alignSelf: "flex-start",
                  "&:hover": { 
                    bgcolor: "#f5f5f5",
                    transform: "translateX(8px)",
                  },
                }}
              >
                <MdDirections size={20} />
                Cómo llegar
              </Box>
            </Box>
            <Box sx={{ minHeight: { xs: 300, md: "100%" }, order: { xs: 2, md: 2 } }}>
              <iframe
                src={`https://www.google.com/maps?q=${branch.lat},${branch.lng}&z=16&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0, display: "block", minHeight: 300 }}
                allowFullScreen
                loading="lazy"
                title={`Ubicación de ${branch.name}`}
              />
            </Box>
          </MotionBox>
        </Container>
      </Box>

      {/* FOOTER - HTML puro sin iconos */}
      <footer 
        style={{ 
          backgroundColor: "#111", 
          color: "white",
          padding: "48px 24px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Nombre y tagline */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h3 style={{ 
              fontSize: 28, 
              fontWeight: 800, 
              margin: 0,
              marginBottom: 8,
            }}>
              {branch.name}
            </h3>
            <p style={{ color: "#888", margin: 0, fontSize: 15 }}>
              Tu sucursal de confianza
            </p>
          </div>

          {/* Links */}
          <nav style={{ 
            textAlign: "center", 
            marginBottom: 32,
          }}>
            <a href="#inicio" style={{ color: "#aaa", margin: "0 16px", textDecoration: "none", fontSize: 14 }}>Inicio</a>
            <a href="#contacto" style={{ color: "#aaa", margin: "0 16px", textDecoration: "none", fontSize: 14 }}>Contacto</a>
            <a href="#horarios" style={{ color: "#aaa", margin: "0 16px", textDecoration: "none", fontSize: 14 }}>Horarios</a>
            <a href="#galeria" style={{ color: "#aaa", margin: "0 16px", textDecoration: "none", fontSize: 14 }}>Galería</a>
            <a href="#ubicacion" style={{ color: "#aaa", margin: "0 16px", textDecoration: "none", fontSize: 14 }}>Ubicación</a>
          </nav>

          {/* Contacto */}
          <div style={{ 
            textAlign: "center", 
            marginBottom: 32,
            paddingBottom: 32,
            borderBottom: "1px solid #333",
          }}>
            {branch.primaryPhone && (
              <span style={{ color: "#aaa", marginRight: 24, fontSize: 14 }}>
                Tel: {branch.primaryPhone}
              </span>
            )}
            <span style={{ color: "#aaa", fontSize: 14 }}>
              Dir: {branch.address}
            </span>
          </div>

          {/* Copyright */}
          <p style={{ textAlign: "center", color: "#666", fontSize: 12, margin: 0 }}>
            © {new Date().getFullYear()} {branch.name}. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* Chat Widget */}
      <ChatWidget branchSlug={slug} branchName={branch.name} />
    </Box>
  );
}
