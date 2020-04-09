<template>
  <div class="trade-manage">
    <!-- 搜索表单 -->
    <el-form :model="searchForm" ref="searchForm" inline label-width="85px">
      <el-form-item label="交易单号" prop="tradeId">
        <el-input style="width:220px" v-model="searchForm.tradeId" size="small" clearable placeholder="请输入交易单号"></el-input>
      </el-form-item>
      <el-form-item label="二手品名称" prop="goodsName">
        <el-input v-model="searchForm.goodsName" size="small" clearable placeholder="请输入二手品名称"></el-input>
      </el-form-item>
      <el-form-item label="卖家" prop="sellerName">
        <el-input v-model="searchForm.sellerName" size="small" clearable placeholder="请输入卖家"></el-input>
      </el-form-item>
      <el-form-item label="买家" prop="buyerName">
        <el-input v-model="searchForm.buyerName" size="small" clearable placeholder="请输入买家"></el-input>
      </el-form-item>
      <el-form-item label="交易状态" prop="tradeStatus">
        <el-select v-model="searchForm.tradeStatus" size="small" clearable placeholder="请选择交易状态">
          <el-option v-for="(item,index) in allStatus" :key="item" :label="item" :value="index+1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="small" @click="getTable">查询</el-button>
        <el-button size="small" @click="reset">清空查询条件</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="currentPage" class="manage-trade-table">
      <el-table-column prop="tradeId" label="交易单号" width="185"></el-table-column>
      <el-table-column prop="goodsName" label="二手品名称" width="115" show-overflow-tooltip></el-table-column>
      <el-table-column prop="sellerName" label="卖家" min-width="88" show-overflow-tooltip></el-table-column>
      <el-table-column prop="buyerName" label="买家" min-width="88" show-overflow-tooltip></el-table-column>
      <el-table-column prop="changeTime" label="最近改变时间" width="140"></el-table-column>
      <el-table-column prop="price" label="原价/成交价" width="90"></el-table-column>
      <el-table-column label="交易状态" width="180">
        <template slot-scope="scope">{{allStatus[scope.row.tradeStatus-1]}}</template>
      </el-table-column>
      <el-table-column label="操作" width="300">
        <template slot-scope="scope">
          <el-button type="text" @click="gotoGoods(scope.row.goodsName)">查看二手品</el-button>
          <el-button type="text" @click="gotoUser(scope.row.buyerName)">查看买家</el-button>
          <el-button type="text" @click="gotoUser(scope.row.sellerName)">查看卖家</el-button>
          <el-button type="text" @click="showChat(scope.row.sellerId,scope.row.buyerId)">查看沟通记录</el-button>
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
import moment from 'moment'
export default {
  name:"TradeManage",
  data(){
    return {
      pagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      searchForm:{
        tradeId:null,
        sellerName:null,
        buyerName:null,
        goodsName:null,
        tradeStatus:null,
        buyerId:null,
        sellerId:null
      },
      allStatus:[
        "未支付",
        "已支付",
        "主动取消交易",
        "完成",
        "长时间未支付，交易取消"
      ],
      currentPage:[]
    }
  },
  mounted(){
    if(this.$route.params.userName){
      if(this.$route.params.type){
        this.searchForm.buyerName = this.$route.params.userName
        this.searchForm.buyerId = this.$route.params.userId
      }else{
        this.searchForm.sellerName = this.$route.params.userName
        this.searchForm.sellerId = this.$route.params.userId
      }
    }
    this.getTable()
    this.searchForm.sellerId = null
    this.searchForm.buyerId = null
  },
  methods:{
    /**
     * @function 切换分页
     * @param {Number} page 页码
     */
    changePage(page) {
      this.pagination.pageNum = page;
      this.getTable();
    },
    /**
     * @function 获取表格数据
     */
    getTable(){
      let data = {
        ...this.pagination,
        ...this.searchForm
      }
      delete data.total
      this.$network.request({
        url:this.$network.api.manageTradeList,
        data:data,
        isLoading:true,
        target:'.manage-trade-table'
      }).then(res=>{
        res.data.map(item=>{
          item.changeTime = moment(item.changeTime).format("YYYY-MM-DD HH:mm:ss")
          return item
        })
        this.currentPage = res.data
        this.pagination.total = res.page.total
      })
    },
    /**
     * @function 查看二手品
     * @param {String} goodsName 二手品名称
     */
    gotoGoods(goodsName){
      this.$router.push({name:'goodsManage',params:{goodsName:goodsName}})
    },
    /**
     * @function 查看用户
     * @param {String} userName 用户名称
     */
    gotoUser(userName) {
      this.$router.push({name:'userManage',params:{userName:userName}})
    },
    /**
     * @function 查看聊天记录
     * @param {String} sellerId 卖家名称
     * @param {String} buyerId 买家名称
     */
    showChat(sellerId,buyerId){
      this.$router.push({name:'chatRoom',query:{sellerId:sellerId,buyerId:buyerId}})
    },
    /**
     * @function 清空查询条件
     */
    reset() {
      this.$refs["searchForm"].resetFields();
    }
  },
  beforeRouteEnter(to,from,next){
    next(vm=>{
      vm.$store.commit('setManageTab','3')
    })
  }
}
</script>
<style lang="scss" scoped>
.trade-manage {
  .el-form {
    padding: 10px;
    background: #eee;
    margin: 20px 0;
    .el-form-item {
      margin-bottom: 0;
      .el-input {
        width: 180px;
      }
      .el-select {
        width: 180px;
      }
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