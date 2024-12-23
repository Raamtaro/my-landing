import { Scene } from 'three';

import Sizes from '../utils/extensions/sizes';
import TimeKeeper from '../utils/extensions/timeKeeper';

import Resources from '../utils/extensions/resources';
// import ModelInfo from '../data/type';

import Renderer from './renderer';
import Camera from './camera';

declare global {
    interface Window {
      experience: Experience;
    }
}

class Experience {

    private static instance: Experience | null = null

    public canvas: HTMLCanvasElement
    public size: Sizes 
    public time: TimeKeeper
    public scene: Scene 
    public renderer: Renderer 
    public camera: Camera

    public resources: Resources



    constructor() {

        Experience.instance = this

        this.canvas = document.querySelector('canvas') as HTMLCanvasElement;
        this.size = new Sizes()
        this.time = new TimeKeeper()
        this.scene = new Scene()
        this.camera = new Camera()
        this.renderer = new Renderer()

        this.resources = new Resources()

        this.time.on('tick', this.render.bind(this))
        
    }


    public static getInstance(): Experience {
        if (!Experience.instance) {
            Experience.instance = new Experience()

        }

        return Experience.instance
    }

    private render() {
        
        this.renderer.instance.render(this.scene, this.camera.instance)
    }
}

export default Experience