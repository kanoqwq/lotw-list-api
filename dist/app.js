"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const router_1 = __importDefault(require("./router/router"));
const app = new koa_1.default();
//使用插件
//错误拦截器
app.use((ctx, next) => {
    //跨域
    // ctx.set("Access-Control-Allow-Origin", "*")
    let { method, url } = ctx;
    console.log({ method, url });
    return next().catch((err) => {
        console.log(err);
    });
});
//使用路由
app.use(router_1.default.routes());
app.listen(4545);
console.log('server is running at: http://localhost:4545');
//# sourceMappingURL=app.js.map