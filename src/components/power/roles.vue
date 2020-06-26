<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加角色按钮区 -->
      <el-row>
        <el-col :span="2">
          <el-button type="primary" @click="addRoleDialogdialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区 -->
      <el-table :data="roelList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- <pre>{{scope.row.children}}</pre> -->
            <el-row
              :class="['bdbottom',index1 === 0?'bdtop':'','vcenter']"
              :key="item1.id"
              v-for="(item1,index1) in scope.row.children"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id) ">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环 嵌套渲染二级权限 -->
                <el-row
                  :class="[index2 === 0?'':'bdtop','vcenter']"
                  :key="item2.id"
                  v-for="(item2,index2) in item1.children"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id) "
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      :class="[index3 === 0?'':'bdtop']"
                      :key="item3.id"
                      v-for="(item3,index3) in item2.children"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row,item3.id) "
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editRoleDialogdialogVisible = true"
            >编辑</el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >角色配置</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogdialogVisible"
      width="50%"
      @close="addRoleDialogdialogClosed"
    >
      <el-form
        :model="addRoleForm"
        :rules="addRoleFormRules"
        ref="addRoleFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <!-- prop是验证规则的属性 -->
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色的对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editRoleDialogdialogVisible"
      width="50%"
      @close="editRoleDialogdialogClosed"
    >
      <el-form
        :model="editRoleForm"
        :rules="editRoleFormRules"
        ref="editRoleFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <!-- prop是验证规则的属性 -->
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogdialogVisible"
      width="50%"
      @close="setRightDialogdialogClosed"
    >
      <!-- 树形控件  -->
      <el-tree
        :data="rightList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defkeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 所有角色列表
      roelList: [],
      // 控制添加角色对话框的显示与隐藏
      //   addDialogVisible: false
      // 控制分配权限对话框的显示与隐藏
      // 权限列表
      rightList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        children: 'children',
        label: 'authName'

      },
      // 默认选中的节点id值
      defkeys: [],
      // 控制展示分配权限对话框的显示与隐藏
      setRightDialogdialogVisible: false,
      // 当前即将分配权限的id
      roleId: [],
      // 控制添加角色的显示与隐藏
      addRoleDialogdialogVisible: false,
      // 添加角色的表单数据
      addRoleForm: {
        roleName: '',
        // 角色描述
        roleDesc: ''
      },
      addRoleFormRules: {
        roleName: [{
          required: true,
          message: '请输入角色',
          trigger: 'blur'
        }]
      },
      editRoleDialogdialogVisible: false,
      editRoleForm: {},
      editRoleFormRules: {
        roleName: [{
          required: true,
          message: '请输入角色',
          trigger: 'blur'
        }]
      }
    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    // 获取所有角色列表
    async getRoleList () {
      const { data: res } = await this.$http.get('/roles')
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色失败')
      }
      this.roelList = res.data
      // console.log(this.roelList)
    },

    // 根据id删除对应的权限
    async removeRightById (role, rightid) {
      // console.log(role, rightid)
      // 弹框提示用户是否要删除
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightid}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      // 重新获取角色列表数据
      // this.getRoleList()调用这个函数会重新渲染页面 出现小问题
      // 提示修改成功
      //   console.log(res)
      role.children = res.data
      this.$message.success('删除权限成功')
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }
      this.rightList = res.data
      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defkeys)
      // console.log(this.rightList)
      this.setRightDialogdialogVisible = true
    },

    // 通过递归的形式，获取角色下所有三级权限的id 并保存到defkeys数组中
    getLeafKeys (node, arr) {
      // 如果当前节点不包含children属性就说明是三级节点
      if (!node.children) {
        return arr.push(node.id)// 把node.id放到数组arr中
      }

      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框的关闭事件 关闭对话框重置内容
    setRightDialogdialogClosed () {
      this.defkeys = []
    },
    // 点击为角色分配权限
    async allotRight () {
      const keys = [
        // 获取到所有已选中的id数组
        ...this.$refs.treeRef.getCheckedKeys(),
        //
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // 扩展运算符...的作用是将this.$refs.treeRef.getCheckedKeys()这个数组拆分一个一个然后组成新的数组
      // console.log(keys)
      const idStr = keys.join(',')
      // 转换为以逗号分隔的字符串
      // console.log(idStr)
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.getRoleList()
      this.setRightDialogdialogVisible = false
      this.$message.success('分配成功')
    },
    // 监听添加角色框的关闭事件
    addRoleDialogdialogClosed () {
      this.$refs.addRoleFormRef.resetFields()
      this.addRoleForm.roleDesc = ''
    },
    // 添加角色
    addRole () {
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请输入角色名字')
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败！')
        }
        this.getRoleList()
        this.addRoleDialogdialogVisible = false
        this.$message.success('添加角色成功！')
      })
    },
    // 监听修改角色对话框的关闭事件
    editRoleDialogdialogClosed () {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 修改角色
    editRole () {

    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eeeeee;
}
.bdbottom {
  border-bottom: 1px solid #eeeeee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
