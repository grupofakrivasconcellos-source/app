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
        printDay();
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
        
        if (line && line.text && line.text.trim() !== '') {
            lineDiv.innerHTML = renderLineWithColors(line);
        } else {
            lineDiv.classList.add('empty');
            lineDiv.innerHTML = '&nbsp;';
        }
        
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
        
        var validLines = dayData.lines.filter(function(line) { return line && line.text && line.text.trim() !== ''; });
        
        if (validLines.length > 0) {
            var maxLines = Math.min(3, validLines.length);
            for (var i = 0; i < maxLines; i++) {
                var noteDiv = document.createElement('div');
                noteDiv.className = 'month-note-line';
                noteDiv.innerHTML = renderLineWithColors(validLines[i]);
                notesContainer.appendChild(noteDiv);
            }
            
            if (validLines.length > 3) {
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
                if (lineData.spans) {
                    lineData.spans = lineData.spans.filter(function(span) { return span.start < lineData.text.length; });
                    lineData.spans.forEach(function(span) {
                        if (span.end > lineData.text.length) span.end = lineData.text.length;
                    });
                }
                saveDataToStorage();
            });

            lineEditable.addEventListener('focus', function() {
                appState.selectedLineIndex = index;
            });

            // Evento para tecla Tab e Retorno
            lineEditable.addEventListener('keydown', function(e) {
                if (e.key === 'Tab' || e.key === 'Enter') {
                    e.preventDefault();
                    // Mover para próxima linha
                    var nextIndex = index + 1;
                    if (nextIndex < 30) {
                        var nextLine = notebookLines.querySelector('[data-index="' + nextIndex + '"]');
                        if (nextLine) {
                            nextLine.focus();
                        }
                    }
                }
            });

            // Evento para colagem (paste)
            lineEditable.addEventListener('paste', function(e) {
                e.preventDefault();
                var pastedText = e.clipboardData.getData('text/plain');
                if (!pastedText) return;

                var lines = pastedText.split(/\r?\n/);
                var currentIndex = index;

                for (var j = 0; j < lines.length && currentIndex < 30; j++) {
                    var line = lines[j];
                    var currentLine = dayData.lines[currentIndex];
                    
                    if (!currentLine) {
                        currentLine = { text: '', spans: [] };
                        dayData.lines[currentIndex] = currentLine;
                    }

                    // Se for a primeira linha, adicionar ao texto existente
                    if (j === 0) {
                        var selection = window.getSelection();
                        var range = selection.getRangeAt(0);
                        var offset = getTextPosition(lineEditable, range.startContainer, range.startOffset);
                        currentLine.text = currentLine.text.substring(0, offset) + line + currentLine.text.substring(offset);
                    } else {
                        // Para as próximas linhas, colocar o texto completo
                        currentLine.text = line;
                        currentLine.spans = [];
                    }
                    
                    currentIndex++;
                }

                // Atualizar a exibição
                for (var k = index; k < Math.min(index + lines.length, 30); k++) {
                    var editableElem = notebookLines.querySelector('[data-index="' + k + '"]');
                    if (editableElem) {
                        updateEditableContent(editableElem, dayData.lines[k]);
                    }
                }

                saveDataToStorage();
            });

            lineWrapper.appendChild(lineNum);
            lineWrapper.appendChild(lineEditable);
            notebookLines.appendChild(lineWrapper);
        })(i);
    }

    dayEditView.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    renderColorPalette();
}

function updateEditableContent(element, lineData) {
    element.innerHTML = renderLineWithColors(lineData);
}

function closeDayEdit() {
    saveDataToStorage();
    document.getElementById('dayEditView').style.display = 'none';
    document.body.style.overflow = '';
    
    if (appState.view === 'week') {
        renderWeekView();
    } else {
        renderMonthView();
    }
}

// ========== PALETA DE CORES ==========
function renderColorPalette() {
    var palette = document.getElementById('colorPalette');
    if (!palette) return;
    palette.innerHTML = '';
    
    COLORS.forEach(function(color, index) {
        var btn = document.createElement('div');
        btn.className = 'color-btn' + (appState.selectedColor === index ? ' active' : '');
        btn.style.backgroundColor = color;
        
        btn.addEventListener('mousedown', function(e) {
            // Usar mousedown para evitar perda de foco/seleção
            e.preventDefault();
            e.stopPropagation();
            appState.selectedColor = index;
            
            // Atualizar visual dos botões de cores
            var allBtns = palette.querySelectorAll('.color-btn');
            allBtns.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            
            applyColorToSelectedText(index);
        });
        
        palette.appendChild(btn);
    });
}

