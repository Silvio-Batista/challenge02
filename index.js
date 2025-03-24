const fs = require("fs");
const puppeteer = require("puppeteer");

(async () => {
  const baseUrl =
    "https://mercado.carrefour.com.br/bebidas?category-1=bebidas&category-1=4599&facets=category-1&sort=score_desc&page=";

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Acessa a primeira página para detectar quantas páginas existem
  console.log("Identificando total de páginas...");
  await page.goto(baseUrl + "1", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForSelector('a[href*="page="] button', { timeout: 20000 });

  const totalPages = await page.evaluate(() => {
    const paginationButtons = Array.from(
      document.querySelectorAll('a[href*="page="] button')
    )
      .map((btn) => parseInt(btn.innerText))
      .filter((n) => !isNaN(n));

    return Math.max(...paginationButtons, 1);
  });

  console.log(`Total de páginas detectadas: ${totalPages}`);
  await page.close();

  const concurrencyLimit = 2; // aumentar de acordo com a máquina
  const allProducts = [];
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Função para processar as páginas ao mesmo tempo
  const processBatch = async (batch) => {
    const tasks = batch.map(async (currentPage) => {
      const url = `${baseUrl}${currentPage}`;
      const page = await browser.newPage();

      try {
        console.log(`Carregando página ${currentPage}...`);
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForSelector("li > article", { timeout: 20000 });

        const products = await page.evaluate(() => {
          const items = document.querySelectorAll("li > article");
          const data = [];

          items.forEach((item) => {
            const name = item.querySelector("h3 a")?.innerText || "";
            const priceElements = item.querySelectorAll(
              'span[data-test-id="price"]'
            );
            const price =
              priceElements[1]?.innerText || priceElements[0]?.innerText || "";

            const rawImg = item.querySelector("img")?.src || "";
            const image = decodeURIComponent(
              rawImg.split("url=")[1]?.split("&")[0] || ""
            );

            // Procura a próxima pagina
            const rawLink = item.querySelector("h3 a")?.href || "";
            const link = rawLink.startsWith("http")
              ? rawLink
              : `https://mercado.carrefour.com.br${rawLink}`;

            data.push({ name, price, image, link });
          });

          return data;
        });

        console.log(
          `Página ${currentPage} capturada com ${products.length} produtos`
        );
        await page.close();
        await new Promise((r) => setTimeout(r, 100)); // tempo entre página
        return products;
      } catch (error) {
        console.warn(`Falha na página ${currentPage}: ${error.message}`);
        await page.close();
        return [];
      }
    });

    const results = await Promise.all(tasks);
    results.forEach((res) => allProducts.push(...res));
  };

  // Executa os lotes com limite de abas simultâneas
  for (let i = 0; i < pageNumbers.length; i += concurrencyLimit) {
    const batch = pageNumbers.slice(i, i + concurrencyLimit);
    await processBatch(batch);
  }

  await browser.close();

  fs.writeFileSync("output.json", JSON.stringify(allProducts, null, 2));
  console.log(`Finalizado. Total de produtos: ${allProducts.length}`);
})();
