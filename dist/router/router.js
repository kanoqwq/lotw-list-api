"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_router_1 = __importDefault(require("koa-router"));
const lotwInfo_1 = __importDefault(require("../controller/lotwInfo/lotwInfo"));
const router = new koa_router_1.default();
//返回列表数据
router.get('/lotw', lotwInfo_1.default.getQsos);
//获取VUCC Award 信息
router.get('/lotw/vuccaward', lotwInfo_1.default.getVuccAwards);
//展示详细信息
router.get('/lotw/qsldetails', lotwInfo_1.default.getQSLDetails);
//导出数据
router.get('/lotw/downloadfile', lotwInfo_1.default.exportFile);
//导出ADI File
router.get('/lotw/adif.adi', lotwInfo_1.default.downloadAdiFile);
//登录
// router.post('/login')
//登出
// router.get('/logout')
exports.default = router;
//# sourceMappingURL=router.js.map