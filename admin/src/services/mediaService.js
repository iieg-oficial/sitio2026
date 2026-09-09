import api from './api';


const DB_NAME = 'CMS_MediaStorage';
const DB_VERSION = 1;
const STORE_NAME = 'media_files';

const DEFAULT_MAX_SIZE = 100 * 1024 * 1024; // 10 MB
const MEDIA_BASE_URL = (import.meta.env.VITE_MEDIA_BASE_URL || 'https://iieg.jalisco.gob.mx/acervo').replace(/\/+$/, '');

const ALLOWED_MIME_MAP = {
    'jpg':  { mime: 'image/jpeg',      bytes: [0xFF, 0xD8, 0xFF] },
    'jpeg': { mime: 'image/jpeg',      bytes: [0xFF, 0xD8, 0xFF] },
    'png':  { mime: 'image/png',       bytes: [0x89, 0x50, 0x4E, 0x47] },
    'gif':  { mime: 'image/gif',       bytes: [0x47, 0x49, 0x46, 0x38] },
    'pdf':  { mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] },
    'zip':  { mime: 'application/zip', bytes: [0x50, 0x4B, 0x03, 0x04] },
    'doc':  { mime: 'application/msword', bytes: [0xD0, 0xCF, 0x11, 0xE0] },
    'docx': { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', bytes: [0x50, 0x4B, 0x03, 0x04] },
    'xls':  { mime: 'application/vnd.ms-excel', bytes: [0xD0, 0xCF, 0x11, 0xE0] },
    'xlsx': { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', bytes: [0x50, 0x4B, 0x03, 0x04] },
    'xml':  { mime: 'application/xml', textFallback: true },
    'json': { mime: 'application/json', textFallback: true },
    'csv':  { mime: 'text/csv',        textFallback: true }
};

let dbInstance = null;

const sanitizeMediaFilename = (filename) => {
    const rawName = (filename || '').split(/[\\/]/).pop() || '';
    const extensionIndex = rawName.lastIndexOf('.');
    const baseName = extensionIndex > 0 ? rawName.slice(0, extensionIndex) : rawName;
    const extension = extensionIndex > 0 ? rawName.slice(extensionIndex + 1) : '';
    const normalizedBase = baseName
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]+/g, '-')
        .replace(/^[-._]+|[-._]+$/g, '')
        .toLowerCase() || 'archivo';
    const normalizedExtension = extension
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .toLowerCase();

    return normalizedExtension ? `${normalizedBase}.${normalizedExtension}` : normalizedBase;
};

export const buildMediaUrl = (filename, { bucket = 'portal', folder = '/' } = {}) => {
    const folderClean = sanitizeFolderPath(folder);
    const folderParts = String(folderClean || '/')
        .split('/')
        .filter(Boolean)
        .map((part) => encodeURIComponent(part));
    const pathParts = [encodeURIComponent(bucket), ...folderParts, encodeURIComponent(sanitizeMediaFilename(filename))];

    return `${MEDIA_BASE_URL}/${pathParts.join('/')}`;
};

export const sanitizeFolderPath = (folder) => {
  if (!folder || folder === '/') return '';

  let clean = String(folder).trim();

  // Normaliza separadores y quita espacios raross
  clean = clean.replace(/\\/g, '/');

  // Quita slashes al inicio/fin
  clean = clean.replace(/^\/+|\/+$/g, '');

  // Descompón por segmentos y filtra basura
  const segments = clean
    .split('/')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s !== '.' && s !== '..');

  // Sanitiza cada segmento: minúsculas, sin acentos, sin caracteres raros
  const safeSegments = segments.map((s) =>
    s
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
      .toLowerCase()
      .replace(/[^a-z0-9\-_.]/g, '-')
  );

  return safeSegments.join('/');
}

const initDB = () => {
    return new Promise((resolve, reject) => {
        if (dbInstance) {
            resolve(dbInstance);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            reject(new Error('Error al abrir IndexedDB'));
        };

        request.onsuccess = (event) => {
            dbInstance = event.target.result;
            resolve(dbInstance);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

const saveToIndexedDB = async (id, file) => {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = store.put({ id, file, timestamp: Date.now() });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Error al guardar en IndexedDB'));
        });
    } catch (error) {
        console.error('Error en IndexedDB:', error);
        throw error;
    }
};

const deleteFromIndexedDB = async (id) => {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Error al eliminar de IndexedDB'));
        });
    } catch (error) {
        console.error('Error en IndexedDB:', error);
        throw error;
    }
};

