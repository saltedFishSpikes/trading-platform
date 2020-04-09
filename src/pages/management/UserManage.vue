<template>
  <div class="user-manage">
    <!-- 搜索表单 -->
    <el-form :model="searchForm" label-width="100px" inline ref="searchForm">
      <el-form-item prop="userName" label="用户名">
        <el-input v-model="searchForm.userName" size="small" clearable placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item prop="status" label="用户状态">
        <el-select v-model="searchForm.status" size="small" clearable placeholder="请选择用户状态">
          <el-option v-for="item in allStatus" :key="item" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="successNum" label="交易成功数">
        <el-select v-model="searchForm.successNum" size="small" clearable placeholder="请选择">
          <el-option v-for="item in allSuccess" :key="item" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button size="small" type="primary" @click="getTable">搜索</el-button>
        <el-button size="small" @click="reset">清空搜索条件</el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table :data="currentPage" class="manage-user-table">
      <el-table-column label="用户编号" prop="userId" width="100"></el-table-column>
      <el-table-column label="用户名" prop="userName" width="100" show-overflow-tooltip></el-table-column>
      <el-table-column label="注册时间" prop="registerTime" width="150"></el-table-column>
      <el-table-column label="收货地址" prop="address" min-width="150" show-overflow-tooltip></el-table-column>
      <el-table-column label="完成交易数" prop="successNum" width="80"></el-table-column>
      <el-table-column label="用户状态" width="80">
        <template slot-scope="scope">{{scope.row.status==1?'正常':'禁用'}}</template>
      </el-table-column>
      <el-table-column label="操作" width="380">
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="changeStatus(scope.row.userId,scope.row.status)"
          >{{scope.row.status == 1?'禁用':'解除禁用'}}</el-button>
          <el-button type="text" @click="gotoGoods(scope.row.userId,scope.row.userName)">该用户的二手品</el-button>
          <el-button
            type="text"
            @click="gotoTrade(scope.row.userId,scope.row.userName,false)"
          >作为卖家的交易</el-button>
          <el-button
            type="text"
            @click="gotoTrade(scope.row.userId,scope.row.userName,true)"
          >作为买家的交易</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      class="pagination"
      @current-change="changePage"
      :current-page="pagination.pageNum"
      :page-size="pagination.pagesize"
      layout="total, prev, pager, next, jumper"
      :total="pagination.total"
    ></el-pagination>
  </div>
</template>
<script>
import moment from "moment";
export default {
  name: "UserManage",
  data() {
    return {
      pagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      searchForm: {
        userName: null,
        status: null,
        successNum: null
      },
      allStatus: ["禁用", "正常"],
      allSuccess: ["0~10", "10~50", "50以上"],
      currentPage: []
    };
  },
  mounted() {
    if(this.$route.params.userName){
      this.searchForm.userName = this.$route.params.userName
    }
    this.getTable();
  },
  methods: {
    /**
     * @function 切换分页
     * @param {Number} page 页码
     */
    changePage(page) {
      this.pagination.pageNum = page;
      this.getTable();
    },
    /**
     * @function 获取表格
     */
    getTable() {
      let data = {
        ...this.pagination,
        ...this.searchForm
      };
      delete data.total;
      this.$network
        .request({
          url: this.$network.api.manageUserList,
          data: data,
          isLoading: true,
          target: ".manage-user-table"
        })
        .then(res => {
          res.data.map(item => {
            item.registerTime = moment(item.registerTime).format(
              "YYYY-MM-DD HH:mm:ss"
            );
          });
          this.currentPage = res.data;
          this.pagination.total = res.page.total;
        });
    },
    /**
     * @function 改变状态
     * @param {Number} userId 用户id
     * @param {Number} status 用户现在状态
     */
    changeStatus(userId, status) {
      this.$confirm(
        "确定" + (status == 1 ? "禁用" : "解禁") + "该用户？",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(() => {
          this.$network
            .request({
              url: this.$network.api.userStatus,
              data: {
                userId: userId,
                status: status == 1 ? 2 : 1
              }
            })
            .then(res => {
              this.$message({
                message: res.message,
                type: "success",
                duration: 1000
              });
              this.getTable();
            });
        })
        .catch(() => {});
    },
    /**
     * @function 前往二手品
     * @param {Number} userId 用户id
     * @param {String} userName 用户名
     */
    gotoGoods(userId, userName) {
      this.$router.push({
        name: "goodsManage",
        params: { userId: userId, userName: userName }
      });
    },
    /**
     * @function 前往交易
     * @param {Number} userId 用户id
     * @param {String} userName 用户名
     * @param {Boolean} type 类型，true买家，false卖家
     */
    gotoTrade(userId, userName, type) {
      this.$router.push({
        name: "tradeManage",
        params: { userId: userId, userName: userName, type: type }
      });
    },
    /**
     * @function 清空查询条件
     */
    reset() {
      this.$refs["searchForm"].resetFields();
    }
  },

  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.$store.commit("setManageTab", "1");
    });
  }
};
</script>
<style lang="scss" scoped>
.user-manage {
  .el-form {
    padding: 10px;
    background: #eee;
    margin: 20px 0;
    .el-form-item {
      margin-bottom: 0;
    }
  }
  .el-table {
    border: 1px solid #dcdcdc;
    border-bottom: 0;
  }
  .pagination {
    margin-top: 20px;
    text-align: right;
  }
}
</style>