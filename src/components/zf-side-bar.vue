<template>
  <div class="zf-side-bar">
    <!-- 头像 -->
    <div>
      <img v-if="userImg" :src="userImg" class="image-header" />
      <img
        v-else
        src="https://dss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=378824344,1185609431&fm=26&gp=0.jpg"
        class="image-header"
      />
    </div>
    <ul>
      <li
        v-for="item in sideBarList"
        :key="item.id"
        :class="active == item.id ? 'active':''"
        @click="changeTab(item.id)"
        v-if="userType == item.type"
      >
        <template v-if="item.id != 4 || chatArr.length==0">
          <i :class="item.icon"></i>
          <span>{{item.text}}</span>
        </template>
        <template v-else>
          <el-dropdown @command="gotoChat">
            <el-badge
              :value="chatArr.length"
              :max="10"
              :hidden="chatArr.length == 0"
            >
              <i :class="item.icon"></i>
              <span>{{item.text}}</span>
            </el-badge>
            <el-dropdown-menu slot="dropdown" >
              <el-dropdown-item v-for="i in chatArr" :key="i.userId" :command="i.userId">{{i.userName}}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </li>
    </ul>
    <div class="exit" @click="log">
      <i class="el-icon-switch-button"></i>
      {{status?'退出':'登录'}}
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  name: "ZfSideBar",
  data() {
    return {
      status: 0, //用户状态1登录，0未登录
      sideBarList: [
        {
          id: 0,
          icon: "el-icon-s-home",
          text: "首页",
          route: "home",
          type: 1
        },
        {
          id: 1,
          icon: "el-icon-user",
          text: "用户",
          route: "userPage",
          type: 1
        },
        {
          id: 2,
          icon: "el-icon-shopping-cart-2",
          text: "购物车",
          route: "shoppingCar",
          type: 1
        },
        {
          id: 3,
          icon: "el-icon-menu",
          text: "交易论坛",
          route: "tradeBBS",
          type: 1
        },
        {
          id: 4,
          icon: "el-icon-s-comment",
          text: "聊天室",
          route: "chatRoom",
          type: 1
        },
        {
          id: 5,
          icon: "el-icon-setting",
          text: "管理",
          route: "userManage",
          type: 3
        }
      ]
    };
  },
  computed: {
    ...mapGetters({
      active: "getSideBar",
      userType: "getUserType",
      userImg: "getImg",
      chatArr: "getChat"
    })
  },
  mounted() {
    // 处理token
    let token = window.localStorage.getItem("token");
    if (token) {
      this.status = 1;
    } else {
      this.status = 0;
    }
    // 同步路由和state
    let activeItem = this.sideBarList.find(item => {
      return item.route == this.$route.name;
    });
    if (activeItem != undefined) {
      if (this.userType == 3) {
        this.$store.commit("setSideBar", 5);
      } else {
        this.$store.commit("setSideBar", activeItem.id);
      }
    }
    if(this.$websocket.ws){
      this.$websocket.ws.onmessage = e => {
        if (this.active != 4) {
          let user = {
            userId:JSON.parse(e.data).userFromId,
            userName:JSON.parse(e.data).userFromName
          }
          this.$store.commit("addChat", user);
        }
      };
    }
    
  },
  watch: {
    /**
     * @function 根据身份控制路由跳转
     */
    $route(to, from) {
      let activeItem = this.sideBarList.find(item => {
        return item.route == to.name;
      });
      if (activeItem != undefined) {
        if (this.userType == 3) {
          //管理员
          if (
            to.path.indexOf("manage") < 0 &&
            to.path.indexOf("goodsDetail") < 0 &&
            to.path.indexOf("chatRoom") < 0
          ) {
            this.$router.push("manage");
          } else {
            this.$store.commit("setSideBar", 5);
          }
        } else {
          //非管理员
          if (to.path.indexOf("manage") >= 0) {
            this.$router.push(from.path);
          } else {
            this.$store.commit("setSideBar", activeItem.id);
          }
        }
      } else {
        //特殊的二层路由
        if (to.path.indexOf("tradeBBS") >= 0) {
          this.$store.commit("setSideBar", 3);
        }
      }
    }
  },
  methods: {
    /**
     * @function 切换sideBar
     * @param {Number} index 切换下标
     */
    changeTab(index) {
      this.$store.commit("setSideBar", index);
      let route = this.sideBarList[index].route;
      if (this.$route.name == route) {
        this.$router.push({ name: route, query: this.$route.query });
      } else {
        this.$router.push({ name: route });
      }
    },
    /**
     * @function 退出或登录
     */
    log() {
      if (this.status) {
        this.$confirm("确定退出？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          this.$router.push({ name: "login" });
          window.localStorage.removeItem("token");
          this.$store.commit("removeAllChat");
          this.$store.commit("setUserImg", "");
          this.$store.commit("setUserId", "");
          this.$store.commit("setUserType", 1);
          this.$store.commit("setUserName", "");
          if(this.$websocket.ws){
            this.$websocket.ws.close();
          }
          
        }).catch(()=>{});
      } else {
        this.$router.push({ name: "login" });
      }
    },
    /**
     * @function 选择用户聊天
     * @param {Number} userId 对象id
     */
    gotoChat(userId){
      this.$router.push({name:"chatRoom",query:{custormId:userId}})
      this.$store.commit('removeChat',userId)
    }
  }
};
</script>
<style lang="scss" scoped>
.zf-side-bar {
  overflow: -moz-scrollbars-none;
  -ms-overflow-style: none;
  .active {
    background: #f0f8ff;
    color: #335967;
  }
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  bottom: 0;
  font-size: 16px;
  width: 120px;
  height: 100vh;
  background: #335967;
  color: #ffffff;
  overflow: scroll;
  ul {
    li {
      padding: 15px 15px;
      cursor: pointer;
      span {
        margin-left: 5px;
        line-height: 16px;
      }
    }
    margin-bottom: 45.45px;
  }
  .image-header {
    margin: 30px 0 20px 15px;
    width: 80px;
    height: 80px;
    border-radius: 40px;
    object-fit: cover;
  }
  .exit {
    position: fixed;
    bottom: 0;
    padding: 15px 15px;
    width: 120px;
    box-sizing: border-box;
    cursor: pointer;
    background: #1f3e49;
  }
  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    background-color: transparent;
  }
}
</style>
<style lang="scss">
.zf-side-bar {
  .el-dropdown {
    display: flex;
    font-size: 16px;
    color: inherit;
  }
  .el-badge__content {
    height: 15px;
    line-height: 15px;
    padding: 0 4px;
    
  }
  .is-fixed {
    top: 9px;
    right: -3px;
  }
}
</style>