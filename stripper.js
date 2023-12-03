const fs = require('fs');
const devices = require('puppeteer/DeviceDescriptors');
const puppeteer = require('puppeteer');
const util = require('util');


let chromeDebugUrl = process.argv[2];
let parseUrls = [];

for (var i = 3; i < process.argv.length; i++) {
  parseUrls.push(process.argv[i]);
}


let browser = null;
let page = null;
let css_coverage = null;

let final_css_bytes = '';
let total_bytes = 0;
let used_bytes = 0;
var media_ranges = [];
var scanned_ranged = [];

const openUrlInBrowser = async (url, viewport = null, cssCoverage = null) => {

  browser = await puppeteer.connect({
    browserWSEndpoint: chromeDebugUrl,
    defaultViewport: null
  });

  page = await browser.newPage();

  if (viewport) {
    await page.setViewport(viewport);
  }

  if (cssCoverage) {
    await page.coverage.startCSSCoverage();
  }

  await page.goto(url);
};


const getCodeCoverage = async (url, viewport = null) => {

  await openUrlInBrowser(url, viewport, true);

  console.log("Press any key to continue...");

  var fs = require("fs")
  var fd = fs.openSync("/dev/stdin", "rs")
  fs.readSync(fd, new Buffer(1), 0, 1)
  fs.closeSync(fd)

  css_coverage = await page.coverage.stopCSSCoverage();
  await page.close();
  return css_coverage;
};


function getIndicesOf(searchStr, str, caseSensitive) {
  var searchStrLen = searchStr.length;
  if (searchStrLen == 0) {
    return [];
  }
  var startIndex = 0, index, indices = [];
  if (!caseSensitive) {
    str = str.toLowerCase();
    searchStr = searchStr.toLowerCase();
  }
  while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    indices.push(index);
    startIndex = index + searchStrLen;
  }
  return indices;
}


const scanCoverage = (css_coverage) => {

  for (const entry of css_coverage) {
    total_bytes += entry.text.length;

    var indices = getIndicesOf("@media", entry.text);

    for (var i = 0; i < indices.length; i++) {

      closing_bracket = 0;
      opening_bracket = 0;

      opening_index = indices[i];
      closing_index = 0;

      for (var j = indices[i]; j < entry.text.length; j++) {
        if (entry.text[j] == "{") {
          opening_bracket = opening_bracket + 1;
        }
        else if (entry.text[j] == "}") {
          closing_bracket = closing_bracket + 1;
        }

        if ((opening_bracket == closing_bracket) && (opening_bracket > 0 && closing_bracket > 0)) {
          closing_index = j;
          break;
        }
      }

      media_ranges.push({ "start": opening_index, "end": closing_index });

    }

    for (const range of entry.ranges) {

      media_range = false;

      scanned_range = false;

      used_bytes += range.end - range.start - 1;

      for (var i = 0; i < scanned_ranged.length; i++) {
        if (range.start >= scanned_ranged[i].start && range.end <= scanned_ranged[i].end) {
          scanned_range = true;
        }
      }

      if (scanned_range == true) {
        continue;
      }

      scanned_ranged.push({ start: range.start, end: range.end });

      for (var i = 0; i < media_ranges.length; i++) {
        if (range.start >= media_ranges[i].start && range.end <= media_ranges[i].end) {
          if (typeof media_ranges[i].written == "undefined") {
            final_css_bytes += entry.text.slice(media_ranges[i].start, media_ranges[i].end + 1) + "\n";
            media_ranges[i].written = true;
          }
          media_range = true;
          break;
        }
        else {
          media_range = false;
        }
      }

      if (media_range == false) {
        final_css_bytes += entry.text.slice(range.start, range.end) + '\n';
      }
    }
  }

}


const main = async () => {

  for (var x = 0; x < parseUrls.length; x++) {
    var coverage = await getCodeCoverage(parseUrls[x], null);
    await scanCoverage(coverage);
  }


  fs.writeFile('./final_css.css', final_css_bytes, error => {
    if (error) {
      console.log('Error creating file:', error);
    } else {
      console.log('File saved');
    }
  });

};

main();