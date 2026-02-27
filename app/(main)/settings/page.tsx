'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { updateProfile } from '@/lib/queries/profiles'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import type { Profile } from '@/lib/types'

export default function SettingsPage() {
  const { profile, loading } = useAuth()
  const [data, setData] = useState<Partial<Profile>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setData(profile)
    }
  }, [profile])

  const handleSave = async () => {
    if (!profile) return
    try {
      setSaving(true)
      await updateProfile({
        display_name: data.display_name,
        bio: data.bio,
        banner_color: data.banner_color,
      })
      toast.success('Profile updated')
    } catch (error) {
      toast.error('Failed to update profile')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-4">Loading...</div>
  if (!profile) return <div className="p-4">Not authenticated</div>

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <UserAvatar src={profile.avatar_url} username={profile.username} size="lg" />
            <div>
              <p className="font-semibold">{profile.username}</p>
              <p className="text-sm text-muted-foreground">{profile.global_role}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input
              value={data.display_name || ''}
              onChange={(e) => setData({ ...data, display_name: e.target.value })}
              placeholder="Your display name"
            />
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              value={data.bio || ''}
              onChange={(e) => setData({ ...data, bio: e.target.value })}
              placeholder="Tell us about yourself"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Banner Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={data.banner_color || '#4c1d95'}
                onChange={(e) => setData({ ...data, banner_color: e.target.value })}
                className="h-10 w-20 cursor-pointer"
              />
              <Input
                type="text"
                value={data.banner_color || ''}
                onChange={(e) => setData({ ...data, banner_color: e.target.value })}
                placeholder="#4c1d95"
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
