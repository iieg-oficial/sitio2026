import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import RichTextEditor from '@components/campos/RichTextEditor';

const { Title } = Typography;

export default function Perfiles() {
    const [perfiles, setPerfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPerfil, setEditingPerfil] = useState(null);

    useEffect(() => {
        fetchPerfiles();
    }, []);

    const fetchPerfiles = async () => {
        setLoading(true);
        try {
            const response = await api.get('/perfiles');
            setPerfiles(response.data.perfiles);
        } catch (error) {
            console.error('Error al obtener perfiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingPerfil(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingPerfil(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este perfil?',
            content: `Se eliminará el perfil: ${record.nombre}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/perfiles/${record.id}`);
                    message.success('Perfil eliminado exitosamente');
                    fetchPerfiles();
                } catch (error) {
                    console.error('Error al eliminar perfil:', error);
                    message.error('Error al eliminar perfil');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingPerfil) {
                await api.put(`/perfiles/${editingPerfil.id}`, values);
                message.success('Perfil actualizado exitosamente');
            } else {
                await api.post('/perfiles/create', values);
                message.success('Perfil creado exitosamente');
            }
            setModalVisible(false);
            fetchPerfiles();
        } catch (error) {
            message.error(editingPerfil ? 'Error al actualizar perfil' : 'Error al crear perfil');
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
            title: 'Área',
            dataIndex: 'area',
            key: 'area',
            sorter: (a, b) => a.area.localeCompare(b.area)
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
                <Title level={2} style={{ margin: 0 }}>Administración de Perfiles</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Nuevo Perfil
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={perfiles}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} perfiles`
                    }}
                />
            </Card>

            <Modal
                title={editingPerfil ? 'Editar Perfil' : 'Nuevo Perfil'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                okText={editingPerfil ? 'Actualizar' : 'Crear'}
                cancelText="Cancelar"
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        name="nombre"
                        label="Nombre"
                        rules={[{ required: true, message: 'Por favor ingrese el nombre del perfil' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="descripcion"
                        label="Descripción"
                        rules={[{ required: true, message: 'Por favor ingrese la descripción del perfil' }]}
                    >
                        <RichTextEditor />
                    </Form.Item>
                    <Form.Item
                        name="area"
                        label="Área"
                        rules={[{ required: true, message: 'Por favor ingrese el área del perfil' }]}
                    >
                        <Select placeholder="Seleccione el área" options={[
                            { value: 'desarrollo', label: 'Desarrollador' },
                            { value: 'analisis', label: 'Análisis estadistico' },
                            { value: 'geoespacial', label: 'Análisis geoespacial' },
                            { value: 'grafico', label: 'Diseño gráfico' },
                            { value: 'juridico', label: 'Apoyo jurídico' },
                            { value: 'administracion', label: 'Apoyo administrativo' },
                        ]} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
