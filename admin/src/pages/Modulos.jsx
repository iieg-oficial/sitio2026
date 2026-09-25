import { useState, useEffect, useCallback } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import RichTextEditor from '@components/campos/RichTextEditor';
import { TableSearch } from '@components/common/TableSearch';
import { useSearchFilter } from '@components/common/searchHooks';

const { Title } = Typography;

export default function Modulos() {
    const [modulos, setModulos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingModulo, setEditingModulo] = useState(null);
    
    const { searchText, setSearchText, filteredData } = useSearchFilter(modulos, ['nombre']);

    const fetchModulos = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/modulos', {
                params: { _t: new Date().getTime() }
            });
            // CORREGIDO: Extraer el arreglo del objeto response.data.modulos
            const rawData = response.data?.modulos;
            const data = Array.isArray(rawData) ? rawData : [];
            
            const sortedData = [...data].sort((a, b) => (b.id || 0) - (a.id || 0));
            
            // CORREGIDO: Usar el setter del estado en vez de la llamada recursiva a fetchModulos
            setModulos(sortedData);
        } catch {
            message.error('Error al cargar módulos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchModulos();

        const handleFocus = () => {
            fetchModulos();
        };
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchModulos]);

    const handleCreate = () => {
        setEditingModulo(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingModulo(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este módulo?',
            content: `Se eliminará el módulo: ${record.nombre || ''}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/modulos/${record.id}`);
                    message.success('Módulo eliminado exitosamente');
                    await fetchModulos();
                } catch {
                    message.error('Error al eliminar módulo');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingModulo) {
                await api.patch(`/modulos/${editingModulo.id}`, values);
                message.success('Módulo actualizado exitosamente');
            } else {
                await api.post('/modulos/create', values);
                message.success('Módulo creado exitosamente');
            }
            setModalVisible(false);
            await fetchModulos();
        } catch {
            message.error(editingModulo ? 'Error al actualizar módulo' : 'Error al crear módulo');
        }
    };

    const columns = [
        {
            title: 'Módulo',
            dataIndex: 'nombre',
            key: 'nombre',
            sorter: (a, b) => (a.nombre || '').localeCompare(b.nombre || '')
        },
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => (a.id || 0) - (b.id || 0)
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
                <Title level={2} style={{ margin: 0 }}>Administración de Módulos</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Nuevo Módulo
                </Button>
            </div>

            <Card>
                <TableSearch
                    value={searchText}
                    onChange={setSearchText}
                    placeholder="Buscar por módulo..."
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
                        showTotal: (total) => `Total ${total} módulos`
                    }}
                />
            </Card>

            <Modal
                title={editingModulo ? 'Editar Módulo' : 'Nuevo Módulo'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                okText={editingModulo ? 'Actualizar' : 'Crear'}
                cancelText="Cancelar"
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        name="nombre"
                        label="Módulo"
                        rules={[{ required: true, message: 'Por favor ingrese el nombre del módulo' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="descripcion"
                        label="Descripción"
                        rules={[{ required: true, message: 'Por favor ingrese la descripción del módulo' }]}
                    >
                        <RichTextEditor />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}