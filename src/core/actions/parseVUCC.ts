import cheerio from 'cheerio'
export const parseVuccData = (page: string): any => {
    // console.log(page);
    const $ = cheerio.load(page)
    let resultVuccData: any = {
        vucc144: null,
        vucc432: null,
        vuccSatellite: null
    }
    const resArr: any = []
    let tbody = $('#accountStatusTable tbody')
    $(tbody).find('td:last-child').each((idx, itm) => {
        resArr.push(+$(itm).text())
    })
    let i = 0
    if (resArr.length) {
        for (let key in resultVuccData) {
            resultVuccData[key] = resArr[i++]
        }
    }else{
        throw new Error('no content')
    }
    return resultVuccData
}
