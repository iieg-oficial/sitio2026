import { useState, useEffect, useCallback } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import RichTextEditor from '@components/campos/RichTextEditor';
import { TableSearch } from '@components/common/TableSearch';
import { useSearchFilter } from '@components/common/searchHooks';

const { Title } = Typography;

export default function Subject() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    
    const { searchText, setSearchText, filteredData } = useSearchFilter(subjects, ['titulo']);

    const fetchSubjects = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/subject', {
                params: { _t: new Date().getTime() }
            });
            const data = Array.isArray(response.data) ? response.data : [];
            // Ordena del ID más alto (más reciente) al más bajo
            const sortedData = [...data].sort((a, b) => (b.id || 0) - (a.id || 0));
            
            // CORREGIDO: Se cambia la llamada recursiva errónea por el setter de React
            setSubjects(sortedData);
        } catch {
            message.error('Error al cargar temas');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubjects();

        const handleFocus = () => {
            fetchSubjects();
        };
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchSubjects]);

    const handleCreate = () => {
        setEditingSubject(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingSubject(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este tema?',
            content: `Se eliminará el tema: ${record.titulo}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/subject/${record.id}`);
                    message.success('Tema eliminado exitosamente');
                    await fetchSubjects();
                } catch {
                    message.error('Error al eliminar tema');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingSubject) {
                await api.put(`/subject/${editingSubject.id}`, values);
                message.success('Tema actualizado exitosamente');
            } else {
                await api.post('/subject/create', values);
                message.success('Tema creado exitosamente');
            }
            setModalVisible(false);
            await fetchSubjects();
        } catch {
            message.error(editingSubject ? 'Error al actualizar tema' : 'Error al crear tema');
        }
    };

    const columns = [
        {
            title: 'Título',
            dataIndex: 'titulo',
            key: 'titulo',
            sorter: (a, b) => (a.titulo || '').localeCompare(b.titulo || '')
        },
        {
            title: 'Padre',
            dataIndex: 'parent_id',
            key: 'parent_id',
            render: (parent_id) => {
                const padre = subjects.find((s) => s.id === parent_id);
                return padre ? padre.titulo : '-';
            },
            sorter: (a, b) => (a.parent_id || 0) - (b.parent_id || 0)
        },
        {
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug',
            sorter: (a, b) => (a.slug || '').localeCompare(b.slug || '')
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
                <Title level={2} style={{ margin: 0 }}>Administración de temas</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Nuevo tema
                </Button>
            </div>

            <Card>
                <TableSearch
                    value={searchText}
                    onChange={setSearchText}
                    placeholder="Buscar por título..."
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
                        showTotal: (total) => `Total ${total} temas`
                    }}
                />
            </Card>

            <Modal
                title={editingSubject ? 'Editar tema' : 'Nuevo tema'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                okText={editingSubject ? 'Actualizar' : 'Crear'}
                cancelText="Cancelar"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        label="Título"
                        name="titulo"
                        rules={[{ required: true, message: 'Por favor ingrese el título' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Descripción"
                        name="descripcion"
                        rules={[{ required: false, message: 'Por favor ingrese la descripción' }]}
                    >
                        <RichTextEditor />
                    </Form.Item>
                    <Form.Item
                        label="Padre"
                        name="parent_id"
                        rules={[{ required: false }]}
                    >
                        <Select
                            placeholder="Seleccione un tema padre (Opcional)"
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            options={[
                                { value: null, label: 'Sin padre' },
                                ...subjects
                                    .filter((s) => s.id !== editingSubject?.id) // Evitar asignarse a sí mismo como padre
                                    .map((s) => ({
                                        value: s.id,
                                        label: s.titulo
                                    }))
                            ]}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}