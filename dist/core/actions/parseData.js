"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseData = void 0;
const cheerio_1 = __importDefault(require("cheerio"));
function parseData(page) {
    let qsos = [];
    const $ = cheerio_1.default.load(page);
    //rowsData
    $('.qso').each((index, item) => {
        let resArr = [];
        let qsldetail = '';
        $(item).find('td').each((i, el) => {
            if (i == 0) {
                qsldetail = $(el).find('a').attr('href');
            }
            if (i !== 0) {
                resArr.push($(el).text().trim());
            }
        });
        let qso = {
            callsign: '',
            worked: '',
            datetime: '',
            band: '',
            mode: '',
            freq: '',
            QSL: '',
            QSRecordId: ''
        };
        let i = 0;
        for (let key in qso) {
            qso[key] = resArr[i++];
        }
        qso.QSRecordId = qsldetail?.length && qsldetail.replace('qsodetail?qso=', '');
        qsos.push(qso);
    });
    return qsos;
}
exports.parseData = parseData;
//# sourceMappingURL=parseData.js.map