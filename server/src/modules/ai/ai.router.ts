import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { aiController } from './ai.controller';

const router = Router();
router.use(authenticate);

router.get('/status', aiController.status);
router.post('/draft-task', aiController.draftTask);
router.post('/weekly-summary', aiController.draftWeeklySummary);
router.get('/dashboard-summary', aiController.dashboardWeeklySummary);
router.post('/dashboard-summary', aiController.dashboardWeeklySummary);
router.post('/dashboard-chat', aiController.dashboardWeeklyChat);

export default router;

