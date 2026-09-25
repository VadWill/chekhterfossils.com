// Pre-configured high-interest sample fossils from renowned world dig sites
// Users can click any sample to test immediately without searching their hard drive

export interface SampleFossil {
  id: string;
  title: string;
  species: string;
  category: string;
  formation: string;
  location: string;
  coordinates: { lat: number; lng: number };
  era: string;
  period: string;
  age: string;
  hint: string;
  thumbnailSvg: string;
}

export const SAMPLE_FOSSILS: SampleFossil[] = [
  {
    id: 'spino-tooth',
    title: 'Spinosaurus Predatory Tooth',
    species: 'Spinosaurus aegyptiacus',
    category: 'Vertebrate tooth',
    formation: 'Kem Kem Beds (Tegana Formation)',
    location: 'Taouz, Drâa-Tafilalet, Morocco',
    coordinates: { lat: 31.1492, lng: -4.0125 },
    era: 'Mesozoic',
    period: 'Late Cretaceous (Cenomanian)',
    age: '99 - 95 Ma',
    hint: 'Purchased in Erfoud, Morocco. Reddish sandstone matrix, conical ribbed enamel.',
    thumbnailSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" rx="16" fill="%232c2825"/><path d="M100 20 C110 50 145 110 135 160 C130 175 70 175 65 160 C55 110 90 50 100 20 Z" fill="%237c4826" stroke="%233a1e0d" stroke-width="4"/><path d="M96 35 C99 65 105 130 103 165" stroke="%239a5c32" stroke-width="3" fill="none" opacity="0.6"/><path d="M85 50 C89 80 86 135 80 162" stroke="%23562e14" stroke-width="2" fill="none" opacity="0.7"/><path d="M115 50 C111 80 114 135 120 162" stroke="%23562e14" stroke-width="2" fill="none" opacity="0.7"/><path d="M65 160 Q100 175 135 160 Q100 150 65 160" fill="%23483227"/><circle cx="100" cy="90" r="1.5" fill="%23d4a373" opacity="0.8"/><text x="100" y="190" text-anchor="middle" fill="%23e6d5bc" font-size="10" font-family="sans-serif" font-weight="bold">Kem Kem Tooth (Morocco)</text></svg>`
  },
  {
    id: 'ammonite-morocco',
    title: 'Cleoniceras Iridescent Ammonite',
    species: 'Cleoniceras besairiei',
    category: 'Mollusca / Cephalopod',
    formation: 'Albien Clays / Ambatolafia Deposits',
    location: 'Mahajanga Basin, Madagascar',
    coordinates: { lat: -15.7167, lng: 46.3167 },
    era: 'Mesozoic',
    period: 'Early Cretaceous (Albian)',
    age: '112 - 100 Ma',
    hint: 'Split and polished ammonite pair showing intricate fractal suture chambers and calcite filling.',
    thumbnailSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" rx="16" fill="%231a2325"/><circle cx="100" cy="100" r="75" fill="%23b8793b" stroke="%2367401c" stroke-width="4"/><path d="M100 25 A75 75 0 0 1 175 100 A58 58 0 0 1 117 158 A42 42 0 0 1 75 117 A28 28 0 0 1 100 89 A15 15 0 0 1 115 100" fill="none" stroke="%2345240c" stroke-width="5"/><circle cx="115" cy="100" r="6" fill="%23f4d06f"/><path d="M110 50 Q130 55 140 70 M145 90 Q150 110 135 125 M115 145 Q90 145 80 130" stroke="%23e9c46a" stroke-width="2.5" fill="none" stroke-linecap="round"/><text x="100" y="190" text-anchor="middle" fill="%23e6d5bc" font-size="10" font-family="sans-serif" font-weight="bold">Cleoniceras Ammonite</text></svg>`
  },
  {
    id: 'trilobite-wheeler',
    title: 'Elrathia Kingi Trilobite',
    species: 'Elrathia kingi',
    category: 'Arthropoda / Trilobite',
    formation: 'Wheeler Shale Formation',
    location: 'House Range, Millard County, Utah, USA',
    coordinates: { lat: 39.2311, lng: -113.3142 },
    era: 'Paleozoic',
    period: 'Middle Cambrian',
    age: '505 Ma',
    hint: 'Found in grey-black calcareous shale slab in western Utah. Distinct three-lobed cephalon and pygidium.',
    thumbnailSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" rx="16" fill="%232b2f33"/><ellipse cx="100" cy="98" rx="48" ry="68" fill="%231a1c1e" stroke="%233f4448" stroke-width="3"/><path d="M60 65 Q100 45 140 65 L135 80 Q100 70 65 80 Z" fill="%2332373c" stroke="%234f555c"/><ellipse cx="78" cy="62" rx="4" ry="7" fill="%238a929a"/><ellipse cx="122" cy="62" rx="4" ry="7" fill="%238a929a"/><path d="M70 85 L130 85 M72 98 L128 98 M75 110 L125 110 M78 122 L122 122 M82 134 L118 134" stroke="%235d646b" stroke-width="2.5"/><line x1="100" y1="55" x2="100" y2="155" stroke="%235d646b" stroke-width="2"/><text x="100" y="190" text-anchor="middle" fill="%23cad2d8" font-size="10" font-family="sans-serif" font-weight="bold">Elrathia Kingi (Utah, USA)</text></svg>`
  },
  {
    id: 'trex-tooth',
    title: 'Tyrannosaurus Rex Shed Tooth',
    species: 'Tyrannosaurus rex',
    category: 'Vertebrate tooth',
    formation: 'Hell Creek Formation (Garfield Quarry)',
    location: 'Jordan, Garfield County, Montana, USA',
    coordinates: { lat: 47.3217, lng: -106.9103 },
    era: 'Mesozoic',
    period: 'Late Cretaceous (Maastrichtian)',
    age: '66.5 Ma',
    hint: 'D-shaped robust cross-section with fine serrated denticles on carinae and dark brown enamel.',
    thumbnailSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" rx="16" fill="%2324201c"/><path d="M110 25 C125 50 140 100 130 160 C125 170 70 165 72 150 C75 105 95 50 110 25 Z" fill="%233e2c1c" stroke="%2321150b" stroke-width="4"/><path d="M110 25 C125 50 140 100 130 160" stroke="%23c49a6c" stroke-width="2" stroke-dasharray="2,2"/><path d="M90 60 C98 85 96 125 90 150" stroke="%235c432d" stroke-width="3" fill="none"/><text x="100" y="190" text-anchor="middle" fill="%23e8d7c3" font-size="10" font-family="sans-serif" font-weight="bold">T. Rex Tooth (Hell Creek)</text></svg>`
  },
  {
    id: 'megalodon-tooth',
    title: 'Otodus Megalodon Shark Tooth',
    species: 'Otodus megalodon',
    category: 'Vertebrate tooth',
    formation: 'Bone Valley Formation / Peace River',
    location: 'Hardee County, Florida, USA',
    coordinates: { lat: 27.5256, lng: -81.8087 },
    era: 'Cenozoic',
    period: 'Miocene / Pliocene',
    age: '15.9 - 3.6 Ma',
    hint: 'Large chevron-shaped tooth with characteristic bourrelet (V-shaped neck) and serrated cutting edges.',
    thumbnailSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" rx="16" fill="%231d2729"/><path d="M60 45 C80 60 120 60 140 45 C155 70 145 90 135 100 C115 135 100 170 100 170 C100 170 85 135 65 100 C55 90 45 70 60 45 Z" fill="%23566567" stroke="%232b3536" stroke-width="4"/><path d="M60 45 C80 60 120 60 140 45 C135 75 65 75 60 45 Z" fill="%232c3335"/><path d="M80 65 L100 95 L120 65" fill="%233e4a4c" stroke="%23232829"/><text x="100" y="190" text-anchor="middle" fill="%23cbe0e2" font-size="10" font-family="sans-serif" font-weight="bold">Megalodon (Bone Valley, FL)</text></svg>`
  }
];
