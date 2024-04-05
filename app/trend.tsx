import {use, init, getInstanceByDom} from 'echarts/core'
import {LineChart} from 'echarts/charts'
import {Box} from '@mui/material'
import {useEffect, useRef} from 'react'
import {GridComponent, TooltipComponent} from 'echarts/components'
import type {Data} from './data'
import {SVGRenderer} from 'echarts/renderers'

use([LineChart, GridComponent, TooltipComponent, SVGRenderer])

const summary: {epoch: number[]; mean: number[]} = {
  epoch: [],
  mean: [],
}
export function Trend({epoch, data}: {epoch: number; data: Data[]}) {
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
          if (epoch === 1) {
            summary.epoch = []
            summary.mean = []
          }
          let mean = 0
          data.forEach(d => (mean += d.value))
          mean /= data.length
          summary.epoch.push(epoch)
          summary.mean.push(mean)
          chart.setOption(
            {
              color: '#d9ccff',
              backgroundColor: '#00000000',
              animationDuration: 300,
              grid: {top: 30, right: 30, bottom: 60, left: 60},
              tooltip: {
                trigger: 'axis',
                textStyle: {
                  color: '#fff',
                },
                backgroundColor: '#00000000',
                borderWidth: 0,
                valueFormatter: (value: number) => value.toFixed(2),
              },
              xAxis: {
                data: summary.epoch,
                name: 'Epoch',
                nameLocation: 'center',
                nameGap: 35,
              },
              yAxis: {
                type: 'value',
                name: 'Mean Value',
                nameLocation: 'center',
                nameRotate: 90,
                nameGap: 40,
                min: (value: {min: number}) => Math.floor(value.min),
              },
              series: [
                {
                  type: 'line',
                  data: summary.mean,
                  symbol: 'none',
                },
              ],
            },
            false,
            true
          )
        } else {
          chart.clear()
        }
      }
    }
  }, [data, epoch])
  return <Box ref={container} sx={{width: '100%', height: '100%', minHeight: '10px'}} />
}
