<template>
  <el-container>
    <el-aside width="120px">
      <ZfSideBar></ZfSideBar>
    </el-aside>
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>
<script>
import ZfSideBar from '@/components/zf-side-bar'
export default {
  components:{
    ZfSideBar
  },
  computed:{
    userId:{
      get(){
        return this.$store.getters.getUserId
      },
      set(){}
    },
    userType:{
      get(){
        return this.$store.getters.getUserType
      },
      set(){}
    }
  },
  created(){
    this.init()
  },
  mounted(){
    if(this.userType != 1){
      return
    }
    this.getOfflineRecords()
  },
  methods:{
    /**
     * @function 初始化websocket和store
     */
    init(){
      // 处理token
      let token = window.localStorage.getItem("token")
      if(!token){
        return
      }
      let userInfo = JSON.parse(atob(token.split('.')[1]))
      if(userInfo.userImg){
        this.$store.commit('setUserImg',userInfo.userImg);
      }
      if(userInfo.userId){
        this.$store.commit('setUserId',userInfo.userId)
      }
      if(userInfo.type){
        this.$store.commit('setUserType',userInfo.type)
      }
      if(userInfo.name){
        this.$store.commit('setUserName',userInfo.name)
      }

      // 监听页面刷新
      window.addEventListener('beforeunload',()=>{
        window.sessionStorage.setItem('sideBarId',this.active)
      })
      let sideBarActive = window.sessionStorage.getItem('sideBarId')
      if(sideBarActive) {
        this.$store.commit('setSideBar',sideBarActive);
      }
      if(userInfo.type != 1){
        return
      }

      //初始化websocket
      if ("WebSocket" in window) {
        console.log("您的浏览器支持 WebSocket!");
        let ws = new WebSocket(`ws://127.0.0.1:8282?userId=${this.userId}`);
        
        ws.onopen = (e)=>{
          console.log("连接成功…")
        }
        ws.onclose = (e)=> {
          // 关闭 websocket
          console.log("您已断开连接");
          this.$websocket.closeHeart()
        }
        this.$websocket.setWs(ws);
      }else{
        console.log("您的浏览器不支持 WebSocket!");
      }
    },
    /**
     * @function 获取下线时的聊天记录
     */
    getOfflineRecords(){
      let token = window.localStorage.getItem("token")
      if(!token){
        return
      }
      this.$network.request({
        url:this.$network.api.getOfflineRecords
      }).then(res=>{
        res.data.forEach(item=>{
          this.$store.commit("addChat", item);
        })
      }).catch(err=>{})
    }
  }
}
</script>

<style lang="scss">
.el-main {
  min-width: 700px;
}
</style>
