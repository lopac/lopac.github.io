/// <reference path="../CalcAPI/Scripts/typings/jquery/jquery.ts" />
/// <reference path="../CalcAPI/Scripts/typings/highcharts/highcharts.d.ts" />

class Calculator {
	public initialized = false;

	private demandsCount: number;
	private table: HTMLTableElement;


	public constructor() {
		this.table = <HTMLTableElement>document.getElementById("tablicaBody");
	}

	initialize(tCount: number): void {

		this.demandsCount = tCount;
		this.initialized = true;

		for (var i = this.demandsCount; i >= 1; i--) {

			var row = <HTMLTableRowElement>this.table.insertRow(0);

			var cell = row.insertCell(0);
			cell.innerHTML = i.toString();

			var cell2 = row.insertCell(1);
			cell2.innerHTML = this.monthName(i);

			var cell3 = row.insertCell(2);
			cell3.innerHTML = `<div class='form-group'><input type='text' id='raz${i}'  class='form-control' placeholder='Unesi potražnju..'></div>`;

		}

	}

	private showWarning(): void {
		$("#warning").fadeIn().delay(1500).fadeOut();
	}

	private getDemands(): Array<number> {

		var demands: Array<number> = [];

		for (var i = 0; i < this.demandsCount; i++) {
			var demand = Number($(`#raz${i + 1}`).val());

			if (isNaN(demand) || typeof demand === "undefined" || demand === 0) {
				this.showWarning();
				return null;
			}


			demands.push(parseFloat(demand.toFixed(2)));
		}

		return demands;
	}
	private errors(values: Array<number>, results: Array<number>, linear: boolean): void {
		

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
			

		$("#methodMisc").append(`<div class="list-group">
					<a class="list-group-item active">Greške</a>
					<a class="list-group-item">MAD = ${parseFloat(res.Mad.toFixed(2))}</a>
					<a class="list-group-item">MAPD = ${parseFloat(res.Mapd.toFixed(2))}</a>
					<a class="list-group-item">E = ${parseFloat(res.E.toFixed(2))}</a>
					<a class="list-group-item">BIAS = ${parseFloat(res.Bias.toFixed(2))}</a>
				    <a class="list-group-item">TS = ${parseFloat(res.Ts.toFixed(2))}</a>
					</div>`);
			
		});

	}

	private drawLineChart(chartTitle: string, values: Array<number>, results: Array<number>) {
		$("#tablica").hide();

		var labels: Array<string> = [];

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
	}


	movingAverage(): void {


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

		$("#methodMisc").append(`</br></br><h4>N =
								<input type='text' id='movingAvgCount' style='width: 15%; height: 15%;' class='form-control' placeholder='Unesi n..'>
								<button id="calculateAvg" class="btn btn-info">Izračunaj</button></h4>`);

		document.getElementById("movingAvgCount").onkeydown = key => {
			if (key.keyCode === 13) {
				$("#calculateAvg").click();
			}
		}


		$("#calculateAvg").click(() => {


			var n = $("#movingAvgCount").val();

			var demands = this.getDemands();
			if (demands === null)
				return;

			var results: Array<number> = [];

			if (isNaN(n) || typeof n === "undefined" || n === 0 || n >= this.demandsCount) {
				this.showWarning();
				return;
			}


			var l = (this.demandsCount - n) + 1;
			var i: number;

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

			this.drawLineChart("Predviđanje pomičnim prosjecima", demands, results);
		});
	}
	
	weigthAverage(): void {


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


		$("#methodMisc").append(`<div id="weightTable" class="col-lg-12">
			 <div class="page-header">
			    <h2 >Alfa</h2>
			 </div>
			<div class="bs-component">
				<table class="table table-striped table-hover ">
					<thead>
					<tr id="tableHead">
						<th>#</th>
						<th>Mjesec</th>
						<th>Alfa</th>
					</tr>
					</thead>
					<tbody id="weightTableBody">
				
					</tbody>
				 </table>
		 </div></div>`);


		var tableBody = <HTMLTableElement>document.getElementById("weightTableBody");

		for (var i = this.demandsCount - 1; i >= 0; i--) {

			var row = <HTMLTableRowElement>tableBody.insertRow(0);
			row.id = `alpha${i}Form`;

			var cell = row.insertCell(0);
			cell.innerHTML = Number(i + 1).toString();

			var cell2 = row.insertCell(1);
			cell2.innerHTML = this.monthName(i + 1);

			var cell3 = row.insertCell(2);
			cell3.innerHTML = `<div class='form-group'><input type='text' id='alpha${i}'  class='form-control' placeholder='&alpha;'></h4></div>`;

		}

		$("#methodMisc").append(`<button id= "calculateWeight" class="btn btn-info"> Izračunaj </button>`);

		$("#calculateWeight").click(() => {

			var demands = this.getDemands();
			if (demands === null)
				return;

			var alphas: Array<number> = [];
			var i: number;

			for (i = 0; i < this.demandsCount; i++) {

				var alphaValue = Number($(`#alpha${i}`).val());


				if (isNaN(alphaValue) || typeof alphaValue === "undefined") {
					this.showWarning();
					return;
				} else {
					alphas.push(parseFloat(alphaValue.toFixed(2)));
				}

			}

			var checksum = 0;
			for (i = 0; i < alphas.length; i++) {
				checksum += Number(alphas[i]);
			}

			if (checksum != 1) {
				alert("Zbroj alfi nije jednak 1!");

			} else {

				var result = 0;
				for (i = 0; i < this.demandsCount; i++) {
					if (Number($(`#alpha${i}`).val()) === 0) {
						$(`#alpha${i}Form`).remove();
					}
					result += alphas[i] * demands[i];
				}

			
				$("#methodMisc").append(`<br/><br/><div class="list-group">
					<a href="#" class="list-group-item active">
					Rezultat
					</a>
					<a href="#" class="list-group-item">${this.monthName(this.demandsCount < 12 ? this.demandsCount + 1 : this.demandsCount)} = ${parseFloat(result.toFixed(2))} </a> </div>`);
			}
		});
	}


	expSmoothing(): void {

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


		$("#methodMisc").append(`</br></br><h4>&alpha; = <input type='text' id='expAlpha' style='width: 15%; height: 15%;' class='form-control' placeholder='Unesi &alpha;'>
								<button id="expCalculate" class="btn btn-info">Izračunaj</button></h4>`);

		document.getElementById("expAlpha").onkeydown = key => {
			if (key.keyCode === 13) {
				$("#expCalculate").click();
			}
		}

		$("#expCalculate").click(() => {

			var demands = this.getDemands();
			if (demands === null)
				return;

			var results: Array<number> = [];

			var alpha = Number($("#expAlpha").val());

			if (isNaN(alpha) || typeof alpha === "undefined" || alpha === 0 || alpha > 1) {
				this.showWarning();
			} else {

				var i: number;

				results.push(0);

				var result = alpha * demands[0] + ((1 - alpha) * demands[0]);
				results.push(result);

				for (i = 1; i < this.demandsCount; i++) {
					result = alpha * demands[i] + ((1 - alpha) * results[i]);
					results.push(parseFloat(result.toFixed(2)));
				}

				
				this.errors(demands, results,false);
				this.drawLineChart("Eksponencijalno izglađivanje", demands, results);
			}
		});
	}

	linearTrend(): void {

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


		var i: number;
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


	

		$("#methodMisc").append(`<div class="list-group">
					<a href="#" class="list-group-item active">
					Rezultati
					</a>
					<a href="#" class="list-group-item">Srednji X = ${parseFloat(xAvg.toFixed(2))} </a>
					<a href="#" class="list-group-item"> Srednji X =  ${parseFloat(yAvg.toFixed(2))} </a>
					<a href="#" class="list-group-item">Suma X*Y = ${xySum} </a>
					<a href="#" class="list-group-item">Suma X^2 =  ${xxSum} </a>
					<a href="#" class="list-group-item"> b = ${b}</a>
					<a href="#" class="list-group-item"> a = ${a} </a>
					<a href="#" class="list-group-item"> y = ${a} + ${b}x </a>
					</div>`);

		var results: Array<number> = [];

		for (i = 1; i <= this.demandsCount; i++) {
			results.push(a + b * i);
		}

		this.errors(demands, results,true);

		this.drawLineChart("Linijski trend", demands, results);


	}

	hideElements(): void {

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
	}


	showElements(): void {

		$("#tablica").show();

		$("#methodsForm").show();
		$("#eraseBtn").show();

	}

	onSubmitClicked(): void {

		var check: string = $("#periodsForm").val();
		var count: number;
		var random: boolean = false;
		if (check.indexOf("R") == (check.length - 1)) {
			count = Number(check.substring(0, check.length - 1));
			console.log("dc: " + count);
			random = true;
		}
		else {
			var count = Number((<HTMLInputElement>$("#periodsForm").val()));
		}

		

		if (isNaN(count) || typeof count === "undefined" || count === 0) {
			this.showWarning();
			return;
		}

		if (calculator.initialized === false) {
			if (count > 12) {
				alert("Broj razdoblja ne može biti veći od 12!");
			} else {
				calculator.initialize(count);
				calculator.showElements();
				if (random) {
					for (var i = 1; i <= this.demandsCount; i++) {
						$("#raz"+i).val(Math.floor(Math.random() * 99) + 10);
					}
				}
			}

		} else {

			alert("Već ste kreirali tablicu!");
		}

	}

	private monthName(id: number): string {
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

	}
}


