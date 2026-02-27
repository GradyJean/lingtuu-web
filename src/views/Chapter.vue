<script setup lang="ts">
import BaseContainer from '../components/container/BaseContainer.vue'
import WorkContainer from '../components/container/WorkContainer.vue'
import {uiStateStore} from '../stores/ui'
import MenuBar from '../components/menu/MenuBar.vue'
import MenuItem from '../components/menu/MenuItem.vue'
import Dashboard from "./Dashboard.vue";

const uiStore = uiStateStore()

function menuClick(iconKey: string, isActive: boolean): void {
  let windowPosition: 'left' | 'right' | 'bottom' = 'left'
  switch (iconKey) {
    case 'project':
      windowPosition = 'left'
      break
    case 'database':
      windowPosition = 'right'
  }
  uiStore.windowShow(windowPosition, isActive)
}
</script>

<template>
  <BaseContainer>
    <template #left-side-bar>
      <MenuBar>
        <MenuItem name="folder" menu-key="project" @click="menuClick"/>
      </MenuBar>
    </template>
    <template #right-side-bar>
      <MenuBar>
        <MenuItem name="database" menu-key="database" @click="menuClick"/>
        <MenuItem name="connect" menu-key="connect" @click="menuClick"/>
      </MenuBar>
    </template>
    <template #ui-center>
      <WorkContainer>
        <template #left> left</template>
        <template #center> center</template>
        <template #right>
          <Dashboard v-if="uiStore.menuState.database"/>
        </template>
        <template #bottom> bottom</template>
      </WorkContainer>
    </template>
  </BaseContainer>
</template>

<style scoped></style>
