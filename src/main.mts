import van from 'vanjs-core'
import imageSrc from '/images/0b3da20924460b20ea8fe34c927aef06.jpeg'

const { div, img } = van.tags

console.log(imageSrc)

const App = () => {
    return div(
        img({ src: imageSrc })
    )
}

van.add(document.body, App())