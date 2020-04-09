<template>
  <div class="home">
    <!-- 搜索 -->
    <div class="search-form">
      <el-form inline :model="searchForm" ref="searchForm">
        <el-form-item label="二手品名称" prop="goodsName">
          <el-input v-model="searchForm.goodsName" clearable placeholder="请输入二手品名称" size="mini"></el-input>
        </el-form-item>
        <el-form-item label="发布时间" prop="publishTime">
          <el-date-picker
            clearable
            v-model="searchForm.publishTime"
            type="daterange"
            size="mini"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="二手品类别" prop="goodsType">
          <el-select v-model="searchForm.goodsType" clearable size="mini">
            <el-option v-for="item in allType" :key="item.typeId" :value="item.typeId" :label="item.typeName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="卖家名称" prop="sellerName">
          <el-input v-model="searchForm.sellerName" clearable placeholder="请输入卖家名称" size="mini"></el-input>
        </el-form-item>
        <el-form-item label="交易成功数" prop="successNum">
          <el-select v-model="searchForm.successNum" size="mini" clearable>
            <el-option v-for="item in allSuccessNum" :key="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" @click="getTable">查询</el-button>
          <el-button @click="reset" size="mini">清除查询条件</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 二手品列表 -->
    <div class="goods-list">
      <ul>
        <li v-for="item in goodsList" :key="item.goodsId" @click="gotoGoodsDetail(item.goodsId)">
          <img v-if="item.goodsImg" :src="item.goodsImg" class="goods-img" />
          <img v-else src="@/assets/default_goods.jpg" class="goods-img">
          <div class="goods-info">
            <span class="overflow">{{item.goodsName}}</span>
            <span class="overflow">¥{{item.goodsPrice}}</span>
          </div>
          <div class="seller">
            <img v-if="item.seller.userImg" :src="item.seller.userImg"/>
            <img v-else src="@/assets/default_user.jpg">
            <div class="seller-info">
              <div class="seller-name overflow">{{item.seller.name}}</div>
              <div class="seller-credit">
                <div>交易数{{item.seller.successNum}}</div>
              </div>
            </div>
          </div>
        </li>
      </ul>
      <!-- 分页 -->
      <el-pagination
        class="pagination"
        @current-change="changePage"
        :current-page="pagination.pageNum"
        :page-size="pagination.pageSize"
        layout="total, prev, pager, next, jumper"
        :total="pagination.total"
      ></el-pagination>
    </div>
  </div>
</template>
<script>
import typeArr from '@/assets/json/goodsType.json'
import moment from 'moment';
export default {
  name: "Home",
  data() {
    return {
      searchForm: {
        goodsName: null,
        publishTime: null,
        goodsType: null,
        successNum: null,
        sellerName: null
      },
      allType:[],
      //卖家成交数
      allSuccessNum: ["0~10", "10~50", "50以上"],
      goodsList: [],
      pagination: {
        pageNum: 1,
        pageSize: 20,
        total: 0
      }
    };
  },
  mounted() {
    this.allType = JSON.parse(JSON.stringify(typeArr.typeArr))
    this.getTable();
  },
  methods: {
    /**
     * @function 清空查询条件
     */
    reset() {
      this.$refs["searchForm"].resetFields();
    },
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
     * @param {}
     */
    getTable() {
      let param = {
        ...this.pagination,
        ...this.searchForm
      };
      if (this.searchForm.publishTime) {
        param.startTime = moment(this.searchForm.publishTime[0]).format('x');
        param.endTime = moment(this.searchForm.publishTime[1]).format('x');
      }
      delete param.publishTime;
      delete param.total;
      this.$network
        .request({
          url: this.$network.api.goodsList,
          data: param,
          isLoading:true,
          target:'.goods-list'
        })
        .then(res => {
          this.goodsList = res.data;
          this.pagination.total = res.page.total;
        }).catch(err=>{});
    },
    /**
     * @function 跳转到二手品详情
     * @param {Number} goodsId
     */
    gotoGoodsDetail(goodsId) {
      this.$router.push({ name: "goodsDetail", query: { goodsId: goodsId } });
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.$store.commit("setSideBar", 0);
    });
  }
};
</script>
<style lang="scss" scoped>
.home {
  .el-carousel {
    width: 80%;
    margin: 0 auto;
  }
  .carousel-img {
    width: 100%;
    height: 100%;
    background-position: center;
    background-size: cover;
  }
  .search-form {
    margin: 0 20px;
    background: #f4f4f4;
    padding: 15px 15px 0px 15px;
    .el-form-item {
      margin-bottom: 10px;
    }
    .el-input {
      width: 150px;
    }
    .el-select {
      width: 100px;
    }
  }
  .goods-list {
    margin: 20px;
    ul {
      display: flex;
      flex-wrap: wrap;
      li {
        margin: 10px;
        padding-bottom: 5px;
        width: 150px;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
          0 0 6px 0 rgba(0, 0, 0, 0.04);
        .goods-img {
          width: 150px;
          height: 150px;
          object-fit: cover;
        }
        .goods-info {
          margin: 5px 5px 10px 5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          span {
            width: 50%;
            &:first-child {
              font-size: 16px;
              font-weight: 600;
            }
            &:last-child {
              text-align: right;
            }
          }
        }
        .seller {
          display: flex;
          margin: 0 5px 5px 5px;
          align-items: center;
          img {
            width: 25px;
            height: 25px;
            border-radius: 12.5px;
            object-fit: cover;
            margin-right: 5px;
          }
          .seller-info {
            flex-grow: 1;
            height: 25px;
            > div {
              font-size: 12px;
              height: 12px;
              line-height: 12px;
              max-width: 110px;
            }
            .seller-credit {
              display: flex;
              justify-content: space-between;
              div {
                color: #909399;
                font-size: 12px;
              }
            }
          }
        }
      }
    }
    .pagination {
      margin-top: 20px;
      text-align: right;
    }
  }
}
</style>