import axios from "axios";

import "dotenv/config";

import { cache } from "./app.js";
import { cities } from './config/cities.js';

export async function fetchShifts() {
  try {
    const res = await axios.get(process.env.FORM_URL);
    const html = res.data;

    const match = html.match(/var FB_PUBLIC_LOAD_DATA_ = (.*?);<\/script>/s);
    if (!match) return [];

    const formData = JSON.parse(match[1]);
    const questions = formData[1][1];

    let allShifts = [];

    for (const key in cities) {
      const city = cities[key];
      const targetQuestion = questions.find(q =>
        q[1]?.includes(`Zmiany w ${city.form}`)
      );

      if (!targetQuestion) continue;

      const shifts = targetQuestion[4][0][1].map(opt => {
        const match = opt[0].match(/^(\d{2}\.\d{2}\.\d{4}):\s*(\d{2}:\d{2})-(\d{2}:\d{2})/);
        if (!match) return null;

        const [ , dateStr, startTime, endTime ] = match;
        const [d, m, y] = dateStr.split(".");
        return { date: `${y}-${m}-${d}`, startTime, endTime, city: city.name };
      }).filter(Boolean);

      allShifts.push(...shifts);
    }

    cache.set("shifts", allShifts);
    return allShifts;
  } catch (err) {
    console.error("Error while fetchShifts:", err);
    return [];
  }
}

export async function getShifts() {
  try {
    let shifts = cache.get("shifts");

    if (!shifts) {
      shifts = await fetchShifts();
    };
    
    return shifts;
  } catch (err) {
    console.error("Error while getShifts:", err);
    return [];
  }
}
