import PQueue from 'p-queue'
import { existsSync } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

type Catalog = {
    id: number
    image: string
    title: string
    imageFilename: string
}

type ImageInfo = {
    id: number
    title: string
    date: string
    bigImage: string
    tags: string[]
    bigImageFilename: string
}

/** 爬虫获得的图片完整数据，未过滤 `bigImage` 和 `image` */
type ImageData = Catalog & ImageInfo

/** JSON 文件结构 */
export type ImageDataFile = {
    page: number
    pageSize: number
    list: ImageDataFileItem[]
} & InitData

/** JSON 文件中的 `list` 字段 */
export type ImageDataFileItem = Omit<ImageData, 'bigImage' | 'image'>

/** `init.json` 文件结构 */
export type InitData = { totalPage: number, total: number, allTags: string[], updateTime: string }

export const getImageList = async (page: number = 0): Promise<Catalog[]> => {
    const url = `https://qingbuyaohaixiu.com/?page=${page + 1}`
    const html = await fetch(url).then(res => res.text())
    const regex = /<div class="rcm4">.*?\/post\/(\d+).*?src="([^"]+).*?alt="([^"]+)/gs
    const data: Catalog[] = []
    while (true) {
        const result = regex.exec(html)
        if (!result) break
        const id = parseInt(result[1])
        const image = result[2]
        const title = result[3].trim()
        const imageFilename = image.match(/[a-z0-9.]+$/)![0]
        data.push({ id, image, title, imageFilename })
    }
    if (data.length == 0) throw new Error('未获取到图片列表')
    return data
}

export const getImageInfo = async (id: number): Promise<ImageInfo> => {
    const url = `https://qingbuyaohaixiu.com/post/${id}/`
    const html = await fetch(url).then(res => res.text())
    const match = html.match(/<h3 >(.*?)<\/h3>.*?<h5>(.*?)<\/h5>.*?<amp-img.*?src="([^"]+)/s)
    if (!match) throw new Error('正则匹配失败')
    const title = match[1].trim()
    const date = parseDate(match[2]).toLocaleString()
    const bigImage = match[3]
    const tagsRegex = /<a href="\/tag\/.*?> #(.*?)<\/a>/g
    const tags: string[] = []
    while (true) {
        const match = tagsRegex.exec(html)
        if (!match) break
        tags.push(match[1].trim())
    }
    const bigImageFilename = bigImage.match(/[a-z0-9.]+$/)![0]
    return { id, title, date, bigImage, tags, bigImageFilename }
}

export const parseDate = (text: string) => {
    const months = {
        Jan: 0, Feb: 1, March: 2, April: 3, May: 4, June: 5,
        July: 6, Aug: 7, Sept: 8, Oct: 9, Nov: 10, Dec: 11
    }
    const regex = /([A-Za-z]+)\.? (\d+), (\d+), (\d+)(?::(\d+))? ([ap]\.m\.)/
    const match = text.match(regex);
    if (!match) {
        throw new Error("Invalid date format");
    }
    const month = months[match[1] as keyof typeof months]
    const day = parseInt(match[2], 10)
    const year = parseInt(match[3], 10)
    let hour = parseInt(match[4], 10)
    const minute = parseInt(match[5] ?? '0', 10)
    const period = match[6]
    if (period === 'p.m.' && hour < 12) {
        hour += 12
    } else if (period === 'a.m.' && hour === 12) {
        hour = 0
    }
    return new Date(year, month, day, hour, minute);
}

/** 获取全部图片目录 */
export const getAllCatalogs = (totalPage: number) => new Promise<Catalog[]>(resolve => {
    const queue = new PQueue({ concurrency: 20 })
    let finish = 0
    const results: Catalog[] = []
    for (let page = 0; page < totalPage; page++) {
        const func = async (): Promise<Catalog[]> => {
            try {
                return await getImageList(page)
            } catch {
                console.log('正在重试')
                return func()
            }
        }
        queue.add(func)
    }
    queue.on('completed', (result: Catalog[]) => {
        results.push(...result)
        console.log(`正在获取图片目录，已完成 ${(++finish / totalPage * 100).toFixed(2)}%`)
    })

    queue.on('idle', () => {
        resolve(results)
    })
})

