import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Checkbox, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import RichTextEditor from '@components/campos/RichTextEditor';

const { Title } = Typography;

export default function Paginas() {
    const [pages, setPages] = useState([]);
    const [pagesTree, setPagesTree] = useState([]);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPage, setEditingPage] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchPages = async () => {
        setLoading(true);
        try {
            const res = await api.get('/paginas');
            setPages(res.data.pages);
        } catch (err) {
            console.error("Error fetching pages:", err);
        }
        finally {
            setLoading(false);
        }
    };

    const fetchPagesTree = async () => {
        setLoading(true);
        try {
            const res = await api.get('/paginas/tree');
            setPagesTree(flattenTree(res.data));
        } catch (err) {
            console.error("Error fetching pages tree:", err);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPages();
        fetchPagesTree();
    }, []);


    const handleCreate = () => {
            setEditingPage(null);
            form.resetFields();
            setModalVisible(true);
        };
    
        const handleEdit = (record) => {
            setEditingPage(record);
            const formattedRecord = { ...record };
            if (formattedRecord.updated_at) {
                // Format "YYYY-MM-DDTHH:mm:ss" to "YYYY-MM-DD" for the date input
                formattedRecord.updated_at = formattedRecord.updated_at.split('T')[0];
            }
            form.setFieldsValue(formattedRecord);
            setModalVisible(true);
        };
    
        const handleDelete = (record) => {
            Modal.confirm({
                title: '¿Está seguro de eliminar esta página?',
                content: `Se eliminará la página: ${record.title}`,
                okText: 'Eliminar',
                okType: 'danger',
                cancelText: 'Cancelar',
                onOk: async () => {
                    try {
                        await api.delete(`/paginas/${record.id}`);
                        message.success('Página eliminada exitosamente');
                        fetchPages();
                        fetchPagesTree();
                    } catch {
                        message.error('Error al eliminar página');
                    }
                }
            });
        };
    
        const handleSubmit = async (values) => {
            try {
                if (editingPage) {
                    await api.put(`/paginas/${editingPage.id}`, values);
                    message.success('Página actualizada exitosamente');
                } else {
                    await api.post('/paginas/create', values);
                    message.success('Página creada exitosamente');
                }
                setModalVisible(false);
                fetchPages();
                fetchPagesTree();
            } catch {
                message.error(editingPage ? 'Error al actualizar página' : 'Error al crear página');
            }
        };
    
        const columns = [
            {
                title: 'Titulo',
                dataIndex: 'title',
                key: 'title',
                sorter: (a, b) => a.title.localeCompare(b.title)
            },
            {
                title: 'Padre',
                dataIndex: 'parent_id',
                key: 'parent_id',
                render: (parent_id) => pages.find((p) => p.id === parent_id)?.title,
                sorter: (a, b) => a.parent_id.localeCompare(b.parent_id)
            },
            {
                title: 'Slug',
                dataIndex: 'slug_custom',
                key: 'slug_custom',
                sorter: (a, b) => a.slug_custom.localeCompare(b.slug_custom)
            },
            {
                title: '¿Es link interno?',
                dataIndex: 'link_interno',
                key: 'link_interno',
                render: (text) => text ? 'Sí' : 'No'
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
                <Title level={2} style={{ margin: 0 }}>Administración de Páginas</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Nueva Página
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={pages}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} páginas`
                    }}
                />
            </Card>

            <Modal
                title={editingPage ? 'Editar Página' : 'Nueva Página'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                okText={editingPage ? 'Actualizar' : 'Crear'}
                cancelText="Cancelar"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        label="Titulo"
                        name="title"
                        rules={[{ required: true, message: 'Por favor ingrese el titulo' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Descripción"
                        name="description"
                        rules={[{ required: true, message: 'Por favor ingrese la descripción' }]}
                    >
                        <RichTextEditor />
                    </Form.Item>
                    <Form.Item 
                        name="link_interno" 
                        valuePropName="checked"
                        initialValue={true}
                        >
                        <Checkbox>¿Es link interno?</Checkbox>
                    </Form.Item>
                    <Form.Item
                        label="Slug"
                        name="slug_custom"
                        rules={[{ required: true, message: 'Por favor ingrese el slug' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Fecha de actualización"
                        name="updated_at"
                        rules={[{ required: true, message: 'Por favor ingrese la fecha de actualización' }]}
                    >
                        <Input type="date" />
                    </Form.Item>

                    <Form.Item
                        label="Keywords"
                        name="keywords_meta"
                        rules={[{ required: true, message: 'Por favor ingrese el titulo' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Meta Descripción"
                        name="description_meta"
                        rules={[{ required: true, message: 'Por favor ingrese la descripción' }]}
                    >
                        <RichTextEditor />
                    </Form.Item>
                    <Form.Item label="Padre" name="parent_id"
                        rules={[{ required: false, message: 'Por favor seleccione el padre' }]}
                    >
                        <Select
                        value={pagesTree?.parent_id}
                        onChange={(value) => form.setFieldValue('parent_id', value)}
                        >
                            <Select.Option value={null}>Sin Padre</Select.Option>
                            {pagesTree.map((p) => (
                                <Select.Option key={p.id} value={p.id}>
                                    {"--".repeat(p.depth)} {p.title}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                        

                </Form>
            </Modal>
        </div>
    )
}

function flattenTree(pagesTree, depth = 0) {
    return pagesTree.flatMap((page) => {
        const { children = [], ...rest } = page;
        return [{ ...rest, depth }, ...flattenTree(children, depth + 1)];
    });
}