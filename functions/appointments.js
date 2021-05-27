const Window = require('window')
const axios = require('axios')
const $ = require('jquery')(new Window())
const https = require('https')
const dfns = require('date-fns')

// create axios instance with ssl verification disabled
const api = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

async function query() {
  // log query start time
  var queryTime = dfns.format(new Date(), 'Pp')
  console.log('Queried at: ', queryTime)

  // traemos los próximos 8 días entre semana
  var upcomingBusinessDays = getUpcomingBusinessDays()

  // this object stores the results
  var report = {}

  // por cada día entre semana vamos a consultar disponibilidad
  for (const { day, month, year } of upcomingBusinessDays) {
    var site = await fetchSite(day, month, year)

    // buscamos en el dom por la tabla de resultados y si no existe entonces continuamos
    var [appointmentTable] = $(site.trim()).find('.agenda_citas tbody')
    if (!appointmentTable) continue;

    // recorremos las filas de la tabla y loggeamos su contenido
    var dayId = dfns.format(new Date(year, month - 1, day), 'PPPP')
    report[dayId] = [];
    appointmentTable.childNodes.forEach(row => {
      var availability = getTimeAvailability(row)
      if (availability.length > 0) {
        report[dayId].push(availability)
      }
    })
  }

  // return the results
  return { queryTime, report }

}

function getUpcomingBusinessDays() {
  let moment = new Date()
  let date10daysFromNow = dfns.addDays(moment, 9)

  let daysBetween = dfns.eachDayOfInterval({ start: moment, end: date10daysFromNow })

  let businessDaysInterval = daysBetween.reduce((dates, current) => {
    let dayIndex = current.getDay()
    if ([1, 2, 3, 4, 5].includes(dayIndex)) {
      let newDates = [...dates, current]
      return newDates
    }
    return dates
  }, [])

  let formattedDates = businessDaysInterval.map(date => {
    var dateString = dfns.format(date, 'P')
    var [month, day, year] = dateString.split('/')
    return {
      month: Number(month),
      day: Number(day),
      year: Number(year)
    }
  })

  return formattedDates
}

async function fetchSite(day, month, year) {
  try {
    var { data } = await api.get(`https://www.rree.go.cr/index.php?sec=servicios&cat=autenticaciones&cont=735&anno=${year}&mes=${month}&dia=${day}`)
    return data;
  } catch (err) {
    console.error(err)
  }
}

function getTimeAvailability(row) {
  var content = []
  row.childNodes.forEach(column => {
    if (column.textContent !== '\n\t\t\t\t' && column.textContent !== '\n\t\t\t') {
      content.push(column.textContent)
    }
  })
  if (content[1] && typeof content[1] === 'string') {
    content[1] = content[1].replace('\n\t\t\t\t', '')
  }
  return content
}

exports.handler = async (event, context) => {
  try {
    var results = await query()
    return {
      statusCode: 200,
      body: JSON.stringify(results)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err)
    };
  }
};