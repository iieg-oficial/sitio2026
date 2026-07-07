import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';
import { CamposCapacitaciones, CamposConvocatorias, CamposComunes } from '@components/campos/cursos';
import { TemaSelector } from '@components/pageComponents/SubjectSelector';


const { Title } = Typography;
const { Option } = Select;

export default function Cursos() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCurso, setEditingCurso] = useState(null);
  const [instituciones, setInstituciones] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [temas, setTemas] = useState([]);
  const [selectedTemas, setSelectedTemas] = useState([]);
  const [tipoCurso, setTipoCurso] = useState(null);

  useEffect(() => {
    fetchCursos();
    fetchInstituciones();
    fetchModulos();
    fetchProfesores();
    fetchPerfiles();
    fetchTemas();
  }, []);

  const fetchCursos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cursos');
      setCursos(response.data.cursos);
    } catch (error) {
      console.error('Error al obtener cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstituciones = async () => {
    try {
      const response = await api.get('/instituciones');
      setInstituciones(response.data.instituciones);
    } catch (error) {
      console.error('Error al obtener instituciones:', error);
    }
  };

  const fetchModulos = async () => {
    try {
      const response = await api.get('/modulos');
      setModulos(response.data.modulos);
    } catch (error) {
      console.error('Error al obtener modulos:', error);
    }
  };

  const fetchProfesores = async () => {
    try {
      const response = await api.get('/profesores');
      setProfesores(response.data.profesores);
    } catch (error) {
      console.error('Error al obtener profesores:', error);
    }
  };

  const fetchPerfiles = async () => {
    try {
      const response = await api.get('/perfiles');
      setPerfiles(response.data.perfiles);
    } catch (error) {
      console.error('Error al obtener perfiles:', error);
    }
  };

  const fetchTemas = async () => {
    try {
      const response = await api.get('/subject/tree');
      setTemas(response.data);
    } catch (error) {
      console.error('Error al obtener temas:', error);
    }
  };

  const handleCreate = () => {
    setEditingCurso(null);
    setSelectedTemas([]);
    setTipoCurso(null);    
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCurso(record);
    const formValues = {
      ...record,
      inicio: record.inicio ? record.inicio.split('T')[0] : '',
      modulos: record.modulos ? record.modulos.map(m => m.id) : [],
      instituciones: record.instituciones ? record.instituciones.map(i => i.id) : [],
      perfiles: record.perfiles ? record.perfiles.map(p => p.id) : [],
      profesores: record.profesores ? record.profesores.map(p => p.id) : [],
      destacado: !!record.destacado,
      tipo_curso: record.tipo_curso,
    };
    setSelectedTemas(record.temas ? record.temas.map(t => t.id) : []);
    setTipoCurso(record.tipo_curso || null);
    form.setFieldsValue(formValues);
    setModalVisible(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: '¿Está seguro de eliminar este curso?',
      content: `Se eliminará el curso: ${record.titulo}`,
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await api.delete(`/cursos/${record.id}`);
          message.success('Curso eliminado exitosamente');
          fetchCursos();
        } catch (error) {
          console.error('Error al eliminar curso:', error);
          message.error('Error al eliminar curso');
        }
      }
    });
  };

  const handleSubmit = async (values) => {
    try {
      const payload = { ...values, tema_ids: selectedTemas };      
      if (editingCurso) {
        await api.put(`/cursos/${editingCurso.id}`, payload);
        message.success('Curso actualizado exitosamente');
      } else {
        await api.post('/cursos/create', payload);
        message.success('Curso creado exitosamente');
      }
      setModalVisible(false);
      fetchCursos();
    } catch (error) {
      message.error(editingCurso ? 'Error al actualizar curso' : 'Error al crear curso');
    }
  };

  const SECCIONES = {
    capacitacion: <CamposCapacitaciones modulos={modulos} profesores={profesores} />,
    convocatoria: <CamposConvocatorias instituciones={instituciones} perfiles={perfiles} />,
    comun: <CamposComunes form={form} />
  };

  const tipoCursoValue = form.getFieldValue('tipo_curso') || tipoCurso;

  const columns = [
    {
      title: 'Titulo',
      dataIndex: 'titulo',
      key: 'titulo',
      sorter: (a, b) => a.titulo.localeCompare(b.titulo)
    },
    {
      title: 'Tipo de curso',
      dataIndex: 'tipo_curso',
      key: 'tipo_curso',
      sorter: (a, b) => a.tipo_curso.localeCompare(b.tipo_curso)
    },
    {
      title: 'Fecha de inicio',
      dataIndex: 'inicio',
      key: 'inicio',
      render: (date) => new Date(date).toLocaleDateString('es-MX'),
      sorter: (a, b) => a.inicio.localeCompare(b.inicio)
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Editar
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Eliminar
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Administración de Cursos</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Nuevo Curso
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={cursos}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} cursos`
          }}
        />
      </Card>

      <Modal
        title={editingCurso ? 'Editar Curso' : 'Nuevo Curso'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText={editingCurso ? 'Actualizar' : 'Crear'}
        cancelText="Cancelar"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={(changedValues) => {
            if (changedValues.tipo_curso !== undefined) {
              setTipoCurso(changedValues.tipo_curso);
            }
          }}
        >

          {SECCIONES["comun"]}

          <Form.Item
            name="tipo_curso"
            label="Tipo de curso"
            rules={[{ required: true, message: 'Por favor seleccione un tipo de curso' }]}
          >
            <Select
              placeholder="Seleccione un tipo de curso"
              value={tipoCurso}
              onChange={(value) => setTipoCurso(value)}
            >
              <Option key="capacitacion" value="capacitacion">Capacitación</Option>
              <Option key="convocatoria" value="convocatoria">Convocatoria</Option>
            </Select>
          </Form.Item>

          {SECCIONES[tipoCursoValue] ?? null}

          <Form.Item
            name="vigencia"
            label="Vigencia"
            rules={[{ required: true, message: 'Por favor seleccione una vigencia' }]}
        >
            <Input />
        </Form.Item>

          <Form.Item
            name="contacto"
            label="Contacto"
            rules={[{ required: true, message: 'Por favor seleccione un contacto' }]}
          >
            <Input />
          </Form.Item>
        
          <TemaSelector
              temas={temas}
              seleccionados={selectedTemas}
              onChange={(ids) => setSelectedTemas(ids)}
          />

        </Form>
      </Modal>
    </div>
  );
}