import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';

const { Title } = Typography;

export default function Profesores() {
    const [profesores, setProfesores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProfesor, setEditingProfesor] = useState(null);

    useEffect(() => {
        fetchProfesores();
    }, []);

    const fetchProfesores = async () => {
        setLoading(true);
        try {
            const response = await api.get('/profesores');
            setProfesores(response.data);
        } catch {
            message.error('Error al cargar profesores');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingProfesor(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingProfesor(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este profesor?',
            content: `Se eliminará el profesor: ${record.nombre}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/profesores/${record.id}`);
                    message.success('Profesor eliminado exitosamente');
                    fetchProfesores();
                } catch {
                    message.error('Error al eliminar profesor');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingProfesor) {
                await api.put(`/profesores/${editingProfesor.id}`, values);
                message.success('Profesor actualizado exitosamente');
            } else {
                await api.post('/profesores/create', values);
                message.success('Profesor creado exitosamente');
            }
            setModalVisible(false);
            fetchProfesores();
        } catch {
            message.error(editingProfesor ? 'Error al actualizar profesor' : 'Error al crear profesor');
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
                <Title level={2} style={{ margin: 0 }}>Administración de Profesores</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Nuevo Profesor
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={profesores}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} profesores`
                    }}
                />
            </Card>

            <Modal
                title={editingProfesor ? 'Editar Profesor' : 'Nuevo Profesor'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                okText={editingProfesor ? 'Actualizar' : 'Crear'}
                cancelText="Cancelar"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        label="Nombre"
                        name="nombre"
                        rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Puesto"
                        name="puesto"
                        rules={[{ required: true, message: 'Por favor ingrese el puesto' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Descripción"
                        name="descripcion"
                        rules={[{ required: true, message: 'Por favor ingrese la descripción' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item
                        label="Foto"
                        name="foto"
                        rules={[{ required: true, message: 'Por favor ingrese la foto' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
