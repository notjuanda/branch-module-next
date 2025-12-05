// ===== INVENTORY SERVICE =====
// Este servicio maneja productos a través del proxy de sucursales
// Frontend -> nginx -> branch-module -> inventory-container

import type {
    ProductRequest,
    ProductResponse,
    ProductStatusUpdate,
} from "../types/inventory.types";
import { apiClient } from "@/api/config";

// Endpoints para productos (requieren branchId para saber a qué contenedor ir)
const getInventoryEndpoints = (branchId: string) => ({
    PRODUCTS: `/api/branches/${branchId}/inventory/products`,
    PRODUCT_BY_ID: (id: string) => `/api/branches/${branchId}/inventory/products/${id}`,
    PRODUCT_BY_SKU: (sku: string) => `/api/branches/${branchId}/inventory/products/sku/${sku}`,
    PRODUCTS_BY_BRAND: (brand: string) => `/api/branches/${branchId}/inventory/products/brand/${brand}`,
    PRODUCTS_BY_CATEGORY: (category: string) => `/api/branches/${branchId}/inventory/products/category/${category}`,
    PRODUCTS_SEARCH: `/api/branches/${branchId}/inventory/products/search`,
    PRODUCT_STATUS: (id: string) => `/api/branches/${branchId}/inventory/products/${id}/status`,
});

export const inventoryService = {
    /**
     * List all products (via branch inventory proxy)
     */
    listProducts: async (branchId: string): Promise<ProductResponse[]> => {
        const endpoints = getInventoryEndpoints(branchId);
        return apiClient.get<ProductResponse[]>(endpoints.PRODUCTS);
    },

    /**
     * Get product by ID
     */
    getProductById: async (branchId: string, id: string): Promise<ProductResponse> => {
        const endpoints = getInventoryEndpoints(branchId);
        return apiClient.get<ProductResponse>(endpoints.PRODUCT_BY_ID(id));
    },

    /**
     * Create a new product
     */
    createProduct: async (branchId: string, data: ProductRequest): Promise<ProductResponse> => {
        const endpoints = getInventoryEndpoints(branchId);
        return apiClient.post<ProductResponse>(endpoints.PRODUCTS, data);
    },

    /**
     * Update a product
     */
    updateProduct: async (branchId: string, id: string, data: ProductRequest): Promise<ProductResponse> => {
        const endpoints = getInventoryEndpoints(branchId);
        return apiClient.put<ProductResponse>(endpoints.PRODUCT_BY_ID(id), data);
    },

    /**
     * Delete a product
     */
    deleteProduct: async (branchId: string, id: string): Promise<void> => {
        const endpoints = getInventoryEndpoints(branchId);
        return apiClient.delete<void>(endpoints.PRODUCT_BY_ID(id));
    },

    /**
     * Get product by SKU
     */
    getProductBySku: async (branchId: string, sku: string): Promise<ProductResponse> => {
        const endpoints = getInventoryEndpoints(branchId);
        return apiClient.get<ProductResponse>(endpoints.PRODUCT_BY_SKU(sku));
    },

    /**
     * List products by brand
     */
    listProductsByBrand: async (branchId: string, brand: string): Promise<ProductResponse[]> => {
        const endpoints = getInventoryEndpoints(branchId);
        return apiClient.get<ProductResponse[]>(endpoints.PRODUCTS_BY_BRAND(brand));
    },

    /**
     * List products by category
     */
    listProductsByCategory: async (branchId: string, category: string): Promise<ProductResponse[]> => {
        const endpoints = getInventoryEndpoints(branchId);
        return apiClient.get<ProductResponse[]>(endpoints.PRODUCTS_BY_CATEGORY(category));
    },

    /**
     * Search products by keyword
     */
    searchProducts: async (branchId: string, keyword: string): Promise<ProductResponse[]> => {
        const endpoints = getInventoryEndpoints(branchId);
        return apiClient.get<ProductResponse[]>(endpoints.PRODUCTS_SEARCH, {
            params: { keyword },
        });
    },

    /**
     * Update product status (active/inactive)
     */
    updateProductStatus: async (branchId: string, id: string, data: ProductStatusUpdate): Promise<ProductResponse> => {
        const endpoints = getInventoryEndpoints(branchId);
        return apiClient.patch<ProductResponse>(endpoints.PRODUCT_STATUS(id), data);
    },
};

export default inventoryService;