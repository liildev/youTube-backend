import { Router } from 'express';
import controller from '../controllers/video.js';
import checkToken from '../middlewares/checkToken.js'
import videoPutSchema  from '../middlewares/validation.js';

const router = Router()

router.get('/videos', controller.GET)
router.get('/download/:file', controller.DOWNLOAD)
router.get('/admin/videos', checkToken, controller.GET)

router.post('/videos', checkToken, controller.POST)
router.put('/admin/videos/:videoId',checkToken, videoPutSchema, controller.PUT)
router.delete('/admin/videos/:videoId',checkToken, controller.DELETE)









export default router