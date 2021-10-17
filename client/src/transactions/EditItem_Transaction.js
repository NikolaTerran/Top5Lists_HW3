import jsTPS_Transaction from "../common/jsTPS.js"

export default class EditItem_Transaction extends jsTPS_Transaction {
    constructor(initStore, index, oldName, newName) {
        super();
        this.store = initStore;
        this.index = index
        this.oldName = oldName;
        this.newName = newName;
    }

    doTransaction() {
        this.store.editItem(this.index, this.newName);
    }
    
    undoTransaction() {
        this.store.editItem(this.index, this.oldName);
    }
}