"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = void 0;
const fetch_1 = require("../utils/fetch");
async function logout() {
    const res = await (0, fetch_1.fetchData)({ url: "https://lotw.arrl.org/lotwuser/default?logout=1" });
    const textRes = res && await res.text();
    if (textRes) {
        console.log('logout success');
    }
}
exports.logout = logout;
//# sourceMappingURL=logout.js.map