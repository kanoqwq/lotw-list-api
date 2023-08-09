import cheerio from 'cheerio'
import { fetchData } from '../utils/fetch';

export async function login(loginData: LoginData) {
    //addtional params
    loginData = {
        ...loginData,
        thisForm: 'login'
    }

    //parse object to formBody
    const formBody = Object.keys(loginData).map((key: string) => encodeURIComponent(key) + '=' + encodeURIComponent(loginData[key])).join('&');

    const res = await fetchData({
        url: 'https://lotw.arrl.org/lotwuser/qsos',
        method: 'post',
        body: formBody,
        headers: { 'Content-type': "application/x-www-form-urlencoded" }
    })

    if (res && res.ok) {
        const resData = await res.text()
        const headers: Headers = res.headers
        if (headers.getSetCookie()[0]) {
            // console.log(resData);
            const $ = cheerio.load(resData)
            $('.userhead td').each((index, item) => {
                let text = $(item).text().trim()
                if (text !== '' && !($(item).find('a').prop('href'))) {
                    console.log(text);
                }
            })
            return res.headers
        }
    }
    return null
}