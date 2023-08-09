import cheerio from 'cheerio'

export function parseData(page: string) {
    // let tableHeader: Array<any> = []
    let qsos: Array<ResultData> = []
    // tableHeader = []
    const $ = cheerio.load(page)

    //rowsData
    $('.qso').each((index, item) => {
        let resArr: Array<string> = []
        $(item).find('td').each((i, el) => {
            if (i !== 0) {
                resArr.push($(el).text().trim())
            }
        })
        let qso: ResultData = {
            callsign: '',
            worked: '',
            datetime: '',
            band: '',
            mode: '',
            freq: '',
            QSL: ''
        }
        let i = 0
        for (let key in qso) {
            qso[key] = resArr[i++]
        }
        console.log(qso);

        qsos.push(qso)
    })
    return qsos

}

