import Api from '../api/Api'
import store from '../store/Store'
import * as indexAction from '../action/index'

const api = new Api();


export const  addToLocalStorageObject = function (name, key, value) {

	// Get the existing data
	var existing = localStorage.getItem(name);

	// If no existing data, create an array
	// Otherwise, convert the localStorage string to an array
	existing = existing ? JSON.parse(existing) : {};

	// Add new data to localStorage Array
	existing[key] = value;

	// Save back to localStorage
	localStorage.setItem(name, JSON.stringify(existing));

};

export const  getUserInfor = () =>{

    return new Promise((resolve,reject) =>{
        api.get('user/'+JSON.parse(localStorage.getItem('userInfor'))._id).then((response)=>{
			
           localStorage.setItem('userInfor',JSON.stringify(response.data.user))

        }).catch((err)=>{
            console.log("getUser err",err);
        })
    });
}