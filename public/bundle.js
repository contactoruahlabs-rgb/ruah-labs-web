/* supabase-rest */
// RUAH LABS — Cliente Supabase REST (fetch nativo, sin CDN)
(function () {
  var BASE = 'https://txrpxzsqqomdlnxmyvxn.supabase.co/rest/v1';
  var ANON = 'sb_publishable_ZLrj11-7GjIE8gEiwybtvQ_6e4NZ07p';
  function headers(key) {
    return {
      'apikey': key,
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/json'
    };
  }

  function client(key) {
    return {
      from: function (tbl) {
        return {
          // SELECT col WHERE field = val LIMIT 1
          select: function (cols) {
            return {
              eq: function (col, val) {
                return {
                  single: function () {
                    var url = BASE + '/' + tbl + '?select=' + (cols || '*') +
                              '&' + col + '=eq.' + encodeURIComponent(val) + '&limit=1';
                    return fetch(url, { headers: headers(key) })
                      .then(function (r) { return r.json(); })
                      .then(function (rows) { return { data: (rows && rows[0]) || null, error: null }; })
                      .catch(function (e) { return { data: null, error: e }; });
                  }
                };
              }
            };
          },
          // INSERT
          insert: function (row) {
            return fetch(BASE + '/' + tbl, {
              method: 'POST',
              headers: Object.assign({}, headers(key), { 'Prefer': 'return=minimal' }),
              body: JSON.stringify(row)
            })
              .then(function (r) { return r.ok ? { error: null } : r.json().then(function (e) { return { error: e }; }); })
              .catch(function (e) { return { error: e }; });
          },
          // UPSERT (merge-duplicates)
          upsert: function (row) {
            return fetch(BASE + '/' + tbl, {
              method: 'POST',
              headers: Object.assign({}, headers(key), { 'Prefer': 'return=minimal,resolution=merge-duplicates' }),
              body: JSON.stringify(row)
            })
              .then(function (r) { return r.ok ? { error: null } : r.json().then(function (e) { return { error: e }; }); })
              .catch(function (e) { return { error: e }; });
          }
        };
      }
    };
  }

  window.ruahDb = client(ANON); // anon key: lecturas públicas + inserts permitidos por RLS
})();


/* data */
/* global React */
// ============================================================
// RUAH LABS — Default content + content store
// ============================================================

async function hashPwd(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str.trim().toLowerCase()));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function sanitize(str) {
  if (typeof DOMPurify !== 'undefined') return DOMPurify.sanitize(str, {
    ALLOWED_TAGS: []
  });
  return String(str || '').replace(/<[^>]*>/g, '');
}
const DEFAULT_CONTENT = {
  launch: {
    active: false,
    imageMobile: 'https://res.cloudinary.com/dh05zwrbp/image/upload/v1781610879/1_qrplpp.jpg',
    imageDesktop: 'https://res.cloudinary.com/dh05zwrbp/image/upload/v1781610878/2_ybcfx3.jpg'
  },
  brand: {
    name: 'RUAH LABS',
    tagline: 'LABORATORIO CREATIVO',
    instagram: '@ruahlabs',
    location: 'Santiago, Chile · Envíos a todo Chile'
    // NOTA SEGURIDAD: las contraseñas (admin y club) viven en el servidor.
    // Admin = Supabase Auth (JWT). Club = bcrypt en Railway (CLUB_PASSWORD_HASH).
    // NUNCA volver a guardar hashes aquí: este objeto se sirve público.
  },
  theme: {
    ivory: '#f5f1e8',
    amber: '#eca10c',
    gray: '#6b6b62',
    black: '#0a0a0a'
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
    monoWeight: 400
  },
  nav: {
    links: [{
      id: 'l2',
      label: 'Comprar',
      href: '#productos',
      dropdown: true
    }, {
      id: 'l6',
      label: 'Iglesias',
      href: '#iglesias'
    }, {
      id: 'l7',
      label: 'Eventos',
      href: '#evento'
    }, {
      id: 'l8',
      label: 'Personalizados',
      href: '#design'
    }],
    cta: {
      label: 'Contacto',
      href: '#contacto'
    }
  },
  colors: {
    // All values default to empty string ('') — when empty the design uses its
    // built-in default. Setting any value applies it globally as --c-<key>.
  },
  home: {
    intro: {
      eyebrow: 'SANTIAGO · CHILE · EST. 2023',
      text: 'Diseñamos y estampamos para iglesias, marcas y eventos. Cada prenda activa el Protocolo 1×1 — una prenda vendida, una prenda donada.'
    },
    featured: [{
      id: 'f1',
      img: '',
      gallery: [],
      name: 'POLERA DESTACADA',
      price: '18.990',
      tag: 'NUEVO',
      productId: 'p1'
    }, {
      id: 'f2',
      img: '',
      gallery: [],
      name: 'POLERÓN DESTACADO',
      price: '34.990',
      tag: 'EXCLUSIVO',
      productId: 'p2'
    }],
    carousel: {
      title: 'EXPLORAR POR CATEGORÍA',
      items: []
    }
  },
  design: {
    piezas: [{
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
      estado: 'visible'
    }]
  },
  hero: {
    bgType: 'video',
    videoBgDesktop: '',
    videoBgMobile: '',
    imageBgDesktop: '',
    imageBgMobile: '',
    eyebrow: 'EST. SANTIAGO · CHILE',
    titleLine1: 'FE',
    titleLine2: 'PUESTA EN',
    titleLine3: 'ACCIÓN',
    accentWord: 'ACCIÓN',
    lede: 'Cada prenda que sale de nuestro taller activa el Protocolo 1×1\nEstampado y sublimación profesional para iglesias, marcas y eventos.\nUna prenda vendida ES una prenda donada a la calle.',
    primaryCta: {
      label: 'Ver productos',
      href: '#productos',
      show: true
    },
    secondaryCta: {
      label: 'Cotizar proyecto',
      href: '#contacto',
      show: false
    },
    marquee: 'ESTAMPADO PROFESIONAL · SUBLIMACIÓN · ASESORÍA CREATIVA · MERCH · IGLESIAS · EVENTOS · DROPS LIMITADOS',
    heroPrice: 'Desde $12.990 · Envío a todo Chile'
  },
  about: {
    eyebrow: '[ 00 ] QUIÉNES SOMOS',
    title: 'UN LABORATORIO',
    titleEm: 'CRISTIANO.',
    sub: 'Diseñamos, estampamos y financiamos una misión real con cada prenda que sale del taller.',
    body: ['Somos Ruah Labs, un laboratorio creativo cristiano. Diseñamos y producimos todo para Jesús y Dios — trabajamos enfocados en Él.', 'Nuestra misión es vestir la palabra de manera auténtica y, al mismo tiempo, ayudar a personas en situación de calle. Por cada prenda o servicio que vendemos, regalamos una prenda filtrada y lavada a alguien que la necesita. La gente quiere ayudar pero no sabe cómo: nosotros somos el canal.', 'No subimos a la gente que ayudamos a redes sociales. La gente en situación de calle no es contenido. La transparencia existe porque debe existir, no porque es marketing.'],
    pillars: [{
      id: 'a1',
      num: '01',
      title: 'Fe en acción',
      desc: 'Esto no es institución, es fe puesta en práctica. Sin show, sin televisión, todo en anonimato.'
    }, {
      id: 'a2',
      num: '02',
      title: 'Calidad profesional',
      desc: 'Diseño autoral, estampado de larga duración. Sin plantillas. Sin atajos.'
    }, {
      id: 'a3',
      num: '03',
      title: 'Comunidad real',
      desc: 'Cada cliente pasa a ser parte del movimiento. Reuniones, rutas, oración y registro privado.'
    }, {
      id: 'a4',
      num: '04',
      title: 'Donación con dignidad',
      desc: 'Filtramos cada prenda donada. Si tú no la usarías, no sirve para donar. Lavada y entregada en mano.'
    }],
    metrics: [{
      id: 'am1',
      num: '742',
      lbl: 'Prendas entregadas a la calle'
    }, {
      id: 'am2',
      num: '34',
      lbl: 'Iglesias aliadas'
    }, {
      id: 'am3',
      num: '127',
      lbl: 'Miembros de Ruah Labs Club'
    }]
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
    sections: [{
      id: 'ps1',
      heading: '¿POR QUÉ DE SEGUNDA MANO?',
      body: 'En Chile los operativos policiales desarman las casas provisorias de la gente en situación de calle, botando todas sus pertenencias a la basura. Donar prendas nuevas caras no tiene sentido — se las quitan o se las botan. Donamos ropa real, útil, reemplazable, abrigada. La que tú tampoco botarías.'
    }, {
      id: 'ps2',
      heading: 'FILTRO',
      body: '"Si no la ocuparías, no sirve para donar." Ese es el primer filtro. Después seleccionamos por talla, género y prenda. Lavamos. Doblamos. Empacamos.'
    }, {
      id: 'ps3',
      heading: 'REGISTRO',
      body: 'Cuando salimos a entregar, pedimos un saludo (cámara al piso, nunca de frente). Te llega ese registro a tu correo: "Gracias a ti llegó esta prenda." No es marketing. Es transparencia.'
    }],
    quoteRef: 'MATEO 6:3-4',
    quoteText: '"Cuando des a los necesitados, que no se entere tu mano izquierda de lo que hace la derecha, para que tu limosna sea en secreto. Así tu Padre, que ve lo que se hace en secreto, te recompensará."',
    flowTitle: 'FLUJO INTERNO',
    flow: [{
      id: 'pf1',
      num: '01',
      name: 'COMPRA REGISTRADA',
      detail: '+ correo + nombre'
    }, {
      id: 'pf2',
      num: '02',
      name: 'SELECCIÓN DE PRENDA',
      detail: 'Talla / género match'
    }, {
      id: 'pf3',
      num: '03',
      name: 'FILTRO Y LAVADO',
      detail: 'Equipo acopio'
    }, {
      id: 'pf4',
      num: '04',
      name: 'SALIDA RUTA',
      detail: 'Domingo / miércoles'
    }, {
      id: 'pf5',
      num: '05',
      name: 'REGISTRO ENTREGA',
      detail: 'Cámara al piso'
    }, {
      id: 'pf6',
      num: '06',
      name: 'EMAIL AL CLIENTE',
      detail: 'Video / foto · 1 línea'
    }],
    teamTitle: 'EQUIPO',
    teamMeta: 'ANÓNIMO',
    teamCaption: 'FOTO ESPALDA · RUTA',
    teamImg: '',
    activateCta: 'ACTIVAR PROTOCOLO (COMPRAR)',
    activateHref: '#productos',
    // Legacy stats (kept for compatibility with admin/club; not shown in new layout)
    eyebrow: '[ 01 ] EL PROTOCOLO',
    stats: [{
      id: 's1',
      num: '742',
      lbl: 'Prendas donadas'
    }, {
      id: 's2',
      num: '128',
      lbl: 'Rutas realizadas'
    }, {
      id: 's3',
      num: '34',
      lbl: 'Iglesias aliadas'
    }]
  },
  services: {
    eyebrow: '[ 02 ] SERVICIOS',
    title: 'LO QUE',
    titleEm: 'HACEMOS',
    sub: 'Trabajamos con tu visión desde el archivo hasta la última costura. Diseño profesional, estampado de larga duración, plazos cortos.',
    items: [{
      id: 'sv1',
      name: 'Estampado profesional',
      desc: 'DTF, vinilo, serigrafía y sublimación sobre algodón, poliéster y mezclas. Durabilidad garantizada lavada tras lavada.'
    }, {
      id: 'sv2',
      name: 'Iglesias y eventos',
      desc: 'Poleras, polerones y merch para retiros, bautizos, matrimonios, congresos y campañas. Producción coordinada con tu equipo.'
    }, {
      id: 'sv3',
      name: 'Eventos',
      desc: 'Diseño y producción de merchandising para conferencias, festivales, conciertos y activaciones. Entrega rápida, calidad garantizada.'
    }, {
      id: 'sv4',
      name: 'Asesoría creativa',
      desc: 'Identidad visual, naming, manual de marca y contenido distintivo. Tu marca, lista para vestirse.'
    }, {
      id: 'sv5',
      name: 'Diseños personalizados',
      desc: 'Tu versículo, tu idea, tu tipografía. Diseño autoral hecho por una diseñadora profesional, sin plantillas.'
    }, {
      id: 'sv6',
      name: 'RUAH Live',
      desc: 'Estación de estampado en vivo para matrimonios, cumpleaños, baby showers, corporativos y activaciones. Tus invitados eligen, ven cómo se hace, y se llevan algo único en menos de dos minutos.'
    }, {
      id: 'sv7',
      name: 'Cuadros decorativos',
      desc: 'Piezas minimalistas y disruptivas para casa, oficina e iglesia. Todo centrado en Cristo.'
    }]
  },
  products: {
    eyebrow: '[ 03 ] CATÁLOGO',
    title: 'PRENDAS QUE',
    titleEm: 'PREDICAN',
    sub: 'Drops limitados, básicos siempre disponibles y piezas exclusivas. Cada compra activa el Protocolo 1×1.',
    categories: [{
      id: 'c-all',
      name: 'Todo',
      slug: 'todo'
    }, {
      id: 'c1',
      name: 'Poleras',
      slug: 'poleras'
    }, {
      id: 'c2',
      name: 'Polerones',
      slug: 'polerones'
    }, {
      id: 'c3',
      name: 'Chaquetas',
      slug: 'chaquetas'
    }, {
      id: 'c4',
      name: 'Gorros',
      slug: 'gorros'
    }, {
      id: 'c5',
      name: 'Cuadros',
      slug: 'cuadros'
    }, {
      id: 'c6',
      name: 'Accesorios',
      slug: 'accesorios'
    }],
    items: [{
      id: 'p1',
      categoryId: 'c1',
      name: 'Polera Salmo 23',
      verse: 'SAL. 23:1',
      price: '18.990',
      tag: 'DROP 04',
      tagStyle: 'amber',
      img: '',
      gallery: [],
      stockType: 'limitado',
      stockTotal: 24,
      description: 'Polera de algodón premium estampada en serigrafía profesional. El versículo Salmo 23:1 trabajado tipográficamente con composición de autor — una pieza para vestir la palabra todos los días.',
      details: [{
        id: 'd1',
        label: 'Material',
        value: 'Algodón premium 220 gsm'
      }, {
        id: 'd2',
        label: 'Estampado',
        value: 'Serigrafía a 2 tintas, alta durabilidad'
      }, {
        id: 'd3',
        label: 'Fit',
        value: 'Oversize relajado, unisex'
      }, {
        id: 'd4',
        label: 'Tallas',
        value: 'S · M · L · XL · XXL'
      }, {
        id: 'd5',
        label: 'Origen',
        value: 'Diseñado y producido en Santiago, Chile'
      }]
    }, {
      id: 'p2',
      categoryId: 'c2',
      name: 'Polerón Imago Dei',
      verse: 'GEN. 1:27',
      price: '34.990',
      tag: 'EXCLUSIVO',
      tagStyle: 'amber',
      img: '',
      gallery: [],
      stockType: 'limitado',
      stockTotal: 12,
      description: 'Polerón con capucha de algodón perchado. Estampado frontal y dorsal con composición tipográfica del versículo. Pieza exclusiva del drop de invierno, producción limitada a 80 unidades.',
      details: [{
        id: 'd1',
        label: 'Material',
        value: 'Algodón perchado 320 gsm'
      }, {
        id: 'd2',
        label: 'Estampado',
        value: 'DTF de alta resolución frontal y dorsal'
      }, {
        id: 'd3',
        label: 'Fit',
        value: 'Boxy crop relajado'
      }, {
        id: 'd4',
        label: 'Tallas',
        value: 'S · M · L · XL'
      }]
    }, {
      id: 'p3',
      categoryId: 'c1',
      name: 'Polera Lux In Tenebris',
      verse: 'JN. 1:5',
      price: '18.990',
      tag: 'BÁSICO',
      tagStyle: 'soft',
      img: '',
      gallery: [],
      description: 'Una de las prendas básicas siempre disponibles de la colección. Composición sutil en el pecho y versículo a la espalda — para usar todos los días sin pensar.',
      details: [{
        id: 'd1',
        label: 'Material',
        value: 'Algodón 200 gsm'
      }, {
        id: 'd2',
        label: 'Estampado',
        value: 'Vinilo textil mate'
      }, {
        id: 'd3',
        label: 'Fit',
        value: 'Regular unisex'
      }, {
        id: 'd4',
        label: 'Tallas',
        value: 'XS · S · M · L · XL · XXL'
      }]
    }, {
      id: 'p4',
      categoryId: 'c2',
      name: 'Buzo Selah',
      verse: 'SAL. 46:10',
      price: '42.990',
      tag: 'DROP 04',
      tagStyle: 'amber',
      img: '',
      gallery: [],
      stockType: 'limitado',
      stockTotal: 15,
      description: 'Conjunto de polerón y pantalón de algodón perchado. Estampado discreto en pierna y pecho. La palabra Selah — "pausa, escucha" — recorre el costado.',
      details: [{
        id: 'd1',
        label: 'Material',
        value: 'Algodón perchado 330 gsm'
      }, {
        id: 'd2',
        label: 'Incluye',
        value: 'Polerón + pantalón'
      }, {
        id: 'd3',
        label: 'Tallas',
        value: 'S · M · L · XL'
      }]
    }, {
      id: 'p5',
      categoryId: 'c1',
      name: 'Polera Soli Deo Gloria',
      verse: 'ROM. 11:36',
      price: '18.990',
      tag: 'BÁSICO',
      tagStyle: 'soft',
      img: '',
      gallery: [],
      description: 'Frase de las cinco sola de la Reforma. Estampado tipográfico minimalista de gran formato a la espalda. Algodón premium, disponible todo el año.',
      details: [{
        id: 'd1',
        label: 'Material',
        value: 'Algodón premium 220 gsm'
      }, {
        id: 'd2',
        label: 'Estampado',
        value: 'Serigrafía 1 tinta'
      }, {
        id: 'd3',
        label: 'Tallas',
        value: 'S · M · L · XL · XXL'
      }]
    }, {
      id: 'p6',
      categoryId: 'c3',
      name: 'Chaqueta Coram Deo',
      verse: 'PROV. 15:3',
      price: '58.990',
      tag: 'EXCLUSIVO',
      tagStyle: 'amber',
      img: '',
      gallery: [],
      stockType: 'limitado',
      stockTotal: 8,
      description: 'Chaqueta sherpa con forro polar. Una pieza para resistir el invierno santiaguino. Tag bordado interior con Proverbios 15:3.',
      details: [{
        id: 'd1',
        label: 'Material',
        value: 'Sherpa exterior + forro polar'
      }, {
        id: 'd2',
        label: 'Estampado',
        value: 'Bordado en pecho y etiqueta interior'
      }, {
        id: 'd3',
        label: 'Tallas',
        value: 'S · M · L · XL'
      }]
    }, {
      id: 'p7',
      categoryId: 'c4',
      name: 'Gorro Maranatha',
      verse: '1 COR. 16:22',
      price: '12.990',
      tag: 'BÁSICO',
      tagStyle: 'soft',
      img: '',
      gallery: [],
      description: 'Beanie tejido de lana acrílica con etiqueta bordada. "Maranatha — el Señor viene". Pieza para todo el año.',
      details: [{
        id: 'd1',
        label: 'Material',
        value: 'Acrílico tejido grueso'
      }, {
        id: 'd2',
        label: 'Detalle',
        value: 'Etiqueta bordada'
      }, {
        id: 'd3',
        label: 'Talla',
        value: 'Única'
      }]
    }, {
      id: 'p8',
      categoryId: 'c5',
      name: 'Cuadro Sola Scriptura',
      verse: '2 TIM. 3:16',
      price: '28.990',
      tag: 'EXCLUSIVO',
      tagStyle: 'amber',
      img: '',
      gallery: [],
      stockType: 'limitado',
      stockTotal: 5,
      description: 'Cuadro decorativo con marco de madera natural. Composición tipográfica minimalista impresa en papel algodón. Tres tamaños disponibles.',
      details: [{
        id: 'd1',
        label: 'Material',
        value: 'Papel algodón 300g + marco de pino'
      }, {
        id: 'd2',
        label: 'Tamaños',
        value: '30×40 · 40×60 · 50×70 cm'
      }, {
        id: 'd3',
        label: 'Detalle',
        value: 'Numerado y firmado a mano'
      }]
    }, {
      id: 'p9',
      categoryId: 'c6',
      name: 'Totebag Ebenezer',
      verse: '1 SAM. 7:12',
      price: '9.990',
      tag: 'BÁSICO',
      tagStyle: 'soft',
      img: '',
      gallery: [],
      description: 'Bolso de lona estampado en serigrafía. Resistente, lavable, para el día a día. "Hasta aquí nos ayudó Jehová".',
      details: [{
        id: 'd1',
        label: 'Material',
        value: 'Lona 100% algodón'
      }, {
        id: 'd2',
        label: 'Medidas',
        value: '38 × 42 cm'
      }]
    }]
  },
  cuadros: {
    comingSoon: true,
    comingSoonVideo: 'https://res.cloudinary.com/dh05zwrbp/video/upload/v1781484605/ruahlabs/cuadros-coming-soon.mp4',
    comingSoonVideoDesktop: 'https://res.cloudinary.com/dh05zwrbp/video/upload/v1781494045/ruahlabs/cuadros-coming-soon-desktop.mp4',
    headerIndex: '§05  /  06',
    headerTitle: 'CUADROS',
    headerRight: 'MINIMALISTA · DISRUPTIVO · 1/1',
    title1: 'CUADROS',
    title2: 'QUE PREDICAN',
    title3: 'SIN GRITAR.',
    accentWord: '',
    lede: 'Hacemos cuadros minimalistas o disruptivos. Siempre cristianos, siempre centrados en Cristo. Para casa, café u oficina. Encargo personalizado: tú eliges versículo, formato y dirección.',
    styles: [{
      id: 'cs1',
      tag: 'MINIMAL',
      desc: 'TIPO · NEGRO/CRUDO',
      img: ''
    }, {
      id: 'cs2',
      tag: 'DISRUPTIVO',
      desc: 'COLLAGE · TEXTURAS',
      img: ''
    }, {
      id: 'cs3',
      tag: 'MURAL',
      desc: 'GRAN FORMATO',
      img: ''
    }, {
      id: 'cs4',
      tag: 'LETTERING',
      desc: 'MANUSCRITO',
      img: ''
    }],
    briefEyebrow: '[ ENCARGO PERSONALIZADO ]',
    briefTitle: 'BRIEF EN 4 PASOS',
    briefSub: 'Cuéntanos qué pieza quieres. Cotizamos en menos de 48h. Producción 7–14 días.',
    steps: [{
      id: 'st1',
      num: '01',
      name: 'EXPLORAR'
    }, {
      id: 'st2',
      num: '02',
      name: 'ESTILO'
    }, {
      id: 'st3',
      num: '03',
      name: 'FORMATO'
    }, {
      id: 'st4',
      num: '04',
      name: 'ENVIAR'
    }],
    // Step 01 - EXPLORAR
    step1Body: 'Revisa los estilos y referencias antes de decidir. Cada cuadro es único; no producimos en serie.',
    refs: [{
      id: 'cr1',
      code: 'REF 01',
      name: 'MINIMAL',
      meta: 'Tipografía · 40×60 cm · Marco roble',
      img: ''
    }, {
      id: 'cr2',
      code: 'REF 02',
      name: 'DISRUPT',
      meta: 'Collage · 50×70 cm · Papel algodón',
      img: ''
    }, {
      id: 'cr3',
      code: 'REF 03',
      name: 'MURAL',
      meta: 'Gran formato · 120×180 cm · Vinilo',
      img: ''
    }],
    // Step 02 - ESTILO
    estilos: [{
      id: 'ce1',
      name: 'MINIMALISTA B/N'
    }, {
      id: 'ce2',
      name: 'DISRUPTIVO / COLLAGE'
    }, {
      id: 'ce3',
      name: 'MANUSCRITO'
    }, {
      id: 'ce4',
      name: 'MURAL GRAN FORMATO'
    }, {
      id: 'ce5',
      name: 'LETTERING SERIF'
    }, {
      id: 'ce6',
      name: 'COLOR BLOCK'
    }],
    // Step 03 - FORMATO
    formatos: [{
      id: 'cf1',
      size: '30×40',
      price: '$59.990'
    }, {
      id: 'cf2',
      size: '50×70',
      price: '$129.990'
    }, {
      id: 'cf3',
      size: '70×100',
      price: '$219.990'
    }, {
      id: 'cf4',
      size: 'MURAL',
      price: 'COTIZAR'
    }],
    // Step 04 - ENVIAR
    sendFields: [{
      id: 'cf1',
      label: 'NOMBRE',
      placeholder: 'Tu nombre',
      type: 'text'
    }, {
      id: 'cf2',
      label: 'EMAIL',
      placeholder: 'tu@correo.cl',
      type: 'email'
    }, {
      id: 'cf3',
      label: 'VERSÍCULO O FRASE',
      placeholder: 'Ej: Mateo 6:33',
      type: 'text'
    }, {
      id: 'cf4',
      label: 'NOTAS',
      placeholder: 'Para qué espacio, qué siente, qué evita...',
      type: 'textarea'
    }],
    sendSubmit: 'ENVIAR BRIEF',
    productsEyebrow: '[ CATÁLOGO CUADROS ]',
    productsTitle: 'CUADROS',
    productsTitleEm: 'EN VENTA',
    productsSub: 'Piezas únicas, producidas bajo encargo. No trabajamos en serie. Cada cuadro tiene su historia.',
    products: [{
      id: 'cq1',
      name: 'Sola Scriptura',
      style: 'MINIMAL B/N',
      price: '59.990',
      size: '30×40 cm',
      tag: 'STOCK',
      img: '',
      gallery: [],
      description: 'Pieza tipográfica minimalista centrada en Cristo. Papel algodón 300g, marco pino natural. Numerada y firmada a mano.',
      details: [{
        id: 'd1',
        label: 'Formato',
        value: '30×40 cm'
      }, {
        id: 'd2',
        label: 'Material',
        value: 'Papel algodón 300g + marco pino'
      }, {
        id: 'd3',
        label: 'Estilo',
        value: 'Minimalista B/N'
      }, {
        id: 'd4',
        label: 'Producción',
        value: '7–14 días hábiles'
      }]
    }, {
      id: 'cq2',
      name: 'Imago Dei',
      style: 'DISRUPTIVO',
      price: '129.990',
      size: '50×70 cm',
      tag: 'ENCARGO',
      img: '',
      gallery: [],
      description: 'Collage tipográfico de gran formato. Texturas superpuestas, composición autoral. Cada pieza es única.',
      details: [{
        id: 'd1',
        label: 'Formato',
        value: '50×70 cm'
      }, {
        id: 'd2',
        label: 'Material',
        value: 'Papel algodón 300g + marco roble'
      }, {
        id: 'd3',
        label: 'Estilo',
        value: 'Disruptivo / Collage'
      }, {
        id: 'd4',
        label: 'Producción',
        value: '10–14 días hábiles'
      }]
    }, {
      id: 'cq3',
      name: 'Coram Deo',
      style: 'LETTERING',
      price: '89.990',
      size: '40×60 cm',
      tag: 'STOCK',
      img: '',
      gallery: [],
      description: 'Lettering manuscrito sobre papel algodón. Marco madera natural. La presencia de Dios en cada pared.',
      details: [{
        id: 'd1',
        label: 'Formato',
        value: '40×60 cm'
      }, {
        id: 'd2',
        label: 'Material',
        value: 'Papel algodón 300g + marco natural'
      }, {
        id: 'd3',
        label: 'Estilo',
        value: 'Lettering manuscrito'
      }, {
        id: 'd4',
        label: 'Producción',
        value: '7–14 días hábiles'
      }]
    }]
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
    services: [{
      id: 'is1',
      num: '01',
      name: 'EVENTOS',
      desc: 'Polerones, poleras y caps para retiros, congresos, campamentos.'
    }, {
      id: 'is2',
      num: '02',
      name: 'SACRAMENTOS',
      desc: 'Piezas únicas para bautizos y matrimonios. Producción cuidadosa.'
    }, {
      id: 'is3',
      num: '03',
      name: 'ASESORÍA CREATIVA',
      desc: 'Identidad completa: logo, paleta, sistema, contenido distintivo.'
    }, {
      id: 'is4',
      num: '04',
      name: 'ESTAMPADO',
      desc: 'Servicio de estampado profesional para piezas que ya tienen.'
    }],
    portfolioIndex: '§04.01  /  06',
    portfolioTitle: 'PORTAFOLIO',
    portfolioRight: 'ALGUNOS TRABAJOS',
    projects: [{
      id: 'ip1',
      code: 'PROYECTO 01',
      name: 'RETIRO 2024',
      meta: 'RETIRO 2024 · IGL. NUEVA ESPERANZA',
      img: '',
      gallery: []
    }, {
      id: 'ip2',
      code: 'PROYECTO 02',
      name: 'BAUTIZOS',
      meta: 'BAUTIZOS · COMUNIDAD ELIM',
      img: '',
      gallery: []
    }, {
      id: 'ip3',
      code: 'PROYECTO 03',
      name: 'MATRIMONIO',
      meta: 'MATRIMONIO · LP & VC',
      img: '',
      gallery: []
    }, {
      id: 'ip4',
      code: 'PROYECTO 04',
      name: 'CONGRESO JÓVENES',
      meta: 'CONGRESO JÓVENES',
      img: '',
      gallery: []
    }, {
      id: 'ip5',
      code: 'PROYECTO 05',
      name: 'ASESORÍA CREATIVA',
      meta: 'ASESORÍA CREATIVA · MINISTERIO X',
      img: '',
      gallery: []
    }, {
      id: 'ip6',
      code: 'PROYECTO 06',
      name: 'CAMPAMENTO VERANO',
      meta: 'CAMPAMENTO VERANO',
      img: '',
      gallery: []
    }],
    formEyebrow: '[ FORMULARIO DE SOLICITUD ]',
    formTitle: 'PIDE COTIZACIÓN',
    formSub: 'Respondemos en 24–48h.',
    eventOptions: ['Retiro', 'Bautizo', 'Matrimonio', 'Congreso', 'Campamento', 'Asesoría creativa', 'Estampado', 'Otro'],
    formSubmit: 'ENVIAR SOLICITUD'
  },
  manifesto: {
    text: [{
      txt: 'No vendemos ropa.',
      em: false,
      strike: false
    }, {
      txt: 'Vendemos misión',
      em: true,
      strike: false
    }, {
      txt: 'vestida de algodón.',
      em: false,
      strike: false
    }]
  },
  testimonials: {
    eyebrow: '[ 04 ] COMUNIDAD',
    title: 'LO QUE',
    titleEm: 'DICEN',
    sub: 'Iglesias, marcas y personas que adoptaron el Protocolo 1×1 como parte de su historia.',
    items: [{
      id: 't1',
      quote: 'Pedimos 80 polerones para el retiro de jóvenes y el resultado fue mejor que cualquier marca grande. Plazos cumplidos al día.',
      name: 'PASTOR DANIEL VERA',
      role: 'Iglesia Vida Nueva — Maipú',
      initial: 'D',
      img: ''
    }, {
      id: 't2',
      quote: 'El diseño es serio. La calidad es seria. Y saber que detrás hay una causa real lo cambia todo. Volveremos.',
      name: 'CAMILA MUÑOZ',
      role: 'Café Almendro — Providencia',
      initial: 'C',
      img: ''
    }, {
      id: 't3',
      quote: 'Me llegó el video del chico que recibió mi prenda donada. Lloré. Es la primera vez que comprar ropa me hace sentir parte de algo.',
      name: 'SEBASTIÁN ROJAS',
      role: 'Cliente Ruah Labs Club',
      initial: 'S',
      img: ''
    }]
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
    pillars: [{
      id: 'ev1',
      num: '01',
      title: 'Lo eligen ellos',
      desc: 'Nadie se lleva algo que no quiso. Cada invitado escoge su pieza, su versión, su versículo o su frase.'
    }, {
      id: 'ev2',
      num: '02',
      title: 'Lo ven hacerse',
      desc: 'El proceso es parte del show. La gente se acerca, mira, conversa, espera su turno. Se vuelve actividad.'
    }, {
      id: 'ev3',
      num: '03',
      title: 'Lo usan después',
      desc: 'Una taza con su nombre y la fecha queda en el escritorio. Una polera se la pone. Cada vez que la usen, se acuerdan de ti.'
    }, {
      id: 'ev4',
      num: '04',
      title: 'Lo hace una diseñadora',
      desc: 'Nos sentamos contigo antes del evento, conversamos sobre la temática, y armamos algo que se ve bien de verdad. No es un catálogo genérico.'
    }],
    forWhatTitle: 'PARA QUÉ EVENTOS',
    forWhatBody: 'Matrimonios, cumpleaños temáticos, despedidas, baby showers, bautizos, aniversarios, retiros, lanzamientos, eventos corporativos, activaciones de marca. Si hay invitados, hay souvenir.',
    onWhatTitle: 'SOBRE QUÉ ESTAMPAMOS',
    onWhatBody: 'Tú eliges. Vasos, tazas, copas, termos, botellas, poleras, totes, llaveros, destapadores, posavasos, tablas de picoteo, velas, espejos, parches, cojines. Y cosas raras que nadie regala y se vuelven el comentario de la noche. Si tienes algo en mente que no es típico, lo cotizamos.',
    detailTitle: 'EL DETALLE QUE CAMBIA TODO',
    detailBody: 'Por cada souvenir aplicado en tu evento, donamos una prenda a una persona en situación calle. Sin excepciones. Tus invitados se llevan un recuerdo. Alguien que duerme en la calle recibe abrigo. Después te llega el reporte con la entrega.',
    receiveTitle: 'LO QUE RECIBES',
    receiveItems: [{
      id: 'evr1',
      txt: 'Reunión previa con la diseñadora'
    }, {
      id: 'evr2',
      txt: 'Estación profesional el día del evento'
    }, {
      id: 'evr3',
      txt: 'Un operador o más, según el paquete'
    }, {
      id: 'evr4',
      txt: 'Souvenir terminado para cada invitado'
    }, {
      id: 'evr5',
      txt: 'Video resumen del evento'
    }, {
      id: 'evr6',
      txt: 'Reporte del Protocolo 1×1'
    }, {
      id: 'evr7',
      txt: 'Archivos digitales del diseño'
    }],
    packsTitle: 'TRES PAQUETES',
    packs: [{
      id: 'evp1',
      name: 'ESENCIAL',
      limit: 'hasta 60 invitados',
      detail: '3 horas · 1 estación',
      price: 'Desde $290.000'
    }, {
      id: 'evp2',
      name: 'PLUS',
      limit: 'hasta 150 invitados',
      detail: '5 horas · 1 estación + 2 operadores',
      price: 'Desde $490.000',
      featured: true
    }, {
      id: 'evp3',
      name: 'PREMIUM',
      limit: '200+ invitados',
      detail: 'Jornada completa · 2 estaciones',
      price: 'A cotizar'
    }],
    packsFoot: 'Te armamos el paquete según tu evento. Cotización al día siguiente de la reunión.',
    coverageTitle: 'COBERTURA',
    coverageBody: 'Todo Chile.',
    ctaEyebrow: '[ EL SIGUIENTE PASO ]',
    ctaTitle: 'AGENDA LA REUNIÓN PREVIA.',
    ctaBody: 'Sin costo, sin compromiso. Te mostramos referencias, conversamos sobre tu evento, y te enviamos la propuesta concreta.',
    ctaBtn: {
      label: 'Agendar por Instagram',
      href: 'https://instagram.com/ruahlabs'
    },
    ctaBtn2: {
      label: 'Escribir un correo',
      href: 'mailto:contacto@ruahlabs.cl'
    },
    closing: 'Tu evento, tu estética, tu temática. Nosotros ponemos el oficio. Un evento, tres bendiciones: tú celebras, tus invitados se llevan algo único, y alguien en la calle recibe abrigo.',
    instagram: '@ruahlabs',
    galleryTitle: 'MUESTRA DE EVENTOS',
    gallerySub: 'Fotos reales de estaciones en vivo que hemos llevado a matrimonios, corporativos y activaciones.',
    gallery: [{
      id: 'eg1',
      img: '',
      caption: 'Estación en vivo · Matrimonio LP & VC',
      photos: []
    }, {
      id: 'eg2',
      img: '',
      caption: 'Activación corporativa · Drop privado',
      photos: []
    }, {
      id: 'eg3',
      img: '',
      caption: 'Cumpleaños temático · Estampado al instante',
      photos: []
    }]
  },
  checkout: {
    topTag: 'CHECKOUT · ACTIVA PROTOCOLO 1×1',
    stepLabels: ['INFORMACIÓN', 'ENVÍO', 'PAGO'],
    infoTitle: 'Información de contacto',
    infoSub: 'Recibirás aquí el comprobante y el registro del Protocolo 1×1.',
    addressTitle: 'Dirección de envío',
    shippingTitle: 'Método de envío',
    shippingSub: 'Despachamos a todo Chile. Retiro disponible Lun – Vie, 11 a 19h.',
    shippingFees: {
      std: 4990,
      express: 9990,
      pickup: 0
    },
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
      bg: '#0a0a0a',
      // ck-shell background (outer dark)
      cardBg: '#0a0a0a',
      // ck-form card surface (dark)
      textOnDark: '#f5f1e8',
      // ck-top text
      textOnCard: '#ffffff',
      accent: '#eca10c',
      // active step / focus / CTA
      stepDoneClr: '#eca10c',
      sumBg: '#0a0a0a',
      // summary aside background
      sumText: '#f5f1e8',
      // Sizes
      titleSize: 36,
      subSize: 16,
      stepLabelSize: 14,
      fieldLabelSize: 13,
      fieldInputSize: 19,
      ctaSize: 14,
      summaryHdSize: 13,
      summaryItemSize: 14,
      summaryTotalSize: 22
    }
  },
  cta: {
    title: 'TU PRÓXIMO',
    titleEm: 'PROYECTO',
    titleAfter: 'EMPIEZA HOY.',
    body: 'Cotización en 24 hrs. Sin mínimos imposibles. Envíos a todo Chile.',
    primaryCta: {
      label: 'Escribir un correo',
      href: 'mailto:contacto@ruahlabs.cl?subject=Cotización%20RUAH%20LABS'
    },
    secondaryCta: {
      label: 'Ver en Instagram',
      href: 'https://instagram.com/ruahlabs'
    }
  },
  footer: {
    wordmark: 'RUAH',
    wordmarkSecret: 'LABS',
    about: 'Laboratorio creativo cristiano. Estampado, sublimación, asesoría creativa y diseño autoral. Cada compra activa el Protocolo 1×1.',
    cols: [{
      id: 'fc1',
      title: 'Sitio',
      items: [{
        id: 'i0',
        label: 'Quiénes Somos',
        href: '#nosotros'
      }, {
        id: 'i1',
        label: 'Servicios',
        href: '#servicios'
      }, {
        id: 'i2',
        label: 'Productos',
        href: '#productos'
      }, {
        id: 'i3',
        label: 'Protocolo',
        href: '#protocolo'
      }, {
        id: 'i4',
        label: 'Comunidad',
        href: '#comunidad'
      }]
    }, {
      id: 'fc2',
      title: 'Contacto',
      items: [{
        id: 'i5',
        label: 'contacto@ruahlabs.cl',
        href: 'mailto:contacto@ruahlabs.cl'
      }, {
        id: 'i7',
        label: '@ruahlabs',
        href: 'https://instagram.com/ruahlabs'
      }, {
        id: 'i8',
        label: 'Santiago · Chile',
        href: '#'
      }]
    }, {
      id: 'fc3',
      title: 'Misión',
      items: [{
        id: 'i9',
        label: 'Protocolo 1×1',
        href: '#protocolo'
      }, {
        id: 'i10',
        label: 'Donar ropa',
        href: '#contacto'
      }, {
        id: 'i11',
        label: 'Salir a ruta',
        href: '#contacto'
      }, {
        id: 'i12',
        label: 'Iglesias',
        href: '#contacto'
      }]
    }],
    bottomLeft: '© ' + new Date().getFullYear() + ' RUAH LABS · TODO POR JESÚS',
    bottomRight: 'SOMOS MÁS DE LOS QUE CREES'
  },
  envios: {
    headerIndex: '§ ENVÍOS',
    title: 'ENVÍOS Y',
    titleEm: 'DEVOLUCIONES',
    intro: 'Despachamos a todo Chile. Aquí encuentras los tiempos, los costos y cómo solicitar un cambio o devolución.',
    blocks: [{
      id: 'en1',
      title: 'Tiempos de entrega',
      body: 'Región Metropolitana: 2 a 4 días hábiles. Regiones: 4 a 7 días hábiles. Despachamos dentro de 1 a 2 días hábiles tras confirmarse el pago.'
    }, {
      id: 'en2',
      title: 'Costos de envío',
      body: 'Envío estándar: $4.990. Envío express: $9.990. Retiro en tienda: gratis (Lun a Vie, 11 a 19h, coordinando antes).'
    }, {
      id: 'en3',
      title: 'Seguimiento',
      body: 'Al despachar tu pedido te enviamos el número de seguimiento al correo registrado en la compra.'
    }, {
      id: 'en4',
      title: 'Cambios de talla',
      body: 'Tienes 30 días desde la recepción para solicitar un cambio, sujeto a stock. La prenda debe estar sin uso, con etiquetas y en su empaque original.'
    }, {
      id: 'en5',
      title: 'Devoluciones',
      body: 'Si el producto llega con falla de fábrica lo reponemos o te devolvemos el 100% del valor. Escríbenos con tu número de pedido y una foto.'
    }, {
      id: 'en6',
      title: 'Cómo solicitar',
      body: 'Escríbenos a contacto@ruahlabs.cl o por Instagram @ruahlabs indicando tu número de pedido. Te respondemos en un máximo de 48 horas hábiles.'
    }]
  },
  club: {
    heroEyebrow: '◉ ACCESO PRIVILEGIADO',
    title: 'RUAH LABS',
    titleEm: 'CLUB',
    frase: 'No es marketing. Es iglesia. Aquí coordinamos las rutas, organizamos reuniones secretas, transparentamos la ayuda y nos cuidamos entre nosotros. Bienvenido al movimiento.',
    panels: [{
      id: 'cp1',
      ttl: 'MIEMBROS ACTIVOS',
      big: '127',
      desc: 'Hermanos y hermanas en la red. Crecemos en silencio.'
    }, {
      id: 'cp2',
      ttl: 'PRÓXIMA RUTA',
      big: '12.06',
      desc: 'Patronato — entrega nocturna. 9 personas anotadas.'
    }, {
      id: 'cp3',
      ttl: 'PROTOCOLO 1×1',
      big: '742',
      desc: 'Prendas entregadas a la fecha. Cada una con su historia.'
    }],
    routes: [{
      id: 'r1',
      name: 'Patronato Norte',
      date: '12 JUN · 21:00',
      meta: 'Punto: Plaza Brasil · 9 personas anotadas · 40 prendas listas',
      joined: false
    }, {
      id: 'r2',
      name: 'Estación Central',
      date: '19 JUN · 20:30',
      meta: 'Punto: Av. Alameda · Buscamos 6 personas más · 60 prendas listas',
      joined: false
    }, {
      id: 'r3',
      name: 'Mapocho Sur',
      date: '26 JUN · 21:00',
      meta: 'Punto: Puente Recoleta · 4 personas anotadas · 35 prendas + comida',
      joined: false
    }, {
      id: 'r4',
      name: 'Bellavista Centro',
      date: '03 JUL · 21:30',
      meta: 'Punto: Pío Nono · Coordinador: Daniel · 25 prendas exclusivas',
      joined: false
    }],
    meetings: [{
      id: 'm1',
      day: '15',
      mon: 'JUN',
      name: 'Estudio Bíblico',
      det: 'Romanos 12. Casa de Marcela — Ñuñoa. 19:30 hrs.'
    }, {
      id: 'm2',
      day: '22',
      mon: 'JUN',
      name: 'Reunión de Coordinación',
      det: 'Logística de drops y rutas Q3. Online — 20:00 hrs.'
    }, {
      id: 'm3',
      day: '29',
      mon: 'JUN',
      name: 'Oración por la calle',
      det: 'Vigilia mensual. Iglesia La Roca — Maipú. 21:00 hrs.'
    }, {
      id: 'm4',
      day: '06',
      mon: 'JUL',
      name: 'Taller de Filtrado',
      det: 'Aprende a clasificar donaciones. Taller Ruah — 16:00 hrs.'
    }],
    feed: [{
      id: 'f1',
      when: 'HACE 2 HRS · DANIEL V.',
      what: 'Subí las fotos de la ruta del sábado al canal privado. 38 prendas entregadas. Dios obró.'
    }, {
      id: 'f2',
      when: 'HACE 6 HRS · CAMILA M.',
      what: 'Necesito oración por mi mamá. Operación el lunes. Gracias hermanos.'
    }, {
      id: 'f3',
      when: 'AYER · SEBASTIÁN R.',
      what: 'Tengo bolsa con 22 prendas filtradas listas. ¿Quién las pasa a buscar esta semana?'
    }, {
      id: 'f4',
      when: 'HACE 2 DÍAS · EQUIPO',
      what: 'Drop 04 sale el 20 de junio. Miembros del club tienen 24 hrs de acceso anticipado.'
    }],
    photoRegistryTitle: 'REGISTRO FOTOGRÁFICO',
    photoRegistrySubtitle: 'Reuniones, rutas, talleres y momentos secretos del movimiento.',
    photos: [{
      id: 'ph1',
      img: '',
      caption: 'Ruta del 12 de junio — Patronato'
    }, {
      id: 'ph2',
      img: '',
      caption: 'Taller de filtrado — junio'
    }, {
      id: 'ph3',
      img: '',
      caption: 'Estudio bíblico mensual'
    }, {
      id: 'ph4',
      img: '',
      caption: 'Coordinación de entregas'
    }]
  }
};

