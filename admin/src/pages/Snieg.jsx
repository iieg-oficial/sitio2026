import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import RichTextEditor from '@components/campos/RichTextEditor';
import { UploadAcervo } from '@components/UploadAcervo';

const { Title } = Typography;

export default function Snieg() {
    const [form] = Form.useForm();
    const [snieg, setSnieg] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingSnieg, setEditingSnieg] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSnieg();
    }, []);

    const fetchSnieg = async () => {
        try {
            const response = await api.get('/snieg');
            setSnieg(response.data.snieg);
        } catch (error) {
            console.error('Error al obtener snieg:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingSnieg(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (snieg) => {
        setEditingSnieg(snieg);
        form.setFieldsValue(snieg);
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este snieg / CEIEG?',
            content: 'Se eliminará el snieg / CEIEG',
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/snieg/${id}`);
                    message.success('Snieg / CEIEG eliminado correctamente');
                    fetchSnieg();
                } catch (error) {
                    message.error('Error al eliminar snieg / CEIEG:', error);
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingSnieg) {
                await api.put(`/snieg/${editingSnieg.id}`, values);
                message.success('Snieg / CEIEG actualizado correctamente');
            } else {
                await api.post('/snieg/create', values);
                message.success('Snieg / CEIEG agregado correctamente');
            }
            setIsModalVisible(false);
            fetchSnieg();
        } catch (error) {
            message.error('Error al guardar snieg / CEIEG:', error);
        }
    };

    const columns = [
        {
            title: 'Título',
            dataIndex: 'titulo',
            key: 'titulo',
        },
        {
            title: 'Descripción',
            dataIndex: 'descripcion',
            key: 'descripcion',
            render: (text) => (
                <div
                className="tiptap-content"
                dangerouslySetInnerHTML={{ __html: text }}
                />
            ),
        },
        {
            title: 'Enlace',
            dataIndex: 'enlace',
            key: 'enlace',
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (text, record) => (
                <Space size="middle">
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} > Editar</Button>
                    <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} > Eliminar</Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2}>Snieg / CEIEG</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Agregar Snieg / CEIEG
                </Button>
            </div>

            <Card>
                <Table 
                    dataSource={snieg} 
                    columns={columns} 
                    rowKey="id" 
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                    showTotal: (total) => `Total ${total} snieg / CEIEG`
                }}
                />
            </Card>

            <Modal
                title={editingSnieg ? 'Editar Snieg' : 'Agregar Snieg'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={form.submit}
                okText={editingSnieg ? 'Actualizar' : 'Crear'}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="titulo" label="Título" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="descripcion" label="Descripción" rules={[{ required: true }]}>
                        <RichTextEditor />
                    </Form.Item>
                    <Form.Item name="imagen" label="Imagen" rules={[{ required: false }]}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <UploadAcervo
                                bucket="portal"
                                folder="/snieg"
                                label="Subir imagen"
                                onUploaded={(media) => {
                                    form.setFieldValue('imagen', media.url);
                                }}
                            />
                            <Form.Item name="imagen" noStyle>
                                <Input placeholder="URL de la imagen" />
                            </Form.Item>
                            {form.getFieldValue('imagen') ? (
                                <Image src={form.getFieldValue('imagen')} alt="Imagen del snieg" style={{ maxWidth: 200, borderRadius: 6 }} />
                            ) : null}
                        </Space>
                    </Form.Item>
                    <Form.Item name="enlace" label="Enlace" rules={[{ required: false }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}