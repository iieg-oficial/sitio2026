import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import mediaService from '@services/mediaService';

function UploadAcervo({ onUploaded, bucket = 'portal', folder = '/' , label = 'Subir Archivo' }) {
    
    const handleUpload = async ({ file, onSuccess, onError, onProgress }) => {
        const expectedUrl = mediaService.buildMediaUrl(file.name, { bucket, folder });
        console.info('[Acervo] URL esperada:', expectedUrl);

        try {
            const result = await mediaService.uploadMediaFile(file, {
                bucket,
                folder,
                onProgress: (percent) => onProgress({ percent }),
            });
            console.log(result);
            onSuccess(result);
            message.success(`${file.name} subido`);
            onUploaded?.(result);
        } catch (error) {
            console.error('[Acervo] No se pudo subir el archivo.', {
                error,
                expectedUrl,
            });
            onError(error);
            message.error(`Error al subir ${file.name}`);
        }
    };

    return (
        <Upload customRequest={handleUpload} showUploadList={false}>
            <Button icon={<UploadOutlined />}>{ label }</Button>
        </Upload>
    );
}

export { UploadAcervo };