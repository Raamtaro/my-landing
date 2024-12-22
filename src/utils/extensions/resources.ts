import { GLTFLoader, DRACOLoader } from "three/examples/jsm/Addons.js";
import EventEmitter from "../eventEmitter";

import ModelInfo from "../../data/type";

class Resources extends EventEmitter {

    constructor(sources: ModelInfo[]) {
        super()
    }
}

export default Resources