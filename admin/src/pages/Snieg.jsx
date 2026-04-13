import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';

const { Title } = Typography;

export default function Snieg() {
    const [form] = Form.useForm();
    const [snieg, setSnieg] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingSnieg, setEditingSnieg] = useState(null);

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

    const handleAddSnieg = () => {
        setEditingSnieg(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEditSnieg = (snieg) => {
        setEditingSnieg(snieg);
        form.setFieldsValue(snieg);
        setIsModalVisible(true);
    };

    const handleDeleteSnieg = async (id) => {
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
                    <Button icon={<EditOutlined />} onClick={() => handleEditSnieg(record)} /> Editar
                    <Button icon={<DeleteOutlined />} onClick={() => handleDeleteSnieg(record.id)} /> Eliminar
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
                <Form form={form} layout="vertical">
                    <Form.Item name="titulo" label="Título" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="descripcion" label="Descripción" rules={[{ required: true }]}>
                        <Input.TextArea rows={4}/>
                    </Form.Item>
                    <Form.Item name="imagen" label="Imagen" rules={[{ required: false }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="enlace" label="Enlace" rules={[{ required: false }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}