function getTextPosition(container, node, offset) {
    var position = 0;
    var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    var currentNode;
    while (currentNode = walker.nextNode()) {
        if (currentNode === node) {
            position += offset;
            break;
        }
        position += currentNode.textContent.length;
    }
    return position;
}

function applyTextStyle(style) {
    var selection = window.getSelection();
    var selectedText = selection.toString();
    if (selectedText.length === 0) return;

    var anchorNode = selection.anchorNode;
    var editableElement = anchorNode.nodeType === 3 ? anchorNode.parentElement : anchorNode;
    while (editableElement && !editableElement.classList.contains('notebook-line-editable')) {
        editableElement = editableElement.parentElement;
    }
    if (!editableElement) return;

    var lineIndex = parseInt(editableElement.getAttribute('data-index'));
    var dayData = appState.days[appState.selectedDay];
    var lineData = dayData.lines[lineIndex];
    
    var range = selection.getRangeAt(0);
    var start = getTextPosition(editableElement, range.startContainer, range.startOffset);
    var end = start + selectedText.length;

    if (!lineData.spans) lineData.spans = [];
    
    // Adicionar o estilo ao span
    lineData.spans.push({ start: start, end: end, style: style });
    lineData.spans.sort(function(a, b) { return a.start - b.start; });

    saveDataToStorage();
    updateEditableContent(editableElement, lineData);
}

function applyColorToSelectedText(colorIndex) {
    var selection = window.getSelection();
    var selectedText = selection.toString();
    
    if (selectedText.length === 0) {
        alert('Por favor, selecione o texto que deseja colorir');
        return;
    }
    var anchorNode = selection.anchorNode;
    var editableElement = anchorNode.nodeType === 3 ? anchorNode.parentElement : anchorNode;
    
    while (editableElement && !editableElement.classList.contains('notebook-line-editable')) {
        editableElement = editableElement.parentElement;
    }

    if (!editableElement) {
        alert('Por favor, selecione o texto dentro de uma linha');
        return;
    }

    var lineIndex = parseInt(editableElement.getAttribute('data-index'));
    var dayData = appState.days[appState.selectedDay];
    var lineData = dayData.lines[lineIndex];
    
    var range = selection.getRangeAt(0);
    var start = getTextPosition(editableElement, range.startContainer, range.startOffset);
    var end = start + selectedText.length;

    if (!lineData.spans) lineData.spans = [];
    
    lineData.spans.push({ start: start, end: end, color: colorIndex });
    lineData.spans.sort(function(a, b) { return a.start - b.start; });
    
    lineData.spans = lineData.spans.filter(function(s) {
        if (s.color !== undefined && s.start >= start && s.end <= end && (s.start !== start || s.end !== end)) return false;
        return true;
    });

    saveDataToStorage();
    
    var cursorPosition = end;
    updateEditableContent(editableElement, lineData);
    
    setTimeout(function() {
        editableElement.focus();
        try {
            var textNode = getTextNodeAtPosition(editableElement, cursorPosition);
            if (textNode) {
                var newRange = document.createRange();
                newRange.setStart(textNode.node, textNode.offset);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
            }
        } catch (e) {
            console.log('Erro ao restaurar cursor:', e);
        }
    }, 10);
}

function getTextNodeAtPosition(container, position) {
    var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    var currentPos = 0;
    var node;
    
    while (node = walker.nextNode()) {
        var nodeLength = node.textContent.length;
        if (currentPos + nodeLength >= position) {
            return { node: node, offset: position - currentPos };
        }
        currentPos += nodeLength;
    }
    
    return null;
}

