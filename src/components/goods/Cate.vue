<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!--      树形表格-->
      <tree-table class="treeTable" :data="catelist" :columns="columns" :selection-type="false"
                  :expand-type="false" show-index index-text="#" :show-row-hover="true" border>
        <template v-slot:isok="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <template v-slot:opt="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.cat_id)"> 编辑
          </el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row.cat_id)"> 删除
          </el-button>
        </template>
      </tree-table>
      <!--      分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!--    添加分类的对话框-->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed">
      <!--      添加分类的表单-->
      <el-form ref="addCateFormRef" :model="addCateForm" :rules="addCateFormRules" label-width="80px">
        <el-form-item label="分类名称:" prop="cat_name" label-width="100px">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:" label-width="100px">
          <!--          options用来指定数据源 props用来指定配置对象-->
          <el-cascader
            v-model="selectedKeys"
            props.expandTrigger="hover"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            props.checkStrictly=true>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
    </el-dialog>
    <!-- 修改分类对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      width="50%">
      <el-form ref="editCateFormRef" :model="editCateForm" :rules="editCateFormRules" label-width="80px">
        <el-form-item label="分类名称:" prop="cat_name" label-width="100px">
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
    name: 'Cate',
    data () {
      return {
        // 查询条件
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5
        },
        // 商品分类的数据列表
        catelist: [],
        total: 0,
        // 为table指定列的定义
        columns: [
          {
            label: '分类名称',
            prop: 'cat_name'
          },
          {
            label: '是否有效',
            // 将当前列定义为模板列
            type: 'template',
            // 当前列模板名称
            template: 'isok'
          },
          {
            label: '排序',
            // 将当前列定义为模板列
            type: 'template',
            // 当前列模板名称
            template: 'order'
          },
          {
            label: '操作',
            // 将当前列定义为模板列
            type: 'template',
            // 当前列模板名称
            template: 'opt'
          }
        ],
        editCateDialogVisible: false,
        editCateForm: {},
        editCateFormRules: {
          cat_name: [
            {
              required: true,
              message: '请输入用户邮箱',
              trigger: 'blur'
            }
          ]
        },
        addCateDialogVisible: false,
        addCateForm: {
          // 将要添加的分类名称
          cat_name: '',
          // 父级分类的ID
          cat_pid: 0,
          // 分类等级，默认添加是1级分类
          cat_level: 0
        },
        // 添加分类表单的验证规则对象
        addCateFormRules: {
          cat_name: [
            {
              required: true,
              message: '请输入用户邮箱',
              trigger: 'blur'
            }
          ]
        },
        // 父级分类的列表
        parentCateList: [],
        // 指定级联选择器的配置对象
        cascaderProps: {
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        // 选中的父级分类的ID数组
        selectedKeys: []
      }
    },
    created () {
      this.getCateList()
    },
    methods: {
      // 获取商品分类数据
      async getCateList () {
        const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类失败!')
        }
        // 把数据列表,赋值给catelist
        this.catelist = res.data.result
        console.log(this.catelist)
        this.total = res.data.total
      },
      handleSizeChange (newSize) {
        this.queryInfo.pagesize = newSize
        this.getCateList()
      },
      handleCurrentChange (newPage) {
        this.queryInfo.pagenum = newPage
        this.getCateList()
      },
      // 点击按钮，展示添加分类的对话框
      showAddCateDialog () {
        // 先获取父级分类的数据列表
        this.getParentCateList()
        // 再展示出对话框
        this.addCateDialogVisible = true
      },
      // 获取父级分类的数据列表
      async getParentCateList () {
        const { data: res } = await this.$http.get('categories', { params: { type: 2 } })

        if (res.meta.status !== 200) {
          return this.$message.error('获取父级分类数据失败')
        }

        this.parentCateList = res.data
        console.log(this.parentCateList)
      },
      parentCateChanged () {
        // console.log(this.selectedKeys)
        if (this.selectedKeys.length > 0) {
          // 父级分类的ID
          this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
          // 为当前分类的等级赋值
          this.addCateForm.cat_level = this.selectedKeys.length
          return false
        } else {
          this.addCateForm.cat_pid = 0
          this.addCateForm.cat_level = 0
        }
      },
      // 点击按钮，添加新的分类
      addCate () {
        this.$refs.addCateFormRef.validate(async valid => {
          if (!valid) return false
          const { data: res } = await this.$http.post('categories', this.addCateForm)

          if (res.meta.status !== 201) {
            return this.$message.error('添加分类失败!')
          }
          this.$message.success('添加分类成功!')
          await this.getCateList()
          this.addCateDialogVisible = false
        })
      },
      // 监听对话框的关闭事件，重置表单数据
      addCateDialogClosed () {
        this.$refs.addCateFormRef.resetFields()
        this.selectedKeys = []
        this.addCateForm.cat_level = 0
        this.addCateForm.cat_pid = 0
      },
      async removeCateById (id) {
        const status = await this.$confirm('此操作将永久删除用户，是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => {
          return err
        })
        if (status !== 'confirm') {
          return this.$message.info('已取消删除')
        }

        const { data: res } = await this.$http.delete('categories/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除分类失败!')
        }
        this.$message.success('删除分类成功!')
        this.queryInfo.pagenum = 1
        await this.getCateList()
      },
      // 展示编辑用户的对话框
      async showEditDialog (id) {
        const { data: res } = await this.$http.get('categories/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('查询商品信息失败!')
        }
        this.editCateForm = res.data
        this.editCateDialogVisible = true
      },
      async editCateInfo () {
        this.$refs.editCateFormRef.validate(async valid => {
          if (!valid) return
          console.log(this.editCateForm)
          // 发起修改用户信息的数据请求
          const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, {
            cat_name: this.editCateForm.cat_name
          })

          if (res.meta.status !== 200) {
            return this.$message.error('更新商品分类信息失败!')
          }
          // 关闭对话框
          this.editCateDialogVisible = false
          // 刷新数据列表
          await this.getCateList()
          // 提示修改成功
          this.$message.success('更新商品分类信息成功!')
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .treeTable {
    margin-top: 15px;
  }

  .el-cascader {
    width: 100%;
  }
</style>
