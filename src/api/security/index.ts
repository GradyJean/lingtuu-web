import appApi from '@api/base'

export interface HasPagePermissionParams {
    path: string
}

export function hasPagePermission(params: HasPagePermissionParams): Promise<boolean> {
    return appApi.get<boolean>('/api/permission/hasPagePermission', params, {silent: true})
}
