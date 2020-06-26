import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/iconfont/iconfont.css'
import TreeTable from 'vue-table-with-tree-grid'

// 导入附文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require styles 导入附文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// c
axios.interceptors.request.use(confing => {
  // console.log(confing)
  confing.headers.Authorization = window.sessionStorage.getItem('token')
  return confing
})
Vue.prototype.$http = axios

Vue.use(ElementUI)
// 将附文本编辑器，注册为全局可用的组件
Vue.use(VueQuillEditor)
Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

// 全局定义格式化时间
Vue.filter('dataFormat', function (originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear() // 年
  const m = (dt.getMonth() + 1 + '').padStart(2, '0') // 月
  const d = (dt.getDate() + '').padStart(2, '0')

  // padStart(2, '0')字符串函数  第一个参数为总长度为2 ， 第二个参数为不足字符串用第二个参数来填充
  const hh = (dt.getHours() + '').padStart(2, '0')
  const ss = (dt.getMinutes() + '').padStart(2, '0')
  const mm = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}${ss}${mm}`
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
