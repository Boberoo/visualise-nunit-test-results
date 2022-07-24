const ALL_TESTS = ['test-run', 'test-suite', 'test-case'];

function CreateDomParser(xml) {
    if (window.DOMParser) {
        return (new DOMParser()).parseFromString(xml, "text/xml");
    }
    else if (window.ActiveXObject) {
        let dom = new ActiveXObject('Microsoft.XMLDOM');
        dom.async = false;
        if (!dom.loadXML(xml)) {
            throw dom.parseError.reason + " " + dom.parseError.srcText;
        }
        return dom;
    } else {
        throw new Error("cannot parse xml string!");
    }
}

function calcMaxAvg(
    dom,
    arrayTags) {

    function parseNode(xmlNode, result) {

        if (arrayTags && arrayTags.indexOf(xmlNode.nodeName) === -1) {
            return;
        }

        if (xmlNode.nodeName === "#text") {

            return;
        }

        if (xmlNode.attributes && xmlNode.attributes["duration"] && xmlNode.attributes["testcasecount"]) {
            let duration = parseFloat(xmlNode.attributes["duration"].value)* 1000;
            let count = parseFloat(xmlNode.attributes["testcasecount"].value);
            if (count) {
                let avg = duration / count;
                if (avg > result.maxAvg) {
                    result.maxAvg = avg;
                }
            }
        }
        for (let node of xmlNode.childNodes) parseNode(node, result);
    }

    let result = { maxAvg: 0.0 };
    for (let node of dom.childNodes) {
        parseNode(node, result);
    }
    console.log(result.maxAvg);
    return result.maxAvg;
}

function parseXmlToTreeView(
    xml,
    arrayTags,
    showDuration = true,
    showCount = false,
    showAsserts = false,
    showAvgTime = false) {
    let totalTime = null;
    let totalCount = null;
    let totalAsserts = null;
    let maxAvg = null;

    let dom = CreateDomParser(xml);

    if (showAvgTime) {
        maxAvg = calcMaxAvg(
            dom,
            arrayTags);
    }

    function parseNode(xmlNode, result) {

        if (arrayTags && arrayTags.indexOf(xmlNode.nodeName) === -1) {
            return;
        }

        result.str += '<li><span class="caret">';
        if (xmlNode.nodeName === "#text") {
            let v = xmlNode.nodeValue;
            if (v.trim()) result.str += v;
            result.str += '</span></li>';
            return;
        }

        let durationBar = '';
        if (showDuration && xmlNode.attributes && xmlNode.attributes["duration"]) {
            let duration = parseFloat(xmlNode.attributes["duration"].value);

            if (!totalTime) totalTime = duration;
            let percentOfTotalTime = (duration / totalTime * 100);

            durationBar = '<div class="bar bar-duration" style="width: '+percentOfTotalTime+'%">'+xmlNode.attributes["duration"].value+'</div>';
        }

        let countBar = '';
        if (showCount && xmlNode.attributes && xmlNode.attributes["testcasecount"]) {
            let count = parseFloat(xmlNode.attributes["testcasecount"].value);

            if (!totalCount) totalCount = count;
            let percentOfTotalCount = (count / totalCount * 100);

            countBar = '<div class="bar bar-count" style="width: '+percentOfTotalCount+'%">'+xmlNode.attributes["testcasecount"].value+'</div>';
        }

        let assertsBar = '';
        if (showAsserts && xmlNode.attributes && xmlNode.attributes["asserts"] && xmlNode.attributes["duration"]) {
            let count = parseFloat(xmlNode.attributes["asserts"].value);

            if (!totalAsserts) totalAsserts = count;
            let percentOfTotalAsserts = (count / totalAsserts * 100);

            assertsBar = '<div class="bar bar-avg" style="width: ' + percentOfTotalAsserts + '%">' + xmlNode.attributes["asserts"].value + '</div>';
        }

        let avgBar = '';
        if (showAvgTime && xmlNode.attributes && xmlNode.attributes["testcasecount"] && xmlNode.attributes["duration"]) {

            let count = parseFloat(xmlNode.attributes["testcasecount"].value);
            let milliseconds = parseFloat(xmlNode.attributes["duration"].value) * 1000;
            if (count) {
                let avg = milliseconds / count;
                let percentOfMaxAvg = (avg / maxAvg * 100);
                avgBar = '<div class="bar-avg" style="width: ' + percentOfMaxAvg + '%">' + avg.toFixed(1)+ 'ms</div>';
            }
        }

        result.str += xmlNode.nodeName + ': ' + (xmlNode.attributes && xmlNode.attributes["name"] ? xmlNode.attributes["name"].value : '')
        result.str += durationBar + countBar + assertsBar + avgBar + '</span>';

        /*DEBUG if (xmlNode.attributes) {
          for (let attribute of xmlNode.attributes) {
            result.str += "<br/>" + attribute.nodeName + ": " + attribute.nodeValue;
          }
        }*/

        result.str += '<ul class="nested">';
        for (let node of xmlNode.childNodes) parseNode(node, result);
        result.str += '</ul></li>';
    }

    let result = { str: '<ul>' };
    for (let node of dom.childNodes) parseNode(node, result);
    result.str += '</ul>';

    if (result.str === "<ul></ul>") {
        return "";
    }
    return result.str;
}

function linkToggleToTreeView() {
    let toggler = document.getElementsByClassName("caret");

    for (let i = 0; i < toggler.length; i++) {
        toggler[i].addEventListener("click", function() {
            this.parentElement.querySelector(".nested").classList.toggle("active");
            this.classList.toggle("caret-down");
        });
    }
}

function expandAll() {
    let carets = document.getElementsByClassName("caret");

    for (let caret of carets) {
        caret.parentElement.querySelector(".nested").classList.add("active");
        caret.classList.add("caret-down");
    }
}