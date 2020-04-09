import Vue from 'vue'
import VueRouter from 'vue-router'


const routerPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(error=> error)
}

Vue.use(VueRouter)
const routes = [
  {
    path: '/login',
    name: 'login',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../pages/Login.vue')
  },
  {
    path: '/',
    component: () => import('@/pages/Index.vue'),
    children: [
      {
        path:'',
        redirect:'home'
      },
      {
        path: 'home',
        name: 'home',
        component: () => import('@/pages/Home.vue')
      },
      {
        path: 'goodsDetail',
        name: 'goodsDetail',
        component: () => import('@/pages/GoodsDetail.vue')
      },
      {
        path: 'userPage',
        name: 'userPage',
        component: () => import('@/pages/UserPage.vue')
      },
      {
        path: 'shoppingCar',
        name: 'shoppingCar',
        component: () => import('@/pages/ShoppingCar.vue')
      },
      {
        path: 'tradeBBS',
        name: 'tradeBBS',
        component: () => import('@/pages/TradeBBS.vue'),
      },
      {
        path: 'tradeBBS/tradeBBSDetail',
        name: 'tradeBBSDetail',
        component: () => import('@/pages/TradeBBSDetail.vue')
      },
      {
        path: 'chatRoom',
        name: 'chatRoom',
        component: () => import('@/pages/ChatRoom.vue')
      },
      {
        path: 'manage',
        component: () => import('@/pages/ManageIndex.vue'),
        children: [
          {
            path: '',
            redirect: 'userManage'
          },
          {
            path: 'userManage',
            name: 'userManage',
            component: () => import('@/pages/management/UserManage.vue')
          },
          {
            path: 'goodsManage',
            name: 'goodsManage',
            component: () => import('@/pages/management/GoodsManage.vue')
          },
          {
            path: 'tradeManage',
            name: 'tradeManage',
            component: () => import('@/pages/management/TradeManage.vue')
          }
        ]
      }
    ],
    beforeEnter:(to,from,next)=>{
      let token = window.localStorage.getItem("token")
      if(!token){
        next()
        return
      }else{
        let type = JSON.parse(atob(token.split('.')[1])).type
        if(type == 3 && to.path.indexOf('manage')<0 && to.path.indexOf('goodsDetail')<0){
          next('/manage')
        }else{
          next()
        }
      }
    }
  }
]

const router = new VueRouter({
  mode: 'hash',
  /* history模式下需配置服务器，
  否则子路由页面刷新会因为404报错
  Uncaught SyntaxError: Unexpected token '<' */
  base: process.env.BASE_URL,
  routes
})

export default router
