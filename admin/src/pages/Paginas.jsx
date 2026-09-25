import { useState, useEffect, useMemo } from 'react';
import {
    Card,
    Typography,
    Space,
    Button,
    Modal,
    Form,
    Input,
    message,
    Checkbox,
    Select,
    List,
    Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HolderOutlined } from '@ant-design/icons';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    sortableKeyboardCoordinates,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
            const normalizedPages = (res.data.pages || []).map(({ subpages, ...rest }) => rest);
            setPages(normalizedPages);
        } catch (err) {
            console.error('Error fetching pages:', err);
        }
        finally {
            setLoading(false);
        }
    };

    const fetchPagesTree = async () => {
        try {
            const res = await api.get('/paginas/tree');
            setPagesTree(flattenTree(res.data));
        } catch (err) {
            console.error('Error fetching pages tree:', err);
        }
    };

    useEffect(() => {
        fetchPages();
        fetchPagesTree();
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const pagesById = useMemo(() => {
        const map = new Map();
        pages.forEach((page) => map.set(page.id, page));
        return map;
    }, [pages]);

    const flatOrderedPages = useMemo(() => flattenOrderedPages(pages), [pages]);
    const sortableIds = useMemo(() => flatOrderedPages.map((page) => page.id), [flatOrderedPages]);


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
        } catch (error) {
            const detail = error.response?.data?.detail;
            message.error(detail || (editingPage ? 'Error al actualizar página' : 'Error al crear página'));
        }
    };

    const persistOrder = async (nextPages) => {
        const items = normalizeOrderPayload(nextPages);
        await api.put('/paginas/reorder', { items });
    };

    const handleDragEnd = async ({ active, over }) => {
        if (!over || active.id === over.id) return;

        const activePage = flatOrderedPages.find((page) => page.id === active.id);
        const overPage = flatOrderedPages.find((page) => page.id === over.id);

        if (!activePage || !overPage) return;

        if (activePage.parent_id !== overPage.parent_id) {
            message.warning('Solo puedes reordenar páginas del mismo nivel');
            return;
        }

        const siblings = flatOrderedPages.filter(
            (page) => page.parent_id === activePage.parent_id
        );

        const oldIndex = siblings.findIndex((page) => page.id === active.id);
        const newIndex = siblings.findIndex((page) => page.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const reorderedSiblings = arrayMove(siblings, oldIndex, newIndex);
        const siblingIds = new Set(siblings.map((page) => page.id));

        const nextPages = pages.map((page) => {
            if (!siblingIds.has(page.id)) return page;

            const nextOrder = reorderedSiblings.findIndex((item) => item.id === page.id);
                return {
                    ...page,
                    order: nextOrder,
                };
            });

            setPages(nextPages);

            try {
                await persistOrder(nextPages);
                message.success('Orden actualizado');
            } catch (error) {
                console.error('Error updating order:', error);
                message.error('No se pudo actualizar el orden');
                fetchPages();
            }
        };

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
                <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
                    Arrastra con el icono para cambiar el orden. El menú público usa este mismo orden.
                </Typography.Paragraph>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                        <List
                            loading={loading}
                            dataSource={flatOrderedPages}
                            locale={{ emptyText: 'No hay páginas registradas' }}
                            renderItem={(item) => (
                                <SortablePageItem
                                    key={item.id}
                                    item={item}
                                    parentTitle={
                                        item.parent_id ? pagesById.get(item.parent_id)?.title : null
                                    }
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            )}
                        />
                    </SortableContext>
                </DndContext>
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
                        rules={[{ required: false, message: 'Por favor ingrese la descripción' }]}
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
                        name="activar" 
                        valuePropName="checked"
                        initialValue={true}
                        >
                        <Checkbox>¿Activar página?</Checkbox>
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
                        rules={[{ required: false, message: 'Por favor ingrese la fecha de actualización' }]}
                    >
                        <Input type="date" />
                    </Form.Item>

                    <Form.Item
                        label="Keywords"
                        name="keywords_meta"
                        rules={[{ required: false, message: 'Por favor ingrese el titulo' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Meta Descripción"
                        name="description_meta"
                        rules={[{ required: false, message: 'Por favor ingrese la descripción' }]}
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
        const { subpages = [], ...rest } = page;
        return [{ ...rest, depth }, ...flattenTree(subpages, depth + 1)];
    });
}

function flattenOrderedPages(items) {
    const buildTree = (parentId = null) => {
        return items
            .filter((item) => item.parent_id === parentId)
            .sort((a, b) => {
                const orderA = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
                const orderB = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;
                if (orderA !== orderB) return orderA - orderB;
                return a.id - b.id;
            })
            .map((item) => ({
                ...item,
                children: buildTree(item.id),
            }));
    };

    const flatten = (tree, depth = 0) => {
        return tree.flatMap(({ children, ...rest }) => [
            { ...rest, depth },
            ...flatten(children, depth + 1),
        ]);
    };

    return flatten(buildTree());
}

function normalizeOrderPayload(items) {
    const grouped = items.reduce((acc, item) => {
        const key = item.parent_id ?? 'root';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    return Object.values(grouped).flatMap((siblings) => {
        return [...siblings]
            .sort((a, b) => {
                const orderA = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
                const orderB = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;
                if (orderA !== orderB) return orderA - orderB;
                return a.id - b.id;
            })
            .map((item, order) => ({
                id: item.id,
                parent_id: item.parent_id,
                order,
            }));
    });
}

function SortablePageItem({ item, parentTitle, onEdit, onDelete }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        background: '#fff',
        border: '1px solid #f0f0f0',
        borderRadius: 8,
        marginBottom: 10,
        marginLeft: item.depth * 24,
        padding: '12px 16px',
    };

    return (
        <List.Item ref={setNodeRef} style={style}>
            <div style={{ width: '100%' }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        width: '100%',
                    }}
                >
                    <Space>
                        <Button
                            type="text"
                            icon={<HolderOutlined />}
                            {...attributes}
                            {...listeners}
                            style={{ cursor: 'grab' }}
                        />
                        <div>
                            <div style={{ fontWeight: 600 }}>{item.title}</div>
                            <Space size={8} wrap>
                                <Tag>{item.slug_custom}</Tag>
                                {parentTitle && <Tag color="blue">Padre: {parentTitle}</Tag>}
                                <Tag color={item.link_interno ? 'green' : 'gold'}>
                                    {item.link_interno ? 'Interno' : 'Externo'}
                                </Tag>
                                <Tag color={item.activar ? 'success' : 'default'}>
                                    {item.activar ? 'Activo' : 'Inactivo'}
                                </Tag>
                            </Space>
                        </div>
                    </Space>

                    <Space>
                        <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(item)}>
                            Editar
                        </Button>
                        <Button type="link" danger icon={<DeleteOutlined />} onClick={() => onDelete(item)}>
                            Eliminar
                        </Button>
                    </Space>
                </div>
            </div>
        </List.Item>
    );
}