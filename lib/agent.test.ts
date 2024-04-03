import {describe, expect, test} from '@jest/globals'
import {Agent} from './agent'

function allWithinBounds(x: number[], max: number, min = 0) {
  for (let i = x.length; i--; ) {
    if (x[i] > max || x[i] < min) return false
  }
  return true
}

describe('agent works', () => {
  const a = new Agent(0)
  test('roll value works', async () => {
    a.rollValue()
    expect(a.value).not.toEqual(0)
  })
  test('roll connections works with 0th agent', async () => {
    const n = 10
    a.rollConnections(n)
    expect(a.connections.length).toEqual(4)
    expect(allWithinBounds(a.connections, n - 1)).toBeTruthy()
  })
  test('roll connections works beta = 0', async () => {
    const n = 10
    a.rollConnections(n, 4, 0)
    expect(a.connections.sort()).toStrictEqual([1, 2, 8, 9])
  })
  test('roll connections works with nth agent', async () => {
    const n = 10
    a.index = n - 1
    a.rollConnections(n, 4, 0)
    expect(a.connections.length).toEqual(4)
    expect(a.connections.sort()).toStrictEqual([0, 1, 7, 8])
  })
})
