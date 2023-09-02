const { AdifReader } = require('tcadif');
import fs from 'fs';
import path from 'path';

const adi_path = path.join('./adifile')
const file_path = path.join(adi_path, './myQsoDetails.adi')

export const saveADIFile = (data: Buffer): Promise<{ ok: boolean, message?: string }> => new Promise((resove, reject) => {
    if (!fs.existsSync(adi_path)) {
        fs.mkdirSync(adi_path)
    }
    fs.writeFile(file_path, data, { flag: 'w+' }, (err) => {
        if (err) {
            reject({ ok: false, message: 'interal server error!' })
        } else {
            resove({ ok: true })
        }
    })

})

export const readADIFile = (): Promise<{ ok: boolean, message?: string, data?: Buffer }> => new Promise((resove, reject) => {
    fs.readFile(file_path, (err, data) => {
        if (err) {
            reject({ ok: false, message: 'interal server error!' })
        }
        resove({ ok: true, data })
    })
})

export const ADI2Json = (): Promise<{ ok: boolean, message?: string, data: Array<ADIJsonRecord> }> => new Promise((resove, reject) => {
    try {

        let JsonData: Array<ADIJsonRecord> = []
        const input = fs.createReadStream(file_path);

        const reader = new AdifReader();

        input.on('error', () => { throw new Error() })

        reader.on('data', (record: ADIJsonRecord) => {
            JsonData.push(record)
        });

        reader.on('error', (err: Error) => {
            throw new Error()
        });

        reader.on('finish', () => {
            resove({ ok: true, data: JsonData })
        })

        //need  piping
        input.pipe(reader);
    } catch (e: any) {
        reject({ ok: false, message: "parse adi file failed !" })
    }
})
