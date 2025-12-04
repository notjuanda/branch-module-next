// ===== COMPONENTES UI REUTILIZABLES =====

// Botones
export {
  Button,
  IconButton,
  SaveButton,
  CancelButton,
  DeleteButton,
  EditButton,
  type ButtonProps,
  type IconButtonProps,
  type ButtonVariant,
  type ButtonSize,
  type ActionButtonProps,
} from "./Button";

// Modal
export {
  Modal,
  ConfirmModal,
  DeleteModal,
  FormModal,
  type ModalProps,
  type ModalSize,
  type ModalTransition,
  type ModalActionButton,
  type ConfirmModalProps,
  type DeleteModalProps,
  type FormModalProps,
} from "./Modal";

// Confirm Delete Modal (versión mejorada)
export {
  ConfirmDeleteModal,
  type ConfirmDeleteModalProps,
} from "./ConfirmDeleteModal";

// Toast
export {
  Toast,
  AlertToast,
  ToastProvider,
  useToast,
  type ToastProps,
  type ToastVariant,
  type ToastPosition,
  type ToastTransition,
  type AlertToastProps,
} from "./Toast";

// Card
export {
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  CardFooter,
  CardBadge,
  CardGrid,
  type CardProps,
  type CardVariant,
  type CardSize,
  type CardHeaderProps,
  type CardContentProps,
  type CardMediaProps,
  type CardFooterProps,
  type CardBadgeProps,
  type CardGridProps,
} from "./Card";

// DataTable
export {
  DataTable,
  TableBadge,
  TableAvatar,
  type Column,
  type DataTableProps,
  type SortDirection,
  type TableBadgeProps,
  type TableAvatarProps,
} from "./DataTable";

// Spinner
export { Spinner } from "./Spinner";

// Map (OpenStreetMap)
export {
  Map,
  type MapProps,
  type MapMarker,
} from "./Map";
