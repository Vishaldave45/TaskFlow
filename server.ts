import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import path from 'path'
import { createServer as createViteServer } from 'vite'

interface UserRecord {
  id: number
  email: string
  username: string
  passwordHash: string
  created_at: string
}

interface ProjectRecord {
  id: number
  name: string
  description: string
  owner_id: number
  created_at: string
  updated_at: string
}

interface ProjectMemberRecord {
  id: number
  project_id: number
  user_id: number
  created_at: string
}

interface TaskRecord {
  id: number
  project_id: number
  creator_id: number
  assignee_id: number | null
  title: string
  description: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  due_date: string | null
  created_at: string
  updated_at: string
}

interface CommentRecord {
  id: number
  task_id: number
  author_id: number
  content: string
  created_at: string
  updated_at: string
}

interface ActivityRecord {
  id: number
  task_id: number
  user_id: number
  action: string
  details: Record<string, unknown>
  created_at: string
}

const JWT_SECRET = process.env.JWT_SECRET || 'taskflow_dev_secret_key_2026'

// In-Memory Database
const users: UserRecord[] = [
  {
    id: 1,
    email: 'alex@taskflow.dev',
    username: 'alex_lead',
    passwordHash: bcrypt.hashSync('password123', 10),
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 2,
    email: 'sarah@taskflow.dev',
    username: 'sarah_dev',
    passwordHash: bcrypt.hashSync('password123', 10),
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 3,
    email: 'marcus@taskflow.dev',
    username: 'marcus_qa',
    passwordHash: bcrypt.hashSync('password123', 10),
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 4,
    email: 'demo@taskflow.dev',
    username: 'demo_user',
    passwordHash: bcrypt.hashSync('password123', 10),
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
]

const projects: ProjectRecord[] = [
  {
    id: 1,
    name: 'Core Platform Infrastructure',
    description: 'Cloud microservices migration, IAM role permissions, and zero-downtime release automation.',
    owner_id: 1,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 2,
    name: 'Mobile App Redesign Sprint',
    description: 'Refactoring mobile workspace navigation, touch interactions, and offline caching.',
    owner_id: 4,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const projectMembers: ProjectMemberRecord[] = [
  { id: 1, project_id: 1, user_id: 2, created_at: new Date(Date.now() - 13 * 86400000).toISOString() },
  { id: 2, project_id: 1, user_id: 3, created_at: new Date(Date.now() - 13 * 86400000).toISOString() },
  { id: 3, project_id: 1, user_id: 4, created_at: new Date(Date.now() - 12 * 86400000).toISOString() },
  { id: 4, project_id: 2, user_id: 1, created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: 5, project_id: 2, user_id: 2, created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
]

const tasks: TaskRecord[] = [
  {
    id: 1,
    project_id: 1,
    creator_id: 1,
    assignee_id: 1,
    title: 'Configure automated production CI/CD pipelines',
    description: 'Set up GitHub Actions to execute automated test suites and deploy to container clusters.',
    status: 'DONE',
    priority: 'HIGH',
    due_date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 2,
    project_id: 1,
    creator_id: 1,
    assignee_id: 2,
    title: 'Migrate session authentication to secure stateless JWTs',
    description: 'Standardize authorization headers and token expiration handling across API consumers.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    project_id: 1,
    creator_id: 2,
    assignee_id: 4,
    title: 'Build interactive Kanban board interface',
    description: 'Enable real-time task movement between status lanes and quick filter toggles.',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    project_id: 1,
    creator_id: 1,
    assignee_id: 3,
    title: 'Perform load testing and query index analysis',
    description: 'Benchmark database read/write throughput during high concurrent user activity.',
    status: 'TODO',
    priority: 'LOW',
    due_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 5,
    project_id: 2,
    creator_id: 4,
    assignee_id: 4,
    title: 'Design high-contrast dark and light mode UI tokens',
    description: 'Revise theme palette tokens according to typography hierarchy standards.',
    status: 'DONE',
    priority: 'HIGH',
    due_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 6,
    project_id: 2,
    creator_id: 4,
    assignee_id: 1,
    title: 'Integrate offline optimistic task status updates',
    description: 'Cache mutation events locally and retry on reconnect.',
    status: 'TODO',
    priority: 'MEDIUM',
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
]

const comments: CommentRecord[] = [
  {
    id: 1,
    task_id: 2,
    author_id: 1,
    content: 'Ensure refresh token rotation is enabled to prevent replay attacks.',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 2,
    task_id: 2,
    author_id: 2,
    content: 'Updated interceptors in client.ts to seamlessly handle transparent refresh.',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 3,
    task_id: 3,
    author_id: 4,
    content: 'Kanban columns and filters are working nicely on all screen sizes.',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
]

const activityLogs: ActivityRecord[] = [
  {
    id: 1,
    task_id: 2,
    user_id: 1,
    action: 'CREATED',
    details: { title: 'Migrate session authentication to secure stateless JWTs' },
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 2,
    task_id: 2,
    user_id: 2,
    action: 'STATUS_CHANGED',
    details: { old_status: 'TODO', new_status: 'IN_PROGRESS' },
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 3,
    task_id: 3,
    user_id: 2,
    action: 'CREATED',
    details: { title: 'Build interactive Kanban board interface' },
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 4,
    task_id: 3,
    user_id: 4,
    action: 'STATUS_CHANGED',
    details: { old_status: 'TODO', new_status: 'IN_PROGRESS' },
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
]

let nextUserId = 5
let nextProjectId = 3
let nextMemberId = 6
let nextTaskId = 7
let nextCommentId = 4
let nextActivityId = 5

// Helper formatters
function toUserDto(user: UserRecord) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    created_at: user.created_at,
  }
}

function toProjectDto(project: ProjectRecord) {
  const owner = users.find((u) => u.id === project.owner_id) || users[0]
  const members = projectMembers.filter((pm) => pm.project_id === project.id)
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    owner: toUserDto(owner),
    members_count: members.length + 1, // Owner + added members
    created_at: project.created_at,
    updated_at: project.updated_at,
  }
}

function toTaskDto(task: TaskRecord) {
  const creator = users.find((u) => u.id === task.creator_id) || users[0]
  const assignee = task.assignee_id ? users.find((u) => u.id === task.assignee_id) : null
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    project_id: task.project_id,
    creator: toUserDto(creator),
    assignee: assignee ? toUserDto(assignee) : null,
    due_date: task.due_date,
    created_at: task.created_at,
    updated_at: task.updated_at,
  }
}

function toCommentDto(comment: CommentRecord) {
  const author = users.find((u) => u.id === comment.author_id) || users[0]
  return {
    id: comment.id,
    task: comment.task_id,
    author: toUserDto(author),
    content: comment.content,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
  }
}

function toActivityDto(act: ActivityRecord) {
  const user = users.find((u) => u.id === act.user_id) || users[0]
  return {
    id: act.id,
    task: act.task_id,
    user: toUserDto(user),
    action: act.action,
    details: act.details,
    created_at: act.created_at,
  }
}

// Token generator
function generateTokens(user: UserRecord) {
  const access = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' })
  const refresh = jwt.sign({ userId: user.id, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' })
  return { access, refresh }
}

// Auth Middleware
interface AuthRequest extends Request {
  user?: UserRecord
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Authentication credentials were not provided.' })
  }

  const token = authHeader.substring(7)
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number }
    const user = users.find((u) => u.id === payload.userId)
    if (!user) {
      return res.status(401).json({ detail: 'User not found.' })
    }
    req.user = user
    next()
  } catch {
    return res.status(401).json({ detail: 'Given token not valid for any token type' })
  }
}

async function startServer() {
  const app = express()
  const PORT = 3000

  app.use(cors())
  app.use(express.json())

  // Health endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'TaskFlow API' })
  })

  // ----------------------------------------------------
  // Auth Routes
  // ----------------------------------------------------
  app.post('/api/v1/auth/register/', (req, res) => {
    const { email, username, password } = req.body || {}
    if (!email || !username || !password) {
      return res.status(400).json({
        email: !email ? ['Email is required.'] : undefined,
        username: !username ? ['Username is required.'] : undefined,
        password: !password ? ['Password is required.'] : undefined,
      })
    }

    const existingEmail = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase())
    if (existingEmail) {
      return res.status(400).json({ email: ['User with this email already exists.'] })
    }

    const newUser: UserRecord = {
      id: nextUserId++,
      email: String(email).trim(),
      username: String(username).trim(),
      passwordHash: bcrypt.hashSync(String(password), 10),
      created_at: new Date().toISOString(),
    }
    users.push(newUser)

    res.status(201).json(toUserDto(newUser))
  })

  app.post('/api/v1/auth/login/', (req, res) => {
    const { email, password } = req.body || {}
    if (!email || !password) {
      return res.status(400).json({ detail: 'Must include "email" and "password".' })
    }

    const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase())
    if (!user || !bcrypt.compareSync(String(password), user.passwordHash)) {
      return res.status(400).json({ detail: 'No active account found with the given credentials' })
    }

    const tokens = generateTokens(user)
    res.json(tokens)
  })

  app.get('/api/v1/auth/me/', authMiddleware, (req: AuthRequest, res) => {
    res.json(toUserDto(req.user!))
  })

  app.post('/api/v1/auth/logout/', (_req, res) => {
    res.status(204).send()
  })

  app.post('/api/v1/auth/token/refresh/', (req, res) => {
    const { refresh } = req.body || {}
    if (!refresh) {
      return res.status(400).json({ detail: 'Refresh token required.' })
    }

    try {
      const payload = jwt.verify(refresh, JWT_SECRET) as { userId: number }
      const user = users.find((u) => u.id === payload.userId)
      if (!user) {
        return res.status(401).json({ detail: 'User not found' })
      }
      const tokens = generateTokens(user)
      res.json(tokens)
    } catch {
      return res.status(401).json({ detail: 'Token is invalid or expired' })
    }
  })

  // ----------------------------------------------------
  // Projects Routes
  // ----------------------------------------------------
  app.get('/api/v1/projects/', authMiddleware, (req: AuthRequest, res) => {
    const userId = req.user!.id
    const userProjects = projects.filter(
      (p) => p.owner_id === userId || projectMembers.some((pm) => pm.project_id === p.id && pm.user_id === userId),
    )
    res.json(userProjects.map(toProjectDto))
  })

  app.post('/api/v1/projects/', authMiddleware, (req: AuthRequest, res) => {
    const { name, description } = req.body || {}
    if (!name || !String(name).trim()) {
      return res.status(400).json({ name: ['This field may not be blank.'] })
    }

    const newProject: ProjectRecord = {
      id: nextProjectId++,
      name: String(name).trim(),
      description: description ? String(description).trim() : '',
      owner_id: req.user!.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    projects.push(newProject)
    res.status(201).json(toProjectDto(newProject))
  })

  app.get('/api/v1/projects/:id/', authMiddleware, (req: AuthRequest, res) => {
    const projectId = Number(req.params.id)
    const project = projects.find((p) => p.id === projectId)
    if (!project) {
      return res.status(404).json({ detail: 'Project not found.' })
    }

    const userId = req.user!.id
    const isMember = project.owner_id === userId || projectMembers.some((pm) => pm.project_id === projectId && pm.user_id === userId)
    if (!isMember) {
      return res.status(403).json({ detail: 'You do not have access to this project.' })
    }

    res.json(toProjectDto(project))
  })

  app.patch('/api/v1/projects/:id/', authMiddleware, (req: AuthRequest, res) => {
    const projectId = Number(req.params.id)
    const project = projects.find((p) => p.id === projectId)
    if (!project) {
      return res.status(404).json({ detail: 'Project not found.' })
    }

    if (project.owner_id !== req.user!.id) {
      return res.status(403).json({ detail: 'Only the project owner can update this project.' })
    }

    const { name, description } = req.body || {}
    if (name !== undefined) project.name = String(name).trim()
    if (description !== undefined) project.description = String(description).trim()
    project.updated_at = new Date().toISOString()

    res.json(toProjectDto(project))
  })

  app.delete('/api/v1/projects/:id/', authMiddleware, (req: AuthRequest, res) => {
    const projectId = Number(req.params.id)
    const projectIndex = projects.findIndex((p) => p.id === projectId)
    if (projectIndex === -1) {
      return res.status(404).json({ detail: 'Project not found.' })
    }

    const project = projects[projectIndex]
    if (project.owner_id !== req.user!.id) {
      return res.status(403).json({ detail: 'Only the project owner can delete this project.' })
    }

    projects.splice(projectIndex, 1)
    // Clean up members, tasks, comments, activity
    const pTasks = tasks.filter((t) => t.project_id === projectId)
    const pTaskIds = pTasks.map((t) => t.id)
    for (let i = tasks.length - 1; i >= 0; i--) {
      if (tasks[i].project_id === projectId) tasks.splice(i, 1)
    }
    for (let i = comments.length - 1; i >= 0; i--) {
      if (pTaskIds.includes(comments[i].task_id)) comments.splice(i, 1)
    }
    for (let i = activityLogs.length - 1; i >= 0; i--) {
      if (pTaskIds.includes(activityLogs[i].task_id)) activityLogs.splice(i, 1)
    }
    for (let i = projectMembers.length - 1; i >= 0; i--) {
      if (projectMembers[i].project_id === projectId) projectMembers.splice(i, 1)
    }

    res.status(204).send()
  })

  // Members
  app.get('/api/v1/projects/:id/members/', authMiddleware, (req: AuthRequest, res) => {
    const projectId = Number(req.params.id)
    const project = projects.find((p) => p.id === projectId)
    if (!project) {
      return res.status(404).json({ detail: 'Project not found.' })
    }

    const members = projectMembers.filter((pm) => pm.project_id === projectId)
    const result = members.map((pm) => {
      const user = users.find((u) => u.id === pm.user_id) || users[0]
      return {
        id: pm.id,
        project_id: pm.project_id,
        user: toUserDto(user),
        created_at: pm.created_at,
      }
    })
    res.json(result)
  })

  app.post('/api/v1/projects/:id/members/', authMiddleware, (req: AuthRequest, res) => {
    const projectId = Number(req.params.id)
    const project = projects.find((p) => p.id === projectId)
    if (!project) {
      return res.status(404).json({ detail: 'Project not found.' })
    }

    if (project.owner_id !== req.user!.id) {
      return res.status(403).json({ detail: 'Only the project owner can add members.' })
    }

    const { email } = req.body || {}
    if (!email) {
      return res.status(400).json({ email: ['Email is required.'] })
    }

    const targetUser = users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase())
    if (!targetUser) {
      return res.status(400).json({ email: ['No user registered with this email address.'] })
    }

    if (targetUser.id === project.owner_id) {
      return res.status(400).json({ email: ['User is already the owner of this project.'] })
    }

    const alreadyMember = projectMembers.find(
      (pm) => pm.project_id === projectId && pm.user_id === targetUser.id,
    )
    if (alreadyMember) {
      return res.status(400).json({ email: ['User is already a member of this project.'] })
    }

    const newMember: ProjectMemberRecord = {
      id: nextMemberId++,
      project_id: projectId,
      user_id: targetUser.id,
      created_at: new Date().toISOString(),
    }
    projectMembers.push(newMember)

    res.status(201).json({
      id: newMember.id,
      project_id: newMember.project_id,
      user: toUserDto(targetUser),
      created_at: newMember.created_at,
    })
  })

  app.delete('/api/v1/projects/:id/members/:userId/', authMiddleware, (req: AuthRequest, res) => {
    const projectId = Number(req.params.id)
    const targetUserId = Number(req.params.userId)
    const project = projects.find((p) => p.id === projectId)
    if (!project) {
      return res.status(404).json({ detail: 'Project not found.' })
    }

    const isOwner = project.owner_id === req.user!.id
    const isSelf = req.user!.id === targetUserId
    if (!isOwner && !isSelf) {
      return res.status(403).json({ detail: 'You do not have permission to remove this member.' })
    }

    const memberIndex = projectMembers.findIndex(
      (pm) => pm.project_id === projectId && pm.user_id === targetUserId,
    )
    if (memberIndex !== -1) {
      projectMembers.splice(memberIndex, 1)
    }

    res.status(204).send()
  })

  // ----------------------------------------------------
  // Tasks Routes
  // ----------------------------------------------------
  app.get('/api/v1/projects/:projectId/tasks/', authMiddleware, (req: AuthRequest, res) => {
    const projectId = Number(req.params.projectId)
    const project = projects.find((p) => p.id === projectId)
    if (!project) {
      return res.status(404).json({ detail: 'Project not found.' })
    }

    let projectTasks = tasks.filter((t) => t.project_id === projectId)

    // Filters
    const { status, priority, assignee_id, search } = req.query
    if (status && typeof status === 'string' && status !== 'ALL') {
      projectTasks = projectTasks.filter((t) => t.status === status)
    }
    if (priority && typeof priority === 'string' && priority !== 'ALL') {
      projectTasks = projectTasks.filter((t) => t.priority === priority)
    }
    if (assignee_id && typeof assignee_id === 'string' && assignee_id !== 'ALL') {
      if (assignee_id === 'UNASSIGNED') {
        projectTasks = projectTasks.filter((t) => !t.assignee_id)
      } else {
        projectTasks = projectTasks.filter((t) => t.assignee_id === Number(assignee_id))
      }
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase()
      projectTasks = projectTasks.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
      )
    }

    // Sort newest first
    projectTasks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    res.json(projectTasks.map(toTaskDto))
  })

  app.post('/api/v1/projects/:projectId/tasks/', authMiddleware, (req: AuthRequest, res) => {
    const projectId = Number(req.params.projectId)
    const project = projects.find((p) => p.id === projectId)
    if (!project) {
      return res.status(404).json({ detail: 'Project not found.' })
    }

    const { title, description, priority, assignee_id, due_date } = req.body || {}
    if (!title || !String(title).trim()) {
      return res.status(400).json({ title: ['This field may not be blank.'] })
    }

    const newTask: TaskRecord = {
      id: nextTaskId++,
      project_id: projectId,
      creator_id: req.user!.id,
      assignee_id: assignee_id ? Number(assignee_id) : null,
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
      status: 'TODO',
      priority: priority || 'MEDIUM',
      due_date: due_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    tasks.push(newTask)

    // Log Activity
    activityLogs.push({
      id: nextActivityId++,
      task_id: newTask.id,
      user_id: req.user!.id,
      action: 'CREATED',
      details: { title: newTask.title, priority: newTask.priority },
      created_at: new Date().toISOString(),
    })

    res.status(201).json(toTaskDto(newTask))
  })

  app.get('/api/v1/tasks/:id/', authMiddleware, (req: AuthRequest, res) => {
    const taskId = Number(req.params.id)
    const task = tasks.find((t) => t.id === taskId)
    if (!task) {
      return res.status(404).json({ detail: 'Task not found.' })
    }
    res.json(toTaskDto(task))
  })

  app.patch('/api/v1/tasks/:id/', authMiddleware, (req: AuthRequest, res) => {
    const taskId = Number(req.params.id)
    const task = tasks.find((t) => t.id === taskId)
    if (!task) {
      return res.status(404).json({ detail: 'Task not found.' })
    }

    const { title, description, status, priority, assignee_id, due_date } = req.body || {}
    const oldStatus = task.status
    const oldPriority = task.priority
    const oldAssignee = task.assignee_id

    if (title !== undefined) task.title = String(title).trim()
    if (description !== undefined) task.description = String(description).trim()
    if (status !== undefined) task.status = status
    if (priority !== undefined) task.priority = priority
    if (assignee_id !== undefined) task.assignee_id = assignee_id ? Number(assignee_id) : null
    if (due_date !== undefined) task.due_date = due_date || null
    task.updated_at = new Date().toISOString()

    // Activity Log
    if (status && status !== oldStatus) {
      activityLogs.push({
        id: nextActivityId++,
        task_id: task.id,
        user_id: req.user!.id,
        action: 'STATUS_CHANGED',
        details: { old_status: oldStatus, new_status: status },
        created_at: new Date().toISOString(),
      })
    }
    if (priority && priority !== oldPriority) {
      activityLogs.push({
        id: nextActivityId++,
        task_id: task.id,
        user_id: req.user!.id,
        action: 'PRIORITY_CHANGED',
        details: { old_priority: oldPriority, new_priority: priority },
        created_at: new Date().toISOString(),
      })
    }
    if (assignee_id !== undefined && assignee_id !== oldAssignee) {
      activityLogs.push({
        id: nextActivityId++,
        task_id: task.id,
        user_id: req.user!.id,
        action: 'ASSIGNEE_CHANGED',
        details: { assignee_id: task.assignee_id },
        created_at: new Date().toISOString(),
      })
    }

    res.json(toTaskDto(task))
  })

  app.delete('/api/v1/tasks/:id/', authMiddleware, (req: AuthRequest, res) => {
    const taskId = Number(req.params.id)
    const taskIndex = tasks.findIndex((t) => t.id === taskId)
    if (taskIndex === -1) {
      return res.status(404).json({ detail: 'Task not found.' })
    }

    tasks.splice(taskIndex, 1)
    // Clean up task comments & activity
    for (let i = comments.length - 1; i >= 0; i--) {
      if (comments[i].task_id === taskId) comments.splice(i, 1)
    }
    for (let i = activityLogs.length - 1; i >= 0; i--) {
      if (activityLogs[i].task_id === taskId) activityLogs.splice(i, 1)
    }

    res.status(204).send()
  })

  // ----------------------------------------------------
  // Comments Routes
  // ----------------------------------------------------
  app.get('/api/v1/tasks/:taskId/comments/', authMiddleware, (req: AuthRequest, res) => {
    const taskId = Number(req.params.taskId)
    const taskComments = comments.filter((c) => c.task_id === taskId)
    taskComments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    res.json(taskComments.map(toCommentDto))
  })

  app.post('/api/v1/tasks/:taskId/comments/', authMiddleware, (req: AuthRequest, res) => {
    const taskId = Number(req.params.taskId)
    const task = tasks.find((t) => t.id === taskId)
    if (!task) {
      return res.status(404).json({ detail: 'Task not found.' })
    }

    const { content } = req.body || {}
    if (!content || !String(content).trim()) {
      return res.status(400).json({ content: ['This field may not be blank.'] })
    }

    const newComment: CommentRecord = {
      id: nextCommentId++,
      task_id: taskId,
      author_id: req.user!.id,
      content: String(content).trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    comments.push(newComment)

    activityLogs.push({
      id: nextActivityId++,
      task_id: taskId,
      user_id: req.user!.id,
      action: 'COMMENT_ADDED',
      details: { comment_id: newComment.id },
      created_at: new Date().toISOString(),
    })

    res.status(201).json(toCommentDto(newComment))
  })

  app.patch('/api/v1/comments/:id/', authMiddleware, (req: AuthRequest, res) => {
    const commentId = Number(req.params.id)
    const comment = comments.find((c) => c.id === commentId)
    if (!comment) {
      return res.status(404).json({ detail: 'Comment not found.' })
    }

    if (comment.author_id !== req.user!.id) {
      return res.status(403).json({ detail: 'You can only edit your own comments.' })
    }

    const { content } = req.body || {}
    if (content !== undefined) comment.content = String(content).trim()
    comment.updated_at = new Date().toISOString()

    res.json(toCommentDto(comment))
  })

  app.delete('/api/v1/comments/:id/', authMiddleware, (req: AuthRequest, res) => {
    const commentId = Number(req.params.id)
    const commentIndex = comments.findIndex((c) => c.id === commentId)
    if (commentIndex === -1) {
      return res.status(404).json({ detail: 'Comment not found.' })
    }

    const comment = comments[commentIndex]
    if (comment.author_id !== req.user!.id) {
      return res.status(403).json({ detail: 'You do not have permission to delete this comment.' })
    }

    comments.splice(commentIndex, 1)
    res.status(204).send()
  })

  // ----------------------------------------------------
  // Activity Routes
  // ----------------------------------------------------
  app.get('/api/v1/tasks/:taskId/activity/', authMiddleware, (req: AuthRequest, res) => {
    const taskId = Number(req.params.taskId)
    const logs = activityLogs.filter((a) => a.task_id === taskId)
    logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    res.json(logs.map(toActivityDto))
  })

  // ----------------------------------------------------
  // Vite Middleware & Static Serving
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    })
    app.use(vite.middlewares)
  } else {
    const distPath = path.join(process.cwd(), 'dist')
    app.use(express.static(distPath))
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'))
    })
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TaskFlow Server running on http://0.0.0.0:${PORT}`)
  })
}

startServer()
