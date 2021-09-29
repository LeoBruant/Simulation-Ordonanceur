// Run simulations
function runSimulations (mode) {
    // Get data from inputs

    resultColumns.mode = mode.replace('-', ' ')
    resultColumns.durationPerRound = parseInt(document.getElementById('round-duration').value)
    resultColumns.contextChangeDuration = parseInt(document.getElementById('context-change-duration').value)

    const simulationNumber = parseInt(document.getElementById('simulation-number').value)

    // If all fields are filled

    if (!isNaN(resultColumns.durationPerRound) && !isNaN(resultColumns.contextChangeDuration)) {
        for (let i = 0; i < simulationNumber; i++) {
            // Reset variables
            resetVariables()

            // Create processes
            createProcesses(processesDurationMin, processesDurationMax)

            // Initialize wait durations
            processes.forEach((process) => {
                waitDurations.push(0)
            })

            // Load processes
            if (mode === 'round-robin') {
                loadProcessesRoundRobin()
            } else if (mode === 'fastest-first') {
                processes.sort()
                loadProcessesFastestFirst()
            }

            // Set average wait time
            resultColumns.averageWaitDuration = (waitDurations.reduce((acc, cur) => acc + cur) / processes.length).toFixed(2)

            // Load data in pages
            loadPagesResults(mode)
        }

        currentPage = pages.length

        // Update front

        loadResultsTable()
        updatePager()
    }
}
// Reset variables
function resetVariables () {
    processes = []
    waitDurations = []

    resultColumns = {
        mode: resultColumns.mode,
        durationPerRound: resultColumns.durationPerRound,
        contextChangeDuration: resultColumns.contextChangeDuration,
        averageWaitDuration: 0,
        totalTime: 0
    }
}
// Randomly generate processes
function createProcesses (processesDurationMin, processesDurationMax) {
    // let processesDuration = 0

    // Randomly generate processes

    for (let i = 0; i < processesNumber; i++) {
        const duration = Math.round(Math.random() * (processesDurationMax - processesDurationMin) + processesDurationMin)

        processes.push(duration)
        // processesDuration += duration
    }

    // Get average processes loading time

    // resultColumns.averageProcessDuration = (processesDuration / processesNumber).toFixed(2)
}
// Load processes using round robin method
function loadProcessesRoundRobin () {
    // Add context change duration to wait times

    for (let i = 0; i < processes.length; i++) {
        if (i !== processIndex && processes[i] !== 0 && processes.reduce((acc, cur) => acc + cur) !== processes[i]) {
            waitDurations[i] += resultColumns.contextChangeDuration
        }
    }

    // Substract the quantum value to the current process

    for (let i = 0; i < resultColumns.durationPerRound; i++) {
        if (processes[processIndex] > 0) {
            processes[processIndex]--
            resultColumns.totalTime++

            // Add wait times

            for (let i = 0; i < processes.length; i++) {
                if (i !== processIndex && processes[i] !== 0) {
                    waitDurations[i]++
                }
            }
        }
    }

    // If processes are not all loaded

    if (processes.reduce((acc, cur) => acc + cur) !== 0) {
        // Go back to first process or keep going

        if (processIndex === processes.length - 1) {
            processIndex = 0
        } else {
            processIndex++
        }

        resultColumns.totalTime += resultColumns.contextChangeDuration
        loadProcessesRoundRobin()
    }
}
// Load processes using fastest first method
function loadProcessesFastestFirst () {
    processes.forEach((process, index) => {
        // Add context change duration to wait times

        for (let i = 0; i < processes.length; i++) {
            if (i !== index && processes[i] !== 0 && processes.reduce((acc, cur) => acc + cur) !== processes[i]) {
                waitDurations[i] += resultColumns.contextChangeDuration
            }
        }

        // While process is not loaded

        while (processes[index] > 0) {
            resultColumns.totalTime++
            processes[index]--

            // Add wait times

            for (let i = 0; i < processes.length; i++) {
                if (i !== index && processes[i] !== 0) {
                    waitDurations[i]++
                }
            }
        }

        resultColumns.totalTime += resultColumns.contextChangeDuration
    })
}
// Load results in form of pages
function loadPagesResults (mode) {
    // Add page in none
    if (pages.length === 0 || pages[pages.length - 1].length === rowsPerTablePage) {
        pages.push([[]])

        pagesRowModes.push([[]])
    }

    // Add row if last row is full
    if (pages[pages.length - 1][pages[pages.length - 1].length - 1].length === Object.values(resultColumns).length + 1) {
        pages[pages.length - 1].push([])

        pagesRowModes[pages.length - 1].push([])
    }

    // Calculate total elements number
    totalElementsNumber = 0

    pages.forEach(page => {
        page.forEach(() => {
            totalElementsNumber++
        })
    })

    // Add row number
    pages[pages.length - 1][pages[pages.length - 1].length - 1].push(totalElementsNumber)

    // Add row mode
    let colorIndex = 0

    simulationModes.names.forEach((name, index) => {
        if (mode === name) {
            colorIndex = index
        }
    })

    pagesRowModes[pages.length - 1][pages[pages.length - 1].length - 1] = colorIndex

    // Add data
    Object.values(resultColumns).forEach(data => {
        pages[pages.length - 1][pages[pages.length - 1].length - 1].push(data)
    })
}
// Load page results into results table
function loadResultsTable () {
    const resultsTable = document.querySelector('#results table tbody')
    resultsTable.innerHTML = ''

    // For each column

    pages[currentPage - 1].forEach((pageRow, rowIndex) => {
        const row = document.createElement('tr')

        pageRow.forEach(data => {
            // Fill data

            const column = document.createElement('td')

            column.innerText = data
            column.className = 'border border-sky-600 p-2 border-opacity-40 ' + simulationModes.colors[pagesRowModes[currentPage - 1][rowIndex]]

            // Add data to row

            row.append(column)
        })

        // Add row to table

        resultsTable.append(row)
    })
}
// Update pager text
function updatePager () {
    // Total elements number

    document.getElementById('total-elements-number').innerText = totalElementsNumber + ' élément(s)'

    // Page selector

    const pageSelector = document.getElementById('page-selector')

    // If page selector is empty or not

    if (pageSelector.childElementCount === 0) {
        pages.forEach((page, key) => {
            const option = document.createElement('option')
            option.innerText = (key + 1)
            option.value = (key + 1)

            pageSelector.append(option)
        })
    } else {
        pageSelector.innerHTML = ''

        for (let i = pageSelector.childElementCount; i < pages.length; i++) {
            const option = document.createElement('option')
            option.innerText = i + 1
            option.value = i + 1

            pageSelector.append(option)
        }
    }

    pageSelector.value = currentPage

    // Current page

    document.getElementById('current-page').innerHTML = currentPage
    document.getElementById('pages-number').innerHTML = '/' + pages.length

    // Make visible

    const pager = document.getElementsByClassName('pager')[0]

    if (pager.style.visibility !== 'visible') {
        pager.style.visibility = 'visible'
    }
}
// Go to prev or next page
function changePage (direction) {
    // If using arrows or selector

    if ((direction === -1 && currentPage > 1) || (direction === 1 && pages[currentPage - 1 + direction] !== undefined)) {
        currentPage += direction

        loadResultsTable()
        updatePager()
    } else if (direction === 0) {
        currentPage = parseInt(document.getElementById('page-selector').value)

        loadResultsTable()
        updatePager()
    }
}
// Go to first or last page
function pagesEdge (direction) {
    if (direction === -1 && currentPage > 1) {
        currentPage = 1
    } else if (direction === 1 && currentPage !== pages.length) {
        currentPage = pages.length
    }

    loadResultsTable()
    updatePager()
}
// Create line chart data
function variableRoundDurationChart () {
    simulationModes.names.forEach((mode, index) => {
        resultColumns.durationPerRound = 0

        for (let i = 0; i < 75; i++) {
            // Reset variables
            resetVariables()
            resultColumns.durationPerRound += 3

            // Create processes
            createProcesses(processesDurationMin, processesDurationMax)

            // Initialize wait durations
            processes.forEach((process) => {
                waitDurations.push(0)
            })

            // Load processes
            if (mode === 'round-robin') {
                loadProcessesRoundRobin()
            } else if (mode === 'fastest-first') {
                processes.sort()
                loadProcessesFastestFirst()
            }

            // Set average wait time
            resultColumns.averageWaitDuration = (waitDurations.reduce((acc, cur) => acc + cur) / processes.length).toFixed(2)

            if (index === 0) {
                lineChartConfig.data.labels.push(resultColumns.durationPerRound)
            }

            lineChartConfig.data.datasets[index].data.push(resultColumns.averageWaitDuration)
        }
    })
}

