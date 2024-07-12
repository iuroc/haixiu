import van from 'vanjs-core'

const { div, img } = van.tags

const App = () => {
    return div(
        img({ src: '/images/0b3da20924460b20ea8fe34c927aef06.jpeg' })
    )
}

van.add(document.body, App())