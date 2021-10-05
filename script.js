// Create run buttons
function createRunButtons () {
    const runButtons = document.getElementById('run-buttons')

    simulationModes.names.forEach(mode => {
        // Field set

        const fieldSet = document.createElement('fieldset')
        fieldSet.className = 'border rounded border-gray-300 p-1'

        // Legend

        const legend = document.createElement('legend')
        legend.className = 'capitalize text-xs sm:text-sm xl:text-base'
        legend.innerText = mode.replace('-', ' ')

        // Button

        const button = document.createElement('button')
        button.className = 'bg-sky-600 rounded hover:bg-sky-700 text-gray-50 py-2 px-10 transition duration-250 capitalize shadow-md'
        button.innerText = 'charger'
        button.onclick = function () { runSimulation(mode) }

        // Append

        fieldSet.append(legend)
        fieldSet.append(button)
        runButtons.append(fieldSet)
    })
}
// Load params.json
function loadJson () {
    $.ajaxSetup({
        async: false
    })

    $.getJSON('params.json', data => {
        jsonParams = data
    })
}
// Create line chart data
function createLineCharts () {
    simulationModes.names.forEach((mode, index) => {
        resultColumns.quantum = 0

        for (let i = 0; i < 31; i++) {
            // Reset variables
            resetVariables()
            resultColumns.quantum += 1

            // Load data
            load(mode)

            // Load data in charts
            if (index === 0) {
                TmaLineChartConfig.data.labels.push(resultColumns.quantum)
                avgDurationLineChartConfig.data.labels.push(resultColumns.quantum)
            }

            TmaLineChartConfig.data.datasets[index].data.push(resultColumns.averageWaitDuration)
            avgDurationLineChartConfig.data.datasets[index].data.push(resultColumns.totalTime)
        }
    })

    resultColumns = {}
}
// Reset variables
function resetVariables () {
    processes = []
    waitDurations = []
    processIndex = 0
    resultColumns.averageWaitDuration = 0
    resultColumns.totalTime = 0
}
// Load data
function load (mode) {
    // Initialize processes
    jsonParams.processList.forEach(process => {
        if (mode === 'round-robin') {
            if (process.startTime === 0) {
                processes.push(process.duration)
            }
        } else if (mode === 'fastest-first') {
            processes.push(process.duration)
        }
    })

    // Initialize wait durations
    processes.forEach(() => {
        waitDurations.push(0)
    })

    // Load processes
    if (mode === 'round-robin') {
        loadProcessesRoundRobin()
    } else if (mode === 'fastest-first') {
        processes.sort((acc, cur) => acc - cur)
        loadProcessesFastestFirst()
    }

    // Set average wait and total time
    resultColumns.averageWaitDuration = (waitDurations.reduce((acc, cur) => acc + cur) / processes.length)
    resultColumns.totalTime = (resultColumns.totalTime / processes.length)
}
// Load processes using round robin method
function loadProcessesRoundRobin () {
    // Add context swap duration to wait duration
    for (let i = 0; i < processes.length; i++) {
        if (i !== processIndex && processes[i] !== 0 && processes.reduce((acc, cur) => acc + cur) !== processes[i]) {
            waitDurations[i] += jsonParams.contextSwapDuration
        }
    }

    // Substract the quantum value to the current process
    for (let i = 0; i < resultColumns.quantum; i++) {
        if (processes[processIndex] > 0) {
            processes[processIndex]--
            resultColumns.totalTime++

            // Add new processes
            jsonParams.processList.forEach(process => {
                if (resultColumns.totalTime === process.startTime) {
                    processes.splice(processIndex + 1, 0, process.duration)
                    waitDurations.splice(processIndex + 1, 0, 0)
                }
            })

            // Add wait duration
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

        for (let i = 0; i < jsonParams.contextSwapDuration; i++) {
            // Add context swap duration to total time
            resultColumns.totalTime++

            // Add new processes
            jsonParams.processList.forEach(process => {
                if (resultColumns.totalTime === process.startTime) {
                    processes.splice(processIndex + 1, 0, process.duration)
                    waitDurations.splice(processIndex + 1, 0, 0)
                }
            })
        }

        loadProcessesRoundRobin()
    }
}
// Load processes using fastest first method
function loadProcessesFastestFirst () {
    processes.forEach((process, index) => {
        let i = 0

        // While process is not loaded

        while (processes[index] > 0) {
            // Add wait duration

            const processesSum = processes.reduce((a, b) => a + b)

            for (let i2 = 0; i2 < processes.length; i2++) {
                if (i2 !== index && processes[i2] !== 0 && processesSum !== processes[i2]) {
                    waitDurations[i2]++
                }
            }

            // Every quantum duration

            if ((i + 1) % resultColumns.quantum === 0 && processes[index] > 1) {
                resultColumns.totalTime += jsonParams.contextSwapDuration

                for (let i2 = 0; i2 < processes.length; i2++) {
                    if (processes[i2] !== 0) {
                        waitDurations[i2] += jsonParams.contextSwapDuration
                    }
                }
            }

            // When process is loaded

            if (processes[index] === 1) {
                resultColumns.totalTime += jsonParams.contextSwapDuration

                for (let i2 = 0; i2 < processes.length; i2++) {
                    if (i2 !== index && processes[i2] !== 0 && processesSum !== processes[i2]) {
                        waitDurations[i2] += jsonParams.contextSwapDuration
                    }
                }
            }

            processes[index]--

            if (processes.reduce((acc, cur) => acc + cur) !== 0) {
                resultColumns.totalTime++
            }

            i++
        }
    })
}
// Run simulations
function runSimulation (mode) {
    // Get data from inputs

    resultColumns.mode = mode.replace('-', ' ')
    resultColumns.quantum = parseInt(document.getElementById('quantum-duration').value)

    // If all fields are filled

    if (!isNaN(resultColumns.quantum)) {
        // Reset variables
        resetVariables()

        // Load data
        load(mode)

        // Load data in pages
        loadPagesResults(mode)

        currentPage = pages.length

        // Update front

        loadResultsTable()
        updatePager()
    }
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

// Constants

const rowsPerTablePage = 4
let jsonParams = null

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

const TmaLineChartConfig = {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Round robin',
                data: [],
                borderColor: 'rgb(157, 200, 204)',
                backgroundColor: 'rgb(157, 200, 204)'
            },
            {
                label: 'Fastest first',
                data: [],
                borderColor: 'rgb(174, 181, 205)',
                backgroundColor: 'rgb(174, 181, 205)'
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
                tension: 0.2
            }
        }
    }
}

const avgDurationLineChartConfig = {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Round robin',
                data: [],
                borderColor: 'rgb(157, 200, 204)',
                backgroundColor: 'rgb(157, 200, 204)'
            },
            {
                label: 'Fastest first',
                data: [],
                borderColor: 'rgb(174, 181, 205)',
                backgroundColor: 'rgb(174, 181, 205)'
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
                    text: 'Temps de chargement moyen'
                }
            }
        },
        elements: {
            line: {
                tension: 0.2
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

// Main

createRunButtons()
loadJson()
document.getElementById('processes-number').innerText = jsonParams.processList.length
document.getElementById('quantum-duration').value = jsonParams.quantumDuration
createLineCharts()
