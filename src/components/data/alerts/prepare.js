module.exports.prepareData = function (alerts, xKey, yKeys) {
    try {
        let prepared = {
            xKey: xKey,
            yKeys: yKeys.sort( (a, b) => a.zIndex > b.zIndex ),
            data: undefined
        }

        
        // groups all alerts by date and priority:
        let data = {};
        let priorities = yKeys.map( (yKey) => yKey.label );

        for (let i = 0; i < alerts.length; i++) {
            let xValue = (new Date(alerts[i].timestamp)).toLocaleDateString();
            let priority = alerts[i].priority.label;

            // filters out any priorities that are not listed in yKeys:
            if (priorities.indexOf(priority) < 0) {
                continue;
            }

            if (data.hasOwnProperty(xValue)) {
                if (data[xValue].hasOwnProperty(priority)) {
                    data[xValue][priority].push(alerts[i]);
                } else {
                    data[xValue][priority] = [ alerts[i] ];
                }
            } else {
                data[xValue] = {};

                yKeys.forEach( (key) => {
                    data[xValue][key.label] = []
                });

                if (data[xValue].hasOwnProperty(priority)) {
                    data[xValue][priority].push(alerts[i]);
                }
            }
        }
        
        // for each date, sorts each priority array:
        for (let date in data) {
            for (let yKey in data[date]) {
                data[date][yKey] = data[date][yKey].sort( (a,b) => new Date(a.timestamp) > new Date(b.timestamp) )
            }
        }

        // identifies gap dates in the range and assigns empty arrays:
        let sorted = Object.keys(data)
            .sort( (a, b) => new Date(a) > new Date(b) );
        let minDate = sorted[0];
        let maxDate = sorted[sorted.length - 1];
        let msPerDay = 1000*60*60*24;
        let numDays = Math.max(1, (new Date(maxDate) - new Date(minDate)) / msPerDay );
        let zeroState = {};
        priorities.forEach( (yKey) => {
            zeroState[yKey] = [];
        });       
        
        for (let i = 0; i < numDays; i++) {
            let localeDateString = (new Date( (new Date(minDate)).getTime() + (i * msPerDay))).toLocaleDateString();
            if (sorted.indexOf(localeDateString) < 0) {
                data[localeDateString] = zeroState;
            }
        }
        
        // sorts alert dates and assembles final data structure:
        prepared.data = Object.keys(data)
            .sort( (a, b) => new Date(a) > new Date(b) )
            .map( (date) => Object.assign({ [xKey]: new Date(date) }, data[date]) );

            
        console.log(prepared)
        return prepared;
    } catch(e) {
        console.log(e)
        return null;
    }
}

