"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

async function getSession() {
  return await getServerSession(authOptions)
}

// Tasks
export async function getTasks() {
  const session = await getSession()
  if (!session?.user?.id) return []
  const tasks = await prisma.task.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } })
  return JSON.parse(JSON.stringify(tasks))
}

export async function createTask(data: { title: string; priority: string }) {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Unauthorized")
  const task = await prisma.task.create({ data: { ...data, userId: session.user.id } })
  return JSON.parse(JSON.stringify(task))
}

export async function updateTask(id: string, data: { title?: string; completed?: boolean; priority?: string }) {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Unauthorized")
  const task = await prisma.task.update({ where: { id, userId: session.user.id }, data })
  return JSON.parse(JSON.stringify(task))
}

export async function deleteTask(id: string) {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Unauthorized")
  const task = await prisma.task.delete({ where: { id, userId: session.user.id } })
  return JSON.parse(JSON.stringify(task))
}