// ----- Store hook with localStorage persistence -----
const STORAGE_KEY = 'ruah-content-v6';
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

// Convierte "Polera Salmo 23" → "polera-salmo-23" (para URLs de producto).
function slugify(str) {
  return String(str || '').toLowerCase().replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i').replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u').replace(/ñ/g, 'n').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Append any DEFAULT_CONTENT entries (by id) that the user's saved content is missing.
function migrateContent(c) {
  // SEGURIDAD: eliminar hashes de contraseña heredados del blob almacenado.
  // El blob de contenido se sirve público (anon read), así que nunca debe
  // contener secretos. Al borrarlos aquí, el próximo "Guardar" del admin
  // los purga también de Supabase.
  if (c.brand) {
    delete c.brand.adminPasswordHash;
    delete c.brand.clubPasswordHash;
  }
  if (!c.home) c.home = DEFAULT_CONTENT.home;
  if (!c.home.intro) c.home.intro = DEFAULT_CONTENT.home.intro;
  if (!c.home.featured) c.home.featured = DEFAULT_CONTENT.home.featured;
  if (!c.home.carousel) c.home.carousel = DEFAULT_CONTENT.home.carousel;
  if (!c.design) c.design = DEFAULT_CONTENT.design;
  if (!c.design.piezas) c.design.piezas = [];
  if (!c.cuadros) c.cuadros = DEFAULT_CONTENT.cuadros;
  if (!c.iglesias) c.iglesias = DEFAULT_CONTENT.iglesias;
  if (!c.eventos) c.eventos = DEFAULT_CONTENT.eventos;
  if (!c.colors) c.colors = {};
  if (!c.checkout) c.checkout = DEFAULT_CONTENT.checkout;
  if (!c.checkout.style) c.checkout.style = DEFAULT_CONTENT.checkout.style;
  if (!c.checkout.shippingFees) c.checkout.shippingFees = DEFAULT_CONTENT.checkout.shippingFees;
  if (!c.cuadros.comingSoonVideoDesktop) c.cuadros.comingSoonVideoDesktop = DEFAULT_CONTENT.cuadros.comingSoonVideoDesktop;
  if (c.hero && c.hero.lede && !c.hero.lede.includes('\n')) c.hero.lede = DEFAULT_CONTENT.hero.lede;
  if (!c.launch) c.launch = DEFAULT_CONTENT.launch;
  if (!c.launch.imageMobile) c.launch.imageMobile = DEFAULT_CONTENT.launch.imageMobile;
  if (!c.launch.imageDesktop) c.launch.imageDesktop = DEFAULT_CONTENT.launch.imageDesktop;

  // Página de Envíos y Devoluciones
  if (!c.envios) c.envios = DEFAULT_CONTENT.envios;
  // Asegurar enlace a Envíos en el footer (col "Sitio"), sin duplicar.
  if (c.footer && Array.isArray(c.footer.cols) && c.footer.cols.length) {
    var sitioCol = c.footer.cols[0];
    if (sitioCol && Array.isArray(sitioCol.items) && !sitioCol.items.some(function (it) {
      return it.href === '#envios';
    })) {
      sitioCol.items.push({
        id: 'i_env',
        label: 'Envíos y Devoluciones',
        href: '#envios'
      });
    }
  }
  // Ensure new protocol fields exist
  if (!c.protocol.sections) Object.assign(c.protocol, DEFAULT_CONTENT.protocol);
  if (!c.protocol.flow) c.protocol.flow = DEFAULT_CONTENT.protocol.flow;
  c.nav = c.nav || {
    ...DEFAULT_CONTENT.nav
  };
  c.nav.links = mergeById(c.nav.links, DEFAULT_CONTENT.nav.links);
  // Force label overrides (design → Personalizados)
  const l8 = (c.nav.links || []).find(l => l.id === 'l8');
  if (l8) l8.label = 'Personalizados';
  c.products = c.products || {
    ...DEFAULT_CONTENT.products
  };
  // Las categorías son gestionadas enteramente por el admin — NO hacer mergeById
  // porque eso reinyectaría categorías borradas por el usuario.
  // Solo inicializar si no existe la lista.
  if (!Array.isArray(c.products.categories)) c.products.categories = DEFAULT_CONTENT.products.categories;
  // Cuadros (c5) siempre debe existir — se inserta antes de Accesorios (c6) si falta.
  if (!c.products.categories.find(cat => cat.id === 'c5')) {
    const idx6 = c.products.categories.findIndex(cat => cat.id === 'c6');
    const entry = {
      id: 'c5',
      name: 'Cuadros',
      slug: 'cuadros'
    };
    if (idx6 >= 0) c.products.categories.splice(idx6, 0, entry);else c.products.categories.push(entry);
  }

  // Backfill cuadros expansions
  if (c.cuadros) {
    if (!c.cuadros.estilos) c.cuadros.estilos = DEFAULT_CONTENT.cuadros.estilos;
    if (!c.cuadros.formatos) c.cuadros.formatos = DEFAULT_CONTENT.cuadros.formatos;
    if (!c.cuadros.sendFields) c.cuadros.sendFields = DEFAULT_CONTENT.cuadros.sendFields;
    if (!c.cuadros.sendSubmit) c.cuadros.sendSubmit = DEFAULT_CONTENT.cuadros.sendSubmit;
    if (!c.cuadros.step1Body) c.cuadros.step1Body = DEFAULT_CONTENT.cuadros.step1Body;
    if (!c.cuadros.headerIndex) c.cuadros.headerIndex = DEFAULT_CONTENT.cuadros.headerIndex;
    if (!c.cuadros.headerTitle) c.cuadros.headerTitle = DEFAULT_CONTENT.cuadros.headerTitle;
    if (!c.cuadros.headerRight) c.cuadros.headerRight = DEFAULT_CONTENT.cuadros.headerRight;
  }
  if (c.iglesias) {
    if (!c.iglesias.headerIndex) c.iglesias.headerIndex = DEFAULT_CONTENT.iglesias.headerIndex;
    if (!c.iglesias.headerTitle) c.iglesias.headerTitle = DEFAULT_CONTENT.iglesias.headerTitle;
    if (!c.iglesias.headerRight) c.iglesias.headerRight = DEFAULT_CONTENT.iglesias.headerRight;
    if (!c.iglesias.portfolioRight) c.iglesias.portfolioRight = DEFAULT_CONTENT.iglesias.portfolioRight;
  }

  // Backfill eventos gallery
  if (c.eventos) {
    if (!c.eventos.gallery) c.eventos.gallery = DEFAULT_CONTENT.eventos.gallery || [];
    if (!c.eventos.galleryTitle) c.eventos.galleryTitle = DEFAULT_CONTENT.eventos.galleryTitle;
    if (!c.eventos.gallerySub) c.eventos.gallerySub = DEFAULT_CONTENT.eventos.gallerySub;
  }

  // Ensure services.items includes all defaults (e.g. sv6 RUAH Live)
  if (c.services && c.services.items) {
    c.services.items = mergeById(c.services.items, DEFAULT_CONTENT.services.items);
    // Update RUAH Live description if it has the old text
    c.services.items = c.services.items.map(it => {
      if (it.id === 'sv6' && (it.desc || '').includes('Transmisiones en vivo')) {
        return {
          ...it,
          desc: DEFAULT_CONTENT.services.items.find(x => x.id === 'sv6').desc
        };
      }
      return it;
    });
  }

  // Ensure club photos exist
  if (c.club) {
    if (!c.club.photos) c.club.photos = DEFAULT_CONTENT.club.photos;
    if (!c.club.photoRegistryTitle) c.club.photoRegistryTitle = DEFAULT_CONTENT.club.photoRegistryTitle;
    if (!c.club.photoRegistrySubtitle) c.club.photoRegistrySubtitle = DEFAULT_CONTENT.club.photoRegistrySubtitle;
  }

  // Ensure cuadros products and catalog fields
  if (c.cuadros) {
    if (!c.cuadros.products) c.cuadros.products = DEFAULT_CONTENT.cuadros.products;
    if (!c.cuadros.productsEyebrow) c.cuadros.productsEyebrow = DEFAULT_CONTENT.cuadros.productsEyebrow;
    if (!c.cuadros.productsTitle) c.cuadros.productsTitle = DEFAULT_CONTENT.cuadros.productsTitle;
    if (!c.cuadros.productsTitleEm) c.cuadros.productsTitleEm = DEFAULT_CONTENT.cuadros.productsTitleEm;
    if (!c.cuadros.productsSub) c.cuadros.productsSub = DEFAULT_CONTENT.cuadros.productsSub;else c.cuadros.products = mergeById(c.cuadros.products, DEFAULT_CONTENT.cuadros.products);
  }

  // Ensure iglesias.projects have gallery arrays
  if (c.iglesias && c.iglesias.projects) {
    c.iglesias.projects = c.iglesias.projects.map(p => ({
      gallery: [],
      ...p
    }));
  }

  // Ensure eventos.gallery items have photos arrays
  if (c.eventos && c.eventos.gallery) {
    c.eventos.gallery = c.eventos.gallery.map(g => ({
      photos: [],
      ...g
    }));
  }

  // Migrate "branding"/"branding completo" → "Asesoría Creativa" in user-saved data
  const replaceBranding = str => {
    if (!str) return str;
    return str.replace(/BRANDING COMPLETO/g, 'ASESORÍA CREATIVA').replace(/Branding completo/g, 'Asesoría Creativa').replace(/branding completo/g, 'asesoría creativa').replace(/BRANDING/g, 'ASESORÍA CREATIVA').replace(/Branding/g, 'Asesoría Creativa').replace(/branding/g, 'asesoría creativa');
  };
  if (c.services && c.services.items) {
    c.services.items = c.services.items.map(it => ({
      ...it,
      name: replaceBranding(it.name),
      desc: replaceBranding(it.desc)
    }));
  }
  if (c.iglesias && c.iglesias.services) {
    c.iglesias.services = c.iglesias.services.map(it => ({
      ...it,
      name: replaceBranding(it.name),
      desc: replaceBranding(it.desc)
    }));
  }
  return c;
}
function mergeById(userList, defaultList) {
  if (!Array.isArray(userList)) return defaultList;
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
      if (idx >= 0) {
        out.splice(idx + 1, 0, d);
        inserted = true;
        break;
      }
    }
    if (!inserted) out.push(d);
  }
  return out;
}
function deepMerge(base, over) {
  if (Array.isArray(over)) return over;
  if (typeof over !== 'object' || over === null) return over;
  const out = Array.isArray(base) ? [...base] : {
    ...base
  };
  for (const k of Object.keys(over)) {
    out[k] = k in base ? deepMerge(base[k], over[k]) : over[k];
  }
  return out;
}
function showSaveToast(ok, msg) {
  var el = document.getElementById('ruah-save-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'ruah-save-toast';
    el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);' + 'padding:12px 28px;border-radius:10px;font-size:14px;font-weight:700;z-index:99999;' + 'color:#fff;transition:opacity .3s;pointer-events:none;white-space:nowrap';
    document.body.appendChild(el);
  }
  el.textContent = ok ? '✓ Guardado en la nube' : '✗ Error: ' + msg;
  el.style.background = ok ? '#16a34a' : '#dc2626';
  el.style.opacity = '1';
  clearTimeout(el._t);
  el._t = setTimeout(function () {
    el.style.opacity = '0';
  }, 3500);
}

// JWT del admin vigente — usa getSession() para refrescar si expiró (1h).
function getAdminToken() {
  var stored = sessionStorage.getItem('ruah-admin-session') || '';
  if (!window._ruahSbClient) return Promise.resolve(stored);
  return window._ruahSbClient.auth.getSession().then(function (s) {
    var tok = s && s.data && s.data.session && s.data.session.access_token;
    if (tok) {
      sessionStorage.setItem('ruah-admin-session', tok);
      return tok;
    }
    return stored;
  }).catch(function () {
    return stored;
  });
}
function saveContent(c) {
  c._savedAt = Date.now();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  } catch (e) {}
  var api = (window.RUAH_API || '') + '/api/content';
  return getAdminToken().then(function (adminKey) {
    return fetch(api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey
      },
      body: JSON.stringify({
        data: c
      })
    }).then(function (r) {
      if (!r.ok) {
        r.json().then(function (e) {
          showSaveToast(false, r.status + (r.status === 403 ? ' — sesión inválida' : ' — ' + (e && e.error || 'error')));
        }).catch(function () {
          showSaveToast(false, 'HTTP ' + r.status);
        });
        throw new Error('save_failed');
      }
      showSaveToast(true);
      if (window._ruahSbClient) {
        window._ruahSbClient.channel('content-main').send({
          type: 'broadcast',
          event: 'content-updated',
          payload: {
            data: c
          }
        }).catch(function () {});
      }
    }).catch(function (e) {
      if (e.message !== 'save_failed') showSaveToast(false, 'Sin conexión con el servidor');
      throw e;
    });
  }); // cierra getAdminToken().then
}

// Apply font-size tokens to :root as CSS vars
function applyTypography(t) {
  const r = document.documentElement;
  const setPx = (name, val) => r.style.setProperty(name, val + 'px');

  // Section titles
  setPx('--fs-hero', t.heroMax);
  setPx('--fs-section', t.sectionMax);
  setPx('--fs-about-title', t.aboutTitleMax || t.sectionMax);
  setPx('--fs-protocol', t.protocolTitleMax || t.protocolMax || 140);
  setPx('--fs-services-title', t.servicesTitleMax || t.sectionMax);
  setPx('--fs-products-title', t.productsTitleMax || t.sectionMax);
  setPx('--fs-cuadros-title', t.cuadrosTitleMax || 140);
  setPx('--fs-iglesias-title', t.iglesiasTitleMax || 120);
  setPx('--fs-manifesto', t.manifestoMax);
  setPx('--fs-testimonials-title', t.testimonialsTitleMax || t.sectionMax);
  setPx('--fs-cta', t.ctaMax);
  setPx('--fs-wordmark', t.wordmarkMax);
  setPx('--fs-club-title', t.clubTitleMax || 140);

  // Component sizes
  setPx('--fs-product', t.productTitle);
  setPx('--fs-testi', t.testiQuote);
  setPx('--fs-pillar-title', t.pillarTitle || 32);
  setPx('--fs-stat-num', t.statNum || 92);
  setPx('--fs-ig-svc-name', t.iglesiasServiceName || 22);
  setPx('--fs-ig-proj-name', t.iglesiasProjectName || 38);
  setPx('--fs-ig-portfolio-title', t.iglesiasPortfolioTitle || 92);
  setPx('--fs-ig-form-title', t.iglesiasFormTitle || 72);
  setPx('--fs-ig-feature-name', t.iglesiasFeatureName || 88);
  setPx('--fs-cu-style-tag', t.cuadrosStyleTag || 18);
  setPx('--fs-cu-brief-title', t.cuadrosBriefTitle || 64);
  setPx('--fs-cu-step-num', t.cuadrosStepNum || 38);
  setPx('--fs-cu-ref-name', t.cuadrosRefName || 56);
  setPx('--fs-cu-format-num', t.cuadrosFormatNum || 36);
  setPx('--fs-pr-flow-name', t.protocolFlowName || 13);
  setPx('--fs-pr-section-hd', t.protocolSectionHd || 11);
  setPx('--fs-pr-quote', t.protocolQuote || 18);
  setPx('--fs-club-panel-big', t.clubPanelBig || 64);
  setPx('--fs-club-route-name', t.clubRouteName || 22);
  setPx('--fs-club-meeting-day', t.clubMeetingDay || 36);
  setPx('--fs-club-gate-title', t.clubGateTitle || 64);
  setPx('--fs-club-hero-title', t.clubHeroTitle || 120);
  setPx('--fs-club-section-title', t.clubSectionTitle || 56);
  setPx('--fs-club-body', t.clubBody || 15);

  // Newly exposed per-element sizes
  setPx('--fs-svc-num', t.servicesNum || 13);
  setPx('--fs-svc-name', t.servicesName || 56);
  setPx('--fs-svc-desc', t.servicesDesc || 15);
  setPx('--fs-prod-verse', t.productsVerse || 12);
  setPx('--fs-prod-price', t.productsPrice || 28);
  setPx('--fs-pr-flow-det', t.protocolFlowDet || 14);
  setPx('--fs-cu-lede', t.cuadrosLede || 14);
  setPx('--fs-ig-lede', t.iglesiasLede || 15);
  setPx('--fs-ev-eyebrow', t.eventosEyebrow || 13);
  setPx('--fs-ev-block-title', t.eventosBlockTitle || 34);
  setPx('--fs-testi-name', t.testiName || 13);
  setPx('--fs-testi-role', t.testiRole || 13);
  setPx('--fs-cta-body', t.ctaBody || 18);
  setPx('--fs-footer-about', t.footerAbout || 14);
  setPx('--fs-footer-coltitle', t.footerColTitle || 13);
  setPx('--fs-footer-colitem', t.footerColItem || 14);
  setPx('--fs-cat-chip', t.catChip || 12);
  setPx('--logo-h', t.navLogo || 40);

  // Body / labels
  setPx('--fs-body', t.bodyBase);
  setPx('--fs-lede', t.lede);
  setPx('--fs-label', t.label);
  setPx('--fs-navbrand', t.navBrand);
  setPx('--fs-nav-link', t.navLink || 14);
}

// Apply text-color tokens to :root as CSS vars `--c-<key>`.
// Empty string = unset (falls back to design default in CSS).
function applyColors(colors) {
  const r = document.documentElement;
  for (const k of Object.keys(colors || {})) {
    const v = colors[k];
    if (v && v.trim()) r.style.setProperty('--c-' + k, v);else r.style.removeProperty('--c-' + k);
  }
}

