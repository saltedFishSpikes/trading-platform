<template>
  <div class="manage-index">
    <el-tabs v-model="tab" type="card" @tab-click="changeTab">
      <el-tab-pane label="用户管理" name="1"></el-tab-pane>
      <el-tab-pane label="二手品管理" name="2"></el-tab-pane>
      <el-tab-pane label="交易管理" name="3"></el-tab-pane>
    </el-tabs>
    <router-view/>
  </div>
</template>
<script>
export default {
  name:'ManageIndex',
  data(){
    return {}
  },
  computed:{
    tab:{
      get(){
        return this.$store.getters.getManageTab
      },
      set(){}
    }
  },
  methods:{
    /**
     * @function 切换标签页
     * @param {Number} tab 标签页
     */
    changeTab(tab){
      this.$store.commit('setManageTab',tab.name);
      switch(tab.name) {
        case '1':
          this.$router.push({name:"userManage"})
          break
        case '2':
          this.$router.push({name:"goodsManage"})
          break
        case '3':
          this.$router.push({name:"tradeManage"})
          break
      }
    }
  },
  beforeRouteEnter(to,from,next){
    next(vm=>{
      vm.$store.commit('setSideBar',5)
    })
  }
}
</script>