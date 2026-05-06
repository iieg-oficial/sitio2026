import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import { TemaSelector } from '@components/pageComponents/SubjectSelector';

const { Title } = Typography;

export default function Preguntas() {
    const [form] = Form.useForm();
    const [preguntas, setPreguntas] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingPregunta, setEditingPregunta] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPreguntas();
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

    const fetchPreguntas = async () => {
        setLoading(true);
        try {
            const response = await api.get('/preguntas');
            setPreguntas(response.data.preguntas);
        } catch {
            message.error('Error al cargar preguntas');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingPregunta(null);
        setSelectedSubjects([]);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingPregunta(record);
        const ids = record.temas.map((t) => t.id);
        setSelectedSubjects(ids);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar esta pregunta?',
            content: `Se eliminará la pregunta: ${record.pregunta}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/preguntas/${record.id}`);
                    message.success('Pregunta eliminada exitosamente');
                    fetchPreguntas();
                } catch {
                    message.error('Error al eliminar pregunta');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            const payload = {
                ...values,
                tema_ids: selectedSubjects
            };
            if (editingPregunta) {
                await api.put(`/preguntas/${editingPregunta.id}`, payload);
                message.success('Pregunta actualizada exitosamente');
            } else {
                await api.post('/preguntas/create', payload);
                message.success('Pregunta creada exitosamente');
            }
            setIsModalVisible(false);
            fetchPreguntas();
        } catch {
            message.error(editingPregunta ? 'Error al actualizar pregunta' : 'Error al crear pregunta');
        }
    };

    const columns = [
        {
            title: 'Pregunta',
            dataIndex: 'pregunta',
            key: 'pregunta',
            sorter: (a, b) => a.pregunta.localeCompare(b.pregunta)
        },
        {
            title: 'Respuesta',
            dataIndex: 'respuesta',
            key: 'respuesta',
            sorter: (a, b) => a.respuesta.localeCompare(b.respuesta)
        },
        {
            title: 'Tema',
            dataIndex: 'temas',
            key: 'temas',
            render: (temas) => temas.map((t) => t.titulo).join(', '),
            sorter: (a, b) => a.temas.map((t) => t.titulo).join(', ').localeCompare(b.temas.map((t) => t.titulo).join(', '))
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
                <Title level={2} style={{ margin: 0 }}>Administración de Preguntas</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Nueva Pregunta
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={preguntas}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} preguntas`
                    }}
                />
            </Card>

            <Modal
                title={editingPregunta ? 'Editar Pregunta' : 'Nueva Pregunta'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
                okText={editingPregunta ? 'Actualizar' : 'Crear'}
                cancelText="Cancelar"
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item
                        name="pregunta"
                        label="Pregunta"
                        rules={[{ required: true, message: 'Por favor ingrese la pregunta' }]}
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item
                        name="respuesta"
                        label="Respuesta"
                        rules={[{ required: true, message: 'Por favor ingrese la respuesta' }]}
                    >
                        <Input.TextArea rows={3} />
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
    