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

function createProcesses(processesNumber){
	for(let i = 0; i < processesNumber; i++){
		processes.push(Math.round((Math.random() * processesDurationMax) + processesDurationMin))
	}
}

// Show results after clicking button

function showResults(){
    let processesNumber = parseInt(document.getElementById('process-number').value)
    let quantumPerRound = parseInt(document.getElementById('quantum-number').value)
    let contextChangeDuration = parseInt(document.getElementById('context-change-duration').value)

    if(processesNumber !== '' && quantumPerRound !== '' && contextChangeDuration !== ''){
        totalTime = 0
        processes = []

        createProcesses(processesNumber)
        loadProcesses(0, quantumPerRound, contextChangeDuration)

        let result = document.createElement('p')
        result.innerText = 'Terminé en ' + totalTime + ' quantums (' + processesNumber + ' processus - ' + quantumPerRound + ' quantums par passage - ' + contextChangeDuration + ' de changement de contexte)'
        document.getElementById('results').append(result)
    }
}

// Variables

let totalTime = 0

let processesDurationMin = 1;
let processesDurationMax = 15;

let processes = []