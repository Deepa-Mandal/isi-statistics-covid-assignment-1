/**
 * ts-node process-data.ts <csv-file-name>
 *
 * Collect daily number of covid-19 infections and deaths from your home district using internet for
 * the period 01 September – 30 November 2020. Summarize this data through tables and graphs. Then,
 * compute mean, median and the quartiles and the deciles for the daily counts of both infections and
 * deaths based on your data. [Please collect, do this exercise and submit your datafile and a word file
 * containing your report by 10 January 2021]
 */

interface CSV {
  date: string;
  infections: string;
  deaths: string;
}

if (!process.argv[2]) {
  console.log('\nPlease pass the data csv file as first cli.\n');
  process.exit(1);
}

import { readFileSync } from 'fs-extra';
import { resolve } from 'path';

(async () => {
  const csvStr = await readFileSync(resolve(__dirname, process.argv[2]), {
    encoding: 'utf-8',
  });
  const csvRows = csvStr.split('\n');
  csvRows.shift(); // removing header row

  const processedData: {
    [dateStr: string]: { infections: number; deaths: number };
  } = {};

  csvRows.forEach((r) => {
    if (!r) return;

    const [date, _infections, _deaths] = r.split(',');
    processedData[date] = {
      infections: +_infections,
      deaths: +_deaths,
    };
  });

  const sortedInfections = Object.entries(processedData)
    .map((e) => e[1].infections)
    .sort((a, b) => {
      return a > b ? 1 : -1;
    });
  const sortedDeaths = Object.entries(processedData)
    .map((e) => e[1].deaths)
    .sort((a, b) => {
      return a > b ? 1 : -1;
    });

  /**
   * Compute Mean
   */
  {
    console.log(
      `\nMean for Infections is ${
        sortedInfections.reduce((p, c) => p + c, 0) / sortedInfections.length
      }`
    );
    console.log(
      `Mean for Deaths is ${
        sortedDeaths.reduce((p, c) => p + c, 0) / sortedInfections.length
      }\n`
    );
  }

  /**
   * Compute median
   */
  {
    console.log(
      `Median for Infections is ${
        sortedInfections.length % 2
          ? sortedInfections[(sortedInfections.length + 1) / 2]
          : (sortedInfections[sortedInfections.length] +
              sortedInfections[sortedInfections.length + 1]) /
            2
      }`
    );
    console.log(
      `Median for Infections is ${
        sortedDeaths.length % 2
          ? sortedDeaths[(sortedDeaths.length + 1) / 2]
          : (sortedDeaths[sortedDeaths.length / 2] +
              sortedDeaths[sortedDeaths.length / 2 + 1]) /
            2
      }\n`
    );
  }

  /**
   * Compute quartiles
   */
  {
    console.log(
      `Quartiles for Infections is ${calcParts(sortedInfections, 4).join(', ')}`
    );
    console.log(
      `Quartiles for Deaths is ${calcParts(sortedDeaths, 4).join(', ')}
      `
    );
  }

  /**
   * Compute Deciles
   */
  {
    console.log(
      `Deciles for Infections is ${calcParts(sortedInfections, 10).join(', ')}`
    );
    console.log(
      `Deciles for Deaths is ${calcParts(sortedDeaths, 10).join(', ')}
      `
    );
  }
})().catch(console.error);

function calcParts(arr: number[], parts: number): number[] {
  return Array(parts - 1)
    .fill(0)
    .map((_, i) => {
      const fractionalIndex = ((i + 1) * (arr.length - 1)) / parts + 0;
      return Number.isInteger(fractionalIndex)
        ? arr[fractionalIndex]
        : (arr[Math.floor(fractionalIndex)] + arr[Math.ceil(fractionalIndex)]) /
            2;
    });
}
