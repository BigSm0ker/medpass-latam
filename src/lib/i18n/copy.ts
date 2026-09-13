/**
 * Every user-facing string in the product, in both languages.
 *
 * A nested object rather than a `t("some.key")` lookup: TypeScript then catches
 * a typo or a missing translation at build time, instead of shipping a blank
 * label to a patient. Interpolation is a plain function per string, so the call
 * site reads like what it renders.
 *
 * Server-returned API errors are deliberately not here. Translating them would
 * mean threading a language through every route — touching the authorization and
 * payment paths to change wording, which is a bad trade.
 */

export const LANGUAGES = ["es", "en"] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_NAMES: Record<Language, string> = {
  es: "Español",
  en: "English",
};

export type Copy = (typeof COPY)["es"];

export const COPY = {
  es: {
    brand: "MedPass LATAM",
    prototypeNotice: "Prototipo de hackathon — no apto para uso clínico",
    signOut: "Cerrar sesión",
    footerShort:
      "Todos los registros son ficticios. Este prototipo no es para uso clínico.",
    footerLong:
      "Todos los registros son ficticios. Este prototipo no es para uso clínico y no hace ninguna afirmación médica.",
    languageLabel: "Idioma",

    signIn: {
      withPollar: "Iniciar sesión con Pollar",
      waitingWallet: "Esperando tu billetera…",
      confirmIdentity: "Confirmar que eres tú",
      confirmingSession: "Confirmando tu sesión…",
      signatureNote:
        "Firmar demuestra que controlas esta billetera. No autoriza ningún pago ni mueve fondos.",
    },

    landing: {
      eyebrow: "Pagos de salud con consentimiento",
      headline:
        "Paga la consulta en segundos. Comparte solo lo que el médico necesita.",
      lede: "En América Latina, muchas consultas todavía se cobran en efectivo: la clínica no tiene datáfono, o quien paga es un familiar en otro país. MedPass convierte esa visita en un solo código QR — el paciente aprueba exactamente qué datos de salud puede ver el proveedor, y paga en USDC a través de Pollar.",
      providerCta: "Soy proveedor — crear un cobro",
      patientCta: "Soy paciente — mi pasaporte",
      howTo:
        "Inicia sesión con un correo o una cuenta de Google; Pollar crea la billetera por ti. Para ver el flujo completo, abre la página del proveedor en un dispositivo y escanea su QR con otro.",
      steps: [
        {
          title: "La clínica crea un cobro",
          body: "Un monto, un motivo, y solo el contexto de salud que esta visita realmente necesita.",
        },
        {
          title: "El paciente escanea un código",
          body: "El código lleva solo una referencia aleatoria — sin datos médicos, sin identidad, nada que filtrar.",
        },
        {
          title: "El paciente decide qué compartir",
          body: "Aprueba algunos elementos, rechaza otros. El acceso expira y puede retirarse en cualquier momento.",
        },
        {
          title: "El pago se liquida en USDC",
          body: "A través de Pollar, en segundos, desde cualquier lugar — con un recibo que cualquiera puede verificar on-chain.",
        },
      ],
      whyTitle: "Por qué la capa de consentimiento le importa al pago",
      whyBody:
        "Un proveedor que puede ver las alergias y los medicamentos actuales de un paciente antes de atenderlo es un proveedor que vale la pena pagar. Pero entregar todo un historial médico para saldar una cuenta es un mal trato. MedPass hace que la divulgación sea tan pequeña como la visita lo requiere: el proveedor pide elementos específicos, el paciente concede un subconjunto, y el acceso expira solo. Los datos de salud nunca tocan la blockchain — solo el pago lo hace.",
      realTitle: "Qué es real y qué no lo es",
      realBody:
        "El pago es real: el USDC se mueve en Stellar a través de Pollar, y cada recibo enlaza a un explorador público para que lo verifiques tú mismo. Los registros médicos son enteramente ficticios. Este es un prototipo construido para el Pollar Bounty en el Buildathon Cochabamba 2026 — no es un sistema clínico y no hace ninguna afirmación médica.",
      sourceLink: "Código fuente y notas de ingeniería",
    },

    passport: {
      title: "Pasaporte médico",
      privateTitle: "Tu pasaporte es privado",
      privateBody:
        "Inicia sesión con tu billetera y luego firma un mensaje único para que este servidor confirme que la billetera es tuya. La firma no autoriza ningún pago ni mueve fondos.",
      waitingSignature: "Esperando la firma de tu billetera…",
      loading: "Cargando tu pasaporte…",
      tryAgain: "Intentar de nuevo",
      signedInAs: "Sesión iniciada como",
      lastSaved: (when: string) => `Guardado por última vez ${when}`,
      notSavedYet: "Aún no se ha guardado — complétalo para crear tu pasaporte.",
      couldNotLoad: "No se pudo cargar tu pasaporte.",
    },

    passportForm: {
      bloodType: "Tipo de sangre",
      allergies: "Alergias críticas",
      allergiesHint: "Una por línea, ej. Penicilina",
      medications: "Medicamentos actuales",
      medicationsHint: "Uno por línea, con la dosis si la conoces",
      conditions: "Condiciones relevantes",
      conditionsHint: "Una por línea",
      emergencyContact: "Contacto de emergencia",
      name: "Nombre",
      phone: "Teléfono",
      notes: "Notas",
      save: "Guardar pasaporte",
      saving: "Guardando…",
      saved: "Pasaporte guardado.",
      couldNotSave: "No se pudo guardar.",
      couldNotSavePassport: "No se pudo guardar tu pasaporte.",
    },

    charge: {
      role: "Proveedor",
      signInTitle: "Inicio de sesión del proveedor",
      signInPurpose:
        "Inicia sesión para que los pacientes vean quién pregunta, y para que el pago llegue a tu billetera.",
      newCharge: "Nuevo cobro",
      clinic: "Clínica o profesional",
      amount: "Monto (USDC)",
      reason: "Motivo",
      defaultClinic: "Clínica San Martín",
      defaultReason: "Consulta general",
      fieldsLegend: "Información que necesitas del paciente",
      fieldsHint:
        "Pide lo mínimo. El paciente aprueba cada elemento por separado y puede aprobar menos de lo que pediste.",
      create: "Crear cobro y mostrar QR",
      creating: "Creando…",
      couldNotCreate: "No se pudo crear el cobro.",
      showPatientTitle: "Muéstrale esto al paciente",
      showPatientBody:
        "El código lleva solo una referencia aleatoria. No contiene información médica ni la identidad del paciente.",
      orOpenLink: "O abre este enlace",
      waitingPatient: "Esperando la respuesta del paciente…",
      authorizedTitle: "Información autorizada",
      approvedOf: (a: number, b: number) => `${a} de ${b} aprobados`,
      accessExpires: (time: string) => `El acceso expira a las ${time}`,
      paymentLabel: "Pago:",
      awaitingPatient: "esperando al paciente",
      viewTx: "Ver la transacción",
      historyTitle: "Historial de cobros",
      historyEmptyBadge: "Todavía no hay cobros",
      historyRecent: (n: number) => `${n} más recientes`,
      historyBody:
        "Cada cobro que has creado, con lo que el paciente aprobó y un enlace verificable al pago on-chain cuando existe.",
      historyEmpty: "Crea tu primer cobro arriba para verlo aparecer aquí.",
      fieldsApproved: (a: number, b: number) => `${a} de ${b} campos aprobados`,
      consultation: "Consulta",
      viewTxShort: "Ver transacción",
    },

    consent: {
      eyebrow: "Solicitud de consulta",
      aProvider: "Un proveedor",
      loading: "Cargando esta solicitud…",
      notFound: "No se encontró esta solicitud. Pide al proveedor un nuevo código.",
      expired: "Esta solicitud expiró. Pide al proveedor un nuevo código.",
      declined: "Rechazaste esta solicitud. No se compartió nada.",
      askingTitle: "Qué están pidiendo ver",
      askingBody:
        "Todavía no se ha compartido nada. Desmarca lo que prefieras mantener privado — puedes aprobar menos elementos de los que te pidieron.",
      accessNote: "El acceso dura 30 minutos y puedes retirarlo en cualquier momento.",
      signInPurpose: "Inicia sesión para aprobar esta solicitud y pagar.",
      shareAndContinue: (n: number) => `Compartir ${n} y continuar`,
      sharing: "Compartiendo…",
      decline: "Rechazar",
      couldNotRecord: "No se pudo registrar tu decisión.",
      payTitle: "Pagar la consulta",
      payBody: "Tu información ahora es visible para el proveedor durante 30 minutos.",
      pay: (amount: string) => `Pagar ${amount} USDC`,
      couldNotPrepare: "No se pudo preparar el pago.",
      usdcUnavailable: "USDC no está disponible todavía en esta billetera.",
      paymentFailed: "El pago falló.",
      submitted: "Pago enviado",
      complete: "Pago completado",
      submittedBody: "La red lo aceptó y aún se está confirmando.",
      completeBody: "El proveedor recibió tu pago.",
      verifyTx: "Verificar esta transacción",
    },

    fields: {
      blood_type: "Tipo de sangre",
      allergies: "Alergias críticas",
      medications: "Medicamentos actuales",
      conditions: "Condiciones relevantes",
      emergency_contact: "Contacto de emergencia",
    },

    disclosed: {
      bloodType: "Tipo de sangre",
      allergies: "Alergias críticas",
      medications: "Medicamentos",
      conditions: "Condiciones",
      emergencyContact: "Contacto de emergencia",
    },

    encounterStatus: {
      requested: "Esperando al paciente",
      consented: "Aprobado, falta el pago",
      rejected: "Rechazado",
      paid: "Pagado",
      revoked: "Acceso revocado",
    },

    paymentStatus: {
      pending: "confirmando en la red",
      success: "completado",
      error: "falló",
    },

    session: {
      couldNotStart: "No se pudo iniciar el proceso de acceso.",
      walletDidNotSign: "Tu billetera no firmó la solicitud.",
      couldNotVerify: "No se pudo verificar el inicio de sesión.",
      failed: "Falló el inicio de sesión.",
    },
  },

  en: {
    brand: "MedPass LATAM",
    prototypeNotice: "Hackathon prototype — not for clinical use",
    signOut: "Sign out",
    footerShort: "All records are fictitious. This prototype is not for clinical use.",
    footerLong:
      "All records are fictitious. This prototype is not for clinical use and makes no medical claims.",
    languageLabel: "Language",

    signIn: {
      withPollar: "Sign in with Pollar",
      waitingWallet: "Waiting for your wallet…",
      confirmIdentity: "Confirm it's you",
      confirmingSession: "Confirming your session…",
      signatureNote:
        "Signing proves you control this wallet. It authorizes no payment and moves no funds.",
    },

    landing: {
      eyebrow: "Health payments with consent",
      headline: "Pay the clinic in seconds. Share only what the doctor needs.",
      lede: "Across Latin America, plenty of consultations are still settled in cash: the clinic has no card terminal, or the person paying is a relative in another country. MedPass turns that visit into one QR code — the patient approves exactly which health details the provider may see, and pays in USDC through Pollar.",
      providerCta: "I'm a provider — create a charge",
      patientCta: "I'm a patient — my passport",
      howTo:
        "Sign in with an email or Google account; Pollar creates the wallet for you. To see the whole flow, open the provider page on one device and scan its QR with another.",
      steps: [
        {
          title: "The clinic creates a charge",
          body: "An amount, a reason, and only the health context this visit actually needs.",
        },
        {
          title: "The patient scans one code",
          body: "The code carries a random reference — no medical data, no identity, nothing to leak.",
        },
        {
          title: "The patient decides what to share",
          body: "Approve some items, refuse others. Access expires, and can be withdrawn at any time.",
        },
        {
          title: "Payment settles in USDC",
          body: "Through Pollar, in seconds, from anywhere — with a receipt anyone can verify on-chain.",
        },
      ],
      whyTitle: "Why the consent layer matters to the payment",
      whyBody:
        "A provider who can see a patient's allergies and current medications before treating them is a provider worth paying. But handing over a whole medical history to settle a bill is a bad trade. MedPass makes the disclosure as small as the visit requires: the provider asks for specific items, the patient grants a subset, and access expires on its own. Health data never touches the blockchain — only the payment does.",
      realTitle: "What is real, and what is not",
      realBody:
        "The payment is real: USDC moves on Stellar through Pollar, and every receipt links to a public explorer so you can check it yourself. The medical records are entirely fictitious. This is a prototype built for the Pollar Bounty at Buildathon Cochabamba 2026 — it is not a clinical system and makes no medical claims.",
      sourceLink: "Source code and engineering notes",
    },

    passport: {
      title: "Medical passport",
      privateTitle: "Your passport is private",
      privateBody:
        "Sign in with your wallet, then sign a one-time message so this server can confirm the wallet is yours. The signature authorizes no payment and moves no funds.",
      waitingSignature: "Waiting for your wallet signature…",
      loading: "Loading your passport…",
      tryAgain: "Try again",
      signedInAs: "Signed in as",
      lastSaved: (when: string) => `Last saved ${when}`,
      notSavedYet: "Not saved yet — fill this in to create your passport.",
      couldNotLoad: "Could not load your passport.",
    },

    passportForm: {
      bloodType: "Blood type",
      allergies: "Critical allergies",
      allergiesHint: "One per line, e.g. Penicillin",
      medications: "Current medications",
      medicationsHint: "One per line, with the dose if you know it",
      conditions: "Relevant conditions",
      conditionsHint: "One per line",
      emergencyContact: "Emergency contact",
      name: "Name",
      phone: "Phone",
      notes: "Notes",
      save: "Save passport",
      saving: "Saving…",
      saved: "Passport saved.",
      couldNotSave: "Could not save.",
      couldNotSavePassport: "Could not save your passport.",
    },

    charge: {
      role: "Provider",
      signInTitle: "Provider sign-in",
      signInPurpose:
        "Sign in so patients can see who is asking, and so the payment reaches your wallet.",
      newCharge: "New charge",
      clinic: "Clinic or professional",
      amount: "Amount (USDC)",
      reason: "Reason",
      defaultClinic: "San Martín Clinic",
      defaultReason: "General consultation",
      fieldsLegend: "Information you need from the patient",
      fieldsHint:
        "Ask for the minimum. The patient approves each item separately and can approve fewer than you request.",
      create: "Create charge and show QR",
      creating: "Creating…",
      couldNotCreate: "Could not create the charge.",
      showPatientTitle: "Show this to the patient",
      showPatientBody:
        "The code carries only a random reference. It contains no medical information and no patient identity.",
      orOpenLink: "Or open this link",
      waitingPatient: "Waiting for the patient to respond…",
      authorizedTitle: "Authorized information",
      approvedOf: (a: number, b: number) => `${a} of ${b} approved`,
      accessExpires: (time: string) => `Access expires at ${time}`,
      paymentLabel: "Payment:",
      awaitingPatient: "awaiting the patient",
      viewTx: "View the transaction",
      historyTitle: "Charge history",
      historyEmptyBadge: "No charges yet",
      historyRecent: (n: number) => `${n} most recent`,
      historyBody:
        "Every charge you have created, with what the patient approved and a verifiable link to the on-chain payment where one exists.",
      historyEmpty: "Create your first charge above to see it appear here.",
      fieldsApproved: (a: number, b: number) => `${a} of ${b} fields approved`,
      consultation: "Consultation",
      viewTxShort: "View transaction",
    },

    consent: {
      eyebrow: "Consultation request",
      aProvider: "A provider",
      loading: "Loading this request…",
      notFound: "This request was not found. Ask the provider for a new code.",
      expired: "This request expired. Ask the provider for a new code.",
      declined: "You declined this request. Nothing was shared.",
      askingTitle: "What they are asking to see",
      askingBody:
        "Nothing has been shared yet. Uncheck anything you would rather keep private — you can approve fewer items than they asked for.",
      accessNote: "Access lasts 30 minutes and you can withdraw it at any time.",
      signInPurpose: "Sign in to approve this request and pay.",
      shareAndContinue: (n: number) => `Share ${n} and continue`,
      sharing: "Sharing…",
      decline: "Decline",
      couldNotRecord: "Could not record your decision.",
      payTitle: "Pay the consultation",
      payBody: "Your information is now visible to the provider for 30 minutes.",
      pay: (amount: string) => `Pay ${amount} USDC`,
      couldNotPrepare: "Could not prepare the payment.",
      usdcUnavailable: "USDC is not available on this wallet yet.",
      paymentFailed: "The payment failed.",
      submitted: "Payment submitted",
      complete: "Payment complete",
      submittedBody: "The network accepted it and is still confirming.",
      completeBody: "The provider has received your payment.",
      verifyTx: "Verify this transaction",
    },

    fields: {
      blood_type: "Blood type",
      allergies: "Critical allergies",
      medications: "Current medications",
      conditions: "Relevant conditions",
      emergency_contact: "Emergency contact",
    },

    disclosed: {
      bloodType: "Blood type",
      allergies: "Critical allergies",
      medications: "Medications",
      conditions: "Conditions",
      emergencyContact: "Emergency contact",
    },

    encounterStatus: {
      requested: "Waiting for the patient",
      consented: "Approved, payment outstanding",
      rejected: "Declined",
      paid: "Paid",
      revoked: "Access withdrawn",
    },

    paymentStatus: {
      pending: "confirming on the network",
      success: "complete",
      error: "failed",
    },

    session: {
      couldNotStart: "Could not start sign-in.",
      walletDidNotSign: "Your wallet did not sign the request.",
      couldNotVerify: "Sign-in could not be verified.",
      failed: "Sign-in failed.",
    },
  },
} satisfies Record<Language, unknown>;
