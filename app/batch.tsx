import {Close} from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {useMemo, useReducer, useState} from 'react'
import type {AgentParams, ConnectionParams, ModelArgs, ValueParams} from './data'
import dynamic from 'next/dynamic'

const BatchResultsDisplay = dynamic(() => import('./batchResults'))

export type BatchArgs = ModelArgs & {name: string; color: string; runs: number; epochs: number}
export type BatchResults = {means: number[]; initialValues: number[]; finalValues: number[]}[]

type BatchUpdateAction =
  | {type: 'clear'}
  | ({index: number} & (
      | {type: 'remove'}
      | {type: 'add'; batch: BatchArgs}
      | {key: 'name' | 'color'; value: string}
      | {key: 'n' | 'runs' | 'epochs'; value: number}
      | {key: keyof AgentParams; value: number; component: 'agent'}
      | {key: keyof ValueParams; value: number; component: 'value'}
      | {key: keyof ConnectionParams; value: number; component: 'connection'}
    ))
function updateBatch(state: BatchArgs[], action: BatchUpdateAction) {
  if ('type' in action) {
    if (action.type === 'clear') return []
    if (action.type === 'remove') {
      state.splice(action.index, 1)
    } else {
      state[action.index] = action.batch
    }
  } else {
    const variant = state[action.index]
    if ('component' in action) {
      switch (action.component) {
        case 'agent':
          variant.agentParams = {...variant.agentParams, [action.key]: action.value}
          break
        case 'value':
          variant.valueParams = {...variant.valueParams, [action.key]: action.value}
          break
        case 'connection':
          variant.connectionParams = {...variant.connectionParams, [action.key]: action.value}
          break
      }
    } else {
      variant[action.key as 'n'] = action.value as number
    }
  }
  return [...state]
}
function VariantMenu({
  index,
  variant,
  update,
  onlyVariant,
}: {
  index: number
  variant: BatchArgs
  update: (action: BatchUpdateAction) => void
  onlyVariant: boolean
}) {
  const {name, color, runs, epochs, n, agentParams, valueParams, connectionParams} = variant
  let timer = -1
  return (
    <Card variant="outlined" sx={{p: 1, m: 0.5}}>
      <Stack direction="row" spacing={1} sx={{justifyContent: 'space-between', mb: 2, mt: 1}}>
        <Stack direction="row" spacing={1}>
          <TextField
            label="name"
            size="small"
            value={name}
            onChange={e => {
              update({index, key: 'name', value: e.target.value})
            }}
          ></TextField>
          <TextField
            label="color"
            type="color"
            size="small"
            value={color}
            onChange={e => {
              cancelAnimationFrame(timer)
              const newValue = e.target.value
              timer = requestAnimationFrame(() => update({index, key: 'color', value: newValue}))
            }}
            sx={{
              width: '52px',
              '& .MuiInputBase-input': {backgroundColor: color},
              '& input::-webkit-color-swatch': {border: 'none'},
              '& input::-moz-color-swatch': {border: 'none'},
            }}
          ></TextField>
          <TextField
            sx={{width: '100px'}}
            label="runs"
            size="small"
            type="number"
            value={runs}
            onChange={e => {
              update({index, key: 'runs', value: +e.target.value})
            }}
          ></TextField>
          <TextField
            sx={{width: '100px'}}
            label="epochs"
            size="small"
            type="number"
            value={epochs}
            onChange={e => {
              update({index, key: 'epochs', value: +e.target.value})
            }}
          ></TextField>
        </Stack>
        <IconButton
          onClick={() => update({index, type: 'remove'})}
          aria-label="remove variant"
          color="error"
          disabled={onlyVariant}
        >
          <Close />
        </IconButton>
      </Stack>
      <Stack direction="row" spacing={1}>
        <Stack spacing={1}>
          <Typography>Population</Typography>
          <TextField
            label="n"
            size="small"
            type="number"
            value={n}
            onChange={e => {
              update({index, key: 'n', value: +e.target.value})
            }}
          ></TextField>
        </Stack>

        {connectionParams ? (
          <Stack spacing={1}>
            <Typography>Graphs</Typography>
            <TextField
              label="k"
              size="small"
              type="number"
              value={connectionParams.k}
              onChange={e => {
                update({index, key: 'k', value: +e.target.value, component: 'connection'})
              }}
            ></TextField>
            <TextField
              label="beta"
              size="small"
              type="number"
              value={connectionParams.beta}
              onChange={e => {
                update({index, key: 'beta', value: +e.target.value, component: 'connection'})
              }}
            ></TextField>
          </Stack>
        ) : (
          <></>
        )}

        {valueParams ? (
          <Stack spacing={1}>
            <Typography>Values</Typography>
            <TextField
              label="alpha"
              size="small"
              type="number"
              value={valueParams.alpha}
              onChange={e => {
                update({index, key: 'alpha', value: +e.target.value, component: 'value'})
              }}
            ></TextField>
            <TextField
              label="beta"
              size="small"
              type="number"
              value={valueParams.beta}
              onChange={e => {
                update({index, key: 'beta', value: +e.target.value, component: 'value'})
              }}
            ></TextField>
          </Stack>
        ) : (
          <></>
        )}

        {agentParams ? (
          <Stack spacing={1}>
            <Typography>Agents</Typography>
            <Stack spacing={1} direction="row">
              <Stack spacing={1}>
                <TextField
                  label="tolerance"
                  size="small"
                  type="number"
                  value={agentParams.tolerance}
                  onChange={e => {
                    update({index, key: 'tolerance', value: +e.target.value, component: 'agent'})
                  }}
                ></TextField>
                <TextField
                  label="stability"
                  size="small"
                  type="number"
                  value={agentParams.stability}
                  onChange={e => {
                    update({index, key: 'stability', value: +e.target.value, component: 'agent'})
                  }}
                ></TextField>
              </Stack>
              <Stack spacing={1}>
                <TextField
                  label="mobility"
                  size="small"
                  type="number"
                  value={agentParams.mobility}
                  onChange={e => {
                    update({index, key: 'mobility', value: +e.target.value, component: 'agent'})
                  }}
                ></TextField>
                <TextField
                  label="error proportion"
                  size="small"
                  type="number"
                  value={agentParams.errorProp}
                  onChange={e => {
                    update({index, key: 'errorProp', value: +e.target.value, component: 'agent'})
                  }}
                ></TextField>
              </Stack>
            </Stack>
          </Stack>
        ) : (
          <></>
        )}
      </Stack>
    </Card>
  )
}

