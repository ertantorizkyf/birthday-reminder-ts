import { Router } from 'express';
import { userController } from '../controllers/users.controller';

const router = Router();

router.post('/', userController.create);
router.get('/:id', userController.getById);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

export default router;