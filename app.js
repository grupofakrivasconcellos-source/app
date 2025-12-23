// ========== CORES VIBRANTES ==========
var COLORS = [
    '#000000', '#808080', '#FF0000', '#FF6B00', '#FFD700', '#00D000', '#00B8D4',
    '#0066FF', '#6600FF', '#FF00FF', '#FF1493', '#00FF7F',
    '#FF4500', '#1E90FF', '#DC143C', '#00CED1', '#FFB6C1',
    '#32CD32', '#FF8C00', '#8B00FF', '#00FF00', '#FF69B4'
];

var FERIADOS_BRASIL = [
    '01-01', '02-13', '04-21', '05-01', '09-07', '10-12', '11-02', '11-20', '12-25'
];

// ========== ESTADO DA APLICAÇÃO ==========
var appState = {
    currentDate: new Date(),
    selectedDay: null,
    selectedColor: 0,
    selectedLineIndex: null,
    days: {},
    view: 'week',
    touchStartX: 0,
    touchStartY: 0,
    savedSelection: null
};

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    loadDataFromStorage();
    initializeEventListeners();
    renderWeekView();
    renderColorPalette();
    setupGestureHandling();
});

// ========== ARMAZENAMENTO LOCAL ==========
function saveDataToStorage() {
    localStorage.setItem('plannerData', JSON.stringify(appState.days));
}

function loadDataFromStorage() {
    var stored = localStorage.getItem('plannerData');
    if (stored) {
        appState.days = JSON.parse(stored);
    }
}

// ========== EVENT LISTENERS ==========
function initializeEventListeners() {
    // Navegação
    document.getElementById('prevNav').addEventListener('click', function() {
        if (appState.view === 'week') {
            appState.currentDate.setDate(appState.currentDate.getDate() - 7);
            renderWeekView();
        } else {
            appState.currentDate.setMonth(appState.currentDate.getMonth() - 1);
            renderMonthView();
        }
    });

    document.getElementById('nextNav').addEventListener('click', function() {
        if (appState.view === 'week') {
            appState.currentDate.setDate(appState.currentDate.getDate() + 7);
            renderWeekView();
        } else {
            appState.currentDate.setMonth(appState.currentDate.getMonth() + 1);
            renderMonthView();
        }
    });

    // Toggle entre visões
    document.getElementById('viewWeekly').addEventListener('click', function() {
        if (appState.view !== 'week') {
            appState.view = 'week';
            renderWeekView();
        }
    });

    document.getElementById('viewMonthly').addEventListener('click', function() {
        if (appState.view !== 'month') {
            appState.view = 'month';
            renderMonthView();
        }
    });

    // Impressão
    document.getElementById('printDay').addEventListener('click', function() {
        printDayCustom();
    });

    document.getElementById('printWeekly').addEventListener('click', function() {
        printWeek();
    });

    document.getElementById('printMonthly').addEventListener('click', function() {
        printMonth('A4');
    });

    document.getElementById('printMonthA4').addEventListener('click', function() {
        printMonth('A4');
    });

    document.getElementById('printMonthPlotter').addEventListener('click', function() {
        printMonth('Plotter');
    });

    // Estilos de Texto
    document.getElementById('btnBold').addEventListener('click', function() { applyTextStyle('bold'); });
    document.getElementById('btnItalic').addEventListener('click', function() { applyTextStyle('italic'); });
    document.getElementById('btnStrike').addEventListener('click', function() { applyTextStyle('strike'); });

    // Fechar edição
    var closeBtn = document.getElementById('closeDayEdit');
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeDayEdit();
        });
    }
}

