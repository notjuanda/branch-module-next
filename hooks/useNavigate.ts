"use client";

import { useRouter } from "next/navigation";
import { useLoading } from "@/contexts/LoadingContext";
import { useCallback } from "react";

export function useNavigate() {
    const router = useRouter();
    const { startLoading } = useLoading();

    const navigate = useCallback(
        (path: string, message: string = "Cargando...") => {
            startLoading(message);
            router.push(path);
        },
        [router, startLoading]
    );

    const navigateReplace = useCallback(
        (path: string, message: string = "Cargando...") => {
            startLoading(message);
            router.replace(path);
        },
        [router, startLoading]
    );

    return {
        navigate,
        navigateReplace,
        router,
    };
}