let results: {[index: string]: BatchResults} = {}
export function Batch() {
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleMenu = () => setMenuOpen(!menuOpen)
  const [requested, setRequested] = useState(false)
  const [ready, setReady] = useState(false)
  const [received, setReceived] = useState(0)
  const [batches, dispatchBatchUpdate] = useReducer(updateBatch, [])
  const runBatches = (batches: BatchArgs[]) => {
    setReceived(0)
    setRequested(true)
    setReady(false)
    results = {}
    batches.forEach(args => {
      const worker = new Worker(new URL('@/app/workers/batchWorker.ts', import.meta.url))
      worker.onmessage = (e: MessageEvent<{name: string; runs: BatchResults}>) => {
        results[e.data.name] = e.data.runs
        let allReceived = true
        let received = 0
        batches.forEach(batch => {
          if (batch.name in results) {
            received++
          } else {
            allReceived = false
          }
        })
        setReceived(received)
        if (allReceived) setReady(true)
        worker.terminate()
      }
      worker.postMessage(args)
    })
  }
  const addVariant = () => {
    dispatchBatchUpdate({
      type: 'add',
      index: batches.length,
      batch: {
        name: '' + batches.length,
        color: '#555555',
        runs: 10,
        epochs: 200,
        n: 100,
        agentParams: {tolerance: 0, stability: 0, mobility: 0, errorProp: 0},
        valueParams: {base: 15, alpha: 3, beta: 0.25},
        connectionParams: {k: 4, beta: 0.1},
      } as BatchArgs,
    })
  }
  if (!batches.length) addVariant()
  const batchMenus = useMemo(() => {
    return batches.map((batch, index) => (
      <VariantMenu
        key={index}
        index={index}
        variant={batch}
        update={dispatchBatchUpdate}
        onlyVariant={batches.length === 1}
      />
    ))
  }, [batches])
  return (
    <>
      <Button variant="contained" onClick={toggleMenu}>
        Batch
      </Button>
      {menuOpen && (
        <Dialog open={menuOpen} onClose={toggleMenu}>
          <DialogTitle sx={{p: 1}}>Batch Runner</DialogTitle>
          <IconButton
            aria-label="close export menu"
            onClick={toggleMenu}
            sx={{
              position: 'absolute',
              right: 5,
              top: 5,
            }}
            className="close-button"
          >
            <Close />
          </IconButton>
          {requested && ready ? (
            <>
              <DialogContent sx={{p: 0}}>
                <BatchResultsDisplay data={results} batches={batches} />
              </DialogContent>
              <DialogActions>
                <Button variant="outlined" onClick={() => runBatches(batches)}>
                  Rerun
                </Button>
                <Button variant="contained" onClick={() => setRequested(false)}>
                  New Batch
                </Button>
              </DialogActions>
            </>
          ) : (
            <>
              <DialogContent sx={{p: 0}}>{batchMenus}</DialogContent>
              <DialogActions sx={{justifyContent: 'space-between'}}>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" onClick={addVariant}>
                    Add Variant
                  </Button>
                  <Button variant="outlined" onClick={() => dispatchBatchUpdate({type: 'clear'})}>
                    Reset
                  </Button>
                </Stack>
                <Stack direction="row" spacing={1}>
                  {requested && <Typography sx={{lineHeight: 2.3}}>{received + ' / ' + batches.length}</Typography>}
                  <Box sx={{position: 'relative'}}>
                    <Button variant="contained" disabled={requested} onClick={() => runBatches(batches)}>
                      Run Batch
                    </Button>
                    {requested && (
                      <CircularProgress
                        size={24}
                        sx={{position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px'}}
                      />
                    )}
                  </Box>
                </Stack>
              </DialogActions>
            </>
          )}
        </Dialog>
      )}
    </>
  )
}
