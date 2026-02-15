import type { Request, Response } from 'express'
import { verifyTwitchSignature } from './verifySignature.js'
import { handleChatMessage, handleStreamOffline } from './chat.js'

const processedEvents = new Set<string>()

export async function eventSubHandler(req: Request, res: Response) {

  const messageId = req.header('Twitch-Eventsub-Message-Id')
  const messageType = req.header('Twitch-Eventsub-Message-Type')

  if (!messageId) {
    console.warn('⚠️ EventSub sem Message-Id')
    console.log('Headers recebidos:', req.headers)
    return res.sendStatus(400)
  }

  // 🔥 Handshake deve vir ANTES da verificação de assinatura
  if (messageType === 'webhook_callback_verification') {
    console.log('🤝 EventSub handshake recebido')
    console.log('Challenge:', req.body.challenge)
    return res.status(200).send(req.body.challenge)
  }

  // 🚫 Evita reprocessar eventos duplicados
  if (processedEvents.has(messageId)) {
    return res.sendStatus(204)
  }

  processedEvents.add(messageId)

  // Limpa cache depois de 10 minutos
  setTimeout(() => processedEvents.delete(messageId), 10 * 60_000)

  const rawBody = (req as any).rawBody

  if (!rawBody) {
    console.error('❌ rawBody não encontrado')
    return res.sendStatus(400)
  }

  // 🔐 Verifica assinatura Twitch
  try {
    verifyTwitchSignature(req, rawBody)
  } catch (err) {
    console.error('❌ Assinatura inválida')
    return res.sendStatus(403)
  }

  // 📩 Notificações reais
  if (messageType === 'notification') {
    const { subscription, event } = req.body

    console.log('📩 [EventSub] Evento recebido:', subscription.type)

    if (subscription.type === 'channel.chat.message') {

      console.log('💬 Mensagem:', {
        user: event.chatter_user_login,
        channel: event.broadcaster_user_login,
        text: event.message?.text,
      })

      await handleChatMessage(event)
    }

    if (subscription.type === 'stream.offline') {
      await handleStreamOffline(event)
    }

    return res.sendStatus(204)
  }

  return res.sendStatus(204)
}