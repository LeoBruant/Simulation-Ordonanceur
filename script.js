function loadProcessesRoundRobin(processIndex){
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

function loadProcessesFastestFirst(){
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

function createProcesses(processesDurationMin, processesDurationMax){
    let processesDuration = 0
    
    // Randomly create processes
    
    for (let i = 0; i < processesNumber; i++){
        let duration = Math.round(Math.random() * (processesDurationMax - processesDurationMin) + processesDurationMin)
        
        processes.push(duration)
        processesDuration += duration
    }
    
    // Get process average time
    
    resultColumns.averageProcessDuration = (processesDuration / processesNumber).toFixed(2)
}

function reset() {
    totalTime = 0
    processes = []
}

function loadResultsTable(mode) {
    let resultsTable = document.querySelector('#results table tbody')
    let row = document.createElement('tr')
    
    // Add row number
    
    let column = document.createElement('td')
    
    column.innerText = resultsTable.childElementCount + 1
    column.className = 'border-t border-b border-l-2 border-r-2 border-sky-600 p-2 xl:font-semibold border-opacity-40 ' + rowColors[mode]
    
    row.append(column)
    
    // For each column
    
    Object.values(resultColumns).forEach(data => {
        
        // Fill data
        
        column = document.createElement('td')
        
        column.innerText = data
        column.className = 'border border-sky-600 p-2 border-opacity-40 ' + rowColors[mode]
        
        // Add data to row
        
        row.append(column)
    })
    
    // Add row to table
    
    resultsTable.append(row)
}

// Run simulations after clicking button
function runSimulations(mode) {
    // Get data from inputs
    
    resultColumns.mode = mode.replace('-', ' ')
    resultColumns.durationPerRound = parseInt(document.getElementById('round-duration').value)
    resultColumns.contextChangeDuration = parseInt(document.getElementById('context-change-duration').value)
    
    let simulationNumber = parseInt(document.getElementById('simulation-number').value)
    
    // If all fields are filled
    
    if (!isNaN(resultColumns.durationPerRound) && !isNaN(resultColumns.contextChangeDuration)){
        for (let i = 0; i < simulationNumber; i++){
            // Reset variables
            reset()
            
            // Create processes
            createProcesses(processesDurationMin, processesDurationMax)
            
            // Load processes round robin
            if(mode === 'round-robin'){
                resultColumns.totalTime = 0
                loadProcessesRoundRobin(0)
            }
            
            // Load processes smallest first
            else if(mode === 'fastest-first'){
                processes.sort()
                resultColumns.totalTime = 0
                loadProcessesFastestFirst(0)
            }
            
            // Load data in results table
            loadResultsTable(mode)
        }
    }
}

// Constants

const processesNumber = 10
const processesDurationMin = 1
const processesDurationMax = 10
let rowColors = []
rowColors['round-robin'] = 'bg-cyan-100'
rowColors['fastest-first'] = 'bg-indigo-100'

// Variables

let processes = []
let resultColumns = {}

// Main

document.getElementById('processes-number').innerText = processesNumber
document.getElementById('processes-duration-min').innerText = processesDurationMin
document.getElementById('processes-duration-max').innerText = processesDurationMax