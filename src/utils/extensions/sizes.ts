import EventEmitter from '../eventEmitter'

class Sizes extends EventEmitter {
    
    protected width: number
    protected height: number
    protected pixelRatio: number
    protected aspectRatio: number

    constructor () {
        super()
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.pixelRatio = Math.min(window.devicePixelRatio, 2)
        this.aspectRatio = this.width / this.height

        window.addEventListener('resize', this.onResize.bind(this))
    }

    onResize() {
        console.log('Resized')
        this.trigger('resize')
    }
}

export default Sizes