// Apply checkout style tokens (colors + sizes) as CSS vars under `--ck-*`.
function applyCheckoutStyle(s) {
  const r = document.documentElement;
  const setVar = (name, val) => {
    if (val !== undefined && val !== null && val !== '') r.style.setProperty(name, val);
  };
  setVar('--ck-bg', s.bg);
  setVar('--ck-card', s.cardBg);
  setVar('--ck-on-dark', s.textOnDark);
  setVar('--ck-on-card', s.textOnCard);
  setVar('--ck-accent', s.accent);
  setVar('--ck-step-done', s.stepDoneClr);
  setVar('--ck-sum-bg', s.sumBg);
  setVar('--ck-sum-text', s.sumText);
  if (s.titleSize) r.style.setProperty('--ck-fs-title', s.titleSize + 'px');
  if (s.subSize) r.style.setProperty('--ck-fs-sub', s.subSize + 'px');
  if (s.stepLabelSize) r.style.setProperty('--ck-fs-step', s.stepLabelSize + 'px');
  if (s.fieldLabelSize) r.style.setProperty('--ck-fs-flbl', s.fieldLabelSize + 'px');
  if (s.fieldInputSize) r.style.setProperty('--ck-fs-input', s.fieldInputSize + 'px');
  if (s.ctaSize) r.style.setProperty('--ck-fs-cta', s.ctaSize + 'px');
  if (s.summaryHdSize) r.style.setProperty('--ck-fs-sum-hd', s.summaryHdSize + 'px');
  if (s.summaryItemSize) r.style.setProperty('--ck-fs-sum-it', s.summaryItemSize + 'px');
  if (s.summaryTotalSize) r.style.setProperty('--ck-fs-sum-tot', s.summaryTotalSize + 'px');
}
function useContentStore() {
  const [content, setContent] = React.useState(loadContent);
  const syncedRef = React.useRef(false);
  const remoteRef = React.useRef(false); // true cuando el cambio viene de Supabase Realtime

  // Carga inicial + suscripción Realtime a cambios de contenido
  React.useEffect(() => {
    var ANON = 'sb_publishable_ZLrj11-7GjIE8gEiwybtvQ_6e4NZ07p';
    var SUPABASE_URL = 'https://txrpxzsqqomdlnxmyvxn.supabase.co';
    function applyRemote(data) {
      var merged = migrateContent(deepMerge(DEFAULT_CONTENT, data));
      remoteRef.current = true;
      setContent(merged);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {}
    }

    // Si el SDK de Supabase está cargado, usarlo (habilita Realtime)
    if (window.supabase && window.supabase.createClient) {
      var client = window.supabase.createClient(SUPABASE_URL, ANON);
      window._ruahSbClient = client;

      // Initialize from localStorage so remote never overwrites newer local data
      var localContent = loadContent();
      var lastSavedAt = localContent._savedAt || 0;

      // Carga inicial — solo aplica si Supabase es MÁS NUEVO que localStorage
      client.from('content').select('data').eq('key', 'main').limit(1).single().then(function (res) {
        if (res.data && res.data.data) {
          var remote = res.data.data;
          if ((remote._savedAt || 0) > lastSavedAt) {
            lastSavedAt = remote._savedAt;
            applyRemote(remote);
          }
        }
      }).catch(function () {}).finally(function () {
        syncedRef.current = true;
      });

      // Realtime Broadcast — actualización inmediata cuando el admin guarda
      var channel = client.channel('content-main').on('broadcast', {
        event: 'content-updated'
      }, function (payload) {
        if (payload.payload && payload.payload.data) {
          var bd = payload.payload.data;
          if ((bd._savedAt || 0) > lastSavedAt) {
            lastSavedAt = bd._savedAt || 0;
            applyRemote(bd);
          }
        }
      }).subscribe();

      // Polling de respaldo cada 30s — garantiza sync aunque el Realtime falle
      function pollSupabase() {
        client.from('content').select('data').eq('key', 'main').limit(1).single().then(function (res) {
          if (res.data && res.data.data) {
            var remote = res.data.data;
            var remoteTs = remote._savedAt || 0;
            if (remoteTs > lastSavedAt) {
              lastSavedAt = remoteTs;
              applyRemote(remote);
            }
          }
        }).catch(function () {});
      }
      var pollInterval = setInterval(pollSupabase, 30000);
      return function () {
        client.removeChannel(channel);
        clearInterval(pollInterval);
      };
    }

    // Fallback sin SDK: carga una vez con fetch
    fetch(SUPABASE_URL + '/rest/v1/content?key=eq.main&limit=1', {
      headers: {
        'apikey': ANON,
        'Authorization': 'Bearer ' + ANON
      }
    }).then(function (r) {
      return r.json();
    }).then(function (rows) {
      if (rows && rows[0] && rows[0].data) applyRemote(rows[0].data);
    }).catch(function () {}).finally(function () {
      syncedRef.current = true;
    });
  }, []);
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--ivory', content.theme.ivory);
    root.style.setProperty('--amber', content.theme.amber);
    root.style.setProperty('--gray', content.theme.gray);
    root.style.setProperty('--black', content.theme.black);
    applyTypography(content.typography);
    applyColors(content.colors || {});
    applyCheckoutStyle(content.checkout && content.checkout.style || {});
    // Solo guarda en localStorage (instantáneo, sin red).
    // El guardado en la nube ocurre solo cuando el admin hace clic en "Guardar cambios".
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    } catch (e) {}
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
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ruah-content-' + Date.now() + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [content]);
  const importJSON = React.useCallback(file => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target.result);
        setContent(migrateContent(deepMerge(DEFAULT_CONTENT, parsed)));
      } catch (err) {
        alert('Archivo inválido');
      }
    };
    reader.readAsText(file);
  }, []);
  const save = React.useCallback(() => {
    saveContent(content);
  }, [content]);
  return {
    content,
    setContent,
    update,
    updateList,
    reset,
    exportJSON,
    importJSON,
    save
  };
}
Object.assign(window, {
  DEFAULT_CONTENT,
  useContentStore,
  loadContent,
  saveContent,
  deepMerge,
  applyColors,
  applyCheckoutStyle,
  slugify
});

/* sections */
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React */
// ============================================================
// RUAH LABS — Public site sections
// ============================================================

// Format Chilean peso price: "14990" or "14.990" → "14.990"
function fmtPrice(p) {
  var n = parseInt(String(p || '0').replace(/[^0-9]/g, ''), 10) || 0;
  return new Intl.NumberFormat('es-CL').format(n);
}

// --- Reveal helpers ---
function useInView(threshold = 0.15) {
  const ref = React.useRef(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      });
    }, {
      threshold
    });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}
function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
  style = {},
  ...rest
}) {
  const [ref, inView] = useInView();
  return /*#__PURE__*/React.createElement(Tag, _extends({
    ref: ref,
    className: (className + ' reveal' + (inView ? ' in' : '')).trim(),
    style: {
      transitionDelay: delay + 'ms',
      ...style
    }
  }, rest), children);
}
function RevealLine({
  children,
  delay = 0,
  className = ''
}) {
  const [ref, inView] = useInView(0.3);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    className: ('reveal-mask' + (inView ? ' in' : '') + ' ' + className).trim()
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      transitionDelay: delay + 'ms'
    }
  }, children));
}

// --- Section Header bar (reused across Iglesias / Cuadros / Protocolo)
function SectionHeader({
  index,
  title,
  right,
  amberTitle = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "sec-bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec-bar__index"
  }, index), /*#__PURE__*/React.createElement("h2", {
    className: 'sec-bar__title' + (amberTitle ? ' amb' : '')
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "sec-bar__right"
  }, right));
}

// --- Nav ---
function MobileDropdown({
  label,
  children,
  amber
}) {
  var [open, setOpen] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    className: 'm-drop' + (open ? ' open' : '')
  }, /*#__PURE__*/React.createElement("button", {
    className: 'm-link m-drop__head' + (amber ? ' m-link--amber' : ''),
    type: "button",
    onClick: () => setOpen(o => !o)
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", {
    className: "m-link__arr"
  }, open ? '↑' : '↓')), /*#__PURE__*/React.createElement("div", {
    className: "m-drop__list"
  }, children));
}
function Nav({
  content,
  onOpenProduct,
  cartCount = 0,
  onOpenCheckout,
  activePage,
  onNavigate,
  onGoHome
}) {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openDrop, setOpenDrop] = React.useState(null);
  const navRef = React.useRef(null);
  const tripleClicksRef = React.useRef([]);
  const {
    nav,
    products
  } = content;
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
  }, [mobileOpen]);
  React.useEffect(() => {
    function onClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenDrop(null);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Map href anchors → page keys
  const HREF_TO_PAGE = {
    '#nosotros': 'nosotros',
    '#servicios': 'servicios',
    '#productos': 'productos',
    '#cuadros': 'cuadros',
    '#iglesias': 'iglesias',
    '#evento': 'evento',
    '#protocolo': 'protocolo',
    '#comunidad': 'comunidad',
    '#design': 'design'
  };
  function navigate(href) {
    setOpenDrop(null);
    setMobileOpen(false);
    const page = HREF_TO_PAGE[href];
    if (page && onNavigate) {
      onNavigate(page);
      return;
    }
    if (href === '#top' || href === '/') {
      if (onGoHome) onGoHome();
      return;
    }
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({
          behavior: reduced ? 'auto' : 'smooth',
          block: 'start'
        });
        return;
      }
    }
    window.location.href = href;
  }
  function navigateCategory(slug) {
    setOpenDrop(null);
    setMobileOpen(false);
    if (slug === 'cuadros' && onNavigate) {
      onNavigate('cuadros');
      return;
    }
    if (onNavigate) onNavigate('productos', slug);
  }

  // Triple-click on logo: scroll to top + dispatch secret-portal trigger.
  function onBrandClick(e) {
    e.preventDefault();
    const now = Date.now();
    tripleClicksRef.current = tripleClicksRef.current.filter(t => now - t < 500);
    tripleClicksRef.current.push(now);
    if (tripleClicksRef.current.length >= 3) {
      tripleClicksRef.current = [];
      window.dispatchEvent(new CustomEvent('ruah:triggerSecret'));
      return;
    }
    if (onGoHome) onGoHome();else window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("nav", {
    className: 'nav' + (scrolled ? ' scrolled' : '') + (activePage ? ' has-page' : ''),
    ref: navRef
  }, /*#__PURE__*/React.createElement("a", {
    href: "#top",
    className: "nav__brand",
    onClick: onBrandClick,
    "aria-label": content.brand.name,
    title: "\xB7"
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources && window.__resources.logoWordmark || "https://res.cloudinary.com/dh05zwrbp/image/upload/v1781323723/ruahlabs/s0c7jhjeiwvrjclesxmj.png",
    alt: "RUAH LABS",
    className: "nav__brand-img"
  })), /*#__PURE__*/React.createElement("div", {
    className: "nav__links"
  }, activePage && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "nav__link nav__link--inicio",
    onClick: () => onGoHome && onGoHome()
  }, "\u2190 INICIO"), nav.links.map(l => /*#__PURE__*/React.createElement("div", {
    className: 'nav__link-wrap' + (openDrop === l.id ? ' open' : ''),
    key: l.id
  }, l.dropdown ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: 'nav__link' + (openDrop === l.id ? ' open' : ''),
    onClick: () => setOpenDrop(o => o === l.id ? null : l.id),
    "aria-expanded": openDrop === l.id
  }, l.label, /*#__PURE__*/React.createElement("span", {
    className: "caret"
  }, "\u25BC")), /*#__PURE__*/React.createElement("div", {
    className: "nav__dropdown",
    role: "menu"
  }, products.categories.map(c => /*#__PURE__*/React.createElement("a", {
    key: c.id,
    href: "#productos",
    onClick: e => {
      e.preventDefault();
      navigateCategory(c.slug);
    }
  }, /*#__PURE__*/React.createElement("span", null, c.name), /*#__PURE__*/React.createElement("span", {
    className: "arr"
  }, "\u2192"))))) : /*#__PURE__*/React.createElement("a", {
    className: "nav__link",
    href: l.href,
    onClick: e => {
      e.preventDefault();
      navigate(l.href);
    }
  }, l.label)))), /*#__PURE__*/React.createElement("a", {
    className: "nav__cta",
    href: nav.cta.href,
    onClick: e => {
      e.preventDefault();
      navigate(nav.cta.href);
    }
  }, nav.cta.label, /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2192")), /*#__PURE__*/React.createElement("button", {
    className: "nav__cart",
    type: "button",
    onClick: onOpenCheckout,
    "aria-label": 'Carrito (' + cartCount + ')',
    title: "Ir a pagar"
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources && window.__resources.cartIcon || 'https://res.cloudinary.com/dh05zwrbp/image/upload/v1781323690/ruahlabs/lmlhjytfctlr3apdcebc.png',
    alt: "",
    className: "nav__cart__img",
    "aria-hidden": "true"
  }), cartCount > 0 && /*#__PURE__*/React.createElement("span", {
    className: "nav__cart__b"
  }, cartCount)), /*#__PURE__*/React.createElement("button", {
    className: 'hamb' + (mobileOpen ? ' open' : ''),
    "aria-label": "Men\xFA",
    onClick: () => setMobileOpen(o => !o)
  }, /*#__PURE__*/React.createElement("span", {
    className: "hamb__bars"
  }))), /*#__PURE__*/React.createElement("div", {
    className: 'mobile-menu' + (mobileOpen ? ' open' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: "mobile-menu__inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mobile-menu__head",
    style: {
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "mobile-menu__x",
    onClick: () => setMobileOpen(false),
    "aria-label": "Cerrar men\xFA"
  }, "\xD7")), /*#__PURE__*/React.createElement("nav", {
    className: "mobile-menu__nav"
  }, function () {
    var linkMap = {};
    (nav.links || []).forEach(function (l) {
      linkMap[l.id] = l;
    });
    var mobileOrder = ['l2', 'l6', 'l7', 'l8'];
    return mobileOrder.map(function (id) {
      var l = linkMap[id];
      if (!l) return null;
      var isAmber = l.id === 'l2';
      if (l.dropdown) {
        return /*#__PURE__*/React.createElement(MobileDropdown, {
          key: l.id,
          label: l.label,
          amber: isAmber
        }, products.categories.map(c => /*#__PURE__*/React.createElement("a", {
          key: c.id,
          href: "#productos",
          className: "m-sub__link",
          onClick: e => {
            e.preventDefault();
            navigateCategory(c.slug);
            setMobileOpen(false);
          }
        }, c.name)));
      }
      return /*#__PURE__*/React.createElement("a", {
        key: l.id,
        href: l.href,
        className: 'm-link' + (isAmber ? ' m-link--amber' : ''),
        onClick: e => {
          e.preventDefault();
          navigate(l.href);
        }
      }, /*#__PURE__*/React.createElement("span", null, l.label), /*#__PURE__*/React.createElement("span", {
        className: "m-link__arr"
      }, "\u2192"));
    });
  }(), /*#__PURE__*/React.createElement("a", {
    href: nav.cta.href,
    className: "m-link m-link--cta",
    onClick: e => {
      e.preventDefault();
      navigate(nav.cta.href);
    }
  }, /*#__PURE__*/React.createElement("span", null, nav.cta.label), /*#__PURE__*/React.createElement("span", {
    className: "m-link__arr"
  }, "\u2192"))))));
}

// --- Hero ---
function Hero({
  content
}) {
  const {
    hero
  } = content;
  const FALLBACK_VIDEO_DESKTOP = 'https://res.cloudinary.com/dh05zwrbp/video/upload/v1781323721/ruahlabs/dk5p5bmllg4bzap3kovl.mp4';
  const FALLBACK_VIDEO_MOBILE = 'https://res.cloudinary.com/dh05zwrbp/video/upload/v1781323714/ruahlabs/kv8jqlkslwzfedpjcjia.mp4';
  const bgType = hero.bgType || 'video';
  const srcDesktop = bgType === 'image' ? hero.imageBgDesktop || '' : hero.videoBgDesktop || FALLBACK_VIDEO_DESKTOP;
  const srcMobile = bgType === 'image' ? hero.imageBgMobile || '' : hero.videoBgMobile || FALLBACK_VIDEO_MOBILE;
  const AUDIENCE = [{
    label: 'Soy individuo',
    page: 'productos'
  }, {
    label: 'Soy iglesia',
    page: 'iglesias'
  }, {
    label: 'Soy empresa',
    page: 'evento'
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "hero",
    id: "top"
  }, bgType === 'image' ? /*#__PURE__*/React.createElement(React.Fragment, null, srcDesktop && /*#__PURE__*/React.createElement("img", {
    className: "hero__video-bg hero__video-bg--desktop",
    src: srcDesktop,
    alt: "",
    "aria-hidden": "true",
    style: {
      objectFit: 'cover'
    }
  }), srcMobile && /*#__PURE__*/React.createElement("img", {
    className: "hero__video-bg hero__video-bg--mobile",
    src: srcMobile,
    alt: "",
    "aria-hidden": "true",
    style: {
      objectFit: 'cover'
    }
  }), !srcDesktop && !srcMobile && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("video", {
    className: "hero__video-bg hero__video-bg--desktop",
    src: FALLBACK_VIDEO_DESKTOP,
    autoPlay: true,
    muted: true,
    loop: true,
    playsInline: true,
    preload: "metadata",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("video", {
    className: "hero__video-bg hero__video-bg--mobile",
    src: FALLBACK_VIDEO_MOBILE,
    autoPlay: true,
    muted: true,
    loop: true,
    playsInline: true,
    preload: "metadata",
    "aria-hidden": "true"
  }))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("video", {
    className: "hero__video-bg hero__video-bg--desktop",
    src: srcDesktop,
    autoPlay: true,
    muted: true,
    loop: true,
    playsInline: true,
    preload: "metadata",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("video", {
    className: "hero__video-bg hero__video-bg--mobile",
    src: srcMobile,
    autoPlay: true,
    muted: true,
    loop: true,
    playsInline: true,
    preload: "metadata",
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("div", {
    className: "hero__texture",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero__eyebrow"
  }, /*#__PURE__*/React.createElement("span", {
    className: "line"
  }), /*#__PURE__*/React.createElement("span", {
    className: "mono-label"
  }, hero.eyebrow)), /*#__PURE__*/React.createElement("h1", {
    className: "hero__title"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 50
  }, hero.titleLine1)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 180
  }, hero.titleLine2)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 310
  }, /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, hero.titleLine3)))), /*#__PURE__*/React.createElement("div", {
    className: "hero__bottom"
  }, /*#__PURE__*/React.createElement(Reveal, {
    delay: 500,
    className: "hero__lede"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      whiteSpace: 'pre-line'
    }
  }, hero.lede), hero.heroPrice && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "hero__price",
    style: {
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit'
    },
    onClick: () => window.dispatchEvent(new CustomEvent('ruah:navigateTo', {
      detail: {
        page: 'productos'
      }
    }))
  }, hero.heroPrice)), /*#__PURE__*/React.createElement(Reveal, {
    delay: 650,
    className: "hero__ctas"
  }, hero.primaryCta.show !== false && /*#__PURE__*/React.createElement("a", {
    className: "btn btn--amber",
    href: hero.primaryCta.href,
    onClick: e => {
      const href = hero.primaryCta.href || '';
      if (href.startsWith('#')) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('ruah:navigateTo', {
          detail: {
            page: href.slice(1)
          }
        }));
      }
    }
  }, hero.primaryCta.label, /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2192")), hero.secondaryCta.show !== false && /*#__PURE__*/React.createElement("a", {
    className: "btn btn--white",
    href: hero.secondaryCta.href
  }, hero.secondaryCta.label)), /*#__PURE__*/React.createElement(Reveal, {
    delay: 800,
    className: "hero__audience"
  }, AUDIENCE.map(a => /*#__PURE__*/React.createElement("button", {
    key: a.page,
    type: "button",
    className: "hero__aud-btn",
    onClick: () => window.dispatchEvent(new CustomEvent('ruah:navigateTo', {
      detail: {
        page: a.page
      }
    }))
  }, a.label, " \u2192"))))), /*#__PURE__*/React.createElement("div", {
    className: "hero__marquee"
  }, /*#__PURE__*/React.createElement("div", {
    className: "marquee__track",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("span", null, Array.from({
    length: 2
  }).map((_, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, hero.marquee.split('·').map((piece, j) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: j
  }, piece.trim(), /*#__PURE__*/React.createElement("span", {
    className: "star"
  }, "\u2726")))))))));
}

// --- Home Intro (post-hero info strip) ---
function HomeIntro({
  content
}) {
  const h = content.home || {};
  const intro = h.intro || {};
  return /*#__PURE__*/React.createElement("section", {
    className: "home-intro"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement(Reveal, {
    className: "home-intro__inner"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono-label home-intro__eye"
  }, intro.eyebrow || 'SANTIAGO · CHILE'), /*#__PURE__*/React.createElement("p", {
    className: "home-intro__text"
  }, intro.text || ''))));
}

// --- Featured Duo (2 prendas destacadas) ---
function FeaturedDuo({
  content,
  onOpenProduct
}) {
  const items = (content.products && content.products.items || []).filter(p => p.featuredOnHome).slice(0, 2);
  if (!items.length) return null;
  return /*#__PURE__*/React.createElement("section", {
    className: "feat-duo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "feat-duo__grid"
  }, items.map((item, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: item.id,
    delay: i * 100,
    className: "feat-card",
    onClick: () => onOpenProduct && onOpenProduct(item.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "feat-card__media"
  }, item.img ? /*#__PURE__*/React.createElement("img", {
    src: item.img,
    alt: item.name,
    loading: "lazy"
  }) : /*#__PURE__*/React.createElement("div", {
    className: "feat-card__ph"
  }, (item.name || 'RL').slice(0, 2)), /*#__PURE__*/React.createElement("span", {
    className: "feat-card__hover"
  }, "Ver detalle \u2192")), /*#__PURE__*/React.createElement("div", {
    className: "feat-card__body"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "feat-card__name"
  }, item.name), /*#__PURE__*/React.createElement("div", {
    className: "feat-card__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "feat-card__price"
  }, /*#__PURE__*/React.createElement("span", {
    className: "clp"
  }, "CLP"), "$", fmtPrice(item.price)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--amber feat-card__cta",
    onClick: e => {
      e.stopPropagation();
      onOpenProduct && onOpenProduct(item.id);
    }
  }, "Comprar ", /*#__PURE__*/React.createElement("span", null, "\u2192")))))))));
}

// --- Home 3D Museum Carousel ---
function HomeCategoryCarousel({
  content,
  onOpenProduct
}) {
  const p = content.products || {};
  const cats = (p.categories || []).filter(c => c.slug !== 'todo');
  const items = p.items || [];
  const [idx, setIdx] = React.useState(0);

  // For each category: prefer featuredInCarousel item with img, else first with img, else first
  const carouselItems = cats.map(cat => {
    const catItems = items.filter(it => it.categoryId === cat.id);
    const featured = catItems.find(it => it.featuredInCarousel && it.img);
    const withImg = catItems.find(it => it.img);
    const pick = featured || withImg || catItems[0];
    return pick ? {
      ...pick,
      catName: cat.name,
      catSlug: cat.slug
    } : null;
  }).filter(Boolean);
  const total = carouselItems.length;
  function prev() {
    setIdx(i => (i - 1 + total) % total);
  }
  function next() {
    setIdx(i => (i + 1) % total);
  }
  function getPos(i) {
    if (i === idx) return 'center';
    if (i === (idx - 1 + total) % total) return 'left';
    if (i === (idx + 1) % total) return 'right';
    return 'hidden';
  }
  if (total === 0) return null;
  const current = carouselItems[idx];
  return /*#__PURE__*/React.createElement("section", {
    className: "c3d"
  }, /*#__PURE__*/React.createElement("div", {
    className: "c3d__head"
  }, /*#__PURE__*/React.createElement("p", {
    className: "c3d__title"
  }, content.home && content.home.carousel && content.home.carousel.title || 'EXPLORAR POR CATEGORÍA')), /*#__PURE__*/React.createElement("div", {
    className: "c3d__stage"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "c3d__arr c3d__arr--prev",
    onClick: prev,
    "aria-label": "Anterior"
  }, "\u2190"), /*#__PURE__*/React.createElement("div", {
    className: "c3d__track"
  }, carouselItems.map((item, i) => {
    const pos = getPos(i);
    return /*#__PURE__*/React.createElement("div", {
      key: item.id,
      className: 'c3d__card c3d__card--' + pos,
      onClick: () => {
        if (pos === 'center') {
          window.dispatchEvent(new CustomEvent('ruah:navigateTo', {
            detail: {
              page: 'productos',
              category: item.catSlug
            }
          }));
        } else if (pos === 'left') prev();else if (pos === 'right') next();
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "c3d__card-media"
    }, item.img ? /*#__PURE__*/React.createElement("img", {
      src: item.img,
      alt: item.name,
      loading: "lazy"
    }) : /*#__PURE__*/React.createElement("div", {
      className: "c3d__ph"
    }, (item.catName || '').slice(0, 2).toUpperCase())), /*#__PURE__*/React.createElement("span", {
      className: "c3d__cat-badge"
    }, item.catName));
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "c3d__arr c3d__arr--next",
    onClick: next,
    "aria-label": "Siguiente"
  }, "\u2192")), /*#__PURE__*/React.createElement("div", {
    className: "c3d__info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "c3d__info-cat"
  }, current.catName), /*#__PURE__*/React.createElement("h3", {
    className: "c3d__info-name"
  }, current.name), current.description && /*#__PURE__*/React.createElement("p", {
    className: "c3d__info-desc"
  }, current.description), /*#__PURE__*/React.createElement("div", {
    className: "c3d__info-price"
  }, /*#__PURE__*/React.createElement("span", {
    className: "clp"
  }, "CLP"), " $", fmtPrice(current.price)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "c3d__info-btn",
    onClick: () => window.dispatchEvent(new CustomEvent('ruah:navigateTo', {
      detail: {
        page: 'productos',
        category: current.catSlug
      }
    }))
  }, "Ver categor\xEDa \u2192")), /*#__PURE__*/React.createElement("div", {
    className: "c3d__dots"
  }, carouselItems.map((_, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    type: "button",
    className: 'c3d__dot' + (i === idx ? ' active' : ''),
    onClick: () => setIdx(i),
    "aria-label": 'Ir a ítem ' + (i + 1)
  }))));
}

