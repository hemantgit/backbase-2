/* @author Hisrael Pereira | https: //www.linkedin.com/in/hisrael */

angular.module("backbase", ["gridshore.c3js.chart", "ngAnimate"])

	.controller("content", ["$scope", "$http", "$window", "$sce", "$interval",
		function ($scope, $http, $window, $sce, $interval) {

			$scope.loadData = function () {

				$scope.loading = false;
				$scope.userMessage = $sce.trustAsHtml("<div class='load-spinner'></div><div>Loading...</div>");
				$scope.lastUpdated = null;
				$scope.cities = [];
				$scope.loadinDetail = false;
				$scope.cityDetail = null;
				$scope.clock = null;

				$http({
					method: "GET",
					url: "http://api.openweathermap.org/data/2.5/group?id=2643743,6455259,2759794,2950159,3169070&units=metric&appid=3d8b309701a13f65b660fa2c64cdc517"
				}).then((response) => {
					$scope.loading = true;
					$scope.lastUpdated = moment().format("DD/MM/YYYY [at] HH:mm:ss");

					let citiesData = response.data.list;
					angular.forEach(citiesData, (data) => {
						$scope.cities.push({
							id: data.id,
							name: data.name,
							temperature: Math.floor(data.main.temp),
							icon: converIconCode(data.weather[0].icon),
							condition: data.weather[0].main,
							windSpeed: data.wind.speed,
							lowestTemperature: data.main.temp_min,
							highestTemperature: data.main.temp_max,
							humidity: data.main.humidity,
							sunriseTime: moment(data.sys.sunrise).format("HH:mm"),
							sunsetTime: moment(data.sys.sunset).format("HH:mm"),
							data: data
						});
					});
				}, (response) => {
					$scope.loading = false;
					$scope.userMessage = $sce.trustAsHtml("Something went wrong. <a href='#' ng-click='reloadPage()'>Click here</a> to reload the page.");
				});
			};

			let converIconCode = function (code) {
				let icon = null;
				switch (code) {
				case "01d":
					icon = "sun-1";
					break;
				case "01n":
					icon = "moon-2";
					break;
				case "02d":
					icon = "partly-cloudy-1";
					break;
				case "02n":
					icon = "partly-cloudy-3";
					break;
				case "03d":
				case "03n":
					icon = "mostly-cloudy-1";
					break;
				case "04d":
				case "04n":
					icon = "mostly-cloudy-2";
					break;
				case "10d":
					icon = "heavy-rain-day";
					break;
				case "10n":
					icon = "heavy-rain-night";
					break;
				default:
					icon = "cloud-refresh";
					break;
				}
				return icon;
			};

			$scope.reloadPage = function () {
				$window.location.reload();
			};

			$scope.showWeatherDetail = function (index) {
				let city = $scope.cities[index];
				$scope.loadinDetail = true;
				$scope.cityDetail = {};

				$http({
					method: "GET",
					url: "http://api.openweathermap.org/data/2.5/forecast?id=" + city.id + "&units=metric&appid=3d8b309701a13f65b660fa2c64cdc517"
				}).then((response) => {
					$scope.loadinDetail = false;
					let cityDetail = response.data;

					$scope.cityDetail = {
						name: cityDetail.city.name,
						date: "",
						time: "",
						nextDays: [],
						nextHours: {
							label: [],
							temperature: []
						}
					};

					let tz = "Europe/";
					switch (city.id) {
					case 2643743:
						tz += "London";
						break;
					case 6455259:
						tz += "Paris";
						break;
					case 2759794:
						tz += "Amsterdam";
						break;
					case 2950159:
						tz += "Berlin";
						break;
					case 3169070:
						tz += "Rome";
						break;
					}

					let momentTz = moment().tz(tz);
					$scope.cityDetail.date = momentTz.format("MMMM Do");
					$scope.cityDetail.time = momentTz.format("HH:mm:ss");

					$interval.cancel($scope.clock);
					$scope.clock = $interval((tz) => {
						$scope.cityDetail.time = moment().tz(tz).format("HH:mm:ss");
					}, 1000, 0, true, tz);


					angular.forEach(cityDetail.list, (data, i) => {

						let dataMoment = moment(data.dt_txt);
						if (i == 0 || dataMoment.format("HH") == "09") {
							$scope.cityDetail.nextDays.push({
								label: dataMoment.format("dddd, Do"),
								icon: converIconCode(data.weather[0].icon),
								condition: data.weather[0].main,
								lowestTemperature: Math.floor(data.main.temp_min),
								highestTemperature: Math.floor(data.main.temp_min),
								data: data
							});
						}

						if (i < 5) {
							$scope.cityDetail.nextHours.label.push(dataMoment.format("HH:mm"));
							$scope.cityDetail.nextHours.temperature.push(Math.floor(data.main.temp));
						}
					});

					$scope.cityDetail.nextHours.temperature = $scope.cityDetail.nextHours.temperature.toString();
					$scope.cityDetail.nextHours.label = $scope.cityDetail.nextHours.label.toString();
				}, (response) => {
					$scope.loadinDetail = false;
					$scope.loading = false;
					$scope.userMessage = $sce.trustAsHtml("Something went wrong. <a href='#' ng-click='reloadPage()'>Click here</a> to reload the page.");
				});
			};

			$scope.hideWeatherDetail = function () {
				$scope.loadinDetail = false;
				$scope.cityDetail = {};
			};

			$scope.loadData();
		}
	]);
