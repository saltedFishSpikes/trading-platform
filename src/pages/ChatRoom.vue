<template>
  <div class="chat-room">
    <template v-if="userId">
      <div
        class="title"
      >{{userType == 3?(host.userName || '无')+' --- '+(custorm.userName || '无'):custorm.userName}}</div>
      <el-scrollbar style="height:100%" ref="scrollBar" :class="userType == 3?'scrollbar-class':''">
        <ul ref="chatList" class="chat-list">
          <li v-for="(item,index) in chatList" :key="index" class="chat-item">
            <!-- 发送 -->
            <div class="chat-time">{{item.chatTime}}</div>
            <div v-if="item.type === 0" class="send">
              <div class="content" v-if="item.content.type == 1">{{item.content.data}}</div>
              <div v-else>
                <ZfGoodsCard
                  :goodsName="item.content.data.goodsName"
                  :goodsId="item.content.data.goodsId"
                  :goodsImg="item.content.data.goodsImg"
                ></ZfGoodsCard>
              </div>
              <img :src="host.userImg" v-if="host.userImg" />
              <img src="@/assets/default_user.jpg" v-else />
            </div>
            <!-- 接收 -->
            <div v-else class="get">
              <img :src="custorm.userImg" v-if="custorm.userImg" />
              <img src="@/assets/default_user.jpg" v-else />
              <div class="content" v-if="item.content.type == 1">{{item.content.data}}</div>
              <div v-else>
                <ZfGoodsCard
                  :goodsName="item.content.data.goodsName"
                  :goodsId="item.content.data.goodsId"
                  :goodsImg="item.content.data.goodsImg"
                ></ZfGoodsCard>
              </div>
            </div>
          </li>
        </ul>
      </el-scrollbar>
      <div class="send-input" v-if="userType == 1">
        <el-form :model="formData" :rules="rules" ref="formData">
          <el-form-item prop="chatInput">
            <el-input
              size="small"
              placeholder="点击发送或按下回车发送消息"
              v-model="formData.chatInput"
              @keypress.enter.native.prevent="send(false)"
            ></el-input>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-plus"
              circle
              :disabled="!custorm.userId || !host.userId"
              title="发送二手品"
              @click="sendGoods"
            ></el-button>
            <el-button
              size="small"
              type="primary"
              :disabled="!formData.chatInput || !custorm.userId || !host.userId"
              @click.prevent="send(false)"
            >发送</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-button class="back" v-else-if="userType == 3" @click="$router.go(-1)">返回</el-button>
      <ZfSendGoodsDialog
        :show.sync="showSendDialog"
        :from="host"
        :to="custorm"
        @closeDialog="showSendDialog = false"
      ></ZfSendGoodsDialog>
    </template>
  </div>