// --- Design Gallery (Museum) ---
function DesignGallery({
  content
}) {
  const piezas = (content.design && content.design.piezas || []).filter(p => p.estado === 'visible').sort((a, b) => (a.orden || 0) - (b.orden || 0));
  const [modal, setModal] = React.useState(null);
  const modalRef = React.useRef(null);
  const modalTouchRef = React.useRef(null);
  const modalPinchRef = React.useRef(null);
  const modalDragRef = React.useRef(null);
  const imgWrapRef = React.useRef(null);
  const imgMouseDragRef = React.useRef(null);
  const [imgScale, setImgScale] = React.useState(1);
  const imgScaleRef = React.useRef(1);
  const [imgTranslate, setImgTranslate] = React.useState({
    x: 0,
    y: 0
  });
  const imgTranslateRef = React.useRef({
    x: 0,
    y: 0
  });
  React.useEffect(() => {
    modalRef.current = modal;
  }, [modal]);

  // Reset zoom + pan when image changes
  React.useEffect(() => {
    setImgScale(1);
    imgScaleRef.current = 1;
    setImgTranslate({
      x: 0,
      y: 0
    });
    imgTranslateRef.current = {
      x: 0,
      y: 0
    };
    modalPinchRef.current = null;
    modalDragRef.current = null;
  }, [modal ? modal.imgIdx : null]);

  // Native passive:false touchmove — pinch zoom + single-finger pan, both block viewport zoom
  React.useEffect(() => {
    var el = imgWrapRef.current;
    if (!el || !modal) return;
    function onMove(e) {
      if (e.touches.length >= 2 && modalPinchRef.current) {
        e.preventDefault();
        var t0 = e.touches[0],
          t1 = e.touches[1];
        var dx = t0.clientX - t1.clientX,
          dy = t0.clientY - t1.clientY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var s = Math.max(1, Math.min(4, modalPinchRef.current.startScale * dist / modalPinchRef.current.startDist));
        imgScaleRef.current = s;
        setImgScale(s);
      } else if (e.touches.length === 1 && modalDragRef.current) {
        e.preventDefault();
        var ddx = e.touches[0].clientX - modalDragRef.current.startX;
        var ddy = e.touches[0].clientY - modalDragRef.current.startY;
        var s = imgScaleRef.current;
        var maxTx = Math.max(0, el.clientWidth * (s - 1) / 2);
        var maxTy = Math.max(0, el.clientHeight * (s - 1) / 2);
        var newTx = Math.max(-maxTx, Math.min(maxTx, modalDragRef.current.startTx + ddx));
        var newTy = Math.max(-maxTy, Math.min(maxTy, modalDragRef.current.startTy + ddy));
        imgTranslateRef.current = {
          x: newTx,
          y: newTy
        };
        setImgTranslate({
          x: newTx,
          y: newTy
        });
      }
    }
    el.addEventListener('touchmove', onMove, {
      passive: false
    });
    return function () {
      el.removeEventListener('touchmove', onMove);
    };
  }, [modal]);
  React.useEffect(() => {
    function onPop() {
      if (modalRef.current) setModal(null);
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  React.useEffect(() => {
    function onKey(e) {
      const m = modalRef.current;
      if (!m) return;
      if (e.key === 'Escape') {
        setModal(null);
        return;
      }
      const imgs = m.pieza.imagenes_detalle && m.pieza.imagenes_detalle.length > 0 ? m.pieza.imagenes_detalle : m.pieza.imagen_principal ? [m.pieza.imagen_principal] : [];
      if (e.key === 'ArrowLeft') setModal(x => x ? {
        ...x,
        imgIdx: Math.max(0, x.imgIdx - 1)
      } : x);
      if (e.key === 'ArrowRight') setModal(x => x ? {
        ...x,
        imgIdx: Math.min(imgs.length - 1, x.imgIdx + 1)
      } : x);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  function openModal(pieza) {
    setModal({
      pieza,
      imgIdx: 0
    });
    window.history.pushState({
      ruahPage: 'design',
      ruahModal: true
    }, '', window.location.pathname);
  }
  const placeholders = ['MINIMAL', 'TIPOGRAFÍA', 'COLLAGE', 'ABSTRACTO', 'BÍBLICO', 'RETRATO'];
  const items = piezas.length > 0 ? piezas : placeholders;
  const isPlaceholderMode = piezas.length === 0;
  return /*#__PURE__*/React.createElement("section", {
    id: "design",
    className: "dg"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dg__head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dg__head-left"
  }, (() => {
    var sz = content.design && content.design.eyebrowSize || 90;
    return /*#__PURE__*/React.createElement("h2", {
      className: "dg__eyebrow",
      style: {
        fontSize: 'clamp(' + Math.round(sz * 0.4) + 'px,' + (sz / 16).toFixed(2) + 'vw,' + sz + 'px)'
      }
    }, "PERSONALIZADOS");
  })(), /*#__PURE__*/React.createElement("p", {
    className: "dg__proto-tag"
  }, "\u25AA Cada personalizado activa el Protocolo 1\xD71 \u2014 una prenda donada")), /*#__PURE__*/React.createElement("a", {
    href: "mailto:contacto@ruahlabs.cl?subject=Cotizaci\xF3n%20dise\xF1o%20personalizado",
    className: "dg__cotizar-circle",
    "aria-label": "Cotizar personalizado"
  }, "COTIZAR")), /*#__PURE__*/React.createElement("div", {
    className: "dg__catalog"
  }, items.map((p, i) => {
    const name = isPlaceholderMode ? p : p.nombre;
    const desc = isPlaceholderMode ? null : p.descripcion_breve || null;
    const img = isPlaceholderMode ? null : p.imagen_principal;
    return /*#__PURE__*/React.createElement(Reveal, {
      key: isPlaceholderMode ? i : p.id,
      delay: i * 50,
      className: 'dg__cat-item' + (isPlaceholderMode ? ' dg__cat-item--ph' : ''),
      onClick: () => !isPlaceholderMode && openModal(p),
      role: isPlaceholderMode ? undefined : 'button',
      tabIndex: isPlaceholderMode ? -1 : 0,
      "aria-label": isPlaceholderMode ? name : 'Ver: ' + name
    }, /*#__PURE__*/React.createElement("div", {
      className: "dg__cat-img"
    }, img ? /*#__PURE__*/React.createElement("img", {
      src: img,
      alt: name,
      loading: "lazy"
    }) : /*#__PURE__*/React.createElement("div", {
      className: "dg__cat-ph"
    }, name.slice(0, 2).toUpperCase())), /*#__PURE__*/React.createElement("div", {
      className: "dg__cat-info"
    }, /*#__PURE__*/React.createElement("span", {
      className: "dg__cat-name"
    }, name), desc && /*#__PURE__*/React.createElement("span", {
      className: "dg__cat-desc"
    }, desc)));
  })), /*#__PURE__*/React.createElement("div", {
    className: "dg__footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dg__footer-left"
  }, /*#__PURE__*/React.createElement("p", {
    className: "dg__footer-kicker"
  }, "dise\xF1os que predican"), /*#__PURE__*/React.createElement("h2", {
    className: "dg__footer-word"
  }, "PERSONALIZADOS"))), modal && function () {
    const imgs = modal.pieza.imagenes_detalle && modal.pieza.imagenes_detalle.length > 0 ? modal.pieza.imagenes_detalle : modal.pieza.imagen_principal ? [modal.pieza.imagen_principal] : [];
    const totalImgs = imgs.length;
    function modalPrev() {
      if (totalImgs > 1) setModal(m => ({
        ...m,
        imgIdx: (m.imgIdx - 1 + totalImgs) % totalImgs
      }));
    }
    function modalNext() {
      if (totalImgs > 1) setModal(m => ({
        ...m,
        imgIdx: (m.imgIdx + 1) % totalImgs
      }));
    }
    return /*#__PURE__*/React.createElement("div", {
      className: "pd-overlay open",
      onClick: () => setModal(null),
      role: "dialog",
      "aria-modal": "true"
    }, /*#__PURE__*/React.createElement("div", {
      className: "pd",
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement("button", {
      className: "pd__close",
      onClick: () => setModal(null),
      "aria-label": "Cerrar"
    }, "\xD7"), /*#__PURE__*/React.createElement("div", {
      className: "pd__media"
    }, /*#__PURE__*/React.createElement("div", {
      ref: imgWrapRef,
      className: "pd__main",
      style: {
        cursor: imgScale > 1 ? 'grab' : 'zoom-in',
        userSelect: 'none'
      },
      onMouseDown: e => {
        if (imgScaleRef.current <= 1) return;
        e.preventDefault();
        imgMouseDragRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          startTx: imgTranslateRef.current.x,
          startTy: imgTranslateRef.current.y,
          moved: false
        };
        if (imgWrapRef.current) imgWrapRef.current.style.cursor = 'grabbing';
      },
      onMouseMove: e => {
        if (!imgMouseDragRef.current) return;
        var ddx = e.clientX - imgMouseDragRef.current.startX;
        var ddy = e.clientY - imgMouseDragRef.current.startY;
        if (Math.abs(ddx) > 3 || Math.abs(ddy) > 3) imgMouseDragRef.current.moved = true;
        var el = imgWrapRef.current;
        var s = imgScaleRef.current;
        var maxTx = Math.max(0, el.clientWidth * (s - 1) / 2);
        var maxTy = Math.max(0, el.clientHeight * (s - 1) / 2);
        imgTranslateRef.current = {
          x: Math.max(-maxTx, Math.min(maxTx, imgMouseDragRef.current.startTx + ddx)),
          y: Math.max(-maxTy, Math.min(maxTy, imgMouseDragRef.current.startTy + ddy))
        };
        setImgTranslate({
          ...imgTranslateRef.current
        });
      },
      onMouseUp: () => {
        var d = imgMouseDragRef.current;
        imgMouseDragRef.current = null;
        if (imgWrapRef.current) imgWrapRef.current.style.cursor = imgScaleRef.current > 1 ? 'grab' : 'zoom-in';
        if (d && d.moved) return;
        var S = [1, 1.6, 2.4];
        var n = S.find(function (s) {
          return s > imgScaleRef.current + 0.05;
        }) || 1;
        setImgScale(n);
        imgScaleRef.current = n;
        setImgTranslate({
          x: 0,
          y: 0
        });
        imgTranslateRef.current = {
          x: 0,
          y: 0
        };
        if (imgWrapRef.current) imgWrapRef.current.style.cursor = n > 1 ? 'grab' : 'zoom-in';
      },
      onMouseLeave: () => {
        imgMouseDragRef.current = null;
        if (imgWrapRef.current) imgWrapRef.current.style.cursor = imgScaleRef.current > 1 ? 'grab' : 'zoom-in';
      },
      onTouchStart: e => {
        if (e.touches.length >= 2) {
          modalTouchRef.current = null;
          modalDragRef.current = null;
          var t0 = e.touches[0],
            t1 = e.touches[1],
            dxt = t0.clientX - t1.clientX,
            dyt = t0.clientY - t1.clientY;
          modalPinchRef.current = {
            startDist: Math.sqrt(dxt * dxt + dyt * dyt),
            startScale: imgScaleRef.current
          };
        } else if (imgScaleRef.current > 1) {
          modalPinchRef.current = null;
          modalTouchRef.current = null;
          modalDragRef.current = {
            startX: e.touches[0].clientX,
            startY: e.touches[0].clientY,
            startTx: imgTranslateRef.current.x,
            startTy: imgTranslateRef.current.y
          };
        } else {
          modalTouchRef.current = e.touches[0].clientX;
          modalPinchRef.current = null;
          modalDragRef.current = null;
        }
      },
      onTouchEnd: e => {
        if (modalPinchRef.current) {
          if (imgScaleRef.current < 1.15) {
            setImgScale(1);
            imgScaleRef.current = 1;
            setImgTranslate({
              x: 0,
              y: 0
            });
            imgTranslateRef.current = {
              x: 0,
              y: 0
            };
          }
          modalPinchRef.current = null;
          return;
        }
        if (modalDragRef.current) {
          modalDragRef.current = null;
          return;
        }
        var dx = e.changedTouches[0].clientX - (modalTouchRef.current || 0);
        if (imgScaleRef.current <= 1 && Math.abs(dx) > 60 && totalImgs > 1) {
          if (dx < 0) modalNext();else modalPrev();
        }
        modalTouchRef.current = null;
      }
    }, imgs.length > 0 ? /*#__PURE__*/React.createElement("img", {
      src: imgs[modal.imgIdx] || imgs[0],
      alt: modal.pieza.nombre,
      loading: "lazy",
      style: {
        transform: 'translate(' + imgTranslate.x + 'px,' + imgTranslate.y + 'px) scale(' + imgScale + ')',
        transformOrigin: 'center center',
        transition: modalPinchRef.current || modalDragRef.current ? 'none' : 'transform 0.2s ease',
        willChange: 'transform'
      }
    }) : /*#__PURE__*/React.createElement("div", {
      className: "pd__ph"
    }, (modal.pieza.nombre || 'RL').slice(0, 2)), /*#__PURE__*/React.createElement("div", {
      className: "pd__zoom-ctrl",
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement("button", {
      className: "pd__zoom-btn",
      onClick: () => {
        var S = [1, 1.6, 2.4],
          p = S.filter(function (s) {
            return s < imgScaleRef.current - 0.05;
          }).pop() || 1;
        setImgScale(p);
        imgScaleRef.current = p;
        setImgTranslate({
          x: 0,
          y: 0
        });
        imgTranslateRef.current = {
          x: 0,
          y: 0
        };
      },
      disabled: imgScale <= 1
    }, "\u2212"), /*#__PURE__*/React.createElement("span", {
      className: "pd__zoom-lv"
    }, imgScale.toFixed(1), "\xD7"), /*#__PURE__*/React.createElement("button", {
      className: "pd__zoom-btn",
      onClick: () => {
        var S = [1, 1.6, 2.4],
          n = S.find(function (s) {
            return s > imgScaleRef.current + 0.05;
          }) || 2.4;
        setImgScale(n);
        imgScaleRef.current = n;
        setImgTranslate({
          x: 0,
          y: 0
        });
        imgTranslateRef.current = {
          x: 0,
          y: 0
        };
      },
      disabled: imgScale >= 2.4
    }, "+")), totalImgs > 1 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "pd__arr pd__arr--prev",
      onClick: e => {
        e.stopPropagation();
        modalPrev();
      },
      "aria-label": "Anterior"
    }, "\u2039"), /*#__PURE__*/React.createElement("button", {
      className: "pd__arr pd__arr--next",
      onClick: e => {
        e.stopPropagation();
        modalNext();
      },
      "aria-label": "Siguiente"
    }, "\u203A"), /*#__PURE__*/React.createElement("div", {
      className: "pd__arr-count"
    }, (modal.imgIdx || 0) + 1, " / ", totalImgs))), totalImgs > 1 && /*#__PURE__*/React.createElement("div", {
      className: "pd__thumbs"
    }, imgs.map((url, ti) => /*#__PURE__*/React.createElement("button", {
      key: ti,
      className: 'pd__thumb' + (ti === modal.imgIdx ? ' active' : ''),
      onClick: () => setModal(m => ({
        ...m,
        imgIdx: ti
      })),
      "aria-label": 'Detalle ' + (ti + 1)
    }, /*#__PURE__*/React.createElement("img", {
      src: url,
      alt: "",
      loading: "lazy"
    }))))), /*#__PURE__*/React.createElement("div", {
      className: "pd__body"
    }, (modal.pieza.cliente || modal.pieza.fecha_creacion) && /*#__PURE__*/React.createElement("div", {
      className: "pd__verse"
    }, [modal.pieza.cliente, modal.pieza.fecha_creacion].filter(Boolean).join(' · ')), /*#__PURE__*/React.createElement("h2", {
      className: "pd__title"
    }, modal.pieza.nombre), (modal.pieza.descripcion_historia || modal.pieza.descripcion_breve) && /*#__PURE__*/React.createElement("div", {
      className: "pd__scrollable"
    }, /*#__PURE__*/React.createElement("p", {
      className: "pd__desc"
    }, modal.pieza.descripcion_historia || modal.pieza.descripcion_breve)), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 'auto',
        paddingTop: 24
      }
    }, /*#__PURE__*/React.createElement("a", {
      href: "mailto:contacto@ruahlabs.cl?subject=Cotizaci\xF3n%20dise\xF1o%20personalizado",
      className: "pd__buy",
      style: {
        display: 'inline-flex',
        textDecoration: 'none'
      }
    }, "Cotizar este dise\xF1o \u2192")))));
  }());
}

// --- Page wrapper for section views ---
function PageView({
  title,
  onBack,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "page-view"
  }, children);
}

// --- About / Quienes Somos ---
function About({
  content
}) {
  const a = content.about;
  return /*#__PURE__*/React.createElement("section", {
    className: "about",
    id: "nosotros"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
    className: "sec-head__num"
  }, a.eyebrow)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "sec-head__title sec-head__title--about"
  }, /*#__PURE__*/React.createElement(RevealLine, null, a.title), ' ', /*#__PURE__*/React.createElement(RevealLine, {
    delay: 120
  }, /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, a.titleEm))), /*#__PURE__*/React.createElement(Reveal, {
    delay: 250,
    className: "sec-head__sub"
  }, /*#__PURE__*/React.createElement("p", null, a.sub)))), /*#__PURE__*/React.createElement("div", {
    className: "about__grid"
  }, /*#__PURE__*/React.createElement(Reveal, {
    delay: 50
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono-label",
    style: {
      marginBottom: 12
    }
  }, "NUESTRA HISTORIA")), /*#__PURE__*/React.createElement(Reveal, {
    delay: 150,
    className: "about__body"
  }, a.body.map((p, i) => /*#__PURE__*/React.createElement("p", {
    key: i
  }, p)))), /*#__PURE__*/React.createElement("div", {
    className: "about__pillars"
  }, a.pillars.map((p, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: p.id,
    delay: i * 80,
    className: "pillar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pillar__num"
  }, p.num, " / PILAR"), /*#__PURE__*/React.createElement("h3", {
    className: "pillar__title"
  }, p.title), /*#__PURE__*/React.createElement("p", {
    className: "pillar__desc"
  }, p.desc)))), /*#__PURE__*/React.createElement("div", {
    className: "about__metrics"
  }, a.metrics.map((m, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: m.id,
    delay: i * 100,
    className: "about__metric"
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, m.num), /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, m.lbl))))));
}

// --- Protocol (1×1) — NUEVO DISEÑO (matches reference) ---
function Protocol({
  content
}) {
  const p = content.protocol;
  return /*#__PURE__*/React.createElement("section", {
    className: "protocol",
    id: "protocolo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    index: p.headerIndex,
    title: p.headerTitle,
    right: p.headerRight,
    amberTitle: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "pr-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pr-left"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "pr-bigtitle"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 20
  }, p.title1)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 140
  }, /*#__PURE__*/React.createElement("span", {
    className: p.title2Amber ? 'amb' : ''
  }, p.title2))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 260
  }, p.title3)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 380
  }, /*#__PURE__*/React.createElement("span", {
    className: p.title4Amber ? 'amb' : ''
  }, p.title4)))), /*#__PURE__*/React.createElement("div", {
    className: "pr-sections"
  }, (p.sections || []).map((s, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: s.id,
    delay: i * 80,
    className: "pr-sec"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "pr-sec__hd"
  }, s.heading), /*#__PURE__*/React.createElement("p", {
    className: "pr-sec__body"
  }, s.body)))), /*#__PURE__*/React.createElement(Reveal, {
    delay: 300,
    className: "pr-quote"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pr-quote__ref"
  }, p.quoteRef), /*#__PURE__*/React.createElement("p", {
    className: "pr-quote__text"
  }, p.quoteText))), /*#__PURE__*/React.createElement("aside", {
    className: "pr-right"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pr-flow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pr-flow__hd"
  }, p.flowTitle), /*#__PURE__*/React.createElement("ol", {
    className: "pr-flow__list"
  }, (p.flow || []).map(f => /*#__PURE__*/React.createElement("li", {
    key: f.id,
    className: "pr-flow__item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pr-flow__num"
  }, f.num), /*#__PURE__*/React.createElement("span", {
    className: "pr-flow__name"
  }, f.name), /*#__PURE__*/React.createElement("span", {
    className: "pr-flow__sep"
  }, "\u2192"), /*#__PURE__*/React.createElement("span", {
    className: "pr-flow__det"
  }, f.detail))))), /*#__PURE__*/React.createElement("div", {
    className: "pr-team"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pr-team__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pr-team__lbl"
  }, "\u25AA ", p.teamTitle), /*#__PURE__*/React.createElement("span", {
    className: "pr-team__meta"
  }, p.teamMeta)), /*#__PURE__*/React.createElement("div", {
    className: "pr-team__ph"
  }, p.teamImg ? /*#__PURE__*/React.createElement("img", {
    src: p.teamImg,
    alt: p.teamCaption,
    className: "pr-team__img"
  }) : /*#__PURE__*/React.createElement("div", {
    className: "pr-team__grid"
  })), /*#__PURE__*/React.createElement("div", {
    className: "pr-team__cap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pr-team__dot"
  }, "\u258D"), /*#__PURE__*/React.createElement("span", null, p.teamCaption))), /*#__PURE__*/React.createElement("a", {
    href: p.activateHref || '#productos',
    className: "pr-activate",
    onClick: e => {
      const href = p.activateHref || '#productos';
      if (href.startsWith('#')) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('ruah:navigateTo', {
          detail: {
            page: href.slice(1)
          }
        }));
      }
    }
  }, /*#__PURE__*/React.createElement("span", null, p.activateCta), /*#__PURE__*/React.createElement("span", {
    className: "pr-activate__arr"
  }, "\u2192"))))));
}

// --- Services ---
function Services({
  content
}) {
  const s = content.services;
  return /*#__PURE__*/React.createElement("section", {
    className: "services",
    id: "servicios"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
    className: "sec-head__num"
  }, s.eyebrow)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "sec-head__title sec-head__title--services"
  }, /*#__PURE__*/React.createElement(RevealLine, null, s.title), ' ', /*#__PURE__*/React.createElement(RevealLine, {
    delay: 120
  }, /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, s.titleEm))), /*#__PURE__*/React.createElement(Reveal, {
    delay: 250,
    className: "sec-head__sub"
  }, /*#__PURE__*/React.createElement("p", null, s.sub)))), /*#__PURE__*/React.createElement("div", {
    className: "svc-list"
  }, s.items.map((item, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: item.id,
    delay: i * 80,
    className: "svc-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svc-row__num"
  }, String(i + 1).padStart(2, '0'), " /"), /*#__PURE__*/React.createElement("h3", {
    className: "svc-row__name"
  }, item.name), /*#__PURE__*/React.createElement("p", {
    className: "svc-row__desc"
  }, item.desc), /*#__PURE__*/React.createElement("a", {
    className: "svc-row__cta",
    href: "#contacto"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Cotizar"), /*#__PURE__*/React.createElement("span", {
    className: "arr"
  }, "\u2192")))))));
}

// --- Products ---
function Products({
  content,
  onOpenProduct,
  initialCategory
}) {
  const p = content.products;
  const [activeSlug, setActiveSlug] = React.useState(initialCategory || 'todo');
  React.useEffect(() => {
    if (initialCategory) setActiveSlug(initialCategory);
  }, [initialCategory]);
  React.useEffect(() => {
    function onSet(e) {
      setActiveSlug(e.detail.slug);
    }
    window.addEventListener('ruah:setCategory', onSet);
    return () => window.removeEventListener('ruah:setCategory', onSet);
  }, []);
  const activeCat = p.categories.find(c => c.slug === activeSlug) || p.categories[0];
  const countFor = cat => cat.slug === 'todo' ? p.items.length : p.items.filter(it => it.categoryId === cat.id).length;
  const parsePrice = s => parseInt(String(s || '0').replace(/[^0-9]/g, ''), 10) || 0;
  const baseItems = activeCat.slug === 'todo' ? p.items : p.items.filter(it => it.categoryId === activeCat.id);
  // Orden automático: de menor a mayor precio
  const items = [...baseItems].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  return /*#__PURE__*/React.createElement("section", {
    className: "products",
    id: "productos"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
    className: "sec-head__num"
  }, p.eyebrow)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "sec-head__title sec-head__title--products"
  }, /*#__PURE__*/React.createElement(RevealLine, null, p.title), ' ', /*#__PURE__*/React.createElement(RevealLine, {
    delay: 120
  }, /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, p.titleEm))), /*#__PURE__*/React.createElement(Reveal, {
    delay: 250,
    className: "sec-head__sub"
  }, /*#__PURE__*/React.createElement("p", null, p.sub)))), /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
    className: "cat-bar",
    role: "tablist",
    "aria-label": "Categor\xEDas de producto"
  }, p.categories.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.id,
    className: 'cat-chip' + (activeSlug === c.slug ? ' active' : ''),
    onClick: () => setActiveSlug(c.slug),
    role: "tab",
    "aria-selected": activeSlug === c.slug
  }, c.name, /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, countFor(c)))))), items.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, "\u2014 SIN PRODUCTOS EN ESTA CATEGOR\xCDA POR AHORA \u2014") : /*#__PURE__*/React.createElement("div", {
    className: "prod-grid"
  }, items.map((it, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: it.id,
    delay: i * 60,
    className: "prod",
    onClick: () => onOpenProduct(it.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "prod__media"
  }, it.img ? /*#__PURE__*/React.createElement("img", {
    src: it.img,
    alt: it.name,
    loading: "lazy"
  }) : /*#__PURE__*/React.createElement("div", {
    className: "prod__ph"
  }, it.name.split(' ').slice(-1)[0].slice(0, 2)), /*#__PURE__*/React.createElement("span", {
    className: "prod__view"
  }, "Ver detalle \u2192")), /*#__PURE__*/React.createElement("div", {
    className: "prod__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "prod__verse"
  }, it.verse), /*#__PURE__*/React.createElement("h3", {
    className: "prod__title"
  }, it.name), it.stockType === 'limitado' && (() => {
    const s = it.stockActual != null ? it.stockActual : it.stockTotal;
    return s > 0 ? /*#__PURE__*/React.createElement("div", {
      className: 'prod__stock' + (s <= 5 ? ' prod__stock--low' : '')
    }, s <= 5 ? '⚠ Solo quedan ' + s : 'Quedan ' + s + ' unidades') : /*#__PURE__*/React.createElement("div", {
      className: "prod__stock prod__stock--out"
    }, "\u2014 Agotado");
  })(), /*#__PURE__*/React.createElement("div", {
    className: "prod__row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "prod__price"
  }, !it.price || it.price === 0 || it.price === '0' ? /*#__PURE__*/React.createElement("span", {
    className: "clp"
  }, "A CONSULTAR") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "clp"
  }, "CLP"), "$", fmtPrice(it.price))), /*#__PURE__*/React.createElement("button", {
    className: "prod__buy",
    onClick: e => {
      e.stopPropagation();
      onOpenProduct(it.id);
    }
  }, "Comprar y donar ", /*#__PURE__*/React.createElement("span", null, "\u2192"))), !it.noReturn && /*#__PURE__*/React.createElement("div", {
    className: "prod__guarantee"
  }, "\u2713 ", it.returnDays || 30, " d\xEDas cambio \xB7 \u2713 Protocolo 1\xD71 activo"), it.noReturn && /*#__PURE__*/React.createElement("div", {
    className: "prod__guarantee"
  }, "\u2713 Protocolo 1\xD71 activo")))))));
}

// --- Product Detail Modal ---
var PRODUCT_FAQ = [{
  q: '¿Cuánto demora el envío?',
  a: 'Despachamos en 2 a 5 días hábiles desde Santiago. Llegada estimada: 2 a 5 días hábiles adicionales según región. Envío gratis en pedidos sobre $100.000 CLP.'
}, {
  q: '¿Las tallas son oversize o exactas?',
  a: 'Fit oversize relajado. Si usas M convencional, quédate en M. Si prefieres más entallado, baja una talla. Dudas: escríbenos por WhatsApp antes de comprar.'
}, {
  q: '¿El estampado aguanta los lavados?',
  a: 'Sí. Serigrafía profesional y DTF de alta durabilidad. Lavar al revés, agua fría, sin secadora. Con ese cuidado básico dura años.'
}, {
  q: '¿Puedo cambiar de talla o devolver?',
  a: 'Cambios de talla en 10 días desde recepción, prenda sin uso y con etiqueta (reenvío a cargo del cliente). Reembolso en 30 días por defecto de fábrica. Las piezas únicas no tienen reembolso — está indicado en su descripción.',
  hideForUnique: true
}, {
  q: '¿Sin reembolso en esta pieza?',
  a: 'Esta es una pieza única. Por su naturaleza irrepetible no aplica reembolso. Sí aceptamos cambio de talla en 10 días si hay stock disponible.',
  onlyUnique: true
}, {
  q: '¿Hacen prendas personalizadas?',
  a: 'Sí. Diseñamos tu versículo, frase o imagen sobre cualquier prenda. Visita Personalizados para ver trabajos anteriores o contáctanos directamente.'
}, {
  q: '¿Cómo funciona el Protocolo 1×1?',
  a: 'Cada prenda vendida activa la donación de una prenda filtrada y lavada a alguien en situación de calle. Te llega un registro del operativo entre 7 y 15 días después de tu compra.'
}];
function ProductFAQ({
  isUnique
}) {
  var [openIdx, setOpenIdx] = React.useState(null);
  var items = PRODUCT_FAQ.filter(function (it) {
    if (isUnique && it.hideForUnique) return false;
    if (!isUnique && it.onlyUnique) return false;
    return true;
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "pd-faq"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pd-faq__title"
  }, "PREGUNTAS FRECUENTES"), items.map(function (it, i) {
    var isOpen = openIdx === i;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: 'pd-faq__item' + (isOpen ? ' open' : '')
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "pd-faq__q",
      onClick: function () {
        setOpenIdx(isOpen ? null : i);
      }
    }, /*#__PURE__*/React.createElement("span", null, it.q), /*#__PURE__*/React.createElement("span", {
      className: "pd-faq__arr"
    }, isOpen ? '−' : '+')), isOpen && /*#__PURE__*/React.createElement("div", {
      className: "pd-faq__a"
    }, it.a));
  }));
}
function ProductDetail({
  productId,
  content,
  onClose,
  onBuyNow,
  onAddToCart,
  overrideImg
}) {
  const open = !!productId;
  const product = open ? content.products.items.find(p => p.id === productId) : null;
  const [idx, setIdx] = React.useState(0);
  const [pdScale, setPdScale] = React.useState(1);
  const pdScaleRef = React.useRef(1);
  const [pdTranslate, setPdTranslate] = React.useState({
    x: 0,
    y: 0
  });
  const pdTranslateRef = React.useRef({
    x: 0,
    y: 0
  });
  const pdPinchRef = React.useRef(null);
  const pdDragRef = React.useRef(null);
  const pdMouseDragRef = React.useRef(null);
  const pdMainRef = React.useRef(null);
  const [selectedSize, setSelectedSize] = React.useState(null);
  const SIZES = {
    adulto: ['S', 'M', 'L', 'XL', 'XXL'],
    nino: ['4', '6', '8', '10', '12', '14', '16'],
    unica: ['Talla Única']
  };
  React.useEffect(() => {
    if (!open) {
      document.body.style.overflow = '';
      return;
    }
    const found = content.products.items.find(x => x.id === productId);
    document.body.style.overflow = found ? 'hidden' : '';
    setIdx(0);
    setPdScale(1);
    pdScaleRef.current = 1;
    setPdTranslate({
      x: 0,
      y: 0
    });
    pdTranslateRef.current = {
      x: 0,
      y: 0
    };
    pdPinchRef.current = null;
    pdDragRef.current = null;
    setSelectedSize(null);
  }, [open, productId]);

  // Reset zoom + pan when image changes
  React.useEffect(() => {
    setPdScale(1);
    pdScaleRef.current = 1;
    setPdTranslate({
      x: 0,
      y: 0
    });
    pdTranslateRef.current = {
      x: 0,
      y: 0
    };
    pdPinchRef.current = null;
    pdDragRef.current = null;
  }, [idx]);

  // Auto-close if productId doesn't match any product (prevents body-scroll freeze)
  React.useEffect(() => {
    if (open && !product) {
      document.body.style.overflow = '';
      onClose();
    }
  }, [open, product]);
  var pdTouchRef = React.useRef(null);
  var galleryLenRef = React.useRef(1);

  // Native passive:false touchmove — pinch zoom + single-finger pan
  React.useEffect(() => {
    var el = pdMainRef.current;
    if (!el || !open) return;
    function onMove(e) {
      if (e.touches.length >= 2 && pdPinchRef.current) {
        e.preventDefault();
        var t0 = e.touches[0],
          t1 = e.touches[1];
        var dx = t0.clientX - t1.clientX,
          dy = t0.clientY - t1.clientY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var s = Math.max(1, Math.min(4, pdPinchRef.current.startScale * dist / pdPinchRef.current.startDist));
        pdScaleRef.current = s;
        setPdScale(s);
      } else if (e.touches.length === 1 && pdDragRef.current) {
        e.preventDefault();
        var ddx = e.touches[0].clientX - pdDragRef.current.startX;
        var ddy = e.touches[0].clientY - pdDragRef.current.startY;
        var s = pdScaleRef.current;
        var maxTx = Math.max(0, el.clientWidth * (s - 1) / 2);
        var maxTy = Math.max(0, el.clientHeight * (s - 1) / 2);
        pdTranslateRef.current = {
          x: Math.max(-maxTx, Math.min(maxTx, pdDragRef.current.startTx + ddx)),
          y: Math.max(-maxTy, Math.min(maxTy, pdDragRef.current.startTy + ddy))
        };
        setPdTranslate({
          ...pdTranslateRef.current
        });
      }
    }
    el.addEventListener('touchmove', onMove, {
      passive: false
    });
    return function () {
      el.removeEventListener('touchmove', onMove);
    };
  }, [open]);
  React.useEffect(() => {
    function onKey(e) {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % galleryLenRef.current);
      if (e.key === 'ArrowLeft') setIdx(i => (i - 1 + galleryLenRef.current) % galleryLenRef.current);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open || !product) {
    return /*#__PURE__*/React.createElement("div", {
      className: "pd-overlay",
      "aria-hidden": "true"
    });
  }
  const overrideImgs = Array.isArray(overrideImg) ? overrideImg : overrideImg ? [overrideImg] : [];
  const gallery = [...overrideImgs, product.img, ...(product.gallery || [])].filter((v, i, a) => v && a.indexOf(v) === i);
  galleryLenRef.current = gallery.length;
  const currentImg = gallery[idx] || product.img;
  function pdPrev(e) {
    e.stopPropagation();
    setIdx(i => (i - 1 + gallery.length) % gallery.length);
  }
  function pdNext(e) {
    e.stopPropagation();
    setIdx(i => (i + 1) % gallery.length);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: 'pd-overlay open',
    onClick: onClose,
    role: "dialog",
    "aria-modal": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pd",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    className: "pd__close",
    onClick: onClose,
    "aria-label": "Cerrar"
  }, "\xD7"), /*#__PURE__*/React.createElement("div", {
    className: "pd__media"
  }, /*#__PURE__*/React.createElement("div", {
    ref: pdMainRef,
    className: "pd__main",
    style: {
      cursor: pdScale > 1 ? 'grab' : 'zoom-in',
      userSelect: 'none'
    },
    onMouseDown: e => {
      if (pdScaleRef.current <= 1) return;
      e.preventDefault();
      pdMouseDragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startTx: pdTranslateRef.current.x,
        startTy: pdTranslateRef.current.y,
        moved: false
      };
      if (pdMainRef.current) pdMainRef.current.style.cursor = 'grabbing';
    },
    onMouseMove: e => {
      if (!pdMouseDragRef.current) return;
      var ddx = e.clientX - pdMouseDragRef.current.startX;
      var ddy = e.clientY - pdMouseDragRef.current.startY;
      if (Math.abs(ddx) > 3 || Math.abs(ddy) > 3) pdMouseDragRef.current.moved = true;
      var el = pdMainRef.current;
      var s = pdScaleRef.current;
      var maxTx = Math.max(0, el.clientWidth * (s - 1) / 2);
      var maxTy = Math.max(0, el.clientHeight * (s - 1) / 2);
      pdTranslateRef.current = {
        x: Math.max(-maxTx, Math.min(maxTx, pdMouseDragRef.current.startTx + ddx)),
        y: Math.max(-maxTy, Math.min(maxTy, pdMouseDragRef.current.startTy + ddy))
      };
      setPdTranslate({
        ...pdTranslateRef.current
      });
    },
    onMouseUp: () => {
      var d = pdMouseDragRef.current;
      pdMouseDragRef.current = null;
      if (pdMainRef.current) pdMainRef.current.style.cursor = pdScaleRef.current > 1 ? 'grab' : 'zoom-in';
      if (d && d.moved) return;
      var S = [1, 1.6, 2.4];
      var n = S.find(function (s) {
        return s > pdScaleRef.current + 0.05;
      }) || 1;
      setPdScale(n);
      pdScaleRef.current = n;
      setPdTranslate({
        x: 0,
        y: 0
      });
      pdTranslateRef.current = {
        x: 0,
        y: 0
      };
      if (pdMainRef.current) pdMainRef.current.style.cursor = n > 1 ? 'grab' : 'zoom-in';
    },
    onMouseLeave: () => {
      pdMouseDragRef.current = null;
      if (pdMainRef.current) pdMainRef.current.style.cursor = pdScaleRef.current > 1 ? 'grab' : 'zoom-in';
    },
    onTouchStart: e => {
      if (e.touches.length >= 2) {
        pdTouchRef.current = null;
        pdDragRef.current = null;
        var t0 = e.touches[0],
          t1 = e.touches[1],
          dxt = t0.clientX - t1.clientX,
          dyt = t0.clientY - t1.clientY;
        pdPinchRef.current = {
          startDist: Math.sqrt(dxt * dxt + dyt * dyt),
          startScale: pdScaleRef.current
        };
      } else if (pdScaleRef.current > 1) {
        pdPinchRef.current = null;
        pdTouchRef.current = null;
        pdDragRef.current = {
          startX: e.touches[0].clientX,
          startY: e.touches[0].clientY,
          startTx: pdTranslateRef.current.x,
          startTy: pdTranslateRef.current.y
        };
      } else {
        pdTouchRef.current = e.touches[0].clientX;
        pdPinchRef.current = null;
        pdDragRef.current = null;
      }
    },
    onTouchEnd: e => {
      if (pdPinchRef.current) {
        if (pdScaleRef.current < 1.15) {
          setPdScale(1);
          pdScaleRef.current = 1;
          setPdTranslate({
            x: 0,
            y: 0
          });
          pdTranslateRef.current = {
            x: 0,
            y: 0
          };
        }
        pdPinchRef.current = null;
        return;
      }
      if (pdDragRef.current) {
        pdDragRef.current = null;
        return;
      }
      var dx = e.changedTouches[0].clientX - (pdTouchRef.current || 0);
      if (pdScaleRef.current <= 1 && Math.abs(dx) > 40) {
        if (dx < 0) pdNext(e);else pdPrev(e);
      }
      pdTouchRef.current = null;
    }
  }, currentImg ? /*#__PURE__*/React.createElement("img", {
    src: currentImg,
    alt: product.name,
    style: {
      transform: 'translate(' + pdTranslate.x + 'px,' + pdTranslate.y + 'px) scale(' + pdScale + ')',
      transition: pdPinchRef.current || pdDragRef.current ? 'none' : 'transform 0.3s ease',
      transformOrigin: 'center center',
      willChange: 'transform'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    className: "pd__ph"
  }, product.name.split(' ').slice(-1)[0].slice(0, 2)), /*#__PURE__*/React.createElement("div", {
    className: "pd__zoom-ctrl",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    className: "pd__zoom-btn",
    onClick: () => {
      var S = [1, 1.6, 2.4],
        p = S.filter(function (s) {
          return s < pdScaleRef.current - 0.05;
        }).pop() || 1;
      setPdScale(p);
      pdScaleRef.current = p;
      setPdTranslate({
        x: 0,
        y: 0
      });
      pdTranslateRef.current = {
        x: 0,
        y: 0
      };
    },
    disabled: pdScale <= 1
  }, "\u2212"), /*#__PURE__*/React.createElement("span", {
    className: "pd__zoom-lv"
  }, pdScale.toFixed(1), "\xD7"), /*#__PURE__*/React.createElement("button", {
    className: "pd__zoom-btn",
    onClick: () => {
      var S = [1, 1.6, 2.4],
        n = S.find(function (s) {
          return s > pdScaleRef.current + 0.05;
        }) || 2.4;
      setPdScale(n);
      pdScaleRef.current = n;
      setPdTranslate({
        x: 0,
        y: 0
      });
      pdTranslateRef.current = {
        x: 0,
        y: 0
      };
    },
    disabled: pdScale >= 2.4
  }, "+")), gallery.length > 1 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "pd__arr pd__arr--prev",
    onClick: pdPrev,
    "aria-label": "Anterior"
  }, "\u2039"), /*#__PURE__*/React.createElement("button", {
    className: "pd__arr pd__arr--next",
    onClick: pdNext,
    "aria-label": "Siguiente"
  }, "\u203A"), /*#__PURE__*/React.createElement("div", {
    className: "pd__arr-count"
  }, idx + 1, " / ", gallery.length))), gallery.length > 1 && /*#__PURE__*/React.createElement("div", {
    className: "pd__thumbs"
  }, gallery.map((g, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    className: 'pd__thumb' + (i === idx ? ' active' : ''),
    onClick: () => setIdx(i),
    "aria-label": 'Imagen ' + (i + 1)
  }, /*#__PURE__*/React.createElement("img", {
    src: g,
    alt: ""
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "pd__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pd__verse"
  }, product.verse, " ", product.tag ? '· ' + product.tag : ''), /*#__PURE__*/React.createElement("h2", {
    className: "pd__title"
  }, product.name), /*#__PURE__*/React.createElement("div", {
    className: "pd__price"
  }, /*#__PURE__*/React.createElement("span", {
    className: "clp"
  }, "CLP"), "$", fmtPrice(product.price)), (() => {
    const st = product.stockType || 'permanente';
    const avail = product.stockActual != null ? product.stockActual : product.stockTotal || 0;
    if (st === 'limitado') return /*#__PURE__*/React.createElement("div", {
      className: "pd__stock pd__stock--limited"
    }, /*#__PURE__*/React.createElement("span", {
      className: "pd__stock-dot"
    }), /*#__PURE__*/React.createElement("span", null, "STOCK LIMITADO \xB7 ", avail, " / ", product.stockTotal || 0, " disponibles"));
    if (st === 'unica') return /*#__PURE__*/React.createElement("div", {
      className: "pd__stock pd__stock--unique"
    }, /*#__PURE__*/React.createElement("span", {
      className: "pd__stock-dot"
    }), /*#__PURE__*/React.createElement("span", null, "PIEZA \xDANICA"));
    return null;
  })(), /*#__PURE__*/React.createElement("div", {
    className: "pd__sizes"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pd__sizes-label"
  }, "TALLA"), /*#__PURE__*/React.createElement("div", {
    className: "pd__sizes-btns"
  }, (SIZES[product.sizeType] || SIZES.adulto).map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    type: "button",
    className: 'pd__size-btn' + (selectedSize === s ? ' active' : ''),
    onClick: () => setSelectedSize(s === selectedSize ? null : s)
  }, s)))), /*#__PURE__*/React.createElement("div", {
    className: "pd__scrollable"
  }, product.description && /*#__PURE__*/React.createElement("p", {
    className: "pd__desc"
  }, product.description), (product.material || product.estampado || product.fit || product.tallas || product.origen) && /*#__PURE__*/React.createElement("div", {
    className: "pd__details"
  }, product.material && /*#__PURE__*/React.createElement("div", {
    className: "pd__detail"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Material"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, product.material)), product.estampado && /*#__PURE__*/React.createElement("div", {
    className: "pd__detail"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Estampado"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, product.estampado)), product.fit && /*#__PURE__*/React.createElement("div", {
    className: "pd__detail"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Fit"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, product.fit)), product.tallas && /*#__PURE__*/React.createElement("div", {
    className: "pd__detail"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Tallas"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, product.tallas)), product.origen && /*#__PURE__*/React.createElement("div", {
    className: "pd__detail"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Origen"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, product.origen))), product.details && product.details.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "pd__details"
  }, product.details.map(d => /*#__PURE__*/React.createElement("div", {
    className: "pd__detail",
    key: d.id
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, d.label), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, d.value)))), /*#__PURE__*/React.createElement(ProductFAQ, {
    isUnique: product.stockType === 'unica'
  })), /*#__PURE__*/React.createElement("div", {
    className: "pd__protocol"
  }, /*#__PURE__*/React.createElement("span", {
    className: "icon"
  }, "1\xD7"), /*#__PURE__*/React.createElement("span", {
    className: "txt"
  }, /*#__PURE__*/React.createElement("strong", null, "PROTOCOLO 1\xD71 ACTIVO."), "\xA0Comprar esta pieza dona una prenda a alguien en situaci\xF3n de calle.")), /*#__PURE__*/React.createElement("div", {
    className: "pd__cta"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--amber",
    onClick: () => {
      if (onBuyNow) onBuyNow(product.id, selectedSize);else onClose();
    }
  }, "Ir a pagar ", /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2192")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--ghost",
    onClick: () => {
      if (onAddToCart) onAddToCart(product.id, 1, selectedSize);
    }
  }, "A\xF1adir al carrito")))));
}

