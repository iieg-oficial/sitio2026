import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import { UploadAcervo } from '@components/UploadAcervo';
const { Title } = Typography;

export default function Cuadernillos() {
    const [cuadernillos, setCuadernillos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCuadernillo, setEditingCuadernillo] = useState(null);
    const [municipios, setMunicipios] = useState([]);
    
    useEffect(() => {
        fetchCuadernillos();
        fetchMunicipios();
    }, []);

    const fetchMunicipios = async () => {
        try {
            const response = await api.get('/cuadernillos/municipios');
            setMunicipios(response.data.municipios || {});
        } catch (error) {
            message.error('Error al obtener los municipios');
        }
    }

    const fetchCuadernillos = async () => {
        setLoading(true);
        try {
            const response = await api.get('/cuadernillos');
            setCuadernillos(response.data.cuadernillos);
        } catch (error) {
            message.error('Error al obtener los cuadernillos');
        } finally {
            setLoading(false);
        }
    };  

    const handleCreate = () => {
        setEditingCuadernillo(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingCuadernillo(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Estás seguro de eliminar este cuadernillo?',
            content: `Se eliminará el reporte: ${record.titulo}`,
            okText: 'Eliminar',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/cuadernillos/${record.id}`);
                    message.success('Cuadernillo eliminado');
                    fetchCuadernillos();
                } catch (error) {
                    message.error('Error al eliminar el cuadernillo');
                }
            },
        });
    }

    const handleSubmit = async (values) => {
        try {
            if (editingCuadernillo) {
                await api.patch(`/cuadernillos/${editingCuadernillo.id}`, values);
                message.success('Cuadernillo actualizado');
            } else {
                await api.post('/cuadernillos', values);
                message.success('Cuadernillo creado');
            }
            setModalVisible(false);
            fetchCuadernillos();
        } catch (error) {
            message.error('Error al guardar el cuadernillo');
        }
    };

    const columns = [
        { title: 'Título', dataIndex: 'titulo', key: 'titulo' },
        { title: 'Municipio', dataIndex: 'municipio', key: 'municipio' },
        {
            title: 'Acciones',
            key: 'acciones',
            render: (_, record) => (
                <Space>
                    <Button 
                        type="link" 
                        icon={<EditOutlined />} 
                        onClick={() => handleEdit(record)} >
                            Editar
                    </Button>
                    <Button 
                        type="link" 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDelete(record)} 
                        danger
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
                <Title level={2}>Cuadernillos</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Nuevo Cuadernillo
                </Button>
        </div>

        <Card>
            <Table
                dataSource={cuadernillos}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{ 
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} cuadernillos`
                }}
            />
        </Card>

        <Modal
            title={editingCuadernillo ? 'Editar Cuadernillo' : 'Nuevo Cuadernillo'}
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            onOk={() => form.submit()}
            okText={editingCuadernillo ? 'Actualizar' : 'Crear'}
            cancelText="Cancelar"
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item name="titulo" label="Título" rules={[{ required: true, message: 'Por favor ingresa el título' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="archivo" label="Archivo" rules={[{ required: true, message: 'Por favor sube el archivo' }]}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <UploadAcervo 
                            bucket="portal"
                            folder="/cuadernillos"
                            label="Subir Archivo"
                            onUploaded={(media) =>
                                form.setFieldsValue({ archivo: media.url })
                            }
                        />
                        <Form.Item name="archivo" noStyle>
                            <Input placeholder="URL del archivo" />
                        </Form.Item>
                        {form.getFieldValue('archivo') ? (
                            <a href={form.getFieldValue('archivo')} target="_blank" rel="noopener noreferrer">
                                Ver Archivo
                            </a>
                        ) : null}
                    </Space>
                </Form.Item>
                <Form.Item name="municipio" label="Municipio" rules={[{ required: true, message: 'Por favor selecciona el municipio' }]}>
                    <Select
                        placeholder="Selecciona un municipio"
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        filterOption={(input, option) =>
                            (option?.label || '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={Object.entries(municipios).map(([key, value]) => ({
                            key,
                            value,
                            label: value,
                        }))}
                    />
                </Form.Item>
                <Form.Item name="anyo" label="Año" rules={[{ required: true, message: 'Por favor ingresa el año' }]}>
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    </div>
    );
}