<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 登入头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt />
      </div>
      <!-- 登入表单区域 -->
      <el-form
        ref="loginFormRef"
        :model="loginform"
        :rules="loginFormRules"
        label-width="80px"
        class="login_form"
      >
        <!-- loginFormRef就是表单的实例对象 -->
        <!-- 账号 -->
        <el-form-item label="账号：" prop="username">
          <el-input
            v-model="loginform.username"
            prefix-icon="iconfont icon-zhanghao"
            placeholder="请输入账号"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="密码：" prop="password">
          <el-input
            v-model="loginform.password"
            prefix-icon="iconfont icon-mima"
            show-password
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <el-button type="primary" @click="login">登录</el-button>
        <el-button type="info" @click="resetLoginForm">重置</el-button>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 这是登录表单的数据绑定对象
      loginform: {
        username: 'admin',
        password: '123456'
      },
      // 这是表单验证对象规则
      loginFormRules: {
        // 验证用户名是否合法
        username: [
          {
            required: true,
            message: '请输入账号',
            trigger: 'blur'
          },
          {
            min: 5,
            max: 10,
            message: '长度在5~10个字符串',
            trigger: 'blur'
          }
        ],
        // 验证密码是否合法
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 16,
            message: '长度在6~16个字符串',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    // 点击重置按钮，重置登录表单
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      // 获取表单的引用对象this.$refs.loginFormRef
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return false // 判断表单的预校验是否通过 true通过执行访问数据库
        const { data: res } = await this.$http.post('login', this.loginform)
        // 这里data重命名为res
        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('登录失败')
        } else {
          this.$message.success('登录成功')
        }
        // 1.将登录成功之后的 token保存到客户端的 sessionStorage中
        //  1.1项目中除了登录之外的其他API接口 必须在登录之后才能访问
        //  1.2token只应在当前网站打开期间生效，所以将token保存在seesionstroage中
        console.log(res) // 把返回的数据res的token保存到session storage
        window.sessionStorage.setItem('token', res.data.token)
        // 2.通过编程式导航跳转到后台主页，路由地址是/home
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #ffffff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  //   margin-left: -225px;
  //   margin-top: -150px;第二种方式
  transform: translate(-50%, -50%);
}
.avatar_box {
  position: absolute; //相对于最近一级的父元素
  left: 50%;
  //   top: -50%;
  transform: translate(-50%, -50%); //这里的50%是对自身的avatar_box
  width: 130px;
  height: 130px;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #dddddd;
  background-color: #ffffff;
}
.avatar_box img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #eeeeee;
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}
</style>
