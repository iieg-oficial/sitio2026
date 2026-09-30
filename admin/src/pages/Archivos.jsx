import { useState, useCallback, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import { TemaSelector } from '@components/pageComponents/SubjectSelector';
import { UploadAcervo } from '@components/UploadAcervo';
import { TableSearch } from '@components/common/TableSearch';
import { useDebouncedSearch } from '@components/common/searchHooks';

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
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const watchTipo = Form.useWatch('tipo', form);
    const watchFecha = Form.useWatch('fecha', form);

    const getDynamicFolder = () => {
        let folderPath = '/archivos';

        if (watchTipo) {
            folderPath += `/${watchTipo}`;
        }

        if (watchFecha) {
            const dateParts = watchFecha.split('-');
            if (dateParts.length >= 2) {
                const year = dateParts[0];
                folderPath += `/${year}`;
            }
        }

        return folderPath;
    };

    const fetchSubjects = useCallback(async () => {
        try {
            const response = await api.get('/subject/tree');
            setSubjects(response.data || []);
        } catch {
            message.error('Error al cargar temas');
        }
    }, []);

    const fetchArchivos = useCallback(async (search = '', page, pageSize) => {
        setLoading(true);
        setPagination((prevPagination) => {
            const currentPage = page ?? prevPagination.current;
            const currentPageSize = pageSize ?? prevPagination.pageSize;

            api.get('/archivos', {
                params: {
                    ...(search ? { search } : {}),
                    page: currentPage,
                    pageSize: currentPageSize
                }
            }).then((response) => {
                setArchivos(response.data.archivos || []);
                setPagination((prev) => ({
                    ...prev,
                    current: currentPage,
                    pageSize: currentPageSize,
                    total: response.data.total || 0
                }));
            }).catch(() => {
                message.error('Error al cargar archivos');
            }).finally(() => {
                setLoading(false);
            });

            return prevPagination;
        });
    }, []);

    // Carga inicial de materias/temas y archivos
    useEffect(() => {
        let isMounted = true;

        const loadInitialData = async () => {
            if (isMounted) {
                await Promise.all([
                    fetchSubjects(),
                    fetchArchivos('', 1)
                ]);
            }
        };

        loadInitialData();

        return () => {
            isMounted = false;
        };
    }, [fetchSubjects, fetchArchivos]);

    // Re-sincronización nativa al enfocar ventana/pestaña
    useEffect(() => {
        const handleFocus = () => {
            fetchArchivos('');
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchArchivos]);

    const { searchText, setSearchText } = useDebouncedSearch((text) => {
        fetchArchivos(text, 1, pagination.pageSize);
    });

    const handleTableChange = (newPagination) => {
        fetchArchivos(searchText, newPagination.current, newPagination.pageSize);
    };

    const handleCreate = () => {
        setEditingArchivo(null);
        setSelectedSubjects([]);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingArchivo(record);

        const selectedIds = [...new Set(
            (record.temas ?? []).flatMap((tema) => {
                const ids = [];

                if (typeof tema === 'object' && tema !== null) {
                    if (tema.id !== undefined && tema.id !== null) {
                        ids.push(Number(tema.id));
                    }
                    if (tema.parent_id !== undefined && tema.parent_id !== null) {
                        ids.push(Number(tema.parent_id));
                    }
                } else if (tema !== undefined && tema !== null) {
                    ids.push(Number(tema));
                }

                return ids;
            })
        )].filter((id) => !Number.isNaN(id));

        setSelectedSubjects(selectedIds);

        const normalizedFecha = (() => {
            if (!record.fecha) return undefined;
            const value = typeof record.fecha === 'string' ? record.fecha : new Date(record.fecha).toISOString();
            return value.slice(0, 10);
        })();

        form.setFieldsValue({
            ...record,
            fecha: normalizedFecha,
        });

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
                    fetchArchivos(searchText, pagination.current, pagination.pageSize);
                } catch {
                    message.error('Error al eliminar archivo');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            const payload = { ...values, tema_ids: selectedSubjects };
            if (editingArchivo) {
                await api.patch(`/archivos/${editingArchivo.id}`, payload);
                message.success('Archivo actualizado exitosamente');
                fetchArchivos(searchText, pagination.current, pagination.pageSize);
            } else {
                await api.post('/archivos/create', payload);
                message.success('Archivo creado exitosamente');
                fetchArchivos(searchText, 1, pagination.pageSize);
            }
            setModalVisible(false);
        } catch {
            message.error(editingArchivo ? 'Error al actualizar archivo' : 'Error al crear archivo');
        }
    };

    const columns = [
        {
            title: 'Titulo',
            dataIndex: 'titulo',
            key: 'titulo',
            sorter: (a, b) => (a.titulo || '').localeCompare(b.titulo || '')
        },
        {
            title: 'Tipo',
            dataIndex: 'tipo',
            key: 'tipo',
            sorter: (a, b) => (a.tipo || '').localeCompare(b.tipo || '')
        },
        {
            title: 'Periocidad',
            dataIndex: 'periocidad',
            key: 'periocidad',
            sorter: (a, b) => (a.periocidad || '').localeCompare(b.periocidad || '')
        },
        {
            title: 'Fecha',
            dataIndex: 'fecha',
            key: 'fecha',
            render: (date) => (date ? new Date(date).toLocaleDateString('es-MX') : '-'),
            sorter: (a, b) => new Date(a.fecha || 0) - new Date(b.fecha || 0)
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
                <TableSearch
                    value={searchText}
                    onChange={setSearchText}
                    placeholder="Buscar por título..."
                    loading={loading}
                />
                <Table
                    columns={columns}
                    dataSource={archivos}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} archivos`
                    }}
                    onChange={handleTableChange}
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
                    <Form.Item name="periocidad" label="Periocidad" rules={[{ required: false }]}>
                        <Select>
                            <Option key="mensual" value="mensual">Mensual</Option>
                            <Option key="bimestral" value="bimestral">Bimestral</Option>
                            <Option key="trimestral" value="trimestral">Trimestral</Option>
                            <Option key="semestral" value="semestral">Semestral</Option>
                            <Option key="anual" value="anual">Anual</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="fecha" label="Fecha" rules={[{ required: false }]}>
                        <Input type="date" />
                    </Form.Item>
                    <TemaSelector
                        temas={subjects}
                        seleccionados={selectedSubjects}
                        onChange={(ids) => {
                            setSelectedSubjects(ids);
                        }}
                    />
                    <Form.Item name="archivo" label="Archivo" rules={[{ required: false }]}>
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