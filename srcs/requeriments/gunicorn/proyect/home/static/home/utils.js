const fs = require("fs");
const path = require("path");

function getTranslation(tag, lang) {
  const filePath = path.join(
    __dirname,
    "../../../../../locale/translations.json"
  );
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const item = data.find((entry) => entry.tag === tag);
  if (item) {
    return item[lang] || item["en"]; // Default to English if the language is not found
  }
  return null;
}

module.exports = { getTranslation };
