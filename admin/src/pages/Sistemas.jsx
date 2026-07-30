import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select, Checkbox, Image} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import { TemaSelector } from '@components/pageComponents/SubjectSelector';
import RichTextEditor from '@components/campos/RichTextEditor';
import { UploadAcervo } from '@components/UploadAcervo';

const { Title } = Typography;
const { Option } = Select;

export default function Sistemas() {
    const [sistemas, setSistemas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSistema, setEditingSistema] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [tipos, setTipos] = useState([]);

    useEffect(() => {
        fetchSistemas();
        fetchSubjects();
        fetchTipos();
    }, []);

    const fetchTipos = async () => {
        try{
            const response = await api.get('/sistemas/tipos');
            setTipos(response.data.tipos || {});
        } catch (error) {
            message.error('Error al obtener los tipos');
        }
    }

    const fetchSistemas = async () => {
        setLoading(true);
        try {
            const response = await api.get('/sistemas');
            setSistemas(response.data.sistemas);
        } catch {
            message.error('Error al cargar sistemas');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const response = await api.get('/subject/tree');
            setSubjects(response.data);
        } catch {
            message.error('Error al cargar temas');
        }
    };

    const handleCreate = () => {
        setEditingSistema(null);
        setSelectedSubjects([]);        
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingSistema(record);
        const ids = (record.temas ?? []).map((t) => t.id);
        setSelectedSubjects(ids);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este producto?',
            content: `Se eliminará el producto: ${record.titulo}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/sistemas/${record.id}`);
                    message.success('producto eliminado exitosamente');
                    fetchSistemas();
                } catch {
                    message.error('Error al eliminar producto');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            const payload = { ...values, tema_ids: selectedSubjects };
            if (editingSistema) {
                await api.patch(`/sistemas/${editingSistema.id}`, payload);
                message.success('producto actualizado exitosamente');
            } else {
                await api.post('/sistemas/create', payload);
                message.success('producto creado exitosamente');
            }
            setModalVisible(false);
            fetchSistemas();
        } catch {
            message.error('Error al guardar producto');
        }
    };
        
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
            title: 'Tipo',
            dataIndex: 'tipo',
            key: 'tipo',
            sorter: (a, b) => a.tipo.localeCompare(b.tipo),
        },
        {
            title: 'Destacado',
            dataIndex: 'destacado',
            key: 'destacado',
            render: (val) => val ? 'Sí' : 'No',            
        },
        {
            title: 'Acciones',
            key: 'acciones',
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
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
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
                <Title level={2} style={{ margin: 0 }}>Nuestros productos</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Crear producto
                </Button>
            </div>
        <Card>
            <Table 
            columns={columns} 
            dataSource={sistemas} 
            loading={loading} 
            rowKey="id"
            pagination={{ 
                pageSize: 10, 
                showSizeChanger: true, 
                showTotal: (total) => `Total ${total} productos` }}/>
        </Card>
        <Modal
            title={editingSistema ? 'Editar producto' : 'Crear producto'}
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            onOk={form.submit}
            okText={editingSistema ? 'Actualizar' : 'Crear'}
            cancelText="Cancelar"
        >
            <Form form={form} onFinish={handleSubmit} layout="vertical">
                <Form.Item name="titulo" label="Título" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="descripcion" label="Descripción" rules={[{ required: true }]}>
                    <RichTextEditor />
                </Form.Item>
                <Form.Item name="link" label="Link" rules={[{ required: false }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="tipo" label="Tipo" rules={[{ required: true }]}>
                    <Select
                        placeholder="Selecciona un tipo"
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        filterOption={(input, option) =>
                            (option?.label || '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={Object.entries(tipos).map(([key, value]) => ({
                            key,
                            value,
                            label: value,
                        }))}
                    />
                </Form.Item>
                <Form.Item name="imagen" label="Imagen" rules={[{ required: false }]}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <UploadAcervo
                            bucket="portal"
                            folder="/sistemas"
                            label="Subir imagen"
                            onUploaded={(media) => {
                                form.setFieldValue('imagen', media.url);
                            }}
                        />
                        <Form.Item name="imagen" noStyle>
                            <Input placeholder="URL de la imagen" />
                        </Form.Item>
                        {form.getFieldValue('imagen') ? (
                            <Image src={form.getFieldValue('imagen')} alt="Imagen del sistema" style={{ maxWidth: 200, borderRadius: 6 }} />
                        ) : null}
                    </Space>
                </Form.Item>
                <TemaSelector
                    temas={subjects}
                    seleccionados={selectedSubjects}
                    onChange={(ids) => {                                    
                        setSelectedSubjects(ids);
                    }}
                />
                <Form.Item name="claves"
                    label="Palabras clave"
                    rules={[{ required: false, message: 'Por favor ingrese las palabras clave' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                        name="destacado"
                        label="Destacada"
                        valuePropName="checked"
                        rules={[{ required: false, message: 'Por favor seleccione si es destacada' }]}
                    >
                        <Checkbox>Destacada</Checkbox>
                    </Form.Item>
                    <Form.Item
                        name="orden"
                        label="Orden"
                        rules={[{ required: true, message: 'Por favor ingrese el orden' }]}
                    >
                        <Input type="number" />
                    </Form.Item>
            </Form>
        </Modal>
       </div>
    );
}
            