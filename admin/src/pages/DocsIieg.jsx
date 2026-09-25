import { useState, useCallback } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import RichTextEditor from '@components/campos/RichTextEditor';
import { UploadAcervo } from '@components/UploadAcervo';
import parse from 'html-react-parser';
import { TableSearch } from '@components/common/TableSearch';
import { useDebouncedSearch } from '@components/common/searchHooks';
import { useFetchOnFocus } from '@hooks/useFetchOnFocus';

const { Title } = Typography;

export default function DocsIieg() {
    const [docsIieg, setDocsIieg] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const fetchDocsIieg = useCallback(async (search = '', page, pageSize) => {
        try {
            setLoading(true);
            setPagination((prevPagination) => {
                const currentPage = page ?? prevPagination.current;
                const currentPageSize = pageSize ?? prevPagination.pageSize;

                api.get('/docs_iieg', {
                    params: {
                        ...(search ? { search } : {}),
                        page: currentPage,
                        pageSize: currentPageSize
                    }
                }).then((response) => {
                    setDocsIieg(response.data.docs_iieg || []);
                    setPagination((prev) => ({
                        ...prev,
                        current: currentPage,
                        pageSize: currentPageSize,
                        total: response.data.total || 0
                    }));
                }).catch(() => {
                    message.error('Error al cargar los documentos del IIEG');
                }).finally(() => {
                    setLoading(false);
                });

                return prevPagination;
            });
        } catch (error) {
            console.error('Error al solicitar documentos:', error);
            setLoading(false);
        }
    }, []);

    // Carga inicial y actualización al volver a enfocar la ventana/pestaña
    useFetchOnFocus(fetchDocsIieg);

    const { searchText, setSearchText } = useDebouncedSearch((text) => {
        fetchDocsIieg(text, 1, pagination.pageSize);
    });

    const handleTableChange = (newPagination) => {
        fetchDocsIieg(searchText, newPagination.current, newPagination.pageSize);
    };

    const handleCreate = () => {
        setEditingDoc(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingDoc(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este documento del IIEG?',
            content: `Se eliminará el documento: ${record.nombre}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/docs_iieg/${record.id}`);
                    message.success('Documento del IIEG eliminado exitosamente');
                    fetchDocsIieg(searchText, pagination.current, pagination.pageSize);
                } catch (error) {
                    console.error(error);
                    message.error('Error al eliminar el documento del IIEG');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (editingDoc) {
                await api.patch(`/docs_iieg/${editingDoc.id}`, values);
                message.success('Documento del IIEG actualizado exitosamente');
                fetchDocsIieg(searchText, pagination.current, pagination.pageSize);
            } else {
                await api.post('/docs_iieg/create', values);
                message.success('Documento del IIEG creado exitosamente');
                fetchDocsIieg(searchText, 1, pagination.pageSize);
            }
            setIsModalVisible(false);
        } catch (error) {
            console.error(error);
            message.error(editingDoc ? 'Error al actualizar el documento del IIEG' : 'Error al crear el documento del IIEG');
        }
    };

    const columns = [
        {
            title: 'Nombre',
            dataIndex: 'nombre',
            key: 'nombre',
            sorter: (a, b) => (a.nombre || '').localeCompare(b.nombre || '')
        },
        {
            title: 'Descripción',
            dataIndex: 'descripcion',
            key: 'descripcion',
            render: (text) => <div style={{ maxHeight: '100px', overflow: 'hidden' }}>{text ? parse(text) : ''}</div>,
            sorter: (a, b) => {
                const cleanA = (a.descripcion || '').replace(/<[^>]*>/g, '');
                const cleanB = (b.descripcion || '').replace(/<[^>]*>/g, '');
                return cleanA.localeCompare(cleanB);
            }
        },
        {
            title: 'Tipo',
            dataIndex: 'tipo',
            key: 'tipo',
            sorter: (a, b) => (a.tipo || '').localeCompare(b.tipo || '')
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
                <Title level={2} style={{ margin: 0 }}>Administración de Documentos del IIEG</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Nuevo Documento del IIEG
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
                    dataSource={docsIieg}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} documentos`
                    }}
                    onChange={handleTableChange}
                />
            </Card>

            <Modal
                title={editingDoc ? 'Editar Documento del IIEG' : 'Nuevo Documento del IIEG'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={form.submit}
                okText={editingDoc ? 'Actualizar' : 'Crear'}
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item
                        name="nombre"
                        label="Nombre"
                        rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="descripcion"
                        label="Descripción"
                        rules={[{ required: false }]}
                    >
                        <RichTextEditor />
                    </Form.Item>
                    <Form.Item
                        name="tipo"
                        label="Tipo"
                        rules={[{ required: true, message: 'Por favor seleccione el tipo' }]}
                    >
                        <Select
                            placeholder="Seleccione el tipo"
                            options={[
                                { value: 'valor', label: 'Valor' },
                                { value: 'normatividad', label: 'Normatividad' },
                                { value: 'plan_institucional', label: 'Plan Institucional' },
                                { value: 'plan_de_trabajo', label: 'Plan de Trabajo' }
                            ]}
                        />
                    </Form.Item>
                    <Form.Item
                        name="imagen"
                        label="Imagen"
                        rules={[{ required: false }]}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <UploadAcervo
                                bucket="portal"
                                folder="/documentosIieg/imagenes"
                                label="Subir imagen"
                                onUploaded={(media) => {
                                    form.setFieldValue('imagen', media.url);
                                }}
                            />
                            <Form.Item name="imagen" noStyle>
                                <Input placeholder="URL imagen" />
                            </Form.Item>
                            {form.getFieldValue('imagen') ? (
                                <Image
                                    src={form.getFieldValue('imagen')}
                                    alt="Vista previa imagen"
                                    style={{ maxWidth: 260, borderRadius: 6 }}
                                />
                            ) : null}
                        </Space>
                    </Form.Item>
                    <Form.Item
                        name="link"
                        label="Link"
                        rules={[{ required: false }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="documento"
                        label="Documento"
                        rules={[{ required: false }]}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <UploadAcervo
                                bucket="portal"
                                folder="/documentosIieg/documentos"
                                label="Subir documento"
                                onUploaded={(media) => {
                                    form.setFieldValue('documento', media.url);
                                }}
                            />
                            <Form.Item name="documento" noStyle>
                                <Input placeholder="Subir documento" />
                            </Form.Item>
                            {form.getFieldValue('documento') ? (
                                <a href={form.getFieldValue('documento')} target="_blank" rel="noopener noreferrer">
                                    Ver documento
                                </a>
                            ) : null}
                        </Space>
                    </Form.Item>
                    <Form.Item
                        name="fecha"
                        label="Fecha"
                        rules={[{ required: false }]}
                    >
                        <Input type="date" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}