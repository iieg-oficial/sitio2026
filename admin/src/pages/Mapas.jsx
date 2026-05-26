import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, DatePicker, Image, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import RichTextEditor from '@components/campos/RichTextEditor';
import { UploadAcervo } from '@components/UploadAcervo';

const { Title } = Typography;

export default function Mapas() {
    const [mapas, setMapas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingMapa, setEditingMapa] = useState(null);
    const [tipoMapa, setTipoMapa] = useState([]);

    useEffect(() => {
        fetchMapas();
        fetchTipoMapa();
    }, []);

    const fetchMapas = async () => {
        setLoading(true);
        try {
            const response = await api.get('/mapas');
            setMapas(response.data.mapas);
        } catch {
            message.error('Error al cargar mapas');
        } finally {
            setLoading(false);
        }
    };

    const fetchTipoMapa = async () => {
        try {
            const response = await api.get('/mapas/tipos');
            setTipoMapa(response.data.tipos);
        } catch {
            message.error('Error al cargar tipos de mapa');
        }finally {
            setLoading(false);
        }
    }

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
                    await api.delete(`/mapas/${record.id}`);
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
                await api.put(`/mapas/${editingMapa.id}`, values);
                message.success('Mapa actualizado exitosamente');
            } else {
                await api.post('/mapas/create', values);
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
            title: 'Tipo',
            dataIndex: 'tipo',
            key: 'tipo',
            render: (text) => text ? <span>{text}</span> : <span style={{ fontStyle: 'italic', color: '#888' }}>Sin tipo</span>
        },
        {
            title: 'Imagen',
            dataIndex: 'imagen',
            key: 'imagen',
            render: (url) => url ? <Image src={url} alt="Mapa" style={{ maxWidth: 100 }} /> : 'Sin imagen'
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />Editar
                    <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDelete(record)} danger />Eliminar
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
                    <Form.Item name="tipo" label="Tipo de Mapa" rules={[{ required: false, message: 'Por favor selecciona el tipo de mapa' }]}>
                        <Select 
                        placeholder="Selecciona el tipo de mapa" 
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        filterOption={(input, option) =>
                            (option?.label || '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={Object.entries(tipoMapa).map(([key, value]) => ({ 
                            key,
                            value,
                            label: value, 
                        }))} />
                    </Form.Item>
                    <Form.Item
                        name="autor"
                        label="Autor"
                        rules={[{ required: false, message: 'Por favor selecciona el autor' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="anyo"
                        label="Año"
                        rules={[{ required: false, message: 'Por favor ingresa el año' }]}
                    >
                        <Input type="number" min={0} />
                    </Form.Item>
                    <Form.Item
                        name="area"
                        label="Área"
                        rules={[{ required: false, message: 'Por favor ingresa el área' }]}
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
                        <RichTextEditor />
                    </Form.Item>
                    <Form.Item 
                        name="ubicacion" 
                        label="Ubicación"
                        rules={[{ required: true, message: 'Por favor ingresa la ubicación' }]}
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
                        name="informacion"
                        label="Información"
                        rules={[{ required: false, message: 'Por favor ingresa la información' }]}
                    >
                        <RichTextEditor />
                     </Form.Item>
                    <Form.Item
                        name="imagen"
                        label="Imagen"
                        rules={[{ required: false, message: 'Por favor selecciona la imagen' }]}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <UploadAcervo
                                bucket="portal"
                                folder="/mapas"
                                label="Subir imagen"
                                onUploaded={(media) => {
                                    form.setFieldValue('imagen', media.url);
                                }}
                            />
                            <Form.Item name="imagen" noStyle>
                                <Input placeholder="URL de la imagen" />
                            </Form.Item>
                            {form.getFieldValue('imagen') ? (
                                <Image src={form.getFieldValue('imagen')} alt="Vista previa" style={{ maxWidth: 260, borderRadius: 6 }} />
                            ) : null}
                        </Space>
                    </Form.Item>
                    <Form.Item
                        name="archivo"
                        label="Archivo"
                        rules={[{ required: false, message: 'Por favor selecciona el archivo' }]}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <UploadAcervo
                                bucket="portal"
                                folder="/mapas"
                                label="Subir archivo"
                                onUploaded={(media) => {
                                    form.setFieldValue('archivo', media.url);
                                }}
                            />
                            <Form.Item name="archivo" noStyle>
                                <Input placeholder="Subir archivo" />
                            </Form.Item>
                            {form.getFieldValue('archivo') ? (
                                <a href={form.getFieldValue('archivo')} target="_blank" rel="noopener noreferrer">
                                    Ver archivo
                                </a>
                            ) : null}
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
  