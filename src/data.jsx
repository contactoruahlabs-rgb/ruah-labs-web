/* global React */
// ============================================================
// RUAH LABS — Default content + content store
// ============================================================

async function hashPwd(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str.trim().toLowerCase()));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function sanitize(str) {
  if (typeof DOMPurify !== 'undefined') return DOMPurify.sanitize(str, { ALLOWED_TAGS: [] });
  return String(str || '').replace(/<[^>]*>/g, '');
}

const DEFAULT_CONTENT = {
  brand: {
    name: 'RUAH LABS',
    tagline: 'LABORATORIO CREATIVO',
    instagram: '@ruahlabs',
    location: 'Santiago, Chile · Envíos a todo Chile',
    adminPasswordHash: '765dad31d1a783887b6ba0933852f9234778ae0e6d0ba34a648f76e08ef0c2fe',
    clubPasswordHash: '7fcd3df7dc2fff173c22ea6450ede4f11b3e27c7923816aab660d474e27df8c2',
  },
  theme: {
    ivory: '#f5f1e8',
    amber: '#eca10c',
    gray:  '#6b6b62',
    black: '#0a0a0a',
  },
  typography: {
    // Section title maxes (px)
    heroMax: 220,
    sectionMax: 120,
    aboutTitleMax: 120,
    protocolTitleMax: 140,
    servicesTitleMax: 120,
    productsTitleMax: 120,
    cuadrosTitleMax: 140,
    iglesiasTitleMax: 120,
    manifestoMax: 92,
    testimonialsTitleMax: 120,
    ctaMax: 160,
    wordmarkMax: 280,
    clubTitleMax: 140,

    // Component-level sizes
    productTitle: 32,
    testiQuote: 31,
    pillarTitle: 36,
    statNum: 100,
    iglesiasServiceName: 24,
    iglesiasProjectName: 38,
    iglesiasPortfolioTitle: 92,
    iglesiasFormTitle: 72,
    iglesiasFeatureName: 88,
    cuadrosStyleTag: 18,
    cuadrosBriefTitle: 64,
    cuadrosStepNum: 38,
    cuadrosRefName: 56,
    cuadrosFormatNum: 36,
    protocolFlowName: 15,
    protocolSectionHd: 13,
    protocolQuote: 20,
    clubPanelBig: 64,
    clubRouteName: 22,
    clubMeetingDay: 36,
    clubGateTitle: 64,
    clubHeroTitle: 120,
    clubSectionTitle: 56,
    clubBody: 16,

    // Newly exposed per-element sizes (full text control)
    servicesNum: 14,
    servicesName: 60,
    servicesDesc: 16,
    productsVerse: 13,
    productsPrice: 30,
    protocolFlowDet: 14,
    cuadrosLede: 15,
    iglesiasLede: 16,
    eventosEyebrow: 14,
    eventosBlockTitle: 40,
    testiName: 14,
    testiRole: 14,
    ctaBody: 20,
    footerAbout: 15,
    footerColTitle: 14,
    footerColItem: 15,
    catChip: 13,
    navLogo: 32,

    // Body / labels
    bodyBase: 19,
    lede: 21,
    label: 14,
    navBrand: 24,
    navLink: 11,
    serifWeight: 400,
    monoWeight: 400,
  },
  nav: {
    links: [
      { id: 'l0', label: 'Quiénes Somos', href: '#nosotros' },
      { id: 'l3', label: 'Protocolo 1×1', href: '#protocolo' },
      { id: 'l2', label: 'Productos',     href: '#productos', dropdown: true },
      { id: 'l1', label: 'Servicios',     href: '#servicios' },
      { id: 'l5', label: 'Cuadros',       href: '#cuadros' },
      { id: 'l6', label: 'Iglesias',      href: '#iglesias' },
      { id: 'l7', label: 'Evento',        href: '#evento' },
      { id: 'l4', label: 'Comunidad',     href: '#comunidad' },
      { id: 'l8', label: 'Personalizados', href: '#design' },
    ],
    cta: { label: 'Cotizar', href: '#contacto' },
  },
  colors: {
    // All values default to empty string ('') — when empty the design uses its
    // built-in default. Setting any value applies it globally as --c-<key>.
  },
  home: {
    intro: {
      eyebrow: 'SANTIAGO · CHILE · EST. 2023',
      text: 'Diseñamos y estampamos para iglesias, marcas y eventos. Cada prenda activa el Protocolo 1×1 — una prenda vendida, una prenda donada.',
    },
    featured: [
      { id: 'f1', img: '', gallery: [], name: 'POLERA DESTACADA', price: '18.990', tag: 'NUEVO', productId: 'p1' },
      { id: 'f2', img: '', gallery: [], name: 'POLERÓN DESTACADO', price: '34.990', tag: 'EXCLUSIVO', productId: 'p2' },
    ],
    carousel: {
      title: 'EXPLORAR POR CATEGORÍA',
      items: [],
    },
  },
  design: {
    piezas: [
      {
        id: 'pz-demo',
        nombre: 'POLERA SALMO 23',
        cliente: 'Iglesia Nueva Vida',
        fecha_creacion: '2024',
        imagen_principal: '',
        imagenes_detalle: [],
        descripcion_breve: 'El texto del Salmo 23 estampado en mano, verso a verso, sobre tela 100% algodón premium. Una pieza que respira fe.',
        descripcion_historia: 'Esta pieza nació de una conversación con el Pastor Daniel. Quería algo que sus jóvenes pudieran llevar puesto todos los días, no solo en el culto. Pasamos tres semanas refinando la tipografía hasta encontrar el balance entre legibilidad y peso visual.',
        tipo_marco: 1,
        orden: 0,
        estado: 'visible',
      }
    ],
  },
  hero: {
    eyebrow: 'EST. SANTIAGO · CHILE',
    titleLine1: 'FE',
    titleLine2: 'PUESTA EN',
    titleLine3: 'ACCIÓN',
    accentWord: 'ACCIÓN',
    lede: 'Estampado y sublimación profesional para iglesias, marcas y eventos. Cada prenda que sale de nuestro taller activa el Protocolo 1×1 — una prenda vendida, una prenda donada a la calle.',
    primaryCta:   { label: 'Cotizar proyecto', href: '#contacto' },
    secondaryCta: { label: 'Ver productos',    href: '#productos' },
    marquee: 'ESTAMPADO PROFESIONAL · SUBLIMACIÓN · ASESORÍA CREATIVA · MERCH · IGLESIAS · EVENTOS · DROPS LIMITADOS',
  },
  about: {
    eyebrow: '[ 00 ] QUIÉNES SOMOS',
    title: 'UN LABORATORIO',
    titleEm: 'CRISTIANO.',
    sub: 'Diseñamos, estampamos y financiamos una misión real con cada prenda que sale del taller.',
    body: [
      'Somos Ruah Labs, un laboratorio creativo cristiano. Diseñamos y producimos todo para Jesús y Dios — trabajamos enfocados en Él.',
      'Nuestra misión es vestir la palabra de manera auténtica y, al mismo tiempo, ayudar a personas en situación de calle. Por cada prenda o servicio que vendemos, regalamos una prenda filtrada y lavada a alguien que la necesita. La gente quiere ayudar pero no sabe cómo: nosotros somos el canal.',
      'No subimos a la gente que ayudamos a redes sociales. La gente en situación de calle no es contenido. La transparencia existe porque debe existir, no porque es marketing.',
    ],
    pillars: [
      { id: 'a1', num: '01', title: 'Fe en acción',         desc: 'Esto no es institución, es fe puesta en práctica. Sin show, sin televisión, todo en anonimato.' },
      { id: 'a2', num: '02', title: 'Calidad profesional',  desc: 'Diseño autoral, estampado de larga duración. Sin plantillas. Sin atajos.' },
      { id: 'a3', num: '03', title: 'Comunidad real',       desc: 'Cada cliente pasa a ser parte del movimiento. Reuniones, rutas, oración y registro privado.' },
      { id: 'a4', num: '04', title: 'Donación con dignidad', desc: 'Filtramos cada prenda donada. Si tú no la usarías, no sirve para donar. Lavada y entregada en mano.' },
    ],
    metrics: [
      { id: 'am1', num: '742', lbl: 'Prendas entregadas a la calle' },
      { id: 'am2', num: '34',  lbl: 'Iglesias aliadas' },
      { id: 'am3', num: '127', lbl: 'Miembros de Ruah Labs Club' },
    ],
  },
  protocol: {
    headerIndex: '§02  /  06',
    headerTitle: 'PROTOCOLO 1×1',
    headerRight: 'DOC · INTERNO · v1.0',
    title1: 'ALGO',
    title2: 'COMPRADO,',
    title3: 'ALGO',
    title4: 'DONADO.',
    title2Amber: true,
    title4Amber: true,
    sections: [
      { id: 'ps1', heading: '¿POR QUÉ DE SEGUNDA MANO?', body: 'En Chile los operativos policiales desarman las casas provisorias de la gente en situación de calle, botando todas sus pertenencias a la basura. Donar prendas nuevas caras no tiene sentido — se las quitan o se las botan. Donamos ropa real, útil, reemplazable, abrigada. La que tú tampoco botarías.' },
      { id: 'ps2', heading: 'FILTRO',                    body: '"Si no la ocuparías, no sirve para donar." Ese es el primer filtro. Después seleccionamos por talla, género y prenda. Lavamos. Doblamos. Empacamos.' },
      { id: 'ps3', heading: 'REGISTRO',                  body: 'Cuando salimos a entregar, pedimos un saludo (cámara al piso, nunca de frente). Te llega ese registro a tu correo: "Gracias a ti llegó esta prenda." No es marketing. Es transparencia.' },
    ],
    quoteRef: 'MATEO 6:3-4',
    quoteText: '"Cuando des a los necesitados, que no se entere tu mano izquierda de lo que hace la derecha, para que tu limosna sea en secreto. Así tu Padre, que ve lo que se hace en secreto, te recompensará."',
    flowTitle: 'FLUJO INTERNO',
    flow: [
      { id: 'pf1', num: '01', name: 'COMPRA REGISTRADA',  detail: '+ correo + nombre' },
      { id: 'pf2', num: '02', name: 'SELECCIÓN DE PRENDA', detail: 'Talla / género match' },
      { id: 'pf3', num: '03', name: 'FILTRO Y LAVADO',     detail: 'Equipo acopio' },
      { id: 'pf4', num: '04', name: 'SALIDA RUTA',         detail: 'Domingo / miércoles' },
      { id: 'pf5', num: '05', name: 'REGISTRO ENTREGA',    detail: 'Cámara al piso' },
      { id: 'pf6', num: '06', name: 'EMAIL AL CLIENTE',    detail: 'Video / foto · 1 línea' },
    ],
    teamTitle: 'EQUIPO',
    teamMeta: 'ANÓNIMO',
    teamCaption: 'FOTO ESPALDA · RUTA',
    teamImg: '',
    activateCta: 'ACTIVAR PROTOCOLO (COMPRAR)',
    activateHref: '#productos',
    // Legacy stats (kept for compatibility with admin/club; not shown in new layout)
    eyebrow: '[ 01 ] EL PROTOCOLO',
    stats: [
      { id: 's1', num: '742',  lbl: 'Prendas donadas' },
      { id: 's2', num: '128',  lbl: 'Rutas realizadas' },
      { id: 's3', num: '34',   lbl: 'Iglesias aliadas' },
    ],
  },
  services: {
    eyebrow: '[ 02 ] SERVICIOS',
    title: 'LO QUE',
    titleEm: 'HACEMOS',
    sub: 'Trabajamos con tu visión desde el archivo hasta la última costura. Diseño profesional, estampado de larga duración, plazos cortos.',
    items: [
      { id: 'sv1', name: 'Estampado profesional', desc: 'DTF, vinilo, serigrafía y sublimación sobre algodón, poliéster y mezclas. Durabilidad garantizada lavada tras lavada.' },
      { id: 'sv2', name: 'Iglesias y eventos',     desc: 'Poleras, polerones y merch para retiros, bautizos, matrimonios, congresos y campañas. Producción coordinada con tu equipo.' },
      { id: 'sv3', name: 'Eventos',                desc: 'Diseño y producción de merchandising para conferencias, festivales, conciertos y activaciones. Entrega rápida, calidad garantizada.' },
      { id: 'sv4', name: 'Asesoría creativa',       desc: 'Identidad visual, naming, manual de marca y contenido distintivo. Tu marca, lista para vestirse.' },
      { id: 'sv5', name: 'Diseños personalizados', desc: 'Tu versículo, tu idea, tu tipografía. Diseño autoral hecho por una diseñadora profesional, sin plantillas.' },
      { id: 'sv6', name: 'RUAH Live',              desc: 'Estación de estampado en vivo para matrimonios, cumpleaños, baby showers, corporativos y activaciones. Tus invitados eligen, ven cómo se hace, y se llevan algo único en menos de dos minutos.' },
      { id: 'sv7', name: 'Cuadros decorativos',    desc: 'Piezas minimalistas y disruptivas para casa, oficina e iglesia. Todo centrado en Cristo.' },
    ],
  },
  products: {
    eyebrow: '[ 03 ] CATÁLOGO',
    title: 'PRENDAS QUE',
    titleEm: 'PREDICAN',
    sub: 'Drops limitados, básicos siempre disponibles y piezas exclusivas. Cada compra activa el Protocolo 1×1.',
    categories: [
      { id: 'c-all', name: 'Todo',        slug: 'todo' },
      { id: 'c1',    name: 'Poleras',     slug: 'poleras' },
      { id: 'c2',    name: 'Polerones',   slug: 'polerones' },
      { id: 'c3',    name: 'Chaquetas',   slug: 'chaquetas' },
      { id: 'c4',    name: 'Gorros',      slug: 'gorros' },
      { id: 'c5',    name: 'Cuadros',     slug: 'cuadros' },
      { id: 'c6',    name: 'Accesorios',  slug: 'accesorios' },
    ],
    items: [
      {
        id: 'p1', categoryId: 'c1', name: 'Polera Salmo 23', verse: 'SAL. 23:1',
        price: '18.990', tag: 'DROP 04', tagStyle: 'amber', img: '', gallery: [],
        description: 'Polera de algodón premium estampada en serigrafía profesional. El versículo Salmo 23:1 trabajado tipográficamente con composición de autor — una pieza para vestir la palabra todos los días.',
        details: [
          { id: 'd1', label: 'Material',  value: 'Algodón premium 220 gsm' },
          { id: 'd2', label: 'Estampado', value: 'Serigrafía a 2 tintas, alta durabilidad' },
          { id: 'd3', label: 'Fit',       value: 'Oversize relajado, unisex' },
          { id: 'd4', label: 'Tallas',    value: 'S · M · L · XL · XXL' },
          { id: 'd5', label: 'Origen',    value: 'Diseñado y producido en Santiago, Chile' },
        ],
      },
      {
        id: 'p2', categoryId: 'c2', name: 'Polerón Imago Dei', verse: 'GEN. 1:27',
        price: '34.990', tag: 'EXCLUSIVO', tagStyle: 'amber', img: '', gallery: [],
        description: 'Polerón con capucha de algodón perchado. Estampado frontal y dorsal con composición tipográfica del versículo. Pieza exclusiva del drop de invierno, producción limitada a 80 unidades.',
        details: [
          { id: 'd1', label: 'Material',  value: 'Algodón perchado 320 gsm' },
          { id: 'd2', label: 'Estampado', value: 'DTF de alta resolución frontal y dorsal' },
          { id: 'd3', label: 'Fit',       value: 'Boxy crop relajado' },
          { id: 'd4', label: 'Tallas',    value: 'S · M · L · XL' },
        ],
      },
      {
        id: 'p3', categoryId: 'c1', name: 'Polera Lux In Tenebris', verse: 'JN. 1:5',
        price: '18.990', tag: 'BÁSICO', tagStyle: 'soft', img: '', gallery: [],
        description: 'Una de las prendas básicas siempre disponibles de la colección. Composición sutil en el pecho y versículo a la espalda — para usar todos los días sin pensar.',
        details: [
          { id: 'd1', label: 'Material',  value: 'Algodón 200 gsm' },
          { id: 'd2', label: 'Estampado', value: 'Vinilo textil mate' },
          { id: 'd3', label: 'Fit',       value: 'Regular unisex' },
          { id: 'd4', label: 'Tallas',    value: 'XS · S · M · L · XL · XXL' },
        ],
      },
      {
        id: 'p4', categoryId: 'c2', name: 'Buzo Selah', verse: 'SAL. 46:10',
        price: '42.990', tag: 'DROP 04', tagStyle: 'amber', img: '', gallery: [],
        description: 'Conjunto de polerón y pantalón de algodón perchado. Estampado discreto en pierna y pecho. La palabra Selah — "pausa, escucha" — recorre el costado.',
        details: [
          { id: 'd1', label: 'Material',  value: 'Algodón perchado 330 gsm' },
          { id: 'd2', label: 'Incluye',   value: 'Polerón + pantalón' },
          { id: 'd3', label: 'Tallas',    value: 'S · M · L · XL' },
        ],
      },
      {
        id: 'p5', categoryId: 'c1', name: 'Polera Soli Deo Gloria', verse: 'ROM. 11:36',
        price: '18.990', tag: 'BÁSICO', tagStyle: 'soft', img: '', gallery: [],
        description: 'Frase de las cinco sola de la Reforma. Estampado tipográfico minimalista de gran formato a la espalda. Algodón premium, disponible todo el año.',
        details: [
          { id: 'd1', label: 'Material',  value: 'Algodón premium 220 gsm' },
          { id: 'd2', label: 'Estampado', value: 'Serigrafía 1 tinta' },
          { id: 'd3', label: 'Tallas',    value: 'S · M · L · XL · XXL' },
        ],
      },
      {
        id: 'p6', categoryId: 'c3', name: 'Chaqueta Coram Deo', verse: 'PROV. 15:3',
        price: '58.990', tag: 'EXCLUSIVO', tagStyle: 'amber', img: '', gallery: [],
        description: 'Chaqueta sherpa con forro polar. Una pieza para resistir el invierno santiaguino. Tag bordado interior con Proverbios 15:3.',
        details: [
          { id: 'd1', label: 'Material',   value: 'Sherpa exterior + forro polar' },
          { id: 'd2', label: 'Estampado',  value: 'Bordado en pecho y etiqueta interior' },
          { id: 'd3', label: 'Tallas',     value: 'S · M · L · XL' },
        ],
      },
      {
        id: 'p7', categoryId: 'c4', name: 'Gorro Maranatha', verse: '1 COR. 16:22',
        price: '12.990', tag: 'BÁSICO', tagStyle: 'soft', img: '', gallery: [],
        description: 'Beanie tejido de lana acrílica con etiqueta bordada. "Maranatha — el Señor viene". Pieza para todo el año.',
        details: [
          { id: 'd1', label: 'Material', value: 'Acrílico tejido grueso' },
          { id: 'd2', label: 'Detalle',  value: 'Etiqueta bordada' },
          { id: 'd3', label: 'Talla',    value: 'Única' },
        ],
      },
      {
        id: 'p8', categoryId: 'c5', name: 'Cuadro Sola Scriptura', verse: '2 TIM. 3:16',
        price: '28.990', tag: 'EXCLUSIVO', tagStyle: 'amber', img: '', gallery: [],
        description: 'Cuadro decorativo con marco de madera natural. Composición tipográfica minimalista impresa en papel algodón. Tres tamaños disponibles.',
        details: [
          { id: 'd1', label: 'Material', value: 'Papel algodón 300g + marco de pino' },
          { id: 'd2', label: 'Tamaños',  value: '30×40 · 40×60 · 50×70 cm' },
          { id: 'd3', label: 'Detalle',  value: 'Numerado y firmado a mano' },
        ],
      },
      {
        id: 'p9', categoryId: 'c6', name: 'Totebag Ebenezer', verse: '1 SAM. 7:12',
        price: '9.990', tag: 'BÁSICO', tagStyle: 'soft', img: '', gallery: [],
        description: 'Bolso de lona estampado en serigrafía. Resistente, lavable, para el día a día. "Hasta aquí nos ayudó Jehová".',
        details: [
          { id: 'd1', label: 'Material',  value: 'Lona 100% algodón' },
          { id: 'd2', label: 'Medidas',   value: '38 × 42 cm' },
        ],
      },
    ],
  },
  cuadros: {
    headerIndex: '§05  /  06',
    headerTitle: 'CUADROS',
    headerRight: 'MINIMALISTA · DISRUPTIVO · 1/1',
    title1: 'CUADROS',
    title2: 'QUE PREDICAN',
    title3: 'SIN GRITAR.',
    accentWord: '',
    lede: 'Hacemos cuadros minimalistas o disruptivos. Siempre cristianos, siempre centrados en Cristo. Para casa, café u oficina. Encargo personalizado: tú eliges versículo, formato y dirección.',
    styles: [
      { id: 'cs1', tag: 'MINIMAL',    desc: 'TIPO · NEGRO/CRUDO', img: '' },
      { id: 'cs2', tag: 'DISRUPTIVO', desc: 'COLLAGE · TEXTURAS',  img: '' },
      { id: 'cs3', tag: 'MURAL',      desc: 'GRAN FORMATO',         img: '' },
      { id: 'cs4', tag: 'LETTERING',  desc: 'MANUSCRITO',            img: '' },
    ],
    briefEyebrow: '[ ENCARGO PERSONALIZADO ]',
    briefTitle: 'BRIEF EN 4 PASOS',
    briefSub: 'Cuéntanos qué pieza quieres. Cotizamos en menos de 48h. Producción 7–14 días.',
    steps: [
      { id: 'st1', num: '01', name: 'EXPLORAR' },
      { id: 'st2', num: '02', name: 'ESTILO' },
      { id: 'st3', num: '03', name: 'FORMATO' },
      { id: 'st4', num: '04', name: 'ENVIAR' },
    ],
    // Step 01 - EXPLORAR
    step1Body: 'Revisa los estilos y referencias antes de decidir. Cada cuadro es único; no producimos en serie.',
    refs: [
      { id: 'cr1', code: 'REF 01', name: 'MINIMAL', meta: 'Tipografía · 40×60 cm · Marco roble', img: '' },
      { id: 'cr2', code: 'REF 02', name: 'DISRUPT', meta: 'Collage · 50×70 cm · Papel algodón', img: '' },
      { id: 'cr3', code: 'REF 03', name: 'MURAL',   meta: 'Gran formato · 120×180 cm · Vinilo', img: '' },
    ],
    // Step 02 - ESTILO
    estilos: [
      { id: 'ce1', name: 'MINIMALISTA B/N' },
      { id: 'ce2', name: 'DISRUPTIVO / COLLAGE' },
      { id: 'ce3', name: 'MANUSCRITO' },
      { id: 'ce4', name: 'MURAL GRAN FORMATO' },
      { id: 'ce5', name: 'LETTERING SERIF' },
      { id: 'ce6', name: 'COLOR BLOCK' },
    ],
    // Step 03 - FORMATO
    formatos: [
      { id: 'cf1', size: '30×40',  price: '$59.990' },
      { id: 'cf2', size: '50×70',  price: '$129.990' },
      { id: 'cf3', size: '70×100', price: '$219.990' },
      { id: 'cf4', size: 'MURAL',  price: 'COTIZAR' },
    ],
    // Step 04 - ENVIAR
    sendFields: [
      { id: 'cf1', label: 'NOMBRE',           placeholder: 'Tu nombre',      type: 'text' },
      { id: 'cf2', label: 'EMAIL',            placeholder: 'tu@correo.cl',   type: 'email' },
      { id: 'cf3', label: 'VERSÍCULO O FRASE', placeholder: 'Ej: Mateo 6:33', type: 'text' },
      { id: 'cf4', label: 'NOTAS',            placeholder: 'Para qué espacio, qué siente, qué evita...', type: 'textarea' },
    ],
    sendSubmit: 'ENVIAR BRIEF',
    productsEyebrow: '[ CATÁLOGO CUADROS ]',
    productsTitle: 'CUADROS',
    productsTitleEm: 'EN VENTA',
    productsSub: 'Piezas únicas, producidas bajo encargo. No trabajamos en serie. Cada cuadro tiene su historia.',
    products: [
      { id: 'cq1', name: 'Sola Scriptura', style: 'MINIMAL B/N', price: '59.990', size: '30×40 cm', tag: 'STOCK', img: '', gallery: [], description: 'Pieza tipográfica minimalista centrada en Cristo. Papel algodón 300g, marco pino natural. Numerada y firmada a mano.', details: [{ id: 'd1', label: 'Formato', value: '30×40 cm' }, { id: 'd2', label: 'Material', value: 'Papel algodón 300g + marco pino' }, { id: 'd3', label: 'Estilo', value: 'Minimalista B/N' }, { id: 'd4', label: 'Producción', value: '7–14 días hábiles' }] },
      { id: 'cq2', name: 'Imago Dei', style: 'DISRUPTIVO', price: '129.990', size: '50×70 cm', tag: 'ENCARGO', img: '', gallery: [], description: 'Collage tipográfico de gran formato. Texturas superpuestas, composición autoral. Cada pieza es única.', details: [{ id: 'd1', label: 'Formato', value: '50×70 cm' }, { id: 'd2', label: 'Material', value: 'Papel algodón 300g + marco roble' }, { id: 'd3', label: 'Estilo', value: 'Disruptivo / Collage' }, { id: 'd4', label: 'Producción', value: '10–14 días hábiles' }] },
      { id: 'cq3', name: 'Coram Deo', style: 'LETTERING', price: '89.990', size: '40×60 cm', tag: 'STOCK', img: '', gallery: [], description: 'Lettering manuscrito sobre papel algodón. Marco madera natural. La presencia de Dios en cada pared.', details: [{ id: 'd1', label: 'Formato', value: '40×60 cm' }, { id: 'd2', label: 'Material', value: 'Papel algodón 300g + marco natural' }, { id: 'd3', label: 'Estilo', value: 'Lettering manuscrito' }, { id: 'd4', label: 'Producción', value: '7–14 días hábiles' }] },
    ],
  },
  iglesias: {
    headerIndex: '§04  /  06',
    headerTitle: 'IGLESIAS',
    headerRight: 'ESTAMPADOS · ASESORÍA CREATIVA · EVENTOS',
    title1: 'DISEÑO PROFESIONAL',
    title2: 'PARA TU IGLESIA.',
    accentWord: '',
    lede: 'Polerones para retiros, bautizos y matrimonios. Identidad gráfica completa. Estampados profesionales hechos por diseñadora. Piezas únicas para eventos.',
    featureTag: 'PORTAFOLIO',
    featureName: 'POLERÓN RETIRO 2024',
    featureImg: '',
    services: [
      { id: 'is1', num: '01', name: 'EVENTOS',     desc: 'Polerones, poleras y caps para retiros, congresos, campamentos.' },
      { id: 'is2', num: '02', name: 'SACRAMENTOS', desc: 'Piezas únicas para bautizos y matrimonios. Producción cuidadosa.' },
      { id: 'is3', num: '03', name: 'ASESORÍA CREATIVA', desc: 'Identidad completa: logo, paleta, sistema, contenido distintivo.' },
      { id: 'is4', num: '04', name: 'ESTAMPADO',   desc: 'Servicio de estampado profesional para piezas que ya tienen.' },
    ],
    portfolioIndex: '§04.01  /  06',
    portfolioTitle: 'PORTAFOLIO',
    portfolioRight: 'ALGUNOS TRABAJOS',
    projects: [
      { id: 'ip1', code: 'PROYECTO 01', name: 'RETIRO 2024',       meta: 'RETIRO 2024 · IGL. NUEVA ESPERANZA', img: '', gallery: [] },
      { id: 'ip2', code: 'PROYECTO 02', name: 'BAUTIZOS',          meta: 'BAUTIZOS · COMUNIDAD ELIM',           img: '', gallery: [] },
      { id: 'ip3', code: 'PROYECTO 03', name: 'MATRIMONIO',        meta: 'MATRIMONIO · LP & VC',                img: '', gallery: [] },
      { id: 'ip4', code: 'PROYECTO 04', name: 'CONGRESO JÓVENES',  meta: 'CONGRESO JÓVENES',                    img: '', gallery: [] },
      { id: 'ip5', code: 'PROYECTO 05', name: 'ASESORÍA CREATIVA', meta: 'ASESORÍA CREATIVA · MINISTERIO X',   img: '', gallery: [] },
      { id: 'ip6', code: 'PROYECTO 06', name: 'CAMPAMENTO VERANO', meta: 'CAMPAMENTO VERANO',                   img: '', gallery: [] },
    ],
    formEyebrow: '[ FORMULARIO DE SOLICITUD ]',
    formTitle: 'PIDE COTIZACIÓN',
    formSub: 'Respondemos en 24–48h.',
    eventOptions: ['Retiro', 'Bautizo', 'Matrimonio', 'Congreso', 'Campamento', 'Asesoría creativa', 'Estampado', 'Otro'],
    formSubmit: 'ENVIAR SOLICITUD',
  },
  manifesto: {
    text: [
      { txt: 'No vendemos ropa.',    em: false, strike: false },
      { txt: 'Vendemos misión',      em: true,  strike: false },
      { txt: 'vestida de algodón.',  em: false, strike: false },
    ],
  },
  testimonials: {
    eyebrow: '[ 04 ] COMUNIDAD',
    title: 'LO QUE',
    titleEm: 'DICEN',
    sub: 'Iglesias, marcas y personas que adoptaron el Protocolo 1×1 como parte de su historia.',
    items: [
      {
        id: 't1',
        quote: 'Pedimos 80 polerones para el retiro de jóvenes y el resultado fue mejor que cualquier marca grande. Plazos cumplidos al día.',
        name: 'PASTOR DANIEL VERA',
        role: 'Iglesia Vida Nueva — Maipú',
        initial: 'D',
      },
      {
        id: 't2',
        quote: 'El diseño es serio. La calidad es seria. Y saber que detrás hay una causa real lo cambia todo. Volveremos.',
        name: 'CAMILA MUÑOZ',
        role: 'Café Almendro — Providencia',
        initial: 'C',
      },
      {
        id: 't3',
        quote: 'Me llegó el video del chico que recibió mi prenda donada. Lloré. Es la primera vez que comprar ropa me hace sentir parte de algo.',
        name: 'SEBASTIÁN ROJAS',
        role: 'Cliente Ruah Labs Club',
        initial: 'S',
      },
    ],
  },
  eventos: {
    eyebrow: '[ 06 ] RUAH EVENTO',
    title: 'TU EVENTO MERECE',
    titleEm: 'ALGO QUE NADIE',
    titleAfter: 'BOTE AL DÍA SIGUIENTE.',
    sub: 'Estación de estampado en vivo para matrimonios, cumpleaños, baby showers, corporativos y activaciones. Tus invitados eligen, ven cómo se hace, y se llevan algo único en menos de dos minutos.',
    problemEyebrow: '[ EL PROBLEMA ]',
    problemTitle: 'EL PROBLEMA CON LOS SOUVENIRS',
    problemBody: 'Los compras al por mayor, pagas un montón, y la mitad termina en un cajón o en la basura antes del lunes. Nadie los usa. Nadie los recuerda. Y a ti te quedó la sensación de que gastaste por gastar.',
    weDoEyebrow: '[ LO QUE HACEMOS ]',
    weDoTitle: 'LLEGAMOS A TU EVENTO CON UNA ESTACIÓN DE ESTAMPADO EN VIVO.',
    weDoBody: 'Tus invitados eligen, ven cómo se hace, y se llevan algo único en menos de dos minutos.',
    weDoTagline: 'No es un souvenir. Es un momento.',
    pillars: [
      { id: 'ev1', num: '01', title: 'Lo eligen ellos',  desc: 'Nadie se lleva algo que no quiso. Cada invitado escoge su pieza, su versión, su versículo o su frase.' },
      { id: 'ev2', num: '02', title: 'Lo ven hacerse',   desc: 'El proceso es parte del show. La gente se acerca, mira, conversa, espera su turno. Se vuelve actividad.' },
      { id: 'ev3', num: '03', title: 'Lo usan después',  desc: 'Una taza con su nombre y la fecha queda en el escritorio. Una polera se la pone. Cada vez que la usen, se acuerdan de ti.' },
      { id: 'ev4', num: '04', title: 'Lo hace una diseñadora', desc: 'Nos sentamos contigo antes del evento, conversamos sobre la temática, y armamos algo que se ve bien de verdad. No es un catálogo genérico.' },
    ],
    forWhatTitle: 'PARA QUÉ EVENTOS',
    forWhatBody: 'Matrimonios, cumpleaños temáticos, despedidas, baby showers, bautizos, aniversarios, retiros, lanzamientos, eventos corporativos, activaciones de marca. Si hay invitados, hay souvenir.',
    onWhatTitle: 'SOBRE QUÉ ESTAMPAMOS',
    onWhatBody: 'Tú eliges. Vasos, tazas, copas, termos, botellas, poleras, totes, llaveros, destapadores, posavasos, tablas de picoteo, velas, espejos, parches, cojines. Y cosas raras que nadie regala y se vuelven el comentario de la noche. Si tienes algo en mente que no es típico, lo cotizamos.',
    detailTitle: 'EL DETALLE QUE CAMBIA TODO',
    detailBody: 'Por cada souvenir aplicado en tu evento, donamos una prenda a una persona en situación calle. Sin excepciones. Tus invitados se llevan un recuerdo. Alguien que duerme en la calle recibe abrigo. Después te llega el reporte con la entrega.',
    receiveTitle: 'LO QUE RECIBES',
    receiveItems: [
      { id: 'evr1', txt: 'Reunión previa con la diseñadora' },
      { id: 'evr2', txt: 'Estación profesional el día del evento' },
      { id: 'evr3', txt: 'Un operador o más, según el paquete' },
      { id: 'evr4', txt: 'Souvenir terminado para cada invitado' },
      { id: 'evr5', txt: 'Video resumen del evento' },
      { id: 'evr6', txt: 'Reporte del Protocolo 1×1' },
      { id: 'evr7', txt: 'Archivos digitales del diseño' },
    ],
    packsTitle: 'TRES PAQUETES',
    packs: [
      { id: 'evp1', name: 'ESENCIAL', limit: 'hasta 60 invitados', detail: '3 horas · 1 estación' },
      { id: 'evp2', name: 'PLUS',     limit: 'hasta 150 invitados', detail: '5 horas · 1 estación + 2 operadores' },
      { id: 'evp3', name: 'PREMIUM',  limit: '200+ invitados',      detail: 'Jornada completa · 2 estaciones' },
    ],
    packsFoot: 'Te armamos el paquete según tu evento. Cotización al día siguiente de la reunión.',
    coverageTitle: 'COBERTURA',
    coverageBody: 'Todo Chile.',
    ctaEyebrow: '[ EL SIGUIENTE PASO ]',
    ctaTitle: 'AGENDA LA REUNIÓN PREVIA.',
    ctaBody: 'Sin costo, sin compromiso. Te mostramos referencias, conversamos sobre tu evento, y te enviamos la propuesta concreta.',
    ctaBtn: { label: 'Agendar por Instagram', href: 'https://instagram.com/ruahlabs' },
    ctaBtn2: { label: 'Escribir un correo', href: 'mailto:hola@ruahlabs.cl' },
    closing: 'Tu evento, tu estética, tu temática. Nosotros ponemos el oficio. Un evento, tres bendiciones: tú celebras, tus invitados se llevan algo único, y alguien en la calle recibe abrigo.',
    instagram: '@ruahlabs',
    galleryTitle: 'MUESTRA DE EVENTOS',
    gallerySub: 'Fotos reales de estaciones en vivo que hemos llevado a matrimonios, corporativos y activaciones.',
    gallery: [
      { id: 'eg1', img: '', caption: 'Estación en vivo · Matrimonio LP & VC', photos: [] },
      { id: 'eg2', img: '', caption: 'Activación corporativa · Drop privado', photos: [] },
      { id: 'eg3', img: '', caption: 'Cumpleaños temático · Estampado al instante', photos: [] },
    ],
  },
  checkout: {
    topTag: 'CHECKOUT · ACTIVA PROTOCOLO 1×1',
    stepLabels: ['INFORMACIÓN', 'ENVÍO', 'PAGO'],
    infoTitle: 'Información de contacto',
    infoSub: 'Recibirás aquí el comprobante y el registro del Protocolo 1×1.',
    addressTitle: 'Dirección de envío',
    shippingTitle: 'Método de envío',
    shippingSub: 'Despachamos a todo Chile. Retiro disponible Lun – Vie, 11 a 19h.',
    payTitle: 'Método de pago',
    nextLabel: 'Continuar a envío',
    nextPayLabel: 'Continuar a pago',
    backLabel: '← Volver',
    payCtaLabel: 'Pagar',
    confirmedTitle: 'PEDIDO CONFIRMADO.',
    trustTxt: 'Pago cifrado SSL · No guardamos datos de tarjeta · Protocolo 1×1 se activa al confirmar',
    summaryHd: 'RESUMEN DEL PEDIDO',
    summaryProtocol: 'PROTOCOLO 1×1. Esta compra dona una prenda filtrada a alguien en situación de calle.',
    style: {
      // Colors
      bg:          '#0a0a0a',  // ck-shell background (outer dark)
      cardBg:      '#0a0a0a',  // ck-form card surface (dark)
      textOnDark:  '#f5f1e8',  // ck-top text
      textOnCard:  '#ffffff',
      accent:      '#eca10c',  // active step / focus / CTA
      stepDoneClr: '#eca10c',
      sumBg:       '#0a0a0a',  // summary aside background
      sumText:     '#f5f1e8',
      // Sizes
      titleSize:   36,
      subSize:     16,
      stepLabelSize: 14,
      fieldLabelSize: 13,
      fieldInputSize: 19,
      ctaSize:     14,
      summaryHdSize: 13,
      summaryItemSize: 14,
      summaryTotalSize: 22,
    },
  },
  cta: {
    title: 'TU PRÓXIMO',
    titleEm: 'PROYECTO',
    titleAfter: 'EMPIEZA HOY.',
    body: 'Cotización en 24 hrs. Sin mínimos imposibles. Envíos a todo Chile.',
    primaryCta:   { label: 'Hablar por WhatsApp', href: 'https://wa.me/56926237239?text=Hola%20Ruah%20Labs!%20Me%20gustar%C3%ADa%20tener%20m%C3%A1s%20informaci%C3%B3n' },
    secondaryCta: { label: 'Escribir un correo',  href: 'mailto:contacto@ruahlabs.cl?subject=M%C3%A1s%20informaci%C3%B3n&body=Hola%20Ruah%20Labs!%20Me%20gustar%C3%ADa%20tener%20m%C3%A1s%20informaci%C3%B3n' },
  },
  footer: {
    wordmark: 'RUAH',
    wordmarkSecret: 'LABS',
    about: 'Laboratorio creativo cristiano. Estampado, sublimación, asesoría creativa y diseño autoral. Cada compra activa el Protocolo 1×1.',
    cols: [
      {
        id: 'fc1',
        title: 'Sitio',
        items: [
          { id: 'i0', label: 'Quiénes Somos', href: '#nosotros' },
          { id: 'i1', label: 'Servicios',     href: '#servicios' },
          { id: 'i2', label: 'Productos',     href: '#productos' },
          { id: 'i3', label: 'Protocolo',     href: '#protocolo' },
          { id: 'i4', label: 'Comunidad',     href: '#comunidad' },
        ],
      },
      {
        id: 'fc2',
        title: 'Contacto',
        items: [
          { id: 'i5', label: 'hola@ruahlabs.cl', href: 'mailto:hola@ruahlabs.cl' },
          { id: 'i6', label: '+56 9 0000 0000',  href: 'tel:+56900000000' },
          { id: 'i7', label: '@ruahlabs',        href: 'https://instagram.com/ruahlabs' },
          { id: 'i8', label: 'Santiago · Chile', href: '#' },
        ],
      },
      {
        id: 'fc3',
        title: 'Misión',
        items: [
          { id: 'i9',  label: 'Protocolo 1×1',  href: '#protocolo' },
          { id: 'i10', label: 'Donar ropa',     href: '#contacto' },
          { id: 'i11', label: 'Salir a ruta',   href: '#contacto' },
          { id: 'i12', label: 'Iglesias',       href: '#contacto' },
        ],
      },
    ],
    bottomLeft: '© ' + new Date().getFullYear() + ' RUAH LABS · TODO POR JESÚS',
    bottomRight: 'SOMOS MÁS DE LOS QUE CREES',
  },
  club: {
    heroEyebrow: '◉ ACCESO PRIVILEGIADO',
    title: 'RUAH LABS',
    titleEm: 'CLUB',
    frase: 'No es marketing. Es iglesia. Aquí coordinamos las rutas, organizamos reuniones secretas, transparentamos la ayuda y nos cuidamos entre nosotros. Bienvenido al movimiento.',
    panels: [
      { id: 'cp1', ttl: 'MIEMBROS ACTIVOS', big: '127', desc: 'Hermanos y hermanas en la red. Crecemos en silencio.' },
      { id: 'cp2', ttl: 'PRÓXIMA RUTA',     big: '12.06', desc: 'Patronato — entrega nocturna. 9 personas anotadas.' },
      { id: 'cp3', ttl: 'PROTOCOLO 1×1',    big: '742',   desc: 'Prendas entregadas a la fecha. Cada una con su historia.' },
    ],
    routes: [
      { id: 'r1', name: 'Patronato Norte',  date: '12 JUN · 21:00', meta: 'Punto: Plaza Brasil · 9 personas anotadas · 40 prendas listas', joined: false },
      { id: 'r2', name: 'Estación Central',  date: '19 JUN · 20:30', meta: 'Punto: Av. Alameda · Buscamos 6 personas más · 60 prendas listas', joined: false },
      { id: 'r3', name: 'Mapocho Sur',       date: '26 JUN · 21:00', meta: 'Punto: Puente Recoleta · 4 personas anotadas · 35 prendas + comida', joined: false },
      { id: 'r4', name: 'Bellavista Centro', date: '03 JUL · 21:30', meta: 'Punto: Pío Nono · Coordinador: Daniel · 25 prendas exclusivas', joined: false },
    ],
    meetings: [
      { id: 'm1', day: '15', mon: 'JUN', name: 'Estudio Bíblico',     det: 'Romanos 12. Casa de Marcela — Ñuñoa. 19:30 hrs.' },
      { id: 'm2', day: '22', mon: 'JUN', name: 'Reunión de Coordinación', det: 'Logística de drops y rutas Q3. Online — 20:00 hrs.' },
      { id: 'm3', day: '29', mon: 'JUN', name: 'Oración por la calle', det: 'Vigilia mensual. Iglesia La Roca — Maipú. 21:00 hrs.' },
      { id: 'm4', day: '06', mon: 'JUL', name: 'Taller de Filtrado',   det: 'Aprende a clasificar donaciones. Taller Ruah — 16:00 hrs.' },
    ],
    feed: [
      { id: 'f1', when: 'HACE 2 HRS · DANIEL V.',  what: 'Subí las fotos de la ruta del sábado al canal privado. 38 prendas entregadas. Dios obró.' },
      { id: 'f2', when: 'HACE 6 HRS · CAMILA M.',  what: 'Necesito oración por mi mamá. Operación el lunes. Gracias hermanos.' },
      { id: 'f3', when: 'AYER · SEBASTIÁN R.',     what: 'Tengo bolsa con 22 prendas filtradas listas. ¿Quién las pasa a buscar esta semana?' },
      { id: 'f4', when: 'HACE 2 DÍAS · EQUIPO',    what: 'Drop 04 sale el 20 de junio. Miembros del club tienen 24 hrs de acceso anticipado.' },
    ],
    photoRegistryTitle: 'REGISTRO FOTOGRÁFICO',
    photoRegistrySubtitle: 'Reuniones, rutas, talleres y momentos secretos del movimiento.',
    photos: [
      { id: 'ph1', img: '', caption: 'Ruta del 12 de junio — Patronato' },
      { id: 'ph2', img: '', caption: 'Taller de filtrado — junio' },
      { id: 'ph3', img: '', caption: 'Estudio bíblico mensual' },
      { id: 'ph4', img: '', caption: 'Coordinación de entregas' },
    ],
  },
};

