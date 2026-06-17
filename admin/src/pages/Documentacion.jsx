import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import RichTextEditor from '@components/campos/RichTextEditor';
import { UploadAcervo } from '@components/UploadAcervo';
import { TemaSelector } from '@components/pageComponents/SubjectSelector';

const { Title } = Typography;

export default function Documentacion() {
    const [documentaciones, setDocumentaciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingDocumentacion, setEditingDocumentacion] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);

    useEffect(() => {
        fetchDocumentaciones();
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await api.get('/subject/tree');
            setSubjects(response.data);
        } catch {
            message.error('Error al cargar temas');
        }
    };

    const fetchDocumentaciones = async () => {
        setLoading(true);
        try {
            const response = await api.get('/documentacion');
            setDocumentaciones(response.data.documentaciones);
        } catch (error) {
            console.error('Error al obtener documentaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {        
        setEditingDocumentacion(null);
        setSelectedSubjects([]);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingDocumentacion(record);
        // Pre-cargar los temas seleccionados desde el registro
        const ids = (record.temas ?? []).map((t) => t.id);
        setSelectedSubjects(ids);        
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
            const payload = { ...values, tema_ids: selectedSubjects };
            if (editingDocumentacion) {
                await api.put(`/documentacion/${editingDocumentacion.id}`, payload);
                message.success('Documentación actualizada exitosamente');
            } else {
                await api.post('/documentacion/create', payload);
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
            dataIndex: 'temas',
            key: 'temas',
            render: (temas) => temas.map((t) => t.titulo).join(', '),
            sorter: (a, b) => a.temas.map((t) => t.titulo).join(', ').localeCompare(b.temas.map((t) => t.titulo).join(', '))
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
                        <RichTextEditor />
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
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <UploadAcervo
                                bucket="portal"
                                folder="/metodologias"
                                label="Subir metodología"
                                onUploaded={(media) => {
                                    form.setFieldValue('metodologia', media.url);
                                }}
                            />
                            <Form.Item name="metodologia" noStyle>
                                <Input placeholder="Subir metodología" />
                            </Form.Item>
                            {form.getFieldValue('metodologia') ? (
                                <a href={form.getFieldValue('metodologia')} target="_blank" rel="noopener noreferrer">
                                    Ver metodología
                                </a>
                            ) : null}
                        </Space>
                    </Form.Item>
                    <Form.Item name="codigo"
                        label="archivo código"
                        rules={[{ required: false, message: 'Por favor ingrese el archivo' }]}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <UploadAcervo
                                bucket="portal"
                                folder="/codigos"
                                label="Subir código"
                                onUploaded={(media) => {
                                    form.setFieldValue('codigo', media.url);
                                }}
                            />
                            <Form.Item name="codigo" noStyle>
                                <Input placeholder="Subir código" />
                            </Form.Item>
                            {form.getFieldValue('codigo') ? (
                                <a href={form.getFieldValue('codigo')} target="_blank" rel="noopener noreferrer">
                                    Ver código
                                </a>
                            ) : null}
                        </Space>
                    </Form.Item>
                    <TemaSelector
                        temas={subjects}
                        seleccionados={selectedSubjects}
                        onChange={(ids) => {                                    
                        setSelectedSubjects(ids);
                        }}
                    />
                    
                </Form>
            </Modal>
        </div>
    );
}