import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import RichTextEditor from '@components/campos/RichTextEditor';

const { Title } = Typography;

export default function Proyectos() {
    const [proyectos, setProyectos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProyecto, setEditingProyecto] = useState(null);

    useEffect(() => {
        fetchProyectos();
    }, []);
    
    const fetchProyectos = async () => { 
        setLoading(true);
        try {
            const response = await api.get('/proyectos');
            setProyectos(response.data.proyectos);
        } catch {
            message.error('Error al cargar proyectos');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingProyecto(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingProyecto(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este proyecto?',
            content: `Se eliminará el proyecto: ${record.nombre}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/proyectos/${record.id}`);
                    message.success('Proyecto eliminado exitosamente');
                    fetchProyectos();
                } catch {
                    message.error('Error al eliminar proyecto');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingProyecto) {
                await api.put(`/proyectos/${editingProyecto.id}`, values);
                message.success('Proyecto actualizado exitosamente');
            } else {
                await api.post('/proyectos', values);
                message.success('Proyecto creado exitosamente');
            }
            setModalVisible(false);
            fetchProyectos();
        } catch {
            message.error('Error al guardar proyecto');
        }
    };

    const columns = [
        { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
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
                <Title level={2} style={{ margin: 0 }}>Proyectos</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Nuevo Proyecto
                </Button>
            </div>
            <Card>
                <Table
                    columns={columns}
                    dataSource={proyectos}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} proyectos`
                    }}
                />
            </Card>

            <Modal
                title={editingProyecto ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                okText={editingProyecto ? 'Actualizar' : 'Crear'}
                cancelText="Cancelar"
            >
                <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="nombre"
                        label="Nombre"
                        rules={[{ required: true, message: 'Por favor ingrese el nombre del proyecto' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="descripcion"
                        label="Descripción"
                    >
                        <RichTextEditor />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );  
}