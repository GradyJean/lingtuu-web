<script setup lang="ts">
import WorkContainer from '../components/container/WorkContainer.vue'
import {uiStateStore} from '../stores/ui'
import MenuBar from '../components/menu/MenuBar.vue'
import MenuItem from '../components/menu/MenuItem.vue'
import WorkspaceLayout from "../components/layout/WorkspaceLayout.vue";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";

const uiStore = uiStateStore()

function menuClick(iconKey: string, isActive: boolean): void {
  let windowPosition: 'left' | 'right'  = 'left'
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
  <WorkspaceLayout>
    <template #header>
      <Header/>
    </template>
    <template #footer>
      <Footer/>
    </template>
    <template #left-side>
      <MenuBar>
        <MenuItem name="folder" menu-key="project" @click="menuClick"/>
      </MenuBar>
    </template>
    <template #right-side>
      <MenuBar>
        <MenuItem name="database" menu-key="database" @click="menuClick"/>
      </MenuBar>
    </template>
    <template #main>
      <WorkContainer>
        <template #left> left</template>
        <template #center> center</template>
        <template #right>
          right
        </template>
      </WorkContainer>
    </template>
  </WorkspaceLayout>
</template>

<style scoped></style>
