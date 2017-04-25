const generatorics = require("generatorics");
const jimp = require("jimp");
const path = require("path");
const program = require("commander");
const Promise = require("bluebird");

const cycle = (inputArray, shiftLength) => {
  const modularShiftLength = shiftLength % inputArray.length;
  return [
    ...inputArray.slice(modularShiftLength),
    ...inputArray.slice(0, modularShiftLength)
  ];
};

// TODO(andy): Maybe make these command-line arguments.
const template1Frame = {
  x: 69,
  y: 185,
  width: 556,
  height: 707
};
const template2Frame = {
  x: 646,
  y: 185,
  width: 556,
  height: 707
};
const labelPosition = {
  x: 70,
  dyFromBottom: 70
};

program
  .option("-t, --templatePath <templatePath>", "Template image path")
  .option(
    "-o, --outputPath <outputPath>",
    "Path to output differentiated images"
  )
  .option(
    "--shiftA <shiftA>",
    "Index length by which to shift the input array to choose the first other students' work for that student"
  )
  .option(
    "--shiftB <shiftB>",
    "Index length by which to shift the input array to choose the second other students' work for that student"
  )
  .arguments("<inputPaths...>")
  .parse(process.argv);

if (!program.outputPath) {
  console.log("An output path is required.");
  program.outputHelp();
  process.exit(1);
}

if (!program.shiftA) {
  console.log("A shiftA is required.");
  program.outputHelp();
  process.exit(1);
}

if (!program.shiftB) {
  console.log("A shiftB is required.");
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

  const shiftedInputsA = cycle(inputs, program.shiftA);
  const shiftedInputsB = cycle(inputs, program.shiftB);

  const font = await jimp.loadFont(jimp.FONT_SANS_16_BLACK);

  for (let index = 0; index < inputs.length; index++) {
    const targetName = inputs[index][0];
    const [nameA, imageA] = shiftedInputsA[index];
    const [nameB, imageB] = shiftedInputsB[index];

    const output = template.clone();
    const drawImage = (image, templateFrame) => {
      image.background(0xffffffff);
      image.contain(templateFrame.width, templateFrame.height);
      output.blit(image, templateFrame.x, templateFrame.y);
    };
    drawImage(imageA, template1Frame);
    drawImage(imageB, template2Frame);

    const templateName = program.templatePath[0]; // grabbing first letter of template file name, e.g.: r for rate, e for explain
    output.print(
      font,
      labelPosition.x,
      template.bitmap.height - labelPosition.dyFromBottom,
      targetName
    );

    const outputPath = path.join(
      program.outputPath,
      `${templateName}-${targetName}-${nameA}-${nameB}.jpg`
    );
    await Promise.promisify(output.write, {
      context: output
    })(outputPath);
    console.log(`Wrote ${outputPath}`);
  }
}

drawImages().then(() => {
  console.log("Done!");
  process.exit(0);
});
