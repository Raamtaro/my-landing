import { PerspectiveCamera } from "three";
import Experience from "./experience";
import Sizes from "../utils/extensions/sizes";

import { OrbitControls } from "three/examples/jsm/Addons.js";
import TimeKeeper from "../utils/extensions/timeKeeper";


class Camera {
    private experience: Experience 
    private canvas: HTMLCanvasElement
    protected size: Sizes 
    private time: TimeKeeper
    private controls: OrbitControls | null = null
    
    public instance: PerspectiveCamera 
    
    constructor() {
        this.experience = Experience.getInstance()
        this.canvas = this.experience.canvas
        this.size = this.experience.size as Sizes
        this.time = this.experience.time

        this.instance = new PerspectiveCamera(35, this.size.aspectRatio, 0.1, 1000)
        
        this.init()
        this.size.on('resize', this.onResize.bind(this))
        this.time.on('tick', this.updateControls.bind(this))
    }

    private init(): void {
        this.instance.position.set(0, 0, 5.375)
        this.instance.lookAt(0, 0, 0)
        this.setControls()

    }

    private setControls(): void {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true
    }

    private updateControls(): void {
        if (!this.controls) return
        this.controls.update()
    }

    private onResize(): void {
        this.instance.aspect = this.size.aspectRatio
        this.instance.updateProjectionMatrix()

        // console.log('resized')
    }
}

export default Camera