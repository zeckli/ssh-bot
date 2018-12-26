export interface BaseItem {
  [key: string]: any
}

export type Command =
  | 'add'
  | 'connect'
  | 'edit'
  | 'help'
  | 'init'
  | 'list'
  | 'remove'
  | 'reset'
  | 'version'

export interface Config {
  hosts: Host[]
}

export interface ConfigInfo {
  path: string
  file: string
}

export interface Host {
  host: string
  hostName: string
  user: string
  identityFile: string
}
