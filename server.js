var fs = require("fs").promises;
var axios = require("axios");

// Chain async functions/API calls
const myAsyncPipe = (...fns) => x =>
  fns.reduce((v, f) => v.then(f), Promise.resolve(x));

// Get array of all spells
const getSpellList = async () => {
  const url = "http://dnd5eapi.co/api/spells";
  let output = await axios
    .get(url)
    .then(res => {
      return res.data;
    })
    .catch(err => {
      console.log("Error:", err);
    });
  return output;
};

// Get data for each individual spell
const getSpellData = async spellList => {
  let allSpellData = [];
  let errors = [];

  // Query API for each spell
  for await (const spell of spellList.results) {
    let spellData = await axios
      .get(spell.url)
      .then(res => res.data)
      .catch(err => {
        errors.push(err);
      });
    allSpellData.push(spellData);

    process.stdout.write("\033c");
    console.log(
      `Fetching ${allSpellData.length} of ${spellList.results.length}`
    );
  }

  if (errors.length > 0) console.log(errors);
  console.log(
    `Received ${errors.length} error${errors.length === 1 ? "" : "s"}`
  );

  return { count: allSpellData.length, spells: JSON.stringify(allSpellData) };
};

// Write spell data to spellData.json
const writeToFile = async data => {
  await fs.writeFile("spellData.json", data.spells, "utf8", function(err) {
    if (err) {
      return err;
    }
  });

  console.log(`Wrote data for ${data.count} spells. Happy hunting.`);
};

myAsyncPipe(getSpellList, getSpellData, writeToFile)();

// const doAllSpells = async () => {
//   const spellList = await getSpellList();
//   let allSpellData = [];
//
//   for await (const spell of spellList.results) {
//     let spellData = await axios
//       .get(spell.url)
//       .then(res => res.data)
//       .catch(err => {
//         console.log(err);
//       });
//     allSpellData.push(spellData);
//     console.log(allSpellData.length);
//     console.clear();
//   }
//
//   await writeToFile(JSON.stringify(allSpellData));
//   console.log("Done.");
// };
//
