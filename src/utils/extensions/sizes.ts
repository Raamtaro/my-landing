import EventEmitter from '../eventEmitter'

class Sizes extends EventEmitter {
    
    public width: number
    public height: number
    public pixelRatio: number
    public aspectRatio: number

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

        this.width = window.innerWidth
        this.height = window.innerHeight
        this.pixelRatio = Math.min(window.devicePixelRatio, 2)
        this.aspectRatio = this.width / this.height

        this.trigger('resize')
    }
}

export default Sizes