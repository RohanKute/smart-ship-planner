import { Router } from 'express';
import { getPlanHistory } from '../controllers/planHistory';
import { submitFeedback } from '../controllers/submitFeedback';
import { getMaintenanceAlerts } from '../controllers/mainatenanceFeedback';
import { planVoyage } from '../controllers/planVoyage';

const shipRouter = Router();

shipRouter.post('/plan-voyage', planVoyage);
shipRouter.get('/plan-history', getPlanHistory);
shipRouter.post('/feedback', submitFeedback);
shipRouter.get('/maintenance-alerts', getMaintenanceAlerts);

export default shipRouter;