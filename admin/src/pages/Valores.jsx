import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';

const { Title } = Typography;

export default function Valores() {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingValue, setEditingValue] = useState(null);
    const [loading, setLoading] = useState(false);
    const [valores, setValores] = useState([]);

    useEffect(() => {
        fetchValores();
    }, []);

    const fetchValores = async () => {
        try {
            const response = await api.get('/valores');
            setValores(response.data.valores);
        } catch (error) {
            message.error('Error al cargar los valores');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingValue(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingValue(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este valor?',
            content: `Se eliminará el valor: ${record.titulo}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/valores/${record.id}`);
                    message.success('Valor eliminado exitosamente');
                    fetchValores();
                } catch (error) {
                    message.error('Error al eliminar el valor');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingValue) {
                await api.put(`/valores/${editingValue.id}`, values);
                message.success('Valor actualizado exitosamente');
            } else {
                await api.post('/valores/create', values);
                message.success('Valor creado exitosamente');
            }
            setIsModalVisible(false);
            fetchValores();
        } catch (error) {
            message.error(editingValue ? 'Error al actualizar el valor' : 'Error al crear el valor');
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
                <Title level={2} style={{ margin: 0 }}>Administración de Valores</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Nuevo Valor
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={valores}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} valores`
                    }}
                />
            </Card>

            <Modal
                title={editingValue ? 'Editar Valor' : 'Nuevo Valor'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={form.submit}
                okText={editingValue ? 'Actualizar' : 'Crear'}
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
                        name="imagen"
                        label="Imagen"
                        rules={[{ required: true, message: 'Por favor seleccione una imagen' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}