<template>
  <el-dialog
    custom-class="zf-publish-dialog"
    width="500px"
    :title="!goodsId?'发布二手品':'编辑二手品'"
    :visible.sync="showDialog"
    @close="closeDialog"
    @opened="openDialog"
  >
    <el-form :model="formData" label-width="100px" :rules="rules" ref="formData">
      <el-form-item label="二手品名称" prop="goodsName">
        <el-input v-model="formData.goodsName" placeholder="请输入二手品名称" size="small"></el-input>
      </el-form-item>
      <el-form-item label="二手品价格" prop="goodsPrice" v-if="!goodsId">
        <el-input
          v-model.number="formData.goodsPrice"
          placeholder="请输入二手品价格"
          size="small"
        ></el-input>
      </el-form-item>
      <el-form-item label="二手品图片" prop="goodsImg" class="imgs">
        <div
          class="img-list"
          v-for="item in formData.goodsImg"
          :key="item.id"
          @mouseover="hover = item.id"
          @mouseout="hover = -1"
        >
          <img :src="item.url" />
          <div class="cover" v-show="hover == item.id" @click="removeImg">
            <i class="el-icon-delete"></i>
          </div>
        </div>
        <el-upload
          v-show="formData.goodsImg.length < 3"
          class="avatar-uploader"
          action
          :show-file-list="false"
          :http-request="upload"
          :before-upload="beforeUpload"
        >
          <i class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>
      <el-form-item label="二手品类别" prop="goodsType">
        <el-select v-model="formData.goodsType" placeholder="请选择二手品分类" size="small">
          <el-option
            v-for="item in allType"
            :key="item.typeId"
            :label="item.typeName"
            :value="item.typeId"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="二手品介绍" prop="goodsDesc">
        <el-input
          type="textarea"
          :rows="4"
          v-model="formData.goodsDesc"
          placeholder="请输入二手品叙述"
          maxlength="200"
          show-word-limit
        ></el-input>
      </el-form-item>
      <el-form-item label-width="0" style="text-align:center;">
        <el-button type="primary" size="small" @click="submit">提交审核</el-button>
        <el-button @click="closeDialog" size="small">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script>
import typeArr from "@/assets/json/goodsType.json";
export default {
  name: "GoodsPublish",
  props: {
    goodsId: {
      type: Number,
      default: null
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    var checkName = (rule,value,callback)=>{
      if(!this.$common.checkString(value)){
        callback(new Error("请输入正常的物品名称"))
      }else{
        callback()
      }
    }
    var checkDesc = (rule,value,callback)=>{
      if(!this.$common.checkString(value)){
        callback(new Error("请勿输入疑似手机号、qq号、微信号的信息"))
      }else{
        callback()
      }
    }
    return {
      rules: {
        goodsName: [
          { required: true, message: "请输入二手品名称", trigger: "blur" },
          { max: 20,message:"请输入20个字符以内的名称",trigger:"blur"},
          { validator: checkName,trigger:"blur" }
        ],
        goodsPrice: [
          { required: true, message: "请输入二手品价格", trigger: "blur" },
          { min:0,max:9999, type: "number", message: "请输入0~9999的数字", trigger: "blur" }
        ],
        goodsImg: [
          {
            required: true,
            message: "请上传二手品图片，最多三张",
            trigger: "change"
          }
        ],
        goodsType: [
          { required: true, message: "请选择二手品分类", trigger: "change" }
        ],
        goodsDesc: [
          { validator: checkDesc,trigger:"blur" }
        ]
      },
      formData: {
        goodsName: null,
        goodsPrice: null,
        goodsImg: [],
        goodsType: null,
        goodsDesc: null
      },
      showDialog: false,
      allType: [],
      hover: -1 //鼠标悬浮图片下标
    };
  },
  watch: {
    show(val) {
      this.showDialog = val;
    }
  },
  methods: {
    /**
     * @function 上传之前
     * @param {Object} file 文件
     */
    beforeUpload(file) {
      return this.$network.beforeUpload(file);
    },
    /**
     * @function 上传
     * @param {Object} file 文件
     */
    upload(file) {
      this.$network.upload(file).then(res => {
        let id = 0
        if(this.formData.goodsImg.length > 0){
          id = this.formData.goodsImg[this.formData.goodsImg.length-1].id+1
        }
        this.formData.goodsImg.push({id:id,url:res});
      });
    },
    /**
     * @function 移除图片
     */
    removeImg() {
      this.formData.goodsImg.splice(this.hover, 1);
    },
    /**
     * @function 弹窗打开时调用
     */
    openDialog() {
      this.allType = JSON.parse(JSON.stringify(typeArr.typeArr));
      this.getGoodsDetail();
    },
    /**
     * @function 获取二手品详情
     */
    getGoodsDetail() {
      if (!this.goodsId) {
        return;
      } else {
        this.$network
          .request({
            url: this.$network.api.goodsDetail,
            data: {
              goodsId: this.goodsId
            },
            isLoading: true,
            target:'zf-publish-dialog'
          })
          .then(res => {
            this.formData = res.data;
          });
      }
    },
    /**
     * @function 关闭弹窗
     */
    closeDialog() {
      this.$emit("closeDialog");
      this.$refs.formData.resetFields();
    },
    /**
     * @function 提交
     */
    submit() {
      this.$refs.formData.validate(valid => {
        if (valid) {
          let data = {
            ...this.formData,
            goodsId: this.goodsId
          };
          let url = this.goodsId
            ? this.$network.api.goodsUpdate
            : this.$network.api.goodsPublish;
          let temp = []
          this.formData.goodsImg.forEach(item=>{
            temp.push(item.url)
          })
          data.goodsImg = temp.join(',')
          this.$network
            .request({
              url: url,
              data: data,
              isLoading: true,
              target:'.zf-publish-dialog'
            })
            .then(res => {
              this.$message({
                message: res.data,
                type: "success",
                duration: 1000
              });
              this.closeDialog();
              this.$emit("getGoodsTable");
            });
        } else {
          return false;
        }
      });
    }
  }
};
</script>
<style lang="scss" scope>
.zf-publish-dialog {
  .imgs > .el-form-item__content {
    display: flex;
    .img-list {
      margin-right: 10px;
      border: 1px dashed #d9d9d9;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      border-radius: 6px;
      width: 100px;
      height: 100px;
      position: relative;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .cover {
        text-align: center;
        line-height: 100px;
        background: #3031338f;
        position: absolute;
        top: 0;
        color: #ddd;
        width: 100px;
        height: 100px;
      }
    }
  }
}
</style>