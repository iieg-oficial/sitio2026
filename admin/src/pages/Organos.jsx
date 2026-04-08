import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';

const { Title } = Typography;

export default function Organos() {
    const [organos, setOrganos] = useState([]);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingOrgano, setEditingOrgano] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchOrganos = async () => {
        setLoading(true);
        try {
            const res = await api.get('/organos');
            setOrganos(res.data);
        } catch (err) {
            console.error("Error fetching organos:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganos();
    }, []);

    const handleCreate = () => {
        setEditingOrgano(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingOrgano(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este organo?',
            icon: <DeleteOutlined />,
            content: `¿Está seguro de eliminar "${record.titulo}"?`,
            okText: 'Sí',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await api.delete(`/organos/${record.id}`);
                    message.success('Organo eliminado correctamente');
                    fetchOrganos();
                } catch (err) {
                    message.error('Error al eliminar el organo');
                }
            },
        });
    };

    const handleSave = async (values) => {
        try {
            if (editingOrgano) {
                await api.put(`/organos/${editingOrgano.id}`, values);
                message.success('Organo actualizado correctamente');
            } else {
                await api.post('/organos/create', values);
                message.success('Organo creado correctamente');
            }
            setModalVisible(false);
            fetchOrganos();
        } catch (err) {
            message.error('Error al guardar el organo');
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
            title: 'Link',
            dataIndex: 'link',
            key: 'link',
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (text, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} /> Editar
                    <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record)} /> Eliminar
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <Title level={4}>Organos</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                Crear Organo
            </Button>
            <Table columns={columns} dataSource={organos} loading={loading} />
            <Modal
                title={editingOrgano ? 'Editar Organo' : 'Crear Organo'}
                visible={modalVisible}
                onOk={form.submit}
                onCancel={() => setModalVisible(false)}
            >
                <Form form={form} onFinish={handleSave}>
                    <Form.Item name="titulo" label="Título" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="descripcion" label="Descripción">
                        <Input />
                    </Form.Item>
                    <Form.Item name="link" label="Link">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
}