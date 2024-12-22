import { Scene } from 'three';
import Sizes from '../utils/extensions/sizes';
import TimeKeeper from '../utils/extensions/timeKeeper';
import Renderer from './renderer';
import Camera from './camera';

let instance: Experience | null = null;

declare global {
    interface Window {
      experience: Experience;
    }
}


class Experience {
    public canvas?: HTMLCanvasElement
    public size?: Sizes 
    public time?: TimeKeeper
    public scene?: Scene 
    public renderer?: Renderer 
    public camera?: Camera



    constructor() {
        if (instance) {
            return instance
        }

        instance = this
        window.experience = this

        this.canvas = document.querySelector('canvas') as HTMLCanvasElement;
        this.size = new Sizes()
        this.time = new TimeKeeper()
        this.scene = new Scene()
        this.camera = new Camera()
        this.renderer = new Renderer()

        this.time.on('tick', this.render.bind(this))
        
    }


    render() {
        // console.log('tick tock') // debug statement
        this.renderer!.instance.render(this.scene!, this.camera!.instance)
    }
}

export default Experience