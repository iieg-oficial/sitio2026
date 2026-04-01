import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';

const { Title } = Typography;

export default function Subject() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);

    useEffect(() => {
        fetchSubjects();
    }, []);
    
    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const response = await api.get('/subject');
            setSubjects(response.data);
        } catch {
            message.error('Error al cargar subjects');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingSubject(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingSubject(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este subject?',
            content: `Se eliminará el subject: ${record.titulo}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/subject/${record.id}`);
                    message.success('Subject eliminado exitosamente');
                    fetchSubjects();
                } catch {
                    message.error('Error al eliminar subject');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingSubject) {
                await api.put(`/subject/${editingSubject.id}`, values);
                message.success('Subject actualizado exitosamente');
            } else {
                await api.post('/subject/create', values);
                message.success('Subject creado exitosamente');
            }
            setModalVisible(false);
            fetchSubjects();
        } catch {
            message.error(editingSubject ? 'Error al actualizar subject' : 'Error al crear subject');
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
                <Title level={2} style={{ margin: 0 }}>Administración de Subjects</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Nuevo Subject
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={subjects}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} subjects`
                    }}
                />
            </Card>

            <Modal
                title={editingSubject ? 'Editar Subject' : 'Nuevo Subject'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                okText={editingSubject ? 'Actualizar' : 'Crear'}
                cancelText="Cancelar"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        label="Titulo"
                        name="titulo"
                        rules={[{ required: true, message: 'Por favor ingrese el titulo' }]}
                    >
                        <Input />
                    </Form.Item>


                </Form>
            </Modal>
        </div>
    )
}
