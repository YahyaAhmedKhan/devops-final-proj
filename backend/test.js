const generateRandomSeatNumber = () => {
  const getRandomChar = (min, max) => {
    const charCode = Math.floor(Math.random() * (max - min + 1)) + min
    return String.fromCharCode(charCode)
  }

  const randomLetter = getRandomChar(65, 90) // ASCII codes for capital letters
  const randomDigits = Math.floor(Math.random() * 100).toString().padStart(2, '0')

  return `${randomLetter}${randomDigits}`
}

console.log(generateRandomSeatNumber())