// ----- Store hook with localStorage persistence -----
const STORAGE_KEY = 'ruah-content-v5';

function loadContent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONTENT;
    const parsed = JSON.parse(raw);
    const merged = deepMerge(DEFAULT_CONTENT, parsed);
    return migrateContent(merged);
  } catch (e) {
    console.warn('Could not load saved content', e);
    return DEFAULT_CONTENT;
  }
}

// Append any DEFAULT_CONTENT entries (by id) that the user's saved content is missing.
function migrateContent(c) {
  if (!c.home)     c.home     = DEFAULT_CONTENT.home;
  if (!c.home.intro)    c.home.intro    = DEFAULT_CONTENT.home.intro;
  if (!c.home.featured) c.home.featured = DEFAULT_CONTENT.home.featured;
  if (!c.home.carousel) c.home.carousel = DEFAULT_CONTENT.home.carousel;
  if (!c.design)   c.design   = DEFAULT_CONTENT.design;
  if (!c.design.piezas) c.design.piezas = [];
  if (!c.cuadros)  c.cuadros  = DEFAULT_CONTENT.cuadros;
  if (!c.iglesias) c.iglesias = DEFAULT_CONTENT.iglesias;
  if (!c.eventos)  c.eventos  = DEFAULT_CONTENT.eventos;
  if (!c.colors)   c.colors   = {};
  if (!c.checkout) c.checkout = DEFAULT_CONTENT.checkout;
  if (!c.checkout.style) c.checkout.style = DEFAULT_CONTENT.checkout.style;
  // Ensure new protocol fields exist
  if (!c.protocol.sections) Object.assign(c.protocol, DEFAULT_CONTENT.protocol);
  if (!c.protocol.flow)     c.protocol.flow = DEFAULT_CONTENT.protocol.flow;

  c.nav = c.nav || { ...DEFAULT_CONTENT.nav };
  c.nav.links = mergeById(c.nav.links, DEFAULT_CONTENT.nav.links);
  // Force label overrides (design → Personalizados)
  const l8 = (c.nav.links || []).find(l => l.id === 'l8');
  if (l8) l8.label = 'Personalizados';

  c.products = c.products || { ...DEFAULT_CONTENT.products };
  c.products.categories = mergeById(c.products.categories, DEFAULT_CONTENT.products.categories);

  // Backfill cuadros expansions
  if (c.cuadros) {
    if (!c.cuadros.estilos)     c.cuadros.estilos     = DEFAULT_CONTENT.cuadros.estilos;
    if (!c.cuadros.formatos)    c.cuadros.formatos    = DEFAULT_CONTENT.cuadros.formatos;
    if (!c.cuadros.sendFields)  c.cuadros.sendFields  = DEFAULT_CONTENT.cuadros.sendFields;
    if (!c.cuadros.sendSubmit)  c.cuadros.sendSubmit  = DEFAULT_CONTENT.cuadros.sendSubmit;
    if (!c.cuadros.step1Body)   c.cuadros.step1Body   = DEFAULT_CONTENT.cuadros.step1Body;
    if (!c.cuadros.headerIndex) c.cuadros.headerIndex = DEFAULT_CONTENT.cuadros.headerIndex;
    if (!c.cuadros.headerTitle) c.cuadros.headerTitle = DEFAULT_CONTENT.cuadros.headerTitle;
    if (!c.cuadros.headerRight) c.cuadros.headerRight = DEFAULT_CONTENT.cuadros.headerRight;
  }
  if (c.iglesias) {
    if (!c.iglesias.headerIndex)    c.iglesias.headerIndex    = DEFAULT_CONTENT.iglesias.headerIndex;
    if (!c.iglesias.headerTitle)    c.iglesias.headerTitle    = DEFAULT_CONTENT.iglesias.headerTitle;
    if (!c.iglesias.headerRight)    c.iglesias.headerRight    = DEFAULT_CONTENT.iglesias.headerRight;
    if (!c.iglesias.portfolioRight) c.iglesias.portfolioRight = DEFAULT_CONTENT.iglesias.portfolioRight;
  }

  // Backfill eventos gallery
  if (c.eventos) {
    if (!c.eventos.gallery)       c.eventos.gallery       = DEFAULT_CONTENT.eventos.gallery || [];
    if (!c.eventos.galleryTitle)  c.eventos.galleryTitle  = DEFAULT_CONTENT.eventos.galleryTitle;
    if (!c.eventos.gallerySub)    c.eventos.gallerySub    = DEFAULT_CONTENT.eventos.gallerySub;
  }

  // Ensure services.items includes all defaults (e.g. sv6 RUAH Live)
  if (c.services && c.services.items) {
    c.services.items = mergeById(c.services.items, DEFAULT_CONTENT.services.items);
    // Update RUAH Live description if it has the old text
    c.services.items = c.services.items.map(it => {
      if (it.id === 'sv6' && (it.desc || '').includes('Transmisiones en vivo')) {
        return { ...it, desc: DEFAULT_CONTENT.services.items.find(x => x.id === 'sv6').desc };
      }
      return it;
    });
  }

  // Ensure club photos exist
  if (c.club) {
    if (!c.club.photos)                c.club.photos                = DEFAULT_CONTENT.club.photos;
    if (!c.club.photoRegistryTitle)    c.club.photoRegistryTitle    = DEFAULT_CONTENT.club.photoRegistryTitle;
    if (!c.club.photoRegistrySubtitle) c.club.photoRegistrySubtitle = DEFAULT_CONTENT.club.photoRegistrySubtitle;
  }

  // Ensure cuadros products and catalog fields
  if (c.cuadros) {
    if (!c.cuadros.products)          c.cuadros.products          = DEFAULT_CONTENT.cuadros.products;
    if (!c.cuadros.productsEyebrow)   c.cuadros.productsEyebrow   = DEFAULT_CONTENT.cuadros.productsEyebrow;
    if (!c.cuadros.productsTitle)     c.cuadros.productsTitle     = DEFAULT_CONTENT.cuadros.productsTitle;
    if (!c.cuadros.productsTitleEm)   c.cuadros.productsTitleEm   = DEFAULT_CONTENT.cuadros.productsTitleEm;
    if (!c.cuadros.productsSub)       c.cuadros.productsSub       = DEFAULT_CONTENT.cuadros.productsSub;
    else c.cuadros.products = mergeById(c.cuadros.products, DEFAULT_CONTENT.cuadros.products);
  }

  // Ensure iglesias.projects have gallery arrays
  if (c.iglesias && c.iglesias.projects) {
    c.iglesias.projects = c.iglesias.projects.map(p => ({ gallery: [], ...p }));
  }

  // Ensure eventos.gallery items have photos arrays
  if (c.eventos && c.eventos.gallery) {
    c.eventos.gallery = c.eventos.gallery.map(g => ({ photos: [], ...g }));
  }

  // Migrate "branding"/"branding completo" → "Asesoría Creativa" in user-saved data
  const replaceBranding = (str) => {
    if (!str) return str;
    return str
      .replace(/BRANDING COMPLETO/g, 'ASESORÍA CREATIVA')
      .replace(/Branding completo/g, 'Asesoría Creativa')
      .replace(/branding completo/g, 'asesoría creativa')
      .replace(/BRANDING/g, 'ASESORÍA CREATIVA')
      .replace(/Branding/g, 'Asesoría Creativa')
      .replace(/branding/g, 'asesoría creativa');
  };
  if (c.services && c.services.items) {
    c.services.items = c.services.items.map(it => ({ ...it, name: replaceBranding(it.name), desc: replaceBranding(it.desc) }));
  }
  if (c.iglesias && c.iglesias.services) {
    c.iglesias.services = c.iglesias.services.map(it => ({ ...it, name: replaceBranding(it.name), desc: replaceBranding(it.desc) }));
  }

  return c;
}

