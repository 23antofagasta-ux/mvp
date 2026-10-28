import {
  PetSpecies,
  Teacher,
  Student,
  ShopItem,
  StarRewardCategory,
  StarDeductionCategory,
  PetNeed,
  HabitatOption,
  DailyQuest
} from '../types';

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'teacher-1',
    name: 'Budi Santoso, S.Pd (Wali Kelas)',
    pin: '1234',
    email: 'budi.guru@sekolah.id',
    createdAt: new Date().toISOString()
  },
  {
    id: 'teacher-2',
    name: 'Siti Rahma, M.Pd (Guru IPA)',
    pin: '5678',
    email: 'siti.guru@sekolah.id',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_PET_SPECIES: PetSpecies[] = [
  {
    id: 'kucing',
    name: 'Kucing Manis',
    description: 'Hewan mamalia berbulu halus, suka dielus, ramah dan mendengkur manja.',
    category: 'mamalia',
    stages: [
      { name: 'Bayi Kucing Mungil', minLevel: 1, minStars: 0, vectorType: 'cat_baby', description: 'Masih mungil, suka minum susu dan tidur di pangkuan.' },
      { name: 'Kucing Cilik Lucu', minLevel: 3, minStars: 5, vectorType: 'cat_child', description: 'Mulai lincah melompat dan mengejar bola benang.' },
      { name: 'Kucing Remaja Tangkas', minLevel: 6, minStars: 15, vectorType: 'cat_teen', description: 'Pandai berburu mainan dan sangat setia menemani belajar.' },
      { name: 'Kucing Dewasa Juara', minLevel: 10, minStars: 30, vectorType: 'cat_adult', description: 'Kucing anggun bermahkota, lambang ketelitian dan kasih sayang.' }
    ]
  },
  {
    id: 'naga',
    name: 'Naga Cilik',
    description: 'Makhluk mitologi gagah dengan semburan api pelangi dan sayap kecil menggemaskan.',
    category: 'fantasi',
    stages: [
      { name: 'Telur Naga Kristal', minLevel: 1, minStars: 0, vectorType: 'dragon_egg', description: 'Telur ajaib berkilauan yang memancarkan kehangatan.' },
      { name: 'Naga Bayi Sayap Mungil', minLevel: 3, minStars: 5, vectorType: 'dragon_child', description: 'Belajar mengepakkan sayap dan menyemburkan percikan kembang api.' },
      { name: 'Naga Remaja Berapi Biru', minLevel: 6, minStars: 15, vectorType: 'dragon_teen', description: 'Mampu melayang tinggi dan melindungi sahabatnya dengan gagah.' },
      { name: 'Naga Pelindung Kerajaan', minLevel: 10, minStars: 30, vectorType: 'dragon_adult', description: 'Naga emas legendaris dengan kebijaksanaan tiada tara.' }
    ]
  },
  {
    id: 'kelinci',
    name: 'Kelinci Lincah',
    description: 'Telinga panjang yang menggemaskan, gemar melompat dan mengunyah wortel segar.',
    category: 'mamalia',
    stages: [
      { name: 'Bayi Kelinci Kapas', minLevel: 1, minStars: 0, vectorType: 'rabbit_baby', description: 'Segumpal bulu seputih salju dengan hidung kedut-kedut.' },
      { name: 'Kelinci Cilik Melompat', minLevel: 3, minStars: 5, vectorType: 'rabbit_child', description: 'Sangat gesit melompati rintangan dan menyukai camilan sayur.' },
      { name: 'Kelinci Remaja Gesit', minLevel: 6, minStars: 15, vectorType: 'rabbit_teen', description: 'Memiliki pendengaran tajam dan langkah yang super cepat.' },
      { name: 'Kelinci Bintang Cemerlang', minLevel: 10, minStars: 30, vectorType: 'rabbit_adult', description: 'Kelinci ajaib penjelajah dengan aura bintang kemilau.' }
    ]
  },
  {
    id: 'panda',
    name: 'Panda Ceria',
    description: 'Panda bertubuh bulat hitam-putih yang doyan bambu segar dan suka berguling riang.',
    category: 'mamalia',
    stages: [
      { name: 'Bayi Panda Merah Muda', minLevel: 1, minStars: 0, vectorType: 'panda_baby', description: 'Bayi panda mungil yang hangat dan menggemaskan.' },
      { name: 'Anak Panda Berguling', minLevel: 3, minStars: 5, vectorType: 'panda_child', description: 'Mulai belajar memanjat pohon bambu dan gemar bermain guling.' },
      { name: 'Panda Remaja Ceria', minLevel: 6, minStars: 15, vectorType: 'panda_teen', description: 'Kuat memegang batang bambu dan selalu ceria tersenyum.' },
      { name: 'Pendekar Panda Sakti', minLevel: 10, minStars: 30, vectorType: 'panda_adult', description: 'Panda bijaksana yang melambangkan ketenangan jiwa dan ketekunan.' }
    ]
  },
  {
    id: 'shiba',
    name: 'Anjing Shiba',
    description: 'Anjing setia dengan senyum ceria, ekor melingkar, dan semangat pantang menyerah.',
    category: 'mamalia',
    stages: [
      { name: 'Anak Shiba Pipi Bulat', minLevel: 1, minStars: 0, vectorType: 'shiba_baby', description: 'Suka menggoyang ekor dan penasaran dengan segala hal baru.' },
      { name: 'Shiba Cilik Penjaga', minLevel: 3, minStars: 5, vectorType: 'shiba_child', description: 'Pandai menangkap bola karet dan rajin menyambut tuan sahabatnya.' },
      { name: 'Shiba Remaja Setia', minLevel: 6, minStars: 15, vectorType: 'shiba_teen', description: 'Pemberani, disiplin, dan tangkas dalam segala tantangan.' },
      { name: 'Shiba Sang Juara Sejati', minLevel: 10, minStars: 30, vectorType: 'shiba_adult', description: 'Sahabat setia berkalung medali kehormatan.' }
    ]
  },
  {
    id: 'owl',
    name: 'Burung Hantu Bijak',
    description: 'Burung berwawasan luas, mata besar tajam, dan pemikir cerdas penjelajah malam.',
    category: 'unggas',
    stages: [
      { name: 'Telur Kristal Pohon Kuno', minLevel: 1, minStars: 0, vectorType: 'owl_egg', description: 'Telur berbintik misterius di sarang pohon kebijaksanaan.' },
      { name: 'Anak Burung Bulu Halus', minLevel: 3, minStars: 5, vectorType: 'owl_child', description: 'Mata bulat besar yang gemar membaca buku dan mengamati bintang.' },
      { name: 'Burung Hantu Pelajar', minLevel: 6, minStars: 15, vectorType: 'owl_teen', description: 'Memakai kacamata pintar dan menguasai berbagai ilmu pengetahuan.' },
      { name: 'Profesor Burung Hantu Akbar', minLevel: 10, minStars: 30, vectorType: 'owl_adult', description: 'Penjaga perpustakaan agung Kerajaan Satwa dengan topi toga wisuda.' }
    ]
  },
  {
    id: 'hamster',
    name: 'Hamster Penurut',
    description: 'Hewan saku menggemaskan dengan pipi tembam penyimpan biji bunga matahari.',
    category: 'mamalia',
    stages: [
      { name: 'Bayi Hamster Merah Muda', minLevel: 1, minStars: 0, vectorType: 'hamster_baby', description: 'Bayi mungil yang tidur melingkar di serbuk kayu lembut.' },
      { name: 'Hamster Cilik Pipi Chubby', minLevel: 3, minStars: 5, vectorType: 'hamster_child', description: 'Suka berlari di roda putar dan memamah biji kuaci.' },
      { name: 'Hamster Remaja Akrobat', minLevel: 6, minStars: 15, vectorType: 'hamster_teen', description: 'Lincah memanjat terowongan labirin warna-warni.' },
      { name: 'Hamster Raja Pipit Emas', minLevel: 10, minStars: 30, vectorType: 'hamster_adult', description: 'Hamster juara dengan mahkota mungil dan pipi paling berkilau.' }
    ]
  },
  {
    id: 'iguana',
    name: 'Iguana Eksotis',
    description: 'Reptil tropis tenang dengan sisik berkilau dan kemampuan berjemur di bawah mentari.',
    category: 'reptil',
    stages: [
      { name: 'Telur Pasir Hangat', minLevel: 1, minStars: 0, vectorType: 'iguana_egg', description: 'Telur bertekstur kulit lembut yang terlindungi pasir hangat.' },
      { name: 'Iguana Bayi Zamrud', minLevel: 3, minStars: 5, vectorType: 'iguana_child', description: 'Warna hijau terang segar dan suka memanjat dahan jemur.' },
      { name: 'Iguana Remaja Berduri Indah', minLevel: 6, minStars: 15, vectorType: 'iguana_teen', description: 'Punggung berduri artistik dan tenang mengamati sekitar.' },
      { name: 'Iguana Raja Rimba Tropis', minLevel: 10, minStars: 30, vectorType: 'iguana_adult', description: 'Reptil megah yang menyatu anggun dengan pesona alam tropis.' }
    ]
  },
  {
    id: 'kurakura',
    name: 'Kura-kura Brazil',
    description: 'Tempurung kokoh bergaris indah, perenang ulung yang tekun dan pantang menyerah.',
    category: 'reptil',
    stages: [
      { name: 'Telur Pantai Pasir Putih', minLevel: 1, minStars: 0, vectorType: 'turtle_egg', description: 'Telur bulat terlindung pasir pantai yang hangat.' },
      { name: 'Tukik Cilik Berenang', minLevel: 3, minStars: 5, vectorType: 'turtle_child', description: 'Tukik mungil yang langsung mencari air dan berenang riang.' },
      { name: 'Kura-kura Remaja Gesit', minLevel: 6, minStars: 15, vectorType: 'turtle_teen', description: 'Tempurung semakin kuat dan pintar menyelam mencari lumut.' },
      { name: 'Kura-kura Samudra Bijaksana', minLevel: 10, minStars: 30, vectorType: 'turtle_adult', description: 'Kura-kura samudera berumur panjang lambang ketekunan dan kesabaran.' }
    ]
  },
  {
    id: 'nemo',
    name: 'Ikan Nemo (Badut)',
    description: 'Ikan badut oranye cerah bergaris putih yang lincah menari di anemon laut.',
    category: 'akuatik',
    stages: [
      { name: 'Telur Gelembung Terumbu', minLevel: 1, minStars: 0, vectorType: 'fish_egg', description: 'Gumpalan telur transparan yang menempel di anemon laut karang.' },
      { name: 'Burayak Ikan Mungil', minLevel: 3, minStars: 5, vectorType: 'fish_child', description: 'Ikan kecil yang mulai belajar berenang melawan arus sepoi.' },
      { name: 'Ikan Nemo Remaja Cepat', minLevel: 6, minStars: 15, vectorType: 'fish_teen', description: 'Garis putihnya mulai menyala indah di antara terumbu karang.' },
      { name: 'Pangeran Terumbu Karang', minLevel: 10, minStars: 30, vectorType: 'fish_adult', description: 'Ikan bercahaya keemasan penjelajah palung laut yang berani.' }
    ]
  },
  {
    id: 'kakatua',
    name: 'Kakatua Cerdas',
    description: 'Burung tropis berjambul indah yang pandai menirukan suara dan suka menyanyi riang.',
    category: 'unggas',
    stages: [
      { name: 'Telur Sarang Pohon Kenari', minLevel: 1, minStars: 0, vectorType: 'parrot_egg', description: 'Telur putih bersih di lubang pohon hutan hujan.' },
      { name: 'Pikik Kakatua Berjambul', minLevel: 3, minStars: 5, vectorType: 'parrot_child', description: 'Mulai tumbuh jambul kuning dan gemar berkicau merdu.' },
      { name: 'Kakatua Remaja Pandai Bicara', minLevel: 6, minStars: 15, vectorType: 'parrot_teen', description: 'Pandai menyapa guru dan memecahkan teka-teki logika.' },
      { name: 'Kakatua Paduka Suara Emas', minLevel: 10, minStars: 30, vectorType: 'parrot_adult', description: 'Penyanyi agung bersayap putih bersih dengan mahkota emas megah.' }
    ]
  },
  {
    id: 'sembrani',
    name: 'Kuda Sembrani',
    description: 'Kuda gagah bersayap bidadari yang mampu melesat menembus awan dan pelangi langit.',
    category: 'fantasi',
    stages: [
      { name: 'Telur Awan Bintang', minLevel: 1, minStars: 0, vectorType: 'pegasus_egg', description: 'Telur kristal yang mengapung di atas awan putih lembut.' },
      { name: 'Kuda Anak Berbintik Bintang', minLevel: 3, minStars: 5, vectorType: 'pegasus_child', description: 'Kaki mungil yang lincah menari di padang rumput angkasa.' },
      { name: 'Sembrani Remaja Bersayap Perak', minLevel: 6, minStars: 15, vectorType: 'pegasus_teen', description: 'Mulai terbang melintasi pelangi dan menyinari kegelapan.' },
      { name: 'Raja Sembrani Galaksi', minLevel: 10, minStars: 30, vectorType: 'pegasus_adult', description: 'Kuda terbang legendaris bermahkota bintang kejora pelindung dunia.' }
    ]
  },
  {
    id: 'panda_imut',
    name: 'Panda Merah Imut',
    description: 'Mamalia imut berekor tebal belang dengan wajah manis dan sifat ramah mempesona.',
    category: 'mamalia',
    stages: [
      { name: 'Bayi Panda Merah Salju', minLevel: 1, minStars: 0, vectorType: 'redpanda_baby', description: 'Bayi mungil berbulu oranye hangat meringkuk di pohon bambu.' },
      { name: 'Anak Panda Merah Lincah', minLevel: 3, minStars: 5, vectorType: 'redpanda_child', description: 'Pandai memanjat dahan dan senang makan buah beri manis.' },
      { name: 'Panda Merah Remaja Cekatan', minLevel: 6, minStars: 15, vectorType: 'redpanda_teen', description: 'Ekor lebat bergaris melambai anggun saat menyeimbangkan langkah.' },
      { name: 'Panda Merah Raja Gunung Mistis', minLevel: 10, minStars: 30, vectorType: 'redpanda_adult', description: 'Penguasa gunung berkabut yang penuh aura damai dan keberuntungan.' }
    ]
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'student-1',
    name: 'Ahmad Fauzi',
    nisn: '0012345678',
    className: 'Kelas 4A',
    petSpeciesId: 'kucing',
    petNickname: 'Milo Si Juara',
    stars: 12,
    level: 4,
    xp: 340,
    evolutionStage: 1,
    needs: { hunger: 85, thirst: 90, hygiene: 75, happiness: 95, energy: 80 },
    inventory: { 'item-apple': 3, 'item-milk': 2, 'item-soap': 1, 'item-ball': 1 },
    equippedAccessories: ['item-hat-grad'],
    equippedHabitat: {
      background: 'hab-bg-bedroom',
      furniture: 'hab-fur-bed',
      ornament: 'hab-orn-trophy'
    },
    unlockedHabitats: ['hab-bg-bedroom', 'hab-fur-bed', 'hab-orn-trophy'],
    isSleeping: false,
    currentNeedId: 'need-1'
  },
  {
    id: 'student-2',
    name: 'Annisa Putri',
    nisn: '0012345679',
    className: 'Kelas 4A',
    petSpeciesId: 'kelinci',
    petNickname: 'Snowy Ceria',
    stars: 18,
    level: 6,
    xp: 620,
    evolutionStage: 2,
    needs: { hunger: 70, thirst: 60, hygiene: 85, happiness: 80, energy: 70 },
    inventory: { 'item-carrot': 4, 'item-juice': 2, 'item-soap': 2 },
    equippedAccessories: ['item-ribbon'],
    equippedHabitat: {
      background: 'hab-bg-garden',
      furniture: 'hab-fur-sofa',
      ornament: 'hab-orn-plant'
    },
    unlockedHabitats: ['hab-bg-bedroom', 'hab-bg-garden', 'hab-fur-bed', 'hab-fur-sofa', 'hab-orn-plant'],
    isSleeping: false,
    currentNeedId: 'need-3'
  },
  {
    id: 'student-3',
    name: 'Bintang Pratama',
    nisn: '0012345680',
    className: 'Kelas 4B',
    petSpeciesId: 'naga',
    petNickname: 'Draco Api Sakti',
    stars: 25,
    level: 8,
    xp: 890,
    evolutionStage: 2,
    needs: { hunger: 90, thirst: 85, hygiene: 90, happiness: 90, energy: 95 },
    inventory: { 'item-meat': 5, 'item-potion': 1, 'item-frisbee': 1 },
    equippedAccessories: ['item-glasses'],
    equippedHabitat: {
      background: 'hab-bg-castle',
      furniture: 'hab-fur-treehouse',
      ornament: 'hab-orn-lamp'
    },
    unlockedHabitats: ['hab-bg-bedroom', 'hab-bg-castle', 'hab-fur-bed', 'hab-fur-treehouse', 'hab-orn-lamp'],
    isSleeping: false,
    currentNeedId: 'need-2'
  },
  {
    id: 'student-4',
    name: 'Citra Dewi',
    nisn: '0012345681',
    className: 'Kelas 4B',
    petSpeciesId: 'panda',
    petNickname: 'Bao Bao Gemoy',
    stars: 32,
    level: 10,
    xp: 1200,
    evolutionStage: 3,
    needs: { hunger: 100, thirst: 95, hygiene: 95, happiness: 100, energy: 90 },
    inventory: { 'item-bamboo': 5, 'item-tea': 3, 'item-bubble': 2 },
    equippedAccessories: ['item-crown'],
    equippedHabitat: {
      background: 'hab-bg-jungle',
      furniture: 'hab-fur-sofa',
      ornament: 'hab-orn-aquarium'
    },
    unlockedHabitats: ['hab-bg-bedroom', 'hab-bg-jungle', 'hab-fur-sofa', 'hab-orn-aquarium', 'hab-orn-trophy'],
    isSleeping: false,
    currentNeedId: 'need-5'
  }
];

export const INITIAL_SHOP_ITEMS: ShopItem[] = [
  // Makanan
  {
    id: 'item-apple',
    name: 'Apel Manis Segar',
    category: 'makanan',
    price: 1,
    boosts: { hunger: 25, happiness: 10 },
    icon: '🍎',
    description: 'Apel merah kaya vitamin, mengenyangkan dan membuat pet berenergi.',
    unlockLevel: 1,
    inStock: true
  },
  {
    id: 'item-carrot',
    name: 'Wortel Renyah',
    category: 'makanan',
    price: 1,
    boosts: { hunger: 25, happiness: 10 },
    icon: '🥕',
    description: 'Wortel segar kaya beta-karoten, sangat disukai kelinci dan hewan kecil.',
    unlockLevel: 1,
    inStock: true
  },
  {
    id: 'item-fish',
    name: 'Ikan Tuna Lezat',
    category: 'makanan',
    price: 2,
    boosts: { hunger: 35, happiness: 15 },
    icon: '🐟',
    description: 'Ikan gurih bernutrisi tinggi, favorit kucing dan hewan karnivora.',
    unlockLevel: 2,
    inStock: true
  },
  {
    id: 'item-meat',
    name: 'Daging Panggang Spesial',
    category: 'makanan',
    price: 3,
    boosts: { hunger: 45, energy: 20, happiness: 15 },
    icon: '🍖',
    description: 'Daging lezat berprotein tinggi untuk stamina dan kekuatan tubuh pet.',
    unlockLevel: 3,
    inStock: true
  },
  {
    id: 'item-bamboo',
    name: 'Rebung Bambu Hijau',
    category: 'makanan',
    price: 2,
    boosts: { hunger: 30, happiness: 20 },
    icon: '🎋',
    description: 'Bambu muda segar kesukaan panda dan pemakan tumbuhan rimba.',
    unlockLevel: 1,
    inStock: true
  },

  // Minuman
  {
    id: 'item-water',
    name: 'Air Mineral Pegunungan',
    category: 'minuman',
    price: 1,
    boosts: { thirst: 30, energy: 10 },
    icon: '💧',
    description: 'Air bersih sejuk alami untuk menjaga hidrasi dan kesegaran tubuh pet.',
    unlockLevel: 1,
    inStock: true
  },
  {
    id: 'item-milk',
    name: 'Susu Sapi Segar',
    category: 'minuman',
    price: 2,
    boosts: { thirst: 35, hunger: 15, energy: 15 },
    icon: '🥛',
    description: 'Susu hangat berkalsium tinggi agar tulang pet tumbuh kuat dan sehat.',
    unlockLevel: 1,
    inStock: true
  },
  {
    id: 'item-juice',
    name: 'Jus Buah Pelangi',
    category: 'minuman',
    price: 2,
    boosts: { thirst: 40, happiness: 20 },
    icon: '🧃',
    description: 'Jus aneka buah segar dengan rasa manis segar yang membangkitkan mood.',
    unlockLevel: 2,
    inStock: true
  },
  {
    id: 'item-potion',
    name: 'Ramuan Energi Ajaib',
    category: 'minuman',
    price: 4,
    boosts: { thirst: 50, energy: 50, happiness: 25 },
    icon: '🧪',
    description: 'Eliksir berkilau yang langsung memulihkan tenaga pet secara instan.',
    unlockLevel: 4,
    inStock: true
  },

  // Sabun & Kebersihan
  {
    id: 'item-soap',
    name: 'Sabun Mandi Wangi Bunga',
    category: 'sabun',
    price: 1,
    boosts: { hygiene: 30, happiness: 10 },
    icon: '🧼',
    description: 'Sabun lembut berbusa wangi lavender untuk membasmi kuman dan kotoran.',
    unlockLevel: 1,
    inStock: true
  },
  {
    id: 'item-bubble',
    name: 'Shampoo Busa Pelangi',
    category: 'sabun',
    price: 2,
    boosts: { hygiene: 45, happiness: 20 },
    icon: '🫧',
    description: 'Busa gelembung ajaib warna-warni yang membuat bulu pet harum mengkilap.',
    unlockLevel: 2,
    inStock: true
  },
  {
    id: 'item-brush',
    name: 'Sikat Bulu Pijat Emas',
    category: 'sabun',
    price: 3,
    boosts: { hygiene: 40, happiness: 30 },
    icon: '🪥',
    description: 'Menyisir bulu sekaligus memberikan pijatan relaksasi pada tubuh pet.',
    unlockLevel: 3,
    inStock: true
  },

  // Mainan
  {
    id: 'item-ball',
    name: 'Bola Karet Pantul',
    category: 'mainan',
    price: 2,
    boosts: { happiness: 35, energy: -10 },
    icon: '🎾',
    description: 'Bola karet memantul tinggi untuk dimainkan bersama pet kesayangan.',
    unlockLevel: 1,
    inStock: true
  },
  {
    id: 'item-frisbee',
    name: 'Piring Terbang Luar Angkasa',
    category: 'mainan',
    price: 3,
    boosts: { happiness: 45, energy: -15 },
    icon: '🥏',
    description: 'Frisbee melayang jauh melatih ketangkasan melompat di lapangan.',
    unlockLevel: 2,
    inStock: true
  },
  {
    id: 'item-yarn',
    name: 'Gulungan Benang Sutra',
    category: 'mainan',
    price: 2,
    boosts: { happiness: 30, energy: -5 },
    icon: '🧶',
    description: 'Benang rajut empuk yang sangat menyenangkan digulung-gulung.',
    unlockLevel: 1,
    inStock: true
  },

  // Aksesoris
  {
    id: 'item-hat-grad',
    name: 'Topi Wisuda Cilik',
    category: 'aksesoris',
    price: 4,
    boosts: { happiness: 25 },
    icon: '🎓',
    description: 'Topi toga kehormatan untuk pet pintar yang rajin belajar.',
    unlockLevel: 2,
    inStock: true
  },
  {
    id: 'item-glasses',
    name: 'Kacamata Cerdas Neon',
    category: 'aksesoris',
    price: 4,
    boosts: { happiness: 25 },
    icon: '👓',
    description: 'Kacamata gaya intelektual membuat pet tampil seperti ilmuwan cilik.',
    unlockLevel: 3,
    inStock: true
  },
  {
    id: 'item-ribbon',
    name: 'Pita Sutra Emas',
    category: 'aksesoris',
    price: 3,
    boosts: { happiness: 20 },
    icon: '🎀',
    description: 'Pita manis berwarna emas mewah untuk mempercantik penampilan pet.',
    unlockLevel: 2,
    inStock: true
  },
  {
    id: 'item-crown',
    name: 'Mahkota Juara MVP',
    category: 'aksesoris',
    price: 8,
    boosts: { happiness: 50 },
    icon: '👑',
    description: 'Mahkota emas bertahtakan permata biru untuk pet teladan kerajaan.',
    unlockLevel: 5,
    inStock: true
  }
];

export const INITIAL_PET_NEEDS: PetNeed[] = [
  {
    id: 'need-1',
    text: 'Perutku bunyi keroncongan, pengen makan apel manis! 🍎',
    icon: '🍎',
    category: 'makanan',
    targetItemId: 'item-apple',
    rewardXp: 35,
    rewardProgress: 20
  },
  {
    id: 'need-2',
    text: 'Tenggorokanku haus, butuh susu sapi hangat atau air segar! 🥛',
    icon: '🥛',
    category: 'minuman',
    targetItemId: 'item-milk',
    rewardXp: 35,
    rewardProgress: 20
  },
  {
    id: 'need-3',
    text: 'Badanku gatal kena debu, ayo mandikan aku dengan sabun wangi! 🧼',
    icon: '🧼',
    category: 'sabun',
    targetItemId: 'item-soap',
    rewardXp: 40,
    rewardProgress: 25
  },
  {
    id: 'need-4',
    text: 'Aku bosan banget di kamar, ayo lempar bola mainan! 🎾',
    icon: '🎾',
    category: 'mainan',
    targetItemId: 'item-ball',
    rewardXp: 40,
    rewardProgress: 25
  },
  {
    id: 'need-5',
    text: 'Mau tampil keren nih, pakaikan aku aksesoris cantik! 🎀',
    icon: '🎀',
    category: 'aksesoris',
    rewardXp: 30,
    rewardProgress: 15
  },
  {
    id: 'need-6',
    text: 'Hati terasa sepi, elus sayang kepalaku dong temanku! 💕',
    icon: '❤️',
    category: 'elus',
    rewardXp: 25,
    rewardProgress: 15
  },
  {
    id: 'need-7',
    text: 'Mataku mengantuk berat, biarkan aku tidur istirahat sejenak! 💤',
    icon: '💤',
    category: 'tidur',
    rewardXp: 25,
    rewardProgress: 15
  }
];

export const INITIAL_REWARD_CATEGORIES: StarRewardCategory[] = [
  {
    id: 'rew-perfect-score',
    name: 'Nilai Sempurna (Tugas/Ulangan)',
    stars: 3,
    icon: '💯',
    description: 'Mendapat nilai 100 atau hasil belajar luar biasa pada asesmen harian.'
  },
  {
    id: 'rew-discipline',
    name: 'Disiplin & Tepat Waktu',
    stars: 2,
    icon: '⏰',
    description: 'Hadir di kelas tepat waktu dan menyelesaikan tugas sebelum batas akhir.'
  },
  {
    id: 'rew-cooperation',
    name: 'Gotong Royong & Menolong Teman',
    stars: 2,
    icon: '🤝',
    description: 'Membantu teman yang kesulitan dan bekerja sama dengan baik dalam kelompok.'
  },
  {
    id: 'rew-cleanliness',
    name: 'Kerapian Meja & Kebersihan Kelas',
    stars: 1,
    icon: '🧹',
    description: 'Menjaga meja belajar tetap rapi dan melaksanakan piket kelas dengan ikhlas.'
  },
  {
    id: 'rew-active-asking',
    name: 'Aktif Bertanya & Percaya Diri',
    stars: 1,
    icon: '🙋',
    description: 'Berani menyampaikan gagasan, bertanya, atau mempresentasikan jawaban.'
  },
  {
    id: 'rew-reading',
    name: 'Literasi Membaca Buku',
    stars: 2,
    icon: '📚',
    description: 'Membaca buku di pojok baca dan menceritakan rangkuman cerita.'
  }
];

export const INITIAL_DEDUCTION_CATEGORIES: StarDeductionCategory[] = [
  {
    id: 'ded-forgot-homework',
    name: 'Lupa Mengerjakan PR',
    stars: 1,
    icon: '📝',
    description: 'Tidak membawa tugas rumah yang telah disepakati bersama.'
  },
  {
    id: 'ded-late',
    name: 'Terlambat Masuk Kelas',
    stars: 1,
    icon: '🏃',
    description: 'Masuk ruangan setelah bel pembelajaran berbunyi tanpa izin.'
  },
  {
    id: 'ded-disturbing',
    name: 'Mengganggu Teman Belajar',
    stars: 1,
    icon: '📢',
    description: 'Membuat kegaduhan saat guru atau teman lain sedang mempresentasikan materi.'
  },
  {
    id: 'ded-littering',
    name: 'Membuang Sampah Sembarangan',
    stars: 1,
    icon: '🚯',
    description: 'Meninggalkan bungkus makanan di laci meja atau lantai kelas.'
  },
  {
    id: 'ded-impolite',
    name: 'Berkata Kurang Sopan',
    stars: 2,
    icon: '⚠️',
    description: 'Mengucapkan kata yang menyinggung perasaan teman atau guru.'
  }
];

export const HABITAT_OPTIONS: HabitatOption[] = [
  // Latar Belakang (Ruangan)
  {
    id: 'hab-bg-bedroom',
    name: 'Kamar Tidur Nyaman',
    type: 'background',
    previewColor: 'from-amber-100 via-orange-50 to-amber-200',
    icon: '🛏️',
    price: 0,
    description: 'Kamar hangat bernuansa kayu dengan jendela mentari pagi.',
    unlockLevel: 1
  },
  {
    id: 'hab-bg-garden',
    name: 'Taman Bunga Ajaib',
    type: 'background',
    previewColor: 'from-emerald-100 via-teal-50 to-green-200',
    icon: '🌸',
    price: 3,
    description: 'Taman bunga mekar penuh pelangi dan kupu-kupu menari.',
    unlockLevel: 2
  },
  {
    id: 'hab-bg-jungle',
    name: 'Hutan Tropis Rimba',
    type: 'background',
    previewColor: 'from-green-200 via-emerald-100 to-lime-200',
    icon: '🌴',
    price: 5,
    description: 'Rindang pohon kanopi tropis dengan gemericik air terjun.',
    unlockLevel: 4
  },
  {
    id: 'hab-bg-beach',
    name: 'Pantai Tropis Senja',
    type: 'background',
    previewColor: 'from-orange-200 via-amber-100 to-sky-200',
    icon: '🏖️',
    price: 6,
    description: 'Pasir putih hangat dengan ombak sepoi dan kelapa melambai.',
    unlockLevel: 5
  },
  {
    id: 'hab-bg-castle',
    name: 'Istana Kerajaan Bintang',
    type: 'background',
    previewColor: 'from-indigo-200 via-purple-100 to-pink-200',
    icon: '🏰',
    price: 8,
    description: 'Istana megah megapolitan bintang dengan pilar kristal bercahaya.',
    unlockLevel: 7
  },
  {
    id: 'hab-bg-aurora',
    name: 'Kutub Salju Aurora',
    type: 'background',
    previewColor: 'from-cyan-200 via-sky-100 to-indigo-200',
    icon: '❄️',
    price: 10,
    description: 'Hamparan salju abadi diterangi cahaya aurora hijau-ungu magis.',
    unlockLevel: 9
  },

  // Perabotan (Furniture)
  {
    id: 'hab-fur-bed',
    name: 'Kasur Awan Mewah',
    type: 'furniture',
    previewColor: 'bg-indigo-50',
    icon: '☁️',
    price: 0,
    description: 'Kasur busa lembut bagai memeluk awan di langit tinggi.',
    unlockLevel: 1
  },
  {
    id: 'hab-fur-sofa',
    name: 'Sofa Beludru Kerajaan',
    type: 'furniture',
    previewColor: 'bg-rose-50',
    icon: '🛋️',
    price: 3,
    description: 'Sofa santai dengan bantalan beludru merah berkelas tinggi.',
    unlockLevel: 3
  },
  {
    id: 'hab-fur-treehouse',
    name: 'Rumah Pohon Mini',
    type: 'furniture',
    previewColor: 'bg-amber-50',
    icon: '🏡',
    price: 5,
    description: 'Tempat bertengger kayu bertingkat favorit memanjat dan intip.',
    unlockLevel: 5
  },
  {
    id: 'hab-fur-desk',
    name: 'Meja Belajar Pintar',
    type: 'furniture',
    previewColor: 'bg-blue-50',
    icon: '📖',
    price: 4,
    description: 'Meja kayu mungil lengkap dengan tumpukan ensiklopedia satwa.',
    unlockLevel: 4
  },
  {
    id: 'hab-fur-lantern',
    name: 'Lentera Kristal Bintang',
    type: 'furniture',
    previewColor: 'bg-yellow-50',
    icon: '🏮',
    price: 6,
    description: 'Lampu gantung antik memancarkan sinar hangat yang menenangkan.',
    unlockLevel: 6
  },

  // Ornamen & Tanaman
  {
    id: 'hab-orn-none',
    name: 'Tanpa Ornamen Tambahan',
    type: 'ornament',
    previewColor: 'bg-slate-50',
    icon: '➖',
    price: 0,
    description: 'Ruangan bersih dan minimalis.',
    unlockLevel: 1
  },
  {
    id: 'hab-orn-aquarium',
    name: 'Akuarium Ikan Neon',
    type: 'ornament',
    previewColor: 'bg-teal-50',
    icon: '🐠',
    price: 4,
    description: 'Akuarium bulat dengan ikan neon berkilauan di dalam air bening.',
    unlockLevel: 3
  },
  {
    id: 'hab-orn-plant',
    name: 'Tanaman Monstera Hijau',
    type: 'ornament',
    previewColor: 'bg-emerald-50',
    icon: '🪴',
    price: 2,
    description: 'Pot tanaman daun segar yang menghadirkan oksigen bersih.',
    unlockLevel: 2
  },
  {
    id: 'hab-orn-trophy',
    name: 'Piala Emas Siswa Teladan',
    type: 'ornament',
    previewColor: 'bg-amber-50',
    icon: '🏆',
    price: 5,
    description: 'Piala emas kejuaraan lambang kerja keras dan prestasi gemilang.',
    unlockLevel: 4
  },
  {
    id: 'hab-orn-balloon',
    name: 'Balon Pesta Ceria',
    type: 'ornament',
    previewColor: 'bg-pink-50',
    icon: '🎈',
    price: 2,
    description: 'Sekumpulan balon warna-warni yang selalu mengapung ceria.',
    unlockLevel: 2
  },
  {
    id: 'hab-orn-musicbox',
    name: 'Kotak Musik Ajaib',
    type: 'ornament',
    previewColor: 'bg-purple-50',
    icon: '🎶',
    price: 6,
    description: 'Kotak kayu yang memutar melodi merdu penenang hati pet.',
    unlockLevel: 6
  }
];

export const INITIAL_DAILY_QUESTS: DailyQuest[] = [
  {
    id: 'quest-feed',
    title: 'Perut Kenyang Hati Senang',
    description: 'Beri makan atau minum hewan peliharaan 2 kali hari ini.',
    category: 'feed',
    target: 2,
    current: 0,
    xpReward: 40,
    starReward: 1,
    completed: false,
    claimed: false
  },
  {
    id: 'quest-clean',
    title: 'Pet Bersih Wangi Segar',
    description: 'Mandikan pet dengan sabun atau shampoo busa.',
    category: 'clean',
    target: 1,
    current: 0,
    xpReward: 30,
    starReward: 1,
    completed: false,
    claimed: false
  },
  {
    id: 'quest-pet',
    title: 'Belaian Kasih Sayang',
    description: 'Elus sayang hewan peliharaanmu sebanyak 3 kali.',
    category: 'pet',
    target: 3,
    current: 0,
    xpReward: 30,
    starReward: 1,
    completed: false,
    claimed: false
  },
  {
    id: 'quest-minigame',
    title: 'Juara Mini-Game Edukasi',
    description: 'Selesaikan 1 sesi permainan mini-game apa saja.',
    category: 'minigame',
    target: 1,
    current: 0,
    xpReward: 50,
    starReward: 2,
    completed: false,
    claimed: false
  }
];

export const ANIMAL_TRIVIA_QUESTIONS = [
  {
    id: 'q1',
    question: 'Berdasarkan jenis makanannya, hewan pemakan tumbuhan seperti sapi, kelinci, dan kuda disebut kelompok...',
    options: ['Karnivora', 'Herbivora', 'Omnivora', 'Insektivora'],
    correctIndex: 1,
    explanation: 'Hebat! Herbivora adalah kelompok hewan yang makanannya berasal dari tumbuh-tumbuhan seperti rumput, daun, sayur, dan buah.'
  },
  {
    id: 'q2',
    question: 'Kucing sering mengeluarkan suara dengkuran halus (purring). Hal ini biasanya menandakan bahwa kucing sedang...',
    options: ['Merasa nyaman dan bahagia', 'Sedang marah', 'Kedinginan sekali', 'Ingin berburu tikus'],
    correctIndex: 0,
    explanation: 'Benar sekali! Kucing mendengkur (purr) saat merasa sangat nyaman, dicintai, aman, atau sedang rileks bersama pemiliknya.'
  },
  {
    id: 'q3',
    question: 'Hewan seperti beruang kutub melakukan tidur panjang di musim dingin yang sangat dingin untuk menghemat energi. Perilaku ini disebut...',
    options: ['Kamuflase', 'Hibernasi', 'Metamorfosis', 'Mimikri'],
    correctIndex: 1,
    explanation: 'Tepat! Hibernasi adalah kondisi istirahat mendalam atau tidur panjang hewan saat musim dingin yang ekstrem.'
  },
  {
    id: 'q4',
    question: 'Ayam, bebek, burung hantu, dan kakatua berkembang biak dengan cara bertelur yang disebut...',
    options: ['Vivipar (Melahirkan)', 'Ovipar (Bertelur)', 'Ovovivipar (Bertelur-Melahirkan)', 'Fragmentasi'],
    correctIndex: 1,
    explanation: 'Tepat sekali! Ovipar adalah perkembangbiakan hewan dengan cara bertelur. Embrio berkembang di dalam cangkang telur di luar tubuh induk.'
  },
  {
    id: 'q5',
    question: 'Anjing sering menjulurkan lidahnya dan bernapas cepat (panting) saat hari panas. Tujuan utamanya adalah...',
    options: ['Mencari makanan', 'Menurunkan suhu tubuh agar sejuk', 'Menakuti musuh', 'Membersihkan gigi'],
    correctIndex: 1,
    explanation: 'Pintar! Karena anjing tidak memiliki kelenjar keringat di seluruh tubuh seperti manusia, mereka menjulurkan lidah untuk mendinginkan suhu tubuh.'
  },
  {
    id: 'q6',
    question: 'Hewan pemakan daging seperti singa, harimau, dan elang disebut...',
    options: ['Herbivora', 'Karnivora', 'Omnivora', 'Frugivora'],
    correctIndex: 1,
    explanation: 'Benar! Karnivora adalah hewan pemangsa daging yang memiliki gigi taring tajam atau paruh kuat untuk merobek mangsa.'
  },
  {
    id: 'q7',
    question: 'Hewan yang memakan tumbuhan dan juga memakan daging (pemakan segalanya) seperti ayam, bebek, dan tikus disebut...',
    options: ['Omnivora', 'Herbivora', 'Karnivora', 'Detritivora'],
    correctIndex: 0,
    explanation: 'Hebat! Omnivora adalah hewan pemakan segala (tumbuhan sekaligus hewan/daging).'
  },
  {
    id: 'q8',
    question: 'Kemampuan hewan mengubah warna tubuhnya menyerupai lingkungan sekitar agar terhindar dari pemangsa disebut...',
    options: ['Kamuflase', 'Ekolokasi', 'Autotomi', 'Hibernasi'],
    correctIndex: 0,
    explanation: 'Tepat! Kamuflase membantu hewan menyamarkan diri dengan warna dedaunan, pasir, atau ranting pohon.'
  }
];

export const ANIMAL_DIET_PAIRS = [
  { animal: 'Kucing Manis', icon: '🐱', food: 'Ikan Segar', foodIcon: '🐟', sound: 'Meong!' },
  { animal: 'Kelinci Lincah', icon: '🐰', food: 'Wortel Renyah', foodIcon: '🥕', sound: 'Cuit-cuit!' },
  { animal: 'Panda Ceria', icon: '🐼', food: 'Bambu Hijau', foodIcon: '🎋', sound: 'Nyam-nyam!' },
  { animal: 'Singa Raja', icon: '🦁', food: 'Daging Panggang', foodIcon: '🍖', sound: 'Roaaar!' },
  { animal: 'Monyet Cerdik', icon: '🐒', food: 'Pisang Manis', foodIcon: '🍌', sound: 'Uu-aa!' },
  { animal: 'Sapi Perah', icon: '🐄', food: 'Rumput Segar', foodIcon: '🌿', sound: 'Mooo!' }
];

export const MEMORY_CARD_PAIRS = [
  { id: 'cat', name: 'Kucing Manis', emoji: '🐱', bg: 'bg-amber-100 text-amber-700' },
  { id: 'rabbit', name: 'Kelinci Lincah', emoji: '🐰', bg: 'bg-rose-100 text-rose-700' },
  { id: 'panda', name: 'Panda Ceria', emoji: '🐼', bg: 'bg-emerald-100 text-emerald-700' },
  { id: 'dragon', name: 'Naga Cilik', emoji: '🐲', bg: 'bg-purple-100 text-purple-700' },
  { id: 'owl', name: 'Burung Hantu', emoji: '🦉', bg: 'bg-indigo-100 text-indigo-700' },
  { id: 'shiba', name: 'Anjing Shiba', emoji: '🐕', bg: 'bg-orange-100 text-orange-700' }
];
