"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportToXlsx = void 0;
const xlsx_1 = __importDefault(require("xlsx"));
const path_1 = __importDefault(require("path"));
function exportToXlsx({ jsonData, output = path_1.default.join('./static/QSO.xlsx') }) {
    let Sheet = jsonData && xlsx_1.default.utils.json_to_sheet(jsonData);
    let wb = xlsx_1.default.utils.book_new();
    xlsx_1.default.utils.book_append_sheet(wb, Sheet, 'QSO列表');
    let buffer = xlsx_1.default.write(wb, {
        type: 'buffer',
        bookType: 'xlsx'
    });
    console.log("export success ");
    return buffer;
}
exports.exportToXlsx = exportToXlsx;
//# sourceMappingURL=exportToxlsx.js.map