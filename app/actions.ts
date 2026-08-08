"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

import { encrypt, decrypt } from "@/lib/encryption"

async function getSession() {
  return await getServerSession(authOptions)
}

// Tasks
export async function getTasks() {
  const session = await getSession()
  if (!session?.user?.id) return []
  const tasks = await prisma.task.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } })
  
  // Decrypt titles before sending to client
  const decryptedTasks = tasks.map(task => ({
    ...task,
    title: decrypt(task.title)
  }))
  
  return JSON.parse(JSON.stringify(decryptedTasks))
}

export async function createTask(data: { title: string; priority: string }) {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const encryptedTitle = encrypt(data.title)
  
  const task = await prisma.task.create({ 
    data: { ...data, title: encryptedTitle, userId: session.user.id } 
  })
  
  return JSON.parse(JSON.stringify({ ...task, title: data.title }))
}

export async function updateTask(id: string, data: { title?: string; completed?: boolean; priority?: string }) {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const updateData = { ...data }
  if (updateData.title) {
    updateData.title = encrypt(updateData.title)
  }
  
  const task = await prisma.task.update({ where: { id, userId: session.user.id }, data: updateData })
  
  return JSON.parse(JSON.stringify({
    ...task,
    title: task.title ? decrypt(task.title) : task.title
  }))
}

export async function deleteTask(id: string) {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Unauthorized")
  const task = await prisma.task.delete({ where: { id, userId: session.user.id } })
  return JSON.parse(JSON.stringify(task))
}

