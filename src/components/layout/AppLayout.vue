<template>
  <div class="app-layout">
    <!-- 顶部 Header (全宽) -->
    <header class="top-header">
      <slot name="header"/>
    </header>
    
    <!-- 中间内容区域：左边栏 + main -->
    <div class="middle-container">
      <!-- 左边 Left -->
      <aside class="left-sidebar">
        <slot name="left-sidebar"/>
      </aside>
      
      <!-- 主内容区域 -->
      <main class="main-content">
        <slot name="main"/>
      </main>
    </div>
    
    <!-- 底部 Footer (全宽) -->
    <footer class="bottom-footer">
      <slot name="footer"/>
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
  overflow: hidden;
}

/* 顶部 Header */
.top-header {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  width: 100%;
}

/* 中间容器：左边栏 + main */
.middle-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧边栏 */
.left-sidebar {
  width: 260px;
  background: #fff;
  border-right: 1px solid #f0f0f0;
  overflow-y: auto;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  overflow-y: auto;
  width: 100%;
  min-width: 0;
}

/* 底部 Footer */
.bottom-footer {
  height: 48px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  padding: 0 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  width: 100%;
}
</style>
