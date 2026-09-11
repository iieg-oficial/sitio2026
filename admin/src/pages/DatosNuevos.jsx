import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import RichTextEditor from '@components/campos/RichTextEditor';
import { useSearchFilter, TableSearch } from '@components/common/TableSearch';

const { Title } = Typography;

export default function DatosNuevos() {
    const [datosNuevos, setDatosNuevos] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingData, setEditingData] = useState(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [tipos, setTipos] = useState([]);
    const { searchText, setSearchText, filteredData } = useSearchFilter(datosNuevos, ['cifras']);

    useEffect(() => {
        fetchDatosNuevos();
        fetchTipos();
    }, []);

    const fetchTipos = async () => {
        try {
            const response = await api.get('/datos-nuevos/tipo');
            setTipos(response.data.tipos);
        } catch (error) {
            message.error('Error al cargar los tipos');
        } finally {
            setLoading(false);
        }
    };

    const fetchDatosNuevos = async () => {
        setLoading(true);
        try {
            const response = await api.get('/datos-nuevos');
            setDatosNuevos(response.data.datos_nuevos);
        } catch (error) {
            message.error('Error al cargar los datos nuevos');
        }
        finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingData(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingData(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este dato nuevo?',
            content: `Se eliminará el dato nuevo: ${record.numero}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/datos-nuevos/${record.id}`);
                    message.success('Dato nuevo eliminado exitosamente');
                    fetchDatosNuevos();
                } catch (error) {
                    message.error('Error al eliminar el dato nuevo');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingData) {
                await api.patch(`/datos-nuevos/${editingData.id}`, values);
                message.success('Dato nuevo actualizado exitosamente');
            } else {
                await api.post('/datos-nuevos/create', values);
                message.success('Dato nuevo creado exitosamente');
            }
            setIsModalVisible(false);
            fetchDatosNuevos();
        } catch (error) {
            message.error(editingData ? 'Error al actualizar el dato nuevo' : 'Error al crear el dato nuevo');
        }
    };

    const columns = [
        {
            title: 'Cifras',
            dataIndex: 'cifras',
            key: 'cifras',
            sorter: (a, b) => a.cifras - b.cifras
        },
        {
            title: 'Descripción',
            dataIndex: 'descripcion',
            key: 'descripcion',
            sorter: (a, b) => a.descripcion.localeCompare(b.descripcion),
            render: (text) => (
                <div
                className="tiptap-content"
                dangerouslySetInnerHTML={{ __html: text }}
                />
            ),
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
                <Title level={2} style={{ margin: 0 }}>Administración de Datos Nuevos</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Nuevo Dato
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
                        showTotal: (total) => `Total ${total} datos`
                    }}
                />
            </Card>

            <Modal
                title={editingData ? 'Editar Dato' : 'Nuevo Dato'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={form.submit}
                okText="Guardar"
                cancelText="Cancelar"
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item
                        name="cifras"
                        label="Cifras"
                        rules={[{ required: true, message: 'Por favor ingrese las cifras' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="descripcion"
                        label="Descripción"
                        rules={[{ required: true, message: 'Por favor ingrese la descripción' }]}
                    >
                        <RichTextEditor />
                    </Form.Item>
                    <Form.Item
                        name="tipo"
                        label="Tipo"
                        rules={[{ required: false, message: 'Por favor seleccione el tipo' }]}
                    >
                        <Select placeholder="Seleccione un tipo">
                            {Object.entries(tipos).map(([key, value]) => (
                                <Select.Option key={key} value={key}>
                                    {value}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
        