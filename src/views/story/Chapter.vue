<script setup lang="ts">
import {ref} from 'vue'
import WorkContainer from '@components/container/WorkContainer.vue'
import {uiStateStore} from '@stores/ui.ts'
import MenuBar from '@components/menu/MenuBar.vue'
import MenuItem from '@components/menu/MenuItem.vue'
import WorkspaceLayout from "@components/layout/WorkspaceLayout.vue";
import Header from "@components/Header.vue";
import Footer from "@components/Footer.vue";
import Editor from "@components/editor/Editor.vue";
import type {JSONContent} from '@tiptap/vue-3'

const uiStore = uiStateStore()
const chapterContent = ref('<h1>第一章</h1><p></p>')

function menuActive(iconKey: string, isActive: boolean): void {
  let windowPosition: 'left' | 'right' = 'left'
  switch (iconKey) {
    case 'project':
      windowPosition = 'left'
      break
    case 'database':
      windowPosition = 'right'
  }
  uiStore.windowShow(windowPosition, isActive)
}

function handleEditorSave(payload: { html: string; text: string; json: JSONContent }): void {
  console.log('editor save payload', payload)
}
</script>

<template>
  <WorkspaceLayout>
    <template #header>
      <Header>
        <template #header-left>
          ddddd
        </template>
      </Header>
    </template>
    <template #footer>
      <Footer/>
    </template>
    <template #left-side>
      <MenuBar>
        <MenuItem icon-name="folder" menu-key="chapter" tips="章节管理" :default-active="true" @active="menuActive"/>
      </MenuBar>
    </template>
    <template #right-side>
      <MenuBar>
        <MenuItem icon-name="database" menu-key="database" tips="资料库" :default-active="true" @active="menuActive"/>
      </MenuBar>
    </template>
    <template #main>
      <WorkContainer>
        <template #left> left</template>
        <template #center>
          <Editor v-model="chapterContent" @save="handleEditorSave"/>
        </template>
        <template #right>
          right
        </template>
      </WorkContainer>
    </template>
  </WorkspaceLayout>
</template>

<style scoped></style>
