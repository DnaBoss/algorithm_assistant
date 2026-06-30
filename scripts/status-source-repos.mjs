#!/usr/bin/env node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const args = parseArgs(process.argv.slice(2))

if (args.selfTest) {
  selfTest()
  process.exit(0)
}

const root = process.cwd()
const sources = [
  {
    id: 'helios',
    label: 'Helios',
    path: args.heliosPath || path.resolve(root, '..', 'Helios'),
    requiredFiles: ['Cargo.toml', 'docker-compose.yml', 'apps/api/src/main.rs'],
  },
  {
    id: 'easy-pg',
    label: 'Easy PG',
    path: args.easyPgPath || path.resolve(root, '..', 'easy-pg'),
    requiredFiles: ['Cargo.toml', 'Dockerfile', 'schema_exports'],
  },
]

const report = buildReport(sources)
printReport(report)

if (args.jsonPath) {
  fs.mkdirSync(path.dirname(args.jsonPath), { recursive: true })
  fs.writeFileSync(args.jsonPath, `${JSON.stringify(report, null, 2)}\n`)
  console.log(`Source repo status JSON: ${args.jsonPath}`)
}

function buildReport(sourcesToCheck) {
  return {
    checkedAt: new Date().toISOString(),
    sources: sourcesToCheck.map(source => {
      const exists = fs.existsSync(source.path)
      const requiredFiles = source.requiredFiles.map(relativePath => ({
        path: relativePath,
        exists: exists && fs.existsSync(path.join(source.path, relativePath)),
      }))
      const git = exists ? gitStatus(source.path) : { state: 'missing', changedFiles: 0, branch: '' }
      return {
        id: source.id,
        label: source.label,
        path: source.path,
        exists,
        git,
        requiredFiles,
        ready: exists && requiredFiles.every(item => item.exists),
      }
    }),
  }
}

function gitStatus(repoPath) {
  if (!fs.existsSync(path.join(repoPath, '.git'))) return { state: 'not-git', changedFiles: 0, branch: '' }
  const branch = spawnSync('git', ['branch', '--show-current'], { cwd: repoPath, encoding: 'utf8' })
  const status = spawnSync('git', ['status', '--short'], { cwd: repoPath, encoding: 'utf8' })
  if (status.status !== 0) return { state: 'error', changedFiles: 0, branch: branch.stdout.trim() }
  const changedFiles = status.stdout.split(/\r?\n/).filter(Boolean).length
  return {
    state: changedFiles === 0 ? 'clean' : 'dirty',
    changedFiles,
    branch: branch.stdout.trim(),
  }
}

function printReport(report) {
  console.log(`Source repo status: ${report.checkedAt}`)
  for (const source of report.sources) {
    console.log(`\n${source.label}`)
    console.log(`- path: ${source.path}`)
    console.log(`- exists: ${source.exists}`)
    console.log(`- ready: ${source.ready}`)
    console.log(`- git: ${source.git.state}${source.git.branch ? ` (${source.git.branch})` : ''}${source.git.changedFiles ? `, ${source.git.changedFiles} changed files` : ''}`)
    for (const item of source.requiredFiles) {
      console.log(`- ${item.exists ? 'ok' : 'missing'}: ${item.path}`)
    }
  }
}

function parseArgs(rawArgs) {
  const options = {
    easyPgPath: '',
    heliosPath: '',
    jsonPath: '',
    selfTest: false,
  }
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index]
    if (arg === '--easy-pg-path') {
      options.easyPgPath = requireValue(arg, rawArgs[index + 1])
      index += 1
    } else if (arg === '--helios-path') {
      options.heliosPath = requireValue(arg, rawArgs[index + 1])
      index += 1
    } else if (arg === '--json') {
      options.jsonPath = requireValue(arg, rawArgs[index + 1])
      index += 1
    } else if (arg === '--self-test') {
      options.selfTest = true
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }
  return options
}

function requireValue(arg, value) {
  if (!value || value.startsWith('--')) throw new Error(`${arg} requires a value`)
  return value
}

function selfTest() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'exactlyone-source-repos-'))
  const helios = path.join(tempDir, 'Helios')
  const easyPg = path.join(tempDir, 'easy-pg')
  fs.mkdirSync(path.join(helios, 'apps/api/src'), { recursive: true })
  fs.writeFileSync(path.join(helios, 'Cargo.toml'), '[workspace]\n')
  fs.writeFileSync(path.join(helios, 'docker-compose.yml'), 'services: {}\n')
  fs.writeFileSync(path.join(helios, 'apps/api/src/main.rs'), 'fn main() {}\n')
  fs.mkdirSync(path.join(easyPg, 'schema_exports'), { recursive: true })
  fs.writeFileSync(path.join(easyPg, 'Cargo.toml'), '[package]\nname = "easy-pg"\n')
  fs.writeFileSync(path.join(easyPg, 'Dockerfile'), 'FROM scratch\n')

  const report = buildReport([
    { id: 'helios', label: 'Helios', path: helios, requiredFiles: ['Cargo.toml', 'docker-compose.yml', 'apps/api/src/main.rs'] },
    { id: 'easy-pg', label: 'Easy PG', path: easyPg, requiredFiles: ['Cargo.toml', 'Dockerfile', 'schema_exports'] },
  ])
  if (!report.sources.every(source => source.ready)) throw new Error('self-test sources should be ready')
  if (!report.sources.every(source => source.git.state === 'not-git')) throw new Error('self-test sources should be non-git fixtures')
  fs.rmSync(tempDir, { recursive: true, force: true })
  console.log('Source repo status self-test passed')
}
