import { useState, useEffect, useCallback } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Image, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import RichTextEditor from '@components/campos/RichTextEditor';
import { UploadAcervo } from '@components/UploadAcervo';
import { TableSearch } from '@components/common/TableSearch';
import { useDebouncedSearch } from '@components/common/searchHooks';

const { Title } = Typography;

export default function Mapas() {
    const [mapas, setMapas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingMapa, setEditingMapa] = useState(null);
    const [tipoMapa, setTipoMapa] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    // Reactividad para campos de media
    const imagenUrl = Form.useWatch('imagen', form);
    const archivoUrl = Form.useWatch('archivo', form);

    const fetchMapas = useCallback(async (search = '', page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await api.get('/mapas', {
                params: {
                    ...(search ? { search } : {}),
                    page,
                    pageSize,
                    _t: new Date().getTime()
                }
            });
            
            const rawData = Array.isArray(response.data?.mapas) ? response.data.mapas : [];
            const sortedMapas = [...rawData].sort((a, b) => (b.id || 0) - (a.id || 0));

            setMapas(sortedMapas);
            setPagination({
                current: page,
                pageSize,
                total: response.data?.total || sortedMapas.length
            });
        } catch {
            message.error('Error al cargar mapas');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTipoMapa = useCallback(async () => {
        try {
            const response = await api.get('/mapas/tipos', {
                params: { _t: new Date().getTime() }
            });
            setTipoMapa(response.data.tipos || []);
        } catch {
            message.error('Error al cargar tipos de mapa');
        }
    }, []);

    useEffect(() => {
        fetchMapas('', pagination.current, pagination.pageSize);
        fetchTipoMapa();

        const handleFocus = () => {
            fetchMapas('', pagination.current, pagination.pageSize);
        };
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchMapas]);

    const { searchText, setSearchText } = useDebouncedSearch((text) => {
        fetchMapas(text, 1, pagination.pageSize);
    });

    const handleTableChange = (newPagination) => {
        fetchMapas(searchText, newPagination.current, newPagination.pageSize);
    };

    const handleCreate = () => {
        setEditingMapa(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingMapa(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este mapa?',
            content: `Se eliminará el mapa: ${record.titulo}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/mapas/${record.id}`);
                    message.success('Mapa eliminado exitosamente');
                    await fetchMapas(searchText, pagination.current, pagination.pageSize);
                } catch {
                    message.error('Error al eliminar el mapa');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingMapa) {
                await api.patch(`/mapas/${editingMapa.id}`, values);
                message.success('Mapa actualizado exitosamente');
            } else {
                await api.post('/mapas/create', values);
                message.success('Mapa creado exitosamente');
            }
            setModalVisible(false);
            await fetchMapas(searchText, 1, pagination.pageSize);
        } catch {
            message.error('Error al guardar el mapa');
        }
    };

    const columns = [
        { 
            title: 'Título', 
            dataIndex: 'titulo', 
            key: 'titulo',
            sorter: (a, b) => (a.titulo || '').localeCompare(b.titulo || '')
        },
        { 
            title: 'Año', 
            dataIndex: 'anyo', 
            key: 'anyo',
            sorter: (a, b) => (a.anyo || 0) - (b.anyo || 0)
        },
        {
            title: 'Tipo',
            dataIndex: 'tipo',
            key: 'tipo',
            render: (text) => text ? <span>{text}</span> : <span style={{ fontStyle: 'italic', color: '#888' }}>Sin tipo</span>
        },
        {
            title: 'Imagen',
            dataIndex: 'imagen',
            key: 'imagen',
            render: (url) => url ? <Image src={url} alt="Mapa" style={{ maxWidth: 100 }} /> : 'Sin imagen'
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                        Editar
                    </Button>
                    <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDelete(record)} danger>
                        Eliminar
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Mapas</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Nuevo Mapa
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
                    dataSource={mapas} 
                    loading={loading} 
                    rowKey="id" 
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} mapas`
                    }}
                    onChange={handleTableChange}
                />
            </Card>

            <Modal
                title={editingMapa ? 'Editar Mapa' : 'Nuevo Mapa'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                okText={editingMapa ? 'Actualizar' : 'Crear'}
                cancelText="Cancelar"
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item 
                        name="titulo" 
                        label="Título" 
                        rules={[{ required: true, message: 'Por favor ingresa el título' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="tipo" label="Tipo de Mapa">
                        <Select 
                            placeholder="Selecciona el tipo de mapa" 
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            filterOption={(input, option) =>
                                (option?.label || '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={Object.entries(tipoMapa).map(([key, value]) => ({ 
                                key,
                                value: key,
                                label: value, 
                            }))} 
                        />
                    </Form.Item>
                    <Form.Item name="autor" label="Autor">
                        <Input />
                    </Form.Item>
                    <Form.Item name="anyo" label="Año">
                        <Input type="number" min={0} />
                    </Form.Item>
                    <Form.Item name="area" label="Área">
                        <Input />
                    </Form.Item>
                    <Form.Item name="editor" label="Editor">
                        <Input />
                    </Form.Item>
                    <Form.Item name="medida" label="Medidas">
                        <Input />
                    </Form.Item>
                    <Form.Item name="escala" label="Escala">
                        <Input />
                    </Form.Item>
                    <Form.Item name="edicion" label="Edición">
                        <RichTextEditor />
                    </Form.Item>
                    <Form.Item 
                        name="ubicacion" 
                        label="Ubicación"
                        rules={[{ required: true, message: 'Por favor ingresa la ubicación' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="sitio_web" label="Sitio Web">
                        <Input />
                    </Form.Item>
                    <Form.Item name="informacion" label="Información">
                        <RichTextEditor />
                    </Form.Item>
                    <Form.Item label="Imagen">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <UploadAcervo
                                bucket="portal"
                                folder="/mapas"
                                label="Subir imagen"
                                onUploaded={(media) => {
                                    form.setFieldValue('imagen', media.url);
                                }}
                            />
                            <Form.Item name="imagen" noStyle>
                                <Input placeholder="URL de la imagen" />
                            </Form.Item>
                            {imagenUrl && (
                                <Image src={imagenUrl} alt="Vista previa" style={{ maxWidth: 260, borderRadius: 6 }} />
                            )}
                        </Space>
                    </Form.Item>
                    <Form.Item label="Archivo">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <UploadAcervo
                                bucket="portal"
                                folder="/mapas"
                                label="Subir archivo"
                                onUploaded={(media) => {
                                    form.setFieldValue('archivo', media.url);
                                }}
                            />
                            <Form.Item name="archivo" noStyle>
                                <Input placeholder="URL del archivo" />
                            </Form.Item>
                            {archivoUrl && (
                                <a href={archivoUrl} target="_blank" rel="noopener noreferrer">
                                    Ver archivo subido
                                </a>
                            )}
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}