/**
 * Lee los primeros bytes del archivo para verificar su "firma digital" real (Magic Bytes)
 */
const readMagicBytes = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = (e) => {
            if (e.target.readyState === FileReader.DONE) {
                const uint = new Uint8Array(e.target.result);
                const bytes = [];
                uint.forEach((byte) => bytes.push(byte));
                resolve(bytes);
            } else {
                reject(new Error('No se pudo leer la cabecera del archivo'));
            }
        };
        // Leemos solo los primeros 8 bytes
        const blob = file.slice(0, 8);
        reader.readAsArrayBuffer(blob);
    });
};

/**
 * Valida tamaño, extensión y Magic Bytes del archivo.
 */
export const validateFileClientSecurity = async (file, maxSize = DEFAULT_MAX_SIZE) => {
    // 1. Validar Tamaño
    if (file.size > maxSize) {
        throw new Error(`El archivo excede el tamaño máximo permitido de ${formatFileSize(maxSize)}.`);
    }

    // 2. Extraer extensión del nombre
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_MIME_MAP[extension]) {
        throw new Error(`La extensión .${extension} no está permitida.`);
    }

    const expectedConfig = ALLOWED_MIME_MAP[extension];

    // 3. Validar Magic Bytes
    const fileBytes = await readMagicBytes(file);
    const isValidSignature = expectedConfig.bytes.every((byte, index) => fileBytes[index] === byte);

    if (!isValidSignature) {
        throw new Error(`El contenido del archivo no coincide con una firma válida de tipo .${extension}`);
    }

    return true;
};
/**
 * Lee los primeros bytes del archivo para verificar su "firma digital" real (Magic Bytes)
 */
const readMagicBytes = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = (e) => {
            if (e.target.readyState === FileReader.DONE) {
                const uint = new Uint8Array(e.target.result);
                const bytes = [];
                uint.forEach((byte) => bytes.push(byte));
                resolve(bytes);
            } else {
                reject(new Error('No se pudo leer la cabecera del archivo'));
            }
        };
        // Leemos solo los primeros 8 bytes
        const blob = file.slice(0, 8);
        reader.readAsArrayBuffer(blob);
    });
};

/**
 * Valida tamaño, extensión y Magic Bytes del archivo.
 */
export const validateFileClientSecurity = async (file, maxSize = DEFAULT_MAX_SIZE) => {
    // 1. Validar Tamaño
    if (file.size > maxSize) {
        throw new Error(`El archivo excede el tamaño máximo permitido de ${formatFileSize(maxSize)}.`);
    }

    // 2. Extraer extensión del nombre
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_MIME_MAP[extension]) {
        throw new Error(`La extensión .${extension} no está permitida.`);
    }

    const expectedConfig = ALLOWED_MIME_MAP[extension];

    // 3. Validar Magic Bytes
    const fileBytes = await readMagicBytes(file);
    const isValidSignature = expectedConfig.bytes.every((byte, index) => fileBytes[index] === byte);

    if (!isValidSignature) {
        throw new Error(`El contenido del archivo no coincide con una firma válida de tipo .${extension}`);
    }

    return true;
};

export const getMediaFiles = async (filters = {}) => {
    try {
        const params = new URLSearchParams();

        if (filters.folder) params.append('folder', filters.folder);
        if (filters.type) params.append('type', filters.type);
        if (filters.search) params.append('search', filters.search);
        if (filters.bucket) params.append('bucket', filters.bucket);

        const response = await api.get(`/multimedia?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching media files:', error);
        throw error;
    }
};

export const getMediaFile = async (id) => {
    try {
        const response = await api.get(`/multimedia/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching media file:', error);
        throw error;
    }
};

export const uploadMediaFile = async (file, options = {}) => {
    try {
        const maxSize = options.maxSize || DEFAULT_MAX_SIZE;
        await validateFileClientSecurity(file, maxSize);

        const maxSize = options.maxSize || DEFAULT_MAX_SIZE;
        await validateFileClientSecurity(file, maxSize);

        const formData = new FormData();
        formData.append('file', file);

        const folderClean = sanitizeFolderPath(options.folder);

        if (folderClean) {
            formData.append('folder', folderClean);
        }

        if (options.alt) {
            formData.append('alt', options.alt);
        }

        if (options.bucket) {
            formData.append('bucket', options.bucket);
        }

        const response = await api.post('/multimedia', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (options.onProgress) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    options.onProgress(percentCompleted);
                }
            }
        });

        if (response.data && response.data.id) {
            await saveToIndexedDB(response.data.id, file);
        }

        return response.data;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

