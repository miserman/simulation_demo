import {use, init, getInstanceByDom} from 'echarts/core'
import {LineChart} from 'echarts/charts'
import {Box} from '@mui/material'
import {useEffect, useRef} from 'react'
import {GridComponent, LegendComponent} from 'echarts/components'
import {density, makeBins} from '@/lib/utils'
import type {Data} from './data'
import {SVGRenderer} from 'echarts/renderers'

use([LineChart, GridComponent, LegendComponent, SVGRenderer])

let initial: number[] = []
export function Distribution({epoch, data}: {epoch: number; data: Data[]}) {
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
          const values = data.map(d => d.value)
          const bins = makeBins([...values, ...initial])
          if (epoch === 1 || initial.length === 0) {
            initial = values
          }
          chart.setOption(
            {
              backgroundColor: '#000',
              animationDuration: 300,
              grid: {top: 30, right: 30, bottom: 60},
              legend: {
                left: 'right',
                data: ['current', 'initial'],
              },
              xAxis: {
                type: 'category',
                boundaryGap: false,
                data: bins,
                name: 'Value',
                nameLocation: 'center',
                nameGap: 35,
              },
              yAxis: {
                type: 'value',
                name: 'Density',
                nameLocation: 'center',
                nameRotate: 90,
                nameGap: 40,
                min: 0,
              },
              series: [
                {
                  name: 'current',
                  type: 'line',
                  areaStyle: {opacity: 0.4},
                  data: density(bins, values),
                  symbol: 'none',
                },
                {
                  name: 'initial',
                  type: 'line',
                  data: density(bins, initial),
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