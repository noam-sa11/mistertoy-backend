import fs from 'fs'
import fr from 'follow-redirects'

const { http, https } = fr

export const utilService = {
  readJsonFile,
  download,
  httpGet,
  makeId,
  getSortedItems
}

function readJsonFile(path) {
  const str = fs.readFileSync(path, 'utf8')
  const json = JSON.parse(str)
  return json
}

function download(url, fileName) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(fileName)
    const protocol = url.startsWith('https') ? https : http

    protocol.get(url, (content) => {
      content.pipe(file)
      file.on('error', reject)
      file.on('finish', () => {
        file.close()
        resolve()
      })
    })
  })
}

function httpGet(url) {
  const protocol = url.startsWith('https') ? https : http
  const options = {
    method: 'GET'
  }

  return new Promise((resolve, reject) => {
    const req = protocol.request(url, options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        resolve(data)
      })
    })
    req.on('error', (err) => {
      reject(err)
    })
    req.end()
  })

}

function makeId(length = 5) {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

function getSortedItems(sortBy, arr) {
  let sortedArr
  if (sortBy === 'name') {
    sortedArr = arr.sort((a, b) => {
      const item1 = a.name.toUpperCase()
      const item2 = b.name.toUpperCase()
      if (item1 < item2) {
        return -1
      }
      if (item1 > item2) {
        return 1
      }
      return 0
    })
  } else if (sortBy === 'price') {
    sortedArr = arr.sort((a, b) => a.price - b.price)
  } else {
    sortedArr = arr.sort((a, b) => a.createdAt - b.createdAt)
  }
  return sortedArr
}