// --- Manifesto ---
function Manifesto({
  content
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "manifesto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "manifesto__text"
  }, content.manifesto.text.map((seg, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, /*#__PURE__*/React.createElement(RevealLine, {
    delay: i * 150
  }, seg.em ? /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, seg.txt) : seg.strike ? /*#__PURE__*/React.createElement("span", {
    className: "strike"
  }, seg.txt) : seg.txt), i < content.manifesto.text.length - 1 && ' ')))));
}

// --- Testimonials ---
function Testimonials({
  content
}) {
  const t = content.testimonials;
  return /*#__PURE__*/React.createElement("section", {
    id: "comunidad",
    className: "testi-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
    className: "sec-head__num"
  }, t.eyebrow)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "sec-head__title sec-head__title--testi"
  }, /*#__PURE__*/React.createElement(RevealLine, null, t.title), ' ', /*#__PURE__*/React.createElement(RevealLine, {
    delay: 120
  }, /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, t.titleEm))), /*#__PURE__*/React.createElement(Reveal, {
    delay: 250,
    className: "sec-head__sub"
  }, /*#__PURE__*/React.createElement("p", null, t.sub)))), /*#__PURE__*/React.createElement("div", {
    className: "testi-grid"
  }, t.items.map((it, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: it.id,
    delay: i * 100,
    className: "testi"
  }, /*#__PURE__*/React.createElement("p", {
    className: "testi__quote"
  }, /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, "\u201C"), it.quote, /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, "\u201D")), /*#__PURE__*/React.createElement("div", {
    className: "testi__foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "testi__av"
  }, it.img ? /*#__PURE__*/React.createElement("img", {
    src: it.img,
    alt: it.name
  }) : it.initial), /*#__PURE__*/React.createElement("div", {
    className: "testi__who"
  }, /*#__PURE__*/React.createElement("span", {
    className: "testi__name"
  }, it.name), /*#__PURE__*/React.createElement("span", {
    className: "testi__role"
  }, it.role))))))));
}

// --- CTA ---
function CTABlock({
  content
}) {
  const c = content.cta;
  return /*#__PURE__*/React.createElement("section", {
    className: "cta-block",
    id: "contacto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cta-block__grid"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "cta-block__title"
  }, /*#__PURE__*/React.createElement(RevealLine, null, c.title), ' ', /*#__PURE__*/React.createElement(RevealLine, {
    delay: 120
  }, c.titleEm), ' ', /*#__PURE__*/React.createElement(RevealLine, {
    delay: 240
  }, c.titleAfter)), /*#__PURE__*/React.createElement(Reveal, {
    delay: 400
  }, /*#__PURE__*/React.createElement("p", {
    className: "cta-block__body"
  }, c.body), /*#__PURE__*/React.createElement("div", {
    className: "cta-block__btns"
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn",
    href: c.primaryCta.href
  }, c.primaryCta.label, " ", /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2192")), /*#__PURE__*/React.createElement("a", {
    className: "btn btn--ghost",
    href: c.secondaryCta.href
  }, c.secondaryCta.label))))));
}

// --- Envíos y Devoluciones ---
function Envios({
  content
}) {
  const e = content.envios || {};
  return /*#__PURE__*/React.createElement("section", {
    className: "envios",
    id: "envios"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
    className: "sec-head__num"
  }, e.headerIndex)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "sec-head__title"
  }, /*#__PURE__*/React.createElement(RevealLine, null, e.title), ' ', /*#__PURE__*/React.createElement(RevealLine, {
    delay: 120
  }, /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, e.titleEm))), /*#__PURE__*/React.createElement(Reveal, {
    delay: 250,
    className: "sec-head__sub"
  }, /*#__PURE__*/React.createElement("p", null, e.intro)))), /*#__PURE__*/React.createElement("div", {
    className: "envios__grid"
  }, (e.blocks || []).map((b, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: b.id,
    delay: i * 60,
    className: "envios__block"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "envios__block-title"
  }, b.title), /*#__PURE__*/React.createElement("p", {
    className: "envios__block-body"
  }, b.body))))));
}

// --- Footer ---
function Footer({
  content,
  onOpenAdmin,
  onNavigate
}) {
  const f = content.footer;
  const clicksRef = React.useRef([]);
  function onYearClick(e) {
    const now = Date.now();
    clicksRef.current = clicksRef.current.filter(t => now - t < 700);
    clicksRef.current.push(now);
    if (clicksRef.current.length >= 3) {
      clicksRef.current = [];
      onOpenAdmin && onOpenAdmin();
    }
  }
  function renderBottomLeft() {
    const txt = f.bottomLeft || '';
    const m = txt.match(/(\d{4})/);
    if (!m) return txt;
    const idx = txt.indexOf(m[1]);
    return /*#__PURE__*/React.createElement(React.Fragment, null, txt.slice(0, idx), /*#__PURE__*/React.createElement("span", {
      className: "footer__year",
      onClick: onYearClick,
      role: "button",
      tabIndex: 0,
      title: "\xB7",
      "aria-label": m[1]
    }, m[1]), txt.slice(idx + m[1].length));
  }
  return /*#__PURE__*/React.createElement("footer", {
    className: "footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "footer__wordmark"
  }, f.wordmark, ' ', /*#__PURE__*/React.createElement("span", {
    className: "static"
  }, f.wordmarkSecret)), /*#__PURE__*/React.createElement("p", {
    className: "footer__about",
    style: {
      maxWidth: 460,
      marginBottom: 32
    }
  }, f.about), /*#__PURE__*/React.createElement("div", {
    className: "footer__grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "footer__col"
  }, /*#__PURE__*/React.createElement("h4", null, "Instagram"), /*#__PURE__*/React.createElement("a", {
    href: "https://instagram.com/ruahlabs",
    target: "_blank",
    rel: "noreferrer"
  }, "@ruahlabs"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--gray-soft)'
    }
  }, content.brand.location)), f.cols.map(c => /*#__PURE__*/React.createElement("div", {
    className: "footer__col",
    key: c.id
  }, /*#__PURE__*/React.createElement("h4", null, c.title), c.items.map(i => {
    var PAGE_MAP = {
      '#nosotros': 'nosotros',
      '#servicios': 'servicios',
      '#productos': 'productos',
      '#protocolo': 'protocolo',
      '#comunidad': 'comunidad',
      '#cuadros': 'cuadros',
      '#iglesias': 'iglesias',
      '#evento': 'evento',
      '#design': 'design',
      '#envios': 'envios'
    };
    var spaPage = i.href && PAGE_MAP[i.href];
    return /*#__PURE__*/React.createElement("a", {
      key: i.id,
      href: i.href,
      onClick: i.href && i.href.startsWith('#') ? e => {
        e.preventDefault();
        if (spaPage) {
          onNavigate && onNavigate(spaPage);
        } else {
          var el = document.querySelector(i.href);
          if (el) el.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      } : undefined,
      target: i.href && i.href.startsWith('http') ? '_blank' : undefined,
      rel: i.href && i.href.startsWith('http') ? 'noreferrer' : undefined
    }, i.label);
  })))), /*#__PURE__*/React.createElement("div", {
    className: "footer__bottom"
  }, /*#__PURE__*/React.createElement("span", null, renderBottomLeft()), /*#__PURE__*/React.createElement("span", null, f.bottomRight))));
}
Object.assign(window, {
  useInView,
  Reveal,
  RevealLine,
  SectionHeader,
  Nav,
  Hero,
  HomeIntro,
  FeaturedDuo,
  HomeCategoryCarousel,
  DesignGallery,
  PageView,
  About,
  Protocol,
  Services,
  Products,
  ProductDetail,
  Manifesto,
  Testimonials,
  CTABlock,
  Footer
});

/* extras */
/* global React, Reveal, RevealLine, SectionHeader */
// ============================================================
// RUAH LABS — Cuadros e Iglesias
// ============================================================

function ruahDebug(msg) {
  var el = document.getElementById('ruah-debug-banner');
  if (!el) {
    el = document.createElement('div');
    el.id = 'ruah-debug-banner';
    el.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#111;color:#eca10c;padding:10px 16px;z-index:99999;font-family:monospace;font-size:13px;border-top:2px solid #eca10c';
    document.body.appendChild(el);
  }
  el.textContent = '[RUAH DEBUG] ' + msg;
  clearTimeout(el._t);
  el._t = setTimeout(function () {
    el.textContent = '';
  }, 10000);
}

// ============================================================
// CUADRO PRODUCT MODAL
// ============================================================
function CuadroProductModal({
  productId,
  cuadros,
  onClose,
  onAddToCart,
  onBuyNow
}) {
  const open = !!productId;
  const product = open ? (cuadros.products || []).find(p => p.id === productId) : null;
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    setIdx(0);
  }, [open, productId]);
  React.useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && open) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open || !product) return null;
  const gallery = [product.img, ...(product.gallery || [])].filter(Boolean);
  const currentImg = gallery[idx] || null;
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    className: "pd-overlay open",
    onClick: onClose,
    role: "dialog",
    "aria-modal": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pd",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    className: "pd__close",
    onClick: onClose,
    "aria-label": "Cerrar"
  }, "\xD7"), /*#__PURE__*/React.createElement("div", {
    className: "pd__media"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pd__main pd__main--artwork"
  }, currentImg ? /*#__PURE__*/React.createElement("img", {
    src: currentImg,
    alt: product.name
  }) : /*#__PURE__*/React.createElement("div", {
    className: "pd__ph",
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 14,
      letterSpacing: '0.2em'
    }
  }, product.style || 'CU')), gallery.length > 1 && /*#__PURE__*/React.createElement("div", {
    className: "pd__thumbs"
  }, gallery.map((g, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    className: 'pd__thumb' + (i === idx ? ' active' : ''),
    onClick: () => setIdx(i),
    "aria-label": 'Imagen ' + (i + 1)
  }, /*#__PURE__*/React.createElement("img", {
    src: g,
    alt: ""
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "pd__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pd__verse"
  }, product.style, product.size ? ' · ' + product.size : '', product.tag ? ' · ' + product.tag : ''), /*#__PURE__*/React.createElement("h2", {
    className: "pd__title"
  }, product.name), /*#__PURE__*/React.createElement("div", {
    className: "pd__price"
  }, /*#__PURE__*/React.createElement("span", {
    className: "clp"
  }, "CLP"), "$", product.price), /*#__PURE__*/React.createElement("div", {
    className: "pd__scrollable"
  }, product.description && /*#__PURE__*/React.createElement("p", {
    className: "pd__desc"
  }, product.description), (product.details || []).length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "pd__details"
  }, product.details.map(d => /*#__PURE__*/React.createElement("div", {
    className: "pd__detail",
    key: d.id
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, d.label), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, d.value))))), /*#__PURE__*/React.createElement("div", {
    className: "pd__protocol"
  }, /*#__PURE__*/React.createElement("span", {
    className: "icon"
  }, "1\xD7"), /*#__PURE__*/React.createElement("span", {
    className: "txt"
  }, /*#__PURE__*/React.createElement("strong", null, "PROTOCOLO 1\xD71 ACTIVO."), "\xA0Esta compra dona una prenda a alguien en situaci\xF3n de calle.")), /*#__PURE__*/React.createElement("div", {
    className: "pd__cta"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--amber",
    onClick: () => {
      if (onBuyNow) onBuyNow(product.id);else onClose();
    }
  }, "Ir a pagar ", /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2192")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--ghost",
    onClick: () => {
      if (onAddToCart) onAddToCart(product.id, 1);
    }
  }, "A\xF1adir al carrito"))))), document.body);
}

// ============================================================
// GALLERY MODAL (shared: Iglesias + Eventos)
// ============================================================
function GalleryModal({
  title,
  subtitle,
  photos,
  onClose
}) {
  const open = !!photos;
  const [idx, setIdx] = React.useState(0);
  const touchRef = React.useRef(null);
  const trackRef = React.useRef(null);
  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    setIdx(0);
  }, [open]);
  React.useEffect(() => {
    function onKey(e) {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && photos) setIdx(i => Math.min(i + 1, photos.length - 1));
      if (e.key === 'ArrowLeft' && photos) setIdx(i => Math.max(i - 1, 0));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, photos]);
  if (!open) return null;
  const imgs = (photos || []).filter(Boolean);
  const total = imgs.length;
  function prev(e) {
    e && e.stopPropagation();
    setIdx(i => Math.max(i - 1, 0));
  }
  function next(e) {
    e && e.stopPropagation();
    setIdx(i => Math.min(i + 1, total - 1));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "gallery-overlay open",
    role: "dialog",
    "aria-modal": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gallery-modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "gallery-modal__top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gallery-modal__info"
  }, subtitle && /*#__PURE__*/React.createElement("span", {
    className: "gallery-modal__code"
  }, subtitle), /*#__PURE__*/React.createElement("h3", {
    className: "gallery-modal__name"
  }, title)), /*#__PURE__*/React.createElement("button", {
    className: "gallery-modal__back",
    onClick: onClose
  }, "\u2190 REGRESAR")), imgs.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "gallery-modal__empty"
  }, "\u2014 SIN FOTOGRAF\xCDAS A\xDAN \u2014") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "gallery-modal__main",
    onTouchStart: e => {
      touchRef.current = e.touches[0].clientX;
    },
    onTouchEnd: e => {
      var dx = e.changedTouches[0].clientX - (touchRef.current || 0);
      if (Math.abs(dx) > 40) {
        if (dx < 0) next();else prev();
      }
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: imgs[idx],
    alt: title + ' · ' + (idx + 1)
  }), total > 1 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "gm__arr gm__arr--prev",
    onClick: prev,
    disabled: idx === 0
  }, "\u2039"), /*#__PURE__*/React.createElement("button", {
    className: "gm__arr gm__arr--next",
    onClick: next,
    disabled: idx === total - 1
  }, "\u203A"), /*#__PURE__*/React.createElement("div", {
    className: "gm__count"
  }, idx + 1, " / ", total))), total > 1 && /*#__PURE__*/React.createElement("div", {
    className: "gallery-modal__strip",
    ref: trackRef
  }, imgs.map((ph, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    className: 'gm__thumb' + (i === idx ? ' active' : ''),
    onClick: () => setIdx(i),
    "aria-label": 'Foto ' + (i + 1)
  }, /*#__PURE__*/React.createElement("img", {
    src: ph,
    alt: "",
    loading: "lazy"
  })))))));
}

// ============================================================
// CUADROS
// ============================================================
function WhatsAppFab({
  isDesign
}) {
  if (isDesign) {
    return /*#__PURE__*/React.createElement("a", {
      className: "wsp-fab",
      href: "https://wa.me/56926237239?text=Quiero%20hacerme%20un%20Personalizado%2C%20me%20guian%3F",
      target: "_blank",
      rel: "noopener noreferrer"
    }, "\xA1HACER EL M\xCDO!");
  }
  return /*#__PURE__*/React.createElement("a", {
    className: "wsp-fab wsp-fab--wsp",
    href: "https://wa.me/56926237239?text=Hola%20RUAH%20LABS%2C%20quiero%20cotizar",
    target: "_blank",
    rel: "noopener noreferrer",
    "aria-label": "Cotiza por WhatsApp"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "26",
    height: "26",
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 0C5.373 0 0 5.373 0 12c0 2.12.554 4.11 1.523 5.836L.057 23.57a.75.75 0 0 0 .916.919l5.85-1.496A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.728 9.728 0 0 1-4.953-1.355l-.355-.212-3.676.94.98-3.565-.232-.368A9.713 9.713 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"
  })), /*#__PURE__*/React.createElement("span", {
    className: "wsp-fab__label"
  }, "Cotiza por WhatsApp"));
}
function LaunchScreen({
  imageMobile,
  imageDesktop
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: '#000',
      overflow: 'hidden'
    }
  }, imageMobile && /*#__PURE__*/React.createElement("img", {
    src: imageMobile,
    className: "ls-img ls-img--mobile",
    alt: ""
  }), imageDesktop && /*#__PURE__*/React.createElement("img", {
    src: imageDesktop,
    className: "ls-img ls-img--desktop",
    alt: ""
  }));
}
function CuadrosComingSoon({
  videoMobile,
  videoDesktop
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 58,
      background: '#000',
      overflow: 'hidden'
    }
  }, videoMobile && /*#__PURE__*/React.createElement("video", {
    key: videoMobile,
    src: videoMobile,
    autoPlay: true,
    loop: true,
    muted: true,
    playsInline: true,
    className: "cs-video cs-video--mobile"
  }), videoDesktop && /*#__PURE__*/React.createElement("video", {
    key: videoDesktop,
    src: videoDesktop,
    autoPlay: true,
    loop: true,
    muted: true,
    playsInline: true,
    className: "cs-video cs-video--desktop"
  }));
}
function Cuadros({
  content,
  onAddToCart,
  onBuyNow,
  onOpenCuadro
}) {
  const c = content.cuadros;
  const [activeStep, setActiveStep] = React.useState(0);
  const openCuadro = id => {
    if (onOpenCuadro) onOpenCuadro(id);
  };
  const [selectedEstilo, setSelectedEstilo] = React.useState(null);
  const [selectedFormato, setSelectedFormato] = React.useState(null);
  return /*#__PURE__*/React.createElement("section", {
    className: "cuadros",
    id: "cuadros"
  }, c.comingSoon && /*#__PURE__*/React.createElement(CuadrosComingSoon, {
    videoMobile: c.comingSoonVideo,
    videoDesktop: c.comingSoonVideoDesktop
  }), /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    index: c.headerIndex,
    title: c.headerTitle,
    right: c.headerRight
  }), /*#__PURE__*/React.createElement("div", {
    className: "cu-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cu-hero__text"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "cu-hero__title"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 20
  }, c.title1)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 140
  }, c.title2)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 260
  }, c.title3))), /*#__PURE__*/React.createElement(Reveal, {
    delay: 400,
    className: "cu-hero__lede"
  }, /*#__PURE__*/React.createElement("p", null, c.lede))), /*#__PURE__*/React.createElement("div", {
    className: "cu-hero__styles"
  }, (c.styles || []).map((s, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: s.id,
    delay: i * 70,
    className: 'cu-style' + (s.img ? ' has-img' : '')
  }, s.img && /*#__PURE__*/React.createElement("img", {
    src: s.img,
    alt: s.tag,
    className: "cu-style__img"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cu-style__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cu-style__sq"
  }, "\u25AA"), /*#__PURE__*/React.createElement("span", {
    className: "cu-style__tag"
  }, s.tag)), /*#__PURE__*/React.createElement("div", {
    className: "cu-style__pattern"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cu-style__foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cu-style__bar"
  }), /*#__PURE__*/React.createElement("span", {
    className: "cu-style__desc"
  }, s.desc)))))), c.products && c.products.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "cu-catalog"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cu-catalog__head"
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
    className: "mono-label"
  }, c.productsEyebrow || '[ CATÁLOGO CUADROS ]')), /*#__PURE__*/React.createElement("h3", {
    className: "cu-catalog__title"
  }, /*#__PURE__*/React.createElement(RevealLine, null, c.productsTitle || 'CUADROS'), ' ', /*#__PURE__*/React.createElement(RevealLine, {
    delay: 120
  }, /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, c.productsTitleEm || 'EN VENTA'))), /*#__PURE__*/React.createElement(Reveal, {
    delay: 250
  }, /*#__PURE__*/React.createElement("p", {
    className: "cu-catalog__sub"
  }, c.productsSub))), /*#__PURE__*/React.createElement("div", {
    className: "cu-prod-grid"
  }, (c.products || []).map((it, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: it.id,
    delay: i * 70,
    className: "cu-prod",
    onClick: () => openCuadro(it.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "cu-prod__media"
  }, it.img ? /*#__PURE__*/React.createElement("img", {
    src: it.img,
    alt: it.name,
    loading: "lazy"
  }) : /*#__PURE__*/React.createElement("div", {
    className: "cu-prod__ph"
  }, (it.name || '').split(' ').slice(-1)[0].slice(0, 2)), it.tag && /*#__PURE__*/React.createElement("span", {
    className: "cu-prod__tag"
  }, it.tag), /*#__PURE__*/React.createElement("span", {
    className: "cu-prod__view"
  }, "Ver detalle \u2192")), /*#__PURE__*/React.createElement("div", {
    className: "cu-prod__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cu-prod__style"
  }, it.style), /*#__PURE__*/React.createElement("h4", {
    className: "cu-prod__name"
  }, it.name), /*#__PURE__*/React.createElement("div", {
    className: "cu-prod__row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cu-prod__price"
  }, /*#__PURE__*/React.createElement("span", {
    className: "clp"
  }, "CLP"), "$", it.price), /*#__PURE__*/React.createElement("button", {
    className: "cu-prod__buy",
    onClick: e => {
      e.stopPropagation();
      openCuadro(it.id);
    }
  }, "Ver \u2192"))))))), /*#__PURE__*/React.createElement("div", {
    className: "cu-brief"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cu-brief__left"
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
    className: "mono-label cu-brief__eyebrow"
  }, c.briefEyebrow)), /*#__PURE__*/React.createElement("h3", {
    className: "cu-brief__title"
  }, /*#__PURE__*/React.createElement(RevealLine, null, c.briefTitle)), /*#__PURE__*/React.createElement(Reveal, {
    delay: 200,
    className: "cu-brief__sub"
  }, /*#__PURE__*/React.createElement("p", null, c.briefSub))), /*#__PURE__*/React.createElement("div", {
    className: "cu-brief__right"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cu-tabs",
    role: "tablist"
  }, (c.steps || []).map((s, i) => /*#__PURE__*/React.createElement("button", {
    key: s.id,
    className: 'cu-tab' + (i === activeStep ? ' active' : ''),
    onClick: () => setActiveStep(i),
    role: "tab",
    "aria-selected": i === activeStep,
    type: "button"
  }, s.num, "-", s.name))), /*#__PURE__*/React.createElement("div", {
    className: "cu-panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cu-panel__hd"
  }, "PASO ", c.steps[activeStep]?.num || '01', " ", activeStep === 3 ? '· ENVIAR BRIEF' : '· ' + (c.steps[activeStep]?.name || '')), activeStep === 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
    className: "cu-panel__lead"
  }, c.step1Body), /*#__PURE__*/React.createElement("div", {
    className: "cu-refs"
  }, (c.refs || []).map((r, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: r.id,
    delay: i * 70,
    className: 'cu-ref' + (r.img ? ' has-img' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: "cu-ref__ph"
  }, r.img ? /*#__PURE__*/React.createElement("img", {
    src: r.img,
    alt: r.name
  }) : /*#__PURE__*/React.createElement("div", {
    className: "cu-ref__placeholder"
  }, "+")), /*#__PURE__*/React.createElement("div", {
    className: "cu-ref__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cu-ref__sq"
  }, "\u25AA"), /*#__PURE__*/React.createElement("span", {
    className: "cu-ref__code"
  }, r.code)), /*#__PURE__*/React.createElement("div", {
    className: "cu-ref__foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cu-ref__bar"
  }), /*#__PURE__*/React.createElement("span", {
    className: "cu-ref__name"
  }, r.name)))))), activeStep === 1 && /*#__PURE__*/React.createElement("div", {
    className: "cu-estilos"
  }, (c.estilos || []).map(e => /*#__PURE__*/React.createElement("button", {
    key: e.id,
    className: 'cu-estilo' + (selectedEstilo === e.id ? ' selected' : ''),
    type: "button",
    onClick: () => {
      setSelectedEstilo(e.id);
      setTimeout(() => setActiveStep(2), 300);
    }
  }, e.name))), activeStep === 2 && /*#__PURE__*/React.createElement("div", {
    className: "cu-formatos"
  }, (c.formatos || []).map(f => /*#__PURE__*/React.createElement("button", {
    key: f.id,
    className: 'cu-formato' + (selectedFormato === f.id ? ' selected' : ''),
    type: "button",
    onClick: () => {
      setSelectedFormato(f.id);
      setTimeout(() => setActiveStep(3), 300);
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "cu-formato__size"
  }, f.size), /*#__PURE__*/React.createElement("span", {
    className: "cu-formato__price"
  }, f.price)))), activeStep === 3 && /*#__PURE__*/React.createElement(CuadrosSendForm, {
    fields: c.sendFields || [],
    submitLabel: c.sendSubmit || 'ENVIAR BRIEF',
    selectedEstilo: selectedEstilo ? (c.estilos || []).find(e => e.id === selectedEstilo)?.name : null,
    selectedFormato: selectedFormato ? (c.formatos || []).find(f => f.id === selectedFormato)?.size : null
  }))))));
}
function CuadrosSendForm({
  fields,
  submitLabel,
  selectedEstilo,
  selectedFormato
}) {
  const [status, setStatus] = React.useState('idle'); // idle | sending | ok | err-NNN | net-err
  function onSubmit(e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var row = {
      name: '',
      email: '',
      versiculo: '',
      notas: '',
      estilo: selectedEstilo || '',
      formato: selectedFormato || ''
    };
    fields.forEach(function (f) {
      var val = (fd.get(f.id) || '').trim();
      var lbl = (f.label || '').toUpperCase();
      if (lbl.indexOf('NOMBRE') >= 0) row.name = val;else if (lbl.indexOf('EMAIL') >= 0) row.email = val;else if (lbl.indexOf('VERS') >= 0) row.versiculo = val;else if (lbl.indexOf('NOTA') >= 0) row.notas = val;
    });
    e.target.reset();
    setStatus('sending');
    ruahDebug('CUADROS: iniciando fetch...');
    fetch('https://txrpxzsqqomdlnxmyvxn.supabase.co/rest/v1/cuadros_briefs', {
      method: 'POST',
      headers: {
        'apikey': 'sb_publishable_ZLrj11-7GjIE8gEiwybtvQ_6e4NZ07p',
        'Authorization': 'Bearer sb_publishable_ZLrj11-7GjIE8gEiwybtvQ_6e4NZ07p',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(row)
    }).then(function (r) {
      var s = r.ok ? 'ok' : 'err-' + r.status;
      setStatus(s);
      ruahDebug('CUADROS: HTTP ' + r.status + (r.ok ? ' ✓ GUARDADO' : ' ✗ ERROR'));
      setTimeout(function () {
        setStatus('idle');
      }, 8000);
    }).catch(function (err) {
      setStatus('net-err');
      ruahDebug('CUADROS: NET-ERR — ' + err.message);
      setTimeout(function () {
        setStatus('idle');
      }, 8000);
    });
  }
  var btnLabel = submitLabel;
  if (status === 'sending') btnLabel = 'ENVIANDO...';
  if (status === 'ok') btnLabel = '✓ GUARDADO EN BD';
  if (status.indexOf('err') === 0) btnLabel = '✗ ' + status.toUpperCase();
  return /*#__PURE__*/React.createElement("form", {
    className: 'cu-form' + (status === 'ok' ? ' sent' : ''),
    onSubmit: onSubmit
  }, (selectedEstilo || selectedFormato) && /*#__PURE__*/React.createElement("div", {
    className: "cu-form__summary"
  }, selectedEstilo && /*#__PURE__*/React.createElement("span", {
    className: "cu-form__tag"
  }, "ESTILO: ", selectedEstilo), selectedFormato && /*#__PURE__*/React.createElement("span", {
    className: "cu-form__tag"
  }, "FORMATO: ", selectedFormato)), fields.map(f => /*#__PURE__*/React.createElement("label", {
    key: f.id,
    className: "cu-field"
  }, /*#__PURE__*/React.createElement("span", null, f.label), f.type === 'textarea' ? /*#__PURE__*/React.createElement("textarea", {
    name: f.id,
    rows: 3,
    placeholder: f.placeholder,
    required: true
  }) : /*#__PURE__*/React.createElement("input", {
    name: f.id,
    type: f.type || 'text',
    placeholder: f.placeholder,
    required: true
  }))), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "cu-submit",
    disabled: status === 'sending'
  }, btnLabel, status === 'idle' && /*#__PURE__*/React.createElement("span", {
    className: "arr"
  }, "\u2192")));
}

