import Koa from 'koa'
import { getQsoData, getVuccAwardsData, downloadAdiFile, getQSLData, getAdiFile } from "../../core"
import { exportToXlsx } from "../../core/actions/exportToxlsx"
import { saveADIFile, ADI2Json } from '../../core/utils/adiTools'
import { configs } from '../../core/utils/config'
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
            const resText = await (await getAdiFile('&qso_query=1&qso_qsl=no&qso_qsldetail=yes&qso_withown=yes&qso_qsorxsince=1000-09-02&qso_mydetail=yes', { login, password })).text()
            //Save ADI file to ./adifile
            let saveFlag = await saveADIFile(resText)
            if (!saveFlag.ok) {
                throw new Error('save file failed!')
            }

            const resData = await ADI2Json()
            if (!resData.ok) {
                throw new Error('adi to json failed!')
            }

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
    },
    downloadAdiFile: async (ctx: Koa.Context): Promise<void> => {
        try {
            let queryString = ctx.querystring
            const resText = await (await downloadAdiFile(queryString, { login: configs.LOTW_USER, password: configs.LOTW_PWD })).text()
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