import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import axios from 'axios'
import 'element-ui/lib/theme-chalk/index.css';
import '@/assets/css/reset.css';
import network from './util/network.js'
import common from '@/assets/js/common.js'
import websocket from '@/assets/js/websocket.js'
Vue.config.productionTip = false
Vue.prototype.$network = network
Vue.prototype.$common = common
Vue.prototype.$websocket = websocket
axios.defaults.baseURL = "/api/"
Vue.use(ElementUI);
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
