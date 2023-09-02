"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../../core");
const exportToxlsx_1 = require("../../core/actions/exportToxlsx");
exports.default = {
    //逻辑写在这
    getQsos: async (ctx) => {
        try {
            let queryString = ctx.query;
            let useCache = queryString.cache;
            const qsoData = await (0, core_1.getQsoData)(useCache);
            ctx.body = {
                code: 200,
                message: 'ok',
                total: qsoData.length,
                data: qsoData
            };
        }
        catch (e) {
            ctx.response.status = 500;
            ctx.body = {
                code: 500,
                message: e.message
            };
        }
    },
    getVuccAwards: async (ctx) => {
        try {
            let queryString = ctx.query;
            let useCache = queryString.cache;
            const qsoData = await (0, core_1.getVuccAwardsData)(useCache);
            ctx.body = {
                code: 200,
                message: 'ok',
                data: qsoData
            };
        }
        catch (e) {
            ctx.response.status = 500;
            ctx.body = {
                code: 500,
                message: e.message
            };
        }
    },
    //导出
    exportFile: async (ctx) => {
        try {
            if ((0, core_1.getData)().length !== 0) {
                const qsoData = await (0, core_1.getQsoData)();
                const resStream = (0, exportToxlsx_1.exportToXlsx)({ jsonData: qsoData });
                if (resStream) {
                    console.log(resStream);
                    // 设置content-type请求头
                    ctx.set('Content-Type', 'application/vnd.openxmlformats');
                    // 设置文件名信息请求头
                    ctx.set('Content-Disposition', "attachment; filename=" + encodeURIComponent("QSO") + ".xlsx");
                    // 文件名信息由后端返回时必须设置该请求头,否则前端拿不到Content-Disposition响应头信息
                    ctx.set("Access-Control-Expose-Headers", "Content-Disposition");
                    // 将buffer返回给前端
                    ctx.body = resStream;
                }
                else {
                    throw new Error('export to file failed');
                }
            }
            else {
                throw new Error('export to file failed');
            }
        }
        catch (e) {
            ctx.response.status = 500;
            ctx.body = {
                code: 500,
                message: e.message
            };
        }
    },
    getQSLDetails: async (ctx) => {
        try {
            let queryString = ctx.query;
            let qsoparams = queryString.qso;
            if (!qsoparams) {
                throw new Error('qso params not found');
            }
            if (!isNaN(parseFloat(qsoparams)) && (qsoparams !== parseInt(qsoparams).toString()) || (parseInt(qsoparams) !== Math.abs(parseInt(qsoparams)))) {
                throw new Error('qso params must be a number');
            }
            let resData = await (0, core_1.getQSLData)(qsoparams);
            ctx.body = {
                code: 200,
                message: 'ok',
                data: resData
            };
        }
        catch (e) {
            ctx.response.status = 500;
            ctx.body = {
                code: 500,
                message: e.message
            };
        }
    },
    downloadAdiFile: async (ctx) => {
        try {
            let queryString = ctx.querystring;
            const resText = await (0, core_1.getAdiFile)(queryString);
            if (resText) {
                // console.log(resStream);
                // 设置content-type请求头
                ctx.set('Content-Type', 'application/x-arrl-adif; charset=iso-8859-1');
                // 设置文件名信息请求头
                ctx.set('Content-Disposition', "attachment; filename=" + encodeURIComponent("myQsoDetails") + ".adi");
                // 文件名信息由后端返回时必须设置该请求头,否则前端拿不到Content-Disposition响应头信息
                ctx.set("Access-Control-Expose-Headers", "Content-Disposition");
                // 将buffer返回给前端
                ctx.body = resText;
            }
            else {
                throw new Error('export to file failed');
            }
        }
        catch (e) {
            ctx.response.status = 200;
            ctx.body = {
                code: 500,
                message: e.message
            };
        }
    }
};
//# sourceMappingURL=lotwInfo.js.map