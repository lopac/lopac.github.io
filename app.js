/// <reference path="../Calc/Scripts/typings/jquery/jquery.ts" />
/// <reference path="../Calc/Scripts/typings/highcharts/highcharts.d.ts" />
var CalcTable = (function () {
    function CalcTable() {
        this.initialized = false;
        this.table = document.getElementById("tablicaBody");
    }
    CalcTable.prototype.initialize = function (tCount) {
        if (isNaN(tCount) || typeof tCount === "undefined" || tCount === 0) {
            this.showWarning();
            return;
        }
        this.count = tCount;
        this.initialized = true;
        for (var i = this.count; i >= 1; i--) {
            var row = this.table.insertRow(0);
            var cell = row.insertCell(0);
            cell.innerHTML = i.toString();
            var cell2 = row.insertCell(1);
            cell2.innerHTML = this.monthName(i);
            var cell3 = row.insertCell(2);
            cell3.innerHTML = "<div class='form-group'><input type='text' id='raz" + i + "'  class='form-control' placeholder='Unesi potra\u017Enju..'></div>";
        }
    };
    CalcTable.prototype.showWarning = function () {
        $("#warning").fadeIn().delay(1500).fadeOut();
    };
    CalcTable.prototype.movingAverage = function (n) {
        var values = [];
        var results = [];
        if (isNaN(n) || typeof n === "undefined" || n === 0) {
            this.showWarning();
            return;
        }
        for (var i = 0; i < this.count; i++) {
            var num;
            try {
                num = Number($("#raz" + (i + 1)).val());
                console.log(num);
                if (isNaN(num) || typeof num === "undefined" || num === 0) {
                    this.showWarning();
                    return;
                }
            }
            catch (e) {
            }
            values.push(parseFloat(num.toFixed(2)));
        }
        var l = (this.count - n) + 1;
        for (var i = 0; i < l; i++) {
            var result = 0;
            var ni = (Number(n) + Number(i));
            for (var j = i; j < ni; j++) {
                result += Number(values[j]);
            }
            var temp = Number(result) / Number(n);
            results.push(parseFloat(temp.toFixed(2)));
        }
        var labels = [];
        for (var i = 0; i < this.count; i++) {
            labels.push(this.monthName(Number(i + 1)));
        }
        for (var i = 0; i < values.length; i++) {
            console.log(values[i]);
        }
        $("#tablica").empty();
        $("#tablica").append("<br/><br/><div id='graphChart' style='min- width: 310px; height: 400px; margin: 0 auto'></div>");
        var graphChart = $("#graphChart");
        var a = new Highcharts.Chart({
            chart: {
                renderTo: graphChart[0]
            },
            title: {
                text: "Pomična aritmetička sredina",
                x: -20
            },
            subtitle: {
                text: "",
                x: -20
            },
            xAxis: {
                categories: labels
            },
            yAxis: {
                title: {
                    text: "Potražnja"
                },
                plotLines: [
                    {
                        value: 0,
                        width: 1,
                        color: "#808080"
                    }
                ]
            },
            tooltip: {
                valueSuffix: ""
            },
            legend: {
                layout: "vertical",
                align: "right",
                verticalAlign: "middle",
                borderWidth: 0
            },
            series: [
                {
                    name: "Potražnja",
                    data: values
                },
                {
                    name: "Predviđanje",
                    data: results
                }
            ]
        });
        $("#tablica").append("<br/><br/><br/><br/>");
        $(".highcharts-container").children("svg").children("text:last").hide();
        $(".highcharts-button").hide();
    };
    CalcTable.prototype.hideElements = function () {
        $("#tablica").hide();
        $("#methodMisc").empty();
        $("#methodMisc").append("<span class='MathJax_Preview' style='color: inherit;'></span><span class='MathJax' id='MathJax-Element-1-Frame' tabindex='0' data-mathml='<math xmlns=&quot;http://www.w3.org/1998/Math/MathML&quot;><mrow class=&quot;MJX-TeXAtom-ORD&quot;></mrow></math>' role='presentation' style='position: relative;'><nobr aria-hidden='true'><span class='math' id='MathJax-Span-1' role='math' style='width: 0.003em; display: inline-block;'><span style='display: inline-block; position: relative; width: 0.003em; height: 0px; font-size: 117%;'><span style='position: absolute; clip: rect(3.821em 1000em 4.162em -999.997em); top: -3.986em; left: 0.003em;'><span class='mrow' id='MathJax-Span-2'><span class='texatom' id='MathJax-Span-3'><span class='mrow' id='MathJax-Span-4'></span></span></span><span style='display: inline-block; width: 0px; height: 3.991em;'></span></span></span><span style='display: inline-block; overflow: hidden; vertical-align: -0.063em; border-left-width: 0px; border-left-style: solid; width: 0px; height: 0.137em;'></span></span></nobr><span class='MJX_Assistive_MathML' role='presentation'><math xmlns='http://www.w3.org/1998/Math/MathML'><mrow class='MJX-TeXAtom-ORD'></mrow></math></span></span><script type='math/tex' id='MathJax-Element-1'>{}</script>");
        movingAvgClicked = false;
        $("#methodsForm").hide();
        $("#eraseCalcs").hide();
    };
    CalcTable.prototype.showElements = function () {
        $("#tablica").show();
        $("#methodsForm").show();
        $("#progbar").delay(800);
        $("#eraseCalcs").show();
    };
    CalcTable.prototype.onSubmitClicked = function () {
        var count = Number($("#brojRaz").val());
        if (calcTable.initialized === false) {
            if (count > 12) {
                alert("Broj razdoblja ne može biti veći od 12!");
            }
            else {
                calcTable.initialize(count);
                calcTable.showElements();
            }
        }
        else {
            alert("Već ste kreirali tablicu!");
        }
    };
    CalcTable.prototype.monthName = function (id) {
        switch (id) {
            case 1:
                return "Siječanj";
            case 2:
                return "Veljača";
            case 3:
                return "Ožujak";
            case 4:
                return "Travanj";
            case 5:
                return "Svibanj";
            case 6:
                return "Lipanj";
            case 7:
                return "Srpanj";
            case 8:
                return "Kolovoz";
            case 9:
                return "Rujan";
            case 10:
                return "Listopad";
            case 11:
                return "Studeni";
            case 12:
                return "Prosinac";
            default:
                throw SyntaxError;
        }
    };
    return CalcTable;
})();
var calcTable = new CalcTable();
var movingAvgClicked = false;
$(function () {
    calcTable.hideElements();
    $("#warning").hide();
    console.log("Loaded!");
});
$("#movingAvg").click(function () {
    if (!movingAvgClicked) {
        $("#methodMisc").append("</br></br><h4>N:" +
            "<input type='text' id='movingAvgCount' style='width: 15%; height: 15%;' class='form-control' placeholder='Unesi n..'></h4>");
        var math = MathJax.Hub.getAllJax("methodMisc")[0];
        MathJax.Hub.Queue(["Text", math, "MA_n = {\\sum_{i=1}^{n} D_i \\over n}"]);
        movingAvgClicked = true;
        document.getElementById("movingAvgCount").onkeydown = function (key) {
            if (key.keyCode === 13) {
                $("#progbar").css("width", "50%");
                calcTable.movingAverage($("#movingAvgCount").val());
            }
        };
    }
});
$("#btnSubmit").click(function () {
    calcTable.onSubmitClicked();
});
document.getElementById("brojRaz").onkeydown = function (key) {
    if (key.keyCode === 13) {
        calcTable.onSubmitClicked();
    }
};
$("#eraseCalcs").click(function () {
    if (calcTable.initialized) {
        calcTable.hideElements();
        calcTable.initialized = false;
        $("#tablicaBody").empty();
    }
});
//# sourceMappingURL=app.js.map