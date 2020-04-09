<template>
  <div class="login">
    <el-tabs v-model="mode" type="border-card" @tab-click="changeTab" stretch>
      <el-tab-pane name="0" label="登录">
        <el-form :model="loginForm" label-width="80px" :rules="loginRules" ref="loginForm">
          <el-form-item label="用户名" prop="userName">
            <el-input v-model.trim="loginForm.userName" placeholder="请输入用户名" size="small"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model.trim="loginForm.password" placeholder="请输入密码" size="small" type="password"></el-input>
          </el-form-item>
          <el-form-item label label-width="0" style="text-align:center">
            <el-button type="primary" @click="login" :disabled="disableBtn">登录</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane name="1" label="注册">
        <el-form :model="registerForm" label-width="80px" :rules="registerRules" ref="registerForm">
          <el-form-item label="用户名" prop="userName">
            <el-input v-model.trim="registerForm.userName" size="small" placeholder="请输入用户名"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model.trim="registerForm.password"
              size="small"
              placeholder="请输入密码"
              type="password"
            ></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="confirm">
            <el-input v-model.trim="registerForm.confirm" size placeholder="请二次输入密码" type="password"></el-input>
          </el-form-item>
          <el-form-item label="收货地址" prop="address">
            <el-input v-model="registerForm.address" size="small" type="textarea" placeholder="请输入收货地址"></el-input>
          </el-form-item>
          <el-form-item label label-width="0" style="text-align:center">
            <el-button type="primary" @click="register" :disabled="disableBtn">注册</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
export default {
  name: "login",
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
      } else if (value != this.registerForm.password) {
        callback(new Error("两次输入密码不一致"));
      } else {
        callback();
      }
    };
    var checkName = (rule,value,callback)=>{
      if(!this.$common.checkString(value)){
        callback(new Error("请输入正常用户名"))
      }else{
        callback()
      }
    }
    return {
      mode: "0", //0登录1注册
      disableBtn: false,
      loginForm: {
        userName: null,
        password: null
      },
      loginRules: {
        userName: [
          { required: true, message: "请输入用户名称", trigger: "blur" },
          { min: 2, max: 10, message: "请输入2~10个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { validator:checkPS, trigger: "blur" }
        ]
      },
      registerForm: {
        userName: null,
        password: null,
        confirm: null,
        address: null
      },
      registerRules: {
        userName: [
          { required: true, message: "请输入用户名称", trigger: "blur" },
          { min: 2, max: 8, message: "请输入2~10个字符", trigger: "blur" },
          { validator: checkName, trigger: "blur"}
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { validator:checkPS, trigger: "blur" }
        ],
        confirm: [
          { required: true, message: "请输入确认密码", trigger: "blur" },
          { validator: confirmRules, trigger: "blur" }
        ],
        address: [
          { required: true, message: "请输入收货地址", trigger: "blur" },
          {
            min: 1,
            max: 50,
            message: "请输入长度为50个字符以内的地址",
            trigger: "blur"
          }
        ]
      }
    };
  },
  methods: {
    /**
     * @function 切换分页
     * @param {Object} tab 标签页对象
     */
    changeTab(tab) {
      this.mode = tab.name;
      this.$refs.loginForm.resetFields();
      this.$refs.registerForm.resetFields();
    },
    /**
     * @function 登录
     */
    login() {
      this.disableBtn = true;
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.$network
            .request({
              url: this.$network.api.login,
              data: this.loginForm,
              isLoading: true,
              target: ".login"
            })
            .then(res => {
              this.disableBtn = false;
              this.$message({
                message: res.data,
                duration: 1000,
                type: "success"
              });
              this.$router.push({ name: "home" });
            })
            .catch(err => {
              this.disableBtn = false;
            });
        } else {
          this.disableBtn = false;
          return false;
        }
      });
    },
    /**
     * @function 注册
     */
    register() {
      this.disableBtn = true;
      this.$refs.registerForm.validate(valid => {
        if (valid) {
          let data = {
            ...this.registerForm
          };
          delete data.confirm;
          this.$network
            .request({
              url: this.$network.api.register,
              data: data,
              isLoading: true,
              target: ".login"
            })
            .then(res => {
              this.disableBtn = false;
              this.$message({
                message: res.data,
                type: "success",
                duration: 1000
              });
              this.changeTab({ name: "0" });
            })
            .catch(err => {
              this.disableBtn = false;
            });
        } else {
          this.disableBtn = false;
          return false;
        }
      });
    }
  }
};
</script>
<style lang="scss">
.login {
  width: 400px;
  margin: auto;
  margin-top: 18vh;
  border-radius: 4px;
  font-size: 0;
  .el-tabs {
    width: 100%;
    text-align: center;
    .el-form {
      text-align: center;
    }
  }
}
</style>