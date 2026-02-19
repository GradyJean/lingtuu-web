<template>
  <div class="app-layout">
    <!-- 左边 Left -->
    <aside class="left-sidebar">
      <slot name="left-sidebar"/>
    </aside>
    <div class="main-container">
      <!-- 顶部 Header -->
      <header class="top-header">
        <slot name="header"/>
      </header>
      <!-- 主内容区域 -->
      <main class="main-content">
        <slot name="main"/>
      </main>
      <!-- 底部 -->
      <footer class="bottom-footer">
        <slot name="footer"/>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
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

/* 主内容容器 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  background: #f5f7fa;
}

/* 顶部 Header */
.top-header {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  min-height: 0;
  display: flex;
  justify-content: center;
}

/* 底部 */
.bottom-footer {
  height: 48px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  padding: 0 24px;
  flex-shrink: 0;
  text-align: center;
}
</style>