function mergeById(userList, defaultList) {
  if (!Array.isArray(userList))   return defaultList;
  if (!Array.isArray(defaultList)) return userList;
  const userIds = new Set(userList.map(x => x && x.id));
  const out = [...userList];
  for (let i = 0; i < defaultList.length; i++) {
    const d = defaultList[i];
    if (!d || userIds.has(d.id)) continue;
    let inserted = false;
    for (let j = i - 1; j >= 0; j--) {
      const prev = defaultList[j];
      const idx = prev ? out.findIndex(x => x && x.id === prev.id) : -1;
      if (idx >= 0) { out.splice(idx + 1, 0, d); inserted = true; break; }
    }
    if (!inserted) out.push(d);
  }
  return out;
}

function deepMerge(base, over) {
  if (Array.isArray(over)) return over;
  if (typeof over !== 'object' || over === null) return over;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const k of Object.keys(over)) {
    out[k] = (k in base) ? deepMerge(base[k], over[k]) : over[k];
  }
  return out;
}

function saveContent(c) {
  c._savedAt = Date.now();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch (e) {}
  var api = (window.RUAH_API || '') + '/api/content';
  var adminKey = sessionStorage.getItem('ruah-admin-session') || '';
  fetch(api, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
    body: JSON.stringify({ data: c })
  }).then(function(r) {
    if (!r.ok) { r.json().then(function(e) { console.error('[RUAH] saveContent error', r.status, e); }).catch(function(){}); return; }
    // Broadcast desde el browser — no depende de Railway para llegar a Supabase
    if (window._ruahSbClient) {
      window._ruahSbClient.channel('content-main').send({
        type: 'broadcast', event: 'content-updated', payload: { data: c }
      }).catch(function(){});
    }
  }).catch(function(e) { console.error('[RUAH] saveContent fetch error', e); });
}

