import XLSX from 'xlsx'
import path from 'path'
export function exportToXlsx({ jsonData, output = path.join('./static/QSO.xlsx') }: { jsonData: Array<ResultData> | Array<ADIJsonRecord>, output?: string }) {
    let Sheet = jsonData && XLSX.utils.json_to_sheet(jsonData)
    let wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, Sheet, 'QSL List')
    let buffer = XLSX.write(wb, {
        type: 'buffer',
        bookType: 'xlsx'
    })
    console.log("export success ");
    return buffer
}