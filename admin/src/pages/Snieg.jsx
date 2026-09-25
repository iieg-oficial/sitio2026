import { useState, useEffect, useCallback } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import RichTextEditor from '@components/campos/RichTextEditor';
import { UploadAcervo } from '@components/UploadAcervo';
import { TableSearch } from '@components/common/TableSearch';
import { useSearchFilter } from '@components/common/searchHooks';
import { SafeHtml } from '@components/SafeHtml';

const { Title } = Typography;

export default function Snieg() {
    const [form] = Form.useForm();
    const [snieg, setSnieg] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingSnieg, setEditingSnieg] = useState(null);
    const [loading, setLoading] = useState(true);
    const { searchText, setSearchText, filteredData } = useSearchFilter(snieg, ['titulo']);

    // Hook para observar el valor de 'imagen' y redibujar el preview en tiempo real
    const imagenUrl = Form.useWatch('imagen', form);

    const fetchSnieg = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/snieg', {
                params: { _t: new Date().getTime() }
            });
            const data = Array.isArray(response.data?.snieg) ? response.data.snieg : [];
            const sortedData = [...data].sort((a, b) => (b.id || 0) - (a.id || 0));
            // CORREGIDO: Se asigna el estado con setSnieg en lugar de la recursión infinita
            setSnieg(sortedData);
        } catch {
            message.error('Error al cargar snieg');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSnieg();

        const handleFocus = () => {
            fetchSnieg();
        };
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchSnieg]);

    const handleCreate = () => {
        setEditingSnieg(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingSnieg(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este snieg / CEIEG?',
            content: 'Se eliminará el snieg / CEIEG',
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/snieg/${id}`);
                    message.success('Snieg / CEIEG eliminado correctamente');
                    await fetchSnieg();
                } catch {
                    message.error('Error al eliminar snieg / CEIEG');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingSnieg) {
                await api.patch(`/snieg/${editingSnieg.id}`, values);
                message.success('Snieg / CEIEG actualizado correctamente');
            } else {
                await api.post('/snieg/create', values);
                message.success('Snieg / CEIEG agregado correctamente');
            }
            setIsModalVisible(false);
            await fetchSnieg();
        } catch {
            message.error('Error al guardar snieg / CEIEG');
        }
    };

    const columns = [
        {
            title: 'Título',
            dataIndex: 'titulo',
            key: 'titulo',
            sorter: (a, b) => (a.titulo || '').localeCompare(b.titulo || ''),
        },
        {
            title: 'Descripción',
            dataIndex: 'descripcion',
            key: 'descripcion',
            render: (descripcion) => (
                <SafeHtml htmlContent={descripcion} className='mt-5 prose max-w-none'/>
            ),            
        },
        {
            title: 'Enlace',
            dataIndex: 'enlace',
            key: 'enlace',
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
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
                        onClick={() => handleDelete(record.id)}
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
                <Title level={2} style={{ margin: 0 }}>Snieg / CEIEG</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Agregar Snieg / CEIEG
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
                    dataSource={filteredData} 
                    columns={columns} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} snieg / CEIEG`
                    }}
                />
            </Card>

            <Modal
                title={editingSnieg ? 'Editar Snieg' : 'Agregar Snieg'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
                okText={editingSnieg ? 'Actualizar' : 'Crear'}
                cancelText="Cancelar"
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="titulo" label="Título" rules={[{ required: true, message: 'Por favor ingrese el título' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="descripcion" label="Descripción" rules={[{ required: true, message: 'Por favor ingrese la descripción' }]}>
                        <RichTextEditor />
                    </Form.Item>
                    <Form.Item name="imagen" label="Imagen" rules={[{ required: false }]}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <UploadAcervo
                                bucket="portal"
                                folder="/snieg"
                                label="Subir imagen"
                                onUploaded={(media) => {
                                    form.setFieldValue('imagen', media.url);
                                }}
                            />
                            <Form.Item name="imagen" noStyle>
                                <Input placeholder="URL de la imagen" />
                            </Form.Item>
                            {imagenUrl ? (
                                <Image src={imagenUrl} alt="Imagen del snieg" style={{ maxWidth: 200, borderRadius: 6 }} />
                            ) : null}
                        </Space>
                    </Form.Item>
                    <Form.Item name="enlace" label="Enlace" rules={[{ required: false }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}