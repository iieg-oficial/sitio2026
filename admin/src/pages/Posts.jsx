import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';

const { Title } = Typography;

export default function Posts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [subjects, setSubjects] = useState([]);  

    useEffect(() => {
        fetchPosts();
        fetchSubjects();
    }, []);

    
    const fetchSubjects = async () => {
        
        try {
            const response = await api.get('/subject');
            setSubjects(response.data);
        } catch {
            message.error('Error al cargar temas');
        } 
    };
    
    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/posts');
            setPosts(response.data);
        } catch {
            message.error('Error al cargar posts');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingPost(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingPost(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este post?',
            content: `Se eliminará el post: ${record.titulo}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/posts/${record.id}`);
                    message.success('Post eliminado exitosamente');
                    fetchPosts();
                } catch {
                    message.error('Error al eliminar post');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingPost) {
                await api.put(`/posts/${editingPost.id}`, values);
                message.success('Post actualizado exitosamente');
            } else {
                await api.post('/posts/create', values);
                message.success('Post creado exitosamente');
            }
            setModalVisible(false);
            fetchPosts();
        } catch {
            message.error(editingPost ? 'Error al actualizar post' : 'Error al crear post');
        }
    };

    const columns = [
        {
            title: 'Titulo',
            dataIndex: 'titulo',
            key: 'titulo',
            sorter: (a, b) => a.titulo.localeCompare(b.titulo)
        },
        {
            title: 'Resumen',
            dataIndex: 'resumen',
            key: 'resumen',
            sorter: (a, b) => a.resumen.localeCompare(b.resumen)
        },
        {
            title: 'Contenido',
            dataIndex: 'contenido',
            key: 'contenido',
            sorter: (a, b) => a.contenido.localeCompare(b.contenido)
        },
        {
            title: 'Autor',
            dataIndex: 'autor',
            key: 'autor',
            sorter: (a, b) => a.autor.localeCompare(b.autor)
        },
        {
            title: 'Fecha',
            dataIndex: 'fecha',
            key: 'fecha',
            render: (date) => new Date(date).toLocaleDateString('es-MX'),
            sorter: (a, b) => new Date(a.fecha) - new Date(b.fecha)
        },
        {
            title: 'Keywords',
            dataIndex: 'keywords',
            key: 'keywords',
            sorter: (a, b) => a.keywords.localeCompare(b.keywords)                   
        },
        {
            title: 'Tema',
            dataIndex: 'subject_id',
            key: 'subject_id',
            render: (subject_id) => subjects.find((s) => s.id === subject_id)?.titulo,
            sorter: (a, b) => a.subject.titulo.localeCompare(b.subject.titulo)                   
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
                <Title level={2} style={{ margin: 0 }}>Administración de Posts</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Nuevo Post
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={posts}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} posts`
                    }}
                />
            </Card>

            <Modal
                title={editingPost ? 'Editar Post' : 'Nuevo Post'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                okText={editingPost ? 'Actualizar' : 'Crear'}
                cancelText="Cancelar"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        label="Titulo"
                        name="titulo"
                        rules={[{ required: true, message: 'Por favor ingrese el titulo' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Resumen"
                        name="resumen"
                        rules={[{ message: 'Por favor ingrese el resumen' }]}
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item
                        label="Contenido"
                        name="contenido"
                        rules={[{ required: true, message: 'Por favor ingrese el contenido' }]}
                    >
                        <Input.TextArea rows={5} />
                    </Form.Item>

                    <Form.Item
                        label="Autor"
                        name="autor"
                        rules={[{ message: 'Por favor ingrese el autor' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Fecha"
                        name="fecha"
                        rules={[{ message: 'Por favor ingrese la fecha' }]}
                    >
                        <Input type="date" />
                    </Form.Item>

                    <Form.Item
                        label="Keywords"
                        name="keywords"
                        rules={[{ message: 'Por favor ingrese los keywords' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item label="Tema" name="subject_id" rules={[{ required: true, message: 'Por favor seleccione un tema' }]}>
                        <Select
                            placeholder="Selecciona un tema"
                            options={subjects.map((s) => ({
                                value: s.id,
                                label: s.titulo
                            }))}
                        />
                    </Form.Item>

                </Form>
            </Modal>
        </div>
    )
}
