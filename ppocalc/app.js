/// <reference path="../Calc/Scripts/typings/jquery/jquery.ts" />
/// <reference path="../Calc/Scripts/typings/highcharts/highcharts.d.ts" />
var CalcTable = (function () {
    function CalcTable() {
        this.initialized = false;
        this.table = document.getElementById("tablicaBody");
    }
    CalcTable.prototype.initialize = function (tCount) {
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
        if (isNaN(n) || typeof n === "undefined" || n === 0 || n >= this.count) {
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
        for (var i = 0; i < n; i++) {
            results.push(0);
        }
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
        for (var i = 1; i <= 12; i++) {
            labels.push(this.monthName(i));
        }
        for (var i = 0; i < labels.length; i++) {
            console.log(labels[i]);
        }
        $("#tablica").hide();
        var graphChart = $("#graphChart");
        var chart = new Highcharts.Chart({
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
                min: Math.min.apply(Math, values),
                startOnTick: true,
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
        $("#tablicaBody").empty();
        $("#methodMisc").empty();
        $("#graphChart").empty();
        $("#methodsForm").hide();
        $("#eraseBtn").hide();
        $("#tablica").hide();
        $("#movingAverage").removeClass("btn btn-warning").addClass("btn btn-success");
        $("#weightAverage").removeClass("btn btn-warning").addClass("btn btn-success");
        movingAvgClicked = false;
        this.initialized = false;
    };
    CalcTable.prototype.showElements = function () {
        $("#tablica").show();
        $("#methodsForm").show();
        $("#eraseBtn").show();
    };
    CalcTable.prototype.onSubmitClicked = function () {
        var count = Number($("#periodsForm").val());
        if (isNaN(count) || typeof count === "undefined" || count === 0) {
            this.showWarning();
            return;
        }
        if (calculator.initialized === false) {
            if (count > 12) {
                alert("Broj razdoblja ne može biti veći od 12!");
            }
            else {
                calculator.initialize(count);
                calculator.showElements();
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
var calculator = new CalcTable();
var movingAvgClicked = false;
$(function () {
    calculator.hideElements();
    $("#warning").hide();
    console.log("Loaded!");
});
$("#movingAverage").click(function () {
    if (!movingAvgClicked) {
        //btn btn-warning
        $("#movingAverage").removeClass("btn btn-success").addClass("btn btn-warning");
        $("#methodMisc").append("</br></br><h4>N <img src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA1klEQVR4Xu2WQQ7AIAzD6P8fzbQf9IJiKd4ZLSF1gDnl35Tv/xiABJQnYAXKAfAQtAJWoDwBK1AOgLeAFbAC5QlYgXIAvAWsgBUoT8AKbAG4997tWsK6mVkNd7Xo35ABSEB5BQi9fuFhfQa8ECf80wAIU0h6kIBk+gRtCSBMIelhTYBPYZ/C5U/h+gokD6qX2utD8KWJ5L8NIJk+QVsCCFNIepCAZPoEbQkgTCHpQQKS6RO0JYAwhaQHCUimT9CWAMIUkh4kIJk+QVsCCFNIepCAZPoE7Q9PuSBBAaYOWAAAAABJRU5ErkJggg==\"  title='Equal Sign' width='16'>\n\t\t\t\t\t\t\t\t<input type='text' id='movingAvgCount' style='width: 15%; height: 15%;' class='form-control' placeholder='Unesi n..'>\n\t\t\t\t\t\t\t\t<button id=\"calculateIt\" class=\"btn btn-info\">Izra\u010Dunaj</button></h4>");
        movingAvgClicked = true;
        $("#calculateIt").click(function () {
            calculator.movingAverage($("#movingAvgCount").val());
        });
        document.getElementById("movingAvgCount").onkeydown = function (key) {
            if (key.keyCode === 13) {
                calculator.movingAverage($("#movingAvgCount").val());
            }
        };
    }
});
$("#submit").click(function () {
    calculator.onSubmitClicked();
});
document.getElementById("periodsForm").onkeydown = function (key) {
    if (key.keyCode === 13) {
        calculator.onSubmitClicked();
    }
};
$("#eraseBtn").click(function () {
    if (calculator.initialized) {
        calculator.hideElements();
    }
});
//# sourceMappingURL=app.js.map