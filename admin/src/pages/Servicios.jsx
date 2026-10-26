import { useState, useEffect, useCallback } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import { TableSearch } from '@components/common/TableSearch';
import { useDebouncedSearch } from '@components/common/searchHooks';
import RichTextEditor from '@components/campos/RichTextEditor';

const { Title } = Typography;

export default function Servicios() {
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingServicio, setEditingServicio] = useState(null);
    const [tipoServicioOptions, setTipoServicioOptions] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const fetchTipos = useCallback(async () => {
        try {
            // Incluir /servicios antes de /tipos-servicio
            const response = await api.get('/servicios/tipos-servicio');
            setTipoServicioOptions(response.data?.tipos_servicio || []);
        } catch {
            message.error('Error al cargar los tipos de servicio');
        }
    }, []);

    const fetchServicios = useCallback(async (search = '', page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await api.get('/servicios', {
                params: {
                    ...(search ? { search } : {}),
                    page,
                    pageSize
                }
            });

            const listaServicios = Array.isArray(response.data)
                ? response.data
                : (response.data?.servicios || []);

            setServicios(listaServicios);
            setPagination(prev => ({
                ...prev,
                current: page,
                pageSize,
                total: response.data?.total || listaServicios.length
            }));
        } catch {
            message.error('Error al cargar los servicios');
            setServicios([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        if (isMounted) {
            fetchTipos();
            fetchServicios('', 1, pagination.pageSize);
        }
        return () => { isMounted = false; };
    }, [fetchTipos, fetchServicios]);

    const { searchText, setSearchText } = useDebouncedSearch(texto => {
        fetchServicios(texto, 1, pagination.pageSize);
    });

    const handleTableChange = (newPagination) => {
        fetchServicios(searchText, newPagination.current, newPagination.pageSize);
    };

    const handleCreate = () => {
        setEditingServicio(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (servicio) => {
        setEditingServicio(servicio);
        form.setFieldsValue({
            ...servicio,
            // Extrae el ID si 'tipo' viene como objeto relacional
            tipo: servicio.tipo?.id || servicio.tipo_servicio?.id || servicio.tipo
        });
        setIsModalVisible(true);
    };

    const handleDelete = (servicio) => {
        Modal.confirm({
            title: 'Confirmar eliminación',
            content: `¿Está seguro de que desea eliminar el servicio "${servicio.titulo || servicio.nombre}"?`,
            okText: 'Eliminar',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/servicios/${servicio.id}`);
                    message.success('Servicio eliminado correctamente');
                    fetchServicios(searchText, pagination.current, pagination.pageSize);
                } catch {
                    message.error('Error al eliminar el servicio');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingServicio) {
                await api.put(`/servicios/${editingServicio.id}`, values);
                message.success('Servicio actualizado correctamente');
            } else {
                await api.post('/servicios', values);
                message.success('Servicio creado correctamente');
                setSearchText('');
            }
            setIsModalVisible(false);
            fetchServicios(searchText, pagination.current, pagination.pageSize);
        } catch {
            message.error('Error al guardar el servicio');
        }
    };

    const columns = [
        {
            title: 'Nombre',
            dataIndex: 'titulo',
            key: 'titulo',
            sorter: (a, b) => (a.titulo || '').localeCompare(b.titulo || ''),
        },
        {
            title: 'Tipo de Servicio',
            dataIndex: 'tipo_servicio',
            key: 'tipo_servicio',
            render: (tipo, record) => tipo?.nombre || record.tipo || '',
            sorter: (a, b) => {
                const nameA = a.tipo_servicio?.nombre || a.tipo || '';
                const nameB = b.tipo_servicio?.nombre || b.tipo || '';
                return nameA.localeCompare(nameB);
            },
        },
        {
            title: 'Descripción',
            dataIndex: 'descripcion',
            key: 'descripcion',
            ellipsis: true,
            render: (text) => text?.replace(/<[^>]*>?/gm, '') || '' // Limpia etiquetas HTML del RichText
        },
        {
            title: 'Acciones',
            key: 'acciones',
            render: (_, servicio) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(servicio)}
                    >
                        Editar
                    </Button>
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(servicio)}
                    >
                        Eliminar
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2}>Servicios</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Nuevo servicio
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
                    dataSource={servicios}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} servicios`
                    }}
                    onChange={handleTableChange}
                />
            </Card>

            <Modal
                title={editingServicio ? 'Editar Servicio' : 'Nuevo Servicio'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
                okText={editingServicio ? 'Actualizar' : 'Crear'}
                cancelText="Cancelar"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="titulo"
                        label="Nombre"
                        rules={[{ required: true, message: 'Por favor ingrese el nombre del servicio' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="codigo"
                        label="Código"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="tipo"
                        label="Tipo de Servicio"
                        rules={[{ required: true, message: 'Por favor seleccione el tipo de servicio' }]}
                    >
                        <Select
                            placeholder="Selecciona un tipo"
                            allowClear
                            showSearch
                            options={tipoServicioOptions.map((t) => ({
                                value: t.nombre || t.value || t.id, 
                                label: t.nombre || t.value
                            }))}
                        />
                    </Form.Item>
                    <Form.Item
                        name="formato_entrega"
                        label="Formato de entrega"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="descripcion"
                        label="Descripción"
                        rules={[{ required: true, message: 'Por favor ingrese la descripción del servicio' }]}
                    >
                        <RichTextEditor />
                    </Form.Item>
                    <Form.Item
                        name="unidad_medida"
                        label="Unidad de medida"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="costos"
                        label="Costos"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="politicas"
                        label="Políticas"
                    >
                        <RichTextEditor />
                    </Form.Item>
                    <Form.Item
                        name="slug"
                        label="URL"
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}