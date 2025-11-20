import { Router } from 'express';
import agentController from './agent.controller.js';

const router = Router();

router.get('/', agentController.root);
router.get('/health', agentController.health);

router.post('/sessions', agentController.createSession);
router.get('/sessions/:userId', agentController.listSessions);
router.get('/sessions/:userId/:sessionId', agentController.getSession);
router.delete('/sessions/:userId/:sessionId', agentController.deleteSession);

router.post('/chat', agentController.chat);
router.post('/chat/stream', agentController.chatStream);

export default router;
