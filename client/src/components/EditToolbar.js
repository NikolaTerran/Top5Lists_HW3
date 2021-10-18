import { useContext } from 'react'
import { GlobalStoreContext } from '../store'
import { useHistory } from 'react-router-dom'
/*
    This toolbar is a functional React component that
    manages the undo/redo/close buttons.
    
    @author McKilla Gorilla
*/
function EditToolbar() {
    const { store } = useContext(GlobalStoreContext);
    const history = useHistory();

    let enabledButtonClass = "top5-button";
    let disabledButtonClass = "top5-button-disabled disabled"
    function handleUndo() {
        store.undo();
    }
    function handleRedo() {
        store.redo();
    }
    function handleClose() {
        history.push("/");
        store.closeCurrentList();
    }
    let redoStatus = true;
    let undoStatus = true;
    let closeStatus = true;
    
    if (store.currentList && !store.isItemEditActive) {
        closeStatus = false;
    }
    if (store.hasRedo() && !store.isItemEditActive) {
        redoStatus = false;
    }
    if (store.hasUndo() && !store.isItemEditActive) {
        undoStatus = false;
    }
    
    return (
        <div id="edit-toolbar">
            <div
                disabled={undoStatus}
                id='undo-button'
                onClick={handleUndo}
                className={undoStatus?  disabledButtonClass : enabledButtonClass }>
                &#x21B6;
            </div>
            <div
                disabled={redoStatus}
                id='redo-button'
                onClick={handleRedo}
                className={redoStatus?  disabledButtonClass : enabledButtonClass }>
                &#x21B7;
            </div>
            <div
                disabled={closeStatus}
                id='close-button'
                onClick={handleClose}
                className={closeStatus?  disabledButtonClass : enabledButtonClass }>
                &#x24E7;
            </div>
        </div>
    )
}

export default EditToolbar;