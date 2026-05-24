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

async function fetchLatestNews() {
  console.log("Fetching latest news from YouTube via yt-search...");
  const res = await yts('West Bengal BJP OR Suvendu Adhikari news');

  // yt-search returns a mix of results, we just want the top 10 videos
  const videos = res.videos.slice(0, 10).map(item => ({
    videoId: item.videoId,
    title: item.title,
    description: item.description,
    channel: item.author.name,
    publishedAt: item.ago || 'Recently',
    thumbnail: item.thumbnail
  }));

  return videos;
}

async function filterWithAI(videos) {
  console.log("Filtering and formatting with Gemini AI...");
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING, description: "A catchy, short title for the moment" },
            desc: { type: SchemaType.STRING, description: "A 1-2 sentence description of the news" },
            date: { type: SchemaType.STRING, description: "Date in format 'May 14, 2026'" },
            badge: { type: SchemaType.STRING, description: "A short, 1-word uppercase badge (e.g., 'UPDATE', 'NEWS', 'CABINET')" },
            yt: { type: SchemaType.STRING, description: "The full YouTube video URL" },
            thumb: { type: SchemaType.STRING, description: "The high-res thumbnail URL provided in the input" }
          },
          required: ["title", "desc", "date", "badge", "yt", "thumb"]
        }
      }
    }
  });

  const prompt = `
  You are curating the "Key Moments" section for the West Bengal BJP Government Dashboard.
  Review the following recent YouTube video snippets. Select up to 3 to 4 of the most important, relevant, and reliable breaking news updates regarding the government, cabinet decisions, CM Suvendu Adhikari, or significant state events that occurred today.
  Ignore generic noise, duplicate topics, or unrelated national news. If there are no highly critical updates, it is okay to return fewer or an empty array.
  
  Format the output strictly as a JSON array of objects.
  
  Videos:
  ${JSON.stringify(videos, null, 2)}
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text);
}

async function updateMoments() {
  try {
    const rawData = await fs.readFile(DATA_FILE, 'utf-8');
    const siteData = JSON.parse(rawData);

    const rawVideos = await fetchLatestNews();
    if (rawVideos.length === 0) {
      console.log("No new videos found.");
      return;
    }

    const newMoments = await filterWithAI(rawVideos);
    if (!newMoments || newMoments.length === 0) {
      console.log("AI found no highly relevant updates to add.");
      return;
    }

    // Filter out moments that are already in the array (by checking URL)
    const existingUrls = new Set(siteData.moments.map(m => m.yt));
    const uniqueNewMoments = newMoments.filter(m => !existingUrls.has(m.yt));

    if (uniqueNewMoments.length === 0) {
      console.log("No new unique moments to add.");
      return;
    }

    // Prepend new moments so they appear first
    siteData.moments = [...uniqueNewMoments, ...siteData.moments];
    
    // Cap at 100 items so we can store roughly a month of updates at 3-4 per day
    siteData.moments = siteData.moments.slice(0, 100);

    await fs.writeFile(DATA_FILE, JSON.stringify(siteData, null, 2));
    console.log(`Successfully added ${uniqueNewMoments.length} new moments.`);
  } catch (err) {
    console.error("Error updating moments:", err);
    process.exit(1);
  }
}

updateMoments();
