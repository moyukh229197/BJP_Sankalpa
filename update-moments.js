import yts from 'yt-search';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data', 'site-content.json');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY environment variable.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Run multiple targeted searches and merge results
const SEARCH_QUERIES = [
  'Suvendu Adhikari news today',
  'West Bengal BJP government today',
  'Bengal CM Suvendu Adhikari',
  'West Bengal government decision today',
  'Bengal BJP cabinet news'
];

async function fetchLatestNews() {
  console.log("Running multiple YouTube searches...");

  const seen = new Set();
  const allVideos = [];

  // Run all searches in parallel
  const results = await Promise.allSettled(
    SEARCH_QUERIES.map(q => yts(q))
  );

  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    for (const item of result.value.videos.slice(0, 8)) {
      if (!item.videoId || seen.has(item.videoId)) continue;
      seen.add(item.videoId);
      allVideos.push({
        videoId: item.videoId,
        title: item.title,
        description: item.description || '',
        channel: item.author?.name || 'Unknown',
        publishedAt: item.ago || 'Recently',
        thumbnail: `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${item.videoId}`
      });
    }
  }

  console.log(`Found ${allVideos.length} unique videos across all searches.`);
  return allVideos;
}

async function filterWithAI(videos, existingUrls) {
  console.log("Filtering and formatting with Gemini AI...");

  // Pre-filter out already-stored videos to save tokens
  const freshVideos = videos.filter(v => !existingUrls.has(v.url));
  if (freshVideos.length === 0) {
    console.log("All fetched videos are already in the database.");
    return [];
  }
  console.log(`Sending ${freshVideos.length} fresh videos to Gemini...`);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            title:  { type: SchemaType.STRING, description: "Short, punchy Hindi-English title for the moment" },
            desc:   { type: SchemaType.STRING, description: "1-2 sentence factual description of the news" },
            date:   { type: SchemaType.STRING, description: "Inferred publish date in format like 'May 24, 2026'. Use today's date if 'ago' says '1 hour ago', '3 hours ago' etc." },
            badge:  { type: SchemaType.STRING, description: "1-2 word uppercase tag like 'BREAKING', 'CABINET', 'SPEECH', 'VISIT', 'SCHEME'" },
            yt:     { type: SchemaType.STRING, description: "Full YouTube URL https://www.youtube.com/watch?v=..." },
            thumb:  { type: SchemaType.STRING, description: "The thumbnail URL from the input" }
          },
          required: ["title", "desc", "date", "badge", "yt", "thumb"]
        }
      }
    }
  });

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const prompt = `
Today's date is ${today}.

You are curating the "Key Moments" section for the official West Bengal BJP Government accountability dashboard.

Review these recent YouTube videos fetched from news channels. Select 3 to 4 of the most important, genuine, breaking news stories about:
- CM Suvendu Adhikari's actions, speeches, visits
- West Bengal cabinet decisions and government schemes
- Significant BJP political events in Bengal
- Government welfare announcements

REJECT: entertainment, cricket, unrelated national news, opinion/debate shows, duplicate stories about the same event.
If fewer than 3 videos are genuinely newsworthy, return only those. Return empty array [] if none qualify.

Use the "publishedAt" field (e.g. "3 hours ago", "1 day ago") to infer the correct date. Today is ${today}.

Videos:
${JSON.stringify(freshVideos, null, 2)}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Gemini response:", text);
    return [];
  }
}

async function updateMoments() {
  try {
    const rawData = await fs.readFile(DATA_FILE, 'utf-8');
    const siteData = JSON.parse(rawData);

    const rawVideos = await fetchLatestNews();
    if (rawVideos.length === 0) {
      console.log("No videos found from any search.");
      return;
    }

    const existingUrls = new Set(siteData.moments.map(m => m.yt));

    const newMoments = await filterWithAI(rawVideos, existingUrls);
    if (!newMoments || newMoments.length === 0) {
      console.log("AI found no new qualifying updates to add.");
      return;
    }

    // Final dedup check
    const uniqueNewMoments = newMoments.filter(m => !existingUrls.has(m.yt));
    if (uniqueNewMoments.length === 0) {
      console.log("No new unique moments after dedup.");
      return;
    }

    // Prepend newest on top — frontend sorts by date anyway
    siteData.moments = [...uniqueNewMoments, ...siteData.moments];

    // Cap at 100 (≈ 1 month at 3-4/day)
    siteData.moments = siteData.moments.slice(0, 100);

    await fs.writeFile(DATA_FILE, JSON.stringify(siteData, null, 2));
    console.log(`✅ Successfully added ${uniqueNewMoments.length} new moments!`);
    uniqueNewMoments.forEach(m => console.log(`  • [${m.date}] ${m.title}`));

  } catch (err) {
    console.error("Error updating moments:", err);
    process.exit(1);
  }
}

updateMoments();
