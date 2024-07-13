import van from 'vanjs-core'
import { ImageDataFile, ImageDataFileItem, InitData } from '../script/src/main.mjs'
import { shuffle } from './utils.mjs'
import ScrollEventMaster from 'scroll-event-master'
import 'bootstrap/dist/css/bootstrap.css'
import '../css/main.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'photoswipe/photoswipe.css'
import PhotoSwipe, { SlideData } from 'photoswipe'

const { a, div, img } = van.tags

const App = () => {
    const tags = div({ class: 'tags hide-scrollbar d-flex gap-2 py-3 py-sm-4 sticky-top overflow-auto' })
    const images = div({ class: 'images row gy-4', id: 'my-gallery' })

    initApp(tags, images)

    return div({ class: 'container py-4 py-sm-5' },
        div({ class: 'hstack' },
            div({ class: 'fs-3 fw-bold me-auto title' }, div({ class: 'd-inline text-danger' }, '不要害羞'), div({ class: 'd-inline text-success' }, ' 图片网')),
            a({ href: 'https://github.com/iuroc/haixiu', class: 'link-secondary focus-ring focus-ring-success', target: '_blank' }, 'Github')
        ),
        tags, images,
    )
}

const dataSource: SlideData[] = []

const initApp = async (tags: HTMLDivElement, images: HTMLDivElement) => {
    // 获取初始化数据
    const initData = await fetch('./datas/init.json').then(res => res.json()) as InitData
    // 载入标签列表
    const allTags = ['全部'].concat(initData.allTags)
    /** 当前活动的标签状态 */
    const activeTag = van.state('全部')
    van.add(tags, allTags.map((tag, index) => {
        const shuffleColors = ['dark'].concat(shuffle(['success', 'primary', 'danger', 'info', 'warning', 'secondary']))
        const color = shuffleColors[index % shuffleColors.length]
        const tagActive = van.derive(() => activeTag.val == tag)
        return div({
            async onclick() {
                window.scrollTo({
                    left: 0,
                    top: 0,
                    behavior: 'instant'
                })
                if (activeTag.val == tag) return
                activeTag.val = tag
                scrollEventMaster.bottomLock = false
                nowPage = 0
                if (tag == '全部') {
                    const datas = await getDatas(shufflePages[nowPage])
                    loadImageList(images, datas.list, false)
                } else {
                    const datas = await getDatasByTag(nowPage, tag)
                    loadImageList(images, datas.list, false)
                    if (datas.totalPage == nowPage + 1) scrollEventMaster.bottomLock = true
                }
            },
            class: () => `tag btn text-nowrap border border-2 border-${tagActive.val ? color : ''} btn-${tagActive.val ? color : 'light'}`
        }, tag)
    }))
    // 创建顺序页码表
    const pages = Array.from({ length: initData.totalPage }, (_, index) => index)
    // 打乱后的页码表
    const shufflePages = shuffle(pages)
    // 获取打乱后的第一页数据
    let nowPage = 0
    const datas = await getDatas(shufflePages[nowPage])
    // 加载图片列表
    loadImageList(images, datas.list, false)

    // 配置触底自动加页事件
    const scrollEventMaster = new ScrollEventMaster(window)
    scrollEventMaster.bottomOffset = 100
    scrollEventMaster.on('bottom', async () => {
        scrollEventMaster.bottomLock = true
        try {
            if (activeTag.val == '全部') {
                const datas = await getDatas(shufflePages[++nowPage])
                if (!datas.list) throw new Error('获取列表失败')
                loadImageList(images, datas.list, true)
                if (datas.totalPage == nowPage + 1) return
            } else {
                const datas = await getDatasByTag(++nowPage, activeTag.val)
                if (!datas.list) throw new Error('获取列表失败')
                loadImageList(images, datas.list, true)
                if (datas.totalPage == nowPage + 1) return
            }
            scrollEventMaster.bottomLock = false
        } catch { }
    })

    // 标签列表鼠标滚轮横向滚动
    tags.addEventListener('wheel', event => {
        event.preventDefault()
        tags.scrollLeft += event.deltaY
    })
}

/** 获取某一页的图片列表数据 */
const getDatas = async (page: number): Promise<ImageDataFile> => fetch(`./datas/data_${page}.json`).then(res => res.json())

/** 通过标签获取图片列表数据 */
const getDatasByTag = async (page: number, tag: string): Promise<ImageDataFile> => fetch(`./datas/data_${tag}_${page}.json`).then(res => res.json())

/** 图片列表卡片 */
const ImageCard = (data: ImageDataFileItem, index: number) => {
    return div({
        class: 'card', role: 'button', onclick() {
            const image = new Image()
            image.src = `./images/${data.bigImageFilename}`
            image.addEventListener('load', () => {
                if (dataSource.length > 100) {
                    const start = index > 50 ? index - 50 : 0
                    const nowIndex = index - start
                    const dataSourcePart = dataSource.slice(start, start + 100)
                    const pswp = new PhotoSwipe({
                        wheelToZoom: true,
                        dataSource: dataSourcePart,
                        index: nowIndex
                    })
                    pswp.init()
                } else {
                    const pswp = new PhotoSwipe({
                        wheelToZoom: true,
                        dataSource,
                        index
                    })
                    pswp.init()
                }
            })
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
    if (!append) element.innerHTML = '', dataSource.splice(0)
    van.add(element, datas.map(data => {
        dataSource.push({
            src: `./images/${data.bigImageFilename}`,
            width: data.width,
            height: data.height
        })
        return div({
            class: 'col-xl-3 col-lg-4 col-6',
        }, ImageCard(data, dataSource.length - 1))
    }))
}

van.add(document.body, App())