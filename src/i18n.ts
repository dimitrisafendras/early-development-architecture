/**
 * Lightweight i18n — English (source of truth) + Greek.
 *
 * The dictionary carries every user-facing string on the infographic route and
 * its shared chrome. Structural, locale-independent data (tones, hex colors,
 * numeric values, ids, times) stays in `src/data.ts`; components zip that
 * structure with the localized text here (by index / id).
 *
 * `useT()` returns the message tree for the active locale from the store.
 */
import { useAppStore, type Locale } from './store'

const en = {
  nav: {
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    sections: 'Sections',
    language: 'Language',
    brand: 'Early Development',
    designSystem: 'Design System',
    palette: 'Accent palette',
    boy: 'Boy',
    girl: 'Girl',
    theme: 'Color theme',
    lightTheme: 'Light theme',
    darkTheme: 'Dark theme',
    links: {
      neurobiology: 'Brain Growth',
      serveReturn: 'Serve & Return',
      languageMusic: 'Parentese & Music',
      tummyTime: 'Tummy Time',
      routine: 'Daily Schedule',
      environment: 'Video Deficit',
      summary: 'Action Items',
    },
  },
  auth: {
    signIn: 'Sign in',
    signOut: 'Sign out',
    account: 'Account',
    title: 'Sign in to sync your progress',
    continueWithGoogle: 'Continue with Google',
    or: 'or',
    emailLabel: 'Email',
    emailPlaceholder: 'you@example.com',
    sendLink: 'Send sign-in link',
    sending: 'Sending…',
    linkSent: 'Check your inbox — we sent you a sign-in link.',
    signedInAs: 'Signed in as',
    anonymousUser: 'Guest',
    error: 'Something went wrong. Please try again.',
  },
  common: {
    module: 'Module',
    progress: 'Progress',
    completed: 'Completed',
    reset: 'Reset Checklist',
  },
  hero: {
    badge: 'Evidence-Based Early Psychology & Neuroscience',
    title: 'The Architecture of Early Development',
    subtitle:
      'A comprehensive visual infographic mapping neurobiological foundations, acoustic language scaffolding, tummy time optimization, and daily caregiver routines.',
    ctaChecklist: 'Caregiver Checklist',
    ctaSchedule: 'Daily Schedule',
    metrics: [
      { label: 'Synaptogenesis', note: 'New neural connections per sec' },
      { label: 'Response Window', note: 'Optimal contingent latency' },
      { label: 'Tummy Time Goal', note: 'Daily target by 4 months' },
      { label: 'Parentese Effect', note: 'Sustained attention & recall' },
    ],
  },
  neurobiology: {
    title: 'The Biological Imperative: Explosive Brain Growth',
    description:
      "An infant's brain doubles in size during the first year, establishing the neural architecture for a lifetime of cognitive, emotional, and social capacity.",
    chartTitle: 'Brain Mass % relative to Adult Size',
    newborn: 'Newborn',
    oneYear: '1 Year',
    adult: 'Adult',
    cards: {
      synaptogenesis: {
        title: 'Synaptogenesis Surge',
        body: 'Neurons form over 1 million new synaptic connections every single second. Sensory inputs (eye contact, gentle touch, rhythmic voice) determine which synapses are preserved.',
        action: '⚡ Action: High-quality engagement reinforces synapses.',
      },
      pruning: {
        title: 'Pruning Mechanism',
        body: 'Unused neural connections are systematically pruned away. Consistent interaction "lights up" specific pathways, converting temporary brain activity into permanent structure.',
        action: '💡 "Neurons that fire together, wire together."',
      },
      coregulation: {
        title: 'Coregulation & Stress System Calibration',
        body: "A newborn cannot regulate their own nervous system. Prompt, soothing responses to distress buffer the infant's brain against high cortisol levels, setting up healthy HPA-axis (stress response) baseline controls.",
      },
    },
  },
  serveReturn: {
    title: 'The "Serve and Return" Interaction Loop',
    description:
      'Harvard Center on the Developing Child highlights that social interactions function like a game of tennis. The infant serves a cue; the caregiver immediately returns it.',
    steps: [
      {
        title: 'Infant "Serve"',
        desc: 'Baby makes eye contact, babbles, reaches out, coos, or changes facial expression.',
        foot: 'Initiated by infant curiosity or need.',
      },
      {
        title: '1–4 Sec Window',
        desc: 'Caregiver notices the signal and pauses adult task to direct full focus to the baby.',
        foot: '⏱️ Contingent timing is key!',
      },
      {
        title: 'Caregiver "Return"',
        desc: 'Respond with warm facial expression, vocal imitation, gentle touch, or word labeling.',
        foot: 'Validates infant agency & focus.',
      },
      {
        title: 'Neural Fortification',
        desc: 'Synaptic circuits for trust, language, and emotional regulation lock into place.',
        foot: '✨ Circuit completed.',
      },
    ],
    simulatorTitle: 'Interactive Responsiveness Simulator',
    simulatorPrompt:
      'Select a caregiver response delay to see how timing impacts neural alertness & stress hormones:',
    outcomes: {
      optimal: {
        title: 'High Contingency (1–4s)',
        desc: "The infant's prefrontal cortex connects the action with caregiver response. Synaptic strengthening is maximized, releasing oxytocin and stabilizing heart rate.",
        buttonLabel: 'Fast Contingent (1–4 Seconds)',
      },
      delayed: {
        title: 'Moderate Latency (>10s)',
        desc: 'The infant loses the temporal association between their serve and the return. Attention drifts, and neural mapping efficiency drops by ~60%.',
        buttonLabel: 'Delayed Response (>10 Seconds)',
      },
      none: {
        title: 'Still Face / Non-Responsive',
        desc: 'Triggers an immediate cortisol spike in the baby. Repeated non-responsiveness causes the infant to withdraw, reducing overall vocalization attempts.',
        buttonLabel: 'Non-Responsive (Still Face)',
      },
    },
  },
  languageMusic: {
    title: 'Acoustic Scaffolding: Parentese & Musical Stimuli',
    description:
      'Infant-directed speech ("Parentese") and rhythmic melody act as acoustic scaffolding for language processing and neuro-auditory mapping.',
    chartTitle: 'Acoustic Architecture Comparison',
    chartSub: 'Standard Adult Speech vs. Parentese Speech Profile',
    badge: 'Language Acquisition',
    cards: [
      {
        title: 'Role of Music & Singing',
        text: 'Soft lullabies and rhythmic tunes activate auditory-motor networks simultaneously. Studies show live singing by caregivers reduces infant heart rate and cortisol levels more effectively than spoken voice alone.',
      },
      {
        title: 'Acoustic Safety Rules',
        text: 'Keep music and environment sound below 60 decibels (about conversational volume). Continuous loud background audio disrupts phoneme discrimination and creates sensory fatigue.',
      },
      {
        title: 'Phonetic Discrimination',
        text: 'Newborns are born "citizens of the world," able to distinguish all 800+ human language sounds. Parentese elongates vowel formants, allowing the brain to map native phonetic categories quickly.',
      },
    ],
    noteLabel: 'Note on Parentese:',
    noteBefore: 'Parentese is ',
    noteEm: 'not',
    noteAfter:
      ' baby talk or nonsensical words. It uses real grammar and vocabulary spoken at a higher pitch, slower tempo, with exaggerated vowel sounds ("Heeellloo baby!").',
  },
  tummyTime: {
    title: 'Physical Optimization: Daily Tummy Time',
    description:
      'Supervised tummy time while awake is essential for neck, back, and shoulder core strength, motor milestone progression, and preventing flat spots (plagiocephaly).',
    chartTitle: 'Tummy Time Progression Target',
    chartSub: 'Cumulative minutes per day from birth to 4 months',
    badge: 'Physical Milestone',
    benefitsTitle: '🦴 Biomechanical Benefits',
    benefits: [
      'Strengthens extensor muscles in neck, spine, and trunk.',
      'Prepares upper limbs for pushing up, rolling, and crawling.',
      'Prevents positional plagiocephaly (flat spots on skull).',
      'Enhances spatial perception and visual-motor integration.',
    ],
    alertTitle: 'Crucial Safety Directive',
    alertBefore: 'Tummy time is exclusively for when the infant is ',
    alertEm: 'awake and 100% supervised by an adult',
    alertAfter:
      '. For sleep, infants must ALWAYS be placed strictly on their back on a flat, firm surface.',
    tipsTitle: 'Pro-Tips for Content Tummy Time',
    tips: [
      { strong: 'Chest-to-Chest:', text: 'Lay on your back with baby on your chest for comfort.' },
      { strong: 'High Contrast:', text: 'Place black-and-white cards at eye level.' },
    ],
  },
  routine: {
    title: '📅 Daily Routine Architecture (Caregiver & Infant)',
    description:
      'A predictable yet adaptable rhythm balancing direct engagement, physical tummy sessions, sensory regulation, and caregiver recovery.',
    blocks: [
      {
        title: 'Morning Awakening & Auditory Scaffolding',
        items: [
          { strong: 'Parentese Activation:', text: 'Speak in slow, warm, high-pitched tones during diaper changes & feedings.' },
          { strong: 'Contingent Eye Contact:', text: 'Respond swiftly (1–4s) to morning coos or gazes.' },
        ],
        focus: 'Focus: High linguistic input & emotional reconnect',
      },
      {
        title: 'Mid-Morning Physical & Cognitive Focus',
        items: [
          { strong: 'Targeted Tummy Time:', text: 'Place baby on firm play mat while fully awake & supervised.' },
          { strong: 'Face-to-Face Engagement:', text: 'Get down to eye level with high-contrast visual cards.' },
        ],
        focus: 'Focus: Core muscle building & visual scanning',
      },
      {
        title: 'Midday Reset, Sensory Regulation & Music',
        items: [
          { strong: 'Acoustic & Rhythmic Stimuli:', text: 'Play soft background lullabies or sing softly to regulate cortisol.' },
          { strong: 'Environmental Control:', text: 'Keep screens OFF and background noise minimal.' },
        ],
        focus: 'Focus: Sensory reset & nervous system calming',
      },
      {
        title: 'Afternoon Play & Dynamic Movement',
        items: [
          { strong: 'Secondary Tummy Session:', text: 'Short 5–10 min tummy intervals to avoid motor fatigue.' },
          { strong: 'Active Serve & Return:', text: 'Respond to leg kicks and babbling with warm touch & speech.' },
        ],
        focus: 'Focus: Dynamic mobility & tactile exploration',
      },
      {
        title: 'Evening Wind-Down & Acoustic Transition',
        items: [
          { strong: 'Calming Auditory Cues:', text: 'Transition to slow vocal tones and dim lighting.' },
          { strong: 'Caregiver Self-Care Buffer:', text: 'Rotate parenting duties to prevent caregiver burnout.' },
        ],
        focus: 'Focus: Melatonin onset & emotional grounding',
      },
      {
        title: 'Safe Nighttime Sleep & Memory Consolidation',
        items: [
          { strong: 'Back-to-Sleep Position:', text: 'Place baby strictly on their back on a firm, flat mattress.' },
          { strong: 'Neural Consolidation:', text: 'Deep slow-wave sleep converts daily synapses into long-term memory.' },
        ],
        focus: 'Focus: Airway safety & memory wiring',
      },
    ],
  },
  environment: {
    title: 'Environmental Architecture: Screen Deficit vs. Live Interaction',
    description:
      'Infant brains cannot transfer 2D screen stimuli into real-world comprehension—a phenomenon known in developmental psychology as the Video Deficit Effect.',
    reasonsTitle: 'Why Screens Fail Newborn Neural Wiring',
    reasons: [
      {
        strong: 'Lack of 3D Contingency:',
        text: "Screen characters cannot respond to the infant's 1-4 second serve. The feedback loop breaks, causing frustration or passive brain states.",
      },
      {
        strong: 'Background TV Overhead:',
        text: 'Constant background noise reduces caregiver word count by 500–1000 words per hour and fragments infant sustained attention.',
      },
      {
        strong: 'Live Human Primacy:',
        text: 'Babies learn language exclusively from live human social gaze and joint attention in the first 18–24 months.',
      },
    ],
    scoreTitle: 'Developmental Efficiency Score',
    scores: [
      { label: 'Live Human Interaction', text: '100% Neural Activation' },
      { label: 'Interactive Audio / Live Singing', text: '85% Neural Activation' },
      { label: '2D Video / Baby Media', text: '<15% Neural Activation' },
    ],
    footnote:
      '* Based on EEG theta/beta power ratios and eye-tracking habituation studies in infant psychology literature.',
  },
  summary: {
    title: '💡 Summary of Key Action Items for Caregivers',
    description:
      'Interactive master checklist to track your daily implementation of science-backed infant development practices.',
    items: [
      {
        title: 'Respond Swiftly (1–4s)',
        desc: 'Acknowledge vocalizations, gazes, and movements immediately to complete the Serve and Return loop.',
      },
      {
        title: 'Speak in Parentese Speech',
        desc: 'Use direct, slow-tempo, higher-pitched speech with elongated vowel sounds to boost phonetic processing.',
      },
      {
        title: 'Prioritize Daily Tummy Time',
        desc: 'Progressively build up to 60 cumulative minutes daily by 4 months while awake and supervised.',
      },
      {
        title: 'Introduce Soft Music & Rhythm',
        desc: 'Incorporate gentle singing and low-volume acoustic music to regulate stress and build auditory pathways.',
      },
      {
        title: 'Limit Digital Screens & Background Noise',
        desc: "Eliminate screen exposure and background chatter to preserve the infant's attention span and focus metrics.",
      },
      {
        title: 'Maintain Safe Sleep Practices',
        desc: 'Always place infants strictly on their back on a flat, firm surface to protect airway and consolidate memory.',
      },
    ],
  },
  footer: {
    title: '🧠 The Architecture of Early Development',
    body: 'Synthesized from peer-reviewed early infant psychology publications, Harvard Center on the Developing Child research, AAP guidelines, and contemporary developmental neuroscience.',
    tagline: 'Designed for Caregivers, Pediatric Educators, and Early Interventionists.',
  },
  charts: {
    brainGrowth: [
      'Newborn Brain Mass (25%)',
      'First Year Growth (+45%)',
      'Remaining Adult Growth (+30%)',
    ],
    parenteseAxis: ['Pitch Variance', 'Vowel Elongation', 'Infant Attention Span', 'Word Retention'],
    parenteseSeries: ['Standard Adult Speech', 'Parentese Acoustic Profile'],
    tummyAxis: ['Birth (Week 1)', '1 Month', '2 Months', '3 Months', '4 Months+'],
    tummySeries: 'Target Daily Minutes',
    tummyYTitle: 'Cumulative Minutes / Day',
  },
}

