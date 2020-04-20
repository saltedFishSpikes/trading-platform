<template>
  <div class="trade-BBS-detail">
    <!-- 发帖信息 -->
    <div class="post">
      <div class="poster" @click="gotoUser(postDetail.posterId)">
        <img v-if="postDetail.posterImg" :src="postDetail.posterImg" alt />
        <img v-else src="@/assets/default_user.jpg" />
        <div class="overflow">{{postDetail.posterName}}</div>
      </div>
      <div class="post-info">
        <h1 class="title">{{postDetail.postTitle}}</h1>
        <p class="content">{{postDetail.postContent}}</p>
      </div>
    </div>
    <el-button type="primary" @click="reply(null,null,null,2)">评论</el-button>
    <el-button type="primary" @click="sendGoods">发送二手品</el-button>
    <!-- 回帖信息 -->
    <div class="reply">
      <ul v-if="replyList.length">
        <li v-for="(item,index) in replyList" :key="item.replyId" class="reply-item">
          <div class="replyer-name">
            <span @click="gotoUser(item.replyerId)">{{item.replyerName}}</span>：
          </div>
          <div class="reply-content" v-if="item.replyContent.type == 1">{{item.replyContent.data}}</div>
          <div v-else class="goods-card">
              <ZfGoodsCard
                :goodsName="item.replyContent.data.goodsName"
                :goodsId="item.replyContent.data.goodsId"
                :goodsImg="item.replyContent.data.goodsImg"
              ></ZfGoodsCard>
            </div>
          <div class="reply-time">
            <el-button type="text" @click="reply(item.replyId,null,null,1)">回复</el-button>
            {{item.replyTime}}
          </div>
          <!-- 回复列表 -->
          <ul
            ref="commit"
            v-if="item.commit.length"
            :class="['commit-list',{'hide-list':commitHeight[index] >= 200 && showListIndex != item.replyId}]"
          >
            <li v-for="i in item.commit" :key="i.commitId" class="commit-item">
              <span class="from" @click="gotoUser(i.commiterId)">{{i.commiterName}}</span>
              <template v-if="i.commitOtherId != i.commiterId && i.commitOtherId">
                <span>回复</span>
                <span class="to" @click="gotoUser(i.commitOtherId)">{{i.commitOtherName}}</span>
              </template>
              <span style="word-break:break-all">：{{i.commitContent}}</span>
              <div>
                <el-button type="text" @click="reply(item.replyId,i.commitId,i.commiterId,1)">回复</el-button>
                <span>{{i.commitTime}}</span>
              </div>
            </li>
          </ul>
          <div
            class="hide"
            v-show="commitHeight[index] >= 200 && showListIndex != item.replyId"
            @click="showList(item.replyId)"
          >显示全部内容</div>
        </li>
      </ul>
      <div v-else>暂无评论</div>
    </div>
    <!-- 分页 -->
    <el-pagination
      class="pagination"
      @current-change="changePage"
      :current-page="pagination.pageNum"
      :page-size="pagination.pagesize"
      layout="total, prev, pager, next, jumper"
      :total="pagination.total"
    ></el-pagination>
    <ZfSendGoodsDialog
      :show.sync="showSendGoodsDialog"
      :postId="postId"
      @getReply="getReply"
      @closeDialog="showSendGoodsDialog = false"
    ></ZfSendGoodsDialog>
  </div>
