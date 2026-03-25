import appApi from '@api/base'

export type PermissionResourceType = 'API' | 'PAGE' | 'PATH'
export type PermissionSubjectType = 'USER' | 'ROLE'

export interface PermissionResourceTypeItem {
    name: PermissionResourceType
    description: string
}

export interface SecurityScopeItem {
    scope: string
    name: string
    pathPattern: string
}

export interface CreateRoleParams {
    code: string
    name: string
    description?: string
}

export interface PermissionRoleItem {
    id: string
    code: string
    name: string
    scope: string
    description?: string | null
    updatedAt: string
}

export interface PermissionSubjectRoleItem {
    id: string
    subjectType: PermissionSubjectType
    subjectCode: string
    roleCode: string
    scope: string
    updatedAt: string
}

export interface CreateSystemResourceParams {
    identifier: string
    resourceType: PermissionResourceType
    description?: string
}

export interface PermissionResourceItem {
    id: string
    type: PermissionResourceType
    identifier: string
    description?: string | null
    updatedAt: string
}

export interface PermissionSubjectResourceItem {
    id: string
    subjectCode: string
    subjectType: PermissionSubjectType
    resourceId: string
    resourceType: PermissionResourceType
    identifier: string
    description?: string | null
    mask?: string | null
    updatedAt: string
}

export interface SubjectRoleBindParams {
    subjectType: PermissionSubjectType
    subjectCode: string
    roleCode: string
}

export interface SubjectResourceBindParams {
    subjectCode: string
    subjectType: PermissionSubjectType
    identifier: string
    resourceType: PermissionResourceType
}

/**
 * 获取资源类型列表
 */
export function getPermissionResourceTypes() {
    return appApi.get<PermissionResourceTypeItem[]>('/admin/permission/resource/type')
}

/**
 * 获取权限域列表
 */
export function getPermissionScopes() {
    return appApi.get<SecurityScopeItem[]>('/admin/permission/scope')
}

/**
 * 添加角色
 */
export function createPermissionRole(scope: string, data: CreateRoleParams) {
    return appApi.put<PermissionRoleItem>(`/admin/permission/${scope}/role`, data)
}

/**
 * 获取角色列表
 */
export function getPermissionRoles(scope: string) {
    return appApi.get<PermissionRoleItem[]>(`/admin/permission/${scope}/role`)
}

/**
 * 添加系统资源
 */
export function createSystemPermissionResource(scope: string, data: CreateSystemResourceParams) {
    return appApi.put<PermissionResourceItem>(`/admin/permission/${scope}/system/resource`, data)
}

/**
 * 获取系统资源列表
 */
export function getSystemPermissionResources(scope: string) {
    return appApi.get<PermissionResourceItem[]>(`/admin/permission/${scope}/system/resource`)
}

/**
 * 绑定主体角色
 */
export function bindSubjectRole(scope: string, data: SubjectRoleBindParams) {
    return appApi.post<boolean>(`/admin/permission/${scope}/subject/role/bind`, data)
}

/**
 * 解绑主体角色
 */
export function unbindSubjectRole(scope: string, data: SubjectRoleBindParams) {
    return appApi.post<boolean>(`/admin/permission/${scope}/subject/role/unbind`, data)
}

/**
 * 获取主体角色列表
 */
export function getSubjectRoles(scope: string) {
    return appApi.get<PermissionSubjectRoleItem[]>(`/admin/permission/${scope}/subject/role`)
}

/**
 * 绑定主体资源
 */
export function bindSubjectResource(scope: string, data: SubjectResourceBindParams) {
    return appApi.post<boolean>(`/admin/permission/${scope}/subject/resource/bind`, data)
}

/**
 * 解绑主体资源
 */
export function unbindSubjectResource(scope: string, data: SubjectResourceBindParams) {
    return appApi.post<boolean>(`/admin/permission/${scope}/subject/resource/unbind`, data)
}

/**
 * 获取主体资源列表
 */
export function getSubjectResources(scope: string) {
    return appApi.get<PermissionSubjectResourceItem[]>(`/admin/permission/${scope}/subject/resource`)
}
