import { PerspectiveCamera } from "three";
import Experience from "./experience";
import Sizes from "../utils/extensions/sizes";


class Camera {
    private experience: Experience 
    protected size: Sizes 
    
    public instance: PerspectiveCamera 
    
    constructor() {
        this.experience = Experience.getInstance()
        this.size = this.experience.size as Sizes

        this.instance = new PerspectiveCamera(35, this.size.aspectRatio, 0.1, 1000)
        this.init()
        this.size.on('resize', this.onResize.bind(this))
    }

    private init() {
        this.instance.position.set(0, 0, 5.375)
        this.instance.lookAt(0, 0, 0)

    }

    onResize() {
        this.instance.aspect = this.size.aspectRatio
        this.instance.updateProjectionMatrix()

        // console.log('resized')
    }
}

export default Camera