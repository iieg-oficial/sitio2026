import { Form, Input } from 'antd';
import ColorPickerField from './ColorPickerField';


export const CamposBannerFull = () => (
    <>
        <Form.Item name="imagen_desktop" label="Imagen Desktop" rules={[{ required: false }]}>
            <Input />
        </Form.Item>
        <Form.Item name="imagen_mobile" label="Imagen Mobile" rules={[{ required: false }]}>
            <Input />
        </Form.Item>
    </>
);

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
        