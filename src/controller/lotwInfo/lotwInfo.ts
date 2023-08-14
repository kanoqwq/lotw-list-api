import Koa from 'koa'
import { getQsoData, getData, getQSLData } from "../../core"
import { exportToXlsx } from "../../core/actions/exportToxlsx"
export default {
    //逻辑写在这
    getQsos: async (ctx: Koa.Context): Promise<void> => {
        try {
            let queryString = ctx.query
            let useCache: string = queryString.cache as string
            const qsoData = await getQsoData(useCache)
            ctx.body = {
                code: 200,
                message: 'ok',
                total: qsoData.length,
                data: qsoData
            }
        } catch (e: any) {
            ctx.response.status = 500
            ctx.body = {
                code: 500,
                message: e.message
            }
        }
    },
    //导出
    exportFile: async (ctx: Koa.Context): Promise<void> => {
        try {
            if (getData().length !== 0) {
                const qsoData = await getQsoData()
                const resStream = exportToXlsx({ jsonData: qsoData });
                if (resStream) {
                    console.log(resStream);
                    // 设置content-type请求头
                    ctx.set('Content-Type', 'application/vnd.openxmlformats');
                    // 设置文件名信息请求头
                    ctx.set('Content-Disposition', "attachment; filename=" + encodeURIComponent("QSO") + ".xlsx");
                    // 文件名信息由后端返回时必须设置该请求头,否则前端拿不到Content-Disposition响应头信息
                    ctx.set("Access-Control-Expose-Headers", "Content-Disposition")
                    // 将buffer返回给前端
                    ctx.body = resStream
                } else {
                    throw new Error('export to file failed')
                }
            } else {
                throw new Error('export to file failed')
            }
        } catch (e: any) {
            ctx.response.status = 500
            ctx.body = {
                code: 500,
                message: e.message
            }
        }
    },
    getQSLDetails: async (ctx: Koa.Context): Promise<void> => {
        try {
            let queryString = ctx.query
            let qsoparams: string = queryString.qso as string
            if (!qsoparams) {
                throw new Error('qso params not found')
            }
            if (!isNaN(parseFloat(qsoparams)) && (qsoparams !== parseInt(qsoparams).toString()) || (parseInt(qsoparams) !== Math.abs(parseInt(qsoparams)))) {
                throw new Error('qso params must be a number')
            }

            let resData = await getQSLData(qsoparams)
            ctx.body = {
                code: 200,
                message: 'ok',
                data: resData
            }
        } catch (e: any) {
            ctx.response.status = 500
            ctx.body = {
                code: 500,
                message: e.message
            }
        }
    }
}