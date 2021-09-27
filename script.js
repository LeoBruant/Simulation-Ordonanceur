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

            // Load processes
            if (mode === 'round-robin') {
                resultColumns.totalTime = 0
                loadProcessesRoundRobin(0)
            } else if (mode === 'fastest-first') {
                processes.sort()
                resultColumns.totalTime = 0
                loadProcessesFastestFirst(0)
            }

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
}
// Randomly generate processes
function createProcesses (processesDurationMin, processesDurationMax) {
    let processesDuration = 0

    // Randomly generate processes

    for (let i = 0; i < processesNumber; i++) {
        const duration = Math.round(Math.random() * (processesDurationMax - processesDurationMin) + processesDurationMin)

        processes.push(duration)
        processesDuration += duration
    }

    // Get average processes loading time

    resultColumns.averageProcessDuration = (processesDuration / processesNumber).toFixed(2)
}
// Load processes using round robin method
function loadProcessesRoundRobin (processIndex) {
    // Substract the quantum value to the current process

    for (let i = 0; i < resultColumns.durationPerRound; i++) {
        if (processes[processIndex] > 0) {
            processes[processIndex]--
        }

        resultColumns.totalTime++
    }

    resultColumns.totalTime += resultColumns.contextChangeDuration

    // If all processes are not loaded

    if (processes.length !== 0) {
        // If process is loaded or not

        if (processes[processIndex] === 0) {
            // Remove process

            processes.splice(processIndex, 1)

            // Go back to the first process if we are at the end

            if (processIndex === processes.length) {
                processIndex = 0
            }
        } else {
            // Go back to the first process if we are at the end

            if (processIndex === processes.length - 1) {
                processIndex = 0
            } else {
                processIndex++
            }
        }

        loadProcessesRoundRobin(processIndex)
    }
}
// Load processes using fastest first method
function loadProcessesFastestFirst () {
    processes.forEach((process, index) => {
        let i = 0
        const currentProcess = processes[process]

        // While process is not loaded

        while (i < currentProcess) {
            if (process > 0) {
                processes[index]--
                resultColumns.totalTime++
            }

            if ((i + 1) % resultColumns.durationPerRound === 0) {
                resultColumns.totalTime += resultColumns.contextChangeDuration
            }

            i++
        }

        // If process is loaded

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
    pagesRowModes[pages.length - 1][pages[pages.length - 1].length - 1] = mode

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
            column.className = 'border border-sky-600 p-2 border-opacity-40 ' + rowColors[pagesRowModes[currentPage - 1][rowIndex]]

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

        for (let i = pageSelector.childElementCount; i < pages.length + 1; i++) {
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

const processesNumber = 10
const processesDurationMin = 1
const processesDurationMax = 10
const rowsPerTablePage = 10
const rowColors = []
rowColors['round-robin'] = 'bg-cyan-100'
rowColors['fastest-first'] = 'bg-indigo-100'

// Variables

const resultColumns = {}
let processes = []
const pages = []
const pagesRowModes = []
let totalElementsNumber = 0
let currentPage = 1

// Main

document.getElementById('processes-number').innerText = processesNumber
document.getElementById('processes-duration-min').innerText = processesDurationMin
document.getElementById('processes-duration-max').innerText = processesDurationMax
