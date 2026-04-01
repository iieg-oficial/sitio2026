import { useState, useEffect } from 'react';
import { Card, Typography, Space, Button, Form, Input, message, Select, Upload, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import api from '@services/api';

const { Title } = Typography;

export default function Configuracion() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [configuracion, setConfiguracion] = useState(null);

    useEffect(() => {
        fetchConfiguracion();
    }, []);

    const fetchConfiguracion = async () => {
        setLoading(true);
        try {
            const response = await api.get('/configuracion');
            setConfiguracion(response.data);
            form.setFieldsValue(response.data);
        } catch {
            message.error('Error al cargar configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            if (configuracion) {
                await api.put(`/configuracion/${configuracion.id}`, values);
                message.success('Configuración actualizada exitosamente');
            } else {
                await api.post('/configuracion/create', values);
                message.success('Configuración creada exitosamente');
            }
            fetchConfiguracion();
        } catch {
            message.error(configuracion ? 'Error al actualizar configuración' : 'Error al crear configuración');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Configuración</Title>
            </div>

            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={configuracion}
                >
                    <Form.Item
                        name="nombre"
                        label="Nombre"
                        rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="logo"
                        label="Logo"
                        rules={[{ required: true, message: 'Por favor ingrese el logo' }]}
                    >
                        <Upload maxCount={1} beforeUpload={() => false}>
                            <Button icon={<UploadOutlined />}>Seleccionar imagen</Button>
                        </Upload>
                    </Form.Item>

                    <Divider orientation="left" plain>
                        Redes Sociales
                    </Divider>
                    <Form.Item
                        name="facebook"
                        label="Facebook"
                        rules={[{ required: true, message: 'Por favor ingrese el facebook' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="twitter"
                        label="Twitter"
                        rules={[{ required: true, message: 'Por favor ingrese el twitter' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="instagram"
                        label="Instagram"
                        rules={[{ required: true, message: 'Por favor ingrese el instagram' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="youtube"
                        label="Youtube"
                        rules={[{ required: true, message: 'Por favor ingrese el youtube' }]}
                    >
                        <Input />
                    </Form.Item>


                    <Divider orientation="left" plain>
                        Transparencia
                    </Divider>
                    <Form.Item
                        name="transparencia_url"
                        label="URL de Transparencia"
                        rules={[{ required: true, message: 'Por favor ingrese la URL de transparencia' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="transparencia_img"
                        label="Imagen de Transparencia"
                        rules={[{ required: true, message: 'Por favor ingrese la imagen de transparencia' }]}
                    >
                        <Upload maxCount={1} beforeUpload={() => false}>
                            <Button icon={<UploadOutlined />}>Seleccionar imagen</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Guardar
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}