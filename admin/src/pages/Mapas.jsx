import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';

const { Title } = Typography;

export default function Mapas() {
    const [mapas, setMapas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingMapa, setEditingMapa] = useState(null);

    useEffect(() => {
        fetchMapas();
    }, []);

    const fetchMapas = async () => {
        setLoading(true);
        try {
            const response = await api.get('/mapa');
            setMapas(response.data);
        } catch {
            message.error('Error al cargar mapas');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingMapa(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingMapa(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este mapa?',
            content: `Se eliminará el mapa: ${record.titulo}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/mapa/${record.id}`);
                    message.success('Mapa eliminado exitosamente');
                    fetchMapas();
                } catch (error) {
                    message.error('Error al eliminar el mapa');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingMapa) {
                await api.put(`/mapa/${editingMapa.id}`, values);
                message.success('Mapa actualizado exitosamente');
            } else {
                await api.post('/mapa', values);
                message.success('Mapa creado exitosamente');
            }
            setModalVisible(false);
            fetchMapas();
        } catch (error) {
            message.error('Error al guardar el mapa');
        }
    };

    const columns = [
        { 
            title: 'Título', 
            dataIndex: 'titulo', 
            key: 'titulo',
            sorter: (a, b) => a.titulo.localeCompare(b.titulo)
        },
        { 
            title: 'Año', 
            dataIndex: 'anyo', 
            key: 'anyo',
            sorter: (a, b) => a.anyo - b.anyo
        },
        {
            title: 'Información',
            dataIndex: 'informacion',
            key: 'informacion',
            render: (text) => text ? <span>{text.length > 100 ? `${text.substring(0, 100)}...` : text}</span> : <span style={{ fontStyle: 'italic', color: '#888' }}>Sin información</span>
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />Editar
                    <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record)} danger />Eliminar
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }} >
                <Title level={2}>Mapas</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Nuevo Mapa
                </Button>
            </div>
            <Card>
                <Table columns={columns} dataSource={mapas} loading={loading} rowKey="id" />
            </Card>

            <Modal
                title={editingMapa ? 'Editar Mapa' : 'Nuevo Mapa'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                okText={editingMapa ? 'Actualizar' : 'Crear'}
                cancelText="Cancelar"
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item 
                        name="titulo" 
                        label="Título" 
                        rules={[{ required: true, message: 'Por favor ingresa el título' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="anio"
                        label="Año"
                        rules={[{ required: false, message: 'Por favor selecciona el año' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="imagen"
                        label="Imagen"
                        rules={[{ required: false, message: 'Por favor selecciona la imagen' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="archivo"
                        label="Archivo"
                        rules={[{ required: false, message: 'Por favor selecciona el archivo' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="medida"
                        label="Medidas"
                        rules={[{ required: false, message: 'Por favor selecciona las medidas' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="escala"
                        label="Escala"
                        rules={[{ required: false, message: 'Por favor selecciona la escala' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="edicion"
                        label="Edición"
                        rules={[{ required: false, message: 'Por favor selecciona la edición' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="editor"
                        label="Editor"
                        rules={[{ required: false, message: 'Por favor selecciona el editor' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="sitio_web"
                        label="Sitio Web"
                        rules={[{ required: false, message: 'Por favor selecciona el sitio web' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item 
                        name="ubicacion" 
                        label="Ubicación"
                        rules={[{ required: true, message: 'Por favor ingresa la ubicación' }]}
                        >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item 
                        name="informacion" 
                        label="Información"
                        rules={[{ required: true, message: 'Por favor ingresa la información' }]}
                        >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
  