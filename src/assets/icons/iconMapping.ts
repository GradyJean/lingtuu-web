const modules = import.meta.glob('./*.svg', {
  query: '?raw',
  import: 'default',
  eager: true
})

const icons: Record<string, string> = {}

for (const path in modules) {
  const name = path.replace('./', '').replace('.svg', '')

  icons[name] = modules[path] as string
}

export default icons

export type IconName = keyof typeof icons
