"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDetails = void 0;
const cheerio_1 = __importDefault(require("cheerio"));
function trimAll(str) {
    if (typeof str === 'string') {
        let newStr = str.split('\n').join().split(',').join('');
        return newStr.split('  ');
    }
    else {
        return null;
    }
}
function parseDetails(page) {
    const $ = cheerio_1.default.load(page);
    let resData = {
        callSign: '',
        cqZone: '',
        ITUZone: '',
        grid: '',
        myGrid: '',
        satellite: '',
        province: '',
        myProvince: ''
    };
    $('tbody').each((index, item) => {
        if (index == 5) {
            let text = $(item).find('tbody').text();
            let trimTextArr = trimAll(text);
            if (trimTextArr && trimTextArr.length) {
                let stationIndex = trimTextArr.indexOf('Station');
                let workedStationIndex = trimTextArr.indexOf('Worked Station');
                let myStation = trimTextArr.slice(stationIndex + 1, workedStationIndex);
                let workedStation = trimTextArr.slice(workedStationIndex + 1, trimTextArr.length);
                console.log(myStation, workedStation);
                myStation.forEach((ele) => {
                    let tmpText = '';
                    if ((tmpText = ele.replaceAll('Grid', '')) !== ele) {
                        resData.myGrid = tmpText.trim();
                    }
                    if ((tmpText = ele.replaceAll('Province', '')) !== ele) {
                        resData.myProvince = tmpText.trim();
                    }
                });
                workedStation.forEach((ele) => {
                    let tmpText = '';
                    if ((tmpText = ele.replaceAll('Worked', '')) !== ele) {
                        resData.callSign = tmpText.trim();
                    }
                    if ((tmpText = ele.replaceAll('CQ Zone', '')) !== ele) {
                        resData.cqZone = tmpText.trim();
                    }
                    if ((tmpText = ele.replaceAll('ITU Zone', '')) !== ele) {
                        resData.ITUZone = tmpText.trim();
                    }
                    if ((tmpText = ele.replaceAll('Grid', '')) !== ele) {
                        resData.grid = tmpText.trim();
                    }
                    if ((tmpText = ele.replaceAll('Province', '')) !== ele) {
                        resData.province = tmpText.trim();
                    }
                    if ((tmpText = ele.replaceAll('Satellite', '')) !== ele) {
                        resData.satellite = tmpText.trim();
                    }
                });
            }
        }
    });
    return resData;
}
exports.parseDetails = parseDetails;
//# sourceMappingURL=parseDetails.js.map