<template>
  <div class="trade-BBS">
    <!-- 帖子列表 -->
    <div class="post-list">
      <ul>
        <li v-for="item in postList" :key="item.postId" @click="gotoDetail(item.postId)">
          <div class="poster" @click.stop="gotoPoster(item.posterId)">
            <img v-if="item.posterImg" :src="item.posterImg" alt />
            <img v-else src="@/assets/default_user.jpg" alt="">
            <div class="overflow">{{item.posterName}}</div>
          </div>
          <div class="post">
            <h2 class="post-title">{{item.postTitle}}</h2>
            <div class="post-info">
              <span>发帖时间：{{item.postTime}}</span>
              <span>回复数：{{item.replyNum}}</span>
            </div>
          </div>
        </li>
      </ul>
      <el-pagination
        class="pagination"
        @current-change="changePage"
        :current-page="pagination.pageNum"
        :page-size="pagination.pageSize"
        layout="total, prev, pager, next, jumper"
        :total="pagination.total"
      ></el-pagination>
    </div>
    <!-- 发帖 -->
    <el-form label-width="80px" :model="formData" ref="formData" :rules="rules">
      <el-form-item label="帖子标题" prop="postTitle">
        <el-input type="text" v-model="formData.postTitle" :maxlength="20" placeholder="请输入帖子标题" show-word-limit></el-input>
      </el-form-item>
      <el-form-item label="帖子内容" prop="postContent">
        <el-input
          type="textarea"
          placeholder="请输入帖子内容"
          v-model="formData.postContent"
          :autosize="{ minRows: 8, maxRows: 12}"
        ></el-input>
      </el-form-item>
      <el-form-item class="btn" label-width="0">
        <el-button type="primary" @click="submit" :disabled="disableBtn">发帖</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import moment from 'moment'
export default {
  name: "TradeBBS",
  data() {
    var checkTitle = (rule,value,callback)=>{
      if(!this.$common.checkString(value)){
        callback(new Error("请勿输入疑似手机号、qq号、微信号等信息"))
      }else{
        callback()
      }
    }
    return {
      disableBtn:false,
      formData: {
        postTitle: null,
        postContent: null
      },
      rules: {
        postTitle: [
          { required: true, message: "请输入帖子标题", trigger: "blur" },
          { max: 20, message: "请输入20个字符以内的标题", trigger: "blur" },
          {validator: checkTitle, trigger: "blur"}
        ],
        postContent: [
          { required: true, message: "请输入帖子内容", trigger: "blur" },
          {validator: checkTitle, trigger: "blur"}
        ]
      },
      pagination: {
        total: 0,
        pageSize: 20,
        pageNum: 1
      },
      postList: []
    };
  },
  mounted() {
    this.getPostList();
  },
  methods: {
    /**
     * @function 切换分页
     * @param {Number} page 页码
     */
    changePage(page) {
      this.pagination.pageNum = page;
      this.getPostList();
    },
    /**
     * @function 获取帖子列表
     */
    getPostList() {
      let data = {
        ...this.pagination
      }
      delete data.total
      this.$network.request({
        url:this.$network.api.postList,
        data:data,
        isLoading:true,
        target:'.trade-BBS'
      }).then(res=>{
        res.data.map(item=>{
          item.postTime = moment(item.postTime).format(
            "YYYY-MM-DD HH:mm:ss"
          );
          return item
        })
        this.postList = res.data
        this.pagination.total = res.page.total
      })
    },
    /**
     * @function 发帖人信息
     * @param {Number} 发帖人id
     */
    gotoPoster(posterId) {
      this.$router.push({name:'userPage',query:{userId:posterId}})
    },
    /**
     * @function 帖子详情
     * @param {Number} postId
     */
    gotoDetail(postId) {
      this.$router.push({ name: "tradeBBSDetail", query: { postId: postId } });
    },
    /**
     * @function 发帖
     */
    submit() {
      this.$refs.formData.validate(valid => {
        if (valid) {
          this.disableBtn = true
          this.$network.request({
            url:this.$network.api.BBSPost,
            data:this.formData,
            isLoading:true
          }).then(res=>{
            this.$message({
              message:res.data,
              type:'success',
              duration:1000
            })
            this.$refs.formData.resetFields()
            this.getPostList()
          }).finally(()=>{
            this.disableBtn = false
          })
        } else {
          return false;
        }
      });
    },
  },
  beforeRouteEnter(to,from,next){
    next(vm=>{
      vm.$store.commit('setSideBar',3)
    })
  }
};
</script>
<style lang="scss" scoped>
.trade-BBS {
  display: flex;
  .post-list {
    width: 600px;
    li {
      margin: auto;
      display: flex;
      width: 500px;
      border: 2px solid #eee;
      &:not(:last-child) {
        border-bottom: 0;
      }
      .poster {
        padding: 10px;
        text-align: center;
        background: #ddd;
        cursor: pointer;
        img {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: 20px;
        }
        div {
          font-size: 14px;
          margin-top: 10px;
          max-width: 80px;
        }
      }
      .post {
        padding: 10px;
        flex-grow: 1;
        margin-left: 20px;
        .post-title {
          font-size: 16px;
          height: 50px;
        }
        .post-info {
          color: #999;
          text-align: end;
          span {
            &:first-child {
              margin-right: 10px;
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
  .el-form {
    position: fixed;
    left: 760px;
    border: 1px solid #eee;
    padding: 20px;
    min-width: 320px;
    flex-grow: 1;
    margin: 0 20px;
    .btn {
      text-align: center;
    }
  }
}
</style>