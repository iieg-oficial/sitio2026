import { useState, useEffect, useCallback } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import { TemaSelector } from '@components/pageComponents/SubjectSelector';
import RichTextEditor from '@components/campos/RichTextEditor';
import { TableSearch } from '@components/common/TableSearch';
import { useSearchFilter } from '@components/common/searchHooks';

const { Title } = Typography;

export default function Preguntas() {
    const [form] = Form.useForm();
    const [preguntas, setPreguntas] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingPregunta, setEditingPregunta] = useState(null);
    const [loading, setLoading] = useState(false);
    const { searchText, setSearchText, filteredData } = useSearchFilter(preguntas, ['pregunta']);

    const fetchSubjects = async () => {
        try {
            const response = await api.get('/subject/tree');
            setSubjects(response.data);
        } catch {
            message.error('Error al cargar temas');
        }
    };

    const fetchPreguntas = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/preguntas', {
                params: { _t: new Date().getTime() }
            });
            const data = Array.isArray(response.data?.preguntas) ? response.data.preguntas : [];
            const sortedData = [...data].sort((a, b) => (b.id || 0) - (a.id || 0));
            setPreguntas(sortedData);
        } catch {
            message.error('Error al cargar preguntas');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPreguntas();
        fetchSubjects();

        const handleFocus = () => {
            fetchPreguntas();
        };
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchPreguntas]);

    const handleCreate = () => {
        setEditingPregunta(null);
        setSelectedSubjects([]);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingPregunta(record);
        const ids = (record.temas ?? []).map((t) => Number(t.id || t));
        setSelectedSubjects(ids);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar esta pregunta?',
            content: `Se eliminará la pregunta: ${record.pregunta || ''}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/preguntas/${record.id}`);
                    message.success('Pregunta eliminada exitosamente');
                    await fetchPreguntas();
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
                await api.patch(`/preguntas/${editingPregunta.id}`, payload);
                message.success('Pregunta actualizada exitosamente');
            } else {
                await api.post('/preguntas/create', payload);
                message.success('Pregunta creada exitosamente');
            }
            setIsModalVisible(false);
            await fetchPreguntas();
        } catch {
            message.error(editingPregunta ? 'Error al actualizar pregunta' : 'Error al crear pregunta');
        }
    };

    const columns = [
        {
            title: 'Pregunta',
            dataIndex: 'pregunta',
            key: 'pregunta',
            sorter: (a, b) => (a.pregunta || '').localeCompare(b.pregunta || ''),
            render: (text) => (
                <div
                    className="tiptap-content"
                    dangerouslySetInnerHTML={{ __html: text || '' }}
                />
            ),
        },
        {
            title: 'Respuesta',
            dataIndex: 'respuesta',
            key: 'respuesta',
            sorter: (a, b) => (a.respuesta || '').localeCompare(b.respuesta || ''),
            render: (text) => (
                <div
                    className="tiptap-content"
                    dangerouslySetInnerHTML={{ __html: text || '' }}
                />
            ),
        },
        {
            title: 'Tema',
            dataIndex: 'temas',
            key: 'temas',
            render: (temas) => (Array.isArray(temas) ? temas.map((t) => t.titulo).join(', ') : ''),
            sorter: (a, b) => {
                const temaA = Array.isArray(a.temas) ? a.temas.map((t) => t.titulo).join(', ') : '';
                const temaB = Array.isArray(b.temas) ? b.temas.map((t) => t.titulo).join(', ') : '';
                return temaA.localeCompare(temaB);
            }
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
                <TableSearch
                    value={searchText}
                    onChange={setSearchText}
                    placeholder="Buscar por título..."
                    loading={loading}
                />
                <Table
                    columns={columns}
                    dataSource={filteredData}
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
                        <RichTextEditor />
                    </Form.Item>
                    <TemaSelector
                        temas={subjects}
                        seleccionados={selectedSubjects}
                        onChange={(ids) => {                                    
                            setSelectedSubjects(ids);
                        }}
                    />
                    <Form.Item 
                        name="claves"
                        label="Palabras clave"
                        rules={[{ required: false, message: 'Por favor ingrese las palabras clave' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}