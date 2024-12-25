import { Mesh, Points, Scene, WebGLRenderTarget } from 'three';
import * as THREE from 'three'

import Sizes from '../utils/extensions/sizes';
import TimeKeeper from '../utils/extensions/timeKeeper';
import Mouse from '../utils/mouse';

import Resources from '../utils/extensions/resources';
import Particles from './particle_scene/particles';

import Renderer from './renderer';
import Camera from './camera';

import ZScene from './z_scene/z_scene';

declare global {
    interface Window {
      experience: Experience;
    }
}

interface SceneObject {
    scene: Scene,
    target?: WebGLRenderTarget
}

class Experience {

    private static instance: Experience | null = null

    public canvas: HTMLCanvasElement
    public size: Sizes 
    public time: TimeKeeper
    // public scene: Scene 
    public renderer: Renderer 
    public camera: Camera
    public mouse: Mouse
    public resources: Resources

    private rendererables: (Points | Mesh)[] = []
    private scenes: SceneObject[] = []
    private zScene: ZScene


    //These are resources that I'll need to instantiate after the resources are 'ready'
    private particles: Particles | null = null



    constructor() {

        Experience.instance = this

        this.canvas = document.querySelector('canvas') as HTMLCanvasElement;
        this.size = new Sizes()
        this.time = new TimeKeeper()
        this.mouse = new Mouse()
        this.camera = new Camera()
        this.renderer = new Renderer()

        this.zScene = new ZScene()

        this.resources = new Resources()

        this.resources.on('ready', this.init.bind(this))
    }

    private init(): void {
        
        this.setupScenes()
        this.compileScenes()
        this.size.on('resize', this.resize.bind(this))
        this.time.on('tick', this.render.bind(this)) 
    }

    private setupScenes(): void {
        this.particles = new Particles('twoHundredKFemale')

        this.rendererables.push(this.particles.points as Points)

        let i = 0;
        this.rendererables.forEach(
            (item) => {
                this.scenes.push({scene: new Scene})
                this.scenes[i].scene.add(item)
                this.scenes[i].scene.add(this.camera.instance)
                i++
            }
        )
        
    }

    private compileScenes(): void {
        this.scenes.forEach(
            (obj) => {
                this.renderer.instance.compile(obj.scene, this.camera.instance)
                obj.target = new WebGLRenderTarget(this.size.width * this.size.pixelRatio, this.size.height * this.size.pixelRatio, {
                    type: THREE.FloatType
                })

                obj.target.texture.generateMipmaps = false
            }
        )
    }


    public static getInstance(): Experience {
        if (!Experience.instance) {
            Experience.instance = new Experience()

        }

        return Experience.instance
    }

    private resize(): void {
        this.scenes.forEach(
            (obj) => {
                if (obj.target) obj.target.setSize(this.size.width * this.size.pixelRatio, this.size.height*this.size.pixelRatio)
            }
        )
    }

    

    private setupPipeline (): void {
        this.scenes.forEach(
            (obj) => {
                this.runPipeline(obj)
            }
        )

        this.renderer.instance.setRenderTarget(null)
    }

    private runPipeline(object: SceneObject): void {

        this.renderer.instance.setRenderTarget(object.target as WebGLRenderTarget)
        this.renderer.instance.render(object.scene, this.camera.instance)
    }

    private updateZUniforms(): void {
        this.zScene.shaderMaterial.uniforms.uTexture1.value = this.scenes[0].target!.texture
    }

    private render(): void {

        //Setup Pipeline
        this.setupPipeline()
        this.updateZUniforms()


        // this.renderer.instance.render(this.scenes[0].scene, this.camera.instance)
        this.renderer.instance.render(this.zScene.instance, this.zScene.camera)

    }
}

export default Experience