// ============================================================
// IGLESIAS
// ============================================================
function Iglesias({
  content
}) {
  const ig = content.iglesias;
  const [eventType, setEventType] = React.useState(ig.eventOptions[0] || '');
  const [submitted, setSubmitted] = React.useState(false);
  const [galleryProject, setGalleryProject] = React.useState(null);
  function onSubmit(e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var row = {
      iglesia: (fd.get('iglesia') || '').trim(),
      nombre: (fd.get('contacto') || '').trim(),
      email: (fd.get('email') || '').trim(),
      evento_tipo: eventType,
      descripcion: (fd.get('brief') || '').trim()
    };
    e.target.reset();
    setEventType(ig.eventOptions[0] || '');
    setSubmitted('sending');
    ruahDebug('IGLESIAS: iniciando fetch...');
    fetch('https://txrpxzsqqomdlnxmyvxn.supabase.co/rest/v1/iglesias_requests', {
      method: 'POST',
      headers: {
        'apikey': 'sb_publishable_ZLrj11-7GjIE8gEiwybtvQ_6e4NZ07p',
        'Authorization': 'Bearer sb_publishable_ZLrj11-7GjIE8gEiwybtvQ_6e4NZ07p',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(row)
    }).then(function (r) {
      setSubmitted(r.ok ? 'ok' : 'err-' + r.status);
      ruahDebug('IGLESIAS: HTTP ' + r.status + (r.ok ? ' ✓ GUARDADO' : ' ✗ ERROR'));
      setTimeout(function () {
        setSubmitted(false);
      }, 8000);
    }).catch(function (err) {
      setSubmitted('net-err');
      ruahDebug('IGLESIAS: NET-ERR — ' + err.message);
      setTimeout(function () {
        setSubmitted(false);
      }, 8000);
    });
  }
  return /*#__PURE__*/React.createElement("section", {
    className: "iglesias",
    id: "iglesias"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    index: ig.headerIndex,
    title: ig.headerTitle,
    right: ig.headerRight
  }), /*#__PURE__*/React.createElement("div", {
    className: "ig-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ig-hero__text"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "ig-hero__title"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 20
  }, ig.title1)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 160
  }, ig.title2))), /*#__PURE__*/React.createElement(Reveal, {
    delay: 350,
    className: "ig-hero__lede"
  }, /*#__PURE__*/React.createElement("p", null, ig.lede))), /*#__PURE__*/React.createElement("div", {
    className: "ig-feat-wrap"
  }, /*#__PURE__*/React.createElement(Reveal, {
    delay: 120,
    className: 'ig-feat' + (ig.featureImg ? ' has-img' : '')
  }, ig.featureImg && /*#__PURE__*/React.createElement("img", {
    src: ig.featureImg,
    alt: ig.featureName,
    className: "ig-feat__img"
  }), /*#__PURE__*/React.createElement("div", {
    className: "ig-feat__pattern"
  })), /*#__PURE__*/React.createElement("div", {
    className: "ig-feat__foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ig-feat__bar"
  }), /*#__PURE__*/React.createElement("span", {
    className: "ig-feat__name"
  }, ig.featureName)), /*#__PURE__*/React.createElement("div", {
    className: "ig-feat__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ig-feat__sq"
  }, "\u25AA"), /*#__PURE__*/React.createElement("span", {
    className: "ig-feat__tag"
  }, ig.featureTag)))), /*#__PURE__*/React.createElement("div", {
    className: "ig-svcs"
  }, ig.services.map((s, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: s.id,
    delay: i * 80,
    className: "ig-svc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ig-svc__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ig-svc__num"
  }, s.num), /*#__PURE__*/React.createElement("span", {
    className: "ig-svc__dot"
  }, "\u25CF")), /*#__PURE__*/React.createElement("h4", {
    className: "ig-svc__name"
  }, s.name), /*#__PURE__*/React.createElement("p", {
    className: "ig-svc__desc"
  }, s.desc)))), /*#__PURE__*/React.createElement("div", {
    className: "ig-port"
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    index: ig.portfolioIndex,
    title: ig.portfolioTitle,
    right: ig.portfolioRight
  }), /*#__PURE__*/React.createElement("div", {
    className: "ig-projs"
  }, ig.projects.map((p, i) => {
    const hasGallery = (p.gallery || []).length > 0;
    return /*#__PURE__*/React.createElement(Reveal, {
      key: p.id,
      delay: i * 60,
      className: 'ig-proj' + (hasGallery ? ' clickable' : ''),
      onClick: () => hasGallery && setGalleryProject(p)
    }, /*#__PURE__*/React.createElement("div", {
      className: 'ig-proj__card' + (p.img ? ' has-img' : '')
    }, p.img && /*#__PURE__*/React.createElement("img", {
      src: p.img,
      alt: p.name,
      className: "ig-proj__img"
    }), /*#__PURE__*/React.createElement("div", {
      className: "ig-proj__top"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ig-proj__sq"
    }, "\u25AA"), /*#__PURE__*/React.createElement("span", {
      className: "ig-proj__code"
    }, p.code)), /*#__PURE__*/React.createElement("div", {
      className: "ig-proj__pattern"
    }), hasGallery && /*#__PURE__*/React.createElement("div", {
      className: "ig-proj__gallery-badge"
    }, (p.gallery || []).length, " foto", (p.gallery || []).length !== 1 ? 's' : '', " \u2192")), /*#__PURE__*/React.createElement("div", {
      className: "ig-proj__foot"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ig-proj__bar"
    }), /*#__PURE__*/React.createElement("span", {
      className: "ig-proj__name"
    }, p.name)), /*#__PURE__*/React.createElement("div", {
      className: "ig-proj__meta"
    }, p.meta));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "ig-formWrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ig-formWrap__left"
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
    className: "mono-label ig-formWrap__eyebrow"
  }, ig.formEyebrow)), /*#__PURE__*/React.createElement("h3", {
    className: "ig-formWrap__title"
  }, /*#__PURE__*/React.createElement(RevealLine, null, ig.formTitle)), /*#__PURE__*/React.createElement(Reveal, {
    delay: 200,
    className: "ig-formWrap__sub"
  }, /*#__PURE__*/React.createElement("p", null, ig.formSub))), /*#__PURE__*/React.createElement("form", {
    className: 'ig-form' + (submitted ? ' sent' : ''),
    onSubmit: onSubmit
  }, /*#__PURE__*/React.createElement("label", {
    className: "ig-field"
  }, /*#__PURE__*/React.createElement("span", null, "IGLESIA / MINISTERIO"), /*#__PURE__*/React.createElement("input", {
    name: "iglesia",
    type: "text",
    required: true,
    placeholder: "Nombre"
  })), /*#__PURE__*/React.createElement("label", {
    className: "ig-field"
  }, /*#__PURE__*/React.createElement("span", null, "CONTACTO"), /*#__PURE__*/React.createElement("input", {
    name: "contacto",
    type: "text",
    required: true,
    placeholder: "Tu nombre"
  })), /*#__PURE__*/React.createElement("label", {
    className: "ig-field"
  }, /*#__PURE__*/React.createElement("span", null, "EMAIL"), /*#__PURE__*/React.createElement("input", {
    name: "email",
    type: "email",
    required: true,
    placeholder: "email"
  })), /*#__PURE__*/React.createElement("label", {
    className: "ig-field"
  }, /*#__PURE__*/React.createElement("span", null, "EVENTO"), /*#__PURE__*/React.createElement("select", {
    value: eventType,
    onChange: e => setEventType(e.target.value)
  }, ig.eventOptions.map(o => /*#__PURE__*/React.createElement("option", {
    key: o,
    value: o
  }, o)))), /*#__PURE__*/React.createElement("label", {
    className: "ig-field ig-field--full"
  }, /*#__PURE__*/React.createElement("span", null, "BRIEF"), /*#__PURE__*/React.createElement("textarea", {
    name: "brief",
    rows: 3,
    required: true,
    placeholder: "Cantidad, fecha, formato..."
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "ig-submit",
    disabled: submitted === 'sending'
  }, submitted === 'ok' ? '✓ GUARDADO EN BD' : submitted && submitted !== false ? '✗ ' + String(submitted).toUpperCase() : submitted ? '✓ SOLICITUD ENVIADA' : ig.formSubmit, !submitted && /*#__PURE__*/React.createElement("span", {
    className: "arr"
  }, "\u2192")), /*#__PURE__*/React.createElement("a", {
    className: "ig-wsp-btn",
    href: "https://wa.me/56926237239?text=Hola%20RUAH%20LABS%2C%20quiero%20cotizar%20para%20mi%20iglesia",
    target: "_blank",
    rel: "noopener noreferrer"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 0C5.373 0 0 5.373 0 12c0 2.12.554 4.11 1.523 5.836L.057 23.57a.75.75 0 0 0 .916.919l5.85-1.496A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.728 9.728 0 0 1-4.953-1.355l-.355-.212-3.676.94.98-3.565-.232-.368A9.713 9.713 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"
  })), "Prefiero WhatsApp")))), galleryProject && /*#__PURE__*/React.createElement(GalleryModal, {
    title: galleryProject.name,
    subtitle: galleryProject.code + ' · ' + galleryProject.meta,
    photos: galleryProject.gallery || [],
    onClose: () => setGalleryProject(null)
  }));
}
var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
var DISCOUNT_CODE = 'BIENVENIDO10';
function EmailPopup() {
  const STORAGE_KEY = 'ruah-email-popup-dismissed';
  const [visible, setVisible] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState('');
  const [done, setDone] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setVisible(true), 12000);
    return () => clearTimeout(t);
  }, []);
  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }
  function copyCode() {
    navigator.clipboard.writeText(DISCOUNT_CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      // fallback for older browsers
      var el = document.createElement('textarea');
      el.value = DISCOUNT_CODE;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }
  function submit(e) {
    e.preventDefault();
    var trimmed = email.trim();
    if (!EMAIL_REGEX.test(trimmed)) {
      setError('Ingresa un correo válido (ej: nombre@dominio.cl)');
      return;
    }
    setError('');
    var db = window.ruahDb || window._ruahSbClient;
    if (db) {
      db.from('email_leads').insert({
        email: trimmed,
        source: 'popup',
        created_at: new Date().toISOString()
      }).then(function (res) {
        if (res && res.error && res.error.code !== '23505') {
          console.warn('email_leads insert error:', res.error.message || res.error);
        }
      });
    }
    setDone(true);
    localStorage.setItem(STORAGE_KEY, '1');
  }
  if (!visible) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "ep-overlay",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Descuento de bienvenida"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ep-box"
  }, /*#__PURE__*/React.createElement("button", {
    className: "ep-close",
    onClick: dismiss,
    "aria-label": "Cerrar"
  }, "\xD7"), done ? /*#__PURE__*/React.createElement("div", {
    className: "ep-done"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ep-done__icon"
  }, "\u2713"), /*#__PURE__*/React.createElement("p", {
    className: "ep-done__title"
  }, "Tu c\xF3digo:"), /*#__PURE__*/React.createElement("p", {
    className: "ep-done__code"
  }, DISCOUNT_CODE), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ep-copy",
    onClick: copyCode
  }, copied ? '¡Copiado!' : 'Copiar código →'), /*#__PURE__*/React.createElement("p", {
    className: "ep-done__sub"
  }, "10% off en tu primera compra. \xDAsalo en el checkout.")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "ep-tag"
  }, "PROTOCOLO 1\xD71 ACTIVO"), /*#__PURE__*/React.createElement("h2", {
    className: "ep-title"
  }, "Tu primera prenda,", /*#__PURE__*/React.createElement("br", null), "con 10% off."), /*#__PURE__*/React.createElement("p", {
    className: "ep-sub"
  }, "Suscr\xEDbete y recibe el c\xF3digo. Cada compra dona una prenda a alguien en situaci\xF3n de calle."), /*#__PURE__*/React.createElement("form", {
    className: "ep-form",
    onSubmit: submit
  }, /*#__PURE__*/React.createElement("input", {
    className: "ep-input",
    type: "email",
    placeholder: "tu@correo.cl",
    value: email,
    onChange: e => {
      setEmail(e.target.value);
      setError('');
    }
  }), error && /*#__PURE__*/React.createElement("p", {
    className: "ep-error"
  }, error), /*#__PURE__*/React.createElement("button", {
    className: "ep-btn",
    type: "submit"
  }, "Obtener descuento \u2192")), /*#__PURE__*/React.createElement("p", {
    className: "ep-legal"
  }, "Sin spam. Solo drops, rutas y novedades del movimiento."))));
}
Object.assign(window, {
  Cuadros,
  Iglesias,
  GalleryModal,
  EmailPopup
});

/* eventos */
/* global React, Reveal, RevealLine */
// ============================================================
// RUAH LABS — Sección "Evento" (RUAH EVENTO)
// ============================================================

function Eventos({
  content
}) {
  const ev = content.eventos;
  const [activeGallery, setActiveGallery] = React.useState(null);
  return /*#__PURE__*/React.createElement("section", {
    className: "evento",
    id: "evento"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ev-head"
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
    className: "sec-head__num ev-eyebrow"
  }, ev.eyebrow)), /*#__PURE__*/React.createElement("div", {
    className: "ev-head__right"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "ev-title"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, null, ev.title)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 120
  }, /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, ev.titleEm))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 240
  }, ev.titleAfter))), /*#__PURE__*/React.createElement(Reveal, {
    delay: 380,
    className: "ev-sub"
  }, /*#__PURE__*/React.createElement("p", null, ev.sub)))), ev.gallery && ev.gallery.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "ev-banner__wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ev-banner__track"
  }, [...ev.gallery, ...ev.gallery, ...ev.gallery].map((g, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "ev-banner__slide"
  }, g.img ? /*#__PURE__*/React.createElement("img", {
    src: g.img,
    alt: "",
    className: "ev-banner__img"
  }) : /*#__PURE__*/React.createElement("div", {
    className: "ev-banner__ph"
  }, /*#__PURE__*/React.createElement("span", null, "0", i % ev.gallery.length + 1)))))), activeGallery && /*#__PURE__*/React.createElement(GalleryModal, {
    title: activeGallery.caption || 'Galería',
    subtitle: null,
    photos: activeGallery.photos || [],
    onClose: () => setActiveGallery(null)
  }), /*#__PURE__*/React.createElement(Reveal, {
    className: "ev-packs ev-packs--standalone"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ev-packs__hd"
  }, ev.packsTitle), /*#__PURE__*/React.createElement("div", {
    className: "ev-packs__grid"
  }, ev.packs.map((p, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: p.id,
    delay: i * 80,
    className: 'ev-pack' + (p.featured ? ' ev-pack--featured' : '')
  }, p.featured && /*#__PURE__*/React.createElement("div", {
    className: "ev-pack__badge"
  }, "M\xC1S POPULAR"), /*#__PURE__*/React.createElement("div", {
    className: "ev-pack__top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ev-pack__name"
  }, p.name), /*#__PURE__*/React.createElement("div", {
    className: "ev-pack__limit"
  }, p.limit)), /*#__PURE__*/React.createElement("div", {
    className: "ev-pack__price"
  }, p.price), /*#__PURE__*/React.createElement("div", {
    className: "ev-pack__detail"
  }, p.detail)))), /*#__PURE__*/React.createElement("p", {
    className: "ev-packs__foot"
  }, ev.packsFoot)), /*#__PURE__*/React.createElement(Reveal, {
    className: "ev-detail"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ev-detail__icon"
  }, "1\xD7"), /*#__PURE__*/React.createElement("div", {
    className: "ev-detail__txt"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "ev-detail__title"
  }, ev.detailTitle), /*#__PURE__*/React.createElement("p", {
    className: "ev-detail__body"
  }, ev.detailBody))), /*#__PURE__*/React.createElement(Reveal, {
    className: "ev-wedo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ev-block__eyebrow"
  }, ev.weDoEyebrow), /*#__PURE__*/React.createElement("h3", {
    className: "ev-wedo__title"
  }, ev.weDoTitle), /*#__PURE__*/React.createElement("p", {
    className: "ev-wedo__body"
  }, ev.weDoBody), /*#__PURE__*/React.createElement("p", {
    className: "ev-wedo__tagline"
  }, ev.weDoTagline)), /*#__PURE__*/React.createElement(Reveal, {
    className: "ev-block ev-block--solo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ev-block__eyebrow"
  }, ev.problemEyebrow), /*#__PURE__*/React.createElement("h3", {
    className: "ev-block__title"
  }, ev.problemTitle), /*#__PURE__*/React.createElement("p", {
    className: "ev-block__body"
  }, ev.problemBody)), /*#__PURE__*/React.createElement("div", {
    className: "ev-pillars"
  }, ev.pillars.map((p, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: p.id,
    delay: i * 70,
    className: "ev-pillar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ev-pillar__num"
  }, p.num), /*#__PURE__*/React.createElement("h4", {
    className: "ev-pillar__title"
  }, p.title), /*#__PURE__*/React.createElement("p", {
    className: "ev-pillar__desc"
  }, p.desc)))), /*#__PURE__*/React.createElement(Reveal, {
    className: "ev-onwhat"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "ev-onwhat__title"
  }, ev.onWhatTitle), /*#__PURE__*/React.createElement("p", {
    className: "ev-onwhat__body"
  }, ev.onWhatBody)), /*#__PURE__*/React.createElement("div", {
    className: "ev-receive"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ev-receive__left"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "ev-block__title"
  }, ev.receiveTitle), /*#__PURE__*/React.createElement("ul", {
    className: "ev-list"
  }, ev.receiveItems.map(it => /*#__PURE__*/React.createElement("li", {
    key: it.id
  }, /*#__PURE__*/React.createElement("span", {
    className: "ev-list__dot"
  }, "\u25AA"), /*#__PURE__*/React.createElement("span", null, it.txt)))))), /*#__PURE__*/React.createElement("div", {
    className: "ev-coverage"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ev-coverage__lbl"
  }, ev.coverageTitle), /*#__PURE__*/React.createElement("span", {
    className: "ev-coverage__val"
  }, ev.coverageBody)), /*#__PURE__*/React.createElement("div", {
    className: "ev-cta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono-label"
  }, ev.ctaEyebrow), /*#__PURE__*/React.createElement("h3", {
    className: "ev-cta__title"
  }, /*#__PURE__*/React.createElement(RevealLine, null, ev.ctaTitle)), /*#__PURE__*/React.createElement("p", {
    className: "ev-cta__body"
  }, ev.ctaBody), /*#__PURE__*/React.createElement("div", {
    className: "ev-cta__btns"
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn btn--amber",
    href: ev.ctaBtn.href,
    target: "_blank",
    rel: "noreferrer"
  }, ev.ctaBtn.label, " ", /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2192")), /*#__PURE__*/React.createElement("a", {
    className: "btn btn--ghost",
    href: ev.ctaBtn2.href
  }, ev.ctaBtn2.label)), /*#__PURE__*/React.createElement("p", {
    className: "ev-cta__ig"
  }, "Instagram: ", /*#__PURE__*/React.createElement("strong", null, ev.instagram))), /*#__PURE__*/React.createElement("p", {
    className: "ev-closing"
  }, ev.closing)));
}
Object.assign(window, {
  Eventos
});

/* club */
/* global React */
// ============================================================
// RUAH LABS CLUB — Secret area
// ============================================================

function Club({
  open,
  content,
  onClose,
  store
}) {
  const [authed, setAuthed] = React.useState(() => sessionStorage.getItem('ruah-club-auth') === '1');
  const memberName = (sessionStorage.getItem('ruah-club-name') || '').split(' ')[0].toUpperCase();
  const [pwd, setPwd] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [err, setErr] = React.useState('');
  const [composer, setComposer] = React.useState('');
  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);
  React.useEffect(() => {
    if (!open) {
      setErr('');
      return;
    }
    // Re-check auth each time the Club opens — the secret-portal login may
    // have authenticated us already (no second login screen).
    if (sessionStorage.getItem('ruah-club-auth') === '1') setAuthed(true);
  }, [open]);
  async function enter(e) {
    e && e.preventDefault();
    var api = (window.RUAH_API || '') + '/api/club/verify-password';
    var ok = false;
    try {
      var r = await fetch(api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: pwd
        })
      });
      var data = await r.json();
      ok = !!data.ok;
    } catch (_) {
      // Sin fallback local: la verificación es solo server-side (bcrypt).
      // Comparar contra un hash público sería falsificable/craqueable offline.
      setErr('NO SE PUDO CONECTAR CON EL SERVIDOR. INTENTA DE NUEVO.');
      return;
    }
    if (ok) {
      setAuthed(true);
      sessionStorage.setItem('ruah-club-auth', '1');
      setErr('');
    } else {
      setErr('CONTRASEÑA INCORRECTA — REVISA EL CORREO QUE LLEGÓ CON TU COMPRA.');
    }
  }
  function toggleJoin(routeId) {
    var routes = content.club.routes;
    var route = routes.find(function (r) {
      return r.id === routeId;
    });
    if (!route) return;
    var joining = !route.joined;
    var email = sessionStorage.getItem('ruah-club-email') || '';

    // Actualizar UI inmediatamente
    store.updateList('club.routes', function (list) {
      return list.map(function (r) {
        return r.id === routeId ? Object.assign({}, r, {
          joined: joining
        }) : r;
      });
    });

    // Persistir en Supabase
    if (email) {
      if (joining) {
        fetch('' + window.RUAH_API + '/api/club/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            route_id: routeId,
            route_name: route.name
          })
        }).catch(function () {});
      } else {
        fetch('' + window.RUAH_API + '/api/club/signup', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            route_id: routeId
          })
        }).catch(function () {});
      }
    }
  }
  function postMessage() {
    if (!composer.trim()) return;
    store.updateList('club.feed', list => [{
      id: 'f' + Date.now(),
      when: 'AHORA · TÚ',
      what: composer.trim()
    }, ...list]);
    setComposer('');
  }
  const c = content.club;
  const [activeTab, setActiveTab] = React.useState('routes'); // 'routes', 'meetings', 'feed', 'photos'

  return /*#__PURE__*/React.createElement("div", {
    className: 'club-overlay' + (open ? ' open' : ''),
    "aria-hidden": !open
  }, /*#__PURE__*/React.createElement("div", {
    className: "club"
  }, /*#__PURE__*/React.createElement("div", {
    className: "club__top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "club__brand"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), "RUAH LABS CLUB"), /*#__PURE__*/React.createElement("button", {
    className: "club__close",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("span", null, "Cerrar"), /*#__PURE__*/React.createElement("span", null, "\xD7"))), !authed && /*#__PURE__*/React.createElement("div", {
    className: "club__gate"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 10,
      letterSpacing: '0.2em',
      color: 'var(--amber)',
      textTransform: 'uppercase',
      marginBottom: 24
    }
  }, "\u25C9 ACCESO PRIVADO"), /*#__PURE__*/React.createElement("h2", null, "SOMOS MAS", /*#__PURE__*/React.createElement("br", null), "DE LOS QUE", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("em", null, "CREES.")), /*#__PURE__*/React.createElement("p", {
    className: "lede"
  }, "La contrase\xF1a te lleg\xF3 por correo al momento de tu compra. Si no la encuentras, escr\xEDbenos a contacto@ruahlabs.cl"), /*#__PURE__*/React.createElement("form", {
    onSubmit: enter
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "club-email"
  }, "Correo"), /*#__PURE__*/React.createElement("input", {
    id: "club-email",
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "tu@correo.com",
    autoComplete: "email"
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "club-pwd"
  }, "Contrase\xF1a"), /*#__PURE__*/React.createElement("input", {
    id: "club-pwd",
    type: "password",
    value: pwd,
    onChange: e => setPwd(e.target.value),
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    autoComplete: "current-password"
  }), /*#__PURE__*/React.createElement("div", {
    className: "err"
  }, err), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "enter"
  }, "Entrar al movimiento \u2192"))), authed && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "club__hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, c.heroEyebrow), memberName && /*#__PURE__*/React.createElement("p", {
    className: "club__bienvenido"
  }, "BIENVENIDO, ", memberName, "."), /*#__PURE__*/React.createElement("h1", null, c.title, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("em", null, c.titleEm)), /*#__PURE__*/React.createElement("p", {
    className: "frase"
  }, c.frase)), /*#__PURE__*/React.createElement("div", {
    className: "club__panels"
  }, c.panels.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    className: "club__panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ttl"
  }, p.ttl), /*#__PURE__*/React.createElement("div", {
    className: "big"
  }, p.big), /*#__PURE__*/React.createElement("div", {
    className: "desc"
  }, p.desc)))), /*#__PURE__*/React.createElement("div", {
    className: "club__tabs"
  }, /*#__PURE__*/React.createElement("button", {
    className: 'club__tab-btn' + (activeTab === 'routes' ? ' active' : ''),
    onClick: () => setActiveTab('routes')
  }, "A / RUTAS"), /*#__PURE__*/React.createElement("button", {
    className: 'club__tab-btn' + (activeTab === 'meetings' ? ' active' : ''),
    onClick: () => setActiveTab('meetings')
  }, "B / REUNIONES"), /*#__PURE__*/React.createElement("button", {
    className: 'club__tab-btn' + (activeTab === 'feed' ? ' active' : ''),
    onClick: () => setActiveTab('feed')
  }, "C / CANAL PRIVADO"), /*#__PURE__*/React.createElement("button", {
    className: 'club__tab-btn' + (activeTab === 'photos' ? ' active' : ''),
    onClick: () => setActiveTab('photos')
  }, "D / REGISTRO FOTOGR\xC1FICO")), activeTab === 'routes' && /*#__PURE__*/React.createElement("div", {
    className: "club__section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, "[ A ] PROXIMAS RUTAS"), /*#__PURE__*/React.createElement("h3", null, "SALIMOS A ", /*#__PURE__*/React.createElement("em", null, "la calle.")), /*#__PURE__*/React.createElement("div", {
    className: "routes"
  }, c.routes.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    className: "route"
  }, /*#__PURE__*/React.createElement("div", {
    className: "route__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, r.date), /*#__PURE__*/React.createElement("span", null, r.joined ? '✓ ANOTADO' : '+ ANOTARSE')), /*#__PURE__*/React.createElement("div", {
    className: "route__name"
  }, r.name), /*#__PURE__*/React.createElement("div", {
    className: "route__meta"
  }, r.meta), /*#__PURE__*/React.createElement("div", {
    className: "route__signup"
  }, /*#__PURE__*/React.createElement("span", null, "Cupo abierto"), /*#__PURE__*/React.createElement("button", {
    className: r.joined ? 'joined' : '',
    onClick: () => toggleJoin(r.id)
  }, r.joined ? '✓ Estoy adentro' : 'Anotarme')))))), activeTab === 'meetings' && /*#__PURE__*/React.createElement("div", {
    className: "club__section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, "[ B ] REUNIONES SECRETAS"), /*#__PURE__*/React.createElement("h3", null, "HACEMOS ", /*#__PURE__*/React.createElement("em", null, "iglesia.")), /*#__PURE__*/React.createElement("div", {
    className: "meetings"
  }, c.meetings.map(m => /*#__PURE__*/React.createElement("div", {
    key: m.id,
    className: "meet"
  }, /*#__PURE__*/React.createElement("div", {
    className: "meet__date"
  }, /*#__PURE__*/React.createElement("div", {
    className: "d"
  }, m.day), /*#__PURE__*/React.createElement("div", {
    className: "m"
  }, m.mon)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "meet__name"
  }, m.name), /*#__PURE__*/React.createElement("div", {
    className: "meet__det"
  }, m.det)))))), activeTab === 'feed' && /*#__PURE__*/React.createElement("div", {
    className: "club__section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, "[ C ] CANAL PRIVADO"), /*#__PURE__*/React.createElement("h3", null, "NOS ", /*#__PURE__*/React.createElement("em", null, "cuidamos.")), /*#__PURE__*/React.createElement("div", {
    className: "feed"
  }, c.feed.map(f => /*#__PURE__*/React.createElement("div", {
    key: f.id,
    className: "feed__item"
  }, /*#__PURE__*/React.createElement("div", {
    className: "when"
  }, /*#__PURE__*/React.createElement("span", {
    className: "who"
  }, f.when)), /*#__PURE__*/React.createElement("div", {
    className: "what"
  }, f.what)))), /*#__PURE__*/React.createElement("div", {
    className: "compose"
  }, /*#__PURE__*/React.createElement("textarea", {
    placeholder: "Escribe algo para el grupo. Una petici\xF3n de oraci\xF3n, un aviso, una buena noticia\u2026",
    value: composer,
    onChange: e => setComposer(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    className: "compose__row"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: postMessage
  }, "Publicar \u2192")))), activeTab === 'photos' && /*#__PURE__*/React.createElement("div", {
    className: "club__section club__photos-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, "[ D ] REGISTRO FOTOGR\xC1FICO"), /*#__PURE__*/React.createElement("h3", null, c.photoRegistryTitle), /*#__PURE__*/React.createElement("p", {
    className: "club__photos-subtitle"
  }, c.photoRegistrySubtitle), /*#__PURE__*/React.createElement("div", {
    className: "club__photos-grid"
  }, (c.photos || []).map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    className: "club__photo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "club__photo-img"
  }, p.img ? /*#__PURE__*/React.createElement("img", {
    src: p.img,
    alt: p.caption
  }) : /*#__PURE__*/React.createElement("div", {
    className: "club__photo-placeholder"
  }, "+")), /*#__PURE__*/React.createElement("div", {
    className: "club__photo-caption"
  }, p.caption))))))));
}
Object.assign(window, {
  Club
});

