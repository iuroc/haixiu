import van from 'vanjs-core'
import { DataJSON, DataJSONListItem, InitJSON } from '../script/src/main.mjs'
import { shuffle } from './utils.mjs'
import ScrollEventMaster from 'scroll-event-master'
import 'bootstrap/dist/css/bootstrap.css'
import '../css/main.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'photoswipe/photoswipe.css'
import PhotoSwipe, { SlideData } from 'photoswipe'

const { a, div, img } = van.tags

class ImageList {
    static element = div({ class: 'images row gy-4' })
    static nowPage = 0
    /** 打乱后的页码表 */
    static shufflePages: number[]
    static scrollEventMaster: ScrollEventMaster
    /** 当前活动的标签状态 */
    static activeTag = van.state('全部')
    /** 通过标签获取图片列表数据 */
    static getDatasByTag = async (page: number, tag: string): Promise<DataJSON> => fetch(`./datas/data_${tag}_${page}.json`).then(res => res.json())
    static dataSource: SlideData[] = []
    /** 根据页码初始化列表项 */
    static async loadList(page: number, append: boolean = false) {
        if (!append) {
            this.element.innerHTML = ''
            this.dataSource.splice(0)
        }
        const datas = this.activeTag.val == '全部'
            ? await this.getDatas(this.shufflePages[page])
            : await this.getDatasByTag(page, this.activeTag.val)
        if (!datas.list) throw new Error('获取列表失败')
        van.add(this.element, datas.list.map(data => {
            this.dataSource.push({
                src: `./images/${data.bigImageFilename}`,
                width: data.width,
                height: data.height
            })
            return div({
                class: 'col-xl-3 col-lg-4 col-6',
            }, ImageCard(data, ImageList.dataSource.length - 1))
        }))
        return datas.list
    }

    /** 获取某一页的图片列表数据 */
    static getDatas = async (page: number): Promise<DataJSON> => fetch(`./datas/data_${page}.json`).then(res => res.json())
}

const App = () => {
    const tags = div({ class: 'tags hide-scrollbar d-flex gap-2 py-3 py-sm-4 sticky-top overflow-auto' })

    initApp(tags, ImageList.element)

    return div({ class: 'container py-4 py-sm-5' },
        div({ class: 'hstack' },
            div({ class: 'fs-3 fw-bold me-auto title' }, div({ class: 'd-inline text-danger' }, '不要害羞'), div({ class: 'd-inline text-success' }, ' 图片网')),
            a({ href: 'https://github.com/iuroc/haixiu', class: 'link-secondary focus-ring focus-ring-success', target: '_blank' }, 'Github')
        ),
        tags, ImageList.element,
    )
}

const initApp = async (tags: HTMLDivElement, images: HTMLDivElement) => {
    // 获取初始化数据
    const initData = await fetch('./datas/init.json').then(res => res.json()) as InitJSON
    // 载入标签列表
    const allTags = ['全部'].concat(initData.allTags)

    van.add(tags, allTags.map((tag, index) => {
        const shuffleColors = ['dark'].concat(shuffle(['success', 'primary', 'danger', 'info', 'warning', 'secondary']))
        const color = shuffleColors[index % shuffleColors.length]
        const tagActive = van.derive(() => ImageList.activeTag.val == tag)
        return div({
            async onclick() {
                window.scrollTo({
                    left: 0,
                    top: 0,
                    behavior: 'instant'
                })
                if (ImageList.activeTag.val == tag) return
                ImageList.activeTag.val = tag
                ImageList.scrollEventMaster.bottomLock = false
                ImageList.loadList(0)
            },
            class: () => `tag btn text-nowrap border border-2 border-${tagActive.val ? color : ''} btn-${tagActive.val ? color : 'light'}`
        }, tag)
    }))
    // 创建顺序页码表
    const pages = Array.from({ length: initData.totalPage }, (_, index) => index)
    // 打乱后的页码表
    ImageList.shufflePages = shuffle(pages)
    ImageList.loadList(ImageList.shufflePages[ImageList.nowPage])
    // 配置触底自动加页事件
    ImageList.scrollEventMaster = new ScrollEventMaster(window)
    ImageList.scrollEventMaster.bottomOffset = 100
    ImageList.scrollEventMaster.on('bottom', async () => {
        ImageList.scrollEventMaster.bottomLock = true
        try {
            await ImageList.loadList(++ImageList.nowPage, true)
            ImageList.scrollEventMaster.bottomLock = false
        } catch { }
    })

    // 标签列表鼠标滚轮横向滚动
    tags.addEventListener('wheel', event => {
        event.preventDefault()
        tags.scrollLeft += event.deltaY
    })
}

/** 获取某一页的图片列表数据 */
const getDatas = async (page: number): Promise<DataJSON> => fetch(`./datas/data_${page}.json`).then(res => res.json())

const makeDataSourcePart = (index: number, limit: number, dataSource: SlideData[]): {
    dataSource: SlideData[]
    index: number
    start: number
    end: number
} => {
    if (dataSource.length > limit) {
        const end = index + limit - 1 >= dataSource.length ? dataSource.length - 1 : index + limit - 1
        const start = end > limit - 1 ? end - limit + 1 : 0
        const nowIndex = index - start
        const dataSourcePart = dataSource.slice(start, end + 1)
        return { dataSource: dataSourcePart, index: nowIndex, start, end }
    } else {
        return { dataSource, index, start: 0, end: dataSource.length - 1 }
    }
}

/** 图片列表卡片 */
const ImageCard = (data: DataJSONListItem, index: number) => {
    return div({
        class: 'card', role: 'button', onclick() {
            /** 图片查看器中最多同时存在的图片数量 */
            const limit = 200
            const result = makeDataSourcePart(index, limit, ImageList.dataSource)
            const pswp = new PhotoSwipe({
                wheelToZoom: true,
                dataSource: result.dataSource,
                index: result.index
            })
            pswp.on('change', async () => {
                const indexAfterChange = pswp.currIndex
                if (indexAfterChange == pswp.getNumItems() - 1) {
                    const datas = await ImageList.loadList(++ImageList.nowPage, true)
                    const nowIndex = indexAfterChange - datas.length
                    pswp.options.dataSource = (pswp.options.dataSource as SlideData[]).slice(datas.length).concat(ImageList.dataSource.slice(ImageList.dataSource.length - datas.length))
                    pswp.goTo(nowIndex)
                    pswp.refreshSlideContent(nowIndex)
                }
            })
            pswp.init()
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

van.add(document.body, App())