const fs = require("fs");

const previousData = JSON.parse(process.argv[2]);

const currentContent = fs.readFileSync(
  "src/i18n/locales/en/translation.json",
  "utf8"
);

const currentData = JSON.parse(currentContent);

function compareObjects(obj1, obj2) {
  for (const key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
        compareObjects(obj1[key], obj2[key]);
      } else if (obj1[key] !== obj2[key]) {
        console.warn(`Value of key "${key}" has changed:`);
        console.log(`Previous: ${obj1[key]}`);
        console.log(`Current: ${obj2[key]}`);
        console.log(
          "::error file=src/i18n/locales/en/translation.json,line=1::TEST"
        );
      }
    }
  }
}

compareObjects(previousData, currentData);