// Constants

const processesNumber = 100
const processesDurationMin = 150
const processesDurationMax = 175
const rowsPerTablePage = 10

const simulationModes = {
    names: [
        'round-robin',
        'fastest-first'
    ],
    colors: [
        'bg-cyan-100',
        'bg-indigo-100'
    ]
}

const lineChartConfig = {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Round robin',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgb(75, 192, 192)'
            },
            {
                label: 'Fastest first',
                data: [],
                borderColor: 'rgb(192, 192, 75)',
                backgroundColor: 'rgb(192, 192, 75)'
            }
        ]
    },
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Quantum'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'TMA'
                }
            }
        },
        elements: {
            line: {
                tension: 0.25
            }
        }
    }
}

// Variables

let resultColumns = {}
let processes = []
let processIndex = 0
let waitDurations = []
const pages = []
const pagesRowModes = []
let totalElementsNumber = 0
let currentPage = 1

// Add values to front

document.getElementById('processes-number').innerText = processesNumber

// Create run buttons

const runButtons = document.getElementById('run-buttons')

simulationModes.names.forEach(mode => {
    const fieldSet = document.createElement('fieldset')
    fieldSet.className = 'border rounded border-gray-300 p-1'

    const legend = document.createElement('legend')
    legend.className = 'capitalize text-xs sm:text-sm xl:text-base'
    legend.innerText = mode.replace('-', ' ')

    const button = document.createElement('button')
    button.className = 'bg-sky-600 rounded hover:bg-sky-700 text-gray-50 py-2 px-10 transition duration-250 capitalize shadow-md'
    button.innerText = 'charger'
    button.onclick = function () { runSimulations(mode) }

    fieldSet.append(legend)
    fieldSet.append(button)

    runButtons.append(fieldSet)
})

// Main

resetVariables()

resultColumns.contextChangeDuration = 1

variableRoundDurationChart()
