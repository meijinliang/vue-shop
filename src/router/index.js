import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/home.vue'
import Welcome from '../components/welcome.vue'
import Users from '../components/user/users.vue'
import Rights from '../components/power/rights.vue'
import Roles from '../components/power/roles.vue'
import Cate from '../components/goods/cate.vue'
import Params from '../components/goods/params.vue'
import goodList from '../components/goods/list.vue'
import addGoods from '../components/goods/add.vue'
import Order from '../components/order/order.vue'
import Report from '../components/report/report.vue'
Vue.use(VueRouter)

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}
// 用于解决重复点击导航栏显示路由重复的报错

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Cate },
        { path: '/params', component: Params },
        { path: '/goods', component: goodList },
        { path: '/goods/add', component: addGoods },
        { path: '/orders', component: Order },
        { path: '/reports', component: Report }
      ]
    }
  ]
})
// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to将要访问的路径
  // from 代表从哪一个路径跳转而来
  // next 是一个函数，表示放行
  //    next()  放行    next('/login')  强制跳转
  if (to.path === '/login') return next()
  // 获取token
  const tokenstr = window.sessionStorage.getItem('token')
  if (!tokenstr) return next('/login') // 如果token不存在直接强制跳转到登录页面
  next()
})

export default router
