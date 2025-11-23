import { Router } from 'express';
import agentController from './agent.controller.js';
import { auth } from '../../middlewares/authentication.middleware.js';
import { AICreditController } from '../aiCredit/aiCredit.controller.js';

const router = Router();
const creditController = new AICreditController();

router.get('/', agentController.root);
router.get('/health', agentController.health);

router.post('/sessions', agentController.createSession);
router.get('/sessions/:userId', agentController.listSessions);
router.get('/sessions/:userId/:sessionId', agentController.getSession);
router.delete('/sessions/:userId/:sessionId', agentController.deleteSession);

router.post('/chat', auth(), creditController.checkAndDeductCreditsForChat, agentController.chat);
router.post('/chat/stream', auth(), creditController.checkAndDeductCreditsForChat, agentController.chatStream);

export default router;
