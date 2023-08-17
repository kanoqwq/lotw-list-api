import { parseData } from './actions/parseData'
import { fetchData } from './utils/fetch'
import { login } from './actions/login'
import { configs } from './utils/config'
import { parseDetails } from './actions/parseDetails'

//input your user info in .env file
const loginData: LoginData = {
    login: configs.LOTW_USER,
    password: configs.LOTW_PWD
}

const resultDataArray: Array<ResultData> = []
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

export const getQsoData = async (useCache: string = 'cache'): Promise<ResultData[]> => {
    //缓存失效
    console.log(useCache);
    const headers = await getHeader()
    if (useCache === 'no-cache') {
        parsedDataMap.clear()
    }
    if (isRequesting != true && (useCache === 'no-cache' || (resultDataArray.length === 0 || expiredTime < Date.now()))) {
        resultDataArray.length = 0
        isRequesting = true
        try {

            if (!headers) {
                console.log('login failed!');
                throw new Error('login failed! please check your password.')
            }
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
            if (!headers) {
                console.log('login failed!');
                throw new Error('login failed! please check your password.')
            }
            //find cookie
            const cookie = headers.getSetCookie()[0]
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


export const getData = () => resultDataArray