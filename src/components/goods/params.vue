<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert show-icon :closable="false" title="注意：只允许为第三级分类设置相关参数!" type="warning"></el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col :span="14">
          <span>选择商品分类：</span>
          <!-- 级联选择框 -->
          <!-- <el-cascader
            v-model="selectedCatekeys"
            :options="cateList"
            :props="{ expandTrigger: 'hover',checkStrictly: 'true',label: cateProps.label,value: cateProps.value,children: cateProps.children }"
            @change="CateChange"
            clearable
          >-->
          <!-- 不知道为什么用新的更不舒服 -->
          <el-cascader
            v-model="selectedCatekeys"
            :options="cateList"
            :props="cateProps"
            @change="CateChange"
            expand-trigger="hover"
          >
            <!-- v-model="selectedkeys"可以帮选定的id值双向绑定到对应的数组中 -->
          </el-cascader>
        </el-col>
      </el-row>

      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" borrder stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag
                  closable
                  :key="index"
                  v-for="(item,index) in scope.row.attr_vals"
                  @close="handlClose(index,scope.row)"
                >{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删改</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" borrder stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag
                  closable
                  :key="index"
                  v-for="(item,index) in scope.row.attr_vals"
                  @close="handlClose(index,scope.row)"
                >{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删改</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 动态参数/属性对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogVisibleClosed"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数/属性对话框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogVisibleClosed"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 所有的商品分类列表
      cateList: [],
      // 级联选择框的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定到的数组
      selectedCatekeys: [],
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],
      // 添加对话框的显示与隐藏
      addDialogVisible: false,
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [{
          required: true,
          message: '请输入动态参数',
          trigger: 'blur'
        }]
      },
      // 控制修改对话框的展示与隐藏
      editDialogVisible: false,
      // 修改的表单对象
      editForm: {},
      // 修改表单的验证规则对象
      editFormRules: {
        attr_name: [{
          required: true,
          message: '请输入动态参数',
          trigger: 'blur'
        }]
      }
    }
  },
  created () {
    // 获取所有的商品分类列表
    this.getCateList()
  },
  methods: {
    // 获取所有的商品分类列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败！')
      }
      this.cateList = res.data
    },
    // 级联选择框选项中项变化，会触发这个函数
    CateChange () {
      this.getParamsData()
    },
    // tab页签点击时间的处理函数
    handleTabClick () {
      console.log(this.activeName)
      this.getParamsData()
    },
    // 获取参数的列表数据
    async getParamsData () {
      // 证明选中的不是三级分类
      if (this.selectedCatekeys.length !== 3) {
        this.selectedCatekeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return false
      }
      // 证明选中的是三级分类
      //   console.log(this.selectedCatekeys)
      // 根据所选分类的id个当前所处的面板，获取对应的参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: this.activeName }
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取参数列表失败！')
      }

      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 添加参数
    async addParams () {
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid, this.addForm.attr_name, this.activeName)
        if (!valid) return false
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          this.$message.error('添加参数失败！')
        }
        this.getParamsData()
        this.addDialogVisible = false
      })
    },
    // 监听添加对话框的关闭事件
    addDialogVisibleClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮展示修改对话框
    async showEditDialog (attrid) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/` + attrid, {
        attr_sel: this.activeName
      })
      if (res.meta.status !== 200) {
        return this.$message.error('查询参数失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 重置修改的表单
    editDialogVisibleClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 修改参数
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/` + this.editForm.attr_id, {
          attr_sel: this.activeName,
          attr_name: this.editForm.attr_name
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新参数失败!')
        }
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    // 删除参数
    async removeParams (attrid) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/` + attrid)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败！')
      }
      this.getParamsData()
      this.$message.success('删除参数成功!')
    },
    // 文本框失去焦点，或摁下了enter 都会触发
    handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return false
      }
      // 如果没有 return 则证明输入的内容需要做后续的处理
      row.attr_vals.push(row.inputValue.trim())

      // 需要发起请求，保存这次操作到数据库中
      this.savAttrVals(row)
    },
    // 将对 attr_vals 的操作 保存到数据库中
    async savAttrVals (row) {
      // 发起请求，保存这次操作
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/` + row.attr_id, {
        // `categories/${this.cateId}/attributes/${row.attr_id}`两种提交地址的写法
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(' ') // 有什么作用？
      })
      row.inputValue = ''
      row.inputVisible = false
      console.log(res)
    },
    // 点击按钮，展示文本输入框
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick 方法作用，就是当页面上元素被 重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应的参数可选项
    handlClose (index, row) {
      row.attr_vals.splice(index, 1)
      this.savAttrVals(row)
    }
  },
  computed: {
    // computed用于处理数据得到返回值
    // 如果按钮需要被禁用，则返回true 否则返回false
    isBtnDisabled () {
      if (this.selectedCatekeys.length !== 3) {
        return true
      }
      return false
    },
    cateId () {
      if (this.selectedCatekeys.length === 3) {
        return this.selectedCatekeys[2]
      }
      return null
    },
    // 动态计算标题的文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>
<style lang="less" scoped>
.cat_opt {
  margin-top: 15px;
}
.el-tab-pane {
  text-align: left;
}
.el-tag {
  margin-right: 15px;
  margin-top: 15px;
}
.input-new-tag {
  width: 120px;
}
</style>
