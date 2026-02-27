export type GlobalRole = 'owner' | 'admin' | 'moderator' | 'support' | 'user'
export type UserStatus = 'online' | 'away' | 'dnd' | 'offline'
export type ChannelType = 'text' | 'voice'
export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected'
export type ReportStatus = 'open' | 'resolved' | 'dismissed'

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string
  status: UserStatus
  global_role: GlobalRole
  created_at: string
}

export interface Server {
  id: string
  name: string
  icon_url: string | null
  description: string
  owner_id: string
  is_locked: boolean
  created_at: string
}

export interface ServerMember {
  id: string
  server_id: string
  user_id: string
  joined_at: string
  profiles?: Profile
}

export interface ServerRole {
  id: string
  server_id: string
  name: string
  color: string
  position: number
  permissions: RolePermissions
  created_at: string
}

export interface RolePermissions {
  manage_channels: boolean
  manage_roles: boolean
  kick_members: boolean
  ban_members: boolean
  manage_messages: boolean
  view_logs: boolean
  administrator: boolean
}

export interface MemberRole {
  id: string
  member_id: string
  role_id: string
  server_roles?: ServerRole
}

export interface ChannelCategory {
  id: string
  server_id: string
  name: string
  position: number
  created_at: string
  channels?: Channel[]
}

export interface Channel {
  id: string
  server_id: string
  category_id: string | null
  name: string
  type: ChannelType
  topic: string
  position: number
  created_at: string
}

export interface Message {
  id: string
  channel_id: string
  author_id: string
  content: string
  edited_at: string | null
  created_at: string
  profiles?: Profile
  message_reactions?: MessageReaction[]
}

export interface MessageReaction {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
}

export interface DmConversation {
  id: string
  created_at: string
  dm_participants?: DmParticipant[]
  direct_messages?: DirectMessage[]
}

export interface DmParticipant {
  id: string
  conversation_id: string
  user_id: string
  profiles?: Profile
}

export interface DirectMessage {
  id: string
  conversation_id: string
  author_id: string
  content: string
  created_at: string
  profiles?: Profile
}

export interface FriendRequest {
  id: string
  from_user_id: string
  to_user_id: string
  status: FriendRequestStatus
  created_at: string
  from_profile?: Profile
  to_profile?: Profile
}

export interface Report {
  id: string
  reporter_id: string
  reported_user_id: string
  server_id: string | null
  reason: string
  status: ReportStatus
  resolved_by: string | null
  created_at: string
  reporter?: Profile
  reported_user?: Profile
  server?: Server
}

export interface GlobalBan {
  id: string
  user_id: string
  banned_by: string
  reason: string
  created_at: string
  profile?: Profile
  banned_by_profile?: Profile
}

export interface ServerBan {
  id: string
  server_id: string
  user_id: string
  banned_by: string
  reason: string
  created_at: string
}
