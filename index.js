import express from "express";
import cors from "cors";
import { SongParser } from "@chordpro/core";
import { HtmlFormatter } from "@chordpro/formatter-html";
import { ChordTransposer } from "@chordpro/core";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ==========================
// CONFIGURATION
// ==========================
const PORT = process.env.PORT || 3000;

// Option sécurité (facultatif mais recommandé)
// Décommente si tu veux une clé API
/*
const API_KEY = "CHANGE_MOI";

function checkApiKey(req, res, next) {
  const key = req.headers["x-api-key"];
  if (key !== API_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}
*/

// ==========================
// ChordPro engine
// ==========================
const parser = new SongParser();
const formatter = new HtmlFormatter();

// ==========================
// ROUTE PRINCIPALE
// ==========================
app.post("/render",
  // checkApiKey, // ← activer si clé API utilisée
  (req, res) => {
    try {
      const { chordpro, transpose = 0 } = req.body;

      if (!chordpro || typeof chordpro !== "string") {
        return res.status(400).json({ error: "Invalid chordpro input" });
      }

      // Parse
      const song = parser.parse(chordpro);

      // Transpose
      const finalSong =
        transpose !== 0
          ? new ChordTransposer().transpose(song, transpose)
          : song;

      // HTML rendering
      const htmlBody = formatter.format(finalSong);

      const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body {
  font-family: monospace;
  white-space: pre;
  padding: 10px;
  font-size: 14px;
}
.chord {
  color: #cc8400;
  font-weight: bold;
}
</style>
</head>
<body>
${htmlBody}
</body>
</html>
`;

      // Paroles seules
      const lyricsPlain = finalSong.lines
        .map(line =>
          line.items.map(i => i.lyrics || "").join("")
        )
        .join("\n");

      res.json({
        success: true,
        html: html,
        lyrics_plain: lyricsPlain
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
);

// ==========================
// HEALTH CHECK
// ==========================
app.get("/", (req, res) => {
  res.send("ChordPro API is running");
});

// ==========================
// START SERVER
// ==========================
app.listen(PORT, () => {
  console.log(`ChordPro API running on port ${PORT}`);
});
