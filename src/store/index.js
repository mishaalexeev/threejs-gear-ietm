import modelStore from "./model";

class RootStore {
    constructor(){
        this.modelStore = new modelStore(this);
    }
}

export default new RootStore();