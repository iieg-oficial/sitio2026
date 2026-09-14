import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Checkbox} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import { CamposBannerFull, CamposBannerMin } from '@components/campos/banner';
import RichTextEditor from '@components/campos/RichTextEditor';
import { TableSearch } from '@components/common/TableSearch';
import { useSearchFilter } from '@components/common/searchHooks';

const { Title } = Typography;



export default function Banner() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingBanner, setEditingBanner] = useState(null);
    const { searchText, setSearchText, filteredData } = useSearchFilter(banners, ['titulo']);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const response = await api.get('/banner');
            setBanners(response.data.banners);
        } catch (error) {
            message.error('Error al cargar los banners');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingBanner(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        form.setFieldsValue(banner);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Estás seguro de que quieres eliminar este banner?',
            content: `Se eliminará el banner ${record.titulo}, no se podrá deshacer`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/banner/${record.id}`);
                    message.success('Banner eliminado correctamente');
                    fetchBanners();
                } catch (error) {
                    message.error('Error al eliminar el banner');
                }
            },
        });
    };
            
    const handleSubmit = async (values) => {
        try {
            if (editingBanner) {
                await api.patch(`/banner/${editingBanner.id}`, values);
                message.success('Banner actualizado correctamente');
            } else {
                await api.post('/banner/create', values);
                message.success('Banner creado correctamente');
            }
            setModalVisible(false);
            fetchBanners();
        } catch (error) {
            message.error('Error al guardar el banner');
        }
    };

    const SECCIONES = {
        banner_full: <CamposBannerFull />,
        banner_min: <CamposBannerMin />,
    };

    const isFullScreen = Form.useWatch('full_screen', form);

    const columns = [
        {
            title: 'Título',
            dataIndex: 'titulo',
            key: 'titulo',
            sorter: (a, b) => a.titulo.localeCompare(b.titulo),
        },
        {
            title: 'Link',
            dataIndex: 'link',
            key: 'link',
        },
        {
            title: 'Color de Fondo',
            dataIndex: 'color_fondo',
            key: 'color_fondo',
            render: (val) => <div style={{ backgroundColor: val, width: 50, height: 50 }}></div>,
        },
        {
            title: 'Full Screen',
            dataIndex: 'full_screen',
            key: 'full_screen',
            render: (val) => val ? 'Sí' : 'No',
        },
        {
            title: 'Imagen',
            dataIndex: 'imagen',
            key: 'imagen',
            render: (val) => <img src={val} alt="" style={{ width: 50, height: 50 }} />,
        },
        {
            title: 'Imagen desktop',
            dataIndex: 'imagen_desktop',
            key: 'imagen_desktop',
            render: (val) => <img src={val} alt="" style={{ width: 50, height: 50 }} />,
        },
        {
            title: 'Imagen mobile',
            dataIndex: 'imagen_mobile',
            key: 'imagen_mobile',
            render: (val) => <img src={val} alt="" style={{ width: 50, height: 50 }} />,
        },
        {
            title: 'Acciones',
            key: 'acciones',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                        Editar
                    </Button>
                    <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
                        Eliminar
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Banners</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Crear Banner
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
                    loading={loading}
                    rowKey="id"
                    pagination={{ 
                        pageSize: 10, showSizeChanger: true, 
                        showTotal: (total) => `Total ${total} banners` }}
                />
            </Card>
            <Modal
                title={editingBanner ? 'Editar Banner' : 'Crear Banner'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={form.submit}
                okText={editingBanner ? 'Actualizar' : 'Crear'}
                cancelText="Cancelar"
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical" initialValues={{ color_fondo: '#8936ab' }}>
                    <Form.Item name="titulo" label="Título" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="descripcion" label="Descripción" rules={[{ required: true }]}>
                        <RichTextEditor />
                    </Form.Item>
                    <Form.Item 
                        name="full_screen" 
                        valuePropName="checked"
                        >
                        <Checkbox>Activar banner completo</Checkbox>
                    </Form.Item>
                    
                    {isFullScreen ? SECCIONES['banner_full'] : SECCIONES['banner_min']}

                    <Form.Item name="link" label="Link" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="boton" label="Botón" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>                   
                    
                </Form>
            </Modal>
        </div>
    );
}
        