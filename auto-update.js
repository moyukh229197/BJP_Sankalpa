// ═══════════════════════════════════════════════════════════════
//  Auto-Update Script — Sonar Bangla Sankalp Tracker
//  Fetches RSS news feeds, uses Gemini AI for structured
//  extraction, deduplicates, and writes to data files.
// ═══════════════════════════════════════════════════════════════
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── CONFIG ──
const DATA_DIR = path.join(__dirname, 'data');
const SITE_CONTENT_PATH = path.join(DATA_DIR, 'site-content.json');
const DAILY_LOG_PATH = path.join(DATA_DIR, 'dailyLog.json');
const OATH_DATE = new Date('2026-05-09T00:00:00+05:30');

// ── RSS FEEDS ──
const RSS_FEEDS = [
  { name: 'The Hindu – WB',       url: 'https://www.thehindu.com/news/national/west-bengal/feeder/default.rss' },
  { name: 'NDTV India',           url: 'https://feeds.feedburner.com/ndtvnews-india-news' },
  { name: 'ANI News',             url: 'https://www.aninews.in/rss/category/national.xml' },
  { name: 'Hindustan Times',      url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml' },
  { name: 'News18 Bengali',       url: 'https://bengali.news18.com/rss/bengali.xml' },
];

// ── KEYWORDS ──
const KEYWORDS = [
  'west bengal', 'bengal', 'kolkata', 'bjp', 'suvendu', 'adhikari',
  'nabanna', 'bengal cabinet', 'annapurna', 'ayushman', 'bsf',
  'border fencing', 'calcutta', 'howrah', 'siliguri', 'mamata',
  'tmc', 'trinamool', 'bengal government', 'bengal cm',
  'ssc scam', 'bengal police', 'wb governor', 'bengal assembly',
  'panchayat bengal', 'bengal bjp', 'agnimitra paul',
];

// ── CATEGORIES & ICONS ──
const CATEGORY_MAP = {
  'cabinet|minister|secretariat|governor|assembly|cm|government|portfolio':  'Governance',
  'ayushman|health|hospital|medical|doctor':                                 'Healthcare',
  'border|bsf|security|police|arrest|cbi|sit|probe|fir|violence|murder|crime': 'Law & Order',
  'pay commission|da|arrear|finance|budget|tax':                             'Finance',
  'job|employment|vacanc|recruit|ssc|youth':                                 'Employment',
  'women|annapurna|bus|transport':                                           'Women',
  'industry|vishwakarma|singur|factory':                                     'Industry',
  'infrastructure|road|bridge|highway|ghatal|flood':                         'Infrastructure',
  'education|school|university|college':                                     'Education',
  'census|obc|reservation':                                                  'Governance',
};

const ICON_MAP = {
  'Governance':     'landmark',
  'Healthcare':     'heart-pulse',
  'Law & Order':    'shield-alert',
  'Finance':        'scale',
  'Employment':     'graduation-cap',
  'Women':          'heart-handshake',
  'Industry':       'flame',
  'Infrastructure': 'building-2',
  'Education':      'book-open',
  'Security':       'shield-check',
};

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

function loadEnv(){
  const envPath = path.join(__dirname, '.env');
  if(!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for(const line of lines){
    const trimmed = line.trim();
    if(!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if(eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if(!process.env[key]) process.env[key] = val;
  }
}

function todayIST(){
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

function dayNumber(dateStr){
  const d = new Date(dateStr + 'T00:00:00+05:30');
  return Math.max(0, Math.floor((d - OATH_DATE) / 864e5));
}

function categorize(text){
  const t = text.toLowerCase();
  for(const [pattern, cat] of Object.entries(CATEGORY_MAP)){
    if(new RegExp(pattern).test(t)) return cat;
  }
  return 'Governance';
}

function iconFor(category){
  return ICON_MAP[category] || 'newspaper';
}

function matchesKeywords(text){
  const t = text.toLowerCase();
  return KEYWORDS.some(kw => t.includes(kw));
}

function similarity(a, b){
  const wordsA = new Set(a.toLowerCase().split(/\s+/));
  const wordsB = new Set(b.toLowerCase().split(/\s+/));
  const intersection = [...wordsA].filter(w => wordsB.has(w));
  const union = new Set([...wordsA, ...wordsB]);
  return intersection.length / union.size;
}

// ═══════════════════════════════════════════════════════════════
//  RSS FETCHING (basic XML parsing — no external dependency)
// ═══════════════════════════════════════════════════════════════

function extractTag(xml, tag){
  const re = new RegExp(`<${tag}[^>]*>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*</${tag}>`, 'i');
  const m = xml.match(re);
  return m ? m[1].trim() : '';
}

function parseRSSItems(xml){
  const items = [];
  const itemBlocks = xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
  for(const block of itemBlocks){
    const title = extractTag(block, 'title');
    const desc = extractTag(block, 'description').replace(/<[^>]*>/g, '').slice(0, 400);
    const link = extractTag(block, 'link');
    const pubDate = extractTag(block, 'pubDate');
    items.push({ title, desc, link, pubDate });
  }
  return items;
}

async function fetchFeed(feed){
  try{
    const res = await fetch(feed.url, {
      headers: { 'User-Agent': 'SonarBanglaSankalpTracker/1.0' },
      signal: AbortSignal.timeout(15000),
    });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const items = parseRSSItems(xml);
    console.log(`  ✅ ${feed.name}: ${items.length} items`);
    return items.map(item => ({ ...item, source: feed.name, sourceUrl: item.link }));
  }catch(err){
    console.log(`  ⚠️  ${feed.name}: ${err.message}`);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
//  GEMINI AI EXTRACTION
// ═══════════════════════════════════════════════════════════════

async function extractWithGemini(articles){
  const apiKey = process.env.GEMINI_API_KEY;
  if(!apiKey || apiKey === 'your_gemini_api_key_here'){
    console.log('  ⚠️  No Gemini API key — falling back to rule-based extraction');
    return null;
  }

  try{
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const batch = articles.slice(0, 20).map((a, i) =>
      `[${i+1}] TITLE: ${a.title}\nDESC: ${a.desc}\nSOURCE: ${a.source}\nURL: ${a.sourceUrl}\nDATE: ${a.pubDate}`
    ).join('\n\n');

    const prompt = `You are a structured data extractor for the BJP West Bengal government's progress tracker.

From the following news articles about BJP's government in West Bengal, extract structured events.

For each relevant article, output a JSON array of objects with these fields:
- "date": YYYY-MM-DD format (IST)
- "time": approximate time like "10:00 AM" or "All Day"
- "title": concise event title (max 80 chars)
- "desc": one-paragraph description (max 250 chars)
- "category": one of [Governance, Healthcare, Law & Order, Finance, Employment, Women, Industry, Infrastructure, Education, Security]
- "icon": one of [landmark, heart-pulse, shield-alert, scale, graduation-cap, heart-handshake, flame, building-2, book-open, shield-check, newspaper]
- "source": the source URL

Only include articles that are directly about BJP West Bengal government actions, policies, or decisions.
Skip opinion pieces, editorials, and articles about other states.

ARTICLES:
${batch}

Respond ONLY with a valid JSON array. No markdown, no explanation.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if(!jsonMatch) throw new Error('No JSON array in response');
    const events = JSON.parse(jsonMatch[0]);
    console.log(`  🤖 Gemini extracted ${events.length} events`);
    return events;
  }catch(err){
    console.log(`  ⚠️  Gemini extraction failed: ${err.message}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
//  RULE-BASED FALLBACK EXTRACTION
// ═══════════════════════════════════════════════════════════════

function extractRuleBased(articles){
  const events = [];
  for(const article of articles){
    const text = `${article.title} ${article.desc}`;
    if(!matchesKeywords(text)) continue;

    let dateStr = todayIST();
    if(article.pubDate){
      try{
        const d = new Date(article.pubDate);
        if(!isNaN(d)) dateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      }catch(e){ /* use today */ }
    }

    const cat = categorize(text);
    events.push({
      date: dateStr,
      time: 'All Day',
      title: article.title.slice(0, 80),
      desc: (article.desc || article.title).slice(0, 250),
      category: cat,
      icon: iconFor(cat),
      source: article.sourceUrl || '',
    });
  }
  console.log(`  📋 Rule-based extracted ${events.length} events`);
  return events;
}

// ═══════════════════════════════════════════════════════════════
//  DEDUPLICATION
// ═══════════════════════════════════════════════════════════════

function deduplicateEvents(newEvents, existingDailyLog){
  const existingTitles = [];
  for(const day of existingDailyLog){
    for(const ev of day.events || []){
      existingTitles.push(ev.title);
    }
  }

  return newEvents.filter(ev => {
    for(const existing of existingTitles){
      if(similarity(ev.title, existing) > 0.6) return false;
    }
    return true;
  });
}

// ═══════════════════════════════════════════════════════════════
//  DATA FILE MANAGEMENT
// ═══════════════════════════════════════════════════════════════

function loadJSON(filepath){
  try{
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  }catch(err){
    console.log(`  ⚠️  Could not load ${path.basename(filepath)}: ${err.message}`);
    return null;
  }
}

function saveJSON(filepath, data){
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`  💾 Saved ${path.basename(filepath)}`);
}

function mergeEventsIntoDailyLog(dailyLog, events){
  let added = 0;
  for(const ev of events){
    let dayEntry = dailyLog.find(d => d.date === ev.date);
    if(!dayEntry){
      dayEntry = {
        date: ev.date,
        dayNumber: dayNumber(ev.date),
        label: `Day ${dayNumber(ev.date)}`,
        events: [],
      };
      dailyLog.push(dayEntry);
    }
    dayEntry.events.push({
      time: ev.time || 'All Day',
      title: ev.title,
      desc: ev.desc,
      category: ev.category,
      icon: ev.icon,
      source: ev.source || '',
    });
    added++;
  }
  // Sort by date
  dailyLog.sort((a, b) => new Date(a.date) - new Date(b.date));
  return added;
}

function updateManifestoProgress(manifesto, events){
  const text = events.map(e => `${e.title} ${e.desc}`).join(' ').toLowerCase();
  let updated = 0;
  for(const promise of manifesto){
    const keywords = promise.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const matches = keywords.filter(kw => text.includes(kw)).length;
    if(matches >= 2){
      const bump = Math.min(5, matches);
      if(promise.prog < 100){
        promise.prog = Math.min(100, promise.prog + bump);
        if(promise.prog > 0 && promise.status === 'Pending') promise.status = 'In Progress';
        if(promise.prog >= 100) promise.status = 'Completed';
        updated++;
      }
    }
  }
  return updated;
}

// ═══════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════

export default async function autoUpdate(){
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  🔄 Sonar Bangla — Auto Update');
  console.log(`  📅 ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  console.log('═══════════════════════════════════════════════════\n');

  // Load .env
  loadEnv();

  // 1. Fetch RSS feeds
  console.log('📡 Fetching RSS feeds...');
  const allArticles = [];
  for(const feed of RSS_FEEDS){
    const items = await fetchFeed(feed);
    allArticles.push(...items);
  }
  console.log(`\n  📰 Total articles fetched: ${allArticles.length}`);

  if(allArticles.length === 0){
    console.log('\n  ℹ️  No articles found. Exiting.');
    return;
  }

  // 2. Filter by keywords
  const relevant = allArticles.filter(a => matchesKeywords(`${a.title} ${a.desc}`));
  console.log(`  🔍 Relevant articles (keyword match): ${relevant.length}`);

  if(relevant.length === 0){
    console.log('\n  ℹ️  No relevant articles found. Exiting.');
    return;
  }

  // 3. Extract structured events (Gemini AI or fallback)
  console.log('\n🤖 Extracting structured events...');
  let extracted = await extractWithGemini(relevant);
  if(!extracted) extracted = extractRuleBased(relevant);

  if(extracted.length === 0){
    console.log('\n  ℹ️  No events extracted. Exiting.');
    return;
  }

  // 4. Load existing data
  console.log('\n📂 Loading existing data...');
  const siteContent = loadJSON(SITE_CONTENT_PATH) || {
    manifesto: [],
    dailyLog: [],
    moments: [],
    backlog: [],
  };

  // 5. Deduplicate
  console.log('\n🔄 Deduplicating...');
  const unique = deduplicateEvents(extracted, siteContent.dailyLog || []);
  console.log(`  ✅ ${unique.length} new unique events (${extracted.length - unique.length} duplicates removed)`);

  if(unique.length === 0){
    console.log('\n  ℹ️  No new events to add. All caught up!');
    return;
  }

  // 6. Merge into daily log
  console.log('\n📝 Merging into daily log...');
  const added = mergeEventsIntoDailyLog(siteContent.dailyLog, unique);
  console.log(`  ✅ Added ${added} events to daily log`);

  // 7. Update manifesto progress
  console.log('\n📊 Updating manifesto progress...');
  const progUpdated = updateManifestoProgress(siteContent.manifesto, unique);
  console.log(`  ✅ Updated progress for ${progUpdated} promises`);

  // 8. Save files
  console.log('\n💾 Saving data files...');
  saveJSON(SITE_CONTENT_PATH, siteContent);
  saveJSON(DAILY_LOG_PATH, siteContent.dailyLog);

  console.log('\n═══════════════════════════════════════════════════');
  console.log(`  ✅ Auto-update complete! ${added} new events added.`);
  console.log('═══════════════════════════════════════════════════\n');
}

// Run when called directly
autoUpdate().catch(err => {
  console.error('❌ Auto-update failed:', err);
  process.exit(1);
});
