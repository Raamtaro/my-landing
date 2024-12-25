import Sizes from "../../utils/extensions/sizes"
import TimeKeeper from "../../utils/extensions/timeKeeper"
import Mouse from "../../utils/mouse"
import Experience from "../experience"
import Gpgpu from "./gpgpu"
import { BufferGeometry, Vector2, Uniform, ShaderMaterial, BufferAttribute, Points, Texture, Mesh, IUniform } from "three"
import { GLTF } from "three/examples/jsm/Addons.js"

import particleSimVertex from './shaders/particles/vertex.glsl'
import particleSimFrag from './shaders/particles/fragment.glsl'

type ResourceFile = GLTF | Texture

interface ResourceDictionary {
    [name: string]: ResourceFile
}

interface ParticleUniforms {
    [name: string]: IUniform
}


class Particles {

    private experience: Experience
    private dimensons: Sizes
    private time: TimeKeeper
    private mouse: Mouse
    private models: ResourceDictionary
    private geometry: BufferGeometry 
    private gpgpu: Gpgpu
    private bufferGeometry: BufferGeometry
    private count: number
    private size: number //This is the size of the gpgpu sim
    private particlesUvArray: Float32Array
    private sizesArray: Float32Array
    private shaderMaterial: ShaderMaterial
    private uniforms: ParticleUniforms
    

    //Set later
    private baseScale: boolean | null = null
    public points: Points | null = null
    

    constructor(name: string) {

        //Setup 
        this.experience = Experience.getInstance()
        this.dimensons = this.experience.size
        this.time = this.experience.time
        this.mouse = this.experience.mouse
        this.models = this.experience.resources.items
        console.log(this.models)

        //Simulation 
        this.geometry = this.setGeometry(name)
        this.gpgpu = new Gpgpu(this.geometry)
        this.count = this.gpgpu.count
        this.size = this.gpgpu.size

        this.particlesUvArray = new Float32Array(this.count * 2)
        this.sizesArray = new Float32Array(this.count)
        this.populateArrays()

        this.bufferGeometry = new BufferGeometry()
        this.uniforms = {
            uTime: new Uniform(0.0),
            uSize: new Uniform(0.005),
            uResolution: new Uniform(new Vector2(this.dimensons.width * this.dimensons.pixelRatio, this.dimensons.height * this.dimensons.pixelRatio)),
            uParticlesTexture: new Uniform(undefined),
            uAlpha: new Uniform(0.0),
            uMouse: new Uniform(new Vector2(-10.0, 10.0))
        }

        this.shaderMaterial = new ShaderMaterial(
            {
                uniforms: this.uniforms,
                vertexShader: particleSimVertex,
                fragmentShader: particleSimFrag
            }
        )

        this.setupPoints()
        this.dimensons.on('resize', this.resize.bind(this))
        this.time.on('tick', this.update.bind(this))
    }

    private setGeometry(name: string): BufferGeometry {
        let model: ResourceFile = this.models[name] as GLTF
        let geometry: BufferGeometry | null = null

        model.scene.traverse((child)=> {
            if (child instanceof Mesh) {
                geometry = child.geometry
                return
            }
        })

        if (!geometry) {
            throw new Error(`No mesh geometry found for model: ${name}`)
        }

        return geometry 
    }

    private populateArrays(): void {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const i = (y * this.size + x)
                const i2 = i * 2

                //normalise 0 -> 1 
                const uvX = (x + 0.5) / this.size
                const uvY = (y + 0.5) / this.size

                this.particlesUvArray[i2 + 0] = uvX
                this.particlesUvArray[i2 + 1] = uvY

                //size
                this.sizesArray[i] = Math.random()
            }
        }        
    }

    private setupPoints(): void {
        this.bufferGeometry.setDrawRange(0, this.count)
        this.bufferGeometry.setAttribute('aParticlesUv', new BufferAttribute(this.particlesUvArray, 2))
        this.bufferGeometry.setAttribute('aSize', new BufferAttribute(this.sizesArray, 1))
        

        this.points = new Points(this.bufferGeometry, this.shaderMaterial)
        //Check to set the right size at first

        if (this.dimensons.width <= 1000) {
            this.points.scale.set(.1375, .1375, .1375)
            this.baseScale = false
        } 
        else {
            this.points.scale.set(0.175, 0.175, 0.175) //1000 and above
            this.baseScale = true //This means that we are scaling for 1000+
        }

        
        

        this.points.frustumCulled = false

        this.points.renderOrder = 0
        this.points.position.set(0, 0, 0)
        
    }

    private resize(): void {
        this.scaleResize()
        this.shaderMaterial.uniforms.uResolution.value.set(this.dimensons.width * this.dimensons.pixelRatio, this.dimensons.height * this.dimensons.pixelRatio)
    }

    private scaleResize(): void {
        // console.log(Setup.width)
        if (this.dimensons.width <= 1000) { //Will get caught if we resize to 1000 or under
            if (this.baseScale && !(this.points === null)) { //Checking to see what the baseScale is set at
                this.points.scale.set(.1375, .1375, .1375)
                this.baseScale = false //This means that we are viewing with a smaller screen
            }
            return //If it reaches here, then this.baseScale was already false, and there's no action needs
        }

        //Will pass the above check as long as we resize to above 1000

        if (!this.baseScale && !(this.points === null)) { //Is the screen small?
            this.points.scale.set(.175, .175, .175)
            this.baseScale = true
        }
        return
    }

    private update(): void {
        this.shaderMaterial.uniforms.uParticlesTexture.value = this.gpgpu.instance.getCurrentRenderTarget(this.gpgpu.particlesVariable).texture

        this.shaderMaterial.uniforms.uMouse.value.x = this.mouse.coords_trail.x
        this.shaderMaterial.uniforms.uMouse.value.y = this.mouse.coords_trail.y

        this.shaderMaterial.uniforms.uTime.value = this.time.uniformElapsed

        //Rotations with Mouse coordinates
        if (!(this.points === null))
        {
            this.points.rotation.x = -this.mouse.coords_trail.y * 0.25 + Math.PI/16
            this.points.rotation.y = this.mouse.coords_trail.x * 0.225

            //Slight Rotation with time
            this.points.rotation.x += 0.05 * Math.sin(this.points.rotation.y + this.time.uniformElapsed*0.4 )
        }
    }
}

export default Particles