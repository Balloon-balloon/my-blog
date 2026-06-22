import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface SeedData {
  User: any[]
  Category: any[]
  Post: any[]
  Tag: any[]
  _PostToTag: any[]
  Comment: any[]
  Like: any[]
  Favorite: any[]
}

function fixTimestamps(data: any): any {
  if (data && typeof data === 'object') {
    for (const key of Object.keys(data)) {
      if (key === 'createdAt' || key === 'updatedAt') {
        if (typeof data[key] === 'number') {
          data[key] = new Date(data[key])
        }
      } else if (typeof data[key] === 'object') {
        fixTimestamps(data[key])
      }
    }
  }
  return data
}

function fixBooleans(data: any): any {
  if (data && typeof data === 'object') {
    for (const key of Object.keys(data)) {
      if (key === 'published' || key === 'isGuest') {
        data[key] = data[key] === 1 || data[key] === true
      } else if (typeof data[key] === 'object') {
        fixBooleans(data[key])
      }
    }
  }
  return data
}

async function main() {
  console.log('🌱 Starting data migration...')

  const seedDataPath = path.join(__dirname, 'seed-data.json')
  if (!fs.existsSync(seedDataPath)) {
    console.log('No seed data found. Skipping migration.')
    return
  }

  const raw = fs.readFileSync(seedDataPath, 'utf-8')
  const data: SeedData = JSON.parse(raw)

  // Import in order: User -> Category -> Post -> Tag -> _PostToTag -> Comment -> Like -> Favorite
  for (const user of data.User) {
    const prepared = fixBooleans(fixTimestamps({ ...user, id: undefined }))
    await prisma.user.create({ data: prepared })
    console.log(`  ✓ User: ${user.username || user.email}`)
  }

  for (const cat of data.Category) {
    const prepared = fixTimestamps({ ...cat, id: undefined })
    await prisma.category.create({ data: prepared })
    console.log(`  ✓ Category: ${cat.name}`)
  }

  for (const post of data.Post) {
    const prepared = fixBooleans(fixTimestamps({
      ...post,
      id: undefined,
      tags: undefined,
    }))
    await prisma.post.create({ data: prepared })
    console.log(`  ✓ Post: ${post.title}`)
  }

  for (const tag of data.Tag) {
    await prisma.tag.create({
      data: fixTimestamps({ ...tag, id: undefined })
    })
    console.log(`  ✓ Tag: ${tag.name}`)
  }

  // Connect PostToTag
  for (const rel of data._PostToTag) {
    await prisma.post.update({
      where: { id: rel.A },
      data: { tags: { connect: { id: rel.B } } },
    })
  }

  for (const comment of data.Comment) {
    const prepared = fixBooleans(fixTimestamps({
      ...comment,
      id: undefined,
    }))
    try {
      await prisma.comment.create({ data: prepared })
      console.log(`  ✓ Comment #${comment.id}`)
    } catch (e: any) {
      console.log(`  ✗ Comment #${comment.id}: ${e.message}`)
    }
  }

  for (const like of data.Like) {
    const prepared = fixTimestamps({ ...like, id: undefined })
    try {
      await prisma.like.create({ data: prepared })
      console.log(`  ✓ Like #${like.id}`)
    } catch (e: any) {
      console.log(`  ✗ Like #${like.id}: ${e.message}`)
    }
  }

  for (const fav of data.Favorite) {
    const prepared = fixTimestamps({ ...fav, id: undefined })
    try {
      await prisma.favorite.create({ data: prepared })
      console.log(`  ✓ Favorite #${fav.id}`)
    } catch (e: any) {
      console.log(`  ✗ Favorite #${fav.id}: ${e.message}`)
    }
  }

  console.log('\n✅ Data migration completed!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
