async function getWords() : Promise<string[] | null> {
  // return ["hi", "stupid", "mark", "where", "catch", "mountain"]
  try {
    const res = await fetch("https://random-word-api.vercel.app/api?words=400")
    const data = await res.json()
    return data
  }
  catch {
    console.error("failed to fetch words")
    return null
  }
}

export {getWords}