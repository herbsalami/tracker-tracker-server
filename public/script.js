let field = 'leecherCount';
let results;
let myLineChart;
let myRadar;
fetch('/trackers', { method: 'GET' })
.then((response) => {
  return response.json();
})
.then((res) => {
    results = res;
	createGraph();
    createRadar();
});

const createRadar = () => {
    const rctx = document.getElementById("radarChart").getContext("2d");
    const colors = [
        '75,192,192,',
        '210, 105, 30,',
        '183, 107, 163,'
    ];
    let i = 0;
    let labels = [
        {
            name: 'Artist Count',
            value: 'artistCount'
        },
                {
            name: 'Enabled Users',
            value: 'enabledUsers'
        },
                {
            name: 'Filled Requests',
            value: 'filledRequestCount'
        },
                {
            name: 'Perfect Flacs',
            value: 'perfectFlacCount'
        },
                {
            name: 'Release Count',
            value: 'releaseCount'
        },
                {
            name: 'Request Count',
            value: 'requestCount'
        },
                {
            name: 'Torrent Count',
            value: 'artistCount'
        }
    ];
    let datasets = [];
    for(let tracker in results) {
        if(tracker !== 'what') {
            datasets.push({
                label: tracker,
                backgroundColor: `rgba(${colors[i]}0.2)`,
                borderColor: `rgba(${colors[i]}1)`,
                pointBackgroundColor: `rgba(${colors[i]}1)`,
                pointBorderColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: `rgba(${colors[i]}1)`,
                data: labels.map((item) => {
                    return results[tracker][results[tracker].length-1][item.value]/results['what'][0][item.value] * 100;
                })
            })
            i++;
            
        }
    }
    labels = labels.map((label) => label.name);
    let myRadarChart = new Chart(rctx, {
        type: 'radar',
        data: {
            labels,
            datasets
        }
    });
    


}

const createGraph = () => {
	const ctx = document.getElementById("myChart").getContext("2d");
	const colors = [
		'75,192,192,',
		'210, 105, 30,',
		'183, 107, 163,'
	]
	let times = [];
	let datasets = [];
	let i = 0;
	for (let tracker in results) {
		if(results[tracker].length > times.length) {
			times = results[tracker].map((result) => {
				let date = new Date(parseInt(result.timestamp) * 1000);
				// console.log(date);
				return date;
			});
		}
        if(tracker !== 'what') {
    		datasets.push({
                label: tracker,
                fill: false,
                lineTension: 0.1,
                backgroundColor: `rgba(${colors[i]}0.4)`,
                borderColor: `rgba(${colors[i]}1)`,
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: `rgba(${colors[i]}1)`,
                pointBackgroundColor: "#fff",
                pointBorderWidth: 0.5,
                pointHoverRadius: 3,
                pointHoverBackgroundColor: `rgba(${colors[i]}1)`,
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 1,
                pointRadius: 0.5,
                pointHitRadius: 5,
                data: results[tracker].map((result) => {
                    // console.log(result[field]);
                    return result[field];
                }),
                spanGaps: false,
            });
        }
        else if(results[tracker][0][field]){
            datasets.push({
                label: tracker,
                fill: false,
                lineTension: 0.05,
                backgroundColor: `rgba(${colors[i]}0.4)`,
                borderColor: `rgba(${colors[i]}1)`,
                borderCapStyle: 'butt',
                borderDash: [5, 5],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: `rgba(${colors[i]}1)`,
                pointBackgroundColor: "#fff",
                pointBorderWidth: 0.5,
                pointHoverRadius: 3,
                pointHoverBackgroundColor: `rgba(${colors[i]}1)`,
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 1,
                pointRadius: 0.5,
                pointHitRadius: 5,
                data: [
                    {
                        x: times[0],
                        y: results[tracker][0][field]
                    },
                    {
                        x: times[times.length-1],
                        y: results[tracker][0][field]
                    }
                ],
                spanGaps: true,
            });

        }
        i++;
	}
	myLineChart = new Chart(ctx, {
    type: 'line',
    data: {labels: times, datasets: datasets},
    options: {
    	responsive: true,
    	maintainAspectRatio: false,
        scales: {
            xAxes: [{
                type: 'time',
                time: {
                    displayFormats: {
                        day: 'll'
                    }
                },
                afterBuildTicks: function(humdaysChart) {    
				    humdaysChart.ticks.pop();  
  }
            }]
        }
    }
	});

}



[].forEach.call(document.getElementsByClassName('field-select'), (item) => {item.addEventListener('click', (e)=> {
    field = e.target.attributes.value.textContent;
    myLineChart.destroy();
    createGraph();
    document.getElementById('data-type').innerHTML = e.target.innerHTML;
})});
document.getElementById('data-type').innerHTML = 'Leecher Count';