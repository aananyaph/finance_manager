export function getCategory(description: string): string {
  const text = description.toLowerCase();

  if (
    text.includes("salary") ||
    text.includes("payroll") ||
    text.includes("income")
  )
    return "Salary";

  if (
    text.includes("swiggy") ||
    text.includes("zomato") ||
    text.includes("restaurant") ||
    text.includes("food")
  )
    return "Food";

  if (
    text.includes("uber") ||
    text.includes("ola") ||
    text.includes("rapido") ||
    text.includes("metro")
  )
    return "Transport";

  if (
    text.includes("amazon") ||
    text.includes("flipkart") ||
    text.includes("myntra")
  )
    return "Shopping";

  if (
    text.includes("fuel") ||
    text.includes("petrol") ||
    text.includes("indian oil") ||
    text.includes("hp")
  )
    return "Fuel";

  if (
    text.includes("electricity") ||
    text.includes("bescom") ||
    text.includes("water")
  )
    return "Utilities";

  if (
    text.includes("netflix") ||
    text.includes("spotify") ||
    text.includes("bookmyshow")
  )
    return "Entertainment";

  if (
    text.includes("apollo") ||
    text.includes("hospital") ||
    text.includes("pharmacy")
  )
    return "Healthcare";

  if (
    text.includes("coursera") ||
    text.includes("udemy")
  )
    return "Education";

  return "Others";
}