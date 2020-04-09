import Vue from 'vue'
import Vuex from 'vuex'
import sideBar from './sideBar.js'
import manageTab from './manageTab.js'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  getters: {
  },
  mutations: {
    // 同步操作
  },
  actions: {
    // 异步操作
  },
  modules: {
    sideBar,
    manageTab
  }
})