// Apply font-size tokens to :root as CSS vars
function applyTypography(t) {
  const r = document.documentElement;
  const setPx = (name, val) => r.style.setProperty(name, val + 'px');

  // Section titles
  setPx('--fs-hero',                  t.heroMax);
  setPx('--fs-section',               t.sectionMax);
  setPx('--fs-about-title',           t.aboutTitleMax    || t.sectionMax);
  setPx('--fs-protocol',              t.protocolTitleMax || t.protocolMax || 140);
  setPx('--fs-services-title',        t.servicesTitleMax || t.sectionMax);
  setPx('--fs-products-title',        t.productsTitleMax || t.sectionMax);
  setPx('--fs-cuadros-title',         t.cuadrosTitleMax  || 140);
  setPx('--fs-iglesias-title',        t.iglesiasTitleMax || 120);
  setPx('--fs-manifesto',             t.manifestoMax);
  setPx('--fs-testimonials-title',    t.testimonialsTitleMax || t.sectionMax);
  setPx('--fs-cta',                   t.ctaMax);
  setPx('--fs-wordmark',              t.wordmarkMax);
  setPx('--fs-club-title',            t.clubTitleMax || 140);

  // Component sizes
  setPx('--fs-product',               t.productTitle);
  setPx('--fs-testi',                 t.testiQuote);
  setPx('--fs-pillar-title',          t.pillarTitle || 32);
  setPx('--fs-stat-num',              t.statNum || 92);
  setPx('--fs-ig-svc-name',           t.iglesiasServiceName || 22);
  setPx('--fs-ig-proj-name',          t.iglesiasProjectName || 38);
  setPx('--fs-ig-portfolio-title',    t.iglesiasPortfolioTitle || 92);
  setPx('--fs-ig-form-title',         t.iglesiasFormTitle || 72);
  setPx('--fs-ig-feature-name',       t.iglesiasFeatureName || 88);
  setPx('--fs-cu-style-tag',          t.cuadrosStyleTag || 18);
  setPx('--fs-cu-brief-title',        t.cuadrosBriefTitle || 64);
  setPx('--fs-cu-step-num',           t.cuadrosStepNum || 38);
  setPx('--fs-cu-ref-name',           t.cuadrosRefName || 56);
  setPx('--fs-cu-format-num',         t.cuadrosFormatNum || 36);
  setPx('--fs-pr-flow-name',          t.protocolFlowName || 13);
  setPx('--fs-pr-section-hd',         t.protocolSectionHd || 11);
  setPx('--fs-pr-quote',              t.protocolQuote || 18);
  setPx('--fs-club-panel-big',        t.clubPanelBig || 64);
  setPx('--fs-club-route-name',       t.clubRouteName || 22);
  setPx('--fs-club-meeting-day',      t.clubMeetingDay || 36);
  setPx('--fs-club-gate-title',       t.clubGateTitle || 64);
  setPx('--fs-club-hero-title',       t.clubHeroTitle || 120);
  setPx('--fs-club-section-title',    t.clubSectionTitle || 56);
  setPx('--fs-club-body',             t.clubBody || 15);

  // Newly exposed per-element sizes
  setPx('--fs-svc-num',               t.servicesNum || 13);
  setPx('--fs-svc-name',              t.servicesName || 56);
  setPx('--fs-svc-desc',              t.servicesDesc || 15);
  setPx('--fs-prod-verse',            t.productsVerse || 12);
  setPx('--fs-prod-price',            t.productsPrice || 28);
  setPx('--fs-pr-flow-det',           t.protocolFlowDet || 14);
  setPx('--fs-cu-lede',               t.cuadrosLede || 14);
  setPx('--fs-ig-lede',               t.iglesiasLede || 15);
  setPx('--fs-ev-eyebrow',            t.eventosEyebrow || 13);
  setPx('--fs-ev-block-title',        t.eventosBlockTitle || 34);
  setPx('--fs-testi-name',            t.testiName || 13);
  setPx('--fs-testi-role',            t.testiRole || 13);
  setPx('--fs-cta-body',              t.ctaBody || 18);
  setPx('--fs-footer-about',          t.footerAbout || 14);
  setPx('--fs-footer-coltitle',       t.footerColTitle || 13);
  setPx('--fs-footer-colitem',        t.footerColItem || 14);
  setPx('--fs-cat-chip',              t.catChip || 12);
  setPx('--logo-h',                   t.navLogo || 40);

  // Body / labels
  setPx('--fs-body',                  t.bodyBase);
  setPx('--fs-lede',                  t.lede);
  setPx('--fs-label',                 t.label);
  setPx('--fs-navbrand',              t.navBrand);
  setPx('--fs-nav-link',              t.navLink || 14);
}

