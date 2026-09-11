import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

/**
 * Filtrado en CLIENTE. Úsalo cuando ya tienes todos los datos cargados
 * en memoria (catálogos pequeños, árboles, etc).
 *
 * @param {Array} data - dataSource original
 * @param {Array} searchFields - campos a buscar. String o función (item) => valor
 */
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

/**
 * Búsqueda con debounce para filtrado en SERVIDOR. Úsalo cuando el listado
 * puede crecer mucho y el fetch trae los datos ya filtrados/paginados del backend.
 *
 * @param {Function} fetchFn - función que recibe (searchText) y hace el fetch
 * @param {number} delay - ms de debounce (default 400)
 * @param {Array} deps - dependencias extra que deben re-disparar el fetch
 */
export function useDebouncedSearch(fetchFn, delay = 400, deps = []) {
    const [searchText, setSearchText] = useState('');
    const timeoutRef = useRef(null);
    const fetchFnRef = useRef(fetchFn);
    fetchFnRef.current = fetchFn;

    useEffect(() => {
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

/**
 * Input de búsqueda reutilizable, sirve para ambos hooks.
 */
export function TableSearch({ value, onChange, placeholder = 'Buscar...', style, loading }) {
    return (
        <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ maxWidth: 320, marginBottom: 16, ...style }}
            suffix={loading ? '...' : null}
        />
    );
}