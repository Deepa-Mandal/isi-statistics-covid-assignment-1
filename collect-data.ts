import axios from 'axios';
import { writeFile } from 'fs-extra';

const STATE = 'Maharashtra';
const DISTRICT = 'Mumbai';

const START_DATE = new Date('1 Sept 2020 00:00:00');
const END_DATE = new Date('30 Nov 2020 23:59:59');

const processedData: {
  [dateStr: string]: { infections: number; deaths: number };
} = {};

(async () => {
  /**
   * Urls taken from
   * https://api.covid19india.org
   */
  for (const url of [
    'https://api.covid19india.org/raw_data14.json',
    'https://api.covid19india.org/raw_data15.json',
    'https://api.covid19india.org/raw_data16.json',
    'https://api.covid19india.org/raw_data17.json',
    'https://api.covid19india.org/raw_data18.json',
    'https://api.covid19india.org/raw_data19.json',
    'https://api.covid19india.org/raw_data20.json',
  ]) {
    console.log(`\nDownloading data from URL ${url}...`);
    const {
      data: { raw_data },
    } = await axios.get<{ raw_data: PatientEntry[] }>(url);
    console.log(`Processing data...`);
    processEntries(raw_data);
    console.log(`Processing done!`);
  }

  // console.log(processedData);
  await writeFile(
    `data-${STATE}-${DISTRICT}.csv`,
    [
      'date,infections,deaths',
      ...Object.entries(processedData).map((d) =>
        [d[0], d[1].infections, d[1].deaths].join(',')
      ),
    ].join('\n')
  );
})().catch(console.error);

function processEntries(raw_data: PatientEntry[]) {
  raw_data.forEach((d) => {
    let _dateannounced = d.dateannounced;
    {
      const y = _dateannounced.split('/');
      [y[1], y[0]] = [y[0], y[1]];
      _dateannounced = y.join('/');
    }

    if (
      d.detectedstate === STATE &&
      d.detecteddistrict === DISTRICT &&
      START_DATE.getTime() <= new Date(_dateannounced).getTime() &&
      new Date(_dateannounced).getTime() <= END_DATE.getTime()
    ) {
      // console.log('hi', d.dateannounced, d.currentstatus);

      if (processedData[d.dateannounced] === undefined) {
        processedData[d.dateannounced] = {
          infections: 0,
          deaths: 0,
        };
      }

      if (d.currentstatus === 'Hospitalized') {
        processedData[d.dateannounced].infections += +d.numcases;
      }
      if (d.currentstatus === 'Deceased') {
        processedData[d.dateannounced].deaths += +d.numcases;
      }
    }
  });
}

interface PatientEntry {
  agebracket: string; // ''
  contractedfromwhichpatientsuspected: string; //'';
  currentstatus: 'Hospitalized' | 'Recovered' | 'Deceased'; // 'Hospitalized';
  dateannounced: string; // '22/08/2020';
  detectedcity: string; // '';
  detecteddistrict: string; // 'Adilabad';
  detectedstate: string; // 'Telangana';
  entryid: string; // '243239';
  gender: string; // '';
  nationality: string; // '';
  notes: string; // '';
  numcases: string; // '15';
  patientnumber: string; // '';
  source1: string; // 'https://t.me/indiacovid/14610';
  source2: string; // '';
  source3: string; // '';
  statecode: string; // 'TG';
  statepatientnumber: string; // '';
  statuschangedate: string; // '';
  typeoftransmission: string; // '';
}
