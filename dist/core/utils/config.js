"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.configs = {
    LOTW_USER: process.env.LOTW_USER,
    LOTW_PWD: process.env.LOTW_PWD
};
//# sourceMappingURL=config.js.map