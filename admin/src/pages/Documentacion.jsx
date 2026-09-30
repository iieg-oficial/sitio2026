import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import RichTextEditor from '@components/campos/RichTextEditor';
import { UploadAcervo } from '@components/UploadAcervo';
import { TemaSelector } from '@components/pageComponents/SubjectSelector';
import { TableSearch } from '@components/common/TableSearch';
import { useDebouncedSearch } from '@components/common/searchHooks';

const { Title } = Typography;
const { Option } = Select;

export default function Documentacion() {
    const [documentaciones, setDocumentaciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingDocumentacion, setEditingDocumentacion] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [tipo, setTipo] = useState([]);
    const [sistemasOptions, setSistemasOptions] = useState([]);
    const [selectedSistemas, setSelectedSistemas] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const watchAnyo = Form.useWatch('anyo', form);

    useEffect(() => {
        fetchSubjects();
        fetchTipo();
        fetchSistemas();
        fetchDocumentaciones('', 1, pagination.pageSize);
    }, []);

    const getDynamicFolder = () => {
        let folderPath = '/documentacion';

        if (watchAnyo) {
            folderPath += `/${watchAnyo}`;
        }

        return folderPath;
    };

    const fetchTipo = async () => {
        try {
            const response = await api.get('/documentacion/tipos');
            setTipo(response.data.tipos || []);
        } catch {
            message.error('Error al obtener los tipos');
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

    const fetchDocumentaciones = async (search = '', page = 1, pageSize = pagination.pageSize) => {
        setLoading(true);
        try {
            const response = await api.get('/documentacion', {
                params: {
                    ...(search ? { search } : {}),
                    page,
                    pageSize,
                    _t: new Date().getTime()
                }
            });
            setDocumentaciones(response.data.documentaciones || []);

            setPagination({
                current: page,
                pageSize: pageSize,
                total: response.data.total || 0
            });

        } catch (error) {
            console.error('Error al obtener documentaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const { searchText, setSearchText } = useDebouncedSearch((text) => {
        fetchDocumentaciones(text, 1, pagination.pageSize);
    });

    const handleTableChange = (newPagination) => {
        fetchDocumentaciones(searchText, newPagination.current, newPagination.pageSize);
    };

    const fetchSistemas = async () => {
        try {
            const response = await api.get('/sistemas');
            setSistemasOptions(response.data.sistemas || []);
        } catch {
            message.error('Error al cargar sistemas');
        }
    };

    const handleCreate = () => {
        setEditingDocumentacion(null);
        setSelectedSubjects([]);
        setSelectedSistemas([]);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingDocumentacion(record);
        // Pre-cargar los temas seleccionados desde el registro
        const ids = (record.temas ?? []).map((t) => Number(t.id || t));
        setSelectedSubjects(ids);

        const idsp = (record.sistemas ?? []).map((t) => t.id);
        setSelectedSistemas(idsp);

        form.setFieldsValue({
            ...record,
            // Evita enviar los objetos poblados dentro de los valores planos del form
            temas: undefined,
            sistemas: undefined
        });

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
                    fetchDocumentaciones(searchText, pagination.current, pagination.pageSize);
                } catch (error) {
                    console.error('Error al eliminar documentación:', error);
                    message.error('Error al eliminar documentación');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            const payload = { ...values, tema_ids: selectedSubjects, sistema_ids: selectedSistemas };

            if (editingDocumentacion) {
                await api.patch(`/documentacion/${editingDocumentacion.id}`, payload);
                message.success('Documentación actualizada exitosamente');
                await fetchDocumentaciones(searchText, pagination.current, pagination.pageSize);
            } else {
                await api.post('/documentacion/create', payload);
                message.success('Documentación creada exitosamente');
                setSearchText('');
                await fetchDocumentaciones('', 1, pagination.pageSize);
            }

            setModalVisible(false);

        } catch {
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
            render: (temas = []) => temas.map((t) => t.titulo).join(', '),
            sorter: (a, b) => a.temas.map((t) => t.titulo).join(', ').localeCompare(b.temas.map((t) => t.titulo).join(', '))
        },
        {
            title: 'sistema',
            dataIndex: 'sistemas',
            key: 'sistemas',
            render: (sistemas = []) => sistemas.map((t) => t.titulo).join(', '),
            sorter: (a, b) => a.sistemas.map((t) => t.titulo).join(', ').localeCompare(b.sistemas.map((t) => t.titulo).join(', '))
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
                <TableSearch
                    value={searchText}
                    onChange={setSearchText}
                    placeholder="Buscar por título..."
                    loading={loading}
                />
                <Table
                    columns={columns}
                    dataSource={documentaciones}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} documentacion`
                    }}
                    onChange={handleTableChange}
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
                    <Form.Item name="anyo"
                        label="Año"
                        rules={[{ required: false, message: 'Por favor ingrese el año' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="archivo"
                        label="Archivo"
                        rules={[{ required: false, message: 'Por favor ingrese el archivo' }]}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <UploadAcervo
                                bucket="portal"
                                folder={getDynamicFolder()}
                                label="Subir archivo"
                                onUploaded={(media) => {
                                    form.setFieldValue('archivo', media.url);
                                }}
                            />
                            <Form.Item name="archivo" noStyle>
                                <Input placeholder="Subir archivo" />
                            </Form.Item>
                            {form.getFieldValue('archivo') ? (
                                <a href={form.getFieldValue('archivo')} target="_blank" rel="noopener noreferrer">
                                    Ver archivo
                                </a>
                            ) : null}
                        </Space>
                    </Form.Item>
                    <Form.Item name="tipo" label="Tipo" rules={[{ required: false, message: 'Por favor ingresa el tipo ' }]}>
                        <Select
                            placeholder="Selecciona un tipo"
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            filterOption={(input, option) =>
                                (option?.label || '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={(tipo || []).map((value) => ({
                                key: value,
                                value: value,
                                label: value,
                            }))}
                        />
                    </Form.Item>
                    <TemaSelector
                        temas={subjects}
                        seleccionados={selectedSubjects}
                        onChange={(ids) => {
                            setSelectedSubjects(ids);
                        }}
                    />
                    <Form.Item label="Proyectos">
                        <Select
                            mode="multiple"
                            placeholder="Selecciona uno o más proyectos"
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            filterOption={(input, option) =>
                                (option?.label || '').toLowerCase().includes(input.toLowerCase())
                            }
                            value={selectedSistemas}
                            onChange={(ids) => setSelectedSistemas(ids)}
                            options={sistemasOptions.map((s) => ({
                                value: s.id,
                                label: s.titulo,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item name="claves"
                        label="Palabras clave"
                        rules={[{ required: true, message: 'Por favor ingrese las palabras clave' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="slug"
                        label="Url"
                        rules={[{ required: false, message: 'Por favor ingrese la url' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}