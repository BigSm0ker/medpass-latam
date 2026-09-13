# Submission pack

Everything the bounty asks for, drafted and ready to paste into the Telegram group.

## Checklist

- [ ] Project name, team and members
- [ ] Description, at most 300 words — **drafted below**
- [ ] Repository link — <https://github.com/BigSm0ker/medpass-latam>
- [x] Public URL — <https://medpass-latam.vercel.app/>
- [ ] Demo video, at most 3 minutes — **script below**
- [ ] Mainnet transaction hash — pending access approval (`docs/MAINNET_RUNBOOK.md`)
- [ ] Vaquita account to receive the prize

## Description (300 words — the limit is 300)

**MedPass LATAM — Pay the clinic in seconds. Share only what the doctor needs.**

In much of Latin America a consultation is still settled in cash. The clinic has no card
terminal, or the person paying is family abroad. At the same moment, the provider is treating
someone whose allergies and current medications they cannot see.

MedPass treats those as one moment: a charge that carries consent.

A provider opens a charge naming an amount and the specific health details this visit needs. The
patient scans one QR code and sees exactly what is being asked before anything is disclosed. They
approve a subset — three of five items, or none at all — and pay in USDC through Pollar. The
provider receives only what was approved, for a limited time, and can be cut off at any moment. Health data never touches the blockchain; only the payment does.

Pollar does two jobs here. It moves the money: `sendPayment` settles USDC on Stellar, with the
issuer resolved at runtime from the app's asset catalog. And it is the identity: the SDK exposes no
server-side token verification, so we authenticate users by having the wallet sign a server-issued
challenge with SEP-53, verified against the Stellar address. The wallet is who you are, not just how
you pay — and Pollar's onboarding means a patient who has never held a wallet signs in with Google.

Authorization runs entirely on the server: disclosure is an allow-list projection, the payment
destination and amount are never read from the browser, and the database refuses any record not
marked synthetic. Every charge lands in a history view linking to its on-chain proof — built for a
clinic's daily shift, not a one-off demo.

All medical records are fictitious. This is a prototype, not a clinical system.

## Demo script — 3 minutes (the required submission video)

Recorded, not live: a live demo depends on venue wifi and on a transaction settling on cue. The
rules allow either. Spoken lines are Spanish because the judges are local and the product ships in
Spanish.

### Before recording

- Two devices: laptop as the provider, phone as the patient. The QR has to be scanned for real —
  two browser windows reads as a mock-up.
- Both accounts signed in beforehand, and the patient's passport already filled with the synthetic
  record. Nobody wants to watch a form being typed.
- Clean browser window. No personal tabs.
- Never on camera: the Pollar dashboard, API keys, `.env.local`, or a terminal that echoes them.
- Say once, plainly, that every medical record shown is fictitious.

### 0:00–0:20 — The problem

**Screen:** <https://medpass-latam.vercel.app> — scroll the landing slowly.

> "MedPass LATAM. En Bolivia y en buena parte de la región, muchas consultas médicas todavía se
> pagan en efectivo: la clínica no tiene datáfono, o quien paga es un familiar que está en otro
> país. Y al mismo tiempo, el médico que te atiende no puede ver tus alergias ni qué medicamentos
> tomas. MedPass junta esas dos cosas en un solo código QR. Aclaro desde ya: todos los datos
> médicos que van a ver son ficticios."

### 0:20–0:50 — The clinic creates a charge

**Screen:** `/charge` on the laptop. Type the amount, the reason, and tap only _Tipo de sangre_ and
_Alergias críticas_. Press **Crear cobro y mostrar QR**.

> "Esta es la vista del proveedor. La clínica pone el monto, el motivo, y elige exactamente qué
> datos necesita de este paciente. Fíjense que pide solo tipo de sangre y alergias — no el
> historial completo, solo lo que esta visita necesita. Y eso genera un único QR que lleva las dos
> cosas a la vez: lo que se pide y lo que se cobra."

### 0:50–1:30 — The patient decides

**Screen:** scan the QR with the phone. The request opens. **Uncheck one field on camera.** Press
approve, then pay.

