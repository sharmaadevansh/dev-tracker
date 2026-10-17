import axios from 'axios'

async function testGH() {
  console.log('--- Testing jogruber contrib API ---')
  try {
    const res = await axios.get('https://github-contributions-api.jogruber.de/v4/sharmaadevansh')
    console.log('Jogruber API success! Keys:', Object.keys(res.data), 'Years:', res.data.years)
    // Convert jogruber response to dayMap
    const dayMap = {}
    if (res.data.contributions) {
      res.data.contributions.forEach((c) => {
        if (c.date) dayMap[c.date] = c.count
      })
    }
    console.log('Jogruber dayMap count:', Object.keys(dayMap).length)
  } catch (err) {
    console.error('Jogruber API error:', err.message)
  }

  console.log('--- Testing GitHub HTML Scrape ---')
  try {
    const htmlRes = await axios.get('https://github.com/users/sharmaadevansh/contributions', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    })
    const html = htmlRes.data
    console.log('HTML length:', html.length)

    // Check data-date and tool-tip or data-level
    const dayMap = {}
    const regex = /data-date="([0-9]{4}-[0-9]{2}-[0-9]{2})"[^>]*>[\s\S]*?<tool-tip[^>]*>([0-9]+|No) contribution/gi
    let m
    while ((m = regex.exec(html)) !== null) {
      dayMap[m[1]] = m[2] === 'No' ? 0 : parseInt(m[2], 10)
    }

    if (Object.keys(dayMap).length === 0) {
      // Try alternative regex for github calendar rect elements
      const rectRegex = /data-date="([0-9]{4}-[0-9]{2}-[0-9]{2})"[^>]*data-level="([0-9]+)"/gi
      while ((m = rectRegex.exec(html)) !== null) {
        dayMap[m[1]] = parseInt(m[2], 10)
      }
    }
    console.log('Scraped dayMap count:', Object.keys(dayMap).length)
    console.log('Sample days:', Object.entries(dayMap).slice(-10))
  } catch (err) {
    console.error('HTML Scrape error:', err.message)
  }
}

testGH()
