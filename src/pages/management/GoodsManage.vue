<template>
  <div class="goods-manage">
    <!-- 搜索表单 -->
    <el-form :model="searchForm" label-width="100px" ref="searchForm" inline>
      <el-form-item prop="goodsName" label="二手品名称">
        <el-input v-model="searchForm.goodsName" placeholder="请输入二手品名称" size="small" clearable></el-input>
      </el-form-item>
      <el-form-item prop="sellerName" label="卖家">
        <el-input v-model="searchForm.sellerName" placeholder="请输入卖家名称" size="small" clearable></el-input>
      </el-form-item>
      <el-form-item prop="goodsStatus" label="二手品状态">
        <el-select v-model="searchForm.goodsStatus" placeholder="请选择二手品状态" size="small" clearable>
          <el-option v-for="(item,index) in allStatus" :key="item" :label="item" :value="index+1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="small" @click="getTable">查询</el-button>
        <el-button size="small" @click="reset">清空查询条件</el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table :data="currentPage" class="manage-goods-table">
      <el-table-column prop="goodsId" label="二手品编号" width="100"></el-table-column>
      <el-table-column prop="goodsName" label="二手品名称" width="150" show-overflow-tooltip></el-table-column>
      <el-table-column prop="typeName" label="二手品类型" width="100"></el-table-column>
      <el-table-column prop="sellerName" label="卖家名称" width="120" show-overflow-tooltip></el-table-column>
      <el-table-column prop="publishTime" label="上架时间" width="150"></el-table-column>
      <el-table-column label="二手品状态" width="100">
        <template slot-scope="scope">{{allStatus[scope.row.goodsStatus-1]}}</template>
      </el-table-column>
      <el-table-column label="操作" min-width="200">
        <template slot-scope="scope">
          <el-button type="text" @click="goodsDetail(scope.row.goodsId)">查看二手品详情</el-button>
          <el-button
            type="text"
            @click="check(scope.row.goodsId)"
            v-if="scope.row.goodsStatus == 1"
          >审核</el-button>
          <el-button
            type="text"
            @click="gotoTrade(scope.row.goodsName)"
            v-else-if="scope.row.goodsStatus == 4"
          >查看交易</el-button>
          <el-button
            type="text"
            @click="soldOut(scope.row.goodsId)"
            v-else-if="scope.row.goodsStatus == 3"
          >下架</el-button>
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
import typeArr from "@/assets/json/goodsType.json";
export default {
  name: "GoodsManage",
  data() {
    return {
      pagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      searchForm: {
        goodsName: null,
        sellerName: null,
        goodsStatus: null,
        sellerId: null
      },
      allStatus: [
        "待审核",
        "审核未通过",
        "未出售",
        "已出售",
        "已下架",
        "强制下架"
      ],
      currentPage: [],
      allType:[]
    };
  },
  mounted() {
    this.allType = JSON.parse(JSON.stringify(typeArr.typeArr));
    if (this.$route.params.userName) {
      this.searchForm.sellerName = this.$route.params.userName;
      this.searchForm.sellerId = this.$route.params.userId;
    }
    this.getTable();
    this.searchForm.sellerId = null;
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
          url: this.$network.api.manageGoodsList,
          data: data,
          isLoading: true,
          target: ".manage-goods-table"
        })
        .then(res => {
          res.data.map(item => {
            item.publishTime = moment(item.publishTime).format(
              "YYYY-MM-DD HH:mm:ss"
            );
            item.typeName = this.allType.find(i=>{return i.typeId == item.goodsType}).typeName
            return item;
          });
          this.currentPage = res.data;
          this.pagination.total = res.page.total;
        });
    },
    /**
     * @function 二手品详情
     * @param {Number} goodsId 二手品详情
     */
    goodsDetail(goodsId) {
      this.$router.push({ name: "goodsDetail", query: { goodsId: goodsId } });
    },
    /**
     * @function 交易详情
     * @param {Number} goodsId 交易id
     */
    gotoTrade(goodsName) {
      this.$router.push({name:"tradeManage",params:{goodsName:goodsName}})
    },
    /**
     * @function 下架二手品
     * @param {Number} goodsId 二手品id
     */
    soldOut(goodsId) {
      this.$prompt("请输入强制下架理由", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(({ value }) => {
          this.$network
            .request({
              url: this.$network.api.goodsCheck,
              data: {
                goodsId: goodsId,
                status: 6,
                reason: value
              }
            })
            .then(res => {
              this.$message({
                type: "success",
                duration: 1000,
                message: res.data
              });
              this.getTable();
            });
        })
        .catch(() => {});
    },
    /**
     * @function 二手品审核
     * @param {Number} goodsId 二手品id
     */
    check(goodsId) {
      this.$confirm("该二手品审核是否通过", "审核", {
        confirmButtonText: "通过",
        cancelButtonText: "不通过",
        type: "info"
      })
        .then(() => {
          this.$network
            .request({
              url: this.$network.api.goodsCheck,
              data: {
                goodsId: goodsId,
                status: 3
              }
            })
            .then(res => {
              this.$message({
                type: "success",
                duration: 1000,
                message: res.data
              });
              this.getTable();
            });
        })
        .catch(() => {
          this.$prompt("请输入不通过理由", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消"
          })
            .then(({ value }) => {
              this.$network
                .request({
                  url: this.$network.api.goodsCheck,
                  data: {
                    goodsId: goodsId,
                    status: 2,
                    reason: value
                  }
                })
                .then(res => {
                  this.$message({
                    type: "success",
                    duration: 1000,
                    message: res.data
                  });
                  this.getTable();
                });
            })
            .catch(() => {});
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
      vm.$store.commit("setManageTab", "2");
    });
  }
};
</script>
<style lang="scss" scoped>
.goods-manage {
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