import type { Product } from '../types';

export const products: Product[] = [
  {
    id: '1', sku: 'BT-00001', name: 'Samsung French Door Refrigerator', slug: 'samsung-french-door',
    categoryId: '1', description: '<p>The Samsung French Door Refrigerator features a spacious interior with FlexZone™ technology. With a sleek stainless steel finish and energy-efficient operation, this refrigerator keeps your food fresh longer.</p><ul><li>28 cu. ft. capacity</li><li>Twin Cooling Plus™</li><li>Ice maker included</li></ul>',
    images: ['https://picsum.photos/seed/prod1a/600/600','https://picsum.photos/seed/prod1b/600/600','https://picsum.photos/seed/prod1c/600/600'],
    price: 1299.99, salePrice: 999.99, stock: 8, rating: 4.7, reviewCount: 89,
    specifications: [{key:'Capacity',value:'28 cu. ft.'},{key:'Color',value:'Stainless Steel'},{key:'Energy Rating',value:'A++'},{key:'Dimensions',value:'35.75" W x 70" H x 36.5" D'}],
    syncSource: 'manual', isActive: true, createdAt: '2025-06-01T10:00:00Z'
  },
  {
    id: '2', sku: 'BT-00002', name: 'LG InstaView Refrigerator', slug: 'lg-instaview',
    categoryId: '1', description: '<p>Knock twice to see inside without opening the door. The LG InstaView Door-in-Door® refrigerator features InstaView™ technology and SmartThinQ® WiFi connectivity.</p>',
    images: ['https://picsum.photos/seed/prod2a/600/600','https://picsum.photos/seed/prod2b/600/600'],
    price: 1599.99, stock: 12, rating: 4.8, reviewCount: 56,
    specifications: [{key:'Capacity',value:'26.2 cu. ft.'},{key:'Color',value:'Black Stainless'},{key:'Energy Rating',value:'A+'},{key:'Smart Features',value:'WiFi, Voice Control'}],
    syncSource: 'manual', isActive: true, createdAt: '2025-05-20T10:00:00Z'
  },
  {
    id: '3', sku: 'BT-00003', name: 'Bosch Front Load Washer', slug: 'bosch-front-load',
    categoryId: '2', description: '<p>Bosch 500 Series front-load washer with Home Connect™. Features SpeedPerfect™ option to wash loads up to 40% faster without compromising cleaning performance.</p>',
    images: ['https://picsum.photos/seed/prod3a/600/600','https://picsum.photos/seed/prod3b/600/600'],
    price: 899.99, salePrice: 749.99, stock: 3, rating: 4.6, reviewCount: 134,
    specifications: [{key:'Capacity',value:'2.2 cu. ft.'},{key:'Spin Speed',value:'1400 RPM'},{key:'Programs',value:'15'},{key:'Energy Rating',value:'A+++'}],
    syncSource: 'external', isActive: true, createdAt: '2025-06-05T10:00:00Z'
  },
  {
    id: '4', sku: 'BT-00004', name: 'Samsung EcoBubble Washer', slug: 'samsung-ecobubble',
    categoryId: '2', description: '<p>Samsung EcoBubble™ technology creates bubbles that penetrate fabric faster than dissolved detergent alone, for a gentle yet powerful clean even in cold water.</p>',
    images: ['https://picsum.photos/seed/prod4a/600/600','https://picsum.photos/seed/prod4b/600/600'],
    price: 699.99, stock: 20, rating: 4.4, reviewCount: 67,
    specifications: [{key:'Capacity',value:'9 kg'},{key:'Spin Speed',value:'1200 RPM'},{key:'Programs',value:'12'},{key:'Smart Features',value:'WiFi'}],
    syncSource: 'manual', isActive: true, createdAt: '2025-05-15T10:00:00Z'
  },
  {
    id: '5', sku: 'BT-00005', name: 'Daikin Split AC 1.5 Ton', slug: 'daikin-split-ac',
    categoryId: '4', description: '<p>Daikin 1.5 Ton 5 Star Inverter Split AC with PM 2.5 filter and Coanda Airflow for uniform cooling. Copper condenser for durability.</p>',
    images: ['https://picsum.photos/seed/prod5a/600/600','https://picsum.photos/seed/prod5b/600/600'],
    price: 549.99, salePrice: 479.99, stock: 25, rating: 4.5, reviewCount: 203,
    specifications: [{key:'Capacity',value:'1.5 Ton'},{key:'Star Rating',value:'5 Star'},{key:'Refrigerant',value:'R-32'},{key:'Annual Energy',value:'840 kWh'}],
    syncSource: 'manual', isActive: true, createdAt: '2025-06-07T10:00:00Z'
  },
  {
    id: '6', sku: 'BT-00006', name: 'LG Dual Inverter AC', slug: 'lg-dual-inverter-ac',
    categoryId: '4', description: '<p>LG 1.5 Ton Dual Inverter Split AC with HD Filter and Ocean Black Fin™. 4-way swing for comprehensive air circulation.</p>',
    images: ['https://picsum.photos/seed/prod6a/600/600','https://picsum.photos/seed/prod6b/600/600'],
    price: 649.99, stock: 18, rating: 4.3, reviewCount: 98,
    specifications: [{key:'Capacity',value:'1.5 Ton'},{key:'Star Rating',value:'3 Star'},{key:'Compressor',value:'Dual Inverter'}],
    syncSource: 'manual', isActive: true, createdAt: '2025-04-10T10:00:00Z'
  },
  {
    id: '7', sku: 'BT-00007', name: 'Samsung QLED 55" 4K TV', slug: 'samsung-qled-55',
    categoryId: '3', description: '<p>Samsung 55" QLED 4K Smart TV with Quantum Processor 4K. 100% Color Volume with Quantum Dot technology for stunning picture quality.</p>',
    images: ['https://picsum.photos/seed/prod7a/600/600','https://picsum.photos/seed/prod7b/600/600','https://picsum.photos/seed/prod7c/600/600'],
    price: 799.99, salePrice: 649.99, stock: 6, rating: 4.9, reviewCount: 312,
    specifications: [{key:'Screen Size',value:'55"'},{key:'Resolution',value:'4K UHD'},{key:'HDR',value:'Quantum HDR'},{key:'Smart TV',value:'Tizen OS'}],
    syncSource: 'manual', isActive: true, createdAt: '2025-06-08T10:00:00Z'
  },
  {
    id: '8', sku: 'BT-00008', name: 'LG OLED 65" TV', slug: 'lg-oled-65',
    categoryId: '3', description: '<p>LG 65" OLED evo TV with α9 Gen6 AI Processor 4K. Self-lit pixels deliver perfect blacks and infinite contrast.</p>',
    images: ['https://picsum.photos/seed/prod8a/600/600','https://picsum.photos/seed/prod8b/600/600'],
    price: 1899.99, stock: 4, rating: 4.8, reviewCount: 178,
    specifications: [{key:'Screen Size',value:'65"'},{key:'Resolution',value:'4K UHD'},{key:'Panel',value:'OLED evo'},{key:'Smart TV',value:'webOS'}],
    syncSource: 'external', isActive: true, createdAt: '2025-05-25T10:00:00Z'
  },
  {
    id: '9', sku: 'BT-00009', name: 'Panasonic Convection Microwave', slug: 'panasonic-convection',
    categoryId: '6', description: '<p>Panasonic 1.0 cu. ft. Countertop Microwave with Convection and Broil. Turbo Defrost speeds up defrosting time.</p>',
    images: ['https://picsum.photos/seed/prod9a/600/600'],
    price: 249.99, salePrice: 199.99, stock: 30, rating: 4.2, reviewCount: 45,
    specifications: [{key:'Capacity',value:'1.0 cu. ft.'},{key:'Wattage',value:'1000W'},{key:'Type',value:'Convection'}],
    syncSource: 'manual', isActive: true, createdAt: '2025-05-30T10:00:00Z'
  },
  {
    id: '10', sku: 'BT-00010', name: 'Samsung Smart Microwave', slug: 'samsung-smart-microwave',
    categoryId: '6', description: '<p>Samsung 1.1 cu. ft. Smart Countertop Microwave with Sensor Cook technology and Alexa built-in.</p>',
    images: ['https://picsum.photos/seed/prod10a/600/600'],
    price: 179.99, stock: 2, rating: 4.1, reviewCount: 23,
    specifications: [{key:'Capacity',value:'1.1 cu. ft.'},{key:'Wattage',value:'950W'},{key:'Smart Features',value:'Alexa Built-in'}],
    syncSource: 'manual', isActive: true, createdAt: '2025-04-20T10:00:00Z'
  },
  {
    id: '11', sku: 'BT-00011', name: 'Bosch Built-in Dishwasher', slug: 'bosch-dishwasher',
    categoryId: '6', description: '<p>Bosch 500 Series 24" Built-In Dishwasher with AutoAir™ Drying. PrecisionWash technology targets tough, stuck-on food from every angle.</p>',
    images: ['https://picsum.photos/seed/prod11a/600/600','https://picsum.photos/seed/prod11b/600/600'],
    price: 749.99, salePrice: 649.99, stock: 7, rating: 4.6, reviewCount: 87,
    specifications: [{key:'Place Settings',value:'16'},{key:'Noise Level',value:'44 dBA'},{key:'Programs',value:'5'},{key:'Energy Rating',value:'A+++'}],
    syncSource: 'manual', isActive: true, createdAt: '2025-05-28T10:00:00Z'
  },
  {
    id: '12', sku: 'BT-00012', name: 'Dyson V15 Detect Vacuum', slug: 'dyson-v15',
    categoryId: '5', description: '<p>Dyson V15 Detect Absolute cordless vacuum cleaner with laser dust detection. Piezo sensor counts and sizes microscopic particles.</p>',
    images: ['https://picsum.photos/seed/prod12a/600/600','https://picsum.photos/seed/prod12b/600/600'],
    price: 699.99, salePrice: 599.99, stock: 3, rating: 4.7, reviewCount: 256,
    specifications: [{key:'Suction Power',value:'230 AW'},{key:'Run Time',value:'Up to 60 min'},{key:'Weight',value:'6.8 lbs'},{key:'Bin Volume',value:'0.2 gal'}],
    syncSource: 'manual', isActive: true, createdAt: '2025-06-08T15:00:00Z'
  },
  {
    id: '13', sku: 'BT-00013', name: 'iRobot Roomba j7+', slug: 'irobot-roomba-j7',
    categoryId: '5', description: '<p>iRobot Roomba j7+ Self-Emptying Robot Vacuum. PrecisionVision Navigation identifies and avoids obstacles like pet waste and charging cords.</p>',
    images: ['https://picsum.photos/seed/prod13a/600/600'],
    price: 599.99, stock: 11, rating: 4.5, reviewCount: 189,
    specifications: [{key:'Navigation',value:'PrecisionVision'},{key:'Self-Emptying',value:'Yes'},{key:'Run Time',value:'75 min'},{key:'Smart Features',value:'iRobot OS'}],
    syncSource: 'manual', isActive: true, createdAt: '2025-05-18T10:00:00Z'
  },
  {
    id: '14', sku: 'BT-00014', name: 'KitchenAid Stand Mixer', slug: 'kitchenaid-mixer',
    categoryId: '6', description: '<p>KitchenAid Artisan Series 5-Quart Tilt-Head Stand Mixer. 10 speeds for nearly any task or recipe with a powerful motor.</p>',
    images: ['https://picsum.photos/seed/prod14a/600/600','https://picsum.photos/seed/prod14b/600/600'],
    price: 449.99, salePrice: 379.99, stock: 14, rating: 4.8, reviewCount: 421,
    specifications: [{key:'Capacity',value:'5 Quart'},{key:'Motor',value:'325 Watt'},{key:'Speeds',value:'10'},{key:'Included Attachments',value:'3'}],
    syncSource: 'manual', isActive: true, createdAt: '2025-06-07T12:00:00Z'
  },
  {
    id: '15', sku: 'BT-00015', name: 'Ninja Professional Blender', slug: 'ninja-blender',
    categoryId: '6', description: '<p>Ninja Professional Plus Blender with Auto-iQ. 1400 peak watts with 72 oz. Total Crushing Pitcher and single-serve cup.</p>',
    images: ['https://picsum.photos/seed/prod15a/600/600'],
    price: 129.99, stock: 40, rating: 4.4, reviewCount: 312,
    specifications: [{key:'Power',value:'1400W Peak'},{key:'Capacity',value:'72 oz'},{key:'Programs',value:'Auto-iQ'},{key:'BPA Free',value:'Yes'}],
    syncSource: 'manual', isActive: true, createdAt: '2025-06-06T10:00:00Z'
  },
  {
    id: '16', sku: 'BT-00016', name: 'Philips Air Fryer XXL', slug: 'philips-air-fryer',
    categoryId: '6', description: '<p>Philips Premium Airfryer XXL with Fat Removal Technology. Rapid Air circulation cooks food evenly for crispy results with up to 90% less fat.</p>',
    images: ['https://picsum.photos/seed/prod16a/600/600','https://picsum.photos/seed/prod16b/600/600'],
    price: 299.99, salePrice: 249.99, stock: 22, rating: 4.6, reviewCount: 567,
    specifications: [{key:'Capacity',value:'3 lbs / 7 qt'},{key:'Power',value:'2225W'},{key:'Programs',value:'5 Preset'},{key:'Dishwasher Safe',value:'Yes'}],
    syncSource: 'manual', isActive: true, createdAt: '2025-06-09T10:00:00Z'
  },
  {
    id: '17', sku: 'BT-00017', name: 'Whirlpool Top Load Washer', slug: 'whirlpool-top-load',
    categoryId: '2', description: '<p>Whirlpool 4.7 cu. ft. Top Load Washer with 2 in 1 Removable Agitator. Pretreat stains in the machine with the built-in faucet.</p>',
    images: ['https://picsum.photos/seed/prod17a/600/600'],
    price: 649.99, stock: 0, rating: 4.3, reviewCount: 92,
    specifications: [{key:'Capacity',value:'4.7 cu. ft.'},{key:'Agitator',value:'Removable'},{key:'Programs',value:'12'}],
    syncSource: 'manual', isActive: false, createdAt: '2025-03-15T10:00:00Z'
  },
  {
    id: '18', sku: 'BT-00018', name: 'Sony Bravia 75" 4K TV', slug: 'sony-bravia-75',
    categoryId: '3', description: '<p>Sony 75" Class BRAVIA XR X90L 4K HDR Full Array LED with Google TV. Cognitive Processor XR™ delivers incredibly lifelike picture quality.</p>',
    images: ['https://picsum.photos/seed/prod18a/600/600','https://picsum.photos/seed/prod18b/600/600'],
    price: 1499.99, salePrice: 1299.99, stock: 2, rating: 4.7, reviewCount: 145,
    specifications: [{key:'Screen Size',value:'75"'},{key:'Resolution',value:'4K UHD'},{key:'HDR',value:'Dolby Vision'},{key:'Smart TV',value:'Google TV'}],
    syncSource: 'external', isActive: true, createdAt: '2025-06-02T10:00:00Z'
  },
  {
    id: '19', sku: 'BT-00019', name: 'Miele Complete C3 Vacuum', slug: 'miele-complete-c3',
    categoryId: '5', description: '<p>Miele Complete C3 Calima canister vacuum with HEPA AirClean filter. Ideal for low-to-medium pile carpeting and hard floors.</p>',
    images: ['https://picsum.photos/seed/prod19a/600/600'],
    price: 899.99, stock: 5, rating: 4.6, reviewCount: 78,
    specifications: [{key:'Type',value:'Canister'},{key:'Filter',value:'HEPA AirClean'},{key:'Cord Length',value:'36 ft'},{key:'Weight',value:'10.6 lbs'}],
    syncSource: 'manual', isActive: true, createdAt: '2025-04-05T10:00:00Z'
  },
  {
    id: '20', sku: 'BT-00020', name: 'Carrier Inverter AC 2 Ton', slug: 'carrier-inverter-ac',
    categoryId: '4', description: '<p>Carrier 2 Ton Flexicool Inverter Split AC with Dual Filtration. PM 2.5 filter ensures clean air with Auto Cleanser technology.</p>',
    images: ['https://picsum.photos/seed/prod20a/600/600'],
    price: 799.99, salePrice: 699.99, stock: 10, rating: 4.4, reviewCount: 65,
    specifications: [{key:'Capacity',value:'2 Ton'},{key:'Star Rating',value:'5 Star'},{key:'Refrigerant',value:'R-32'},{key:'Compressor',value:'Inverter'}],
    syncSource: 'manual', isActive: true, createdAt: '2025-06-03T10:00:00Z'
  },
];
