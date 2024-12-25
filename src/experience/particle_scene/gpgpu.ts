import { GPUComputationRenderer, Variable } from "three/examples/jsm/Addons.js"
import { Uniform, Vector2, BufferGeometry, Scene, TypedArray, Texture, Mesh, PlaneGeometry, MeshBasicMaterial } from "three"

//Singleton
import Experience from "../experience"
// import Sizes from "../../utils/extensions/sizes"
import TimeKeeper from "../../utils/extensions/timeKeeper"
import Renderer from "../renderer"

//WebGL
import computation from './shaders/gpgpu/particles.glsl'


class Gpgpu {
    private experience: Experience
    private scene: Scene
    private time: TimeKeeper
    private renderer: Renderer
    private baseGeometry: BufferGeometry
    private positionArray: TypedArray
    private baseParticlesTexture: Texture

    //Debug
    private debug: Mesh | null = null
    

    //Passed up
    public count: number
    public size: number

    public instance: GPUComputationRenderer
    public particlesVariable: Variable 


    constructor(baseGeometry: BufferGeometry) {
        this.experience = Experience.getInstance()
        this.scene = this.experience.scene


        this.time = this.experience.time
        // this.dimensions = this.experience.size

        this.renderer = this.experience.renderer
        this.baseGeometry = baseGeometry
        this.count = this.baseGeometry.attributes.position.count
        this.positionArray = this.baseGeometry.attributes.position.array
        this.size = Math.ceil(Math.sqrt(this.count))

        this.instance = new GPUComputationRenderer(this.size, this.size, this.renderer.instance)

        this.baseParticlesTexture = this.instance.createTexture()
        this.populateBaseTexture()
        
        this.particlesVariable = this.instance.addVariable('uParticles', computation, this.baseParticlesTexture) as Variable
        this.configParticlesVariable()

        // console.log(this.particlesVariable)

        this.instance.init()

        this.addDebug() //working

        this.time.on('tick', this.update.bind(this))
    }

    private populateBaseTexture(): void {
        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3 
            const i4 = i * 4

            //Set Positions
            this.baseParticlesTexture.image.data[i4 + 0] = this.positionArray[i3 + 0]
            this.baseParticlesTexture.image.data[i4 + 1] = this.positionArray[i3 + 1]
            this.baseParticlesTexture.image.data[i4 + 2] = this.positionArray[i3 + 2]
            this.baseParticlesTexture.image.data[i4 + 3] = Math.random()
        }
        // console.log(this.baseParticlesTexture.image.data) //Debug log statement
    }

    private configParticlesVariable(): void {
        this.instance.setVariableDependencies(this.particlesVariable, [this.particlesVariable])
        this.particlesVariable.material.uniforms.uTime = new Uniform(0)
        this.particlesVariable.material.uniforms.uDeltaTime = new Uniform(0)
        this.particlesVariable.material.uniforms.uBase = new Uniform(this.baseParticlesTexture)
        this.particlesVariable.material.uniforms.uFlowFieldInfluence = new Uniform(0.304)
        this.particlesVariable.material.uniforms.uFlowFieldStrength = new Uniform(0.0)
        this.particlesVariable.material.uniforms.uFlowFieldFrequency = new Uniform(0.672)
        this.particlesVariable.material.uniforms.uVelocity = new Uniform(0.0)
        this.particlesVariable.material.uniforms.uMouse = new Uniform(new Vector2(-10.0, 10.0))        
    }

    private addDebug(): void {
        this.debug = new Mesh(
            new PlaneGeometry(3, 3),
            new MeshBasicMaterial(
                {
                    map: this.instance.getCurrentRenderTarget(this.particlesVariable).texture
                }
            )
        )
        this.scene.add(this.debug)
        this.debug.visible = false
    }

    private update(): void {

        this.particlesVariable.material.uniforms.uTime.value = this.time.uniformElapsed
        this.particlesVariable.material.uniforms.uDeltaTime.value = this.time.uniformDelta

        this.instance.compute()

    }
}

export default Gpgpu