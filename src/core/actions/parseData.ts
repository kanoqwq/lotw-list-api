import cheerio from 'cheerio'

export function parseData(page: string) {
    let qsos: Array<ResultData> = []
    const $ = cheerio.load(page)

    //rowsData
    $('.qso').each((index, item) => {
        let resArr: Array<string> = []
        let qsldetail: string = '';
        $(item).find('td').each((i, el) => {
            qsldetail = $(el).find('a').attr('href') as string
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
            QSL: '',
            QSRecordId: ''
        }
        let i = 0
        for (let key in qso) {
            qso[key] = resArr[i++]
        }
        qso.QSRecordId = qsldetail?.length && qsldetail.replace('qsodetail?qso=', '')
        qsos.push(qso)
    })
    return qsos

}

