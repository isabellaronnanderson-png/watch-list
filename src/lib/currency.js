// A small curated city -> currency symbol lookup. This is a personal-use
// app with freeform city text entry, so there's no live geocoding —
// just a reasonable list covering common travel destinations, with a
// sensible fallback.

const CURRENCY_BY_CITY = {
  // UK
  london: '£', manchester: '£', edinburgh: '£', bristol: '£', glasgow: '£',

  // Eurozone
  paris: '€', barcelona: '€', madrid: '€', rome: '€', milan: '€', florence: '€',
  venice: '€', naples: '€', athens: '€', amsterdam: '€', berlin: '€', munich: '€',
  lisbon: '€', porto: '€', dublin: '€', vienna: '€', brussels: '€', copenhagen: 'kr',
  prague: 'Kč', budapest: 'Ft',

  // Nordics
  stockholm: 'kr', gothenburg: 'kr', malmö: 'kr', malmo: 'kr', oslo: 'kr',
  helsinki: '€', reykjavik: 'kr',

  // Switzerland
  zurich: 'CHF', geneva: 'CHF', basel: 'CHF',

  // North America
  'new york': '$', 'los angeles': '$', 'san francisco': '$', chicago: '$',
  miami: '$', boston: '$', seattle: '$', austin: '$', 'las vegas': '$',
  toronto: 'C$', vancouver: 'C$', montreal: 'C$', 'mexico city': 'MX$',

  // Asia-Pacific
  tokyo: '¥', osaka: '¥', kyoto: '¥', seoul: '₩', 'hong kong': 'HK$',
  singapore: 'S$', bangkok: '฿', sydney: 'A$', melbourne: 'A$', auckland: 'NZ$',
  shanghai: '¥', beijing: '¥',

  // Middle East / other
  dubai: 'AED', 'tel aviv': '₪', istanbul: '₺'
};

export function currencyForCity(city) {
  if (!city) return '$';
  const key = city.trim().toLowerCase();
  return CURRENCY_BY_CITY[key] || '$';
}
