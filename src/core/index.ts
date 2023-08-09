import { parseData } from './actions/parseData'
import { fetchData } from './utils/fetch'
import { login } from './actions/login'
import { configs } from './utils/config'
import createInterval from './utils/createScheduler'

//input your user info in .env file
const loginData: LoginData = {
    login: configs.LOTW_USER,
    password: configs.LOTW_PWD
}

const resultDataArray: Array<ResultData> = []

createInterval(() => {
    resultDataArray.length = 0
    console.log('缓存已清除');
}, 14400)

// setInterval(() => {
//     resultDataArray.length = 0
//     console.log('缓存已清除');
// }, 14400 * 1000)

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


export const getQsoData = async (): Promise<ResultData[]> => {
    //缓存失效
    if (resultDataArray.length === 0) {
        try {
            const headers = await login(loginData)
            if (!headers) {
                console.log('login failed!');
                throw new Error('login failed! please check your password.')
            }
            await getQsos({ headers, url: 'https://lotw.arrl.org/lotwuser/qsos?qso_query=1&awg_id=&ac_acct=&qso_callsign=&qso_owncall=&qso_startdate=&qso_starttime=&qso_enddate=&qso_endtime=&qso_mode=&qso_band=&qso_dxcc=&qso_sort=QSO+Date&qso_descend=yes&acct_sel=%3B' })
            console.log('ok,total ' + resultDataArray.length + ' qsos');
            if (resultDataArray.length) {
                return resultDataArray;
            } else {
                throw new Error("error to fetch data.")
            }
        }
        catch (e: any) {
            throw e
        }
    } else {
        return resultDataArray;
    }

}


