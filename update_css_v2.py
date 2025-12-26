# Script para atualizar a seção de impressão do CSS com ajustes mais agressivos

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
        margin: 5mm; /* Margem reduzida para ganhar espaço */
    }

    .no-print {
        display: none !important;
    }

    .print-only {
        display: block !important;
    }

    #app, .main-view {
        display: block !important;
        position: static !important;
        width: 100% !important;
        height: auto !important;
        padding: 0 !important;
        margin: 0 !important;
        background: white !important;
        overflow: visible !important;
    }

    /* Ajuste de escala global para impressão semanal */
    .week-view-container {
        width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
    }

    /* Cabeçalho de Impressão (Modelo Imagem) */
    .day-print-header {
        text-align: left !important; /* Alinhado à esquerda para economizar altura */
        margin-bottom: 2px !important;
        display: block !important;
    }

    /* Cabeçalho ultra compacto para impressão semanal */
    .day-card-grid .day-print-header .print-date {
        font-size: 10px !important;
        font-weight: bold !important;
        color: #000 !important;
        display: inline !important;
        margin-right: 5px !important;
    }

    .day-card-grid .day-print-header .print-day-name {
        font-size: 10px !important;
        color: #444 !important;
        display: inline !important;
    }

    .day-card-grid .day-print-header .print-divider {
        border: none !important;
        border-top: 0.5px solid #000 !important;
        margin: 1px 0 2px 0 !important;
        width: 100% !important;
    }

    /* Visão Semanal na Impressão - Layout Vertical */
    .week-grid {
        display: block !important;
        width: 100% !important;
    }

    .week-column {
        display: block !important;
        width: 100% !important;
    }

    .day-card-grid {
        page-break-inside: avoid !important;
        border: 0.5px solid #ccc !important;
        margin-bottom: 3px !important; /* Espaçamento mínimo entre dias */
        width: 100% !important;
        padding: 2px 4px !important;
        min-height: auto !important;
    }
    
    .day-card-grid:last-child {
        margin-bottom: 0 !important;
    }

    /* Ajuste do conteúdo dos cards */
    .day-card-content {
        overflow: visible !important;
        max-height: none !important;
        padding: 0 !important;
    }

    /* Conteúdo das Linhas - Ultra Compacto */
    .day-line-wrapper {
        display: none !important;
        border-bottom: 0.5px solid #f0f0f0 !important;
        padding: 0.5px 0 !important;
        font-size: 7.5px !important; /* Fonte ainda menor */
        line-height: 1.1 !important;
        align-items: flex-start !important;
    }

    .day-line-wrapper.has-content {
        display: flex !important;
    }

    .line-number-preview, .line-number {
        color: #999 !important;
        margin-right: 3px !important;
        width: 14px !important;
        flex-shrink: 0 !important;
        font-size: 6.5px !important;
    }

    .day-line-preview, .notebook-line {
        flex: 1 !important;
        word-break: break-word !important;
        min-height: 0.8em !important;
        color: #000 !important;
        font-size: 7.5px !important;
    }

    /* Garantir cores de highlight na impressão */
    .day-line-preview *, .notebook-line * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }

    /* Esconder elementos desnecessários */
    .no-content-msg {
        display: none !important;
    }

    /* Forçar remoção de cabeçalhos/rodapés do navegador */
    @page {
        margin: 5mm;
    }
}
'''

with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(before_print + new_print_section)

print("CSS atualizado com ajustes ultra compactos!")
