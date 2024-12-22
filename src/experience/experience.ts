import { Scene } from 'three';
import Sizes from '../utils/extensions/sizes';
import Renderer from './renderer';

let instance: Experience | null = null;

declare global {
    interface Window {
      experience: Experience;
    }
}


class Experience {
    public canvas?: HTMLCanvasElement
    public size?: Sizes 
    public scene?: Scene 
    public renderer?: Renderer 


    constructor() {
        if (instance) {
            return instance
        }

        instance = this
        window.experience = this

        this.canvas = document.querySelector('canvas') as HTMLCanvasElement;
        this.size = new Sizes()
        this.scene = new Scene()
        this.renderer = new Renderer()
        
    }
}

export default Experience