</template>
<script>
import moment from "moment";
import ZfGoodsCard from "@/components/zf-goods-card.vue";
import ZfSendGoodsDialog from '@/components/zf-send-goods-dialog.vue'
export default {
  name: "TradeBBSDetail",
  components:{
    ZfSendGoodsDialog,
    ZfGoodsCard
  },
  data() {
    return {
      replyDialog: false,
      postId: null,
      type: 1, //1回复2评论
      pagination: {
        total: 0,
        pageSize: 10,
        pageNum: 1
      },
      postDetail: {},
      replyList: [],
      showListIndex: -1,
      commitHeight: [],
      showSendGoodsDialog:false
    };
  },
  mounted() {
    this.postId = this.$route.query.postId
      ? parseInt(this.$route.query.postId)
      : null;
    this.getPostDetail();
    this.getReply();
  },
  methods: {
    /**
     * @function 获取帖子详情
     */
    getPostDetail() {
      this.$network
        .request({
          url: this.$network.api.postDetail,
          data: {
            postId: this.postId
          },
          isLoading: true,
          target: ".trade-BBS-detail"
        })
        .then(res => {
          this.postDetail = res.data;
        });
    },
    /**
     * @function 切换分页
     * @param {Number} page 页码
     */
    changePage(page) {
      this.pagination.pageNum = page;
      this.getReply();
    },
    /**
     * @function 获取评论
     */
    getReply() {
      let data = {
        postId: this.postId,
        ...this.pagination
      };
      delete data.total;
      this.$network
        .request({
          url: this.$network.api.replyList,
          data: data,
          isLoading: true,
          target: ".reply"
        })
        .then(res => {
          res.data.map(item => {
            item.replyTime = moment(item.replyTime).format(
              "YYYY-MM-DD HH:mm:ss"
            );
            item.commit.map(i => {
              i.commitTime = moment(i.commitTime).format("YYYY-MM-DD HH:mm:ss");
              return i;
            });
            item.replyContent = JSON.parse(item.replyContent)
            return item;
          });
          this.replyList = res.data;
          this.pagination.total = res.page.total;
          this.$nextTick(() => {
            let arr = [];
            Array.isArray(this.$refs.commit) &&
              this.$refs.commit.forEach(item => {
                arr.push(item.offsetHeight);
              });
            this.commitHeight = arr;
          });
        });
    },
    /**
     * @function 评论
     * @param {Number} replyerId 评论id
     * @param {Number} commitId 回复id
     * @param {Number} commiterId 回复对象id
     * @param {Number} type 1回复，2评论
     */
    reply(replyId = null, commitId = null, commiterId = null, type) {
      var checkInput = (value)=>{
        if(!this.$common.checkString(value)){
          return "请勿输入疑似手机号、qq号、微信号的信息"
        }
        return true
      }
      this.$prompt(type == 1 ? "回复" : "评论", "", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputValidator: checkInput,
        inputType: "textarea"
      }).then(({ value }) => {
        let url = this.$network.api.commit;
        let data = {
          replyId: replyId,
          commitToId: commiterId,
          content: value
        };
        if (type == 2) {
          url = this.$network.api.reply;
          data = {
            postId: this.postId,
            content: JSON.stringify({ data:value, type: 1 })
          };
        }
        this.$network
          .request({
            url: url,
            data: data,
            isLoading: true,
            target: ".zf-reply-dialog"
          })
          .then(res => {
            this.$message({
              message: res.data,
              duration: 1000,
              type: "success"
            });
            this.getReply()
          }).catch(err=>{});
      }).catch(()=>{});
    },
    /**
     * @function 发送二手品
     */
    sendGoods(){
      this.showSendGoodsDialog = true
    },
    /**
     * @function 显示或隐藏过长的列表
     * @param {Number} replyId 评论id
     */
    showList(replyId) {
      this.showListIndex = this.showListIndex == replyId ? "-1" : replyId;
    },
    /**
     * @function 查看用户
     * @param {Number} userId 用户id
     */
    gotoUser(userId) {
      this.$router.push({ name: "userPage", query: { userId: userId } });
    }
  }
};
</script>
<style lang="scss" scoped>
.trade-BBS-detail {
  width: 650px;
  box-sizing: border-box;
  .post {
    display: flex;
    padding: 10px 20px;
    border: 1px solid #ddd;
    margin-bottom: 20px;
    .poster {
      cursor: pointer;
      text-align: center;
      img {
        width: 40px;
        height: 40px;
        object-fit: cover;
        border-radius: 20px;
      }
      div {
        font-size: 14px;
        max-width: 80px;
        margin-top: 10px;
      }
    }
    .post-info {
      margin-left: 10px;
      padding-top: 5px;
      .title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 5px;
      }
      .content {
        line-height: 16px;
        text-align: justify;
      }
    }
  }
  .reply {
    padding: 20px;
    margin-top: 20px;
    border: 1px solid #ddd;
    .reply-item {
      position: relative;
      &:not(:last-child) {
        margin-bottom: 10px;
      }
      .replyer-name {
        span {
          color: #808080;
          padding: 2px 5px;
          border: 1px solid #D3D3D3;
          font-size: 16px;
          border-radius: 4px;
        }
      }
      .reply-content {
        line-height: 16px;
        padding: 5px 30px;
      }
      .goods-card {
        margin:10px auto 10px 30px;
      }
      .reply-time {
        display: flex;
        align-items: center;
        color: #aaa;
        margin: 5px 10px;
        .el-button {
          margin-right: 5px;
        }
      }
      .hide-list {
        max-height: 200px;
        overflow: hidden;
      }
      .hide {
        cursor: pointer;
        position: absolute;
        width: 100%;
        bottom: 0;
        padding: 10px 0;
        text-align: center;
        background: linear-gradient(transparent, #ddd);
      }
      .commit-list {
        padding-bottom: 20px;
        .commit-item {
          background: #eeeeee55;
          padding: 10px;
          line-height: 16px;
          .from,
          .to {
            color: #999;
          }
          div {
            color: #999;
            margin-top: 3px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            .el-button {
              margin-right: 5px;
            }
          }
        }
      }
    }
  }
  .pagination {
    margin-top: 20px;
    text-align: center;
  }
}
</style>