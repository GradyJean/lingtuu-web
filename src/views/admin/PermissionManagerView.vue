<template>
  <div class="permission-manager">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="eyebrow">Admin Permission</p>
        <h1 class="page-title">权限管理台</h1>
        <p class="page-subtitle">按 scope 管理系统角色、系统资源，以及主体绑定关系。</p>
      </div>
      <div class="hero-actions">
        <a-select
            v-model:value="selectedScope"
            class="scope-select"
            placeholder="请选择权限域"
            :options="scopeOptions"
            :loading="scopeLoading"
        />
        <a-button :loading="refreshing" @click="loadCurrentTabData">
          <template #icon>
            <ReloadOutlined />
          </template>
          刷新
        </a-button>
        <a-button
            type="primary"
            :disabled="!selectedScope"
            @click="openPrimaryModal"
        >
          <template #icon>
            <PlusOutlined />
          </template>
          {{ primaryActionLabel }}
        </a-button>
      </div>
    </section>

    <section class="manager-card">
      <a-tabs v-model:active-key="activeTab" class="manager-tabs">
        <a-tab-pane key="roles" tab="角色" />
        <a-tab-pane key="systemResources" tab="系统资源" />
        <a-tab-pane key="subjectRoles" tab="主体角色" />
        <a-tab-pane key="subjectResources" tab="主体资源" />
      </a-tabs>

      <div class="scope-banner">
        <span class="scope-label">当前 Scope</span>
        <strong>{{ currentScopeName }}</strong>
      </div>

      <a-alert
          v-if="!selectedScope"
          type="info"
          show-icon
          message="先选择一个权限域"
          description="选择 scope 后会自动加载当前 tab 对应的数据。"
      />

      <a-table
          v-else-if="activeTab === 'roles'"
          row-key="id"
          :columns="roleColumns"
          :data-source="roleList"
          :loading="tableLoading"
          :pagination="false"
      />

      <a-table
          v-else-if="activeTab === 'systemResources'"
          row-key="id"
          :columns="systemResourceColumns"
          :data-source="systemResourceList"
          :loading="tableLoading"
          :pagination="false"
      />

      <a-table
          v-else-if="activeTab === 'subjectRoles'"
          row-key="id"
          :columns="subjectRoleColumns"
          :data-source="subjectRoleList"
          :loading="tableLoading"
          :pagination="false"
      >
        <template #bodyCell="{column, record}">
          <template v-if="column.key === 'subjectType'">
            <a-tag>{{ getSubjectTypeLabel(record.subjectType) }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button
                type="link"
                danger
                @click="handleUnbindSubjectRole(record)"
            >
              解绑
            </a-button>
          </template>
        </template>
      </a-table>

      <a-table
          v-else
          row-key="id"
          :columns="subjectResourceColumns"
          :data-source="subjectResourceList"
          :loading="tableLoading"
          :pagination="false"
      >
        <template #bodyCell="{column, record}">
          <template v-if="column.key === 'subjectType'">
            <a-tag>{{ getSubjectTypeLabel(record.subjectType) }}</a-tag>
          </template>
          <template v-else-if="column.key === 'resourceType'">
            <a-tag color="blue">{{ record.resourceType }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button
                type="link"
                danger
                @click="handleUnbindSubjectResource(record)"
            >
              解绑
            </a-button>
          </template>
        </template>
      </a-table>
    </section>

    <a-modal
        v-model:open="roleModalOpen"
        title="新增角色"
        ok-text="创建"
        cancel-text="取消"
        :confirm-loading="submitting"
        @ok="handleCreateRole"
    >
      <a-form layout="vertical">
        <a-form-item label="角色编码" required>
          <a-input v-model:value="roleForm.code" placeholder="例如：admin" />
        </a-form-item>
        <a-form-item label="角色名称" required>
          <a-input v-model:value="roleForm.name" placeholder="请输入角色名称" />
        </a-form-item>
        <a-form-item label="角色描述">
          <a-textarea v-model:value="roleForm.description" :rows="3" placeholder="可选" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
        v-model:open="systemResourceModalOpen"
        title="新增系统资源"
        ok-text="创建"
        cancel-text="取消"
        :confirm-loading="submitting"
        @ok="handleCreateSystemResource"
    >
      <a-form layout="vertical">
        <a-form-item label="资源标识" required>
          <a-input v-model:value="systemResourceForm.identifier" placeholder="例如：/story/list" />
        </a-form-item>
        <a-form-item label="资源类型" required>
          <a-select
              v-model:value="systemResourceForm.resourceType"
              placeholder="请选择资源类型"
              :options="resourceTypeOptions"
          />
        </a-form-item>
        <a-form-item label="资源描述">
          <a-textarea v-model:value="systemResourceForm.description" :rows="3" placeholder="可选" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
        v-model:open="subjectRoleModalOpen"
        title="绑定主体角色"
        ok-text="绑定"
        cancel-text="取消"
        :confirm-loading="submitting"
        @ok="handleBindSubjectRole"
    >
      <a-form layout="vertical">
        <a-form-item label="主体类型" required>
          <a-select
              v-model:value="subjectRoleForm.subjectType"
              :options="subjectTypeOptions"
          />
        </a-form-item>
        <a-form-item label="主体编码" required>
          <a-input v-model:value="subjectRoleForm.subjectCode" placeholder="请输入主体编码" />
        </a-form-item>
        <a-form-item label="角色编码" required>
          <a-select
              v-model:value="subjectRoleForm.roleCode"
              placeholder="请选择角色编码"
              :options="roleCodeOptions"
              show-search
              :filter-option="selectFilterOption"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
        v-model:open="subjectResourceModalOpen"
        title="绑定主体资源"
        ok-text="绑定"
        cancel-text="取消"
        :confirm-loading="submitting"
        @ok="handleBindSubjectResource"
    >
      <a-form layout="vertical">
        <a-form-item label="主体类型" required>
          <a-select
              v-model:value="subjectResourceForm.subjectType"
              :options="subjectTypeOptions"
          />
        </a-form-item>
        <a-form-item label="主体编码" required>
          <a-input v-model:value="subjectResourceForm.subjectCode" placeholder="请输入主体编码" />
        </a-form-item>
        <a-form-item label="资源标识" required>
          <a-select
              v-model:value="subjectResourceForm.identifier"
              placeholder="请选择资源标识"
              :options="systemResourceIdentifierOptions"
              show-search
              :filter-option="selectFilterOption"
              @change="handleSubjectResourceIdentifierChange"
          />
        </a-form-item>
        <a-form-item label="资源类型" required>
          <a-input v-model:value="subjectResourceForm.resourceType" disabled />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref, watch} from 'vue'
import {message, theme} from 'ant-design-vue'
import {PlusOutlined, ReloadOutlined} from '@ant-design/icons-vue'
import {
  bindSubjectResource,
  bindSubjectRole,
  createPermissionRole,
  createSystemPermissionResource,
  getPermissionResourceTypes,
  getPermissionRoles,
  getPermissionScopes,
  getSubjectResources,
  getSubjectRoles,
  getSystemPermissionResources,
  unbindSubjectResource,
  unbindSubjectRole,
  type PermissionResourceItem,
  type PermissionResourceType,
  type PermissionResourceTypeItem,
  type PermissionRoleItem,
  type PermissionSubjectResourceItem,
  type PermissionSubjectRoleItem,
  type PermissionSubjectType,
  type SecurityScopeItem,
} from '@api/security/adminPermission.ts'

type ActiveTabKey = 'roles' | 'systemResources' | 'subjectRoles' | 'subjectResources'
type SelectOption = { label: string; value: string }

const {token} = theme.useToken()

const subjectTypeLabelMap: Record<PermissionSubjectType, string> = {
  USER: '用户',
  ROLE: '角色',
}

const activeTab = ref<ActiveTabKey>('roles')
const selectedScope = ref('')
const scopeLoading = ref(false)
const tableLoading = ref(false)
const refreshing = ref(false)
const submitting = ref(false)

const scopeList = ref<SecurityScopeItem[]>([])
const resourceTypeList = ref<PermissionResourceTypeItem[]>([])
const roleList = ref<PermissionRoleItem[]>([])
const systemResourceList = ref<PermissionResourceItem[]>([])
const subjectRoleList = ref<PermissionSubjectRoleItem[]>([])
const subjectResourceList = ref<PermissionSubjectResourceItem[]>([])

const roleModalOpen = ref(false)
const systemResourceModalOpen = ref(false)
const subjectRoleModalOpen = ref(false)
const subjectResourceModalOpen = ref(false)

const roleForm = reactive({
  code: '',
  name: '',
  description: '',
})

const systemResourceForm = reactive({
  identifier: '',
  resourceType: undefined as PermissionResourceType | undefined,
  description: '',
})

const subjectRoleForm = reactive({
  subjectType: 'USER' as PermissionSubjectType,
  subjectCode: '',
  roleCode: '',
})

const subjectResourceForm = reactive({
  subjectType: 'USER' as PermissionSubjectType,
  subjectCode: '',
  identifier: '',
  resourceType: '',
})

const scopeOptions = computed<SelectOption[]>(() =>
    scopeList.value.map((item) => ({
      label: `${item.name} (${item.scope})`,
      value: item.scope,
    }))
)

const resourceTypeOptions = computed<SelectOption[]>(() =>
    resourceTypeList.value.map((item) => ({
      label: `${item.name} · ${item.description}`,
      value: item.name,
    }))
)

const subjectTypeOptions = computed<SelectOption[]>(() =>
    (Object.entries(subjectTypeLabelMap) as [PermissionSubjectType, string][])
        .map(([value, label]) => ({label, value}))
)

const roleCodeOptions = computed<SelectOption[]>(() =>
    roleList.value.map((item) => ({
      label: `${item.name} (${item.code})`,
      value: item.code,
    }))
)

const systemResourceIdentifierOptions = computed<SelectOption[]>(() =>
    systemResourceList.value.map((item) => ({
      label: `${item.identifier} (${item.type})`,
      value: item.identifier,
    }))
)

const currentScopeName = computed(() => {
  const current = scopeList.value.find((item) => item.scope === selectedScope.value)
  if (!current) {
    return '未选择'
  }
  return `${current.name} (${current.scope})`
})

const primaryActionLabel = computed(() => {
  const labelMap: Record<ActiveTabKey, string> = {
    roles: '新增角色',
    systemResources: '新增系统资源',
    subjectRoles: '绑定主体角色',
    subjectResources: '绑定主体资源',
  }
  return labelMap[activeTab.value]
})

const roleColumns = [
  {title: '角色编码', dataIndex: 'code', key: 'code'},
  {title: '角色名称', dataIndex: 'name', key: 'name'},
  {title: '描述', dataIndex: 'description', key: 'description'},
  {title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt'},
]

const systemResourceColumns = [
  {title: '资源标识', dataIndex: 'identifier', key: 'identifier'},
  {title: '资源类型', dataIndex: 'type', key: 'type'},
  {title: '描述', dataIndex: 'description', key: 'description'},
  {title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt'},
]

const subjectRoleColumns = [
  {title: '主体类型', dataIndex: 'subjectType', key: 'subjectType'},
  {title: '主体编码', dataIndex: 'subjectCode', key: 'subjectCode'},
  {title: '角色编码', dataIndex: 'roleCode', key: 'roleCode'},
  {title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt'},
  {title: '操作', key: 'action', width: 96},
]

const subjectResourceColumns = [
  {title: '主体类型', dataIndex: 'subjectType', key: 'subjectType'},
  {title: '主体编码', dataIndex: 'subjectCode', key: 'subjectCode'},
  {title: '资源类型', dataIndex: 'resourceType', key: 'resourceType'},
  {title: '资源标识', dataIndex: 'identifier', key: 'identifier'},
  {title: '描述', dataIndex: 'description', key: 'description'},
  {title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt'},
  {title: '操作', key: 'action', width: 96},
]

function resetRoleForm() {
  roleForm.code = ''
  roleForm.name = ''
  roleForm.description = ''
}

function resetSystemResourceForm() {
  systemResourceForm.identifier = ''
  systemResourceForm.resourceType = undefined
  systemResourceForm.description = ''
}

function resetSubjectRoleForm() {
  subjectRoleForm.subjectType = 'USER'
  subjectRoleForm.subjectCode = ''
  subjectRoleForm.roleCode = ''
}

function resetSubjectResourceForm() {
  subjectResourceForm.subjectType = 'USER'
  subjectResourceForm.subjectCode = ''
  subjectResourceForm.identifier = ''
  subjectResourceForm.resourceType = ''
}

function getSubjectTypeLabel(value: unknown) {
  if (value === 'USER' || value === 'ROLE') {
    return subjectTypeLabelMap[value]
  }
  return String(value ?? '')
}

function selectFilterOption(input: string, option?: SelectOption) {
  return (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
}

function ensureScopeSelected() {
  if (selectedScope.value) {
    return true
  }
  message.warning('请先选择权限域')
  return false
}

function openPrimaryModal() {
  if (!ensureScopeSelected()) {
    return
  }

  if (activeTab.value === 'roles') {
    resetRoleForm()
    roleModalOpen.value = true
    return
  }

  if (activeTab.value === 'systemResources') {
    resetSystemResourceForm()
    systemResourceModalOpen.value = true
    return
  }

  if (activeTab.value === 'subjectRoles') {
    resetSubjectRoleForm()
    subjectRoleModalOpen.value = true
    return
  }

  resetSubjectResourceForm()
  subjectResourceModalOpen.value = true
}

async function loadScopeOptions() {
  scopeLoading.value = true
  try {
    scopeList.value = await getPermissionScopes()
    const firstScope = scopeList.value[0]
    if (!selectedScope.value && firstScope) {
      selectedScope.value = firstScope.scope
    }
  } finally {
    scopeLoading.value = false
  }
}

async function loadResourceTypeOptions() {
  resourceTypeList.value = await getPermissionResourceTypes()
}

async function loadCurrentTabData() {
  if (!selectedScope.value) {
    return
  }

  const isManualRefresh = true
  if (isManualRefresh) {
    refreshing.value = true
  }
  tableLoading.value = true

  try {
    if (activeTab.value === 'roles') {
      roleList.value = await getPermissionRoles(selectedScope.value)
      return
    }

    if (activeTab.value === 'systemResources') {
      systemResourceList.value = await getSystemPermissionResources(selectedScope.value)
      return
    }

    if (activeTab.value === 'subjectRoles') {
      subjectRoleList.value = await getSubjectRoles(selectedScope.value)
      roleList.value = await getPermissionRoles(selectedScope.value)
      return
    }

    subjectResourceList.value = await getSubjectResources(selectedScope.value)
    systemResourceList.value = await getSystemPermissionResources(selectedScope.value)
  } finally {
    tableLoading.value = false
    refreshing.value = false
  }
}

function handleSubjectResourceIdentifierChange(identifier: string) {
  const currentResource = systemResourceList.value.find((item) => item.identifier === identifier)
  subjectResourceForm.resourceType = currentResource?.type ?? ''
}

async function handleCreateRole() {
  if (!ensureScopeSelected()) {
    return
  }
  if (!roleForm.code.trim() || !roleForm.name.trim()) {
    message.warning('请填写完整的角色信息')
    return
  }

  submitting.value = true
  try {
    await createPermissionRole(selectedScope.value, {
      code: roleForm.code.trim(),
      name: roleForm.name.trim(),
      description: roleForm.description.trim() || undefined,
    })
    roleModalOpen.value = false
    await loadCurrentTabData()
  } finally {
    submitting.value = false
  }
}

async function handleCreateSystemResource() {
  if (!ensureScopeSelected()) {
    return
  }
  if (!systemResourceForm.identifier.trim() || !systemResourceForm.resourceType) {
    message.warning('请填写完整的系统资源信息')
    return
  }

  submitting.value = true
  try {
    await createSystemPermissionResource(selectedScope.value, {
      identifier: systemResourceForm.identifier.trim(),
      resourceType: systemResourceForm.resourceType,
      description: systemResourceForm.description.trim() || undefined,
    })
    systemResourceModalOpen.value = false
    await loadCurrentTabData()
  } finally {
    submitting.value = false
  }
}

async function handleBindSubjectRole() {
  if (!ensureScopeSelected()) {
    return
  }
  if (!subjectRoleForm.subjectCode.trim() || !subjectRoleForm.roleCode) {
    message.warning('请填写完整的主体角色绑定信息')
    return
  }

  submitting.value = true
  try {
    await bindSubjectRole(selectedScope.value, {
      subjectType: subjectRoleForm.subjectType,
      subjectCode: subjectRoleForm.subjectCode.trim(),
      roleCode: subjectRoleForm.roleCode,
    })
    subjectRoleModalOpen.value = false
    await loadCurrentTabData()
  } finally {
    submitting.value = false
  }
}

async function handleBindSubjectResource() {
  if (!ensureScopeSelected()) {
    return
  }
  if (!subjectResourceForm.subjectCode.trim() || !subjectResourceForm.identifier || !subjectResourceForm.resourceType) {
    message.warning('请填写完整的主体资源绑定信息')
    return
  }

  submitting.value = true
  try {
    await bindSubjectResource(selectedScope.value, {
      subjectType: subjectResourceForm.subjectType,
      subjectCode: subjectResourceForm.subjectCode.trim(),
      identifier: subjectResourceForm.identifier,
      resourceType: subjectResourceForm.resourceType,
    })
    subjectResourceModalOpen.value = false
    await loadCurrentTabData()
  } finally {
    submitting.value = false
  }
}

async function handleUnbindSubjectRole(record: PermissionSubjectRoleItem) {
  if (!ensureScopeSelected()) {
    return
  }

  await unbindSubjectRole(selectedScope.value, {
    subjectType: record.subjectType,
    subjectCode: record.subjectCode,
    roleCode: record.roleCode,
  })
  await loadCurrentTabData()
}

async function handleUnbindSubjectResource(record: PermissionSubjectResourceItem) {
  if (!ensureScopeSelected()) {
    return
  }

  await unbindSubjectResource(selectedScope.value, {
    subjectType: record.subjectType,
    subjectCode: record.subjectCode,
    identifier: record.identifier,
    resourceType: record.resourceType,
  })
  await loadCurrentTabData()
}

watch([selectedScope, activeTab], async ([scope]) => {
  if (!scope) {
    return
  }
  await loadCurrentTabData()
})

onMounted(async () => {
  await Promise.all([loadScopeOptions(), loadResourceTypeOptions()])
})
</script>

<style scoped>
.permission-manager {
  min-height: 100%;
  padding: 24px;
  background:
      radial-gradient(circle at top left, rgba(64, 150, 255, 0.14), transparent 32%),
      radial-gradient(circle at top right, rgba(22, 119, 255, 0.1), transparent 28%),
      v-bind('token.colorBgLayout');
}

.hero-panel,
.manager-card {
  border: 1px solid v-bind('token.colorBorderSecondary');
  background: color-mix(in srgb, v-bind('token.colorBgContainer') 88%, white 12%);
  box-shadow: v-bind('token.boxShadowSecondary');
  backdrop-filter: blur(10px);
}

.hero-panel {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  padding: 28px 32px;
  border-radius: 24px;
  margin-bottom: 20px;
}

.hero-copy {
  max-width: 560px;
}

.eyebrow {
  margin: 0 0 10px;
  color: v-bind('token.colorPrimary');
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.page-title {
  margin: 0;
  color: v-bind('token.colorText');
  font-size: 34px;
  line-height: 1.05;
  font-weight: 700;
}

.page-subtitle {
  margin: 12px 0 0;
  color: v-bind('token.colorTextSecondary');
  font-size: 14px;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.scope-select {
  width: 280px;
}

.manager-card {
  border-radius: 28px;
  padding: 18px 20px 24px;
}

.manager-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 12px;
}

.manager-tabs :deep(.ant-tabs-tab) {
  padding: 10px 0 14px;
  font-weight: 600;
}

.scope-banner {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  margin-bottom: 16px;
  border-radius: 999px;
  color: v-bind('token.colorText');
  background: v-bind('token.colorBgTextHover');
}

.scope-label {
  color: v-bind('token.colorTextSecondary');
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

:deep(.ant-table-wrapper) {
  overflow: hidden;
  border-radius: 18px;
}

:deep(.ant-table-thead > tr > th) {
  font-weight: 700;
}

@media (max-width: 960px) {
  .permission-manager {
    padding: 16px;
  }

  .hero-panel {
    flex-direction: column;
    align-items: stretch;
    padding: 20px;
    border-radius: 20px;
  }

  .page-title {
    font-size: 28px;
  }

  .hero-actions {
    justify-content: stretch;
  }

  .scope-select {
    width: 100%;
  }

  .manager-card {
    padding: 14px;
    border-radius: 20px;
  }

  .scope-banner {
    width: 100%;
    justify-content: space-between;
    margin-bottom: 12px;
  }
}
</style>
