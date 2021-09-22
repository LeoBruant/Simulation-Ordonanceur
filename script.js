// Load processes

function loadProcesses(current, quantumPerRound, contextChangeDuration){
	// Substract the quantum value to the current process

	for(let i = 0; i < quantumPerRound; i++){
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

        totalTime += contextChangeDuration

        loadProcesses(current, quantumPerRound, contextChangeDuration)
	}
}

// Create processes

function createProcesses(processesNumber, processesDurationMin, processesDurationMax){
    averageProcessDuration = 0

	for(let i = 0; i < processesNumber; i++){
        let duration = Math.round(Math.random() * (processesDurationMax - processesDurationMin) + processesDurationMin)

        processes.push(duration)
        averageProcessDuration += duration
	}

    averageProcessDuration = (averageProcessDuration/processesNumber).toFixed(2)
}

// Show results after clicking button

function showResults(){
    let processesNumber = parseInt(document.getElementById('process-number').value)
    let quantumPerRound = parseInt(document.getElementById('quantum-number').value)
    let contextChangeDuration = parseInt(document.getElementById('context-change-duration').value)
    let processesDurationMin = parseInt(document.getElementById('processes-load-min').value)
    let processesDurationMax = parseInt(document.getElementById('processes-load-max').value)

    // If all fields are filled

    if (!isNaN(processesNumber) && !isNaN(quantumPerRound) && !isNaN(contextChangeDuration) && !isNaN(processesDurationMin) && !isNaN(processesDurationMax)){

        // Reset variables

        totalTime = 0
        processes = []

        // Create and load processes

        createProcesses(processesNumber, processesDurationMin, processesDurationMax)
        loadProcesses(0, quantumPerRound, contextChangeDuration)
    }
}

// Variables

let totalTime = 0
let processes = []
let averageProcessDuration = 0