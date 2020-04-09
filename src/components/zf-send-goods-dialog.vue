<template>
  <el-dialog :visible.sync="showDialog" title="发送二手品" @close="closeDialog" width="400px">
    <el-form label-width="100px">
      <el-form-item label="二手品名称">
        <el-select v-model="selectedGoods" filterable remote :remote-method="getGoods">
          <el-option v-for="item in allGoods" :key="item.goodsId" :value="item.goodsId" :label="item.goodsName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :disabled="!selectedGoods" @click="send">发送</el-button>
        <el-button @click="closeDialog">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script>
export default {
  name:"ZfSendGoodsDialog",
  props:{
    show:{
      type:Boolean,
      default:false
    },
    from:{
      type:Object,
      default:()=>{
        return {}
      }
    },
    to:{
      type:Object,
      default:()=>{
        return {}
      }
    },
    postId:{
      type:Number,
      default:null
    }
  },
  data(){
    return {
      showDialog:false,
      selectedGoods:null,
      allGoods:[]
    }
  },
  watch:{
    show(val){
      this.showDialog = val
    }
  },
  methods:{
    /**
     * @function 关闭弹窗
     */
    closeDialog(){
      this.$emit('closeDialog')
      this.selectedGoods = null
    },
    /**
     * @function 查询商品
     * @param {String} 搜索框内容
     */
    getGoods(value){
      this.$network.request({
        url:this.$network.api.searchGoods,
        data:{
          goodsName:value
        }
      }).then(res=>{
        this.allGoods = res.data
      }).catch(err=>{})
    },
    /**
     * @function 发送
     */
    send(){
      let select = this.allGoods.find(item=>{
        return item.goodsId == this.selectedGoods
      })
      if(!select){
        this.$message({
          message:"请选择有效的二手品",
          type:"warning"
        })
        this.selectedGoods = null
        return
      }
      if(this.postId != null){
        //发帖
        this.$network
          .request({
            url: this.$network.api.reply,
            data: {
              postId: this.postId,
              content: JSON.stringify({data:select,type:2})
            },
            isLoading: true,
            target: ".zf-send-goods-dialog"
          })
          .then(res => {
            this.$message({
              message: "发送成功",
              duration: 1000,
              type: "success"
            });
            this.closeDialog()
            this.$emit("getReply")
          }).catch(err=>{});
        
      }else{
        // 聊天
        let data = {
          msg: JSON.stringify({data:select,type:2}),
          from: this.from.userId,
          to: this.to.userId,
          fromName: this.from.userName,
          toName: this.to.userName
        };
        this.closeDialog();
        this.$websocket.ws.send(JSON.stringify(data));
      }
      
    }
  }
}
</script>