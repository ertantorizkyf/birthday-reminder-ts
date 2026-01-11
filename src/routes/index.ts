import { Router } from 'express';
import userRoutes from './users.routes';
import schedulerRoutes from './scheduler.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/scheduler', schedulerRoutes);

export default router;