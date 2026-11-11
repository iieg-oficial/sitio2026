/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';

const SearchContext = createContext(null);
SearchContext.displayName = 'SearchContext';

export const SearchProvider = ({ children }) => {
    // Inicializar estado desde localStorage por si hubo una recarga de página
    const [initialSearchQuery, setInitialSearchQuery] = useState(() => {
        return localStorage.getItem('mapalab_search_query') || '';
    });
    const [shouldAutoOpenSearch, setShouldAutoOpenSearch] = useState(() => {
        return localStorage.getItem('mapalab_auto_open') === 'true';
    });

    const setSearchFromUrl = useCallback((query) => {
        if (query) {
            setInitialSearchQuery(query);
            setShouldAutoOpenSearch(true);
            localStorage.setItem('mapalab_search_query', query);
            localStorage.setItem('mapalab_auto_open', 'true');
        }
    }, []);

    const consumeInitialQuery = useCallback(() => {
        const query = initialSearchQuery || localStorage.getItem('mapalab_search_query') || '';
        setInitialSearchQuery('');
        localStorage.removeItem('mapalab_search_query');
        return query;
    }, [initialSearchQuery]);

    const clearAutoOpen = useCallback(() => {
        setShouldAutoOpenSearch(false);
        localStorage.removeItem('mapalab_auto_open');
    }, []);

    const value = {
        initialSearchQuery,
        shouldAutoOpenSearch,
        setSearchFromUrl,
        consumeInitialQuery,
        clearAutoOpen
    };

    return (
        <SearchContext.Provider value={value}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
};