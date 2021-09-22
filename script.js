// Load processes

function loadProcesses(current){
	// Substract the quantum value to the current process

    for (let i = 0; i < resultColumns.quantumPerRound; i++){
		if(processes[current] > 0){
			processes[current]--
			totalTime++
		}
	}

    // If Processes are still loading

	if(processes.length !== 0){

        // Remove process if it is loaded

		if(processes[current] === 0){
			processes.splice(current, 1)

            // Go back to the first process if we are at the end

            if(current === processes.length){
                current = 0
            }
		}
        
        else{
            // Go back to the first process if we are at the end

            if(current === processes.length - 1){
                current = 0
            }

            // Or keep going

            else{
                current++
            }
        }

        totalTime += resultColumns.contextChangeDuration

        loadProcesses(current)
	}
}

// Create processes

function createProcesses(processesDurationMin, processesDurationMax){
    let averageProcessDuration = 0

    for (let i = 0; i < resultColumns.processesNumber; i++){
        let duration = Math.round(Math.random() * (processesDurationMax - processesDurationMin) + processesDurationMin)

        processes.push(duration)
        averageProcessDuration += duration
	}

    resultColumns.averageProcessDuration = (averageProcessDuration / resultColumns.processesNumber).toFixed(2)
}

// Show results after clicking button

function showResults(){
    resultColumns.processesNumber = parseInt(document.getElementById('processes-number').value)
    resultColumns.quantumPerRound = parseInt(document.getElementById('quantum-number').value)
    resultColumns.contextChangeDuration = parseInt(document.getElementById('context-change-duration').value)
    let processesDurationMin = parseInt(document.getElementById('processes-load-min').value)
    let processesDurationMax = parseInt(document.getElementById('processes-load-max').value)

    // If all fields are filled

    if (!isNaN(resultColumns.processesNumber) && !isNaN(resultColumns.quantumPerRound) && !isNaN(resultColumns.contextChangeDuration) && !isNaN(processesDurationMin) && !isNaN(processesDurationMax)){

        // Reset variables

        totalTime = 0
        processes = []

        // Create and load processes

        createProcesses(processesDurationMin, processesDurationMax)
        loadProcesses(0)

        // Create table rows

        let resultsTable = document.querySelector('#results table tbody')
        let row = document.createElement('tr')
        
        Object.values(resultColumns).forEach(data => {
            let column = document.createElement('td')

            column.innerText = data
            column.className = 'border border-sky-600 p-2'

            if (resultsTable.childElementCount % 2 === 0){
                column.className += ' bg-sky-100'
            }

            row.append(column)
        })

        resultsTable.append(row)
    }
}

// Variables

let totalTime = 0
let processes = []
let resultColumns = {}