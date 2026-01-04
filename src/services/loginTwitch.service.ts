import prisma from "../lib/prisma.js";
import { exchangeCodeForToken, fetchTwitchUser } from "../clients/twitch.client.js";

export async function loginTwitchService(code: string) {

  const { access_token, refresh_token, expires_in } = await exchangeCodeForToken(code);
  console.log("access_token: ", access_token)
  const twitchUser = await fetchTwitchUser(access_token);
  console.log("twitchUser: ", twitchUser)
  const user = await prisma.user.upsert({
    where: { twitchId: twitchUser.id },
    update: {},
    create: {
      twitchId: twitchUser.id,
      username: twitchUser.login,
      email: twitchUser.email ?? null,
      avatar: twitchUser.profile_image_url ?? null,
    },
  });
  console.log("user: ", user)
  const log = await prisma.loginHistory.create({
    data: {
      userId: user.id,
    },
  });
  console.log("log: ", log)
  return user;
}