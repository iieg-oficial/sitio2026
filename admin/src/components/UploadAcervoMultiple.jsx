import { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import mediaService from '@services/mediaService';

function UploadAcervoMultiple({ onUploaded, bucket = 'portal', folder = '/' , label = 'Subir Archivos' }) {

    const [uploading, setUploading] = useState(false);

    const handleBeforeUpload = (file, fileList) => {
        if (file === fileList[fileList.length - 1]) {
        uploadBatch(fileList);
        }
        return false; // evita que antd intente subir cada archivo individualmente
    };

    const uploadBatch = async (files) => {
        setUploading(true);
        try {
            const result = await mediaService.uploadMultipleFiles(files, { bucket, folder });

            const exitosos = result?.successful ?? [];
            const fallidos = result?.failed ?? [];

            const urls = exitosos.map((item) => item.url);

            if (urls.length > 0) {
            message.success(`${urls.length} archivo(s) subido(s)`);
            onUploaded?.(urls);
            }

            if (fallidos.length > 0) {
            message.error(`${fallidos.length} archivo(s) fallaron al subir`);
            }
        } catch (error) {
            message.error('Error al subir archivos');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Upload multiple beforeUpload={handleBeforeUpload} showUploadList={false}>
        <Button icon={<UploadOutlined />} loading={uploading}>{label}</Button>
        </Upload>
    );
}

export { UploadAcervoMultiple };
export default UploadAcervoMultiple;