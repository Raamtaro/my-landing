import EventEmitter from "../eventEmitter";

class TimeKeeper extends EventEmitter {
    private start: number
    private current: number
    private elapsed: number = 0
    private delta: number = 16
    public uniformElapsed: number = 0
    public uniformDelta: number = 0

    constructor() {
        super()
        this.start = Date.now()
        this.current = this.start
        
        this.tick()
        
    }

    private tick() {
        
        const currentTime = Date.now()

        this.delta = currentTime - this.current
        this.current = currentTime
        this.elapsed = this.current - this.start

        this.uniformElapsed = this.elapsed/1000
        this.uniformDelta = this.delta/1000

        this.trigger('tick')
        requestAnimationFrame(this.tick.bind(this))
    }
}

export default TimeKeeper