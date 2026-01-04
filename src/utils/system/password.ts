import bcrypt from 'bcryptjs'
import { AppError } from '../../errors/AppError.js'

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    return bcrypt.hash(password, salt) 
  } catch (error) {
    console.warn(`Erro ao gerar hash da senha: ${error}`)
    throw new AppError("Erro ao gerar senha", 500)
  }
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return bcrypt.compare(password, hashedPassword)
  } catch(error: any) {
    console.warn(`Erro ao comparar senha: ${error}`)
    throw new AppError("Erro ao gerar senha", 500)
  }
}