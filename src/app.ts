import Koa from 'koa'
import router from './router/router';
const app = new Koa();

//使用插件

//错误拦截器
app.use((ctx, next) => {
    //跨域
    // ctx.set("Access-Control-Allow-Origin", "*")
    let { method, url } = ctx
    console.log({ method, url});
    return next().catch((err) => {
        console.log(err);
    })
})


//使用路由
app.use(router.routes())


app.listen(4545)
console.log('server is running at: http://localhost:4545');
