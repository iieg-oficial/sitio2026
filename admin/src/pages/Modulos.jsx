import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';

const { Title } = Typography;

export default function Modulos() {
    const [modulos, setModulos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingModulo, setEditingModulo] = useState(null);

    useEffect(() => {
        fetchModulos();
    }, []);

    const fetchModulos = async () => {
        setLoading(true);
        try {
            const response = await api.get('/modulos');
            setModulos(response.data.modulos);
        } catch (error) {
            console.error('Error al obtener modulos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingModulo(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingModulo(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este modulo?',
            content: `Se eliminará el modulo: ${record.titulo}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/modulos/${record.id}`);
                    message.success('Modulo eliminado exitosamente');
                    fetchModulos();
                } catch (error) {
                    console.error('Error al eliminar modulo:', error);
                    message.error('Error al eliminar modulo');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingModulo) {
                await api.put(`/modulos/${editingModulo.id}`, values);
                message.success('Modulo actualizado exitosamente');
            } else {
                await api.post('/modulos/create', values);
                message.success('Modulo creado exitosamente');
            }
            setModalVisible(false);
            fetchModulos();
        } catch (error) {
            message.error(editingModulo ? 'Error al actualizar modulo' : 'Error al crear modulo');
        }
    };

    const columns = [
        {
            title: 'Módulo',
            dataIndex: 'nombre',
            key: 'nombre',
            sorter: (a, b) => a.nombre.localeCompare(b.nombre)
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
                <Title level={2} style={{ margin: 0 }}>Administración de Módulos</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Nuevo Módulo
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={modulos}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} modulos`
                    }}
                />
            </Card>

            <Modal
                title={editingModulo ? 'Editar Módulo' : 'Nuevo Módulo'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                okText={editingModulo ? 'Actualizar' : 'Crear'}
                cancelText="Cancelar"
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        name="nombre"
                        label="Módulo"
                        rules={[{ required: true, message: 'Por favor ingrese el nombre del módulo' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="descripcion"
                        label="Descripción"
                        rules={[{ required: true, message: 'Por favor ingrese la descripción del módulo' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}