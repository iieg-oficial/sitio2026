import { useState, useEffect, useCallback } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Checkbox } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import { TableSearch } from '@components/common/TableSearch';
import { useSearchFilter } from '@components/common/searchHooks';

const { Title } = Typography;

export default function Directorio() {
    const [form] = Form.useForm();
    const [directorio, setDirectorio] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingDirectorio, setEditingDirectorio] = useState(null);
    const { searchText, setSearchText, filteredData } = useSearchFilter(directorio, ['nombre', 'cargo']);

    const fetchDirectorio = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/directorio', {
                params: { _t: new Date().getTime() }
            });
            const data = Array.isArray(response.data) ? response.data : [];
            // Ordenamiento estricto por ID descendente
            const sortedData = [...data].sort((a, b) => (b.id || 0) - (a.id || 0));
            setDirectorio(sortedData);
        } catch {
            message.error('Error al cargar directorio');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDirectorio();

        const handleFocus = () => {
            fetchDirectorio();
        };
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchDirectorio]);

    const handleCreate = () => {
        setEditingDirectorio(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingDirectorio(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este directorio?',
            content: `Se eliminará el directorio: ${record.nombre}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/directorio/${record.id}`);
                    message.success('Directorio eliminado exitosamente');
                    await fetchDirectorio();
                } catch {
                    message.error('Error al eliminar directorio');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingDirectorio) {
                await api.patch(`/directorio/${editingDirectorio.id}`, values);
                message.success('Directorio actualizado exitosamente');
            } else {
                await api.post('/directorio/create', values);
                message.success('Directorio creado exitosamente');
            }
            setModalVisible(false);
            await fetchDirectorio();
        } catch {
            message.error(editingDirectorio ? 'Error al actualizar directorio' : 'Error al crear directorio');
        }
    };

    const columns = [
        {
            title: 'Nombre',
            dataIndex: 'nombre',
            key: 'nombre',
            sorter: (a, b) => (a.nombre || '').localeCompare(b.nombre || '')
        },
        {
            title: 'Cargo',
            dataIndex: 'cargo',
            key: 'cargo',
            sorter: (a, b) => (a.cargo || '').localeCompare(b.cargo || '')
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Editar
                    </Button>
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    >
                        Eliminar
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Administración de Directorio</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Nuevo Directorio
                </Button>
            </div>

            <Card>
                <TableSearch
                    value={searchText}
                    onChange={setSearchText}
                    placeholder="Buscar por nombre o cargo..."
                    loading={loading}
                />
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} directorios`
                    }}
                />
            </Card>

            <Modal
                title={editingDirectorio ? 'Editar Directorio' : 'Nuevo Directorio'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                okText={editingDirectorio ? 'Actualizar' : 'Crear'}
                cancelText="Cancelar"
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical" initialValues={{ director: false }}>
                    <Form.Item
                        name="nombre"
                        label="Nombre"
                        rules={[{ required: true, message: 'Por favor ingrese el nombre del directorio' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="cargo"
                        label="Cargo"
                        rules={[{ required: true, message: 'Por favor ingrese el cargo del directorio' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="director"
                        valuePropName="checked"
                    >
                        <Checkbox>¿Es director?</Checkbox>
                    </Form.Item>
                    <Form.Item
                        name="telefono"
                        label="Teléfono"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ type: 'email', message: 'Por favor ingrese un email válido' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}