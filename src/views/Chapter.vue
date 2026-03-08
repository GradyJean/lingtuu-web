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
  <WorkspaceLayout>
    <template #header>
      <Header/>
    </template>
    <template #footer>
      <Footer/>
    </template>
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
        <template #left style="background: white;"> left</template>
        <template #center> center</template>
        <template #right>
          right
        </template>
      </WorkContainer>
    </template>
  </WorkspaceLayout>
</template>

<style scoped></style>