// ========== NAVEGAÇÃO POR GESTO ==========
function setupGestureHandling() {
    var weekGrid = document.getElementById('weekGrid');
    var touchStartX = 0;
    var touchStartY = 0;
    var isSwiping = false;

    weekGrid.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isSwiping = true;
        }
    }, false);

    weekGrid.addEventListener('touchmove', function(e) {
        if (!isSwiping || e.touches.length !== 1) return;
        
        var currentX = e.touches[0].clientX;
        var currentY = e.touches[0].clientY;
        var deltaX = currentX - touchStartX;
        var deltaY = currentY - touchStartY;
        
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
            e.preventDefault();
        }
    }, true);

    weekGrid.addEventListener('touchend', function(e) {
        if (!isSwiping) return;
        
        var touchEndX = e.changedTouches[0].clientX;
        var touchEndY = e.changedTouches[0].clientY;
        var deltaX = touchEndX - touchStartX;
        var deltaY = touchEndY - touchStartY;
        
        isSwiping = false;
        
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
                appState.currentDate.setDate(appState.currentDate.getDate() - 7);
            } else {
                appState.currentDate.setDate(appState.currentDate.getDate() + 7);
            }
            renderWeekView();
        }
    }, false);
}

// ========== RENDERIZAÇÃO SEMANAL ==========
function renderWeekView() {
    var weekGrid = document.getElementById('weekGrid');
    weekGrid.innerHTML = '';

    var startDate = new Date(appState.currentDate);
    startDate.setDate(appState.currentDate.getDate() - appState.currentDate.getDay());

    var headerTitle = document.getElementById('headerTitle');
    var monthName = startDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).toUpperCase();
    headerTitle.textContent = monthName;

    // Coluna esquerda: 4 dias (Segunda a Quinta)
    var leftColumn = document.createElement('div');
    leftColumn.className = 'week-column';
    for (var i = 1; i < 5; i++) {
        var date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        leftColumn.appendChild(createDayCardGrid(date));
    }

    // Coluna direita: 3 dias (Sexta, Sábado, Domingo)
    var rightColumn = document.createElement('div');
    rightColumn.className = 'week-column';
    for (var i = 5; i < 8; i++) {
        var date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        rightColumn.appendChild(createDayCardGrid(date));
    }

    weekGrid.appendChild(leftColumn);
    weekGrid.appendChild(rightColumn);

    // Atualizar botões
    document.getElementById('viewWeekly').classList.add('active');
    document.getElementById('viewMonthly').classList.remove('active');
    
    // Mostrar visão semanal
    document.getElementById('weekView').style.display = 'flex';
    document.getElementById('monthView').style.display = 'none';
    appState.view = 'week';

    // Garantir que o scroll volte ao topo
    var weekContainer = document.getElementById('weekView');
    if (weekContainer) {
        weekContainer.scrollTop = 0;
    }
}

