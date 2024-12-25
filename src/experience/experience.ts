import { Points, Scene } from 'three';

import Sizes from '../utils/extensions/sizes';
import TimeKeeper from '../utils/extensions/timeKeeper';
import Mouse from '../utils/mouse';

import Resources from '../utils/extensions/resources';
import Particles from './particle_scene/particles';
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
    public mouse: Mouse
    public resources: Resources

    //These are resources that I'll need to instantiate after the resources are 'ready'
    private particles: Particles | null = null



    constructor() {

        Experience.instance = this

        this.canvas = document.querySelector('canvas') as HTMLCanvasElement;
        this.size = new Sizes()
        this.time = new TimeKeeper()
        this.mouse = new Mouse()
        this.scene = new Scene()
        this.camera = new Camera()
        this.renderer = new Renderer()

        this.resources = new Resources()

        this.resources.on('ready', this.init.bind(this))

        
        
    }

    private init(): void {
        this.particles = new Particles('twoHundredKFemale')
        this.setupScenes()
        this.time.on('tick', this.render.bind(this)) //Eventually needs to be moved to inside the init function
    }

    private setupScenes(): void {
        if (!(this.particles === null)) {
            this.scene.add(this.particles.points as Points)
        }
        
    }


    public static getInstance(): Experience {
        if (!Experience.instance) {
            Experience.instance = new Experience()

        }

        return Experience.instance
    }

    private render(): void {
        // console.log('tick tock')
        this.renderer.instance.render(this.scene, this.camera.instance)
    }
}

export default Experience