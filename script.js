// Methods

function loadProcesses(current){
	// Substract the quantum value to the current process

	// console.log(current)

	for(let i = 0; i < quantum; i++){
		if(processes[current] > 0){
			processes[current]--
			console.log(current, processes)
			totalTime++
		}
	}

	// Remove loaded processes and continue load them

	if(processes.length !== 0){
		if(processes[current] === 0){
			processes.splice(current, 1)
			loadProcesses(current + 1)
		}
		else{

			// Go back to the first process if we are at the end

			if(current === processes.length - 1){
				loadProcesses(0)
			}

			// Or keep going

			else{
				loadProcesses(current + 1)
			}
		}

		// console.log(processes)
	}
}

function createProcesses(){
	for(let i = 0; i < processesNumber; i++){
		processes.push(Math.round((Math.random() * processesDurationMax) + processesDurationMin))
	}
}

// Variables

var quantum = 4
var contextChange = 1
var totalTime = 0
var processesNumber = 4;
var processesDurationMax = 15;
var processesDurationMin = 1;
var processes = []

// Main program

createProcesses()
console.log(processes)
loadProcesses(0)
// console.log(totalTime)