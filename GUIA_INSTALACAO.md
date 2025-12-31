# 📱 Guia de Instalação - iPhone 17

## Método 1: Usar Diretamente (Mais Simples)

### Passo 1: Extrair o ZIP
1. Baixe o arquivo `planejador_agenda_corrigido_iphone.zip`
2. Extraia o conteúdo em uma pasta no seu computador ou iCloud Drive

### Passo 2: Abrir no iPhone
**Opção A - Via iCloud Drive:**
1. Coloque a pasta extraída no iCloud Drive
2. No iPhone, abra o app "Arquivos"
3. Navegue até a pasta do projeto
4. Toque no arquivo `index.html`
5. Selecione "Abrir com Safari" ou "Abrir com Chrome"

**Opção B - Via AirDrop:**
1. Envie o arquivo `index.html` para o iPhone via AirDrop
2. Toque no arquivo recebido
3. Selecione "Abrir com Safari" ou "Abrir com Chrome"

**Opção C - Via E-mail:**
1. Envie o arquivo `index.html` para seu e-mail
2. Abra o e-mail no iPhone
3. Baixe o anexo
4. Toque no arquivo e abra com Safari ou Chrome

### Passo 3: Adicionar à Tela Inicial (Opcional)
1. Com o planejador aberto no Safari
2. Toque no ícone de **compartilhar** (quadrado com seta para cima)
3. Role para baixo e toque em **"Adicionar à Tela de Início"**
4. Dê um nome (ex: "Minha Agenda")
5. Toque em **"Adicionar"**
6. Agora você tem um ícone na tela inicial como um app!

---

## Método 2: Hospedar Online (Acesso de Qualquer Lugar)

### Usando GitHub Pages (Grátis)
1. Crie uma conta no GitHub (github.com)
2. Crie um novo repositório público
3. Faça upload dos arquivos do projeto
4. Vá em Settings → Pages
5. Ative o GitHub Pages
6. Acesse pelo link fornecido (ex: seuusuario.github.io/planejador)

### Usando Netlify Drop (Grátis)
1. Acesse netlify.com/drop
2. Arraste a pasta do projeto
3. Receba um link público instantâneo
4. Acesse de qualquer dispositivo

---

## Método 3: Servidor Local (Para Desenvolvedores)

### Usando Python (se tiver instalado)
```bash
cd pasta_do_projeto
python3 -m http.server 8080
```
Acesse: http://localhost:8080

### Usando Node.js (se tiver instalado)
```bash
cd pasta_do_projeto
npx http-server -p 8080
```
Acesse: http://localhost:8080

---

## ✅ Verificação de Funcionamento

Após abrir o planejador no iPhone, verifique:

- [ ] Os botões estão todos visíveis sem scroll horizontal
- [ ] A visualização semanal mostra os dias em colunas
- [ ] Você consegue tocar e abrir um dia para edição
- [ ] A barra de cores aparece corretamente
- [ ] O texto é legível sem precisar dar zoom
- [ ] Não há partes cortadas na tela

Se todos os itens estiverem OK, está funcionando perfeitamente! 🎉

---

## 🆘 Solução de Problemas

**Problema: Botões cortados ou scroll horizontal**
- Solução: Force a atualização da página (puxe para baixo no Safari)

**Problema: Layout não muda no iPhone**
- Solução: Limpe o cache do navegador (Ajustes → Safari → Limpar Histórico)

**Problema: Cores não aparecem**
- Solução: Verifique se todos os arquivos (HTML, CSS, JS) estão na mesma pasta

**Problema: Dados não salvam**
- Solução: Certifique-se de que o Safari pode usar localStorage (Ajustes → Safari → Bloquear Cookies → desativado)

---

## 💡 Dicas de Uso

1. **Backup Regular**: Use o botão "Exportar Backup" para salvar seus dados
2. **Modo Paisagem**: Funciona, mas o modo retrato é otimizado
3. **Impressão**: Use o botão de imprimir para gerar PDFs
4. **Offline**: Funciona sem internet depois de carregar uma vez
5. **Múltiplos Dispositivos**: Exporte o backup e importe em outro dispositivo

---

## 📞 Suporte

Se tiver dúvidas ou problemas:
1. Verifique o arquivo `CORRECOES_MOBILE.md` para detalhes técnicos
2. Leia o `RESUMO_CORRECOES.md` para entender as mudanças
3. Certifique-se de estar usando a versão corrigida (com os arquivos .md inclusos)

---

**Aproveite seu planejador otimizado para iPhone! 📱✨**
