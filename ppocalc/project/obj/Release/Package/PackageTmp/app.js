/// <reference path="../CalcAPI/Scripts/typings/jquery/jquery.ts" />
/// <reference path="../CalcAPI/Scripts/typings/highcharts/highcharts.d.ts" />
var Calculator = (function () {
    function Calculator() {
        this.initialized = false;
        this.table = document.getElementById("tablicaBody");
    }
    Calculator.prototype.initialize = function (tCount) {
        this.demandsCount = tCount;
        this.initialized = true;
        for (var i = this.demandsCount; i >= 1; i--) {
            var row = this.table.insertRow(0);
            var cell = row.insertCell(0);
            cell.innerHTML = i.toString();
            var cell2 = row.insertCell(1);
            cell2.innerHTML = this.monthName(i);
            var cell3 = row.insertCell(2);
            cell3.innerHTML = "<div class='form-group'><input type='text' id='raz" + i + "'  class='form-control' placeholder='Unesi potra\u017Enju..'></div>";
        }
    };
    Calculator.prototype.showWarning = function () {
        $("#warning").fadeIn().delay(1500).fadeOut();
    };
    Calculator.prototype.getDemands = function () {
        var demands = [];
        for (var i = 0; i < this.demandsCount; i++) {
            var demand = Number($("#raz" + (i + 1)).val());
            if (isNaN(demand) || typeof demand === "undefined" || demand === 0) {
                this.showWarning();
                return null;
            }
            demands.push(parseFloat(demand.toFixed(2)));
        }
        return demands;
    };
    Calculator.prototype.errors = function (values, results, linear) {
        var model = {
            linear: linear,
            demands: values,
            result: results
        };
        $.ajax({
            type: "POST",
            data: JSON.stringify(model),
            url: "../api/Error",
            contentType: "application/json"
        }).done(function (res) {
            $("#methodMisc").append("<div class=\"list-group\">\n\t\t\t\t\t<a class=\"list-group-item active\">Gre\u0161ke</a>\n\t\t\t\t\t<a class=\"list-group-item\">MAD = " + parseFloat(res.Mad.toFixed(2)) + "</a>\n\t\t\t\t\t<a class=\"list-group-item\">MAPD = " + parseFloat(res.Mapd.toFixed(2)) + "</a>\n\t\t\t\t\t<a class=\"list-group-item\">E = " + parseFloat(res.E.toFixed(2)) + "</a>\n\t\t\t\t\t<a class=\"list-group-item\">BIAS = " + parseFloat(res.Bias.toFixed(2)) + "</a>\n\t\t\t\t    <a class=\"list-group-item\">TS = " + parseFloat(res.Ts.toFixed(2)) + "</a>\n\t\t\t\t\t</div>");
        });
    };
    Calculator.prototype.drawLineChart = function (chartTitle, values, results) {
        $("#tablica").hide();
        var labels = [];
        for (var i = 1; i <= 12; i++) {
            labels.push(this.monthName(i));
        }
        if (chartTitle === "Eksponencijalno izglađivanje" && this.demandsCount === 12) {
            labels.push(this.monthName(1));
        }
        var graphChart = $("#graphChart");
        var chart = new Highcharts.Chart({
            chart: {
                renderTo: graphChart[0]
            },
            title: {
                text: chartTitle,
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
    Calculator.prototype.movingAverage = function () {
        var _this = this;
        weightAvgClicked = false;
        linearTrendClicked = false;
        expSmoothingClicked = false;
        $("#weightAverage").removeClass("btn btn-warning").addClass("btn btn-success");
        $("#linearTrend").removeClass("btn btn-warning").addClass("btn btn-success");
        $("#expSmoothing").removeClass("btn btn-warning").addClass("btn btn-success");
        $("#movingAverage").removeClass("btn btn-success").addClass("btn btn-warning");
        $("#graphChart").empty();
        $("#tablica").show();
        $("#methodMisc").empty();
        $("#methodMisc").append("</br></br><h4>N =\n\t\t\t\t\t\t\t\t<input type='text' id='movingAvgCount' style='width: 15%; height: 15%;' class='form-control' placeholder='Unesi n..'>\n\t\t\t\t\t\t\t\t<button id=\"calculateAvg\" class=\"btn btn-info\">Izra\u010Dunaj</button></h4>");
        document.getElementById("movingAvgCount").onkeydown = function (key) {
            if (key.keyCode === 13) {
                $("#calculateAvg").click();
            }
        };
        $("#calculateAvg").click(function () {
            var n = $("#movingAvgCount").val();
            var demands = _this.getDemands();
            if (demands === null)
                return;
            var results = [];
            if (isNaN(n) || typeof n === "undefined" || n === 0 || n >= _this.demandsCount) {
                _this.showWarning();
                return;
            }
            var l = (_this.demandsCount - n) + 1;
            var i;
            for (i = 0; i < n; i++) {
                results.push(0);
            }
            for (i = 0; i < l; i++) {
                var result = 0;
                var ni = (Number(n) + Number(i));
                for (var j = i; j < ni; j++) {
                    result += Number(demands[j]);
                }
                var temp = Number(result) / Number(n);
                results.push(parseFloat(temp.toFixed(2)));
            }
            _this.drawLineChart("Predviđanje pomičnim prosjecima", demands, results);
        });
    };
    Calculator.prototype.weigthAverage = function () {
        var _this = this;
        movingAvgClicked = false;
        linearTrendClicked = false;
        expSmoothingClicked = false;
        $("#movingAverage").removeClass("btn btn-warning").addClass("btn btn-success");
        $("#linearTrend").removeClass("btn btn-warning").addClass("btn btn-success");
        $("#expSmoothing").removeClass("btn btn-warning").addClass("btn btn-success");
        $("#weightAverage").removeClass("btn btn-success").addClass("btn btn-warning");
        $("#graphChart").empty();
        $("#tablica").show();
        $("#methodMisc").empty();
        $("#methodMisc").append("<div id=\"weightTable\" class=\"col-lg-12\">\n\t\t\t <div class=\"page-header\">\n\t\t\t    <h2 >Alfa</h2>\n\t\t\t </div>\n\t\t\t<div class=\"bs-component\">\n\t\t\t\t<table class=\"table table-striped table-hover \">\n\t\t\t\t\t<thead>\n\t\t\t\t\t<tr id=\"tableHead\">\n\t\t\t\t\t\t<th>#</th>\n\t\t\t\t\t\t<th>Mjesec</th>\n\t\t\t\t\t\t<th>Alfa</th>\n\t\t\t\t\t</tr>\n\t\t\t\t\t</thead>\n\t\t\t\t\t<tbody id=\"weightTableBody\">\n\t\t\t\t\n\t\t\t\t\t</tbody>\n\t\t\t\t </table>\n\t\t </div></div>");
        var tableBody = document.getElementById("weightTableBody");
        for (var i = this.demandsCount - 1; i >= 0; i--) {
            var row = tableBody.insertRow(0);
            row.id = "alpha" + i + "Form";
            var cell = row.insertCell(0);
            cell.innerHTML = Number(i + 1).toString();
            var cell2 = row.insertCell(1);
            cell2.innerHTML = this.monthName(i + 1);
            var cell3 = row.insertCell(2);
            cell3.innerHTML = "<div class='form-group'><input type='text' id='alpha" + i + "'  class='form-control' placeholder='&alpha;'></h4></div>";
        }
        $("#methodMisc").append("<button id= \"calculateWeight\" class=\"btn btn-info\"> Izra\u010Dunaj </button>");
        $("#calculateWeight").click(function () {
            var demands = _this.getDemands();
            if (demands === null)
                return;
            var alphas = [];
            var i;
            for (i = 0; i < _this.demandsCount; i++) {
                var alphaValue = Number($("#alpha" + i).val());
                if (isNaN(alphaValue) || typeof alphaValue === "undefined") {
                    _this.showWarning();
                    return;
                }
                else {
                    alphas.push(parseFloat(alphaValue.toFixed(2)));
                }
            }
            var checksum = 0;
            for (i = 0; i < alphas.length; i++) {
                checksum += Number(alphas[i]);
            }
            if (checksum != 1) {
                alert("Zbroj alfi nije jednak 1!");
            }
            else {
                var result = 0;
                for (i = 0; i < _this.demandsCount; i++) {
                    if (Number($("#alpha" + i).val()) === 0) {
                        $("#alpha" + i + "Form").remove();
                    }
                    result += alphas[i] * demands[i];
                }
                $("#methodMisc").append("<br/><br/><div class=\"list-group\">\n\t\t\t\t\t<a href=\"#\" class=\"list-group-item active\">\n\t\t\t\t\tRezultat\n\t\t\t\t\t</a>\n\t\t\t\t\t<a href=\"#\" class=\"list-group-item\">" + _this.monthName(_this.demandsCount < 12 ? _this.demandsCount + 1 : _this.demandsCount) + " = " + parseFloat(result.toFixed(2)) + " </a> </div>");
            }
        });
    };
    Calculator.prototype.expSmoothing = function () {
        var _this = this;
        movingAvgClicked = false;
        linearTrendClicked = false;
        weightAvgClicked = false;
        $("#movingAverage").removeClass("btn btn-warning").addClass("btn btn-success");
        $("#linearTrend").removeClass("btn btn-warning").addClass("btn btn-success");
        $("#weightAverage").removeClass("btn btn-warning").addClass("btn btn-success");
        $("#expSmoothing").removeClass("btn btn-success").addClass("btn btn-warning");
        $("#graphChart").empty();
        $("#tablica").show();
        $("#methodMisc").empty();
        $("#methodMisc").append("</br></br><h4>&alpha; = <input type='text' id='expAlpha' style='width: 15%; height: 15%;' class='form-control' placeholder='Unesi &alpha;'>\n\t\t\t\t\t\t\t\t<button id=\"expCalculate\" class=\"btn btn-info\">Izra\u010Dunaj</button></h4>");
        document.getElementById("expAlpha").onkeydown = function (key) {
            if (key.keyCode === 13) {
                $("#expCalculate").click();
            }
        };
        $("#expCalculate").click(function () {
            var demands = _this.getDemands();
            if (demands === null)
                return;
            var results = [];
            var alpha = Number($("#expAlpha").val());
            if (isNaN(alpha) || typeof alpha === "undefined" || alpha === 0 || alpha > 1) {
                _this.showWarning();
            }
            else {
                var i;
                results.push(0);
                var result = alpha * demands[0] + ((1 - alpha) * demands[0]);
                results.push(result);
                for (i = 1; i < _this.demandsCount; i++) {
                    result = alpha * demands[i] + ((1 - alpha) * results[i]);
                    results.push(parseFloat(result.toFixed(2)));
                }
                _this.errors(demands, results, false);
                _this.drawLineChart("Eksponencijalno izglađivanje", demands, results);
            }
        });
    };
    Calculator.prototype.linearTrend = function () {
        movingAvgClicked = false;
        expSmoothingClicked = false;
        weightAvgClicked = false;
        $("#movingAverage").removeClass("btn btn-warning").addClass("btn btn-success");
        $("#expSmoothing").removeClass("btn btn-warning").addClass("btn btn-success");
        $("#weightAverage").removeClass("btn btn-warning").addClass("btn btn-success");
        var demands = this.getDemands();
        if (demands === null) {
            linearTrendClicked = false;
            return;
        }
        $("#linearTrend").removeClass("btn btn-success").addClass("btn btn-warning");
        $("#graphChart").empty();
        $("#tablica").show();
        $("#methodMisc").empty();
        var xAvg = 0;
        var yAvg = 0;
        var xySum = 0;
        var xxSum = 0;
        var b = 0;
        var a = 0;
        var i;
        for (i = 1; i <= this.demandsCount; i++) {
            xAvg += i;
            yAvg += demands[i - 1];
            xySum += Number(i * demands[i - 1]);
            xxSum += Math.pow(i, 2);
        }
        xAvg /= this.demandsCount;
        yAvg /= this.demandsCount;
        b = (xySum - (this.demandsCount * xAvg * yAvg)) / (xxSum - (this.demandsCount * Math.pow(xAvg, 2)));
        b = parseFloat(b.toFixed(2));
        a = yAvg - (b * xAvg);
        a = parseFloat(a.toFixed(2));
        $("#methodMisc").append("<div class=\"list-group\">\n\t\t\t\t\t<a href=\"#\" class=\"list-group-item active\">\n\t\t\t\t\tRezultati\n\t\t\t\t\t</a>\n\t\t\t\t\t<a href=\"#\" class=\"list-group-item\">Srednji X = " + parseFloat(xAvg.toFixed(2)) + " </a>\n\t\t\t\t\t<a href=\"#\" class=\"list-group-item\"> Srednji X =  " + parseFloat(yAvg.toFixed(2)) + " </a>\n\t\t\t\t\t<a href=\"#\" class=\"list-group-item\">Suma X*Y = " + xySum + " </a>\n\t\t\t\t\t<a href=\"#\" class=\"list-group-item\">Suma X^2 =  " + xxSum + " </a>\n\t\t\t\t\t<a href=\"#\" class=\"list-group-item\"> b = " + b + "</a>\n\t\t\t\t\t<a href=\"#\" class=\"list-group-item\"> a = " + a + " </a>\n\t\t\t\t\t<a href=\"#\" class=\"list-group-item\"> y = " + a + " + " + b + "x </a>\n\t\t\t\t\t</div>");
        var results = [];
        for (i = 1; i <= this.demandsCount; i++) {
            results.push(a + b * i);
        }
        this.errors(demands, results, true);
        this.drawLineChart("Linijski trend", demands, results);
    };
    Calculator.prototype.hideElements = function () {
        $("#tablicaBody").empty();
        $("#methodMisc").empty();
        $("#graphChart").empty();
        $("#methodsForm").hide();
        $("#eraseBtn").hide();
        $("#tablica").hide();
        $("#movingAverage").removeClass("btn btn-warning").addClass("btn btn-success");
        $("#weightAverage").removeClass("btn btn-warning").addClass("btn btn-success");
        $("#expSmoothing").removeClass("btn btn-warning").addClass("btn btn-success");
        $("#linearTrend").removeClass("btn btn-warning").addClass("btn btn-success");
        movingAvgClicked = false;
        weightAvgClicked = false;
        expSmoothingClicked = false;
        linearTrendClicked = false;
        this.initialized = false;
    };
    Calculator.prototype.showElements = function () {
        $("#tablica").show();
        $("#methodsForm").show();
        $("#eraseBtn").show();
    };
    Calculator.prototype.onSubmitClicked = function () {
        var check = $("#periodsForm").val();
        var count;
        var random = false;
        if (check.indexOf("R") == (check.length - 1)) {
            count = Number(check.substring(0, check.length - 1));
            console.log("dc: " + count);
            random = true;
        }
        else {
            var count = Number($("#periodsForm").val());
        }
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
                if (random) {
                    for (var i = 1; i <= this.demandsCount; i++) {
                        $("#raz" + i).val(Math.floor(Math.random() * 99) + 10);
                    }
                }
            }
        }
        else {
            alert("Već ste kreirali tablicu!");
        }
    };
    Calculator.prototype.monthName = function (id) {
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
    return Calculator;
}());
var calculator = new Calculator();
var movingAvgClicked = false;
var weightAvgClicked = false;
var expSmoothingClicked = false;
var linearTrendClicked = false;
var isMobile = {
    Android: function () {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function () {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};
$(function () {
    calculator.hideElements();
    if (isMobile.any()) {
        $("#brand").empty().remove();
        $(".navbar-collapse collapse").remove();
        $("#logo").remove();
        $(".navbar-header").append('<a href="#" class="navbar-brand">PPO Kalkulator</a>');
        $(".btn btn-success").append("<br/><br/>");
    }
    $("#warning").hide();
    console.log("Loaded!");
});
document.getElementById("periodsForm").onkeydown = function (key) {
    if (key.keyCode === 13) {
        $("#submit").click();
    }
};
$("#eraseBtn").click(function () {
    if (calculator.initialized) {
        calculator.hideElements();
    }
});
$("#submit").click(function () {
    calculator.onSubmitClicked();
});
$("#weightAverage").click(function () {
    if (!weightAvgClicked) {
        calculator.weigthAverage();
        weightAvgClicked = true;
    }
});
$("#expSmoothing").click(function () {
    if (!expSmoothingClicked) {
        calculator.expSmoothing();
        expSmoothingClicked = true;
    }
});
$("#movingAverage").click(function () {
    if (!movingAvgClicked) {
        calculator.movingAverage();
        movingAvgClicked = true;
    }
});
$("#linearTrend").click(function () {
    if (!linearTrendClicked) {
        linearTrendClicked = true;
        calculator.linearTrend();
    }
});
//# sourceMappingURL=app.js.map