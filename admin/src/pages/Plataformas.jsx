import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Checkbox } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';

const { Title } = Typography;

export default function Plataformas() {
    const [form] = Form.useForm();
    const [plataformas, setPlataformas] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingPlataforma, setEditingPlataforma] = useState(null);

    useEffect(() => {
        fetchPlataformas();
    }, []);

    const fetchPlataformas = async () => {
        setLoading(true);
        try {
            const response = await api.get('/plataformas');
            setPlataformas(response.data);
        } catch (error) {
            message.error('Error al cargar plataformas');
        }
        finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingPlataforma(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingPlataforma(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar esta plataforma?',
            content: `Se eliminará la plataforma: ${record.nombre}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/plataformas/${record.id}`);
                    message.success('Plataforma eliminada exitosamente');
                    fetchPlataformas();
                } catch (error) {
                    message.error('Error al eliminar plataforma');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingPlataforma) {
                await api.put(`/plataformas/${editingPlataforma.id}`, values);
                message.success('Plataforma actualizada exitosamente');
            } else {
                await api.post('/plataformas/create', values);
                message.success('Plataforma creada exitosamente');
            }
            setModalVisible(false);
            fetchPlataformas();
        } catch (error) {
            message.error(editingPlataforma ? 'Error al actualizar plataforma' : 'Error al crear plataforma');
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
            title: 'Descripción',
            dataIndex: 'descripcion',
            key: 'descripcion',
            sorter: (a, b) => a.descripcion.localeCompare(b.descripcion)
        },
        {
            title: 'Destacada',
            dataIndex: 'destacada',
            key: 'destacada',
            render: (val) => val ? 'Sí' : 'No',
            sorter: (a, b) => Number(a.destacada) - Number(b.destacada)
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
                <Title level={2} style={{ margin: 0 }}>Administración de Plataformas</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Nueva Plataforma
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={plataformas}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} plataformas`
                    }}
                />
            </Card>

            <Modal
                title={editingPlataforma ? 'Editar Plataforma' : 'Nueva Plataforma'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={form.submit}
                okText={editingPlataforma ? 'Actualizar' : 'Crear'}
                cancelText="Cancelar"
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical" initialValues={{ destacada: false, orden: 0 }}>
                    <Form.Item
                        name="titulo"
                        label="Titulo"
                        rules={[{ required: true, message: 'Por favor ingrese el titulo de la plataforma' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="descripcion"
                        label="Descripción"
                        rules={[{ required: true, message: 'Por favor ingrese la descripción de la plataforma' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="url"
                        label="URL"
                        rules={[{ required: true, message: 'Por favor ingrese la URL de la plataforma' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="imagen"
                        label="Imagen"
                        rules={[{ required: true, message: 'Por favor ingrese la imagen de la plataforma' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="destacada"
                        label="Destacada"
                        valuePropName="checked"
                    >
                        <Checkbox>Destacada</Checkbox>
                    </Form.Item>
                    <Form.Item
                        name="orden"
                        label="Orden"
                    >
                        <Input type="number" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}