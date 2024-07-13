import van from 'vanjs-core'

const { a, div } = van.tags

export default () => div({ class: 'hstack' },
    div({ class: 'fs-3 fw-bold me-auto title' },
        div({ class: 'd-inline text-danger' }, '不要害羞'), ' ',
        div({ class: 'd-inline text-success' }, '图片网')
    ),
    a({
        href: 'https://github.com/iuroc/haixiu',
        class: 'link-secondary focus-ring focus-ring-success',
        target: '_blank'
    }, 'Github')
)