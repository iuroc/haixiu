import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { ImageDataFile } from './main.mjs'

if (import.meta.filename == process.argv[1]) {
    const dirPath = join(import.meta.dirname, '../../docs/datas')
    const files = await readdir(dirPath)
    const allTagsMap = new Map()
    for (const file of files) {
        const filePath = join(dirPath, file)
        const datas = JSON.parse((await readFile(filePath)).toString()) as ImageDataFile
        datas.list.forEach(data => {
            data.tags.forEach(tag => allTagsMap.set(tag, true))
        })
    }
    const initPath = join(dirPath, 'init.json')
    const allTags = [...allTagsMap.keys()].filter(tag => tag != 'Uncategorized')
    for (const file of files) {

    }
}