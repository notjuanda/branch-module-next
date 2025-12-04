"use client";

import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import { HiOutlineRefresh, HiOutlineLocationMarker } from "react-icons/hi";

// ===== TIPOS =====
export interface MapMarker {
  id: string | number;
  lat: number;
  lng: number;
  title?: string;
  description?: string;
  color?: "primary" | "success" | "danger" | "default";
}

export interface MapProps {
  /** Latitud del centro del mapa */
  centerLat?: number;
  /** Longitud del centro del mapa */
  centerLng?: number;
  /** Nivel de zoom (1-18) */
  zoom?: number;
  /** Marcadores a mostrar */
  markers?: MapMarker[];
  /** Altura del mapa */
  height?: string | number;
  /** Ancho del mapa */
  width?: string | number;
  /** Mostrar controles de zoom */
  showZoomControls?: boolean;
  /** Callback cuando se hace click en el mapa */
  onClick?: (lat: number, lng: number) => void;
  /** Callback cuando se hace click en un marcador */
  onMarkerClick?: (marker: MapMarker) => void;
  /** Clases CSS adicionales */
  className?: string;
  /** Mostrar marcador en el centro */
  showCenterMarker?: boolean;
  /** Permitir arrastrar para seleccionar ubicación */
  draggable?: boolean;
  /** Callback cuando se arrastra el marcador */
  onDragEnd?: (lat: number, lng: number) => void;
}

// Colores para marcadores
const markerColors = {
  primary: "#003254",
  success: "#22c55e",
  danger: "#ef4444",
  default: "#6b7280",
};

// ===== COMPONENTE INTERNO DEL MAPA =====
function MapContent({
  centerLat = -17.7833,
  centerLng = -63.1821,
  zoom = 13,
  markers = [],
  height = 400,
  showZoomControls = true,
  onClick,
  onMarkerClick,
  showCenterMarker = false,
  draggable = false,
  onDragEnd,
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);

  // Cargar Leaflet dinámicamente (solo en cliente)
  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  // Inicializar mapa
  useEffect(() => {
    if (!L || !mapContainerRef.current || mapRef.current) return;

    // Crear mapa
    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: zoom,
      zoomControl: showZoomControls,
    });

    // Agregar capa de OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Handler de click
    if (onClick) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        onClick(e.latlng.lat, e.latlng.lng);
      });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [L, centerLat, centerLng, zoom, showZoomControls, onClick]);

  // Actualizar marcadores
  useEffect(() => {
    if (!L || !mapRef.current) return;

    // Limpiar marcadores anteriores
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Crear icono personalizado
    const createIcon = (color: string) => {
      return L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background-color: ${color};
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          ">
            <div style="
              width: 8px;
              height: 8px;
              background: white;
              border-radius: 50%;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            "></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });
    };

    // Agregar marcadores
    const allMarkers = [...markers];

    // Agregar marcador del centro si está habilitado
    if (showCenterMarker) {
      allMarkers.push({
        id: "center",
        lat: centerLat,
        lng: centerLng,
        title: "Ubicación seleccionada",
        color: "primary",
      });
    }

    allMarkers.forEach((markerData) => {
      const color = markerColors[markerData.color || "default"];
      const marker = L.marker([markerData.lat, markerData.lng], {
        icon: createIcon(color),
        draggable: draggable && markerData.id === "center",
      });

      // Popup
      if (markerData.title || markerData.description) {
        marker.bindPopup(`
          <div style="min-width: 150px;">
            ${markerData.title ? `<strong>${markerData.title}</strong>` : ""}
            ${
              markerData.description
                ? `<p style="margin: 4px 0 0 0; color: #666;">${markerData.description}</p>`
                : ""
            }
          </div>
        `);
      }

      // Click handler
      if (onMarkerClick) {
        marker.on("click", () => onMarkerClick(markerData));
      }

      // Drag handler
      if (draggable && markerData.id === "center" && onDragEnd) {
        marker.on("dragend", (e: L.DragEndEvent) => {
          const latlng = e.target.getLatLng();
          onDragEnd(latlng.lat, latlng.lng);
        });
      }

      marker.addTo(mapRef.current!);
      markersRef.current.push(marker);
    });
  }, [
    L,
    markers,
    showCenterMarker,
    centerLat,
    centerLng,
    draggable,
    onMarkerClick,
    onDragEnd,
  ]);

  // Actualizar vista cuando cambia el centro
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([centerLat, centerLng], zoom);
    }
  }, [centerLat, centerLng, zoom]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        width: "100%",
        borderRadius: "8px",
      }}
    />
  );
}

// ===== COMPONENTE PRINCIPAL =====
export function Map(props: MapProps) {
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Detectar cliente
  useEffect(() => {
    const timer = setTimeout(() => setIsClient(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Cargar estilos de Leaflet
  useEffect(() => {
    if (!isClient) return;

    const existingLink = document.querySelector('link[href*="leaflet.css"]');
    if (existingLink) {
      const t = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(t);
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";
    document.head.appendChild(link);

    link.onload = () => {
      setTimeout(() => setLoading(false), 0);
    };
    link.onerror = () => {
      setTimeout(() => {
        setError("Error al cargar los estilos del mapa");
        setLoading(false);
      }, 0);
    };
  }, [isClient]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  // Validar coordenadas
  const { centerLat = 0, centerLng = 0, height = 400 } = props;
  const hasValidCoordinates =
    typeof centerLat === "number" &&
    typeof centerLng === "number" &&
    !isNaN(centerLat) &&
    !isNaN(centerLng) &&
    centerLat >= -90 &&
    centerLat <= 90 &&
    centerLng >= -180 &&
    centerLng <= 180;

  // Estado de carga
  if (!isClient || loading) {
    return (
      <Box
        sx={{
          height: typeof height === "number" ? `${height}px` : height,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--color-surface)",
          borderRadius: 2,
          border: "1px solid var(--color-border)",
          gap: 2,
        }}
        className={props.className}
      >
        <CircularProgress size={32} sx={{ color: "var(--color-primary)" }} />
        <Typography variant="body2" color="text.secondary">
          Cargando mapa...
        </Typography>
      </Box>
    );
  }

  // Error
  if (error) {
    return (
      <Box
        sx={{
          height: typeof height === "number" ? `${height}px` : height,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--color-surface)",
          borderRadius: 2,
          border: "1px solid var(--color-border)",
          p: 3,
        }}
        className={props.className}
      >
        <Alert
          severity="error"
          sx={{ mb: 2, width: "100%", maxWidth: 300 }}
          action={
            <IconButton size="small" onClick={handleRetry}>
              <HiOutlineRefresh size={18} />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // Coordenadas inválidas
  if (!hasValidCoordinates) {
    return (
      <Box
        sx={{
          height: typeof height === "number" ? `${height}px` : height,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--color-surface)",
          borderRadius: 2,
          border: "1px dashed var(--color-border)",
          gap: 1,
        }}
        className={props.className}
      >
        <HiOutlineLocationMarker size={48} color="#9ca3af" />
        <Typography variant="body2" color="text.secondary">
          Coordenadas no disponibles
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Lat: {centerLat}, Lng: {centerLng}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid var(--color-border)",
      }}
      className={props.className}
    >
      <MapContent {...props} />
    </Box>
  );
}

export default Map;
