<script setup lang="ts">
import {computed, onBeforeUnmount, ref, watch} from 'vue'
import {theme} from 'ant-design-vue'
import {EditorContent, useEditor} from '@tiptap/vue-3'
import type {JSONContent} from '@tiptap/vue-3'
import {BubbleMenu} from '@tiptap/vue-3/menus'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  BoldOutlined,
  ItalicOutlined,
  LinkOutlined,
  OrderedListOutlined,
  RedoOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
  UndoOutlined,
  UnorderedListOutlined
} from '@ant-design/icons-vue'

const {token} = theme.useToken()

type EditorSavePayload = {
  html: string
  text: string
  json: JSONContent
}

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
}>(), {
  modelValue: '<h1>第一章</h1><p></p>',
  placeholder: '开始写这一章。按 Enter 换段，先把故事写出来。',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', payload: EditorSavePayload): void
}>()

const html = ref(props.modelValue)
const textCount = ref(0)

const headingOptions = [
  {label: '正文', value: 'paragraph'},
  {label: '标题 1', value: 'h1'},
  {label: '标题 2', value: 'h2'},
  {label: '标题 3', value: 'h3'}
] as const

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3]
      }
    }),
    Placeholder.configure({
      placeholder: props.placeholder
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https'
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph']
    })
  ],
  content: html.value,
  editorProps: {
    attributes: {
      class: 'editor-content'
    }
  },
  onCreate: ({editor}) => {
    textCount.value = editor.getText().trim().length
  },
  onUpdate: ({editor}) => {
    html.value = editor.getHTML()
    textCount.value = editor.getText().trim().length
    const payload = {
      html: html.value,
      text: editor.getText({blockSeparator: '\n\n'}).trim(),
      json: editor.getJSON()
    }
    emit('update:modelValue', payload.html)
    emit('change', payload)
  }
})

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value || value === undefined) {
      return
    }
    const nextValue = value || '<p></p>'
    if (nextValue === editor.value.getHTML()) {
      return
    }
    editor.value.commands.setContent(nextValue, {emitUpdate: false})
    html.value = editor.value.getHTML()
    textCount.value = editor.value.getText().trim().length
  }
)

const currentBlock = computed(() => {
  if (!editor.value) {
    return 'paragraph'
  }
  if (editor.value.isActive('heading', {level: 1})) {
    return 'h1'
  }
  if (editor.value.isActive('heading', {level: 2})) {
    return 'h2'
  }
  if (editor.value.isActive('heading', {level: 3})) {
    return 'h3'
  }
  return 'paragraph'
})

const canUndo = computed(() => editor.value?.can().chain().focus().undo().run() ?? false)
const canRedo = computed(() => editor.value?.can().chain().focus().redo().run() ?? false)

function run(command: () => boolean | void): void {
  if (!editor.value) {
    return
  }
  command()
}

function setBlock(value: string): void {
  if (!editor.value) {
    return
  }
  const chain = editor.value.chain().focus()
  if (value === 'paragraph') {
    chain.setParagraph().run()
    return
  }
  const level = Number(value.slice(1))
  if (level >= 1 && level <= 3) {
    chain.toggleHeading({level: level as 1 | 2 | 3}).run()
  }
}

