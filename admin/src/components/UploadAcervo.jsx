import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import mediaService from '@services/mediaService';

function UploadAcervo({ onUploaded, bucket = 'portal', folder = '/' , label = 'Subir Archivo' }) {
    
    const handleUpload = async ({ file, onSuccess, onError, onProgress }) => {
        try {
            const result = await mediaService.uploadMediaFile(file, {
                bucket,
                folder,
                onProgress: (percent) => onProgress({ percent }),
            });
            onSuccess(result);
            message.success(`${file.name} subido`);
            onUploaded?.(result);
        } catch (error) {
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
export default UploadAcervo;