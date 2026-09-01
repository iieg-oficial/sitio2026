import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import { TemaSelector } from '@components/pageComponents/SubjectSelector';
import { UploadAcervo } from '@components/UploadAcervo';

const { Title } = Typography;
const { Option } = Select;

export default function Archivos() {
    const [archivos, setArchivos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();    
    const [modalVisible, setModalVisible] = useState(false);
    const [editingArchivo, setEditingArchivo] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);

    useEffect(() => {
        fetchArchivos();
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

    const fetchArchivos = async () => {
        setLoading(true);
        try {
            const response = await api.get('/archivos');
            setArchivos(response.data.archivos);
        } catch {
            message.error('Error al cargar archivos');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingArchivo(null);
        setSelectedSubjects([]);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingArchivo(record);
        // Pre-cargar los temas seleccionados desde el registro
        const ids = (record.temas ?? []).map((t) => t.id);
        setSelectedSubjects(ids);

        const normalizedRecord = {
            ...record,
            fecha: record.fecha ? new Date(record.fecha).toISOString().slice(0, 10) : undefined,
        };

        form.setFieldsValue(normalizedRecord);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este archivo?',
            content: `Se eliminará el archivo: ${record.titulo}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/archivos/${record.id}`);
                    message.success('Archivo eliminado exitosamente');
                    fetchArchivos();
                } catch {
                    message.error('Error al eliminar archivo');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            // Incluir los temas seleccionados (fuera del Form) en el payload
            const payload = { ...values, tema_ids: selectedSubjects };
            if (editingArchivo) {
                await api.patch(`/archivos/${editingArchivo.id}`, payload);
                message.success('Archivo actualizado exitosamente');
            } else {
                await api.post('/archivos/create', payload);
                message.success('Archivo creado exitosamente');
            }
            setModalVisible(false);
            fetchArchivos();
        } catch {
            message.error(editingArchivo ? 'Error al actualizar archivo' : 'Error al crear archivo');
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
            title: 'Tipo',
            dataIndex: 'tipo',
            key: 'tipo',
            sorter: (a, b) => a.tipo.localeCompare(b.tipo)
        },
        {
            title: 'Periocidad',
            dataIndex: 'periocidad',
            key: 'periocidad',
            sorter: (a, b) => a.periocidad.localeCompare(b.periocidad)
        },
        {
            title: 'Fecha',
            dataIndex: 'fecha',
            key: 'fecha',
            render: (date) => new Date(date).toLocaleDateString('es-MX'),
            sorter: (a, b) => new Date(a.fecha) - new Date(b.fecha)
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
                        <Title level={2} style={{ margin: 0 }}>Administración de Archivos</Title>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreate}
                        >
                            Nuevo Archivo
                        </Button>
                    </div>

                    <Card>
                        <Table
                            columns={columns}
                            dataSource={archivos}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Total ${total} archivos`
                            }}
                        />
                    </Card>

                    <Modal
                        title={editingArchivo ? 'Editar Archivo' : 'Nuevo Archivo'}
                        open={modalVisible}
                        onCancel={() => setModalVisible(false)}
                        onOk={() => form.submit()}
                        okText={editingArchivo ? 'Actualizar' : 'Crear'}
                        cancelText="Cancelar"
                    >
                        <Form form={form} layout="vertical" onFinish={handleSubmit}>
                            <Form.Item name="titulo" label="Titulo" rules={[{ required: true, message: 'Por favor ingrese el titulo' }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="tipo" label="Tipo" rules={[{ required: true, message: 'Por favor ingrese el tipo' }]}>
                                <Select>
                                    <Option key="institucional" value="institucional">Institucional</Option>
                                    <Option key="contabilidad" value="contabilidad">Contabilidad</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item name="periocidad" label="Periocidad" rules={[{ required: false, message: 'Por favor ingrese la periocidad' }]}>
                                <Select>
                                    <Option key="mensual" value="mensual">Mensual</Option>
                                    <Option key="bimestral" value="bimestral">Bimestral</Option>
                                    <Option key="trimestral" value="trimestral">Trimestral</Option>
                                    <Option key="semestral" value="semestral">Semestral</Option>
                                    <Option key="anual" value="anual">Anual</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item name="fecha" label="Fecha" rules={[{ required: false, message: 'Por favor ingrese la fecha' }]}>
                                <Input type="date" />
                            </Form.Item>
                            <TemaSelector
                                temas={subjects}
                                seleccionados={selectedSubjects}
                                onChange={(ids) => {                                    
                                    setSelectedSubjects(ids);
                                }}
                            />
                            <Form.Item name="archivo" label="Archivo" rules={[{ required: false, message: 'Por favor ingrese el archivo' }]}>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <UploadAcervo
                                        bucket="portal"
                                        folder="/archivos"
                                        label="Subir archivo"
                                        onUploaded={(media) => {
                                            form.setFieldValue('archivo', media.url);
                                        }}
                                    />
                                    <Form.Item name="archivo" noStyle>
                                        <Input placeholder="URL archivo" />
                                    </Form.Item>
                                    {form.getFieldValue('archivo') ? (
                                        <Image
                                            src={form.getFieldValue('archivo')}
                                            alt="Vista previa archivo"
                                            style={{ maxWidth: 260, borderRadius: 6 }}
                                        />
                                    ) : null}
                                </Space>
                            </Form.Item>
                        </Form>
                    </Modal>
                </div>
            );
        }