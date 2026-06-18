import bcrypt from 'bcryptjs'

export function slugify(text: string): string {
  const slug = text
    .toString()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+/g, '')
    .replace(/\-\-+/g, '-')
    .toLowerCase()
  
  // 如果 slug 为空（例如纯中文标题被过滤），使用原始标题的简化版本
  if (!slug || slug === '-') {
    return text
      .toString()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-\u4e00-\u9fa5]+/g, '')
      .slice(0, 50) || 'post'
  }
  
  return slug
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}