/** 获取全部图片完整信息 */
export const getAllDatas = (catalogs: Catalog[]) => new Promise<ImageData[]>(resolve => {
    const queue = new PQueue({ concurrency: 20 })
    let finish = 0
    const datas: ImageData[] = []
    catalogs.forEach(catalog => {
        const func = async (): Promise<ImageData> => {
            try {
                const info = await getImageInfo(catalog.id)
                return { ...catalog, ...info }
            } catch {
                console.log('正在重试')
                return func()
            }
        }
        queue.add(func)
    })
    queue.on('completed', (result: ImageData) => {
        datas.push(result)
        console.log(`正在获取图片完整信息，已完成 ${(++finish / catalogs.length * 100).toFixed(2)}%`)
    })
    queue.on('idle', () => {
        resolve(datas)
    })
})

/** 下载全部图片 */
export const downloadAllImages = (datas: ImageData[], dirPath: string) => new Promise<void>(async resolve => {
    if (!existsSync(dirPath)) await mkdir(dirPath)
    const queue = new PQueue({ concurrency: 20 })
    let finish = 0
    const download = async (url: string, path: string) => {
        try {
            const data = await fetch(url).then(res => res.arrayBuffer())
            await writeFile(path, Buffer.from(data))
        } catch {
            await download(url, path)
        }
    }
    datas.forEach(data => {
        queue.add(() => download(data.image, join(dirPath, data.imageFilename)))
        queue.add(() => download(data.bigImage, join(dirPath, data.bigImageFilename)))
    })
    queue.on('completed', () => {
        console.log(`正在下载图片，已完成 ${(++finish / datas.length / 2 * 100).toFixed(2)}%`)
    })
    queue.on('idle', resolve)
})

export const saveDatas = async (allDatas: ImageData[], dirPath: string, pageSize: number) => {
    if (!existsSync(dirPath)) await mkdir(dirPath)
    const total = allDatas.length
    const allTagsMap = new Map<string, ImageDataFileItem[]>()
    const totalPage = Math.floor((total - 1) / pageSize) + 1
    const fileDatas: ImageDataFile[] = []
    const updateTime = new Date().toLocaleString()
    for (let page = 0; page < totalPage; page++) {
        const start = page * pageSize
        const list = allDatas.slice(start, start + pageSize).map<ImageDataFileItem>(item => {
            const fileItem: ImageDataFileItem = {
                title: item.title,
                id: item.id,
                date: item.date,
                imageFilename: item.imageFilename,
                bigImageFilename: item.bigImageFilename,
                tags: item.tags,
            }
            item.tags.forEach(tag => {
                if (!allTagsMap.has(tag)) allTagsMap.set(tag, [])
                allTagsMap.get(tag).push(fileItem)
            })
            return fileItem
        })
        const fileData: ImageDataFile = { page, pageSize, list, updateTime, allTags: [], total, totalPage }
        fileDatas.push(fileData)
    }
    const allTags = [...allTagsMap.keys()]
    fileDatas.forEach(async (fileData, page) => {
        const filename = `data_${page}.json`
        fileData.allTags = allTags
        await writeFile(join(dirPath, filename), JSON.stringify(fileData))
    })
    allTagsMap.forEach(async (fileDatas, tag) => {
        const total = fileDatas.length
        const totalPage = Math.floor((total - 1) / pageSize) + 1
        for (let page = 0; page < totalPage; page++) {
            const filename = `data_${tag}_${page}.json`
            const start = page * pageSize
            const list = fileDatas.slice(start, start + pageSize)
            const fileData: ImageDataFile = { page, pageSize, list, updateTime, allTags, total, totalPage }
            await writeFile(join(dirPath, filename), JSON.stringify(fileData))
        }
    })
    const initData: InitData = { totalPage, total, allTags, updateTime }
    await writeFile(join(dirPath, 'init.json'), JSON.stringify(initData))
}

if (import.meta.filename == process.argv[1]) {
    // 总页码
    const totalPage = 10  // 262
    // 图片文件保存路径
    const imageSaveDir = join(import.meta.dirname, '../../docs/images2')
    // 数据文件保存路径
    const datasFileDir = join(import.meta.dirname, '../../docs/datas2')
    // 数据文件每页数据条数
    const pageSize = 36

    const allCatalogs = await getAllCatalogs(totalPage)
    const allDatas = await getAllDatas(allCatalogs)
    await downloadAllImages(allDatas, imageSaveDir)
    // const allDatas = JSON.parse(readFileSync('datas.json').toString())
    await saveDatas(allDatas, datasFileDir, pageSize)
    console.log(`👉 图片文件保存路径：${imageSaveDir}`)
    console.log(`👉 数据文件保存路径：${datasFileDir}`)
}