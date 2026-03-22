'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Loader2, User, Key } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [name, setName] = useState(session?.user?.name ?? '')
  const [nameLoading, setNameLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  const handleUpdateName = async () => {
    setNameLoading(true)
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    setNameLoading(false)
    if (res.ok) {
      await update({ name })
      toast.success('Name updated')
    } else {
      toast.error('Failed to update name')
    }
  }

  const handleChangePassword = async () => {
    if (!password || !newPassword) return
    setPwLoading(true)
    const res = await fetch('/api/user/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: password, newPassword }),
    })
    setPwLoading(false)
    if (res.ok) {
      setPassword('')
      setNewPassword('')
      toast.success('Password changed')
    } else {
      const body = await res.json()
      toast.error(body.error ?? 'Failed to change password')
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-serif font-bold text-slate-900">Settings</h2>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-serif flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </CardTitle>
          <CardDescription>Update your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input value={session?.user?.email ?? ''} disabled className="bg-slate-50" />
            <p className="text-xs text-slate-500">Email cannot be changed</p>
          </div>
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <Button onClick={handleUpdateName} disabled={nameLoading || !name.trim()}>
            {nameLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Name
          </Button>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-serif flex items-center gap-2">
            <Key className="h-4 w-4" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 characters" />
          </div>
          <Button onClick={handleChangePassword} disabled={pwLoading || !password || newPassword.length < 8}>
            {pwLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Change Password
          </Button>
        </CardContent>
      </Card>

      <Toaster richColors position="top-right" />
    </div>
  )
}
