/**
 * Maths Practice — Leaderboard receiver
 *
 * SETUP
 * 1. Open (or create) a Google Sheet for your leaderboard.
 * 2. Extensions → Apps Script. Delete any starter code, paste this whole file in.
 * 3. Click Deploy → New deployment.
 *      - Select type: Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 4. Click Deploy, authorize when asked, then copy the "Web app URL".
 * 5. Paste that URL into Cloudflare Pages → your project → Settings →
 *    Environment variables → SHEET_URL, then redeploy your site.
 *
 * Every finished practice round / mock test sends a POST like:
 *   { name, id, score, meta, date }
 * This appends one row per entry to a sheet tab called "Leaderboard"
 * (created automatically on first run) with columns:
 *   Timestamp | Name | Player ID | Score | Detail | Date
 */

const SHEET_NAME = 'Leaderboard';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();

    sheet.appendRow([
      new Date(),                 // when the server received it
      data.name || '',
      data.id || '',
      data.score !== undefined ? data.score : '',
      data.meta || '',
      data.date || ''
    ]);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

// Optional: lets you open the Web App URL in a browser to sanity-check it's alive.
function doGet(e) {
  return jsonResponse({ ok: true, message: 'Leaderboard endpoint is live. POST entries here.' });
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Name', 'Player ID', 'Score', 'Detail', 'Date']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
