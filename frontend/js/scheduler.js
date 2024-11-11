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

    for (let i = 0; i < frameQuant; i++) {
        const memoryAllocationRow = $('<tr></tr>');
        const frameElement = $(`<td class="frameHeader">Q${i+1}</td>`);
        memoryAllocationRow.append(frameElement);

        for (let j = 0; j < allocationOrder.length; j++) {
            const cell = $(`<td id="${i}_${j}"></td>`);
            memoryAllocationRow.append(cell);
        }

        $('#memoryAllocationTable tbody').append(memoryAllocationRow);
    }

    memoryAllocationLRUAlgorithm(frames, allocationOrder);
}

function memoryAllocationLRUAlgorithm(frames, allocationOrder) {
    $('#memoryAllocationContainer').removeAttr('hidden');

    const frameUsage = new Map(); // Para rastrear o uso dos quadros para LRU
    let pageFaults = 0; // Variável para contar erros de página

    allocationOrder.each(function(colIndex, pageElement) {
        const pageName = $(pageElement).text();
        let pagePlaced = false;

        // Verifique se há uma posição desocupada no array de quadros
        for (let i = 0; i < frames.length; i++) {
            if (frames[i] === null) {
                frames[i] = pageName;
                frameUsage.set(pageName, colIndex); // Atualizar uso
                pagePlaced = true;
                pageFaults++; // Incrementar erros de página
                break;
            }
        }

        // Se não houver posição desocupada, aplique o princípio LRU
        if (!pagePlaced) {
            // Encontre a página menos recentemente usada
            let lruPage = null;
            let lruIndex = -1;
            frameUsage.forEach((lastUsedIndex, page) => {
                if (lruIndex === -1 || lastUsedIndex < lruIndex) {
                    lruPage = page;
                    lruIndex = lastUsedIndex;
                }
            });

            // Substitua a página LRU pela página atual
            const lruPageIndex = frames.indexOf(lruPage);
            frames[lruPageIndex] = pageName;
            frameUsage.delete(lruPage); // Remova a página antiga do rastreamento de uso
            frameUsage.set(pageName, colIndex); // Atualizar uso com a nova página
            pageFaults++; // Incrementar erros de página
        }

        // Atualize a tabela do frontend
        for (let i = 0; i < frames.length; i++) {
            const cellId = `#${i}_${colIndex}`;
            const cell = $(cellId);
            if (frames[i] !== null) cell.text(frames[i]);
            else cell.text('-');
        }
    });

    updateMemoryAllocationSummary(allocationOrder.length, pageFaults);
}

function updateMemoryAllocationSummary(totalReferences, pageFaults) {
    $('#memoryAllocationSummary').removeAttr('hidden');

    const pageFaultRate = pageFaults / totalReferences;

    $('#pageRequestsTotal').text(totalReferences);
    $('#pageFaultsTotal').text(pageFaults);
    $('#pageFaultsRate').text('%' + (pageFaultRate * 100).toFixed(2));
}

// Função principal
document.addEventListener("DOMContentLoaded", function () {
    $('#createProcess').on('click', createProcess);
    $('#definePaginationForm').on('submit', definePagination);
    $('#defineFramingForm').on('submit', defineFraming);
    $('#defineAllocationOrder').on('click', defineAllocationOrder);
    $('#memoryAllocationForm').on('submit', displayMemoryAllocationGraph);
});