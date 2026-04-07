import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';

const { Title } = Typography;

export default function PlanInstitucional() {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [planes, setPlanes] = useState([]);

    useEffect(() => {
        fetchPlanes();
    }, []);

    const fetchPlanes = async () => {
        try {
            const response = await api.get('/plan-institucional');
            setPlanes(response.data.planes);
        } catch (error) {
            message.error('Error al cargar los planes');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingPlan(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingPlan(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este plan?',
            content: `Se eliminará el plan: ${record.nombre}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/plan-institucional/${record.id}`);
                    message.success('Plan eliminado exitosamente');
                    fetchPlanes();
                } catch (error) {
                    message.error('Error al eliminar el plan');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingPlan) {
                await api.put(`/plan-institucional/${editingPlan.id}`, values);
                message.success('Plan actualizado exitosamente');
            } else {
                await api.post('/plan-institucional/create', values);
                message.success('Plan creado exitosamente');
            }
            setIsModalVisible(false);
            fetchPlanes();
        } catch (error) {
            message.error(editingPlan ? 'Error al actualizar el plan' : 'Error al crear el plan');
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
                <Title level={2} style={{ margin: 0 }}>Administración de Planes Institucionales</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Nuevo Plan
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={planes}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} planes`
                    }}
                />
            </Card>

            <Modal
                title={editingPlan ? 'Editar Plan' : 'Nuevo Plan'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={form.submit}
                okText={editingPlan ? 'Actualizar' : 'Crear'}
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
                    <Form.Item
                        name="imagen"
                        label="Imagen"
                        rules={[{ required: false, message: 'Por favor ingrese la imagen' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
                