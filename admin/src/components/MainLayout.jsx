import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Typography, Badge } from 'antd';
import {
    MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined,
    TeamOutlined, LogoutOutlined,
    MenuOutlined,
    FileImageOutlined,
    LockOutlined,
    AuditOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { useAuth } from '@contexts/AuthContext';
import api from '@services/api';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function MainLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        if (user?.role !== 'tetlamamakani') return;
        api.get('/borradores/pendientes')
            .then(r => setPendingCount(r.data.length))
            .catch(() => {});
    }, [user]);

    const menuItems = [];

    if (user?.role === 'tetlamamakani') {
        menuItems.push({
            key: '/users',
            icon: <TeamOutlined />,
            label: 'Usuarios',
            onClick: () => navigate('/users')
        });
        menuItems.push({
            key: '/revision',
            icon: <AuditOutlined />,
            label: pendingCount > 0
                ? <span>Revisiones <Badge count={pendingCount} size="small" /></span>
                : 'Revisiones',
            onClick: () => navigate('/revision')
        });

        menuItems.push({
            key: '/paginas',
            icon: <MenuOutlined />,
            label: 'Páginas',
            onClick: () => navigate('/paginas')
        });
    }

    if (user?.role === 'tetlamamakani' || user?.role === 'editora') {

        menuItems.push({
            key: '/media',
            icon: <FileImageOutlined />,
            label: 'Media',
            onClick: () => navigate('/media')
        });
        menuItems.push({
            key: '/menu',
            icon: <MenuOutlined />,
            label: 'Menú',
            onClick: () => navigate('/menu')
        });

         menuItems.push({
            key: '/catalogos',
            icon: <MenuOutlined />,
            label: 'Catálogos',
            children: [
                {
                    key: '/subjects',
                    icon: <MenuOutlined />,
                    label: 'Temas',
                    onClick: () => navigate('/subjects')
                },
                {
                    key: '/profesores',
                    icon: <MenuOutlined />,
                    label: 'Profesores',
                    onClick: () => navigate('/profesores')
                },
                {
                    key: '/instituciones',
                    icon: <MenuOutlined />,
                    label: 'Instituciones',
                    onClick: () => navigate('/instituciones')
                },
                {
                    key: '/modulos',
                    icon: <MenuOutlined />,
                    label: 'Módulos',
                    onClick: () => navigate('/modulos')
                },
                {
                    key: '/perfiles',
                    icon: <MenuOutlined />,
                    label: 'Perfiles',
                    onClick: () => navigate('/perfiles')
                },
                {
                    key: '/proyectos',
                    icon: <MenuOutlined />,
                    label: 'Proyectos',
                    onClick: () => navigate('/proyectos')
                },
            ],         
        });

        menuItems.push({
            key: '/conocenos',
            icon: <MenuOutlined />,
            label: 'Conocenos',
            children: [
                {
                    key: '/docs_iieg',
                    icon: <MenuOutlined />,
                    label: 'Documentos IIEG',
                    onClick: () => navigate('/docs_iieg')
                },
                {
                    key: '/organigrama',
                    icon: <MenuOutlined />,
                    label: 'Organigrama',
                    children:[
                        {
                            key: '/directorio',
                            icon: <MenuOutlined />,
                            label: 'Directorio',
                            onClick: () => navigate('/directorio')
                        }
                    ],
                },
                {
                    key: '/organos_m',
                    icon: <MenuOutlined />,
                    label: 'Organos',
                    children:[
                        {
                            key: '/organos',
                            icon: <MenuOutlined />,
                            label: 'Organos',
                            onClick: () => navigate('/organos')
                        }
                    ],
                },
                {
                    key: '/archivos',
                    icon: <MenuOutlined />,
                    label: 'Archivos',
                    onClick: () => navigate('/archivos')
                },
                {
                    key: '/snieg',
                    icon: <MenuOutlined />,
                    label: 'Snieg / CEIEG',
                    onClick: () => navigate('/snieg')
                },
                {
                    key: '/preguntas',
                    icon: <MenuOutlined />,
                    label: 'Preguntas',
                    onClick: () => navigate('/preguntas')
                }
                
            ],
        });

        menuItems.push({
            key: '/sistemas_i',
            icon: <MenuOutlined />,
            label: 'Sistemas',
            onClick: () => navigate('/sistemas')
        });

        menuItems.push({
            key: '/datos-abiertos',
            icon: <MenuOutlined />,
            label: 'Datos Abiertos',
            children: [
                {
                    key: '/datos-nuevos',
                    icon: <MenuOutlined />,
                    label: 'Datos Nuevos',
                    onClick: () => navigate('/datos-nuevos')
                },
                {
                    key: '/flashes',
                    icon: <MenuOutlined />,
                    label: 'Flashes',
                    onClick: () => navigate('/flashes')
                },
                {
                    key: '/reportes',
                    icon: <MenuOutlined />,
                    label: 'Reportes',
                    onClick: () => navigate('/reportes')
                },
                {
                    key: '/documentacion',
                    icon: <MenuOutlined />,
                    label: 'Documentación',
                    onClick: () => navigate('/documentacion')
                }
            ],
        });

        menuItems.push({
            key: '/comunidad',
            icon: <MenuOutlined />,
            label: 'Comunidad',
            children: [
                {
                    key: '/posts',
                    icon: <MenuOutlined />,
                    label: 'Posts',
                    onClick: () => navigate('/posts')
                },
                {
                    key: '/cursos',
                    icon: <MenuOutlined />,
                    label: 'Cursos',
                    onClick: () => navigate('/cursos')
                }
            ],
        });


        menuItems.push({
            key: '/mapas',
            icon: <MenuOutlined />,
            label: 'Mapas',
            onClick: () => navigate('/mapas')
        });

        menuItems.push({
            key: '/banners',
            icon: <MenuOutlined />,
            label: 'Banners',
            onClick: () => navigate('/banners')
        });

        menuItems.push({
            key: '/cuadernillos',
            icon: <MenuOutlined />,
            label: 'Cuadernillos',
            onClick: () => navigate('/cuadernillos')
        });

    }

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Perfil'
        },
        {
            key: 'change-password',
            icon: <LockOutlined />,
            label: 'Cambiar Contraseña',
            onClick: () => navigate('/change-password')
        },
        {
            type: 'divider'
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Cerrar Sesión',
            onClick: handleLogout
        }
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: collapsed ? 16 : 20,
                    fontWeight: 'bold'
                }}>
                    {collapsed ? 'CMS' : 'CMS Portal'}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                />
            </Sider>
            <Layout>
                <Header style={{
                    padding: '0 24px',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 4px rgba(0,21,41,.08)'
                }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: 16, width: 64, height: 64 }}
                    />
                    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <Text style={{ marginRight: 8 }}>{user?.name}</Text>
                            <Avatar icon={<UserOutlined />} />
                        </div>
                    </Dropdown>
                </Header>
                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}
