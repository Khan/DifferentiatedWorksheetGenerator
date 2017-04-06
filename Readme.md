# Generating difference-finding worksheets

This little script exists to help [Khan Academy Long-term Research](https://khanacademy.org/research) do paper prototyping around our ideas about fostering open-ended responses online. e.g. see [this blog post](http://klr.tumblr.com/post/158036182833/rich-tasks-crowdsourcing-data-for-more-rich-tasks).

## Usage

Put input images in `inputs/`, then run `run`:
```
./run
```

## Adding or replacing templates

Follow the example in `run`.

If you're changing the bounding boxes for the student work, you may have to change the constants at the top of `generate.js`.
