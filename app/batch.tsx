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
import {useState} from 'react'
import type {ModelArgs} from './data'
import {BatchResultsDisplay} from './batchResults'

export type BatchArgs = ModelArgs & {name: string; color: string; runs: number; epochs: number}
export type BatchResults = {means: number[]; initialValues: number[]; finalValues: number[]}[]

let results: {[index: string]: BatchResults} = {}
export function Batch() {
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleMenu = () => setMenuOpen(!menuOpen)
  const [requested, setRequested] = useState(false)
  const [ready, setReady] = useState(false)
  const [received, setReceived] = useState(0)
  const [batches, setBatches] = useState<BatchArgs[]>([])
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
    setBatches([
      ...batches,
      {
        name: '' + batches.length,
        color: '#555555',
        runs: 10,
        epochs: 200,
        n: 100,
        agentParams: {tolerance: 0, errorProp: 0},
        valueParams: {base: 15, alpha: 3, beta: 0.25},
        connectionParams: {k: 4, beta: 0.1},
      } as BatchArgs,
    ])
  }
  if (!batches.length) addVariant()
  return (
    <>
      <Button variant="contained" onClick={toggleMenu}>
        Batch
      </Button>
      {menuOpen && (
        <Dialog open={menuOpen} onClose={toggleMenu}>
          <DialogTitle>Batch Runner</DialogTitle>
          <IconButton
            aria-label="close export menu"
            onClick={toggleMenu}
            sx={{
              position: 'absolute',
              right: 8,
              top: 12,
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
                <Button variant="contained" onClick={() => setRequested(false)}>
                  New Run
                </Button>
              </DialogActions>
            </>
          ) : (
            <>
              <DialogContent sx={{p: 0}}>
                {batches.map((batch, index) => {
                  const {name, color, runs, epochs, n, agentParams, valueParams, connectionParams} = batch
                  let timer = -1
                  const update = () => {
                    cancelAnimationFrame(timer)
                    requestAnimationFrame(() => {
                      batches[index] = {
                        name: batch.name,
                        color: batch.color,
                        runs: batch.runs,
                        epochs: batch.epochs,
                        n: batch.n,
                        agentParams: {...batch.agentParams},
                        valueParams: {...batch.valueParams},
                        connectionParams: {...batch.connectionParams},
                      } as BatchArgs
                      setBatches([...batches])
                    })
                  }
                  return (
                    <Card key={index} variant="outlined" sx={{p: 1, m: 0.5}}>
                      <Stack direction="row" spacing={1} sx={{justifyContent: 'space-between', mb: 2, mt: 1}}>
                        <Stack direction="row" spacing={1}>
                          <TextField
                            label="name"
                            size="small"
                            value={name}
                            onChange={e => {
                              batch.name = e.target.value
                              update()
                            }}
                          ></TextField>
                          <TextField
                            label="color"
                            type="color"
                            size="small"
                            value={color}
                            onChange={e => {
                              batch.color = e.target.value
                              update()
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
                              batch.runs = +e.target.value
                              update()
                            }}
                          ></TextField>
                          <TextField
                            sx={{width: '100px'}}
                            label="epochs"
                            size="small"
                            type="number"
                            value={epochs}
                            onChange={e => {
                              batch.epochs = +e.target.value
                              update()
                            }}
                          ></TextField>
                        </Stack>
                        <Button
                          onClick={() => {
                            batches.splice(index, 1)
                            setBatches([...batches])
                          }}
                          color="error"
                          disabled={batches.length === 1}
                        >
                          Remove
                        </Button>
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
                              batch.n = +e.target.value
                              update()
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
                                connectionParams.k = +e.target.value
                                update()
                              }}
                            ></TextField>
                            <TextField
                              label="beta"
                              size="small"
                              type="number"
                              value={connectionParams.beta}
                              onChange={e => {
                                connectionParams.beta = +e.target.value
                                update()
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
                                valueParams.alpha = +e.target.value
                                update()
                              }}
                            ></TextField>
                            <TextField
                              label="beta"
                              size="small"
                              type="number"
                              value={valueParams.beta}
                              onChange={e => {
                                valueParams.beta = +e.target.value
                                update()
                              }}
                            ></TextField>
                          </Stack>
                        ) : (
                          <></>
                        )}

                        {agentParams ? (
                          <Stack spacing={1}>
                            <Typography>Agents</Typography>
                            <TextField
                              label="tolerance"
                              size="small"
                              type="number"
                              value={agentParams.tolerance}
                              onChange={e => {
                                agentParams.tolerance = +e.target.value
                                update()
                              }}
                            ></TextField>
                            <TextField
                              label="error proportion"
                              size="small"
                              type="number"
                              value={agentParams.errorProp}
                              onChange={e => {
                                agentParams.errorProp = +e.target.value
                                update()
                              }}
                            ></TextField>
                          </Stack>
                        ) : (
                          <></>
                        )}
                      </Stack>
                    </Card>
                  )
                })}
              </DialogContent>
              <DialogActions sx={{justifyContent: 'space-between'}}>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" onClick={addVariant}>
                    Add Variant
                  </Button>
                  <Button variant="outlined" onClick={() => setBatches([])}>
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
