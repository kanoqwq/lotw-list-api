import Router from "koa-router";
import Controller from '../controller/lotwInfo/lotwInfo'
const router = new Router();

//返回列表数据
router.get('/lotw', Controller.getQsos)
//展示详细信息
router.get('/lotw/qsldetails',Controller.getQSLDetails)
//导出数据
router.get('/downloadfile', Controller.exportFile)
//登录
// router.post('/login')
//登出
// router.get('/logout')

export default router
