export default {
  state: {
    tab: '1'
  },
  getters: {
    getManageTab: state => state.tab
  },
  mutations: {
    setManageTab(state, tab) {
      state.tab = tab
    }
  }
}