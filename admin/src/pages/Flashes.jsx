import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import { TemaSelector } from '@components/pageComponents/SubjectSelector';
import RichTextEditor from '@components/campos/RichTextEditor';
import { UploadAcervo } from '@components/UploadAcervo';
import { useDebouncedSearch, TableSearch } from '@components/common/TableSearch';

const { Title } = Typography;

export default function Flashes() {
    const [flashes, setFlashes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingFlash, setEditingFlash] = useState(null);
    const [subjects, setSubjects] = useState([]);  
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [periodo, setPeriodo] = useState([]);
    const [meses, setMeses] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    useEffect(() => {
        fetchFlashes();
        fetchSubjects();
        fetchPeriodo();
        fetchMeses();
    }, []);

    const fetchPeriodo = async () => {
        try{
            const response = await api.get('/flashes/periocidad');
            setPeriodo(response.data.periodo || {});            
        } catch (error) {
            message.error('Error al obtener los periocidad');
        }
    }

    const fetchSubjects = async () => {
        try {
            const response = await api.get('/subject/tree');
            setSubjects(response.data);
        } catch {
            message.error('Error al cargar temas');
        } 
    };

    const fetchFlashes = async (search = '', page = pagination.current, pageSize = pagination.pageSize) => {
        setLoading(true);
        try {
            const response = await api.get('/flashes', {
                params: {
                    ...(search ? { search } : {}),
                    page,
                    pageSize
                }
            });
            setFlashes(response.data.flashes);
            setPagination((prev) => ({
                ...prev,
                current: page,
                pageSize,
                total: response.data.total
            }));
        } catch {
            message.error('Error al cargar flashes');
        } finally {
            setLoading(false);
        }
    };

    const { searchText, setSearchText } = useDebouncedSearch((text) => {
        fetchFlashes(text, 1, pagination.pageSize);
    });

    const handleTableChange = (newPagination) => {
        fetchFlashes(searchText, newPagination.current, newPagination.pageSize);
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
        setEditingFlash(null);
        setSelectedSubjects([]);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingFlash(record);
        // Pre-cargar los temas seleccionados desde el registro
        const ids = (record.temas ?? []).map((t) => t.id);
        setSelectedSubjects(ids);
        const fechaFormateada = record.fecha_publicacion
        ? new Date(record.fecha_publicacion).toISOString().split('T')[0]
        : null;
        form.setFieldsValue({
            ...record,
            fecha_publicacion: fechaFormateada,
        });
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar?',
            content: `Se eliminará: ${record.titulo}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/flashes/${record.id}`);
                    message.success('eliminado exitosamente');
                    fetchFlashes(searchText, pagination.current, pagination.pageSize);
                } catch {
                    message.error('Error al eliminar');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            // TemaSelector vive fuera del Form, hay que agregar los IDs manualmente
            const payload = { ...values, tema_ids: selectedSubjects };
            if (editingFlash) {
                await api.patch(`/flashes/${editingFlash.id}`, payload);
                message.success('actualizado exitosamente');
            } else {
                await api.post('/flashes/create', payload);
                message.success('creado exitosamente');
            }
            setModalVisible(false);
            fetchFlashes(searchText, pagination.current, pagination.pageSize);
        } catch {
            message.error(editingFlash ? 'Error al actualizar' : 'Error al crear');
        }
    }

    useEffect(() => {
    
}, [periodo]);

    const columns = [
        { 
            title: 'Título', 
            dataIndex: 'titulo', 
            key: 'titulo',
            sorter: (a, b) => a.titulo.localeCompare(b.titulo) 
        },
        { 
            title: 'Descripción Jalisco', 
            dataIndex: 'desc_jal', 
            key: 'desc_jal',
            sorter: (a, b) => a.desc_jal.localeCompare(b.desc_jal),
            render: (text) => (
                <div
                className="tiptap-content"
                dangerouslySetInnerHTML={{ __html: text }}
                />
            ),
        },
        {
            title: 'periocidad',
            dataIndex: 'periocidad',
            key: 'periocidad',
            sorter: (a, b) => a.periocidad.localeCompare(b.periocidad),
            
        },
        {
            title: "Fecha de publicación",
            dataIndex: "fecha_publicacion",
            key: "fecha_publicacion",
            render: (date) => new Date(date).toLocaleDateString('es-MX'),
            sorter: (a, b) => new Date(a.fecha_publicacion) - new Date(b.fecha_publicacion)
        },
        {
            title: 'Link',
            dataIndex: 'link',
            key: 'link',
            sorter: (a, b) => a.link.localeCompare(b.link)
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    Editar
                    <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDelete(record)} danger />
                    Eliminar
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Datos exprés</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Nuevo
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
                    dataSource={flashes}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} datos`
                        }}
                    onChange={handleTableChange}    
                />
            </Card> 

            <Modal
                title={editingFlash ? 'Editar' : 'Nuevo'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={ () => form.submit()}
                okText={editingFlash ? 'Actualizar' : 'Crear'}
                cancelText="Cancelar"
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="titulo" label="Título" rules={[{ required: true, message: 'Por favor ingresa el título' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="desc_jal" label="Descripción Jalisco" rules={[{ required: true, message: 'Por favor ingresa la descripción para Jalisco' }]}>
                        <RichTextEditor />
                    </Form.Item>
                    <Form.Item name="desc_nac" label="Descripción Nacional" rules={[{ required: true, message: 'Por favor ingresa la descripción para Nacional' }]}>
                        <RichTextEditor />
                    </Form.Item>
                    <Form.Item name="periocidad" label="Periocidad" rules={[{ required: true, message: 'Por favor ingresa la periocidad' }]}>
                        <Select
                        placeholder="Selecciona un periodo"
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        filterOption={(input, option) =>
                            (option?.label || '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={Object.entries(periodo).map(([key, value]) => ({  
                            key,                          
                            value: value,
                            label: value,
                        }))}
                    />
                    </Form.Item>
                    <Form.Item name="fecha_publicacion" label="Fecha de Publicación" rules={[{ required: false, message: 'Por favor ingresa la fecha de publicación' }]}>
                        <Input type="date" />
                    </Form.Item>
                    <Form.Item name="mes" label="Mes" rules={[{ required: true, message: 'Por favor ingresa el mes' }]}>
                        <Select 
                            placeholder="Selecciona el mes"
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            filterOption={(input, option) =>
                                (option?.label || '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={Object.entries(meses).map(([key, value]) => ({ 
                                value: key,
                                label: value 
                            }))}
                        />  
                    </Form.Item>
                    <Form.Item name="anyo" label="Año" rules={[{ required: true, message: 'Por favor ingresa el año' }]}>
                        <Input />
                     </Form.Item>
                    <Form.Item name="fuente" label="Fuente" rules={[{ required: false, message: 'Por favor ingresa la fuente' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="link" label="Link" rules={[{ required: false, message: 'Por favor ingresa el link' }]}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <UploadAcervo
                                bucket="portal"
                                folder="/flashes"
                                label="Archivo"
                                onUploaded={(media) => {
                                    form.setFieldValue('link', media.url);
                                }}
                            />
                            <Form.Item name="link" noStyle>
                                <Input placeholder="Subir archivo" />
                            </Form.Item>
                            {form.getFieldValue('link') ? (
                                <a href={form.getFieldValue('link')} target="_blank" rel="noopener noreferrer">
                                    Ver archivo
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