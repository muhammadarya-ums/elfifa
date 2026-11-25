import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

// Setiap file test memakai database SQLite sementara yang terisolasi
const dir = mkdtempSync(path.join(tmpdir(), 'elfifa-test-'))
process.env.DATABASE_URL = pathToFileURL(path.join(dir, 'test.db')).href
