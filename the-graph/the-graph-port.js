var TooltipMixin = require('./mixins').Tooltip;
var arcs = require('./arcs.js');

module.exports.register = function (context) {

  var TheGraph = context.TheGraph;

  // Initialize configuration for the Port view.
  TheGraph.config.port = {
    container: {
      className: "port arrow"
    },
    backgroundCircle: {
      className: "port-circle-bg"
    },
    arc: {
      className: "port-arc",
      ref: "portArc"
    },
    innerCircle: {
      ref: "circleSmall"
    },
    text: {
      ref: "label",
      className: "port-label drag"
    }
  };

  TheGraph.factories.port = {
    createPortGroup: TheGraph.factories.createGroup,
    createPortBackgroundCircle: TheGraph.factories.createCircle,
    createPortArc: TheGraph.factories.createPath,
    createPortInnerCircle: TheGraph.factories.createCircle,
    createPortLabelText: TheGraph.factories.createText
  };

  // Port view

  TheGraph.Port = React.createFactory( createReactClass({
    displayName: "TheGraphPort",
    mixins: [
      TooltipMixin
    ],
    getDefaultProps () {
      return {
        allowEdgeStart: true
      }
    },
    componentDidMount: function () {
      var domNode = ReactDOM.findDOMNode(this);

      // Preview edge start
      this.refs.circleSmall.addEventListener("tap", this.edgeStart);
      this.refs.circleSmall.addEventListener("panstart", this.edgeStart);
      this.refs.portArc.addEventListener("tap", this.edgeStart);
      this.refs.portArc.addEventListener("panstart", this.edgeStart);
      // Make edge
      this.refs.circleSmall.addEventListener("panend", this.triggerDropOnTarget);
      this.refs.portArc.addEventListener("panend", this.triggerDropOnTarget);


      domNode.addEventListener("the-graph-edge-drop", this.edgeStart);

      // Show context menu
      if (this.props.showContext) {
        domNode.addEventListener("contextmenu", this.showContext);
        domNode.addEventListener("press", this.showContext);
      }
    },
    getTooltipTrigger: function () {
      return ReactDOM.findDOMNode(this);
    },
    shouldShowTooltip: function () {
      return (
        this.props.app.state.scale < TheGraph.zbpBig ||
        this.props.label.length > 8
      );
    },
    showContext: function (event) {
      // Don't show port menu on export node port
      if (this.props.isExport) {
        return;
      }
      // Click on label, pass context menu to node
      if (event && (event.target === ReactDOM.findDOMNode(this.refs.label))) {
        return;
      }
      // Don't show native context menu
      event.preventDefault();

      // Don't tap graph on hold event
      if (event.stopPropagation) { event.stopPropagation(); }
      if (event.preventTap) { event.preventTap(); }

      // Get mouse position
      if (event.gesture) {
        event = event.gesture.srcEvent; // unpack hammer.js gesture event
      }
      var x = event.x || event.clientX || 0;
      var y = event.y || event.clientY || 0;
      if (event.touches && event.touches.length) {
        x = event.touches[0].clientX;
        y = event.touches[0].clientY;
      }

      // App.showContext
      this.props.showContext({
        element: this,
        type: (this.props.isIn ? "nodeInport" : "nodeOutport"),
        x: x,
        y: y,
        graph: this.props.graph,
        itemKey: this.props.label,
        item: this.props.port
      });
    },
    getContext: function (menu, options, hide) {
      return TheGraph.Menu({
        menu: menu,
        options: options,
        label: this.props.label,
        triggerHideContext: hide
      });
    },
    edgeStart: function (event) {
      // Don't start edge on export node port
      if (this.props.isExport) {
        return;
      }
      if (!this.props.allowEdgeStart) {
        return;
      }

      // Click on label, allow node context menu
      if (event && (event.target === ReactDOM.findDOMNode(this.refs.label))) {
        return;
      }
      // Don't tap graph
      if (event.stopPropagation) { event.stopPropagation(); }

      var detail = {
        isIn: this.props.isIn,
        port: this.props.port,
        // process: this.props.processKey,
        route: this.props.route,
      }

      if (event.gesture && event.gesture.center) {
        detail.x = event.gesture.center.x;
        detail.y = event.gesture.center.y;
      }

      var edgeStartEvent = new CustomEvent('the-graph-edge-start', {
        detail: detail,
        bubbles: true
      });
      ReactDOM.findDOMNode(this).dispatchEvent(edgeStartEvent);
    },
    triggerDropOnTarget: function (event) {
      // If dropped on a child element will bubble up to port
      // FIXME: broken, is never set, neither on event.srcEvent
      if (!event.relatedTarget) { return; }
      var dropEvent = new CustomEvent('the-graph-edge-drop', {
        detail: null,
        bubbles: true
      });
      event.relatedTarget.dispatchEvent(dropEvent);
    },
    render: function() {
      var label = this.props.label
      if (label.length > 12) {
        label = label.substring(0, 12) + '...'
      }
      var r = 4;
      // Highlight matching ports
      var highlightPort = this.props.highlightPort;
      var inArc = arcs.inport;
      var outArc = arcs.outport;
      if (highlightPort && highlightPort.isIn === this.props.isIn && (highlightPort.type === this.props.port.type || this.props.port.type === 'any')) {
        r = 5;
        inArc = arcs.inportBig;
        outArc = arcs.outportBig;
      }

      var backgroundCircleOptions = TheGraph.merge(TheGraph.config.port.backgroundCircle, { r: r + 1 });
      var backgroundCircle = TheGraph.factories.port.createPortBackgroundCircle.call(this, backgroundCircleOptions);

      var arcOptions = TheGraph.merge(TheGraph.config.port.arc, { d: (this.props.isIn ? inArc : outArc) });
      var arc = TheGraph.factories.port.createPortArc.call(this, arcOptions);

      var innerCircleOptions = {
        className: "port-circle-small stroke route"+ (this.props.route || '0') + (this.props.isConnected ? ' fill' : ' empty-fill'),
        r: r - 1.5
      };

      innerCircleOptions = TheGraph.merge(TheGraph.config.port.innerCircle, innerCircleOptions);
      var innerCircle = TheGraph.factories.port.createPortInnerCircle.call(this, innerCircleOptions);

      var labelTextOptions = {
        x: (this.props.isIn ? 5 : -5),
        children: label
      };
      labelTextOptions = TheGraph.merge(TheGraph.config.port.text, labelTextOptions);
      var labelText = TheGraph.factories.port.createPortLabelText.call(this, labelTextOptions);

      var portContents = [
        backgroundCircle,
        arc,
        innerCircle,
        labelText
      ];

      var containerOptions = TheGraph.merge(TheGraph.config.port.container, { title: this.props.label, transform: "translate("+this.props.x+","+this.props.y+")" });
      return TheGraph.factories.port.createPortGroup.call(this, containerOptions, portContents);

    }
  }));


};
