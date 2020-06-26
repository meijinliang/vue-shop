<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col :span="2">
          <el-button type="primary" @click="showAddCateDialogVisible">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        class="treeTab"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" style="color: lightred" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <!-- 编辑按钮 -->
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditCateDialog(scope.row.cat_id)"
          >编辑</el-button>
          <!-- 删除按钮 -->
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeCateById(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 级联选择器 -->
          <!-- options用来知道数据源 -->
          <!-- props用来指定配置对象 -->
          <!-- <el-cascader
            v-model="selectedkeys"
            :options="parentCateList"
            :props="cascaderProps"
            expand-trigger="hover"
            @change="parentCateChange"
            clearable
            change-on-select
          ></el-cascader>-->
          <el-cascader
            v-model="selectedkeys"
            :options="parentCateList"
            :props="{ expandTrigger: 'hover',checkStrictly: 'true',label: cascaderProps.label,value: cascaderProps.value,children: cascaderProps.children }"
            @change="parentCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类的对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDialogClosed"
    >
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        // 当前页码
        pagenum: 1,
        // 每页显示的数据条数
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      cateList: [],
      // 父级分类的数据列表
      parentCateList: [],
      // 总数居条数
      total: 0,
      // 每一个对象都是对列的定义
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      }, {
        label: '是否有效',
        // 表示将当前定义为模板列
        type: 'template',
        // 表示当前这一列使用模板名称
        template: 'isok'
      }, {
        label: '排序',
        type: 'template',
        template: 'order'
      }, {
        label: '排序',
        type: 'template',
        template: 'opt'
      }],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 控制修改分类对话框的显示与隐藏
      editCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类名称
        cat_name: '',
        // 父级分类的名称
        cat_pid: 0,
        // 分类的等级， 默认要添加的是1级分类
        cat_level: 0
      },
      // 添加表单的数据验证规则对象
      addCateFormRules: {
        cat_name: [{
          required: true,
          message: '请输入分类的名称',
          trigger: 'blur'
        }]
      },
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的id数组
      selectedkeys: [],
      // 查询表单分类信息对象
      editCateForm: {},
      // 修改表单的验证规则对象
      editCateFormRules: {
        cat_name: [{
          required: true,
          message: '请输入分类的名称',
          trigger: 'blur'
        }]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类的数据列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败!')
      }
      // 把数据列表赋值给 cateList
      this.cateList = res.data.result
      // 把数据的总条数赋值给total
      this.total = res.data.total
      // console.log(this.cateList)
      // console.log(res)
    },
    // 监听 pagesize 改变的事件
    handleSizeChange (newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 pagenum页码值 改变的事件
    handleCurrentChange (newpage) {
      // console.log(newpage)
      this.queryInfo.pagenum = newpage
      this.getCateList()
    },
    // 点击按钮， 展示添加分类对话框
    showAddCateDialogVisible () {
      // 先获取父级分类的数据
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      // console.log(res.data)
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类的数据列表失败！')
      }
      this.parentCateList = res.data
      // console.log(this.parentCateList)
    },
    // 级联选择器中选中项发生变化触发这个函数
    parentCateChange () {
      console.log(this.selectedkeys)
      // 如果selectedkeys 数组中的length大于0， 证明选中父级分类
      // 反之，则说明没有选中任何父级分类
      if (this.selectedkeys.length > 0) {
        // 父级分类的id 获取父级id 的值
        this.addCateForm.cat_pid = this.selectedkeys[this.selectedkeys.length - 1]
        // 当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedkeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮 添加分类
    addCate () {
      console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return false
        // 预校验通过发起请求
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听添加分类对话框的关闭事件
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedkeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 展示编辑分类的对话框
    async showEditCateDialog (id) {
      // console.log(id)
      const { data: res } = await this.$http.get('categories/' + id)
      // console.log(res)
      this.editCateForm = res.data
      this.editCateDialogVisible = true
    },
    editCateDialogClosed () {
      this.$refs.editCateFormRef.resetFields()
    },
    // 修改分类信息并提交
    editCateInfo () {
      // console.log(this.editCateForm)
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, {
          cat_name: this.editCateForm.cat_name
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改分类信息失败！')
        }
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },
    // 删除分类信息
    async removeCateById (id) {
      console.log(id)
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
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
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败！')
      }
      this.getCateList()
      this.$message.success('删除分类成功!')
    }
  }
}
</script>
<style lang="less" scoped>
.treeTab {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
