import { fetchData } from './utils/fetch'
import { login } from './actions/login'
import { configs } from './utils/config'
import { parseVuccData } from './actions/parseVUCC'
import { ADI2Json, saveADIFile } from './utils/adiTools'

//input your user info in .env file
const loginData: LoginData = {
    login: configs.LOTW_USER,
    password: configs.LOTW_PWD
}

const resultDataArray: Array<ResultData> = []
let resultVuccData = {
    expiredTime: Date.now(),
    vucc144: 0,
    vucc432: 0,
    vuccSatellite: 0
}
let expiredTime = Date.now();
let HeaderExpiredTime = Date.now();
let isRequesting = false
let TempHeaders: Headers | null = null

const getHeader = async () => {
    //header expired in 1h
    if (HeaderExpiredTime < Date.now()) {
        console.log('header expired, try to login...');
        HeaderExpiredTime = Date.now() + 3600 * 1000
        try {
            TempHeaders = await login(loginData)
        } catch (e) {
            HeaderExpiredTime = Date.now();
            throw e
        }
    }
    return TempHeaders
}

const checkHeaders = (headers: Headers | null) => {
    if (!headers) {
        console.log('login failed!');
        HeaderExpiredTime = Date.now()
        throw new Error('login failed! please check your password.')
    }
}
const cacheJudje = (useCache: string): boolean => {
    if (useCache === 'no-cache') {
        resultVuccData = {
            expiredTime: Date.now(),
            vucc144: 0,
            vucc432: 0,
            vuccSatellite: 0
        }
        return false
    } else {
        return true
    }
}

const requestQsoData = async (isCache = true): Promise<any[]> => {
    try {
        isRequesting = true
        const resData = await getQsoJsonData({ login: configs.LOTW_USER, password: configs.LOTW_PWD, isCache })
        if (resData.ok) {
            resultDataArray.length = 0
            resData.data.forEach((item) => {
                resultDataArray.push({
                    callsign: item.STATION_CALLSIGN as string,
                    worked: item.CALL as string,
                    grid: item.GRIDSQUARE,
                    contry: item.COUNTRY,
                    datetime: `${item.QSO_DATE?.substring(0, 4)}-${item.QSO_DATE?.substring(4, 6)}-${item.QSO_DATE?.substring(6, 8)} ${item.TIME_ON?.substring(0, 2)}:${item.TIME_ON?.substring(2, 4)}:${item.TIME_ON?.substring(4, 6)}`,
                    band: item.BAND as string,
                    satellite: item.SAT_NAME as string,
                    cqzone: item.CQZ,
                    ituzone: item.ITUZ,
                    mycqzone: item.MY_CQ_ZONE,
                    myituzone: item.MY_ITU_ZONE,
                    mygrid: item.MY_GRIDSQUARE,
                    mode: item.MODE as string,
                    freq: item.FREQ as string,
                    rx: item.FREQ_RX,
                    QSL: item.QSL_RCVD == 'Y' ? "YES" : 'NO',
                })
            })
            console.log('ok,total ' + resData.data.length + ' qsos');
            if (resultDataArray.length) {
                //两小时过期
                expiredTime = Date.now() + 7200 * 1000
                return resultDataArray;
            } else {
                throw new Error("error to fetch data.")
            }
        } else {
            throw new Error("error to fetch data.")
        }
    }
    catch (e: any) {
        HeaderExpiredTime = Date.now()
        throw e
    } finally {
        isRequesting = false
    }
}

export const getQsoData = async (useCache: string = 'cache'): Promise<any[]> => {
    //缓存失效
    console.log(useCache);
    const isCache = cacheJudje(useCache)
    if (isRequesting != true) {
        if (!isCache || (resultDataArray.length === 0 || expiredTime < Date.now())) {
            requestQsoData()
        }
    }
    return resultDataArray
}

