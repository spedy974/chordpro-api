const express = require("express");
const cors = require("cors");
const chordpro = require("chordpro");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = 3000;

app.post("/render", (req, res) => {
  try {
    const { chordpro: text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing or invalid chordpro field" });
    }

    const song = chordpro.parse(text);

    let html = `<pre style="font-family: monospace; line-height: 1.4;">\n`;

    song.lines.forEach((line) => {
      if (line.type === "lyrics") {
        html += line.text + "\n";
      }
    });

    html += "</pre>";

    const lyrics_plain = song.lines
      .filter((l) => l.type === "lyrics")
      .map((l) => l.text)
      .join("\n");

    res.json({
      success: true,
      html,
      lyrics_plain,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("ChordPro API is running");
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
