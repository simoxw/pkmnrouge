import { Elite4Region } from '../types';

export const ELITE4_REGIONS: Elite4Region[] = [
  {
    region: 'Kanto',
    baseLevel: 50,
    trainers: [
      {
        name: 'Lorelei',
        isChampion: false,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lorelei.png',
        intro: 'Benvenuto nella Pokémon League! Sono Lorelei dell\'Elite Four. Nessuno può battermi quando si tratta di Pokémon di ghiaccio. Le mosse congelanti sono potenti! I tuoi Pokémon saranno alla mia mercé quando saranno congelati solidi! Ahaha! Sei pronto?',
        outro: 'Sei meglio di quanto pensassi! Vai avanti! Hai solo assaggiato il potere della Pokémon League!',
        pokemonIds: [87, 91, 80, 124, 131]
      },
      {
        name: 'Bruno',
        isChampion: false,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/bruno.png',
        intro: 'Sono Bruno dell\'Elite Four! Attraverso il mio allenamento rigoroso, ho elevato i miei Pokémon e me stesso! Sono imbattibili! Per favore, mostrami la tua forza!',
        outro: 'Perché... Perché ho perso? Non capisco... Ma il vincitore è tu! Vai avanti!',
        pokemonIds: [95, 107, 106, 95, 68]
      },
      {
        name: 'Agatha',
        isChampion: false,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/agatha.png',
        intro: 'Io sono Agatha dell\'Elite Four. Osservo i fantasmi e i Pokémon oscuri da 50 anni. Non permetterò a un giovane come te di sconfiggermi! Non ho vissuto invano! Vieni!',
        outro: 'Ah ah ah! Sei un allenatore eccezionale! I giovani come te dovrebbero sfidare la Champion! Vai avanti!',
        pokemonIds: [94, 42, 93, 24, 94]
      },
      {
        name: 'Lance',
        isChampion: false,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lance.png',
        intro: 'Sono Lance, il più forte dei quattro dell\'Elite Four! Puoi chiamarmi il drago domatore! Non hai possibilità se non hai sconfitto i miei colleghi! Preparati a perdere!',
        outro: 'È finita... Ora vai! La Champion ti aspetta!',
        pokemonIds: [130, 148, 148, 142, 149]
      },
      {
        name: 'Blue',
        isChampion: true,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/blue.png',
        intro: 'Io sono il Campione! Sono il più forte allenatore di Pokémon! Non ho perso mai! Non perderò mai! Perché io sono il Campione! Vieni!',
        outro: 'NOOOO! Non è possibile! Io... io sono il Campione! Non posso perdere! Ma... sei forte... Vai avanti...',
        pokemonIds: [18, 65, 112, 103, 130, 6]
      }
    ]
  },
  {
    region: 'Johto',
    baseLevel: 58,
    trainers: [
      {
        name: 'Will',
        isChampion: false,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/will.png',
        intro: 'Io sono Will! Preparati a essere sconfitto dai miei Pokémon psichici! Nessuno può resistere al mio potere!',
        outro: 'Anche se ho perso, non sono arrabbiato. Vai avanti!',
        pokemonIds: [178, 124, 80, 103, 178]
      },
      {
        name: 'Koga',
        isChampion: false,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/koga.png',
        intro: 'Fwahahaha! Io sono Koga dell\'Elite Four! I miei Pokémon velenosi ti faranno pentire di essere nato! Preparati!',
        outro: 'Ah! Hai vinto! Non mi aspettavo questo! Vai avanti!',
        pokemonIds: [168, 49, 205, 89, 169]
      },
      {
        name: 'Bruno',
        isChampion: false,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/bruno.png',
        intro: 'Sono Bruno dell\'Elite Four! Attraverso il mio allenamento rigoroso, ho elevato i miei Pokémon e me stesso! Sono imbattibili! Per favore, mostrami la tua forza!',
        outro: 'Perché... Perché ho perso? Non capisco... Ma il vincitore è tu! Vai avanti!',
        pokemonIds: [237, 106, 107, 95, 68]
      },
      {
        name: 'Karen',
        isChampion: false,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/karen.png',
        intro: 'Io sono Karen, l\'ultima dell\'Elite Four! Sei arrivato fin qui, ma non andrai oltre! I miei Pokémon oscuri ti distruggeranno!',
        outro: 'Forti... Sei molto forte. Vai avanti!',
        pokemonIds: [197, 134, 198, 229, 229]
      },
      {
        name: 'Lance',
        isChampion: true,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lance.png',
        intro: 'Sono Lance, il più forte dei quattro dell\'Elite Four! Puoi chiamarmi il drago domatore! Non hai possibilità se non hai sconfitto i miei colleghi! Preparati a perdere!',
        outro: 'È finita... Ora vai! La Champion ti aspetta!',
        pokemonIds: [130, 148, 148, 230, 142, 149]
      }
    ]
  },
  {
    region: 'Hoenn',
    baseLevel: 66,
    trainers: [
      {
        name: 'Sidney',
        isChampion: false,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/sidney.png',
        intro: 'Io sono Sidney dell\'Elite Four! Ti mostrerò la vera paura! Preparati!',
        outro: 'Bene... Vai avanti. La prossima sfida ti aspetta.',
        pokemonIds: [262, 275, 332, 342, 359]
      },
      {
        name: 'Phoebe',
        isChampion: false,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/phoebe.png',
        intro: 'Io sono Phoebe dell\'Elite Four. Ti mostrerò perché i Pokémon fantasma sono i più spaventosi!',
        outro: 'Oh, wow. Sei forte. Vai avanti.',
        pokemonIds: [356, 354, 302, 354, 356]
      },
      {
        name: 'Glacia',
        isChampion: false,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/glacia.png',
        intro: 'Io sono Glacia dell\'Elite Four. Preparati a essere congelato!',
        outro: 'Sei forte. Vai avanti.',
        pokemonIds: [362, 364, 364, 362, 365]
      },
      {
        name: 'Drake',
        isChampion: false,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/drake.png',
        intro: 'Io sono Drake dell\'Elite Four. I miei draghi ti faranno a pezzi!',
        outro: 'Ottimo lavoro. Vai avanti.',
        pokemonIds: [372, 334, 330, 330, 373, 230]
      },
      {
        name: 'Steven',
        isChampion: true,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/steven.png',
        intro: 'Io sono Steven, il Campione della regione di Hoenn. Ti mostrerò il potere dei Pokémon di acciaio!',
        outro: 'Sei forte. Vai avanti e diventa più forte.',
        pokemonIds: [227, 344, 306, 346, 348, 376]
      }
    ]
  },
  {
    region: 'Sinnoh',
    baseLevel: 74,
    trainers: [
      {
        name: 'Aaron',
        isChampion: false,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/aaron.png',
        intro: 'Io sono Aaron dell\'Elite Four. I miei Pokémon coleottero ti faranno pentire!',
        outro: 'Sei forte. Vai avanti.',
        pokemonIds: [269, 267, 416, 214, 452]
      },
      {
        name: 'Bertha',
        isChampion: false,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/bertha.png',
        intro: 'Io sono Bertha dell\'Elite Four. Preparati alla mia forza!',
        outro: 'Sei forte. Vai avanti.',
        pokemonIds: [340, 76, 185, 449, 464]
      },
      {
        name: 'Flint',
        isChampion: false,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/flint.png',
        intro: 'Io sono Flint dell\'Elite Four. I miei Pokémon fuoco ti bruceranno!',
        outro: 'Sei forte. Vai avanti.',
        pokemonIds: [78, 208, 428, 426, 392]
      },
      {
        name: 'Lucian',
        isChampion: false,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lucian.png',
        intro: 'Io sono Lucian dell\'Elite Four. I miei Pokémon psichici ti confonderanno!',
        outro: 'Sei forte. Vai avanti.',
        pokemonIds: [122, 196, 475, 65, 437]
      },
      {
        name: 'Cynthia',
        isChampion: true,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/cynthia.png',
        intro: 'Io sono Cynthia, la Campionessa di Sinnoh. Preparati alla mia sfida!',
        outro: 'Sei forte. Vai avanti.',
        pokemonIds: [442, 407, 423, 448, 350, 445]
      }
    ]
  },
  {
    region: 'Unova',
    baseLevel: 82,
    trainers: [
      {
        name: 'Shauntal',
        isChampion: false,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/shauntal.png',
        intro: 'Io sono Shauntal dell\'Elite Four. I miei Pokémon fantasma ti spaventeranno!',
        outro: 'Sei forte. Vai avanti.',
        pokemonIds: [563, 593, 609, 623, 426]
      },
      {
        name: 'Marshal',
        isChampion: false,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/marshal.png',
        intro: 'Io sono Marshal dell\'Elite Four. Preparati alla mia forza!',
        outro: 'Sei forte. Vai avanti.',
        pokemonIds: [538, 539, 534, 620, 640]
      },
      {
        name: 'Grimsley',
        isChampion: false,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/grimsley.png',
        intro: 'Io sono Grimsley dell\'Elite Four. I miei Pokémon oscuri ti sconfiggeranno!',
        outro: 'Sei forte. Vai avanti.',
        pokemonIds: [560, 553, 555, 625, 571]
      },
      {
        name: 'Caitlin',
        isChampion: false,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/caitlin.png',
        intro: 'Io sono Caitlin dell\'Elite Four. I miei Pokémon psichici ti confonderanno!',
        outro: 'Sei forte. Vai avanti.',
        pokemonIds: [518, 561, 576, 579, 576]
      },
      {
        name: 'Alder',
        isChampion: true,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/alder.png',
        intro: 'Io sono Alder, il Campione di Unova. Preparati!',
        outro: 'Sei forte. Vai avanti.',
        pokemonIds: [617, 534, 584, 589, 626, 636]
      }
    ]
  },
  {
    region: 'Kalos',
    baseLevel: 90,
    trainers: [
      {
        name: 'Malva',
        isChampion: false,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/malva.png',
        intro: 'Io sono Malva dell\'Elite Four. I miei Pokémon fuoco ti bruceranno!',
        outro: 'Sei forte. Vai avanti.',
        pokemonIds: [668, 324, 609, 663, 668]
      },
      {
        name: 'Siebold',
        isChampion: false,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/siebold.png',
        intro: 'Io sono Siebold dell\'Elite Four. I miei Pokémon acqua ti annegheranno!',
        outro: 'Sei forte. Vai avanti.',
        pokemonIds: [693, 130, 121, 691, 689]
      },
      {
        name: 'Wikstrom',
        isChampion: false,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/wikstrom.png',
        intro: 'Io sono Wikstrom dell\'Elite Four. I miei Pokémon acciaio ti schiacceranno!',
        outro: 'Sei forte. Vai avanti.',
        pokemonIds: [476, 212, 448, 681, 707]
      },
      {
        name: 'Drasna',
        isChampion: false,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/drasna.png',
        intro: 'Io sono Drasna dell\'Elite Four. I miei draghi ti faranno a pezzi!',
        outro: 'Sei forte. Vai avanti.',
        pokemonIds: [691, 621, 334, 715, 691]
      },
      {
        name: 'Diantha',
        isChampion: true,
        spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/diantha.png',
        intro: 'Io sono Diantha, la Campionessa di Kalos. Preparati alla mia sfida!',
        outro: 'Sei forte. Vai avanti.',
        pokemonIds: [697, 699, 685, 701, 711, 706]
      }
    ]
  }
];