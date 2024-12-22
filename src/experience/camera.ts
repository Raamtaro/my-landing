import { PerspectiveCamera } from "three";
import Experience from "./experience";
import Sizes from "../utils/extensions/sizes";


class Camera {
    protected experience: Experience = new Experience()
    protected size: Sizes = this.experience.size as Sizes
    public instance: PerspectiveCamera = new PerspectiveCamera(35, this.size.aspectRatio, 0.1, 1000)
    
    constructor() {
        this.init()
        this.size.on('resize', this.onResize.bind(this))
    }

    private init() {
        this.instance.position.set(0, 0, 6.5)
        this.instance.lookAt(0, 0, 0)

    }

    onResize() {
        this.instance.aspect = this.size.aspectRatio
        this.instance.updateProjectionMatrix()

        // console.log('resized')
    }
}

export default Camera