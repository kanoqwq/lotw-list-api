"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchData = void 0;
async function fetchData({ url, method = 'get', headers, body }) {
    try {
        const res = await fetch(url, {
            method,
            headers,
            body: body ? body : null
        });
        if (res.ok) {
            return res;
        }
        else {
            throw new Error('请求失败');
        }
    }
    catch (e) {
        console.log(e.message);
        throw e;
    }
}
exports.fetchData = fetchData;
//# sourceMappingURL=fetch.js.map