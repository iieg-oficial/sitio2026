import Users from '../pages/Users';
import RevisionQueue from '../pages/RevisionQueue';
import { protectedRoute } from './helpers';

const ADMIN = ['tetlamamakani'];

export const adminRoutes = [
  { path: 'users',    ...protectedRoute(<Users />, ADMIN) },
  { path: 'revision', ...protectedRoute(<RevisionQueue />, ADMIN) },
];