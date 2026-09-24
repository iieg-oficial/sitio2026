import { useState, useEffect, useCallback } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import RichTextEditor from '@components/campos/RichTextEditor';
import { TableSearch } from '@components/common/TableSearch';
import { useSearchFilter } from '@components/common/searchHooks';

const { Title } = Typography;

export default function Organos() {
    const [organos, setOrganos] = useState([]);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingOrgano, setEditingOrgano] = useState(null);
    const [loading, setLoading] = useState(false);
    const { searchText, setSearchText, filteredData } = useSearchFilter(organos, ['titulo']);

    const fetchOrganos = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/organos', {
                params: { _t: new Date().getTime() }
            });
            // Extraer el array del objeto retornado {"organos": [...]}
            const rawData = response.data?.organos;
            const data = Array.isArray(rawData) ? rawData : [];
            const sortedData = [...data].sort((a, b) => (b.id || 0) - (a.id || 0));
            
            // Usar el setter del estado de React
            setOrganos(sortedData);
        } catch (error) {
            message.error('Error al cargar órganos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrganos();

        const handleFocus = () => {
            fetchOrganos();
        };
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchOrganos]);

    const handleCreate = () => {
        setEditingOrgano(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingOrgano(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este órgano?',
            icon: <DeleteOutlined />,
            content: `¿Está seguro de eliminar "${record.titulo || ''}"?`,
            okText: 'Sí',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await api.delete(`/organos/${record.id}`);
                    message.success('Órgano eliminado correctamente');
                    await fetchOrganos();
                } catch (err) {
                    message.error('Error al eliminar el órgano');
                }
            },
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingOrgano) {
                await api.patch(`/organos/${editingOrgano.id}`, values);
                message.success('Órgano actualizado correctamente');
            } else {
                await api.post('/organos/create', values);
                message.success('Órgano creado correctamente');
            }
            setModalVisible(false);
            await fetchOrganos();
        } catch (err) {
            message.error('Error al guardar el órgano');
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
            title: 'Descripción',
            dataIndex: 'descripcion',
            key: 'descripcion',
            sorter: (a, b) => (a.descripcion || '').localeCompare(b.descripcion || ''),
            render: (text) => (
                <div
                    className="tiptap-content"
                    dangerouslySetInnerHTML={{ __html: text || '' }}
                />
            ),
        },
        {
            title: 'Link',
            dataIndex: 'link',
            key: 'link',
            sorter: (a, b) => (a.link || '').localeCompare(b.link || '')
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
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Administración de Órganos</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Nuevo Órgano
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
                        showTotal: (total) => `Total ${total} órganos`
                    }}
                />
            </Card>

            <Modal
                title={editingOrgano ? 'Editar Órgano' : 'Crear Órgano'}
                open={modalVisible}
                onOk={form.submit}
                onCancel={() => setModalVisible(false)}
                okText={editingOrgano ? 'Actualizar' : 'Crear'}
                cancelText="Cancelar"
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item name="titulo" label="Título" rules={[{ required: true, message: 'Por favor ingrese el título' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="descripcion" label="Descripción">
                        <RichTextEditor />
                    </Form.Item>
                    <Form.Item name="link" label="Link">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}