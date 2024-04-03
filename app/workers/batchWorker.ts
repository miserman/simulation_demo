import {Population} from '../../lib/population'
import type {BatchArgs} from '../batch'

addEventListener('message', (e: MessageEvent<BatchArgs>) => {
  const {name, runs, epochs, n, agentParams, valueParams, connectionParams} = e.data
  postMessage({
    name,
    runs: Array.from({length: runs}, () => {
      const population = new Population(n, agentParams, valueParams, connectionParams)
      const initialValues = population.agents.map(agent => agent.value)
      const means: number[] = []
      for (let e = epochs; e--; ) {
        population.step()
        let mean = 0
        population.agents.map(agent => (mean += agent.value))
        means.push(mean / n)
      }
      return {means, initialValues, finalValues: population.agents.map(agent => agent.value)}
    }),
  })
})
