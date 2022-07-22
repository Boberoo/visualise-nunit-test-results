const ALL_TESTS = ['test-run', 'test-suite', 'test-case'];

function parseXmlToTreeView(
    xml,
    arrayTags,
    showDuration = true,
    showCount = false,
    showAsserts = false,
    showAvgTime = false) {
    let dom = null;
    let totalTime = null;
    let totalCount = null;
    let totalAsserts = null;
    if (window.DOMParser) dom = (new DOMParser()).parseFromString(xml, "text/xml");
    else if (window.ActiveXObject) {
        dom = new ActiveXObject('Microsoft.XMLDOM');
        dom.async = false;
        if (!dom.loadXML(xml)) throw dom.parseError.reason + " " + dom.parseError.srcText;
    }
    else throw new Error("cannot parse xml string!");

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

            durationBar = '<div class="bar-duration" style="width: '+percentOfTotalTime+'%">'+xmlNode.attributes["duration"].value+'</div>';
        }

        let countBar = '';
        if (showCount && xmlNode.attributes && xmlNode.attributes["testcasecount"]) {
            let count = parseFloat(xmlNode.attributes["testcasecount"].value);

            if (!totalCount) totalCount = count;
            let percentOfTotalCount = (count / totalCount * 100);

            countBar = '<div class="bar-count" style="width: '+percentOfTotalCount+'%">'+xmlNode.attributes["testcasecount"].value+'</div>';
        }

        let assertsBar = '';
        if (showAsserts && xmlNode.attributes && xmlNode.attributes["asserts"]) {
            let count = parseFloat(xmlNode.attributes["asserts"].value);

            if (!totalAsserts) totalAsserts = count;
            let percentOfTotalAsserts = (count / totalAsserts * 100);

            assertsBar = '<div class="bar-count-asserts" style="width: '+percentOfTotalAsserts+'%">'+xmlNode.attributes["asserts"].value+'</div>';
        }

        result.str += xmlNode.nodeName + ': ' + (xmlNode.attributes && xmlNode.attributes["name"] ? xmlNode.attributes["name"].value : '')
        result.str += durationBar + countBar + assertsBar+  '</span>';

        /*if (xmlNode.attributes) {
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