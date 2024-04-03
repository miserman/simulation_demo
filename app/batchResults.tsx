import type {BatchArgs, BatchResults} from './batch'
import {use, init, getInstanceByDom} from 'echarts/core'
import {LineChart, ScatterChart, type LineSeriesOption, type ScatterSeriesOption} from 'echarts/charts'
import {Box} from '@mui/material'
import {useEffect, useRef} from 'react'
import {GridComponent, LegendComponent, ToolboxComponent, TooltipComponent} from 'echarts/components'
import {SVGRenderer} from 'echarts/renderers'

use([LineChart, GridComponent, TooltipComponent, LegendComponent, ToolboxComponent, SVGRenderer, ScatterChart])

function Distributions({data}: {data: ScatterSeriesOption[]}) {
  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const chart = container.current ? init(container.current, 'dark', {renderer: 'svg'}) : null
    const resize = () => chart && chart.resize()
    window.addEventListener('resize', resize)
    return () => {
      chart && chart.dispose()
      window.removeEventListener('resize', resize)
    }
  }, [])
  useEffect(() => {
    if (container.current) {
      const chart = getInstanceByDom(container.current)
      if (chart) {
        if (data.length) {
          chart.setOption(
            {
              backgroundColor: '#000',
              animationDuration: 300,
              grid: {top: 30, right: 20, bottom: 50},
              toolbox: {
                feature: {
                  saveAsImage: {
                    name: 'batch_distributions',
                  },
                },
              },
              tooltip: {
                trigger: 'item',
                textStyle: {
                  color: '#fff',
                },
                backgroundColor: '#000',
                borderWidth: 0,
                valueFormatter: (value: number) => value.toFixed(2),
              },
              xAxis: {
                type: 'value',
                name: 'Final Value (across runs)',
                nameLocation: 'center',
                nameGap: 30,
                min: (value: {min: number}) => Math.floor(value.min),
              },
              yAxis: {
                type: 'value',
                name: 'Initial Value (across runs)',
                nameLocation: 'center',
                nameRotate: 90,
                nameGap: 40,
                min: (value: {min: number}) => Math.floor(value.min),
              },
              series: data,
            },
            false,
            true
          )
        } else {
          chart.clear()
        }
      }
    }
  }, [data])
  return <Box ref={container} sx={{pl: 1, pr: 1, pb: 0.5, height: 400, width: 1200, maxWidth: '100%'}} />
}

function Trends({variants, epochs, data}: {variants: string[]; epochs: number[]; data: LineSeriesOption[]}) {
  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const chart = container.current ? init(container.current, 'dark', {renderer: 'svg'}) : null
    const resize = () => chart && chart.resize()
    window.addEventListener('resize', resize)
    return () => {
      chart && chart.dispose()
      window.removeEventListener('resize', resize)
    }
  }, [])
  useEffect(() => {
    if (container.current) {
      const chart = getInstanceByDom(container.current)
      if (chart) {
        if (data.length) {
          chart.setOption(
            {
              backgroundColor: '#000',
              animationDuration: 300,
              grid: {top: 30, right: 20, bottom: 50},
              toolbox: {
                feature: {
                  saveAsImage: {
                    name: 'batch_trends',
                  },
                },
              },
              legend: {
                orient: 'vertical',
                left: 70,
                top: 20,
                data: variants,
                backgroundColor: '#000',
              },
              xAxis: {
                data: epochs,
                name: 'Epoch',
                nameLocation: 'center',
                nameGap: 30,
              },
              yAxis: {
                type: 'value',
                name: 'Mean Value (across runs, +/- SD)',
                nameLocation: 'center',
                nameRotate: 90,
                nameGap: 40,
                min: (value: {min: number}) => Math.floor(value.min),
              },
              series: data,
            },
            false,
            true
          )
        } else {
          chart.clear()
        }
      }
    }
  }, [data, epochs, variants])
  return <Box ref={container} sx={{p: 1, height: 400, width: 1200, maxWidth: '100%'}} />
}

export function BatchResultsDisplay({data, batches}: {data: {[index: string]: BatchResults}; batches: BatchArgs[]}) {
  const variants = Object.keys(data)
  const colors: {[index: string]: string} = {}
  let maxEpoch = -Infinity
  batches.forEach(batch => {
    if (batch.epochs > maxEpoch) maxEpoch = batch.epochs
    colors[batch.name] = batch.color
  })
  const epochs = Array.from({length: maxEpoch}, (_, i) => i + 1)
  const meanValues: number[][][] = []
  const meanSeries: LineSeriesOption[] = []
  variants.forEach(name => {
    const runs = data[name]
    const nRuns = runs.length
    const n = runs[0].means.length
    const nAgents = runs[0].initialValues.length
    const values: number[][] = new Array(nAgents)
    const mean: number[] = new Array(n).fill(0)
    const sd: number[] = new Array(n).fill(0)
    runs.forEach(run => {
      run.initialValues.forEach((x, i) => {
        if (!values[i]) values[i] = [0, 0]
        values[i][0] += run.finalValues[i]
        values[i][1] += x
      })
      run.means.forEach((x, i) => {
        mean[i] += x
      })
    })
    mean.forEach((_, i) => {
      mean[i] /= nRuns
    })
    values.forEach((_, i) => {
      values[i][0] /= nRuns
      values[i][1] /= nRuns
    })
    runs.forEach(run => {
      run.means.forEach((x, i) => {
        sd[i] += Math.pow(x - mean[i], 2)
      })
    })
    sd.forEach((_, i) => {
      sd[i] = Math.sqrt(sd[i] / nRuns)
    })
    meanValues.push(values)
    meanSeries.push({
      name: 'lower-' + name,
      type: 'line',
      data: sd.map((x, i) => mean[i] - x),
      lineStyle: {
        opacity: 0,
      },
      stack: 'band-' + name,
      symbol: 'none',
    })
    meanSeries.push({
      name,
      type: 'line',
      data: mean,
      showSymbol: false,
      color: colors[name],
    })
    meanSeries.push({
      name: 'upper-' + name,
      type: 'line',
      data: sd.map(x => x * 2),
      lineStyle: {
        opacity: 0,
      },
      areaStyle: {
        opacity: 0.2,
        color: colors[name],
      },
      stack: 'band-' + name,
      symbol: 'none',
    })
  })
  const scatterSeries: ScatterSeriesOption[] = []
  variants.forEach((name, i) => {
    scatterSeries.push({
      name,
      type: 'scatter',
      data: meanValues[i],
      color: colors[name],
    })
  })

  return (
    <Box>
      <Trends variants={variants} epochs={epochs} data={meanSeries} />
      <Distributions data={scatterSeries} />
    </Box>
  )
}