export const uploadMultipleFiles = async (files, options = {}) => {
    try {
        const uploadPromises = files.map(file =>
            uploadMediaFile(file, {
                ...options,
                onProgress: (percent) => {
                    if (options.onProgress) {
                        options.onProgress(file.name, percent);
                    }
                }
            })
        );

        const results = await Promise.allSettled(uploadPromises);

        const successful = results
            .filter(r => r.status === 'fulfilled')
            .map(r => r.value);

        const failed = results
            .filter(r => r.status === 'rejected')
            .map(r => r.reason);

        return { successful, failed };
    } catch (error) {
        console.error('Error uploading multiple files:', error);
        throw error;
    }
};

export const updateMediaFile = async (id, updates) => {
    try {
        const response = await api.put(`/multimedia/${id}`, updates);
        return response.data;
    } catch (error) {
        console.error('Error updating media file:', error);
        throw error;
    }
};

export const deleteMediaFile = async (id, bucket) => {
    try {
        const params = bucket ? `?bucket=${encodeURIComponent(bucket)}` : '';
        await api.delete(`/multimedia/${encodeURIComponent(id)}${params}`);

        await deleteFromIndexedDB(id);

        return true;
    } catch (error) {
        console.error('Error deleting media file:', error);
        throw error;
    }
};

export const deleteMultipleFiles = async (ids, bucket) => {
    try {
        const deletePromises = ids.map(id => deleteMediaFile(id, bucket));
        await Promise.all(deletePromises);
        return true;
    } catch (error) {
        console.error('Error deleting multiple files:', error);
        throw error;
    }
};


export const getFolders = async () => {
    try {
        const response = await api.get('/multimedia/carpetas');
        return response.data;
    } catch (error) {
        console.error('Error fetching folders:', error);
        throw error;
    }
};

export const createFolder = async (name, parent = null) => {
    try {
        const response = await api.post('/multimedia/carpetas', { name, parent });
        return response.data;
    } catch (error) {
        console.error('Error creating folder:', error);
        throw error;
    }
};

export const deleteFolder = async (id) => {
    try {
        await api.delete(`/multimedia/carpetas/${id}`);
        return true;
    } catch (error) {
        console.error('Error deleting folder:', error);
        throw error;
    }
};


export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const getFileIcon = (type) => {
    if (type.startsWith('image/')) return 'FileImageOutlined';
    if (type === 'application/pdf') return 'FilePdfOutlined';
    if (type.startsWith('video/')) return 'VideoCameraOutlined';
    if (type.startsWith('audio/')) return 'AudioOutlined';
    if (type.includes('word')) return 'FileWordOutlined';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'FileExcelOutlined';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'FilePptOutlined';
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return 'FileZipOutlined';
    return 'FileOutlined';
};

export const validateFileType = (file, allowedTypes = []) => {
    if (allowedTypes.length === 0) return true;

    return allowedTypes.some(type => {
        if (type.endsWith('/*')) {
            const baseType = type.split('/')[0];
            return file.type.startsWith(baseType + '/');
        }
        return file.type === type;
    });
};

export const validateFileSize = (file, maxSize) => {
    return file.size <= maxSize;
};

export const generatePreview = (file) => {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error('El archivo no es una imagen'));
            return;
        }

        const reader = new FileReader();

        reader.onloadend = () => {
            resolve(reader.result);
        };

        reader.onerror = () => {
            reject(new Error('Error al leer el archivo'));
        };

        reader.readAsDataURL(file);
    });
};

export const getImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error('El archivo no es una imagen'));
            return;
        }

        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({
                width: img.width,
                height: img.height
            });
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Error al cargar la imagen'));
        };

        img.src = url;
    });
};

export default {
    getMediaFiles,
    getMediaFile,
    uploadMediaFile,
    uploadMultipleFiles,
    updateMediaFile,
    deleteMediaFile,
    deleteMultipleFiles,
    getFolders,
    createFolder,
    deleteFolder,
    buildMediaUrl,
    sanitizeFolderPath,
    formatFileSize,
    getFileIcon,
    validateFileType,
    validateFileSize,
    generatePreview,
    getImageDimensions
};
