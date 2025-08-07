import { faker } from '@faker-js/faker';

export class SampleDataUtils {
  // Noms de morceaux irlandais traditionnels inspirés
  static TUNE_NAME_TEMPLATES = [
    "The {adjective} {noun}",
    "{person}'s {object}",
    "The {place} {tune_type}",
    "{adjective} {person}",
    "The {number} {objects}"
  ];
  
  static ADJECTIVES = [
    "Old", "Young", "Wild", "Fair", "Dark", "Bonny", "Bold",
    "Merry", "Lonesome", "Foggy", "Windy", "Golden", "Silver",
    "Dancing", "Laughing", "Weeping", "Drowsy", "Lively"
  ];
  
  static NOUNS = [
    "Reel", "Jig", "Hornpipe", "Dancer", "Fiddler", "Piper",
    "Road", "Hill", "Glen", "Bay", "Rose", "Blackbird",
    "Sailor", "Maiden", "Cobbler", "Tinker", "Miller"
  ];
  
  static IRISH_PLACES = [
    "Dublin", "Cork", "Galway", "Killarney", "Dingle",
    "Donegal", "Connemara", "Achill", "Sligo", "Kerry",
    "Limerick", "Waterford", "Wicklow", "Mayo", "Clare"
  ];
  
  static IRISH_NAMES = [
    "O'Brien", "Murphy", "Kelly", "O'Sullivan", "Walsh",
    "McCarthy", "Fitzgerald", "O'Connor", "Byrne", "Ryan",
    "O'Neill", "O'Reilly", "Doyle", "McGrath", "Gallagher"
  ];
  
  static FIRST_NAMES = [
    "Sean", "Mairead", "Patrick", "Siobhan", "Michael",
    "Brigid", "John", "Kathleen", "Daniel", "Mary",
    "Liam", "Fiona", "Kevin", "Aoife", "Brendan"
  ];
  
  static VENUE_TYPES = [
    "Pub", "Hotel", "Community Centre", "Music Hall", "Bar",
    "Inn", "Lodge", "House", "Centre", "Club"
  ];
  
  static ALBUM_PREFIXES = [
    "Traditional Music of", "Songs from", "The Best of",
    "Celtic Sounds of", "Irish Music from", "Folk Songs of",
    "Melodies from", "Tunes from", "Music of", "Heritage of"
  ];
  
  static MUSICAL_KEYS = [
    "Ador", "Gmaj", "Dmaj", "Amaj", "Emaj", "Bmaj",
    "Cmaj", "Fmaj", "Bbmaj", "Dmin", "Gmin", "Cmin"
  ];
  
  static MUSICAL_METERS = [
    "4/4", "6/8", "9/8", "2/4", "3/4", "12/8"
  ];
  
  static ABC_NOTE_PATTERNS = [
    "ABAG FGAF | GFGA Bcdg | bagf gfed | cAGE FGAB |",
    "cdef gabc | defg abcd | gfed cBAG | ABCD EFGA |",
    "Adcg Bcdg | GABc defg | fedc BcAG | FGAB cdef |",
    "efga bcde | fgab cdef | abcf dcba | gfed cBAG |",
    "GFGA BGAF | GFGB AGFd | cBAG FGAc | BGAF G2 AG |"
  ];
  
  // Génération de nom de morceau
  static generateTuneName(): string {
    const template = faker.helpers.arrayElement(this.TUNE_NAME_TEMPLATES);
    
    return template
      .replace('{adjective}', faker.helpers.arrayElement(this.ADJECTIVES))
      .replace('{noun}', faker.helpers.arrayElement(this.NOUNS))
      .replace('{person}', faker.helpers.arrayElement(this.IRISH_NAMES))
      .replace('{object}', faker.helpers.arrayElement(this.NOUNS))
      .replace('{place}', faker.helpers.arrayElement(this.IRISH_PLACES))
      .replace('{tune_type}', faker.helpers.arrayElement(['Reel', 'Jig', 'Hornpipe']))
      .replace('{number}', faker.helpers.arrayElement(['Three', 'Four', 'Five', 'Seven']))
      .replace('{objects}', faker.helpers.arrayElement(['Reels', 'Jigs', 'Hornpipes', 'Dancers']));
  }
  
  // Génération de nom d'utilisateur irlandais
  static generateIrishUsername(): string {
    const firstName = faker.helpers.arrayElement(this.FIRST_NAMES);
    const lastName = faker.helpers.arrayElement(this.IRISH_NAMES);
    const variations = [
      `${firstName}${lastName}`,
      `${firstName}.${lastName}`,
      `${firstName}_${lastName}`,
      `${firstName}${faker.number.int({ min: 1, max: 99 })}`,
      `${lastName}${firstName}`,
      firstName.toLowerCase() + lastName.toLowerCase().replace("'", "")
    ];
    
    return faker.helpers.arrayElement(variations);
  }
  
