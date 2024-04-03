import {useEffect, useState} from 'react'
import {Box, IconButton, Paper, Slider, Stack, TextField, Tooltip, Typography} from '@mui/material'
import {Graph} from './graph'
import {Distribution} from './distribution'
import {Trend} from './trend'
import {Replay, StopCircleOutlined} from '@mui/icons-material'
import {Batch} from './batch'

export type Data = {
  name: number
  x: number
  y: number
  value: number
  symbolSize: number
  label: {
    show: boolean
  }
}
export type Links = {
  source: number
  target: number
}
export type Network = {epoch: number; converged: boolean; data: Data[]; links: Links[]}

type AgentParams = {tolerance?: number; errorProp?: number}
type ValueParams = {base?: number; alpha?: number; beta?: number}
type ConnectionParams = {k?: number; beta?: number}
export type ModelArgs = {
  n: number
  scale: {height: number; width: number}
  agentParams?: AgentParams
  valueParams?: ValueParams
  connectionParams?: ConnectionParams
}

const worker: {live?: Worker} = {}
let animationFrame = -1
export function Data() {
  const [network, setNetwork] = useState<Network>({epoch: 0, converged: false, data: [], links: []})

  useEffect(() => {
    worker.live = new Worker(new URL('@/app/workers/liveWorker.ts', import.meta.url))
    worker.live.onmessage = (e: MessageEvent<Network>) => {
      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(() => setNetwork(e.data))
    }
    return () => worker.live && worker.live.terminate()
  }, [])

  const [n, setN] = useState(100)
  const [agentParams, setAgentParams] = useState<AgentParams>({tolerance: 0, errorProp: 0})
  const [valueParams, setValueParams] = useState<ValueParams>({base: 15, alpha: 3, beta: 0.25})
  const [connectionParams, setConnectionParams] = useState<ConnectionParams>({k: 4, beta: 0.1})

  useEffect(() => {
    worker.live &&
      worker.live.postMessage({
        n,
        scale: {height: window.innerHeight, width: window.innerWidth},
        agentParams,
        valueParams,
        connectionParams,
      } as ModelArgs)
  }, [n, agentParams, valueParams, connectionParams])
  return (
    <>
      <Stack sx={{position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden'}}>
        <Box sx={{height: '65%'}}>
          <Graph data={network.data} links={network.links} />
        </Box>
        <Stack direction="row" sx={{height: '35%'}}>
          <Distribution epoch={network.epoch} data={network.data} />
          <Trend epoch={network.epoch} data={network.data} />
        </Stack>
      </Stack>
      <Typography variant="h5" sx={{position: 'absolute', textAlign: 'center', width: '100%', top: 10}}>
        Epoch: {network.epoch + (network.converged ? ', stagnant' : '')}
      </Typography>
      <Stack
        spacing={1}
        sx={{position: 'fixed', maxWidth: '200px', p: 0.5, m: 1, '& .MuiSlider-markLabel': {fontSize: '.8em'}}}
      >
        <Paper>
          <Stack direction="row">
            <TextField
              value={n}
              onChange={e => setN(+e.target.value || 100)}
              label="Agents"
              size="small"
              type="number"
            ></TextField>
            <IconButton
              aria-label="stop simulation"
              onClick={() => worker.live && worker.live.postMessage({restart: true})}
            >
              <Replay />
            </IconButton>
            <IconButton
              aria-label="stop simulation"
              onClick={() => worker.live && worker.live.postMessage({stop: true})}
            >
              <StopCircleOutlined color="error" />
            </IconButton>
          </Stack>
        </Paper>
        <Paper>
          <Typography>Graph</Typography>
          <Tooltip title="average number of connections per agent; mean degree" placement="right">
            <Box sx={{pr: 1.5, pl: 1.5}}>
              <Typography variant="caption" id="connection-label-k">
                K: {connectionParams.k}
              </Typography>
              <Slider
                value={connectionParams.k}
                aria-labelledby="connection-label-k"
                step={1}
                min={1}
                max={20}
                marks={[
                  {value: 1, label: 1},
                  {value: 20, label: 20},
                ]}
                onChange={(_, value) => {
                  setConnectionParams({...connectionParams, k: 'number' === typeof value ? value : value[0]})
                }}
              ></Slider>
            </Box>
          </Tooltip>
          <Tooltip title="chance for a random connection; rewire probability" placement="right">
            <Box sx={{pr: 1.5, pl: 1.5}}>
              <Typography variant="caption" id="connection-label-beta">
                beta: {connectionParams.beta}
              </Typography>
              <Slider
                value={connectionParams.beta}
                aria-labelledby="connection-label-beta"
                step={0.1}
                min={0}
                max={1}
                marks={[
                  {value: 0, label: 0},
                  {value: 1, label: 1},
                ]}
                onChange={(_, value) => {
                  setConnectionParams({...connectionParams, beta: 'number' === typeof value ? value : value[0]})
                }}
              ></Slider>
            </Box>
          </Tooltip>
        </Paper>
        <Paper>
          <Typography>Value Distribution</Typography>
          <Tooltip title="alpha (shape) of each agent's Gamma distribution" placement="right">
            <Box sx={{pr: 1.5, pl: 1.5}}>
              <Typography variant="caption" id="value-label-alpha">
                alpha: {valueParams.alpha}
              </Typography>
              <Slider
                value={valueParams.alpha}
                aria-labelledby="value-label-alpha"
                step={1}
                min={0}
                max={20}
                marks={[
                  {value: 0, label: 0},
                  {value: 20, label: 20},
                ]}
                onChange={(_, value) => {
                  setValueParams({...valueParams, alpha: 'number' === typeof value ? value : value[0]})
                }}
              ></Slider>
            </Box>
          </Tooltip>
          <Tooltip title="beta (rate) of each agent's Gamma distribution" placement="right">
            <Box sx={{pr: 1.5, pl: 1.5}}>
              <Typography variant="caption" id="value-label-beta">
                beta: {valueParams.beta}
              </Typography>
              <Slider
                value={valueParams.beta}
                aria-labelledby="value-label-beta"
                step={0.01}
                min={0.01}
                max={1}
                marks={[
                  {value: 0, label: 0},
                  {value: 1, label: 1},
                ]}
                onChange={(_, value) => {
                  setValueParams({...valueParams, beta: 'number' === typeof value ? value : value[0]})
                }}
              ></Slider>
            </Box>
          </Tooltip>
        </Paper>
        <Paper>
          <Typography>Agent Properties</Typography>
          <Tooltip title="range of the agent's value sensitivity; degree of satisficing" placement="right">
            <Box sx={{pr: 1.5, pl: 1.5}}>
              <Typography variant="caption" id="agent-label-tol">
                tolerance: {agentParams.tolerance}
              </Typography>
              <Slider
                value={agentParams.tolerance}
                aria-labelledby="agent-label-tol"
                step={0.1}
                min={0}
                max={2}
                marks={[
                  {value: 0, label: 0},
                  {value: 2, label: 2},
                ]}
                onChange={(_, value) => {
                  setAgentParams({...agentParams, tolerance: 'number' === typeof value ? value : value[0]})
                }}
              ></Slider>
            </Box>
          </Tooltip>
          <Tooltip title="proportion of error added to agent's value each step" placement="right">
            <Box sx={{pr: 1.5, pl: 1.5}}>
              <Typography variant="caption" id="agent-label-errorProp">
                error proportion: {agentParams.errorProp}
              </Typography>
              <Slider
                value={agentParams.errorProp}
                aria-labelledby="agent-label-errorProp"
                step={0.01}
                min={0}
                max={1}
                marks={[
                  {value: 0, label: 0},
                  {value: 1, label: 1},
                ]}
                onChange={(_, value) => {
                  setAgentParams({...agentParams, errorProp: 'number' === typeof value ? value : value[0]})
                }}
              ></Slider>
            </Box>
          </Tooltip>
        </Paper>
        <Batch />
      </Stack>
    </>
  )
}
