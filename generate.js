const generatorics = require("generatorics");
const jimp = require("jimp");
const path = require("path");
const program = require("commander");
const Promise = require("bluebird");

// TODO(andy): Maybe make these command-line arguments.
const template1Frame = { x: 69, y: 185, width: 556, height: 707 };
const template2Frame = { x: 646, y: 185, width: 556, height: 707 };

program
  .option("-t, --templatePath <templatePath>", "Template image path")
  .option(
    "-o, --outputPath <outputPath>",
    "Path to output differentiated images"
  )
  .arguments("<inputPaths...>")
  .parse(process.argv);

if (!program.outputPath) {
  console.log("An output path is required.");
  program.outputHelp();
  process.exit(1);
}

if (!program.templatePath) {
  console.log("A template path is required.");
  program.outputHelp();
  process.exit(1);
}

if (!program.args.length) {
  program.outputHelp();
  process.exit(1);
}

async function drawImages() {
  const template = await jimp.read(program.templatePath);
  const inputs = [];
  for (let inputPath of program.args) {
    const image = await jimp.read(inputPath);
    inputs.push([path.parse(inputPath).name, image]);
  }
  const inputCombinations = generatorics.combination(inputs, 2);

  for (let [[nameA, imageA], [nameB, imageB]] of inputCombinations) {
    const output = template.clone();
    const drawImage = (image, templateFrame) => {
      image.background(0xffffffff);
      image.contain(templateFrame.width, templateFrame.height);
      output.blit(image, templateFrame.x, templateFrame.y);
    };
    drawImage(imageA, template1Frame);
    drawImage(imageB, template2Frame);
    var templateName = program.templatePath[0]; // grabbing first letter of template file name, e.g.: r for rate, e for explain
    const outputPath = path.join(
      program.outputPath,
      `${templateName}-${nameA}-${nameB}.jpg`
    );
    await Promise.promisify(output.write, { context: output })(outputPath);
    console.log(`Wrote ${outputPath}`);
  }
}

drawImages().then(() => {
  console.log("Done!");
  process.exit(0);
});
