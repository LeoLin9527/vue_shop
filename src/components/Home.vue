<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu
          :default-active='activePath'
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          :unique-opened="true"
          :collapse="isCollapse"
          router
        >
          <!-- 一级菜单 -->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children"
                          :key="subItem.id" @click="saveNavState('/'+subItem.path)">
              <!-- 一级菜单的模板区域 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <!-- 路由占位符  -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    data () {
      return {
        // 左侧菜单数据
        menulist: [],
        iconObj: {
          125: 'iconfont icon-user',
          103: 'iconfont icon-tijikongjian',
          101: 'iconfont icon-shangpin',
          102: 'iconfont icon-danju',
          145: 'iconfont icon-baobiao'
        },
        // 是否折叠
        isCollapse: false,
        activePath: ''
      }
    },
    created () {
      this.getMenuList()
      this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods: {
      logout () {
        window.sessionStorage.clear()
        this.$router.push('/login')
      },
      // 获取所有菜单
      async getMenuList () {
        const { data: res } = await this.$http.get('menus')
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.menulist = res.data
        console.log(this.menulist)
      },
      toggleCollapse () {
        this.isCollapse = !this.isCollapse
      },
      saveNavState (activePath) {
        window.sessionStorage.setItem('activePath', activePath)
        this.activePath = activePath
      }
    }
  }
</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;
  }

  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;

    > div {
      display: flex;
      align-items: center;
      > span {
        margin-left: 10px;
      }
    }
  }

  .el-aside {
    background-color: #333744;

    .el-menu {
      border-right: 0;
    }
  }

  .el-main {
    background-color: #eaedf1;
  }

  .iconfont {
    margin-right: 10px;
  }

  .toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.5em;
    cursor: pointer;
  }
</style>
