<template>
  <div class="user-page">
    <!-- 个人信息 -->
    <template v-if="$route.query.userId || hostId">
      <h1>{{!userId?'我的信息':'用户信息'}}</h1>
      <table class="user-info" cellpadding="0" cellspacing="0">
        <tr>
          <td>用户名</td>
          <td>
            <span>{{userDetail.userName}}</span>
            <el-button
              v-if="!userId"
              type="text"
              style="height:30px;"
              class="change-btn"
              @click="changeUser(1,userDetail.userName)"
            >修改</el-button>
          </td>
          <td>注册时间</td>
          <td>{{userDetail.registerTime}}</td>
        </tr>
        <tr>
          <td>账号状态</td>
          <td>{{allUserStatus[userDetail.status-1]}}</td>
          <td>用户头像</td>
          <td>
            <img v-if="userDetail.userImg" :src="userDetail.userImg" />
            <img v-else src="@/assets/default_user.jpg" />
            <el-button
              v-if="!userId"
              type="text"
              style="height:30px;"
              class="change-btn"
              @click="updateUser(1)"
            >修改</el-button>
          </td>
        </tr>
        <tr>
          <td>交易成功数</td>
          <td :colspan="!userId?'1':'3'">
            <span>{{userDetail.successNum}}</span>
          </td>
          <td v-if="!userId">密码</td>
          <td v-if="!userId">
            <span>**********</span>
            <el-button type="text" style="height:30px;" class="change-btn" @click="updateUser(2)">修改</el-button>
          </td>
        </tr>
        <tr v-if="!userId">
          <td>收货地址</td>
          <td colspan="3">
            <span>{{userDetail.address}}</span>
            <el-button type="text" @click="changeUser(2,userDetail.address)" class="change-btn">修改</el-button>
          </td>
        </tr>
      </table>
      <!-- 我的交易记录 -->
      <template v-if="!userId">
        <h1>交易记录</h1>
        <el-table class="trade-table" :data="userTrade">
          <el-table-column prop="tradeId" label="交易单号" width="185"></el-table-column>
          <el-table-column prop="changeTime" label="交易最近变动时间" width="140"></el-table-column>
          <el-table-column label="我的身份" width="70">
            <template slot-scope="scope">{{scope.row.role?'卖家':'买家'}}</template>
          </el-table-column>
          <el-table-column prop="buyerName" label="买家" show-overflow-tooltip width="65"></el-table-column>
          <el-table-column prop="sellerName" label="卖家" show-overflow-tooltip width="65"></el-table-column>
          <el-table-column prop="goodsName" label="二手品名称" show-overflow-tooltip width="80"></el-table-column>
          <el-table-column prop="tradePrice" label="交易生成时的价格" show-overflow-tooltip width="120"></el-table-column>
          <el-table-column label="交易结果" min-width="160">
            <template
              slot-scope="scope"
              v-if="scope.row.tradeStatus !== undefined"
            >{{allTradeStatus[scope.row.tradeStatus-1]}}</template>
          </el-table-column>
          <el-table-column label="操作" width="300">
            <template slot-scope="scope">
              <el-button type="text" @click="gotoGoodsDetail(scope.row.goodsId)">查看二手品详情</el-button>
              <el-button
                type="text"
                @click="connect(scope.row.role == 1?scope.row.buyerId:scope.row.sellerId)"
              >联系对方</el-button>
              <el-button
                type="text"
                @click="pay(scope.row.tradeId)"
                v-if="scope.row.tradeStatus == 1"
              >支付</el-button>
              <el-button
                type="text"
                @click="confirmGoods(scope.row.tradeId)"
                v-if="scope.row.tradeStatus == 2"
              >确认收货</el-button>
              <el-button
                type="text"
                @click="cancelTrade(scope.row.tradeId,scope.row.goodsId,scope.row.tradeStatus)"
                v-if="scope.row.tradeStatus == 1 || scope.row.tradeStatus == 2"
              >取消交易</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination
          class="pagination"
          @current-change="changeTrade"
          :current-page="tradePagination.pageNum"
          :page-size="tradePagination.pageSize"
          layout="total, prev, pager, next, jumper"
          :total="tradePagination.total"
        ></el-pagination>
      </template>
      <!-- 我卖的二手品 -->
      <h1>{{!userId?'我的二手品':userDetail.userName+'的商品'}}</h1>
      <el-table class="goods-table" :data="userGoods">
        <el-table-column prop="goodsId" label="二手品编号" width="100"></el-table-column>
        <el-table-column prop="goodsName" label="二手品名称" show-overflow-tooltip width="150"></el-table-column>
        <el-table-column label="二手品类型" width="100">
          <template slot-scope="scope">{{allType[scope.row.goodsType - 1].typeName}}</template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="200"></el-table-column>
        <el-table-column label="二手品状态" width="100">
          <template
            slot-scope="scope"
            v-if="scope.row.goodsStatus"
          >{{allGoodsStatus[scope.row.goodsStatus-1]}}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="240">
          <template slot-scope="scope">
            <template v-if="!userId">
              <el-button
                type="text"
                v-if="scope.row.goodsStatus == 2 || scope.row.goodsStatus == 6"
                @click="seeReason(scope.row.reason,scope.row.goodsStatus)"
              >查看原因</el-button>
              <el-button
                type="text"
                v-if="scope.row.goodsStatus == 1 || scope.row.goodsStatus == 3"
                @click="soldOut(scope.row.goodsId)"
              >下架</el-button>
              <el-button
                type="text"
                v-if="scope.row.goodsStatus != 4"
                @click="updatePrice(scope.row.goodsId,scope.row.goodsPrice)"
              >修改价格</el-button>
              <el-button
                type="text"
                v-if="scope.row.goodsStatus != 4"
                @click="goodsPublish(scope.row.goodsId)"
              >修改二手品或重新上架</el-button>
            </template>
            <template v-else>
              <el-button type="text" @click="gotoGoodsDetail(scope.row.goodsId)">查看二手品</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        class="pagination"
        @current-change="changeGoods"
        :current-page="goodsPagination.pageNum"
        :page-size="goodsPagination.pageSize"
        layout="total, prev, pager, next, jumper"
        :total="goodsPagination.total"
      ></el-pagination>
      <el-button v-if="hostId && !userId" type="primary" class="publish" @click="goodsPublish(null)">发布二手品</el-button>
      <el-button v-else-if="hostId && userId && hostId != userId" type="primary" class="publish" @click="connect(userId)">联系该用户</el-button>
      <!-- 用户部分信息修改 -->
      <ZfUserUpdateDialog
        :show.sync="showUpdateDialog"
        :type="changeType"
        @getUserDetail="getUserDetail"
        :userDetail="userDetail"
        @closeDialog="closeDialog('showUpdateDialog')"
      ></ZfUserUpdateDialog>
      <!-- 发布或修改二手品弹窗 -->
      <ZfPublishDialog
        :show.sync="showPublishDialog"
        :goodsId="goodsId"
        @getGoodsTable="getGoodsTable"
        @closeDialog="closeDialog('showPublishDialog')"
      ></ZfPublishDialog>
    </template>
  </div>
