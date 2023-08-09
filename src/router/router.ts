import Router from "koa-router";
import Controller from '../controller/lotwInfo/lotwInfo'
const router = new Router();

//返回列表
router.get('/lotw', Controller.getQsos)
//登录
// router.post('/login')
//登出
// router.get('/logout')

export default router
