# Proxy Scraper App

Este projeto é uma aplicação Node.js com frontend que realiza scraping de proxies brasileiros (HTTPS e SOCKS4) a partir de três fontes públicas: [spys.one](https://spys.one), [ProxyScrape](https://proxyscrape.com) e [Geonode](https://geonode.com). Ele exibe os proxies coletados em uma interface web simples e oferece a opção de baixar a lista em um arquivo `.txt`.

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Status](https://img.shields.io/badge/Projeto-Ativo-brightgreen)
![Licença](https://img.shields.io/badge/Licença-MIT-blue)

## 🔧 Funcionalidades

- Scraping de proxies brasileiros HTTPS e SOCKS4
- Interface web para exibição dos proxies
- Download da lista em formato `.txt` (apenas IP:Porta)
- Filtro automático de proxies duplicados
- Remoção de placeholders inválidos como `$ip:$port`

## 🚀 Tecnologias

- Node.js
- Express.js
- Axios
- Cheerio (scraping HTML)
- HTML + JavaScript (frontend)

## 📦 Instalação

```bash
git clone https://github.com/3xhat1/proxy-scraper-app.git
cd proxy-scraper-app
npm install
```

## ▶️ Execução

```bash
npm start
```

Acesse a interface via navegador:

```
http://localhost:3000
```

## 📁 Estrutura do Projeto

```
proxy-scraper-app/
├── public/
│   └── index.html       # Frontend com tabela + botão de download
├── server.js            # Lógica de scraping e API
├── package.json         # Dependências e config do projeto
```

## 📥 Download dos Proxies

Acesse `http://localhost:3000/download` ou clique no botão "Baixar TXT" na interface para salvar a lista de proxies no formato `ip:porta`.

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto.
2. Crie uma branch com sua feature: `git checkout -b minha-feature`
3. Commit suas alterações: `git commit -m 'feat: nova funcionalidade'`
4. Push para a branch: `git push origin minha-feature`
5. Abra um Pull Request.

## 📝 Licença

Este projeto está sob a Licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
