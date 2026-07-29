import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import RichTextEditor from '@components/campos/RichTextEditor';
import { UploadAcervo } from '@components/UploadAcervo';

const { Title } = Typography;

export default function Instituciones() {
    const [instituciones, setInstituciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingInstitucion, setEditingInstitucion] = useState(null);

    useEffect(() => {
        fetchInstituciones();
    }, []);

    const fetchInstituciones = async () => {
        setLoading(true);
        try {
            const response = await api.get('/instituciones');
            setInstituciones(response.data.instituciones);
        } catch {
            message.error('Error al cargar instituciones');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingInstitucion(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingInstitucion(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar esta institución?',
            content: `Se eliminará la institución: ${record.nombre}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/instituciones/${record.id}`);
                    message.success('Institución eliminada exitosamente');
                    fetchInstituciones();
                } catch {
                    message.error('Error al eliminar institución');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingInstitucion) {
                await api.patch(`/instituciones/${editingInstitucion.id}`, values);
                message.success('Institución actualizada exitosamente');
            } else {
                await api.post('/instituciones/create', values);
                message.success('Institución creada exitosamente');
            }
            setModalVisible(false);
            fetchInstituciones();
        } catch {
            message.error(editingInstitucion ? 'Error al actualizar institución' : 'Error al crear institución');
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
            title: 'Logo',
            dataIndex: 'logo',
            key: 'logo',
            render: (logo) => logo ? <Image src={logo} alt="Logo" style={{ maxWidth: 100 }} /> : 'Sin logo'
        },
        {
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => a.id - b.id
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
                <Title level={2} style={{ margin: 0 }}>Administración de Instituciones</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Nueva Institución
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={instituciones}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} instituciones`
                    }}
                />
            </Card>

            <Modal
                title={editingInstitucion ? 'Editar Institución' : 'Nueva Institución'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                okText={editingInstitucion ? 'Actualizar' : 'Crear'}
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
                        label="Descripción"
                        name="descripcion"
                        rules={[{ required: true, message: 'Por favor ingrese la descripción' }]}
                    >
                        <RichTextEditor />
                    </Form.Item>
                    <Form.Item
                        label="Logo"
                        name="logo"
                        rules={[{ required: true, message: 'Por favor ingrese el logo' }]}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <UploadAcervo
                                bucket="portal"
                                folder="/instituciones"
                                apiKey={import.meta.env.VITE_acervo_keyApi} 
                                label="Subir logo"
                                onUploaded={(media) => {
                                    form.setFieldValue('logo', media.url);
                                }}
                            />
                            <Input placeholder="URL del logo" />
                            {form.getFieldValue('logo') && (
                                 <Image
                                    src={form.getFieldValue('logo')}
                                    alt="Vista previa del logo"
                                    style={{ maxWidth: 200, marginTop: 10 }}
                                />
                            )}
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}