function setLink(): void {
  if (!editor.value) {
    return
  }
  const previousUrl = editor.value.getAttributes('link').href as string | undefined
  const url = window.prompt('输入链接地址', previousUrl ?? 'https://')
  if (url === null) {
    return
  }
  if (url.trim() === '') {
    editor.value.chain().focus().unsetLink().run()
    return
  }
  editor.value.chain().focus().extendMarkRange('link').setLink({href: url.trim()}).run()
}

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div class="editor-root">
    <header class="toolbar">
      <div class="toolbar-main">
        <div class="toolbar-group">
          <a-button size="small" :disabled="!canUndo" @click="run(() => editor?.chain().focus().undo().run())">
            <template #icon><UndoOutlined /></template>
          </a-button>
          <a-button size="small" :disabled="!canRedo" @click="run(() => editor?.chain().focus().redo().run())">
            <template #icon><RedoOutlined /></template>
          </a-button>
        </div>

        <a-select
            :value="currentBlock"
            class="block-select"
            size="small"
            @change="setBlock"
        >
          <a-select-option v-for="option in headingOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-select-option>
        </a-select>

        <div class="toolbar-group">
          <a-button
              size="small"
              :type="editor?.isActive('bold') ? 'primary' : 'text'"
              @click="run(() => editor?.chain().focus().toggleBold().run())"
          >
            <template #icon><BoldOutlined /></template>
          </a-button>
          <a-button
              size="small"
              :type="editor?.isActive('italic') ? 'primary' : 'text'"
              @click="run(() => editor?.chain().focus().toggleItalic().run())"
          >
            <template #icon><ItalicOutlined /></template>
          </a-button>
          <a-button
              size="small"
              :type="editor?.isActive('underline') ? 'primary' : 'text'"
              @click="run(() => editor?.chain().focus().toggleUnderline().run())"
          >
            <template #icon><UnderlineOutlined /></template>
          </a-button>
          <a-button
              size="small"
              :type="editor?.isActive('strike') ? 'primary' : 'text'"
              @click="run(() => editor?.chain().focus().toggleStrike().run())"
          >
            <template #icon><StrikethroughOutlined /></template>
          </a-button>
        </div>

        <div class="toolbar-group">
          <a-button
              size="small"
              :type="editor?.isActive('bulletList') ? 'primary' : 'text'"
              @click="run(() => editor?.chain().focus().toggleBulletList().run())"
          >
            <template #icon><UnorderedListOutlined /></template>
          </a-button>
          <a-button
              size="small"
              :type="editor?.isActive('orderedList') ? 'primary' : 'text'"
              @click="run(() => editor?.chain().focus().toggleOrderedList().run())"
          >
            <template #icon><OrderedListOutlined /></template>
          </a-button>
          <a-button
              size="small"
              :type="editor?.isActive('blockquote') ? 'primary' : 'text'"
              @click="run(() => editor?.chain().focus().toggleBlockquote().run())"
          >
            ""
          </a-button>
          <a-button size="small" :type="editor?.isActive('link') ? 'primary' : 'text'" @click="setLink">
            <template #icon><LinkOutlined /></template>
          </a-button>
        </div>

        <div class="toolbar-group">
          <a-button
              size="small"
              :type="editor?.isActive({textAlign: 'left'}) ? 'primary' : 'text'"
              @click="run(() => editor?.chain().focus().setTextAlign('left').run())"
          >
            <template #icon><AlignLeftOutlined /></template>
          </a-button>
          <a-button
              size="small"
              :type="editor?.isActive({textAlign: 'center'}) ? 'primary' : 'text'"
              @click="run(() => editor?.chain().focus().setTextAlign('center').run())"
          >
            <template #icon><AlignCenterOutlined /></template>
          </a-button>
          <a-button
              size="small"
              :type="editor?.isActive({textAlign: 'right'}) ? 'primary' : 'text'"
              @click="run(() => editor?.chain().focus().setTextAlign('right').run())"
          >
            <template #icon><AlignRightOutlined /></template>
          </a-button>
        </div>
      </div>

      <div class="toolbar-side">
        <span class="meta">{{ textCount }} 字</span>
      </div>
    </header>

    <BubbleMenu
        v-if="editor"
        :editor="editor"
        class="bubble-menu"
        :options="{ placement: 'top' }"
    >
      <a-space :size="4">
        <a-button
            size="small"
            :type="editor?.isActive('bold') ? 'primary' : 'text'"
            @mousedown.prevent="run(() => editor?.chain().focus().toggleBold().run())"
        >
          <template #icon><BoldOutlined /></template>
        </a-button>
        <a-button
            size="small"
            :type="editor?.isActive('italic') ? 'primary' : 'text'"
            @mousedown.prevent="run(() => editor?.chain().focus().toggleItalic().run())"
        >
          <template #icon><ItalicOutlined /></template>
        </a-button>
        <a-button
            size="small"
            :type="editor?.isActive('underline') ? 'primary' : 'text'"
            @mousedown.prevent="run(() => editor?.chain().focus().toggleUnderline().run())"
        >
          <template #icon><UnderlineOutlined /></template>
        </a-button>
        <a-button
            size="small"
            :type="editor?.isActive('link') ? 'primary' : 'text'"
            @mousedown.prevent="setLink"
        >
          <template #icon><LinkOutlined /></template>
        </a-button>
      </a-space>
    </BubbleMenu>

    <div class="editor-scroll">
      <EditorContent v-if="editor" :editor="editor" class="editor-surface" />
    </div>
  </div>
</template>

<style scoped>
.editor-root {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 800px;
  padding: 15px 15px 12px;
  border-bottom: 1px solid v-bind('token.colorBorderSecondary');
  flex-shrink: 0;
}

.toolbar-main,
.toolbar-side,
.toolbar-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.toolbar-main {
  min-width: 0;
  flex: 1;
  flex-wrap: wrap;
}

.toolbar-side {
  margin-left: auto;
  white-space: nowrap;
}

.block-select {
  width: 108px;
}

.meta {
  color: v-bind('token.colorTextTertiary');
  font-size: 12px;
  margin-right: 4px;
}

.bubble-menu {
  padding: 4px;
  border: 1px solid v-bind('token.colorBorderSecondary');
  background: v-bind('token.colorBgElevated');
  box-shadow: v-bind('token.boxShadow');
}

.editor-surface {
  min-width: 800px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.editor-scroll {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
}

:deep(.editor-content) {
  flex: 1;
  display: block;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  padding: 28px 15px 80px;
  outline: none;
  color: v-bind('token.colorText');
  font-size: 17px;
  line-height: 1.68;
  caret-color: v-bind('token.colorPrimary');
}

:deep(.editor-content > *:first-child) {
  margin-top: 0;
}

:deep(.editor-content p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  color: v-bind('token.colorTextQuaternary');
  pointer-events: none;
}

:deep(.editor-content h1),
:deep(.editor-content h2),
:deep(.editor-content h3) {
  margin: 1em 0 0.42em;
  line-height: 1.18;
}

:deep(.editor-content h1) {
  font-size: 2rem;
}

:deep(.editor-content h2) {
  font-size: 1.5rem;
}

:deep(.editor-content h3) {
  font-size: 1.2rem;
}

:deep(.editor-content p) {
  margin: 0 0 0.72em;
  text-indent: 2em;
}

:deep(.editor-content ul),
:deep(.editor-content ol) {
  padding-left: 1.5em;
  margin: 0 0 0.72em;
}

:deep(.editor-content blockquote) {
  margin: 0.9em 0;
  padding-left: 1em;
  border-left: 3px solid v-bind('token.controlOutline');
  color: v-bind('token.colorTextSecondary');
}

:deep(.editor-content a) {
  color: v-bind('token.colorPrimary');
  text-decoration: underline;
}

:deep(.editor-content ::selection) {
  background: v-bind('token.colorBgTextActive');
}

@media (max-width: 960px) {
  .toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .toolbar-side {
    margin-left: 0;
  }

  :deep(.editor-content) {
    padding: 20px 0 56px;
    font-size: 16px;
  }
}
</style>
