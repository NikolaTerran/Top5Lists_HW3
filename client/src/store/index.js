import { createContext, useState, useEffect} from 'react'
import jsTPS from '../common/jsTPS'
import api from '../api'
import MoveItem_Transaction from '../transactions/MoveItem_Transaction'
import EditItem_Transaction from '../transactions/EditItem_Transaction'
export const GlobalStoreContext = createContext({});
/*
    This is our global data store. Note that it uses the Flux design pattern,
    which makes use of things like actions and reducers. 
    
    @author McKilla Gorilla
*/

// THESE ARE ALL THE TYPES OF UPDATES TO OUR GLOBAL
// DATA STORE STATE THAT CAN BE PROCESSED
export const GlobalStoreActionType = {
    CHANGE_LIST_NAME: "CHANGE_LIST_NAME",
    CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
    LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
    SET_CURRENT_LIST: "SET_CURRENT_LIST",
    SET_LIST_NAME_EDIT_ACTIVE: "SET_LIST_NAME_EDIT_ACTIVE",
    SET_LIST_NAME_EDIT_NON_ACTIVE: "SET_LIST_NAME_EDIT_NON_ACTIVE",
    SET_ITEM_NAME_EDIT_ACTIVE: "SET_ITEM_NAME_EDIT_ACTIVE",
    SET_DELETE_LIST_ACTIVE: "SET_DELETE_LIST_ACTIVE",
    ADD_NEW_LIST: "ADD_NEW_LIST",
}

// WE'LL NEED THIS TO PROCESS TRANSACTIONS
const tps = new jsTPS();

