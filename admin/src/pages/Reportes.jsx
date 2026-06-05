import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import { TemaSelector } from '@components/pageComponents/SubjectSelector';
import { UploadAcervo } from '@components/UploadAcervo';
const { Title } = Typography;

export default function Reportes() {
    const [reportes, setReportes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingReporte, setEditingReporte] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [periocidad, setPeriocidad] = useState([]);
    const [meses, setMeses] = useState([]);

    useEffect(() => {
        fetchReportes();
        fetchSubjects();
        fetchPeriocidad();
        fetchMeses();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await api.get('/subject/tree');
            setSubjects(response.data);
        } catch {
            message.error('Error al cargar temas');
        }
    };

    const fetchReportes = async () => {
        setLoading(true);
        try {
            const response = await api.get('/reportes');
            setReportes(response.data.reportes);
        } catch {
            message.error('Error al cargar reportes');
        } finally {
            setLoading(false);
        }
    };

    const fetchPeriocidad = async () => {
        try {
            const response = await api.get('/reportes/periocidad');
            setPeriocidad(response.data.periocidad || {});
        } catch (error) {
            message.error('Error al cargar periocidad');
        }
    };

    const fetchMeses = async () => {
        try {
            const response = await api.get('/reportes/meses');
            setMeses(response.data.meses || {});
        } catch (error) {
            message.error('Error al cargar meses');
        }
    };

    const handleCreate = () => {
        setEditingReporte(null);
        setSelectedSubjects([]);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingReporte(record);
        const ids = (record.temas ?? []).map((t) => t.id);
        setSelectedSubjects(ids);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este reporte?',
            content: `Se eliminará el reporte: ${record.titulo}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/reportes/${record.id}`);
                    message.success('Reporte eliminado exitosamente');
                    fetchReportes();
                } catch {
                    message.error('Error al eliminar reporte');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            const payload = { ...values, tema_ids: selectedSubjects };
            if (editingReporte) {
                await api.put(`/reportes/${editingReporte.id}`, payload);
                message.success('Reporte actualizado exitosamente');
            } else {
                await api.post('/reportes/create', payload);
                message.success('Reporte creado exitosamente');
            }
            setModalVisible(false);
            fetchReportes();
        } catch {
            message.error(editingReporte ? 'Error al actualizar reporte' : 'Error al crear reporte');
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
                <Title level={2} style={{ margin: 0 }}>Administración de Reportes</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Nuevo Reporte
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={reportes}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} reportes`
                    }}
                />
            </Card>

            <Modal
                title={editingReporte ? 'Editar Reporte' : 'Nuevo Reporte'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                okText={editingReporte ? 'Actualizar' : 'Crear'}
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
                    <Form.Item
                        name="fecha"
                        label="Fecha de publicación"
                        rules={[{ required: true, message: 'Por favor seleccione la fecha' }]}
                    >
                        <Input type="date" />
                    </Form.Item>
                    <TemaSelector
                        temas={subjects}
                        seleccionados={selectedSubjects}
                        onChange={(ids) => {                                    
                            setSelectedSubjects(ids);
                        }}
                    />
                    <Form.Item name="periocidad" label="Periocidad" rules={[{ required: true, message: 'Por favor ingresa la periocidad' }]}>
                        <Select 
                            placeholder="Selecciona la periocidad"
                            alowClear
                            showSearch
                            optionFilterProp="label"
                            filterOption={(input, option) =>
                                (option?.label || '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={Object.entries(periocidad).map(([key, value]) => ({ 
                                key,
                                value, 
                                label: value 
                            }
                        ))}
                        />  
                    </Form.Item>
                     <Form.Item name="mes" label="Mes" rules={[{ required: true, message: 'Por favor ingresa el mes' }]}>
                        <Select 
                            placeholder="Selecciona el mes"
                            alowClear
                            showSearch
                            optionFilterProp="label"
                            filterOption={(input, option) =>
                                (option?.label || '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={Object.entries(meses).map(([key, value]) => ({ 
                                key,
                                value, 
                                label: value 
                            }
                        ))}
                        />  
                    </Form.Item>
                    <Form.Item name="anyo" label="Año" rules={[{ required: true, message: 'Por favor ingresa el año' }]}>
                        <Input />
                     </Form.Item>
                    <Form.Item
                        name="archivo"
                        label="Archivo"
                        rules={[{ required: true, message: 'Por favor ingrese el archivo' }]}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                             <UploadAcervo
                                bucket="portal"
                                folder="/reportes"
                                label="Subir archivo"
                                onUploaded={(media) => {
                                    form.setFieldValue('archivo', media.url);
                                }}
                            />
                            <Form.Item name="archivo" noStyle>
                                <Input placeholder="Subir archivo" />
                            </Form.Item>
                            {form.getFieldValue('archivo') ? (
                                <a href={form.getFieldValue('archivo')} target="_blank" rel="noopener noreferrer">Ver archivo</a>
                            ) : null}
                        </Space>
                    </Form.Item>
                    <Form.Item name="claves"
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