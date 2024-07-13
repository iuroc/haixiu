import van from 'vanjs-core'
import { shuffle } from './utils.mjs'
import ImageList from './list.mjs'

const { button } = van.tags

class TagBox {
    /** 标签容器元素 */
    element: HTMLDivElement
    /** 当前激活状态的标签名称 */
    currentTag = van.state('全部')
    /** 标签容器中全部标签名称 */
    tags: string[]
    /** 绑定的图片列表组件 */
    imageList: ImageList

    constructor(init: { tags: string[], currentTag?: string, imageList: ImageList, element: HTMLDivElement }) {
        this.tags = init.tags
        this.imageList = init.imageList
        this.element = init.element
        if (init.currentTag) this.currentTag.val = init.currentTag

        this.element.className = `tag-box hide-scrollbar d-flex gap-2 py-3 py-sm-4 sticky-top overflow-auto`
        van.add(this.element, this.tags.map((tag, index) => {
            const shuffleColors = ['dark'].concat(shuffle(['success', 'primary', 'danger', 'info', 'warning', 'secondary']))
            const color = shuffleColors[index % shuffleColors.length]
            const tagActive = van.derive(() => this.currentTag.val == tag)
            const clsssList = van.derive(() => `btn text-nowrap border border-2 border-${tagActive.val ? color : ''} btn-${tagActive.val ? color : 'light'}`)
            return button({ class: clsssList, onclick: () => this.onTagClick(tag) }, tag)
        }))

        // 标签列表鼠标滚轮横向滚动
        this.element.addEventListener('wheel', event => {
            event.preventDefault()
            this.element.scrollLeft += event.deltaY
        })
    }

    async onTagClick(tag: string) {
        if (!this.imageList.scrollEventMaster) throw new Error('未配置 scrollEventMaster')
        scrollTo({
            left: 0,
            top: 0,
            behavior: 'instant'
        })
        this.currentTag.val = tag
        this.imageList.scrollEventMaster.bottomLock = true
        try {
            await this.imageList.loadPage(0, false)
        } catch { }
    }
}

export default TagBox