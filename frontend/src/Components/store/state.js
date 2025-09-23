import { proxy } from "valtio";

const state = proxy({
  currentUser: null,
  currentUserRoll: null, 
  currentUserName:null

});

export default state;