var calculator = new Calculator();

var movingAvgClicked = false;
var weightAvgClicked = false;
var expSmoothingClicked = false;
var linearTrendClicked = false;

var isMobile = {
	Android() {
		return navigator.userAgent.match(/Android/i);
	},
	BlackBerry() {
		return navigator.userAgent.match(/BlackBerry/i);
	},
	iOS() {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	},
	Opera() {
		return navigator.userAgent.match(/Opera Mini/i);
	},
	Windows() {
		return navigator.userAgent.match(/IEMobile/i);
	},
	any() {
		return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
	}
};



$(() => {
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

document.getElementById("periodsForm").onkeydown = key => {
	if (key.keyCode === 13) {
		$("#submit").click();
	}
}

$("#eraseBtn").click(() => {

	if (calculator.initialized) {
		calculator.hideElements();
	}

});

$("#submit").click(() => {

	calculator.onSubmitClicked();

});

$("#weightAverage").click(() => {

	if (!weightAvgClicked) {
		calculator.weigthAverage();
		weightAvgClicked = true;
	}
});

$("#expSmoothing").click(() => {

	if (!expSmoothingClicked) {
		calculator.expSmoothing();
		expSmoothingClicked = true;
	}
});

$("#movingAverage").click(() => {

	if (!movingAvgClicked) {
		calculator.movingAverage();
		movingAvgClicked = true;
	}

});


$("#linearTrend").click(() => {

	if (!linearTrendClicked) {
		linearTrendClicked = true;
		calculator.linearTrend();
	}

});