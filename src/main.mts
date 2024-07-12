import van from 'vanjs-core'
import { ImageDataFile, ImageDataFileItem, InitData } from '../script/src/main.mjs'
import { shuffle, shuffleColors } from './utils.mjs'
import ScrollEventMaster from 'scroll-event-master'
import 'bootstrap/dist/css/bootstrap.css'
import '../css/main.css'

const { a, button, div, img } = van.tags

const App = () => {
    const tags = div({ class: 'tags hide-scrollbar d-flex gap-2 py-3 py-sm-4 sticky-top overflow-auto' })
    const images = div({ class: 'images row gy-4' })

    initApp(tags, images)

    return div({ class: 'container py-4 py-md-5' },
        div({ class: 'hstack' },
            div({ class: 'fs-3 fw-bold me-auto title' }, div({ class: 'd-inline text-danger' }, '不要害羞'), div({ class: 'd-inline text-success' }, ' 图片网')),
            a({ href: 'https://github.com/iuroc/haixiu', class: 'link-secondary', target: '_blank' }, 'Github')
        ),
        tags, images
    )
}

const initApp = async (tags: HTMLDivElement, images: HTMLDivElement) => {
    // 获取初始化数据
    const initData = await fetch('./datas/init.json').then(res => res.json()) as InitData
    // 载入标签列表
    van.add(tags, initData.allTags.map((tag, index) => button({ class: `btn btn-${shuffleColors[index % shuffleColors.length]} text-nowrap` }, tag)))
    // 创建顺序页码表
    const pages = Array.from({ length: initData.totalPage }, (_, index) => index)
    // 打乱后的页码表
    const shufflePages = shuffle(pages)
    // 获取打乱后的第一页数据
    const datas = await getDatas(shufflePages[0])
    // 加载图片列表
    loadImageList(images, datas.list, false)

    // 配置触底自动加页事件
    const scrollEventMaster = new ScrollEventMaster(window)
    scrollEventMaster.bottomOffset = 100
    let nowPage = 0
    scrollEventMaster.on('bottom', async () => {
        scrollEventMaster.bottomLock = true
        const datas = await getDatas(shufflePages[++nowPage])
        loadImageList(images, datas.list, true)
        scrollEventMaster.bottomLock = false
    })
}

/** 获取某一页的图片列表数据 */
const getDatas = async (page: number): Promise<ImageDataFile> => {
    return await fetch(`./datas/data_${page}.json`).then(res => res.json())
}

/** 图片列表卡片 */
const ImageCard = (data: ImageDataFileItem) => {
    return div({
        class: 'card', role: 'button', onclick() {
            open(`./images/${data.bigImageFilename}`)
        }
    },
        div({ class: 'ratio ratio-1x1' },
            img({ class: 'card-img-top', style: `pointer-events: none;`, alt: data.title, src: `./images/${data.imageFilename}` }),
        ),
        div({ class: 'card-body' },
            div({ class: 'card-title text-truncate fw-bold' }, data.title),
            div({ class: 'date card-text text-nowrap text-muted' }, data.date)
        )
    )
}

/** 根据列表数据创建列表项 */
const loadImageList = (element: HTMLDivElement, datas: ImageDataFileItem[], append: boolean = true) => {
    if (!append) element.innerHTML = ''
    van.add(element, datas.map(data => div({ class: 'col-xl-3 col-lg-4 col-6' }, ImageCard(data))))
}

van.add(document.body, App())