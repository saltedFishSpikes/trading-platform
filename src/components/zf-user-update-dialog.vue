<template>
  <el-dialog
    :visible.sync="showDialog"
    @close="closeDialog"
    @opened="openedDialog"
    :title="type == 1?'修改用户头像':'修改密码'"
    width="420px"
    custom-class="zf-user-update-dialog"
  >
    <el-form :model="userInfo" label-width="120px" ref="userInfo" :rules="rules">
      <el-form-item prop="userImg" label-width="0" style="text-align:center;" v-if="type == 1">
        <el-upload
          class="avatar-uploader"
          action
          :show-file-list="false"
          :http-request="upload"
          :before-upload="beforeUpload"
        >
          <img v-if="userInfo.userImg" :src="userInfo.userImg" class="avatar" />
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>
      <template v-else>
        <el-form-item prop="oldPassword" label="旧密码">
          <el-input v-model.trim="userInfo.oldPassword" size="small" type="password" placeholder="请输入旧密码"></el-input>
        </el-form-item>
        <el-form-item prop="password" label="新密码">
          <el-input v-model.trim="userInfo.password" size="small" type="password" placeholder="请输入6~16个字符的密码"></el-input>
        </el-form-item>
        <el-form-item prop="confirmPs" label="二次确认密码">
          <el-input v-model.trim="userInfo.confirmPs" size="small" type="password" placeholder="请二次输入密码"></el-input>
        </el-form-item>
      </template>
      <el-form-item label-width="0" style="text-align:center;">
        <el-button type="primary" @click="submit" :disabled="disableBtn">确定</el-button>
        <el-button @click="closeDialog" :disabled="disableBtn">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script>
export default {
  name: "ZfUserUpdateDialog",
  props: {
    show: {
      type: Boolean,
      default: false
    },
    userDetail: {
      type: Object,
      default: () => {
        return {};
      }
    },
    type: {
      type :Number,
      default: 1
    }
  },
  data() {
    var checkPS = (rule,value,callback)=>{
      if(value && /^\w{6,16}$/.test(value)){
        callback()
      }else{
        callback(new Error("请输入6-16位由字母、数字、下划线组成的密码"))
      }
    }
    var confirmRules = (rule, value, callback) => {
      if (value == "") {
        callback(new Error("请再次输入密码"));
      } else if (value != this.userInfo.password) {
        callback(new Error("两次输入密码不一致"));
      } else {
        callback();
      }
    };
    return {
      showDialog: false,
      userInfo: {
        userImg: "",
        password:'',
        confirmPs:'',
        oldPassword:''
      },
      disableBtn: false,
      rules: {
        oldPassword:[
          { required: true, message: "请输入旧密码", trigger: "blur" },
          { min: 6, max: 16, message: "请输入6~16个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { validator:checkPS, trigger: "blur" }
        ],
        confirmPs: [
          { required: true, message: "请输入确认密码", trigger: "blur" },
          { validator: confirmRules, trigger: "blur" }
        ]
      }
    };
  },
  watch: {
    show(val) {
      this.showDialog = val;
    }
  },
  methods: {
    /**
     * @function 打开弹窗
     */
    openedDialog() {
      let t = JSON.parse(JSON.stringify(this.userDetail));
      this.userInfo.userImg = t.userImg
    },
    /**
     * @function 关闭弹窗
     */
    closeDialog() {
      this.$emit("closeDialog");
      this.userInfo = {
        userImg: "",
        password:'',
        confirmPs:'',
        oldPassword:''
      }
      this.$refs["userInfo"].clearValidate();
    },
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
        this.userInfo.userImg = res;
      });
    },
    /**
     * @function 提交
     */
    submit() {
      this.$refs.userInfo.validate(valid => {
        if (valid) {
          let data = {};
          if(this.type == 1){
            data['userImg'] = this.userInfo.userImg
          }else if(this.type == 2){
            data['oldPassword'] = this.userInfo.oldPassword
            data['password'] = this.userInfo.password
          }
          this.disableBtn = true;
          this.$network
            .request({
              url: this.$network.api.updateUser,
              data: data,
              isLoading: true,
              target: ".zf-user-update-dialog"
            })
            .then(res => {
              
              if(this.type == 2){
                this.$message({
                  type: "success",
                  message: "修改成功，请重新登录",
                  duration: 1000
                });
                this.closeDialog();
                this.$router.push({ name: "login" });
                window.localStorage.removeItem("token");
                this.$store.commit("setUserImg", "");
                this.$store.commit("setUserId", "");
                this.$store.commit("setUserType", 1);
                this.$store.commit("setUserName", "");
                if(this.$websocket.ws){
                  this.$websocket.ws.close();
                }
              }else{
                this.$message({
                  type: "success",
                  message: res.data,
                  duration: 1000
                });
                this.closeDialog();
                this.$emit("getUserDetail");
              }
              
            })
            .catch((err)=>{})
            .finally(() => {
              this.disableBtn = false;
            });
        }else {
          return false
        }
      });
    }
  }
};
</script>