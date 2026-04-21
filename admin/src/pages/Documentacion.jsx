import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';

const { Title } = Typography;

export default function Documentacion() {
    const [documentaciones, setDocumentaciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingDocumentacion, setEditingDocumentacion] = useState(null);
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        fetchDocumentaciones();
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await api.get('/subject');
            setSubjects(response.data);
        } catch (error) {
            console.error('Error al obtener subjects:', error);
        }
    };

    const fetchDocumentaciones = async () => {
        setLoading(true);
        try {
            const response = await api.get('/documentacion');
            setDocumentaciones(response.data);
        } catch (error) {
            console.error('Error al obtener documentaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingDocumentacion(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingDocumentacion(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar esta documentación?',
            content: `Se eliminará la documentación: ${record.titulo}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/documentacion/${record.id}`);
                    message.success('Documentación eliminada exitosamente');
                    fetchDocumentaciones();
                } catch (error) {
                    console.error('Error al eliminar documentación:', error);
                    message.error('Error al eliminar documentación');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingDocumentacion) {
                await api.put(`/documentacion/${editingDocumentacion.id}`, values);
                message.success('Documentación actualizada exitosamente');
            } else {
                await api.post('/documentacion/create', values);
                message.success('Documentación creada exitosamente');
            }
            setModalVisible(false);
            fetchDocumentaciones();
        } catch (error) {            
            message.error(editingDocumentacion ? 'Error al actualizar documentación' : 'Error al crear documentación');
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
            title: 'Tema',
            dataIndex: 'subject_id',
            key: 'subject_id',
            render: (subject_id) => subjects.find((s) => s.id === subject_id)?.titulo,
            sorter: (a, b) => a.subject.titulo.localeCompare(b.subject.titulo)
        },
        {
            title: 'Palabras clave',
            dataIndex: 'claves',
            key: 'claves',
            sorter: (a, b) => a.claves.localeCompare(b.claves)
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
                <Title level={2} style={{ margin: 0 }}>Administración de Documentación</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Nueva Documentación
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={documentaciones}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} documentaciones`
                    }}
                />
            </Card>

            <Modal
                title={editingDocumentacion ? 'Editar Documentación' : 'Nueva Documentación'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                okText={editingDocumentacion ? 'Actualizar' : 'Crear'}
                cancelText="Cancelar"
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        name="titulo"
                        label="Titulo"
                        rules={[{ required: true, message: 'Por favor ingrese el titulo' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="descripcion"
                        label="Descripción"
                        rules={[{ required: true, message: 'Por favor ingrese la descripción' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item name="claves"
                        label="Palabras clave"
                        rules={[{ required: true, message: 'Por favor ingrese las palabras clave' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="metodologia"
                        label="archivo metodología"
                        rules={[{ required: false, message: 'Por favor ingrese la metodología' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="codigo"
                        label="archivo código"
                        rules={[{ required: false, message: 'Por favor ingrese el archivo' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="subject_id"
                        label="Tema"
                        rules={[{ required: true, message: 'Por favor seleccione un tema' }]}
                    >
                        <Select
                            placeholder="Selecciona un tema"
                            options={subjects.map((s) => ({
                                value: s.id,
                                label: s.titulo
                            }))}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}