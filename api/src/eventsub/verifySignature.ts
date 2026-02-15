import crypto from 'crypto'
import type { Request } from 'express'

const TWITCH_SECRET = process.env.TWITCH_EVENTSUB_SECRET!

export function verifyTwitchSignature(req: Request, rawBody: Buffer) {
  const messageId = req.header('Twitch-Eventsub-Message-Id')
  const timestamp = req.header('Twitch-Eventsub-Message-Timestamp')
  const signature = req.header('Twitch-Eventsub-Message-Signature')

  console.log('🔍 [EventSub] Headers:', { messageId, timestamp, signature })

  if (!messageId || !timestamp || !signature) {
    throw new Error('Missing Twitch headers')
  }

  // const hmacMessage = messageId + timestamp + rawBody
  const hmacMessage = Buffer.concat([
    Buffer.from(messageId),
    Buffer.from(timestamp),
    rawBody
  ])

  const computed = 'sha256=' + crypto
    .createHmac('sha256', TWITCH_SECRET)
    .update(hmacMessage)
    .digest('hex')

  console.log('🔐 [EventSub] Signature esperada:', computed)
  console.log('🔐 [EventSub] Signature recebida:', signature)

  if (
    !crypto.timingSafeEqual(
      Buffer.from(computed),
      Buffer.from(signature),
    )
  ) {
    console.error('❌ [EventSub] Assinatura inválida')
    throw new Error('Invalid Twitch signature')
  }
  console.log('✅ [EventSub] Assinatura válida')
}