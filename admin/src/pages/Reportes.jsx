import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import { TemaSelector } from '@components/pageComponents/SubjectSelector';
import { UploadAcervo } from '@components/UploadAcervo';
import { useDebouncedSearch, TableSearch } from '@components/common/TableSearch';
const { Title } = Typography;

export default function Reportes() {
    const [reportes, setReportes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingReporte, setEditingReporte] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [periocidad, setPeriocidad] = useState([]);
    const [meses, setMeses] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const watchMes = Form.useWatch('mes', form);
    const watchAnyo = Form.useWatch('anyo', form);
    const MESES_MAP = {
        enero: '01', febrero: '02', marzo: '03', abril: '04',
        mayo: '05', junio: '06', julio: '07', agosto: '08',
        septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
    };

    useEffect(() => {
        fetchSubjects();
        fetchPeriocidad();
        fetchMeses();
        fetchReportes();
    }, []);

    const getDynamicFolder = () => {
        let folderPath = '/reportes';
        if (watchAnyo) folderPath += `/${watchAnyo}`;
        if (watchMes) {
            const mesNumero = MESES_MAP[watchMes.toLowerCase()];
            if (mesNumero) folderPath += `/${mesNumero}`;
        }
        return folderPath;
    };

    const fetchSubjects = async () => {
        try {
            const response = await api.get('/subject/tree');
            setSubjects(response.data);
        } catch {
            message.error('Error al cargar temas');
        }
    };

    const fetchReportes = async (search = '', page = pagination.current, pageSize = pagination.pageSize) => {
        setLoading(true);
        try {
            const response = await api.get('/reportes', {
                params: {
                    ...(search ? { search } : {}),
                    page,
                    pageSize
                }
            });
            setReportes(response.data.reportes);
            setPagination((prev) => ({
                ...prev,
                current: page,
                pageSize,
                total: response.data.total
            }));
        } catch {
            message.error('Error al cargar reportes');
        } finally {
            setLoading(false);
        }
    };

    const { searchText, setSearchText } = useDebouncedSearch((text) => {
        fetchReportes(text, 1, pagination.pageSize);
    });

    const handleTableChange = (newPagination) => {
        fetchReportes(searchText, newPagination.current, newPagination.pageSize);
    };

    const fetchPeriocidad = async () => {
        try {
            const response = await api.get('/reportes/periocidad');
            setPeriocidad(response.data.periocidad || {});
        } catch (error) {
            message.error('Error al cargar periocidad');
            console.log(error);
        }
    };

    const fetchMeses = async () => {
        try {
            const response = await api.get('/reportes/meses');
            setMeses(response.data.meses || {});
        } catch {
            message.error('Error al cargar meses');
        }
    };

    const handleCreate = () => {
        setEditingReporte(null);
        setSelectedSubjects([]);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingReporte(record);
        const ids = (record.temas ?? []).map((t) => t.id);
        setSelectedSubjects(ids);

        let preMes = record.mes;
        let preAnyo = record.anyo;

        if (record.fecha && (!preMes || !preAnyo)) {
            const parts = record.fecha.split('T')[0].split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                if (!preAnyo) preAnyo = year;
                if (!preMes && month >= 1 && month <= 12) {
                    const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
                    preMes = monthNames[month - 1];
                }
            }
        }

        form.setFieldsValue({
            ...record,
            fecha: record.fecha ? record.fecha.slice(0, 10) : undefined,
            periocidad: record.periocidad,
            mes: preMes,
            anyo: preAnyo,
        });
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar este reporte?',
            content: `Se eliminará el reporte: ${record.titulo}`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await api.delete(`/reportes/${record.id}`);
                    message.success('Reporte eliminado exitosamente');
                    fetchReportes(searchText, pagination.current, pagination.pageSize);
                } catch {
                    message.error('Error al eliminar reporte');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            const payload = { ...values, tema_ids: selectedSubjects };
            if (editingReporte) {
                await api.patch(`/reportes/${editingReporte.id}`, payload);
                message.success('Reporte actualizado exitosamente');
            } else {
                await api.post('/reportes/create', payload);
                message.success('Reporte creado exitosamente');
            }
            setModalVisible(false);
            fetchReportes(searchText, pagination.current, pagination.pageSize);
        } catch {
            message.error(editingReporte ? 'Error al actualizar reporte' : 'Error al crear reporte');
        }
    };

    const columns = [
        { title: 'Titulo', dataIndex: 'titulo', key: 'titulo' },
        {
            title: 'Tema',
            dataIndex: 'temas',
            key: 'temas',
            render: (temas) => temas.map((t) => t.titulo).join(', ')
        },
        {
            title: 'Fecha',
            dataIndex: 'fecha',
            key: 'fecha',
            render: (date) => new Date(date).toLocaleDateString('es-MX')
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Editar</Button>
                    <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>Eliminar</Button>
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Administración de Reportes</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>Nuevo Reporte</Button>
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
                    dataSource={reportes}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} reportes`
                    }}
                    onChange={handleTableChange}
                />
            </Card>

            <Modal
                title={editingReporte ? 'Editar Reporte' : 'Nuevo Reporte'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                okText={editingReporte ? 'Actualizar' : 'Crear'}
                cancelText="Cancelar"
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="titulo" label="Titulo" rules={[{ required: true, message: 'Por favor ingrese el titulo' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="fecha" label="Fecha de publicación" rules={[{ required: false }]}>
                        <Input type="date" />
                    </Form.Item>
                    <TemaSelector
                        temas={subjects}
                        seleccionados={selectedSubjects}
                        onChange={(ids) => setSelectedSubjects(ids)}
                    />
                    <Form.Item name="periocidad" label="Periocidad" rules={[{ required: false }]}>
                        <Select
                            placeholder="Selecciona la periocidad"
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            filterOption={(input, option) => (option?.label || '').toLowerCase().includes(input.toLowerCase())}
                            options={Object.entries(periocidad).map(([key, value]) => ({ value: key, label: value }))}
                        />
                    </Form.Item>
                    <Form.Item name="mes" label="Mes" rules={[{ required: true, message: 'Por favor ingresa el mes' }]}>
                        <Select
                            placeholder="Selecciona el mes"
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            filterOption={(input, option) => (option?.label || '').toLowerCase().includes(input.toLowerCase())}
                            options={Object.entries(meses).map(([key, value]) => ({ value: key, label: value }))}
                        />
                    </Form.Item>
                    <Form.Item name="anyo" label="Año" rules={[{ required: true, message: 'Por favor ingresa el año' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="archivo" label="Archivo" rules={[{ required: true, message: 'Por favor ingrese el archivo' }]}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <UploadAcervo
                                bucket="portal"
                                folder={getDynamicFolder()}
                                label="Subir archivo"
                                onUploaded={(media) => form.setFieldValue('archivo', media.url)}
                            />
                            <Form.Item name="archivo" noStyle>
                                <Input placeholder="Subir archivo" />
                            </Form.Item>
                            {form.getFieldValue('archivo') ? (
                                <a href={form.getFieldValue('archivo')} target="_blank" rel="noopener noreferrer">Ver archivo</a>
                            ) : null}
                        </Space>
                    </Form.Item>
                    <Form.Item name="claves" label="Palabras clave" rules={[{ required: false }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}