// ========== RENDERIZAÇÃO MENSAL ==========
function renderMonthView() {
    var monthCalendar = document.getElementById('monthCalendar');
    monthCalendar.innerHTML = '';

    var headerTitle = document.getElementById('headerTitle');
    var monthName = appState.currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
    headerTitle.textContent = monthName;

    var grid = document.createElement('div');
    grid.className = 'month-grid';

    // Cabeçalho com dias da semana
    var dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    dayNames.forEach(function(day) {
        var dayHeader = document.createElement('div');
        dayHeader.className = 'month-day-header';
        dayHeader.textContent = day;
        grid.appendChild(dayHeader);
    });

    var firstDay = new Date(appState.currentDate.getFullYear(), appState.currentDate.getMonth(), 1);
    var startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    var currentDate = new Date(startDate);
    for (var i = 0; i < 42; i++) {
        var cell = createMonthDayCell(currentDate);
        grid.appendChild(cell);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    monthCalendar.appendChild(grid);

    // Mostrar visão mensal
    document.getElementById('weekView').style.display = 'none';
    document.getElementById('monthView').style.display = 'flex';
    appState.view = 'month';

    // Atualizar botões
    document.getElementById('viewWeekly').classList.remove('active');
    document.getElementById('viewMonthly').classList.add('active');
}

function createDayCardGrid(date) {
    var card = document.createElement('div');
    card.className = 'day-card-grid';

    var dateStr = getDateString(date);
    var dayOfWeek = date.getDay();
    var isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    var isHoliday = isHolidayDate(date);

    if (isWeekend || isHoliday) {
        card.classList.add(isHoliday ? 'holiday' : 'weekend');
    }

    var header = document.createElement('div');
    header.className = 'day-card-header' + (isWeekend || isHoliday ? ' weekend' : '');
    header.textContent = getDayName(dayOfWeek).split('-')[0] + ' ' + date.getDate();

    var content = document.createElement('div');
    content.className = 'day-card-content';

    var dayData = appState.days[dateStr] || { lines: [] };
    if (!dayData.lines || dayData.lines.length === 0) {
        dayData.lines = Array(30).fill(null).map(function() { return { text: '', spans: [] }; });
    }
    
    for (var i = 0; i < 30; i++) {
        var line = dayData.lines[i] || { text: '', spans: [] };
        var lineDiv = document.createElement('div');
        lineDiv.className = 'day-line-preview';
        
        // Adicionar numeração da linha
        var lineNumSpan = document.createElement('span');
        lineNumSpan.className = 'line-number-preview';
        lineNumSpan.textContent = (i + 1) + '. ';
        lineDiv.appendChild(lineNumSpan);

        var lineContentSpan = document.createElement('span');
        if (line && line.text && line.text.trim() !== '') {
            lineContentSpan.innerHTML = renderLineWithColors(line);
        } else {
            lineDiv.classList.add('empty');
            lineContentSpan.innerHTML = '&nbsp;';
        }
        lineDiv.appendChild(lineContentSpan);
        
        content.appendChild(lineDiv);
    }

    card.appendChild(header);
    card.appendChild(content);

    card.addEventListener('click', function() {
        openDayEdit(date);
    });
    
    return card;
}

function createMonthDayCell(date) {
    var cell = document.createElement('div');
    cell.className = 'month-day-cell';

    var dateStr = getDateString(date);
    var dayOfWeek = date.getDay();
    var isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    var isHoliday = isHolidayDate(date);
    var isOtherMonth = date.getMonth() !== appState.currentDate.getMonth();

    if (isOtherMonth) {
        cell.classList.add('other-month');
    } else if (isWeekend || isHoliday) {
        cell.classList.add(isHoliday ? 'holiday' : 'weekend');
    }

    var dayNum = document.createElement('div');
    dayNum.className = 'month-day-number';
    dayNum.textContent = date.getDate();
    cell.appendChild(dayNum);

    var dayData = appState.days[dateStr];
    if (dayData) {
        var notesContainer = document.createElement('div');
        notesContainer.className = 'month-day-notes';
        
        var validLinesIndices = [];
        dayData.lines.forEach(function(line, idx) {
            if (line && line.text && line.text.trim() !== '') {
                validLinesIndices.push(idx);
            }
        });
        
        if (validLinesIndices.length > 0) {
            var maxLines = Math.min(3, validLinesIndices.length);
            for (var i = 0; i < maxLines; i++) {
                var idx = validLinesIndices[i];
                var noteDiv = document.createElement('div');
                noteDiv.className = 'month-note-line';
                // Adicionar numeração da linha na visão mensal
                noteDiv.innerHTML = '<span class="line-number-preview">' + (idx + 1) + '. </span>' + renderLineWithColors(dayData.lines[idx]);
                notesContainer.appendChild(noteDiv);
            }
            
            if (validLinesIndices.length > 3) {
                var moreDiv = document.createElement('div');
                moreDiv.className = 'month-note-more';
                moreDiv.textContent = '...';
                notesContainer.appendChild(moreDiv);
            }
        }
        
        cell.appendChild(notesContainer);
    }

    cell.addEventListener('click', function() {
        openDayEdit(date);
    });

    return cell;
}

// ========== EDIÇÃO DIÁRIA ==========
function openDayEdit(date) {
    appState.selectedDay = getDateString(date);
    var dayEditView = document.getElementById('dayEditView');
    var editDayInfo = document.getElementById('editDayInfo');
    var notebookLines = document.getElementById('notebookLines');

    var dayName = getDayName(date.getDay());
    editDayInfo.textContent = dayName + ', ' + formatDate(date);
    
    if (!appState.days[appState.selectedDay]) {
        appState.days[appState.selectedDay] = {
            lines: Array(30).fill(null).map(function() { return { text: '', spans: [] }; })
        };
    }
    
    var dayData = appState.days[appState.selectedDay];
    notebookLines.innerHTML = '';

    for (var i = 0; i < 30; i++) {
        (function(index) {
            var lineData = dayData.lines[index] || { text: '', spans: [] };
            var lineWrapper = document.createElement('div');
            lineWrapper.className = 'notebook-line-wrapper';

            var lineNum = document.createElement('div');
            lineNum.className = 'line-number';
            lineNum.textContent = index + 1;

            var lineEditable = document.createElement('div');
            lineEditable.className = 'notebook-line-editable';
            lineEditable.contentEditable = true;
            lineEditable.setAttribute('data-index', index);
            
            updateEditableContent(lineEditable, lineData);

            lineEditable.addEventListener('input', function(e) {
                lineData.text = lineEditable.textContent;
                saveDataToStorage();
            });

            lineEditable.addEventListener('focus', function() {
                appState.selectedLineIndex = index;
            });

            lineWrapper.appendChild(lineNum);
            lineWrapper.appendChild(lineEditable);
            notebookLines.appendChild(lineWrapper);
        })(i);
    }

    dayEditView.style.display = 'flex';
}

function closeDayEdit() {
    document.getElementById('dayEditView').style.display = 'none';
    if (appState.view === 'week') {
        renderWeekView();
    } else {
        renderMonthView();
    }
}

function updateEditableContent(element, lineData) {
    if (lineData.text && lineData.text.trim() !== '') {
        element.innerHTML = renderLineWithColors(lineData);
    } else {
        element.innerHTML = '';
    }
}

function renderLineWithColors(line) {
    if (!line.spans || line.spans.length === 0) {
        return line.text || '';
    }
    
    var html = '';
    line.spans.forEach(function(span) {
        var style = '';
        if (span.bold) style += 'font-weight:bold;';
        if (span.italic) style += 'font-style:italic;';
        if (span.strike) style += 'text-decoration:line-through;';
        if (span.color) style += 'color:' + span.color + ';';
        
        html += '<span style="' + style + '">' + span.text + '</span>';
    });
    return html;
}

function applyTextStyle(type) {
    var selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    var range = selection.getRangeAt(0);
    var container = range.commonAncestorContainer;
    while (container && !container.hasAttribute?.('data-index')) {
        container = container.parentElement;
    }
    
    if (!container) return;
    
    var index = parseInt(container.getAttribute('data-index'));
    var lineData = appState.days[appState.selectedDay].lines[index];
    
    // Simplificação: aplica o estilo na linha toda se houver seleção
    if (type === 'bold') lineData.bold = !lineData.bold;
    if (type === 'italic') lineData.italic = !lineData.italic;
    if (type === 'strike') lineData.strike = !lineData.strike;
    
    // Atualizar spans (lógica simplificada para o exemplo)
    lineData.spans = [{
        text: lineData.text,
        bold: lineData.bold,
        italic: lineData.italic,
        strike: lineData.strike,
        color: COLORS[appState.selectedColor]
    }];
    
    updateEditableContent(container, lineData);
    saveDataToStorage();
}

function renderColorPalette() {
    var palette = document.getElementById('colorPalette');
    palette.innerHTML = '';
    
    COLORS.forEach(function(color, index) {
        var btn = document.createElement('button');
        btn.className = 'color-btn';
        btn.style.backgroundColor = color;
        if (index === appState.selectedColor) btn.classList.add('active');
        
        btn.addEventListener('click', function() {
            appState.selectedColor = index;
            document.querySelectorAll('.color-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
        });
        
        palette.appendChild(btn);
    });
}

// ========== UTILITÁRIOS ==========
function getDateString(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
}

function getDayName(dayIndex) {
    var names = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return names[dayIndex];
}

function formatDate(date) {
    return date.toLocaleDateString('pt-BR');
}

function isHolidayDate(date) {
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return FERIADOS_BRASIL.indexOf(m + '-' + d) !== -1;
}

// ========== IMPRESSÃO ==========
function printWeek() {
    var startDate = new Date(appState.currentDate);
    startDate.setDate(appState.currentDate.getDate() - appState.currentDate.getDay());
    
    var daysHtml = '';
    for (var i = 1; i < 8; i++) {
        var date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        var dateStr = getDateString(date);
        var dayData = appState.days[dateStr] || { lines: [] };
        var dayName = getDayName(date.getDay());
        
        daysHtml += '<div class="print-day">' +
            '<div class="print-header">' + dayName + ', ' + formatDate(date) + '</div>' +
            '<div class="print-lines">' +
            dayData.lines.map(function(line, idx) { 
                return line.text.trim() !== '' ? '<div class="print-line"><b>' + (idx + 1) + '.</b> ' + renderLineWithColors(line) + '</div>' : ''; 
            }).join('') +
            '</div></div>';
    }
    
    var printWindow = window.open('', '', 'width=800,height=600');
    var html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Impressao Semanal</title>' +
        '<style>' +
        '@page { size: A4 portrait; margin: 5mm; }' +
        'body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: white; }' +
        '.week-container-print { width: 100%; box-sizing: border-box; display: flex; flex-direction: column; }' +
        '.print-day { page-break-inside: avoid; border-bottom: 2px solid #333; padding: 10px 0.5cm; display: flex; flex-direction: column; }' +
        '.print-day:last-child { border-bottom: none; }' +
        '.print-header { padding: 5px 0; font-weight: bold; font-size: 16px; border-bottom: 1px solid #eee; margin-bottom: 5px; }' +
        '.print-lines { display: flex; flex-direction: column; gap: 5px; }' +
        '.print-line { border-bottom: 1px solid #eee; padding: 5px 0; font-size: 14px; line-height: 1.4; word-break: break-word; }' +
        '@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }' +
        '</style></head><body><div class="week-container-print">' + daysHtml + '</div></body></html>';
    
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(function() { printWindow.print(); }, 500);
}

function printMonth(type) {
    // Lógica de impressão mensal simplificada
    window.print();
}

function printDayCustom() {
    var dateParts = appState.selectedDay.split('-');
    var date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    var dayData = appState.days[appState.selectedDay];
    var dayName = getDayName(date.getDay());
    var isSpecial = date.getDay() === 0 || date.getDay() === 6 || isHolidayDate(date);
    
    var printWindow = window.open('', '', 'width=800,height=600');
    var linesToPrint = dayData.lines.slice(0, 30);
    
    var html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Impressao - ' + dayName + '</title>' +
        '<style>' +
        '@page { size: 550mm 450mm landscape; margin: 10mm; }' +
        'body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: white; width: 530mm; height: 430mm; display: flex; flex-direction: column; }' +
        '.print-header { text-align: center; padding: 8px 0; border-bottom: 2px solid #333; margin: 0 10mm; margin-bottom: 5mm; }' +
        '.print-header h1 { margin: 0; font-size: 16px; font-weight: bold; ' + (isSpecial ? 'color: #FF0000;' : '') + ' }' +
        '.print-lines { flex: 1; display: flex; flex-direction: column; margin: 0 10mm; height: calc(100% - 50px); }' +
        '.print-line { flex: 1; border-bottom: 1px solid ' + (isSpecial ? '#FF0000' : '#999') + '; display: flex; align-items: center; padding: 0; box-sizing: border-box; overflow: hidden; ' + (isSpecial ? 'color: #FF0000;' : '') + ' }' +
        '.print-line:last-child { border-bottom: none; }' +
        '.print-line-content { font-size: 10mm; line-height: 1.2; white-space: normal; word-break: break-word; padding: 2mm 0; }' +
        '@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }' +
        '</style></head><body>' +
        '<div class="print-header"><h1>' + dayName + ', ' + formatDate(date) + '</h1></div>' +
        '<div class="print-lines">' +
        linesToPrint.map(function(line, idx) { 
            return '<div class="print-line"><div class="print-line-content"><b>' + (idx + 1) + '.</b> ' + renderLineWithColors(line) + '</div></div>'; 
        }).join('') +
        '</div></body></html>';
    
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(function() { printWindow.print(); }, 500);
}
