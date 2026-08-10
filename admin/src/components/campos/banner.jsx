import { Form, Image, Input, Space } from 'antd';
import ColorPickerField from './ColorPickerField';
import { UploadAcervo } from '@components/UploadAcervo';


export const CamposBannerFull = () => {
    const form = Form.useFormInstance();
    const imagenDesktop = Form.useWatch('imagen_desktop', form);
    const imagenMobile = Form.useWatch('imagen_mobile', form);
    

    return (
        <>
            <Form.Item label="Imagen Desktop" required={false}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <UploadAcervo
                        bucket="portal"
                        folder="/banners/"
                        label="Subir imagen desktop"
                        apiKey={import.meta.env.ACERVO_API_KEY} // Ejemplo de uso de la variable como prop
                        onUploaded={(media) => {
                            form.setFieldValue('imagen_desktop', media.url);
                        }}
                    />
                    <Form.Item name="imagen_desktop" noStyle>
                        <Input placeholder="URL imagen desktop" />
                    </Form.Item>
                    {imagenDesktop ? (
                        <Image
                            src={imagenDesktop}
                            alt="Vista previa desktop"
                            style={{ maxWidth: 260, borderRadius: 6 }}
                        />
                    ) : null}
                </Space>
            </Form.Item>

            <Form.Item label="Imagen Mobile" required={false}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <UploadAcervo
                        bucket="portal"
                        folder="/banners"
                        label="Subir imagen mobile"
                        apiKey={import.meta.env.ACERVO_API_KEY} // Ejemplo de uso de la variable como prop
                        onUploaded={(media) => {
                            form.setFieldValue('imagen_mobile', media.url);
                        }}
                    />
                    <Form.Item name="imagen_mobile" noStyle>
                        <Input placeholder="URL imagen mobile" />
                    </Form.Item>
                    {imagenMobile ? (
                        <Image
                            src={imagenMobile}
                            alt="Vista previa mobile"
                            style={{ maxWidth: 260, borderRadius: 6 }}
                        />
                    ) : null}
                </Space>
            </Form.Item>
        </>
    );
};

export const CamposBannerMin = () => {
    const form = Form.useFormInstance();
    const imagen = Form.useWatch('imagen', form);

    return (
        <>
            <Form.Item name="color_fondo" label="Color de Fondo" initialValue="#8936ab" rules={[{ required: false }]}>
                <ColorPickerField name="color_fondo" />
            </Form.Item>
            <Form.Item name="imagen" label="Imagen" rules={[{ required: false }]}>            
                <Space direction="vertical" style={{ width: '100%' }}>
                        <UploadAcervo
                            bucket="portal"
                            folder="/banners"
                            label="Subir imagen "                            
                            onUploaded={(media) => {
                                form.setFieldValue('imagen', media.url);
                            }}
                        />
                        <Form.Item name="imagen" noStyle>
                            <Input placeholder="URL imagen" />
                        </Form.Item>
                        {imagen ? (
                            <Image
                                src={imagen}
                                alt="Vista previa imagen"
                                style={{ maxWidth: 260, borderRadius: 6 }}
                            />
                        ) : null}
                    </Space>
            </Form.Item>
        </>
    );
};   