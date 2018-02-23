const uuidv4 = require('uuid/v4')

// Standard functions for creating SVG/HTML elements
const usedKeys = {}
exports.createGroup = function(options, content) {
  var args = [options]

  if (options.children) {
    options.children = React.Children.map(options.children, (child) => {
      let gKey
      if (!usedKeys[child.key]) {
        usedKeys[child.key] = 1
        gKey = child.key
      }
      else {
        gKey = child.key + "-" + usedKeys[child.key]
        usedKeys[child.key] = usedKeys[child.key] + 1
      }
      const newGProps = Object.keys(child.props).reduce((props, p) => {
        if (p !== 'key') {
          props[p] = child.props[p]
        }
        else {
          props[p] = gKey
        }
        return props
      }, {})
      return React.cloneElement(child, newGProps)
    })
  }

  if (Array.isArray(content)) {
    content = content.map((child) => {
      let cKey
      if (!child.key) {
        cKey = uuidv4()
      }
      else if (!usedKeys[child.key]) {
        usedKeys[child.key] = 1
        cKey = child.key
      }
      else {
        cKey = child.key + "-" + usedKeys[child.key]
        usedKeys[child.key] = usedKeys[child.key] + 1
      }
      const newCProps = Object.keys(child.props).reduce((props, p) => {
        if (p !== 'key') {
          props[p] = child.props[p]
        }
        else {
          props[p] = cKey
        }
        return props
      }, {})
      return React.cloneElement(child, newCProps)
    })
  }


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