</template>
<script>
import ZfUserUpdateDialog from "../components/zf-user-update-dialog";
import ZfPublishDialog from "../components/zf-publish-dialog";
import moment from "moment";
import typeArr from "@/assets/json/goodsType.json";
export default {
  name: "UserPage",
  components: {
    ZfUserUpdateDialog,
    ZfPublishDialog
  },
  data() {
    return {
      goodsPagination: {
        pageNum: 1,
        pageSize: 5,
        total: 0
      },
      tradePagination: {
        pageNum: 1,
        pageSize: 5,
        total: 0
      },
      userDetail: {},
      userTrade: [],
      userGoods: [],
      allType: [],
      allUserStatus: ["正常", "禁用"],
      allTradeStatus: [
        "未支付",
        "已支付",
        "主动取消交易",
        "完成",
        "长时间未支付，交易取消"
      ],
      allGoodsStatus: [
        "待审核",
        "审核未通过",
        "未出售",
        "已出售",
        "已下架",
        "强制下架"
      ],
      showUpdateDialog: false, //修改用户信息弹窗
      showPublishDialog: false, //发布编辑二手品弹窗
      goodsId: null, //选中的二手品id
      goodsPrice: null, //选中的二手品价格
      changeType: 1, // 弹窗用户修改头像或密码 1-头像，2密码
      userId: null // 查看对象的id
    };
  },
  computed: {
    hostId: {
      get() {
        return this.$store.getters.getUserId;
      },
      set() {}
    }
  },
  mounted() {
    if (!this.$route.query.userId && !this.hostId) {
      this.$message({
        message:'请先登录',
        duration:5000
      })
      return;
    }
    this.allType = JSON.parse(JSON.stringify(typeArr.typeArr));
    if (this.$route.query.userId && this.$route.query.userId != this.hostId) {
      this.userId = this.$route.query.userId;
      this.getUserDetail();
      this.getGoodsTable();
    } else {
      this.getUserDetail();
      this.getTradeTable();
      this.getGoodsTable();
    }
  },
  methods: {
    /**
     * @function 切换trade分页
     * @param {Number} page 页码
     */
    changeTrade(page) {
      this.tradePagination.pageNum = page;
      this.getTradeTable();
    },
    /**
     * @function 切换goods分页
     * @param {Number} page 页码
     */
    changeGoods(page) {
      this.goodsPagination.pageNum = page;
      this.getGoodsTable();
    },
    /**
     * @function 获取用户信息
     */
    getUserDetail() {
      this.$network
        .request({
          url: this.$network.api.userDetail,
          isLoading: true,
          data: { userId: this.userId },
          target: ".user-page"
        })
        .then(res => {
          res.data.registerTime = moment(res.data.registerTime).format(
            "YYYY-MM-DD HH:mm:ss"
          );
          this.userDetail = res.data;
          if (!this.userId) {
            this.$store.commit("setUserImg", res.data.userImg);
          }
        })
        .catch(err => {});
    },
    /**
     * @function 获取用户交易表格
     */
    getTradeTable() {
      let data = {
        ...this.tradePagination
      };
      delete data.total;
      this.$network
        .request({
          url: this.$network.api.userTrade,
          data: data,
          isLoading: true,
          target: ".trade-table"
        })
        .then(res => {
          res.data.map(item => {
            item.changeTime = moment(item.changeTime).format(
              "YYYY-MM-DD HH:mm:ss"
            );
            return item;
          });
          this.userTrade = res.data;
          this.tradePagination.total = res.page.total;
        })
        .catch(err => {});
    },
    /**
     * @function 获取用户二手品表格
     */
    getGoodsTable() {
      let data = {
        ...this.goodsPagination,
        userId: this.userId
      };
      delete data.total;
      this.$network
        .request({
          url: this.$network.api.userGoods,
          data: data,
          isLoading: true,
          target: ".goods-table"
        })
        .then(res => {
          res.data.map(item => {
            item.publishTime = moment(item.publishTime).format(
              "YYYY-MM-DD HH:mm:ss"
            );
            return item;
          });
          this.userGoods = res.data;
          this.goodsPagination.total = res.page.total;
        })
        .catch(err => {});
    },
    /**
     * @function 修改密码或头像,
     * @param {Number} type 1头像2密码
     */
    updateUser(type) {
      this.changeType = type;
      this.showUpdateDialog = true;
    },
    /**
     * @function 修改用户名或地址
     * @param {Number} type 1修改用户名，2修改收货地址
     * @param {String} content 初始内容
     */
    changeUser(type, content) {
      let wxReg = new RegExp("[a-zA-Z]([-_a-zA-Z0-9]{5,19})+");
      let qqReg = new RegExp("[1-9][0-9]{4,}");
      let phReg = new RegExp("[1][3,4,5,6,7,8,9][0-9]{9}");
      let checkRule = value => {
        if (type == 1 && !value) {
          return "用户名不能为空";
        } else if (
          type == 1 &&
          typeof value == "string" &&
          (value.length > 10 || value.length < 2)
        ) {
          return "请输入2-10个字符以内的用户名";
        } else if (!this.$common.checkString(value)) {
          return type == 1?"请输入正常用户名":"请输入正常地址";
        } else if (type == 2 && !value) {
          return "地址不能为空";
        } else if (type == 2 && typeof value == "string" && value.length > 50) {
          return "请输入50个字符以内的地址";
        }
        return true;
      };
      this.$prompt(
        type == 2 ? "请输入新地址" : "请输入新名称",
        type == 2 ? "修改地址" : "修改用户名",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          inputValidator: checkRule,
          inputType: type == 2 ? "textarea" : "text",
          inputValue: content
        }
      )
        .then(({ value }) => {
          let data = type == 2 ? { address: value } : { userName: value };
          this.$network
            .request({
              url: this.$network.api.updateUser,
              data: data,
              isLoading: true,
              target: ".user-page"
            })
            .then(res => {
              if(type == 1){
                this.$message({
                  message: "修改成功，请重新登录",
                  duration: 1000,
                  type: "success"
                });
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
              }else{
                this.$message({
                  message: res.data,
                  duration: 1000,
                  type: "success"
                });
                this.getUserDetail();
              }
              
            })
            .catch(err => {});
        })
        .catch(() => {});
    },
    /**
     * @function 关闭弹窗
     * @param {String} dialog 弹窗名
     */
    closeDialog(dialog) {
      this.goodsId = null;
      this[dialog] = false;
    },
    /**
     * @function 二手品详情
     * @param {Number} goodsId 二手品id
     */
    gotoGoodsDetail(goodsId) {
      this.$router.push({ name: "goodsDetail", query: { goodsId: goodsId } });
    },
    /**
     * @function 联系对方
     * @param {Number} tradeOtherId 对方id
     */
    connect(tradeOtherId) {
      this.$router.push({
        name: "chatRoom",
        query: { custormId: tradeOtherId }
      });
    },
    /**
     * @function 支付
     * @param {String} 交易id
     */
    pay(tradeId) {
      this.$confirm("确认支付?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info"
      })
        .then(() => {
          this.$network
            .request({
              url: this.$network.api.pay,
              data: { tradeId: tradeId },
              isLoading: true,
              target: ".trade-table"
            })
            .then(res => {
              this.$message({
                message: res.data,
                type: "success",
                duration: 1000
              });
              this.getTradeTable();
            })
            .catch(err => {});
        })
        .catch(() => {});
    },
    /**
     * @function 确认收货
     * @param {String} tradeId 交易id
     */
    confirmGoods(tradeId) {
      this.$network
        .request({
          url: this.$network.api.confirmReceipt,
          data: {
            tradeId: tradeId
          },
          isLoading: true,
          target: ".trade-table"
        })
        .then(res => {
          this.$message({
            message: res.data,
            type: "success",
            duration: 1000
          });
          this.getTradeTable();
        })
        .catch(err => {});
    },
    /**
     * @function 取消交易
     * @param {String} tradeId 交易id
     * @param {Number} goodsId 二手品id
     * @param {Number} tradeStatus 交易状态
     */
    cancelTrade(tradeId, goodsId, tradeStatus) {
      this.$network
        .request({
          url: this.$network.api.cancelTrade,
          data: {
            tradeId: tradeId,
            goodsId: goodsId
          },
          isLoading: true,
          target: ".trade-table"
        })
        .then(res => {
          let msg = "";
          if (tradeStatus == 1) {
            msg = "交易撤销成功";
          } else if (tradeStatus == 2) {
            msg = "交易撤销成功，钱稍后会返还至原先支付的账户";
          }
          this.$message({
            message: msg,
            type: "success",
            duration: 1000
          });
          this.getTradeTable();
        })
        .catch(err => {});
    },
    /**
     * @function 审核不通过原因
     * @param {String} reason 原因
     * @param {Number} status 状态
     */
    seeReason(reason, status) {
      this.$alert(reason, status == 2 ? "审核不通过原因" : "强制下架原因", {
        confirmButtonText: "确定"
      }).catch(err => {});
    },
    /**
     * @function 下架
     * @param {Number} goodsId 二手品id
     */
    soldOut(goodsId) {
      this.$network
        .request({
          url: this.$network.api.soldOut,
          data: {
            goodsId: goodsId
          },
          isLoading: true,
          target: ".goods-table"
        })
        .then(res => {
          this.$message({
            type: "success",
            message: res.data,
            duration: 1000
          });
          this.getGoodsTable();
        });
    },
    /**
     * @function 上架二手品
     * @param {Number} goodsId 已经上架的二手品id（可无）
     */
    goodsPublish(goodsId) {
      if (goodsId) {
        this.goodsId = goodsId;
      }
      this.showPublishDialog = true;
    },
    /**
     * @function 修改价格
     * @param {Number} goodsId 二手品id
     * @param {Number} goodsPrice 二手品价格
     */
    updatePrice(goodsId, goodsPrice) {
      let checkRule = value => {
        if (value <= 0) {
          return "请输入大于0的数字";
        } else if (value >= 10000) {
          return "请输入小于10000的数字";
        }
        return 0;
      };
      this.$prompt("新价格", "修改二手品价格", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputValidator: checkRule,
        inputType: "number",
        inputValue: goodsPrice
      })
        .then(({ value }) => {
          this.$network
            .request({
              url: this.$network.api.priceUpdate,
              data: {
                goodsId: goodsId,
                goodsPrice: value
              },
              isLoading: true,
              target: ".goods-table"
            })
            .then(res => {
              this.$message({
                message: res.data,
                duration: 1000,
                type: "success"
              });
              this.getGoodsTable();
            })
            .catch(err => {});
        })
        .catch(() => {});
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.$store.commit("setSideBar", 1);
    });
  }
};
</script>
<style lang="scss" scoped>
.user-page {
  .user-info {
    color: #909399;
    border: 1px solid #dcdcdc;
    tr {
      td {
        padding: 20px;
        border-right: 1px solid #dcdcdc;
        border-bottom: 1px solid #dcdcdc;
        &:last-child {
          border-right: 0;
        }
        &:nth-child(odd) {
          background: #eee;
          text-align: center;
          white-space: nowrap;
        }
        &:nth-child(even) {
          width: 200px;
        }
        .change-btn {
          vertical-align: initial;
          margin-left: 10px;
        }
        img {
          width: 30px;
          height: 30px;
          border-radius: 15px;
          object-fit: cover;
          border: 1px solid #bbb;
        }
      }
      &:last-child {
        td {
          border-bottom: 0;
        }
      }
    }
  }
  h1 {
    margin: 20px 0;
    font-size: 16px;
    font-weight: 600;
  }
  .el-table {
    border: 1px solid #dcdcdc;
    border-bottom: 0;
  }
  .pagination {
    margin-top: 20px;
    text-align: right;
  }
  .publish {
    margin-top: 20px;
  }
}
</style>