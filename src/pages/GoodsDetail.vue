<template>
  <div class="goods-detail">
    <div class="info">
      <div class="detail-imgs">
        <div class="big-img">
          <img :src="bigUrl" />
        </div>
        <div class="small-imgs">
          <img v-for="item in goodsDetail.goodsImg" :key="item.id" :src="item.url" @mouseenter="changeImg(item.url)" />
        </div>
      </div>
      <table class="detail-table" cellpadding="0" cellspacing="0">
        <tr>
          <td>二手品名称</td>
          <td>{{goodsDetail.goodsName}}</td>
        </tr>
        <tr>
          <td>二手品类别</td>
          <td>{{goodsDetail.type}}</td>
        </tr>
        <tr>
          <td>二手品状态</td>
          <td>{{allGoodsStatus[goodsDetail.goodsStatus-1]}}</td>
        </tr>
        <tr>
          <td>{{goodsDetail.goodsStatus == 4? '成交价':'预估价'}}</td>
          <td>￥{{goodsDetail.goodsPrice}}</td>
        </tr>
        <tr>
          <td>卖家名称</td>
          <td>
            <span v-if="goodsDetail.sellerId == userId || userType == 3">{{goodsDetail.sellerName}}</span>
            <el-button v-else type="text" @click="gotoUser">{{goodsDetail.sellerName}}</el-button>
          </td>
        </tr>
        <tr>
          <td>二手品简介</td>
          <td>{{goodsDetail.goodsDesc || '无'}}</td>
        </tr>
        <template v-if="goodsDetail.goodsStatus == 4">
          <tr>
            <td>买家名称</td>
            <td>{{goodsDetail.buyer}}</td>
          </tr>
          <tr>
            <td>交易单号</td>
            <td>{{goodsDetail.tradeId}}</td>
          </tr>
        </template>
      </table>
    </div>
    <div class="back-btn">
      <template v-if="userType == 1 && goodsDetail.sellerId != userId && goodsDetail.goodsStatus == 3 && userId">
        <el-button type="primary" @click="buy(goodsDetail.goodsId)">购买</el-button>
        <el-button type="primary" @click="connect(goodsDetail.sellerId)">联系卖家</el-button>
        <el-button type="primary" @click="addShoppingCar(goodsDetail.goodsId)">加入购物车</el-button>
      </template>
      <el-button @click="$router.go(-1)">返回</el-button>
    </div>
  </div>
</template>
<script>
import typeArr from "@/assets/json/goodsType.json";
export default {
  name: "GoodsDetail",
  data() {
    return {
      allType: [],
      goodsDetail: {},
      bigUrl:'',
      allGoodsStatus: ["待审核","审核未通过", "未出售", "已出售", "已下架","强制下架"]
    };
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
  mounted(){
    this.allType = JSON.parse(JSON.stringify(typeArr.typeArr));
    let goodsId = this.$route.query.goodsId
    this.getGoodsDetail(goodsId)
  },
  methods: {
    /**
     * @function 获取二手品信息
     * @param {Number} goodsId 二手品id
     */
    getGoodsDetail(goodsId){
      this.$network.request({
        url:this.$network.api.goodsDetail,
        data:{
          goodsId:goodsId
        },
        isLoading:true
      }).then(res=>{
        let type = this.allType.find(item=>{
          return item.typeId == res.data.goodsType
        })
        res.data.type = type.typeName
        this.goodsDetail = res.data
        this.bigUrl = this.goodsDetail.goodsImg[0].url
      }).catch(err=>{})
    },
    /**
     * @function 查看卖家
     */
    gotoUser(){
      this.$router.push({name:'userPage',query:{userId:this.goodsDetail.sellerId}})
    },
    /**
     * @function 改变大图
     * @param {String} imgUrl 图片地址
     */
    changeImg(imgUrl){
      this.bigUrl = imgUrl;
    },
    /**
     * @function 加入购物车
     * @param {Number} goodsId 二手品id
     */
    addShoppingCar(goodsId){
      this.$network.request({
        url:this.$network.api.shoppingCarAdd,
        data:{
          goodsId:goodsId
        }
      }).then(res=>{
        this.$message({
          type:res.data.type?'success':'warning',
          message:res.data.data,
          duration:1000
        })
      }).catch(err=>{})
    },
    /**
     * @function 联系卖家
     * @param {String} sellerId 卖家id
     */
    connect(sellerId){
      this.$router.push({name:'chatRoom',query:{custormId:sellerId}})
    },
    /**
     * @function 购买
     * @param {Number} goodsId 二手品id
     */
    buy(goodsId){
      this.$confirm('确认购买该二手品?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }).then(() => {
          this.$network.request({
            url:this.$network.api.createTrade,
            data:{
              goodsId:goodsId
            },
            isLoading:true,
            target:'.goods-detail'
          }).then(res=>{
            this.$message({
              message:res.data,
              duration:1000,
              type:'success'
            })
            this.getGoodsDetail(this.$route.query.goodsId)
          }).catch(err=>{})
        }).catch(() => {});
    }
  }
};
</script>
<style lang="scss" scoped>
.goods-detail {
  .info {
    display: flex;
    justify-content: space-around;
    align-items: center;
    .detail-imgs {
      .big-img {
        width: 300px;
        height: 300px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      .small-imgs {
        margin-top: 20px;
        display: flex;
        justify-content: space-around;
        img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border: 2px solid #fff;
          &:hover {
            border-color: #000;
          }
        }
      }
    }
    .detail-table {
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
        }
        &:last-child {
          td {
            border-bottom: 0;
          }
        }
      }
    }
  }
  .back-btn {
    margin-top: 20px;
    text-align: center;
  }
}
</style>