"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const cheerio_1 = __importDefault(require("cheerio"));
const fetch_1 = require("../utils/fetch");
async function login(loginData) {
    //addtional params
    loginData = {
        ...loginData,
        thisForm: 'login'
    };
    //parse object to formBody
    const formBody = Object.keys(loginData).map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(loginData[key])).join('&');
    const res = await (0, fetch_1.fetchData)({
        url: 'https://lotw.arrl.org/lotwuser/qsos',
        method: 'post',
        body: formBody,
        headers: { 'Content-type': "application/x-www-form-urlencoded" }
    });
    if (res && res.ok) {
        const resData = await res.text();
        const headers = res.headers;
        if (headers.getSetCookie()[0]) {
            // console.log(resData);
            const $ = cheerio_1.default.load(resData);
            $('.userhead td').each((index, item) => {
                let text = $(item).text().trim();
                if (text !== '' && !($(item).find('a').prop('href'))) {
                    console.log(text);
                }
            });
            return res.headers;
        }
    }
    return null;
}
exports.login = login;
//# sourceMappingURL=login.js.map