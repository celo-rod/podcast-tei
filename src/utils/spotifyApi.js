import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import 'dotenv/config';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SHOW_ID = '72c8m1wYNTWRjkBtKMXH5c';

async function getToken() {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
  });

  const data = await res.json();
  return data.access_token;
}

async function fetchEpisodes() {
  const token = await getToken();

  const res = await fetch(
    `https://api.spotify.com/v1/shows/${SHOW_ID}/episodes?market=BR&limit=50`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const data = await res.json();

  const episodes = data.items.map((ep) => ({
    id: ep.id,
    title: ep.name,
    description: ep.description,
    date: ep.release_date,
    image: ep.images[0]?.url,
  }));

  const filePath = path.resolve('src/data/episodes.json');
  fs.writeFileSync(filePath, JSON.stringify(episodes, null, 2), 'utf-8');
}

fetchEpisodes();
