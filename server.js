const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = 3000;

/**
 * Scrape spys.one
 */
async function scrapeSpysOne() {
  console.log("[spys.one] Iniciando scraping...");
  const url = "https://spys.one/free-proxy-list/BR/";
  const proxies = [];

  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const $ = cheerio.load(data);

    // Percorre <tr> buscando IP:Porta
    $("tr").each((i, el) => {
      const tdList = $(el).find("td");
      if (tdList.length > 1) {
        const rawText = $(tdList[0]).text().trim();
        const match = rawText.match(/(\d+\.\d+\.\d+\.\d+):(\d+)/);
        if (match) {
          const ip = match[1];
          const port = match[2];
          const typeTd = $(tdList[1]).text().toUpperCase();

          // Filtrar apenas HTTPS ou SOCKS4
          if (typeTd.includes("HTTPS") || typeTd.includes("SOCKS4")) {
            proxies.push({
              ip,
              port,
              protocol: typeTd.includes("SOCKS4") ? "socks4" : "https",
              source: "spys.one"
            });
          }
        }
      }
    });
  } catch (err) {
    console.error("[spys.one] Erro:", err.message);
  }
  return proxies;
}

/**
 * Scrape ProxyScrape (API)
 */
async function scrapeProxyScrape() {
  console.log("[ProxyScrape] Iniciando scraping...");
  const url =
    "https://api.proxyscrape.com/v4/free-proxy-list/get?request=display_proxies&country=br&proxy_format=protocolipport&format=text&anonymity=all&timeout=20000";
  const proxies = [];

  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const lines = data.split("\n").map((l) => l.trim()).filter(Boolean);
    lines.forEach((line) => {
      const [ip, port] = line.split(":");
      proxies.push({
        ip,
        port,
        protocol: "https", // sem distinção real, assumimos "https"
        source: "proxyscrape"
      });
    });
  } catch (err) {
    console.error("[ProxyScrape] Erro:", err.message);
  }
  return proxies;
}

/**
 * Scrape Geonode
 */
async function scrapeGeonode() {
  console.log("[Geonode] Iniciando scraping...");
  const url = "https://geonode.com/free-proxy-list";
  const proxies = [];

  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const $ = cheerio.load(data);

    $("table tbody tr").each((i, el) => {
      const tdList = $(el).find("td");
      if (tdList.length >= 5) {
        const ip = $(tdList[0]).text().trim();
        const port = $(tdList[1]).text().trim();
        const country = $(tdList[2]).text().trim();
        const protocolInfo = $(tdList[4]).text().toLowerCase();

        if (
          country.toUpperCase() === "BR" &&
          (protocolInfo.includes("https") || protocolInfo.includes("socks4"))
        ) {
          proxies.push({
            ip,
            port,
            protocol: protocolInfo.includes("socks4") ? "socks4" : "https",
            source: "geonode"
          });
        }
      }
    });
  } catch (err) {
    console.error("[Geonode] Erro:", err.message);
  }
  return proxies;
}

/**
 * Função para juntar proxies de todas as fontes e remover duplicados.
 */
async function getProxies() {
  console.log("\n=== Coletando proxies ===");
  const [spys, ps, geo] = await Promise.all([
    scrapeSpysOne(),
    scrapeProxyScrape(),
    scrapeGeonode()
  ]);

  let allProxies = [...spys, ...ps, ...geo];

  // Remover duplicados (baseado em ip, porta e protocolo)
  const uniqueMap = new Map();
  allProxies.forEach((proxy) => {
    const key = `${proxy.ip}:${proxy.port}:${proxy.protocol}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, proxy);
    }
  });

  const finalList = Array.from(uniqueMap.values());
  console.log(`Total de proxies após remover duplicados: ${finalList.length}`);
  return finalList;
}

// Rota que retorna proxies em JSON
app.get("/proxies", async (req, res) => {
  try {
    const proxies = await getProxies();
    res.json({ count: proxies.length, proxies });
  } catch (err) {
    console.error("Erro na rota /proxies:", err.message);
    res.status(500).json({ error: "Erro ao obter proxies." });
  }
});

// Rota para baixar os proxies em um arquivo TXT
// - Remove placeholders "$ip:$port"
// - Filtra apenas linhas que correspondam ao formato IP:porta
app.get("/download", async (req, res) => {
  try {
    const proxies = await getProxies();
    // Monta a string "ip:porta" (uma por linha)
    let txt = proxies.map((proxy) => `${proxy.ip}:${proxy.port}`).join("\n");

    // 1) Remove linhas exatas que sejam "$ip:$port"
    txt = txt.replace(/^\$ip:\$port\s*$/gm, "");

    // 2) Filtra apenas linhas que correspondam a "X.X.X.X:YYYY"
    txt = txt
      .split(/\r?\n/)
      .filter((line) => /^\d+\.\d+\.\d+\.\d+:\d+$/.test(line))
      .join("\n");

    // Remove quebras de linha extras no fim
    txt = txt.trim();

    // Configura o response para enviar um arquivo de texto
    res.header("Content-Type", "text/plain");
    res.attachment("proxies.txt");
    return res.send(txt);
  } catch (err) {
    console.error("Erro na rota /download:", err.message);
    res.status(500).send("Erro ao gerar arquivo de proxies.");
  }
});

// Servir arquivos estáticos do diretório "public"
app.use(express.static("public"));

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
