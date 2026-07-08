const fs = require('fs')
const path = require('path')

const dir = '.'
const extensions = ['.ts', '.tsx', '.sql']
const exclude = ['node_modules', '.next']

function replaceInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  if (content.includes('full_name')) {
    const newContent = content.replace(/full_name/g, 'short_name')
    fs.writeFileSync(filePath, newContent, 'utf8')
    console.log('Replaced in ' + filePath)
  }
}

function walk(currentDir) {
  const files = fs.readdirSync(currentDir)
  for (const file of files) {
    const fullPath = path.join(currentDir, file)
    if (exclude.some(ex => fullPath.includes(ex))) continue
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      walk(fullPath)
    } else {
      if (extensions.some(ext => fullPath.endsWith(ext))) {
        replaceInFile(fullPath)
      }
    }
  }
}

walk(dir)
