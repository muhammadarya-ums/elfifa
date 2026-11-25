import { describe, expect, it } from 'vitest'
import { displayPhone, formatJuta, normalizePhone, slugify, splitLines } from '@/lib/format'

describe('normalizePhone', () => {
  it.each([
    ['0812-3456-7890', '6281234567890'],
    ['+62 812 3456 7890', '6281234567890'],
    ['812 3456 7890', '6281234567890'],
    ['6281234567890', '6281234567890'],
    ['(0812) 3456.7890', '6281234567890'],
  ])('%s → %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected)
  })
})

describe('displayPhone', () => {
  it('menampilkan format lokal yang mudah dibaca', () => {
    expect(displayPhone('6281234567890')).toBe('0812-3456-7890')
  })
})

describe('formatJuta', () => {
  it('membulatkan ke satu desimal dalam juta', () => {
    expect(formatJuta(39_900_000)).toBe('39,9')
    expect(formatJuta(45_000_000)).toBe('45')
  })
})

describe('slugify', () => {
  it('membuat slug URL yang aman', () => {
    expect(slugify('Umroh Plus Turki — 15 Hari!')).toBe('umroh-plus-turki-15-hari')
    expect(slugify('  Ça va? Été  ')).toBe('ca-va-ete')
  })
})

describe('splitLines', () => {
  it('membuang baris kosong & spasi', () => {
    expect(splitLines(' a \n\n b\r\n')).toEqual(['a', 'b'])
  })
})
