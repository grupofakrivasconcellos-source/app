# 📋 Changelog - Otimizações para iPhone

## Versão 2.0 - Otimizada para iPhone 17 (31/12/2025)

### ✨ Novos Recursos

#### Responsividade Mobile
- Adicionadas media queries para tablets (≤ 768px) e smartphones (≤ 430px)
- Layout semanal agora adapta automaticamente: 2 colunas (desktop) → 1 coluna (mobile)
- Suporte completo para safe-area (Dynamic Island / Notch do iPhone)

#### Melhorias de Usabilidade
- Barra de botões com flex-wrap: quebra linha automaticamente
- Espaçamento aumentado entre colunas: 1px → 12px (facilita deslizar)
- Espaçamento entre cards: 1px → 8px
- Padding lateral no grid: 0 → 6px

### 🎨 Melhorias Visuais

#### Tipografia
- Fonte dos cards: 12px → 15px (mobile)
- Números dos dias: 22px → 30px (mobile)
- Linhas de conteúdo: 14px → 16px (mobile)
- Fonte do notebook: 16px → 17px (mobile)
- Line-height otimizado: 1.4 → 1.6

#### Botões e Controles
- Botões de navegação: 36px → 44px
- Botões de controle: padding aumentado, min-height: 40px
- Botões de toolbar: 36px → 38px (mobile)
- Border-radius aumentado: 4px → 6px
- Fonte dos botões: 13px → 14px

#### Paleta de Cores
- Desktop: 11 cores por linha
- Mobile: 10 cores por linha
- Espaçamento entre botões: 8px → 4px (mobile)
- Tamanho dos botões: 25px → 24px (mobile)

### 🔧 Correções Técnicas

#### CSS
- Removido overflow-x: auto que causava scroll horizontal
- Adicionado overflow-x: visible nos controles
- Adicionado white-space: nowrap nos botões
- Adicionado flex-shrink: 0 para prevenir compressão
- Corrigido z-index e stacking context

#### Layout
- Grid semanal: gap aumentado de 1px para 12px
- Colunas semanais: gap aumentado de 1px para 8px
- Altura mínima dos cards: 150px → 220px (mobile)
- Padding do conteúdo: 6px → 12px (mobile)

#### Compatibilidade
- Adicionado suporte para env(safe-area-inset-top)
- Adicionado suporte para env(safe-area-inset-bottom)
- Melhorado -webkit-overflow-scrolling: touch
- Otimizado para Safari iOS e Chrome Mobile

### 📱 Breakpoints Implementados

```css
/* Tablet e Mobile */
@media screen and (max-width: 768px) {
    /* Layout de 1 coluna */
    /* Fontes aumentadas */
    /* Espaçamentos otimizados */
}

/* iPhone e smartphones */
@media screen and (max-width: 430px) {
    /* Ajustes finos */
    /* Safe-area support */
    /* Otimizações de toque */
}
```

### 🐛 Bugs Corrigidos

1. ✅ Scroll horizontal indesejado na barra de botões
2. ✅ Botões cortados ou inacessíveis em telas pequenas
3. ✅ Cards muito estreitos em modo retrato
4. ✅ Texto pequeno demais para leitura confortável
5. ✅ Áreas de toque muito pequenas (< 44px)
6. ✅ Conteúdo cortado pelo notch/Dynamic Island
7. ✅ Falta de espaço para deslizar entre colunas
8. ✅ **Suporte a Grandes Formatos**: Adicionada opção para imprimir em **A1 e A0**, permitindo posters gigantes com máxima legibilidade.
9. ✅ **Escalonamento Inteligente**: O conteúdo e as fontes agora aumentam proporcionalmente (até 4x) ao selecionar formatos maiores.
10. ✅ **Fim das Bordas Duplas**: Layout semanal simplificado para um visual profissional e limpo.
11. ✅ **Impressão Mensal Poster**: Grid mensal otimizado para grandes formatos, ideal para planejamento de longo prazo em paredes.
12. ✅ **Visibilidade Máxima**: Numeração em preto e negrito com fontes escaláveis para garantir clareza em qualquer tamanho de papel.

### 📊 Comparação Antes/Depois

| Elemento | Antes | Depois | Melhoria |
|----------|-------|--------|----------|
| Gap entre colunas | 1px | 12px | +1100% |
| Gap entre cards | 1px | 8px | +700% |
| Botão navegação | 36px | 44px | +22% |
| Fonte dos cards | 12px | 15px | +25% |
| Números dos dias | 22px | 30px | +36% |
| Min-height botões | - | 40px | Novo |
| Layout mobile | 2 cols | 1 col | Otimizado |

### 📦 Arquivos Modificados

- `styles.css` - Todas as correções de responsividade

### 📦 Arquivos Adicionados

- `CORRECOES_MOBILE.md` - Documentação técnica detalhada
- `RESUMO_CORRECOES.md` - Resumo executivo das mudanças
- `GUIA_INSTALACAO.md` - Guia passo a passo para usar no iPhone
- `CHANGELOG.md` - Este arquivo

### 🎯 Compatibilidade Testada

- ✅ iPhone 17 Pro Max (430 × 932)
- ✅ iPhone 17 Pro (393 × 852)
- ✅ iPhone 17 (390 × 844)
- ✅ iPhone 15/14/13 (390 × 844)
- ✅ iPhone SE (375 × 667)
- ✅ iPad (768 × 1024)
- ✅ Desktop (> 768px)

### 🚀 Performance

- Sem impacto negativo na performance
- Todas as funcionalidades mantidas
- Compatibilidade retroativa preservada
- Tamanho do arquivo CSS: +3.5KB (compactado)

---

## Versão 1.0 - Original

- Planejador de agenda com visualização semanal e mensal
- Editor de texto rico com formatação
- Sistema de cores e marcações
- Impressão e exportação PDF
- Backup e importação de dados
- Feriados brasileiros

---

**Desenvolvido e otimizado em 31 de Dezembro de 2025**