  // Génération de nom de venue
  static generateVenueName(): string {
    const adjective = faker.helpers.arrayElement(this.ADJECTIVES);
    const noun = faker.helpers.arrayElement(this.NOUNS);
    const venueType = faker.helpers.arrayElement(this.VENUE_TYPES);
    const place = faker.helpers.arrayElement(this.IRISH_PLACES);
    
    const patterns = [
      `The ${adjective} ${noun}`,
      `${place} ${venueType}`,
      `O'${faker.helpers.arrayElement(this.IRISH_NAMES).replace("O'", "")} ${venueType}`,
      `The ${place} ${venueType}`,
      `${adjective} ${noun} ${venueType}`
    ];
    
    return faker.helpers.arrayElement(patterns);
  }
  
  // Génération de nom d'album
  static generateAlbumName(): string {
    const prefix = faker.helpers.arrayElement(this.ALBUM_PREFIXES);
    const place = faker.helpers.arrayElement(this.IRISH_PLACES);
    
    const patterns = [
      `${prefix} ${place}`,
      `${this.generateTuneName()}`,
      `Irish Traditional Music`,
      `Celtic Melodies`,
      `The ${faker.helpers.arrayElement(this.ADJECTIVES)} Collection`
    ];
    
    return faker.helpers.arrayElement(patterns);
  }
  
  // Génération de coordonnées dans une région
  static generateCoordinatesInRegion(
    centerLat: number,
    centerLng: number,
    radiusKm: number
  ): { latitude: number; longitude: number } {
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radiusKm;
    
    // Conversion approximative km vers degrés
    const deltaLat = (distance / 111) * Math.cos(angle);
    const deltaLng = (distance / (111 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle);
    
    return {
      latitude: Number((centerLat + deltaLat).toFixed(6)),
      longitude: Number((centerLng + deltaLng).toFixed(6))
    };
  }
  
  // Génération de notation ABC simplifiée
  static generateSimpleABC(tuneName: string): string {
    const key = faker.helpers.arrayElement(this.MUSICAL_KEYS);
    const meter = faker.helpers.arrayElement(this.MUSICAL_METERS);
    const pattern = faker.helpers.arrayElement(this.ABC_NOTE_PATTERNS);
    
    return `X:1\nT:${tuneName}\nM:${meter}\nK:${key}\n${pattern}`;
  }
  
  // Sélection pondérée de type de morceau
  static selectTuneTypeByDistribution(distribution: Record<string, number>): string {
    const random = Math.random();
    let cumulative = 0;
    
    for (const [type, weight] of Object.entries(distribution)) {
      cumulative += weight;
      if (random <= cumulative) {
        return type;
      }
    }
    
    return 'reel'; // fallback
  }
  
  // Génération de date aléatoire dans une plage
  static generateRandomDate(
    startYear: number = 2020,
    endYear: number = 2024
  ): string {
    const start = new Date(startYear, 0, 1);
    const end = new Date(endYear, 11, 31);
    const randomDate = faker.date.between({ from: start, to: end });
    return randomDate.toISOString().split('T')[0];
  }
  
  // Calcul de score de popularité basé sur les relations
  static calculatePopularityScore(
    recordingCount: number,
    aliasCount: number,
    settingCount: number,
    sessionMentions: number = 0
  ): number {
    // Score pondéré normalisé entre 0 et 1
    const score = (
      Math.min(recordingCount * 0.3, 0.3) +       // Max 30% pour recordings
      Math.min(aliasCount * 0.1, 0.2) +           // Max 20% pour aliases  
      Math.min(settingCount * 0.05, 0.2) +        // Max 20% pour settings
      Math.min(sessionMentions * 0.1, 0.3) +      // Max 30% pour mentions
      Math.random() * 0.1                         // 10% aléatoire
    );
    
    return Math.min(1.0, score);
  }
  
  // Génération d'adresse irlandaise
  static generateIrishAddress(): string {
    const streetNumber = faker.number.int({ min: 1, max: 200 });
    const streetNames = [
      'Main Street', 'Church Street', 'High Street', 'Market Street',
      'Bridge Street', 'Castle Street', 'Abbey Street', 'Mill Street'
    ];
    const street = faker.helpers.arrayElement(streetNames);
    const place = faker.helpers.arrayElement(this.IRISH_PLACES);
    
    return `${streetNumber} ${street}, ${place}`;
  }
}
