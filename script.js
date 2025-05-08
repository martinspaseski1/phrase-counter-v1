// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Add the enhanced UI elements
  setupEnhancedUI()

  // Set up event listeners
  document.getElementById("analyzeBtn").addEventListener("click", analyzeText)
  document.getElementById("phraseLength").addEventListener("input", updatePhraseLengthDisplay)
  document.getElementById("minOccurrences").addEventListener("input", updateMinOccurrencesDisplay)
  document.getElementById("sortSelect").addEventListener("change", () => {
    if (document.getElementById("textInput").value.trim()) {
      analyzeText()
    }
  })

  const resultsDiv = document.getElementById("results")
  if (!resultsDiv.innerHTML.trim()) {
    resultsDiv.innerHTML = '<div class="placeholder-message">Results will appear here after checking</div>'
  }
})

function setupEnhancedUI() {
  // Add filter controls
  const inputContainer = document.querySelector(".input-container")
  const filterHTML = `
    <div class="filter-controls">
      <div class="filter-group">
        <label for="phraseLength">Phrase Length: <span id="phraseLengthValue">2-6</span> words</label>
        <div class="range-slider">
          <input type="range" min="2" max="10" value="6" class="slider" id="phraseLength">
        </div>
      </div>
      <div class="filter-group">
        <label for="minOccurrences">Minimum Occurrences: <span id="minOccurrencesValue">2</span></label>
        <div class="range-slider">
          <input type="range" min="2" max="10" value="2" class="slider" id="minOccurrences">
        </div>
      </div>
      <div class="filter-group">
        <label for="sortSelect">Sort Results By:</label>
        <select id="sortSelect" class="sort-select">
          <option value="frequency">Frequency (High to Low)</option>
          <option value="frequencyAsc">Frequency (Low to High)</option>
          <option value="length">Phrase Length (Long to Short)</option>
          <option value="lengthAsc">Phrase Length (Short to Long)</option>
          <option value="alpha">Alphabetical (A to Z)</option>
        </select>
      </div>
    </div>
  `
  inputContainer.insertAdjacentHTML("afterend", filterHTML)

  // Add analytics dashboard
  const filterControls = document.querySelector(".filter-controls")
  const dashboardHTML = `
    <div class="analytics-dashboard">
      <h3>Text Analytics</h3>
      <div class="analytics-grid">
        <div class="analytics-card">
          <div class="analytics-value" id="wordCount">0</div>
          <div class="analytics-label">Words</div>
        </div>
        <div class="analytics-card">
          <div class="analytics-value" id="charCount">0</div>
          <div class="analytics-label">Characters</div>
        </div>
        <div class="analytics-card">
          <div class="analytics-value" id="readingTime">0</div>
          <div class="analytics-label">Min Read</div>
        </div>
        <div class="analytics-card">
          <div class="analytics-value" id="repeatPercent">0%</div>
          <div class="analytics-label">Repeated</div>
        </div>
      </div>
      <div class="readability-score">
        <div class="readability-label">Readability Score:</div>
        <div class="readability-meter">
          <div class="readability-fill" id="readabilityFill"></div>
        </div>
        <div class="readability-value" id="readabilityScore">-</div>
      </div>
    </div>
  `
  filterControls.insertAdjacentHTML("afterend", dashboardHTML)

  // Update the button text and ID
  const button = document.querySelector("button")
  button.innerHTML = `
    <span class="button-text">Analyze Text</span>
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="button-icon"><path d="m9 18 6-6-6-6"></path></svg>
  `
  button.id = "analyzeBtn"
}

function updatePhraseLengthDisplay() {
  const value = document.getElementById("phraseLength").value
  document.getElementById("phraseLengthValue").textContent = `2-${value}`
}

function updateMinOccurrencesDisplay() {
  const value = document.getElementById("minOccurrences").value
  document.getElementById("minOccurrencesValue").textContent = value
}

function analyzeText() {
  const text = document.getElementById("textInput").value
  const resultsDiv = document.getElementById("results")
  const highlightedTextDiv = document.getElementById("highlightedText")

  // Clear previous results
  resultsDiv.innerHTML = ""

  if (!text.trim()) {
    resultsDiv.innerHTML = '<div class="no-results">Please enter some text to check</div>'
    highlightedTextDiv.innerHTML = '<div class="placeholder-message">Your text with highlights will appear here</div>'
    updateTextStatistics(0, 0)
    return
  }

  // Update text statistics
  const wordCount = text.match(/\b\w+\b/g)?.length || 0
  const charCount = text.length
  updateTextStatistics(wordCount, charCount)

  // Calculate readability
  calculateReadability(text)

  // Get filter values
  const maxPhraseLength = Number.parseInt(document.getElementById("phraseLength").value)
  const minOccurrences = Number.parseInt(document.getElementById("minOccurrences").value)
  const sortBy = document.getElementById("sortSelect").value

  // Check for repeating phrases
  findRepeatingPhrases(text, minOccurrences, maxPhraseLength, sortBy)
}

function updateTextStatistics(wordCount, charCount) {
  document.getElementById("wordCount").textContent = wordCount.toLocaleString()
  document.getElementById("charCount").textContent = charCount.toLocaleString()

  // Calculate reading time (average reading speed: 225 words per minute)
  const readingTime = Math.max(1, Math.ceil(wordCount / 225))
  document.getElementById("readingTime").textContent = readingTime
}

