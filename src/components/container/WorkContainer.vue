<script setup lang="ts">
import {uiStateStore} from '../../stores/ui'
import {theme} from 'ant-design-vue'
import PanelContainer from '../../components/container/PanelContainer.vue'
import {Pane, Splitpanes} from '../../components/splitpanes'

const uiStore = uiStateStore()
const {token} = theme.useToken()

// 监听窗口大小改变
function onTopResize(e: { panes: any }): void {
  if (!e?.panes) return
  const panes = e.panes
  let index = 0
  // top
  const topPane = panes[index]
  if (topPane) {
    uiStore.windowPosition.top.size = topPane.size
  }
  index++
  // bottom
  if (uiStore.windowPosition.bottom.display) {
    const bottomPane = panes[index]
    if (bottomPane) {
      uiStore.windowPosition.bottom.size = bottomPane.size
    }
  }
  uiStore.windowPositionSave()
}

// 监听窗口大小改变
function onMainResize(e: { panes: any }): void {
  if (!e?.panes) return
  const panes = e.panes
  let index = 0
  // left
  if (uiStore.windowPosition.left.display) {
    const leftPane = panes[index]
    if (leftPane) {
      uiStore.windowPosition.left.size = leftPane.size
    }
    index++
  }
  // center
  const centerPane = panes[index]
  if (centerPane) {
    uiStore.windowPosition.center.size = centerPane.size
  }
  index++
  // right
  if (uiStore.windowPosition.right.display) {
    const rightPane = panes[index]
    if (rightPane) {
      uiStore.windowPosition.right.size = rightPane.size
    }
  }
  uiStore.windowPositionSave()
}
</script>

<template>
  <div
      class="workspace-root"
      :style="{
      '--Splitpanes-color': token.colorBgLayout
    }"
  >
    <!-- 整体：上下 -->
    <Splitpanes horizontal class="workspace-split" @resized="onTopResize">
      <!-- 上半区：左右 -->
      <Pane :size="uiStore.windowPosition.top.size">
        <Splitpanes class="workspace-split" @resized="onMainResize">
          <Pane v-if="uiStore.windowPosition.left.display" :size="uiStore.windowPosition.left.size">
            <PanelContainer>
              <slot name="left"/>
            </PanelContainer>
          </Pane>
          <!-- 中间区 -->
          <Pane :size="uiStore.windowPosition.center.size">
            <PanelContainer>
              <slot name="center"/>
            </PanelContainer>
          </Pane>
          <!-- 右半区 -->
          <Pane
              v-if="uiStore.windowPosition.right.display"
              :size="uiStore.windowPosition.right.size"
          >
            <PanelContainer>
              <slot name="right"/>
            </PanelContainer>
          </Pane>
        </Splitpanes>
      </Pane>
      <!-- 下半区：通栏 -->
      <Pane v-if="uiStore.windowPosition.bottom.display" :size="uiStore.windowPosition.bottom.size">
        <PanelContainer>
          <slot name="bottom"/>
        </PanelContainer>
      </Pane>
    </Splitpanes>
  </div>
</template>

<style scoped>
.workspace-root {
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
}

.workspace-split {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>

<style>
/* noinspection CssUnresolvedCustomProperty */
.splitpanes .splitpanes__pane {
  background-color: var(--Splitpanes-color);
}

/* noinspection CssUnresolvedCustomProperty */
.splitpanes__splitter {
  background-color: var(--Splitpanes-color);
}

/* 左右分隔（竖向） */
.splitpanes--vertical > .splitpanes__splitter {
  width: 5px;
  cursor: ew-resize;
}

/* 上下分隔（横向） */
.splitpanes--horizontal > .splitpanes__splitter {
  height: 5px;
  cursor: ns-resize;
}
</style>
