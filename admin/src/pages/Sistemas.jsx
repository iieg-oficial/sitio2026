import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';

const { Title } = Typography;
const { Option } = Select;

export default function Sistemas() {
    const [sistemas, setSistemas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSistema, setEditingSistema] = useState(null);

    useEffect(() => {
        fetchSistemas();
    }, []);

    const fetchSistemas = async () => {
        setLoading(true);
        try {
            const response = await api.get('/sistemas');
            setSistemas(response.data.sistemas);
        } catch {
            message.error('Error al cargar sistemas');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingSistema(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingSistema(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este sistema?',
            content: `Se eliminará el sistema: ${record.titulo}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/sistemas/${record.id}`);
                    message.success('Sistema eliminado exitosamente');
                    fetchSistemas();
                } catch {
                    message.error('Error al eliminar sistema');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingSistema) {
                await api.put(`/sistemas/${editingSistema.id}`, values);
                message.success('Sistema actualizado exitosamente');
            } else {
                await api.post('/sistemas/create', values);
                message.success('Sistema creado exitosamente');
            }
            setModalVisible(false);
            fetchSistemas();
        } catch {
            message.error('Error al guardar sistema');
        }
    };
        
    const columns = [
        {
            title: 'Título',
            dataIndex: 'titulo',
            key: 'titulo',
            sorter: (a, b) => a.titulo.localeCompare(b.titulo),            
        },
        {
            title: 'Link',
            dataIndex: 'link',
            key: 'link',
        },
        {
            title: 'Tipo',
            dataIndex: 'tipo',
            key: 'tipo',
            sorter: (a, b) => a.tipo.localeCompare(b.tipo),
        },
        {
            title: 'Acciones',
            key: 'acciones',
            render: (_, record) => (
                <Space size="middle">
                    <Button 
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Editar
                    </Button>
                    <Button 
                        type="link"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    >
                        Eliminar
                    </Button>
                </Space>
            ),
        },
    ];

    return (
       <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Sistemas</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Crear Sistema
                </Button>
            </div>
        <Card>
            <Table 
            columns={columns} 
            dataSource={sistemas} 
            loading={loading} 
            rowKey="id"
            pagination={{ 
                pageSize: 10, 
                showSizeChanger: true, 
                showTotal: (total) => `Total ${total} sistemas` }}/>
        </Card>
        <Modal
            title={editingSistema ? 'Editar Sistema' : 'Crear Sistema'}
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            onOk={form.submit}
            okText={editingSistema ? 'Actualizar' : 'Crear'}
            cancelText="Cancelar"
        >
            <Form form={form} onFinish={handleSubmit} layout="vertical">
                <Form.Item name="titulo" label="Título" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="descripcion" label="Descripción" rules={[{ required: true }]}>
                    <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item name="link" label="Link" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="tipo" label="Tipo" rules={[{ required: true }]}>
                    <Select>
                        <Option value="plataforma">Plataforma</Option>
                        <Option value="datos-recientes">Datos recientes</Option>
                        <Option value="estadistica">Estadística</Option>
                        <Option value="otro">Otro</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="imagen" label="Imagen" rules={[{ required: false }]}>
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
       </div>
    );
}
            