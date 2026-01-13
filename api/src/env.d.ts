declare namespace NodeJS {
  interface ProcessEnv {
    SERVER_PORT?: string;
    TWITCH_CLIENT_ID: string;
    TWITCH_CLIENT_SECRET: string;
    DATABASE_URL: string;
  }
}