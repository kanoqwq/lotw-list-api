import Router from "koa-router";
import Controller from '../controller/lotwInfo/lotwInfo'
const router = new Router();

//返回列表数据
router.get('/lotw', Controller.getQsos)
//获取VUCC Award 信息
router.get('/lotw/vuccaward', Controller.getVuccAwards)
//导出数据
router.get('/lotw/downloadfile', Controller.exportFile)
//导出ADI File
router.get('/lotw/adif.adi', Controller.downloadAdiFile)
//登录
// router.post('/login')
//登出
// router.get('/logout')

export default router
