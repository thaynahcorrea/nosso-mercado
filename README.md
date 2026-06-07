# Nosso Mercado 🧺

App para organizar as compras de mercado do casal: listas, preços por loja, orçamento mensal e sincronização entre celulares.

## Tecnologias
- **React + Vite** (PWA instalável no celular)
- **Tailwind CSS**
- **Supabase** (sincronização na nuvem entre dispositivos)
- **GitHub Pages** (publicação)

## Funcionalidades
- Múltiplas listas (criar, renomear, excluir)
- Itens com quantidade planejada, marca e categoria
- Marcar comprado (rápido sem preço, ou com preço/peso)
- Itens por unidade ou por kg
- Histórico de preços e comparação entre lojas
- Orçamento mensal e resumo por forma de pagamento
- Funciona offline (local-first) e sincroniza quando há internet

## Rodar localmente
```bash
npm install
npm run dev
```
Crie um arquivo `.env` (veja `.env.example`) com as chaves do seu projeto Supabase.

## Publicação
Deploy automático via GitHub Actions a cada push na branch `main`.
