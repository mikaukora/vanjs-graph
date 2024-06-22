import van from 'vanjs-core'
import Chart from 'chart.js/auto'

type Vote = {
  color: string
  votes: number
}

const URL = 'http://localhost:3001/votes'

const { section, header, h1, p, div, canvas, time, span, ul, li } = van.tags

const fetchData = async <T>(url: string): Promise<T | undefined> => {
  try {
    const response = await fetch(URL)
    return response.json()
  } catch (error) {
    return undefined
  }
}

const getTime = () => new Date().toLocaleTimeString()

const Time = (refreshMs?: number | undefined) => {
  const currentTime = van.state(getTime())

  refreshMs &&
    setInterval(() => {
      currentTime.val = getTime()
    }, refreshMs)

  return time(currentTime)
}

/* Calls external API once and calls onError in case of error. */
const Votes = async ({ onError }: { onError?: () => HTMLElement }, children?: HTMLElement) => {
  const data = await fetchData<Vote[]>(URL)

  // Render empty chart if onError is not given
  if (!data && onError) {
    return onError()
  }

  const labels = data?.map(e => e.color)
  const votes = data?.map(e => e.votes)

  const chart = new Chart(canvas(), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '# of Votes',
          data: votes,
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  })

  return () => div(chart.canvas, children)
}

/* Calls external API periodically if refreshMs is given. */
const VotesWithRefresh = async ({ refreshMs }: { refreshMs?: number | undefined }) => {
  const data = van.state(await fetchData<Vote[]>(URL))
  const currentTime = van.state(getTime())

  const labels = van.derive(() => data.val.map(e => e.color))
  const votes = van.derive(() => data.val.map(e => e.votes))

  const chartCanvas = van.derive(() => {
    const chartObj = new Chart(canvas(), {
      type: 'bar',
      data: {
        labels: labels.val,
        datasets: [
          {
            label: '# of Votes',
            data: votes.val,
            borderWidth: 1
          }
        ]
      },
      options: {
        animation: refreshMs && false, // do not animate if refreshing
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })

    return chartObj.canvas
  })

  refreshMs &&
    setInterval(async () => {
      const updatedData = await fetchData<Vote[]>(URL)
      if (updatedData) {
        data.val = updatedData
        currentTime.val = getTime()
      }
    }, refreshMs)

  return div(
    span(
      // State-derived child node
      () => chartCanvas.val,
      span('Chart refreshed at '),
      time(currentTime)
    )
  )
}

const Header = () =>
  header(
    h1('VanJS + chart.js example'),
    p(
      'This VanJS example demonstrates following:',
      ul(li('Asynchronous components with async/await'), li('Rehreshing component data periodically'))
    ),
    div(span('Started at '), Time()),
    div(span('Current time '), Time(1000))
  )

export const App = async () => {
  return section(
    { class: 'app' },
    Header(),
    await VotesWithRefresh({ refreshMs: 10000 })
    /* Alternatives if refresh is not needed:
    await Votes({ onError: () => div('chart data missing') }, div(span('Chart refreshed at '), Time())),
    await Votes({}, div(span('Chart refreshed at '), Time()))
    */
  )
}
