import MenuManager from '../pages/MenuManager';
import PageEditor from '../pages/PageEditor';
import Media from '../pages/Media';
import Posts from '../pages/Posts';
import Subject from '../pages/Subject';
import Paginas from '../pages/Paginas';
import Plataformas from '../pages/Plataformas';
import DatosNuevos from '../pages/DatosNuevos';
import Flashes from '../pages/Flashes';
import Mapas from '../pages/Mapas';
import Valores from '../pages/Valores';
import PlanTrabajo from '../pages/PlanTrabajo';
import PlanInstitucional from '../pages/PlanInstitucional';
import Normatividad from '../pages/Normatividad';
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

import { protectedRoute } from './helpers';

const ADMIN_EDITOR = ['tetlamamakani', 'editora'];

export const editorRoutes = [
  { path: 'menu',          ...protectedRoute(<MenuManager />, ADMIN_EDITOR) },
  { path: 'pages/edit/:id',...protectedRoute(<PageEditor />,  ADMIN_EDITOR) },
  { path: 'media',         ...protectedRoute(<Media />,       ADMIN_EDITOR) },
  { path: 'posts',         ...protectedRoute(<Posts />,       ADMIN_EDITOR) },
  { path: 'subjects',      ...protectedRoute(<Subject />,     ADMIN_EDITOR) },
  { path: 'paginas'}, ...protectedRoute(<Paginas />, ADMIN_EDITOR),
  { path: 'plataformas'}, ...protectedRoute(<Plataformas />, ADMIN_EDITOR),
  { path: 'datos-nuevos'}, ...protectedRoute(<DatosNuevos />, ADMIN_EDITOR),
  { path: 'flashes'}, ...protectedRoute(<Flashes />, ADMIN_EDITOR),
  { path: 'mapas'}, ...protectedRoute(<Mapas />, ADMIN_EDITOR),
  { path: 'valores'}, ...protectedRoute(<Valores />, ADMIN_EDITOR),
  { path: 'plan-trabajo'}, ...protectedRoute(<PlanTrabajo />, ADMIN_EDITOR),
  { path: 'plan-institucional'}, ...protectedRoute(<PlanInstitucional />, ADMIN_EDITOR),
  { path: 'normatividad'}, ...protectedRoute(<Normatividad />, ADMIN_EDITOR),
  { path: 'directorio'}, ...protectedRoute(<Directorio />, ADMIN_EDITOR),
  { path: 'organos'}, ...protectedRoute(<Organos />, ADMIN_EDITOR),
  { path: 'archivos'}, ...protectedRoute(<Archivos />, ADMIN_EDITOR),
  { path: 'snieg'}, ...protectedRoute(<Snieg />, ADMIN_EDITOR),
  { path: 'preguntas'}, ...protectedRoute(<Preguntas />, ADMIN_EDITOR),
  { path: 'sistemas'}, ...protectedRoute(<Sistemas />, ADMIN_EDITOR),
  { path: 'reportes'}, ...protectedRoute(<Reportes />, ADMIN_EDITOR),
  { path: 'documentacion'}, ...protectedRoute(<Documentacion />, ADMIN_EDITOR),
  { path: 'profesores'}, ...protectedRoute(<Profesores />, ADMIN_EDITOR),
  { path: 'instituciones'}, ...protectedRoute(<Instituciones />, ADMIN_EDITOR),
];