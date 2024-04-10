import type {ModelArgs, Network} from '@/app/data'
import {Population} from '../../lib/population'
import {forceSimulation, forceManyBody, forceLink, forceX, forceY} from 'd3-force'

let population = new Population()
let interval: NodeJS.Timeout | number = -1
let lastData: ModelArgs

function symbolSize(value: number) {
  return value * 0.35 + Math.pow(value * 0.01, 2)
}
addEventListener('message', (e: MessageEvent<ModelArgs | {stop: true} | {restart: true}>) => {
  clearInterval(interval)
  let action = e.data
  if ('restart' in action && lastData) {
    action = lastData
  } else if ('restart' in action || 'stop' in action) {
    return
  }
  lastData = action
  const {n, agentParams, valueParams, connectionParams} = action
  population = new Population(n, agentParams, valueParams, connectionParams)
  const network: Network = {epoch: 0, converged: false, data: [], links: []}
  const collect = (initial?: boolean) => {
    network.epoch++
    if (initial) {
      network.data = []
    }
    network.links = []
    const linkLog: {[index: string]: boolean} = {}
    population.agents.forEach(agent => {
      if (initial) {
        network.data.push({
          x: Math.random(),
          y: Math.random(),
          symbolSize: symbolSize(agent.value),
          value: agent.value,
          name: agent.index,
          label: {show: false},
        })
      } else {
        const data = network.data[agent.index]
        data.value = agent.value
        data.symbolSize = symbolSize(agent.value)
      }
      agent.connections.forEach(target => {
        const ids = [target, agent.index].sort()
        const name = ids[0] + '.' + ids[1]
        if (!(name in linkLog)) {
          linkLog[name] = true
          network.links.push({
            source: agent.index,
            target,
          })
        }
      })
    })
    const positions = network.data.map((node, index) => {
      return {index, x: node.x, y: node.y}
    })
    const links = network.links.map(link => {
      const {source, target} = link
      return {source, target}
    })
    forceSimulation(positions)
      .force('change', forceManyBody().strength(-90))
      .force('link', forceLink(links).distance(5).strength(0.5).iterations(10))
      .force('x', forceX())
      .force('y', forceY())
      .stop()
      .tick(1)
    positions.forEach((position, index) => {
      const data = network.data[index]
      data.x = position.x
      data.y = position.y
    })
    if (population.converged) {
      network.converged = true
      clearInterval(interval)
    }
    self.postMessage(network)
  }
  collect(true)
  interval = setInterval(() => {
    population.step()
    collect()
  }, 100)
})
