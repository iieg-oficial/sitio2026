import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export function useSearchFilter(data, searchFields) {
    const [searchText, setSearchText] = useState('');

    const filteredData = useMemo(() => {
        if (!searchText.trim()) return data;
        const lower = searchText.toLowerCase();

        return data.filter((item) =>
            searchFields.some((field) => {
                const value = typeof field === 'function' ? field(item) : item[field];
                return String(value ?? '').toLowerCase().includes(lower);
            })
        );
    }, [data, searchText, searchFields]);

    return { searchText, setSearchText, filteredData };
}

export function useDebouncedSearch(fetchFn, delay = 400, deps = []) {
    const [searchText, setSearchText] = useState('');
    const timeoutRef = useRef(null);
    const fetchFnRef = useRef(fetchFn);
    const isFirstRun = useRef(true);

    useEffect(() => {
        fetchFnRef.current = fetchFn;
    }, [fetchFn]);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            fetchFnRef.current(searchText);
        }, delay);

        return () => clearTimeout(timeoutRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText, delay, ...deps]);

    const setSearchTextImmediate = useCallback((value) => {
        setSearchText(value);
    }, []);

    return { searchText, setSearchText: setSearchTextImmediate };
}