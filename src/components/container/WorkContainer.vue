<script setup lang="ts">
import {uiStateStore} from '../../stores/ui'
import PanelContainer from '../../components/container/PanelContainer.vue'
import {Pane, Splitpanes} from '../../components/splitpanes'

const uiStore = uiStateStore()

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
  <div class="workspace-root">
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
/* 左右分隔（竖向） */

.splitpanes--vertical > .splitpanes__splitter {
  width: 5px;
  cursor: ew-resize;
}

</style>
