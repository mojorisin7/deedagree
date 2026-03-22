import { nanoid } from 'nanoid'

export const generateInviteToken = () => nanoid(32)

export const INVITE_EXPIRY_DAYS = 7

export const getInviteExpiry = () =>
  new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
