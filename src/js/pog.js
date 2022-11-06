moment().format();

class Pog {
    async handle(url) {
        const data = await fetch(`https://ihatecors.sc2.nl/${url}`);
        const icalData = ical.parseICS(await data.text())
        // const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        let episodes = []

        for (let k in icalData) {
            if (icalData.hasOwnProperty(k)) {
                var ev = icalData[k];
                if (icalData[k].type == 'VEVENT') {
                    let details = ev.summary.match(/(.*) .([0-9]{1,2}).([0-9]{1,2})/i)
                    episodes.push({
                        series: details[1],
                        season: details[2],
                        episode: details[3],
                        airdate: moment(ev.end).toISOString(),
                        fromNow: moment(ev.end).fromNow()
                    })
                }
            }
        }

        // Sort the array by dates (from first to last)
        episodes.sort((a,b) => (new Date(a.airdate)) - (new Date(b.airdate)));

        return episodes
    }
};