import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  try {
   const salt = await bcrypt.genSalt(SALT_ROUNDS)
    return bcrypt.hash(password, salt) 
  } catch (exception) {
    console.error("Erro ao gerar senha")
    throw new Error("Erro ao gerar senha")
  }
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return bcrypt.compare(password, hashedPassword)
  } catch(exception) {
    console.error("Erro ao comparar senha")
    throw new Error("Erro ao comparar senha")
  }
}