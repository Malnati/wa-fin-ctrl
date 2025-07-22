# Frontend React - WA Financeiro

Este é o frontend React para o sistema de controle financeiro WA, migrado dos templates Jinja2 para componentes React modernos.

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/
│   │   ├── BaseLayout.jsx      # Layout base com totalizadores e controles
│   │   ├── Report.jsx          # Componente principal de relatório
│   │   ├── PrintableReport.jsx # Componente para impressão
│   │   └── Row.jsx             # Componente para linhas da tabela
│   ├── styles/
│   │   └── BaseLayout.css      # Estilos específicos do BaseLayout
│   ├── App.jsx                 # Componente principal com roteamento
│   ├── App.css                 # Estilos do aplicativo
│   └── index.css               # Estilos globais
├── package.json
├── vite.config.js              # Configuração do Vite com proxy
└── README.md
```

## Componentes

### BaseLayout.jsx
- Substitui o template `base.html.j2`
- Renderiza cabeçalho, totalizadores e controles de colunas
- Gerencia visibilidade de colunas opcionais
- Suporta modo de impressão

### Report.jsx
- Substitui o template `unified_report.html.j2`
- Renderiza tabela de relatório com dados dinâmicos
- Suporta modo editável e modo de impressão
- Integra com BaseLayout

### PrintableReport.jsx
- Substitui o template `print_report.html.j2`
- Otimizado para impressão
- Inclui campos editáveis inline
- Renderiza assinaturas e botão de salvar

### Row.jsx
- Substitui a macro `_row.html.j2`
- Renderiza linhas individuais da tabela
- Suporta campos editáveis
- Gerencia anexos (imagens e PDFs)
- Inclui ações para edição (salvar, cancelar, etc.)

## Funcionalidades

### Roteamento
- `/` - Página inicial com lista de relatórios
- `/report/:filename` - Visualização de relatório
- `/print/:filename` - Versão para impressão

### Controles de Colunas
- Toggle para mostrar/ocultar colunas opcionais
- Descrição, OCR, Data-Hora, Classificação
- Responsivo para mobile

### Edição Inline
- Campos editáveis em modo de edição
- Validação e salvamento de alterações
- Ações por linha (salvar, cancelar, desconsiderar, etc.)

### Impressão
- Estilos otimizados para impressão
- Campos editáveis em versão impressa
- Assinaturas e informações de cabeçalho

## Tecnologias Utilizadas

- **React 18** - Framework principal
- **React Router DOM** - Roteamento
- **Bootstrap 5** - Framework CSS
- **Bootstrap Icons** - Ícones
- **Vite** - Build tool e dev server

## Configuração

### Instalação
```bash
cd frontend
npm install
```

### Desenvolvimento
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

## Proxy Configuration

O `vite.config.js` está configurado para fazer proxy das seguintes rotas para o backend Django:

- `/api/*` → `http://localhost:8000`
- `/reports/*` → `http://localhost:8000`
- `/health` → `http://localhost:8000`
- `/static/*` → `http://localhost:8000`
- `/imgs/*` → `http://localhost:8000`

## Migração de Templates

### Jinja2 → React

| Template Jinja2 | Componente React | Descrição |
|----------------|------------------|-----------|
| `base.html.j2` | `BaseLayout.jsx` | Layout base com totalizadores |
| `unified_report.html.j2` | `Report.jsx` | Relatório principal |
| `print_report.html.j2` | `PrintableReport.jsx` | Versão para impressão |
| `_row.html.j2` | `Row.jsx` | Linhas da tabela |

### Conversões Principais

- **Loops Jinja**: `{% for %}` → `array.map()`
- **Condicionais**: `{% if %}` → `{condition && <JSX>}`
- **Variáveis**: `{{ variable }}` → `{variable}`
- **Macros**: `{% macro %}` → Componentes React
- **Extends**: `{% extends %}` → Composição de componentes

## API Integration

O frontend consome as seguintes APIs do backend Django:

- `GET /api/reports` - Lista de relatórios disponíveis
- `GET /api/reports/{filename}` - Dados de um relatório específico
- `GET /reports/{filename}` - Dados para impressão

## Estilos

- **Bootstrap 5** para layout e componentes
- **CSS customizado** para estilos específicos
- **Media queries** para responsividade
- **Estilos de impressão** otimizados

## Desenvolvimento

### Estrutura de Dados Esperada

```javascript
{
  periodo: "2024-01",
  rows: [
    {
      data_hora: "2024-01-15 10:30",
      classificacao: "Pagamento",
      ricardo: "100.00",
      rafael: "50.00",
      anexo: "comprovante.jpg",
      descricao: "Descrição do pagamento",
      ocr: "Texto extraído via OCR",
      motivo: "Motivo do erro (se houver)"
    }
  ],
  totalizadores: {
    ricardo: "1,500.00",
    ricardo_float: 1500.0,
    rafael: "750.00",
    rafael_float: 750.0
  },
  timestamp: "2024-01-15T10:30:00Z",
  is_editable: true,
  tem_motivo: false,
  edit_link: "/edit/report/2024-01",
  print_link: "/print/report/2024-01"
}
```
