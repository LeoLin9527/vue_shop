<template>
  <div>
    <!--  面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    卡片视图区域-->
    <el-card>
      <!--  警告区域-->
      <el-alert title="只允许为第三级分类设置相关参数!" type="warning" :closable="false" show-icon></el-alert>
      <!--    选择商品分类区域-->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!--          选择商品分类的级联选择框-->
          <el-cascader props.expandTrigger="hover" :options="catelist" :props="cateProps" v-model="selectedCateKeys"
                       @change="handlechange">

          </el-cascader>
        </el-col>
      </el-row>
      <!--      tab标签区域-->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">
            添加参数
          </el-button>
          <!--          动态参数表格-->
          <el-table :data="manyTableData" border strip>
            <!--            展开行-->
            <el-table-column type="expand">
              <template v-slot:default="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">
                  {{item}}
                </el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!--                添加按钮-->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <!--            索引列-->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="scope">
                <el-button type="primary" size="mini" @click="showEditDialog(scope.row.attr_id)">
                  编辑
                </el-button>
                <el-button type="danger" size="mini" @click="removeParams(scope.row.attr_id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!--        静态属性-->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">
            添加属性
          </el-button>
          <el-table :data="onlyTableData" border strip>
            <!--            展开行-->
            <el-table-column type="expand">
              <!--              循环渲染tag标签-->
              <template v-slot:default="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">
                  {{item}}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!--            索引列-->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="scope">
                <el-button type="primary" size="mini" @click="showEditDialog(scope.row.attr_id)">
                  编辑
                </el-button>
                <el-button type="danger" size="mini" @click="removeParams(scope.row.attr_id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--    添加对话框-->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addParams">确 定</el-button>
  </span>
    </el-dialog>
    <!--修改对话框-->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed">
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
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
    name: 'Param',
    data () {
      return {
        // 商品分类列表
        catelist: [],
        // 级联选择框的配置对象
        cateProps: {
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        // 级联选择框双向绑定
        selectedCateKeys: [],
        // 被激活的页签名称
        activeName: 'many',
        // 动态参数的数据
        manyTableData: [],
        onlyTableData: [],
        // 控制添加对话框的显示与隐藏
        addDialogVisible: false,
        addForm: {
          attr_name: ''
        },
        // 验证规则对象
        addFormRules: {
          attr_name: [{
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }]
        },
        editDialogVisible: false,
        editForm: {},
        editFormRules: {
          attr_name: [{
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }]
        },
        inputVisible: false,
        inputValue: ''
      }
    },
    created () {
      this.getCateList()
    },
    methods: {
      // 获取所有商品分类列表
      async getCateList () {
        const { data: res } = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类失败!')
        }
        this.catelist = res.data
        console.log(this.catelist)
      },
      handlechange () {
        this.getParamsData()
      },
      handleTabClick () {
        console.log(this.activeName)
        this.getParamsData()
      },
      async getParamsData () {
        // 证明选中的不是三级分类
        if (this.selectedCateKeys.length !== 3) {
          this.selectedCateKeys = []
          this.onlyTableData = []
          this.manyTableData = []
          return
        }
        console.log(this.selectedCateKeys)
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: this.activeName }
        })

        if (res.meta.status !== 200) {
          return this.$message.error('获取失败')
        }

        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          item.inputVisible = false
          // 文本框输入的值
          item.inputValue = ''
        })
        console.log(res.data)
        if (this.activeName === 'many') {
          this.manyTableData = res.data
        } else {
          this.onlyTableData = res.data
        }
      },
      addDialogClosed () {
        this.$refs.addFormRef.resetFields()
      },
      // 点击按钮，添加参数
      addParams () {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })

          if (res.meta.status !== 201) {
            return this.$message.error('添加参数失败！')
          }
          this.$message.success('添加参数成功!')
          this.addDialogVisible = false
          await this.getParamsData()
        })
      },
      // 点击按钮展示修改对话框
      async showEditDialog (attrId) {
        this.editDialogVisible = true
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, {
          params: { attr_sel: this.activeName }
        })

        if (res.meta.status !== 200) {
          return this.$message.error('添加参数失败！')
        }
        this.editForm = res.data
        this.editDialogVisible = true
      },
      editDialogClosed () {
        this.$refs.editFormRef.resetFields()
      },
      // 提交修改参数信息
      editParams () {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.put(
            `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
            {
              attr_name: this.editForm.attr_name,
              attr_sel: this.activeName
            }
          )

          if (res.meta.status !== 200) {
            return this.$message.error('修改参数失败！')
          }

          this.$message.success('修改参数成功！')
          await this.getParamsData()
          this.editDialogVisible = false
        })
      },
      // 根据Id删除对应的参数项
      async removeParams (attrId) {
        const confirmResult = await this.$confirm(
          '此操作将永久删除该参数, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).catch(err => err)

        // 用户取消了删除的操作
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除！')
        }

        // 删除的业务逻辑
        const { data: res } = await this.$http.delete(
          `categories/${this.cateId}/attributes/${attrId}`
        )

        if (res.meta.status !== 200) {
          return this.$message.error('删除参数失败！')
        }

        this.$message.success('删除参数成功！')
        await this.getParamsData()
      },
      handleInputConfirm (row) {
        if (row.inputValue.trim().length === 0) {
          row.inputValue = ''
          row.inputVisible = false
          return
        }
        // 如果没有return，则证明输入的内容，需要做后续处理
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        // 需要发起请求，保存这次操作
        this.saveAttrVals(row)
      },
      async saveAttrVals (row) {
        // 需要发起请求，保存这次操作
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${row.attr_id}`,
          {
            attr_name: row.attr_name,
            attr_sel: row.attr_sel,
            attr_vals: row.attr_vals.join(' ')
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('修改参数项失败！')
        }

        this.$message.success('修改参数项成功！')
      },
      showInput (row) {
        row.inputVisible = true
        // 文本框自动获取焦点
        // $nextTick 当页面上元素被重新渲染后才会执行回调函数中的代码
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus()
        })
      },
      // 删除对应的参数可选项
      handleClose (i, row) {
        row.attr_vals.splice(i, 1)
        this.saveAttrVals(row)
      }
    },
    computed: {
      // 控制按钮是否禁用
      isBtnDisabled () {
        return this.selectedCateKeys.length !== 3
      },
      cateId () {
        if (this.selectedCateKeys.length === 3) {
          return this.selectedCateKeys[2]
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
    margin: 15px 0;
  }

  .el-tag {
    margin: 10px;
  }

  .input-new-tag {
    width: 120px;
  }
</style>
