import * as THREE from 'three'

import { WebGLRenderer } from "three";
import Experience from "./experience";
import Sizes from "../utils/extensions/sizes";


class Renderer {
    experience: Experience = new Experience()
    canvas: HTMLCanvasElement = this.experience.canvas as HTMLCanvasElement
    size: Sizes = this.experience.size as Sizes
    instance: WebGLRenderer 


    constructor () {
        this.instance = new WebGLRenderer(
            {
                canvas: this.canvas,
                antialias: true,

            }
        )
        this.init()
        this.size.on('resize', this.resize.bind(this))
    }

    private init() {
        this.instance.setSize(this.size.width, this.size.height)
        this.instance.setPixelRatio(this.size.pixelRatio)
        this.instance.outputColorSpace = THREE.SRGBColorSpace

        this.instance.setClearColor('#ebebeb')
    }

    public resize() {
        this.instance.setSize(this.size.width, this.size.height)
        this.instance.setPixelRatio(this.size.pixelRatio)

        console.log('resized')
    }
}

export default Renderer