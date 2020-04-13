import React, { Component } from "react";
import PropTypes from "prop-types";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Card from "@material-ui/core/Card";
import FormControlLabel from "@material-ui/core/FormControlLabel";

const propTypes = {
  text: PropTypes.string.isRequired,
  customClass: PropTypes.string,
  selectionHandler: PropTypes.func
};

/**
 * Highlighter component.
 *
 * Allows highlighting of the text selected by mouse with given custom class (or default)
 * and calls optional callback function with the following selection details:
 * - selected text
 * - selection start index
 * - selection end index
 */
export class HighLighter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: props.text,
      isDirty: false,
      selection: "",
      selCollection: "",
      anchorNode: "?",
      focusNode: "?",
      selectionStart: "?",
      selectionEnd: "?",
      first: props.text,
      middle: "",
      last: "",
      selectedClass: "a",
      selectionArray: [{ middle: "", selectionStart: 0, selectionEnd: 0 }],
      classArray: [
        { middle: "", selectionStart: 0, selectionEnd: 0, className: "green" }
      ]
    };
    this.onMouseUpHandler = this.onMouseUpHandler.bind(this);
  }

  range(start, end) {
    var ans = [];
    for (let i = start; i <= end; i++) {
      ans.push(i);
    }
    return ans;
  }

  getContiguousBlocks(inpArray, classAsignment) {
    var outputArray = [];
    var lastFirstInd = 0;
    var textSlice = "";
    var textchunk;
    var textlength = this.state.text.length;

    if (inpArray[lastFirstInd] > 0) {
      textSlice = this.state.text.slice(0, inpArray[lastFirstInd]);
      textchunk = {
        range: this.range(0, inpArray[lastFirstInd]),
        text: textSlice,
        html: <span className="noClass">{textSlice}</span>,
        class: "noClass"
      };
      outputArray.push(textchunk);
    }

    for (let i = 0; i <= inpArray.length; i++) {
      if (i === inpArray.length - 1 || inpArray[i + 1] - inpArray[i] > 1) {
        textSlice = this.state.text.slice(inpArray[lastFirstInd], inpArray[i]);
        textchunk = {
          range: this.range(inpArray[lastFirstInd], inpArray[i]),
          text: textSlice,
          html: <span className="highlight">{textSlice}</span>,
          class: "highlight"
        };

        outputArray.push(textchunk);
        lastFirstInd = i;
      }
    }

    console.log("textlength: ", textlength);
    console.log("inpArray length: ", inpArray.length);
    console.log("lastFirstInd: ", lastFirstInd);
    console.log("inpArray[lastFirstInd]: ", inpArray[lastFirstInd - 1]);

    if (inpArray[lastFirstInd - 1] < textlength) {
      textSlice = this.state.text.slice(inpArray[lastFirstInd], textlength);
      console.log("last textSlice ", textSlice);

      textchunk = {
        range: this.range(inpArray[lastFirstInd], textlength),
        text: textSlice,
        html: <span className="noClass">{textSlice}</span>,
        class: "noClass"
      };
      outputArray.push(textchunk);
    }

    return outputArray;
  }

  getUniqueSet(arrayObject) {
    var completeArray = [];
    for (var i = 1; i < arrayObject.length; i++) {
      const N = arrayObject[i].selectionEnd;
      const Nmin = arrayObject[i].selectionStart;
      const tempSeq = this.range(Nmin, N);
      completeArray.push(tempSeq);
    }
    completeArray = Array.from(new Set(completeArray.flat())).sort();
    var contigArray = this.getContiguousBlocks(completeArray);
    console.log("completeArray: ", completeArray);
    console.log("contigArray: ", contigArray);
  }

  onMouseUpHandler(e) {
    e.preventDefault();
    const selectionObj = window.getSelection && window.getSelection();
    const selection = selectionObj.toString();
    const anchorNode = selectionObj.anchorNode;
    const focusNode = selectionObj.focusNode;
    const anchorOffset = selectionObj.anchorOffset;
    const focusOffset = selectionObj.focusOffset;
    const position = anchorNode.compareDocumentPosition(focusNode);
    let forward = false;

    if (position === anchorNode.DOCUMENT_POSITION_FOLLOWING) {
      forward = true;
    } else if (position === 0) {
      forward = focusOffset - anchorOffset > 0;
    }

    let selectionStart = forward ? anchorOffset : focusOffset;

    if (forward) {
      if (
        anchorNode.parentNode.getAttribute("data-order") &&
        anchorNode.parentNode.getAttribute("data-order") === "middle"
      ) {
        selectionStart += this.state.selectionStart;
      }
      if (
        anchorNode.parentNode.getAttribute("data-order") &&
        anchorNode.parentNode.getAttribute("data-order") === "last"
      ) {
        selectionStart += this.state.selectionEnd;
      }
    } else {
      if (
        focusNode.parentNode.getAttribute("data-order") &&
        focusNode.parentNode.getAttribute("data-order") === "middle"
      ) {
        selectionStart += this.state.selectionStart;
      }
      if (
        focusNode.parentNode.getAttribute("data-order") &&
        focusNode.parentNode.getAttribute("data-order") === "last"
      ) {
        selectionStart += this.state.selectionEnd;
      }
    }

    const selectionEnd = selectionStart + selection.length;
    const first = this.state.text.slice(0, selectionStart);
    const middle = this.state.text.slice(selectionStart, selectionEnd);
    const last = this.state.text.slice(selectionEnd);

    const newinfo = {
      middle: middle,
      selectionStart: selectionStart,
      selectionEnd: selectionEnd
    };
    //const oldinfo = this.state.selectionArray;
    this.state.selectionArray.push(newinfo);
    this.getUniqueSet(this.state.selectionArray);
    // const joinedinfo = oldinfo.push(newinfo);

    // console.log(' newinfo ', oldinfo)
    // console.log(' newinfo ', newinfo)
    // console.log(' joinedinfo ', joinedinfo)
    // console.log(' oldinfo.push(newinfo) ', oldinfo.push(newinfo))
    //const newArray = this.state.selectionArray.concat(middle);

    this.setState({
      selection: selection,
      anchorNode: anchorNode,
      focusNode: focusNode,
      selectionStart,
      selectionEnd,
      first,
      middle,
      last
    });

    if (this.props.selectionHandler) {
      this.props.selectionHandler({
        selection,
        selectionStart,
        selectionEnd
      });
    }
  }

  handleChange = event => {
    this.setState({
      selectedClass: event.target.value
    });
  };

  render() {
    console.log(" pre render selection 1: ", this.state.selection);

    console.log(" pre render selection 2: ", this.state.selection);
    console.log(" first 2: ", this.state.first);
    console.log(" middle 2: ", this.state.middle);
    console.log(" last 2: ", this.state.last);
    console.log(" selectionArray: ", this.state.selectionArray);
    return (
      <Card>
        <RadioGroup
          aria-label="gender"
          name="gender1"
          value={this.state.selectedClass}
          onChange={this.handleChange}
        >
          <FormControlLabel
            value="das Subjekt"
            control={<Radio />}
            label="das Subjekt"
          />
          <FormControlLabel
            value="das Prädikat"
            control={<Radio />}
            label="das Prädikat"
          />
          <FormControlLabel
            value="das Objekt"
            control={<Radio />}
            label="das Objekt"
          />
          <FormControlLabel
            value="adverbiale Bestimmung"
            control={<Radio />}
            label="adverbiale Bestimmung"
          />
          <FormControlLabel
            value="das Prädikativ"
            control={<Radio />}
            label="das Prädikativ"
          />
        </RadioGroup>
        <span onMouseUp={this.onMouseUpHandler}>
          <span data-order="first">{this.state.first}</span>
          <span
            data-order="middle"
            className={this.props.customClass || "default"}
          >
            {this.state.middle}
          </span>
          <span data-order="last">{this.state.last}</span>
        </span>
      </Card>
    );
  }
}

HighLighter.propTypes = propTypes;
