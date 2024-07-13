import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { DataJSON, DataJSONListItem } from './main.mjs'
import { existsSync } from 'fs'
import sharp from 'sharp'

if (import.meta.filename == process.argv[1]) {
    const dirPath = join(import.meta.dirname, '../../docs/datas')
    const files = await readdir(dirPath)
    for (const filename of files) {
        if (filename == 'init.json') continue
        const filePath = join(dirPath, filename)
        const datas = JSON.parse((await readFile(filePath)).toString()) as DataJSON
        for (const item of datas.list) {
            const filepath = join(import.meta.dirname, '..', '..', 'docs', 'images', item.bigImageFilename)
            const metadata = await sharp(filepath).metadata()
            item.width = metadata.width
            item.height = metadata.height
        }
        await writeFile(filePath, JSON.stringify(datas))
    }
}