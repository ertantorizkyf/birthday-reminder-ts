import { Router } from 'express';
import { schedulerController } from '../controllers/scheduler.controller';

const router = Router();

// Manual trigger (essentially the same logic trigger as cronJobs.service.ts)
router.post('/schedule', schedulerController.manualSchedule);
router.post('/process', schedulerController.processPending);
router.post('/recover', schedulerController.recoverUnsent);
router.post('/retry', schedulerController.retryFailed);

export default router;