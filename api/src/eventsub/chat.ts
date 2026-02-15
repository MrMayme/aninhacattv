import prisma from '../lib/prisma.js'

const lastMessageAt = new Map<string, number>()
const MESSAGE_INTERVAL = 2000 // 2s

export async function handleChatMessage(event: any) {

  const userKey = `${event.chatter_user_id}:${event.broadcaster_user_id}`
  console.log("userKey: ", userKey)
  const now = Date.now()

  const last = lastMessageAt.get(userKey) ?? 0
  if (now - last < MESSAGE_INTERVAL) {
    console.log('🚫 Spam ignorado de', event.chatter_user_login)
    return
  }

  lastMessageAt.set(userKey, now)

  // daqui pra baixo que vale mesmo
  const twitchUserId = event.chatter_user_id
  const username = event.chatter_user_login
  const channel = event.broadcaster_user_login

  console.log('💬 Contando mensagem de', event.chatter_user_login)

  // Garante usuário
  const user = await prisma.user.upsert({
    where: { twitchId: twitchUserId },
    update: {},
    create: {
      twitchId: twitchUserId,
      username,
    },
  })
  // ou findFirst twitchUserId

  // Busca sessão ativa
  const session = await prisma.chatSession.findFirst({
    where: {
      userId: user.id,
      channel,
      endedAt: null,
    },
  })

  // Cria ou incrementa
  if (!session) {
    await prisma.chatSession.create({
      data: {
        userId: user.id,
        channel,
        startedAt: new Date(),
        messageCount: 1,
      },
    })
    return
  }

  await prisma.chatSession.update({
    where: { id: session.id },
    data: {
      messageCount: { increment: 1 },
    },
  })
  
}

export async function handleStreamOffline(event: any) {
  const channel = event.broadcaster_user_login

  await prisma.chatSession.updateMany({
    where: {
      channel,
      endedAt: null,
    },
    data: {
      endedAt: new Date(),
    },
  })
}