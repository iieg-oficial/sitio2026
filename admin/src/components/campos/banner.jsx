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
                        folder="/banners"
                        label="Subir imagen desktop"
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

export const CamposBannerMin = () => (
    <>
        <Form.Item name="color_fondo" label="Color de Fondo" rules={[{ required: false }]}>
            <ColorPickerField name="color_fondo" />
        </Form.Item>
        <Form.Item name="imagen" label="Imagen" rules={[{ required: false }]}>
            <Input />
        </Form.Item>
    </>
);
        