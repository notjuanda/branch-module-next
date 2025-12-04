"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Modal, ConfirmDeleteModal, useToast } from "@/components/ui";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  HiOutlinePhotograph,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineStar,
  HiStar,
} from "react-icons/hi";
import { BranchResponse, BranchImageResponse } from "@/api/types";
import { branchImageService } from "@/api/services";
import { API_CONFIG } from "@/api/config";

// Helper para construir URL completa de imagen
const getImageUrl = (url: string) => {
  if (url.startsWith("http")) return url;
  return `${API_CONFIG.BASE_URL ?? "http://localhost:8080"}${url.startsWith("/") ? "" : "/"}${url}`;
};

interface BranchImagesModalProps {
  open: boolean;
  onClose: () => void;
  branch: BranchResponse | null;
  /** Callback cuando cambia la portada (agregar, cambiar o eliminar) */
  onCoverChange?: () => void;
}

export default function BranchImagesModal({
  open,
  onClose,
  branch,
  onCoverChange,
}: BranchImagesModalProps) {
  const { showSuccess, showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado
  const [images, setImages] = useState<BranchImageResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewFile, setPreviewFile] = useState<{
    file: File;
    url: string;
  } | null>(null);

  // Estado para modal de confirmación de eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<BranchImageResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Estado para establecer portada
  const [settingCover, setSettingCover] = useState(false);

  // Cargar imágenes
  const fetchImages = useCallback(async () => {
    if (!branch) return;

    setLoading(true);
    try {
      const data = await branchImageService.list(branch.id);
      setImages(data);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error loading images:", error);
      showError("Error al cargar las imágenes");
    } finally {
      setLoading(false);
    }
  }, [branch, showError]);

  useEffect(() => {
    if (open && branch) {
      fetchImages();
      setPreviewFile(null);
    }
  }, [open, branch, fetchImages]);

  // Manejar selección de archivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      showError("Solo se permiten imágenes");
      return;
    }

    // Validar tamaño (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showError("La imagen no debe superar 5MB");
      return;
    }

    // Crear preview
    const url = URL.createObjectURL(file);
    setPreviewFile({ file, url });
  };

  // Subir imagen
  const handleUpload = async () => {
    if (!branch || !previewFile) return;

    setUploading(true);
    try {
      const newImage = await branchImageService.upload(
        branch.id,
        previewFile.file
      );
      setImages((prev) => [...prev, newImage]);
      setPreviewFile(null);
      showSuccess("Imagen subida correctamente");

      // Si la imagen subida es portada (primera imagen), notificar al padre
      if (newImage.cover) {
        onCoverChange?.();
      }

      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      showError("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  // Cancelar preview
  const handleCancelPreview = () => {
    if (previewFile) {
      URL.revokeObjectURL(previewFile.url);
      setPreviewFile(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Abrir modal de confirmación para eliminar
  const handleDeleteClick = (image: BranchImageResponse) => {
    setImageToDelete(image);
    setDeleteModalOpen(true);
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!branch || !imageToDelete) return;

    setDeleting(true);
    try {
      const wascover = imageToDelete.cover;
      await branchImageService.delete(branch.id, imageToDelete.id);
      setImages((prev) => prev.filter((img) => img.id !== imageToDelete.id));

      // Ajustar índice si es necesario
      if (currentIndex >= images.length - 1 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }

      // Si era la portada, notificar al padre
      if (wascover) {
        onCoverChange?.();
      }

      showSuccess("Imagen eliminada");
      setDeleteModalOpen(false);
      setImageToDelete(null);
    } catch (error) {
      console.error("Error deleting image:", error);
      showError("Error al eliminar la imagen");
    } finally {
      setDeleting(false);
    }
  };

  // Cerrar modal de confirmación
  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setImageToDelete(null);
  };

  // Establecer imagen como portada
  const handleSetCover = async (image: BranchImageResponse) => {
    if (!branch || image.cover || settingCover) return;

    setSettingCover(true);
    try {
      const updatedImage = await branchImageService.setCover(branch.id, image.id);
      // Actualizar el estado: quitar cover de todas y poner en la seleccionada
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          cover: img.id === updatedImage.id,
        }))
      );
      // Notificar al padre para actualizar la card
      onCoverChange?.();
      showSuccess("Portada actualizada");
    } catch (error) {
      console.error("Error setting cover:", error);
      showError("Error al establecer la portada");
    } finally {
      setSettingCover(false);
    }
  };

  // Navegación del carrusel
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <HiOutlinePhotograph size={24} />
          <Typography variant="h6" component="span">
            Galería de imágenes
          </Typography>
        </Box>
      }
      subtitle={branch?.name}
      showCloseButton
      transition="fade"
    >
      <Box sx={{ minHeight: 300 }}>
        {/* Input oculto para archivos */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        {/* Estado de carga */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: 300,
              gap: 2,
            }}
          >
            <CircularProgress sx={{ color: "var(--color-primary)" }} />
            <Typography color="text.secondary">Cargando imágenes...</Typography>
          </Box>
        ) : (
          <>
            {/* Sin imágenes */}
            {images.length === 0 && !previewFile && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 250,
                  gap: 2,
                  border: "2px dashed var(--color-border)",
                  borderRadius: 2,
                  backgroundColor: "var(--color-surface)",
                  mb: 3,
                }}
              >
                <HiOutlinePhotograph size={64} color="#9ca3af" />
                <Typography color="text.secondary">
                  No hay imágenes para esta sucursal
                </Typography>
              </Box>
            )}

            {/* Galería de imágenes */}
            {images.length > 0 && (
              <Box sx={{ mb: 3 }}>
                {/* Carrusel */}
                <Box sx={{ position: "relative" }}>
                  {/* Imagen principal */}
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: 350,
                      borderRadius: 2,
                      overflow: "hidden",
                      backgroundColor: "var(--color-surface)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={getImageUrl(images[currentIndex]?.url)}
                      alt={
                        images[currentIndex]?.altText ||
                        `Imagen ${currentIndex + 1}`
                      }
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />

                    {/* Botones de acción */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        display: "flex",
                        gap: 1,
                      }}
                    >
                      {/* Botón portada */}
                      <IconButton
                        onClick={() => handleSetCover(images[currentIndex])}
                        disabled={settingCover || images[currentIndex]?.cover}
                        sx={{
                          backgroundColor: images[currentIndex]?.cover
                            ? "rgba(234, 179, 8, 0.95)"
                            : "rgba(0, 0, 0, 0.5)",
                          color: "white",
                          "&:hover": {
                            backgroundColor: images[currentIndex]?.cover
                              ? "rgba(234, 179, 8, 1)"
                              : "rgba(234, 179, 8, 0.8)",
                          },
                          "&:disabled": {
                            backgroundColor: images[currentIndex]?.cover
                              ? "rgba(234, 179, 8, 0.95)"
                              : "rgba(0, 0, 0, 0.3)",
                            color: "white",
                          },
                        }}
                      >
                        {settingCover ? (
                          <CircularProgress size={20} sx={{ color: "white" }} />
                        ) : images[currentIndex]?.cover ? (
                          <HiStar size={20} />
                        ) : (
                          <HiOutlineStar size={20} />
                        )}
                      </IconButton>

                      {/* Botón eliminar */}
                      <IconButton
                        onClick={() => handleDeleteClick(images[currentIndex])}
                        sx={{
                          backgroundColor: "rgba(239, 68, 68, 0.9)",
                          color: "white",
                          "&:hover": { backgroundColor: "var(--color-danger)" },
                        }}
                      >
                        <HiOutlineTrash size={20} />
                      </IconButton>
                    </Box>

                    {/* Navegación (solo si hay más de 1 imagen) */}
                    {images.length > 1 && (
                      <>
                        <IconButton
                          onClick={goToPrevious}
                          sx={{
                            position: "absolute",
                            left: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            color: "white",
                            "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
                          }}
                        >
                          <HiOutlineChevronLeft size={24} />
                        </IconButton>
                        <IconButton
                          onClick={goToNext}
                          sx={{
                            position: "absolute",
                            right: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            color: "white",
                            "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
                          }}
                        >
                          <HiOutlineChevronRight size={24} />
                        </IconButton>
                      </>
                    )}

                    {/* Indicador (solo si hay más de 1 imagen) */}
                    {images.length > 1 && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 12,
                          left: "50%",
                          transform: "translateX(-50%)",
                          display: "flex",
                          gap: 1,
                        }}
                      >
                        {images.map((_, idx) => (
                          <Box
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor:
                                idx === currentIndex
                                  ? "var(--color-primary)"
                                  : "rgba(255, 255, 255, 0.5)",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>

                  {/* Contador */}
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      textAlign: "center",
                      mt: 1,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {currentIndex + 1} de {images.length}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Sección de subida de imágenes */}
            {!previewFile ? (
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: "2px dashed var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "var(--color-primary)",
                    backgroundColor: "rgba(0, 50, 84, 0.02)",
                  },
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    backgroundColor: "rgba(0, 50, 84, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <HiOutlinePlus size={24} color="var(--color-primary)" />
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: "var(--color-text-muted)", textAlign: "center" }}
                >
                  {images.length === 0
                    ? "Haz clic para agregar la primera imagen"
                    : "Haz clic para agregar otra imagen"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "var(--color-text-muted)" }}
                >
                  Máximo 5MB • JPG, PNG, GIF, WebP
                </Typography>
              </Box>
            ) : (
              /* Preview de imagen a subir */
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "2px solid var(--color-success)",
                  backgroundColor: "rgba(34, 197, 94, 0.05)",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 2,
                    color: "var(--color-success)",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <HiOutlinePlus size={18} />
                  Nueva imagen a subir
                </Typography>
                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      width: 200,
                      height: 150,
                      borderRadius: 1,
                      overflow: "hidden",
                      flexShrink: 0,
                      backgroundColor: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={previewFile.url}
                      alt="Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, mb: 0.5 }}
                    >
                      {previewFile.file.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 2 }}
                    >
                      {(previewFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleUpload}
                        disabled={uploading}
                        startIcon={
                          uploading ? (
                            <CircularProgress size={16} sx={{ color: "white" }} />
                          ) : (
                            <HiOutlinePlus size={16} />
                          )
                        }
                        sx={{
                          backgroundColor: "var(--color-success)",
                          textTransform: "none",
                          "&:hover": {
                            backgroundColor: "var(--color-success-hover)",
                          },
                        }}
                      >
                        {uploading ? "Subiendo..." : "Confirmar subida"}
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleCancelPreview}
                        disabled={uploading}
                        sx={{
                          borderColor: "var(--color-border)",
                          color: "var(--color-text)",
                          textTransform: "none",
                        }}
                      >
                        Cancelar
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Modal de confirmación de eliminación */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={imageToDelete?.title || "esta imagen"}
        loading={deleting}
      />
    </Modal>
  );
}
