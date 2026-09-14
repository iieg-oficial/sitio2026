import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

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