> "El paciente escanea. Antes de compartir nada, ve quién le pregunta, cuánto le cobran, y qué le
> están pidiendo exactamente. Y acá está lo importante: puede aprobar menos de lo que le piden.
> Voy a desmarcar las alergias — comparto mi tipo de sangre pero eso me lo quedo. Esa decisión es
> del paciente, no de la clínica. Ahora apruebo y pago en USDC con la billetera que Pollar me creó
> cuando entré con Google."

### 1:30–1:55 — The provider sees exactly that, and the ledger proves it

**Screen:** back to the laptop; the authorized information appears on its own. Point at the expiry.
Then click **Ver la transacción** and let the explorer load.

> "Del lado de la clínica aparece solo lo aprobado. El campo que el paciente se guardó no está acá,
> y no hay forma de pedirlo desde esta pantalla. El acceso además expira solo, en treinta minutos.
> Y el pago tiene recibo verificable: este enlace abre el explorador público de Stellar. Esto no lo
> dice mi aplicación — lo dice el ledger."

### 1:55–2:20 — How Pollar is actually used

**Screen:** scroll to _Historial de cobros_ on `/charge`.

> "Pollar hace dos trabajos distintos acá. Mueve el dinero: liquida USDC en Stellar, y el emisor
> del USDC nunca está escrito a mano en el código, sale del catálogo de activos en tiempo de
> ejecución. Y además es la identidad: el SDK no expone verificación de tokens del lado del
> servidor, así que autenticamos haciendo que la billetera firme un desafío que emite nuestro
> servidor, con SEP-53, y verificamos esa firma contra la dirección Stellar. La billetera es quién
> eres, no solo cómo pagas. Y cada cobro queda en el historial con su enlace al pago on-chain:
> esto está pensado para usarse todos los días, no una sola vez para una demo."

### 2:20–2:45 — Mainnet, said plainly

**Screen:** the landing page again, or the repository.

> "Una última cosa y la digo con claridad. Pedimos el acceso a Mainnet el once de septiembre y nos
> lo aprobaron el trece, el mismo día del cierre. La implementación para Mainnet está lista y
> commiteada — es un cambio de red con sus tests y sus guardas, documentado paso a paso en el
> repositorio. Lo que no llegó a tiempo fue el XLM para fondear la wallet de la aplicación, que en
> Stellar es lo que paga la reserva de cada billetera de usuario. Lo pedimos por el grupo y no
> alcanzó. Así que todo lo que vieron corre sobre TestNet, con transacciones reales y verificables
> en el ledger, y el salto a Mainnet queda a un merge y un fondeo de distancia."

### 2:45–3:00 — Close

> "MedPass LATAM: pagar la consulta en segundos, compartiendo solo lo que el médico necesita. El
> código y las notas de ingeniería están en el repositorio. Gracias."

### Do not say

- Do not imply a Mainnet transaction happened. It did not.
- Do not call the medical records real, at any point, even loosely.
- Do not promise clinical use. This is a prototype and the interface says so on every screen.

## Backup evidence video — 2 minutes (supplementary, not the required demo)

Insurance against the Mainnet risk, and the strongest available answer to the _Pollar integration_
(25%) and _Real transactions_ (20%) criteria. The required 3-minute demo above stays
product-focused; this one is shorter, technical, and shows the integration from the inside.

Spoken lines are in Spanish here because the judges are local and the product ships in Spanish;
adjust if submitting in English.

**Before recording**

- `/spike/pollar` is **removed from production builds** (`notFound()` when `NODE_ENV=production`),
  so it 404s on the Vercel URL. Record it from `npm run dev` on `localhost:3000`.
- Use a clean browser window. Close personal tabs — mail, chat, anything with a name in it.
- Never on camera: the Pollar dashboard, API keys, `.env.local`, or a terminal that echoes them.
- Open the explorer link once before recording and confirm it loads.

**0:00–0:25 — The ledger, not our word for it.**
Open `https://stellar.expert/explorer/testnet/tx/5ce00279e8883b8e59a361e592a1c9c7de2dac717b7b14bf1212a60bf8e0f3f6`.
Point at the amount, the sender, the receiver, the ledger number. _"Esto no es nuestra aplicación
diciendo que funcionó. Es el ledger público de Stellar. Un USDC, de esta cuenta a esta otra,
ledger 4633398."_

