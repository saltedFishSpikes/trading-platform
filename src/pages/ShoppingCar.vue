<template>
  <div class="shopping-car">
    <template v-if="userId">
      <el-button type="primary" @click="clearAll">清空购物车</el-button>
      <ul>
        <li
          v-for="item in goodsList"
          :key="item.goodsId"
          @mouseenter="mousevent(true,item.goodsId)"
          @mouseleave="mousevent(false,item.goodsId)"
        >
          <transition name="mouse">
            <div class="cover" v-show="goodsActive == item.goodsId">
              <div @click="gotoGoodsDetail(item.goodsId)">详情</div>
              <div @click="delGoods(item.goodsId)">删除</div>
            </div>
          </transition>
          <img :src="item.goodsImg" alt class="goods-img" />
          <div class="goods-info">
            <span>{{item.goodsName}}</span>
            <span>¥{{item.price}}</span>
          </div>
        </li>
      </ul>
    </template>
  </div>
</template>
<script>
export default {
  name: "ShoppingCar",
  data() {
    return {
      goodsList: [],
      goodsActive: -1
    };
  },
  computed: {
    userId: {
      get() {
        return this.$store.getters.getUserId;
      },
      set() {}
    }
  },
  mounted() {
    if (!this.userId) {
      this.$message({
        message: "请先登录",
        duration: 5000
      });
      return;
    }
    this.getShopingCar();
  },
  methods: {
    /**
     * @function 获取购物车数据
     */
    getShopingCar() {
      this.$network
        .request({
          url: this.$network.api.shoppingCarList,
          isLoading: true,
          target: ".shopping-car"
        })
        .then(res => {
          this.goodsList = res.data;
        });
    },
    /**
     * @function 鼠标事件
     * @param {Boolean} type true移入，false移出
     * @param {Number} goodsId 二手品id
     */
    mousevent(type, goodsId) {
      if (type) {
        this.goodsActive = goodsId;
      } else {
        this.goodsActive = -1;
      }
    },
    /**
     * @function 清空购物车
     */
    clearAll() {
      this.$confirm("确定清空购物车?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$network
          .request({
            url: this.$network.api.shoppingCarClear,
            isLoading: true,
            target: ".shopping-car"
          })
          .then(res => {
            this.$message({
              type: "success",
              message: res.data,
              duration: 1000
            });
            this.getShopingCar();
          });
      });
    },
    /**
     * @function 删除购物车中的二手品
     * @param {Number} goodsId 二手品id
     */
    delGoods(goodsId) {
      this.$network
        .request({
          url: this.$network.api.shoppingCarDelete,
          data: {
            goodsId: goodsId
          },
          isLoading: true,
          target: ".shopping-car"
        })
        .then(res => {
          this.$message({
            type: "success",
            message: res.data,
            duration: 1000
          });
          this.getShopingCar();
        });
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
      vm.$store.commit("setSideBar", 2);
    });
  }
};
</script>
<style lang="scss" scoped>
.shopping-car {
  .mouse-enter-active,
  .mouse-leave-active {
    transition: opacity 0.5s;
  }
  .mouse-enter,
  .mouse-leave-to {
    opacity: 0;
  }
  ul {
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;
    li {
      position: relative;
      margin: 10px;
      width: 150px;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
      .cover {
        background-color: #00000055;
        position: absolute;
        width: 100%;
        height: 100%;
        color: rgba(248, 234, 234, 0.87);
        div {
          height: 50%;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          &:hover {
            background-color: #00000099;
          }
        }
      }
      .goods-img {
        width: 150px;
        height: 150px;
        object-fit: cover;
      }
      .goods-info {
        margin: 5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        span {
          &:first-child {
            font-size: 16px;
            font-weight: 600;
          }
        }
      }
    }
  }
}
</style>