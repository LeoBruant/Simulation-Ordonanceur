function loadProcessesRoundRobin(processIndex){
    // Substract the quantum value to the current process
    
    for (let i = 0; i < resultColumns.quantumPerRound; i++){
        if (processes[processIndex] > 0){
            processes[processIndex]--
            totalTime++
        }
    }
    
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
        
        // Add context change duration to total time
        
        totalTime += resultColumns.contextChangeDuration
        
        loadProcessesRoundRobin(processIndex)
    }
}

function loadProcessesSmallestFirst(){
    processes.forEach((process, index) => {
        for (let i = 0; i < process; i++){
            if (process > 0){
                processes[index]--
                totalTime++
                
                if(i % resultColumns.quantumPerRound === 0){
                    totalTime += resultColumns.contextChangeDuration
                }
            }
        }
    })
}

function createProcesses(processesDurationMin, processesDurationMax){
    let processesDuration = 0
    
    // Randomly create processes
    
    for (let i = 0; i < resultColumns.processesNumber; i++){
        let duration = Math.round(Math.random() * (processesDurationMax - processesDurationMin) + processesDurationMin)
        
        processes.push(duration)
        processesDuration += duration
    }
    
    // Get process average time
    
    resultColumns.averageProcessDuration = (processesDuration / resultColumns.processesNumber).toFixed(2)
}

function reset() {
    totalTime = 0
    processes = []
}

function loadResultsTable() {
    let resultsTable = document.querySelector('#results table tbody')
    let row = document.createElement('tr')
    
    // Check if row number is even
    
    var background = ''
    
    if (resultsTable.childElementCount % 2 === 0) {
        background += ' bg-warmGray-100'
    }
    
    // Add row number
    
    let column = document.createElement('td')
    
    column.innerText = resultsTable.childElementCount + 1
    column.className = 'border-t border-b border-l-2 border-r-2 border-sky-600 p-2 xl:font-semibold border-opacity-40'
    
    // Set background
    
    column.className += background
    
    row.append(column)
    
    // For each column
    
    Object.values(resultColumns).forEach(data => {
        
        // Fill data
        
        column = document.createElement('td')
        
        column.innerText = data
        column.className = 'border border-sky-600 p-2 border-opacity-40'
        
        // Set background
        
        column.className += background
        
        // Add data to row
        
        row.append(column)
    })
    
    // Add row to table
    
    resultsTable.append(row)
}

// Run simulations after clicking button
function runSimulations() {
    // Get data from inputs

    resultColumns.mode = document.getElementById('simulation-mode').value.replace('-', ' ')
    resultColumns.processesNumber = parseInt(document.getElementById('processes-number').value)
    resultColumns.quantumPerRound = parseInt(document.getElementById('quantum-number').value)
    resultColumns.contextChangeDuration = parseInt(document.getElementById('context-change-duration').value)

    let processesDurationMin = parseInt(document.getElementById('processes-load-min').value)
    let processesDurationMax = parseInt(document.getElementById('processes-load-max').value)
    
    let simulationNumber = parseInt(document.getElementById('simulation-number').value)
    let simulationMode = document.getElementById('simulation-mode').value
    
    // If all fields are filled
    
    if (!isNaN(resultColumns.processesNumber) && !isNaN(resultColumns.quantumPerRound) && !isNaN(resultColumns.contextChangeDuration) && !isNaN(processesDurationMin) && !isNaN(processesDurationMax)){
        for (let i = 0; i < simulationNumber; i++){
            // Reset variables
            reset()
            
            // Create processes
            createProcesses(processesDurationMin, processesDurationMax)
            
            // Load processes round robin
            if(simulationMode === 'round-robin'){
                loadProcessesRoundRobin(0)
                resultColumns.totalTime = totalTime
            }
            
            // Load processes smallest first
            else if(simulationMode === 'smallest-first'){
                processes.sort()
                loadProcessesSmallestFirst(0)
                
                console.log(processes)
            }
            
            // Load data in results table
            loadResultsTable()
        }
    }
}

// Variables

let totalTime = 0
let processes = []
let resultColumns = {}