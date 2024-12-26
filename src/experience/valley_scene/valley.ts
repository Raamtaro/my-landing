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

interface TerrainDataTexture {
    width: number,
    height: number,
    size: number | null,
    data: Uint8Array | null,
    linesCount: number,
    bigLineWidth: number,
    smallLineWidth: number,
    smallLineAlpha: number,
    instance: THREE.DataTexture | null
}

class Valley {
    private experience: Experience
    
    private time: TimeKeeper
    private shaderMaterial: ShaderMaterial
    private depthMaterial: ShaderMaterial | null = null
    private geometry: PlaneGeometry 
    private uniforms: ValleyUniforms
    private canvasTexture: TerrainCanvasTexture = {
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
    private dataTexture: TerrainDataTexture = {
        width: 1,
        height: 128,
        size: null,
        data: null,
        linesCount: 5,
        bigLineWidth: 0.08,
        smallLineWidth: 0.01,
        smallLineAlpha: 0.5,
        instance: null
    }

    public instance: Mesh
    

    constructor() {
        this.experience = Experience.getInstance()
       
        this.time = this.experience.time

        this.setupCanvasTexture()
        this.updateCanvasTexture()

        this.dataTexture.instance = this.setupDataTexture()

        this.geometry = new THREE.PlaneGeometry(1, 1, 1000, 1000)
        this.geometry.rotateX(- Math.PI * 0.50)
        

        this.uniforms = {
            uTexture: new THREE.Uniform(this.dataTexture.instance),
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
        // this.instance.rotateY(Math.PI * 0.5)

        this.finalizeInstance()
        
        this.time.on('tick', this.updateUniform.bind(this))

    }

    private setupCanvasTexture (): void {
        this.canvasTexture.canvas.width = this.canvasTexture.width
        this.canvasTexture.canvas.height = this.canvasTexture.height

        this.canvasTexture.canvas.style.position = 'fixed'
        this.canvasTexture.canvas.style.top = '0'
        this.canvasTexture.canvas.style.left = '0'
        this.canvasTexture.canvas.style.width = '50px'
        this.canvasTexture.canvas.style.height = `${this.canvasTexture.height}px`
        this.canvasTexture.canvas.style.zIndex = '1'

        this.canvasTexture.context = this.canvasTexture.canvas.getContext('2d') 

        this.canvasTexture.instance = new THREE.CanvasTexture(this.canvasTexture.canvas) 
        this.canvasTexture.instance.wrapS = THREE.RepeatWrapping
        this.canvasTexture.instance.wrapT = THREE.RepeatWrapping
        this.canvasTexture.instance.magFilter = THREE.NearestFilter

    }

    private updateCanvasTexture(): void {
        if ((this.canvasTexture.context === null) || (this.canvasTexture.instance === null)) { //The TypeScript compiler gives us an error about this.canvasTexture.context possibly being null. This line fixes that.
            throw new Error(`Unable to find context or instance`)
        }
        this.canvasTexture.context.clearRect(0, 0, this.canvasTexture.width, this.canvasTexture.height) 

        //Big Lines
        const actualBigLineWidth = Math.round(this.canvasTexture.height * this.canvasTexture.bigLineWidth)
        this.canvasTexture.context.globalAlpha = 1
        this.canvasTexture.context.fillStyle = '#ffffff'

        this.canvasTexture.context.fillRect(
            0,
            0,
            this.canvasTexture.width,
            actualBigLineWidth
        )

        //Small Lines
        const actualSmallLineWidth = Math.round(this.canvasTexture.height * this.canvasTexture.smallLineWidth)
        const smallLinesCount = this.canvasTexture.linesCount - 1

        for(let i = 0; i < smallLinesCount; i++)
            {
                this.canvasTexture.context.globalAlpha = this.canvasTexture.smallLineAlpha
                this.canvasTexture.context.fillStyle = '#00ffff'
                this.canvasTexture.context.fillRect(
                    0,
                    actualBigLineWidth + Math.round((this.canvasTexture.height - actualBigLineWidth) / this.canvasTexture.linesCount) * (i + 1),
                    this.canvasTexture.width,
                    actualSmallLineWidth
                )
            }

        this.canvasTexture.instance.needsUpdate = true
    }

    private setupDataTexture(): THREE.DataTexture {
        this.dataTexture.size = this.dataTexture.width * this.dataTexture.height
        this.dataTexture.data = new Uint8Array(4 * this.dataTexture.size)
        return this.updateDataTexture()
    }

    private updateDataTexture(): THREE.DataTexture {
        if (!this.dataTexture.data) {
            throw new Error(`No data texture loaded`)
        }

        const actualBigLineWidth = Math.round(this.dataTexture.height * this.dataTexture.bigLineWidth)
        const actualSmallLineWidth = Math.round(this.dataTexture.height * this.dataTexture.smallLineWidth)

        const smallLinesCount = this.dataTexture.linesCount - 1
        const lineSpacing = Math.round((this.dataTexture.height - actualBigLineWidth) / this.dataTexture.linesCount)

        for (let y = 0; y < this.dataTexture.height; y++) {
            const index = y * 4

            if (y < actualBigLineWidth) {

                this.dataTexture.data[index] = 255
                this.dataTexture.data[index + 1] = 255
                this.dataTexture.data[index + 2] = 255
                this.dataTexture.data[index + 3] = 255
            } else {
                let isSmallLine = false;
                for (let i = 0; i < smallLinesCount; i++) {
                    const lineStart = actualBigLineWidth + lineSpacing * (i + 1);
                    const lineEnd = lineStart + actualSmallLineWidth;
                    if (y >= lineStart && y < lineEnd) {
                        isSmallLine = true;
                        break;
                    }
                }

                if (isSmallLine) {
                // Small Line: Cyan
                this.dataTexture.data[index] = 0;   // Red
                this.dataTexture.data[index + 1] = 255; // Green
                this.dataTexture.data[index + 2] = 255; // Blue
                this.dataTexture.data[index + 3] = Math.round(this.dataTexture.smallLineAlpha * 255); // Alpha
                } else {
                    this.dataTexture.data[index] = 0;   // Red
                    this.dataTexture.data[index + 1] = 0; // Green
                    this.dataTexture.data[index + 2] = 0; // Blue
                    this.dataTexture.data[index + 3] = 0; // Alpha
                }
            }
        }
        const dataTexture = new THREE.DataTexture(this.dataTexture.data, this.dataTexture.width, this.dataTexture.height, THREE.RGBAFormat)
        dataTexture.wrapS = THREE.RepeatWrapping
        dataTexture.wrapT = THREE.RepeatWrapping
        dataTexture.magFilter = THREE.NearestFilter
        dataTexture.needsUpdate = true
        return dataTexture
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