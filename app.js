// ========== CORES VIBRANTES ==========
var COLORS = [
    '#FF0000', '#FF6B00', '#FFD700', '#00D000', '#00B8D4',
    '#0066FF', '#6600FF', '#FF00FF', '#FF1493', '#00FF7F',
    '#FF4500', '#1E90FF', '#DC143C', '#00CED1', '#FFB6C1',
    '#32CD32', '#FF8C00', '#8B00FF', '#00FF00', '#FF69B4',
    '#000000', '#808080', '#FFFFFF' // Preto, Cinza, Branco
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
    document.getElementById('printWeekBtn').addEventListener('click', function() {
        printWeek();
    });

    document.getElementById('printDay').addEventListener('click', function() {
        printDay();
    });

    document.getElementById('printMonthBtn').addEventListener('click', function() {
        printMonth();
    });

    // Fechar edição
    document.getElementById('closeDayEdit').addEventListener('click', function() {
        closeDayEdit();
    });

    // Formatação
    document.getElementById('btnBold').addEventListener('click', function() { applyFormat('bold'); });
    document.getElementById('btnItalic').addEventListener('click', function() { applyFormat('italic'); });
    document.getElementById('btnStrike').addEventListener('click', function() { applyFormat('strike'); });
    document.getElementById('btnUnderline').addEventListener('click', function() { applyFormat('underline'); });

    // PDF
    document.getElementById('pdfWeekBtn').addEventListener('click', function() { exportWeekPDF(); });
    document.getElementById('pdfMonthBtn').addEventListener('click', function() { exportMonthPDF(); });
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

    var dayOrder = [1, 2, 3, 4, 5, 6, 0];
    dayOrder.forEach(function(dayOffset) {
        var date = new Date(startDate);
        var actualOffset = dayOffset === 0 ? 7 : dayOffset;
        date.setDate(startDate.getDate() + actualOffset);
        weekGrid.appendChild(createDayCardGrid(date));
    });

    // Atualizar botões
    document.getElementById('viewWeekly').classList.add('active');
    document.getElementById('viewMonthly').classList.remove('active');

    // Mostrar visão semanal
    document.getElementById('weekView').style.display = 'flex';
    document.getElementById('monthView').style.display = 'none';
    appState.view = 'week';
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

    // Cabeçalho com dias da semana (Seg-Dom)
    var dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
    dayNames.forEach(function(day) {
        var dayHeader = document.createElement('div');
        dayHeader.className = 'month-day-header';
        if (day === 'Sab' || day === 'Dom') dayHeader.style.color = '#FF0000';
        dayHeader.textContent = day;
        grid.appendChild(dayHeader);
    });

    var firstDay = new Date(appState.currentDate.getFullYear(), appState.currentDate.getMonth(), 1);
    var firstDayOfWeek = firstDay.getDay();
    var diff = firstDayOfWeek === 0 ? -6 : 1 - firstDayOfWeek;
    var startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() + diff);

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
    
    content.style.height = '140px';
    content.style.overflowY = 'auto';
    
    for (var i = 0; i < 30; i++) {
        var line = dayData.lines[i] || { text: '', spans: [] };
        var lineDiv = document.createElement('div');
        lineDiv.className = 'day-line-preview';
        lineDiv.style.borderBottom = '1px solid #eee';
        
        if (line && line.text && line.text.trim() !== '') {
            lineDiv.innerHTML = renderLineWithColors(line, i);
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

            lineEditable.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === 'Tab') {
                    e.preventDefault();
                    var nextIndex = index + 1;
                    if (nextIndex < 30) {
                        var nextLine = notebookLines.querySelector('[data-index="' + nextIndex + '"]');
                        if (nextLine) {
                            nextLine.focus();
                            var range = document.createRange();
                            var sel = window.getSelection();
                            range.selectNodeContents(nextLine);
                            range.collapse(false);
                            sel.removeAllRanges();
                            sel.addRange(range);
                        }
                    }
                }
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
    palette.innerHTML = '';

    COLORS.forEach(function(color, index) {
        var btn = document.createElement('button');
        btn.className = 'color-btn';
        btn.style.backgroundColor = color;
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
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

function applyColorToSelectedText(colorIndex) {
    var selection = window.getSelection();
    if (selection.toString().length === 0) {
        alert('Por favor, selecione o texto que deseja colorir');
        return;
    }

    var selectedText = selection.toString();
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
        if (s.start >= start && s.end <= end && (s.start !== start || s.end !== end)) return false;
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

function renderLineWithColors(lineData, index) {
    if (!lineData || !lineData.text) return '';
    
    var html = '';
    if (index !== undefined) {
        html += '<span style="color: #808080; font-weight: bold; margin-right: 8px; font-size: 0.9em;">' + (index + 1) + '</span>';
    }

    if (!lineData.spans || lineData.spans.length === 0) return html + escapeHtml(lineData.text);

    var lastIndex = 0;
    var spans = lineData.spans.slice().sort(function(a, b) { return a.start - b.start; });

    for (var i = 0; i < spans.length; i++) {
        var span = spans[i];
        if (span.start >= lineData.text.length) continue;
        var end = Math.min(span.end, lineData.text.length);
        
        if (lastIndex < span.start) {
            html += escapeHtml(lineData.text.substring(lastIndex, span.start));
        }
        
        var spanText = lineData.text.substring(span.start, end);
        var color = COLORS[span.color];
        var textColor = getContrastColor(color);
        
        var style = 'background-color: ' + color + '; color: ' + textColor + '; padding: 1px 3px; border-radius: 2px; display: inline-block;';
        if (span.bold) style += ' font-weight: bold;';
        if (span.italic) style += ' font-style: italic;';
        if (span.strike) style += ' text-decoration: line-through;';
        if (span.underline) style += ' text-decoration: underline;';
        if (span.strike && span.underline) style += ' text-decoration: line-through underline;';
        
        // Ajuste para highlight branco
        if (color === '#FFFFFF') style += ' border: 1px solid #ddd;';

        html += '<span style="' + style + '">' + escapeHtml(spanText) + '</span>';
        lastIndex = end;
    }
    if (lastIndex < lineData.text.length) html += escapeHtml(lineData.text.substring(lastIndex));
    return html;
}

function applyFormat(type) {
    var selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    var range = selection.getRangeAt(0);
    var container = range.commonAncestorContainer;
    while (container && (!container.classList || !container.classList.contains('notebook-line-editable'))) {
        container = container.parentNode;
    }
    
    if (!container) return;
    
    var lineIndex = parseInt(container.getAttribute('data-index'));
    var start = getSelectionOffset(container, range.startContainer, range.startOffset);
    var end = getSelectionOffset(container, range.endContainer, range.endOffset);
    
    if (start === end) return;
    
    var dayData = appState.days[appState.selectedDay];
    var lineData = dayData.lines[lineIndex];
    
    var newSpans = [];
    var affected = false;
    
    lineData.spans.forEach(function(span) {
        if (span.end <= start || span.start >= end) {
            newSpans.push(span);
        } else {
            affected = true;
            if (span.start < start) {
                newSpans.push({ start: span.start, end: start, color: span.color, bold: span.bold, italic: span.italic, strike: span.strike, underline: span.underline });
            }
            
            var overlapStart = Math.max(span.start, start);
            var overlapEnd = Math.min(span.end, end);
            newSpans.push({ 
                start: overlapStart, 
                end: overlapEnd, 
                color: span.color, 
                bold: type === 'bold' ? !span.bold : span.bold,
                italic: type === 'italic' ? !span.italic : span.italic,
                strike: type === 'strike' ? !span.strike : span.strike,
                underline: type === 'underline' ? !span.underline : span.underline
            });
            
            if (span.end > end) {
                newSpans.push({ start: end, end: span.end, color: span.color, bold: span.bold, italic: span.italic, strike: span.strike, underline: span.underline });
            }
        }
    });
    
    if (!affected) {
        newSpans.push({ 
            start: start, 
            end: end, 
            color: appState.selectedColor || 0, 
            bold: type === 'bold', 
            italic: type === 'italic', 
            strike: type === 'strike',
            underline: type === 'underline'
        });
    }
    
    lineData.spans = normalizeSpans(newSpans);
    updateEditableContent(container, lineData);
    saveDataToStorage();
}

function normalizeSpans(spans) {
    if (spans.length <= 1) return spans;
    spans.sort(function(a, b) { return a.start - b.start; });
    var result = [spans[0]];
    for (var i = 1; i < spans.length; i++) {
        var last = result[result.length - 1];
        var curr = spans[i];
        if (curr.start <= last.end) {
            if (curr.color === last.color && curr.bold === last.bold && curr.italic === last.italic && curr.strike === last.strike && curr.underline === last.underline) {
                last.end = Math.max(last.end, curr.end);
            } else if (curr.start < last.end) {
                last.end = curr.start;
                if (last.start < last.end) {
                    result.push(curr);
                } else {
                    result[result.length - 1] = curr;
                }
            } else {
                result.push(curr);
            }
        } else {
            result.push(curr);
        }
    }
    return result;
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

function printMonth() {
    var year = appState.currentDate.getFullYear();
    var month = appState.currentDate.getMonth();
    var monthName = appState.currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();

    var printWindow = window.open('', '', 'width=800,height=600');
    
    var firstDay = new Date(year, month, 1);
    var firstDayOfWeek = firstDay.getDay();
    var diff = firstDayOfWeek === 0 ? -6 : 1 - firstDayOfWeek;
    var startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() + diff);

    var gridHtml = '';
    var currentDate = new Date(startDate);
    
    for (var i = 0; i < 42; i++) {
        var dateStr = getDateString(currentDate);
        var dayData = appState.days[dateStr];
        var isOtherMonth = currentDate.getMonth() !== month;
        var isSpecial = currentDate.getDay() === 0 || currentDate.getDay() === 6 || isHolidayDate(currentDate);
        
        var linesHtml = '';
        if (dayData && dayData.lines) {
            var validLinesWithIdx = dayData.lines.map((l, idx) => ({...l, originalIndex: idx})).filter(function(l) { return l && l.text && l.text.trim() !== ''; });
            linesHtml = validLinesWithIdx.map(function(l) {
                return '<div class="print-month-line">' + renderLineWithColors(l, l.originalIndex) + '</div>';
            }).join('');
        }

        gridHtml += '<div class="print-month-day' + (isOtherMonth ? ' other-month' : '') + (isSpecial ? ' special' : '') + '">' +
                        '<div class="print-month-num">' + currentDate.getDate() + '</div>' +
                        '<div class="print-month-content">' + linesHtml + '</div>' +
                    '</div>';
        
        currentDate.setDate(currentDate.getDate() + 1);
    }

    var html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Calendário Mensal - ' + monthName + '</title>' +
        '<style>' +
        '@page { size: A4 landscape; margin: 5mm; }' +
        'body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: white; }' +
        '.print-month-header { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 5px; }' +
        '.print-month-grid { display: grid; grid-template-columns: repeat(7, 1fr); border-top: 1px solid #000; border-left: 1px solid #000; }' +
        '.print-month-day-header { border-right: 1px solid #000; border-bottom: 1px solid #000; text-align: center; font-weight: bold; font-size: 12px; padding: 2px; background: #eee; }' +
        '.print-month-day { border-right: 1px solid #000; border-bottom: 1px solid #000; height: 2.8cm; position: relative; overflow: hidden; }' +
        '.print-month-num { font-weight: bold; font-size: 10px; padding: 2px; text-align: center; }' +
        '.print-month-day.special .print-month-num { color: #FF0000; }' +
        '.print-month-day.other-month { background: #f9f9f9; color: #ccc; }' +
        '.print-month-content { font-size: 7px; line-height: 1.1; padding: 0 2px; }' +
        '.print-month-line { border-bottom: 0.1px solid #eee; padding: 1px 0; word-break: break-word; }' +
        '@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }' +
        '</style><script>window.onafterprint = function() { window.close(); };</script></head><body>' +
        '<div class="print-month-header">PLANEJADOR MENSAL - ' + monthName + '</div>' +
        '<div class="print-month-grid">' +
        '<div class="print-month-day-header">SEG</div><div class="print-month-day-header">TER</div><div class="print-month-day-header">QUA</div>' +
        '<div class="print-month-day-header">QUI</div><div class="print-month-day-header">SEX</div><div class="print-month-day-header">SAB</div><div class="print-month-day-header">DOM</div>' +
        gridHtml + '</div></body></html>';

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(function() { printWindow.print(); }, 500);
}

function exportWeekPDF() {
    var startDate = new Date(appState.currentDate);
    startDate.setDate(appState.currentDate.getDate() - appState.currentDate.getDay());
    
    var container = document.createElement('div');
    container.style.padding = '10mm';
    container.style.width = '190mm';
    container.style.backgroundColor = 'white';
    container.style.fontFamily = 'Arial, sans-serif';
    
    var title = document.createElement('h2');
    title.style.textAlign = 'center';
    title.style.marginBottom = '10px';
    title.textContent = 'PLANEJADOR SEMANAL - ' + document.getElementById('headerTitle').textContent;
    container.appendChild(title);
    
    var grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(7, 1fr)';
    grid.style.border = '1px solid #000';
    grid.style.minHeight = '250mm';
    
    var dayOrder = [1, 2, 3, 4, 5, 6, 0];
    dayOrder.forEach(function(dayOffset) {
        var date = new Date(startDate);
        var actualOffset = dayOffset === 0 ? 7 : dayOffset;
        date.setDate(startDate.getDate() + actualOffset);
        
        var dateStr = getDateString(date);
        var dayData = appState.days[dateStr] || { lines: [] };
        var isSpecial = date.getDay() === 0 || date.getDay() === 6 || isHolidayDate(date);
        
        var col = document.createElement('div');
        col.style.borderRight = '1px solid #000';
        col.style.display = 'flex';
        col.style.flexDirection = 'column';
        
        var header = document.createElement('div');
        header.style.borderBottom = '1px solid #000';
        header.style.padding = '5px';
        header.style.textAlign = 'center';
        header.style.fontWeight = 'bold';
        header.style.fontSize = '10px';
        header.style.backgroundColor = '#f0f0f0';
        if (isSpecial) header.style.color = '#FF0000';
        header.textContent = getDayName(date.getDay()).substring(0, 3).toUpperCase() + ' ' + date.getDate();
        col.appendChild(header);
        
        var content = document.createElement('div');
        content.style.flex = '1';
        content.style.padding = '2px';
        content.style.fontSize = '7px';
        
        for (var i = 0; i < 30; i++) {
            var line = dayData.lines[i] || { text: '', spans: [] };
            var lineDiv = document.createElement('div');
            lineDiv.style.borderBottom = '0.1px solid #eee';
            lineDiv.style.minHeight = '8px';
            if (line.text) {
                lineDiv.innerHTML = renderLineWithColors(line, i);
            }
            content.appendChild(lineDiv);
        }
        
        col.appendChild(content);
        grid.appendChild(col);
    });
    
    container.appendChild(grid);
    document.body.appendChild(container);
    
    var opt = {
        margin: 5,
        filename: 'semanal_' + getDateString(appState.currentDate) + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(container).save().then(function() {
        document.body.removeChild(container);
    }).catch(function(err) {
        console.error('Erro PDF:', err);
        document.body.removeChild(container);
    });
}

function exportMonthPDF() {
    var year = appState.currentDate.getFullYear();
    var month = appState.currentDate.getMonth();
    var monthName = appState.currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
    
    var container = document.createElement('div');
    container.style.padding = '10mm';
    container.style.width = '277mm';
    container.style.backgroundColor = 'white';
    container.style.fontFamily = 'Arial, sans-serif';
    
    var title = document.createElement('h2');
    title.style.textAlign = 'center';
    title.style.marginBottom = '10px';
    title.textContent = 'PLANEJADOR MENSAL - ' + monthName;
    container.appendChild(title);
    
    var grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(7, 1fr)';
    grid.style.borderTop = '1px solid #000';
    grid.style.borderLeft = '1px solid #000';
    
    var days = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];
    days.forEach(function(d) {
        var h = document.createElement('div');
        h.style.borderRight = '1px solid #000';
        h.style.borderBottom = '1px solid #000';
        h.style.padding = '5px';
        h.style.textAlign = 'center';
        h.style.fontWeight = 'bold';
        h.style.fontSize = '12px';
        h.style.backgroundColor = '#f0f0f0';
        if (d === 'SAB' || d === 'DOM') h.style.color = '#FF0000';
        h.textContent = d;
        grid.appendChild(h);
    });
    
    var firstDay = new Date(year, month, 1);
    var firstDayOfWeek = firstDay.getDay();
    var diff = firstDayOfWeek === 0 ? -6 : 1 - firstDayOfWeek;
    
    var startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() + diff);
    
    var currentDate = new Date(startDate);
    for (var i = 0; i < 42; i++) {
        var dateStr = getDateString(currentDate);
        var dayData = appState.days[dateStr];
        var isSpecial = currentDate.getDay() === 0 || currentDate.getDay() === 6 || isHolidayDate(currentDate);
        var isOtherMonth = currentDate.getMonth() !== month;
        
        var cell = document.createElement('div');
        cell.style.borderRight = '1px solid #000';
        cell.style.borderBottom = '1px solid #000';
        cell.style.height = '35mm';
        cell.style.padding = '2px';
        if (isOtherMonth) cell.style.backgroundColor = '#f9f9f9';
        
        var num = document.createElement('div');
        num.style.fontWeight = 'bold';
        num.style.fontSize = '10px';
        num.style.textAlign = 'center';
        if (isSpecial) num.style.color = '#FF0000';
        num.textContent = currentDate.getDate();
        cell.appendChild(num);
        
        if (dayData && dayData.lines) {
            var content = document.createElement('div');
            var validLinesWithIdx = dayData.lines.map((l, idx) => ({...l, originalIndex: idx})).filter(l => l.text);
            
            var fontSize = '6px';
            if (validLinesWithIdx.length > 8) fontSize = '4px';
            else if (validLinesWithIdx.length > 5) fontSize = '5px';
            
            content.style.fontSize = fontSize;
            validLinesWithIdx.forEach(l => {
                var line = document.createElement('div');
                line.style.marginBottom = '1px';
                line.innerHTML = renderLineWithColors(l, l.originalIndex);
                content.appendChild(line);
            });
            cell.appendChild(content);
        }
        
        grid.appendChild(cell);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    container.appendChild(grid);
    document.body.appendChild(container);
    
    var opt = {
        margin: 5,
        filename: 'mensal_' + monthName + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    
    html2pdf().set(opt).from(container).save().then(function() {
        document.body.removeChild(container);
    }).catch(function(err) {
        console.error('Erro PDF:', err);
        document.body.removeChild(container);
    });
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
        '</style><script>window.onafterprint = function() { window.close(); };</script></head><body>' +
        '<div class="print-header"><h1>' + dayName + ', ' + formatDate(date) + '</h1></div>' +
        '<div class="print-lines">' +
        linesToPrint.map(function(line) { return '<div class="print-line"><div class="print-line-content">' + renderLineWithColors(line) + '</div></div>'; }).join('') +
        '</div></body></html>';

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(function() { printWindow.print(); }, 500);
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
        '</style><script>window.onafterprint = function() { window.close(); };</script></head><body><div class="week-container-print">' + daysHtml + '</div></body></html>';

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(function() { printWindow.print(); }, 500);
}
