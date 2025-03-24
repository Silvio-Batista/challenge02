
# 🧾 Documentação do Script de Scraping – Carrefour Bebidas

## 📌 Objetivo

Coletar automaticamente dados da seção de **bebidas** do site do Carrefour Mercado Online, varrendo todas as páginas disponíveis e extraindo:

- Nome do produto  
- Preço  
- Imagem (URL limpa)  
- Link do produto  

O resultado final é salvo em um arquivo `output.json`.

---

## 🛠️ Tecnologias Utilizadas

- **Node.js**  
- **Puppeteer** – Automação de navegação com Chromium  
- **fs (File System)** – Escrita do arquivo final em disco  

---

## ⚙️ Funcionalidades do Script

- Detecta automaticamente o número total de páginas disponíveis.
- Realiza scraping com **execução concorrente limitada** (controlada via `concurrencyLimit`).
- Extrai informações estruturadas de cada produto.
- Lida com falhas de carregamento de página de forma resiliente.
- Salva os dados coletados em JSON com identação para facilitar leitura e processamento posterior.

---

## 📁 Saída Esperada

Um arquivo chamado `output.json` com uma estrutura como esta:

```json
[
  {
    "name": "Cerveja Heineken Long Neck 330ml",
    "price": "R$ 3,99",
    "image": "https://cdn.carrefour.com.br/img-produto.jpg",
    "link": "https://mercado.carrefour.com.br/cerveja-heineken..."
  },
  ...
]
```

---

## ⚠️ Observações

- O valor de `concurrencyLimit` pode ser ajustado conforme a capacidade da máquina e o risco de bloqueio pelo site.
- Pode ser facilmente adaptado para outras categorias ou e-commerces com estrutura semelhante.
- Não recomendado para uso contínuo ou de alta frequência sem controle de taxa (*rate limiting*).

---

Se quiser automatizar isso com agendamento (tipo rodar toda sexta à noite) ou adaptar para outras categorias (tipo carnes, snacks, etc), é só pedir.
