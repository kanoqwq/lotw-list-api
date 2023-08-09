import { getQsoData } from "../../core"
import Koa from 'koa'
export default {
    //逻辑写在这
    getQsos: async (ctx: Koa.Context): Promise<void> => {
        try {
            const qsoData = await getQsoData()
            ctx.body = {
                code: 200,
                message: 'ok',
                total: qsoData.length,
                data: qsoData
            }
        } catch (e: any) {
            ctx.body = {
                code: 500,
                message: e.message
            }
        }
    }
}