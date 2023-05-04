<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row :gutter="10">
        <el-col :span="6">
          <el-button type="primary"
         >添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdtop', i1 === 0 ? 'bdbottom' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二和三级权限 -->
              <el-col :span="19">
                <!-- 通过 for 嵌套 渲染二级权限 -->
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      :class="[i3 === 0 ? '' : 'bdtop']"
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
                  {{ scope.row }}
                </pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"> </el-table-column>
        <el-table-column label="角色描述" prop="roleName"> </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope" winth="300px" >
            <el-button size="mini" type="primary" icon="el-icon-edit"
              >编辑</el-button
            >
            <el-button size="mini" type="danger" icon="el-icon-delete"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形空间 -->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all
      :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 添加用户的对话框 -->
    <!-- <el-dialog
  title="添加角色"
  :visible.sync="addDialogVisible"
  width="50%"
  >
    <el-form v-model="addRolesForm" label-width="70px"  >
  <el-form-item label="角色名称" prop="roleName">
    <el-input v-model="addRolesForm.roleName"  prop=""></el-input>
  </el-form-item>
  <el-form-item label="角色描述" prop="roleDesc">
    <el-input v-model="addRolesForm.roleDesc"></el-input>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" >确 定</el-button>
  </span>
</el-dialog> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表
      roleList: [],
      // 控制分配权限的对话框的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightsList: [],
    //   树形控件的属性绑定对象
      treeProps:{
        label:'authName',
        children:'children'
      },
    // 默认选中的值
      defKeys:[],
    //   当前分配权限的角色id
      roleId:'',
    //   控制添加用户的显示与隐藏
    // addDialogVisible:false,
    // 添加角色的数据
    // addRolesForm:{
    //     roleName:'',
    //     roleDesc:''
    // }
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')

      if (res.meta.status != 200) {
        return this.$message.error('获取用户角色失败!')
      }
      this.roleList = res.data
      console.log(this.roleList)
    },
    // 根据id删除对应的权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除')
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      role.children = res.data
    },
    async showSetRightDialog(role) {
        this.roleId =role.id
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree')
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }
      //  获取权限数据保存到data
      this.rightsList = res.data
    //   console.log(this.rightsList)
    //   获取三级节点的id
    this.getLeafkeys(role,
    this.defKeys)

    this.setRightDialogVisible = true
    },
    // 获取三级id 递归
    // node判断是否是三级权限 arr保存
    // 不包含children属性 是三级id
    getLeafkeys(node,arr){
        if(!node.children){
            return arr.push(node.id)
        }

        node.children.forEach(item=>{
            this.getLeafkeys(item,arr)
        })
    },
    // 监听对话框关闭事件
   async setRightDialogClosed(){
        // 为事件重新赋值
        this.defKeys=[]
    },
    // 点击分配权限的回调函数
   async allotRights(){
    const keys=[
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
    ]
    // console.log(keys)
    const idStr =keys.join(',')
  const {data:res} =await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})

  if(res.meta.status!==200){
    return this.$message.error('分配权限失败')
  }
  this.$message.success('分配权限成功')
  this.getRolesList();
  this.setRightDialogVisible = false
    },
    // 展示添加用户的对话框
    // addRolesUser() {
    //   this.$refs.addRolesForm.validate(async valid => {
    //     if (!valid) return
    //     const { data: res } = await this.$http.post('roles', this.addRolesForm)
    //     console.log(res)
    //     if (res.meta.status !== 201) {
    //       return this.$message.error('添加角色失败!')
    //     }
    //     this.$message.success('添加角色成功!')
    //     this.getRolesList()
    //     this.addDialogVisible = false
    //   })
    //   // console.log(this.addRolesForm)
    // },
    
    
  },
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px #eee solid;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>