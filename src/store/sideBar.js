export default {
  state: {
    active:0,
    userImg:'',
    userId:'',
    userType:1,
    userName:'',
    chat:[]
  },
  getters: {
    getSideBar:state=> state.active,
    getImg:state=>state.userImg,
    getUserId:state=>state.userId,
    getUserType:state=>state.userType,
    getUserName:state=>state.userName,
    getChat:state=>state.chat
  },
  mutations: {
    setSideBar(state,active){
      state.active = active
    },
    setUserImg(state,userImg){
      state.userImg = userImg
    },
    setUserId(state,userId){
      state.userId = userId
    },
    setUserType(state,userType){
      state.userType = userType
    },
    setUserName(state,userName){
      state.userName = userName
    },
    addChat(state,user){
      let obj = state.chat.find(item=>{
        return user.userId == item.userId
      })
      if(!obj){
        state.chat.push(user)
      }
    },
    removeChat(state,userId){
      let index = state.chat.findIndex(item=>{
        return userId == item.userId
      })
      if(index>=0){
        state.chat.splice(index,1)
      }
    },
    removeAllChat(state){
      state.chat = []
    }
  }
}