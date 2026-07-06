import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import { TemaSelector } from '@components/pageComponents/SubjectSelector';
import RichTextEditor from '@components/campos/RichTextEditor';
import { UploadAcervoMultiple } from '@components/UploadAcervoMultiple';

const { Title } = Typography;

export default function Posts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [subjects, setSubjects] = useState([]);  
    const [selectedSubjects, setSelectedSubjects] = useState([]);    
    const [galleryImages, setGalleryImages] = useState([]);

    useEffect(() => {
        fetchPosts();
        fetchSubjects();
    }, []);


    const removeGalleryImage = (url) => {
        setGalleryImages((prev) => prev.filter((img) => img !== url));
    };
    
    const fetchSubjects = async () => {
        
        try {
            const response = await api.get('/subject/tree');
            setSubjects(response.data);
        } catch {
            message.error('Error al cargar temas');
        } 
    };
    
    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/posts');
            setPosts(response.data.posts);
        } catch {
            message.error('Error al cargar posts');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingPost(null);
        setSelectedSubjects([]);
        setGalleryImages([]);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        console.log('Record al editar:', record.gallery_images);
        setEditingPost(record);
        const ids = record.temas.map((tema) => tema.id);
        setSelectedSubjects(ids);
        setGalleryImages((record.gallery_images ?? []).map((img) => img.url));
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
            const payload = {
                ...values,
                tema_ids: selectedSubjects,
                gallery_urls: galleryImages.map((img) => (typeof img === 'string' ? img : img.url)),
            };
            console.log('Payload enviado:', payload); // <-- temporal
            if (editingPost) {
                await api.put(`/posts/${editingPost.id}`, payload);
                message.success('Post actualizado exitosamente');
            } else {
                await api.post('/posts/create', payload);
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
            sorter: (a, b) => a.resumen.localeCompare(b.resumen),
            render: (text) => (
                <div
                className="tiptap-content"
                dangerouslySetInnerHTML={{ __html: text }}
                />
            ),
        },
        {
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug',
            sorter: (a, b) => a.slug.localeCompare(b.slug)
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
            title: 'Claves',
            dataIndex: 'claves',
            key: 'claves',
            sorter: (a, b) => a.claves.localeCompare(b.claves)                   
        },
        {
            title: 'Tema',
            dataIndex: 'temas',
            key: 'temas',
            render: (temas) => temas.map((t) => t.titulo).join(', '),
            sorter: (a, b) => a.temas.map((t) => t.titulo).join(', ').localeCompare(b.temas.map((t) => t.titulo).join(', '))
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
                        <RichTextEditor />
                    </Form.Item>

                    <Form.Item
                        label="Contenido"
                        name="contenido"
                        rules={[{ required: true, message: 'Por favor ingrese el contenido' }]}
                    >
                        <RichTextEditor />
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

                    <Form.Item name="claves"
                        label="Palabras clave"
                        rules={[{ required: true, message: 'Por favor ingrese las palabras clave' }]}
                    >
                        <Input />
                    </Form.Item>

                    <TemaSelector
                        temas={subjects}
                        seleccionados={selectedSubjects}
                        onChange={(ids) => {                                    
                            setSelectedSubjects(ids);
                        }}
                    />
                    <Form.Item label="Galería de imágenes">
                        <UploadAcervoMultiple
                            bucket="portal"
                            folder="/blog"
                            label="Subir archivo"
                            onUploaded={(urls) => {
                                setGalleryImages((prev) => [...prev, ...urls]);
                            }}
                        />

                        <Space direction="vertical" style={{ width: '100%', marginTop: 10 }}>
                            {galleryImages.map((url) => (
                                <div key={url} style={{ marginBottom: 10, borderBottom: '1px solid #a59c9c', paddingBottom: 10, position: 'relative' }}>
                                        
                                        <div style={{ margin: '15px 0px' }}>
                                            <a href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block text-xs text-blue-600 truncate mt-1"
                                                title={url}
                                            >
                                                <img src={url}
                                                style={{ maxWidth: 260, marginBottom: 10 }}
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                                />                                            
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(url)}
                                                style={{ float: 'right',width: '10%' }}
                                            >
                                                ×
                                            </button>
                                            <Form.Item name="url" noStyle>
                                                <Input placeholder={url} value={url} />
                                            </Form.Item>
                                        </div>
                                </div>
                            ))}
                        </Space>
                            
                        
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}
