import van from 'vanjs-core'
import Header from './header.mjs'
import TagBox from './tagBox.mjs'
import ImageList from './list.mjs'
import { InitJSON } from '../script/src/main.mjs'
import ScrollEventMaster from 'scroll-event-master'
import PhotoSwipe from 'photoswipe'
import PhotoSwipeLightbox from 'photoswipe/lightbox'

const { div } = van.tags

const App = () => {
    const tagBox = div()
    const imageList = div()

    initApp({ tagBox, imageList })

    return div({ class: 'container py-4 py-sm-5' },
        Header(),
        tagBox,
        imageList,
    )
}

const initApp = async (init: {
    tagBox: HTMLDivElement
    imageList: HTMLDivElement
}) => {
    const initData = await getInitData()
    const lightbox = new PhotoSwipeLightbox({ pswpModule: PhotoSwipe })
    const imageList = new ImageList({
        element: init.imageList,
        totalPageNoTag: initData.totalPage,
        lightbox
    })
    const scrollEventMaster = initScrollEventMaster(imageList)
    imageList.scrollEventMaster = scrollEventMaster
    const tagBox = new TagBox({ tags: ['全部'].concat(initData.allTags), imageList, element: init.tagBox })
    imageList.tagBox = tagBox
    imageList.loadPage(0, false)
}

const initScrollEventMaster = (imageList: ImageList) => {
    const obj = new ScrollEventMaster(window)
    obj.bottomOffset = 100
    obj.on('bottom', async () => {
        if (!imageList.scrollEventMaster) throw new Error('未配置 scrollEventMaster')
        imageList.scrollEventMaster.bottomLock = true
        try {
            await imageList.loadPage(imageList.currentPage + 1, true)
        } catch {
            return
        }
    })
    return obj
}

const getInitData = () => fetch('./datas/init.json').then(res => res.json()) as Promise<InitJSON>

export default App