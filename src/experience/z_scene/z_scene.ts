import Experience from "../experience";
import Sizes from "../../utils/extensions/sizes";
import Mouse from "../../utils/mouse";
import TimeKeeper from "../../utils/extensions/timeKeeper";

import { IUniform, ShaderMaterial, Mesh, PlaneGeometry, Scene, OrthographicCamera, Uniform, Vector2 } from "three";

import postVertex from './shaders/vertex.glsl'
import postFrag from './shaders/fragment.glsl'

interface PostUniforms {
    [name: string]: IUniform
}

class ZScene {
    private experience: Experience
    private size: Sizes
    private time: TimeKeeper
    private mouse: Mouse
    private quad: Mesh
    private uniforms: PostUniforms
    
    
    public instance: Scene
    public camera: OrthographicCamera
    public shaderMaterial: ShaderMaterial
    

    constructor () {
        this.experience = Experience.getInstance()
        this.size = this.experience.size
        this.time = this.experience.time
        this.mouse = this.experience.mouse

        this.instance = new Scene()
        

        this.camera = this.setupCamera(1, 1)

        this.uniforms = {
            // uParticleSceneTexture: new Uniform(this.loader.load(polarBearTexture)), //Hello world
            uTime: new Uniform(0.0),
            uMouse: new Uniform(new Vector2(10, -10)),
            uTransitionProgress: new Uniform(0.0),
            uHoverProgress: new Uniform(0.0),
            uTexture1: new Uniform(null),
            uTexture2: new Uniform(null),
            uResolution: new Uniform(new Vector2(this.size.width * this.size.pixelRatio, this.size.height * this.size.pixelRatio)),
            uRadius: new Uniform(0.09),
        }

        this.shaderMaterial = new ShaderMaterial(
            {
                uniforms: this.uniforms,
                vertexShader: postVertex,
                fragmentShader: postFrag,
                defines: {
                    PI: Math.PI,
                    PR: window.devicePixelRatio.toFixed(1),
                }
            }
        )

        this.quad = new Mesh(
            new PlaneGeometry(1, 1),
            this.shaderMaterial
        )

        this.init()
        this.size.on('resize', this.resize.bind(this))
        this.time.on('tick', this.updateUniforms.bind(this))

    }

    private init(): void {this.instance.add(this.quad)}

    private setupCamera (frustum: number, aspect: number): OrthographicCamera {
        return new OrthographicCamera(
            frustum * aspect / -2,
            frustum * aspect / 2,
            frustum/2, 
            frustum / -2,
            -1000,
            1000
        )
    }

    private resize (): void {
        this.shaderMaterial.uniforms.uResolution.value.set(this.size.width * this.size.pixelRatio, this.size.height * this.size.pixelRatio)
    }

    private updateUniforms () {
        this.shaderMaterial.uniforms.uMouse.value.x = this.mouse.coords_trail.x
        this.shaderMaterial.uniforms.uMouse.value.y = this.mouse.coords_trail.y

        this.shaderMaterial.uniforms.uTime.value = this.time.uniformElapsed
        // console.log(this.material.uniforms.uMouse)
        
    }
}

export default ZScene