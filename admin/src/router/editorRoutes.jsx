import MenuManager from '../pages/MenuManager';
import PageEditor from '../pages/PageEditor';
import Media from '../pages/Media';
import Posts from '../pages/Posts';
import Subject from '../pages/Subject';
import DatosNuevos from '../pages/DatosNuevos';
import Flashes from '../pages/Flashes';
import Mapas from '../pages/Mapas';
import Directorio from '../pages/Directorio';
import Organos from '../pages/Organos';
import Archivos from '../pages/Archivos';
import Snieg from '../pages/Snieg';
import Preguntas from '../pages/Preguntas';
import Sistemas from '../pages/Sistemas';
import Reportes from '../pages/Reportes';
import Documentacion from '../pages/Documentacion';
import Profesores from '../pages/Profesores';
import Instituciones from '../pages/Instituciones';
import Modulos from '../pages/Modulos';
import Perfiles from '../pages/Perfiles';
import Cursos from '../pages/Cursos';
import DocsIieg from '../pages/DocsIieg';
import Banners from '../pages/Banner';
import Cuadernillos from '../pages/Cuadernillos';

import { protectedRoute } from './helpers';

const ADMIN_EDITOR = ['tetlamamakani', 'editora'];

export const editorRoutes = [
  //protectedRoute('menu', <MenuManager />, ADMIN_EDITOR),
  protectedRoute('pages/edit/:id', <PageEditor />, ADMIN_EDITOR),
  protectedRoute('media', <Media />, ADMIN_EDITOR),
  protectedRoute('posts', <Posts />, ADMIN_EDITOR),
  protectedRoute('subjects', <Subject />, ADMIN_EDITOR),
  protectedRoute('datos-nuevos', <DatosNuevos />, ADMIN_EDITOR),
  protectedRoute('flashes', <Flashes />, ADMIN_EDITOR),
  protectedRoute('mapas', <Mapas />, ADMIN_EDITOR),
  protectedRoute('directorio', <Directorio />, ADMIN_EDITOR),
  protectedRoute('organos', <Organos />, ADMIN_EDITOR),
  protectedRoute('archivos', <Archivos />, ADMIN_EDITOR),
  protectedRoute('snieg', <Snieg />, ADMIN_EDITOR),
  protectedRoute('preguntas', <Preguntas />, ADMIN_EDITOR),
  protectedRoute('sistemas', <Sistemas />, ADMIN_EDITOR),
  protectedRoute('reportes', <Reportes />, ADMIN_EDITOR),
  protectedRoute('documentacion', <Documentacion />, ADMIN_EDITOR),
  protectedRoute('profesores', <Profesores />, ADMIN_EDITOR),
  protectedRoute('instituciones', <Instituciones />, ADMIN_EDITOR),
  protectedRoute('modulos', <Modulos />, ADMIN_EDITOR),
  protectedRoute('perfiles', <Perfiles />, ADMIN_EDITOR),
  protectedRoute('cursos', <Cursos />, ADMIN_EDITOR),
  protectedRoute('docs_iieg', <DocsIieg />, ADMIN_EDITOR),
  protectedRoute('banners', <Banners />, ADMIN_EDITOR),
  protectedRoute('cuadernillos', <Cuadernillos />, ADMIN_EDITOR),
];