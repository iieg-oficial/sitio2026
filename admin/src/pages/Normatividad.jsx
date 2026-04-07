import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';

const { Title } = Typography;

export default function Normatividad() {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingNormatividad, setEditingNormatividad] = useState(null);
    const [loading, setLoading] = useState(false);
    const [normatividad, setNormatividad] = useState([]);

    useEffect(() => {
        fetchNormatividad();
    }, []);

    const fetchNormatividad = async () => {
        try {
            setLoading(true);
            const response = await api.get('/normatividad');
            setNormatividad(response.data.normatividad);
        } catch (error) {
            message.error('Error al cargar la normatividad');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingNormatividad(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingNormatividad(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar esta normatividad?',
            content: `Se eliminará la normatividad: ${record.titulo}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/normatividad/${record.id}`);
                    message.success('Normatividad eliminada exitosamente');
                    fetchNormatividad();
                } catch (error) {
                    message.error('Error al eliminar la normatividad');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingNormatividad) {
                await api.put(`/normatividad/${editingNormatividad.id}`, values);
                message.success('Normatividad actualizada exitosamente');
            } else {
                await api.post('/normatividad/create', values);
                message.success('Normatividad creada exitosamente');
            }
            setIsModalVisible(false);
            fetchNormatividad();
        } catch (error) {
            message.error(editingNormatividad ? 'Error al actualizar la normatividad' : 'Error al crear la normatividad');
        }
    };

    const columns = [
        {
            title: 'Nombre',
            dataIndex: 'nombre',
            key: 'nombre',
            sorter: (a, b) => a.nombre.localeCompare(b.nombre)
        },
        {
            title: 'Descripción',
            dataIndex: 'descripcion',
            key: 'descripcion',
            sorter: (a, b) => a.descripcion.localeCompare(b.descripcion)
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
                <Title level={2} style={{ margin: 0 }}>Administración de Normatividad</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Nueva Normatividad
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={normatividad}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} normatividades`
                    }}
                />
            </Card>

            <Modal
                title={editingNormatividad ? 'Editar Normatividad' : 'Nueva Normatividad'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={form.submit}
                okText={editingNormatividad ? 'Actualizar' : 'Crear'}
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item
                        name="nombre"
                        label="Nombre"
                        rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="descripcion"
                        label="Descripción"
                        rules={[{ required: true, message: 'Por favor ingrese la descripción' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item
                        name="link"
                        label="Link"
                        rules={[{ required: false, message: 'Por favor ingrese el link' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="documento"
                        label="Documento"
                        rules={[{ required: false, message: 'Por favor ingrese el documento' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}   