function calculateReadability(text) {
  // Simple Flesch-Kincaid readability calculation
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length || 1
  const words = text.match(/\b\w+\b/g)?.length || 0
  const syllables = countSyllables(text)

  if (words === 0) {
    document.getElementById("readabilityScore").textContent = "N/A"
    document.getElementById("readabilityFill").style.width = "0%"
    return
  }

  // Flesch Reading Ease score
  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
  const boundedScore = Math.max(0, Math.min(100, score))

  document.getElementById("readabilityScore").textContent = Math.round(boundedScore)
  document.getElementById("readabilityFill").style.width = `${boundedScore}%`

  // Set color based on readability
  let color
  if (boundedScore >= 80)
    color = "#10b981" // Easy - green
  else if (boundedScore >= 60)
    color = "#3b82f6" // Standard - blue
  else if (boundedScore >= 40)
    color = "#f59e0b" // Somewhat difficult - orange
  else color = "#ef4444" // Difficult - red

  document.getElementById("readabilityFill").style.backgroundColor = color
}

function countSyllables(text) {
  // This is a simplified syllable counter
  const words = text.toLowerCase().match(/\b\w+\b/g) || []
  let syllableCount = 0

  words.forEach((word) => {
    // Count vowel groups as syllables
    const vowelGroups = word.match(/[aeiouy]+/g) || []
    let count = vowelGroups.length

    // Subtract silent e at the end
    if (word.length > 2 && word.endsWith("e") && !/[aeiouy]e$/.test(word)) {
      count--
    }

    // Ensure at least one syllable per word
    syllableCount += Math.max(1, count)
  })

  return syllableCount
}

function findRepeatingPhrases(text, minOccurrences, maxPhraseLength, sortBy) {
  const words = text.toLowerCase().match(/\b\w+\b/g)
  const resultsDiv = document.getElementById("results")
  const highlightedTextDiv = document.getElementById("highlightedText")

  if (!words || words.length < 2) {
    resultsDiv.innerHTML = '<div class="no-results">Not enough words to check for phrases</div>'
    highlightedTextDiv.innerHTML = text
    return
  }

  const phraseCounts = {}
  const minPhraseLength = 2

  // Collect phrases from 2 to max length
  for (let len = minPhraseLength; len <= maxPhraseLength; len++) {
    for (let i = 0; i <= words.length - len; i++) {
      const phrase = words.slice(i, i + len).join(" ")
      phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1
    }
  }

  const repeatingPhrases = Object.entries(phraseCounts).filter(([_, count]) => count >= minOccurrences)

  // Apply sorting
  switch (sortBy) {
    case "frequency":
      repeatingPhrases.sort((a, b) => b[1] - a[1])
      break
    case "frequencyAsc":
      repeatingPhrases.sort((a, b) => a[1] - b[1])
      break
    case "length":
      repeatingPhrases.sort((a, b) => b[0].split(" ").length - a[0].split(" ").length)
      break
    case "lengthAsc":
      repeatingPhrases.sort((a, b) => a[0].split(" ").length - b[0].split(" ").length)
      break
    case "alpha":
      repeatingPhrases.sort((a, b) => a[0].localeCompare(b[0]))
      break
  }

  // Display results
  if (repeatingPhrases.length === 0) {
    resultsDiv.innerHTML = '<div class="no-results">No repeating phrases found</div>'
    highlightedTextDiv.innerHTML = text
  } else {
    resultsDiv.innerHTML = "<h3>Repeating Phrases</h3>"

    repeatingPhrases.forEach(([phrase, count]) => {
      const phraseItem = document.createElement("div")
      phraseItem.className = "phrase-item"
      phraseItem.innerHTML = `
        <span class="phrase-text">${phrase}</span>
        <span class="phrase-count">${count}</span>
      `

      // Add click event to highlight only this phrase
      phraseItem.addEventListener("click", () => {
        highlightSpecificPhrase(text, phrase)
      })

      resultsDiv.appendChild(phraseItem)
    })

    // Highlight all repeating phrases in original text
    highlightAllPhrases(
      text,
      repeatingPhrases.map(([phrase]) => phrase),
    )

    // Calculate repeat percentage
    setTimeout(() => {
      const highlights = document.querySelectorAll(".highlight")
      let highlightedChars = 0
      highlights.forEach((el) => {
        highlightedChars += el.textContent.length
      })

      const repeatPercent = Math.round((highlightedChars / text.length) * 100)
      document.getElementById("repeatPercent").textContent = `${repeatPercent}%`
    }, 100)
  }
}

function highlightAllPhrases(text, phrases) {
  const highlightedTextDiv = document.getElementById("highlightedText")
  let highlighted = text

  phrases.forEach((phrase) => {
    const regex = new RegExp(`\\b${phrase.replace(/\s+/g, "\\s+")}\\b`, "gi")
    highlighted = highlighted.replace(regex, (match) => `<span class="highlight">${match}</span>`)
  })

  highlightedTextDiv.innerHTML = highlighted

  // Add animation to the highlights
  setTimeout(() => {
    const highlights = document.querySelectorAll(".highlight")
    highlights.forEach((el, i) => {
      el.style.transition = "background-color 0.3s ease"
      el.style.transitionDelay = `${i * 50}ms`
    })
  }, 100)
}

function highlightSpecificPhrase(text, targetPhrase) {
  const highlightedTextDiv = document.getElementById("highlightedText")
  let highlighted = text

  // Create regex for the specific phrase
  const regex = new RegExp(`\\b${targetPhrase.replace(/\s+/g, "\\s+")}\\b`, "gi")

  // Highlight only the specific phrase
  highlighted = highlighted.replace(regex, (match) => `<span class="highlight highlight-selected">${match}</span>`)

  highlightedTextDiv.innerHTML = highlighted

  // Add a class to show this is a selected highlight
  const highlights = document.querySelectorAll(".highlight-selected")
  highlights.forEach((el) => {
    el.style.backgroundColor = "rgba(79, 70, 229, 0.3)"
    el.style.borderBottom = "2px solid rgba(79, 70, 229, 0.6)"
  })
}