/* checkout */
/* global React */
// ============================================================
// RUAH LABS — Checkout flow (3 pasos + confirmación)
// Reutiliza branding existente: .btn, .btn--amber, .btn--ghost,
// tipografía mono/serif, paleta ámbar/marfil/negro.
// ============================================================

const SHIPPING_OPTIONS = [{
  id: 'std',
  name: 'Envío estándar',
  eta: '5 – 7 días hábiles',
  price: 4990
}, {
  id: 'express',
  name: 'Envío express',
  eta: '24 – 48 hrs',
  price: 9990
}, {
  id: 'pickup',
  name: 'Retiro en taller',
  eta: 'Lunes a viernes · Ñuñoa',
  price: 0
}];
const PAY_METHODS = [{
  id: 'card',
  name: 'Tarjeta',
  hint: 'Crédito / Débito · Visa · Mastercard · Amex'
}, {
  id: 'webpay',
  name: 'Webpay',
  hint: 'Transbank · Redcompra'
}, {
  id: 'transfer',
  name: 'Transferencia',
  hint: 'BancoEstado · Tesorería RUAH'
}];
function parsePrice(p) {
  // "18.990" -> 18990 ; "9990" -> 9990
  return parseInt(String(p || '0').replace(/[^\d]/g, ''), 10) || 0;
}
function fmtCLP(n) {
  return new Intl.NumberFormat('es-CL').format(Math.max(0, Math.round(n || 0)));
}
function detectCardBrand(num) {
  const s = (num || '').replace(/\s+/g, '');
  if (/^4/.test(s)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(s)) return 'mastercard';
  if (/^3[47]/.test(s)) return 'amex';
  if (/^6(011|5)/.test(s)) return 'discover';
  return null;
}
function formatCardNumber(num, brand) {
  const s = (num || '').replace(/\D/g, '');
  if (brand === 'amex') {
    return s.replace(/(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' ')).trim();
  }
  return s.replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
}
function formatExp(s) {
  const v = (s || '').replace(/\D/g, '').slice(0, 4);
  if (v.length < 3) return v;
  return v.slice(0, 2) + '/' + v.slice(2);
}
function CardBrandMark({
  brand
}) {
  if (!brand) {
    return /*#__PURE__*/React.createElement("span", {
      className: "ck-card-brand ck-card-brand--blank",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null));
  }
  const labels = {
    visa: 'VISA',
    mastercard: 'MC',
    amex: 'AMEX',
    discover: 'DISC'
  };
  return /*#__PURE__*/React.createElement("span", {
    className: 'ck-card-brand ck-card-brand--' + brand
  }, labels[brand]);
}

// ============================================================
// MAIN
// ============================================================
function Checkout({
  open,
  cart,
  content,
  onClose,
  onUpdateCart
}) {
  const [step, setStep] = React.useState(0);
  const [info, setInfo] = React.useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    address2: '',
    city: '',
    region: '',
    postal: '',
    phone: '',
    country: 'Chile',
    newsletter: true
  });
  const [shipping, setShipping] = React.useState(SHIPPING_OPTIONS[0].id);
  const [payMethod, setPayMethod] = React.useState('card');
  const [card, setCard] = React.useState({
    num: '',
    name: '',
    exp: '',
    cvv: ''
  });
  const [discount, setDiscount] = React.useState('');
  const [discountApplied, setDiscountApplied] = React.useState(null);
  const [discountErr, setDiscountErr] = React.useState('');
  const [terms, setTerms] = React.useState(false);
  const [payState, setPayState] = React.useState('idle'); // idle | processing | success
  const [orderNum, setOrderNum] = React.useState('');
  const [touched, setTouched] = React.useState({});

  // Reset when re-opened
  React.useEffect(() => {
    if (open) {
      setStep(0);
      setPayState('idle');
      setTouched({});
    }
  }, [open]);
  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;

  // ---------------------- Totals ----------------------
  const subtotal = (cart || []).reduce((s, it) => s + parsePrice(it.price) * (it.qty || 1), 0);
  const shipOpt = SHIPPING_OPTIONS.find(s => s.id === shipping) || SHIPPING_OPTIONS[0];
  const shipFee = shipOpt.price;
  const discountAmount = discountApplied ? Math.round(subtotal * discountApplied.percent / 100) : 0;
  const total = Math.max(0, subtotal - discountAmount) + shipFee;
  const cardBrand = detectCardBrand(card.num);

  // ---------------------- Validation ----------------------
  function infoValid() {
    return info.email.includes('@') && info.firstName && info.lastName && info.address && info.city && info.region && info.phone;
  }
  function cardValid() {
    const n = card.num.replace(/\D/g, '');
    return n.length >= 13 && card.name && /^\d{2}\/\d{2}$/.test(card.exp) && card.cvv.length >= 3 && terms;
  }

  // ---------------------- Actions ----------------------
  function applyDiscount(e) {
    e && e.preventDefault();
    const code = discount.trim().toUpperCase();
    if (code === 'BIENVENIDO10') {
      setDiscountApplied({
        code: 'BIENVENIDO10',
        percent: 10
      });
      setDiscountErr('');
    } else if (code === '') {
      setDiscountApplied(null);
      setDiscountErr('');
    } else {
      setDiscountApplied(null);
      setDiscountErr('Código no válido');
    }
  }
  function setQty(uid, qty) {
    onUpdateCart(c => c.map(it => (it.uid || it.id) === uid ? {
      ...it,
      qty: Math.max(1, qty)
    } : it));
  }
  function removeItem(uid) {
    onUpdateCart(c => c.filter(it => (it.uid || it.id) !== uid));
  }
  function goStep(n) {
    if (n > step) {
      if (step === 0 && !infoValid()) {
        setTouched({
          email: 1,
          firstName: 1,
          lastName: 1,
          address: 1,
          city: 1,
          region: 1,
          phone: 1
        });
        return;
      }
    }
    setStep(Math.max(0, Math.min(3, n)));
    requestAnimationFrame(() => {
      const el = document.querySelector('.ck-stage');
      if (el) el.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  function pay(e) {
    e.preventDefault();
    if (!terms) return;
    setPayState('processing');
    // Guardar datos del comprador para recuperarlos después del redirect de MP
    try {
      sessionStorage.setItem('ruah-pending-order', JSON.stringify({
        email: info.email,
        firstName: info.firstName,
        lastName: info.lastName,
        phone: info.phone,
        address: info.address,
        address2: info.address2 || '',
        city: info.city,
        region: info.region,
        purchaseDate: new Date().toISOString(),
        cart: cart,
        total: total,
        discount: discountApplied ? discountApplied.code : null,
        discountAmount: discountAmount,
        shippingFee: shipFee,
        shippingName: shipOpt.name
      }));
    } catch (_) {}
    fetch('' + window.RUAH_API + '/api/checkout/create-preference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cart: cart.map(it => ({
          ...it,
          price: parsePrice(it.price)
        })),
        info: info,
        discount: discountApplied ? discountApplied.code : null,
        shippingMethod: shipping
      })
    }).then(function (r) {
      return r.json();
    }).then(function (data) {
      if (data.error) {
        setPayState('idle');
        alert('Error MP: ' + data.error);
        return;
      }
      // Guardar número de pedido antes del redirect
      try {
        var pending = JSON.parse(sessionStorage.getItem('ruah-pending-order') || '{}');
        var _chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        var _code = 'RL';
        for (var _i = 0; _i < 4; _i++) _code += _chars[Math.floor(Math.random() * _chars.length)];
        pending.orderId = _code;
        sessionStorage.setItem('ruah-pending-order', JSON.stringify(pending));
      } catch (_) {}
      var url = data.init_point || data.sandbox_init_point;
      window.location.href = url;
    }).catch(function (err) {
      setPayState('idle');
      alert('No se pudo conectar con el servidor de pagos.\nAsegúrate de que el API server esté corriendo (puerto 3001).\n\n' + err.message);
    });
  }

  // ---------------------- Steps ----------------------
  const ck = content && content.checkout || {};
  return /*#__PURE__*/React.createElement("div", {
    className: "ck-overlay",
    role: "dialog",
    "aria-modal": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-shell"
  }, /*#__PURE__*/React.createElement("header", {
    className: "ck-top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-top__brand"
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources && window.__resources.logoWhite || "https://res.cloudinary.com/dh05zwrbp/image/upload/v1781323723/ruahlabs/s6aaamzrfbcwd46icjxu.png",
    alt: "RUAH LABS",
    className: "ck-top__logo"
  }), /*#__PURE__*/React.createElement("span", {
    className: "ck-top__tag"
  }, ck.topTag || 'CHECKOUT · ACTIVA PROTOCOLO 1×1')), /*#__PURE__*/React.createElement("button", {
    className: "ck-close",
    onClick: onClose,
    "aria-label": "Cerrar"
  }, "\xD7")), step < 2 && /*#__PURE__*/React.createElement(Stepper, {
    step: step,
    onGo: goStep,
    labels: ck.stepLabels
  }), /*#__PURE__*/React.createElement("div", {
    className: "ck-stage"
  }, step === 3 ? /*#__PURE__*/React.createElement(Confirmation, {
    order: orderNum,
    info: info,
    total: total,
    cart: cart,
    onClose: onClose,
    content: content
  }) : /*#__PURE__*/React.createElement("div", {
    className: "ck-layout"
  }, /*#__PURE__*/React.createElement("main", {
    className: "ck-main"
  }, step === 0 && /*#__PURE__*/React.createElement(StepInfo, {
    info: info,
    setInfo: setInfo,
    touched: touched,
    onNext: () => goStep(1),
    content: content
  }), step === 1 && /*#__PURE__*/React.createElement(StepShipping, {
    shipping: shipping,
    setShipping: setShipping,
    discount: discount,
    setDiscount: setDiscount,
    discountApplied: discountApplied,
    discountErr: discountErr,
    applyDiscount: applyDiscount,
    terms: terms,
    setTerms: setTerms,
    total: total,
    payState: payState,
    onBack: () => goStep(0),
    onPay: pay,
    content: content
  })), /*#__PURE__*/React.createElement(Summary, {
    cart: cart,
    setQty: setQty,
    removeItem: removeItem,
    subtotal: subtotal,
    shipOpt: shipOpt,
    shipFee: shipFee,
    discountApplied: discountApplied,
    discountAmount: discountAmount,
    total: total,
    content: content
  })))));
}

// ============================================================
// STEPPER
// ============================================================
function Stepper({
  step,
  onGo,
  labels
}) {
  const steps = labels && labels.length === 2 ? labels : ['INFORMACIÓN', 'ENVÍO'];
  return /*#__PURE__*/React.createElement("nav", {
    className: "ck-stepper",
    "aria-label": "Pasos del checkout"
  }, steps.map((label, i) => /*#__PURE__*/React.createElement("button", {
    key: label,
    type: "button",
    className: 'ck-step' + (i === step ? ' active' : '') + (i < step ? ' done' : ''),
    onClick: () => i < step && onGo(i),
    disabled: i > step
  }, /*#__PURE__*/React.createElement("span", {
    className: "ck-step__n"
  }, String(i + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("span", {
    className: "ck-step__l"
  }, label))));
}

// ============================================================
// STEP 1 — INFORMACIÓN
// ============================================================
function StepInfo({
  info,
  setInfo,
  touched,
  onNext,
  content
}) {
  const ck = content && content.checkout || {};
  function up(k, v) {
    setInfo({
      ...info,
      [k]: v
    });
  }
  function err(k) {
    return touched[k] && !info[k];
  }
  function submit(e) {
    e.preventDefault();
    onNext();
  }
  return /*#__PURE__*/React.createElement("form", {
    className: "ck-form",
    onSubmit: submit,
    noValidate: true
  }, /*#__PURE__*/React.createElement("h2", {
    className: "ck-h"
  }, ck.infoTitle || 'Información de contacto'), /*#__PURE__*/React.createElement("p", {
    className: "ck-sub"
  }, ck.infoSub || 'Recibirás aquí el comprobante y el registro del Protocolo 1×1.'), /*#__PURE__*/React.createElement("label", {
    className: 'ck-field' + (err('email') ? ' invalid' : '')
  }, /*#__PURE__*/React.createElement("span", null, "EMAIL"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    required: true,
    value: info.email,
    onChange: e => up('email', e.target.value),
    placeholder: "tu@correo.cl",
    autoComplete: "email"
  })), /*#__PURE__*/React.createElement("h3", {
    className: "ck-h2"
  }, ck.addressTitle || 'Dirección de envío'), /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", null, "PA\xCDS / REGI\xD3N"), /*#__PURE__*/React.createElement("select", {
    value: info.country,
    onChange: e => up('country', e.target.value)
  }, /*#__PURE__*/React.createElement("option", null, "Chile"), /*#__PURE__*/React.createElement("option", null, "Argentina"), /*#__PURE__*/React.createElement("option", null, "Per\xFA"), /*#__PURE__*/React.createElement("option", null, "Colombia"), /*#__PURE__*/React.createElement("option", null, "M\xE9xico"), /*#__PURE__*/React.createElement("option", null, "Espa\xF1a"))), /*#__PURE__*/React.createElement("div", {
    className: "ck-grid-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: 'ck-field' + (err('firstName') ? ' invalid' : '')
  }, /*#__PURE__*/React.createElement("span", null, "NOMBRE"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    value: info.firstName,
    onChange: e => up('firstName', e.target.value),
    placeholder: "Mar\xEDa",
    autoComplete: "given-name"
  })), /*#__PURE__*/React.createElement("label", {
    className: 'ck-field' + (err('lastName') ? ' invalid' : '')
  }, /*#__PURE__*/React.createElement("span", null, "APELLIDO"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    value: info.lastName,
    onChange: e => up('lastName', e.target.value),
    placeholder: "Gonz\xE1lez",
    autoComplete: "family-name"
  }))), /*#__PURE__*/React.createElement("label", {
    className: 'ck-field' + (err('address') ? ' invalid' : '')
  }, /*#__PURE__*/React.createElement("span", null, "DIRECCI\xD3N"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    value: info.address,
    onChange: e => up('address', e.target.value),
    placeholder: "Calle, n\xFAmero",
    autoComplete: "street-address"
  })), /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", null, "DEPTO / OFICINA \xB7 OPCIONAL"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: info.address2,
    onChange: e => up('address2', e.target.value),
    placeholder: "Depto 402 \xB7 Torre B"
  })), /*#__PURE__*/React.createElement("div", {
    className: "ck-grid-3"
  }, /*#__PURE__*/React.createElement("label", {
    className: 'ck-field' + (err('city') ? ' invalid' : '')
  }, /*#__PURE__*/React.createElement("span", null, "CIUDAD"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    value: info.city,
    onChange: e => up('city', e.target.value),
    placeholder: "Santiago",
    autoComplete: "address-level2"
  })), /*#__PURE__*/React.createElement("label", {
    className: 'ck-field' + (err('region') ? ' invalid' : '')
  }, /*#__PURE__*/React.createElement("span", null, "REGI\xD3N"), /*#__PURE__*/React.createElement("select", {
    required: true,
    value: info.region,
    onChange: e => up('region', e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014 Selecciona \u2014"), /*#__PURE__*/React.createElement("option", null, "Arica y Parinacota"), /*#__PURE__*/React.createElement("option", null, "Tarapac\xE1"), /*#__PURE__*/React.createElement("option", null, "Antofagasta"), /*#__PURE__*/React.createElement("option", null, "Atacama"), /*#__PURE__*/React.createElement("option", null, "Coquimbo"), /*#__PURE__*/React.createElement("option", null, "Valpara\xEDso"), /*#__PURE__*/React.createElement("option", null, "Metropolitana"), /*#__PURE__*/React.createElement("option", null, "O'Higgins"), /*#__PURE__*/React.createElement("option", null, "Maule"), /*#__PURE__*/React.createElement("option", null, "\xD1uble"), /*#__PURE__*/React.createElement("option", null, "Biob\xEDo"), /*#__PURE__*/React.createElement("option", null, "Araucan\xEDa"), /*#__PURE__*/React.createElement("option", null, "Los R\xEDos"), /*#__PURE__*/React.createElement("option", null, "Los Lagos"), /*#__PURE__*/React.createElement("option", null, "Ays\xE9n"), /*#__PURE__*/React.createElement("option", null, "Magallanes"))), /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", null, "C\xD3D. POSTAL"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: info.postal,
    onChange: e => up('postal', e.target.value),
    placeholder: "7500000",
    autoComplete: "postal-code"
  }))), /*#__PURE__*/React.createElement("label", {
    className: 'ck-field' + (err('phone') ? ' invalid' : '')
  }, /*#__PURE__*/React.createElement("span", null, "TEL\xC9FONO"), /*#__PURE__*/React.createElement("input", {
    type: "tel",
    required: true,
    value: info.phone,
    onChange: e => up('phone', e.target.value),
    placeholder: "+56 9 0000 0000",
    autoComplete: "tel"
  })), /*#__PURE__*/React.createElement("label", {
    className: "ck-check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: info.newsletter,
    onChange: e => up('newsletter', e.target.checked)
  }), /*#__PURE__*/React.createElement("span", null, "Sumarme al bolet\xEDn mensual del Protocolo 1\xD71 (sin spam).")), /*#__PURE__*/React.createElement("div", {
    className: "ck-actions"
  }, /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn--amber"
  }, ck.nextLabel || 'Continuar a envío', " ", /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2192"))));
}

// ============================================================
// STEP 2 — ENVÍO + PAGO DIRECTO MP
// ============================================================
function StepShipping({
  shipping,
  setShipping,
  discount,
  setDiscount,
  discountApplied,
  discountErr,
  applyDiscount,
  terms,
  setTerms,
  total,
  payState,
  onBack,
  onPay,
  content
}) {
  const ck = content && content.checkout || {};
  return /*#__PURE__*/React.createElement("form", {
    className: "ck-form",
    onSubmit: onPay
  }, /*#__PURE__*/React.createElement("h2", {
    className: "ck-h"
  }, ck.shippingTitle || 'Método de envío'), /*#__PURE__*/React.createElement("p", {
    className: "ck-sub"
  }, ck.shippingSub || 'Despachamos a todo Chile. Retiro disponible Lun – Vie, 11 a 19h.'), /*#__PURE__*/React.createElement("div", {
    className: "ck-options"
  }, SHIPPING_OPTIONS.map(opt => /*#__PURE__*/React.createElement("label", {
    key: opt.id,
    className: 'ck-opt' + (shipping === opt.id ? ' active' : '')
  }, /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: "ship",
    value: opt.id,
    checked: shipping === opt.id,
    onChange: () => setShipping(opt.id)
  }), /*#__PURE__*/React.createElement("div", {
    className: "ck-opt__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-opt__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ck-opt__name"
  }, opt.name), /*#__PURE__*/React.createElement("span", {
    className: "ck-opt__price"
  }, opt.price === 0 ? 'GRATIS' : 'CLP $' + fmtCLP(opt.price))), /*#__PURE__*/React.createElement("div", {
    className: "ck-opt__eta"
  }, opt.eta)), /*#__PURE__*/React.createElement("span", {
    className: "ck-opt__radio",
    "aria-hidden": "true"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "ck-discount"
  }, /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", null, "C\xD3DIGO DE DESCUENTO"), /*#__PURE__*/React.createElement("div", {
    className: "ck-input-row"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: discount,
    onChange: e => setDiscount(e.target.value.toUpperCase()),
    placeholder: "EJ: BIENVENIDO10"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ck-apply",
    onClick: applyDiscount
  }, "Aplicar")), discountApplied && /*#__PURE__*/React.createElement("span", {
    className: "ck-discount__ok"
  }, "\u2713 ", discountApplied.code, " \xB7 \u2212", discountApplied.percent, "%"), discountErr && /*#__PURE__*/React.createElement("span", {
    className: "ck-discount__err"
  }, discountErr))), /*#__PURE__*/React.createElement("label", {
    className: "ck-check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: terms,
    onChange: e => setTerms(e.target.checked)
  }), /*#__PURE__*/React.createElement("span", null, "Acepto los ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "t\xE9rminos"), " y la ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "pol\xEDtica de privacidad"), ".")), /*#__PURE__*/React.createElement("div", {
    className: "ck-trust"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ck-trust__i"
  }, "\u25AA"), /*#__PURE__*/React.createElement("span", null, ck.trustTxt || 'Serás redirigido a MercadoPago · Pago cifrado SSL · Protocolo 1×1 se activa al confirmar')), /*#__PURE__*/React.createElement("div", {
    className: "ck-actions ck-actions--split"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--ghost",
    onClick: onBack,
    disabled: payState === 'processing'
  }, ck.backLabel || '← Volver'), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: 'btn btn--amber ck-pay ck-pay--' + payState,
    disabled: payState === 'processing' || !terms
  }, payState === 'idle' && /*#__PURE__*/React.createElement(React.Fragment, null, "IR A MERCADOPAGO ", /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2192")), payState === 'processing' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "ck-spin"
  }), " Redirigiendo\u2026"))));
}

// ============================================================
// STEP 3 — PAGO
// ============================================================
function StepPay({
  payMethod,
  setPayMethod,
  card,
  setCard,
  cardBrand,
  discount,
  setDiscount,
  discountApplied,
  discountErr,
  applyDiscount,
  terms,
  setTerms,
  total,
  payState,
  onBack,
  onPay,
  cardValid,
  content
}) {
  const ck = content && content.checkout || {};
  function onCardNum(e) {
    const formatted = formatCardNumber(e.target.value, cardBrand);
    setCard({
      ...card,
      num: formatted
    });
  }
  return /*#__PURE__*/React.createElement("form", {
    className: "ck-form",
    onSubmit: onPay
  }, /*#__PURE__*/React.createElement("h2", {
    className: "ck-h"
  }, ck.payTitle || 'Método de pago'), /*#__PURE__*/React.createElement("div", {
    className: "ck-pay-logos",
    "aria-label": "M\xE9todos de pago aceptados"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ck-pay-logo ck-pay-logo--mp"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true",
    style: {
      verticalAlign: 'middle',
      marginRight: 5
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "12"
  })), "mercado pago")), /*#__PURE__*/React.createElement("div", {
    className: "ck-tabs"
  }, PAY_METHODS.map(m => /*#__PURE__*/React.createElement("button", {
    key: m.id,
    type: "button",
    className: 'ck-tab' + (payMethod === m.id ? ' active' : ''),
    onClick: () => setPayMethod(m.id)
  }, m.name))), /*#__PURE__*/React.createElement("p", {
    className: "ck-tab__hint"
  }, PAY_METHODS.find(m => m.id === payMethod)?.hint), payMethod === 'card' && /*#__PURE__*/React.createElement("div", {
    className: "ck-card-form"
  }, /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", null, "N\xDAMERO DE TARJETA"), /*#__PURE__*/React.createElement("div", {
    className: "ck-input-row"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    inputMode: "numeric",
    value: card.num,
    onChange: onCardNum,
    placeholder: "0000 0000 0000 0000",
    autoComplete: "cc-number",
    maxLength: cardBrand === 'amex' ? 17 : 19
  }), /*#__PURE__*/React.createElement(CardBrandMark, {
    brand: cardBrand
  }))), /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", null, "NOMBRE EN LA TARJETA"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: card.name,
    onChange: e => setCard({
      ...card,
      name: e.target.value.toUpperCase()
    }),
    placeholder: "COMO APARECE EN LA TARJETA",
    autoComplete: "cc-name"
  })), /*#__PURE__*/React.createElement("div", {
    className: "ck-grid-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", null, "VENCIMIENTO"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    inputMode: "numeric",
    value: card.exp,
    onChange: e => setCard({
      ...card,
      exp: formatExp(e.target.value)
    }),
    placeholder: "MM/AA",
    maxLength: 5,
    autoComplete: "cc-exp"
  })), /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", null, "CVV"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    inputMode: "numeric",
    value: card.cvv,
    onChange: e => setCard({
      ...card,
      cvv: e.target.value.replace(/\D/g, '').slice(0, cardBrand === 'amex' ? 4 : 3)
    }),
    placeholder: cardBrand === 'amex' ? '4 dígitos' : '3 dígitos',
    autoComplete: "cc-csc"
  })))), payMethod === 'webpay' && /*#__PURE__*/React.createElement("div", {
    className: "ck-alt"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-alt__t"
  }, "Ser\xE1s redirigido a Webpay Transbank."), /*#__PURE__*/React.createElement("div", {
    className: "ck-alt__d"
  }, "Pago seguro \xB7 soporta Visa, Mastercard, Redcompra, d\xE9bito.")), payMethod === 'transfer' && /*#__PURE__*/React.createElement("div", {
    className: "ck-alt"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-alt__t"
  }, "Transferencia electr\xF3nica"), /*#__PURE__*/React.createElement("div", {
    className: "ck-alt__d"
  }, "BancoEstado \xB7 Cuenta Vista 1234567 \xB7 contacto@ruahlabs.cl \u2014 confirmaremos al recibirla.")), /*#__PURE__*/React.createElement("div", {
    className: "ck-discount"
  }, /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", null, "C\xD3DIGO DE DESCUENTO"), /*#__PURE__*/React.createElement("div", {
    className: "ck-input-row"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: discount,
    onChange: e => setDiscount(e.target.value.toUpperCase()),
    placeholder: "EJ: BIENVENIDO10"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ck-apply",
    onClick: applyDiscount
  }, "Aplicar")), discountApplied && /*#__PURE__*/React.createElement("span", {
    className: "ck-discount__ok"
  }, "\u2713 ", discountApplied.code, " \xB7 \u2212", discountApplied.percent, "%"), discountErr && /*#__PURE__*/React.createElement("span", {
    className: "ck-discount__err"
  }, discountErr))), /*#__PURE__*/React.createElement("label", {
    className: "ck-check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: terms,
    onChange: e => setTerms(e.target.checked)
  }), /*#__PURE__*/React.createElement("span", null, "Acepto los ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "t\xE9rminos"), " y la ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "pol\xEDtica de privacidad"), ".")), /*#__PURE__*/React.createElement("div", {
    className: "ck-trust"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ck-trust__i"
  }, "\u25AA"), /*#__PURE__*/React.createElement("span", null, ck.trustTxt || 'Pago cifrado SSL · No guardamos datos de tarjeta · Protocolo 1×1 se activa al confirmar')), /*#__PURE__*/React.createElement("div", {
    className: "ck-actions ck-actions--split"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--ghost",
    onClick: onBack,
    disabled: payState === 'processing'
  }, ck.backLabel || '← Volver'), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: 'btn btn--amber ck-pay ck-pay--' + payState,
    disabled: payState === 'processing' || !terms || payMethod === 'card' && !cardValid
  }, payState === 'idle' && /*#__PURE__*/React.createElement(React.Fragment, null, ck.payCtaLabel || 'Pagar', " CLP $", fmtCLP(total), " ", /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2192")), payState === 'processing' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "ck-spin"
  }), " Procesando\u2026"), payState === 'success' && /*#__PURE__*/React.createElement(React.Fragment, null, "\u2713 Pago confirmado"))));
}

// ============================================================
// CONFIRMACIÓN
// ============================================================
function Confirmation({
  order,
  info,
  total,
  cart,
  onClose,
  content
}) {
  const ck = content && content.checkout || {};
  return /*#__PURE__*/React.createElement("div", {
    className: "ck-confirm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-check-wrap"
  }, /*#__PURE__*/React.createElement("svg", {
    className: "ck-check-svg",
    viewBox: "0 0 64 64",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "32",
    cy: "32",
    r: "30",
    stroke: "currentColor",
    strokeWidth: "2",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18 32 L28 42 L46 22",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("h2", {
    className: "ck-confirm__t"
  }, ck.confirmedTitle || 'PEDIDO CONFIRMADO.'), /*#__PURE__*/React.createElement("p", {
    className: "ck-confirm__sub"
  }, "Gracias, ", /*#__PURE__*/React.createElement("strong", null, info.firstName || 'hermano'), ". El Protocolo 1\xD71 ya est\xE1 activado: una prenda saldr\xE1 a la calle a tu nombre."), /*#__PURE__*/React.createElement("div", {
    className: "ck-confirm__order"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-confirm__row"
  }, /*#__PURE__*/React.createElement("span", null, "N\xB0 ORDEN"), /*#__PURE__*/React.createElement("code", null, order)), /*#__PURE__*/React.createElement("div", {
    className: "ck-confirm__row"
  }, /*#__PURE__*/React.createElement("span", null, "EMAIL"), /*#__PURE__*/React.createElement("code", null, info.email || '—')), /*#__PURE__*/React.createElement("div", {
    className: "ck-confirm__row"
  }, /*#__PURE__*/React.createElement("span", null, "TOTAL PAGADO"), /*#__PURE__*/React.createElement("code", null, "CLP $", fmtCLP(total)))), /*#__PURE__*/React.createElement("div", {
    className: "ck-confirm__items"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-confirm__items__hd"
  }, "PIEZAS EN TU PEDIDO"), (cart || []).map(it => /*#__PURE__*/React.createElement("div", {
    className: "ck-confirm__item",
    key: it.id
  }, /*#__PURE__*/React.createElement("span", null, it.name, it.size ? ' · Talla ' + it.size : '', " ", it.qty > 1 ? '× ' + it.qty : ''), /*#__PURE__*/React.createElement("span", null, "CLP $", fmtCLP(parsePrice(it.price) * (it.qty || 1)))))), /*#__PURE__*/React.createElement("div", {
    className: "ck-confirm__actions"
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn btn--ghost",
    href: '#orden-' + order,
    onClick: onClose
  }, "Seguir mi orden"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--amber",
    onClick: onClose
  }, "Seguir comprando ", /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2192"))), /*#__PURE__*/React.createElement("p", {
    className: "ck-confirm__note"
  }, "Te enviamos a ", /*#__PURE__*/React.createElement("strong", null, info.email), " el resumen y el seguimiento. Cuando salgamos a ruta, recibir\xE1s el registro de entrega (foto al piso, nunca de frente)."));
}

// ============================================================
// SUMMARY (sticky right column)
// ============================================================
function Summary({
  cart,
  setQty,
  removeItem,
  subtotal,
  shipOpt,
  shipFee,
  discountApplied,
  discountAmount,
  total,
  content
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const ck = content && content.checkout || {};
  return /*#__PURE__*/React.createElement("aside", {
    className: 'ck-summary' + (collapsed ? ' collapsed' : '')
  }, /*#__PURE__*/React.createElement("button", {
    className: "ck-summary__toggle",
    type: "button",
    onClick: () => setCollapsed(c => !c),
    "aria-expanded": !collapsed
  }, /*#__PURE__*/React.createElement("span", null, ck.summaryHd || 'RESUMEN DEL PEDIDO'), /*#__PURE__*/React.createElement("span", {
    className: "ck-summary__total-mini"
  }, "CLP $", fmtCLP(total), " ", /*#__PURE__*/React.createElement("span", {
    className: "caret"
  }, collapsed ? '▾' : '▴'))), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__items"
  }, (cart || []).length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__empty"
  }, "CARRITO VAC\xCDO"), (cart || []).map(it => /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__item",
    key: it.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__media"
  }, it.img ? /*#__PURE__*/React.createElement("img", {
    src: it.img,
    alt: it.name
  }) : /*#__PURE__*/React.createElement("span", null, it.name.split(' ').slice(-1)[0].slice(0, 2)), /*#__PURE__*/React.createElement("span", {
    className: "ck-summary__qty"
  }, it.qty || 1)), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__name"
  }, it.name), it.size && /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__size"
  }, "TALLA ", it.size), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__verse"
  }, it.verse || ''), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__qtybar"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setQty(it.uid || it.id, (it.qty || 1) - 1),
    "aria-label": "Menos"
  }, "\u2212"), /*#__PURE__*/React.createElement("span", null, it.qty || 1), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setQty(it.uid || it.id, (it.qty || 1) + 1),
    "aria-label": "M\xE1s"
  }, "+"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ck-summary__rm",
    onClick: () => removeItem(it.uid || it.id),
    "aria-label": "Eliminar"
  }, "\xD7"))), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__price"
  }, "CLP $", fmtCLP(parsePrice(it.price) * (it.qty || 1)))))), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__rows"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__row"
  }, /*#__PURE__*/React.createElement("span", null, "Subtotal"), /*#__PURE__*/React.createElement("span", null, "CLP $", fmtCLP(subtotal))), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__row"
  }, /*#__PURE__*/React.createElement("span", null, "Env\xEDo \xB7 ", shipOpt.name), /*#__PURE__*/React.createElement("span", null, shipFee === 0 ? 'GRATIS' : 'CLP $' + fmtCLP(shipFee))), discountApplied && /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__row ck-summary__row--disc"
  }, /*#__PURE__*/React.createElement("span", null, "Descuento ", discountApplied.code), /*#__PURE__*/React.createElement("span", null, "\u2212 CLP $", fmtCLP(discountAmount))), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__row ck-summary__row--total"
  }, /*#__PURE__*/React.createElement("span", null, "TOTAL"), /*#__PURE__*/React.createElement("span", null, "CLP $", fmtCLP(total)))), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__protocol"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ck-summary__protocol__icon"
  }, "1\xD7"), /*#__PURE__*/React.createElement("span", null, ck.summaryProtocol ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", null, "PROTOCOLO 1\xD71."), " ", ck.summaryProtocol.replace(/^PROTOCOLO 1×1\.?\s*/, '')) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", null, "PROTOCOLO 1\xD71."), " Esta compra dona una prenda filtrada a alguien en situaci\xF3n de calle.")))));
}
Object.assign(window, {
  Checkout
});

