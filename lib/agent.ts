import gamma from '@stdlib/random-base-gamma'

export class Agent {
  index = 0
  value = 0
  tol = 0
  stability = 0
  mobility = 0
  errorProp = 0
  connections: number[] = []
  valueParams = {base: 15, alpha: 3, beta: 0.25}

  /**
   * Make a single agent.
   * @param index Number identifying the agents amongst all agents.
   * @param tolerance Value differences the agent is insensitive to (0 default); higher = less sensitive.
   * @param stability Degree to which the agent remains at their current value.
   * @param mobility Chance for the agent to modify their connections by finding a more similar agent.
   * @param errorProp Proportion of a random value to add to the agent's value in each step.
   */
  constructor(index: number, tolerance = 0, stability = 0, mobility = 0, errorProp = 0) {
    this.index = index
    this.tol = tolerance
    this.stability = Math.max(0, Math.min(stability, 1))
    this.mobility = Math.max(0, Math.min(mobility, 1))
    this.errorProp = Math.max(0, Math.min(errorProp, 1))
  }

  /**
   * Set the agent's value using a Gamma distribution.
   * @param base Constant to add to the agent's value; 15 default.
   * @param alpha Alpha (shape; 3 default) parameter of the Gamma distribution from which the agent's value is drawn.
   * @param beta Beta (rate; .25 default) parameter of the Gamma distribution from which the agent's value is drawn.
   */
  rollValue(base = 15, alpha = 3, beta = 0.25) {
    this.valueParams.base = base
    this.valueParams.alpha = alpha
    this.valueParams.beta = beta
    this.value = base + gamma(alpha, beta)
  }

  /**
   * Set connections (edges) to other agents (nodes) using the Watts–Strogatz model.
   * @param populationSize Total number of agents.
   * @param k Number (4 default) of connections; mean degree.
   * @param beta Chance of rewiring initial connections; .9 default.
   */
  rollConnections(populationSize: number, k = 4, beta = 0.9) {
    const size = populationSize - 1
    const randomNode = () => Math.floor(Math.random() * size)
    const n = Math.max(Math.min(size, k), 1)
    const shift = Math.floor(n / 2)

    let current = this.index < shift ? size - shift : this.index - shift - 1
    const newConnections: {[index: number]: number} = {}
    for (let i = n; i--; ) {
      if (++current === this.index) current++
      if (current === populationSize) current = this.index ? 0 : 1
      if (beta === 1 || (beta !== 0 && (current in newConnections || Math.random() < beta))) {
        let chosen = randomNode()
        while (chosen === this.index || chosen in newConnections) {
          chosen = randomNode()
        }
        newConnections[chosen] = chosen
      } else {
        newConnections[current] = current
      }
    }
    this.connections = Object.values(newConnections)
  }

  /**
   * Process the agent's step.
   * @param agents Population of agents, referred to in Agent.connections.
   */
  step(agents: Agent[]) {
    let mean = 0
    const leastSimilar = [-1, -Infinity]
    const mostSimilarSecondary = [-1, Infinity]
    if (this.connections.length) {
      this.connections.forEach((ai, i) => {
        const a = agents[ai]
        if (this.mobility && a.connections.length) {
          ;[...a.connections, Math.floor(Math.random() * agents.length)].forEach(con => {
            if (con !== this.index && !this.connections.includes(con)) {
              const dif = Math.abs(agents[con].value - this.value)
              if (dif < mostSimilarSecondary[1]) {
                mostSimilarSecondary[0] = con
                mostSimilarSecondary[1] = dif
              }
            }
          })
          const dif = Math.abs(a.value - this.value)
          if (dif > leastSimilar[1]) {
            leastSimilar[0] = i
            leastSimilar[1] = dif
          }
        }
        mean += a.value
      })
      mean /= this.connections.length
    }
    const dif = mean - this.value
    if (Math.abs(dif) > this.tol) {
      if (this.stability < 1) this.value += Math.max(-0.1, Math.min(dif, 0.1)) * (1 - this.stability)
      if (this.mobility && leastSimilar[0] > 0 && -1 !== mostSimilarSecondary[0] && Math.random() < this.mobility) {
        this.connections[leastSimilar[0]] = mostSimilarSecondary[0]
      }
    }
    if (this.errorProp) {
      const newValue = this.valueParams.base + gamma(this.valueParams.alpha, this.valueParams.beta)
      this.value += this.errorProp * (newValue - this.value)
    }
  }
}
