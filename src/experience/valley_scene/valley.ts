import * as THREE from 'three'
import {ShaderMaterial, IUniform, CanvasTexture, PlaneGeometry, Mesh} from 'three'
import Experience from "../experience";
import TimeKeeper from '../../utils/extensions/timeKeeper';

import terrainVertex from './shaders/terrain/vertex.glsl'
import terrainFrag from './shaders/terrain/fragment.glsl'

import depthVertex from './shaders/depth/vertex.glsl'
import depthFrag from './shaders/depth/fragment.glsl'


interface ValleyUniforms {
    [name: string]: IUniform
}

interface TerrainCanvasTexture {
    visible: boolean,
    linesCount: number,
    bigLineWidth: number,
    smallLineWidth: number,
    smallLineAlpha: number,
    width: number,
    height: number,
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D | null,
    instance: CanvasTexture | null
}

class Valley {
    private experience: Experience
    
    private time: TimeKeeper
    private shaderMaterial: ShaderMaterial
    private depthMaterial: ShaderMaterial | null = null
    private geometry: PlaneGeometry 
    private uniforms: ValleyUniforms
    private texture: TerrainCanvasTexture = {
        visible: false,
        linesCount: 5,
        bigLineWidth: 0.08,
        smallLineWidth: 0.01,
        smallLineAlpha: 0.5,
        width: 1,
        height: 128,
        canvas: document.createElement('canvas'),
        context: null,
        instance: null
    }

    public instance: Mesh
    

    constructor() {
        this.experience = Experience.getInstance()
       
        this.time = this.experience.time

        this.setupCanvasTexture()
        this.updateTexture()

        this.geometry = new THREE.PlaneGeometry(1, 1, 1000, 1000)
        this.geometry.rotateX(- Math.PI * 0.501)
        

        this.uniforms = {
            uTexture: new THREE.Uniform(this.texture.instance),
            uElevation: new THREE.Uniform(2.0),
            uElevationValley: new THREE.Uniform(0.4),
            uElevationValleyFrequency: new THREE.Uniform(1.5),
            uElevationGeneral: new THREE.Uniform(0.2),
            uElevationGeneralFrequency: new THREE.Uniform(0.2),
            uElevationDetails: new THREE.Uniform(0.2),
            uElevationDetailsFrequency: new THREE.Uniform(2.012),
            uTextureFrequency: new THREE.Uniform(10.0),
            uTextureOffset: new THREE.Uniform(0.585),
            uTime: new THREE.Uniform(0.0),
            uHslHue: new THREE.Uniform(1.0),
            uHslHueOffset: new THREE.Uniform(0.0),
            uHslHueFrequency: new THREE.Uniform(10.0),
            uHslTimeFrequency: new THREE.Uniform(0.05),
            uHslLightness: new THREE.Uniform(0.25),
            uHslLightnessVariation: new THREE.Uniform(0.25),
            uHslLightnessFrequency: new THREE.Uniform(20.0)
        }

        this.shaderMaterial = new THREE.ShaderMaterial(
            {
                transparent: true,
                side: THREE.DoubleSide,
                uniforms: this.uniforms,

                vertexShader: terrainVertex,
                fragmentShader: terrainFrag
            }
        )

        this.setupDepthMaterial()

        this.instance = new THREE.Mesh(this.geometry, this.shaderMaterial)
        this.instance.position.y = -1
        this.finalizeInstance()
        
        this.time.on('tick', this.updateUniform.bind(this))

    }

    private setupCanvasTexture (): void {
        this.texture.canvas.width = this.texture.width
        this.texture.canvas.height = this.texture.height

        this.texture.canvas.style.position = 'fixed'
        this.texture.canvas.style.top = '0'
        this.texture.canvas.style.left = '0'
        this.texture.canvas.style.width = '50px'
        this.texture.canvas.style.height = `${this.texture.height}px`
        this.texture.canvas.style.zIndex = '1'

        this.texture.context = this.texture.canvas.getContext('2d') 

        this.texture.instance = new THREE.CanvasTexture(this.texture.canvas) 
        this.texture.instance.wrapS = THREE.RepeatWrapping
        this.texture.instance.wrapT = THREE.RepeatWrapping
        this.texture.instance.magFilter = THREE.NearestFilter

    }

    private updateTexture(): void {
        if ((this.texture.context === null) || (this.texture.instance === null)) { //The TypeScript compiler gives us an error about this.texture.context possibly being null. This line fixes that.
            throw new Error(`Unable to find context or instance`)
        }
        this.texture.context.clearRect(0, 0, this.texture.width, this.texture.height) 

        //Big Lines
        const actualBigLineWidth = Math.round(this.texture.height * this.texture.bigLineWidth)
        this.texture.context.globalAlpha = 1
        this.texture.context.fillStyle = '#ffffff'

        this.texture.context.fillRect(
            0,
            0,
            this.texture.width,
            actualBigLineWidth
        )

        //Small Lines
        const actualSmallLineWidth = Math.round(this.texture.height * this.texture.smallLineWidth)
        const smallLinesCount = this.texture.linesCount - 1

        for(let i = 0; i < smallLinesCount; i++)
            {
                this.texture.context.globalAlpha = this.texture.smallLineAlpha
                this.texture.context.fillStyle = '#00ffff'
                this.texture.context.fillRect(
                    0,
                    actualBigLineWidth + Math.round((this.texture.height - actualBigLineWidth) / this.texture.linesCount) * (i + 1),
                    this.texture.width,
                    actualSmallLineWidth
                )
            }

        this.texture.instance.needsUpdate = true
    }

    private setupDepthMaterial(): void {
        const uniforms = THREE.UniformsUtils.merge([
            THREE.UniformsLib.common,
            THREE.UniformsLib.displacementmap
        ])

        for(const uniformKey in this.uniforms)
        {
            uniforms[uniformKey] = this.uniforms[uniformKey]
        }

        this.depthMaterial = new THREE.ShaderMaterial(
            {
                uniforms: uniforms,
                vertexShader: depthVertex,
                fragmentShader: depthFrag,
            }
        )

        // this.depthMaterial.depthPacking = THREE.RGBADepthPacking
        this.depthMaterial.blending = THREE.NoBlending

        
    }

    private finalizeInstance(): void {
        this.instance.scale.set(10, 10, 10)
        this.instance.userData.depthMaterial = this.depthMaterial
    }

    private updateUniform (): void {
        this.shaderMaterial.uniforms.uTime.value = this.time.uniformElapsed
    }
}

export default Valley