// src/hooks/useFetchOnFocus.js
import { useEffect, useCallback, useRef } from 'react';

export function useFetchOnFocus(fetchFunction, enabled = true) {
    const savedHandler = useRef(fetchFunction);

    useEffect(() => {
        savedHandler.current = fetchFunction;
    }, [fetchFunction]);

    const executeFetch = useCallback(() => {
        if (enabled && typeof savedHandler.current === 'function') {
            savedHandler.current();
        }
    }, [enabled]);

    useEffect(() => {
        // Carga inicial
        executeFetch();

        // Listener cuando la ventana recupera el foco
        const handleFocus = () => {
            executeFetch();
        };

        // Listener cuando el documento cambia de estado de visibilidad (cambio de pestaña)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                executeFetch();
            }
        };

        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [executeFetch]);
}