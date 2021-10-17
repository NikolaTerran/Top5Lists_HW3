import { React, useContext, useState } from "react";
import { GlobalStoreContext } from '../store'
/*
    This React component represents a single item in our
    Top 5 List, which can be edited or moved around.
    
    @author McKilla Gorilla
*/
function Top5Item(props) {
    const {text, index} = props
    const { store } = useContext(GlobalStoreContext);
    const [draggedTo, setDraggedTo] = useState(0);
    const [ editActive, setEditActive ] = useState(false);
    const [newText, setNewText] = useState(text);

    function handleDragStart(event) {
        event.dataTransfer.setData("item", event.target.id);
    }

    function handleDragOver(event) {
        event.preventDefault();
    }

    function handleDragEnter(event) {
        event.preventDefault();
        setDraggedTo(true);
    }

    function handleDragLeave(event) {
        event.preventDefault();
        setDraggedTo(false);
    }

    function handleDrop(event) {
        event.preventDefault();
        let target = event.target;
        let targetId = target.id;
        targetId = targetId.substring(target.id.indexOf("-") + 1);
        let sourceId = event.dataTransfer.getData("item");
        sourceId = sourceId.substring(sourceId.indexOf("-") + 1);
        setDraggedTo(false);

        // UPDATE THE LIST
        store.addMoveItemTransaction(sourceId, targetId);
    }

    function handleToggleEdit(event) {
        event.stopPropagation();
        toggleEdit();
        event.target.blur()
    }
    function toggleEdit() {
        let newActive = !editActive;
        store.setIsItemNameEditActive(newActive);
        setEditActive(newActive);
    }

    function handleKeyPress(event) {
        if (event.code === "Enter") {
            event.preventDefault();
            handleBlur(event)
        }
    }
    function handleBlur(event) {
        if(newText !== "" && newText !== text){
            store.editItem(index,event.target.value)
            store.addEditItemTransaction(index,text,event.target.value)
            toggleEdit();
        }else{
            toggleEdit();
        }
    }
    function handleUpdateText(event) {
        event.preventDefault();
        setNewText(event.target.value)
    }


    let itemStatus = false;
    if (store.isItemEditActive) {
        itemStatus = true;
    }
    let itemClass = "top5-item";
    let itemElement = <div
        id={'item-' + (index + 1)}
        className={itemClass}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        draggable={!itemStatus}
    >
        <input
            type="button"
            disabled={itemStatus}
            id={"edit-item-" + index + 1}
            className="list-card-button"
            value={"\u270E"}
            onClick={handleToggleEdit}
        />
        {("\u00a0\u00a0") + props.text}
    </div>

    if (draggedTo) {
        itemClass = "top5-item-dragged-to";
    }
    if (editActive) {
        itemElement =
        <div id={'item-' + (index + 1)} className={itemClass}>
            <input
                id={"edit-item-" + index + 1}
                type='text'
                value={newText}
                onKeyPress={handleKeyPress}
                onBlur={handleBlur}
                onChange={handleUpdateText}
            />
        </div>
    }
    return (
        itemElement
    )
}

export default Top5Item;