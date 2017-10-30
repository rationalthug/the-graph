// Standard functions for creating SVG/HTML elements
exports.createGroup = function(options, content) {
  var args = [options];

  if (Array.isArray(content)) {
    args = args.concat(content);
  }

  return DOM.g.apply(DOM.g, args);
};

exports.createRect = function(options) {
  return DOM.rect(options);
};

exports.createText = function(options) {
  return DOM.text(options);
};

exports.createCircle = function(options) {
  return DOM.circle(options);
};

exports.createPath = function(options) {
  return DOM.path(options);
};

exports.createPolygon = function(options) {
  return DOM.polygon(options);
};

exports.createImg = function(options) {
  return TheGraph.SVGImage(options);
};

exports.createCanvas = function(options) {
  return DOM.canvas(options);
};

exports.createSvg = function(options, content) {

  var args = [options];

  if (Array.isArray(content)) {
    args = args.concat(content);
  }

  return DOM.svg.apply(DOM.svg, args);
};
