import { useState, useEffect, useCallback } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import { TableSearch } from '@components/common/TableSearch';
import { useDebouncedSearch } from '@components/common/searchHooks';

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
            const response = await api.get('/tipos-servicio');
            setTipoServicioOptions(response.data.tipoServicio || {});
        } catch {
            message.error('Error al cargar los tipos de servicio');
        }
    }, []);

    const fetchServicios = useCallback(async (search = '', page, pageSize) => {
        setLoading(true);
        setPagination((prevPagination) => {
            const currentPage = page ?? prevPagination.current;
            const currentPageSize = pageSize ?? prevPagination.pageSize;

            api.get('/servicios', {
                params: {
                    ...(search ? {search} : {}),
                    page: currentPage,
                    pageSize: currentPageSize
                }
            }).then( (response) => {
                setServicios(response.data.servicios || {});
                setPagination((prevPagination) => {
                    return { ...prevPagination, current: currentPage, pageSize: currentPageSize, total: response.data.total };
                });
                setLoading(false);
            }).catch(() => {
                message.error('Error al cargar los servicios');
                setLoading(false);
            }).finally(() => {
                setLoading(false);
            });
            return prevPagination;  
        });
    }, []);

    useEffect(() => {
        let isMounted = true;
        const loadInitialData = async () => {
            if(isMounted) {
                await Promise.all([
                    fetchTipos(), 
                    fetchServicios('', 1)
                ]);
            }
        };
        loadInitialData();
        return () => { isMounted = false; };
    }, [fetchTipos, fetchServicios]);

    const { searchText, setSSearchText } = useDebouncedSearch(texto => {
        fetchServicios(texto, 1, pagination.pageSize);
    });

    const handleTableChange = (pagination) => {
        fetchServicios(searchText, pagination.current, pagination.pageSize);
    };

    const handleCreate = () => {
        setEditingServicio(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (servicio) => {
        setEditingServicio(servicio);
        form.setFieldsValue(servicio);
        setIsModalVisible(true);
    };

    const handleDelete = (servicio) => {
        Modal.confirm({
            title: 'Confirmar eliminación',
            content: `¿Está seguro de que desea eliminar el servicio "${servicio.nombre}"?`,
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
                setIsModalVisible(false);
                await fetchServicios(searchText, pagination.current, pagination.pageSize);
            }else {
                await api.post('/servicios', values);
                message.success('Servicio creado correctamente');
                setIsModalVisible(false);
                setSearchText('');
                await fetchServicios('', 1, pagination.pageSize);
            }
        } catch {
            message.error('Error al guardar el servicio');
        }
    };

    const columns = [
        {
            title: 'Nombre',
            dataIndex: 'nombre',
            key: 'nombre',
            sorter: (a, b) => a.nombre.localeCompare(b.nombre),
        },
        {
            title: 'Tipo de Servicio',
            dataIndex: 'tipo_servicio',
            key: 'tipo_servicio',
            render: (tipo) => tipo?.nombre || '',
            sorter: (a, b) => a.tipo_servicio?.nombre.localeCompare(b.tipo_servicio?.nombre),
        },
        {
            title: 'Descripción',
            dataIndex: 'descripcion',
            key: 'descripcion',
            ellipsis: true,
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
                        rules={[{ required: false, message: 'Por favor ingrese el código del servicio' }]}
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
                            optionFilterProp="label"
                            filterOption={(input, option) =>
                                (option?.label || '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={Array.isArray(tipoServicioOptions)
                                ? tipoServicioOptions.map((t) => ({ value: t.id, label: t.nombre }))
                                : Object.values(tipoServicioOptions).map((value) => ({ value: value.id, label: value.nombre }))
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        name="formato_entrega"
                        label="Formato de entrega"
                        rules={[{ required: false, message: 'Por favor ingrese el formato del servicio' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="descripción"
                        name="descripcion"
                        rules={[{ required: true, message: 'Por favor ingrese la descripción del servicio' }]}
                    >
                        <RichTextEditor />
                    </Form.Item>
                    <Form.Item
                        name="unidad_medida"
                        label="Unidad de medida"
                        rules={[{ required: false, message: 'Por favor ingrese la unidad de medida' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="costos"
                        label="Costos"
                        rules={[{ required: false, message: 'Por favor ingrese los costos' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="politicas"
                        name="politicas"
                        rules={[{ required: false, message: 'Por favor ingrese las políticas del servicio' }]}
                    >
                        <RichTextEditor />
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