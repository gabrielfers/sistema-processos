# Sistema de Processos (Frontend)

Frontend Vue.js para gerenciamento de processos administrativos.

## 🚀 Como executar

1. Instale um servidor estático globalmente (opcional):
```bash
npm install -g serve
```

2. Rode o frontend:
```bash
npm run serve
```
Ou, se usar o `serve` globalmente:
```bash
serve public
```

3. Acesse em `http://localhost:3000` (ou porta informada).

> **Atenção:** As requisições Axios devem apontar para o backend rodando separadamente (ex: `http://localhost:3000/api/processos`).

## Estrutura

```
sistema-processos/
├── public/
│   ├── assets/
│   ├── css/
│   ├── js/
│   └── index.html
└── package.json
```

## Tecnologias

- Vue.js 2
- Bootstrap 5
- Axios
- HTML5, CSS3, JS ES6+