// Apply text-color tokens to :root as CSS vars `--c-<key>`.
// Empty string = unset (falls back to design default in CSS).
function applyColors(colors) {
  const r = document.documentElement;
  for (const k of Object.keys(colors || {})) {
    const v = colors[k];
    if (v && v.trim()) r.style.setProperty('--c-' + k, v);
    else r.style.removeProperty('--c-' + k);
  }
}

// Apply checkout style tokens (colors + sizes) as CSS vars under `--ck-*`.
function applyCheckoutStyle(s) {
  const r = document.documentElement;
  const setVar = (name, val) => { if (val !== undefined && val !== null && val !== '') r.style.setProperty(name, val); };
  setVar('--ck-bg',        s.bg);
  setVar('--ck-card',      s.cardBg);
  setVar('--ck-on-dark',   s.textOnDark);
  setVar('--ck-on-card',   s.textOnCard);
  setVar('--ck-accent',    s.accent);
  setVar('--ck-step-done', s.stepDoneClr);
  setVar('--ck-sum-bg',    s.sumBg);
  setVar('--ck-sum-text',  s.sumText);
  if (s.titleSize)        r.style.setProperty('--ck-fs-title',  s.titleSize + 'px');
  if (s.subSize)          r.style.setProperty('--ck-fs-sub',    s.subSize + 'px');
  if (s.stepLabelSize)    r.style.setProperty('--ck-fs-step',   s.stepLabelSize + 'px');
  if (s.fieldLabelSize)   r.style.setProperty('--ck-fs-flbl',   s.fieldLabelSize + 'px');
  if (s.fieldInputSize)   r.style.setProperty('--ck-fs-input',  s.fieldInputSize + 'px');
  if (s.ctaSize)          r.style.setProperty('--ck-fs-cta',    s.ctaSize + 'px');
  if (s.summaryHdSize)    r.style.setProperty('--ck-fs-sum-hd', s.summaryHdSize + 'px');
  if (s.summaryItemSize)  r.style.setProperty('--ck-fs-sum-it', s.summaryItemSize + 'px');
  if (s.summaryTotalSize) r.style.setProperty('--ck-fs-sum-tot', s.summaryTotalSize + 'px');
}

