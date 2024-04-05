import {use, init, getInstanceByDom} from 'echarts/core'
import {TooltipComponent, VisualMapComponent} from 'echarts/components'
import {GraphChart} from 'echarts/charts'
import {CanvasRenderer} from 'echarts/renderers'
import {Box} from '@mui/material'
import {useEffect, useRef} from 'react'
import type {Data, Links} from './data'

use([GraphChart, CanvasRenderer, VisualMapComponent, TooltipComponent])

export function Graph({data, links}: {data: Data[]; links: Links[]}) {
  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const chart = container.current ? init(container.current, 'dark', {renderer: 'canvas'}) : null
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
          let min = Infinity
          let max = -Infinity
          data.forEach(d => {
            if (d.value < min) min = d.value
            if (d.value > max) max = d.value
          })
          chart.setOption(
            {
              visualMap: {
                min: min + 2,
                max: max - 2,
                right: 10,
                top: 10,
                text: ['high', 'low'],
                calculable: true,
                inRange: {
                  color: ['#7257ff', '#f2c31a'],
                },
              },
              tooltip: {
                textStyle: {
                  color: '#fff',
                },
                backgroundColor: '#000',
                borderWidth: 0,
                valueFormatter: (value: number) => value.toFixed(2),
              },
              backgroundColor: '#00000000',
              animationDuration: 300,
              series: [
                {
                  type: 'graph',
                  data,
                  links,
                  roam: true,
                  emphasis: {
                    focus: 'adjacency',
                    itemStyle: {opacity: 1},
                    label: {opacity: 1},
                    lineStyle: {
                      width: 10,
                      opacity: 1,
                    },
                  },
                  blur: {
                    itemStyle: {opacity: 0.3},
                    lineStyle: {opacity: 0.3},
                    label: {opacity: 0.3},
                  },
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
  }, [data, links])
  return <Box ref={container} sx={{width: '100%', height: '100%', minHeight: '10px'}} />
}
