function createProcess() {
    $('#processListContainer').removeAttr('hidden');
    const processList = $('#processList');

    if (processList.children().length >= 20) {
        alert('O número máximo de 20 processos já foi atingido!');
        return;
    }

    const newProcess = $('<div></div>')
    newProcess.addClass('process list-group-item list-group-item');
    newProcess.text('P' + (processList.children().length + 1));
    processList.append(newProcess);

    $('#definePaginationForm').removeAttr('hidden');
}

function definePagination() {
    event.preventDefault();
    const processList = $('#processList').children();
    const pageQuant = parseInt($('#pagination').val());

    if (processList.length * pageQuant > 20) {
        alert('O número de páginas excede o limite de 20!');
        return;
    }

    const pageListBody = $('#pageList tbody');
    pageListBody.empty();
    $('#pageTableHeader').attr('colspan', pageQuant);

    processList.each(function(index, process) {
        const processName = $(process).text();
        let row = `<tr><td class="processTableCell">${processName}</td>`;
        for (let i = 1; i <= pageQuant; i++) row += `<td class="pageTableCell">${processName.toLowerCase()}_${i}</td>`;
        row += '</tr>';
        pageListBody.append(row);
    });

    $('#pageListContainer').removeAttr('hidden');
    $('#defineFramingForm').removeAttr('hidden');
}

function defineFraming() {
    event.preventDefault();
    const pageList = $('#pageList .pageTableCell');
    const frameQuant = parseInt($('#framing').val());

    if (frameQuant > pageList.length) {
        alert(`O número de quadros excede o limite de ${pageList.length}!`);
        return;
    }

    $('#defineAllocationOrder').removeAttr('hidden');
}

function defineAllocationOrder() {
    const pageList = $('#pageList .pageTableCell');

    const unorderedPagesContainer = $('#memoryAllocationForm ul');

    pageList.each(function(index, page) {
        const listItem = $('<li class="list-group-item list-group-item-dark"></li>');
        const movableIcon = $(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down-up" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5m-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5"/>
        </svg>`);

        listItem.append(movableIcon).append(' ').append($(page).text());
        unorderedPagesContainer.append(listItem);
    });

    unorderedPagesContainer.sortable();
    unorderedPagesContainer.disableSelection();
}

function memoryAllocationLRUAlgorith() {
    
}

function displayMemoryAllocationGraph() {
    event.preventDefault();

    const modal = document.getElementById('memoryAllocationModal');
    const modalInstance = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
    modalInstance.hide();

    const frameQuant = parseInt($('#framing').val());
    const allocationOrder = $('#memoryAllocationForm ul li');

    const frames = Array.from({ length: frameQuant }, () => null);

    const memoryAllocationHeader = $('#memoryAllocationTable thead');
    memoryAllocationHeader.empty();

    const firstHeaderRow = $(`<tr>
        <th class="emptyTableCell"></th>
        <th colspan="${allocationOrder.length}" class="pageHeader">Páginas</th>
    </tr>`);
    memoryAllocationHeader.append(firstHeaderRow);

    const secondHeaderRow = $(`<tr>
        <th id="frameHeader">Quadros</th>
    </tr>`);
    allocationOrder.each(function(index, page) {
        const pageName = $(page).text();
        const headerCell = `<th class="pageHeader">${pageName}</th>`;
        secondHeaderRow.append(headerCell);
    });
    memoryAllocationHeader.append(secondHeaderRow);

    for (let i = 1; i <= frameQuant; i++) {
        const memoryAllocationRow = $('<tr></tr>');
        const frameElement = $(`<td class="frameHeader">Q${i}</td>`);
        memoryAllocationRow.append(frameElement);

        for (let j = 0; j < allocationOrder.length; j++) {
            const cell = $('<td></td>');
            memoryAllocationRow.append(cell);
        }

        $('#memoryAllocationTable tbody').append(memoryAllocationRow);
    }

    let pageFaults = 0;



    $('#memoryAllocationContainer').removeAttr('hidden');
}



// Algoritmo de Escalonamento por Prioridade (Não Preemptivo)
function priorityScheduling(processes) {
    let currentTime = 0;
    let ganttData = [];
    let completedProcesses = 0;
    const totalProcesses = processes.length;

    while (completedProcesses < totalProcesses) {
        // Filtra os processos que já chegaram e que ainda têm tempo restante
        const availableProcesses = processes.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);

        if (availableProcesses.length > 0) {
            // Ordena os processos disponíveis pela prioridade (menor valor = maior prioridade) depois pelo tempo de execução (menor valor = maior prioridade) e por último pela ordem de chegada (menor valor = maior prioridade)
            availableProcesses.sort((a, b) => {
                if (a.priority !== b.priority) return a.priority - b.priority;
                else if (a.burstTime !== b.burstTime) return a.burstTime - b.burstTime;
                else return a.arrivalTime - b.arrivalTime;
            });

            // Seleciona o processo com maior prioridade (menor valor de prioridade)
            const currentProcess = availableProcesses[0];

            // Adiciona o processo ao gráfico de Gantt com seu tempo de execução total
            ganttData.push({
                processName: currentProcess.name,
                startTime: currentTime,
                endTime: currentTime + currentProcess.remainingTime
            });

            // Atualiza o tempo atual com o tempo de execução completo do processo
            currentTime += currentProcess.remainingTime;

            // Marca o processo como concluído (tempo restante = 0)
            currentProcess.remainingTime = 0;

            // Incrementa o número de processos concluídos
            completedProcesses++;
        } else {
            // Se não houver processos disponíveis, avança o tempo até o próximo processo chegar
            currentTime++;
        }
    }

    return ganttData;
}

// Função para exibir o gráfico de Gantt com "X" para tempo de execução
function displayGanttChart(ganttData) {
    const ganttTable = document.getElementById('ganttChart');
    ganttTable.innerHTML = '';

    const totalTime = Math.max(...ganttData.map(g => g.endTime));
    
    // Adiciona a linha de tempos (header)
    let timeRow = '<tr><th class="timeHeader">Tempo</th>';
    for (let i = 0; i < totalTime; i++) {
        timeRow += `<th class="timeHeader">${i}</th>`;
    }
    timeRow += '</tr>';
    ganttTable.innerHTML += timeRow;

    // Adiciona as linhas para cada processo
    ganttData.forEach(data => {
        let processRow = `<tr><th class="processHeader">${data.processName}</th>`;
        for (let i = 0; i < totalTime; i++) {
            if (i >= data.startTime && i < data.endTime) {
                processRow += `<td class="ganttCell">X</td>`;
            } else {
                processRow += `<td class="ganttEmptyCell"></td>`;
            }
        }
        processRow += '</tr>';
        ganttTable.innerHTML += processRow;
    });
}

// Função principal
document.addEventListener("DOMContentLoaded", function () {
    $('#createProcess').on('click', createProcess);
    $('#definePaginationForm').on('submit', definePagination);
    $('#defineFramingForm').on('submit', defineFraming);
    $('#defineAllocationOrder').on('click', defineAllocationOrder);
    $('#memoryAllocationForm').on('submit', displayMemoryAllocationGraph);
});