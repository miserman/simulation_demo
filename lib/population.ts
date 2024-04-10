import type {AgentParams, ConnectionParams, ValueParams} from '@/app/data'
import {Agent} from './agent'

function byRandom() {
  return Math.random() - 0.5
}

export class Population {
  converged = false
  agents: Agent[] = []

  /**
   * Make a population of agents.
   * @param n Number of agents.
   * @param valueParams Optional object containing Agent.rollValue arguments.
   * @param connectionParams Optional object containing Agent.rollConnection arguments.
   */
  constructor(
    n = 100,
    agentParams?: Partial<AgentParams>,
    valueParams?: Partial<ValueParams>,
    connectionParams?: Partial<ConnectionParams>
  ) {
    this.agents = new Array(n)
    if (!agentParams) agentParams = {}
    const agentTol = agentParams.tolerance || 0
    const agentStab = agentParams.stability || 0
    const agentMob = agentParams.mobility || 0
    const agentError = agentParams.errorProp || 0
    if (!valueParams) valueParams = {}
    const valueBase = valueParams.base || 15
    const valueAlpha = valueParams.alpha || 3
    const valueBeta = 'beta' in valueParams ? valueParams.beta : 0.25
    if (!connectionParams) connectionParams = {}
    const connK = connectionParams.k || 4
    const connBeta = 'beta' in connectionParams ? connectionParams.beta : 0.9
    for (let i = n; i--; ) {
      const a = new Agent(i, agentTol, agentStab, agentMob, agentError)
      a.rollValue(valueBase, valueAlpha, valueBeta)
      a.rollConnections(n, connK, connBeta)
      this.agents[i] = a
    }
  }

  /**
   * Step all agents in a random order.
   */
  step() {
    let changed = false
    ;[...this.agents].sort(byRandom).forEach(agent => {
      const initial = agent.value
      agent.step(this.agents)
      if (agent.stability === 1 || Math.abs(initial - agent.value) > 1e-6) changed = true
    })
    if (!changed) this.converged = true
  }
}
