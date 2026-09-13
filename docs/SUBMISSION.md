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

## Demo script — 3 minutes

Record it rather than presenting live. A live demo depends on venue wifi and a settling
transaction; a recording controls both and the rules allow either. Have both browser windows signed
in and the passport already filled before recording.

**0:00–0:20 — The problem.** Landing page on screen. "In Bolivia, plenty of consultations are paid
in cash — the clinic has no card terminal, or the person paying is family abroad. And the doctor
treating you can't see your allergies. MedPass makes those the same moment." Say once, plainly,
that all records are fictitious.

**0:20–0:50 — The provider creates a charge.** On `/charge`: type the amount, the reason, and tap
only the fields this visit needs. "She asks for blood type and allergies. Not the whole history —
just this." Create the charge; the QR appears.

**0:50–1:30 — The patient decides.** Scan the QR with the phone. The request opens showing the
clinic, the reason, the amount, and what is being asked. Uncheck one item on camera. "He shares his
blood type but keeps his medications private. That's his call, not the clinic's." Approve.

**1:30–2:00 — The provider sees exactly that.** Cut back to `/charge`. The authorized information
appears — and only the approved items. Point at the expiry: "thirty minutes, then it closes on its
own."

**2:00–2:35 — Payment.** Back on the phone, pay. Show the receipt and open the explorer link. "One
USDC, settled on Stellar through Pollar, verifiable by anyone."

**2:35–3:00 — Why it can grow.** Scroll to the charge history on `/charge`. "Every charge she's
created is here, with its status and a link to verify the payment on-chain — this is a tool she
opens every shift, not a one-off demo. Pollar handles the wallet, so a patient who has never touched
crypto signs in with Google. We also use Pollar's SEP-53 signing as our server-side login — the
wallet is the identity. Any clinic in the region can start charging this way without integrating
anything."

### Recording notes

- Two devices reads better than two browser windows, and makes the QR real rather than decorative.
- Have a second account signed in and its USDC trustline established beforehand.
- Do not show the Pollar dashboard, any key, or any `.env` file.
- If the payment returns `pending`, say so — the receipt distinguishes it from `success` on purpose.


## Backup evidence video — 2 minutes (supplementary, not the required demo)

Insurance against the Mainnet risk, and the strongest available answer to the *Pollar integration*
(25%) and *Real transactions* (20%) criteria. The required 3-minute demo above stays
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
Show *Balance and assets*: the USDC issuer, the trustline, the balance. _"El emisor del USDC nunca
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