// WITH THIS WE'RE MAKING OUR GLOBAL DATA STORE
// AVAILABLE TO THE REST OF THE APPLICATION
export const useGlobalStore = () => {
    // THESE ARE ALL THE THINGS OUR DATA STORE WILL MANAGE
    const [store, setStore] = useState({
        idNamePairs: [],
        currentList: null,
        newListCounter: 0,
        listNameActive: false,
        itemActive: false,
        listMarkedForDeletion: null,
        listCounterMarking: true
    });

    let initCounter = 0
    // if(localStorage.getItem("listCounter")){
    //     initCounter = parseInt(localStorage.getItem("listCounter"))
    // }
    const [listCounterThatActuallyWorked, addCount] = useState(initCounter)

    useEffect(() => {
        localStorage.setItem("listCounter", listCounterThatActuallyWorked)
    },[listCounterThatActuallyWorked]);

    // HERE'S THE DATA STORE'S REDUCER, IT MUST
    // HANDLE EVERY TYPE OF STATE CHANGE
    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            // LIST UPDATE OF ITS NAME
            case GlobalStoreActionType.CHANGE_LIST_NAME: {
                return setStore({
                    idNamePairs: payload.idNamePairs,
                    currentList: payload.top5List,
                    newListCounter: listCounterThatActuallyWorked,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    listCounterMarking: true
                });
            }
            // STOP EDITING THE CURRENT LIST
            case GlobalStoreActionType.CLOSE_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: listCounterThatActuallyWorked,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    listCounterMarking: true
                })
            }
            // GET ALL THE LISTS SO WE CAN PRESENT THEM
            case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
                return setStore({
                    idNamePairs: payload,
                    currentList: null,
                    newListCounter: listCounterThatActuallyWorked,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    listCounterMarking: true
                });
            }
            // UPDATE A LIST
            case GlobalStoreActionType.SET_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: listCounterThatActuallyWorked,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    listCounterMarking: true
                });
            }
            // START EDITING A LIST NAME
            case GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: listCounterThatActuallyWorked,
                    isListNameEditActive: true,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    listCounterMarking: true
                });
            }
            // no change to list name
            case GlobalStoreActionType.SET_LIST_NAME_EDIT_NON_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: listCounterThatActuallyWorked,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    listCounterMarking: true
                });
            }
            // edit an item name
            case GlobalStoreActionType.SET_ITEM_NAME_EDIT_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    newListCounter: listCounterThatActuallyWorked,
                    isListNameEditActive: false,
                    isItemEditActive: payload,
                    listMarkedForDeletion: null,
                    listCounterMarking: true
                });
            }
            // invoke deletion modal
            case GlobalStoreActionType.SET_DELETE_LIST_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    newListCounter: listCounterThatActuallyWorked,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: payload,
                    listCounterMarking: true
                });
            }
            //START ADDING A NEW LIST
            case GlobalStoreActionType.ADD_NEW_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: listCounterThatActuallyWorked,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    listCounterMarking: false
                });
            }
            default:
                return store;
        }
    }
    // THESE ARE THE FUNCTIONS THAT WILL UPDATE OUR STORE AND
    // DRIVE THE STATE OF THE APPLICATION. WE'LL CALL THESE IN 
    // RESPONSE TO EVENTS INSIDE OUR COMPONENTS.

    // THIS FUNCTION PROCESSES CHANGING A LIST NAME
    store.changeListName = function (id, newName) {
        // GET THE LIST
        async function asyncChangeListName(id) {
            try{
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                let top5List = response.data.top5List;
                top5List.name = newName;
                async function updateList(top5List) {
                    response = await api.updateTop5ListById(top5List._id, top5List);
                    if (response.data.success) {
                        async function getListPairs(top5List) {
                            response = await api.getTop5ListPairs();
                            if (response.data.success) {
                                let pairsArray = response.data.idNamePairs;
                                storeReducer({
                                    type: GlobalStoreActionType.CHANGE_LIST_NAME,
                                    payload: {
                                        idNamePairs: pairsArray,
                                        top5List: top5List
                                    }
                                });
                            }
                        }
                        getListPairs(top5List);
                    }
                }
                updateList(top5List);
            }
        }catch(error){
            console.log(error)
        }
        }
            asyncChangeListName(id);
    }

    //this function adds a new list
    store.addNewList = function () {
        async function asyncCreateNewList(){
            try{
            const response = await api.createTop5List({
                        "name": "Untitled" + store.newListCounter,
                        "items": [
                            "",
                            "",
                            "",
                            "",
                            ""
                        ]
                })
            //let newNum = store.newListCounter + 1
            addCount(listCounterThatActuallyWorked + 1)
            storeReducer({type: GlobalStoreActionType.ADD_NEW_LIST});
            store.setCurrentList(response.data.top5List._id)
            }catch(error){
                console.log(error)
            }
        }
            asyncCreateNewList()
    }

    // THIS FUNCTION PROCESSES CLOSING THE CURRENTLY LOADED LIST
    store.closeCurrentList = function () {
        storeReducer({
            type: GlobalStoreActionType.CLOSE_CURRENT_LIST,
            payload: {}
        });
        tps.clearAllTransactions()
    }

    // THIS FUNCTION LOADS ALL THE ID, NAME PAIRS SO WE CAN LIST ALL THE LISTS
    store.loadIdNamePairs = function () {
        async function asyncLoadIdNamePairs() {
            try{
                const response = await api.getTop5ListPairs();
                let pairsArray = response.data.idNamePairs;
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: pairsArray
                });
            }catch(error){
                console.log("render Nothing")
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: []
                })
            }
        }
        asyncLoadIdNamePairs();
    }

    // THE FOLLOWING 8 FUNCTIONS ARE FOR COORDINATING THE UPDATING
    // OF A LIST, WHICH INCLUDES DEALING WITH THE TRANSACTION STACK. THE
    // FUNCTIONS ARE setCurrentList, addMoveItemTransaction, addUpdateItemTransaction,
    // moveItem, updateItem, updateCurrentList, undo, and redo
    store.setCurrentList = function (id) {
        async function asyncSetCurrentList(id) {

            try{
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                let top5List = response.data.top5List;

                response = await api.updateTop5ListById(top5List._id, top5List);
                if (response.data.success) {
                    storeReducer({
                        type: GlobalStoreActionType.SET_CURRENT_LIST,
                        payload: top5List
                    });
                    store.history.push("/top5list/" + top5List._id);
                }
            }
        }catch(error){
            console.log(error)
        }
        }
        
            asyncSetCurrentList(id);
        
    }
    store.addMoveItemTransaction = function (start, end) {
        let transaction = new MoveItem_Transaction(store, start, end);
        tps.addTransaction(transaction);
    }
    store.moveItem = function (start, end) {
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = store.currentList.items[start];
            for (let i = start; i < end; i++) {
                store.currentList.items[i] = store.currentList.items[i + 1];
            }
            store.currentList.items[end] = temp;
        }
        else if (start > end) {
            let temp = store.currentList.items[start];
            for (let i = start; i > end; i--) {
                store.currentList.items[i] = store.currentList.items[i - 1];
            }
            store.currentList.items[end] = temp;
        }

        // NOW MAKE IT OFFICIAL
        store.updateCurrentList();
    }
    store.addEditItemTransaction = function (index, oldName, newName) {
        let transaction = new EditItem_Transaction(store, index, oldName, newName)
        tps.addTransaction(transaction)
    }
    store.editItem = function (index, newName){
        let newCurrentList = store.currentList
        newCurrentList.items[index] = newName
        storeReducer({
            type : GlobalStoreActionType.SET_CURRENT_LIST,
            payload: newCurrentList
        })
        store.updateCurrentList()
    }
    store.updateCurrentList = function() {
        async function asyncUpdateCurrentList() {
            try{
                await api.updateTop5ListById(store.currentList._id, store.currentList);
                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST,
                    payload: store.currentList
                });
            }catch(error){
                console.log(error)
            }
        }
        asyncUpdateCurrentList();
    }
    store.undo = function () {
        tps.undoTransaction();
    }
    store.redo = function () {
        tps.doTransaction();
    }
    store.hasUndo = function () {
        return tps.hasTransactionToUndo()
    }
    store.hasRedo = function () {
        return tps.hasTransactionToRedo()
    }

    // THIS FUNCTION ENABLES THE PROCESS OF EDITING A LIST NAME
    store.setIsListNameEditActive = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE,
            payload: null
        });
    }

    // reverse of that
    store.setIsListNameEditNonActive = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_LIST_NAME_EDIT_NON_ACTIVE,
        })
    }

    // enabled the process of editing an item name
    store.setIsItemNameEditActive = function (toggle) {
        storeReducer({
            type: GlobalStoreActionType.SET_ITEM_NAME_EDIT_ACTIVE,
            payload: toggle
        })
    }

    //invoke deletion
    store.invokeDeletion = function (idNamePair) {
        async function asyncSetCurrentList(id) {
            try{
                let response = await api.getTop5ListById(id);
                let top5List = response.data.top5List;  
                storeReducer({
                    type: GlobalStoreActionType.SET_DELETE_LIST_ACTIVE,
                    payload: top5List
                });
            }catch(error){console.log(error)}
        }
        asyncSetCurrentList(idNamePair._id);
    }

    //hide modal
    store.hideDeleteListModal = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_DELETE_LIST_ACTIVE,
            payload: null
        })
    }

    //delete list
    store.deleteMarkedList = function () {
        async function deleteCurrentList(id) {
            try{
                await api.deleteTop5ListById(id);
            }catch(error){console.log(error)}
            store.loadIdNamePairs()
        }
        deleteCurrentList(store.listMarkedForDeletion._id);
        store.hideDeleteListModal()
        //store.loadIdNamePairs()
    }


    // THIS GIVES OUR STORE AND ITS REDUCER TO ANY COMPONENT THAT NEEDS IT
    return { store, storeReducer };
}