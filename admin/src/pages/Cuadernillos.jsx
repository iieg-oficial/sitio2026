import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import { UploadAcervo } from '@components/UploadAcervo';
import { TableSearch } from '@components/common/TableSearch';
import { useDebouncedSearch } from '@components/common/searchHooks';
const { Title } = Typography;

export default function Cuadernillos() {
    const [cuadernillos, setCuadernillos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCuadernillo, setEditingCuadernillo] = useState(null);
    const [municipios, setMunicipios] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const watchAnyo = Form.useWatch('anyo', form);
    
    useEffect(() => {
        fetchCuadernillos('', 1, pagination.pageSize);
        fetchMunicipios();
    }, []);

    const getDynamicFolder = () => {
        let folderPath = '/cuadernillos';

        if (watchAnyo) {
            folderPath += `/${watchAnyo}`;
        }


        return folderPath;
    };

    const fetchMunicipios = async () => {
        try {
            const response = await api.get('/cuadernillos/municipios');
            setMunicipios(response.data.municipios || {});
        } catch (error) {
            message.error('Error al obtener los municipios');
        }
    }

    const fetchCuadernillos = async (search = '', page = 1, pageSize = pagination.pageSize) => {
        setLoading(true);
        try {
            const response = await api.get('/cuadernillos', {
                params: {
                    ...(search ? { search } : {}),
                    page,
                    pageSize,
                    _t: new Date().getTime() // Anti-caché
                }
            });
            setCuadernillos(response.data.cuadernillos || []);
            setPagination((prev) => ({
                ...prev,
                current: page,
                pageSize,
                total: response.data.total
            }));
        } catch (error) {
            message.error('Error al obtener los cuadernillos');
        } finally {
            setLoading(false);
        }
    };  

    const { searchText, setSearchText } = useDebouncedSearch((text) => {
        fetchCuadernillos(text, 1, pagination.pageSize);
    });

    const handleTableChange = (newPagination) => {
        fetchCuadernillos(searchText, newPagination.current, newPagination.pageSize);
    };

    const handleCreate = () => {
        setEditingCuadernillo(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingCuadernillo(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Estás seguro de eliminar este cuadernillo?',
            content: `Se eliminará el reporte: ${record.titulo}`,
            okText: 'Eliminar',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/cuadernillos/${record.id}/`);
                    message.success('Cuadernillo eliminado');
                    fetchCuadernillos(searchText, pagination.current, pagination.pageSize);
                } catch (error) {
                    message.error('Error al eliminar el cuadernillo');
                }
            },
        });
    }

    const handleSubmit = async (values) => {
        try {
            if (editingCuadernillo) {
                await api.patch(`/cuadernillos/${editingCuadernillo.id}`, values);
                message.success('Cuadernillo actualizado');
                setModalVisible(false);
                // Mantiene la vista actual al editar
                await fetchCuadernillos(searchText, pagination.current, pagination.pageSize);
            } else {
                await api.post('/cuadernillos', values);
                message.success('Cuadernillo creado');
                setModalVisible(false);
                setSearchText('');
                // Redirige automáticamente a la página 1 sin filtro para que aparezca arriba de primero
                await fetchCuadernillos('', 1, pagination.pageSize);
            }
        } catch (error) {
            message.error('Error al guardar el cuadernillo');
        }
    };

    const columns = [
        { title: 'Título', dataIndex: 'titulo', key: 'titulo' },
        { title: 'Municipio', dataIndex: 'municipio', key: 'municipio' },
        {
            title: 'Acciones',
            key: 'acciones',
            render: (_, record) => (
                <Space>
                    <Button 
                        type="link" 
                        icon={<EditOutlined />} 
                        onClick={() => handleEdit(record)} >
                            Editar
                    </Button>
                    <Button 
                        type="link" 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDelete(record)} 
                        danger
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
                <Title level={2}>Cuadernillos</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Nuevo Cuadernillo
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
                dataSource={cuadernillos}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} cuadernillos`
                }}
                onChange={handleTableChange}
            />
        </Card>

        <Modal
            title={editingCuadernillo ? 'Editar Cuadernillo' : 'Nuevo Cuadernillo'}
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            onOk={() => form.submit()}
            okText={editingCuadernillo ? 'Actualizar' : 'Crear'}
            cancelText="Cancelar"
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item name="titulo" label="Título" rules={[{ required: true, message: 'Por favor ingresa el título' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="archivo" label="Archivo" rules={[{ required: true, message: 'Por favor sube el archivo' }]}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <UploadAcervo 
                            bucket="portal"
                            folder={getDynamicFolder()}
                            label="Subir Archivo"
                            onUploaded={(media) =>
                                form.setFieldsValue({ archivo: media.url })
                            }
                        />
                        <Form.Item name="archivo" noStyle>
                            <Input placeholder="URL del archivo" />
                        </Form.Item>
                        {form.getFieldValue('archivo') ? (
                            <a href={form.getFieldValue('archivo')} target="_blank" rel="noopener noreferrer">
                                Ver Archivo
                            </a>
                        ) : null}
                    </Space>
                </Form.Item>
                <Form.Item name="municipio" label="Municipio" rules={[{ required: true, message: 'Por favor selecciona el municipio' }]}>
                    <Select
                        placeholder="Selecciona un municipio"
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        filterOption={(input, option) =>
                            (option?.label || '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={Array.isArray(municipios) 
                            ? municipios.map((m) => ({ value: m, label: m }))
                            : Object.entries(municipios).map(([key, value]) => ({ value: value, label: value }))
                        }
                    />
                </Form.Item>
                <Form.Item name="anyo" label="Año" rules={[{ required: true, message: 'Por favor ingresa el año' }]}>
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    </div>
    );
}