**0:25–0:50 — The account itself, still on the explorer.**
Navigate to the payer account:
`https://horizon-testnet.stellar.org/accounts/GD2IOJAIUM6VBYHXXOXP3OMG7XPPH3MR2SQOAM6JKTTEHHDIEYEXG7P4`.
_"Esta es la billetera del paciente en el ledger: diecinueve USDC, la trustline patrocinada por la
aplicación, y el número de sponsor. Nada de esto lo dice mi aplicación — lo dice Stellar."_

**0:50–1:15 — The Pollar session is a server-verified identity.**
On `/spike/pollar`, walk down the session panel. _"`Authenticated` es la sesión del navegador.
`Server verified` es la que importa: nuestro servidor verificó la firma de la billetera con SEP-53,
no le cree al navegador. La red está fijada en código, no en una variable de entorno, para que
ningún despliegue la cambie por accidente. Y la custodia es `internal`: Pollar creó esta billetera,
el usuario entró con Google."_

**Do not point at `Exists on Stellar`.** It is a snapshot taken when the wallet object is issued,
not a live read, and it can sit at `false` for an account that demonstrably holds assets — see
`docs/POLLAR_INTEGRATION.md`. If it happens to read `false` on camera, that is the field being
stale, not the account being empty. If asked, the honest answer is the strong one: _"ese campo del
SDK es una foto del momento en que se emitió la billetera, no una lectura del ledger; por eso
verificamos contra Horizon y no contra nuestra propia aplicación."_

**1:15–1:35 — The asset catalog resolves at runtime.**
Show _Balance and assets_: the USDC issuer, the trustline, the balance. _"El emisor del USDC nunca
está escrito a mano en el código: sale del catálogo de activos de Pollar en tiempo de ejecución.
Por eso cambiar de red es configuración, no reescribir el producto. La trustline la patrocina la
aplicación — el usuario no paga esa reserva."_

**1:35–1:55 — A payment through the SDK, honestly reported.**
Send from the spike form. Use exactly these values — **do not improvise a destination on camera**:

| Field       | Value                                                      |
| ----------- | ---------------------------------------------------------- |
| Destination | `GBXRPE4IWADDFKWRHQWMGXK3H7OE5JFM5AKS5SB4IMV2DCM4ULOUWM73` |
| Amount      | `1`                                                        |

That is the provider wallet, confirmed against Horizon on 2026-09-13 as holding an established,
authorized USDC trustline. Stellar refuses a payment to any account without a trustline for that
asset (`op_no_trust`), so a made-up address fails on camera. The stale balance does not block the
send: the button is gated on `verified` and a resolved asset, not on the balance, and the
"spendable does not cover" warning is suppressed while the balance object is null.

Show `Status` and `Hash`. _"`sendPayment` responde `success`, `pending` o `error`. Tratamos
`pending` como pendiente: un recibo nunca afirma una liquidación que el ledger todavía no
confirmó."_ Worth adding, since the receiver holds zero XLM: _"el que recibe no tiene nada de XLM
y aun así puede recibir USDC, porque la aplicación patrocina su reserva — por eso alguien que nunca
tocó cripto puede cobrar."_

**1:55–2:10 — Identity, and why SEP-53.**
_"Pollar no expone verificación de tokens del lado del servidor, así que autenticamos haciendo que
la billetera firme un desafío emitido por nuestro servidor con SEP-53, y verificamos esa firma
ed25519 contra la dirección Stellar. La billetera es quién eres, no solo cómo pagas."_

**If Mainnet did not happen by the deadline**

Say it plainly, once, at the end: access was requested on 2026-09-11, granted on 2026-09-13, and
state exactly how far the Mainnet cutover got. Do not imply a Mainnet transaction occurred. The
procedure is a committed, reviewable diff in `docs/MAINNET_RUNBOOK.md`; an honest gap costs less
than a claim that fails a click on an explorer link.
