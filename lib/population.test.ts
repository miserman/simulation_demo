import {describe, expect, test} from '@jest/globals'
import {Population} from './population'

describe('default population works', () => {
  const pop = new Population()
  test('size is correct', async () => {
    expect(pop.agents.length).toEqual(100)
  })
  test('values are set', async () => {
    const x = pop.agents
    let passes = true
    for (let i = x.length; i--; ) {
      if (x[i].value === 0) {
        passes = false
        break
      }
    }
    expect(passes).toBeTruthy()
  })
  test('connections are set', async () => {
    const x = pop.agents
    let passes = true
    for (let i = x.length; i--; ) {
      if (x[i].connections.length !== 4) {
        passes = false
        break
      }
    }
    expect(passes).toBeTruthy()
  })
  test('converges within 1000 epochs', async () => {
    for (let i = 1000; i--; ) {
      pop.step()
      if (pop.converged) break
    }
    expect(pop.converged).toBeTruthy()
  })
})

describe('population works with connection beta = 0', () => {
  const pop = new Population(100, {}, {}, {beta: 0})
  test('all connections are default', async () => {
    const x = pop.agents
    let passes = true
    for (let i = x.length; i--; ) {
      const cons = x[i].connections
      const n = cons.length
      if (n !== 4) {
        passes = false
        break
      }
      let current = i < 2 ? 97 : i - 3
      for (let j = 0; j < n; j++) {
        if (++current === i) current++
        if (current === 100) current = i ? 0 : 1
        if (!cons.includes(current)) {
          passes = false
          break
        }
      }
      if (!passes) break
    }
    expect(passes).toBeTruthy()
  })
})
