import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';

const { Title } = Typography;

export default function Paginas() {
    const [pages, setPages] = useState([]);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPage, setEditingPage] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchPages = async () => {
        setLoading(true);
        try {
            const res = await api.get('/paginas');
            setPages(res.data);
        } catch (err) {
            console.error("Error fetching pages:", err);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPages();
    }, []);


    const handleCreate = () => {
            setEditingPage(null);
            form.resetFields();
            setModalVisible(true);
        };
    
        const handleEdit = (record) => {
            setEditingPage(record);
            form.setFieldsValue(record);
            setModalVisible(true);
        };
    
        const handleDelete = (record) => {
            Modal.confirm({
                title: '¿Está seguro de eliminar esta página?',
                content: `Se eliminará la página: ${record.titulo}`,
                okText: 'Eliminar',
                okType: 'danger',
                cancelText: 'Cancelar',
                onOk: async () => {
                    try {
                        await api.delete(`/paginas/${record.id}`);
                        message.success('Página eliminada exitosamente');
                        fetchPages();
                    } catch {
                        message.error('Error al eliminar página');
                    }
                }
            });
        };
    
        const handleSubmit = async (values) => {
            try {
                if (editingPage) {
                    await api.put(`/paginas/${editingPage.id}`, values);
                    message.success('Página actualizada exitosamente');
                } else {
                    await api.post('/paginas/create', values);
                    message.success('Página creada exitosamente');
                }
                setModalVisible(false);
                fetchPages();
            } catch {
                message.error(editingPage ? 'Error al actualizar página' : 'Error al crear página');
            }
        };
    
        const columns = [
            {
                title: 'Titulo',
                dataIndex: 'title',
                key: 'title',
                sorter: (a, b) => a.title.localeCompare(b.title)
            },
            {
                title: 'Descripción',
                dataIndex: 'description',
                key: 'description',
                sorter: (a, b) => a.description.localeCompare(b.description)
            },
            {
                title: 'Slug',
                dataIndex: 'slug',
                key: 'slug',
                sorter: (a, b) => a.slug.localeCompare(b.slug)
            },
            {
                title: 'Publicado el',
                dataIndex: 'published_at',
                key: 'published_at',
                render: (date) => new Date(date).toLocaleDateString('es-MX'),
                sorter: (a, b) => new Date(a.published_at) - new Date(b.published_at)
            },
            {
                title: 'Keywords',
                dataIndex: 'meta_keywords',
                key: 'meta_keywords',
                sorter: (a, b) => a.meta_keywords.localeCompare(b.meta_keywords)                   
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
                <Title level={2} style={{ margin: 0 }}>Administración de Páginas</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Nueva Página
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={pages}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} páginas`
                    }}
                />
            </Card>

            <Modal
                title={editingPage ? 'Editar Página' : 'Nueva Página'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                okText={editingPage ? 'Actualizar' : 'Crear'}
                cancelText="Cancelar"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        label="Titulo"
                        name="title"
                        rules={[{ required: true, message: 'Por favor ingrese el titulo' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Descripción"
                        name="description"
                        rules={[{ required: true, message: 'Por favor ingrese la descripción' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Slug"
                        name="slug"
                        rules={[{ required: true, message: 'Por favor ingrese el slug' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Fecha de publicación"
                        name="published_at"
                        rules={[{ required: true, message: 'Por favor ingrese la fecha de publicación' }]}
                    >
                        <Input type="date" />
                    </Form.Item>

                    <Form.Item
                        label="Fecha de actualización"
                        name="updated_at"
                        rules={[{ required: true, message: 'Por favor ingrese la fecha de actualización' }]}
                    >
                        <Input type="date" />
                    </Form.Item>

                    <Form.Item
                        label="Keywords"
                        name="meta_keywords"
                        rules={[{ required: true, message: 'Por favor ingrese el titulo' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Meta Descripción"
                        name="meta_description"
                        rules={[{ required: true, message: 'Por favor ingrese la descripción' }]}
                    >
                        <Input />
                    </Form.Item>

                </Form>
            </Modal>
        </div>
    )
}