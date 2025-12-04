import { ProductsPage } from "@/app/features/products/pages";
import { ProtectedRoute } from "@/app/features/auth";

export default function ProductsRoute() {
    return (
        <ProtectedRoute>
            <ProductsPage />
        </ProtectedRoute>
    );
}
