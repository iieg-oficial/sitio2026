import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';

const { Title } = Typography;

export default function PlanTrabajo() {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTrabajo, setEditingTrabajo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [trabajos, setTrabajos] = useState([]);

    useEffect(() => {
        fetchTrabajos();
    }, []);

    const fetchTrabajos = async () => {
        try {
            const response = await api.get('/plan-trabajo');
            setTrabajos(response.data.plan_trabajo);
        } catch (error) {
            message.error('Error al cargar los trabajos');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingTrabajo(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingTrabajo(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este trabajo?',
            content: `Se eliminará el trabajo: ${record.nombre}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/plan-trabajo/${record.id}`);
                    message.success('Trabajo eliminado exitosamente');
                    fetchTrabajos();
                } catch (error) {
                    message.error('Error al eliminar el trabajo');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingTrabajo) {
                await api.put(`/plan-trabajo/${editingTrabajo.id}`, values);
                message.success('Trabajo actualizado exitosamente');
            } else {
                await api.post('/plan-trabajo/create', values);
                message.success('Trabajo creado exitosamente');
            }
            setIsModalVisible(false);
            fetchTrabajos();
        } catch (error) {
            message.error(editingTrabajo ? 'Error al actualizar el trabajo' : 'Error al crear el trabajo');
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
                <Title level={2} style={{ margin: 0 }}>Administración de Planes de Trabajo</Title>
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
                    dataSource={trabajos}
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
                title={editingTrabajo ? 'Editar Plan' : 'Nuevo Plan'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={form.submit}
                okText={editingTrabajo ? 'Actualizar' : 'Crear'}
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
                        name="fecha"
                        label="Fecha"
                        rules={[{ required: false, message: 'Por favor ingrese la fecha' }]}
                    >
                        <Input type="date"/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
