export async function resolveTicker(company) {
  if (!company) return '';

  const specialMappings = {
    'HDFC': 'HDFCBANK',
    'HDFC Bank': 'HDFCBANK',
    'HDFCBANK': 'HDFCBANK',
  };

  const normalized = company.trim();
  if (specialMappings[normalized]) {
    const ticker = specialMappings[normalized];
    console.log(`[resolveTicker] Input "${company}" → special mapping "${ticker}"`);
    return ticker;
  }

  if (/^[A-Z0-9\.]+$/i.test(company)) {
    const ticker = company.toUpperCase();
    console.log(`[resolveTicker] Input "${company}" → ticker "${ticker}"`);
    return ticker;
  }
  const cand1 = company
    .replace(/\s+/g, '')
    .replace(/[^A-Z0-9\.]/gi, '')
    .toUpperCase();
  if (cand1) {
    console.log(`[resolveTicker] Input "${company}" → candidate1 "${cand1}"`);
    return cand1;
  }
  const firstWord = (company.split(/\s+/)[0] || '').replace(/[^A-Z]/gi, '').toUpperCase();
  const ticker = firstWord || company.toUpperCase().replace(/\s+/g, '');
  console.log(`[resolveTicker] Input "${company}" → ticker "${ticker}"`);
  return ticker;
}

export async function fetchFundamentals(ticker) {
  const finnhubKey = process.env.FINNHUB_API_KEY || process.env.DATA_API_KEY;
  if (!finnhubKey || !ticker) {
    console.log('[fetchFundamentals] No API key or ticker – returning empty fundamentals');
    return {};
  }

  const suffixes = ['', '.NS', '.BO'];

  for (const suffix of suffixes) {
    const symbol = `${ticker}${suffix}`;

    const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${finnhubKey}`;
    console.log(`[fetchFundamentals] Trying Finnhub profile: ${profileUrl}`);

    try {
      const res = await fetch(profileUrl);
      if (!res.ok) {
        console.warn(`[fetchFundamentals] Profile HTTP ${res.status} for ${symbol}`);
        continue;
      }
      const data = await res.json();
      console.log(`[fetchFundamentals] Profile data for ${symbol}:`, JSON.stringify(data, null, 2));

      if (data && Object.keys(data).length > 0) {
        const fundamentals = {
          marketCap: data.marketCapitalization ?? null,
          peRatio: data.pe ?? null,
          dividendYield: data.dividendYield ?? null,
          eps: data.eps ?? null,
          industry: data.finnhubIndustry ?? null,
          weburl: data.weburl ?? null,
          country: data.country ?? null,
        };
        console.log(`[fetchFundamentals] Success with profile data for ${symbol}`);
        return fundamentals;
      }
    } catch (error) {
      console.warn(`[fetchFundamentals] Profile request error for ${symbol}:`, error.message);
    }
  }

  console.warn('[fetchFundamentals] All attempts failed – returning empty fundamentals');
  return {};
}

export async function fetchComprehensiveFinancials(ticker) {
  const priceData = await fetchFinancials(ticker);
  const fundamentals = await fetchFundamentals(ticker);

  return {
    ...priceData,
    ...fundamentals,
  };
}

export async function fetchFinancials(ticker) {
  const finnhubKey = process.env.FINNHUB_API_KEY || process.env.DATA_API_KEY;
  if (!finnhubKey || !ticker) {
    console.log('[fetchFinancials] No API key or ticker – returning fallback');
    return {
      ticker,
      currentPrice: null,
      highPrice: null,
      lowPrice: null,
      openPrice: null,
      previousClose: null,
      source: 'Fallback',
      note: 'Add FINNHUB_API_KEY to .env for real financial data',
    };
  }

  const suffixes = ['', '.NS', '.BO'];
  for (const suffix of suffixes) {
    const symbol = `${ticker}${suffix}`;
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${finnhubKey}`;
    console.log(`[fetchFinancials] Trying Finnhub: ${url}`);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[fetchFinancials] Finnhub HTTP ${res.status} for ${symbol}`);
        continue;
      }
      const data = await res.json();
      console.log(`[fetchFinancials] Finnhub raw response for ${symbol}:`, JSON.stringify(data, null, 2));

      const current = data.c ?? 0;
      const high = data.h ?? 0;
      const low = data.l ?? 0;
      const open = data.o ?? 0;
      const prevClose = data.pc ?? 0;
      const timestamp = data.t ?? 0;

      if (
        (current > 0 || high > 0 || low > 0 || open > 0 || prevClose > 0) &&
        timestamp > 0
      ) {
        const result = {
          ticker: symbol,
          currentPrice: current,
          highPrice: high,
          lowPrice: low,
          openPrice: open,
          previousClose: prevClose,
          source: 'Finnhub',
        };
        console.log(`[fetchFinancials] Success with Finnhub (${symbol})`);
        return result;
      } else {
        console.warn(`[fetchFinancials] Finnhub returned empty/zero data for ${symbol}`);
      }
    } catch (error) {
      console.warn(`[fetchFinancials] Finnhub request error for ${symbol}:`, error.message);
    }
  }

  const yahooSuffixes = ['', '.NS', '.BO'];
  for (const suffix of yahooSuffixes) {
    const yahooSymbol = `${ticker}${suffix}`;
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`;
    console.log(`[fetchFinancials] Trying Yahoo Finance: ${yahooUrl}`);
    try {
      const res = await fetch(yahooUrl);
      if (!res.ok) {
        console.warn(`[fetchFinancials] Yahoo HTTP ${res.status} for ${yahooSymbol}`);
        continue;
      }
      const data = await res.json();
      console.log(`[fetchFinancials] Yahoo raw response for ${yahooSymbol}:`, JSON.stringify(data, null, 2));

      const result = data.chart?.result?.[0];
      if (!result) {
        console.warn(`[fetchFinancials] Invalid Yahoo response structure for ${yahooSymbol}`);
        continue;
      }
      const meta = result.meta;
      const quote = result.indicators?.quote?.[0];

      const currentPrice = meta.regularMarketPrice ?? null;
      if (currentPrice && currentPrice > 0) {
        const yahooResult = {
          ticker: yahooSymbol,
          currentPrice: currentPrice,
          highPrice: meta.regularMarketDayHigh ?? null,
          lowPrice: meta.regularMarketDayLow ?? null,
          openPrice: quote?.open?.[0] ?? meta.regularMarketOpen ?? null,
          previousClose: meta.chartPreviousClose ?? null,
          fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? null,
          fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? null,
          volume: meta.regularMarketVolume ?? null,
          currency: meta.currency ?? 'USD',
          longName: meta.longName ?? null,
          exchange: meta.fullExchangeName ?? null,
          source: 'YahooFinance',
        };
        console.log(`[fetchFinancials] Success with Yahoo Finance (${yahooSymbol})`);
        return yahooResult;
      } else {
        console.warn(`[fetchFinancials] Yahoo returned invalid/zero price for ${yahooSymbol}`);
        continue;
      }
    } catch (error) {
      console.warn(`[fetchFinancials] Yahoo Finance request error for ${yahooSymbol}:`, error.message);
      continue;
    }
  }

  console.warn('[fetchFinancials] All Yahoo Finance attempts failed');

  console.log('[fetchFinancials] All sources failed – returning fallback object');
  return {
    ticker,
    currentPrice: null,
    highPrice: null,
    lowPrice: null,
    openPrice: null,
    previousClose: null,
    source: 'Fallback',
    note: 'Add FINNHUB_API_KEY to .env for real financial data',
  };
}

