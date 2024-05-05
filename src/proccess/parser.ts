// import { read, utils } from "xlsx";

// export type Pattern = {
//   file: File;
//   splitterRegex: RegExp;
//   firstLookAhead: RegExp;
//   secondLookAhead: RegExp;
//   begin: string;
//   end: string;
// };

// export const getExcel = async (file: File) => {
//   const data = new Uint8Array(Buffer.from(await file.arrayBuffer()));
//   const workbook = read(data, { type: "array" });
//   const sheetName = workbook.SheetNames[0];
//   const sheet = workbook.Sheets[sheetName];
//   return utils
//     .sheet_to_json(sheet, { header: 1 })
//     .map((x: any) => x.map((y: any) => ({ value: y })));
// };

// const proccessSum = (raw: string, pat: Pattern) => {
//   const preproccessRaw = (raw: string) => {
//     const began = raw.indexOf(pat.begin);
//     const end = raw.indexOf(pat.end);
//     raw = raw.substring(began, end != -1 ? end : raw.length);
//   };

//   const sum = raw.match(pat.firstLookAhead);
//   const sections =
//     raw
//       .match(pat.secondLookAhead)
//       ?.map((x) => ({ section: x, index: raw.indexOf(x) })) ?? [];

//   const sumtext =
//     sections.length > 0 ? raw.substring(0, sections[0].index) : raw;

//   const roundRobin = (index: number) => {
//     let i = index;
//     let hold = false;
//     return () => {
//       if (i >= sections.length) {
//         i = 0;
//       }

//       hold = !hold;

//       return sections[hold ? i++ : i];
//     };
//   };

//   function* partition() {
//     const round = roundRobin(0);
//     for (let section of sections) {
//       yield {
//         eventId: `${sum} ${section.section.replace("\n", "")}`,
//         date: raw.substring(round().index, round().index).replaceAll("\n", ""),
//       };
//     }
//   }

//   if (sections) {
//     const json = Array.from(partition()).concat({
//       eventId: sum![0],
//       date: sumtext,
//     });
//     return json;
//   }
// };

// const proccessFile = (file: any, pat: Pattern) => {
//   const source = [];

//   for (let row of file) {
//     source.push(proccessSum(row, pat));
//   }

//   return source;
// };

// const save = (file: any) => {
//   return JSON.stringify(file);
// };

// export const proccess = async (pat: Pattern) => {
//   let { source } = { source: [] as any[] };

//   let data: Uint8Array | null = new Uint8Array(
//     Buffer.from(await pat.file.arrayBuffer())
//   );
//   const workbook = read(data, { type: "array" });
//   const sheetNames = workbook.SheetNames;

//   for (let sheetName of sheetNames) {
//     const sheet = workbook.Sheets[sheetName];
//     const rows = utils.sheet_to_json(sheet, { header: 1 });

//     const file = rows
//       .flat(1)
//       .filter((x) => typeof x == "string" && x.match(pat.firstLookAhead));

//     if (file.length > 0) {
//       source.push(...proccessFile(file, pat).flat(1));
//     }
//   }

//   data = null;

//   return source;
// };

const { read, utils } = require("xlsx");
const fs = require("fs");

class Pattern {
  file: File;
  splitterRegex: RegExp;
  firstLookAhead: RegExp;
  secondLookAhead: RegExp;
  begin: string;
  end: string;
}

export const getExcel = async (file) => {
  const data = new Uint8Array(Buffer.from(await file.arrayBuffer()));
  const workbook = read(data, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return utils
    .sheet_to_json(sheet, { header: 1 })
    .map((x) => x.map((y) => ({ value: y })));
};

const proccessSum = (raw, pat) => {
  const preproccessRaw = (raw) => {
    const began = raw.indexOf(pat.begin);
    const end = raw.indexOf(pat.end);
    raw = raw.substring(began, end != -1 ? end : raw.length);
  };

  const sum = raw.match(pat.firstLookAhead);
  const sections =
    raw
      .match(pat.secondLookAhead)
      ?.map((x) => ({ section: x, index: raw.indexOf(x) })) ?? [];

  const sumtext =
    sections.length > 0 ? raw.substring(0, sections[0].index) : raw;

  const roundRobin = (index) => {
    let i = index;
    let hold = false;
    return () => {
      if (i >= sections.length) {
        i = 0;
      }

      hold = !hold;

      return sections[hold ? i++ : i];
    };
  };

  function* partition() {
    const round = roundRobin(0);
    for (let section of sections) {
      yield {
        eventId: `${sum} ${section.section.replace("\n", "")}`,
        date: raw.substring(round().index, round().index).replaceAll("\n", ""),
      };
    }
  }

  if (sections) {
    const json = Array.from(partition()).concat({
      eventId: sum[0],
      date: sumtext,
    });
    return json;
  }
};

const proccessFile = (f, pat) => {
  const source = [] as any[];

  for (let row of f) {
    source.push(proccessSum(row, pat));
  }

  return source;
};

const save = (f) => {
  fs.writeFileSync(
    "C://Personal/scripts/node/parser-excel/output.json",
    JSON.stringify(f)
  );
};

export const proccess = async (pat) => {
  let { source } = { source: [] as any[] };

  let data = new Uint8Array(Buffer.from(pat.file));
  const workbook = read(data, { type: "array" });
  const sheetNames = workbook.SheetNames;

  for (let sheetName of sheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = utils.sheet_to_json(sheet, { header: 1 });

    const file = rows
      .flat(1)
      .filter((x) => typeof x == "string" && x.match(pat.firstLookAhead));

    if (file.length > 0) {
      source.push(...proccessFile(file, pat).flat(1));
    }
  }

  data = null as unknown as Uint8Array;
  return source;
};
