// ===== INVENTORY SERVICE =====

import type {
    ProductRequest,
    ProductResponse,
    ProductStatusUpdate,
} from "../types/inventory.types";

const INVENTORY_BASE_URL = process.env.NEXT_PUBLIC_API_URL_2 || "http://localhost:8081";

const ENDPOINTS = {
    PRODUCTS: `${INVENTORY_BASE_URL}/api/products`,
    PRODUCT_BY_ID: (id: string) => `${INVENTORY_BASE_URL}/api/products/${id}`,
    PRODUCT_BY_SKU: (sku: string) => `${INVENTORY_BASE_URL}/api/products/sku/${sku}`,
    PRODUCTS_BY_BRAND: (brand: string) => `${INVENTORY_BASE_URL}/api/products/brand/${brand}`,
    PRODUCTS_BY_CATEGORY: (category: string) => `${INVENTORY_BASE_URL}/api/products/category/${category}`,
    PRODUCTS_SEARCH: `${INVENTORY_BASE_URL}/api/products/search`,
    PRODUCT_STATUS: (id: string) => `${INVENTORY_BASE_URL}/api/products/${id}/status`,
};

// Cliente HTTP simple para el módulo de inventario (usa su propia URL base)
async function inventoryRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!response.ok) {
        // Intentar extraer el mensaje de error del backend
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const errorBody = await response.json();
            if (errorBody.message) {
                errorMessage = errorBody.message;
            } else if (errorBody.error) {
                errorMessage = errorBody.error;
            }
        } catch {
            // Si no se puede parsear el JSON, usar el mensaje genérico
        }
        throw new Error(errorMessage);
    }

    // Para DELETE que no retorna contenido
    if (response.status === 204 || options.method === "DELETE") {
        return undefined as T;
    }

    return response.json();
}

export const inventoryService = {
    /**
     * List all products
     */
    listProducts: async (): Promise<ProductResponse[]> => {
        return inventoryRequest<ProductResponse[]>(ENDPOINTS.PRODUCTS);
    },

    /**
     * Get product by ID
     */
    getProductById: async (id: string): Promise<ProductResponse> => {
        return inventoryRequest<ProductResponse>(ENDPOINTS.PRODUCT_BY_ID(id));
    },

    /**
     * Create a new product
     */
    createProduct: async (data: ProductRequest): Promise<ProductResponse> => {
        return inventoryRequest<ProductResponse>(ENDPOINTS.PRODUCTS, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    /**
     * Update a product
     */
    updateProduct: async (id: string, data: ProductRequest): Promise<ProductResponse> => {
        return inventoryRequest<ProductResponse>(ENDPOINTS.PRODUCT_BY_ID(id), {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    /**
     * Delete a product
     */
    deleteProduct: async (id: string): Promise<void> => {
        await inventoryRequest<void>(ENDPOINTS.PRODUCT_BY_ID(id), {
            method: "DELETE",
        });
    },

    /**
     * Get product by SKU
     */
    getProductBySku: async (sku: string): Promise<ProductResponse> => {
        return inventoryRequest<ProductResponse>(ENDPOINTS.PRODUCT_BY_SKU(sku));
    },

    /**
     * List products by brand
     */
    listProductsByBrand: async (brand: string): Promise<ProductResponse[]> => {
        return inventoryRequest<ProductResponse[]>(ENDPOINTS.PRODUCTS_BY_BRAND(brand));
    },

    /**
     * List products by category
     */
    listProductsByCategory: async (category: string): Promise<ProductResponse[]> => {
        return inventoryRequest<ProductResponse[]>(ENDPOINTS.PRODUCTS_BY_CATEGORY(category));
    },

    /**
     * Search products by keyword
     */
    searchProducts: async (keyword: string): Promise<ProductResponse[]> => {
        const url = `${ENDPOINTS.PRODUCTS_SEARCH}?keyword=${encodeURIComponent(keyword)}`;
        return inventoryRequest<ProductResponse[]>(url);
    },

    /**
     * Update product status (active/inactive)
     */
    updateProductStatus: async (id: string, data: ProductStatusUpdate): Promise<ProductResponse> => {
        return inventoryRequest<ProductResponse>(ENDPOINTS.PRODUCT_STATUS(id), {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },
};

export default inventoryService;