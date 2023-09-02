const fs = require("fs");
const glob = require("glob");
const path = require("path");

const keyToUpdate = process.argv[2]; // Get the key to update from command line argument

if (!keyToUpdate) {
  console.error("Please provide the key to update as a command line argument.");
  process.exit(1);
}

function deleteKey(obj, nestedKey) {
  const keys = nestedKey.split(".");
  let currentObj = obj;
  let foundAndUpdated = false;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    if (i === keys.length - 1 && currentObj.hasOwnProperty(key)) {
      delete currentObj[key];
      foundAndUpdated = true;
    } else if (
      currentObj.hasOwnProperty(key) &&
      typeof currentObj[key] === "object"
    ) {
      currentObj = currentObj[key];
    } else {
      // Key doesn't exist, break out of loop
      break;
    }
  }

  return foundAndUpdated;
}

const startDirectory = path.join(__dirname, "..", "src", "i18n", "locales");

// Use glob to find files matching the pattern
const filesPattern = path.join(startDirectory, "**", "translation.json");
glob(filesPattern, (err, files) => {
  if (err) {
    console.error("Error while searching for files:", err);
    process.exit(1);
  }

  files.forEach((filePath) => {
    const isEnglishFile = filePath.includes(path.sep + "en" + path.sep); // Assuming 'en' is the English folder
    if (isEnglishFile) return;

    try {
      const data = fs.readFileSync(filePath, "utf8");
      const jsonData = JSON.parse(data);

      const language = filePath
        .split(path.sep + "locales" + path.sep)[1]
        .split(path.sep)[0];

      if (deleteKey(jsonData, keyToUpdate)) {
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
        console.log(`✅ ${language}`);
      }
    } catch (error) {
      console.error(`Error processing ${filePath}: ${error}`);
    }
  });
});
