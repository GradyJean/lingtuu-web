<template>
  <div
    class="tiptap-editor"
    :style="{
      '--editor-border': token.colorBorderSecondary,
      '--editor-border-active': token.colorPrimary,
      '--editor-bg': token.colorBgContainer,
      '--editor-toolbar-bg': token.colorFillQuaternary,
      '--editor-text': token.colorText,
      '--editor-text-secondary': token.colorTextSecondary,
      '--editor-hover-bg': token.colorFillSecondary,
      '--editor-active-bg': token.colorFill,
      '--editor-button-border': token.colorBorder
    }"
  >
    <div class="toolbar">
      <button
        type="button"
        class="toolbar-btn"
        :class="{ active: editor?.isActive('bold') }"
        @click="editor?.chain().focus().toggleBold().run()"
      >
        B
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ active: editor?.isActive('italic') }"
        @click="editor?.chain().focus().toggleItalic().run()"
      >
        I
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ active: editor?.isActive('strike') }"
        @click="editor?.chain().focus().toggleStrike().run()"
      >
        S
      </button>
      <span class="toolbar-divider"></span>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ active: editor?.isActive('heading', { level: 2 }) }"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        H2
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ active: editor?.isActive('bulletList') }"
        @click="editor?.chain().focus().toggleBulletList().run()"
      >
        列表
      </button>
      <button
        type="button"
        class="toolbar-btn"
        @click="editor?.chain().focus().unsetAllMarks().clearNodes().run()"
      >
        清除格式
      </button>
      <div class="toolbar-right">
        <span class="word-count">{{ wordCount }} 字</span>
      </div>
    </div>

    <EditorContent :editor="editor" class="content" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'
import { theme } from 'ant-design-vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
  }>(),
  {
    modelValue: '',
    placeholder: '开始输入内容...'
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const { token } = theme.useToken()

const editor = useEditor({
  autofocus: 'end',
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: props.placeholder
    })
  ],
  content: props.modelValue,
  editorProps: {
    attributes: {
      spellcheck: 'false'
    }
  },
  onUpdate: ({ editor: instance }) => {
    emit('update:modelValue', instance.getHTML())
  }
})

const wordCount = computed((): number => {
  const instance = editor.value
  if (!instance) return 0

  const text: string = instance.getText().replace(/\s+/g, '')
  return text.length
})

watch(
  () => props.modelValue,
  (value) => {
    const instance = editor.value
    if (!instance) return
    if (value === instance.getHTML()) return
    instance.commands.setContent(value || '', { emitUpdate: false })
  }
)

watch(
  () => props.placeholder,
  () => {
    const instance = editor.value
    if (!instance) return
    instance.commands.setContent(props.modelValue || '', { emitUpdate: false })
  }
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
/* noinspection CssUnresolvedCustomProperty */
.tiptap-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  border: 1px solid var(--editor-border);
  border-radius: 10px;
  background: var(--editor-bg);
  overflow: hidden;
}

/* noinspection CssUnresolvedCustomProperty */
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--editor-border);
  background: var(--editor-toolbar-bg);
}

/* noinspection CssUnresolvedCustomProperty */
.toolbar-btn {
  min-width: 36px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--editor-button-border);
  border-radius: 8px;
  background: transparent;
  color: var(--editor-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

/* noinspection CssUnresolvedCustomProperty */
.toolbar-btn:hover {
  background: var(--editor-hover-bg);
}

/* noinspection CssUnresolvedCustomProperty */
.toolbar-btn.active {
  border-color: var(--editor-border-active);
  background: var(--editor-active-bg);
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: var(--editor-border);
}

.toolbar-right {
  display: flex;
  align-items: center;
  margin-left: auto;
}

/* noinspection CssUnresolvedCustomProperty */
.word-count {
  font-size: 12px;
  color: var(--editor-text-secondary);
}

.content {
  flex: 1;
  min-height: 0;
}

/* noinspection CssUnresolvedCustomProperty */
.content :deep(.ProseMirror) {
  height: 100%;
  min-height: 100%;
  overflow-y: auto;
  padding: 18px 20px;
  box-sizing: border-box;
  outline: none;
  color: var(--editor-text);
  line-height: 1.9;
  font-size: 17px;
}

.content :deep(.ProseMirror p) {
  margin: 0 0 0.95em;
}

.content :deep(.ProseMirror h2) {
  margin: 0 0 0.85em;
  font-size: 22px;
  line-height: 1.5;
}

.content :deep(.ProseMirror ul) {
  margin: 0 0 0.95em;
  padding-left: 1.4em;
}

.content :deep(.ProseMirror li) {
  margin: 0.2em 0;
}

/* noinspection CssUnresolvedCustomProperty */
.content :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: var(--editor-text-secondary);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