function renderLineWithColors(lineData) {
    if (!lineData || !lineData.text) return '';
    if (!lineData.spans || lineData.spans.length === 0) return escapeHtml(lineData.text);

    var html = '';
    var lastIndex = 0;
    var spans = lineData.spans.slice().sort(function(a, b) { return a.start - b.start; });

    // Agrupar spans por posição para aplicar múltiplos estilos/cores
    var points = [];
    points.push(0);
    points.push(lineData.text.length);
    spans.forEach(function(s) {
        points.push(s.start);
        points.push(s.end);
    });
    points = Array.from(new Set(points)).sort(function(a, b) { return a - b; });

    for (var i = 0; i < points.length - 1; i++) {
        var start = points[i];
        var end = points[i+1];
        if (start >= lineData.text.length) break;
        
        var segmentText = lineData.text.substring(start, end);
        var activeSpans = spans.filter(function(s) { return s.start <= start && s.end >= end; });
        
        if (activeSpans.length > 0) {
            var styleAttr = '';
            var colorSpan = activeSpans.find(function(s) { return s.color !== undefined; });
            if (colorSpan) {
                var color = COLORS[colorSpan.color];
                styleAttr += 'background-color: ' + color + '; color: ' + getContrastColor(color) + '; padding: 1px 3px; border-radius: 2px;';
            }
            
            var isBold = activeSpans.some(function(s) { return s.style === 'bold'; });
            var isItalic = activeSpans.some(function(s) { return s.style === 'italic'; });
            var isStrike = activeSpans.some(function(s) { return s.style === 'strike'; });
            
            if (isBold) styleAttr += ' font-weight: bold;';
            if (isItalic) styleAttr += ' font-style: italic;';
            if (isStrike) styleAttr += ' text-decoration: line-through;';
            
            html += '<span style="' + styleAttr + ' display: inline-block;">' + escapeHtml(segmentText) + '</span>';
        } else {
            html += escapeHtml(segmentText);
        }
    }
    
    return html;
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getContrastColor(hexColor) {
    var r = parseInt(hexColor.substr(1, 2), 16);
    var g = parseInt(hexColor.substr(3, 2), 16);
    var b = parseInt(hexColor.substr(5, 2), 16);
    var brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
}

// ========== UTILITÁRIOS DE DATA ==========
function getDateString(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}

function getDayName(dayOfWeek) {
    var days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return days[dayOfWeek];
}

function formatDate(date) {
    return date.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function isHolidayDate(date) {
    var monthDay = String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    return FERIADOS_BRASIL.indexOf(monthDay) !== -1;
}

// ========== IMPRESSÃO ==========

function printMonth(size) {
    var year = appState.currentDate.getFullYear();
    var month = appState.currentDate.getMonth();
    var monthName = appState.currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();

    var printWindow = window.open('', '', 'width=800,height=600');
    
    var firstDay = new Date(year, month, 1);
    var startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    var gridHtml = '';
    var currentDate = new Date(startDate);
    
    for (var i = 0; i < 42; i++) {
        var dateStr = getDateString(currentDate);
        var dayData = appState.days[dateStr];
        var isOtherMonth = currentDate.getMonth() !== month;
        var isSpecial = currentDate.getDay() === 0 || currentDate.getDay() === 6 || isHolidayDate(currentDate);
        
        var linesHtml = '';
        if (dayData && dayData.lines) {
            var validLines = dayData.lines.filter(function(l) { return l && l.text && l.text.trim() !== ''; });
            linesHtml = validLines.map(function(l) {
                return '<div class="print-month-line">' + renderLineWithColors(l) + '</div>';
            }).join('');
        }

        gridHtml += '<div class="print-month-day' + (isOtherMonth ? ' other-month' : '') + (isSpecial ? ' special' : '') + '">' +
                        '<div class="print-month-num">' + currentDate.getDate() + '</div>' +
                        '<div class="print-month-content">' + linesHtml + '</div>' +
                    '</div>';
        
        currentDate.setDate(currentDate.getDate() + 1);
    }

    var style = '';
    if (size === 'Plotter') {
        style = '@page { size: 550mm 450mm landscape; margin: 0; }' +
                'body { font-family: Arial, sans-serif; margin: 0; padding: 10mm; background: white; width: 550mm; height: 450mm; box-sizing: border-box; display: flex; flex-direction: column; }' +
                '.print-month-header { text-align: center; font-size: 48px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; }' +
                '.print-month-grid { display: grid; grid-template-columns: repeat(7, 1fr); border-top: 2px solid #000; border-left: 2px solid #000; flex: 1; }' +
                '.print-month-day-header { border-right: 2px solid #000; border-bottom: 2px solid #000; text-align: center; font-weight: bold; font-size: 28px; padding: 10px; background: #f0f0f0; }' +
                '.print-month-day { border-right: 2px solid #000; border-bottom: 2px solid #000; position: relative; overflow: hidden; display: flex; flex-direction: column; }' +
                '.print-month-num { font-weight: bold; font-size: 32px; padding: 8px; border-bottom: 1px solid #eee; }' +
                '.print-month-content { font-size: 18px; line-height: 1.3; padding: 5px 10px; flex: 1; overflow: hidden; }' +
                '.print-month-line { border-bottom: 1px solid #eee; padding: 4px 0; word-break: break-word; }';
    } else {
        // A4 Landscape
        style = '@page { size: A4 landscape; margin: 5mm; }' +
                'body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: white; }' +
                '.print-month-header { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 5px; }' +
                '.print-month-grid { display: grid; grid-template-columns: repeat(7, 1fr); border-top: 1px solid #000; border-left: 1px solid #000; }' +
                '.print-month-day-header { border-right: 1px solid #000; border-bottom: 1px solid #000; text-align: center; font-weight: bold; font-size: 12px; padding: 2px; background: #eee; }' +
                '.print-month-day { border-right: 1px solid #000; border-bottom: 1px solid #000; height: 2.8cm; position: relative; overflow: hidden; }' +
                '.print-month-num { font-weight: bold; font-size: 10px; padding: 2px; }' +
                '.print-month-content { font-size: 7px; line-height: 1.1; padding: 0 2px; }' +
                '.print-month-line { border-bottom: 0.1px solid #eee; padding: 1px 0; word-break: break-word; }';
    }

    var html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Calendário Mensal - ' + monthName + '</title>' +
        '<style>' + style +
        '.print-month-day.special .print-month-num { color: #FF0000; }' +
        '.print-month-day.other-month { background: #fafafa; color: #bbb; }' +
        '@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }' +
        '</style><script>' +
        'function adjustFontSize() {' +
        '  const containers = document.querySelectorAll(".print-month-content");' +
        '  containers.forEach(container => {' +
        '    let fontSize = parseFloat(window.getComputedStyle(container).fontSize);' +
        '    while (container.scrollHeight > container.clientHeight && fontSize > 4) {' +
        '      fontSize -= 0.5;' +
        '      container.style.fontSize = fontSize + "px";' +
        '    }' +
        '  });' +
        '}' +
        'window.onload = adjustFontSize;' +
        'window.onafterprint = function() { window.close(); };' +
        '</script></head><body>' +
        '<div class="print-month-header">PLANEJADOR MENSAL - ' + monthName + '</div>' +
        '<div class="print-month-grid">' +
        '<div class="print-month-day-header">DOMINGO</div><div class="print-month-day-header">SEGUNDA</div><div class="print-month-day-header">TERÇA</div>' +
        '<div class="print-month-day-header">QUARTA</div><div class="print-month-day-header">QUINTA</div><div class="print-month-day-header">SEXTA</div><div class="print-month-day-header">SÁBADO</div>' +
        gridHtml + '</div></body></html>';

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(function() { 
        printWindow.print();
        // Após fechar a janela de impressão, garantir que a visão semanal seja renderizada
        appState.view = 'week';
        renderWeekView();
    }, 500);
}

function printDay() {
    if (!appState.selectedDay) return;
    var dateParts = appState.selectedDay.split('-');
    var date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    var dayData = appState.days[appState.selectedDay];
    var dayName = getDayName(date.getDay());
    var isSpecial = date.getDay() === 0 || date.getDay() === 6 || isHolidayDate(date);

    var printWindow = window.open('', '', 'width=800,height=600');
    var linesToPrint = dayData.lines.slice(0, 25);
    var html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Impressão - ' + dayName + '</title>' +
        '<style>' +
        '@page { size: A4 portrait; margin: 5mm; }' +
        'body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: white; height: 28.7cm; display: flex; flex-direction: column; }' +
        '.print-header { text-align: center; padding: 5px 0; border-bottom: 1px solid #333; margin: 0 0.5cm; }' +
        '.print-header h1 { margin: 0; font-size: 14px; font-weight: bold; ' + (isSpecial ? 'color: #FF0000;' : '') + ' }' +
        '.print-lines { flex: 1; display: flex; flex-direction: column; margin: 0 0.5cm; height: calc(100% - 40px); }' +
        '.print-line { flex: 1; border-bottom: 1px solid ' + (isSpecial ? '#FF0000' : '#000') + '; display: flex; align-items: center; padding: 0; box-sizing: border-box; overflow: hidden; ' + (isSpecial ? 'color: #FF0000;' : '') + ' }' +
        '.print-line:last-child { border-bottom: none; }' +
        '.print-line-content { font-size: 8.5mm; line-height: 1; white-space: normal; word-break: break-word; }' +
        '@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }' +
        '</style><script>' +
        'function adjustFontSize() {' +
        '  const lines = document.querySelectorAll(".print-line-content");' +
        '  lines.forEach(line => {' +
        '    const parent = line.parentElement;' +
        '    let fontSize = parseFloat(window.getComputedStyle(line).fontSize);' +
        '    while ((line.scrollHeight > parent.clientHeight || line.scrollWidth > parent.clientWidth) && fontSize > 8) {' +
        '      fontSize -= 1;' +
        '      line.style.fontSize = fontSize + "px";' +
        '    }' +
        '  });' +
        '}' +
        'window.onload = adjustFontSize;' +
        'window.onafterprint = function() { window.close(); };' +
        '</script></head><body>' +
        '<div class="print-header"><h1>' + dayName + ', ' + formatDate(date) + '</h1></div>' +
        '<div class="print-lines">' +
        linesToPrint.map(function(line) { return '<div class="print-line"><div class="print-line-content">' + renderLineWithColors(line) + '</div></div>'; }).join('') +
        '</div></body></html>';

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(function() { 
        printWindow.print();
        appState.view = 'week';
        renderWeekView();
    }, 500);
}

function printWeek() {
    var startDate = new Date(appState.currentDate);
    startDate.setDate(appState.currentDate.getDate() - appState.currentDate.getDay());

    var printWindow = window.open('', '', 'width=800,height=600');
    var daysHtml = '';
    var hasAnyContent = false;

    for (var i = 1; i <= 7; i++) {
        var dayIndex = i % 7;
        var date = new Date(startDate);
        date.setDate(startDate.getDate() + dayIndex);
        var dateStr = getDateString(date);
        var dayData = appState.days[dateStr];
        
        var validLines = dayData ? dayData.lines.filter(function(line) { return line && line.text && line.text.trim() !== ''; }) : [];

        if (validLines.length > 0) {
            hasAnyContent = true;
            var isSpecial = date.getDay() === 0 || date.getDay() === 6 || isHolidayDate(date);
            var dayName = getDayName(date.getDay());

            daysHtml += '<div class="print-day" style="' + (isSpecial ? 'color: #FF0000;' : '') + '">' +
                '<div class="print-header" style="' + (isSpecial ? 'color: #FF0000;' : '') + '">' + dayName + ', ' + formatDate(date) + '</div>' +
                '<div class="print-lines">' +
                validLines.map(function(line) { return '<div class="print-line" style="' + (isSpecial ? 'border-bottom: 1px solid #FF0000;' : 'border-bottom: 1px solid #eee;') + '">' + renderLineWithColors(line) + '</div>'; }).join('') +
                '</div></div>';
        }
    }

    if (!hasAnyContent) {
        daysHtml = '<div style="text-align: center; padding: 50px;">Nenhuma anotação encontrada para esta semana.</div>';
    }

    var html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Impressão Semanal</title>' +
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
        '</style><script>' +
        'function adjustFontSize() {' +
        '  const containers = document.querySelectorAll(".print-lines");' +
        '  containers.forEach(container => {' +
        '    const lines = container.querySelectorAll(".print-line");' +
        '    let fontSize = 14;' +
        '    while (container.scrollHeight > container.clientHeight && fontSize > 6) {' +
        '      fontSize -= 0.5;' +
        '      lines.forEach(l => l.style.fontSize = fontSize + "px");' +
        '    }' +
        '  });' +
        '}' +
        'window.onload = adjustFontSize;' +
        'window.onafterprint = function() { window.close(); };' +
        '</script></head><body><div class="week-container-print">' + daysHtml + '</div></body></html>';

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(function() { 
        printWindow.print();
        appState.view = 'week';
        renderWeekView();
    }, 500);
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
        '</style><script>' +
        'function adjustFontSize() {' +
        '  const lines = document.querySelectorAll(".print-line-content");' +
        '  lines.forEach(line => {' +
        '    const parent = line.parentElement;' +
        '    let fontSize = parseFloat(window.getComputedStyle(line).fontSize);' +
        '    while ((line.scrollHeight > parent.clientHeight || line.scrollWidth > parent.clientWidth) && fontSize > 8) {' +
        '      fontSize -= 1;' +
        '      line.style.fontSize = fontSize + "px";' +
        '    }' +
        '  });' +
        '}' +
        'window.onload = adjustFontSize;' +
        'window.onafterprint = function() { window.close(); };' +
        '</script></head><body>' +
        '<div class="print-header"><h1>' + dayName + ', ' + formatDate(date) + '</h1></div>' +
        '<div class="print-lines">' +
        linesToPrint.map(function(line) { return '<div class="print-line"><div class="print-line-content">' + renderLineWithColors(line) + '</div></div>'; }).join('') +
        '</div></body></html>';

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(function() { 
        printWindow.print();
        appState.view = 'week';
        renderWeekView();
    }, 500);
}
