<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getgoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getgoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表区 -->
      <el-table :data="goodslist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="95px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="70px"></el-table-column>
        <el-table-column prop="add_time" label="创建名称" width="140px">
          <template slot-scope="scope">{{scope.row.add_time | dataFormat}}</template>
          <!-- scope.row.add_time | dataFormat怎么作用的？ -->
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit"></el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="removeGoods(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加商品的对话框 -->
    <!-- <el-dialog title="提示" :visible.sync="addgoodsListDialogVisible" width="50%">
      <el-form
        :model="addgoodsListForm"
        :rules="addgoodsListRules"
        ref="addgoodsListFormRef"
        label-width="100px"
      >
        <el-form-item label="活动名称" prop="goods_name">
          <el-input v-model="addgoodsListForm.goods_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addgoodsListDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addgoodsListDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>-->
  </div>
</template>
<script>
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 10
      },
      goodslist: [],
      total: 0
      // 控制添加商品对话框的隐藏与显示
      //   addgoodsListDialogVisible: false,
      //   addgoodsListForm: {},
      //   addgoodsListRules: {
      //     goods_name: '',
      //     goods_cat: '',
      //     goods_price: '',
      //     goods_number: '',
      //     goods_weight: ''
      //   }
    }
  },
  created () {
    this.getgoodsList()
  },
  methods: {
    // 获取商品列表数据
    async getgoodsList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('查询商品列表失败！')
      }
      //   console.log(res)
      this.goodslist = res.data.goods
      this.total = res.data.total
      this.$message.success('获取商品列表成功！')
      //   console.log(this.goodslist, this.total)
    },
    handleSizeChange (newsize) {
      // console.log(newpage)
      this.queryInfo.pagesize = newsize
      this.getgoodsList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange (newpage) {
      // console.log(newpage)
      this.queryInfo.pagenum = newpage
      this.getgoodsList()
    },
    // 点击删除按钮，删除对应商品
    async removeGoods (row) {
      console.log(row)
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('goods/' + row.goods_id)
      console.log(res)
      if (res.meta.status !== 200) {
        this.$message.error('删除商品失败！')
      }
      // 重新获取商品列表数据
      this.getgoodsList()
      // 提示删除成功
      this.$message.success('删除商品成功！')
    },
    goAddpage () {
      this.$router.push('/goods/add')
    }
  }
}
</script>
<style lang="less" scoped>
</style>