export async function fetchNews(company) {
  const newsKey =
    process.env.NEWS_API_KEY ||
    process.env.NEWSDATA_API_KEY ||
    process.env.DATA_API_KEY;
  if (!newsKey || !company) {
    console.log('[fetchNews] No API key or company – returning mock news');
    return [
      {
        source: 'MockNews',
        title: `Recent mention of ${company}`,
        snippet: 'Example snippet. Add a valid news API key to .env for real news.',
        url: null,
      },
    ];
  }

  const isNewData = Boolean(process.env.NEWSDATA_API_KEY);
  const ticker = await resolveTicker(company);
  const query = encodeURIComponent(`"${company}" OR "${ticker}"`);
  let url;
  if (isNewData) {
    url = `https://newsdata.io/api/1/news?apikey=${encodeURIComponent(newsKey)}&q=${query}&language=en&size=10`;
  } else {
    url = `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${encodeURIComponent(newsKey)}`;
  }

  console.log(`[fetchNews] Request URL: ${url}`);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[fetchNews] HTTP ${res.status}`);
      return [
        {
          source: 'MockNews',
          title: `Recent mention of ${company}`,
          snippet: 'Example snippet. Add a valid news API key to .env for real news.',
          url: null,
        },
      ];
    }
    const data = await res.json();
    console.log('[fetchNews] Raw API response:', JSON.stringify(data, null, 2));

    let articles = [];
    if (isNewData) {
      articles = Array.isArray(data.results) ? data.results : [];
    } else {
      articles = Array.isArray(data.articles) ? data.articles : [];
    }
    console.log(`[fetchNews] Received ${articles.length} articles before filtering`);

    const companyLower = company.toLowerCase();
    const tickerLower = ticker.toLowerCase();
    const relevant = articles.filter((a) => {
      const title = (a.title || '').toLowerCase();
      const desc = (a.description || a.content || a.summary || '').toLowerCase();
      return (
        title.includes(companyLower) ||
        title.includes(tickerLower) ||
        desc.includes(companyLower) ||
        desc.includes(tickerLower)
      );
    });
    console.log(`[fetchNews] ${relevant.length} articles passed relevance filter`);

    const top = relevant.slice(0, 5).map((article) => ({
      source: article.source?.name || article.source_id || article.source || 'News',
      title: article.title || 'No title',
      snippet: article.description || article.content || article.summary || 'No summary available',
      url: article.url || article.link || null,
    }));

    if (top.length === 0) {
      console.log('[fetchNews] No relevant articles – falling back to mock');
      return [
        {
          source: 'MockNews',
          title: `Recent mention of ${company}`,
          snippet: 'Example snippet. Add a valid news API key to .env for real news.',
          url: null,
        },
      ];
    }
    console.log(`[fetchNews] Returning ${top.length} relevant articles`);
    return top;
  } catch (error) {
    console.warn('[fetchNews] Request error:', error.message);
    return [
      {
        source: 'MockNews',
        title: `Recent mention of ${company}`,
        snippet: 'Example snippet. Add a valid news API key to .env for real news.',
        url: null,
      },
    ];
  }
}