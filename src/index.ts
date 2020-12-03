const from =
  'ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆÍÌÎÏŇÑÓÖÒÔÕØŘŔŠŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇíìîïňñóöòôõøðřŕšťúůüùûýÿžþÞĐđßÆa·/_,:;'

const to =
  'AAAAAACCCDEEEEEEEEIIIINNOOOOOORRSTUUUUUYYZaaaaaacccdeeeeeeeeiiiinnooooooorrstuuuuuyyzbBDdBAa------'

const removeAccents = (str: string) => {
  let newStr = str.slice(0)

  for (let i = 0; i < from.length; i++) {
    newStr = newStr.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
  }

  return newStr
}

// Based on: https://github.com/vtex-apps/search-result/blob/master/react/utils/slug.ts
// Parameter "S. Coifman" should output "s--coifman"
export function slugify(str: string) {
  // According to Bacelar, the search API uses a legacy method for slugifying strings.
  // replaces special characters with dashes, remove accents and lower cases everything
  const replaced = str.replace(/[*+~.()'"!:@&[\]`,/ %$#?{}|><=_^]/g, '-')

  return removeAccents(replaced).toLowerCase()
}
