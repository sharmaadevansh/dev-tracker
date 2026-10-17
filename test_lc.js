import axios from 'axios'

async function testLC() {
  try {
    const res = await axios.post('https://leetcode.com/graphql', {
      query: `
        query userPublicProfile($username: String!) {
          matchedUser(username: $username) {
            username
            profile {
              realName
              userAvatar
              ranking
              reputation
            }
            submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
                submissions
              }
            }
            userCalendar {
              activeYears
              streak
              totalActiveDays
              submissionCalendar
            }
          }
          userContestRanking(username: $username) {
            rating
            globalRanking
            topPercentage
            attendedContestsCount
          }
        }
      `,
      variables: { username: 'sharmaadevansh' }
    }, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com'
      },
      timeout: 10000
    })
    console.log('GRAPHQL RESPONSE:', JSON.stringify(res.data, null, 2))
  } catch (err) {
    console.error('Error:', err.message, err.response?.data)
  }
}

testLC()
