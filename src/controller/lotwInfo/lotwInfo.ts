import Koa from 'koa'
import { getQsoData, getVuccAwardsData, downloadAdiFile, getQsoJsonData } from "../../core"
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
    getVuccAwards: async (ctx: Koa.Context): Promise<void> => {
        try {
            let queryString = ctx.query
            let useCache: string = queryString.cache as string
            const qsoData = await getVuccAwardsData(useCache)
            ctx.body = {
                code: 200,
                message: 'ok',
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
            let queryString = ctx.query
            let login: string = queryString.login as string
            let password: string = queryString.password as string

            const resData = await getQsoJsonData({ login, password, isCache: true })

            const jsonData = resData.data.map((item) => {
                return {
                    'MY CALL': item.STATION_CALLSIGN,
                    CALL: item.CALL,
                    COUNTRY: item.COUNTRY,
                    MODE: item.MODE,
                    SAT: item.SAT_NAME,
                    TX: item.FREQ,
                    RX: item.FREQ_RX,
                    GRID: item.GRIDSQUARE,
                    'MY GRID': item.MY_GRIDSQUARE,
                    'IS QSL?': item.QSL_RCVD == 'Y' ? "YES" : 'NO',
                    'QSL DATE': `${item.QSO_DATE?.substring(0, 4)}-${item.QSO_DATE?.substring(4, 6)}-${item.QSO_DATE?.substring(6, 8)}`,
                    'TIME ON': `${item.TIME_ON?.substring(0, 2)}:${item.TIME_ON?.substring(2, 4)}:${item.TIME_ON?.substring(4, 6)}`,
                }
            })

            console.log(resData.data.length, resData.ok);

            if (resData.data.length !== 0) {
                const resStream = exportToXlsx({ jsonData });
                if (resStream) {
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
                throw new Error('export to file failed please check your login info !')
            }
        } catch (e: any) {
            ctx.response.status = 500
            ctx.body = {
                code: 500,
                message: e.message
            }
        }
    },
    downloadAdiFile: async (ctx: Koa.Context): Promise<void> => {
        try {
            let queryString = ctx.querystring
            const resText = await (await downloadAdiFile(queryString)).text()
            if (resText) {
                ctx.set('Content-Type', 'application/x-arrl-adif; charset=iso-8859-1');
                ctx.set('Content-Disposition', "attachment; filename=" + encodeURIComponent("myQsoDetails") + ".adi");
                ctx.set("Access-Control-Expose-Headers", "Content-Disposition")
                ctx.body = resText
            } else {
                throw new Error('export to file failed')
            }
        } catch (e: any) {
            ctx.response.status = 200
            ctx.body = {
                code: 500,
                message: e.message
            }
        }
    }
}