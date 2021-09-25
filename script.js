// Run simulations
function runSimulations(mode) {
    // Get data from inputs

    resultColumns.mode = mode.replace('-', ' ')
    resultColumns.durationPerRound = parseInt(document.getElementById('round-duration').value)
    resultColumns.contextChangeDuration = parseInt(document.getElementById('context-change-duration').value)

    let simulationNumber = parseInt(document.getElementById('simulation-number').value)

    // If all fields are filled

    if (!isNaN(resultColumns.durationPerRound) && !isNaN(resultColumns.contextChangeDuration)) {
        for (let i = 0; i < simulationNumber; i++) {
            // Reset variables
            resetVariables()

            // Create processes
            createProcesses(processesDurationMin, processesDurationMax)

            // Load processes round robin
            if (mode === 'round-robin') {
                resultColumns.totalTime = 0
                loadProcessesRoundRobin(0)
            }

            // Load processes smallest first
            else if (mode === 'fastest-first') {
                processes.sort()
                resultColumns.totalTime = 0
                loadProcessesFastestFirst(0)
            }

            // Load data in pages
            loadPagesResults(mode)
        }

        // Update front

        loadResultsTable()
        updatePager()
    }
}
// Reset variables
function resetVariables() {
    totalTime = 0
    processes = []
}
// Randomly generate processes
function createProcesses(processesDurationMin, processesDurationMax) {
    let processesDuration = 0

    // Randomly generate processes

    for (let i = 0; i < processesNumber; i++) {
        let duration = Math.round(Math.random() * (processesDurationMax - processesDurationMin) + processesDurationMin)

        processes.push(duration)
        processesDuration += duration
    }

    // Get average processes loading time

    resultColumns.averageProcessDuration = (processesDuration / processesNumber).toFixed(2)
}
// Load processes using round robin method
function loadProcessesRoundRobin(processIndex) {
    // Substract the quantum value to the current process
    
    for (let i = 0; i < resultColumns.durationPerRound; i++){
        if (processes[processIndex] > 0){
            processes[processIndex]--
        }
        
        resultColumns.totalTime++
    }
    
    resultColumns.totalTime += resultColumns.contextChangeDuration
    
    // If Processes are still loading
    
    if(processes.length !== 0){
        
        // Remove process if it is loaded
        
        if (processes[processIndex] === 0){
            processes.splice(processIndex, 1)
            
            // Go back to the first process if we are at the end
            
            if (processIndex === processes.length){
                processIndex = 0
            }
        }
        
        else{
            // Go back to the first process if we are at the end
            
            if (processIndex === processes.length - 1){
                processIndex = 0
            }
            
            // Or keep going
            
            else{
                processIndex++
            }
        }
        
        loadProcessesRoundRobin(processIndex)
    }
}
// Load processes using fastest first method
function loadProcessesFastestFirst() {
    processes.forEach((process, index) => {
        let i = 0
        let currentProcess = processes[process]
        
        // While process is not loaded
        
        while (i < currentProcess){
            if (process > 0){
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
function loadPagesResults(mode){
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
        page.forEach(row => {
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
function loadResultsTable() {
    let resultsTable = document.querySelector('#results table tbody')
    resultsTable.innerHTML = ''
    
    // For each column
    
    pages[currentPage - 1].forEach((pageRow, rowIndex) => {
        let row = document.createElement('tr')

        pageRow.forEach(data => {
            // Fill data

            column = document.createElement('td')

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
function updatePager(){
    document.getElementById('current-page').innerText = currentPage + '/' + pages.length
    document.getElementById('total-elements').innerText = totalElementsNumber + ' éléments'
    document.getElementsByClassName('pager')[0].style.visibility = 'visible'
}
// Go to prev or next page
function changePage(direction) {
    if ((direction === -1 && currentPage > 1) || (direction === 1 && pages[currentPage - 1 + direction] !== undefined)){
        currentPage += direction

        loadResultsTable()
        updatePager()
    }
}
// Go to first or last page
function pagesEdge(direction){
    if (direction === -1 && currentPage > 1){
        currentPage = 1
    }

    else if (direction === 1 && currentPage !== pages.length){
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

let rowColors = []
rowColors['round-robin'] = 'bg-cyan-100'
rowColors['fastest-first'] = 'bg-indigo-100'

// Variables

let resultColumns = {}
let processes = []
let pages = []
let pagesRowModes = []
let totalElementsNumber = 0
let currentPage = 1

// Main

document.getElementById('processes-number').innerText = processesNumber
document.getElementById('processes-duration-min').innerText = processesDurationMin
document.getElementById('processes-duration-max').innerText = processesDurationMax