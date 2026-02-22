import Swal from "sweetalert2";
import { ApiError } from "@/services/api";

// ── Instancia base configurada ────────────────────────────────────────────────
export const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

// ── Mapeo de statusCode del backend → mensaje amigable ────────────────────────
function statusMessage(err: ApiError): string {
  switch (err.statusCode) {
    case 400: return err.message || "Datos inválidos. Revisa los campos.";
    case 401: return "Sesión expirada. Inicia sesión de nuevo.";
    case 403: return "No tienes permisos para esta acción.";
    case 404: return "El recurso no fue encontrado.";
    case 409: return err.message || "Ya existe un registro con esos datos.";
    case 422: return err.message || "Los datos enviados no son válidos.";
    case 429: return "Demasiadas peticiones. Espera un momento.";
    case 500: return "Error del servidor. Intenta de nuevo más tarde.";
    default:  return err.message || "Ocurrió un error inesperado.";
  }
}

// ── Notificaciones reutilizables ──────────────────────────────────────────────
export const alert = {
  success(title: string, text?: string) {
    return Toast.fire({ icon: "success", title, text });
  },

  error(err: unknown) {
    const message =
      err instanceof ApiError ? statusMessage(err) : "Error inesperado";
    const detail =
      err instanceof ApiError && err.error ? err.error : undefined;
    return Toast.fire({ icon: "error", title: message, text: detail });
  },

  confirm(title: string, text = "Esta acción no se puede deshacer.") {
    return Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });
  },
};
