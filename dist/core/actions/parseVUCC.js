"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseVuccData = void 0;
const cheerio_1 = __importDefault(require("cheerio"));
const parseVuccData = (page) => {
    // console.log(page);
    const $ = cheerio_1.default.load(page);
    let resultVuccData = {
        vucc144: null,
        vucc432: null,
        vuccSatellite: null
    };
    const resArr = [];
    let tbody = $('#accountStatusTable tbody');
    $(tbody).find('td:last-child').each((idx, itm) => {
        resArr.push(+$(itm).text());
    });
    let i = 0;
    if (resArr.length) {
        for (let key in resultVuccData) {
            resultVuccData[key] = resArr[i++];
        }
    }
    else {
        throw new Error('no content');
    }
    return resultVuccData;
};
exports.parseVuccData = parseVuccData;
//# sourceMappingURL=parseVUCC.js.map