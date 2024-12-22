import * as THREE from 'three'
import Sizes from '../utils/extensions/sizes';

let instance: Experience | null = null;

declare global {
    interface Window {
      experience: Experience;
    }
}


class Experience {
    canvas?: HTMLCanvasElement;
    size: Sizes = new Sizes()


    constructor(canvas: HTMLCanvasElement) {
        if (instance) {
            return instance
        }

        instance = this
        window.experience = this

        //Scene Setup
        this.canvas = canvas
    }
}

export default Experience