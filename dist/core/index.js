"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getData = exports.getAdiFile = exports.getVuccAwardsData = exports.getQSLData = exports.getQsoData = void 0;
const parseData_1 = require("./actions/parseData");
const fetch_1 = require("./utils/fetch");
const login_1 = require("./actions/login");
const config_1 = require("./utils/config");
const parseDetails_1 = require("./actions/parseDetails");
const parseVUCC_1 = require("./actions/parseVUCC");
//input your user info in .env file
const loginData = {
    login: config_1.configs.LOTW_USER,
    password: config_1.configs.LOTW_PWD
};
const resultDataArray = [];
let resultVuccData = {
    expiredTime: Date.now(),
    vucc144: 0,
    vucc432: 0,
    vuccSatellite: 0
};
let parsedDataMap = new Map();
let expiredTime = Date.now();
let HeaderExpiredTime = Date.now();
let isRequesting = false;
let TempHeaders = null;
const getQsos = async ({ headers, url }, deps = 1) => {
    //find cookie
    const cookie = headers.getSetCookie()[0];
    //page1
    const res = await (0, fetch_1.fetchData)({
        url,
        headers: {
            'Cookie': cookie
        }
    });
    if (res && res.ok) {
        const data = await res.text();
        const resData = deps == 1 ? (0, parseData_1.parseData)(data) : (0, parseData_1.parseData)(data);
        resultDataArray.push(...resData);
        if (resData.length) {
            console.log(`fetch page ${deps}...`);
            await getQsos({
                url: 'https://lotw.arrl.org/lotwuser/qsos?qso_page=' + deps + '&awg_id=&ac_acct=',
                headers
            }, deps + 1);
        }
    }
};
const getHeader = async () => {
    //header expired in 1h
    if (HeaderExpiredTime < Date.now()) {
        console.log('header expired, try to login...');
        HeaderExpiredTime = Date.now() + 3600 * 1000;
        TempHeaders = await (0, login_1.login)(loginData);
    }
    return TempHeaders;
};
const cacheJudje = (useCache) => {
    if (useCache === 'no-cache') {
        parsedDataMap.clear();
        resultDataArray.length = 0;
        resultVuccData = {
            expiredTime: Date.now(),
            vucc144: 0,
            vucc432: 0,
            vuccSatellite: 0
        };
        return false;
    }
    else {
        return true;
    }
};
const getQsoData = async (useCache = 'cache') => {
    //缓存失效
    console.log(useCache);
    const headers = await getHeader();
    const isCache = cacheJudje(useCache);
    if (isRequesting != true && (!isCache || (resultDataArray.length === 0 || expiredTime < Date.now()))) {
        console.log(resultDataArray.length);
        resultDataArray.length = 0;
        isRequesting = true;
        try {
            if (!headers) {
                console.log('login failed!');
                throw new Error('login failed! please check your password.');
            }
            await getQsos({ headers, url: 'https://lotw.arrl.org/lotwuser/qsos?qso_query=1&awg_id=&ac_acct=&qso_callsign=&qso_owncall=&qso_startdate=&qso_starttime=&qso_enddate=&qso_endtime=&qso_mode=&qso_band=&qso_dxcc=&qso_sort=QSO+Date&qso_descend=yes&acct_sel=%3B' });
            console.log('ok,total ' + resultDataArray.length + ' qsos');
            if (resultDataArray.length) {
                //两小时过期
                expiredTime = Date.now() + 7200 * 1000;
                return resultDataArray;
            }
            else {
                throw new Error("error to fetch data.");
            }
        }
        catch (e) {
            HeaderExpiredTime = Date.now();
            throw e;
        }
        finally {
            isRequesting = false;
        }
    }
    else {
        return resultDataArray;
    }
};
exports.getQsoData = getQsoData;
const getQSLData = async (query) => {
    //clear if max cached size > 500
    if (parsedDataMap.size > 500) {
        parsedDataMap.clear();
    }
    // if cached
    if (!(parsedDataMap.get(query))) {
        try {
            isRequesting = true;
            const headers = await getHeader();
            if (!headers) {
                console.log('login failed!');
                throw new Error('login failed! please check your password.');
            }
            //find cookie
            const cookie = headers.getSetCookie()[0];
            let url = 'https://lotw.arrl.org/lotwuser/qsodetail?qso=' + query;
            const res = await (0, fetch_1.fetchData)({
                url,
                headers: {
                    'Cookie': cookie
                }
            });
            if (res && res.ok) {
                const data = await res.text();
                let parsedResData = (0, parseDetails_1.parseDetails)(data);
                parsedDataMap.set(query, parsedResData);
                return parsedResData;
            }
        }
        catch (e) {
            throw e;
        }
        finally {
            isRequesting = false;
        }
    }
    else {
        return parsedDataMap.get(query);
    }
};
exports.getQSLData = getQSLData;
//VUCC
const getVuccAwardsData = async (useCache = 'cache') => {
    //缓存失效
    console.log(useCache);
    const headers = await getHeader();
    const isCache = useCache !== 'no-cache';
    if (isRequesting != true && (!isCache || (resultVuccData.expiredTime < Date.now()))) {
        isRequesting = true;
        try {
            if (!headers) {
                console.log('login failed!');
                throw new Error('login failed! please check your password.');
            }
            //find cookie
            const cookie = headers.getSetCookie()[0];
            let url = 'https://lotw.arrl.org/lotwuser/awardaccount?awardaccountcmd=status&awg_id=VUCC&ac_acct=1';
            const res = await (0, fetch_1.fetchData)({
                url,
                headers: {
                    'Cookie': cookie
                }
            });
            if (res && res.ok) {
                const data = await res.text();
                const parsedResData = (0, parseVUCC_1.parseVuccData)(data);
                resultVuccData = { expiredTime: Date.now() + 7200 * 1000, ...parsedResData };
                return resultVuccData;
            }
        }
        catch (e) {
            resultVuccData.expiredTime = Date.now();
            throw e;
        }
        finally {
            isRequesting = false;
        }
    }
    else {
        return resultVuccData;
    }
};
exports.getVuccAwardsData = getVuccAwardsData;
// API query params example:
// qso_query: 1
// qso_withown: yes
// qso_qslsince: 2021-08-28
// qso_qsldetail: yes
// qso_mydetail: yes
// qso_owncall: 
// download_rpt_btn: Download report
let adiFileExpiredTime = Date.now();
const getAdiFile = async (queryString) => {
    //强制缓存1分钟
    const headers = await getHeader();
    if (isRequesting != true && ((adiFileExpiredTime < Date.now()))) {
        isRequesting = true;
        try {
            if (!headers) {
                console.log('login failed!');
                throw new Error('login failed! please check your password.');
            }
            //find cookie
            const cookie = headers.getSetCookie()[0];
            let url = `https://lotw.arrl.org/lotwuser/lotwreport.adi?${queryString}`;
            const res = await (0, fetch_1.fetchData)({
                url,
                headers: {
                    'Cookie': cookie
                }
            });
            if (res && res.ok) {
                adiFileExpiredTime = Date.now() + 60 * 1000;
                return await res.text();
            }
        }
        catch (e) {
            adiFileExpiredTime = Date.now();
            throw e;
        }
        finally {
            isRequesting = false;
        }
    }
    else {
        throw new Error("Please wait for 1 minutes to download file !");
    }
};
exports.getAdiFile = getAdiFile;
const getData = () => resultDataArray;
exports.getData = getData;
//# sourceMappingURL=index.js.map