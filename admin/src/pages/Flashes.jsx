import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';

const { Title } = Typography;

export default function Flashes() {
    const [flashes, setFlashes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingFlash, setEditingFlash] = useState(null);

    useEffect(() => {
        fetchFlashes();
    }, []);

    const fetchFlashes = async () => {
        setLoading(true);
        try {
            const response = await api.get('/flashes');
            setFlashes(response.data.flashes);
        } catch {
            message.error('Error al cargar flashes');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingFlash(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingFlash(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este flash?',
            content: `Se eliminará el flash: ${record.titulo}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/flashes/${record.id}`);
                    message.success('Flash eliminado exitosamente');
                    fetchFlashes();
                } catch {
                    message.error('Error al eliminar el flash');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingFlash) {
                await api.put(`/flashes/${editingFlash.id}`, values);
                message.success('Flash actualizado exitosamente');
            } else {
                await api.post('/flashes/create', values);
                message.success('Flash creado exitosamente');
            }
            setModalVisible(false);
            fetchFlashes();
        } catch {
            message.error(editingFlash ? 'Error al actualizar el flash' : 'Error al crear el flash');
        }
    }

    const columns = [
        { 
            title: 'Título', 
            dataIndex: 'titulo', 
            key: 'titulo',
            sorter: (a, b) => a.titulo.localeCompare(b.titulo) 
        },
        { 
            title: 'Descripción Jalisco', 
            dataIndex: 'desc_jal', 
            key: 'desc_jal',
            sorter: (a, b) => a.desc_jal.localeCompare(b.desc_jal) 
        },
        {
            title: 'Descripción Nacional',
            dataIndex: 'desc_nac',
            key: 'desc_nac',
            sorter: (a, b) => a.desc_nac.localeCompare(b.desc_nac)
        },
        {
            title: 'Periocidad',
            dataIndex: 'periocidad',
            key: 'periocidad',
            sorter: (a, b) => a.periocidad.localeCompare(b.periocidad)
        },
        {
            title: "Fecha de publicación",
            dataIndex: "fecha_publicacion",
            key: "fecha_publicacion",
            render: (date) => new Date(date).toLocaleDateString('es-MX'),
            sorter: (a, b) => new Date(a.fecha_publicacion) - new Date(b.fecha_publicacion)
        },
        {
            title: 'Fuente',
            dataIndex: 'fuente',
            key: 'fuente',
            sorter: (a, b) => a.fuente.localeCompare(b.fuente)
        },
        {
            title: 'Link',
            dataIndex: 'link',
            key: 'link',
            sorter: (a, b) => a.link.localeCompare(b.link)
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    Editar
                    <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDelete(record)} danger />
                    Eliminar
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Administración de Flashes</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Nuevo Flash
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={flashes}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} posts`
                    }}      
                />
            </Card> 

            <Modal
                title={editingFlash ? 'Editar Flash' : 'Crear Flash'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={ () => form.submit()}
                okText={editingFlash ? 'Actualizar' : 'Crear'}
                cancelText="Cancelar"
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="titulo" label="Título" rules={[{ required: true, message: 'Por favor ingresa el título' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="desc_jal" label="Descripción Jalisco" rules={[{ required: true, message: 'Por favor ingresa la descripción para Jalisco' }]}>
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="desc_nac" label="Descripción Nacional" rules={[{ required: true, message: 'Por favor ingresa la descripción para Nacional' }]}>
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="periocidad" label="Periocidad" rules={[{ required: true, message: 'Por favor ingresa la periocidad' }]}>
                        <Select placeholder="Selecciona la periocidad" options={[
                            { value: 'diaria', label: 'Diaria'},
                            { value: 'mensual', label: 'Mensual'},
                            { value: 'Anual', label: 'Anual'},
                        ]}
                        />
                    </Form.Item>
                    <Form.Item name="fecha_publicacion" label="Fecha de Publicación" rules={[{ required: true, message: 'Por favor ingresa la fecha de publicación' }]}>
                        <Input type="date" />
                    </Form.Item>
                    <Form.Item name="fuente" label="Fuente" rules={[{ required: true, message: 'Por favor ingresa la fuente' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="link" label="Link" rules={[{ required: true, message: 'Por favor ingresa el link' }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );

}