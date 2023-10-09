const fs = require("fs");

const previousData = JSON.parse(process.argv[2]);

const currentContent = fs.readFileSync(
  "src/i18n/locales/en/translation.json",
  "utf8"
);

const currentData = JSON.parse(currentContent);

function compareObjects(obj1, obj2, parentPath = "") {
  for (const key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
        compareObjects(
          obj1[key],
          obj2[key],
          parentPath ? `${parentPath}.${key}` : key
        );
      } else if (obj1[key] !== obj2[key] && obj2[key] !== undefined) {
        const title = `Translation source ${parentPath}.${key} has changed`;
        const message = `Consider running \`node scripts/remove-outdated-translations.js ${parentPath}.${key}\` to reset existing translations.`;
        console.log(
          `::warning file=src/i18n/locales/en/translation.json,line=1,title=${title}::${message}`
        );
      }
    }
  }
}

compareObjects(previousData, currentData);
