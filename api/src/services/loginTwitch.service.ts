import prisma from "../lib/prisma.js";
import { exchangeCodeForToken, fetchTwitchUser } from "../clients/twitch.client.js";

export async function loginTwitchService(code: string) {

  const { access_token, refresh_token, expires_in } = await exchangeCodeForToken(code);
  console.log("access_token: ", access_token)
  const twitchUser = await fetchTwitchUser(access_token);
  console.log("twitchUser: ", twitchUser)
  const user = await prisma.user.upsert({
    where: { twitchId: twitchUser.id },
    update: {
      username: twitchUser.login,
      avatar: twitchUser.profile_image_url ?? null,
      email: twitchUser.email ?? null,
    },
    create: {
      twitchId: twitchUser.id,
      username: twitchUser.login,
      email: twitchUser.email ?? null,
      avatar: twitchUser.profile_image_url ?? null,
    },
  });

  console.log("user: ", user)
  await prisma.twitchToken.upsert({
    where: { userId: user.id },
    update: {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: new Date(Date.now() + expires_in * 1000),
    },
    create: {
      userId: user.id,
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: new Date(Date.now() + expires_in * 1000),
    },
  })
  
  const log = await prisma.loginHistory.create({
    data: {
      userId: user.id,
    },
  });
  console.log("log: ", log)
  
}