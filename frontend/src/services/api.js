const API_BASE_URL = "http://127.0.0.1:8000/api";

export async function analyzeCrop(queryText, language = "bn-IN", farmerId = "farmer_user", followUpAnswers = null) {
  const resp = await fetch(`${API_BASE_URL}/crop/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      farmer_id: farmerId,
      query_text: queryText,
      language: language,
      follow_up_answers: followUpAnswers,
    }),
  });
  if (!resp.ok) throw new Error("Failed to analyze crop issue");
  return resp.json();
}

export async function getWeather(district = "Purba Bardhaman", query = "", language = "bn-IN") {
  const params = new URLSearchParams({ district, language });
  if (query) params.append("query", query);
  const resp = await fetch(`${API_BASE_URL}/weather/forecast?${params.toString()}`);
  if (!resp.ok) throw new Error("Failed to fetch weather");
  return resp.json();
}

export async function getMandiPrices(commodity = "", district = "", language = "bn-IN") {
  const params = new URLSearchParams({ language });
  if (commodity) params.append("commodity", commodity);
  if (district) params.append("district", district);
  const resp = await fetch(`${API_BASE_URL}/mandi/prices?${params.toString()}`);
  if (!resp.ok) throw new Error("Failed to fetch mandi prices");
  return resp.json();
}

export async function recordMandiRate(payload) {
  const resp = await fetch(`${API_BASE_URL}/mandi/add-rate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error("Failed to record mandi price");
  return resp.json();
}

export async function addVoiceDiaryLog(spokenText, language = "bn-IN", farmerId = "farmer_user") {
  const resp = await fetch(`${API_BASE_URL}/diary/voice-log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      farmer_id: farmerId,
      spoken_text: spokenText,
      language: language,
    }),
  });
  if (!resp.ok) throw new Error("Failed to save diary log");
  return resp.json();
}

export async function getReminders(farmerId = "farmer_user") {
  const resp = await fetch(`${API_BASE_URL}/diary/reminders?farmer_id=${farmerId}`);
  if (!resp.ok) throw new Error("Failed to fetch reminders");
  return resp.json();
}

export async function toggleReminder(reminderId, completed) {
  const resp = await fetch(`${API_BASE_URL}/diary/reminders/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reminder_id: reminderId,
      completed: completed,
    }),
  });
  if (!resp.ok) throw new Error("Failed to toggle reminder");
  return resp.json();
}

export async function escalateToExpert(payload) {
  const resp = await fetch(`${API_BASE_URL}/expert/escalate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error("Failed to escalate case");
  return resp.json();
}

export async function getFarmerProfile(farmerId = "farmer_user") {
  const resp = await fetch(`${API_BASE_URL}/farmer/profile?farmer_id=${farmerId}`);
  if (!resp.ok) throw new Error("Failed to fetch farmer profile");
  return resp.json();
}

export async function onboardFarmer(payload, farmerId = "farmer_user") {
  const resp = await fetch(`${API_BASE_URL}/farmer/onboard?farmer_id=${farmerId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error("Failed to save farmer profile");
  return resp.json();
}

export async function getFarmerHistory(farmerId = "farmer_user") {
  const resp = await fetch(`${API_BASE_URL}/farmer/history?farmer_id=${farmerId}`);
  if (!resp.ok) throw new Error("Failed to fetch history");
  return resp.json();
}