</template>
<script>
import moment from "moment";
import ZfSendGoodsDialog from "@/components/zf-send-goods-dialog.vue";
import ZfGoodsCard from "@/components/zf-goods-card.vue";
export default {
  name: "ConnectRoom",
  components: {
    ZfSendGoodsDialog,
    ZfGoodsCard
  },
  data() {
    var checkInput = (rule, value, callback) => {
      if (!this.$common.checkString(value)) {
        callback(new Error("请勿输入手机号、qq号、微信号等信息"));
      } else {
        callback();
      }
    };
    return {
      formData: {
        chatInput: ""
      },
      rules: {
        chatInput: [{ validator: checkInput, trigger: "blur" }]
      },
      chatList: [],
      host: {},
      custorm: {},
      showSendDialog: false
    };
  },
  computed: {
    userName: {
      get() {
        return this.$store.getters.getUserName;
      },
      set() {}
    },
    userId: {
      get() {
        return this.$store.getters.getUserId;
      },
      set() {}
    },
    userImg: {
      get() {
        return this.$store.getters.getImg;
      },
      set() {}
    },
    userType: {
      get() {
        return this.$store.getters.getUserType;
      },
      set() {}
    }
  },
  watch: {
    $route(to, from) {
      if (
        to.name == "chatRoom" &&
        from.name == "chatRoom" &&
        to.query.custormId != from.query.custormId
      ) {
        //只改变custormId，路由不变
        if (to.query.custormId) {
          this.getUserInfo(to.query.custormId);
          this.getChattingRecords(to.query.custormId);
          // this.$websocket.ws.onmessage = e => {
          //   this.getMessage.call(this, e);
          // };
        } else {
          this.$message({
            message: "请选择聊天对象",
            type: "warning"
          });
        }
      }
    }
  },
  mounted() {
    if(!this.userId){
      this.$message({
        message:'请先登录',
        duration:5000
      })
      return
    }
    if (this.userType == 3) {
      if (!this.$route.query.sellerId || !this.$route.query.buyerId) {
        this.$message({
          message: "请选择交易双方的用户id",
          type: "warning"
        });
      } else {
        this.getUserInfo(this.$route.query.sellerId, "custorm");
        this.getUserInfo(this.$route.query.buyerId, "host");
        this.manageChattingRecords();
      }
      return;
    }

    this.host = {
      userName: this.userName,
      userId: this.userId,
      userImg: this.userImg
    };

    if (this.$route.query.custormId) {
      if (this.host.userId == this.$route.query.custormId) {
        this.$message({
          message: "请不要选择自己作为聊天对象",
          type: "warning"
        });
        return;
      }
      this.getUserInfo(this.$route.query.custormId);
      this.getChattingRecords(this.$route.query.custormId);
      this.$websocket.ws.onmessage = e => {
        this.getMessage.call(this, e);
      };
    } else {
      this.$message({
        message: "请选择聊天对象",
        type: "warning"
      });
    }
  },
  methods: {
    /**
     * @function websocket接收传参函数覆盖
     */
    getMessage(e) {
      let chatContent = JSON.parse(e.data);
      if (chatContent.userFromId == this.host.userId) {
        chatContent.type = 0;
      } else if (chatContent.userFromId == this.custorm.userId) {
        chatContent.type = 1;
      } else {
        let user = {
          userId: chatContent.userFromId,
          userName: chatContent.userFromName
        };
        this.$store.commit("addChat", user);
        return;
      }
      chatContent.content = JSON.parse(chatContent.content);
      chatContent.chatTime = moment(chatContent.chatTime).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      this.chatList.push(chatContent);
      this.$nextTick(() => {
        this.$refs["scrollBar"].wrap.scrollTop = this.$refs[
          "scrollBar"
        ].wrap.scrollHeight;
      });
    },
    /**
     * @function 发送
     */
    send() {
      if (
        !this.formData.chatInput ||
        !this.host.userId ||
        !this.custorm.userId
      ) {
        return false;
      }

      this.$refs.formData.validate(valid => {
        if (valid) {
          let msg = "";

          if (this.formData.chatInput.length > 0) {
            msg = JSON.stringify({ data: this.formData.chatInput, type: 1 });
          } else {
            return;
          }
          let data = {
            msg: msg,
            from: this.host.userId,
            to: this.custorm.userId,
            fromName: this.host.userName,
            toName: this.custorm.userName
          };
          this.$websocket.ws.send(JSON.stringify(data));
          this.formData.chatInput = "";
        } else {
          return false;
        }
      });
    },
    /**
     * @function 获取聊天对象信息
     * @param {String} userId 用户id,
     * @param {String} userType 只接受host和custorm
     */
    getUserInfo(userId, userType = "custorm") {
      this.$network
        .request({
          url: this.$network.api.userDetail,
          data: {
            userId: userId
          },
          isLoading: true,
          target: ".chat-room"
        })
        .then(res => {
          this[userType] = {
            userId: res.data.userId,
            userImg: res.data.userImg,
            userName: res.data.userName
          };
        })
        .catch(err => {});
    },
    /**
     * @function 管理员获取聊天记录
     */
    manageChattingRecords() {
      this.$network
        .request({
          url: this.$network.api.manageChattingRecords,
          data: {
            sellerId: this.$route.query.sellerId,
            buyerId: this.$route.query.buyerId
          },
          isLoading: true,
          target: ".chat-room"
        })
        .then(res => {
          res.data.map(item => {
            item.chatTime = moment(item.chatTime).format("YYYY-MM-DD HH:mm:ss");
            item.content = JSON.parse(item.content);
            return item;
          });
          this.chatList = res.data;
          this.$nextTick(() => {
            this.$refs["scrollBar"].wrap.scrollTop = this.$refs[
              "scrollBar"
            ].wrap.scrollHeight;
          });
        })
        .catch(err => {});
    },
    /**
     * @function 非管理员获取聊天记录
     * @param {String} otherId 聊天对象id
     */
    getChattingRecords(otherId) {
      this.$network
        .request({
          url: this.$network.api.getChattingRecords,
          data: {
            userId: otherId
          },
          isLoading: true,
          target: ".chat-room"
        })
        .then(res => {
          res.data.map(item => {
            item.chatTime = moment(item.chatTime).format("YYYY-MM-DD HH:mm:ss");
            item.content = JSON.parse(item.content);
            return item;
          });
          this.chatList = res.data;
          this.$nextTick(() => {
            this.$refs["scrollBar"].wrap.scrollTop = this.$refs[
              "scrollBar"
            ].wrap.scrollHeight;
          });
        })
        .catch(err => {});
    },
    /**
     * @function 发送二手品
     */
    sendGoods() {
      this.showSendDialog = true;
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (vm.userType != 3) {
        vm.$store.commit("setSideBar", 4);
      } else {
        vm.$store.commit("setSideBar", 5);
      }
    });
  },
  beforeRouteLeave(to, from, next) {
    if (this.custorm.userName && this.userType == 1) {
      let result = window.confirm("离开该页将不能实时接收消息，确定离开？");
      if (result) {
        this.$websocket.ws.onmessage = e => {
          if (this.active != 4) {
            let user = {
              userId: JSON.parse(e.data).userFromId,
              userName: JSON.parse(e.data).userFromName
            };
            this.$store.commit("addChat", user);
          }
        };
        next();
      } else {
        this.$store.commit("setSideBar", 4);
        next(false);
      }
    } else {
      next();
    }
  }
};
</script>
<style lang="scss" scoped>
.chat-room {
  margin: auto;
  width: 600px;
  height: 500px;
  display: flex;
  flex-direction: column;
  .title {
    padding: 10px 0;
    border: 1px solid #bbb;
    border-bottom: 0;
    text-align: center;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    background: #ddd;
  }
  .scrollbar-class {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
  .el-scrollbar {
    border: 1px solid #bbb;
    .chat-list {
      flex-grow: 1;
      padding: 15px;
      overflow: hidden;
      .chat-item {
        display: flex;
        flex-direction: column;
        margin: 10px 0;
        > div {
          display: flex;
          img {
            width: 40px;
            height: 40px;
            object-fit: cover;
            border-radius: 20px;
          }
          .content {
            position: relative;
            padding: 5px;
            box-sizing: border-box;
            border-radius: 4px;
            background: #eee;
            line-height: 16px;
            max-width: 458px;
            height: 100%;
            word-break: break-all;
            &::after {
              content: "";
              border: 10px solid #eee;
              border-top-color: transparent;
              border-bottom-color: transparent;
              position: absolute;
              top: 3px;
            }
          }
        }
        .chat-time {
          justify-content: center;
          margin: 5px 0;
        }
        .send {
          align-self: flex-end;
          img {
            margin-left: 15px;
          }
          .content {
            &::after {
              border-right-color: transparent;
              right: -20px;
            }
          }
        }
        .get {
          align-self: flex-start;
          img {
            margin-right: 15px;
          }
          .content {
            &::after {
              border-left-color: transparent;
              left: -20px;
            }
          }
        }
      }
    }
  }
  .send-input {
    border: 1px solid #bbb;
    border-top: 0;
    padding: 10px;
    padding-bottom: 0;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    .el-input {
      width: 450px;
      margin-right: 20px;
    }
  }
  .back {
    width: fit-content;
    margin: auto;
    margin-top: 20px;
  }
}
</style>
<style lang="scss">
.chat-room {
  .el-scrollbar__wrap {
    overflow-x: hidden;
  }
}
</style>