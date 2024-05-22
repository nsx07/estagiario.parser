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
  console.log(sum, sections);

  const roundRobin = (i) => {
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
      let [x, y] = [round().index, round().index];
      if (y == roundRobin(0)().index) {
        y = raw.length;
      }

      yield {
        eventId: `${sum} ${section.section} ${pat.aux ?? ""}`
          .replace("\n", "")
          .replace("-", "")
          .replace(/\s{2,}/, " "),
        date: raw.substring(x, y).replaceAll("\n", ""),
      };
    }
  }

  if (sections) {
    const json = Array.from(partition()).concat({
      eventId: sum ? `${sum[0]} ${pat.aux}` : "#ERROR#",
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
  fs.writeFileSync("output.json", JSON.stringify(f));
};

export const proccess = async (pat) => {
  let { source } = { source: [] as any[] };

  if (typeof pat.file == "string") {
    const data = pat.file;
    const parts = data
      .split(pat.begin)
      .filter(Boolean)
      .map((x) => pat.begin + x);
    source = proccessFile(parts, pat).flat(1);
  } else {
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
  }

  return source;
};
