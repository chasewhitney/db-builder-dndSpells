const fs = require("fs").promises;
const axios = require("axios");

// Chain async functions/API calls
const myAsyncPipe = (...fns) => x =>
  fns.reduce((v, f) => v.then(f), Promise.resolve(x));

// Get array of all spells
const getSpellList = async () => {
  const url = "http://dnd5eapi.co/api/spells";
  const output = await axios
    .get(url)
    .then(res => {
      return res.data.results;
    })
    .catch(err => {
      console.log("Error:", err);
      process.exit();
    });

  return output;
};

// Get data for each individual spell
const getSpellData = async spellList => {
  const maxCount = spellList.length;
  const allSpellData = [];
  const errors = [];
  let counter = 1;

  // Query API for each spell
  for await (const spell of spellList) {
    process.stdout.write("\033c");
    if (errors.length > 0) {
      console.log(
        `Received ${errors.length} error${errors.length === 1 ? "" : "s"}`
      );
    }
    console.log(`Fetching ${counter} of ${maxCount}`);

    const spellData = await axios
      .get("http://dnd5eapi.co" + spell.url)
      .then(res => res.data)
      .catch(err => {
        errors.push(err);
      });
    if (spellData) allSpellData.push(spellData);
    counter++;
  }

  if (errors.length > 0) console.log(errors);

  return {
    count: allSpellData.length,
    maxCount,
    spells: JSON.stringify(allSpellData)
  };
};

// Write spell data to spellData.json
const writeToFile = async data => {
  await fs.writeFile("spellData.json", data.spells, "utf8", function(err) {
    if (err) {
      return err;
    }
  });

  console.log(`Wrote data for ${data.count} of ${data.maxCount} spells.`);
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

// var request = require("request");
// var fs = require("fs").promises;
// var rp = require("request-promise");
// var axios = require("axios");
//
// // Chain async functions/API calls
// const myAsyncPipe = (...fns) => x =>
//   fns.reduce((v, f) => v.then(f), Promise.resolve(x));
//
// // Get array of all spells
// const getSpellList = async () => {
//   const url = "http://dnd5eapi.co/api/spells";
//   let output = await axios
//     .get(url)
//     .then(res => {
//       return res.data;
//     })
//     .catch(err => {
//       console.log("Error:", err);
//     });
//   return output;
// };
//
// // Get data for each individual spell
// const getSpellData = async spellList => {
//   let allSpellData = [];
//   let errors = [];
//
//   // Query API for each spell
//   for await (const spell of spellList.results) {
//     let spellData = await axios
//       .get(spell.url)
//       .then(res => res.data)
//       .catch(err => {
//         errors.push(err);
//       });
//     allSpellData.push(spellData);
//
//     process.stdout.write("\033c");
//     console.log(
//       `Fetching ${allSpellData.length} of ${spellList.results.length}`
//     );
//   }
//
//   if (errors.length > 0) console.log(errors);
//   console.log(
//     `Received ${errors.length} error${errors.length === 1 ? "" : "s"}`
//   );
//
//   return { count: allSpellData.length, spells: JSON.stringify(allSpellData) };
// };
//
// // Write spell data to spellData.json
// const writeToFile = async data => {
//   await fs.writeFile("spellData.json", data.spells, "utf8", function(err) {
//     if (err) {
//       return err;
//     }
//   });
//
//   console.log(`Wrote data for ${data.count} spells. Happy hunting.`);
// };
//
// myAsyncPipe(getSpellList, getSpellData, writeToFile)();
//
// // const doAllSpells = async () => {
// //   const spellList = await getSpellList();
// //   let allSpellData = [];
// //
// //   for await (const spell of spellList.results) {
// //     let spellData = await axios
// //       .get(spell.url)
// //       .then(res => res.data)
// //       .catch(err => {
// //         console.log(err);
// //       });
// //     allSpellData.push(spellData);
// //     console.log(allSpellData.length);
// //     console.clear();
// //   }
// //
// //   await writeToFile(JSON.stringify(allSpellData));
// //   console.log("Done.");
// // };
// //
