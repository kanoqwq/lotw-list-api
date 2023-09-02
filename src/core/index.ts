import { parseData } from './actions/parseData'
import { fetchData } from './utils/fetch'
import { login } from './actions/login'
import { configs } from './utils/config'
import { parseDetails } from './actions/parseDetails'
import { parseVuccData } from './actions/parseVUCC'

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
let parsedDataMap: Map<string, DetailsData> = new Map()
let expiredTime = Date.now();
let HeaderExpiredTime = Date.now();
let isRequesting = false
let TempHeaders: Headers | null = null

const getQsos = async ({ headers, url }: DataFetchParams, deps = 1) => {
    //find cookie
    const cookie = headers.getSetCookie()[0]
    //page1
    const res = await fetchData({
        url,
        headers: {
            'Cookie': cookie
        }
    })

    if (res && res.ok) {
        const data = await res.text()
        const resData = deps == 1 ? parseData(data) : parseData(data)
        resultDataArray.push(...resData)
        if (resData.length) {
            console.log(`fetch page ${deps}...`);
            await getQsos({
                url: 'https://lotw.arrl.org/lotwuser/qsos?qso_page=' + deps + '&awg_id=&ac_acct=',
                headers
            }, deps + 1)
        }
    }
}

const getHeader = async () => {
    //header expired in 1h
    if (HeaderExpiredTime < Date.now()) {
        console.log('header expired, try to login...');
        HeaderExpiredTime = Date.now() + 3600 * 1000
        TempHeaders = await login(loginData)
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
        parsedDataMap.clear()
        resultDataArray.length = 0
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

export const getQsoData = async (useCache: string = 'cache'): Promise<ResultData[]> => {
    //缓存失效
    console.log(useCache);
    if (isRequesting != true) {
        const headers = await getHeader()
        const isCache = cacheJudje(useCache)
        if (!isCache || (resultDataArray.length === 0 || expiredTime < Date.now())) {
            resultDataArray.length = 0
            isRequesting = true
            try {
                checkHeaders(headers)
                await getQsos({ headers, url: 'https://lotw.arrl.org/lotwuser/qsos?qso_query=1&awg_id=&ac_acct=&qso_callsign=&qso_owncall=&qso_startdate=&qso_starttime=&qso_enddate=&qso_endtime=&qso_mode=&qso_band=&qso_dxcc=&qso_sort=QSO+Date&qso_descend=yes&acct_sel=%3B' })
                console.log('ok,total ' + resultDataArray.length + ' qsos');
                if (resultDataArray.length) {
                    //两小时过期
                    expiredTime = Date.now() + 7200 * 1000
                    return resultDataArray;
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
        } else {
            return resultDataArray;
        }
    } else {
        throw new Error('requesting, please wait for minutes...')
    }

}

export const getQSLData = async (query: string) => {
    //clear if max cached size > 500
    if (parsedDataMap.size > 500) {
        parsedDataMap.clear()
    }
    // if cached
    if (!(parsedDataMap.get(query))) {
        try {
            isRequesting = true
            const headers = await getHeader()
            checkHeaders(headers)
            //find cookie
            const cookie = headers?.getSetCookie()[0]
            let url = 'https://lotw.arrl.org/lotwuser/qsodetail?qso=' + query;
            const res = await fetchData({
                url,
                headers: {
                    'Cookie': cookie
                }
            })
            if (res && res.ok) {
                const data = await res.text()
                let parsedResData = parseDetails(data)
                parsedDataMap.set(query, parsedResData)
                return parsedResData
            }
        } catch (e: any) {
            throw e
        } finally {
            isRequesting = false
        }
    } else {
        return parsedDataMap.get(query)
    }
}

//VUCC
export const getVuccAwardsData = async (useCache: string = 'cache'): Promise<any> => {
    //缓存失效
    console.log(useCache);
    if (isRequesting != true) {
        const headers = await getHeader()
        const isCache = useCache !== 'no-cache'
        if (!isCache || (resultVuccData.expiredTime < Date.now())) {
            isRequesting = true
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
            } finally {
                isRequesting = false
            }
        } else {
            return resultVuccData
        }
    } else {
        throw new Error('requesting, please wait for minutes...')
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

export const downloadAdiFile = async (queryString: string, loginInfo: any): Promise<any> => {

    //强制缓存1分钟
    const login = configs.LOTW_USER
    const pwd = configs.LOTW_PWD

    if (isRequesting != true) {
        isRequesting = true
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
            isRequesting = false
        }
    } else {
        throw new Error('requesting, please wait for minutes...')
    }

}

export const getData = () => resultDataArray