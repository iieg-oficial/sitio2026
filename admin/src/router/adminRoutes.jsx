import Users from '../pages/Users';
import RevisionQueue from '../pages/RevisionQueue';
import { protectedRoute } from './helpers';
import Paginas from '../pages/Paginas';

const ADMIN = ['tetlamamakani'];

export const adminRoutes = [
  protectedRoute('users', <Users />, ADMIN),
  protectedRoute('revision', <RevisionQueue />, ADMIN),
  protectedRoute('paginas', <Paginas />, ADMIN),
];