/* secret */
/* global React */
// ============================================================
// RUAH LABS — SecretPortal v3
// Triple-click on top logo →
//   (1) 2s STATIC TV NOISE (canvas animado + audio)
//   (2) Video fullscreen muted, pausa en PAUSE_AT_S
//   (3) Login modal (email + password)
//   (4) After login: modal cierra, video reanuda CON sonido
//   (5) When video ends: portal cierra & Club se abre
// ============================================================

const STATIC_MS = 2200; // duración de la estática (ms)
const PAUSE_AT_S = 3.45; // video pausa aquí para el login

function SecretPortal() {
  // phase: 'idle' | 'static' | 'video' | 'login'
  const [phase, setPhase] = React.useState('idle');
  const [email, setEmail] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [shake, setShake] = React.useState(false);
  const [loginErr, setLoginErr] = React.useState('');
  const [loginBusy, setLoginBusy] = React.useState(false);
  const [loginVisible, setLoginVisible] = React.useState(false);
  const [changingPass, setChangingPass] = React.useState(false);
  const [newPass, setNewPass] = React.useState('');
  const [newPass2, setNewPass2] = React.useState('');
  const [changeErr, setChangeErr] = React.useState('');
  const memberRef = React.useRef(null); // { name, email } tras login

  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const timersRef = React.useRef([]);
  const audioCtxRef = React.useRef(null);
  const noiseNodeRef = React.useRef(null);
  const gainNodeRef = React.useRef(null);
  const pauseGuardRef = React.useRef(false);
  const loggedInRef = React.useRef(false);

  // ---- escuchar triple-click en el logo ----
  React.useEffect(() => {
    const onTrigger = () => {
      if (phase !== 'idle') return;
      startSequence();
    };
    window.addEventListener('ruah:triggerSecret', onTrigger);
    return () => window.removeEventListener('ruah:triggerSecret', onTrigger);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ---- ESC para cerrar ----
  React.useEffect(() => {
    if (phase === 'idle') return;
    const onKey = e => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ---- bloquear scroll ----
  React.useEffect(() => {
    document.body.style.overflow = phase === 'idle' ? '' : 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [phase]);
  function clearTimers() {
    timersRef.current.forEach(id => clearTimeout(id));
    timersRef.current = [];
  }

  // ============================================================
  // Canvas TV static
  // ============================================================
  function startCanvasStatic() {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var SW = Math.ceil(window.innerWidth / 3);
    var SH = Math.ceil(window.innerHeight / 3);
    canvas.width = SW;
    canvas.height = SH;
    var imgData = ctx.createImageData(SW, SH);
    var data = imgData.data;
    var scanY = 0;
    function drawFrame() {
      for (var i = 0; i < data.length; i += 4) {
        if (Math.random() < 0.6) {
          var v = Math.random() < 0.08 ? 255 : Math.floor(Math.random() * 200);
          data[i] = data[i + 1] = data[i + 2] = v;
          data[i + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(0, scanY % SH, SW, 2);
      scanY += 3;
      if (Math.random() < 0.04) {
        ctx.fillStyle = 'rgba(236,161,12,0.07)';
        ctx.fillRect(0, 0, SW, SH);
      }
      rafRef.current = requestAnimationFrame(drawFrame);
    }
    drawFrame();
  }
  function stopCanvasStatic() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  // ============================================================
  // Web Audio — ruido de TV
  // ============================================================
  function playStaticNoise(durationMs) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 800;
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 3200;
      bandpass.Q.value = 0.5;
      const gain = ctx.createGain();
      gain.gain.value = 0.0001;
      noise.connect(highpass);
      highpass.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(ctx.destination);
      noiseNodeRef.current = noise;
      gainNodeRef.current = gain;
      const now = ctx.currentTime;
      const dur = durationMs / 1000;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.55, now + 0.04);
      gain.gain.setValueAtTime(0.55, now + Math.max(0.04, dur - 0.12));
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      noise.start(now);
      noise.stop(now + dur + 0.05);
      noise.onended = () => {
        try {
          ctx.close();
        } catch (_) {}
        audioCtxRef.current = null;
      };
    } catch (err) {
      console.warn('Static noise unavailable:', err);
    }
  }
  function stopStaticNoise() {
    try {
      if (gainNodeRef.current && audioCtxRef.current) {
        const now = audioCtxRef.current.currentTime;
        gainNodeRef.current.gain.cancelScheduledValues(now);
        gainNodeRef.current.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      }
      if (noiseNodeRef.current) {
        try {
          noiseNodeRef.current.stop(audioCtxRef.current.currentTime + 0.1);
        } catch (_) {}
      }
    } catch (_) {}
  }

  // ============================================================
  // Secuencia principal
  // ============================================================
  function startSequence() {
    clearTimers();
    loggedInRef.current = false;
    pauseGuardRef.current = false;

    // Fase 1: ESTÁTICA — canvas animado + audio
    setPhase('static');
    playStaticNoise(STATIC_MS);
    requestAnimationFrame(startCanvasStatic);

    // Pre-cargar el video: reintenta hasta que el DOM lo tenga (está oculto durante 'static')
    var armVideo = function () {
      var v = videoRef.current;
      if (!v) {
        timersRef.current.push(setTimeout(armVideo, 20));
        return;
      }
      try {
        v.muted = true;
        v.currentTime = 0;
        v.load();
      } catch (_) {}
    };
    timersRef.current.push(setTimeout(armVideo, 30));

    // Al terminar la estática: corte directo al video
    timersRef.current.push(setTimeout(function () {
      stopCanvasStatic();
      setPhase('video');
      requestAnimationFrame(function () {
        var v = videoRef.current;
        if (!v) return;
        try {
          v.currentTime = 0;
          v.muted = true;
        } catch (_) {}
        var p = v.play();
        if (p && p.catch) p.catch(function () {
          var retry = function () {
            v.play().catch(function () {});
            window.removeEventListener('click', retry);
          };
          window.addEventListener('click', retry, {
            once: true
          });
        });
      });
    }, STATIC_MS));
  }

  // Pausa el video en PAUSE_AT_S → muestra login
  function onVideoTimeUpdate() {
    var v = videoRef.current;
    if (!v) return;
    if (!loggedInRef.current && !pauseGuardRef.current && v.currentTime >= PAUSE_AT_S) {
      pauseGuardRef.current = true;
      try {
        v.pause();
      } catch (_) {}
      timersRef.current.push(setTimeout(function () {
        setPhase('login');
        setTimeout(function () {
          setLoginVisible(true);
        }, 20);
      }, 120));
    }
  }
  function onLoginSubmit(e) {
    e.preventDefault();
    setLoginErr('');
    setLoginBusy(true);
    fetch('' + window.RUAH_API + '/api/club/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: pass
      })
    }).then(function (r) {
      return r.json();
    }).then(function (data) {
      setLoginBusy(false);
      if (data.error) {
        setLoginErr(data.error);
        setShake(true);
        setTimeout(function () {
          setShake(false);
        }, 600);
        return;
      }
      // Login OK
      memberRef.current = {
        name: data.name,
        email: data.email
      };
      try {
        sessionStorage.setItem('ruah-club-auth', '1');
        sessionStorage.setItem('ruah-club-email', data.email);
        sessionStorage.setItem('ruah-club-name', data.name || '');
      } catch (_) {}
      if (data.must_change_password) {
        // Mostrar pantalla de cambio de contraseña antes de entrar
        setChangingPass(true);
        return;
      }

      // Entrar directo
      loggedInRef.current = true;
      setLoginVisible(false);
      setTimeout(function () {
        setPhase('video');
        var v = videoRef.current;
        if (!v) return;
        v.muted = false;
        v.volume = 1.0;
        v.play().catch(function () {});
      }, 350);
    }).catch(function () {
      setLoginBusy(false);
      setLoginErr('Error de conexión con el servidor.');
    });
  }
  function onChangePasswordSubmit(e) {
    e.preventDefault();
    setChangeErr('');
    if (newPass !== newPass2) {
      setChangeErr('Las contraseñas no coinciden');
      return;
    }
    if (newPass.length < 8) {
      setChangeErr('Mínimo 8 caracteres');
      return;
    }
    fetch('' + window.RUAH_API + '/api/club/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        oldPassword: pass,
        newPassword: newPass
      })
    }).then(function (r) {
      return r.json();
    }).then(function (data) {
      if (data.error) {
        setChangeErr(data.error);
        return;
      }
      // Contraseña cambiada → entrar al club
      loggedInRef.current = true;
      setChangingPass(false);
      setLoginVisible(false);
      setTimeout(function () {
        setPhase('video');
        var v = videoRef.current;
        if (!v) return;
        v.muted = false;
        v.volume = 1.0;
        v.play().catch(function () {});
      }, 350);
    }).catch(function () {
      setChangeErr('Error de conexión.');
    });
  }
  function onVideoEnded() {
    close({
      openClub: true
    });
  }
  function close(opts) {
    clearTimers();
    stopStaticNoise();
    stopCanvasStatic();
    var v = videoRef.current;
    if (v) {
      try {
        v.pause();
      } catch (_) {}
    }
    setPhase('idle');
    setLoginVisible(false);
    setEmail('');
    setPass('');
    if (opts && opts.openClub) {
      window.dispatchEvent(new CustomEvent('ruah:openClub'));
    }
  }
  if (phase === 'idle') return null;
  return /*#__PURE__*/React.createElement("div", {
    className: 'sp3 sp3-phase-' + phase
  }, phase === 'static' && /*#__PURE__*/React.createElement("div", {
    className: "sp3-static",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: canvasRef,
    className: "sp3-static__canvas"
  }), /*#__PURE__*/React.createElement("div", {
    className: "sp3-static__dot"
  })), (phase === 'static' || phase === 'video' || phase === 'login') && /*#__PURE__*/React.createElement("div", {
    className: "sp3-video-wrap",
    style: phase === 'static' ? {
      opacity: 0,
      pointerEvents: 'none',
      position: 'absolute'
    } : null,
    "aria-hidden": phase !== 'video' ? 'true' : 'false'
  }, /*#__PURE__*/React.createElement("video", {
    ref: videoRef,
    className: "sp3-video",
    src: "https://res.cloudinary.com/dh05zwrbp/video/upload/v1781323740/ruahlabs/cpisuznmsbjdlhlh5u7g.mp4",
    playsInline: true,
    preload: "auto",
    onTimeUpdate: onVideoTimeUpdate,
    onEnded: onVideoEnded,
    onClick: function (e) {
      var v = e.currentTarget;
      if (v.paused && phase === 'video' && loggedInRef.current) v.play().catch(function () {});
    }
  }), phase === 'video' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "sp3-hud"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sp3-hud__rec"
  }), /*#__PURE__*/React.createElement("span", null, "REC \xB7 TRANSMISI\xD3N PRIVADA \xB7 RUAH LABS")), /*#__PURE__*/React.createElement("button", {
    className: "sp3-close",
    onClick: function () {
      close();
    },
    "aria-label": "Cerrar"
  }, "\xD7"))), phase === 'login' && /*#__PURE__*/React.createElement("div", {
    className: 'sp3-login-wrap' + (loginVisible ? ' visible' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: "sp3-login-bg",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("button", {
    className: "sp3-close sp3-close--login",
    onClick: function () {
      close();
    },
    "aria-label": "Cerrar"
  }, "\xD7"), !changingPass ? /*#__PURE__*/React.createElement("form", {
    className: 'sp3-login' + (shake ? ' shake' : ''),
    onSubmit: onLoginSubmit
  }, /*#__PURE__*/React.createElement("div", {
    className: "sp3-login__head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sp3-login__brand"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sp3-login__brandDot"
  }), /*#__PURE__*/React.createElement("span", null, "RUAH\xA0LABS \xB7 CLUB")), /*#__PURE__*/React.createElement("div", {
    className: "sp3-login__tag"
  }, "\xA7 ACCESO PRIVADO"), /*#__PURE__*/React.createElement("h2", {
    className: "sp3-login__title"
  }, "BIENVENIDO", /*#__PURE__*/React.createElement("br", null), "AL MOVIMIENTO."), /*#__PURE__*/React.createElement("p", {
    className: "sp3-login__sub"
  }, "Identif\xEDcate para entrar al protocolo.", /*#__PURE__*/React.createElement("br", null), "Tus credenciales llegaron a tu correo.")), /*#__PURE__*/React.createElement("label", {
    className: "sp3-field"
  }, /*#__PURE__*/React.createElement("span", null, "EMAIL"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    required: true,
    value: email,
    onChange: function (e) {
      setEmail(e.target.value);
      setLoginErr('');
    },
    placeholder: "tu@correo.cl",
    autoFocus: true,
    autoComplete: "email"
  })), /*#__PURE__*/React.createElement("label", {
    className: "sp3-field"
  }, /*#__PURE__*/React.createElement("span", null, "CONTRASE\xD1A"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    required: true,
    value: pass,
    onChange: function (e) {
      setPass(e.target.value);
      setLoginErr('');
    },
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    autoComplete: "current-password"
  })), loginErr && /*#__PURE__*/React.createElement("p", {
    className: "sp3-login__err"
  }, loginErr), /*#__PURE__*/React.createElement("button", {
    className: "sp3-submit",
    type: "submit",
    disabled: loginBusy
  }, loginBusy ? 'VERIFICANDO…' : 'ENTRAR AL CLUB', !loginBusy && /*#__PURE__*/React.createElement("span", {
    className: "sp3-submit__arr"
  }, "\u2192")), /*#__PURE__*/React.createElement("p", {
    className: "sp3-foot"
  }, "SOMOS M\xC1S DE LOS QUE CREES.", /*#__PURE__*/React.createElement("small", null, "ESC o \xD7 para salir"))) : /*#__PURE__*/React.createElement("form", {
    className: "sp3-login",
    onSubmit: onChangePasswordSubmit
  }, /*#__PURE__*/React.createElement("div", {
    className: "sp3-login__head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sp3-login__brand"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sp3-login__brandDot"
  }), /*#__PURE__*/React.createElement("span", null, "RUAH\xA0LABS \xB7 CLUB")), /*#__PURE__*/React.createElement("div", {
    className: "sp3-login__tag"
  }, "\xA7 PRIMER ACCESO"), /*#__PURE__*/React.createElement("h2", {
    className: "sp3-login__title"
  }, "ELIGE TU", /*#__PURE__*/React.createElement("br", null), "CONTRASE\xD1A."), /*#__PURE__*/React.createElement("p", {
    className: "sp3-login__sub"
  }, "Por seguridad, debes cambiar tu contrase\xF1a inicial", /*#__PURE__*/React.createElement("br", null), "antes de entrar al club.")), /*#__PURE__*/React.createElement("label", {
    className: "sp3-field"
  }, /*#__PURE__*/React.createElement("span", null, "NUEVA CONTRASE\xD1A"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    required: true,
    minLength: 8,
    value: newPass,
    onChange: function (e) {
      setNewPass(e.target.value);
      setChangeErr('');
    },
    placeholder: "M\xEDnimo 8 caracteres",
    autoFocus: true
  })), /*#__PURE__*/React.createElement("label", {
    className: "sp3-field"
  }, /*#__PURE__*/React.createElement("span", null, "CONFIRMAR CONTRASE\xD1A"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    required: true,
    minLength: 8,
    value: newPass2,
    onChange: function (e) {
      setNewPass2(e.target.value);
      setChangeErr('');
    },
    placeholder: "Repite la contrase\xF1a"
  })), changeErr && /*#__PURE__*/React.createElement("p", {
    className: "sp3-login__err"
  }, changeErr), /*#__PURE__*/React.createElement("button", {
    className: "sp3-submit",
    type: "submit"
  }, "GUARDAR Y ENTRAR", /*#__PURE__*/React.createElement("span", {
    className: "sp3-submit__arr"
  }, "\u2192")))));
}
Object.assign(window, {
  SecretPortal
});

/* app */
/* global React, ReactDOM */
// ============================================================
// RUAH LABS — App root
// ============================================================

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false
    };
  }
  static getDerivedStateFromError() {
    return {
      error: true
    };
  }
  componentDidCatch(err, info) {
    console.error('[RUAH] Error en componente:', err, info && info.componentStack);
  }
  render() {
    if (this.state.error) return this.props.fallback || null;
    return this.props.children;
  }
}
function App() {
  const store = useContentStore();
  const {
    content
  } = store;
  const [adminOpen, setAdminOpen] = React.useState(false);
  const [clubOpen, setClubOpen] = React.useState(false);
  const [productId, setProductId] = React.useState(null);
  const [productOverrideImg, setProductOverrideImg] = React.useState(null);
  const [cuadroId, setCuadroId] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  // Page navigation: null = home, or section key ('nosotros','servicios','productos','cuadros','iglesias','evento','protocolo','comunidad')
  const [activePage, setActivePage] = React.useState(() => {
    try {
      return sessionStorage.getItem('ruah-page') || null;
    } catch (_) {
      return null;
    }
  });
  const [pageCategory, setPageCategory] = React.useState('todo');

  // -------- Cart + checkout --------
  const [cart, setCart] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ruah-cart') || '[]');
    } catch (_) {
      return [];
    }
  });
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  function addToCart(productId, qty = 1, size = null) {
    const product = content.products.items.find(p => p.id === productId) || (content.cuadros && content.cuadros.products ? content.cuadros.products.find(p => p.id === productId) : null);
    if (!product) return;
    const uid = productId + (size ? ':' + size : '');
    setCart(prev => {
      const existing = prev.find(it => (it.uid || it.id) === uid);
      if (existing) return prev.map(it => (it.uid || it.id) === uid ? {
        ...it,
        qty: (it.qty || 1) + qty
      } : it);
      return [...prev, {
        uid,
        id: product.id,
        name: product.name,
        verse: product.verse,
        price: product.price,
        img: product.img,
        material: product.material || '',
        estampado: product.estampado || '',
        fit: product.fit || '',
        tallas: product.tallas || '',
        origen: product.origen || '',
        size: size || null,
        qty
      }];
    });
    // Decrement limited stock
    if (product.stockType === 'limitado' && (product.stockActual == null ? product.stockTotal : product.stockActual) > 0) {
      store.updateList('products.items', list => list.map(p => {
        if (p.id !== productId) return p;
        const cur = p.stockActual != null ? p.stockActual : p.stockTotal || 0;
        return {
          ...p,
          stockActual: Math.max(0, cur - qty)
        };
      }));
    }
    setToast({
      msg: '✓ ' + product.name.toUpperCase() + (size ? ' · TALLA ' + size : '') + ' AÑADIDO AL CARRITO'
    });
    setTimeout(() => setToast(null), 2400);
  }
  function buyNow(productId, size) {
    addToCart(productId, 1, size);
    setProductId(null);
    setTimeout(() => setCheckoutOpen(true), 80);
  }
  function openCheckout() {
    setCheckoutOpen(true);
  }

  // Konami-like shortcut: Ctrl+Shift+A toggles admin, +C toggles club
  React.useEffect(() => {
    const onKey = e => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setAdminOpen(o => !o);
      }
      if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        setClubOpen(o => !o);
      }
      if (e.key === 'Escape') {
        setAdminOpen(false);
        setClubOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Open Club after the secret-portal login flow
  React.useEffect(() => {
    const onOpen = () => setClubOpen(true);
    window.addEventListener('ruah:openClub', onOpen);
    return () => window.removeEventListener('ruah:openClub', onOpen);
  }, []);

  // Navigate to a page from any component
  React.useEffect(() => {
    const onNav = e => {
      if (e.detail && e.detail.page) openPage(e.detail.page, e.detail.category || null);
    };
    window.addEventListener('ruah:navigateTo', onNav);
    return () => window.removeEventListener('ruah:navigateTo', onNav);
  }, []);

  // -------- URL slugs de producto (/producto/<slug>) --------
  // Abre el producto según la URL: carga directa + botones atrás/adelante.
  React.useEffect(() => {
    function syncFromPath() {
      const m = window.location.pathname.match(/^\/producto\/([^/?#]+)/);
      if (m) {
        const slug = decodeURIComponent(m[1]);
        const prod = (content.products.items || []).find(p => window.slugify(p.name) === slug);
        setProductId(prod ? prod.id : null);
      } else {
        setProductId(null);
      }
    }
    syncFromPath();
    window.addEventListener('popstate', syncFromPath);
    return () => window.removeEventListener('popstate', syncFromPath);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reintenta abrir el deep-link cuando el contenido llega desde Supabase.
  React.useEffect(() => {
    const m = window.location.pathname.match(/^\/producto\/([^/?#]+)/);
    if (!m || productId) return;
    const slug = decodeURIComponent(m[1]);
    const prod = (content.products.items || []).find(p => window.slugify(p.name) === slug);
    if (prod) setProductId(prod.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.products.items]);

  // Refleja en la URL el producto abierto (sin entradas duplicadas en el historial).
  React.useEffect(() => {
    const onProductPath = /^\/producto\//.test(window.location.pathname);
    if (productId == null) {
      if (onProductPath) window.history.pushState({}, '', '/');
      return;
    }
    const prod = (content.products.items || []).find(p => p.id === productId);
    if (!prod) return;
    const url = '/producto/' + window.slugify(prod.name);
    if (window.location.pathname !== url) window.history.pushState({
      productId
    }, '', url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // Persistir carrito en localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('ruah-cart', JSON.stringify(cart));
    } catch (_) {}
  }, [cart]);

  // Global checkout events (from buttons elsewhere, e.g. nav cart)
  React.useEffect(() => {
    const onCk = () => setCheckoutOpen(true);
    const onAdd = e => addToCart(e.detail.productId, e.detail.qty || 1);
    const onBuyNow = e => buyNow(e.detail.productId);
    window.addEventListener('ruah:openCheckout', onCk);
    window.addEventListener('ruah:addToCart', onAdd);
    window.addEventListener('ruah:buyNow', onBuyNow);
    return () => {
      window.removeEventListener('ruah:openCheckout', onCk);
      window.removeEventListener('ruah:addToCart', onAdd);
      window.removeEventListener('ruah:buyNow', onBuyNow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  // Detectar retorno de Mercado Pago
  React.useEffect(() => {
    var params = new URLSearchParams(window.location.search);
    var payStatus = params.get('payment');
    if (!payStatus) return;

    // Limpiar URL sin recargar
    window.history.replaceState({}, '', window.location.pathname);
    if (payStatus === 'success') {
      // Recuperar datos del comprador
      var orderRaw = sessionStorage.getItem('ruah-pending-order');
      if (orderRaw) {
        try {
          var order = JSON.parse(orderRaw);
          sessionStorage.removeItem('ruah-pending-order');
          // payment_id lo agrega MercadoPago al redirigir (auto_return solo
          // ocurre con pago aprobado). El servidor lo verifica contra MP.
          order.payment_id = params.get('payment_id') || params.get('collection_id') || '';
          // Limpiar carrito — pago completado
          setCart([]);
          try {
            localStorage.removeItem('ruah-cart');
          } catch (_) {}
          // Llamar API para crear cuenta club + enviar email
          fetch('' + window.RUAH_API + '/api/checkout/welcome', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
          }).catch(function () {});
        } catch (_) {}
      }
      setToast({
        msg: '✓ PAGO CONFIRMADO — REVISA TU CORREO, YA ERES PARTE DEL CLUB',
        dur: 8000
      });
      setTimeout(function () {
        setToast(null);
      }, 8000);
    } else if (payStatus === 'failure') {
      setToast({
        msg: '✗ EL PAGO NO FUE PROCESADO — INTENTA NUEVAMENTE'
      });
      setTimeout(function () {
        setToast(null);
      }, 5000);
    }
  }, []);
  const cartCount = cart.reduce((s, it) => s + (it.qty || 1), 0);

  // Page titles map
  const PAGE_TITLES = {
    nosotros: 'QUIÉNES SOMOS',
    servicios: 'SERVICIOS',
    productos: 'PRODUCTOS',
    cuadros: 'CUADROS',
    iglesias: 'IGLESIAS',
    evento: 'EVENTO',
    protocolo: 'PROTOCOLO',
    comunidad: 'COMUNIDAD',
    envios: 'ENVÍOS Y DEVOLUCIONES'
  };
  React.useEffect(() => {
    try {
      if (activePage) sessionStorage.setItem('ruah-page', activePage);else sessionStorage.removeItem('ruah-page');
    } catch (_) {}
  }, [activePage]);
  function openPage(page, cat) {
    setActivePage(page);
    if (cat) setPageCategory(cat);
    window.history.pushState({
      ruahPage: page,
      ruahCat: cat || null
    }, '', window.location.pathname);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  function goHome() {
    setActivePage(null);
    window.history.pushState({
      ruahPage: null
    }, '', '/');
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Back-button support for section pages
  React.useEffect(() => {
    function onPop(e) {
      if (/^\/producto\//.test(window.location.pathname)) return; // handled by product effect
      const state = e.state;
      if (state && state.ruahPage) {
        setActivePage(state.ruahPage);
        if (state.ruahCat) setPageCategory(state.ruahCat);
      } else {
        setActivePage(null);
      }
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  function renderPage() {
    switch (activePage) {
      case 'nosotros':
        return /*#__PURE__*/React.createElement(PageView, {
          title: "QUI\xC9NES SOMOS",
          onBack: goHome
        }, /*#__PURE__*/React.createElement(About, {
          content: content
        }));
      case 'servicios':
        return /*#__PURE__*/React.createElement(PageView, {
          title: "SERVICIOS",
          onBack: goHome
        }, /*#__PURE__*/React.createElement(Services, {
          content: content
        }));
      case 'productos':
        return /*#__PURE__*/React.createElement(PageView, {
          title: "PRODUCTOS",
          onBack: goHome
        }, /*#__PURE__*/React.createElement(Products, {
          key: pageCategory,
          content: content,
          onOpenProduct: id => setProductId(id),
          initialCategory: pageCategory
        }));
      case 'cuadros':
        return /*#__PURE__*/React.createElement(PageView, {
          title: "CUADROS",
          onBack: goHome
        }, /*#__PURE__*/React.createElement(Cuadros, {
          content: content,
          onAddToCart: addToCart,
          onBuyNow: buyNow,
          onOpenCuadro: id => setCuadroId(id)
        }));
      case 'iglesias':
        return /*#__PURE__*/React.createElement(PageView, {
          title: "IGLESIAS",
          onBack: goHome
        }, /*#__PURE__*/React.createElement(Iglesias, {
          content: content
        }));
      case 'evento':
        return /*#__PURE__*/React.createElement(PageView, {
          title: "EVENTO",
          onBack: goHome
        }, /*#__PURE__*/React.createElement(Eventos, {
          content: content
        }));
      case 'protocolo':
        return /*#__PURE__*/React.createElement(PageView, {
          title: "PROTOCOLO 1\xD71",
          onBack: goHome
        }, /*#__PURE__*/React.createElement(Protocol, {
          content: content
        }));
      case 'comunidad':
        return /*#__PURE__*/React.createElement(PageView, {
          title: "COMUNIDAD",
          onBack: goHome
        }, /*#__PURE__*/React.createElement(Testimonials, {
          content: content
        }), /*#__PURE__*/React.createElement(CTABlock, {
          content: content
        }));
      case 'envios':
        return /*#__PURE__*/React.createElement(PageView, {
          title: "ENV\xCDOS Y DEVOLUCIONES",
          onBack: goHome
        }, /*#__PURE__*/React.createElement(Envios, {
          content: content
        }));
      case 'design':
        return /*#__PURE__*/React.createElement(PageView, {
          title: "PERSONALIZADO",
          onBack: goHome
        }, /*#__PURE__*/React.createElement(DesignGallery, {
          content: content
        }));
      default:
        return null;
    }
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Nav, {
    content: content,
    onOpenAdmin: () => setAdminOpen(true),
    cartCount: cartCount,
    onOpenCheckout: openCheckout,
    activePage: activePage,
    onNavigate: openPage,
    onGoHome: goHome
  }), /*#__PURE__*/React.createElement(ErrorBoundary, {
    fallback: /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '60px 24px',
        color: '#eca10c',
        fontFamily: 'monospace',
        fontSize: '12px',
        letterSpacing: '2px',
        textAlign: 'center'
      }
    }, "ERROR AL CARGAR SECCI\xD3N \u2014 RECARGA LA P\xC1GINA")
  }, /*#__PURE__*/React.createElement("main", null, activePage ? renderPage() : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Hero, {
    content: content
  }), /*#__PURE__*/React.createElement(HomeIntro, {
    content: content
  }), /*#__PURE__*/React.createElement(FeaturedDuo, {
    content: content,
    onOpenProduct: id => setProductId(id)
  }), /*#__PURE__*/React.createElement(Protocol, {
    content: content
  }), /*#__PURE__*/React.createElement(HomeCategoryCarousel, {
    content: content,
    onOpenProduct: id => setProductId(id)
  }), /*#__PURE__*/React.createElement(Testimonials, {
    content: content
  }), /*#__PURE__*/React.createElement(CTABlock, {
    content: content
  })))), /*#__PURE__*/React.createElement(Footer, {
    content: content,
    onOpenAdmin: () => setAdminOpen(true),
    onNavigate: openPage
  }), /*#__PURE__*/React.createElement(Admin, {
    open: adminOpen,
    content: content,
    store: store,
    onClose: () => setAdminOpen(false)
  }), /*#__PURE__*/React.createElement(Club, {
    open: clubOpen,
    content: content,
    store: store,
    onClose: () => setClubOpen(false)
  }), /*#__PURE__*/React.createElement(ProductDetail, {
    productId: productId,
    content: content,
    onClose: () => {
      setProductId(null);
      setProductOverrideImg(null);
    },
    onBuyNow: buyNow,
    onAddToCart: addToCart,
    overrideImg: productOverrideImg
  }), /*#__PURE__*/React.createElement(CuadroProductModal, {
    productId: cuadroId,
    cuadros: content.cuadros,
    onClose: () => setCuadroId(null),
    onAddToCart: addToCart,
    onBuyNow: id => {
      setCuadroId(null);
      buyNow(id, null);
    }
  }), /*#__PURE__*/React.createElement(Checkout, {
    open: checkoutOpen,
    cart: cart,
    content: content,
    onClose: () => setCheckoutOpen(false),
    onUpdateCart: setCart
  }), /*#__PURE__*/React.createElement(SecretPortal, null), toast && /*#__PURE__*/React.createElement("div", {
    className: "toast show"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), /*#__PURE__*/React.createElement("span", null, toast.msg)), content.launch && content.launch.active && /*#__PURE__*/React.createElement(LaunchScreen, {
    imageMobile: content.launch.imageMobile,
    imageDesktop: content.launch.imageDesktop
  }), /*#__PURE__*/React.createElement(WhatsAppFab, {
    isDesign: activePage === 'design'
  }), /*#__PURE__*/React.createElement(EmailPopup, null));
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(/*#__PURE__*/React.createElement(App, null));