//VUCC
export const getVuccAwardsData = async (useCache: string = 'cache'): Promise<any> => {
    //缓存失效
    console.log(useCache);
    const headers = await getHeader()
    const isCache = useCache !== 'no-cache'
    if (!isCache || (resultVuccData.expiredTime < Date.now())) {
        try {
            checkHeaders(headers)
            //find cookie
            const cookie = headers?.getSetCookie()[0]
            let url = 'https://lotw.arrl.org/lotwuser/awardaccount?awardaccountcmd=status&awg_id=VUCC&ac_acct=1';
            const res = await fetchData({
                url,
                headers: {
                    'Cookie': cookie
                }
            })
            if (res && res.ok) {
                const data = await res.text()
                const parsedResData = parseVuccData(data)
                resultVuccData = { expiredTime: Date.now() + 7200 * 1000, ...parsedResData }
                return resultVuccData
            }
        } catch (e: any) {
            resultVuccData.expiredTime = Date.now()
            throw e
        }
    } else {
        return resultVuccData
    }
}




// API query params example:
// qso_query: 1
// qso_withown: yes
// qso_qslsince: 2021-08-28
// qso_qsldetail: yes
// qso_mydetail: yes
// qso_owncall: 
// download_rpt_btn: Download report

let adiRes = new Map()
export const getAdiFile = async (queryString: string, loginInfo: any): Promise<any> => {
    if (adiRes.size > 100) {
        adiRes.clear()
    }
    //强制缓存1分钟
    const login = loginInfo.login && loginInfo.password ? loginInfo.login : configs.LOTW_USER
    const pwd = loginInfo.login && loginInfo.password ? loginInfo.password : configs.LOTW_PWD
    if (!adiRes.get(login)) {
        adiRes.set(login, { isRequesting: false, expiredTime: Date.now() })
    }
    if (!adiRes.get(login).res || (adiRes.get(login).expiredTime < Date.now())) {
        if (adiRes.get(login).isRequesting != true) {
            adiRes.set(login, { isRequesting: true })
            try {
                //find cookie
                let url = `https://lotw.arrl.org/lotwuser/lotwreport.adi?${'login=' + login + '&password=' + pwd + '&'}qso_qsl=no&${queryString}`;
                const res = await fetchData({
                    url,
                })
                if (res && res.ok) {
                    adiRes.set(login, { ...adiRes.get(login), res: res.clone(), expiredTime: Date.now() + 60 * 1000 })
                    return res
                }
            } catch (e: any) {
                adiRes.set(login, { ...adiRes.get(login), res: adiRes.get(login).res, expiredTime: Date.now() })
                throw e
            } finally {
                adiRes.set(login, { ...adiRes.get(login), isRequesting: false, res: adiRes.get(login).res })
            }
        } else {
            throw new Error('requesting, please wait for minutes...')
        }
    } else {
        return adiRes.get(login).res.clone()
    }

}

let downloading = false
export const downloadAdiFile = async (queryString: string): Promise<any> => {

    const login = configs.LOTW_USER
    const pwd = configs.LOTW_PWD

    if (downloading != true) {
        downloading = true
        try {
            //find cookie
            let url = `https://lotw.arrl.org/lotwuser/lotwreport.adi?${'login=' + login + '&password=' + pwd + '&'}qso_qsl=no&${queryString}`;
            const res = await fetchData({
                url,
            })
            if (res && res.ok) {
                expiredTime = Date.now() + 60 * 1000
                return res
            }
        } catch (e: any) {
            expiredTime = Date.now()
            throw e
        } finally {
            downloading = false
        }
    } else {
        throw new Error('requesting, please wait for minutes...')
    }

}

export const getQsoJsonData = async (loginInfo: any): Promise<{
    ok: boolean;
    message?: string | undefined;
    data: ADIJsonRecord[];
}> => {

    const resText = loginInfo.isCache ? await (await getAdiFile('&qso_query=1&qso_qsl=no&qso_qsldetail=yes&qso_withown=yes&qso_qsorxsince=1000-09-02&qso_mydetail=yes', { login: loginInfo.login, password: loginInfo.password })).text()
        : await (await downloadAdiFile('&qso_query=1&qso_qsl=no&qso_qsldetail=yes&qso_withown=yes&qso_qsorxsince=1000-09-02&qso_mydetail=yes')).text()
    //Save ADI file to ./adifile
    let saveFlag = await saveADIFile(resText)
    if (!saveFlag.ok) {
        throw new Error('save file failed!')
    }

    const resData = await ADI2Json()
    if (!resData.ok) {
        throw new Error('adi to json failed!')
    } else {
        return resData
    }
}

export const getData = () => resultDataArray