export type Messages = typeof en

const el: Messages = {
  nav: {
    menuOpen: 'Άνοιγμα μενού',
    menuClose: 'Κλείσιμο μενού',
    sections: 'Ενότητες',
    language: 'Γλώσσα',
    brand: 'Πρώιμη Ανάπτυξη',
    designSystem: 'Σύστημα Σχεδίασης',
    palette: 'Χρωματική παλέτα',
    boy: 'Αγόρι',
    girl: 'Κορίτσι',
    theme: 'Θέμα χρωμάτων',
    lightTheme: 'Φωτεινό θέμα',
    darkTheme: 'Σκούρο θέμα',
    links: {
      neurobiology: 'Ανάπτυξη Εγκεφάλου',
      serveReturn: 'Σερβίρισμα & Επιστροφή',
      languageMusic: 'Παιδική Ομιλία & Μουσική',
      tummyTime: 'Χρόνος Μπρούμυτα',
      routine: 'Καθημερινό Πρόγραμμα',
      environment: 'Έλλειμμα Βίντεο',
      summary: 'Ενέργειες',
    },
  },
  auth: {
    signIn: 'Σύνδεση',
    signOut: 'Αποσύνδεση',
    account: 'Λογαριασμός',
    title: 'Συνδεθείτε για να συγχρονίζετε την πρόοδό σας',
    continueWithGoogle: 'Συνέχεια με Google',
    or: 'ή',
    emailLabel: 'Email',
    emailPlaceholder: 'you@example.com',
    sendLink: 'Αποστολή συνδέσμου σύνδεσης',
    sending: 'Αποστολή…',
    linkSent: 'Ελέγξτε τα εισερχόμενά σας — σας στείλαμε σύνδεσμο σύνδεσης.',
    signedInAs: 'Συνδεδεμένοι ως',
    anonymousUser: 'Επισκέπτης',
    error: 'Κάτι πήγε στραβά. Δοκιμάστε ξανά.',
  },
  common: {
    module: 'Ενότητα',
    progress: 'Πρόοδος',
    completed: 'Ολοκληρώθηκαν',
    reset: 'Επαναφορά Λίστας',
  },
  hero: {
    badge: 'Τεκμηριωμένη Πρώιμη Ψυχολογία & Νευροεπιστήμη',
    title: 'Η Αρχιτεκτονική της Πρώιμης Ανάπτυξης',
    subtitle:
      'Ένα ολοκληρωμένο οπτικό infographic που χαρτογραφεί τα νευροβιολογικά θεμέλια, την ακουστική γλωσσική υποστήριξη, τη βελτιστοποίηση του χρόνου μπρούμυτα και τις καθημερινές ρουτίνες φροντίδας.',
    ctaChecklist: 'Λίστα Φροντιστή',
    ctaSchedule: 'Καθημερινό Πρόγραμμα',
    metrics: [
      { label: 'Συναπτογένεση', note: 'Νέες νευρικές συνδέσεις ανά δευτ.' },
      { label: 'Παράθυρο Απόκρισης', note: 'Βέλτιστη χρονική απόκριση' },
      { label: 'Στόχος Χρόνου Μπρούμυτα', note: 'Ημερήσιος στόχος έως τους 4 μήνες' },
      { label: 'Επίδραση Παιδικής Ομιλίας', note: 'Διατηρούμενη προσοχή & ανάκληση' },
    ],
  },
  neurobiology: {
    title: 'Η Βιολογική Επιταγή: Εκρηκτική Ανάπτυξη του Εγκεφάλου',
    description:
      'Ο εγκέφαλος του βρέφους διπλασιάζεται σε μέγεθος τον πρώτο χρόνο, θεμελιώνοντας τη νευρική αρχιτεκτονική για μια ζωή γνωστικής, συναισθηματικής και κοινωνικής ικανότητας.',
    chartTitle: 'Μάζα Εγκεφάλου % σε σχέση με το Μέγεθος Ενήλικα',
    newborn: 'Νεογέννητο',
    oneYear: '1 Έτος',
    adult: 'Ενήλικας',
    cards: {
      synaptogenesis: {
        title: 'Έκρηξη Συναπτογένεσης',
        body: 'Οι νευρώνες σχηματίζουν πάνω από 1 εκατομμύριο νέες συναπτικές συνδέσεις κάθε δευτερόλεπτο. Τα αισθητηριακά ερεθίσματα (βλεμματική επαφή, απαλό άγγιγμα, ρυθμική φωνή) καθορίζουν ποιες συνάψεις διατηρούνται.',
        action: '⚡ Ενέργεια: Η ποιοτική αλληλεπίδραση ενισχύει τις συνάψεις.',
      },
      pruning: {
        title: 'Μηχανισμός Κλαδέματος',
        body: 'Οι αχρησιμοποίητες νευρικές συνδέσεις κλαδεύονται συστηματικά. Η σταθερή αλληλεπίδραση «φωτίζει» συγκεκριμένες οδούς, μετατρέποντας την προσωρινή εγκεφαλική δραστηριότητα σε μόνιμη δομή.',
        action: '💡 «Οι νευρώνες που πυροδοτούν μαζί, συνδέονται μαζί.»',
      },
      coregulation: {
        title: 'Συρρύθμιση & Βαθμονόμηση του Συστήματος Στρες',
        body: 'Ένα νεογέννητο δεν μπορεί να ρυθμίσει μόνο του το νευρικό του σύστημα. Οι έγκαιρες, καθησυχαστικές αποκρίσεις στην αναστάτωση θωρακίζουν τον εγκέφαλο του βρέφους από υψηλά επίπεδα κορτιζόλης, θέτοντας υγιείς βασικές ρυθμίσεις του άξονα HPA (απόκριση στο στρες).',
      },
    },
  },
  serveReturn: {
    title: 'Ο Βρόχος Αλληλεπίδρασης «Σερβίρισμα και Επιστροφή»',
    description:
      'Το Harvard Center on the Developing Child τονίζει ότι οι κοινωνικές αλληλεπιδράσεις λειτουργούν σαν παιχνίδι τένις. Το βρέφος «σερβίρει» ένα σήμα· ο φροντιστής το επιστρέφει αμέσως.',
    steps: [
      {
        title: 'Το «Σερβίρισμα» του Βρέφους',
        desc: 'Το μωρό κάνει βλεμματική επαφή, ψελλίζει, απλώνει τα χέρια, γουργουρίζει ή αλλάζει έκφραση προσώπου.',
        foot: 'Ξεκινά από την περιέργεια ή την ανάγκη του βρέφους.',
      },
      {
        title: 'Παράθυρο 1–4 Δευτ.',
        desc: 'Ο φροντιστής αντιλαμβάνεται το σήμα και σταματά την ενήλικη δραστηριότητα για να εστιάσει πλήρως στο μωρό.',
        foot: '⏱️ Ο χρονισμός της απόκρισης είναι το κλειδί!',
      },
      {
        title: 'Η «Επιστροφή» του Φροντιστή',
        desc: 'Απαντήστε με ζεστή έκφραση προσώπου, φωνητική μίμηση, απαλό άγγιγμα ή ονοματοδοσία λέξεων.',
        foot: 'Επιβεβαιώνει την πρωτοβουλία & την προσοχή του βρέφους.',
      },
      {
        title: 'Νευρική Ενίσχυση',
        desc: 'Τα συναπτικά κυκλώματα για την εμπιστοσύνη, τη γλώσσα και τη συναισθηματική ρύθμιση παγιώνονται.',
        foot: '✨ Το κύκλωμα ολοκληρώθηκε.',
      },
    ],
    simulatorTitle: 'Διαδραστικός Προσομοιωτής Ανταπόκρισης',
    simulatorPrompt:
      'Επιλέξτε μια καθυστέρηση απόκρισης του φροντιστή για να δείτε πώς ο χρονισμός επηρεάζει τη νευρική εγρήγορση & τις ορμόνες του στρες:',
    outcomes: {
      optimal: {
        title: 'Υψηλή Ανταπόκριση (1–4 δευτ.)',
        desc: 'Ο προμετωπιαίος φλοιός του βρέφους συνδέει την πράξη με την απόκριση του φροντιστή. Η συναπτική ενίσχυση μεγιστοποιείται, απελευθερώνοντας ωκυτοκίνη και σταθεροποιώντας τον καρδιακό ρυθμό.',
        buttonLabel: 'Άμεση Απόκριση (1–4 Δευτ.)',
      },
      delayed: {
        title: 'Μέτρια Καθυστέρηση (>10 δευτ.)',
        desc: 'Το βρέφος χάνει τη χρονική συσχέτιση ανάμεσα στο σερβίρισμα και την επιστροφή. Η προσοχή διασπάται και η αποδοτικότητα της νευρικής χαρτογράφησης πέφτει κατά ~60%.',
        buttonLabel: 'Καθυστερημένη Απόκριση (>10 Δευτ.)',
      },
      none: {
        title: 'Ακίνητο Πρόσωπο / Μη Ανταποκρινόμενος',
        desc: 'Προκαλεί άμεση αύξηση της κορτιζόλης στο μωρό. Η επαναλαμβανόμενη μη ανταπόκριση οδηγεί το βρέφος σε απόσυρση, μειώνοντας τις προσπάθειες φωνοποίησης.',
        buttonLabel: 'Μη Ανταποκρινόμενος (Ακίνητο Πρόσωπο)',
      },
    },
  },
  languageMusic: {
    title: 'Ακουστική Υποστήριξη: Παιδική Ομιλία & Μουσικά Ερεθίσματα',
    description:
      'Η βρεφο-κατευθυνόμενη ομιλία («Παιδική Ομιλία») και η ρυθμική μελωδία λειτουργούν ως ακουστική υποστήριξη για την επεξεργασία της γλώσσας και τη νευρο-ακουστική χαρτογράφηση.',
    chartTitle: 'Σύγκριση Ακουστικής Αρχιτεκτονικής',
    chartSub: 'Τυπική Ομιλία Ενήλικα vs. Προφίλ Παιδικής Ομιλίας',
    badge: 'Κατάκτηση Γλώσσας',
    cards: [
      {
        title: 'Ο Ρόλος της Μουσικής & του Τραγουδιού',
        text: 'Τα απαλά νανουρίσματα και οι ρυθμικές μελωδίες ενεργοποιούν ταυτόχρονα τα ακουστικο-κινητικά δίκτυα. Μελέτες δείχνουν ότι το ζωντανό τραγούδι των φροντιστών μειώνει τον καρδιακό ρυθμό και τα επίπεδα κορτιζόλης του βρέφους πιο αποτελεσματικά από τη σκέτη ομιλία.',
      },
      {
        title: 'Κανόνες Ακουστικής Ασφάλειας',
        text: 'Κρατήστε τη μουσική και τον ήχο του περιβάλλοντος κάτω από 60 ντεσιμπέλ (περίπου σε ένταση συνομιλίας). Ο συνεχής δυνατός ήχος υποβάθρου διαταράσσει τη διάκριση φωνημάτων και προκαλεί αισθητηριακή κόπωση.',
      },
      {
        title: 'Διάκριση Φωνημάτων',
        text: 'Τα νεογέννητα γεννιούνται «πολίτες του κόσμου», ικανά να διακρίνουν και τους 800+ ήχους των ανθρώπινων γλωσσών. Η Παιδική Ομιλία επιμηκύνει τα φωνήεντα, επιτρέποντας στον εγκέφαλο να χαρτογραφήσει γρήγορα τις φωνητικές κατηγορίες της μητρικής γλώσσας.',
      },
    ],
    noteLabel: 'Σημείωση για την Παιδική Ομιλία:',
    noteBefore: 'Η Παιδική Ομιλία ',
    noteEm: 'δεν',
    noteAfter:
      ' είναι μωρουδίστικα ή ανούσιες λέξεις. Χρησιμοποιεί πραγματική γραμματική και λεξιλόγιο, με υψηλότερο τόνο, πιο αργό ρυθμό και έντονα φωνήεντα («Γειιιά σου μωρό μου!»).',
  },
  tummyTime: {
    title: 'Σωματική Βελτιστοποίηση: Καθημερινός Χρόνος Μπρούμυτα',
    description:
      'Ο εποπτευόμενος χρόνος μπρούμυτα σε κατάσταση εγρήγορσης είναι απαραίτητος για τη δύναμη του αυχένα, της πλάτης και των ώμων, την εξέλιξη των κινητικών οροσήμων και την πρόληψη των πλατυκεφαλιών (πλαγιοκεφαλία).',
    chartTitle: 'Στόχος Εξέλιξης Χρόνου Μπρούμυτα',
    chartSub: 'Αθροιστικά λεπτά ανά ημέρα από τη γέννηση έως τους 4 μήνες',
    badge: 'Σωματικό Ορόσημο',
    benefitsTitle: '🦴 Βιομηχανικά Οφέλη',
    benefits: [
      'Ενδυναμώνει τους εκτείνοντες μυς σε αυχένα, σπονδυλική στήλη και κορμό.',
      'Προετοιμάζει τα άνω άκρα για ανασήκωμα, κύλισμα και μπουσούλημα.',
      'Προλαμβάνει τη θεσιακή πλαγιοκεφαλία (πλατυκεφαλίες στο κρανίο).',
      'Ενισχύει τη χωρική αντίληψη και την οπτικο-κινητική ολοκλήρωση.',
    ],
    alertTitle: 'Κρίσιμη Οδηγία Ασφαλείας',
    alertBefore: 'Ο χρόνος μπρούμυτα είναι αποκλειστικά για όταν το βρέφος είναι ',
    alertEm: 'ξύπνιο και υπό 100% επίβλεψη ενήλικα',
    alertAfter:
      '. Για τον ύπνο, τα βρέφη πρέπει ΠΑΝΤΑ να τοποθετούνται αυστηρά ανάσκελα σε επίπεδη, σταθερή επιφάνεια.',
    tipsTitle: 'Συμβουλές για Ευχάριστο Χρόνο Μπρούμυτα',
    tips: [
      { strong: 'Στήθος με Στήθος:', text: 'Ξαπλώστε ανάσκελα με το μωρό στο στήθος σας για άνεση.' },
      { strong: 'Υψηλή Αντίθεση:', text: 'Τοποθετήστε ασπρόμαυρες κάρτες στο ύψος των ματιών.' },
    ],
  },
  routine: {
    title: '📅 Αρχιτεκτονική Καθημερινής Ρουτίνας (Φροντιστής & Βρέφος)',
    description:
      'Ένας προβλέψιμος αλλά προσαρμόσιμος ρυθμός που ισορροπεί την άμεση αλληλεπίδραση, τις σωματικές συνεδρίες μπρούμυτα, την αισθητηριακή ρύθμιση και την ανάκαμψη του φροντιστή.',
    blocks: [
      {
        title: 'Πρωινό Ξύπνημα & Ακουστική Υποστήριξη',
        items: [
          { strong: 'Ενεργοποίηση Παιδικής Ομιλίας:', text: 'Μιλήστε με αργό, ζεστό, υψίτονο τρόπο κατά την αλλαγή πάνας & τα γεύματα.' },
          { strong: 'Έγκαιρη Βλεμματική Επαφή:', text: 'Ανταποκριθείτε γρήγορα (1–4 δευτ.) στα πρωινά γουργουρίσματα ή βλέμματα.' },
        ],
        focus: 'Εστίαση: Υψηλή γλωσσική είσοδος & συναισθηματική επανασύνδεση',
      },
      {
        title: 'Μεσοπρωινή Σωματική & Γνωστική Εστίαση',
        items: [
          { strong: 'Στοχευμένος Χρόνος Μπρούμυτα:', text: 'Τοποθετήστε το μωρό σε σταθερό στρωματάκι ενώ είναι ξύπνιο & υπό επίβλεψη.' },
          { strong: 'Πρόσωπο με Πρόσωπο:', text: 'Κατεβείτε στο ύψος των ματιών με κάρτες υψηλής οπτικής αντίθεσης.' },
        ],
        focus: 'Εστίαση: Ενδυνάμωση κορμού & οπτική σάρωση',
      },
      {
        title: 'Μεσημεριανή Αποφόρτιση, Αισθητηριακή Ρύθμιση & Μουσική',
        items: [
          { strong: 'Ακουστικά & Ρυθμικά Ερεθίσματα:', text: 'Παίξτε απαλά νανουρίσματα ή τραγουδήστε σιγανά για να ρυθμίσετε την κορτιζόλη.' },
          { strong: 'Έλεγχος Περιβάλλοντος:', text: 'Κρατήστε τις οθόνες ΚΛΕΙΣΤΕΣ και τον θόρυβο υποβάθρου ελάχιστο.' },
        ],
        focus: 'Εστίαση: Αισθητηριακή επαναφορά & ηρεμία νευρικού συστήματος',
      },
      {
        title: 'Απογευματινό Παιχνίδι & Δυναμική Κίνηση',
        items: [
          { strong: 'Δεύτερη Συνεδρία Μπρούμυτα:', text: 'Σύντομα διαστήματα 5–10 λεπτών για αποφυγή κινητικής κόπωσης.' },
          { strong: 'Ενεργό Σερβίρισμα & Επιστροφή:', text: 'Ανταποκριθείτε στις κλωτσιές και το ψέλλισμα με ζεστό άγγιγμα & ομιλία.' },
        ],
        focus: 'Εστίαση: Δυναμική κινητικότητα & απτική εξερεύνηση',
      },
      {
        title: 'Βραδινή Χαλάρωση & Ακουστική Μετάβαση',
        items: [
          { strong: 'Καθησυχαστικά Ακουστικά Σήματα:', text: 'Μετάβαση σε αργούς φωνητικούς τόνους και χαμηλό φωτισμό.' },
          { strong: 'Διάλειμμα Αυτοφροντίδας Φροντιστή:', text: 'Εναλλάξτε τα καθήκοντα ανατροφής για να αποφύγετε την εξουθένωση.' },
        ],
        focus: 'Εστίαση: Έναρξη μελατονίνης & συναισθηματική σταθεροποίηση',
      },
      {
        title: 'Ασφαλής Νυχτερινός Ύπνος & Παγίωση Μνήμης',
        items: [
          { strong: 'Θέση Ανάσκελα για Ύπνο:', text: 'Τοποθετήστε το μωρό αυστηρά ανάσκελα σε σταθερό, επίπεδο στρώμα.' },
          { strong: 'Νευρική Παγίωση:', text: 'Ο βαθύς ύπνος βραδέων κυμάτων μετατρέπει τις καθημερινές συνάψεις σε μακροπρόθεσμη μνήμη.' },
        ],
        focus: 'Εστίαση: Ασφάλεια αεραγωγού & αποτύπωση μνήμης',
      },
    ],
  },
  environment: {
    title: 'Αρχιτεκτονική Περιβάλλοντος: Έλλειμμα Οθόνης vs. Ζωντανή Αλληλεπίδραση',
    description:
      'Ο εγκέφαλος του βρέφους δεν μπορεί να μεταφέρει τα δισδιάστατα ερεθίσματα της οθόνης σε κατανόηση του πραγματικού κόσμου—ένα φαινόμενο γνωστό στην αναπτυξιακή ψυχολογία ως «Φαινόμενο Ελλείμματος Βίντεο».',
    reasonsTitle: 'Γιατί οι Οθόνες Αποτυγχάνουν στη Νευρική Καλωδίωση του Νεογέννητου',
    reasons: [
      {
        strong: 'Έλλειψη 3D Ανταπόκρισης:',
        text: 'Οι χαρακτήρες της οθόνης δεν μπορούν να ανταποκριθούν στο σερβίρισμα 1-4 δευτ. του βρέφους. Ο βρόχος ανατροφοδότησης σπάει, προκαλώντας απογοήτευση ή παθητικές εγκεφαλικές καταστάσεις.',
      },
      {
        strong: 'Επιβάρυνση από Τηλεόραση στο Υπόβαθρο:',
        text: 'Ο συνεχής θόρυβος υποβάθρου μειώνει τον αριθμό λέξεων του φροντιστή κατά 500–1000 λέξεις την ώρα και κατακερματίζει τη διατηρούμενη προσοχή του βρέφους.',
      },
      {
        strong: 'Πρωτοκαθεδρία της Ζωντανής Επαφής:',
        text: 'Τα μωρά μαθαίνουν γλώσσα αποκλειστικά από το ζωντανό ανθρώπινο βλέμμα και την από κοινού προσοχή τους πρώτους 18–24 μήνες.',
      },
    ],
    scoreTitle: 'Δείκτης Αναπτυξιακής Αποδοτικότητας',
    scores: [
      { label: 'Ζωντανή Ανθρώπινη Αλληλεπίδραση', text: '100% Νευρική Ενεργοποίηση' },
      { label: 'Διαδραστικός Ήχος / Ζωντανό Τραγούδι', text: '85% Νευρική Ενεργοποίηση' },
      { label: '2D Βίντεο / Βρεφικά Μέσα', text: '<15% Νευρική Ενεργοποίηση' },
    ],
    footnote:
      '* Βασισμένο σε λόγους ισχύος θήτα/βήτα σε EEG και μελέτες εξοικείωσης με παρακολούθηση βλέμματος στη βιβλιογραφία της βρεφικής ψυχολογίας.',
  },
  summary: {
    title: '💡 Σύνοψη Βασικών Ενεργειών για Φροντιστές',
    description:
      'Διαδραστική κύρια λίστα ελέγχου για να παρακολουθείτε την καθημερινή εφαρμογή επιστημονικά τεκμηριωμένων πρακτικών βρεφικής ανάπτυξης.',
    items: [
      {
        title: 'Ανταποκριθείτε Γρήγορα (1–4 δευτ.)',
        desc: 'Αναγνωρίστε άμεσα τις φωνοποιήσεις, τα βλέμματα και τις κινήσεις για να ολοκληρώσετε τον βρόχο Σερβιρίσματος & Επιστροφής.',
      },
      {
        title: 'Μιλήστε με Παιδική Ομιλία',
        desc: 'Χρησιμοποιήστε άμεση, αργή, υψίτονη ομιλία με επιμηκυμένα φωνήεντα για να ενισχύσετε τη φωνητική επεξεργασία.',
      },
      {
        title: 'Δώστε Προτεραιότητα στον Καθημερινό Χρόνο Μπρούμυτα',
        desc: 'Αυξήστε σταδιακά έως 60 αθροιστικά λεπτά ημερησίως έως τους 4 μήνες, σε εγρήγορση και υπό επίβλεψη.',
      },
      {
        title: 'Εισαγάγετε Απαλή Μουσική & Ρυθμό',
        desc: 'Ενσωματώστε απαλό τραγούδι και χαμηλής έντασης ακουστική μουσική για να ρυθμίσετε το στρες και να χτίσετε ακουστικές οδούς.',
      },
      {
        title: 'Περιορίστε τις Ψηφιακές Οθόνες & τον Θόρυβο',
        desc: 'Εξαλείψτε την έκθεση σε οθόνες και τον θόρυβο υποβάθρου για να διατηρήσετε το εύρος προσοχής και την εστίαση του βρέφους.',
      },
      {
        title: 'Τηρήστε Πρακτικές Ασφαλούς Ύπνου',
        desc: 'Τοποθετείτε πάντα τα βρέφη αυστηρά ανάσκελα σε επίπεδη, σταθερή επιφάνεια για την προστασία του αεραγωγού και την παγίωση της μνήμης.',
      },
    ],
  },
  footer: {
    title: '🧠 Η Αρχιτεκτονική της Πρώιμης Ανάπτυξης',
    body: 'Συντέθηκε από δημοσιεύσεις βρεφικής ψυχολογίας με κριτές, έρευνα του Harvard Center on the Developing Child, κατευθυντήριες οδηγίες της AAP και σύγχρονη αναπτυξιακή νευροεπιστήμη.',
    tagline: 'Σχεδιασμένο για Φροντιστές, Παιδαγωγούς και Ειδικούς Πρώιμης Παρέμβασης.',
  },
  charts: {
    brainGrowth: [
      'Μάζα Εγκεφάλου Νεογέννητου (25%)',
      'Ανάπτυξη 1ου Έτους (+45%)',
      'Υπόλοιπη Ανάπτυξη Ενήλικα (+30%)',
    ],
    parenteseAxis: ['Διακύμανση Τόνου', 'Επιμήκυνση Φωνηέντων', 'Εύρος Προσοχής Βρέφους', 'Συγκράτηση Λέξεων'],
    parenteseSeries: ['Τυπική Ομιλία Ενήλικα', 'Προφίλ Παιδικής Ομιλίας'],
    tummyAxis: ['Γέννηση (Εβδ. 1)', '1 Μήνας', '2 Μήνες', '3 Μήνες', '4 Μήνες+'],
    tummySeries: 'Στόχος Ημερήσιων Λεπτών',
    tummyYTitle: 'Αθροιστικά Λεπτά / Ημέρα',
  },
}

const dictionaries: Record<Locale, Messages> = { en, el }

/** Returns the message tree for the currently-selected locale. */
export function useT(): Messages {
  const locale = useAppStore((s) => s.locale)
  return dictionaries[locale]
}
