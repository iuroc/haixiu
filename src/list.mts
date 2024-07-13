import van from 'vanjs-core'
import TagBox from './tagBox.mjs'
import { DataJSON, DataJSONListItem } from '../script/src/main.mjs'
import { SlideData } from 'photoswipe'
import { shuffle } from './utils.mjs'
import ScrollEventMaster from 'scroll-event-master'
import PhotoSwipeLightbox from 'photoswipe/lightbox'

const { div, img } = van.tags

export default class ImageList {
    element: HTMLDivElement
    tagBox?: TagBox
    scrollEventMaster?: ScrollEventMaster
    shufflePages: number[]
    lightbox?: PhotoSwipeLightbox
    readonly listData: DataJSONListItem[] = []
    /** 当前页码，必须在内容载入完成后才能更新该值
     * - 注意列表的页码和数据的页码不同，列表页码固定从 0 开始顺序增加
     * - 数据页码可以任意指定，用于加载数据 */
    currentPage = -1
    constructor(init: {
        element: HTMLDivElement
        totalPageNoTag: number
    }) {
        this.element = init.element
        this.element.className = `images row gy-4`
        this.shufflePages = shuffle(Array.from({ length: init.totalPageNoTag }, (_, index) => index))
    }

    /**
     * 加载指定页码的数据
     * @param page 数据页码
     * @throws {Error} 获取数据失败
     */
    static async getPageData(page: number, tag?: string) {
        const data = await fetch(tag ? `./datas/data_${tag}_${page}.json` : `./datas/data_${page}.json`).then(res => res.json()) as Partial<DataJSON>
        if (!data.list || data.list.length == 0) throw new Error('获取数据失败')
        return data as DataJSON
    }

    /** 根据页码加载卡片列表，这里的页码不等于接口的页码 */
    async loadPage(page: number, append: boolean) {
        if (!this.tagBox) throw new Error('未配置 tagBox')
        if (!this.lightbox) throw new Error('未配置 lightbox')
        if (!this.scrollEventMaster) throw new Error('未配置 this.scrollEventMaster')
        if (!append) this.clean()
        const currentTag = this.tagBox.currentTag.val
        const data = currentTag == '全部' ? await ImageList.getPageData(this.shufflePages[page]) : await ImageList.getPageData(page, currentTag)
        van.add(this.element, data.list.map(item => {
            if (!this.lightbox) throw new Error('未配置 lightbox')
            const cardIndex = this.listData.length
            this.listData.push(item)
            return div({ class: `col-xl-3 col-lg-4 col-6` }, ImageCard(item, cardIndex, this.lightbox))
        }))
        this.lightbox.options.dataSource = this.parseDataSource(this.listData)
        this.currentPage++
        this.scrollEventMaster.bottomLock = data.totalPage == page + 1
    }

    clean() {
        this.element.innerHTML = ''
        this.currentPage = -1
        this.listData.splice(0)
    }

    parseDataSource(listData: DataJSONListItem[]) {
        return listData.map<SlideData>(item => {
            return {
                src: `./images/${item.bigImageFilename}`,
                width: item.width,
                height: item.height,
            }
        })
    }
}

const ImageCard = (data: DataJSONListItem, index: number, lightbox: PhotoSwipeLightbox) => {
    return div({
        class: 'card', role: 'button', onclick() {
            lightbox.loadAndOpen(index)
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