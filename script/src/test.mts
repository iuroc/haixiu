import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { ImageDataFile, ImageDataFileItem } from './main.mjs'

if (import.meta.filename == process.argv[1]) {
    const dirPath = join(import.meta.dirname, '../../docs/datas')
    const files = await readdir(dirPath)
    const allDataItems: ImageDataFileItem[] = []
    for (const filename of files) {
        if (filename == 'init.json') continue
        const filePath = join(dirPath, filename)
        const datas = JSON.parse((await readFile(filePath)).toString()) as ImageDataFile
        allDataItems.push(...datas.list)
    }
    const tagDataMap = new Map<string, ImageDataFileItem[]>()
    allDataItems.forEach(item => {
        item.tags.forEach(tag => {
            if (!tagDataMap.has(tag)) tagDataMap.set(tag, [])
            tagDataMap.get(tag).push(item)
        })
    })
    const allTags = [...tagDataMap.keys()]
    tagDataMap.forEach(async (fileDatas, tag) => {
        const total = fileDatas.length
        const pageSize = 36
        const updateTime = new Date().toLocaleString()
        const totalPage = Math.floor((total - 1) / pageSize) + 1
        for (let page = 0; page < totalPage; page++) {
            const filename = `data_${tag}_${page}.json`
            const start = page * pageSize
            const list = fileDatas.slice(start, start + pageSize)
            const fileData: ImageDataFile = { page, pageSize, list, updateTime, allTags, total, totalPage }
            await writeFile(join(dirPath, filename), JSON.stringify(fileData))
        }
    })
}