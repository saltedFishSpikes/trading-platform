<template>
  <div class="zf-goods-card" @click="gotoGoodsDetail">
    <img :src="goodsImg" class="goods-img">
    <div class="goods-name overflow">{{goodsName}}</div>
  </div>
</template>
<script>
export default {
  name:"ZfGoodsCard",
  props:{
    goodsId:{
      type:Number,
      default:null
    },
    goodsName:{
      type:String,
      default:""
    },
    goodsImg:{
      type:String,
      default:""
    }
  },
  methods:{
    /**
     * @function 前往商品详情
     */
    gotoGoodsDetail(){
      this.$router.push({name:'goodsDetail',query:{goodsId:this.goodsId}})
    }
  }
}
</script>
<style lang="scss" scoped>
.zf-goods-card {
  display: flex;
  align-items: center;
  padding: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .3), 0 0 6px rgba(0, 0, 0, .04);
  max-width: 200px;
  cursor: pointer;
  .goods-img {
    width: 100px;
    max-height: 100px;
    padding-right:5px;
    object-fit: contain;
    border-right: 2px solid #eee;
  }
  .goods-name {
    margin-left: 5px;
    font-size: 16px;
    font-weight: 600;
    max-width: 100px;
  }
}
</style>