function useContentStore() {
  const [content, setContent] = React.useState(loadContent);
  const syncedRef      = React.useRef(false);
  const remoteRef      = React.useRef(false); // true cuando el cambio viene de Supabase Realtime

  // Carga inicial + suscripción Realtime a cambios de contenido
  React.useEffect(() => {
    var ANON         = 'sb_publishable_ZLrj11-7GjIE8gEiwybtvQ_6e4NZ07p';
    var SUPABASE_URL = 'https://txrpxzsqqomdlnxmyvxn.supabase.co';

    function applyRemote(data) {
      var merged = migrateContent(deepMerge(DEFAULT_CONTENT, data));
      remoteRef.current = true;
      setContent(merged);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)); } catch(e) {}
    }

    // Si el SDK de Supabase está cargado, usarlo (habilita Realtime)
    if (window.supabase && window.supabase.createClient) {
      var client = window.supabase.createClient(SUPABASE_URL, ANON);
      window._ruahSbClient = client;

      // Initialize from localStorage so remote never overwrites newer local data
      var localContent = loadContent();
      var lastSavedAt = localContent._savedAt || 0;

      // Carga inicial — solo aplica si Supabase es MÁS NUEVO que localStorage
      client.from('content').select('data').eq('key', 'main').limit(1).single()
        .then(function(res) {
          if (res.data && res.data.data) {
            var remote = res.data.data;
            if ((remote._savedAt || 0) > lastSavedAt) {
              lastSavedAt = remote._savedAt;
              applyRemote(remote);
            }
          }
        })
        .catch(function(){})
        .finally(function() { syncedRef.current = true; });

      // Realtime Broadcast — actualización inmediata cuando el admin guarda
      var channel = client.channel('content-main')
        .on('broadcast', { event: 'content-updated' }, function(payload) {
          if (payload.payload && payload.payload.data) {
            var bd = payload.payload.data;
            if ((bd._savedAt || 0) > lastSavedAt) {
              lastSavedAt = bd._savedAt || 0;
              applyRemote(bd);
            }
          }
        })
        .subscribe();

      // Polling de respaldo cada 30s — garantiza sync aunque el Realtime falle
      function pollSupabase() {
        client.from('content').select('data').eq('key', 'main').limit(1).single()
          .then(function(res) {
            if (res.data && res.data.data) {
              var remote = res.data.data;
              var remoteTs = remote._savedAt || 0;
              if (remoteTs > lastSavedAt) {
                lastSavedAt = remoteTs;
                applyRemote(remote);
              }
            }
          }).catch(function(){});
      }
      var pollInterval = setInterval(pollSupabase, 30000);

      return function() { client.removeChannel(channel); clearInterval(pollInterval); };
    }

    // Fallback sin SDK: carga una vez con fetch
    fetch(SUPABASE_URL + '/rest/v1/content?key=eq.main&limit=1', {
      headers: { 'apikey': ANON, 'Authorization': 'Bearer ' + ANON }
    })
    .then(function(r) { return r.json(); })
    .then(function(rows) {
      if (rows && rows[0] && rows[0].data) applyRemote(rows[0].data);
    })
    .catch(function(){})
    .finally(function() { syncedRef.current = true; });
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--ivory', content.theme.ivory);
    root.style.setProperty('--amber', content.theme.amber);
    root.style.setProperty('--gray',  content.theme.gray);
    root.style.setProperty('--black', content.theme.black);
    applyTypography(content.typography);
    applyColors(content.colors || {});
    applyCheckoutStyle((content.checkout && content.checkout.style) || {});
    if (syncedRef.current && !remoteRef.current) {
      // Solo guardar si el cambio lo inició el admin (no si vino de Realtime)
      saveContent(content);
    } else {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(content)); } catch(e) {}
    }
    remoteRef.current = false;
  }, [content]);

  const update = React.useCallback((path, value) => {
    setContent(prev => {
      const next = structuredClone(prev);
      const keys = path.split('.');
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  const updateList = React.useCallback((path, mutator) => {
    setContent(prev => {
      const next = structuredClone(prev);
      const keys = path.split('.');
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      const lastKey = keys[keys.length - 1];
      cur[lastKey] = mutator([...cur[lastKey]]);
      return next;
    });
  }, []);

  const reset = React.useCallback(() => {
    if (confirm('¿Restablecer TODO el contenido al estado original? Esta acción no se puede deshacer.')) {
      setContent(DEFAULT_CONTENT);
    }
  }, []);

  const exportJSON = React.useCallback(() => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ruah-content-' + Date.now() + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [content]);

  const importJSON = React.useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        setContent(migrateContent(deepMerge(DEFAULT_CONTENT, parsed)));
      } catch (err) {
        alert('Archivo inválido');
      }
    };
    reader.readAsText(file);
  }, []);

  return { content, setContent, update, updateList, reset, exportJSON, importJSON };
}

Object.assign(window, { DEFAULT_CONTENT, useContentStore, loadContent, saveContent, deepMerge, applyColors, applyCheckoutStyle });
