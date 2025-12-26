# Script para reformular o CSS de impressão para todos os modos

with open('styles.css', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '@media print {'
start_pos = content.find(start_marker)

if start_pos == -1:
    print("Erro: Não encontrou @media print")
    exit(1)

before_print = content[:start_pos]

new_print_section = '''@media print {
    @page {
        size: A4 portrait;
        margin: 8mm;
    }

    /* Reset Geral para Impressão */
    * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }

    .no-print {
        display: none !important;
    }

    .print-only {
        display: block !important;
    }

    body, html {
        background: white !important;
        width: 100% !important;
        height: auto !important;
    }

    #app, .main-view {
        display: block !important;
        width: 100% !important;
        height: auto !important;
        overflow: visible !important;
    }

    /* ========== 1. IMPRESSÃO SEMANAL (Layout Vertical) ========== */
    .week-view-container {
        display: block !important;
        width: 100% !important;
    }

    .week-grid {
        display: flex !important;
        flex-direction: column !important;
        gap: 5px !important;
        width: 100% !important;
    }

    .week-column {
        display: contents !important;
    }

    .day-card-grid {
        page-break-inside: avoid !important;
        border: 1px solid #eee !important;
        margin-bottom: 5px !important;
        padding: 5px !important;
        min-height: auto !important;
        width: 100% !important;
    }

    /* Cabeçalho do Dia na Semana */
    .day-card-grid .day-print-header {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        border-bottom: 1px solid #333 !important;
        margin-bottom: 4px !important;
        padding-bottom: 2px !important;
    }

    .day-card-grid .print-date {
        font-size: 11px !important;
        font-weight: bold !important;
        margin: 0 !important;
    }

    .day-card-grid .print-day-name {
        font-size: 10px !important;
        color: #666 !important;
        margin: 0 !important;
    }

    .day-card-grid .print-divider {
        display: none !important;
    }

    /* Conteúdo das Linhas na Semana */
    .day-card-content {
        display: block !important;
        overflow: visible !important;
    }

    .day-line-wrapper {
        display: none !important;
        padding: 2px 0 !important;
        border-bottom: 1px solid #f9f9f9 !important;
        align-items: flex-start !important;
    }

    .day-line-wrapper.has-content {
        display: flex !important;
    }

    .line-number-preview {
        font-size: 8px !important;
        width: 18px !important;
        color: #aaa !important;
        flex-shrink: 0 !important;
    }

    .day-line-preview {
        font-size: 9px !important;
        line-height: 1.3 !important;
        word-break: break-word !important;
        color: inherit !important;
    }

    /* ========== 2. IMPRESSÃO DIÁRIA (Individual) ========== */
    body.editing-day .day-edit-view {
        display: block !important;
        position: static !important;
        width: 100% !important;
    }

    body.editing-day .week-view-container, 
    body.editing-day .month-view {
        display: none !important;
    }

    .day-edit-view .day-print-header {
        text-align: center !important;
        margin-bottom: 15px !important;
    }

    .day-edit-view .print-date {
        font-size: 22px !important;
        font-weight: bold !important;
    }

    .day-edit-view .print-day-name {
        font-size: 16px !important;
        color: #666 !important;
    }

    .notebook-line-wrapper {
        display: none !important;
        padding: 5px 0 !important;
        border-bottom: 1px solid #eee !important;
    }

    .notebook-line-wrapper.has-content {
        display: flex !important;
    }

    .line-number {
        font-size: 10px !important;
        width: 25px !important;
    }

    .notebook-line {
        font-size: 12px !important;
        line-height: 1.5 !important;
    }

    /* ========== 3. IMPRESSÃO MENSAL ========== */
    .month-view {
        width: 100% !important;
        height: auto !important;
    }

    .month-grid {
        display: grid !important;
        grid-template-columns: repeat(7, 1fr) !important;
        border: 1px solid #000 !important;
        width: 100% !important;
    }

    .month-day-cell {
        min-height: 80px !important;
        border: 0.5px solid #000 !important;
        padding: 2px !important;
    }

    .month-day-num {
        font-size: 10px !important;
        width: 18px !important;
        height: 18px !important;
        line-height: 18px !important;
    }

    .month-cell-content {
        font-size: 7px !important;
        line-height: 1.1 !important;
        max-height: none !important;
        overflow: visible !important;
    }

    .month-line-rich {
        margin-bottom: 1px !important;
        border-bottom: 0.5px dotted #eee !important;
    }

    .month-calendar {
        height: auto !important;
    }
}
'''

with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(before_print + new_print_section)

print("CSS de impressão global atualizado com sucesso!")
